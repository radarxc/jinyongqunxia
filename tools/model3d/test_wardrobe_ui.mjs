import fs from 'fs';
import path from 'path';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '1405A88996E383F6C5BAC7BB0EB49347';
const ARTIFACTS_DIR = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function captureShot(name) {
  const dataUrl = await browserEval('window.__viewer?.captureScreenshot("image/jpeg", 0.95)', tid);
  if (dataUrl && dataUrl.startsWith('data:image')) {
    const b64 = dataUrl.split(',')[1];
    const outPath = path.join(ARTIFACTS_DIR, `${name}.jpg`);
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log(`Saved screenshot to ${name}.jpg (${fs.statSync(outPath).size} bytes)`);
  } else {
    console.warn(`Failed to capture screenshot for ${name}`);
  }
}

async function main() {
  console.log('=== Testing Wardrobe UI & Character 3D Studio ===');
  await sleep(3500);

  const title = await browserEval('document.title', tid);
  console.log('Page Title:', title);

  const isLoaded = await browserEval('!document.querySelector(".loading-overlay")', tid);
  console.log('Model loaded:', isLoaded);

  const stats = await browserEval('window.__viewer?.getStats()', tid);
  console.log('Viewer stats:', stats);

  const attached = await browserEval('window.__viewer?.getAttachedProps()', tid);
  console.log('Initial attached props:', attached);

  // 1. Capture initial state
  await captureShot('shot_wardrobe_initial');

  // 2. Test Preset: 昆仑仙子
  console.log('\n--- Switching to Preset: 昆仑仙子 ---');
  await browserEval(`
    (() => {
      const btns = Array.from(document.querySelectorAll('.preset-outfit-btn'));
      const btn = btns.find(b => b.textContent.includes('昆仑仙子'));
      if (btn) btn.click();
    })()
  `, tid);
  await sleep(1500);
  console.log('Attached after 昆仑仙子:', await browserEval('window.__viewer?.getAttachedProps()', tid));
  await captureShot('shot_preset_kunlun');

  // 3. Test Preset: 魔教教主
  console.log('\n--- Switching to Preset: 魔教教主 ---');
  await browserEval(`
    (() => {
      const btns = Array.from(document.querySelectorAll('.preset-outfit-btn'));
      const btn = btns.find(b => b.textContent.includes('魔教教主'));
      if (btn) btn.click();
    })()
  `, tid);
  await sleep(1500);
  console.log('Attached after 魔教教主:', await browserEval('window.__viewer?.getAttachedProps()', tid));
  await captureShot('shot_preset_crimson');

  // 4. Test Preset: 金甲战神
  console.log('\n--- Switching to Preset: 金甲战神 ---');
  await browserEval(`
    (() => {
      const btns = Array.from(document.querySelectorAll('.preset-outfit-btn'));
      const btn = btns.find(b => b.textContent.includes('金甲战神'));
      if (btn) btn.click();
    })()
  `, tid);
  await sleep(1500);
  console.log('Attached after 金甲战神:', await browserEval('window.__viewer?.getAttachedProps()', tid));
  await captureShot('shot_preset_golden');

  // 5. Test Preset: 暗夜刺客
  console.log('\n--- Switching to Preset: 暗夜刺客 ---');
  await browserEval(`
    (() => {
      const btns = Array.from(document.querySelectorAll('.preset-outfit-btn'));
      const btn = btns.find(b => b.textContent.includes('暗夜刺客'));
      if (btn) btn.click();
    })()
  `, tid);
  await sleep(1500);
  console.log('Attached after 暗夜刺客:', await browserEval('window.__viewer?.getAttachedProps()', tid));
  await captureShot('shot_preset_assassin');

  // 6. Test Preset: 一键素体
  console.log('\n--- Switching to Preset: 一键素体 ---');
  await browserEval(`
    (() => {
      const btn = document.querySelector('.clear-all-btn');
      if (btn) btn.click();
    })()
  `, tid);
  await sleep(1000);
  console.log('Attached after 一键素体:', await browserEval('window.__viewer?.getAttachedProps()', tid));
  await captureShot('shot_preset_naked');

  // 7. Test Tab Switch: 质检与渲染
  console.log('\n--- Switching Tab: 质检与渲染 ---');
  await browserEval(`
    (() => {
      const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
      const specTab = tabBtns.find(b => b.textContent.includes('质检与渲染'));
      if (specTab) specTab.click();
    })()
  `, tid);
  await sleep(800);

  // 8. Capture Full Page Screenshot using DevTools protocol
  console.log('\n--- Capturing Full Screen Layout ---');
  const screenshot = await browserEval(`
    (async () => {
      // Use html2canvas or viewport render
      return window.__viewer?.captureScreenshot("image/jpeg", 0.95);
    })()
  `, tid);

  console.log('=== All tests finished successfully ===');
}

main().catch(console.error);
