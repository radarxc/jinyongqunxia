import { addInventory } from '../economy';
import { dialogueHandler } from './story-handlers';
import { hexDistance } from '../hex';
import { decodeRegionMap, objectGate, previewRegionPath, queryRegionPath, regionMap, regionObjects,
  projectRegionDynamic, regionRuntimeForState, reachedRegionTriggers,
  consumeRegionEntity } from '../world';
import type { GameState } from '../state';
import type { CommandHandler, CoreContent, CoreTransaction } from '.';
import type { MountedRegionState, RegionCommand, RegionRuntimeContent } from '../world';

function region(content: CoreContent): RegionRuntimeContent {
  if (!content.region) throw new Error('REGION_UNAVAILABLE'); return content.region;
}
function mounted(state: Readonly<GameState>): MountedRegionState {
  const value = state.world.navigation.mountedRegion;
  if (!value) throw new Error('REGION_NOT_MOUNTED'); return value;
}
function mapFor(state: Readonly<GameState>, content: CoreContent) {
  const map = regionMap(region(content), state.world.navigation.locationId);
  if (!map || map.regionId !== mounted(state).regionId) throw new Error('REGION_CONTENT_MISMATCH');
  return map;
}
const currentRegion = (state: Readonly<GameState>, content: CoreContent): RegionRuntimeContent =>
  regionRuntimeForState(state, region(content));
function mount(state: Readonly<GameState>, command: Extract<RegionCommand, { t: 'world/mountRegion' }>,
  content: CoreContent): void {
  const runtime = region(content); const map = regionMap(runtime, command.sceneId);
  if (!map) throw new Error('REGION_UNAVAILABLE');
  if (map.regionId !== command.regionId) throw new Error('REGION_CONTENT_MISMATCH');
  if (state.dialogue !== null || state.battle !== null || state.world.pendingTimeAdvance !== null)
    throw new Error('REGION_INTERACTION_BUSY');
  if (state.world.navigation.pendingMount && (state.world.navigation.pendingMount.regionId !== command.regionId ||
      state.world.navigation.pendingMount.sceneId !== command.sceneId ||
      (state.world.navigation.pendingMount.spawnId !== null &&
       state.world.navigation.pendingMount.spawnId !== command.spawnId)))
    throw new Error('REGION_CONTENT_MISMATCH');
  const spawn = regionObjects(runtime, command.sceneId).find((object) =>
    object.class === 'PlayerSpawn' && object.id === command.spawnId);
  if (!spawn) throw new Error('REGION_SPAWN_UNKNOWN');
  const decoded = decodeRegionMap(map, 0, 0);
  if (!decoded.cells.some((cell) => cell.q === spawn.q && cell.r === spawn.r && cell.standable))
    throw new Error('REGION_SPAWN_UNKNOWN');
  const pending = state.world.navigation.pendingMount;
  if (pending?.spawnId === null &&
      (spawn.q !== pending.targetHex.q || spawn.r !== pending.targetHex.r))
    throw new Error('REGION_SPAWN_UNKNOWN');
}
function walk(state: Readonly<GameState>, command: Extract<RegionCommand, { t: 'world/walkTo' }>,
  content: CoreContent): void {
  const runtime = currentRegion(state, content); mapFor(state, content);
  const result = queryRegionPath(state, runtime, command.hex);
  if (!result.ok) throw new Error(result.reason);
}
function interact(state: Readonly<GameState>,
  command: Extract<RegionCommand, { t: 'world/interact' }>, content: CoreContent): void {
  const runtime = currentRegion(state, content); mapFor(state, content);
  if (state.dialogue !== null || state.battle !== null || state.world.pendingTimeAdvance !== null)
    throw new Error('REGION_INTERACTION_BUSY');
  if (state.world.navigation.pendingMount !== null) throw new Error('REGION_EXIT_PENDING');
  const anchor = regionObjects(runtime, state.world.navigation.locationId)
    .find((object) => object.id === command.anchorId);
  if (!anchor) throw new Error('REGION_ANCHOR_UNKNOWN');
  if (mounted(state).entities.find((entry) => entry.anchorId === anchor.id)?.active === false)
    throw new Error('REGION_ANCHOR_UNKNOWN');
  if (hexDistance(mounted(state).playerHex, anchor) > 1) throw new Error('REGION_ANCHOR_OUT_OF_RANGE');
  if (mounted(state).entities.find((entry) => entry.anchorId === anchor.id)?.consumed)
    throw new Error('REGION_ANCHOR_CONSUMED');
  if (!projectRegionDynamic(state, runtime)?.interactableAnchors.some((entry) =>
      entry.anchorId === anchor.id)) throw new Error('REGION_ANCHOR_NOT_VISIBLE');
  const gate = objectGate(anchor, runtime); if (!gate.allowed) throw new Error(gate.reason!);
  if (!['NpcSpawn', 'Trigger', 'Chest', 'Door', 'QinggongGate', 'BattleArena'].includes(anchor.class))
    throw new Error('REGION_INTERACTION_UNSUPPORTED');
  if (anchor.class === 'Chest' && !runtime.loot?.some((entry) => entry.lootRef === anchor.lootRef))
    throw new Error('REGION_LOOT_UNKNOWN');
  if (anchor.class === 'Chest') {
    const loot = runtime.loot!.find((entry) => entry.lootRef === anchor.lootRef)!;
    try {
      let inventory = state.party.inventory;
      for (const item of loot.items) inventory = addInventory(inventory, content.items ?? [],
        item.itemId, item.count);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVENTORY_STACK_LIMIT')
        throw new Error('REGION_LOOT_CAPACITY');
      if (error instanceof Error && error.message === 'INVENTORY_ITEM_UNKNOWN')
        throw new Error('REGION_LOOT_UNKNOWN');
      throw error;
    }
  }
  if (anchor.class === 'NpcSpawn') {
    const binding = runtime.dialogues?.find((entry) => entry.sceneId === state.world.navigation.locationId &&
      entry.anchorId === anchor.id);
    if (!binding) throw new Error('REGION_INTERACTION_UNSUPPORTED');
    const invalid = dialogueHandler.validate(state, { t: 'dialogue/start', storyId: binding.storyId,
      entryKey: binding.entryKey }, content); if (invalid) throw new Error(invalid);
  }
}

function consume(tx: CoreTransaction, anchorId: string): void {
  tx.set(['world', 'navigation', 'mountedRegion'],
    consumeRegionEntity(mounted(tx.state), anchorId));
}
function emitCheckpoint(tx: CoreTransaction, anchorId: string, kind: 'autosave' | 'safe'): void {
  if (tx.state.dialogue !== null || tx.state.world.navigation.pendingMount !== null) return;
  tx.emit({ t: kind === 'autosave' ? 'world/autosaveRequested' : 'world/safeAnchorReached',
    payload: { regionId: mounted(tx.state).regionId, sceneId: tx.state.world.navigation.locationId,
      anchorId } });
}
function applyMount(tx: CoreTransaction, command: Extract<RegionCommand, { t: 'world/mountRegion' }>): void {
  const spawn = regionObjects(region(tx.content), command.sceneId).find((object) =>
    object.class === 'PlayerSpawn' && object.id === command.spawnId);
  if (!spawn || spawn.class !== 'PlayerSpawn') throw new TypeError('REGION_SPAWN_INVARIANT');
  tx.set(['world', 'navigation'], { locationId: command.sceneId, selectedDestinationId: null,
    pendingMount: null, mountedRegion: { regionId: command.regionId, spawnId: command.spawnId,
      playerHex: { q: spawn.q, r: spawn.r }, facing: (spawn.facing ?? 0) as 0 | 1 | 2 | 3 | 4 | 5,
      dynamicTiles: [], entities: [] } });
  tx.emit({ t: 'world/regionMounted', payload: { regionId: command.regionId,
    sceneId: command.sceneId, spawnId: command.spawnId } });
  if (spawn.safe) emitCheckpoint(tx, spawn.id, 'safe');
}
function applyWalk(tx: CoreTransaction, command: Extract<RegionCommand, { t: 'world/walkTo' }>): void {
  const runtime = currentRegion(tx.state, tx.content); const current = mounted(tx.state);
  const path = previewRegionPath(tx.state, runtime, command.hex)!;
  const triggers = reachedRegionTriggers(tx.state, runtime, path.path);
  let next = { ...current, playerHex: command.hex, facing: path.facing };
  for (const trigger of triggers) if (trigger.once) next = consumeRegionEntity(next, trigger.id);
  tx.set(['world', 'navigation', 'mountedRegion'], next);
  tx.emit({ t: 'world/walked', payload: { regionId: current.regionId,
    sceneId: tx.state.world.navigation.locationId, destination: { ...command.hex },
    facing: path.facing, cost: path.cost, path: path.path.map((cell) => ({ ...cell })) } });
  for (const object of triggers) {
      tx.emit({ t: 'world/triggered', payload: { anchorId: object.id,
        eventId: object.eventId ?? null, action: object.action ?? null } });
      if (object.safe) emitCheckpoint(tx, object.id, 'safe');
      if (object.autosave) emitCheckpoint(tx, object.id, 'autosave');
  }
}
function applyInteract(tx: CoreTransaction, command: Extract<RegionCommand, { t: 'world/interact' }>): void {
  const runtime = currentRegion(tx.state, tx.content); const sceneId = tx.state.world.navigation.locationId;
  const anchor = regionObjects(runtime, sceneId).find((object) => object.id === command.anchorId)!;
  if (anchor.class === 'NpcSpawn') {
    const binding = runtime.dialogues!.find((entry) => entry.sceneId === sceneId &&
      entry.anchorId === anchor.id)!;
    dialogueHandler.apply(tx, { t: 'dialogue/start', storyId: binding.storyId,
      entryKey: binding.entryKey }); return;
  }
  if (anchor.class === 'Chest') {
    const loot = runtime.loot!.find((entry) => entry.lootRef === anchor.lootRef)!;
    let inventory = tx.state.party.inventory;
    for (const item of loot.items) inventory = addInventory(inventory, tx.content.items ?? [],
      item.itemId, item.count);
    tx.set(['party', 'inventory'], inventory); consume(tx, anchor.id);
    tx.emit({ t: 'world/chestOpened', payload: { anchorId: anchor.id, items: loot.items } }); return;
  }
  if (anchor.class === 'Door') {
    emitCheckpoint(tx, anchor.id, 'autosave');
    tx.set(['world', 'navigation', 'pendingMount'], { regionId: anchor.targetRegionId,
      sceneId: anchor.targetSceneId, spawnId: anchor.targetSpawnId });
    tx.emit({ t: 'world/regionRequested', payload: { fromRegionId: mounted(tx.state).regionId,
      fromSceneId: sceneId, anchorId: anchor.id, regionId: anchor.targetRegionId,
      sceneId: anchor.targetSceneId, spawnId: anchor.targetSpawnId } }); return;
  }
  if (anchor.class === 'QinggongGate') {
    tx.set(['world', 'navigation', 'pendingMount'], { regionId: anchor.to.region,
      sceneId: anchor.to.scene, spawnId: null, targetHex: anchor.to.cell });
    tx.emit({ t: 'world/regionRequested', payload: { fromRegionId: mounted(tx.state).regionId,
      fromSceneId: sceneId, anchorId: anchor.id, regionId: anchor.to.region,
      sceneId: anchor.to.scene, spawnId: null, targetHex: anchor.to.cell } }); return;
  }
  if (anchor.class === 'Trigger') {
    if (anchor.once) consume(tx, anchor.id);
    tx.emit({ t: 'world/triggered', payload: { anchorId: anchor.id,
      eventId: anchor.eventId ?? null, action: anchor.action ?? null } });
    if (anchor.safe) emitCheckpoint(tx, anchor.id, 'safe');
    if (anchor.autosave) emitCheckpoint(tx, anchor.id, 'autosave'); return;
  }
  if (anchor.class !== 'BattleArena') throw new TypeError('REGION_INTERACTION_INVARIANT');
  tx.emit({ t: 'world/battleRequested', payload: { anchorId: anchor.id,
    encounterId: anchor.encounterId ?? null } });
}

export const regionHandler: CommandHandler<RegionCommand> = {
  validate(state, command, content) {
    try {
      if (command.t === 'world/mountRegion') mount(state, command, content);
      else if (command.t === 'world/walkTo') walk(state, command, content);
      else interact(state, command, content);
      return null;
    } catch (error) {
      if (error instanceof Error) return error.message as ReturnType<CommandHandler['validate']>;
      throw error;
    }
  },
  apply(tx, command) {
    if (command.t === 'world/mountRegion') applyMount(tx, command);
    else if (command.t === 'world/walkTo') applyWalk(tx, command);
    else applyInteract(tx, command);
  },
};
