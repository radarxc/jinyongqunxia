import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { compareCodePoints } from '@tianshu/shared';
import { parseYamlFile } from '../content-registry';

export interface DiscoveredSource { readonly path: string; readonly absolutePath: string;
  readonly kind: 'content' | 'ink' | 'inkmeta' | 'locale' | 'migration' | 'tiled'; readonly text: string; }
const ignored = new Set(['_drafts', '.schema', '.cache', 'node_modules']);
const SOURCE_LIMIT = 2 * 1024 * 1024;

async function readOptional(path: string): Promise<string | undefined> {
  try { return await readFile(path, 'utf8'); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function validateFacilityLayouts(
  rootDir: string, sources: readonly DiscoveredSource[],
): Promise<void> {
  for (const source of sources) {
    if (!/^content\/town\/facilities\/[^/]+\.yaml$/u.test(source.path)) continue;
    const facility = parseYamlFile({ path: source.path, text: source.text }) as {
      schemaVersion?: string; layoutKey?: string;
      facilities?: readonly { readonly buildingId?: string }[];
    };
    if (facility.schemaVersion !== 'town-facilities.v1' ||
        typeof facility.layoutKey !== 'string') continue;
    const baselineName = `town_${facility.layoutKey.replace(/^city_/u, '')}.layout.yaml`;
    const paths = [
      join(rootDir, 'assets/default/town', facility.layoutKey, 'layout.yaml'),
      join(rootDir, 'assets/default/baseline/town', baselineName),
    ];
    const layoutText = await readOptional(paths[0]!) ?? await readOptional(paths[1]!);
    if (layoutText === undefined)
      throw new TypeError(`FACILITY_LAYOUT_MISSING:${facility.layoutKey}`);
    const layout = parseYamlFile({ path: paths[0]!, text: layoutText }) as {
      buildings?: readonly { readonly id?: string }[];
    };
    const ids = new Set((layout.buildings ?? []).map((building) => building.id));
    for (const entry of facility.facilities ?? [])
      if (typeof entry.buildingId === 'string' && !ids.has(entry.buildingId))
        throw new TypeError(
          `FACILITY_BUILDING_UNKNOWN:${facility.layoutKey}:${entry.buildingId}`,
        );
  }
}

export async function discoverContent(rootDir: string, sourceDir = 'content'): Promise<readonly DiscoveredSource[]> {
  const base = resolve(rootDir, sourceDir); const sources: DiscoveredSource[] = [];
  const collisions = new Map<string, string>();
  const walk = async (directory: string): Promise<void> => {
    if (!directory.startsWith(base)) throw new TypeError(`CONTENT_PATH_OUTSIDE:${directory}`);
    const entries = await readdir(directory, { withFileTypes: true }).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    });
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
      if (!/\.(?:yaml|json|ink|tmj)$/u.test(entry.name)) continue;
      const bytes = await readFile(absolutePath);
      if (bytes.byteLength > SOURCE_LIMIT) throw new TypeError(`CONTENT_SOURCE_TOO_LARGE:${path}`);
      const kind = entry.name.endsWith('.tmj') ? 'tiled' :
        entry.name.endsWith('.inkmeta.yaml') ? 'inkmeta' : entry.name.endsWith('.ink') ? 'ink'
        : path.startsWith('content/locales/') ? 'locale' : path.startsWith('content/migrations/') ? 'migration' : 'content';
      sources.push({ path, absolutePath, kind, text: bytes.toString('utf8') });
    }
  };
  await walk(base);
  await validateFacilityLayouts(rootDir, sources);
  return sources.sort((left, right) => compareCodePoints(left.path, right.path));
}
