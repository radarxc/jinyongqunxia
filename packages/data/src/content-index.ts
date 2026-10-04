import { compareCodePoints } from '@tianshu/shared';
import type { ContentEntry, ContentFile, ContentKind, ContentValues } from './content-registry';
import { contentKindOrder, parseContentFile } from './content-registry';

type Identified = { readonly id?: string; readonly key?: string; readonly chapterId?: string;
  readonly lineId?: string; readonly cityId?: string };
export interface ContentRegistry extends ContentValues {
  readonly entries: readonly ContentEntry[];
  get<T = unknown>(kind: ContentKind, id: string): T | undefined;
  require<T = unknown>(kind: ContentKind, id: string): T;
}

function identity(kind: ContentKind, value: Identified): string {
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

function validateReferences(entries: readonly ContentEntry[], lookup: Map<string, unknown>): void {
  const has = (kind: ContentKind, id: string): boolean => lookup.has(`${kind}:${id}`);
  const moveRegistryActive = entries.some((entry) => entry.kind === 'move');
  const storyKnots = new Set<string>();
  for (const entry of entries) if (entry.kind === 'story') {
    const story = entry.value as ContentValues['stories'][number];
    for (const node of story.nodes) if (node.type === 'dialogue' && 'ink' in node.payload)
      storyKnots.add(`${node.payload.ink.storyId}:${node.payload.ink.knot}`);
  }
  for (const entry of entries) {
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

export function loadContent(files: readonly ContentFile[]): ContentRegistry {
  const entries = [...files].sort((left, right) => compareCodePoints(left.path, right.path)).map(parseContentFile);
  const lookup = new Map<string, unknown>();
  const globalIds = new Map<string, ContentKind>();
  for (const entry of entries) {
    const id = identity(entry.kind, entry.value as Identified);
    const key = `${entry.kind}:${id}`;
    if (lookup.has(key)) throw new TypeError(`CONTENT_DUPLICATE:${key}`);
    if (entry.kind !== 'shop' && entry.kind !== 'story' && entry.kind !== 'town') {
      const previous = globalIds.get(id);
      if (previous !== undefined) throw new TypeError(`CONTENT_GLOBAL_DUPLICATE:${id}:${previous}:${entry.kind}`);
      globalIds.set(id, entry.kind);
    }
    lookup.set(key, entry.value);
  }
  validateReferences(entries, lookup);
  entries.sort((left, right) => contentKindOrder(left.kind) - contentKindOrder(right.kind) || compareCodePoints(identity(left.kind, left.value as Identified), identity(right.kind, right.value as Identified)));
  const values = (kind: ContentKind): readonly unknown[] => entries.filter((entry) => entry.kind === kind).map((entry) => entry.value);
  const registry: ContentRegistry = {
    entries, npcs: values('npc') as ContentValues['npcs'], characterTemplates: values('characterTemplate') as ContentValues['characterTemplates'],
    martialArts: values('martialArt') as ContentValues['martialArts'], meridians: values('meridian') as ContentValues['meridians'],
    moves: values('move') as ContentValues['moves'], quests: values('quest') as ContentValues['quests'],
    acupoints: values('acupoint') as ContentValues['acupoints'], items: values('item') as ContentValues['items'],
    shops: values('shop') as ContentValues['shops'], stories: values('story') as ContentValues['stories'],
    events: values('event') as ContentValues['events'], bookWorlds: values('bookWorld') as ContentValues['bookWorlds'],
    chapters: values('bookWorld') as ContentValues['chapters'],
    towns: values('town') as ContentValues['towns'],
    get: <T>(kind: ContentKind, id: string) => lookup.get(`${kind}:${id}`) as T | undefined,
    require: <T>(kind: ContentKind, id: string) => {
      const value = lookup.get(`${kind}:${id}`);
      if (value === undefined) throw new TypeError(`CONTENT_MISSING:${kind}:${id}`);
      return value as T;
    },
  };
  return deepFreeze(registry);
}

export { deepFreeze };
