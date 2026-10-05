import Dexie, { type Table } from 'dexie';
import type { Migration } from './types';

export const STORAGE_SCHEMA_VERSION = 3;

export interface SaveRow {
  slot: string;
  generation: number;
  savedAt: number;
  byteLength: number;
  worldId: string;
  gameTime: number;
  version: string;
  schemaVersion: number;
  hash: string;
  summary: Record<string, boolean | null | number | string>;
  snapshot: ArrayBuffer;
}

export interface WorldSnapshotRow {
  key: string;
  scope: 'long-term' | 'chapter';
  worldId: string;
  sequence: number;
  updatedAt: number;
  hash: string;
  payload: ArrayBuffer;
}

export interface WorldDeltaRow extends WorldSnapshotRow {
  id?: number;
}

export interface ContentRow {
  key: string;
  worldId: string;
  kind: 'asset-manifest' | 'world-pack';
  version: string;
  byteLength: number;
  cachedAt: number;
  lastAccessedAt: number;
  data: ArrayBuffer;
}

export interface SettingRow {
  key: string;
  value: unknown;
}

export interface StorageMetaRow {
  key: string;
  value: unknown;
}

export const MIGRATIONS: readonly Migration[] = [
  { from: 1, to: 2, description: 'add world state snapshots and ordered deltas' },
  { from: 2, to: 3, description: 'move saves to three-generation compound keys' },
];

export class TianshuDatabase extends Dexie {
  saveGenerations!: Table<SaveRow, [string, number]>;
  worldSnapshots!: Table<WorldSnapshotRow, string>;
  worldDeltas!: Table<WorldDeltaRow, number>;
  packs!: Table<ContentRow, string>;
  settings!: Table<SettingRow, string>;
  storageMeta!: Table<StorageMetaRow, string>;

  constructor(name: string, indexedDB: IDBFactory, keyRange: typeof IDBKeyRange) {
    super(name, { indexedDB, IDBKeyRange: keyRange });

    this.version(1).stores({
      saves: '&slot, savedAt',
      packs: '&key, [worldId+kind+version], lastAccessedAt',
      settings: '&key',
    });

    this.version(2)
      .stores({
        saves: '&slot, savedAt, [worldId+gameTime]',
        worldSnapshots: '&key, [scope+worldId]',
        worldDeltas: '++id, &[scope+worldId+sequence], [scope+worldId]',
        packs: '&key, [worldId+kind+version], lastAccessedAt',
        settings: '&key',
        storageMeta: '&key',
      })
      .upgrade(async (transaction) => {
        await transaction.table<StorageMetaRow>('storageMeta').put({
          key: 'schemaVersion',
          value: 2,
        });
      });

    this.version(3)
      .stores({
        saves: null,
        saveGenerations: '&[slot+generation], slot, [slot+savedAt], savedAt, [worldId+gameTime]',
        worldSnapshots: '&key, [scope+worldId]',
        worldDeltas: '++id, &[scope+worldId+sequence], [scope+worldId]',
        packs: '&key, [worldId+kind+version], lastAccessedAt',
        settings: '&key',
        storageMeta: '&key',
      })
      .upgrade(async (transaction) => {
        const legacy = await transaction.table<SaveRow>('saves').toArray();
        if (legacy.length > 0) {
          await transaction.table<SaveRow>('saveGenerations').bulkPut(legacy);
          await transaction.table<StorageMetaRow>('storageMeta').bulkPut(
            legacy.map((row) => ({
              key: `save:current:${row.slot}`,
              value: row.generation,
            })),
          );
        }
        await transaction.table<StorageMetaRow>('storageMeta').put({
          key: 'schemaVersion',
          value: 3,
        });
      });
  }
}
