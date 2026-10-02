import { TICKS_PER_SHICHEN, advanceGameClock } from '../state';
import type { JsonValue } from '@tianshu/shared';
import { equipItem, unequipItem, useConsumable } from '../economy';
import { createTownRuntime, createTownState, createWorldMapRuntime } from '../world';
import type { Command, CommandHandler, CoreContent, CoreTransaction,
  InventoryCommand, RejectReason, WorldTickCommand } from '.';
import type { GameState } from '../state';
import type { TownCommand, WorldMapCommand } from '../world';
import { eventPayload } from './transaction';

const DOMAIN_REJECTIONS = new Set<RejectReason>([
  'MAP_UNAVAILABLE', 'MAP_STILL_TRAVELLING', 'MAP_NODE_CLOSED', 'MAP_SCENE_BUSY',
  'MAP_UNREACHABLE', 'MAP_STEP_STALE', 'MAP_NOT_WALKING', 'MAP_NOT_PAUSED',
  'MAP_NOT_IN_SCENE', 'TOWN_UNAVAILABLE', 'TOWN_STATE_MISMATCH', 'TOWN_UNREACHABLE',
  'TOWN_BUILDING_BUSY', 'TOWN_BUILDING_ENTRY', 'TOWN_ALREADY_INSIDE', 'TOWN_NOT_INSIDE',
  'TOWN_NPC_ABSENT', 'TOWN_NPC_NOT_HERE', 'TOWN_NOT_AT_SHOP',
  'TOWN_MEDITATION_UNAVAILABLE', 'EQUIPMENT_SLOT_MISMATCH', 'EQUIPMENT_ITEM_UNKNOWN',
  'EQUIPMENT_ALREADY_EQUIPPED', 'EQUIPMENT_PAIR_OCCUPIES_OFFHAND',
  'EQUIPMENT_TWO_HAND_OFFHAND', 'EQUIPMENT_SLOT_EMPTY', 'INVENTORY_INSUFFICIENT',
  'ITEM_EFFECT_UNAVAILABLE', 'ITEM_TARGET_UNAVAILABLE', 'CONSUMABLE_CONTEXT',
  'CONSUMABLE_BATTLE_LIMIT', 'CONSUMABLE_CHAPTER_LIMIT', 'CONSUMABLE_COOLDOWN',
  'CONSUMABLE_REVIVE_CONTEXT', 'CONSUMABLE_PERMANENT_CONTEXT',
  'CONSUMABLE_MERIDIAN_CONTEXT',
]);
const FIELD_EFFECTS = new Set(['healPct', 'mpPct', 'staPct', 'dispel', 'permStat', 'permMaxPct']);
export function rejectionFrom(error: unknown): RejectReason | null {
  return error instanceof Error && DOMAIN_REJECTIONS.has(error.message as RejectReason)
    ? error.message as RejectReason : null;
}
function dryRun<C extends Command>(state: Readonly<GameState>, command: C,
  content: CoreContent, run: (state: GameState, command: C, content: CoreContent) => unknown): RejectReason | null {
  try { run(state as GameState, command, content); return null; }
  catch (error) { const rejection = rejectionFrom(error); if (rejection) return rejection; throw error; }
}
function worldTickApply(tx: CoreTransaction): void {
  const advanced = advanceGameClock(tx.state.chapter.clock, 1);
  const clock = advanced.clock;
  tx.set(['meta', 'worldTick'], clock.elapsedTicks);
  tx.set(['chapter', 'clock'], clock);
  tx.set(['chapter', 'worldYear'], clock.epochYear + clock.yearOffset);
  tx.emit({ t: 'world/ticked', payload: { worldTick: clock.elapsedTicks } });
  for (const fact of advanced.events) {
    const { t, ...payload } = fact;
    tx.emit({ t, payload: eventPayload(payload) });
  }
}
export function worldPaused(state: Readonly<GameState>): boolean {
  return state.dialogue !== null || state.battle !== null ||
    state.world.pendingTimeAdvance !== null ||
    state.chapter.town?.buildingPhase === 'fading-in' ||
    state.chapter.town?.buildingPhase === 'fading-out';
}
export const worldTickHandler: CommandHandler<WorldTickCommand> = {
  validate: (state) => worldPaused(state) ? 'WORLD_PAUSED' : null,
  apply: worldTickApply,
};
function mapRuntime(state: GameState, content: CoreContent) {
  const map = content.worldMaps?.find((entry) => entry.chapterId === state.chapter.chapterId);
  if (!map) throw new Error('MAP_UNAVAILABLE');
  return createWorldMapRuntime({ map, equipmentRules: content.equipmentRules ?? [],
    identityTags: content.identityTags ?? [] });
}
function runWorldMap(state: GameState, command: WorldMapCommand, content: CoreContent) {
  const result = mapRuntime(state, content).dispatch(state, command);
  const scene = result.state.chapter.worldMap?.scene;
  const town = scene?.kind === 'town'
    ? content.towns?.find((entry) => entry.sceneId === scene.sceneId) : undefined;
  if (command.t === 'worldmap/enter' && scene?.kind === 'town' && !town)
    throw new Error('TOWN_UNAVAILABLE');
  const townState = command.t === 'worldmap/leave' ? null
    : town ? createTownState(town) : result.state.chapter.town;
  return { ...result, state: { ...result.state, chapter: { ...result.state.chapter, town: townState } } };
}
function applyWorldMap(tx: CoreTransaction, command: WorldMapCommand): void {
  const result = runWorldMap(tx.state as GameState, command, tx.content);
  tx.set(['meta', 'worldTick'], result.state.meta.worldTick);
  tx.set(['chapter'], result.state.chapter);
  const map = result.state.chapter.worldMap;
  if (map) tx.set(['world', 'navigation'], { locationId: map.scene?.nodeId ??
    (map.position.kind === 'node' ? map.position.nodeId : map.position.leg.to),
    selectedDestinationId: map.journey?.destination ?? null });
  for (const event of result.events) {
    const { t, ...payload } = event; tx.emit({ t, payload: eventPayload(payload) });
  }
}
export const worldMapHandler: CommandHandler<WorldMapCommand> = {
  validate: (state, command, content) => dryRun(state, command, content,
    runWorldMap),
  apply: applyWorldMap,
};
function townRuntime(state: GameState, content: CoreContent) {
  const active = state.chapter.town;
  const town = active && content.towns?.find((entry) => entry.sceneId === active.sceneId);
  if (!town) throw new Error('TOWN_UNAVAILABLE');
  return createTownRuntime({ town,
    ...(content.townEventAnchors ? { eventAnchors: content.townEventAnchors } : {}),
    ...(content.townNpcWorld ? { npcWorld: content.townNpcWorld } : {}),
    ...(content.eraLayer ? { eraLayer: content.eraLayer } : {}),
    ...(content.townNpcPlacements ? { npcAnchors: content.townNpcPlacements } : {}),
    ...(content.meditationPractices ? { meditationPractices: content.meditationPractices } : {}),
    ...(content.meditationEncounters ? { meditationEncounters: content.meditationEncounters } : {}) });
}
function preflightTown(state: GameState, command: TownCommand, content: CoreContent) {
  const current = state.chapter.town;
  if (!current) throw new Error('TOWN_UNAVAILABLE');
  return townRuntime(state, content).dispatch(current, command);
}
function runTown(state: GameState, command: TownCommand, content: CoreContent) {
  const current = state.chapter.town;
  if (!current) throw new Error('TOWN_UNAVAILABLE');
  const runtime = townRuntime(state, content); const result = runtime.dispatch(current, command);
  if (command.t !== 'town/meditate') return { state: { ...state, chapter: { ...state.chapter,
    town: result.state } }, result, meditation: null };
  const target = state.profile.protagonist ? targetFor(state.profile.protagonist) : undefined;
  const meditation = runtime.meditate(state, command,
    target ? { [target.characterId]: target } : undefined);
  const protagonist = meditation.target && meditation.game.profile.protagonist
    ? applyTarget(meditation.game.profile.protagonist, meditation.target)
    : meditation.game.profile.protagonist;
  return { state: { ...meditation.game, profile: { ...meditation.game.profile, protagonist } },
    result, meditation };
}
function applyTown(tx: CoreTransaction, command: TownCommand): void {
  const current = tx.state as GameState;
  const output = command.t === 'town/meditate'
    ? (() => {
      const state = current.chapter.town;
      if (!state) throw new Error('TOWN_UNAVAILABLE');
      const runtime = townRuntime(current, tx.content);
      const result = runtime.dispatch(state, command);
      const target = current.profile.protagonist ? targetFor(current.profile.protagonist) : undefined;
      const meditation = runtime.meditate(current, command,
        target ? { [target.characterId]: target } : undefined, tx.rng('world'));
      const protagonist = meditation.target && meditation.game.profile.protagonist
        ? applyTarget(meditation.game.profile.protagonist, meditation.target)
        : meditation.game.profile.protagonist;
      return { state: { ...meditation.game, profile: { ...meditation.game.profile, protagonist } },
        result, meditation };
    })()
    : runTown(current, command, tx.content);
  tx.set(['meta', 'worldTick'], output.state.meta.worldTick);
  tx.set(['chapter'], output.state.chapter); tx.set(['profile'], output.state.profile);
  tx.emit({ t: 'town/commandAccepted', payload: { command: command.t,
    sceneId: output.result.state.sceneId } });
  if (command.t === 'town/move' && output.result.path) tx.emit({ t: 'town/moved',
    payload: { destination: [...command.destination], steps: output.result.path.cost,
      path: output.result.path.points.map((point) => [...point]) } });
  for (const anchor of output.result.anchors ?? [])
    tx.emit({ t: 'town/anchorRequested', payload: { ...anchor } });
  if (output.result.action === 'shop')
    tx.emit({ t: 'town/shopRequested', payload: { businessRef: output.result.ref ?? null } });
  if (output.result.action === 'dialogue') tx.emit({ t: 'town/dialogueRequested',
    payload: { npcId: command.t === 'town/interact' ? command.npcId ?? null : null } });
  if (output.meditation) for (const fact of output.meditation.events) {
    const { t, ...payload } = fact; tx.emit({ t, payload: eventPayload(payload) });
  }
  if (output.meditation?.battleSetup) tx.emit({ t: 'town/battleRequested',
    payload: { setup: output.meditation.battleSetup } as unknown as JsonValue });
}
export const townHandler: CommandHandler<TownCommand> = {
  validate: (state, command, content) => dryRun(state, command, content, preflightTown),
  apply: applyTown,
};
function targetFor(character: GameState['profile']['protagonist'] & {} ) {
  const consumable = character.consumable ?? { stamina: 0, staminaMax: 0, ailments: [],
    temporaryEffects: [], permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
    meridianAids: [] };
  return { characterId: character.characterId, alive: character.status === 'active',
    hp: character.resources.hp, hpMax: character.stats.hpMax, mp: character.resources.mp,
    mpMax: character.stats.mpMax, meridians: character.meridians, ...consumable };
}
function applyTarget(character: NonNullable<GameState['profile']['protagonist']>,
  target: ReturnType<typeof targetFor>): NonNullable<GameState['profile']['protagonist']> {
  const consumable = { stamina: target.stamina, staminaMax: target.staminaMax,
    ailments: target.ailments, temporaryEffects: target.temporaryEffects,
    permanentBonuses: target.permanentBonuses, meridianAids: target.meridianAids };
  return { ...character, resources: { hp: target.hp, mp: target.mp },
    meridians: target.meridians, consumable };
}
function runInventory(state: GameState, command: InventoryCommand, content: CoreContent) {
  const items = content.items ?? []; const rules = content.equipmentRules ?? [];
  if (command.t === 'inventory/equip') {
    if (rules.find((rule) => rule.itemId === command.itemId)?.slot !== command.slot)
      throw new Error('EQUIPMENT_SLOT_MISMATCH');
    const result = equipItem(state.party.equipment, state.party.inventory, items, rules, command.itemId);
    return { state: { ...state, party: { ...state.party, equipment: result.equipment,
      inventory: result.inventory } }, events: result.events };
  }
  if (command.t === 'inventory/unequip') {
    const result = unequipItem(state.party.equipment, state.party.inventory, items, rules, command.slot);
    return { state: { ...state, party: { ...state.party, equipment: result.equipment,
      inventory: result.inventory } }, events: result.events };
  }
  const item = items.find((entry) => entry.id === command.itemId);
  if (!item || !item.use || item.use.context === 'battle' ||
      item.kind === 'ammo' || item.use.effects.some((effect) => !FIELD_EFFECTS.has(effect.op)))
    throw new Error('ITEM_EFFECT_UNAVAILABLE');
  const character = [state.profile.protagonist, ...state.profile.companions].find(
    (entry) => entry?.characterId === command.targetId);
  if (!character || character.status !== 'active' || character.resources.hp <= 0)
    throw new Error('ITEM_TARGET_UNAVAILABLE');
  const result = useConsumable({ inventory: state.party.inventory, itemDefs: items, item,
    target: targetFor(character), context: 'field', currentTick: state.meta.worldTick,
    usage: { battleUses: {}, chapterUses: state.chapter.itemChapterUses } });
  const advanced = advanceGameClock(state.chapter.clock, result.fieldTime * TICKS_PER_SHICHEN);
  const clock = advanced.clock;
  const updated = applyTarget(character, result.target);
  const protagonist = state.profile.protagonist?.characterId === character.characterId
    ? updated : state.profile.protagonist;
  const companions = state.profile.companions.map((entry) =>
    entry.characterId === character.characterId ? updated : entry);
  return { state: { ...state, meta: { ...state.meta, worldTick: clock.elapsedTicks },
    chapter: { ...state.chapter, clock, worldYear: clock.epochYear + clock.yearOffset,
      itemChapterUses: result.usage.chapterUses },
    profile: { protagonist, companions }, party: { ...state.party, inventory: result.inventory } },
    events: [...result.events, ...advanced.events] };
}
export const inventoryHandler: CommandHandler<InventoryCommand> = {
  validate: (state, command, content) => dryRun(state, command, content, runInventory),
  apply(tx, command) {
    const result = runInventory(tx.state as GameState, command, tx.content);
    tx.set(['meta', 'worldTick'], result.state.meta.worldTick); tx.set(['chapter'], result.state.chapter);
    tx.set(['profile'], result.state.profile); tx.set(['party'], result.state.party);
    for (const fact of result.events) { const { t, ...payload } = fact;
      tx.emit({ t, payload: eventPayload(payload) }); }
  },
};
