import type { SaveRow, StorageMetaRow, TianshuDatabase } from './schema';
import { StorageError, StorageErrorCode, toStorageError } from './errors';
import { verifyHash } from './hash';
import { assertMetadata, assertSaveBytes, assertSlot } from './records';
import type {
  AutosaveOptions,
  AutosaveResult,
  LoadSaveOptions,
  SaveMetadata,
  SaveSlotSummary,
  SavePayload,
  SaveStore,
  StorageClock,
  StoredSave,
} from './types';
import type { WriteQueue } from './queue';
import type { StoragePersistenceController } from './persistence';

const AUTO_SLOTS = ['save_auto_1', 'save_auto_2', 'save_auto_3'] as const;
const MAX_GENERATIONS = 3;
const NON_RECOVERABLE_LOAD_ERRORS = new Set<StorageErrorCode>([
  StorageErrorCode.SaveTooNew,
  StorageErrorCode.SaveProtocolUnsupported,
  StorageErrorCode.MissingMigration,
  StorageErrorCode.UnsupportedVersion,
  StorageErrorCode.Unavailable,
]);

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
    private readonly persistence: StoragePersistenceController,
    private readonly commitHook?: (slot: string, generation: number) => void | Promise<void>,
  ) {}

  async listSlots(): Promise<readonly SaveSlotSummary[]> {
    try {
      const [rows, pointers] = await this.db.transaction(
        'r',
        [this.db.saveGenerations, this.db.storageMeta],
        () => Promise.all([this.db.saveGenerations.toArray(), this.pointerMap()]),
      );
      const latest = new Map<string, SaveRow>();
      for (const row of rows) {
        const pointer = pointers.get(row.slot);
        if (pointer !== undefined && row.generation > pointer) continue;
        const current = latest.get(row.slot);
        if (!current || row.generation > current.generation) latest.set(row.slot, row);
      }
      return [...latest.values()]
        .map(toSummary)
        .sort((a, b) => b.savedAt - a.savedAt || a.slot.localeCompare(b.slot));
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async listHistory(slot: string): Promise<readonly SaveSlotSummary[]> {
    assertSlot(slot);
    try {
      return await this.db.transaction(
        'r',
        [this.db.saveGenerations, this.db.storageMeta],
        async () => (await this.rowsFor(slot)).map(toSummary),
      );
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
    await this.persistence.requestOnFirstSave();
    return this.queue.run(() => this.write(slot, bytes, meta, this.clock.now()));
  }

  async load(slot: string, options: LoadSaveOptions = {}): Promise<StoredSave | null> {
    assertSlot(slot);
    try {
      const rows = await this.db.transaction(
        'r',
        [this.db.saveGenerations, this.db.storageMeta],
        () => this.rowsFor(slot),
      );
      const candidates =
        options.generation === undefined
          ? rows
          : rows.filter((row) => row.generation === options.generation);
      if (candidates.length === 0) return null;
      const failed: number[] = [];
      let newestError: unknown;
      for (const row of candidates) {
        const snapshot = new Uint8Array(row.snapshot.slice(0));
        const save: StoredSave = { ...toSummary(row), snapshot };
        try {
          await verifyHash(snapshot, row.hash, `Save ${slot} generation ${row.generation}`);
          await options.validate?.(save);
          return failed.length === 0
            ? save
            : {
                ...save,
                recovery: {
                  recoveredGeneration: row.generation,
                  failedGenerations: failed,
                },
              };
        } catch (error) {
          if (options.generation !== undefined) throw error;
          if (error instanceof StorageError && NON_RECOVERABLE_LOAD_ERRORS.has(error.code))
            throw error;
          newestError ??= error;
          failed.push(row.generation);
        }
      }
      throw new StorageError(
        StorageErrorCode.CorruptData,
        `No valid generation remains for ${slot}`,
        newestError,
      );
    } catch (error) {
      throw toStorageError(error, StorageErrorCode.CorruptData);
    }
  }

  async delete(slot: string): Promise<void> {
    assertSlot(slot);
    await this.queue.run(async () => {
      try {
        await this.db.transaction('rw', this.db.saveGenerations, this.db.storageMeta, async () => {
          await this.db.saveGenerations.where('slot').equals(slot).delete();
          await this.db.storageMeta.delete(this.pointerKey(slot));
        });
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
    return this.autosavePrepared(async () => ({ snapshot, meta }), options);
  }

  async autosavePrepared(
    prepare: (slot: string) => Promise<SavePayload>,
    options: AutosaveOptions = {},
  ): Promise<AutosaveResult> {
    return this.queue.run(async () => {
      const now = this.clock.now();
      const last = await this.readMetaNumber('autosave:lastSavedAt');
      const index = (await this.readMetaNumber('autosave:nextIndex')) ?? 0;
      const slot = AUTO_SLOTS[index % AUTO_SLOTS.length]!;
      if (!options.force && last !== null && now - last < this.throttleMs)
        return { status: 'throttled', slot };
      const prepared = await prepare(slot);
      assertSaveBytes(prepared.snapshot);
      assertMetadata(prepared.meta);
      const bytes = Uint8Array.from(prepared.snapshot);
      await verifyHash(bytes, prepared.meta.hash, 'Autosave snapshot');
      await this.persistence.requestOnFirstSave();
      const saved = await this.write(slot, bytes, prepared.meta, now, [
        { key: 'autosave:lastSavedAt', value: now },
        { key: 'autosave:nextIndex', value: (index + 1) % AUTO_SLOTS.length },
        { key: 'autosave:lastTrigger', value: options.trigger ?? 'unspecified' },
      ]);
      return { status: 'saved', slot, saved };
    });
  }

  private async rowsFor(slot: string): Promise<SaveRow[]> {
    const rows = await this.db.saveGenerations.where('slot').equals(slot).toArray();
    const pointer = await this.readMetaNumber(this.pointerKey(slot));
    return rows
      .filter((row) => pointer === null || row.generation <= pointer)
      .sort((left, right) => right.generation - left.generation);
  }

  private async pointerMap(): Promise<Map<string, number>> {
    const pointers = new Map<string, number>();
    for (const row of await this.db.storageMeta
      .where('key')
      .startsWith('save:current:')
      .toArray()) {
      if (typeof row.value === 'number')
        pointers.set(row.key.slice('save:current:'.length), row.value);
    }
    return pointers;
  }

  private async readMetaNumber(key: string): Promise<number | null> {
    const row = await this.db.storageMeta.get(key);
    return typeof row?.value === 'number' ? row.value : null;
  }

  private pointerKey(slot: string): string {
    return `save:current:${slot}`;
  }

  private async write(
    slot: string,
    snapshot: Uint8Array,
    meta: SaveMetadata,
    savedAt: number,
    extraMeta: readonly StorageMetaRow[] = [],
  ): Promise<SaveSlotSummary> {
    try {
      return await this.db.transaction(
        'rw',
        this.db.saveGenerations,
        this.db.storageMeta,
        async () => {
          const rows = await this.rowsFor(slot);
          const highest = await this.db.saveGenerations.where('slot').equals(slot).last();
          const generation = (highest?.generation ?? rows[0]?.generation ?? 0) + 1;
          const row = this.createRow(slot, generation, snapshot, meta, savedAt);
          // Phase 1: the new immutable generation is durable before the current pointer changes.
          await this.db.saveGenerations.add(row);
          await this.commitHook?.(slot, generation);
          // Phase 2: advance the pointer and prune only after the new row succeeds.
          await this.db.storageMeta.bulkPut([
            { key: this.pointerKey(slot), value: generation },
            ...extraMeta,
          ]);
          const obsolete = (await this.db.saveGenerations.where('slot').equals(slot).toArray())
            .sort((left, right) => right.generation - left.generation)
            .slice(MAX_GENERATIONS);
          await this.db.saveGenerations.bulkDelete(
            obsolete.map((entry): [string, number] => [entry.slot, entry.generation]),
          );
          return toSummary(row);
        },
      );
    } catch (error) {
      throw toStorageError(error, StorageErrorCode.TransactionFailed);
    }
  }

  private createRow(
    slot: string,
    generation: number,
    snapshot: Uint8Array,
    meta: SaveMetadata,
    savedAt: number,
  ): SaveRow {
    return {
      slot,
      generation,
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
