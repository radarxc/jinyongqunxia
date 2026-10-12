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

/** Forge, bellows, anvil at 1.1 m centre distance, quench and weapon rack. */
export function planSmithy(input: InteriorTemplateInput): InteriorTemplateResult {
  const passageSide = input.passage[0] + input.passage[2];
  const mirror =
    passageSide === 0 ? ((input.interiorSeed & 1) === 0 ? 1 : -1) : passageSide < 0 ? 1 : -1;
  const forgeX = mirror * -1_000;
  const anvilX = forgeX + mirror * 1_100;
  const forgeZ = input.room[1] + 500;
  const fixtures: FixtureTuple[] = [
    fixture(15, forgeX, forgeZ, 1_200, 1_000),
    fixture(16, forgeX - mirror * 900, forgeZ, 600, 800),
    fixture(17, anvilX, forgeZ, 500, 350),
    fixture(18, anvilX + mirror * 800, forgeZ, 800, 500),
    fixture(
      19,
      mirror > 0 ? input.room[2] - 200 : input.room[0] + 200,
      input.passage[1] - 800,
      1_600,
      400,
      mirror > 0 ? 1 : 3,
    ),
    fixture(209, anvilX, forgeZ + 650, 0, 0, 0, 0),
    fixture(201, anvilX, forgeZ + 1_250, 0, 0, 2, 0),
  ];
  if (input.degrade < 1 && input.widthMm >= 5_300 && input.depthMm >= 4_000) {
    fixtures.push(
      fixture(
        21,
        mirror > 0 ? input.room[2] - 300 : input.room[0] + 300,
        input.room[3] - 700,
        1_400,
        600,
        mirror > 0 ? 1 : 3,
      ),
    );
  }
  if (input.degrade < 3 && input.widthMm >= 5_300) {
    fixtures.push(fixture(208, forgeX - mirror * 500, forgeZ + 750, 0, 0, 0, 0));
  }
  return { fixtures, excluded: [] };
}
