# 本任务：3D 纸娃娃换装 · T6 · tpl_f2 女素体插槽修正（腰 / 胸）：export_skeleton 加 `--socket-mode waist-band`，重导 tpl_f2 三体型 skeleton（0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。

## 背景（协调者 10-12 实测）
- R2 把四件道具贴到 tpl_f2_medium 后实拍：佩剑（青锋剑，`waistL`）飘在臀后约 25 cm，玉佩（`chest`）挂到右胸；旧素体 tpl_f_medium 上同一批道具正常。
- 根因在模板插槽：`export_skeleton.derive_sockets` 的腰插槽取"Spine 权重 ≥ 0.5、Spine 壳 70% 分位高度 ±0.008 mu"一带里沿 ±X / −Z 的极点。tpl_f2（Tripo 绑骨）在该高度 Spine 权重只覆盖后背，左右腰点落到后腰（tpl_f2_medium `waistL` 世界坐标 (0.077, 1.025, −0.037) m、法线 (0.22, 0.40, −0.89)，朝后）；该高度又正在臀部上缘，后腰点法线几乎朝上。胸插槽取 Spine2 带最前点，大胸型落到右胸（x = −0.084 m），tpl_f / tpl_m 都在左侧（+0.066 / +0.042）。
- tpl_f_* 与 tpl_m_* 三套的插槽都正常（腰点在腰侧、法线朝外）；握持插槽 gripR / gripL 在 tpl_f2 上实拍 60° 握剑正常，不改。

## 要做的事
1. `tools/model3d/dressup/export_skeleton.py` 加 `--socket-mode {legacy,waist-band}`（默认 legacy，现有九套 skeleton 逐字节不变）。waist-band 只改腰与胸，其余插槽、颈环、区域、颅形、fingerPose 与 legacy 完全相同：
   - 腰高 = bind 世界系下 Hips 关节高到 Spine2 关节高之间、躯干区域（regions 的 torsoUpper / torsoLower / hips；三角三顶点都在这些区域）水平截面凸包周长最小的高度（自然腰线），步长 2 mm（按 mPerMu 换算），最小值离两端都须 ≥ 10 mm，否则报 SkeletonError；
   - 腰带 = 躯干区域顶点中离腰高 ±0.008 mu（与 legacy 同宽）的点；waistL / waistR / waistBack 沿 +X / −X / −Z 取极点，法线沿用 `_surface_vertex`；
   - chest 沿用 legacy 的 Spine2 带，但只在 x ≥ 0（角色左手侧）里取最前点；back 不变；
   - skeleton.json 记 `"socketMode": "waist-band"`（legacy 不写此字段），`--check` 按记录的模式重导并逐项核对。
2. 重导 `templates/tpl_f2_{medium,tall,small}/skeleton.json`：参数与 T5 相同（`--ring-mode section`，tall / small 带 `--ring-from templates/tpl_f2_medium/skeleton.json`，`--default-height-m` 1.66 / 1.72 / 1.58），另加 `--socket-mode waist-band`。逐项核对只有 `sockets` 的腰 / 胸条目与 `socketMode` 变化，neckRing、regions、skullProfile、fingerPose、bindWorld 等逐字节不变；更新三份模板 manifest 里的 skeleton 摘要。
3. `tools/model3d/dressup/tests_skeleton.py` 补合成用例：A 字臂垂到腰侧、Spine 权重只在后背时，legacy 腰点落到后背而 waist-band 落在腰侧、法线朝外；大胸右侧更靠前时 chest 仍取左侧；legacy 输出逐字节不变。

## 验收
- 协调者原型给出的预期（tpl_f2_medium）：自然腰线约 1.072 m（周长 55.0 cm）；waistL ≈ (0.099, 1.059, 0.025) m、法线 ≈ (0.95, 0.29, −0.08)；waistR ≈ (−0.098, 1.061, 0.023) m；waistBack ≈ (0.029, 1.085, −0.045) m、法线 ≈ (−0.02, −0.11, −0.99)；chest ≈ (0.085, 1.228, 0.147) m。tall / small 应同量级（腰高约 1.070 m）。实算与此差 > 5 mm 要在报告里解释。
- 九套模板 `export_skeleton.py --check` 全过；tpl_f_* / tpl_m_* 产物逐字节不变。
- 已合入的 tpl_f2 头（黄蓉 / 穆念慈 × 三体型）仍全过（`tests_head.py` 真实素材复算）。

## 约束
- 只写 `tools/model3d/dressup/export_skeleton.py`、`tools/model3d/dressup/tests_skeleton.py`、`assets/default/model3d/dressup/templates/tpl_f2_{medium,tall,small}/**` 与本任务报告。
- 不改 body.glb、颈环、区域、颅形、握持插槽；不改 tpl_f_* / tpl_m_*；不改门禁阈值；0 点。

检查：
- `python3 tools/model3d/dressup/tests_skeleton.py`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/<九套各一次>`
- `python3 tools/model3d/dressup/tests_head.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-t6-sockets-f2.md`（≤ 60 行）：三体型腰高 / 周长、五个插槽新旧世界坐标与法线对照、逐字节不变核对结果；第 7 节交接给 R2（道具在新插槽上重做）。
