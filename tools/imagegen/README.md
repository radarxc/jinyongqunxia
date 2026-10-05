# tools/imagegen · 用 Gemini 网页（作者的 Pro 订阅）出图

2026-10-01 起的出图路线（作者：Codex 额度没了；Gemini API 生图无免费层；改用订阅网页版）。物品图：选 Oil painting 模板、不上传参考图、写实画风与写实人物立绘一致。10-02 起（AR-29 / AR-30）两类图要上传图片：秘籍补书名上传原图改图，立绘上传身份 / 画风参考（见「上传参考图出图」）。批量循环约 1 分钟一张，不花 API 费用。

## 批量循环（Claude in Chrome，`gemini_g.js` 的 `__g`）

**一次性装载**（同一浏览器 profile 的 localStorage 一直有效）：

1. `python3 tools/imagegen/make_queue.py --out <草稿目录> --group items --cat food` 生成 `claudeGemQueue.json`（待出图 ID）与 `claudeGemPrompts.json`（`gemini_prompt.build_short` 短提示词）。
2. 页面里临时插一个 `<input type=file multiple aria-label="claude loader">`，用 `file_upload` 传入 `gemini_g.js` 与这两份 JSON，`await f.text()` 读成文本后分别存进 `localStorage` 的 `claudeG`、`claudeGemQueue<道名>`、`claudeGemPrompts`（提示词用 `Object.assign` 合并，别整份覆盖），最后删掉这个 input。
3. 每个标签页在 `sessionStorage.claudeLane` 写自己的道名（A / B…），队列与当前 ID 用带道名后缀的键；提示词表 `claudeGemPrompts`、选项表 `claudeGemOpts`（`{id: {template, refs}}`）各道共用。

**每张图**（标签页必须可见，见下文）：

1. 整页打开 `https://gemini.google.com/app`（新对话）。
2. JS：用 Trusted Types policy `eval` 出 `claudeG`，`await __g.prepareNext()`：确认模式是 Pro、打开 Create image、按 `claudeGemOpts` 套模板（缺省 Oil painting，`''` 不套）或上传参考图、填提示词。返回 `ok:false` 时直接 `throw`，让整个 batch 停下。
3. JS：`await __g.send()`：过 8 秒间隔闸门 `gate()`，可见时 JS 点「Send message」，等页面出现 `user-query` 才算发出，然后出队并记下 `claudeGemCurrent<道名>`。
4. 等图：分几次调用 `waitGen(28000)`。页面还有「Stop response」按钮（还在生成或自我修改）时绝不刷新，否则会话丢失。
5. JS：`saveFull(id)`。它点「Download full size image」，截获 `=s0-d` 原图请求，确认长边 ≥ 1000 后用 `<a download="gemini__<id>.jpeg">` 存进 `~/Downloads`。文件名就是 ID，入库不会错配。返回 `full-size not captured` 时，用真实鼠标 hover 到图片中心（`waitGen` 返回的 `center`，CSS 像素）再调一次。

**间隔**：任意两次提交至少隔 8 秒（硬下限），各道（包括协调者出立绘的标签页）共用 `localStorage.claudeLastSubmitTs`，`send()` 里已经做了。两道并跑时实际按 30 秒间隔（AR-30「全局每分钟最多 2 次」）：提交前单独调一次 `await __g.gate(30000)`，再 `prepareNext` + `send`（分两次调用，免得一次 JS 超 45 秒）。10-02 实测 8 秒间隔时第二道常被限流回滚（见「发送被回滚」），改 30 秒后再没出现。一张图约 40–90 秒，两道交替时提交 A → 提交 B → 等图存 A → 等图存 B → 入库。

同一时间在 Bash 里入库上一张，见下一节。

## 入库

```bash
zsh tools/imagegen/ingest_commit.sh <asset_id> [<asset_id> …]
INGEST_ARGS="--manual-title 打狗棒法" zsh tools/imagegen/ingest_commit.sh it_miji_dagou_can   # 秘籍补书名
```

`ingest_commit.sh` 对每个 ID 跑 `ingest.py`，重建 INDEX（做完一张就从 INDEX 删一张），只按路径提交这张图、它的 manifest 和 INDEX；撞 index.lock 时自己重试。`ingest.py` 会依次：

- 读 `~/Downloads/gemini__<id>.jpeg`；
- 裁掉画框和暗角，按 frontmatter 尺寸缩放，存成 PNG 放到 `output` 路径；角色部件另外抠透明；
- 把原图归档到 `.agents/coord/gemini_originals/`；
- 在 manifest 写 `status: candidate` 条目（同 id 覆盖旧条目，含 `source_size`、`sha256` 等）。`--manual-title` 时如实记改图提示词、工具（上传原图改图、不套模板），`references` 记被改的原图路径与改前 sha256。

画框检测的每条扫描线只统计另一轴已判定内框以内的像素，避免上下与左右白框相互污染行 / 列均值；`it_miji_xingjunbu_can` 曾因左右白框参与横向扫描而误切书底，现由合成图回归覆盖。

**入库后立刻提交**（脚本已做），否则会挡住工程线的自动合入（cherry-pick 要求工作区干净）。

## 可见标签页是硬约束

**做法**：每次提交前查 `document.visibilityState === 'visible'`（`send()` 一进门就查，闸门等完再查一次）。作者把一个窗口分屏成两格，各放一个出图标签页；两个都不可见时每 2 分钟用一次简短的 JS 调用查一次，等着，不要乱试。

**原因**：只有前台可见的标签页能出图。后台标签页里 JS 点发送会建出空会话（Recents 多一条，什么也不出），回车、真实点击也发不出去，且都不报错。computer 工具的 key / screenshot / click 和 navigate 都**不能**把标签页切到前台。10-01「JS 点发送约两成不生效」、`markSent` 连续 `not sent`，查下来都是这个原因。后台标签页的定时器还会被节流，长轮询会撞 45 秒上限。

## /images 页面提交是坏的

**做法**：一律在 `https://gemini.google.com/app` 普通对话里出图，模式 **Pro**（`button[aria-label^="Open mode picker"]` 的标签是「… currently Pro」或「… currently Gemini Pro」，`prepareNext` 会查）。每张图开一个新对话。

**原因**：10-02 起 `/images` 页面提交会建出空会话，什么都不出。`/app` 打开 Create image 之后模板卡（含 Oil painting）照样有，用法和 `/images` 一样。

## 必须打开 Create image

**做法**：填提示词之前，点输入框左下「+」（`button[aria-label="Upload & tools"]`），在弹出菜单（`.cdk-overlay-container`）里点文字为「Create image」的项（`[role=menuitemcheckbox]`）。打开后输入框上方出现「Images」标记（`button[aria-label="close Images"]`），占位文字变成 Describe your image，模板卡这时才出现；套模板后 Images 标记还在，另多一个「close Oil painting」。`prepareNext` 里的 `ensureImages()` 已自动做这一步，发送前 `send()` 再核一次。

- 菜单项没有 `aria-checked`（只在右侧打勾），所以以 close Images 按钮为准；已打开时别再点，再点会关掉。
- 菜单没有遮罩，Escape 也关不掉，要再点一次「+」（`aria-expanded` 由 true 变 false）才收起。
- 页面刚载入时菜单可能还没渲染，`ensureImages` 会等 5 秒。

**原因**：作者原话「操作的时候要加上Images，要不有可能不生成图片」。不开这个工具时，Pro 可能只回文字、不出图。

## 上传参考图出图

用于秘籍补书名（上传原图，只在题签补写书名）和立绘（上传身份 / 画风参考）。

**做法**：

1. **暂存**：参考图先存进本页 IndexedDB（库 `claudeRefs`，gemini.google.com 同源共享，换页、刷新都在）。页面里插一个临时 `<input type=file multiple aria-label="claude loader">`，用 `file_upload` 一次塞多张（每次 ≤ 10 MB），再 `await __g.stage()`，键是文件名（仓库路径的 basename）。`await __g.idbKeys()` 可查已暂存的。
2. **登记**：`claudeGemOpts[id] = {template: '', refs: ['assets/default/item/manuals/<id>.png']}`，提示词照常放 `claudeGemPrompts[id]`。改图类不套模板（`template: ''`），否则模板会改掉原图画风。
3. **上传**：`prepareNext` 里由 `uploadRef()` 挂上：先点「+」让菜单渲染 `images-files-uploader` 里的隐藏 `<input type=file>`，给它赋 `files` 再派发 `change`；不行再对编辑框派发 `paste`。挂上后输入框出现「close attachment」，上传完之前发送键是灰的，`prepareNext` 会等它变亮。
4. **质检**：秘籍放大逐字核对书名（`mqa.py view / crop`），每张最多重做 3 次；入库用 `--manual-title`。

**原因**：每张图都调 find / file_upload 太慢，而且 file_upload 要现找元素 ref；暂存进 IndexedDB 之后，每张图的上传是纯 JS，一次 browser_batch 就能做完。只改题签的图必须以原图为底，重画会丢掉作者已通过的造型。

**坑**：带参考图和 Create image 的请求，Gemini 有时只回一大段文字、不出图（Pro 在内部生成几次，最后只交说明）。遇到就在新对话里重发一次，一般就能出图。

## 发送被回滚（限流）

**现象**：点发送后 `user-query` 闪一下就消失，提示词退回编辑框（模板标记也没了），地址停在 `/app`，页面不报错。截获 `StreamGenerate` 的返回是 HTTP 200，内容里是 gRPC 码 8（RESOURCE_EXHAUSTED）和 `BardErrorInfo [1095]`。这时 usage 页才 17%，所以是短时限流，不是时段额度。

**做法**：`markSent` 只认会话真正建立（地址变成 `/app/<id>` 或出现 `model-response`），回滚时返回 `rolled back`、不出队；整页重开 `/app` 重发同一条即可。提交间隔拉到 30 秒（见上）。同一条连续回滚三次就按「限流」处理：等 2 分钟，看 usage 页。

## 生成卡住

页面一直停在「Finalizing …」「Reviewing …」之类的思考文字、「Stop response」还在，超过 5 分钟就放弃这个会话：把会话地址记进 `localStorage.claudeGemStuck`，这条放回队尾，标签页重开 `/app` 做下一条。重发一般就能出图。不要刷新正在生成的会话。

## 常见画面问题与补救句

返工时在 `claudeGemPrompts[id]` 末尾追加一句、把 id 放回队尾；入库后 manifest 的 `prompt` 要按实际发出的记（10-02 食品批已补记）。

- **背景淡色重影**（主体上方多一个半透明的同款物体，番薯、海蛎、侠客岛点心都出过）：追加「整幅背景只有均匀平涂的浅暖灰，主体之外不要任何远景、虚影、云雾、淡色重影或重复的物体」；点心类再写明「一共只有四只盘子，按 2×2 排」。
- **背景偏暗**（与 230,225,216 偏差 > 20）：追加「背景必须是很浅的暖灰（接近 RGB 230,225,216），不要偏暗、不要偏灰褐」。
- **西式器物**（高脚银杯、带把手茶杯）：写明「中式无把手小盏 / 小瓷酒杯，不要西式高脚杯或带把手的茶杯」。
- **生熟混放、多画托盘垫布、主体伸出画面**（悬吊的绳子、餐巾被画面边缘截断）：分别写明「只画做好的菜，不要生食材」「不要托盘或垫布」「整件完整画在画面中央，任何部分都不能碰到画面边缘」。
- **画成活物或卡通**（拔毛生鸭昂首睁眼、河豚鼓成球带笑脸）：写明食材状态与「写实、没有卡通表情」。
- **字形图案**（月饼中央的圆寿字）：写明「只用花卉或几何纹，不要寿字、福字或任何文字变形的图案」。
- **秘籍书名**：原图没有空题签时，模型常把书名直接写在书皮上；还会把提示词里的书名号「」一起写上，或写成繁体。改用「在封面左上方贴一张浅色竖长的纸质题签，只在题签上写书名「X」（只写这 N 个字，不写引号、书名号或任何符号；用简体字）」。函套、包袱布等特殊造型按造型写题签位置。

## 其他坑

- **单次 JS 调用有 45 秒上限**：等待逻辑都拆成 28 秒以内一段；`send()` 最长约 38 秒。
- **预览图会冒充原图**：预览图（`rd-gg-dl …=s1024-rj`）加载失败重试时也走 fetch，曾被误存成 1024 的"原图"。所以 `patchFetch` 只认 `=s0-d`，存盘前还要核一次尺寸。偶尔 Gemini 本身只出 1024 的原图，这种照样入库，manifest 的 `source_size` 会写明。
- **存图不依赖真实鼠标**：窗口窄（10-02 曾窄到 227 px）时图片位置随回复文字变化，按旧坐标 hover 会落空。改为在同一次 JS 调用里先 `waitGen(3000)` 把图滚到中间，再对图片派发 pointerover / mouseover / mousemove 事件，然后 `saveFull`，失败自动重试一次。这样后台标签页也能存图（存图不算提交）。
- **后台标签页的定时器被重度节流**：在隐藏标签页里跑 `setTimeout` 轮询会拖过 45 秒上限、报渲染器无响应。等待可见要用 computer 工具的 wait（每次 ≤ 10 秒），中间只读一次 `visibilityState`。
- **Trusted Types**：页面禁止直接 `eval`，要先 `trustedTypes.createPolicy` 再 `eval(policy.createScript(code))`。
- **改了 `gemini_g.js` 之后**：要重新传进 `localStorage.claudeG`（各道共用，协调者的标签页下一次 eval 就会用上新代码，改动要向后兼容）。已打过补丁的页面要整页刷新，`patchFetch` 才会用新代码。
- **限流**：页面提示上限 / 稍后再试、模式掉回 Flash-Lite（`prepareNext` 返回 `mode not Pro`）、模板卡加载不出来（返回 `no template`），都算限流。等 2 分钟再回 `/app`；连续三次就停，去 `https://gemini.google.com/usage` 看「Current usage」的重置时间，到点再继续。额度按时段计，不是按天；一个时段能出多少张各次实测差别很大，以 usage 页为准。作者要求触顶时告诉他。
- **`prepareNext` 返回 `ok:false` 必须 throw**：否则编辑框是空的，后面的步骤会接着跑。
