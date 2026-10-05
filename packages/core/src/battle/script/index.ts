import type { BattleEvent, BattleState } from '../types';
import { hexDistance, hexKey } from '../../hex';

export interface BattleScriptResult {
  readonly triggered: readonly string[]; readonly events: readonly BattleEvent[];
}

type ScriptBeat = NonNullable<BattleState['setup']['scriptBeats']>[number];
function rescueEnemy(state: BattleState, heroId: string, beatId: string): void {
  const hero = state.units.find((row) => row.id === heroId);
  if (!hero) throw new RangeError(`BATTLE_SCRIPT_UNIT:${heroId}`);
  const hostile = state.units.filter((row) => row.active &&
    state.setup.relations[hero.side][row.side] === 'hostile').sort((left, right) =>
    hexDistance(hero.pos, left.pos) - hexDistance(hero.pos, right.pos) ||
    left.unitIndex - right.unitIndex)[0];
  if (!hostile) return;
  const occupied = new Set(state.units.filter((row) => row.active && row.id !== hostile.id)
    .map((row) => hexKey(row.pos)));
  const destination = state.grid.cells.filter((cell) => cell.standable && !occupied.has(hexKey(cell)))
    .sort((left, right) => hexDistance(hero.pos, right) - hexDistance(hero.pos, left) ||
      left.r - right.r || left.q - right.q)[0];
  if (!destination || hexDistance(hero.pos, destination) <= hexDistance(hero.pos, hostile.pos)) return;
  hostile.pos = { q: destination.q, r: destination.r }; hostile.revision += 1;
  state.events.push({ t: 'battle/rescueDisplaced', actionNo: state.actionNo, actor: 'aqing',
    target: hostile.id, message: beatId, payload: { q: destination.q, r: destination.r } });
}
function conditionMet(state: BattleState, beat: ScriptBeat,
  lossStreak: number): boolean {
  if (beat.when.kind === 'lossStreak') return lossStreak >= beat.when.count;
  const when = beat.when;
  const unit = state.units.find((row) => row.id === when.unitRef);
  return unit !== undefined && unit.hp * 10_000 < unit.hpMax * when.thresholdBp;
}

/** Executes authored beats in declaration order; callers append the returned facts to replay state. */
export function executeBattleScript(state: BattleState, lossStreak: number): BattleScriptResult {
  if (!Number.isSafeInteger(lossStreak) || lossStreak < 0) throw new RangeError('BATTLE_LOSS_STREAK');
  let retryLosses = 0;
  for (const event of state.events) {
    if (event.t === 'battle/retried' && event.amount !== undefined
      && Number.isSafeInteger(event.amount) && event.amount > retryLosses) retryLosses = event.amount;
  }
  const effectiveLossStreak = lossStreak + retryLosses;
  if (!Number.isSafeInteger(effectiveLossStreak)) throw new RangeError('BATTLE_LOSS_STREAK');
  const start = state.events.length; const triggered: string[] = [];
  const alreadyThisPass = new Set([
    ...state.units.flatMap((unit) => unit.triggeredScriptBeats ?? []),
    ...state.events.flatMap((event) => event.t === 'battle/scriptBeatTriggered'
      && event.message !== undefined ? [event.message] : []),
  ]);
  for (const beat of state.setup.scriptBeats ?? []) {
    if (beat.once && alreadyThisPass.has(beat.id)
      || !conditionMet(state, beat, effectiveLossStreak)) continue;
    triggered.push(beat.id);
    alreadyThisPass.add(beat.id);
    const owner = state.units[0];
    if (owner !== undefined) owner.triggeredScriptBeats = [...(owner.triggeredScriptBeats ?? []), beat.id];
    state.events.push({ t: 'battle/scriptBeatTriggered', actionNo: state.actionNo, message: beat.id });
    for (const action of beat.actions) {
      if (action.kind === 'emit') {
        state.events.push({ t: action.event, actionNo: state.actionNo, message: beat.id });
        if (action.event === 'battle/aqingRescue' && beat.when.kind === 'hpBelow')
          rescueEnemy(state, beat.when.unitRef, beat.id);
      } else if (action.kind === 'offerDemonstration') {
        state.events.push({ t: 'battle/demonstrationOffered', actionNo: state.actionNo,
          message: action.replayId });
      } else {
        const index = state.units.findIndex((unit) => unit.id === action.unitRef);
        if (index < 0) throw new RangeError(`BATTLE_SCRIPT_UNIT:${action.unitRef}`);
        state.units[index] = { ...state.units[index]!, control: action.control,
          revision: state.units[index]!.revision + 1 };
        state.events.push({ t: 'battle/controlSwitched', actionNo: state.actionNo,
          target: action.unitRef, message: action.control });
      }
    }
  }
  return { triggered, events: state.events.slice(start) };
}
