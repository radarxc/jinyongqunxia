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
  rigSet: { dispose: vi.fn() },
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
    }
    getPixelRatio() {
      return this.pixelRatio;
    }
    setSize() {}
    render(scene: Three.Scene) {
      this.renders += 1;
      this.scene = scene;
      this.info.render.calls = 7;
    }
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
});
