import type { HexCoord, HexDir } from '../../hex';
import type { RegionDynamicTileState, RegionEntityState } from '../region-types';

export type Pace = 'walk' | 'run';
export type TravelTarget =
  | { readonly kind: 'hex'; readonly hex: HexCoord }
  | { readonly kind: 'anchor'; readonly anchorId: string }
  | { readonly kind: 'building'; readonly buildingId: string };
export type ExploreCommand =
  | { readonly t: 'world/travelTo'; readonly target: TravelTarget; readonly pace?: Pace;
      readonly thenInteract?: boolean }
  | { readonly t: 'world/steer'; readonly dir: HexDir | null; readonly pace?: Pace }
  | { readonly t: 'world/stop' }
  | { readonly t: 'world/meditate'; readonly anchorId: string; readonly plannedTicks: 600 };

export interface ExploreWalkState {
  readonly path: readonly HexCoord[]; readonly progressMm: number; readonly pace: Pace;
  readonly steer: HexDir | null;
  readonly goal:
    | { readonly kind: 'hex' }
    | { readonly kind: 'anchor'; readonly anchorId: string; readonly interact: boolean }
    | { readonly kind: 'building'; readonly buildingId: string };
}

export interface ExploreTravelPreview {
  readonly path: readonly HexCoord[];
  readonly cost: number;
  readonly destination: HexCoord;
}

export interface ExploreWalkProjection {
  readonly path: readonly HexCoord[]; readonly progressMm: number; readonly stepMm: number;
  readonly mmPerTick: number; readonly destination: HexCoord;
}

export interface ExploreInteractableView {
  readonly id: string; readonly class: string; readonly hex: HexCoord; readonly distance: number;
}

declare module '../region-types' {
  interface MountedRegionState { readonly walk: ExploreWalkState | null }
}

export interface SceneMemoryEntry {
  readonly sceneId: string; readonly entities: readonly RegionEntityState[];
  readonly dynamicTiles: readonly RegionDynamicTileState[];
}

export const HEX_STEP_MM = 1155;
export const PACE_MM_PER_TICK = { walk: 135, run: 450 } as const;
export { MAX_WALK_PATH } from '../../state/walk-shape';

interface DynamicRevisionRecord {
  revision: number;
  numbers: Int32Array;
  terrain: string[];
}
const DYNAMIC_REVISIONS = new WeakMap<object, DynamicRevisionRecord>();
let nextDynamicRevision = 1;

/** Exact, allocation-free-on-hit revision for transaction-mutated dynamic tile arrays. */
export function exploreDynamicRevision(tiles: readonly RegionDynamicTileState[]): number {
  let record = DYNAMIC_REVISIONS.get(tiles);
  let changed = !record || record.terrain.length !== tiles.length;
  if (!changed && record)
    for (let index = 0; index < tiles.length; index += 1) {
      const tile = tiles[index]!; const offset = index * 3;
      if (record.numbers[offset] !== tile.q || record.numbers[offset + 1] !== tile.r ||
          record.numbers[offset + 2] !== tile.height || record.terrain[index] !== tile.terrainId) {
        changed = true; break;
      }
    }
  if (!changed && record) return record.revision;
  if (!Number.isSafeInteger(nextDynamicRevision)) throw new RangeError('EXPLORE_DYNAMIC_REVISION');
  const numbers = new Int32Array(tiles.length * 3); const terrain = new Array<string>(tiles.length);
  for (let index = 0; index < tiles.length; index += 1) {
    const tile = tiles[index]!; const offset = index * 3;
    numbers[offset] = tile.q; numbers[offset + 1] = tile.r; numbers[offset + 2] = tile.height;
    terrain[index] = tile.terrainId;
  }
  record = { revision: nextDynamicRevision, numbers, terrain };
  nextDynamicRevision += 1; DYNAMIC_REVISIONS.set(tiles, record);
  return record.revision;
}
