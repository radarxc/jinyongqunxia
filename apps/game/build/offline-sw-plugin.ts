import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import type { OfflineClosure } from './offline-closure';

/** Bind each worker to its build; a waiting worker must not change the active worker's metadata. */
export function offlineSwPlugin(dist: string): Plugin {
  const id = 'virtual:tianshu-offline-build';
  return { name: 'tianshu-offline-sw', resolveId: source => source === id ? '\0' + id : undefined,
    async load(source) {
      if (source !== '\0' + id) return;
      const directory = join(dist, 'offline');
      const assets = JSON.parse(await readFile(join(directory, 'copied-assets.json'), 'utf8'));
      const chapters: Record<string, { releaseHash: string; files: OfflineClosure['files'] }> = {};
      for (const file of (await readdir(directory)).filter(name => /^closure\..+\.json$/u.test(name)).sort()) {
        const closure = JSON.parse(await readFile(join(directory, file), 'utf8')) as OfflineClosure;
        chapters[closure.chapter] = { releaseHash: closure.releaseHash,
          files: closure.files.filter(entry => entry.kind === 'content' || entry.kind === 'manifest') };
      }
      return `export default ${JSON.stringify({ assets: assets.files, chapters })};`;
    } };
}
