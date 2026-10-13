#!/usr/bin/env node
/**
 * 物品三视图批量生成工具（依据用户指示：Tripo HD Model Upload -> Generate Multi-Views -> 下载三视图）
 * 走持久化 CDP 端口 9223，操作 window.__t，符合 AR-100 铁律。
 *
 * 用法：
 *   node tools/model3d/generate_item_multiviews.mjs --category armor
 *   node tools/model3d/generate_item_multiviews.mjs --category innerarmor
 *   node tools/model3d/generate_item_multiviews.mjs --file assets/default/item/armor/eq_pijia.png
 *   node tools/model3d/generate_item_multiviews.mjs --all-equipment --limit 10
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { browserEval } from '../agents/browser_eval.mjs';

function getTargets() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/targets', (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(d).targets || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function getTripoTargetId() {
  const targets = await getTargets();
  const tripo = targets.find((t) => t.url && t.url.includes('tripo3d.ai') && t.type === 'page')
    || targets.find((t) => t.url && t.url.includes('tripo3d.ai'));
  if (tripo) return tripo.targetId;
  throw new Error('未检测到 Tripo 标签页，请在 Chrome「Claude」标签组中保持打开 https://studio.tripo3d.ai/workspace/generate');
}

const ITEM_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/assets/default/item');
const OUT_BASE_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/assets/default/item_multiview');

const EQUIPMENT_CATEGORIES = [
  'armor',
  'innerarmor',
  'clothing',
  'weapons',
  'hidden-weapons',
  'shoes',
  'belts',
  'accessories',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * 确保页面加载最新 tripo_web.js 驱动
 */
async function syncDriver() {
  const tid = await getTripoTargetId();
  const driverCode = fs.readFileSync(path.resolve('tools/model3d/tripo_web.js'), 'utf8');
  await browserEval(`
    (() => {
      window.__claudeTT ??= trustedTypes.createPolicy('cl' + Date.now(), { createScript: (s) => s });
      eval(window.__claudeTT.createScript(${JSON.stringify(driverCode)}));
      return window.__t?.ver;
    })()
  `, tid);
}

/**
 * 单个物品生成三/四视图流程
 */
async function processItem(itemPath, outDir) {
  const tid = await getTripoTargetId();
  const filename = path.basename(itemPath);
  const itemId = filename.replace(/\.[^/.]+$/, '');
  const itemOutDir = path.join(outDir, itemId);

  // 幂等：若已生成 4 张视图，直接跳过
  if (
    fs.existsSync(path.join(itemOutDir, 'front.jpg')) &&
    fs.existsSync(path.join(itemOutDir, 'left.jpg')) &&
    fs.existsSync(path.join(itemOutDir, 'back.jpg')) &&
    fs.existsSync(path.join(itemOutDir, 'right.jpg'))
  ) {
    console.log(`[Skip] ${itemId} already completed in ${itemOutDir}`);
    return true;
  }

  console.log(`\n========================================`);
  console.log(`[Processing] ${itemId} (${filename})`);
  console.log(`========================================`);

  const b64 = fs.readFileSync(itemPath).toString('base64');
  const mimeType = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';

  // 1. 上传参考图到 IndexedDB
  console.log(`  1. Staging into browser IndexedDB...`);
  await browserEval(`
    (async () => {
      const b64 = "${b64}";
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const blob = new Blob([u8], { type: "${mimeType}" });
      await window.__t.idbPut("${filename}", blob);
    })()
  `, tid);

  // 2. 切到 imageToModel 并清空旧上传
  console.log(`  2. Switching to imageToModel & clear old upload...`);
  await browserEval(`
    (async () => {
      await window.__t.toGenerate("imageToModel");
      window.__t.clearUpload();
    })()
  `, tid);
  await sleep(1500);

  // 3. 将参考图挂载到上传槽位并触发内部上传
  console.log(`  3. Uploading reference to Tripo...`);
  const uploadRes = await browserEval(`window.__t.uploadRef("${filename}")`, tid);
  if (!uploadRes || !uploadRes.ok) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadRes)}`);
  }
  console.log(`     Upload OK (key=${uploadRes.key}, audit=${uploadRes.audit})`);
  await sleep(2000);

  // 4. 触发 Generate Multi-Views 并由 Node 端轮询等待完成（避免单次 eval 长连接超时）
  console.log(`  4. Triggering Generate Multi-Views...`);
  const triggerRes = await browserEval(`
    (async () => {
      const btn = document.querySelector('button[title="Generate Multi Views"]');
      if (btn) {
        btn.click();
        return { ok: true, via: 'click' };
      }
      const st = window.__t.gst();
      if (st && st.beginMultiViewGeneration) {
        await st.beginMultiViewGeneration();
        return { ok: true, via: 'store' };
      }
      return { ok: false, why: 'button not found' };
    })()
  `, tid);

  if (!triggerRes || !triggerRes.ok) {
    throw new Error(`Trigger Generate Multi-Views failed: ${JSON.stringify(triggerRes)}`);
  }

  console.log(`     Waiting for generation to finish...`);
  let generationSuccess = false;
  for (let poll = 1; poll <= 30; poll++) {
    await sleep(2500);
    const pollStatus = await browserEval(`
      (() => {
        const st = window.__t.gst();
        const imgs = st?.multiViewImages ? Object.values(st.multiViewImages).filter(Boolean) : [];
        return {
          loading: !!st?.genMultiViewLoading,
          imgCount: imgs.length
        };
      })()
    `, tid);

    if (poll % 2 === 0 || !pollStatus.loading) {
      console.log(`     [Poll ${poll}] loading=${pollStatus.loading}, count=${pollStatus.imgCount}`);
    }

    if (!pollStatus.loading && pollStatus.imgCount >= 3) {
      generationSuccess = true;
      break;
    }
  }

  if (!generationSuccess) {
    throw new Error(`Multi-views generation timed out or returned insufficient images`);
  }

  // 提取当前页面上生成的 4 张图片 URL
  const viewUrls = await browserEval(`
    (() => {
      const domImgs = Array.from(document.querySelectorAll('.p-3 img, .aspect-square img, [class*=multi] img'))
        .map((img) => img.src)
        .filter((src) => src.startsWith('http'));
      return Array.from(new Set(domImgs));
    })()
  `, tid);

  if (!viewUrls || viewUrls.length < 3) {
    throw new Error(`Could not extract image URLs: found ${viewUrls?.length || 0}`);
  }
  console.log(`     Multi-Views generated! Found ${viewUrls.length} views.`);

  // 5. 下载视图图片
  fs.mkdirSync(itemOutDir, { recursive: true });
  const viewNames = ['front', 'left', 'back', 'right'];
  const manifest = {
    itemId,
    sourceFile: itemPath,
    generatedAt: new Date().toISOString(),
    views: {},
  };

  for (let i = 0; i < viewUrls.length; i++) {
    const viewName = viewNames[i] || `view_${i}`;
    const destFile = path.join(itemOutDir, `${viewName}.jpg`);
    console.log(`  5. Downloading ${viewName} -> ${destFile}...`);
    await download(viewUrls[i], destFile);
    manifest.views[viewName] = {
      file: `${viewName}.jpg`,
      size: fs.statSync(destFile).size,
      remoteUrl: viewUrls[i].split('?')[0],
    };
  }

  fs.writeFileSync(path.join(itemOutDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`🎉 [Success] ${itemId} multi-views saved to ${itemOutDir}`);
  return true;
}

/**
 * CLI 解析与主循环
 */
async function main() {
  const args = process.argv.slice(2);
  const ALL_CATEGORIES = [
    'armor',
    'innerarmor',
    'weapons',
    'clothing',
    'hidden-weapons',
    'shoes',
    'belts',
    'accessories',
    'collectibles',
    'food',
    'manuals',
    'medicine',
  ];

  let category = null;
  let singleFile = null;
  let allEquip = false;
  let limit = Infinity;
  let isAll = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) category = args[++i];
    else if (args[i] === '--file' && args[i + 1]) singleFile = args[++i];
    else if (args[i] === '--all-equipment') allEquip = true;
    else if (args[i] === '--all') isAll = true;
    else if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[++i], 10);
  }

  await syncDriver();
  console.log('Tripo driver synchronized.');

  if (singleFile) {
    const resolved = path.resolve(singleFile);
    const cat = path.basename(path.dirname(resolved));
    const outDir = path.join(OUT_BASE_DIR, cat);
    await processItem(resolved, outDir);
    return;
  }

  const targets = [];
  const cats = category ? [category] : isAll ? ALL_CATEGORIES : allEquip ? EQUIPMENT_CATEGORIES : ALL_CATEGORIES;

  if (cats.length === 0) {
    console.log(`
使用方法:
  node tools/model3d/generate_item_multiviews.mjs --category armor
  node tools/model3d/generate_item_multiviews.mjs --category innerarmor
  node tools/model3d/generate_item_multiviews.mjs --category clothing --limit 5
  node tools/model3d/generate_item_multiviews.mjs --file assets/default/item/armor/eq_mingguangkai.png
  node tools/model3d/generate_item_multiviews.mjs --all-equipment --limit 20
    `);
    process.exit(1);
  }

  for (const c of cats) {
    const dir = path.join(ITEM_DIR, c);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    for (const f of files) {
      targets.push({
        cat: c,
        filePath: path.join(dir, f),
      });
    }
  }

  console.log(`Found ${targets.length} item(s) to process (limit: ${limit}).`);
  const queue = targets.slice(0, limit);

  const STATUS_FILE = path.resolve('.agents/coord/item_multiview_status.json');
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  const startTime = new Date().toISOString();

  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < queue.length; idx++) {
    const item = queue[idx];
    console.log(`\n[Queue Progress] (${idx + 1}/${queue.length}) [${item.cat}] ${path.basename(item.filePath)}`);
    try {
      const outDir = path.join(OUT_BASE_DIR, item.cat);
      await processItem(item.filePath, outDir);
      successCount++;
    } catch (err) {
      console.error(`❌ Error processing ${item.filePath}:`, err.message);
      failCount++;
    }

    fs.writeFileSync(
      STATUS_FILE,
      JSON.stringify(
        {
          startTime,
          updatedAt: new Date().toISOString(),
          currentIndex: idx + 1,
          total: queue.length,
          currentCategory: item.cat,
          currentItem: path.basename(item.filePath),
          successCount,
          failCount,
          percent: Math.round(((idx + 1) / queue.length) * 100),
        },
        null,
        2
      )
    );

    // 间隔冷却，避免频繁请求
    await sleep(2000);
  }

  console.log(`\n========================================`);
  console.log(`All Done! Success: ${successCount}, Failed: ${failCount}`);
  console.log(`========================================`);
}

main().catch(console.error);
