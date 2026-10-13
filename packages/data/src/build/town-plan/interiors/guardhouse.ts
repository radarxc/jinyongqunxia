import type { FixtureTuple } from '../types';
import type { InteriorTemplateInput, InteriorTemplateResult } from './solver';

const fixture = (
  idx: number,
  cx: number,
  cz: number,
  w: number,
  d: number,
  yaw: 0 | 1 | 2 | 3 = 0,
  blocks: 0 | 1 = 1,
): FixtureTuple => [idx, cx, cz, w, d, yaw, blocks];

/** Compact watch post with desk, bench, weapon rack, and duty guard. */
export function planGuardhouse(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const fixtures: FixtureTuple[] = [
    fixture(7, -600, rear + 700, 1_000, 1_000),
    fixture(8, 700, rear + 700, 1_400, 350),
    fixture(19, input.room[2] - 200, rear + 800, 1_600, 400, 3),
    fixture(206, -600, rear + 1_700, 0, 0, 2, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  return { fixtures, excluded: [] };
}
