import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { buildContent, splitContentEntry } from '@tianshu/data/build';
import { loadContent, parseContentFile } from '@tianshu/data/tooling';
import {
  type CharacterTemplate,
  type MartialArtDef,
  type MeridianTopologyCatalog,
  type NpcDef,
  type SectCatalog,
  type TownRuntimeDefinition,
} from '@tianshu/data/schemas';
import { filesIn, publishVfxRuntime, readAssetManifest } from './asset-manifest';
import { writeCopiedAssetManifest, type CopiedAssetReferenceMap } from './copied-assets';
import { buildOfflineClosures } from './offline-closure';
import {
  buildBattleModelCatalog,
  publishBattleModels,
  readBattleModelDirectories,
} from './battle-model-assets';

const root = resolve(import.meta.dirname, '../../..');
const virtualId = 'virtual:tianshu-content';
const chapterPrefix = 'virtual:tianshu-chapter/';
const townIndexId = 'virtual:tianshu-towns';
const townPrefix = 'virtual:tianshu-town/';
let siteContentPromise: ReturnType<typeof buildContent> | undefined;
let battleModelDirectories: ReturnType<typeof readBattleModelDirectories> | undefined;
async function readDefinitions<T>(directory: string): Promise<T[]> {
  const paths = (await filesIn(join(root, directory))).filter((path) => path.endsWith('.yaml'));
  return Promise.all(
    paths.map(
      async (path) => parseContentFile({ path, text: await readFile(path, 'utf8') }).value as T,
    ),
  );
}
async function readTowns(): Promise<TownRuntimeDefinition[]> {
  const paths = (await filesIn(join(root, 'content/town'))).filter((path) =>
    path.endsWith('.json'),
  );
  return Promise.all(
    paths.map(
      async (path) =>
        parseContentFile({ path, text: await readFile(path, 'utf8') })
          .value as TownRuntimeDefinition,
    ),
  );
}
async function readNpcs(): Promise<NpcDef[]> {
  const paths = (await filesIn(join(root, 'content/chapters'))).filter(
    (path) => path.endsWith('.yaml') && path.includes('/npcs/') && !path.includes('/_drafts/'),
  );
  return Promise.all(
    paths.map(
      async (path) =>
        parseContentFile({ path, text: await readFile(path, 'utf8') }).value as NpcDef,
    ),
  );
}
async function readWorldMapText(chapter: string): Promise<Readonly<Record<string, string>>> {
  if (chapter === 'ch00_yuenv') return {};
  const path = `content/world/${chapter.slice(0, 4)}/map.yaml`;
  const entry = parseContentFile({ path, text: await readFile(join(root, path), 'utf8') });
  return splitContentEntry(entry).text;
}
const chaptersByToken = {
  ch00: 'ch00_yuenv',
  ch01: 'ch01_tianlong',
  ch02: 'ch02_shediao',
  ch03: 'ch03_shendiao',
  ch04: 'ch04_yitian',
  ch05: 'ch05_xiaoao',
  ch06: 'ch06_xiake',
  ch07: 'ch07_bixue',
  ch08: 'ch08_luding',
  ch09: 'ch09_liancheng',
  ch10: 'ch10_baima',
  ch11: 'ch11_yuanyang',
  ch12: 'ch12_shujian',
  ch13: 'ch13_feihu',
  ch14: 'ch14_xueshan',
} as const;
const chapterIds = Object.values(chaptersByToken);
const chapterIdFromToken = (token: string): string | undefined =>
  chaptersByToken[token as keyof typeof chaptersByToken];
export function battleModelLazyChunk(id: string): string | undefined {
  return id.includes('/packages/render/src/battle/model-stage.') ||
    id.includes('/packages/render/src/gltf/load.') ||
    id.includes('/packages/render/src/gltf/materials.') ||
    id.includes('/three/examples/jsm/loaders/GLTFLoader.js') ||
    id.includes('/three/examples/jsm/utils/SkeletonUtils.js') ||
    id.includes('/three/examples/jsm/utils/BufferGeometryUtils.js')
    ? 'battle-model3d'
    : undefined;
}
export function configureBattleModelChunks(outputOptions: {
  manualChunks?: (
    id: string,
    context: { getModuleInfo: (id: string) => unknown },
  ) => string | null | undefined;
  codeSplitting?: unknown;
}): typeof outputOptions {
  const configured = outputOptions.manualChunks;
  if (typeof configured !== 'function') return outputOptions;
  // Rolldown's Rollup-compatible manualChunks recursively captures dependencies. That would
  // pull Three core into this lazy group and make the ordinary render chunk import it eagerly.
  delete outputOptions.manualChunks;
  outputOptions.codeSplitting = {
    groups: [
      {
        name: (id: string, context: { getModuleInfo: (id: string) => unknown }) =>
          battleModelLazyChunk(id) ?? configured(id, { getModuleInfo: context.getModuleInfo }),
        includeDependenciesRecursively: false,
      },
    ],
  };
  return outputOptions;
}
function chapterForAsset(
  id: string,
  value: { portrait?: string; map?: string },
): string | undefined {
  const path = value.portrait ?? value.map ?? '';
  const token =
    path.match(/(?:^|[/_])(ch(?:0[0-9]|1[0-4]))(?:[/_]|$)/u)?.[1] ??
    id.match(/__(ch(?:0[0-9]|1[0-4]))(?:_|$)/u)?.[1];
  return token ? chapterIdFromToken(token) : undefined;
}
function chapterAssetGroups(
  assetMap: Awaited<ReturnType<typeof readAssetManifest>>,
  items: readonly { id: string; chapters: 'any' | readonly string[] }[],
  npcs: readonly NpcDef[],
) {
  const shared: typeof assetMap = {};
  const chapters: Record<string, typeof assetMap> = Object.fromEntries(
    chapterIds.map((chapter) => [chapter, {}]),
  );
  const itemScopes = new Map(items.map((item) => [item.id, item.chapters]));
  const npcScopes = new Map(
    npcs.map((npc) => [
      npc.id,
      [...new Set(npc.appearances.map((appearance) => appearance.chapterId))],
    ]),
  );
  for (const [id, value] of Object.entries(assetMap)) {
    const inferred = chapterForAsset(id, value);
    const scopes = value.icon
      ? (itemScopes.get(id) ?? 'any')
      : (npcScopes.get(id) ?? (inferred ? [inferred] : undefined));
    if (scopes === undefined || scopes === 'any') {
      shared[id] = value;
      continue;
    }
    for (const chapter of scopes) (chapters[chapter] ??= {})[id] = value;
  }
  return { shared, chapters };
}

async function readCatalogs(): Promise<{
  readonly topology: MeridianTopologyCatalog['meridians'];
  readonly factions: Readonly<Record<string, string>>;
}> {
  const paths = (
    await Promise.all([
      filesIn(join(root, 'content/common/meridians')),
      filesIn(join(root, 'content/common/sects')),
    ])
  )
    .flat()
    .filter((path) => path.endsWith('.yaml'));
  const files = await Promise.all(
    paths.map(async (path) => ({
      path,
      text: await readFile(path, 'utf8'),
    })),
  );
  const registry = loadContent(files);
  const meridians = registry.events.filter(
    (entry): entry is MeridianTopologyCatalog =>
      entry.event === 'content/meridianTopologyCatalog' && 'group' in entry,
  );
  const sects = registry.events.filter(
    (entry): entry is SectCatalog => entry.event === 'content/sectCatalog' && 'group' in entry,
  );
  const byGroup = <T extends { readonly group: string }>(
    values: readonly T[],
    group: string,
  ): T => {
    const found = values.find((entry) => entry.group === group);
    if (found === undefined) throw new TypeError(`CONTENT_CATALOG_GROUP:${group}`);
    return found;
  };
  return {
    topology: ['regular12', 'extra8'].flatMap((group) => byGroup(meridians, group).meridians),
    factions: Object.fromEntries(
      ['temples', 'estates', 'associations', 'gulong']
        .flatMap((group) => byGroup(sects, group).sects)
        .map((sect) => [sect.id, sect.name]),
    ),
  };
}

/** Build-time content projection: YAML parsers never enter the browser. */
export function gameContentPlugin(options: { copyAssets?: boolean } = {}): Plugin {
  const copied = new Set<string>();
  const assetReferences: CopiedAssetReferenceMap = new Map();
  let townsPromise: Promise<TownRuntimeDefinition[]> | undefined;
  let assetManifest: ReturnType<typeof readAssetManifest> | undefined;
  let assetGroups: Promise<ReturnType<typeof chapterAssetGroups>> | undefined;
  let modelCatalogs:
    Promise<Record<string, ReturnType<typeof buildBattleModelCatalog>>> | undefined;
  let vfxRuntime: ReturnType<typeof publishVfxRuntime> | undefined;
  const towns = () => (townsPromise ??= readTowns());
  const assets = async () =>
    (assetManifest ??= readAssetManifest(
      root,
      options.copyAssets !== false,
      await towns(),
      copied,
      assetReferences,
    ));
  const groupedAssets = () =>
    (assetGroups ??= Promise.all([
      assets(),
      readDefinitions<{ id: string; chapters: 'any' | readonly string[] }>('content/items'),
      readNpcs(),
    ]).then(([manifest, items, npcs]) => chapterAssetGroups(manifest, items, npcs)));
  const models = () =>
    (modelCatalogs ??= Promise.all([
      (battleModelDirectories ??= readBattleModelDirectories(root)),
      readNpcs(),
      readDefinitions<CharacterTemplate>('content/chapters/ch00_yuenv/roles/templates'),
    ]).then(([directories, npcs, templates]) =>
      Object.fromEntries(
        chapterIds.map((chapter) => [
          chapter,
          buildBattleModelCatalog(
            directories,
            chapter,
            npcs.flatMap((npc) =>
              npc.appearances.map((appearance) => ({
                id: npc.id,
                chapterId: appearance.chapterId,
                species: npc.identity.species,
                gender: npc.identity.gender,
                combatEligible: appearance.combatEligible,
              })),
            ),
            templates,
          ),
        ]),
      ),
    ));
  const vfx = () =>
    (vfxRuntime ??= publishVfxRuntime(root, options.copyAssets !== false, copied, assetReferences));
  const content = () =>
    (siteContentPromise ??= buildContent({
      rootDir: root,
      outputDir: 'apps/game/public/content',
      cacheDir: '.cache/content-build/vite',
    }));
  return {
    name: 'tianshu-ui-content',
    outputOptions(outputOptions) {
      return configureBattleModelChunks(outputOptions);
    },
    resolveId(id) {
      if (
        id === virtualId ||
        id.startsWith(chapterPrefix) ||
        id === townIndexId ||
        id.startsWith(townPrefix)
      )
        return '\0' + id;
      return null;
    },
    async load(id) {
      if (id.startsWith('\0' + chapterPrefix)) {
        const chapter = id.slice(('\0' + chapterPrefix).length);
        const groups = await groupedAssets();
        const chapterAssets =
          chapter === 'shared' || chapter === '__shared__'
            ? groups.shared
            : groups.chapters[chapter];
        if (!chapterAssets) throw new Error(`CHAPTER_ASSET_VIRTUAL_UNKNOWN:${chapter}`);
        const mapText =
          chapter === 'shared' || chapter === '__shared__' ? {} : await readWorldMapText(chapter);
        const catalog =
          chapter === 'shared' || chapter === '__shared__' ? undefined : (await models())[chapter];
        return (
          'export default ' +
          JSON.stringify({
            assets: chapterAssets,
            mapText,
            ...(catalog ? { battleModels: catalog } : {}),
          }) +
          ';'
        );
      }
      if (id === '\0' + townIndexId) {
        const definitions = await towns();
        return `export const townIds=${JSON.stringify(definitions.map((town) => town.sceneId))};
export async function loadTown(id){switch(id){${definitions
          .map(
            (town) =>
              `case ${JSON.stringify(town.sceneId)}:return (await import(${JSON.stringify(townPrefix + town.sceneId)})).default;`,
          )
          .join('')}default:return null;}}`;
      }
      if (id.startsWith('\0' + townPrefix)) {
        const sceneId = id.slice(('\0' + townPrefix).length);
        const definition = (await towns()).find((town) => town.sceneId === sceneId);
        if (!definition) throw new Error(`TOWN_VIRTUAL_UNKNOWN:${sceneId}`);
        return 'export default ' + JSON.stringify(definition) + ';';
      }
      if (id !== '\0' + virtualId) return null;
      const [skills, catalogs] = await Promise.all([
        readDefinitions<MartialArtDef>('content/common/skills'),
        readCatalogs(),
      ]);
      const base = JSON.stringify({
        npcs: [],
        skills,
        topology: catalogs.topology,
        factions: catalogs.factions,
        townEventAnchors: [],
        townNpcWorld: { presences: [], relationships: [] },
        townNpcPlacements: [],
      });
      const loaders = chapterIds
        .map(
          (chapter) =>
            `case ${JSON.stringify(chapter)}:return (await import(${JSON.stringify(
              chapterPrefix + chapter,
            )})).default;`,
        )
        .join('');
      return (
        `export default ${base};export async function loadChapterAssets(id){switch(id){${loaders}` +
        `case "__shared__":return (await import(${JSON.stringify(chapterPrefix + 'shared')})).default;` +
        `default:throw new Error("CHAPTER_ASSET_VIRTUAL_UNKNOWN:"+id);}}`
      );
    },
    async buildStart() {
      const built = await content();
      const failed = built.diagnostics.find((entry) => entry.severity === 'error');
      if (failed) throw new Error(`${failed.code}:${failed.message}`);
      const [, , catalogs] = await Promise.all([groupedAssets(), vfx(), models()]);
      await publishBattleModels(
        root,
        options.copyAssets !== false,
        catalogs,
        copied,
        assetReferences,
      );
    },
    async closeBundle() {
      if (options.copyAssets !== false) {
        await writeCopiedAssetManifest(root, [...copied], undefined, assetReferences);
        await buildOfflineClosures({
          publicDir: resolve(root, 'apps/game/public'),
          outDir: resolve(root, 'apps/game/dist'),
          warn: (message) => console.warn(message),
        });
      }
    },
  };
}
