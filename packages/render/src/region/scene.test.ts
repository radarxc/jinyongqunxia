// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  forceContextLoss: vi.fn(), context: { isContextLost: vi.fn(() => false) },
  rigSet: { texture: { needsUpdate: false }, dispose: vi.fn() },
  motions: [] as number[], scene: undefined as Three.Scene | undefined,
  deferEquipment: false, equipmentUpdates: [] as Array<{ resolve: () => void }>,
}));
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    readonly info = { render: { calls: 0, triangles: 0 }, reset: () => {
      this.info.render.calls = 0; this.info.render.triangles = 0; } };
    setClearColor() {} setPixelRatio() {} setSize() {}
    getContext() { return fake.context; }
    render(scene: Three.Scene) { fake.scene = scene; this.info.render.calls = scene.children.length; }
    forceContextLoss() { fake.forceContextLoss(); } dispose() {}
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});
vi.mock('../rig/manifest', () => ({ loadRigSet: vi.fn(async () => fake.rigSet) }));
vi.mock('../rig/placeholder', () => ({ createPlaceholderRigManifest: vi.fn(() => ({})) }));
vi.mock('../rig/character', () => ({ createRigCharacter: vi.fn((_set, equipment) => ({
  activeInstanceCount: 1, equipment, setEquipment: vi.fn(() => fake.deferEquipment
    ? new Promise<void>((resolve) => fake.equipmentUpdates.push({ resolve })) : Promise.resolve()),
  setPosition: vi.fn(), setMotion: vi.fn((direction: number) => fake.motions.push(direction)),
  update: vi.fn(), dispose: vi.fn(), writeInstances: vi.fn(),
})) }));
vi.mock('../rig/batch', () => ({ RigBatch: class {
  readonly stats = { characters: 0, activeInstances: 0 };
  addTo() {} add() { this.stats.characters += 1; this.stats.activeInstances += 1; }
  sync() {} dispose() {}
} }));

import { DirectionalLight } from 'three';
import { createRegionScene } from './scene';
import { regionDynamicFixture, regionStaticFixture } from './test-fixture';

beforeEach(() => { fake.motions.length = 0; fake.scene = undefined; fake.deferEquipment = false;
  fake.equipmentUpdates.length = 0; vi.clearAllMocks(); });
describe('region camera and lifecycle', () => {
  it('forces yaw 45 in a locked CameraHint and restores authored rotation outside it', async () => {
    const base = regionStaticFixture(2, 1);
    const locked = { id: 'hint_locked', class: 'CameraHint', q: 0, r: 0, h: 0,
      cells: [{ q: 0, r: 0, h: 0 }], bounds: { q: 0, r: 0, width: 1, height: 1 },
      yawDeg: 315, allowRotation: false } as const;
    const open = { id: 'hint_open', class: 'CameraHint', q: 1, r: 0, h: 0,
      cells: [{ q: 1, r: 0, h: 0 }], bounds: { q: 1, r: 0, width: 1, height: 1 },
      yawDeg: 135, allowRotation: true } as const;
    const scene = await createRegionScene(document.createElement('canvas'),
      { ...base, objects: [locked, open] }, { projection: regionDynamicFixture() });
    expect(scene.camera).toMatchObject({ yawDeg: 45, allowRotation: false });
    await scene.camera.rotate(1, true); expect(scene.camera.yawDeg).toBe(45);
    await scene.update({ ...regionDynamicFixture(), playerHex: { q: 1, r: 0 } });
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });
    scene.render(16);
    const sun = fake.scene?.children.find((child) => child instanceof DirectionalLight);
    const before = sun?.position.clone().sub(sun.target.position);
    await scene.camera.rotate(1, true);
    expect(scene.camera.yawDeg).toBe(225);
    expect(sun?.position.clone().sub(sun.target.position).equals(before!)).toBe(false);
    scene.dispose(); scene.dispose(); expect(fake.forceContextLoss).toHaveBeenCalledOnce();
  });

  it('uploads at most two queued chunks in one frame', async () => {
    const scene = await createRegionScene(document.createElement('canvas'), regionStaticFixture(160, 1),
      { projection: regionDynamicFixture() });
    expect(scene.stats).toMatchObject({ terrainChunks: 2, queuedChunks: 3 });
    scene.render(16);
    expect(scene.stats).toMatchObject({ terrainChunks: 4, queuedChunks: 1 });
    scene.dispose();
  });

  it('disposes owned resources when rig loading rejects', async () => {
    const { loadRigSet } = await import('../rig/manifest');
    vi.mocked(loadRigSet).mockRejectedValueOnce(new Error('RIG_LOAD_FAILED'));
    await expect(createRegionScene(document.createElement('canvas'), regionStaticFixture(2, 1),
      { projection: regionDynamicFixture() })).rejects.toThrow('RIG_LOAD_FAILED');
    expect(fake.forceContextLoss).toHaveBeenCalledOnce();
  });

  it('ignores stale and post-dispose asynchronous projection updates', async () => {
    const base = regionStaticFixture(2, 1);
    const locked = { id: 'hint_locked', class: 'CameraHint', q: 0, r: 0, h: 0,
      cells: [{ q: 0, r: 0, h: 0 }],
      bounds: { q: 0, r: 0, width: 1, height: 1 }, yawDeg: 315, allowRotation: false } as const;
    const open = { id: 'hint_open', class: 'CameraHint', q: 1, r: 0, h: 0,
      cells: [{ q: 1, r: 0, h: 0 }],
      bounds: { q: 1, r: 0, width: 1, height: 1 }, yawDeg: 135, allowRotation: true } as const;
    const scene = await createRegionScene(document.createElement('canvas'),
      { ...base, objects: [locked, open] }, { projection: regionDynamicFixture() });
    fake.deferEquipment = true;
    const stale = scene.update({ ...regionDynamicFixture(), playerHex: { q: 0, r: 0 } });
    const latest = scene.update({ ...regionDynamicFixture(), playerHex: { q: 1, r: 0 } });
    expect(fake.equipmentUpdates).toHaveLength(2);
    fake.equipmentUpdates[1]!.resolve(); await latest;
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });
    fake.equipmentUpdates[0]!.resolve(); await stale;
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });

    const afterDispose = scene.update({ ...regionDynamicFixture(), playerHex: { q: 0, r: 0 } });
    scene.dispose(); fake.equipmentUpdates[2]!.resolve(); await afterDispose;
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });
  });
});
