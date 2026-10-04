# 本任务：大地图 · 水墨贴图集补齐变体：小样画法作者已通过（AR-69），城镇与标记照小景画法；每个品类补到足够的变体，保证拼出来不重复；透明底；过程文件不进 assets/

本任务出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68、AR-69（第 4 条「大地图」）；
- 已合入的 22 件小样：`assets/default/map/kit/` 下的 `manifest.yaml`、`README.md`、`_contact_sheet.png`。这是本轮的画风标尺；
- 作者已审基线：`assets/default/baseline/map/ref_map_jianghu__ch01_base01.png`（江湖总图）、`assets/default/baseline/map/ref_map_dali__ch01_base01.png`（大理）；
- `docs/design/19-world-map.md` §7 水墨视觉规范；
- `assets/README.md`：manifest 字段。

## 为什么做

作者 AR-69 原话：「地图看起来可以，python里增加一点随机和融合算法，让贴图更自然」。小样的画法通过，城镇和标记照小景画法补齐变体。拼合生成器 TOOL-map-compose 靠足够的变体加随机扰动，拼出来才不重复、不显拼贴。

## 要做的事

1. **件数**：每个品类补到下表的合计件数，**合计含已合入的小样**。ID 的第三段就是品类（标记是 `ico_map_kit_<种>_`），拼合按它取件。

| 品类 | ID 前缀 | 合计 | 已有 | 变化要求 |
|---|---|---|---|---|
| 山峰 | `map_kit_shanfeng_` | 6–8 | 0 | 单峰、双峰、峰丛；大、中、小体量 |
| 山脉 | `map_kit_shanmai_` | 6–8 | 1 | 东西、南北、东北—西南、西北—东南四个走向；大、中体量 |
| 雪山（另算） | `map_kit_xueshan_` | 4–6 | 1 | 雪峰与雪岭；走向、体量错开 |
| 丘陵 | `map_kit_qiuling_` | 4–6 | 1 | 疏密、大小不同 |
| 湖泊 | `map_kit_hupo_` | 4–6 | 1 | 狭长、圆阔、多汊、小湖群 |
| 海面 | `map_kit_haimian_` | 4–6 | 1 | 外海晕染、近岸浪纹、海湾 |
| 平原底纹 | `map_kit_pingyuan_`、`map_kit_pendi_` | 两者合计 4–6 | 2 | 浓淡、纹理方向不同 |
| 大城 / 州府 / 县镇 / 村落 | `map_kit_dacheng_` 等四级 | 每级 3–4 | 各 1 | 小景画法 |
| 寺庙 / 道观 / 门派 / 驿站 / 码头 / 遗迹 | `ico_map_kit_simiao_` 等六种 | 每种 2–3 | 各 1 | 小景画法 |
| 关隘 | `map_kit_guanai_` | 3 | 1 | 山口、河谷、长墙段 |

   - 雪山件数协调者没定，默认 4–6，写进报告。
   - 河流、道路笔触本轮不补：拼合按矢量画，已有 4 件保留。
2. **画法**：
   - 严格对齐已合入的 22 件小样和两张基线：深 / 中 / 淡墨，披麻皴、干笔飞白、湿墨渗化；极淡赭、灰绿，灰青水色；主体内的纸感；统一近俯视散点透视。
   - 城镇与标记照小样的**小景画法**：近俯视的小场景，屋宇、城垣、塔、码头、断墙等实物入画，靠体量、屋数和标志物区分等级与种类。不画成简化符号或图标。
   - 生图时输入两张基线，再加同品类的已合入小样 1–2 张作风格参照。新件不得照搬参照的构图。
   - 每件单独生成。**不得**用翻转、旋转、裁切、调色、拼接等代码手段从已有件派生变体：拼合时还会再做扰动，派生件等于重复。
   - 同品类各件的轮廓、构图要明显不同。
3. **规格**，同小样：
   - PNG RGBA，真透明：image_gen 直接出透明底，不抠底；四角与外缘 alpha 为 0；
   - 边长 1024（大体量地形、大城）或 512（其余）；完整原画幅等比缩到 90%，居中补透明边；
   - 无文字、无现代元素、无水印。
4. **manifest**：
   - 新条目追加到 `assets/default/map/kit/manifest.yaml`，字段与小样一致，`status: candidate`；
   - 每条加机读字段 `kit`，新条目和 22 件小样都要加，供拼合取件：
     - `kind`：ID 第三段（标记取 `ico_map_kit_` 后一段）；
     - `volume`：`large` / `medium` / `small`；
     - `orient`：`ew` / `ns` / `nesw` / `nwse` / `none`。山脉、雪山、关隘写走向，其余写 `none`；
     - `anchor`：主体落脚点（底边中点）`[x, y]`，按图宽、高归一，用于遮挡排序与落位；
   - 22 件小样除加 `kit` 外，其余字段与 status 一概不改。
5. **对照表**：重出 `assets/default/map/kit/_contact_sheet.png`：
   - 按品类分行，标品类名与件数；
   - 同品类小样在前、新件在后；
   - 同步改 manifest 里对照表条目的 size 与 sha256。
6. **过程文件不进 assets/**：
   - 提示词集合、生成记录、校验日志、临时图，放 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_asset_logs/assets/default/map/kit/full/`（不入库）或 `/private/tmp`；
   - 要入库的脚本（如对照表生成）放 `tools/map/kit/full/`；
   - `assets/default/map/kit/` 下已有的过程文件（`build_review.py`、`*.jsonl`、`*.log`、`prompts.json`）**不改、不删**，由 TOOL-assets-logs-cleanup 统一挪走；
   - `README.md` 只在末尾追加一节「补齐变体（AR-69）」，不改原有段落。

## 约束

- 写集：`assets/default/map/kit/**`、`tools/map/kit/full/**`。写集外的改动在提交时会被丢弃。
- 不改基线；不改 22 件小样的图片。
- 不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/map/kit --min 64 --max 120 --min-side 512`
- 所有贴图 PNG 都是 RGBA 真透明，四角 alpha 为 0
- 各品类件数达到第 1 条的下限；每条都有 `kit` 字段且 `kind` 与 ID 一致；图片 sha256 互不相同
- `assets/default/map/kit/` 下除登记在 manifest 的 PNG、`manifest.yaml`、`README.md` 和已有过程文件外，没有别的文件

## 报告

≤ 30 行，写清：
- 各品类件数（小样 + 新件）；
- 与小样、基线对照的要点；
- 对照表路径；
- 作者要拍板的点（附默认值）。
