// 注入 gemini.google.com 页面的出图驱动（用 Claude in Chrome 的 javascript_tool 执行；页面是单页应用，站内跳转不丢状态，整页刷新后要重新注入）。
// 作者 2026-10-01：不上传参考图，选「Oil painting」模板；画风要写实、和角色立绘一致。实测出图约 20 秒。
// javascript_tool 单次调用上限 45 秒（CDP 超时），所以分两次调用：
//   await __gem.submit(prompt, { template: 'Oil painting', aspect: '1:1' })   // 新建 → 选模板（模板列表延迟加载，最多等 20 秒）→ 比例 → 提示词 → 发送
//   await __gem.waitImage(35000)                                              // → { ok, w, h, title }；没出来就再调一次
//   await __gem.download()                                                    // 点「Download full size image」，文件进 ~/Downloads（需作者同意）
//
// 页面控件标识（2026-10-01 实测）：侧栏 a[href="/images"]（取可见的那个）、模板卡 media-gen-template-card[aria-label=…]、
// 按钮 aria-label：Upload & tools / Aspect ratio, 1:1 / Send message / Download full size image（data-test-id=download-generated-image-button）；
// 输入框 rich-textarea .ql-editor（用 execCommand insertText 写入）；生成图 img.image.loaded（页面版 1024×1024）。
window.__gem = (() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const visible = (e) => !!e && e.getClientRects().length > 0;  // position:fixed 的元素 offsetParent 为 null，不能用它判可见
  const byLabel = (l) => $$('button[aria-label]').find((b) => b.getAttribute('aria-label') === l && visible(b));
  const byLabelPrefix = (p) => $$('button[aria-label]').find((b) => (b.getAttribute('aria-label') || '').startsWith(p) && visible(b));
  async function waitFor(fn, ms = 15000, step = 200) {
    const t = Date.now();
    while (Date.now() - t < ms) { const v = fn(); if (v) return v; await sleep(step); }
    return null;
  }
  async function newImageChat() {
    const link = $$('a[href="/images"]').find(visible);
    if (!link) return { ok: false, why: 'no visible images link' };
    link.click();
    const ok = await waitFor(() => location.pathname === '/images' && $('rich-textarea .ql-editor') && $$('img.image.loaded').length === 0, 15000);
    return { ok: !!ok };
  }
  async function pickTemplate(name) {
    if (!name) return { ok: true, skipped: true };
    if (byLabel('close ' + name)) return { ok: true, already: true };
    const card = await waitFor(() => $(`media-gen-template-card[aria-label="${name}"]`), 20000);
    if (!card) return { ok: false, why: 'no template ' + name };
    card.click();
    const ok = await waitFor(() => byLabel('close ' + name), 5000);
    return { ok: !!ok };
  }
  async function setAspect(r = '1:1') {
    const b = byLabelPrefix('Aspect ratio');
    if (!b) return { ok: false, why: 'no aspect button' };
    if ((b.getAttribute('aria-label') || '').endsWith(r)) return { ok: true, already: true };
    b.click();
    const opt = await waitFor(() => $$('button, [role=menuitem], [role=option], [role=menuitemradio]').find((e) => (e.innerText || '').trim() === r && visible(e)), 5000);
    if (!opt) return { ok: false, why: 'no option ' + r };
    opt.click();
    await sleep(300);
    return { ok: (byLabelPrefix('Aspect ratio').getAttribute('aria-label') || '').endsWith(r) };
  }
  async function setPrompt(text) {
    const ed = $('rich-textarea .ql-editor');
    if (!ed) return { ok: false, why: 'no editor' };
    ed.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    await sleep(200);
    return { ok: ed.innerText.trim().length >= text.trim().length * 0.9, len: ed.innerText.trim().length };
  }
  async function send() {
    window.__gemBefore = $$('img.image.loaded').length;
    const b = await waitFor(() => { const x = byLabel('Send message'); return x && !x.disabled && x.getAttribute('aria-disabled') !== 'true' ? x : null; }, 10000);
    if (!b) return { ok: false, why: 'send disabled' };
    const title0 = document.title;
    b.click();
    // 发送后页面会跳到 /app/<会话>，或标题变成会话名；有时先跳到空的 /app，需要从侧栏最新会话进入
    const started = await waitFor(() => (location.pathname.startsWith('/app/') && location.pathname.length > 6) || document.title !== title0, 20000);
    return { ok: !!started };
  }
  async function waitImage(ms = 45000) {
    const img = await waitFor(() => { const l = $$('img.image.loaded'); return l.length > (window.__gemBefore || 0) ? l[l.length - 1] : null; }, ms, 500);
    if (!img) return { ok: false, pending: true, tail: $$('message-content').map((e) => e.innerText).join(' ').slice(-300) };
    return { ok: true, w: img.naturalWidth, h: img.naturalHeight, title: document.title };
  }
  async function submit(prompt, { template = 'Oil painting', aspect = '1:1' } = {}) {
    const steps = {};
    steps.nav = await newImageChat(); if (!steps.nav.ok) return { ok: false, steps };
    steps.template = await pickTemplate(template); if (!steps.template.ok) return { ok: false, steps };
    steps.aspect = await setAspect(aspect); if (!steps.aspect.ok) return { ok: false, steps };
    steps.prompt = await setPrompt(prompt); if (!steps.prompt.ok) return { ok: false, steps };
    steps.send = await send();
    return { ok: steps.send.ok, steps };
  }
  async function openLatestChat() {
    const a = $$('a[href^="/app/"]').find(visible);
    if (!a) return { ok: false };
    a.click();
    const img = await waitFor(() => $$('img.image.loaded').pop(), 25000, 500);
    return { ok: !!img, title: document.title };
  }
  async function runOne(prompt, { template = 'Oil painting', aspect = '1:1', waitMs = 20000 } = {}) {  // 只在出图很快时用；一般用 submit + waitImage
    const t0 = Date.now();
    const steps = {};
    steps.nav = await newImageChat(); if (!steps.nav.ok) return { ok: false, steps };
    steps.template = await pickTemplate(template); if (!steps.template.ok) return { ok: false, steps };
    steps.aspect = await setAspect(aspect); if (!steps.aspect.ok) return { ok: false, steps };
    steps.prompt = await setPrompt(prompt); if (!steps.prompt.ok) return { ok: false, steps };
    steps.send = await send(); if (!steps.send.ok) return { ok: false, steps };
    const img = await waitImage(waitMs);
    return { ...img, seconds: Math.round((Date.now() - t0) / 1000) };
  }
  async function download() {
    const img = $$('img.image.loaded').pop();
    if (!img) return { ok: false, why: 'no image' };
    img.scrollIntoView({ block: 'center' });
    img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    const b = await waitFor(() => $$('[data-test-id="download-generated-image-button"], button[aria-label="Download full size image"]').filter(visible).pop()
      || $$('[data-test-id="download-generated-image-button"], button[aria-label="Download full size image"]').pop(), 5000);
    if (!b) return { ok: false, why: 'no download button' };
    b.click();
    return { ok: true, at: Date.now() };
  }
  return { newImageChat, pickTemplate, setAspect, setPrompt, send, submit, waitImage, openLatestChat, runOne, download, sleep, waitFor };
})();
'gemini driver ready';
