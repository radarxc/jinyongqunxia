import { describe, expect, it } from 'vitest';
import { matchFormation, resolveAreaCells } from './index';

describe('battle area and formation', () => {
  it('resolves and clips primitive shapes against the authoritative grid', () => {
    const available = [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }];
    expect(resolveAreaCells({ tpl: 'aoe_disk', r: 1 }, {
      origin: { q: 0, r: 0 }, anchor: { q: 0, r: 0 }, available,
    })).toEqual(available);
  });

  it('resolves self, single, line, cone, ring and spokes through one entrypoint', () => {
    const input = { origin: { q: 2, r: -1 }, anchor: { q: 3, r: -1 },
      aim: { dirCount: 6, dir: 0 } as const };
    expect(resolveAreaCells({ tpl: 'aoe_self' }, input)).toEqual([{ q: 2, r: -1 }]);
    expect(resolveAreaCells({ tpl: 'aoe_single' }, input)).toEqual([{ q: 3, r: -1 }]);
    expect(resolveAreaCells({ tpl: 'aoe_line', n: 2 }, input)).toEqual([
      { q: 3, r: -1 }, { q: 4, r: -1 },
    ]);
    expect(resolveAreaCells({ tpl: 'aoe_cone', r: 3, angle: 60, dirCount: 6 }, input)).toHaveLength(7);
    expect(resolveAreaCells({ tpl: 'aoe_ring', r: 2 }, input)).toHaveLength(12);
    expect(resolveAreaCells({ tpl: 'aoe_spokes', r: 2 }, input)).toHaveLength(13);
  });

  it('selects a deterministic rotated formation match', () => {
    const match = matchFormation([
      { q: 0, r: 0, required: true },
      { q: 1, r: 0, required: true },
      { q: 0, r: 1, required: true },
    ], [
      { unitId: 'u2', unitIndex: 2, pos: { q: 0, r: 1 } },
      { unitId: 'u0', unitIndex: 0, pos: { q: 0, r: 0 } },
      { unitId: 'u1', unitIndex: 1, pos: { q: 1, r: 0 } },
    ]);
    expect(match).toEqual({ formed: true, rotation: 0, anchorUnitId: 'u0',
      memberIds: ['u0', 'u1', 'u2'], totalDeviation: 0 });
  });
});
