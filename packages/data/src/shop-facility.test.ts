import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { discoverContent } from './build/discover';
import { decodeInkAction } from './build/ink';
import { buildContent } from './build/pipeline';
import { splitContentEntry } from './build/split-fields';
import { loadContent } from './content-index';
import { parseContentFile, parseSerializedContent } from './content-registry';
import {
  FacilityDialogueSchema, PriceTableSchema, ShopTemplateSchema, TownFacilitiesSchema,
} from './schemas';
import { EventActionSchema } from './schemas/event-actions';
import { ItemKindSchema } from './schemas/item';

const supply = [{
  itemId: 'it_fixture', maxGrade: 3, baseStock: 2, restockEveryDays: 1,
  restockAmount: 1, priceBp: 10_000,
}];
const shopTemplate = {
  schemaVersion: 'shop-template.v1', key: 'shop_tpl_yaopu',
  nameKey: 'shop.template.yaopu.name', facilitySub: 'yaopu', supply,
} as const;
const facility = {
  key: 'yaopu_01', kind: 'shop', sub: 'yaopu', buildingId: 'bi_0001',
  nameKey: 'town.city_dali__ch01.yaopu_01.name',
  shop: { templateRef: 'shop_tpl_yaopu', kind: 'normal' }, roles: ['keeper'],
} as const;
const townFacilities = {
  schemaVersion: 'town-facilities.v1', layoutKey: 'city_dali__ch01', facilities: [facility],
} as const;
const facilityDialogue = {
  schemaVersion: 'facility-dialogue.v1', bindings: [{
    chapter: 'ch01_tianlong', kind: 'shop', sub: 'yaopu', roleKey: 'keeper',
    storyId: 'story_ch01_facility', entryKey: 'yaopu.open',
  }],
} as const;
const allKinds = ItemKindSchema.options;
const itemKindToCategory = Object.fromEntries(allKinds.map((kind) => [kind, 'general']));
const priceTable = {
  schemaVersion: 'price-table.v1',
  categories: [{ id: 'general', byGrade: Array.from({ length: 12 }, (_, index) => index + 1) }],
  itemKindToCategory,
};
const townRuntime = {
  schemaVersion: 'town-runtime.v1', revision: '0'.repeat(64),
  cityId: 'city_dali', chapterId: 'ch01', sceneId: 'city_dali', displayName: '大理',
  historicalYear: 1093, eraKit: 'song_dali',
  source: { spec: 'fixture', layout: 'fixture', sha256: '1'.repeat(64) },
  grid: { width: 1, height: 1, cellM: 1, chunkCells: 32 },
  projection: { tilePx: [64, 32], pitchDeg: 30, yawDeg: 45, elevationCmPerM: 100 },
  assets: { tile: { baseUrl: '/', manifest: 'tile', entries: [] },
    building: { baseUrl: '/', manifest: 'building', entries: [] } },
  groundPalette: [{ ground: 'earth', overlay: null, elevationCm: 0, walkable: true }],
  groundRuns: [[0, 1, 0]], edgeTiles: [], waterRuns: [], bridgeRuns: [],
  navigation: { neighborOrder: 'axial-rq-v1', maxStepCm: 50,
    nodes: [[0, 0, 0, 'flat']], spawn: [0, 0] },
  buildings: [{ id: 'bi_0001', type: 'bld_shop', origin: [0, 0], size: [1, 1],
    rotationDeg: 0, entrances: [[0, 0]], businessRef: null, poi: null,
    enterable: true, interiorKind: 'shop', assetId: 'building_shop' }],
  anchors: [],
} as const;
const inkContext = { inks: [{ storyId: 'story_ch01_facility', structure: {
  chapter: 'ch01_tianlong', entryKnots: ['yaopu.open'], readFlags: [], tags: [],
} }] } as const;
const contentEntry = (path: string, value: unknown) =>
  parseContentFile({ path, text: JSON.stringify(value) });

describe('town facility content schemas', () => {
  it('accepts facilities and facility dialogue bindings', () => {
    expect(TownFacilitiesSchema.parse(townFacilities)).toMatchObject(townFacilities);
    expect(FacilityDialogueSchema.parse(facilityDialogue)).toMatchObject(facilityDialogue);
    expect(parseSerializedContent('townFacility', JSON.stringify(townFacilities)).kind)
      .toBe('townFacility');
    expect(parseSerializedContent('facilityDialogue', JSON.stringify(facilityDialogue)).kind)
      .toBe('facilityDialogue');
  });

  it('rejects duplicate facility keys and building IDs', () => {
    expect(() => TownFacilitiesSchema.parse({ ...townFacilities, facilities: [
      facility, { ...facility, buildingId: 'bi_0002' },
    ] })).toThrow(/facility keys must be unique/u);
    expect(() => TownFacilitiesSchema.parse({ ...townFacilities, facilities: [
      facility, { ...facility, key: 'yaopu_02' },
    ] })).toThrow(/facility building IDs must be unique/u);
  });

  it('rejects unknown facility kinds and duplicate dialogue identities', () => {
    expect(() => TownFacilitiesSchema.parse({ ...townFacilities, facilities: [
      { ...facility, kind: 'warehouse' },
    ] })).toThrow();
    expect(() => FacilityDialogueSchema.parse({ ...facilityDialogue, bindings: [
      facilityDialogue.bindings[0], { ...facilityDialogue.bindings[0], storyId: 'story_other' },
    ] })).toThrow(/facility dialogue bindings must be unique/u);
  });
});

describe('shop and price content schemas', () => {
  it('accepts chapter-neutral templates and a twelve-grade price table in wen', () => {
    expect(ShopTemplateSchema.parse(shopTemplate)).toMatchObject(shopTemplate);
    expect(PriceTableSchema.parse(priceTable)).toMatchObject(priceTable);
    expect(parseSerializedContent('shopTemplate', JSON.stringify(shopTemplate)).kind)
      .toBe('shopTemplate');
    expect(parseSerializedContent('priceTable', JSON.stringify(priceTable)).kind)
      .toBe('priceTable');
  });

  it('closes item, template, and optional Ink story references', () => {
    const itemFile = { path: 'content/items/fixture.yaml', text: `
schemaVersion: item.v1
id: it_fixture
name: 夹具
kind: material
sub: ingredient
grade: 1
stack: 9
chapters: any
origin: expanded
price: auto
flags: []
assets: {icon: items/fixture.webp}
text: {desc: 测试夹具。}
extension:
  type: material
  value: {family: wood, resourceRef: res_fixture, materialGrade: 1, rare: false}
` };
    const files = [itemFile,
      { path: 'content/shops/fixture.yaml', text: JSON.stringify(shopTemplate) },
      { path: 'content/town/facilities/fixture.yaml', text: JSON.stringify(townFacilities) },
      { path: 'content/town/facility-dialogues.yaml', text: JSON.stringify(facilityDialogue) },
      { path: 'content/town/ch01/city_dali.json', text: JSON.stringify(townRuntime) },
      { path: 'content/common/economy/price.yaml', text: JSON.stringify(priceTable) }];
    const registry = loadContent(files, inkContext);
    expect([registry.shopTemplates, registry.priceTables, registry.townFacilities,
      registry.facilityDialogues].map((values) => values.length)).toEqual([1, 1, 1, 1]);
    expect(Object.isFrozen(registry.townFacilities)).toBe(true);
    expect(() => loadContent(files.slice(1), inkContext)).toThrow(
      'CONTENT_REF:content/shops/fixture.yaml:item:it_fixture',
    );
    expect(() => loadContent([itemFile, files[2]!], inkContext)).toThrow(
      'CONTENT_REF:content/town/facilities/fixture.yaml:shopTemplate:shop_tpl_yaopu',
    );
    expect(() => loadContent(files, { inks: [] })).toThrow(
      'CONTENT_REF:content/town/facility-dialogues.yaml:inkStory:story_ch01_facility',
    );
  });

  it('rejects negative prices, out-of-range grades, and chapterId on a template', () => {
    expect(() => PriceTableSchema.parse({ ...priceTable, categories: [{
      id: 'general', byGrade: [-1, ...Array(11).fill(1)],
    }] })).toThrow();
    expect(() => ShopTemplateSchema.parse({ ...shopTemplate, supply: [
      { ...supply[0], maxGrade: 13 },
    ] })).toThrow();
    expect(() => PriceTableSchema.parse({ ...priceTable, categories: [{
      id: 'general', byGrade: Array(13).fill(1),
    }] })).toThrow();
    expect(() => ShopTemplateSchema.parse({
      ...shopTemplate, chapterId: 'ch01_tianlong',
    })).toThrow();
  });

  it('rejects mismatched runtime buildings and Ink chapter or entry from loadContent', () => {
    const files = [
      { path: 'content/town/facilities/fixture.yaml', text: JSON.stringify({
        ...townFacilities, facilities: [{ ...facility, shop: null }],
      }) },
      { path: 'content/town/ch01/city_dali.json', text: JSON.stringify(townRuntime) },
      { path: 'content/town/facility-dialogues.yaml', text: JSON.stringify(facilityDialogue) },
    ];
    expect(() => loadContent([files[0]!])).not.toThrow();
    expect(() => loadContent([{ ...files[0]!, text: JSON.stringify({
      ...townFacilities, facilities: [{ ...facility, shop: null, buildingId: 'bi_9999' }],
    }) }, files[1]!], inkContext)).toThrow(
      'FACILITY_BUILDING_UNKNOWN:city_dali__ch01:bi_9999',
    );
    expect(() => loadContent([files[2]!], { inks: [{ ...inkContext.inks[0],
      structure: { ...inkContext.inks[0].structure, chapter: 'ch02_shediao' },
    }] })).toThrow(/inkChapter/u);
    expect(() => loadContent([files[2]!], { inks: [{ ...inkContext.inks[0],
      structure: { ...inkContext.inks[0].structure, entryKnots: ['other'] },
    }] })).toThrow(/inkKnot/u);
  });

  it('splits every new production content kind through the field registry', () => {
    const fixtures = [shopTemplate, priceTable, townFacilities, facilityDialogue];
    for (const value of fixtures)
      expect(() => splitContentEntry(contentEntry('fixture.yaml', value))).not.toThrow();
  });

  it('rejects duplicate or missing price category references', () => {
    expect(() => PriceTableSchema.parse({ ...priceTable, categories: [
      priceTable.categories[0], priceTable.categories[0],
    ] })).toThrow(/price category IDs must be unique/u);
    expect(() => PriceTableSchema.parse({ ...priceTable, itemKindToCategory: {
      ...itemKindToCategory, material: 'missing',
    } })).toThrow(/unknown price category missing/u);
  });
});

describe('facility Ink actions', () => {
  it('accepts parameterless openShop and rejects every parameter', () => {
    expect(EventActionSchema.parse({ op: 'facility/openShop' }))
      .toEqual({ op: 'facility/openShop' });
    expect(decodeInkAction('ts:facility/openShop')).toEqual({ op: 'facility/openShop' });
    expect(() => decodeInkAction('ts:facility/openShop shop=yaopu_01')).toThrow('INK_TAG_PARAM');
  });

  it('accepts only the exact interlocutor speaker token', () => {
    expect(decodeInkAction('ts:dialogue/speaker speaker=interlocutor'))
      .toEqual({ op: 'dialogue/speaker', speaker: 'interlocutor' });
    expect(() => decodeInkAction('ts:dialogue/speaker speaker=interlocutorx')).toThrow();
  });
});

describe('town and shop source discovery', () => {
  it('finds every new content location while absent siblings stay optional', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-shop-facility-'));
    try {
      const files = [
        'content/town/facilities/city_dali__ch01.yaml',
        'content/town/facility-dialogues.yaml',
        'content/shops/shop_tpl_yaopu.yaml',
        'content/common/economy/price-table.yaml',
      ];
      for (const path of files) {
        const absolutePath = join(root, path);
        await mkdir(absolutePath.slice(0, absolutePath.lastIndexOf('/')), { recursive: true });
        await writeFile(absolutePath, 'schemaVersion: fixture.v1\n');
      }
      await expect(discoverContent(join(root, 'missing-root'))).resolves.toEqual([]);
      const discovered = await discoverContent(root);
      expect(discovered.map((source) => source.path)).toEqual([...files].sort());
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('builds with a known layout and reports missing layouts or buildings', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-facility-build-'));
    const facilityPath = join(root, 'content/town/facilities/fixture.yaml');
    const layoutPath = join(root, 'assets/default/town/city_dali__ch01/layout.yaml');
    const value = { ...townFacilities, facilities: [{ ...facility, shop: null }] };
    try {
      await mkdir(facilityPath.slice(0, facilityPath.lastIndexOf('/')), { recursive: true });
      await writeFile(facilityPath, JSON.stringify(value));
      const missing = await buildContent({ rootDir: root, write: false });
      expect(missing.diagnostics.map((entry) => entry.code))
        .toContain('FACILITY_LAYOUT_MISSING');

      await mkdir(layoutPath.slice(0, layoutPath.lastIndexOf('/')), { recursive: true });
      await writeFile(layoutPath, 'buildings: [{id: bi_9999}]\n');
      const unknown = await buildContent({ rootDir: root, write: false });
      expect(unknown.diagnostics.map((entry) => entry.code))
        .toContain('FACILITY_BUILDING_UNKNOWN');

      await writeFile(layoutPath, 'buildings: [{id: bi_0001}]\n');
      const built = await buildContent({ rootDir: root, write: false });
      expect(built.diagnostics).toEqual([]);
      expect(built.entryCount).toBe(1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
