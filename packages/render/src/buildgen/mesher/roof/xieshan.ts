import type { BuildingPlanView, RecipeSink } from '../../types';
import {
  quad,
  transformNormal,
  transformPoint,
  type PrimitiveMaterial,
  type Vec3,
} from '../core/prims';
import { createWorldCornerDeformer, insetWingCorner, type WingDimensions } from './corner';
import { qingJujia, songZhe } from './profile';
import { cornerUStations, roofPatchTStations } from './patch';
import { writeRoofShell } from './shell';
import { bracketedRoofHeightAt, eaveBearer, hipRidgeHalfM, writeBalancedRidge } from './hip';
import {
  assertChiweiHeight,
  HALL_CHIWEI_HEIGHT_MM,
  writeChiweiPair,
  writeDaliSquareEnds,
} from './ornaments';

export const XIESHAN_HIP_END_T = 0.45;
export interface XieshanRoofOptions extends WingDimensions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly profile?: 'song_zhe' | 'qing_jujia' | undefined;
  readonly eaveProjectionMm?: number | undefined;
  /** Chiwei rise above the main-ridge top (tech/16 §3: 900–1300 mm). */
  readonly ornamentHeightMm?: number | undefined;
  /** Main-ridge body: tile ridge foot = roof[2] - this (planner: 350 / 450 / hall 650). */
  readonly ridgeHeightMm?: number | undefined;
  /** Bracket projection outside the column line (planner: 450 when `brackets: true`). */
  readonly bracketMm?: number | undefined;
  readonly ridgeEnds?: string | undefined;
  readonly retreatMm?: number | undefined;
  readonly layer?: number | undefined;
  readonly ridgeLayer?: number | undefined;
  readonly soffitLayer?: number | undefined;
  readonly gableLayer?: number | undefined;
  readonly ornamentLayer?: number | undefined;
  readonly shellThicknessMm?: number | undefined;
  readonly lod?: 0 | 1 | undefined;
}

function material(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return { layer, unit, localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000 };
}
function triangle(
  writer: RecipeSink['roof'],
  points: readonly [Vec3, Vec3, Vec3],
  mat: PrimitiveMaterial,
  origin: Vec3,
  yaw: BuildingPlanView['yaw'],
  normal: Vec3,
): void {
  const base = writer.vertexCount;
  for (const point of points) {
    const world = transformPoint(point, { origin, yaw });
    writer.addVertex({
      ...mat,
      position: world,
      normal: transformNormal(normal, yaw),
      uv: [point[2] - points[0][2], point[1] - points[0][1]],
      localHeightCm: Math.max(0, Math.round((world[1] - (mat.localGroundM ?? 0)) * 100)),
    });
  }
  writer.addTriangle(base, base + 1, base + 2);
}

function structuralProfile(
  kind: 'song_zhe' | 'qing_jujia',
  runMm: number,
  riseMm: number,
  steps: number,
): readonly number[] {
  return kind === 'qing_jujia'
    ? qingJujia(new Array<number>(steps).fill(runMm / steps)).map(
        (height, _index, values) => (height * riseMm) / values[0]!,
      )
    : songZhe(runMm, riseMm, steps);
}
function xieshanHipPoint(
  eave: Vec3,
  ridge: Vec3,
  corner: Vec3,
  t: number,
  heightAt: (t: number) => number,
  wing: WingDimensions,
): Vec3 {
  const deform = createWorldCornerDeformer({
    ...wing,
    eaveLine: [eave, eave],
    corners: [corner, corner],
    hipPointAt: () => eave,
  });
  return deform({
    u: 0,
    t,
    point: [
      eave[0] + (ridge[0] - eave[0]) * Math.min(1, t / XIESHAN_HIP_END_T),
      heightAt(t),
      eave[2] + (ridge[2] - eave[2]) * t,
    ],
  });
}
function xieshanFrontDeformer(
  eave: readonly [Vec3, Vec3],
  ridge: readonly [Vec3, Vec3],
  corners: readonly [Vec3, Vec3],
  wing: WingDimensions,
) {
  const cornerDeform = createWorldCornerDeformer({
    ...wing,
    eaveLine: eave,
    corners,
    hipPointAt: (end, t) => {
      const lower = Math.min(1, t / XIESHAN_HIP_END_T);
      return [
        eave[end][0] + (ridge[end][0] - eave[end][0]) * lower,
        0,
        eave[end][2] + (ridge[end][2] - eave[end][2]) * t,
      ];
    },
  });
  return (sample: { readonly u: number; readonly t: number; readonly point: Vec3 }): Vec3 => {
    const eaveX = eave[0][0] + (eave[1][0] - eave[0][0]) * sample.u;
    const ridgeX = ridge[0][0] + (ridge[1][0] - ridge[0][0]) * sample.u;
    const lowerProgress = Math.min(1, sample.t / XIESHAN_HIP_END_T);
    return cornerDeform({
      ...sample,
      point: [eaveX + (ridgeX - eaveX) * lowerProgress, sample.point[1], sample.point[2]],
    });
  };
}

/** Xieshan: two full trapezoids, two lower hip trapezoids, gable boards and continuous ridges. */
export function writeXieshanRoof(options: XieshanRoofOptions): void {
  const { plan, unit, sink } = options;
  const profileKind = options.profile ?? 'song_zhe';
  const ridgeHeightMm = options.ridgeHeightMm ?? 350;
  const chiweiHeightMm = options.ornamentHeightMm ?? HALL_CHIWEI_HEIGHT_MM;
  assertChiweiHeight(chiweiHeightMm);
  const baseY = (plan.elev[0] + plan.elev[1]) / 1000;
  const dripY = baseY + plan.roof[1] / 1000;
  const ridgeTopY = baseY + plan.roof[2] / 1000;
  const ridgeY = ridgeTopY - ridgeHeightMm / 1000;
  const x = plan.footprint[2] / 2000 - 0.04;
  const z = plan.footprint[3] / 2000 - 0.04;
  const retreat = Math.max(0.6, Math.min(1.2, (options.retreatMm ?? 900) / 1000));
  const nominalRidgeHalf = hipRidgeHalfM(x * 2, z * 2, profileKind);
  const ridgeHalf = Math.min(x - 0.1, Math.max(nominalRidgeHalf, x - retreat));
  if (!(ridgeY > dripY && ridgeHalf > 0))
    throw new RangeError('BUILDGEN_ROOF_INVALID_XIESHAN_SPAN');
  const eaveProjectionM = (options.eaveProjectionMm ?? 800) / 1_000;
  const bearer = eaveBearer(dripY, eaveProjectionM, (options.bracketMm ?? 0) / 1_000);
  const structuralRunM = z - bearer.tailRunM;
  const eaveY = bearer.purlinY;
  const riseMm = (ridgeY - eaveY) * 1_000;
  if (!(structuralRunM > 0 && riseMm > 0))
    throw new RangeError('BUILDGEN_ROOF_INVALID_XIESHAN_SPAN');
  const steps = profileKind === 'qing_jujia' ? 4 : Math.max(2, Math.ceil(structuralRunM / 1.4));
  const heights = structuralProfile(profileKind, structuralRunM * 1_000, riseMm, steps);
  const heightAt = (t: number) =>
    bracketedRoofHeightAt(t, z, eaveProjectionM, bearer, dripY, heights);
  const tail = bearer.tailRunM / z;
  const tStations = [...roofPatchTStations(steps, tail, options.lod ?? 0), XIESHAN_HIP_END_T]
    .sort((a, b) => a - b)
    .filter((value, index, values) => index === 0 || Math.abs(value - values[index - 1]!) > 1e-9);
  const origin: Vec3 = [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000];
  const tile = material(plan, unit, options.layer ?? 0);
  const underside = material(plan, unit, options.soffitLayer ?? 2);
  const ridgeMaterial = material(plan, unit, options.ridgeLayer ?? 1);
  const gableMaterial = material(plan, unit, options.gableLayer ?? 6);
  const thicknessMm = options.shellThicknessMm ?? 180;
  const wing = { liftMm: options.liftMm, outsetMm: options.outsetMm } as const;
  const nominalCorners: Record<'nw' | 'ne' | 'se' | 'sw', Vec3> = {
    nw: [-x, dripY, -z],
    ne: [x, dripY, -z],
    se: [x, dripY, z],
    sw: [-x, dripY, z],
  };
  const inset = Object.fromEntries(
    Object.entries(nominalCorners).map(([name, point]) => [
      name,
      insetWingCorner(point, options.outsetMm),
    ]),
  ) as Record<keyof typeof nominalCorners, Vec3>;
  for (const [side, corners] of [
    [1, ['sw', 'se'] as const],
    [-1, ['ne', 'nw'] as const],
  ] as const) {
    const ridge: readonly [Vec3, Vec3] =
      side === 1
        ? [
            [-ridgeHalf, ridgeY, 0],
            [ridgeHalf, ridgeY, 0],
          ]
        : [
            [ridgeHalf, ridgeY, 0],
            [-ridgeHalf, ridgeY, 0],
          ];
    writeRoofShell(sink.roof, {
      eaveLine: [inset[corners[0]], inset[corners[1]]],
      ridgeLine: ridge,
      heightAt,
      tSegments: tStations.length - 1,
      tStations,
      uStations: cornerUStations(
        Math.hypot(
          inset[corners[1]][0] - inset[corners[0]][0],
          inset[corners[1]][2] - inset[corners[0]][2],
        ) * 1_000,
        Math.min((x * 2_000) / 3, x * 1_000),
        3,
      ),
      deform: xieshanFrontDeformer(
        [inset[corners[0]], inset[corners[1]]],
        ridge,
        [nominalCorners[corners[0]], nominalCorners[corners[1]]],
        wing,
      ),
      material: tile,
      undersideMaterial: underside,
      fasciaMaterial: underside,
      thicknessMm,
      origin,
      yaw: plan.yaw,
    });
  }
  // Side lower slopes terminate at the explicit t=0.45 hip/boshan seam.
  const seamY = heightAt(XIESHAN_HIP_END_T);
  const insetX = Math.abs(inset.se[0]);
  const insetZ = Math.abs(inset.se[2]);
  const seamX = ridgeHalf;
  const seamZ = insetZ * (1 - XIESHAN_HIP_END_T);
  for (const side of [-1, 1] as const) {
    const names = side === 1 ? (['se', 'ne'] as const) : (['nw', 'sw'] as const);
    const eaveLine = [inset[names[0]], inset[names[1]]] as const;
    const ridgeLine: readonly [Vec3, Vec3] = [
      [side * seamX, seamY, eaveLine[0][2] > 0 ? seamZ : -seamZ],
      [side * seamX, seamY, eaveLine[1][2] > 0 ? seamZ : -seamZ],
    ];
    const lowerTStations = tStations
      .filter((station) => station <= XIESHAN_HIP_END_T)
      .map((station) => station / XIESHAN_HIP_END_T);
    const localUStations = cornerUStations(
      Math.hypot(eaveLine[1][0] - eaveLine[0][0], eaveLine[1][2] - eaveLine[0][2]) * 1_000,
      Math.min((z * 2_000) / 3, z * 1_000),
      3,
    );
    const cornerDeform = createWorldCornerDeformer({
      liftMm: options.liftMm,
      outsetMm: options.outsetMm,
      eaveLine,
      corners: [nominalCorners[names[0]], nominalCorners[names[1]]],
      hipPointAt: (end, globalT) => {
        const amount = globalT / XIESHAN_HIP_END_T;
        return [
          eaveLine[end][0] + (ridgeLine[end][0] - eaveLine[end][0]) * amount,
          0,
          eaveLine[end][2] + (ridgeLine[end][2] - eaveLine[end][2]) * amount,
        ];
      },
    });
    writeRoofShell(sink.roof, {
      eaveLine,
      ridgeLine,
      heightAt: (localT) => heightAt(localT * XIESHAN_HIP_END_T),
      tSegments: lowerTStations.length - 1,
      tStations: lowerTStations,
      uStations: localUStations,
      deform: (sample) => cornerDeform({ ...sample, t: sample.t * XIESHAN_HIP_END_T }),
      material: tile,
      undersideMaterial: underside,
      fasciaMaterial: underside,
      thicknessMm,
      origin,
      yaw: plan.yaw,
    });
  }
  const gableBottomY = seamY - thicknessMm / 1000;
  for (const side of [-1, 1] as const) {
    const normal: Vec3 = [side, 0, 0];
    // The upper xuanshan overhang reaches seamX; the timber gable itself stays in one x plane.
    const lowBack: Vec3 = [side * ridgeHalf, gableBottomY, -seamZ];
    const lowFront: Vec3 = [side * ridgeHalf, gableBottomY, seamZ];
    const apex: Vec3 = [side * ridgeHalf, ridgeY - thicknessMm / 1000, 0];
    triangle(sink.roof, [lowBack, lowFront, apex], gableMaterial, origin, plan.yaw, normal);
    // 250 mm dropped bargeboards on both sloping gable edges.
    for (const low of [lowBack, lowFront])
      quad(
        sink.roof,
        [
          transformPoint(low, { origin, yaw: plan.yaw }),
          transformPoint(apex, { origin, yaw: plan.yaw }),
          transformPoint([apex[0], apex[1] - 0.25, apex[2]], { origin, yaw: plan.yaw }),
          transformPoint([low[0], low[1] - 0.25, low[2]], { origin, yaw: plan.yaw }),
        ],
        gableMaterial,
      );
  }
  const ridgeEnds: readonly [Vec3, Vec3] = [
    [-ridgeHalf, ridgeY, 0],
    [ridgeHalf, ridgeY, 0],
  ];
  writeBalancedRidge(sink.roof, {
    path: ridgeEnds,
    kind: 'main',
    heightMm: ridgeHeightMm,
    material: ridgeMaterial,
    origin,
    yaw: plan.yaw,
  });
  for (const side of [-1, 1] as const)
    for (const zSign of [-1, 1] as const) {
      const path = [
        0.05,
        ...tStations.filter((station) => station > 0.05 && station <= XIESHAN_HIP_END_T),
      ].map((t) =>
        xieshanHipPoint(
          [side * insetX, dripY, zSign * insetZ],
          [side * ridgeHalf, ridgeY, 0],
          [side * x, dripY, zSign * z],
          t,
          heightAt,
          wing,
        ),
      );
      if (zSign < 0) path.reverse();
      writeBalancedRidge(sink.roof, {
        path,
        kind: 'vertical',
        heightMm: Math.max(250, Math.min(350, ridgeHeightMm - 20)),
        material: ridgeMaterial,
        origin,
        yaw: plan.yaw,
      });
    }
  // Boji follows the t=0.45 seam around both gables.
  for (const side of [-1, 1] as const)
    writeBalancedRidge(sink.roof, {
      path: [
        [side * seamX, seamY, -seamZ],
        [side * seamX, seamY, seamZ],
      ],
      kind: 'vertical',
      heightMm: 250,
      material: ridgeMaterial,
      origin,
      yaw: plan.yaw,
    });
  const ornament = {
    origin,
    yaw: plan.yaw,
    material: material(plan, unit, options.ornamentLayer ?? 3),
  } as const;
  const ends = options.ridgeEnds;
  // Ornaments stand on the main ridge: roof[2] stays the ridge top without ornaments (tech/16 §4).
  // A chiwei grows from the ridge foot at the ridge end to 900–1300 mm above the ridge top; the
  // Dali square ends sit on the ridge top and rise 550 mm.
  const ornamentBaseY = ends === 'chiwei' ? ridgeY : ridgeTopY;
  const ornamentEnds: readonly [Vec3, Vec3] = [
    [ridgeEnds[0][0], ornamentBaseY, ridgeEnds[0][2]],
    [ridgeEnds[1][0], ornamentBaseY, ridgeEnds[1][2]],
  ];
  if (ends === 'chiwei')
    writeChiweiPair(
      sink.roof,
      ornamentEnds,
      ridgeTopY + chiweiHeightMm / 1000,
      options.lod ?? 0,
      ornament,
    );
  else if (ends === 'dali_square') writeDaliSquareEnds(sink.roof, ornamentEnds, ornament);
}
