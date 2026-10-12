import type { BuildingPlanView, MeshWriter, RecipeSink } from '../../types';
import {
  box,
  transformNormal,
  transformPoint,
  type PrimitiveMaterial,
  type Vec3,
} from '../core/prims';
import { EAVE_SLOPE, FLY_RAFTER_LIFT_MM, profileHeightAt, qingJujia, songZhe } from './profile';
import { roofPatchTSegments, roofPatchTStations } from './patch';
import { writeRidge } from './ridge';
import { writeRoofShell } from './shell';

export interface GableRoofOptions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly style: 'yingshan' | 'xuanshan';
  readonly steps?: number | undefined;
  readonly vergeMm?: number | undefined;
  readonly shellThicknessMm?: number | undefined;
  readonly ridgeHeightMm?: number | undefined;
  readonly structuralRiseMm?: number | undefined;
  readonly ridgeEnds?: string | undefined;
  readonly eaveProjectionMm?: number | undefined;
  readonly profile?: 'song_zhe' | 'qing_jujia' | undefined;
  readonly layer?: number | undefined;
  readonly ridgeLayer?: number | undefined;
  readonly soffitLayer?: number | undefined;
  readonly gableLayer?: number | undefined;
  readonly bargeboardLayer?: number | undefined;
  readonly lod?: 0 | 1 | undefined;
}
const MAX_XUANSHAN_VERGE_M = 0.6;
const CHITOU_WIDTH_M = 0.35;
const CHITOU_DEPTH_M = 0.3;
const CHITOU_HEIGHT_M = 0.45;

/** Continuous drip -> eave bearer -> ridge height, with fly-rafter lift fading at the bearer. */
export function gableRoofHeightAt(
  t: number,
  halfDepthM: number,
  eaveProjectionM: number,
  dripY: number,
  profileMm: readonly number[],
): number {
  const tailFraction = eaveProjectionM / halfDepthM;
  const liftM = FLY_RAFTER_LIFT_MM / 1000;
  if (t <= tailFraction) {
    const inwardM = halfDepthM * t;
    return dripY + EAVE_SLOPE * inwardM - liftM * (inwardM / eaveProjectionM);
  }
  const eaveY = dripY + EAVE_SLOPE * eaveProjectionM - liftM;
  return eaveY + profileHeightAt(profileMm, (t - tailFraction) / (1 - tailFraction)) / 1000;
}

function common(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return {
    layer,
    unit,
    localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000,
  };
}
function roofBase(plan: BuildingPlanView): number {
  return (plan.elev[0] + plan.elev[1]) / 1000;
}
function dripHalfDepth(plan: BuildingPlanView): number {
  return plan.footprint[3] / 2000 - 0.05;
}
function writeGableWall(
  writer: MeshWriter,
  x: number,
  topEdge: readonly Vec3[],
  material: PrimitiveMaterial,
  plan: BuildingPlanView,
): void {
  const floorY = Math.min(...topEdge.map((point) => point[1]));
  const anchor: Vec3 = [x, floorY, 0];
  const ordered = x < 0 ? topEdge : [...topEdge].reverse();
  const transform = {
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000] as Vec3,
    yaw: plan.yaw,
  };
  const normal = transformNormal([x < 0 ? -1 : 1, 0, 0], plan.yaw);
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const base = writer.vertexCount;
    for (const point of [anchor, ordered[index]!, ordered[index + 1]!] as const) {
      const world = transformPoint(point, transform);
      writer.addVertex({
        ...material,
        position: world,
        normal,
        uv: [point[2] - topEdge[0]![2], point[1] - floorY],
        localHeightCm: Math.max(0, Math.round((world[1] - (material.localGroundM ?? 0)) * 100)),
      });
    }
    writer.addTriangle(base, base + 1, base + 2);
  }
}
function writeChitou(
  writer: MeshWriter,
  halfWidth: number,
  halfDepth: number,
  undersideY: number,
  material: PrimitiveMaterial,
  plan: BuildingPlanView,
): void {
  const transform = {
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000] as Vec3,
    yaw: plan.yaw,
  };
  for (const side of [-1, 1] as const)
    box(writer, {
      center: [
        side * (halfWidth - CHITOU_WIDTH_M / 2),
        undersideY - CHITOU_HEIGHT_M / 2,
        halfDepth - CHITOU_DEPTH_M / 2,
      ],
      size: [CHITOU_WIDTH_M, CHITOU_HEIGHT_M, CHITOU_DEPTH_M],
      ...material,
      ...transform,
    });
}

/** Hard and overhanging gables. All emitted geometry intentionally targets sink.roof. */
export function writeGableRoof(options: GableRoofOptions): void {
  const { plan, sink, unit } = options;
  const writer = sink.roof;
  const halfWidth = plan.footprint[2] / 2000 - 0.04;
  const verge = options.style === 'xuanshan' ? (options.vergeMm ?? 500) / 1000 : 0;
  if (options.style === 'xuanshan' && (verge < 0.4 || verge > 0.6))
    throw new RangeError('BUILDGEN_ROOF_INVALID_VERGE');
  // The footprint includes the maximum legal roof extent; the wall baseline stays fixed.
  const wallHalfWidth = halfWidth - MAX_XUANSHAN_VERGE_M;
  const roofHalfWidth = options.style === 'xuanshan' ? wallHalfWidth + verge : halfWidth;
  if (!(roofHalfWidth > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_GABLE_SPAN');
  const halfDepth = dripHalfDepth(plan);
  const base = roofBase(plan);
  const dripY = base + plan.roof[1] / 1000;
  const ridgeTopY = base + plan.roof[2] / 1000;
  const eaveProjection = (options.eaveProjectionMm ?? 800) / 1000;
  const eaveY = dripY + EAVE_SLOPE * eaveProjection - 0.04;
  const structuralRun = halfDepth - eaveProjection;
  if (!(structuralRun > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_GABLE_SPAN');
  const fallbackRidgeMm = options.ridgeHeightMm ?? 350;
  const structuralRiseMm = options.structuralRiseMm ?? (ridgeTopY - eaveY) * 1000 - fallbackRidgeMm;
  const ridgeY = eaveY + structuralRiseMm / 1000;
  const ridgeHeightMm = (ridgeTopY - ridgeY) * 1000;
  const steps =
    options.steps ??
    (options.profile === 'qing_jujia' ? 4 : Math.max(2, Math.ceil(structuralRun / 1.4)));
  const tSegments = roofPatchTSegments(steps, options.lod);
  const profile =
    options.profile === 'qing_jujia'
      ? qingJujia(new Array<number>(steps).fill((structuralRun * 1000) / steps)).map(
          (height, _index, heights) => (height * structuralRiseMm) / heights[0]!,
        )
      : songZhe(structuralRun * 2_000, structuralRiseMm, steps);
  const tailFraction = eaveProjection / halfDepth;
  const tStations = roofPatchTStations(steps, tailFraction);
  const heightAt = (t: number): number =>
    gableRoofHeightAt(t, halfDepth, eaveProjection, dripY, profile);
  const horizontalAt = (t: number): number => {
    if (t <= tailFraction) return t;
    return tailFraction + (1 - tailFraction) * ((t - tailFraction) / (1 - tailFraction));
  };
  const material = common(plan, unit, options.layer ?? 0);
  const ridgeMaterial = common(plan, unit, options.ridgeLayer ?? 1);
  const soffitMaterial = common(plan, unit, options.soffitLayer ?? 2);
  const origin = [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000] as const;
  for (const side of [-1, 1] as const)
    writeRoofShell(writer, {
      eaveLine: [
        [-roofHalfWidth, dripY, side * halfDepth],
        [roofHalfWidth, dripY, side * halfDepth],
      ],
      ridgeLine: [
        [-roofHalfWidth, ridgeY, 0],
        [roofHalfWidth, ridgeY, 0],
      ],
      heightAt,
      horizontalAt,
      tSegments,
      tStations,
      material,
      undersideMaterial: soffitMaterial,
      fasciaMaterial: soffitMaterial,
      bargeboardMaterial: common(plan, unit, options.bargeboardLayer ?? 4),
      thicknessMm: options.shellThicknessMm,
      closeVerges: true,
      bargeboardMm: options.style === 'xuanshan' ? 250 : undefined,
      origin,
      yaw: plan.yaw,
    });
  writeRidge(writer, {
    path: [
      [-roofHalfWidth, ridgeY, 0],
      [roofHalfWidth, ridgeY, 0],
    ],
    kind: 'main',
    heightMm: ridgeHeightMm,
    daliSquareEnd: options.ridgeEnds === 'dali_square',
    material: ridgeMaterial,
    origin,
    yaw: plan.yaw,
  });
  if (options.style === 'yingshan') {
    // Hard-gable masonry reaches the roof underside and stays in the roof fade batch.
    const thicknessM = (options.shellThicknessMm ?? 180) / 1000;
    const gableMaterial = common(plan, unit, options.gableLayer ?? 6);
    const back = tStations.map((t): Vec3 => [0, heightAt(t) - thicknessM, -halfDepth * (1 - t)]);
    const front = tStations
      .slice(0, -1)
      .reverse()
      .map((t): Vec3 => [0, heightAt(t) - thicknessM, halfDepth * (1 - t)]);
    for (const x of [-halfWidth, halfWidth])
      writeGableWall(
        writer,
        x,
        [...back, ...front].map((point): Vec3 => [x, point[1], point[2]]),
        gableMaterial,
        plan,
      );
    writeChitou(writer, halfWidth, halfDepth, heightAt(0) - thicknessM, gableMaterial, plan);
  }
}

export const writeYingshanRoof = (options: Omit<GableRoofOptions, 'style'>): void =>
  writeGableRoof({ ...options, style: 'yingshan' });
export const writeXuanshanRoof = (options: Omit<GableRoofOptions, 'style'>): void =>
  writeGableRoof({ ...options, style: 'xuanshan' });
