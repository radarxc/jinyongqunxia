import type { JsonValue } from '@tianshu/shared';
import type { ChapterPackManifest } from '../schemas';

export interface SourceSpan {
  readonly file: string; readonly line: number; readonly column: number;
  readonly endLine: number; readonly endColumn: number;
}
export interface Diagnostic {
  readonly code: string; readonly severity: 'error' | 'warning' | 'info';
  readonly message: string; readonly primary: SourceSpan;
}
export interface BuildLeaf {
  readonly logicalName: string; readonly kind: 'rules' | 'text';
  readonly locale?: string; readonly region?: string;
  readonly load: 'resident' | 'chapter' | 'region'; readonly value: JsonValue;
}
export interface EmittedLeaf extends BuildLeaf {
  readonly bytes: Uint8Array; readonly gzipBytes: number; readonly sha256: string;
}
export interface ChapterBuild {
  readonly chapter: string; readonly manifest: ChapterPackManifest;
  readonly leaves: readonly EmittedLeaf[];
}
export interface ContentBuildResult {
  readonly chapters: readonly ChapterBuild[]; readonly diagnostics: readonly Diagnostic[];
  readonly outputDir: string; readonly durationMs: number; readonly entryCount: number;
}
export interface BuildOptions {
  readonly rootDir?: string; readonly outputDir?: string; readonly cacheDir?: string;
  readonly chapter?: string; readonly locale?: string; readonly emitRefs?: boolean;
  readonly write?: boolean; readonly maxLeafBytes?: number;
}
