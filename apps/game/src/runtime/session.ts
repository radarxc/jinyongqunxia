import type { Command, CoreContent } from '@tianshu/core/session';
import { cloneGameState, firstSleepQueryForState } from '@tianshu/core/session';
import type { GameState } from '@tianshu/core/state';
import { createNewGameState } from '@tianshu/core/state';
import type { RegionRuntimeContent } from '@tianshu/core/region';
import type { JsonValue } from '@tianshu/shared';
import type { ContentSource } from '@tianshu/data';
import type { BattleLaunch, BattleUiCommand } from '../battle/contracts';
import type { BattleRuntime as BattleRuntimeInstance } from '../battle/runtime';
import type * as RegionSubsystem from '@tianshu/core/region-runtime';
import type { projectDialogue as ProjectDialogue } from '@tianshu/core/dialogue-projection';
import type { createBattleDemo as CreateBattleDemo } from '../battle/demo';
import type { BattleRuntime as BattleRuntimeClass } from '../battle/runtime';
import { createPreviewSession } from './bootstrap';
import { equipmentRules, type GameContent, type StaticGameContent, type TownLoader } from './content';
import { ALL_VIEWS, type DirtyView, type GameCommand, type GameRemote, type GameUpdate,
  type GameProjection, type NewGameRequest, type SessionSnapshot } from './contracts';
import { createNewGameSessionState, type MasterSeedSource } from './new-game';
import { validateSession } from './validate';
import { createAsyncCore } from './core-session';
import type { AsyncCore } from './core-session';
import { createSessionSelectors } from './session-projection';
import { CORE_BUILD, CORE_VERSION } from './core-version';

const BATTLE_REJECTIONS = new Set([
  'BATTLE_ALREADY_ACTIVE', 'BATTLE_DEMO_FORBIDDEN', 'BATTLE_NOT_ACTIVE', 'BATTLE_NOT_ENDED',
  'BATTLE_BUSY', 'BATTLE_LAUNCH_INVALID', 'BATTLE_AUTO_FORBIDDEN', 'BATTLE_ENDED',
  'BATTLE_AUTO_ACTIVE', 'BATTLE_STALE_PREVIEW', 'BATTLE_ACTION_UNAVAILABLE',
  'BATTLE_COMMAND_UNKNOWN', 'BATTLE_MANUAL_TURN', 'BATTLE_NOT_MANUAL_TURN', 'PATH_BLOCKED',
  'BATTLE_TARGET_INVALID', 'BATTLE_MOVE_UNKNOWN', 'BATTLE_ACTION_FAILED',
]);
function rejected(error: unknown): GameUpdate | null {
  return error instanceof Error && BATTLE_REJECTIONS.has(error.message)
    ? { accepted: false, changes: {}, events: [], error: error.message } : null;
}
function isBattleCommand(command: GameCommand): command is BattleUiCommand {
  return command.t.startsWith('battle/');
}
function unavailable(code: string, cause: unknown): Error {
  return cause instanceof Error && cause.message === code
    ? cause : new Error(code, { cause });
}
function retryableSubsystem<T>(code: string, factory: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => pending ??= factory().catch((error: unknown) => {
    pending = undefined;
    throw unavailable(code, error);
  });
}
type BattleRuntimeConstructor = typeof BattleRuntimeClass;
type BattleDemoFactory = typeof CreateBattleDemo;
type RegionSubsystemModule = typeof RegionSubsystem;
type DialogueProjection = typeof ProjectDialogue;
async function loadBattleRuntime(): Promise<BattleRuntimeConstructor> {
  try { return (await import('../battle/runtime')).BattleRuntime; }
  catch (error) { throw unavailable('BATTLE_SUBSYSTEM_UNAVAILABLE', error); }
}
async function loadBattleDemo(): Promise<BattleDemoFactory> {
  try { return (await import('../battle/demo')).createBattleDemo; }
  catch (error) { throw unavailable('BATTLE_SUBSYSTEM_UNAVAILABLE', error); }
}
async function loadRegionSubsystem(): Promise<RegionSubsystemModule> {
  try { return await import('@tianshu/core/region-runtime'); }
  catch (error) { throw unavailable('REGION_SUBSYSTEM_UNAVAILABLE', error); }
}
async function loadDialogueProjection(): Promise<DialogueProjection> {
  try { return (await import('@tianshu/core/dialogue-projection')).projectDialogue; }
  catch (error) { throw unavailable('DIALOGUE_SUBSYSTEM_UNAVAILABLE', error); }
}
function coreContent(content: GameContent, towns: GameContent['towns'], chapterId: string,
  target?: GameContent): CoreContent {
  const eraLayer = content.worldMaps?.find((entry) => entry.chapterId === chapterId)?.era;
  const region = regionContent(content);
  return {
    items: content.items as unknown as NonNullable<CoreContent['items']>,
    equipmentRules: equipmentRules(content),
    ...(content.identityTags ? { identityTags: content.identityTags } : {}),
    ...(content.worldMaps ? { worldMaps: content.worldMaps } : {}),
    ...(towns ? { towns } : {}),
    ...(content.townEventAnchors ? { townEventAnchors: content.townEventAnchors } : {}),
    ...(content.townNpcWorld ? { townNpcWorld: content.townNpcWorld } : {}),
    ...(eraLayer ? { eraLayer } : {}),
    ...(content.townNpcPlacements ? { townNpcPlacements: content.townNpcPlacements } : {}),
    ...(content.meditationPractice ? { meditationPractices: content.meditationPractice } : {}),
    ...(content.meditationEncounters
      ? { meditationEncounters: content.meditationEncounters }
      : {}),
    ...(content.inkStories ? { inkStories: content.inkStories } : {}),
    ...((target?.chapters ?? content.chapters)
      ? { chapters: target?.chapters ?? content.chapters } : {}),
    ...(target?.contentHash ? { targetContentHash: target.contentHash } : {}),
    ...(region ? { region } : {}),
  };
}
function regionContent(content: GameContent): RegionRuntimeContent | undefined {
  if (!content.regionMaps) return undefined;
  return { maps: content.regionMaps, gateFacts: content.regionGateFacts ?? { qinggong: 0 },
    ...(content.regionGates ? { gates: content.regionGates } : {}),
    ...(content.regionDialogues ? { dialogues: content.regionDialogues } : {}),
    ...(content.regionLoot ? { loot: content.regionLoot } : {}) };
}
function dirtyViews(command: Command): readonly DirtyView[] {
  if (command.t === 'world/tick') return ['hud'];
  if (command.t.startsWith('dialogue/')) return ['dialogue'];
  if (command.t === 'quest/choose') return ['quests'];
  if (command.t === 'rules/setDifficulty') return ['hud'];
  if (command.t.startsWith('worldmap/')) return ['hud', 'worldmap', 'townRuntime', 'town'];
  if (command.t === 'world/mountRegion') return ['hud', 'regionStatic', 'region'];
  if (command.t === 'world/walkTo' || command.t === 'world/interact')
    return ['hud', 'inventory', 'dialogue', 'region'];
  if (command.t === 'inventory/equip' || command.t === 'inventory/unequip')
    return ['inventory', 'equipment'];
  if (command.t === 'inventory/use') return ['hud', 'characters', 'inventory'];
  return ['hud', 'characters', 'town'];
}

/** Worker composition of core functions. This adapter defines no stat or combat formulas. */
function defaultSession(content: GameContent, demo: boolean): SessionSnapshot {
  if (demo) return createPreviewSession(content);
  const state = createNewGameState({ masterSeed: 1, coreVersion: CORE_VERSION,
    coreBuild: CORE_BUILD, identity: { name: '无名侠客', gender: 'unspecified',
      appearance: 'appearance_default', pronoun: '你', originId: 'origin_wenshiguan' },
    difficulty: 'diff_xiake' });
  return content.contentHash ? { ...state, meta: { ...state.meta,
    contentHash: content.contentHash } } : state;
}
export interface GameSessionOptions { readonly demo?: boolean; readonly seedSource?: MasterSeedSource;
  readonly preloadChapter?: (chapterId: string) => Promise<GameContent>;
  readonly preloadRegion?: (chapterId: string, regionId: string) =>
    Promise<readonly NonNullable<GameContent['regionMaps']>[number][]>;
  readonly subsystemLoaders?: {
    readonly battle?: () => Promise<BattleRuntimeConstructor>;
    readonly battleDemo?: () => Promise<BattleDemoFactory>;
    readonly region?: () => Promise<RegionSubsystemModule>;
    readonly dialogueProjection?: () => Promise<DialogueProjection>;
  };
}
export function createGameSession(content: GameContent, initial?: SessionSnapshot,
  loadTown?: TownLoader, options: GameSessionOptions = {}): GameRemote & {
    createNewGame(input: NewGameRequest): Promise<GameUpdate> } {
  // Bare calls retain the legacy test fixture; product hosts always pass an explicit mode.
  const opening = initial ?? defaultSession(content, options.demo !== false);
  const loadedTowns = [...(content.towns ?? [])];
  let townDefinition = opening.chapter.town
    ? loadedTowns.find((entry) => entry.sceneId === opening.chapter.town?.sceneId) : undefined;
  let state = validateSession(opening, content, townDefinition);
  if (state.dialogue) throw new Error('DIALOGUE_SAVE_UNAVAILABLE');
  let regionStaticSentFor: string | null = null;
  let core: AsyncCore = createAsyncCore(state, coreContent(content, loadedTowns, state.chapter.chapterId));
  let selectors = createSessionSelectors(content, () => townDefinition);
  let battle: BattleRuntimeInstance | null = null;
  const subsystem = options.subsystemLoaders;
  const battleRuntime = retryableSubsystem('BATTLE_SUBSYSTEM_UNAVAILABLE',
    subsystem?.battle ?? loadBattleRuntime);
  const battleDemo = retryableSubsystem('BATTLE_SUBSYSTEM_UNAVAILABLE',
    subsystem?.battleDemo ?? loadBattleDemo);
  const regionSubsystem = retryableSubsystem('REGION_SUBSYSTEM_UNAVAILABLE',
    subsystem?.region ?? loadRegionSubsystem);
  const dialogueProjection = retryableSubsystem('DIALOGUE_SUBSYSTEM_UNAVAILABLE',
    subsystem?.dialogueProjection ?? loadDialogueProjection);
  async function prepareBattle(launch: BattleLaunch): Promise<{
    runtime: BattleRuntimeInstance; update: GameUpdate }> {
    const BattleRuntime = await battleRuntime();
    const candidate = new BattleRuntime(launch);
    const packet = candidate.packet(true);
    const setup = candidate.launch.setup;
    const update: GameUpdate = {
      accepted: true,
      changes: { battle: packet },
      events: [{
        t: 'battle/setupResolved',
        payload: {
          setupId: setup.setupId,
          encounterId: setup.encounterId,
          participants: setup.participants.map(row => row.unitRef),
          winCond: setup.end.winCond,
          loseCond: setup.end.loseCond,
          drawCond: setup.end.drawCond,
        } as JsonValue,
      }],
    };
    return { runtime: candidate, update };
  }
  async function battleCommand(command: BattleUiCommand): Promise<GameUpdate> {
    if (command.t === 'battle/enter' || command.t === 'battle/demo') {
      if (battle) throw new Error('BATTLE_ALREADY_ACTIVE');
      if (command.t === 'battle/demo' && !state.meta.debugTainted) throw new Error('BATTLE_DEMO_FORBIDDEN');
      const launch = command.t === 'battle/demo'
        ? (await battleDemo())(command.source) : command.launch;
      const prepared = await prepareBattle(launch); battle = prepared.runtime;
      return prepared.update;
    }
    if (!battle) throw new Error('BATTLE_NOT_ACTIVE');
    if (command.t === 'battle/leave') {
      const packet = battle.packet();
      if (!packet.result) throw new Error('BATTLE_NOT_ENDED');
      const context = battle.launch.setup.returnContext; battle = null;
      return { accepted: true, changes: { battle: null }, events: [{ t: 'battle/returned', payload: { ...context } }] };
    }
    const result = battle.execute(command);
    return { accepted: true, changes: { battle: result.packet },
      events: result.events.map(event => ({ t: event.t, payload: { ...event } as JsonValue })) };
  }
  async function townFor(candidate: GameState) {
    const sceneId = candidate.chapter.town?.sceneId;
    if (!sceneId) return undefined;
    const existing = loadedTowns.find((entry) => entry.sceneId === sceneId);
    const definition = existing ?? await loadTown?.(sceneId) ?? undefined;
    if (definition && definition.chapterId !== candidate.chapter.chapterId.slice(0, 4))
      throw new Error('TOWN_CONTENT_MISMATCH');
    if (!definition) throw new Error('TOWN_CONTENT_UNAVAILABLE');
    if (!existing) loadedTowns.push(definition);
    return definition;
  }
  async function preloadWorldMapTown(command: Command): Promise<void> {
    if (command.t !== 'worldmap/enter') return;
    // Loading content changes handler dependencies, so rebuild core before dispatch.
    const mapState = state.chapter.worldMap;
    if (!mapState || mapState.position.kind !== 'node') return;
    const nodeId = mapState.position.nodeId;
    const map = content.worldMaps?.find((entry) => entry.chapterId === state.chapter.chapterId);
    const node = map?.nodes.find((entry) => entry.id === nodeId);
    if (node?.kind !== 'town' || loadedTowns.some((entry) => entry.sceneId === node.entry.sceneId)) return;
    const definition = await loadTown?.(node.entry.sceneId) ?? undefined;
    if (!definition) throw new Error('TOWN_CONTENT_UNAVAILABLE');
    if (definition.chapterId !== state.chapter.chapterId.slice(0, 4)) throw new Error('TOWN_CONTENT_MISMATCH');
    loadedTowns.push(definition); core = createAsyncCore(state,
      coreContent(content, loadedTowns, state.chapter.chapterId));
  }
  async function preloadRegionMount(command: Command): Promise<GameContent | undefined> {
    if (command.t !== 'world/mountRegion' ||
        content.regionMaps?.some((map) => map.id === command.sceneId)) return undefined;
    let maps: readonly NonNullable<GameContent['regionMaps']>[number][];
    try { maps = await options.preloadRegion?.(state.chapter.chapterId, command.regionId) ?? []; }
    catch (error) { throw new Error('REGION_UNAVAILABLE', { cause: error }); }
    const ids = new Set(content.regionMaps?.map((map) => map.id) ?? []);
    if (maps.length === 0) throw new Error('REGION_UNAVAILABLE');
    if (maps.some((map) => map.regionId !== command.regionId || ids.has(map.id) ||
        (!map.chapterScope.includes('all') && !map.chapterScope.includes(state.chapter.chapterId)) ||
        (map.eraLayer !== 'base' && map.eraLayer !== state.chapter.eraLayerId)) ||
        !maps.some((map) => map.id === command.sceneId))
      throw new Error('REGION_CONTENT_MISMATCH');
    return { ...content, regionMaps: [...content.regionMaps ?? [], ...maps] };
  }
  async function contentForRegionState(candidate: SessionSnapshot): Promise<GameContent> {
    const mounted = candidate.world.navigation.mountedRegion;
    const sceneId = candidate.world.navigation.locationId;
    if (!mounted || content.regionMaps?.some((map) => map.id === sceneId)) return content;
    let maps: readonly NonNullable<GameContent['regionMaps']>[number][];
    try { maps = await options.preloadRegion?.(candidate.chapter.chapterId, mounted.regionId) ?? []; }
    catch (error) { throw new Error('REGION_UNAVAILABLE', { cause: error }); }
    const ids = new Set(content.regionMaps?.map((map) => map.id) ?? []);
    if (maps.length === 0) throw new Error('REGION_UNAVAILABLE');
    if (maps.some((map) => map.regionId !== mounted.regionId || ids.has(map.id) ||
        (!map.chapterScope.includes('all') && !map.chapterScope.includes(candidate.chapter.chapterId)) ||
        (map.eraLayer !== 'base' && map.eraLayer !== candidate.chapter.eraLayerId)) ||
        !maps.some((map) => map.id === sceneId)) throw new Error('REGION_CONTENT_MISMATCH');
    return { ...content, regionMaps: [...content.regionMaps ?? [], ...maps] };
  }
  async function preloadBookSleep(command: Command): Promise<GameContent | undefined> {
    if (command.t !== 'chapter/bookSleep') return undefined;
    if (command.plan.from !== 'ch00_yuenv' || command.plan.to !== 'ch10_baima' ||
        state.chapter.chapterId !== 'ch00_yuenv') return undefined;
    const target = await options.preloadChapter?.(command.plan.to);
    if (!target || target.chapters?.length !== 1 ||
        target.chapters[0]?.id !== command.plan.to || !target.contentHash)
      throw new Error('BOOK_SLEEP_CONTENT_UNAVAILABLE');
    return target;
  }
  function validated(candidate: SessionSnapshot, definition = townDefinition,
    candidateContent = content): SessionSnapshot {
    const next = validateSession(candidate, candidateContent, definition);
    if (next.dialogue) throw new Error('DIALOGUE_SAVE_UNAVAILABLE');
    if (next.meta.debugTainted !== opening.meta.debugTainted) throw new Error('SAVE_MODE_INVALID');
    return next;
  }
  async function regionChanges(forceStatic = false, patch = false): Promise<
    Partial<Pick<GameProjection, 'regionStatic' | 'region' | 'regionPathPreview'>>> {
    const runtime = regionContent(content); const sceneId = state.world.navigation.locationId;
    const region = runtime ? await regionSubsystem() : null;
    const dynamic = runtime && region ? region.projectRegionDynamic(state, runtime) : null;
    const mountedKey = dynamic ? `${dynamic.regionId}/${dynamic.sceneId}` : null;
    const includeStatic = !patch || forceStatic || mountedKey !== regionStaticSentFor;
    if (includeStatic) regionStaticSentFor = mountedKey;
    return { ...(includeStatic ? { regionStatic: runtime && dynamic
      ? region!.projectRegionStatic(runtime, sceneId) : null } : {}), region: dynamic,
      regionPathPreview: null };
  }
  selectors.update(state, ALL_VIEWS);
  return {
    async query() { const projectDialogue = await dialogueProjection();
      return { ...selectors.query(), dialogue: projectDialogue(state), ...await regionChanges(),
        firstSleepAllocation: firstSleepQueryForState(state), battle: battle?.packet(true) ?? null }; },
    snapshot: () => {
      if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE');
      if (state.dialogue) throw new Error('DIALOGUE_SAVE_UNAVAILABLE');
      return cloneGameState(state);
    },
    async validate(candidate: SessionSnapshot) {
      const loaded = await townFor(candidate);
      const candidateContent = await contentForRegionState(candidate);
      validated(candidate, loaded, candidateContent);
    },
    async restore(candidate): Promise<GameUpdate> {
      if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE');
      const loaded = await townFor(candidate);
      const candidateContent = await contentForRegionState(candidate);
      const next = validated(candidate, loaded, candidateContent);
      if (regionContent(candidateContent)) await regionSubsystem();
      const changes = selectors.update(next, ALL_VIEWS, '已读取存档');
      state = next; townDefinition = loaded; content = candidateContent;
      regionStaticSentFor = null;
      core = createAsyncCore(state, coreContent(content, loadedTowns, state.chapter.chapterId));
      return { accepted: true, changes: { ...changes, ...await regionChanges(true, true),
        firstSleepAllocation: firstSleepQueryForState(state) }, events: [] };
    },
    async createNewGame(input): Promise<GameUpdate> {
      if (battle) throw new Error('BATTLE_BUSY');
      const next = createNewGameSessionState(content, input, options.seedSource);
      const projectDialogue = await dialogueProjection();
      const changes = { ...selectors.update(next, ALL_VIEWS, '新篇已启'),
        firstSleepAllocation: firstSleepQueryForState(next),
        dialogue: projectDialogue(next), battle: null };
      state = next; townDefinition = undefined; regionStaticSentFor = null;
      core = createAsyncCore(state, coreContent(content, loadedTowns, state.chapter.chapterId));
      Object.assign(changes, await regionChanges(true, true));
      return { accepted: true, changes, events: [{ t: 'run/created', payload: {
        runId: state.meta.runId, chapterId: state.chapter.chapterId,
        difficulty: state.profile.replayRules?.difficulty ?? 'diff_jianghu',
      } }] };
    },
    async dispatch(command: GameCommand): Promise<GameUpdate> {
      if (command.t === 'run/create') return this.createNewGame(command);
      if (command.t === 'world/previewRegionPath') {
        if (battle) return { accepted: true, changes: { regionPathPreview: {
          ok: false, reason: 'REGION_INTERACTION_BUSY',
        } }, events: [] };
        const runtime = regionContent(content);
        const preview = runtime ? (await regionSubsystem()).queryRegionPath(state, runtime, command.hex)
          : { ok: false as const, reason: 'REGION_UNAVAILABLE' as const };
        return { accepted: true, changes: { regionPathPreview: preview }, events: [] };
      }
      if (isBattleCommand(command)) {
        try { return await battleCommand(command); } catch (error) {
          const result = rejected(error); if (result) return result; throw error;
        }
      }
      if (battle) return { accepted: false, changes: {}, events: [], error: 'BATTLE_BUSY' };
      if (import.meta.env.MODE === 'test' && typeof document !== 'undefined')
        await (await import('./flow-preload')).preloadFlowForCommand(command);
      if (command.t.startsWith('dialogue/') || command.t === 'world/interact')
        await dialogueProjection();
      if (command.t === 'world/mountRegion' || command.t === 'world/walkTo' ||
          command.t === 'world/interact' || command.t === 'chapter/bookSleep')
        await regionSubsystem();
      const targetContent = await preloadBookSleep(command);
      await preloadWorldMapTown(command);
      let mountContent: GameContent | undefined;
      try { mountContent = await preloadRegionMount(command); } catch (error) {
        if (error instanceof Error &&
            ['REGION_UNAVAILABLE', 'REGION_CONTENT_MISMATCH'].includes(error.message))
          return { accepted: false, changes: {}, events: [], error: error.message };
        throw error;
      }
      const candidate = command.t === 'town/meditate' ? createAsyncCore(
        state, coreContent(content, loadedTowns, state.chapter.chapterId)) : null;
      const candidateResult = await candidate?.dispatch(command);
      const meditationCommand = command.t === 'town/meditate' ? command : null;
      const battleEvent = candidateResult?.ok && meditationCommand
        ? candidateResult.events.find((event) => event.t === 'town/battleRequested') : undefined;
      let prepared: Awaited<ReturnType<typeof prepareBattle>> | undefined;
      if (battleEvent) {
        const encounter = content.meditationEncounters?.find((row) =>
          row.sceneId === state.chapter.town?.sceneId && row.anchorId === meditationCommand!.anchorId);
        const setup = (battleEvent.payload as { setup?: BattleLaunch['setup'] }).setup;
        if (!encounter || !setup) throw new TypeError('BATTLE_REQUEST_INVALID');
        try { prepared = await prepareBattle({ ...encounter.launch, setup }); } catch (error) {
          const result = rejected(error); if (result) return result; throw error;
        }
      }
      const commandCore = targetContent ? createAsyncCore(state,
        coreContent(content, loadedTowns, state.chapter.chapterId, targetContent))
        : mountContent ? createAsyncCore(state,
          coreContent(mountContent, loadedTowns, state.chapter.chapterId)) : core;
      const result = await commandCore.dispatch(command);
      if (!result.ok) return { accepted: false, changes: {}, events: [], error: result.reason };
      const committed = commandCore.snapshot();
      if (targetContent) {
        const mounted = validateSession(committed, targetContent);
        const legacyWithoutRegions = options.preloadRegion === undefined &&
          (targetContent.regionMaps?.length ?? 0) === 0;
        state = legacyWithoutRegions ? { ...mounted, world: { ...mounted.world, navigation: {
          ...mounted.world.navigation, pendingMount: null } } } : mounted;
        content = targetContent;
        selectors = createSessionSelectors(content, () => townDefinition);
        core = createAsyncCore(state, coreContent(content, loadedTowns, state.chapter.chapterId));
      } else {
        state = committed;
        if (mountContent) { content = mountContent; core = commandCore; }
      }
      townDefinition = state.chapter.town
        ? loadedTowns.find((entry) => entry.sceneId === state.chapter.town?.sceneId) : undefined;
      if (state.chapter.town && !townDefinition) throw new TypeError('TOWN_CONTENT_INVARIANT');
      const stepTransition = result.events.some((event) =>
        event.t === 'worldmap/sceneRequested' || event.t === 'worldmap/encounterRequested' ||
        event.t === 'worldmap/gateBlocked');
      let changes = selectors.update(state, command.t === 'chapter/bookSleep' ? ALL_VIEWS : dirtyViews(command), '',
        command.t === 'worldmap/step' && !stepTransition);
      if (command.t === 'quest/choose' || command.t === 'chapter/bookSleep')
        changes = { ...changes, firstSleepAllocation: firstSleepQueryForState(state) };
      if (command.t === 'chapter/bookSleep') changes = { ...changes,
        ...await regionChanges(true, true) };
      if (command.t.startsWith('dialogue/')) changes = { ...changes,
        dialogue: (await dialogueProjection())(state) };
      if (command.t === 'world/mountRegion' || command.t === 'world/walkTo' ||
          command.t === 'world/interact') changes = { ...changes,
        ...await regionChanges(command.t === 'world/mountRegion', true) };
      const moved = result.events.find((event) => event.t === 'town/moved');
      const path = moved?.payload && typeof moved.payload === 'object' && !Array.isArray(moved.payload)
        ? (moved.payload as { path?: readonly (readonly [number, number])[] }).path : undefined;
      if (path && changes.town) changes = { ...changes, town: { ...changes.town, movementPath: path } };
      if (!prepared) return { accepted: true, changes, events: result.events };
      battle = prepared.runtime;
      return { accepted: true, changes: { ...changes, ...prepared.update.changes },
        events: [...result.events, ...prepared.update.events] };
    },
  };
}

export async function createLoadedGameSession(base: StaticGameContent, source: ContentSource,
  initial?: SessionSnapshot, loadTown?: TownLoader, options: GameSessionOptions = {}) {
  const { itemContentChapter, loadGameContent, loadRegionMaps } =
    await import('./content-loader').then(({ createContentLoader }) => createContentLoader());
  const loaded = new Map<string, Promise<GameContent>>();
  const contentFor = (chapter: string): Promise<GameContent> => {
    const existing = loaded.get(chapter);
    if (existing) return existing;
    const pending = loadGameContent(base, source, chapter).catch((error: unknown) => {
      loaded.delete(chapter);
      throw error;
    });
    loaded.set(chapter, pending);
    return pending;
  };
  const sessionFor = (content: GameContent, demo: boolean) =>
    createGameSession(content, undefined, loadTown, { ...options, demo, preloadChapter: contentFor,
      preloadRegion: options.preloadRegion ?? ((chapterId, regionId) =>
        loadRegionMaps(source, chapterId, regionId)) });
  const chapter = initial?.chapter.chapterId ?? itemContentChapter(options.demo === true);
  let debugTainted = initial?.meta.debugTainted ?? options.demo === true;
  let active = sessionFor(await contentFor(chapter), debugTainted);
  if (initial) await active.restore(initial);
  const createNewGame = async (input: NewGameRequest): Promise<GameUpdate> => {
    const replacement = sessionFor(await contentFor(itemContentChapter(false)), false);
    const update = await replacement.createNewGame(input);
    if (update.accepted) { active = replacement; debugTainted = false; }
    return update;
  };
  return {
    query: () => active.query(),
    snapshot: () => active.snapshot(),
    async validate(candidate: SessionSnapshot) {
      if (candidate.meta.debugTainted !== debugTainted) throw new Error('SAVE_MODE_INVALID');
      const replacement = sessionFor(await contentFor(candidate.chapter.chapterId),
        debugTainted);
      await replacement.validate(candidate);
    },
    async restore(candidate: SessionSnapshot) {
      if (candidate.meta.debugTainted !== debugTainted) throw new Error('SAVE_MODE_INVALID');
      const replacement = sessionFor(await contentFor(candidate.chapter.chapterId),
        debugTainted);
      const update = await replacement.restore(candidate);
      active = replacement;
      return update;
    },
    async fixupContentRefs(candidate: SessionSnapshot, fromContentHash: string) {
      const { fixupContentRefs } = await import('@tianshu/data');
      const target = await contentFor(candidate.chapter.chapterId);
      if (fromContentHash === target.contentHash) return structuredClone(candidate);
      const fixed = fixupContentRefs(candidate as unknown as JsonValue,
        target.idRemaps ?? []) as unknown as SessionSnapshot;
      return target.contentHash ? { ...fixed, meta: { ...fixed.meta,
        contentHash: target.contentHash } } : fixed;
    },
    createNewGame,
    dispatch: (command: GameCommand) => command.t === 'run/create'
      ? createNewGame(command)
      : active.dispatch(command),
  };
}
