import type { CellPayload, MeshPayload } from '../types';

function append<T extends Float32Array | Int8Array | Uint8Array | Uint16Array | Uint32Array>(
  left: T,
  right: T,
  create: (length: number) => T,
): T {
  const result = create(left.length + right.length);
  result.set(left);
  result.set(right, left.length);
  return result;
}

export function mergeMeshPayload(left: MeshPayload, right: MeshPayload): MeshPayload {
  const vertexOffset = left.position.length / 3;
  const vertexCount = vertexOffset + right.position.length / 3;
  const indices = new Uint32Array(left.index.length + right.index.length);
  indices.set(left.index);
  for (let index = 0; index < right.index.length; index += 1)
    indices[left.index.length + index] = right.index[index]! + vertexOffset;
  const bounds = new Float32Array(6);
  if (vertexCount === 0) bounds.fill(0);
  else if (left.position.length === 0) bounds.set(right.bounds);
  else if (right.position.length === 0) bounds.set(left.bounds);
  else {
    for (let axis = 0; axis < 3; axis += 1) {
      bounds[axis] = Math.min(left.bounds[axis]!, right.bounds[axis]!);
      bounds[axis + 3] = Math.max(left.bounds[axis + 3]!, right.bounds[axis + 3]!);
    }
  }
  return {
    position: append(left.position, right.position, (n) => new Float32Array(n)),
    normal: append(left.normal, right.normal, (n) => new Int8Array(n)),
    uv: append(left.uv, right.uv, (n) => new Float32Array(n)),
    mat: append(left.mat, right.mat, (n) => new Uint8Array(n)),
    unit: append(left.unit, right.unit, (n) => new Uint16Array(n)),
    tint: append(left.tint, right.tint, (n) => new Uint8Array(n)),
    index: vertexCount > 65_535 ? indices : new Uint16Array(indices),
    bounds,
  };
}

/** r1 emits a structural sign box plus a sign record. r9 owns presentation, so keep only the quad. */
export function withoutHangingSignTriangles(cell: CellPayload): CellPayload {
  if (cell.hanging.length === 0) return cell;
  const signVertices = new Uint8Array(cell.shell.position.length / 3);
  for (let offset = 0; offset < cell.hanging.length;) {
    const target = cell.hanging[offset++]!;
    const kind = cell.hanging[offset++]!;
    const count = cell.hanging[offset++]!;
    if (target === 0 && kind === 1)
      for (let vertex = 0; vertex < count; vertex += 1)
        signVertices[cell.hanging[offset + vertex]!] = 1;
    offset += count;
  }
  let kept = 0;
  for (let offset = 0; offset < cell.shell.index.length; offset += 3)
    if (!(
      signVertices[cell.shell.index[offset]!] ||
      signVertices[cell.shell.index[offset + 1]!] ||
      signVertices[cell.shell.index[offset + 2]!]
    ))
      kept += 3;
  if (kept === cell.shell.index.length) return cell;
  const Index = cell.shell.index instanceof Uint32Array ? Uint32Array : Uint16Array;
  const index = new Index(kept);
  let write = 0;
  for (let offset = 0; offset < cell.shell.index.length; offset += 3) {
    const a = cell.shell.index[offset]!,
      b = cell.shell.index[offset + 1]!,
      c = cell.shell.index[offset + 2]!;
    if (signVertices[a] || signVertices[b] || signVertices[c]) continue;
    index[write++] = a;
    index[write++] = b;
    index[write++] = c;
  }
  return { ...cell, shell: { ...cell.shell, index } };
}

export function mergeCellPayload(left: CellPayload, right: CellPayload): CellPayload {
  return {
    cell: left.cell,
    lod: left.lod,
    shell: mergeMeshPayload(left.shell, right.shell),
    roof: mergeMeshPayload(left.roof, right.roof),
    doors: append(left.doors, right.doors, (n) => new Float32Array(n)),
    signs: append(left.signs, right.signs, (n) => new Float32Array(n)),
    units: append(left.units, right.units, (n) => new Uint16Array(n)),
    hanging: append(left.hanging, right.hanging, (n) => new Uint32Array(n)),
  };
}
