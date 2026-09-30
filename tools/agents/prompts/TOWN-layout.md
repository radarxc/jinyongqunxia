# 本任务：城镇布局复原 · 大理国都与南宋临安（联网搜索历史平面图，复原成坐标布局，再由代码出 45 度预览）

本任务写策划数据（两份城市规格）、复原依据文档、平面布局图，并用已有工具生成布局与 45 度占位预览。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等规则照常适用。

## 作者要求（原话，2026-09-30）

> 城镇重要的是布局图（layout，坐标，用搜索来的历史布局图复原），然后用代码变换出45度视角的出图

> 贴片就是一些素材，四五十个差不多就行了。

更早的原话（2026-09-29）：

> 城镇参考对应年代的城镇平面图，生成道路和建筑的坐标，将商业区、住宅区、镖局/衙门区、王府/皇宫 等区域分配到坐标区间内，然后填入功能性建筑。然后按照素材贴图（代码实现），渲染整个城镇的底图（道路，河流，桥梁等）。再根据坐标，贴对应的建筑图（建筑图逐一生成）。

所以本任务的核心产物是**两座城的布局（坐标）**，依据是**联网搜索到的历史 / 考古平面图与文字记载**；45 度图只是代码对布局的变换。现有的两份城市规格（`docs/design/town/city_dali__ch01.yaml`、`city_hangzhou__ch02.yaml`）是没有联网条件时写的原创布局，本任务用复原结果**重写**它们（格式不变，按 `docs/design/town/schema.yaml`）。

## 工具与数据

- 生成器 / 渲染器 / 校验：`tools/town/`（`README.md` 有用法）。`gen_layout.py <spec> -o <layout>`、`check_town.py <spec> <layout>`、`render_town.py`（占位渲染，`--scale` 出缩略图）。本工作区已包含它们（基点就是 TOWN-render 的提交）。
- 网格、画幅、数据格式：`docs/design/22-town-layout-and-generation.md` §2、§6；`docs/design/town/schema.yaml`。
- 两座城在游戏里的定位：`docs/design/chapters/01-tianlong.md`（大理，约 1093–1094，段氏大理国都，苍山洱海之间；天龙寺 / 崇圣寺三塔、镇南王府等剧情地点）、`docs/design/chapters/02-shediao.md`（临安，南宋约 1220 年代；皇城、御街、西湖等）。
- 你有联网搜索工具（`web_search`），可以打开网页读文字；图片可能打不开（有的站返回 403），打不开就用文字记载和可打开的页面（维基百科、考古报告摘要、地方志数字化页面、学术论文摘要等）。

## 要做的事

### 1. 搜索并登记史料（每城）

找该城对应年代的城址平面图 / 复原图 / 考古报告 / 地方志记载，重点要素：

- 城垣轮廓与尺度（长宽、周长、形状），城门（名称、方位、数量）；
- 主干街道（名称、走向、宽度等级）与坊巷格局；
- 水系（江河、运河、城内河渠、湖）与桥（名称、位置）；
- 宫城 / 王府（大理：段氏宫室与镇南王府；临安：皇城在城南凤凰山麓、和宁门等）、官署（衙门）、市（商业区、瓦子）、住宅坊巷、寺观塔（大理：崇圣寺三塔、天龙寺 → 剧情里的天龙寺；临安：主要寺观）、仓廪、军营、码头等；
- 不确定的说法记为（待考）；史料没有而游戏需要的（如镖局、赌场、客栈的具体位置）记为（原创扩展）并说明放置理由（例如"镖局按宋代惯例放在城门内侧的运输要道旁"）。

写成 `docs/design/town/history/dali.md`、`docs/design/town/history/linan.md`（各 80–160 行）：
- 来源清单：编号、标题、URL、类型（考古报告 / 地方志 / 论文 / 百科 / 图片页）、取用了什么、可信度（高 / 中 / 低）；只登记你真的打开并读到的页面，打不开的不要写；
- 复原依据表：要素 → 史料说法（出处编号）→ 本布局取值（网格坐标或区间）→ 标注（史料 / 考古 / 推定 / 原创扩展）；
- 比例尺：真实尺度（米或里）→ 网格格数的换算，写明缩比原则（保持拓扑与相对方位、压缩绝对尺度，城市要能在 design/22 §2 的画幅内）；
- 与游戏剧情地点的对应表（剧情 / 章节文档里提到的地点 → 布局里的地标 ID）。

### 2. 重写两份城市规格

按复原依据表，把城垣、城门、街道、水系、桥、分区（皇城 / 王府、官署、商业、住宅、寺观、军营 / 仓、园林等）、固定地标写进 `city_dali__ch01.yaml`、`city_hangzhou__ch02.yaml`（格式按 schema，字段含义按 design/22 §6；建筑类型 ID 只用 design/22 主定义表里已有的，占地尺寸按 `assets/default/baseline/building-map/manifest.yaml` 已出的 38 张建筑：`.agents/wt/TOWN-buildings/assets/default/baseline/building-map/manifest.yaml`，可只读参考）。通用建筑的配额按分区面积估一个能放下的数，让生成器贪心填满。

要求：`gen_layout.py` 与 `check_town.py` 对两城都通过；生成秒级；确定性。生成器或校验器不支持的历史特征（例如不规则城垣、湖泊、多条并行河渠、斜向街道），优先改规格适配；确实要改工具才能表达的，可以改 `tools/town/`，改动最小，单测跟上，并在报告里列出。

### 3. 平面布局图（俯视，north up）

写 `tools/town/plan_view.py`：从规格 + 布局生成俯视平面图 SVG（和 PNG），标注城门名、主街名、水系名、分区名、固定地标名（用规范汉字，文字由代码写入 SVG）。输出到 `docs/design/town/history/dali_plan.svg` / `.png`、`linan_plan.svg` / `.png`。这就是作者要看的"布局图"，要和史料平面图能对上（方位、相对位置）。

### 4. 45 度预览

用 `render_town.py` 重新渲染 `assets/default/baseline/town/preview/town_dali__ch01_layout.png`、`town_hangzhou__ch02_layout.png`（占位方块即可，真素材总装由 TOWN-assemble 做），`view_image` 看一眼：城垣、街道、水系、分区和平面图一致。

### 5. 同步 design/22

design/22 里描述两城布局依据的段落改为指向 `history/*.md`；被改动的数字同步。不重写其他章节。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/town -p "test_*.py"`
- `python3 tools/town/gen_layout.py docs/design/town/city_dali__ch01.yaml -o /tmp/tianshu_town_dali.yaml && python3 tools/town/check_town.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml`
- `python3 tools/town/gen_layout.py docs/design/town/city_hangzhou__ch02.yaml -o /tmp/tianshu_town_hz.yaml && python3 tools/town/check_town.py docs/design/town/city_hangzhou__ch02.yaml /tmp/tianshu_town_hz.yaml`
- `python3 tools/town/plan_view.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml -o docs/design/town/history/dali_plan.svg`（PNG 同名同目录）
- `python3 tools/town/plan_view.py docs/design/town/city_hangzhou__ch02.yaml /tmp/tianshu_town_hz.yaml -o docs/design/town/history/linan_plan.svg`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：每城的来源数量与可信度分布；复原了哪些要素、哪些是推定 / 原创扩展；缩比；两城各类型建筑数；工具改动清单；需作者确认的事项（例如"临安只取皇城以北到众安桥一段还是全城"这类取舍，附你采用的默认）。报告控制在 150 行以内。
