import { EQUIPMENT_SLOTS, RNG_PROTOCOL, RULES_PROTOCOL, SAVE_SCHEMA, parseGameState,
  type CharacterState } from '@tianshu/core/state';
import { InventoryRuntime } from '@tianshu/core/inventory-runtime';
import { validateWorldMapState } from '@tianshu/core/projection';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { RegionMap, TownRuntimeDefinition } from '@tianshu/data/schemas';
import { equipmentRules, type GameContent } from './content';
import type { SessionSnapshot } from './contracts';

function validateSaveVersion(state: SessionSnapshot): void {
  const meta = state && typeof state === 'object'
    ? (state as { meta?: unknown }).meta
    : undefined;
  if (!meta || typeof meta !== 'object') throw new Error('SAVE_FORMAT_INVALID');
  const version = (meta as { saveSchema?: unknown }).saveSchema;
  if (typeof version !== 'number' || !Number.isSafeInteger(version))
    throw new Error('SAVE_FORMAT_INVALID');
  if (version > SAVE_SCHEMA) throw new Error('SAVE_TOO_NEW');
  if (version < SAVE_SCHEMA) throw new Error('SAVE_MIGRATION_REQUIRED');
  const protocols = meta as { rngProtocol?: unknown; rulesProtocol?: unknown };
  if (protocols.rngProtocol !== RNG_PROTOCOL || protocols.rulesProtocol !== RULES_PROTOCOL)
    throw new Error('SAVE_PROTOCOL_UNSUPPORTED');
}

function validateReferences(character: CharacterState, content: GameContent): void {
  const points = new Set(content.topology.flatMap((meridian) => meridian.points.map((point) => point.id)));
  if (character.skills.some((skill) => !content.skills.some((row) => row.id === skill.skillId)) ||
      new Set(character.skills.map((skill) => skill.skillId)).size !== character.skills.length ||
      character.meridians.opened.some((id) => !points.has(id)) ||
      Object.keys(character.meridians.targets).some((id) => !points.has(id)) ||
      Object.keys(character.meridians.meridianStats).some((id) => !content.topology.some((row) => row.id === id)))
    throw new Error('SAVE_CHARACTER_INVALID');
}

function validateParty(state: SessionSnapshot, content: GameContent): void {
  const party = [state.profile.protagonist, ...state.profile.companions]
    .filter((entry): entry is CharacterState => entry !== null);
  if (new Set(party.map((entry) => entry.characterId)).size !== party.length)
    throw new Error('SAVE_CHARACTER_INVALID');
  for (const character of party) validateReferences(character, content);
}

function validateChapterRuntime(state: SessionSnapshot, content: GameContent): void {
  const ids = new Set<string>();
  for (const known of state.chapter.npcs) {
    if (ids.has(known.npcId) || !content.npcs.some((npc) => npc.id === known.npcId))
      throw new Error('SAVE_ENCOUNTER_INVALID');
    ids.add(known.npcId);
    if (known.character) validateReferences(known.character, content);
  }
  for (const [id, count] of Object.entries(state.chapter.itemChapterUses)) {
    if (!content.items.some((item) => item.id === id) ||
        !Number.isSafeInteger(count) ||
        count < 0)
      throw new Error('SAVE_USAGE_INVALID');
  }
}
function regionObject(map: RegionMap, id: string) {
  return [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)]
    .find((object) => object.id === id);
}
function validRegionCell(map: RegionMap, q: number, r: number): boolean {
  if (q < 0 || r < 0 || q > map.bounds.qMax || r > map.bounds.rMax) return false;
  const chunk = map.chunks.find((entry) => entry.q === Math.floor(q / 32) &&
    entry.r === Math.floor(r / 32));
  if (!chunk) return false;
  const bytes = Uint8Array.from(atob(chunk.valid), (character) => character.charCodeAt(0));
  const index = (r % 32) * 32 + q % 32;
  return (bytes[index >> 3]! & (1 << (index & 7))) !== 0;
}
function validateRegion(state: SessionSnapshot, content: GameContent): void {
  const mounted = state.world.navigation.mountedRegion;
  if (!mounted) return;
  const map = content.regionMaps?.find((entry) => entry.id === state.world.navigation.locationId);
  const spawn = map && regionObject(map, mounted.spawnId);
  if (!map || map.regionId !== mounted.regionId || spawn?.class !== 'PlayerSpawn' ||
      !validRegionCell(map, mounted.playerHex.q, mounted.playerHex.r) ||
      mounted.dynamicTiles.some((tile) => !validRegionCell(map, tile.q, tile.r)) ||
      mounted.entities.some((entity) => !regionObject(map, entity.anchorId)))
    throw new Error('SAVE_REGION_INVALID');
}

export function validateSession(value: SessionSnapshot, content: GameContent,
  townDefinition?: TownRuntimeDefinition): SessionSnapshot {
  const copy = JSON.parse(canonicalJson(value as unknown as JsonValue)) as SessionSnapshot;
  validateSaveVersion(copy);
  const state = parseGameState(copy);
  if (content.contentHash && state.meta.contentHash !== content.contentHash)
    throw new Error('SAVE_CONTENT_HASH_INVALID');
  if (state.meta.coreVersion.length === 0) throw new Error('SAVE_VERSION_UNSUPPORTED');
  new InventoryRuntime(state.party.inventory, content.items);
  const slots = state.party.equipment.entries;
  if (slots.length !== EQUIPMENT_SLOTS.length || new Set(slots.map((entry) => entry.slot)).size !== slots.length ||
      slots.some((entry) => !EQUIPMENT_SLOTS.includes(entry.slot) ||
        (entry.itemId !== null && !content.items.some((item) => item.id === entry.itemId))))
    throw new Error('SAVE_EQUIPMENT_INVALID');
  const rules = new Map(equipmentRules(content).map((rule) => [rule.itemId, rule]));
  const main = slots.find((entry) => entry.slot === 'mainHand')?.itemId;
  const offhand = slots.find((entry) => entry.slot === 'offHand')?.itemId;
  for (const entry of slots) {
    if (entry.itemId === null) continue;
    const rule = rules.get(entry.itemId);
    const pairedOffhand = rule?.hands === 'pair' &&
      entry.slot === 'offHand' &&
      main === entry.itemId;
    if (!rule || (rule.slot !== entry.slot && !pairedOffhand))
      throw new Error('SAVE_EQUIPMENT_INVALID');
    if (rule.hands === 'pair' && (main !== entry.itemId || offhand !== entry.itemId))
      throw new Error('SAVE_EQUIPMENT_INVALID');
  }
  if (main && rules.get(main)?.hands === 2 && offhand && rules.get(offhand)?.offHandRole !== 'hiddenCarrier')
    throw new Error('SAVE_EQUIPMENT_INVALID');
  validateParty(state, content);
  validateChapterRuntime(state, content);
  validateRegion(state, content);
  const map = content.worldMaps?.find((entry) => entry.chapterId === state.chapter.chapterId);
  if ((state.chapter.worldMap === null) !== (map === undefined)) throw new Error('SAVE_WORLDMAP_INVALID');
  if (state.chapter.worldMap && map) validateWorldMapState(state.chapter.worldMap, map);
  const town = state.chapter.town;
  if (town) {
    const definition = townDefinition ?? content.towns?.find((entry) => entry.sceneId === town.sceneId);
    if (!definition || definition.revision !== town.townRevision ||
        definition.chapterId !== state.chapter.chapterId.slice(0, 4) ||
        !definition.navigation.nodes.some(([q, r]) => q === town.point[0] && r === town.point[1]) ||
        (town.buildingId !== null && !definition.buildings.some((entry) =>
          entry.id === town.buildingId && entry.enterable))) throw new Error('SAVE_TOWN_INVALID');
  }
  return state;
}
