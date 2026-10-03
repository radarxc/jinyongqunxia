import type { SettingsStore, SettingValue } from '@tianshu/platform';

export const UI_SETTINGS_KEY = 'ui.settings.v2';
export const LEGACY_ACCESSIBILITY_KEY = 'ui.accessibility';
export type TextScale = 100 | 125 | 150;
export type AudioCategory = 'master' | 'music' | 'effects' | 'voice';
export type QualityPreference = 'auto' | 'low' | 'mid' | 'high' | 'ultra';
export type DifficultyPreference = 'diff_jianghu' | 'diff_xiake' | 'diff_zongshi';
export type GameSettingKey = keyof GameSettings | AudioCategory;

export interface GameSettings {
  readonly textScale: TextScale;
  readonly reducedMotion: boolean;
  readonly subtitles: boolean;
  readonly volume: Readonly<Record<AudioCategory, number>>;
  readonly quality: QualityPreference;
  readonly difficulty: DifficultyPreference;
}

export interface AudioSettingsPort {
  setVolume(category: AudioCategory, value: number): void;
}

export const silentAudioSettingsPort: AudioSettingsPort = { setVolume: () => undefined };

function systemReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function defaultGameSettings(): GameSettings {
  return { textScale: 100, reducedMotion: systemReducedMotion(), subtitles: true,
    volume: { master: 100, music: 80, effects: 80, voice: 80 },
    quality: 'auto', difficulty: 'diff_jianghu' };
}

const scales = new Set<TextScale>([100, 125, 150]);
const qualities = new Set<QualityPreference>(['auto', 'low', 'mid', 'high', 'ultra']);
const difficulties = new Set<DifficultyPreference>(['diff_jianghu', 'diff_xiake', 'diff_zongshi']);
function volume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value))) : fallback;
}

export function normalizeGameSettings(value: unknown, fallback = defaultGameSettings()): GameSettings {
  const row = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const audio = row['volume'] && typeof row['volume'] === 'object'
    ? row['volume'] as Record<string, unknown> : {};
  return {
    textScale: scales.has(row['textScale'] as TextScale) ? row['textScale'] as TextScale : fallback.textScale,
    reducedMotion: typeof row['reducedMotion'] === 'boolean' ? row['reducedMotion'] : fallback.reducedMotion,
    subtitles: typeof row['subtitles'] === 'boolean' ? row['subtitles'] : fallback.subtitles,
    volume: { master: volume(audio['master'], fallback.volume.master),
      music: volume(audio['music'], fallback.volume.music),
      effects: volume(audio['effects'], fallback.volume.effects),
      voice: volume(audio['voice'], fallback.volume.voice) },
    quality: qualities.has(row['quality'] as QualityPreference)
      ? row['quality'] as QualityPreference : fallback.quality,
    difficulty: difficulties.has(row['difficulty'] as DifficultyPreference)
      ? row['difficulty'] as DifficultyPreference : fallback.difficulty,
  };
}

export async function loadGameSettings(store: SettingsStore): Promise<GameSettings> {
  const current = await store.get(UI_SETTINGS_KEY);
  if (current) return normalizeGameSettings(current);
  const legacy = await store.get<{ readonly largeText?: boolean; readonly reducedMotion?: boolean }>(
    LEGACY_ACCESSIBILITY_KEY);
  const fallback = defaultGameSettings();
  const migrated = normalizeGameSettings(legacy ? {
    textScale: legacy.largeText === true ? 125 : 100,
    reducedMotion: typeof legacy.reducedMotion === 'boolean' ? legacy.reducedMotion : fallback.reducedMotion,
  } : fallback, fallback);
  await store.set(UI_SETTINGS_KEY, migrated as unknown as SettingValue);
  return migrated;
}

export function saveGameSettings(store: SettingsStore, settings: GameSettings): Promise<void> {
  return store.set(UI_SETTINGS_KEY, settings as unknown as SettingValue);
}

export function updateGameSetting(
  settings: GameSettings, key: GameSettingKey, value: unknown,
): GameSettings {
  if (key === 'master' || key === 'music' || key === 'effects' || key === 'voice')
    return normalizeGameSettings({ ...settings, volume: { ...settings.volume, [key]: value } }, settings);
  return normalizeGameSettings({ ...settings, [key]: value }, settings);
}
