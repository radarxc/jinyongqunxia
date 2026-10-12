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

## 补充裁定（2026-10-11，T4b 颈肩改版之后，协调者）
1. **源模板换成 T4b 定稿的两个中等模板**（作者 10-11「男女脖子都太粗……参考逆水寒」；女按平滑雕塑 v3 定稿、男按新素体图重生成）：
   - 女 `tpl_f2_medium`：雕塑并转 unlit 后 body sha256 `e528b178bfb8070da36ea7f382aa9aa6ca64560cd312d04d281c832b8e8d733e`，heightMu 0.98834302、mPerMu 1.67957882（1.66 m），实测髋比 0.5362、肩比 0.1703，倒置面 89。
   - 男 `tpl_m_medium`：新 Tripo 项目 `11c688eb-…`，转 unlit 后 body sha256 `d9db6f2d86979df28bf082e965eacfbe067ba5407e6754ddfd8d70211471b65d`，heightMu 0.97924826、mPerMu 1.84835662（1.81 m），实测髋比 0.5684、肩比 0.1953，倒置面 67（后脑偏下 1 处在单面材质下露小黑点；面序号与 T4 版不同，按裁定 2 的口径重新找）。
2. **规格表按新中等实测重算**（体型间差值不变），替换裁定 1 的表：
   | id | heightM | hipsRatio | shoulderRatio | source |
   |---|---|---|---|---|
   | tpl_f2_small | 1.58 | 0.516 | 0.164 | tpl_f2_medium |
   | tpl_f2_medium | 1.66 | 0.536 | 0.170 | tpl_f2_medium |
   | tpl_f2_tall | 1.72 | 0.556 | 0.174 | tpl_f2_medium |
   | tpl_m_lean | 1.76 | 0.563 | 0.190 | tpl_m_medium |
   | tpl_m_medium | 1.81 | 0.568 | 0.195 | tpl_m_medium |
   | tpl_m_bulk | 1.86 | 0.553 | 0.210 | tpl_m_medium |
3. `export_skeleton.py` 在 T4b 已改取颈环规则（多段 Neck 主导近圆切片时优先取两轴半径都在 0.025–0.045 mu 内的一段，`--check` 不放宽）；上次 tpl_m_bulk 颈环半径越界即此问题。本任务仍不改它；派生后若仍越界，写进报告第 4 节并停在该模板。
4. 上次（运行 1–2）在旧模板上做的派生、翻正与截图全部作废：从含 T4b 的新基点重做，工作区里旧产物不得沿用。
5. 两个中等模板在 T4b 已按 tech/11 转 `KHR_materials_unlit`、只留 baseColor；派生模板沿用（`derive_template.py` 不改材质），manifest 照抄 `unlit` 说明即可。
6. 新男模头顶偏后有一条细浅色贴图缝（T4b 报告第 3 节）：贴图问题，不在本任务范围，只在报告第 4 节记一句。

## 补充裁定（2026-10-11，T5b 合入之后，协调者）
1. 审核 r1 的两项不通过（派生颈环差 2.4–6.3 mm、派生翻向 / 负点积面）已由前置任务 T5b（`ENG-dressup-t5b-ring-fold`，已合入）从工具上修好：`export_skeleton.py --ring-mode section`（按实际颈截面、Neck→Head 骨段 15% 高度）与 `--ring-from <源 skeleton.json>`（派生继承源的高度比例）；`derive_template.py` 自带防折叠（两环双调和平滑）与法线最小旋转，`--check` 要求相对源翻向 0、不新增负点积面。
2. 六模板一律用 section 颈环：两个中等 `export_skeleton.py --ring-mode section`（不带 `--ring-from`），四个派生 `--ring-mode section --ring-from` 对应中等的 skeleton.json；命令序列见 `tools/agents/reports/ENG-dressup-t5b-ring-fold.md` 第 7 节。旧 `tpl_f_*` 不动（仍是默认旧模式）。
3. 验收按 section 颈环口径：四派生与源两轴半径差 < 2 mm；六模板 `fix_inverted_faces.py --check` 全部退出 0（中等先按原第 2 条翻正，派生从翻正后的中等派生、不得新增）；derive `--check` 通过；其余原验收照旧。T5b 演示里女颈短半径约 0.02512 mu（下限 0.025）、男截面长宽比约 1.28（上限 1.3），余量都很小：若 `--check` 因此不过，如实报告、不放宽、不改工具。
4. 上一轮（运行 1–2）的派生目录、截图、预览、报告全部按新工具重做；两个中等翻正后的 body 可沿用（只需按 section 重导出 skeleton 并刷新 manifest 里的 ringSha / skeletonSha）。

## 补充裁定（2026-10-11 18:50，协调者）
5. `tests_derive.py:234` 的"脚底差必须 > 1e-3 mu"会把腿长缩放≈1 的合法派生（tpl_m_bulk，k_leg 0.99983，脚底只动 8.2e-5 mu）误判为整体平移；其余三条已直接堵住整体平移（Hips bind 不变、Hips 平移轨 = 源 × k_leg、无 rootOffset）。准许本任务改 `tools/model3d/dressup/tests_derive.py`（已加进写集）：采用执行器上一轮的候选补丁（按声明分骨缩放重算 LBS + 防折叠，派生顶点须逐位相等；补近单位腿长与平移反例的合成用例），只换掉这一条启发式，其余断言不动。
6. 补丁与说明不得留在素材目录：`templates/tpl_m_bulk/tests_derive.floor-regression.patch`、`validation.floor-regression.json` 应用后删除，结论写进报告。
