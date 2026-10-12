import type { TownPoint } from '@tianshu/core';
import type { Dir8 } from '@tianshu/render/rig';
import type { ZoomController } from '../input/zoom';
import { normalizeWheel } from '@tianshu/platform/input';

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
export { v1AnchorCommand as townAnchorIntent } from '../explore/v1-context-actions';

/** Presentation cadence is accessibility-invariant: reduced motion must not slow character movement. */
export const TOWN_MOVE_STEP_MS = 140;

export interface TownWheelInput {
  readonly deltaX: number; readonly deltaY: number; readonly deltaMode: number;
  readonly ctrlKey: boolean; readonly metaKey: boolean; readonly altKey: boolean;
  preventDefault(): void;
}

/** Keeps browser zoom gestures intact while routing ordinary wheel deltas into ZoomController. */
export function applyTownWheel(event: TownWheelInput, zoom: ZoomController,
  lineHeightPx = 16, pageHeightPx = 800): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  const { dy } = normalizeWheel(event, lineHeightPx, pageHeightPx);
  if (dy === 0) return false;
  event.preventDefault(); zoom.wheel(dy); return true;
}
