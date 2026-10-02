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
