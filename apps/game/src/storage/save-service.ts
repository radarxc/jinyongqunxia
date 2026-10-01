import { sha256Hex, type SaveMetadata, type TianshuStorage } from '@tianshu/platform';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { SessionSnapshot } from '../runtime/contracts';

export interface SaveHost {
  snapshot(): Promise<SessionSnapshot>;
  validate(snapshot: SessionSnapshot): Promise<void>;
  restore(snapshot: SessionSnapshot): Promise<unknown>;
}
const HEADER_LIMIT = 16 * 1024;
const SNAPSHOT_LIMIT = 32 * 1024 * 1024;
const MAGIC = new Uint8Array([84, 83, 85, 73, 1]);

export function createSaveService(storage: TianshuStorage, host: SaveHost) {
  async function metadata(snapshot: Uint8Array, session: SessionSnapshot): Promise<SaveMetadata> {
    const clock = session.state.chapter.clock;
    return { worldId: session.state.chapter.chapterId, gameTime: session.state.meta.worldTick,
      version: 'ui-session.v1', schemaVersion: 1, hash: await sha256Hex(snapshot),
      summary: { name: '无名侠客', location: session.location, preview: session.preview,
        date: `${session.state.chapter.worldYear}年 ${clock.monthIndex % 12 + 1}月 ${clock.dayIndex % 30 + 1}日` } };
  }
  async function capture() {
    const session = await host.snapshot();
    const snapshot = new TextEncoder().encode(canonicalJson(session as unknown as JsonValue));
    if (snapshot.byteLength > SNAPSHOT_LIMIT) throw new Error('SAVE_TOO_LARGE');
    return { snapshot, meta: await metadata(snapshot, session) };
  }
  function decode(snapshot: Uint8Array): SessionSnapshot {
    if (snapshot.byteLength > SNAPSHOT_LIMIT) throw new Error('SAVE_TOO_LARGE');
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(snapshot)) as SessionSnapshot;
  }
  function writable(slot: string): void {
    if (!/^save_manual_(0[1-9]|1[0-2])$/.test(slot) && slot !== 'save_quick') throw new Error('SAVE_SLOT_READONLY');
  }
  return {
    list: () => storage.saves.listSlots(),
    async save(slot: string) {
      writable(slot); const payload = await capture();
      return storage.saves.save(slot, payload.snapshot, payload.meta);
    },
    async load(slot: string) {
      if (!/^save_(manual_(0[1-9]|1[0-2])|quick|auto_[1-3])$/.test(slot)) throw new Error('SAVE_SLOT_READONLY');
      const stored = await storage.saves.load(slot);
      if (!stored) throw new Error('SAVE_NOT_FOUND');
      if (stored.meta.version !== 'ui-session.v1') throw new Error('SAVE_VERSION_UNSUPPORTED');
      return host.restore(decode(stored.snapshot));
    },
    async remove(slot: string) {
      if (!/^save_(manual_(0[1-9]|1[0-2])|quick|auto_[1-3])$/.test(slot)) throw new Error('SAVE_SLOT_READONLY');
      await storage.saves.delete(slot);
    },
    async autosave(trigger: string, force = false) {
      const payload = await capture();
      return storage.saves.autosave(payload.snapshot, payload.meta, { trigger, force });
    },
    async exportSlot(slot: string): Promise<Uint8Array> {
      const saved = await storage.saves.load(slot);
      if (!saved) throw new Error('SAVE_NOT_FOUND');
      const header = new TextEncoder().encode(JSON.stringify({ format: 'tianshu-ui-slot', version: 1, hash: saved.meta.hash }));
      if (header.byteLength > HEADER_LIMIT) throw new Error('SAVE_HEADER_TOO_LARGE');
      const output = new Uint8Array(9 + header.byteLength + saved.snapshot.byteLength);
      output.set(MAGIC); new DataView(output.buffer).setUint32(5, header.byteLength, true);
      output.set(header, 9); output.set(saved.snapshot, 9 + header.byteLength);
      return output;
    },
    async importSlot(slot: string, bytes: Uint8Array) {
      writable(slot);
      if (bytes.length < 9 || bytes.length > SNAPSHOT_LIMIT + HEADER_LIMIT + 9 || MAGIC.some((byte, index) => bytes[index] !== byte))
        throw new Error('SAVE_FILE_INVALID');
      const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(5, true);
      if (size > HEADER_LIMIT || size + 9 >= bytes.length) throw new Error('SAVE_FILE_INVALID');
      const header = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.slice(9, 9 + size))) as Record<string, unknown>;
      if (header['format'] !== 'tianshu-ui-slot' || header['version'] !== 1) throw new Error('SAVE_VERSION_UNSUPPORTED');
      const snapshot = bytes.slice(9 + size);
      if (await sha256Hex(snapshot) !== header['hash']) throw new Error('SAVE_HASH_MISMATCH');
      const session = decode(snapshot); await host.validate(session);
      return storage.saves.save(slot, snapshot, await metadata(snapshot, session));
    },
  };
}
