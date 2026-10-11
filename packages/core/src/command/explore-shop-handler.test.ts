import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialGameState, type GameState } from '../state';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '../rng';
import { dispatchCommand } from './bus';
import { registerExploreTick } from '../world/explore/tick-hook';

function state(): GameState {
  const rng = Object.fromEntries(RNG_STREAMS.map((name) => [name, seedStream(9, name)]));
  return createInitialGameState({ coreVersion: 'test', chapterId: 'ch01_tianlong',
    epochId: 'epoch_ch01', epochYear: 1093, rngProtocol: RNG_PROTOCOL,
    rng: rng as GameState['meta']['rng'] });
}
const buy = { t: 'shop/buy' as const, shopKey: 'shop_fixture', itemId: 'it_fixture',
  count: 1, expectedUnitPrice: 10 };
const sell = { ...buy, t: 'shop/sell' as const };
const travel = { t: 'world/travelTo' as const, target: { kind: 'hex' as const,
  hex: { q: 1, r: 0 } } };
const meditate = { t: 'world/meditate' as const, anchorId: 'med_fixture',
  plannedTicks: 600 as const };
const stop = { t: 'world/stop' as const };
const steer = { t: 'world/steer' as const, dir: 0 as const };

describe('explore and shop kernel handlers', () => {
  beforeEach(() => registerExploreTick(() => {}));
  it.each([[buy, 'SHOP_UNKNOWN'], [sell, 'SHOP_UNKNOWN'],
    [travel, 'REGION_PATH_BLOCKED'], [meditate, 'REGION_PATH_BLOCKED']] as const)(
    'routes %s to its stub rejection', (command, reason) => {
      expect(dispatchCommand(state(), command)).toEqual({ ok: false, reason });
    });
  it.each([stop, steer])('accepts %s as a zero-write no-op when not walking', (command) => {
    const target = state(); const before = structuredClone(target);
    expect(dispatchCommand(target, command)).toEqual({ ok: true, stateVersion: 0, events: [] });
    expect(target).toEqual(before);
  });
  it.each([buy, sell, travel, meditate, stop, steer])(
    'rejects %s while dialogue, battle, or a mount is pending', (command) => {
      for (const busy of ['dialogue', 'battle', 'mount'] as const) {
        const base = state();
        const target: GameState = busy === 'dialogue' ? { ...base, dialogue: { storyId: 'story_fixture',
          storyHash: '0'.repeat(64), entryKey: 'start', storyJsonState: '{}', randomSeed: 1,
          pendingIntents: [], consumedTagKeys: [] } }
          : busy === 'battle' ? { ...base, battle: {} as GameState['battle'] }
          : { ...base, world: { ...base.world, navigation: { ...base.world.navigation,
            pendingMount: { regionId: 'rg_fixture', sceneId: 'sc_fixture',
              spawnId: 'entry' } } } };
        expect(dispatchCommand(target, command)).toEqual({ ok: false,
          reason: 'REGION_INTERACTION_BUSY' });
      }
    });
});
