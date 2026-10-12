// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { SettingsStore } from '@tianshu/platform';
import { defaultGameSettings, loadGameSettings, normalizeGameSettings, saveGameSettings,
  UI_SETTINGS_KEY, updateGameSetting } from './settings';

describe('game settings', () => {
  it('uses the system reduced-motion preference for a first run', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    expect(defaultGameSettings().reducedMotion).toBe(true);
    expect(defaultGameSettings().minimapNorthUp).toBe(false);
    vi.unstubAllGlobals();
  });

  it('migrates legacy large text to 125% and persists v2', async () => {
    const set = vi.fn();
    const store = { get: vi.fn(async (key: string) => key === UI_SETTINGS_KEY ? null
      : { largeText: true, reducedMotion: false }), set, delete: vi.fn(), entries: vi.fn() };
    const result = await loadGameSettings(store as unknown as SettingsStore);
    expect(result).toMatchObject({ textScale: 125, reducedMotion: false, subtitles: true });
    expect(set).toHaveBeenCalledWith(UI_SETTINGS_KEY, expect.objectContaining({ textScale: 125 }));
  });

  it('reads, writes and defaults minimapNorthUp', async () => {
    expect(normalizeGameSettings({ minimapNorthUp: true }).minimapNorthUp).toBe(true);
    expect(normalizeGameSettings({ minimapNorthUp: 'north' }).minimapNorthUp).toBe(false);
    const changed = updateGameSetting(defaultGameSettings(), 'minimapNorthUp', true);
    expect(changed.minimapNorthUp).toBe(true);
    const set = vi.fn();
    await saveGameSettings({ set } as unknown as SettingsStore, changed);
    expect(set).toHaveBeenCalledWith(UI_SETTINGS_KEY, expect.objectContaining({ minimapNorthUp: true }));
  });
});
