import { describe, expect, it } from 'vitest';
import type { TownBuildingPlan } from '../../schemas/region-map';
import { canTraverseBuildingEdge } from './geometry';
import { compileDoors } from './doors';
import type { CellState, TownWork } from './types';
import { SONG_KIT, pilot } from './test-helpers';

const cell = (q: number, r: number, building: number, walkable: boolean): CellState => ({
  rawQ: q,
  rawR: r,
  q,
  r,
  key: `${q},${r}`,
  terrain: building === 0 ? 'tr_pingdi' : 'tr_shinei',
  surface: building === 0 ? 'dirt_road' : 'wood_floor',
  height: 0,
  blocked: false,
  building,
  outdoorWalkable: walkable,
});
const plan = (id: string, cx: number): TownBuildingPlan => ({
  id,
  archetype: 'house',
  kit: 'song_dali',
  seed: 1,
  footprint: [cx, 0, 4_000, 2_000],
  yaw: 0,
  storeys: 1,
  roof: [2, 3_000, 4_500],
  entrances: [[0, 0, 1_400]],
  enterable: true,
  elev: [0, 150],
  floors: [[cx - 1_750, -750, cx + 1_750, 750]],
  floorY: [150],
  fixtures: [],
  signage: null,
  facility: 'none',
});
function work(cells: CellState[]): TownWork {
  const { input } = pilot('dali10');
  return {
    input: {
      ...input,
      layout: { ...input.layout, buildings: [] },
      facilities: { ...input.facilities, facilities: [] },
    },
    deps: { kit: SONG_KIT },
    sceneId: 'sc_10_town_test',
    frame: { heightCells: 8, originXMm: 0, originZMm: 0 },
    cells: new Map(cells.map((entry) => [entry.key, entry])),
    plans: [plan('bi_a', 0), plan('bi_b', 0)],
    objects: [],
    diagnostics: [],
    doors: [],
    primarySpawnId: '',
  };
}
describe('building door uniqueness', () => {
  it('moves the second colliding door along its edge', () => {
    const state = work([
      cell(0, 0, 1, false),
      cell(0, 1, 0, true),
      cell(1, 0, 2, false),
      cell(1, 1, 0, true),
    ]);
    compileDoors(state);
    expect(new Set(state.doors.map(({ outside }) => outside.key))).toHaveProperty('size', 2);
    expect(state.diagnostics.some(({ code }) => code === 'TOWN_DOOR_MOVED')).toBe(true);
    const movedDoor = state.doors.find(({ movedMm }) => movedMm !== 0)!;
    const movedPlan = state.plans.find(({ id }) => id === movedDoor.buildingId)!;
    expect(movedPlan.entrances[0]).toEqual([0, movedDoor.movedMm, 1_400]);
    const crossing = movedDoor.passage
      .slice(0, -1)
      .map((from, index) => [from, movedDoor.passage[index + 1]!] as const)
      .find(([from, to]) => from.building !== to.building)!;
    // No DoorAssignment whitelist: the updated plan entrance alone must open this threshold edge.
    expect(canTraverseBuildingEdge(crossing[0], crossing[1], state.plans)).toBe(true);
  });
  it('throws with both building IDs when no unique cell exists', () => {
    const state = work([cell(0, 0, 1, false), cell(0, 1, 0, true), cell(1, 0, 2, false)]);
    expect(() => compileDoors(state)).toThrow(/TOWN_COMPILE_DOOR_CONFLICT:bi_a:bi_b/u);
    expect(state.diagnostics[0]?.buildingIds).toEqual(['bi_a', 'bi_b']);
  });

  it('opens a straight thick-wall threshold only to the first interior cell', () => {
    const state = work([
      cell(-1, 2, 0, true),
      { ...cell(-1, 1, 0, false), terrain: 'tr_shibi', blocked: true },
      cell(0, 0, 1, false),
    ]);
    state.plans.splice(1, 1);
    state.plans[0] = {
      ...state.plans[0]!,
      footprint: [0, 0, 4_000, 4_000],
      floors: [[-1_750, -750, 1_750, 750]],
    };
    compileDoors(state);
    expect(state.doors[0]?.passage.map(({ key }) => key)).toEqual(['-1,2', '-1,1', '0,0']);
    expect(state.doors[0]?.passage.every(({ blocked }) => !blocked)).toBe(true);
    const passage = state.doors[0]!.passage;
    for (let index = 1; index < passage.length; index += 1)
      expect(canTraverseBuildingEdge(passage[index - 1]!, passage[index]!, state.plans)).toBe(true);
  });
});
