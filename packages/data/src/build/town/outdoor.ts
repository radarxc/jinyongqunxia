import { SURFACE_IDS, type SurfaceId, type TerrainId } from '../../schemas/region-map';
import {
  createTownFrame,
  localHex,
  localKey,
  planningCellAtHex,
  rawKey,
  type TownFrame,
} from './frame';
import type { CellState, TownLayout } from './types';

const SURFACES = new Set<string>(SURFACE_IDS);
const terrainFor = (ground: string, water: boolean, bridge: boolean): TerrainId =>
  bridge
    ? 'tr_pingdi'
    : water || ground === 'water'
      ? 'tr_shenshui'
      : ground === 'grass'
        ? 'tr_caodi'
        : ground === 'sand'
          ? 'tr_shadi'
          : 'tr_pingdi';
const surfaceFor = (ground: string, water: boolean, bridge: boolean): SurfaceId =>
  bridge
    ? 'bridge_deck'
    : water
      ? 'water'
      : SURFACES.has(ground)
        ? (ground as SurfaceId)
        : 'rammed_earth';

export interface OutdoorResult {
  readonly frame: TownFrame;
  readonly cells: Map<string, CellState>;
}

export function compileOutdoor(layout: TownLayout): OutdoorResult {
  const frame = createTownFrame(layout);
  const ground: { elevation_m: number; ground: string; walkable: boolean }[] = [];
  for (const [start, length, value] of layout.ground_cells)
    for (let index = start; index < start + length; index += 1) ground[index] = value;
  const walking = new Set(layout.walk_layer.runtime_hex_walkable.map(({ q, r }) => rawKey(q, r)));
  const blocked = new Set(layout.walk_layer.runtime_hex_blocked.map(({ q, r }) => rawKey(q, r)));
  const waters = new Set(layout.water_cells.map(({ x, z }) => `${x},${z}`));
  const bridges = new Set(layout.bridge_cells.map(({ x, z }) => `${x},${z}`));
  const cells = new Map<string, CellState>();
  const points = [
    ...layout.walk_layer.runtime_hex_walkable,
    ...layout.walk_layer.runtime_hex_blocked,
  ].sort((a, b) => a.r - b.r || a.q - b.q);
  for (const point of points) {
    const local = localHex(frame, point);
    if (local.q < 0 || local.r < 0 || local.q >= frame.width || local.r >= frame.height) continue;
    const grid = planningCellAtHex(layout, point.q, point.r);
    const value = ground[grid.z * layout.grid.width + grid.x] ?? {
      elevation_m: 0,
      ground: 'rammed_earth',
      walkable: false,
    };
    const bridge = bridges.has(`${grid.x},${grid.z}`);
    const water = waters.has(`${grid.x},${grid.z}`);
    const outdoorWalkable = walking.has(rawKey(point.q, point.r)) || bridge;
    cells.set(localKey(local.q, local.r), {
      rawQ: point.q,
      rawR: point.r,
      q: local.q,
      r: local.r,
      key: localKey(local.q, local.r),
      terrain: terrainFor(value.ground, water, bridge),
      surface: surfaceFor(value.ground, water, bridge),
      height: Math.max(0, Math.min(10, Math.round(value.elevation_m))),
      blocked: blocked.has(rawKey(point.q, point.r)) && !bridge,
      building: 0,
      outdoorWalkable,
    });
  }
  return { frame, cells };
}
