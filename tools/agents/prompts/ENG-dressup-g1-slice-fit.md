# 本任务：3D 纸娃娃换装 · G1 · 衣物 / 盔甲"Z 向切片"贴合数值方案：评估 → ADR → 实现原型 → 主角素体 / 劲装 / 盔甲打标 → 效果图

只改负责的文件；不执行改变仓库状态的 git 命令；报告如实。先读根 `CLAUDE.md`、`docs/tech/10-paper-doll-3d.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`、`docs/tech/12-dressup-production.md`、`tools/model3d/dressup/README.md`，再读现有贴合实现 `tools/model3d/dressup/fit_garment.py`（`volume_push` 体表位移场推离 + 限拉伸垂坠、`align_joints`、`SurfaceIndex` / `PseudoNormalSign`）与 E2b / E2c 报告（`tools/agents/reports/ENG-dressup-e2b-cleanup.md`、E2c 进行中）。

## 作者方案（2026-10-10 原话，照录）
> 衣服和素体是两个 3D 模型，本质上是一个对齐的算法。
> - 首先需要将衣服 / 盔甲进行垂直 Z 轴缩放。以脖子为起点，下摆计算到合适位置（根据不同衣服 / 盔甲，下摆位置应该可能是肚脐、臀部下方、膝盖、脚踝上方等——素体模型要对应标注，衣服 / 盔甲也要做对应标注）。
> - 垂直对齐后，进行水平（XY）中心对齐。
> - 然后按照一定高度间隔从颈部到下摆进行切分，每一个切面我们需要通过素体切面算出衣服的切面线坐标。
>   - 首先对素体切分，得到素体切分面（闭合图形）。然后做衣服切面。根据衣服切面，算出两个衣服上身切面：
>   - 弹性切面：衣服切面（应该是一个双环线），从外环一个点（B）向 XY 中心径向延伸，得到内环交点（A），以及和素体皮肤的交点（C）。将内环交点挪到素体皮肤的交点 C 沿法向 1 mm（点 newA），保持内外环距离，算出最终外环点（newB）。这样转一圈，所有 newA 和 newB 组成弹性切面。
>   - 非弹性切面：衣服切面扩大（scale 系数 ratio），找到最小的 ratio，并且衣服内环都在素体切面外。这是非弹性切面。
>   - 设计弹性系数 r（0 到 1），0 是完全不弹，1 是完全贴身紧绷。每个衣服有一个系数（例如板甲 0，明光铠 0.2，锁子甲 0.3，普通衣物 0.9，劲装 1），弹性切面 × r + 非弹性切面 × (1 − r) 算出最终衣物切面。
>   - 按照 Z 轴的连续切面图，平滑拟合出最终衣物模型（保持贴图和素材）。
>
> 思考这个方案是否合理，如果合理，写 ADR，然后实现函数并进行目前主角素体、劲装、几个盔甲的打标，然后给我看看效果。

## 要做的事
1. **评估**：逐条分析方案（几何前提、对现有素材是否成立、与现行 `volume_push` 的关系、和 E2c 姿势蒙皮的分工）。注意本项目 glTF 是 Y 轴向上（作者说的"Z 轴"即竖直轴）。要正面回答"是否合理"；发现前提不成立处（例如 A 字手臂斜着穿过水平切面、多环切面、非星形截面上的径向射线、单层无厚度衣片、逐层独立缩放让刚性甲片变形、腿间裙摆等），给出保持作者框架的修正（例如按部件 / 骨轴切片、按角度匹配而非射线、r 与 ratio 沿高度平滑、刚体件整体相似变换等），不要换成另一套方法。
2. **ADR**：写 `docs/adr/0002-dressup-slice-fit.md`（背景 / 决策 / 后果 / 备选；`0001` 号按 `docs/tech/01-architecture.md` 预留给渲染器门禁）。写清标注规范（素体与衣物 / 盔甲各标哪些位置、文件格式）、弹性系数取值表、与现行流水线的接口（替代或前置于 `volume_push`，产物仍走 untangle / 姿势蒙皮 / 遮罩 / validate）。
3. **实现**：`tools/model3d/dressup/slice_fit.py`（纯函数 + CLI：读素体 / 衣物 GLB 与两边标注 → 竖直分段对齐 → 水平对中 → 切片 → 弹性 / 非弹性切面 → 按 r 混合 → 沿高度平滑重建顶点，UV / 贴图 / 拓扑不变 → 写 GLB 与诊断 JSON）；`tools/model3d/dressup/tests_slice_fit.py` 合成回归（圆柱 / 椭圆柱素体 + 已知衣片：r = 0 时内环恰在体外、r = 1 时内环贴体 1 mm、厚度保持、拓扑与 UV 不变、高度对齐到标注）。不加依赖。
4. **打标**：主角素体三体型 `templates/tpl_f_{medium,tall,small}/slice_landmarks.json`（颈根、肩、胸、腰 / 肚脐、臀下、膝、踝等高度，及各段截面中心；能从骨骼 / 网格自动求的就写生成脚本，人工确认后落盘）；劲装 `garments/eq_jinzhuang/slice_landmarks.json`（领口、下摆类型与高度、袖口、弹性系数）。仓库里还没有盔甲模型：用程序生成 2–3 件盔甲测试件放 `garments/_fixture_armor_{banjia,mingguang,suozi}/`（板甲：胸背整片到肚脐、r = 0；明光铠：护心镜 + 腹甲 + 甲裙到臀下、r = 0.2；锁子甲：长到膝上、带短袖、r = 0.3；各自 GLB + slice_landmarks.json + 一行说明），故意做成与主角不同的体型尺寸以检验对齐。
5. **效果**：对劲装（从原始抽取件 `garments/eq_jinzhuang/extract_run/eq_jinzhuang_raw_skinned.glb`）与三件盔甲在 tpl_f_medium 上各跑一遍（劲装再跑 tall / small），出对比图到各自目录 `shots/slice_fit.*.jpg`：前 / 侧 / 背三视图（贴合前 / 后，身体半透明或剖切）、若干高度的切面线图（素体环、原衣物环、弹性环、非弹性环、最终环）；量化：内环最小间隙、穿入点数、厚度变化、边长伸缩、与现行 E2b 劲装 bind 形状的差。
6. **报告** `tools/agents/reports/ENG-dressup-g1-slice-fit.md`（≤ 60 行）：合理性结论、修正点、实现要点、各件数值与效果图路径、局限与下一步（与姿势蒙皮 / 遮罩 / validate 衔接、真盔甲素材需要的话另起 Tripo 任务）。

## 约束
- 只写：`docs/adr/0002-dressup-slice-fit.md`、`tools/model3d/dressup/{slice_fit.py,tests_slice_fit.py}`、`templates/tpl_f_*/slice_landmarks.json`、`garments/eq_jinzhuang/slice_landmarks.json`、`garments/eq_jinzhuang/shots/slice_fit.*`、`garments/_fixture_armor_*/**` 与本报告。不改现有素材、模板 body.glb、现有工具与门禁；不调用 Tripo、不花点；不加依赖。

检查：
- `python3 tools/model3d/dressup/tests_slice_fit.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`
