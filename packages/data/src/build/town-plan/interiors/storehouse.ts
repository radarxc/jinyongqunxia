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

/** Paired rows of crates leave a central route from the entrance to the guard. */
export function planStorehouse(input: InteriorTemplateInput): InteriorTemplateResult {
  const rear = input.room[1];
  const fixtures: FixtureTuple[] = [
    fixture(23, -1_400, rear + 600, 600, 600),
    fixture(23, -1_400, rear + 1_400, 600, 600),
    fixture(23, 1_400, rear + 600, 600, 600),
    fixture(23, 1_400, rear + 1_400, 600, 600),
    fixture(206, -700, rear + 2_000, 0, 0, 2, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.depthMm >= 4_600) {
    fixtures.push(fixture(23, -1_400, rear + 2_200, 600, 600));
    fixtures.push(fixture(23, 1_400, rear + 2_200, 600, 600));
  }
  return { fixtures, excluded: [] };
}
