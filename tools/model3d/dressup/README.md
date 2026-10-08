# 3D 纸娃娃换装 · 离线基础库

本目录实现 `docs/tech/11-paper-doll-3d-impl-spec.md` 阶段 A1。主链仅依赖 Python 3.11 的 NumPy / SciPy / Pillow，以及仓库 `packages/render` 已锁定的 three；不依赖 Blender，也不安装新的 pip / npm 包。

## 模块

| 文件 | 职责 |
|---|---|
| `glb_io.py` | GLB 2.0 校验、accessor / 节点 / skin / 图片读取，确定性写出，以及按模板逐字节复制 IBM 的蒙皮 GLB。 |
| `common.py` | 相似变换、四元数/TRS、PCA、最近三角形、LBS、带符号距离、平滑及拓扑统计。 |
| `meshopt_decode.mjs` | 以 three 自带 MeshoptDecoder 解 `EXT_meshopt_compression`，保留 accessor 量化与 normalized 语义。 |
| `inspect.py` | 人类可读或 JSON 的节点、骨架、几何、材质、蒙皮、A 姿势与 rest=bind 体检。 |
| `selftest.py` | 合成立方体/两骨/两帧动画与解析几何断言，不访问网络。 |

## 命令

从仓库根执行：

```bash
python3 tools/model3d/dressup/selftest.py
python3 tools/model3d/dressup/inspect.py assets/default/model3d/dressup/templates/tpl_f_medium/body.glb
python3 tools/model3d/dressup/inspect.py --json path/to/input.glb
node tools/model3d/dressup/meshopt_decode.mjs path/to/compressed.glb path/to/decoded.glb
```

所有脚本均支持中文 `--help`。`inspect.py --json` 成功时 stdout 只有一个 JSON 对象；压缩 GLB 会自动在系统临时目录解码，用完即删。命令成功返回 0，参数或输入错误返回 2。

## 单位与约定

- 几何坐标和距离只用 GLB 原始模型单位 `mu`；JSON 字段以 `Mu` 结尾。运行时米制换算属于后续流水线。
- 角度字段以 `Deg` 结尾；动画输入时间以 `Sec` 结尾；像素、文件字节分别以 `Px`、`Bytes` 结尾。
- Python 内矩阵采用列向量语义 `world = parent @ local`；glTF 的 16 数组按列主序读写。四元数为 `[x,y,z,w]`。
- `Mesh.indices` 是跨 primitive 的全局顶点索引；`PrimitiveRange` 保存各段顶点和索引区间。`JOINTS_0` 写 u16，`WEIGHTS_0` 写 f32，`_REGION` 写 u8 SCALAR。
- `signed_distance` 依赖闭合、法线一致的体表：沿插值外法线为正，内部为负。

## Python 使用

```python
from tools.model3d.dressup.glb_io import load_glb, write_skinned_glb
from tools.model3d.dressup.common import nearest_triangle, signed_distance

body = load_glb("assets/default/model3d/dressup/templates/tpl_f_medium/body.glb")
mesh = body.mesh(0)
skin = body.skin(0)
write_skinned_glb("out.glb", mesh, skin, {"unlit": True}, [])
```

## 扩展规则

后续 A2--A5 可向两个基础模块追加函数，但不得改变已有公开签名。新增 accessor 语义应集中进 `GLB` / `GLBBuilder`，不可在业务脚本重复解析二进制；几何算法应保持纯函数、显式单位，并在 `selftest.py` 增加解析解或手算对拍。遇不支持的 glTF 特性要明确报错，不能静默丢数据；尤其 sparse accessor 当前按契约抛 `NotImplementedError`。

## 参考资料

- [glTF 2.0 Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)：GLB chunk、accessor、normalized 与节点 TRS（访问：2026-10-07）。
- [EXT_meshopt_compression](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Vendor/EXT_meshopt_compression)：压缩 bufferView 的 count / byteStride / mode / filter（访问：2026-10-07）。
- [three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)：`setMeshoptDecoder` 与 meshopt 扩展支持；实际实现以仓库锁定的 three 0.186.1 `meshopt_decoder.module.js` 为准（访问：2026-10-07）。
