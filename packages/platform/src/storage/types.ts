export type SaveSlotId = string;
export type Sha256Hex = string;

export type SummaryValue = boolean | null | number | string;
export type SaveSummary = Readonly<Record<string, SummaryValue>>;

export interface SaveMetadata {
  readonly worldId: string;
  readonly gameTime: number;
  readonly version: string;
  readonly schemaVersion: number;
  readonly hash: Sha256Hex;
  readonly summary: SaveSummary;
}

export interface SaveSlotSummary {
  readonly slot: SaveSlotId;
  readonly generation: number;
  readonly savedAt: number;
  readonly byteLength: number;
  readonly meta: SaveMetadata;
}

export interface SaveRecovery {
  readonly recoveredGeneration: number;
  readonly failedGenerations: readonly number[];
}

export interface StoredSave extends SaveSlotSummary {
  readonly snapshot: Uint8Array;
  readonly recovery?: SaveRecovery;
}

export interface LoadSaveOptions {
  readonly generation?: number;
  readonly validate?: (save: StoredSave) => void | Promise<void>;
}

export interface AutosaveOptions {
  readonly force?: boolean;
  readonly trigger?: string;
}

export interface AutosaveResult {
  readonly status: 'saved' | 'throttled';
  readonly slot: SaveSlotId;
  readonly saved?: SaveSlotSummary;
}

export interface SavePayload {
  readonly snapshot: Uint8Array;
  readonly meta: SaveMetadata;
}

export interface SaveStore {
  listSlots(): Promise<readonly SaveSlotSummary[]>;
  listHistory(slot: SaveSlotId): Promise<readonly SaveSlotSummary[]>;
  save(slot: SaveSlotId, snapshot: Uint8Array, meta: SaveMetadata): Promise<SaveSlotSummary>;
  load(slot: SaveSlotId, options?: LoadSaveOptions): Promise<StoredSave | null>;
  delete(slot: SaveSlotId): Promise<void>;
  autosave(
    snapshot: Uint8Array,
    meta: SaveMetadata,
    options?: AutosaveOptions,
  ): Promise<AutosaveResult>;
  autosavePrepared(
    prepare: (slot: SaveSlotId) => Promise<SavePayload>,
    options?: AutosaveOptions,
  ): Promise<AutosaveResult>;
}

export type PersistenceStatus = 'not-requested' | 'granted' | 'denied' | 'unsupported';

export interface StoragePersistence {
  status(): Promise<PersistenceStatus>;
}

export type PersistedStateScope = 'long-term' | 'chapter';

export interface WorldStateChunk {
  readonly sequence: number;
  readonly updatedAt: number;
  readonly hash: Sha256Hex;
  readonly payload: Uint8Array;
}

export interface LoadedWorldState {
  readonly snapshot: WorldStateChunk | null;
  readonly deltas: readonly WorldStateChunk[];
}

export interface WorldStateStore {
  saveSnapshot(
    scope: PersistedStateScope,
    worldId: string,
    sequence: number,
    snapshot: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<WorldStateChunk>;
  appendDelta(
    scope: PersistedStateScope,
    worldId: string,
    sequence: number,
    delta: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<WorldStateChunk>;
  load(scope: PersistedStateScope, worldId: string): Promise<LoadedWorldState>;
  clear(scope: PersistedStateScope, worldId: string): Promise<void>;
}

export type ContentCacheKind = 'asset-manifest' | 'world-pack';

export interface ContentCacheKey {
  readonly worldId: string;
  readonly kind: ContentCacheKind;
  readonly version: string;
}

export interface ContentCacheEntry extends ContentCacheKey {
  readonly byteLength: number;
  readonly cachedAt: number;
  readonly lastAccessedAt: number;
  readonly data: Uint8Array;
}

export interface ContentCache {
  put(key: ContentCacheKey, data: Uint8Array): Promise<ContentCacheEntry>;
  get(key: ContentCacheKey): Promise<ContentCacheEntry | null>;
  list(): Promise<readonly ContentCacheEntry[]>;
  delete(key: ContentCacheKey): Promise<void>;
  evictTo(maxBytes: number): Promise<readonly ContentCacheKey[]>;
}

export type SettingValue =
  | boolean
  | null
  | number
  | string
  | readonly SettingValue[]
  | {
      readonly [key: string]: SettingValue;
    };

export interface SettingsStore {
  get<T extends SettingValue>(key: string): Promise<T | null>;
  set(key: string, value: SettingValue): Promise<void>;
  delete(key: string): Promise<void>;
  entries(): Promise<Readonly<Record<string, SettingValue>>>;
}

export interface Migration {
  readonly from: number;
  readonly to: number;
  readonly description: string;
}

export interface StorageExport {
  readonly format: 'tianshu-storage';
  readonly schemaVersion: number;
  readonly exportedAt: number;
  readonly payload: Uint8Array;
  readonly hash: Sha256Hex;
}

export interface StorageImportResult {
  readonly saves: number;
  readonly worldSnapshots: number;
  readonly worldDeltas: number;
  readonly contentEntries: number;
  readonly settings: number;
}

export interface StorageTransfer {
  export(): Promise<StorageExport>;
  import(archive: StorageExport): Promise<StorageImportResult>;
}

export interface TianshuStorage {
  readonly schemaVersion: number;
  readonly saves: SaveStore;
  readonly worldState: WorldStateStore;
  readonly content: ContentCache;
  readonly settings: SettingsStore;
  readonly migrations: readonly Migration[];
  readonly transfer: StorageTransfer;
  readonly persistence: StoragePersistence;
  export(): Promise<StorageExport>;
  import(archive: StorageExport): Promise<StorageImportResult>;
  close(): Promise<void>;
  deleteDatabase(): Promise<void>;
}

export interface StorageClock {
  now(): number;
}

export interface CreateStorageOptions {
  readonly databaseName?: string;
  readonly indexedDB?: IDBFactory;
  readonly IDBKeyRange?: typeof IDBKeyRange;
  readonly clock?: StorageClock;
  readonly autosaveThrottleMs?: number;
  readonly storageManager?: Pick<StorageManager, 'persist' | 'persisted'> | null;
  readonly saveCommitHook?: (slot: SaveSlotId, generation: number) => void | Promise<void>;
}
