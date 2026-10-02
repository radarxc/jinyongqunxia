# tools/imagegen · 用 Gemini 网页（作者的 Pro 订阅）出图

2026-10-01 起的出图路线（作者：Codex 额度没了；Gemini API 生图无免费层；改用订阅网页版）。作者要求：不上传参考图、选 Oil painting 模板、写实画风与写实人物立绘一致。批量循环约 1 分钟一张，不花 API 费用。

## 批量循环（Claude in Chrome，`gemini_g.js` 的 `__g`）

**一次性装载**（同一浏览器 profile 的 localStorage 一直有效）：

1. `python3 tools/imagegen/make_queue.py --out <草稿目录> --group items --cat weapons` 生成 `claudeGemQueue.json`（待出图 ID）与 `claudeGemPrompts.json`（`gemini_prompt.build_short` 短提示词）。
2. 页面里临时插一个 `<input type=file>`，用 `file_upload` 依次传入 `gemini_g.js` 与这两份 JSON，读成文本后分别存进 `localStorage` 的 `claudeG`、`claudeGemQueue`、`claudeGemPrompts`，最后删掉这个 input。

**每张图一次 `browser_batch`**：

1. 整页打开 `https://gemini.google.com/images`。
2. JS：用 Trusted Types policy `eval` 出 `claudeG`，再 `await __g.prepareNext()`（点 Oil painting 模板、填提示词、光标移到末尾）。
3. 真实按键 `Return` 发送。JS 点「发送」约两成不生效，所以用真实按键。
4. JS：`__g.markSent(队首)`。确认已发送后出队，并记下 `claudeGemCurrent`。返回 `ok:false` 时直接 `throw`，让整个 batch 停下。
5. 等图：分三次调用 `waitGen(28000)`，最多约 84 秒，第三次仍未出图才 `location.reload()`。生成慢时页面会显示 "Adjusting …" 之类的思考文字，这时刷新会丢掉整段会话。
6. JS：`patchFetch()`，再 `waitGen(25000)`。
7. 真实鼠标 hover 到图片上（不 hover，下载按钮不出现）。
8. JS：`saveFull(id)`。它点「Download full size image」，截获 `=s0-d` 原图请求，确认宽度 ≥ 1800 后用 `<a download="gemini__<id>.jpeg">` 存进 `~/Downloads`。文件名就是 ID，入库不会错配。

同一时间在 Bash 里入库上一张，见下一节。

## 入库

```bash
python3 tools/imagegen/ingest.py <asset_id>
```

它会依次：

- 读 `~/Downloads/gemini__<id>.jpeg`；
- 裁掉画框和暗角，按 frontmatter 尺寸缩放，存成 PNG 放到 `output` 路径；角色部件另外抠透明；
- 把原图归档到 `.agents/coord/gemini_originals/`；
- 在 manifest 追加 `status: candidate` 条目（含 `source_size`、`sha256` 等）。

**入库后立刻提交 `assets/default/item`**，否则会挡住工程线的自动合入（cherry-pick 要求工作区干净）。

## 坑

- **单次 JS 调用有 45 秒上限**：等待逻辑都拆成 28 秒以内一段。
- **标签页必须在前台**（`document.visibilityState === 'visible'`）。窗口被最小化、被遮住或切到别的标签页时，页面不接收输入：回车、真实点击、JS 点击都发不出去，也不报错。遇到 `markSent` 连续 `not sent`，先查 visibilityState。
- **预览图会冒充原图**：预览图（`rd-gg-dl …=s1024-rj`）加载失败重试时也走 fetch，曾被误存成 1024 的"原图"。所以 `patchFetch` 只认 `=s0-d`，存盘前还要核一次宽度。偶尔 Gemini 本身只出 1024 的原图，这种照样入库，manifest 的 `source_size` 会写明。
- **发送后停在空白 `/app`**：看 Recents 最新会话。标题不是上一张的才点进去，否则说明没发出去，把 ID 放回队首重发。
- **Trusted Types**：页面禁止直接 `eval`，要先 `trustedTypes.createPolicy` 再 `eval(policy.createScript(code))`。
- **改了 `gemini_g.js` 之后**：要重新传进 `localStorage.claudeG`。已打过补丁的页面要整页刷新，`patchFetch` 才会用新代码。
- **每日上限**：订阅有每日生图上限，触顶时回复里会有 limit / quota 之类字样，次日继续。作者要求触顶时告诉他。
