// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  forceContextLoss: vi.fn(),
  context: { isContextLost: vi.fn(() => false) },
  rigSet: { texture: { needsUpdate: false }, dispose: vi.fn() },
  motions: [] as number[],
  scene: undefined as Three.Scene | undefined,
  camera: undefined as Three.Camera | undefined,
  deferEquipment: false,
  equipmentUpdates: [] as Array<{ resolve: () => void }>,
  modelLoads: [] as Array<{ url: string; heightM: number; options: unknown }>,
  deferModelUrl: '',
  modelResolves: [] as Array<{ url: string; resolve: () => void }>,
  modelDisposes: [] as Array<{ url: string; dispose: ReturnType<typeof vi.fn> }>,
  materialDisposes: [] as Array<{ url: string; dispose: ReturnType<typeof vi.fn> }>,
  textureDisposes: [] as Array<{ url: string; dispose: ReturnType<typeof vi.fn> }>,
  characterPositions: [] as Array<Array<readonly [number, number, number]>>,
}));
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    readonly info = {
      render: { calls: 0, triangles: 0 },
      reset: () => {
        this.info.render.calls = 0;
        this.info.render.triangles = 0;
      },
    };
    setClearColor() {}
    setPixelRatio() {}
    setSize() {}
    getContext() {
      return fake.context;
    }
    render(scene: Three.Scene, camera: Three.Camera) {
      fake.scene = scene;
      fake.camera = camera;
      this.info.render.calls = scene.children.length;
    }
    forceContextLoss() {
      fake.forceContextLoss();
    }
    dispose() {}
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});
vi.mock('../rig/manifest', () => ({ loadRigSet: vi.fn(async () => fake.rigSet) }));
vi.mock('../rig/placeholder', () => ({ createPlaceholderRigManifest: vi.fn(() => ({})) }));
vi.mock('../rig/character', () => ({
  createRigCharacter: vi.fn((_set, equipment) => {
    const positions: Array<readonly [number, number, number]> = [];
    fake.characterPositions.push(positions);
    return {
      activeInstanceCount: 1,
      equipment,
      setEquipment: vi.fn(() =>
        fake.deferEquipment
          ? new Promise<void>((resolve) => fake.equipmentUpdates.push({ resolve }))
          : Promise.resolve(),
      ),
      setPosition: vi.fn((...position: [number, number, number]) => positions.push(position)),
      setMotion: vi.fn((direction: number) => fake.motions.push(direction)),
      update: vi.fn(),
      dispose: vi.fn(),
      writeInstances: vi.fn(),
    };
  }),
}));
vi.mock('../rig/batch', () => ({
  RigBatch: class {
    readonly stats = { characters: 0, activeInstances: 0 };
    addTo() {}
    add() {
      this.stats.characters += 1;
      this.stats.activeInstances += 1;
    }
    sync() {}
    dispose() {}
  },
}));
vi.mock('../gltf/load', async () => {
  const { Group } = await import('three');
  return {
    loadPilotModel: vi.fn(async (url: string, heightM: number, options: unknown) => {
      fake.modelLoads.push({ url, heightM, options });
      const materialDispose = vi.fn();
      const textureDispose = vi.fn();
      let disposed = false;
      const dispose = vi.fn(() => {
        if (disposed) return;
        disposed = true;
        materialDispose();
        textureDispose();
      });
      fake.modelDisposes.push({ url, dispose });
      fake.materialDisposes.push({ url, dispose: materialDispose });
      fake.textureDisposes.push({ url, dispose: textureDispose });
      const model = { scene: new Group(), clips: [], setToon: vi.fn(), dispose };
      if (fake.deferModelUrl === url)
        await new Promise<void>((resolve) => fake.modelResolves.push({ url, resolve }));
      return model;
    }),
  };
});

import { DirectionalLight } from 'three';
import { createRegionScene } from './scene';
import { regionDynamicFixture, regionStaticFixture } from './test-fixture';

beforeEach(() => {
  fake.motions.length = 0;
  fake.scene = undefined;
  fake.camera = undefined;
  fake.deferEquipment = false;
  fake.equipmentUpdates.length = 0;
  fake.modelLoads.length = 0;
  fake.characterPositions.length = 0;
  fake.deferModelUrl = '';
  fake.modelResolves.length = 0;
  fake.modelDisposes.length = 0;
  fake.materialDisposes.length = 0;
  fake.textureDisposes.length = 0;
  vi.clearAllMocks();
});
describe('region camera and lifecycle', () => {
  it('does not load the legacy rig runtime after actor-port assembly', async () => {
    const loadRigRuntime = vi.fn(() => import('../rig/runtime'));
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(2, 1),
      { projection: regionDynamicFixture(), loadRigRuntime },
    );
    expect(loadRigRuntime).not.toHaveBeenCalled();
    scene.dispose();
  });

  it('uses the requested player look stature with the head-top actor port', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(2, 1),
      { projection: regionDynamicFixture(), playerLook: { template: 'tpl_f_medium', heightM: 1.66,
        outfit: 'default', seed: 1, role: 'player' } },
    );
    const url = '/assets/default/model3d/npc_zhujue__ch00_f/anim_idle_walk_run.glb';
    await vi.waitFor(() => expect(fake.modelLoads.some(load => load.url === url)).toBe(true));
    expect(fake.modelLoads.find(load => load.url === url)).toMatchObject({
      url,
      heightM: 1, options: { stature: 'headTop' },
    });
    scene.dispose();
  });

  it('disposes the shared actor template once across repeated scene disposal', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(2, 1),
      { projection: regionDynamicFixture() },
    );
    await vi.waitFor(() => expect(fake.modelDisposes).toHaveLength(1));
    scene.dispose();
    scene.dispose();
    expect(fake.modelDisposes[0]!.dispose).toHaveBeenCalledOnce();
    expect(fake.materialDisposes[0]!.dispose).toHaveBeenCalledOnce();
    expect(fake.textureDisposes[0]!.dispose).toHaveBeenCalledOnce();
  });

  it('disposes an actor template that finishes loading after its scene was destroyed', async () => {
    const url = '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb';
    fake.deferModelUrl = url;
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(2, 1),
      { projection: regionDynamicFixture() },
    );
    await vi.waitFor(() =>
      expect(fake.modelResolves.some((entry) => entry.url === url)).toBe(true),
    );
    scene.dispose();
    fake.modelResolves.find((entry) => entry.url === url)!.resolve();
    await vi.waitFor(() =>
      expect(fake.modelDisposes.find((entry) => entry.url === url)!.dispose).toHaveBeenCalledOnce(),
    );
    expect(
      fake.materialDisposes.find((entry) => entry.url === url)!.dispose,
    ).toHaveBeenCalledOnce();
    expect(fake.textureDisposes.find((entry) => entry.url === url)!.dispose).toHaveBeenCalledOnce();
  });

  it('forces yaw 45 in a locked CameraHint and restores authored rotation outside it', async () => {
    const base = regionStaticFixture(2, 1);
    const locked = {
      id: 'hint_locked',
      class: 'CameraHint',
      q: 0,
      r: 0,
      h: 0,
      cells: [{ q: 0, r: 0, h: 0 }],
      bounds: { q: 0, r: 0, width: 1, height: 1 },
      yawDeg: 315,
      allowRotation: false,
    } as const;
    const open = {
      id: 'hint_open',
      class: 'CameraHint',
      q: 1,
      r: 0,
      h: 0,
      cells: [{ q: 1, r: 0, h: 0 }],
      bounds: { q: 1, r: 0, width: 1, height: 1 },
      yawDeg: 135,
      allowRotation: true,
    } as const;
    const scene = await createRegionScene(
      document.createElement('canvas'),
      { ...base, objects: [locked, open] },
      { projection: regionDynamicFixture() },
    );
    expect(scene.camera).toMatchObject({ yawDeg: 45, allowRotation: false });
    await scene.camera.rotate(1, true);
    expect(scene.camera.yawDeg).toBe(45);
    await scene.update({ ...regionDynamicFixture(), playerHex: { q: 1, r: 0 } });
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });
    scene.render(16);
    const sun = fake.scene?.children.find((child) => child instanceof DirectionalLight);
    const before = sun?.position.clone().sub(sun.target.position);
    await scene.camera.rotate(1, true);
    expect(scene.camera.yawDeg).toBe(225);
    expect(sun?.position.clone().sub(sun.target.position).equals(before!)).toBe(false);
    scene.dispose();
    scene.dispose();
    expect(fake.forceContextLoss).toHaveBeenCalledOnce();
  });

  it('uploads at most two queued chunks in one frame', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(160, 1),
      { projection: regionDynamicFixture() },
    );
    expect(scene.stats).toMatchObject({ terrainChunks: 2, queuedChunks: 3 });
    scene.render(16);
    expect(scene.stats).toMatchObject({ terrainChunks: 4, queuedChunks: 1 });
    scene.dispose();
  });

  it('clamps px zoom, keeps the scale alias, and applies CameraHint relative to 80', async () => {
    const hint = {
      id: 'hint_zoom',
      class: 'CameraHint',
      q: 0,
      r: 0,
      h: 0,
      cells: [{ q: 0, r: 0, h: 0 }],
      bounds: { q: 0, r: 0, width: 1, height: 1 },
      zoom: 1.2,
    };
    const scene = await createRegionScene(
      document.createElement('canvas'),
      { ...regionStaticFixture(32, 32), objects: [hint] },
      { projection: regionDynamicFixture() },
    );
    scene.resize(1280, 720);
    scene.render(16);
    expect((fake.camera as Three.OrthographicCamera).right).toBeCloseTo(
      (1280 * Math.SQRT2) / 96 / 2,
    );
    scene.setZoomPx(200);
    scene.render(32);
    expect((fake.camera as Three.OrthographicCamera).right).toBeCloseTo(
      (1280 * Math.SQRT2) / 112 / 2,
    );
    scene.setZoom(0.5);
    scene.render(48);
    expect((fake.camera as Three.OrthographicCamera).right).toBeCloseTo(
      (1280 * Math.SQRT2) / 40 / 2,
    );
    scene.dispose();
  });

  it('eases over 200 ms and snaps an active animation when reduced motion turns on', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(32, 32),
      { projection: regionDynamicFixture() },
    );
    scene.resize(1280, 720);
    scene.render(1_000);
    scene.setZoomPx(40, true);
    scene.render(1_100);
    expect((fake.camera as Three.OrthographicCamera).right).toBeCloseTo(
      (1280 * Math.SQRT2) / 60 / 2,
    );
    scene.render(1_150, true);
    expect((fake.camera as Three.OrthographicCamera).right).toBeCloseTo(
      (1280 * Math.SQRT2) / 40 / 2,
    );
    scene.setZoomPx(96, true);
    expect((fake.camera as Three.OrthographicCamera).right).toBeCloseTo(
      (1280 * Math.SQRT2) / 96 / 2,
    );
    scene.dispose();
  });

  it('exposes basis and view quad and updates preallocated route and destination geometry', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(32, 32),
      { projection: regionDynamicFixture() },
    );
    scene.resize(1280, 720);
    const basis = new Float32Array(4);
    const quad = new Float32Array(8);
    scene.getCameraBasis(basis);
    scene.getViewGroundQuad(quad);
    expect(Math.hypot(basis[0]!, basis[1]!)).toBeCloseTo(1);
    expect(Math.hypot(quad[2]! - quad[0]!, quad[3]! - quad[1]!)).toBeCloseTo(22.6274, 2);
    scene.setPreviewPath([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 1, r: 1 },
    ]);
    scene.setDestination({ q: 1, r: 1 });
    scene.setInsideBuilding(1);
    scene.render(16);
    const route = fake.scene?.getObjectByName('region-preview-route') as Three.Mesh;
    expect(route.geometry.drawRange.count).toBe(24);
    expect(fake.scene?.getObjectByName('region-destination-flag')?.visible).toBe(true);
    scene.setPath([]);
    scene.setDestination(null);
    scene.setInsideBuilding(null);
    expect(route.visible).toBe(false);
    scene.dispose();
  });

  it.each([45, 135, 225, 315])(
    'matches the 1280x720 ground footprint after yaw %i',
    async (yaw) => {
      const hint = {
        id: `hint_${yaw}`,
        class: 'CameraHint',
        q: 0,
        r: 0,
        h: 0,
        cells: [{ q: 0, r: 0, h: 0 }],
        bounds: { q: 0, r: 0, width: 32, height: 32 },
        yawDeg: yaw,
      };
      const scene = await createRegionScene(
        document.createElement('canvas'),
        { ...regionStaticFixture(32, 32), objects: [hint] },
        { projection: regionDynamicFixture() },
      );
      scene.resize(1280, 720);
      const quad = new Float32Array(8);
      scene.getViewGroundQuad(quad);
      expect(Math.hypot(quad[2]! - quad[0]!, quad[3]! - quad[1]!)).toBeCloseTo(22.6274, 2);
      expect(Math.hypot(quad[6]! - quad[0]!, quad[7]! - quad[1]!)).toBeCloseTo(25.4558, 2);
      scene.dispose();
    },
  );

  it('dead-reckons the actor uniformly and snaps a stopped walk to the current hex centre', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(32, 32),
      { projection: regionDynamicFixture() },
    );
    scene.setWalk(
      {
        path: [
          { q: 0, r: 0 },
          { q: 1, r: 0 },
        ],
        progressMm: 0,
        stepMm: 1_155,
        mmPerTick: 135,
        destination: { q: 1, r: 0 },
      },
      1_000,
    );
    const player = () => fake.scene!.getObjectByName('placeholder-actor:player')!;
    scene.render(1_000);
    const x0 = player().position.x;
    scene.render(1_050);
    const x1 = player().position.x;
    scene.render(1_100);
    const x2 = player().position.x;
    expect(x1 - x0).toBeCloseTo(x2 - x1, 8);
    scene.setWalk(null, 1_100);
    scene.render(1_116);
    expect(player().position.x).toBeCloseTo(0);
    scene.dispose();
  });

  it('keeps the camera target fixed during a snapped quarter turn', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(32, 32),
      { projection: regionDynamicFixture() },
    );
    scene.resize(1280, 720);
    scene.render(16);
    const before = new Float32Array(8);
    scene.getViewGroundQuad(before);
    await scene.camera.rotate(1, true);
    const after = new Float32Array(8);
    scene.getViewGroundQuad(after);
    const center = (quad: Float32Array) => [
      (quad[0]! + quad[2]! + quad[4]! + quad[6]!) / 4,
      (quad[1]! + quad[3]! + quad[5]! + quad[7]!) / 4,
    ];
    const beforeCenter = center(before);
    const afterCenter = center(after);
    expect(afterCenter[0]).toBeCloseTo(beforeCenter[0]!, 5);
    expect(afterCenter[1]).toBeCloseTo(beforeCenter[1]!, 5);
    scene.dispose();
  });

  it('picks placeholder actor capsules by stable ids', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(32, 32),
      { projection: regionDynamicFixture() },
    );
    scene.resize(1280, 720);
    scene.render(16);
    const bounds = new DOMRect(0, 0, 1280, 720);
    const actorProjected = { x: 0, y: 0, visible: false };
    scene.project({ q: 0, r: 0 }, 0.8, actorProjected);
    expect(scene.pickActor(actorProjected.x, actorProjected.y, bounds)).toBe('player');
    expect(scene.pickBuilding(actorProjected.x, actorProjected.y, bounds)).toBeNull();
    scene.dispose();
  });

  it('disposes owned resources when a building port rejects', async () => {
    await expect(
      createRegionScene(document.createElement('canvas'), regionStaticFixture(2, 1), {
        projection: regionDynamicFixture(),
        buildingPort: { create: async () => { throw new Error('BUILDING_LOAD_FAILED'); } },
      }),
    ).rejects.toThrow('BUILDING_LOAD_FAILED');
    expect(fake.forceContextLoss).toHaveBeenCalledOnce();
  });

  it('ignores projection updates after disposal', async () => {
    const base = regionStaticFixture(2, 1);
    const locked = {
      id: 'hint_locked',
      class: 'CameraHint',
      q: 0,
      r: 0,
      h: 0,
      cells: [{ q: 0, r: 0, h: 0 }],
      bounds: { q: 0, r: 0, width: 1, height: 1 },
      yawDeg: 315,
      allowRotation: false,
    } as const;
    const open = {
      id: 'hint_open',
      class: 'CameraHint',
      q: 1,
      r: 0,
      h: 0,
      cells: [{ q: 1, r: 0, h: 0 }],
      bounds: { q: 1, r: 0, width: 1, height: 1 },
      yawDeg: 135,
      allowRotation: true,
    } as const;
    const scene = await createRegionScene(
      document.createElement('canvas'),
      { ...base, objects: [locked, open] },
      { projection: regionDynamicFixture() },
    );
    await scene.update({ ...regionDynamicFixture(), playerHex: { q: 1, r: 0 } });
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });
    scene.dispose();
    await scene.update({ ...regionDynamicFixture(), playerHex: { q: 0, r: 0 } });
    expect(scene.camera).toMatchObject({ yawDeg: 135, allowRotation: true });
  });
});
