import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { compareCodePoints } from '@tianshu/shared';

export interface DiscoveredSource { readonly path: string; readonly absolutePath: string;
  readonly kind: 'content' | 'ink' | 'inkmeta' | 'locale' | 'migration'; readonly text: string; }
const ignored = new Set(['_drafts', '.schema', '.cache', 'node_modules']);
const SOURCE_LIMIT = 2 * 1024 * 1024;

export async function discoverContent(rootDir: string, sourceDir = 'content'): Promise<readonly DiscoveredSource[]> {
  const base = resolve(rootDir, sourceDir); const sources: DiscoveredSource[] = [];
  const collisions = new Map<string, string>();
  const walk = async (directory: string): Promise<void> => {
    if (!directory.startsWith(base)) throw new TypeError(`CONTENT_PATH_OUTSIDE:${directory}`);
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareCodePoints(left.name, right.name));
    for (const entry of entries) {
      if (ignored.has(entry.name) || entry.name.endsWith('~')) continue;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) { await walk(absolutePath); continue; }
      const path = relative(rootDir, absolutePath).replaceAll('\\', '/');
      const key = path.normalize('NFC').toLowerCase(); const previous = collisions.get(key);
      if (previous !== undefined) throw new TypeError(`CONTENT_PATH_COLLISION:${previous}:${path}`);
      collisions.set(key, path);
      if (extname(entry.name) === '.yml') throw new TypeError(`CONTENT_YML_FORBIDDEN:${path}`);
      if (!/\.(?:yaml|json|ink)$/u.test(entry.name)) continue;
      if ((await stat(absolutePath)).size > SOURCE_LIMIT) throw new TypeError(`CONTENT_SOURCE_TOO_LARGE:${path}`);
      const kind = entry.name.endsWith('.inkmeta.yaml') ? 'inkmeta' : entry.name.endsWith('.ink') ? 'ink'
        : path.startsWith('content/locales/') ? 'locale' : path.startsWith('content/migrations/') ? 'migration' : 'content';
      sources.push({ path, absolutePath, kind, text: await readFile(absolutePath, 'utf8') });
    }
  };
  await walk(base); return sources.sort((left, right) => compareCodePoints(left.path, right.path));
}
