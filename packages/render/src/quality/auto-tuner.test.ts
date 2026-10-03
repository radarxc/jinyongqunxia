import { describe, expect, it, vi } from 'vitest';
import { AutoTuner } from './auto-tuner';

function sampleWindow(
  tuner: AutoTuner,
  startMs: number,
  intervalMs: number,
  workMs: number,
  count = 30,
): number {
  let time = startMs;
  for (let index = 0; index < count; index += 1) {
    time += intervalMs;
    tuner.sample(intervalMs, workMs, time);
  }
  return time;
}

describe('AutoTuner', () => {
  it('waits for stable windows, steps by 0.05, and never raises quality', () => {
    const tuner = new AutoTuner('high', 16.7);
    tuner.setStableSince(0);
    let time = sampleWindow(tuner, 2_000, 25, 7);
    expect(tuner.renderScale).toBe(0.95);
    time = sampleWindow(tuner, time, 18, 7);
    expect(tuner.renderScale).toBe(0.95);
    time = sampleWindow(tuner, time, 18, 7);
    expect(tuner.renderScale).toBe(0.9);
    sampleWindow(tuner, time + 500, 16, 5);
    expect(tuner.renderScale).toBe(0.9);
  });

  it('recognizes a 30 fps vblank ceiling and does not lower tier or scale', () => {
    const drop = vi.fn();
    const tuner = new AutoTuner('high', 16.7);
    tuner.onTierDropRequested(drop);
    tuner.setStableSince(0);
    sampleWindow(tuner, 2_000, 33.3, 5, 60);
    expect(tuner.detectedFpsCeiling).toBe(30);
    expect(tuner.renderScale).toBe(1);
    expect(drop).not.toHaveBeenCalled();
  });

  it('requests a lower tier after five seconds over budget at the tier floor', () => {
    const drop = vi.fn();
    const tuner = new AutoTuner('high', 16.7, { initialScale: 0.75 });
    tuner.onTierDropRequested(drop);
    tuner.setStableSince(0);
    let time = 2_000;
    for (let window = 0; window < 11; window += 1)
      time = sampleWindow(tuner, time + 500, 24, 7);
    expect(drop).toHaveBeenCalledExactlyOnceWith('mid');
    expect(tuner.renderScale).toBe(0.75);
  });

  it('reports CPU overload at 30 fps without cutting resolution', () => {
    const tuner = new AutoTuner('high', 16.7);
    sampleWindow(tuner, 2_000, 33.3, 15, 120);
    expect(tuner.lastDecision).toBe('cpu-shed');
    expect(tuner.renderScale).toBe(1);
  });

  it('does not hide long frames among a majority of 30 fps intervals', () => {
    const tuner = new AutoTuner('high', 16.7);
    let time = 2_000;
    for (let index = 0; index < 180; index += 1) {
      const interval = index % 5 === 0 ? 60 : 33.3;
      time += interval;
      tuner.sample(interval, 5, time);
    }
    expect(tuner.renderScale).toBeLessThan(1);
  });

  it('stops scaling after a failed pixel experiment', () => {
    const tuner = new AutoTuner('high', 16.7);
    sampleWindow(tuner, 2_000, 25, 7, 240);
    expect(tuner.renderScale).toBe(0.95);
  });

  it('uses work time to shed CPU cost even when the display keeps pace', () => {
    const tuner = new AutoTuner('high', 16.7);
    sampleWindow(tuner, 2_000, 16.7, 14, 120);
    expect(tuner.lastDecision).toBe('cpu-shed');
    expect(tuner.renderScale).toBe(1);
  });

  it('ignores loading, hidden and waking samples and waits for stable dimensions', () => {
    const tuner = new AutoTuner('high', 16.7);
    for (const state of [{ loading: true }, { visible: false }, { waking: true }])
      tuner.sample(80, 5, 3_000, state);
    sampleWindow(tuner, 3_000, 25, 5, 29);
    expect(tuner.renderScale).toBe(1);
    tuner.setStableSince(4_000);
    sampleWindow(tuner, 4_000, 25, 5, 60);
    expect(tuner.renderScale).toBe(1);
    sampleWindow(tuner, 5_500, 25, 5, 30);
    expect(tuner.renderScale).toBe(0.95);
  });

  it('reuses fixed buffers when tiers change and preserves the session FPS ceiling', () => {
    const tuner = new AutoTuner('high', 16.7);
    const buffers = Object.values(tuner).filter(ArrayBuffer.isView);
    sampleWindow(tuner, 2_000, 33.3, 5, 90);
    tuner.setTier('mid', 0.75, 5_000);
    expect(tuner.renderScale).toBe(0.75);
    expect(tuner.detectedFpsCeiling).toBe(30);
    expect(Object.values(tuner).filter(ArrayBuffer.isView)).toEqual(buffers);
    sampleWindow(tuner, 5_000, 16.7, 5, 300);
    expect(tuner.renderScale).toBe(0.75);
  });

  it('keeps a manual lock while still detecting a system FPS ceiling', () => {
    const tuner = new AutoTuner('high', 16.7);
    tuner.setLocked(true);
    sampleWindow(tuner, 2_000, 25, 5, 180);
    expect(tuner.renderScale).toBe(1);
    tuner.setStableSince(7_000);
    sampleWindow(tuner, 7_000, 33.3, 5, 90);
    expect(tuner.detectedFpsCeiling).toBe(30);
    expect(tuner.renderScale).toBe(1);
  });

  it('updates the frame budget on a tier change without repeated low-tier drops', () => {
    const drop = vi.fn();
    const tuner = new AutoTuner('high', 16.7);
    tuner.onTierDropRequested(drop);
    tuner.setTier('low', 0.7, 0);
    expect(tuner.budgetMs).toBeCloseTo(1_000 / 30);
    sampleWindow(tuner, 2_000, 25, 5, 180);
    expect(drop).not.toHaveBeenCalled();
    sampleWindow(tuner, 7_000, 44, 5, 240);
    expect(drop).not.toHaveBeenCalled();
    expect(tuner.renderScale).toBe(0.7);
  });
});
