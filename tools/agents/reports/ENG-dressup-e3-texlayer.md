# ENG-dressup-e3-texlayer 报告 · 3D 纸娃娃换装 · E3 · 贴图层：劲装颜色烘焙到模板 UV（三模板共用层贴图）

## 1. 摘要（3–6 行）
- 已按第 3 轮审核把标签与颜色路径分开：顶点仅作 3D 两环衣服度平滑，1,474,238 个候选 UV 纹素各自射线取色。
- 最外层掠射交点（>70°）跳过；无合格交点才精算局部 16 个近质心面；岛内不做最近有效纹素复制。
- alpha 由 0.5 等值线有向像素距离生成固定 1.5 px 羽化，RGB/alpha 只向岛外扩 8 px；已重生成层、JSON、manifest 与 6 张质检图。
- 完整烘焙 64.89 s、峰值 969.20 MiB；12 项合成测试、7 项基础自测、冻结安装和 `pnpm check` 全部通过。

## 2. 产出（文件、行数、主要章节）
- `tools/model3d/dressup/bake_texture_layer.py`（925 行）：对齐/LBS、逐纹素 BVH 射线、掠射改选、局部面回退、等值线羽化、8 px gutter/质检。
- `tools/model3d/dressup/tests_texlayer.py`（181 行）：12 个圆柱/套筒回归，新增掠射改选、岛内禁填充及 1.5 px 羽化断言。
- `assets/.../eq_jinzhuang_tex/`：层 PNG（1,254,928 B）、JSON、manifest、baseColor/正/背/对比/front-detail/edges-detail 共 6 图。
- `tests_texlayer.py`：12/12（0.13 s）；`selftest.py`：7/7；冻结安装通过（pnpm 9.15.9，716 ms）。
- `pnpm check`：通过；183/183 测试文件、1309/1309 测试、1777 内容文件/1708 对象、构建/包体/dev-chunks 全绿。

## 3. 关键结论与数值
- 对齐：9 躯干骨 Umeyama `scale=1.008740`、`det=1.000000`、无镜像；残差 RMS `1.916%H`、最大 `3.683%H`（Spine1）；逐骨角全量入 JSON。
- 烘焙：光栅 2,625,215；候选/真实逐纹素射线 1,474,238；正对命中 1,224,528（83.062%），局部面回退 249,710，最终命中 100%。
- 掠射治理：13,066 条射线遇到 15,201 个 >70° 交点并跳过；距离 p50/p90/p99/max = 13.65/33.25/48.56/57.73 mm。
- 98,007 个焊接顶点、7,075 个拆点、294,033 边；两环清理前/后 1,179,161/1,069,886 衣纹素。
- 覆盖：torsoUpper/Lower 98.98%/100%，upperArm L/R 100%，forearm L/R 99.66%/98.60%；head/neck/hand/shin/foot 全 0。
- alpha opaque/partial/transparent = 1,288,487/7,082/2,898,735；真实分界 partial 4,804；alpha=0 的 RGB 全 0；层 SHA `295877…6421e`。
- 三模板：`tpl_f_medium/small/tall` 的三角索引和 UV float 数组均 `array_equal`；改一个 UV 的合成模板会被剔除。
- 分界锯齿指标：1,394 段 / 1,394 个二度点，平均转角 32.61°、P95 91.00°；指标由 `layer.json` 可复算。
- 一致处：`p-5mm*n` 沿 `+n` 取最外交点；区域仅作允许/禁止掩码；glTF 左上 UV、非预乘 RGBA、8 px RGB+alpha gutter。
- 偏离处：射线无合格交点时在 KD 近质心 16 面内精算最近面（而非全局 A1 最近面），以守住 120 s；逐纹素无遗漏且无跨褶皱全局补色。

## 4. 开放问题（附默认值）
- 贴图层没有厚度/轮廓，无法表现实体翻领、腰带横带厚度、腰带结/垂带和外扩衣摆；默认这些部位走 E2 网格层，本层保留贴身衣身/袖管颜色。
- manifest 默认 `draft`；作者在同页对比 E2/E3 后才改 `candidate/approved`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务落实 AR-106，不修改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `ENG-dressup-b3-layers` / 运行时材质：读取 `dressup-layer`、叠到身体 baseColor，并在预览页与 E2 网格层并排切换。
- `dressup-3d` Skill / E3：阶段 C 合入 A4 后把本脚本的私有对齐改为复用统一 `fit_garment.align_joints`，算法与产物口径不变。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 只改允许路径；未改基础库/A4/A5/E2、未加依赖、未执行改变仓库状态的 git 命令、未读取 `.env`。
- ✅ CLI、schema/manifest/source/层哈希、RGBA 零 alpha→零 RGB、逐纹素射线/掠射/回退/清理/覆盖率/耗时内存字段齐全。
- ✅ 质检图逐张目视：交领叠襟、横向腰带、结与两条垂带清楚；正背无 UV 点线/胸口半透明/拖影，禁区无衣色。
- ✅ 覆盖门：躯干 ≥0.9、上/前臂 ≥0.8、head/hand/foot/shin=0；性能门 <120 s/<3 GiB；输出契约断言通过。
- ✅ B3 交接：贴图 2048×2048 RGBA/sRGB、非预乘；glTF UV 左上原点，three `flipY=false`；叠层顺序为身体 baseColor → body 槽贴图层 → 网格装备。
- ⚠️ 任务文字称 pnpm 12，但仓库 `packageManager` 与实际命令均为 `pnpm@9.15.9`；冻结安装及完整检查仍通过，未越权改版本。
