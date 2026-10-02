import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { parseContentFile } from '@tianshu/data/tooling';
import { mapFromRegistration, type ItemDef, type MartialArtDef,
  type NpcDef, type TownRuntimeDefinition } from '@tianshu/data/schemas';
import { filesIn, publishVfxRuntime, readAssetManifest } from './asset-manifest';

const root = resolve(import.meta.dirname, '../../..');
const virtualId = 'virtual:tianshu-content';
const townIndexId = 'virtual:tianshu-towns';
const townPrefix = 'virtual:tianshu-town/';
async function readDefinitions<T>(directory: string): Promise<T[]> {
  const paths = (await filesIn(join(root, directory))).filter((path) => path.endsWith('.yaml'));
  return Promise.all(paths.map(async (path) => parseContentFile({ path, text: await readFile(path, 'utf8') }).value as T));
}
async function readTowns(): Promise<TownRuntimeDefinition[]> {
  const paths = (await filesIn(join(root, 'content/town'))).filter((path) => path.endsWith('.json'));
  return Promise.all(paths.map(async (path) =>
    parseContentFile({ path, text: await readFile(path, 'utf8') }).value as TownRuntimeDefinition));
}

/** Build-time YAML and documentation projection: neither parser enters the browser. */
export function gameContentPlugin(options: { copyAssets?: boolean } = {}): Plugin {
  let townsPromise: Promise<TownRuntimeDefinition[]> | undefined;
  let assetManifest: ReturnType<typeof readAssetManifest> | undefined;
  let vfxRuntime: ReturnType<typeof publishVfxRuntime> | undefined;
  const towns = () => townsPromise ??= readTowns();
  const assets = async () => assetManifest ??= readAssetManifest(root,
    options.copyAssets !== false, await towns());
  const vfx = () => vfxRuntime ??= publishVfxRuntime(root, options.copyAssets !== false);
  return {
    name: 'tianshu-ui-content',
    resolveId(id) {
      if (id === virtualId || id === townIndexId || id.startsWith(townPrefix)) return '\0' + id;
      return null;
    },
    async load(id) {
      if (id === '\0' + townIndexId) {
        const definitions = await towns();
        return `export const townIds=${JSON.stringify(definitions.map((town) => town.sceneId))};
export async function loadTown(id){switch(id){${definitions.map((town) =>
          `case ${JSON.stringify(town.sceneId)}:return (await import(${JSON.stringify(townPrefix + town.sceneId)})).default;`
        ).join('')}default:return null;}}`;
      }
      if (id.startsWith('\0' + townPrefix)) {
        const sceneId = id.slice(('\0' + townPrefix).length);
        const definition = (await towns()).find((town) => town.sceneId === sceneId);
        if (!definition) throw new Error(`TOWN_VIRTUAL_UNKNOWN:${sceneId}`);
        return 'export default ' + JSON.stringify(definition) + ';';
      }
      if (id !== '\0' + virtualId) return null;
      const [common, catalog, npcs, skills, maps, meridianText, sectText, assetMap] = await Promise.all([
        readDefinitions<ItemDef>('content/common/items'), readDefinitions<ItemDef>('content/items'),
        readDefinitions<NpcDef>('content/chapters/ch01_tianlong/npcs'),
        readDefinitions<MartialArtDef>('content/common/skills'),
        readDefinitions<unknown>('content/world/ch01'),
        readFile(join(root, 'docs/design/15-meridians-and-acupoints.md'), 'utf8'),
        readFile(join(root, 'docs/design/17-sects-compendium.md'), 'utf8'),
        assets(),
      ]);
      const topology: { id: string; name: string; points: { id: string; name: string }[] }[] = [];
      const meridianCatalog = meridianText.slice(meridianText.indexOf('## 2.'), meridianText.indexOf('## 3.'));
      const acupointCatalog = meridianText.slice(meridianText.indexOf('## 3.'), meridianText.indexOf('## 4.'));
      for (const match of meridianCatalog.matchAll(/^\| `(mer_[a-z0-9_]+)` \| ([^|]+) \|/gm)) {
        if (!topology.some((entry) => entry.id === match[1]))
          topology.push({ id: match[1]!, name: match[2]!.trim(), points: [] });
      }
      let current: typeof topology[number] | undefined;
      for (const line of acupointCatalog.split('\n')) {
        const header = line.match(/^### 3\.\d+ .+`(mer_[a-z0-9_]+)`/);
        if (header) current = topology.find((entry) => entry.id === header[1]);
        const point = line.match(/^\| \d+ \| `(ap_[a-z0-9_]+)` \| ([^|]+) \|/);
        if (current && point) current.points.push({ id: point[1]!, name: point[2]!.trim() });
      }
      if (topology.length !== 20 || topology.reduce((n, meridian) => n + meridian.points.length, 0) !== 180 ||
          new Set(topology.flatMap((meridian) => meridian.points.map((point) => point.id))).size !== 180)
        throw new Error('UI_MERIDIAN_SOURCE_CHANGED');
      const factions: Record<string, string> = {};
      for (const match of sectText.matchAll(/^\| `(sect_[a-z0-9_]+)` \| ([一-鿿][^|]+) \|/gm))
        factions[match[1]!] ??= match[2]!.trim().replace(/\*|`/g, '');
      const worldMaps = maps.map(mapFromRegistration).map((map) => ({ ...map, sources: [],
        travel: { liPerHour: map.travel.liPerHour, stepLi: map.travel.stepLi, note: '' },
        grid: { width: map.grid.width, height: map.grid.height },
        nodes: map.nodes.map(({ coordinateNote: _coordinateNote, ...node }) => node),
        roads: map.roads.map(({ note: _note, ...road }) => road),
      }));
      return 'export default ' + JSON.stringify({ items: [...common, ...catalog], npcs, skills, topology,
        factions, assets: assetMap, worldMaps,
        townEventAnchors: [], townNpcWorld: { presences: [], relationships: [] },
        townNpcPlacements: [] }) + ';';
    },
    async buildStart() {
      await Promise.all([assets(), vfx()]);
    },
  };
}
