import type { BuildingPlanView, Recipe } from '../../types';
import { box, transformPoint } from '../core/prims';
import { wallWithOpenings } from '../core/openings';

const INSET_M = 0.04;
const WALL_M = 0.1;
function localOrigin(plan: BuildingPlanView, point: readonly [number, number, number]) {
  return transformPoint(point, {
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000],
    yaw: plan.yaw,
  });
}

/** Temporary but valid geometry shared by r0 recipe entry points. */
export const stubRecipe: Recipe = (plan, unitBase, _kit, _lod, sink) => {
  const width = plan.footprint[2] / 1000 - INSET_M * 2;
  const depth = plan.footprint[3] / 1000 - INSET_M * 2;
  const base = plan.elev[0] / 1000;
  const platformTop = (plan.elev[0] + plan.elev[1]) / 1000;
  const eave = platformTop + plan.roof[1] / 1000;
  const ridge = platformTop + plan.roof[2] / 1000;
  // Unit ground = base + floorY (tech/16 §6.2: aUnit.y is height above the unit floor, so the
  // platform below the floor clamps to 0 and the eave lands at roof.eaveMm / 10 cm).
  const floor = (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000;
  const common = { unit: unitBase, localGroundM: floor };
  const walls = [
    { side: 0, length: width, start: [-width / 2, 0, depth / 2 - WALL_M / 2] },
    { side: 1, length: depth, start: [-width / 2 + WALL_M / 2, 0, -depth / 2] },
    { side: 2, length: width, start: [width / 2, 0, -depth / 2 + WALL_M / 2] },
    { side: 3, length: depth, start: [width / 2 - WALL_M / 2, 0, depth / 2] },
  ] as const;
  for (const wall of walls) {
    const openings = plan.entrances
      .filter((entry) => entry[0] === wall.side)
      .map((entry) => ({
        x0: Math.max(0, wall.length / 2 + entry[1] / 1000 - entry[2] / 2000),
        x1: Math.min(wall.length, wall.length / 2 + entry[1] / 1000 + entry[2] / 2000),
        y0: base,
        y1: Math.min(eave, floor + 2.1),
      }))
      .filter((opening) => opening.x1 > opening.x0 && opening.y1 > opening.y0);
    const yaw = ((plan.yaw + wall.side) % 4) as 0 | 1 | 2 | 3;
    wallWithOpenings(sink.shell, {
      lengthM: wall.length,
      y0M: base,
      y1M: eave,
      thicknessM: WALL_M,
      openings,
      origin: localOrigin(plan, wall.start),
      yaw,
      facade: 1 << yaw,
      ...common,
    });
  }
  const roofHeight = Math.max(INSET_M, ridge - eave);
  box(sink.roof, {
    center: [0, eave + roofHeight / 2, 0],
    size: [width, roofHeight, depth],
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000],
    yaw: plan.yaw,
    facadeBySide: false,
    ...common,
  });
};
