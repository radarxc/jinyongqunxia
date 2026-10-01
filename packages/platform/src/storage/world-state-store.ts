import type { TianshuDatabase, WorldDeltaRow, WorldSnapshotRow } from './schema';
import { StorageError, StorageErrorCode, toStorageError } from './errors';
import { sha256Hex, verifyHash } from './hash';
import { assertBytes, worldKey } from './records';
import type {
  LoadedWorldState,
  PersistedStateScope,
  Sha256Hex,
  StorageClock,
  WorldStateChunk,
  WorldStateStore,
} from './types';
import type { WriteQueue } from './queue';

function assertSequence(sequence: number): void {
  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new StorageError(
      StorageErrorCode.InvalidArgument,
      'Sequence must be a non-negative integer',
    );
  }
}

function toChunk(row: WorldSnapshotRow | WorldDeltaRow): WorldStateChunk {
  return {
    sequence: row.sequence,
    updatedAt: row.updatedAt,
    hash: row.hash,
    payload: new Uint8Array(row.payload.slice(0)),
  };
}

export class IndexedDbWorldStateStore implements WorldStateStore {
  constructor(
    private readonly db: TianshuDatabase,
    private readonly queue: WriteQueue,
    private readonly clock: StorageClock,
  ) {}

  saveSnapshot(
    scope: PersistedStateScope,
    worldId: string,
    sequence: number,
    snapshot: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<WorldStateChunk> {
    return this.writeSnapshot(scope, worldId, sequence, snapshot, expectedHash);
  }

  appendDelta(
    scope: PersistedStateScope,
    worldId: string,
    sequence: number,
    delta: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<WorldStateChunk> {
    return this.writeDelta(scope, worldId, sequence, delta, expectedHash);
  }

  async load(scope: PersistedStateScope, worldId: string): Promise<LoadedWorldState> {
    const key = worldKey(scope, worldId);
    try {
      const [snapshotRow, deltaRows] = await this.db.transaction(
        'r',
        this.db.worldSnapshots,
        this.db.worldDeltas,
        () =>
          Promise.all([
            this.db.worldSnapshots.get(key),
            this.db.worldDeltas
              .where('[scope+worldId]')
              .equals([scope, worldId])
              .sortBy('sequence'),
          ]),
      );
      const snapshot = snapshotRow ? toChunk(snapshotRow) : null;
      const deltas = deltaRows.map(toChunk);
      await Promise.all([
        ...(snapshot ? [verifyHash(snapshot.payload, snapshot.hash, 'World snapshot')] : []),
        ...deltas.map((delta) => verifyHash(delta.payload, delta.hash, 'World delta')),
      ]);
      return { snapshot, deltas };
    } catch (error) {
      throw toStorageError(error, StorageErrorCode.CorruptData);
    }
  }

  async clear(scope: PersistedStateScope, worldId: string): Promise<void> {
    const key = worldKey(scope, worldId);
    await this.queue.run(async () => {
      try {
        await this.db.transaction('rw', this.db.worldSnapshots, this.db.worldDeltas, async () => {
          await this.db.worldSnapshots.delete(key);
          await this.db.worldDeltas.where('[scope+worldId]').equals([scope, worldId]).delete();
        });
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  private async prepare(
    worldId: string,
    sequence: number,
    payload: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<{ bytes: Uint8Array; hash: Sha256Hex; updatedAt: number }> {
    worldKey('chapter', worldId);
    assertSequence(sequence);
    assertBytes(payload, 'World state payload');
    const bytes = Uint8Array.from(payload);
    const hash = await sha256Hex(bytes);
    if (expectedHash) await verifyHash(bytes, expectedHash, 'World state payload');
    return { bytes, hash, updatedAt: this.clock.now() };
  }

  private async writeSnapshot(
    scope: PersistedStateScope,
    worldId: string,
    sequence: number,
    payload: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<WorldStateChunk> {
    const prepared = await this.prepare(worldId, sequence, payload, expectedHash);
    const key = worldKey(scope, worldId);
    return this.queue.run(async () => {
      try {
        return await this.db.transaction(
          'rw',
          this.db.worldSnapshots,
          this.db.worldDeltas,
          async () => {
            const current = await this.db.worldSnapshots.get(key);
            if (current && sequence < current.sequence) {
              throw new StorageError(
                StorageErrorCode.InvalidArgument,
                'Snapshot sequence regressed',
              );
            }
            const row: WorldSnapshotRow = {
              key,
              scope,
              worldId,
              sequence,
              updatedAt: prepared.updatedAt,
              hash: prepared.hash,
              payload: prepared.bytes.slice().buffer,
            };
            await this.db.worldSnapshots.put(row);
            await this.db.worldDeltas
              .where('[scope+worldId+sequence]')
              .between([scope, worldId, 0], [scope, worldId, sequence], true, true)
              .delete();
            return toChunk(row);
          },
        );
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }

  private async writeDelta(
    scope: PersistedStateScope,
    worldId: string,
    sequence: number,
    payload: Uint8Array,
    expectedHash?: Sha256Hex,
  ): Promise<WorldStateChunk> {
    const prepared = await this.prepare(worldId, sequence, payload, expectedHash);
    return this.queue.run(async () => {
      try {
        const row: WorldDeltaRow = {
          key: worldKey(scope, worldId),
          scope,
          worldId,
          sequence,
          updatedAt: prepared.updatedAt,
          hash: prepared.hash,
          payload: prepared.bytes.slice().buffer,
        };
        await this.db.transaction('rw', this.db.worldSnapshots, this.db.worldDeltas, async () => {
          const snapshot = await this.db.worldSnapshots.get(row.key);
          if (snapshot && sequence <= snapshot.sequence) {
            throw new StorageError(
              StorageErrorCode.InvalidArgument,
              'Delta sequence must follow the snapshot',
            );
          }
          await this.db.worldDeltas.add(row);
        });
        return toChunk(row);
      } catch (error) {
        throw toStorageError(error, StorageErrorCode.TransactionFailed);
      }
    });
  }
}
