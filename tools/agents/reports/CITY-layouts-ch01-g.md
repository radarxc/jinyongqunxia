# CITY-layouts-ch01-g 报告 · 城图全量 · ch01《天龙八部》小城 / 遗址推定格局（生成器）：37 城 × 年代（secondary 37）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

完成 `northern_song × ch01` 的 37 个 secondary 小城单元：37 份规格、37 份短版依据、37 组平面 SVG/PNG、37 份布局与 JPEG 候选，0 跳过。
全部按作者 2026-09-30 的小城推定口径离线生成，不把项目内模板冒充史料；每城来源均为 1 项 `original_extension`。
37 张预览以五张联系表逐项目检，城垣、门、主街、水系及建筑占位无异常；批次校验 37/37、严格 ID 新问题 0。
`song_north` 清单的字符串 `views` 缺口以规格级同语义 baseline ID 回退，未修改工具、贴片／建筑源素材、名录或只读清单。

## 2. 产出（文件、行数、主要章节）

- 规格：37 个 `docs/design/town/city_*__ch01.yaml`，合计 11,565 行；均为 `96×96`、1093 年、确定性 seed。
- 推定依据：37 个 `history/city_*__northern_song.md`，每篇 40 行、合计 1,480 行；含地域/年代、推定表、缩比、术语、校验与待决事项。
- 平面图：37 SVG（22,998 行）+ 37 PNG；一单元一份，北向上并保留墙、门、街、水、桥、分区及建筑。
- 资产：37 个目录，每目录严格只有 `layout.yaml`、`preview.jpg`、`manifest.yaml`；布局合计 1,454,260 行，manifest 合计 1,536 行。
- 跟踪：`progress/CITY-layouts-ch01-g.csv` 38 行（含表头）、`CITY-layouts-ch01-g.done.txt` 37 行。
- 共 262 个交付文件（含本报告）；本批 `fullsize=no`，故无 `town.png` / `overlay.svg`，也无副本章节目录。

## 3. 关键结论与数值

共同口径：来源均为 `1 / original_extension`；网格均为 `96×96=9,216` 格，理论母版 `6,144×3,072`，0.25 JPEG 为 `1,536×768`。无水模板推定 10 项（墙1+门2+街2+区5），湿润模板推定 12 项（另加水1+桥1）；“回退”按 manifest 的审计组数。

| 城 × 年代 | 来源 / 可信度 | 推定项 | 网格与缩比 | 套件 / 回退 | 副本 |
|---|---|---:|---|---|---|
| `city_hejian × northern_song` | 1 / `original_extension` | 10 | 96²；0.25→1536×768 | `liao_jin_north` / 18组 | 0 |
| `city_zunyi × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_dali` / 12组 | 0 |
| `city_jinghong × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_dali` / 12组 | 0 |
| `city_xinxiang × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_jiaozuo × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_xuchang × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_pingdingshan × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_xianyang × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_weinan × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_xinzhou × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_jincheng × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_liaocheng × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_linyi × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_dongping × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_north` / 22组（含4规格级） | 0 |
| `city_ankang × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_southern` / 10组 | 0 |
| `city_shangluo × northern_song` | 1 / `original_extension` | 10 | 同上 | `song_southern` / 10组 | 0 |
| `city_lianyungang × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_fuyang × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_jinhua × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_quzhou × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_huzhou × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_changzhou × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_wuyishan × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_shangrao × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_chenzhou × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_enshi × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_chenzhou_yuanling × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_jingmen × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_shaoguan × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_sanya × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_meishan × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_yaan × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_dazhou × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_bazhong × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_langzhong × northern_song` | 1 / `original_extension` | 12 | 同上 | `song_southern` / 18组 | 0 |
| `city_yushu × northern_song` | 1 / `original_extension` | 10 | 同上 | `tubo` / 18组 | 0 |
| `city_altay × northern_song` | 1 / `original_extension` | 10 | 同上 | `xiyu` / 18组 | 0 |

- 套件分布：`liao_jin_north` 1、`song_dali` 2、`song_north` 11、`song_southern` 21、`tubo` 1、`xiyu` 1；湿润模板 21 城、无水模板 16 城。
- 建筑共 410 栋，单城 9–12 栋；生成器统计平均 2.13 秒/城，渲染平均 3.92 秒/城，工具核心合计平均 6.05 秒/城（不含 strict check、平面图与人工目检）。
- 考据平均耗时：不适用（`study=0`，按任务要求未联网）；推定平均耗时：上述工具核心 6.05 秒/城。跳过清单：无，`0/37=0%`。

## 4. 开放问题（附默认值）

- 年代套件仍有 10–22 组候选态共享/回退；默认保留 `candidate`，素材补齐且发布检查清零前不升 `approved`。
- `车里部`、`郓州 / 东平府`、`吉阳军境`、`结古一带所指治所`、`阿尔泰山诸部` 仍带（待考）；默认逐字保留名录标签，不自行改名。
- 湿润地域模板统一给边缘水道与一桥；默认仅作可玩拓扑，取得同期城址资料后再逐对象替换。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本批只实现 AR-47 与 `design/22` 的既定生成契约，不修改年代、地理、剧情或玩法公式。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `assets/default/building-map/song_north/manifest.yaml` / 9 个 `views: [S]` 记录：现行读取器把字符串 `S` 当文件名；本批实际命中的镖局、庄园、寺殿、衙署已显式回退 baseline，工具/素材任务应统一 views 数据形状。
- `docs/design/map/cities.yaml` / 上述 5 个待考名称：后续史料任务核北宋 1093 年的名称与治所，不应由 generic 城图反向定案。
- `docs/design/22-town-layout-and-generation.md` / 小城模板：可补记 96×96、湿润地域一河一桥、JPEG q85 与 manifest 回退审计；本任务无权修改。
- 运行环境 / 过程日志：规定的 `.agents/coord/_asset_logs/` 在本工作副本沙箱内不可写；本轮临时放在工作区 `tmp/`，提取统计后已清理，未进入资产目录或交付。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 清单闭合：37/37 单元、37/37 章节完成；0 副本、0 跳过，进度与 done 文件逐项对应。
- ✅ generic 边界：未联网；37 篇依据均为 40 行，明确 1 项项目内推定来源，不冒充历史复原。
- ✅ 生成与严格素材：`check_city_batch.py` 输出“完成 37，跳过 0；问题 0 个”。
- ✅ 平面与预览：每单元一份 SVG/PNG；37 张 JPEG 均 `1536×768`、短边 768，五张联系表逐项目检无压水、出墙或明显错位。
- ✅ 磁盘规则 v2：每个主章节目录只含 layout/preview/manifest；均 `fullsize=no`，无 town.png/overlay.svg；无过程文件进入 assets。
- ✅ Manifest：每目录一条 `town_<city>__ch01`，尺寸/SHA/命令/规格/依据/套件引用齐全，notes 写全尺寸未渲染及运行时渲染，回退逐项可审计。
- ✅ ID：`python3 tools/lint/check_ids.py --strict` 退出 0；仅报告既有基线 `sk_babuganchan`，新增严格失败 0。
- ✅ 结构与范围：交付审计 37 单元问题 0；`git diff --check` 通过；未修改工具、贴片／建筑源素材、名录、TODO、共享 progress 或 expect 清单。
- ⚠️ 工具缺口：`song_north views: [S]` 仍需写集外任务修复；本批的规格级 baseline 回退均已在 manifest 和进度原因中如实记录。
