import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const ORIGINALS_DIR = path.join(ROOT_DIR, '.agents/coord/gemini_originals');
const CONTROL_URL = 'http://127.0.0.1:9223';

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function evalInTab(targetId, expression) {
  try {
    const res = await fetch(`${CONTROL_URL}/eval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, expression })
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.error };
    return { ok: true, result: data.result, error: data.error };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function getGeminiTargets() {
  const res = await fetch(`${CONTROL_URL}/targets`);
  const data = await res.json();
  const targets = (data.targets || []).filter(
    (t) => t.type === 'page' && t.url && t.url.includes('gemini.google.com')
  );
  return targets;
}

function getPendingQueue() {
  const queueFile = path.join(ROOT_DIR, '.agents/coord/gemini_q/claudeGemQueue.json');
  const fullQueue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));

  const existingFiles = new Set();
  const itemRoot = path.join(ROOT_DIR, 'assets/default/item');
  if (fs.existsSync(itemRoot)) {
    for (const sub of fs.readdirSync(itemRoot)) {
      const dirPath = path.join(itemRoot, sub);
      if (fs.statSync(dirPath).isDirectory()) {
        for (const f of fs.readdirSync(dirPath)) {
          if (f.endsWith('.png')) existingFiles.add(path.basename(f, '.png'));
        }
      }
    }
  }

  return fullQueue.filter((id) => !existingFiles.has(id));
}

async function prepareAndSend(targetId, itemId, prompt) {
  const script = `(async () => {
    // Navigate to new chat if needed
    if (!location.pathname.startsWith('/app')) {
      location.href = 'https://gemini.google.com/app';
      return { ok: false, why: 'navigating' };
    }

    const ed = document.querySelector('rich-textarea .ql-editor');
    if (!ed) return { ok: false, why: 'no editor' };

    ed.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, ${JSON.stringify(prompt)});
    ed.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise(r => setTimeout(r, 400));
    const btn = [...document.querySelectorAll('button[aria-label]')].find(
      x => /send message|发送/i.test(x.getAttribute('aria-label') || '') && !x.disabled
    );
    if (!btn) return { ok: false, why: 'no send button' };

    btn.click();
    return { ok: true };
  })()`;

  return await evalInTab(targetId, script);
}

async function extractAndIngest(targetId, itemId) {
  log(`Waiting for image generation for ${itemId}...`);

  let imgFound = false;
  for (let attempt = 0; attempt < 18; attempt++) {
    await sleep(4000);
    const checkScript = `(() => {
      const img = document.querySelector('model-response img');
      return {
        hasImg: !!img,
        naturalWidth: img ? img.naturalWidth : 0
      };
    })()`;
    const checkRes = await evalInTab(targetId, checkScript);
    if (checkRes.ok && checkRes.result && checkRes.result.hasImg && checkRes.result.naturalWidth > 0) {
      imgFound = true;
      break;
    }
  }

  if (!imgFound) {
    log(`[Warning] No image found for ${itemId} after wait.`);
    return false;
  }

  // Trigger download full size
  await evalInTab(targetId, `(() => {
    const img = document.querySelector('model-response img');
    if (img) img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const dlBtn = [...document.querySelectorAll('button[aria-label]')].find(x => /download full size image|下载全尺寸|下载完整尺寸|下载原图/i.test(x.getAttribute('aria-label') || ''));
    if (dlBtn) dlBtn.click();
  })()`);

  await sleep(3500);

  // Check Downloads directory for latest downloaded Gemini image
  const downloadsDir = path.join(process.env.HOME || '/Users/bytedance', 'Downloads');
  let downloadedPath = null;

  try {
    const files = fs.readdirSync(downloadsDir)
      .filter(f => f.startsWith('Gemini_Generated_Image_') && (f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png')))
      .map(f => ({ name: f, time: fs.statSync(path.join(downloadsDir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 0 && (Date.now() - files[0].time) < 60000) {
      downloadedPath = path.join(downloadsDir, files[0].name);
    }
  } catch {}

  // Fallback to canvas extraction if download file not yet written
  if (!downloadedPath) {
    log(`Downloading file directly via canvas for ${itemId}...`);
    const extractScript = `(() => {
      const img = document.querySelector('model-response img');
      if (!img) return null;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png').split(',')[1];
    })()`;

    const extractRes = await evalInTab(targetId, extractScript);
    if (extractRes.ok && extractRes.result) {
      const origPath = path.join(ORIGINALS_DIR, `${itemId}.png`);
      fs.writeFileSync(origPath, Buffer.from(extractRes.result, 'base64'));
      downloadedPath = origPath;
    }
  }

  if (!downloadedPath || !fs.existsSync(downloadedPath)) {
    log(`[Error] Failed to obtain image for ${itemId}`);
    return false;
  }

  try {
    execSync(`python3 tools/imagegen/ingest.py ${itemId} "${downloadedPath}"`, {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });
    log(`✔ Successfully ingested ${itemId}!`);
    return true;
  } catch (err) {
    log(`[Ingest Error on ${itemId}] ${err.message}`);
    return false;
  }
}

async function main() {
  log('========================================================');
  log('Starting HTTP Gemini Worker (Zero-CDP-Reconnection)');
  log('========================================================');

  const promptsFile = path.join(ROOT_DIR, '.agents/coord/gemini_q/claudeGemPrompts.json');
  const prompts = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));

  let targets = await getGeminiTargets();
  while (targets.length < 2) {
    log('Waiting for 2 Gemini targets on control server...');
    await sleep(3000);
    targets = await getGeminiTargets();
  }

  const targetA = targets[0].targetId;
  const targetB = targets[1].targetId;
  log(`Lane A target: ${targetA}`);
  log(`Lane B target: ${targetB}`);

  let batchCount = 0;

  while (true) {
    const pending = getPendingQueue();
    log(`Items remaining in queue: ${pending.length}`);
    if (pending.length === 0) {
      log('All item images successfully generated and ingested!');
      break;
    }

    const itemA = pending[0];
    const itemB = pending.length > 1 ? pending[1] : null;

    log(`[Lane A] Submitting item: ${itemA}`);
    await prepareAndSend(targetA, itemA, prompts[itemA]);

    if (itemB) {
      log('[Pacing] Waiting 15s before Lane B submission...');
      await sleep(15000);
      log(`[Lane B] Submitting item: ${itemB}`);
      await prepareAndSend(targetB, itemB, prompts[itemB]);
    }

    // Wait and ingest A
    const okA = await extractAndIngest(targetA, itemA);
    if (okA) batchCount++;

    if (itemB) {
      // Wait and ingest B
      const okB = await extractAndIngest(targetB, itemB);
      if (okB) batchCount++;
    }

    if (batchCount >= 4) {
      try {
        execSync(`git add assets/default/item/ && git commit -m "feat(assets): batch ingest ${batchCount} items via HTTP bridge"`, {
          cwd: ROOT_DIR,
          stdio: 'pipe'
        });
        log(`Git commit created for batch of ${batchCount} items.`);
        batchCount = 0;
      } catch (e) {
        log(`Git commit notice: ${e.message}`);
      }
    }

    log('[Pacing] Waiting 15s before next batch round...');
    await sleep(15000);
  }

  if (batchCount > 0) {
    try {
      execSync(`git add assets/default/item/ && git commit -m "feat(assets): final batch ingest ${batchCount} items"`, {
        cwd: ROOT_DIR,
        stdio: 'pipe'
      });
      log(`Final git commit created.`);
    } catch {}
  }
}

main().catch((err) => {
  log(`[Fatal Error] ${err.message}`);
  process.exit(1);
});
