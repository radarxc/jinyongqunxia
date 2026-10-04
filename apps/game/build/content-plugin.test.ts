import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { InkJsDialogueBridge } from '@tianshu/core';
import { compileInk } from '@tianshu/data/build';
import { describe, expect, it } from 'vitest';
import { gameContentPlugin } from './content-plugin';

describe('game content plugin town integration', () => {
  // This integration builds the full authored content; its timeout is not a performance assertion.
  it('emits authored NPC presence and event-anchor registries with town data', async () => {
    const plugin = gameContentPlugin({ copyAssets: false });
    const resolved = await plugin.resolveId?.call({} as never, 'virtual:tianshu-content',
      undefined, {} as never);
    expect(resolved).toBe('\0virtual:tianshu-content');
    const loaded = await plugin.load?.call({} as never, resolved as string);
    expect(loaded).toEqual(expect.stringContaining('townEventAnchors'));
    expect(loaded).toEqual(expect.stringContaining('townNpcWorld'));
    expect(loaded).toEqual(expect.stringContaining('townNpcPlacements'));
    expect(loaded).not.toEqual(expect.stringContaining('towns:'));
    expect(loaded).not.toEqual(expect.stringContaining('"items"'));
    expect(loaded).not.toEqual(expect.stringContaining('"worldMaps"'));
    expect(loaded).not.toEqual(expect.stringContaining('"assets"'));
    expect(loaded).toEqual(expect.stringContaining('"npcs":[]'));
    expect(loaded).toEqual(expect.stringContaining('virtual:tianshu-chapter/ch10_baima'));
    expect(loaded).toEqual(expect.stringContaining('loadChapterAssets'));
    const chapterId = await plugin.resolveId?.call({} as never,
      'virtual:tianshu-chapter/ch10_baima', undefined, {} as never);
    const chapter = await plugin.load?.call({} as never, chapterId as string);
    const leaf = JSON.parse((chapter as string).slice('export default '.length, -1));
    expect(chapter).toEqual(expect.stringContaining('npc_liwenxiu'));
    expect(chapter).not.toEqual(expect.stringContaining('npc_duanyu'));
    expect(leaf.mapText).toMatchObject({
      'event.ev_10_ditu.actions.0.map.name': '白马啸西风',
      'event.ev_10_ditu.actions.0.map.nodes.26.name': '大理府',
      'event.ev_10_ditu.actions.0.map.nodes.26.levelNote': '尚无区域强度配置',
      'event.ev_10_ditu.actions.0.map.nodes.26.entry.accessNote':
        '城门进入；内部场景由 ENG-09 装配',
    });
    const ch12Id = await plugin.resolveId?.call({} as never,
      'virtual:tianshu-chapter/ch12_shujian', undefined, {} as never);
    const ch12 = await plugin.load?.call({} as never, ch12Id as string);
    expect(ch12).toEqual(expect.stringContaining('npc_afanti'));
    const ch01Id = await plugin.resolveId?.call({} as never,
      'virtual:tianshu-chapter/ch01_tianlong', undefined, {} as never);
    const ch01 = await plugin.load?.call({} as never, ch01Id as string);
    expect(ch01).toEqual(expect.stringContaining('ref_map_jianghu__ch01_base01'));
    const indexId = await plugin.resolveId?.call({} as never, 'virtual:tianshu-towns',
      undefined, {} as never);
    const index = await plugin.load?.call({} as never, indexId as string);
    expect(index).toEqual(expect.stringContaining('virtual:tianshu-town/city_dali'));
    const townId = await plugin.resolveId?.call({} as never, 'virtual:tianshu-town/city_dali',
      undefined, {} as never);
    const town = await plugin.load?.call({} as never, townId as string);
    expect(town).toEqual(expect.stringContaining('town-runtime.v1'));
  }, 60_000);
});

describe('content compiler bridge', () => {
  it('compiles an Ink fixture and makes one core bridge choice', async () => {
    const directory = join(import.meta.dirname, 'fixtures');
    const source = await readFile(join(directory, 'story_choice.ink'), 'utf8');
    const metadata = await readFile(join(directory, 'story_choice.inkmeta.yaml'), 'utf8');
    const compiled = await compileInk(source, metadata, join(directory, 'story_choice.ink'));
    expect(compiled.diagnostics).toEqual([]);
    const bridge = new InkJsDialogueBridge(() => compiled.storyJson);
    const started = bridge.start('story_choice', 'wake', 17);
    expect(compiled.text).toEqual({
      'ink.story_choice.text.0000': '你从梦中醒来。',
      'ink.story_choice.text.0001': '向前',
      'ink.story_choice.text.0002': '你踏上山路。',
    });
    expect(started.choices).toEqual([{ key: '0', textKey: 'ink.story_choice.text.0001' }]);
    expect(bridge.choose(started, '0').lines.map((line) => line.textKey))
      .toEqual(['ink.story_choice.text.0002\n']);
  });
});
