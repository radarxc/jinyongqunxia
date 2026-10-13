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

/** Wall mangers and hay with a stablehand and a reachable visitor station. */
export function planStable(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const fixtures: FixtureTuple[] = [
    fixture(29, input.room[0] + 300, rear + 900, 1_800, 600, 1),
    fixture(29, input.room[2] - 300, rear + 900, 1_800, 600, 3),
    fixture(28, 0, rear + 350, 1_200, 700),
    fixture(204, input.room[0] + 1_150, rear + 1_900, 0, 0, 2, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.widthMm >= 6_800) {
    fixtures.push(fixture(28, 1_800, rear + 350, 1_200, 700));
  }
  return { fixtures, excluded: [] };
}
