import fs from 'fs';
import path from 'path';
import { browserEval } from './browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';
const tid = '1405A88996E383F6C5BAC7BB0EB49347';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Ensuring fresh fullbody model is loaded...');
  await browserEval(`
    (async () => {
      const url = '/temp_fresh_fullbody.glb?t=' + Date.now();
      await window.__viewer.loadModel(url);
      window.__viewer.playClip('idle');
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.0, 2.5);
      dbg.controls.target.set(0, 0.9, 0);
      dbg.controls.update();
    })()
  `, tid);

  await sleep(1500);

  // 1. Full Body Front Shot
  console.log('1. Full Body Front...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.0, 2.5);
      dbg.controls.target.set(0, 0.9, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotFront = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_front.jpg'), Buffer.from(shotFront.split(',')[1], 'base64'));

  // 2. Full Body Side Shot
  console.log('2. Full Body Side...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(2.4, 1.0, 0.1);
      dbg.controls.target.set(0, 0.9, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotSide = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_side.jpg'), Buffer.from(shotSide.split(',')[1], 'base64'));

  // 3. Close Up Face Shot
  console.log('3. Face Close-up...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.50, 0.65);
      dbg.controls.target.set(0, 1.48, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotFace = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_face.jpg'), Buffer.from(shotFace.split(',')[1], 'base64'));

  // 4. Close Up Neck Shot
  console.log('4. Neck Front Close-up...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.40, 0.70);
      dbg.controls.target.set(0, 1.35, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotNeck = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_neck.jpg'), Buffer.from(shotNeck.split(',')[1], 'base64'));

  // 5. Walk Animation
  console.log('5. Walk Animation...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('walk');
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0.8, 0.95, 2.3);
      dbg.controls.target.set(0, 0.9, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(1200);
  const shotWalk = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_walk.jpg'), Buffer.from(shotWalk.split(',')[1], 'base64'));

  // 6. Run Animation Full Body
  console.log('6. Run Animation Full Body...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run');
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(1.5, 0.85, 2.0);
      dbg.controls.target.set(0, 0.85, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(500);
  const shotRun = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_run.jpg'), Buffer.from(shotRun.split(',')[1], 'base64'));

  // 7. CRITICAL TEST: Run Animation Neck Close-up matching user's media_1791352494592.png
  console.log('7. Run Animation Neck Close-up (User bug angle)...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run');
      // Pause at frame where character leans forward (time = 0.35s)
      const dbg = window.__viewer_debug;
      const mixer = dbg.mixer;
      if (mixer) {
        mixer.setTime(0.35);
      }
      // Camera looking from character right/back side towards neck & head
      dbg.camera.position.set(0.65, 1.35, 0.25);
      dbg.controls.target.set(0, 1.25, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(400);
  const shotRunNeck = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_fresh_fullbody_run_neck.jpg'), Buffer.from(shotRunNeck.split(',')[1], 'base64'));

  console.log('✔ All screenshots captured!');
}

main().catch(console.error);
