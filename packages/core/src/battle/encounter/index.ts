import { compareCodePoints } from '@tianshu/shared';
import { createOpeningOrder } from '../timeline';
import type {
  BattleCondition, BattleParticipant, BattleResult, BattleSetup, BattleState, BattleUnit, EntryKind, SideId,
} from '../types';

const SIDE_RANK: Readonly<Record<SideId, number>> =
  { player: 0, ally: 1, enemy: 2, neutral: 3 };

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

function cloneConditions(conditions: readonly BattleCondition[]): BattleCondition[] {
  return conditions.map((condition) => ({ ...condition }));
}
export interface BattleParticipantInput extends Omit<BattleParticipant, 'unitIndex'> { readonly unitIndex?: number }
export interface BattleSetupInput {
  readonly encounterId: `enc_${string}`; readonly setupId: string; readonly seed: number;
  readonly sourceSnapshotHash: string; readonly entryKind: EntryKind; readonly sourceId: string;
  readonly triggerId: string; readonly worldTick: number; readonly participants: readonly BattleParticipantInput[];
  readonly initiativeSide?: SideId; readonly sceneRef: string; readonly anchorRef: string;
  readonly mode?: BattleSetup['rules']['mode']; readonly noAuto?: boolean; readonly noRetreat?: boolean;
  readonly noItems?: boolean; readonly mercyAllowed?: boolean; readonly lethalIntent?: boolean;
  readonly friendlyFire?: boolean; readonly roundLimit?: number; readonly boss?: boolean;
  readonly winCond?: readonly BattleCondition[]; readonly loseCond?: readonly BattleCondition[];
  readonly drawCond?: readonly BattleCondition[]; readonly meditationUnitRefs?: readonly string[];
}

function orderedParticipants(input: readonly BattleParticipantInput[]): BattleParticipant[] {
  return [...input].sort((left, right) => SIDE_RANK[left.side] - SIDE_RANK[right.side]
    || Number(right.required) - Number(left.required) || compareCodePoints(left.unitRef, right.unitRef))
    .map((participant, unitIndex) => ({ ...participant, unitIndex }));
}

export function createBattleSetup(input: BattleSetupInput): BattleSetup {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0 || input.seed > 0xffff_ffff) {
    throw new RangeError('BATTLE_SETUP_SEED');
  }
  const participants = orderedParticipants(input.participants);
  if (participants.length < 2 || new Set(participants.map((entry) => entry.unitRef)).size !== participants.length) {
    throw new RangeError('BATTLE_SETUP_PARTICIPANTS');
  }
  const meditation = new Set(input.meditationUnitRefs ?? []);
  const initialEffects = input.entryKind === 'meditationAmbush'
    ? participants.filter((entry) => meditation.has(entry.unitRef)).map((entry) => ({
      unitRef: entry.unitRef, buffRef: 'bf_chaqi' as const, stacks: 1,
      remainingOwnActions: 3, cause: input.triggerId,
    })) : [];
  const setup: BattleSetup = { schema: 'battle-setup.v1', encounterId: input.encounterId,
    setupId: input.setupId, seed: input.seed >>> 0, sourceSnapshotHash: input.sourceSnapshotHash,
    entry: { kind: input.entryKind, sourceId: input.sourceId, triggerId: input.triggerId,
      worldTick: input.worldTick, meditationInterrupted: initialEffects.length > 0 }, participants,
    relations: { player: { player: 'friendly', ally: 'friendly', enemy: 'hostile', neutral: 'neutral' },
      ally: { player: 'friendly', ally: 'friendly', enemy: 'hostile', neutral: 'neutral' },
      enemy: { player: 'hostile', ally: 'hostile', enemy: 'friendly', neutral: 'neutral' },
      neutral: { player: 'neutral', ally: 'neutral', enemy: 'neutral', neutral: 'friendly' } },
    start: { deployment: input.entryKind === 'meditationAmbush' ? 'ambushed' : 'standard',
      initiativeSide: input.initiativeSide ?? (input.entryKind === 'meditationAmbush' ? 'enemy' : 'player'),
      battleAnchor: input.anchorRef, profile: 'normal', initialByUnit: participants.map((entry) =>
        ({ unitRef: entry.unitRef, ct: 0, rage: 0 })), initialEffects },
    end: { winCond: cloneConditions(input.winCond ?? [{ kind: 'allHostileDown', side: 'player' }]),
      loseCond: cloneConditions(input.loseCond ?? [{ kind: 'unitDown', unitRef: participants.find(
        (entry) => entry.side === 'player' && entry.required)?.unitRef ?? participants[0]!.unitRef }]),
      drawCond: cloneConditions(input.drawCond ?? []), onDefeat: 'retry' },
    rules: { mode: input.mode ?? 'normal',
      noAuto: input.noAuto ?? false, noRetreat: input.noRetreat ?? false, noItems: input.noItems ?? false,
      mercyAllowed: input.mercyAllowed ?? true, lethalIntent: input.lethalIntent ?? false,
      roundLimit: input.roundLimit ?? (input.boss === true ? 60 : 30),
      friendlyFire: input.friendlyFire ?? false, boss: input.boss ?? false }, waves: [],
    returnContext: { sceneRef: input.sceneRef, anchorRef: input.anchorRef, recovery: input.mode === 'spar'
      ? 'sparRestore' : 'preserve' } };
  return deepFreeze(setup);
}

export const createEncounterBattleSetup = (input: Omit<BattleSetupInput, 'entryKind'>): BattleSetup =>
  createBattleSetup({ ...input, entryKind: 'encounter' });
export const createStoryBattleSetup = (input: Omit<BattleSetupInput, 'entryKind'>): BattleSetup =>
  createBattleSetup({ ...input, entryKind: 'story' });
export const createMeditationAmbushBattleSetup = (input: Omit<BattleSetupInput, 'entryKind'>): BattleSetup =>
  createBattleSetup({ ...input, entryKind: 'meditationAmbush' });

type DefaultedBattleUnitField = 'meridianDefenseBp' | 'qiProductionPerTick' | 'reverseQi' | 'redirectedQi';
export type BattleUnitSeed = Omit<BattleUnit, 'unitIndex' | 'side' | 'control' | 'state' | 'active' | 'ct'
  | DefaultedBattleUnitField> & Partial<Pick<BattleUnit, DefaultedBattleUnitField>>;
function cloneUnitSeed(seed: BattleUnitSeed, participant: BattleParticipant, ct: number,
  initialBuffs: BattleUnit['buffs']): BattleUnit {
  return { ...seed, unitIndex: participant.unitIndex, side: participant.side, control: participant.control,
    state: participant.state, active: participant.state === 'active' || participant.state === 'hidden', ct,
    zoneGuards: { body: { ...seed.zoneGuards.body }, hand: { ...seed.zoneGuards.hand },
      leg: { ...seed.zoneGuards.leg } }, buffs: [...seed.buffs.map((buff) => ({ ...buff })), ...initialBuffs],
    foreignQi: seed.foreignQi.map((foreign) => ({ ...foreign,
      reversePath: foreign.reversePath.map((step) => ({ ...step })) })),
    acupointOccupancies: seed.acupointOccupancies.map((occupancy) => ({ ...occupancy,
      affectedRouteRefs: [...occupancy.affectedRouteRefs] })),
    meridianDefenseBp: seed.meridianDefenseBp ?? 10_000,
    qiProductionPerTick: seed.qiProductionPerTick ?? 1, reverseQi: seed.reverseQi ?? null,
    redirectedQi: seed.redirectedQi ?? 0 };
}
export function createBattleState(setup: BattleSetup, seeds: readonly BattleUnitSeed[]): BattleState {
  let nextBuffIid = 1;
  for (const seed of seeds) for (const buff of seed.buffs) nextBuffIid = Math.max(nextBuffIid, buff.iid + 1);
  const units = setup.participants.map((participant) => {
    const seed = seeds.find((candidate) => candidate.id === participant.unitRef);
    if (seed === undefined) throw new RangeError('BATTLE_UNIT_MISSING');
    const initial = setup.start.initialByUnit.find((entry) => entry.unitRef === participant.unitRef);
    const initialBuffs = setup.start.initialEffects.filter((effect) => effect.unitRef === participant.unitRef)
      .map((effect) => ({ iid: nextBuffIid++, def: effect.buffRef, holder: participant.unitRef,
        source: effect.cause, grade: 1, stacks: effect.stacks, turnsLeft: effect.remainingOwnActions, fresh: false }));
    return cloneUnitSeed(seed, participant, initial?.ct ?? 0, initialBuffs);
  });
  return { setup, units, tick: 0, round: 0, actionNo: 0, phase: 'opening', result: null,
    openingOrder: createOpeningOrder(units, setup.start.initiativeSide), events: [], acceptedCommands: [] };
}

function conditionMet(condition: BattleCondition, state: BattleState): boolean {
  if (condition.kind === 'unitDown') return state.units.find((unit) => unit.id === condition.unitRef)?.active === false;
  if (condition.kind === 'surviveRounds') return state.round >= condition.rounds;
  if (condition.kind === 'actionLimit') return state.actionNo >= condition.actions;
  return state.units.filter((unit) => unit.active && unit.side !== condition.side)
    .every((unit) => state.setup.relations[condition.side][unit.side] !== 'hostile');
}

export function evaluateBattleEnd(state: BattleState): BattleResult | null {
  if (state.setup.end.loseCond.some((condition) => conditionMet(condition, state))) return 'lose';
  if (state.setup.end.winCond.some((condition) => conditionMet(condition, state))) return 'win';
  if (state.setup.end.drawCond.some((condition) => conditionMet(condition, state))) return 'draw';
  if (state.round >= state.setup.rules.roundLimit) return state.setup.rules.boss ? 'draw' : 'win';
  return null;
}

export function finishBattle(state: BattleState, result: BattleResult): void {
  state.result = result; state.phase = 'ended';
  state.events.push({ t: 'battle/ended', actionNo: state.actionNo, message: result });
}
