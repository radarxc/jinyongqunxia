import { describe, expect, it } from 'vitest';
import { asSkillId, canonicalJson, clampInt, mulBpFloor } from './index';

describe('shared deterministic helpers', () => {
  it('uses integer basis points with floor semantics', () => {
    expect(mulBpFloor(999, 3_333)).toBe(332);
    expect(clampInt(12_000, 0, 10_000)).toBe(10_000);
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
