#!/usr/bin/env node
/**
 * dual_gemini_runner.mjs
 * 
 * Automates two Gemini web tabs (https://gemini.google.com/app) via Chrome DevTools Protocol.
 * Generates item material images at 2 images/min per tab (4 images/min total).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const PORT_FILE = '/Users/bytedance/Library/Application Support/Google/Chrome/DevToolsActivePort';
const G_CODE_FILE = path.join(ROOT_DIR, 'tools/imagegen/gemini_g.js');
const PROMPTS_FILE = path.join(ROOT_DIR, '.agents/coord/gemini_q/claudeGemPrompts.json');
const ORIGINALS_DIR = path.join(ROOT_DIR, '.agents/coord/gemini_originals');

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCdpWsUrl() {
  const lines = fs.readFileSync(PORT_FILE, 'utf8').trim().split('\n');
  const port = lines[0].trim();
  const browserPath = lines[1].trim();
  return `ws://127.0.0.1:${port}${browserPath}`;
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.id && this.callbacks.has(msg.id)) {
            const cb = this.callbacks.get(msg.id);
            this.callbacks.delete(msg.id);
            if (msg.error) cb.reject(msg.error);
            else cb.resolve(msg.result);
          }
        } catch (e) {
          console.error('[CDP] Message parse error:', e);
        }
      };
    });
  }

  send(method, params = {}, sessionId = null) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }
  }
}

async function findGeminiTargets(cdp) {
  const result = await cdp.send('Target.getTargets');
  const targets = (result.targetInfos || []).filter(
    (t) => t.type === 'page' && t.url && t.url.includes('gemini.google.com')
  );
  return targets;
}

class GeminiTab {
  constructor(cdp, targetInfo, lane) {
    this.cdp = cdp;
    this.targetInfo = targetInfo;
    this.targetId = targetInfo.targetId;
    this.lane = lane;
    this.sessionId = null;
  }

  async attach() {
    const res = await this.cdp.send('Target.attachToTarget', {
      targetId: this.targetId,
      flatten: true,
    });
    this.sessionId = res.sessionId;
  }

  async eval(expression, awaitPromise = true) {
    const res = await this.cdp.send(
      'Runtime.evaluate',
      {
        expression,
        returnByValue: true,
        awaitPromise,
      },
      this.sessionId
    );
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : null;
  }

  async bringToFront() {
    await this.cdp.send('Page.bringToFront', {}, this.sessionId);
    await sleep(400);
  }

  async navigateToApp() {
    await this.cdp.send('Page.navigate', { url: 'https://gemini.google.com/app' }, this.sessionId);
    // Wait for page to load
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      try {
        const ready = await this.eval('document.readyState === "complete" && !!document.querySelector("rich-textarea .ql-editor")');
        if (ready) break;
      } catch {}
    }
  }

  async setupDriver(gCode, promptsJson, queueArray) {
    const qKey = `claudeGemQueue${this.lane}`;
    const setupScript = `
      sessionStorage.setItem("claudeLane", ${JSON.stringify(this.lane)});
      localStorage.setItem("claudeG", ${JSON.stringify(gCode)});
      localStorage.setItem(${JSON.stringify(qKey)}, ${JSON.stringify(JSON.stringify(queueArray))});
      localStorage.setItem("claudeGemPrompts", ${JSON.stringify(JSON.stringify(promptsJson))});
      
      window.__claudeTT ??= trustedTypes.createPolicy("cl" + Date.now(), { createScript: (s) => s });
      eval(window.__claudeTT.createScript(localStorage.getItem("claudeG")));
      
      ({
        lane: __g.lane(),
        head: __g.head(),
        left: JSON.parse(localStorage.getItem(__g.qk()) || "[]").length,
        pro: __g.isPro()
      })
    `;
    return await this.eval(setupScript);
  }

  async ensureDriver() {
    const script = `
      window.__claudeTT ??= trustedTypes.createPolicy("cl" + Date.now(), { createScript: (s) => s });
      eval(window.__claudeTT.createScript(localStorage.getItem("claudeG")));
      typeof window.__g !== 'undefined'
    `;
    return await this.eval(script);
  }

  async getQueueHead() {
    return await this.eval('__g.head()');
  }

  async getQueueLeft() {
    return await this.eval('JSON.parse(localStorage.getItem(__g.qk()) || "[]").length');
  }

  async prepareNext() {
    return await this.eval('__g.prepareNext()');
  }

  async send() {
    return await this.eval('__g.send()');
  }

  async waitGen(ms = 38000) {
    return await this.eval(`__g.waitGen(${ms})`);
  }

  async saveFull(id, ms = 25000) {
    const script = `
      (async () => {
        const s = await __g.saveFull(${JSON.stringify(id)}, ${ms});
        let base64 = null;
        if (window.__fullBlob) {
          base64 = await new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result.split(',')[1]);
            reader.readAsDataURL(window.__fullBlob);
          });
        }
        return { ok: s.ok, save: s, base64 };
      })()
    `;
    return await this.eval(script);
  }
}

async function run() {
  console.log('=== Starting Dual Gemini Web Runner (2 tabs, 2 img/min each) ===');
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });

  const cdpUrl = getCdpWsUrl();
  console.log(`Connecting to Chrome via CDP: ${cdpUrl}`);
  const cdp = new CdpClient(cdpUrl);
  await cdp.connect();

  const geminiTargets = await findGeminiTargets(cdp);
  console.log(`Found ${geminiTargets.length} Gemini target(s).`);
  if (geminiTargets.length < 2) {
    console.error(`Need at least 2 Gemini tabs, but found ${geminiTargets.length}. Please open two tabs with https://gemini.google.com/app`);
    process.exit(1);
  }

  const targetA = geminiTargets[0];
  const targetB = geminiTargets[1];
  console.log(`Tab A: Target ${targetA.targetId} (${targetA.title})`);
  console.log(`Tab B: Target ${targetB.targetId} (${targetB.title})`);

  const tabA = new GeminiTab(cdp, targetA, 'A');
  const tabB = new GeminiTab(cdp, targetB, 'B');

  await tabA.attach();
  await tabB.attach();

  const gCode = fs.readFileSync(G_CODE_FILE, 'utf8');
  const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));

  // Get remaining queue from disk and partition
  const queueFile = path.join(ROOT_DIR, '.agents/coord/gemini_q/claudeGemQueue.json');
  const fullQueue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));

  // Filter existing PNGs
  const existingFiles = new Set();
  const scanDirs = ['accessories', 'armor', 'innerarmor', 'clothing', 'footwear', 'weapons', 'manuals', 'collectibles'];
  for (const d of scanDirs) {
    const dirPath = path.join(ROOT_DIR, 'assets/default/item', d);
    if (fs.existsSync(dirPath)) {
      for (const f of fs.readdirSync(dirPath)) {
        if (f.endsWith('.png')) existingFiles.add(path.basename(f, '.png'));
      }
    }
  }

  const pending = fullQueue.filter((id) => !existingFiles.has(id));
  console.log(`Total pending queue items: ${pending.length}`);

  const queueA = pending.filter((_, i) => i % 2 === 0);
  const queueB = pending.filter((_, i) => i % 2 === 1);
  console.log(`Lane A queue: ${queueA.length} items`);
  console.log(`Lane B queue: ${queueB.length} items`);

  console.log('Initializing Tab A...');
  await tabA.bringToFront();
  const initA = await tabA.setupDriver(gCode, prompts, queueA);
  console.log('Tab A ready:', initA);

  console.log('Initializing Tab B...');
  await tabB.bringToFront();
  const initB = await tabB.setupDriver(gCode, prompts, queueB);
  console.log('Tab B ready:', initB);

  let totalCompleted = 0;
  let batchSinceCommit = 0;

  async function processOneItem(tab, tabName) {
    const headId = await tab.getQueueHead();
    if (!headId) {
      console.log(`[${tabName}] Queue is empty! Done.`);
      return null;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`[${tabName}] Starting item: ${headId} (Left in lane: ${await tab.getQueueLeft()})`);

    // 1. Navigate to clean /app
    console.log(`[${tabName}] Navigating to https://gemini.google.com/app...`);
    await tab.bringToFront();
    await tab.navigateToApp();
    await tab.ensureDriver();

    // 2. Prepare next item
    console.log(`[${tabName}] Preparing item (${headId})...`);
    await tab.bringToFront();
    let prep = await tab.prepareNext();
    if (!prep || !prep.ok) {
      console.warn(`[${tabName}] prepareNext failed:`, prep, 'retrying once...');
      await sleep(3000);
      await tab.navigateToApp();
      await tab.ensureDriver();
      await tab.bringToFront();
      prep = await tab.prepareNext();
      if (!prep || !prep.ok) {
        throw new Error(`[${tabName}] prepareNext failed permanently on ${headId}: ${JSON.stringify(prep)}`);
      }
    }
    console.log(`[${tabName}] Prepared:`, prep);

    // 3. Send prompt
    console.log(`[${tabName}] Sending prompt for ${headId}...`);
    await tab.bringToFront();
    let sent = await tab.send();
    if (!sent || !sent.ok) {
      console.warn(`[${tabName}] send failed:`, sent, 'retrying in 4s...');
      await sleep(4000);
      await tab.bringToFront();
      sent = await tab.send();
      if (!sent || !sent.ok) {
        throw new Error(`[${tabName}] send failed permanently on ${headId}: ${JSON.stringify(sent)}`);
      }
    }
    console.log(`[${tabName}] Sent successfully! Model is generating...`);

    // Return an object that allows waiting for generation in parallel while the other tab prepares
    return {
      tab,
      tabName,
      id: headId,
      finishGenAndIngest: async () => {
        console.log(`[${tabName}] Awaiting image generation for ${headId}...`);
        const w = await tab.waitGen(38000);
        if (!w || !w.ok) {
          throw new Error(`[${tabName}] waitGen failed on ${headId}: ${JSON.stringify(w)}`);
        }
        console.log(`[${tabName}] Image generated in ${w.secs}s! Saving full resolution...`);

        const saveRes = await tab.saveFull(headId, 25000);
        if (!saveRes || !saveRes.ok || !saveRes.base64) {
          throw new Error(`[${tabName}] saveFull failed on ${headId}: ${JSON.stringify(saveRes ? saveRes.save : 'null')}`);
        }

        const imgBuffer = Buffer.from(saveRes.base64, 'base64');
        const origPath = path.join(ORIGINALS_DIR, `${headId}.jpg`);
        fs.writeFileSync(origPath, imgBuffer);
        console.log(`[${tabName}] Saved full-size original to ${origPath} (${imgBuffer.length} bytes, ${saveRes.save.w}x${saveRes.save.h})`);

        // Run ingest.py
        console.log(`[${tabName}] Running ingest.py for ${headId}...`);
        const ingestCmd = `python3 tools/imagegen/ingest.py ${headId} ${origPath}`;
        execSync(ingestCmd, { cwd: ROOT_DIR, stdio: 'inherit' });

        totalCompleted++;
        batchSinceCommit++;
        console.log(`✔ [${tabName}] Completed ${headId}! (Total completed in run: ${totalCompleted})`);

        // Check if we should commit
        if (batchSinceCommit >= 4) {
          try {
            console.log(`Committing batch of ${batchSinceCommit} items...`);
            execSync('git clean -fd assets/default/item/accessories/icons 2>/dev/null || true', { cwd: ROOT_DIR });
            execSync(`git add assets/default/item/ && git commit -m "feat(assets): batch ingest ${batchSinceCommit} items via dual Gemini tabs"`, { cwd: ROOT_DIR, stdio: 'inherit' });
            batchSinceCommit = 0;
          } catch (e) {
            console.warn('Git commit warning:', e.message);
          }
        }
      },
    };
  }

  // Interleaved pipeline loop:
  // Tab A submits -> wait 15s -> Tab B submits -> Tab A finishes gen & ingests -> Tab A submits next...
  console.log('\n=== Starting Interleaved Generation Pipeline ===');

  let inflightA = null;
  let inflightB = null;

  const maxArgIdx = process.argv.indexOf('--max');
  const maxItems = maxArgIdx !== -1 ? parseInt(process.argv[maxArgIdx + 1], 10) : Infinity;
  console.log(`Max items limit for this run: ${maxItems}`);

  while (true) {
    if (totalCompleted >= maxItems) {
      console.log(`Reached max items limit (${maxItems}). Stopping cleanly.`);
      break;
    }
    const leftA = await tabA.getQueueLeft();
    const leftB = await tabB.getQueueLeft();
    if (leftA === 0 && leftB === 0 && !inflightA && !inflightB) {
      console.log('Both lane queues are completely empty! Mission accomplished!');
      break;
    }

    // Step 1: Start or complete Tab A
    if (leftA > 0 || inflightA) {
      if (inflightA) {
        await inflightA.finishGenAndIngest();
        inflightA = null;
      }
      if (leftA > 0) {
        inflightA = await processOneItem(tabA, 'Tab A');
      }
    }

    // Rate pacing: wait 15 seconds before touching Tab B (guarantees <= 4 requests/min across both tabs)
    console.log('Pacing: Waiting 15s before Tab B submission...');
    await sleep(15000);

    // Step 2: Start or complete Tab B
    if (leftB > 0 || inflightB) {
      if (inflightB) {
        await inflightB.finishGenAndIngest();
        inflightB = null;
      }
      if (leftB > 0) {
        inflightB = await processOneItem(tabB, 'Tab B');
      }
    }

    // Rate pacing: wait 15 seconds before touching Tab A
    console.log('Pacing: Waiting 15s before Tab A submission...');
    await sleep(15000);
  }

  // Final commit if any uncommitted
  if (batchSinceCommit > 0) {
    try {
      execSync('git clean -fd assets/default/item/accessories/icons 2>/dev/null || true', { cwd: ROOT_DIR });
      execSync(`git add assets/default/item/ && git commit -m "feat(assets): final batch ingest ${batchSinceCommit} items"`, { cwd: ROOT_DIR, stdio: 'inherit' });
    } catch {}
  }

  cdp.close();
  console.log(`=== Done! Total items completed: ${totalCompleted} ===`);
}

run().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
