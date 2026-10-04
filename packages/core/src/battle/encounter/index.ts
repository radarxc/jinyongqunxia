import { compareCodePoints, floorDivInt } from '@tianshu/shared';
import { hexKey, jumpDistance, movementPoints, type HexCoord, type HexDir } from '../../hex';
import { createMeridianFlowRuntime } from '../meridian-flow';
import { createOpeningOrder } from '../timeline';
import type {
  BattleCondition, BattleGridCell, BattleParticipant, BattleResult, BattleSetup, BattleState, BattleUnit,
  EntryKind, SideId,
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

function cloneSetupValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneSetupValue(entry)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const clone: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) clone[key] = cloneSetupValue(entry);
    return clone as T;
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
  readonly meridianInputs?: BattleSetup['meridianInputs'];
  readonly inventory?: BattleSetup['inventory']; readonly itemDefs?: BattleSetup['itemDefs'];
  readonly rewards?: Partial<BattleSetup['rewards']>;
  readonly grid?: readonly {
    readonly q: number; readonly r: number; readonly height: number; readonly moveCost: number;
    readonly canopy?: number; readonly los?: 'none' | 'partial' | 'full';
    readonly standable?: boolean; readonly narrow?: boolean; readonly dangerous?: boolean;
    readonly terrainDealtBp?: number; readonly terrainTakenBp?: number;
    readonly cover?: { readonly vs: readonly ('projectile' | 'ranged')[]; readonly hit: number;
      readonly damageBp: number; readonly sourceDirs?: readonly HexDir[] } | null;
  }[];
  readonly initialUnits?: readonly { readonly unitRef: string; readonly pos: HexCoord; readonly facing: HexDir }[];
}

function orderedParticipants(input: readonly BattleParticipantInput[]): BattleParticipant[] {
  return [...input].sort((left, right) => SIDE_RANK[left.side] - SIDE_RANK[right.side]
    || Number(right.required) - Number(left.required) || compareCodePoints(left.unitRef, right.unitRef))
    .map((participant, unitIndex) => ({ ...participant, unitIndex }));
}

function validGridCell(cell: NonNullable<BattleSetupInput['grid']>[number]): boolean {
  const cover = cell.cover;
  return Number.isSafeInteger(cell.q) && Number.isSafeInteger(cell.r)
    && Number.isSafeInteger(cell.height) && cell.height >= 0 && cell.height <= 10
    && Number.isSafeInteger(cell.moveCost) && cell.moveCost >= 1
    && (cell.canopy === undefined || Number.isSafeInteger(cell.canopy) && cell.canopy >= 0)
    && (cell.los === undefined || cell.los === 'none' || cell.los === 'partial' || cell.los === 'full')
    && (cell.standable === undefined || typeof cell.standable === 'boolean')
    && (cell.narrow === undefined || typeof cell.narrow === 'boolean')
    && (cell.dangerous === undefined || typeof cell.dangerous === 'boolean')
    && (cell.terrainDealtBp === undefined || Number.isSafeInteger(cell.terrainDealtBp))
    && (cell.terrainTakenBp === undefined || Number.isSafeInteger(cell.terrainTakenBp))
    && (cover === undefined || cover === null || Array.isArray(cover.vs)
      && cover.vs.length > 0 && new Set(cover.vs).size === cover.vs.length
      && cover.vs.every((delivery) => delivery === 'projectile' || delivery === 'ranged')
      && Number.isSafeInteger(cover.hit) && Number.isSafeInteger(cover.damageBp)
      && (cover.sourceDirs === undefined || Array.isArray(cover.sourceDirs)
        && cover.sourceDirs.length > 0 && new Set(cover.sourceDirs).size === cover.sourceDirs.length
        && cover.sourceDirs.every(validFacing)));
}

function validFacing(value: number): value is HexDir {
  return Number.isSafeInteger(value) && value >= 0 && value <= 5;
}

export function createBattleSetup(input: BattleSetupInput): BattleSetup {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0 || input.seed > 0xffff_ffff) {
    throw new RangeError('BATTLE_SETUP_SEED');
  }
  const participants = orderedParticipants(input.participants);
  if (participants.length < 2 || new Set(participants.map((entry) => entry.unitRef)).size !== participants.length) {
    throw new RangeError('BATTLE_SETUP_PARTICIPANTS');
  }
  const providedMeridians = input.meridianInputs;
  if (providedMeridians !== undefined && (providedMeridians.length !== participants.length
    || new Set(providedMeridians.map((entry) => entry.unitId)).size !== participants.length
    || providedMeridians.some((entry) => !participants.some((unit) => unit.unitRef === entry.unitId)))) {
    throw new RangeError('BATTLE_SETUP_MERIDIANS');
  }
  const meridianInputs = participants.map((participant) => {
    const found = providedMeridians?.find((entry) => entry.unitId === participant.unitRef);
    return found === undefined
      ? { unitId: participant.unitRef, productionPerTick: 1, qiSpeedBp: 10_000,
        practiceBp: 8_000, nodes: [], routes: [] }
      : cloneSetupValue(found);
  });
  const rewards = { drops: (input.rewards?.drops ?? []).map((entry) => ({ ...entry })),
    lootPool: (input.rewards?.lootPool ?? []).map((entry) => ({ ...entry })),
    lootDraws: input.rewards?.lootDraws ?? 0 };
  const lootWeight = rewards.lootPool.reduce((total, entry) => total + entry.weight, 0);
  if (!Number.isSafeInteger(rewards.lootDraws) || rewards.lootDraws < 0
    || rewards.lootDraws > 0 && rewards.lootPool.length === 0
    || !Number.isSafeInteger(lootWeight) || lootWeight > 0x1_0000_0000
    || rewards.drops.some((entry) => !Number.isSafeInteger(entry.count) || entry.count < 1)
    || rewards.lootPool.some((entry) => !Number.isSafeInteger(entry.count) || entry.count < 1
      || !Number.isSafeInteger(entry.weight) || entry.weight < 1)) {
    throw new RangeError('BATTLE_SETUP_REWARDS');
  }
  const meditation = new Set(input.meditationUnitRefs ?? []);
  const defaultPositions = participants.map((participant, index) => ({
    unitRef: participant.unitRef, pos: { q: index, r: 0 }, facing: (index === 0 ? 0 : 3) as HexDir,
  }));
  const placements = input.initialUnits ?? defaultPositions;
  const participantIds = new Set(participants.map((entry) => entry.unitRef));
  if (placements.length !== participants.length
    || new Set(placements.map((entry) => entry.unitRef)).size !== participants.length
    || placements.some((entry) => !participantIds.has(entry.unitRef))
    || placements.some((entry) => !Number.isSafeInteger(entry.pos.q)
      || !Number.isSafeInteger(entry.pos.r) || !validFacing(entry.facing))
    || new Set(placements.map((entry) => hexKey(entry.pos))).size !== placements.length) {
    throw new RangeError('BATTLE_SETUP_PLACEMENTS');
  }
  const defaultGrid: BattleGridCell[] = Array.from({ length: Math.max(2, participants.length) }, (_, q) =>
    ({ q, r: 0, height: 0, moveCost: 1, canopy: 0, los: 'none', standable: true,
      narrow: false, dangerous: false, terrainDealtBp: 0, terrainTakenBp: 0, cover: null }));
  const inputGrid = input.grid ?? defaultGrid;
  if (inputGrid.some((cell) => !validGridCell(cell))) throw new RangeError('BATTLE_SETUP_GRID');
  const grid = [...inputGrid].sort((left, right) => left.r - right.r || left.q - right.q)
    .map((cell) => ({ ...cell, canopy: cell.canopy ?? 0, los: cell.los ?? 'none' as const,
      standable: cell.standable ?? true, narrow: cell.narrow ?? false,
      dangerous: cell.dangerous ?? false, terrainDealtBp: cell.terrainDealtBp ?? 0,
      terrainTakenBp: cell.terrainTakenBp ?? 0, cover: cell.cover === undefined || cell.cover === null
        ? null : { ...cell.cover, vs: [...cell.cover.vs].sort(compareCodePoints),
          ...(cell.cover.sourceDirs === undefined ? {}
            : { sourceDirs: [...cell.cover.sourceDirs].sort((left, right) => left - right) }) } }));
  const qValues = grid.map((cell) => cell.q); const rValues = grid.map((cell) => cell.r);
  if (grid.length === 0 || grid.length > 400 || grid.some((cell) => !validGridCell(cell))
    || Math.max(...qValues) - Math.min(...qValues) > 20
    || Math.max(...rValues) - Math.min(...rValues) > 20
    || new Set(grid.map(hexKey)).size !== grid.length
    || placements.some((entry) => {
      const cell = grid.find((candidate) => hexKey(candidate) === hexKey(entry.pos));
      return cell === undefined || !cell.standable;
    })) {
    throw new RangeError('BATTLE_SETUP_GRID');
  }
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
    grid: { topology: 'hex-pointy', cells: grid },
    start: { deployment: input.entryKind === 'meditationAmbush' ? 'ambushed' : 'standard',
      initiativeSide: input.initiativeSide ?? (input.entryKind === 'meditationAmbush' ? 'enemy' : 'player'),
      battleAnchor: input.anchorRef, profile: 'normal', initialByUnit: participants.map((entry) => {
        const placement = placements.find((candidate) => candidate.unitRef === entry.unitRef)!;
        return { unitRef: entry.unitRef, ct: 0, rage: 0,
          pos: { ...placement.pos }, facing: placement.facing };
      }), initialEffects },
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
      ? 'sparRestore' : 'preserve' }, meridianInputs,
    inventory: { stacks: (input.inventory?.stacks ?? []).map((stack) => ({ ...stack })) },
    itemDefs: (input.itemDefs ?? []).map((item) => cloneSetupValue(item)), rewards };
  return deepFreeze(setup);
}

export const createEncounterBattleSetup = (input: Omit<BattleSetupInput, 'entryKind'>): BattleSetup =>
  createBattleSetup({ ...input, entryKind: 'encounter' });
export const createStoryBattleSetup = (input: Omit<BattleSetupInput, 'entryKind'>): BattleSetup =>
  createBattleSetup({ ...input, entryKind: 'story' });
export const createMeditationAmbushBattleSetup = (input: Omit<BattleSetupInput, 'entryKind'>): BattleSetup =>
  createBattleSetup({ ...input, entryKind: 'meditationAmbush' });

type DefaultedBattleUnitField = 'meridianDefenseBp' | 'qiProductionPerTick' | 'reverseQi' | 'redirectedQi'
  | 'redirectedQiExpiresAtOwnAction'
  | 'medical' | 'innerGrade' | 'stamina' | 'staminaMax' | 'healingReceivedBp'
  | 'itemEffects' | 'itemState';
export type BattleUnitSeed = Omit<BattleUnit, 'unitIndex' | 'side' | 'control' | 'state' | 'active' | 'ct'
  | 'revision' | 'pos' | 'facing' | 'move' | 'jump' | 'waitStreak' | DefaultedBattleUnitField>
  & Partial<Pick<BattleUnit, DefaultedBattleUnitField | 'move' | 'jump' | 'waitStreak'>>;
function cloneUnitSeed(seed: BattleUnitSeed, participant: BattleParticipant, ct: number,
  initialBuffs: BattleUnit['buffs']): BattleUnit {
  const medical = seed.medical ?? 0;
  return { ...seed, unitIndex: participant.unitIndex, side: participant.side, control: participant.control,
    revision: 0,
    state: participant.state, active: participant.state === 'active' || participant.state === 'hidden', ct,
    zoneGuards: { body: { ...seed.zoneGuards.body }, hand: { ...seed.zoneGuards.hand },
      leg: { ...seed.zoneGuards.leg } }, buffs: [...seed.buffs.map((buff) => ({ ...buff })), ...initialBuffs],
    foreignQi: seed.foreignQi.map((foreign) => ({ ...foreign,
      reversePath: foreign.reversePath.map((step) => ({ ...step })) })),
    acupointOccupancies: seed.acupointOccupancies.map((occupancy) => ({ ...occupancy,
      affectedRouteRefs: [...occupancy.affectedRouteRefs] })),
    meridianDefenseBp: seed.meridianDefenseBp ?? 10_000,
    qiProductionPerTick: seed.qiProductionPerTick ?? 1, reverseQi: seed.reverseQi ?? null,
    redirectedQi: seed.redirectedQi ?? 0,
    redirectedQiExpiresAtOwnAction: seed.redirectedQiExpiresAtOwnAction ?? null,
    pos: { q: 0, r: 0 }, facing: 0,
    move: seed.move ?? movementPoints(seed.qinggong), jump: seed.jump ?? jumpDistance(seed.qinggong),
    waitStreak: seed.waitStreak ?? 0, medical, innerGrade: seed.innerGrade ?? 1,
    stamina: seed.stamina ?? 100, staminaMax: seed.staminaMax ?? 100,
    healingReceivedBp: seed.healingReceivedBp ?? 10_000,
    itemEffects: (seed.itemEffects ?? []).map((effect) => ({ ...effect, params: { ...effect.params } })),
    itemState: seed.itemState === undefined
      ? { uses: 0, maxUses: 3 + floorDivInt(medical, 40), battleUses: {}, lastBattleUseTurns: {} }
      : { uses: seed.itemState.uses, maxUses: 3 + floorDivInt(medical, 40),
        battleUses: { ...seed.itemState.battleUses },
        lastBattleUseTurns: { ...seed.itemState.lastBattleUseTurns } } };
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
    const unit = cloneUnitSeed(seed, participant, initial?.ct ?? 0, initialBuffs);
    unit.pos = { ...(initial?.pos ?? { q: 0, r: 0 }) }; unit.facing = initial?.facing ?? 0;
    return unit;
  });
  const meridianByUnit = setup.participants.map((participant) => {
    const input = setup.meridianInputs.find((candidate) => candidate.unitId === participant.unitRef);
    if (input === undefined) throw new RangeError('BATTLE_UNIT_MERIDIAN_MISSING');
    const runtime = createMeridianFlowRuntime(input);
    runtime.setIdentity(participant.unitIndex, participant.side === 'player' ? 'hero' : 'normal');
    const unit = units[participant.unitIndex]!;
    return { unitId: participant.unitRef, unitIndex: participant.unitIndex,
      flow: runtime.snapshot({ foreignQi: unit.foreignQi,
        acupointOccupancies: unit.acupointOccupancies, redirectedQi: unit.redirectedQi,
        redirectedQiExpiresAtOwnAction: unit.redirectedQiExpiresAtOwnAction }), activeDefense: null,
      movementProjection: null, innerGuard: null };
  });
  return { setup, grid: { topology: setup.grid.topology,
    cells: setup.grid.cells.map((cell) => ({ ...cell })) }, units,
    tick: 0, round: 0, actionNo: 0, phase: 'opening', result: null,
    openingOrder: createOpeningOrder(units, setup.start.initiativeSide), meridianByUnit,
    inventory: { stacks: setup.inventory.stacks.map((stack) => ({ ...stack })) },
    ...(setup.itemChapterUses === undefined ? {} : { itemChapterUses: { ...setup.itemChapterUses } }),
    rewardStats: { martialUses: [], movementActions: [], fullCirculations: [] },
    events: [], acceptedCommands: [] };
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
