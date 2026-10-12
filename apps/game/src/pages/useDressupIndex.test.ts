import { describe, expect, it, vi } from 'vitest';
import {
  restoreDressupEntries, selectDressupVariants, templateFamily, useDressupIndex, type DressupIndex, type DressupIndexEntry,
} from './useDressupIndex';

function fixture(): DressupIndex {
  const entry = (kind: 'template' | 'prop', index: number) => ({
    kind, id: `${kind}-${index}`, template: 'tpl_f_medium', file: `${kind}-${index}.glb`,
    fit: kind === 'prop' ? `${kind}-${index}.json` : null, report: null, status: 'draft',
  });
  return {
    schema: 'tianshu-dressup-index.v1',
    groups: {
      template: [entry('template', 1), entry('template', 2), entry('template', 3)],
      prop: [entry('prop', 1), entry('prop', 2), entry('prop', 3)],
      head: [], garment: [], hair: [], layer: [],
    },
  };
}

describe('useDressupIndex', () => {
  it('invalidates computed groups after the asynchronous index load completes', async () => {
    let resolveResponse!: (response: Response) => void;
    const pending = new Promise<Response>(resolve => { resolveResponse = resolve; });
    const state = useDressupIndex(vi.fn(() => pending) as unknown as typeof fetch);
    const load = state.load('/index.json');
    expect(state.templates.value).toHaveLength(0);
    expect(state.equipmentGroups.value.map(group => group.entries.length)).toEqual([0, 0, 0]);

    resolveResponse(new Response(JSON.stringify(fixture())));
    await load;

    expect(state.templates.value).toHaveLength(3);
    expect(state.layers.value).toHaveLength(0);
    expect(state.equipmentGroups.value.map(group => [group.kind, group.entries.length])).toEqual([
      ['garment', 0], ['hair', 0], ['prop', 3],
    ]);
  });
});

describe('selectDressupVariants', () => {
  const head = (id: string, template: string): DressupIndexEntry => ({
    kind: 'head', id, template, file: `${id}.${template}.glb`, fit: `${id}.${template}.json`, report: null, status: 'draft',
  });
  const entries = [
    head('npc_huangrong', 'tpl_f_medium'), head('npc_huangrong', 'tpl_f_tall'), head('npc_huangrong', 'tpl_f_small'),
    head('npc_huangrong', 'tpl_f2_medium'), head('npc_huangrong', 'tpl_f2_tall'),
    head('npc_munianci', 'tpl_f_medium'),
  ];

  it('maps every template to its body family by dropping the archetype suffix', () => {
    expect(['tpl_f_small', 'tpl_f_medium', 'tpl_f_tall'].map(templateFamily)).toEqual(['tpl_f', 'tpl_f', 'tpl_f']);
    expect(['tpl_f2_small', 'tpl_f2_tall', 'tpl_m_lean', 'tpl_m_bulk'].map(templateFamily))
      .toEqual(['tpl_f2', 'tpl_f2', 'tpl_m', 'tpl_m']);
    expect(templateFamily('custom_body')).toBe('custom_body');
  });

  it('prefers the variant cut for the selected template', () => {
    const picked = selectDressupVariants(entries, 'tpl_f2_tall');
    expect(picked.map(entry => [entry.id, entry.template])).toEqual([['npc_huangrong', 'tpl_f2_tall']]);
    expect(selectDressupVariants(entries, 'tpl_f_small').map(entry => entry.template)).toEqual(['tpl_f_small', 'tpl_f_medium']);
  });

  it('falls back only inside the same body family', () => {
    // tpl_f2_small 还没切：同套回退到先出现的 tpl_f2_medium，不取 tpl_f_small
    expect(selectDressupVariants(entries, 'tpl_f2_small').map(entry => [entry.id, entry.template]))
      .toEqual([['npc_huangrong', 'tpl_f2_medium']]);
    // 穆念慈只有 tpl_f 的切头：在 tpl_f2 / tpl_m 上都不出现
    expect(selectDressupVariants(entries, 'tpl_f2_medium').some(entry => entry.id === 'npc_munianci')).toBe(false);
    expect(selectDressupVariants(entries, 'tpl_m_medium')).toEqual([]);
  });

  it('unequips items without a variant in the new body family when the template changes', () => {
    // 从 tpl_f_medium 换到 tpl_f2_small：黄蓉回退到同套 tpl_f2_medium，穆念慈没有 tpl_f2 切头被卸下
    expect(restoreDressupEntries(entries, ['npc_munianci', 'npc_huangrong'], 'tpl_f2_small')
      .map(entry => [entry.id, entry.template])).toEqual([['npc_huangrong', 'tpl_f2_medium']]);
    expect(restoreDressupEntries(entries, ['npc_huangrong', 'npc_munianci'], 'tpl_m_lean')).toEqual([]);
    expect(restoreDressupEntries(entries, ['npc_munianci'], 'tpl_f_tall').map(entry => entry.template)).toEqual(['tpl_f_medium']);
  });

  it('keeps the first-seen order of item ids', () => {
    const reordered = [head('b', 'tpl_f_medium'), head('a', 'tpl_f_tall'), head('a', 'tpl_f_medium'), head('b', 'tpl_f_tall')];
    expect(selectDressupVariants(reordered, 'tpl_f_tall').map(entry => [entry.id, entry.template]))
      .toEqual([['b', 'tpl_f_tall'], ['a', 'tpl_f_tall']]);
  });
});
