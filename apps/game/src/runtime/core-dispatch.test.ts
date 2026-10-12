import { beforeAll, describe, expect, it, vi } from 'vitest';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '@tianshu/core/state';
import { createInitialGameState, type GameState } from '@tianshu/core/state';
import { dispatchCoreCommand } from './core-dispatch';

const loads = vi.hoisted(() => ({ shop: 0, explore: 0 }));
vi.mock('@tianshu/core/shop-command', async (importOriginal) => {
  loads.shop += 1;
  return importOriginal();
});
vi.mock('@tianshu/core/explore-command', async (importOriginal) => {
  loads.explore += 1;
  return importOriginal();
});

function state(): GameState {
  const rng = Object.fromEntries(RNG_STREAMS.map((name) => [name, seedStream(17, name)]));
  return createInitialGameState({ coreVersion: 'test', chapterId: 'ch01_tianlong',
    epochId: 'epoch_ch01', epochYear: 1093, rngProtocol: RNG_PROTOCOL,
    rng: rng as GameState['meta']['rng'] });
}

describe('core command family lazy loading', () => {
  beforeAll(() => { loads.shop = 0; loads.explore = 0; });

  it('loads shop on first shop dispatch and reuses it thereafter', async () => {
    expect(loads.shop).toBe(0);
    const target = state();
    const buy = { t: 'shop/buy' as const, shopKey: 'shop_fixture', itemId: 'it_fixture',
      count: 1, expectedUnitPrice: 10 };
    await expect(dispatchCoreCommand(target, buy)).resolves.toEqual({ ok: false,
      reason: 'SHOP_UNKNOWN' });
    expect(loads.shop).toBe(1);
    await dispatchCoreCommand(target, { ...buy, t: 'shop/sell' });
    expect(loads.shop).toBe(1);
  });

  it('loads explore before ticking a walking state', async () => {
    expect(loads.explore).toBe(0);
    const base = state();
    const target: GameState = { ...base, world: { ...base.world, navigation: {
      ...base.world.navigation, mountedRegion: { regionId: 'rg_fixture', spawnId: 'entry',
        playerHex: { q: 0, r: 0 }, facing: 0, dynamicTiles: [], entities: [],
        walk: { path: [{ q: 0, r: 0 }, { q: 1, r: 0 }], progressMm: 0, pace: 'walk',
          steer: null, goal: { kind: 'hex' } } } } } };
    await expect(dispatchCoreCommand(target, { t: 'world/tick' })).resolves
      .toMatchObject({ ok: true });
    expect(loads.explore).toBe(1);
  });
});
