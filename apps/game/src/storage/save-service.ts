import {
  decodeJsonSave,
  decodeZip,
  encodeJsonSave,
  encodeZip,
  identityContentFixup,
  migrateSaveJson,
  packSaveJson,
  sha256Hex,
  StorageError,
  StorageErrorCode,
  unpackTsav,
  type SaveHeader,
  type SaveHeaderInput,
  type SaveJson,
  type SaveMetadata,
  type SaveMigration,
  type StoredSave,
  type TianshuStorage,
  type ZipEntry,
} from '@tianshu/platform';
import { SAVE_SCHEMA, migrateUiSessionV1, projectGameStateSummary } from '@tianshu/core';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { SessionSnapshot } from '../runtime/contracts';

export interface SaveHost {
  snapshot(): Promise<SessionSnapshot>;
  validate(snapshot: SessionSnapshot): Promise<void>;
  restore(snapshot: SessionSnapshot): Promise<unknown>;
}
export type SaveExportFormat = 'json' | 'tsav';
const APP_BUILD = '20261002-0000-local';
const DEVICE_ID_KEY = 'save.deviceId';
const LINEAGE_ID_KEY = 'save.lineageId';
const LEGACY_MAGIC = Uint8Array.of(84, 83, 85, 73, 1);
const LEGACY_HEADER_LIMIT = 16 * 1024;
const FILE_LIMIT = 256 * 1024 * 1024;
const STATE_MIGRATIONS = new Map([[1, ((value, context) => migrateUiSessionV1(
  value as JsonValue, { fromContentHash: context.fromContentHash,
    targetSchema: context.toSchema, remapVersion: 'none' })) as SaveMigration]]);

function hasMagic(bytes: Uint8Array, magic: ArrayLike<number>): boolean {
  if (bytes.length < magic.length) return false;
  for (let index = 0; index < magic.length; index += 1) {
    if (bytes[index] !== magic[index]) return false;
  }
  return true;
}
function asSaveJson(snapshot: SessionSnapshot): SaveJson {
  return snapshot as unknown as SaveJson;
}
function asSession(state: SaveJson): SessionSnapshot {
  return state as unknown as SessionSnapshot;
}
function summary(session: SessionSnapshot): SaveHeader['summary'] {
  const value = projectGameStateSummary(session);
  return { chapterId: value.chapterId, act: value.act, regionId: value.regionId,
    locationName: value.locationId, lr: value.realLevel, ld: value.displayLevel,
    yuyun: value.yuyun, tianshuCount: value.tianshuCount, fateCount: value.fateCount,
    difficulty: value.difficulty, rules: value.rules, playTimeSec: value.playTimeSec,
    rollbackCount: value.rollbackCount, debugTainted: value.debugTainted,
    partyNames: value.partyIds };
}
function randomId(prefix: 'dev_' | 'ln_'): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const bytes = crypto.getRandomValues(new Uint8Array(26));
  return prefix + Array.from(bytes, (byte) => alphabet[byte & 31]).join('');
}
function headerInput(
  slot: string,
  session: SessionSnapshot,
  origin: NonNullable<SaveHeaderInput['origin']>,
  deviceId: string,
  lineageId: string,
  source?: SaveHeader,
): SaveHeaderInput {
  return {
    format: 'tianshu-save',
    slotId: slot,
    saveSchema: session.meta.saveSchema,
    contentHash: session.meta.contentHash,
    appBuild: APP_BUILD,
    savedAt: new Date().toISOString(),
    deviceId,
    baseRev: 0,
    lineageId: source?.lineageId ?? lineageId,
    zhoumu: source?.zhoumu ?? 1,
    summary: summary(session),
    origin,
  };
}
async function metadata(bytes: Uint8Array, header: SaveHeader): Promise<SaveMetadata> {
  return {
    worldId: header.summary.chapterId,
    gameTime: header.summary.playTimeSec,
    version: 'tsav.v1',
    schemaVersion: header.saveSchema,
    hash: await sha256Hex(bytes),
    summary: {
      name: header.summary.partyNames[0] ?? '无名侠客',
      location: header.summary.locationName,
      date: header.savedAt,
    },
  };
}

interface PreparedSave {
  readonly header: SaveHeader;
  readonly session: SessionSnapshot;
  readonly bytes: Uint8Array;
}

function compatibilityError(error: unknown): never {
  const code = error instanceof Error ? error.message : '';
  if (code === 'SAVE_TOO_NEW') {
    throw new StorageError(StorageErrorCode.SaveTooNew, code, error);
  }
  if (code === 'SAVE_PROTOCOL_UNSUPPORTED' || code === 'SAVE_VERSION_UNSUPPORTED') {
    throw new StorageError(StorageErrorCode.SaveProtocolUnsupported, code, error);
  }
  throw error;
}

async function validateSession(host: SaveHost, session: SessionSnapshot): Promise<void> {
  try {
    await host.validate(session);
  } catch (error) {
    compatibilityError(error);
  }
}

async function prepare(
  slot: string,
  session: SessionSnapshot,
  origin: NonNullable<SaveHeaderInput['origin']>,
  deviceId: string,
  lineageId: string,
  source?: SaveHeader,
): Promise<PreparedSave> {
  const packed = await packSaveJson(
    asSaveJson(session),
    headerInput(slot, session, origin, deviceId, lineageId, source),
  );
  return { header: packed.header, session, bytes: packed.bytes };
}

async function decodeStored(
  save: StoredSave,
  host: SaveHost,
  deviceId: string,
  lineageId: string,
): Promise<PreparedSave> {
  let state: SaveJson;
  let source: SaveHeader | undefined;
  if (hasMagic(save.snapshot, [84, 83, 65, 86])) {
    const decoded = await unpackTsav(save.snapshot);
    state = decoded.state;
    source = decoded.header;
  } else {
    try {
      state = JSON.parse(
        new TextDecoder('utf-8', { fatal: true }).decode(save.snapshot),
      ) as SaveJson;
    } catch (error) {
      throw new Error(`SAVE_FILE_INVALID:${String(error)}`);
    }
  }
  const migrated = migrateSaveJson(state, {
    fromSchema: source?.saveSchema ?? save.meta.schemaVersion,
    targetSchema: SAVE_SCHEMA,
    fromContentHash: source?.contentHash ?? '0'.repeat(64),
    targetContentHash: source?.contentHash ?? '0'.repeat(64),
    migrations: STATE_MIGRATIONS,
    fixup: identityContentFixup,
  });
  const session = asSession(migrated.state);
  await validateSession(host, session);
  if (
    source &&
    migrated.applied.length === 0 &&
    !migrated.fixedContent &&
    source.slotId === save.slot
  ) {
    return { header: source, session, bytes: Uint8Array.from(save.snapshot) };
  }
  return prepare(
    save.slot,
    session,
    migrated.applied.length || migrated.fixedContent ? 'migration' : (source?.origin ?? 'play'),
    deviceId,
    lineageId,
    source,
  );
}

async function decodeLegacyTsui(bytes: Uint8Array): Promise<SaveJson> {
  if (bytes.length < 9 || !hasMagic(bytes, LEGACY_MAGIC)) throw new Error('SAVE_FILE_INVALID');
  const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(5, true);
  if (size === 0 || size > LEGACY_HEADER_LIMIT || 9 + size >= bytes.length)
    throw new Error('SAVE_FILE_INVALID');
  let header: Record<string, unknown>;
  try {
    header = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(9, 9 + size)),
    ) as Record<string, unknown>;
  } catch {
    throw new Error('SAVE_FILE_INVALID');
  }
  if (
    header['format'] !== 'tianshu-ui-slot' ||
    header['version'] !== 1 ||
    typeof header['hash'] !== 'string'
  )
    throw new StorageError(
      StorageErrorCode.UnsupportedVersion,
      'SAVE_VERSION_UNSUPPORTED',
    );
  const payload = bytes.slice(9 + size);
  if ((await sha256Hex(payload)) !== header['hash']) throw new Error('SAVE_HASH_MISMATCH');
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(payload)) as SaveJson;
  } catch {
    throw new Error('SAVE_FILE_INVALID');
  }
}

async function decodeImport(bytes: Uint8Array): Promise<{ state: SaveJson; header?: SaveHeader }> {
  if (hasMagic(bytes, [84, 83, 65, 86])) {
    const result = await unpackTsav(bytes);
    return { state: result.state, header: result.header };
  }
  if (hasMagic(bytes, [...LEGACY_MAGIC])) return { state: await decodeLegacyTsui(bytes) };
  if (hasMagic(bytes, [80, 75, 3, 4])) throw new Error('SAVE_ZIP_IMPORT_UNSUPPORTED');
  const result = await decodeJsonSave(bytes);
  return { state: result.state, header: result.header };
}

async function prepareImport(
  slot: string,
  decoded: { state: SaveJson; header?: SaveHeader },
  host: SaveHost,
  deviceId: string,
  lineageId: string,
): Promise<PreparedSave> {
  const migrated = migrateSaveJson(decoded.state, {
    fromSchema: decoded.header?.saveSchema ?? 1,
    targetSchema: SAVE_SCHEMA,
    fromContentHash: decoded.header?.contentHash ?? '0'.repeat(64),
    targetContentHash: decoded.header?.contentHash ?? '0'.repeat(64),
    migrations: STATE_MIGRATIONS,
    fixup: identityContentFixup,
  });
  const session = asSession(migrated.state);
  await validateSession(host, session);
  return prepare(slot, session, 'import', deviceId, lineageId, decoded.header);
}

export function createSaveService(storage: TianshuStorage, host: SaveHost) {
  let idsPromise: Promise<{ deviceId: string; lineageId: string }> | undefined;
  function ids() {
    return (idsPromise ??= (async () => {
      const storedDevice = await storage.settings.get<string>(DEVICE_ID_KEY);
      const storedLineage = await storage.settings.get<string>(LINEAGE_ID_KEY);
      const deviceId = storedDevice ?? randomId('dev_');
      const lineageId = storedLineage ?? randomId('ln_');
      if (!storedDevice) await storage.settings.set(DEVICE_ID_KEY, deviceId);
      if (!storedLineage) await storage.settings.set(LINEAGE_ID_KEY, lineageId);
      return { deviceId, lineageId };
    })());
  }
  function writable(slot: string): void {
    if (!/^save_manual_(0[1-9]|1[0-2])$/.test(slot) && slot !== 'save_quick')
      throw new Error('SAVE_SLOT_READONLY');
  }
  async function capture(
    slot: string,
    origin: NonNullable<SaveHeaderInput['origin']> = 'play',
    source?: SaveHeader,
  ) {
    const session = await host.snapshot();
    const identity = await ids();
    const value = await prepare(
      slot,
      session,
      origin,
      identity.deviceId,
      identity.lineageId,
      source,
    );
    return { ...value, meta: await metadata(value.bytes, value.header) };
  }
  async function checked(slot: string, generation?: number) {
    const identity = await ids();
    const decoded = new Map<number, PreparedSave>();
    const save = await storage.saves.load(slot, {
      ...(generation === undefined ? {} : { generation }),
      validate: async (candidate) => {
        decoded.set(
          candidate.generation,
          await decodeStored(candidate, host, identity.deviceId, identity.lineageId),
        );
      },
    });
    if (!save) throw new Error('SAVE_NOT_FOUND');
    return { save, decoded: decoded.get(save.generation)! };
  }
  return {
    list: () => storage.saves.listSlots(),
    history: (slot: string) => storage.saves.listHistory(slot),
    persistenceStatus: () => storage.persistence.status(),
    async save(slot: string) {
      writable(slot);
      const value = await capture(slot);
      return storage.saves.save(slot, value.bytes, value.meta);
    },
    async load(slot: string, generation?: number) {
      const result = await checked(slot, generation);
      await host.restore(result.decoded.session);
      return result.save.recovery;
    },
    async remove(slot: string) {
      await storage.saves.delete(slot);
    },
    async autosave(trigger: string, force = false) {
      // Resolve and persist local IDs before autosavePrepared enters the storage write queue.
      // Its lazy prepare callback must not enqueue settings writes on that same queue.
      await ids();
      return storage.saves.autosavePrepared(
        async (slot) => {
          const value = await capture(slot);
          return { snapshot: value.bytes, meta: value.meta };
        },
        { trigger, force },
      );
    },
    async exportSlot(slot: string, format: SaveExportFormat = 'tsav'): Promise<Uint8Array> {
      const value = await checked(slot);
      return format === 'tsav'
        ? value.decoded.bytes
        : await encodeJsonSave(value.decoded.header, asSaveJson(value.decoded.session));
    },
    async exportAll(): Promise<Uint8Array> {
      const slots = await storage.saves.listSlots();
      const entries: ZipEntry[] = [];
      const manifest: {
        format: string;
        version: number;
        exportedAt: string;
        saves: { slot: string; generation: number; path: string; sha256: string }[];
      } = {
        format: 'tianshu-save-archive',
        version: 1,
        exportedAt: new Date().toISOString(),
        saves: [],
      };
      for (const slot of slots) {
        for (const generation of await storage.saves.listHistory(slot.slot)) {
          const value = await checked(slot.slot, generation.generation);
          const path = `saves/${slot.slot}/${generation.generation}.tsav`;
          entries.push({ name: path, bytes: value.decoded.bytes });
          manifest.saves.push({
            slot: slot.slot,
            generation: generation.generation,
            path,
            sha256: await sha256Hex(value.decoded.bytes),
          });
        }
      }
      entries.unshift({
        name: 'manifest.json',
        bytes: new TextEncoder().encode(canonicalJson(manifest as unknown as JsonValue)),
      });
      entries.splice(1, 0, {
        name: 'README.txt',
        bytes: new TextEncoder().encode(
          '天书录本地存档导出；TSAV 已使用 gzip，ZIP 采用 store 模式。\n',
        ),
      });
      return encodeZip(entries);
    },
    async importSlot(slot: string, bytes: Uint8Array) {
      writable(slot);
      if (bytes.length === 0 || bytes.length > FILE_LIMIT) throw new Error('SAVE_FILE_INVALID');
      const localIds = await ids();
      const value = await prepareImport(
        slot,
        await decodeImport(bytes),
        host,
        localIds.deviceId,
        localIds.lineageId,
      );
      return storage.saves.save(slot, value.bytes, await metadata(value.bytes, value.header));
    },
    /** ZIP import is an explicit append-only recovery action; it never clears existing generations. */
    async importAll(bytes: Uint8Array): Promise<number> {
      const entries = decodeZip(bytes);
      const manifestEntry = entries.find((entry) => entry.name === 'manifest.json');
      if (!manifestEntry) throw new Error('SAVE_ZIP_MANIFEST_MISSING');
      let manifest: { format?: unknown; version?: unknown; saves?: unknown };
      try {
        manifest = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(manifestEntry.bytes),
        );
      } catch {
        throw new Error('SAVE_ZIP_MANIFEST_INVALID');
      }
      if (
        manifest.format !== 'tianshu-save-archive' ||
        manifest.version !== 1 ||
        !Array.isArray(manifest.saves)
      )
        throw new Error('SAVE_ZIP_MANIFEST_INVALID');
      const byName = new Map(entries.map((entry) => [entry.name, entry.bytes]));
      const localIds = await ids();
      const prepared: { slot: string; sourceGeneration: number; value: PreparedSave }[] = [];
      const identities = new Set<string>();
      const paths = new Set<string>();
      for (const item of manifest.saves) {
        if (!item || typeof item !== 'object') throw new Error('SAVE_ZIP_MANIFEST_INVALID');
        const { slot, generation, path, sha256 } = item as Record<string, unknown>;
        if (
          typeof slot !== 'string' ||
          !Number.isSafeInteger(generation) ||
          (generation as number) < 1 ||
          typeof path !== 'string' ||
          typeof sha256 !== 'string' ||
          !/^[0-9a-f]{64}$/.test(sha256) ||
          path !== `saves/${slot}/${generation as number}.tsav`
        )
          throw new Error('SAVE_ZIP_MANIFEST_INVALID');
        try { await storage.saves.listHistory(slot); }
        catch { throw new Error('SAVE_ZIP_MANIFEST_INVALID'); }
        const archiveKey = `${slot}\0${generation as number}`;
        if (identities.has(archiveKey) || paths.has(path))
          throw new Error('SAVE_ZIP_MANIFEST_INVALID');
        identities.add(archiveKey);
        paths.add(path);
        const payload = byName.get(path);
        if (!payload || (await sha256Hex(payload)) !== sha256)
          throw new Error('SAVE_HASH_MISMATCH');
        const decoded = await unpackTsav(payload);
        const value = await prepareImport(
          slot,
          decoded,
          host,
          localIds.deviceId,
          localIds.lineageId,
        );
        prepared.push({ slot, sourceGeneration: generation as number, value });
      }
      prepared.sort(
        (left, right) =>
          left.slot.localeCompare(right.slot) || left.sourceGeneration - right.sourceGeneration,
      );
      for (const { slot, value } of prepared) {
        await storage.saves.save(slot, value.bytes, await metadata(value.bytes, value.header));
      }
      return prepared.length;
    },
  };
}
