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
});
