import { evalBrowser, ensureInstrumentalMode, setSoundPrompt, clickGenerate, getSessionStatus } from './flowmusic_driver.mjs';

const TRACKS = [
  {
    id: 'yuenvjian',
    title: '越女剑 - 金庸群侠传复古风',
    prompt: 'Retro 90s Wuxia RPG Soundtrack, Traditional Chinese Folk Instrumental, poetic pastoral nostalgic gentle melancholy with hidden martial agility, 84 BPM, clear airy Dizi bamboo flute playing nostalgic lead melody, acoustic Guzheng arpeggios, soft Pipa pluck accents, warm Erhu pads, gentle wooden temple blocks and light chime percussion, pristine acoustic soundstage, warm vintage reverb, pure instrumental no vocals.'
  },
  {
    id: 'tianlong_tvb',
    title: '天龙八部 - 港版主题曲风（难念的经）',
    prompt: 'Fast-Paced Hong Kong Wuxia Pop-Orchestral Instrumental, intense breathless turbulent fatalistic fiery chivalric passion, 136 BPM driving syncopated rhythm, hyper-fast rapid Dizi runs, aggressive tremolo Pipa, galloping Chinese war drums Tanggu, dramatic Erhu section, clashing bronze cymbals, punchy transient drums, wide dynamic stereo field, pure instrumental no vocals.'
  },
  {
    id: 'tianlong_qiaofeng',
    title: '天龙八部 - 乔峰出场/战神BGM',
    prompt: 'Heroic Epic Chinese Cinematic War Theme, majestic grand overwhelmingly heroic deeply tragic, 92 BPM marching martial tempo, resonant triumphant Suona lead, heavy booming Chinese ceremonial war drums Tanggu, soaring cinematic string ensemble, weeping solo Erhu, bronze gongs, deep bass resonance, pure instrumental no vocals.'
  },
  {
    id: 'tianlong_cctv',
    title: '天龙八部 - 央视版主题曲风（宽恕）',
    prompt: 'Atmospheric Northern Chinese Folk Symphony, Ethereal Wuxia Ballad, vast melancholic ethereal philosophical sweeping and sorrowful, 72 BPM slow expansive flow, ethereal Dongxiao vertical bamboo flute, deep earthy Xun ancient clay ocarina, sweeping string orchestra, solitary Guzheng glissandos, soulful Erhu, subtle timpani, lush cinematic reverb, pure instrumental no vocals.'
  },
  {
    id: 'shediao_tvb',
    title: '射雕英雄传 - 港版主题曲风（铁血丹心）',
    prompt: 'Classic 80s Hong Kong Wuxia Action Soundtrack, grand spirited romantic triumphant adventurous, 120 BPM bold marching pulse, soaring dual Dizi bamboo flute, heroic brass fanfare, rolling Chinese timpani and cymbals, rhythmic Pipa strumming, warm analog strings, pure instrumental no vocals.'
  },
  {
    id: 'shediao_xianglong',
    title: '射雕英雄传 - 降龙十八掌战斗BGM',
    prompt: 'High-Tension Chinese Martial Arts Combat Cue, explosive unstoppable adrenaline-fueled triumphant thunderous, 144 BPM fast galloping combat cadence, blazing energetic Suona, frantic Tanggu war drums, sharp clashing Chinese gongs, rapid Yangqin hammered dulcimer tremolos, aggressive Erhu riffs, pure instrumental no vocals.'
  },
  {
    id: 'shediao_cctv',
    title: '射雕英雄传 - 央视版主题曲风（天地都在我心中）',
    prompt: 'Epic Northern Steppes Wuxia Symphony, boundless rugged primordial fiercely proud majestic, 88 BPM heavy marching stomp, Morin Khuur horsehead fiddle, deep Dizi flute, giant thunderous ceremonial drums, throat-singing undertones, heroic brass section, sweeping bowed strings, cavernous cinematic depth, pure instrumental no vocals.'
  },
  {
    id: 'shendiao_tvb_duet',
    title: '神雕侠侣 - 港版双笛情话（神话情话）',
    prompt: 'Romantic Fast-Paced Wuxia Anthem Instrumental, passionate bittersweet dramatic soaring relentless devotion, 128 BPM driving emotional pulse, twin intertwined Dizi flutes playing rapid counter-melodies, rolling Pipa, sweeping romantic string section, driving acoustic rhythm, Chinese woodblocks, pure instrumental no vocals.'
  },
  {
    id: 'shendiao_cliff',
    title: '神雕侠侣 - 绝情谷断肠崖思念',
    prompt: 'Melancholic Chinese Chamber Music, Solitary Wuxia Ballad, heartbreaking desolate tender sorrowful yearning, 68 BPM slow Rubato phrasing, weeping Erhu solo, solitary Guqin seven-string zither harmonics, melancholic Dongxiao, delicate Guzheng drops, subtle ambient silk string bed, pure instrumental no vocals.'
  },
  {
    id: 'yitian_ma',
    title: '倚天屠龙记 - 马景涛版（刀剑如梦风）',
    prompt: 'Taiwan 90s Folk-Pop Wuxia Instrumental, carefree spirited swaggering romantic swashbuckling, 124 BPM bouncy shuffle-wuxia beat, catchy melodic Dizi, rapid rhythmic Pipa, acoustic guitar strumming, punchy live drum kit, bright Guzheng accents, energetic Erhu fills, pure instrumental no vocals.'
  },
  {
    id: 'yitian_su',
    title: '倚天屠龙记 - 苏有朋版（风起云涌风）',
    prompt: 'Dramatic Martial Arts Ballad Orchestral, conflicted passionate majestic emotionally charged, 96 BPM steady emotional march, soaring lead Erhu, rich Dizi flute, dramatic orchestral strings, thundering Tanggu drums, delicate Pipa breakdowns, acoustic bass, pure instrumental no vocals.'
  },
  {
    id: 'xiaoao_tvb',
    title: '笑傲江湖 - 港版逍遥游（活得潇洒风）',
    prompt: 'Breezy Pastoral Wuxia Instrumental, carefree uplifting serene easygoing detached from worldly struggles, 104 BPM relaxed walking tempo, bright agile Dizi bamboo flute, playful plucked Pipa, light wooden temple blocks, sweet Guzheng chords, warm gentle acoustic rhythm, pure instrumental no vocals.'
  },
  {
    id: 'xiaoao_game_duet',
    title: '笑傲江湖 - 琴箫和鸣游戏原声',
    prompt: 'Pure Traditional Chinese Scholar Duo Qin-Xiao Duet, Zen refined tranquil ethereal spiritually profound, 60 BPM free Rubato tempo, deep ancient Guqin seven-string zither with overtone harmonics, breathy vertical Dongxiao flute, natural ambient outdoor bamboo forest birds, pure acoustic minimalist capture, pure instrumental no vocals.'
  },
  {
    id: 'xiaoao_canghai',
    title: '笑傲江湖 - 沧海一声笑传奇风',
    prompt: 'Iconic Pentatonic Chinese Wuxia Anthem, grand roaring unrestrained legendary laughing at fate, 92 BPM steady powerful rolling rhythm, heavy Guqin and Guzheng sweeping glissandos, bold piercing Dizi, thunderous Chinese ceremonial drums, clashing cymbals, wall of sound ancient folk energy, pure instrumental no vocals.'
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inspectPage() {
  const info = await evalBrowser(`(() => {
    const toggle = document.querySelector('button[aria-label="Toggle instrumental mode"]');
    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Generate');
    const soundTa = Array.from(document.querySelectorAll('textarea')).find(t => {
      const p = t.closest('div');
      return p && p.parentElement && p.parentElement.innerText.includes('Describe the sound');
    });

    return {
      toggleOuter: toggle ? toggle.outerHTML : null,
      genBtnFound: !!genBtn,
      genBtnDisabled: genBtn ? genBtn.disabled : null,
      soundTaFound: !!soundTa
    };
  })()`);
  console.log('Inspect Page:', info);
}

async function testPrompt() {
  await inspectPage();
  const track = TRACKS[0];
  console.log(`Setting prompt for: ${track.title}`);

  const setRes = await setSoundPrompt(track.prompt);
  console.log('Set Sound Prompt result:', setRes);

  await sleep(1000);

  // Check state again
  await inspectPage();
}

testPrompt().catch(console.error);
