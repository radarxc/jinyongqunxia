import { Buffer } from 'node:buffer';
import type { WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { createSelectors } from '../projection';
import { createPreviewSession } from './bootstrap';
import { ALL_VIEWS } from './contracts';
import { createGameSession } from './session';
import { fixtureContent } from './test-fixture';

function bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

describe('world-map transport projection', () => {
  it('reuses the reachable set while movement stays in the same road component', () => {
    const content = fixtureContent();
    const state = createPreviewSession(content);
    const selectors = createSelectors(content);
    selectors.update(state, ALL_VIEWS);
    const first = selectors.query().worldmap!.reachableNodeIds;
    const moved = { ...state, chapter: { ...state.chapter, worldMap: {
      ...state.chapter.worldMap!, position: { kind: 'road' as const, leg: {
        roadKey: 'route_dali_kunming:0', from: 'city_dali', to: 'city_qujing',
      }, offsetLi: 10 },
    } } };
    selectors.update(moved, ['worldmap'], '', true);
    expect(selectors.query().worldmap!.reachableNodeIds).toBe(first);
  });

  it('sends static geometry once and only movement fields over ten travel steps', async () => {
    const session = createGameSession(fixtureContent());
    const initial = await session.query();
    expect(initial.worldmapStatic).toBeTruthy();
    const legacy = initial.worldmap as typeof initial.worldmap & {
      readonly map?: WorldMapRuntimeDefinition; readonly mapTextureUrl?: string | null;
    };
    const projected = initial as typeof initial & { readonly worldmapStatic?: {
      readonly map: WorldMapRuntimeDefinition; readonly mapTextureUrl: string | null;
    } | null };
    const geometry = projected.worldmapStatic ?? { map: legacy!.map!,
      mapTextureUrl: legacy!.mapTextureUrl ?? null };
    expect(geometry.map.nodes).toHaveLength(201);
    expect(geometry.map.roads).toHaveLength(90);
    expect(initial.worldmap).not.toHaveProperty('map');
    expect(initial.worldmap).not.toHaveProperty('mapTextureUrl');

    const expectedReachable = initial.worldmap!.reachableNodeIds;
    const started = await session.dispatch({ t: 'worldmap/travel', nodeId: 'city_aksu' });
    let journey = started.changes.worldmap!.journey!;
    let actualBytes = 0; let legacyBytes = 0;
    for (let index = 0; index < 10; index += 1) {
      const update = await session.dispatch({ t: 'worldmap/step', journeyId: journey.id,
        expectedTravelledLi: journey.travelledLi });
      const movement = update.changes.worldmap!;
      expect(Object.keys(movement).sort()).toEqual(['journey', 'point', 'reachableNodeIds']);
      expect(movement.reachableNodeIds).toEqual(expectedReachable);
      expect(update.changes).not.toHaveProperty('worldmapStatic');
      const queried = (await session.query()).worldmap!;
      expect(queried).toMatchObject(movement);
      expect(queried.positionNodeId).toBeNull();
      actualBytes += bytes(update);
      legacyBytes += bytes({ ...update, changes: { ...update.changes, worldmap: {
        ...movement, ...geometry,
      } } });
      journey = movement.journey!;
    }
    expect(actualBytes).toBeLessThan(legacyBytes);
  });

  it('sends a full dynamic projection when a travel step enters a scene', async () => {
    const session = createGameSession(fixtureContent());
    const started = await session.dispatch({ t: 'worldmap/travel', nodeId: 'rs_tianlongsi' });
    const journey = started.changes.worldmap!.journey!;
    const arrived = await session.dispatch({ t: 'worldmap/step', journeyId: journey.id,
      expectedTravelledLi: journey.travelledLi });

    expect(arrived.changes.worldmap).toMatchObject({
      positionNodeId: 'rs_tianlongsi', journey: null,
      scene: { kind: 'ruin', nodeId: 'rs_tianlongsi' },
    });
    expect(arrived.changes).not.toHaveProperty('worldmapStatic');
  });
});
