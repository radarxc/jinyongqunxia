import type { CellPayload, MeshPayload } from '../../types';

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const QUANTIZE_POSITION = 10_000; // metres -> 0.1 mm integers

function byte(hash: number, value: number): number {
  return Math.imul(hash ^ (value & 0xff), FNV_PRIME) >>> 0;
}
function integer(hash: number, value: number): number {
  let result = hash;
  const unsigned = value >>> 0;
  result = byte(result, unsigned);
  result = byte(result, unsigned >>> 8);
  result = byte(result, unsigned >>> 16);
  return byte(result, unsigned >>> 24);
}
function bytes(hash: number, data: ArrayLike<number>): number {
  let result = hash;
  for (let index = 0; index < data.length; index += 1) result = byte(result, data[index]!);
  return result;
}

/** FNV-1a 32 over 0.1 mm quantized positions and every remaining vertex/index attribute. */
export function hashMesh(mesh: MeshPayload, seed = FNV_OFFSET): number {
  let hash = integer(seed, mesh.position.length);
  for (let index = 0; index < mesh.position.length; index += 1)
    hash = integer(hash, Math.round(mesh.position[index]! * QUANTIZE_POSITION));
  hash = bytes(integer(hash, mesh.normal.length), mesh.normal);
  hash = bytes(
    integer(hash, mesh.uv.length),
    new Uint8Array(mesh.uv.buffer, mesh.uv.byteOffset, mesh.uv.byteLength),
  );
  hash = bytes(integer(hash, mesh.mat.length), mesh.mat);
  hash = bytes(
    integer(hash, mesh.unit.length),
    new Uint8Array(mesh.unit.buffer, mesh.unit.byteOffset, mesh.unit.byteLength),
  );
  hash = bytes(integer(hash, mesh.tint.length), mesh.tint);
  hash = bytes(
    integer(hash, mesh.index.length),
    new Uint8Array(mesh.index.buffer, mesh.index.byteOffset, mesh.index.byteLength),
  );
  hash = integer(hash, mesh.bounds.length);
  for (let index = 0; index < mesh.bounds.length; index += 1)
    hash = integer(hash, Math.round(mesh.bounds[index]! * QUANTIZE_POSITION));
  return hash;
}
export function hashCell(cell: CellPayload): number {
  let hash = integer(FNV_OFFSET, cell.cell);
  hash = integer(hash, cell.lod);
  hash = hashMesh(cell.shell, hash);
  hash = hashMesh(cell.roof, hash);
  hash = bytes(
    hash,
    new Uint8Array(cell.doors.buffer, cell.doors.byteOffset, cell.doors.byteLength),
  );
  hash = bytes(
    hash,
    new Uint8Array(cell.signs.buffer, cell.signs.byteOffset, cell.signs.byteLength),
  );
  hash = bytes(
    hash,
    new Uint8Array(cell.units.buffer, cell.units.byteOffset, cell.units.byteLength),
  );
  return bytes(
    hash,
    new Uint8Array(cell.hanging.buffer, cell.hanging.byteOffset, cell.hanging.byteLength),
  );
}
export function hashHex(hash: number): string {
  return (hash >>> 0).toString(16).padStart(8, '0');
}
