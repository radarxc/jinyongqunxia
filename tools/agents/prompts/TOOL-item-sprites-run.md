# 本任务：跑工具 · 对已合入的全部物品图生成小图与装备覆盖层并入库（AR-22）

本任务只运行既有工具并入库生成物，不改工具（工具有 bug 则最小修复并写报告）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

工具：`tools/item/make_icons.py`、`tools/item/make_layers.py`（TOOL-rig-pipeline 产出；用法见各脚本 `--help` 与 `docs/tech/09-character-rig.md` §3）。输入：`assets/default/item/<类>/*.png`（ART-item 各任务已合入）。

## 要做的事

1. `python3 tools/item/make_icons.py --all` 与 `python3 tools/item/make_layers.py --all`；逐类 `view_image` 抽查 2 张图标与 2 张覆盖层（抠底是否干净、兵器握点与朝向、覆盖层形状与主色是否像该物品）。
2. 抠底不干净或形状明显错的，调整该物品在 `layers.yaml` / manifest 里允许的参数（色键容差、握点比例、模板选择——只改数据不改代码），重跑；仍不行的在报告列出。
3. 入库生成物与 manifest 更新；`--check` 全部通过。

检查：以下命令必须全部通过。
- `python3 tools/item/make_icons.py --all --check`
- `python3 tools/item/make_layers.py --all --check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：各类处理数量；抽查结论；调过参数的物品；仍有问题的清单。报告 ≤ 60 行。
