import { floorDivInt } from '@tianshu/shared';
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

/** Martial school with paired weapon racks, master dais, and training dummy. */
export function planSchool(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const side = floorDivInt(input.widthMm, 2) - 200;
  const fixtures: FixtureTuple[] = [
    fixture(35, 0, rear + 600, 2_400, 1_200, 0, 0),
    fixture(10, 0, rear + 350, 650, 650),
    fixture(0, 0, rear + 925, 1_000, 450),
    fixture(19, -side, rear + 1_250, 1_600, 400, 1),
    fixture(19, side, rear + 1_250, 1_600, 400, 3),
    fixture(211, 0, rear + 350, 0, 0, 0, 0),
    fixture(208, -side + 600, rear + 2_500, 0, 0, 2, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1) {
    const dummyX = (input.interiorSeed & 1) === 0 ? -1_700 : 1_700;
    fixtures.push(fixture(37, dummyX, rear + 2_750, 700, 700));
    fixtures.push(fixture(22, -dummyX, rear + 2_750, 600, 600));
  }
  return { fixtures, excluded: [] };
}
