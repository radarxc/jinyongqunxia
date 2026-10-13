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

function tableSet(x: number, z: number): FixtureTuple[] {
  return [
    fixture(36, x, z, 1_600, 1_000),
    fixture(9, x - 1_000, z, 400, 400),
    fixture(9, x + 1_000, z, 400, 400),
    fixture(207, x, z - 800, 0, 0, 0, 0),
  ];
}

/** Two or three gambling tables, each with its own dealer, plus cash desk and enforcer. */
export function planCasino(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const counterZ = rear + 825;
  const counterRear = counterZ - 275;
  const fixtures: FixtureTuple[] = [
    ...tableSet(-1_700, rear + 1_350),
    ...tableSet(1_700, rear + 1_350),
    fixture(0, 0, counterZ, 1_600, 550),
    fixture(202, 0, rear + 275, 0, 0, 0, 0),
    fixture(206, input.room[2] - 600, input.room[3] - 700, 0, 0, 2, 0),
    fixture(201, 0, input.passage[1] + 500, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.depthMm >= 6_000) {
    fixtures.push(...tableSet(0, rear + 3_400));
  }
  const aisle: RectMm = [-800, rear, 800, counterRear];
  return { fixtures, excluded: [aisle] };
}
