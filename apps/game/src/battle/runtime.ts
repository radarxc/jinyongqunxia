import {
  advanceBattleToReady, chooseAutoCommand, computeBattleRewards, createBattleState, createRng,
  defaultMaxActions, emitBattleRewards, evaluateBattleEnd, finishBattle, peekReadyUnitId,
  resolveBattleAction, seedStream, queryPath, type BattleCommand, type BattleEvent,
  type BattleRewards as CoreBattleRewards, type BattleState,
} from '@tianshu/core';
import type { BattleLaunch, BattlePacket, BattleUiCommand, BattleUnitView, MovePlayback } from './contracts';
import { projectBattleUnit } from './presentation';
import { queryArea, queryTimeline } from './queries';

const unavailable = (reason: string) => ({ enabled: false, reason });
const CAPABILITIES = { move: { enabled: true, reason: '' }, item: unavailable('当前战斗暂不可使用物品'),
  defend: unavailable('当前战斗暂不可防御'), gather: unavailable('当前战斗尚未接通急性聚气') };
const POLICY = { style: 'aggressive', reserveMpBp: 0, allowUltimate: true, allowItems: false } as const;

export class BattleRuntime {
  private state: BattleState;
  private rng;
  private readonly lootRng;
  private rewards: CoreBattleRewards | null = null;
  private revision = 0;
  private auto = false;
  private preview: BattlePacket['preview'] = null;
  private readonly views = new Map<string, BattleUnitView>();
  private readonly signatures = new Map<string, string>();
  readonly launch: BattleLaunch;

  constructor(input: BattleLaunch) {
    this.launch = structuredClone(input);
    const { setup, seeds, cells, markers, moves } = this.launch;
    if (setup.schema !== 'battle-setup.v1' || cells.length === 0 || cells.length > 400 || markers.length > 100 ||
      new Set(cells.map(cell => `${cell.q},${cell.r}`)).size !== cells.length ||
      new Set(markers.map(marker => marker.id)).size !== markers.length ||
      cells.some(cell => !Number.isSafeInteger(cell.q) || !Number.isSafeInteger(cell.r) ||
        !Number.isSafeInteger(cell.height) || cell.height < 0 || cell.height > 10) ||
      setup.participants.some(participant => !markers.some(marker => marker.id === participant.unitRef)) ||
      markers.some(marker => !cells.some(cell => cell.q === marker.q && cell.r === marker.r)) ||
      moves.some(move => !Number.isSafeInteger(move.range) || move.range < 0 || move.range > 64))
      throw new Error('BATTLE_LAUNCH_INVALID');
    this.state = createBattleState(setup, seeds);
    this.rng = createRng(seedStream(setup.seed, 'battle'));
    this.lootRng = createRng(seedStream(setup.seed, 'loot'));
    this.ready();
  }

  private settleRewards(): CoreBattleRewards | null {
    if (this.state.result === null) return null;
    if (this.rewards === null) {
      this.rewards = computeBattleRewards(this.state, this.lootRng);
      emitBattleRewards(this.state, this.rewards);
    }
    return this.rewards;
  }

  private ready(): void {
    if (this.state.result) { this.settleRewards(); return; }
    const end = evaluateBattleEnd(this.state);
    if (end) { finishBattle(this.state, end); this.settleRewards(); return; }
    if (advanceBattleToReady(this.state).kind === 'stalled') finishBattle(this.state, 'draw');
    if (this.state.result) this.settleRewards();
  }

  packet(full = false, resolved?: MovePlayback): BattlePacket {
    const rewards = this.rewards;
    const changed: BattleUnitView[] = [];
    for (const unit of this.state.units) {
      const signature = JSON.stringify(unit);
      if (signature !== this.signatures.get(unit.id)) {
        const view = projectBattleUnit(unit, this.launch);
        this.views.set(unit.id, view); this.signatures.set(unit.id, signature); changed.push(view);
      }
    }
    return { id: this.launch.setup.setupId, revision: this.revision,
      ...(full ? { info: { title: this.launch.title, preview: this.launch.preview, setup: this.launch.setup,
        cells: this.launch.cells, capabilities: { ...CAPABILITIES,
          item: unavailable(this.launch.setup.rules.noItems ? '本场禁止使用物品' : CAPABILITIES.item.reason) } } } : {}),
      units: full ? [...this.views.values()] : changed, actorId: this.state.result ? null : peekReadyUnitId(this.state),
      tick: this.state.tick, round: this.state.round, actionNo: this.state.actionNo,
      timeline: queryTimeline(this.state), auto: this.auto, preview: this.preview, result: this.state.result,
      rewards: rewards === null ? null : { drops: rewards.drops, martial: null,
        cycles: rewards.fullCirculations.reduce((sum, entry) => sum + entry.count, 0),
        martialUses: rewards.martialUses, movementTrained: rewards.movementTrained,
        fullCirculations: rewards.fullCirculations },
      ...(resolved ? { resolved } : {}),
    };
  }

  transcript() { return structuredClone({ launch: this.launch, commands: this.state.acceptedCommands,
    events: this.state.events, rng: this.rng.snapshot() }); }

  execute(command: BattleUiCommand): { packet: BattlePacket; events: readonly BattleEvent[] } {
    const start = this.state.events.length;
    if (command.t === 'battle/auto') {
      if (command.enabled && this.state.setup.rules.noAuto) throw new Error('BATTLE_AUTO_FORBIDDEN');
      if (this.state.result) throw new Error('BATTLE_ENDED');
      if (this.auto !== command.enabled) this.state.events.push({ t: command.enabled
        ? 'battle/autoSimulationStarted' : 'battle/autoSimulationEnded', actionNo: this.state.actionNo });
      this.auto = command.enabled; this.preview = null;
    } else if (command.t === 'battle/preview') {
      this.assertRevision(command.revision);
      if (this.auto) throw new Error('BATTLE_AUTO_ACTIVE');
      this.preview = queryArea(this.state, this.launch, command);
    } else {
      const resolved = this.act(command);
      return { packet: this.packet(false, resolved), events: this.state.events.slice(start) };
    }
    return { packet: this.packet(), events: this.state.events.slice(start) };
  }

  private assertRevision(revision: number): void {
    if (revision !== this.revision) throw new Error('BATTLE_STALE_PREVIEW');
  }

  private act(input: BattleUiCommand): MovePlayback | undefined {
    if (input.t === 'battle/item' || input.t === 'battle/defend' || input.t === 'battle/gather')
      throw new Error('BATTLE_ACTION_UNAVAILABLE');
    if (input.t !== 'battle/act-at' && input.t !== 'battle/step' && input.t !== 'battle/wait'
      && input.t !== 'battle/move')
      throw new Error('BATTLE_COMMAND_UNKNOWN');
    this.assertRevision(input.t === 'battle/act-at' ? input.preview.revision : input.revision);
    const actorId = peekReadyUnitId(this.state);
    const actor = this.state.units.find(unit => unit.id === actorId);
    if (this.state.result || !actor) throw new Error('BATTLE_ENDED');
    const automatic = input.t === 'battle/step';
    let command: BattleCommand;
    if (automatic) {
      if (!this.auto && actor.control !== 'ai') throw new Error('BATTLE_MANUAL_TURN');
      command = chooseAutoCommand(this.state, actor, POLICY);
    } else {
      if (this.auto || actor.control !== 'player') throw new Error('BATTLE_NOT_MANUAL_TURN');
      if (input.t === 'battle/wait') command = { t: 'battle/wait', actor: input.actor };
      else if (input.t === 'battle/move') {
        if (input.actor !== actor.id || queryPath(this.state, actor.id, input.destination) === null) {
          throw new Error('PATH_BLOCKED');
        }
        command = { t: 'battle/act', actor: actor.id, walkTo: input.destination, action: { t: 'wait' } };
      }
      else {
        if (!this.preview || input.preview.requestId !== this.preview.requestId ||
          JSON.stringify(input.preview) !== JSON.stringify(this.preview)) throw new Error('BATTLE_STALE_PREVIEW');
        const area = queryArea(this.state, this.launch, input.preview);
        if (!area.valid) throw new Error('BATTLE_TARGET_INVALID');
        const selectedMove = actor.moves.find(move => move.id === area.moveId);
        if (selectedMove === undefined) throw new Error('BATTLE_MOVE_UNKNOWN');
        const anchorUnit = this.state.units.find(unit => unit.pos.q === area.anchor.q
          && unit.pos.r === area.anchor.r);
        const target = selectedMove.target === 'tile' ? area.anchor
          : selectedMove.target === 'self' ? actor.id : anchorUnit?.id;
        if (target === undefined) throw new Error('BATTLE_TARGET_INVALID');
        command = { t: 'battle/act', actor: area.actor,
          action: { t: 'skill', move: area.moveId, target, aim: area.aim } };
      }
    }
    // Core's compact resolver mutates. Stage both state and RNG so even a partial failure rolls back.
    const candidate = structuredClone(this.state);
    const rng = createRng(this.rng.snapshot());
    const before = candidate.events.length;
    const result = resolveBattleAction(candidate, command, rng, { deferEndCheck: automatic });
    if (!result.accepted) throw new Error(result.error ?? 'BATTLE_ACTION_FAILED');
    if (automatic) {
      const target = command.t === 'battle/act' && command.action.t === 'skill'
        && typeof command.action.target === 'string' ? command.action.target : undefined;
      candidate.events.push({ t: 'battle/autoExchangeResolved', actionNo: candidate.actionNo,
        actor: actor.id, amount: result.hpDamage, ...(target ? { target } : {}) });
      const end = evaluateBattleEnd(candidate);
      if (end && !candidate.result) finishBattle(candidate, end);
    }
    // The core owns the cap value and terminal event; scheduling is one action per host request.
    if (!candidate.result && candidate.actionNo >= defaultMaxActions(candidate.units.length)) finishBattle(candidate, 'draw');
    const from = projectBattleUnit(actor, this.launch);
    const skill = command.t === 'battle/act' && command.action.t === 'skill' ? command.action : null;
    const resolvedTargets = skill === null ? [] : candidate.events.slice(before)
      .filter(event => event.t === 'battle/damageResolved' && event.target !== undefined)
      .map(event => candidate.units.find(unit => unit.id === event.target))
      .filter((unit): unit is BattleState['units'][number] => unit !== undefined);
    const resolved: MovePlayback | undefined = skill !== null
      ? { moveId: skill.move,
      from, to: resolvedTargets.map(unit => projectBattleUnit(unit, this.launch)),
      result: { actionNo: candidate.actionNo, hpDamage: result.hpDamage, events: candidate.events.slice(before) } } : undefined;
    this.state = candidate; this.rng = rng; this.revision += 1; this.preview = null;
    this.ready();
    if (this.state.result && this.auto) {
      this.auto = false; this.state.events.push({ t: 'battle/autoSimulationEnded',
        actionNo: this.state.actionNo, message: this.state.result });
    }
    return resolved;
  }
}
