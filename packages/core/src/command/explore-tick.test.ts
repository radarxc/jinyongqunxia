/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- test-only fixed hash oracle.
import { createHash } from 'node:crypto';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '../rng';
import { createInitialGameState, type GameState } from '../state';
import { registerExploreTick } from '../world/explore/tick-hook';
import { dispatchCommand } from './bus';

function state(): GameState {
  const rng = Object.fromEntries(RNG_STREAMS.map((name) => [name, seedStream(12, name)]));
  return createInitialGameState({ coreVersion: 'test', chapterId: 'ch01_tianlong',
    epochId: 'epoch_ch01', epochYear: 1093, rngProtocol: RNG_PROTOCOL,
    rng: rng as GameState['meta']['rng'] });
}
function walking(base: GameState): GameState {
  return { ...base, world: { ...base.world, navigation: { ...base.world.navigation,
    mountedRegion: { regionId: 'rg_fixture', spawnId: 'entry',
      playerHex: { q: 0, r: 0 }, facing: 0, dynamicTiles: [], entities: [],
      walk: { path: [{ q: 0, r: 0 }, { q: 1, r: 0 }], progressMm: 0, pace: 'walk',
        steer: null, goal: { kind: 'hex' } } } } } };
}

describe('explore world tick hook', () => {
  it('fails fast without a hook and succeeds after an empty hook is registered', () => {
    const target = walking(state()); const before = structuredClone(target);
    expect(() => dispatchCommand(target, { t: 'world/tick' }))
      .toThrow('EXPLORE_TICK_UNAVAILABLE');
    expect(target).toEqual(before);
    registerExploreTick(() => {});
    expect(dispatchCommand(target, { t: 'world/tick' })).toMatchObject({ ok: true });
  });

  it('keeps the no-walk world tick at its fixed canonical state hash', () => {
    const actual = state();
    registerExploreTick(() => { throw new Error('HOOK_CALLED_WITHOUT_WALK'); });
    expect(dispatchCommand(actual, { t: 'world/tick' })).toMatchObject({ ok: true });
    const bytes = canonicalJson(actual as unknown as JsonValue);
    expect(createHash('sha256').update(bytes).digest('hex'))
      .toBe('12aa246c438e02f5f1e7612b2da47d327a6ece9e23acf6619ce7cefa7133c7d4');
  });
});
