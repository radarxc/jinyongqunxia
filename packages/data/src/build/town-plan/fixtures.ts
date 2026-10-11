import type { FixtureKindDef } from './types';

const fixture = (
  idx: number, name: string, wMm: number, dMm: number, hMm: number,
  blocks: 0 | 1 = 1, lowClutter?: true,
): FixtureKindDef => ({ idx, name, wMm, dMm, hMm, blocks, ...(lowClutter ? { lowClutter } : {}) });

const station = (idx: number, name: string): FixtureKindDef => ({
  idx, name, wMm: 0, dMm: 0, hMm: 0, blocks: 0, station: name,
});

export const FIXTURE_KINDS: readonly FixtureKindDef[] = [
  fixture(0, 'counter', 1_800, 550, 900),
  fixture(1, 'barred_high_counter', 2_400, 600, 1_350),
  fixture(2, 'shelf_4', 1_600, 400, 2_000),
  fixture(3, 'apothecary_cabinet', 2_400, 450, 2_200),
  fixture(4, 'cloth_rack', 500, 500, 2_200),
  fixture(5, 'bookcase', 1_600, 400, 2_000),
  fixture(6, 'reading_table', 1_200, 600, 750),
  fixture(7, 'square_table', 1_000, 1_000, 800),
  fixture(8, 'bench', 1_400, 350, 450),
  fixture(9, 'stool', 400, 400, 450),
  fixture(10, 'armchair', 650, 650, 1_000),
  fixture(11, 'altar_table', 2_000, 450, 900),
  fixture(12, 'bed', 2_000, 1_400, 1_800),
  fixture(13, 'chest', 900, 550, 600),
  fixture(14, 'stairs_14', 3_000, 900, 2_700),
  fixture(15, 'forge', 1_200, 1_000, 2_700),
  fixture(16, 'bellows', 600, 800, 700),
  fixture(17, 'anvil_stump', 500, 350, 750),
  fixture(18, 'quench_trough', 800, 500, 650),
  fixture(19, 'weapon_rack', 1_600, 400, 1_800),
  fixture(20, 'tool_rack', 1_400, 400, 1_800),
  fixture(21, 'workbench', 1_400, 600, 850),
  fixture(22, 'barrel', 600, 600, 900),
  fixture(23, 'crate', 600, 600, 600),
  fixture(24, 'sack', 500, 400, 700),
  fixture(25, 'wine_jar', 500, 500, 800),
  fixture(26, 'jar_group', 1_200, 700, 900),
  fixture(27, 'basket', 600, 600, 500),
  fixture(28, 'hay_bale', 1_200, 700, 700),
  fixture(29, 'manger', 1_800, 600, 900),
  fixture(30, 'buddha_altar', 2_400, 1_200, 900),
  fixture(31, 'statue', 1_000, 800, 3_000),
  fixture(32, 'incense_burner', 500, 500, 700),
  fixture(33, 'cushion', 500, 500, 120, 0, true),
  fixture(34, 'screen', 2_400, 300, 2_200),
  fixture(35, 'dais', 2_400, 1_200, 150, 0, true),
  fixture(36, 'gambling_table', 1_600, 1_000, 800),
  fixture(37, 'wooden_dummy', 700, 700, 1_700),
  fixture(38, 'flag_rack', 500, 500, 2_400),
  fixture(39, 'counter_clutter', 800, 350, 200, 0, true),
  fixture(40, 'lantern', 400, 400, 600, 0),
  fixture(41, 'hanging_goods', 800, 400, 500, 0),
  fixture(42, 'storyteller_table', 1_500, 1_000, 300),
  station(200, 'stn_keeper'),
  station(201, 'stn_customer'),
  station(202, 'stn_clerk'),
  station(203, 'stn_waiter'),
  station(204, 'stn_vendor'),
  station(205, 'stn_monk'),
  station(206, 'stn_guard'),
  station(207, 'stn_dealer'),
  station(208, 'stn_apprentice'),
  station(209, 'stn_smith'),
  station(210, 'stn_owner'),
  station(211, 'stn_teacher'),
] as const;

export const FIXTURE_KIND_BY_NAME: ReadonlyMap<string, FixtureKindDef> = new Map(
  FIXTURE_KINDS.map((kind) => [kind.name, kind]),
);

export function fixtureKindByName(name: string): FixtureKindDef {
  const kind = FIXTURE_KIND_BY_NAME.get(name);
  if (!kind) throw new TypeError(`TOWN_PLAN_UNKNOWN_FIXTURE:${name}`);
  return kind;
}
