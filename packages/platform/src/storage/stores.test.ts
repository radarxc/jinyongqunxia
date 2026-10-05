import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import { createIndexedDbStorage, sha256Hex, type TianshuStorage } from './index';

let serial = 0;
const opened: TianshuStorage[] = [];

async function makeStorage(): Promise<TianshuStorage> {
  const storage = await createIndexedDbStorage({
    databaseName: `tianshu-stores-${serial++}`,
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  });
  opened.push(storage);
  return storage;
}

afterEach(async () => {
  await Promise.all(opened.splice(0).map((storage) => storage.deleteDatabase()));
});

describe('WorldStateStore', () => {
  it('keeps long-term and chapter scopes separate and compacts old deltas', async () => {
    const storage = await makeStorage();
    const snapshot = Uint8Array.from([1]);
    const delta2 = Uint8Array.from([2]);
    const delta3 = Uint8Array.from([3]);
    await storage.worldState.saveSnapshot(
      'long-term',
      'profile',
      1,
      snapshot,
      await sha256Hex(snapshot),
    );
    await storage.worldState.appendDelta('long-term', 'profile', 2, delta2);
    await storage.worldState.appendDelta('long-term', 'profile', 3, delta3);
    await storage.worldState.saveSnapshot('chapter', 'profile', 1, Uint8Array.from([9]));

    await expect(storage.worldState.load('long-term', 'profile')).resolves.toMatchObject({
      snapshot: { sequence: 1 },
      deltas: [{ sequence: 2 }, { sequence: 3 }],
    });
    await storage.worldState.saveSnapshot('long-term', 'profile', 2, Uint8Array.from([4]));
    const compacted = await storage.worldState.load('long-term', 'profile');
    expect(compacted.deltas.map(({ sequence }) => sequence)).toEqual([3]);
    expect([...(await storage.worldState.load('chapter', 'profile')).snapshot!.payload]).toEqual([
      9,
    ]);

    await storage.worldState.clear('long-term', 'profile');
    await expect(storage.worldState.load('long-term', 'profile')).resolves.toEqual({
      snapshot: null,
      deltas: [],
    });
  });

  it('rejects regressing snapshots and deltas at or before the snapshot', async () => {
    const storage = await makeStorage();
    await storage.worldState.saveSnapshot('chapter', 'ch01', 5, Uint8Array.from([5]));
    await expect(
      storage.worldState.saveSnapshot('chapter', 'ch01', 4, Uint8Array.from([4])),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    await expect(
      storage.worldState.appendDelta('chapter', 'ch01', 5, Uint8Array.from([6])),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
  });
});

describe('ContentCache', () => {
  it('updates access time and evicts least-recently-used bytes', async () => {
    let now = 100;
    const storage = await createIndexedDbStorage({
      databaseName: `tianshu-cache-${serial++}`,
      indexedDB: new IDBFactory(),
      IDBKeyRange,
      clock: { now: () => now++ },
    });
    opened.push(storage);
    const first = { worldId: 'ch01', kind: 'world-pack' as const, version: 'v1' };
    const second = { worldId: 'ch02', kind: 'asset-manifest' as const, version: 'v1' };
    await storage.content.put(first, Uint8Array.from([1, 2]));
    await storage.content.put(second, Uint8Array.from([3, 4, 5]));
    await storage.content.get(first);

    await expect(storage.content.evictTo(2)).resolves.toEqual([second]);
    await expect(storage.content.get(second)).resolves.toBeNull();
    expect([...(await storage.content.get(first))!.data]).toEqual([1, 2]);
    expect(await storage.content.list()).toHaveLength(1);
    await storage.content.delete(first);
    await expect(storage.content.list()).resolves.toEqual([]);
  });
});

describe('SettingsStore', () => {
  it('stores detached JSON-like values and exposes sorted entries', async () => {
    const storage = await makeStorage();
    const value = { quality: 'high', audio: [80, true] } as const;
    await storage.settings.set('video', value);
    await storage.settings.set('accessibility', false);
    const loaded = await storage.settings.get<typeof value>('video');
    expect(loaded).toEqual(value);
    (loaded!.audio as unknown as (boolean | number)[])[0] = 0;
    await expect(storage.settings.get('video')).resolves.toEqual(value);
    expect(Object.keys(await storage.settings.entries())).toEqual(['accessibility', 'video']);
    await storage.settings.delete('video');
    await expect(storage.settings.get('video')).resolves.toBeNull();
  });
});

describe('storage export and import', () => {
  it('round-trips all stores through a hash-checked binary archive', async () => {
    const source = await makeStorage();
    const save = Uint8Array.from([1, 3, 5]);
    await source.saves.save('save_manual_01', save, {
      worldId: 'ch01',
      gameTime: 42,
      version: 'test',
      schemaVersion: 2,
      hash: await sha256Hex(save),
      summary: { locationName: '大理' },
    });
    await source.worldState.saveSnapshot('chapter', 'ch01', 4, Uint8Array.from([7]));
    await source.worldState.appendDelta('chapter', 'ch01', 5, Uint8Array.from([8]));
    await source.content.put(
      { worldId: 'ch01', kind: 'world-pack', version: 'sha256-a' },
      Uint8Array.from([9]),
    );
    await source.settings.set('locale', 'zh-Hans');

    const archive = await source.export();
    const target = await makeStorage();
    await expect(target.import(archive)).resolves.toEqual({
      saves: 1,
      worldSnapshots: 1,
      worldDeltas: 1,
      contentEntries: 1,
      settings: 1,
    });
    expect([...(await target.saves.load('save_manual_01'))!.snapshot]).toEqual([1, 3, 5]);
    expect((await target.worldState.load('chapter', 'ch01')).deltas[0]?.sequence).toBe(5);
    expect([...(await target.content.list())[0]!.data]).toEqual([9]);
    await expect(target.settings.get('locale')).resolves.toBe('zh-Hans');
  });

  it('rejects a tampered archive before replacing existing data', async () => {
    const storage = await makeStorage();
    await storage.settings.set('safe', true);
    const archive = await storage.export();
    const tampered = archive.payload.slice();
    const last = tampered.length - 1;
    tampered[last] = tampered[last]! ^ 0xff;

    await expect(storage.import({ ...archive, payload: tampered })).rejects.toMatchObject({
      code: 'HASH_MISMATCH',
    });
    await expect(storage.settings.get('safe')).resolves.toBe(true);
  });
});
