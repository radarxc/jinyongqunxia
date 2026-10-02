// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { BattleEvent } from '@tianshu/core';
import type { BattleMarker } from '@tianshu/render/battle';
import type { VfxPlayRequest } from '@tianshu/render/vfx';
import { bindBattleVfx, classifyVfxAccents } from './vfx';
import type { BattleController } from './controller';

const marker = (id: string): BattleMarker => ({ id, index: id === 'actor' ? 0 : 1, q: 0, r: 0, height: 0,
  facing: 0, equipment: {}, active: true, qiNature: id === 'actor' ? 'yin' : 'neutral' });

describe('battle VFX bridge', () => {
  it('maps settled events to concise additive accents without recomputing combat', () => {
    const events = [
      { t: 'battle/damageResolved', actionNo: 1 },
      { t: 'combat.qiRepel', actionNo: 1 },
      { t: 'battle/outwardQiCancelled', actionNo: 1 },
      { t: 'battle/foreignQiInjected', actionNo: 1 },
      { t: 'battle/acupointOccupied', actionNo: 1 },
    ] satisfies BattleEvent[];
    expect(classifyVfxAccents(events, 10)).toEqual(['hit', 'repel', 'foreign-qi', 'acupoint']);
    expect(classifyVfxAccents([], 8)).toEqual(['hit']);
  });

  it('forwards move, coordinates, actor nature and result to one lazy stage', async () => {
    let hook: Parameters<BattleController['onMoveResolved']>[0] | undefined;
    const controller = { onMoveResolved: vi.fn(callback => { hook = callback; return () => undefined; }) } as unknown as BattleController;
    const play = vi.fn(async (_request: VfxPlayRequest) => ({ durationMs: 600, fallback: false }));
    const stage = { play, dispose: vi.fn(), resize: vi.fn(), render: vi.fn(), setProjector: vi.fn(),
      stats: { active: 0, pooled: 0, textures: 0, fallbacks: 0 } };
    const importStage = vi.fn(async () => ({ createBattleVfxStage: () => stage }));
    const onDuration = vi.fn(); const onReady = vi.fn();
    const snapshot = { image: document.createElement('canvas'), sizePx: [30, 50] as const, centerOffsetPx: [0, -20] as const };
    const snapshotActor = vi.fn(() => snapshot);
    const off = bindBattleVfx(controller, document.createElement('canvas'), { importStage, onDuration, onReady,
      reducedMotion: () => false, snapshotActor });
    hook!('mv_test', marker('actor'), [marker('target')], { actionNo: 2, hpDamage: 7,
      events: [{ t: 'battle/damageResolved', actionNo: 2, target: 'target' },
        { t: 'battle/foreignQiInjected', actionNo: 2, target: 'target' }] });
    await vi.waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(play).toHaveBeenCalledWith(expect.objectContaining({ moveId: 'mv_test', nature: 'yin',
      from: expect.objectContaining({ id: 'actor' }), targets: [expect.objectContaining({ id: 'target' })],
      actorSnapshot: expect.any(Function),
      accents: ['hit', 'foreign-qi'], accentTargets: { hit: expect.objectContaining({ id: 'target' }),
        'foreign-qi': expect.objectContaining({ id: 'target' }) } }));
    expect(onDuration).toHaveBeenCalledWith(600);
    expect(onReady).toHaveBeenCalledWith(stage);
    const request = play.mock.calls[0]![0]; expect(request.actorSnapshot?.()).toBe(snapshot);
    expect(snapshotActor).toHaveBeenCalledWith('actor');
    off();
    expect(stage.dispose).toHaveBeenCalledOnce();
  });

  it('retries a transient lazy chunk failure on the next move', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    let hook: Parameters<BattleController['onMoveResolved']>[0] | undefined;
    const controller = { onMoveResolved: vi.fn(callback => { hook = callback; return () => undefined; }) } as unknown as BattleController;
    const play = vi.fn(async () => ({ durationMs: 320, fallback: false }));
    const stage = { play, dispose: vi.fn(), resize: vi.fn(), render: vi.fn(), setProjector: vi.fn(),
      stats: { active: 0, pooled: 0, textures: 0, fallbacks: 0 } };
    const importStage = vi.fn()
      .mockRejectedValueOnce(new Error('chunk unavailable'))
      .mockResolvedValue({ createBattleVfxStage: () => stage });
    const onPending = vi.fn(); const onDuration = vi.fn();
    bindBattleVfx(controller, document.createElement('canvas'), { importStage, onPending, onDuration });
    const result = { actionNo: 1, hpDamage: 0, events: [] };
    hook!('mv_first', marker('actor'), [marker('target')], result);
    await vi.waitFor(() => expect(warning).toHaveBeenCalledTimes(1));
    expect(onPending).toHaveBeenCalledOnce(); expect(onDuration).toHaveBeenLastCalledWith(600);
    hook!('mv_second', marker('actor'), [marker('target')], result);
    await vi.waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(importStage).toHaveBeenCalledTimes(2);
    expect(onPending).toHaveBeenCalledTimes(2); expect(onDuration).toHaveBeenLastCalledWith(320);
    warning.mockRestore();
  });
});
