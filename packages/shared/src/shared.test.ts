import { describe, expect, it } from 'vitest';
import {
  asSkillId, canonicalJson, ceilDivInt, clampInt, floorDivInt, mulBpFloor,
} from './index';

describe('shared deterministic helpers', () => {
  it('uses integer basis points with floor semantics', () => {
    expect(mulBpFloor(999, 3_333)).toBe(332);
    expect(clampInt(12_000, 0, 10_000)).toBe(10_000);
  });

  it('divides safe integers with exact floor and ceiling semantics', () => {
    expect(floorDivInt(61, 60)).toBe(1);
    expect(ceilDivInt(61, 60)).toBe(2);
    expect(floorDivInt(-61, 60)).toBe(-2);
    expect(ceilDivInt(-61, 60)).toBe(-1);
    expect(floorDivInt(61, -60)).toBe(-2);
    expect(ceilDivInt(61, -60)).toBe(-1);
    expect(floorDivInt(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('rejects invalid integer division operands', () => {
    expect(() => floorDivInt(1, 0)).toThrow('INT_DIV_ZERO');
    expect(() => ceilDivInt(0.5, 1)).toThrow('INT_DIV_INTEGER_REQUIRED');
    expect(() => floorDivInt(Number.MAX_SAFE_INTEGER + 1, 1))
      .toThrow('INT_DIV_INTEGER_REQUIRED');
  });

  it('serializes keys by Unicode code point and normalizes negative zero', () => {
    expect(canonicalJson({ '\ufffd': 1, '\ud83d\ude00': -0, a: [true, null] })).toBe(
      '{"a":[true,null],"�":1,"😀":0}',
    );
  });

  it('rejects invalid JSON values', () => {
    expect(() => canonicalJson(Number.NaN)).toThrow('NON_FINITE_NUMBER');
    expect(() => canonicalJson('\ud800')).toThrow('LONE_SURROGATE');
    expect(() => canonicalJson({ ok: undefined } as never)).toThrow('UNDEFINED_JSON');
    expect(() => canonicalJson(new Array(1) as never)).toThrow('SPARSE_ARRAY');
    const cycle: { self?: unknown } = {};
    cycle.self = cycle;
    expect(() => canonicalJson(cycle as never)).toThrow('CYCLIC_JSON');
  });

  it('validates branded IDs at runtime boundaries', () => {
    expect(asSkillId('sk_xianglong18')).toBe('sk_xianglong18');
    expect(() => asSkillId('npc_xiaofeng')).toThrow('INVALID_SKILL_ID');
    for (const invalid of ['sk_', 'sk_BaiHong', 'sk_bai-hong', 'sk_bai/hong', 'sk_白虹']) {
      expect(() => asSkillId(invalid)).toThrow('INVALID_SKILL_ID');
    }
  });
});
