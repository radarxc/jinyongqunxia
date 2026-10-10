# ENG-dressup-e2b-cleanup 报告 · 3D 纸娃娃换装 · E2b · 劲装版型件清理（Claude 收尾，AR-110）

## 1. 摘要
traex 三次运行均在 200 分钟上限被停，由 Claude 收尾。traex 报的"翻面 0、边长 100%"是自比：fit.source 指向贴合产物 `extract_run/eq_jinzhuang_clean*.glb`，按真实源重测与 E2b 前一样。几何从根上重做：体表位移场推离 + 限拉伸垂坠（`--push-mode volume`），先全分辨率贴合再减面，减面留下的细长翻面三角用 `untangle_glb.py` 翻边。结果三模板几何门全过，bind 穿透 0，贴图肤色纹素 1.68% → 0（按交付 JPEG 解码复测），运行时实拍劲装胸口不再破碎，布衣胸口两块肤色斑消失（查明是身体从旧版型破胸口透出，不是贴图）。审核 r1 只卡布衣肤色：已按 23:40 裁定改为按来源修补与验收（`variant_base.py`），原皮肤污染区残留 0.248% → 0.0008%。仍未过两项：idle / walk 可见穿透、run holes。查明是 LBS 真穿入，拆给 E2c。level 如实为 fail，manifest 保持 experimental。未花点数，未改运行时与门禁阈值。

## 2. 产出
- `fit_garment.py`：`--push-mode volume`（`volume_push` / `PseudoNormalSign` / `DrapeRelaxer`）、`encode_skin_clean_texture`；保留 traex 的 `--weight-source template` / `--preserve-shape` / `--clean-skin-texture`。删除 traex 的逐点 LP 按姿势权重（动画出尖刺、无测试，交 E2c）。默认 vertex / auto / 关，旧行为不变。
- `extract_garment.py`：`repair_skin_texels` 加 `margin`；新增 `repair_by_reference`（按参考图判污染区）。新增 `untangle_glb.py`（只改索引）、`variant_base.py`（为 retexture 准备按来源修补的未压缩版型副本，贴图无损写回）。`validate.py` 三处修正：衣物认压紧映射；封闭身体上 A1 判穿入的点做射线奇偶复核；refit 源核对 `garmentSha256`。
- `tests_garment.py` 35 项，新增：volume 保层叠、凹网格伪法向、压紧回指、奇偶复核、肤色岛内范围、JPEG 复测、refit 摘要、翻边与索引写回、按来源修补（合成 + 真实版型其余纹素逐字节不变）、副本 PNG 往返、交付布衣残留。
- 素材：`eq_jinzhuang` 三体型（删冒充源 `extract_run/eq_jinzhuang_clean*.glb` 与弃用 `raw_skinned.lod.glb`）；`eq_buyi` 三体型（遮罩为劲装同名文件的逐字节副本）、`eq_buyi_tex` 重生成。截图在 `.agents/coord/_dressup/shots_w0/e2b/`。

## 3. 关键结论与数值
- **畸变来源**（medium；validate 口径，即对 E2 抽取件 `raw_skinned` 做相似变换后比较，抽取件为 0）：只做关节对齐 17 翻面 / 96.19%（Spine、Spine1 被拉长），加 preserve-shape 为 0 / 100%；E2 再逐点推离 309 / 88.50%（Spine1 133、Spine2 53、双肩 77）；G1 开口模板权重 + 推离 504 / 88.32%（Spine1 207、Spine2 156）。
- 主因是逐点推离：交领内外襟各沿最近体表法向推，互相穿插、折叠，胸下的布被压平在体表上；次因是骨骼局部重摆拉长了躯干。
- **修复前后**（E2b 前 = HEAD 的 G1b 产物用本版 validate 与真实源重测；三格依次为 medium / small / tall）：

| 项 | E2b 前 | E2b 后（门槛） |
|---|---|---|
| 翻面 / 边长合格率 | 504 / 157 / 155；88.32 / 97.86 / 97.88% | 0 / 0 / 0；99.27 / 99.28 / 99.18%（0；≥ 99%） |
| close-fit P90 Δ | 1.46 / 5.16 / 1.76 mm | 1.62 / 1.74 / 1.77 mm（< 5） |
| 可见穿透 idle / walk / run | 5.09 / 7.77 / 6.23；7.54 / 9.06 / 7.52；4.37 / 6.92 / 5.29% | 4.23 / 2.76 / 1.00；4.13 / 4.15 / 1.29；4.58 / 2.76 / 0.77%（≤ 2%） |
| holes run（idle / walk 后为 ≤ 0.043%） | 0.062 / 0.040 / 0.014% | 0.096 / 0.059 / 0.063%（≤ 0.05%） |
| bind 可见穿透；贴图肤色纹素 | 0；1.68% | 0；0 |

- **权重 A / B**（同一套 volume 流程，`penetration.*.all` idle / walk / run）：A（源权重 + 开口 30 mm 模板带）7.23 / 7.77 / 6.13%、8.51 / 10.04 / 7.04%、7.49 / 7.56 / 5.61%；B（整件模板权重）5.98 / 3.72 / 1.94%、7.34 / 5.68 / 2.33%、6.49 / 3.89 / 1.55%。九格都是 B 更低，采用 B；目标 < 3% 只有 run 达到（E2b 前为 7.5–12.5%）。
- **减面**：全分辨率 103,356 三角贴合，翻面 0、拉伸合格率 99.76–99.88%；减到约 25,836 三角后，减面器留下 1 / 7 / 8 个细长翻面三角（例：袖上 42 mm × 0.16 mm），翻边后归 0。先减面再贴合时体内残留 34–51 点、边长合格率 97.2–97.5%，弃用。
- **validate 修正**：模板三体型各有 26–31 个面朝向与着色法向相反，A1 会把附近实际在体外 22–49 mm 的垂坠点判成体内，奇偶复核后 bind 可见穿透 3 / 4 / 5 → 0。G1 起 medium 已重生成，small / tall 的 refit 源却读新母版（记录的摘要是 E2 母版），G1b 报的 171 / 262 翻面是对错源算的，按真实源为 157 / 155。
- **贴图肤色**（ΔE76 ≤ 18，参照源模型手部肤色 Lab 中位 72.8 / 5.7 / 11.0，统计衣物引用的 1,521,131 纹素）：25,489（1.676%）→ 0。首版只统计编码前，交付 JPEG（q95）复测仍有 2,695（0.177%，ΔE 14.6–18.0，全在原交领肤色带内），因为填补色紧贴阈值、编码后落回；现改为填补色须 ΔE > 24、编码后解码复测，第 5 轮归 0。按减面后网格独立复核为 23–35 纹素（≤ 0.0023%），都不在原肤色带上。
- **布衣变体**：几何与遮罩同劲装，三模板 level fail，未过项同劲装。HEAD 布衣几何与 E2 时的劲装逐点相同（G1 / G1b 未同步）且无遮罩，胸口两块"肤色斑"是身体从破胸口透出：屏幕色 Lab 71 / 8.5 / 13.5，HEAD 布衣贴图里相近色（ΔE ≤ 6）只有 34 纹素且都不在胸口。r1 时全图 `variantSkinRatio` 0.349%，其中 0.227% 落在版型原皮肤污染区（劲装清理后的灰布带经颜色映射成浅米色），0.121% 是布衣自身浅色布面高光（HEAD 0.120% 中污染区内为 0；原画衣服区本身 1.85% 落在同一 Lab 盒）。按裁定，验收看来源：交付 GLB（JPEG q85 解码）里污染区内落在盒中的纹素 3,731（0.248%）→ 12（0.0008%），三体型相同；全图指标降到 0.119%，作参考。衣物覆盖范围内、污染区以外只有 10 个纹素变动，都在污染区 4 px 内（补洞邻接），更远处为 0。运行时胸口实拍见 `buyi_chest_head_r1_now.jpg`。
- **贴图层 V 区竖带**（`eq_buyi_tex/preview_front_detail.png`）：衣服 V 口是开口，贴图层烘焙对射线外逸的胸口纹素取 60 mm 内最近领边颜色回填，HEAD 已有（`buyi_layer_vneck_head_vs_now.png`）。现为布色：同一渲染里亮度 L 55（旁边颈部皮肤 L 79），落在肤色盒的比例为 0%；3D 衣物运行时 V 口露出的是身体本身。

## 4. 开放问题（附默认值）
- 动画穿插：垂手宽袖碰髋 / 大腿，idle 侧胸腋下有细条肤色（衣侧与躯干相交），run 破洞在髋部下摆与大腿交界。已拆给 E2c。默认 E2c 过门后再去 experimental。
- fit 报告 `pushOut.passed=false`：8–10 点在体外但不足 3 mm 余量，因此带 `--allow-draft`；validate bind 穿透为 0。默认不另处理。
- 贴图层开口回填（上条竖带）属 E3 烘焙工具行为，不在本任务写集；默认保持，见 E2b-P4。

## 5. 对基准的修改提案
- E2b-P1：`retexture_variant.replace_image_glb` 遇 meshopt 压缩版型时偏移错乱、报错。现绕法：先 `pack_glb --no-meshopt` 出未压缩副本作版型，产物再压缩；建议另开任务修。
- E2b-P2：构建禁止 hideMask 跨目录引用（`DRESSUP_ASSET_PATH_INVALID`），变体目录放遮罩逐字节副本（约 18 KB / 体型）。
- E2b-P3：变体肤色验收固定为按来源计（本任务裁定口径），全图 `variantSkinRatio` 只作参考，并以运行时胸口实拍为准。
- E2b-P4：贴图层烘焙对开口（V 领、袖口）射线外逸的纹素不做最近面回填、保持透明，与 3D 衣物一致。

## 6. 需同步到其他文档
- `docs/tech/12` §2 P2 / P3：贴合与变体流程改为第 7 节的顺序与参数；refit 件须在母版定稿后再做。

## 7. 自检与 P2 / P3 交接
- ✅ tests_garment 35/35、tests_hidemask 24/24、tests_variant 6/6、selftest 7/7；`pnpm install --frozen-lockfile`、`pnpm check` 通过。
- P2 版型件，每体型一次：① `fit_garment.py --align joints --weight-source template --weight-smooth-rounds 3 --clean-skin-texture --push-mm 3 --preserve-shape --push-mode volume --allow-draft`（volume 默认 σ 40 → 16 mm × 8 轮，垂坠 6 次 × 4 迭代，应变 [0.75, 1.3]；肤色余量 6、复测 ≤ 6 轮）→ ② `pack_glb.mjs --simplify 0.25 --no-meshopt` → ③ `untangle_glb.py`（退出码 2 表示仍有翻面）→ ④ `pack_glb.mjs` 压缩 → ⑤ `bake_hide_mask.py --mode visibility --views 128 --frames-per-clip 6 --depth-size 256 --size 1024` → ⑥ `validate.py --level draft`。
- P3 贴图变体：`pack_glb --no-meshopt` 出版型副本 → `variant_base.py --base <副本> --source <抽取件> --out <ID 同名目录>` → `retexture_variant.py --base <该目录>` → `pack_glb` 压缩 → 复制版型遮罩 → validate → 按来源量残留 + 胸口实拍。
