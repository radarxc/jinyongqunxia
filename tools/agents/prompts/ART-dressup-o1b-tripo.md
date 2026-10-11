# 本任务：3D 纸娃娃换装 · 方案 1 试点 · O1b · 黄蓉 / 穆念慈整人素体 Tripo 生成与绑骨（2 × 85 = 170 点）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。先读根 `CLAUDE.md`、`.claude/skills/tripo-web/SKILL.md`（§0 规矩与点数、§1.4 缺陷清单、§2.3 素体铁律、§3 SOP）、`tools/model3d/tripo_web.js`、E1 任务书与报告（穿衣整身的 Tripo 实跑记录）、D2 任务书第 9–12 条（素模生成与减面经验）、O1a 报告（输入图、原著与项目口径、给 O1b 的建议）。

## 作者要求（2026-10-10）
- 「全做，黄蓉要素体。且黄蓉、穆念慈要根据描述生成不同身高比例的素体。」批准约 340 点；同晚「每个主要人物给素体就行」：本任务只做两人整人素体（生成 + 绑骨各一次，共 170 点），出场服装另起版型件任务（在主角模板上做，再贴到两人身体上）。重抽另算，每次重抽前先问作者。
- 「图出好、你看过后再提交 Tripo」：O1a 返工版两张素体已发作者（黄蓉作者回「看起来不错」；穆念慈按审核 r2 重出后已发），O1a 审核 r3 通过、合入后提交；黄蓉先、穆念慈后。
- **AR-100**：浏览器只经常驻进程 `http://127.0.0.1:9223` 这一条连接。执行者：Claude（同 D2 第三版，经 9223 常驻页操作，只提交一次）。

## 输入（O1a 返工版交付，Gemini 原生 1686×2528）
| 件 | 输入图 | 目标身高 |
|---|---|---|
| 黄蓉素体 | `ch02/threeview/por_npc_huangrong__ch02_youth_base_body_apose_hd.png` | 1.58 m |
| 穆念慈素体 | `ch02/threeview/por_npc_munianci__ch02_youth_base_body_apose_hd.png` | 1.70 m |
（路径均在 `assets/default/character/female/` 下。）原图直接上传，不缩放。

## 要做的事（两件依次做完：黄蓉先）
1. **记余额**：`__t.wallet()`；余额 < 1,500 停。每次 generate / rig 前后各追加一行 `assets/default/model3d/dressup/credits_ledger.jsonl`（`task: "ART-dressup-o1b-tripo"`，item 为下表 id）。
2. **生成（65 点）**：`toGenerate('imageToModel')` → `clearUpload()` → `uploadRef` → `checkSettings('imageToModel')`（H3.1、geometry detailed、texture extreme、PBR、delight、triangle、private，同 T2 / E1 / D2）→ `generate({ go: true })` → `waitOp`。只提交一次；出错先 `projects()` / `proj(pid)` 核对。
3. **封面质检**：`cover(pid)` 下载看图，过 tripo-web §1.4 缺陷清单（额头肉块、耳前薄片、太阳穴削角、唇裂、发髻头盔化、耳下肉块）+ 手脚完整、臂张角；脸与立绘是否仍是同一个人。脸部明显破损就停，不绑骨，报告后问作者是否重抽。
4. **绑骨（20 点）**：`rig(pid, { go: true })` → `waitOp` → `joints(pid)` 须 `ok:true`（65 关节、Mixamo 命名）。不做 retarget。
5. **导出（0 点）**：`setSaveMode('reload')` → `exportGlb(pid, <名>, { anims: [] })` → `saveQueue()` 签名 URL `curl` 到临时目录 → 恢复 saveMode。8K 原始导出另存主检出本地库（不入 git），路径与 sha256 记 source.json。
6. **入库**：`textures.py` 压 baseColor ≤ 2048² JPEG q85（删 normal / metallicRoughness），几何 / UV / skin 原样；前后 `inspect.py --json` 核对关节 / 顶点 / 三角一致。

| id | 输出 |
|---|---|
| 黄蓉素体 | `assets/default/model3d/dressup/pilot_o1/npc_huangrong/source/tripo_body_rig.glb` + `cover_body.png` |
| 穆念慈素体 | `…/pilot_o1/npc_munianci/source/tripo_body_rig.glb` + `cover_body.png` |

   每人一份 `source.json`（`schema: tianshu-dressup-source.v1`，`kind: "pilot-o1-body"`，`targetHeightM`，tripo 项目与 op、options、credits、输入图 path + sha256、glb 摘要、inspect 关键量、joints 体检、封面质检结论）。`pilot_o1/` 下不写 manifest（源件不进包）。
7. **体型复核（只读）**：用 `inspect.py` / `measure_heads.py` 量 3D 头身比、腿长比、肩宽比；按目标身高缩放后两人身高差 12 cm，报告写数。

## 约束
- 只写 `assets/default/model3d/dressup/pilot_o1/**`、`credits_ledger.jsonl` 与本任务报告；不改工具、模板、输入图。
- 不输密码、不买点数、不点条款同意；点数只花 170；不重复提交。

检查：
- 两个 GLB `python3 tools/model3d/dressup/inspect.py --json …` 关节 65、与压缩前一致
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-o1b-tripo.md`（≤ 40 行）：两件的项目 / op、耗时、点数前后、封面逐项质检、joints、inspect 关键量与 3D 体型数值；给 O1c（人物素体模板化 + 版型件贴合 + 与方案 2 并排对比）的交接。
