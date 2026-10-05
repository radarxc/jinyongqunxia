import { compareCodePoints } from '@tianshu/shared';
import type { ContentEntry, ContentFile, ContentValues, RegisteredContentKind } from './content-registry';
import { contentKindOrder, parseContentFile } from './content-registry';

type Identified = { readonly id?: string; readonly key?: string; readonly chapterId?: string;
  readonly lineId?: string; readonly cityId?: string; readonly chapter?: string;
  readonly gateId?: string; readonly sceneId?: string; readonly anchorId?: string;
  readonly lootRef?: string; readonly slotId?: string };
export interface ContentReferenceContext {
  readonly inks?: readonly { readonly storyId: string; readonly structure: {
    readonly chapter: string; readonly entryKnots: readonly string[];
    readonly readFlags: readonly string[]; readonly tags: readonly {
      readonly opcode: string; readonly args: Readonly<Record<string, string>>;
    }[];
  } }[];
}
export interface ContentRegistry extends ContentValues {
  readonly entries: readonly ContentEntry[];
  get<T = unknown>(kind: RegisteredContentKind, id: string): T | undefined;
  require<T = unknown>(kind: RegisteredContentKind, id: string): T;
  /** Pre-indexed O(1) chapter lookup; returns an immutable empty list when absent. */
  roleSlotsForChapter(chapter: string): ContentValues['roleSlots'];
}

function identity(kind: RegisteredContentKind, value: Identified): string {
  if (kind === 'roleSlot' && typeof value.slotId === 'string') return value.slotId;
  if (kind === 'regionGate' && typeof value.gateId === 'string') return value.gateId;
  if (kind === 'regionDialogue' && typeof value.chapter === 'string' &&
      typeof value.sceneId === 'string' && typeof value.anchorId === 'string')
    return `${value.chapter}/${value.sceneId}/${value.anchorId}`;
  if (kind === 'regionLoot' && typeof value.lootRef === 'string') return value.lootRef;
  if (kind === 'town' && typeof value.cityId === 'string' && typeof value.chapterId === 'string')
    return value.chapterId + '/' + value.cityId;
  if (kind === 'shop') return `${value.chapterId}/${value.key}`;
  if (kind === 'story') return `${value.chapterId}/${value.lineId}`;
  if (typeof value.id !== 'string') throw new TypeError(`CONTENT_ID:${kind}`);
  return value.id;
}

function deepFreeze<T>(value: T, seen = new Set<object>()): T {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function bindingPath(entry: ContentEntry): { chapter: string; folder: string } | undefined {
  if (!entry.kind.startsWith('region')) return undefined;
  const match = entry.path.match(
    /^content\/chapters\/(ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*)\/bindings\/(gates|dialogues|loot)\/[^/]+\.yaml$/u,
  );
  if (match === null) throw new TypeError(`CONTENT_BINDING_PATH:${entry.path}`);
  return { chapter: match[1]!, folder: match[2]! };
}

function validateRoleSlotOwnership(entries: readonly ContentEntry[]): void {
  for (const entry of entries) {
    if (entry.kind !== 'roleSlot') continue;
    const match = entry.path.match(
      /^content\/chapters\/(ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*)\/roles\/[^/]+\.yaml$/u,
    );
    if (match === null) throw new TypeError(`CONTENT_ROLE_SLOT_PATH:${entry.path}`);
    const value = entry.value as ContentValues['roleSlots'][number];
    if (match[1] !== value.chapter)
      throw new TypeError(`CONTENT_ROLE_SLOT_CHAPTER:${entry.path}:${value.chapter}`);
    if (!entry.path.endsWith(`/${value.slotId}.yaml`))
      throw new TypeError(`CONTENT_ROLE_SLOT_FILENAME:${entry.path}:${value.slotId}`);
  }
}

function validateBindingOwnership(entries: readonly ContentEntry[]): void {
  const folderByKind: Partial<Record<RegisteredContentKind, string>> = {
    regionGate: 'gates', regionDialogue: 'dialogues', regionLoot: 'loot',
  };
  for (const entry of entries) {
    const path = bindingPath(entry);
    if (path === undefined) continue;
    const value = entry.value as { readonly chapter?: string };
    if (path.folder !== folderByKind[entry.kind])
      throw new TypeError(`CONTENT_BINDING_KIND:${entry.path}:${entry.kind}`);
    if (path.chapter !== value.chapter)
      throw new TypeError(`CONTENT_BINDING_CHAPTER:${entry.path}:${String(value.chapter)}`);
  }
}

function validateReferences(entries: readonly ContentEntry[], lookup: Map<string, unknown>,
  context: ContentReferenceContext): void {
  const has = (kind: RegisteredContentKind, id: string): boolean => lookup.has(`${kind}:${id}`);
  const moveRegistryActive = entries.some((entry) => entry.kind === 'move');
  const encounterEntries = entries.filter((entry) =>
    (entry.value as { schemaVersion?: string }).schemaVersion === 'encounter.v1');
  const encounterRegistryActive = encounterEntries.length > 0;
  const storyKnots = new Set<string>();
  const topologyCatalogs = entries.filter((entry) => entry.kind === 'event' &&
    (entry.value as { event?: string }).event === 'content/meridianTopologyCatalog')
    .map((entry) => entry.value as Extract<ContentValues['events'][number],
      { event: 'content/meridianTopologyCatalog' }>);
  if (topologyCatalogs.length > 0) {
    const meridians = topologyCatalogs.flatMap((catalog) => catalog.meridians);
    const points = meridians.flatMap((meridian) => meridian.points);
    const groups = new Set(topologyCatalogs.map((catalog) => catalog.group));
    if (topologyCatalogs.length !== 2 || meridians.length !== 20 || points.length !== 180 ||
        groups.size !== 2 || !groups.has('regular12') || !groups.has('extra8') ||
        new Set(meridians.map((entry) => entry.id)).size !== 20 ||
        new Set(points.map((entry) => entry.id)).size !== 180)
      throw new TypeError('CONTENT_MERIDIAN_TOPOLOGY_COUNTS');
  }
  const sectCatalogs = entries.filter((entry) => entry.kind === 'event' &&
    (entry.value as { event?: string }).event === 'content/sectCatalog')
    .map((entry) => entry.value as Extract<ContentValues['events'][number],
      { event: 'content/sectCatalog' }>);
  if (sectCatalogs.length > 0) {
    const sects = sectCatalogs.flatMap((catalog) => catalog.sects);
    const groups = new Set(sectCatalogs.map((catalog) => catalog.group));
    if (sectCatalogs.length !== 4 || sects.length !== 99 ||
        groups.size !== 4 ||
        new Set(sects.map((entry) => entry.id)).size !== 99)
      throw new TypeError('CONTENT_SECT_CATALOG_COUNTS');
  }
  for (const entry of entries) if (entry.kind === 'story') {
    const story = entry.value as ContentValues['stories'][number];
    for (const node of story.nodes) if (node.type === 'dialogue' && 'ink' in node.payload)
      storyKnots.add(`${node.payload.ink.storyId}:${node.payload.ink.knot}`);
  }
  const inkStories = new Map((context.inks ?? []).map((ink) => [ink.storyId, ink.structure]));
  const flags = new Set<string>();
  for (const entry of entries) if (entry.kind === 'quest')
    for (const flag of (entry.value as ContentValues['quests'][number]).flagIds) flags.add(flag);
  for (const ink of context.inks ?? []) {
    ink.structure.readFlags.forEach((flag) => flags.add(flag));
    ink.structure.tags.filter((tag) => tag.opcode === 'flag/set').forEach((tag) => {
      const flag = tag.args['flagId'];
      if (flag !== undefined) flags.add(flag);
    });
  }
  const checkGateExpr = (expression: unknown, path: string): void => {
    if (typeof expression !== 'object' || expression === null) return;
    const value = expression as Record<string, unknown>;
    if (typeof value['quest'] === 'string' && !has('quest', value['quest']))
      throw new TypeError(`CONTENT_REF:${path}:quest:${value['quest']}`);
    if (typeof value['flag'] === 'string' && !flags.has(value['flag']))
      throw new TypeError(`CONTENT_REF:${path}:flag:${value['flag']}`);
    if (typeof value['item'] === 'string' && !has('item', value['item']))
      throw new TypeError(`CONTENT_REF:${path}:item:${value['item']}`);
    for (const child of Object.values(value))
      if (Array.isArray(child)) child.forEach((item) => checkGateExpr(item, path));
      else checkGateExpr(child, path);
  };
  for (const entry of entries) {
    if (entry.kind === 'roleSlot') {
      const slot = entry.value as ContentValues['roleSlots'][number];
      if (!has('characterTemplate', slot.templateId))
        throw new TypeError(`CONTENT_REF:${entry.path}:characterTemplate:${slot.templateId}`);
      for (const ref of slot.consumerRefs) {
        if (encounterRegistryActive && ref.startsWith('enc_') && !has('encounter', ref))
          throw new TypeError(`CONTENT_REF:${entry.path}:encounter:${ref}`);
        if (ref.startsWith('q_') && !has('quest', ref))
          throw new TypeError(`CONTENT_REF:${entry.path}:quest:${ref}`);
      }
    }
    if (entry.kind === 'regionGate')
      checkGateExpr((entry.value as ContentValues['regionGates'][number]).expression, entry.path);
    if (entry.kind === 'regionDialogue') {
      const binding = entry.value as ContentValues['regionDialogues'][number];
      if (binding.condition !== undefined) checkGateExpr(binding.condition, entry.path);
      if (binding.noDialogue !== true) {
        const story = inkStories.get(binding.storyId!);
        if (story === undefined)
          throw new TypeError(`CONTENT_REF:${entry.path}:inkStory:${binding.storyId!}`);
        if (story.chapter !== binding.chapter)
          throw new TypeError(`CONTENT_REF:${entry.path}:inkChapter:${binding.storyId!}:${binding.chapter}`);
        if (!story.entryKnots.includes(binding.entryKey!))
          throw new TypeError(`CONTENT_REF:${entry.path}:inkKnot:${binding.storyId!}:${binding.entryKey!}`);
      }
    }
    if (entry.kind === 'regionLoot') {
      const binding = entry.value as ContentValues['regionLoot'][number];
      for (const item of binding.items) if (!has('item', item.itemId))
        throw new TypeError(`CONTENT_REF:${entry.path}:item:${item.itemId}`);
    }
    if (entry.kind === 'martialArt') {
      const skill = entry.value as ContentValues['martialArts'][number];
      for (const moveId of skill.moveIds) if (moveRegistryActive && !has('move', moveId))
        throw new TypeError(`CONTENT_REF:${entry.path}:move:${moveId}`);
    }
    if (entry.kind === 'move') {
      const move = entry.value as ContentValues['moves'][number];
      if (!has('martialArt', move.skillId))
        throw new TypeError(`CONTENT_REF:${entry.path}:martialArt:${move.skillId}`);
    }
    if (entry.kind === 'quest') {
      const quest = entry.value as ContentValues['quests'][number];
      const flags = new Set(quest.flagIds); const encounters = new Set(quest.encounterIds);
      for (const npcId of quest.subjectNpcIds) if (!has('npc', npcId))
        throw new TypeError(`CONTENT_REF:${entry.path}:npc:${npcId}`);
      const checkCondition = (condition: unknown): void => {
        if (typeof condition !== 'object' || condition === null) return;
        const record = condition as Record<string, unknown>;
        if (typeof record['flag'] === 'object' && record['flag'] !== null) {
          const id = (record['flag'] as Record<string, unknown>)['id'];
          if (typeof id === 'string' && !flags.has(id))
            throw new TypeError(`CONTENT_REF:${entry.path}:flag:${id}`);
        }
        if (typeof record['quest'] === 'object' && record['quest'] !== null) {
          const id = (record['quest'] as Record<string, unknown>)['id'];
          if (typeof id === 'string' && !has('quest', id))
            throw new TypeError(`CONTENT_REF:${entry.path}:quest:${id}`);
        }
        if (typeof record['hasItem'] === 'object' && record['hasItem'] !== null) {
          const id = (record['hasItem'] as Record<string, unknown>)['id'];
          if (typeof id === 'string' && !has('item', id))
            throw new TypeError(`CONTENT_REF:${entry.path}:item:${id}`);
        }
        for (const child of Object.values(record)) {
          if (Array.isArray(child)) child.forEach(checkCondition); else checkCondition(child);
        }
      };
      if (encounterRegistryActive) for (const encounterId of encounters)
        if (!has('encounter', encounterId))
          throw new TypeError(`CONTENT_REF:${entry.path}:encounter:${encounterId}`);
      if (quest.offerWhen !== undefined) checkCondition(quest.offerWhen);
      if (quest.showWhen !== undefined) checkCondition(quest.showWhen);
      for (const stage of quest.stages) {
        for (const edge of stage.transitions) checkCondition(edge.when);
        for (const objective of stage.objectives) {
          if ('flagId' in objective && !flags.has(objective.flagId))
            throw new TypeError(`CONTENT_REF:${entry.path}:flag:${objective.flagId}`);
          if ('itemId' in objective && !has('item', objective.itemId))
            throw new TypeError(`CONTENT_REF:${entry.path}:item:${objective.itemId}`);
          if ('encounterId' in objective && !encounters.has(objective.encounterId))
            throw new TypeError(`CONTENT_REF:${entry.path}:encounter:${objective.encounterId}`);
          if ('targetRef' in objective && !has('npc', objective.targetRef))
            throw new TypeError(`CONTENT_REF:${entry.path}:npc:${objective.targetRef}`);
          if ('storyId' in objective && !storyKnots.has(`${objective.storyId}:${objective.knot}`))
            throw new TypeError(`CONTENT_REF:${entry.path}:storyKnot:${objective.storyId}:${objective.knot}`);
        }
        for (const effect of stage.effects) {
          if ('flagId' in effect && !flags.has(effect.flagId))
            throw new TypeError(`CONTENT_REF:${entry.path}:flag:${effect.flagId}`);
          if ('itemId' in effect && !has('item', effect.itemId))
            throw new TypeError(`CONTENT_REF:${entry.path}:item:${effect.itemId}`);
          if ('skillId' in effect && !has('martialArt', effect.skillId))
            throw new TypeError(`CONTENT_REF:${entry.path}:martialArt:${effect.skillId}`);
          if ('sectId' in effect && effect.sectId !== quest.ownerSectId)
            throw new TypeError(`CONTENT_REF:${entry.path}:sect:${effect.sectId}`);
          if ('encounterId' in effect && !encounters.has(effect.encounterId))
            throw new TypeError(`CONTENT_REF:${entry.path}:encounter:${effect.encounterId}`);
          if ('storyId' in effect && !storyKnots.has(`${effect.storyId}:${effect.knot}`))
            throw new TypeError(`CONTENT_REF:${entry.path}:storyKnot:${effect.storyId}:${effect.knot}`);
        }
      }
    }
    if ((entry.value as { schemaVersion?: string }).schemaVersion === 'encounter.v1') {
      const encounter = entry.value as ContentValues['encounters'][number];
      for (const participant of encounter.participants) {
        if (participant.source.kind === 'npc' && !has('npc', participant.source.npcId))
          throw new TypeError(`CONTENT_REF:${entry.path}:npc:${participant.source.npcId}`);
        if (participant.source.kind === 'template'
          && !has('characterTemplate', participant.source.templateId))
          throw new TypeError(`CONTENT_REF:${entry.path}:characterTemplate:${participant.source.templateId}`);
      }
      if (encounter.settlement !== undefined) {
        const actions = [encounter.settlement.onWin, encounter.settlement.onLose,
          encounter.settlement.onConcede, encounter.settlement.onAssisted].flat();
        for (const action of actions) {
          if (action.op === 'flag/set' && !flags.has(action.flagId))
            throw new TypeError(`CONTENT_REF:${entry.path}:flag:${action.flagId}`);
          if (action.op === 'quest/advance' && !has('quest', action.quest))
            throw new TypeError(`CONTENT_REF:${entry.path}:quest:${action.quest}`);
          if (action.op === 'dialogue/start') {
            const story = inkStories.get(action.storyId);
            if (story === undefined)
              throw new TypeError(`CONTENT_REF:${entry.path}:inkStory:${action.storyId}`);
            if (story.chapter !== encounter.chapterId)
              throw new TypeError(`CONTENT_REF:${entry.path}:inkChapter:${action.storyId}:${encounter.chapterId}`);
            if (!story.entryKnots.includes(action.knot))
              throw new TypeError(`CONTENT_REF:${entry.path}:inkKnot:${action.storyId}:${action.knot}`);
          }
        }
        for (const flag of encounter.settlement.lossFlags) if (!flags.has(flag))
          throw new TypeError(`CONTENT_REF:${entry.path}:flag:${flag}`);
      }
    }
    if (entry.kind === 'shop') {
      const shop = entry.value as ContentValues['shops'][number];
      if (shop.keeperNpcId !== undefined && !has('npc', shop.keeperNpcId))
        throw new TypeError(`CONTENT_REF:${entry.path}:npc:${shop.keeperNpcId}`);
      for (const row of shop.supply) if (!has('item', row.itemId))
        throw new TypeError(`CONTENT_REF:${entry.path}:item:${row.itemId}`);
    }
    if (entry.kind === 'meridian') {
      const meridian = entry.value as ContentValues['meridians'][number];
      for (const id of meridian.acupoints) if (!has('acupoint', id))
        throw new TypeError(`CONTENT_REF:${entry.path}:acupoint:${id}`);
    }
    if (entry.kind === 'acupoint') {
      const point = entry.value as ContentValues['acupoints'][number];
      if (!has('meridian', point.gameMeridian))
        throw new TypeError(`CONTENT_REF:${entry.path}:meridian:${point.gameMeridian}`);
      if (!has('meridian', point.standardMeridian))
        throw new TypeError(`CONTENT_REF:${entry.path}:meridian:${point.standardMeridian}`);
    }
    if (entry.kind === 'characterTemplate') {
      const template = entry.value as ContentValues['characterTemplates'][number];
      for (const seed of template.skillSeeds) if (!has('martialArt', seed.skillId))
        throw new TypeError(`CONTENT_REF:${entry.path}:martialArt:${seed.skillId}`);
    }
    if (entry.kind === 'npc') {
      const npc = entry.value as ContentValues['npcs'][number];
      for (const appearance of npc.appearances) {
        if (appearance.build.pipeline === 'full') {
          for (const skill of appearance.build.skills) if (!has('martialArt', skill.skillId))
            throw new TypeError(`CONTENT_REF:${entry.path}:martialArt:${skill.skillId}`);
        } else if (!has('characterTemplate', appearance.build.templateId))
          throw new TypeError(`CONTENT_REF:${entry.path}:characterTemplate:${appearance.build.templateId}`);
      }
    }
  }
}

export function loadContent(files: readonly ContentFile[], context: ContentReferenceContext = {}): ContentRegistry {
  const entries = [...files].sort((left, right) => compareCodePoints(left.path, right.path)).map(parseContentFile);
  validateBindingOwnership(entries);
  validateRoleSlotOwnership(entries);
  const lookup = new Map<string, unknown>();
  const globalIds = new Map<string, RegisteredContentKind>();
  for (const entry of entries) {
    const id = identity(entry.kind, entry.value as Identified);
    const key = `${entry.kind}:${id}`;
    if (lookup.has(key)) throw new TypeError(`CONTENT_DUPLICATE:${key}`);
    if (entry.kind !== 'shop' && entry.kind !== 'story' && entry.kind !== 'town' &&
        entry.kind !== 'regionDialogue') {
      const previous = globalIds.get(id);
      if (previous !== undefined) throw new TypeError(`CONTENT_GLOBAL_DUPLICATE:${id}:${previous}:${entry.kind}`);
      globalIds.set(id, entry.kind);
    }
    lookup.set(key, entry.value);
  }
  validateReferences(entries, lookup, context);
  entries.sort((left, right) => contentKindOrder(left.kind) - contentKindOrder(right.kind) || compareCodePoints(identity(left.kind, left.value as Identified), identity(right.kind, right.value as Identified)));
  const values = (kind: RegisteredContentKind): readonly unknown[] => entries.filter((entry) => entry.kind === kind).map((entry) => entry.value);
  const roleSlots = values('roleSlot') as ContentValues['roleSlots'];
  const roleSlotsByChapter: Record<string, ContentValues['roleSlots']> = {};
  for (const slot of roleSlots)
    roleSlotsByChapter[slot.chapter] = deepFreeze([
      ...(roleSlotsByChapter[slot.chapter] ?? []), slot,
    ]);
  const emptyRoleSlots = Object.freeze([]) as ContentValues['roleSlots'];
  const registry: ContentRegistry = {
    entries, npcs: values('npc') as ContentValues['npcs'], characterTemplates: values('characterTemplate') as ContentValues['characterTemplates'],
    martialArts: values('martialArt') as ContentValues['martialArts'], meridians: values('meridian') as ContentValues['meridians'],
    moves: values('move') as ContentValues['moves'], encounters: values('encounter') as ContentValues['encounters'],
    roleSlots,
    quests: values('quest') as ContentValues['quests'],
    acupoints: values('acupoint') as ContentValues['acupoints'], items: values('item') as ContentValues['items'],
    shops: values('shop') as ContentValues['shops'], stories: values('story') as ContentValues['stories'],
    events: values('event') as ContentValues['events'], bookWorlds: values('bookWorld') as ContentValues['bookWorlds'],
    chapters: values('bookWorld') as ContentValues['chapters'],
    towns: values('town') as ContentValues['towns'],
    regionGates: values('regionGate') as ContentValues['regionGates'],
    regionDialogues: values('regionDialogue') as ContentValues['regionDialogues'],
    regionLoot: values('regionLoot') as ContentValues['regionLoot'],
    get: <T>(kind: RegisteredContentKind, id: string) => lookup.get(`${kind}:${id}`) as T | undefined,
    require: <T>(kind: RegisteredContentKind, id: string) => {
      const value = lookup.get(`${kind}:${id}`);
      if (value === undefined) throw new TypeError(`CONTENT_MISSING:${kind}:${id}`);
      return value as T;
    },
    roleSlotsForChapter: (chapter: string) => roleSlotsByChapter[chapter] ?? emptyRoleSlots,
  };
  return deepFreeze(registry);
}

export { deepFreeze };
