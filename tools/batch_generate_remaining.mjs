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

const REMAINING_TRACKS = [
  {
    idx: 15,
    id: '15_鹿鼎记_市井幽默紫禁城风',
    title: '鹿鼎记 - 市井幽默紫禁城风',
    prompt: 'Comic Wuxia Folk Instrumental, humorous mischievous lively witty bustling, 126 BPM bouncy swing, cheerful comedic Suona lead, bouncing Pipa pizzicato, clattering wooden clappers Kuaiban, lively Dizi, comical gong accents, dry punchy acoustic instruments, pure instrumental no vocals.'
  },
  {
    idx: 16,
    id: '16_雪山飞狐_塞外飞雪孤侠风',
    title: '雪山飞狐 - 塞外飞雪孤侠风',
    prompt: 'Northern Frontier Wuxia Ballad, frosty solitary resolute melancholic noble, 76 BPM steady waltz feel, chilly whistling Dongxiao, cold crystalline Yangqin hammered dulcimer, weeping Erhu, solitary acoustic nylon guitar, distant wind effects, pure instrumental no vocals.'
  },
  {
    idx: 17,
    id: '17_连城诀_血泪沉冤雪谷风',
    title: '连城诀 - 血泪沉冤雪谷风',
    prompt: 'Dark Cinematic Wuxia, Suspenseful Chinese Drama Cue, gripping tragic ominous deeply sorrowful bleak, 64 BPM slow dragging heartbeat pulse, ancient clay Xun ocarina, dissonant bowed Erhu, low dark bass drum, muted Pipa tremolo, pure instrumental no vocals.'
  },
  {
    idx: 18,
    id: '18_侠客行_狂放豪迈赵客缦胡缨',
    title: '侠客行 - 狂放豪迈赵客缦胡缨',
    prompt: 'Fast Folk-Rock Wuxia Fusion, wild uninhibited fierce galloping exhilarating, 150 BPM intense galloping combat pace, blazing Dizi bamboo flute riffs, heavy distorted Tanggu war drums, lightning-fast Ruan and Pipa strumming, roaring Chinese gongs, pure instrumental no vocals.'
  },
  {
    idx: 19,
    id: '19_碧血剑_明末挽歌山河动荡',
    title: '碧血剑 - 明末挽歌山河动荡',
    prompt: 'Historical Tragic Wuxia Symphony, solemn fateful dramatic turbulent heroic mourning, 80 BPM heavy ceremonial pacing, antique temple bells, sweeping cinematic Erhu ensemble, mournful Pipa, deep bronze gongs, thunderous timpani, pure instrumental no vocals.'
  },
  {
    idx: 20,
    id: '20_书剑恩仇录_西域江南红花义气',
    title: '书剑恩仇录 - 西域江南红花义气',
    prompt: 'Grand Regional Contrast Wuxia Instrumental, patriotic conflicted chivalrous vast poignant, 90 BPM stately march transitioning into flowing Jiangnan elegance, Middle-eastern Oud mixed with Chinese Pipa, expressive Southern Dizi flute, sweeping strings, ceremonial Tanggu, pure instrumental no vocals.'
  },
  {
    idx: 21,
    id: '21_白马啸西风_瀚海孤影大漠风情',
    title: '白马啸西风 - 瀚海孤影大漠风情',
    prompt: 'Silk Road Desert Ballad, Chinese-Central Asian Folk, heartfelt desolate bittersweet nostalgic vast, 70 BPM swaying caravan rhythm, Central Asian Dombra Rawap lute, lonely Dizi flute, mournful Erhu, soft desert hand drums Daf, atmospheric wind chimes, pure instrumental no vocals.'
  },
  {
    idx: 22,
    id: '22_鸳鸯刀_诙谐幽默夫妻刀法',
    title: '鸳鸯刀 - 诙谐幽默夫妻刀法',
    prompt: 'Lighthearted Comedy Wuxia Duet, playful comedic romantic witty light-footed, 112 BPM cheerful bounce, twin playful Dizi flutes teasing each other, bouncy Pipa plucks, light wooden temple blocks and clappers, humorous small gongs, pure instrumental no vocals.'
  },
  {
    idx: 23,
    id: '23_飞狐外传_快意恩仇少年英雄',
    title: '飞狐外传 - 快意恩仇少年英雄',
    prompt: 'Spirited Young Martial Hero Theme, determined energetic adventurous chivalric, 118 BPM brisk horse-trot rhythm, crisp agile Dizi flute melodies, rhythmic acoustic Pipa strumming, uplifting Erhu phrases, driving wooden percussion, pure instrumental no vocals.'
  }
];

async function ensureInstrumentalMode() {
  await evalBrowser(`(() => {
    const toggle = document.querySelector('button[aria-label="Toggle instrumental mode"]');
    if (toggle && toggle.getAttribute('data-state') !== 'checked') {
      toggle.click();
    }
  })()`);
}

async function getExistingUuids() {
  return await evalBrowser(`(() => {
    const songLinks = Array.from(document.querySelectorAll('a[href*="/song/"]'));
    return songLinks.map(link => {
      const match = link.href.match(/\\/song\\/([a-f0-9\\-]+)/i);
      return match ? match[1] : null;
    }).filter(Boolean);
  })()`);
}

async function setPromptAndGenerate(promptText) {
  return await evalBrowser(`((text) => {
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
    if (!genBtn) return { error: 'Generate button not found' };
    if (genBtn.disabled) return { error: 'Generate button is disabled' };

    genBtn.click();
    return { ok: true };
  })(${JSON.stringify(promptText)})`);
}

async function generateTrack(track) {
  const outPath = path.join(OUT_DIR, `${track.id}.m4a`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
    console.log(`[Skip] Track already downloaded: ${track.id} (${(fs.statSync(outPath).size/1024/1024).toFixed(2)} MB)`);
    return true;
  }

  console.log(`\n======================================================`);
  console.log(`[Queue] Generating Track: ${track.title}`);
  console.log(`======================================================`);

  await ensureInstrumentalMode();
  await sleep(1000);

  const prevUuids = new Set(await getExistingUuids());
  console.log(`[Flow Music] Existing song cards in session: ${prevUuids.size}`);

  const trigger = await setPromptAndGenerate(track.prompt);
  console.log(`[Flow Music] Trigger result:`, trigger);
  if (!trigger.ok) {
    console.error(`[Flow Music Error] Failed to trigger:`, trigger);
    return false;
  }

  console.log(`[Flow Music] Generation dispatched! Monitoring for new song card...`);

  let newUuid = null;
  for (let s = 1; s <= 45; s++) {
    await sleep(2000);
    const currUuids = await getExistingUuids();
    for (const u of currUuids) {
      if (!prevUuids.has(u)) {
        newUuid = u;
        break;
      }
    }
    if (newUuid) {
      console.log(`✔ [Flow Music] New track UUID detected: ${newUuid} (in ~${s*2}s)`);
      break;
    }
    if (s % 5 === 0) {
      console.log(`[Flow Music] Generating in progress (+${s*2}s)...`);
    }
  }

  if (!newUuid) {
    console.error(`[Flow Music Error] Timed out waiting for UUID of ${track.title}`);
    return false;
  }

  const clipUrl = `https://storage.googleapis.com/producer-app-public/clips/${newUuid}.m4a`;
  console.log(`[Download] Downloading ${track.id} from ${clipUrl}...`);
  try {
    execSync(`curl -s -L "${clipUrl}" -o "${outPath}"`);
    const sz = fs.statSync(outPath).size;
    console.log(`✔ [Downloaded] ${track.title} successfully saved (${(sz / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (e) {
    console.error(`[Download Error] ${e.message}`);
    return false;
  }
}

async function run() {
  console.log('Starting generation for remaining 9 Jin Yong novels...');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const track of REMAINING_TRACKS) {
    let ok = await generateTrack(track);
    if (!ok) {
      console.log(`[Retry] Retrying ${track.title} once...`);
      await sleep(5000);
      ok = await generateTrack(track);
    }
    console.log('[Pacing] Waiting 8s before next track...');
    await sleep(8000);
  }

  console.log('\nAll remaining novel tracks processed!');
}

run().catch(console.error);
