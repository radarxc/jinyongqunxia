import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PROPS_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props');

const ITEMS = [
  {
    id: 'hair_ponytail',
    name: '女侠高马尾发型',
    type: 'hair',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_hair_ponytail_1791359108274.jpg',
    storageKey: 'hair_ponytail.jpg',
    outGlb: path.join(PROPS_DIR, 'hair_ponytail.glb'),
  },
  {
    id: 'hair_long_flow',
    name: '温婉长发发型',
    type: 'hair',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_hair_long_flow_1791359198718.jpg',
    storageKey: 'hair_long_flow.jpg',
    outGlb: path.join(PROPS_DIR, 'hair_long_flow.glb'),
  },
  {
    id: 'hair_bun_fairy',
    name: '飞仙流云髻发型',
    type: 'hair',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_hair_bun_fairy_1791359366303.jpg',
    storageKey: 'hair_bun_fairy.jpg',
    outGlb: path.join(PROPS_DIR, 'hair_bun_fairy.glb'),
  },
  {
    id: 'item_qingfeng_sword',
    name: '青锋宝剑带鞘',
    type: 'weapon',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_qingfeng_sword_1791359212361.jpg',
    storageKey: 'qingfeng_sword.jpg',
    outGlb: path.join(PROPS_DIR, 'item_qingfeng_sword.glb'),
  },
  {
    id: 'luxury_jade_pendant',
    name: '羊脂白玉双龙配',
    type: 'luxury',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_jade_pendant_1791359224038.jpg',
    storageKey: 'jade_pendant.jpg',
    outGlb: path.join(PROPS_DIR, 'luxury_jade_pendant.glb'),
  },
  {
    id: 'luxury_gold_pomander',
    name: '玲珑嵌宝金香囊',
    type: 'luxury',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_gold_pomander_1791359252542.jpg',
    storageKey: 'gold_pomander.jpg',
    outGlb: path.join(PROPS_DIR, 'luxury_gold_pomander.glb'),
  },
  {
    id: 'cloth_xianxia_dress',
    name: '仙侠刺绣长袍裙',
    type: 'clothing',
    imgPath: '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_xianxia_dress_1791359238557.jpg',
    storageKey: 'xianxia_dress.jpg',
    outGlb: path.join(PROPS_DIR, 'cloth_xianxia_dress.glb'),
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

async function submitItem(item) {
  console.log(`\n[Submit] Submitting ${item.name}...`);
  await browserEval('window.__t.toGenerate("imageToModel")', tid);
  await browserEval('window.__t.clearUpload()', tid);
  await sleep(1000);

  const up = await browserEval(`window.__t.uploadRef("${item.storageKey}")`, tid);
  if (!up || !up.ok) {
    throw new Error(`Upload failed for ${item.id}: ` + JSON.stringify(up));
  }
  console.log(`  Upload ok, audit: ${up.audit}`);

  const gen = await browserEval('window.__t.generate({ go: true })', tid);
  if (!gen || !gen.ok) {
    throw new Error(`Generate failed for ${item.id}: ` + JSON.stringify(gen));
  }
  console.log(`  Generate started: PID=${gen.pid}, OP=${gen.op}`);
  item.pid = gen.pid;
  item.op = gen.op;
  return item;
}

async function main() {
  console.log('=== Batch Generating 3D Accessories & Wigs in Tripo ===');
  const w = await browserEval('window.__t.wallet()', tid);
  console.log('Wallet balance:', w);

  // 1. Stage all items
  for (const item of ITEMS) {
    await stageItem(item);
  }

  // 2. Submit each item sequentially to Tripo
  for (const item of ITEMS) {
    await submitItem(item);
    await sleep(2000); // polite gap between submissions
  }

  // Save submission manifest
  const manifestPath = path.join(PROPS_DIR, 'generation_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(ITEMS, null, 2));
  console.log(`Saved generation manifest to ${manifestPath}`);

  // 3. Monitor progress of all items
  console.log('\n=== Monitoring Generation Progress ===');
  const active = [...ITEMS];
  const finished = [];

  while (active.length > 0) {
    await sleep(5000);
    const opIds = active.map((it) => it.op);
    const progressList = await browserEval(`window.__t.progress(${JSON.stringify(opIds)})`, tid);

    for (let i = active.length - 1; i >= 0; i--) {
      const item = active[i];
      const prog = (progressList || []).find((p) => p && (p.op === item.op || p.operator_id === item.op)) || {};
      const status = prog.status || 'unknown';
      const pct = prog.progress ?? 0;
      console.log(`  [${item.name}] Status: ${status}, Progress: ${pct}%`);

      if (status === 'success') {
        console.log(`  -> ${item.name} generation completed!`);
        finished.push(item);
        active.splice(i, 1);
      } else if (!['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress', 'unknown'].includes(status)) {
        console.error(`  -> ${item.name} failed with status: ${status}`);
        active.splice(i, 1);
      }
    }
  }

  // 4. Download and convert to unlit
  console.log('\n=== Downloading GLB Models ===');
  for (const item of finished) {
    console.log(`\nFetching detail for ${item.name} (PID: ${item.pid})...`);
    const detail = await browserEval(`window.__t.detail("${item.pid}")`, tid);
    const modelUrl = detail && detail.operator && detail.operator.model_url;
    if (!modelUrl) {
      console.error(`No model_url found for ${item.name}`);
      continue;
    }
    console.log(`Downloading from ${modelUrl}...`);
    const rawDest = item.outGlb.replace(/\.glb$/, '_raw.glb');
    await download(modelUrl, rawDest);

    // Convert to unlit
    console.log(`Converting to UNLIT: ${item.outGlb}`);
    try {
      execSync(`python3 tools/model3d/make_unlit_glb.py "${rawDest}" "${item.outGlb}"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn(`Fallback copy without unlit conversion:`, e.message);
      fs.copyFileSync(rawDest, item.outGlb);
    }
  }

  console.log('\n=== All 3D Assets Successfully Generated and Downloaded! ===');
}

main().catch(console.error);
