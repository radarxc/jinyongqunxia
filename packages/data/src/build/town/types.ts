import { z } from 'zod';
import type { TownFacilitiesDef } from '../../schemas/facility';
import { VisualKitSchema } from '../../schemas/region-map';
import type {
  RegionMap,
  RegionObject,
  SurfaceId,
  TerrainId,
  TownBuildingPlan,
} from '../../schemas/region-map';
import { CityIdSchema, SafeIntegerSchema } from '../../schemas/primitives';
import type {
  CompiledBuildKit,
  LayoutBuildingInput,
  PlanningFrame,
  TownBuildingPlan as PlannedBuilding,
} from '../town-plan';

export interface GridPoint {
  readonly x: number;
  readonly z: number;
}
export interface AxialPoint {
  readonly q: number;
  readonly r: number;
}
export interface LayoutBuilding {
  readonly id: string;
  readonly type: string;
  readonly origin: GridPoint;
  readonly size: { readonly w: number; readonly h: number };
  readonly entrance_cells: readonly GridPoint[];
  readonly entrance_hexes: readonly AxialPoint[];
  readonly rotation_deg: number;
  readonly business_ref?: string | null;
  readonly poi?: string | null;
}
export interface TownLayout {
  readonly grid: {
    readonly width: number;
    readonly height: number;
    readonly cell_m: number;
    readonly chunk_cells: number;
  };
  readonly runtime_partition: {
    readonly q_min: number;
    readonly r_min: number;
    readonly q_slot_count: number;
    readonly r_slot_count: number;
  };
  readonly ground_cells: readonly (readonly [
    number,
    number,
    {
      readonly elevation_m: number;
      readonly ground: string;
      readonly overlay?: string | null;
      readonly walkable: boolean;
    },
  ])[];
  readonly water_cells: readonly GridPoint[];
  readonly bridge_cells: readonly GridPoint[];
  readonly buildings: readonly LayoutBuilding[];
  readonly decorations: readonly {
    readonly id: string;
    readonly asset_id: string;
    readonly at: GridPoint;
  }[];
  readonly walk_layer: {
    readonly runtime_hex_walkable: readonly AxialPoint[];
    readonly runtime_hex_blocked: readonly AxialPoint[];
  };
}
const LocalIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/u);
const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[.-][A-Za-z0-9_]+|_[A-Za-z0-9_]+)+$/u);
const MmSchema = SafeIntegerSchema;
export const TownSourceGateSchema = z.strictObject({
  id: LocalIdSchema,
  seg: SafeIntegerSchema.nonnegative(),
  offsetMm: SafeIntegerSchema.nonnegative(),
  widthMm: SafeIntegerSchema.positive(),
  kind: z.enum(['gate', 'water']),
});
export const TownSourceWallSchema = z.strictObject({
  id: LocalIdSchema,
  points: z.array(z.tuple([MmSchema, MmSchema])).min(2),
  closed: z.boolean(),
  heightMm: SafeIntegerSchema.positive(),
  thicknessMm: SafeIntegerSchema.positive(),
  gates: z.array(TownSourceGateSchema),
});
export const TownSourceSchema = z
  .strictObject({
    schemaVersion: z.literal('town-source.v1'),
    cityId: CityIdSchema,
    layoutKey: z.string().regex(/^city_[a-z0-9]+(?:_[a-z0-9]+)*__ch(?:0[0-9]|1[0-5])$/u),
    chapter: z.string().regex(/^ch(?:0[0-9]|1[0-5])$/u),
    sceneId: z.string().regex(/^sc_(?:0[0-9]|1[0-5])_town_[a-z0-9]+(?:_[a-z0-9]+)*$/u),
    displayNameKey: TextKeySchema,
    historicalYear: SafeIntegerSchema,
    visualKit: VisualKitSchema,
    walls: z.array(TownSourceWallSchema),
    facilitiesRef: z.string().min(1),
    layout: z.strictObject({
      path: z.string().min(1),
      sha256: z.string().regex(/^[a-f0-9]{64}$/u),
    }),
  })
  .superRefine((source, context) => {
    const suffix = source.cityId.slice(5);
    if (source.layoutKey !== `${source.cityId}__${source.chapter}`)
      context.addIssue({
        code: 'custom',
        path: ['layoutKey'],
        message: 'layoutKey must match cityId and chapter',
      });
    if (source.sceneId !== `sc_${source.chapter.slice(2)}_town_${suffix}`)
      context.addIssue({
        code: 'custom',
        path: ['sceneId'],
        message: 'sceneId must match cityId and chapter',
      });
    for (const [index, wall] of source.walls.entries())
      if (wall.gates.some(({ seg }) => seg >= wall.points.length))
        context.addIssue({
          code: 'custom',
          path: ['walls', index, 'gates'],
          message: 'gate segment is outside wall points',
        });
    if (new Set(source.walls.map(({ id }) => id)).size !== source.walls.length)
      context.addIssue({ code: 'custom', path: ['walls'], message: 'wall ids must be unique' });
  });
export type TownSourceGate = z.output<typeof TownSourceGateSchema>;
export type TownSourceWall = z.output<typeof TownSourceWallSchema>;
export type TownSource = z.output<typeof TownSourceSchema>;
export interface TownCompileInput {
  readonly layout: TownLayout;
  readonly source: TownSource;
  readonly sourcePath: string;
  readonly facilities: TownFacilitiesDef;
}
export type PlanBuildingFn = (
  input: LayoutBuildingInput,
  kit: CompiledBuildKit,
  seed: number,
  frame: PlanningFrame,
) => PlannedBuilding;
export interface TownCompileDeps {
  readonly kit: CompiledBuildKit;
  readonly planBuilding?: PlanBuildingFn;
}
export interface TownDiagnostic {
  readonly code: string;
  readonly severity: 'warning' | 'info';
  readonly message: string;
  readonly buildingIds?: readonly string[];
}
export interface CellState {
  readonly rawQ: number;
  readonly rawR: number;
  readonly q: number;
  readonly r: number;
  readonly key: string;
  terrain: TerrainId;
  surface: SurfaceId;
  height: number;
  blocked: boolean;
  building: number;
  readonly outdoorWalkable: boolean;
}
export interface DoorAssignment {
  readonly buildingId: string;
  readonly outside: CellState;
  readonly inside: CellState;
  readonly passage: readonly CellState[];
  readonly movedMm: number;
}
export interface TownWork {
  readonly input: TownCompileInput;
  readonly deps: TownCompileDeps;
  readonly sceneId: string;
  readonly frame: PlanningFrame;
  readonly cells: Map<string, CellState>;
  readonly plans: TownBuildingPlan[];
  readonly objects: RegionObject[];
  readonly diagnostics: TownDiagnostic[];
  readonly doors: DoorAssignment[];
  primarySpawnId: string;
}
export interface TownCompileResult {
  readonly map: RegionMap;
  readonly diagnostics: readonly TownDiagnostic[];
}
