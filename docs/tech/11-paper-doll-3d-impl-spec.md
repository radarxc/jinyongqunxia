# tech/11 · 3D 纸娃娃换装 · 实现 Spec（交 traex 执行）

> 依据：作者需求 AR-102（素体改模板、头身分离、三种体型模板、骨架唯一、装备贴合代码化并沉淀为 Skill）、AR-103（先出方案与 spec，代码与门禁交 traex GPT-5.6-Sol xhigh，Claude 只规划与阶段验证）；方案见 `docs/tech/10-paper-doll-3d.md`。
> 本文是**实现契约**：目录、文件归属、命令行、数据格式、运行时 API、门禁阈值、阶段划分与验收。执行器只改任务声明的文件；与方案文档冲突时以本文为准，与已核验事实冲突时以事实为准并在报告里写明。
> 分工：traex（GPT-5.6-Sol，xhigh）写代码、跑脚本、跑 `pnpm check` 与 validate 门禁；Claude 每个阶段结束后做验证（§10），作者看图定稿。

## 目录

0. 术语与单位
1. 目录与文件归属
2. 阶段与任务
3. 命令行约定
4. `skeleton.json`
5. 离线贴合算法与 `fit.json`
6. 门禁 `report.json`
7. `manifest.yaml` 与进包
8. 运行时 API（`packages/render/src/dressup`）
9. 分块与预算
10. 阶段验收（Claude 验证清单）
11. 禁区（被核验驳倒的做法）
12. 任务登记草案（`tools/agents/tasks.json`）

---

## 0. 术语与单位

- **模型单位（mu）**：GLB 原始坐标。Tripo 导出按 AABB 最长边归一化（身体最长边 = 身高 ≈ 0.98；道具最长边多数 ≈ 0.98，有例外 0.90 / 0.95，且 AABB 边 ≠ 物体主轴长，剑斜放时主轴 1.44）。运行时按角色身高缩放到米：`scale = heightM / bodyHeightMu`。所有离线脚本只在 mu 里算；JSON 数值字段名带单位后缀 `Mu` / `M` / `Deg` / `Mm`，不混用。
- **素体正本（canonical body）**：唯一骨架来源。过渡期 = `assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/anim_idle_walk_run.glb`（Tripo 原版：1 个 primitive、105,991 顶点、198,436 三角、65 根 `mixamorig:*`、rest = bind（IBM 反推与节点 TRS 差 < 1e-6）、自带 idle 15.333 s / walk 2.333 s / run 1.25 s、`KHR_materials_unlit` 已在 extensionsUsed 但材质仍带 normal / metallicRoughness 贴图）。`model_rig.glb`（本地缝头版，2 primitive、222,460 顶点）骨架与它不一致（RightHand 差 2.57°、RightForeArm 9.41°），**不再作为任何插槽 / 权重的基准**。新模板（AR-102，`tpl_f_small / tpl_f_medium / tpl_f_tall` 与男三型）到位后，正本切换为各模板的 `body.glb`，全部派生数据由脚本重算。
- **骨名**：GLB 内 `mixamorig:Hips`；three `GLTFLoader` 载入后被清洗为 `mixamorigHips`（`PropertyBinding.sanitizeNodeName`）。运行时映射一律用清洗后的名字；离线 JSON 用 GLB 原名。
- **规范 A 姿势**：以正本 bind pose 为准（当前上臂与竖直夹角 39.2°、前臂 49.1°）。装备参考图必须由模板 A 字图做图像编辑得到，姿态逐像素一致；不同来源的图之间残差（现有道具：腕 10–15 cm）只能靠姿势对齐（骨局部旋转）消，不能靠相似变换消。
- **头身分离**：模板 = 颈以下；头按角色单独出；所有模板共用同一**规范颈环**（Neck 关节高度 + 0.006 mu 处水平切片拟合圆）与**规范头尺寸**（头宽 0.0971 / 头深 0.1171 / 头围 ≈ 0.3248 mu，均从 Head 权重 ≥ 0.5 的顶点壳量得）。
- **身体区域（region）**：17 区位掩码，顶点按最大权重关节归区，GLB 自定义属性 `_REGION`（u8），three 侧读作 `_region`。

## 1. 目录与文件归属

```
tools/model3d/dressup/                 离线流水线（Python 3.11：numpy / scipy / Pillow；Node 22）
  glb_io.py        GLB 读写：JSON+BIN、accessor（byteStride / normalized / sparse 报错）、节点局部与世界矩阵、skin、图片字节；
                   写：numpy → accessor/bufferView（4 字节对齐、min/max）、JOINTS_0 u16、WEIGHTS_0 f32、_REGION u8、材质/贴图、KHR_materials_unlit；
                   "按模板 skin 写蒙皮 GLB"（joints 顺序与 inverseBindMatrices 逐字节复制模板）；遇 EXT_meshopt_compression 自动调 meshopt_decode.mjs
  common.py        Umeyama（可判镜像）、四元数/矩阵、PCA、点-三角最近点（Ericson 5.1.5 向量化）、cKDTree 最近三角（k 候选 + 精确）、LBS、
                   带符号距离（最近体表点连线·插值法线）、拉普拉斯平滑、邻接/连通块/边界边
  meshopt_decode.mjs   解 EXT_meshopt_compression（three/examples/jsm/libs/meshopt_decoder.module.js），保留 KHR_mesh_quantization 语义
  pack_glb.mjs     进包：可选 --simplify（three 自带 meshopt_simplifier.module.js，LockBorder，保留 UV/JOINTS/WEIGHTS/_REGION）、
                   EXT_meshopt_compression 编码（devDependency meshoptimizer，由本任务 pnpm add -Dw 加入）
  textures.py      basecolor ≤ 2048² JPEG q85；删除 normal / metallicRoughness 的 texture / image / bufferView（真正从 BIN 删块）；KHR_materials_unlit；doubleSided
  inspect.py       体检（--json）：节点树 / 骨架 / 包围盒 / 材质 / 蒙皮统计 / A 姿势角 / rest=bind 校验 / 连通块 / 边界边
  export_skeleton.py   正本 → skeleton.json（§4）+ regions 旁路文件
  normalize_prop.py    刚性道具归一化（§5.2）→ <id>.glb + fit.json
  fit_garment.py       衣物 / 发型贴合（§5.3）→ <id>.glb（蒙皮，skin 与正本一致）+ fit.json
  refit_template.py    跨模板重贴合（§5.4）
  validate.py          门禁（§6）→ report.json
  ingest.py            manifest.yaml 入库（§7）
  selftest.py          合成小网格自测（glb_io round-trip、LBS、最近点、Umeyama、推离），退出码 0
  README.md            一页说明
packages/render/src/dressup/           运行时（独立懒加载 chunk render-dressup）
  types.ts  skeleton-frame.ts  materials.ts  actor.ts  runtime.ts（唯一 import() 入口）  *.test.ts
packages/render/src/character-viewer/  预览页 viewer（已存在，未提交）：加 attachExternal / detachExternal / setUnlitMode
apps/game/src/pages/Character3dPage.vue   预览页（已存在，未提交）：加「换装 v2」选项卡
apps/game/build/content-plugin.ts      分块规则 dressupLazyChunk → render-dressup；调用 publishDressupAssets
apps/game/build/dressup-assets.ts      扫描 assets/default/model3d/dressup/**/manifest.yaml，status != rejected 的 file / fit / report 复制到 apps/game/public
tools/perf/check_size.mjs + check_size.test.mjs + budgets.json   新增 render-dressup 记录与预算 24 KiB gz
.claude/skills/dressup-3d/SKILL.md     操作手册（`.claude/` 在 .git/info/exclude 里，入库要 git add -f）
assets/default/model3d/dressup/        资产（每叶目录一份 manifest.yaml）
  templates/<template_id>/  body.glb（unlit、≤2048²、带 idle/walk/run）、skeleton.json、regions.npy、preview.png
  heads/<npc_id>/           head.glb（规范颈环、按规范头尺寸归一）             ← 阶段 D
  garments/<item_id>/       <item_id>.glb、fit.json、report.json
  hair/<item_id>/           同 garments
  props/<item_id>/          <item_id>.glb、fit.json、report.json
```

文件归属按任务划分见 §12；任务之间不得改对方文件。`glb_io.py` / `common.py` 是基础库，后续任务只能新增函数（追加，不改既有签名）。

## 2. 阶段与任务

| 阶段 | 任务 ID | 内容 | 依赖 | 验收（Claude 做） |
|---|---|---|---|---|
| **A 离线基础** | `ENG-dressup-a1-glbio` | glb_io / common / meshopt_decode / inspect / selftest / README | — | §10.A |
| | `ENG-dressup-a2-skeleton` | export_skeleton.py，正本 → skeleton.json | a1 | §10.A |
| | `ENG-dressup-a3-prop` | normalize_prop.py；实跑剑 / 斗笠 / 玉佩 | a1 | §10.A |
| | `ENG-dressup-a4-garment` | fit_garment.py + refit_template.py；实跑流仙裙 / 夜行衣 / 马尾 | a1, a2 | §10.A |
| | `ENG-dressup-a5-gate` | validate.py / textures.py / pack_glb.mjs / ingest.py / dressup-assets.ts（+测试） | a1 | §10.A |
| **B 运行时** | `ENG-dressup-b1-runtime` | packages/render/src/dressup/*、content-plugin 分块规则与 publishDressupAssets 接线、check_size / budgets | a5（接口） | §10.B |
| | `ENG-dressup-b2-preview` | viewer attachExternal / unlit 模式；Character3dPage「换装 v2」面板；window.__dressup | b1、阶段 A 产物 | §10.B |
| **C 端到端与 Skill** | `ENG-dressup-c1-e2e` | 用阶段 A 脚本把正本 + 6 件装备跑完入库（templates/tpl_f_medium、props×3、garments×2、hair×1），report 全部 ≥ draft | a2–a5 | §10.C |
| | `ENG-dressup-c2-skill` | `.claude/skills/dressup-3d/SKILL.md` + AGENTS.md 入口一行 | a1–a5, b1–b2, c1 | §10.C |
| **D 模板与头**（需作者 Tripo 点数） | `ART-dressup-d1-templates` | 三套女模板 A 字图（同底图改比例）→ Tripo 生成 + 绑骨 + 动作 → 入库 templates/tpl_f_{small,medium,tall}；export_skeleton 重算 | c1 | §10.D |
| | `ENG-dressup-d2-head` | 切头 / 缝头脚本：现有 NPC 整身模型按规范颈环切头、按头宽归一、肤色匹配 → heads/<npc_id>/ | d1 | §10.D |
| | `ENG-dressup-d3-refit` | 对 c1 的 3 件衣物跑 refit_template 到 small / tall，门禁 | d1 | §10.D |
| **E 首件真流程**（需作者 Tripo 点数） | `ART-dressup-e1-garment-gen` | 以模板图做 Gemini 图像编辑出一件衣服 → 2D 轮廓门禁 → Tripo 生成（整身绑骨路线）→ 关节级 Umeyama 残差报告 → 贴合入库 | d1 | §10.E |
| | `ART-dressup-e2-merge-rig-test` | 20 点实验：合体上传整体绑骨，核对顶点数是否不变、按坐标取回权重 | d1 | §10.E |

阶段 A / B / C 不花 Tripo 点数、不需要浏览器，只用仓库现有文件，可以立刻开工；D / E 需要作者 Chrome 里的 Tripo 与 Gemini（走 `tripo-web` / `gemini-imagegen` 技能，Opus 子代理驱动），本 spec 只定输入输出，不展开操作。

## 3. 命令行约定

- Python：`python3 tools/model3d/dressup/<script>.py --body <正本.glb> … --out <dir> [--json]`。退出码 0 成功、2 参数 / 输入错误、3 门禁不过。`--json` 时 stdout 只打印一个 JSON 对象，其他信息走 stderr。
- Node：`node tools/model3d/dressup/<script>.mjs in.glb out.glb [--simplify 0.3] [--no-meshopt]`。
- 压缩输入：Python 脚本遇到 `EXT_meshopt_compression` 自动调用 `meshopt_decode.mjs`（子进程 `node`）解到临时目录再读；不要求用户手动解压。
- 默认路径：相对仓库根；脚本用 `os.path` 推导仓库根，不写死 `/Users/...`。临时文件只写 `--out` 或系统临时目录。
- 每个脚本有 `--help`（中文）、文档字符串、`--version` 不需要；每个脚本可单独运行也可被 import（`main(argv)`）。

## 4. `skeleton.json`（`export_skeleton.py` 从正本派生）

```jsonc
{
  "schema": "tianshu-dressup-skeleton.v1",
  "source": { "file": "assets/default/model3d/dressup/templates/tpl_f_medium/body.glb", "sha256": "…", "generator": "Tripo" },
  "unit": "mu", "heightMu": 0.9796, "defaultHeightM": 1.65, "mPerMu": 1.6844,
  "joints": ["mixamorig:Hips", "…65 个，顺序 = GLB skin.joints"],
  "parents": [-1, 0, "…"],
  "bindWorld": { "mixamorig:Hips": [16 个 float，列主序], "…": [] },   // rest=bind 校验：inv(IBM) 与节点世界矩阵最大差 < 1e-5，否则退出码 2
  "restPose": { "armAngleDeg": 39.2, "forearmAngleDeg": 49.1 },
  "measures": {                                                        // 全部从蒙皮网格顶点壳算（权重 ≥ 0.5），不用关节距
    "headWidthMu": 0.0971, "headDepthMu": 0.1171, "headCircumferenceMu": 0.3248, "headTopMu": [0, 0.9796, -0.008],
    "shoulderSkinWidthMu": 0.1614, "chestWidthMu": 0.1486, "waistWidthMu": 0.1156, "hipWidthMu": 0.1170,
    "handLengthMu": { "L": 0.1072, "R": 0.1098 }, "handThicknessMu": { "L": 0.0276, "R": 0.0272 }, "footLengthMu": 0.1296
  },
  "neckRing": { "yMu": 0.8421, "centerMu": [0, 0.8421, -0.01], "radiusMu": 0.036, "samples": 32 },
  "sockets": {                                                         // 父骨局部坐标系；pos 为 mu，quat 为 [x,y,z,w]
    "gripR": { "bone": "mixamorig:RightHand", "pos": [], "quat": [], "palmNormalLocal": [], "palmOffsetMu": 0.0153, "radiusMu": 0.014 },
    "gripL": {}, "headTop": { "bone": "mixamorig:Head" }, "headCenter": { "bone": "mixamorig:Head" }, "neck": { "bone": "mixamorig:Neck" },
    "chest": { "bone": "mixamorig:Spine2" }, "back": { "bone": "mixamorig:Spine2" },
    "waistL": { "bone": "mixamorig:Hips" }, "waistR": {}, "waistBack": {}, "footL": { "bone": "mixamorig:LeftFoot" }, "footR": {}
  },
  "regions": {
    "ids": { "head": 0, "neck": 1, "torsoUpper": 2, "torsoLower": 3, "hips": 4, "upperArmL": 5, "upperArmR": 6, "forearmL": 7, "forearmR": 8,
             "handL": 9, "handR": 10, "thighL": 11, "thighR": 12, "shinL": 13, "shinR": 14, "footL": 15, "footR": 16 },
    "jointToRegion": { "mixamorig:Head": "head", "mixamorig:HeadTop_End": "head", "mixamorig:Neck": "neck", "mixamorig:Spine2": "torsoUpper",
                       "mixamorig:Spine1": "torsoLower", "mixamorig:Spine": "torsoLower", "mixamorig:Hips": "hips", "…": "" },
    "file": "regions.npy"                                               // 每顶点 u8 区域 id，与 body.glb 顶点顺序一致
  },
  "fingerPose": { "fist": { "mixamorig:RightHandIndex1": [0, 0, 0, 1], "…": [] } }   // 右手 15 根 + 左手 15 根指骨局部四元数
}
```

插槽求法（核验修正后的做法，§11 第 4 条）：
- `gripR/L`：取该手 `RightHand` 权重 > 0.9 的掌心核心顶点在骨局部系的质心；掌面法线取手部顶点 PCA 最薄轴，朝掌心侧（拇指所在侧）；握轴点 = 质心 + (palmOffsetMu + 柄半径) × 掌心法线；握轴方向 = Index1 → Pinky1 连线；左右分别算，不镜像。
- `headTop`：Head 权重 ≥ 0.5 顶点中 y 最高 3 mm 簇的质心（不用 `HeadTop_End`，它比网格顶高 0.038 且前偏）。
- `chest / back / waist*`：对应骨权重顶点壳的外表面点 + 法线（关节本身埋在皮下 ≈ 0.04 mu）。
- `fingerPose.fist`：从 idle 第 0 帧采样指骨局部四元数，再向握拳方向加紧 25°~35°。

## 5. 离线贴合算法与 `fit.json`

### 5.1 对齐（装备共用）
1. 解压 → 读几何 / 材质 / 贴图。
2. `--kind garment|hair|prop|head`。
3. garment / hair 若自带 Tripo 骨架（整身绑骨路线）：用 ≥ 6 个躯干关节（Hips / Spine / Spine1 / Spine2 / Neck / LeftArm / RightArm / LeftUpLeg / RightUpLeg）对正本做 Umeyama 相似变换（可判镜像）作粗配，再用骨局部旋转差做姿势对齐（分骨非均匀缩放按骨长比）；逐关节残差写 `fit.json.align.residualMu`。
   无骨架：语义锚点——颈桩顶 → `neckRing.centerMu` 高度、脚底 → y = 0、偏航：水平 PCA 宽度轴对齐 X、按高度缩放；残差写入。
4. prop：§5.2。

### 5.2 刚性道具 `normalize_prop.py`
- `--class weapon|hat|pendant|pouch|fan|scroll|beads|gourd|generic --real-size-m <m> [--size-axis length|width|height] [--flip] [--grip-ratio 0.07] [--keep largest|all]`。
- 连通块统计（匕首 + 鞘、香囊 + 穗是多块；`--keep` 决定）→ PCA 主轴 → +Y；weapon：柄端由剖面宽度判定（窄端 = 柄），握点 = 柄尾起 `gripRatio` 处移到原点，刃面（第二主轴）→ +Z；hat：锥顶 → 原点、开口向 −Y；pendant / pouch：绳顶（y 最高簇质心）→ 原点；generic：AABB 中心 → 原点。
- `scaleApplied = realSizeM / (measuredLengthMu × mPerMu)`，`measuredLengthMu` 按主轴 / 语义长度而非 AABB 边。
- 输出：顶点已变换的 GLB（节点无 TRS，unlit，只留 baseColor 引用）+ `fit.json`：

```jsonc
{ "schema": "tianshu-dressup-fit.v1", "kind": "prop", "class": "weapon", "id": "item_qingfeng_sword",
  "source": { "file": "apps/game/public/models/props/item_qingfeng_sword_raw.glb", "sha256": "…" },
  "body": { "file": "…/tpl_f_medium/body.glb", "sha256": "…" },
  "realSizeM": 1.0, "sizeAxis": "length", "measuredLengthMu": 1.441, "scaleApplied": 0.41,
  "anchor": "grip", "forward": "+Z", "up": "+Y", "socket": "gripR", "gripAdjust": { "pos": [0, 0, 0], "quat": [0, 0, 0, 1] },
  "stats": { "vertices": 0, "triangles": 0, "components": 2, "boundaryEdges": 0 } }
```

### 5.3 衣物 / 发型 `fit_garment.py`
- `--kind garment|hair --slot body|innerBody|hands|feet|waist|cape|shoulder|head --id <id> [--remove-body-stub] [--push-mm 3] [--iters 3] [--coverage 0.65]`。
- 对齐（§5.1）→ 删除衣内假人（可选：与正本体表距离 < 1 mm 且法线反向的三角）→ **权重转移**：每顶点找正本最近三角（cKDTree k=16 质心候选 + 精确点-三角），重心插值 4 骨权重；置信 = 距离 ≤ 5% 对角线且法线夹角 ≤ 30°；低置信顶点按邻接做拉普拉斯扩散填充；**按 slot 限制关节集合**（body 裙摆：Hips / UpLeg / Leg，禁 Foot / Toe；袖：Shoulder / Arm / ForeArm / Hand；hair：Head / Neck / Spine2），归一化到 ≤ 4 骨 → **推离**：带符号距离 < pushMm 的顶点沿体表法线推出，`iters` 轮，每轮后拉普拉斯 1 次 → **遮罩统计**：对每个 region，被衣物覆盖（衣物三角在体表外 ≤ 15 mm、法线同向、射线遮挡）的面积占比 > `coverage` → `hideRegions`；`neverHide = [handL, handR, footL, footR]`。
- 输出：1 node + 1 mesh（1 primitive）+ skin（joints 顺序与 IBM 逐字节复制正本）+ unlit 材质；`fit.json`：

```jsonc
{ "schema": "tianshu-dressup-fit.v1", "kind": "garment", "slot": "body", "id": "cloth_xianxia_dress",
  "source": {}, "body": {},
  "align": { "method": "landmarks|joints", "scale": 1.02, "yawDeg": 90, "residualMu": { "neckTop": 0.004, "feet": 0.0 } },
  "weights": { "method": "nearest-triangle-barycentric", "highConfidence": 0.91, "maxBones": 4, "jointsAllowed": [] },
  "pushOut": { "mm": 3, "iters": 3, "movedVertices": 7238, "residualInside": 0 },
  "hideRegions": ["torsoUpper", "torsoLower", "hips", "thighL", "thighR"], "neverHide": ["handL", "handR", "footL", "footR"],
  "spring": null,
  "fitVersion": 1 }
```

- 长裙 / 宽袖（离体表 > 10 cm）：最近三角会把权重分给脚趾 → 必须靠 `jointsAllowed` 与"到关节线段距离"加权混合（Hips 为主、腿骨渐变），阶段 A 先用关节集合限制，弹簧链（`spring`）留 Phase B+。

### 5.4 跨模板 `refit_template.py`
- `--from-body A --from-skeleton A.json --to-body B --to-skeleton B.json --garment X.glb --fit X/fit.json --out <dir>`。
- 每顶点：A 权重 LBS 逆到各骨局部 → B 的 bind 骨局部正变换（骨长比缩放）→ 在 B 上推离 + 遮罩统计 → 写 B 版 GLB + `fit.json`（`refitFrom: A`）。恒等回归：A = B 时输出与输入最大位差 < 1e-6。

### 5.5 材质与进包
- 所有换装资产：`KHR_materials_unlit`，只留 baseColorTexture（≤ 2048² JPEG q85），删除 normal / metallicRoughness 及其 image / bufferView；衣物 / 发型 `doubleSided: true`。
- `pack_glb.mjs --simplify <ratio>`：锁边界，保留 UV / JOINTS / WEIGHTS / _REGION；目标三角数：模板 ≤ 8 万、衣物 ≤ 3 万、发型 ≤ 2 万、小件 ≤ 1 万；再 meshopt 编码。

## 6. 门禁 `validate.py` → `report.json`

| 检查 | 阈值 |
|---|---|
| 骨架一致 | 装备 skin.joints 名单 == 模板 joints；IBM 逐元素差 < 1e-5 |
| 权重 | 每顶点和 1 ± 1e-3、≤ 4 骨、无 NaN、关节 ⊆ jointsAllowed |
| 穿透（动态） | 对模板 idle / walk / run 各采 24 帧做 LBS（**同骨架，直接用模板 clip，不 retarget**；sampler LINEAR 插值，CUBICSPLINE 报不支持），装备顶点带符号距离 < −1 mm 的占比：draft ≤ 2%，approved ≤ 0.5% |
| 穿透（静态） | bind 姿势残留 0 |
| 遮罩 | hideRegions ⊆ regions.ids 且 ∩ neverHide = ∅ |
| 道具 | 锚点 \|pos\| < 1e-4 mu、主轴 = +Y、尺寸与 realSizeM 差 ≤ 2% |
| 面数 / 贴图 | 不超过 §5.5 目标；贴图 ≤ 2048² |

`{ "schema": "tianshu-dressup-report.v1", "level": "approved|draft|fail", "checks": [{ "name": "", "pass": true, "value": 0, "threshold": 0 }] }`。level → manifest `status`：approved → `candidate`（待作者看图）、draft → `draft`、fail → 不入库（退出码 3）。

## 7. `manifest.yaml` 与进包

```yaml
- id: dressup__garment__cloth_xianxia_dress
  file: cloth_xianxia_dress.glb
  category: model3d
  kind: dressup-garment          # dressup-template | dressup-head | dressup-garment | dressup-hair | dressup-prop
  slot: body                     # EquipmentSlotSchema 的值（packages/data/src/schemas/item.ts）；prop 用 mainHand / offHand / accessory…
  template: tpl_f_medium
  item: eq_xianxia_liuxianqun    # content/items 物品 id，可空
  fit: fit.json
  report: report.json
  tool: tools/model3d/dressup（fit_garment.py v1）
  source:
    tripo_project_id: …
    references: [ { path: …, sha256: … } ]
  sha256: …
  size_bytes: …
  triangles: …
  status: candidate              # candidate | approved | draft | rejected
  created: '2026-10-07T12:00:00-07:00'
  notes: …
```

进包：`apps/game/build/dressup-assets.ts` 的 `publishDressupAssets(root, copy, copied?, references?)` 扫描 `assets/default/model3d/dressup/**/manifest.yaml`（与 `battle-model-assets.ts` 一样只扫 `file / fit / report / status` 四个字段，不整体解析 YAML），`status != rejected` 的三个文件复制到 `apps/game/public/<同相对路径>` 并 `recordCopiedAssetReference`；由 `content-plugin.ts` 在调用 `publishVfxRuntime` 的同一处调用。

## 8. 运行时 API（`packages/render/src/dressup`）

```ts
export interface DressupSkeletonFrame { /* skeleton.json 的 TS 类型，字段同 §4 */ }
export interface DressupFit { /* fit.json 的 TS 类型，字段同 §5 */ }
export interface DressupEquipSpec { readonly kind: 'garment' | 'hair' | 'prop'; readonly id: string; readonly url: string; readonly fit: DressupFit }
export interface DressupActor {
  readonly root: Group;                                  // 已按 heightM 缩放、脚底 y=0、面朝 +Z
  readonly skeleton: Skeleton; readonly frame: DressupSkeletonFrame;
  setHead(url: string | null, opts?: { skinTint?: ColorRepresentation }): Promise<void>;   // 阶段 D 前可为 no-op 并返回 resolved
  equip(spec: DressupEquipSpec): Promise<void>;
  unequip(id: string): void;
  setHideMask(regions: readonly string[]): void;         // 并集由 actor 按已穿装备自动算；此方法供调试
  setBoneScale(tweaks: Readonly<Record<string, number>>): void;   // 骨长微调（子骨反向补偿），限 ±5%
  playClip(name: string, fade?: number): void;           // 复用模板 clip；持械时覆盖指骨轨道为 fingerPose
  update(dt: number): void;
  stats(): { drawCalls: number; triangles: number; boneTextureUploads: number };
  dispose(): void;
}
export async function createDressupActor(opts: { bodyUrl: string; frameUrl: string; heightM: number; loader?: GLTFLoader; unlit?: boolean }): Promise<DressupActor>;
```

实现要点（均来自核验）：
- **共享骨架**：装备 GLB 的每个 `SkinnedMesh`，把 `skinIndex` 按清洗后的骨名重映射到正本 `skeleton.bones` 下标（缺骨权重清零 + `normalizeSkinWeights`），`mesh.bind(body.skeleton, bindMatrix)` **必须显式传 bindMatrix**（无参会在共享骨架上 `calculateInverses` 把正本弄坏）；装备自带 Skeleton 的 `boneTexture` 要 dispose。装备顶点必须已在正本的绑定姿态模型空间（离线保证）。
- **unlit**：`KHR_materials_unlit` → `MeshBasicMaterial`，仍受 `renderer.toneMapping` 影响，设 `material.toneMapped = false`（或整场景 `NoToneMapping`）；对仍是 PBR 的旧资产，运行时 `MeshStandardMaterial → MeshBasicMaterial({ map })` 并 dispose 旧材质。"关阴影 / 强光"对 unlit 材质是空操作，不作为前提。
- **区域遮罩**：three 把 `_REGION` 改名为 `_region`（值不变）；shader 里 `attribute float _region;`，`flat varying uint vRegion; vRegion = uint(_region + 0.5);`，`uniform uint uHideMask; if ((uHideMask & (1u << vRegion)) != 0u) discard;`；`customProgramCacheKey` 固定；`customDepthMaterial` 同样注入或素体 `castShadow = false`；加载后断言 `geometry.attributes._region` 存在。draw call 数 = 素体 primitive 数（正本 1），与隐藏组合无关。
- **插槽**：`sockets[*]` 建成挂在对应 Bone 下的 `Object3D`（局部 pos / quat 来自 skeleton.json）；prop 的矩阵 = socket · `gripAdjust`；持械时对该手 15 根指骨在 `mixer.update` 之后写 `fingerPose.fist` 四元数（或从 clip 里剔除这些 track）。
- **骨长微调**：`bone.scale` 非均匀缩放会传给子骨，子骨按 1/scale 反向补偿；只允许 ±5%。
- **动画**：装备与正本同骨架，复用正本 clip，不调用 `retargetClip`。

## 9. 分块与预算

- 分块规则在 `apps/game/build/content-plugin.ts`（Rolldown `codeSplitting.groups`，`includeDependenciesRecursively: false`），**不是** vite `manualChunks`：新增 `dressupLazyChunk(id)` 把 `packages/render/src/dressup/**` 分到 `render-dressup`；`GLTFLoader` / `SkeletonUtils` 已在 `battle-model3d`，允许静态依赖它；若用到其他 `three/examples/jsm/**` 附件要逐个点名进 `render-dressup`。
- 入口必须是 `import()` 边界：页面或 battle 场景动态引入 `packages/render/src/dressup/runtime.ts`；`packages/render/src/index.ts` 只 `export type`。
- `tools/perf/check_size.mjs` 新增 `appendRenderLazyRecord('render-dressup', findManifestChunk('render-dressup', { sources: ['packages/render/src/dressup/runtime.ts'], manifestNames: ['render-dressup'] }))`，扣除 render 与 battle-model3d 已计闭包；`budgets.json` 加 `"render-dressup": 24`；`check_size.test.mjs` 补"缺块即失败"断言；`content-plugin.test.ts` 补分块断言。
- render 主 chunk 180 KiB 门不动（现余 0.58 KiB）；换装运行时不得给主 chunk 增加任何静态 import。
- meshopt simplifier（55 KB）只在离线脚本里用，不进运行时。

## 10. 阶段验收（Claude 验证清单）

**A 离线基础**（全部零点数）
- `python3 tools/model3d/dressup/selftest.py` 退出码 0；`inspect.py --json` 正本：joints 65、rest=bind 差 < 1e-5、A 姿势角 39.2 ± 0.5°。
- `export_skeleton.py` 输出含 §4 全部字段；`measures.headWidthMu` 0.097 ± 0.003、`neckRing.radiusMu` 0.03~0.04；`sockets.gripR.pos` 在 RightHand 局部系内 |pos| < 0.06。
- `normalize_prop.py`：剑 measuredLengthMu ≈ 1.44、scaleApplied ≈ 0.41、锚点 |pos| < 1e-4、主轴 +Y；斗笠锥顶在原点；玉佩绳顶在原点。
- `fit_garment.py` 流仙裙：权重高置信率 ≥ 0.85、bind 姿势残留 0、耗时 < 60 s；马尾：hideRegions 为空或仅 head，挂点 headCenter。
- `validate.py` 对以上每件给出 report，流仙裙至少 draft（动态穿透 ≤ 2%）；`textures.py + pack_glb.mjs` 把正本副本压到 ≤ 12 MB、贴图 ≤ 2048²。
- `pnpm check` 全绿（含 `dressup-assets.test.ts`）。

**B 运行时**
- `pnpm check` 全绿；`pnpm size` 报告出现 `render-dressup` 且 ≤ 24 KiB，render 主 chunk 不增长。
- 浏览器 `/character-3d` 「换装 v2」：加载正本 + 流仙裙 + 马尾 + 青锋剑，播放 walk：裙随腿动、剑在右手、马尾贴颅顶；截图与作者图 3 / 图 4 并排；unlit 模式下素体肤色与 Tripo 预览截图 ΔE2000 < 1.5（同一显示器同一浏览器取脸部块）。
- `window.__dressup.stats()`：drawCalls = 素体 1 + 装备数；boneTextureUploads 每帧 1。

**C 端到端与 Skill**
- `assets/default/model3d/dressup/` 下 1 模板 + 3 道具 + 2 衣物 + 1 发型全部有 glb / fit / report / manifest，status 与 report.level 一致；`apps/game/public/assets/default/model3d/dressup/` 同步。
- SKILL.md 每条命令逐个 `--help` 核对；按 SKILL 从零重跑一件道具能复现 report。

**D / E**：模板三套 skeleton.json 的 neckRing 半径差 < 2 mm、头尺寸归一后差 < 1%；refit 后 small / tall 的 report ≥ draft；首件 Gemini 编辑衣服的 2D 轮廓 IoU ≥ 0.9、Tripo 绑骨后躯干关节 Umeyama 残差 ≤ 2% H、腕 / 脚残差单独报告；合体绑骨实验给出"顶点是否不变"的明确结论。

## 11. 禁区（被核验驳倒或修正的做法）

1. 不用 AABB 中心 / 包围盒对齐装备（现有 18 件道具全部按 0.98 归一、锚点在中心，必然失败）；尺度来源只能是 realSizeM × 语义长度，或生成端 `auto_size`（待实测）。
2. 不用 `HeadTop_End` 当头顶；插槽 / 尺寸一律从蒙皮网格顶点壳算，不从关节位置派生。
3. 不把 `model_rig.glb` 与 `anim_idle_walk_run.glb` 混用；穿透统计不跨骨架套 clip。
4. Umeyama 只消全局尺度 / 平移 / 朝向；关节角差必须用骨局部旋转对齐；"3% 内"是零样本假设，必须首件实测。
5. Tripo 不能"用既有骨架蒙皮"，retarget 只认 Tripo rig 的 task_id；单件衣服不单独送 Tripo 绑骨（pre_rig_check 会拒、归一化对不上）。可行：本地权重转移；或"合体上传整体绑骨再按坐标取回权重"（待 20 点实测）。
6. `_REGION` 不会"原样"载入：three 改名小写、按 float 上传；按 §8 写法。
7. 分块不改 vite `manualChunks`；改 content-plugin 的 `codeSplitting.groups` + check_size + budgets 三处一起。
8. 验收线不用 ΔE < 5（ACES 坏图也能过）；用 ΔE2000 < 1.5。
9. 不装 Blender、不装新 pip 包；Node 侧只允许新增 devDependency `meshoptimizer`。
10. 不改 `packages/core`；不改门禁阈值；不在任何测试里加"高负载跳过"。

## 12. 任务登记草案（`tools/agents/tasks.json`）

公共字段：`phase: "PROD"`，`kind: "draft"`，`review: true`（审校 xhigh），`web: true`（pnpm store 写入），`model: "GPT-5.6-Sol"`，`effort: "xhigh"`，`agent_args` 同 `ENG-12c-clip`（pnpm 缓存目录可写）。校验命令统一：`pnpm install --frozen-lockfile`、`pnpm check`、`python3 tools/model3d/dressup/selftest.py`，外加各任务的 `exists`。

| ID | writes | deps | 额外校验 |
|---|---|---|---|
| ENG-dressup-a1-glbio | `tools/model3d/dressup/{glb_io.py,common.py,meshopt_decode.mjs,inspect.py,selftest.py,README.md}` | — | `inspect.py --json <正本>` 退出 0 |
| ENG-dressup-a2-skeleton | `tools/model3d/dressup/export_skeleton.py`、`assets/default/model3d/dressup/templates/tpl_f_medium/{skeleton.json,regions.npy,manifest.yaml}` | a1 | `export_skeleton.py --check` |
| ENG-dressup-a3-prop | `tools/model3d/dressup/normalize_prop.py` | a1 | 实跑 3 件，报告写数字 |
| ENG-dressup-a4-garment | `tools/model3d/dressup/{fit_garment.py,refit_template.py}` | a1, a2 | 实跑 3 件 + 恒等回归 |
| ENG-dressup-a5-gate | `tools/model3d/dressup/{validate.py,textures.py,pack_glb.mjs,ingest.py}`、`apps/game/build/dressup-assets*.ts`、`package.json`、`pnpm-lock.yaml`（只为 meshoptimizer） | a1 | `pnpm test -- apps/game/build/dressup-assets` |
| ENG-dressup-b1-runtime | `packages/render/src/dressup/**`、`packages/render/src/index.ts`、`apps/game/build/content-plugin*.ts`、`tools/perf/{check_size.mjs,check_size.test.mjs,budgets.json}`、`packages/render/CLAUDE.md` | a5 | `pnpm size` 出现 render-dressup ≤ 24 |
| ENG-dressup-b2-preview | `packages/render/src/character-viewer/**`、`apps/game/src/pages/Character3dPage.vue` | b1, c1 | `pnpm --filter ./apps/game build` |
| ENG-dressup-c1-e2e | `assets/default/model3d/dressup/**`、`tools/model3d/dressup/*.py`（只修 bug） | a2–a5 | 每件 report.level ≥ draft |
| ENG-dressup-c2-skill | `.claude/skills/dressup-3d/SKILL.md`、`AGENTS.md` | a1–a5, b1–b2, c1 | `--help` 逐条核对清单写进报告 |

注意：
- 预览页与 character-viewer 当前是**未提交**文件（工作区里），traex 工作区基于已提交基线看不到它们；b2 开工前协调者需先把这两处现状提交到分支（或 b2 的任务说明里附上文件内容）。
- `apps/game/public/models/props/*_raw.glb`（6 件共约 105 MB）未入库且被 gitignore，不复制进仓库；a3 / a4 / c1 的任务说明直接给主检出绝对路径（沙箱可读、不可写），产物（归一化 / 贴合后的小文件）才进 `assets/default/model3d/dressup/`。
- 过渡期正本已复制为 `assets/default/model3d/dressup/templates/tpl_f_medium/body.glb`（= 工作区 `anim_idle_walk_run.glb`，sha256 前缀 647c674f，105,991 顶点；HEAD 里的旧版是 104,219 顶点，不要混用），随本 spec 一起提交。
- `step.py merge` 要求主检出干净；当前主检出有 180+ 个未提交改动时任务可以 start / wait / finish，merge 要等主检出清理后再做。
