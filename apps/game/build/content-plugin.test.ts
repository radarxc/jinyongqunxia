import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { InkJsDialogueBridge } from '@tianshu/core';
import { compileInk } from '@tianshu/data/build';
import { describe, expect, it } from 'vitest';
import { gameContentPlugin } from './content-plugin';

describe('game content plugin town integration', () => {
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
    const indexId = await plugin.resolveId?.call({} as never, 'virtual:tianshu-towns',
      undefined, {} as never);
    const index = await plugin.load?.call({} as never, indexId as string);
    expect(index).toEqual(expect.stringContaining('virtual:tianshu-town/city_dali'));
    const townId = await plugin.resolveId?.call({} as never, 'virtual:tianshu-town/city_dali',
      undefined, {} as never);
    const town = await plugin.load?.call({} as never, townId as string);
    expect(town).toEqual(expect.stringContaining('town-runtime.v1'));
  });
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
