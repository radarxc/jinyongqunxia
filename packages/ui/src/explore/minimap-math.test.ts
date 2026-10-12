import { describe, expect, it } from 'vitest';
import { compassAngleRad, fitPaintedMinimap, hitMarker, minimapToWorld,
  worldToMinimap, writePaintedMinimapBasis } from './minimap-math';
import type { MinimapView } from './minimap-math';

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4_294_967_296;
  };
}

function yawBasis(degrees: number): Float32Array {
  const angle = degrees * Math.PI / 180;
  return new Float32Array([Math.cos(angle), Math.sin(angle), Math.sin(angle), -Math.cos(angle)]);
}

function expectRoundTrips(view: MinimapView): void {
  const random = mulberry32(0x5449414e);
  const canvas = new Float32Array(2);
  const world = new Float32Array(2);
  for (let index = 0; index < 64; index += 1) {
    const x = view.centerX + (random() - 0.5) * 8;
    const z = view.centerZ + (random() - 0.5) * 8;
    worldToMinimap(x, z, view, canvas);
    minimapToWorld(canvas[0]!, canvas[1]!, view, world);
    expect(Math.abs(world[0]! - x)).toBeLessThan(1e-6);
    expect(Math.abs(world[1]! - z)).toBeLessThan(1e-6);
  }
}

describe('minimap coordinate math', () => {
  it('round-trips world points in north-up orientation below 1e-6', () => {
    expectRoundTrips({ centerX: 1, centerZ: -2, metresPerPx: 0.125, sizePx: 200,
      northUp: true, basis: yawBasis(45) });
  });

  for (const yaw of [45, 135, 225, 315]) {
    it(`round-trips world points at ${yaw} degree camera yaw below 1e-6`, () => {
      expectRoundTrips({ centerX: 1, centerZ: -2, metresPerPx: 0.125, sizePx: 200,
        northUp: false, basis: yawBasis(yaw) });
    });
  }

  it('points the compass north for four camera yaws and north-up mode', () => {
    const expected = [-3 * Math.PI / 4, 3 * Math.PI / 4, Math.PI / 4, -Math.PI / 4];
    [45, 135, 225, 315].forEach((yaw, index) => {
      expect(compassAngleRad({ centerX: 0, centerZ: 0, metresPerPx: 1, sizePx: 1,
        northUp: false, basis: yawBasis(yaw) })).toBeCloseTo(expected[index]!, 6);
    });
    expect(compassAngleRad({ centerX: 0, centerZ: 0, metresPerPx: 1, sizePx: 1,
      northUp: true, basis: yawBasis(135) })).toBeCloseTo(-Math.PI / 2, 12);
  });

  it('round-trips 100 random painted-projection points below 1e-4 metres', () => {
    const basis = new Float32Array(4);
    writePaintedMinimapBasis([8, 4, -8, 4, 768, 130.75], basis);
    const paintedView: MinimapView = { centerX: 48, centerZ: 48, metresPerPx: 0.2,
      sizePx: 200, northUp: false, basis };
    const random = mulberry32(0x117); const canvas = new Float32Array(2);
    const world = new Float32Array(2);
    for (let index = 0; index < 100; index += 1) {
      const x = random() * 96; const z = random() * 96;
      worldToMinimap(x, z, paintedView, canvas);
      minimapToWorld(canvas[0]!, canvas[1]!, paintedView, world);
      expect(Math.hypot(world[0]! - x, world[1]! - z)).toBeLessThan(1e-4);
    }
  });

  it('keeps a 2:1 painted wall direction at 26.57 degrees', () => {
    const basis = new Float32Array(4);
    writePaintedMinimapBasis([8, 4, -8, 4, 768, 130.75], basis);
    const paintedView: MinimapView = { centerX: 0, centerZ: 0, metresPerPx: 0.2,
      sizePx: 200, northUp: false, basis };
    const start = new Float32Array(2); const end = new Float32Array(2);
    worldToMinimap(0, 0, paintedView, start); worldToMinimap(10, 0, paintedView, end);
    const angle = Math.atan2(end[1]! - start[1]!, end[0]! - start[0]!) * 180 / Math.PI;
    expect(angle).toBeCloseTo(26.565, 3);
  });

  it('contains the whole painted map and fills the constrained side above 92%', () => {
    const center = new Float32Array(2);
    const metresPerPx = fitPaintedMinimap([8, 4, -8, 4, 768, 130.75],
      1536, 899, 936, 640, 12, center);
    const scale = 1 / (Math.hypot(8, -8) * metresPerPx);
    expect(1536 * scale).toBeLessThanOrEqual(912 + 1e-6);
    expect(899 * scale).toBeLessThanOrEqual(616 + 1e-6);
    expect(Math.max(1536 * scale / 912, 899 * scale / 616)).toBeGreaterThanOrEqual(0.92);
  });
});

describe('hitMarker', () => {
  it('includes the radius boundary and rejects a marker just outside it', () => {
    const markers = new Float32Array([44, 0, 44.01, 0]);
    expect(hitMarker(0, 0, markers, 2, 44)).toBe(0);
    expect(hitMarker(0, 0, markers, 2, 43.99)).toBe(-1);
  });

  it('chooses the lower index when nearest markers are tied', () => {
    expect(hitMarker(0, 0, new Float32Array([-10, 0, 10, 0, 1, 0]), 2, 44)).toBe(0);
    expect(hitMarker(0, 0, new Float32Array([-10, 0, 10, 0, 1, 0]), 3, 44)).toBe(2);
  });
});
