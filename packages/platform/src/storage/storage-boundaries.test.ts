import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import { ArchiveEntryKind, decodeArchive, encodeArchive } from './archive-codec';
import {
  createIndexedDbStorage,
  sha256Hex,
  StorageError,
  StorageErrorCode,
  toStorageError,
  type StorageExport,
  type TianshuStorage,
} from './index';

let serial = 0;
const opened: TianshuStorage[] = [];

async function makeStorage(): Promise<TianshuStorage> {
  const storage = await createIndexedDbStorage({
    databaseName: `tianshu-boundaries-${serial++}`,
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  });
  opened.push(storage);
  return storage;
}

afterEach(async () => {
  await Promise.all(opened.splice(0).map((storage) => storage.deleteDatabase()));
});

describe('storage boundary validation', () => {
  it('rejects unavailable IndexedDB dependencies and invalid options', async () => {
    await expect(createIndexedDbStorage()).rejects.toMatchObject({
      code: StorageErrorCode.Unavailable,
    });
    await expect(createIndexedDbStorage({ indexedDB: new IDBFactory() })).rejects.toMatchObject({
      code: StorageErrorCode.Unavailable,
    });
    await expect(
      createIndexedDbStorage({ databaseName: '', indexedDB: new IDBFactory(), IDBKeyRange }),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
    await expect(
      createIndexedDbStorage({
        databaseName: 'invalid-throttle',
        indexedDB: new IDBFactory(),
        IDBKeyRange,
        autosaveThrottleMs: -1,
      }),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
  });

  it('rejects empty bytes, malformed metadata, and bad world sequences', async () => {
    const storage = await makeStorage();
    const bytes = Uint8Array.from([1]);
    const hash = await sha256Hex(bytes);
    const meta = {
      worldId: 'ch01',
      gameTime: 1,
      version: 'v1',
      schemaVersion: 2,
      hash,
      summary: {},
    };
    await expect(storage.saves.save('save_quick', new Uint8Array(), meta)).rejects.toMatchObject({
      code: StorageErrorCode.InvalidArgument,
    });
    await expect(
      storage.saves.save('save_quick', bytes, { ...meta, schemaVersion: 0 }),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
    await expect(
      storage.worldState.appendDelta('chapter', 'ch01', -1, bytes),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
    await expect(storage.worldState.appendDelta('chapter', '', 1, bytes)).rejects.toMatchObject({
      code: StorageErrorCode.InvalidArgument,
    });
    await expect(
      storage.saves.save('save_manual_01', new Uint8Array(32 * 1024 * 1024 + 1), meta),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
  });

  it('rejects invalid cache and settings inputs without mutating data', async () => {
    const storage = await makeStorage();
    await expect(
      storage.content.put({ worldId: '', kind: 'world-pack', version: 'v1' }, Uint8Array.of(1)),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
    await expect(
      storage.content.put(
        { worldId: 'ch01', kind: 'world-pack', version: 'bad\0version' },
        Uint8Array.of(1),
      ),
    ).rejects.toMatchObject({ code: StorageErrorCode.InvalidArgument });
    await expect(storage.content.evictTo(-1)).rejects.toMatchObject({
      code: StorageErrorCode.InvalidArgument,
    });
    await expect(storage.settings.set('', true)).rejects.toMatchObject({
      code: StorageErrorCode.InvalidArgument,
    });
    await expect(storage.settings.set('bad', (() => undefined) as never)).rejects.toMatchObject({
      code: StorageErrorCode.InvalidArgument,
    });
    await expect(storage.settings.entries()).resolves.toEqual({});
  });
});

describe('archive boundaries', () => {
  it('rejects invalid format, future schema, and valid-hash malformed payloads', async () => {
    const storage = await makeStorage();
    const empty = await storage.export();
    await expect(storage.import({ ...empty, format: 'other' as never })).rejects.toMatchObject({
      code: StorageErrorCode.ImportFailed,
    });
    await expect(storage.import({ ...empty, schemaVersion: 99 })).rejects.toMatchObject({
      code: StorageErrorCode.UnsupportedVersion,
    });
    const malformed = Uint8Array.of(1, 2, 3);
    const archive: StorageExport = {
      ...empty,
      payload: malformed,
      hash: await sha256Hex(malformed),
    };
    await expect(storage.import(archive)).rejects.toMatchObject({
      code: StorageErrorCode.ImportFailed,
    });
  });

  it('round-trips codec entries and rejects trailing bytes', () => {
    const encoded = encodeArchive([
      { kind: ArchiveEntryKind.Setting, header: { key: 'x', value: true }, body: new Uint8Array() },
    ]);
    expect(decodeArchive(encoded)).toMatchObject([
      { kind: ArchiveEntryKind.Setting, header: { key: 'x', value: true } },
    ]);
    const trailing = new Uint8Array(encoded.byteLength + 1);
    trailing.set(encoded);
    expect(() => decodeArchive(trailing)).toThrow('trailing bytes');
  });
});

describe('storage errors', () => {
  it('preserves storage errors and maps not-allowed failures', () => {
    const original = new StorageError(StorageErrorCode.CorruptData, 'bad');
    expect(toStorageError(original)).toBe(original);
    const denied = new Error('denied');
    denied.name = 'NotAllowedError';
    expect(toStorageError(denied)).toMatchObject({ code: StorageErrorCode.Unavailable });
  });
});
