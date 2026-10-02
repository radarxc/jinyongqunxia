import { describe, expect, it } from 'vitest';
import { createBattleState, resolveAreaCells } from '@tianshu/core';
import { createBattleDemo } from './demo';
import { queryArea, queryTimeline } from './queries';

describe('battle UI queries', () => {
  it('returns the same clipped cells as the core area resolver and stable targets', () => {
    const launch = createBattleDemo('world');
    const state = createBattleState(launch.setup, launch.seeds);
    const actor = state.openingOrder[0]!;
    const marker = launch.markers.find(unit => unit.id !== actor)!;
    const input = { actor, moveId: 'mv_basic_strike', anchor: { q: marker.q, r: marker.r },
      aim: { dirCount: 6, dir: 0 } as const, revision: 0, requestId: 1 };
    const preview = queryArea(state, launch, input);
    expect(preview.cells).toEqual(resolveAreaCells(launch.moves[0]!.shape, {
      origin: launch.markers.find(unit => unit.id === actor)!, anchor: input.anchor,
      aim: input.aim, available: launch.cells }));
    expect(preview).toMatchObject({ valid: true, targetIds: [marker.id] });
  });
  it('projects eight CT entries without mutating the authoritative battle state', () => {
    const launch = createBattleDemo('world');
    const state = createBattleState(launch.setup, launch.seeds);
    const before = structuredClone(state);
    expect(queryTimeline(state)).toHaveLength(8);
    expect(state).toEqual(before);
  });
  it('keeps tile-target anchors as coordinates even when a unit occupies the anchor', () => {
    const launch = createBattleDemo('world');
    const tileMove = { ...launch.seeds[0]!.moves[0]!, target: 'tile' as const,
      delivery: 'ranged' as const, range: { min: 1, max: 2 },
      shape: { tpl: 'aoe_disk' as const, r: 1 } };
    const cloned = structuredClone(launch);
    const seeded = { ...cloned, seeds: [{ ...cloned.seeds[0]!, moves: [tileMove] }, ...cloned.seeds.slice(1)] };
    const state = createBattleState(seeded.setup, seeded.seeds);
    const actor = state.openingOrder[0]!; const marker = seeded.markers.find(unit => unit.id !== actor)!;
    expect(queryArea(state, seeded, { actor, moveId: tileMove.id, anchor: { q: marker.q, r: marker.r },
      aim: { dirCount: 6, dir: 0 }, revision: 0, requestId: 2 })).toMatchObject({
      valid: true, anchor: { q: marker.q, r: marker.r }, targetIds: [marker.id],
    });
  });
});
