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

/** Closed stall: counter at street edge, vendor behind it and customer in the street. */
export function planStall(input: InteriorTemplateInput): InteriorTemplateResult {
  const counterW = input.widthMm - 400;
  const frontZ = input.room[3] - 300;
  const fixtures: FixtureTuple[] = [
    fixture(21, 0, frontZ, counterW, 600),
    fixture(39, 0, frontZ, counterW - 200, 350, 0, 0),
    fixture(204, 0, frontZ - 650, 0, 0, 0, 0),
    fixture(201, 0, input.room[3] + 600, 0, 0, 2, 0),
  ];
  if (input.facility === 'stall_food') {
    fixtures.push(fixture(15, input.room[0] + 600, input.room[1] + 500, 1_000, 800));
  } else if (input.degrade < 1) {
    fixtures.push(fixture(23, input.room[0] + 500, input.room[1] + 300, 600, 600));
  }
  const span = floorDivInt(input.widthMm, 2);
  return { fixtures, excluded: [[-span, input.room[1], input.widthMm - span, input.room[3]]] };
}
