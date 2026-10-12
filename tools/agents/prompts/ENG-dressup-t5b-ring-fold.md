# 本任务：3D 纸娃娃换装 · T5b · 派生前置修复：颈环改按实际颈截面 + 派生防折叠 / 法线一致（只改工具与测试；0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 T5 任务书 `tools/agents/prompts/ENG-dressup-t5-bodies-v2-derive.md`（含补充裁定）、`tools/model3d/dressup/export_skeleton.py` 的 `find_neck_ring` / `derive_neck_ring` / `check_outputs`、`derive_template.py` 的 `_deformed` / `_solve_chains` / `derive`。

## 背景（协调者实测，2026-10-11；T5 审核 r1 要求先开本前置任务，T5 已停，待本任务合入后从新工具重派生）
- T5 四个派生模板颈环与源差 2.42 / 3.65 / 6.30 / 3.09 mm，过不了 tech/11 §10「派生颈环半径差 < 2 mm」。根因不在派生：`find_neck_ring` 只取切片里 Neck 权重 ≥ 0.5 的顶点拟椭圆，新模板颈根附近这些点常只成半圈弧，**同一模板**相邻 2 mm 高度的半径就跳 3–10 mm（tpl_f2_medium 在 Neck 局部 0.018 / 0.020 / 0.024 mu 处 x 半径 49.1 / 61.9 / 45.9 mm，0.024 处长短轴对调；tpl_m_bulk 取到的切片高度还从 0.016 跳到 0.014）。这同时会让切头的 `ring.scale`（头部按颈环归一）在各体型间漂移。旧记录：D1 审核 r8 已查出 neckRing.profile 与实际颈截面最大差 13.9 mm。
- 派生折叠：tpl_f2_small 派生后有 80 个三角几何法向与存储法向反向，其中 73 个相对源模板真的折翻了（腿缩 0.905 时腿—髋折痕里的小三角），单面材质下会露黑点；tall / lean / bulk 各 7 / 8 / 11 个未折翻，只是存储法向与几何不一致的细碎三角。

## 要做的事
1. `export_skeleton.py` 新增颈环模式 `--ring-mode section`（默认仍为旧模式，tpl_f_* 不重导、字节不变）：
   - 切面高度：Neck 局部系、垂直 Neck→Head 轴；源模板取 Neck→Head 距离的固定比例（实测选一个在颈柱段、截面周长随高度变化最平缓的比例，写成常量，报告给出依据）；派生模板加 `--ring-from <源 skeleton.json>`，按同一比例（随该模板自己的 Neck→Head 距离）取高度，不再逐体型搜索。
   - 截面：网格三角与切面精确求交得到闭合折线，取环绕颈轴的那一圈（含轴点、周长最小的闭环）；半径 = 对该闭环按弧长均匀重采样后的椭圆拟合；`profile` 64 点取闭环上的真实表面点（位置在颈表面上，法线 = 径向 + 上翘 15° 照旧，权重按该点所在三角重心插值的实际蒙皮权重截 4 根）。
   - `neckRing.mode: "section"`、`heightFraction`、`perimeterMm` 写进 skeleton.json；`--check` 对 section 模式核对：闭环闭合、profile 点到网格表面距离 < 0.5 mm、半径区间不放宽。
2. `derive_template.py` 加防折叠：派生后逐三角比较与源模板的几何法向，有翻向（点积 ≤ 0）就在折叠邻域（两环内）对位移场做约束式双调和平滑（可复用 `cut_head.biharmonic_displacement`，邻域外位移固定），迭代到翻向 0；derive.json 记录修复前后翻向数与最大修正量（mm）；`--check` / 门：翻向 0。存储法线按派生前后几何法线的最小旋转去转源法线（与 `sculpt_neck.py` 同法），使"几何法向 · 顶点法向和 < 0"的面为 0。
3. 实跑演示（只写临时目录、不改模板目录）：以本分支的 `templates/tpl_f2_medium`、`tpl_m_medium` 为源，按 T5 补充裁定第 2 条的 6 行规格（在临时目录写一份 `tianshu.dressup-template-specs.v1` 规格文件给 `derive_template.py --spec` 用；T5 的 `template_specs_v2.json` 尚未合入）派生 small / tall / lean / bulk 到临时目录，`export_skeleton --ring-mode section`（中等不带 `--ring-from`、派生带）后量：派生翻向数、负点积面数、颈环两轴半径差（mm）、比例误差、最大位移；六组数写进报告第 3 节。模板目录的正式重派生、重导出与截图由 T5 在本任务合入后完成。
4. 测试：`tests_skeleton.py` 补 section 模式合成用例（椭圆管：半径与闭环周长解析值误差 < 0.5%；偏心多弧截面取环绕轴的那一圈；比例高度随 Neck→Head 距离缩放），并补真实素材回归：tpl_f_medium / small / tall 用新代码默认模式重导出到临时目录，skeleton（去路径）/ 环 / 区域 / 颅形与提交版逐字节相同；`tests_derive.py` 补折叠用例（人为制造窄三角在强缩放下翻向 → 修复后 0，邻域外顶点不动），真实产物测试改为按 `templates/*/derive.json` 数据驱动发现（不再只硬编码 tpl_f_*），T5 落地的新派生模板自动纳入。

## 验收
- 实跑演示（第 3 条）：section 颈环 profile 全在颈表面（< 0.5 mm）；四个派生与源颈环两轴半径差都 < 2 mm；派生相对源翻向 0；"几何法向 · 顶点法向和 < 0"的面不多于源自身（源 89 / 67 个倒置面由 T5 的翻面工具处理，派生不得新增）；derive 原门禁（比例 ± 0.5%、位移上限）照旧通过。
- 现有模板目录六套（含 tpl_f_*）`normalize_rig.py --check`、`export_skeleton.py --check` 照旧通过。
- tpl_f_* 三模板与所有已贴合素材字节不变（旧模式回归：tpl_f_medium / small / tall 用新代码默认模式重导出与提交版逐字节相同）。

## 约束
- 只写 `tools/model3d/dressup/{export_skeleton.py,derive_template.py,tests_skeleton.py,tests_derive.py}` 与本任务报告；不改任何模板目录与素材。
- 0 点：不调 Tripo、不出图；不加依赖；不改门禁阈值；测试不写真实素材；不改 cut_head.py / fit_garment.py / validate.py（下游改用 section 环由后续重贴合任务处理）。

检查：
- `python3 tools/model3d/dressup/tests_skeleton.py`
- `python3 tools/model3d/dressup/tests_derive.py`
- `python3 tools/model3d/dressup/selftest.py`
- 现有模板 `export_skeleton.py --check`：tpl_f_medium、tpl_f_small、tpl_f_tall、tpl_f2_medium、tpl_m_medium
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-t5b-ring-fold.md`（≤ 60 行）：颈环高度比例的选法与依据（截面周长 / 半径随高度曲线）、section 与旧模式在六个模板上的半径对照、派生防折叠的算法与修复量、第 3 条演示的六组数；第 7 节写 T5 重派生要用的命令（`--ring-mode section`、`--ring-from`）。
