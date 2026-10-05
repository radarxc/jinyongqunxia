import { TICK_MS } from '@tianshu/core';
import type { GameUpdate } from './runtime/contracts';

export const MAX_TICKS_PER_FRAME = 5;
export const MAX_FRAME_DELTA_MS = 250;

export interface WorldTickAccumulatorOptions {
  readonly tick: () => Promise<GameUpdate>;
  readonly shouldRun: () => boolean;
  readonly timeScale?: () => 0 | 1 | 2 | 4;
}
export interface WorldTickAccumulator {
  frame(now: number): Promise<number>;
  reset(): void;
}

/** Wall-clock adapter only. Core receives one command per accepted fixed step, never dt. */
export function createWorldTickAccumulator(
  options: WorldTickAccumulatorOptions,
): WorldTickAccumulator {
  let last: number | null = null;
  let accumulated = 0;
  let pending = false;
  function reset(): void {
    last = null;
    accumulated = 0;
  }
  async function frame(now: number): Promise<number> {
    if (!Number.isFinite(now)) throw new TypeError('LOOP_TIME_INVALID');
    if (last === null) { last = now; return 0; }
    const elapsed = Math.max(0, Math.min(now - last, MAX_FRAME_DELTA_MS));
    last = now;
    if (!options.shouldRun() || pending) { accumulated = 0; return 0; }
    const scale = options.timeScale?.() ?? 1;
    if (![0, 1, 2, 4].includes(scale)) throw new TypeError('LOOP_TIME_SCALE_INVALID');
    accumulated += elapsed * scale;
    const available = Math.floor(accumulated / TICK_MS);
    if (available === 0) return 0;
    const count = Math.min(available, MAX_TICKS_PER_FRAME);
    accumulated -= count * TICK_MS;
    if (accumulated >= TICK_MS) accumulated = 0;
    pending = true;
    let accepted = 0;
    try {
      for (let index = 0; index < count; index += 1) {
        if (!options.shouldRun()) { accumulated = 0; break; }
        const update = await options.tick();
        if (!update.accepted) {
          if (update.error === 'WORLD_PAUSED') { accumulated = 0; break; }
          throw new Error(update.error || 'WORLD_TICK_REJECTED');
        }
        accepted += 1;
      }
    } finally {
      pending = false;
    }
    return accepted;
  }
  return { frame, reset };
}

export interface GameLoop {
  start(): void;
  stop(): void;
  reset(): void;
}
export function createGameLoop(
  options: WorldTickAccumulatorOptions & { readonly onError: (error: unknown) => void },
): GameLoop {
  const accumulator = createWorldTickAccumulator(options);
  let running = false;
  let frameId = 0;
  const frame = (now: number): void => {
    if (!running) return;
    frameId = requestAnimationFrame(frame);
    void accumulator.frame(now).catch((error: unknown) => {
      stop();
      options.onError(error);
    });
  };
  function start(): void {
    if (running) return;
    running = true; accumulator.reset(); frameId = requestAnimationFrame(frame);
  }
  function stop(): void {
    if (!running) return;
    running = false; cancelAnimationFrame(frameId); accumulator.reset();
  }
  return { start, stop, reset: accumulator.reset };
}
