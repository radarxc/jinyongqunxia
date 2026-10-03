import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalBytes } from './hash';
import { INK_OPCODE_NAMES } from './ink';
import { compileTiledMap, validateTiledMaps } from './tiled';
import { buildContent, regionRulesLogicalName } from './pipeline';
import { emitLeaves, MAX_LEAF_BYTES } from './leaves';
import { tiledProjectBytes } from './tiled-project';
import { RegionMapSchema } from '../schemas/region-map';
import type { JsonValue } from '@tianshu/shared';

const property = (name: string, value: unknown) => ({ name, value });
const terrainTiles = [
  { id: 0, properties: [property('terrainId', 'tr_pingdi')] },
  {
    id: 1,
    properties: [
      property('terrainId', 'tr_taijie'),
      property('ramp', true),
      property('rampDir', 0),
    ],
  },
];
const heightTiles = Array.from({ length: 11 }, (_, id) => ({
  id,
  properties: [property('height', id)],
}));
const object = (
  id: number,
  name: string,
  type: string,
  x: number,
  y: number,
  properties: unknown[] = [],
  width = 0,
  height = 0,
) => ({ id, name, type, x, y, width, height, point: width === 0 && height === 0, properties });

const gateProperties = (overrides: Record<string, unknown> = {}) =>
  Object.entries({
    kind: 'climb',
    tier: 3,
    fromQ: 0,
    fromR: 0,
    toRegion: 'rg_jiangnan_taihu',
    toScene: 'sc_00_fixture',
    toQ: 1,
    toR: 0,
    height: 3,
    width: 0,
    run: 0,
    stages: 1,
    intent: 'side',
    reveal: 'always',
    alt: '[]',
    earliest: null,
    oneWay: false,
    returnDoorId: null,
    hintTextKey: 'hint.gate',
    ...overrides,
  }).map(([name, value]) => property(name, value));

const gateObject = (overrides: Record<string, unknown> = {}) =>
  object(3, 'gate_00_fixture', 'QinggongGate', 0, 0, gateProperties(overrides));

function setScene(map: Record<string, unknown>, sceneId: string): void {
  const properties = map['properties'] as Record<string, unknown>[];
  properties.find((entry) => entry['name'] === 'sceneId')!['value'] = sceneId;
}

function fixture(width = 20, height = 16): Record<string, unknown> {
  const cells = width * height;
  return {
    type: 'map',
    version: '1.12',
    orientation: 'orthogonal',
    infinite: false,
    width,
    height,
    tilewidth: 48,
    tileheight: 48,
    properties: [
      property('schemaVersion', 'region-map.v1'),
      property('regionId', 'rg_jiangnan_taihu'),
      property('sceneId', 'sc_00_fixture'),
      property('chapterScope', 'ch00_yuenv'),
      property('eraLayer', 'ch00'),
      property('eraPatchRefs', ''),
    ],
    tilesets: [
      { firstgid: 1, name: 'terrain', tilecount: 2, tiles: terrainTiles },
      { firstgid: 100, name: 'height', tilecount: 11, tiles: heightTiles },
    ],
    layers: [
      { id: 1, name: 'terrain', type: 'tilelayer', width, height, data: Array(cells).fill(1) },
      { id: 2, name: 'height', type: 'tilelayer', width, height, data: Array(cells).fill(100) },
      { id: 3, name: 'deco', type: 'tilelayer', width, height, data: Array(cells).fill(0) },
      {
        id: 4,
        name: 'objects',
        type: 'objectgroup',
        objects: [
          object(2, 'spawn_z', 'PlayerSpawn', 96, 48, [
            property('safe', true),
            property('entry', true),
          ]),
          object(1, 'spawn_a', 'PlayerSpawn', 48, 48, [
            property('safe', true),
            property('entry', true),
          ]),
        ],
      },
    ],
  };
}

async function source(map: Record<string, unknown>, name = 'sc_00_fixture.tmj') {
  const root = await mkdtemp(join(tmpdir(), 'tianshu-tiled-'));
  const directory = join(root, 'content/world/regions/rg_jiangnan_taihu');
  await mkdir(directory, { recursive: true });
  const absolutePath = join(directory, name);
  const text = JSON.stringify(map, null, 2);
  await writeFile(absolutePath, text);
  return { path: `content/world/regions/rg_jiangnan_taihu/${name}`, absolutePath, text };
}
const build = async (map: Record<string, unknown>) => compileTiledMap(await source(map));
const code = async (map: Record<string, unknown>) => (await build(map)).diagnostics[0]?.code;
async function pipelineSource(root: string, map: Record<string, unknown>): Promise<string> {
  const repository = resolve(import.meta.dirname, '../../../..');
  await cp(join(repository, 'content/common'), join(root, 'content/common'), { recursive: true });
  await cp(
    join(repository, 'content/chapters/ch01_tianlong'),
    join(root, 'content/chapters/ch01_tianlong'),
    { recursive: true },
  );
  await mkdir(join(root, 'content/world/ch01'), { recursive: true });
  await cp(join(repository, 'content/world/ch01/map.yaml'), join(root, 'content/world/ch01/map.yaml'));
  const properties = map['properties'] as Record<string, unknown>[];
  properties.find((entry) => entry['name'] === 'sceneId')!['value'] = 'sc_01_fixture';
  properties.find((entry) => entry['name'] === 'chapterScope')!['value'] = 'ch01_tianlong';
  properties.find((entry) => entry['name'] === 'eraLayer')!['value'] = 'ch01';
  const directory = join(root, 'content/world/regions/rg_jiangnan_taihu');
  await mkdir(directory, { recursive: true });
  const path = join(directory, 'sc_01_fixture.tmj');
  await writeFile(path, JSON.stringify(map));
  return path;
}

describe('Tiled to RegionMap', () => {
  it('builds a deterministic 20x16 golden with x->q, y->r and sorted objects', async () => {
    const input = fixture();
    const first = await build(input);
    const second = await build(input);
    expect(first.diagnostics).toEqual([]);
    expect(canonicalBytes(first.map)).toEqual(canonicalBytes(second.map));
    const map = first.map as Record<string, JsonValue>;
    expect(map['bounds']).toEqual({ qMin: 0, qMax: 19, rMin: 0, rMax: 15 });
    expect(map['playerSpawns']).toEqual(['spawn_a', 'spawn_z']);
    const objects = (map['chunks'] as Record<string, JsonValue>[])[0]!['objects'] as Record<
      string,
      JsonValue
    >[];
    expect(objects.map((entry) => [entry['r'], entry['q'], entry['id']])).toEqual([
      [1, 1, 'spawn_a'],
      [1, 2, 'spawn_z'],
    ]);
  });

  it('chunks 40x10, marks empty cells invalid, and resolves the highest firstgid', async () => {
    const input = fixture(40, 10);
    const layers = input['layers'] as Record<string, unknown>[];
    (layers[0]!['data'] as number[])[35] = 2;
    (layers[1]!['data'] as number[])[35] = 101;
    (layers[0]!['data'] as number[])[39] = 0;
    (layers[1]!['data'] as number[])[39] = 0;
    const result = await build(input);
    expect(result.diagnostics).toEqual([]);
    const chunks = (result.map as Record<string, JsonValue>)['chunks'] as Record<
      string,
      JsonValue
    >[];
    expect(chunks).toHaveLength(2);
    expect((result.map as Record<string, JsonValue>)['terrainTable']).toEqual([
      'tr_pingdi',
      'tr_taijie',
    ]);
    const bits = Buffer.from(chunks[1]!['valid'] as string, 'base64');
    expect(bits[0]! & 0b1000_0000).toBe(0);
  });

  it.each([
    [
      'a malformed valid bitmap',
      (map: Record<string, unknown>) => {
        const chunks = map['chunks'] as Record<string, unknown>[];
        chunks[0]!['valid'] = Buffer.alloc(127).toString('base64');
      },
    ],
    [
      'a missing chunk',
      (map: Record<string, unknown>) => {
        (map['chunks'] as unknown[]).pop();
      },
    ],
    [
      'a duplicate chunk',
      (map: Record<string, unknown>) => {
        const chunks = map['chunks'] as Record<string, unknown>[];
        chunks.push(structuredClone(chunks[0]!));
      },
    ],
    [
      'a terrain index outside terrainTable',
      (map: Record<string, unknown>) => {
        const chunk = (map['chunks'] as Record<string, unknown>[])[0]!;
        const terrain = Buffer.from(chunk['terrain'] as string, 'base64');
        terrain[0] = (map['terrainTable'] as unknown[]).length;
        chunk['terrain'] = terrain.toString('base64');
      },
    ],
    [
      'a height above ten',
      (map: Record<string, unknown>) => {
        const chunk = (map['chunks'] as Record<string, unknown>[])[0]!;
        const heights = Buffer.from(chunk['heights'] as string, 'base64');
        heights[0] = 11;
        chunk['heights'] = heights.toString('base64');
      },
    ],
    [
      'duplicate metadata indexes',
      (map: Record<string, unknown>) => {
        const chunk = (map['chunks'] as Record<string, unknown>[])[0]!;
        chunk['decos'] = [
          { id: 'deco_a', index: 1 },
          { id: 'deco_b', index: 1 },
        ];
      },
    ],
    [
      'unsorted metadata indexes',
      (map: Record<string, unknown>) => {
        const chunk = (map['chunks'] as Record<string, unknown>[])[0]!;
        chunk['decos'] = [
          { id: 'deco_b', index: 2 },
          { id: 'deco_a', index: 1 },
        ];
      },
    ],
    [
      'an object cell height differing from terrain',
      (map: Record<string, unknown>) => {
        const chunk = (map['chunks'] as Record<string, unknown>[])[0]!;
        const object = (chunk['objects'] as Record<string, unknown>[])[0]!;
        object['h'] = 1;
        ((object['cells'] as Record<string, unknown>[])[0]!)['h'] = 1;
      },
    ],
    [
      'an object cell on an invalid slot',
      (map: Record<string, unknown>) => {
        const chunk = (map['chunks'] as Record<string, unknown>[])[0]!;
        const valid = Buffer.from(chunk['valid'] as string, 'base64');
        const terrain = Buffer.from(chunk['terrain'] as string, 'base64');
        const heights = Buffer.from(chunk['heights'] as string, 'base64');
        valid[4] = valid[4]! & 0xfd;
        terrain[33] = 0;
        heights[33] = 0;
        chunk['valid'] = valid.toString('base64');
        chunk['terrain'] = terrain.toString('base64');
        chunk['heights'] = heights.toString('base64');
      },
    ],
  ])('rejects compiled RegionMap with %s', async (_name, mutate) => {
    const result = await build(fixture(40, 10));
    expect(result.diagnostics).toEqual([]);
    const map = structuredClone(result.map) as Record<string, unknown>;
    mutate(map);
    expect(RegionMapSchema.safeParse(map).success).toBe(false);
  });

  it('preserves the decoration type at each chunk-local placement', async () => {
    const input = fixture();
    (input['tilesets'] as unknown[]).push({
      firstgid: 200,
      name: 'deco',
      tilecount: 1,
      tiles: [{ id: 0, properties: [property('decoId', 'deco_tree')] }],
    });
    ((input['layers'] as Record<string, unknown>[])[2]!['data'] as number[])[0] = 200;
    const result = await build(input);
    expect(result.diagnostics).toEqual([]);
    const chunks = (result.map as Record<string, JsonValue>)['chunks'] as Record<
      string,
      JsonValue
    >[];
    expect(chunks[0]!['decos']).toEqual([{ id: 'deco_tree', index: 0 }]);
  });

  it('loads JSON .tsj references and uncompressed base64 layers', async () => {
    const map = fixture(2, 2);
    const root = await mkdtemp(join(tmpdir(), 'tianshu-tsj-'));
    const mapObjects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as Record<
      string,
      unknown
    >[];
    mapObjects[0]!['x'] = 48;
    mapObjects[0]!['y'] = 0;
    mapObjects[1]!['x'] = 0;
    mapObjects[1]!['y'] = 0;
    const mapDirectory = join(root, 'content/world/regions/rg_jiangnan_taihu');
    const tileDirectory = join(root, 'content/tiled/tilesets');
    await mkdir(mapDirectory, { recursive: true });
    await mkdir(tileDirectory, { recursive: true });
    await writeFile(
      join(tileDirectory, 'terrain.tsj'),
      JSON.stringify({ tilecount: 1, tiles: [terrainTiles[0]] }),
    );
    await writeFile(
      join(tileDirectory, 'height.tsj'),
      JSON.stringify({ tilecount: 11, tiles: heightTiles }),
    );
    map['tilesets'] = [
      { firstgid: 1, source: '../../../tiled/tilesets/terrain.tsj' },
      { firstgid: 100, source: '../../../tiled/tilesets/height.tsj' },
    ];
    const layer = (map['layers'] as Record<string, unknown>[])[0]!;
    const bytes = Buffer.alloc(16);
    for (let index = 0; index < 4; index += 1) bytes.writeUInt32LE(1, index * 4);
    layer['encoding'] = 'base64';
    layer['data'] = bytes.toString('base64');
    const absolutePath = join(mapDirectory, 'sc_00_fixture.tmj');
    const text = JSON.stringify(map);
    await writeFile(absolutePath, text);
    const result = await compileTiledMap({
      path: 'content/world/regions/rg_jiangnan_taihu/sc_00_fixture.tmj',
      absolutePath,
      text,
    });
    expect(result.diagnostics).toEqual([]);
  });

  it('changes content bytes but has no text payload when a height changes', async () => {
    const first = await build(fixture());
    const changed = fixture();
    ((changed['layers'] as Record<string, unknown>[])[1]!['data'] as number[])[0] = 101;
    const second = await build(changed);
    expect(canonicalBytes(second.map)).not.toEqual(canonicalBytes(first.map));
    expect(JSON.stringify(second.map)).not.toContain('textHash');
  });

  it('routes a scene into a region rules leaf and isolates contentHash from textHash', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-build-map-'));
    try {
      const map = fixture();
      const mapPath = await pipelineSource(root, map);
      const first = await buildContent({ rootDir: root, write: false, chapter: 'ch01_tianlong' });
      expect(first.diagnostics.filter((entry) => entry.severity === 'error')).toEqual([]);
      const logicalName = regionRulesLogicalName('ch01', 'rg_jiangnan_taihu');
      const leaf = first.chapters[0]!.leaves.find((entry) => entry.logicalName === logicalName);
      expect(logicalName).toBe('ch01.rules.rg-jiangnan-taihu.json');
      expect(leaf).toMatchObject({ kind: 'rules', load: 'region', region: 'rg_jiangnan_taihu' });
      ((map['layers'] as Record<string, unknown>[])[1]!['data'] as number[])[0] = 101;
      await writeFile(mapPath, JSON.stringify(map));
      const second = await buildContent({ rootDir: root, write: false, chapter: 'ch01_tianlong' });
      expect(second.chapters[0]!.manifest.contentHash).not.toBe(
        first.chapters[0]!.manifest.contentHash,
      );
      expect(second.chapters[0]!.manifest.textHashes).toEqual(
        first.chapters[0]!.manifest.textHashes,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 20_000);

  it('blocks a chapter build when a door target is not closed', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-build-door-'));
    try {
      const map = fixture();
      const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
      objects.push(
        object(3, 'exit', 'Door', 0, 0, [
          property('mode', 'portal'),
          property('pairId', 'entry'),
          property('oneWay', false),
          property('targetRegionId', 'rg_jiangnan_taihu'),
          property('targetSceneId', 'sc_00_missing'),
          property('targetSpawnId', 'spawn_entry'),
        ]),
      );
      await pipelineSource(root, map);
      const result = await buildContent({ rootDir: root, write: false, chapter: 'ch01_tianlong' });
      expect(result.chapters).toEqual([]);
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: 'TS-CONTENT-MAP-012' })]),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 20_000);

  it('keeps generated Tiled property types in sync', async () => {
    const committed = await readFile(
      resolve(import.meta.dirname, '../../../../content/tiled/tianshu.tiled-project'),
    );
    expect(Uint8Array.from(committed)).toEqual(tiledProjectBytes());
  });

  it('normalizes an opaque Tiled color for a Light object', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(
      object(3, 'lantern', 'Light', 0, 0, [
        property('color', '#ffffffff'),
        property('radius', 4),
        property('intensity', 1),
        property('mountHeight', 2),
        property('schedule', 'always'),
        property('flicker', false),
      ]),
    );
    const result = await build(map);
    expect(result.diagnostics).toEqual([]);
    const lights = (result.map as Record<string, JsonValue>)['chunks'] as Record<
      string,
      JsonValue
    >[];
    expect(JSON.stringify(lights)).toContain('"color":"#ffffff"');
  });

  it('includes a RegionMap backdrop in the emitted asset reference graph', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-build-map-refs-'));
    try {
      const map = fixture();
      (map['properties'] as unknown[]).push(
        property('backdropAssetKey', 'backdrop/region/fixture'),
      );
      await pipelineSource(root, map);
      const result = await buildContent({
        rootDir: root,
        chapter: 'ch01_tianlong',
        emitRefs: true,
      });
      expect(result.diagnostics.filter((entry) => entry.severity === 'error')).toEqual([]);
      const refs = JSON.parse(
        await readFile(join(root, '.cache/content-build/refs.json'), 'utf8'),
      ) as Record<string, unknown>;
      expect(refs['backdrop/region/fixture']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            chapter: 'ch01_tianlong',
            region: 'rg_jiangnan_taihu',
            by: 'regionMap:sc_01_fixture',
          }),
        ]),
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 20_000);
});

describe('Tiled rejection diagnostics', () => {
  const addTrigger = (map: Record<string, unknown>, action: string): void => {
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(
      object(3, 'trigger_action', 'Trigger', 0, 0, [
        property('action', action),
        property('once', false),
        property('autosave', false),
        property('safe', false),
      ]),
    );
  };
  const addLockedDoor = (map: Record<string, unknown>, lockedBy: string): void => {
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(
      object(3, 'door_locked', 'Door', 0, 0, [
        property('mode', 'door'),
        property('pairId', 'door_pair'),
        property('oneWay', false),
        property('targetRegionId', 'rg_jiangnan_taihu'),
        property('targetSceneId', 'sc_00_fixture'),
        property('targetSpawnId', 'spawn_a'),
        property('lockedBy', lockedBy),
      ]),
    );
  };

  it.each(INK_OPCODE_NAMES)('accepts the registered Trigger action %s', async (action) => {
    const map = fixture();
    addTrigger(map, action);

    expect((await build(map)).diagnostics).toEqual([]);
  });

  it('rejects a case-mismatched Trigger action with the registered spelling suggestion', async () => {
    const map = fixture();
    addTrigger(map, 'party/giveitem');

    const diagnostic = (await build(map)).diagnostics[0];
    expect(diagnostic).toMatchObject({
      code: 'TS-CONTENT-MAP-009',
      severity: 'error',
      primary: { file: 'content/world/regions/rg_jiangnan_taihu/sc_00_fixture.tmj' },
    });
    expect(diagnostic?.message).toContain('trigger_action');
    expect(diagnostic?.message).toContain('party/giveitem');
    expect(diagnostic?.message).toContain('你是不是想写 party/giveItem');
  });

  it('rejects an unknown Trigger action without a case-only suggestion', async () => {
    const map = fixture();
    addTrigger(map, 'party/unknown');

    const diagnostic = (await build(map)).diagnostics[0];
    expect(diagnostic).toMatchObject({ code: 'TS-CONTENT-MAP-009', severity: 'error' });
    expect(diagnostic?.message).toContain('trigger_action');
    expect(diagnostic?.message).toContain('party/unknown');
    expect(diagnostic?.message).not.toContain('你是不是想写');
  });

  it.each(['q_00_main_c_03', 'st_00_locked', 'fl_00_locked'])(
    'rejects Door lockedBy from a non-RegionGate ID domain: %s',
    async (lockedBy) => {
      const map = fixture();
      addLockedDoor(map, lockedBy);

      const diagnostic = (await build(map)).diagnostics[0];
      expect(diagnostic).toMatchObject({ code: 'TS-CONTENT-MAP-009', severity: 'error' });
      expect(diagnostic?.message).toContain('door_locked');
      expect(diagnostic?.message).toContain(lockedBy);
      expect(diagnostic?.message).toContain('RegionGate');
    },
  );

  it('keeps a gate-like Door lockedBy when no content-side RegionGate registry exists', async () => {
    const map = fixture();
    addLockedDoor(map, 'gate_00_zhulin_exit');

    expect((await build(map)).diagnostics).toEqual([]);
  });

  it('rejects an absolute external tileset outside content/tiled', async () => {
    const external = await mkdtemp(join(tmpdir(), 'tianshu-external-tsj-'));
    try {
      const path = join(external, 'terrain.tsj');
      await writeFile(path, JSON.stringify({ tilecount: 2, tiles: terrainTiles }));
      const map = fixture();
      (map['tilesets'] as Record<string, unknown>[])[0] = { firstgid: 1, source: path };
      expect(await code(map)).toBe('TS-CONTENT-MAP-004');
    } finally {
      await rm(external, { recursive: true, force: true });
    }
  });

  it.each([
    [
      'non-orthogonal',
      (map: Record<string, unknown>) => {
        map['orientation'] = 'isometric';
      },
      'TS-CONTENT-MAP-002',
    ],
    [
      'infinite',
      (map: Record<string, unknown>) => {
        map['infinite'] = true;
      },
      'TS-CONTENT-MAP-002',
    ],
    [
      'compressed layer',
      (map: Record<string, unknown>) => {
        const layer = (map['layers'] as Record<string, unknown>[])[0]!;
        layer['encoding'] = 'base64';
        layer['compression'] = 'gzip';
      },
      'TS-CONTENT-MAP-018',
    ],
    [
      'missing layer',
      (map: Record<string, unknown>) => {
        (map['layers'] as unknown[]).pop();
      },
      'TS-CONTENT-MAP-018',
    ],
    [
      'duplicate layer',
      (map: Record<string, unknown>) => {
        (map['layers'] as unknown[]).push({ ...(map['layers'] as Record<string, unknown>[])[0] });
      },
      'TS-CONTENT-MAP-018',
    ],
    [
      'terrain without height',
      (map: Record<string, unknown>) => {
        ((map['layers'] as Record<string, unknown>[])[1]!['data'] as number[])[0] = 0;
      },
      'TS-CONTENT-MAP-006',
    ],
    [
      'height above 10',
      (map: Record<string, unknown>) => {
        (map['tilesets'] as Record<string, unknown>[])[1]!['tiles'] = [
          { id: 0, properties: [property('height', 11)] },
        ];
      },
      'TS-CONTENT-MAP-006',
    ],
    [
      'unknown terrain',
      (map: Record<string, unknown>) => {
        (map['tilesets'] as Record<string, unknown>[])[0]!['tiles'] = [
          { id: 0, properties: [property('terrainId', 'tr_unknown')] },
        ];
      },
      'TS-CONTENT-MAP-007',
    ],
    [
      'decoration without decoId',
      (map: Record<string, unknown>) => {
        (map['tilesets'] as unknown[]).push({ firstgid: 200, tilecount: 1, tiles: [{ id: 0 }] });
        ((map['layers'] as Record<string, unknown>[])[2]!['data'] as number[])[0] = 200;
      },
      'TS-CONTENT-MAP-004',
    ],
    [
      'ramp without direction',
      (map: Record<string, unknown>) => {
        (map['tilesets'] as Record<string, unknown>[])[0]!['tiles'] = [
          { id: 0, properties: [property('terrainId', 'tr_taijie'), property('ramp', true)] },
        ];
      },
      'TS-CONTENT-MAP-008',
    ],
    [
      'unknown object class',
      (map: Record<string, unknown>) => {
        (
          (map['layers'] as Record<string, unknown>[])[3]!['objects'] as Record<string, unknown>[]
        )[0]!['type'] = 'Unknown';
      },
      'TS-CONTENT-MAP-009',
    ],
    [
      'flipped gid',
      (map: Record<string, unknown>) => {
        ((map['layers'] as Record<string, unknown>[])[0]!['data'] as number[])[0] = 0x80000001;
      },
      'TS-CONTENT-MAP-005',
    ],
    [
      'off-grid anchor',
      (map: Record<string, unknown>) => {
        (
          (map['layers'] as Record<string, unknown>[])[3]!['objects'] as Record<string, unknown>[]
        )[0]!['x'] = 1;
      },
      'TS-CONTENT-MAP-010',
    ],
    [
      'invalid region ID',
      (map: Record<string, unknown>) => {
        (map['properties'] as Record<string, unknown>[]).find(
          (entry) => entry['name'] === 'regionId',
        )!['value'] = 'bad';
      },
      'TS-CONTENT-MAP-009',
    ],
    [
      'invalid scene ID',
      (map: Record<string, unknown>) => {
        (map['properties'] as Record<string, unknown>[]).find(
          (entry) => entry['name'] === 'sceneId',
        )!['value'] = 'scn_old';
      },
      'TS-CONTENT-MAP-009',
    ],
    [
      'invalid chapter property',
      (map: Record<string, unknown>) => {
        (map['properties'] as Record<string, unknown>[]).find(
          (entry) => entry['name'] === 'chapterScope',
        )!['value'] = 'ch99_bad';
      },
      'TS-CONTENT-MAP-009',
    ],
  ])('rejects %s', async (_name, mutate, expected) => {
    const map = fixture();
    mutate(map);
    expect(await code(map)).toBe(expected);
  });

  it('rejects arenas beyond 400 cells or span 20', async () => {
    const map = fixture(21, 20);
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(
      object(
        3,
        'arena',
        'BattleArena',
        0,
        0,
        [property('playerCapacity', 1), property('enemyCapacity', 1), property('narrow', false)],
        21 * 48,
        20 * 48,
      ),
    );
    expect(await code(map)).toBe('TS-CONTENT-MAP-013');
  });

  it('rejects a PlayerSpawn on explicitly non-standable terrain', async () => {
    const map = fixture();
    const tileset = (map['tilesets'] as Record<string, unknown>[])[0]!;
    tileset['tilecount'] = 3;
    (tileset['tiles'] as unknown[]).push({
      id: 2,
      properties: [property('terrainId', 'tr_shibi')],
    });
    ((map['layers'] as Record<string, unknown>[])[0]!['data'] as number[])[21] = 3;
    expect(await code(map)).toBe('TS-CONTENT-MAP-011');
  });

  it('rejects a main gate without alternative and a one-way gate without return', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(gateObject({ intent: 'main', alt: '[]', earliest: 0.1 }));
    expect(await code(map)).toBe('TS-CONTENT-MAP-014');
  });

  it('rejects a one-way gate without a return endpoint', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(gateObject({ oneWay: true }));
    expect(await code(map)).toBe('TS-CONTENT-MAP-014');
  });

  it('rejects a one-way gate whose return door is absent', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(gateObject({ oneWay: true, returnDoorId: 'return_missing' }));
    expect((await build(map)).diagnostics).toEqual([]);
    const diagnostics = await validateTiledMaps([await source(map)]);
    expect(diagnostics[0]?.code).toBe('TS-CONTENT-MAP-014');
  });

  it('converts a structured QinggongGate alternative without embedding prose', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(gateObject({
      intent: 'main',
      earliest: 0.25,
      alt: JSON.stringify([{ any: [{ item: 'it_feizhua' }, { str: 60 }] }]),
    }));
    const result = await build(map);
    expect(result.diagnostics).toEqual([]);
    expect(result.objects.find((entry) => entry.class === 'QinggongGate')).toMatchObject({
      id: 'gate_00_fixture',
      from: { q: 0, r: 0 },
      to: { region: 'rg_jiangnan_taihu', scene: 'sc_00_fixture', cell: { q: 1, r: 0 } },
      alt: [{ any: [{ item: 'it_feizhua' }, { str: 60 }] }],
    });
  });

  it.each([
    ['malformed alt JSON', { alt: '[}' }],
    ['invalid GateExpr', { alt: JSON.stringify([{ unknown: true }]) }],
    ['from different from anchor', { fromQ: 1 }],
  ])('rejects a QinggongGate with %s', async (_name, overrides) => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(gateObject(overrides));
    expect(await code(map)).toBe(
      _name === 'malformed alt JSON' ? 'TS-CONTENT-MAP-009' : 'TS-CONTENT-MAP-014',
    );
  });

  it('rejects a QinggongGate whose target cell is outside the target valid bitmap', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(gateObject({ toQ: 19, toR: 15 }));
    const layers = map['layers'] as Record<string, unknown>[];
    (layers[0]!['data'] as number[])[319] = 0;
    (layers[1]!['data'] as number[])[319] = 0;
    const diagnostics = await validateTiledMaps([await source(map)]);
    expect(diagnostics[0]?.code).toBe('TS-CONTENT-MAP-014');
  });

  it('closes a one-way QinggongGate through a Door on the target scene', async () => {
    const origin = fixture();
    const target = fixture();
    setScene(target, 'sc_00_target');
    const originObjects = (origin['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    const targetObjects = (target['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    originObjects.push(
      gateObject({
        toScene: 'sc_00_target',
        oneWay: true,
        returnDoorId: 'gate_return',
      }),
      object(4, 'return_pair', 'Door', 48, 0, [
        property('mode', 'portal'),
        property('pairId', 'gate_return'),
        property('oneWay', false),
        property('targetRegionId', 'rg_jiangnan_taihu'),
        property('targetSceneId', 'sc_00_target'),
        property('targetSpawnId', 'spawn_a'),
      ]),
    );
    targetObjects.push(object(3, 'gate_return', 'Door', 0, 0, [
      property('mode', 'portal'),
      property('pairId', 'return_pair'),
      property('oneWay', false),
      property('targetRegionId', 'rg_jiangnan_taihu'),
      property('targetSceneId', 'sc_00_fixture'),
      property('targetSpawnId', 'spawn_a'),
    ]));
    const diagnostics = await validateTiledMaps([
      await source(origin),
      await source(target, 'sc_00_target.tmj'),
    ]);
    expect(diagnostics).toEqual([]);
  });

  it('rejects an unsplittable RegionMap above the 256 KiB leaf gate', async () => {
    await expect(
      emitLeaves([
        {
          logicalName: 'ch00.rules.rg_fixture.json',
          kind: 'rules',
          load: 'region',
          region: 'rg_fixture',
          value: { schemaVersion: 'region-map.v1', chunk: 'x'.repeat(MAX_LEAF_BYTES) },
        },
      ]),
    ).rejects.toThrow('CONTENT_LEAF_ENTRY_TOO_LARGE');
  });

  it('rejects doors whose target scene is absent during full-map validation', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(
      object(3, 'exit', 'Door', 0, 0, [
        property('mode', 'portal'),
        property('pairId', 'entry'),
        property('oneWay', false),
        property('targetRegionId', 'rg_jiangnan_taihu'),
        property('targetSceneId', 'sc_00_missing'),
        property('targetSpawnId', 'spawn_entry'),
      ]),
    );
    const compiled = await import('./tiled');
    const diagnostics = await compiled.validateTiledMaps([await source(map)]);
    expect(diagnostics[0]?.code).toBe('TS-CONTENT-MAP-012');
  });

  it('rejects a self-paired door and an absent one-way return door', async () => {
    const map = fixture();
    const objects = (map['layers'] as Record<string, unknown>[])[3]!['objects'] as unknown[];
    objects.push(
      object(3, 'self_door', 'Door', 0, 0, [
        property('mode', 'portal'),
        property('pairId', 'self_door'),
        property('oneWay', false),
        property('targetRegionId', 'rg_jiangnan_taihu'),
        property('targetSceneId', 'sc_00_fixture'),
        property('targetSpawnId', 'spawn_a'),
      ]),
      object(4, 'exit', 'Door', 48, 0, [
        property('mode', 'portal'),
        property('pairId', 'self_door'),
        property('oneWay', true),
        property('targetRegionId', 'rg_jiangnan_taihu'),
        property('targetSceneId', 'sc_00_fixture'),
        property('targetSpawnId', 'spawn_a'),
        property('returnDoorId', 'return_missing'),
      ]),
    );
    const diagnostics = await (await import('./tiled')).validateTiledMaps([await source(map)]);
    expect(diagnostics.filter((entry) => entry.code === 'TS-CONTENT-MAP-012')).toHaveLength(2);
  });

  it('converts a 160x160 scene within the recorded performance budget', async () => {
    const input = await source(fixture(160, 160));
    const started = performance.now();
    const result = await compileTiledMap(input);
    const elapsedMs = performance.now() - started;
    console.info(`[tiled-perf] 160x160 compile=${elapsedMs.toFixed(2)}ms budget=2000ms`);
    expect(result.diagnostics).toEqual([]);
    expect(elapsedMs).toBeLessThan(2_000);
  });

  it('marks a 161x160 stress scene as above the normal authoring size', async () => {
    const result = await build(fixture(161, 160));
    expect(result.map).not.toBeNull();
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: 'TS-CONTENT-MAP-015', severity: 'warning' }),
    ]);
  });
});
