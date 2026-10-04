import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadContent, parseContentFile } from '../tooling';
import { extractMeridianTopology, extractSectCatalog } from './catalog-extract';
import { MeridianTopologyCatalogSchema, SectCatalogSchema,
  type MeridianTopologyCatalog, type SectCatalog } from './catalog';

const root = new URL('../../../../', import.meta.url);
const read = (path: string): string => readFileSync(new URL(path, root), 'utf8');
const contentFiles = (paths: readonly string[]) => paths.map((path) => ({ path, text: read(path) }));
const meridianPaths = [
  'content/common/meridians/regular12.yaml',
  'content/common/meridians/extra8.yaml',
] as const;
const sectPaths = [
  'content/common/sects/temples.yaml',
  'content/common/sects/estates.yaml',
  'content/common/sects/associations.yaml',
  'content/common/sects/gulong.yaml',
] as const;

describe('authored catalog schemas', () => {
  it('accepts the production shards and registers the fixed totals', () => {
    const registry = loadContent(contentFiles([...meridianPaths, ...sectPaths]));
    const meridians = registry.events.filter((value): value is MeridianTopologyCatalog =>
      value.event === 'content/meridianTopologyCatalog');
    const sects = registry.events.filter((value): value is SectCatalog =>
      value.event === 'content/sectCatalog');
    expect(meridians.flatMap((value) => value.meridians)).toHaveLength(20);
    expect(meridians.flatMap((value) => value.meridians)
      .flatMap((value) => value.points)).toHaveLength(180);
    expect(sects.flatMap((value) => value.sects)).toHaveLength(99);
  });

  it('rejects malformed IDs, duplicate IDs, unknown fields, and incomplete shard sets', () => {
    const topologyEntry = { id: 'mer_test', name: '测试经',
      points: [{ id: 'ap_test', name: '测试穴' }] };
    const topology = { schemaVersion: 'meridian-topology.v1',
      id: 'ev_common_meridians_regular12',
      event: 'content/meridianTopologyCatalog', group: 'regular12',
      meridians: [topologyEntry, { ...topologyEntry, id: 'mer_test_2',
        points: [{ id: 'ap_test', name: '重复穴' }] }] };
    expect(MeridianTopologyCatalogSchema.safeParse(topology).success).toBe(false);
    expect(MeridianTopologyCatalogSchema.safeParse({ ...topology, extra: true }).success).toBe(false);
    expect(SectCatalogSchema.safeParse({ schemaVersion: 'sect-catalog.v1',
      id: 'ev_common_sects_temples',
      event: 'content/sectCatalog', group: 'temples',
      sects: [{ id: 'bad_id', name: '测试派' }] }).success).toBe(false);
    expect(() => loadContent(contentFiles([meridianPaths[0]])))
      .toThrow('CONTENT_MERIDIAN_TOPOLOGY_COUNTS');
  });

  it('is item-for-item equivalent to the one-time Markdown extraction', () => {
    const registry = loadContent(contentFiles([...meridianPaths, ...sectPaths]));
    const meridianEvents = registry.events.filter(
      (value): value is MeridianTopologyCatalog =>
        value.event === 'content/meridianTopologyCatalog' && 'group' in value);
    const sectEvents = registry.events.filter((value): value is SectCatalog =>
      value.event === 'content/sectCatalog' && 'group' in value);
    const topology = ['regular12', 'extra8'].flatMap((group) =>
      meridianEvents.find((value) => value.group === group)!.meridians);
    const sects = ['temples', 'estates', 'associations', 'gulong'].flatMap((group) =>
      sectEvents.find((value) => value.group === group)!.sects);
    expect(topology)
      .toEqual(extractMeridianTopology(read('docs/design/15-meridians-and-acupoints.md')));
    expect(sects)
      .toEqual(extractSectCatalog(read('docs/design/17-sects-compendium.md')));
  });

  it('routes catalog schema versions through the ordinary content parser', () => {
    expect(parseContentFile({ path: meridianPaths[0], text: read(meridianPaths[0]) }).kind)
      .toBe('event');
    expect(parseContentFile({ path: sectPaths[0], text: read(sectPaths[0]) }).kind)
      .toBe('event');
  });
});
