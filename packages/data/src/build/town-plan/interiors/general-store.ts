import { floorDivInt } from '@tianshu/shared';
import type { FixtureTuple, RectMm } from '../types';
import type { InteriorTemplateInput, InteriorTemplateResult } from './solver';

const BACK_SHELF_MM = 400;
const MIN_BACK_SHELF_MM = 300;
const AISLE_MM = 800;
const COUNTER_DEPTH_MM = 550;
/** Customer zone target depth in front of the counter: the 1400 door passage plus 50 mm. */
export const GENERAL_STORE_CUSTOMER_ZONE_MM = 1_450;

/**
 * Coordinator ruling 2026-10-12: the keeper aisle (800) and counter depth (550) are never
 * compressed; the back-wall shelf yields depth first (400 down to 300) so the customer zone keeps
 * 1450 mm, and only then does the door passage shorten (solver, not below 1100).
 */
export function generalStoreBackShelfMm(depthMm: number): number {
  const spare = depthMm - AISLE_MM - COUNTER_DEPTH_MM - GENERAL_STORE_CUSTOMER_ZONE_MM;
  return spare >= BACK_SHELF_MM
    ? BACK_SHELF_MM
    : spare > MIN_BACK_SHELF_MM
      ? spare
      : MIN_BACK_SHELF_MM;
}

function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  return value > high ? high : value;
}

function fixture(
  idx: number,
  cx: number,
  cz: number,
  w: number,
  d: number,
  yaw: 0 | 1 | 2 | 3 = 0,
  blocks: 0 | 1 = 1,
): FixtureTuple {
  return [idx, cx, cz, w, d, yaw, blocks];
}

function sideShelf(input: InteriorTemplateInput, counterFront: number): FixtureTuple {
  const passageSide = input.passage[0] + input.passage[2];
  const right = passageSide === 0 ? (input.interiorSeed & 1) === 0 : passageSide < 0;
  const x = right ? input.room[2] - 175 : input.room[0] + 175;
  return fixture(2, x, counterFront + 500, 1_000, 350, right ? 1 : 3);
}

function optionalProps(input: InteriorTemplateInput, counterRear: number): FixtureTuple[] {
  const left = (input.propsSeed & 1) === 0;
  const x = left ? input.room[0] + 500 : input.room[2] - 500;
  const first = 22 + (input.propsSeed % 4);
  const props = [fixture(first, x, counterRear - 300, 500, 500)];
  if (input.widthMm >= 5_300) {
    props.push(
      fixture(24, left ? input.room[2] - 450 : input.room[0] + 450, counterRear - 250, 500, 400),
    );
  }
  return props;
}

/** tech/16 8.3 general-store template in door-facing local coordinates. */
export function planGeneralStore(input: InteriorTemplateInput): InteriorTemplateResult {
  const counterWidth = clamp(
    floorDivInt(input.widthMm * 55, 100),
    1_600,
    input.widthMm < 3_200 ? input.widthMm - 400 : 3_200,
  );
  const counterDepth = COUNTER_DEPTH_MM;
  const shelf = generalStoreBackShelfMm(input.depthMm);
  // tech/16 §8.2 counter line: room back + back band + 800 keeper aisle + half the counter depth;
  // the aisle and the 550 counter depth are never compressed.
  const counterZ = input.room[1] + shelf + AISLE_MM + floorDivInt(counterDepth, 2);
  const counterRear = counterZ - floorDivInt(counterDepth, 2);
  const counterFront = counterZ + counterDepth - floorDivInt(counterDepth, 2);
  const aisleBack = input.room[1] + shelf;
  const keeperZ = floorDivInt(aisleBack + counterRear, 2);
  // Customer follows the door passage but stays 1 m inside the counter ends; a counter narrower
  // than 2 m keeps the customer on its centre line.
  const customerReach = floorDivInt(counterWidth, 2) - 1_000;
  const customerX =
    customerReach > 0
      ? clamp(floorDivInt(input.passage[0] + input.passage[2], 2), -customerReach, customerReach)
      : 0;
  const fixtures: FixtureTuple[] = [
    fixture(
      2,
      floorDivInt(input.room[0] + input.room[2], 2),
      input.room[1] + floorDivInt(shelf, 2),
      input.widthMm,
      shelf,
    ),
    fixture(0, 0, counterZ, counterWidth, counterDepth),
    fixture(200, 0, keeperZ, 0, 0, 0, 0),
    fixture(201, customerX, counterFront + 600, 0, 0, 2, 0),
  ];
  if (input.degrade < 2 && input.widthMm >= 5_300) fixtures.push(sideShelf(input, counterFront));
  if (input.degrade < 1 && input.widthMm >= 5_300) {
    fixtures.push(...optionalProps(input, counterRear));
    fixtures.push(fixture(41, 0, input.room[1] + 200, 800, 400, 0, 0));
  }
  const aisle: RectMm = [
    -floorDivInt(counterWidth, 2),
    counterRear - AISLE_MM,
    counterWidth - floorDivInt(counterWidth, 2),
    counterRear,
  ];
  return { fixtures, excluded: aisle[3] > aisle[1] ? [aisle] : [] };
}
