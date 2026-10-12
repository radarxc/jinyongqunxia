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

/** Residence hall: centred altar, square table, paired chairs and optional bed. */
export function planResidence(input: InteriorTemplateInput): InteriorTemplateResult {
  const centreZ = input.room[1] + 1_000;
  const fixtures: FixtureTuple[] = [
    fixture(11, 0, input.room[1] + 225, 2_000, 450),
    fixture(7, 0, centreZ, 1_000, 1_000),
    fixture(10, -825, centreZ, 650, 650, 1),
    fixture(10, 825, centreZ, 650, 650, 3),
    fixture(210, 0, centreZ + 850, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.widthMm >= 5_500) {
    const right = (input.interiorSeed & 1) === 0;
    fixtures.push(
      fixture(
        12,
        right ? input.room[2] - 700 : input.room[0] + 700,
        input.room[1] + 1_000,
        2_000,
        1_400,
        right ? 1 : 3,
      ),
    );
    fixtures.push(
      fixture(13, right ? input.room[0] + 450 : input.room[2] - 450, input.room[1] + 775, 900, 550),
    );
  }
  if (input.depthMm < 3_200) {
    fixtures[1] = fixture(7, 0, input.room[1] + 950, 900, 900);
  }
  return { fixtures, excluded: [] };
}
