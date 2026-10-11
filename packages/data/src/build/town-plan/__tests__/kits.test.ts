import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { discoverContent } from '../../discover';
import { KNOWN_ARCHETYPES } from '../archetype';
import { compileKit, stringifyCompiledKit } from '../kit/compile';
import { parseBuildKitSource, parseCityKitMap } from '../kit/schema';
import type { BuildKitSource } from '../kit/schema';

function loadYaml(name: string): unknown {
  const url = new URL(`../../../../../../content/town/buildkits/${name}.yaml`, import.meta.url);
  return parse(readFileSync(fileURLToPath(url), 'utf8')) as unknown;
}

const SOURCES = {
  song_dali: loadYaml('song_dali'),
  xiyu: loadYaml('xiyu'),
} as const;

describe('buildkit.v1 pilot kits', () => {
  it('keeps build-time town kits out of runtime content discovery', { timeout: 15_000 }, async () => {
    const rootDir = fileURLToPath(new URL('../../../../../../', import.meta.url));
    const sources = await discoverContent(rootDir);
    expect(sources.some(({ path }) => path.startsWith('content/town/buildkits/'))).toBe(false);
  });

  it.each(Object.entries(SOURCES))('%s validates and compiles all 25 archetypes', (id, input) => {
    expect(parseBuildKitSource(input).id).toBe(id);
    const kit = compileKit(input);
    expect(Object.keys(kit.archetypes)).toEqual([...KNOWN_ARCHETYPES].sort());
    for (const name of KNOWN_ARCHETYPES) {
      expect(kit.archetypes[name]).toBeDefined();
      expect(kit.archetypes[name]).not.toHaveProperty('alias');
    }
  });

  it('keeps song_dali dimensions at the tech/16 section 3 values', () => {
    const kit = compileKit(SOURCES.song_dali);
    expect(kit.dims).toEqual({
      hall: { platform: 900, column: 4_200, diaRatio: 10, beam: 900, eave: 1_300,
        rise: 3_330, lift: [480, 360] },
      middle: { platform: 300, column: 3_200, diaRatio: 11, beam: 350, eave: 900,
        rise: 2_700, lift: [300, 220], verge: 700, upperStorey: 2_700 },
      shop: { platform: 150, column: 3_000, diaRatio: 11, beam: 350, eave: 800,
        rise: 2_625, lift: [180, 120], verge: 500 },
      vernacular: { platform: 300, column: 2_800, diaRatio: 11, beam: 350, eave: 700,
        rise: 2_625, lift: [180, 120], verge: 400 },
    });
    expect(kit.walls.gable).toMatchObject({ t: 350, dado: { h: 800 } });
    expect(kit.ridge).toMatchObject({ h: 550, ends: 'dali_square' });
  });

  it('keeps xiyu adobe dimensions in every explicit section 3 interval', () => {
    const kit = compileKit(SOURCES.xiyu);
    expect(kit.dims).toEqual({
      hall: { platform: 150, column: 3_400, diaRatio: 14, beam: 300, eave: 0,
        rise: 200, lift: [0, 0] },
      middle: { platform: 150, column: 3_400, diaRatio: 14, beam: 300, eave: 0,
        rise: 200, lift: [0, 0], upperStorey: 2_600 },
      shop: { platform: 150, column: 3_300, diaRatio: 14, beam: 300, eave: 0,
        rise: 200, lift: [0, 0] },
      vernacular: { platform: 150, column: 3_200, diaRatio: 14, beam: 300, eave: 0,
        rise: 200, lift: [0, 0] },
    });
    for (const dims of Object.values(kit.dims)) {
      expect(dims.column).toBeGreaterThanOrEqual(3_200);
      expect(dims.column).toBeLessThanOrEqual(3_500);
      expect(dims.eave).toBe(0);
      expect(dims.rise).toBe(200);
      expect(dims.lift).toEqual([0, 0]);
      expect(Math.trunc(dims.column / (dims.diaRatio ?? 1))).toBeGreaterThanOrEqual(200);
      expect(Math.trunc(dims.column / (dims.diaRatio ?? 1))).toBeLessThanOrEqual(260);
    }
    expect(kit.walls).toMatchObject({
      gable: { t: 600 }, back: { t: 600 }, front: { t: 450 }, enclosure: { t: 500 },
    });
    expect(kit.door).toMatchObject({ clearH: 2_200, single: 1_000, double: 1_200 });
    expect(kit.window).toMatchObject({ sill: 1_400, head: 2_000, width: 600 });
    expect(kit.variants).toMatchObject({
      parapetMm: 450, joistSpacingMm: 600, joistOverhangMm: 300,
    });
    expect(kit.archetypes['market']).toMatchObject({ recipe: 'adobe', size: 'shop' });
    expect(kit.archetypes['palace']).toMatchObject({ recipe: 'adobe', size: 'hall' });
  });

  it('separates xiyu zero eave from its 300 mm joist overhang', () => {
    const kit = compileKit(SOURCES.xiyu);
    expect(Object.values(kit.dims).map(({ eave }) => eave)).toEqual([0, 0, 0, 0]);
    expect(kit.variants['joistOverhangMm']).toBe(300);
  });

  it('compiles the tang_buddhist prohibitions and Tang finial', () => {
    const variant = compileKit(SOURCES.xiyu).variantSets?.['tang_buddhist'];
    expect(variant?.forbid).toEqual(['dome', 'pointed_arch']);
    expect(variant?.finial).toBe('tang_stupa');
    expect(variant?.forbid).not.toContain('flat');
  });

  it.each(Object.entries(SOURCES))('%s has 16 stable layer indices', (_id, input) => {
    const layers = compileKit(input).layers;
    expect(layers).toHaveLength(16);
    expect(new Set(layers.map(({ id }) => id))).toHaveProperty('size', 16);
    expect(layers.every(({ repeatMm }) => repeatMm.every(Number.isInteger))).toBe(true);
  });

  it.each(Object.entries(SOURCES))('%s is canonical, byte-stable, and at most 12 KB', (_id, input) => {
    const firstKit = compileKit(input);
    const first = JSON.stringify(firstKit);
    const second = JSON.stringify(compileKit(input));
    expect(second).toBe(first);
    expect(stringifyCompiledKit(firstKit)).toBe(first);
    expect(Buffer.byteLength(first)).toBeLessThanOrEqual(12 * 1_024);
  });

  it('rejects an alias that targets another alias', () => {
    const source = parseBuildKitSource(SOURCES.song_dali);
    const invalid: BuildKitSource = {
      ...source, archetypes: { ...source.archetypes, house: { alias: 'house_small' } },
    };
    expect(() => compileKit(invalid)).toThrow('BUILD_KIT_ALIAS_CHAIN');
  });

  it('rejects an alias that targets a missing archetype', () => {
    const source = parseBuildKitSource(SOURCES.song_dali);
    const invalid = {
      ...source, archetypes: { ...source.archetypes, house_small: { alias: 'missing' } },
    };
    expect(() => compileKit(invalid)).toThrow('BUILD_KIT_ALIAS_MISSING:house_small:missing');
  });

  it('rejects source floats instead of silently converting mm or bp', () => {
    const source = parseBuildKitSource(SOURCES.song_dali);
    expect(() => compileKit({
      ...source, dims: {
        ...source.dims, vernacular: { ...source.dims.vernacular, rise: 0.2625 },
      },
    })).toThrow();
  });

  it('lists only the three explicit city overrides', () => {
    expect(parseCityKitMap(loadYaml('city-kits'))).toEqual({
      city_dali__ch01: 'song_dali',
      city_dali__ch10: 'song_dali',
      city_turpan__ch10: 'xiyu:tang_buddhist',
    });
  });
});
