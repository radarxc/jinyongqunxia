// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { SettingsStore } from '@tianshu/platform';
import { defaultGameSettings, loadGameSettings, UI_SETTINGS_KEY } from './settings';

describe('game settings', () => {
  it('uses the system reduced-motion preference for a first run', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    expect(defaultGameSettings().reducedMotion).toBe(true);
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
});
