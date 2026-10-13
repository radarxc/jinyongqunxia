/* global Buffer, setTimeout, fetch */
import fs from 'fs';
import path from 'path';
import { browserEval } from './browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getViewerTargetId() {
  const res = await fetch('http://127.0.0.1:9223/targets');
  const data = await res.json();
  const c3d = data.targets?.find(t => t.url && t.url.includes('character-3d') && t.type === 'page')
    || data.targets?.find(t => t.title && t.title.includes('天书录') && t.type === 'page')
    || data.targets?.find(t => t.url && t.url.includes('localhost:5173') && t.type === 'page');
  if (!c3d) throw new Error('character-3d target not found');
  const tid = c3d.targetId || c3d.id;
  if (!c3d.url.includes('character-3d')) {
    await browserEval('location.href = "http://localhost:5173/?character-3d"', tid);
    await sleep(2500);
  }
  return tid;
}

let TARGET_ID = null;

async function evalViewer(expr) {
  return browserEval(expr, TARGET_ID);
}

async function capture(filename) {
  const dataUrl = await evalViewer(`
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
  `);
  if (dataUrl && dataUrl.startsWith('data:image/')) {
    const base64 = dataUrl.split(',')[1];
    const outPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
    console.log(`Saved ${filename} (${base64.length} bytes)`);
    return outPath;
  }
  throw new Error(`Failed to capture canvas dataURL for ${filename}`);
}

async function main() {
  TARGET_ID = await getViewerTargetId();
  console.log('Using character-3d target ID:', TARGET_ID);

  console.log('Reloading fresh model into viewer...');
  await evalViewer(`(async () => {
    await window.__viewer.loadModel('/assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/anim_idle_walk_run.glb?t=' + Date.now());
  })()`);
  await sleep(2000);

  // 1. Full Body View (idle)
  console.log('1. Capturing Full Body View...');
  await evalViewer(`window.__viewer.playClip('idle'); window.__viewer.setCameraPreset('full', false)`);
  await sleep(600);
  await capture('shot_v19_full.jpg');

  // 2. Face View (idle)
  console.log('2. Capturing Face View...');
  await evalViewer(`window.__viewer.setCameraPreset('face', false)`);
  await sleep(600);
  await capture('shot_v19_face.jpg');

  // 3. Neck View (Front close-up)
  console.log('3. Capturing Neck View...');
  await evalViewer(`
    (() => {
      const dbg = window.__viewer_debug;
      if (dbg) {
        dbg.controls.target.set(0, 1.40, 0);
        dbg.camera.position.set(0, 1.40, 0.42);
        dbg.controls.update();
      } else {
        window.__viewer.setCameraPreset('neck', false);
      }
    })()
  `);
  await sleep(600);
  await capture('shot_v19_neck.jpg');

  // 4. Shoulder & Trapezius View
  console.log('4. Capturing Shoulder & Trapezius View...');
  await evalViewer(`
    (() => {
      const dbg = window.__viewer_debug;
      if (dbg) {
        dbg.controls.target.set(0, 1.35, 0);
        dbg.camera.position.set(0, 1.38, 0.65);
        dbg.controls.update();
      }
    })()
  `);
  await sleep(600);
  await capture('shot_v19_shoulder.jpg');

  // 5. 35° Side Profile of Neck
  console.log('5. Capturing Neck 35° Profile...');
  await evalViewer(`
    (() => {
      const dbg = window.__viewer_debug;
      if (dbg) {
        dbg.controls.target.set(0, 1.40, 0);
        dbg.camera.position.set(0.24, 1.40, 0.35);
        dbg.controls.update();
      }
    })()
  `);
  await sleep(600);
  await capture('shot_v19_side.jpg');

  // 6. Walk Animation
  console.log('6. Capturing Walk Animation...');
  await evalViewer(`
    (() => {
      window.__viewer.playClip('walk');
      const dbg = window.__viewer_debug;
      if (dbg) {
        dbg.controls.target.set(0, 1.35, 0);
        dbg.camera.position.set(0, 1.38, 0.85);
        dbg.controls.update();
      }
    })()
  `);
  await sleep(800);
  await capture('shot_v19_walk.jpg');

  // 7. Run Animation
  console.log('7. Capturing Run Animation...');
  await evalViewer(`window.__viewer.playClip('run')`);
  await sleep(800);
  await capture('shot_v19_run.jpg');

  // 8. Bind Pose (static anatomical rest pose)
  console.log('8. Capturing Bind Pose Neck & Full...');
  await evalViewer(`
    (() => {
      const dbg = window.__viewer_debug;
      if (dbg && dbg.mixer) {
        dbg.mixer.stopAllAction();
        dbg.modelRoot.traverse(node => {
          if (node.isSkinnedMesh && node.skeleton) {
            node.skeleton.pose();
          }
        });
      }
      window.__viewer.setCameraPreset('neck', false);
    })()
  `);
  await sleep(600);
  await capture('shot_v19_bind_neck.jpg');

  await evalViewer(`window.__viewer.setCameraPreset('full', false)`);
  await sleep(600);
  await capture('shot_v19_bind_full.jpg');

  // Return to idle
  await evalViewer(`window.__viewer.playClip('idle')`);

  console.log('All verification shots captured successfully!');
}

main().catch(err => {
  console.error('Error running verification capture:', err);
  process.exit(1);
});
