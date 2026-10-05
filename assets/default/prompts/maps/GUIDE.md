# 地图 · 生成与存放规程（给出图 agent）

在仓库根目录执行；路径都相对仓库根。本组每份文件 = 一张地图：`maps/region/<rg_id>.md`（30 个区域水墨局部图）、`maps/jianghu_world_ink_base.md`（全国水墨衬纸，**可选，需作者确认**）。总索引 `assets/default/prompts/INDEX.md` 由脚本生成，不要手改。

## 0. 先弄清什么不用画

全国导航图（江湖万里图）是代码从 `docs/design/19-world-map.md` 的数据生成的 SVG：`python3 tools/map/render_map.py --render`，14 个时代图层、Albers 投影、城市 / 门派 / 路线 / 题签都在 SVG 里。**它不是出图任务。** 要画的是 30 个区域的水墨局部图（给区域导航 / 进入区域时用，类比作者已审的大理苍洱局部图），以及可选的一张与 SVG 对位的水墨衬纸。

## 1. 先读什么

1. `assets/default/prompts/map.md` §1–§4、§6–§7（水墨地图风格、构图与画幅、年代形制、可替换提示词、SVG 标注叠加层、质检）。
2. 两张作者已审基线：`assets/default/baseline/map/ref_map_jianghu__ch01_base01.png`（画风）、`ref_map_dali__ch01_base01.png`（局部图构图）。每张区域图都以这两张为图片输入，只继承水墨层次、纸本质感、留白和地图符号语言，**不沿用其地名与方位**。
3. 地理事实：`docs/design/map/regions.yaml`（区域范围 / 相邻）、`cities.yaml`（城市坐标、各时代名）、`sects.yaml`（门派驻地）、`routes.yaml`（路线）。提示词文件的「区域要点」表就是从它们抄的；画面上城市、门派的相对位置必须与表一致。

## 2. 队列与顺序

```bash
python3 tools/agents/build_image_index.py --queue --group maps
```

建议顺序：先出 `rg_dali_cangshan`（有作者已审的同题材基线可对照），画风定下来后再做其余 29 个；全国衬纸最后、且作者确认要做才做。每张 2 张候选选 1 张，单轮 ≤ 4 张。

## 3. 怎么出

1. 读提示词文件；把「提示词」整段（含排除项）交给图像生成，两张基线作图片输入。目标 1536×1024（横 3:2），北上南下、西左东右，不透明暖纸白。
2. **图上不写任何字**（城名、方位字、题跋、印文都不要）——标签由代码按 design/19 叠加。城市用细小墨笔城垣 / 屋舍符号标位，门派用素朴殿宇 / 山门符号；山脉浓淡墨皴擦，水面留白淡墨线，道路细虚墨线；水面 / 云雾 / 平地纸白合计 ≥ 35%。
3. 自查：方位与相对位置对表；无字；留白够；风格对基线；建筑符号是克制的古代轮廓，无现代设施、无跨时代城楼；不镜像、不为构图倒置东西。
4. 禁止代码绘制或拼贴替代图；工具不可用就停下写明。

## 4. 存放与登记

- 区域图：`assets/default/map/regions/<rg_id>.png`；登记 `assets/default/map/regions/manifest.yaml`（字段同 `assets/default/baseline/map/manifest.yaml`：`id` = frontmatter `asset_id`、`file`、`category: map`、`style: default`、`subject`、`prompt`、`negative`、`references`、`tool`、`model`、`created`、`source_path`、`size`、`sha256`、`status: candidate`、`notes`；`notes` 里写覆盖的经纬范围与 region_id）。
- 全国衬纸：`assets/default/map/jianghu_world/ink_base.png` + 同目录 `manifest.yaml`；必须与 `tools/map/render_map.py` 输出的 SVG 栅格图逐像素对位（海岸线 / 主要河流偏差 ≤ 8 px @4096）。
- 可选：为每张区域图另存同尺寸 SVG 标注层（map.md §6），不是必需。

## 5. 检查与交付

```bash
python3 tools/agents/check_assets.py assets/default/map/regions --min 1 --max 30 --min-side 1024
python3 tools/agents/build_image_index.py
```

整组交审（作者在审批页看图）。报告写清：每个 region 出了几张候选选了哪张、与「区域要点」表核对方位的结果、改过的提示词。
