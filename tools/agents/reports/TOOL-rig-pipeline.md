# TOOL-rig-pipeline 报告 · 代码工具 · 物品小图 / 装备覆盖层 / 角色部件处理与姿势预览（AR-22）

## 1. 摘要（3–6 行）

已实现 Python 3.11 + Pillow + numpy/PyYAML 的确定性物品图标、装备覆盖层、角色部件 manifest、步态纯函数与三视图姿势预览工具。
真实九阴秘籍与倚天剑基线进入单测，合成部件覆盖三视图×13 源件；18 个 unittest 全部通过，`--check` 会从源图重建并核对哈希/元数据。
当前 `assets/default/item/` 尚不存在，`--all` 因而按约定跳过，实际处理 0 类/0 件；基线素材仅测试，不冒充生产素材。
四项指定门禁均退出 0；未生成正式图片，也未修改规格、物品源图、名录或其他文档。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `tools/item/common.py`、`layer_build.py` | 599 | CIE Lab 色键、8 邻连通、羽化/去溢、裁边/预乘缩放、色板/纹理、模板层、PCA 武器 |
| `tools/item/make_icons.py`、`make_layers.py` | 253 | `<dir>\|--all [--check]`、四档 icon、manifest 写回、三视图覆盖层与 `layers.yaml` |
| `tools/rig/gait.py`、`make_parts.py`、`preview.py`、`templates.py` | 633 | 步态、3×13 部件规范化、39 条 manifest、装备叠加、三行五列预览 |
| `tools/item/test_*.py`、`tools/rig/test_*.py` | 412 | 18 个测试：真实基线、合成图、确定性、篡改/缺件、24×11 步态向量、预览 |
| `tools/item/__init__.py`、`tools/rig/__init__.py` | 2 | unittest 包入口 |
| `tools/agents/reports/TOOL-rig-pipeline.md` | ≤100 | 本报告 |

## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| 图标 | 256/128/64/32；256 主体最长边 `round(256×0.84)=215 px`；边界 3%、种子 ≥40%、ΔE76 18、羽化 10–22、裁边补 `max(4,ceil(8%×最长边))` |
| 武器 | PCA 特征值比 ≥2 用主轴；`lenPx=round(lengthM×256)`，倚天默认 `1.00×256=256 px`；握点由柄端比例变换 |
| 装备层 | 六类目录；每 slot PNG 为 `front34/back34/side` 横排，三条 `sourceRect`；衣物 10 slot、盔甲 4、鞋 2、腰带 1 |
| rig | 三视图×13 源件=`39` manifest 记录；共享下肢由运行时展开至 16 基础槽；前臂 `restAngle=-90°` |
| 预览 | 待机+四相位、三视图：`(5×256+4×16)×(3×320+2×16)=1344×992` |
| 测试 | 18/18 通过；规格步态 `walk/run×light/medium/heavy×4`=`24` 行，每行 11 数值 |

## 4. 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| TOOL-RIG-O01 | 正式 SVG 模板尚未由 ART-rig-parts 交付 | 先用代码内建确定性 mask；ART 提供 `fill/edge/forbidden` SVG 后替换并重录金样 |
| TOOL-RIG-O02 | 非对称/镜像不安全装备缺专图 | 默认只产基础 strip；`mirrorSafe:false` 在素材批次补 `__mirror.png` 后方可发布 |
| TOOL-RIG-O03 | 当前无生产物品类别、无男女真实 rig set | `--all` 成功处理 0 件；由 TOOL-item-sprites-run / ART-rig-parts 提供输入再重跑 |
| TOOL-RIG-O04 | 部件像素到 §1 米长需 ART 定稿 | 工具由实际 alpha 裁边定 pivot/child；交付前由 ART 在 manifest 复核整数点与关节米长 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案；沿用 DES-rig 的 RIG-P01/RIG-P02，本工具不改变玩法、ID 或运行时预算。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/tech/09-character-rig.md` | §6.3 | CLI 实际为 `<set_dir> [--equipment id,id] --out`；任务要求比旧规格多待机列，预览为五列；正式 SVG 到位前模板为内建 mask |
| ART-rig-parts 交付说明 | manifest / 模板 | 提供三视图×13 PNG；允许工具写 `parts`，ART 复核 pivot/child/restAngle；补正式 SVG 与镜像不安全表 |
| ENG-12 | rig/装备加载器 | 读取 `tianshu-rig.v1 parts[]` 与 `layers.yaml items[]`；运行时展开共享下肢，先加 `restAngle` 再镜像 |
| TOOL-item-sprites-run | 批处理 | 生产目录合入后运行两个 `--all` 再运行两个 `--all --check`，失败项进入人工修图队列 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 工具清单/用法：`make_icons.py <dir>|--all [--check]`；`make_layers.py <dir>|--all [--check]`；`make_parts.py <set_dir> [--check]`；`preview.py <set_dir> [--equipment id,id] --out <png>`。
- ✅ 图标：真实秘籍/倚天样本覆盖色键边缘、内部象牙区保留、四档尺寸、manifest 哈希、两次生成一致及篡改检测。
- ✅ 覆盖层：真实倚天+合成兵器/衣物/头饰覆盖 PCA、长度、握点、主色板、模板、三视图和 `layers.yaml --check`。
- ✅ rig/步态：合成三视图×13 部件、39 记录、缺件/篡改/非法前臂角拒绝；24×11 规格向量全过。
- ✅ 预览：合成示例在测试临时目录生成 `preview.png`，尺寸 1344×992，包含装备叠加且逐像素确定；正式示例路径约定为 `assets/default/rig/<set>/preview/<set>__pose-strip.png`，当前无真实 set，未越权持久化图片。
- ✅ 指定命令：`unittest discover` 18/18；两个 `--all --check` 均为 0 件且退出 0；`check_ids --strict` 新增问题 0（仓库基线已知未定义 1）。
- ✅ 已实际运行两个 `--all`；处理类别 0、物品 0、生成资产 0，原因是生产 `assets/default/item/` 尚未合入。
- ⚠️ 规格偏离：模板为程序 mask，未实现正式 SVG 的 fill/edge/forbidden 与 6 px cosine 接缝；镜像专图、满载/透明/debug/SSIM 金样、披风/武器动态跟随属后续 ART/ENG-12 门禁；本次最接近实现并未冒称完成。
- ⚠️ 预览按任务正文采用“待机+四相位”五列，高于规格 §6.3 的旧四列表；当前 `--equipment` 接收物品 ID 列表并自动查 `layers.yaml`，不是旧表写的文件参数。
- ✅ 交接：ART-rig-parts 先产三视图×13 源图后执行 `make_parts`/`preview`；ENG-12 复用 `gait.pose` 数学语义、manifest/layer 字段和上述前臂镜像顺序。
- ✅ 仅新增授权目录文件；无网络、无 git 状态变更命令；`utree flush` 已执行；`git diff --check` 通过。
