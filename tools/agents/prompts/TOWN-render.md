# 本任务：城镇程序化生成 · 布局生成器、渲染器与校验脚本（`tools/town/`）

本任务写代码，不改策划 / 技术文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等规则照常适用。

## 背景

作者把城镇图改为程序化生成，原话：「城镇参考对应年代的城镇平面图，生成道路和建筑的坐标，将商业区、住宅区、镖局/衙门区、王府/皇宫 等区域分配到坐标区间内，然后填入功能性建筑。然后按照素材贴图（代码实现），渲染整个城镇的底图（道路，河流，桥梁等）。再根据坐标，贴对应的建筑图（建筑图逐一生成）。」

设计与数据格式已定稿，本任务按它实现：
- `docs/design/22-town-layout-and-generation.md`：§2 网格与画幅、§6 数据格式、§7 生成算法、§8 渲染规则、校验脚本规格。
- `docs/design/town/schema.yaml`、`docs/design/town/city_dali__ch01.yaml`、`docs/design/town/city_hangzhou__ch02.yaml`。
- 相机与坐标换算：`docs/tech/02-rendering.md` §1.1–§1.6。

贴片与建筑素材由并行任务生成，可能还没合入。本任务先用占位素材（纯色 / 线框菱形、带 ID 文字的占位建筑）跑通，输出布局预览；真素材合入后由 TOWN-assemble 做最终渲染。

## 要做的事

1. **`tools/town/gen_layout.py`**：读 `CitySpec`（YAML），按 design/22 §7 生成 `TownLayout`（YAML）。要求：确定性（同种子同结果）、失败处理按 §7、命令行用法 `gen_layout.py <spec> -o <layout>`。
2. **`tools/town/render_town.py`**：读 `TownLayout` 与素材清单（贴片 `assets/default/baseline/tile/manifest.yaml`、建筑 `assets/default/baseline/building-map/manifest.yaml`，路径可配置），按 §8 渲染整张城镇 PNG：底图贴片（含道路 / 河岸 autotile、桥）→ 建筑按远角排序贴图（锚点底面中心，按占地宽度等比缩放）→ 可选调试叠加 SVG（分区框、格坐标、建筑 ID）。素材缺失时用占位图并在输出里列出缺失清单，不静默跳过。支持 `--scale` 输出缩略图。
3. **`tools/town/check_town.py`**：按 design/22 校验规格与布局：schema、建筑不重叠、不压水、在城墙内、道路连通、每种 `type` 有素材（缺素材只警告，加 `--strict-assets` 才报错）、行走层与占地一致。退出码 0 / 1。
4. **单元测试** `tools/town/test_town.py`：生成器确定性、不重叠、连通性、渲染排序、autotile 选边至少各一个用例；用一个小型内置规格跑，不依赖真素材。
5. **占位预览**：用占位素材渲染 `docs/design/town/city_dali__ch01.yaml` 与 `city_hangzhou__ch02.yaml`，输出到 `assets/default/baseline/town/preview/`（`town_dali__ch01_layout.png`、`town_hangzhou__ch02_layout.png` 及对应 `*.overlay.svg`），并写 `assets/default/baseline/town/preview/README.md` 说明这是占位预览。这些图不进 manifest。
6. **`tools/town/README.md`**：用法、数据流、素材要求、常见错误。
7. 只用标准库 + PIL + numpy + PyYAML（仓库里已有）；Python 3.11；代码注释与命名遵循仓库其他工具的风格；每次写入不超过约 150 行，分多次写。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/town -p "test_*.py"`
- `python3 tools/town/gen_layout.py docs/design/town/city_dali__ch01.yaml -o /tmp/tianshu_town_dali.yaml && python3 tools/town/check_town.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml`
- `python3 tools/town/gen_layout.py docs/design/town/city_hangzhou__ch02.yaml -o /tmp/tianshu_town_hz.yaml && python3 tools/town/check_town.py docs/design/town/city_hangzhou__ch02.yaml /tmp/tianshu_town_hz.yaml`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：两座城生成结果的统计（道路格数、地块数、各类型建筑数、连通性）；渲染耗时与输出尺寸；对 design/22 算法说明的偏离或补充（写清原因，交回设计文档同步）；交 TOWN-assemble 的要点；需作者确认的事项。
