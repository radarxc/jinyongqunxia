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
  options: { clock?: StorageClock; factory?: IDBFactory; name?: string; throttleMs?: number } = {},
): Promise<TianshuStorage> {
  const storage = await createIndexedDbStorage({
    databaseName: options.name ?? `tianshu-test-${serial++}`,
    indexedDB: options.factory ?? new IDBFactory(),
    IDBKeyRange,
    ...(options.clock ? { clock: options.clock } : {}),
    ...(options.throttleMs === undefined ? {} : { autosaveThrottleMs: options.throttleMs }),
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
    await mutateSave(factory, name, 'save_manual_03', (row) => {
      row['snapshot'] = Uint8Array.from([0]).buffer;
    });
    await expect(storage.saves.load('save_manual_03')).rejects.toMatchObject({
      code: StorageErrorCode.HashMismatch,
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
});

async function mutateSave(
  factory: IDBFactory,
  name: string,
  slot: string,
  mutate: (row: Record<string, unknown>) => void,
): Promise<void> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('saves', 'readwrite');
    const store = transaction.objectStore('saves');
    const request = store.get(slot);
    request.onsuccess = () => {
      const row = request.result as Record<string, unknown>;
      mutate(row);
      store.put(row);
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
