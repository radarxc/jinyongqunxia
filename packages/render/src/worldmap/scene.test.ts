// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  renderer: undefined as
    | {
        clearColor: Three.Color;
        scene?: Three.Scene;
        renders: number;
        info: { render: { calls: number } };
      }
    | undefined,
  rigSet: { texture: { needsUpdate: false }, dispose: vi.fn() },
  context: { isContextLost: vi.fn(() => false) },
  forceContextLoss: vi.fn(),
  coreMeshDispose: vi.fn(),
  pixelRatios: [] as number[],
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    private pixelRatio = 1;
    clearColor = new actual.Color();
    scene?: Three.Scene;
    renders = 0;
    readonly info = { render: { calls: 0, triangles: 0 } };
    constructor() {
      fake.renderer = this;
    }
    setClearColor(value: Three.Color | number) {
      this.clearColor.copy(value instanceof actual.Color ? value : new actual.Color(value));
    }
    setPixelRatio(value: number) {
      this.pixelRatio = value;
      fake.pixelRatios.push(value);
    }
    getPixelRatio() {
      return this.pixelRatio;
    }
    setSize() {}
    getContext() { return fake.context; }
    render(scene: Three.Scene) {
      this.renders += 1;
      this.scene = scene;
      this.info.render.calls = 7;
    }
    forceContextLoss() { fake.forceContextLoss(); }
    dispose() {}
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});
vi.mock('../rig/manifest', () => ({ loadRigSet: vi.fn(async () => fake.rigSet) }));
vi.mock('../rig/placeholder', () => ({ createPlaceholderRigManifest: vi.fn(() => ({})) }));
vi.mock('../rig/character', () => ({
  createRigCharacter: vi.fn(() => ({
    activeInstanceCount: 16,
    setEquipment: vi.fn(async () => undefined),
    setPosition: vi.fn(),
    setMotion: vi.fn(),
    update: vi.fn(),
    dispose: vi.fn(),
  })),
}));
vi.mock('../rig/batch', () => ({
  RigBatch: class {
    readonly coreMesh = { dispose: fake.coreMeshDispose };
    addTo() {}
    add() {}
    sync() {}
    dispose() {}
  },
}));

import { SRGBColorSpace } from 'three';
import { createWorldMapScene } from './scene';
import type { MapGeometryView } from './types';

const map: MapGeometryView = {
  grid: { width: 10, height: 10 },
  nodes: [{ id: 'city_a', name: '甲城', kind: 'town', point: [5, 5], open: true }],
  roads: [],
  terrain: {
    land: [
      [
        [0, 0],
        [9, 0],
        [9, 9],
      ],
    ],
    rivers: [],
    mountains: [],
  },
};

beforeEach(() => {
  fake.renderer = undefined;
  fake.pixelRatios.length = 0;
  vi.clearAllMocks();
});

describe('world map time of day', () => {
  it('updates existing lights and clear color without another pass', async () => {
    const world = await createWorldMapScene(document.createElement('canvas'), map, {
      actor: { point: [5, 5], walking: false, equipment: {} },
    });
    world.setTimeOfDay(0);
    world.render(16);
    const scene = fake.renderer?.scene;
    const ambient = scene?.children.find((child) => child.type === 'AmbientLight') as
      Three.AmbientLight | undefined;
    const sun = scene?.children.find((child) => child.type === 'DirectionalLight') as
      Three.DirectionalLight | undefined;
    expect(fake.renderer?.clearColor.getHexString(SRGBColorSpace)).toBe('2a3140');
    expect(ambient?.intensity).toBeCloseTo(0.35 * 2.8);
    expect(sun?.intensity).toBeCloseTo(0.25 * 2.2);
    expect(fake.renderer?.renders).toBe(1);
    expect(world.stats.drawCalls).toBe(7);
    world.dispose();
  });

  it('releases the rig core mesh and the WebGL context exactly once', async () => {
    const world = await createWorldMapScene(document.createElement('canvas'), map, {
      actor: { point: [5, 5], walking: false, equipment: {} },
    });
    world.dispose();
    world.dispose();
    expect(fake.coreMeshDispose).toHaveBeenCalledOnce();
    expect(fake.forceContextLoss).toHaveBeenCalledOnce();
  });

  it('does not compound render scale when zoom triggers a resize', async () => {
    const quality = { tier: 'low' as const, renderScale: 0.7, effectivePixelRatio: (dpr: number) => dpr * 0.7 };
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, { clientWidth: { value: 320 }, clientHeight: { value: 180 } });
    const world = await createWorldMapScene(canvas, map, {
      actor: { point: [5, 5], walking: false, equipment: {} }, quality,
    });
    world.resize(320, 180, 2);
    world.setZoom(1.5);
    expect(fake.pixelRatios.at(-1)).toBeCloseTo(1.4);
    world.dispose();
  });

  it('pauses on context loss, restores night lighting and discards the wake interval', async () => {
    const canvas = document.createElement('canvas');
    const sample = vi.fn();
    const requestFrame = vi.fn();
    const quality = { tier: 'mid' as const, renderScale: 0.9, effectivePixelRatio: () => 1.35, sample };
    const world = await createWorldMapScene(canvas, map, {
      actor: { point: [5, 5], walking: false, equipment: {} }, quality, requestFrame,
    });
    world.resize(320, 180, 3);
    world.setTimeOfDay(0);
    world.render(100);
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    world.render(200);
    expect(fake.renderer?.renders).toBe(1);
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    world.render(4_000);
    expect(world.stats.frameMs).toBe(0);
    expect(sample).not.toHaveBeenCalled();
    expect(fake.pixelRatios.at(-1)).toBe(1.35);
    expect(fake.renderer?.clearColor.getHexString(SRGBColorSpace)).toBe('2a3140');
    expect(requestFrame).toHaveBeenCalledOnce();
    world.dispose();
  });
});
