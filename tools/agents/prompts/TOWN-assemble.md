# 本任务：城镇程序化生成 · 用真素材组装大理、临安两张城镇基线图

本任务运行工具，产出图片并登记，不改策划 / 技术文档。渲染真素材时暴露的工具问题（锚点、缩放、层序、贴片选边、缺失形状的代码叠边）**可以直接改 `tools/town/`**，改动最小、单测跟上、报告里列出；目标是一张看着对的城。

## 背景

管线各环节已合入：设计 `docs/design/22-town-layout-and-generation.md`、城市规格 `docs/design/town/*.yaml`、贴片 `assets/default/baseline/tile/`、建筑单体 `assets/default/baseline/building-map/`、工具 `tools/town/`（用法见 `tools/town/README.md`）。本任务把它们串起来，出两张作者要审批的城镇图。

作者对这两座城的要求（原文）：大理「可以更多参考历史图片，大理的本土植物。大理没有那么发达，是不是不会覆盖全部的青砖。大理信佛，佛教元素可以多一些。」；临安「临安可以再繁华一些」。这些要求应已体现在城市规格与素材里，组装时核对是否落地。

## 作者口径（2026-09-30 原话）

> 城镇重要的是布局图（layout，坐标，用搜索来的历史布局图复原），然后用代码变换出45度视角的出图

> 贴片就是一些素材，四五十个差不多就行了。

布局已由 TOWN-layout 按史料复原（`docs/design/town/history/`），本任务不改布局的坐标；贴片只有约 60 张，缺的岸线 / 路缘形状在渲染器里用 8 向边件叠出来，不要求补图。贴片与建筑素材若尚未合入主分支，续作说明会给出它们的工作区路径，把整个目录复制到本工作区同路径后使用（这些目录不在写集内，提交时会被丢弃，正常）。

## 要做的事

1. 对两座城各运行：`gen_layout.py` → `check_town.py --strict-assets` → `render_town.py`（全尺寸 PNG + 叠加 SVG + `--scale` 缩略图）。
2. 输出到 `assets/default/baseline/town/`：`town_dali__ch01.png`、`town_hangzhou__ch02.png`、同名 `.overlay.svg`、同名 `.layout.yaml`（生成的布局）。旧的纯生图文件（`ref_town_*`）若存在，删除并在 manifest 里去掉条目。
3. `assets/default/baseline/town/manifest.yaml`：每张一条，字段按 `assets/README.md`；`tool` 写 `tools/town/render_town.py`，`model` 写 `none`，`prompt` 写实际命令行，`references` 列出用到的贴片与建筑 ID，`size`、`sha256` 实测，`status: candidate`。
4. 目检（`view_image`）：道路连通、河道与桥合理、建筑不重叠不压水、光源一致、分区符合规格、作者要求是否落地。发现素材或工具问题，写进报告"交其他任务"，不自行修改。
5. 更新 `assets/default/prompts/town.md`：改为"城镇由程序化生成，本文件记录组装命令、素材依赖与质检要点"，删除纯生图时代的提示词。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/baseline/town --min 2 --max 2`
- `python3 tools/town/check_town.py docs/design/town/city_dali__ch01.yaml assets/default/baseline/town/town_dali__ch01.layout.yaml --strict-assets`
- `python3 tools/town/check_town.py docs/design/town/city_hangzhou__ch02.yaml assets/default/baseline/town/town_hangzhou__ch02.layout.yaml --strict-assets`

## 报告

第 7 节写：两座城的生成统计与渲染参数；目检结论逐项；作者要求落地情况；素材或工具的问题清单；需作者审批的事项。
