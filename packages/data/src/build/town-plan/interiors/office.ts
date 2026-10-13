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

/** Bound-yamen courtroom with dais, magistrate desk, screen, tally rack, and four runners. */
export function planOffice(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const fixtures: FixtureTuple[] = [
    fixture(34, 0, rear + 150, 2_400, 300),
    fixture(35, 0, rear + 900, 2_400, 1_200, 0, 0),
    fixture(0, 0, rear + 1_050, 1_800, 550),
    fixture(20, input.room[0] + 200, rear + 1_700, 1_400, 400, 1),
    fixture(210, 0, rear + 650, 0, 0, 0, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  const guardZ = rear + 2_500;
  for (const x of [-2_400, -1_400, 1_400, 2_400]) {
    fixtures.push(fixture(206, x, guardZ, 0, 0, 2, 0));
  }
  return { fixtures, excluded: [] };
}
