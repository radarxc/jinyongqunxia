import {
  AnimationMixer, BufferAttribute, Group, InterleavedBufferAttribute, Matrix4, Mesh, Object3D,
  PropertyBinding, Quaternion, SkinnedMesh, Vector3, type AnimationAction, type AnimationClip, type Bone,
  type ColorRepresentation, type Material, type Skeleton, type Texture,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { prepareBodyRegionMesh, setRegionHideMask, toUnlit } from './materials';
import { createDressupSkeletonFrameAccess, loadDressupSkeletonFrame,
  type DressupSkeletonFrameAccess } from './skeleton-frame';
import { DressupError, type DressupActor, type DressupActorOptions, type DressupEquipSpec,
  type DressupGripAdjust, type DressupSkeletonFrame, type DressupStats } from './types';

interface BodySkeleton {
  readonly skeleton: Skeleton;
  readonly meshes: readonly SkinnedMesh[];
}
interface Equipment {
  readonly root: Object3D;
  readonly textures: ReadonlySet<Texture>;
  readonly hideMask: number;
  readonly neverMask: number;
  readonly rightHand: boolean;
  readonly leftHand: boolean;
  readonly drawCalls: number;
  readonly triangles: number;
}
interface FingerBone { readonly bone: Bone; readonly pose: readonly number[] }

type SkinAttribute = BufferAttribute | InterleavedBufferAttribute;

function component(attribute: SkinAttribute, index: number, item: number): number {
  if (item === 0) return attribute.getX(index);
  if (item === 1) return attribute.getY(index);
  if (item === 2) return attribute.getZ(index);
  return attribute.getW(index);
}
function setComponent(attribute: SkinAttribute, index: number, item: number, value: number): void {
  if (item === 0) attribute.setX(index, value);
  else if (item === 1) attribute.setY(index, value);
  else if (item === 2) attribute.setZ(index, value);
  else attribute.setW(index, value);
}
function sanitized(name: string): string { return PropertyBinding.sanitizeNodeName(name); }

export function remapAndBindSkinnedMesh(mesh: SkinnedMesh, target: Skeleton): void {
  const indices = mesh.geometry.getAttribute('skinIndex');
  const weights = mesh.geometry.getAttribute('skinWeight');
  if (!(indices instanceof BufferAttribute || indices instanceof InterleavedBufferAttribute)
    || !(weights instanceof BufferAttribute || weights instanceof InterleavedBufferAttribute)) {
    throw new Error('DRESSUP_SKIN_ATTRIBUTES_MISSING');
  }
  const source = mesh.skeleton;
  const targetByName = new Map<string, number>();
  for (let index = 0; index < target.bones.length; index += 1) {
    targetByName.set(sanitized(target.bones[index]!.name), index);
  }
  const mappedIndices = indices.clone();
  const mappedWeights = weights.clone();
  mesh.geometry.setAttribute('skinIndex', mappedIndices);
  mesh.geometry.setAttribute('skinWeight', mappedWeights);
  for (let vertex = 0; vertex < mappedIndices.count; vertex += 1) {
    for (let item = 0; item < mappedIndices.itemSize; item += 1) {
      const sourceIndex = component(indices, vertex, item);
      const sourceBone = source.bones[sourceIndex];
      const targetIndex = sourceBone ? targetByName.get(sanitized(sourceBone.name)) : undefined;
      if (targetIndex === undefined) {
        setComponent(mappedIndices, vertex, item, 0);
        setComponent(mappedWeights, vertex, item, 0);
      } else setComponent(mappedIndices, vertex, item, targetIndex);
    }
  }
  mesh.normalizeSkinWeights();
  const bindMatrix = mesh.bindMatrix.clone();
  source.boneTexture?.dispose();
  mesh.bind(target, bindMatrix);
}

export function mergeBodySkeleton(root: Object3D): BodySkeleton {
  const meshes: SkinnedMesh[] = [];
  root.traverse(node => { if (node instanceof SkinnedMesh) meshes.push(node); });
  const first = meshes[0];
  if (!first) throw new Error(DressupError.NoSkinnedBody);
  const shared = first.skeleton;
  for (let index = 1; index < meshes.length; index += 1) {
    const mesh = meshes[index]!;
    const old = mesh.skeleton;
    const bindMatrix = mesh.bindMatrix.clone();
    if (old !== shared) old.boneTexture?.dispose();
    mesh.bind(shared, bindMatrix);
  }
  return { skeleton: shared, meshes };
}

function materialSlots(mesh: Mesh): number { return Array.isArray(mesh.material) ? mesh.material.length : 1; }
function triangles(mesh: Mesh): number {
  return Math.floor((mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0) / 3);
}
function replaceWithUnlit(mesh: Mesh): void {
  mesh.material = Array.isArray(mesh.material)
    ? mesh.material.map(material => toUnlit(material))
    : toUnlit(mesh.material);
}
function collectTextures(root: Object3D): Set<Texture> {
  const textures = new Set<Texture>();
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && (value as Texture).isTexture) {
          textures.add(value as Texture);
        }
      }
    }
  });
  return textures;
}
function disposeTree(root: Object3D, ownedTextures?: ReadonlySet<Texture>): void {
  const geometries = new Set<unknown>(); const materials = new Set<Material>();
  const textures = new Set<Texture>(ownedTextures);
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    if (!geometries.has(node.geometry)) { geometries.add(node.geometry); node.geometry.dispose(); }
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!materials.has(material)) {
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value && typeof value === 'object' && (value as Texture).isTexture) {
            textures.add(value as Texture);
          }
        }
        material.dispose();
      }
    }
  });
  for (const texture of textures) texture.dispose();
  root.removeFromParent();
}
function maskFor(frame: DressupSkeletonFrameAccess, regions: readonly string[] | undefined): number {
  return regions ? frame.getRegionMask(regions) : 0;
}
function createGripMatrix(adjust: DressupGripAdjust | undefined, out: Matrix4): Matrix4 {
  if (!adjust) return out.identity();
  return out.compose(
    new Vector3().fromArray(adjust.pos),
    new Quaternion().fromArray(adjust.quat),
    new Vector3(1, 1, 1),
  );
}
function createSockets(
  root: Object3D, skeleton: Skeleton, frame: DressupSkeletonFrame,
): ReadonlyMap<string, Object3D> {
  const byName = new Map<string, Bone>();
  for (const bone of skeleton.bones) byName.set(sanitized(bone.name), bone);
  const result = new Map<string, Object3D>();
  for (const [name, value] of Object.entries(frame.sockets)) {
    const bone = byName.get(sanitized(value.bone));
    if (!bone) throw new Error(`${DressupError.SocketBoneUnknown}:${value.bone}`);
    const socket = new Object3D(); socket.name = `dressupSocket:${name}`;
    socket.matrix.compose(new Vector3().fromArray(value.pos), new Quaternion().fromArray(value.quat),
      new Vector3(1, 1, 1));
    socket.matrixAutoUpdate = false; bone.add(socket); result.set(name, socket);
  }
  root.updateMatrixWorld(true);
  return result;
}
function equipmentMetrics(root: Object3D): { drawCalls: number; triangles: number } {
  let drawCalls = 0; let triangleCount = 0;
  root.traverse(node => {
    if (!(node instanceof Mesh)) return; drawCalls += materialSlots(node); triangleCount += triangles(node);
  });
  return { drawCalls, triangles: triangleCount };
}
function prepareEquipmentMaterials(root: Object3D, unlit: boolean): void {
  root.traverse(node => {
    if (!(node instanceof Mesh)) return;
    if (unlit) replaceWithUnlit(node);
    node.castShadow = false; node.receiveShadow = false;
  });
}
function prepareBodyMaterials(meshes: readonly SkinnedMesh[], unlit: boolean): void {
  for (const mesh of meshes) {
    if (unlit) replaceWithUnlit(mesh);
    prepareBodyRegionMesh(mesh); mesh.receiveShadow = false;
  }
}

function configureSkinnedEquipment(root: Object3D, skeleton: Skeleton): void {
  const meshes: SkinnedMesh[] = [];
  root.traverse(node => {
    if (node instanceof SkinnedMesh) meshes.push(node);
  });
  for (const mesh of meshes) remapAndBindSkinnedMesh(mesh, skeleton);
}

function attachEquipmentRoot(
  scene: Object3D, spec: DressupEquipSpec, actorRoot: Group,
  sockets: ReadonlyMap<string, Object3D>, gripMatrix: Matrix4,
): Object3D {
  const container = new Group(); container.name = `dressupEquip:${spec.id}`; container.add(scene);
  if (spec.kind !== 'prop') { actorRoot.add(container); return container; }
  const socketName = spec.fit.socket;
  const socket = socketName ? sockets.get(socketName) : undefined;
  if (!socket) throw new Error(`${DressupError.SocketUnknown}:${socketName ?? ''}`);
  container.matrix.copy(createGripMatrix(spec.fit.gripAdjust, gripMatrix));
  container.matrixAutoUpdate = false; socket.add(container); return container;
}

function collectFingerBones(
  skeleton: Skeleton, access: DressupSkeletonFrameAccess, side: 'Left' | 'Right',
): readonly FingerBone[] {
  const result: FingerBone[] = [];
  for (const bone of skeleton.bones) {
    if (!sanitized(bone.name).includes(`${side}Hand`)) continue;
    const pose = access.getFingerPose(bone.name);
    if (pose) result.push({ bone, pose });
  }
  return result;
}

function writeFingerPose(values: readonly FingerBone[]): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    value.bone.quaternion.set(
      value.pose[0]!, value.pose[1]!, value.pose[2]!, value.pose[3]!,
    );
  }
}

export async function createDressupActor(options: DressupActorOptions): Promise<DressupActor> {
  if (!Number.isFinite(options.heightM) || options.heightM <= 0) {
    throw new Error(DressupError.InvalidHeight);
  }
  const loader = options.loader ?? new GLTFLoader();
  const [bodyGltf, frame] = await Promise.all([
    loader.loadAsync(options.bodyUrl), loadDressupSkeletonFrame(options.frameUrl),
  ]);
  const root = new Group(); root.name = 'dressupActor';
  const bodyRoot = cloneSkeleton(bodyGltf.scene); root.add(bodyRoot);
  const bodyTextures = collectTextures(bodyRoot);
  root.scale.setScalar(options.heightM / frame.heightMu);
  // Offline normalization guarantees feet at y=0 and forward at +Z; runtime does no geometry fitting.
  root.position.y = 0;
  const body = mergeBodySkeleton(bodyRoot);
  prepareBodyMaterials(body.meshes, options.unlit ?? true);
  const access = createDressupSkeletonFrameAccess(frame);
  const sockets = createSockets(root, body.skeleton, frame);
  const mixer = new AnimationMixer(bodyRoot);
  const clips = new Map<string, AnimationClip>();
  for (const clip of bodyGltf.animations) clips.set(clip.name, clip);
  const equipment = new Map<string, Equipment>();
  const bodyMaterials: Material[] = [];
  for (const mesh of body.meshes) {
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      bodyMaterials.push(material);
    }
  }
  const leftFingers = collectFingerBones(body.skeleton, access, 'Left');
  const rightFingers = collectFingerBones(body.skeleton, access, 'Right');
  const originalBonePositions = new Map<string, Vector3>();
  for (const bone of body.skeleton.bones) originalBonePositions.set(sanitized(bone.name), bone.position.clone());
  const gripMatrix = new Matrix4();
  const baseDrawCalls = body.meshes.reduce((sum, mesh) => sum + materialSlots(mesh), 0);
  const baseTriangles = body.meshes.reduce((sum, mesh) => sum + triangles(mesh), 0);
  const stat: DressupStats = {
    drawCalls: baseDrawCalls,
    triangles: baseTriangles,
    boneTextureUploads: 1,
  };
  let debugMask = 0; let action: AnimationAction | undefined;
  let leftHeld = false; let rightHeld = false; let updated = false; let disposed = false;

  const requireActive = (): void => { if (disposed) throw new Error(DressupError.Disposed); };
  const refreshState = (): void => {
    let hidden = debugMask; let never = 0; let draws = baseDrawCalls; let tris = baseTriangles;
    leftHeld = false; rightHeld = false;
    for (const value of equipment.values()) {
      hidden |= value.hideMask; never |= value.neverMask; draws += value.drawCalls;
      tris += value.triangles; leftHeld ||= value.leftHand; rightHeld ||= value.rightHand;
    }
    hidden = (hidden & ~never) >>> 0;
    for (const material of bodyMaterials) setRegionHideMask(material, hidden);
    (stat as { drawCalls: number }).drawCalls = draws;
    (stat as { triangles: number }).triangles = tris;
  };
  const removeEquipment = (id: string): void => {
    const value = equipment.get(id);
    if (!value) return;
    equipment.delete(id); disposeTree(value.root, value.textures); refreshState();
  };

  return {
    root, skeleton: body.skeleton, frame,
    async setHead(_url: string | null, _headOptions?: { readonly skinTint?: ColorRepresentation }) {
      requireActive();
      // Phase D will bind the authored head with:
      // bindMatrix = inverse(IBM_neck_target) * IBM_neck_author.
      // Runtime neck.matrixWorld is intentionally never part of that calculation.
    },
    async equip(spec) {
      requireActive();
      const hideMask = maskFor(access, spec.fit.hideRegions);
      const neverMask = maskFor(access, spec.fit.neverHide);
      const gltf: GLTF = await loader.loadAsync(spec.url);
      const equipmentTextures = collectTextures(gltf.scene);
      if (disposed) { disposeTree(gltf.scene, equipmentTextures); throw new Error(DressupError.Disposed); }
      removeEquipment(spec.id);
      try {
        if (spec.kind !== 'prop') configureSkinnedEquipment(gltf.scene, body.skeleton);
        prepareEquipmentMaterials(gltf.scene, options.unlit ?? true);
        const attached = attachEquipmentRoot(gltf.scene, spec, root, sockets, gripMatrix);
        const metrics = equipmentMetrics(attached);
        const socket = spec.fit.socket ?? '';
        equipment.set(spec.id, {
          root: attached, textures: equipmentTextures, hideMask, neverMask,
          rightHand: spec.kind === 'prop' && socket === 'gripR',
          leftHand: spec.kind === 'prop' && socket === 'gripL',
          ...metrics,
        });
        root.updateMatrixWorld(true); refreshState();
      } catch (error) { disposeTree(gltf.scene, equipmentTextures); throw error; }
    },
    unequip(id) { if (!disposed) removeEquipment(id); },
    setHideMask(regions) {
      requireActive(); debugMask = access.getRegionMask(regions); refreshState();
    },
    setBoneLength(tweaks) {
      requireActive();
      if (updated) throw new Error(DressupError.BoneLengthLate);
      for (const [name, scale] of Object.entries(tweaks)) {
        if (!Number.isFinite(scale) || scale < 0.97 || scale > 1.03) {
          throw new Error(`${DressupError.BoneLengthRange}:${name}`);
        }
        if (!originalBonePositions.has(sanitized(name))) {
          throw new Error(`${DressupError.BoneUnknown}:${name}`);
        }
      }
      for (const bone of body.skeleton.bones) {
        const original = originalBonePositions.get(sanitized(bone.name));
        if (original) bone.position.copy(original);
      }
      for (const [name, scale] of Object.entries(tweaks)) {
        const key = sanitized(name);
        const bone = body.skeleton.bones.find(value => sanitized(value.name) === key)!;
        bone.position.multiplyScalar(scale);
      }
      root.updateMatrixWorld(true);
    },
    playClip(name, fade = 0.16) {
      requireActive();
      const clip = clips.get(name);
      if (!clip) throw new Error(`${DressupError.ClipUnknown}:${name}`);
      const next = mixer.clipAction(clip);
      if (action === next) return;
      if (action && fade > 0) action.fadeOut(fade); else action?.stop();
      next.reset(); if (fade > 0) next.fadeIn(fade); next.play(); action = next;
    },
    update(dt) {
      if (disposed) return; updated = true; mixer.update(dt);
      if (leftHeld) writeFingerPose(leftFingers);
      if (rightHeld) writeFingerPose(rightFingers);
      root.updateMatrixWorld(true);
    },
    stats: () => stat,
    dispose() {
      if (disposed) return; disposed = true; mixer.stopAllAction(); mixer.uncacheRoot(bodyRoot);
      for (const value of equipment.values()) disposeTree(value.root, value.textures);
      equipment.clear(); disposeTree(bodyRoot, bodyTextures); body.skeleton.boneTexture?.dispose(); root.clear();
      (stat as { drawCalls: number }).drawCalls = 0;
      (stat as { triangles: number }).triangles = 0;
      (stat as { boneTextureUploads: number }).boneTextureUploads = 0;
    },
  };
}
