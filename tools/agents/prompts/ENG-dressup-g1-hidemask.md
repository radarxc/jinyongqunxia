# 本任务：3D 纸娃娃换装 · G1 · 身体遮罩（UV hide mask）离线烘焙 + validate 可见穿透口径（AR-102 / AR-108 V2）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V2、§2 P2）、`docs/tech/11-paper-doll-3d-impl-spec.md`（§4、§5.3、§6、§11）、A4 / A5 / E2 / E3 报告第 7 节，现有 `fit_garment.py`、`validate.py`、`bake_texture_layer.py`（UV 光栅化与射线求交可复用其做法）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12），与 `_code.md` 的 Node 24 / pnpm 12 不同不算偏离。

## 作者要求
**AR-108**：「重点是要把衣服匹配上」；量产前先验证（闸门 V2：衣服在三套模板 idle / walk / run 下无可见穿模、无黑洞）。协调者 5173 实测（AR-106）：按 17 区整块隐藏身体太粗——交领开口与衣摆下方本应露皮肤的地方出现黑洞；不隐藏又会从衣服里穿出皮肤。业界通用做法是**按衣服覆盖范围逐纹素隐藏身体**：衣服盖住的身体不画（看不见就谈不上穿模），只在开口（领口、袖口、衣摆）附近保留皮肤。

## 要做的事
1. **`tools/model3d/dressup/bake_hide_mask.py --body <模板 body.glb> --skeleton <skeleton.json> --garment <贴合后 glb> --fit <fit.json> --out <dir> [--size 1024] [--max-distance-mm 40] [--opening-margin-mm 15] [--json]`**：
   - 在模板 UV 空间光栅化身体三角（纹素 → bind 位置与法线；glTF UV 约定），从每个纹素沿 +n 发射射线（起点 `p − 2 mm·n`，射程 `--max-distance-mm`）求与贴合后衣物（bind 姿态）的交点：命中即"被覆盖"。
   - **开口留边**：找衣物网格的边界环（领口 / 袖口 / 衣摆等开口），身体纹素的 bind 位置到任一开口边界的距离 < `--opening-margin-mm` 的不隐藏（让开口附近始终是"衣服边缘盖在皮肤上"，转动时不露缝）；`neverHide` 区域（手、脚、头、颈环带）恒不隐藏。
   - 形态学：先闭后开（去孤点、补小洞，半径 2 px），**跨 UV 岛一致**（判定在 3D 上做、按纹素插值，参照 E3 第 2 轮的做法）；对 UV 岛外 gutter 扩边 ≥ 4 px。
   - 输出 `<out>/hidemask.png`（L 8 位，与模板 baseColor 同 UV，白 = 隐藏）与 fit.json 新字段 `hideMask: { file, size, coveredRatio, marginMm, maxDistanceMm }`；三模板（`fits`）各自一张（`hidemask.<tpl>.png`），共 UV。
   - 质检图 `hidemask_preview.png`：模板正 / 背视软光栅，被隐藏区域标色叠加衣服轮廓。
2. **`validate.py` 可见穿透口径**（只追加，不改既有阈值与字段语义）：fit.json 有 `hideMask` 时，动态 / 静态穿透只统计"最近体表点处遮罩值 < 0.5（未隐藏）"的装备顶点，产出 `penetration.*.visible`（门禁用这一组）；原全身口径保留为 `penetration.*.all`（只报不判）。没有 `hideMask` 的件行为完全不变。补测试。
3. **对劲装实跑**：对 `garments/eq_jinzhuang/`（E2 实验件，三模板）各烘一张遮罩、写回 fit.json，重跑 `validate.py`，manifest 按新 report.level 更新（若升为 draft / approved，`gateLevel` 同步，`experimental` 保留）。
4. **测试** `tools/model3d/dressup/tests_hidemask.py`：合成"圆柱身体 + 袖筒"：袖筒覆盖段被隐藏、开口 15 mm 内不隐藏、neverHide 区不隐藏、跨 UV 岛一致；validate 可见穿透只计未隐藏处。测试只写临时目录，不得写真实 `assets/`。

## 协调者实测意见（第 1 轮，2026-10-08 15:15；返修必须照做，审核按此判定）
第 1 次运行遮罩覆盖 44%，劲装可见穿透 idle / walk / run = 3.0% / 2.9% / 4.8%（全身口径 8.9% / 10.0% / 9.3%），静态可见残留 111，仍 fail。`hidemask_preview.png` 显示：袖与后背遮得完整，但**正面躯干在衣服轮廓内留下大片未遮的皮肤岛**（胸、腹、胯），穿透主要出在这里。原因与改法：
1. **覆盖射线太单一**：交领叠襟、腰带结、衣摆离体表可达 50 mm 以上，单法线 40 mm 打不到。改为法线 + 8 个斜向（与法线夹 25°），射程 80 mm，任一命中即"覆盖"。
2. **开口留边判据错了**：现在按"身体点到任一开口边界 < 15 mm"留皮肤，交领外襟的自由边斜穿胸口，于是整条都留了出来——而它下面还有内襟盖着。改为：只有**首个命中点（离身体最近的衣物层）距其所在开口边界 < 15 mm** 时才留皮肤；首个命中点远离边界（被内层盖住）就隐藏。
3. 衣服轮廓内被隐藏纹素围住的小块未遮岛（< 400 px²）填为隐藏；形态学闭运算半径 4 px，跨 UV 岛一致。
4. **开口处贴身权重**：领口 / 袖口 / 衣摆 30 mm 带内的衣物顶点改用模板权重转移（B），向内按距离渐变回源权重（A），使衣边随身体同步；本任务写集加入 `fit_garment.py` / `tests_garment.py`，只追加 `--edge-weights template --edge-band-mm 30` 选项（默认关闭，既有行为不变）并补测试；对劲装三模板重跑贴合 → 遮罩 → validate。
5. 目标：三模板 idle / walk / run **可见穿透 ≤ 2%**（draft），静态可见残留 0；做不到时报告逐区（领 / 袖 / 摆 / 躯干）列出剩余穿透来源。

## 约束
- 只写 `tools/model3d/dressup/{bake_hide_mask.py,tests_hidemask.py,validate.py,fit_garment.py,tests_garment.py}`（`fit_garment.py` / `tests_garment.py` 只追加 `--edge-weights` 选项与测试）、`garments/eq_jinzhuang/**`（只加遮罩文件、改 fit / report / manifest）与本任务报告；`validate.py` 只追加可见穿透分支。
- 不改运行时（遮罩在运行时的使用由 B4 负责：格式即上文 `hidemask.png` 白 = 隐藏、与 baseColor 同 UV）；不加依赖；不改门禁阈值；不花点数。

检查：
- `python3 tools/model3d/dressup/tests_hidemask.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：三模板遮罩覆盖率、开口留边、劲装 visible / all 两组穿透数字（idle / walk / run）与新 level、耗时；第 7 节写给 B4（运行时）与 P2 量产的接口。报告 ≤ 50 行。
