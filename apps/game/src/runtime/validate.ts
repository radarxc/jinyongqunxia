import { CORE_VERSION, EQUIPMENT_SLOTS, InventoryRuntime, RNG_PROTOCOL, parseGameState, type CharacterState } from '@tianshu/core';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { equipmentRules, type GameContent } from './content';
import type { SessionSnapshot } from './contracts';

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
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

export function validateSession(value: SessionSnapshot, content: GameContent): SessionSnapshot {
  if (!value || value.schema !== 'ui-session.v1') throw new Error('SAVE_VERSION_UNSUPPORTED');
  const copy = JSON.parse(canonicalJson(value as unknown as JsonValue)) as SessionSnapshot;
  const state = parseGameState(copy.state);
  if (state.meta.coreVersion !== CORE_VERSION || state.meta.rngProtocol !== RNG_PROTOCOL)
    throw new Error('SAVE_VERSION_UNSUPPORTED');
  if (typeof copy.location !== 'string' || typeof copy.preview !== 'boolean' || !Array.isArray(copy.known) ||
      Object.keys(copy).some((key) => !['schema', 'state', 'known', 'usage', 'itemTargets', 'location', 'preview'].includes(key)))
    throw new Error('SAVE_SESSION_INVALID');
  new InventoryRuntime(state.party.inventory, content.items);
  const slots = state.party.equipment.entries;
  if (slots.length !== EQUIPMENT_SLOTS.length || new Set(slots.map((entry) => entry.slot)).size !== slots.length ||
      slots.some((entry) => !EQUIPMENT_SLOTS.includes(entry.slot) || (entry.itemId !== null && !content.items.some((item) => item.id === entry.itemId))))
    throw new Error('SAVE_EQUIPMENT_INVALID');
  const rules = new Map(equipmentRules(content).map((rule) => [rule.itemId, rule]));
  const main = slots.find((entry) => entry.slot === 'mainHand')?.itemId;
  const offhand = slots.find((entry) => entry.slot === 'offHand')?.itemId;
  for (const entry of slots) {
    if (entry.itemId === null) continue;
    const rule = rules.get(entry.itemId);
    if (!rule || (rule.slot !== entry.slot && !(rule.hands === 'pair' && entry.slot === 'offHand' && main === entry.itemId)))
      throw new Error('SAVE_EQUIPMENT_INVALID');
    if (rule.hands === 'pair' && (main !== entry.itemId || offhand !== entry.itemId)) throw new Error('SAVE_EQUIPMENT_INVALID');
  }
  if (main && rules.get(main)?.hands === 2 && offhand && rules.get(offhand)?.offHandRole !== 'hiddenCarrier')
    throw new Error('SAVE_EQUIPMENT_INVALID');
  const party = [state.profile.protagonist, ...state.profile.companions].filter((entry): entry is CharacterState => entry !== null);
  if (new Set(party.map((entry) => entry.characterId)).size !== party.length) throw new Error('SAVE_CHARACTER_INVALID');
  for (const character of party) validateReferences(character, content);
  const ids = new Set<string>();
  for (const known of copy.known) {
    if (!known || ids.has(known.npcId) || !content.npcs.some((npc) => npc.id === known.npcId) ||
        !['met', 'befriended'].includes(known.relationship) || !Number.isSafeInteger(known.affinity) || Math.abs(known.affinity) > 100)
      throw new Error('SAVE_ENCOUNTER_INVALID');
    ids.add(known.npcId);
    if (known.character !== null) {
      if (!record(known.character)) throw new Error('SAVE_CHARACTER_INVALID');
      if (known.character.characterId !== known.npcId) throw new Error('SAVE_CHARACTER_INVALID');
      parseGameState({ ...state, profile: { protagonist: known.character, companions: [] } });
      validateReferences(known.character, content);
    }
  }
  for (const counters of [copy.usage?.battleUses, copy.usage?.chapterUses, copy.usage?.lastBattleUseTurns ?? {}]) {
    if (!record(counters) || Object.entries(counters).some(([id, count]) =>
      !content.items.some((item) => item.id === id) || !Number.isSafeInteger(count) || (count as number) < 0))
      throw new Error('SAVE_USAGE_INVALID');
  }
  if (!copy.itemTargets || typeof copy.itemTargets !== 'object' || Array.isArray(copy.itemTargets))
    throw new Error('SAVE_TARGETS_INVALID');
  for (const [id, target] of Object.entries(copy.itemTargets)) {
    const character = [state.profile.protagonist, ...state.profile.companions].find((entry) => entry?.characterId === id);
    if (!character || !target || target.characterId !== id || typeof target.alive !== 'boolean' ||
        !Array.isArray(target.ailments) || !Array.isArray(target.temporaryEffects) || !Array.isArray(target.meridianAids) ||
        !record(target.permanentBonuses) || !record(target.permanentBonuses.stats)) throw new Error('SAVE_TARGETS_INVALID');
    for (const count of [target.hp, target.mp, target.hpMax, target.mpMax, target.stamina, target.staminaMax,
      target.permanentBonuses.hpMaxBp, target.permanentBonuses.mpMaxBp, ...Object.values(target.permanentBonuses.stats)])
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('SAVE_TARGETS_INVALID');
    if (target.hp > target.hpMax || target.mp > target.mpMax || target.stamina > target.staminaMax) throw new Error('SAVE_TARGETS_INVALID');
    parseGameState({ ...state, profile: { protagonist: { ...character, meridians: target.meridians }, companions: [] } });
    validateReferences({ ...character, meridians: target.meridians }, content);
    for (const ailment of target.ailments) if (!ailment || typeof ailment.tag !== 'string' || !Number.isSafeInteger(ailment.grade))
      throw new Error('SAVE_TARGETS_INVALID');
    for (const effect of target.temporaryEffects) if (!effect || typeof effect.op !== 'string' ||
      !Number.isSafeInteger(effect.grade) || !record(effect.params)) throw new Error('SAVE_TARGETS_INVALID');
    for (const aid of target.meridianAids) if (!aid || !content.items.some((item) => item.id === aid.sourceItemId) ||
      [aid.expiresAtTick, aid.rateBp, aid.successBp, aid.costReduceBp].some((count) => !Number.isSafeInteger(count) || count < 0) ||
      (aid.meridians !== undefined && (!Array.isArray(aid.meridians) || aid.meridians.some((id: unknown) => !content.topology.some((row) => row.id === id)))))
      throw new Error('SAVE_TARGETS_INVALID');
  }
  return { ...copy, state };
}
