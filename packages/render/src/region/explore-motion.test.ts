import { describe, expect, it } from 'vitest';
import {
  advanceCameraSpring,
  advanceFacing,
  applyCameraDeadZone,
  applyLookAhead,
  cameraBasis,
  clampCameraTarget,
  groundViewQuad,
  regionHexGround,
  regionWorldBounds,
  sampleWalk,
} from './explore-motion';
import type { ExploreWalkView } from './types';

const straight: ExploreWalkView = {
  path: [
    { q: 0, r: 0 },
    { q: 1, r: 0 },
  ],
  progressMm: 0,
  stepMm: 1_155,
  mmPerTick: 135,
  destination: { q: 1, r: 0 },
};
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

describe('region dead reckoning', () => {
  it('advances at equal distances between ticks and never passes the path end', () => {
    const sample = { x: 0, z: 0, yawRad: 0, moving: false, segment: 0, portion: 0 };
    const points = Array.from({ length: 11 }, (_, index) => {
      sampleWalk(straight, index * 10, 0, sample);
      return [sample.x, sample.z];
    });
    const distances = points
      .slice(1)
      .map(
        (point, index) =>
          Math.hypot(point[0]! - points[index]![0]!, point[1]! - points[index]![1]!) * 1_000,
      );
    for (const distance of distances) expect(Math.abs(distance - 13.5)).toBeLessThanOrEqual(0.5);
    sampleWalk({ ...straight, progressMm: 1_100 }, 100, 0, sample);
    const end = regionHexGround(straight.path[1]!, { x: 0, z: 0 });
    expect([sample.x, sample.z]).toEqual([end.x, end.z]);
  });

  it('turns at the polyline corner and caps facing at 540 degrees per second', () => {
    const walk = {
      ...straight,
      path: [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 1, r: 1 },
      ],
      progressMm: 1_100,
      mmPerTick: 135,
    };
    const sample = { x: 0, z: 0, yawRad: 0, moving: false, segment: 0, portion: 0 };
    const corner = regionHexGround(walk.path[1]!, { x: 0, z: 0 });
    sampleWalk(walk, 0, 0, sample);
    expect(sample.segment).toBe(0);
    expect(sample.z).toBe(0);
    expect(Math.hypot(sample.x, sample.z)).toBeCloseTo((1_100 / 1_155) * corner.x, 8);
    sampleWalk(walk, 100, 0, sample);
    expect(sample.segment).toBe(1);
    const end = regionHexGround(walk.path[2]!, { x: 0, z: 0 });
    const dx = sample.x - corner.x;
    const dz = sample.z - corner.z;
    expect(dx * (end.z - corner.z) - dz * (end.x - corner.x)).toBeCloseTo(0, 8);
    expect(Math.hypot(dx, dz)).toBeCloseTo(
      (80 / 1_155) * Math.hypot(end.x - corner.x, end.z - corner.z),
      8,
    );
    expect(advanceFacing(0, Math.PI, 1 / 60)).toBeCloseTo((Math.PI * 3) / 60, 8);
  });

  it('uses stepMm to preserve move-cost speed while traversing a geometric hex edge', () => {
    const sample = { x: 0, z: 0, yawRad: 0, moving: false, segment: 0, portion: 0 };
    const costly = { ...straight, stepMm: 2_310 };
    sampleWalk(costly, 100, 0, sample);
    expect(Math.abs(sample.x * 1_000 - 67.5)).toBeLessThanOrEqual(0.5);
  });

  it('keeps fixed-seed random samples on their reported polyline segment', () => {
    const random = mulberry32(0x544f574e);
    const path = [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 1, r: 1 },
      { q: 0, r: 2 },
    ];
    const sample = { x: 0, z: 0, yawRad: 0, moving: false, segment: 0, portion: 0 };
    for (let trial = 0; trial < 256; trial += 1) {
      const progressMm = Math.floor(random() * path.length * 1_155);
      const elapsedMs = random() * 100;
      const mmPerTick = Math.floor(random() * 400);
      sampleWalk({ ...straight, path, progressMm, mmPerTick }, elapsedMs, 0, sample);
      const from = regionHexGround(path[sample.segment]!, { x: 0, z: 0 });
      const to = regionHexGround(path[Math.min(path.length - 1, sample.segment + 1)]!, {
        x: 0,
        z: 0,
      });
      const cross = (sample.x - from.x) * (to.z - from.z) - (sample.z - from.z) * (to.x - from.x);
      expect(cross).toBeCloseTo(0, 8);
      expect(sample.x).toBeCloseTo(from.x + (to.x - from.x) * sample.portion, 8);
      expect(sample.z).toBeCloseTo(from.z + (to.z - from.z) * sample.portion, 8);
    }
  });
});

describe('region camera math', () => {
  it('is reproducible and critically damped without overshoot at fixed dt', () => {
    const run = () => {
      const state = { x: 0, z: 0, vx: 0, vz: 0 };
      const values: number[] = [];
      for (let index = 0; index < 120; index += 1) {
        advanceCameraSpring(state, 10, -5, 1 / 60);
        values.push(state.x, state.z);
      }
      return values;
    };
    const first = run();
    expect(run()).toEqual(first);
    for (let index = 0; index < first.length; index += 2) {
      expect(first[index]!).toBeGreaterThanOrEqual(index === 0 ? 0 : first[index - 2]!);
      expect(first[index]!).toBeLessThanOrEqual(10);
      expect(first[index + 1]!).toBeGreaterThanOrEqual(-5);
    }
  });

  it('keeps targets in the central dead zone and clamps to the three metre inset', () => {
    const state = { x: 10, z: 10, vx: 0, vz: 0 };
    const target = { x: 10.5, z: 10.2 };
    applyCameraDeadZone(state, target, { yawDeg: 45, halfWidth: 5, halfHeight: 3 }, target);
    expect(target).toEqual({ x: 10, z: 10 });
    const bounds = new Float32Array(4);
    regionWorldBounds({ qMin: 0, qMax: 20, rMin: 0, rMax: 20 }, bounds);
    target.x = -100;
    target.z = 100;
    clampCameraTarget(bounds, target);
    expect(target.x).toBeCloseTo(bounds[0]! + 3);
    expect(target.z).toBeCloseTo(bounds[3]! - 3);
  });

  it('applies 0.8 metre look-ahead only in the moving direction', () => {
    const target = { x: 4, z: -2 };
    applyLookAhead(target, Math.PI / 2, true);
    expect(target.x).toBeCloseTo(4.8);
    expect(target.z).toBeCloseTo(-2);
    applyLookAhead(target, 0, false);
    expect(target).toEqual({ x: 4.8, z: -2 });
  });

  it.each([45, 135, 225, 315])(
    'gives an orthonormal basis and expected 1280x720 quad at yaw %i',
    (yaw) => {
      const basis = new Float32Array(4);
      cameraBasis(yaw, basis);
      expect(Math.hypot(basis[0]!, basis[1]!)).toBeCloseTo(1, 6);
      expect(Math.hypot(basis[2]!, basis[3]!)).toBeCloseTo(1, 6);
      expect(basis[0]! * basis[2]! + basis[1]! * basis[3]!).toBeCloseTo(0, 6);
      const halfWidth = (1280 * Math.SQRT2) / 80 / 2;
      const halfHeight = (720 * Math.SQRT2) / 80 / 2;
      const quad = new Float32Array(8);
      groundViewQuad({ x: 0, z: 0 }, yaw, halfWidth, halfHeight, quad);
      const width = Math.hypot(quad[2]! - quad[0]!, quad[3]! - quad[1]!);
      const depth = Math.hypot(quad[6]! - quad[0]!, quad[7]! - quad[1]!);
      expect(width).toBeCloseTo(22.6274, 2);
      expect(depth).toBeCloseTo(25.4558, 2);
    },
  );

  it('keeps fixed-seed random camera bases orthonormal and quads rectangular', () => {
    const random = mulberry32(0x49534f);
    const basis = new Float32Array(4);
    const quad = new Float32Array(8);
    for (let trial = 0; trial < 256; trial += 1) {
      const yaw = random() * 360;
      const width = 1 + random() * 30;
      const height = 1 + random() * 20;
      cameraBasis(yaw, basis);
      groundViewQuad({ x: random() * 20, z: random() * 20 }, yaw, width / 2, height / 4, quad);
      expect(Math.hypot(basis[0]!, basis[1]!)).toBeCloseTo(1, 6);
      expect(Math.hypot(basis[2]!, basis[3]!)).toBeCloseTo(1, 6);
      expect(basis[0]! * basis[2]! + basis[1]! * basis[3]!).toBeCloseTo(0, 6);
      const topX = quad[2]! - quad[0]!;
      const topZ = quad[3]! - quad[1]!;
      const sideX = quad[6]! - quad[0]!;
      const sideZ = quad[7]! - quad[1]!;
      expect(Math.hypot(topX, topZ)).toBeCloseTo(width, 5);
      expect(Math.hypot(sideX, sideZ)).toBeCloseTo(height, 5);
      expect(Math.abs(topX * sideX + topZ * sideZ)).toBeLessThan(1e-4);
    }
  });
});
