import { describe, expect, it } from 'vitest';
import { chapterFromContentUrl, classifySwRoute, isShellPrecacheUrl, isViteHashedAsset } from './routes';

describe('service worker route classifiers', () => {
  it.each([['/content/ch01_tianlong/a.json', 'content'],
    ['/content/ch01_tianlong/manifest.json', 'manifest'], ['/content/index.json', 'manifest'],
    ['/offline/closure.ch01_tianlong.json', 'manifest'], ['/version.json', 'manifest'],
    ['/assets/default/item/a.png', 'asset'], ['/content/vfx/a.json', 'asset'],
    ['/api/save', null]] as const)('classifies %s as %s', (url, expected) => {
    expect(classifySwRoute(url)).toBe(expected);
  });
  it('recognizes only Vite hashed immutable assets', () => {
    expect(isViteHashedAsset('/assets/entry-DUjqiE2n.js')).toBe(true);
    expect(isViteHashedAsset('/assets/default/icon.png')).toBe(false);
  });
  it('keeps content, default assets, demos and split book/vfx chunks out of shell', () => {
    expect(isShellPrecacheUrl('/index.html')).toBe(true);
    for (const path of ['/content/ch01/a.json', '/assets/default/a.svg',
      '/assets/book-ch01-deadbeef.js', '/assets/vfx-deadbeef.js', '/rig-demo/index.html'])
      expect(isShellPrecacheUrl(path), path).toBe(false);
    expect(chapterFromContentUrl('/content/ch10_baima/a.json')).toBe('ch10_baima');
  });
});
