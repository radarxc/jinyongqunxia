import type { ContentKind } from '../content-registry';

export type FieldClass = 'rule' | 'text' | 'contentRef' | 'assetRef' | 'authoring';
export interface FieldSpec { readonly pattern: string; readonly class: FieldClass; }

const common: readonly FieldSpec[] = [
  { pattern: 'schemaVersion', class: 'rule' }, { pattern: 'id', class: 'rule' },
  { pattern: 'name', class: 'text' }, { pattern: 'canonRef', class: 'authoring' },
];

/** Explicit schema-side metadata; `*` is an intentional rule subtree, never a name heuristic. */

export const CONTENT_FIELD_REGISTRY: Readonly<Record<ContentKind, readonly FieldSpec[]>> = {
  move: [...common, { pattern: 'skillId', class: 'contentRef' },
    { pattern: 'meridianRouteRef', class: 'contentRef' },
    { pattern: 'affectedRouteRefs.*', class: 'contentRef' },
    { pattern: 'targetAcupoint.acupointRef', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  encounter: [{ pattern: 'chapterId', class: 'contentRef' },
    { pattern: 'participants.*.source.npcId', class: 'contentRef' },
    { pattern: 'participants.*.source.templateId', class: 'contentRef' },
    { pattern: 'participants.*.group', class: 'contentRef' },
    { pattern: 'settlement.*.*.flagId', class: 'rule' },
    { pattern: 'settlement.*.*.quest', class: 'contentRef' },
    { pattern: 'settlement.*.*.storyId', class: 'contentRef' },
    { pattern: 'settlement.*.*.knot', class: 'contentRef' },
    { pattern: 'settlement.lossFlags.*', class: 'rule' },
    { pattern: '*', class: 'rule' }],
  quest: [{ pattern: 'titleKey', class: 'contentRef' },
    { pattern: 'subjectNpcIds.*', class: 'contentRef' },
    { pattern: 'ownerSectId', class: 'contentRef' },
    { pattern: 'stages.*.objectiveKeys.*', class: 'contentRef' },
    { pattern: 'stages.*.objectives.*.storyId', class: 'contentRef' },
    { pattern: 'stages.*.objectives.*.itemId', class: 'contentRef' },
    { pattern: 'stages.*.effects.*.itemId', class: 'contentRef' },
    { pattern: 'stages.*.effects.*.skillId', class: 'contentRef' },
    { pattern: 'source.note', class: 'authoring' }, { pattern: '*', class: 'rule' }],
  item: [{ pattern: 'schemaVersion', class: 'rule' }, { pattern: 'id', class: 'rule' },
    { pattern: 'name', class: 'rule' }, { pattern: 'canonRef', class: 'rule' },
    { pattern: 'text.*', class: 'text' }, { pattern: 'assets.*', class: 'assetRef' },
    { pattern: 'assets', class: 'assetRef' },
    { pattern: 'extension.value.skill', class: 'contentRef' },
    { pattern: 'extension.value.resourceRef', class: 'contentRef' },
    { pattern: 'extension.value.quest', class: 'contentRef' },
    { pattern: 'extension.value.recognizedBy.*', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  npc: [...common, { pattern: 'identity.name', class: 'text' }, { pattern: 'identity.aliases', class: 'text' },
    { pattern: 'identity.aliases.*', class: 'text' },
    { pattern: 'identity.sourceWorks', class: 'authoring' },
    { pattern: 'appearances.*.displayName', class: 'text' },
    { pattern: 'appearances.*.build.skills.*.skillId', class: 'contentRef' },
    { pattern: 'appearances.*.build.templateId', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.questRef', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.gateRef', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.valueGateRefs.*', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.mainlineGateRef', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.canonicalConsequenceRef', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.fallbackAllianceRef', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.lockWarningRef', class: 'contentRef' },
    { pattern: 'appearances.*.recruitment.fateRuleRef', class: 'contentRef' },
    { pattern: 'recruitment.hardConflictWith.*', class: 'contentRef' },
    { pattern: 'recruitment.softConflictWith.*', class: 'contentRef' },
    { pattern: 'crossBook.reunionQuestByChapter.*', class: 'contentRef' },
    { pattern: 'crossBook.legacy.skillRefs.*', class: 'contentRef' },
    { pattern: 'crossBook.legacy.itemRefs.*', class: 'contentRef' },
    { pattern: 'crossBook.legacy.heirNpcRefs.*', class: 'contentRef' },
    { pattern: 'sources', class: 'authoring' }, { pattern: 'sources.*', class: 'authoring' }, { pattern: '*', class: 'rule' }],
  martialArt: [...common, { pattern: 'aliases', class: 'text' }, { pattern: 'aliases.*', class: 'text' },
    { pattern: 'description', class: 'text' }, { pattern: 'learnSources.*.note', class: 'text' },
    { pattern: 'learnSources.*.ref', class: 'contentRef' },
    { pattern: 'inner.meridians.*', class: 'contentRef' },
    { pattern: 'inner.breathProfileRef', class: 'contentRef' },
    { pattern: 'layers.*.unlock.*', class: 'contentRef' },
    { pattern: 'moveIds.*', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  shop: [...common, { pattern: 'supply.*.itemId', class: 'contentRef' },
    { pattern: 'keeperNpcId', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  story: [{ pattern: 'source', class: 'authoring' }, { pattern: 'source.*', class: 'authoring' },
    { pattern: 'nodes.*.sourceRef', class: 'authoring' },
    { pattern: 'nodes.*.titleKey', class: 'contentRef' },
    { pattern: 'nodes.*.payload.inlineLines.*.textKey', class: 'contentRef' },
    { pattern: 'nodes.*.payload.options.*.textKey', class: 'contentRef' },
    { pattern: 'nodes.*.payload.npcId', class: 'contentRef' },
    { pattern: 'nodes.*.payload.questId', class: 'contentRef' },
    { pattern: '*', class: 'rule' }],
  event: [
    { pattern: 'actions.*.text', class: 'text' },
    { pattern: 'actions.*.map.name', class: 'text' },
    { pattern: 'actions.*.map.travel.note', class: 'authoring' },
    { pattern: 'actions.*.map.nodes.*.name', class: 'text' },
    { pattern: 'actions.*.map.nodes.*.levelNote', class: 'text' },
    { pattern: 'actions.*.map.nodes.*.entry.accessNote', class: 'text' },
    { pattern: 'actions.*.map.nodes.*.coordinateNote', class: 'authoring' },
    { pattern: 'actions.*.map.nodes.*.accessNote', class: 'text' },
    { pattern: 'actions.*.map.roads.*.note', class: 'authoring' },
    { pattern: 'actions.*.map.sources', class: 'authoring' }, { pattern: '*', class: 'rule' },
  ], bookWorld: [{ pattern: 'mainStoryLine', class: 'contentRef' },
    { pattern: 'sideStoryLines.*', class: 'contentRef' },
    { pattern: 'globalItems.*.itemId', class: 'contentRef' },
    { pattern: 'collectibleLocations.*.itemId', class: 'contentRef' },
    { pattern: 'shopKeys.*', class: 'contentRef' }, { pattern: 'eventIds.*', class: 'contentRef' },
    { pattern: '*', class: 'rule' }],
  town: [{ pattern: 'displayName', class: 'text' }, { pattern: 'buildings.*.poi', class: 'text' },
    { pattern: 'source', class: 'authoring' },
    { pattern: 'source.*', class: 'authoring' }, { pattern: 'assets', class: 'assetRef' },
    { pattern: 'assets.*', class: 'assetRef' }, { pattern: 'buildings.*.assetId', class: 'assetRef' },
    { pattern: 'buildings.*.businessRef', class: 'contentRef' },
    { pattern: 'anchors.*.ref', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  characterTemplate: [{ pattern: 'skillSeeds.*.skillId', class: 'contentRef' },
    { pattern: '*', class: 'rule' }],
  roleSlot: [{ pattern: 'templateId', class: 'contentRef' },
    { pattern: 'displayRoleKey', class: 'contentRef' },
    { pattern: 'consumerRefs.*', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  meridian: [...common, { pattern: 'direction', class: 'text' }, { pattern: 'organRelation', class: 'text' },
    { pattern: 'acupoints.*', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  acupoint: [...common, { pattern: 'sourceRef', class: 'authoring' },
    { pattern: 'gameMeridian', class: 'contentRef' },
    { pattern: 'standardMeridian', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  regionGate: [{ pattern: 'expression.quest', class: 'contentRef' },
    { pattern: 'expression.item', class: 'contentRef' },
    { pattern: 'lockedTextKey', class: 'contentRef' },
    { pattern: 'note', class: 'authoring' }, { pattern: '*', class: 'rule' }],
  regionDialogue: [{ pattern: 'storyId', class: 'contentRef' },
    { pattern: 'entryKey', class: 'contentRef' },
    { pattern: 'condition.quest', class: 'contentRef' },
    { pattern: 'condition.item', class: 'contentRef' }, { pattern: '*', class: 'rule' }],
  regionLoot: [{ pattern: 'items.*.itemId', class: 'contentRef' },
    { pattern: '*', class: 'rule' }],
};

function matches(pattern: string, path: readonly string[]): boolean {
  if (pattern === '*') return true;
  const parts = pattern.split('.');
  if (parts.length !== path.length) return false;
  return parts.every((part, index) => part === '*' || part === path[index]);
}

export function classifyField(kind: ContentKind, path: readonly string[]): FieldClass {
  const match = CONTENT_FIELD_REGISTRY[kind].find((spec) => matches(spec.pattern, path));
  if (match === undefined) throw new TypeError(`CONTENT_FIELD_UNCLASSIFIED:${kind}:${path.join('.')}`);
  return match.class;
}

export function textKeyFor(kind: ContentKind, identity: string, path: readonly string[]): string {
  return `${kind}.${identity}.${path.join('.')}`;
}
