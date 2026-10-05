import type { ContentSource } from '@tianshu/data';
import type { JsonValue } from '@tianshu/shared';
import { ChapterDefSchema, EventDefSchema, NpcAppearanceSchema, NpcIdSchema,
  RegionBindingLeafSchema, RegionMapSchema, WorldMapDefinitionSchema,
  type ChapterDef, type EventDef, type QuestDef, type RegionMap,
  type WorldMapRuntimeDefinition } from '@tianshu/data/item-content';
import type { RegionDialogueBinding, RegionGateBinding, RegionLootBinding } from '@tianshu/core';
import type { AssetMap, ChapterAssetLoader, ChapterRuntimeLeaf, GameBattleRow, GameContent,
  GameEncounterDef, GameNpcDef, StaticGameContent } from './content';

export const ITEM_CONTENT_CHAPTER = 'ch00_yuenv';
export const ITEM_TEXT_PLACEHOLDER = '正文载入中……';
export const itemContentChapter = (demo: boolean): string =>
  demo ? 'ch10_baima' : ITEM_CONTENT_CHAPTER;

export interface ItemText {
  readonly desc?: string | undefined;
  readonly lore?: string | undefined;
  readonly short?: string | undefined;
}

export class FetchContentSource implements ContentSource {
  public constructor(private readonly base = new URL('/content/',
    globalThis.location?.origin ?? 'http://localhost')) {}
  public async readJson(path: string): Promise<unknown> {
    const response = await fetch(new URL(path, this.base));
    if (!response.ok) throw new Error(`CONTENT_HTTP_${response.status}`);
    return response.json() as Promise<unknown>;
  }
}

function itemRuleName(name: string): boolean {
  return /^common\.rules\.items(?:\.p\d{3})?\.json$/u.test(name);
}
function chapterRuleName(name: string, chapter: string): boolean {
  return name.startsWith(`${chapter.slice(0, 4)}.rules.base`) && name.endsWith('.json');
}
function commonRuleName(name: string): boolean {
  return name.startsWith('common.rules.base') && name.endsWith('.json');
}
function roleRuleName(name: string, chapter: string): boolean {
  return name.startsWith(`${chapter.slice(0, 4)}.rules.roles`) && name.endsWith('.json');
}
function worldRuleName(name: string, chapter: string): boolean {
  return name === `world.rules.era.${chapter.slice(0, 4)}.json`;
}
function chapterTextName(name: string, chapter: string): boolean {
  return (name.startsWith(`${chapter.slice(0, 4)}.text.zh-Hans.base`) ||
    name.startsWith('common.text.zh-Hans')) && name.endsWith('.json') &&
    !itemTextName(name, 'zh-Hans');
}
function record(value: unknown, code: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new TypeError(code);
  return value as Record<string, unknown>;
}
function chapterText(leaves: Readonly<Record<string, unknown>>): Readonly<Record<string, string>> {
  const text: Record<string, string> = {};
  for (const [name, leaf] of Object.entries(leaves)) {
    if (!name.includes('.text.zh-Hans')) continue;
    for (const [key, value] of Object.entries(record(leaf, 'CONTENT_CHAPTER_TEXT_INVALID'))) {
      // Compiled Ink JSON shares this leaf; only scalar display strings are runtime text.
      if (typeof value !== 'string') continue;
      if (text[key] !== undefined && text[key] !== value)
        throw new TypeError(`CONTENT_CHAPTER_TEXT_INVALID:${key}`);
      text[key] = value;
    }
  }
  return text;
}
function textValue(value: unknown, text: Readonly<Record<string, string>>, required: boolean): string {
  if (typeof value === 'string') return value;
  const key = record(value, 'CONTENT_TEXT_REF_INVALID')['textKey'];
  if (typeof key !== 'string') throw new TypeError('CONTENT_TEXT_REF_INVALID');
  if (text[key] !== undefined) return text[key];
  if (!required) return key;
  throw new TypeError(`CONTENT_TEXT_REF_MISSING:${key}`);
}
function ruleRows(leaves: Readonly<Record<string, unknown>>): readonly {
  readonly kind?: unknown; readonly value?: unknown }[] {
  const rows = Object.values(leaves).flatMap((value) => Array.isArray(value) ? value : []);
  return rows.flatMap((row) => !row || typeof row !== 'object' || Array.isArray(row)
    ? [] : [row as { readonly kind?: unknown; readonly value?: unknown }]);
}
function chapterDefs(leaves: Readonly<Record<string, unknown>>): readonly ChapterDef[] {
  return ruleRows(leaves).flatMap((entry) => {
    return entry.kind === 'bookWorld' ? [ChapterDefSchema.parse(entry.value)] : [];
  });
}
function eventDefs(leaves: Readonly<Record<string, unknown>>): readonly EventDef[] {
  return ruleRows(leaves).flatMap((entry) =>
    entry.kind === 'event' && (entry.value as { schemaVersion?: unknown })?.schemaVersion === 'event.v1' &&
      (entry.value as { event?: unknown })?.event !== 'world/mapRegistered'
      ? [EventDefSchema.parse(entry.value)] : []);
}
function runtimeNpc(value: unknown, text: Readonly<Record<string, string>>): GameNpcDef {
  const row = record(value, 'CONTENT_CHAPTER_NPC_INVALID');
  const identity = record(row['identity'], 'CONTENT_CHAPTER_NPC_INVALID');
  const aliases = Array.isArray(identity['aliases']) ? identity['aliases']
    .map((alias) => textValue(alias, text, true)) : [];
  if (!Array.isArray(row['appearances'])) throw new TypeError('CONTENT_CHAPTER_NPC_INVALID');
  const appearances = row['appearances'].map((appearance) => {
    const compiled = record(appearance, 'CONTENT_CHAPTER_NPC_INVALID');
    return NpcAppearanceSchema.parse({ ...compiled,
      displayName: textValue(compiled['displayName'], text, true) });
  });
  const species = identity['species'] ?? 'human';
  if (!['human', 'animal', 'spirit', 'projection'].includes(String(species)))
    throw new TypeError('CONTENT_CHAPTER_NPC_INVALID');
  const gender = identity['gender'];
  if (gender !== undefined && gender !== 'male' && gender !== 'female')
    throw new TypeError('CONTENT_CHAPTER_NPC_INVALID');
  return { id: NpcIdSchema.parse(row['id']), identity: {
    name: textValue(identity['name'], text, true), aliases,
    species: species as GameNpcDef['identity']['species'],
    ...(gender === undefined ? {} : { gender }) }, appearances };
}
function runtimeWorldMap(value: unknown, text: Readonly<Record<string, string>>):
WorldMapRuntimeDefinition {
  const registration = record(value, 'CONTENT_CHAPTER_WORLDMAP_INVALID');
  const actions = registration['actions'];
  if (registration['event'] !== 'world/mapRegistered' || !Array.isArray(actions) ||
      actions.length !== 1)
    throw new TypeError('CONTENT_CHAPTER_WORLDMAP_INVALID');
  const action = record(actions[0], 'CONTENT_CHAPTER_WORLDMAP_INVALID');
  if (action['op'] !== 'mountWorldMap') throw new TypeError('CONTENT_CHAPTER_WORLDMAP_INVALID');
  const compiled = record(action['map'], 'CONTENT_CHAPTER_WORLDMAP_INVALID');
  const nodes = Array.isArray(compiled['nodes']) ? compiled['nodes'].map((value) => {
    const node = record(value, 'CONTENT_CHAPTER_WORLDMAP_INVALID');
    const entry = record(node['entry'], 'CONTENT_CHAPTER_WORLDMAP_INVALID');
    return { ...node, name: textValue(node['name'], text, true),
      levelNote: textValue(node['levelNote'], text, true),
      entry: { ...entry, accessNote: textValue(entry['accessNote'], text, true) },
      ...(node['accessNote'] === undefined ? {} : {
        accessNote: textValue(node['accessNote'], text, true) }),
      coordinateNote: '' };
  }) : compiled['nodes'];
  const roads = Array.isArray(compiled['roads'])
    ? compiled['roads'].map((road) => ({ ...record(road, 'CONTENT_CHAPTER_WORLDMAP_INVALID'), note: '' }))
    : compiled['roads'];
  const parsed = WorldMapDefinitionSchema.parse({ ...compiled,
    name: textValue(compiled['name'], text, true), nodes, roads,
    travel: { ...record(compiled['travel'], 'CONTENT_CHAPTER_WORLDMAP_INVALID'), note: '' },
    sources: [] });
  if (registration['chapterId'] !== parsed.chapterId ||
      registration['id'] !== `ev_${parsed.era.slice(2)}_ditu`)
    throw new TypeError('CONTENT_CHAPTER_WORLDMAP_INVALID');
  return { ...parsed, travel: { liPerHour: parsed.travel.liPerHour, stepLi: parsed.travel.stepLi },
    grid: { width: parsed.grid.width, height: parsed.grid.height },
    nodes: parsed.nodes.map(({ coordinateNote: _coordinateNote, ...node }) => node),
    roads: parsed.roads.map(({ note: _note, ...road }) => road) };
}
function chapterRuntime(leaves: Readonly<Record<string, unknown>>, chapter: string,
  mapText: Readonly<Record<string, string>> = {}): {
  readonly npcs: readonly GameNpcDef[]; readonly worldMaps: readonly WorldMapRuntimeDefinition[];
} {
  const rows = Object.values(leaves).flatMap((value) => Array.isArray(value) ? value : []);
  const text = chapterText(leaves);
  const npcs: GameNpcDef[] = []; const worldMaps: WorldMapRuntimeDefinition[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    const entry = row as { kind?: unknown; value?: unknown };
    if (entry.kind === 'npc') npcs.push(runtimeNpc(entry.value, text));
    if (entry.kind === 'event' && (entry.value as { event?: unknown })?.event === 'world/mapRegistered') {
      worldMaps.push(runtimeWorldMap(entry.value, { ...text, ...mapText }));
    }
  }
  if (npcs.some((npc) => !npc.appearances.some((appearance) => appearance.chapterId === chapter)) ||
      worldMaps.some((map) => map.chapterId !== chapter))
    throw new TypeError('CONTENT_CHAPTER_RUNTIME_MISMATCH');
  return { npcs, worldMaps };
}
function questDefs(leaves: Readonly<Record<string, unknown>>, chapter: string): readonly QuestDef[] {
  const quests: QuestDef[] = []; const ids = new Set<string>();
  for (const entry of ruleRows(leaves)) {
    if (entry.kind !== 'quest') continue;
    const value = record(entry.value, 'CONTENT_QUEST_ENVELOPE_INVALID');
    const id = value['id'];
    if (value['schemaVersion'] !== 'quest.v1' || typeof id !== 'string' ||
        !/^q_[a-z0-9]+(?:_[a-z0-9]+)*$/u.test(id) || value['chapterId'] !== chapter || ids.has(id))
      throw new TypeError(`CONTENT_QUEST_ENVELOPE_INVALID:${String(id)}`);
    ids.add(id); quests.push(value as unknown as QuestDef);
  }
  return quests;
}
function encounterDefs(leaves: Readonly<Record<string, unknown>>, chapter: string):
readonly GameEncounterDef[] {
  const encounters: GameEncounterDef[] = []; const ids = new Set<string>();
  for (const entry of ruleRows(leaves)) {
    if (entry.kind !== 'encounter') continue;
    const value = record(entry.value, 'CONTENT_ENCOUNTER_ENVELOPE_INVALID');
    const id = value['id']; const chapterId = value['chapterId'];
    if (value['schemaVersion'] !== 'encounter.v1' || typeof id !== 'string' ||
        !/^enc_[a-z0-9]+(?:_[a-z0-9]+)*$/u.test(id) || chapterId !== chapter || ids.has(id))
      throw new TypeError(`CONTENT_ENCOUNTER_ENVELOPE_INVALID:${String(id)}`);
    ids.add(id); encounters.push({ id: id as `enc_${string}`, chapterId,
      value: value as JsonValue });
  }
  return encounters;
}
function validateEncounterReferences(quests: readonly QuestDef[],
  encounters: readonly GameEncounterDef[]): void {
  if (encounters.length === 0) return;
  const ids = new Set(encounters.map((entry) => entry.id));
  for (const quest of quests) for (const id of quest.encounterIds)
    if (!ids.has(id as `enc_${string}`))
      throw new TypeError(`CONTENT_ENCOUNTER_REF_MISSING:${quest.id}:${id}`);
}
/**
 * Encounter resolver inputs are battle-only (AR-64): like encounters, they stay build-validated
 * JSON here and `encounter-runtime.ts` runs the full schemas after a battle is requested. Load time
 * only settles ids, chapter ownership and display text (move names need the chapter text leaves).
 */
function encounterResolverRows(leaves: Readonly<Record<string, unknown>>, chapter: string):
Pick<GameContent, 'templates' | 'roleSlots' | 'moves'> {
  const templates: GameBattleRow[] = []; const roleSlots: GameBattleRow[] = [];
  const moves: GameBattleRow[] = [];
  const text = chapterText(leaves);
  for (const entry of ruleRows(leaves)) {
    if (entry.kind !== 'characterTemplate' && entry.kind !== 'roleSlot' && entry.kind !== 'move')
      continue;
    const value = record(entry.value, 'CONTENT_ENCOUNTER_RUNTIME_INVALID');
    const id = entry.kind === 'roleSlot' ? value['slotId'] : value['id'];
    if (typeof id !== 'string') throw new TypeError('CONTENT_ENCOUNTER_RUNTIME_INVALID');
    if (entry.kind === 'roleSlot') {
      if (value['chapter'] !== chapter) throw new TypeError('CONTENT_ENCOUNTER_RUNTIME_MISMATCH');
      roleSlots.push({ id, value: value as JsonValue });
    } else if (entry.kind === 'move') {
      moves.push({ id, value: { ...value, name: textValue(value['name'], text, true) } as JsonValue });
    } else templates.push({ id, value: value as JsonValue });
  }
  return { ...(templates.length === 0 ? {} : { templates }),
    ...(roleSlots.length === 0 ? {} : { roleSlots }), ...(moves.length === 0 ? {} : { moves }) };
}
function inkStories(leaves: Readonly<Record<string, unknown>>): NonNullable<GameContent['inkStories']> {
  return ruleRows(leaves).flatMap((entry) => {
    if (entry.kind !== 'dialogueStructure') return [];
    const row = entry as unknown as { readonly storyId?: unknown; readonly storyHash?: unknown };
    if (typeof row.storyId !== 'string' || typeof row.storyHash !== 'string')
      throw new TypeError('CONTENT_INK_STRUCTURE_INVALID');
    const story = Object.values(leaves).find((value) => typeof value === 'object' &&
      value !== null && !Array.isArray(value) &&
      Object.hasOwn(value, `ink.${row.storyId}`)) as Record<string, unknown> | undefined;
    const storyJson = story?.[`ink.${row.storyId}`];
    if (typeof storyJson !== 'object' || storyJson === null || Array.isArray(storyJson))
      throw new TypeError(`CONTENT_INK_STORY_MISSING:${row.storyId}`);
    return [{ storyId: row.storyId, storyHash: row.storyHash,
      storyJson: storyJson as Readonly<Record<string, unknown>> }];
  });
}
function itemTextName(name: string, locale: string): boolean {
  const match = name.match(/^common\.text\.([A-Za-z0-9-]+)\.items(?:\.p\d{3})?\.json$/u);
  return match?.[1] === locale;
}
function loadError(code: string, error: unknown): Error {
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(`${code}:${detail}`, { cause: error });
}
function runtimeLeaf(value: AssetMap | ChapterRuntimeLeaf): ChapterRuntimeLeaf {
  if ('assets' in value && 'mapText' in value) return value as ChapterRuntimeLeaf;
  return { assets: value as AssetMap, mapText: {} };
}

export async function loadGameContent(base: StaticGameContent, source: ContentSource,
  chapter = ITEM_CONTENT_CHAPTER, loadAssets?: ChapterAssetLoader): Promise<GameContent> {
  try {
    const [{ loadChapterPackLeaves }, { parseItemRuleLeaves }] = await Promise.all([
      import('@tianshu/data'), import('@tianshu/data/item-content'),
    ]);
    const pack = await loadChapterPackLeaves(source, chapter, (leaf) =>
      leaf.kind === 'text' ? chapterTextName(leaf.logicalName, chapter) :
        itemRuleName(leaf.logicalName) || chapterRuleName(leaf.logicalName, chapter) ||
        commonRuleName(leaf.logicalName) || roleRuleName(leaf.logicalName, chapter) ||
        worldRuleName(leaf.logicalName, chapter));
    const names = pack.manifest.leaves.filter((leaf) => itemRuleName(leaf.logicalName))
      .map((leaf) => leaf.logicalName);
    const chapterNames = pack.manifest.leaves.filter((leaf) =>
      chapterRuleName(leaf.logicalName, chapter)).map((leaf) => leaf.logicalName);
    const chapterItems = ruleRows(Object.fromEntries(chapterNames.map((name) =>
      [name, pack.leaves[name]])))
      .filter((entry) => entry.kind === 'item');
    if (names.length === 0 && chapterItems.length === 0)
      throw new TypeError('CONTENT_ITEM_RULE_LEAF_MISSING');
    const itemLeaves = [...names.map((name) => pack.leaves[name])];
    if (chapterItems.length > 0) itemLeaves.push(chapterItems);
    const items = parseItemRuleLeaves(itemLeaves);
    const chapters = chapterDefs(pack.leaves);
    const events = eventDefs(pack.leaves);
    const quests = questDefs(pack.leaves, chapter);
    const encounters = encounterDefs(pack.leaves, chapter);
    validateEncounterReferences(quests, encounters);
    const stories = inkStories(pack.leaves);
    if (chapters.length !== 1 || chapters[0]?.id !== chapter)
      throw new TypeError('CONTENT_CHAPTER_DEF_MISSING');
    let assets: AssetMap | undefined;
    let mapText: Readonly<Record<string, string>> = {};
    let battleModels: ChapterRuntimeLeaf['battleModels'];
    try {
      const shared = loadAssets ? runtimeLeaf(await loadAssets('__shared__')) : undefined;
      const leaf = loadAssets ? runtimeLeaf(await loadAssets(chapter)) : undefined;
      assets = leaf ? { ...shared?.assets, ...leaf.assets } : base.assets;
      mapText = leaf?.mapText ?? {};
      battleModels = leaf?.battleModels;
    }
    catch (error) {
      if (error instanceof Error && error.message.endsWith('_SUBSYSTEM_UNAVAILABLE')) throw error;
      throw loadError('CHAPTER_ASSETS_UNAVAILABLE', error);
    }
    const runtime = chapterRuntime(pack.leaves, chapter, mapText);
    const resolverRows = encounterResolverRows(pack.leaves, chapter);
    return { ...base, ...runtime, ...resolverRows, ...(assets ? { assets } : {}),
      ...(battleModels ? { battleModels } : {}),
      items: items as GameContent['items'], chapters, events, quests,
      ...(encounters.length === 0 ? {} : { encounters }),
      ...(stories.length === 0 ? {} : { inkStories: stories }),
      idRemaps: pack.manifest.idRemaps, contentHash: pack.manifest.contentHash };
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('CHAPTER_ASSETS_UNAVAILABLE:') ||
        error.message.endsWith('_SUBSYSTEM_UNAVAILABLE')))
      throw error;
    throw loadError('ITEM_RULES_UNAVAILABLE', error);
  }
}

export interface RegionContentSlice {
  readonly maps: readonly RegionMap[]; readonly gates: readonly RegionGateBinding[];
  readonly dialogues: readonly RegionDialogueBinding[]; readonly loot: readonly RegionLootBinding[];
}
function regionBindingName(name: string): boolean {
  return /^ch\d{2}\.rules\..+\.bindings(?:\.p\d{3})?\.json$/u.test(name);
}
export async function loadRegionContent(source: ContentSource, chapter: string,
  regionId: string): Promise<RegionContentSlice> {
  try {
    const { loadChapterPackLeaves } = await import('@tianshu/data');
    const pack = await loadChapterPackLeaves(source, chapter, (leaf) =>
      leaf.kind === 'rules' && leaf.load === 'region' && leaf.region === regionId);
    const selected = pack.manifest.leaves.filter((leaf) => leaf.kind === 'rules' &&
      leaf.load === 'region' && leaf.region === regionId);
    const mapLeaves = selected.filter((leaf) => !regionBindingName(leaf.logicalName));
    const bindingLeaves = selected.filter((leaf) => regionBindingName(leaf.logicalName));
    if (mapLeaves.length === 0 || bindingLeaves.length === 0)
      throw new TypeError('CONTENT_REGION_LEAF_MISSING');
    const maps = mapLeaves.flatMap((leaf) => {
      const value = pack.leaves[leaf.logicalName];
      if (!Array.isArray(value)) throw new TypeError('CONTENT_REGION_LEAF_INVALID');
      return value.map((entry) => RegionMapSchema.parse(entry));
    });
    const unique = new Set(maps.map((map) => map.id));
    if (unique.size !== maps.length || maps.some((map) => map.regionId !== regionId))
      throw new TypeError('CONTENT_REGION_ID_MISMATCH');
    const bindings = bindingLeaves.flatMap((leaf) => {
      const value = pack.leaves[leaf.logicalName];
      const parsed = RegionBindingLeafSchema.safeParse(value);
      if (!parsed.success || parsed.data.chapter !== chapter || parsed.data.regionId !== regionId)
        throw new TypeError('CONTENT_REGION_BINDING_LEAF_INVALID');
      return parsed.data.entries;
    });
    const gates: RegionGateBinding[] = [];
    const dialogues: RegionDialogueBinding[] = [];
    const loot: RegionLootBinding[] = [];
    for (const binding of bindings) {
      if (binding.kind === 'regionGate') gates.push({ gateId: binding.value.gateId,
        expression: binding.value.expression });
      if (binding.kind === 'regionDialogue' && binding.value.noDialogue !== true)
        dialogues.push({ sceneId: binding.value.sceneId, anchorId: binding.value.anchorId,
          storyId: binding.value.storyId!, entryKey: binding.value.entryKey! });
      if (binding.kind === 'regionLoot') loot.push({ lootRef: binding.value.lootRef,
        items: binding.value.items });
    }
    return { maps: maps.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0),
      gates, dialogues, loot };
  } catch (error) { throw loadError('REGION_RULES_UNAVAILABLE', error); }
}

export class ItemTextCache {
  readonly #values = new Map<string, ItemText>();
  #pending: Promise<void> | undefined;
  public constructor(private readonly source: ContentSource,
    private readonly chapter = ITEM_CONTENT_CHAPTER, private readonly locale = 'zh-Hans') {}
  public get(itemId: string): ItemText | undefined { return this.#values.get(itemId); }
  public load(): Promise<void> {
    return this.#pending ??= this.#load().catch((error: unknown) => {
      this.#pending = undefined; throw loadError('ITEM_TEXT_UNAVAILABLE', error);
    });
  }
  async #load(): Promise<void> {
    const { loadChapterPackLeaves } = await import('@tianshu/data');
    const pack = await loadChapterPackLeaves(this.source, this.chapter, (leaf) =>
      leaf.kind === 'text' && leaf.locale === this.locale &&
      itemTextName(leaf.logicalName, this.locale));
    const names = pack.manifest.leaves.filter((leaf) =>
      itemTextName(leaf.logicalName, this.locale)).map((leaf) => leaf.logicalName);
    if (names.length === 0) throw new TypeError('CONTENT_ITEM_TEXT_LEAF_MISSING');
    const staged = new Map<string, ItemText>();
    const fields = new Set<string>();
    for (const name of names) {
      const value = pack.leaves[name];
      if (typeof value !== 'object' || value === null || Array.isArray(value))
        throw new TypeError('CONTENT_ITEM_TEXT_LEAF_INVALID');
      for (const [key, text] of Object.entries(value)) {
        const match = key.match(/^item\.([a-z0-9_]+)\.text\.(desc|lore|short)$/u);
        if (!match || typeof text !== 'string') throw new TypeError(`CONTENT_ITEM_TEXT_INVALID:${key}`);
        if (fields.has(key)) throw new TypeError(`CONTENT_ITEM_TEXT_DUPLICATE:${key}`);
        fields.add(key);
        const previous = staged.get(match[1]!) ?? {};
        staged.set(match[1]!, { ...previous, [match[2]!]: text });
      }
    }
    for (const [itemId, text] of staged) this.#values.set(itemId, Object.freeze(text));
  }
}
