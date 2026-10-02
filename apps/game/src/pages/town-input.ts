import type { TownPoint } from '@tianshu/core';
import type { TownAnchorView } from '@tianshu/render/town';
import type { Dir8 } from '@tianshu/render/rig';

const DIRECTION: Readonly<Record<string, TownPoint>> = {
  ArrowRight: [1, 0], d: [1, 0],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowUp: [0, -1], w: [0, -1],
  e: [1, -1], q: [-1, 1],
};

export function townStep(point: TownPoint, key: string): TownPoint | null {
  const delta = DIRECTION[key];
  return delta ? [point[0] + delta[0], point[1] + delta[1]] : null;
}

export function townDirection(from: TownPoint, to: TownPoint): Dir8 {
  const dq = to[0] - from[0]; const dr = to[1] - from[1];
  if (dq > 0 && dr === 0) return 2;
  if (dq > 0 && dr < 0) return 3;
  if (dq === 0 && dr < 0) return 4;
  if (dq < 0 && dr === 0) return 6;
  if (dq < 0 && dr > 0) return 7;
  return 0;
}

export type TownAnchorIntent =
  | { readonly t: 'town/move'; readonly destination: TownPoint; readonly buildingId?: string }
  | { readonly t: 'town/interact'; readonly npcId: string }
  | { readonly t: 'town/meditate'; readonly anchorId: string; readonly plannedTicks: 600 };

/** Convert a picked presentation marker into a command only; core still validates reachability and state. */
export function townAnchorIntent(anchor: TownAnchorView, actor: TownPoint): TownAnchorIntent {
  const here = anchor.point[0] === actor[0] && anchor.point[1] === actor[1];
  if (anchor.kind === 'npc' && here && anchor.npcId) return { t: 'town/interact', npcId: anchor.npcId };
  if (anchor.kind === 'meditation' && here)
    return { t: 'town/meditate', anchorId: anchor.id, plannedTicks: 600 };
  return { t: 'town/move', destination: anchor.point,
    ...(anchor.kind === 'building' && anchor.buildingId ? { buildingId: anchor.buildingId } : {}) };
}
