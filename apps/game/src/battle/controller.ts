import { markRaw, shallowRef } from 'vue';
import type { BattleEvent, DomainEvent } from '@tianshu/core';
import type { GameHost } from '../runtime/contracts';
import { t } from '@tianshu/ui/runtime';
import type { BattleControllerCommand, BattlePacket, BattlePreviewInput, BattleUiCommand, BattleView,
  MoveResolvedHook } from './contracts';
import { eventText } from './presentation';

export type BattleSpeed = 1 | 2 | 'skip';
export interface BattleLogEntry { readonly key: number; readonly event: BattleEvent; readonly text: string }
export interface FrameScheduler { request(callback: (time: number) => void): number; cancel(id: number): void }
const browserFrames: FrameScheduler = { request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) };
export type BattleController = ReturnType<typeof createBattleController>;

export function createBattleController(host: GameHost, frames: FrameScheduler = browserFrames) {
  const view = shallowRef<BattleView | null>(null);
  const logs = shallowRef<readonly BattleLogEntry[]>([]);
  const floating = shallowRef<readonly BattleLogEntry[]>([]);
  const busy = shallowRef(false); const error = shallowRef(''); const speed = shallowRef<BattleSpeed>(1);
  const movement = shallowRef(false);
  const active = shallowRef(false); const returnScene = shallowRef('world');
  const hooks = new Set<MoveResolvedHook>();
  let disposed = false; let frame = 0; let lastStep = 0; let logSequence = 0; let requestId = 0;
  let pendingPreview: Extract<BattleUiCommand, { t: 'battle/preview' }> | undefined;
  let previewBusy = false;

  function apply(packet: BattlePacket | null): void {
    if (packet === null) { view.value = null; logs.value = []; floating.value = []; movement.value = false; return; }
    const previous = view.value;
    const info = packet.info ?? previous?.info;
    if (!info) throw new Error('BATTLE_INFO_MISSING');
    const reset = !previous || packet.id !== previous.id;
    if (reset) { logs.value = []; floating.value = []; lastStep = 0; }
    if (reset || packet.revision !== previous?.revision) movement.value = false;
    const changed = new Map(packet.units.map(unit => [unit.id, unit]));
    const units = reset ? packet.units : previous.units.map(unit => changed.get(unit.id) ?? unit);
    const resolved = packet.resolved;
    view.value = markRaw({ ...packet, info: { ...info, capabilities: packet.capabilities }, units });
    if (resolved) for (const hook of hooks) {
      try { hook(resolved.moveId, resolved.from, resolved.to, resolved.result); }
      catch (failure) { console.error('Move playback hook failed', failure); }
    }
  }
  function events(incoming: readonly DomainEvent[]): void {
    const added: BattleLogEntry[] = [];
    for (const fact of incoming) {
      if (!('payload' in fact) || !fact.payload || typeof fact.payload !== 'object' || Array.isArray(fact.payload)) continue;
      const payload = fact.payload as Readonly<Record<string, unknown>>;
      if (fact.t === 'battle/returned') {
        const scene = payload['sceneRef']; if (typeof scene === 'string') returnScene.value = scene;
      }
      const suppliedAction = payload['actionNo'];
      const actionNo = Number.isSafeInteger(suppliedAction) ? suppliedAction as number
        : fact.t === 'qi.fullCycleCrit' ? view.value?.actionNo ?? 0 : undefined;
      if (actionNo === undefined) continue;
      const actor = typeof payload['actor'] === 'string' ? payload['actor']
        : typeof payload['unitId'] === 'string' ? payload['unitId'] : undefined;
      const targets = payload['targetIds'];
      const target = typeof payload['target'] === 'string' ? payload['target']
        : Array.isArray(targets) && typeof targets[0] === 'string' ? targets[0] : undefined;
      const event = { ...payload, t: fact.t, actionNo, actor, target } as unknown as BattleEvent;
      added.push({ key: ++logSequence, event, text: eventText(event) });
    }
    if (added.length) {
      logs.value = markRaw([...logs.value, ...added].slice(-200));
      floating.value = markRaw(added.filter(row => row.event.target || row.event.actor).slice(-8));
    }
  }
  let off: () => void = () => undefined;
  try {
    off = host.subscribe(update => {
      if (!update.accepted) return;
      if (update.changes.battle !== undefined) apply(update.changes.battle);
      events(update.events);
    });
  } catch (failure) {
    if (!(failure instanceof Error) || failure.message !== 'HOST_DISPOSED') throw failure;
    // A lazy battle import may finish after its owning game controller has disposed the host.
    disposed = true;
  }
  function describe(code?: string): string {
    if (code?.includes('STALE')) return '战况已变化，请重新选择招式与落点。';
    if (code?.includes('AUTO_FORBIDDEN')) return '本场战斗禁止自动战斗。';
    if (code?.includes('ACTION_REJECTED')) return t('battleActionRejected');
    if (code?.includes('UNAVAILABLE')) return '当前战斗尚不支持此操作。';
    if (code?.includes('TARGET')) return '请选择范围内的有效目标。';
    return '操作未完成，请重新选择；当前战况已保留。';
  }
  async function dispatch(command: BattleUiCommand): Promise<boolean> {
    if (disposed) return false;
    try {
      const update = await host.dispatch(command);
      if (!update.accepted) { error.value = describe(update.error); return false; }
      error.value = ''; return true;
    } catch { error.value = '战斗连接中断，请保留页面后重试。'; return false; }
  }
  async function command(input: BattleControllerCommand): Promise<boolean> {
    if (disposed) return false;
    if (input.t === 'battle/movement-mode') {
      movement.value = input.enabled;
      if (input.enabled && view.value?.preview !== null) {
        const current = view.value;
        if (current) preview({ kind: 'cancel', revision: current.revision });
      }
      return true;
    }
    if (input.t === 'battle/cancel-plan') {
      movement.value = false;
      const current = view.value;
      if (current === null || current.capabilities.move.selected === null && current.preview === null) return true;
      preview({ kind: 'cancel', revision: input.revision }); return true;
    }
    if (busy.value) return false;
    busy.value = true; pendingPreview = undefined;
    try {
      const accepted = await dispatch(input);
      if (accepted && input.t !== 'battle/auto' && input.t !== 'battle/step') movement.value = false;
      return accepted;
    } finally { busy.value = false; }
  }
  async function drainPreview(): Promise<void> {
    if (previewBusy || disposed) return;
    previewBusy = true;
    try {
      while (pendingPreview && !disposed) {
        const next = pendingPreview; pendingPreview = undefined; await dispatch(next);
      }
    } finally { previewBusy = false; }
  }
  function preview(input: BattlePreviewInput): void {
    if (disposed || busy.value || view.value?.auto) return;
    const current = view.value;
    const destination = current?.capabilities.move.selected;
    const withDestination = input.kind === undefined && destination !== null && destination !== undefined
      ? { ...input, walkTo: { q: destination.q, r: destination.r } } : input;
    pendingPreview = { ...withDestination, t: 'battle/preview', requestId: ++requestId }; void drainPreview();
  }
  function setMovement(value: boolean): void { movement.value = value; }
  function tick(time: number): void {
    if (disposed) return;
    frame = frames.request(tick);
    const current = view.value;
    if (!active.value || !current || current.result || busy.value || error.value) return;
    if ((current.subdueTargetIds?.length ?? 0) > 0) return;
    const actor = current.units.find(unit => unit.id === current.actorId);
    if (!current.auto && actor?.control !== 'ai') return;
    const interval = speed.value === 'skip' ? 0 : 900 / speed.value;
    if (lastStep && time - lastStep < interval) return;
    lastStep = time;
    void command({ t: 'battle/step', revision: current.revision });
  }
  if (!disposed) frame = frames.request(tick);
  return { view, logs, floating, busy, error, speed, movement, active, returnScene, apply, command, preview,
    setMovement,
    setActive(value: boolean) { active.value = value; },
    async setAuto(enabled: boolean) {
      pendingPreview = undefined; movement.value = false;
      // FIFO permits takeover even during an in-flight action; no following step is queued.
      const wasActive = active.value; active.value = false;
      try { return await dispatch({ t: 'battle/auto', enabled }); } finally { active.value = wasActive; }
    },
    onMoveResolved(hook: MoveResolvedHook) { hooks.add(hook); return () => hooks.delete(hook); },
    dispose() { disposed = true; pendingPreview = undefined; frames.cancel(frame); off(); hooks.clear(); },
  };
}
