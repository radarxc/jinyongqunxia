#!/usr/bin/env node
// 运行时截图工具：无头 Chrome（CDP）驱动开发服务器上的 /character-3d 真实换装运行时，
// 挂载本地头资产目录，定格姿势、按机位出图，并拼一张带标注的对照总图。
//
// 用法：
//   node tools/model3d/dressup/shoot_head.mjs --head <目录> [--head 标签=<目录> ...] --out <目录>
//        [--template tpl_f_tall] [--poses bind,idle@0.6,walk@0.35,run@0.25]
//        [--views neck,neck_left,neck_right,neck_back,neck_3q,under,head,full]
//        [--mask on|off|both] [--page http://localhost:5173/character-3d] [--size 1200x900] [--dpr 1.5]
//        [--port 9333] [--close-browser] [--json]
// 头目录须含 head.glb + fit.json（fit.hideMask.file 相对 head.glb 解析）；不给 --head 时只拍裸模板。
// --template 先在页面切到该体型；头目录里有 head.<模板>.glb + fit.<模板>.json 时优先用之（与运行时按体型选头一致）。
// 浏览器默认常驻（同一端口复用，迭代时省去启动时间）；--close-browser 用完即关。
// 依赖：Node ≥ 22（内置 WebSocket / fetch），本机 Google Chrome，开发服务器已在 --page 地址运行。
/* global Buffer, WebSocket, fetch, setTimeout, window, document, performance, createImageBitmap, OffscreenCanvas, btoa */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';

const VIEWS = {
  // target: 'neck' | 'face' | 'body'；offset 为相机相对目标的世界偏移（米），模板朝 +Z。
  neck: { target: 'neck', offset: [0, 0.015, 0.30] },
  neck_left: { target: 'neck', offset: [0.30, 0.015, 0] },
  neck_right: { target: 'neck', offset: [-0.30, 0.015, 0] },
  neck_back: { target: 'neck', offset: [0, 0.015, -0.30] },
  neck_3q: { target: 'neck', offset: [0.21, 0.03, 0.21] },
  neck_back_left: { target: 'neck', offset: [0.21, 0.03, -0.21] },
  neck_back_right: { target: 'neck', offset: [-0.21, 0.03, -0.21] },
  neck_right_close: { target: 'neck', offset: [-0.17, 0.0, -0.06] },
  neck_left_close: { target: 'neck', offset: [0.17, 0.0, -0.06] },
  under: { target: 'neck', offset: [0, -0.14, 0.24], lift: 0.02 },
  // 后颈辅助机位：从后下方仰看发帘内侧的后颈与肩背接缝（长发遮住正后方时用）。
  nape_low: { target: 'neck', offset: [0, -0.16, -0.22], lift: 0.01, basis: 'spine' },
  nape_low_left: { target: 'neck', offset: [0.14, -0.15, -0.18], lift: 0.01, basis: 'spine' },
  nape_low_right: { target: 'neck', offset: [-0.14, -0.15, -0.18], lift: 0.01, basis: 'spine' },
  nape_high: { target: 'neck', offset: [0, 0.16, -0.24], lift: 0.0, basis: 'spine' },
  // 发帘内侧机位：长发垂在后背时，相机放进发帘与后颈之间（近裁剪面、视场临时放宽），专看后颈接缝。
  // 后颈机位按实际网格定：绑定姿势下在头资产网格里取后颈 / 喉部 / 后颈上方 3 cm 三个参考顶点，逐姿势取蒙皮后位置，
  // 后向 = 喉→后颈，上向 = 后颈→上方点；偏移依次为（侧向, 上向, 后向）。相机在发帘内侧正对后颈。
  // （跑步大前倾时 Neck→Head 骨连线比渲染出的颈部前倾得多，按骨骼推算的后颈点会落到肩上方的空中。）
  nape_inner: { target: 'nape', offset: [0, 0.0, 0.04], basis: 'nape', near: 0.005, fov: 75 },
  nape_inner_left: { target: 'nape', offset: [0.03, 0.0, 0.03], basis: 'nape', near: 0.005, fov: 75 },
  nape_inner_right: { target: 'nape', offset: [-0.03, 0.0, 0.03], basis: 'nape', near: 0.005, fov: 75 },
  nape_under: { target: 'nape', offset: [0, -0.035, 0.035], basis: 'nape', near: 0.005, fov: 75 },
  nape_side: { target: 'nape', offset: [0.30, 0.0, 0.0], basis: 'nape' },
  // 接缝验收裁切视图：相机在后颈外 13–15 cm，比后颈更靠近相机 cutaway 以上的三角（挡在前面的发片等）临时去掉。
  nape_cut: { target: 'nape', offset: [0, 0.0, 0.15], basis: 'nape', cutaway: 0.02 },
  nape_cut_left: { target: 'nape', offset: [0.08, 0.0, 0.13], basis: 'nape', cutaway: 0.02 },
  nape_cut_right: { target: 'nape', offset: [-0.08, 0.0, 0.13], basis: 'nape', cutaway: 0.02 },
  nape_cut_low: { target: 'nape', offset: [0, -0.07, 0.13], basis: 'nape', cutaway: 0.02 },
  head: { target: 'face', offset: [0, 0.02, 0.62], lift: -0.06 },
  head_side: { target: 'face', offset: [0.62, 0.02, 0], lift: -0.06 },
  head_back: { target: 'face', offset: [0, 0.02, -0.62], lift: -0.06 },
  full: { target: 'body', offset: [0, 0.10, 3.1] },
};
const DEFAULT_VIEWS = 'neck,neck_left,neck_right,neck_back,neck_3q,under,head,full';
const DEFAULT_POSES = 'bind,idle@0.6,walk@0.35,run@0.25';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function parseArgs(argv) {
  const args = { heads: [], out: null, poses: DEFAULT_POSES, views: DEFAULT_VIEWS, mask: 'on',
    page: 'http://localhost:5173/character-3d', size: '1200x900', dpr: 1.5, port: 9333,
    closeBrowser: false, json: false, timeoutSec: 120 };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i]; const next = () => { if (i + 1 >= argv.length) throw new Error(`${key} 缺参数`); return argv[++i]; };
    if (key === '--template') args.template = next();
    else if (key === '--head') {
      const value = next(); const eq = value.indexOf('=');
      const label = eq > 0 ? value.slice(0, eq) : basename(resolve(value));
      args.heads.push({ label, dir: resolve(eq > 0 ? value.slice(eq + 1) : value) });
    } else if (key === '--out') args.out = resolve(next());
    else if (key === '--poses') args.poses = next();
    else if (key === '--views') args.views = next();
    else if (key === '--mask') args.mask = next();
    else if (key === '--page') args.page = next();
    else if (key === '--size') args.size = next();
    else if (key === '--dpr') args.dpr = Number(next());
    else if (key === '--port') args.port = Number(next());
    else if (key === '--timeout-sec') args.timeoutSec = Number(next());
    else if (key === '--close-browser') args.closeBrowser = true;
    else if (key === '--json') args.json = true;
    else if (key === '-h' || key === '--help') { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 13).join('\n')); process.exit(0); }
    else throw new Error(`未知参数 ${key}`);
  }
  if (!args.out) throw new Error('缺 --out');
  const [w, h] = args.size.split('x').map(Number);
  if (!(w > 0 && h > 0)) throw new Error(`--size 格式应为 宽x高：${args.size}`);
  args.width = w; args.height = h;
  args.poseList = args.poses.split(',').map(token => {
    const [clip, at] = token.split('@');
    return { name: token.replace('@', '_'), clip, t: at === undefined ? 0 : Number(at) };
  });
  args.viewList = args.views.split(',').map(name => {
    if (!VIEWS[name]) throw new Error(`未知机位 ${name}（可用：${Object.keys(VIEWS).join(', ')}）`);
    return { name, ...VIEWS[name] };
  });
  args.masks = args.mask === 'both' ? [true, false] : [args.mask !== 'off'];
  for (const head of args.heads) {
    const variant = args.template ? [`head.${args.template}.glb`, `fit.${args.template}.json`] : null;
    [head.glb, head.fit] = variant && variant.every(file => existsSync(join(head.dir, file))) ? variant
      : ['head.glb', 'fit.json'];
    for (const file of [head.glb, head.fit]) {
      if (!existsSync(join(head.dir, file))) throw new Error(`${head.dir} 缺 ${file}`);
    }
  }
  return args;
}

const MIME = { '.glb': 'model/gltf-binary', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

function serveDirs(heads) {
  // 每个头目录挂在 /<序号>/ 下；带 CORS，供 GLTFLoader / 遮罩合成器跨源读取。
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const [, index, ...rest] = url.pathname.split('/');
    const head = heads[Number(index)];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    if (!head || rest.some(part => part === '..' || part === '')) { res.writeHead(404); res.end(); return; }
    const file = join(head.dir, ...rest.map(decodeURIComponent));
    try {
      const body = readFileSync(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  return new Promise(resolvePromise => server.listen(0, '127.0.0.1', () => resolvePromise(server)));
}

async function getJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
  return response.json();
}

async function ensureBrowser(port) {
  const versionUrl = `http://127.0.0.1:${port}/json/version`;
  try { return await getJson(versionUrl); } catch { /* 未运行则启动 */ }
  if (!existsSync(CHROME)) throw new Error(`找不到 Chrome：${CHROME}（可设 CHROME_PATH）`);
  const profile = join(homedir(), '.cache', 'tianshu-shoot-chrome');
  mkdirSync(profile, { recursive: true });
  const child = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows', '--ignore-gpu-blocklist', '--window-size=1600,1200', 'about:blank'],
  { detached: true, stdio: 'ignore' });
  child.unref();
  for (let i = 0; i < 100; i += 1) {
    await new Promise(r => setTimeout(r, 150));
    try { return await getJson(versionUrl); } catch { /* 继续等 */ }
  }
  throw new Error(`Chrome 在端口 ${port} 未就绪`);
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url); this.seq = 0; this.pending = new Map(); this.events = [];
    this.ready = new Promise((ok, fail) => { this.ws.onopen = ok; this.ws.onerror = fail; });
    this.ws.onmessage = message => {
      const data = JSON.parse(typeof message.data === 'string' ? message.data : Buffer.from(message.data).toString());
      if (data.id && this.pending.has(data.id)) {
        const { ok, fail } = this.pending.get(data.id); this.pending.delete(data.id);
        if (data.error) fail(new Error(`${data.error.message} ${data.error.data ?? ''}`)); else ok(data.result);
      } else if (data.method) this.events.push(data);
    };
  }
  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((ok, fail) => { this.pending.set(id, { ok, fail }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async evaluate(fn, ...args) {
    const expression = `(${fn})(...${JSON.stringify(args)})`;
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails;
      throw new Error(`页面脚本异常：${detail.exception?.description ?? detail.text}`);
    }
    return result.result.value;
  }
  close() { try { this.ws.close(); } catch { /* ignore */ } }
}

// ---- 以下函数在页面里执行（不得引用 Node 作用域） ----

async function pageWaitReady(timeoutMs) {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const d = window.__dressup;
    if (d && d.actor && d.viewer && d.actor.stats && d.actor.stats().drawCalls >= 1) return true;
    await new Promise(r => setTimeout(r, 200));
  }
  return false;
}

async function pageSelectTemplate(template, timeoutMs) {
  // 换装页的体型按钮文字以「<短名> ·」开头（tpl_f_tall → tall）；切换后等新 actor 出第一帧。
  const short = template.replace(/^tpl_[a-z]+_/u, '');
  const before = window.__dressup?.actor;
  const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(`${short} ·`));
  if (!button) return 'no-button';
  if (button.classList.contains('active')) return 'ok';
  button.click();
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const d = window.__dressup;
    if (d && d.actor && d.actor !== before && d.actor.stats && d.actor.stats().drawCalls >= 1) return 'ok';
    await new Promise(r => setTimeout(r, 200));
  }
  return 'timeout';
}

async function pageEquipHead(base, glb, fitName, id) {
  const d = window.__dressup; const a = d.actor;
  if (!a.__shootOriginalUpdate) { a.__shootOriginalUpdate = a.update; a.update = () => {}; }
  if (window.__shootHeadId) { try { a.unequip(window.__shootHeadId); } catch { /* ignore */ } window.__shootHeadId = undefined; }
  if (!base) return a.stats();
  const fit = await (await fetch(base + fitName, { cache: 'no-store' })).json();
  await a.equip({ kind: 'head', id, url: base + glb, fit });
  window.__shootHeadId = id;
  const expectMask = Boolean(fit.hideMask && fit.hideMask.file);
  for (let i = 0; i < 200 && expectMask; i += 1) {
    const s = a.stats();
    if ((s.hideMaps || []).includes(id) && (s.hideMapSize || s.hideMapError)) break;
    await new Promise(r => setTimeout(r, 50));
  }
  return JSON.parse(JSON.stringify(a.stats()));
}

function pageAnchors() {
  // 以身体骨骼世界坐标定目标：颈 = Neck→Head 的 0.45 处，脸 = Head 上方 8 cm（沿胸椎上方向）。
  // 机位偏移随 Spine2 相对绑定姿势的旋转一起转，动作帧（前倾、转身）仍从角色自身的正 / 侧 / 背看。
  const d = window.__dressup; const a = d.actor;
  let skinned = null;
  a.root.traverse(o => { if (!skinned && o.isSkinnedMesh && o.skeleton) skinned = o; });
  a.root.updateMatrixWorld(true);
  const bones = skinned.skeleton.bones;
  const index = name => bones.findIndex(b => b.name.replace(/[^A-Za-z0-9]/g, '').endsWith(name));
  const world = i => { const e = bones[i].matrixWorld.elements; return [e[12], e[13], e[14]]; };
  // 骨骼相对绑定姿势的世界旋转 = bone.matrixWorld × boneInverse（three.js 蒙皮约定），取其列向量为机位基。
  const basisOf = name => {
    const i = index(name); const e = bones[i].matrixWorld.clone().multiply(skinned.skeleton.boneInverses[i]).elements;
    const col = k => { const v = [e[k], e[k + 1], e[k + 2]]; const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
    return [col(0), col(4), col(8)];
  };
  // 颈部机位只随骨盆偏航转（绕世界 Y），不随颈 / 胸前倾翻滚：大前倾的跑步帧里侧面机位也不会钻进肩或头发。
  const yawOf = name => {
    const b = basisOf(name); const f = [b[2][0], 0, b[2][2]]; const n = Math.hypot(f[0], f[2]) || 1;
    const front = [f[0] / n, 0, f[2] / n];
    return [[front[2], 0, -front[0]], [0, 1, 0], front];
  };
  const neck = world(index('Neck')); const head = world(index('Head'));
  const lerp = (p, q, t) => p.map((v, i) => v + (q[i] - v) * t);
  const headBasis = basisOf('Head');
  const unit = v => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
  const sub = (p, q) => p.map((v, i) => v - q[i]); const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  let nape = null; let napeBasis = null;
  const heads = []; a.root.traverse(o => { if (o.isSkinnedMesh && o !== skinned) heads.push(o); });
  if (heads.length) {
    const bindOf = name => { const m = skinned.skeleton.boneInverses[index(name)].clone().invert().elements;
      return [m[12], m[13], m[14]]; };
    const n0 = bindOf('Neck'); const h0 = bindOf('Head'); const a0 = unit(sub(h0, n0));
    const length = Math.hypot(...sub(h0, n0)); const base = n0.map((v, i) => v + a0[i] * 0.2 * length);
    const b0 = unit([0, 0, -1].map((v, i) => v - dot([0, 0, -1], a0) * a0[i]));
    // 绑定空间（GLB 单位）与世界（米）之比 = 绑定颈骨长 / 当前颈骨长（骨长在动画里不变）。
    const unitLen = length / Math.max(Math.hypot(...sub(head, neck)), 1e-9);
    const r = 0.045 * unitLen; const u = 0.03 * unitLen;
    const targets = [base.map((v, i) => v + b0[i] * r), base.map((v, i) => v - b0[i] * r),
      base.map((v, i) => v + b0[i] * r + a0[i] * u)];
    if (!window.__shootNapeRefs || window.__shootNapeRefs.mesh !== heads[0].uuid) {
      const refs = targets.map(t => { let best = { d: Infinity, mesh: null, i: -1 };
        for (const mesh of heads) {           // 绑定空间（GLB 自身单位）里比：原始顶点 vs 逆绑定矩阵求逆
          const pos = mesh.geometry.attributes.position;
          for (let i = 0; i < pos.count; i += 1) {
            const d = Math.hypot(pos.getX(i) - t[0], pos.getY(i) - t[1], pos.getZ(i) - t[2]);
            if (d < best.d) best = { d, mesh, i };
          }
        }
        return best; });
      window.__shootNapeRefs = { mesh: heads[0].uuid, refs };
    }
    const posed = ({ mesh, i }) => { const v = new (Object.getPrototypeOf(mesh.position).constructor)();
      mesh.getVertexPosition(i, v); v.applyMatrix4(mesh.matrixWorld); return [v.x, v.y, v.z]; };
    const [pn, pt, pu] = window.__shootNapeRefs.refs.map(posed);
    const back = unit(sub(pn, pt)); const upRaw = sub(pu, pn);
    const up = unit(upRaw.map((v, i) => v - dot(upRaw, back) * back[i]));
    nape = pn; napeBasis = [cross(up, back), up, back];
  }
  return { neck: lerp(neck, head, 0.45), face: head.map((v, i) => v + headBasis[1][i] * 0.08), body: [0, 0.9, 0],
    nape: nape ?? lerp(neck, head, 0.2),
    basis: { neck: yawOf('Hips'), face: headBasis, spine: basisOf('Spine2'), nape: napeBasis ?? yawOf('Hips') } };
}

function pagePose(clip, t) {
  // 每次定格都从绑定姿势起算：片段不驱动的通道（根位移、手指等）不得残留上一个姿势，结果与拍摄顺序无关。
  const a = window.__dressup.actor; const update = a.__shootOriginalUpdate ?? a.update;
  a.root.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.pose(); });
  if (clip !== 'bind') {
    a.playClip(clip === 'idle' ? 'walk' : 'idle', 0);
    a.playClip(clip, 0);
    update.call(a, t);
  }
  a.root.updateMatrixWorld(true);
  // 姿势签名：全部骨骼世界坐标之和，跨头比对，保证同名姿势逐头一致。
  let skinned = null;
  a.root.traverse(o => { if (!skinned && o.isSkinnedMesh && o.skeleton) skinned = o; });
  const sum = [0, 0, 0];
  for (const bone of skinned.skeleton.bones) { const e = bone.matrixWorld.elements; sum[0] += e[12]; sum[1] += e[13]; sum[2] += e[14]; }
  return sum;
}

function pageShoot(views, anchors, maskOn) {
  const d = window.__dressup; const v = d.viewer; const a = d.actor;
  a.setHideMapEnabled(maskOn);
  // 蒙皮网格的剔除包围球停在绑定姿势：跑步时头前移 30 cm，近距机位会把整颗头（含颈片）剔掉。截图时关掉剔除，拍完复原。
  const culled = []; a.root.traverse(o => { if (o.isSkinnedMesh) { culled.push([o, o.frustumCulled]); o.frustumCulled = false; } });
  v.setCameraPreset('neck', false);
  const camera = v.camera; const shots = window.__shots ?? (window.__shots = []);
  const out = [];
  const rotate = (basis, v) => [0, 1, 2].map(i => basis[0][i] * v[0] + basis[1][i] * v[1] + basis[2][i] * v[2]);
  for (const view of views) {
    const base = anchors[view.target];
    const frameName = view.basis ?? view.target;
    const local = view.target === 'body' ? (x => x) : (x => rotate(anchors.basis[frameName], x));
    const lift = local([0, view.lift ?? 0, 0]);
    const target = [base[0] + lift[0], base[1] + lift[1], base[2] + lift[2]];
    const offset = local(view.offset); const up = local([0, 1, 0]);
    camera.position.set(target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]);
    camera.up.set(up[0], up[1], up[2]); camera.lookAt(target[0], target[1], target[2]);
    const lens = { near: camera.near, fov: camera.fov };
    const restore = [];
    if (view.cutaway !== undefined) {
      // 裁切：顶点按当前姿势蒙皮后，离相机比"目标 − cutaway"更近的三角从索引里临时去掉（只影响这一张）。
      const eye = camera.position; const look = [target[0] - eye.x, target[1] - eye.y, target[2] - eye.z];
      const length = Math.hypot(...look) || 1; const dir = look.map(x => x / length); const limit = length - view.cutaway;
      a.root.traverse(o => {
        if (!o.isSkinnedMesh || !o.geometry.index) return;
        const index = o.geometry.index; const count = o.geometry.attributes.position.count;
        const ahead = new Uint8Array(count); const v = o.position.clone();
        for (let i = 0; i < count; i += 1) {
          o.getVertexPosition(i, v); v.applyMatrix4(o.matrixWorld);
          ahead[i] = ((v.x - eye.x) * dir[0] + (v.y - eye.y) * dir[1] + (v.z - eye.z) * dir[2]) < limit ? 1 : 0;
        }
        const kept = [];
        for (let t = 0; t < index.count; t += 3) {
          const i0 = index.getX(t), i1 = index.getX(t + 1), i2 = index.getX(t + 2);
          if (!ahead[i0] && !ahead[i1] && !ahead[i2]) kept.push(i0, i1, i2);
        }
        const array = new (index.array.constructor)(kept);
        restore.push([o, index]); o.geometry.setIndex(new index.constructor(array, 1));
      });
    }
    if (view.near !== undefined || view.fov !== undefined) {
      camera.near = view.near ?? camera.near; camera.fov = view.fov ?? camera.fov; camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld(true);
    const url = v.captureScreenshot('image/jpeg', 0.92);
    if (view.near !== undefined || view.fov !== undefined) {
      camera.near = lens.near; camera.fov = lens.fov; camera.updateProjectionMatrix();
    }
    for (const [mesh, index] of restore) mesh.geometry.setIndex(index);
    shots.push(url);
    const stats = a.stats();
    out.push({ view: view.name, url, key: shots.length - 1, hideMapError: stats.hideMapError ?? null,
      hideMaps: [...(stats.hideMaps ?? [])] });
  }
  a.setHideMapEnabled(true);
  for (const [mesh, flag] of culled) mesh.frustumCulled = flag;
  return out;
}

async function pageSheet(rows, columns, cellWidth, title) {
  // rows: [{ label, cells: [{ label, key }] }]；key 指向 pageShoot 存在 window.__shots 里的截图。
  const load = async key => createImageBitmap(await (await fetch(window.__shots[key])).blob());
  const first = await load(rows[0].cells[0].key);
  const cellHeight = Math.round(cellWidth * first.height / first.width);
  const labelWidth = 150, header = 34, captionHeight = 22;
  const width = labelWidth + columns.length * cellWidth;
  const height = header + captionHeight + rows.length * cellHeight;
  const canvas = new OffscreenCanvas(width, height); const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#202227'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#f2f2f2'; ctx.font = '600 18px sans-serif'; ctx.fillText(title, 10, 23);
  ctx.font = '14px sans-serif';
  columns.forEach((name, i) => ctx.fillText(name, labelWidth + i * cellWidth + 8, header + 16));
  for (let r = 0; r < rows.length; r += 1) {
    const y = header + captionHeight + r * cellHeight;
    ctx.fillStyle = '#f2f2f2'; ctx.fillText(rows[r].label, 8, y + cellHeight / 2);
    for (let c = 0; c < rows[r].cells.length; c += 1) {
      const image = await load(rows[r].cells[c].key);
      ctx.drawImage(image, labelWidth + c * cellWidth, y, cellWidth, cellHeight);
      ctx.strokeStyle = '#000'; ctx.strokeRect(labelWidth + c * cellWidth, y, cellWidth, cellHeight);
    }
  }
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { width, height, base64: btoa(binary) };
}

// ---- 主流程 ----

function writeDataUrl(path, url) { writeFileSync(path, Buffer.from(url.split(',', 2)[1], 'base64')); }

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.out, { recursive: true });
  const started = Date.now();
  const server = await serveDirs(args.heads);
  const port = server.address().port;
  await ensureBrowser(args.port);
  const target = await getJson(`http://127.0.0.1:${args.port}/json/new?about:blank`, { method: 'PUT' });
  const cdp = new Cdp(target.webSocketDebuggerUrl); await cdp.ready;
  const summary = { page: args.page, heads: [], shots: [], errors: [], sheet: null, poseSignatures: {} };
  try {
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: args.width, height: args.height,
      deviceScaleFactor: args.dpr, mobile: false });
    await cdp.send('Page.navigate', { url: args.page });
    if (!await cdp.evaluate(pageWaitReady, args.timeoutSec * 1000)) {
      throw new Error(`页面 ${args.page} 在 ${args.timeoutSec}s 内未就绪（开发服务器在跑吗？window.__dressup.actor 不存在）`);
    }
    if (args.template) {
      const selected = await cdp.evaluate(pageSelectTemplate, args.template, args.timeoutSec * 1000);
      if (selected !== 'ok') throw new Error(`切换体型 ${args.template} 失败：${selected}`);
      summary.template = args.template;
    }
    const heads = args.heads.length ? args.heads.map((head, i) => ({ ...head, base: `http://127.0.0.1:${port}/${i}/` }))
      : [{ label: 'template', dir: null, base: null, glb: null, fit: null }];
    const rows = [];
    for (const head of heads) {
      const stats = await cdp.evaluate(pageEquipHead, head.base, head.glb, head.fit, `shoot__${head.label}`);
      summary.heads.push({ label: head.label, dir: head.dir, glb: head.glb, fit: head.fit, stats,
        hideMapError: stats.hideMapError ?? null, bytes: head.dir ? statSync(join(head.dir, head.glb)).size : 0 });
      for (const pose of args.poseList) {
        const signature = await cdp.evaluate(pagePose, pose.clip, pose.t);
        const seen = summary.poseSignatures[pose.name];
        if (!seen) summary.poseSignatures[pose.name] = signature;
        else if (Math.max(...signature.map((v, i) => Math.abs(v - seen[i]))) > 1e-6) {
          throw new Error(`姿势 ${pose.name} 在 ${head.label} 上与先前不一致：${JSON.stringify(signature)} vs ${JSON.stringify(seen)}`);
        }
        const anchors = await cdp.evaluate(pageAnchors);
        summary.anchors = summary.anchors ?? {};
        summary.anchors[`${head.label}/${pose.name}`] = anchors;
        for (const maskOn of args.masks) {
          const tag = `${head.label}/${pose.name}${args.masks.length > 1 ? (maskOn ? '/mask' : '/nomask') : ''}`;
          const shots = await cdp.evaluate(pageShoot, args.viewList, anchors, maskOn);
          const cells = [];
          for (const shot of shots) {
            const file = join(args.out, `${head.label}__${pose.name}__${shot.view}${maskOn ? '' : '__nomask'}.jpg`);
            writeDataUrl(file, shot.url);
            summary.shots.push({ head: head.label, pose: pose.name, view: shot.view, mask: maskOn, file,
              hideMapError: shot.hideMapError, hideMaps: shot.hideMaps });
            cells.push({ label: shot.view, key: shot.key });
          }
          rows.push({ label: tag, cells });
        }
      }
    }
    const sheet = await cdp.evaluate(pageSheet, rows, args.viewList.map(v => v.name), 420,
      `shoot_head · ${args.heads.map(h => h.label).join(' vs ') || 'template'}${args.template ? ` · ${args.template}` : ''} · ${new Date().toISOString()}`);
    const sheetPath = join(args.out, 'sheet.jpg');
    writeFileSync(sheetPath, Buffer.from(sheet.base64, 'base64'));
    summary.sheet = { file: sheetPath, width: sheet.width, height: sheet.height };
    for (const event of cdp.events) {
      if (event.method === 'Runtime.exceptionThrown') summary.errors.push(event.params.exceptionDetails?.exception?.description ?? event.params.exceptionDetails?.text);
      if (event.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(event.params.type)) {
        summary.errors.push(`${event.params.type}: ${event.params.args.map(x => x.value ?? x.description ?? '').join(' ')}`.slice(0, 300));
      }
    }
  } finally {
    cdp.close();
    await fetch(`http://127.0.0.1:${args.port}/json/close/${target.id}`).catch(() => undefined);
    server.close();
    if (args.closeBrowser) {
      const version = await getJson(`http://127.0.0.1:${args.port}/json/version`).catch(() => null);
      if (version?.webSocketDebuggerUrl) {
        const browser = new Cdp(version.webSocketDebuggerUrl); await browser.ready;
        await browser.send('Browser.close').catch(() => undefined); browser.close();
      }
    }
  }
  summary.elapsedMs = Date.now() - started;
  writeFileSync(join(args.out, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  if (args.json) console.log(JSON.stringify(summary));
  else console.log(`${summary.shots.length} 张 → ${summary.sheet.file}（${summary.elapsedMs} ms；页面报错 ${summary.errors.length} 条）`);
}

main().catch(error => { console.error(`shoot_head 失败：${error.message}`); process.exit(1); });
