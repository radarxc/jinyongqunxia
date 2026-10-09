import {
  type TrackMeta,
  type SoundCueMeta,
  NOVEL_MUSIC_TRACKS,
  SOUND_EFFECT_CUES,
  getTracksByBook,
  normalizeBookName,
  resolveMoveSfx,
  resolveItemSfx,
  getSfxByNovel,
} from './manifest';
import type { AudioPort } from './index';

export type AudioCategory = 'master' | 'music' | 'effects' | 'voice';

export interface AudioSettingsPort {
  setVolume(category: AudioCategory, value: number): void;
}

export class AudioManager implements AudioPort, AudioSettingsPort {
  private masterVolume = 0.8;
  private musicVolume = 0.8;
  private effectsVolume = 0.8;
  private voiceVolume = 0.8;

  private currentAudio: HTMLAudioElement | null = null;
  private currentTrack: TrackMeta | null = null;
  private currentBook: string | null = null;
  private unlocked = false;

  private readonly sfxAudioCache = new Map<string, HTMLAudioElement>();

  constructor() {
    // Pre-cache SFX cues for instant zero-latency playback
    if (typeof Audio !== 'undefined') {
      for (const cue of SOUND_EFFECT_CUES) {
        try {
          const a = new Audio(cue.file);
          a.preload = 'auto';
          this.sfxAudioCache.set(cue.cue, a);
        } catch {
          // Headless or restricted environment
        }
      }
    }
  }

  public async unlock(): Promise<void> {
    if (this.unlocked) return;
    this.unlocked = true;

    if (typeof Audio !== 'undefined') {
      try {
        const dummy = new Audio();
        dummy.volume = 0;
        await dummy.play().catch(() => {});
      } catch {
        // Ignored
      }
    }
  }

  public setVolume(category: AudioCategory, value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    switch (category) {
      case 'master':
        this.masterVolume = clamped;
        this.updateMusicVolume();
        break;
      case 'music':
        this.musicVolume = clamped;
        this.updateMusicVolume();
        break;
      case 'effects':
        this.effectsVolume = clamped;
        break;
      case 'voice':
        this.voiceVolume = clamped;
        break;
    }
  }

  public getVolume(category: AudioCategory): number {
    switch (category) {
      case 'master':
        return this.masterVolume;
      case 'music':
        return this.musicVolume;
      case 'effects':
        return this.effectsVolume;
      case 'voice':
        return this.voiceVolume;
    }
  }

  private updateMusicVolume(): void {
    if (this.currentAudio) {
      this.currentAudio.volume = this.masterVolume * this.musicVolume;
    }
  }

  /**
   * 根据书目（如 '天龙八部', 'ch01', '笑傲江湖' 等）随机播放对应的专属配乐
   * 当曲目播放完毕后，会自动从该书目中继续随机播放下一首（自动避免单曲重复）
   */
  public playRandomByBook(bookNameOrId: string): TrackMeta | undefined {
    const canonicalBook = normalizeBookName(bookNameOrId);
    let tracks = getTracksByBook(canonicalBook);
    if (tracks.length === 0) {
      tracks = NOVEL_MUSIC_TRACKS;
    }

    let selected: TrackMeta;
    if (tracks.length === 1) {
      selected = tracks[0]!;
    } else {
      // Pick random track, avoid immediate repeating if multiple exist
      const available = tracks.filter(t => t.id !== this.currentTrack?.id);
      const pool = available.length > 0 ? available : tracks;
      const idx = Math.floor(Math.random() * pool.length);
      selected = pool[idx]!;
    }

    this.currentBook = canonicalBook;
    this.playTrack(selected);
    return selected;
  }

  /**
   * 播放指定的音乐 Track
   */
  public playTrack(track: TrackMeta): void {
    this.currentTrack = track;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }

    if (typeof Audio === 'undefined') return;

    try {
      const audio = new Audio(track.file);
      audio.volume = this.masterVolume * this.musicVolume;
      audio.loop = false;

      audio.onended = () => {
        if (this.currentBook) {
          this.playRandomByBook(this.currentBook);
        }
      };

      audio.onerror = (e) => {
        console.warn(`[AudioManager] Failed to load audio for ${track.title} (${track.file}):`, e);
      };

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn(`[AudioManager] Autoplay deferred until user interaction: ${err.message}`);
        });
      }

      this.currentAudio = audio;
    } catch (e) {
      console.warn(`[AudioManager] Audio initialization error:`, e);
    }
  }

  /**
   * 停止当前正在播放的背景音乐
   */
  public stopMusic(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onended = null;
      this.currentAudio = null;
    }
    this.currentTrack = null;
  }

  /**
   * 播放音效（剑招、刀劈、暗器、喝药、吃饭等）
   */
  public playSfx(cue: string): void {
    const sfxMeta = SOUND_EFFECT_CUES.find(s => s.cue === cue);
    if (!sfxMeta) {
      console.warn(`[AudioManager] Unknown SFX cue: ${cue}`);
      return;
    }

    const volume = this.masterVolume * this.effectsVolume;
    if (volume <= 0.001) return;
    if (typeof Audio === 'undefined') return;

    try {
      const audio = new Audio(sfxMeta.file);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {
      // Fallback
    }
  }

  /**
   * 依据技能标识/武学名称自动播放对应的专属音效
   */
  public playSkillSfx(skillIdOrName: string, fallbackCue = 'sword_swing'): string {
    const cue = resolveMoveSfx(skillIdOrName) || fallbackCue;
    this.playSfx(cue);
    return cue;
  }

  /**
   * 依据物品ID/类别自动播放对应的道具使用音效（丹药、进食、研读翻书等）
   */
  public playItemSfx(itemId: string): string {
    const cue = resolveItemSfx(itemId);
    this.playSfx(cue);
    return cue;
  }

  /**
   * 随机播放指定小说的专属标志性招式/场景音效
   */
  public playNovelSfx(bookOrChapter: string): SoundCueMeta | undefined {
    const list = getSfxByNovel(bookOrChapter);
    if (list.length === 0) return undefined;
    const picked = list[Math.floor(Math.random() * list.length)];
    if (!picked) return undefined;
    this.playSfx(picked.cue);
    return picked;
  }

  // AudioPort implementation
  public play(cue: string): void {
    const isSfx = SOUND_EFFECT_CUES.some(s => s.cue === cue);
    if (isSfx) {
      this.playSfx(cue);
      return;
    }

    const isTrack = NOVEL_MUSIC_TRACKS.find(t => t.id === cue);
    if (isTrack) {
      this.playTrack(isTrack);
      return;
    }

    this.playRandomByBook(cue);
  }

  public stop(cue?: string): void {
    if (!cue || cue === 'music' || cue === this.currentTrack?.id || cue === this.currentBook) {
      this.stopMusic();
    }
  }

  public getCurrentTrack(): TrackMeta | null {
    return this.currentTrack;
  }

  public getCurrentBook(): string | null {
    return this.currentBook;
  }

  public isMusicPlaying(): boolean {
    return !!this.currentAudio && !this.currentAudio.paused;
  }
}

export const defaultAudioManager = new AudioManager();
