# 本任务：3D 纸娃娃换装 · E4 · 出鞘持剑：龙泉剑 eq_longquanjian（Tripo 生成 → 归一化 → 握右手 → 门禁 → 入库；AR-102 / AR-107）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§4 插槽坐标系约定、§5.2、§6、§7、§11）、`.claude/skills/tripo-web/SKILL.md`（§0 规矩与点数、§3 SOP）、`tools/model3d/tripo_web.js`、T2 / E1 报告（同一套 Tripo 操作实跑记录）、A3 / A5 / A6 报告第 7 节（normalize_prop 的护手峰判柄、gripR 约定、check_sockets、validate / ingest）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12），与 `_code.md` 的 Node 24 / pnpm 12 不同不算偏离。

## 作者要求
**AR-107**（作者 2026-10-08 原话）："剑拿反了。而且如果拿手里，应该是拔出来的状态，挂在腰上才是放到剑鞘的状态"。持剑态必须是**出鞘的剑**握在手里（剑柄在拳中，刃从虎口侧伸出）；入鞘的佩剑态由 A6 挂左腰。**AR-102** 第 5 条：手能拿武器。点数按 AR-104 首批装备预算，本件只花一次 `image_to_model`（不绑骨）。

## 输入
- 物品图：`assets/default/item/weapons/eq_longquanjian.png`（龙泉剑：修长直身双刃、青灰钢、如意小护手、深青缠柄；画面是单独一把出鞘剑）。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_medium/`（A6 新约定的 skeleton.json）。

## 要做的事
1. **Tripo 生成（只做 `image_to_model`，不 rig）**：浏览器操作方式同 T2 / E1（只用常驻进程 `http://127.0.0.1:9223` 的 `/targets` `/open` `/eval`，注入 `tools/model3d/tripo_web.js`；不启动 / 重启浏览器或常驻进程；遇登录 / 付费 / 条款立即停下写报告）。记余额 → 暂存物品图 → `generate`（参数同 T2 的 checkSettings）→ `waitOp` 到 success → 封面质检（剑身完整、护手与缠柄清楚、无鞘、无底座 / 地面 / 手）→ 导出 GLB（`exportGlb(pid, 'dressup_eq_longquanjian', { anims: [] })`，`setSaveMode('reload')` 取签名 URL 后 `curl` 下载到系统临时目录）。**只提交一次生成**。
2. **处理**（仓库脚本，全部实跑）：`normalize_prop.py --class weapon --real-size-m 0.95 --id eq_longquanjian`（用 A6 的护手峰判柄端：柄在护手外侧；报告写剖面与判定依据）→ `textures.py` → `pack_glb.mjs --simplify`（≤ 1 万三角）→ `validate.py` → `ingest.py prop eq_longquanjian --slot mainHand --item eq_longquanjian`，写 `assets/default/model3d/dressup/props/eq_longquanjian/`（manifest `socket: gripR`，notes 写"出鞘·持剑态"，`source` 记 Tripo 项目 ID 与物品图 sha256）。
3. **握持**：按 spec §4 握持约定与 A6 的倾角规则——`restTiltDeg` 在 {0, 20, 40, 60} 与反握中按"72 帧刃身深穿占比最小"选取（衣物分级：approved ≤ 0.5%、draft ≤ 2%），fit.json 记 `tiltSweep` 与选定值；`check_sockets.py` 对本件退出 0（握点在拳心、刃从虎口侧伸出、bind 刃向与约定夹角 < 1°）。
4. **质检图**：Pillow 软光栅出 `preview_hand.png`（模板 bind 姿势右手局部放大，看剑柄在拳中、护手在虎口外、刃向）与 `preview_full.png`（全身正 / 侧）。

## 协调者实测意见（第 1 轮，2026-10-08 20:15；改由 traex 执行，审核按此判定）
agy 第 1~3 次运行：Tripo `image_to_model` 已完成一次（任务 `a3002088-7ec0-4640-8caf-33be4afa84f8`，原始模型 `/private/tmp/tripo__dressup_eq_longquanjian.glb`），归一化已跑（护手峰 26.9%、柄端 min）。但：①**手改了 `report.json` 让 `prop.semanticDirection` 通过**——门禁结果只能由 `validate.py` 生成，手改即判不合格；②GLB 仍 4 MB，没有 `textures.py` / `pack_glb.mjs --simplify`（≤ 1 万三角）；③质检图里剑躺在脚边地上，没有进手；④握持选了反握 -150°。改法：
1. **严禁再提交任何 Tripo 生成 / 绑骨**；从原始模型或现有归一化结果接着做。
2. **`validate.py` 语义方向修正（本任务写集已加入 `validate.py` / `tests_prop.py`，只改这一个分支）**：`prop.semanticDirection` 对 `fit.handleDetection.method == "guard-peak"` 的武器，改为按 `handleDetection`（握点落在 `handleEnd` 一侧的柄段、刃段在另一侧）判定，不再用旧的"窄端 = 柄"（出鞘剑剑尖最窄，旧规则必误报）；无 `handleDetection` 的道具行为不变。补测试：合成出鞘剑（剑尖最窄）判通过、把握点放到刃端判失败；A6 的青锋剑（佩剑）结果不变。
3. **握法只许正握**：刃从虎口 / 食指一侧伸出（sockets §4 握持系 +Y 方向），`restTiltDeg` 在 {0, 20, 40, 60} 中按 72 帧刃身深穿占比最小选取，**不允许反握**（作者 AR-107 前情"剑拿反了"）；fit.json 写 `tiltSweep`（每档深穿）与选定值。
4. 完整流水线：`textures.py` → `pack_glb.mjs --simplify`（≤ 1 万三角）→ `validate.py`（新规则）→ `check_sockets.py` 退出 0 → `ingest` / manifest；`report.json` 全部来自工具输出。
5. 质检图：`preview_hand.png` 要看到剑柄在右手拳中、护手在虎口外、刃向前下方；`preview_full.png` 全身正 / 侧。用与 `check_sockets.py` 相同的插槽变换渲染（剑在手上，不得在原点 / 地面）。
6. 报告第 3 节：Tripo 任务 ID、点数（查不到写"未记录"）、柄端判定、尺寸、tiltSweep、validate / check_sockets 数字。删除工作区里的 `scratch/` 等写集外文件。

## 约束
- 只写 `assets/default/model3d/dressup/props/eq_longquanjian/**` 与本任务报告；不改脚本（发现 bug 写进报告第 4 节）。
- 不输密码、不买点数、不点条款；点数只花一次 `image_to_model`；出错不重复提交生成。临时文件放系统临时目录。

检查：
- `python3 tools/model3d/dressup/check_sockets.py --template assets/default/model3d/dressup/templates/tpl_f_medium --props assets/default/model3d/dressup/props/eq_longquanjian`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写 Tripo 项目 / 操作 ID、点数前后、封面质检、柄端判定依据、尺寸与缩放、倾角 sweep 与选择、validate / check_sockets 关键数字；第 7 节写给 B 系列预览页（持 / 佩两态如何在面板里互斥与切换）的交接。报告 ≤ 50 行。
