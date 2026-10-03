import type { RegionCommand } from '@tianshu/core';
import type { RegionHexPoint, RegionScene } from '@tianshu/render/region';
import type { GameController } from '../game-controller';
import type { GameUpdate, RegionPathPreviewCommand } from '../runtime/contracts';

export type RegionInputCommand = RegionCommand | RegionPathPreviewCommand;
export type RegionPointerCommand = Exclude<RegionCommand, { readonly t: 'world/mountRegion' }>
  | RegionPathPreviewCommand;
export interface RegionMountRequest {
  readonly regionId: string; readonly sceneId: string; readonly spawnId: string | null;
}

/** Presentation maps hits to commands; core remains the only legality and path authority. */
export function regionPointerCommand(scene: Pick<RegionScene, 'pickAnchor' | 'pickHex'>,
  clientX: number, clientY: number, bounds: DOMRect, commit: boolean): RegionPointerCommand | null {
  if (commit) {
    const anchor = scene.pickAnchor(clientX, clientY, bounds);
    if (anchor) return { t: 'world/interact', anchorId: anchor.anchorId };
  }
  const hex = scene.pickHex(clientX, clientY, bounds);
  if (!hex) return null;
  return commit ? { t: 'world/walkTo', hex } : { t: 'world/previewRegionPath', hex };
}

/** Temporary narrow bridge until GameController exposes the already-supported Region command family. */
export function dispatchRegionCommand(controller: GameController,
  command: RegionInputCommand): Promise<GameUpdate | undefined> {
  const send = controller.townCommand as unknown as
    (value: RegionInputCommand) => Promise<GameUpdate | undefined>;
  return send(command);
}

export function walkedRegionPath(update: GameUpdate | undefined): readonly RegionHexPoint[] {
  const event = update?.events.find((entry) => entry.t === 'world/walked');
  const payload = event?.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return [];
  const path = (payload as { path?: unknown }).path;
  if (!Array.isArray(path)) return [];
  return path.filter((point): point is RegionHexPoint => !!point && typeof point === 'object' &&
    Number.isSafeInteger((point as RegionHexPoint).q) && Number.isSafeInteger((point as RegionHexPoint).r));
}

export function requestedRegion(update: GameUpdate | undefined): RegionMountRequest | null {
  const event = update?.events.find((entry) => entry.t === 'world/regionRequested');
  const payload = event?.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const value = payload as Readonly<Record<string, unknown>>;
  if (typeof value['regionId'] !== 'string' || typeof value['sceneId'] !== 'string' ||
      !(typeof value['spawnId'] === 'string' || value['spawnId'] === null)) return null;
  return { regionId: value['regionId'], sceneId: value['sceneId'], spawnId: value['spawnId'] };
}

export function mountRegionCommand(request: RegionMountRequest): RegionCommand | null {
  return request.spawnId === null ? null : { t: 'world/mountRegion', regionId: request.regionId,
    sceneId: request.sceneId, spawnId: request.spawnId };
}
