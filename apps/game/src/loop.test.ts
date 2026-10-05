import { describe, expect, it, vi } from 'vitest';
import { createWorldTickAccumulator } from './loop';
import type { GameUpdate } from './runtime/contracts';

function accepted(): GameUpdate {
  return { accepted: true, changes: {}, events: [] };
}

describe('10 Hz world tick accumulator', () => {
  it('emits exactly ten fixed ticks for one second', async () => {
    let ticks = 0;
    const loop = createWorldTickAccumulator({ shouldRun: () => true,
      tick: async () => { ticks += 1; return accepted(); } });
    await loop.frame(0);
    for (let time = 100; time <= 1_000; time += 100) await loop.frame(time);
    expect(ticks).toBe(10);
  });

  it('drops hidden wall time and performs no catch-up after resume (W-02)', async () => {
    let visible = true; let ticks = 0;
    const loop = createWorldTickAccumulator({ shouldRun: () => visible,
      tick: async () => { ticks += 1; return accepted(); } });
    await loop.frame(0); await loop.frame(100); visible = false;
    await loop.frame(1_800_100); visible = true;
    await loop.frame(1_800_200);
    expect(ticks).toBe(2);
  });

  it('caps one frame at five ticks and discards remaining backlog', async () => {
    let ticks = 0;
    const loop = createWorldTickAccumulator({ shouldRun: () => true,
      timeScale: () => 4, tick: async () => { ticks += 1; return accepted(); } });
    await loop.frame(0); expect(await loop.frame(250)).toBe(5);
    expect(await loop.frame(250)).toBe(0);
    expect(ticks).toBe(5);
  });

  it('applies backpressure and never overlaps host tick requests', async () => {
    let release: ((value: GameUpdate) => void) | undefined; let calls = 0;
    const tick = vi.fn(() => { calls += 1; return new Promise<GameUpdate>((resolve) => { release = resolve; }); });
    const loop = createWorldTickAccumulator({ shouldRun: () => true, tick });
    await loop.frame(0); const pending = loop.frame(100);
    await Promise.resolve(); expect(calls).toBe(1);
    expect(await loop.frame(350)).toBe(0);
    release!(accepted()); expect(await pending).toBe(1);
    const next = loop.frame(450); await Promise.resolve(); release!(accepted());
    expect(await next).toBe(1);
  });

  it('stops the batch on core WORLD_PAUSED rejection', async () => {
    let calls = 0;
    const loop = createWorldTickAccumulator({ shouldRun: () => true, tick: async () => {
      calls += 1; return calls === 2 ? { accepted: false, changes: {}, events: [],
        error: 'WORLD_PAUSED' } : accepted();
    } });
    await loop.frame(0); expect(await loop.frame(250)).toBe(1); expect(calls).toBe(2);
  });
});
