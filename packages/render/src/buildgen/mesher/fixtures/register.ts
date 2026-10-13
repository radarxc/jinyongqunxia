import {
  altarTable,
  apothecaryCabinet,
  armchair,
  barredHighCounter,
  bed,
  bench,
  bookcase,
  clothRack,
  counter,
  crate,
  dais,
  gamblingTable,
  readingTable,
  screen,
  shelf4,
  squareTable,
  stairs14,
  storytellerTable,
  stool,
} from './furniture';
import {
  anvilStump,
  bellows,
  flagRack,
  forge,
  manger,
  quenchTrough,
  toolRack,
  weaponRack,
  woodenDummy,
  workbench,
} from './workshop';
import { barrel, basket, cushion, hayBale, jarGroup, sack, wineJar } from './clutter';
import { buddhaAltar, hangingGoods, incenseBurner, lantern, statue } from './temple';
import { board, cylinder, propContext } from './dsl';
import { PROP_LAYER, type PropDefinition, type PropRecipe } from './types';
import type { MeshWriter, VertexInput } from '../../types';

const COUNTER_CLUTTER: PropRecipe = (w, d, h, variant, lod, sink) => {
  if (lod === 1) return;
  const context = propContext(sink.writer, sink.placement);
  board(context, [0, 10, 0], [w, 20, d], { layer: PROP_LAYER.woodFurniture });
  cylinder(context, [-w * 0.28, h * 0.42, 0], Math.min(d, h) * 0.22, h * 0.84, 6, {
    layer: PROP_LAYER.ceramicGlaze,
  });
  board(context, [w * 0.2, h * 0.32, 0], [w * 0.45, h * 0.64, d * 0.45], {
    layer: variant & 1 ? PROP_LAYER.paperBooks : PROP_LAYER.medicineDrawers,
  });
  board(context, [0, h - 5, 0], [10, 10, 10], { layer: PROP_LAYER.iron });
};
const TABLE_BUDGET = [80, 30] as const;
class VariantWriter implements MeshWriter {
  constructor(private readonly target: MeshWriter) {}
  get vertexCount(): number {
    return this.target.vertexCount;
  }
  addVertex(vertex: VertexInput): number {
    const [x, y, z] = vertex.position;
    const [nx, ny, nz] = vertex.normal;
    return this.target.addVertex({
      ...vertex,
      position: [x - Math.sign(nx) * 0.001, y - Math.sign(ny) * 0.001, z - Math.sign(nz) * 0.001],
    });
  }
  addTriangle(a: number, b: number, c: number): void {
    this.target.addTriangle(a, b, c);
  }
}
function withVariant(recipe: PropRecipe): PropRecipe {
  return (w, d, h, variant, lod, sink) =>
    recipe(w, d, h, variant, lod, {
      ...sink,
      writer: (variant & 1) === 0 ? sink.writer : new VariantWriter(sink.writer),
    });
}

const rows: readonly [
  string,
  number,
  number,
  number,
  0 | 1,
  readonly [number, number],
  PropRecipe,
][] = [
  ['counter', 1800, 550, 900, 1, [120, 60], counter],
  ['barred_high_counter', 2400, 600, 1350, 1, [300, 120], barredHighCounter],
  ['shelf_4', 1600, 400, 2000, 1, [160, 60], shelf4],
  ['apothecary_cabinet', 2400, 450, 2200, 1, [200, 80], apothecaryCabinet],
  ['cloth_rack', 500, 500, 2200, 1, [180, 60], clothRack],
  ['bookcase', 1600, 400, 2000, 1, [160, 60], bookcase],
  ['reading_table', 1200, 600, 750, 1, TABLE_BUDGET, readingTable],
  ['square_table', 1000, 1000, 800, 1, [100, 40], squareTable],
  ['bench', 1400, 350, 450, 1, [40, 20], bench],
  ['stool', 400, 400, 450, 1, [30, 12], stool],
  ['armchair', 650, 650, 1000, 1, [150, 60], armchair],
  ['altar_table', 2000, 450, 900, 1, [120, 50], altarTable],
  ['bed', 2000, 1400, 1800, 1, [300, 120], bed],
  ['chest', 900, 550, 600, 1, [40, 20], crate],
  ['stairs_14', 3000, 900, 2700, 1, [400, 150], stairs14],
  ['forge', 1200, 1000, 2700, 1, [300, 120], forge],
  ['bellows', 600, 800, 700, 1, [60, 24], bellows],
  ['anvil_stump', 500, 350, 750, 1, [120, 50], anvilStump],
  ['quench_trough', 800, 500, 650, 1, [60, 24], quenchTrough],
  ['weapon_rack', 1600, 400, 1800, 1, [400, 120], weaponRack],
  ['tool_rack', 1400, 400, 1800, 1, [120, 50], toolRack],
  ['workbench', 1400, 600, 850, 1, TABLE_BUDGET, workbench],
  ['barrel', 600, 600, 900, 1, [64, 24], barrel],
  ['crate', 600, 600, 600, 1, [12, 12], crate],
  ['sack', 500, 400, 700, 1, [48, 20], sack],
  ['wine_jar', 500, 500, 800, 1, [64, 24], wineJar],
  ['jar_group', 1200, 700, 900, 1, [192, 72], jarGroup],
  ['basket', 600, 600, 500, 1, [48, 20], basket],
  ['hay_bale', 1200, 700, 700, 1, [12, 12], hayBale],
  ['manger', 1800, 600, 900, 1, [24, 12], manger],
  ['buddha_altar', 2400, 1200, 900, 1, [200, 80], buddhaAltar],
  ['statue', 1000, 800, 3000, 1, [600, 240], statue],
  ['incense_burner', 500, 500, 700, 1, [80, 30], incenseBurner],
  ['cushion', 500, 500, 120, 0, [24, 12], cushion],
  ['screen', 2400, 300, 2200, 1, [40, 20], screen],
  ['dais', 2400, 1200, 150, 0, [24, 12], dais],
  ['gambling_table', 1600, 1000, 800, 1, TABLE_BUDGET, gamblingTable],
  ['wooden_dummy', 700, 700, 1700, 1, [120, 40], woodenDummy],
  ['flag_rack', 500, 500, 2400, 1, [30, 14], flagRack],
  ['counter_clutter', 800, 350, 200, 0, [80, 0], COUNTER_CLUTTER],
  ['lantern', 400, 400, 600, 0, [48, 20], lantern],
  ['hanging_goods', 800, 400, 500, 0, [60, 0], hangingGoods],
  ['storyteller_table', 1500, 1000, 300, 1, [60, 24], storytellerTable],
] as const;

export const PROP_DEFINITIONS: readonly PropDefinition[] = Object.freeze(
  rows.map(([name, wMm, dMm, hMm, blocks, triangleBudget, recipe], idx) => ({
    idx,
    name,
    wMm,
    dMm,
    hMm,
    blocks,
    triangleBudget,
    recipe: withVariant(recipe),
  })),
);

export const propsByIndex: readonly (PropDefinition | undefined)[] = Object.freeze(
  Array.from({ length: 43 }, (_, index) => PROP_DEFINITIONS[index]),
);

export function propByIndex(index: number): PropDefinition {
  const definition = propsByIndex[index];
  if (!definition) throw new Error(`BUILDGEN_PROP_PENDING:${index}`);
  return definition;
}
