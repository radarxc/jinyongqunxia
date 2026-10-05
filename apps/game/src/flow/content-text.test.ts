import { describe, expect, it } from 'vitest';
import { createManifest, emitLeaves } from '@tianshu/data/build';
import type { ContentSource } from '@tianshu/data';
import type { JsonValue } from '@tianshu/shared';
import { flowCardsFromCatalog, loadChapterTextCatalog } from './content-text';

async function sourceFor(text: Readonly<Record<string, JsonValue>>): Promise<ContentSource> {
  const leaves = await emitLeaves([
    { logicalName: 'common.rules.base.json', kind: 'rules', load: 'resident', value: [] },
    {
      logicalName: 'ch00.text.zh-Hans.base.json',
      kind: 'text',
      load: 'chapter',
      locale: 'zh-Hans',
      value: text,
    },
  ]);
  const manifest = await createManifest('ch00_yuenv', 'a'.repeat(64), leaves, []);
  const values = new Map<string, unknown>([
    ['ch00_yuenv/manifest.json', manifest],
    ...leaves.map((leaf): [string, unknown] => [`ch00_yuenv/${leaf.logicalName}`, leaf.value]),
  ]);
  return { readJson: async (path) => values.get(path) };
}

describe('M1 content text catalog', () => {
  it('loads verified string text and derives the card count from complete content pairs', async () => {
    const catalog = await loadChapterTextCatalog(
      await sourceFor({
        'ink.story_ch00.text.0000': '先听风声。',
        'ink.story_ch00': { inkVersion: 21 },
        'flow.ch00.summary.001.title': '第一张',
        'flow.ch00.summary.001.body': '甲',
        'flow.ch00.summary.002.title': '第二张',
        'flow.ch00.summary.002.body': '乙',
        'flow.ch00.summary.003.title': '缺正文',
      }),
      'ch00_yuenv',
    );
    expect(catalog['ink.story_ch00.text.0000']).toBe('先听风声。');
    expect(catalog['ink.story_ch00']).toBeUndefined();
    expect(flowCardsFromCatalog(catalog, 'flow.ch00.summary', [])).toEqual([
      { key: 'flow.ch00.summary.001', title: '第一张', body: '甲' },
      { key: 'flow.ch00.summary.002', title: '第二张', body: '乙' },
    ]);
  });
});
