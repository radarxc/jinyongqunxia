import { describe, expect, it } from 'vitest';
import type { MeshPayload } from './types';
import { MeshBufferBuilder } from './mesher/core/buffer';
import { wallWithOpenings, type WallOpening } from './mesher/core/openings';

function generate(openings: readonly WallOpening[]): MeshPayload {
  const builder = new MeshBufferBuilder();
  wallWithOpenings(builder, { lengthM: 6, y0M: 0, y1M: 3, thicknessM: 0.3, openings });
  return builder.finish();
}
function triangleAreaXY(mesh: MeshPayload, triangle: number): number {
  const points = [0, 1, 2].map((corner) => {
    const offset = mesh.index[triangle + corner]! * 3;
    return [
      mesh.position[offset]!,
      mesh.position[offset + 1]!,
      mesh.position[offset + 2]!,
    ] as const;
  });
  const [a, b, c] = points;
  return Math.abs((b![0] - a![0]) * (c![1] - a![1]) - (c![0] - a![0]) * (b![1] - a![1])) / 2;
}
function frontArea(mesh: MeshPayload): number {
  let area = 0;
  for (let index = 0; index < mesh.index.length; index += 3) {
    const vertex = mesh.index[index]!;
    const normalOffset = vertex * 4;
    if (mesh.normal[normalOffset + 2]! > 126) area += triangleAreaXY(mesh, index);
  }
  return area;
}
function triangleCentroid(mesh: MeshPayload, triangle: number): readonly [number, number, number] {
  const result = [0, 0, 0];
  for (let corner = 0; corner < 3; corner += 1) {
    const offset = mesh.index[triangle + corner]! * 3;
    result[0]! += mesh.position[offset]! / 3;
    result[1]! += mesh.position[offset + 1]! / 3;
    result[2]! += mesh.position[offset + 2]! / 3;
  }
  return result as unknown as readonly [number, number, number];
}
function expectConserved(openings: readonly WallOpening[]): void {
  const mesh = generate(openings);
  const expected =
    18 -
    openings.reduce(
      (area, opening) => area + (opening.x1 - opening.x0) * (opening.y1 - opening.y0),
      0,
    );
  expect(Math.abs(frontArea(mesh) - expected) / expected).toBeLessThanOrEqual(0.001);
  for (let index = 0; index < mesh.index.length; index += 3) {
    const [x, y, z] = triangleCentroid(mesh, index);
    const epsilon = 0.000_01;
    const inside = openings.some(
      (opening) =>
        x > opening.x0 + epsilon &&
        x < opening.x1 - epsilon &&
        y > opening.y0 + epsilon &&
        y < opening.y1 - epsilon &&
        Math.abs(z) < 0.149,
    );
    expect(inside).toBe(false);
  }
}

describe('wallWithOpenings', () => {
  it('conserves area and leaves two adjacent openings empty', () => {
    expectConserved([
      { x0: 1, x1: 2.5, y0: 0.2, y1: 2.2 },
      { x0: 2.5, x1: 4, y0: 0.2, y1: 2.2 },
    ]);
  });
  it('conserves area and emits only the aperture side that is not at the wall end', () => {
    const openings = [{ x0: 0, x1: 1.5, y0: 0, y1: 2.1 }] as const;
    expectConserved(openings);
    const mesh = generate(openings);
    let leftArea = 0;
    for (let index = 0; index < mesh.index.length; index += 3) {
      const vertex = mesh.index[index]!;
      if (mesh.normal[vertex * 4]! >= -126) continue;
      const x = mesh.position[vertex * 3]!;
      if (Math.abs(x) > 0.000_01) continue;
      const points = [0, 1, 2].map((corner) => {
        const offset = mesh.index[index + corner]! * 3;
        return [mesh.position[offset + 1]!, mesh.position[offset + 2]!] as const;
      });
      const [a, b, c] = points;
      leftArea +=
        Math.abs((b![0] - a![0]) * (c![1] - a![1]) - (c![0] - a![0]) * (b![1] - a![1])) / 2;
    }
    expect(leftArea).toBeCloseTo((3 - 2.1) * 0.3, 6);
  });
});
