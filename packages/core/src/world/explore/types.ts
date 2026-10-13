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
