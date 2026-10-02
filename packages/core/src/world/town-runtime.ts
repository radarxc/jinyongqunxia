import type { TownBuilding, TownRuntimeDefinition } from '@tianshu/data/schemas';
import { ceilDivInt } from '@tianshu/shared';
import type { BattleParticipantInput } from '../battle';
import { createMeditationAmbushBattleSetup, type BattleSetup } from '../battle';
import type { ConsumableTargetState } from '../economy';
import { EventAnchorRegistry, type EventAnchor } from '../event';
import { queryNpcPresence, type NpcWorldState } from '../npc';
import { advanceInnerPractice, createMeditationState, interruptMeditation, type InnerPracticeInput,
  type MeditationInterruptedResult, type ProgressionEvent, type MeditationState } from '../progression';
import { chanceBp, createRng, type Rng, type RngState } from '../rng';
import { advanceGameClock, MEDITATION_TICKS, type AdvanceClockResult,
  type CharacterState, type GameClock, type GameState } from '../state';

export type TownPoint = readonly [number, number];
export type TownTraversal = 'flat' | 'ramp' | 'stairs';
export interface TownPath { readonly points: readonly TownPoint[]; readonly cost: number }
export interface TownSessionState {
  readonly version: 1; readonly townRevision: string; readonly sceneId: string;
  readonly point: TownPoint; readonly buildingId: string | null;
  readonly buildingPhase: 'outside' | 'fading-in' | 'inside' | 'fading-out';
}
export type TownCommand =
  | { readonly t: 'town/move'; readonly destination: TownPoint; readonly buildingId?: string }
  | { readonly t: 'town/settle-building' }
  | { readonly t: 'town/exit-building' }
  | { readonly t: 'town/interact'; readonly npcId?: string }
  | { readonly t: 'town/meditate'; readonly anchorId: string; readonly plannedTicks: number };
export interface TownAnchorRequest { readonly lineId: string; readonly nodeId: string }
export interface TownCommandResult {
  readonly state: TownSessionState; readonly path?: TownPath;
  readonly anchors?: readonly TownAnchorRequest[]; readonly action?: 'shop' | 'dialogue' | 'meditate';
  readonly ref?: string | null;
}

const DIRECTIONS: readonly TownPoint[] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
const key = (point: TownPoint): string => point[0] + ',' + point[1];

function comparePoint(left: TownPoint, right: TownPoint): number {
  return left[1] - right[1] || left[0] - right[0];
}
function hexDistance(left: TownPoint, right: TownPoint): number {
  const dq = Math.abs(left[0] - right[0]); const dr = Math.abs(left[1] - right[1]);
  const ds = Math.abs(left[0] + left[1] - right[0] - right[1]);
  return Math.max(dq, dr, ds);
}

/** Deterministic integer A* over the authored axial grid. */
export class TownPathfinder {
  readonly #nodes: ReadonlyMap<string, readonly [number, number, number, TownTraversal]>;
  public constructor(private readonly town: TownRuntimeDefinition) {
    this.#nodes = new Map(town.navigation.nodes.map((node) => [key([node[0], node[1]]), node]));
  }
  public canStand(point: TownPoint): boolean { return this.#nodes.has(key(point)); }
  public canStep(from: TownPoint, to: TownPoint): boolean {
    const a = this.#nodes.get(key(from)); const b = this.#nodes.get(key(to));
    if (!a || !b || hexDistance(from, to) !== 1) return false;
    const rise = Math.abs(a[2] - b[2]);
    return rise === 0 || (rise <= this.town.navigation.maxStepCm &&
      (a[3] !== 'flat' || b[3] !== 'flat'));
  }
  public find(start: TownPoint, destination: TownPoint): TownPath | null {
    if (!this.canStand(start) || !this.canStand(destination)) return null;
    const open: TownPoint[] = [start]; const closed = new Set<string>();
    const parents = new Map<string, TownPoint>(); const costs = new Map([[key(start), 0]]);
    while (open.length > 0) {
      open.sort((left, right) => {
        const scoreLeft = costs.get(key(left))! + hexDistance(left, destination);
        const scoreRight = costs.get(key(right))! + hexDistance(right, destination);
        return scoreRight - scoreLeft || comparePoint(right, left);
      });
      const current = open.pop()!; const currentKey = key(current);
      if (currentKey === key(destination)) return this.reconstruct(start, current, parents, costs.get(currentKey)!);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);
      for (const [dq, dr] of DIRECTIONS) {
        const next: TownPoint = [current[0] + dq, current[1] + dr]; const nextKey = key(next);
        if (closed.has(nextKey) || !this.canStep(current, next)) continue;
        const cost = costs.get(currentKey)! + 1;
        if (cost >= (costs.get(nextKey) ?? Number.MAX_SAFE_INTEGER)) continue;
        costs.set(nextKey, cost); parents.set(nextKey, current); open.push(next);
      }
    }
    return null;
  }
  private reconstruct(start: TownPoint, destination: TownPoint,
    parents: ReadonlyMap<string, TownPoint>, cost: number): TownPath {
    const points = [destination]; let cursor = destination;
    while (key(cursor) !== key(start)) { cursor = parents.get(key(cursor))!; points.push(cursor); }
    points.reverse(); return { points, cost };
  }
}

export function createTownState(town: TownRuntimeDefinition): TownSessionState {
  return { version: 1, townRevision: town.revision, sceneId: town.sceneId,
    point: town.navigation.spawn, buildingId: null, buildingPhase: 'outside' };
}
export function enterTownBuilding(state: TownSessionState, building: TownBuilding): TownSessionState {
  if (!building.enterable || !building.entrances.some((point) => key(point) === key(state.point)))
    throw new Error('TOWN_BUILDING_ENTRY');
  if (state.buildingId !== null) throw new Error('TOWN_ALREADY_INSIDE');
  return { ...state, buildingId: building.id, buildingPhase: 'fading-in' };
}
export function settleTownBuildingFade(state: TownSessionState): TownSessionState {
  if (state.buildingPhase === 'fading-in') return { ...state, buildingPhase: 'inside' };
  if (state.buildingPhase === 'fading-out')
    return { ...state, buildingId: null, buildingPhase: 'outside' };
  return state;
}
export function exitTownBuilding(state: TownSessionState): TownSessionState {
  if (state.buildingId === null || state.buildingPhase !== 'inside') throw new Error('TOWN_NOT_INSIDE');
  return { ...state, buildingPhase: 'fading-out' };
}
function requireMeditationAnchor(town: TownRuntimeDefinition, state: TownSessionState,
  command: Extract<TownCommand, { readonly t: 'town/meditate' }>) {
  const anchor = town.anchors.find((row) => row.id === command.anchorId &&
    row.kind === 'meditation' && key(row.point) === key(state.point));
  if (!anchor || anchor.riskBaseBp === null || command.plannedTicks !== MEDITATION_TICKS)
    throw new Error('TOWN_MEDITATION_UNAVAILABLE');
  if (anchor.buildingId !== null &&
      (state.buildingId !== anchor.buildingId || state.buildingPhase !== 'inside'))
    throw new Error('TOWN_MEDITATION_UNAVAILABLE');
  return anchor;
}

export interface TownRuntimeContext {
  readonly town: TownRuntimeDefinition; readonly eventAnchors?: readonly EventAnchor[];
  readonly npcWorld?: NpcWorldState; readonly eraLayer?: string;
  readonly npcAnchors?: readonly { readonly npcId: string; readonly sceneId: string;
    readonly eraLayer: string; readonly point: TownPoint }[];
  readonly meditationPractices?: readonly TownMeditationPractice[];
  readonly meditationEncounters?: readonly TownMeditationEncounter[];
}
export interface TownRuntime {
  dispatch(state: TownSessionState, command: TownCommand): TownCommandResult;
  meditate(game: GameState, command: Extract<TownCommand, { readonly t: 'town/meditate' }>,
    itemTargets?: Readonly<Record<string, ConsumableTargetState>>): TownMeditationTransaction;
}
export function createTownRuntime(context: TownRuntimeContext): TownRuntime {
  const paths = new TownPathfinder(context.town);
  const registry = new EventAnchorRegistry(context.eventAnchors ?? []);
  const buildingsByEntrance = new Map<string, TownBuilding[]>();
  for (const building of [...context.town.buildings].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0)) if (building.enterable)
    for (const entrance of building.entrances) {
      const candidates = buildingsByEntrance.get(key(entrance)) ?? [];
      candidates.push(building); buildingsByEntrance.set(key(entrance), candidates);
    }
  const dispatch = (state: TownSessionState, command: TownCommand): TownCommandResult => {
  if (state.version !== 1 || state.sceneId !== context.town.sceneId ||
      state.townRevision !== context.town.revision) throw new Error('TOWN_STATE_MISMATCH');
  if (command.t === 'town/move') {
    const path = paths.find(state.point, command.destination);
    if (!path) throw new Error('TOWN_UNREACHABLE');
    if (state.buildingPhase !== 'outside') throw new Error('TOWN_BUILDING_BUSY');
    const moved = { ...state, point: command.destination };
    const candidates = buildingsByEntrance.get(key(command.destination)) ?? [];
    const building = command.buildingId === undefined ? candidates[0]
      : candidates.find((entry) => entry.id === command.buildingId);
    if (command.buildingId !== undefined && !building) throw new Error('TOWN_BUILDING_ENTRY');
    const next = building ? enterTownBuilding(moved, building) : moved;
    const anchors = registry.resolve({ kind: 'location', sceneId: context.town.sceneId,
      trigger: 'enter', point: { q: command.destination[0], r: command.destination[1] } });
    return { state: next, path, anchors };
  }
  if (command.t === 'town/settle-building') return { state: settleTownBuildingFade(state) };
  if (command.t === 'town/exit-building') return { state: exitTownBuilding(state) };
  if (command.t === 'town/interact' && command.npcId !== undefined) {
    if (context.npcWorld && context.eraLayer &&
        queryNpcPresence(context.npcWorld, command.npcId, context.eraLayer)?.sceneId !== context.town.sceneId)
      throw new Error('TOWN_NPC_ABSENT');
    const placement = context.npcAnchors?.find((entry) => entry.npcId === command.npcId &&
      entry.sceneId === context.town.sceneId && entry.eraLayer === context.eraLayer);
    if (!placement || key(placement.point) !== key(state.point)) throw new Error('TOWN_NPC_NOT_HERE');
    return { state, action: 'dialogue', anchors: registry.resolve({ kind: 'npc',
      sceneId: context.town.sceneId, trigger: 'interact', npcId: command.npcId }) };
  }
  if (command.t === 'town/interact') {
    const building = context.town.buildings.find((row) => row.id === state.buildingId);
    if (!building || building.interiorKind !== 'shop' || building.businessRef === null)
      throw new Error('TOWN_NOT_AT_SHOP');
    return { state, action: 'shop', ref: building.businessRef };
  }
  const anchor = requireMeditationAnchor(context.town, state, command);
  return { state, action: 'meditate', ref: anchor.id };
  };
  return { dispatch, meditate: (game, command, itemTargets) => resolveTownMeditation({
    game, town: context.town, command, ...(itemTargets ? { itemTargets } : {}),
    ...(context.npcWorld ? { npcWorld: context.npcWorld } : {}),
    ...(context.eraLayer ? { eraLayer: context.eraLayer } : {}),
    ...(context.meditationPractices ? { practices: context.meditationPractices } : {}),
    ...(context.meditationEncounters ? { encounters: context.meditationEncounters } : {}),
  }) };
}
export function dispatchTownCommand(context: TownRuntimeContext, state: TownSessionState,
  command: TownCommand): TownCommandResult {
  return createTownRuntime(context).dispatch(state, command);
}

export interface MeditationRisk {
  readonly baseBp: number; readonly timeBp: number; readonly wantedBp: number;
  readonly hostileBp: number;
}
export interface MeditationRiskContext {
  readonly baseBp: number; readonly slotInDay: number; readonly wantedLevel: number;
  readonly hostileNpcCount: number;
}
/** Integer basis-point policy; app supplies facts but never reproduces this rule. */
export function deriveMeditationRisk(input: MeditationRiskContext): MeditationRisk {
  if (!Number.isSafeInteger(input.slotInDay) || input.slotInDay < 0 || input.slotInDay > 11 ||
      !Number.isSafeInteger(input.wantedLevel) || input.wantedLevel < 0 ||
      !Number.isSafeInteger(input.hostileNpcCount) || input.hostileNpcCount < 0)
    throw new RangeError('TOWN_AMBUSH_CONTEXT');
  return { baseBp: input.baseBp, timeBp: input.slotInDay === 0 || input.slotInDay >= 9 ? 300 : 0,
    wantedBp: Math.min(3_000, input.wantedLevel * 500),
    hostileBp: Math.min(4_000, input.hostileNpcCount * 1_000) };
}
export function meditationAmbushChanceBp(risk: MeditationRisk): number {
  for (const value of [risk.baseBp, risk.timeBp, risk.wantedBp, risk.hostileBp])
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError('TOWN_AMBUSH_RISK');
  return Math.min(10_000, risk.baseBp + risk.timeBp + risk.wantedBp + risk.hostileBp);
}
export interface MeditationAmbushInput {
  readonly rng: Rng; readonly risk: MeditationRisk; readonly meditation: MeditationState;
  readonly causeId: string; readonly worldTick: number; readonly encounterId: `enc_${string}`;
  readonly setupId: string; readonly seed: number; readonly sourceSnapshotHash: string;
  readonly sceneId: string; readonly anchorId: string;
  readonly participants: readonly BattleParticipantInput[]; readonly meditationUnitRefs: readonly string[];
}
export type MeditationAmbushResult =
  | { readonly ambushed: false; readonly meditation: MeditationState; readonly setup: null }
  | { readonly ambushed: true; readonly meditation: MeditationInterruptedResult['state'];
      readonly event: NonNullable<MeditationInterruptedResult['event']>; readonly setup: BattleSetup };
export interface TownMeditationEncounter {
  readonly sceneId: string; readonly anchorId: string; readonly attackerId: string;
  readonly setup: Omit<MeditationAmbushInput, 'rng' | 'risk' | 'meditation' | 'causeId' |
    'worldTick' | 'sceneId' | 'anchorId'>;
}
export interface TownMeditationPractice {
  readonly sceneId: string; readonly anchorId: string;
  readonly input: Omit<InnerPracticeInput, 'mode' | 'elapsedTicks'>;
}

export function resolveMeditationAmbush(input: MeditationAmbushInput): MeditationAmbushResult {
  if (!chanceBp(input.rng, meditationAmbushChanceBp(input.risk)))
    return { ambushed: false, meditation: input.meditation, setup: null };
  const interrupted = interruptMeditation(input.meditation, input.causeId, input.worldTick);
  if (interrupted.effect === null || interrupted.event === null)
    return { ambushed: false, meditation: interrupted.state, setup: null };
  const setup = createMeditationAmbushBattleSetup({ encounterId: input.encounterId,
    setupId: input.setupId, seed: input.seed, sourceSnapshotHash: input.sourceSnapshotHash,
    sourceId: input.sceneId, triggerId: input.causeId, worldTick: input.worldTick,
    participants: input.participants, sceneRef: input.sceneId, anchorRef: input.anchorId,
    meditationUnitRefs: input.meditationUnitRefs });
  return { ambushed: true, meditation: interrupted.state, event: interrupted.event, setup };
}

export interface TownMeditationCompletionInput {
  readonly clock: GameClock; readonly character: CharacterState;
  readonly plannedTicks: number;
  readonly stamina?: { readonly current: number; readonly maximum: number };
  readonly practice?: Omit<InnerPracticeInput, 'mode' | 'elapsedTicks'>;
}
export interface TownMeditationCompletion {
  readonly clock: GameClock; readonly character: CharacterState;
  readonly stamina: number | null;
  readonly events: readonly (ProgressionEvent | AdvanceClockResult['events'][number])[];
}
export interface TownMeditationTransactionInput {
  readonly game: GameState; readonly town: TownRuntimeDefinition;
  readonly command: Extract<TownCommand, { readonly t: 'town/meditate' }>;
  readonly itemTargets?: Readonly<Record<string, ConsumableTargetState>>; readonly npcWorld?: NpcWorldState;
  readonly eraLayer?: string; readonly practices?: readonly TownMeditationPractice[];
  readonly encounters?: readonly TownMeditationEncounter[];
}
export type TownMeditationEvent = ProgressionEvent | AdvanceClockResult['events'][number] |
  { readonly t: 'town/meditationCompleted'; readonly anchorId: string; readonly elapsedTicks: number };
export interface TownMeditationTransaction {
  readonly game: GameState; readonly target: ConsumableTargetState | null;
  readonly meditation: MeditationState; readonly events: readonly TownMeditationEvent[];
  readonly battleSetup: BattleSetup | null;
}
/** One safe town meditation: one game hour, resource recovery, then optional authored practice. */
export function completeTownMeditation(
  input: TownMeditationCompletionInput,
): TownMeditationCompletion {
  if (input.plannedTicks !== MEDITATION_TICKS) throw new RangeError('TOWN_MEDITATION_TICKS');
  if (input.stamina && (!Number.isSafeInteger(input.stamina.current) ||
      !Number.isSafeInteger(input.stamina.maximum) || input.stamina.current < 0 ||
      input.stamina.maximum < input.stamina.current)) throw new RangeError('TOWN_MEDITATION_STAMINA');
  const advanced = advanceGameClock(input.clock, input.plannedTicks);
  const recovery = { hp: Math.max(input.character.resources.hp,
    ceilDivInt(input.character.stats.hpMax, 2)), mp: input.character.stats.mpMax };
  if (!input.practice) return { clock: advanced.clock,
    character: { ...input.character, resources: recovery },
    stamina: input.stamina?.maximum ?? null, events: advanced.events };
  const practiced = advanceInnerPractice(input.character.meridians, { ...input.practice,
    mode: 'meditation', elapsedTicks: input.plannedTicks });
  return { clock: advanced.clock, character: { ...input.character, resources: recovery,
    meridians: practiced.progress }, stamina: input.stamina?.maximum ?? null,
    events: [...advanced.events, ...practiced.events] };
}

function countHostileNpcs(world: NpcWorldState | undefined, eraLayer: string | undefined,
  sceneId: string): number {
  if (!world || !eraLayer) return 0;
  return world.relationships.filter((relationship) => relationship.resentment > 0 &&
    queryNpcPresence(world, relationship.npcId, eraLayer)?.sceneId === sceneId).length;
}

function completeMeditationTransaction(input: TownMeditationTransactionInput,
  meditation: MeditationState, rngState: RngState): TownMeditationTransaction {
  const protagonist = input.game.profile.protagonist!;
  const targetState = input.itemTargets?.[protagonist.characterId];
  const practice = input.practices?.find((row) => row.sceneId === input.town.sceneId &&
    row.anchorId === input.command.anchorId)?.input;
  const completed = completeTownMeditation({ clock: input.game.chapter.clock, character: protagonist,
    plannedTicks: input.command.plannedTicks, ...(targetState ? { stamina: { current: targetState.stamina,
      maximum: targetState.staminaMax } } : {}), ...(practice ? { practice } : {}) });
  const game = { ...input.game, meta: { ...input.game.meta, worldTick: completed.clock.elapsedTicks,
    rng: { ...input.game.meta.rng, world: rngState } },
    chapter: { ...input.game.chapter, clock: completed.clock,
      worldYear: completed.clock.epochYear + completed.clock.yearOffset },
    profile: { ...input.game.profile, protagonist: completed.character } };
  const target = targetState ? { ...targetState, hp: completed.character.resources.hp,
    mp: completed.character.resources.mp, stamina: completed.stamina!,
    meridians: completed.character.meridians } : null;
  return { game, target, meditation: { ...meditation, elapsedTicks: input.command.plannedTicks,
    status: 'completed', qiGatherState: 'none' }, battleSetup: null, events: [
    { t: 'town/meditationCompleted', anchorId: input.command.anchorId,
      elapsedTicks: input.command.plannedTicks }, ...completed.events] };
}

/** Resolves one town meditation as a pure transaction; callers commit only after battle preparation succeeds. */
export function resolveTownMeditation(input: TownMeditationTransactionInput): TownMeditationTransaction {
  const townState = input.game.chapter.town; const protagonist = input.game.profile.protagonist;
  if (!townState || !protagonist || townState.sceneId !== input.town.sceneId ||
      townState.townRevision !== input.town.revision) throw new Error('TOWN_MEDITATION_UNAVAILABLE');
  const anchor = requireMeditationAnchor(input.town, townState, input.command);
  const encounter = input.encounters?.find((row) => row.sceneId === input.town.sceneId &&
    row.anchorId === input.command.anchorId);
  const meditation = createMeditationState(`meditation-${input.game.meta.nextEventSeq}`,
    input.command.plannedTicks);
  if (!encounter) return completeMeditationTransaction(input, meditation, input.game.meta.rng.world);
  if (anchor.riskBaseBp === null) throw new Error('TOWN_MEDITATION_UNAVAILABLE');
  const rng = createRng(input.game.meta.rng.world);
  const risk = deriveMeditationRisk({ baseBp: anchor.riskBaseBp,
    slotInDay: input.game.chapter.clock.slotInDay,
    wantedLevel: input.game.chapter.worldMap?.law.wantedLevel ?? 0,
    hostileNpcCount: countHostileNpcs(input.npcWorld, input.eraLayer, input.town.sceneId) });
  const result = resolveMeditationAmbush({ ...encounter.setup, rng, risk, meditation,
    causeId: encounter.attackerId, worldTick: input.game.meta.worldTick,
    sceneId: input.town.sceneId, anchorId: input.command.anchorId });
  const rngState = rng.snapshot();
  if (!result.ambushed) return completeMeditationTransaction(input, result.meditation, rngState);
  return { game: { ...input.game, meta: { ...input.game.meta, rng: {
    ...input.game.meta.rng, world: rngState } } },
    target: input.itemTargets?.[protagonist.characterId] ?? null,
    meditation: result.meditation, events: [result.event], battleSetup: result.setup };
}
