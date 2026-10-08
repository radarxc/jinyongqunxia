# 本任务：3D 纸娃娃换装 · 阶段 E1 · 江湖劲装 eq_jinzhuang 整身生成（Tripo 生成 + 绑骨 → 源件入库；AR-102 / AR-104 / AR-105）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§2 阶段 E、§5.1、§10 D / E、§11）、`docs/tech/10-paper-doll-3d.md` §2.1~§2.3（整身绑骨路线）、`.claude/skills/tripo-web/SKILL.md`（§0 规矩与点数、§1.2 平台能力边界、§3 SOP）、`tools/model3d/tripo_web.js`（页面内驱动 `window.__t`）、`tools/model3d/dressup/README.md`、T2 报告 `tools/agents/reports/ART-dressup-t2-tpl-f-medium.md`（同一套 Tripo 操作的实跑记录，照着做）。

## 作者要求
**AR-102**：衣服要真正穿到模板素体上、不穿模、随动作运动。作者 2026-10-08 看了本地预览仍穿模，问"衣服不是贴图贴到模型上吗"，随后同意**贴图层与网格层两条路同时试**（原话「同时试试吧」）。本任务产出两条路共用的源件：穿着劲装的整身 Tripo 模型（带 Tripo 绑骨）。网格层由 E2 从中抽出衣服壳再贴合，贴图层由 E3 把衣服颜色烘焙到模板贴图上。**AR-104**：点数已批（首批装备约 620 点），本任务只花 85 点（生成 65 + 绑骨 20）。**AR-100**：浏览器只经常驻进程这一条连接。

## 输入
- 衣图底板（协调者用 agy 编辑模板底图得到，2D 门禁已过：脸区 IoU 0.966、上臂 26.8°、髋高比差 0.001）：`assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png`（1024×1536，与模板底图同画布、同人物高与脚底）。manifest 条目在同目录 `manifest.yaml`。
- 模板正本（只读，用于对照）：`assets/default/model3d/dressup/templates/tpl_f_medium/`（Tripo 项目 be15d34a，3D 上臂 23.6°）。

## 浏览器操作方式（必须照做，同 T2）
- 只用本机常驻进程 `tools/imagegen/tri_pipeline_runner.mjs` 的 HTTP 接口 `http://127.0.0.1:9223`：`GET /status`、`GET /targets`、`POST /open {"url"}`、`POST /eval {"targetId","expression"}`。**不要用** `POST /tripo/task`；不得启动 / 重启任何浏览器或常驻进程，不碰作者的其他标签页。
- 先 `GET /targets` 找 URL 含 `studio.tripo3d.ai/workspace` 的页；没有就 `POST /open {"url":"https://studio.tripo3d.ai/workspace/generate"}`，等页面加载。作者已登录；若页面要求登录 / 付费 / 同意条款，**立即停下写报告**，不输入任何账号信息、不点任何购买或条款按钮。
- 每次 eval 前若页面里没有 `window.__t`，先注入 `tools/model3d/tripo_web.js` 全文。单次 eval 控制在 40 秒内；`waitOp` 返回 pending 就再调。

## 要做的事
1. **记余额**：`await __t.wallet()`。
2. **暂存底图**：PNG 转 base64 → 页面里 `new File([bytes], 'por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png', {type:'image/png'})` → `await __t.idbPut(name, file)`，`__t.idbKeys()` 核对。
3. **生成（65 点）**：`toGenerate('imageToModel')` → `clearUpload()` → `uploadRef(name)` → `checkSettings('imageToModel')` 核对与 T2 相同的参数（H3.1、geometry detailed、texture extreme、PBR、delight、triangle、private）→ `generate({ go: true })` → `waitOp` 到 `success`（最多 15 分钟）。**只提交一次**；失败先 `projects()` / `proj(pid)` 确认没有重复提交。
4. **封面质检**：`cover(pid)` 用 `curl` 下载后看图：交领右衽与腰带结、翻袖口、衣摆到髋与底图一致；脸、光头、耳、手、脚完整无破面；臂张角与底图一致；衣服与身体之间没有大片粘连或破洞。明显破损就停下写报告（不绑骨，不再花点数）。
5. **绑骨（20 点）**：`rig(pid, { go: true })` → `waitOp` 到 `success` → `joints(pid)` 要 `ok:true`（65 关节、髋 0.45–0.65、头在髋上、双脚 < 0.15、双手离髋 > 0.12 且等高）。**不做 retarget**（衣服随动用模板动作，E2 本地转移权重）。
6. **导出（0 点，不经浏览器下载）**：记下 `saveMode()` 原值 → `setSaveMode('reload')` → `exportGlb(pid, 'dressup_eq_jinzhuang_dressed', { anims: [] })`（不带动作的 model_rig；pending 就再调到 queued）→ `saveQueue()` 取签名 URL，用 `curl` 下载到系统临时目录 → `clearSaveQueue()` 并恢复 `setSaveMode(<原值>)`。
7. **后处理**（仓库脚本，全部实跑，不改脚本）：
   - `python3 tools/model3d/dressup/inspect.py --json <导出.glb>`：记关节数、rest = bind 差、3D 上臂角、头身比、髋高占比、顶点 / 三角、连通块、包围盒；
   - 用 `tools/model3d/dressup/textures.py` 把贴图压到 baseColor ≤ 2048² JPEG q85（删除 normal / metallicRoughness），**几何、UV、skin 原样保留**（E2 / E3 要用 Tripo 的权重和贴图颜色）；输出 `assets/default/model3d/dressup/garments/eq_jinzhuang/source/tripo_dressed_rig.glb`，再跑一次 `inspect.py --json` 确认关节 / 顶点 / 三角与压缩前一致；
   - 封面转 RGB PNG（长边 ≤ 1024）存 `…/source/cover.png`；
   - 写 `…/source/source.json`：`{ schema: "tianshu-dressup-source.v1", id: "eq_jinzhuang", kind: "dressed-body", template: "tpl_f_medium", item: "eq_jinzhuang", tripo: { project_id, generate_op, rig_op, export_op }, options（照 checkSettings 实际值）, credits: { generate, rig, before, after }, plate: { path, sha256 }, glb: { file, sha256, size_bytes, vertices, triangles, joints }, inspect: {…关键量…}, joints_check: {…joints(pid) 返回…}, qc: "封面质检结论", created }`。
   - **不要**在 `assets/default/model3d/dressup/**` 下写任何 `manifest.yaml`（构建期会把 manifest 里的文件发布进游戏包；源件不进包，正式条目由 E2 入库时写）。
8. **对照数（不改模型）**：从 `inspect.py` 与 `joints(pid)` 读出 Hips / Spine / Spine1 / Spine2 / Neck / LeftArm / RightArm / LeftUpLeg / RightUpLeg / LeftHand / RightHand / LeftFoot / RightFoot 的 bind 世界坐标，与 `templates/tpl_f_medium/skeleton.json` 的 `bindWorld` 同名关节并列写进报告（按各自身高归一后的差，单位 %H），作为 E2 关节对齐的预期值。

## 约束
- 只写 `assets/default/model3d/dressup/garments/eq_jinzhuang/source/**` 与本任务报告；不改脚本（发现脚本 bug 写进报告第 4 节）。
- 不输密码、不买点数、不点条款同意；点数只花 85；出错时不重复提交生成。
- 临时文件放系统临时目录；Tripo 原始导出不进仓库其他位置。

检查：
- `python3 tools/model3d/dressup/inspect.py --json assets/default/model3d/dressup/garments/eq_jinzhuang/source/tripo_dressed_rig.glb`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：Tripo 项目 / 操作 ID、耗时、点数前后、封面质检结论、joints 体检、inspect 关键量（关节、3D 上臂角、头身比、髋高占比、顶点 / 三角、包围盒）、压缩前后体积、13 个关节与模板的归一化差（%H）；第 7 节写给 E2（抽衣壳 + 贴合）与 E3（贴图层烘焙）的交接：文件路径、坐标系与朝向（Tripo 导出 `export_orientation: -y` 的含义）、skin 骨名是否与模板 65 骨同名同序。报告 ≤ 60 行。
