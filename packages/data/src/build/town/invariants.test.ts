import { describe, expect, it } from 'vitest';
import type { RegionMap, TownBuildingPlan } from '../../schemas/region-map';
import { checkI1, checkI2, checkI3, checkI4, checkI5, checkI6, hasLineOfSight } from './invariants';
import type { CellState, TownWork } from './types';
import { SONG_KIT, pilot } from './test-helpers';

const cell = (q: number, r: number, terrain: CellState['terrain'], blocked = false): CellState => ({
  rawQ: q,
  rawR: r,
  q,
  r,
  key: `${q},${r}`,
  terrain,
  surface: 'wood_floor',
  height: 0,
  blocked,
  building: 1,
  outdoorWalkable: false,
});
function work(cells: readonly CellState[]): TownWork {
  const { input } = pilot('dali10');
  return {
    input,
    deps: { kit: SONG_KIT },
    sceneId: input.source.sceneId,
    frame: { heightCells: 1, originXMm: 0, originZMm: 0 },
    cells: new Map(cells.map((entry) => [entry.key, entry])),
    plans: [],
    objects: [],
    diagnostics: [],
    doors: [],
    primarySpawnId: '',
  };
}
const plan: TownBuildingPlan = {
  id: 'bi_test',
  archetype: 'house',
  kit: 'song_dali',
  seed: 1,
  footprint: [0, 0, 4_000, 4_000],
  yaw: 0,
  storeys: 1,
  roof: [2, 3_000, 4_500],
  entrances: [[0, 0, 1_400]],
  enterable: true,
  elev: [0, 150],
  floors: [[-1_500, -1_500, 1_500, 1_500]],
  floorY: [150],
  fixtures: [],
  signage: null,
  facility: 'none',
};
const invariantMap = (facilities: readonly unknown[] = []): RegionMap =>
  ({
    bounds: { qMin: 0, qMax: 0, rMin: 0, rMax: 0 },
    town: { facilities },
  }) as unknown as RegionMap;

describe('town invariant visibility', () => {
  it('lets blocked furniture transmit sight', () => {
    const state = work([
      cell(0, 0, 'tr_shinei'),
      cell(1, 0, 'tr_shinei', true),
      cell(2, 0, 'tr_shinei'),
    ]);
    expect(hasLineOfSight(state, { q: 0, r: 0 }, { q: 2, r: 0 })).toBe(true);
  });

  it('stops sight at stone walls and invalid slots', () => {
    expect(
      hasLineOfSight(
        work([cell(0, 0, 'tr_shinei'), cell(1, 0, 'tr_shibi'), cell(2, 0, 'tr_shinei')]),
        { q: 0, r: 0 },
        { q: 2, r: 0 },
      ),
    ).toBe(false);
    expect(
      hasLineOfSight(
        work([cell(0, 0, 'tr_shinei'), cell(2, 0, 'tr_shinei')]),
        { q: 0, r: 0 },
        { q: 2, r: 0 },
      ),
    ).toBe(false);
  });
});

describe('I1-I2 structural invariants', () => {
  it('I1 accepts one unique door and rejects a missing door', () => {
    const state = work([cell(0, 0, 'tr_shinei')]);
    state.plans.push(plan);
    state.doors.push({
      buildingId: plan.id,
      outside: cell(0, 1, 'tr_taijie'),
      inside: state.cells.get('0,0')!,
      passage: [],
      movedMm: 0,
    });
    expect(checkI1(state)).toEqual([]);
    state.doors.length = 0;
    expect(checkI1(state)[0]?.code).toBe('I1');
  });

  it('I2 accepts a spawned interior and rejects an unreachable interior', () => {
    const state = work([cell(0, 0, 'tr_shinei')]);
    state.plans.push(plan);
    state.objects.push({
      id: 'spawn_gate',
      class: 'PlayerSpawn',
      q: 0,
      r: 0,
      h: 0,
      cells: [{ q: 0, r: 0, h: 0 }],
      facing: 0,
      safe: true,
      entry: true,
    });
    state.primarySpawnId = 'spawn_gate';
    expect(checkI2(state)).toEqual([]);
    state.primarySpawnId = 'missing';
    expect(checkI2(state)[0]?.code).toBe('I2');
  });

  it('I2 does not jump from a door outside cell to a non-adjacent inside cell', () => {
    const inside = cell(0, 0, 'tr_shinei');
    const outside = { ...cell(0, 2, 'tr_taijie'), building: 0 };
    const state = work([inside, outside]);
    state.plans.push(plan);
    state.objects.push({
      id: 'spawn_gate', class: 'PlayerSpawn', q: 0, r: 2, h: 0,
      cells: [{ q: 0, r: 2, h: 0 }], facing: 0, safe: true, entry: true,
    });
    state.primarySpawnId = 'spawn_gate';
    state.doors.push({
      buildingId: plan.id, outside, inside, passage: [outside, inside], movedMm: 0,
    });
    expect(checkI2(state)[0]?.code).toBe('I2');
  });
});

describe('I3-I4 reference invariants', () => {
  it('I3 accepts a visible service cell and rejects one without an NPC', () => {
    const state = work([cell(0, 0, 'tr_shinei')]);
    state.objects.push({
      id: 'npc_test_keeper',
      class: 'FacilityNpc',
      q: 0,
      r: 0,
      h: 0,
      cells: [{ q: 0, r: 0, h: 0 }],
      facilityKey: 'test',
      roleKey: 'keeper',
      facing: 0,
      interactRange: 2,
      appearance: { template: 'tpl_m_medium', outfit: 'outfit_shop', seed: 1 },
    });
    const facility = { key: 'test', serviceCells: [{ q: 0, r: 0 }] };
    expect(checkI3(state, invariantMap([facility]))).toEqual([]);
    state.objects.length = 0;
    expect(checkI3(state, invariantMap([facility]))[0]?.code).toBe('I3');
  });

  it('I4 accepts a closed Exit spawn and rejects an unresolved spawn', () => {
    const state = work([]);
    state.objects.push(
      {
        id: 'spawn_gate',
        class: 'PlayerSpawn',
        q: 0,
        r: 0,
        h: 0,
        cells: [{ q: 0, r: 0, h: 0 }],
        facing: 0,
        safe: true,
        entry: true,
      },
      {
        id: 'exit_gate',
        class: 'Exit',
        q: 0,
        r: 0,
        h: 0,
        cells: [{ q: 0, r: 0, h: 0 }],
        gateId: 'gate',
        spawnId: 'spawn_gate',
        side: 'south',
        nameKey: 'town.gate.name',
      },
    );
    expect(checkI4(state)).toEqual([]);
    (state.objects[1] as { spawnId: string }).spawnId = 'missing';
    expect(checkI4(state)[0]?.code).toBe('I4');
  });
});

describe('I5-I6 output invariants', () => {
  it('I5 accepts the budget boundary and rejects too many slots', () => {
    const valid = invariantMap();
    expect(checkI5(valid)).toEqual([]);
    const oversized = { ...valid, bounds: { qMin: 0, qMax: 256, rMin: 0, rMax: 256 } };
    expect(checkI5(oversized)[0]?.code).toBe('I5');
  });

  it('I6 accepts identical output and rejects a changed repeated compilation', () => {
    const first = invariantMap();
    expect(checkI6(first, first)).toEqual([]);
    const changed = { ...first, id: 'sc_changed' };
    expect(checkI6(first, changed)[0]?.code).toBe('I6');
  });
});
