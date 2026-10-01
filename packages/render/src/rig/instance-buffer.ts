import { DynamicDrawUsage, InstancedBufferAttribute, InstancedInterleavedBuffer, InterleavedBufferAttribute } from 'three';

export interface RigInstanceData {
  readonly uvRect: ArrayLike<number>;
  readonly affine2d: ArrayLike<number>;
  readonly anchorDepth: ArrayLike<number>;
  readonly sortTint: ArrayLike<number>;
}

export interface DirtyRange { readonly start: number; readonly count: number }
export interface RigInstanceBuffer {
  readonly capacity: number; readonly uvRect: InstancedBufferAttribute;
  readonly affine2d: InstancedInterleavedBuffer; readonly affineA: InterleavedBufferAttribute;
  readonly affineB: InterleavedBufferAttribute; readonly anchorDepth: InstancedBufferAttribute;
  readonly sortTint: InstancedBufferAttribute; readonly dirtyRanges: readonly DirtyRange[];
  write(index: number, data: RigInstanceData): boolean; flushDirtyRanges(): readonly DirtyRange[]; clear(): void;
}

function differs(target: ArrayLike<number>, offset: number, source: ArrayLike<number>, size: number): boolean {
  for (let index = 0; index < size; index += 1) if (target[offset + index] !== source[index]) return true;
  return false;
}

function differsFloat32(target: Float32Array, offset: number, source: ArrayLike<number>, size: number): boolean {
  for (let index = 0; index < size; index += 1) if (target[offset + index] !== Math.fround(source[index] ?? 0)) return true;
  return false;
}

function copy(target: { [index: number]: number }, offset: number, source: ArrayLike<number>, size: number): void {
  for (let index = 0; index < size; index += 1) target[offset + index] = source[index] ?? 0;
}

function differsNormalized(target: ArrayLike<number>, offset: number, source: ArrayLike<number>): boolean {
  for (let index = 0; index < 4; index += 1) {
    const quantized = Math.round(Math.min(1, Math.max(0, source[index] ?? 0)) * 65_535);
    if (target[offset + index] !== quantized) return true;
  }
  return false;
}

function copyNormalized(target: Uint16Array, offset: number, source: ArrayLike<number>): void {
  for (let index = 0; index < 4; index += 1) target[offset + index] = Math.round(Math.min(1, Math.max(0, source[index] ?? 0)) * 65_535);
}

export function createRigInstanceBuffer(capacity = 2_000): RigInstanceBuffer {
  const uvArray = new Uint16Array(capacity * 4);
  const affineArray = new Float32Array(capacity * 6);
  const anchorArray = new Float32Array(capacity * 4);
  const sortArray = new Uint16Array(capacity * 4);
  const uvRect = new InstancedBufferAttribute(uvArray, 4, true).setUsage(DynamicDrawUsage);
  const affine2d = new InstancedInterleavedBuffer(affineArray, 6).setUsage(DynamicDrawUsage);
  const affineA = new InterleavedBufferAttribute(affine2d, 3, 0);
  const affineB = new InterleavedBufferAttribute(affine2d, 3, 3);
  const anchorDepth = new InstancedBufferAttribute(anchorArray, 4).setUsage(DynamicDrawUsage);
  const sortTint = new InstancedBufferAttribute(sortArray, 4, false).setUsage(DynamicDrawUsage);
  const dirty = new Uint8Array(capacity);
  const rangePool: Array<{ start: number; count: number }> = Array.from({ length: capacity }, () => ({ start: 0, count: 0 }));
  const uvRangePool: Array<{ start: number; count: number }> = Array.from({ length: capacity }, () => ({ start: 0, count: 0 }));
  const affineRangePool: Array<{ start: number; count: number }> = Array.from({ length: capacity }, () => ({ start: 0, count: 0 }));
  const anchorRangePool: Array<{ start: number; count: number }> = Array.from({ length: capacity }, () => ({ start: 0, count: 0 }));
  const sortRangePool: Array<{ start: number; count: number }> = Array.from({ length: capacity }, () => ({ start: 0, count: 0 }));
  const ranges: Array<{ start: number; count: number }> = [];
  let rangeCount = 0;

  function write(index: number, data: RigInstanceData): boolean {
    if (!Number.isInteger(index) || index < 0 || index >= capacity) throw new RangeError('RIG_INSTANCE_INDEX');
    const changed = differsNormalized(uvArray, index * 4, data.uvRect)
      || differsFloat32(affineArray, index * 6, data.affine2d, 6)
      || differsFloat32(anchorArray, index * 4, data.anchorDepth, 4)
      || differs(sortArray, index * 4, data.sortTint, 4);
    if (!changed) return false;
    copyNormalized(uvArray, index * 4, data.uvRect); copy(affineArray, index * 6, data.affine2d, 6);
    copy(anchorArray, index * 4, data.anchorDepth, 4); copy(sortArray, index * 4, data.sortTint, 4);
    dirty[index] = 1;
    return true;
  }

  function flushDirtyRanges(): readonly DirtyRange[] {
    uvRect.clearUpdateRanges(); affine2d.clearUpdateRanges(); anchorDepth.clearUpdateRanges(); sortTint.clearUpdateRanges();
    rangeCount = 0;
    let start = -1;
    for (let index = 0; index <= capacity; index += 1) {
      if (index < capacity && dirty[index]) { if (start < 0) start = index; dirty[index] = 0; continue; }
      if (start < 0) continue;
      const range = rangePool[rangeCount];
      if (range) { range.start = start; range.count = index - start; ranges[rangeCount] = range; }
      rangeCount += 1;
      const count = index - start;
      const uvRange = uvRangePool[rangeCount - 1]!; uvRange.start = start * 4; uvRange.count = count * 4; uvRect.updateRanges.push(uvRange);
      const affineRange = affineRangePool[rangeCount - 1]!; affineRange.start = start * 6; affineRange.count = count * 6; affine2d.updateRanges.push(affineRange);
      const anchorRange = anchorRangePool[rangeCount - 1]!; anchorRange.start = start * 4; anchorRange.count = count * 4; anchorDepth.updateRanges.push(anchorRange);
      const sortRange = sortRangePool[rangeCount - 1]!; sortRange.start = start * 4; sortRange.count = count * 4; sortTint.updateRanges.push(sortRange);
      start = -1;
    }
    ranges.length = rangeCount;
    if (rangeCount > 0) { uvRect.needsUpdate = true; affine2d.needsUpdate = true; anchorDepth.needsUpdate = true; sortTint.needsUpdate = true; }
    return ranges;
  }

  return { capacity, uvRect, affine2d, affineA, affineB, anchorDepth, sortTint, get dirtyRanges() { return ranges; },
    write, flushDirtyRanges, clear() { uvArray.fill(0); affineArray.fill(0); anchorArray.fill(0); sortArray.fill(0); dirty.fill(1); } };
}
