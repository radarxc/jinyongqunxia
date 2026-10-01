# 本任务：代码工具 · 物品小图 / 装备覆盖层 / 角色部件处理与姿势预览（AR-22）

本任务写 Python 工具与测试，不出图、不改规格。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-22**：「盔甲衣服兵器靴子等要用code处理出小图，主角在地图上行走时，要反映出装备特性。行走动画要用代码写出轨迹，分别贴图」。

## 规格

`docs/tech/09-character-rig.md`（DES-rig 产出）：§3 小图与覆盖层规则、§1 部件与枢轴约定、§4 步态公式与测试向量、§6 manifest。物品图在 `assets/default/item/<类>/<id>.png`（ART-item 逐批合入；本任务开工时可能只有部分类别，缺的类别跳过），基线物品图 `assets/default/baseline/item/`（倚天剑、九阴真经，可作测试样本）。

## 要做的事（全部 Python 3.11 + Pillow + numpy，确定性，无网络）

1. `tools/item/make_icons.py <dir>|--all [--check]`：按规格抠底（色键 + 容差 + 羽化 + 去色溢）、裁边、补边、出 256 / 128 / 64 / 32 四档到 `<类>/icons/`，写回 manifest 的 `icons` 字段（文件、尺寸、sha256）；`--check` 核对已有图标与源图一致（重新生成比对 sha256）。
2. `tools/item/make_layers.py <dir>|--all [--check]`：对可见装备类（weapons / clothing / armor / accessories / shoes / belts，按规格 §2 表）生成覆盖层 `<类>/layers/<id>__<slot>.png` + `layers.yaml`：兵器摆正 + 握点 + 按长度缩放；其余按槽位模板 + 主色板 / 纹理采样；`--check` 同上。
3. `tools/rig/make_parts.py <set_dir> [--check]`：对 `assets/default/rig/<set>/<view>/<part>.png` 裁边、按规格 §1 约定定枢轴与子关节、写 manifest（size、pivot、childJoint、sha256）；`--check` 核对。
4. `tools/rig/gait.py`：规格 §4 的步态公式实现（纯函数：`pose(t, speed, weightClass, params) → 各关节角与偏移`），用规格的测试向量表做单测；`tools/rig/preview.py <set_dir> [--equipment id,id] --out <png>`：把部件按步态在 t = 0 / 0.25 / 0.5 / 0.75 与待机各摆一帧，三个视图各一行，合成预览条带（供 ART-rig-parts 自检与审批页）。
5. 测试：`tools/item/test_*.py`、`tools/rig/test_*.py`（用基线物品图与程序生成的合成部件图跑通；覆盖抠底边缘、尺寸、确定性（两次运行 sha256 相同）、步态向量）；`python3 -m unittest discover -s tools -p "test_*.py"` 通过。
6. 对当前已存在的物品类别实际跑一遍 `make_icons.py --all` 与 `make_layers.py --all`，生成物入库（`assets/default/item/<类>/icons|layers/`）；没有的类别留给 TOOL-item-sprites-run。

约束：不改规格文档（发现规格不可实现写报告，按最接近的实现并标注）；不改物品源图与名录；每次写入 ≤ 150 行；工具只依赖标准库 + Pillow + numpy（PyYAML 已在仓库其他工具使用则可用）。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `python3 tools/item/make_icons.py --all --check`
- `python3 tools/item/make_layers.py --all --check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：工具清单与用法；对规格的偏离；已处理的类别与数量；预览条带示例路径；交 ART-rig-parts / ENG-12 的约定。报告 ≤ 100 行。
