# 本任务：3D 纸娃娃换装 · D2 · 生成头样例：穆念慈（Tripo 生成 + 绑骨 → 三体型切头；V4 闸门；约 85 点）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V4、§2 P5、§4.3 / §4.4）、`.claude/skills/tripo-web/SKILL.md`（§0 规矩与点数、§1 脸部质量、§3 SOP）、`tools/model3d/tripo_web.js`、E1 任务书 `tools/agents/prompts/ART-dressup-e1-garment-gen.md` 与报告（同一套 Tripo 操作的实跑记录，照着做）、D1b / D1c 报告第 7 节（`cut_head.py` / `shoot_head.mjs` 用法）。

## 作者要求
V4 头闸门要两样：切 1 个现有 NPC 头（D1 / D1b / D1c 已过），生成 1 个新头接上（本任务）。作者 2026-10-10 选定穆念慈，批准花点（生成 65 + 绑骨 20）。**AR-100**：浏览器只经常驻进程这一条连接。

## 输入
- 协调者已备好的窄轮廓 A 字全身参考图：`assets/default/character/female/ch02/threeview/por_npc_munianci__ch02_youth_apose_slim.png`（以作者定稿 C 版立绘为底；按 tripo-web §1 去刘海、去发饰与耳饰、双耳露出、束袖、直筒窄裙）。manifest 条目在同目录。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_{medium,tall,small}/`。

## 浏览器操作方式（必须照做，同 E1）
- 只用本机常驻进程 `tools/imagegen/tri_pipeline_runner.mjs` 的 HTTP 接口 `http://127.0.0.1:9223`：`GET /status`、`GET /targets`、`POST /open {"url"}`、`POST /eval {"targetId","expression"}`。**不要用** `POST /tripo/task`；不得启动 / 重启任何浏览器或常驻进程，不碰作者的其他标签页。
- 先 `GET /targets` 找 URL 含 `studio.tripo3d.ai/workspace` 的页；没有就 `POST /open {"url":"https://studio.tripo3d.ai/workspace/generate"}`。作者已登录；若要求登录 / 付费 / 同意条款，**立即停下写报告**，不输入账号信息、不点购买或条款按钮。
- 每次 eval 前若页面里没有 `window.__t`，先注入 `tools/model3d/tripo_web.js` 全文；单次 eval ≤ 40 秒，`waitOp` 返回 pending 就再调。

## 要做的事
1. **记余额**：`await __t.wallet()`；余额 < 1,500 就停下写报告。每次 generate / rig 前后各追加一行到 `assets/default/model3d/dressup/credits_ledger.jsonl`：`{ time, task, item: "npc_munianci", op, pid, before, after, spent }`（文件不存在就新建）。
2. **暂存参考图并生成（65 点）**：PNG 转 base64 → `idbPut` → `toGenerate('imageToModel')` → `clearUpload()` → `uploadRef(name)` → `checkSettings('imageToModel')` 核对参数与 T2 / E1 相同（H3.1、geometry detailed、texture extreme、PBR、delight、triangle、private）→ `generate({ go: true })` → `waitOp` 到 `success`（≤ 15 分钟）。**只提交一次**；出错先 `projects()` / `proj(pid)` 确认没有重复提交。
3. **封面与脸部质检**：`cover(pid)` 用 `curl` 下载后看图，逐项过 tripo-web §1.4 的缺陷清单：额头肉块 / 眼皮撕裂、耳前悬浮薄片、太阳穴削角、唇裂、颅顶头盔感、耳下肉块、发饰烘焙。脸部有明显破损就**停下写报告**（不绑骨、不再花点数，由协调者改参考图后另起）。
4. **绑骨（20 点）**：`rig(pid, { go: true })` → `waitOp` → `joints(pid)` 须 `ok:true`（65 关节、Mixamo 命名）。不做 retarget。
5. **导出（0 点）**：记下 `saveMode()` 原值 → `setSaveMode('reload')` → `exportGlb(pid, 'dressup_head_npc_munianci', { anims: [] })` → `saveQueue()` 取签名 URL，`curl` 下载到系统临时目录 → `clearSaveQueue()` 并恢复原值。
6. **源件入库**（同 E1 口径）：
   - `tools/model3d/dressup/textures.py` 把贴图压到 baseColor ≤ 2048² JPEG q85（删 normal / metallicRoughness），几何、UV、skin 原样保留，输出 `assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig.glb`；前后各跑一次 `inspect.py --json`，确认关节 / 顶点 / 三角一致。
   - 封面转 RGB PNG（长边 ≤ 1024）存 `…/source/cover.png`；写 `…/source/source.json`（字段照 E1 的 `source.json`：tripo 项目与各 op、options、credits、参考图 path + sha256、glb 摘要、inspect 关键量、joints 体检、封面质检结论）。`source/` 下不写 manifest。
7. **三体型切头**：按 D1c 用法依次跑 `python3 tools/model3d/dressup/cut_head.py --source assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig.glb --template assets/default/model3d/dressup/templates/tpl_f_<medium|tall|small> --id npc_munianci --out assets/default/model3d/dressup/heads/npc_munianci`（medium 先；tall / small 自动加后缀并登记 manifest `fits`）。三份 `report*.json` 须 level ≥ draft（V4 门禁全过）；不过就照报告里的失败项定位原因写进报告（不改工具、不放宽门禁）。
8. **运行时截图**（5173 开发服务器由协调者保持运行）：按 D1c 报告第 7 节对三体型各跑一次 `shoot_head.mjs --template tpl_f_<…> --head munianci=assets/default/model3d/dressup/heads/npc_munianci …`，输出放系统临时目录，挑总图复制到 `…/heads/npc_munianci/shots/`。沙箱里起不了无头 Chrome 或连不上 5173 时跳过，并在报告写明，由协调者实拍。

## 约束
- 只写 `assets/default/model3d/dressup/heads/npc_munianci/**`、`assets/default/model3d/dressup/credits_ledger.jsonl` 与本任务报告；不改工具、测试、模板与参考图（发现工具 bug 写进报告第 4 节）。
- 不输密码、不买点数、不点条款同意；点数只花 85；出错不重复提交生成。临时文件放系统临时目录。

检查：
- `python3 tools/model3d/dressup/inspect.py --json assets/default/model3d/dressup/heads/npc_munianci/source/tripo_rig.glb`
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- 三体型头报告门禁：`python3 -c` 读 `heads/npc_munianci/report{,.tpl_f_tall,.tpl_f_small}.json`，level 均不为 fail
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-d2-head-gen.md`：第 3 节写 Tripo 项目 / 各 op、耗时、点数前后、封面与脸部质检逐项结论、joints 体检、inspect 关键量、三体型切头的门禁数字（G1 顶 / 底、鼓包、ΔE、penetration、外露）与截图路径；第 7 节写给 P5 量产的经验（参考图规矩哪些起了作用、生成到切头的总耗时与点数）。报告 ≤ 50 行。
