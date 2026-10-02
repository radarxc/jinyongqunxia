// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { Texture } from 'three';
import type * as Three from 'three';

const fake = vi.hoisted(() => ({ targets: [] as unknown[], renders: 0, disposed: 0 }));
vi.mock('three', async importOriginal => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    autoClear = true; private pixelRatio = 1;
    readonly extensions = { has: () => false };
    setClearColor() {}
    setPixelRatio(value: number) { this.pixelRatio = value; }
    getPixelRatio() { return this.pixelRatio; }
    setSize() {}
    setRenderTarget(value: unknown) { fake.targets.push(value); }
    clear() {}
    render() { fake.renders += 1; }
    dispose() { fake.disposed += 1; }
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});

import { createBattleVfxStage } from './stage';
import type { BattleVfxStageOptions, VfxComposition, VfxPlayRequest } from './types';

const composition: VfxComposition = {
  kind: 'TemplateComposition', version: 1, canvas_px: [100, 100], background: '#000000',
  emit_at_px: [10, 50], angle_deg: 0, range_hex: 0, pixels_per_hex: 100, length_px: 40,
  scale: [1, 1], emitter_scale: 1, rhythm: { charge_s: 0.05, release_s: 0.05, sustain_s: 0, dissipate_s: 0.22 },
  transition: { interpolation: 'crossfade', scale_from: 1, drift_fraction: 0, brightness: [1, 1, 1, 1, 1] },
  output: { fps: 20, loop: false, loop_gap_s: 0 },
  template: { mode: 'plain_strike', nature: 'neutral', delivery: 'fist', color: '#F4F4F4',
    params: { duration_s: 0.32 } },
  effect: null, emitter: null,
};
const afterimage = { ...composition, rhythm: { charge_s: 0.0864, release_s: 0.0576, sustain_s: 0, dissipate_s: 0.336 },
  template: { ...composition.template!, mode: 'afterimage' as const, params: { duration_s: 0.48, copies: 4, spacing_px: 28 } } };
const marker = { id: 'actor', index: 0, q: 0, r: 0, height: 0, facing: 0 as const, equipment: {}, active: true };
const request: VfxPlayRequest = { moveId: 'mv_test', from: marker,
  targets: [{ ...marker, id: 'target', q: 1 }], accents: ['hit'] };

describe('battle VFX stage', () => {
  it('renders through a linear target, counts fallbacks and releases owned resources', async () => {
    fake.targets.length = 0; fake.renders = 0; fake.disposed = 0;
    let clock = 100;
    const textureDispose = vi.fn();
    const texture = new Texture(); texture.dispose = textureDispose;
    const assetStore: NonNullable<BattleVfxStageOptions['assetStore']> = {
      load: vi.fn(async () => ({ resolved: { binding: null, mode: 'plain_strike', color: '#F4F4F4',
        durationMs: 320, fallback: true, reason: 'binding-missing' } as const, composition })),
    };
    const textureStore = { size: 1, load: vi.fn(async () => texture), dispose: textureDispose };
    const canvas = document.createElement('canvas');
    Object.defineProperties(canvas, { clientWidth: { value: 320 }, clientHeight: { value: 180 } });
    const stage = createBattleVfxStage(canvas, { assetStore, textureStore, now: () => clock });
    stage.setProjector((q, r, height, out) => { out.x = 20 + q * 40; out.y = 80 - r * 20 - height; out.visible = true; });
    await expect(stage.play(request)).resolves.toEqual({ durationMs: 320, fallback: true });
    stage.render(clock + 100);
    expect(fake.targets).toHaveLength(2); expect(fake.targets[0]).not.toBeNull(); expect(fake.targets[1]).toBeNull();
    expect(fake.renders).toBe(2); expect(stage.stats).toMatchObject({ active: 1, fallbacks: 1, textures: 1 });
    clock += 500; stage.render(clock); expect(stage.stats.active).toBe(0);
    stage.dispose(); expect(textureDispose).toHaveBeenCalledOnce(); expect(fake.disposed).toBe(1);
    await expect(stage.play(request)).rejects.toThrow('VFX_STAGE_DISPOSED');
  });

  it('uses a lazy actor snapshot for afterimages and falls back when it is absent', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      { clearRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    const assetStore = { load: vi.fn(async () => ({ resolved: { binding: null, mode: 'afterimage' as const,
      color: '#F4F4F4', durationMs: 480, fallback: false }, composition: afterimage })) };
    const textureStore = { size: 0, load: vi.fn(), dispose: vi.fn() };
    const canvas = document.createElement('canvas');
    const stage = createBattleVfxStage(canvas, { assetStore, textureStore, now: () => 0 });
    const image = document.createElement('canvas'); image.width = 16; image.height = 24;
    const actorSnapshot = vi.fn(() => ({ image, sizePx: [32, 48] as const, centerOffsetPx: [0, -20] as const }));
    await expect(stage.play({ ...request, actorSnapshot })).resolves.toMatchObject({ fallback: false });
    expect(actorSnapshot).toHaveBeenCalledOnce();
    await expect(stage.play(request)).resolves.toMatchObject({ fallback: true });
    expect(stage.stats.fallbacks).toBe(1); expect(warning).toHaveBeenCalledOnce();
    stage.dispose(); getContext.mockRestore(); warning.mockRestore();
  });
});
