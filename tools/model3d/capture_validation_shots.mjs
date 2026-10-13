import fs from 'fs';
import path from 'path';
import { browserEval, getGameTargetId } from '../agents/browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('--- Starting Fine Validation Screenshot Capture ---');
  const tid = '1405A88996E383F6C5BAC7BB0EB49347';
  console.log('Using viewer target ID:', tid);

  // Load model
  await browserEval(`
    (async () => {
      await window.__viewer.loadModel('/temp_fresh_fullbody.glb');
      window.__viewer.playClip('idle', 0);
    })()
  `, tid);
  await sleep(400);

  // 1. Full Body Front (Idle)
  console.log('1. Full Body Front (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('idle', 0);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(200);
  let shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_front.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

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
  await sleep(200);
  shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_side.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

  // 3. Face Close-up (Idle)
  console.log('3. Face Close-up (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.setCameraPreset('face', false);
    })()
  `, tid);
  await sleep(200);
  shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_face.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

  // 4. Neck Close-up Front & Clavicle (Idle)
  console.log('4. Neck Front & Clavicle (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.setCameraPreset('neck', false);
    })()
  `, tid);
  await sleep(200);
  shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_neck.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

  // 5. Walk Full Body (Mid-stride)
  console.log('5. Walk Mid-stride...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('walk', 0);
      window.__viewer.seekTime(0.7);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(200);
  shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_walk.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

  // 6. Run Full Body (Mid-stride)
  console.log('6. Run Mid-stride...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run', 0);
      window.__viewer.seekTime(0.35);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(200);
  shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_run.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

  // 7. Run Neck Close-up: Focused right on neck during run
  console.log('7. Run Neck Close-ups across strides...');
  const timepoints = [0.35, 0.65, 0.95];
  for (let i = 0; i < timepoints.length; i++) {
    const t = timepoints[i];
    await browserEval(`
      (() => {
        window.__viewer.playClip('run', 0);
        window.__viewer.seekTime(${t});
        const dbg = window.__viewer_debug;
        let neck = null;
        dbg.modelScene.traverse(o => {
          if (o.name && o.name.toLowerCase().includes('neck')) neck = o;
        });
        const neckPos = dbg.camera.position.clone();
        if (neck) neck.getWorldPosition(neckPos);
        else neckPos.set(0, 1.20, 0.25);

        // Right side profile close-up centered on neck:
        dbg.controls.target.copy(neckPos);
        dbg.camera.position.set(neckPos.x + 0.50, neckPos.y + 0.04, neckPos.z);
        dbg.controls.update();
      })()
    `, tid);
    await sleep(200);
    shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
    fs.writeFileSync(path.join(ARTIFACTS_DIR, `shot_fresh_fullbody_run_neck_t${i}.jpg`), Buffer.from(shot.split(',')[1], 'base64'));
  }

  // 8. Run Neck 3/4 Back Profile (checking behind ear and trapezius during run)
  console.log('8. Run Neck 3/4 Back Profile...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run', 0);
      window.__viewer.seekTime(0.35);
      const dbg = window.__viewer_debug;
      let neck = null;
      dbg.modelScene.traverse(o => {
        if (o.name && o.name.toLowerCase().includes('neck')) neck = o;
      });
      const neckPos = dbg.camera.position.clone();
      if (neck) neck.getWorldPosition(neckPos);
      else neckPos.set(0, 1.20, 0.25);

      dbg.controls.target.copy(neckPos);
      dbg.camera.position.set(neckPos.x + 0.40, neckPos.y + 0.08, neckPos.z - 0.40);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(200);
  shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_run_neck_back.jpg'), Buffer.from(shot.split(',')[1], 'base64'));

  // Copy t0 to primary shot_fresh_fullbody_run_neck.jpg
  const t0Data = fs.readFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_run_neck_t0.jpg'));
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_run_neck.jpg'), t0Data);

  console.log('All fine captures completed!');
}

main().catch(console.error);
