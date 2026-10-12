import type { BuildingPlanView, BuildKitView, EntranceView, LocalSide, Yaw4 } from '../../types';
import { box, transformNormal, transformPoint } from '../core/prims';
import { wallWithOpenings, type WallOpening } from '../core/openings';
import { hallOrigin, hallSizeM, kitLayer, type HallPartContext } from './platform';
import { entranceClearWidthM, hallDefinition, hallSizeKey, type ColumnLayout } from './columns';
import type { HallHeights } from './beams';

export interface FacadeOpening extends WallOpening {
  readonly kind: 'door' | 'window' | 'shopfront';
  readonly side: LocalSide;
  readonly origin: readonly [number, number, number];
  readonly yaw: Yaw4;
  readonly thicknessM: number;
  readonly facade: number;
  readonly thresholdM: number;
  readonly clearWidthM: number;
  readonly clearHeightM: number;
}
type OpeningWall = Pick<FacadeOpening, 'origin' | 'yaw' | 'thicknessM' | 'facade'>;

export interface HallWalls {
  readonly openings: readonly FacadeOpening[];
}

export function hallEntrances(plan: BuildingPlanView, kit: BuildKitView): readonly EntranceView[] {
  if (plan.entrances.length > 0)
    return plan.entrances.map(([side, offset, width]) => [
      side, offset, Math.round(entranceClearWidthM(plan, kit, width) * 1000),
    ] as const);
  const size = hallSizeKey(plan, kit);
  return [[0, 0, size === 'hall' ? 2_000 : Math.max(1_200, kit.door.double)]] as const;
}

function sideOrigin(
  plan: BuildingPlanView,
  side: LocalSide,
  width: number,
  depth: number,
  thickness: number,
): readonly [number, number, number] {
  const positions: readonly (readonly [number, number, number])[] = [
    [-width / 2, 0, depth / 2 - thickness / 2],
    [-width / 2 + thickness / 2, 0, -depth / 2],
    [width / 2, 0, -depth / 2 + thickness / 2],
    [width / 2 - thickness / 2, 0, depth / 2],
  ];
  const local = positions[side]!;
  return transformPoint(local, { origin: hallOrigin(plan), yaw: plan.yaw });
}

function addWindow(
  result: FacadeOpening[],
  side: LocalSide,
  centre: number,
  width: number,
  floor: number,
  kit: BuildKitView,
  wall: OpeningWall,
): void {
  const sill = floor + kit.window.sill / 1000;
  const head = floor + kit.window.head / 1000;
  if (width <= 0.3 || head <= sill) return;
  result.push({
    ...wall,
    side,
    kind: 'window',
    x0: centre - width / 2,
    x1: centre + width / 2,
    y0: sill,
    y1: head,
    thresholdM: 0,
    clearWidthM: width,
    clearHeightM: head - sill,
  });
}

function sideLength(side: LocalSide, width: number, depth: number): number {
  return side % 2 === 0 ? width : depth;
}
function openingCentre(side: LocalSide, length: number, offsetMm: number): number {
  return length / 2 + offsetMm / 1000;
}
function doorSize(kit: BuildKitView, plan: BuildingPlanView): readonly [number, number, number] {
  if (hallSizeKey(plan, kit) === 'hall') return [2, 2.8, Math.max(0.2, kit.door.threshold / 1000)];
  return [1.2, Math.max(2.1, kit.door.clearH / 1000), kit.door.threshold / 1000];
}

function emitHardGable(
  context: HallPartContext,
  kit: BuildKitView,
  side: 1 | 3,
  heights: HallHeights,
): void {
  const { writer, plan, unit, localGroundM } = context;
  const [width, depth] = hallSizeM(plan);
  const thickness = kit.walls.gable.t / 1000;
  const origin = sideOrigin(plan, side, width, depth, thickness);
  const yaw = ((plan.yaw + side) % 4) as Yaw4;
  const facade = 1 << yaw;
  const ridge = (plan.elev[0] + plan.elev[1] + plan.roof[2]) / 1000;
  const material = { layer: kitLayer(kit, kit.walls.gable.layer), ao: 220, flags: 1, facade, unit };
  for (const z of [-thickness / 2, thickness / 2]) {
    const normal = transformNormal([0, 0, z > 0 ? 1 : -1], yaw);
    const points = [[0, heights.columnTopM, z], [depth, heights.columnTopM, z], [depth / 2, ridge, z]] as const;
    const order = z > 0 ? points : [points[1], points[0], points[2]] as const;
    const base = writer.vertexCount;
    for (const point of order) writer.addVertex({ ...material, position: transformPoint(point, { origin, yaw }), normal, localHeightCm: Math.max(0, Math.round((point[1] - localGroundM) * 100)) });
    writer.addTriangle(base, base + 1, base + 2);
  }
}

function emitPartitions(context: HallPartContext, kit: BuildKitView): void {
  const { writer, plan, unit, localGroundM } = context;
  const layer = kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer);
  for (const [fixture, cx, cz, width, depth, yaw] of plan.fixtures) {
    if (fixture !== 34 || width <= 0 || depth <= 0) continue;
    const centre = transformPoint([cx / 1000, localGroundM + 1.1, cz / 1000], {
      origin: hallOrigin(plan), yaw: plan.yaw,
    });
    box(writer, {
      center: [0, 1.1, 0],
      size: [width / 1000, 2.2, depth / 1000],
      origin: [centre[0], localGroundM, centre[2]],
      yaw: ((plan.yaw + yaw) % 4) as Yaw4,
      unit,
      localGroundM,
      layer,
      ao: 205,
      flags: 1 << 1,
      facade: 0,
    });
  }
}

export function hallWallOpenings(
  context: HallPartContext,
  kit: BuildKitView,
  layout: ColumnLayout,
  heights: HallHeights,
): FacadeOpening[] {
  const { plan } = context;
  const [width, depth] = hallSizeM(plan);
  const thicknesses = [
    kit.walls.front.t,
    kit.walls.gable.t,
    kit.walls.back.t,
    kit.walls.gable.t,
  ].map((value) => value / 1000);
  const result: FacadeOpening[] = [];
  const entrances = hallEntrances(plan, kit);
  const definition = hallDefinition(plan, kit);
  const shopfront =
    definition.front === 'shopfront' ||
    (definition.front === undefined && hallSizeKey(plan, kit) === 'shop');
  for (let side = 0 as LocalSide; side < 4; side = (side + 1) as LocalSide) {
    const thicknessM = thicknesses[side]!;
    const yaw = ((plan.yaw + side) % 4) as Yaw4;
    const common = {
      origin: sideOrigin(plan, side, width, depth, thicknessM),
      yaw,
      thicknessM,
      facade: 1 << yaw,
    };
    const length = sideLength(side, width, depth);
    const sideEntrances = entrances.filter((entry) => entry[0] === side);
    if (side === 0 && shopfront) {
      const decisionSpan = Math.max(1.5, width - 1.45); // 6 m sample: 4.47 m clear shop opening.
      const openingWidth = Math.min(width - 0.4, decisionSpan);
      result.push({
          ...common,
          side,
          kind: 'shopfront',
          x0: (width - openingWidth) / 2,
          x1: (width + openingWidth) / 2,
          y0: heights.floorM,
          y1: Math.min(heights.columnTopM, heights.floorM + 2.7),
          thresholdM: 0,
          clearWidthM: openingWidth,
          clearHeightM: Math.min(heights.columnTopM - heights.floorM, 2.7),
      });
    } else {
      for (const [, offsetMm, entranceWidthMm] of sideEntrances) {
          const [, clearHeightM, thresholdM] = doorSize(kit, plan);
          const doorWidth = entranceWidthMm / 1000;
          const centre = openingCentre(side, length, offsetMm);
          const frameM = Math.max(0.1, kit.door.frame / 1000);
          result.push({
            ...common,
            side,
            kind: 'door',
            x0: centre - doorWidth / 2 - frameM,
            x1: centre + doorWidth / 2 + frameM,
            y0: heights.floorM,
            y1: Math.min(heights.columnTopM, heights.floorM + thresholdM + clearHeightM + frameM),
            thresholdM,
            clearWidthM: doorWidth,
            clearHeightM,
          });
      }
      const doors = result.filter((opening) => opening.side === side && opening.kind === 'door');
      if (side === 0) {
          const windowWidth = Math.min(kit.window.width / 1000, width * 0.2);
        for (const centre of [width * 0.22, width * 0.78])
          if (
            doors.every(
              (door) => centre + windowWidth / 2 < door.x0 || centre - windowWidth / 2 > door.x1,
            )
          )
            addWindow(result, side, centre, windowWidth, heights.floorM, kit, common);
      } else if (side === 2 && doors.length === 0) {
        for (let bay = 0; bay < layout.xM.length - 1; bay += 1) {
          const left = layout.xM[bay]! + width / 2;
          const right = layout.xM[bay + 1]! + width / 2;
          if (right - left >= 2)
            addWindow(result, side, (left + right) / 2, Math.min(kit.window.width / 1000, right - left - 0.3), heights.floorM, kit, common);
        }
      } else if ((side === 1 || side === 3) && plan.roof[0] !== 1 && doors.length === 0) {
        addWindow(
          result,
          side,
          length / 2,
          Math.min(kit.window.width / 1000, depth - 0.6),
          heights.floorM,
          kit,
          common,
        );
      }
    }
  }
  return result;
}

export function emitWalls(
  context: HallPartContext,
  kit: BuildKitView,
  layout: ColumnLayout,
  heights: HallHeights,
): HallWalls {
  const { writer, plan, unit, localGroundM } = context;
  const [width, depth] = hallSizeM(plan);
  const lengths = [width, depth, width, depth] as const;
  const thicknesses = [
    kit.walls.front.t,
    kit.walls.gable.t,
    kit.walls.back.t,
    kit.walls.gable.t,
  ].map((value) => value / 1000);
  const openings = hallWallOpenings(context, kit, layout, heights);
  for (let side = 0 as LocalSide; side < 4; side = (side + 1) as LocalSide) {
    const yaw = ((plan.yaw + side) % 4) as Yaw4;
    wallWithOpenings(writer, {
      lengthM: lengths[side],
      y0M: heights.floorM,
      y1M: heights.columnTopM,
      thicknessM: thicknesses[side]!,
      openings: openings.filter((opening) => opening.side === side),
      origin: sideOrigin(plan, side, width, depth, thicknesses[side]!),
      yaw,
      facade: 1 << yaw,
      unit,
      localGroundM,
      layer: kitLayer(kit, [kit.walls.front, kit.walls.gable, kit.walls.back, kit.walls.gable][side]!.layer),
      ao: 220,
      flags: 1,
    });
  }
  if (plan.roof[0] === 1) {
    emitHardGable(context, kit, 1, heights);
    emitHardGable(context, kit, 3, heights);
  }
  emitPartitions(context, kit);
  return { openings };
}
