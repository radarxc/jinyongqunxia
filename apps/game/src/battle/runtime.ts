import { createBattleSession, peekReadyUnitId, projectBattleRewards, type BattleEvent, type BattleSessionState,
  type BattleState } from '@tianshu/core/battle';
import type { BattleBusActCommand, BattleSetAutoBusCommand } from '@tianshu/core';
import type { BattleLaunch, BattlePacket, BattleUiCommand, BattleUnitView, MovePlayback } from './contracts';
import { projectBattleUnit } from './presentation';
import { queryArea, queryTimeline } from './queries';

const unavailable = (reason: string) => ({ enabled: false, reason });
const CAPABILITIES = { move: { enabled: true, reason: '' }, item: unavailable('当前战斗暂不可使用物品'),
  defend: unavailable('当前战斗暂不可防御'), gather: unavailable('当前战斗尚未接通急性聚气') };

/** Read-only host adapter. Battle rules, RNG and command history live in core's BattleSession. */
export class BattleRuntime {
  private readonly views = new Map<string, BattleUnitView>();
  private readonly unitRevisions = new Map<string, number>();
  private preview: BattlePacket['preview'] = null;
  private session: BattleSessionState | null;
  readonly launch: BattleLaunch;

  constructor(input: BattleLaunch, session?: BattleSessionState) {
    this.launch = structuredClone(input);
    this.session = session ?? createBattleSession(this.launch.setup, this.launch.seeds);
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
    if (this.session !== null && session.battleId !== this.session.battleId
      && session.opening.setup.encounterId !== this.launch.setup.encounterId)
      throw new Error('BATTLE_SESSION_MISMATCH');
    if (this.session?.retryCount !== session.retryCount) { this.unitRevisions.clear(); this.views.clear(); }
    this.session = session; this.preview = null;
  }
  id(): string | null { return this.session?.battleId ?? null; }

  setPreview(preview: BattlePacket['preview']): void { this.preview = preview; }
  clearPreview(): void { this.preview = null; }

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
        const view = projectBattleUnit(unit, this.launch);
        this.views.set(unit.id, view); this.unitRevisions.set(unit.id, unit.revision); changed.push(view);
      }
    }
    return { id: this.session.battleId, revision: this.session.revision,
      ...(full ? { info: { title: this.launch.title, preview: this.launch.preview, setup: battle.setup,
        cells: this.launch.cells, capabilities: { ...CAPABILITIES,
          item: unavailable(battle.setup.rules.noItems ? '本场禁止使用物品' : CAPABILITIES.item.reason) } } } : {}),
      units: full ? [...this.views.values()] : changed, actorId: battle.result ? null : peekReadyUnitId(battle),
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

  previewArea(input: Parameters<typeof queryArea>[2]): BattlePacket {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    if (input.revision !== this.session.revision) throw new Error('BATTLE_STALE_PREVIEW');
    if (this.session.auto) throw new Error('BATTLE_AUTO_ACTIVE');
    this.preview = queryArea(this.session.battle, this.launch, input); return this.packet();
  }

  coreCommand(input: Exclude<BattleUiCommand, { t: 'battle/enter' | 'battle/demo' |
    'battle/leave' | 'battle/preview' }>): BattleBusActCommand | BattleSetAutoBusCommand {
    if (this.session === null) throw new Error('BATTLE_NOT_ACTIVE');
    if (input.t === 'battle/auto') return { t: 'battle/setAuto',
      mode: input.enabled ? 'auto' : 'manual', expectedRevision: this.session.revision };
    if (input.t === 'battle/step') return { t: 'battle/act', automatic: true,
      expectedRevision: input.revision };
    if (input.t === 'battle/wait') return { t: 'battle/act', actor: input.actor,
      action: { t: 'wait' }, expectedRevision: input.revision };
    if (input.t === 'battle/move') return { t: 'battle/act', actor: input.actor,
      walkTo: input.destination, action: { t: 'wait' }, expectedRevision: input.revision };
    if (input.t === 'battle/item') return { t: 'battle/act', actor: input.actor,
      action: { t: 'item', item: input.itemId, target: input.targetId }, expectedRevision: input.revision };
    if (input.t === 'battle/defend') return { t: 'battle/act', actor: input.actor,
      action: { t: 'guard' }, expectedRevision: input.revision };
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
    return { t: 'battle/act', actor: actor.id, action: { t: 'skill', move: move.id,
      target, aim: area.aim }, expectedRevision: preview.revision };
  }
}
