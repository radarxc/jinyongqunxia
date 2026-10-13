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

/** Centred half-width altar and statue, with low non-blocking cushions. */
export function planTemple(input: InteriorTemplateInput): InteriorTemplateResult {
  const altarW = floorDivInt(input.widthMm, 2);
  const altarZ = input.room[1] + 600;
  const offeringZ = input.room[1] + 1_425;
  const fixtures: FixtureTuple[] = [
    fixture(30, 0, altarZ, altarW, 1_200),
    fixture(31, 0, input.room[1] + 400, 1_000, 800, 0, 0),
    fixture(11, 0, offeringZ, altarW < 2_000 ? altarW : 2_000, 450),
    fixture(32, input.room[2] - 300, offeringZ + 475, 500, 500),
    fixture(205, floorDivInt(altarW, 2) + 500, offeringZ + 450, 0, 0, 2, 0),
    fixture(201, 0, input.passage[1] + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 2) {
    const z = offeringZ + 1_050;
    fixtures.push(fixture(33, -600, z, 500, 500, 0, 0));
    fixtures.push(fixture(33, 0, z, 500, 500, 0, 0));
    fixtures.push(fixture(33, 600, z, 500, 500, 0, 0));
  }
  return { fixtures, excluded: [] };
}
