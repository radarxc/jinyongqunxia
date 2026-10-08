# 本任务：3D 纸娃娃换装 · 阶段 E2 · 网格层：从劲装整身模型抽出衣服壳 → 贴合 → 门禁 → 入库（含娇小 / 修长重贴合；AR-102 / AR-104）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§4、§5.1、§5.3~§5.5、§6、§7、§10 D / E、§11）、`docs/tech/10-paper-doll-3d.md` §2.2~§2.4、`tools/model3d/dressup/README.md`，以及 A1 / A2 / A4 / A5 / E1 报告第 7 节（基础库、skeleton.json、`fit_garment.py` / `refit_template.py`、`validate.py` / `textures.py` / `pack_glb.mjs` / `ingest.py`、源件交接）。

## 作者要求
**AR-102**：衣服穿到模板素体上、不穿模、随动作运动、三种体型自动重贴合。作者 2026-10-08 在本地预览看到旧衣服穿模，同意**贴图层与网格层两条路同时试**（「同时试试吧」）；本任务是**网格层**，贴图层是 E3。旧道具（流仙裙等）不是在模板上做的，只作诊断；本件是第一件按新流程（模板底图编辑 → Tripo 整身 → 本地抽壳贴合）做出的衣服，要拿它证明流程可用。

## 输入
- E1 源件：`assets/default/model3d/dressup/garments/eq_jinzhuang/source/tripo_dressed_rig.glb`（穿劲装的整身 Tripo 模型，带 Tripo 65 骨绑骨与贴图）与 `source.json`。
- 模板：`assets/default/model3d/dressup/templates/tpl_f_medium/`（`body.glb`、`skeleton.json`、`regions.npy` 为逐顶点 u8 区域、17 区见 `skeleton.json.regions.ids`）；派生 `tpl_f_small` / `tpl_f_tall`（共拓扑、共骨名）。
- 衣图底板与模板底图（同画布）：`assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png`、`…/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png`（可用来建立"衣服色 / 皮肤色"样本：两图人物区内差异大的像素是衣服，差异小的是皮肤与三角裤）。

## 要做的事
1. **`tools/model3d/dressup/extract_garment.py`**：`--dressed <整身 glb> --body <模板 body.glb> --skeleton <skeleton.json> --slot body --id <id> --out <dir> [--plate <衣图> --base-plate <模板底图>] [--keep-regions …] [--json]`：
   - **对齐**：复用 A4 `fit_garment.align_joints`（≥ 6 个对称躯干关节 Umeyama，det = +1，再用 Tripo 自带权重做逐骨姿态校正）把整身模型摆到模板 bind 空间；`align.residualMu` 换算成 %H 写进 `extract.json`（躯干关节验收 ≤ 2% H，腕 / 脚单独报告）。
   - **分割**：对每个三角给"衣服 / 身体"标签，依据三项并写出各自贡献：① 到模板体表的带符号距离（A1 `signed_distance`，几何最近面）；② 贴图颜色（在 UV 处采 baseColor，用底板样本在 Lab 空间分类，不写死颜色常数）；③ 最近模板顶点的区域（劲装 slot body 允许 torsoUpper / torsoLower / hips / upperArmL/R / forearmL/R / thighL/R，永不包含 head / neck / handL/R / footL/R / shinL/R）。三角邻接图上做多数平滑、去掉小岛、补小洞；报告每一步的三角数变化。
   - **输出**：① 衣服壳子网格，**保留源件 skin 与原坐标**（`<out>/<id>_raw_skinned.glb`，供 fit_garment 的关节对齐路径）；② 同一子网格对齐到模板 bind 空间、去掉 skin（`<out>/<id>_raw_aligned.glb`）；③ `extract.json`（对齐残差、各标签依据的计数、开口边界环数量与周长（预期领口 1、袖口 2、下摆 1）、连通块、到体表距离 p50 / p90 / max mm、覆盖区域面积占比）；④ 质检图 `extract_front.png` / `extract_back.png`：Pillow 软光栅正交前视 / 后视，模板轮廓灰色、衣服壳按标签着色（协调者不开浏览器也能看）。
2. **`fit_garment.py` 加 `--align auto|joints|landmarks|none`**（默认 `auto` = 现行为，**不改既有输出**）：`none` 表示输入已在模板 bind 空间，跳过对齐，走模板权重转移。只追加分支与测试，`tests_garment.py` 原有用例全部照过。
3. **贴合两种权重来源并比较**（劲装 slot body，严格模式，`--push-mm 3`，`--iters` 按需但为真上限）：
   - A：`<id>_raw_skinned.glb` 走关节对齐 + 源件权重过滤（`--align joints`）；
   - B：`<id>_raw_aligned.glb` 走 `--align none` + 模板权重转移；
   - 两者都跑 `validate.py`（同骨架 idle / walk / run 各 24 帧动态穿透、静态残留、翻面、边长、遮罩禁区），报告并排写数字，**选动态穿透更低者**作为正式件（并列时选 B），选择依据写进 `fit.json.notes` 与报告。
4. **进包与入库**：`textures.py --double-sided` → `pack_glb.mjs --simplify`（目标 ≤ 3 万三角）→ 对打包件再跑 `validate.py` → `ingest.py garment eq_jinzhuang --src <dir> --template tpl_f_medium --slot body --item eq_jinzhuang`，写 `assets/default/model3d/dressup/garments/eq_jinzhuang/manifest.yaml`（`source:` 记 E1 的 Tripo 项目 ID、源件与底板 sha256；status 按 report.level）。`source/` 目录原样保留，不进 manifest 的 `file`。
5. **跨模板**：`refit_template.py` 到 `tpl_f_small` / `tpl_f_tall`，各跑 `validate.py`（用目标模板自己的 clip），结果写进 manifest 的 `fits:`（不过门禁的写 `status: draft` 并如实记数）。
6. **`tools/model3d/dressup/tests_extract.py`**：合成"圆柱身体 + 外套筒（不同颜色贴图）+ 露出的手 / 头"的整身网格，验证分割标签、开口环计数、区域约束（手 / 头不进衣服）、输出两种 GLB 的顶点与源一致（skinned 版坐标逐位相等）。

## 协调者实测意见（第 1 轮中途，2026-10-08 04:55；第 1 次运行因 GPT-5.6-Sol 速率限制中断，续作时照做）
看了 `extract_run/extract_front.png` 与 `extract.json`：衣服壳胸口中间缺一大块**矩形**、右上臂只抽到一半、衣摆块状缺口；48 个连通块、14 个开口环（应为 4）；覆盖率 torsoUpper 0.42 / upperArmR 0.48 / forearmL 0.52；候选 A / B 都 draft（静态残留 246、动态穿透 5–6%、翻面 521）。
1. **矩形块状缺口像 UV 采样错了**（整块 UV 岛被判成皮肤）：检查贴图采样是否按 glTF 约定（UV 原点左上、`v` 向下，Pillow 行 0 = 图像顶，不要再 `1 − v`），对照 E3 的 `bake_texture_layer.py`（同一张 Tripo 贴图、颜色位置正确）逐点核对；再出一张"按采样颜色给整身模型上色"的质检图 `extract_color_check_front.png` 证明采样正确（应与 E1 封面一致）。
2. 分割以颜色为主、距离为辅：劲装贴身处离体表只有几毫米，距离判据会把它判成身体；颜色样本取自衣图底板人物区"与模板底图差异大"的像素，Lab 空间分类后再做区域约束与网格平滑。
3. 达到验收前不要进入贴合：开口环 = 4、torsoUpper / torsoLower ≥ 0.9、双臂 ≥ 0.85、连通块 1（允许腰带垂带另成 1~2 块，写进报告）。
4. `tests_garment.py` 会重写 `garments/_fixture_bodysuit/**` 的计时字段——那是 A4 的产物，不在本任务写集：提交前 `git checkout -- assets/default/model3d/dressup/garments/_fixture_bodysuit` 还原。
5. 候选 A / B 只保留选中的正式件；对比数字写报告，`candidate_a/` `candidate_b/` 目录不要入库。

## 协调者裁定（2026-10-08 06:35，看第 3 次运行产物并在 5173 实测后）
第 3 次运行抽壳已达标（1 个连通块、4 个开口、覆盖率达标），但三体型 `report.level` 均 fail（中码动态穿透 8.3~8.9%、静态残留 71、翻面 267），按原规则不能入库，执行器因此没有写 manifest，任务卡在"缺文件"。协调者把中码件临时挂到 5173 实测（三种穿法并排）：
- 网格层按区隐藏身体：有体积与垂坠，但 **V 领与胯下出现黑洞**（torsoUpper / hips 整区被隐藏，而交领开口与衣摆下方本应露皮肤）；
- **网格层 + E3 贴图层、不隐藏身体**：黑洞消失，穿透处露出的是贴图层画的衣服色，效果最好（作者将据此定默认路线）。
据此：
1. **实验件入库**（AR-106 对比用）：report.level 为 fail 时**仍按标准布局入库**——`garments/eq_jinzhuang/{eq_jinzhuang.glb, fit.json, report.json, manifest.yaml}`，small / tall 用 `fits:` 变体（`eq_jinzhuang.tpl_f_small.glb` 等）；manifest 由本任务直接写（不经 ingest.py 的 fail 拦截），条目字段：`status: draft`、`experimental: true`、`gateLevel: fail`，notes 写全身口径的门禁数字。删除 `package_*` 目录。
2. **`hideRegions` 置空**：fit.json 的 `hideRegions: []`，原计算结果另存 `hideRegionsComputed`；notes 写明"与贴图层 `dressup__layer__eq_jinzhuang` 叠穿使用"。
3. **毛边清理**：领口 / 袖口 / 衣摆的切边目前是白色碎齿。去掉只挂两条边界边的"齿状"三角、沿每个开口环做边界平滑（只动边界附近 1~2 环顶点），边界附近贴图呈皮肤色的三角删除；可选沿开口向内折 3~5 mm 的窄边（用相邻衣服色）以盖住切口。前后对比写进报告，出 `extract_edges_detail.png`。
4. validate 照常跑、数字如实写；不改门禁阈值；不改 validate / ingest。

## 验收（协调者会实测）
- 躯干关节对齐残差 ≤ 2% H；衣服壳开口环 = 4（领、两袖、下摆），无头 / 手 / 脚 / 小腿三角；
- 正式件严格模式：`highConfidence ≥ 0.85`、静态残留 0、安全距不足 0、翻面 0、边长合格 ≥ 99%；动态穿透 draft ≤ 2%（争取 approved ≤ 0.5%）；`hideRegions` 含 torsoUpper / torsoLower / hips，不含 neverHide；
- 三套模板都有文件与 report，manifest 与 report.level 一致；打包件 ≤ 3 万三角、贴图 ≤ 2048²。

## 约束
- 只写 `tools/model3d/dressup/{extract_garment.py,tests_extract.py,fit_garment.py,tests_garment.py}`、`assets/default/model3d/dressup/garments/eq_jinzhuang/**`（`source/` 只读）与本任务报告；`fit_garment.py` / `tests_garment.py` 只做第 2 条的追加。
- 不改基础库（`glb_io.py` / `common.py` 只能追加函数）、不改 validate / textures / pack / ingest；不加依赖；不改门禁阈值；不花 Tripo 点数。

检查：
- `python3 tools/model3d/dressup/tests_extract.py`
- `python3 tools/model3d/dressup/tests_garment.py`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：对齐残差（%H，躯干 / 腕 / 脚分开）、分割各依据计数与平滑前后三角数、开口环、A / B 两种权重来源的 validate 并排数字与选择、正式件 fit / report 关键量、三模板 refit 结果、耗时与峰值内存；第 4 节写分割失败模式（衣服与皮肤同色、腰带结、衣摆开衩）；第 7 节写给 C2（Skill 手册）的命令序列与给 E3 的复用接口。报告 ≤ 80 行。
