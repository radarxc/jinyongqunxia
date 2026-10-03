import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { createIndexedDbStorage, encodeZip, sha256Hex, type SaveSlotSummary,
  type TianshuStorage, type ZipEntry } from '@tianshu/platform';
import { defaultGameSettings, loadGameSettings, type GameSettings } from './settings';
import { autosaveLabel, flowT, recoveredAutosaveText } from '@tianshu/ui/runtime';

export interface RecoverySave { readonly slot: string; readonly savedAt: number; readonly label: string }
export interface StartupState {
  readonly storage?: TianshuStorage; readonly settings: GameSettings;
  readonly saves: readonly SaveSlotSummary[]; readonly error?: unknown;
}

export async function prepareStartup(databaseName = 'tianshu'): Promise<StartupState> {
  try {
    const storage = await createIndexedDbStorage({ databaseName });
    const [settings, saves] = await Promise.all([loadGameSettings(storage.settings), storage.saves.listSlots()]);
    return { storage, settings, saves };
  } catch (error) {
    return { settings: defaultGameSettings(), saves: [], error };
  }
}

export function newestReadableSave(saves: readonly SaveSlotSummary[]): SaveSlotSummary | undefined {
  return [...saves].sort((left, right) => right.savedAt - left.savedAt)[0];
}

export function newestAutosave(saves: readonly SaveSlotSummary[]): RecoverySave | undefined {
  const save = newestReadableSave(saves.filter((row) => /^save_auto_[123]$/.test(row.slot)));
  return save ? { slot: save.slot, savedAt: save.savedAt,
    label: autosaveLabel(save.slot, save.savedAt) } : undefined;
}

export async function loadNewestAutosave(
  storage: Pick<TianshuStorage, 'saves'> | undefined,
): Promise<RecoverySave | undefined> {
  if (!storage) return undefined;
  try { return newestAutosave(await storage.saves.listSlots()); }
  catch { return undefined; }
}

export const recoveredMessage = recoveredAutosaveText;

/** Exports existing bytes without asking a failed Worker to validate or snapshot. */
export async function exportStoredSaves(storage: TianshuStorage): Promise<Uint8Array> {
  const entries: ZipEntry[] = [];
  const saves: { slot: string; generation: number; path: string; sha256: string }[] = [];
  for (const slot of await storage.saves.listSlots()) {
    for (const generation of await storage.saves.listHistory(slot.slot)) {
      const stored = await storage.saves.load(slot.slot, { generation: generation.generation });
      if (!stored) continue;
      const path = `saves/${slot.slot}/${generation.generation}.tsav`;
      entries.push({ name: path, bytes: stored.snapshot });
      saves.push({ slot: slot.slot, generation: generation.generation, path,
        sha256: await sha256Hex(stored.snapshot) });
    }
  }
  const manifest = { format: 'tianshu-save-archive', version: 1,
    exportedAt: new Date().toISOString(), saves };
  entries.unshift({ name: 'manifest.json',
    bytes: new TextEncoder().encode(canonicalJson(manifest as unknown as JsonValue)) });
  entries.splice(1, 0, { name: 'README.txt', bytes: new TextEncoder().encode(
    '天书录故障恢复导出；未清除或改写 IndexedDB 中的任何存档。\n') });
  return encodeZip(entries);
}

export function recoveryReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('CORE_CALL_TIMEOUT')) return flowT('coreTimeout');
  if (message.includes('CORE_WORKER_FAILED')) return flowT('coreFailed');
  if (message.includes('HOST_DISPOSED')) return flowT('hostDisposed');
  if (message.includes('IndexedDB') || message.includes('STORAGE')) return flowT('storageFailed');
  return flowT('internalFailure');
}
