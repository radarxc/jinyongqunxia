import type { JsonValue } from '@tianshu/shared';
import { CONTENT_HASH_PLACEHOLDER, RULES_PROTOCOL, SAVE_SCHEMA } from './initial';
import { cloneJsonValue } from './json';

export interface StateMigrationContext {
  readonly fromContentHash: string; readonly targetSchema: number; readonly remapVersion: string;
}
export type StateMigration = (old: JsonValue, context: StateMigrationContext) => JsonValue;
type Row = Record<string, JsonValue>;
function row(value: JsonValue, code: string): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(code);
  return value as Row;
}
function number(value: JsonValue | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : fallback;
}
function string(value: JsonValue | undefined, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}
function consumableFrom(target: Row | undefined): Row {
  return { stamina: number(target?.['stamina'], 0), staminaMax: number(target?.['staminaMax'], 0),
    ailments: target?.['ailments'] ?? [], temporaryEffects: target?.['temporaryEffects'] ?? [],
    permanentBonuses: target?.['permanentBonuses'] ?? { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
    meridianAids: target?.['meridianAids'] ?? [] };
}
function migrateCharacter(value: JsonValue, targets: Row): JsonValue {
  const character = row(value, 'MIGRATION_CHARACTER_INVALID');
  const id = string(character['characterId'], '');
  const targetValue = targets[id];
  const target = targetValue === undefined ? undefined : row(targetValue, 'MIGRATION_TARGET_INVALID');
  if (target && (target['characterId'] !== id || target['hp'] !== row(character['resources']!,
    'MIGRATION_CHARACTER_INVALID')['hp'] || target['mp'] !== row(character['resources']!,
    'MIGRATION_CHARACTER_INVALID')['mp'] || JSON.stringify(target['meridians']) !== JSON.stringify(character['meridians'])))
    throw new TypeError('MIGRATION_TARGET_CONFLICT');
  return { ...character, consumable: consumableFrom(target) };
}
function migrateKnown(value: JsonValue, targets: Row): JsonValue[] {
  if (!Array.isArray(value)) throw new TypeError('MIGRATION_KNOWN_INVALID');
  return value.map((entry) => {
    const known = row(entry, 'MIGRATION_KNOWN_INVALID');
    const npcId = string(known['npcId'], '');
    const character = known['character'];
    return { ...known, npcId,
      character: character === null ? null : migrateCharacter(character!, targets) };
  });
}
/** Pure migration for the historical ui-session.v1 application envelope and schema-1 GameState. */
export const migrateUiSessionV1: StateMigration = (old, context) => {
  const source = row(cloneJsonValue(old), 'MIGRATION_ROOT_INVALID');
  const legacy = source['schema'] === 'ui-session.v1';
  const game = row(legacy ? source['state']! : source, 'MIGRATION_STATE_INVALID');
  const meta = row(game['meta']!, 'MIGRATION_META_INVALID');
  const profile = row(game['profile']!, 'MIGRATION_PROFILE_INVALID');
  const chapter = row(game['chapter']!, 'MIGRATION_CHAPTER_INVALID');
  const oldTransient = row(game['transient'] ?? {}, 'MIGRATION_TRANSIENT_INVALID');
  const targets = legacy ? row(source['itemTargets'] ?? {}, 'MIGRATION_TARGETS_INVALID') : {};
  const protagonist = profile['protagonist'] === null ? null
    : migrateCharacter(profile['protagonist']!, targets);
  const companionsValue = profile['companions'];
  if (!Array.isArray(companionsValue)) throw new TypeError('MIGRATION_CHARACTER_INVALID');
  const companions = companionsValue.map((entry) => migrateCharacter(entry, targets));
  const known = migrateKnown(legacy ? source['known'] ?? [] : chapter['npcs'] ?? [], targets);
  const consumed = new Set([...(protagonist ? [row(protagonist, 'MIGRATION_CHARACTER_INVALID')['characterId']] : []),
    ...companions.map((entry) => row(entry, 'MIGRATION_CHARACTER_INVALID')['characterId']),
    ...known.flatMap((entry) => { const character = row(entry, 'MIGRATION_KNOWN_INVALID')['character'];
      return character === null ? [] : [row(character!, 'MIGRATION_CHARACTER_INVALID')['characterId']]; })]);
  if (Object.keys(targets).some((id) => !consumed.has(id))) throw new TypeError('MIGRATION_TARGET_ORPHAN');
  const usage = legacy ? row(source['usage'] ?? {}, 'MIGRATION_USAGE_INVALID') : {};
  const battleUses = row(usage['battleUses'] ?? {}, 'MIGRATION_USAGE_INVALID');
  if (Object.keys(battleUses).length > 0) throw new TypeError('MIGRATION_BATTLE_USES_ACTIVE');
  const worldMapValue = chapter['worldMap']; const worldMap = worldMapValue === null
    ? null : row(worldMapValue!, 'MIGRATION_WORLDMAP_INVALID');
  const locationId = worldMap?.['scene'] && row(worldMap['scene'], 'MIGRATION_WORLDMAP_INVALID')['nodeId']
    || (worldMap?.['position'] && row(worldMap['position'], 'MIGRATION_WORLDMAP_INVALID')['nodeId'])
    || 'city_dali';
  const masterSeed = number(meta['masterSeed'], 1);
  return { meta: { ...meta, saveSchema: SAVE_SCHEMA, masterSeed,
    runId: string(meta['runId'], `run_${masterSeed >>> 0}`),
    nextRuntimeOrdinal: number(meta['nextRuntimeOrdinal'], number(meta['stateVersion'], 0) + 1),
    contentHash: string(meta['contentHash'],
      string(context.fromContentHash, CONTENT_HASH_PLACEHOLDER)), rulesProtocol: RULES_PROTOCOL,
    coreBuild: string(meta['coreBuild'], string(meta['coreVersion'], '0.0.0')),
    debugTainted: meta['debugTainted'] === true || (legacy && source['preview'] === true) },
    profile: { ...profile, protagonist, companions },
    chapter: { ...chapter, npcs: known, itemChapterUses: row(usage['chapterUses'] ?? {},
      'MIGRATION_USAGE_INVALID') },
    world: { navigation: { locationId, selectedDestinationId: null },
      pendingTimeAdvance: oldTransient['pendingTimeAdvance'] ?? null },
    party: game['party']!,
    battle: game['battle'] ?? oldTransient['battle'] ?? null,
    dialogue: game['dialogue'] ?? oldTransient['dialogue'] ?? null };
};

export const CORE_STATE_MIGRATIONS: ReadonlyMap<number, StateMigration> = new Map([
  [1, migrateUiSessionV1],
]);
