import { describe, expect, it, vi } from 'vitest';
import { VfxAssetStore } from './assets';
import type { VfxBinding, VfxComposition } from './types';

const bespoke: VfxBinding = { move: 'mv_xianglong18_kanglong', skill: 'sk_xianglong18', tier: 'tian',
  grade: 12, ultimate: false, projection: true, delivery: 'palm', nature: 'yang', mode: 'bespoke',
  suite: 'assets/default/vfx/sk_xianglong18/moves/mv_xianglong18_kanglong/', emitter: 'palm', params: {} };
const composition = { kind: 'Composition', version: 1, canvas_px: [100, 100], background: '#000000',
  emit_at_px: [10, 50], angle_deg: 0, range_hex: 1, pixels_per_hex: 10, scale: [1, 2], emitter_scale: 1,
  effect_set: 'effect/effect-set.yaml', emitter_plate: 'emitter/emitter-plate.yaml',
  rhythm: { charge_s: 0.1, release_s: 0.1, sustain_s: 0.3, dissipate_s: 0.1 },
  transition: { interpolation: 'crossfade', scale_from: 1, drift_fraction: 0, brightness: [1, 1, 1, 1, 1] },
  output: { fps: 20, loop: false, loop_gap_s: 0 },
} satisfies VfxComposition;
const catalog = { schema: 'tianshu-vfx-catalog.v1',
  palette: { yin: '#5FB5B0', yang: '#D9483B', harmony: '#E8D6A3', neutral: '#F4F4F4' },
  effects: { 'plain_strike/impact': { baseUrl: '/assets/default/vfx/templates/plain_strike/impact/',
    effect: { size_px: [10, 10], direction: [1, 0], reference_length_px: 10, root_width_px: 2, blend: 'normal',
      frames: [{ file: 'frame.png', anchor_px: [0, 5], phase: 0 }] } } }, emitters: {} };
const document = <T extends { schema: string }>(payload: T) => ({
  schemaVersion: 'event.v1', actions: [{ payload }],
});
const bindings = (rows: readonly VfxBinding[]) => document({ schema: 'tianshu-vfx-bindings.v1', bindings: rows });

describe('VFX asset store', () => {
  it('loads each JSON URL once and preserves the authored dragon 2x scale', async () => {
    const fetcher = vi.fn(async (url: string | URL | Request) => {
      const path = String(url); const value = path.endsWith('bindings.json') ? bindings([bespoke])
        : path.includes('/baseline/vfx/') ? composition : document(catalog);
      return new Response(JSON.stringify(value), { status: path.includes('/sk_xianglong18/') ? 404 : 200 });
    });
    const store = new VfxAssetStore({ fetch: fetcher as typeof fetch });
    const [first, second] = await Promise.all([store.load(bespoke.move, 'yang'), store.load(bespoke.move, 'yang')]);
    expect(first.composition.scale).toEqual([1, 2]); expect(first.resolved.fallback).toBe(true);
    expect(second.composition).toBe(first.composition);
    expect(fetcher.mock.calls.filter(([url]) => String(url).includes('/baseline/vfx/'))).toHaveLength(1);
  });

  it('uses a skill-level baseline after the move-level baseline is unavailable', async () => {
    const sixMeridians = { ...bespoke, move: 'mv_liumai_guanchong', skill: 'sk_liumai', nature: 'harmony' } as const;
    const fetcher = vi.fn(async (url: string | URL | Request) => {
      const path = String(url);
      if (path.endsWith('bindings.json')) return new Response(JSON.stringify(bindings([sixMeridians])));
      if (path === '/assets/default/baseline/vfx/sk_liumai/composition.json')
        return new Response(JSON.stringify(composition));
      return new Response('', { status: 404 });
    });
    const plan = await new VfxAssetStore({ fetch: fetcher as typeof fetch }).load(sixMeridians.move);
    expect(plan.resolved).toMatchObject({ mode: 'bespoke', fallback: true, reason: 'composition-missing',
      compositionUrl: '/assets/default/baseline/vfx/sk_liumai/composition.json' });
    expect(fetcher.mock.calls.map(([url]) => String(url))).toContain(
      '/assets/default/baseline/vfx/mv_liumai_guanchong/composition.json');
  });

  it('falls back to a neutral plain strike when no binding exists', async () => {
    const fetcher = vi.fn(async (url: string | URL | Request) => new Response(JSON.stringify(
      String(url).endsWith('bindings.json') ? bindings([]) : document(catalog))));
    const warn = vi.fn(); const plan = await new VfxAssetStore({ fetch: fetcher as typeof fetch, warn }).load('mv_missing');
    expect(plan.resolved).toMatchObject({ mode: 'plain_strike', durationMs: 320, fallback: true });
    expect(plan.composition.template?.color).toBe('#F4F4F4'); expect(warn).toHaveBeenCalledOnce();
  });

  it('uses the binding nature when the actor projection has none', async () => {
    const template: VfxBinding = { move: 'mv_template', skill: 'sk_test', tier: 'huang', grade: 1,
      ultimate: false, projection: false, delivery: 'fist', nature: 'yang', mode: 'template',
      template: 'plain_strike', emitter: null, params: { duration_s: 0.32 } };
    const fetcher = vi.fn(async (url: string | URL | Request) => new Response(JSON.stringify(
      String(url).endsWith('bindings.json') ? bindings([template]) : document(catalog))));
    const plan = await new VfxAssetStore({ fetch: fetcher as typeof fetch }).load('mv_template');
    expect(plan.resolved.color).toBe('#D9483B'); expect(plan.composition.template?.nature).toBe('yang');
  });

  it('leaves runtime actor-snapshot fallback accounting to the stage', async () => {
    const afterimage: VfxBinding = { move: 'mv_shadow', skill: 'sk_test', tier: 'xuan', grade: 7,
      ultimate: false, projection: false, delivery: 'inner', nature: 'yin', mode: 'template',
      template: 'afterimage', emitter: null, params: { duration_s: 0.48, copies: 4 } };
    const fetcher = vi.fn(async (url: string | URL | Request) => new Response(JSON.stringify(
      String(url).endsWith('bindings.json') ? bindings([afterimage]) : document(catalog))));
    const store = new VfxAssetStore({ fetch: fetcher as typeof fetch, warn: vi.fn() });
    const first = await store.load(afterimage.move);
    expect(first.resolved).toMatchObject({ mode: 'afterimage', fallback: false });
    expect(first.composition).toMatchObject({ effect: null, emitter: null });
  });

  it('evicts a rejected runtime request so a transient outage can recover', async () => {
    let attempt = 0;
    const fetcher = vi.fn(async (url: string | URL | Request) => {
      if (String(url).endsWith('bindings.json') && attempt++ === 0) return new Response('', { status: 503 });
      return new Response(JSON.stringify(String(url).endsWith('bindings.json')
        ? bindings([bespoke]) : composition));
    });
    const store = new VfxAssetStore({ fetch: fetcher as typeof fetch, warn: vi.fn() });
    await expect(store.load(bespoke.move, 'yang')).resolves.toMatchObject({ resolved: { fallback: true } });
    await expect(store.load(bespoke.move, 'yang')).resolves.toMatchObject({ resolved: { mode: 'bespoke' } });
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('bindings.json'))).toHaveLength(2);
  });
});
