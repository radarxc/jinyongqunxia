import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { imageSize, publishMapOverlays, publishVfxRuntime, readAssetManifest } from './asset-manifest';

describe('game build asset publishing', () => {
  it('publishes only paths named by the generated VFX manifest', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-vfx-'));
    await mkdir(join(root, 'content/vfx'), { recursive: true });
    await mkdir(join(root, 'assets/default/vfx/test'), { recursive: true });
    await writeFile(join(root, 'assets/default/vfx/test/source_sheet.png'), 'atlas');
    await writeFile(join(root, 'content/vfx/runtime-files.json'), JSON.stringify({
      schemaVersion: 'event.v1', actions: [{ payload: { schema: 'tianshu-vfx-runtime.v1',
        files: ['assets/default/vfx/test/source_sheet.png'] } }],
    }));
    expect(await publishVfxRuntime(root, true)).toBe(1);
    expect(await readFile(join(root, 'apps/game/public/assets/default/vfx/test/source_sheet.png'), 'utf8')).toBe('atlas');
  });
});

describe('asset manifest projection', () => {
  it('registers and copies the full-extent painted map while preserving legacy map registration', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-painted-map-'));
    const directory = join(root, 'assets/default/map/world');
    const legacy = join(root, 'assets/default/baseline/map');
    await mkdir(directory, { recursive: true });
    await mkdir(legacy, { recursive: true });
    await writeFile(join(directory, 'manifest.yaml'), `- id: map_world_jianghu__base01
  status: candidate
  file: map_world_jianghu__base01.webp
  extent_grid: [0, 0, 512, 384]
- id: map_world_rejected
  status: rejected
  file: rejected.webp
`);
    await writeFile(join(directory, 'map_world_jianghu__base01.webp'), 'painted map');
    await writeFile(join(legacy, 'manifest.yaml'), `- id: ref_map_jianghu__ch01_base01
  status: approved
  file: old.png
`);
    await writeFile(join(legacy, 'old.png'), 'legacy map');
    const copied = new Set<string>(); const references = new Map<string, Set<string>>();
    const projected = await readAssetManifest(root, true, [], copied, references);
    const mapPath = 'assets/default/map/world/map_world_jianghu__base01.webp';
    expect(projected['map_world_jianghu__base01']).toEqual({ map: mapPath });
    expect(projected['ref_map_jianghu__ch01_base01']).toEqual({ map: 'assets/default/baseline/map/old.png' });
    expect(projected['map_world_rejected']).toBeUndefined();
    expect(copied.has(mapPath)).toBe(true);
    expect(references.get('map_world_jianghu__base01')).toEqual(new Set(['/' + mapPath]));
    expect(await readFile(join(root, 'apps/game/public', mapPath), 'utf8')).toBe('painted map');
  });

  it('keeps accepted keys when source images are sparse and only skips copying', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-assets-'));
    const directory = join(root, 'assets/default/item/food');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'manifest.yaml'), `- id: it_present
  status: candidate
  icons:
    - file: icons/it_present_64.png
- id: it_missing
  status: approved
  icons:
    - file: icons/it_missing_64.png
- id: it_rejected
  status: rejected
  icons:
    - file: icons/it_rejected_64.png
`);
    await mkdir(join(directory, 'icons'), { recursive: true });
    await writeFile(join(directory, 'icons/it_present_64.png'), 'present');
    const warnings: string[] = []; const original = console.warn;
    console.warn = (message) => warnings.push(String(message));
    try {
      const projected = await readAssetManifest(root, true);
      expect(projected).toEqual({
        it_present: { icon: 'assets/default/item/food/icons/it_present_64.png' },
        it_missing: { icon: 'assets/default/item/food/icons/it_missing_64.png' },
      });
      expect(warnings).toEqual(['ASSET_SOURCE_MISSING:item/food/icons/it_missing_64.png']);
      expect(await readFile(join(root,
        'apps/game/public/assets/default/item/food/icons/it_present_64.png'), 'utf8'))
        .toBe('present');
    } finally { console.warn = original; }
  });
});

/** Minimal PNG header (signature + IHDR) carrying the given pixel size. */
function pngHeader(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  bytes.writeUInt32BE(13, 8); bytes.write('IHDR', 12, 'ascii');
  bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return bytes;
}

describe('image header sizes', () => {
  it('reads PNG, lossless and extended WebP and baseline JPEG dimensions', () => {
    expect(imageSize(pngHeader(768, 704))).toEqual({ width: 768, height: 704 });
    const vp8x = Buffer.alloc(30); vp8x.write('RIFF', 0, 'ascii'); vp8x.write('WEBPVP8X', 8, 'ascii');
    vp8x.writeUIntLE(4095, 24, 3); vp8x.writeUIntLE(3071, 27, 3);
    expect(imageSize(vp8x)).toEqual({ width: 4096, height: 3072 });
    const vp8l = Buffer.alloc(30); vp8l.write('RIFF', 0, 'ascii'); vp8l.write('WEBPVP8L', 8, 'ascii');
    vp8l.writeUInt32LE((683 - 1) | ((570 - 1) << 14), 21);
    expect(imageSize(vp8l)).toEqual({ width: 683, height: 570 });
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08,
      0x02, 0x00, 0x03, 0x00, 0x03, 0x01, 0x22, 0x00]);
    expect(imageSize(jpeg)).toEqual({ width: 768, height: 512 });
    expect(imageSize(Buffer.from('not an image'))).toBeNull();
  });
});

describe('world-map overlays (tech/13 §5.2–§5.3)', () => {
  it('copies the marker atlas and writes a sorted landmark index, skipping rejected rows', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-map-overlays-'));
    const markers = join(root, 'assets/default/map/markers');
    const landmarks = join(root, 'assets/default/map/landmark');
    await mkdir(markers, { recursive: true }); await mkdir(landmarks, { recursive: true });
    await writeFile(join(markers, 'manifest.yaml'), `- id: map_markers_atlas
  status: candidate
  file: map_markers_atlas.webp
`);
    await writeFile(join(markers, 'map_markers_atlas.webp'), 'atlas');
    await writeFile(join(markers, 'atlas.json'), '{"schema":"tianshu.map-markers.v1"}');
    await writeFile(join(landmarks, 'manifest.yaml'), `- id: map_landmark_city_xian__ming
  status: candidate
  file: map_landmark_city_xian__ming.webp
  node: city_xian
  chapters: [ch05, ch06]
  anchor: [384, 400]
  footprint_grid: 8
  size: 768x768
- id: map_landmark_city_beijing__ming
  status: candidate
  file: map_landmark_city_beijing__ming.webp
  node: city_beijing
  chapters: [ch05]
  anchor: [380.5, 390]
  footprint_grid: 11
  size: 768x704
- id: map_landmark_rejected
  status: rejected
  file: rejected.webp
  node: city_x
  chapters: [ch01]
  anchor: [0, 0]
  footprint_grid: 1
  size: 1x1
`);
    await writeFile(join(landmarks, 'map_landmark_city_xian__ming.webp'), pngHeader(768, 768));
    await writeFile(join(landmarks, 'map_landmark_city_beijing__ming.webp'), pngHeader(768, 704));
    const index = await publishMapOverlays(root, true);
    expect(index).toEqual([
      { id: 'map_landmark_city_beijing__ming', node: 'city_beijing', chapters: ['ch05'],
        url: '/assets/default/map/landmark/map_landmark_city_beijing__ming.webp', anchor: [380.5, 390],
        footprintGrid: 11, width: 768, height: 704 },
      { id: 'map_landmark_city_xian__ming', node: 'city_xian', chapters: ['ch05', 'ch06'],
        url: '/assets/default/map/landmark/map_landmark_city_xian__ming.webp', anchor: [384, 400],
        footprintGrid: 8, width: 768, height: 768 },
    ]);
    const published = join(root, 'apps/game/public/assets/default/map');
    expect(JSON.parse(await readFile(join(published, 'landmark/index.json'), 'utf8'))).toEqual(index);
    expect(await readFile(join(published, 'markers/map_markers_atlas.webp'), 'utf8')).toBe('atlas');
    expect(await readFile(join(published, 'markers/atlas.json'), 'utf8')).toContain('tianshu.map-markers.v1');
  });

  it('publishes the hero pack only when every strip hero.json names is accepted, and never leaves stale files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-map-hero-'));
    const hero = join(root, 'assets/default/map/hero');
    await mkdir(hero, { recursive: true });
    const manifest = (runStatus: string) => `- id: map_hero_male_walk
  status: candidate
  file: map_hero_male_walk.webp
- id: map_hero_male_run
  status: ${runStatus}
  file: map_hero_male_run.webp
- id: map_hero_male_idle
  status: candidate
  file: map_hero_male_idle.webp
`;
    await writeFile(join(hero, 'manifest.yaml'), manifest('candidate'));
    for (const clip of ['walk', 'run', 'idle']) await writeFile(join(hero, `map_hero_male_${clip}.webp`), clip);
    await writeFile(join(hero, 'hero.json'), JSON.stringify({ schema: 'tianshu.map-hero.v1', variants: { male: {
      walk: { image: 'map_hero_male_walk.webp' }, run: { image: 'map_hero_male_run.webp' }, idle: { image: 'map_hero_male_idle.webp' } } } }));
    const published = join(root, 'apps/game/public/assets/default/map/hero');
    await mkdir(published, { recursive: true });
    await writeFile(join(published, 'map_hero_old.webp'), 'old');
    await publishMapOverlays(root, true);
    expect(await readFile(join(published, 'map_hero_male_run.webp'), 'utf8')).toBe('run');
    expect(await readFile(join(published, 'hero.json'), 'utf8')).toContain('tianshu.map-hero.v1');
    await expect(readFile(join(published, 'map_hero_old.webp'))).rejects.toThrow();
    // Second build: the run strip is rejected, so neither it nor hero.json may remain published.
    await writeFile(join(hero, 'manifest.yaml'), manifest('rejected'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await publishMapOverlays(root, true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('MAP_HERO_INCOMPLETE'));
    await expect(readFile(join(published, 'hero.json'))).rejects.toThrow();
    await expect(readFile(join(published, 'map_hero_male_run.webp'))).rejects.toThrow();
    expect(await readFile(join(published, 'map_hero_male_walk.webp'), 'utf8')).toBe('walk');
    // Third build: every strip accepted, but the idle file no longer matches its manifest hash.
    const sha = (text: string) => createHash('sha256').update(text).digest('hex');
    const withHashes = manifest('candidate').replace(/file: (map_hero_male_(walk|run|idle)\.webp)\n/g,
      (_line, file: string, clip: string) => `file: ${file}\n  sha256: ${sha(clip === 'idle' ? 'older idle' : clip)}\n`);
    await writeFile(join(hero, 'manifest.yaml'), withHashes);
    warn.mockClear();
    await publishMapOverlays(root, true);
    expect(warn).toHaveBeenCalledWith('MAP_HERO_STALE:map_hero_male_idle.webp');
    await expect(readFile(join(published, 'hero.json'))).rejects.toThrow();
    await expect(readFile(join(published, 'map_hero_male_idle.webp'))).rejects.toThrow();
    warn.mockRestore();
  });

  it('publishes an empty index without overlay manifests and rejects malformed landmark rows', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-map-overlays-empty-'));
    await mkdir(join(root, 'assets/default'), { recursive: true });
    expect(await publishMapOverlays(root, true)).toEqual([]);
    expect(await readFile(join(root, 'apps/game/public/assets/default/map/landmark/index.json'), 'utf8')).toBe('[]');
    const landmarks = join(root, 'assets/default/map/landmark');
    await mkdir(landmarks, { recursive: true });
    await writeFile(join(landmarks, 'manifest.yaml'), `- id: map_landmark_bad
  status: candidate
  file: bad.webp
  node: city_x
  chapters: [ch01]
  footprint_grid: 8
  size: 10x10
`);
    await expect(publishMapOverlays(root, false)).rejects.toThrow('MAP_LANDMARK_ROW_INVALID:map_landmark_bad');
    await writeFile(join(landmarks, 'manifest.yaml'), `- id: map_landmark_stale
  status: candidate
  file: stale.webp
  node: city_x
  chapters: [ch01]
  anchor: [1, 1]
  footprint_grid: 8
  size: 10x10
`);
    await writeFile(join(landmarks, 'stale.webp'), pngHeader(12, 10));
    await expect(publishMapOverlays(root, false)).rejects.toThrow('MAP_LANDMARK_SIZE_MISMATCH:map_landmark_stale:12x10');
    await writeFile(join(landmarks, 'manifest.yaml'), `- id: map_landmark_far
  status: candidate
  file: far.webp
  node: city_x
  chapters: [ch01]
  anchor: [5, 11]
  footprint_grid: 8
  size: 10x10
`);
    await writeFile(join(landmarks, 'far.webp'), pngHeader(10, 10));
    await expect(publishMapOverlays(root, false)).rejects.toThrow('MAP_LANDMARK_ANCHOR_OUTSIDE:map_landmark_far:5,11');
    await writeFile(join(landmarks, 'manifest.yaml'), `- id: map_landmark_nan
  status: candidate
  file: far.webp
  node: city_x
  chapters: [ch01]
  anchor: [5, 5]
  footprint_grid: -2
  size: 10x10
`);
    // Non-finite numbers never get this far (the strict YAML loader rejects .nan); a negative footprint does.
    await expect(publishMapOverlays(root, false)).rejects.toThrow('MAP_LANDMARK_ROW_INVALID:map_landmark_nan');
  });
});
