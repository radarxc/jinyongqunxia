import type { TianshuDatabase } from './schema';
import { StorageError, StorageErrorCode, toStorageError } from './errors';
import { cloneSetting } from './records';
import type { SettingsStore, SettingValue } from './types';
import type { WriteQueue } from './queue';

function assertKey(key: string): void {
  if (!key || key.length > 128) {
    throw new StorageError(StorageErrorCode.InvalidArgument, 'Setting key must be 1-128 chars');
  }
}

function assertSetting(value: SettingValue): void {
  try {
    assertJsonValue(value, new Set<object>(), 0);
    if (new TextEncoder().encode(JSON.stringify(value)).byteLength > 64 * 1024) {
      throw new Error('too large');
    }
  } catch (error) {
    throw new StorageError(
      StorageErrorCode.InvalidArgument,
      'Setting value must be JSON-like',
      error,
    );
  }
}

function assertJsonValue(value: unknown, seen: Set<object>, depth: number): void {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite number');
    return;
  }
  if (typeof value !== 'object' || depth >= 32 || seen.has(value)) throw new Error('invalid value');
  const prototype = Object.getPrototypeOf(value) as unknown;
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new Error('non-plain object');
  }
  seen.add(value);
  for (const entry of Array.isArray(value) ? value : Object.values(value)) {
    assertJsonValue(entry, seen, depth + 1);
  }
  seen.delete(value);
}

export class IndexedDbSettingsStore implements SettingsStore {
  constructor(
    private readonly db: TianshuDatabase,
    private readonly queue: WriteQueue,
  ) {}

  async get<T extends SettingValue>(key: string): Promise<T | null> {
    assertKey(key);
    try {
      const row = await this.db.settings.get(key);
      return row ? (cloneSetting(row.value as SettingValue) as T) : null;
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async set(key: string, value: SettingValue): Promise<void> {
    assertKey(key);
    assertSetting(value);
    await this.queue.run(async () => {
      try {
        await this.db.transaction('rw', this.db.settings, () =>
          this.db.settings.put({ key, value: cloneSetting(value) }),
        );
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  async delete(key: string): Promise<void> {
    assertKey(key);
    await this.queue.run(async () => {
      try {
        await this.db.transaction('rw', this.db.settings, () => this.db.settings.delete(key));
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  async entries(): Promise<Readonly<Record<string, SettingValue>>> {
    try {
      const rows = await this.db.settings.toArray();
      return Object.fromEntries(
        rows
          .sort((left, right) => left.key.localeCompare(right.key))
          .map((row) => [row.key, cloneSetting(row.value as SettingValue)]),
      );
    } catch (error) {
      throw toStorageError(error);
    }
  }
}
