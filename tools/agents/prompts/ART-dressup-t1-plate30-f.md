# 本任务：3D 纸娃娃换装 · 阶段 T1 · 女光头素体 30° 窄 A 底图（Gemini 网页版图像编辑 + 2D 门禁；AR-104）

本任务出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md` §0、§2 阶段 T、§10.T，`docs/tech/10-paper-doll-3d.md` §1.3、§2.1，`.claude/skills/tripo-web/SKILL.md` §1~§2（素体铁律：光头、裸足、薄透裹胸、高叉三角裤、无饰物、露额、唇色、眼周匀质）、`tools/imagegen/gemini_g.js`（Gemini 页面内驱动 `window.__g`，读懂 prepareNext / gate / send / waitGen / saveFull / stage / uploadRef / opts 的约定）。T0 报告 `tools/agents/reports/TOOL-dressup-t0-plate.md` 第 7 节给出 check_plate 用法。

> **出图通道变更（协调者 2026-10-07 13:30）**：上一轮实测本机 Codex 的 ChatGPT 账号对 `gpt-6-astra` 与 `gpt-6.1-sol` 都返回 HTTP 400 "not supported when using Codex with a ChatGPT account"，Codex 出图通道整体不可用。本轮改走**作者 Chrome 里的 Gemini 网页版**，经常驻进程 `tools/imagegen/tri_pipeline_runner.mjs` 的本机 HTTP 接口 `http://127.0.0.1:9223` 操作（AR-100：只用这一条常驻连接，**不得**启动 / 重启任何浏览器进程或常驻进程，不得用其他浏览器自动化）。仍然禁止用 Pillow / 代码画图、几何变形或拼贴手臂。

## 作者要求
**AR-104**：规范 A 字张角 30°（上臂与竖直夹角 30° ± 3°），模板路 A 以此图生成女中等模板 `tpl_f_medium`（1.66 m）。**AR-97 / AR-99**：素体铁律；高武力女性腿型（大腿紧致、小腿细长）。**AR-93 / AR-99**：8.8~9.0 头身（2D），送 Tripo 前已含颈下拉伸补偿——**比例不得改动**。

## 输入
- 底图：`assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png`（1024×1536，现上臂约 39°~43°；它就是现素体的 Tripo 输入，脸、身材、裹胸三角裤都已经作者认可）。

## 要做的事
1. 先 `python3 tools/model3d/dressup/make_template_plate.py measure <底图> --json` 记下底图测量值（底图背景是米色约 RGB(220,213,197)，不是纯白）。
2. 常驻进程接口（用 `curl` 或 Python `urllib`，只连 127.0.0.1:9223）：
   - `GET /status`：确认 `cdpConnected: true`，否则停下写报告（不要自己修）；
   - `POST /open {"url":"https://gemini.google.com/app"}` → 返回 `targetId`：在作者 Chrome 前台新开一个 Gemini 标签页（Gemini 只在可见标签页里能发送）；每次重出都新开一个，用完不必关；
   - `POST /eval {"targetId":"…","expression":"…"}`：在该标签页执行 JS（`awaitPromise`、`returnByValue`），返回 `{ok, result, error}`；单次调用控制在 40 秒内，长等待用多次轮询。
3. 在新标签页里依次 eval（每步看返回值）：
   a. 注入驱动：expression = `tools/imagegen/gemini_g.js` 全文，执行后检查 `typeof window.__g === 'object'`；
   b. 设专用道 `sessionStorage.setItem('claudeLane','D')`（与常驻进程的 A / B 道错开），`localStorage.setItem('claudeGemQueueD', JSON.stringify([ID]))`，在 `claudeGemPrompts` 与 `claudeGemOpts` 两个 JSON 表里**合并写入**本条（`opts[ID] = {template: '', refs: ['por_npc_zhujue__ch00_f_bald_base_body_apose.png']}`，不覆盖表里别人的条目）；ID 用 `dressup_plate30_f_r<轮次>`；
   c. 暂存参考图：把底图 PNG 读成 base64，在页面里 `Uint8Array.from(atob(b64), c => c.charCodeAt(0))` → `new File([bytes], 'por_npc_zhujue__ch00_f_bald_base_body_apose.png', {type:'image/png'})` → `await __g.idbPut(name, file)`；`await __g.idbKeys()` 确认在；
   d. `await __g.prepareNext()` → `await __g.gate()` → `await __g.send()`（看返回 ok），再反复 `await __g.waitGen()` 直到 `ok:true`（单张一般 20~90 秒；超过 5 分钟算失败）；
   e. `await __g.saveFull(ID)` 取原图（它会顺带触发浏览器下载，忽略即可），随后 eval `new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(window.__fullBlob); })` 拿 data URL，解 base64 写到临时目录；记录原始宽高。
4. 提示词（英文写，首句固定为编辑指令）："Edit the attached image. Change ONLY the arm pose: lower both arms so each upper arm is at 30 degrees from vertical (symmetric), elbows slightly bent, forearms continuing naturally, palms facing the thighs, fingers together and relaxed, empty hands. Keep EVERYTHING else pixel-identical: the same face and features, the same bald head and head size, the same body proportions, torso, legs and bare feet, the same sheer bandeau and high-cut briefs, the same standing pose, the same beige background color, the same canvas framing (head top and feet at the same pixel rows). Do not add hair, clothes, shoes, jewelry, text or watermark. Output a single full-body image with the same aspect ratio." 每轮可按门禁失败项微调措辞（例如角度偏大就写 25~28 degrees），但上面的保持条款不得删。
5. 归一画布：Gemini 原图若为 2:3（±1%）就用 Pillow LANCZOS 缩放到 1024×1536（只做整图缩放，不裁、不贴、不改局部；manifest 记 `source_size`）；比例不对就判失败重出。
6. 每张都跑 `check_plate.py --plate <底图> --image <输出> --arm-angle-deg 30 --arm-tol-deg 3 --overlay <叠加图> --json`；不过就重出（最多 8 轮），记录每轮臂角与失败项；与底图并排 `view_image` 确认是同一个人（脸、光头轮廓、唇色、眼周、身材、内衣），有变化也判失败。
7. 通过后存为 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose30.png`（RGB PNG，1024×1536），叠加图存 `…_apose30_overlay.png`，在同目录 `manifest.yaml` 追加两条（`tool: gemini-web · image edit（tri_pipeline_runner /eval）`、`model: Gemini（网页版，记录页面显示的模型名）`、`source_size`、`prompt`、`references`（底图路径 + sha256）、`sha256`、`size`、`check_plate`（逐项数值）、`rounds`（出图轮数）、`status: candidate`、`notes`）。上一轮已补的底图 approved 条目保留不动。

## 约束
- 只写上述 3 个文件（新图、叠加图、manifest.yaml）与本任务报告；不改底图。
- 禁止用 Pillow / 代码对手臂做几何变形或拼贴来"凑"角度；Pillow 只许整图缩放与写 PNG；check_plate 只做测量。
- 浏览器只经 127.0.0.1:9223 操作 Gemini 标签页；不碰作者其他标签页，不输入任何账号信息，不点任何条款 / 订阅 / 付费按钮；Gemini 报限流就等 2 分钟再试，连续 3 次失败停下写报告。
- 不调用 Tripo、不花点数（Tripo 由 T2 在协调者看图放行后做）。

检查：
- `python3 tools/model3d/dressup/check_plate.py --plate assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png --image assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose30.png --arm-angle-deg 30 --arm-tol-deg 3`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：底图与终稿的逐项测量（左右臂角、头顶 / 脚底、脸区 IoU、跨度比、髋高比、头身比）、出图次数与每次失败项、终稿与底图的差异自评（脸 / 身材有无变化）；第 7 节写交给 T2 的输入（路径、sha256、建议 Tripo 选项：单图 `image_to_model`、H3.1、Ultra、8K、PBR、delight、100k 面）。报告 ≤ 60 行。
