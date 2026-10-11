import type { MeshPayload, MeshWriter, VertexInput } from '../../types';

export const BUILDGEN_VERTEX_STRIDE_BYTES = 36;
const DEFAULT_VERTEX_CAPACITY = 256;
const DEFAULT_INDEX_CAPACITY = 512;

function nextCapacity(current: number, needed: number): number {
  let capacity = Math.max(1, current);
  while (capacity < needed) capacity *= 2;
  return capacity;
}
function grow<T extends Float32Array | Int8Array | Uint8Array | Uint16Array | Uint32Array>(
  source: T,
  length: number,
  create: (size: number) => T,
): T {
  if (source.length >= length) return source;
  const result = create(nextCapacity(source.length, length));
  result.set(source);
  return result;
}
function byteNormal(value: number): number {
  return Math.max(-127, Math.min(127, Math.round(value * 127)));
}
function byte(value: number | undefined, fallback: number): number {
  return Math.max(0, Math.min(255, Math.round(value ?? fallback)));
}
function word(value: number | undefined): number {
  return Math.max(0, Math.min(65_535, Math.round(value ?? 0)));
}

/** Structure-of-arrays builder matching the 36-byte static-lit vertex contract. */
export class MeshBufferBuilder implements MeshWriter {
  private positionData: Float32Array;
  private normalData: Int8Array;
  private uvData: Float32Array;
  private matData: Uint8Array;
  private unitData: Uint16Array;
  private tintData: Uint8Array;
  private indexData: Uint32Array;
  private indexCount = 0;
  private minX = Infinity;
  private minY = Infinity;
  private minZ = Infinity;
  private maxX = -Infinity;
  private maxY = -Infinity;
  private maxZ = -Infinity;
  vertexCount = 0;

  constructor(vertexCapacity = DEFAULT_VERTEX_CAPACITY, indexCapacity = DEFAULT_INDEX_CAPACITY) {
    const vertices = Math.max(1, vertexCapacity);
    this.positionData = new Float32Array(vertices * 3);
    this.normalData = new Int8Array(vertices * 4);
    this.uvData = new Float32Array(vertices * 2);
    this.matData = new Uint8Array(vertices * 4);
    this.unitData = new Uint16Array(vertices * 2);
    this.tintData = new Uint8Array(vertices * 4);
    this.indexData = new Uint32Array(Math.max(1, indexCapacity));
  }

  private ensureVertices(count: number): void {
    this.positionData = grow(this.positionData, count * 3, (n) => new Float32Array(n));
    this.normalData = grow(this.normalData, count * 4, (n) => new Int8Array(n));
    this.uvData = grow(this.uvData, count * 2, (n) => new Float32Array(n));
    this.matData = grow(this.matData, count * 4, (n) => new Uint8Array(n));
    this.unitData = grow(this.unitData, count * 2, (n) => new Uint16Array(n));
    this.tintData = grow(this.tintData, count * 4, (n) => new Uint8Array(n));
  }

  addVertex(vertex: VertexInput): number {
    const index = this.vertexCount;
    this.ensureVertices(index + 1);
    const p = index * 3;
    const n = index * 4;
    const u = index * 2;
    const [x, y, z] = vertex.position;
    const [nx, ny, nz] = vertex.normal;
    this.positionData[p] = x;
    this.positionData[p + 1] = y;
    this.positionData[p + 2] = z;
    this.normalData[n] = byteNormal(nx);
    this.normalData[n + 1] = byteNormal(ny);
    this.normalData[n + 2] = byteNormal(nz);
    this.normalData[n + 3] = 0;
    this.uvData[u] = vertex.uv?.[0] ?? 0;
    this.uvData[u + 1] = vertex.uv?.[1] ?? 0;
    this.matData[n] = byte(vertex.layer, 0);
    this.matData[n + 1] = byte(vertex.ao, 255);
    this.matData[n + 2] = byte(vertex.flags, 0);
    this.matData[n + 3] = byte(vertex.facade, 0);
    this.unitData[u] = word(vertex.unit);
    this.unitData[u + 1] = word(vertex.localHeightCm);
    const tint = vertex.tint;
    this.tintData[n] = byte(tint?.[0], 255);
    this.tintData[n + 1] = byte(tint?.[1], 255);
    this.tintData[n + 2] = byte(tint?.[2], 255);
    this.tintData[n + 3] = byte(tint?.[3], 255);
    this.minX = Math.min(this.minX, x);
    this.minY = Math.min(this.minY, y);
    this.minZ = Math.min(this.minZ, z);
    this.maxX = Math.max(this.maxX, x);
    this.maxY = Math.max(this.maxY, y);
    this.maxZ = Math.max(this.maxZ, z);
    this.vertexCount += 1;
    return index;
  }

  addTriangle(a: number, b: number, c: number): void {
    for (const index of [a, b, c])
      if (!Number.isInteger(index) || index < 0 || index >= this.vertexCount)
        throw new RangeError(`BUILDGEN_INDEX_OUT_OF_RANGE:${index}/${this.vertexCount}`);
    this.indexData = grow(this.indexData, this.indexCount + 3, (n) => new Uint32Array(n));
    this.indexData[this.indexCount] = a;
    this.indexData[this.indexCount + 1] = b;
    this.indexData[this.indexCount + 2] = c;
    this.indexCount += 3;
  }

  finish(): MeshPayload {
    const positions = this.positionData.slice(0, this.vertexCount * 3);
    const rawIndices = this.indexData.slice(0, this.indexCount);
    const index = this.vertexCount > 65_535 ? rawIndices : new Uint16Array(rawIndices);
    const bounds =
      this.vertexCount === 0
        ? new Float32Array(6)
        : new Float32Array([this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ]);
    return {
      position: positions,
      normal: this.normalData.slice(0, this.vertexCount * 4),
      uv: this.uvData.slice(0, this.vertexCount * 2),
      mat: this.matData.slice(0, this.vertexCount * 4),
      unit: this.unitData.slice(0, this.vertexCount * 2),
      tint: this.tintData.slice(0, this.vertexCount * 4),
      index,
      bounds,
    };
  }
}
