import { describe, expect, it } from 'vitest';
import { createManifest, emitLeaves } from '@tianshu/data/build';
import type { ContentSource } from '@tianshu/data';
import type { JsonValue } from '@tianshu/shared';
import { loadRegionMaps } from './item-content';
import { regionFixtureMap } from './region-test-fixture';

async function source(region = 'rg_fixture', value: JsonValue = [regionFixtureMap()] as unknown as JsonValue): Promise<{
  source: ContentSource; reads: string[] }> {
  const chapter = 'ch00_yuenv';
  const leaves = await emitLeaves([{ logicalName: 'ch00.rules.region.fixture.json',
    kind: 'rules', load: 'region', region, value }]);
  const manifest = await createManifest(chapter, 'a'.repeat(64), leaves, []);
  const values = new Map<string, unknown>([[chapter + '/manifest.json', manifest],
    ...leaves.map((leaf): [string, unknown] => [chapter + '/' + leaf.logicalName, leaf.value])]);
  const reads: string[] = [];
  return { reads, source: { readJson: async (path) => { reads.push(path); return values.get(path); } } };
}

describe('region content preload', () => {
  it('loads only the selected load=region leaf and validates RegionMap', async () => {
    const fixture = await source();
    await expect(loadRegionMaps(fixture.source, 'ch00_yuenv', 'rg_fixture'))
      .resolves.toEqual([regionFixtureMap()]);
    expect(fixture.reads).toEqual(['ch00_yuenv/manifest.json',
      'ch00_yuenv/ch00.rules.region.fixture.json']);
  });

  it('rejects missing, malformed, and cross-region leaves', async () => {
    const missing = await source('rg_other');
    await expect(loadRegionMaps(missing.source, 'ch00_yuenv', 'rg_fixture'))
      .rejects.toThrow('REGION_RULES_UNAVAILABLE:CONTENT_REGION_LEAF_MISSING');
    const malformed = await source('rg_fixture',
      [{ ...regionFixtureMap(), schemaVersion: 'bad' }] as unknown as JsonValue);
    await expect(loadRegionMaps(malformed.source, 'ch00_yuenv', 'rg_fixture'))
      .rejects.toThrow('REGION_RULES_UNAVAILABLE');
  });
});
