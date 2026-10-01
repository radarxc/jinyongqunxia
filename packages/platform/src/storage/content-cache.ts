import type { ContentRow, TianshuDatabase } from './schema';
import { StorageError, StorageErrorCode, toStorageError } from './errors';
import { assertBytes, contentKey } from './records';
import type { ContentCache, ContentCacheEntry, ContentCacheKey, StorageClock } from './types';
import type { WriteQueue } from './queue';

function toEntry(row: ContentRow): ContentCacheEntry {
  return {
    worldId: row.worldId,
    kind: row.kind,
    version: row.version,
    byteLength: row.byteLength,
    cachedAt: row.cachedAt,
    lastAccessedAt: row.lastAccessedAt,
    data: new Uint8Array(row.data.slice(0)),
  };
}

export class IndexedDbContentCache implements ContentCache {
  constructor(
    private readonly db: TianshuDatabase,
    private readonly queue: WriteQueue,
    private readonly clock: StorageClock,
  ) {}

  async put(key: ContentCacheKey, data: Uint8Array): Promise<ContentCacheEntry> {
    const id = contentKey(key);
    assertBytes(data, 'Content cache data');
    const bytes = Uint8Array.from(data);
    return this.queue.run(async () => {
      try {
        return await this.db.transaction('rw', this.db.packs, async () => {
          const now = this.clock.now();
          const existing = await this.db.packs.get(id);
          const row: ContentRow = {
            key: id,
            worldId: key.worldId,
            kind: key.kind,
            version: key.version,
            byteLength: bytes.byteLength,
            cachedAt: existing?.cachedAt ?? now,
            lastAccessedAt: now,
            data: bytes.slice().buffer,
          };
          await this.db.packs.put(row);
          return toEntry(row);
        });
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  async get(key: ContentCacheKey): Promise<ContentCacheEntry | null> {
    const id = contentKey(key);
    return this.queue.run(async () => {
      try {
        return await this.db.transaction('rw', this.db.packs, async () => {
          const row = await this.db.packs.get(id);
          if (!row) return null;
          row.lastAccessedAt = this.clock.now();
          await this.db.packs.put(row);
          return toEntry(row);
        });
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  async list(): Promise<readonly ContentCacheEntry[]> {
    try {
      const rows = await this.db.packs.toArray();
      return rows
        .map(toEntry)
        .sort(
          (left, right) =>
            right.lastAccessedAt - left.lastAccessedAt ||
            left.worldId.localeCompare(right.worldId) ||
            left.kind.localeCompare(right.kind) ||
            left.version.localeCompare(right.version),
        );
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async delete(key: ContentCacheKey): Promise<void> {
    const id = contentKey(key);
    await this.queue.run(async () => {
      try {
        await this.db.transaction('rw', this.db.packs, () => this.db.packs.delete(id));
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  async evictTo(maxBytes: number): Promise<readonly ContentCacheKey[]> {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
      throw new StorageError(StorageErrorCode.InvalidArgument, 'Cache budget must be non-negative');
    }
    return this.queue.run(async () => {
      try {
        return await this.db.transaction('rw', this.db.packs, async () => {
          const rows = await this.db.packs.toArray();
          let total = rows.reduce((sum, row) => sum + row.byteLength, 0);
          const evicted: ContentCacheKey[] = [];
          rows.sort(
            (left, right) =>
              left.lastAccessedAt - right.lastAccessedAt ||
              left.cachedAt - right.cachedAt ||
              left.key.localeCompare(right.key),
          );
          for (const row of rows) {
            if (total <= maxBytes) break;
            await this.db.packs.delete(row.key);
            total -= row.byteLength;
            evicted.push({ worldId: row.worldId, kind: row.kind, version: row.version });
          }
          return evicted;
        });
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }
}
