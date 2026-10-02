/* global window, document, setTimeout, localStorage, sessionStorage, MouseEvent, Blob, URL, createImageBitmap */
// 精简版驱动（批量循环用）。用法：一次性 localStorage.setItem('claudeG', <本文件内容>)、localStorage.setItem('claudeGemPrompts', <{id: 提示词} JSON>)；
// 之后每张图：整页打开 https://gemini.google.com/images → eval(localStorage.getItem('claudeG')); await __g.submit(JSON.parse(localStorage.getItem('claudeGemPrompts'))[id])
// → await __g.waitGen()（返回生成图在页面上的 CSS 坐标，下载必须用真实鼠标：先 hover 图片中心，再点右上角下载按钮，否则会被 Chrome 的多文件下载保护拦截）。
// 2026-10-01 实测：Gemini Apps Activity 关闭时发送后不一定跳到 /app/<会话>，所以以页面出现 model-response 为准。
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
  async prepareNext(template = 'Oil painting') {
    this.patchFetch();
    const q = JSON.parse(localStorage.getItem(this.qk()) || '[]');
    const prompts = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
    if (!q.length) return { ok: false, done: true };
    const id = q[0], P = prompts[id];
    const card = await this.waitFor(() => document.querySelector(`media-gen-template-card[aria-label="${template}"]`), 20000);
    if (!card) return { ok: false, id, why: 'no template' };
    card.click();
    if (!(await this.waitFor(() => this.templateOn(template), 8000))) return { ok: false, id, why: 'template not applied' };
    const ed = document.querySelector('rich-textarea .ql-editor'); ed.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, P); await this.sleep(200);
    if (ed.innerText.trim().length < P.length * 0.9) return { ok: false, id, why: 'prompt not set' };
    ed.focus(); const sel = window.getSelection(); sel.selectAllChildren(ed); sel.collapseToEnd();  // 光标移到末尾，回车才会发送
    return { ok: true, id, left: q.length };
  },
  async markSent(id, ms = 20000) {
    const sent = await this.waitFor(() => document.querySelector('user-query, model-response') || (document.querySelector('rich-textarea .ql-editor')?.innerText || '').trim().length < 10, ms);
    if (!sent) return { ok: false, id, why: 'not sent' };
    const q = JSON.parse(localStorage.getItem(this.qk()) || '[]');
    if (q[0] === id) { localStorage.setItem(this.qk(), JSON.stringify(q.slice(1))); }
    localStorage.setItem(this.ck(), id); window.__gT = Date.now();
    return { ok: true, id, left: q.length - 1 };
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
};
