import type { RegionObject, TerrainId } from '../schemas';
import type { CellData } from './tiled-chunks';
import type { TiledCompileContext } from './tiled-types';
import { mapError } from './tiled-types';

const objectKey = (value: { q: number; r: number }): string => `${value.q},${value.r}`;
const STRUCTURALLY_NON_STANDABLE = new Set<TerrainId>([
  'tr_shengu',
  'tr_shibi',
  'tr_rongyan',
  'tr_liubai',
]);
const terrainStandable = (terrain: TerrainId): boolean => !STRUCTURALLY_NON_STANDABLE.has(terrain);

export function validateMapObjects(
  context: TiledCompileContext,
  cells: readonly CellData[],
  objects: readonly RegionObject[],
): void {
  const width = context.map.width!;
  const height = context.map.height!;
  const valid = new Set(
    cells.flatMap((entry, index) =>
      entry.valid ? [`${index % width},${Math.floor(index / width)}`] : [],
    ),
  );
  for (const object of objects)
    for (const anchor of object.cells)
      if (
        anchor.q < 0 ||
        anchor.r < 0 ||
        anchor.q >= width ||
        anchor.r >= height ||
        !valid.has(objectKey(anchor))
      )
        throw mapError(
          context,
          'TS-CONTENT-MAP-010',
          `${object.id} anchor is outside valid terrain`,
          '/layers',
        );
  const spawns = objects.filter((object) => object.class === 'PlayerSpawn');
  if (spawns.length === 0)
    throw mapError(
      context,
      'TS-CONTENT-MAP-011',
      'at least one PlayerSpawn is required',
      '/layers',
    );
  for (const spawn of spawns) {
    const index = spawn.r * width + spawn.q;
    const terrain = cells[index]?.terrain;
    if (terrain === undefined || !terrainStandable(terrain))
      throw mapError(context, 'TS-CONTENT-MAP-011', `${spawn.id} is not standable`, '/layers');
  }
  const ids = objects.map((object) => object.id);
  if (new Set(ids).size !== ids.length)
    throw mapError(context, 'TS-CONTENT-MAP-009', 'object IDs must be unique', '/layers');
  validateDoors(context, objects);
  validateArenas(context, cells, objects);
  validateGates(context, objects);
}

function validateDoors(context: TiledCompileContext, objects: readonly RegionObject[]): void {
  const doors = objects.filter((object) => object.class === 'Door');
  for (const door of doors) {
    if (door.oneWay && door.returnDoorId === undefined)
      throw mapError(
        context,
        'TS-CONTENT-MAP-012',
        `${door.id} one-way door has no return`,
        '/layers',
      );
    if (door.pairId.length === 0 || door.targetSpawnId.length === 0)
      throw mapError(
        context,
        'TS-CONTENT-MAP-012',
        `${door.id} transfer endpoint is incomplete`,
        '/layers',
      );
  }
}

function validateArenas(
  context: TiledCompileContext,
  cells: readonly CellData[],
  objects: readonly RegionObject[],
): void {
  for (const arena of objects.filter((object) => object.class === 'BattleArena')) {
    const unique = new Set(arena.cells.map(objectKey));
    const qs = arena.cells.map((cell) => cell.q);
    const rs = arena.cells.map((cell) => cell.r);
    const qSpan = Math.max(...qs) - Math.min(...qs) + 1;
    const rSpan = Math.max(...rs) - Math.min(...rs) + 1;
    if (unique.size > 400 || qSpan > 20 || rSpan > 20)
      throw mapError(
        context,
        'TS-CONTENT-MAP-013',
        `${arena.id} exceeds 400 cells or span 20`,
        '/layers',
      );
    const standable = arena.cells.filter((cell) => {
      const terrain = cells[cell.r * context.map.width! + cell.q]?.terrain;
      return terrain !== undefined && terrainStandable(terrain);
    }).length;
    if (standable < arena.playerCapacity + arena.enemyCapacity)
      throw mapError(
        context,
        'TS-CONTENT-MAP-013',
        `${arena.id} has insufficient spawn cells`,
        '/layers',
      );
  }
}

function validateGates(context: TiledCompileContext, objects: readonly RegionObject[]): void {
  for (const gate of objects.filter((object) => object.class === 'QinggongGate')) {
    if (gate.intent === 'main' && gate.alt.length === 0)
      throw mapError(
        context,
        'TS-CONTENT-MAP-014',
        `${gate.id} main gate needs an alternative`,
        '/layers',
      );
    if (gate.intent === 'main' && gate.earliest === null)
      throw mapError(
        context,
        'TS-CONTENT-MAP-014',
        `${gate.id} main gate needs earliest progress`,
        '/layers',
      );
    const expectedReveal = gate.intent === 'hidden' ? 'never' :
      gate.intent === 'secret' ? 'near10' : 'always';
    if (gate.reveal !== expectedReveal)
      throw mapError(
        context,
        'TS-CONTENT-MAP-014',
        `${gate.id} ${gate.intent} gate requires reveal=${expectedReveal}`,
        '/layers',
      );
    if (gate.oneWay && gate.returnDoorId === null)
      throw mapError(
        context,
        'TS-CONTENT-MAP-014',
        `${gate.id} one-way gate needs returnDoorId`,
        '/layers',
      );
  }
}
