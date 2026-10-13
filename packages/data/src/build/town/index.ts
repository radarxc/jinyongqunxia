import { RegionMapSchema } from '../../schemas/region-map';
import { planBuilding as defaultPlanBuilding } from '../town-plan';
import { compileBuildings } from './buildings';
import { compileDoors } from './doors';
import { emitTownMap } from './emit';
import { compileExtras } from './extras';
import { compileFacilities } from './facilities';
import { compileOutdoor } from './outdoor';
import { checkI1, checkI2, checkI3, checkI4, checkI5, checkI6 } from './invariants';
import { compileWalls } from './walls';
import { TownSourceSchema } from './types';
import type { TownCompileDeps, TownCompileInput, TownCompileResult, TownWork } from './types';

export const TOWN_COMPILER_VERSION = 'town-compiler.v2' as const;
interface CompiledOnce {
  readonly map: ReturnType<typeof emitTownMap>;
  readonly work: TownWork;
}

function sceneId(input: TownCompileInput): string {
  const chapter = input.source.chapter.match(/^ch(0[0-9]|1[0-5])$/u)?.[1];
  if (chapter === undefined) throw new TypeError(`TOWN_COMPILE_CHAPTER:${input.source.chapter}`);
  const expected = `sc_${chapter}_town_${input.source.cityId.replace(/^city_/u, '')}`;
  if (input.source.sceneId !== expected)
    throw new TypeError(`TOWN_COMPILE_SCENE_ID:${input.source.sceneId}`);
  return expected;
}

function compileOnce(
  input: TownCompileInput,
  deps: TownCompileDeps,
): CompiledOnce {
  const outdoor = compileOutdoor(input.layout);
  const work: TownWork = {
    input,
    deps,
    sceneId: sceneId(input),
    frame: outdoor.frame.planning,
    cells: outdoor.cells,
    plans: [],
    objects: [],
    diagnostics: [],
    doors: [],
    primarySpawnId: '',
  };
  const variant = input.source.visualKit.split(':')[1];
  const planner =
    deps.planBuilding ??
    ((building, kit, seed, frame) =>
      defaultPlanBuilding(building, kit, seed, frame, variant === undefined ? {} : { variant }));
  compileBuildings(work, planner);
  compileDoors(work);
  const walls = compileWalls(work);
  const facilities = compileFacilities(work);
  const decos = compileExtras(work);
  const map = emitTownMap(work, facilities, walls, decos);
  return { map, work };
}

export function compileTownScene(
  input: TownCompileInput,
  deps: TownCompileDeps,
): TownCompileResult {
  TownSourceSchema.parse(input.source);
  if (input.facilities.layoutKey !== input.source.layoutKey)
    throw new TypeError('TOWN_COMPILE_FACILITY_LAYOUT');
  const first = compileOnce(input, deps);
  const repeated = compileOnce(input, deps);
  const { map, work } = first;
  for (const check of [
    () => checkI1(work),
    () => checkI2(work),
    () => checkI3(work, map),
    () => checkI4(work),
    () => checkI5(map),
    () => checkI6(map, repeated.map),
  ]) {
    const failures = check();
    if (failures.length > 0)
      throw new Error(`TOWN_COMPILE_INVARIANT:${failures[0]!.code}:${failures[0]!.message}`);
  }
  const parsed = RegionMapSchema.safeParse(map);
  if (!parsed.success) {
    const first = parsed.error.issues[0]!;
    let invalid: unknown = map;
    for (const part of first.path) {
      if (typeof part === 'symbol' || typeof invalid !== 'object' || invalid === null) {
        invalid = undefined;
        break;
      }
      invalid = (invalid as Record<string | number, unknown>)[part];
    }
    throw new Error(
      `TOWN_COMPILE_SCHEMA:${first.path.join('.')}:${String(invalid)}:${first.message}`,
    );
  }
  return { map: parsed.data, diagnostics: work.diagnostics };
}

export * from './frame';
export * from './geometry';
export * from './invariants';
export type * from './types';
