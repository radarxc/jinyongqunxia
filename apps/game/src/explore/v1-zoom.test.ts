import { describe, expect, it } from 'vitest';
import { v1ZoomRatio } from './v1-zoom';

describe('v1ZoomRatio', () => {
  it.each([
    [48, 1.2], [64, 1.6], [80, 2], [96, 2.4],
  ])('maps %i px/m to the v1 ratio at a 720 px viewport', (pxPerMetre, ratio) => {
    expect(v1ZoomRatio(pxPerMetre, 720)).toBeCloseTo(ratio, 12);
  });

  it('accounts for the v1 multiplier changing with viewport height', () => {
    expect(v1ZoomRatio(80, 900)).toBe(1.6);
    expect(() => v1ZoomRatio(80, 0)).toThrow('V1_ZOOM_VIEWPORT_HEIGHT');
  });
});
