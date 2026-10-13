import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PROPS_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props');

const ASSETS = [
  {
    id: 'hair_ponytail',
    name: '女侠高马尾发型',
    type: 'hair',
    pid: '07f4915e-c9ea-4aa7-935d-4f2309aeaf8e',
    op: '0d838848-5a72-411a-ac4b-273ad6ec52e6',
    outGlb: path.join(PROPS_DIR, 'hair_ponytail.glb'),
  },
  {
    id: 'hair_long_flow',
    name: '温婉长发发型',
    type: 'hair',
    pid: '1038e75b-22db-4e43-9ae2-3a19be9c3bfe',
    op: 'f9d00292-1767-42b0-ab29-c29f83c080da',
    outGlb: path.join(PROPS_DIR, 'hair_long_flow.glb'),
  },
  {
    id: 'hair_bun_fairy',
    name: '飞仙流云髻发型',
    type: 'hair',
    pid: '6d0755b1-65df-49df-9279-c734adf15534',
    op: '101f78c4-56c9-45ba-816d-3a99d02c6fdc',
    outGlb: path.join(PROPS_DIR, 'hair_bun_fairy.glb'),
  },
  {
    id: 'item_qingfeng_sword',
    name: '青锋宝剑带鞘',
    type: 'weapon',
    pid: '2285337f-7651-4659-971b-cbd44c9f520f',
    op: 'e1bc5e48-54d4-48c3-8885-c488fbce30bc',
    outGlb: path.join(PROPS_DIR, 'item_qingfeng_sword.glb'),
  },
  {
    id: 'luxury_jade_pendant',
    name: '羊脂白玉双龙配',
    type: 'luxury',
    pid: '8cb065ca-2528-4a39-8dad-b7872c3e71c9',
    op: 'ac81a50f-f02a-4f9d-9e46-d8ab5730d96b',
    outGlb: path.join(PROPS_DIR, 'luxury_jade_pendant.glb'),
  },
  {
    id: 'luxury_gold_pomander',
    name: '玲珑嵌宝金香囊',
    type: 'luxury',
    pid: '5744ae6c-7c0b-4def-b931-9759de8fca13',
    op: 'd552c4a6-98df-40bc-a14f-b3fa6d4568f7',
    outGlb: path.join(PROPS_DIR, 'luxury_gold_pomander.glb'),
  },
  {
    id: 'cloth_xianxia_dress',
    name: '仙侠刺绣长袍裙',
    type: 'clothing',
    pid: '671a9fc4-9c17-4737-98aa-e4353da92ee3',
    op: '77a5c8c2-4e47-4a07-896a-bdda95e167df',
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

async function main() {
  console.log('=== Tracking 7 Generated 3D Assets in Tripo ===');
  const active = [...ASSETS];
  const completed = [];

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
      console.log(`  [${item.name}] Status: ${status}, Progress: ${pct}%, Left: ${prog.left_time || 0}s`);

      if (status === 'success') {
        console.log(`\n🎉 [Completed] ${item.name} finished generation!`);
        completed.push(item);
        active.splice(i, 1);

        // Download immediately
        try {
          const detail = await browserEval(`window.__t.detail("${item.pid}")`, tid);
          const modelUrl = detail && detail.operator && detail.operator.model_url;
          if (modelUrl) {
            console.log(`  Downloading ${item.name} model from CDN...`);
            const rawDest = item.outGlb.replace(/\.glb$/, '_raw.glb');
            await download(modelUrl, rawDest);

            console.log(`  Converting to UNLIT: ${item.outGlb}`);
            try {
              execSync(`python3 tools/model3d/make_unlit_glb.py "${rawDest}" "${item.outGlb}"`, { stdio: 'inherit' });
            } catch (e) {
              console.warn(`  Fallback unlit conversion:`, e.message);
              fs.copyFileSync(rawDest, item.outGlb);
            }
          } else {
            console.error(`  No model_url found for ${item.name}`);
          }
        } catch (err) {
          console.error(`  Error downloading ${item.name}:`, err.message);
        }
      } else if (!['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress', 'unknown'].includes(status)) {
        console.error(`❌ [Failed] ${item.name} ended with status: ${status}`);
        active.splice(i, 1);
      }
    }
  }

  // Save manifest
  const manifestPath = path.join(PROPS_DIR, 'props_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(ASSETS, null, 2));
  console.log(`\nAll done! Manifest written to ${manifestPath}`);
}

main().catch(console.error);
