import {
  AmbientLight, AnimationMixer, Color, DirectionalLight, GridHelper, Group, Mesh,
  OrthographicCamera, Scene, SkinnedMesh, WebGLRenderer, type AnimationAction, type Object3D,
} from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RigBatch } from '../rig/batch';
import { loadRigClipMap, resolveRigClipKey, type RigClipMap } from '../rig/clip-map';
import { createRigCharacter, type RigInstance } from '../rig/character';
import { loadRigClip, type RigClip } from '../rig/clip';
import { loadRigSet, type RigManifestInput } from '../rig/manifest';
import { createPlaceholderRigManifest } from '../rig/placeholder';
import type {
  Dir8, EquipmentVisuals, MotionMode, RigClipEventType, RigSet, WeightClass,
} from '../rig/types';
import { loadPilotModel, type PilotModel, type PilotModelStats } from './load';
import { createPilotRetargeter, type PilotRetargeter } from './retarget';

export type PilotEquipmentSlot = 'weapon' | 'armor' | 'cape' | 'feet' | 'head' | 'waist' | 'shoulder';
export interface PilotBenchmark { readonly instances: 1 | 20; readonly triangles: number; readonly drawCalls: number; readonly cpuMs: number }
export interface PilotDemoStats {
  frameTimeMs: number; rigCpuMs: number; drawCalls: number; rigDrawCalls: number; characters: number; instances: number;
  uploadedRanges: number; placeholders: number; readonly model: PilotModelStats; readonly benchmark: PilotBenchmark;
  readonly rendererDrawCalls: number; readonly rendererTriangles: number; readonly directionErrorDeg: number;
  readonly skeleton?: string; readonly mappedBones: number;
}
export interface PilotDemoController {
  readonly stats: PilotDemoStats; readonly clips: readonly string[];
  render(timeMs: number): void; resize(width: number, height: number, pixelRatio?: number): void;
  setMotion(mode: MotionMode): void; setDirection(direction: Dir8): void; setWeight(weight: WeightClass): void;
  setSpeed(speedMps: number): void; setStepFps(stepFps: number): void; setEquipment(slot: PilotEquipmentSlot, enabled: boolean): Promise<void>;
  setClipMap(value: unknown): void; setClipMode(enabled: boolean): void; playClipKey(key: string): void; setDirectionCycle(enabled: boolean): void;
  setStress(enabled: boolean): void; setYaw(degrees: number): void; setAutoRotate(enabled: boolean): void;
  setToon(enabled: boolean): void; setOutline(enabled: boolean): void; setInstances(count: 1 | 20): void;
  playGltfClip(name: string): void; playTianshuClip(value: unknown, options?: { rate?: number; speedMps?: number }): void;
  stopAnimation(): void; dispose(): void;
}
export interface PilotDemoOptions {
  readonly modelUrl: string; readonly rigManifest?: RigManifestInput;
  readonly onClipEvent?: (event: RigClipEventType, clipKey: string) => void;
}

const EQUIPMENT: Record<PilotEquipmentSlot, keyof EquipmentVisuals> = {
  weapon: 'mainHand', armor: 'body', cape: 'cape', feet: 'feet', head: 'head', waist: 'waist', shoulder: 'shoulder',
};
const EQUIPMENT_IDS: Record<PilotEquipmentSlot, string> = {
  weapon: 'eq_demo_sword', armor: 'eq_demo_armor', cape: 'eq_demo_cape', feet: 'eq_demo_boots',
  head: 'eq_demo_headgear', waist: 'eq_demo_belt', shoulder: 'eq_demo_pauldron',
};

function applyPilotMaterials(root: Object3D, model: PilotModel, toon: boolean, outline: boolean): void {
  const originals = [...model.materials.original.values()]; const toons = [...model.materials.toon.values()]; let index = 0;
  root.traverse(node => {
    if (!(node instanceof Mesh) || node.userData['pilotOutline']) return;
    const source = toon ? toons[index] : originals[index]; if (source) node.material = source;
    for (const child of node.children) if (child.userData['pilotOutline']) child.visible = outline; index += 1;
  });
}
function resetSkeletons(root: Object3D): void {
  root.traverse(node => { if (node instanceof SkinnedMesh) node.skeleton.pose(); }); root.updateMatrixWorld(true);
}
function disposeRig(rigSet: RigSet, batch: RigBatch, characters: readonly RigInstance[]): void {
  for (const character of characters) character.dispose(); batch.dispose(); rigSet.dispose();
}

export async function createPilotDemoScene(canvas: HTMLCanvasElement, options: PilotDemoOptions): Promise<PilotDemoController> {
  const [model, rigSet] = await Promise.all([
    loadPilotModel(options.modelUrl), loadRigSet(options.rigManifest ?? createPlaceholderRigManifest()),
  ]);
  const renderer = new WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(new Color(0xe6dcc2), 1); renderer.info.autoReset = false;
  const scene = new Scene(); const camera = new OrthographicCamera(-5, 5, 3, -3, .1, 100);
  camera.position.set(0, 2.5, 7); camera.lookAt(0, .85, 0);
  scene.add(new AmbientLight(0xffffff, 1.8), new GridHelper(12, 12, 0x796a58, 0xb8aa90));
  const key = new DirectionalLight(0xfff2d2, 3); key.position.set(3, 6, 4); scene.add(key);

  const rigBatch = new RigBatch(rigSet, 20); rigBatch.addTo(scene); const rigCharacters: RigInstance[] = [];
  for (let index = 0; index < 20; index += 1) {
    const character = createRigCharacter(rigSet, {}, index + 1); const column = index % 5; const row = Math.floor(index / 5);
    character.setPosition(index === 0 ? -1.15 : (column - 2) * 1.45, 0, index === 0 ? 0 : (row - 1.5) * 1.15);
    rigCharacters.push(character);
  }
  rigBatch.add(rigCharacters[0]!);
  const pilotAnchor = new Group(); pilotAnchor.position.x = 1.15; pilotAnchor.add(model.scene); scene.add(pilotAnchor);
  const cloneTemplate = cloneSkeleton(model.scene);
  const mixer = model.clips.length ? new AnimationMixer(model.scene) : undefined; let action: AnimationAction | undefined;
  let retargeter: PilotRetargeter | undefined; const clones: Object3D[] = []; const cloneMixers: AnimationMixer[] = [];
  const cloneActions: AnimationAction[] = []; const cloneRetargeters: PilotRetargeter[] = [];
  let gltfClip: (typeof model.clips)[number] | undefined; let tianshuClip: RigClip | undefined;
  let tianshuOptions: { rate?: number; speedMps?: number } = {};

  let direction: Dir8 = 1; let weight: WeightClass = 'medium'; let mode: MotionMode = 'walk'; let speed = 1; let stepFps = 12;
  let stress = false; let clipMode = false; let clipMap: RigClipMap | undefined; let cycle = false; let nextDirectionMs = 0;
  let toon = true; let outline = false; let autoRotate = false; let yaw = direction * 45; let instanceCount: 1 | 20 = 1;
  let previousTime = 0; let disposed = false; const enabled: Record<PilotEquipmentSlot, boolean> = {
    weapon: false, armor: false, cape: false, feet: false, head: false, waist: false, shoulder: false,
  };
  const cpuSamples = new Float32Array(120); let cpuCursor = 0; let cpuCount = 0;
  const stats: PilotDemoStats = {
    frameTimeMs: 0, rigCpuMs: 0, drawCalls: 0, rigDrawCalls: 2, characters: 1, instances: 16,
    uploadedRanges: 0, placeholders: rigSet.placeholderCount, model: model.stats,
    benchmark: { instances: 1, triangles: model.stats.triangles, drawCalls: model.stats.drawCalls, cpuMs: 0 },
    rendererDrawCalls: 0, rendererTriangles: 0, directionErrorDeg: 0, mappedBones: 0,
  };
  pilotAnchor.rotation.y = yaw * Math.PI / 180;

  function applyMotion(): void {
    const resolvedSpeed = mode === 'idle' ? 0 : mode === 'run' ? Math.max(2, speed) : Math.min(1.99, Math.max(.06, speed));
    const count = stress ? rigCharacters.length : 1;
    for (let index = 0; index < count; index += 1) {
      const character = rigCharacters[index]!; const facing = ((direction + index) % 8) as Dir8;
      character.setMotion(facing, resolvedSpeed, weight); character.setStepFps(stepFps);
      if (clipMode && clipMap && mode === 'walk') {
        const entry = resolveRigClipKey(clipMap, 'walk'); character.playClip(entry.clipId, { facingYawDeg: facing * 45,
          movement: entry.movement, nearHandWeapon: entry.nearHandWeapon, yawAssistMaxDeg: entry.yawAssistMaxDeg });
      } else character.stopClip();
    }
  }
  async function applyEquipment(): Promise<void> {
    const next: Record<string, string> = {};
    for (const slot of Object.keys(enabled) as PilotEquipmentSlot[]) if (enabled[slot]) next[EQUIPMENT[slot]] = EQUIPMENT_IDS[slot];
    await rigCharacters[0]!.setEquipment(next);
  }
  applyMotion();

  const clearCloneAnimations = (): void => {
    while (cloneActions.length) cloneActions.pop()!.stop();
    while (cloneRetargeters.length) cloneRetargeters.pop()!.dispose();
  };
  const clearClones = (): void => {
    clearCloneAnimations(); for (const item of cloneMixers) item.stopAllAction();
    while (clones.length) clones.pop()!.removeFromParent(); cloneMixers.length = 0;
  };
  const rebuildClones = (): void => {
    clearClones(); if (instanceCount === 1) return;
    for (let index = 1; index < 20; index += 1) {
      const clone = cloneSkeleton(cloneTemplate); const column = index % 5; const row = Math.floor(index / 5);
      clone.position.x += (column - 2) * 1.2 - pilotAnchor.position.x; clone.position.z += (row - 1.5) * .75; clone.scale.multiplyScalar(.7);
      applyPilotMaterials(clone, model, toon, outline); pilotAnchor.add(clone); clones.push(clone);
      if (model.clips.length) {
        const cloneMixer = new AnimationMixer(clone); cloneMixers.push(cloneMixer);
        if (gltfClip) cloneActions.push(cloneMixer.clipAction(gltfClip).reset().play());
      }
      if (tianshuClip) {
        const cloneRetargeter = createPilotRetargeter(clone, tianshuClip, tianshuOptions); cloneRetargeter.setFacingYawDeg(yaw);
        cloneRetargeters.push(cloneRetargeter);
      }
    }
  };
  const benchmark = (cpuMs: number): void => {
    cpuSamples[cpuCursor] = cpuMs; cpuCursor = (cpuCursor + 1) % cpuSamples.length; cpuCount = Math.min(cpuCount + 1, cpuSamples.length);
    let sum = 0; for (let index = 0; index < cpuCount; index += 1) sum += cpuSamples[index]!;
    const multiplier = outline ? 2 : 1; const modelDraws = model.stats.drawCalls * instanceCount * multiplier;
    (stats as { benchmark: PilotBenchmark }).benchmark = {
      instances: instanceCount, triangles: model.stats.triangles * instanceCount * multiplier,
      drawCalls: Math.max(modelDraws, renderer.info.render.calls - rigBatch.stats.drawCalls - 1), cpuMs: sum / Math.max(1, cpuCount),
    };
  };
  const setYaw = (degrees: number): void => {
    yaw = ((degrees % 360) + 360) % 360; pilotAnchor.rotation.y = yaw * Math.PI / 180;
    retargeter?.setFacingYawDeg(yaw); for (const item of cloneRetargeters) item.setFacingYawDeg(yaw);
    const nextDirection = (Math.round(yaw / 45) % 8) as Dir8;
    if (nextDirection !== direction) { direction = nextDirection; applyMotion(); }
  };

  return {
    stats, clips: model.clips.map(clip => clip.name),
    render(timeMs) {
      if (disposed) return;
      if (cycle && timeMs >= nextDirectionMs) { setYaw(((direction + 1) % 8) * 45); nextDirectionMs = timeMs + 900; }
      const dt = previousTime ? Math.min(.5, Math.max(0, (timeMs - previousTime) / 1_000)) : 0;
      stats.frameTimeMs = dt * 1_000; previousTime = timeMs; const started = performance.now();
      if (autoRotate) setYaw(yaw + dt * 45);
      const rigStarted = performance.now(); const rigCount = stress ? rigCharacters.length : 1;
      for (let index = 0; index < rigCount; index += 1) rigCharacters[index]!.update(dt);
      rigBatch.sync(); stats.rigCpuMs = performance.now() - rigStarted; mixer?.update(dt);
      for (const item of cloneMixers) item.update(dt); retargeter?.update(dt); for (const item of cloneRetargeters) item.update(dt);
      if (retargeter) {
        const mutable = stats as { directionErrorDeg: number; skeleton?: string; mappedBones: number };
        mutable.directionErrorDeg = retargeter.maxDirectionErrorDeg; mutable.skeleton = retargeter.kind; mutable.mappedBones = retargeter.mappedBones.length;
      }
      renderer.info.reset(); renderer.render(scene, camera); const batchStats = rigBatch.stats;
      stats.drawCalls = renderer.info.render.calls; stats.rigDrawCalls = batchStats.drawCalls; stats.characters = batchStats.characters;
      stats.instances = batchStats.activeInstances; stats.uploadedRanges = batchStats.uploadedRanges;
      const mutable = stats as { rendererDrawCalls: number; rendererTriangles: number };
      mutable.rendererDrawCalls = renderer.info.render.calls; mutable.rendererTriangles = renderer.info.render.triangles;
      benchmark(performance.now() - started);
    },
    resize(width, height, pixelRatio = 1) {
      const safeHeight = Math.max(1, height); const halfWidth = 3 * width / safeHeight; camera.left = -halfWidth; camera.right = halfWidth;
      camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(2, Math.max(1, pixelRatio))); renderer.setSize(width, safeHeight, false);
    },
    setMotion(next) { mode = next; applyMotion(); }, setDirection(next) { setYaw(next * 45); },
    setWeight(next) { weight = next; applyMotion(); }, setSpeed(next) { speed = Math.max(0, next); applyMotion(); },
    setStepFps(next) { stepFps = Math.max(0, next); applyMotion(); }, setClipMap(value) { clipMap = loadRigClipMap(value); },
    setClipMode(next) { clipMode = next; applyMotion(); }, setDirectionCycle(next) { cycle = next; nextDirectionMs = 0; },
    async setEquipment(slot, value) { enabled[slot] = value; await applyEquipment(); },
    setStress(next) {
      if (stress === next) return; stress = next;
      for (let index = 1; index < rigCharacters.length; index += 1) {
        if (next) rigBatch.add(rigCharacters[index]!); else rigBatch.remove(rigCharacters[index]!);
      }
      applyMotion();
    },
    playClipKey(clipKey) {
      if (!clipMap) throw new Error('RIG_CLIP_MAP_NOT_LOADED'); const entry = resolveRigClipKey(clipMap, clipKey);
      rigCharacters[0]!.playClip(entry.clipId, { facingYawDeg: direction * 45, rate: entry.rate, movement: entry.movement,
        nearHandWeapon: entry.nearHandWeapon, yawAssistMaxDeg: entry.yawAssistMaxDeg,
        onEvent: event => options.onClipEvent?.(event, clipKey) });
    },
    setYaw, setAutoRotate(enabledAutoRotate) { autoRotate = enabledAutoRotate; },
    setToon(enabledToon) { toon = enabledToon; model.setToon(enabledToon); for (const clone of clones) applyPilotMaterials(clone, model, toon, outline); },
    setOutline(enabledOutline) { outline = enabledOutline; model.setOutline(enabledOutline); for (const clone of clones) applyPilotMaterials(clone, model, toon, outline); },
    setInstances(count) { instanceCount = count; cpuCursor = 0; cpuCount = 0; rebuildClones(); },
    playGltfClip(name) {
      retargeter?.dispose(); retargeter = undefined; clearCloneAnimations(); tianshuClip = undefined; action?.stop();
      gltfClip = model.clips.find(item => item.name === name); action = gltfClip && mixer ? mixer.clipAction(gltfClip).reset().play() : undefined;
      if (gltfClip) for (const item of cloneMixers) cloneActions.push(item.clipAction(gltfClip).reset().play());
    },
    playTianshuClip(value, playOptions = {}) {
      if (!model.skinned) return; gltfClip = undefined; action?.stop(); action = undefined; clearCloneAnimations();
      mixer?.stopAllAction(); resetSkeletons(model.scene); for (const clone of clones) resetSkeletons(clone);
      tianshuClip = loadRigClip(value); tianshuOptions = playOptions; retargeter?.dispose();
      retargeter = createPilotRetargeter(model.scene, tianshuClip, { ...playOptions,
        ...(options.onClipEvent ? { onEvent: event => options.onClipEvent?.(event, tianshuClip!.id) } : {}) });
      retargeter.setFacingYawDeg(yaw);
      for (const clone of clones) { const cloneRetargeter = createPilotRetargeter(clone, tianshuClip, playOptions);
        cloneRetargeter.setFacingYawDeg(yaw); cloneRetargeters.push(cloneRetargeter); }
    },
    stopAnimation() {
      gltfClip = undefined; tianshuClip = undefined; action?.stop(); action = undefined;
      clearCloneAnimations(); retargeter?.dispose(); retargeter = undefined;
      mixer?.stopAllAction(); resetSkeletons(model.scene); for (const clone of clones) resetSkeletons(clone);
    },
    dispose() {
      if (disposed) return; disposed = true; action?.stop(); retargeter?.dispose(); clearClones(); mixer?.stopAllAction(); model.dispose();
      disposeRig(rigSet, rigBatch, rigCharacters); for (const child of [...scene.children]) {
        if (child instanceof GridHelper) { child.geometry.dispose();
          if (Array.isArray(child.material)) for (const item of child.material) item.dispose(); else child.material.dispose(); }
      }
      renderer.forceContextLoss(); renderer.dispose();
    },
  };
}
