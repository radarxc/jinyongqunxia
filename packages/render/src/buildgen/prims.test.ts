import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from './mesher/core/buffer';
import {
  box,
  extrudeAlong,
  prism,
  quad,
  transformNormal,
  transformPoint,
} from './mesher/core/prims';
import { mulberry32 } from './mesher/core/rng';

function geometricEdgeCounts(mesh: ReturnType<MeshBufferBuilder['finish']>): Map<string, number> {
  const counts = new Map<string, number>();
  const key = (vertex: number) => {
    const offset = vertex * 3;
    return [0, 1, 2].map((axis) => Math.round(mesh.position[offset + axis]! * 1e6)).join(',');
  };
  for (let offset = 0; offset < mesh.index.length; offset += 3)
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 0],
    ] as const) {
      const ends = [key(mesh.index[offset + a]!), key(mesh.index[offset + b]!)].sort();
      const edge = `${ends[0]}|${ends[1]}`;
      counts.set(edge, (counts.get(edge) ?? 0) + 1);
    }
  return counts;
}

describe('buildgen primitives', () => {
  it('maps points and normals through all four quarter turns', () => {
    expect(([0, 1, 2, 3] as const).map((yaw) => transformPoint([2, 7, 3], { yaw }))).toEqual([
      [2, 7, 3],
      [-3, 7, 2],
      [-2, 7, -3],
      [3, 7, -2],
    ]);
    expect(([0, 1, 2, 3] as const).map((yaw) => transformNormal([0, 0, 1], yaw))).toEqual([
      [0, 0, 1],
      [-1, 0, 0],
      [0, 0, -1],
      [1, 0, 0],
    ]);
  });

  it('emits outward box normals with metre UVs', () => {
    const builder = new MeshBufferBuilder();
    box(builder, { center: [0, 1, 0], size: [4, 2, 6] });
    const mesh = builder.finish();
    for (let face = 0; face < 6; face += 1) {
      const vertex = face * 4;
      const p = vertex * 3;
      const n = vertex * 4;
      const dot =
        (mesh.position[p]! * mesh.normal[n]!) / 127 +
        ((mesh.position[p + 1]! - 1) * mesh.normal[n + 1]!) / 127 +
        (mesh.position[p + 2]! * mesh.normal[n + 2]!) / 127;
      expect(dot).toBeGreaterThan(0.99);
    }
    expect(mesh.uv[2]).toBe(4);
    expect(mesh.uv[3]).toBe(0);
  });

  it('applies the same quarter-turn transform to quad as box and prism (points and normals)', () => {
    const origin = [5, 0.5, -2] as const;
    // Counter-clockwise when seen from +z, so the local outward normal is +z.
    const local = [
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
    ] as const;
    for (const yaw of [0, 1, 2, 3] as const) {
      const writer = new MeshBufferBuilder();
      quad(writer, local, {}, { origin, yaw });
      const mesh = writer.finish();
      for (let vertex = 0; vertex < 4; vertex += 1) {
        const expected = transformPoint(local[vertex]!, { origin, yaw });
        for (let axis = 0; axis < 3; axis += 1)
          expect(mesh.position[vertex * 3 + axis]).toBeCloseTo(expected[axis]!, 6);
      }
      const normal = transformNormal([0, 0, 1], yaw).map((value) => Math.round(value * 127) + 0);
      expect([mesh.normal[0], mesh.normal[1], mesh.normal[2]]).toEqual(normal);
    }
  });

  it('applies the quarter-turn transform to extrudeAlong after solving joints locally', () => {
    const origin = [3, 0, 7] as const;
    const path = [
      [0, 0, 0],
      [2, 0, 0],
      [2, 0, 1.5],
    ] as const;
    const profile = [
      [-0.1, 0],
      [0.1, 0],
      [0.1, 0.3],
      [-0.1, 0.3],
    ] as const;
    const reference = new MeshBufferBuilder();
    extrudeAlong(reference, path, profile);
    const localMesh = reference.finish();
    for (const yaw of [0, 1, 2, 3] as const) {
      const writer = new MeshBufferBuilder();
      extrudeAlong(writer, path, profile, {}, { origin, yaw });
      const mesh = writer.finish();
      expect(mesh.position.length).toBe(localMesh.position.length);
      for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
        const p = vertex * 3;
        const expected = transformPoint(
          [localMesh.position[p]!, localMesh.position[p + 1]!, localMesh.position[p + 2]!],
          { origin, yaw },
        );
        for (let axis = 0; axis < 3; axis += 1)
          expect(mesh.position[p + axis]).toBeCloseTo(expected[axis]!, 5);
        const n = vertex * 4;
        const expectedNormal = transformNormal(
          [localMesh.normal[n]!, localMesh.normal[n + 1]!, localMesh.normal[n + 2]!],
          yaw,
        ).map((value) => value + 0);
        expect([mesh.normal[n], mesh.normal[n + 1], mesh.normal[n + 2]]).toEqual(expectedNormal);
      }
      const open = [...geometricEdgeCounts(mesh).values()].filter((count) => count === 1);
      expect(open).toEqual([]);
    }
  });

  it('builds quad, prism and swept profile geometry', () => {
    const builder = new MeshBufferBuilder();
    quad(builder, [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ]);
    prism(builder, { center: [0, 1, 0], radiusM: 0.5, heightM: 2, sides: 8 });
    extrudeAlong(
      builder,
      [
        [0, 0, 0],
        [2, 0, 0],
        [2, 0, 2],
      ],
      [
        [-0.1, 0],
        [0.1, 0],
        [0, 0.2],
      ],
    );
    const mesh = builder.finish();
    expect(mesh.position.length).toBeGreaterThan(0);
    expect(mesh.index.length % 3).toBe(0);
  });

  it('keeps fixed-seed multi-segment extrusion geometrically watertight at joins', () => {
    const rng = mulberry32(0xc0ffee);
    for (let sample = 0; sample < 24; sample += 1) {
      const x = 1 + rng.rangeInt(0, 4);
      const z = 1 + rng.rangeInt(0, 4);
      const writer = new MeshBufferBuilder();
      extrudeAlong(
        writer,
        [
          [0, 0, 0],
          [x, 0, 0],
          [x, 0, z],
          [x + 2, 0, z],
        ],
        [
          [-0.1, 0],
          [0.1, 0],
          [0.1, 0.2],
          [-0.1, 0.2],
        ],
      );
      const mesh = writer.finish();
      const open = [...geometricEdgeCounts(mesh).values()].filter((count) => count === 1);
      expect(open).toEqual([]);
      const path = [
        [0, 0],
        [x, 0],
        [x, z],
        [x + 2, z],
      ] as const;
      for (let segment = 0; segment < path.length - 1; segment += 1) {
        const dx = path[segment + 1]![0] - path[segment]![0];
        const dz = path[segment + 1]![1] - path[segment]![1];
        const magnitude = Math.hypot(dx, dz);
        const normalOffset = (segment * 16 + (segment > 0 ? 6 : 0) + 4) * 4;
        const dot =
          (mesh.normal[normalOffset]! * dz - mesh.normal[normalOffset + 2]! * dx) /
          (127 * magnitude);
        expect(dot).toBeGreaterThan(0.99);
      }
    }
  });

  it('keeps prism and extrusion side normals outward', () => {
    const builder = new MeshBufferBuilder();
    prism(builder, { center: [0, 1, 0], radiusM: 0.5, heightM: 2, sides: 8 });
    const prismMesh = builder.finish();
    for (let face = 0; face < 8; face += 1) {
      const vertex = face * 4;
      const p = vertex * 3;
      const n = vertex * 4;
      const next = p + 3;
      const expectedX = (prismMesh.position[p]! + prismMesh.position[next]!) / 2;
      const expectedZ = (prismMesh.position[p + 2]! + prismMesh.position[next + 2]!) / 2;
      const dot =
        (expectedX * prismMesh.normal[n]!) / 127 + (expectedZ * prismMesh.normal[n + 2]!) / 127;
      const radius = Math.hypot(expectedX, expectedZ);
      expect(dot / radius).toBeGreaterThan(0.99);
    }
    const swept = new MeshBufferBuilder();
    extrudeAlong(
      swept,
      [
        [0, 0, 0],
        [2, 0, 0],
      ],
      [
        [-0.1, 0],
        [0.1, 0],
        [0.1, 0.2],
        [-0.1, 0.2],
      ],
    );
    const sweptMesh = swept.finish();
    const expected = [
      [0, -127, 0],
      [0, 0, -127],
      [0, 127, 0],
      [0, 0, 127],
    ] as const;
    for (let face = 0; face < expected.length; face += 1) {
      const normal = face * 16;
      expect([
        sweptMesh.normal[normal],
        sweptMesh.normal[normal + 1],
        sweptMesh.normal[normal + 2],
      ]).toEqual(expected[face]);
    }
  });
});
