import type { OutputBundle, OutputChunk, Plugin } from 'vite';

export interface SizeGroupDocument {
  readonly schemaVersion: 'size-groups.v1';
  readonly groups: {
    readonly workerShell?: readonly string[];
    readonly sessionStatic?: readonly string[];
    readonly baseContent?: readonly string[];
    readonly coreExplore?: readonly string[];
    readonly coreShop?: readonly string[];
    readonly buildgenWorker?: readonly string[];
    readonly exploreUi?: readonly string[];
    readonly subsystems?: Readonly<Record<string, readonly string[]>>;
  };
  readonly moduleIds?: {
    readonly sessionStatic?: readonly string[];
    readonly renderStatic?: readonly string[];
  };
}

const sourceIds = {
  worker: '/apps/game/src/core-worker.ts',
  session: '/apps/game/src/runtime/session.ts',
  content: '\0virtual:tianshu-content',
  dialogueProjection: '/packages/core/src/entries/dialogue-projection.ts',
  dialogueCommand: '/packages/core/src/entries/dialogue-command.ts',
  regionRuntime: '/packages/core/src/entries/region-runtime.ts',
  regionCommand: '/packages/core/src/entries/region-command.ts',
  battle: '/apps/game/src/battle/runtime.ts',
  townIndex: '\0virtual:tianshu-towns',
  townCommand: '/packages/core/src/entries/town.ts',
  coreExplore: '/packages/core/src/entries/explore-command.ts',
  coreShop: '/packages/core/src/entries/shop-command.ts',
  buildgenWorker: '/packages/render/src/buildgen/worker/buildgen.worker.ts',
  render: '/packages/render/src/index.ts',
} as const;
const requiredGroups = ['workerShell', 'sessionStatic', 'baseContent'] as const;
const requiredSubsystems = ['dialogue', 'region', 'battle', 'town'] as const;

function hasSource(chunk: OutputChunk, suffix: string): boolean {
  return chunk.moduleIds.some((id) => id === suffix || id.endsWith(suffix));
}

function chunkForSource(chunks: readonly OutputChunk[], source: string): OutputChunk | undefined {
  return chunks.find((chunk) => hasSource(chunk, source));
}

function staticClosure(chunks: readonly OutputChunk[], root: OutputChunk): string[] {
  const byFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
  const seen = new Set<string>();
  const visit = (chunk: OutputChunk) => {
    if (seen.has(chunk.fileName)) return;
    seen.add(chunk.fileName);
    for (const file of chunk.imports) {
      const dependency = byFile.get(file);
      if (dependency) visit(dependency);
    }
  };
  visit(root);
  return [...seen].sort();
}

function groupClosure(chunks: readonly OutputChunk[], sources: readonly string[]): string[] {
  const files = new Set<string>();
  for (const source of sources) {
    const root = chunkForSource(chunks, source);
    if (root) for (const file of staticClosure(chunks, root)) files.add(file);
  }
  return [...files].sort();
}

function moduleIdsInClosure(chunks: readonly OutputChunk[], files: readonly string[]): string[] {
  const selected = new Set(files);
  return [
    ...new Set(
      chunks
        .filter((chunk) => selected.has(chunk.fileName))
        .flatMap((chunk) => chunk.moduleIds.map((id) => id.replaceAll('\\', '/'))),
    ),
  ].sort();
}

function isExploreUiModule(id: string): boolean {
  const normalized = id.replaceAll('\\', '/');
  return (
    normalized.includes('/apps/game/src/explore/') ||
    normalized.endsWith('/apps/game/src/pages/ExplorePage.vue') ||
    normalized.endsWith('/apps/game/src/pages/ShopLayer.vue') ||
    normalized.includes('/packages/ui/src/components/explore/')
  );
}

export function sizeGroupsPlugin(options: { target?: 'worker' | 'app' } = {}): Plugin {
  const target = options.target ?? 'worker';
  return {
    name: `tianshu-size-groups-${target}`,
    apply: 'build',
    generateBundle(_options, bundle: OutputBundle) {
      const chunks = Object.values(bundle).filter(
        (item): item is OutputChunk => item.type === 'chunk',
      );
      if (target === 'app') {
        const render = chunkForSource(chunks, sourceIds.render);
        const renderFiles = render ? staticClosure(chunks, render) : [];
        const exploreRoots = chunks.filter((chunk) => chunk.moduleIds.some(isExploreUiModule));
        const document: SizeGroupDocument = {
          schemaVersion: 'size-groups.v1',
          groups: { exploreUi: exploreRoots.map((chunk) => chunk.fileName).sort() },
          moduleIds: { renderStatic: moduleIdsInClosure(chunks, renderFiles) },
        };
        this.emitFile({
          type: 'asset',
          fileName: '.vite/app-size-groups.json',
          source: JSON.stringify(document, null, 2) + '\n',
        });
        return;
      }
      const worker = chunkForSource(chunks, sourceIds.worker);
      if (!worker) {
        const buildgenWorker = chunkForSource(chunks, sourceIds.buildgenWorker);
        if (!buildgenWorker) return;
        const document: SizeGroupDocument = {
          schemaVersion: 'size-groups.v1',
          groups: { buildgenWorker: staticClosure(chunks, buildgenWorker) },
        };
        this.emitFile({
          type: 'asset',
          fileName: '.vite/buildgen-worker-size-groups.json',
          source: JSON.stringify(document, null, 2) + '\n',
        });
        return;
      }
      const sessionStatic = groupClosure(chunks, [sourceIds.session]);
      const document: SizeGroupDocument = {
        schemaVersion: 'size-groups.v1',
        groups: {
          workerShell: staticClosure(chunks, worker),
          sessionStatic,
          baseContent: groupClosure(chunks, [sourceIds.content]),
          coreExplore: groupClosure(chunks, [sourceIds.coreExplore]),
          coreShop: groupClosure(chunks, [sourceIds.coreShop]),
          subsystems: {
            dialogue: groupClosure(chunks, [
              sourceIds.dialogueProjection,
              sourceIds.dialogueCommand,
            ]),
            region: groupClosure(chunks, [sourceIds.regionRuntime, sourceIds.regionCommand]),
            battle: groupClosure(chunks, [sourceIds.battle]),
            town: groupClosure(chunks, [sourceIds.townIndex, sourceIds.townCommand]),
          },
        },
        moduleIds: { sessionStatic: moduleIdsInClosure(chunks, sessionStatic) },
      };
      for (const name of requiredGroups)
        if (document.groups[name]!.length === 0) this.error(`SIZE_SESSION_GROUP_MISSING:${name}`);
      for (const name of requiredSubsystems)
        if (document.groups.subsystems![name]!.length === 0)
          this.error(`SIZE_SUBSYSTEM_GROUP_MISSING:${name}`);
      this.emitFile({
        type: 'asset',
        fileName: '.vite/size-groups.json',
        source: JSON.stringify(document, null, 2) + '\n',
      });
    },
  };
}
