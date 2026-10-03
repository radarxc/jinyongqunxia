import { Bone, Box3, BoxGeometry, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3 } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadPilotModel, normalizePilotScene, preparePilotModel } from './load';

function gltf(scene: Group) { return { scene, scenes: [scene], animations: [], cameras: [], asset: { version: '2.0' }, parser: {} } as never; }

describe('pilot GLTF preparation', () => {
  afterEach(() => vi.restoreAllMocks());

  it('loads and normalizes an unskinned fixture to 1.70 m with its feet at y=0', async () => {
    const scene = new Group(); const mesh = new Mesh(new BoxGeometry(1, 2, 1), new MeshBasicMaterial()); mesh.position.set(4, 2, -3); scene.add(mesh);
    const loading = vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockResolvedValue(gltf(scene));
    const value = await loadPilotModel('/fixture-no-skin.glb'); const bounds = new Box3().setFromObject(value.scene); const size = bounds.getSize(new Vector3());
    expect(loading).toHaveBeenCalledWith('/fixture-no-skin.glb');
    expect(value.skinned).toBe(false); expect(value.stats.meshes).toBe(1); expect(value.stats.triangles).toBe(12);
    expect(size.y).toBeCloseTo(1.7, 6); expect(bounds.min.y).toBeCloseTo(0, 6); expect(bounds.getCenter(new Vector3()).x).toBeCloseTo(0, 6);
    expect(value.scene.rotation.y).toBe(0); // +z source heading is preserved.
    value.dispose();
  });

  it('loads and detects a skinned fixture without requiring clips', async () => {
    const scene = new Group(); const geometry = new BoxGeometry(1, 1, 1);
    geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Array(geometry.attributes['position']!.count * 4).fill(0), 4));
    const weights = new Array(geometry.attributes['position']!.count * 4).fill(0); for (let offset = 0; offset < weights.length; offset += 4) weights[offset] = 1;
    geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
    const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial()); const bone = new Bone(); mesh.add(bone); mesh.bind(new Skeleton([bone])); scene.add(mesh);
    vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockResolvedValue(gltf(scene));
    const value = await loadPilotModel('/fixture-skin.glb'); expect(value.skinned).toBe(true); expect(value.stats.skinnedMeshes).toBe(1); expect(value.clips).toEqual([]); value.dispose();
  });

  it('turns a mapped humanoid front to +z before centering', () => {
    const scene = new Group(); const mesh = new Mesh(new BoxGeometry(1, 2, 1), new MeshBasicMaterial()); scene.add(mesh);
    const hips = new Bone(); hips.name = 'mixamorig:Hips'; const head = new Bone(); head.name = 'mixamorig:Head'; head.position.set(0, 1, 0);
    const left = new Bone(); left.name = 'mixamorig:LeftShoulder'; left.position.set(0, 0, -1);
    const right = new Bone(); right.name = 'mixamorig:RightShoulder'; right.position.set(0, 0, 1); scene.add(hips, head, left, right);
    normalizePilotScene(scene);
    const across = left.getWorldPosition(new Vector3()).sub(right.getWorldPosition(new Vector3()));
    const upright = head.getWorldPosition(new Vector3()).sub(hips.getWorldPosition(new Vector3()));
    expect(across.cross(upright).normalize().z).toBeGreaterThan(.999); mesh.geometry.dispose(); mesh.material.dispose();
  });

  it('rejects zero-height input before dividing by scale', () => {
    const scene = new Group(); expect(() => normalizePilotScene(scene)).toThrow('PILOT_GLTF_ZERO_HEIGHT');
  });

  it('counts and disposes the original base texture exactly once', () => {
    const scene = new Group(); const texture = { isTexture: true, dispose: vi.fn() };
    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial()); mesh.material.map = texture as never; scene.add(mesh);
    const value = preparePilotModel(gltf(scene)); expect(value.stats.textures).toBe(1); value.dispose(); value.dispose(); expect(texture.dispose).toHaveBeenCalledOnce();
  });
});
