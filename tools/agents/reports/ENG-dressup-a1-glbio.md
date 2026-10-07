# ENG-dressup-a1-glbio 报告 · 3D 纸娃娃换装 · A1 · 离线基础库 glb_io / common / meshopt_decode / inspect / selftest（AR-102）
## 1. 摘要（3–6 行）
完成 A1 六个离线基础文件：GLB 读写/模板 skin 复制、几何公共库、meshopt 解码、体检、自测及说明。
正本与压缩流仙裙均实跑成功；正本 65 关节且 rest=bind 最大差 5.93e-7，满足 <1e-5。
合成自测 7/7 通过，覆盖题面全部数学与回环项；无新增 pip/npm 依赖。
本轮在已合法修复素材 manifest 的基点上复验；`pnpm check` 全绿（178 文件、1,272 项测试）。

## 2. 产出（文件、行数、主要章节）
- `tools/model3d/dressup/glb_io.py`（655 行）：数据类、GLB/accessor/node/skin/image 读、构建器、模板蒙皮高层写出。
- `common.py`（469 行）：相似变换、TRS/PCA、最近面、LBS/SDF、平滑与拓扑；`meshopt_decode.mjs`（153 行）：压缩 bufferView 解码。
- `inspect.py`（233 行）：JSON/人读体检；`selftest.py`（207 行）：7 组自测；`README.md`（56 行）：命令、单位、扩展与来源。
- 验收实跑：五条指定命令全部退出 0；冻结安装未改 lockfile；全仓门禁含构建和包体检查通过。

## 3. 关键结论与数值
- 正本 `body.glb`：9,637,236 B；105,991 顶点、198,436 三角、1 primitive、65 joints；上臂 39.1737°、左前臂 49.1258°；rest=bind 5.93494e-7。
- 正本另见：105 连通块、13,336 边界边、0 非流形边；权重和 0.99999988–1.0；实际受权重关节槽 52；动画 walk/run/idle 三段。
- 流仙裙：17,963,604 B → 23,376,000 B（+5,412,396 B / +30.13%）；解 4/7 bufferViews，保留 `KHR_mesh_quantization`；158,875 顶点、287,349 三角。
- selftest：GLB 字段/图片/动画/模板 IBM 原字节回环、stride+四种 normalized+sparse 拒绝、LBS 手算、最近点解析解、Umeyama+镜像、球面 SDF 内外符号、拉普拉斯体积收缩。
- 外部依赖：基点历史中的 `57f1d0b73` 已由素材任务合法修复 ch01/ch09 manifest；压缩样例从主检出只读绝对路径传参，代码未写死该路径。
- 实测工具链：Python 3.11.0、Node 22.22.1、仓库 `packageManager` 固定的 pnpm 9.15.9；与通用附加规则所述 Node ≥24 / pnpm 12 不同，但符合本任务作者要求的本机 Node 22，未改仓库配置。
- 与 spec 一致：仅 mu 离线坐标；矩阵列向量语义；JOINTS u16 / WEIGHTS f32 / REGION u8；压缩输入经系统临时目录自动解码即删。偏离：无。

## 4. 开放问题（附默认值）
- `nearest_triangle` 默认 k=16，并以三角包围半径扩候选保证细长面正确；后续若超大网格性能不足，默认先减面而不牺牲精确性。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。实现遵循 tech/11；无需修改设计基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无。本任务基点已包含对应素材任务对 ch01 / ch09 manifest 重复键的合法修复，本变更集未修改二者。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `python3 tools/model3d/dressup/selftest.py`：退出 0，7/7。
- ✅ `inspect.py --json .../body.glb`：退出 0；65 joints、rest=bind 5.93e-7、上臂 39.17°。
- ✅ `inspect.py --json .../cloth_xianxia_dress_raw.glb`：自动解压，退出 0。
- ✅ `pnpm install --frozen-lockfile`：退出 0；锁文件未变。
- ✅ `pnpm check`：退出 0；lint/typecheck、178/178 测试文件（1272/1272 tests）、内容校验、剧情编译、生产构建、包体与 dev-chunks 全部通过。
- ✅ 无绝对路径硬编码、无新增依赖、无临时产物；五个脚本有中文帮助/文档字符串/`main(argv)`；联网核实来源列于 README（2026-10-07）。
- ✅ `glb_io` 类型：`Mesh(positions,indices,normals,uvs,joints,weights,regions,material_indices,primitives,name)` 统一网格（坐标 mu）；`PrimitiveRange(...)` 标 primitive 区间；`Skin(...)` 保留关节/IBM 源；`ImageData(data,mime_type,name)` 保留图片原字节。
- ✅ `load_glb(path)->GLB` 校验/自动解压；`write_skinned_glb(out,mesh,template_skin,material=None,images=())->None` 复制模板骨树、关节序与 IBM 原字节（mu）。
- ✅ `GLB.accessor_bytes(index)->bytes` 取紧密原字节；`accessor(index,normalized=True)->ndarray` 解 stride/归一化；`local_matrix(node_index)` / `world_matrix(node_index)` 取 mu 变换。
- ✅ `GLB.skin(index=0)->Skin`、`image(index)->ImageData`、`mesh(index=0)->Mesh`、`meshes()->list[Mesh]` 分别读取蒙皮、图片和统一网格；`parents` 给节点父表。
- ✅ `GLBBuilder.add_accessor(array,component_type=None,type_name=None,normalized=False,target=None,name=None)` 与 `add_raw_accessor(source,accessor_index,name=None)` 写 accessor（min/max、4 B 对齐）。
- ✅ `GLBBuilder.add_image(image,mime_type=None,name=None)`、`add_texture(image_index,sampler_index=None,name=None)`、`add_sampler(...)`、`add_material(...,unlit=True,double_sided=False,...)` 写贴图材质。
- ✅ `GLBBuilder.add_node(...)`、`add_scene(nodes,...)`、`add_skin(joints,inverse_bind_accessor,...)`、`add_mesh(mesh,material_map=None)`、`add_animation(name,channels)`、`write(path)` 写场景/蒙皮/动画（mu、秒）。
- ✅ `umeyama(source,target,allow_mirror=False)->UmeyamaResult` 返回 s/R/t/逐点残差(mu)/镜像；`quaternion_to_matrix(quaternion)`、`matrix_to_quaternion(matrix)` 处理 glTF `[x,y,z,w]`。
- ✅ `compose_matrix(translation=(0,0,0),rotation=(0,0,0,1),scale=(1,1,1))` / `decompose_matrix(matrix)` 合成/分解无剪切 TRS（平移 mu）；`pca(points)` 返回中心、降序特征值、主轴。
- ✅ `closest_point_on_triangle(points,a,b,c)` 返回最近点/重心；`nearest_triangle(points,vertices,faces,k=16)->NearestTriangleResult` 返回最近面、重心和距离(mu)。
- ✅ `lbs(positions,joints,weights,bone_world,ibm)->ndarray` 做 LBS（mu）；`signed_distance(points,body_vertices,body_faces,body_normals,k=16)` 返回外正内负距离(mu)。
- ✅ `laplacian_smooth(vertices,faces=None,adjacency=None,iterations=1,lambda_=0.5,fixed=None)` 平滑（mu）；`adjacency_list(vertex_count,faces)`、`connected_components(vertex_count,faces)`、`edge_statistics(faces)` 统计拓扑。
