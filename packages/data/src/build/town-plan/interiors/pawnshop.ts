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

/** Barred high counter with an 800 mm staff gate and a raised keeper position. */
export function planPawnshop(input: InteriorTemplateInput): InteriorTemplateResult {
  const gateW = 800;
  const counterW = input.widthMm - gateW;
  const leftW = floorDivInt(counterW, 2);
  const rightW = counterW - leftW;
  const desiredZ = input.room[1] + 1_500;
  const latestZ = input.passage[1] - 300;
  const counterZ = desiredZ < latestZ ? desiredZ : latestZ;
  const counterRear = counterZ - 300;
  const counterFront = counterZ + 300;
  const keeperZ = floorDivInt(input.room[1] + counterRear, 2);
  const fixtures: FixtureTuple[] = [
    fixture(1, input.room[0] + floorDivInt(leftW, 2), counterZ, leftW, 600),
    fixture(1, input.room[2] - floorDivInt(rightW, 2), counterZ, rightW, 600),
    fixture(42, 0, keeperZ, 800, 800, 0, 0),
    fixture(200, 0, keeperZ, 0, 0, 0, 0),
    fixture(201, 0, counterFront + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.depthMm >= 3_300) {
    fixtures.push(fixture(2, 0, input.room[1] + 200, input.widthMm - 800, 400));
  }
  const aisle: RectMm = [input.room[0], input.room[1], input.room[2], counterRear];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
