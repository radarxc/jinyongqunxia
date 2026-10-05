/* global HTMLCanvasElement */
import type { BattleEvent } from '@tianshu/core';
import type { BattleMarker } from '@tianshu/render/battle';
import type { BattleVfxStage, VfxAccent, VfxPlayRequest } from '@tianshu/render/vfx';
import type { BattleController } from './controller';

export interface BattleVfxBridgeOptions {
  readonly importStage?: () => Promise<{ createBattleVfxStage(canvas: HTMLCanvasElement): BattleVfxStage }>;
  readonly onPending?: () => void;
  readonly onDuration?: (durationMs: number) => void;
  readonly reducedMotion?: () => boolean;
  readonly snapshotActor?: (id: string) => ReturnType<NonNullable<VfxPlayRequest['actorSnapshot']>>;
  readonly onReady?: (stage: BattleVfxStage) => void;
}

export function classifyVfxAccents(events: readonly BattleEvent[], hpDamage: number): readonly VfxAccent[] {
  const types = new Set(events.map(event => event.t)); const accents: VfxAccent[] = [];
  if (hpDamage > 0 || types.has('battle/damageResolved')) accents.push('hit');
  if (types.has('combat.qiRepel') || types.has('battle/outwardQiCancelled')) accents.push('repel');
  if (types.has('battle/foreignQiInjected')) accents.push('foreign-qi');
  if (types.has('battle/acupointOccupied')) accents.push('acupoint');
  return accents;
}

function resolvedAccentTargets(events: readonly BattleEvent[], markers: readonly BattleMarker[]) {
  const byId = new Map(markers.map(marker => [marker.id, marker]));
  const result: Partial<Record<VfxAccent, BattleMarker>> = {};
  const target = (type: string) => {
    const id = events.find(event => event.t === type)?.target; return id ? byId.get(id) : undefined;
  };
  const found = { hit: target('battle/damageResolved'),
    repel: target('combat.qiRepel') ?? target('battle/outwardQiCancelled'),
    'foreign-qi': target('battle/foreignQiInjected'), acupoint: target('battle/acupointOccupied') };
  for (const [accent, marker] of Object.entries(found) as [VfxAccent, BattleMarker | undefined][])
    if (marker) result[accent] = marker;
  return result;
}

export function bindBattleVfx(controller: BattleController, canvas: HTMLCanvasElement,
  options: BattleVfxBridgeOptions = {}): () => void {
  let disposed = false; let stage: BattleVfxStage | undefined; let pending: Promise<BattleVfxStage> | undefined;
  const load = () => {
    if (stage) return Promise.resolve(stage);
    if (pending) return pending;
    pending = (options.importStage ?? (() => import('@tianshu/render/vfx')))().then(module => {
      const created = module.createBattleVfxStage(canvas);
      if (disposed) { created.dispose(); throw new Error('VFX_BRIDGE_DISPOSED'); }
      stage = created; options.onReady?.(created); return created;
    }).catch((failure: unknown) => { pending = undefined; throw failure; });
    return pending;
  };
  const off = controller.onMoveResolved((moveId, from, targets, result) => {
    const nature = from.qiNature; const reducedMotion = options.reducedMotion?.();
    const actorSnapshot = options.snapshotActor ? () => options.snapshotActor!(from.id) : undefined;
    options.onPending?.();
    void load().then(value => value.play({ moveId, from, targets,
      accents: classifyVfxAccents(result.events, result.hpDamage),
      accentTargets: resolvedAccentTargets(result.events, [from, ...targets]),
      ...(actorSnapshot ? { actorSnapshot } : {}),
      ...(nature ? { nature } : {}), ...(reducedMotion === undefined ? {} : { reducedMotion }) }))
      .then(playback => { if (!disposed) options.onDuration?.(playback.durationMs); })
      .catch(error => { if (!disposed) { options.onDuration?.(600);
        console.warn('[VFX] playback failed; battle continues', error); } });
  });
  return () => { disposed = true; off(); stage?.dispose(); stage = undefined; pending = undefined; };
}
