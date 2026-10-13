import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PROPS_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props');
const refImgPath = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/ref_cloth_kunlun_clean_1791384027259.jpg';
const storageKey = 'cloth_kunlun_clean.jpg';

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
  console.log('=== Staging and Generating Clean Headless Kunlun Taoist Robe ===');

  // 1. Stage in IDB
  const b64 = fs.readFileSync(refImgPath).toString('base64');
  console.log('Staging image to Tripo indexedDB...');
  await browserEval(`
    (async () => {
      const b64 = "${b64}";
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const blob = new Blob([u8], { type: 'image/jpeg' });
      await window.__t.idbPut("${storageKey}", blob);
    })()
  `, tid);

  // 2. Clear previous upload and navigate to imageToModel
  console.log('Preparing generation panel...');
  await browserEval('window.__t.toGenerate("imageToModel")', tid);
  await browserEval(`
    (() => {
      const st = window.__t.gst();
      st.faceLimit = 200000;
    })()
  `, tid);
  await browserEval('window.__t.clearUpload()', tid);
  await sleep(1500);

  // 3. Upload reference image
  console.log('Uploading reference image...');
  const up = await browserEval(`window.__t.uploadRef("${storageKey}")`, tid);
  if (!up || !up.ok) {
    throw new Error('Upload failed: ' + JSON.stringify(up));
  }
  console.log(`Uploaded ok, audit=${up.audit}`);

  // 4. Submit generation (65 credits)
  console.log('Submitting generation to Tripo (imageToModel)...');
  const gen = await browserEval('window.__t.generate({ go: true, open: true })', tid);
  if (!gen || !gen.ok) {
    throw new Error('Generate call failed: ' + JSON.stringify(gen));
  }
  console.log(`Generation started: PID=${gen.pid}, OP=${gen.op}, Credits spent=${gen.credits?.spent}`);

  // 5. Poll for progress
  console.log('Monitoring progress...');
  let modelUrl = null;
  const startTime = Date.now();

  while (Date.now() - startTime < 300000) { // 5 minutes max
    await sleep(4000);
    try {
      const progress = await browserEval(`window.__t.progress(["${gen.op}"])`, tid);
      const item = progress?.[0];
      const pct = item?.progress ?? 0;
      const status = item?.status;
      console.log(`[Tripo] Progress: ${pct}%, status: ${status}`);

      if (status === 'success' || pct >= 100) {
        const detail = await browserEval(`window.__t.detail("${gen.pid}")`, tid);
        modelUrl = detail?.model_url || detail?.operator?.model_url;
        if (modelUrl) {
          console.log('Found model_url:', modelUrl.split('?')[0]);
          break;
        }
      } else if (status === 'failed' || status === 'error') {
        throw new Error('Generation failed on Tripo server: ' + JSON.stringify(item));
      }
    } catch (e) {
      console.warn('Poll error:', e.message);
    }
  }

  if (!modelUrl) {
    throw new Error('Timed out waiting for model URL');
  }

  // 6. Download model
  const rawGlb = path.join(PROPS_DIR, 'cloth_kunlun_taoist_headless_raw.glb');
  const outGlb = path.join(PROPS_DIR, 'cloth_kunlun_taoist.glb');

  console.log('Downloading raw GLB...');
  await download(modelUrl, rawGlb);

  // 7. Make unlit GLB
  console.log('Converting to unlit GLB...');
  execSync(`python3 tools/model3d/make_unlit_glb.py "${rawGlb}" "${outGlb}"`, { stdio: 'inherit' });
  console.log('✅ Clean Kunlun Taoist robe ready at:', outGlb);
}

main().catch(console.error);
