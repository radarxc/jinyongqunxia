#!/usr/bin/env node
/**
 * tri_pipeline_runner.mjs
 * 
 * Persistent multi-pipeline browser daemon & runner (AR-100):
 * - Maintains ONE persistent WebSocket connection to Chrome CDP (NEVER drops or repeatedly reconnects).
 * - Exposes local control HTTP server on http://127.0.0.1:9223 for subagents/tools to query or eval.
 * - Tripo Web 3D: 3D character model generation, rigging (Mixamo 65 bones), retargeting (idle/walk/run), export, and ingest.
 * - Dual Gemini Web: item material generation (optional, enabled via ENABLE_GEMINI=true).
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import WebSocket from '../../node_modules/.pnpm/ws@8.22.0/node_modules/ws/wrapper.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const PORT_FILE = '/Users/bytedance/Library/Application Support/Google/Chrome/DevToolsActivePort';
const G_CODE_FILE = path.join(ROOT_DIR, 'tools/imagegen/gemini_g.js');
const T_CODE_FILE = path.join(ROOT_DIR, 'tools/model3d/tripo_web.js');
const PROMPTS_FILE = path.join(ROOT_DIR, '.agents/coord/gemini_q/claudeGemPrompts.json');
const ORIGINALS_DIR = path.join(ROOT_DIR, '.agents/coord/gemini_originals');
const LOG_FILE = path.join(ROOT_DIR, '.agents/coord/tri_pipeline.log');
const STATUS_FILE = path.join(ROOT_DIR, '.agents/coord/tri_pipeline.status.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}

function updateStatus(patch) {
  try {
    let current = {};
    if (fs.existsSync(STATUS_FILE)) {
      try { current = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8')); } catch {}
    }
    const updated = { ...current, ...patch, lastUpdate: new Date().toISOString() };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(updated, null, 2));
  } catch {}
}

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
    this.keepAlive = null;
  }

  async connect(timeoutMs = 0) {
    try {
      this.wsUrl = getCdpWsUrl();
    } catch {}
    return new Promise((resolve, reject) => {
      let timer = null;
      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          try { if (this.ws) this.ws.close(); } catch {}
          reject(new Error('Connect handshake timeout (waiting for user approval in Chrome)'));
        }, timeoutMs);
      }

      try {
        this.ws = new WebSocket(this.wsUrl, { maxPayload: 512 * 1024 * 1024 });
      } catch (err) {
        if (timer) clearTimeout(timer);
        return reject(err);
      }

      this.ws.onopen = () => {
        if (timer) clearTimeout(timer);
        log(`[CDP] Connected to Chrome DevTools Protocol at ${this.wsUrl}`);
        if (this.keepAlive) clearInterval(this.keepAlive);
        this.keepAlive = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send('Browser.getVersion').catch(() => {});
          }
        }, 15000);
        resolve();
      };
      this.ws.onerror = (err) => {
        if (timer) clearTimeout(timer);
        log(`[CDP Error] ${err.message || String(err)}`);
        reject(err);
      };
      this.ws.onclose = (event) => {
        if (this.keepAlive) clearInterval(this.keepAlive);
        log(`[CDP] WebSocket closed (${event.code}: ${event.reason || 'no reason'}). Reconnecting...`);
        for (const cb of this.callbacks.values()) {
          cb.reject(new Error('CDP connection closed'));
        }
        this.callbacks.clear();
        setTimeout(() => this.connect().catch(() => {}), 1500);
      };
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
          log(`[CDP] Parse error: ${e.message}`);
        }
      };
    });
  }

  send(method, params = {}, sessionId = null) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('CDP WebSocket not connected'));
      }
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }
}

class BrowserTab {
  constructor(cdp, targetInfo, name) {
    this.cdp = cdp;
    this.targetInfo = targetInfo;
    this.targetId = targetInfo.targetId;
    this.name = name;
    this.sessionId = null;
  }

  async attach() {
    const res = await this.cdp.send('Target.attachToTarget', {
      targetId: this.targetId,
      flatten: true,
    });
    this.sessionId = res.sessionId;
    log(`[${this.name}] Attached (Target ${this.targetId}, Session ${this.sessionId})`);
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
    try {
      await this.cdp.send('Page.bringToFront', {}, this.sessionId);
      await sleep(300);
    } catch {}
  }

  async navigate(url) {
    await this.cdp.send('Page.navigate', { url }, this.sessionId);
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      try {
        const ready = await this.eval('document.readyState === "complete"');
        if (ready) break;
      } catch {}
    }
  }
}

class GeminiTab extends BrowserTab {
  constructor(cdp, targetInfo, lane) {
    super(cdp, targetInfo, `Gemini-${lane}`);
    this.lane = lane;
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
    const gCode = fs.readFileSync(G_CODE_FILE, 'utf8');
    const script = `
      localStorage.setItem("claudeG", ${JSON.stringify(gCode)});
      window.__claudeTT ??= trustedTypes.createPolicy("cl" + Date.now(), { createScript: (s) => s });
      eval(window.__claudeTT.createScript(localStorage.getItem("claudeG")));
      typeof window.__g !== 'undefined'
    `;
    return await this.eval(script);
  }

  async navigateToApp() {
    await this.navigate('https://gemini.google.com/app');
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      try {
        const ready = await this.eval('document.readyState === "complete" && !!document.querySelector("rich-textarea .ql-editor")');
        if (ready) break;
      } catch {}
    }
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

class TripoTab extends BrowserTab {
  constructor(cdp, targetInfo) {
    super(cdp, targetInfo, 'Tripo-Web');
  }

  async ensureDriver(tCode) {
    const script = `
      localStorage.setItem("claudeT", ${JSON.stringify(tCode)});
      window.__claudeTT ??= trustedTypes.createPolicy("cl" + Date.now(), { createScript: (s) => s });
      eval(window.__claudeTT.createScript(localStorage.getItem("claudeT")));
      typeof window.__t !== 'undefined'
    `;
    return await this.eval(script);
  }

  async stageFile(filename, absPath) {
    const fileBytes = fs.readFileSync(absPath);
    const base64 = fileBytes.toString('base64');
    const script = `
      (async () => {
        const b64 = ${JSON.stringify(base64)};
        const bin = atob(b64);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        const blob = new Blob([u8], { type: "image/png" });
        const file = new File([blob], ${JSON.stringify(filename)}, { type: "image/png" });
        await window.__t.idbPut(${JSON.stringify(filename)}, file);
        return { ok: true, name: file.name, size: file.size };
      })()
    `;
    return await this.eval(script);
  }

  async checkCredits() {
    return await this.eval('window.__t.credits()');
  }

  async detail(pid) {
    return await this.eval(`window.__t.detail(${JSON.stringify(pid)})`);
  }

  async progress(op) {
    return await this.eval(`window.__t.progress(${JSON.stringify(op)})`);
  }

  async waitOp(op, ms = 300000) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const pArr = await this.progress(op);
      const p = (pArr && pArr[0]) || {};
      log(`[Tripo-Web] Op ${op} status: ${p.status}, progress: ${p.progress}%, left_time: ${p.left_time}s`);
      if (p.status === 'success' || p.status === 'failed' || p.status === 'error') {
        return p;
      }
      await sleep(5000);
    }
    throw new Error(`Tripo op ${op} timed out after ${ms}ms`);
  }

  async rig(pid) {
    return await this.eval(`window.__t.rig(${JSON.stringify(pid)}, { go: true })`);
  }

  async joints(pid) {
    return await this.eval(`window.__t.joints(${JSON.stringify(pid)})`);
  }

  async retarget(pid, anims = ['idle', 'walk', 'run']) {
    return await this.eval(`window.__t.retarget(${JSON.stringify(pid)}, ${JSON.stringify(anims)}, { go: true })`);
  }

  async exportGlb(pid, npc, opts = {}) {
    return await this.eval(`window.__t.exportGlb(${JSON.stringify(pid)}, ${JSON.stringify(npc)}, ${JSON.stringify(opts)})`);
  }

  async preview(pid, npc) {
    return await this.eval(`window.__t.preview(${JSON.stringify(pid)}, ${JSON.stringify(npc)})`);
  }
}

// -------------------------------------------------------------
// Local HTTP Control Server (AR-100)
// -------------------------------------------------------------

function startControlServer(cdp, getTripoTab) {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const parsedUrl = new URL(req.url, 'http://127.0.0.1:9223');

    if (req.method === 'GET' && parsedUrl.pathname === '/status') {
      let tripoStatus = 'not_attached';
      let credits = null;
      try {
        const tripo = getTripoTab();
        if (tripo) {
          credits = await tripo.checkCredits();
          tripoStatus = 'ready';
        }
      } catch (e) {
        tripoStatus = e.message;
      }
      res.writeHead(200);
      return res.end(JSON.stringify({
        ok: true,
        cdpConnected: cdp.ws && cdp.ws.readyState === WebSocket.OPEN,
        tripo: { status: tripoStatus, credits },
        time: new Date().toISOString()
      }));
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/targets') {
      try {
        const targetsRes = await cdp.send('Target.getTargets');
        res.writeHead(200);
        return res.end(JSON.stringify({ ok: true, targets: targetsRes.targetInfos }));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/create_target') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { url } = JSON.parse(body || '{}');
          const created = await cdp.send('Target.createTarget', { url: url || 'about:blank' });
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true, targetId: created.targetId }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/eval') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { targetId, expression } = JSON.parse(body);
          let target = targetId;
          if (!target) {
            const tripo = getTripoTab();
            if (tripo) target = tripo.targetId;
          }
          if (!target) {
            res.writeHead(400);
            return res.end(JSON.stringify({ ok: false, error: 'No target specified and no default Tripo tab' }));
          }
          const attachRes = await cdp.send('Target.attachToTarget', { targetId: target, flatten: true });
          const sessionId = attachRes.sessionId;
          const evalRes = await cdp.send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
          }, sessionId);
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true, result: evalRes.result ? evalRes.result.value : null, error: evalRes.exceptionDetails }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/open') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { url } = JSON.parse(body);
          const targetRes = await cdp.send('Target.createTarget', { url: url || 'http://localhost:5173/character-3d' });
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true, targetId: targetRes.targetId }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/tripo/task') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const task = JSON.parse(body);
          const qFile = path.join(ROOT_DIR, '.agents/coord/tripo_q/queue.json');
          let q = [];
          if (fs.existsSync(qFile)) {
            try { q = JSON.parse(fs.readFileSync(qFile, 'utf8')); } catch {}
          }
          q.push(task);
          fs.writeFileSync(qFile, JSON.stringify(q, null, 2));
          log(`[Control Server] Enqueued Tripo task: ${task.npcId}`);
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true, queued: task, queueLength: q.length }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
  });

  server.listen(9223, '127.0.0.1', () => {
    log('[Daemon HTTP Control] Server listening on http://127.0.0.1:9223');
  });
}

// -------------------------------------------------------------
// Pipeline 3: Tripo Web 3D Generation Pipeline
// -------------------------------------------------------------

async function executeTripoTask(tripo, item) {
  const { npcId, ref, refs, mode = 'imageToModel', subject, notes } = item;
  log(`[Tripo-Web] ===== Starting Task: ${npcId} =====`);

  // Always re-inject latest tCode from disk so hot edits apply immediately
  const tCode = fs.readFileSync(T_CODE_FILE, 'utf8');
  await tripo.ensureDriver(tCode);

  const home = process.env.HOME || '/Users/bytedance';
  // Clean up any stale files for this npcId to avoid Chrome appending (1)
  try {
    const staleFiles = fs.readdirSync(path.join(home, 'Downloads')).filter(f => f.startsWith(`tripo__${npcId}`));
    for (const sf of staleFiles) {
      fs.unlinkSync(path.join(home, 'Downloads', sf));
      log(`[Tripo-Web] Cleaned stale download: ${sf}`);
    }
  } catch (e) {}

  const isMulti = mode === 'multiView' || (Array.isArray(refs) && refs.length > 1);

  if (isMulti) {
    log(`[Tripo-Web] Mode: Multi-View (3-View)`);
    await tripo.eval(`(async () => {
      await window.__t.toGenerate('multiView');
      window.__t.clearUpload();
    })()`);
    await sleep(2000);

    for (let slot = 0; slot < refs.length; slot++) {
      const refItem = refs[slot];
      const rPath = typeof refItem === 'string' ? refItem : refItem.file;
      const rSlot = typeof refItem === 'string' ? slot : (refItem.slot ?? slot);
      const rAbs = path.resolve(ROOT_DIR, rPath);
      if (!fs.existsSync(rAbs)) {
        log(`[Tripo-Web] Reference image not found for slot ${rSlot}: ${rAbs}`);
        return { ok: false, why: `file not found for slot ${rSlot}` };
      }
      const fname = path.basename(rPath);
      log(`[Tripo-Web] Staging slot ${rSlot} (${fname})...`);
      await tripo.stageFile(fname, rAbs);
      await sleep(1500);

      const upRes = await tripo.eval(`window.__t.uploadRef(${JSON.stringify(fname)}, { slot: ${rSlot} })`);
      log(`[Tripo-Web] Slot ${rSlot} upload result: ${JSON.stringify(upRes)}`);
      if (!upRes || !upRes.ok) {
        log(`[Tripo-Web] Slot ${rSlot} upload failed: ${JSON.stringify(upRes)}`);
        return { ok: false, why: `slot ${rSlot} upload failed`, upRes };
      }
      await sleep(1500);
    }
  } else {
    log(`[Tripo-Web] Mode: Single-View (${ref})`);
    const refAbs = path.resolve(ROOT_DIR, ref);
    if (!fs.existsSync(refAbs)) {
      log(`[Tripo-Web] Reference image not found: ${refAbs}`);
      return { ok: false, why: 'file not found' };
    }

    const filename = path.basename(ref);
    log(`[Tripo-Web] Staging ${filename}...`);
    await tripo.stageFile(filename, refAbs);
    await sleep(1500);

    log(`[Tripo-Web] Navigating to generate panel and uploading reference...`);
    const uploadRes = await tripo.eval(`(async () => {
      await window.__t.toGenerate('imageToModel');
      window.__t.clearUpload();
      return await window.__t.uploadRef(${JSON.stringify(filename)});
    })()`);
    log(`[Tripo-Web] uploadRef result: ${JSON.stringify(uploadRes)}`);

    if (!uploadRes || !uploadRes.ok) {
      log(`[Tripo-Web] uploadRef failed: ${JSON.stringify(uploadRes)}`);
      return { ok: false, why: 'upload failed', uploadRes };
    }
  }

  await sleep(3000);

  log(`[Tripo-Web] Submitting generation (65 credits)...`);
  const genRes = await tripo.eval(`window.__t.generate({ go: true, open: true })`);
  log(`[Tripo-Web] Generation response: ${JSON.stringify(genRes)}`);

  if (!genRes || !genRes.pid || !genRes.op) {
    log(`[Tripo-Web] Generation start failed: ${JSON.stringify(genRes)}`);
    return { ok: false, why: 'generate failed', genRes };
  }

  const pid = genRes.pid;
  const genOp = genRes.op;
  log(`[Tripo-Web] Generated project: ${pid}, operator: ${genOp}. Waiting for model...`);
  await tripo.waitOp(genOp, 600000);

  log(`[Tripo-Web] Model generated! Waiting 5s...`);
  await sleep(5000);

  // Covers / preview check
  try {
    await tripo.eval(`window.__t.showCovers(${JSON.stringify(pid)})`);
    await sleep(3000);
    await tripo.eval(`window.__t.hideCovers()`);
  } catch (e) {
    log(`[Tripo-Web] showCovers notice: ${e.message}`);
  }

  log(`[Tripo-Web] Submitting Humanoid Mixamo rigging (20 credits)...`);
  const rigRes = await tripo.rig(pid);
  log(`[Tripo-Web] Rig response: ${JSON.stringify(rigRes)}`);
  let rigOp = genOp;
  if (rigRes && rigRes.op) {
    rigOp = rigRes.op;
    await tripo.waitOp(rigOp, 300000);
    const j = await tripo.joints(pid);
    log(`[Tripo-Web] Joints check (65 joints): ${JSON.stringify(j)}`);
  }

  log(`[Tripo-Web] Retargeting animations (idle, walk, run)...`);
  for (const anim of ['idle', 'walk', 'run']) {
    log(`[Tripo-Web] Retargeting animation: ${anim}`);
    const r = await tripo.eval(`window.__t.retarget(${JSON.stringify(pid)}, [${JSON.stringify(anim)}], { go: true })`);
    if (r && r.op) {
      await tripo.waitOp(r.op, 180000);
    }
    await sleep(2000);
  }

  log(`[Tripo-Web] Exporting static base GLB...`);
  for (let i = 0; i < 30; i++) {
    const r = await tripo.eval(`window.__t.exportGlb(${JSON.stringify(pid)}, ${JSON.stringify(npcId)}, { ms: 10000 })`);
    if (r && r.ok) {
      log(`[Tripo-Web] Static base GLB export initiated: ${JSON.stringify(r)}`);
      break;
    }
    await sleep(3000);
  }
  await sleep(2000);

  log(`[Tripo-Web] Exporting animation GLB (idle, walk, run)...`);
  for (let i = 0; i < 30; i++) {
    const r = await tripo.eval(`window.__t.exportGlb(${JSON.stringify(pid)}, ${JSON.stringify(npcId)}, { anims: ['idle', 'walk', 'run'], ms: 10000 })`);
    if (r && r.ok) {
      log(`[Tripo-Web] Animation GLB export initiated: ${JSON.stringify(r)}`);
      break;
    }
    await sleep(3000);
  }
  await sleep(2000);

  log(`[Tripo-Web] Exporting preview image...`);
  await tripo.eval(`window.__t.preview(${JSON.stringify(pid)}, ${JSON.stringify(npcId)})`);
  await sleep(3000);

  const baseGlbPath = path.join(home, `Downloads/tripo__${npcId}.glb`);
  const animGlbPath = path.join(home, `Downloads/tripo__${npcId}__anim_idle_walk_run.glb`);
  const previewPath = path.join(home, `Downloads/tripo__${npcId}.png`);

  log(`[Tripo-Web] Waiting for downloaded files in ~/Downloads...`);
  for (let w = 0; w < 60; w++) {
    const hasBase = fs.existsSync(baseGlbPath) && fs.statSync(baseGlbPath).size > 500000;
    const hasAnim = fs.existsSync(animGlbPath) && fs.statSync(animGlbPath).size > 500000;
    const hasPrev = fs.existsSync(previewPath) && fs.statSync(previewPath).size > 10000;
    if (hasBase && hasAnim && hasPrev) {
      log(`[Tripo-Web] All 3 assets verified in Downloads: base (${fs.statSync(baseGlbPath).size}B), anim (${fs.statSync(animGlbPath).size}B), preview (${fs.statSync(previewPath).size}B)`);
      break;
    }
    await sleep(2000);
  }

  if (fs.existsSync(animGlbPath)) {
    log(`[Tripo-Web] Running fix_anim_offset.py on ${animGlbPath}...`);
    try {
      execSync(`python3 tools/model3d/fix_anim_offset.py "${animGlbPath}" "${animGlbPath}"`, { cwd: ROOT_DIR, stdio: 'pipe' });
    } catch (e) {
      log(`[Tripo-Web] fix_anim_offset notice: ${e.message}`);
    }

    log(`[Tripo-Web] Ingesting model ${npcId} into repository...`);
    const detail = await tripo.detail(pid);
    const retargetList = detail?.operator?.retarget || [];
    const animOpsArg = retargetList
      .filter(r => ['idle', 'walk', 'run'].includes(r.name.replace('preset:biped:', '')))
      .map(r => `${r.name.replace('preset:biped:', '')}=${r.operator_id}`)
      .join(',');
    const ingestCmd = `python3 tools/model3d/ingest.py ${npcId} --project ${pid} --gen-op ${genOp} --rig-op ${rigOp} --ref ${ref} --subject "${subject}" --notes "${notes}" --anim idle,walk,run ${animOpsArg ? `--anim-ops "${animOpsArg}"` : ''} --replace --commit`;
    log(`[Tripo-Web] Running: ${ingestCmd}`);
    execSync(ingestCmd, { cwd: ROOT_DIR, stdio: 'inherit' });
    log(`✔ [Tripo-Web] Successfully ingested and committed ${npcId}!`);
    return { ok: true, pid, genOp, rigOp };
  } else {
    log(`[Tripo-Web] Warning: Downloaded GLB not found after wait!`);
    return { ok: false, why: 'glb not found in Downloads' };
  }
}

async function runTripoPipeline(tripo) {
  log('=== Starting Tripo Web 3D Model Pipeline ===');

  const TRIPO_Q_DIR = path.join(ROOT_DIR, '.agents/coord/tripo_q');
  fs.mkdirSync(TRIPO_Q_DIR, { recursive: true });
  const TRIPO_Q_FILE = path.join(TRIPO_Q_DIR, 'queue.json');

  // Initial immediate tasks
  const INITIAL_QUEUE = [
    {
      npcId: 'npc_zhujue__ch00_f_bald_base_body',
      ref: 'assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png',
      subject: '主角（女）· 光头素体基底版（AR-99 瓷白眼眸修复挑棚）',
      notes: '单图A-pose无发素体；瓷白无眼影眼眸消除3D挑棚；8.77头身；薄透抹胸三角裤；猎豹腿；Mixamo 65关节；修跑步跳位'
    }
  ];

  for (const item of INITIAL_QUEUE) {
    try {
      await executeTripoTask(tripo, item);
    } catch (err) {
      log(`[Tripo-Web Task Error] ${err.message || String(err)}`);
    }
  }

  log('=== Initial Tripo tasks completed! Entering queue polling loop... ===');
  while (true) {
    try {
      if (fs.existsSync(TRIPO_Q_FILE)) {
        let q = [];
        try { q = JSON.parse(fs.readFileSync(TRIPO_Q_FILE, 'utf8')); } catch {}
        if (Array.isArray(q) && q.length > 0) {
          const nextTask = q.shift();
          fs.writeFileSync(TRIPO_Q_FILE, JSON.stringify(q, null, 2));
          log(`[Tripo-Web Queue] Dequeued task: ${nextTask.npcId}`);
          await executeTripoTask(tripo, nextTask);
        }
      }
    } catch (e) {
      log(`[Tripo-Web Queue Error] ${e.message}`);
    }
    await sleep(4000);
  }
}

// -------------------------------------------------------------
// Pipeline 1 & 2: Dual Gemini Web Item Generation (Optional)
// -------------------------------------------------------------

async function runGeminiPipeline(tabA, tabB) {
  log('=== Starting Interleaved Dual Gemini Generation Pipeline ===');
  let totalCompleted = 0;
  let batchSinceCommit = 0;

  async function processOneItem(tab, tabName) {
    const headId = await tab.getQueueHead();
    if (!headId) return null;

    log(`[${tabName}] Starting item: ${headId} (Left in lane: ${await tab.getQueueLeft()})`);

    await tab.bringToFront();
    await tab.navigateToApp();
    await tab.ensureDriver();

    let prep = await tab.prepareNext();
    if (!prep || !prep.ok) {
      log(`[${tabName}] prepareNext notice: ${JSON.stringify(prep)}, falling back to direct editor prompt insertion...`);
      await tab.bringToFront();
      await tab.eval(`(async () => {
        const ed = document.querySelector('rich-textarea .ql-editor');
        if (ed) {
          const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}')[${JSON.stringify(headId)}];
          if (P) {
            ed.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, P);
            ed.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })()`);
    }

    log(`[${tabName}] Sending prompt for ${headId}...`);
    await tab.bringToFront();
    let sent = await tab.send();
    if (!sent || !sent.ok) {
      log(`[${tabName}] send failed: ${JSON.stringify(sent)}, retrying in 4s...`);
      await sleep(4000);
      await tab.bringToFront();
      sent = await tab.send();
      if (!sent || !sent.ok) {
        log(`[${tabName}] send failed permanently on ${headId}`);
        return null;
      }
    }

    return {
      tab,
      tabName,
      id: headId,
      finishGenAndIngest: async () => {
        log(`[${tabName}] Waiting for image generation for ${headId}...`);
        let w = await tab.waitGen(38000);
        if (!w || !w.ok) {
          log(`[${tabName}] waitGen first check not ready, waiting another 15s...`);
          w = await tab.waitGen(15000);
        }
        if (!w || !w.ok) {
          log(`[${tabName}] waitGen did not find image for ${headId}: ${JSON.stringify(w)}`);
          return;
        }

        log(`[${tabName}] Image generated in ${w.secs}s! Saving full resolution...`);
        let saveRes = await tab.saveFull(headId, 25000);
        if (!saveRes || !saveRes.ok || !saveRes.base64) {
          log(`[${tabName}] saveFull retry in 3s...`);
          await sleep(3000);
          saveRes = await tab.saveFull(headId, 15000);
        }
        if (!saveRes || !saveRes.ok || !saveRes.base64) {
          log(`[${tabName}] saveFull failed for ${headId}: ${JSON.stringify(saveRes ? saveRes.save : 'null')}`);
          return;
        }

        const imgBuffer = Buffer.from(saveRes.base64, 'base64');
        const origPath = path.join(ORIGINALS_DIR, `${headId}.jpg`);
        fs.writeFileSync(origPath, imgBuffer);
        log(`[${tabName}] Saved original: ${origPath} (${imgBuffer.length} bytes)`);

        try {
          execSync(`python3 tools/imagegen/ingest.py ${headId} ${origPath}`, { cwd: ROOT_DIR, stdio: 'pipe' });
          totalCompleted++;
          batchSinceCommit++;
          log(`✔ [${tabName}] Successfully ingested ${headId}! (Total: ${totalCompleted})`);

          updateStatus({
            gemini: {
              laneA: await tabA.getQueueLeft(),
              laneB: await tabB.getQueueLeft(),
              completed: totalCompleted,
              lastItem: headId
            }
          });

          if (batchSinceCommit >= 4) {
            try {
              execSync('git clean -fd assets/default/item/accessories/icons 2>/dev/null || true', { cwd: ROOT_DIR });
              execSync(`git add assets/default/item/ && git commit -m "feat(assets): batch ingest ${batchSinceCommit} items via dual Gemini tabs"`, { cwd: ROOT_DIR, stdio: 'pipe' });
              log(`Git commit completed for batch of ${batchSinceCommit} items.`);
              batchSinceCommit = 0;
            } catch (e) {
              log(`Git commit notice: ${e.message}`);
            }
          }
        } catch (e) {
          log(`[Ingest error] ${e.message}`);
        }
      }
    };
  }

  let inflightA = null;
  let inflightB = null;

  while (true) {
    const leftA = await tabA.getQueueLeft();
    const leftB = await tabB.getQueueLeft();
    if (leftA === 0 && leftB === 0 && !inflightA && !inflightB) {
      log('Dual Gemini generation queues are empty!');
      break;
    }

    if (leftA > 0 || inflightA) {
      if (inflightA) {
        await inflightA.finishGenAndIngest();
        inflightA = null;
      }
      if (leftA > 0) {
        inflightA = await processOneItem(tabA, 'Tab A');
      }
    }

    // Rate pacing: 15s between requests (guarantees <= 4 requests/min across both tabs)
    log('[Pacing] Waiting 15s before Tab B...');
    await sleep(15000);

    if (leftB > 0 || inflightB) {
      if (inflightB) {
        await inflightB.finishGenAndIngest();
        inflightB = null;
      }
      if (leftB > 0) {
        inflightB = await processOneItem(tabB, 'Tab B');
      }
    }

    log('[Pacing] Waiting 15s before Tab A...');
    await sleep(15000);
  }

  if (batchSinceCommit > 0) {
    try {
      execSync('git clean -fd assets/default/item/accessories/icons 2>/dev/null || true', { cwd: ROOT_DIR });
      execSync(`git add assets/default/item/ && git commit -m "feat(assets): final batch ingest ${batchSinceCommit} items"`, { cwd: ROOT_DIR, stdio: 'pipe' });
    } catch {}
  }
}

// -------------------------------------------------------------
// Pipeline Orchestrator Main
// -------------------------------------------------------------

async function main() {
  log('====================================================');
  log('Starting Tri-Pipeline Daemon & Runner (AR-100)');
  log('====================================================');

  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  fs.mkdirSync(path.join(ROOT_DIR, '.agents/coord'), { recursive: true });

  const cdpUrl = getCdpWsUrl();
  const cdp = new CdpClient(cdpUrl);
  let connected = false;
  while (!connected) {
    try {
      log('[CDP] Connecting to Chrome DevTools Protocol...');
      await cdp.connect(0);
      connected = true;
    } catch (e) {
      log(`[CDP Connect] Waiting for Chrome remote debugging approval... (${e.message}). Retrying in 5s...`);
      await sleep(5000);
    }
  }

  const targetsRes = await cdp.send('Target.getTargets');
  const targets = targetsRes.targetInfos.filter((t) => t.type === 'page');

  let tripoTargets = targets.filter((t) => t.url && t.url.includes('studio.tripo3d.ai'));

  if (tripoTargets.length < 1) {
    log(`No Tripo target found. Creating new Tripo tab...`);
    await cdp.send('Target.createTarget', { url: 'https://studio.tripo3d.ai/workspace/generate' });
    await sleep(2500);
    const refreshed = await cdp.send('Target.getTargets');
    tripoTargets = (refreshed.targetInfos || []).filter((t) => t.type === 'page' && t.url && t.url.includes('studio.tripo3d.ai'));
  }

  const tabTripo = new TripoTab(cdp, tripoTargets[0]);
  await tabTripo.attach();

  const tCode = fs.readFileSync(T_CODE_FILE, 'utf8');
  await tabTripo.ensureDriver(tCode);
  const tripoCredits = await tabTripo.checkCredits();
  log(`Tripo Studio connected! Current credits: ${tripoCredits}`);

  // Start HTTP Control Server for instant external interaction
  startControlServer(cdp, () => tabTripo);

  updateStatus({
    state: 'RUNNING',
    tripo: { credits: tripoCredits, currentModel: 'npc_zhujue__ch00_f_bald_base_body', status: 'IN_PROGRESS' }
  });

  const enableGemini = process.env.ENABLE_GEMINI === 'true' || process.env.ENABLE_GEMINI === '1';
  if (enableGemini) {
    let geminiTargets = targets.filter((t) => t.url && t.url.includes('gemini.google.com'));
    while (geminiTargets.length < 2) {
      log(`Creating Gemini tab for dual lane...`);
      await cdp.send('Target.createTarget', { url: 'https://gemini.google.com/app' });
      await sleep(2500);
      const refreshed = await cdp.send('Target.getTargets');
      geminiTargets = (refreshed.targetInfos || []).filter((t) => t.type === 'page' && t.url && t.url.includes('gemini.google.com'));
    }

    const tabA = new GeminiTab(cdp, geminiTargets[0], 'A');
    const tabB = new GeminiTab(cdp, geminiTargets[1], 'B');
    await tabA.attach();
    await tabB.attach();

    const gCode = fs.readFileSync(G_CODE_FILE, 'utf8');
    const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
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

    const pending = fullQueue.filter((id) => !existingFiles.has(id));
    const queueA = pending.filter((_, i) => i % 2 === 0);
    const queueB = pending.filter((_, i) => i % 2 === 1);
    await tabA.setupDriver(gCode, prompts, queueA);
    await tabB.setupDriver(gCode, prompts, queueB);

    runGeminiPipeline(tabA, tabB).catch((err) => {
      log(`[Gemini Pipeline Error] ${err.message || String(err)}`);
    });
  }

  // Launch Tripo pipeline
  await runTripoPipeline(tabTripo);
}

main().catch((err) => {
  log(`[Fatal Error] ${err.message || String(err)}`);
  process.exit(1);
});
