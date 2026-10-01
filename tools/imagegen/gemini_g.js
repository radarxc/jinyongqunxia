/* global window, document, setTimeout, localStorage, MouseEvent, Blob, URL */
// 精简版驱动（批量循环用）。用法：一次性 localStorage.setItem('claudeG', <本文件内容>)、localStorage.setItem('claudeGemPrompts', <{id: 提示词} JSON>)；
// 之后每张图：整页打开 https://gemini.google.com/images → eval(localStorage.getItem('claudeG')); await __g.submit(JSON.parse(localStorage.getItem('claudeGemPrompts'))[id])
// → await __g.waitGen()（返回生成图在页面上的 CSS 坐标，下载必须用真实鼠标：先 hover 图片中心，再点右上角下载按钮，否则会被 Chrome 的多文件下载保护拦截）。
// 2026-10-01 实测：Gemini Apps Activity 关闭时发送后不一定跳到 /app/<会话>，所以以页面出现 model-response 为准。
window.__g = {
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  async waitFor(fn, ms = 15000, step = 200) { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await this.sleep(step); } return null; },
  vis: (e) => !!e && e.getClientRects().length > 0,
  btn(l) { return [...document.querySelectorAll('button[aria-label]')].find((b) => b.getAttribute('aria-label') === l && this.vis(b)); },
  ph: () => document.querySelector('rich-textarea .ql-editor')?.getAttribute('data-placeholder') || '',
  genImg: () => [...document.querySelectorAll('model-response img.image.loaded')].pop(),
  async submit(P, template = 'Oil painting') {
    if (!P) return { ok: false, why: 'no prompt' };
    const card = await this.waitFor(() => document.querySelector(`media-gen-template-card[aria-label="${template}"]`), 20000);
    if (!card) return { ok: false, why: 'no template' };
    card.click();
    if (!(await this.waitFor(() => /photo/i.test(this.ph()), 6000))) return { ok: false, why: 'template not applied' };
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
  // 截获它取原图的请求（=s0-d / rd-gg），由脚本用 <a download="gemini__<id>.jpeg"> 自己存盘（文件名即物品 ID，入库不会错配）。
  patchFetch() {
    if (window.__fetchPatched) return;
    const of = window.fetch;
    window.fetch = async function (...args) {
      const res = await of.apply(this, args);
      try { const u = (args[0] && args[0].url) || String(args[0]); if (/=s0-d|rd-gg/.test(u)) { res.clone().blob().then((b) => { if (b.size > 100000) { window.__fullBlob = b; } }); } } catch { /* ignore */ }
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
    const blob = await this.waitFor(() => window.__fullBlob, ms, 300);
    if (!blob) return { ok: false, id, why: 'full-size not captured' };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' })); a.download = `gemini__${id}.jpeg`;
    document.body.appendChild(a); a.click(); a.remove();
    await this.sleep(1500);
    return { ok: true, id, size: blob.size };
  },
  // 队列：localStorage.claudeGemQueue = [id…]、claudeGemPrompts = {id: 提示词}；submitNext 取队首提交，finish 等图并下载，返回当前 id
  async submitNext() {
    const q = JSON.parse(localStorage.getItem('claudeGemQueue') || '[]');
    const prompts = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
    if (!q.length) return { ok: false, done: true };
    const id = q[0];
    this.patchFetch();
    const r = await this.submit(prompts[id]);
    if (r.ok) { localStorage.setItem('claudeGemCurrent', id); localStorage.setItem('claudeGemQueue', JSON.stringify(q.slice(1))); }
    return { ...r, id, left: q.length - (r.ok ? 1 : 0) };
  },
  async finish(ms = 36000) {
    const id = localStorage.getItem('claudeGemCurrent');
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
