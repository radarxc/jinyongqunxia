import type { BattleEvent, BattleState } from '../types';

export interface BattleScriptResult {
  readonly triggered: readonly string[]; readonly events: readonly BattleEvent[];
}

type ScriptBeat = NonNullable<BattleState['setup']['scriptBeats']>[number];
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
