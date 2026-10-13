// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  modelLoads: [] as Array<{ url: string; heightM: number; options: unknown }>,
  characters: [] as Array<{ positions: Array<readonly [number, number, number]>;
    update: (dt: number) => void }>,
  renderedScene: undefined as Three.Scene | undefined,
  rejectModel: false,
}));
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    readonly info = { render: { calls: 0, triangles: 0 } };
    private pixelRatio = 1;
    setClearColor() {} setSize() {} dispose() {}
    setPixelRatio(value: number) { this.pixelRatio = value; }
    getPixelRatio() { return this.pixelRatio; }
    render(scene: Three.Scene) { fake.renderedScene = scene; }
  }
  class LoadedTexture {
    loadAsync() { const texture = new actual.Texture();
      texture.image = { width: 2, height: 3 }; return Promise.resolve(texture); }
  }
  return { ...actual, TextureLoader: LoadedTexture, WebGLRenderer: HeadlessRenderer };
});
vi.mock('./geometry', async () => {
  const { Group, Texture } = await import('three');
  return {
    loadTownAtlas: vi.fn(async () => ({ texture: new Texture(), cells: new Map(),
      ownedImages: [], dispose: vi.fn() })),
    createTownGeometry: vi.fn(() => ({ group: new Group(), groundChunks: [],
      groundInstances: 1, buildingInstances: 0, setBuildingFocus: vi.fn(), dispose: vi.fn() })),
  };
});
vi.mock('../gltf/load', async () => {
  const { Group } = await import('three');
  return { loadPilotModel: vi.fn(async (url: string, heightM: number, options: unknown) => {
    fake.modelLoads.push({ url, heightM, options });
    if (fake.rejectModel) throw new Error('MODEL_FAILED');
    return { scene: new Group(), clips: [], setToon: vi.fn(), dispose: vi.fn() };
  }) };
});

import { createTownScene } from './scene';
import type { TownRuntimeView, TownSceneProjection } from './types';

function v1ZoomRatio(pxPerMetre: number, viewportHeightPx: number): number {
  return pxPerMetre * 18 / viewportHeightPx;
}

const town: TownRuntimeView = {
  cityId: 'city_test', displayName: '测试城', grid: { width: 1, height: 1, chunkCells: 32 },
  assets: { tile: { baseUrl: '/tile/', entries: [] }, building: { baseUrl: '/building/', entries: [] } },
  groundPalette: [], groundRuns: [], edgeTiles: [], navigation: { nodes: [[0, 0, 0, 'flat']] },
  buildings: [],
};
const projection: TownSceneProjection = {
  actor: { point: [0, 0], walking: false, equipment: {} },
  npcs: [{ npcId: 'npc_test', point: [0, 0], equipment: {}, interactive: true }],
  anchors: [], activeBuildingId: null, buildingPhase: 'outside',
};
function runtime() {
  const rigSet = { dispose: vi.fn() };
  return { loadRigSet: vi.fn(async () => rigSet), createPlaceholderRigManifest: vi.fn(() => ({})),
    createRigCharacter: vi.fn(() => {
      const value = { rigSet, activeInstanceCount: 1, equipment: {},
        positions: [] as Array<readonly [number, number, number]>,
        setPosition: vi.fn((...position: [number, number, number]) => value.positions.push(position)),
        setMotion: vi.fn(), setEquipment: vi.fn(async () => undefined), update: vi.fn(),
        dispose: vi.fn(), writeInstances: vi.fn() };
      fake.characters.push(value); return value;
    }),
    RigBatch: class { readonly stats = { activeInstances: 0 };
      addTo() {} add() {} remove() {} sync() {} dispose() {} },
    weightClassForEquipment: vi.fn(() => 'medium'),
  };
}

beforeEach(() => { fake.modelLoads.length = 0; fake.characters.length = 0;
  fake.renderedScene = undefined; fake.rejectModel = false; vi.clearAllMocks(); });

describe('town actor stature', () => {
  it('keeps final camera zoom within 0.5 px/m at both v1 exploration endpoints', async () => {
    const scene = await createTownScene(document.createElement('canvas'), town, { projection,
      loadRigRuntime: async () => runtime() as never });
    const camera = scene.camera as Three.OrthographicCamera;
    for (const height of [360, 640, 720, 1080, 1440]) for (const target of [40, 112]) {
      scene.setZoom(v1ZoomRatio(target, height));
      scene.resize(800, height);
      const actual = height / (camera.top - camera.bottom);
      expect(Math.abs(actual - target), `${height}px at ${target}px/m`).toBeLessThanOrEqual(0.5);
    }
    scene.dispose();
  });

  it('uses requested player/NPC heights and hides the rig once the GLB is ready', async () => {
    const scene = await createTownScene(document.createElement('canvas'), town, { projection,
      playerHeightM: 1.72, npcHeightM: 1.58, spriteFor: () => '/actor.png',
      loadRigRuntime: async () => runtime() as never });
    await Promise.resolve();
    expect(fake.modelLoads).toEqual([{
      url: '/assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb',
      heightM: 1.72, options: { stature: 'headTop' },
    }]);
    expect(fake.characters[0]!.positions).toContainEqual([0, -9999, 0]);
    const sprites = (scene.scene as Three.Scene).children
      .filter((child) => child.name === 'town-actor-sprite');
    expect(sprites.map((sprite) => sprite.scale.y)).toEqual([1.72, 1.58]);
    expect(sprites[0]!.visible).toBe(false);
    scene.resize(320, 180);
    expect(scene.writeViewGroundQuad(new Float32Array(8))).toBe(true);
    scene.dispose();
  });

  it('keeps actor gait and smooth movement when reduced motion is on (design/14)', async () => {
    const scene = await createTownScene(document.createElement('canvas'), town, { projection,
      spriteFor: () => null, loadRigRuntime: async () => runtime() as never });
    scene.render(1_000, true);
    scene.render(1_100, true);
    for (const character of fake.characters)
      expect(character.update).toHaveBeenLastCalledWith(expect.closeTo(0.1, 6));
    scene.dispose();
  });

  it('keeps the player rig visible as fallback when GLB loading fails', async () => {
    fake.rejectModel = true;
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const scene = await createTownScene(document.createElement('canvas'), town, { projection,
      playerHeightM: 1.81, spriteFor: () => null, loadRigRuntime: async () => runtime() as never });
    expect(fake.characters[0]!.positions).not.toContainEqual([0, -9999, 0]);
    expect(error).toHaveBeenCalledWith('createTownScene loadPilotModel failed:', expect.any(Error));
    scene.dispose();
  });
});
