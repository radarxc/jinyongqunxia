/** Canvas-space clockwise angle for a world-space south vector. */
export function sinanSouthAngleRad(
  south: readonly [number, number], basis: Float32Array | null, northUp: boolean,
): number {
  const rx = northUp || basis === null ? 1 : basis[0]!;
  const rz = northUp || basis === null ? 0 : basis[1]!;
  const ux = northUp || basis === null ? 0 : basis[2]!;
  const uz = northUp || basis === null ? -1 : basis[3]!;
  return Math.atan2(-(south[0] * ux + south[1] * uz), south[0] * rx + south[1] * rz);
}
