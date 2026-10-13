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

/** Bank counter with ledger clutter, money chest, screen, clerk, guard, and customer. */
export function planBank(input: InteriorTemplateInput): InteriorTemplateResult {
  const counterW = input.widthMm < 3_200 ? input.widthMm - 400 : 2_400;
  const desiredZ = input.room[1] + 1_375;
  const latestZ = input.passage[1] - 275;
  const counterZ = desiredZ < latestZ ? desiredZ : latestZ;
  const counterRear = counterZ - 275;
  const counterFront = counterZ + 275;
  const guardX = floorDivInt(counterW, 2) + 450;
  const fixtures: FixtureTuple[] = [
    fixture(0, 0, counterZ, counterW, 550),
    fixture(39, 0, counterZ, 800, 350, 0, 0),
    fixture(13, input.room[0] + 450, input.room[1] + 575, 900, 550),
    fixture(202, 0, floorDivInt(input.room[1] + counterRear, 2), 0, 0, 0, 0),
    fixture(206, guardX, counterFront + 500, 0, 0, 2, 0),
    fixture(201, 0, counterFront + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1) {
    fixtures.push(fixture(34, 0, input.room[1] + 150, counterW, 300));
  }
  const aisle: RectMm = [
    -floorDivInt(counterW, 2),
    input.room[1],
    counterW - floorDivInt(counterW, 2),
    counterRear,
  ];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
