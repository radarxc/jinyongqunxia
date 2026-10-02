import Dexie from 'dexie';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { createIndexedDbStorage, sha256Hex } from './index';

describe('IndexedDB schema migration', () => {
  it('upgrades v1 data to v3 without losing saves, content, or settings', async () => {
    const factory = new IDBFactory();
    const name = 'tianshu-migration-v1-to-v2';
    const legacy = new Dexie(name, { indexedDB: factory, IDBKeyRange });
    legacy.version(1).stores({
      saves: '&slot, savedAt',
      packs: '&key, [worldId+kind+version], lastAccessedAt',
      settings: '&key',
    });
    await legacy.open();
    const save = Uint8Array.from([5]);
    await legacy.table('saves').put({
      slot: 'save_manual_01',
      generation: 1,
      savedAt: 1,
      byteLength: 1,
      worldId: 'ch01',
      gameTime: 1,
      version: 'v1',
      schemaVersion: 1,
      hash: await sha256Hex(save),
      summary: {},
      snapshot: save.buffer,
    });
    await legacy.table('settings').put({ key: 'quality', value: 'low' });
    await legacy.table('packs').put({
      key: 'ch01\0world-pack\0v1',
      worldId: 'ch01',
      kind: 'world-pack',
      version: 'v1',
      byteLength: 1,
      cachedAt: 1,
      lastAccessedAt: 1,
      data: Uint8Array.from([7]).buffer,
    });
    legacy.close();

    const storage = await createIndexedDbStorage({
      databaseName: name,
      indexedDB: factory,
      IDBKeyRange,
    });
    expect(storage.schemaVersion).toBe(3);
    expect(storage.migrations).toEqual([
      { from: 1, to: 2, description: 'add world state snapshots and ordered deltas' },
      { from: 2, to: 3, description: 'move saves to three-generation compound keys' },
    ]);
    await expect(storage.settings.get('quality')).resolves.toBe('low');
    expect([...(await storage.saves.load('save_manual_01'))!.snapshot]).toEqual([5]);
    expect([...(await storage.content.list())[0]!.data]).toEqual([7]);
    await expect(storage.worldState.load('chapter', 'ch01')).resolves.toEqual({
      snapshot: null,
      deltas: [],
    });
    await storage.deleteDatabase();
  });

  it('upgrades v2 save rows into the compound-key generation store', async () => {
    const factory = new IDBFactory();
    const name = 'tianshu-migration-v2-to-v3';
    const legacy = new Dexie(name, { indexedDB: factory, IDBKeyRange });
    legacy.version(2).stores({
      saves: '&slot, savedAt, [worldId+gameTime]',
      worldSnapshots: '&key, [scope+worldId]',
      worldDeltas: '++id, &[scope+worldId+sequence], [scope+worldId]',
      packs: '&key, [worldId+kind+version], lastAccessedAt',
      settings: '&key',
      storageMeta: '&key',
    });
    await legacy.open();
    const bytes = Uint8Array.of(7, 8);
    await legacy.table('saves').put({
      slot: 'save_quick',
      generation: 9,
      savedAt: 2,
      byteLength: 2,
      worldId: 'ch02',
      gameTime: 3,
      version: 'v2',
      schemaVersion: 1,
      hash: await sha256Hex(bytes),
      summary: {},
      snapshot: bytes.buffer,
    });
    legacy.close();

    const storage = await createIndexedDbStorage({
      databaseName: name,
      indexedDB: factory,
      IDBKeyRange,
    });
    await expect(storage.saves.load('save_quick')).resolves.toMatchObject({ generation: 9 });
    await expect(storage.saves.listHistory('save_quick')).resolves.toHaveLength(1);
    await storage.deleteDatabase();
  });
});
