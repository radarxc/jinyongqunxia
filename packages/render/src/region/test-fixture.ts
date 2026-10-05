import type { RegionDynamicView, RegionObjectView, RegionStaticView } from './types';

function base64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function regionStaticFixture(width = 2, height = 1,
  objects: readonly RegionObjectView[] = []): RegionStaticView {
  const chunks: RegionStaticView['chunks'][number][] = [];
  for (let chunkR = 0; chunkR < Math.ceil(height / 32); chunkR += 1) {
    for (let chunkQ = 0; chunkQ < Math.ceil(width / 32); chunkQ += 1) {
      const valid = new Uint8Array(128); const terrain = new Uint8Array(1_024);
      const heights = new Uint8Array(1_024);
      for (let localR = 0; localR < 32; localR += 1) {
        for (let localQ = 0; localQ < 32; localQ += 1) {
          const q = chunkQ * 32 + localQ; const r = chunkR * 32 + localR;
          if (q >= width || r >= height) continue;
          const slot = localR * 32 + localQ; const byte = slot >> 3;
          valid[byte] = valid[byte]! | 1 << (slot & 7);
          terrain[slot] = (q + r) % 2; heights[slot] = q === 1 && r === 0 ? 2 : 0;
        }
      }
      chunks.push({ q: chunkQ, r: chunkR, width: 32, height: 32, valid: base64(valid),
        terrainEncoding: 'u8', terrain: base64(terrain), heights: base64(heights),
        precomputedAo: null, ramps: [], water: [], decos: [], objects: [] });
    }
  }
  return { schemaVersion: 'region-static.v1', regionId: 'rg_fixture', sceneId: 'sc_00_zhulin',
    bounds: { qMin: 0, qMax: width - 1, rMin: 0, rMax: height - 1 },
    terrainTable: ['tr_pingdi', 'tr_shenshui'], chunks, objects, backdropAssetKey: null };
}

export function regionDynamicFixture(): RegionDynamicView {
  return { regionId: 'rg_fixture', sceneId: 'sc_00_zhulin', spawnId: 'bookfall',
    playerHex: { q: 0, r: 0 }, facing: 0, interactableAnchors: [], doors: [], pendingMount: null };
}
