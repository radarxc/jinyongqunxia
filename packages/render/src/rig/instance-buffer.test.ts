import { describe, expect, it } from 'vitest';
import { createRigInstanceBuffer, type RigInstanceData } from './instance-buffer';

function value(seed: number): RigInstanceData {
  return {
    uvRect: [.1, .2, .3, .4], affine2d: [seed, 0, 1, 0, seed, 2],
    anchorDepth: [seed, 0, 0, .35], sortTint: [seed, 20, 65_535, 1],
  };
}

describe('createRigInstanceBuffer', () => {
  it('uploads only merged ranges containing changed instances', () => {
    const buffer = createRigInstanceBuffer(8);
    expect(buffer.write(2, value(2))).toBe(true);
    expect(buffer.write(4, value(4))).toBe(true);
    expect(buffer.write(5, value(5))).toBe(true);
    expect(buffer.flushDirtyRanges()).toEqual([{ start: 2, count: 1 }, { start: 4, count: 2 }]);
    expect(buffer.uvRect.updateRanges).toEqual([{ start: 8, count: 4 }, { start: 16, count: 8 }]);
    expect(buffer.affine2d.updateRanges).toEqual([{ start: 12, count: 6 }, { start: 24, count: 12 }]);
  });

  it('does not dirty unchanged data and keeps the 56-byte instance layout', () => {
    const buffer = createRigInstanceBuffer(2);
    expect(buffer.write(1, value(1))).toBe(true); buffer.flushDirtyRanges();
    expect(buffer.write(1, value(1))).toBe(false); expect(buffer.flushDirtyRanges()).toEqual([]);
    const bytes = buffer.uvRect.array.BYTES_PER_ELEMENT * 4
      + buffer.affine2d.array.BYTES_PER_ELEMENT * 6
      + buffer.anchorDepth.array.BYTES_PER_ELEMENT * 4
      + buffer.sortTint.array.BYTES_PER_ELEMENT * 4;
    expect(bytes).toBe(56);
  });

  it('rejects indices outside the preallocated range', () => {
    const buffer = createRigInstanceBuffer(1);
    expect(() => buffer.write(1, value(1))).toThrowError('RIG_INSTANCE_INDEX');
  });

  it('copies a contiguous affine block without per-instance writes', () => {
    const buffer = createRigInstanceBuffer(4);
    const source = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    buffer.writeAffineBlock(1, source);
    expect(Array.from(buffer.affine2d.array.slice(6, 18))).toEqual(Array.from(source));
    expect(buffer.flushDirtyRanges()).toEqual([{ start: 1, count: 2 }]);
    expect(() => buffer.writeAffineBlock(3, source)).toThrowError('RIG_INSTANCE_INDEX');
  });
});
