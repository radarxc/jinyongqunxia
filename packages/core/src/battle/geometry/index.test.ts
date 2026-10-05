import { describe, expect, it } from 'vitest';
import { createRng, RNG_STREAMS, seedStream } from '../../rng';
import { lineOfSight } from '../../hex';
import { BASIC_MOVE, combatFixture } from '../../testing/combat-fixture';
import { directionBetween, queryDamageGeometry, queryLegalTargets, queryMoveAt, queryPath,
  queryReachable } from './index';

describe('battle geometry queries', () => {
  it('does not mutate battle state while querying reachability, path and targets', () => {
    const state = combatFixture(); const before = JSON.stringify(state);
    const streams = Object.fromEntries(RNG_STREAMS.map(name => [name, createRng(seedStream(17, name))]));
    const rngBefore = Object.fromEntries(RNG_STREAMS.map(name => [name, streams[name]!.snapshot()]));
    expect(queryReachable(state, 'hero').length).toBeGreaterThan(1);
    expect(queryPath(state, 'hero', { q: 0, r: 1 })?.cost).toBe(2);
    expect(queryLegalTargets(state, 'hero', BASIC_MOVE.id).map(unit => unit.id)).toEqual(['enemy_0']);
    expect(JSON.stringify(state)).toBe(before);
    expect(Object.fromEntries(RNG_STREAMS.map(name => [name, streams[name]!.snapshot()]))).toEqual(rngBefore);
  });

  it('returns stable range and target reasons from the core', () => {
    const state = combatFixture({ gridRadius: 4 });
    state.units[1]!.pos = { q: 3, r: 0 };
    expect(queryMoveAt(state, 'hero', BASIC_MOVE.id, 'enemy_0').reason).toBe('OUT_OF_RANGE');
    expect(queryMoveAt(state, 'hero', BASIC_MOVE.id, 'missing').reason).toBe('INVALID_TARGET');
  });

  it('keeps the zero-distance path valid without ignoring an occupied or missing origin', () => {
    const state = combatFixture(); const actor = state.units[0]!;
    expect(queryPath(state, actor.id, actor.pos)).toEqual({ path: [{ ...actor.pos }],
      cost: 0, actionCount: 0, dangerCount: 0 });
    state.units[1]!.pos = { ...actor.pos };
    expect(queryPath(state, actor.id, actor.pos)).toBeNull();
    actor.pos = { q: 100, r: 100 };
    expect(() => queryPath(state, actor.id, actor.pos)).toThrow('PATH_START_OUTSIDE_GRID');
  });

  it('rejects a direct target outside the default twelve-cell sight radius', () => {
    const move = { ...BASIC_MOVE, delivery: 'ranged' as const, range: { min: 1, max: 13 } };
    const state = combatFixture({ gridRadius: 4, playerMoves: [move] });
    const cells = state.grid.cells as Array<(typeof state.grid.cells)[number]>;
    for (let q = 5; q <= 13; q += 1) cells.push({ q, r: 0, height: 0, moveCost: 1, canopy: 0,
      los: 'none', standable: true, narrow: false, dangerous: false, terrainDealtBp: 0,
      terrainTakenBp: 0, cover: null });
    state.units[1]!.pos = { q: 13, r: 0 };
    expect(queryMoveAt(state, 'hero', move.id, 'enemy_0').reason).toBe('NO_LOS');
  });

  it('applies and bypasses hostile ZOC through the battle query adapter', () => {
    const state = combatFixture({ gridRadius: 3 });
    expect(queryPath(state, 'hero', { q: -1, r: 0 })?.cost).toBe(2);
    state.units[0]!.buffs.push({ iid: 1, def: 'bf_dunzou', holder: 'hero', source: null,
      grade: 1, stacks: 1, turnsLeft: 1, fresh: false });
    expect(queryPath(state, 'hero', { q: -1, r: 0 })?.cost).toBe(1);
  });

  it('aims at the closest world direction and uses facing then dir for exact ties', () => {
    expect(directionBetween({ q: 0, r: 0 }, { q: 2, r: -1 }, 0)).toBe(0);
    expect(directionBetween({ q: 0, r: 0 }, { q: 2, r: -1 }, 1)).toBe(1);
    expect(directionBetween({ q: 0, r: 0 }, { q: 2, r: -1 }, 3)).toBe(1);
  });

  it('evaluates all 21 facing and melee-height vectors from target to source', () => {
    const positions = { front: { q: 1, r: 0 }, side: { q: 0, r: -1 },
      back: { q: -1, r: 0 } } as const;
    const expected = [
      ['front', [9_000, 9_000, 9_500, 10_000, 10_500, 11_000, 11_000]],
      ['side', [9_900, 9_900, 10_450, 11_000, 11_550, 12_100, 12_100]],
      ['back', [11_700, 11_700, 12_350, 13_000, 13_650, 14_300, 14_300]],
    ] as const;
    const heightHit = [-12, -8, -4, 0, 4, 8, 12];
    const heightAddBp = [-1_000, -1_000, -500, 0, 500, 1_000, 1_000];
    let vectors = 0;
    for (const [direction, positionBp] of expected) {
      for (let index = 0; index < 7; index += 1) {
        const delta = index - 3;
        const state = combatFixture({ gridRadius: 4 });
        const actor = state.units[0]!; const target = state.units[1]!;
        actor.pos = positions[direction]; target.pos = { q: 0, r: 0 }; target.facing = 0;
        Object.assign(state.grid.cells.find(cell => cell.q === actor.pos.q && cell.r === actor.pos.r)!,
          { height: 3 + delta });
        Object.assign(state.grid.cells.find(cell => cell.q === 0 && cell.r === 0)!, { height: 3 });
        expect(queryDamageGeometry(state, actor, target, BASIC_MOVE)).toMatchObject({
          direction, heightDelta: delta, heightHit: heightHit[index],
          hitAdd: heightHit[index], heightAddBp: heightAddBp[index], positionBp: positionBp[index],
        });
        vectors += 1;
      }
    }
    expect(vectors).toBe(21);
  });

  it('combines directional cover, canopy LOS and materialized terrain per target', () => {
    const move = { ...BASIC_MOVE, direction: 'front' as const, delivery: 'ranged' as const,
      range: { min: 1, max: 4 } };
    const state = combatFixture({ gridRadius: 4, playerMoves: [move] });
    const actor = state.units[0]!; const target = state.units[1]!; target.pos = { q: 4, r: 0 };
    Object.assign(state.grid.cells.find(cell => cell.q === 0 && cell.r === 0)!,
      { terrainDealtBp: 700 });
    Object.assign(state.grid.cells.find(cell => cell.q === 4 && cell.r === 0)!,
      { terrainTakenBp: -200, cover: { vs: ['ranged'], hit: -15, damageBp: -1_000,
        sourceDirs: [3] } });
    Object.assign(state.grid.cells.find(cell => cell.q === 2 && cell.r === 0)!,
      { los: 'partial', canopy: 1 });
    const before = JSON.stringify(state);
    expect(queryDamageGeometry(state, actor, target, move)).toMatchObject({
      sourceDirection: 3, direction: 'front', coverHit: -15, coverDamageBp: -1_000,
      losHitPenalty: -10, hitAdd: -25, terrainAddBp: -500, positionBp: 9_500,
      evadeRatingDelta: 0, lineOfSight: { ok: true, partial: 1 },
    });
    expect(JSON.stringify(state)).toBe(before);
    const permuted = structuredClone(state);
    (permuted.grid as { cells: typeof permuted.grid.cells }).cells = [...permuted.grid.cells].reverse();
    expect(queryDamageGeometry(permuted, permuted.units[0]!, permuted.units[1]!, move))
      .toEqual(queryDamageGeometry(state, actor, target, move));
  });

  it('applies delivery-specific cover hit values without changing the fallback contract', () => {
    const state = combatFixture(); const actor = state.units[0]!; const target = state.units[1]!;
    Object.assign(state.grid.cells.find(cell => cell.q === target.pos.q && cell.r === target.pos.r)!,
      { cover: { vs: ['projectile', 'ranged'], hit: -5,
        hitByDelivery: { projectile: -10, ranged: -5 }, damageBp: 0 } });
    expect(queryDamageGeometry(state, actor, target, { ...BASIC_MOVE, delivery: 'projectile' })
      .coverHit).toBe(-10);
    expect(queryDamageGeometry(state, actor, target, { ...BASIC_MOVE, delivery: 'ranged' })
      .coverHit).toBe(-5);
  });

  it('applies bamboo Z7 damage only to spear and staff martial-art subtypes', () => {
    const state = combatFixture(); const actor = state.units[0]!; const target = state.units[1]!;
    Object.assign(state.grid.cells.find(cell => cell.q === actor.pos.q && cell.r === actor.pos.r)!,
      { terrainDealtBySubTypeBp: { spear: -1_000, staff: -1_000 } });
    expect(queryDamageGeometry(state, actor, target, { ...BASIC_MOVE, subType: 'spear' }))
      .toMatchObject({ terrainAddBp: -1_000, positionBp: 9_000 });
    expect(queryDamageGeometry(state, actor, target, { ...BASIC_MOVE, subType: 'staff' }))
      .toMatchObject({ terrainAddBp: -1_000, positionBp: 9_000 });
    expect(queryDamageGeometry(state, actor, target, { ...BASIC_MOVE, subType: 'sword' }))
      .toMatchObject({ terrainAddBp: 0, positionBp: 10_000 });
    expect(queryDamageGeometry(state, actor, target, BASIC_MOVE))
      .toMatchObject({ terrainAddBp: 0, positionBp: 10_000 });
  });

  it('uses ranged height limits, cover delivery and directional exposure exactly once', () => {
    const ranged = { ...BASIC_MOVE, delivery: 'ranged' as const, range: { min: 1, max: 4 } };
    const projectile = { ...ranged, delivery: 'projectile' as const };
    const sonic = { ...ranged, delivery: 'sonic' as const };
    const state = combatFixture({ gridRadius: 4, playerMoves: [ranged, projectile, sonic] });
    const actor = state.units[0]!; const target = state.units[1]!; target.pos = { q: 4, r: 0 };
    Object.assign(state.grid.cells.find(cell => cell.q === 0 && cell.r === 0)!,
      { height: 4, terrainDealtBp: 1_500 });
    Object.assign(state.grid.cells.find(cell => cell.q === 4 && cell.r === 0)!, {
      height: 0, terrainTakenBp: 1_000,
      cover: { vs: ['projectile'], hit: -15, damageBp: -1_000, sourceDirs: [3] },
    });
    expect(queryDamageGeometry(state, actor, target, ranged)).toMatchObject({
      heightHit: 12, heightAddBp: 1_600, coverHit: 0, coverDamageBp: 0, terrainAddBp: 2_500,
    });
    expect(queryDamageGeometry(state, actor, target, sonic)).toMatchObject({
      heightHit: 12, heightAddBp: 0, coverHit: 0, coverDamageBp: 0, terrainAddBp: 2_500,
    });
    expect(queryDamageGeometry(state, actor, target, projectile)).toMatchObject({
      sourceDirection: 3, coverHit: -15, coverDamageBp: -1_000, terrainAddBp: 1_500,
    });
    Object.assign(state.grid.cells.find(cell => cell.q === 4 && cell.r === 0)!, {
      cover: { vs: ['projectile'], hit: -15, damageBp: -1_000, sourceDirs: [2] },
    });
    expect(queryDamageGeometry(state, actor, target, projectile)).toMatchObject({
      sourceDirection: 3, coverHit: 0, coverDamageBp: 0, terrainAddBp: 2_500,
    });
  });

  it('derives position from cells instead of the legacy static move direction', () => {
    const state = combatFixture(); const actor = state.units[0]!; const target = state.units[1]!;
    actor.pos = { q: 1, r: 0 }; target.pos = { q: 0, r: 0 }; target.facing = 0;
    expect(queryDamageGeometry(state, actor, target, BASIC_MOVE).direction).toBe('front');
    expect(queryDamageGeometry(state, actor, target, { ...BASIC_MOVE, direction: 'back' }).direction)
      .toBe('front');
  });

  it('projects melee guard turning as a front attack without mutating the target', () => {
    const state = combatFixture(); const actor = state.units[0]!; const target = state.units[1]!;
    actor.pos = { q: -1, r: 0 }; target.pos = { q: 0, r: 0 }; target.facing = 0;
    target.buffs.push({ iid: 1, def: 'bf_jiangu', holder: target.id, source: target.id,
      grade: 1, stacks: 1, turnsLeft: 1, fresh: false });
    const before = structuredClone(target);
    expect(queryDamageGeometry(state, actor, target, BASIC_MOVE).direction).toBe('front');
    expect(target).toEqual(before);
  });

  it('implements wall, unit and delivery LOS rules with integer comparisons', () => {
    const cells = Array.from({ length: 5 }, (_, q) => ({ q, r: 0, height: q === 2 ? 3 : 0,
      canopy: 0, los: 'none' as const, occupied: q === 2 }));
    const common = { from: cells[0]!, to: cells[4]!, cells };
    expect(lineOfSight({ ...common, delivery: 'ranged' }).ok).toBe(false);
    expect(lineOfSight({ ...common, delivery: 'projectile' }).ok).toBe(false);
    expect(lineOfSight({ ...common, delivery: 'sonic' }).ok).toBe(true);
    expect(lineOfSight({ ...common, delivery: 'melee', hTol: 2 }).ok).toBe(true);
    const lower = cells.map(cell => ({ ...cell, height: cell.q === 2 ? 2 : 0 }));
    expect(lineOfSight({ from: lower[0]!, to: lower[4]!, cells: lower, delivery: 'ranged' }).ok).toBe(true);
  });

  it('lets ranged attacks shoot over units while projectiles are blocked', () => {
    const cells = Array.from({ length: 5 }, (_, q) => ({ q, r: 0, height: 0, canopy: 0,
      los: 'none' as const, occupied: q === 2 }));
    expect(lineOfSight({ from: cells[0]!, to: cells[4]!, cells, delivery: 'ranged' }).ok).toBe(true);
    expect(lineOfSight({ from: cells[0]!, to: cells[4]!, cells, delivery: 'projectile' }).ok).toBe(false);
  });

  it('makes an aimed bolt hit the first unit on its ray regardless of side', () => {
    const bolt = { ...BASIC_MOVE, delivery: 'projectile' as const, target: 'tile' as const,
      range: { min: 1, max: 4 }, shape: { tpl: 'aoe_bolt' as const, r: 4 },
      friendlyFire: 'none' as const };
    const state = combatFixture({ gridRadius: 4, playerMoves: [bolt], enemies: 2 });
    Object.assign(state.units[1]!, { side: 'player' as const, pos: { q: 2, r: 0 } });
    state.units[2]!.pos = { q: 4, r: 0 };
    const result = queryMoveAt(state, 'hero', bolt.id, { q: 4, r: 0 },
      { aim: { dirCount: 6, dir: 0 } });
    expect(result.reason).toBeNull();
    expect(result.cells).toEqual([
      { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 }, { q: 4, r: 0 },
    ]);
    expect(result.targets.map(unit => unit.id)).toEqual(['enemy_0']);
  });

  it('requires direct targets to be visible and excludes feigned-death area targets', () => {
    const ranged = { ...BASIC_MOVE, delivery: 'ranged' as const, range: { min: 1, max: 4 } };
    const state = combatFixture({ gridRadius: 4, playerMoves: [ranged] });
    state.units[1]!.pos = { q: 4, r: 0 };
    for (const q of [1, 2]) Object.assign(
      state.grid.cells.find(cell => cell.q === q && cell.r === 0)!,
      { los: 'partial', canopy: 1 },
    );
    expect(queryMoveAt(state, 'hero', ranged.id, 'enemy_0').reason).toBe('NO_LOS');
    for (const q of [1, 2]) Object.assign(
      state.grid.cells.find(cell => cell.q === q && cell.r === 0)!,
      { los: 'none', canopy: 0 },
    );
    state.units[1]!.buffs.push({ iid: 1, def: 'bf_yinshen', holder: 'enemy_0', source: null,
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    expect(queryMoveAt(state, 'hero', ranged.id, 'enemy_0').reason).toBe('INVALID_TARGET');
    state.units[0]!.buffs.push({ iid: 1, def: 'bf_tingfeng', holder: 'hero', source: null,
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    expect(queryMoveAt(state, 'hero', ranged.id, 'enemy_0').reason).toBeNull();

    const area = { ...ranged, target: 'tile' as const, shape: { tpl: 'aoe_disk' as const, r: 1 } };
    const areaState = combatFixture({ gridRadius: 4, playerMoves: [area] });
    areaState.units[1]!.pos = { q: 3, r: 0 };
    areaState.units[1]!.buffs.push({ iid: 1, def: 'bf_zhasi', holder: 'enemy_0', source: null,
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    expect(queryMoveAt(areaState, 'hero', area.id, { q: 3, r: 0 }).targets).toEqual([]);
  });

  it('supports empty tile anchors and filters area targets by friendly-fire rules', () => {
    const tileMove = { ...BASIC_MOVE, target: 'tile' as const, delivery: 'ranged' as const,
      range: { min: 1, max: 3 }, shape: { tpl: 'aoe_disk' as const, r: 1 }, autoTargetCap: 1 };
    const state = combatFixture({ gridRadius: 3, playerMoves: [tileMove], enemies: 2 });
    state.units[1]!.pos = { q: 2, r: 0 }; state.units[2]!.pos = { q: 1, r: 1 };
    expect(queryMoveAt(state, 'hero', tileMove.id, { q: 1, r: 0 })).toMatchObject({
      reason: null, targets: [{ id: 'enemy_0' }, { id: 'enemy_1' }],
    });
    const all = { ...tileMove, friendlyFire: 'all' as const };
    const allState = combatFixture({ gridRadius: 3, playerMoves: [all], enemies: 2 });
    allState.units[1]!.pos = { q: 2, r: 0 }; allState.units[2]!.pos = { q: 1, r: 1 };
    expect(queryMoveAt(allState, 'hero', all.id, { q: 1, r: 0 }).targets.map(unit => unit.id))
      .toEqual(['hero', 'enemy_0', 'enemy_1']);
  });

  it('uses self as the anchor without restricting an around attack to self', () => {
    const around = { ...BASIC_MOVE, target: 'self' as const, range: { min: 0, max: 0 },
      shape: { tpl: 'aoe_around' as const } };
    const state = combatFixture({ playerMoves: [around] });
    const result = queryMoveAt(state, 'hero', around.id, 'hero');
    expect(result.reason).toBeNull();
    expect(result.targets.map(unit => unit.id)).toEqual(['enemy_0']);
    expect(result.cells).not.toContainEqual({ q: 0, r: 0 });
  });

  it('evaluates self areas and projectile LOS from a hypothetical stand position', () => {
    const self = { ...BASIC_MOVE, target: 'self' as const, range: { min: 0, max: 0 },
      shape: { tpl: 'aoe_self' as const } };
    const state = combatFixture({ gridRadius: 4, playerMoves: [self] });
    expect(queryMoveAt(state, 'hero', self.id, 'hero', { from: { q: 1, r: -1 } })).toMatchObject({
      reason: null, cells: [{ q: 1, r: -1 }], targets: [{ id: 'hero' }],
    });
    const projectile = { ...BASIC_MOVE, delivery: 'projectile' as const,
      range: { min: 1, max: 4 } };
    Object.assign(state.units[0]!, { moves: [projectile] }); state.units[1]!.pos = { q: -2, r: 0 };
    expect(queryMoveAt(state, 'hero', projectile.id, 'enemy_0', { from: { q: 2, r: 0 } }).reason)
      .toBeNull();
    expect(state.units[0]!.pos).toEqual({ q: 0, r: 0 });
    const area = { ...BASIC_MOVE, target: 'tile' as const, delivery: 'ranged' as const,
      range: { min: 1, max: 3 }, shape: { tpl: 'aoe_disk' as const, r: 1 },
      friendlyFire: 'all' as const };
    Object.assign(state.units[0]!, { moves: [area] }); state.units[1]!.pos = { q: 1, r: 0 };
    expect(queryMoveAt(state, 'hero', area.id, { q: 1, r: 0 }, { from: { q: 2, r: 0 } })
      .targets.map(unit => unit.id)).toEqual(['hero', 'enemy_0']);
  });

  it('rejects hidden direct targets but lets an area anchored on a tile reveal them', () => {
    const move = { ...BASIC_MOVE, target: 'tile' as const, delivery: 'ranged' as const,
      range: { min: 1, max: 3 }, shape: { tpl: 'aoe_disk' as const, r: 1 } };
    const state = combatFixture({ gridRadius: 3, playerMoves: [move] });
    state.units[1]!.state = 'hidden'; state.units[1]!.pos = { q: 2, r: 0 };
    expect(queryMoveAt(state, 'hero', move.id, 'enemy_0').reason).toBe('INVALID_TARGET');
    expect(queryMoveAt(state, 'hero', move.id, { q: 2, r: 0 }).targets.map(unit => unit.id))
      .toEqual(['enemy_0']);
  });

  it('applies ranged height range and clips area cells outside hTol', () => {
    const move = { ...BASIC_MOVE, delivery: 'ranged' as const, range: { min: 1, max: 2 },
      shape: { tpl: 'aoe_disk' as const, r: 1 }, hTol: 1 };
    const state = combatFixture({ gridRadius: 4, playerMoves: [move] });
    Object.assign(state.grid.cells.find(cell => cell.q === 0 && cell.r === 0)!, { height: 4 });
    state.units[1]!.pos = { q: 4, r: 0 };
    expect(queryMoveAt(state, 'hero', move.id, 'enemy_0').reason).toBeNull();
    Object.assign(state.grid.cells.find(cell => cell.q === 4 && cell.r === -1)!, { height: 3 });
    expect(queryMoveAt(state, 'hero', move.id, 'enemy_0').cells)
      .not.toContainEqual({ q: 4, r: -1 });
  });

  it('turns tile-order changes into identical path, range and LOS bytes', () => {
    let seed = 0x51f15e;
    const shuffle = <T>(values: readonly T[]): T[] => {
      const result = [...values];
      for (let index = result.length - 1; index > 0; index -= 1) {
        seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
        const target = seed % (index + 1); [result[index], result[target]] = [result[target]!, result[index]!];
      }
      return result;
    };
    const state = combatFixture({ gridRadius: 4 }); state.units[1]!.pos = { q: 1, r: 0 };
    const bytes = (value: typeof state) => JSON.stringify({ path: queryPath(value, 'hero', { q: 2, r: -1 }),
      range: queryMoveAt(value, 'hero', BASIC_MOVE.id, 'enemy_0'),
      los: lineOfSight({ from: { ...value.grid.cells.find(cell => cell.q === -4 && cell.r === 0)!, occupied: true },
        to: { ...value.grid.cells.find(cell => cell.q === 4 && cell.r === 0)!, occupied: false }, delivery: 'ranged',
        cells: value.grid.cells.map(cell => ({ ...cell, occupied: false })) }) });
    const expected = bytes(state);
    for (let run = 0; run < 100; run += 1) {
      const copy = structuredClone(state);
      const permuted = { ...copy, grid: { ...copy.grid, cells: shuffle(copy.grid.cells) },
        units: shuffle(copy.units) };
      expect(bytes(permuted), `run=${run}`).toBe(expected);
    }
  });
});
