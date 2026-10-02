import { ArchiveEntryKind, decodeArchive, encodeArchive, type ArchiveEntry } from './archive-codec';
import { StorageError, StorageErrorCode, toStorageError } from './errors';
import { sha256Hex, verifyHash } from './hash';
import { assertSlot, contentKey, MAX_SAVE_SNAPSHOT_BYTES, worldKey } from './records';
import type {
  ContentRow,
  SaveRow,
  SettingRow,
  TianshuDatabase,
  WorldDeltaRow,
  WorldSnapshotRow,
} from './schema';
import { STORAGE_SCHEMA_VERSION } from './schema';
import type { StorageClock, StorageExport, StorageImportResult, StorageTransfer } from './types';
import type { WriteQueue } from './queue';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function headerOf(entry: ArchiveEntry): Record<string, unknown> {
  if (!isRecord(entry.header)) {
    throw new StorageError(StorageErrorCode.ImportFailed, 'Archive entry header must be an object');
  }
  return entry.header;
}

function stripBody(row: object, bodyKey: string): object {
  return Object.fromEntries(Object.entries(row).filter(([key]) => key !== bodyKey));
}

function stringField(header: Record<string, unknown>, key: string): string {
  const value = header[key];
  if (typeof value !== 'string') {
    throw new StorageError(StorageErrorCode.ImportFailed, `Archive field ${key} must be a string`);
  }
  return value;
}

function numberField(header: Record<string, unknown>, key: string): number {
  const value = header[key];
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new StorageError(
      StorageErrorCode.ImportFailed,
      `Archive field ${key} must be a non-negative integer`,
    );
  }
  return value;
}

function summaryField(header: Record<string, unknown>): SaveRow['summary'] {
  const summary = header['summary'];
  if (!isRecord(summary)) {
    throw new StorageError(StorageErrorCode.ImportFailed, 'Archive save summary is invalid');
  }
  for (const value of Object.values(summary)) {
    if (
      (value !== null && !['boolean', 'number', 'string'].includes(typeof value)) ||
      (typeof value === 'number' && !Number.isFinite(value))
    ) {
      throw new StorageError(StorageErrorCode.ImportFailed, 'Archive summary value is invalid');
    }
  }
  return structuredClone(summary) as SaveRow['summary'];
}

interface DecodedArchive {
  readonly saves: SaveRow[];
  readonly snapshots: WorldSnapshotRow[];
  readonly deltas: WorldDeltaRow[];
  readonly content: ContentRow[];
  readonly settings: SettingRow[];
}

export class IndexedDbStorageTransfer implements StorageTransfer {
  constructor(
    private readonly db: TianshuDatabase,
    private readonly queue: WriteQueue,
    private readonly clock: StorageClock,
  ) {}

  async export(): Promise<StorageExport> {
    try {
      const entries = await this.db.transaction(
        'r',
        this.db.saveGenerations,
        this.db.worldSnapshots,
        this.db.worldDeltas,
        this.db.packs,
        this.db.settings,
        async () => {
          const [saves, snapshots, deltas, content, settings] = await Promise.all([
            this.db.saveGenerations.toArray(),
            this.db.worldSnapshots.toArray(),
            this.db.worldDeltas.toArray(),
            this.db.packs.toArray(),
            this.db.settings.toArray(),
          ]);
          return [
            ...saves.map((row) => ({
              kind: ArchiveEntryKind.Save,
              header: stripBody(row, 'snapshot'),
              body: new Uint8Array(row.snapshot),
            })),
            ...snapshots.map((row) => ({
              kind: ArchiveEntryKind.WorldSnapshot,
              header: stripBody(row, 'payload'),
              body: new Uint8Array(row.payload),
            })),
            ...deltas.map((row) => ({
              kind: ArchiveEntryKind.WorldDelta,
              header: stripBody(row, 'payload'),
              body: new Uint8Array(row.payload),
            })),
            ...content.map((row) => ({
              kind: ArchiveEntryKind.Content,
              header: stripBody(row, 'data'),
              body: new Uint8Array(row.data),
            })),
            ...settings.map((row) => ({
              kind: ArchiveEntryKind.Setting,
              header: row,
              body: new Uint8Array(),
            })),
          ] satisfies ArchiveEntry[];
        },
      );
      const payload = encodeArchive(entries);
      return {
        format: 'tianshu-storage',
        schemaVersion: STORAGE_SCHEMA_VERSION,
        exportedAt: this.clock.now(),
        payload,
        hash: await sha256Hex(payload),
      };
    } catch (error) {
      throw toStorageError(error);
    }
  }

  async import(archive: StorageExport): Promise<StorageImportResult> {
    if (archive.format !== 'tianshu-storage') {
      throw new StorageError(StorageErrorCode.ImportFailed, 'Unknown storage archive format');
    }
    if (archive.schemaVersion > STORAGE_SCHEMA_VERSION) {
      throw new StorageError(
        StorageErrorCode.UnsupportedVersion,
        'Storage archive is newer than this app',
      );
    }
    if (!Number.isSafeInteger(archive.schemaVersion) || archive.schemaVersion < 1) {
      throw new StorageError(StorageErrorCode.ImportFailed, 'Storage archive schema is invalid');
    }
    await verifyHash(archive.payload, archive.hash, 'Storage archive');
    const entries = decodeArchive(archive.payload);
    const decoded = this.decodeEntries(entries);
    await this.validateHashes(decoded);
    return this.queue.run(() => this.replaceAll(decoded));
  }

  private decodeEntries(entries: readonly ArchiveEntry[]): DecodedArchive {
    const decoded: DecodedArchive = {
      saves: [],
      snapshots: [],
      deltas: [],
      content: [],
      settings: [],
    };
    for (const entry of entries) {
      const header = headerOf(entry);
      switch (entry.kind) {
        case ArchiveEntryKind.Save:
          decoded.saves.push({
            slot: stringField(header, 'slot'),
            generation: numberField(header, 'generation'),
            savedAt: numberField(header, 'savedAt'),
            byteLength: numberField(header, 'byteLength'),
            worldId: stringField(header, 'worldId'),
            gameTime: numberField(header, 'gameTime'),
            version: stringField(header, 'version'),
            schemaVersion: numberField(header, 'schemaVersion'),
            hash: stringField(header, 'hash'),
            summary: summaryField(header),
            snapshot: entry.body.slice().buffer,
          });
          break;
        case ArchiveEntryKind.WorldSnapshot:
          decoded.snapshots.push(this.decodeWorld(header, entry.body));
          break;
        case ArchiveEntryKind.WorldDelta:
          decoded.deltas.push({
            ...this.decodeWorld(header, entry.body),
            ...(header['id'] === undefined ? {} : { id: numberField(header, 'id') }),
          });
          break;
        case ArchiveEntryKind.Content:
          decoded.content.push(this.decodeContent(header, entry.body));
          break;
        case ArchiveEntryKind.Setting:
          decoded.settings.push({ key: stringField(header, 'key'), value: header['value'] });
          break;
      }
    }
    const unique = (values: readonly string[], label: string): void => {
      if (new Set(values).size !== values.length) {
        throw new StorageError(StorageErrorCode.ImportFailed, `Archive has duplicate ${label}`);
      }
    };
    unique(
      decoded.saves.map(({ slot, generation }) => `${slot}\0${generation}`),
      'save generations',
    );
    unique(
      decoded.snapshots.map(({ key }) => key),
      'world snapshots',
    );
    unique(
      decoded.deltas.map(({ scope, worldId, sequence }) => `${scope}\0${worldId}\0${sequence}`),
      'world delta sequences',
    );
    unique(
      decoded.content.map(({ key }) => key),
      'content keys',
    );
    unique(
      decoded.settings.map(({ key }) => key),
      'setting keys',
    );
    return decoded;
  }

  private decodeWorld(header: Record<string, unknown>, body: Uint8Array): WorldSnapshotRow {
    const scope = stringField(header, 'scope');
    if (scope !== 'long-term' && scope !== 'chapter') {
      throw new StorageError(StorageErrorCode.ImportFailed, 'Archive world scope is invalid');
    }
    return {
      key: stringField(header, 'key'),
      scope,
      worldId: stringField(header, 'worldId'),
      sequence: numberField(header, 'sequence'),
      updatedAt: numberField(header, 'updatedAt'),
      hash: stringField(header, 'hash'),
      payload: body.slice().buffer,
    };
  }

  private decodeContent(header: Record<string, unknown>, body: Uint8Array): ContentRow {
    const kind = stringField(header, 'kind');
    if (kind !== 'asset-manifest' && kind !== 'world-pack') {
      throw new StorageError(StorageErrorCode.ImportFailed, 'Archive content kind is invalid');
    }
    return {
      key: stringField(header, 'key'),
      worldId: stringField(header, 'worldId'),
      kind,
      version: stringField(header, 'version'),
      byteLength: numberField(header, 'byteLength'),
      cachedAt: numberField(header, 'cachedAt'),
      lastAccessedAt: numberField(header, 'lastAccessedAt'),
      data: body.slice().buffer,
    };
  }

  private async validateHashes(decoded: DecodedArchive): Promise<void> {
    for (const row of decoded.saves) {
      try {
        assertSlot(row.slot);
      } catch (error) {
        throw new StorageError(
          StorageErrorCode.ImportFailed,
          'Imported save slot is invalid',
          error,
        );
      }
      if (
        row.byteLength !== row.snapshot.byteLength ||
        row.byteLength === 0 ||
        row.byteLength > MAX_SAVE_SNAPSHOT_BYTES
      ) {
        throw new StorageError(
          StorageErrorCode.ImportFailed,
          'Save byte length does not match body',
        );
      }
      await verifyHash(new Uint8Array(row.snapshot), row.hash, `Imported save ${row.slot}`);
    }
    for (const row of [...decoded.snapshots, ...decoded.deltas]) {
      let expectedKey: string;
      try {
        expectedKey = worldKey(row.scope, row.worldId);
      } catch (error) {
        throw new StorageError(StorageErrorCode.ImportFailed, 'World state key is invalid', error);
      }
      if (row.key !== expectedKey || row.payload.byteLength === 0) {
        throw new StorageError(StorageErrorCode.ImportFailed, 'World state key or body is invalid');
      }
      await verifyHash(new Uint8Array(row.payload), row.hash, 'Imported world state');
    }
    for (const row of decoded.content) {
      let expectedKey: string;
      try {
        expectedKey = contentKey(row);
      } catch (error) {
        throw new StorageError(StorageErrorCode.ImportFailed, 'Content key is invalid', error);
      }
      if (
        row.key !== expectedKey ||
        row.byteLength !== row.data.byteLength ||
        row.byteLength === 0
      ) {
        throw new StorageError(
          StorageErrorCode.ImportFailed,
          'Content byte length does not match body',
        );
      }
    }
  }

  private async replaceAll(decoded: DecodedArchive): Promise<StorageImportResult> {
    try {
      return await this.db.transaction(
        'rw',
        [
          this.db.saveGenerations,
          this.db.worldSnapshots,
          this.db.worldDeltas,
          this.db.packs,
          this.db.settings,
          this.db.storageMeta,
        ],
        async () => {
          await Promise.all([
            this.db.saveGenerations.clear(),
            this.db.worldSnapshots.clear(),
            this.db.worldDeltas.clear(),
            this.db.packs.clear(),
            this.db.settings.clear(),
            this.db.storageMeta.clear(),
          ]);
          await this.db.saveGenerations.bulkPut(decoded.saves);
          await this.db.worldSnapshots.bulkPut(decoded.snapshots);
          await this.db.worldDeltas.bulkPut(decoded.deltas);
          await this.db.packs.bulkPut(decoded.content);
          await this.db.settings.bulkPut(decoded.settings);
          const latest = new Map<string, number>();
          for (const row of decoded.saves) {
            latest.set(row.slot, Math.max(latest.get(row.slot) ?? 0, row.generation));
          }
          const grouped = new Map<string, SaveRow[]>();
          for (const row of decoded.saves) {
            const rows = grouped.get(row.slot) ?? [];
            rows.push(row);
            grouped.set(row.slot, rows);
          }
          const obsolete = [...grouped.values()].flatMap((rows) =>
            rows.sort((a, b) => b.generation - a.generation).slice(3),
          );
          if (obsolete.length > 0)
            await this.db.saveGenerations.bulkDelete(
              obsolete.map((row): [string, number] => [row.slot, row.generation]),
            );
          await this.db.storageMeta.bulkPut([
            { key: 'schemaVersion', value: STORAGE_SCHEMA_VERSION },
            ...[...latest].map(([slot, generation]) => ({
              key: `save:current:${slot}`,
              value: generation,
            })),
          ]);
          return {
            saves: decoded.saves.length,
            worldSnapshots: decoded.snapshots.length,
            worldDeltas: decoded.deltas.length,
            contentEntries: decoded.content.length,
            settings: decoded.settings.length,
          };
        },
      );
    } catch (error) {
      throw toStorageError(error, StorageErrorCode.ImportFailed);
    }
  }
}
