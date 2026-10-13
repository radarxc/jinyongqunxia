import { floorDivInt } from '@tianshu/shared';
import type { FixtureTuple, RectMm } from '../types';
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

/** Back and side bookcases, sales counter, and an optional reading table. */
export function planBooks(input: InteriorTemplateInput): InteriorTemplateResult {
  const counterW = input.widthMm < 2_000 ? input.widthMm - 400 : 1_600;
  const desiredZ = input.room[1] + 1_475;
  const latestZ = input.passage[1] - 275;
  const counterZ = desiredZ < latestZ ? desiredZ : latestZ;
  const counterRear = counterZ - 275;
  const counterFront = counterZ + 275;
  const sideX = input.room[0] + 200;
  const fixtures: FixtureTuple[] = [
    fixture(5, 0, input.room[1] + 200, input.widthMm - 800, 400),
    fixture(5, sideX, input.room[1] + 1_200, 1_600, 400, 1),
    fixture(0, 0, counterZ, counterW, 550),
    fixture(200, 0, floorDivInt(input.room[1] + 400 + counterRear, 2), 0, 0, 0, 0),
    fixture(201, 0, counterFront + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.widthMm >= 5_300) {
    fixtures.push(fixture(6, input.room[2] - 700, counterFront + 700, 1_200, 600));
  }
  const aisle: RectMm = [
    -floorDivInt(counterW, 2),
    input.room[1],
    counterW - floorDivInt(counterW, 2),
    counterRear,
  ];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
