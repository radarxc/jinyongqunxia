// @vitest-environment happy-dom
import { Session } from 'node:inspector/promises';
import { describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    readonly info = { render: { calls: 0, triangles: 0 }, reset() {} };
    setClearColor() {}
    setPixelRatio() {}
    setSize() {}
    render() {}
    dispose() {}
    forceContextLoss() {}
    getContext() {
      return { isContextLost: () => false };
    }
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});
vi.mock('../gltf/load', async () => {
  const { Group } = await import('three');
  return {
    loadPilotModel: vi.fn(async () => ({
      scene: new Group(),
      clips: [],
      setToon() {},
      dispose() {},
    })),
  };
});
vi.mock('../rig/manifest', () => ({
  loadRigSet: vi.fn(async () => ({
    texture: { needsUpdate: false },
    dispose() {},
  })),
}));
vi.mock('../rig/placeholder', () => ({ createPlaceholderRigManifest: vi.fn(() => ({})) }));
vi.mock('../rig/character', () => ({
  createRigCharacter: vi.fn((_set, equipment) => ({
    equipment,
    setEquipment: async () => {},
    setPosition() {},
    setMotion() {},
    update() {},
    dispose() {},
  })),
}));
vi.mock('../rig/batch', () => ({
  RigBatch: class {
    readonly stats = { activeInstances: 1 };
    addTo() {}
    add() {}
    sync() {}
    dispose() {}
  },
}));

import { createRegionScene } from './scene';
import { regionDynamicFixture, regionStaticFixture } from './test-fixture';

interface HeapNode {
  readonly selfSize: number;
  readonly callFrame: { readonly functionName: string; readonly url: string };
  readonly children: readonly HeapNode[];
}
interface AllocationDifference {
  readonly functionName: string;
  readonly bytes: number;
}
function addSubtreeBytes(node: HeapNode, result: Map<string, number>): void {
  const name = node.callFrame.functionName || '<anonymous>';
  result.set(name, (result.get(name) ?? 0) + node.selfSize);
  for (const child of node.children) addSubtreeBytes(child, result);
}
function subtreeBytes(
  node: HeapNode,
  matches: (node: HeapNode) => boolean,
): ReadonlyMap<string, number> {
  const result = new Map<string, number>();
  if (matches(node)) {
    addSubtreeBytes(node, result);
    return result;
  }
  for (const child of node.children) {
    const childResult = subtreeBytes(child, matches);
    for (const [name, bytes] of childResult) result.set(name, (result.get(name) ?? 0) + bytes);
  }
  return result;
}
function totalBytes(values: ReadonlyMap<string, number>): number {
  let total = 0;
  for (const bytes of values.values()) total += bytes;
  return total;
}
function allocationDifferences(
  before: ReadonlyMap<string, number>,
  after: ReadonlyMap<string, number>,
): readonly AllocationDifference[] {
  const names = new Set([...before.keys(), ...after.keys()]);
  return [...names]
    .map((functionName) => ({
      functionName,
      bytes: (after.get(functionName) ?? 0) - (before.get(functionName) ?? 0),
    }))
    .filter((value) => value.bytes !== 0)
    .sort((left, right) => right.bytes - left.bytes);
}
function sceneFrame(node: HeapNode): boolean {
  return (
    (node.callFrame.functionName === 'render' || node.callFrame.functionName === 'setWalk') &&
    node.callFrame.url.includes('/region/scene.ts')
  );
}
function shortLivedAllocationProbe(): number {
  const values: object[] = [];
  for (let index = 0; index < 10_000; index += 1)
    values.push({ index, payload: new Uint8Array(16) });
  return values.length;
}

describe('region steady frame allocations', () => {
  it('detects retained allocations below a matched frame root', async () => {
    const retained: Float32Array[] = [];
    function allocatingRenderProbe(): void {
      retained.push(new Float32Array(1_024));
    }
    const inspector = new Session();
    inspector.connect();
    await inspector.post('HeapProfiler.enable');
    await inspector.post('HeapProfiler.startSampling', { samplingInterval: 1 });
    await inspector.post('HeapProfiler.collectGarbage');
    const before = await inspector.post('HeapProfiler.getSamplingProfile');
    for (let index = 0; index < 600; index += 1) allocatingRenderProbe();
    const after = await inspector.post('HeapProfiler.getSamplingProfile');
    await inspector.post('HeapProfiler.stopSampling');
    inspector.disconnect();
    const matches = (node: HeapNode) => node.callFrame.functionName === 'allocatingRenderProbe';
    expect(retained).toHaveLength(600);
    expect(totalBytes(subtreeBytes(after.profile.head, matches))).toBeGreaterThan(
      totalBytes(subtreeBytes(before.profile.head, matches)),
    );
  });

  it('has a clean 600-frame render and setWalk sampling window after warmup', async () => {
    const scene = await createRegionScene(
      document.createElement('canvas'),
      regionStaticFixture(32, 32),
      { projection: regionDynamicFixture() },
    );
    const walk = {
      path: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
      ],
      progressMm: 0,
      stepMm: 1_155,
      mmPerTick: 135,
      destination: { q: 1, r: 0 },
    } as const;
    for (let index = 0; index < 2_000; index += 1) {
      scene.setWalk(walk, index * 100);
      scene.render(index * 100 + 50);
    }
    const inspector = new Session();
    inspector.connect();
    await inspector.post('HeapProfiler.enable');
    await inspector.post('HeapProfiler.startSampling', { samplingInterval: 1 });
    expect(shortLivedAllocationProbe()).toBe(10_000);
    await inspector.post('HeapProfiler.collectGarbage');
    let previous = await inspector.post('HeapProfiler.getSamplingProfile');
    let cleanStreak = 0;
    let lastDirtyWindow = 0;
    let lastDifferences: readonly AllocationDifference[] = [];
    for (let window = 0; window < 20 && cleanStreak < 3; window += 1) {
      for (let index = 0; index < 600; index += 1) {
        const time = (window * 600 + index + 2_000) * 100;
        scene.setWalk(walk, time);
        scene.render(time + 50);
      }
      const current = await inspector.post('HeapProfiler.getSamplingProfile');
      const beforeBytes = subtreeBytes(previous.profile.head, sceneFrame);
      const afterBytes = subtreeBytes(current.profile.head, sceneFrame);
      if (totalBytes(afterBytes) === totalBytes(beforeBytes)) cleanStreak += 1;
      else {
        cleanStreak = 0;
        lastDirtyWindow = window + 1;
        lastDifferences = allocationDifferences(beforeBytes, afterBytes);
      }
      previous = current;
    }
    const after = await inspector.post('HeapProfiler.getSamplingProfile');
    await inspector.post('HeapProfiler.stopSampling');
    inspector.disconnect();
    scene.dispose();
    expect(
      totalBytes(
        subtreeBytes(
          after.profile.head,
          (node) => node.callFrame.functionName === 'shortLivedAllocationProbe',
        ),
      ),
    ).toBeGreaterThan(0);
    const detail = lastDifferences
      .slice(0, 8)
      .map((value) => `${value.functionName}=${value.bytes > 0 ? '+' : ''}${value.bytes} B`)
      .join(', ');
    expect(cleanStreak, `last dirty window ${lastDirtyWindow}: ${detail || 'none'}`).toBe(3);
  }, 20_000);
});
