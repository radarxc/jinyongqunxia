import { describe, expect, it, vi } from 'vitest';
import { VFX_COLORS, createBindingIndex, resolveMoveVfx } from './bindings';
import type { VfxBinding } from './types';

const rows: VfxBinding[] = [
  { move: 'mv_heaven', skill: 'sk_heaven', tier: 'tian', grade: 10, ultimate: false,
    projection: true, delivery: 'palm', nature: 'yang', mode: 'bespoke',
    suite: 'assets/default/vfx/sk_heaven/moves/mv_heaven/', emitter: 'palm', params: {} },
  { move: 'mv_earth', skill: 'sk_earth', tier: 'di', grade: 8, ultimate: false,
    projection: false, delivery: 'weapon', nature: 'yin', mode: 'bespoke',
    suite: 'assets/default/vfx/sk_earth/moves/mv_earth/', emitter: 'sword', params: {} },
  { move: 'mv_xuan_qi', skill: 'sk_xuan', tier: 'xuan', grade: 6, ultimate: false,
    projection: true, delivery: 'palm', nature: 'yin', mode: 'template',
    template: 'qi_projection', emitter: 'palm', params: { duration_s: 0.6 } },
  { move: 'mv_xuan_shadow', skill: 'sk_xuan', tier: 'xuan', grade: 5, ultimate: false,
    projection: false, delivery: 'movement', nature: 'neutral', mode: 'template',
    template: 'afterimage', emitter: 'afterimage', params: { duration_s: 0.48 } },
  { move: 'mv_yellow', skill: 'sk_yellow', tier: 'huang', grade: 2, ultimate: false,
    projection: false, delivery: 'weapon', nature: 'neutral', mode: 'template',
    template: 'plain_strike', emitter: 'sword', params: { duration_s: 0.32 } },
];

describe('move VFX bindings', () => {
  it('keeps Tian and Di bespoke while selecting both Xuan and Huang templates', async () => {
    const index = createBindingIndex(rows);
    const exists = vi.fn(async (url: string) => url.includes('sk_heaven'));
    await expect(resolveMoveVfx(index, 'mv_heaven', 'yang', exists)).resolves.toMatchObject({
      mode: 'bespoke', compositionUrl: '/assets/default/vfx/sk_heaven/moves/mv_heaven/composition.json', fallback: false,
    });
    await expect(resolveMoveVfx(index, 'mv_earth', 'yin', exists)).resolves.toMatchObject({
      mode: 'plain_strike', color: VFX_COLORS.yin, fallback: true, reason: 'composition-missing',
    });
    await expect(resolveMoveVfx(index, 'mv_xuan_qi', 'harmony', exists)).resolves.toMatchObject({
      mode: 'qi_projection', color: VFX_COLORS.harmony, durationMs: 600, fallback: false,
    });
    await expect(resolveMoveVfx(index, 'mv_xuan_shadow', 'neutral', exists)).resolves.toMatchObject({
      mode: 'afterimage', durationMs: 480, fallback: false,
    });
    await expect(resolveMoveVfx(index, 'mv_yellow', 'neutral', exists)).resolves.toMatchObject({
      mode: 'plain_strike', durationMs: 320, fallback: false,
    });
  });

  it('uses the actor nature for projected qi and logs an unknown move fallback once', async () => {
    const index = createBindingIndex(rows); const warn = vi.fn();
    expect(VFX_COLORS).toEqual({ yin: '#5FB5B0', yang: '#D9483B', harmony: '#E8D6A3', neutral: '#F4F4F4' });
    await expect(resolveMoveVfx(index, 'mv_xuan_qi', 'yang')).resolves.toMatchObject({ color: '#D9483B' });
    await expect(resolveMoveVfx(index, 'mv_unknown', undefined, undefined, warn)).resolves.toMatchObject({
      mode: 'plain_strike', color: '#F4F4F4', fallback: true, reason: 'binding-missing',
    });
    await resolveMoveVfx(index, 'mv_unknown', undefined, undefined, warn);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate or malformed bindings at the runtime boundary', () => {
    expect(() => createBindingIndex([...rows, rows[0]!])).toThrow(/duplicate/i);
    expect(() => createBindingIndex([{ ...rows[0]!, move: '../escape' }])).toThrow(/invalid/i);
  });
});
