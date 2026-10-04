import { createBattleSession, peekReadyUnitId, projectBattleRewards, type BattleEvent, type BattleSessionState,
  type BattleState } from '@tianshu/core/battle';
import type { BattleBusActCommand, BattleSetAutoBusCommand } from '@tianshu/core';
import type { BattleLaunch, BattlePacket, BattleUiCommand, BattleUnitView, MovePlayback } from './contracts';
import { projectBattleUnit } from './presentation';
import { queryActions, queryArea, queryTimeline } from './queries';

/** Read-only host adapter. Battle rules, RNG and command history live in core's BattleSession. */
export class BattleRuntime {
  private readonly views = new Map<string, BattleUnitView>();
  private readonly unitRevisions = new Map<string, number>();
  private preview: BattlePacket['preview'] = null;
  private destination: BattlePacket['capabilities']['move']['selected'] = null;
  private session: BattleSessionState | null;
  private authorityBattleId: string;
  private authorityRevision: number;
  private authorityRetryCount: number;
  readonly launch: BattleLaunch;

  constructor(input: BattleLaunch, session?: BattleSessionState) {
    this.launch = structuredClone(input);
    this.session = session ?? createBattleSession(this.launch.setup, this.launch.seeds);
    this.authorityBattleId = this.session.battleId;
    this.authorityRevision = this.session.revision;
    this.authorityRetryCount = this.session.retryCount;
    const { setup, cells, markers, moves } = this.launch;
    if (setup.schema !== 'battle-setup.v1' ||
      cells.length === 0 || cells.length > 400 || markers.length > 100 ||
      new Set(cells.map(cell => `${cell.q},${cell.r}`)).size !== cells.length ||
      new Set(markers.map(marker => marker.id)).size !== markers.length ||
      cells.some(cell => !Number.isSafeInteger(cell.q) || !Number.isSafeInteger(cell.r) ||
        !Number.isSafeInteger(cell.height) || cell.height < 0 || cell.height > 10) ||
      setup.participants.some(participant => !markers.some(marker => marker.id === participant.unitRef)) ||
      markers.some(marker => !cells.some(cell => cell.q === marker.q && cell.r === marker.r)) ||
      moves.some(move => !Number.isSafeInteger(move.range) || move.range < 0 || move.range > 64))
      throw new Error('BATTLE_LAUNCH_INVALID');
  }

  update(session: BattleSessionState): void {
    if (this.session !== null && session.battleId !== this.authorityBattleId
      && session.opening.setup.encounterId !== this.launch.setup.encounterId)
      throw new Error('BATTLE_SESSION_MISMATCH');
    if (this.authorityRetryCount !== session.retryCount) { this.unitRevisions.clear(); this.views.clear(); }
    const authorityChanged = this.authorityBattleId !== session.battleId
      || this.authorityRevision !== session.revision || this.authorityRetryCount !== session.retryCount;
    this.session = session;
    this.authorityBattleId = session.battleId; this.authorityRevision = session.revision;
    this.authorityRetryCount = session.retryCount;
    if (authorityChanged) { this.preview = null; this.destination = null; }
  }
  id(): string | null { return this.session?.battleId ?? null; }

  state(): BattleState {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    return this.session.battle;
  }

  packet(full = false, resolved?: MovePlayback): BattlePacket {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    const battle = this.session.battle; const changed: BattleUnitView[] = [];
    const rewards = projectBattleRewards(this.session);
    for (const unit of battle.units) {
      if (full || this.unitRevisions.get(unit.id) !== unit.revision) {
        const view = projectBattleUnit(unit, this.launch, battle);
        this.views.set(unit.id, view); this.unitRevisions.set(unit.id, unit.revision); changed.push(view);
      }
    }
    const actorId = battle.result ? null : peekReadyUnitId(battle);
    const capabilities = queryActions(battle, actorId, [...this.views.values()], this.destination ?? undefined);
    return { id: this.session.battleId, revision: this.session.revision, capabilities,
      ...(full ? { info: { title: this.launch.title, preview: this.launch.preview, setup: battle.setup,
        cells: this.launch.cells, capabilities } } : {}),
      units: full ? [...this.views.values()] : changed, actorId,
      tick: battle.tick, round: battle.round, actionNo: battle.actionNo,
      timeline: queryTimeline(battle), auto: this.session.auto, preview: this.preview, result: battle.result,
      rewards: rewards === null ? null : { ...rewards, martial: null,
        cycles: rewards.fullCirculations.reduce((sum, entry) => sum + entry.count, 0) },
      ...(resolved ? { resolved } : {}) };
  }

  transcript(): { readonly launch: BattleLaunch; readonly commands: BattleSessionState['commandLog'];
    readonly events: readonly BattleEvent[]; readonly rng: BattleSessionState['battleRng'] } {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    return structuredClone({ launch: { ...this.launch, setup: this.session.opening.setup,
      seeds: this.session.opening.seeds }, commands: this.session.commandLog,
      events: this.session.battle.events, rng: this.session.battleRng });
  }

  previewArea(input: Extract<BattleUiCommand, { t: 'battle/preview' }>): BattlePacket {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    if (input.revision !== this.session.revision) throw new Error('BATTLE_STALE_PREVIEW');
    if (this.session.auto) throw new Error('BATTLE_AUTO_ACTIVE');
    if (input.kind === 'cancel') { this.destination = null; this.preview = null; return this.packet(); }
    if (input.kind === 'move') {
      const actorId = peekReadyUnitId(this.session.battle);
      if (actorId !== input.actor) throw new Error('BATTLE_STALE_PREVIEW');
      const queried = queryActions(this.session.battle, actorId, [...this.views.values()], input.destination);
      if (queried.move.selected === null) throw new Error('PATH_BLOCKED');
      this.destination = queried.move.selected.cost === 0 ? null : queried.move.selected;
      this.preview = null; return this.packet();
    }
    const selectedWalkTo = this.destination === null ? undefined
      : { q: this.destination.q, r: this.destination.r };
    const walkTo = input.walkTo ?? selectedWalkTo;
    this.preview = queryArea(this.session.battle, this.launch, { ...input,
      ...(walkTo === undefined ? {} : { walkTo }) }); return this.packet();
  }

  coreCommand(input: Exclude<BattleUiCommand, { t: 'battle/enter' | 'battle/demo' |
    'battle/leave' | 'battle/preview' }>): BattleBusActCommand | BattleSetAutoBusCommand {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    if (input.t === 'battle/auto') return { t: 'battle/setAuto',
      mode: input.enabled ? 'auto' : 'manual', expectedRevision: this.session.revision };
    if (input.t === 'battle/step') return { t: 'battle/act', automatic: true,
      expectedRevision: input.revision };
    if (input.t === 'battle/wait') return { t: 'battle/act', actor: input.actor,
      action: { t: 'wait' }, ...(input.walkTo === undefined ? {} : { walkTo: input.walkTo }),
      expectedRevision: input.revision };
    if (input.t === 'battle/move') return { t: 'battle/act', actor: input.actor,
      walkTo: input.destination, action: { t: 'wait' }, expectedRevision: input.revision };
    if (input.t === 'battle/item') return { t: 'battle/act', actor: input.actor,
      action: { t: 'item', item: input.itemId, target: input.targetId },
      ...(input.walkTo === undefined ? {} : { walkTo: input.walkTo }), expectedRevision: input.revision };
    if (input.t === 'battle/defend') return { t: 'battle/act', actor: input.actor,
      action: { t: 'guard' }, ...(input.walkTo === undefined ? {} : { walkTo: input.walkTo }),
      expectedRevision: input.revision };
    if (input.t === 'battle/gather') return { t: 'battle/act', actor: input.actor,
      action: { t: 'acuteQiGather', routeRef: input.routeId }, expectedRevision: input.revision };
    const preview = input.preview;
    if (preview.revision !== this.session.revision || this.preview?.requestId !== preview.requestId)
      throw new Error('BATTLE_STALE_PREVIEW');
    const area = queryArea(this.session.battle, this.launch, preview);
    if (!area.valid) throw new Error('BATTLE_TARGET_INVALID');
    const actor = this.session.battle.units.find(unit => unit.id === area.actor);
    const move = actor?.moves.find(candidate => candidate.id === area.moveId);
    const anchorUnit = this.session.battle.units.find(unit => unit.pos.q === area.anchor.q
      && unit.pos.r === area.anchor.r);
    const target = move?.target === 'tile' ? area.anchor : move?.target === 'self'
      ? actor?.id : anchorUnit?.id;
    if (actor === undefined || move === undefined || target === undefined)
      throw new Error('BATTLE_TARGET_INVALID');
    return { t: 'battle/act', actor: actor.id,
      ...(preview.walkTo === undefined ? {} : { walkTo: preview.walkTo }),
      action: { t: 'skill', move: move.id, target, aim: area.aim }, expectedRevision: preview.revision };
  }
}
