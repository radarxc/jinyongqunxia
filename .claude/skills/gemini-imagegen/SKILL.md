---
name: gemini-imagegen
description: 用作者订阅的 Gemini 网页批量出物品图（兵器、暗器、药材、秘籍、食品、衣物等）并入库提交。浏览器走 Claude in Chrome 扩展，驱动是 tools/imagegen/gemini_g.js 的 window.__g。也覆盖给秘籍上传原图补书名、处理 Gemini 限流与出图失败。出物品图、跑 Gemini 出图队列、补秘籍书名时使用。人物立绘不走这里，走 codex exec（AR-31 / AR-32）。
---

# Gemini 网页出图（物品）

**范围**：物品图（`assets/default/item/**`）和秘籍补书名。人物立绘、路人、情景图一律用 `codex exec` 出（AR-31 / AR-32），不要用 Gemini 出人物。

**依据**：
- 驱动源码 `tools/imagegen/gemini_g.js` 是唯一版本，页面里是 `window.__g`；
- 现象、原因和踩坑记录在 `tools/imagegen/README.md`；
- 本文是操作手册，与上面两者冲突时，以它们为准。

**当前进度**：见仓库根目录 `TODO.md` §2.2。

## 0. 规矩

- **标签页**：
  - 只操作 Chrome「Claude」标签组里的 Gemini 标签页，组外的一律不碰。
  - 新标签页要作者先拖进这个组，扩展才看得到。tabId 每次用 `tabs_context_mcp` 查；10-02 那次是 A = 1957634955、B = 1957634979。
- **账号与设置**：不输入密码，不改 Gemini 账号设置和浏览器设置。Gemini 由作者登录；弹出权限或下载确认时，请作者点。
- **只有前台可见的标签页能出图**（见 §5）。作者通常把一个窗口分屏成两格，每格放一个标签页。
- **节奏**：
  - 任意两次提交至少隔 8 秒。这是硬下限，作者定的上限是各道合计每分钟 ≤ 8 次，`send()` 里的 `gate()` 已经做了。
  - 实际按 **30 秒一次**：10-02 实测 8 秒间隔时第二道常被限流回滚。
- **限流**：
  - 先等 2 分钟，再回 https://gemini.google.com/app 。
  - 同一条连续 3 次限流就停，去 https://gemini.google.com/usage 记下重置时间，并**告诉作者**（作者要求触顶时报告）。
- **调用时长**：
  - 单次 JS 调用 ≤ 45 秒，等待要拆成每段 ≤ 28 秒；
  - subagent 的单次工具调用 ≤ 5 分钟，看门狗 600 秒会杀掉 agent。
- **入库位置**：在集成分支工作区 `.agents/wt/_prod` 里做；每张图入库后立刻按路径提交，不 push。
- **工具加载**：Chrome 工具要先用一次 ToolSearch 全部载入：
  `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__find,mcp__claude-in-chrome__file_upload,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch`

## 1. 生成队列（Bash，在 `_prod` 根目录）

```bash
python3 tools/agents/build_image_index.py                 # 重建 INDEX，看还剩哪些没出
python3 tools/imagegen/make_queue.py --out .agents/coord/gemini_q --group items --cat manuals weapons
python3 tools/imagegen/make_queue.py --out .agents/coord/gemini_q --ids eq_a it_b   # 指定 ID，用于返工
```

产出两份文件：
- `claudeGemQueue.json`：待出图的 ID 列表；
- `claudeGemPrompts.json`：`{id: 短提示词}`，由 `gemini_prompt.build_short` 生成。秘籍的提示词已经要求在题签上写书名。

两道并跑时把队列拆成两份：

```bash
python3 -c "import json;d='.agents/coord/gemini_q/';q=json.load(open(d+'claudeGemQueue.json'));json.dump(q[0::2],open(d+'claudeGemQueueA.json','w'));json.dump(q[1::2],open(d+'claudeGemQueueB.json','w'));print(len(q))"
```

## 2. 一次性装载（每个标签页做一次）

localStorage 在 gemini.google.com 同源共享，刷新后还在；sessionStorage 每个标签页各自一份。

**2.1 设道名**：队列键和当前 ID 键都带这个后缀。
```js
sessionStorage.setItem('claudeLane', 'A'); location.href
```

**2.2 插一个临时文件框**：
```js
(() => { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; i.setAttribute('aria-label', 'claude loader'); i.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647'; document.body.appendChild(i); return 'ok'; })()
```

**2.3 上传文件**：用 `find` 查「claude loader」拿到 ref，再用 `file_upload` 传文件。要求：
- paths 用绝对路径，传三份：`tools/imagegen/gemini_g.js`、本道的 `claudeGemQueueA.json`（或 B）、`claudeGemPrompts.json`；
- 单次合计 < 10 MB。

**2.4 读进 localStorage**：
```js
const inp = document.querySelector('input[aria-label="claude loader"]');
const files = Object.fromEntries(await Promise.all([...inp.files].map(async (f) => [f.name, await f.text()])));
const lane = sessionStorage.getItem('claudeLane') || '';
if (files['gemini_g.js']) localStorage.setItem('claudeG', files['gemini_g.js']);
const qn = Object.keys(files).find((n) => n.startsWith('claudeGemQueue'));
if (qn) localStorage.setItem('claudeGemQueue' + lane, files[qn]);
if (files['claudeGemPrompts.json']) {  // 合并，别整份覆盖：另一道还在用
  const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
  Object.assign(P, JSON.parse(files['claudeGemPrompts.json']));
  localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
}
inp.remove();
({ lane, queue: JSON.parse(localStorage.getItem('claudeGemQueue' + lane) || '[]').length, prompts: Object.keys(JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}')).length })
```

改了 `gemini_g.js` 之后：
- 只需重传这一个文件。各道共用这份代码，改动要向后兼容。
- 已经打过 fetch 补丁的页面要整页刷新，`patchFetch` 才会用上新代码。

## 3. 每张图

两道交替的顺序：提交 A → 提交 B → 等图、存 A → 等图、存 B → 入库。3.1–3.4 可以放进一次 `browser_batch`。

**3.1 开新对话**：用 `navigate` 打开 `https://gemini.google.com/app`。
- 每张图都开一个新对话。
- `/images` 页面提交是坏的，会建出空会话，不要用。

**3.2 载入驱动并过闸门**（单独一次 JS 调用）：
```js
window.__claudeTT ??= trustedTypes.createPolicy('cl' + Date.now(), { createScript: (s) => s });  // 页面禁止直接 eval
eval(window.__claudeTT.createScript(localStorage.getItem('claudeG')));
({ vis: document.visibilityState, lane: __g.lane(), head: __g.head(), waited: await __g.gate(30000) })
```
`vis` 不是 `visible` 就停在这里，见 §5。

**3.3 准备**（单独一次 JS 调用）：
```js
const r = await __g.prepareNext(); if (!r.ok) throw new Error(JSON.stringify(r)); r
```
- 它会依次做这些事：
  1. 确认模式是 Pro；
  2. 打开 Create image，输入框上方出现「Images」标记；
  3. 按 `claudeGemOpts` 套模板（默认 Oil painting）或上传参考图；
  4. 填入提示词。
- **`ok:false` 必须 throw**，让整个 batch 停下，否则编辑框是空的，后面会接着发。
- 常见的 `why`：
  - `mode not Pro`、`no template`：按限流处理；
  - `no editor`：页面没载完，重开 /app。

**3.4 发送**：
```js
await __g.send()
```
- 只有 `ok:true` 才算发出并出队。
- `rolled back`：被限流回滚了。整页重开 /app，重发同一条。
- `tab hidden`：标签页不可见。

**3.5 等图**：可以调用多次，每次 ≤ 28 秒。
```js
await __g.waitGen(28000)
```
- 返回 `ok:true` 就去存图；`pending:true` 就接着等。
- 页面上还有「Stop response」时**绝不刷新**，否则会话会丢。
- 卡在 Finalizing… 超过 5 分钟：
  1. 把会话地址追加进 `localStorage.claudeGemStuck`；
  2. 把这条放回队尾（代码见 §6）；
  3. 重开 /app。
- 只回了文字、没出图：在新对话里重发。带参考图时比较常见。

**3.6 存原图**：存图不算提交，后台标签页也能做。
```js
const id = __g.cur(); await __g.waitGen(3000);  // 先把图滚到中间
const img = __g.genImg(); for (const t of ['pointerover', 'mouseover', 'mousemove']) img?.dispatchEvent(new MouseEvent(t, { bubbles: true }));
let s = await __g.saveFull(id); if (!s.ok) { await __g.sleep(800); s = await __g.saveFull(id); } s
```
- 原图存到 `~/Downloads/gemini__<id>.jpeg`。
- 长边应 ≥ 1000。偶尔 Gemini 本身只出 1024，照收，manifest 会记 `source_size`。

**3.7 质检**（Bash，在 `_prod` 根目录）。输出写到 `$GEM_QA_DIR`，默认是 `.agents/coord/gemini_qa`，联系表用 Read 看。
```bash
python3 .claude/skills/gemini-imagegen/scripts/fqa.py <id…>                         # 联系表、背景偏差、贴边检测
python3 .claude/skills/gemini-imagegen/scripts/mqa.py crop <id> 0.05 0.05 0.5 0.7   # 放大局部，逐字核对秘籍书名
python3 .claude/skills/gemini-imagegen/scripts/mqa.py reject <id>                   # 不合格：把下载挪进 rejected/
```

物品合格标准：
- 单件物品，完整，不碰画面边缘；
- 浅暖灰底，约 RGB 230,225,216，偏差 > 20 的重出；
- 没有人手、人物；
- 除秘籍书名外没有任何文字，书名必须是简体，不带书名号；
- 提示词没要求就不画木匣、礼盒；
- 年代形制大致符合提示词。

不合格时：
1. 在 `claudeGemPrompts[id]` 末尾追加补救句，见 README「常见画面问题与补救句」；
2. 把 ID 放回队尾；
3. 每张最多重做 3 次，还不行就记进返工清单，交给协调者。

**3.8 入库**（Bash，在 `_prod` 根目录）：
```bash
zsh tools/imagegen/ingest_commit.sh <id> [<id> …]
INGEST_ARGS="--manual-title 打狗棒法" zsh tools/imagegen/ingest_commit.sh it_miji_dagou_can   # 只用于「上传原图改题签」
```
脚本会依次：
1. 裁掉画框、按尺寸缩放成 PNG；
2. 归档原图；
3. 写 manifest（`status: candidate`）；
4. 重建 INDEX；
5. 只按路径提交这张图。

撞上 index.lock 时它会自己重试。

## 4. 上传参考图（秘籍改题签）

用于已入库的秘籍补写书名：以原图为底，只改题签。

1. **暂存**：用 §2.2–2.3 的文件框传入原 PNG，然后：
   ```js
   await __g.stage()   // 存进 IndexedDB「claudeRefs」，键是文件名；await __g.idbKeys() 可以查已存的
   ```
2. **登记选项和提示词**：改图不套模板，否则模板会改掉原图画风。
   ```js
   const id = 'it_miji_xxx', title = '打狗棒法';
   const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
   O[id] = { template: '', refs: [`assets/default/item/manuals/${id}.png`] };
   localStorage.setItem('claudeGemOpts', JSON.stringify(O));
   const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
   P[id] = `这是一本武功秘籍的物品图。请在封面左上方贴一张浅色竖长的纸质题签，只在题签上用端正的楷书竖写书名「${title}」（只写这 ${title.length} 个字，不写引号、书名号或任何符号；用简体字），墨色，字迹清晰、笔画准确；不要添加任何其他文字、印章或标记；书本造型、颜色、光影、构图和背景保持完全不变。`;
   localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
   ```
3. 把 ID 放进本道队列，照 §3 出图。`prepareNext` 会用 `uploadRef()` 挂上参考图，等上传完成、发送键变亮。
4. 入库时用 `INGEST_ARGS="--manual-title <书名>"`。

## 5. 可见标签页

- **为什么**：后台标签页里，JS 点发送会建出空会话，什么也不出；回车、真实点击也一样，而且都不报错。`computer` 的 key / click / screenshot 和 `navigate` 都**不能**把标签页切到前台。
- **怎么做**：
  - 每次提交前先查 `document.visibilityState === 'visible'`，`send()` 里也会查。
  - 两道都不可见时，每 2 分钟用一次简短的 JS 调用查一下，耐心等，不要乱试；需要的话请作者把窗口摆到前台。
  - 后台标签页的定时器会被节流，不要在隐藏标签页里跑长轮询。

## 6. 常用小片段

```js
// 看本道状态
({ lane: __g.lane(), left: JSON.parse(localStorage.getItem(__g.qk()) || '[]').length, head: __g.head(), cur: __g.cur(), pro: __g.isPro(), images: __g.imagesOn() })
```
```js
// 返工：追加补救句，并把 ID 放回本道队尾
const id = 'it_xxx', add = '整幅背景只有均匀平涂的浅暖灰，主体之外不要任何远景、虚影或重复的物体。';
const P = JSON.parse(localStorage.getItem('claudeGemPrompts')); P[id] = (P[id] || '') + add; localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
const q = JSON.parse(localStorage.getItem(__g.qk()) || '[]'); if (!q.includes(id)) q.push(id); localStorage.setItem(__g.qk(), JSON.stringify(q)); q.length
```

## 7. `__g` 接口速查

| 方法 | 作用 |
|---|---|
| `lane()` / `qk()` / `ck()` | 道名，本道队列键、当前 ID 键 |
| `head()` / `cur()` | 队首 ID；最近一次发出的 ID |
| `gate(ms)` | 距上次提交不足 ms 就等着（各道共用 `claudeLastSubmitTs`），然后把光标放回编辑框 |
| `prepareNext(template?)` | 确认 Pro → 打开 Create image → 套模板或上传参考图 → 填提示词 |
| `send()` | 查可见、过 8 秒闸门、点发送，`markSent` 确认会话建立后出队 |
| `waitGen(ms)` | 等生成图出现，返回耗时和图片中心坐标 |
| `saveFull(id)` | 截获 `=s0-d` 原图，存成 `gemini__<id>.jpeg` |
| `stage()` / `idbKeys()` / `uploadRef(path)` | 参考图暂存进 IndexedDB、查已存的、挂到输入框 |
| `mode()` / `isPro()` / `imagesOn()` / `ensureImages()` | 查模式、查和打开 Create image |
| `submitNext()` / `finish()` | 旧接口（/images 时期），不要再用 |
