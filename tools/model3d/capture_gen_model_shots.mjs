import fs from 'fs';
import path from 'path';
import { browserEval, getGameTargetId } from '../agents/browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getViewerTargetId() {
  const http = await import('http');
  const json = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/targets', res => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => resolve(JSON.parse(buf)));
    }).on('error', reject);
  });
  const targets = json.targets || json.result || [];
  const c3d = targets.find(t => t.url && t.url.includes('character-3d') && t.type === 'page')
    || targets.find(t => t.title && t.title.includes('天书录') && t.type === 'page')
    || targets.find(t => t.url && t.url.includes('localhost:5173') && t.type === 'page');
  if (!c3d) throw new Error('Viewer target not found');
  const tid = c3d.targetId || c3d.id;
  return tid;
}

async function capture(tid, filename) {
  const shot = await browserEval(`
    (() => {
      if (window.__viewer?.captureScreenshot) {
        return window.__viewer.captureScreenshot("image/jpeg", 0.95);
      }
      const dbg = window.__viewer_debug;
      if (dbg?.renderer && dbg?.scene && dbg?.camera) {
        dbg.renderer.render(dbg.scene, dbg.camera);
      }
      return document.querySelector("canvas").toDataURL("image/jpeg", 0.95);
    })()
  `, tid);
  if (!shot || !shot.startsWith('data:image/')) {
    throw new Error('Failed to capture screenshot for ' + filename);
  }
  const base64 = shot.split(',')[1];
  const outPath = path.join(ARTIFACTS_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
  console.log(`Saved ${filename} (${base64.length} bytes)`);
  return outPath;
}

async function main() {
  console.log('--- Starting Validation Screenshot Capture for Direct Generated Model ---');
  const tid = await getViewerTargetId();
  console.log('Using viewer target ID:', tid);

  // Ensure viewer is on ?character-3d
  const currUrl = await browserEval('location.href', tid);
  if (!currUrl.includes('character-3d')) {
    console.log('Navigating to http://localhost:5173/?character-3d ...');
    await browserEval('location.href = "http://localhost:5173/?character-3d"', tid);
    await sleep(3000);
  }

  // Wait for __viewer
  console.log('Waiting for window.__viewer...');
  for (let i = 0; i < 20; i++) {
    const hasViewer = await browserEval('!!window.__viewer', tid);
    if (hasViewer) break;
    await sleep(500);
  }

  // Load model
  console.log('Loading /temp_fresh_fullbody.glb ...');
  await browserEval(`
    (async () => {
      await window.__viewer.loadModel('/temp_fresh_fullbody.glb?t=' + Date.now());
      window.__viewer.playClip('idle', 0);
    })()
  `, tid);
  await sleep(1000);

  // 1. Full Body Front (Idle)
  console.log('1. Full Body Front (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('idle', 0);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_fullbody_front.jpg');

  // 2. Full Body Side (Idle)
  console.log('2. Full Body Side (Idle)...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(2.4, 1.15, 0);
      dbg.controls.target.set(0, 0.88, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_fullbody_side.jpg');

  // 3. Full Body Back (Idle)
  console.log('3. Full Body Back (Idle)...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.15, -2.4);
      dbg.controls.target.set(0, 0.88, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_fullbody_back.jpg');

  // 4. Face Close-up (Idle)
  console.log('4. Face Close-up (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.setCameraPreset('face', false);
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_face.jpg');

  // 5. Neck Close-up Front & Clavicle (Idle)
  console.log('5. Neck Front & Clavicle (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.setCameraPreset('neck', false);
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_neck_front.jpg');

  // 6. Walk Full Body (Mid-stride)
  console.log('6. Walk Mid-stride...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('walk', 0);
      window.__viewer.seekTime(0.7);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_walk.jpg');

  // 7. Run Full Body (Mid-stride)
  console.log('7. Run Mid-stride...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run', 0);
      window.__viewer.seekTime(0.35);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_run.jpg');

  // 8. Run Neck Close-up: Back of neck during run
  console.log('8. Run Neck Close-up (Back of neck during fast run)...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run', 0);
      window.__viewer.seekTime(0.35);
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0.35, 1.45, -0.65);
      dbg.controls.target.set(0, 1.35, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  await capture(tid, 'shot_gen_run_neck.jpg');

  // Return camera to idle full view
  await browserEval(`
    (() => {
      window.__viewer.playClip('idle', 0);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);

  console.log('✔ All validation screenshots captured successfully!');
}

main().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
