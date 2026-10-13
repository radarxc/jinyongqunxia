import { floorDivInt } from '@tianshu/shared';
import type { FixtureTuple } from '../types';
import type { InteriorTemplateInput, InteriorTemplateResult } from './solver';

export const ESCORT_CENTRAL_AISLE_MM = 1_600;

const fixture = (
  idx: number,
  cx: number,
  cz: number,
  w: number,
  d: number,
  yaw: 0 | 1 | 2 | 3 = 0,
  blocks: 0 | 1 = 1,
): FixtureTuple => [idx, cx, cz, w, d, yaw, blocks];

/** Escort reception with a rear dais and symmetric seats outside a wide central aisle. */
export function planEscort(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const sideX = floorDivInt(input.widthMm, 2) - 1_125;
  const fixtures: FixtureTuple[] = [
    fixture(35, 0, rear + 600, 2_400, 1_200, 0, 0),
    fixture(10, 0, rear + 350, 650, 650),
    fixture(0, 0, rear + 925, 1_000, 450),
    fixture(210, 0, rear + 350, 0, 0, 0, 0),
    fixture(202, -sideX, rear + 1_650, 0, 0, 0, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  for (const x of [-sideX, sideX]) {
    const yaw = x < 0 ? 3 : 1;
    fixtures.push(fixture(10, x, rear + 1_950, 650, 650, yaw));
    fixtures.push(fixture(7, x, rear + 2_700, 500, 500));
    fixtures.push(fixture(10, x, rear + 3_450, 650, 650, yaw));
  }
  if (input.degrade < 1) {
    fixtures.push(fixture(38, input.room[0] + 250, rear + 250, 500, 500));
    fixtures.push(fixture(38, input.room[2] - 250, rear + 250, 500, 500));
    fixtures.push(fixture(19, input.room[0] + 200, rear + 2_100, 1_600, 400, 1));
  }
  return { fixtures, excluded: [] };
}
