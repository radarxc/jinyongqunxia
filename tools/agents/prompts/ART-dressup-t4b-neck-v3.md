# 本任务：3D 纸娃娃换装 · T4b · 颈肩改版：女 tpl_f2_medium 平滑雕塑（颈加长 + 收细）+ 男 tpl_m_medium 按新素体图重生成（85 点）

本任务写代码、调用外部服务并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。执行者：Claude（同 T4，经 9223 操作 Tripo；生成、绑骨各只提交一次）。

## 作者要求（2026-10-11）
- 「男女脖子都太粗（截图1，2）参考逆水寒这些的3D人物头颈肩膀来做」；对雕塑 v2「改的有问题，算法要平滑，否则有突变」；「如果不行就换素体重新生成，一个好的基础版本比改半天要好很多」。
- 作者选定：女性按平滑雕塑 v3 定稿；男性用新素体图 B（g2）重新上 Tripo（85 点）。

## 事实（协调者实测）
- 参考：主检出 `.agents/coord/imagegen-reference/nishuihan/`（《逆水寒》官方图 8 张，只作内部参考、不入库）。女：颈宽 ≈ 头宽（含耳）0.5、下巴到胸骨上窝 ≈ 0.3 头高、无斜方肌隆起；男：颈宽 ≈ 0.68、≈ 0.38 头高、斜方肌薄而平直约 20°。
- 2D 素体图颈宽 / 头宽：女 0.52、男 0.62；同口径 3D 模板：女 0.57、男 0.69——Tripo 重建把颈吹粗约 10%。女性 2D 图本已细，重出图无效；男性 2D 图颈短、斜方肌从耳下隆起，需要换图。
- 雕塑 v2（逐点分段衰减 + Head 权重保护）在男性颈侧 / 颈后产生折线鼓包（作者截图）；v3 改为约束式双调和位移场（`cut_head.biharmonic_displacement`，焊接 UV 缝后求解）：女性 0 翻面、边长比 0.87–1.33、相邻面二面角变化 p99 2.0° / 最大 8.3°。

## 要做的事
1. 新工具 `tools/model3d/dressup/sculpt_neck.py --body <glb> --out <glb> --lengthen-mm L --k-front kf --k-side ks --k-back kb [--trap-mm d] [--json] [--check-only]`（由 v3 原型整理）：头部集（高于按角度混合的头界）整体上移 L 且 Head 关节同步上移、IBM 重算；颈中段一圈细环给收细目标；躯干 / 肩外侧固定；其余 ROI 点按双调和自由求解；法线按焊接网格变形前后几何法线的旋转去转原法线；拓扑 / UV / 权重 / joints 顺序 / 动画轨不变。JSON 输出：翻面数、边长比分位、二面角变化分位、各约束集点数、求解残差。门：翻面 0、二面角变化最大 ≤ 12°、边长比 ∈ [0.5, 2]，否则退出 2 且不写文件。配 `tests_sculpt.py`（合成颈管：加长量与 Head 关节位移一致、收细比例、平滑度门、拓扑 / 权重不变、门不过不写）。
2. 女：`sculpt_neck.py` 作用于 `templates/tpl_f2_medium/body.glb`（L 15 mm、kf 0.97、ks 0.87、kb 0.88），再 `normalize_rig.py --check`、`export_skeleton.py --default-height-m 1.66`；manifest 更新 SHA / 比例 / `sculpt {tool, params, report}`；新旧颈肩对照截图（贴图 + 光照）。
3. 男：素体图 `assets/default/character/male/ch00/threeview/por_npc_zhujue__ch00_m_bald_base_body_apose_v2.png`（Gemini 原图 g2，1686×2528）入库并登记 manifest（提示词、参考：旧素体图 + 逆水寒男 01 裁图、作者选定）；旧素体图条目 status 改 rejected（notes 写原因）。照 T4 第 2–3 步重新生成 `templates/tpl_m_medium`（生成 65 + 绑骨 20 + idle/walk/run 0 点 → 后处理，身高 1.81 m）；颈宽 / 头宽若仍 > 0.62（3D 口径），用 `sculpt_neck.py` 平滑收细到 ≤ 0.62，并照女性同样记录。
4. 点数逐行记 `credits_ledger.jsonl`；总消耗应为 85。

## 验收
- 两模板 65 关节、rest = bind，`normalize_rig.py --check`、`export_skeleton.py --check` 通过；雕塑门全过（翻面 0、二面角 ≤ 12°）；同口径 3D 颈宽 / 头宽：女 ≤ 0.50、男 ≤ 0.62；颈肩截图无折线、鼓包。
- 不改 cut_head.py 等其他脚本、不动 tpl_f_* 与已贴合素材。

## 约束
- 只写 `tools/model3d/dressup/{sculpt_neck.py,tests_sculpt.py}`、`assets/default/model3d/dressup/templates/{tpl_f2_medium,tpl_m_medium}/**`、上述男性两张素体图条目所在 `manifest.yaml` 与新图、`assets/default/model3d/dressup/credits_ledger.jsonl` 与本任务报告。
- 不输密码、不买点数、不点条款同意；生成 / 绑骨各只提交一次。

检查：
- `python3 tools/model3d/dressup/tests_sculpt.py`
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_f2_medium/body.glb`
- `python3 tools/model3d/dressup/normalize_rig.py --check --body assets/default/model3d/dressup/templates/tpl_m_medium/body.glb`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f2_medium`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_m_medium`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-t4b-neck-v3.md`（≤ 60 行）：雕塑方法与参数、平滑度指标（v2 / v3 对照）、两模板新旧颈宽 / 头宽、颈长、斜方肌坡度；男性 Tripo 项目 / op / 点数 / 封面质检；截图路径；交接（T5 派生改从这两个新中等模板起）。
