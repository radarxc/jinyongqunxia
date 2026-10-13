import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PID = '3a232309-fee2-4010-92cc-5d2d9177a23d';
const OUT_DIR = '/Users/bytedance/Projects/jinyongqunxia/.agents/coord/ART-3d-tripo-web/user_selected';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
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
  console.log(`\n======================================================`);
  console.log(`Resuming Tripo Model Retarget & Export: PID=${PID}`);
  console.log(`======================================================`);

  // 4. Retarget animations [idle, walk, run]
  console.log(`\n[Retarget] Generating animations [idle, walk, run]...`);
  const anims = ['idle', 'walk', 'run'];
  for (const anim of anims) {
    console.log(`  -> Retargeting ${anim}...`);
    let rtRes;
    try {
      rtRes = await browserEval(`window.__t.retarget("${PID}", ["${anim}"], { go: true })`, tid);
    } catch (e) {
      console.warn(`  Retarget eval retry for ${anim}...`, e.message);
      await sleep(2000);
      rtRes = await browserEval(`window.__t.retarget("${PID}", ["${anim}"], { go: true })`, tid);
    }
    console.log(`  Retarget ${anim} response:`, rtRes);
    const rtOp = rtRes && rtRes.op;
    if (rtOp) {
      while (true) {
        const prog = await browserEval(`window.__t.progress("${rtOp}")`, tid);
        const p = (prog && prog[0]) || {};
        console.log(`  [Retarget ${anim}] Status: ${p.status}, Progress: ${p.progress}%`);
        if (p.status === 'success') break;
        if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
          console.warn(`  Retarget ${anim} status: ${p.status}`);
          break;
        }
        await sleep(3000);
      }
    }
  }

  // 5. Export Animated GLB
  console.log(`\n[Export] Requesting Animated GLB (idle+walk+run)...`);
  let exportRes;
  try {
    exportRes = await browserEval(`window.__t.exportGlb("${PID}", "zhujue_f_gen_ultra", { anims: ["idle", "walk", "run"] })`, tid);
  } catch (e) {
    console.warn('Export eval retry...', e.message);
    await sleep(2000);
    exportRes = await browserEval(`window.__t.exportGlb("${PID}", "zhujue_f_gen_ultra", { anims: ["idle", "walk", "run"] })`, tid);
  }
  console.log('Export response:', exportRes);
  const exportOp = exportRes.op;

  while (true) {
    const prog = await browserEval(`window.__t.progress("${exportOp}")`, tid);
    const p = (prog && prog[0]) || {};
    console.log(`[Export] Status: ${p.status}, Progress: ${p.progress}%`);
    if (p.status === 'success') break;
    if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
      throw new Error(`Export failed with status: ${p.status}`);
    }
    await sleep(3000);
  }

  // Get download URL
  const dlRes = await browserEval(`window.__t.req("/v2/studio/operation/download_with_name", { method: "POST", body: { file_name: "zhujue_f_gen_ultra_anim_idle_walk_run", operator_id: "${exportOp}" } })`, tid);
  console.log('Download URL response:', dlRes);
  const modelUrl = dlRes.model_url;

  const rawGlbPath = path.join(OUT_DIR, 'zhujue_f_gen_ultra_anim_raw.glb');
  const fixedGlbPath = path.join(OUT_DIR, 'zhujue_f_gen_ultra_anim_fixed.glb');
  const unlitGlbPath = path.join(OUT_DIR, 'zhujue_f_gen_ultra_anim_unlit.glb');
  const publicGlbPath = '/Users/bytedance/Projects/jinyongqunxia/apps/game/public/temp_fresh_fullbody.glb';

  console.log(`Downloading GLB from ${modelUrl}...`);
  await download(modelUrl, rawGlbPath);

  // 6. Fix animation root offset
  console.log(`\n[Fix Anim] Fixing animation root offset...`);
  execSync(`python3 /Users/bytedance/Projects/jinyongqunxia/tools/model3d/fix_anim_offset.py "${rawGlbPath}" "${fixedGlbPath}"`, { stdio: 'inherit' });

  // 7. Make Unlit GLB
  console.log(`\n[Unlit] Injecting KHR_materials_unlit...`);
  execSync(`python3 /Users/bytedance/Projects/jinyongqunxia/tools/model3d/make_unlit_glb.py "${fixedGlbPath}" "${unlitGlbPath}"`, { stdio: 'inherit' });

  // 8. Deploy to public
  fs.copyFileSync(unlitGlbPath, publicGlbPath);
  console.log(`\n✔ Successfully deployed unlit model to ${publicGlbPath} (${fs.statSync(publicGlbPath).size} bytes)`);

  console.log(`\nALL DONE!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
