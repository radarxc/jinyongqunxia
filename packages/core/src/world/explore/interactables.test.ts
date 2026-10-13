/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '../../rng';
import { createInitialGameState, type GameState } from '../../state';
import type { RegionMap, RegionObject, RegionRuntimeContent } from '../region-types';
import { fixtureMap, rectangle } from './__fixtures__/maps';
import { insideBuildingId, queryExploreInteractables } from './interactables';
import { exploreWalkContext } from './walk-validate';

const h = (q: number, r: number) => ({ q, r, h: 0 });
const base = (id: string, q: number, r: number) => ({ id, q, r, h: 0, cells: [h(q, r)] });
function scene(): RegionMap {
  const cells = rectangle(7, 5).map((cell) => cell.q === 3 && cell.r === 2
    ? { ...cell, terrain: 1 } : { ...cell, building: cell.q === 1 && cell.r === 2 ? 1 : 0 });
  const source = fixtureMap('sc_interact', 7, 5, cells, ['tr_pingdi', 'tr_shibi']);
  const objects: RegionObject[] = [
    { ...base('bi_house', 1, 1), class: 'Building', footprint: { q: 1, r: 1, width: 1, height: 1 },
      interiorRect: { q: 1, r: 1, width: 1, height: 1 }, roofGroup: 'roof', cutawayWalls: [] },
    { ...base('npc_a', 1, 2), class: 'NpcSpawn', npcId: 'npc_a', facing: 0 },
    { ...base('npc_b', 2, 1), class: 'FacilityNpc', facilityKey: 'fac_a', roleKey: 'keeper',
      facing: 0, interactRange: 3, appearance: { template: 'tpl_m_medium', outfit: 'out_a', seed: 1 } },
    { ...base('npc_hidden', 4, 2), class: 'NpcSpawn', npcId: 'npc_hidden', facing: 0 },
  ];
  for (let index = 0; index < 10; index += 1) objects.push({ ...base(`door_${index}`, 1, 2),
    class: 'Door', mode: 'door', pairId: `pair_${index}`, oneWay: false,
    targetRegionId: 'rg_other', targetSceneId: 'sc_other', targetSpawnId: 'entry' });
  return { ...source, regionId: 'rg_interact', objects, playerSpawns: [] };
}
function state(): GameState {
  const rng = Object.fromEntries(RNG_STREAMS.map((name) => [name, seedStream(2, name)]));
  const baseState = createInitialGameState({ coreVersion: 'test', chapterId: 'ch00_yuenv',
    epochId: 'epoch', epochYear: -482, rngProtocol: RNG_PROTOCOL,
    rng: rng as GameState['meta']['rng'] });
  return { ...baseState, world: { ...baseState.world, navigation: { ...baseState.world.navigation,
    locationId: 'sc_interact', mountedRegion: { regionId: 'rg_interact', spawnId: 'entry',
      playerHex: { q: 0, r: 2 }, facing: 0, dynamicTiles: [], entities: [], walk: null } } } };
}

describe('explore interactable projection', () => {
  it('limits to eight and sorts by distance, r, q, id while a stone wall blocks sight', () => {
    const map = scene(); const content: RegionRuntimeContent = { maps: [map], gateFacts: { qinggong: 0 } };
    const values = queryExploreInteractables(state(), content);
    expect(values).toHaveLength(8);
    expect(values.map((entry) => entry.id)).toEqual([...values].sort((left, right) =>
      left.distance - right.distance || left.hex.r - right.hex.r || left.hex.q - right.hex.q ||
      (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)).map((entry) => entry.id));
    expect(values.some((entry) => entry.id === 'npc_hidden')).toBe(false);
  });

  it('lets blocked counters transmit sight and derives insideBuildingId from the building layer', () => {
    const map = scene(); const target = state();
    const mounted = target.world.navigation.mountedRegion!;
    const adjusted = { ...target, world: { ...target.world, navigation: { ...target.world.navigation,
      mountedRegion: { ...mounted, playerHex: { q: 1, r: 2 }, entities: Array.from({ length: 10 },
        (_, index) => ({ anchorId: `door_${index}`, active: false, consumed: false })) } } } };
    const content: RegionRuntimeContent = { maps: [map], gateFacts: { qinggong: 0 } };
    const context = exploreWalkContext(adjusted, content)!;
    expect(insideBuildingId(map, context.graph, { q: 1, r: 2 })).toBe('bi_house');
    expect(queryExploreInteractables(adjusted, content).some((entry) => entry.id === 'npc_b')).toBe(true);
    const counterMap = scene();
    const chunk = counterMap.chunks[0]!;
    const bytes = Buffer.from(chunk.blocked ?? Buffer.alloc(128).toString('base64'), 'base64');
    const index = 2 * 32 + 2; bytes[index >> 3] = bytes[index >> 3]! | 1 << (index & 7);
    const withCounter = { ...counterMap, chunks: [{ ...chunk, blocked: bytes.toString('base64') }],
      objects: [...counterMap.objects, { ...base('npc_counter', 3, 2), class: 'FacilityNpc' as const,
        facilityKey: 'fac_counter', roleKey: 'keeper', facing: 0 as const, interactRange: 3,
        appearance: { template: 'tpl_m_medium' as const, outfit: 'out_counter', seed: 2 } }] };
    const throughCounter = { ...adjusted, world: { ...adjusted.world, navigation: {
      ...adjusted.world.navigation, mountedRegion: { ...adjusted.world.navigation.mountedRegion!,
        playerHex: { q: 1, r: 2 } } } } };
    expect(queryExploreInteractables(throughCounter, { maps: [withCounter],
      gateFacts: { qinggong: 0 } }).some((entry) => entry.id === 'npc_counter')).toBe(true);
  });
});
