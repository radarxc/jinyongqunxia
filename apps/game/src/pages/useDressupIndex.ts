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
