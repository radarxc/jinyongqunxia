/* global CanvasImageSource, HTMLCanvasElement, HTMLImageElement, Image, document */
/**
 * Town art resampled to the painted base image's own texel density (tech/13 §5.2, AR-115).
 * Drawn 1:1 in the map plane, a sprite is then scaled together with the base image, so towns keep the
 * painting's softness at every zoom instead of staying sharper (or blurrier) than the mountains.
 */
export interface SpriteJob {
  readonly key: string; readonly url: string;
  /** Source rectangle in the image's pixels; null takes the whole image. */
  readonly crop: readonly [number, number, number, number] | null;
  readonly width: number; readonly height: number;
}
/** PNG data URLs by job key, and the source URLs that did not load (callers fall back to other art). */
export interface SpriteBatch { readonly made: ReadonlyMap<string, string>; readonly failed: ReadonlySet<string> }

/** False where no 2D canvas exists (tests, locked-down browsers): callers keep CSS-scaled art. */
export function canResample(): boolean {
  try { return typeof document !== 'undefined' && document.createElement('canvas').getContext('2d') !== null; }
  catch { return false; }
}

/** Resolves to the decoded image, or null when it fails; nothing is cached beyond the caller's batch. */
export function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

/** Repeated halving (box-like in every browser), then one high-quality step to the exact size. */
export function resample(source: CanvasImageSource, crop: readonly [number, number, number, number],
  width: number, height: number): HTMLCanvasElement | null {
  let [x, y, w, h] = crop;
  let current: CanvasImageSource = source;
  let canvas: HTMLCanvasElement | null = null;
  const step = (nextWidth: number, nextHeight: number): boolean => {
    const target = document.createElement('canvas');
    target.width = nextWidth; target.height = nextHeight;
    const context = target.getContext('2d');
    if (!context) return false;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(current, x, y, w, h, 0, 0, nextWidth, nextHeight);
    current = target; canvas = target; x = 0; y = 0; w = nextWidth; h = nextHeight;
    return true;
  };
  while (w >= width * 2 && h >= height * 2)
    if (!step(Math.round(w / 2), Math.round(h / 2))) return null;
  return step(width, height) ? canvas : null;
}

/** Each source loads once per batch and is released afterwards; a failed source is reported, not cached. */
export async function resampleSprites(jobs: readonly SpriteJob[]): Promise<SpriteBatch> {
  const made = new Map<string, string>(); const failed = new Set<string>();
  if (!canResample()) return { made, failed };
  const sources = new Map<string, Promise<HTMLImageElement | null>>();
  for (const job of jobs) {
    let pending = sources.get(job.url);
    if (!pending) { pending = loadImage(job.url); sources.set(job.url, pending); }
    const image = await pending;
    if (!image) { failed.add(job.url); continue; }
    try {
      const canvas = resample(image, job.crop ?? [0, 0, image.naturalWidth, image.naturalHeight], job.width, job.height);
      if (canvas) made.set(job.key, canvas.toDataURL('image/png'));
    } catch { /* A canvas that cannot draw or export keeps the CSS-scaled art; the source itself is fine. */ }
  }
  return { made, failed };
}
