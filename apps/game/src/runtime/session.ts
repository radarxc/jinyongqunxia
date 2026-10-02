import { advanceGameClock, createTownRuntime, createTownState, createWorldMapRuntime, equipItem,
  unequipItem, worldMapLocation, type DomainEvent, type TownCommand, type TownRuntime,
  type WorldMapCommand } from '@tianshu/core';
import type { JsonValue } from '@tianshu/shared';
import type { BattleLaunch, BattleUiCommand } from '../battle/contracts';
import type { BattleRuntime } from '../battle/runtime';
import { createSelectors } from '../projection';
import { createPreviewSession } from './bootstrap';
import { equipmentRules, type GameContent, type TownLoader } from './content';
import { ALL_VIEWS, type DirtyView, type GameCommand, type GameRemote, type GameUpdate, type SessionSnapshot } from './contracts';
import { applyItemUse } from './item-adapter';
import { validateSession } from './validate';

function isWorldMapCommand(command: GameCommand): command is WorldMapCommand {
  return command.t === 'worldmap/travel' || command.t === 'worldmap/step' ||
    command.t === 'worldmap/cancel' || command.t === 'worldmap/resume' ||
    command.t === 'worldmap/enter' || command.t === 'worldmap/leave';
}
function isTownCommand(command: GameCommand): command is TownCommand {
  return command.t === 'town/move' || command.t === 'town/settle-building' ||
    command.t === 'town/exit-building' || command.t === 'town/interact' ||
    command.t === 'town/meditate';
}

/** Worker composition of core functions. This adapter defines no stat or combat formulas. */
export function createGameSession(content: GameContent, initial = createPreviewSession(content),
  loadTown?: TownLoader): GameRemote {
  let townDefinition = initial.state.chapter.town
    ? content.towns?.find((entry) => entry.sceneId === initial.state.chapter.town?.sceneId) : undefined;
  let session = validateSession(initial, content, townDefinition);
  const selectors = createSelectors(content, () => townDefinition);
  const rules = equipmentRules(content);
  let battle: BattleRuntime | null = null;
  async function prepareBattle(launch: BattleLaunch): Promise<{
    runtime: BattleRuntime; update: GameUpdate }> {
    const { BattleRuntime } = await import('../battle/runtime');
    const candidate = new BattleRuntime(launch);
    const packet = candidate.packet(true); const setup = candidate.launch.setup;
    return { runtime: candidate, update: { accepted: true, changes: { battle: packet },
      events: [{ t: 'battle/setupResolved', payload: {
        setupId: setup.setupId, encounterId: setup.encounterId,
        participants: setup.participants.map(row => row.unitRef),
        winCond: setup.end.winCond, loseCond: setup.end.loseCond, drawCond: setup.end.drawCond,
      } as JsonValue }] } };
  }
  async function battleCommand(command: BattleUiCommand): Promise<GameUpdate> {
    if (command.t === 'battle/enter' || command.t === 'battle/demo') {
      if (battle) throw new Error('BATTLE_ALREADY_ACTIVE');
      if (command.t === 'battle/demo' && !session.preview) throw new Error('BATTLE_DEMO_FORBIDDEN');
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
  let map = content.worldMaps?.find((entry) => entry.chapterId === session.state.chapter.chapterId);
  let worldmap = map ? createWorldMapRuntime({ map, equipmentRules: rules,
    identityTags: content.identityTags ?? [] }) : undefined;
  function townRuntimeFor(next: SessionSnapshot, loaded = townDefinition): {
    definition?: typeof townDefinition; runtime?: TownRuntime } {
    const definition = next.state.chapter.town && loaded?.sceneId === next.state.chapter.town.sceneId
      ? loaded : next.state.chapter.town
        ? content.towns?.find((entry) => entry.sceneId === next.state.chapter.town?.sceneId) : undefined;
    if (!definition) return {};
    return { definition, runtime: createTownRuntime({ town: definition,
      ...(content.townEventAnchors ? { eventAnchors: content.townEventAnchors } : {}),
      ...(content.townNpcWorld ? { npcWorld: content.townNpcWorld } : {}),
      ...(content.townNpcPlacements ? { npcAnchors: content.townNpcPlacements } : {}),
      ...(content.meditationPractice ? { meditationPractices: content.meditationPractice } : {}),
      ...(content.meditationEncounters ? { meditationEncounters: content.meditationEncounters } : {}),
      ...(next.state.chapter.worldMap?.scene?.era
        ? { eraLayer: next.state.chapter.worldMap.scene.era } : {}) }) };
  }
  let town: TownRuntime | undefined = townDefinition ? townRuntimeFor(session).runtime : undefined;
  function selectWorldMap(next: SessionSnapshot): void {
    map = content.worldMaps?.find((entry) => entry.chapterId === next.state.chapter.chapterId);
    worldmap = map ? createWorldMapRuntime({ map, equipmentRules: rules,
      identityTags: content.identityTags ?? [] }) : undefined;
  }
  async function enterRequestedTown(next: SessionSnapshot): Promise<SessionSnapshot> {
    const entry = next.state.chapter.worldMap?.scene;
    if (!entry || entry.kind !== 'town') return next;
    const definition = content.towns?.find((row) => row.sceneId === entry.sceneId)
      ?? await loadTown?.(entry.sceneId) ?? undefined;
    if (definition && definition.chapterId !== next.state.chapter.chapterId.slice(0, 4))
      throw new Error('TOWN_CONTENT_MISMATCH');
    if (!definition) throw new Error('TOWN_CONTENT_UNAVAILABLE');
    townDefinition = definition;
    const state = createTownState(definition);
    return { ...next, location: definition.displayName, state: { ...next.state,
      chapter: { ...next.state.chapter, town: state } } };
  }
  function leaveTown(next: SessionSnapshot): SessionSnapshot {
    if (next.state.chapter.town === null) return next;
    return { ...next, state: { ...next.state, chapter: { ...next.state.chapter, town: null } } };
  }
  function validated(candidate: SessionSnapshot, definition = townDefinition): SessionSnapshot {
    const next = validateSession(candidate, content, definition);
    if (next.preview !== initial.preview) throw new Error('SAVE_MODE_INVALID');
    return next;
  }
  selectors.update(session, ALL_VIEWS);
  return {
    query: () => ({ ...selectors.query(), battle: battle?.packet(true) ?? null }),
    snapshot: () => { if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE'); return structuredClone(session); },
    async validate(candidate) {
      const loaded = candidate.state.chapter.town &&
        candidate.state.chapter.town.sceneId !== townDefinition?.sceneId
        ? await loadTown?.(candidate.state.chapter.town.sceneId) ?? undefined : townDefinition;
      validated(candidate, loaded);
    },
    async restore(candidate): Promise<GameUpdate> {
      if (battle) throw new Error('BATTLE_SAVE_UNAVAILABLE');
      const loaded = candidate.state.chapter.town &&
        candidate.state.chapter.town.sceneId !== townDefinition?.sceneId
        ? await loadTown?.(candidate.state.chapter.town.sceneId) ?? undefined : townDefinition;
      const next = validated(candidate, loaded);
      const selectedTown = townRuntimeFor(next, loaded);
      selectWorldMap(next); townDefinition = selectedTown.definition; town = selectedTown.runtime;
      const changes = selectors.update(next, ALL_VIEWS, '已读取存档');
      session = next;
      return { accepted: true, changes, events: [] };
    },
    async dispatch(command: GameCommand): Promise<GameUpdate> {
      try {
        if (command.t.startsWith('battle/')) return await battleCommand(command as BattleUiCommand);
        if (battle) throw new Error('BATTLE_BUSY');
        let next: SessionSnapshot = session;
        let dirty: readonly DirtyView[] = [];
        let facts: { t: string; [key: string]: unknown }[] = [];
        let launch: BattleLaunch | undefined;
        let townPath: readonly (readonly [number, number])[] | undefined;
        let selectedTown: ReturnType<typeof townRuntimeFor> | undefined;
        if (command.t === 'world/tick') {
          const result = advanceGameClock(session.state.chapter.clock, 1);
          next = { ...session, state: { ...session.state,
            meta: { ...session.state.meta, worldTick: result.clock.elapsedTicks },
            chapter: { ...session.state.chapter, clock: result.clock, worldYear: result.clock.epochYear + result.clock.yearOffset } } };
          facts = [{ t: 'world/ticked' }, ...result.events.map((event) => ({ ...event }))]; dirty = ['hud'];
        } else if (isWorldMapCommand(command)) {
          if (!worldmap || !map) throw new Error('MAP_UNAVAILABLE');
          const result = worldmap.dispatch(session.state, command);
          const worldMapState = result.state.chapter.worldMap;
          if (!worldMapState) throw new Error('MAP_UNAVAILABLE');
          next = { ...session, state: result.state,
            location: worldMapLocation(worldMapState, map) };
          if (command.t === 'worldmap/enter') next = await enterRequestedTown(next);
          else if (command.t === 'worldmap/leave') next = leaveTown(next);
          const loaded = next.state.chapter.town && next.state.chapter.town.sceneId !== townDefinition?.sceneId
            ? await loadTown?.(next.state.chapter.town.sceneId) ?? undefined : townDefinition;
          selectedTown = townRuntimeFor(next, loaded);
          dirty = ['hud', 'worldmap', 'townRuntime', 'town']; facts = [...result.events];
        } else if (isTownCommand(command)) {
          const townState = session.state.chapter.town;
          if (!town || !townDefinition || !townState) throw new Error('TOWN_UNAVAILABLE');
          const result = town.dispatch(townState, command);
          next = { ...session, state: { ...session.state, chapter: { ...session.state.chapter,
            town: result.state } } };
          facts = [{ t: 'town/commandAccepted', command: command.t, sceneId: townDefinition.sceneId }];
          if (command.t === 'town/move' && result.path) facts.push({ t: 'town/moved', destination: command.destination,
            steps: result.path.cost });
          if (command.t === 'town/move') townPath = result.path?.points;
          for (const anchor of result.anchors ?? []) facts.push({ t: 'town/anchorRequested', ...anchor });
          if (result.action === 'shop') facts.push({ t: 'town/shopRequested', businessRef: result.ref });
          if (result.action === 'dialogue') facts.push({ t: 'town/dialogueRequested',
            npcId: command.t === 'town/interact' ? command.npcId ?? null : null });
          if (result.action === 'meditate' && command.t === 'town/meditate') {
            const protagonist = next.state.profile.protagonist;
            if (!protagonist) throw new Error('TOWN_MEDITATION_UNAVAILABLE');
            const meditation = town.meditate(next.state, command, next.itemTargets);
            next = { ...next, state: meditation.game, itemTargets: meditation.target
              ? { ...next.itemTargets, [protagonist.characterId]: meditation.target } : next.itemTargets };
            facts.push(...meditation.events.map((event) => ({ ...event })));
            const encounter = content.meditationEncounters?.find((row) =>
              row.sceneId === townDefinition?.sceneId && row.anchorId === command.anchorId);
            if (meditation.battleSetup && encounter)
              launch = { ...encounter.launch, setup: meditation.battleSetup };
          }
          dirty = ['hud', 'characters', 'town'];
        } else if (command.t === 'inventory/equip' || command.t === 'inventory/unequip') {
          if (command.t === 'inventory/equip' && rules.find((rule) => rule.itemId === command.itemId)?.slot !== command.slot)
            throw new Error('EQUIPMENT_SLOT_MISMATCH');
          const result = command.t === 'inventory/equip'
            ? equipItem(session.state.party.equipment, session.state.party.inventory, content.items, rules, command.itemId)
            : unequipItem(session.state.party.equipment, session.state.party.inventory, content.items, rules, command.slot);
          next = { ...session, state: { ...session.state, party: { ...session.state.party,
            equipment: result.equipment, inventory: result.inventory } } };
          dirty = ['inventory', 'equipment']; facts = result.events.map((event) => ({ ...event }));
        } else if (command.t === 'inventory/use') {
          const result = applyItemUse(session, content, command.itemId, command.targetId);
          next = result.next; dirty = ['hud', 'characters', 'inventory'];
          facts = result.events.map((event) => ({ ...event }));
        } else throw new Error('COMMAND_UNKNOWN');
        const stateVersion = session.state.meta.stateVersion + 1;
        const firstSeq = session.state.meta.nextEventSeq;
        next = { ...next, state: { ...next.state, meta: { ...next.state.meta,
          stateVersion, nextEventSeq: firstSeq + facts.length } } };
        const events: DomainEvent[] = facts.map((fact, index) => fact.t === 'world/ticked'
          ? { t: 'world/ticked', seq: firstSeq + index, stateVersion, worldTick: next.state.meta.worldTick }
          : { t: fact.t, payload: { ...fact, seq: firstSeq + index, stateVersion, worldTick: next.state.meta.worldTick } });
        // Prepare the battle before the single commit point; rejection cannot consume RNG or time.
        const prepared = launch ? await prepareBattle(launch) : undefined;
        if (selectedTown) { townDefinition = selectedTown.definition; town = selectedTown.runtime; }
        const selectedChanges = selectors.update(next, dirty);
        const changes = townPath && selectedChanges.town
          ? { ...selectedChanges, town: { ...selectedChanges.town, movementPath: townPath } }
          : selectedChanges;
        session = next;
        if (!prepared) return { accepted: true, changes, events };
        battle = prepared.runtime;
        return { accepted: true, changes: { ...changes, ...prepared.update.changes },
          events: [...events, ...prepared.update.events] };
      } catch (error) {
        return { accepted: false, changes: {}, events: [], error: error instanceof Error ? error.message : 'COMMAND_FAILED' };
      }
    },
  };
}
