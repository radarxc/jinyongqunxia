import { IndexedDbContentCache } from './content-cache';
import { StorageError, StorageErrorCode, toStorageError } from './errors';
import { WriteQueue } from './queue';
import { IndexedDbSaveStore } from './save-store';
import { MIGRATIONS, STORAGE_SCHEMA_VERSION, TianshuDatabase } from './schema';
import { IndexedDbSettingsStore } from './settings-store';
import { IndexedDbStorageTransfer } from './transfer';
import type { CreateStorageOptions, StorageClock, TianshuStorage } from './types';
import { IndexedDbWorldStateStore } from './world-state-store';

export * from './errors';
export * from './hash';
export type * from './types';

export const DEFAULT_DATABASE_NAME = 'tianshu';
export const DEFAULT_AUTOSAVE_THROTTLE_MS = 30_000;

const systemClock: StorageClock = { now: () => Date.now() };

function resolveFactory(options: CreateStorageOptions): IDBFactory {
  const factory = options.indexedDB ?? globalThis.indexedDB;
  if (!factory) {
    throw new StorageError(StorageErrorCode.Unavailable, 'IndexedDB is unavailable');
  }
  return factory;
}

function resolveKeyRange(options: CreateStorageOptions): typeof IDBKeyRange {
  const keyRange = options.IDBKeyRange ?? globalThis.IDBKeyRange;
  if (!keyRange) {
    throw new StorageError(StorageErrorCode.Unavailable, 'IDBKeyRange is unavailable');
  }
  return keyRange;
}

export async function createIndexedDbStorage(
  options: CreateStorageOptions = {},
): Promise<TianshuStorage> {
  const databaseName = options.databaseName ?? DEFAULT_DATABASE_NAME;
  if (!databaseName) {
    throw new StorageError(StorageErrorCode.InvalidArgument, 'Database name is required');
  }
  const throttleMs = options.autosaveThrottleMs ?? DEFAULT_AUTOSAVE_THROTTLE_MS;
  if (!Number.isSafeInteger(throttleMs) || throttleMs < 0) {
    throw new StorageError(
      StorageErrorCode.InvalidArgument,
      'Autosave throttle must be a non-negative integer',
    );
  }

  const db = new TianshuDatabase(databaseName, resolveFactory(options), resolveKeyRange(options));
  try {
    await db.open();
  } catch (error) {
    throw toStorageError(error, StorageErrorCode.MigrationFailed);
  }
  const clock = options.clock ?? systemClock;
  const queue = new WriteQueue();
  const transfer = new IndexedDbStorageTransfer(db, queue, clock);

  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    saves: new IndexedDbSaveStore(db, queue, clock, throttleMs),
    worldState: new IndexedDbWorldStateStore(db, queue, clock),
    content: new IndexedDbContentCache(db, queue, clock),
    settings: new IndexedDbSettingsStore(db, queue),
    migrations: MIGRATIONS,
    transfer,
    export: () => transfer.export(),
    import: (archive) => transfer.import(archive),
    close: async () => db.close(),
    deleteDatabase: async () => {
      try {
        await queue.run(() => db.delete());
      } catch (error) {
        throw toStorageError(error);
      }
    },
  };
}
