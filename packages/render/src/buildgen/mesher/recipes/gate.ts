import { ROOF_STYLE, type BuildingPlanView, type Recipe, type RecipeSink } from '../../types';
import { box, quad, transformPoint, type PrimitiveMaterial, type Vec3 } from '../core/prims';
import { kitLayer } from '../parts/platform';
import { createWorldCornerDeformer, insetWingCorner } from '../roof/corner';
import { cornerUStations } from '../roof/patch';
import { writeXieshanRoof } from '../roof/xieshan';

export interface GateOpeningDimensions {
  readonly bottomWidthM: number;
  readonly topWidthM: number;
  readonly heightM: number;
}

export function gateOpeningDimensions(
  plan: BuildingPlanView,
  gate: { readonly w: number; readonly h: number },
): GateOpeningDimensions {
  const maximum = plan.footprint[2] / 1_000 - 2;
  const topWidthM = Math.min(maximum, Math.max(4.5, gate.w / 1_000));
  if (topWidthM < 4.5 || gate.h < 5_000) throw new RangeError('BUILDGEN_GATE_OPENING_TOO_SMALL');
  return {
    topWidthM,
    bottomWidthM: Math.min(maximum, topWidthM + 0.4),
    heightM: Math.max(5, gate.h / 1_000),
  };
}
function localMaterial(
  plan: BuildingPlanView,
  unit: number,
  layer: number,
  ao = 215,
): PrimitiveMaterial {
  return { layer, ao, unit, localGroundM: plan.elev[0] / 1_000 };
}
function world(plan: BuildingPlanView, point: Vec3): Vec3 {
  return transformPoint(point, {
    origin: [plan.footprint[0] / 1_000, 0, plan.footprint[1] / 1_000],
    yaw: plan.yaw,
  });
}
function face(
  sink: RecipeSink,
  plan: BuildingPlanView,
  points: readonly [Vec3, Vec3, Vec3, Vec3],
  material: PrimitiveMaterial,
): void {
  quad(sink.shell, points.map((point) => world(plan, point)) as [Vec3, Vec3, Vec3, Vec3], material);
}
function writeGatehouseEaveBand(
  sink: RecipeSink,
  plan: BuildingPlanView,
  roofPlan: BuildingPlanView,
  unit: number,
  liftMm: number,
  outsetMm: number,
  layer: number,
): void {
  const y = (roofPlan.elev[0] + roofPlan.elev[1] + roofPlan.roof[1]) / 1_000;
  const x = roofPlan.footprint[2] / 2_000 - 0.04;
  const z = roofPlan.footprint[3] / 2_000 - 0.04;
  const corners = { nw: [-x, y, -z], ne: [x, y, -z], se: [x, y, z], sw: [-x, y, z] } as const;
  const inset = Object.fromEntries(
    Object.entries(corners).map(([name, point]) => [name, insetWingCorner(point, outsetMm)]),
  ) as Record<keyof typeof corners, Vec3>;
  const material = localMaterial(plan, unit, layer);
  for (const names of [
    ['sw', 'se'],
    ['ne', 'nw'],
    ['se', 'ne'],
    ['nw', 'sw'],
  ] as const) {
    const eave = [inset[names[0]], inset[names[1]]] as const;
    const deform = createWorldCornerDeformer({
      liftMm,
      outsetMm,
      eaveLine: eave,
      corners: [corners[names[0]], corners[names[1]]],
    });
    const lengthM = Math.hypot(eave[1][0] - eave[0][0], eave[1][2] - eave[0][2]);
    const halfSpanM = names[0][0] === names[1][0] ? x : z;
    const cornerMm = Math.min((halfSpanM * 2_000) / 3, halfSpanM * 1_000);
    const points = cornerUStations(lengthM * 1_000, cornerMm, 3).map((u) =>
      deform({
        u,
        t: 0,
        point: [
          eave[0][0] + (eave[1][0] - eave[0][0]) * u,
          y,
          eave[0][2] + (eave[1][2] - eave[0][2]) * u,
        ],
      }),
    );
    for (let index = 0; index < points.length - 1; index += 1) {
      const a = points[index]!;
      const b = points[index + 1]!;
      face(
        sink,
        plan,
        [[a[0] * 0.98, a[1] - 0.12, a[2] * 0.98], [b[0] * 0.98, b[1] - 0.12, b[2] * 0.98], b, a],
        material,
      );
    }
  }
}
function gateFront(
  sink: RecipeSink,
  plan: BuildingPlanView,
  z: number,
  reverse: boolean,
  width: number,
  bottomOpening: number,
  topOpening: number,
  y0: number,
  openingTop: number,
  y1: number,
  material: PrimitiveMaterial,
): void {
  const shapes: [Vec3, Vec3, Vec3, Vec3][] = [
    [
      [-width / 2, y0, z],
      [-bottomOpening / 2, y0, z],
      [-topOpening / 2, openingTop, z],
      [-width / 2, openingTop, z],
    ],
    [
      [-width / 2, openingTop, z],
      [-topOpening / 2, openingTop, z],
      [-topOpening / 2, y1, z],
      [-width / 2, y1, z],
    ],
    [
      [bottomOpening / 2, y0, z],
      [width / 2, y0, z],
      [width / 2, openingTop, z],
      [topOpening / 2, openingTop, z],
    ],
    [
      [topOpening / 2, openingTop, z],
      [width / 2, openingTop, z],
      [width / 2, y1, z],
      [topOpening / 2, y1, z],
    ],
    [
      [-topOpening / 2, openingTop, z],
      [topOpening / 2, openingTop, z],
      [topOpening / 2, y1, z],
      [-topOpening / 2, y1, z],
    ],
  ];
  for (const shape of shapes)
    face(sink, plan, reverse ? [shape[1], shape[0], shape[3], shape[2]] : shape, material);
}
function writeGatePlatform(
  sink: RecipeSink,
  plan: BuildingPlanView,
  unit: number,
  gate: { readonly w: number; readonly h: number },
  wallHeightM: number,
  layer: number,
): GateOpeningDimensions {
  const opening = gateOpeningDimensions(plan, gate);
  const y0 = plan.elev[0] / 1_000;
  const y1 = y0 + wallHeightM;
  const openingTop = y0 + opening.heightM;
  if (!(openingTop < y1)) throw new RangeError('BUILDGEN_GATE_OPENING_EXCEEDS_PLATFORM');
  const width = plan.footprint[2] / 1_000 - 0.08;
  const depth = Math.max(6, plan.footprint[3] / 1_000 - 0.08);
  const front = depth / 2;
  const back = -front;
  const material = localMaterial(plan, unit, layer);
  gateFront(
    sink,
    plan,
    front,
    false,
    width,
    opening.bottomWidthM,
    opening.topWidthM,
    y0,
    openingTop,
    y1,
    material,
  );
  gateFront(
    sink,
    plan,
    back,
    true,
    width,
    opening.bottomWidthM,
    opening.topWidthM,
    y0,
    openingTop,
    y1,
    material,
  );
  face(
    sink,
    plan,
    [
      [-width / 2, y0, back],
      [-width / 2, y0, front],
      [-width / 2, y1, front],
      [-width / 2, y1, back],
    ],
    material,
  );
  face(
    sink,
    plan,
    [
      [width / 2, y0, front],
      [width / 2, y0, back],
      [width / 2, y1, back],
      [width / 2, y1, front],
    ],
    material,
  );
  face(
    sink,
    plan,
    [
      [-width / 2, y1, front],
      [width / 2, y1, front],
      [width / 2, y1, back],
      [-width / 2, y1, back],
    ],
    material,
  );
  face(
    sink,
    plan,
    [
      [-opening.bottomWidthM / 2, y0, front],
      [-opening.bottomWidthM / 2, y0, back],
      [-opening.topWidthM / 2, openingTop, back],
      [-opening.topWidthM / 2, openingTop, front],
    ],
    material,
  );
  face(
    sink,
    plan,
    [
      [opening.bottomWidthM / 2, y0, back],
      [opening.bottomWidthM / 2, y0, front],
      [opening.topWidthM / 2, openingTop, front],
      [opening.topWidthM / 2, openingTop, back],
    ],
    material,
  );
  face(
    sink,
    plan,
    [
      [-opening.topWidthM / 2, openingTop, front],
      [-opening.topWidthM / 2, openingTop, back],
      [opening.topWidthM / 2, openingTop, back],
      [opening.topWidthM / 2, openingTop, front],
    ],
    material,
  );
  return opening;
}

export const gateRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  const wallHeightM = kit.cityWall.h / 1_000;
  const stoneLayer = kitLayer(kit, 'citywall', 'stone_rubble', 'earth_plaster');
  writeGatePlatform(sink, plan, unit, kit.cityWall.gate, wallHeightM, stoneLayer);
  const baseY = plan.elev[0] / 1_000;
  const widthMm = Math.min(plan.footprint[2] - 1_200, 9_000);
  const depthMm = Math.min(plan.footprint[3] - 800, 5_600);
  const bodyHeightM = 2.8;
  const roofPlan: BuildingPlanView = {
    ...plan,
    footprint: [plan.footprint[0], plan.footprint[1], widthMm, depthMm],
    roof: [
      ROOF_STYLE.Xieshan,
      Math.round(bodyHeightM * 1_000),
      Math.round((bodyHeightM + 2.4) * 1_000),
    ],
    elev: [plan.elev[0], kit.cityWall.h],
    floorY: [kit.cityWall.h],
  };
  const bodyMaterial = localMaterial(plan, unit, kitLayer(kit, 'timber_painted', 'timber_raw'));
  box(sink.shell, {
    center: [0, baseY + wallHeightM + bodyHeightM / 2, 0],
    size: [widthMm / 1_000 - 0.8, bodyHeightM, depthMm / 1_000 - 1],
    origin: [plan.footprint[0] / 1_000, 0, plan.footprint[1] / 1_000],
    yaw: plan.yaw,
    ...bodyMaterial,
  });
  const dims = kit.dims.hall;
  writeGatehouseEaveBand(
    sink,
    plan,
    roofPlan,
    unit,
    dims.lift[0],
    dims.lift[1],
    kitLayer(kit, 'timber_painted', 'timber_raw'),
  );
  writeXieshanRoof({
    plan: roofPlan,
    unit,
    sink,
    lod,
    profile: kit.profile,
    eaveProjectionMm: dims.eave,
    liftMm: dims.lift[0],
    outsetMm: dims.lift[1],
    ridgeHeightMm: 450,
    ridgeEnds: kit.ridge.ends,
  });
};
