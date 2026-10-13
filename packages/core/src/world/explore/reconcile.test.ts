/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '../../rng';
import { createInitialGameState, type GameState } from '../../state';
import type { RegionMap, RegionRuntimeContent } from '../region-types';
import { fixtureMap, rectangle } from './__fixtures__/maps';
import { reconcileMountedScene } from './reconcile';

function scene(wallAt?: { q: number; r: number }): RegionMap {
  const map = fixtureMap('sc_reconcile', 5, 5, rectangle(5, 5).map((cell) =>
    wallAt && cell.q === wallAt.q && cell.r === wallAt.r ? { ...cell, terrain: 1 } : cell),
  ['tr_pingdi', 'tr_shibi']);
  return { ...map, regionId: 'rg_reconcile', chapterScope: ['ch00_yuenv'], eraLayer: 'ch00',
    objects: [{ id: 'entry', q: 0, r: 0, h: 0, cells: [{ q: 0, r: 0, h: 0 }],
      class: 'PlayerSpawn', facing: 0, safe: false, entry: true }], playerSpawns: ['entry'] };
}
function state(playerHex = { q: 2, r: 2 }): GameState {
  const rng = Object.fromEntries(RNG_STREAMS.map((name) => [name, seedStream(5, name)]));
  const base = createInitialGameState({ coreVersion: 'test', chapterId: 'ch00_yuenv',
    epochId: 'epoch', epochYear: -482, rngProtocol: RNG_PROTOCOL,
    rng: rng as GameState['meta']['rng'] });
  return { ...base, world: { ...base.world, navigation: { ...base.world.navigation,
    locationId: 'sc_reconcile', mountedRegion: { regionId: 'rg_reconcile', spawnId: 'entry',
      playerHex, facing: 0, dynamicTiles: [], entities: [], walk: { path: [playerHex, { q: 3, r: 2 }],
        progressMm: 0, pace: 'walk', steer: null, goal: { kind: 'hex' } } } } } };
}

describe('mounted scene reconciliation', () => {
  it('relocates a player deleted by a wall to the nearest r-q ordered standable hex', () => {
    const content: RegionRuntimeContent = { maps: [scene({ q: 2, r: 2 })],
      gateFacts: { qinggong: 0 } };
    const result = reconcileMountedScene(state(), content);
    expect(result.relocated).toBe(true);
    expect(result.state.world.navigation.mountedRegion?.playerHex).toEqual({ q: 2, r: 1 });
    expect(result.state.world.navigation.mountedRegion?.walk).toBeNull();
  });

  it('unmounts to the world node when the saved scene no longer exists', () => {
    const result = reconcileMountedScene(state(), { maps: [], gateFacts: { qinggong: 0 } });
    expect(result.relocated).toBe(true);
    expect(result.state.world.navigation.mountedRegion).toBeNull();
  });

  it('drops an invalid route without relocating a standable player', () => {
    const content: RegionRuntimeContent = { maps: [scene({ q: 3, r: 2 })],
      gateFacts: { qinggong: 0 } };
    const result = reconcileMountedScene(state(), content);
    expect(result.relocated).toBe(false);
    expect(result.state.world.navigation.mountedRegion?.playerHex).toEqual({ q: 2, r: 2 });
    expect(result.state.world.navigation.mountedRegion?.walk).toBeNull();
  });
});
