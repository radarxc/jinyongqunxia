# 本任务：3D 纸娃娃换装 · R2 · 现有衣物 / 贴图层 / 道具重贴合到新女素体 tpl_f2 三体型 + 换装页默认素体切到 tpl_f2_medium（0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。

## 背景
- 作者 10-11 定新素体（T4b / T5：`templates/tpl_f2_{small,medium,tall}`，1.58 / 1.66 / 1.72 m；男 `tpl_m_*` 暂无衣物与头）。
- R1 已把黄蓉 / 穆念慈头切到 tpl_f2 三体型；换装页变体只在同一套素体（tpl_f / tpl_f2 / tpl_m）内回退，同一套里没有变体的素材不出现（`apps/game/src/pages/useDressupIndex.ts`）。
- 现有衣物 `eq_jinzhuang`（劲装，版型）、`eq_buyi`（布衣，劲装的贴图变体）、贴图层 `eq_jinzhuang_tex` / `eq_buyi_tex`、道具 `eq_longquanjian` / `item_bamboo_hat` / `item_qingfeng_sword` / `luxury_jade_pendant` 只贴合过 tpl_f_*，在 tpl_f2 上全部不出现。

## 要做的事（按顺序；先 medium，再 tall / small）
1. 劲装 × tpl_f2_medium / tall / small：按 `docs/tech/12-dressup-production.md` §2 P2 步骤 4–8 逐模板全分辨率贴合（E2b 起不用 `refit_template.py` 派生），再按 E2c 报告第 5 节 E2c-P1 补姿势蒙皮：
   - `fit_garment.py --body templates/<tpl>/body.glb --skeleton templates/<tpl>/skeleton.json --garment garments/eq_jinzhuang/extract_run/eq_jinzhuang_raw_skinned.glb --id eq_jinzhuang --out <临时目录> --align joints --weight-source template --weight-smooth-rounds 3 --clean-skin-texture --push-mm 3 --preserve-shape --push-mode volume --allow-draft`（参数与 tpl_f 交付件一致；先对照 `garments/eq_jinzhuang/fit.json` 的 `pushOut` / `spring` / `textureCleanup` / `weights` 记录核对，不一致按记录走并在报告说明）。
   - `pack_glb.mjs --simplify 0.25 --no-meshopt` → `untangle_glb.py`（退出码 2 = 仍有翻面，不得继续）→ 先烘一版可见性遮罩 → `fit_garment.py --pose-skin --arm-abduction-deg 6 --pose-skin-mask <该遮罩> --fit <fit.json>`（输入为未压缩交付网格）→ `pack_glb.mjs` 压缩 → 按外展重烘 `bake_hide_mask.py --mode visibility --views 128 --frames-per-clip 6 --depth-size 256 --size 1024` → `validate.py --level draft`。
   - 入库：`ingest.py garment eq_jinzhuang --template <tpl> --slot body --item eq_jinzhuang --src <目录>`，产物带 `.tpl_f2_*` 后缀登记进 `garments/eq_jinzhuang/manifest.yaml` 的 `fits`（主模板仍是 tpl_f_medium）。ingest 只写 file / fit / report / status；`fits` 条目要补齐与现有 tpl_f 条目相同的字段（hideMask、gateLevel、sha256、size_bytes、triangles），遮罩、预览随变体同名加后缀。
2. 布衣 × tpl_f2 三体型：按 P3 步骤 2–5，以第 1 步的 tpl_f2 劲装为版型（`pack_glb.mjs --no-meshopt` 出未压缩副本 → `variant_base.py` → `retexture_variant.py` → `pack_glb.mjs` → 把版型同名遮罩复制进 `garments/eq_buyi/`（构建不允许跨目录引用）→ `validate.py --level draft` → `ingest.py garment eq_buyi … --template <tpl>`）。
3. 贴图层：`bake_texture_layer.py` 以第 1 / 2 步 tpl_f2_medium 交付件为 `--dressed`、`--body` / `--skeleton` 取 tpl_f2_medium，重烘 `eq_jinzhuang_tex` / `eq_buyi_tex` 在 tpl_f2 UV 上的层；先逐位核对 tpl_f2_small / tall 与 medium 的索引、UV 相同，再把同一张层图登记为三体型的 `fits`（tpl_f 原层文件与记录不动）。
4. 道具 × tpl_f2_medium：四件各用 `fit.json.source` 记录的原始件（`apps/game/public/models/props/<id>_raw.glb`，在主检出本地素材库，sha256 已核对一致）与原参数（`class` / `realSizeM` / `sizeAxis` / `restTiltDeg` / `sheathed` 等，从现有 fit.json 读）跑 `normalize_prop.py --skeleton templates/tpl_f2_medium/skeleton.json`，再按 P1 步骤 5–7（贴图与打包、`validate.py`、`check_sockets.py --template templates/tpl_f2_medium`、`ingest.py prop <id> --template tpl_f2_medium`）。tpl_f2 tall / small 靠同套回退用 medium 变体；另对 tall / small 各跑一次 `check_sockets.py` 只报告。注意 `check_sockets.py` 会改写所在目录的 `fit.json`（兵器选待机倾角 / 鞘角、gripAdjust）、`sockets_check.json`，有 manifest 时还改其中全部 `fits` 的 status：只对临时目录（只放本次 tpl_f2 产物、不放 manifest）跑，且排在 `validate.py` / `ingest.py` 之前（否则 report.inputs 与 fit 摘要对不上）；结果另存 `sockets_check.tpl_f2_medium.json`，`fits` 条目 status 按 validate + sockets 联合口径（与 tpl_f 主记录同法）。绝不对已入库的道具目录直接跑。
5. `tests_garment.py`：只把交付件枚举（`test_delivered_variant_skin_provenance`、`test_delivered_garments_dynamic_topology`）扩到 tpl_f2 三体型，阈值与断言不改。
6. 以上全部门禁通过后，`apps/game/src/pages/Character3dPage.vue` 把换装页默认模板从 `tpl_f_medium` 改为 `tpl_f2_medium`（初值与首次加载处一并改），tpl_f / tpl_m 仍可手动切换。

## 验收
- 劲装 / 布衣 × tpl_f2 三体型：`validate.py --level draft` 全过（可见穿透 idle / walk / run ≤ 2%、holes ≤ 0.05%、bind 0、翻面 0）；72 帧最大边伸长 ≤ 30 mm（`tests_garment` 动态拓扑门）；布衣肤色按来源 < 0.1%。
- 两个贴图层在 tpl_f2 上烘出、预览图无大片空白 / 错位；三体型登记。
- 四件道具 tpl_f2_medium 的 `validate` 与 `check_sockets` 均 approved 或 draft。
- 已有 tpl_f_* 产物与记录逐字节不变；头目录不动。
- 换装页默认打开 tpl_f2_medium；tpl_f2 三体型上衣物 / 贴图层 / 道具 / 头都能装，tpl_f 照常。运行时截图由协调者在审核前用 dev 服务实拍补进 `garments/eq_jinzhuang/shots/r2.tpl_f2_*.jpg`，执行者交各步预览图即可。

## 约束
- 只写 `assets/default/model3d/dressup/garments/{eq_jinzhuang,eq_buyi,eq_jinzhuang_tex,eq_buyi_tex}/**`、`assets/default/model3d/dressup/props/{eq_longquanjian,item_bamboo_hat,item_qingfeng_sword,luxury_jade_pendant}/**`、`tools/model3d/dressup/tests_garment.py`（只扩枚举）、`apps/game/src/pages/Character3dPage.vue`（只改默认模板）与本任务报告。
- 不改任何工具、门禁阈值、模板；工具在 tpl_f2 上跑不通或门禁不过时如实停下写报告交回协调者，不许改度量、改测试、手改 report / fit 过门。
- 0 点：不调 Tripo、不生成新模型。
- 已知坑（E2b / E2c）：先全分辨率贴合再减面、翻边（倒过来不收敛）；肤色清理按交付 JPEG 解码复测；`retexture_variant` 读 meshopt 压缩件会崩，先出 `--no-meshopt` 副本；变体目录放遮罩副本；tpl_f2 的 `skeleton.json.neckRing` 是 section 实际颈截面（T5b），领口 / 遮罩在颈根附近要专门看一眼。

检查：
- `python3 tools/model3d/dressup/tests_garment.py`
- `python3 tools/model3d/dressup/tests_hidemask.py`
- `python3 tools/model3d/dressup/tests_variant.py`
- `python3 tools/model3d/dressup/tests_prop.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-r2-refit-f2.md`（≤ 60 行）：每件 × 每体型的三角 / 门禁关键值（可见穿透、holes、72 帧伸长、肤色、sockets）、实际命令与耗时、与 tpl_f 交付件的对照；第 7 节写男素体衣物与 W1 前要问作者的事。

## 补充裁定（2026-10-12 01:45，协调者实测）
1. 第 1 次运行如实停在 tpl_f2_medium 劲装 `untangle_glb.py` 退出 2（翻面 24 → 1）。协调者复现：根因不是翻边，是体型——新素体胸部更饱满且更低，离地 1.17 / 1.20 m 躯干围度 73.1 / 85.6 cm（旧素体 63.8 / 75.8 cm，+9–10 cm）。全分辨率贴合后 225 个衣物点留在胸部体内（最深 50 mm），限拉伸垂坠 0 次迭代、冻结 409 点，拉伸合格率 96.2%（旧素体 99.9%）；`refit_template.py` 同样不行（翻面 116、拉伸 95.2%）。在不放宽拉伸门的前提下，为旧素体生成的劲装套不上新素体。
2. 劲装 / 布衣 / 两个贴图层（第 1–3 步）与 `tests_garment.py` 扩枚举（第 5 步）暂停，等作者定方案（重新生成 / 切片贴合 / 先不做）；第 6 步页面默认模板也顺延。本任务现只做第 4 步：四件道具 × tpl_f2_medium（含 tall / small 的 `check_sockets.py` 只报告），验收、约束、检查不变；写集不变但只应出现道具目录与本报告的改动。
3. 报告按实际范围写：道具每件的命令、validate / sockets 级别与关键数值；第 1 次运行的劲装阻断结论保留在报告里（引用本裁定）。
4. 补充（10-12 05:20）：第 2–4 次运行四件道具 × tpl_f2_medium 入库，validate draft 全过；sockets 龙泉剑三体型 draft（动态穿入 1.13–1.35%，sockets 扫描把待机倾角由 60° 选为 0°），斗笠 / 青锋剑 / 玉佩 approved；斗笠常规 `--simplify 0.03` 轴向 0.994 未过 ≥ 0.999，扫描后取 0.0161（4,598 三角）。校验卡在两条写集外的既有测试：① `tests_prop.py` 旧主件锚点逐位断言（pack-compact 重打包后复算锚点有 1e-12–1e-9 mu 浮点噪声，基点同样失败）；② `apps/game/build/dressup-assets.test.ts` 真实道具用例把索引里同 id 的 tpl_f 与 tpl_f2 变体都装到 tpl_f_medium 上并累加期望（actor 按同 id 替换，差 4 draw calls）。准许协调者改这两处测试（已加进写集）：① 改为 `np.allclose(…, atol=1e-7, rtol=0)`，同一用例 `norm < 1e-4` 原样保留；② 只取与被测素体同模板的道具变体。只修测试假设，不改产物、阈值、工具。
5. 补充（10-12 08:45，协调者实拍）：第 2–4 次运行的道具在 tpl_f2_medium 上实拍——佩剑（青锋剑，waistL）飘在臀后约 25 cm，玉佩挂到右胸，龙泉剑选成 0° 后剑身横在身前、跑步时剑尖越过头顶。前两者是模板插槽错位（tpl_f2 腰插槽落后腰、胸插槽落右胸），已由 `ENG-dressup-t6-sockets-f2` 修正（`--socket-mode waist-band`：腰取自然腰线躯干截面、胸取左侧）；那批道具产物基于旧插槽，作废重做（协调者已撤掉其未提交文件与 manifest 新增行，保留第 4 条的两处测试修正）。
6. 龙泉剑在 tpl_f2 上的待机倾角取 60°（与 tpl_f / E4 一致）：`check_sockets.py` 扫描按穿入率最低选了 0°，但 0° 时剑身横在身前，且其穿入率被一个远处判错符号的点（最小有符号距离 −346 mm）拉低；协调者把 60° 装上实拍，静止 / 走 / 跑都正常，扫描记录里 60° 候选穿入 1.79%（≤ 2%，draft）。做法：照常跑 `check_sockets.py`（临时目录、在 validate / ingest 之前），然后按扫描记录里 60° 候选的数值写 fit（`restTiltDeg: 60`、`gripAdjust` 与 tpl_f 相同 `quat [0, 0, 0.5, 0.866025404]`），`sockets_check.tpl_f2_medium.json` 保留整组扫描并加一行说明选 60° 的依据（本条），再 validate / ingest；不改 `check_sockets.py`。其余三件照扫描结果。
7. 运行时实拍（四件 × idle / walk / run，正 / 侧）由协调者在审核前补进 `props/<id>/shots/r2.tpl_f2_medium.jpg`，执行者不必做。
