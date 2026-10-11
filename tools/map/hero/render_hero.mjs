#!/usr/bin/env node
/* global Buffer, WebSocket, fetch, setTimeout */
// Render the protagonist's walk and run cycles and idle pose for the painted world map (AR-116, tech/13 §3.1).
// The model's own walk clip is played in place on a transparent canvas through render_hero.html; frames
// are then cropped, scaled and packed by pack_hero.py. Same machine + same inputs give the same frames.
//
//   node tools/map/hero/render_hero.mjs --cdp http://127.0.0.1:9222 [--out .cache/map-hero]   # <out>/male, <out>/female
//   python3 tools/map/hero/pack_hero.py .cache/map-hero            # writes assets/default/map/hero/
//
// Needs a Chrome with remote debugging (any headless instance) and python3 for a throwaway static server.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
// The protagonist models the game picks by gender (App.vue heroModelUrl). Each is seen from its cleaner
// side: the man from his sash side (walking to screen-left; from the other side his trousers poke through
// the tunic in this walk clip), the woman walking to screen-right. The page mirrors for the other way.
const VARIANTS = [
  { key: 'male', model: 'assets/default/model3d/npc_zhujue__ch00_m/anim_idle_walk_run.glb', yaw: -70 },
  { key: 'female', model: 'assets/default/model3d/npc_zhujue__ch00_f/anim_idle_walk_run.glb', yaw: 70 },
];
const FRAMES = 12; const SIZE = 512; const ELEVATION = 12;
const arg = (name, fallback) => { const index = process.argv.indexOf(name); return index > 0 ? process.argv[index + 1] : fallback; };
const cdp = arg('--cdp', 'http://127.0.0.1:9222');
const out = resolve(ROOT, arg('--out', '.cache/map-hero'));
// Frames land in a scratch directory that replaces <out> only after every variant rendered, so a failed
// run never leaves old and new frames mixed.
const work = `${out}.partial`;
rmSync(work, { recursive: true, force: true });
const sleep = (ms) => new Promise(done => setTimeout(done, ms));

const port = await new Promise((done) => { const probe = createServer(); probe.listen(0, '127.0.0.1', () => {
  const { port: free } = probe.address(); probe.close(() => done(free)); }); });
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
let target;
try {
  for (let i = 0; i < 40; i += 1) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch { /* starting */ } await sleep(100); }
  target = await (await fetch(`${cdp}/json/new?about:blank`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl); let seq = 0; const pending = new Map();
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  socket.onmessage = (message) => { const data = JSON.parse(message.data); pending.get(data.id)?.(data); pending.delete(data.id); };
  const send = (method, params = {}) => new Promise((done) => { const id = ++seq; pending.set(id, done); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async (expression) => {
    const reply = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (reply.result?.exceptionDetails) throw new Error(reply.result.exceptionDetails.exception?.description ?? 'evaluate failed');
    return reply.result?.result?.value;
  };
  const sha256 = (path) => createHash('sha256').update(readFileSync(join(ROOT, path))).digest('hex');
  // Recorded once per render so pack_hero.py's manifest (and its --check) is reproducible from the frames.
  const created = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  for (const variant of VARIANTS) {
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/tools/map/hero/render_hero.html?model=/${variant.model}&size=${SIZE}&yaw=${variant.yaw}&elevation=${ELEVATION}` });
    // Wait for this variant's page (not the previous one) to finish loading its model.
    const ready = `new URLSearchParams(location.search).get('model') === '/${variant.model}' && Boolean(window.heroReady)`;
    for (let i = 0; i < 150 && !(await evaluate(ready).catch(() => false)); i += 1) await sleep(200);
    const clips = await evaluate('window.heroRender.clips');
    // One stride cycle = the lag at which the left foot's swing (height and forward offset) repeats best.
    const cycleOf = async (clip) => {
      const samples = 240; const trace = [];
      for (let i = 0; i <= samples; i += 1) {
        const feet = await evaluate(`window.heroRender.feet('${clip}', ${clips[clip] * i / samples})`);
        trace.push([feet.left[1], feet.left[0] + feet.left[2]]);
      }
      const mean = [0, 1].map(axis => trace.reduce((sum, row) => sum + row[axis], 0) / trace.length);
      const spread = [0, 1].map(axis => Math.sqrt(trace.reduce((sum, row) => sum + (row[axis] - mean[axis]) ** 2, 0) / trace.length) || 1);
      const z = trace.map(row => row.map((value, axis) => (value - mean[axis]) / spread[axis]));
      // Lags keep at least a quarter of the clip overlapping; a clip that is a single cycle has no strong
      // repeat in that range and is used whole.
      let best = samples; let score = -Infinity;
      for (let lag = Math.round(samples * 0.2); lag <= Math.round(samples * 0.75); lag += 1) {
        let sum = 0;
        for (let i = 0; i + lag <= samples; i += 1) sum += (z[i][0] * z[i + lag][0] + z[i][1] * z[i + lag][1]) / 2;
        const value = sum / (samples + 1 - lag);
        if (value > score + 1e-6) { score = value; best = lag; }
      }
      return { start: 0, cycle: (score >= 0.5 ? best : samples) * clips[clip] / samples };
    };
    const dir = join(work, variant.key); mkdirSync(dir, { recursive: true });
    const save = (name, url) => writeFileSync(join(dir, name), Buffer.from(url.split(',')[1], 'base64'));
    const cycles = {};
    for (const clip of ['walk', 'run']) {
      const { start, cycle } = await cycleOf(clip); cycles[clip] = Math.round(cycle * 1e4) / 1e4;
      for (let k = 0; k < FRAMES; k += 1)
        save(`${clip}_${String(k).padStart(2, '0')}.png`, await evaluate(`window.heroRender.frame('${clip}', ${start + cycle * k / FRAMES})`));
    }
    save('idle.png', await evaluate(`window.heroRender.frame('idle', 0)`));
    const anchor = await evaluate('window.heroRender.anchor()');
    writeFileSync(join(dir, 'meta.json'), JSON.stringify({ key: variant.key, model: variant.model, modelSha256: sha256(variant.model),
      harness: 'tools/map/hero/render_hero.html', harnessSha256: sha256('tools/map/hero/render_hero.html'),
      size: SIZE, yaw: variant.yaw, elevation: ELEVATION, frames: FRAMES, cycleSeconds: cycles, anchor, created }, null, 2));
    console.log(`render_hero: ${variant.key} ${FRAMES} walk + ${FRAMES} run frames (cycles ${JSON.stringify(cycles)}) + idle`);
  }
  // Swap by renames: at any moment either the old or the new complete set exists (never a mix).
  const previous = `${out}.previous`; rmSync(previous, { recursive: true, force: true });
  if (existsSync(out)) renameSync(out, previous);
  renameSync(work, out); rmSync(previous, { recursive: true, force: true });
  console.log(`render_hero: all variants → ${out}`);
} finally {
  if (target) await fetch(`${cdp}/json/close/${target.id}`).catch(() => {});
  server.kill();
}
