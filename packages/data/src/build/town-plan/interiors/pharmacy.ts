import { floorDivInt } from '@tianshu/shared';
import type { FixtureTuple, RectMm } from '../types';
import type { InteriorTemplateInput, InteriorTemplateResult } from './solver';

const CABINET_D = 450;
const COUNTER_D = 350;
const AISLE = 800;

const fixture = (
  idx: number,
  cx: number,
  cz: number,
  w: number,
  d: number,
  yaw: 0 | 1 | 2 | 3 = 0,
  blocks: 0 | 1 = 1,
): FixtureTuple => [idx, cx, cz, w, d, yaw, blocks];

/** Full-width apothecary cabinet, medicine counter and stations. */
export function planPharmacy(input: InteriorTemplateInput): InteriorTemplateResult {
  const counterW = input.widthMm < 3_600 ? input.widthMm - 400 : 2_400;
  const wantedZ = input.room[1] + CABINET_D + AISLE + floorDivInt(COUNTER_D, 2);
  const counterZ = wantedZ;
  const counterRear = counterZ - floorDivInt(COUNTER_D, 2);
  const counterFront = counterZ + COUNTER_D - floorDivInt(COUNTER_D, 2);
  const aisleBack = input.room[1] + CABINET_D;
  const fixtures: FixtureTuple[] = [
    fixture(3, 0, input.room[1] + floorDivInt(CABINET_D, 2), input.widthMm, CABINET_D),
    fixture(0, 0, counterZ, counterW, COUNTER_D),
    fixture(39, 0, counterZ, 800, 350, 0, 0),
    fixture(200, 0, floorDivInt(aisleBack + counterRear, 2), 0, 0, 0, 0),
    fixture(201, 0, counterFront + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.widthMm >= 5_300) {
    const passageSide = input.passage[0] + input.passage[2];
    const left = passageSide === 0 ? (input.propsSeed & 1) === 0 : passageSide > 0;
    fixtures.push(
      fixture(
        8,
        left ? input.room[0] + 175 : input.room[2] - 175,
        counterFront + 650,
        1_400,
        350,
        left ? 1 : 3,
      ),
    );
  }
  if (input.degrade < 3 && input.widthMm >= 5_300) {
    fixtures.push(
      fixture(208, floorDivInt(counterW, 4), floorDivInt(aisleBack + counterRear, 2), 0, 0, 0, 0),
    );
  }
  const aisle: RectMm = [input.room[0], input.room[1], input.room[2], counterRear];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
