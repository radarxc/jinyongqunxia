export type OfflineFileKind = 'manifest' | 'content' | 'asset' | 'vfx';

export interface OfflineFile {
  readonly url: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly kind: OfflineFileKind;
}

export interface OfflineClosureTotals {
  readonly files: number;
  readonly bytes: number;
  readonly enterBytes: number;
  readonly byKind: Readonly<Record<OfflineFileKind, number>>;
}

export interface OfflineClosure {
  readonly format: 1;
  readonly chapter: string;
  readonly releaseHash: string;
  readonly files: readonly OfflineFile[];
  readonly totals: OfflineClosureTotals;
}

export type DownloadPhase =
  | 'checking'
  | 'persisting'
  | 'downloading'
  | 'committing'
  | 'complete';

export interface DownloadProgress {
  readonly phase: DownloadPhase;
  readonly verifiedBytes: number;
  readonly totalBytes: number;
  readonly completedFiles: number;
  readonly totalFiles: number;
  readonly bytesPerSecond: number | null;
  readonly etaSeconds: number | null;
  readonly activeUrl?: string;
}

export interface OfflineDownloadResult {
  readonly closure: OfflineClosure;
  readonly chapter: string;
  readonly releaseHash: string;
  readonly downloadedFiles: number;
  readonly reusedFiles: number;
  readonly verifiedBytes: number;
  readonly persisted: boolean | null;
}

export interface IntegrityResult {
  readonly complete: boolean;
  readonly checkedAt: number;
  readonly missingFiles: readonly OfflineFile[];
  readonly missingBytes: number;
  readonly validBytes: number;
}

export interface InstalledClosureRecord {
  readonly format: 1;
  readonly closure: OfflineClosure;
  readonly installedAt: number;
  readonly lastVerifiedAt: number;
  readonly state: 'active' | 'prefetched' | 'evictable';
  readonly pinned: boolean;
  readonly pendingPublication?: boolean;
}

export interface OfflineDownloadIntent {
  readonly format: 1;
  readonly closure: OfflineClosure;
  readonly startedAt: number;
  readonly intent: 'download' | 'prefetch';
}

export interface OfflineDownloadOptions {
  readonly signal?: AbortSignal;
  readonly onProgress?: (progress: DownloadProgress) => void;
  readonly refreshClosure?: () => Promise<OfflineClosure>;
  readonly cacheStorage?: CacheStorage;
  readonly fetch?: typeof globalThis.fetch;
  readonly storage?: Pick<StorageManager, 'estimate' | 'persist'> | null;
  readonly now?: () => number;
  readonly sleep?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
  readonly random?: () => number;
  readonly onQuotaPressure?: (reason: 'estimate' | 'write', releaseHash: string) => Promise<void>;
  readonly state?: InstalledClosureRecord['state'];
  readonly pinned?: boolean;
  readonly intent?: 'download' | 'prefetch';
  readonly deferPublish?: boolean;
}
