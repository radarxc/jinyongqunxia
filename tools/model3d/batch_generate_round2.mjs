import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PROPS_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props');

const BATCH2 = [
  {
    id: 'cloth_crimson_gown',
    name: '赤霞织金长袍裙',
    type: 'clothing',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_cloth_crimson_gown_1791359915225.jpg',
    storageKey: 'cloth_crimson_gown.jpg',
    outGlb: path.join(PROPS_DIR, 'cloth_crimson_gown.glb'),
  },
  {
    id: 'cloth_black_assassin',
    name: '玄天夜行刺客袍',
    type: 'clothing',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_cloth_black_assassin_1791359943120.jpg',
    storageKey: 'cloth_black_assassin.jpg',
    outGlb: path.join(PROPS_DIR, 'cloth_black_assassin.glb'),
  },
  {
    id: 'item_wine_gourd',
    name: '武林朱砂酒葫芦',
    type: 'weapon',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_wine_gourd_1791359987905.jpg',
    storageKey: 'item_wine_gourd.jpg',
    outGlb: path.join(PROPS_DIR, 'item_wine_gourd.glb'),
  },
  {
    id: 'item_folding_fan',
    name: '逍遥青玉折扇',
    type: 'weapon',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_folding_fan_1791360004896.jpg',
    storageKey: 'item_folding_fan.jpg',
    outGlb: path.join(PROPS_DIR, 'item_folding_fan.glb'),
  },
  {
    id: 'item_bamboo_scroll',
    name: '天书秘籍竹简',
    type: 'luxury',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_bamboo_scroll_179136020608.jpg',
    storageKey: 'item_bamboo_scroll.jpg',
    outGlb: path.join(PROPS_DIR, 'item_bamboo_scroll.glb'),
  },
  {
    id: 'item_iron_dagger',
    name: '玄铁短匕带鞘',
    type: 'weapon',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_iron_dagger_1791360036741.jpg',
    storageKey: 'item_iron_dagger.jpg',
    outGlb: path.join(PROPS_DIR, 'item_iron_dagger.glb'),
  },
  {
    id: 'item_bamboo_hat',
    name: '江湖竹编斗笠',
    type: 'hair',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_bamboo_hat_1791360235743.jpg',
    storageKey: 'item_bamboo_hat.jpg',
    outGlb: path.join(PROPS_DIR, 'item_bamboo_hat.glb'),
  },
  {
    id: 'item_buddhist_beads',
    name: '沉香佛珠手串',
    type: 'luxury',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_buddhist_beads_1791360277155.jpg',
    storageKey: 'item_buddhist_beads.jpg',
    outGlb: path.join(PROPS_DIR, 'item_buddhist_beads.glb'),
  },
  {
    id: 'item_silk_pouch',
    name: '刺绣金丝荷包',
    type: 'luxury',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_silk_pouch_1791360297766.jpg',
    storageKey: 'item_silk_pouch.jpg',
    outGlb: path.join(PROPS_DIR, 'item_silk_pouch.glb'),
  },
];

// Fix path for bamboo scroll if needed
const scrollCandidate = fs.readdirSync('/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09')
  .find(f => f.startsWith('ref_bamboo_scroll_'));
if (scrollCandidate) {
  BATCH2.find(it => it.id === 'item_bamboo_scroll').imgPath =
    path.join('/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09', scrollCandidate);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('status ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Saved ${dest} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      });
    }).on('error', reject);
  });
}

async function stageItem(item) {
  const b64 = fs.readFileSync(item.imgPath).toString('base64');
  console.log(`[Stage] Staging ${item.name} (${item.storageKey})...`);
  await browserEval(`
    (async () => {
      const b64 = "${b64}";
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const blob = new Blob([u8], { type: 'image/jpeg' });
      await window.__t.idbPut("${item.storageKey}", blob);
    })()
  `, tid);
}

async function submitItemWithRetry(item, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n[Submit] Submitting ${item.name} (attempt ${attempt})...`);
      await browserEval('window.__t.toGenerate("imageToModel")', tid);
      await browserEval('window.__t.clearUpload()', tid);
      await sleep(1500);

      const up = await browserEval(`window.__t.uploadRef("${item.storageKey}")`, tid);
      if (!up || !up.ok) {
        throw new Error(`Upload error: ` + JSON.stringify(up));
      }
      console.log(`  Upload ok, audit: ${up.audit}`);

      const gen = await browserEval('window.__t.generate({ go: true })', tid);
      if (!gen || !gen.ok) {
        throw new Error(`Generate error: ` + JSON.stringify(gen));
      }
      console.log(`  Generate started: PID=${gen.pid}, OP=${gen.op}`);
      item.pid = gen.pid;
      item.op = gen.op;
      return item;
    } catch (err) {
      console.warn(`  Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await sleep(3000);
    }
  }
}

async function main() {
  console.log('=== Batch Generating Round 2 Assets in Tripo ===');

  // 1. Stage all items
  for (const item of BATCH2) {
    await stageItem(item);
  }

  // 2. Submit sequentially
  for (const item of BATCH2) {
    await submitItemWithRetry(item);
    await sleep(2500);
  }

  // 3. Monitor and download
  console.log('\n=== Monitoring Round 2 Generation ===');
  const active = [...BATCH2];
  const finished = [];

  while (active.length > 0) {
    await sleep(4000);
    const opIds = active.map((it) => it.op);
    let progressList;
    try {
      progressList = await browserEval(`window.__t.progress(${JSON.stringify(opIds)})`, tid);
    } catch (e) {
      console.warn('Progress eval retry...', e.message);
      continue;
    }

    for (let i = active.length - 1; i >= 0; i--) {
      const item = active[i];
      const prog = (progressList || []).find((p) => p && (p.op === item.op || p.operator_id === item.op)) || {};
      const status = prog.status || 'unknown';
      const pct = prog.progress ?? 0;
      console.log(`  [${item.name}] Status: ${status}, Progress: ${pct}%`);

      if (status === 'success') {
        console.log(`\n🎉 [Completed] ${item.name} finished generation!`);
        finished.push(item);
        active.splice(i, 1);

        try {
          const detail = await browserEval(`window.__t.detail("${item.pid}")`, tid);
          const modelUrl = detail && detail.operator && detail.operator.model_url;
          if (modelUrl) {
            console.log(`  Downloading ${item.name} from CDN...`);
            const rawDest = item.outGlb.replace(/\.glb$/, '_raw.glb');
            await download(modelUrl, rawDest);

            console.log(`  Converting to UNLIT: ${item.outGlb}`);
            try {
              execSync(`python3 tools/model3d/make_unlit_glb.py "${rawDest}" "${item.outGlb}"`, { stdio: 'inherit' });
            } catch (e) {
              console.warn(`  Fallback copy:`, e.message);
              fs.copyFileSync(rawDest, item.outGlb);
            }
          }
        } catch (err) {
          console.error(`  Error downloading ${item.name}:`, err.message);
        }
      } else if (!['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress', 'unknown'].includes(status)) {
        console.error(`❌ [Failed] ${item.name} status: ${status}`);
        active.splice(i, 1);
      }
    }
  }

  console.log('\n=== Round 2 Generation & Download Fully Complete! ===');
}

main().catch(console.error);
