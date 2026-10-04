import { describe, expect, it } from 'vitest';
import { createBattleState, resolveAreaCells } from '@tianshu/core';
import { createBattleDemo } from './demo';
import { queryActions, queryArea, queryTimeline } from './queries';
import { projectBattleUnit } from './presentation';

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
    expect(preview).toMatchObject({ valid: true, targetIds: [marker.id], targetGeometry: [{
      targetId: marker.id, direction: 'front', heightDelta: 0, heightHit: 0, hitAdd: 0,
      heightAddBp: 0, terrainAddBp: 0, positionBp: 10_000,
    }] });
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
      targetGeometry: [{ targetId: marker.id }],
    });
  });
  it('uses core preflight for the selected destination instead of app-side capability rules', () => {
    const launch = createBattleDemo('world'); const state = createBattleState(launch.setup, launch.seeds);
    const actorId = state.openingOrder[0]!; const units = state.units.map(unit =>
      projectBattleUnit(unit, launch, state));
    const actions = queryActions(state, actorId, units, { q: -1, r: 0 });
    expect(actions.move.selected).toMatchObject({ q: -1, r: 0, path: [{ q: 0, r: 0 }, { q: -1, r: 0 }] });
    expect(actions.wait).toEqual({ enabled: true, reason: '' });
    expect(actions.defend).toEqual({ enabled: true, reason: '' });
    expect(actions.item.reason).toBe('当前状态禁止此行动');
    expect(actions.gather).toEqual({ enabled: true, reason: '' });
  });
  it('previews self-target moves from the uncommitted destination', () => {
    const launch = createBattleDemo('world');
    const selfMove = { ...launch.seeds[0]!.moves[0]!, target: 'self' as const,
      delivery: 'self' as const, range: { min: 0, max: 0 }, shape: { tpl: 'aoe_self' as const } };
    const seeded = { ...launch, seeds: [{ ...launch.seeds[0]!, moves: [selfMove] }, ...launch.seeds.slice(1)] };
    const state = createBattleState(seeded.setup, seeded.seeds);
    const actor = state.openingOrder[0]!;
    expect(queryArea(state, seeded, { actor, moveId: selfMove.id, anchor: { q: -1, r: 0 },
      walkTo: { q: -1, r: 0 }, aim: { dirCount: 6, dir: 0 }, revision: 0, requestId: 3 }))
      .toMatchObject({ valid: true, cells: [{ q: -1, r: 0 }], targetIds: [actor] });
  });
});
