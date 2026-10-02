import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createIndexedDbStorage,
  sha256Hex,
  StorageErrorCode,
  type SaveMetadata,
  type StorageClock,
  type TianshuStorage,
} from './index';

let serial = 0;
const opened: TianshuStorage[] = [];

function makeClock(initial = 1_000): StorageClock & { advance(ms: number): void } {
  let now = initial;
  return {
    now: () => now,
    advance: (ms) => {
      now += ms;
    },
  };
}

async function makeStorage(
  options: {
    clock?: StorageClock;
    factory?: IDBFactory;
    name?: string;
    throttleMs?: number;
    storageManager?: { persist(): Promise<boolean>; persisted(): Promise<boolean> } | null;
    saveCommitHook?: (slot: string, generation: number) => void | Promise<void>;
  } = {},
): Promise<TianshuStorage> {
  const storage = await createIndexedDbStorage({
    databaseName: options.name ?? `tianshu-test-${serial++}`,
    indexedDB: options.factory ?? new IDBFactory(),
    IDBKeyRange,
    ...(options.clock ? { clock: options.clock } : {}),
    ...(options.throttleMs === undefined ? {} : { autosaveThrottleMs: options.throttleMs }),
    ...(options.storageManager === undefined ? {} : { storageManager: options.storageManager }),
    ...(options.saveCommitHook ? { saveCommitHook: options.saveCommitHook } : {}),
  });
  opened.push(storage);
  return storage;
}

async function makeMeta(
  bytes: Uint8Array,
  overrides: Partial<SaveMetadata> = {},
): Promise<SaveMetadata> {
  return {
    worldId: 'ch01_tianlong',
    gameTime: 86_400,
    version: '20261001-test',
    schemaVersion: 2,
    hash: await sha256Hex(bytes),
    summary: { locationName: '无量山', partySize: 1 },
    ...overrides,
  };
}

afterEach(async () => {
  await Promise.all(opened.splice(0).map((storage) => storage.deleteDatabase()));
});

describe('SaveStore', () => {
  it('stores binary snapshots, lists slots, loads detached bytes, and deletes', async () => {
    const clock = makeClock();
    const storage = await makeStorage({ clock });
    const first = Uint8Array.from([1, 2, 3]);
    const second = Uint8Array.from([4, 5]);
    await storage.saves.save('save_manual_01', first, await makeMeta(first));
    clock.advance(1);
    await storage.saves.save(
      'save_quick',
      second,
      await makeMeta(second, { worldId: 'ch02_shediao' }),
    );

    const slots = await storage.saves.listSlots();
    expect(slots.map(({ slot }) => slot)).toEqual(['save_quick', 'save_manual_01']);
    expect(slots[0]).toMatchObject({ byteLength: 2, generation: 1 });
    const loaded = await storage.saves.load('save_manual_01');
    expect([...loaded!.snapshot]).toEqual([1, 2, 3]);
    loaded!.snapshot[0] = 99;
    expect([...(await storage.saves.load('save_manual_01'))!.snapshot]).toEqual([1, 2, 3]);

    await storage.saves.delete('save_manual_01');
    await expect(storage.saves.load('save_manual_01')).resolves.toBeNull();
  });

  it('serializes concurrent writes without losing generations', async () => {
    const storage = await makeStorage();
    const snapshot = Uint8Array.from([7, 8, 9]);
    const meta = await makeMeta(snapshot);
    const results = await Promise.all(
      Array.from({ length: 12 }, () => storage.saves.save('save_manual_02', snapshot, meta)),
    );
    expect(results.map(({ generation }) => generation).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    );
    await expect(storage.saves.load('save_manual_02')).resolves.toMatchObject({ generation: 12 });
  });

  it('keeps the latest three generations for every slot', async () => {
    const factory = new IDBFactory();
    const name = `tianshu-test-${serial++}`;
    const storage = await makeStorage({ factory, name });
    for (let value = 1; value <= 4; value += 1) {
      const bytes = Uint8Array.of(value);
      await storage.saves.save('save_manual_02', bytes, await makeMeta(bytes));
    }

    expect(await countSaveRows(factory, name, 'save_manual_02')).toBe(3);
    await expect(storage.saves.load('save_manual_02')).resolves.toMatchObject({ generation: 4 });
  });

  it('rolls back the new generation and pointer when phase two fails', async () => {
    let fail = false;
    const storage = await makeStorage({
      saveCommitHook: (_slot, generation) => {
        if (fail && generation === 2) throw new Error('simulated phase-two failure');
      },
    });
    const first = Uint8Array.of(1);
    await storage.saves.save('save_manual_02', first, await makeMeta(first));
    fail = true;
    const second = Uint8Array.of(2);
    await expect(
      storage.saves.save('save_manual_02', second, await makeMeta(second)),
    ).rejects.toMatchObject({ code: StorageErrorCode.TransactionFailed });
    await expect(storage.saves.listHistory('save_manual_02')).resolves.toMatchObject([
      { generation: 1 },
    ]);
    expect([...(await storage.saves.load('save_manual_02'))!.snapshot]).toEqual([1]);
  });

  it('ignores a durable generation that was not selected by the current pointer', async () => {
    const factory = new IDBFactory();
    const name = `tianshu-test-${serial++}`;
    const storage = await makeStorage({ factory, name });
    const first = Uint8Array.of(1);
    await storage.saves.save('save_manual_02', first, await makeMeta(first));
    await storage.close();
    const unpointed = Uint8Array.of(2);
    await injectUnpointedGeneration(factory, name, 'save_manual_02', 2, unpointed);
    const reopened = await makeStorage({ factory, name });
    await expect(reopened.saves.listHistory('save_manual_02')).resolves.toMatchObject([
      { generation: 1 },
    ]);
    expect([...(await reopened.saves.load('save_manual_02'))!.snapshot]).toEqual([1]);
    for (const value of [3, 4, 5]) {
      const bytes = Uint8Array.of(value);
      await reopened.saves.save('save_manual_02', bytes, await makeMeta(bytes));
    }
    expect(await countSaveRows(factory, name, 'save_manual_02')).toBe(3);
  });

  it('falls back to the preceding generation when the current bytes are corrupt', async () => {
    const factory = new IDBFactory();
    const name = `tianshu-test-${serial++}`;
    const storage = await makeStorage({ factory, name });
    const first = Uint8Array.of(31);
    const second = Uint8Array.of(32);
    await storage.saves.save('save_manual_03', first, await makeMeta(first));
    await storage.saves.save('save_manual_03', second, await makeMeta(second));
    await mutateLatestSave(factory, name, 'save_manual_03', (row) => {
      row['snapshot'] = Uint8Array.of(0).buffer;
    });

    const loaded = await storage.saves.load('save_manual_03');
    expect([...loaded!.snapshot]).toEqual([31]);
    expect(loaded).toMatchObject({
      generation: 1,
      recovery: { recoveredGeneration: 1, failedGenerations: [2] },
    });
  });

  it('falls back when latest semantic validation fails and keeps explicit history strict', async () => {
    const storage = await makeStorage();
    for (const value of [1, 2]) {
      const bytes = Uint8Array.of(value);
      await storage.saves.save('save_manual_03', bytes, await makeMeta(bytes));
    }
    const loaded = await storage.saves.load('save_manual_03', {
      validate: (candidate) => {
        if (candidate.snapshot[0] === 2) throw new Error('migration failed');
      },
    });
    expect(loaded).toMatchObject({
      generation: 1,
      recovery: { recoveredGeneration: 1, failedGenerations: [2] },
    });
    await expect(
      storage.saves.load('save_manual_03', {
        generation: 2,
        validate: () => {
          throw new Error('migration failed');
        },
      }),
    ).rejects.toThrow('migration failed');
  });

  it('preserves the newest validation failure as the all-generations-corrupt cause', async () => {
    const storage = await makeStorage();
    const bytes = Uint8Array.of(1);
    await storage.saves.save('save_manual_03', bytes, await makeMeta(bytes));
    await expect(
      storage.saves.load('save_manual_03', {
        validate: () => { throw new Error('migration failed'); },
      }),
    ).rejects.toMatchObject({
      code: StorageErrorCode.CorruptData,
      cause: expect.objectContaining({ message: 'migration failed' }),
    });
  });

  it('throttles autosaves and rotates three slots when the window expires', async () => {
    const clock = makeClock();
    const storage = await makeStorage({ clock, throttleMs: 30_000 });
    const bytes = Uint8Array.from([11, 12]);
    const meta = await makeMeta(bytes);

    await expect(
      storage.saves.autosave(bytes, meta, { trigger: 'battle-ended' }),
    ).resolves.toMatchObject({ status: 'saved', slot: 'save_auto_1' });
    await expect(storage.saves.autosave(bytes, meta)).resolves.toEqual({
      status: 'throttled',
      slot: 'save_auto_2',
    });
    clock.advance(30_000);
    await expect(storage.saves.autosave(bytes, meta)).resolves.toMatchObject({
      status: 'saved',
      slot: 'save_auto_2',
    });
    await expect(storage.saves.autosave(bytes, meta, { force: true })).resolves.toMatchObject({
      status: 'saved',
      slot: 'save_auto_3',
    });
  });

  it('rejects invalid slots, wrong hashes, and corrupt stored bytes', async () => {
    const factory = new IDBFactory();
    const name = `tianshu-test-${serial++}`;
    const storage = await makeStorage({ factory, name });
    const bytes = Uint8Array.from([21, 22, 23]);
    const meta = await makeMeta(bytes);
    await expect(storage.saves.save('../escape', bytes, meta)).rejects.toMatchObject({
      code: StorageErrorCode.InvalidArgument,
    });
    await expect(
      storage.saves.save('save_manual_03', bytes, { ...meta, hash: '0'.repeat(64) }),
    ).rejects.toMatchObject({ code: StorageErrorCode.HashMismatch });

    await storage.saves.save('save_manual_03', bytes, meta);
    await mutateLatestSave(factory, name, 'save_manual_03', (row) => {
      row['snapshot'] = Uint8Array.from([0]).buffer;
    });
    await expect(storage.saves.load('save_manual_03')).rejects.toMatchObject({
      code: StorageErrorCode.CorruptData,
    });
  });

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

  it('requests persistent storage only on the first save and exposes the result', async () => {
    let persistedCalls = 0;
    let persistCalls = 0;
    const storage = await makeStorage({
      storageManager: {
        persisted: async () => {
          persistedCalls += 1;
          return false;
        },
        persist: async () => {
          persistCalls += 1;
          return true;
        },
      },
    });
    await expect(storage.persistence.status()).resolves.toBe('not-requested');
    const bytes = Uint8Array.of(1);
    await storage.saves.save('save_manual_01', bytes, await makeMeta(bytes));
    await storage.saves.save('save_manual_02', bytes, await makeMeta(bytes));
    await expect(storage.persistence.status()).resolves.toBe('granted');
    expect({ persistedCalls, persistCalls }).toEqual({ persistedCalls: 2, persistCalls: 1 });
  });

  it('reports denied and unsupported persistence without blocking a save', async () => {
    const denied = await makeStorage({
      storageManager: {
        persisted: async () => false,
        persist: async () => false,
      },
    });
    const unsupported = await makeStorage({ storageManager: null });
    const bytes = Uint8Array.of(1);
    const meta = await makeMeta(bytes);
    await denied.saves.save('save_quick', bytes, meta);
    await unsupported.saves.save('save_quick', bytes, meta);
    await expect(denied.persistence.status()).resolves.toBe('denied');
    await expect(unsupported.persistence.status()).resolves.toBe('unsupported');
  });
});

async function countSaveRows(factory: IDBFactory, name: string, slot: string): Promise<number> {
  const database = await openDatabase(factory, name);
  const table = database.objectStoreNames.contains('saveGenerations') ? 'saveGenerations' : 'saves';
  const transaction = database.transaction(table);
  const store = transaction.objectStore(table);
  const request = table === 'saves' ? store.count(slot) : store.index('slot').count(slot);
  const count = await requestResult(request);
  database.close();
  return count;
}

async function injectUnpointedGeneration(
  factory: IDBFactory,
  name: string,
  slot: string,
  generation: number,
  bytes: Uint8Array,
): Promise<void> {
  const database = await openDatabase(factory, name);
  const hash = await sha256Hex(bytes);
  const transaction = database.transaction('saveGenerations', 'readwrite');
  transaction.objectStore('saveGenerations').put({
    slot,
    generation,
    savedAt: generation,
    byteLength: bytes.length,
    worldId: 'ch01_tianlong',
    gameTime: 0,
    version: 'test',
    schemaVersion: 1,
    hash,
    summary: {},
    snapshot: bytes.buffer,
  });
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function mutateLatestSave(
  factory: IDBFactory,
  name: string,
  slot: string,
  mutate: (row: Record<string, unknown>) => void,
): Promise<void> {
  const database = await openDatabase(factory, name);
  const table = database.objectStoreNames.contains('saveGenerations') ? 'saveGenerations' : 'saves';
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);
    const request =
      table === 'saves' ? store.get(slot) : store.index('slot').openCursor(slot, 'prev');
    request.onsuccess = () => {
      const cursor = table === 'saves' ? null : (request.result as IDBCursorWithValue | null);
      const row = (cursor?.value ?? request.result) as Record<string, unknown>;
      mutate(row);
      store.put(row);
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

function openDatabase(factory: IDBFactory, name: string): Promise<IDBDatabase> {
  return requestResult(factory.open(name));
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
