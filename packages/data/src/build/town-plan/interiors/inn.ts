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

function tableSet(cx: number, cz: number): FixtureTuple[] {
  return [
    fixture(7, cx, cz, 1_000, 1_000),
    fixture(9, cx - 700, cz, 400, 400),
    fixture(9, cx, cz - 700, 400, 400),
  ];
}

/** Inn hall with side-back desk, opposite-wall stair and one or two table sets. */
export function planInn(input: InteriorTemplateInput): InteriorTemplateResult {
  const mirror = (input.interiorSeed & 1) === 0 ? 1 : -1;
  const counterX = mirror > 0 ? input.room[0] + 1_100 : input.room[2] - 1_100;
  const stairX = mirror > 0 ? input.room[2] - 450 : input.room[0] + 450;
  const counterZ = input.room[1] + 1_075;
  const stairZ = input.passage[1] - 1_500;
  const rear = input.room[1];
  const fixtures: FixtureTuple[] = [
    fixture(0, counterX, counterZ, 1_800, 550),
    fixture(14, stairX, stairZ, 3_000, 900, mirror > 0 ? 1 : 3),
    fixture(200, counterX, floorDivInt(input.room[1] + counterZ - 275, 2), 0, 0, 0, 0),
    fixture(201, counterX, counterZ + 875, 0, 0, 2, 0),
  ];
  const tableX = mirror * 450;
  fixtures.push(...tableSet(tableX, 250));
  if (input.degrade < 1 && input.widthMm >= 8_000 && input.depthMm >= 5_800) {
    fixtures.push(...tableSet(-mirror * 2_150, input.passage[1] - 500));
  }
  if (input.degrade < 1) {
    fixtures.push(
      fixture(
        26,
        mirror > 0 ? input.room[0] + 650 : input.room[2] - 650,
        counterZ + 900,
        1_200,
        700,
      ),
    );
  }
  if (input.degrade < 3) fixtures.push(fixture(203, tableX, 1_250, 0, 0, 2, 0));
  const aisle: RectMm = [counterX - 900, rear, counterX + 900, counterZ - 275];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
