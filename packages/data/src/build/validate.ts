import type { ContentRegistry } from '../content-index';
import { loadContent } from '../content-index';
import type { ContentFile } from '../content-registry';
import { discoverContent } from './discover';
import { parseInkMeta } from './ink';
import { parseInkSources } from './pipeline';
import { validateRegionBindingMaps } from './region-bindings';
import { compileTiledMap, validateCompiledTiledMaps } from './tiled';
import type { Diagnostic } from './types';

export interface ContentValidationResult {
  readonly registry: ContentRegistry;
  readonly fileCount: number;
  readonly objectCount: number;
  readonly inkStoryCount: number;
  readonly mapCount: number;
  readonly diagnostics: readonly Diagnostic[];
}

export async function validateContent(rootDir: string): Promise<ContentValidationResult> {
  const sources = await discoverContent(rootDir);
  const validatedSources = sources.filter(
    (source) =>
      source.kind === 'content' ||
      source.kind === 'ink' ||
      source.kind === 'inkmeta' ||
      source.kind === 'tiled',
  );
  if (validatedSources.length === 0)
    throw new TypeError('CONTENT_EMPTY: no supported production content');

  const content = sources
    .filter((source) => source.kind === 'content')
    .map(({ path, text }): ContentFile => ({ path, text }));
  const inkPaths = new Set(
    sources.filter((source) => source.kind === 'ink').map((source) => source.path),
  );
  for (const source of sources.filter((entry) => entry.kind === 'inkmeta')) {
    const inkPath = source.path.replace(/\.inkmeta\.yaml$/u, '.ink');
    if (!inkPaths.has(inkPath)) parseInkMeta(source.text, source.path);
  }
  const inks = await parseInkSources(sources);
  const registry = loadContent(content, { inks });
  const mapSources = sources
    .filter((source) => source.kind === 'tiled')
    .map(({ path, absolutePath, text }) => ({ path, absolutePath, text }));
  const maps = [];
  for (const source of mapSources) maps.push(await compileTiledMap(source));
  const diagnostics = [
    ...inks.flatMap((ink) => ink.diagnostics),
    ...maps.flatMap((map) => map.diagnostics),
    ...validateCompiledTiledMaps(maps),
    ...validateRegionBindingMaps(maps, registry),
  ];

  return {
    registry,
    fileCount: validatedSources.length,
    objectCount: registry.entries.length,
    inkStoryCount: inks.length,
    mapCount: mapSources.length,
    diagnostics,
  };
}
