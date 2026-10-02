import type { RigBatchCharacter } from './batch';
import { assembleEquipment, equipmentEquals, type EquipmentAssembly } from './equipment';
import { createGaitPose, gaitPeriod, motionModeForSpeed, quantizePoseTime, resolveDirection, sampleGaitInto, sampleIdleInto, stableIdlePhase, weightTuning, type GaitPose } from './gait';
import type { RigInstanceBuffer } from './instance-buffer';
import { RIG_PARTS, type AtlasCell, type Dir8, type EquipmentVisuals, type MotionMode, type RigManifestPart, type RigPart, type RigSet, type RigView, type WeightClass } from './types';

const DEG = Math.PI / 180;
const PART_INDEX = Object.fromEntries(RIG_PARTS.map((part, index) => [part, index])) as Record<RigPart, number>;
const BASE_TINT = 0xffff;
const PLACEHOLDER_KEYS = { weapon_R: 'placeholder/weapon_R', weapon_L: 'placeholder/weapon_L', pauldron_R: 'placeholder/pauldron_R', pauldron_L: 'placeholder/pauldron_L', cape: 'placeholder/cape' } as const;
const VIEW_ORDER: Readonly<Record<RigView, readonly number[]>> = {
  front34: [8, 9, 6, 7, 13, 0, 14, 1, 15, 2, 10, 3, 11, 4, 12, 5],
  back34: [8, 12, 7, 6, 13, 1, 14, 0, 15, 2, 9, 3, 10, 4, 11, 5],
  side: [8, 9, 7, 6, 13, 0, 14, 1, 15, 2, 10, 3, 11, 4, 12, 5],
};

export function zOrderForPart(view: RigView, part: RigPart, mirrored = false): number {
  let index = PART_INDEX[part];
  if (mirrored && part.endsWith('_L')) index = PART_INDEX[`${part.slice(0, -2)}_R` as RigPart];
  else if (mirrored && part.endsWith('_R')) index = PART_INDEX[`${part.slice(0, -2)}_L` as RigPart];
  return VIEW_ORDER[view][index] ?? 0;
}
const HIDDEN = { uvRect: [0, 0, 0, 0], affine2d: [0, 0, 0, 0, 0, 0], anchorDepth: [0, 0, 0, 0], sortTint: [0, 0, 0, 0] } as const;

interface ResolvedPart { readonly manifest: RigManifestPart; readonly cell: AtlasCell }
type ResolvedView = readonly ResolvedPart[];

export interface RigInstance extends RigBatchCharacter {
  setMotion(dir8: Dir8, speedMps: number, weightClass: WeightClass): void;
  setEquipment(equipment: EquipmentVisuals): Promise<void>;
  setPosition(x: number, y: number, z: number): void;
  setStepFps(stepFps: number): void;
  update(dtSeconds: number): void;
  readonly motionMode: MotionMode; readonly direction: Dir8; readonly equipment: EquipmentVisuals;
  readonly capeAngle: number; snapshot(): RigSnapshot | undefined; dispose(): void;
}
export interface RigSnapshot {
  readonly image: HTMLCanvasElement;
  /** Local min-x, min-y, max-x and max-y bounds in battle-world metres. */
  readonly localBounds: readonly [number, number, number, number];
}

function sourceForPart(part: RigPart, mirrored: boolean): string {
  if (part.startsWith('thigh_')) return 'thigh_shared';
  if (part.startsWith('shin_')) return 'shin_shared';
  if (part.startsWith('foot_')) return 'foot_shared';
  if (!mirrored) return part;
  if (part.endsWith('_L')) return `${part.slice(0, -2)}_R`;
  if (part.endsWith('_R')) return `${part.slice(0, -2)}_L`;
  return part;
}

function resolveView(rigSet: RigSet, view: RigView, mirrored: boolean): ResolvedView {
  return RIG_PARTS.map((part) => {
    const source = sourceForPart(part, mirrored);
    const manifest = rigSet.manifest.parts.find((entry) => entry.view === view && entry.id === source);
    const cell = rigSet.cells.get(`${view}/${source}`);
    if (!manifest || !cell) throw new Error(`RIG_PART_UNAVAILABLE:${view}/${source}`);
    return { manifest, cell };
  });
}

function blendPose(out: GaitPose, from: GaitPose, to: GaitPose, alpha: number): void {
  out.hipL = from.hipL + (to.hipL - from.hipL) * alpha; out.hipR = from.hipR + (to.hipR - from.hipR) * alpha;
  out.kneeL = from.kneeL + (to.kneeL - from.kneeL) * alpha; out.kneeR = from.kneeR + (to.kneeR - from.kneeR) * alpha;
  out.ankleL = from.ankleL + (to.ankleL - from.ankleL) * alpha; out.ankleR = from.ankleR + (to.ankleR - from.ankleR) * alpha;
  out.shoulderL = from.shoulderL + (to.shoulderL - from.shoulderL) * alpha; out.shoulderR = from.shoulderR + (to.shoulderR - from.shoulderR) * alpha;
  out.elbowL = from.elbowL + (to.elbowL - from.elbowL) * alpha; out.elbowR = from.elbowR + (to.elbowR - from.elbowR) * alpha;
  out.bodyY = from.bodyY + (to.bodyY - from.bodyY) * alpha; out.torsoRoll = from.torsoRoll + (to.torsoRoll - from.torsoRoll) * alpha;
  out.torsoLean = from.torsoLean + (to.torsoLean - from.torsoLean) * alpha;
}

function easeInOutCubic(value: number): number {
  return value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2;
}

export function createRigCharacter(rigSet: RigSet, equipment: EquipmentVisuals = {}, stableId = 1): RigInstance {
  return new RigCharacter(rigSet, equipment, stableId);
}

class RigCharacter implements RigInstance {
  readonly views: readonly ResolvedView[]; readonly uv = new Float32Array(20 * 4);
  readonly affine = new Float32Array(20 * 6); readonly anchor = new Float32Array(20 * 4);
  readonly sort = new Uint16Array(20 * 4); readonly data: Array<{ uvRect: Float32Array; affine2d: Float32Array; anchorDepth: Float32Array; sortTint: Uint16Array }>;
  readonly pose = createGaitPose(); readonly fromPose = createGaitPose(); readonly targetPose = createGaitPose();
  readonly jointX = new Float32Array(16); readonly jointY = new Float32Array(16); readonly globalAngle = new Float32Array(16);
  readonly jointScratch = new Float32Array(4);
  private equipmentState: EquipmentVisuals; private assemblies: readonly EquipmentAssembly[];
  private dir: Dir8 = 0; private speed = 0; private weight: WeightClass = 'medium';
  private mode: MotionMode = 'idle'; private fromMode: MotionMode = 'idle'; private targetMode: MotionMode = 'idle';
  private transition = 1; private elapsed = 0; private stepFps = 12; private mirrored = false; private viewIndex = 0;
  private targetMirrored = false; private targetViewIndex = 0; private turnProgress = 1;
  private worldX = 0; private worldY = 0; private worldZ = 0; private disposed = false;
  private capePhi = 0; private capeOmega = 0; private attachmentCount = 0;
  private snapshotCanvas: HTMLCanvasElement | undefined;

  constructor(readonly rigSet: RigSet, equipment: EquipmentVisuals, readonly stableId: number) {
    this.views = [resolveView(rigSet, 'front34', false), resolveView(rigSet, 'front34', true), resolveView(rigSet, 'back34', false), resolveView(rigSet, 'back34', true), resolveView(rigSet, 'side', false), resolveView(rigSet, 'side', true)];
    this.data = Array.from({ length: 20 }, (_, index) => ({ uvRect: this.uv.subarray(index * 4, index * 4 + 4), affine2d: this.affine.subarray(index * 6, index * 6 + 6), anchorDepth: this.anchor.subarray(index * 4, index * 4 + 4), sortTint: this.sort.subarray(index * 4, index * 4 + 4) }));
    this.equipmentState = equipment; this.assemblies = this.makeAssemblies(equipment);
    this.evaluatePose(); this.writePose();
  }

  get activeInstanceCount(): number { return 16 + this.attachmentCount; }
  get motionMode(): MotionMode { return this.mode; }
  get direction(): Dir8 { return this.dir; }
  get equipment(): EquipmentVisuals { return this.equipmentState; }
  get capeAngle(): number { return this.capePhi; }

  setMotion(dir8: Dir8, speedMps: number, weightClass: WeightClass): void {
    if (!Number.isInteger(dir8) || dir8 < 0 || dir8 > 7) throw new RangeError('RIG_DIR8');
    if (!Number.isFinite(speedMps) || speedMps < 0) throw new RangeError('RIG_SPEED');
    const nextMode = motionModeForSpeed(speedMps, this.targetMode);
    if (nextMode !== this.targetMode) {
      Object.assign(this.fromPose, this.pose); this.fromMode = this.mode; this.targetMode = nextMode; this.transition = 0;
    }
    const direction = resolveDirection(dir8, this.mirrored);
    const nextView = direction.view === 'front34' ? (direction.mirrored ? 1 : 0) : direction.view === 'back34' ? (direction.mirrored ? 3 : 2) : (direction.mirrored ? 5 : 4);
    if (dir8 !== this.dir) { this.targetMirrored = direction.mirrored; this.targetViewIndex = nextView; this.turnProgress = 0; }
    this.dir = dir8;
    this.speed = speedMps; this.weight = weightClass;
  }

  async setEquipment(equipment: EquipmentVisuals): Promise<void> {
    if (equipmentEquals(this.equipmentState, equipment)) return;
    const assemblies = this.makeAssemblies(equipment);
    await Promise.resolve();
    if (this.disposed) return;
    this.equipmentState = equipment; this.assemblies = assemblies; this.writePose();
  }

  setPosition(x: number, y: number, z: number): void {
    if (![x, y, z].every(Number.isFinite)) throw new RangeError('RIG_POSITION');
    this.worldX = x; this.worldY = y; this.worldZ = z; this.writePose();
  }

  setStepFps(stepFps: number): void {
    if (!Number.isFinite(stepFps) || stepFps < 0) throw new RangeError('RIG_STEP_FPS');
    this.stepFps = stepFps;
  }

  update(dtSeconds: number): void {
    if (this.disposed) return;
    const dt = Number.isFinite(dtSeconds) ? Math.max(0, dtSeconds) : 0;
    this.elapsed += dt;
    if (this.transition < 1) this.transition = Math.min(1, this.transition + dt / 0.16);
    if (this.turnProgress < 1) {
      const before = this.turnProgress; this.turnProgress = Math.min(1, this.turnProgress + dt / 0.16);
      if (before < .5 && this.turnProgress >= .5) { this.mirrored = this.targetMirrored; this.viewIndex = this.targetViewIndex; }
    }
    this.evaluatePose(); this.updateCape(dt); this.writePose();
  }

  writeInstances(buffer: RigInstanceBuffer, baseIndex: number): void {
    for (let index = 0; index < 20; index += 1) buffer.write(baseIndex + index, index < 16 + this.attachmentCount ? this.data[index]! : HIDDEN);
  }

  snapshot(): RigSnapshot | undefined {
    if (typeof document === 'undefined') return undefined;
    this.snapshotCanvas ??= document.createElement('canvas');
    const canvas = this.snapshotCanvas; const context = canvas.getContext('2d');
    if (!context) return undefined;
    const bounds = this.snapshotBounds(); const ppm = this.rigSet.runtimePpm;
    const nextWidth = Math.max(1, Math.ceil((bounds[2] - bounds[0]) * ppm));
    const nextHeight = Math.max(1, Math.ceil((bounds[3] - bounds[1]) * ppm));
    if (canvas.width !== nextWidth) canvas.width = nextWidth;
    if (canvas.height !== nextHeight) canvas.height = nextHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const active = Array.from({ length: 16 + this.attachmentCount }, (_, index) => index)
      .sort((left, right) => this.data[left]!.sortTint[1]! - this.data[right]!.sortTint[1]! || left - right);
    for (const index of active)
      this.drawSnapshotPart(context, this.data[index]!, bounds, ppm);
    return { image: canvas, localBounds: bounds };
  }

  dispose(): void { this.disposed = true; }

  private snapshotBounds(): [number, number, number, number] {
    let right = -Infinity; let bottom = -Infinity; let left = Infinity; let top = Infinity;
    for (let index = 0; index < 16 + this.attachmentCount; index += 1) {
      const affine = this.data[index]!.affine2d;
      for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) {
        const px = affine[0]! * x + affine[1]! * y + affine[2]!;
        const py = affine[3]! * x + affine[4]! * y + affine[5]!;
        right = Math.max(right, px); bottom = Math.max(bottom, py);
        left = Math.min(left, px); top = Math.min(top, py);
      }
    }
    return [left, top, right, bottom];
  }

  private drawSnapshotPart(context: CanvasRenderingContext2D, part: RigCharacter['data'][number],
    bounds: readonly [number, number, number, number], ppm: number): void {
    const uv = part.uvRect; const affine = part.affine2d; const texture = this.rigSet.texture;
    const source = texture.image as CanvasImageSource | undefined; if (!source) return;
    const sw = uv[2]! * this.rigSet.atlasWidth; const sh = uv[3]! * this.rigSet.atlasHeight;
    context.save(); context.setTransform(affine[0]! * ppm, -affine[3]! * ppm,
      affine[1]! * ppm, -affine[4]! * ppm, (affine[2]! - bounds[0]) * ppm,
      (bounds[3] - affine[5]!) * ppm);
    context.scale((part.sortTint[3]! & 2) === 0 ? 1 : -1, -1);
    context.drawImage(source, uv[0]! * this.rigSet.atlasWidth, uv[1]! * this.rigSet.atlasHeight,
      sw, sh, -0.5, -0.5, 1, 1); context.restore();
  }

  private makeAssemblies(equipment: EquipmentVisuals): readonly EquipmentAssembly[] {
    return [assembleEquipment(equipment, 'front34', false), assembleEquipment(equipment, 'front34', true), assembleEquipment(equipment, 'back34', false), assembleEquipment(equipment, 'back34', true), assembleEquipment(equipment, 'side', false), assembleEquipment(equipment, 'side', true)];
  }

  private evaluatePose(): void {
    const poseTime = quantizePoseTime(this.elapsed, this.stepFps);
    if (this.targetMode === 'idle') sampleIdleInto(this.targetPose, poseTime, stableIdlePhase(this.stableId));
    else sampleGaitInto(this.targetPose, this.targetMode, this.weight, poseTime / gaitPeriod(this.targetMode, Math.max(this.speed, 0.05), this.weight));
    if (this.transition < 1) blendPose(this.pose, this.fromPose, this.targetPose, easeInOutCubic(this.transition));
    else Object.assign(this.pose, this.targetPose);
    this.mode = this.transition >= 1 ? this.targetMode : this.fromMode;
  }

  private updateCape(dtSeconds: number): void {
    const inertia = weightTuning(this.weight).inertia;
    const target = Math.min(28, Math.max(-28, -0.45 * this.pose.torsoRoll)) * inertia;
    if (dtSeconds > 0.5) { this.capePhi = target; this.capeOmega = 0; return; }
    const integrated = Math.min(dtSeconds, 8 / 120);
    const steps = Math.min(8, Math.max(1, Math.ceil(integrated * 120)));
    const h = steps > 0 ? integrated / steps : 0;
    const damping = 10.8 * (this.weight === 'heavy' ? 1.15 : 1);
    for (let index = 0; index < steps; index += 1) {
      this.capeOmega += (36 * (target - this.capePhi) - damping * this.capeOmega) * h;
      this.capePhi += this.capeOmega * h;
    }
    const remainder = dtSeconds - integrated;
    if (remainder > 0) { const decay = Math.exp(-remainder * 12); this.capePhi = target + (this.capePhi - target) * decay; this.capeOmega *= decay; }
  }

  private writePose(): void {
    const view = this.views[this.viewIndex]!;
    const assembly = this.assemblies[this.viewIndex]!;
    this.solveSkeleton(view);
    this.attachmentCount = assembly.attachments.length;
    for (let index = 0; index < 16; index += 1) {
      const partName = RIG_PARTS[index]!; const resolved = view[index]!;
      const angle = this.globalAngle[index]! * DEG * (this.mirrored ? -1 : 1);
      this.writePart(index, resolved.cell, resolved.manifest, angle, this.jointX[index]!, this.jointY[index]!, this.runtimeZ(partName), this.tintForPart(partName, assembly), this.mirrored);
    }
    for (let index = 0; index < assembly.attachments.length; index += 1) {
      const attachment = assembly.attachments[index]!; const parentIndex = PART_INDEX[attachment.parent];
      const dataIndex = 16 + index; const parent = this.data[parentIndex]!; const target = this.data[dataIndex]!;
      const placeholder = this.rigSet.cells.get(PLACEHOLDER_KEYS[attachment.kind]);
      if (placeholder) { target.uvRect[0] = placeholder.u0; target.uvRect[1] = placeholder.v0; target.uvRect[2] = placeholder.du; target.uvRect[3] = placeholder.dv; }
      else target.uvRect.set(parent.uvRect);
      target.affine2d.set(parent.affine2d); target.anchorDepth.set(parent.anchorDepth);
      if (attachment.kind === 'cape') {
        const angle = this.capePhi * DEG; const cos = Math.cos(angle); const sin = Math.sin(angle);
        target.affine2d[0] = cos * 0.55; target.affine2d[1] = -sin * 0.55; target.affine2d[3] = sin * 0.52; target.affine2d[4] = cos * 0.52;
      } else if (attachment.kind.startsWith('weapon')) {
        const right = attachment.kind === 'weapon_R';
        const shoulder = right === this.mirrored ? this.pose.shoulderL : this.pose.shoulderR;
        const angle = (-18 + shoulder * .35) * DEG * (this.mirrored ? -1 : 1);
        target.affine2d[0] = Math.cos(angle) * .14; target.affine2d[1] = Math.sin(angle);
        target.affine2d[3] = -Math.sin(angle) * .14; target.affine2d[4] = Math.cos(angle);
      } else {
        target.affine2d[0] = target.affine2d[0]! * .45; target.affine2d[1] = target.affine2d[1]! * .45;
        target.affine2d[3] = target.affine2d[3]! * .45; target.affine2d[4] = target.affine2d[4]! * .45;
      }
      target.sortTint[0] = 32_768 + this.stableId % 32_768; target.sortTint[1] = Math.round((attachment.zOrder + 2) * 20);
      target.sortTint[2] = attachment.tint; target.sortTint[3] = 1 | (this.mirrored ? 2 : 0);
    }
  }

  private writePart(index: number, cell: AtlasCell, part: RigManifestPart, angle: number, jointX: number, jointY: number, zOrder: number, tint: number, mirrored: boolean): void {
    const data = this.data[index]!; const scale = 1 / this.rigSet.manifest.ppm;
    data.uvRect[0] = cell.u0; data.uvRect[1] = cell.v0; data.uvRect[2] = cell.du; data.uvRect[3] = cell.dv;
    const width = part.size[0] * scale; const height = part.size[1] * scale;
    const cos = Math.cos(angle); const sin = Math.sin(angle);
    const pivotX = (mirrored ? part.size[0] - part.pivot[0] : part.pivot[0]) * scale;
    const offsetX = width * .5 - pivotX; const offsetY = part.pivot[1] * scale - height * .5;
    data.affine2d[0] = cos * width; data.affine2d[1] = sin * height; data.affine2d[2] = jointX + cos * offsetX + sin * offsetY;
    data.affine2d[3] = -sin * width; data.affine2d[4] = cos * height; data.affine2d[5] = jointY - sin * offsetX + cos * offsetY;
    data.anchorDepth[0] = this.worldX; data.anchorDepth[1] = this.worldY; data.anchorDepth[2] = this.worldZ; data.anchorDepth[3] = 0.35;
    data.sortTint[0] = 32_768 + this.stableId % 32_768; data.sortTint[1] = Math.round((zOrder + 2) * 20);
    data.sortTint[2] = tint; data.sortTint[3] = 1 | (mirrored ? 2 : 0);
  }

  private tintForPart(part: RigPart, assembly: EquipmentAssembly): number {
    for (let index = 0; index < assembly.composites.length; index += 1) {
      const layer = assembly.composites[index]; if (layer?.part === part) return layer.tint;
    }
    for (let index = 0; index < assembly.replacements.length; index += 1) {
      const layer = assembly.replacements[index]; if (layer?.part === part) return layer.tint;
    }
    return BASE_TINT;
  }

  private runtimeZ(part: RigPart): number {
    const view: RigView = this.viewIndex < 2 ? 'front34' : this.viewIndex < 4 ? 'back34' : 'side';
    return zOrderForPart(view, part, this.mirrored);
  }

  private solveSkeleton(view: ResolvedView): void {
    const bodyScale = this.rigSet.manifest.heightM / 1.7;
    const rootY = .94 * bodyScale + this.pose.bodyY;
    const shoulderL = this.mirrored ? this.pose.shoulderR : this.pose.shoulderL;
    const shoulderR = this.mirrored ? this.pose.shoulderL : this.pose.shoulderR;
    const elbowL = this.mirrored ? this.pose.elbowR : this.pose.elbowL;
    const elbowR = this.mirrored ? this.pose.elbowL : this.pose.elbowR;
    const hipL = this.mirrored ? this.pose.hipR : this.pose.hipL;
    const hipR = this.mirrored ? this.pose.hipL : this.pose.hipR;
    const kneeL = this.mirrored ? this.pose.kneeR : this.pose.kneeL;
    const kneeR = this.mirrored ? this.pose.kneeL : this.pose.kneeR;
    const ankleL = this.mirrored ? this.pose.ankleR : this.pose.ankleL;
    const ankleR = this.mirrored ? this.pose.ankleL : this.pose.ankleR;
    this.setJoint(3, 0, rootY, 0);
    this.setJoint(2, 0, rootY, this.pose.torsoRoll + this.pose.torsoLean);
    this.childOffsetInto(view[2]!.manifest, 'neck', this.globalAngle[2]!, bodyScale, 0);
    this.setJoint(0, this.jointScratch[0]!, rootY + this.jointScratch[1]!, -this.pose.torsoRoll * .55);
    this.setJoint(1, this.jointX[0]!, this.jointY[0]!, this.globalAngle[0]!);

    const torso = view[2]!.manifest;
    this.childOffsetInto(torso, 'shoulder_L', this.globalAngle[2]!, bodyScale, 0);
    this.childOffsetInto(torso, 'shoulder_R', this.globalAngle[2]!, bodyScale, 2);
    this.setJoint(4, this.jointScratch[0]!, rootY + this.jointScratch[1]!, this.globalAngle[2]! + shoulderL);
    this.setJoint(5, this.jointScratch[2]!, rootY + this.jointScratch[3]!, this.globalAngle[2]! + shoulderR);
    this.chain(view, 4, 6, 'elbow_L', elbowL); this.chain(view, 5, 7, 'elbow_R', elbowR);
    this.chain(view, 6, 8, 'wrist_L', 0); this.chain(view, 7, 9, 'wrist_R', 0);

    const pelvis = view[3]!.manifest;
    this.childOffsetInto(pelvis, 'hip_L', this.globalAngle[3]!, bodyScale, 0);
    this.childOffsetInto(pelvis, 'hip_R', this.globalAngle[3]!, bodyScale, 2);
    this.setJoint(10, this.jointScratch[0]!, rootY + this.jointScratch[1]!, hipL);
    this.setJoint(11, this.jointScratch[2]!, rootY + this.jointScratch[3]!, hipR);
    this.chain(view, 10, 12, 'knee', kneeL); this.chain(view, 11, 13, 'knee', kneeR);
    this.chain(view, 12, 14, 'ankle', ankleL); this.chain(view, 13, 15, 'ankle', ankleR);
  }

  private setJoint(index: number, x: number, y: number, angle: number): void {
    this.jointX[index] = x; this.jointY[index] = y; this.globalAngle[index] = angle;
  }

  private chain(view: ResolvedView, parent: number, child: number, joint: string, localAngle: number): void {
    this.childOffsetInto(view[parent]!.manifest, joint, this.globalAngle[parent]!, this.rigSet.manifest.heightM / 1.7, 0);
    this.setJoint(child, this.jointX[parent]! + this.jointScratch[0]!, this.jointY[parent]! + this.jointScratch[1]!, this.globalAngle[parent]! + localAngle + (view[child]!.manifest.restAngle ?? 0));
  }

  private childOffsetInto(part: RigManifestPart, joint: string, angleDegrees: number, scaleMultiplier: number, offset: number): void {
    const swapped = joint.endsWith('_L') ? `${joint.slice(0, -2)}_R` : joint.endsWith('_R') ? `${joint.slice(0, -2)}_L` : joint;
    const primary = this.mirrored ? swapped : joint; const fallback = this.mirrored ? joint : swapped;
    const point = part.childJoint[primary] ?? part.childJoint[fallback] ?? part.pivot; const unit = scaleMultiplier / this.rigSet.manifest.ppm;
    let dx = (point[0] - part.pivot[0]) * unit; const dy = -(point[1] - part.pivot[1]) * unit;
    if (this.mirrored) dx = -dx;
    const angle = angleDegrees * DEG * (this.mirrored ? -1 : 1); const cos = Math.cos(angle); const sin = Math.sin(angle);
    this.jointScratch[offset] = cos * dx + sin * dy; this.jointScratch[offset + 1] = -sin * dx + cos * dy;
  }

}
