// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { canResample, resample, resampleSprites } from './map-sprites';

interface FakeContext { imageSmoothingEnabled: boolean; imageSmoothingQuality: string; draws: number[][] }
let contexts: FakeContext[];
let canvasWorks: boolean;
let dataUrlThrows: boolean;
let drawThrows: boolean;
const sizes = new Map<string, readonly [number, number]>();
let loads: string[];

beforeEach(() => {
  contexts = []; canvasWorks = true; dataUrlThrows = false; drawThrows = false; loads = []; sizes.clear();
  const create = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    if (tag !== 'canvas') return create(tag);
    const canvas = { width: 0, height: 0,
      getContext: () => {
        if (!canvasWorks) return null;
        const context: FakeContext & { drawImage: (...args: unknown[]) => void } = {
          imageSmoothingEnabled: false, imageSmoothingQuality: 'low', draws: [],
          drawImage: (...args: unknown[]) => {
            if (drawThrows) throw new Error('InvalidStateError');
            context.draws.push(args.slice(1) as number[]);
          },
        };
        contexts.push(context); return context;
      },
      toDataURL: () => {
        if (dataUrlThrows) throw new Error('SecurityError');
        return `data:image/png;fake,${canvas.width}x${canvas.height}`;
      } };
    return canvas as unknown as HTMLCanvasElement;
  }) as typeof document.createElement);
  vi.stubGlobal('Image', class {
    decoding = ''; naturalWidth = 0; naturalHeight = 0;
    onload: (() => void) | null = null; onerror: (() => void) | null = null;
    set src(url: string) {
      loads.push(url);
      queueMicrotask(() => {
        const size = sizes.get(url);
        if (!size) { this.onerror?.(); return; }
        [this.naturalWidth, this.naturalHeight] = size; this.onload?.();
      });
    }
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('map-density resampling (tech/13 §5.5)', () => {
  it('halves while both sides stay at least twice the target, then takes one high-quality step', () => {
    const canvas = resample({} as CanvasImageSource, [0, 0, 700, 500], 88, 63)!;
    expect([canvas.width, canvas.height]).toEqual([88, 63]);
    // 700×500 → 350×250 → 175×125 (175 < 176) → 88×63, each step reading the whole previous canvas.
    expect(contexts.map(context => context.draws[0])).toEqual([
      [0, 0, 700, 500, 0, 0, 350, 250], [0, 0, 350, 250, 0, 0, 175, 125], [0, 0, 175, 125, 0, 0, 88, 63]]);
    expect(contexts.every(context => context.imageSmoothingEnabled && context.imageSmoothingQuality === 'high')).toBe(true);
  });

  it('reads only the atlas cell and stops halving on the shorter side of a non-square source', () => {
    resample({} as CanvasImageSource, [128, 0, 128, 128], 37, 37);
    expect(contexts.map(context => context.draws[0])).toEqual([[128, 0, 128, 128, 0, 0, 64, 64], [0, 0, 64, 64, 0, 0, 37, 37]]);
    contexts = [];
    const wide = resample({} as CanvasImageSource, [0, 0, 300, 100], 20, 20)!;
    expect(contexts.map(context => context.draws[0]?.slice(6))).toEqual([[150, 50], [75, 25], [20, 20]]);
    expect([wide.width, wide.height]).toEqual([20, 20]);
  });

  it('reports no canvas and loads nothing when a 2D context is unavailable', async () => {
    canvasWorks = false;
    expect(canResample()).toBe(false);
    expect(resample({} as CanvasImageSource, [0, 0, 10, 10], 5, 5)).toBeNull();
    const batch = await resampleSprites([{ key: 'a', url: '/a.webp', crop: null, width: 4, height: 4 }]);
    expect([batch.made.size, batch.failed.size, loads]).toEqual([0, 0, []]);
  });

  it('loads a shared source once per batch, reports failed sources and skips unreadable canvases', async () => {
    sizes.set('/atlas.webp', [384, 384]); sizes.set('/vignette.webp', [700, 500]);
    const batch = await resampleSprites([
      { key: 'atlas#city_large@58x58', url: '/atlas.webp', crop: [0, 0, 128, 128], width: 58, height: 58 },
      { key: 'atlas#city_county@30x30', url: '/atlas.webp', crop: [256, 0, 128, 128], width: 30, height: 30 },
      { key: 'gone@64x48', url: '/missing.webp', crop: null, width: 64, height: 48 },
      { key: 'vignette@88x63', url: '/vignette.webp', crop: null, width: 88, height: 63 }]);
    expect([...batch.made]).toEqual([['atlas#city_large@58x58', 'data:image/png;fake,58x58'],
      ['atlas#city_county@30x30', 'data:image/png;fake,30x30'], ['vignette@88x63', 'data:image/png;fake,88x63']]);
    expect([...batch.failed]).toEqual(['/missing.webp']);
    expect(loads).toEqual(['/atlas.webp', '/missing.webp', '/vignette.webp']);
    // A new batch loads again, so a transient failure is retried rather than remembered.
    dataUrlThrows = true;
    const again = await resampleSprites([{ key: 'v', url: '/vignette.webp', crop: null, width: 88, height: 63 }]);
    expect([again.made.size, again.failed.size]).toEqual([0, 0]);
    expect(loads.at(-1)).toBe('/vignette.webp');
  });

  it('keeps going when drawing throws, without blaming the source image', async () => {
    sizes.set('/atlas.webp', [384, 384]); drawThrows = true;
    const batch = await resampleSprites([{ key: 'a', url: '/atlas.webp', crop: [0, 0, 128, 128], width: 40, height: 40 },
      { key: 'b', url: '/atlas.webp', crop: [128, 0, 128, 128], width: 30, height: 30 }]);
    expect([batch.made.size, [...batch.failed]]).toEqual([0, []]);
  });
});
