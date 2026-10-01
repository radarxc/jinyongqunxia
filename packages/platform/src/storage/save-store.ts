import type { TianshuDatabase, SaveRow, StorageMetaRow } from './schema';
import { StorageErrorCode, toStorageError } from './errors';
import { verifyHash } from './hash';
import { assertMetadata, assertSaveBytes, assertSlot } from './records';
import type {
  AutosaveOptions,
  AutosaveResult,
  SaveMetadata,
  SaveSlotSummary,
  SaveStore,
  StorageClock,
  StoredSave,
} from './types';
import type { WriteQueue } from './queue';

const AUTO_SLOTS = ['save_auto_1', 'save_auto_2', 'save_auto_3'] as const;

function toSummary(row: SaveRow): SaveSlotSummary {
  return {
    slot: row.slot,
    generation: row.generation,
    savedAt: row.savedAt,
    byteLength: row.byteLength,
    meta: {
      worldId: row.worldId,
      gameTime: row.gameTime,
      version: row.version,
      schemaVersion: row.schemaVersion,
      hash: row.hash,
      summary: structuredClone(row.summary),
    },
  };
}

export class IndexedDbSaveStore implements SaveStore {
  constructor(
    private readonly db: TianshuDatabase,
    private readonly queue: WriteQueue,
    private readonly clock: StorageClock,
    private readonly throttleMs: number,
  ) {}

  async listSlots(): Promise<readonly SaveSlotSummary[]> {
    try {
      const rows = await this.db.saves.toArray();
      return rows
        .map(toSummary)
        .sort((left, right) => right.savedAt - left.savedAt || left.slot.localeCompare(right.slot));
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async save(slot: string, snapshot: Uint8Array, meta: SaveMetadata): Promise<SaveSlotSummary> {
    assertSlot(slot);
    assertSaveBytes(snapshot);
    assertMetadata(meta);
    const bytes = Uint8Array.from(snapshot);
    await verifyHash(bytes, meta.hash, 'Save snapshot');
    return this.queue.run(() => this.write(slot, bytes, meta, this.clock.now()));
  }

  async load(slot: string): Promise<StoredSave | null> {
    assertSlot(slot);
    try {
      const row = await this.db.saves.get(slot);
      if (!row) return null;
      const snapshot = new Uint8Array(row.snapshot.slice(0));
      await verifyHash(snapshot, row.hash, `Save ${slot}`);
      return { ...toSummary(row), snapshot };
    } catch (error) {
      throw toStorageError(error, StorageErrorCode.CorruptData);
    }
  }

  async delete(slot: string): Promise<void> {
    assertSlot(slot);
    await this.queue.run(async () => {
      try {
        await this.db.transaction('rw', this.db.saves, () => this.db.saves.delete(slot));
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  async autosave(
    snapshot: Uint8Array,
    meta: SaveMetadata,
    options: AutosaveOptions = {},
  ): Promise<AutosaveResult> {
    assertSaveBytes(snapshot);
    assertMetadata(meta);
    const bytes = Uint8Array.from(snapshot);
    await verifyHash(bytes, meta.hash, 'Autosave snapshot');

    return this.queue.run(async () => {
      try {
        const now = this.clock.now();
        return await this.db.transaction('rw', this.db.saves, this.db.storageMeta, async () => {
          const lastSavedAt = await this.readMetaNumber('autosave:lastSavedAt');
          const nextIndex = (await this.readMetaNumber('autosave:nextIndex')) ?? 0;
          const slot = AUTO_SLOTS[nextIndex % AUTO_SLOTS.length]!;
          if (!options.force && lastSavedAt !== null && now - lastSavedAt < this.throttleMs) {
            return { status: 'throttled', slot };
          }
          const previous = await this.db.saves.get(slot);
          const row = this.createRow(slot, bytes, meta, now, previous);
          await this.db.saves.put(row);
          await this.db.storageMeta.bulkPut([
            { key: 'autosave:lastSavedAt', value: now },
            { key: 'autosave:nextIndex', value: (nextIndex + 1) % AUTO_SLOTS.length },
            { key: 'autosave:lastTrigger', value: options.trigger ?? 'unspecified' },
          ]);
          return { status: 'saved', slot, saved: toSummary(row) };
        });
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  private async readMetaNumber(key: string): Promise<number | null> {
    const row = await this.db.storageMeta.get(key);
    return typeof row?.value === 'number' ? row.value : null;
  }

  private async write(
    slot: string,
    snapshot: Uint8Array,
    meta: SaveMetadata,
    savedAt: number,
    extraMeta: readonly StorageMetaRow[] = [],
  ): Promise<SaveSlotSummary> {
    try {
      return await this.db.transaction('rw', this.db.saves, this.db.storageMeta, async () => {
        const previous = await this.db.saves.get(slot);
        const row = this.createRow(slot, snapshot, meta, savedAt, previous);
        await this.db.saves.put(row);
        if (extraMeta.length > 0) await this.db.storageMeta.bulkPut([...extraMeta]);
        return toSummary(row);
      });
    } catch (error) {
      throw toStorageError(error, StorageErrorCode.TransactionFailed);
    }
  }

  private createRow(
    slot: string,
    snapshot: Uint8Array,
    meta: SaveMetadata,
    savedAt: number,
    previous?: SaveRow,
  ): SaveRow {
    return {
      slot,
      generation: (previous?.generation ?? 0) + 1,
      savedAt,
      byteLength: snapshot.byteLength,
      worldId: meta.worldId,
      gameTime: meta.gameTime,
      version: meta.version,
      schemaVersion: meta.schemaVersion,
      hash: meta.hash,
      summary: structuredClone(meta.summary),
      snapshot: snapshot.slice().buffer,
    };
  }
}
