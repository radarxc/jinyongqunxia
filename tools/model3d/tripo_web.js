/* global window, document, location, localStorage, sessionStorage, indexedDB, fetch, File, DataTransfer, Event, URL, setTimeout, TextDecoder */
// Tripo Studio 网页版驱动（AR-65）。页面里是 window.__t；操作手册见 .claude/skills/tripo-web/SKILL.md。
// 载入：一次性 localStorage.setItem('claudeT', <本文件内容>)（studio.tripo3d.ai 同源共享，刷新后还在）；之后每次整页刷新 / navigate 后：
//   window.__claudeTT ??= trustedTypes.createPolicy('cl' + Date.now(), { createScript: (s) => s });
//   eval(window.__claudeTT.createScript(localStorage.getItem('claudeT')));
// 做法（2026-10-04 读前端源码确认）：
// - 请求一律走页面自己的客户端 $request（Nuxt globalProperties.$request）：它自带登录态（authorization: Bearer、x-tripo-device-id），
//   返回值已拆掉 {code, data} 外壳；出错抛 FetchError，e.data 里是 {code, message}。
// - 请求体照页面源码拼：生成 = 工作台生成面板（chunk d0-kdlow），绑骨 = workspace-rigging-panel-submit（BANs6Mft），
//   导出 = 导出面板参数（BANs6Mft）+ 前端 / 后端导出分流（CpndXtBA）+ export / download_with_name（DJfzZG46）。
//   导出贴图 2K ≠ 模型原生 8K，所以页面也走后端导出：POST export → 轮询进度 → download_with_name 拿带文件名的下载地址。
// - 扣点的 generate（65）、rig（20），以及会改项目的 retarget / freeRetry / restore，默认 dry：只返回将要发的请求体；
//   显式传 { go: true } 才真发。真发前查余额，发后核对扣点，并在 localStorage.claudeTLog 记一笔（调用超时后先查记录，别重复提交）。
// - 返回值不带作者的用户名、头像、用户 ID、邮箱（scrub），签名下载地址只露文件名（short）。
// - 单次 JS 调用 ≤ 40 秒：等待类方法默认最多等 28 秒，没等到返回 pending:true，再调一次即可。
window.__t = {
  ver: '2026-10-04',
  // 生成参数：HD Model · H3.1 Best Quality、Ultra Mesh（geometry_quality detailed）、8K（texture_quality extreme）、PBR、去光照、
  // Triangle、面数上限 10 万、Private。键的顺序照页面（d0-kdlow）：image_to_model 在 texture_quality 后多一个 enable_image_autofix。
  GEN: { face_limit: 100000, quad: false, visibility: 'private', model_version: 'v3.1-20260211', generate_parts: false, smart_poly: false,
    texture: true, delight: true, pbr: true, texture_alignment: 'original_image', texture_quality: 'extreme' },
  GEOMETRY: 'detailed',
  // 生成面板上对应的设置（走按钮生成时核对；走 API 时请求体不看面板）
  UI: { tab: 'high_detail', hdVersion: 'v3.1-20260211', geometryQuality: 'detailed', texture: true, textureQuality: 'extreme', pbr: true,
    delight: true, quad: 'triangle', faceLimit: 100000, privateMode: 'private', generateParts: false, enableImageAutofix: false, smartPoly: false },
  RIG: { model_version: 'v3.0-20260909', rig_type: 'biped', spec: 'mixamo' },  // Humanoid + Mixamo；页面绑骨面数上限 10 万
  COST: { generate: 65, rig: 20, retarget: 0, export: 0, freeRetry: 0, restore: 0 },
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  async waitFor(fn, ms = 15000, step = 300) { const t = Date.now(); for (;;) { const v = fn(); if (v) return v; if (Date.now() - t >= ms) return null; await this.sleep(step); } },
  app: () => document.querySelector('#__nuxt').__vue_app__,
  gp() { return this.app().config.globalProperties; },
  pinia() { return this.gp().$pinia; },
  router() { return this.gp().$router; },
  store(n) { return this.pinia()._s.get(n); },
  gst() { return this.store('workspace-generate-store'); },
  // ── 工具 ──
  short: (u) => String(u || '').split('?')[0].split('/').slice(-2).join('/'),
  PRIVATE: /^(owner_name|owner_avatar|owner_user_id|user_id|user_name|username|nickname|nick_name|email|avatar|avatar_url|sub_id|subid|phone)$/i,
  scrub(o) {
    if (Array.isArray(o)) return o.map((x) => this.scrub(x));
    if (!o || typeof o !== 'object') return o;
    const r = {}; for (const [k, v] of Object.entries(o)) if (!this.PRIVATE.test(k)) r[k] = this.scrub(v); return r;
  },
  err(e) { const d = e && e.data; return d && typeof d === 'object' ? `${e.status || ''} ${d.code} ${d.message}`.trim() : String((e && e.message) || e).slice(0, 200); },
  async req(path, opts = {}) { const f = this.gp().$request; if (!f) throw new Error('no $request（页面没载完？）'); return f(path, { method: 'GET', ...opts }); },
  log(step, data) {
    const L = JSON.parse(localStorage.getItem('claudeTLog') || '[]'); L.push({ t: new Date().toISOString(), step, ...data });
    localStorage.setItem('claudeTLog', JSON.stringify(L.slice(-100))); return L.length;
  },
  logs(n = 10) { return JSON.parse(localStorage.getItem('claudeTLog') || '[]').slice(-n); },
  where() {
    const st = this.gst();
    return { path: location.pathname, vis: document.visibilityState, vp: [window.innerWidth, window.innerHeight], mode: st && st.mode, tab: st && st.tab,
      img: !!(st && st.imageToModel), views: st ? (st.multiViewImages || []).map((x) => !!(x && x.key)) : null,
      uploading: st ? !!(st.imageToModelUploading || (st.multiViewUploading || []).some(Boolean)) : null };
  },
  // ── 只读查询 ──
  async wallet() { const p = await this.req('/v2/studio/user/profile/payment'); const w = p.wallet || {}; return { total: w.total_credit, expiring: w.expiring_credit, expiring_date: w.expiring_date }; },
  async credits() { return (await this.wallet()).total; },
  async detail(pid) { return this.req(`/v2/studio/project/detail/v3/${pid}`, { query: { locale: 'en' } }); },
  sumOp(o) {
    if (!o) return null;
    return { op: o.operator_id, type: o.type, status: o.status, model_version: o.model_version, rigged: !!o.is_rigged, rig_op: o.rigging && o.rigging.operator_id,
      pbr: o.is_pbr, ultra: o.is_ultra_textured, latest: o.is_latest_operator, created: o.created_at && new Date(o.created_at * 1000).toISOString().slice(0, 16),
      model: this.short(o.model_url), covers: (o.cover_image_object || []).map((c) => c && c.key && c.key.split('/').pop()),
      retarget: (o.retarget || []).map((r) => ({ name: r.name, op: r.operator_id, status: r.status })) };
  },
  async proj(pid) { const d = await this.detail(pid); return { pid: d.id, name: d.project_name, visibility: d.visibility, ...this.sumOp(d.operator) }; },
  // 资产列表（Assets 面板同一个接口；页面每页 20 条）
  async projects({ offset = 0, size = 20 } = {}) {
    const d = await this.req('/v2/studio/assets/v2', { query: { asset_type: 'mine', locale: 'en', offset, size, type: 'all' } });
    return { total: d.total, offset, items: (d.projects || []).map((p) => { const o = p.operator || {}; return { pid: p.id, name: p.project_name, type: o.type, status: o.status, rigged: !!o.is_rigged, anims: (o.retarget || []).length, created: o.created_at && new Date(o.created_at * 1000).toISOString().slice(0, 16) }; }) };
  },
  async find(prefix, pages = 4) { for (let i = 0; i < pages; i++) { const r = await this.projects({ offset: i * 20 }); const m = r.items.find((x) => x.pid.startsWith(prefix)); if (m) return m; if (r.items.length < 20) break; } return null; },
  // 版本历史（生成 → 绑骨 → 重贴图…；回退用 restore）
  async history(pid) { const h = await this.req(`/v2/studio/project/history/${pid}`); return (h.history || []).map((x) => ({ op: x.operator_id || x.id, type: x.type, created: x.created_at && new Date(x.created_at * 1000).toISOString().slice(0, 16) })); },
  async progress(ids) { const r = await this.req('/v2/studio/progress', { method: 'POST', body: { ids: [].concat(ids) } }); return (Array.isArray(r) ? r : [r]).map((x) => ({ op: x.operator_id || x.id, status: x.status, progress: x.progress, left_time: x.left_time })); },
  RUNNING: /^(queued|waiting|pending|running|processing|in_progress)$/,
  async waitOp(op, ms = 28000) {
    const t0 = Date.now();
    for (;;) {
      const p = (await this.progress(op))[0] || {};
      if (p.status && !this.RUNNING.test(p.status)) return { done: true, op, status: p.status, progress: p.progress };
      if (Date.now() - t0 >= ms) return { done: false, pending: true, op, status: p.status, progress: p.progress, left_time: p.left_time };
      await this.sleep(3000);
    }
  },
  // ── 参考图：暂存进本页 IndexedDB「claudeRefs」（键 = 文件名），之后上传是纯 JS ──
  idb() { return new Promise((res, rej) => { const r = indexedDB.open('claudeRefs', 1); r.onupgradeneeded = () => r.result.createObjectStore('files'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async idbDo(mode, fn) { const db = await this.idb(); return new Promise((res, rej) => { const t = db.transaction('files', mode); const q = fn(t.objectStore('files')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); },
  idbPut(k, v) { return this.idbDo('readwrite', (s) => s.put(v, k)); },
  idbGet(k) { return this.idbDo('readonly', (s) => s.get(k)); },
  idbDel(k) { return this.idbDo('readwrite', (s) => s.delete(k)); },
  idbKeys() { return this.idbDo('readonly', (s) => s.getAllKeys()); },
  async stage(input = document.querySelector('input[aria-label="claude loader"]')) {
    const out = [];
    for (const f of (input && input.files) || []) { if (!/^image\//.test(f.type)) continue; await this.idbPut(f.name, f); out.push([f.name, f.size]); }
    return out;
  },
  // ── 生成页 ──
  inputs() { return [...document.querySelectorAll('input[type=file]')].filter((i) => /image|png|jpe?g|webp/i.test(i.accept || '')); },
  // 多视图槽位顺序 0 Front、1 Left、2 Back、3 Right（store.multiViewImages 的下标，也是请求体 image[] 的顺序）
  VIEWS: ['front', 'left', 'back', 'right'],
  async toGenerate(mode = 'imageToModel') {
    if (location.pathname !== '/workspace/generate') await this.router().push('/workspace/generate');
    if (!(await this.waitFor(() => this.gst() && this.inputs().length, 15000))) return { ok: false, why: 'generate panel not ready', ...this.where() };
    const st = this.gst();
    if (st.tab !== 'high_detail') return { ok: false, why: 'tab is ' + st.tab + '（先在面板上切到 HD Model）', ...this.where() };
    if (st.mode !== mode) { st.mode = mode; await this.waitFor(() => this.gst().mode === mode, 3000); await this.sleep(600); }
    return { ok: this.gst().mode === mode, inputs: this.inputs().length, ...this.where() };
  },
  // 多视图模式下每个空槽各有一个 <input type=file>，DOM 顺序是 Front、Left、Right、Back；按离 input 最近的槽位标题认，不按顺序
  inputLabel(i) {
    for (let e = i, k = 0; k < 8 && e; k++, e = e.parentElement) {
      const t = [...e.querySelectorAll('p,span,div')].find((x) => x.children.length === 0 && /^(front|left|back|right)$/i.test((x.textContent || '').trim()));
      if (t) return t.textContent.trim().toLowerCase();
    }
    return null;
  },
  slotInput(slot) { return this.inputs().find((i) => this.inputLabel(i) === this.VIEWS[slot]) || null; },
  async uploadRef(name, { slot = null, ms = 30000 } = {}) {
    name = String(name).split('/').pop();
    const st = this.gst(); if (!st || !/^\/workspace\/generate/.test(location.pathname)) return { ok: false, name, why: 'not on generate page' };
    const multi = slot !== null && slot !== undefined;
    if (multi !== (st.mode === 'multiView')) return { ok: false, name, why: 'mode is ' + st.mode };
    const f = await this.idbGet(name); if (!f) return { ok: false, name, why: 'not staged', staged: await this.idbKeys() };
    const get = () => (multi ? st.multiViewImages[slot] : st.imageToModel);
    const busy = () => (multi ? st.multiViewUploading[slot] : st.imageToModelUploading);
    if (get()) return { ok: false, name, why: 'slot occupied（先 clearUpload）' };
    const inp = multi ? this.slotInput(slot) : this.inputs()[0];
    if (!inp) return { ok: false, name, why: 'no file input', n: this.inputs().length };
    const file = new File([f], name, { type: f.type || 'image/png' });
    const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
    const ok = await this.waitFor(() => !busy() && get() && get().key, ms, 500);
    const o = get();
    return { ok: !!ok && (!o.image_audit_result || o.image_audit_result === 'pass'), name, size: file.size, slot: multi ? this.VIEWS[slot] : null,
      key: o && o.key ? o.key.split('/').slice(-3).join('/') : null, audit: o && o.image_audit_result, uploading: !!busy() };
  },
  clearUpload() {
    const st = this.gst(); if (!st) return null;
    if (st.imageToModel) st.clearImageToModel();
    (st.multiViewImages || []).forEach((x, i) => { if (x) st.clearMultiViewSlot(i); });
    return this.where();
  },
  checkSettings(mode) {
    const st = this.gst(); if (!st) return { ok: false, why: 'no generate store' };
    const bad = Object.entries(this.UI).filter(([k, v]) => st[k] !== v).map(([k]) => `${k}=${st[k]}`);
    if (mode && st.mode !== mode) bad.push('mode=' + st.mode);
    return { ok: !bad.length, bad, mode: st.mode };
  },
  img: (o) => (o && o.key ? { bucket: o.bucket, image_audit_result: o.image_audit_result, image_source: o.image_source, key: o.key } : null),
  genBody(mode = this.gst().mode) {
    const st = this.gst(), G = this.GEN;
    const b = { face_limit: G.face_limit, quad: G.quad, visibility: G.visibility, model_version: G.model_version, generate_parts: G.generate_parts, smart_poly: G.smart_poly,
      texture: G.texture, delight: G.delight, pbr: G.pbr, texture_alignment: G.texture_alignment, texture_quality: G.texture_quality };
    if (mode === 'imageToModel') { const i = this.img(st.imageToModel); if (!i) return null; return { ...b, enable_image_autofix: false, geometry_quality: this.GEOMETRY, image: i }; }
    if (mode === 'multiView') { const a = (st.multiViewImages || []).map((x) => this.img(x)); if (!a[0] || a.filter(Boolean).length < 2) return null; return { ...b, geometry_quality: this.GEOMETRY, image: a }; }
    return null;
  },
  // 生成（65 点）。默认 dry；{ go: true } 才真发。成功后可 { open: true } 让页面跳到这个项目看进度。
  async generate({ go = false, open = false } = {}) {
    const st = this.gst(); if (!st) return { ok: false, why: 'not on generate page' };
    const mode = st.mode;
    if (st.imageToModelUploading || (st.multiViewUploading || []).some(Boolean)) return { ok: false, why: 'upload in progress' };
    const body = this.genBody(mode); if (!body) return { ok: false, why: 'no uploaded image', mode };
    const audit = [].concat(body.image).filter(Boolean).map((i) => i.image_audit_result);
    if (audit.some((a) => a && a !== 'pass')) return { ok: false, why: 'image audit ' + audit.join(',') };
    const path = mode === 'multiView' ? '/v2/studio/operation/multiview_to_model' : '/v2/studio/operation/image_to_model';
    if (!go) return { ok: true, dry: true, path, cost: this.COST.generate, body };
    const w0 = await this.credits(); if (!(w0 >= this.COST.generate)) return { ok: false, why: 'credits ' + w0 };
    let r; try { r = await this.req(path, { method: 'POST', body }); } catch (e) { this.log('generate-error', { mode, why: this.err(e) }); return { ok: false, why: this.err(e), hint: '先查 projects() 和余额，确认没生成上再重发' }; }
    const v = (r.variations || [])[0] || {};
    const pid = r.project_id || v.project_id, op = r.operator_id || v.operator_id;
    this.log('generate', { pid, op, mode, key: [].concat(body.image).filter(Boolean).map((i) => i.key.split('/').slice(-2, -1)[0]) });
    await this.sleep(1500); const w1 = await this.credits();
    if (open && pid) await this.router().push('/workspace/generate/' + pid);
    return { ok: !!(pid && op), pid, op, nsfw: r.is_nsfw, credits: { before: w0, after: w1, spent: w0 - w1 } };
  },
  // ── 按钮兜底：返回按钮中心的 CSS 坐标；computer 工具的坐标 = CSS × (截图坐标系宽 / innerWidth)，点之前 guard 核一次 ──
  btn(re) {
    const b = [...document.querySelectorAll('button')].find((x) => x.getClientRects().length && re.test(x.innerText.replace(/\s+/g, ' ').trim()));
    if (!b) return null; const r = b.getBoundingClientRect();
    return { text: b.innerText.replace(/\s+/g, ' ').trim(), css: [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)], disabled: !!b.disabled, iw: window.innerWidth };
  },
  guard(x, y, re) { const e = document.elementFromPoint(x, y); const b = e && e.closest('button'); const t = b ? b.innerText.replace(/\s+/g, ' ').trim() : (e ? e.tagName : 'none'); return { ok: re.test(t), text: t }; },
  genButton() { const s = this.checkSettings(); return { ...s, btn: this.btn(/^Generate\s*65$/) }; },
  // ── 绑骨（20 点）：pre_rig_check（页面同样先查）→ rigging_model。默认 dry。 ──
  async rig(pid, { go = false } = {}) {
    const d = await this.detail(pid); const o = d.operator || {};
    if (o.status !== 'success') return { ok: false, why: `model not ready ${o.type}:${o.status}` };
    if (o.is_rigged) return { ok: false, why: 'already rigged', rig_op: o.rigging && o.rigging.operator_id };
    const body = { model_version: this.RIG.model_version, project_id: pid, rig_type: this.RIG.rig_type, spec: this.RIG.spec };
    if (!go) return { ok: true, dry: true, cost: this.COST.rig, precheck: { model_version: body.model_version, project_id: pid }, body };
    const w0 = await this.credits(); if (!(w0 >= this.COST.rig)) return { ok: false, why: 'credits ' + w0 };
    let c; try { c = await this.req('/v2/studio/operation/pre_rig_check', { method: 'POST', body: { model_version: body.model_version, project_id: pid } }); } catch (e) { return { ok: false, why: 'pre_rig_check ' + this.err(e) }; }
    if (!c.riggable) return { ok: false, why: 'not riggable', rig_type: c.rig_type, check_success: c.check_success };
    let r; try { r = await this.req('/v2/studio/operation/rigging_model', { method: 'POST', body }); } catch (e) { this.log('rig-error', { pid, why: this.err(e) }); return { ok: false, why: this.err(e), hint: '先 proj(pid) 看是否已在绑骨，再决定是否重发' }; }
    this.log('rig', { pid, op: r.operator_id });
    await this.sleep(1500); const w1 = await this.credits();
    return { ok: !!r.operator_id, pid, op: r.operator_id, credits: { before: w0, after: w1, spent: w0 - w1 } };
  },
  rigButton() { const s = this.store('feature-workspace-rigging') || {}; return { type: s.riggingType, preset: s.skeletonPreset, model_version: s.modelVersion, btn: this.btn(/^(Auto Rig|Rig|Retry)\s*20$/) }; },
  // 绑骨结果体检：取绑骨版 GLB，算 mixamorig 关节的世界坐标。经验值（高度归一到约 0.98）：髋 0.45–0.65，头 > 0.72 且在髋之上，
  // 头顶骨端在头之上，双脚 < 0.15，双手离髋水平距离 > 0.12 且两手高度相近。绑坏的样子：骨架压扁、倒立、手脚错位。
  async joints(pidOrUrl) {
    let url = pidOrUrl;
    if (!/^https?:/.test(url)) { const o = (await this.detail(url)).operator || {}; if (!o.is_rigged) return { ok: false, why: 'not rigged' }; url = (o.rigging && o.rigging.model_url) || o.model_url; }
    const buf = await (await fetch(url)).arrayBuffer(); const dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x46546c67) return { ok: false, why: 'not glb' };
    const j = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, dv.getUint32(12, true))));
    const sk = (j.skins || [])[0]; if (!sk) return { ok: false, why: 'no skin' };
    const local = (n) => {
      if (n.matrix) return n.matrix.slice();
      const [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1], [tx, ty, tz] = n.translation || [0, 0, 0];
      return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0, 2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
        2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1];
    };
    const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
    const parent = {}; j.nodes.forEach((n, i) => (n.children || []).forEach((c) => { parent[c] = i; }));
    const memo = {}; const world = (i) => memo[i] || (memo[i] = parent[i] === undefined ? local(j.nodes[i]) : mul(world(parent[i]), local(j.nodes[i])));
    const pos = {}; for (const i of sk.joints) { const m = /^mixamorig:?(.+)$/.exec(j.nodes[i].name || ''); if (m) { const w = world(i); pos[m[1]] = [w[12], w[13], w[14]].map((v) => Math.round(v * 1000) / 1000); } }
    const H = pos.Hips, hd = pos.Head, tp = pos.HeadTop_End, lh = pos.LeftHand, rh = pos.RightHand, lf = pos.LeftFoot, rf = pos.RightFoot;
    const hz = (a) => (a && H ? Math.round(Math.hypot(a[0] - H[0], a[2] - H[2]) * 1000) / 1000 : null);
    const ys = []; for (const m of j.meshes || []) for (const p of m.primitives || []) { const a = j.accessors[p.attributes.POSITION]; if (a && a.min) ys.push(a.min[1], a.max[1]); }
    const chk = { joints: sk.joints.length === 65 || sk.joints.length === 66, hips: !!H && H[1] > 0.45 && H[1] < 0.65, head: !!(hd && H) && hd[1] > 0.72 && hd[1] > H[1],
      top: !!(tp && hd) && tp[1] > hd[1], feet: !!(lf && rf) && lf[1] < 0.15 && rf[1] < 0.15, hands: !!(lh && rh) && hz(lh) > 0.12 && hz(rh) > 0.12 && Math.abs(lh[1] - rh[1]) < 0.1 };
    return { ok: Object.values(chk).every(Boolean), chk, n: sk.joints.length, extra: Object.keys(pos).length !== sk.joints.length ? sk.joints.map((i) => j.nodes[i].name).filter((s) => !/^mixamorig/.test(s || '')) : [],
      Hips: H, Head: hd, HeadTop_End: tp, LeftHand: lh, RightHand: rh, handOut: [hz(lh), hz(rh)], LeftFoot: lf, RightFoot: rf,
      meshY: ys.length ? [Math.min(...ys), Math.max(...ys)].map((v) => Math.round(v * 1000) / 1000) : null, bytes: buf.byteLength, file: this.short(url) };
  },
  // ── 预设动作（主角用，0 点，但会给项目加动作）：一次一个预设，和页面一样；默认 dry ──
  async retarget(pid, names = ['idle', 'walk', 'run'], { go = false } = {}) {
    const bodies = names.map((n) => ({ animations: [/^preset:/.test(n) ? n : `preset:biped:${n}`], model_version: 'default', project_id: pid, rig_type: 'biped' }));
    if (!go) return { ok: true, dry: true, bodies };
    const o = (await this.detail(pid)).operator || {}; if (!o.is_rigged) return { ok: false, why: 'not rigged' };
    const have = new Set((o.retarget || []).filter((r) => r.status === 'success').map((r) => r.name)); const out = [];
    for (const b of bodies) {
      const n = b.animations[0]; if (have.has(n)) { out.push({ name: n, skipped: 'exists' }); continue; }
      try { const r = await this.req('/v2/studio/operation/retarget_model', { method: 'POST', body: b }); this.log('retarget', { pid, name: n, op: r.operator_id }); out.push({ name: n, op: r.operator_id }); } catch (e) { out.push({ name: n, why: this.err(e) }); }
    }
    return { ok: out.every((x) => x.op || x.skipped), out };
  },
  // ── 导出（0 点）：参数照导出面板——GLB、2K 贴图、Export Skeleton 开（with_animation）、原地动作（animate_in_place）。
  // anims 给预设名（['idle','walk','run']）就把这些动作一起导进一个 GLB；不给就是不带动作的 model_rig。 ──
  exportParams(pid, name, animOps = [], { textureSize = 2048, skeleton = true, inPlace = true } = {}) {
    return { animate_in_place: inPlace, animations: skeleton ? animOps : [], bake_animation_frame: 0, enable_bake_animation: false, export_orientation: '-y',
      export_vertex_colors: false, fbx_preset: 'blender', format: 'gltf', model_version: 'default', name, pack_uv: false, project_id: pid,
      texture_packaging: 'zip', texture_size: textureSize, with_animation: skeleton };
  },
  // 导出名（GLB 里贴图名的前缀，沿用此前的 <npc>_model_rig / <npc>_anim_idle_walk_run）和存盘名（~/Downloads/tripo__<npc>[__anim_…].glb）
  short3: (n) => String(n).split(':').pop(),
  exportName(npc, anims = []) { return npc + (anims.length ? '_anim_' + anims.map(this.short3).join('_') : '_model_rig'); },
  fileBase(npc, anims = []) { return 'tripo__' + npc + (anims.length ? '__anim_' + anims.map(this.short3).join('_') : ''); },
  async exportGlb(pid, npc, { anims = [], ms = 28000, textureSize = 2048 } = {}) {
    const key = `claudeTExport:${pid}:${anims.join('+') || 'rig'}:${textureSize}`;
    let s = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (!s) {
      const o = (await this.detail(pid)).operator || {};
      if (o.status !== 'success') return { ok: false, why: `model not ready ${o.type}:${o.status}` };
      // 动作按项目里 retarget 列表的顺序带上（和导出面板勾选后的顺序一致）
      const rt = (o.retarget || []).filter((r) => r.status === 'success');
      const want = anims.map((n) => (/^preset:/.test(n) ? n : `preset:biped:${n}`));
      const miss = want.filter((n) => !rt.some((r) => r.name === n));
      if (miss.length) return { ok: false, why: 'animation missing', miss, have: rt.map((r) => r.name) };
      const ops = rt.filter((r) => want.includes(r.name)).map((r) => r.operator_id);
      const name = this.exportName(npc, anims);
      const params = this.exportParams(pid, name, ops, { textureSize, skeleton: !!o.is_rigged });
      let r; try { r = await this.req('/v2/studio/operation/export', { method: 'POST', body: params }); } catch (e) { return { ok: false, why: 'export ' + this.err(e) }; }
      s = { name, op: r.operator_id || null, url: r.model_url || null, rigged: !!o.is_rigged };
      sessionStorage.setItem(key, JSON.stringify(s));
    }
    if (!s.url) {
      const w = await this.waitOp(s.op, ms);
      if (!w.done) return { ok: false, pending: true, op: s.op, progress: w.progress, status: w.status };
      if (w.status !== 'success') { sessionStorage.removeItem(key); return { ok: false, why: 'export ' + w.status, op: s.op }; }
      try { s.url = (await this.req('/v2/studio/operation/download_with_name', { method: 'POST', body: { file_name: s.name, operator_id: s.op } })).model_url; } catch (e) { return { ok: false, why: 'download_with_name ' + this.err(e), op: s.op }; }
      sessionStorage.setItem(key, JSON.stringify(s));
    }
    const sv = await this.save(s.url, this.fileBase(npc, anims) + '.glb');
    if (sv.ok) sessionStorage.removeItem(key);
    return { ...sv, op: s.op, rigged: s.rigged, src: this.short(s.url) };
  },
  // ── 存盘方式（localStorage.claudeTSaveMode）──
  // 'direct'（默认）：作者已在 Chrome 里允许 studio.tripo3d.ai「自动下载多个文件」（10-04 作者点了「允许」，实测连续两个脚本下载都落盘），直接存。
  // 'reload'（备用）：没有这个权限时，Chrome 每次整页载入后只放行一个由脚本发起的下载，之后的静默丢弃（10-04 实测）。
  //   这时 exportGlb / preview 只把 {url, 文件名} 排进本标签页的 sessionStorage.claudeTSave；
  //   每存一个：navigate 整页刷新 → 重新 eval 驱动 → await __t.flushSave()（存队首一个）。签名地址约两天内有效。
  //   站点若被设成「阻止」，同站刷新也不放行，只能请作者改设置。
  saveMode() { return localStorage.getItem('claudeTSaveMode') || 'direct'; },
  setSaveMode(m) { if (!/^(direct|reload)$/.test(m)) throw new Error('mode: direct | reload'); localStorage.setItem('claudeTSaveMode', m); return m; },
  saveQueue() { return JSON.parse(sessionStorage.getItem('claudeTSave') || '[]'); },
  async save(url, filename) {
    if (this.saveMode() === 'direct') return this.saveUrl(url, filename);
    const q = this.saveQueue().filter((x) => x.file !== filename); q.push({ url, file: filename, t: Date.now() });
    sessionStorage.setItem('claudeTSave', JSON.stringify(q));
    return { ok: true, queued: true, file: filename, left: q.length, next: 'navigate 整页刷新 → eval 驱动 → await __t.flushSave()' };
  },
  // 存队首一个（整页刷新后第一个调用）；没落盘就 requeueLast() 放回队首，再刷新重来
  async flushSave() {
    const q = this.saveQueue(); if (!q.length) return { ok: true, left: 0 };
    const it = q.shift(); sessionStorage.setItem('claudeTSave', JSON.stringify(q)); sessionStorage.setItem('claudeTSaveLast', JSON.stringify(it));
    const r = await this.saveUrl(it.url, it.file);
    return { ...r, left: q.length };
  },
  requeueLast() {
    const it = JSON.parse(sessionStorage.getItem('claudeTSaveLast') || 'null'); if (!it) return { ok: false, why: 'nothing' };
    const q = this.saveQueue().filter((x) => x.file !== it.file); q.unshift(it); sessionStorage.setItem('claudeTSave', JSON.stringify(q)); return { ok: true, left: q.length };
  },
  clearSaveQueue() { sessionStorage.removeItem('claudeTSave'); sessionStorage.removeItem('claudeTSaveLast'); return 0; },
  // 下载地址是 CDN 签名 URL，不带 cookie；存盘用 <a download>，落到 ~/Downloads/<filename>（重名时 Chrome 会加 (1)，入库脚本会报错）。
  // filename 以 .auto 结尾时按文件头定扩展名（Tripo 的 studio_mesh.webp 实际是 PNG）。
  // 前提：Chrome 允许 studio.tripo3d.ai「自动下载多个文件」（作者 10-04 已点「允许」）；权限被收回时页面每次整页载入后只放行第一个下载，
  // 后面的静默丢弃——这里返回 ok:true 只说明页面已发起下载，是否落盘以 ~/Downloads 为准（入库脚本会等文件出现），落不了盘就改 reload。
  extOf(h) { return h[0] === 0x89 && h[1] === 0x50 ? 'png' : h[0] === 0xff && h[1] === 0xd8 ? 'jpg' : h[0] === 0x52 && h[1] === 0x49 && h[8] === 0x57 ? 'webp' : h[0] === 0x67 && h[1] === 0x6c && h[2] === 0x54 && h[3] === 0x46 ? 'glb' : 'bin'; },
  async saveUrl(url, filename) {
    const r = await fetch(url); if (!r.ok) return { ok: false, why: 'http ' + r.status, file: filename };
    const b = await r.blob(); const head = new Uint8Array(await b.slice(0, 12).arrayBuffer());
    if (/\.auto$/.test(filename)) filename = filename.replace(/\.auto$/, '.' + this.extOf(head));
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000); await this.sleep(1500);
    return { ok: true, file: filename, bytes: b.size, type: this.extOf(head) };
  },
  // ── 预览图：Tripo 服务器渲染的封面（正面、白底）。studio_mesh.webp = 带贴图的模型，studio_mesh_rig.webp = 叠了骨架的同一视角。
  // 原图 600×778（2026-10-04 实测；sizes 里的 thumbnail / small / large 是缩放代理，不会比原图大，small 还会重压），默认取原图；
  // 存成 ~/Downloads/tripo__<npc>.png（rig 版 tripo__<npc>__rig.webp；扩展名按文件头定）。 ──
  async cover(pid, kind = 'mesh', size = 'orig') {
    const o = (await this.detail(pid)).operator || {}; const objs = (o.cover_image_object || []).filter(Boolean);
    const re = kind === 'rig' ? /studio_mesh_rig\.webp$/ : /studio_mesh\.webp$/;
    const c = objs.find((x) => re.test(x.key || '')) || (kind === 'mesh' ? objs[0] : null);
    if (!c) return { ok: false, why: 'no cover', have: objs.map((x) => (x.key || '').split('/').pop()) };
    const s = size === 'orig' ? null : (c.sizes || []).find((x) => x.name === size);
    return { ok: true, url: s ? s.url : c.url, file: (c.key || '').split('/').pop(), size: s ? size : 'orig' };
  },
  async preview(pid, npc, { kind = 'mesh', size = 'orig' } = {}) {
    const c = await this.cover(pid, kind, size); if (!c.ok) return c;
    const sv = await this.save(c.url, `tripo__${npc}${kind === 'rig' ? '__rig' : ''}.auto`);
    return { ...sv, cover: c.file, variant: c.size };
  },
  // 不下载、只在页面上并排看两张封面（截图验收用）；看完 hideCovers()
  async showCovers(pid, size = 'orig') {
    this.hideCovers();
    const o = (await this.detail(pid)).operator || {}; const objs = (o.cover_image_object || []).filter(Boolean);
    const box = document.createElement('div'); box.className = 'claude-ov';
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;gap:8px;align-items:center;justify-content:center';
    for (const c of objs) { const s = (c.sizes || []).find((x) => x.name === size) || c; const im = document.createElement('img'); im.src = s.url; im.style.cssText = 'height:92vh;border:1px solid #999'; box.appendChild(im); }
    document.body.appendChild(box);
    await this.waitFor(() => [...box.querySelectorAll('img')].every((i) => i.complete), 10000);
    return objs.map((c) => (c.key || '').split('/').pop());
  },
  hideCovers() { document.querySelectorAll('.claude-ov').forEach((e) => e.remove()); return 'hidden'; },
  // ── 补救（0 点，但会改项目）：生成页 Free Retry 重出一次；版本历史回退到某个 operator。默认 dry ──
  async freeRetry(pid, { go = false } = {}) {
    if (!go) return { ok: true, dry: true, path: `/v2/studio/operation/free-retry/${pid}` };
    try { const r = await this.req(`/v2/studio/operation/free-retry/${pid}`, { method: 'POST' }); this.log('free-retry', { pid, op: r.operator_id }); return { ok: true, op: r.operator_id, remaining: r.remaining_retries }; } catch (e) { return { ok: false, why: this.err(e) }; }
  },
  async restore(pid, op, { go = false } = {}) {
    const body = { operator_id: op, project_id: pid }; if (!go) return { ok: true, dry: true, body };
    try { const r = await this.req('/v2/studio/operation/restore', { method: 'POST', body }); this.log('restore', { pid, from: op, op: r.operator_id }); return { ok: true, op: r.operator_id }; } catch (e) { return { ok: false, why: this.err(e) }; }
  },
  // ── 调试：记下页面自己发的 operation / export 请求（按钮兜底时用它取 pid / op）；只记路径、状态和截断的请求 / 响应体 ──
  hookNet() {
    if (window.__tNet) return 'hooked'; window.__tNet = [];
    const of = window.fetch, scrub = (o) => window.__t.scrub(o);
    window.fetch = async function (input, init) {
      const res = await of.apply(this, arguments);
      try {
        const u = typeof input === 'string' ? input : (input && input.url) || '';
        if (/api\.tripo3d\.ai\/v2\/studio\/operation\//.test(u)) res.clone().text().then((t) => { let r = t; try { r = JSON.stringify(scrub(JSON.parse(t))); } catch { /* keep text */ } window.__tNet.push({ t: Date.now(), m: (init && init.method) || 'GET', u: u.replace(/^https:\/\/api\.tripo3d\.ai/, '').split('?')[0], s: res.status, b: init && typeof init.body === 'string' ? init.body.slice(0, 800) : null, r: r.slice(0, 800) }); }).catch(() => {});
      } catch { /* ignore */ }
      return res;
    };
    return 'hooked';
  },
  lastOp(re = /operation\/(image_to_model|multiview_to_model|rigging_model)/) {
    const n = (window.__tNet || []).filter((x) => re.test(x.u)).pop(); if (!n) return null;
    let d = null; try { d = JSON.parse(n.r); d = d.data || d; } catch { /* ignore */ }
    return { u: n.u, s: n.s, pid: d && d.project_id, op: d && d.operator_id, code: d && d.code, t: new Date(n.t).toISOString().slice(11, 19) };
  },
  selfTest() {
    const st = this.gst();
    return { ver: this.ver, request: typeof this.gp().$request, router: !!this.router(), generateStore: !!st, rigStore: !!this.store('feature-workspace-rigging'),
      saveMode: this.saveMode(), saveQueue: this.saveQueue().map((x) => x.file), ...this.where() };
  },
};
window.__t.hookNet();
