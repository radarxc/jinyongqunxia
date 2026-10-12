import { describe, expect, it } from 'vitest';
import { generateCells } from '../mesher/generate';
import { MINI_BUILD_KIT, MINI_BUILDING_PLANS } from '../testing/mini-plans';
import { withoutHangingSignTriangles } from './payloads';

describe('render payload adapters', () => {
  it('consumes r1 hanging metadata so the structural sign is replaced by one instance quad', () => {
    const plan = { ...MINI_BUILDING_PLANS[0]!, signage: ['shop.name', 0] as const };
    const cell = generateCells([plan], MINI_BUILD_KIT, 0, 32)[0]!;
    const adapted = withoutHangingSignTriangles(cell);
    expect(cell.signs).toHaveLength(6);
    expect(adapted.shell.index.length).toBeLessThan(cell.shell.index.length);
    expect(adapted.signs).toBe(cell.signs);
    let signVertexCount = 0;
    for (let offset = 0; offset < cell.hanging.length;) {
      const target = cell.hanging[offset++]!,
        kind = cell.hanging[offset++]!;
      const count = cell.hanging[offset++]!;
      if (target === 0 && kind === 1) signVertexCount += count;
      offset += count;
    }
    expect(signVertexCount).toBeGreaterThan(0);
  });
});
