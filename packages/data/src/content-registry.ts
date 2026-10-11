import { isNode, LineCounter, parseAllDocuments, visit } from 'yaml';
import type { ZodType } from 'zod';
import {
  AcupointDefSchema,
  ChapterDefSchema,
  CharacterTemplateSchema,
  EventDefSchema,
  FacilityDialogueSchema,
  ItemDefSchema,
  MartialArtDefSchema,
  MeridianDefSchema,
  MeridianTopologyCatalogSchema,
  NpcDefSchema,
  SectCatalogSchema,
  ShopDefSchema,
  ShopTemplateSchema,
  PriceTableSchema,
  MoveDefSchema,
  QuestDefSchema,
  RegionDialogueBindingSchema,
  RegionGateBindingSchema,
  RegionLootBindingSchema,
  StoryLineSchema,
  TownRuntimeSchema,
  TownFacilitiesSchema,
  WorldMapRegistrationSchema,
  RoleSlotDefSchema,
  type AcupointDef,
  type ChapterDef,
  type CharacterTemplate,
  type EventDef,
  type FacilityDialogueDef,
  type ItemDef,
  type MartialArtDef,
  type MeridianDef,
  type MeridianTopologyCatalog,
  type NpcDef,
  type SectCatalog,
  type MoveDef,
  type QuestDef,
  type ShopDef,
  type ShopTemplateDef,
  type PriceTableDef,
  type StoryLine,
  type TownRuntimeDefinition,
  type TownFacilitiesDef,
  type RoleSlotDef,
  type RegionDialogueBindingDef,
  type RegionGateBindingDef,
  type RegionLootBindingDef,
} from './schemas';
import { EncounterDefSchema, type EncounterDef } from './schemas/encounter';

export type ContentKind =
  | 'npc'
  | 'characterTemplate'
  | 'martialArt'
  | 'move'
  | 'quest'
  | 'meridian'
  | 'acupoint'
  | 'item'
  | 'shop'
  | 'shopTemplate'
  | 'priceTable'
  | 'townFacility'
  | 'facilityDialogue'
  | 'story'
  | 'event'
  | 'bookWorld'
  | 'town'
  | 'roleSlot'
  | 'regionGate'
  | 'regionDialogue'
  | 'regionLoot'
  | 'encounter';
export type RegisteredContentKind = ContentKind;
export interface ContentFile {
  readonly path: string;
  readonly text: string;
}
export interface ContentEntry {
  readonly path: string;
  readonly kind: RegisteredContentKind;
  readonly value: unknown;
}
export interface ContentSourcePosition {
  readonly line: number;
  readonly column: number;
}
export interface ShopFacilityReferenceContext {
  readonly inks?: readonly { readonly storyId: string; readonly structure: {
    readonly chapter: string; readonly entryKnots: readonly string[];
  } }[];
}
export interface ParsedYamlFile {
  readonly value: unknown;
  position(path: readonly (string | number)[]): ContentSourcePosition;
}
export class ContentYamlError extends TypeError {
  constructor(
    message: string,
    readonly line: number,
    readonly column: number,
  ) {
    super(message);
  }
}

const SCHEMAS: Readonly<Record<RegisteredContentKind, ZodType>> = {
  npc: NpcDefSchema,
  characterTemplate: CharacterTemplateSchema,
  martialArt: MartialArtDefSchema,
  move: MoveDefSchema,
  quest: QuestDefSchema,
  encounter: EncounterDefSchema,
  meridian: MeridianDefSchema,
  acupoint: AcupointDefSchema,
  item: ItemDefSchema,
  shop: ShopDefSchema,
  shopTemplate: ShopTemplateSchema,
  priceTable: PriceTableSchema,
  townFacility: TownFacilitiesSchema,
  facilityDialogue: FacilityDialogueSchema,
  story: StoryLineSchema,
  event: EventDefSchema,
  bookWorld: ChapterDefSchema,
  town: TownRuntimeSchema,
  roleSlot: RoleSlotDefSchema,
  regionGate: RegionGateBindingSchema,
  regionDialogue: RegionDialogueBindingSchema,
  regionLoot: RegionLootBindingSchema,
};
const KIND_ORDER: readonly RegisteredContentKind[] = [
  'npc',
  'characterTemplate',
  'roleSlot',
  'martialArt',
  'move',
  'encounter',
  'quest',
  'meridian',
  'acupoint',
  'item',
  'shop',
  'shopTemplate',
  'priceTable',
  'townFacility',
  'facilityDialogue',
  'story',
  'event',
  'bookWorld',
  'town',
  'regionGate',
  'regionDialogue',
  'regionLoot',
];
function schemaFor(kind: RegisteredContentKind, value: unknown): ZodType {
  if (kind === 'event' && typeof value === 'object' && value !== null) {
    const version = (value as Record<string, unknown>)['schemaVersion'];
    if (version === 'meridian-topology.v1') return MeridianTopologyCatalogSchema;
    if (version === 'sect-catalog.v1') return SectCatalogSchema;
  }
  if (
    kind === 'event' &&
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>)['event'] === 'world/mapRegistered'
  )
    return WorldMapRegistrationSchema;
  return SCHEMAS[kind];
}

export function parseYamlFileWithLocations(file: ContentFile): ParsedYamlFile {
  const lines = new LineCounter();
  const documents = parseAllDocuments(file.text, {
    lineCounter: lines,
    schema: 'core',
    strict: true,
    uniqueKeys: true,
  });
  if (documents.length !== 1) throw new TypeError(`CONTENT_ONE_DOCUMENT:${file.path}`);
  const document = documents[0]!;
  if (document.errors.length > 0) {
    const error = document.errors[0]!;
    const position = error.linePos?.[0] ?? { line: 1, col: 1 };
    throw new ContentYamlError(
      `CONTENT_YAML:${file.path}:${error.message}`,
      position.line,
      position.col,
    );
  }
  let hasAlias = false;
  visit(document, {
    Alias: () => {
      hasAlias = true;
    },
  });
  if (hasAlias) throw new TypeError(`CONTENT_ALIAS:${file.path}`);
  const value = document.toJS({ maxAliasCount: 0 });
  assertJsonValue(value, file.path);
  return {
    value,
    position(path) {
      const candidate = [...path];
      while (candidate.length > 0) {
        const node = document.getIn(candidate, true);
        if (isNode(node) && node.range !== undefined && node.range !== null) {
          const position = lines.linePos(node.range[0]);
          return { line: position.line, column: position.col };
        }
        candidate.pop();
      }
      return { line: 1, column: 1 };
    },
  };
}

export function parseYamlFile(file: ContentFile): unknown {
  return parseYamlFileWithLocations(file).value;
}

function assertJsonValue(value: unknown, path: string): void {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`CONTENT_NUMBER:${path}`);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) assertJsonValue(entry, path);
    return;
  }
  if (typeof value !== 'object') throw new TypeError(`CONTENT_JSON:${path}`);
  for (const entry of Object.values(value)) assertJsonValue(entry, path);
}

export function identifyContentKind(value: unknown, path: string): RegisteredContentKind {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError(`CONTENT_ROOT:${path}`);
  const version = (value as Record<string, unknown>)['schemaVersion'];
  const kinds: Readonly<Record<string, RegisteredContentKind>> = {
    'npc.v1': 'npc',
    'character-template.v1': 'characterTemplate',
    'role-slot.v1': 'roleSlot',
    'martial-art.v1': 'martialArt',
    'meridian.v1': 'meridian',
    'acupoint.v2': 'acupoint',
    'move.v1': 'move',
    'quest.v1': 'quest',
    'encounter.v1': 'encounter',
    'item.v1': 'item',
    'shop.v1': 'shop',
    'shop-template.v1': 'shopTemplate',
    'price-table.v1': 'priceTable',
    'town-facilities.v1': 'townFacility',
    'facility-dialogue.v1': 'facilityDialogue',
    'story.v1': 'story',
    'event.v1': 'event',
    'meridian-topology.v1': 'event',
    'sect-catalog.v1': 'event',
    'book-world.v1': 'bookWorld',
    'town-runtime.v1': 'town',
    'region-gate.v1': 'regionGate',
    'region-dialogue.v1': 'regionDialogue',
    'region-loot.v1': 'regionLoot',
  };
  const kind = typeof version === 'string' ? kinds[version] : undefined;
  if (kind === undefined) throw new TypeError(`CONTENT_SCHEMA_VERSION:${path}:${String(version)}`);
  return kind;
}

export function parseContentFile(file: ContentFile): ContentEntry {
  const value = parseYamlFile(file);
  const kind = identifyContentKind(value, file.path);
  return { path: file.path, kind, value: schemaFor(kind, value).parse(value) };
}

export function serializeContentEntry(entry: ContentEntry): string {
  const reparsed = schemaFor(entry.kind, entry.value).parse(entry.value);
  return JSON.stringify(reparsed);
}

export function parseSerializedContent(
  kind: RegisteredContentKind,
  text: string,
  path = '<serialized>',
): ContentEntry {
  const value: unknown = JSON.parse(text);
  return { path, kind, value: schemaFor(kind, value).parse(value) };
}

export function contentKindOrder(kind: RegisteredContentKind): number {
  return KIND_ORDER.indexOf(kind);
}

/** Cross-file checks shared by the loader and focused schema tooling. */
export function validateShopFacilityReferences(
  entries: readonly ContentEntry[], context: ShopFacilityReferenceContext = {},
): void {
  const itemIds = new Set(entries.filter((entry) => entry.kind === 'item')
    .map((entry) => (entry.value as ItemDef).id));
  const templateKeys = new Set(entries.filter((entry) =>
    (entry.value as { schemaVersion?: string }).schemaVersion === 'shop-template.v1')
    .map((entry) => (entry.value as ShopTemplateDef).key));
  const townsByLayout = new Map<string, TownRuntimeDefinition>(
    entries.filter((entry) => entry.kind === 'town')
    .map((entry) => {
      const town = entry.value as TownRuntimeDefinition;
      return [`${town.cityId}__${town.chapterId}`, town] as const;
    }),
  );
  const inkStories = context.inks === undefined ? undefined :
    new Map(context.inks.map((ink) => [ink.storyId, ink.structure]));
  for (const entry of entries) {
    const version = (entry.value as { schemaVersion?: string }).schemaVersion;
    if (version === 'shop-template.v1') {
      const template = entry.value as ShopTemplateDef;
      for (const row of template.supply) if (!itemIds.has(row.itemId))
        throw new TypeError(`CONTENT_REF:${entry.path}:item:${row.itemId}`);
    }
    if (version === 'town-facilities.v1') {
      const facilities = entry.value as TownFacilitiesDef;
      const runtime = townsByLayout.get(facilities.layoutKey);
      const buildingIds = runtime === undefined ? undefined :
        new Set(runtime.buildings.map((building) => building.id));
      for (const facility of facilities.facilities) {
        if (facility.shop !== null && !templateKeys.has(facility.shop.templateRef))
          throw new TypeError(
            `CONTENT_REF:${entry.path}:shopTemplate:${facility.shop.templateRef}`,
          );
        if (buildingIds !== undefined && !buildingIds.has(facility.buildingId))
          throw new TypeError(
            `FACILITY_BUILDING_UNKNOWN:${facilities.layoutKey}:${facility.buildingId}`,
          );
      }
    }
    if (version === 'facility-dialogue.v1' && inkStories !== undefined) {
      const dialogue = entry.value as FacilityDialogueDef;
      for (const binding of dialogue.bindings) {
        const story = inkStories.get(binding.storyId);
        if (story === undefined)
          throw new TypeError(`CONTENT_REF:${entry.path}:inkStory:${binding.storyId}`);
        if (binding.chapter !== 'common' && story.chapter !== binding.chapter)
          throw new TypeError(
            `CONTENT_REF:${entry.path}:inkChapter:${binding.storyId}:${binding.chapter}`,
          );
        if (!story.entryKnots.includes(binding.entryKey))
          throw new TypeError(`CONTENT_REF:${entry.path}:inkKnot:${binding.storyId}:${binding.entryKey}`);
      }
    }
  }
}

export interface ContentValues {
  readonly npcs: readonly NpcDef[];
  readonly characterTemplates: readonly CharacterTemplate[];
  readonly martialArts: readonly MartialArtDef[];
  readonly meridians: readonly MeridianDef[];
  readonly moves: readonly MoveDef[];
  readonly quests: readonly QuestDef[];
  readonly encounters: readonly EncounterDef[];
  readonly roleSlots: readonly RoleSlotDef[];
  readonly acupoints: readonly AcupointDef[];
  readonly items: readonly ItemDef[];
  readonly shops: readonly ShopDef[];
  readonly shopTemplates: readonly ShopTemplateDef[];
  readonly priceTables: readonly PriceTableDef[];
  readonly townFacilities: readonly TownFacilitiesDef[];
  readonly facilityDialogues: readonly FacilityDialogueDef[];
  readonly stories: readonly StoryLine[];
  readonly events: readonly (EventDef | MeridianTopologyCatalog | SectCatalog)[];
  readonly bookWorlds: readonly ChapterDef[];
  readonly chapters: readonly ChapterDef[];
  readonly towns: readonly TownRuntimeDefinition[];
  readonly regionGates: readonly RegionGateBindingDef[];
  readonly regionDialogues: readonly RegionDialogueBindingDef[];
  readonly regionLoot: readonly RegionLootBindingDef[];
}
