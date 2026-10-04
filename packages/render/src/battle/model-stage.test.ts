import { performance } from 'node:perf_hooks';
import { AnimationClip, Bone, BoxGeometry, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial,
  QuaternionKeyframeTrack, Scene, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { PilotModel } from '../gltf/load';
import { battleModelSpeed, createBattleModelStage, retargetBattleClips } from './model-stage';
import type { BattleMarker } from './types';

function fixtureModel(): PilotModel {
  const root = new Group(); const mesh = new Mesh(new BoxGeometry(1, 1.7, 1), new MeshBasicMaterial());
  root.add(mesh);
  return { scene: root, skinned: false,
    clips: ['idle', 'walk', 'run'].map(name => new AnimationClip(name, 1, [])),
    stats: { meshes: 1, skinnedMeshes: 0, triangles: 12, materialSlots: 1, textures: 0,
      joints: 0, drawCalls: 1, sourceHeightM: .98, scale: 1.7 / .98 },
    materials: { meshes: [mesh] }, dispose: vi.fn(), setToon: vi.fn(), setOutline: vi.fn(),
  } as unknown as PilotModel;
}
function animatedFixture(): PilotModel {
  const root = new Group(); const geometry = new BoxGeometry(1, 1.7, 1);
  const count = geometry.attributes['position']!.count;
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Array(count * 4).fill(0), 4));
  const weights = new Array(count * 4).fill(0);
  for (let offset = 0; offset < weights.length; offset += 4) weights[offset] = 1;
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial()); const bones: Bone[] = [];
  for (let index = 0; index < 65; index += 1) {
    const bone = new Bone(); bone.name = index === 0 ? 'mixamorigHips' : `mixamorigBone${index}`;
    bone.position.y = index === 0 ? .5 : .01;
    (bones[index - 1] ?? mesh).add(bone); bones.push(bone);
  }
  mesh.bind(new Skeleton(bones)); root.add(mesh);
  const clips = ['idle', 'walk', 'run'].map(name => new AnimationClip(name, 1, bones.map((bone, index) =>
    new QuaternionKeyframeTrack(`${bone.name}.quaternion`, [0, 1],
      [0, 0, 0, 1, 0, Math.sin((index + 1) * .0005), 0, Math.cos((index + 1) * .0005)]))));
  return { scene: root, skinned: true, clips,
    stats: { meshes: 1, skinnedMeshes: 1, triangles: 12, materialSlots: 1, textures: 0,
      joints: 65, drawCalls: 1, sourceHeightM: .98, scale: 1.7 / .98 },
    materials: { meshes: [mesh] }, dispose: vi.fn(), setToon: vi.fn(), setOutline: vi.fn(),
  } as unknown as PilotModel;
}
function marker(id: string, q: number): BattleMarker {
  return { id, index: Number(id.slice(1)), q, r: 0, height: 0, facing: 0, equipment: {},
    active: true, model: { key: 'npc_generic_m', kind: 'generic', gender: 'male', heightM: 1.7,
      modelUrl: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb',
      animationUrl: '/assets/default/model3d/npc_generic_m/anim_idle_walk_run.glb' } };
}
function skinnedFixture(boneY: number): { root: Group; hip: Bone; child: Bone } {
  const root = new Group(); const geometry = new BoxGeometry(1, 1, 1);
  const count = geometry.attributes['position']!.count;
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Array(count * 4).fill(0), 4));
  const weights = new Array(count * 4).fill(0);
  for (let offset = 0; offset < weights.length; offset += 4) weights[offset] = 1;
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial());
  const hip = new Bone(); hip.name = 'mixamorigHips'; hip.position.y = boneY;
  const child = new Bone(); child.name = 'mixamorigSpine'; child.position.y = boneY / 2;
  hip.add(child); mesh.add(hip); mesh.bind(new Skeleton([hip, child])); root.add(mesh);
  return { root, hip, child };
}
async function loaded(stage: ReturnType<typeof createBattleModelStage>, count: number): Promise<void> {
  await vi.waitFor(() => expect(stage.stats.characters).toBe(count));
}
function p95(samples: Float64Array): number {
  samples.sort(); return samples[Math.floor(samples.length * .95)] ?? 0;
}

describe('battle 3D model stage', () => {
  it('retargets motion clips to the dedicated skeleton and preserves its bone length', () => {
    const target = skinnedFixture(2); const source = skinnedFixture(1);
    const clip = new AnimationClip('walk', 1, [new QuaternionKeyframeTrack(
      'mixamorigHips.quaternion', [0, 1], [0, 0, 0, 1, 0, .707, 0, .707])]);
    const [mapped] = retargetBattleClips(target.root, source.root, [clip]);
    expect(mapped?.tracks.some(track => track.name ===
      '.bones[mixamorigHips].quaternion')).toBe(true);
    expect(target.hip.position.y).toBe(2); expect(target.child.position.y).toBe(1);
    expect(source.hip.quaternion.equals(new Bone().quaternion)).toBe(true);
  });

  it('caches one decoded model while clones share geometry and material', async () => {
    const source = fixtureModel(); const loadModel = vi.fn(async () => source); const scene = new Scene();
    const stage = createBattleModelStage(scene, { loadModel });
    stage.updateUnits([marker('u0', 0), marker('u1', 1)]); await loaded(stage, 2);
    expect(loadModel).toHaveBeenCalledOnce(); expect(stage.stats.drawCalls).toBe(2);
    const roots = scene.children.filter(child => child instanceof Group) as Group[];
    const meshes = roots.map(root => root.children[0]!.children[0] as Mesh);
    expect(meshes[0]!.geometry).toBe(meshes[1]!.geometry);
    expect(meshes[0]!.material).toBe(meshes[1]!.material);
    stage.dispose(); expect(source.dispose).toHaveBeenCalledOnce();
  });

  it('moves one-height-scaled character at measured in-place walk/run speeds', async () => {
    expect(battleModelSpeed('walk', 1.7)).toBeCloseTo(0.6 * 1.7 / .98);
    expect(battleModelSpeed('run', 1.62)).toBeCloseTo(2.1 * 1.62 / .98);
    const stage = createBattleModelStage(new Scene(), { loadModel: async () => fixtureModel() });
    stage.updateUnits([marker('u0', 0)]); await loaded(stage, 1);
    stage.updateUnits([marker('u0', 1)]); stage.update(.1, false);
    const walk = new Vector3(); expect(stage.position('u0', walk)).toBe(true);
    expect(new Vector3(walk.x, 0, walk.z).length())
      .toBeCloseTo(battleModelSpeed('walk', 1.7) * .1, 5);
    stage.updateUnits([marker('u0', 3)]); const before = walk.clone(); stage.update(.1, false);
    stage.position('u0', walk); expect(walk.distanceTo(before))
      .toBeCloseTo(battleModelSpeed('run', 1.7) * .1, 5);
    stage.dispose();
  });

  it('records a load failure without claiming a 3D instance', async () => {
    const stage = createBattleModelStage(new Scene(), { loadModel: async () => { throw new Error('404'); } });
    stage.updateUnits([marker('u0', 0)]);
    await vi.waitFor(() => expect(stage.stats.failures).toBe(1));
    expect(stage.hasModel('u0')).toBe(false); expect(stage.stats.characters).toBe(0); stage.dispose();
  });

  it.each([6, 12])('reports %i model draw calls and keeps CPU animation updates in budget',
    async count => {
      const stage = createBattleModelStage(new Scene(), { loadModel: async () => animatedFixture() });
      stage.updateUnits(Array.from({ length: count }, (_, index) => marker(`u${index}`, index)));
      await loaded(stage, count); expect(stage.stats.drawCalls).toBe(count);
      stage.updateUnits(Array.from({ length: count }, (_, index) => marker(`u${index}`, index + 100)));
      for (let frame = 0; frame < 120; frame += 1) stage.update(1 / 60, false);
      const samples = new Float64Array(600);
      for (let frame = 0; frame < samples.length; frame += 1) {
        const start = performance.now(); stage.update(1 / 60, false);
        samples[frame] = performance.now() - start;
      }
      const cpuP95 = p95(samples);
      process.stdout.write(`[battle-model-perf] units=${count} structuralDrawCalls=${stage.stats.drawCalls} ` +
        `cpuUpdateP95=${cpuP95.toFixed(3)}ms (Node, no WebGL)\n`);
      expect(cpuP95).toBeLessThan(16.67); stage.dispose();
    });
});
