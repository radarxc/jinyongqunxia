# 本任务：3D 纸娃娃换装 · T5 · 新素体 tpl_f2 / tpl_m 准备：倒置面翻正 + 三体型派生（女 small / tall，男 lean / bulk；0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/10-paper-doll-3d.md` §1.1–§1.3（三模板与路 A）、`docs/tech/11-paper-doll-3d-impl-spec.md` §10.T、T3 报告 `tools/agents/reports/ENG-dressup-t3-derive.md`、T4 报告 `tools/agents/reports/ART-dressup-t4-bodies-v2.md`（第 3、4 节）、E2c 报告第 20 行起"模板倒置面两条路"。

## 作者要求
- 2026-10-11：「基础素体要更美观，现在的素体斜方肌太明显了……要做一套很好看的女性素体，和一套很帅气的男性素体。」作者在 2D 候选里选定了现在 T4 生成的两具素体（女：颈长、斜方肌低平、一字肩；男：一字平肩、宽肩窄腰、长腿）。
- AR-104：模板路 A——中等一次生成，其余体型由分骨长度缩放 + LBS 派生（0 点、共拓扑）；女 1.58 / 1.66 / 1.72 m，男 精悍 1.76 / 中等 1.81 / 魁梧 1.86 m。

## 协调者裁定（本任务口径）
1. **规格以新中等实测为基准**：旧 `template_specs.json` 的女中等肩比 0.156、男中等髋比 0.540 是旧素体时的设定，按它派生会把作者选中的一字肩、长腿改回去。新建 `tools/model3d/dressup/template_specs_v2.json`（schema 与旧表相同，6 行），比例 = 新中等实测（`derive_template.metrics` 口径）+ tech/10 原有体型间差值：
   | id | heightM | hipsRatio | shoulderRatio | source |
   |---|---|---|---|---|
   | tpl_f2_small | 1.58 | 0.521 | 0.166 | tpl_f2_medium |
   | tpl_f2_medium | 1.66 | 0.541 | 0.172 | tpl_f2_medium |
   | tpl_f2_tall | 1.72 | 0.561 | 0.176 | tpl_f2_medium |
   | tpl_m_lean | 1.76 | 0.567 | 0.186 | tpl_m_medium |
   | tpl_m_medium | 1.81 | 0.572 | 0.191 | tpl_m_medium |
   | tpl_m_bulk | 1.86 | 0.557 | 0.206 | tpl_m_medium |
   中等两行只作身高基准，不对中等本身做派生；旧 `template_specs.json` 与 tpl_f_* 三模板一律不动。
2. **先翻正倒置面再派生**：倒置面按 E2c 口径（三角几何法向与三顶点存储法向之和点积 < 0）。新模板还没有任何 fit 引用，此时翻正成本最低；男性后脑那个倒置面在单面材质下露成小黑三角（T4 第 3 节，面 128656），翻正后应消失。只交换三角索引顺序，不动顶点、法线、UV、权重、贴图与骨架。
3. `export_skeleton.py` 一律带 `--default-height-m`（按上表 heightM）；脚本默认 1.65 会把 mPerMu 算错（T4 补充裁定 2）。

## 要做的事
1. 新工具 `tools/model3d/dressup/fix_inverted_faces.py --body <glb> --out <glb> [--check] [--json]`：读 GLB，按裁定 2 找倒置面并翻正（交换第 2、3 个索引），写回；`--check` 只统计、有倒置面退出 1；JSON 输出翻正数、面索引列表（前 50 个）、各面中心 y 分布、输入 / 输出 sha256。要求幂等（二次运行翻正 0）、单 mesh / 多 primitive 都能处理、不改除索引外的任何 accessor 字节。配 `tests_fix_faces.py`（合成四面体 / 立方体：翻一个面→修回；幂等；`--check` 退出码；顶点 / 法线 / UV 字节不变）。
2. 对 `templates/tpl_f2_medium/body.glb`、`templates/tpl_m_medium/body.glb` 原地翻正，然后各重跑 `normalize_rig.py --check` 与 `export_skeleton.py --body … --out … --default-height-m 1.66 / 1.81 --json`；更新两份模板 manifest 的 `sha256` / `size_bytes` / `skeletonSha` / `ringSha` / `skullProfileSha` / `regionsSha`，加 `invertedFacesFixed: {count, tool, sourceSha256}`，notes 里删去"后脑小黑三角"一句并写明已翻正。
3. 写 `template_specs_v2.json`（裁定 1 的表）；用现有 `derive_template.py --from <翻正后的中等 body.glb> --spec tools/model3d/dressup/template_specs_v2.json --id <id> --out templates/<id>` 派生 `tpl_f2_small`、`tpl_f2_tall`、`tpl_m_lean`、`tpl_m_bulk`；各跑 `export_skeleton.py`（带身高）；各写 `manifest.yaml`（照 `templates/tpl_f_tall/manifest.yaml` 字段：kind dressup-template、gender、archetype、derivedFrom{template, file, sha256}、heightM、heightMu、heightRatio、mPerMu、hipsRatio、shoulderRatio、skeleton / ring / regions / skull SHA、derive / deriveSha、sha256、size_bytes、vertices、triangles、joints、status candidate、notes）。
4. 每个派生模板出一张 `preview.png`（5173 `/character-3d` 或无头渲染均可，正面全身 bind，长边 ≤ 1024，RGB），并在 5173 实拍一张六模板并排 bind 正面 + walk 帧拼图放 `templates/tpl_f2_medium/shots/derive.six_templates.jpg`（只在 manifest `shots` 列出）。

## 验收
- 翻正后两个中等模板倒置面 0（`fix_inverted_faces.py --check` 退出 0）；男性后脑在 bind / walk / run 实拍不再露黑三角（截图）。
- 4 个派生模板：derive 门禁全过（比例误差 ≤ 0.005、位移门禁照 T3 修订口径）；65 关节、rest=bind，`normalize_rig.py --check`、`export_skeleton.py --check` 通过；颈环半径与源差 < 2 mm。
- 不改旧 `template_specs.json`、`derive_template.py`、`normalize_rig.py`、`export_skeleton.py`、基础库与任何 tpl_f_* 文件；发现脚本 bug 写进报告第 4 节。

## 约束
- 只写 `tools/model3d/dressup/{fix_inverted_faces.py,tests_fix_faces.py,template_specs_v2.json}`、`assets/default/model3d/dressup/templates/{tpl_f2_medium,tpl_f2_small,tpl_f2_tall,tpl_m_medium,tpl_m_lean,tpl_m_bulk}/**` 与本任务报告。
- 0 点：不调 Tripo、不出图；不加依赖；不写死绝对路径；测试不写真实素材。

检查：
- `python3 tools/model3d/dressup/tests_fix_faces.py`
- `python3 tools/model3d/dressup/fix_inverted_faces.py --check --body assets/default/model3d/dressup/templates/tpl_f2_medium/body.glb`
- `python3 tools/model3d/dressup/fix_inverted_faces.py --check --body assets/default/model3d/dressup/templates/tpl_m_medium/body.glb`
- 6 个模板各 `normalize_rig.py --check --body …/body.glb` 与 `export_skeleton.py --check --out …`
- `python3 tools/model3d/dressup/tests_derive.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-t5-bodies-v2-derive.md`（≤ 60 行）：翻正数与位置分布、翻正前后 SHA；4 个派生的各链 k 值、实测身高 / 髋比 / 肩比与规格误差、最大顶点位移、颈环半径差；六模板并排截图；第 7 节写后续"衣物 / 头 / 道具在 tpl_f2_* 上重贴合 + 切换默认模板"的交接（命令、输入 SHA）。
