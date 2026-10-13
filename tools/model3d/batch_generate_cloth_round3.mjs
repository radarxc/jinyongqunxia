import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PROPS_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props');

const BATCH = [
  {
    id: 'cloth_kunlun_taoist',
    name: '昆仑素雪道袍',
    type: 'clothing',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_cloth_kunlun_1791361748196.jpg',
    storageKey: 'cloth_kunlun.jpg',
    outGlb: path.join(PROPS_DIR, 'cloth_kunlun_taoist.glb'),
  },
  {
    id: 'cloth_golden_armor',
    name: '紫金龙纹锦甲袍',
    type: 'clothing',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_cloth_golden_1791361762342.jpg',
    storageKey: 'cloth_golden.jpg',
    outGlb: path.join(PROPS_DIR, 'cloth_golden_armor.glb'),
  },
];

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
  console.log('=== Batch Generating 2 Additional Clothing in Tripo ===');

  for (const item of BATCH) {
    await stageItem(item);
  }

  for (const item of BATCH) {
    await submitItemWithRetry(item);
    await sleep(2500);
  }

  console.log('\n=== Monitoring Generation ===');
  const active = [...BATCH];
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
          const rawUrl = detail?.project?.preview_model?.model;
          if (!rawUrl) {
            console.error(`  No preview model url for ${item.name}`, detail);
            continue;
          }

          const rawGlb = item.outGlb.replace(/\.glb$/, '_raw.glb');
          console.log(`  Downloading raw GLB from ${rawUrl.slice(0, 60)}... to ${rawGlb}`);
          await download(rawUrl, rawGlb);

          console.log(`  Converting to unlit GLB: ${item.outGlb}`);
          execSync(`python3 tools/model3d/make_unlit_glb.py "${rawGlb}" "${item.outGlb}"`, { stdio: 'inherit' });
          console.log(`  ✅ Successfully saved and converted ${item.name}!`);
        } catch (e) {
          console.error(`  Error downloading/converting ${item.name}:`, e);
        }
      } else if (status === 'failed' || status === 'error') {
        console.error(`\n❌ [Failed] ${item.name} generation failed!`, prog);
        active.splice(i, 1);
      }
    }
  }

  console.log('\n=== All Done ===');
  console.log(`Finished ${finished.length}/${BATCH.length} items`);
}

main().catch(console.error);
