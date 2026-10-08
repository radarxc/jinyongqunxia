import { describe, expect, it, vi } from 'vitest';
import { useDressupIndex, type DressupIndex } from './useDressupIndex';

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
