# 本任务：3D 纸娃娃换装 · 阶段 T2 · 女中等模板 tpl_f_medium 新正本（Tripo 生成 + 绑骨 + 动作 → 规范化 → 骨架帧；AR-104 / AR-105）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§2 阶段 T、§4、§10.T、§11）、`docs/tech/10-paper-doll-3d.md` §1.1~§1.3、`.claude/skills/tripo-web/SKILL.md`（§0 规矩与点数、§1.2 平台能力边界、§3 SOP）、`tools/model3d/tripo_web.js`（Tripo 页面内驱动 `window.__t`：toGenerate / clearUpload / uploadRef / checkSettings / generate / waitOp / rig / joints / retarget / exportGlb / setSaveMode / saveQueue / cover / wallet / proj）、`tools/model3d/dressup/README.md`、A2 报告第 7 节（normalize_rig / export_skeleton 用法）。

## 作者要求
**AR-104**：模板走路 A，女中等模板 `tpl_f_medium`（1.66 m）以窄 A 光头底图一次 `image_to_model`（65 点）+ `rig`（20 点）+ `retarget`（0 点）生成，点数已批（W1 105 点）。**AR-105**：规范窄 A 25° ± 3°，底图定稿为 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png`。**AR-102**：骨架唯一——本任务产物替换过渡期正本，成为换装系统唯一骨架来源。**AR-100**：浏览器只经常驻进程这一条连接。

## 浏览器操作方式（必须照做）
- 只用本机常驻进程 `tools/imagegen/tri_pipeline_runner.mjs` 的 HTTP 接口 `http://127.0.0.1:9223`：`GET /status`、`GET /targets`、`POST /open {"url"}`（在作者 Chrome 新开标签页，返回 `targetId`）、`POST /eval {"targetId","expression"}`（在该页执行 JS，`awaitPromise` + `returnByValue`，返回 `{ok,result,error}`）。**不要用** `POST /tripo/task` 队列（常驻进程内的 Tripo 会话已失效），不得启动 / 重启任何浏览器或常驻进程，不碰作者的其他标签页。
- 先 `GET /targets` 找 URL 含 `studio.tripo3d.ai/workspace` 的页；没有就 `POST /open {"url":"https://studio.tripo3d.ai/workspace/generate"}`，等页面加载（eval `location.pathname` 与 `!!document.querySelector('#__nuxt')`）。作者已登录；若页面要求登录 / 付费 / 同意条款，**立即停下写报告**，不输入任何账号信息、不点任何购买或条款按钮。
- 每次 eval 前若页面里没有 `window.__t`，先注入驱动：expression = `tools/model3d/tripo_web.js` 全文。单次 eval 控制在 40 秒内；驱动里的等待（waitOp 默认 28 秒）返回 `pending` 就再调一次轮询。

## 要做的事
1. **记余额**：`await __t.wallet()`，报告写生成前余额。
2. **暂存底图**：读底图 PNG 转 base64，在页面里 `Uint8Array.from(atob(b64), c => c.charCodeAt(0))` → `new File([bytes], 'por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png', {type:'image/png'})` → `await __t.idbPut(name, file)`；`await __t.idbKeys()` 核对。
3. **生成（65 点）**：`await __t.toGenerate('imageToModel')` → `__t.clearUpload()` → `await __t.uploadRef(name)`（要 `ok:true` 且有 key）→ `__t.checkSettings('imageToModel')` 核对驱动默认参数（H3.1、geometry detailed、texture extreme、PBR、delight、triangle、private）→ `await __t.generate({ go: true })` 拿 `{pid, op}`；`await __t.waitOp(op)` 反复轮询到 `success`（最多 15 分钟）。**只提交一次**；`generate` 若返回失败，先 `await __t.projects()` / `__t.proj(pid)` 确认没有重复提交再决定，不得盲目重发。
4. **看封面质检**：`await __t.cover(pid)` 拿 URL，用 `curl` 下载到临时目录，`view_image` 看：脸完整无破面 / 挑棚 / 粘连、光头无发片、耳朵完整、手脚完整、裹胸与三角裤贴身、臂张角与底图一致。明显破损就停下写报告（不绑骨，不再花点数），由协调者决定是否 freeRetry。
5. **绑骨（20 点）**：`await __t.rig(pid, { go: true })` → `waitOp` 到 `success` → `await __t.joints(pid)` 要 `ok:true`（髋 0.45–0.65、头在髋上、双脚 < 0.15、双手离髋 > 0.12 且等高）。
6. **动作（0 点）**：反复 `await __t.retarget(pid, ['idle','walk','run'], { go: true })` 直到返回 `ok:true`（每次只提交一个并等待，遇 406 锁冲突就等 30 秒再调）。
7. **导出（0 点，不经浏览器下载）**：先记下 `__t.saveMode()` 原值，`__t.setSaveMode('reload')`，再 `await __t.exportGlb(pid, 'dressup_tpl_f_medium', { anims: ['idle','walk','run'] })`（返回 pending 就再调直到 `queued`）；eval `__t.saveQueue()` 取 `{url, file}`，用 `curl` 直接下载签名 URL 到临时目录；完成后 `__t.clearSaveQueue()` 并 `__t.setSaveMode(<原值>)`。封面同法：`__t.cover(pid)` 的 URL 用 `curl` 存成 PNG。
8. **后处理**（仓库脚本，全部实跑）：
   - `python3 tools/model3d/fix_anim_offset.py <anim.glb> <anim_fixed.glb>`（修 run 根位移跳位）；
   - `python3 tools/model3d/dressup/normalize_rig.py --body <anim_fixed.glb> --out assets/default/model3d/dressup/templates/tpl_f_medium/body.glb --json`（rest=bind、yaw +Z、剥常量 scale / 非 Hips position 轨道），再 `--check`；
   - `python3 tools/model3d/dressup/export_skeleton.py --body assets/default/model3d/dressup/templates/tpl_f_medium/body.glb --out assets/default/model3d/dressup/templates/tpl_f_medium --json`，再 `--check`（会重写 skeleton.json / regions.npy / skull_profile.json，并按 A2 约定把 `_REGION` 写进 body.glb）；
   - 封面转 RGB PNG（长边 ≤ 1024）存 `templates/tpl_f_medium/preview.png`；
   - `python3 tools/model3d/dressup/inspect.py --json …/body.glb` 记 3D 臂角、头身比、髋高占比。
9. **manifest**：改写 `assets/default/model3d/dressup/templates/tpl_f_medium/manifest.yaml` 的模板条目（保留 id `dressup__template__tpl_f_medium` 与已有字段名）：`tool: tripo-studio-web（经 tri_pipeline_runner /eval）`、`tripo_model {project_id, generate_op, rig_op, animation_ops{idle,walk,run}}`、`options`（生成 / 绑骨 / 导出参数，照 checkSettings 实际值）、`credits {generate, rig, before, after}`、`references`（底图路径 + sha256）、`source.copied_from` 删除改为 `source.tripo_project_id`、`sha256` / `size_bytes` / `joints` / `vertices` / `triangles` / `animations`、`heightMu` / `mPerMu` / `ringSha` / `skeletonSha` / `skullProfileSha`（取 export_skeleton 输出）、`armAngleDeg3d`、`headsRatio`、`hipsRatio`、`status: candidate`、`notes`（替换了过渡期正本，过渡期正本 = 旧 Tripo 项目 0e8cd219 的 anim_idle_walk_run.glb）。

## 验收（spec §10.T）
- 65 关节、rest = bind、`normalize_rig.py --check` 与 `export_skeleton.py --check` 通过；
- 3D 上臂角约 23° ± 3°（2D 底图 25°；以实测为准，超出 ±5° 写进报告第 4 节）；头身比 8.0~9.0；髋高占比与 0.565 差 ≤ 2%（超出不改模型，写进报告，由 T3 的 derive_template 校正）；
- 总消耗点数 = 85（生成 65 + 绑骨 20），报告写生成前后余额。

## 约束
- 只写 `assets/default/model3d/dressup/templates/tpl_f_medium/**` 与本任务报告；不改脚本（发现脚本 bug 写进报告第 4 节）。
- 不输密码、不买点数、不点条款同意；点数只花上述 85；出错时不重复提交生成。
- 临时文件放系统临时目录；不把 Tripo 原始导出放进仓库其他位置。

检查：
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_f_medium/body.glb`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_medium`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：Tripo 项目 / 操作 ID、生成与绑骨耗时、点数前后、封面质检结论、joints 体检数、3D 臂角 / 头身比 / 髋高占比 / 身高 mu、顶点 / 三角、normalize 剥掉的轨道数、skeleton.json 关键量（头宽、颈环、握点）；第 7 节写给 T3（重派生 small / tall）与阶段 C（全部装备按新正本重贴合）的交接。报告 ≤ 70 行。
