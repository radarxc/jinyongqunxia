# 本任务：3D 纸娃娃换装 · 阶段 E3 · 贴图层：把劲装颜色从整身模型烘焙到模板 UV（三套模板共用一张层贴图；AR-102）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§4、§5.1、§5.5、§7、§11）、`docs/tech/10-paper-doll-3d.md` §1.3（路 A 三模板共拓扑、共 UV）、`tools/model3d/dressup/README.md`，以及 A1 / A5 / E1 报告第 7 节（A4 尚未合入，本任务不依赖它）。

## 作者要求
作者 2026-10-08 看到本地预览衣服穿模，问"为啥要用生图来换上衣服，衣服不是贴图贴到模型上吗"，随后同意**贴图层与网格层两条路同时试**（「同时试试吧」）。本任务是**贴图层**：身体网格不变，把贴身衣服画进身体贴图——**永不穿模、零额外 draw call、三套模板共用**（路 A 派生模板与中等模板共拓扑、共 UV）；代价是没有厚度与轮廓（领口、腰带结、衣摆外扩出不来），所以紧身件适合、宽松件要配网格层。网格层是 E2，两者并排给作者看。

## 输入
- E1 源件：`assets/default/model3d/dressup/garments/eq_jinzhuang/source/tripo_dressed_rig.glb`（穿劲装的整身 Tripo 模型，带 Tripo 65 骨绑骨与 2048² 贴图）与 `source.json`。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_medium/`（`body.glb` 单材质、baseColor 2048² JPEG；`skeleton.json`；`regions.npy` 逐顶点 u8 区域，17 区见 `skeleton.json.regions.ids`）；`tpl_f_small` / `tpl_f_tall` 共拓扑、共 UV。
- 衣图底板与模板底图（同画布，可用来建"衣服色 / 皮肤色"样本）：`assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png`、`…/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png`。

## 要做的事
1. **`tools/model3d/dressup/bake_texture_layer.py`**：`--dressed <整身 glb> --body <模板 body.glb> --skeleton <skeleton.json> --slot body --id <id> --out <dir> [--plate … --base-plate …] [--size 2048] [--max-distance-mm 60] [--json]`：
   - **对齐**（协调者 2026-10-08 02:25：本任务不等 A4，自己实现，语义与 A4 `fit_garment.align_joints` 相同）：用 A1 `common.umeyama`（`allow_mirror=False`，det 必须 +1）在 ≥ 6 个对称躯干关节（Hips / Spine / Spine1 / Spine2 / Neck / LeftArm / RightArm / LeftUpLeg / RightUpLeg，按清洗后的骨名配对）上做粗配；再逐骨姿态校正：每个源骨的变换 `T_i = W_i^模板bind · inv(粗配 · W_i^源bind)`，用整身模型**自带的 Tripo 权重**做 LBS（A1 `common.lbs` 或等价写法）把顶点摆到模板 bind 姿态；残差（粗配后各关节距离）换算 %H、每骨校正角写进 `layer.json.align`。A4 合入后由阶段 C 统一改为复用 `fit_garment.align_joints`，本任务不 import A4 的文件。
   - **烘焙**：在模板 UV 空间光栅化模板三角（逐纹素重心 → bind 位置与法线；UV 按 glTF 约定，原点左上），对每个纹素找对齐后整身表面上的几何最近点（A1 `nearest_triangle`，k 候选 + 精确点-三角；距离上限 `--max-distance-mm`），在命中三角的 UV 处双线性采样整身 baseColor 得颜色；
   - **衣服判定**（逐纹素 alpha）：命中点颜色在 Lab 空间按底板样本分类为衣服的概率（不写死颜色常数），乘以区域约束（劲装允许 torsoUpper / torsoLower / hips / upperArmL/R / forearmL/R / thighL/R；head / neck / handL/R / footL/R / shinL/R 恒为 0），边缘 1~2 px 羽化；alpha = 0 的纹素 RGB 置 0；UV 岛外向外扩边 4 px 防接缝；
   - **输出**（`<out>` = `assets/default/model3d/dressup/garments/eq_jinzhuang_tex/`）：`eq_jinzhuang.layer.png`（RGBA，与模板 baseColor 同尺寸，非预乘）；`layer.json`（`schema: "tianshu-dressup-layer.v1"`、`kind: "layer"`、`slot`、`id`、`item: "eq_jinzhuang"`、`uv: { template: "tpl_f_medium", bodySha256, size }`、`templates: ["tpl_f_medium","tpl_f_small","tpl_f_tall"]`（逐套核对 UV 与三角索引逐位相同才列入）、`align`、`coverageByRegion`（每区被衣服覆盖的 UV 面积占比）、`alpha: { opaque, partial }`、`source: { file, sha256 }`、`stats: { elapsedSec, peakMemoryMiB }`）；
   - **质检图**（协调者不开浏览器也能看）：`preview_basecolor.jpg`（模板 baseColor 叠层贴图）、`preview_front.png` / `preview_back.png`（Pillow 软光栅正交前视 / 后视，unlit，用叠好的贴图着色），以及与衣图底板并排的 `preview_compare.png`。
2. **入库**：在 `garments/eq_jinzhuang_tex/manifest.yaml` 写一个条目（字段照 spec §7：`id: dressup__layer__eq_jinzhuang`、`file: eq_jinzhuang.layer.png`、`fit: layer.json`、`kind: dressup-layer`、`slot: body`、`template: tpl_f_medium`、`item`、`tool`、`source`（E1 Tripo 项目 ID、源件与底板 sha256）、`sha256`、`size_bytes`、`status: draft`（作者看图后再改）、`created`、`notes`）。不写 `report`（层贴图没有几何门禁，自检数字写进 `layer.json`）。
3. **`tools/model3d/dressup/tests_texlayer.py`**：合成"带 UV 的圆柱身体 + 外套筒（套筒贴图一半衣服色、一半皮肤色）"，验证纹素光栅化覆盖、最近点采样颜色、区域约束、羽化与扩边、`templates` 共 UV 核对（改一个 UV 即被剔除）。

## 协调者实测意见（2026-10-08 03:25，看第 1 轮质检图后补充；返修必须照做）
第 1 轮覆盖率数字达标，但质检图上交领糊成一团、腰带断成碎块、衣摆与袖口边缘呈锯齿，不满足下方"交领、腰带、袖口在正 / 背面都在、与底板一致"。协调者核对了对齐：逐骨校正后露出皮肤到模板体表 p50 头 2.9 mm、手约 2 mm、小腿 6–8 mm（只粗配时 15–44 mm），**对齐没问题，问题在烘焙方式**：劲装离体表 1–3 cm（躯干 p90 约 27 mm），逐纹素取"几何最近点"会在腰带、交领叠襟、衣摆外扩处取错表面。改法：
1. **沿模板法线射线烘焙**（标准 cage / ray bake）：从纹素 bind 位置沿插值法线向外，起点 `p − 5 mm·n`，取与对齐后整身表面的**最外侧**交点（射程上限 `--max-distance-mm`），用该交点的 UV 采样颜色；射线无命中才回退最近点，并把回退纹素数写进 `layer.json`。射线求交用 numpy 向量化 + 三角包围盒网格 / KD 分桶，不加依赖。
2. **alpha 清理**：逐 UV 岛对衣服判定做形态学开 / 闭（去孤点、补小洞），再按区域边界把衣摆 / 袖口拉成平滑边（轮廓平滑后羽化 1~2 px），质检图上不得有锯齿状撕边与孤立色块。
3. 新增质检图 `preview_front_detail.png`（上半身放大到胸口、腰带、袖口）；报告第 3 节写射线命中率、回退数、清理前后衣服纹素数。

## 协调者实测意见（第 2 轮，2026-10-08 04:15，看 `preview_front_detail.png` 后补充；返修必须照做）
射线烘焙后腰带结、垂带、袖身、后片都对了（明显进步）。还剩三处：
1. **UV 接缝浅色虚线**：衣服上沿 UV 岛边界一串串浅色点线——是逐 UV 岛做开闭 / 羽化时把岛边界当成了衣服边界，alpha 在接缝处掉下去露出底色。改：衣服 / 皮肤标签在 **3D 网格上**定（每个模板顶点一个"衣服度"标量：命中点衣服判定在模板网格上做 2 环多数平滑 / 拉普拉斯平滑），纹素按重心插值该标量再阈值，使同一 3D 位置在不同 UV 岛上取值一致；羽化只发生在 3D 上的衣服 / 皮肤分界（领口、袖口、衣摆），**跨 UV 岛边界不得羽化**；最后对 RGB 与 alpha 一起向岛外 gutter 做 ≥ 8 px 的最近有效纹素扩边。
2. **交领胸口半透明发灰**：alpha 不得直接用"衣服概率"——在衣服区内一律 255，只在分界 1~2 px 羽化；颜色仍取射线命中点。
3. **领口、袖口撕边**：分界用上面的 3D 平滑标量阈值得到（亚纹素平滑），领口 / 袖口 / 衣摆应是平滑曲线；新增 `preview_edges_detail.png`（放大领口与双袖口），报告写分界折线的平均转角或锯齿度量。
质检图须做到：任何视角无浅色接缝点线、胸口无半透明、领口 / 袖口无撕边。

## 协调者实测意见（第 3 轮，2026-10-08 04:48）
接缝点线已消失（✓）。新问题：胸前、交领、腰带结、衣摆出现**毛刺 / 拖影状条纹**，细节比第 2 轮糊；领口 / 袖口 / 衣摆仍是毛边。改：
1. 衣服区**内部**的颜色只取射线命中点（或其邻域加权），"最近有效纹素"填充只允许用于 UV 岛外 gutter，不得进入岛内；
2. 掠射命中（射线与命中三角法线夹角 > 70°）不直接采样，改取同一射线的下一个更正对的交点或邻域加权，避免沿表面拉出条纹；报告写掠射命中数；
3. 分界用平滑后衣服度标量的 0.5 等值线求亚纹素有向距离，alpha 按到等值线距离做 1.5 px 线性羽化（不要逐纹素阈值后再模糊，那会出毛边）；
4. 细节以第 2 轮为基准不得退化：腰带结、两条垂带、交领叠襟线要与第 2 轮同样清楚。

## 验收（协调者会实测）
- 质检图上劲装的交领、腰带、袖口在正 / 背面都在、与底板一致；手、脸、颈、小腿无衣服色；三套模板都能用同一张层；
- `layer.json.coverageByRegion`：torsoUpper / torsoLower ≥ 0.9、upperArm / forearm ≥ 0.8、head / hand / foot / shin = 0；
- 全流程 < 120 s、峰值内存 < 3 GB（报告写实测）。

## 约束
- 只写 `tools/model3d/dressup/{bake_texture_layer.py,tests_texlayer.py}`、`assets/default/model3d/dressup/garments/eq_jinzhuang_tex/**` 与本任务报告。
- 不改基础库（只能追加函数）、不改也不 import A4（`fit_garment.py` / `refit_template.py`）/ A5 / E2 的文件；不加依赖；不花 Tripo 点数。运行时如何叠层是后续 B3 的事，本任务不改 `packages/**`、`apps/**`。

检查：
- `python3 tools/model3d/dressup/tests_texlayer.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：对齐残差、烘焙纹素数 / 命中率 / 距离分布、各区覆盖率、alpha 统计、三模板共 UV 核对结果、耗时与内存；第 4 节写贴图层的局限（无厚度、领口与腰带结、衣摆外扩、接缝）与哪些部位建议改走网格层；第 7 节写给 B3（运行时叠层：贴图尺寸、色彩空间、glTF UV 方向、`flipY=false`、叠层顺序）的交接。报告 ≤ 60 行。
