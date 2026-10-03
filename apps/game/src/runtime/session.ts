import { cloneGameState, createCoreFromState, type Command, type CoreContent,
  type GameState } from '@tianshu/core';
import type { JsonValue } from '@tianshu/shared';
import type { BattleLaunch, BattleUiCommand } from '../battle/contracts';
import type { BattleRuntime } from '../battle/runtime';
import { createSelectors } from '../projection';
import { createPreviewSession } from './bootstrap';
import { equipmentRules, type GameContent, type TownLoader } from './content';
import { ALL_VIEWS, type DirtyView, type GameCommand, type GameRemote, type GameUpdate, type SessionSnapshot } from './contracts';
import { validateSession } from './validate';

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
function coreContent(content: GameContent, towns: GameContent['towns'], chapterId: string): CoreContent {
  const eraLayer = content.worldMaps?.find((entry) => entry.chapterId === chapterId)?.era;
  return {
    items: content.items,
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
  };
}
function dirtyViews(command: Command): readonly DirtyView[] {
  if (command.t === 'world/tick') return ['hud'];
  if (command.t.startsWith('worldmap/')) return ['hud', 'worldmap', 'townRuntime', 'town'];
  if (command.t === 'inventory/equip' || command.t === 'inventory/unequip')
    return ['inventory', 'equipment'];
  if (command.t === 'inventory/use') return ['hud', 'characters', 'inventory'];
  return ['hud', 'characters', 'town'];
}

/** Worker composition of core functions. This adapter defines no stat or combat formulas. */
export function createGameSession(content: GameContent, initial = createPreviewSession(content),
  loadTown?: TownLoader): GameRemote {
  const loadedTowns = [...(content.towns ?? [])];
  let townDefinition = initial.chapter.town
    ? loadedTowns.find((entry) => entry.sceneId === initial.chapter.town?.sceneId) : undefined;
  let state = validateSession(initial, content, townDefinition);
  let core = createCoreFromState(state, coreContent(content, loadedTowns, state.chapter.chapterId));
  const selectors = createSelectors(content, () => townDefinition);
  let battle: BattleRuntime | null = null;
  async function prepareBattle(launch: BattleLaunch): Promise<{
    runtime: BattleRuntime; update: GameUpdate }> {
    const { BattleRuntime } = await import('../battle/runtime');
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
        ? (await import('../battle/demo')).createBattleDemo(command.source) : command.launch;
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
    loadedTowns.push(definition); core = createCoreFromState(state,
      coreContent(content, loadedTowns, state.chapter.chapterId));
  }
  function validated(candidate: SessionSnapshot, definition = townDefinition): SessionSnapshot {
    const next = validateSession(candidate, content, definition);
    if (next.meta.debugTainted !== initial.meta.debugTainted) throw new Error('SAVE_MODE_INVALID');
    return next;
  }
  selectors.update(state, ALL_VIEWS);
  return {
    query: () => ({ ...selectors.query(), battle: battle?.packet(true) ?? null }),
    snapshot: () => { if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE'); return cloneGameState(state); },
    async validate(candidate) {
      const loaded = await townFor(candidate); validated(candidate, loaded);
    },
    async restore(candidate): Promise<GameUpdate> {
      if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE');
      const loaded = await townFor(candidate);
      const next = validated(candidate, loaded);
      const changes = selectors.update(next, ALL_VIEWS, '已读取存档');
      state = next; townDefinition = loaded;
      core = createCoreFromState(state, coreContent(content, loadedTowns, state.chapter.chapterId));
      return { accepted: true, changes, events: [] };
    },
    async dispatch(command: GameCommand): Promise<GameUpdate> {
      if (isBattleCommand(command)) {
        try { return await battleCommand(command); } catch (error) {
          const result = rejected(error); if (result) return result; throw error;
        }
      }
      if (battle) return { accepted: false, changes: {}, events: [], error: 'BATTLE_BUSY' };
      await preloadWorldMapTown(command);
      const candidate = command.t === 'town/meditate' ? createCoreFromState(
        state, coreContent(content, loadedTowns, state.chapter.chapterId)) : null;
      const candidateResult = candidate?.dispatch(command);
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
      const result = core.dispatch(command);
      if (!result.ok) return { accepted: false, changes: {}, events: [], error: result.reason };
      state = core.snapshot();
      townDefinition = state.chapter.town
        ? loadedTowns.find((entry) => entry.sceneId === state.chapter.town?.sceneId) : undefined;
      if (state.chapter.town && !townDefinition) throw new TypeError('TOWN_CONTENT_INVARIANT');
      const stepTransition = result.events.some((event) =>
        event.t === 'worldmap/sceneRequested' || event.t === 'worldmap/encounterRequested' ||
        event.t === 'worldmap/gateBlocked');
      let changes = selectors.update(state, dirtyViews(command), '',
        command.t === 'worldmap/step' && !stepTransition);
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
