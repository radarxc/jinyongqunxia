export type SwRouteKind = 'content' | 'manifest' | 'asset' | null;

export function classifySwRoute(input: string | URL): SwRouteKind {
  const path = input instanceof URL ? input.pathname : new URL(input, 'https://tianshu.invalid').pathname;
  if (path === '/version.json' || path === '/content/index.json' ||
      /^\/offline\/(?:closure\.[a-z0-9_]+|copied-assets)\.json$/u.test(path) ||
      /^\/content\/[a-z0-9_]+\/manifest\.json$/u.test(path)) return 'manifest';
  if (path.startsWith('/assets/default/') || path.startsWith('/content/vfx/')) return 'asset';
  if (/^\/content\/[a-z0-9_]+\/.+\.json$/u.test(path)) return 'content';
  return null;
}

export function isViteHashedAsset(path: string): boolean {
  return /(?:^|\/)[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css|wasm|woff2|svg)$/u.test(path);
}

export function isShellPrecacheUrl(path: string): boolean {
  if (path.includes('/assets/default/') || path.includes('/content/') ||
      /(?:^|\/)book-/u.test(path) || /(?:^|\/)vfx-/u.test(path) ||
      /(?:^|\/)rig-demo(?:-|\.|\/|$)/u.test(path)) return false;
  return /\.(?:js|css|html|wasm|woff2|svg|webmanifest)$/u.test(path);
}

export function chapterFromContentUrl(path: string): string | null {
  return /^\/content\/([a-z0-9_]+)\//u.exec(path)?.[1] ?? null;
}
