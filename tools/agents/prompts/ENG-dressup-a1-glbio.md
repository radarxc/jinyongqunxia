# 本任务：3D 纸娃娃换装 · 阶段 A1 · 离线基础库（glb_io / common / meshopt_decode / inspect / selftest；AR-102 / AR-103）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`，再读 `docs/tech/11-paper-doll-3d-impl-spec.md`（实现契约，**本任务的唯一规格**）与 `docs/tech/10-paper-doll-3d.md`（方案，只需 §0 总览与 §6 断言清单）。

## 作者要求
`docs/decisions/author-requirements.md` **AR-102**：装备贴合全部代码化、不依赖 Blender、不手写常数；**AR-103**：代码与门禁由执行器把控。本机只有 Python 3.11 + numpy 2.4 / scipy 1.17 / Pillow，**不得 pip 安装任何包**；Node 22 与 three 0.186.1 在仓库 node_modules。

## 规格
- spec §0 术语与单位、§1 目录、§3 命令行约定、§4（只需知道 skeleton.json 要由后续任务从你写的 glb_io 读出）、§11 禁区。
- 输入样例：
  - 素体正本 `assets/default/model3d/dressup/templates/tpl_f_medium/body.glb`（Tripo 导出、未压缩、1 primitive、65 根 `mixamorig:*`、3 段动画）；
  - 压缩道具（EXT_meshopt_compression + KHR_mesh_quantization）：`/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props/cloth_xianxia_dress_raw.glb`、`item_qingfeng_sword_raw.glb`（主检出里的未入库文件，**只读**；工作区里没有就按该绝对路径读）。

## 要做的事
1. `tools/model3d/dressup/glb_io.py`：
   - 读：GLB 头 / JSON / BIN 校验；accessor 读取支持 `byteStride`、`normalized`（int8/int16/uint8/uint16 归一化）、`sparse` 直接报 `NotImplementedError`；节点局部矩阵（matrix 或 TRS）与世界矩阵；skin 的 joints / inverseBindMatrices；image 字节与 mimeType 提取；统一的 `Mesh` 数据类（positions / normals / uvs / indices / joints / weights / material 索引，含每 primitive 的顶点区间）。
   - 写：从 numpy 数组构建 accessor / bufferView（4 字节对齐、min / max 必填）；`JOINTS_0` UNSIGNED_SHORT、`WEIGHTS_0` FLOAT、自定义 `_REGION` UNSIGNED_BYTE SCALAR；材质（pbrMetallicRoughness.baseColorTexture + `KHR_materials_unlit`，`doubleSided` 可选）与 image / texture / sampler 写入（image 字节原样嵌入 BIN）；节点 / 场景 / skin。
   - 高层：`write_skinned_glb(out, mesh, template_skin, material, images)`：joints 顺序与 inverseBindMatrices **逐字节复制模板**的 skin，骨骼节点树照抄模板节点（名字、TRS、层级），动画不复制。
   - `load_glb(path)` 遇到 `EXT_meshopt_compression`：用 `subprocess` 调同目录 `meshopt_decode.mjs` 解压到临时文件再读（临时文件用后即删）。
2. `tools/model3d/dressup/common.py`：Umeyama 相似变换（返回 s / R / t / 逐点残差，可判镜像）；四元数 ↔ 旋转矩阵、矩阵合成 / 分解；PCA；点-三角最近点（Ericson 5.1.5 向量化，返回最近点 + 重心坐标）；`nearest_triangle(points, verts, faces, k=16)`（cKDTree 质心候选 + 精确）；`lbs(positions, joints, weights, bone_world, ibm)`；带符号距离 `signed_distance(points, body_verts, body_faces, body_normals)`（最近体表点连线·插值法线）；拉普拉斯平滑（基于邻接，可指定迭代次数与 λ）；邻接表、连通块、边界边 / 非流形边统计。
3. `tools/model3d/dressup/meshopt_decode.mjs`：用 `three/examples/jsm/libs/meshopt_decoder.module.js`（仓库 node_modules 自带）解 `EXT_meshopt_compression`，保留 `KHR_mesh_quantization` 的 normalized 语义，`node meshopt_decode.mjs in.glb out.glb`，输出解压后体积与 bufferView 数。
4. `tools/model3d/dressup/inspect.py`：`--json` 输出节点树 / 骨架（名单、父子）/ 每 primitive 顶点 / 三角 / 属性 / 世界包围盒 / 材质与贴图分辨率 / 蒙皮统计（每顶点骨数分布、权重和范围、用到的关节数）/ A 姿势角（上臂、前臂与竖直夹角）/ rest = bind 校验（inv(IBM) 与节点世界矩阵最大差）/ 连通块与边界边；默认人类可读。
5. `tools/model3d/dressup/selftest.py`：合成小网格（立方体 + 两根骨 + 两帧动画）做 glb_io 写 → 读 round-trip（逐字段相等）、LBS（手算对拍）、最近点（解析解对拍）、Umeyama（已知相似变换恢复）、带符号距离（球面内外符号）、拉普拉斯（体积收缩方向）断言，退出码 0。
6. `tools/model3d/dressup/README.md`：模块一览、命令、单位约定、如何扩展。

## 约束
- 只写 `tools/model3d/dressup/{glb_io.py,common.py,meshopt_decode.mjs,inspect.py,selftest.py,README.md}` 与本任务报告。
- 不加 pip 包；不加 npm 依赖；不改任何既有文件；不写死 `/Users/...` 绝对路径（样例输入可通过参数传入，默认值相对仓库根）。
- 每个脚本：中文 `--help`、文档字符串、`main(argv)` 可 import；数值字段带单位后缀（spec §0）。
- 每次写入 ≤ 150 行；不要重打大 diff。

检查：以下命令必须全部通过。
- `python3 tools/model3d/dressup/selftest.py`
- `python3 tools/model3d/dressup/inspect.py --json assets/default/model3d/dressup/templates/tpl_f_medium/body.glb`（退出 0，joints 65，rest=bind 最大差 < 1e-5）
- `python3 tools/model3d/dressup/inspect.py --json /Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props/cloth_xianxia_dress_raw.glb`（自动解压，退出 0）
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：正本体检关键数字（顶点、三角、关节、A 姿势角、rest=bind 差）、道具解压前后体积、selftest 覆盖项；第 7 节写 glb_io / common 的公开 API 清单（函数签名 + 一句话语义 + 单位），交 A2–A5 直接使用。报告 ≤ 80 行。
