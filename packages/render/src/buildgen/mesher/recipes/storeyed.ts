import type { BuildingPlanView, BuildKitView, MeshWriter, Recipe, VertexInput } from '../../types';
import { box, prism } from '../core/prims';
import { BALCONY_DEPTH_M, emitBalcony } from '../parts/balcony';
import { columnLayout, hallDefinition } from '../parts/columns';
import { emitPentEave } from '../parts/pent-eave';
import { hallOrigin, hallSizeM, kitLayer } from '../parts/platform';
import { roofMesherFor } from '../roof';
import { emitHallBody } from './hall';
import { stubRecipe } from './stub';

const FLOOR_SLAB_M = 0.2;
const FRAME_M = 0.35;
const FACADE_BAND_M = 0.5;
const WAIST_TARGET_PROJECTION_M = 0.8;

function structuralPlan(plan: BuildingPlanView, kit: BuildKitView): BuildingPlanView {
  const [width, depth] = hallSizeM(plan);
  const xSpanM = Math.round(Math.max(0.5, width - WAIST_TARGET_PROJECTION_M * 2) * 20) / 20;
  const projectionM = (width - xSpanM) / 2;
  const size = hallDefinition(plan, kit).size ?? 'middle';
  const dims = kit.dims[size];
  const diameterM = Math.max(0.18, Math.min(0.3, dims.column / (dims.diaRatio ?? 11) / 1000));
  const localWidthM = xSpanM - kit.walls.gable.t / 1000;
  const localDepthM = 2 * (depth / 2 - projectionM - diameterM / 2 - 0.011);
  const [worldWidthM, worldDepthM] =
    plan.yaw % 2 === 0 ? [localWidthM, localDepthM] : [localDepthM, localWidthM];
  const [cxMm, czMm] = plan.footprint;
  return {
    ...plan,
    floors: [
      [
        cxMm - worldWidthM * 500,
        czMm - worldDepthM * 500,
        cxMm + worldWidthM * 500,
        czMm + worldDepthM * 500,
      ],
    ],
  };
}

/** Storeyed structure is derived from the outer hall, never from an interior-planner floor. */
export function storeyedColumnLayout(plan: BuildingPlanView, kit: BuildKitView) {
  return columnLayout(structuralPlan(plan, kit), kit);
}

function common(plan: BuildingPlanView, unit: number, kit: BuildKitView, layer: number) {
  return {
    origin: hallOrigin(plan),
    yaw: plan.yaw,
    unit,
    localGroundM: (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000,
    layer,
    flags: 1 << 4,
  } as const;
}

function storeyedShellWriter(writer: MeshWriter, plan: BuildingPlanView): MeshWriter {
  const [ox, , oz] = hallOrigin(plan);
  const halfW = plan.footprint[2] / 2000 - 0.04;
  const halfD = plan.footprint[3] / 2000 - 0.04;
  return {
    get vertexCount() {
      return writer.vertexCount;
    },
    addVertex(vertex: VertexInput): number {
      const dx = vertex.position[0] - ox;
      const dz = vertex.position[2] - oz;
      const local: readonly [number, number] = [
        [dx, dz],
        [dz, -dx],
        [-dx, -dz],
        [-dz, dx],
      ][plan.yaw]! as [number, number];
      const sides = [
        local[1] >= halfD - FACADE_BAND_M,
        local[0] <= -halfW + FACADE_BAND_M,
        local[1] <= -halfD + FACADE_BAND_M,
        local[0] >= halfW - FACADE_BAND_M,
      ];
      let allowed = 0;
      for (let side = 0; side < 4; side += 1)
        if (sides[side]) allowed |= 1 << ((side + plan.yaw) % 4);
      const nx = vertex.normal[0];
      const nz = vertex.normal[2];
      const verticalOutside = nx * nx + nz * nz > 0.9 && ((vertex.flags ?? 0) & 0b110110) === 0;
      const declared = (vertex.facade ?? 0) & allowed;
      return writer.addVertex({
        ...vertex,
        facade: verticalOutside ? declared || allowed : declared,
      });
    },
    addTriangle: (a, b, c) => writer.addTriangle(a, b, c),
  };
}

function emitFloorSlab(
  writer: MeshWriter,
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  bottomM: number,
): void {
  const [width, depth] = hallSizeM(plan);
  box(writer, {
    ...common(plan, unit, kit, kitLayer(kit, 'floor_wood', 'timber_raw')),
    center: [0, bottomM + FLOOR_SLAB_M / 2, 0],
    size: [width, FLOOR_SLAB_M, depth],
    ao: 215,
  });
}

function emitUpperStorey(
  writer: MeshWriter,
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  floorM: number,
  heightM: number,
  lod: 0 | 1,
): void {
  const [width, depth] = hallSizeM(plan);
  const wallTopM = floorM + Math.max(2.1, heightM - FRAME_M);
  const columnHeightM = wallTopM - floorM;
  const timber = kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer);
  const lattice = kitLayer(kit, 'lattice_window', 'timber_raw', kit.walls.front.layer);
  const structural = common(plan, unit, kit, timber);
  const frontWallZ = depth / 2 - BALCONY_DEPTH_M - 0.04;
  const backWallZ = -depth / 2 + 0.15;
  const xs =
    lod === 0 ? [-width / 2 + 0.15, 0, width / 2 - 0.15] : [-width / 2 + 0.15, width / 2 - 0.15];
  const zs = [backWallZ, frontWallZ - 0.11];
  for (const z of zs)
    for (const x of xs)
      prism(writer, {
        ...structural,
        center: [x, floorM + columnHeightM / 2, z],
        radiusM: 0.13,
        heightM: columnHeightM,
        sides: lod === 0 ? 8 : 6,
        ao: 230,
      });
  const sideDepth = frontWallZ - backWallZ;
  const sideZ = (frontWallZ + backWallZ) / 2;
  const walls = [
    {
      center: [0, (floorM + wallTopM) / 2, backWallZ] as const,
      size: [width, columnHeightM, 0.3] as const,
    },
    {
      center: [-width / 2 + 0.175, (floorM + wallTopM) / 2, sideZ] as const,
      size: [0.35, columnHeightM, sideDepth] as const,
    },
    {
      center: [width / 2 - 0.175, (floorM + wallTopM) / 2, sideZ] as const,
      size: [0.35, columnHeightM, sideDepth] as const,
    },
  ];
  for (const wall of walls) box(writer, { ...structural, ...wall, ao: 215 });
  const sashBottom = floorM + 0.55;
  const sashTop = Math.min(wallTopM - 0.2, floorM + 2.2);
  const bays = lod === 0 ? Math.max(3, Math.ceil(width / 2)) : 3;
  for (let index = 0; index <= bays; index += 1) {
    const x = -width / 2 + 0.18 + ((width - 0.36) * index) / bays;
    box(writer, {
      ...common(plan, unit, kit, lattice),
      center: [x, (sashBottom + sashTop) / 2, frontWallZ],
      size: [0.055, sashTop - sashBottom, 0.035],
      ao: 225,
    });
  }
  for (const y of [sashBottom, (sashBottom + sashTop) / 2, sashTop])
    box(writer, {
      ...common(plan, unit, kit, lattice),
      center: [0, y, frontWallZ],
      size: [width - 0.36, 0.055, 0.035],
      ao: 225,
    });
  box(writer, {
    ...structural,
    center: [0, wallTopM + FRAME_M / 2, 0],
    size: [width, FRAME_M, 0.2],
    ao: 220,
  });
  box(writer, {
    ...structural,
    center: [0, wallTopM + FRAME_M / 2, -depth / 2 + 0.1],
    size: [width, FRAME_M, 0.2],
    ao: 220,
  });
}

/** Timber storeyed recipe; everything above the first ceiling is deliberately in sink.roof. */
export const storeyedRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  if (plan.storeys < 2 || plan.storeys > 3)
    throw new RangeError('BUILDGEN_STOREYED_REQUIRES_TWO_OR_THREE_STOREYS');
  const definition = hallDefinition(plan, kit);
  if (definition.recipe !== 'storeyed') throw new RangeError('BUILDGEN_STOREYED_RECIPE_MISMATCH');
  if (definition.roof === undefined) {
    stubRecipe(plan, unit, kit, lod, sink);
    return;
  }
  const shellSink = { ...sink, shell: storeyedShellWriter(sink.shell, plan) };
  const bodyPlan = structuralPlan(plan, kit);
  const bodyColumns = columnLayout(bodyPlan, kit);
  const { heights } = emitHallBody(bodyPlan, unit, kit, lod, shellSink);
  const ceilingM = heights.bodyTopM;
  const upperHeightM = (kit.dims.middle.upperStorey ?? kit.dims.middle.column) / 1000;
  const waist = emitPentEave({
    writer: sink.roof,
    plan,
    unit,
    kit,
    bearerM: ceilingM,
    innerHalfWidthM: Math.max(Math.abs(bodyColumns.xM[0]!), Math.abs(bodyColumns.xM.at(-1)!)),
    innerHalfDepthM: Math.max(Math.abs(bodyColumns.zM[0]!), Math.abs(bodyColumns.zM.at(-1)!)),
  });
  if (waist.bottomM < heights.floorM + 2.4) throw new RangeError('BUILDGEN_PENT_EAVE_CLEARANCE');
  emitFloorSlab(sink.roof, plan, unit, kit, ceilingM);
  const upperFloorM = ceilingM + FLOOR_SLAB_M;
  if (definition.balcony !== false)
    emitBalcony({ writer: sink.roof, plan, unit, kit, floorM: upperFloorM, lod });
  let storeyFloorM = upperFloorM;
  for (let storey = 1; storey < plan.storeys; storey += 1) {
    emitUpperStorey(sink.roof, plan, unit, kit, storeyFloorM, upperHeightM, lod);
    if (storey < plan.storeys - 1) {
      storeyFloorM += upperHeightM;
      emitFloorSlab(sink.roof, plan, unit, kit, storeyFloorM - FLOOR_SLAB_M);
    }
  }
  roofMesherFor(plan.roof[0])(plan, unit, sink, { kit, lod });
};
