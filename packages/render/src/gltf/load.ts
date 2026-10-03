import { Box3, Mesh, Quaternion, SkinnedMesh, Vector3, type AnimationClip, type Group, type Object3D } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createPilotMaterials, type PilotMaterialState } from './materials';

export interface PilotModelStats {
  readonly meshes: number; readonly skinnedMeshes: number; readonly triangles: number;
  readonly materialSlots: number; readonly textures: number; readonly joints: number; readonly drawCalls: number;
  readonly sourceHeightM: number; readonly scale: number;
}
export interface PilotModel {
  readonly scene: Group; readonly skinned: boolean; readonly clips: AnimationClip[];
  readonly stats: PilotModelStats; readonly materials: PilotMaterialState;
  setToon(enabled: boolean): void; setOutline(enabled: boolean): void; dispose(): void;
}

function trianglesFor(mesh: Mesh): number {
  const geometry = mesh.geometry; const count = geometry.index?.count ?? geometry.attributes['position']?.count ?? 0;
  return Math.floor(count / 3);
}
function slotsFor(mesh: Mesh): number { return Array.isArray(mesh.material) ? mesh.material.length : 1; }
function collectTextures(meshes: readonly Mesh[]): Set<{ dispose(): void }> {
  const textures = new Set<unknown>();
  for (const mesh of meshes) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
    for (const value of Object.values(material)) if (value && typeof value === 'object' && (value as { isTexture?: boolean }).isTexture) textures.add(value);
  }
  return textures as Set<{ dispose(): void }>;
}
const UP = new Vector3(0, 1, 0);
function named(root: Object3D, aliases: readonly string[]): Object3D | undefined {
  for (const alias of aliases) { const node = root.getObjectByName(alias); if (node) return node; }
  return undefined;
}
function orientPilotPositiveZ(scene: Group): void {
  scene.updateMatrixWorld(true);
  const left = named(scene, ['mixamorig:LeftShoulder', 'upperarm_l']);
  const right = named(scene, ['mixamorig:RightShoulder', 'upperarm_r']);
  const hips = named(scene, ['mixamorig:Hips', 'pelvis']);
  const head = named(scene, ['mixamorig:Head', 'head', 'Head']);
  if (!left || !right || !hips || !head) return;
  const across = left.getWorldPosition(new Vector3()).sub(right.getWorldPosition(new Vector3()));
  const upright = head.getWorldPosition(new Vector3()).sub(hips.getWorldPosition(new Vector3()));
  const facing = across.cross(upright); facing.y = 0;
  if (facing.lengthSq() <= 1e-12) return;
  facing.normalize(); const yaw = -Math.atan2(facing.x, facing.z);
  scene.quaternion.premultiply(new Quaternion().setFromAxisAngle(UP, yaw)); scene.updateMatrixWorld(true);
}

export function normalizePilotScene(scene: Group, heightM = 1.7): { sourceHeightM: number; scale: number } {
  orientPilotPositiveZ(scene);
  scene.updateMatrixWorld(true); const bounds = new Box3().setFromObject(scene); const size = bounds.getSize(new Vector3());
  if (!Number.isFinite(size.y) || size.y <= 1e-6) throw new Error('PILOT_GLTF_ZERO_HEIGHT');
  const scale = heightM / size.y; scene.scale.multiplyScalar(scale); scene.updateMatrixWorld(true);
  const normalized = new Box3().setFromObject(scene); const center = normalized.getCenter(new Vector3());
  scene.position.x -= center.x; scene.position.y -= normalized.min.y; scene.position.z -= center.z;
  // Unmapped/unskinned pilot input follows the import convention that its source already faces +z.
  scene.updateMatrixWorld(true);
  return { sourceHeightM: size.y, scale };
}

export function preparePilotModel(gltf: GLTF): PilotModel {
  const scene = gltf.scene; const meshes: Mesh[] = [];
  let skinnedMeshes = 0;
  scene.traverse((node: Object3D) => {
    if (!(node instanceof Mesh)) return; meshes.push(node); if (node instanceof SkinnedMesh) skinnedMeshes += 1;
    node.castShadow = true; node.receiveShadow = true;
  });
  if (meshes.length === 0) throw new Error('PILOT_GLTF_NO_MESH');
  const normalized = normalizePilotScene(scene);
  const joints = new Set<Object3D>(); for (const mesh of meshes) if (mesh instanceof SkinnedMesh) for (const bone of mesh.skeleton.bones) joints.add(bone);
  const textures = collectTextures(meshes); const materials = createPilotMaterials(meshes);
  const materialSlots = meshes.reduce((sum, mesh) => sum + slotsFor(mesh), 0);
  const stats: PilotModelStats = {
    meshes: meshes.length, skinnedMeshes, triangles: meshes.reduce((sum, mesh) => sum + trianglesFor(mesh), 0),
    materialSlots, textures: textures.size, joints: joints.size, drawCalls: materialSlots, ...normalized,
  };
  let disposed = false;
  return {
    scene, skinned: skinnedMeshes > 0, clips: gltf.animations, stats, materials,
    setToon: enabled => materials.setToon(enabled), setOutline: enabled => materials.setOutline(enabled),
    dispose() {
      if (disposed) return; disposed = true; materials.dispose(); const geometries = new Set<unknown>();
      for (const mesh of meshes) {
        if (!geometries.has(mesh.geometry)) { geometries.add(mesh.geometry); mesh.geometry.dispose(); }
        const original = materials.original.get(mesh);
        if (original) for (const material of Array.isArray(original) ? original : [original]) material.dispose();
      }
      for (const texture of textures) texture.dispose();
      scene.removeFromParent();
    },
  };
}

export async function loadPilotModel(url: string): Promise<PilotModel> {
  if (!url) throw new TypeError('PILOT_GLTF_URL');
  const loader = new GLTFLoader();
  return preparePilotModel(await loader.loadAsync(url));
}
