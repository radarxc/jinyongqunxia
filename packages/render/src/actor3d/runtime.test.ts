import { Session } from 'node:inspector/promises';
import { describe, expect, it } from 'vitest';
import { createActorPort } from './index';
import { gaitTimeScale, selectGait, stepActorYaw } from './gait';

interface HeapSampleNode {
  readonly selfSize: number;
  readonly callFrame: { readonly functionName: string; readonly url: string };
  readonly children: readonly HeapSampleNode[];
}

function sampledBytes(node: HeapSampleNode, matches: (node: HeapSampleNode) => boolean): number {
  let total = matches(node) ? node.selfSize : 0;
  for (const child of node.children) total += sampledBytes(child, matches);
  return total;
}

function runGaitHotPath(iterations: number): number {
  let value = 0;
  for (let index = 0; index < iterations; index += 1) {
    value += gaitTimeScale(1.35, 1.81, 0.612);
    value += selectGait(1, 2.4);
    value += stepActorYaw(0, Math.PI, 1 / 60);
  }
  return value;
}

const retainedProbe: object[] = [];
function heapProfilerProbe(): number {
  for (let index = 0; index < 10_000; index += 1)
    retainedProbe.push({ index, payload: new Uint8Array(16) });
  return retainedProbe.length;
}

describe('actor3d runtime boundaries', () => {
  it('keeps gait, playback, and turn-step hot paths allocation-free after warm-up', async () => {
    expect(runGaitHotPath(10_000)).toBeGreaterThan(0);
    const session = new Session();
    session.connect();
    try {
      await session.post('HeapProfiler.enable');
      await session.post('HeapProfiler.startSampling', { samplingInterval: 1 });
      expect(heapProfilerProbe()).toBeGreaterThan(0);
      let previous = await session.post('HeapProfiler.getSamplingProfile');
      let cleanWindows = 0;
      for (let window = 0; window < 10 && cleanWindows < 3; window += 1) {
        await Promise.resolve();
        expect(runGaitHotPath(10_000)).toBeGreaterThan(0);
        const current = await session.post('HeapProfiler.getSamplingProfile');
        const matchGait = (node: HeapSampleNode): boolean =>
          node.callFrame.url.includes('/actor3d/gait.ts');
        cleanWindows = sampledBytes(current.profile.head, matchGait)
          === sampledBytes(previous.profile.head, matchGait) ? cleanWindows + 1 : 0;
        previous = current;
      }
      expect(cleanWindows).toBe(3);
      expect(sampledBytes(previous.profile.head, node =>
        node.callFrame.functionName === 'heapProfilerProbe')).toBeGreaterThan(0);
      await session.post('HeapProfiler.stopSampling');
    } finally {
      session.disconnect();
      retainedProbe.length = 0;
    }
  });

  it('leaves the actor port implementation to a2 with an explicit error', () => {
    expect(() => createActorPort({} as never)).toThrow('ACTOR3D_NOT_IMPLEMENTED');
  });
});
