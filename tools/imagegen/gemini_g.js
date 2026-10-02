/* global window, document, setTimeout, localStorage, sessionStorage, MouseEvent, Blob, URL, createImageBitmap */
// 精简版驱动（批量循环用）。用法：一次性 localStorage.setItem('claudeG', <本文件内容>)、localStorage.setItem('claudeGemPrompts', <{id: 提示词} JSON>)；
// 之后每张图（2026-10-02 起，见 README「/images 页面提交是坏的」）：整页打开 https://gemini.google.com/app → eval(localStorage.getItem('claudeG'));
// await __g.prepareNext()（开 Create image、套模板 / 传参考图、填提示词）→ await __g.send()（可见时 JS 点发送、等 user-query、出队）
// → await __g.waitGen() → __g.saveFull(id)。
// 2026-10-01 实测：Gemini Apps Activity 关闭时发送后不一定跳到 /app/<会话>，所以以页面出现 model-response 为准。
// 2026-10-02：每条可带选项 localStorage.claudeGemOpts = {id: {template, refs}}——template 缺省 'Oil painting'，'' 表示不套模板
// （立绘、秘籍改图）；refs 是发送前要上传的参考图（仓库相对路径），事先用 stage() 存进本页 IndexedDB，prepareNext 里由 uploadRef() 挂上。
window.__g = {
  // 分道：同时开两个标签页（各在一个可见窗口里）时，每个标签页在 sessionStorage.claudeLane 写自己的道名（A / B），
  // 队列与当前 ID 用带道名后缀的键（claudeGemQueueA、claudeGemCurrentA…），提示词表共用。不设道名时沿用旧键。
  lane() { try { return sessionStorage.getItem('claudeLane') || ''; } catch { return ''; } },
  qk() { return 'claudeGemQueue' + this.lane(); },
  ck() { return 'claudeGemCurrent' + this.lane(); },
  head() { return JSON.parse(localStorage.getItem(this.qk()) || '[]')[0]; },
  cur() { return localStorage.getItem(this.ck()); },
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  async waitFor(fn, ms = 15000, step = 200) { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await this.sleep(step); } return null; },
  vis: (e) => !!e && e.getClientRects().length > 0,
  btn(l) { return [...document.querySelectorAll('button[aria-label]')].find((b) => b.getAttribute('aria-label') === l && this.vis(b)); },
  ph: () => document.querySelector('rich-textarea .ql-editor')?.getAttribute('data-placeholder') || '',
  // 2026-10-01 新版前端：模板生效时输入框上方出现「close <模板名>」按钮；旧版靠占位文字含 photo 判断，两者任一即可
  templateOn(t = 'Oil painting') { return !!document.querySelector(`button[aria-label="close ${t}"]`) || /photo/i.test(this.ph()); },
  genImg: () => [...document.querySelectorAll('model-response img.image.loaded')].pop(),
  async submit(P, template = 'Oil painting') {
    if (!P) return { ok: false, why: 'no prompt' };
    const card = await this.waitFor(() => document.querySelector(`media-gen-template-card[aria-label="${template}"]`), 20000);
    if (!card) return { ok: false, why: 'no template' };
    card.click();
    if (!(await this.waitFor(() => this.templateOn(template), 8000))) return { ok: false, why: 'template not applied' };
    const ed = document.querySelector('rich-textarea .ql-editor'); ed.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, P); await this.sleep(200);
    if (ed.innerText.trim().length < P.length * 0.9) return { ok: false, why: 'prompt not set' };
    const b = await this.waitFor(() => { const x = this.btn('Send message'); return x && !x.disabled && x.getAttribute('aria-disabled') !== 'true' ? x : null; }, 10000);
    if (!b) return { ok: false, why: 'send disabled' };
    b.click(); window.__gT = Date.now();
    const started = await this.waitFor(() => document.querySelector('model-response, user-query'), 20000);
    return { ok: !!started };
  },
  async waitGen(ms = 38000) {
    const img = await this.waitFor(() => this.genImg(), ms, 500);
    if (!img) {
      const txt = [...document.querySelectorAll('model-response')].map((m) => (m.innerText || '').trim()).join(' ').slice(-200);
      return { ok: false, pending: true, secs: Math.round((Date.now() - (window.__gT || Date.now())) / 1000), txt };
    }
    img.scrollIntoView({ block: 'center' }); await this.sleep(400);
    const r = img.getBoundingClientRect();
    return { ok: true, iw: window.innerWidth, secs: Math.round((Date.now() - (window.__gT || Date.now())) / 1000),
             center: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)], topRight: [Math.round(r.right), Math.round(r.top)] };
  },
  // 2026-10-01 新版前端点「Download full size image」后只取回原图、不再交给 Chrome 下载：
  // 截获它取原图的请求（=s0-d），由脚本用 <a download="gemini__<id>.jpeg"> 自己存盘（文件名即物品 ID，入库不会错配）。
  // 只认 =s0-d：预览图（rd-gg-dl …=s1024-rj）加载失败重试时也会走 fetch，曾被误存成 1024 的"原图"；存盘前再核一次宽度。
  patchFetch() {
    if (window.__fetchPatched) return;
    const of = window.fetch;
    window.fetch = async function (...args) {
      const res = await of.apply(this, args);
      try { const u = (args[0] && args[0].url) || String(args[0]); if (/=s0-d/.test(u)) { res.clone().blob().then((b) => { if (b.size > 100000) { window.__fullBlob = b; } }); } } catch { /* ignore */ }
      return res;
    };
    window.__fetchPatched = true;
  },
  async saveFull(id, ms = 25000) {
    window.__fullBlob = null;
    const b = [...document.querySelectorAll('button[aria-label="Download full size image"]')].find((x) => x.getBoundingClientRect().width > 0)
      || [...document.querySelectorAll('button[aria-label="Download full size image"]')].pop();
    if (!b) return { ok: false, id, why: 'no download button' };
    b.click();
    const t0 = Date.now(); let blob = null, w = 0, h = 0;
    while (Date.now() - t0 < ms) {
      blob = await this.waitFor(() => window.__fullBlob, ms - (Date.now() - t0), 300);
      if (!blob) break;
      try { const bm = await createImageBitmap(blob); w = bm.width; h = bm.height; bm.close(); } catch { w = 0; }
      if (Math.max(w, h) >= 1000) break;  // 只截 =s0-d，到这里就是原图；Gemini 偶尔本身只出 1024，照收（入库时 manifest 记 source_size）；竖幅立绘按长边判断（AR-30）
      window.__fullBlob = null; blob = null;  // 解码失败或尺寸异常，接着等
    }
    if (!blob) return { ok: false, id, why: 'full-size not captured', w };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' })); a.download = `gemini__${id}.jpeg`;
    document.body.appendChild(a); a.click(); a.remove();
    await this.sleep(1500);
    return { ok: true, id, size: blob.size, w, h };
  },
  // 队列：localStorage.claudeGemQueue = [id…]、claudeGemPrompts = {id: 提示词}；submitNext 取队首提交，finish 等图并下载，返回当前 id
  async submitNext() {
    const q = JSON.parse(localStorage.getItem(this.qk()) || '[]');
    const prompts = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
    if (!q.length) return { ok: false, done: true };
    const id = q[0];
    this.patchFetch();
    const r = await this.submit(prompts[id]);
    if (r.ok) { localStorage.setItem(this.ck(), id); localStorage.setItem(this.qk(), JSON.stringify(q.slice(1))); }
    return { ...r, id, left: q.length - (r.ok ? 1 : 0) };
  },
  // 2026-10-01：JS 点发送约两成不生效；改为 prepareNext 填好提示词并聚焦输入框，由 computer 工具按真实回车发送，再 markSent 确认并出队
  // （10-02 查明点不动是标签页不可见所致，现在用 send()：可见时 JS 点发送）
  // 2026-10-02：按 claudeGemOpts 决定套不套模板、要不要先上传参考图；template 参数显式给出时优先（'' = 不套）；先确认 Pro、打开 Create image
  opts(id) { const o = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}')[id] || {}; return { template: o.template ?? 'Oil painting', refs: o.refs || [] }; },
  // ── /app 普通对话（2026-10-02）──
  // 作者：「操作的时候要加上Images，要不有可能不生成图片」。/app 新会话默认没开图片工具：点输入框左下「+」（Upload & tools），
  // 在弹出菜单（.cdk-overlay-container）里点「Create image」。打开后输入框上方出现「Images」标记（close Images 按钮），
  // 占位文字变成 Describe your image，模板卡（含 Oil painting）也是这之后才出现；套模板后 Images 标记还在。
  // 菜单项没有 aria-checked（只在右侧打勾），所以以 close Images 按钮为准；已打开就别再点（再点会关掉）。
  // 菜单没有遮罩，Escape 也关不掉，要再点一次「+」（aria-expanded 由 true 变 false）才收起。
  toolsBtn: () => document.querySelector('button[aria-label="Upload & tools"]'),
  closeMenu() { const b = this.toolsBtn(); if (b && b.getAttribute('aria-expanded') === 'true') b.click(); },
  imagesOn() { return !!this.btn('close Images'); },
  async ensureImages(ms = 8000) {
    if (this.imagesOn()) return { ok: true, already: true };
    const b = this.toolsBtn();
    if (!b) return { ok: false, why: 'no tools button' };
    if (b.getAttribute('aria-expanded') !== 'true') b.click();
    const it = await this.waitFor(() => [...document.querySelectorAll('.cdk-overlay-container [role=menuitemcheckbox]')].find((e) => (e.innerText || '').trim() === 'Create image'), 5000);
    if (!it) { this.closeMenu(); return { ok: false, why: 'no Create image item' }; }
    it.click();
    const ok = await this.waitFor(() => this.imagesOn(), ms);
    await this.sleep(200); this.closeMenu();
    return { ok: !!ok };
  },
  // 限流时模式会掉回 Flash-Lite：标签是「Open mode picker, currently Pro」或「… currently Gemini Pro」才算 Pro
  mode: () => document.querySelector('button[aria-label^="Open mode picker"]')?.getAttribute('aria-label') || '',
  isPro() { return /currently (Gemini )?Pro\b/.test(this.mode()); },
  async prepareNext(template) {
    this.patchFetch();
    const q = JSON.parse(localStorage.getItem(this.qk()) || '[]');
    const prompts = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
    if (!q.length) return { ok: false, done: true };
    const id = q[0], P = prompts[id], o = this.opts(id), t = template ?? o.template;
    if (!P) return { ok: false, id, why: 'no prompt' };
    if (!(await this.waitFor(() => document.querySelector('rich-textarea .ql-editor'), 20000))) return { ok: false, id, why: 'no editor' };  // 刚 navigate 完输入框还没渲染
    if (!(await this.waitFor(() => this.isPro(), 8000))) return { ok: false, id, why: 'mode not Pro', mode: this.mode() };
    const im = await this.ensureImages();
    if (!im.ok) return { ok: false, id, why: 'images tool not on', ...im };
    if (t) {
      const card = await this.waitFor(() => document.querySelector(`media-gen-template-card[aria-label="${t}"]`), 20000);
      if (!card) return { ok: false, id, why: 'no template' };
      card.click();
      if (!(await this.waitFor(() => this.templateOn(t), 8000))) return { ok: false, id, why: 'template not applied' };
    } else if (this.templateOn()) return { ok: false, id, why: 'template unexpectedly on' };
    for (const r of o.refs) { const u = await this.uploadRef(r); if (!u.ok) return { ok: false, id, why: 'upload failed', ...u }; }
    if (!this.imagesOn()) return { ok: false, id, why: 'images tool off' };
    const ed = document.querySelector('rich-textarea .ql-editor'); ed.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, P); await this.sleep(200);
    if (ed.innerText.trim().length < P.length * 0.9) return { ok: false, id, why: 'prompt not set' };
    if (o.refs.length) {  // 参考图传完之前发送键是灰的
      const b = await this.waitFor(() => { const x = this.btn('Send message'); return x && !x.disabled && x.getAttribute('aria-disabled') !== 'true' ? x : null; }, 30000);
      if (!b) return { ok: false, id, why: 'send disabled (upload unfinished)' };
    }
    ed.focus(); const sel = window.getSelection(); sel.selectAllChildren(ed); sel.collapseToEnd();  // 光标移到末尾，回车才会发送
    return { ok: true, id, left: q.length, template: t || '', refs: o.refs.length };
  },
  // 2026-10-02 作者：各道合计每分钟最多提交 8 次——任意两次发送至少隔 8 秒，各道共用 localStorage.claudeLastSubmitTs。
  // 单独一次 JS 调用里跑，跑完重新把光标放到末尾，紧接着按真实回车。
  async gate(gap = 8000) {
    const w = gap - (Date.now() - (+localStorage.getItem('claudeLastSubmitTs') || 0));
    if (w > 0) await this.sleep(w);
    const ed = document.querySelector('rich-textarea .ql-editor');
    if (ed) { ed.focus(); const s = window.getSelection(); s.selectAllChildren(ed); s.collapseToEnd(); }
    return Math.max(0, w);
  },
  // 2026-10-02：发送一律在可见标签页里 JS 点「Send message」——后台标签页点了会建出空会话、什么也不出（之前"两成点不动"也是这个原因）。
  // 点之前过 gate()（各道共用 8 秒间隔），点之后等页面出现 user-query、再等会话建立（见 markSent）才算发出，再出队。一次调用最长约 40 秒，在 45 秒上限内。
  async send(id = this.head(), ms = 12000) {
    if (document.visibilityState !== 'visible') return { ok: false, id, why: 'tab hidden' };
    if (id !== this.head()) return { ok: false, id, why: 'not queue head', head: this.head() };
    if (!this.imagesOn()) return { ok: false, id, why: 'images tool off' };
    await this.gate();
    if (document.visibilityState !== 'visible') return { ok: false, id, why: 'tab hidden' };
    const b = await this.waitFor(() => { const x = this.btn('Send message'); return x && !x.disabled && x.getAttribute('aria-disabled') !== 'true' ? x : null; }, 10000);
    if (!b) return { ok: false, id, why: 'send disabled' };
    const n0 = document.querySelectorAll('user-query').length;
    localStorage.setItem('claudeLastSubmitTs', String(Date.now()));
    b.click(); window.__gT = Date.now();
    return this.markSent(id, ms, n0);
  },
  // 只认页面出现新的 user-query：编辑框变空不算（发送失败时编辑框也可能被清空）。
  // 10-02 偶发「回滚」：user-query 出现一两秒后又消失，提示词退回编辑框（模板标记也没了），地址停在 /app——请求被服务端拒了。
  // 所以还要等到地址变成 /app/<会话 id> 或出现 model-response 才算发出（正常约 1.5 秒）；回滚返回 rolled back、不出队，整页重开 /app 重发即可。
  async markSent(id, ms = 12000, n0 = 0) {
    const sent = await this.waitFor(() => document.querySelectorAll('user-query').length > n0, ms);
    if (!sent) return { ok: false, id, why: 'not sent' };
    const conf = await this.waitFor(() => (/^\/app\/[0-9a-z]+/i.test(location.pathname) || document.querySelector('model-response')) ? 'ok'
      : (document.querySelectorAll('user-query').length <= n0 ? 'rolled back' : null), 10000);
    if (conf !== 'ok') return { ok: false, id, why: conf || 'unconfirmed (no conversation after 10 s)' };
    const q = JSON.parse(localStorage.getItem(this.qk()) || '[]');
    if (q[0] === id) { localStorage.setItem(this.qk(), JSON.stringify(q.slice(1))); }
    localStorage.setItem(this.ck(), id); window.__gT = Date.now();
    localStorage.setItem('claudeLastSubmitTs', String(Date.now()));
    return { ok: true, id, left: q.length - 1, userQuery: !!document.querySelector('user-query') };
  },
  async finish(ms = 36000) {
    const id = localStorage.getItem(this.ck());
    const w = await this.waitGen(ms);
    if (!w.ok) {
      const limit = /limit|quota|try again later|上限|稍后再试|can't create|can.t generate/i.test(w.txt || '');
      return { ok: false, id, pending: !limit, limit, txt: w.txt, secs: w.secs };
    }
    const img = this.genImg(); img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const b = await this.waitFor(() => [...document.querySelectorAll('button[aria-label="Download full size image"]')].pop(), 5000);
    if (!b) return { ok: false, id, why: 'no download button' };
    b.click(); await this.sleep(8000);  // 等完整尺寸图下载完再返回，否则跳页会打断下载
    return { ok: true, id, secs: w.secs };
  },
  dlButton() {
    const b = [...document.querySelectorAll('button[aria-label="Download full size image"]')].find((x) => x.getBoundingClientRect().width > 0);
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
  },
  // ── 上传参考图（2026-10-02）──
  // 参考图先暂存进本页 IndexedDB（gemini.google.com 同源共享，换页、刷新都在）：页面里插一个临时 <input type=file aria-label="claude loader">，
  // 用 file_upload 一次塞多张（每次 ≤10 MB），再 await __g.stage() 存好；之后每张图的上传都是纯 JS，不用再调 find / file_upload。
  // 键是文件名（仓库路径的 basename；物品 / 人物 ID 不重名）。
  idb() {
    return new Promise((res, rej) => { const r = indexedDB.open('claudeRefs', 1); r.onupgradeneeded = () => r.result.createObjectStore('files'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  },
  async idbDo(mode, fn) {
    const db = await this.idb();
    return new Promise((res, rej) => { const t = db.transaction('files', mode); const q = fn(t.objectStore('files')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); });
  },
  idbPut(k, v) { return this.idbDo('readwrite', (s) => s.put(v, k)); },
  idbGet(k) { return this.idbDo('readonly', (s) => s.get(k)); },
  idbKeys() { return this.idbDo('readonly', (s) => s.getAllKeys()); },
  async stage(input = document.querySelector('input[aria-label="claude loader"]')) {
    const out = [];
    for (const f of (input && input.files) || []) { await this.idbPut(f.name, f); out.push([f.name, f.size]); }
    return out;
  },
  // 把暂存的一张图挂到输入框：先走页面自己的上传控件（点输入框左下「+」= Upload & tools，菜单打开时才渲染
  // images-files-uploader 里的隐藏 <input type=file>，给它赋 files 再派发 change），不行再对编辑框派发 paste。
  // 挂上后输入框出现「close attachment」按钮；返回时菜单已关。
  async uploadRef(path, ms = 20000) {
    const name = String(path).split('/').pop();
    const f = await this.idbGet(name);
    if (!f) return { ok: false, name, why: 'not staged' };
    const file = new File([f], name, { type: f.type || 'image/png' });
    const dt = new DataTransfer(); dt.items.add(file);
    const before = document.querySelectorAll('button[aria-label="close attachment"]').length;
    let via = 'input';
    const tb = this.toolsBtn();
    if (tb && tb.getAttribute('aria-expanded') !== 'true') tb.click();
    const inp = await this.waitFor(() => document.querySelector('images-files-uploader input[type=file]'), 5000);
    if (inp) { inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); }
    let ok = await this.waitFor(() => document.querySelectorAll('button[aria-label="close attachment"]').length > before, inp ? 8000 : 10);
    const closeMenu = () => { this.closeMenu(); if (document.querySelector('[role=menu]')) { document.querySelector('.cdk-overlay-backdrop')?.click(); document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true })); } };
    closeMenu();
    if (!ok) {
      via = 'paste';
      await this.sleep(300); closeMenu();
      const ed = document.querySelector('rich-textarea .ql-editor'); ed.focus();
      ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      ok = await this.waitFor(() => document.querySelectorAll('button[aria-label="close attachment"]').length > before, ms);
    }
    await this.sleep(200); closeMenu();
    return { ok: !!ok, name, via, size: file.size };
  },
};
