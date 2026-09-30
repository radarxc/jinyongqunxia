# 本任务：城镇底图贴片 · 水面贴片重出（有自然细波纹、可无缝平铺）

本任务只重出 8 张水面贴片并更新登记，不改工具、不改其他贴片。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者看总装图的意见：「城镇水面是平色贴片」。现有 `assets/default/baseline/tile/tex_town_song_southern_water__v01–v04.png`（64×32 菱形，宋江南 / 大理两城共用）几乎没有纹理，大面积水（运河、桃溪、西湖）呈平色块，与写实建筑不协调。

## 要做的事

1. 用 `image_gen` 出 2 张俯视水面纹理源图（1024×1024，写实古风水面：细波纹、轻微反光、青灰偏绿，不要白浪、不要倒影、不要文字），要求四边可无缝平铺（提示词写明 seamless tileable，出图后用 PIL 做偏移拼接自查接缝，不合格重出，最多 3 候选）。
2. 用 PIL 纯几何处理生成 8 张 64×32 菱形贴片：`tex_town_song_southern_water__v01–v04`（覆盖原 4 张，ID 不变）与 `tex_town_song_dali_water__v01–v04`（新增，大理桃溪 / 洱海用，色调略偏蓝绿），每张从源图不同位置取样、按 2:1 投影压缩、菱形外透明、alpha 含 0 与 255；4 变体之间纹理错位以打散重复；3×3 混排自查（无明暗块、无缝）。源图存 `source/`（登记 `source_copy`）。
3. `manifest.yaml`：更新 4 条、新增 4 条（字段沿用同目录其他地面贴片；`tile: {kind: water, footprint: [1,1], variant, autotile_mask: null}`），`size` / `sha256` 实测，`status: candidate`。`assets/default/prompts/tile.md` 水面一节改写提示词要点。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/baseline/tile --min 40 --max 70 --min-side 32`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：源图候选与淘汰原因、8 张贴片的取样位置、3×3 混排自查结论。报告 ≤ 60 行。
