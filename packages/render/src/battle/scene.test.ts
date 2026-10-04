// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({
  motions: [] as number[],
  rigSet: { placeholderCount: 39, texture: { needsUpdate: false }, dispose: vi.fn() },
  position: vi.fn(),
  render: vi.fn(),
  context: { isContextLost: vi.fn(() => false) },
  forceContextLoss: vi.fn(),
  coreMeshDispose: vi.fn(),
  modelStageDispose: vi.fn(),
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
    getContext() { return fake.context; }
    clear() {}
    clearDepth() {}
    render(scene: Three.Scene) {
      fake.render(scene);
      this.info.render.calls += scene.children.some((child) => 'isInstancedMesh' in child) ? 3 : 1;
    }
    forceContextLoss() { fake.forceContextLoss(); }
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
    setPosition: fake.position,
    setMotion: vi.fn((direction: number) => fake.motions.push(direction)),
    update: vi.fn(),
    snapshot: vi.fn(),
    dispose: vi.fn(),
    writeInstances: vi.fn(),
  })),
}));
vi.mock('../rig/batch', () => ({
  RigBatch: class {
    readonly coreMesh = { dispose: fake.coreMeshDispose };
    readonly stats = { characters: 0, activeInstances: 0 };
    private readonly members = new Set<unknown>();
    addTo() {}
    add(character: unknown) {
      if (this.members.has(character)) return; this.members.add(character);
      this.stats.characters += 1;
      this.stats.activeInstances += 16;
    }
    remove(character: unknown) {
      if (!this.members.delete(character)) return;
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
    renderer.setHighlights({ selected: null, ready: '0,0', reachable: ['1,0'],
      path: ['0,0', '1,0'], ghost: '1,0', area: [] });
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

  it('releases the rig core mesh and the WebGL context exactly once', async () => {
    const renderer = await createBattleRenderer(document.createElement('canvas'), cells);
    renderer.dispose();
    renderer.dispose();
    expect(fake.coreMeshDispose).toHaveBeenCalledOnce();
    expect(fake.forceContextLoss).toHaveBeenCalledOnce();
  });

  it('keeps the 2D rig visible when lazy 3D loading fails', async () => {
    const renderer = await createBattleRenderer(document.createElement('canvas'), cells, {
      loadModelStage: async () => { throw new Error('offline'); },
    });
    renderer.updateUnits([{ ...marker, model: { key: 'fixture', kind: 'generic', gender: 'male',
      heightM: 1.7, modelUrl: '/missing.glb' } }]);
    renderer.render(100);
    expect(renderer.stats).toMatchObject({ characters: 1, modelCharacters: 0, modelFailures: 0 });
    renderer.dispose();
  });

  it('hides only successfully loaded models and disposes their lazy stage', async () => {
    let changed: (() => void) | undefined;
    const modeled = new Set<string>();
    const renderer = await createBattleRenderer(document.createElement('canvas'), cells, {
      loadModelStage: async () => ({ createBattleModelStage: (_scene, options) => {
        changed = options?.changed;
        return { stats: { characters: 0, drawCalls: 0, failures: 0, moving: 0 },
          updateUnits: vi.fn(), update: vi.fn(), hasModel: (id: string) => modeled.has(id),
          position: vi.fn(() => false), restore: vi.fn(), dispose: fake.modelStageDispose };
      } }),
    });
    renderer.updateUnits([{ ...marker, model: { key: 'fixture', kind: 'generic', gender: 'male',
      heightM: 1.7, modelUrl: '/fixture.glb' } }]);
    await vi.waitFor(() => expect(changed).toBeTypeOf('function'));
    renderer.render(100);
    expect(renderer.stats.characters).toBe(1);
    modeled.add(marker.id); changed!(); renderer.render(100);
    expect(renderer.stats.characters).toBe(0);
    renderer.dispose(); expect(fake.modelStageDispose).toHaveBeenCalledOnce();
  });

  it('projects 2D units from their cell and 3D units from the live model position', async () => {
    let changed: (() => void) | undefined;
    const modelPosition = new (await import('three')).Vector3(Math.sqrt(3) * 2 / 3, 0.25, 0);
    const renderer = await createBattleRenderer(document.createElement('canvas'), cells, {
      loadModelStage: async () => ({ createBattleModelStage: (_scene, options) => {
        changed = options?.changed;
        return { stats: { characters: 0, drawCalls: 0, failures: 0, moving: 0 },
          updateUnits: vi.fn(), update: vi.fn(), hasModel: (id: string) => id === marker.id,
          position: vi.fn((id, out) => {
            if (id !== marker.id) return false; out.copy(modelPosition); return true;
          }), restore: vi.fn(), dispose: fake.modelStageDispose };
      } }),
    });
    renderer.resize(320, 180);
    const fallback = { ...marker, id: 'fallback', index: 1 };
    renderer.updateUnits([{ ...marker, model: { key: 'fixture', kind: 'generic', gender: 'male',
      heightM: 1.7, modelUrl: '/fixture.glb' } }, fallback]);
    await vi.waitFor(() => expect(changed).toBeTypeOf('function'));
    const modeled = { x: 0, y: 0, visible: false };
    const rigged = { x: 0, y: 0, visible: false };
    renderer.projectUnit(marker.id, marker.q, marker.r, marker.height, modeled);
    renderer.projectUnit(fallback.id, fallback.q, fallback.r, fallback.height, rigged);
    const expectedModel = { x: 0, y: 0, visible: false };
    const expectedRig = { x: 0, y: 0, visible: false };
    renderer.project(1, 0, 1, expectedModel);
    renderer.project(fallback.q, fallback.r, fallback.height, expectedRig);
    expect(modeled).toEqual(expectedModel);
    expect(rigged).toEqual(expectedRig);
    renderer.dispose();
  });

  it('retains incoming unit projections while lost and keeps the night tint on recovery', async () => {
    const canvas = document.createElement('canvas');
    const requestFrame = vi.fn();
    const renderer = await createBattleRenderer(canvas, cells, { requestFrame });
    renderer.resize(320, 180);
    renderer.setTimeOfDay(0);
    renderer.updateUnits([marker]);
    renderer.render(100);
    const tintScene = fake.render.mock.calls.at(-1)![0] as Three.Scene;
    const tint = (tintScene.children[0] as Three.Mesh<Three.BufferGeometry, Three.ShaderMaterial>).material;
    const uniforms = tint.uniforms;
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    const renderCount = fake.render.mock.calls.length;
    renderer.updateUnits([{ ...marker, q: 1, facing: 1 }]);
    renderer.render(200);
    expect(fake.render.mock.calls).toHaveLength(renderCount);
    canvas.dispatchEvent(new Event('webglcontextrestored'));
    renderer.render(300);
    expect(fake.position).toHaveBeenLastCalledWith(expect.closeTo(Math.sqrt(3) * 2 / 3), 0.02, 0);
    expect(fake.motions.at(-1)).toBe(hexDirToRig(1, 45));
    expect(tint.uniforms).toBe(uniforms);
    expect(requestFrame).toHaveBeenCalledOnce();
    renderer.dispose();
  });
});
