import fs from 'fs';
import path from 'path';
import { browserEval } from '../agents/browser_eval.mjs';

const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';
const tid = 'F81CAF44B943701AF44E550CC3C9D3FF';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function captureShot(filename, cameraFn) {
  if (cameraFn) {
    await browserEval(`(${cameraFn.toString()})()`, tid);
    await sleep(300);
  }
  const shot = await browserEval(`window.__viewer.captureScreenshot('image/jpeg', 0.95)`, tid);
  const buf = Buffer.from(shot.split(',')[1], 'base64');
  const outPath = path.join(ARTIFACTS_DIR, filename);
  fs.writeFileSync(outPath, buf);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log('--- Verifying Seamless Fullbody Neck & Clothing Orientations ---');

  // 1. 素体基础状态：正面全景
  console.log('1. Base Body Full Front (Idle)...');
  await browserEval(`
    (() => {
      window.__viewer.clearProps();
      window.__viewer.playClip('idle', 0);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(400);
  await captureShot('verify_seamless_full_front.jpg');

  // 2. 素体颈部特写 - Idle
  console.log('2. Base Body Neck Close-up Front (Idle)...');
  await captureShot('verify_seamless_neck_idle_front.jpg', () => {
    const dbg = window.__viewer_debug;
    dbg.camera.position.set(0, 1.45, 0.7);
    dbg.controls.target.set(0, 1.40, 0);
    dbg.controls.update();
  });

  // 3. 素体颈部特写 - Side 45度
  console.log('3. Base Body Neck Close-up 45deg (Idle)...');
  await captureShot('verify_seamless_neck_idle_45deg.jpg', () => {
    const dbg = window.__viewer_debug;
    dbg.camera.position.set(0.5, 1.45, 0.5);
    dbg.controls.target.set(0, 1.40, 0);
    dbg.controls.update();
  });

  // 4. 素体颈部特写 - 奔跑动画 Run
  console.log('4. Base Body Neck Close-up (Run animation)...');
  await browserEval(`
    (() => {
      window.__viewer.playClip('run', 0.2);
    })()
  `, tid);
  await sleep(600);
  await captureShot('verify_seamless_neck_run_front.jpg', () => {
    const dbg = window.__viewer_debug;
    dbg.camera.position.set(0, 1.42, 0.75);
    dbg.controls.target.set(0, 1.38, 0);
    dbg.controls.update();
  });

  await captureShot('verify_seamless_neck_run_side.jpg', () => {
    const dbg = window.__viewer_debug;
    dbg.camera.position.set(0.65, 1.42, 0.45);
    dbg.controls.target.set(0, 1.38, 0);
    dbg.controls.update();
  });

  // 切回 Idle
  await browserEval(`
    (() => {
      window.__viewer.playClip('idle', 0.2);
      window.__viewer.setCameraPreset('full', false);
    })()
  `, tid);
  await sleep(400);

  // 5. 逐个验证 5 套服装的正面与朝向（重置视角到全身）
  console.log('5. Testing 5 Clothes Orientations via Equipment Cards...');

  const clothes = [
    { id: 'cloth_crimson_gown', name: '赤霞织金袍', file: 'verify_cloth_crimson_gown.jpg' },
    { id: 'cloth_xianxia_dress', name: '仙侠流仙裙', file: 'verify_cloth_xianxia_dress.jpg' },
    { id: 'cloth_black_assassin', name: '玄天夜行衣', file: 'verify_cloth_black_assassin.jpg' },
    { id: 'cloth_kunlun_taoist', name: '昆仑素雪道袍', file: 'verify_cloth_kunlun_taoist.jpg' },
    { id: 'cloth_golden_armor', name: '紫金龙纹锦甲', file: 'verify_cloth_golden_armor.jpg' },
  ];

  for (const c of clothes) {
    console.log(`Equipping ${c.name} (${c.id})...`);
    await browserEval(`
      (async () => {
        // 先切到锦衣 tab
        const catBtn = Array.from(document.querySelectorAll('.cat-tab-btn')).find(el => el.innerText.includes('锦衣'));
        if (catBtn) catBtn.click();
      })()
    `, tid);
    await sleep(200);

    const clickResult = await browserEval(`
      (async () => {
        const card = Array.from(document.querySelectorAll('.equipment-card')).find(el => el.innerText.includes('${c.name}'));
        if (card) {
          card.click();
          return 'clicked';
        }
        return 'not_found';
      })()
    `, tid);
    console.log(`Click result for ${c.name}:`, clickResult);
    // Wait for GLTF to load and attach
    await sleep(1200);

    // 全身正面截图
    await captureShot(c.file, () => {
      window.__viewer.setCameraPreset('full', false);
    });
  }

  // 6. 验证 5 套一键预设 (Outfit Presets)
  console.log('6. Testing 5 Preset Outfits...');
  const presets = [
    { name: '越女剑仙', file: 'verify_preset_xianxia.jpg' },
    { name: '昆仑仙子', file: 'verify_preset_kunlun.jpg' },
    { name: '魔教教主', file: 'verify_preset_mojiao.jpg' },
    { name: '暗夜刺客', file: 'verify_preset_assassin.jpg' },
    { name: '金甲战神', file: 'verify_preset_warrior.jpg' },
  ];

  for (const p of presets) {
    console.log(`Applying Preset: ${p.name}...`);
    const pRes = await browserEval(`
      (async () => {
        const p = window.__PRESET_OUTFITS ? window.__PRESET_OUTFITS.find(x => x.name === '${p.name}') : null;
        if (p && window.__applyOutfitPreset) {
          await window.__applyOutfitPreset(p);
          return 'called_direct';
        }
        const btn = Array.from(document.querySelectorAll('.preset-outfit-btn')).find(el => el.innerText.includes('${p.name}'));
        if (btn) {
          btn.click();
          return 'clicked';
        }
        return 'not_found';
      })()
    `, tid);
    console.log(`Preset result for ${p.name}:`, pRes);
    await sleep(2500);

    await captureShot(p.file, () => {
      window.__viewer.setCameraPreset('full', false);
    });
  }

  console.log('All verification screenshots captured successfully!');
}

run().catch(console.error);
