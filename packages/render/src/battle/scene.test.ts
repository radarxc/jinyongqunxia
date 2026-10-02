import { describe, expect, it } from 'vitest';
import { chooseBattleCell, hexDirToRig } from './scene';
import type { BattleCell } from './types';

const cells: readonly BattleCell[] = [
  { q: 0, r: 0, height: 0, terrain: 'tr_pingdi', label: '甲', color: 0 },
  { q: 1, r: 0, height: 0, terrain: 'tr_pingdi', label: '乙', color: 0 },
];
describe('battle scene selection', () => {
  it('maps all six logical facings to rig octants', () => {
    expect([0, 1, 2, 3, 4, 5].map(value => hexDirToRig(value as 0))).toEqual([7, 6, 4, 3, 2, 0]);
  });
  it('chooses the cell whose projected centre is nearest on a shared edge', () => {
    expect(chooseBattleCell(cells, [
      { instanceId: 0, screenX: -0.3, screenY: 0 },
      { instanceId: 1, screenX: 0.1, screenY: 0 },
    ], { x: 0.04, y: 0 })).toBe(cells[1]);
  });
  it('breaks equal centre distances by stable row then column', () => {
    expect(chooseBattleCell(cells, [
      { instanceId: 1, screenX: 0.1, screenY: 0 },
      { instanceId: 0, screenX: -0.1, screenY: 0 },
    ], { x: 0, y: 0 })).toBe(cells[0]);
  });
});
