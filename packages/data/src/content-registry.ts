import { parseAllDocuments, visit } from 'yaml';
import type { ZodType } from 'zod';
import {
  AcupointDefSchema, ChapterDefSchema, CharacterTemplateSchema, EventDefSchema,
  EncounterDefSchema,
  ItemDefSchema, MartialArtDefSchema, MeridianDefSchema, NpcDefSchema, ShopDefSchema,
  MoveDefSchema, QuestDefSchema, RegionDialogueBindingSchema, RegionGateBindingSchema,
  RegionLootBindingSchema, StoryLineSchema, TownRuntimeSchema, WorldMapRegistrationSchema,
  RoleSlotDefSchema,
  type AcupointDef, type ChapterDef, type CharacterTemplate,
  type EncounterDef,
  type EventDef, type ItemDef, type MartialArtDef, type MeridianDef, type NpcDef,
  type MoveDef, type QuestDef, type ShopDef, type StoryLine, type TownRuntimeDefinition,
  type RoleSlotDef,
  type RegionDialogueBindingDef, type RegionGateBindingDef, type RegionLootBindingDef,
} from './schemas';

export type ContentKind = 'npc' | 'characterTemplate' | 'martialArt' | 'move' | 'quest' |
  'meridian' | 'acupoint' | 'item' | 'shop' | 'story' | 'event' | 'bookWorld' | 'town' |
  'roleSlot' | 'regionGate' | 'regionDialogue' | 'regionLoot';
export type RegisteredContentKind = ContentKind | 'encounter';
export interface ContentFile { readonly path: string; readonly text: string; }
export interface ContentEntry { readonly path: string; readonly kind: ContentKind; readonly value: unknown; }

const SCHEMAS: Readonly<Record<RegisteredContentKind, ZodType>> = {
  npc: NpcDefSchema, characterTemplate: CharacterTemplateSchema, martialArt: MartialArtDefSchema,
  move: MoveDefSchema, quest: QuestDefSchema, encounter: EncounterDefSchema,
  meridian: MeridianDefSchema, acupoint: AcupointDefSchema, item: ItemDefSchema, shop: ShopDefSchema,
  story: StoryLineSchema, event: EventDefSchema, bookWorld: ChapterDefSchema, town: TownRuntimeSchema,
  roleSlot: RoleSlotDefSchema,
  regionGate: RegionGateBindingSchema, regionDialogue: RegionDialogueBindingSchema,
  regionLoot: RegionLootBindingSchema,
};
const KIND_ORDER: readonly RegisteredContentKind[] = [
  'npc', 'characterTemplate', 'roleSlot', 'martialArt', 'move', 'encounter', 'quest', 'meridian',
  'acupoint', 'item', 'shop', 'story', 'event', 'bookWorld', 'town', 'regionGate',
  'regionDialogue', 'regionLoot',
];
function schemaFor(kind: RegisteredContentKind, value: unknown): ZodType {
  if (kind === 'event' && typeof value === 'object' && value !== null &&
      (value as Record<string, unknown>)['event'] === 'world/mapRegistered')
    return WorldMapRegistrationSchema;
  return SCHEMAS[kind];
}

export function parseYamlFile(file: ContentFile): unknown {
  const documents = parseAllDocuments(file.text, { schema: 'core', strict: true, uniqueKeys: true });
  if (documents.length !== 1) throw new TypeError(`CONTENT_ONE_DOCUMENT:${file.path}`);
  const document = documents[0]!;
  if (document.errors.length > 0) throw new TypeError(`CONTENT_YAML:${file.path}:${document.errors[0]!.message}`);
  let hasAlias = false;
  visit(document, { Alias: () => { hasAlias = true; } });
  if (hasAlias) throw new TypeError(`CONTENT_ALIAS:${file.path}`);
  const value = document.toJS({ maxAliasCount: 0 });
  assertJsonValue(value, file.path);
  return value;
}

function assertJsonValue(value: unknown, path: string): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`CONTENT_NUMBER:${path}`);
    return;
  }
  if (Array.isArray(value)) { for (const entry of value) assertJsonValue(entry, path); return; }
  if (typeof value !== 'object') throw new TypeError(`CONTENT_JSON:${path}`);
  for (const entry of Object.values(value)) assertJsonValue(entry, path);
}

export function identifyContentKind(value: unknown, path: string): RegisteredContentKind {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError(`CONTENT_ROOT:${path}`);
  const version = (value as Record<string, unknown>)['schemaVersion'];
  const kinds: Readonly<Record<string, RegisteredContentKind>> = {
    'npc.v1': 'npc', 'character-template.v1': 'characterTemplate', 'role-slot.v1': 'roleSlot',
    'martial-art.v1': 'martialArt', 'meridian.v1': 'meridian', 'acupoint.v2': 'acupoint',
    'move.v1': 'move', 'quest.v1': 'quest',
    'encounter.v1': 'encounter',
    'item.v1': 'item', 'shop.v1': 'shop', 'story.v1': 'story', 'event.v1': 'event',
    'book-world.v1': 'bookWorld', 'town-runtime.v1': 'town',
    'region-gate.v1': 'regionGate', 'region-dialogue.v1': 'regionDialogue',
    'region-loot.v1': 'regionLoot',
  };
  const kind = typeof version === 'string' ? kinds[version] : undefined;
  if (kind === undefined) throw new TypeError(`CONTENT_SCHEMA_VERSION:${path}:${String(version)}`);
  return kind;
}

export function parseContentFile(file: ContentFile): ContentEntry {
  const value = parseYamlFile(file);
  const kind = identifyContentKind(value, file.path);
  return { path: file.path, kind: kind as ContentKind, value: schemaFor(kind, value).parse(value) };
}

export function serializeContentEntry(entry: ContentEntry): string {
  const reparsed = schemaFor(entry.kind, entry.value).parse(entry.value);
  return JSON.stringify(reparsed);
}

export function parseSerializedContent(kind: RegisteredContentKind, text: string, path = '<serialized>'): ContentEntry {
  const value: unknown = JSON.parse(text);
  return { path, kind: kind as ContentKind, value: schemaFor(kind, value).parse(value) };
}

export function contentKindOrder(kind: RegisteredContentKind): number {
  return KIND_ORDER.indexOf(kind);
}

export interface ContentValues {
  readonly npcs: readonly NpcDef[]; readonly characterTemplates: readonly CharacterTemplate[];
  readonly martialArts: readonly MartialArtDef[]; readonly meridians: readonly MeridianDef[];
  readonly moves: readonly MoveDef[]; readonly quests: readonly QuestDef[];
  readonly encounters: readonly EncounterDef[];
  readonly roleSlots: readonly RoleSlotDef[];
  readonly acupoints: readonly AcupointDef[]; readonly items: readonly ItemDef[];
  readonly shops: readonly ShopDef[]; readonly stories: readonly StoryLine[];
  readonly events: readonly EventDef[]; readonly bookWorlds: readonly ChapterDef[];
  readonly chapters: readonly ChapterDef[];
  readonly towns: readonly TownRuntimeDefinition[];
  readonly regionGates: readonly RegionGateBindingDef[];
  readonly regionDialogues: readonly RegionDialogueBindingDef[];
  readonly regionLoot: readonly RegionLootBindingDef[];
}
