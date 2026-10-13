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

/** Cloth racks, full cutting table, and a keeper-only work band. */
export function planCloth(input: InteriorTemplateInput): InteriorTemplateResult {
  const tableW = input.widthMm < 3_200 ? input.widthMm - 400 : 2_400;
  const desiredZ = input.room[1] + 1_700;
  const latestZ = input.passage[1] - 400;
  const tableZ = desiredZ < latestZ ? desiredZ : latestZ;
  const tableRear = tableZ - 400;
  const tableFront = tableZ + 400;
  const rackX = floorDivInt(input.widthMm, 2) - 250;
  const rackZ = input.room[1] + 250;
  const fixtures: FixtureTuple[] = [
    fixture(4, -rackX, rackZ, 500, 500),
    fixture(4, rackX, rackZ, 500, 500),
    fixture(21, 0, tableZ, tableW, 800),
    fixture(200, 0, floorDivInt(input.room[1] + tableRear, 2), 0, 0, 0, 0),
    fixture(201, 0, tableFront + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1) fixtures.push(fixture(39, 0, tableZ, 400, 400, 0, 0));
  const aisle: RectMm = [
    -floorDivInt(tableW, 2),
    input.room[1],
    tableW - floorDivInt(tableW, 2),
    tableRear,
  ];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
