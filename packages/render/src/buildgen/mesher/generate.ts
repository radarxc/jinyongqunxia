import type { BuildingPlanView, BuildKitView, CellPayload, RecipeSink } from '../types';
import { MeshBufferBuilder } from './core/buffer';
import { recipeFor } from './recipes';

interface PendingCell {
  readonly x: number;
  readonly z: number;
  readonly plans: { plan: BuildingPlanView; unit: number; partUnits: readonly number[] }[];
}
function cellId(x: number, z: number): number {
  if (x < -32_768 || x > 32_767 || z < -32_768 || z > 32_767)
    throw new RangeError('BUILDGEN_CELL_OUT_OF_RANGE');
  return ((((x + 32_768) & 0xffff) << 16) | ((z + 32_768) & 0xffff)) >>> 0;
}
function resolveRecipe(plan: BuildingPlanView, kit: BuildKitView) {
  const definition = kit.archetypes[plan.archetype] ?? kit.landmarks[plan.archetype];
  if (!definition) throw new Error(`BUILDGEN_UNKNOWN_ARCHETYPE:${plan.archetype}`);
  if (!definition.recipe) throw new Error(`BUILDGEN_UNSUPPORTED_ARCHETYPE:${plan.archetype}`);
  return recipeFor(definition.recipe);
}
const HANGING_KIND = { sign: 1, flag: 2, lantern: 3 } as const;
function encodeHanging(props: RecipeSink['hangingProps']): Uint32Array {
  const words: number[] = [];
  for (const prop of props)
    words.push(
      prop.target === 'shell' ? 0 : 1,
      HANGING_KIND[prop.kind],
      prop.vertices.length,
      ...prop.vertices,
    );
  return new Uint32Array(words);
}

export function generateCells(
  plans: readonly BuildingPlanView[],
  kit: BuildKitView,
  lod: 0 | 1,
  cellSizeM: number,
): CellPayload[] {
  if (!(cellSizeM > 0) || !Number.isFinite(cellSizeM))
    throw new RangeError('BUILDGEN_INVALID_CELL_SIZE');
  const pending = new Map<string, PendingCell>();
  let nextPartUnit = plans.length;
  for (let unit = 0; unit < plans.length; unit += 1) {
    const plan = plans[unit]!;
    const partUnits = (plan.parts ?? []).map(() => nextPartUnit++);
    const x = Math.floor(plan.footprint[0] / 1000 / cellSizeM);
    const z = Math.floor(plan.footprint[1] / 1000 / cellSizeM);
    const key = `${x}/${z}`;
    let cell = pending.get(key);
    if (!cell) {
      cell = { x, z, plans: [] };
      pending.set(key, cell);
    }
    cell.plans.push({ plan, unit, partUnits });
  }
  return [...pending.values()]
    .sort((left, right) => left.x - right.x || left.z - right.z)
    .map((cell) => {
      const shell = new MeshBufferBuilder();
      const roof = new MeshBufferBuilder();
      const doors: number[] = [];
      const signs: number[] = [];
      const hangingProps: RecipeSink['hangingProps'] = [];
      for (const entry of cell.plans) {
        const sink: RecipeSink = {
          shell,
          roof,
          doors,
          signs,
          hangingProps,
          partUnits: entry.partUnits,
        };
        resolveRecipe(entry.plan, kit)(entry.plan, entry.unit, kit, lod, sink);
      }
      return {
        cell: cellId(cell.x, cell.z),
        lod,
        shell: shell.finish(),
        roof: roof.finish(),
        doors: new Float32Array(doors),
        signs: new Float32Array(signs),
        units: new Uint16Array(cell.plans.flatMap((entry) => [entry.unit, ...entry.partUnits])),
        hanging: encodeHanging(hangingProps),
      };
    });
}
