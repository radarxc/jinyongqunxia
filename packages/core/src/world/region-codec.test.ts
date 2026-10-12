/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only RegionMap base64 fixture.
import { Buffer } from 'node:buffer';
import type { RegionMap } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { decodeRegionMap } from './region-codec';

const encode = (value: Uint8Array): string => Buffer.from(value).toString('base64');

function mapWithLayers(layers = false): RegionMap {
  const valid = new Uint8Array(128);
  valid[0] = 0b0000_0111;
  const chunk = {
    q: 0, r: 0, width: 32 as const, height: 32 as const, valid: encode(valid),
    terrainEncoding: 'u8' as const,
    terrain: encode(new Uint8Array(1024)), heights: encode(new Uint8Array(1024)),
    ramps: [], water: [], precomputedAo: null, decos: [], objects: [],
  };
  if (layers) {
    const blocked = new Uint8Array(128); blocked[0] = 0b0000_0010;
    const building = new Uint8Array(1024); building[1] = 2;
    const surface = new Uint8Array(1024); surface[1] = 4;
    Object.assign(chunk, { blocked: encode(blocked), building: encode(building), surface: encode(surface) });
  }
  return {
    schemaVersion: 'region-map.v1', id: 'sc_00_fixture', regionId: 'rg_fixture',
    chapterScope: ['ch00_yuenv'], eraLayer: 'ch00',
    bounds: { qMin: 0, qMax: 31, rMin: 0, rMax: 31 }, chunkSize: 32,
    terrainTable: ['tr_pingdi'], chunks: [chunk], objects: [], playerSpawns: ['spawn_main'],
    adjacentRegions: [], eraPatchRefs: [], backdropAssetKey: null,
  };
}

describe('decodeRegionMap town layers', () => {
  it('decodes blocked, building and surface without making blocked cells opaque', () => {
    const decoded = decodeRegionMap(mapWithLayers(true), 0, 0);
    expect(decoded.cells).toEqual([
      { q: 0, r: 0, height: 0, moveCost: 1, standable: true, narrow: false,
        dangerous: false, terrainId: 'tr_pingdi', blocked: false, building: 0, surface: 0 },
      { q: 1, r: 0, height: 0, moveCost: 1, standable: false, narrow: false,
        dangerous: false, terrainId: 'tr_pingdi', blocked: true, building: 2, surface: 4 },
      { q: 2, r: 0, height: 0, moveCost: 1, standable: true, narrow: false,
        dangerous: false, terrainId: 'tr_pingdi', blocked: false, building: 0, surface: 0 },
    ]);
  });

  it('preserves the exact legacy cell shape when optional layers are absent', () => {
    expect(decodeRegionMap(mapWithLayers(), 0, 0).cells).toEqual([
      { q: 0, r: 0, height: 0, moveCost: 1, standable: true, narrow: false,
        dangerous: false, terrainId: 'tr_pingdi' },
      { q: 1, r: 0, height: 0, moveCost: 1, standable: true, narrow: false,
        dangerous: false, terrainId: 'tr_pingdi' },
      { q: 2, r: 0, height: 0, moveCost: 1, standable: true, narrow: false,
        dangerous: false, terrainId: 'tr_pingdi' },
    ]);
  });
});
