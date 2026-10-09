import { describe, it, expect, vi } from 'vitest';
import {
  AudioManager,
  normalizeBookName,
  getTracksByBook,
  SOUND_EFFECT_CUES,
  resolveMoveSfx,
  resolveItemSfx,
  getSfxByNovel,
} from './index';

describe('AudioManager & Novel Music Manifest', () => {
  it('normalizes novel aliases and chapter codes correctly', () => {
    expect(normalizeBookName('天龙八部')).toBe('天龙八部');
    expect(normalizeBookName('ch01')).toBe('天龙八部');
    expect(normalizeBookName('天龙')).toBe('天龙八部');
    expect(normalizeBookName('ch05')).toBe('笑傲江湖');
    expect(normalizeBookName('笑傲')).toBe('笑傲江湖');
    expect(normalizeBookName('越女剑')).toBe('越女剑');
    expect(normalizeBookName('ch00')).toBe('越女剑');
    expect(normalizeBookName('ch08')).toBe('鹿鼎记');
    expect(normalizeBookName('鹿鼎记')).toBe('鹿鼎记');
  });

  it('retrieves tracks by book name', () => {
    const tlTracks = getTracksByBook('天龙八部');
    expect(tlTracks.length).toBe(3);
    expect(tlTracks.map(t => t.title)).toContain('天龙八部 - 港版主题曲风（难念的经）');
    expect(tlTracks.map(t => t.title)).toContain('天龙八部 - 乔峰出场/战神BGM');
    expect(tlTracks.map(t => t.title)).toContain('天龙八部 - 央视版主题曲风（宽恕）');

    const xaTracks = getTracksByBook('ch05');
    expect(xaTracks.length).toBe(3);
    expect(xaTracks.map(t => t.title)).toContain('笑傲江湖 - 沧海一声笑传奇风');

    const sdTracks = getTracksByBook('射雕英雄传');
    expect(sdTracks.length).toBe(3);

    const sdiaotracks = getTracksByBook('神雕侠侣');
    expect(sdiaotracks.length).toBe(2);

    const yitianTracks = getTracksByBook('倚天屠龙记');
    expect(yitianTracks.length).toBe(2);
  });

  it('includes all sound effect cues for martial arts and daily life', () => {
    const cues = SOUND_EFFECT_CUES.map(s => s.cue);
    expect(cues).toContain('sword_swing');
    expect(cues).toContain('sword_clash');
    expect(cues).toContain('sword_pierce');
    expect(cues).toContain('saber_slash');
    expect(cues).toContain('saber_cleave');
    expect(cues).toContain('dart_throw');
    expect(cues).toContain('dart_hit');
    expect(cues).toContain('drink_potion');
    expect(cues).toContain('eating_food');
  });

  it('plays random track by book and sets volume', () => {
    const manager = new AudioManager();
    manager.setVolume('master', 0.5);
    manager.setVolume('music', 0.8);
    manager.setVolume('effects', 0.9);

    expect(manager.getVolume('master')).toBe(0.5);
    expect(manager.getVolume('music')).toBe(0.8);
    expect(manager.getVolume('effects')).toBe(0.9);

    // Mock HTMLAudioElement
    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    globalThis.Audio = vi.fn().mockImplementation(function() {
      return {
        play: playMock,
        pause: pauseMock,
        volume: 1,
        loop: false,
        onended: null,
        onerror: null,
      };
    }) as unknown as typeof Audio;

    const playedTrack = manager.playRandomByBook('天龙八部');
    expect(playedTrack).toBeDefined();
    expect(playedTrack?.book).toBe('天龙八部');
    expect(manager.getCurrentBook()).toBe('天龙八部');
    expect(manager.getCurrentTrack()).toBe(playedTrack);

    // Stop music
    manager.stopMusic();
    expect(manager.getCurrentTrack()).toBeNull();
  });

  it('correctly maps moves and items to novel sound effects', () => {
    expect(resolveMoveSfx('liumai_shangyang')).toBe('ch01_liumai_laser');
    expect(resolveMoveSfx('xianglong18_kanglong')).toBe('ch02_xianglong_dragon');
    expect(resolveMoveSfx('dagou_chuo')).toBe('ch02_dagou_stick');
    expect(resolveMoveSfx('xuantie_chao')).toBe('ch03_xuantie_heavy');
    expect(resolveMoveSfx('bixie_cici')).toBe('ch05_bixie_fast');
    expect(resolveMoveSfx('hujiadao_pikan')).toBe('ch11_hujia_saber');

    expect(resolveItemSfx('it_miji_beiming')).toBe('book_flip');
    expect(resolveItemSfx('it_jinchuangyao')).toBe('drink_potion');
    expect(resolveItemSfx('it_food_liangbing')).toBe('eating_food');

    const tlSfx = getSfxByNovel('天龙八部');
    expect(tlSfx.length).toBeGreaterThanOrEqual(3);
    expect(tlSfx.map(s => s.cue)).toContain('ch01_liumai_laser');

    const manager = new AudioManager();
    const playedMoveSfx = manager.playSkillSfx('liumai_shaoze');
    expect(playedMoveSfx).toBe('ch01_liumai_laser');

    const playedItemSfx = manager.playItemSfx('it_miji_xisuijing');
    expect(playedItemSfx).toBe('book_flip');

    const playedNovelSfx = manager.playNovelSfx('倚天屠龙记');
    expect(playedNovelSfx).toBeDefined();
    expect(playedNovelSfx?.book).toBe('倚天屠龙记');
  });
});
