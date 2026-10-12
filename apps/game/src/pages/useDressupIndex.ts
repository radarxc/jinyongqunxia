import { computed, shallowRef } from 'vue';

export type DressupIndexKind = 'template' | 'head' | 'garment' | 'hair' | 'prop' | 'layer';

export interface DressupIndexEntry {
  readonly kind: DressupIndexKind;
  readonly id: string;
  readonly template: string;
  readonly file: string;
  readonly fit: string | null;
  readonly report: string | null;
  readonly status: string;
  readonly slot?: string;
  readonly socket?: string;
  readonly skeleton?: string;
  readonly heightM?: number;
}

export interface DressupIndex {
  readonly schema: 'tianshu-dressup-index.v1';
  readonly groups: Readonly<Record<DressupIndexKind, readonly DressupIndexEntry[]>>;
}

const BODY_ARCHETYPE = /_(?:small|medium|tall|lean|bulk)$/u;

/** 模板所属的一套素体（同一中等模板派生、共拓扑共 UV）：去掉末尾体型段，如 tpl_f2_small → tpl_f2。 */
export function templateFamily(templateId: string): string {
  return templateId.replace(BODY_ARCHETYPE, '');
}

/**
 * 每个素材 id 只取一个变体：优先与当前模板同名，否则取同一套素体里先出现的变体；同一套里没有变体的素材不出现。
 * 遮罩、颈片、贴图层都按素体的 UV 与拓扑生成，跨套使用会随机藏错三角、与素体自带光头互穿。
 */
export function selectDressupVariants(entries: readonly DressupIndexEntry[], templateId: string): DressupIndexEntry[] {
  const family = templateFamily(templateId);
  const selected = new Map<string, DressupIndexEntry>();
  for (const entry of entries) {
    if (templateFamily(entry.template) !== family) continue;
    const current = selected.get(entry.id);
    if (!current || (entry.template === templateId && current.template !== templateId)) selected.set(entry.id, entry);
  }
  return [...selected.values()];
}

/** 换素体后重新装上的已装备素材（按原装备顺序）：每个 id 取新模板下的变体，同一套里没有变体的跨套素材自动卸下。 */
export function restoreDressupEntries(entries: readonly DressupIndexEntry[], equippedIds: readonly string[],
  templateId: string): DressupIndexEntry[] {
  const available = selectDressupVariants(entries, templateId);
  return equippedIds.flatMap(id => available.filter(entry => entry.id === id));
}

export function useDressupIndex(fetchImpl: typeof fetch) {
  const index = shallowRef<DressupIndex | null>(null);
  const templates = computed(() => index.value?.groups.template ?? []);
  const equipmentGroups = computed(() => ([
    { kind: 'garment' as const, label: '衣物', entries: index.value?.groups.garment ?? [] },
    { kind: 'hair' as const, label: '发型', entries: index.value?.groups.hair ?? [] },
    { kind: 'prop' as const, label: '道具', entries: index.value?.groups.prop ?? [] },
  ]));
  const layers = computed(() => index.value?.groups.layer ?? []);

  async function load(url: string): Promise<DressupIndex> {
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error(`INDEX_HTTP_${response.status}`);
    const next = await response.json() as DressupIndex;
    if (next.schema !== 'tianshu-dressup-index.v1') throw new Error('DRESSUP_INDEX_SCHEMA');
    index.value = next;
    return next;
  }

  return { index, templates, equipmentGroups, layers, load };
}
