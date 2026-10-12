import { describe, expect, it } from 'vitest';
import { BUILDGEN_VERTEX_STRIDE_BYTES, MeshBufferBuilder } from './mesher/core/buffer';

const VERTEX = {
  position: [1, 2, 3],
  normal: [0, 1, 0],
  uv: [4, 5],
  layer: 2,
  ao: 128,
  flags: 1,
  facade: 8,
  unit: 7,
  localHeightCm: 200,
  tint: [250, 240, 230, 220],
} as const;

describe('MeshBufferBuilder', () => {
  it('emits only typed arrays in the 36-byte vertex format', () => {
    const builder = new MeshBufferBuilder(1, 1);
    const a = builder.addVertex(VERTEX);
    const b = builder.addVertex(VERTEX);
    const c = builder.addVertex(VERTEX);
    builder.addTriangle(a, b, c);
    const mesh = builder.finish();
    expect(BUILDGEN_VERTEX_STRIDE_BYTES).toBe(36);
    expect(Object.values(mesh).every((value) => ArrayBuffer.isView(value))).toBe(true);
    const bytes =
      mesh.position.byteLength +
      mesh.normal.byteLength +
      mesh.uv.byteLength +
      mesh.mat.byteLength +
      mesh.unit.byteLength +
      mesh.tint.byteLength;
    expect(bytes / builder.vertexCount).toBe(BUILDGEN_VERTEX_STRIDE_BYTES);
    expect(mesh.bounds).toEqual(new Float32Array([1, 2, 3, 1, 2, 3]));
  });

  it('switches to Uint32 indices above 65,535 vertices', () => {
    const builder = new MeshBufferBuilder(65_536, 3);
    for (let index = 0; index < 65_536; index += 1) builder.addVertex(VERTEX);
    builder.addTriangle(0, 65_534, 65_535);
    expect(builder.finish().index).toBeInstanceOf(Uint32Array);
  });
});
