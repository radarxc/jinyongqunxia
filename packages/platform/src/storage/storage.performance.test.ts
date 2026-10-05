import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createIndexedDbStorage,
  sha256Hex,
  type SaveMetadata,
  type TianshuStorage,
} from './index';

let serial = 0;
const opened: TianshuStorage[] = [];

async function makeStorage(
  options: {
    storageManager?: { persist(): Promise<boolean>; persisted(): Promise<boolean> } | null;
  } = {},
): Promise<TianshuStorage> {
  const storage = await createIndexedDbStorage({
    databaseName: `tianshu-performance-test-${serial++}`,
    indexedDB: new IDBFactory(),
    IDBKeyRange,
    ...(options.storageManager === undefined ? {} : { storageManager: options.storageManager }),
  });
  opened.push(storage);
  return storage;
}

async function makeMeta(bytes: Uint8Array): Promise<SaveMetadata> {
  return {
    worldId: 'ch01_tianlong',
    gameTime: 86_400,
    version: '20261001-test',
    schemaVersion: 2,
    hash: await sha256Hex(bytes),
    summary: { locationName: '无量山', partySize: 1 },
  };
}

afterEach(async () => {
  await Promise.all(opened.splice(0).map((storage) => storage.deleteDatabase()));
});

describe('SaveStore performance gate', () => {
  it('loads a 1 MiB snapshot within the 50 ms fake-indexeddb budget', async () => {
    const storage = await makeStorage();
    const bytes = new Uint8Array(1024 * 1024);
    bytes.fill(42);
    await storage.saves.save('save_manual_04', bytes, await makeMeta(bytes));

    const start = performance.now();
    const loaded = await storage.saves.load('save_manual_04');
    const elapsed = performance.now() - start;
    expect(loaded?.snapshot.byteLength).toBe(1024 * 1024);
    expect(elapsed).toBeLessThan(50);
  });

  it('stores a 1 MiB snapshot within the 50 ms fake-indexeddb budget', async () => {
    const storage = await makeStorage({ storageManager: null });
    const bytes = new Uint8Array(1024 * 1024);
    bytes.fill(42);
    const meta = await makeMeta(bytes);
    const start = performance.now();
    await storage.saves.save('save_manual_04', bytes, meta);
    expect(performance.now() - start).toBeLessThan(50);
  });
});
