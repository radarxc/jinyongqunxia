import type { MeshBasicMaterial } from 'three';
import {
  AnimationMixer, BufferAttribute, Group, InterleavedBufferAttribute, Matrix4, Mesh, Object3D,
  Color, PropertyBinding, Quaternion, SkinnedMesh, SRGBColorSpace, Vector3, type AnimationAction,
  type AnimationClip, type Bone, type ColorRepresentation, type Material, type Skeleton, type Texture,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { prepareBodyRegionMesh, setRegionHideMask, toUnlit, setHideMap, createDressupCanvas,
  loadDressupImage, defaultHideMapCompositor, configureHideMapTexture } from './materials';
import { createDressupSkeletonFrameAccess, loadDressupSkeletonFrame,
  type DressupSkeletonFrameAccess } from './skeleton-frame';
import { DressupCullingBounds } from './culling';
import { DressupError, type DressupActor, type DressupActorOptions, type DressupEquipSpec, type DressupFit,
  type DressupGripAdjust, type DressupHideMapSpec, type DressupLayerCompositor, type DressupLayerSpec,
  type DressupSkeletonFrame, type DressupStats } from './types';

interface BodySkeleton {
  readonly skeleton: Skeleton;
  readonly meshes: readonly SkinnedMesh[];
}
interface Equipment {
  readonly root: Object3D;
  readonly skinnedMeshes: readonly SkinnedMesh[];
  readonly textures: ReadonlySet<Texture>;
  readonly hideMask: number;
  readonly neverMask: number;
  readonly rightHand: boolean;
  readonly leftHand: boolean;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly skinTint?: readonly [number, number, number];
  readonly hideMap?: DressupHideMapSpec;
}
interface FingerBone { readonly bone: Bone; readonly pose: readonly number[] }
interface LayerCacheEntry { readonly promise: Promise<Texture>; refs: number; texture?: Texture }
interface LayerLease { readonly key: string; readonly texture: Texture }
type MappableMaterial = Material & { map?: Texture | null };
type SizedImage = CanvasImageSource & { readonly width: number; readonly height: number };

type SkinAttribute = BufferAttribute | InterleavedBufferAttribute;

const layerCache = new Map<string, LayerCacheEntry>();

function orderedLayers(layers: readonly DressupLayerSpec[]): readonly DressupLayerSpec[] {
  return layers.map((layer, index) => ({ layer, index }))
    .sort((left, right) => (left.layer.order ?? left.index) - (right.layer.order ?? right.index)
      || left.index - right.index)
    .map(value => value.layer);
}
function textureImage(texture: Texture): SizedImage {
  const image = texture.source.data as Partial<SizedImage> | null;
  if (!image || !Number.isFinite(image.width) || !Number.isFinite(image.height)
    || image.width! <= 0 || image.height! <= 0) throw new Error('DRESSUP_TEXTURE_IMAGE_MISSING');
  return image as SizedImage;
}
function textureBytes(texture: Texture): number {
  const image = texture.source.data as Partial<SizedImage> | null;
  return image && Number.isFinite(image.width) && Number.isFinite(image.height)
    ? Math.max(0, image.width! * image.height! * 4) : 0;
}
const defaultLayerCompositor: DressupLayerCompositor = {
  async composite(base, layers) {
    const baseImage = textureImage(base);
    const canvas = createDressupCanvas(baseImage.width, baseImage.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('DRESSUP_CANVAS_CONTEXT_UNAVAILABLE');
    context.clearRect(0, 0, baseImage.width, baseImage.height);
    context.drawImage(baseImage, 0, 0);
    for (const layer of layers) {
      const loaded = await loadDressupImage(layer.url);
      try {
        if (loaded.image.width !== baseImage.width || loaded.image.height !== baseImage.height)
          throw new Error(`DRESSUP_LAYER_SIZE_MISMATCH:${layer.id}`);
        context.drawImage(loaded.image, 0, 0);
      } finally { loaded.close(); }
    }
    const texture = base.clone();
    const SourceType = base.source.constructor as new (data?: CanvasImageSource) => Texture['source'];
    texture.source = new SourceType(canvas);
    return texture;
  },
};
function configureLayerTexture(texture: Texture, base: Texture): void {
  texture.colorSpace = SRGBColorSpace; texture.flipY = false;
  texture.wrapS = base.wrapS; texture.wrapT = base.wrapT;
  texture.magFilter = base.magFilter; texture.minFilter = base.minFilter;
  texture.anisotropy = base.anisotropy; texture.generateMipmaps = base.generateMipmaps;
  texture.needsUpdate = true;
}
async function acquireLayerTexture(base: Texture, layers: readonly DressupLayerSpec[],
  compositor: DressupLayerCompositor): Promise<LayerLease> {
  const key = JSON.stringify(['layers', layers.map(layer => layer.id)]);
  return acquireTexture(key, async () => {
    const texture = await compositor.composite(base, layers);
    configureLayerTexture(texture, base); return texture;
  });
}
async function acquireTexture(key: string, composite: () => Promise<Texture>): Promise<LayerLease> {
  let entry = layerCache.get(key);
  if (!entry) {
    entry = { refs: 0, promise: composite().then(texture => {
      entry!.texture = texture; return texture;
    }) };
    layerCache.set(key, entry);
  }
  entry.refs += 1;
  try { return { key, texture: await entry.promise }; }
  catch (error) { entry.refs -= 1; if (entry.refs === 0) layerCache.delete(key); throw error; }
}
function releaseLayerTexture(lease: LayerLease | undefined): void {
  if (!lease) return;
  const entry = layerCache.get(lease.key);
  if (!entry) return;
  entry.refs -= 1;
  if (entry.refs === 0) { layerCache.delete(lease.key); entry.texture?.dispose(); }
}

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
  root.traverse(node => { if (node instanceof Mesh) node.customDepthMaterial?.dispose(); });
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
  // Object3D.copy does not retain customDepthMaterial; copy it before shader preparation.
  const sourceDepths: (Material | undefined)[] = [];
  bodyGltf.scene.traverse(node => { if (node instanceof SkinnedMesh) sourceDepths.push(node.customDepthMaterial); });
  body.meshes.forEach((mesh, index) => {
    const depth = sourceDepths[index]; if (depth) mesh.customDepthMaterial = depth.clone();
  });
  prepareBodyMaterials(body.meshes, options.unlit ?? true);
  const access = createDressupSkeletonFrameAccess(frame);
  const sockets = createSockets(root, body.skeleton, frame);
  const mixer = new AnimationMixer(bodyRoot);
  const clips = new Map<string, AnimationClip>();
  for (const clip of bodyGltf.animations) clips.set(clip.name, clip);
  const culling = new DressupCullingBounds(root, bodyRoot, bodyGltf.animations);
  culling.add(bodyRoot);
  const equipment = new Map<string, Equipment>();
  const bodyMaterialSet = new Set<Material>();
  for (const mesh of body.meshes) {
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      bodyMaterialSet.add(material);
    }
  }
  const bodyMaterials = [...bodyMaterialSet];
  const maskMaterials = new Set(bodyMaterials);
  for (const mesh of body.meshes) if (mesh.customDepthMaterial) maskMaterials.add(mesh.customDepthMaterial);
  const originalBodyMaps = new Map<MappableMaterial, Texture | null>();
  const originalBodyColors = new Map<Material, Color>();
  for (const material of bodyMaterials) {
    const mappable = material as MappableMaterial;
    if ('map' in mappable) originalBodyMaps.set(mappable, mappable.map ?? null);
    if ('color' in material && (material as MeshBasicMaterial).color instanceof Color) {
      originalBodyColors.set(material, (material as MeshBasicMaterial).color.clone());
    }
  }
  const baseTextures = new Set([...originalBodyMaps.values()].filter(
    (value): value is Texture => value !== null));
  const bodyBaseTexture = baseTextures.size === 1 ? [...baseTextures][0] : undefined;
  const compositor = options.compositor ?? defaultLayerCompositor;
  const hideMapCompositor = options.hideMapCompositor ?? defaultHideMapCompositor;
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
    bodyLayers: [],
    layerTextureBytes: 0,
    hideMaps: [],
  };
  let debugMask = 0; let action: AnimationAction | undefined;
  let leftHeld = false; let rightHeld = false; let updated = false; let disposed = false;
  let layerLease: LayerLease | undefined; let layerRequest = 0;
  let hideMapEnabled = true; let hideMapLease: LayerLease | undefined; let hideMapRequest = 0;
  let headId: string | undefined; let pendingHeadId: string | undefined; let headRequest = 0;
  const hideMapStats = stat as { hideMaps: readonly string[]; hideMapSize?: number; hideMapError?: string };

  const requireActive = (): void => { if (disposed) throw new Error(DressupError.Disposed); };
  const refreshState = (): void => {
    let hidden = debugMask; let never = 0; let draws = baseDrawCalls; let tris = baseTriangles;
    leftHeld = false; rightHeld = false;
    let skinTint: readonly [number, number, number] | undefined;
    for (const value of equipment.values()) {
      hidden |= value.hideMask; never |= value.neverMask; draws += value.drawCalls;
      tris += value.triangles; leftHeld ||= value.leftHand; rightHeld ||= value.rightHand;
      if (value.skinTint) skinTint = value.skinTint;
    }
    hidden = (hidden & ~never) >>> 0;
    for (const material of maskMaterials) setRegionHideMask(material, hidden);
    for (const material of bodyMaterials) {
      const original = originalBodyColors.get(material);
      if (original && 'color' in material) {
        if (skinTint) (material as MeshBasicMaterial).color.setRGB(original.r * skinTint[0], original.g * skinTint[1], original.b * skinTint[2]);
        else (material as MeshBasicMaterial).color.copy(original);
      }
    }
    (stat as { drawCalls: number }).drawCalls = draws;
    (stat as { triangles: number }).triangles = tris;
  };
  const removeEquipment = (id: string): void => {
    const value = equipment.get(id);
    if (!value) return;
    if (headId === id) headId = undefined;
    equipment.delete(id); culling.remove(value.skinnedMeshes);
    disposeTree(value.root, value.textures); refreshState();
  };
  const applyBodyMap = (texture: Texture | undefined): void => {
    for (const [material, original] of originalBodyMaps) {
      material.map = texture ?? original; material.needsUpdate = true;
    }
  };
  const setLayerStats = (layers: readonly DressupLayerSpec[], texture?: Texture): void => {
    (stat as { bodyLayers: readonly string[] }).bodyLayers = layers.map(layer => layer.id);
    (stat as { layerTextureBytes: number }).layerTextureBytes = texture ? textureBytes(texture) : 0;
  };

  const updateHideMaps = async (): Promise<void> => {
    const request = ++hideMapRequest;
    const maps: DressupHideMapSpec[] = [];
    for (const value of equipment.values()) if (value.hideMap) maps.push(value.hideMap);
    maps.sort((a, b) => a.id.localeCompare(b.id));
    hideMapStats.hideMaps = maps.map(map => map.id);
    delete hideMapStats.hideMapError;
    const clear = (): void => {
      for (const material of maskMaterials) setHideMap(material, null, false);
      releaseLayerTexture(hideMapLease); hideMapLease = undefined;
      delete hideMapStats.hideMapSize;
    };
    if (maps.length === 0) {
      clear(); return;
    }
    const key = JSON.stringify(['hidemap', options.templateId ?? options.bodyUrl,
      options.bodyUrl, maps.map(map => [map.id, map.url, map.size ?? null])]);
    if (hideMapLease?.key === key) return;
    // Never leave an old garment's holes visible while its replacement is loading.
    clear();
    try {
      const acquired = await acquireTexture(key, async () => {
        const texture = await hideMapCompositor.composite(maps);
        configureHideMapTexture(texture); return texture;
      });
      if (disposed || request !== hideMapRequest) { releaseLayerTexture(acquired); return; }
      hideMapLease = acquired;
      hideMapStats.hideMapSize = (acquired.texture.source.data as SizedImage).width;
      for (const material of maskMaterials) setHideMap(material, acquired.texture, hideMapEnabled);
    } catch (error) {
      if (!disposed && request === hideMapRequest) {
        hideMapStats.hideMapError = error instanceof Error ? error.message : String(error);
        console.warn('DRESSUP_HIDE_MAP_FAILED', hideMapStats.hideMapError);
      }
      throw error;
    }
  };
  const unequip = (id: string): void => {
    if (disposed) return;
    if (id === pendingHeadId || id === headId) { headRequest += 1; pendingHeadId = undefined; }
    removeEquipment(id);
    // updateHideMaps records the failure; this synchronous API must handle the rejection.
    void updateHideMaps().catch(() => undefined);
  };
  const equip = async (spec: DressupEquipSpec): Promise<void> => {
    requireActive();
    const hideMask = maskFor(access, spec.fit.hideRegions);
    const neverMask = maskFor(access, spec.fit.neverHide);
    const request = spec.kind === 'head' ? ++headRequest : 0;
    if (spec.kind === 'head') pendingHeadId = spec.id;
    const base = typeof document !== 'undefined' ? document.baseURI : 'http://localhost/';
    const maskUrl = spec.hideMapUrl ?? spec.fit.hideMask?.file;
    const hideMap = maskUrl ? { id: spec.id,
      url: new URL(maskUrl, spec.hideMapUrl ? base : new URL(spec.url, base)).href,
      ...(spec.fit.hideMask?.size === undefined ? {} : { size: spec.fit.hideMask.size }) } : undefined;
    const gltf: GLTF = await loader.loadAsync(spec.url);
    const equipmentTextures = collectTextures(gltf.scene);
    if (disposed) { disposeTree(gltf.scene, equipmentTextures); throw new Error(DressupError.Disposed); }
    if (spec.kind === 'head' && request !== headRequest) { disposeTree(gltf.scene, equipmentTextures); return; }
    let skinnedMeshes: readonly SkinnedMesh[] = [];
    try {
      if (spec.kind !== 'prop') configureSkinnedEquipment(gltf.scene, body.skeleton);
      prepareEquipmentMaterials(gltf.scene, options.unlit ?? true);
      const attached = attachEquipmentRoot(gltf.scene, spec, root, sockets, gripMatrix);
      removeEquipment(spec.id);
      if (spec.kind === 'head' && headId) removeEquipment(headId);
      root.updateMatrixWorld(true);
      skinnedMeshes = culling.add(attached);
      const socket = spec.fit.socket ?? '';
      equipment.set(spec.id, {
        root: attached, skinnedMeshes, textures: equipmentTextures, hideMask, neverMask,
        rightHand: spec.kind === 'prop' && socket === 'gripR',
        leftHand: spec.kind === 'prop' && socket === 'gripL',
        ...(hideMap ? { hideMap } : {}),
        ...(spec.kind === 'head' && spec.fit.skinTint ? { skinTint: spec.fit.skinTint } : {}),
        ...equipmentMetrics(attached),
      });
      if (spec.kind === 'head') { headId = spec.id; pendingHeadId = undefined; }
      refreshState();
    } catch (error) { culling.remove(skinnedMeshes); disposeTree(gltf.scene, equipmentTextures); throw error; }
    // A failed mask leaves valid equipment attached, with masking disabled and an explicit error.
    await updateHideMaps();
  };

  return {
    root, skeleton: body.skeleton, frame,
    async setHead(url: string | null, headOptions?: { readonly skinTint?: ColorRepresentation }) {
      requireActive();
      if (!url) {
        if (pendingHeadId) unequip(pendingHeadId);
        if (headId) unequip(headId);
        return;
      }
      let skinTintArray: [number, number, number] | undefined;
      if (headOptions?.skinTint !== undefined) {
        const c = new Color(headOptions.skinTint);
        skinTintArray = [c.r, c.g, c.b];
      }
      const fit: DressupFit = { schema: 'tianshu-dressup-fit.v1', kind: 'head', id: 'head', hideRegions: ['head'], ...(skinTintArray ? { skinTint: skinTintArray } : {}) };
      await equip({ kind: 'head', id: 'head', url, fit });
    },
    async setBodyLayers(layers) {
      requireActive(); const request = ++layerRequest; const ordered = orderedLayers(layers);
      if (ordered.length === 0) {
        applyBodyMap(undefined); releaseLayerTexture(layerLease); layerLease = undefined;
        setLayerStats([]); return;
      }
      if (!bodyBaseTexture) throw new Error(baseTextures.size === 0
        ? 'DRESSUP_BODY_BASE_TEXTURE_MISSING' : 'DRESSUP_BODY_BASE_TEXTURE_AMBIGUOUS');
      const acquired = await acquireLayerTexture(bodyBaseTexture, ordered, compositor);
      if (disposed || request !== layerRequest) { releaseLayerTexture(acquired); return; }
      applyBodyMap(acquired.texture);
      releaseLayerTexture(layerLease); layerLease = acquired;
      setLayerStats(ordered, acquired.texture);
    },
    equip, unequip,
    setHideMask(regions) {
      requireActive(); debugMask = access.getRegionMask(regions); refreshState();
    },
    setHideMapEnabled(on: boolean) {
      requireActive(); hideMapEnabled = on;
      for (const material of maskMaterials) setHideMap(material, hideMapLease?.texture ?? null, hideMapEnabled);
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
      culling.refreshMotion();
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
      if (disposed) return; disposed = true; layerRequest += 1; mixer.stopAllAction(); mixer.uncacheRoot(bodyRoot);
      for (const value of equipment.values()) disposeTree(value.root, value.textures);
      equipment.clear(); applyBodyMap(undefined);
      releaseLayerTexture(layerLease); layerLease = undefined;
      hideMapRequest += 1;
      for (const material of maskMaterials) setHideMap(material, null, false);
      releaseLayerTexture(hideMapLease); hideMapLease = undefined;
      hideMapStats.hideMaps = []; delete hideMapStats.hideMapSize; delete hideMapStats.hideMapError;
      disposeTree(bodyRoot, bodyTextures); body.skeleton.boneTexture?.dispose(); root.clear();
      (stat as { drawCalls: number }).drawCalls = 0;
      (stat as { triangles: number }).triangles = 0;
      (stat as { boneTextureUploads: number }).boneTextureUploads = 0;
      setLayerStats([]);
    },
  };
}
