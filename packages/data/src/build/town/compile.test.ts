import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { RegionMapSchema } from '../../schemas/region-map';
import { compileTownScene } from './index';
import { HEX_DIRECTIONS, cellCentreMm } from './frame';
import { checkI5, checkI6 } from './invariants';
import { boxPlanner } from './__fixtures__/box-planner';
import { canonical, decode, pilot, type PilotName } from './test-helpers';

const names: readonly PilotName[] = ['dali01', 'dali10', 'turpan10'];
const EXPECTED_STATS = {
  dali01: {
    slots: 12_576, standable: 3_453, interior: 1_045, plans: 36, enterable: 23,
    moved: 1, bytes: 179_524, sha: '126d3273bc34',
  },
  dali10: {
    slots: 12_576, standable: 6_665, interior: 360, plans: 19, enterable: 15,
    moved: 0, bytes: 167_818, sha: 'da107029cfd9',
  },
  turpan10: {
    slots: 22_400, standable: 7_838, interior: 1_115, plans: 49, enterable: 39,
    moved: 0, bytes: 185_504, sha: '60cd4b9193b6',
  },
} as const;
const LAND_GATES = [
  ['dali01', 'south_gate'],
  ['dali01', 'north_gate'],
  ['turpan10', 'south_gate'],
  ['turpan10', 'north_gate'],
  ['turpan10', 'west_gate'],
] as const;
function insidePolygon(
  point: readonly [number, number],
  polygon: readonly (readonly [number, number])[],
): boolean {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current, current += 1
  ) {
    const [cx, cz] = polygon[current]!;
    const [px, pz] = polygon[previous]!;
    if (
      cz > point[1] !== pz > point[1] &&
      point[0] < ((px - cx) * (point[1] - cz)) / (pz - cz) + cx
    )
      inside = !inside;
  }
  return inside;
}
describe('compileTownScene pilot towns', () => {
  it.each(names)(
    '%s compiles with the injected frozen box planner and passes schema/I1-I6',
    (name) => {
      const pilotCase = pilot(name);
      const input = pilotCase.input;
      const { kit } = pilotCase;
      const result = compileTownScene(input, { kit, planBuilding: boxPlanner });
      expect(RegionMapSchema.safeParse(result.map).success).toBe(true);
      expect(checkI5(result.map)).toEqual([]);
      expect(
        checkI6(result.map, compileTownScene(input, { kit, planBuilding: boxPlanner }).map),
      ).toEqual([]);
      for (const chunk of result.map.chunks) {
        const terrain = decode(chunk.terrain);
        expect(chunk.water.map(({ index }) => index)).toEqual(
          [...terrain.entries()]
            .filter(([, value]) => result.map.terrainTable[value] === 'tr_shenshui')
            .map(([index]) => index),
        );
      }
      const output = canonical(result.map);
      expect(canonical(compileTownScene(input, { kit, planBuilding: boxPlanner }).map)).toBe(
        output,
      );
      const standable = result.map.chunks.reduce((sum, chunk) => {
        const valid = Buffer.from(chunk.valid, 'base64');
        const blocked = Buffer.from(chunk.blocked!, 'base64');
        let count = 0;
        for (let index = 0; index < 1_024; index += 1)
          if (
            (valid[index >> 3]! & (1 << (index & 7))) !== 0 &&
            (blocked[index >> 3]! & (1 << (index & 7))) === 0
          )
            count += 1;
        return sum + count;
      }, 0);
      const stats = {
        slots: (result.map.bounds.qMax + 1) * (result.map.bounds.rMax + 1),
        standable,
        interior: result.map.chunks.reduce(
          (sum, chunk) =>
            sum +
            decode(chunk.terrain).filter((value) => result.map.terrainTable[value] === 'tr_shinei')
              .length,
          0,
        ),
        plans: result.map.town!.buildings.length,
        enterable: result.map.town!.buildings.filter(({ enterable }) => enterable).length,
        moved: result.diagnostics.filter(({ code }) => code === 'TOWN_DOOR_MOVED').length,
        bytes: Buffer.byteLength(output),
        sha: createHash('sha256').update(output).digest('hex').slice(0, 12),
      };
      expect(stats).toEqual(EXPECTED_STATS[name]);
      console.info('TOWN_STATS', name, stats);
    },
    30_000,
  );

  it.each(names)(
    '%s compiles through the default planBuilding seam',
    (name) => {
      const pilotCase = pilot(name);
      const input = pilotCase.input;
      const { kit } = pilotCase;
      const result = compileTownScene(input, { kit });
      expect(RegionMapSchema.safeParse(result.map).success).toBe(true);
      expect(checkI5(result.map)).toEqual([]);
    },
    30_000,
  );

  it('locks Dali ch01 canonical bytes to the frozen box planner', () => {
    const pilotCase = pilot('dali01');
    const input = pilotCase.input;
    const { kit } = pilotCase;
    const first = canonical(compileTownScene(input, { kit, planBuilding: boxPlanner }).map);
    const second = canonical(compileTownScene(input, { kit, planBuilding: boxPlanner }).map);
    expect(second).toBe(first);
    expect(createHash('sha256').update(first).digest('hex')).toBe(
      '126d3273bc346115c2d9d2530ef8c98d11bb1783cffe86e816112eeb2cd77a78',
    );
  }, 30_000);

  it(
    'uses source visualKit even when Turpan layout types name song_dali',
    { timeout: 30_000 },
    () => {
      const pilotCase = pilot('turpan10');
      const input = pilotCase.input;
      const { kit } = pilotCase;
      const { map } = compileTownScene(input, { kit, planBuilding: boxPlanner });
      expect(map.town?.walls.map(({ id }) => id)).toEqual(input.source.walls.map(({ id }) => id));
      expect(
        input.layout.buildings.every(({ type }) => type.startsWith('bld_kit_song_dali_')),
      ).toBe(true);
      expect(map.town?.visualKit).toBe('xiyu:tang_buddhist');
    },
  );

  it('preserves accepted TextKeys containing double underscores and numeric suffixes byte for byte', () => {
    const { input, kit } = pilot('dali01');
    const seen: string[] = [];
    compileTownScene(input, {
      kit,
      planBuilding: (...args) => {
        if (args[0].signTextKey !== undefined) seen.push(args[0].signTextKey);
        return boxPlanner(...args);
      },
    });
    expect(seen).toContain('town.city_dali__ch01.kedian_01.name');
    expect(seen).toContain('town.city_dali__ch01.yaopu_01.name');
  }, 30_000);

  it('I6 at the compiler boundary compares two independent compilations', () => {
    const { input, kit } = pilot('dali10');
    const buildingsPerRun = input.layout.buildings.length;
    let calls = 0;
    expect(() =>
      compileTownScene(input, {
        kit,
        planBuilding: (...args) => {
          const plan = boxPlanner(...args);
          const repeatedRun = calls++ >= buildingsPerRun;
          return repeatedRun
            ? { ...plan, roof: [plan.roof[0], plan.roof[1] + 1, plan.roof[2]] }
            : plan;
        },
      }),
    ).toThrow('TOWN_COMPILE_INVARIANT:I6');
  }, 30_000);

  it('maps every supported source chapter to the canonical chapter scope', () => {
    const expected = [
      'ch00_yuenv',
      'ch01_tianlong',
      'ch02_shediao',
      'ch03_shendiao',
      'ch04_yitian',
      'ch05_xiaoao',
      'ch06_xiake',
      'ch07_bixue',
      'ch08_luding',
      'ch09_liancheng',
      'ch10_baima',
      'ch11_yuanyang',
      'ch12_shujian',
      'ch13_feihu',
      'ch14_xueshan',
    ];
    const { input, kit } = pilot('dali10');
    for (const [index, chapterScope] of expected.entries()) {
      const chapter = `ch${String(index).padStart(2, '0')}`;
      const suffix = input.source.cityId.slice(5);
      const source = {
        ...input.source,
        chapter,
        sceneId: `sc_${String(index).padStart(2, '0')}_town_${suffix}`,
        layoutKey: `${input.source.cityId}__${chapter}`,
        walls: [],
      };
      const facilities = { ...input.facilities, layoutKey: source.layoutKey, facilities: [] };
      expect(
        compileTownScene({ ...input, source, facilities }, { kit, planBuilding: boxPlanner }).map
          .chapterScope,
      ).toEqual([chapterScope]);
    }
  }, 30_000);

  it('keeps road_entry as the applicable Exit/Spawn semantics for a town without walls', () => {
    const { input, kit } = pilot('dali10');
    expect(input.source.walls).toEqual([]);
    const { map } = compileTownScene(input, { kit, planBuilding: boxPlanner });
    const objects = map.chunks.flatMap(({ objects }) => objects);
    const exit = objects.find(({ id }) => id === 'exit_road_entry');
    const spawn = objects.find(({ id }) => id === 'spawn_road_entry');
    expect(exit?.class).toBe('Exit');
    expect(spawn?.class).toBe('PlayerSpawn');
    if (exit?.class === 'Exit' && spawn?.class === 'PlayerSpawn') {
      expect(exit.spawnId).toBe(spawn.id);
      expect(exit.gateId).toBe('road_entry');
      expect(spawn.entry).toBe(true);
    }
  }, 30_000);

  it.each(LAND_GATES)(
    '%s %s puts Exit outside and Spawn exactly two real inward edges from the gate',
    (name, gateId) => {
      const pilotCase = pilot(name);
      const input = pilotCase.input;
      const { kit } = pilotCase;
      const { map } = compileTownScene(input, { kit, planBuilding: boxPlanner });
      const wall = input.source.walls[0]!;
      const polygon = wall.points;
      const objects = map.chunks.flatMap(({ objects: values }) => values);
      const exit = objects.find(({ id }) => id === `exit_${gateId}`);
      expect(exit?.class).toBe('Exit');
      if (exit?.class === 'Exit') {
        const spawn = objects.find(({ id }) => id === exit.spawnId)!;
        expect(spawn.class).toBe('PlayerSpawn');
        const rawExit = {
          rawQ: exit.q + input.layout.runtime_partition.q_min,
          rawR: exit.r + input.layout.runtime_partition.r_min,
        };
        const rawSpawn = {
          rawQ: spawn!.q + input.layout.runtime_partition.q_min,
          rawR: spawn!.r + input.layout.runtime_partition.r_min,
        };
        expect(insidePolygon(cellCentreMm(rawExit), polygon), exit.id).toBe(false);
        expect(insidePolygon(cellCentreMm(rawSpawn), polygon), spawn!.id).toBe(true);
        const cell = resultCell(map, exit.q, exit.r);
        const spawnCell = resultCell(map, spawn!.q, spawn!.r);
        expect(cell.terrain, exit.id).not.toBe('tr_chengqiang');
        expect(spawnCell.terrain, spawn!.id).not.toBe('tr_chengqiang');
        expect(cell.blocked, exit.id).toBe(false);
        expect(spawnCell.blocked, spawn!.id).toBe(false);
        expect(inwardDistance(map, input, polygon, exit, spawn), gateId).toBe(2);
      }
    },
    30_000,
  );
});
function resultCell(
  map: ReturnType<typeof compileTownScene>['map'],
  q: number,
  r: number,
): { terrain: string; blocked: boolean } {
  const chunk = map.chunks.find(
    (value) => value.q === Math.floor(q / 32) && value.r === Math.floor(r / 32),
  )!;
  const index = (r % 32) * 32 + (q % 32);
  const terrain = decode(chunk.terrain);
  const blocked = Buffer.from(chunk.blocked!, 'base64');
  return {
    terrain: map.terrainTable[terrain[index]!]!,
    blocked: (blocked[index >> 3]! & (1 << (index & 7))) !== 0,
  };
}
function inwardDistance(
  map: ReturnType<typeof compileTownScene>['map'],
  input: ReturnType<typeof pilot>['input'],
  polygon: readonly (readonly [number, number])[],
  exit: { readonly q: number; readonly r: number },
  spawn: { readonly q: number; readonly r: number },
): number {
  const rawPoint = (q: number, r: number) => ({
    rawQ: q + input.layout.runtime_partition.q_min,
    rawR: r + input.layout.runtime_partition.r_min,
  });
  const inside = (q: number, r: number): boolean =>
    insidePolygon(cellCentreMm(rawPoint(q, r)), polygon);
  const starts = HEX_DIRECTIONS.map(([dq, dr]) => ({ q: exit.q + dq, r: exit.r + dr }))
    .filter(({ q, r }) => inside(q, r) && !resultCell(map, q, r).blocked)
    .sort((a, b) => a.r - b.r || a.q - b.q);
  const queue = starts.map((cell) => ({ ...cell, distance: 0 }));
  const seen = new Set(starts.map(({ q, r }) => `${q},${r}`));
  while (queue.length > 0) {
    const cell = queue.shift()!;
    if (cell.q === spawn.q && cell.r === spawn.r) return cell.distance;
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const next = { q: cell.q + dq, r: cell.r + dr };
      const key = `${next.q},${next.r}`;
      if (seen.has(key) || !inside(next.q, next.r) || resultCell(map, next.q, next.r).blocked)
        continue;
      seen.add(key);
      queue.push({ ...next, distance: cell.distance + 1 });
    }
  }
  return -1;
}
