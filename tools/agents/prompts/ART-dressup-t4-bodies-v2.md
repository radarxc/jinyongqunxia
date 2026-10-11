# 本任务：3D 纸娃娃换装 · T4 · 新女性素体（tpl_f2_medium，替换 tpl_f_* 的候选）与新男性素体（tpl_m_medium）：素体图入库 + Tripo 生成 / 绑骨 / 动作 → 规范化 → 骨架帧（2 × 85 = 170 点）

本任务调用外部服务并处理产物。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。流程照 T2 任务书（`tools/agents/prompts/ART-dressup-t2-tpl-f-medium.md` 第 1–9 步，浏览器只经 9223 常驻进程，AR-100）。执行者：Claude（同 D2 第三版 / O1b，经 9223 操作 Tripo，只提交一次）。

## 作者要求（2026-10-11）
- 「停下方案1吧。拼头的头像素密度可以做的更好更精细。但基础素体要更美观，现在的素体斜方肌太明显了，很难看。要做一套很好看的女性素体，和一套很帅气的男性素体。」
- 作者在候选图中选定女性 A、男性 A，同意各 85 点上 Tripo（共 170 点，余额 16,920）。

## 输入（Gemini 网页出图，作者选定）
| 件 | 素体图（本任务入库） | 来源 | 目标身高 |
|---|---|---|---|
| 女性 v2 | `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_v2.png` | 以现模板底板 `…_f_bald_base_body_apose_narrow.png` 为底只改形体：颈更长、斜方肌低平、一字肩、手臂更细；脸 / 光头 / 姿势不变 | 1.66 m |
| 男性 | `assets/default/character/male/ch00/threeview/por_npc_zhujue__ch00_m_bald_base_body_apose.png` | 照男主角立绘 `ch00/por_npc_zhujue__ch00_m_charmhigh_base.png` 的脸剃光头，构图照女性底板；一字平肩、宽肩窄腰、高叉三角内裤、赤足（AR-93/94，tripo-web §2.3） | 1.82 m |

## 要做的事
1. 两张素体图入库（Gemini 原生 1686×2528；男性原生 1696×2528 裁左右各 5 px 背景成 2:3），同目录 manifest 各加一条（candidate；提示词、参考图路径 + sha256、原始下载件 sha256、作者选定记录）。
2. 每件依次做 T2 第 1–7 步（余额、暂存、生成 65、封面质检、绑骨 20、动作 idle / walk / run 0 点、导出带动作 GLB），点数逐行记 `credits_ledger.jsonl`。封面脸部 / 光头 / 手脚明显破损就停，不绑骨，报告后问作者是否重抽。
3. 后处理照 T2 第 8 步：`fix_anim_offset.py` → `normalize_rig.py --body … --out templates/<id>/body.glb` → `export_skeleton.py --body … --out templates/<id>` → 预览 → `inspect.py`；`<id>` 为 `tpl_f2_medium`、`tpl_m_medium`。
4. 模板 manifest 照 `tpl_f_medium/manifest.yaml` 字段写（id `dressup__template__tpl_f2_medium` / `dressup__template__tpl_m_medium`，gender、archetype medium、heightM 1.66 / 1.82，status candidate）；notes 写明 tpl_f2 是替换 tpl_f_* 的候选，衣物 / 头 / 道具重新贴合并验收后再切换。
5. 不派生 tall / small、不改现有模板与已贴合素材（另起任务）。

## 验收
- 两个模板 65 关节、rest = bind、`normalize_rig.py --check` 与 `export_skeleton.py --check` 通过；3D 上臂角约 23° ± 5°；头身比女 8.0~9.0、男 ≥ 8.0；三动作齐全。
- 总消耗 170 点，台账逐行记录前后余额。

## 约束
- 只写 `assets/default/model3d/dressup/templates/tpl_f2_medium/**`、`assets/default/model3d/dressup/templates/tpl_m_medium/**`、上表两张素体图与所在目录 `manifest.yaml`、`assets/default/model3d/dressup/credits_ledger.jsonl` 与本任务报告；不改脚本、现有模板与素材。
- 不输密码、不买点数、不点条款同意；不重复提交生成。

检查：
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_f2_medium/body.glb`
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_m_medium/body.glb`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f2_medium`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_m_medium`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-t4-bodies-v2.md`（≤ 60 行）：两件的 Tripo 项目 / 各 op、点数前后、封面质检、joints、3D 臂角 / 头身比 / 髋高占比 / 身高 mu、顶点 / 三角、skeleton 关键量；与现 tpl_f_medium 的颈肩线对比（截图）；给后续"三体型派生 + 衣物 / 头 / 道具重贴合 + 切换"的交接。
