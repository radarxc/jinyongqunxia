import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_ID = 'C1976DBB88D699139A5AE6B63D1F5DEF';
const OUT_DIR = path.resolve('assets/music');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function evalBrowser(expression) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      targetId: TARGET_ID,
      expression,
    });
    const req = http.request('http://127.0.0.1:9223/eval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.ok) return reject(new Error(JSON.stringify(json.error || json)));
          if (json.error) {
            const desc = json.error.exception?.description || JSON.stringify(json.error);
            return reject(new Error(desc));
          }
          resolve(json.result);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const ALL_TRACKS = [
  {
    idx: 1,
    id: '01_越女剑_金庸群侠传复古风',
    title: '越女剑 - 金庸群侠传复古风',
    prompt: 'Retro 90s Wuxia RPG Soundtrack, Traditional Chinese Folk Instrumental, poetic pastoral nostalgic gentle melancholy with hidden martial agility, 84 BPM, clear airy Dizi bamboo flute playing nostalgic lead melody, acoustic Guzheng arpeggios, soft Pipa pluck accents, warm Erhu pads, gentle wooden temple blocks and light chime percussion, pristine acoustic soundstage, warm vintage reverb, pure instrumental no vocals.'
  },
  {
    idx: 2,
    id: '02_天龙八部_港版主题曲风_难念的经',
    title: '天龙八部 - 港版主题曲风（难念的经）',
    prompt: 'Fast-Paced Hong Kong Wuxia Pop-Orchestral Instrumental, intense breathless turbulent fatalistic fiery chivalric passion, 136 BPM driving syncopated rhythm, hyper-fast rapid Dizi runs, aggressive tremolo Pipa, galloping Chinese war drums Tanggu, dramatic Erhu section, clashing bronze cymbals, punchy transient drums, wide dynamic stereo field, pure instrumental no vocals.'
  },
  {
    idx: 3,
    id: '03_天龙八部_乔峰出场战神BGM',
    title: '天龙八部 - 乔峰出场/战神BGM',
    prompt: 'Heroic Epic Chinese Cinematic War Theme, majestic grand overwhelmingly heroic deeply tragic, 92 BPM marching martial tempo, resonant triumphant Suona lead, heavy booming Chinese ceremonial war drums Tanggu, soaring cinematic string ensemble, weeping solo Erhu, bronze gongs, deep bass resonance, pure instrumental no vocals.'
  },
  {
    idx: 4,
    id: '04_天龙八部_央视版主题曲风_宽恕',
    title: '天龙八部 - 央视版主题曲风（宽恕）',
    prompt: 'Atmospheric Northern Chinese Folk Symphony, Ethereal Wuxia Ballad, vast melancholic ethereal philosophical sweeping and sorrowful, 72 BPM slow expansive flow, ethereal Dongxiao vertical bamboo flute, deep earthy Xun ancient clay ocarina, sweeping string orchestra, solitary Guzheng glissandos, soulful Erhu, subtle timpani, lush cinematic reverb, pure instrumental no vocals.'
  },
  {
    idx: 5,
    id: '05_射雕英雄传_港版主题曲风_铁血丹心',
    title: '射雕英雄传 - 港版主题曲风（铁血丹心）',
    prompt: 'Classic 80s Hong Kong Wuxia Action Soundtrack, grand spirited romantic triumphant adventurous, 120 BPM bold marching pulse, soaring dual Dizi bamboo flute, heroic brass fanfare, rolling Chinese timpani and cymbals, rhythmic Pipa strumming, warm analog strings, pure instrumental no vocals.'
  },
  {
    idx: 6,
    id: '06_射雕英雄传_降龙十八掌战斗BGM',
    title: '射雕英雄传 - 降龙十八掌战斗BGM',
    prompt: 'High-Tension Chinese Martial Arts Combat Cue, explosive unstoppable adrenaline-fueled triumphant thunderous, 144 BPM fast galloping combat cadence, blazing energetic Suona, frantic Tanggu war drums, sharp clashing Chinese gongs, rapid Yangqin hammered dulcimer tremolos, aggressive Erhu riffs, pure instrumental no vocals.'
  },
  {
    idx: 7,
    id: '07_射雕英雄传_央视版主题曲风_天地都在我心中',
    title: '射雕英雄传 - 央视版主题曲风（天地都在我心中）',
    prompt: 'Epic Northern Steppes Wuxia Symphony, boundless rugged primordial fiercely proud majestic, 88 BPM heavy marching stomp, Morin Khuur horsehead fiddle, deep Dizi flute, giant thunderous ceremonial drums, throat-singing undertones, heroic brass section, sweeping bowed strings, cavernous cinematic depth, pure instrumental no vocals.'
  },
  {
    idx: 8,
    id: '08_神雕侠侣_港版双笛情话_神话情话',
    title: '神雕侠侣 - 港版双笛情话（神话情话）',
    prompt: 'Romantic Fast-Paced Wuxia Anthem Instrumental, passionate bittersweet dramatic soaring relentless devotion, 128 BPM driving emotional pulse, twin intertwined Dizi flutes playing rapid counter-melodies, rolling Pipa, sweeping romantic string section, driving acoustic rhythm, Chinese woodblocks, pure instrumental no vocals.'
  },
  {
    idx: 9,
    id: '09_神雕侠侣_绝情谷断肠崖思念',
    title: '神雕侠侣 - 绝情谷断肠崖思念',
    prompt: 'Melancholic Chinese Chamber Music, Solitary Wuxia Ballad, heartbreaking desolate tender sorrowful yearning, 68 BPM slow Rubato phrasing, weeping Erhu solo, solitary Guqin seven-string zither harmonics, melancholic Dongxiao, delicate Guzheng drops, subtle ambient silk string bed, pure instrumental no vocals.'
  },
  {
    idx: 10,
    id: '10_倚天屠龙记_马景涛版_刀剑如梦风',
    title: '倚天屠龙记 - 马景涛版（刀剑如梦风）',
    prompt: 'Taiwan 90s Folk-Pop Wuxia Instrumental, carefree spirited swaggering romantic swashbuckling, 124 BPM bouncy shuffle-wuxia beat, catchy melodic Dizi, rapid rhythmic Pipa, acoustic guitar strumming, punchy live drum kit, bright Guzheng accents, energetic Erhu fills, pure instrumental no vocals.'
  },
  {
    idx: 11,
    id: '11_倚天屠龙记_苏有朋版_风起云涌风',
    title: '倚天屠龙记 - 苏有朋版（风起云涌风）',
    prompt: 'Dramatic Martial Arts Ballad Orchestral, conflicted passionate majestic emotionally charged, 96 BPM steady emotional march, soaring lead Erhu, rich Dizi flute, dramatic orchestral strings, thundering Tanggu drums, delicate Pipa breakdowns, acoustic bass, pure instrumental no vocals.'
  },
  {
    idx: 12,
    id: '12_笑傲江湖_港版逍遥游_活得潇洒风',
    title: '笑傲江湖 - 港版逍遥游（活得潇洒风）',
    prompt: 'Breezy Pastoral Wuxia Instrumental, carefree uplifting serene easygoing detached from worldly struggles, 104 BPM relaxed walking tempo, bright agile Dizi bamboo flute, playful plucked Pipa, light wooden temple blocks, sweet Guzheng chords, warm gentle acoustic rhythm, pure instrumental no vocals.'
  },
  {
    idx: 13,
    id: '13_笑傲江湖_琴箫和鸣游戏原声',
    title: '笑傲江湖 - 琴箫和鸣游戏原声',
    prompt: 'Pure Traditional Chinese Scholar Duo Qin-Xiao Duet, Zen refined tranquil ethereal spiritually profound, 60 BPM free Rubato tempo, deep ancient Guqin seven-string zither with overtone harmonics, breathy vertical Dongxiao flute, natural ambient outdoor bamboo forest birds, pure acoustic minimalist capture, pure instrumental no vocals.'
  },
  {
    idx: 14,
    id: '14_笑傲江湖_沧海一声笑传奇风',
    title: '笑傲江湖 - 沧海一声笑传奇风',
    prompt: 'Iconic Pentatonic Chinese Wuxia Anthem, grand roaring unrestrained legendary laughing at fate, 92 BPM steady powerful rolling rhythm, heavy Guqin and Guzheng sweeping glissandos, bold piercing Dizi, thunderous Chinese ceremonial drums, clashing cymbals, wall of sound ancient folk energy, pure instrumental no vocals.'
  }
];

async function ensureUiReady() {
  await evalBrowser(`(() => {
    // Close any dialogs if present
    const closeBtns = Array.from(document.querySelectorAll('[role="dialog"] button, [data-radix-popper-content-wrapper] button'));
    for (const b of closeBtns) {
      if (b.innerText.includes('Close') || b.querySelector('svg.lucide-x')) {
        b.click();
      }
    }
    // Also press escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    // Ensure instrumental mode is ON
    const toggle = document.querySelector('button[aria-label="Toggle instrumental mode"]');
    if (toggle && toggle.getAttribute('data-state') !== 'checked') {
      toggle.click();
    }
  })()`);
}

async function getAllAudioClipUrls() {
  return await evalBrowser(`(() => {
    const entries = performance.getEntriesByType('resource');
    return entries
      .filter(e => e.name.includes('/clips/') && e.name.endsWith('.m4a'))
      .map(e => e.name);
  })()`);
}

async function generateSingleTrack(track) {
  console.log(`\n======================================================`);
  console.log(`[Queue] Starting Track ${track.idx}/14: ${track.title}`);
  console.log(`======================================================`);

  await ensureUiReady();
  await sleep(1000);

  // Get known clips before this generation
  const existingClips = new Set(await getAllAudioClipUrls());
  console.log(`[Flow Music] Known audio clips before run: ${existingClips.size}`);

  // Set prompt into Describe the sound textarea
  const setRes = await evalBrowser(`((text) => {
    const tas = Array.from(document.querySelectorAll('textarea'));
    let soundTa = tas.find(t => {
      const p = t.closest('div');
      return p && p.parentElement && p.parentElement.innerText.includes('Describe the sound');
    });
    if (!soundTa && tas.length >= 3) {
      soundTa = tas[2];
    }
    if (!soundTa) return { error: 'Sound textarea not found' };

    const proto = Object.getPrototypeOf(soundTa);
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
                         Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(soundTa, text);
    } else {
      soundTa.value = text;
    }
    soundTa.dispatchEvent(new Event('input', { bubbles: true }));
    soundTa.dispatchEvent(new Event('change', { bubbles: true }));

    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Generate');
    return { ok: true, genBtnDisabled: genBtn ? genBtn.disabled : null };
  })(${JSON.stringify(track.prompt)})`);

  console.log(`[Flow Music] Set prompt:`, setRes);
  await sleep(1500);

  // Click Generate
  const clickRes = await evalBrowser(`(() => {
    const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Generate');
    if (!genBtn) return { error: 'Generate button not found' };
    if (genBtn.disabled) return { error: 'Generate button is disabled' };
    genBtn.click();
    return { ok: true };
  })()`);

  if (!clickRes.ok) {
    console.error(`[Flow Music Error] Could not click generate:`, clickRes);
    return false;
  }

  console.log(`[Flow Music] Generation triggered! Waiting for completion...`);

  // Wait loop up to 60s
  let newClipUrl = null;
  for (let s = 1; s <= 30; s++) {
    await sleep(2000);
    const currentClips = await getAllAudioClipUrls();
    for (const c of currentClips) {
      if (!existingClips.has(c)) {
        newClipUrl = c;
        break;
      }
    }
    if (newClipUrl) {
      console.log(`[Flow Music] Detected new audio clip: ${newClipUrl} in ~${s*2}s!`);
      break;
    }
    if (s % 5 === 0) {
      console.log(`[Flow Music] Still generating (+${s*2}s)...`);
    }
  }

  if (!newClipUrl) {
    // If not found in resource timing, check if there is an audio or download URL in DOM
    console.log(`[Flow Music] Checking DOM for generated audio URL...`);
    const domAudio = await evalBrowser(`(() => {
      const a = document.querySelector('audio');
      return a ? a.src : null;
    })()`);
    if (domAudio && !existingClips.has(domAudio)) {
      newClipUrl = domAudio;
    }
  }

  if (!newClipUrl) {
    console.error(`[Flow Music Error] Timed out waiting for audio generation of ${track.title}`);
    return false;
  }

  // Download audio to OUT_DIR
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${track.id}.m4a`);
  console.log(`[Download] Downloading from ${newClipUrl} -> ${outPath}...`);
  execSync(`curl -s -L "${newClipUrl}" -o "${outPath}"`);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
    const szMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
    console.log(`✔ [Downloaded] ${track.title} successfully saved (${szMb} MB)`);
    return true;
  } else {
    console.error(`[Download Error] File size is suspicious: ${outPath}`);
    return false;
  }
}

async function runBatch() {
  console.log(`======================================================`);
  console.log(`Starting Batch Generation & Download for 14 Jin Yong Tracks`);
  console.log(`Output Directory: ${OUT_DIR}`);
  console.log(`======================================================`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const track of ALL_TRACKS) {
    const outPath = path.join(OUT_DIR, `${track.id}.m4a`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
      console.log(`[Skip] Track already exists: ${track.id} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
      continue;
    }

    const success = await generateSingleTrack(track);
    if (!success) {
      console.log(`[Retry] Retrying track ${track.title} once...`);
      await sleep(5000);
      await generateSingleTrack(track);
    }

    // Pacing delay between tracks
    console.log(`[Pacing] Waiting 8s before next track...`);
    await sleep(8000);
  }

  console.log(`\n======================================================`);
  console.log(`All tracks processed! Checking output folder:`);
  console.log(`======================================================`);
  execSync(`ls -lh "${OUT_DIR}"`, { stdio: 'inherit' });
}

runBatch().catch(console.error);
