import type {
  BuildingPlanView,
  BuildKitView,
  FacilityKind,
  MeshWriter,
  VertexInput,
} from '../../types';
import { transformPoint } from '../core/prims';
import { BUILDGEN_RNG_SALTS, buildgenSubstream } from '../core/rng';
import { INTERIOR_SURFACE_FLAG, WALL_CORNER_AO, propContext, solid } from './dsl';
import { propByIndex } from './register';
import type {
  InteriorBuildStats,
  InteriorSink,
  LampPointMm,
  PropDefinition,
  PropLod,
  PropPlacement,
} from './types';

const TRIANGLE_LIMIT = [3_000, 1_200] as const;
const FLOOR_THICKNESS_MM = 30;
const LOW_CLUTTER = new Set([33, 35, 39]);
const BRICK_FACILITIES = new Set<FacilityKind>(['smithy', 'stable', 'storehouse', 'guardhouse']);

class TriangleWriter implements MeshWriter {
  triangles = 0;
  constructor(readonly target: MeshWriter) {}
  get vertexCount(): number {
    return this.target.vertexCount;
  }
  addVertex(vertex: Parameters<MeshWriter['addVertex']>[0]): number {
    return this.target.addVertex(vertex);
  }
  addTriangle(a: number, b: number, c: number): void {
    this.target.addTriangle(a, b, c);
    this.triangles += 1;
  }
}

/** Buffers one atomic interior part so a budget decision happens before the target is mutated. */
class StagedWriter implements MeshWriter {
  private readonly vertices: VertexInput[] = [];
  private readonly indices: number[] = [];
  get vertexCount(): number {
    return this.vertices.length;
  }
  get triangles(): number {
    return this.indices.length / 3;
  }
  get primaryLayer(): number {
    return this.vertices[0]?.layer ?? 0;
  }
  addVertex(vertex: VertexInput): number {
    this.vertices.push(vertex);
    return this.vertices.length - 1;
  }
  addTriangle(a: number, b: number, c: number): void {
    this.indices.push(a, b, c);
  }
  commit(target: MeshWriter): void {
    const base = target.vertexCount;
    for (const vertex of this.vertices) target.addVertex(vertex);
    for (let index = 0; index < this.indices.length; index += 3)
      target.addTriangle(
        base + this.indices[index]!,
        base + this.indices[index + 1]!,
        base + this.indices[index + 2]!,
      );
  }
}

interface PlannedFixture {
  readonly fixture: BuildingPlanView['fixtures'][number];
  readonly ordinal: number;
  readonly definition: PropDefinition;
  readonly optional: boolean;
  lod: PropLod;
  mesh: StagedWriter | undefined;
}

function kitLayer(kit: BuildKitView, ...names: readonly string[]): number {
  for (const name of names) {
    const found = kit.layers.findIndex((layer) => layer.id === name);
    if (found >= 0) return found;
  }
  return 0;
}
function floorHeightMm(plan: BuildingPlanView): number {
  return plan.elev[0] + (plan.floorY[0] ?? plan.elev[1]);
}
function localWorldPoint(
  plan: BuildingPlanView,
  pointMm: readonly [number, number, number],
): LampPointMm {
  const point = transformPoint([pointMm[0] / 1000, pointMm[1] / 1000, pointMm[2] / 1000], {
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000],
    yaw: plan.yaw,
  });
  return {
    xMm: Math.round(point[0] * 1000),
    yMm: Math.round(point[1] * 1000),
    zMm: Math.round(point[2] * 1000),
  };
}
function fixtureLamp(
  plan: BuildingPlanView,
  fixtureIndex: number,
  heightMm: number,
): LampPointMm | undefined {
  const fixture = plan.fixtures.find((candidate) => candidate[0] === fixtureIndex);
  return fixture
    ? { xMm: fixture[1], yMm: floorHeightMm(plan) + heightMm, zMm: fixture[2] }
    : undefined;
}

export function defaultInteriorLamps(plan: BuildingPlanView): readonly LampPointMm[] {
  const floor = floorHeightMm(plan);
  const lamps: LampPointMm[] = [];
  const counter = fixtureLamp(plan, 0, 1_650) ?? fixtureLamp(plan, 1, 1_650);
  if (counter) lamps.push(counter);
  const forge = fixtureLamp(plan, 15, 650);
  if (forge) lamps.push(forge);
  const entrance = plan.entrances[0];
  if (entrance) {
    const [side, offset] = entrance;
    const halfW = plan.footprint[2] / 2 - 180;
    const halfD = plan.footprint[3] / 2 - 180;
    const local =
      side === 0
        ? ([offset, floor + 2_050, halfD] as const)
        : side === 1
          ? ([-halfW, floor + 2_050, offset] as const)
          : side === 2
            ? ([-offset, floor + 2_050, -halfD] as const)
            : ([halfW, floor + 2_050, -offset] as const);
    lamps.push(localWorldPoint(plan, local));
  }
  if (lamps.length === 0) lamps.push(localWorldPoint(plan, [0, floor + 2_050, 0]));
  return lamps;
}

function emitFloors(
  plan: BuildingPlanView,
  kit: BuildKitView,
  unit: number,
  writer: MeshWriter,
  lamps: readonly LampPointMm[],
): void {
  const layer = BRICK_FACILITIES.has(plan.facility)
    ? kitLayer(kit, 'floor_pavers', 'floor_earth', 'brick_grey', 'brick_fired')
    : kitLayer(kit, 'floor_wood', 'carpet_kilim', 'timber_raw');
  for (let index = 0; index < plan.floors.length; index += 1) {
    const [x0, z0, x1, z1] = plan.floors[index]!;
    const y = plan.elev[0] + (plan.floorY[index] ?? plan.floorY[0] ?? plan.elev[1]);
    const centerX = (x0 + x1) / 2;
    const centerZ = (z0 + z1) / 2;
    const context = propContext(writer, {
      originMm: [centerX, y - FLOOR_THICKNESS_MM, centerZ],
      yaw: 0,
      unit,
      localGroundMm: y,
      lamps,
    });
    solid(context, [0, FLOOR_THICKNESS_MM / 2, 0], [x1 - x0, FLOOR_THICKNESS_MM, z1 - z0], {
      layer,
      flags: INTERIOR_SURFACE_FLAG,
      ao: WALL_CORNER_AO,
    });
  }
}
function fixturePlacement(
  plan: BuildingPlanView,
  fixture: BuildingPlanView['fixtures'][number],
  unit: number,
  lamps: readonly LampPointMm[],
): PropPlacement {
  return {
    originMm: [fixture[1], floorHeightMm(plan), fixture[2]],
    yaw: fixture[5],
    unit,
    localGroundMm: floorHeightMm(plan),
    lamps,
  };
}
function variantFor(plan: BuildingPlanView, fixtureOrdinal: number): number {
  return buildgenSubstream((plan.seed + fixtureOrdinal) >>> 0, BUILDGEN_RNG_SALTS.props);
}
function stageFixture(
  item: PlannedFixture,
  plan: BuildingPlanView,
  unit: number,
  lamps: readonly LampPointMm[],
  lod: PropLod,
): StagedWriter {
  const staged = new StagedWriter();
  const fixture = item.fixture;
  item.definition.recipe(
    fixture[3],
    fixture[4],
    item.definition.hMm,
    variantFor(plan, item.ordinal),
    lod,
    { writer: staged, placement: fixturePlacement(plan, fixture, unit, lamps) },
  );
  return staged;
}
function stageBlockingProxy(
  item: PlannedFixture,
  plan: BuildingPlanView,
  unit: number,
  lamps: readonly LampPointMm[],
): StagedWriter {
  const staged = new StagedWriter();
  const fixture = item.fixture;
  const context = propContext(staged, fixturePlacement(plan, fixture, unit, lamps));
  solid(context, [0, item.definition.hMm / 2, 0], [fixture[3], item.definition.hMm, fixture[4]], {
    layer: item.mesh?.primaryLayer ?? 0,
  });
  return staged;
}
function plannedTriangles(floorTriangles: number, items: readonly PlannedFixture[]): number {
  return items.reduce((total, item) => total + (item.mesh?.triangles ?? 0), floorTriangles);
}
function diagnostic(
  sink: InteriorSink,
  item: PlannedFixture,
  code: 'PROP_LOD_DOWNGRADED' | 'PROP_SKIPPED_BUDGET' | 'PROP_BLOCKING_PROXY',
  action: string,
  plan: BuildingPlanView,
): void {
  sink.diagnostics.push({
    code,
    fixtureIndex: item.fixture[0],
    message: `${item.definition.name} ${action} for ${plan.id}`,
  });
}

/** Emits one building's typed-array-ready interior batch. `unit` remains the building unit id. */
export function buildInterior(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: PropLod,
  sink: InteriorSink,
): InteriorBuildStats {
  const batch = new StagedWriter();
  const counted = new TriangleWriter(batch);
  const lamps = defaultInteriorLamps(plan);
  emitFloors(plan, kit, unit, counted, lamps);
  const limit = TRIANGLE_LIMIT[lod];
  if (counted.triangles > limit) throw new RangeError('INTERIOR_BUDGET_UNSATISFIABLE');
  let downgraded = 0;
  let skipped = 0;
  let proxied = 0;
  const items: PlannedFixture[] = plan.fixtures
    .map((fixture, ordinal) => ({ fixture, ordinal }))
    .filter(({ fixture }) => fixture[0] < 200)
    .map(({ fixture, ordinal }) => {
      const definition = propByIndex(fixture[0]);
      const item: PlannedFixture = {
        fixture,
        ordinal,
        definition,
        optional: fixture[6] === 0 || LOW_CLUTTER.has(fixture[0]),
        lod,
        mesh: undefined,
      };
      return item;
    })
    .map((item) => {
      item.mesh = stageFixture(item, plan, unit, lamps, lod);
      return item;
    });
  let total = plannedTriangles(counted.triangles, items);
  if (lod === 0)
    for (const item of items) {
      if (total <= limit) break;
      if (!item.optional || item.lod === 1) continue;
      item.lod = 1;
      item.mesh = stageFixture(item, plan, unit, lamps, 1);
      downgraded += 1;
      diagnostic(sink, item, 'PROP_LOD_DOWNGRADED', 'downgraded to LOD1', plan);
      total = plannedTriangles(counted.triangles, items);
    }
  for (const item of items) {
    if (total <= limit) break;
    if (!item.optional || item.mesh === undefined) continue;
    item.mesh = undefined;
    skipped += 1;
    diagnostic(sink, item, 'PROP_SKIPPED_BUDGET', 'skipped', plan);
    total = plannedTriangles(counted.triangles, items);
  }
  for (const item of items) {
    if (total <= limit) break;
    if (item.mesh === undefined || item.optional || item.mesh.triangles <= 12) continue;
    item.mesh = stageBlockingProxy(item, plan, unit, lamps);
    proxied += 1;
    diagnostic(sink, item, 'PROP_BLOCKING_PROXY', 'replaced by blocking proxy', plan);
    total = plannedTriangles(counted.triangles, items);
  }
  if (total > limit) {
    sink.diagnostics.push({
      code: 'INTERIOR_TRIANGLE_BUDGET_EXCEEDED',
      message: `${plan.id} needs ${total}/${limit} triangles after proxies`,
    });
    throw new RangeError('INTERIOR_BUDGET_UNSATISFIABLE');
  }
  for (const item of items) item.mesh?.commit(counted);
  batch.commit(sink.interior);
  return {
    triangles: counted.triangles,
    fixtures: items.length - skipped,
    downgraded,
    skipped,
    proxied,
    lamps,
  };
}
