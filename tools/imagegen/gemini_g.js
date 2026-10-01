// 精简版驱动（每次整页打开 https://gemini.google.com/images 后注入；与 gemini_driver.js 同口径，供批量循环用）
window.__g = {
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  async waitFor(fn, ms = 15000, step = 200) { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await this.sleep(step); } return null; },
  vis: (e) => !!e && e.getClientRects().length > 0,
  btn(l) { return [...document.querySelectorAll('button[aria-label]')].find((b) => b.getAttribute('aria-label') === l && this.vis(b)); },
  ph: () => document.querySelector('rich-textarea .ql-editor')?.getAttribute('data-placeholder') || '',
  genImg: () => [...document.querySelectorAll('model-response img.image.loaded')].pop(),
  async submit(P) {
    const card = await this.waitFor(() => document.querySelector('media-gen-template-card[aria-label="Oil painting"]'), 20000);
    if (!card) return { ok: false, why: 'no template' };
    card.click();
    if (!(await this.waitFor(() => /photo/i.test(this.ph()), 6000))) return { ok: false, why: 'template not applied' };
    const ed = document.querySelector('rich-textarea .ql-editor'); ed.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, P); await this.sleep(200);
    if (ed.innerText.trim().length < P.length * 0.9) return { ok: false, why: 'prompt not set' };
    const b = await this.waitFor(() => { const x = this.btn('Send message'); return x && !x.disabled && x.getAttribute('aria-disabled') !== 'true' ? x : null; }, 10000);
    if (!b) return { ok: false, why: 'send disabled' };
    b.click(); window.__gT = Date.now();
    const ok = await this.waitFor(() => location.pathname.startsWith('/app/') && location.pathname.length > 6, 30000);
    return { ok: !!ok };
  },
  async waitGen(ms = 38000) {
    const img = await this.waitFor(() => this.genImg(), ms, 500);
    if (!img) return { ok: false, pending: true, secs: Math.round((Date.now() - (window.__gT || Date.now())) / 1000) };
    img.scrollIntoView({ block: 'center' }); await this.sleep(400);
    const r = img.getBoundingClientRect(); const k = window.__gK || 1;
    return { ok: true, title: document.title, secs: Math.round((Date.now() - (window.__gT || Date.now())) / 1000),
             hover: [Math.round((r.left + r.width / 2) * k), Math.round((r.top + r.height / 2) * k)],
             dl: [Math.round((r.right - 55 / 1) * k), Math.round((Math.max(r.top, 0) + 56) * k)] };
  },
};
