import { describe, expect, it } from 'vitest';
import { hashHex } from './mesher/core/hash';
import { inspectInv2, inspectInv4, inspectInv6 } from './mesher/core/inspect';
import { recipeFor } from './mesher/recipes';
import { roofMesherFor } from './mesher/roof';
import { MINI_BUILDING_PLANS } from './testing/mini-plans';
import { createBuildingLayer } from './three/layer';
import { buildgenNotImplemented, cutFacadeMask, type MeshPayload } from './types';

const EMPTY_MESH: MeshPayload = {
  position: new Float32Array(),
  normal: new Int8Array(),
  uv: new Float32Array(),
  mat: new Uint8Array(),
  unit: new Uint16Array(),
  tint: new Uint8Array(),
  index: new Uint16Array(),
  bounds: new Float32Array(6),
};
describe('buildgen extension stubs', () => {
  it('keeps FNV hashes in fixed-width hexadecimal', () => expect(hashHex(1)).toBe('00000001'));
  it('rejects unknown recipes', () =>
    expect(() => recipeFor('unknown' as never)).toThrow('BUILDGEN_UNKNOWN_RECIPE'));
  it('keeps only the INV-6 stub after r1', () => {
    const plan = MINI_BUILDING_PLANS[0]!;
    expect(inspectInv2(EMPTY_MESH, [plan])).toEqual([]);
    expect(inspectInv4(EMPTY_MESH, [plan])).toEqual([]);
    expect(() => inspectInv6(EMPTY_MESH, [plan])).toThrow('BUILDGEN_NOT_IMPLEMENTED:inspectInv6');
  });
  it('exports deliberate roof, facade and layer stubs', () => {
    expect(() => roofMesherFor(1)(MINI_BUILDING_PLANS[0]!, 0, {} as never)).toThrow(
      'BUILDGEN_NOT_IMPLEMENTED:roofMesher',
    );
    expect(() => cutFacadeMask(45)).toThrow('BUILDGEN_NOT_IMPLEMENTED:cutFacadeMask');
    expect(() => createBuildingLayer({} as never)).toThrow(
      'BUILDGEN_NOT_IMPLEMENTED:createBuildingLayer',
    );
    expect(() => buildgenNotImplemented('test')).toThrow('BUILDGEN_NOT_IMPLEMENTED:test');
  });
});
