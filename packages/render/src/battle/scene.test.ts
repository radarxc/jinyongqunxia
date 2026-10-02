// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  motions: [] as number[],
  rigSet: { placeholderCount: 39, dispose: vi.fn() },
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    autoClear = true;
    private pixelRatio = 1;
    readonly info = {
      autoReset: true,
      render: { calls: 0, triangles: 0 },
      reset: () => {
        this.info.render.calls = 0;
        this.info.render.triangles = 0;
      },
    };
    setClearColor() {}
    setPixelRatio(value: number) {
      this.pixelRatio = value;
    }
    getPixelRatio() {
      return this.pixelRatio;
    }
    setSize() {}
    clear() {}
    clearDepth() {}
    render(scene: Three.Scene) {
      this.info.render.calls += scene.children.some((child) => 'isInstancedMesh' in child) ? 3 : 1;
    }
    dispose() {}
  }
  class HeadlessRaycaster {
    setFromCamera() {}
    intersectObject() {
      return [{ distance: 1, instanceId: 0 }];
    }
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer, Raycaster: HeadlessRaycaster };
});
vi.mock('../rig/manifest', () => ({ loadRigSet: vi.fn(async () => fake.rigSet) }));
vi.mock('../rig/placeholder', () => ({ createPlaceholderRigManifest: vi.fn(() => ({})) }));
vi.mock('../rig/character', () => ({
  createRigCharacter: vi.fn((_set, equipment) => ({
    activeInstanceCount: 16,
    equipment,
    setEquipment: vi.fn(async () => undefined),
    setPosition: vi.fn(),
    setMotion: vi.fn((direction: number) => fake.motions.push(direction)),
    update: vi.fn(),
    snapshot: vi.fn(),
    dispose: vi.fn(),
    writeInstances: vi.fn(),
  })),
}));
vi.mock('../rig/batch', () => ({
  RigBatch: class {
    readonly coreMesh = { dispose: vi.fn() };
    readonly stats = { characters: 0, activeInstances: 0 };
    addTo() {}
    add() {
      this.stats.characters += 1;
      this.stats.activeInstances += 16;
    }
    remove() {
      this.stats.characters -= 1;
      this.stats.activeInstances -= 16;
    }
    sync() {}
    dispose() {}
  },
}));

import { chooseBattleCell, createBattleRenderer } from './scene';
import { hexDirToRig } from './index';
import type { BattleCell, BattleMarker } from './types';

const cells: readonly BattleCell[] = [
  { q: 0, r: 0, height: 0, terrain: 'tr_pingdi', label: '甲', color: 0 },
  { q: 1, r: 0, height: 0, terrain: 'tr_pingdi', label: '乙', color: 0 },
];
const marker: BattleMarker = {
  id: 'hero',
  index: 0,
  q: 0,
  r: 0,
  height: 0,
  facing: 0,
  equipment: {},
  active: true,
};

beforeEach(() => {
  fake.motions.length = 0;
  vi.clearAllMocks();
});
describe('battle scene selection', () => {
  it('keeps the legacy yaw-45 logical-facing mapping', () => {
    expect([0, 1, 2, 3, 4, 5].map((value) => hexDirToRig(value as 0, 45))).toEqual([
      7, 6, 4, 3, 2, 0,
    ]);
  });
  it('chooses the nearest projected centre and then stable row and column', () => {
    expect(
      chooseBattleCell(
        cells,
        [
          { instanceId: 0, screenX: -0.3, screenY: 0 },
          { instanceId: 1, screenX: 0.1, screenY: 0 },
        ],
        { x: 0.04, y: 0 },
      ),
    ).toBe(cells[1]);
    expect(
      chooseBattleCell(
        cells,
        [
          { instanceId: 1, screenX: 0.1, screenY: 0 },
          { instanceId: 0, screenX: -0.1, screenY: 0 },
        ],
        { x: 0, y: 0 },
      ),
    ).toBe(cells[0]);
  });
});

describe('battle camera', () => {
  it('rotates to yaw 135, updates Dir8, blocks picking, and renders four draws', async () => {
    const renderer = await createBattleRenderer(document.createElement('canvas'), cells);
    renderer.resize(320, 180);
    renderer.updateUnits([marker]);
    renderer.render(100);
    expect(renderer.stats.drawCalls).toBe(4);
    expect(fake.motions.at(-1)).toBe(7);
    const completed = renderer.camera.rotate(1);
    renderer.render(100);
    expect(renderer.camera.rotating).toBe(true);
    expect(renderer.pick(10, 10)).toBeNull();
    renderer.render(449);
    expect(renderer.camera.rotating).toBe(true);
    renderer.render(450);
    await completed;
    expect(renderer.camera.yawDeg).toBe(135);
    expect(fake.motions.at(-1)).toBe(5);
    renderer.render(599);
    expect(renderer.pick(10, 10)).toBeNull();
    renderer.render(600);
    expect(renderer.pick(10, 10)).toBe(cells[0]);
    renderer.dispose();
  });

  it('anchors the reduced-motion 150 ms pick guard to the next frame', async () => {
    const renderer = await createBattleRenderer(document.createElement('canvas'), cells);
    renderer.resize(320, 180);
    renderer.updateUnits([marker]);
    await renderer.camera.rotate(1, true);
    expect(renderer.camera).toMatchObject({ yawDeg: 135, rotating: false });
    expect(renderer.pick(10, 10)).toBeNull();
    renderer.render(10_000);
    renderer.render(10_149);
    expect(renderer.pick(10, 10)).toBeNull();
    renderer.render(10_150);
    expect(renderer.pick(10, 10)).toBe(cells[0]);
    renderer.dispose();
  });
});
