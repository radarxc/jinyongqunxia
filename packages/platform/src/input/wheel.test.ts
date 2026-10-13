import { describe, expect, it } from 'vitest';
import { normalizeWheel } from './wheel';

describe('normalizeWheel', () => {
  it('keeps deltaMode 0 pixel values unchanged', () => {
    expect(normalizeWheel({ deltaX: -2.5, deltaY: 12, deltaMode: 0 }))
      .toEqual({ dx: -2.5, dy: 12 });
  });

  it('converts deltaMode 1 line values with the configured line height', () => {
    expect(normalizeWheel({ deltaX: 2, deltaY: -3, deltaMode: 1 }, 20))
      .toEqual({ dx: 40, dy: -60 });
  });

  it('converts deltaMode 2 page values with the configured page height', () => {
    expect(normalizeWheel({ deltaX: -1, deltaY: 2, deltaMode: 2 }, 16, 720))
      .toEqual({ dx: -720, dy: 1440 });
  });
});
