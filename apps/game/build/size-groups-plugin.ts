import type { OutputBundle, OutputChunk, Plugin } from 'vite';

export interface SizeGroupDocument {
  readonly schemaVersion: 'size-groups.v1';
  readonly groups: {
    readonly workerShell: readonly string[];
    readonly sessionStatic: readonly string[];
    readonly baseContent: readonly string[];
    readonly subsystems: Readonly<Record<string, readonly string[]>>;
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

export function sizeGroupsPlugin(): Plugin {
  return {
    name: 'tianshu-size-groups',
    apply: 'build',
    generateBundle(_options, bundle: OutputBundle) {
      const chunks = Object.values(bundle).filter(
        (item): item is OutputChunk => item.type === 'chunk',
      );
      const worker = chunkForSource(chunks, sourceIds.worker);
      if (!worker) this.error('SIZE_SESSION_GROUP_MISSING:workerShell');
      const document: SizeGroupDocument = {
        schemaVersion: 'size-groups.v1',
        groups: {
          workerShell: staticClosure(chunks, worker),
          sessionStatic: groupClosure(chunks, [sourceIds.session]),
          baseContent: groupClosure(chunks, [sourceIds.content]),
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
      };
      for (const name of requiredGroups)
        if (document.groups[name].length === 0) this.error(`SIZE_SESSION_GROUP_MISSING:${name}`);
      for (const name of requiredSubsystems)
        if (document.groups.subsystems[name]!.length === 0)
          this.error(`SIZE_SUBSYSTEM_GROUP_MISSING:${name}`);
      this.emitFile({
        type: 'asset',
        fileName: '.vite/size-groups.json',
        source: JSON.stringify(document, null, 2) + '\n',
      });
    },
  };
}
