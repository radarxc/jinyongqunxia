# 本任务：3D 纸娃娃换装 · R4 · 新劲装贴到新女素体：抽衣壳 + tpl_f2 三体型贴合（P2 + E2c）+ 布衣（P3）+ 贴图层重烘（0 点）

本任务写代码并处理素材。"只改负责的文件""不执行改变仓库状态的 git 命令""报告如实"照常适用。

## 背景
- 作者 10-12「按新素体重新生成」劲装：旧劲装（按旧素体生成）套不上新女素体（胸围 +9–10 cm，225 点留在胸部体内）。R3 已在新素体底图上重出衣图底板（劲装 jz7 / 布衣 by2），并经 Tripo 生成整身模型、绑骨，源件在 `assets/default/model3d/dressup/garments/eq_jinzhuang/source_f2/`（`tripo_dressed_rig.glb`、`source.json`，13 关节与 tpl_f2_medium 差 < 3%H，Spine1 / Spine2 高约 5%H）。
- 作者「衣物到位后再切」默认素体：本任务只做衣物与贴图层；默认模板切换在衣物与 R2 道具都合入后由协调者另做。

## 要做的事（按顺序；先 medium，再 tall / small）
1. 抽衣壳（tech/12 §2 P2 步骤 3）：`extract_garment.py --dressed garments/eq_jinzhuang/source_f2/tripo_dressed_rig.glb --body templates/tpl_f2_medium/body.glb --skeleton templates/tpl_f2_medium/skeleton.json --slot body --id eq_jinzhuang --out garments/eq_jinzhuang/extract_run_f2 --plate assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f2_dressup_eq_jinzhuang_front.png --base-plate assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_v2.png`（`--keep-regions` 等其余参数对照旧 `extract_run/extract.json` 的记录）。门禁：1 个连通块；开口环数与旧劲装一致（4 个：领口、两袖口、下摆）；质检图（正 / 背 / 色检 / 边缘）无身体残片、无大洞。
2. 劲装 × tpl_f2_medium / tall / small：按 P2 步骤 4–8 逐模板全分辨率贴合，再按 E2c-P1 补姿势蒙皮——`fit_garment.py --align joints --weight-source template --weight-smooth-rounds 3 --clean-skin-texture --push-mm 3 --preserve-shape --push-mode volume --allow-draft`（以 `extract_run_f2/eq_jinzhuang_raw_skinned.glb` 为 `--garment`）→ `pack_glb.mjs --simplify 0.25 --no-meshopt` → `untangle_glb.py`（退出码 2 不得继续）→ 先烘一版可见性遮罩 → `fit_garment.py --pose-skin --arm-abduction-deg 6 --pose-skin-mask <该遮罩>` → `pack_glb.mjs` → `bake_hide_mask.py --mode visibility --views 128 --frames-per-clip 6 --depth-size 256 --size 1024` → `validate.py --level draft` → `ingest.py garment eq_jinzhuang --template <tpl> --slot body --item eq_jinzhuang`。产物带 `.tpl_f2_*` 后缀登记进 `garments/eq_jinzhuang/manifest.yaml` 的 `fits`（主模板仍 tpl_f_medium），fits 条目补齐与 tpl_f 条目相同的字段（hideMask、gateLevel、sha256、size_bytes、triangles）。
3. 布衣 × tpl_f2 三体型（P3 步骤 2–5）：以第 2 步的 tpl_f2 劲装为版型，`pack_glb.mjs --no-meshopt` 出未压缩副本 → `variant_base.py --source extract_run_f2/eq_jinzhuang_raw_skinned.glb` → `retexture_variant.py --base-plate <f2 劲装底板> --plate assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f2_dressup_eq_buyi_front.png` → `pack_glb.mjs` → 遮罩副本进 `garments/eq_buyi/` → `validate.py --level draft` → `ingest.py garment eq_buyi … --template <tpl>`。
4. 贴图层：`bake_texture_layer.py` 以 tpl_f2_medium 劲装 / 布衣交付件为 `--dressed`，`--body` / `--skeleton` 取 tpl_f2_medium，重烘 `eq_jinzhuang_tex` / `eq_buyi_tex` 在 tpl_f2 UV 上的层；先逐位核对 tpl_f2_small / tall 与 medium 的索引、UV 相同，再把同一张层图登记为三体型的 `fits`（tpl_f 原层文件与记录不动）。
5. `tests_garment.py`：只把交付件枚举（`test_delivered_variant_skin_provenance`、`test_delivered_garments_dynamic_topology`）扩到 tpl_f2 三体型，阈值与断言不改。

## 验收
- 劲装 / 布衣 × tpl_f2 三体型：`validate.py --level draft` 全过（可见穿透 idle / walk / run ≤ 2%、holes ≤ 0.05%、bind 0、翻面 0、边长合格）；72 帧最大边伸长 ≤ 30 mm；布衣肤色按来源 < 0.1%。
- 两个贴图层在 tpl_f2 上烘出、预览无大片空白 / 错位，三体型登记。
- 已有 tpl_f_* 产物与记录逐字节不变；旧 `extract_run/`、`source/` 不动。
- 运行时实拍（劲装 / 布衣 × 三体型 × idle / walk / run，正 / 侧 / 背）由协调者在审核前补进 `garments/eq_jinzhuang/shots/r4.tpl_f2_*.jpg`，执行者交各步质检图即可。

## 约束
- 只写 `assets/default/model3d/dressup/garments/{eq_jinzhuang,eq_buyi,eq_jinzhuang_tex,eq_buyi_tex}/**`、`tools/model3d/dressup/tests_garment.py`（只扩枚举）与本任务报告。
- 不改任何工具、门禁阈值、模板；工具在 tpl_f2 上跑不通或门禁不过时如实停下写报告交回协调者，不许改度量、改测试、手改 report / fit 过门。0 点。
- 已知坑（E2b / E2c）：先全分辨率贴合再减面、翻边（倒过来不收敛）；肤色清理按交付 JPEG 解码复测；`retexture_variant` 读 meshopt 压缩件会崩，先出 `--no-meshopt` 副本；变体目录放遮罩副本；tpl_f2 的 neckRing 是 section 实际颈截面、插槽是 waist-band（T5b / T6），领口与遮罩在颈根附近要专门看一眼。

检查：
- `python3 tools/model3d/dressup/tests_garment.py`
- `python3 tools/model3d/dressup/tests_hidemask.py`
- `python3 tools/model3d/dressup/tests_variant.py`
- `python3 tools/model3d/dressup/tests_texlayer.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-dressup-r4-jinzhuang-f2-fit.md`（≤ 60 行）：抽衣门禁、每件 × 每体型的三角 / 门禁关键值（可见穿透、holes、72 帧伸长、肤色）、实际命令与耗时、与 tpl_f 交付件的对照；第 7 节交接默认素体切换与男素体衣物（W1 前问作者）。
