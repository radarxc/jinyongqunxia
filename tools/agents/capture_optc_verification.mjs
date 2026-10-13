import fs from 'fs';
import path from 'path';
import { browserEval } from './browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';
const tid = '47BBC16232D687852F474E0304DCA189';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Reloading Option C (Perfect Neck) model into viewer...');
  await browserEval(`
    (async () => {
      const url = '/assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/anim_idle_walk_run.glb?t=' + Date.now();
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
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_front.jpg'), Buffer.from(shotFront.split(',')[1], 'base64'));

  // 2. Full Body Side Shot
  console.log('2. Full Body Side...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(2.4, 1.0, 0.2);
      dbg.controls.target.set(0, 0.9, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotSide = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_side.jpg'), Buffer.from(shotSide.split(',')[1], 'base64'));

  // 3. Close Up Face Shot
  console.log('3. Face Close-up...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.54, 0.65);
      dbg.controls.target.set(0, 1.50, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotFace = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_face.jpg'), Buffer.from(shotFace.split(',')[1], 'base64'));

  // 4. Front Neck Close-up
  console.log('4. Neck Front Close-up...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.40, 0.45);
      dbg.controls.target.set(0, 1.38, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotNeck = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_neck.jpg'), Buffer.from(shotNeck.split(',')[1], 'base64'));

  // 5. Side / 35° Neck Profile Close-up (Critical inspection angle)
  console.log('5. Neck Side Profile Close-up...');
  await browserEval(`
    (() => {
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0.35, 1.40, 0.35);
      dbg.controls.target.set(0, 1.38, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(300);
  const shotSideNeck = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_side_neck.jpg'), Buffer.from(shotSideNeck.split(',')[1], 'base64'));

  // 6. Walk Animation
  console.log('6. Walk Animation...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('walk');
      const dbg = window.__viewer_debug;
      dbg.camera.position.set(0, 1.0, 2.5);
      dbg.controls.target.set(0, 0.9, 0);
      dbg.controls.update();
    })()
  `, tid);
  await sleep(700);
  const shotWalk = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_walk.jpg'), Buffer.from(shotWalk.split(',')[1], 'base64'));

  // 7. Run Animation
  console.log('7. Run Animation...');
  await browserEval(`window.__viewer.playClip('run')`, tid);
  await sleep(700);
  const shotRun = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'shot_optc_v2_run.jpg'), Buffer.from(shotRun.split(',')[1], 'base64'));

  // Return to idle
  await browserEval(`window.__viewer.playClip('idle')`, tid);

  console.log('Done capturing all Option C v2 screenshots!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
