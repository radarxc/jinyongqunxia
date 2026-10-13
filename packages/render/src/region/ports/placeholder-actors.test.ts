import { AnimationClip, Bone, BufferGeometry, Float32BufferAttribute, Group,
  MeshBasicMaterial, OrthographicCamera, Raycaster, Scene, Skeleton, SkinnedMesh, Vector3,
  Uint16BufferAttribute, type BufferAttribute } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { PilotModel } from '../../gltf/load';
import { createPlaceholderActorPort, gaitTimeScale } from './placeholder-actors';

function model(dispose = vi.fn()): PilotModel {
  const scene = new Group(); const root = new Bone(); root.name = 'hips';
  const head = new Bone(); head.name = 'HeadTop_End'; head.position.y = 1; root.add(head);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([-.1,0,0,.1,0,0,0,1,0],3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute([0,0,0,0,0,0,0,0,0,0,0,0],4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute([1,0,0,0,1,0,0,0,1,0,0,0],4));
  geometry.setIndex([0,1,2]); const mesh = new SkinnedMesh(geometry,new MeshBasicMaterial());
  mesh.name = 'body'; mesh.add(root); mesh.bind(new Skeleton([root,head])); scene.add(mesh);
  const clips = [new AnimationClip('idle',1,[]),new AnimationClip('walk',1,[]),new AnimationClip('run',1,[])];
  return { scene, skinned: true, clips, stats: { meshes: 1, skinnedMeshes: 1, triangles: 1,
    materialSlots: 1, textures: 0, joints: 1, drawCalls: 1, sourceHeightM: 1, scale: 1 },
    materials: {} as PilotModel['materials'], setToon() {}, setOutline() {}, dispose };
}
const look = { template: 'tpl_f_medium', heightM: 1.66, outfit: 'default', seed: 1,
  role: 'npc' as const };
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

describe('placeholder actor port', () => {
  it('parses one URL once for five NPC clones and scales head-top stature to 1.66 m', async () => {
    const scene = new Scene(); const loadModel = vi.fn(async () => model());
    const port = createPlaceholderActorPort({ scene, loadModel });
    for (let index = 0; index < 5; index += 1) port.spawn(`npc_${index}`, look);
    await vi.waitFor(() => expect(scene.getObjectByName('HeadTop_End')).toBeDefined());
    expect(loadModel).toHaveBeenCalledOnce(); expect(port.stats).toMatchObject({ actors: 5, templates: 1 });
    const actor = scene.getObjectByName('placeholder-actor:npc_0')!; actor.updateMatrixWorld(true);
    expect(actor.getObjectByName('HeadTop_End')!.getWorldPosition(new Vector3()).y).toBeCloseTo(1.66, 3);
    const meshes = [0,1,2,3,4].map(index =>
      scene.getObjectByName(`placeholder-actor:npc_${index}`)!.getObjectByName('body') as SkinnedMesh);
    expect(new Set(meshes.map(mesh => mesh.geometry)).size).toBe(1);
    expect(new Set(meshes.map(mesh => mesh.material)).size).toBe(1);
    expect(new Set(meshes.map(mesh => mesh.skeleton)).size).toBe(5);
    port.dispose();
  });

  it('moves at constant speed on adjacent frames and turns no faster than 540 degrees per second', async () => {
    const scene = new Scene(); const port = createPlaceholderActorPort({ scene, loadModel: async () => model() });
    port.spawn('npc', look); port.setPose('npc', 0,0,0,0,1,1); port.update(0, new OrthographicCamera());
    port.setPose('npc', 10,0,0,Math.PI,1,1); const actor = scene.getObjectByName('placeholder-actor:npc')!;
    port.update(.1, new OrthographicCamera()); const x1 = actor.position.x; const yaw1 = actor.rotation.y;
    port.update(.1, new OrthographicCamera()); const x2 = actor.position.x;
    expect(x1).toBeCloseTo(.1, 6); expect(x2-x1).toBeCloseTo(x1, 6);
    expect(Math.abs(yaw1)).toBeLessThanOrEqual(3*Math.PI*.1+1e-8); port.dispose();
  });

  it('uses the native height-per-second gait constants and clamps playback to 0.80-1.45', () => {
    expect(gaitTimeScale(1.35, 1.66, 1)).toBeCloseTo(1.35 / ((.6/.98)*1.66));
    expect(gaitTimeScale(.01, 1.66, 1)).toBe(.8); expect(gaitTimeScale(10, 1.66, 2)).toBe(1.45);
  });

  it('honours an explicit player model URL while preserving the one-parse cache', async () => {
    const scene = new Scene(); const loadModel = vi.fn(async () => model());
    const port = createPlaceholderActorPort({ scene, loadModel, playerModelUrl:'/custom/player.glb' });
    port.spawn('player',{ ...look, role:'player' }); await vi.waitFor(() => expect(loadModel).toHaveBeenCalled());
    expect(loadModel).toHaveBeenCalledWith('/custom/player.glb',1,{ stature:'headTop' }); port.dispose();
  });

  it('picks a height capsule and disposes a shared template only once', async () => {
    const scene = new Scene(); const dispose = vi.fn();
    const port = createPlaceholderActorPort({ scene, loadModel: async () => model(dispose) });
    port.spawn('npc', look); port.setPose('npc', 0,0,0,0,0,0); port.update(0, new OrthographicCamera()); await flush();
    const raycaster = new Raycaster(new Vector3(0, .8, 4), new Vector3(0,0,-1));
    expect(port.pick(raycaster)).toBe('npc'); port.dispose(); port.dispose(); expect(dispose).toHaveBeenCalledOnce();
  });

  it('restores shared geometry and every owned GPU resource once', async () => {
    const source = model(); const geometry = (source.scene.getObjectByName('body') as SkinnedMesh).geometry;
    const position = geometry.getAttribute('position') as BufferAttribute; const scene = new Scene();
    const port = createPlaceholderActorPort({ scene, loadModel: async () => source });
    port.spawn('npc', look); await vi.waitFor(() => expect(scene.getObjectByName('body')).toBeDefined());
    const shadow = scene.getObjectByName('placeholder-actor-shadows')! as SkinnedMesh;
    const shadowGeometry = vi.spyOn(shadow.geometry,'dispose');
    const shadowMaterial = vi.spyOn((shadow.material as MeshBasicMaterial),'dispose');
    const version = position.version; port.restore(); expect(position.version).toBe(version + 1);
    port.dispose(); port.dispose(); expect(shadowGeometry).toHaveBeenCalledOnce();
    expect(shadowMaterial).toHaveBeenCalledOnce(); expect(source.dispose).toHaveBeenCalledOnce();
  });
});
