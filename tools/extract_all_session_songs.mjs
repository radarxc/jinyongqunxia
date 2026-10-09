import { evalBrowser } from './flowmusic_driver.mjs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const OUT_DIR = path.resolve('assets/music');

const TRACK_DEFS = [
  {
    idx: 1,
    id: '01_越女剑_金庸群侠传复古风',
    keywords: ['Retro 90s Wuxia RPG Soundtrack', '越女剑', '84 BPM']
  },
  {
    idx: 2,
    id: '02_天龙八部_港版主题曲风_难念的经',
    keywords: ['Fast-Paced Hong Kong Wuxia Pop-Orchestral', '136 BPM']
  },
  {
    idx: 3,
    id: '03_天龙八部_乔峰出场战神BGM',
    keywords: ['Heroic Epic Chinese Cinematic War Theme', '92 BPM', 'Suona']
  },
  {
    idx: 4,
    id: '04_天龙八部_央视版主题曲风_宽恕',
    keywords: ['Atmospheric Northern Chinese Folk Symphony', 'Ethereal Wuxia Ballad', '72 BPM']
  },
  {
    idx: 5,
    id: '05_射雕英雄传_港版主题曲风_铁血丹心',
    keywords: ['Classic 80s Hong Kong Wuxia Action Soundtrack', '120 BPM']
  },
  {
    idx: 6,
    id: '06_射雕英雄传_降龙十八掌战斗BGM',
    keywords: ['High-Tension Chinese Martial Arts Combat Cue', '144 BPM']
  },
  {
    idx: 7,
    id: '07_射雕英雄传_央视版主题曲风_天地都在我心中',
    keywords: ['Epic Northern Steppes Wuxia Symphony', '88 BPM', 'Morin Khuur']
  },
  {
    idx: 8,
    id: '08_神雕侠侣_港版双笛情话_神话情话',
    keywords: ['Romantic Fast-Paced Wuxia Anthem Instrumental', '128 BPM']
  },
  {
    idx: 9,
    id: '09_神雕侠侣_绝情谷断肠崖思念',
    keywords: ['Melancholic Chinese Chamber Music', '68 BPM']
  },
  {
    idx: 10,
    id: '10_倚天屠龙记_马景涛版_刀剑如梦风',
    keywords: ['Taiwan 90s Folk-Pop Wuxia Instrumental', '124 BPM']
  },
  {
    idx: 11,
    id: '11_倚天屠龙记_苏有朋版_风起云涌风',
    keywords: ['Dramatic Martial Arts Ballad Orchestral', '96 BPM']
  },
  {
    idx: 12,
    id: '12_笑傲江湖_港版逍遥游_活得潇洒风',
    keywords: ['Breezy Pastoral Wuxia Instrumental', '104 BPM']
  },
  {
    idx: 13,
    id: '13_笑傲江湖_琴箫和鸣游戏原声',
    keywords: ['Pure Traditional Chinese Scholar Duo Qin-Xiao Duet', '60 BPM']
  },
  {
    idx: 14,
    id: '14_笑傲江湖_沧海一声笑传奇风',
    keywords: ['Iconic Pentatonic Chinese Wuxia Anthem', '92 BPM']
  }
];

async function main() {
  console.log('Extracting all generated song cards from Flow Music session...');

  const cards = await evalBrowser(`(() => {
    // Find all links to /song/<uuid>
    const songLinks = Array.from(document.querySelectorAll('a[href*="/song/"]'));
    return songLinks.map(link => {
      const match = link.href.match(/\\/song\\/([a-f0-9\\-]+)/i);
      const uuid = match ? match[1] : null;
      // Get container text
      const container = link.closest('div[class*="group"], div[class*="card"], li, div[class*="border"]') || link.parentElement?.parentElement;
      return {
        uuid,
        songUrl: link.href,
        text: container ? container.innerText : ''
      };
    }).filter(c => c.uuid);
  })()`);

  console.log(`Found ${cards.length} song cards in session.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const matched = new Map();

  for (const card of cards) {
    if (!card.uuid) continue;
    for (const track of TRACK_DEFS) {
      if (matched.has(track.id)) continue;
      const isMatch = track.keywords.some(kw => card.text.includes(kw));
      if (isMatch) {
        matched.set(track.id, { track, card });
        break;
      }
    }
  }

  console.log(`Matched ${matched.size} of 14 tracks from current session.`);

  for (const [trackId, { track, card }] of matched.entries()) {
    const outPath = path.join(OUT_DIR, `${track.id}.m4a`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) {
      console.log(`[Already Downloaded] ${track.id} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
      continue;
    }

    const clipUrl = `https://storage.googleapis.com/producer-app-public/clips/${card.uuid}.m4a`;
    console.log(`Downloading ${track.id} from ${clipUrl}...`);
    try {
      execSync(`curl -s -L "${clipUrl}" -o "${outPath}"`);
      const sz = fs.statSync(outPath).size;
      console.log(`✔ [Downloaded] ${track.id} saved (${(sz / 1024 / 1024).toFixed(2)} MB)`);
    } catch (e) {
      console.error(`Error downloading ${track.id}:`, e.message);
    }
  }

  // Report missing tracks if any
  const missing = TRACK_DEFS.filter(t => !matched.has(t.id));
  if (missing.length > 0) {
    console.log('\nMissing / unmatched tracks:', missing.map(m => m.id));
  } else {
    console.log('\nAll 14 tracks successfully matched and downloaded!');
  }
}

main().catch(console.error);
