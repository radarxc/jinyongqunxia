# 本任务：3D 纸娃娃换装 · E2b · 劲装版型件清理（翻面 / 边长 / 贴合距离 + 衣物贴图皮肤色）→ 重打包 → 重烘遮罩 → 重生成布衣变体（AR-108 V2 / V3；协调者 2026-10-08 23:50）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§1 V2 / V3、§2 P2 / P3）、E2 / G1 / G1b / V3 / pack-compact 报告第 7 节，`tools/model3d/dressup/{extract_garment.py,fit_garment.py,validate.py,bake_hide_mask.py,retexture_variant.py,pack_glb.mjs}`。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。依赖：G1b（可见性遮罩 + holes 门禁）与 pack-compact（无损压缩未引用顶点）已合入。

## 背景
劲装（`garments/eq_jinzhuang`，E2 实验件）是"交领短衣到髋"版型的母版，量产 P3 的贴图变体都从它派生。G1 / G1b 之后遮罩与可见穿透已达标，但版型件本身仍有：
- 几何门未过：翻面 medium / small / tall = 309 / 84 / 126，边长合格率 88.5% / 97.7% / 96.9%，small close-fit P90 5.16 mm（G1 报告）；
- 衣物贴图胸口交领内侧残留皮肤色（V3 布衣上显成两块肤色斑，5173 实拍可见）；
- 打包未压缩未引用顶点（pack-compact 已修工具）。

## 要做的事
1. **定位畸变来源**：分别统计 E2 原始抽取、fit、G1 的 edge-weights 重贴合与推离各阶段后的翻面数 / 边长合格率，报告来源（不要猜）。
2. **先改权重（协调者 2026-10-09 05:00 加）**：G1b 查明劲装在动画中与身体整体穿插 `penetration.*.all` 9%~12%，根因多半是版型件主体沿用 Tripo 源权重。对三模板评估"整件改用模板身体权重转移（最近点 + 平滑，`fit_garment.py` 的权重源 B 全件版）"与现状（源 A + 开口 30 mm 模板带）的 idle / walk / run `penetration.*.all`，取更低者并写进报告；目标是 all 显著下降（< 3%），为后面的遮罩达标打底。
3. **从根上修**（`fit_garment.py` 为主，必要时 `extract_garment.py`）：在贴合 / 推离中加入防翻面与保形约束（例如每轮检测翻面三角并做局部拉普拉斯 / ARAP 式松弛、位移场平滑、步长回退），新增选项默认关闭、既有行为不变；对劲装三模板重跑，目标**翻面 0、边长合格率 ≥ 99%、close-fit P90 < 5 mm**，同时保持 G1b 口径下 `bindVertices.visible = 0`、`penetration.*.visible ≤ 2%`、`holes.* = 0`。
4. **衣物贴图皮肤色清理**：只对衣物网格实际引用的纹素，按 Lab 距离（相对源模型皮肤均值，阈值写明）找出皮肤色纹素，用同一 UV 岛内邻近布料颜色修补（不改 UV、不改几何）；报告清理前后皮肤色纹素占比（目标 < 0.1%）。
5. **重打包**：用 pack-compact 后的 `pack_glb.mjs` 打包三模板（输出不含未引用顶点）。
6. **重烘遮罩**：用 G1b 的可见性模式重烘三模板 `hidemask*.png`，重跑 `validate.py`，三模板 level 至少 `draft`（几何门、`penetration.*.visible ≤ 2%`、`holes ≤ 0.05%` 全过——这两项门禁由 G1b 转交本任务达成），manifest 同步（可去掉 `experimental`：只有三项门全过时）。
7. **重生成布衣变体**：用 `retexture_variant.py` 以新劲装为版型、原变体衣图为输入，重生成 `garments/eq_buyi/**` 与 `garments/eq_buyi_tex/**`，fit 引用同一张 `hideMask`（几何相同），重跑 validate；报告布衣变体皮肤色占比（应随版型清理降到 < 0.1%）。
8. **清理**：删除 `garments/eq_jinzhuang/` 下 G1b 留下的 `bake.*.log` 等非素材文件（日志放系统临时目录），manifest 只列真实交付文件。
9. **测试**：`tests_garment.py` 补防翻面约束的合成回归（一个会被旧推离折叠的薄片，新选项下翻面为 0）；贴图清理的合成回归（皮肤色纹素被布料色替换、非衣物纹素不动）。

## 约束
- 只写 `tools/model3d/dressup/{fit_garment.py,tests_garment.py,extract_garment.py}`、`assets/default/model3d/dressup/garments/{eq_jinzhuang,eq_buyi,eq_buyi_tex}/**` 与本任务报告。
- 不改运行时、不改 validate / bake_hide_mask / retexture_variant / pack_glb 的门禁阈值与输出格式；不加依赖；**不花 Tripo 点数**。

检查：
- `python3 tools/model3d/dressup/tests_garment.py`
- `python3 tools/model3d/dressup/tests_hidemask.py`
- `python3 tools/model3d/dressup/tests_variant.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-e2b-cleanup.md`：第 3 节写畸变来源定位、三模板修复前后几何门数字、皮肤色清理前后占比、遮罩 holes / penetration、布衣变体数字与 level；第 7 节写给量产 P2 / P3：新的贴合选项与默认参数。报告 ≤ 50 行。

## 协调者裁定（2026-10-09 11:10）
`tests_garment.py` 的 `test_fixture_strict_fit` / `test_file_nonidentity_refit` 会按当前模板正本重生成 `garments/_fixture_bodysuit/**`（A6 修正了模板 `skeleton.json` 的插槽坐标系，夹具里记的 `skeletonSha256` 已过期，`elapsedSec` / `peakMemoryMiB` 每次也会变）。这些文件的变化是既有测试的副产物，已加入本任务写集：保留测试重生成的结果，不要还原、不要手改；审核不因此判写集越界。

## 协调者说明（2026-10-09 18:50）
traex 三次运行均在单次 200 分钟上限处被停。按作者指示（「这个你自己来跑吧」）与 AR-110，本任务由 Claude 直接收尾：在第三次运行留下的代码与产物上继续，仍走四条检查、`pnpm check` 与 GPT 审核。

## 协调者裁定（2026-10-09 22:00，Claude 收尾时查明）
1. **推离改用新选项** `fit_garment.py --push-mode volume`：体表位移场（交领等叠层整体平移，不再各推各的而互穿）+ 限拉伸垂坠（投影动力学弹簧，胸下的布被带向前形成垂坠）+ 伪法向符号；默认仍为 `vertex`，既有行为不变。劲装三模板用新选项、权重 B（整件模板权重）、贴图肤色清理。
2. **减面顺序**：全分辨率贴合后再 `pack_glb.mjs --simplify 0.25 --no-meshopt` 减面，新增 `untangle_glb.py` 对减面器留下的少量细长翻面三角做局部翻边（只改索引、不动顶点），再 `pack_glb.mjs` 压缩。先减面再贴合时粗网格上推离不收敛（实测体内残留 50–74 点、边长合格率 97%），弃用。
3. **validate 两处测量修正**（加入写集；阈值与输出格式不变）：
   - 衣物 / 发型按 `tianshuSourceVertexAccessor` 回指真实源（与道具同口径）。此前衣物分支不认压紧映射，traex 把 fit.source 指向产出本身（`extract_run/eq_jinzhuang_clean*.glb`）以对上顶点数——这些文件删除，fit.source 恢复为 `extract_run/eq_jinzhuang_raw_skinned.glb`；
   - A1 判为穿入的点在封闭身体上再用射线奇偶复核：模板三体型各有 26–31 个与着色法向相反的面（胸下 Spine1 7–8 个），A1（重心插值顶点法向定符号）在其附近把体外 22–49 mm 的胸下垂坠点判成体内，射线奇偶与伪法向一致判为体外。复核只去掉假穿透；开口网格保持 A1 口径。回归在 `tests_garment.py`。
4. **动画穿插拆给 E2c**（`ENG-dressup-e2c-skinning`）：idle / walk 可见穿透超 2% 与 run holes 超 0.05%，伪法向确认是真穿入（垂手时宽袖碰髋 / 大腿 9–28 mm、下摆碰大腿），属 LBS 蒙皮问题，需按姿势优化权重。本任务三模板 level 如实（预计 fail），manifest 保持 experimental；第 2 条 A / B 权重对比照做并写进报告。
5. 写集追加 `tools/model3d/dressup/{validate.py,untangle_glb.py}`；检查不变。
