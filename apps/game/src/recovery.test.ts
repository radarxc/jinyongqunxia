// @vitest-environment happy-dom
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIndexedDbStorage, sha256Hex } from '@tianshu/platform';
import { exportStoredSaves, loadNewestAutosave, newestAutosave, prepareStartup,
  recoveredMessage, recoveryReason } from './recovery';
import { UI_SETTINGS_KEY } from './settings';

afterEach(() => { vi.unstubAllGlobals(); });
describe('startup and recovery helpers', () => {
  it('opens storage and settings before exposing the title state', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const startup = await prepareStartup('tianshu-startup-test');
    expect(startup.error).toBeUndefined(); expect(startup.saves).toEqual([]);
    expect(await startup.storage!.settings.get(UI_SETTINGS_KEY)).toMatchObject({ textScale: 100 });
    await startup.storage!.close();
  });

  it('selects the newest auto slot and formats the recovery notice', () => {
    const row = (slot: string, savedAt: number) => ({ slot, savedAt, generation: 1, byteLength: 1,
      meta: { worldId: 'ch00_yuenv', gameTime: 0, version: 'tsav.v1', schemaVersion: 2,
        hash: '0'.repeat(64), summary: {} } });
    const latest = newestAutosave([row('save_auto_1', 1_000), row('save_manual_01', 4_000),
      row('save_auto_2', 3_000)]);
    expect(latest).toMatchObject({ slot: 'save_auto_2', savedAt: 3_000 });
    expect(recoveredMessage(3_000)).toMatch(/^已从 .* 的自动存档恢复$/);
    expect(recoveryReason(new Error('CORE_WORKER_FAILED'))).toContain('核心进程');
  });

  it('keeps recovery actions available when listing auto saves fails', async () => {
    const storage = { saves: { listSlots: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')) } };
    await expect(loadNewestAutosave(storage as never)).resolves.toBeUndefined();
  });

  it('exports stored generations without a live game host', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const storage = await createIndexedDbStorage({ databaseName: 'tianshu-recovery-export',
      storageManager: null });
    const bytes = Uint8Array.of(84, 83, 65, 86, 1);
    await storage.saves.save('save_auto_1', bytes, { worldId: 'ch00_yuenv', gameTime: 1,
      version: 'tsav.v1', schemaVersion: 2, hash: await sha256Hex(bytes),
      summary: { name: '沈砚', location: '竹林', date: '2026-10-03T00:00:00Z' } });
    const archive = await exportStoredSaves(storage);
    expect(Array.from(archive.slice(0, 4))).toEqual([80, 75, 3, 4]);
    await storage.close();
  });
});
