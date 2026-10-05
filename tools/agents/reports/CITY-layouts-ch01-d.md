# CITY-layouts-ch01-d 报告 · 城图全量 · ch01《天龙八部》都城 / 大城逐城考据 第 4 批：27 城 × 年代（major 25、capital 2）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

交付27个`northern_song / ch01` study单元的规格、复原依据、北向平面图、layout、JPEG预览与manifest；11个完整候选、16个部分候选、0跳过。
逐城联网并实际打开正文/PDF：高昌实际看地图页；古格、和阗仅目检PDF首页且未当作平面证据；其余24城仅文字。
2个capital用160×160，25个major用128×128；全部`fullsize=no`，资产目录严格3文件，无同带副本。
27张预览经总联系表和差异拓扑放大图目检；广州、高昌补足三分区后严格校验通过。
未改工具、素材、名录、基准、共享进度或expect清单；考据不足处均保留（待考）/（推定）边界。

## 2. 产出（文件、行数、主要章节）

| 路径范围 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `docs/design/town/city_<id>__ch01.yaml` | 27份，共8924行 | 1093年代、来源、几何、分区、建筑配额与运行时分带 |
| `docs/design/town/history/city_<id>__northern_song.md` | 27份，共2862行；均106行 | 年代边界、来源、逐要素取舍、缩比、剧情与依赖 |
| 同目录`_plan.svg` / `_plan.png` | 各27份；SVG共18853行 | 墙门、街道、水系、分区与生成建筑占地 |
| `assets/default/town/city_<id>__ch01/` | 27目录、81文件、28.06 MB | 每城仅layout、preview.jpg、manifest |
| 本批progress / done / 报告 | 28行 / 27行 / ≤120行 | 状态、路径、开放问题与验收记录 |

共192个正式交付文件（含本报告）。27份layout共1974268行；preview均JPEG q85，capital为2560×1280、major为2048×1024。

## 3. 关键结论与数值

下表均为1093年带、ch01；整/部=`complete_candidate`/`partial_candidate`。来源均1项；图=实际目检地图页，首=只见首页，文=仅文字。推定项按墙＋门＋街＋水＋桥＋分区计；缩比均0.25；副本均无。

| 城 × 年代 / 依据 | 状态 | 来源/可信/读法 | 推定项 | 网格 | 套件/回退 |
|---|---|---|---:|---:|---|
| [均州×1093](../../../docs/design/town/history/city_shiyan__northern_song.md) | 部 | 1/B/文 | 12 | 128² | song_southern/16 |
| [峡州夷陵×1093](../../../docs/design/town/history/city_yichang__northern_song.md) | 部 | 1/A-/文 | 12 | 128² | song_southern/16 |
| [广州三城×1093](../../../docs/design/town/history/city_guangzhou__northern_song.md) | 整 | 1/A-/文 | 16 | 128² | song_southern/18 |
| [端州×1093](../../../docs/design/town/history/city_zhaoqing__northern_song.md) | 部 | 1/B/文 | 12 | 128² | song_southern/16 |
| [潮州子城×1093](../../../docs/design/town/history/city_chaozhou__northern_song.md) | 整 | 1/A-/文 | 12 | 128² | song_southern/16 |
| [桂州×1093](../../../docs/design/town/history/city_guilin__northern_song.md) | 部 | 1/B/文 | 12 | 128² | song_southern/16 |
| [柳州×1093](../../../docs/design/town/history/city_liuzhou__northern_song.md) | 整 | 1/B/文 | 12 | 128² | song_southern/16 |
| [邕州×1093](../../../docs/design/town/history/city_nanning__northern_song.md) | 整 | 1/B+/文 | 12 | 128² | song_southern/16 |
| [琼州×1093](../../../docs/design/town/history/city_haikou__northern_song.md) | 整 | 1/B/文 | 12 | 128² | song_southern/10 |
| [成都府×1093](../../../docs/design/town/history/city_chengdu__northern_song.md) | 整 | 1/B+/文 | 15 | 128² | song_southern/17 |
| [渝州×1093](../../../docs/design/town/history/city_chongqing__northern_song.md) | 部 | 1/B/文 | 13 | 128² | song_southern/16 |
| [永康军×1093](../../../docs/design/town/history/city_dujiangyan__northern_song.md) | 部 | 1/B/文 | 9 | 128² | song_southern/16 |
| [嘉州×1093](../../../docs/design/town/history/city_leshan__northern_song.md) | 部 | 1/B/文 | 13 | 128² | song_southern/16 |
| [夔州×1093](../../../docs/design/town/history/city_fengjie__northern_song.md) | 部 | 1/A/文 | 12 | 128² | song_southern/16 |
| [澎湖屿×1093](../../../docs/design/town/history/city_penghu__northern_song.md) | 部 | 1/A-/文 | 9 | 128² | song_southern/10 |
| [逻些×1093](../../../docs/design/town/history/city_lhasa__northern_song.md) | 整 | 1/A/文 | 8 | 160² | tubo/16 |
| [昌都河谷×1093](../../../docs/design/town/history/city_qamdo__northern_song.md) | 部 | 1/B-/文 | 10 | 128² | tubo/28 |
| [古格都城×1093](../../../docs/design/town/history/city_ngari__northern_song.md) | 整 | 1/A-/首 | 12 | 128² | tubo/30 |
| [喀什噶尔×1093](../../../docs/design/town/history/city_kashgar__northern_song.md) | 整 | 1/A/文 | 12 | 160² | xiyu/30 |
| [和阗×1093](../../../docs/design/town/history/city_hotan__northern_song.md) | 整 | 1/A/首 | 12 | 128² | xiyu/30 |
| [莎车×1093](../../../docs/design/town/history/city_yarkand__northern_song.md) | 部 | 1/A-/文 | 12 | 128² | xiyu/30 |
| [温宿×1093](../../../docs/design/town/history/city_aksu__northern_song.md) | 部 | 1/B-/文 | 12 | 128² | xiyu/30 |
| [龟兹故城×1093](../../../docs/design/town/history/city_kuqa__northern_song.md) | 部 | 1/A/文 | 12 | 128² | xiyu/30 |
| [焉耆×1093](../../../docs/design/town/history/city_korla__northern_song.md) | 部 | 1/B+/文 | 9 | 128² | xiyu/28 |
| [高昌×1093](../../../docs/design/town/history/city_turpan__northern_song.md) | 整 | 1/A/图 | 15 | 128² | xiyu/20 |
| [伊州×1093](../../../docs/design/town/history/city_hami__northern_song.md) | 部 | 1/A-/文 | 12 | 128² | xiyu/30 |
| [伊犁河谷×1093](../../../docs/design/town/history/city_yining__northern_song.md) | 部 | 1/B/文 | 9 | 128² | xiyu/28 |

合计27来源（A 6、A- 7、B+ 3、B 9、B- 2）、318项几何推定、982栋建筑、45635道路格、561条渲染替代；建筑28–42栋/城。套件分布`song_southern`15、`tubo`3、`xiyu`9；前者实际引用baseline，后两者缺件回退baseline，逐城manifest自包含记录。
考据/人工推定未逐城分项计时，无法给可信平均；generic为0城。可复核的27城生成/渲染均值为3.542/7.268秒（合计10.811秒/城），不含考据、校验、重跑与目检；跳过清单为空。

## 4. 开放问题（附默认值）

16城保持部分候选：均州、夷陵、端州、桂州、渝州、永康军、嘉州、夔州、澎湖、昌都、莎车、温宿、龟兹、焉耆、伊州、伊犁河谷缺1093完整城址/墙线/街网。默认保留拓扑候选；取得同期平面后替换推定折点。
所有精确门位、道路、坊界和栋数均非同期地籍；默认不得把candidate称为历史测绘或approved资产。原著地点仍待三联／广州修订版逐字核对。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本批只落实AR-47和`design/22`契约，不改变1093锚点、名录、玩法数值或全局ID。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步；本任务未改 |
|---|---|
| `town/progress.csv` / `done.txt` / `progress.md` | 追踪者并入本批27行：11整/16部/0跳过。 |
| `map/cities.yaml`、`design/19` | 审校温宿、焉耆、伊州、伊犁河谷等稳定现代键与1093显示名/地望。 |
| 年代素材任务 | `song_southern`无独立目录；`tubo`/`xiyu`缺共通地面、岸线或门变体，当前manifest已记录baseline回退。 |
| `tools/town`后续任务 | 高程尚不能表达古格台地；三重城只能以分界墙表达，宜评估分层地形与复合城郭契约。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：27个study主单元、0副本、0全尺寸；只写允许路径，未改工具/素材/名录/基准/共享进度/expect，未执行改状态git命令，未使用子代理。
- ✅ 考据：27项来源登记URL与2026-10-04；高昌实际看地图页，古格/和阗仅见首页并如实标注，其余仅文字；无虚构引文、回目、人名或招名。
- ✅ 管线与目检：27城均走gen→strict check→plan→render；总联系表逐图检查，广州/成都/重庆/古格/高昌等放大复核，未见建筑压水、越墙或贴片错位。
- ✅ 磁盘规则v2：27目录各严格3文件，无town.png/overlay；JPEG q85且短边1024/1280；最大目录1.60 MB＜3 MB；manifest单条candidate，含尺寸/SHA256/命令/真实套件路径与回退。
- ✅ 文档：27份依据均106行，报告≤120行；无占位文句，表格与SVG完整；过程日志、stats、联网正文、PDF和临时脚本已清理。
- ✅ 强制检查：`check_city_batch`为27完成/0跳过/0问题；`check_ids --strict`新增失败0；27目录逐一`check_assets`均1图/1条目/0问题；`git diff --check`与最终范围审计通过。
- ⚠️ 历史精度：没有任何城市取得1093年可逐线配准的完整地籍；16城保持部分候选，精确坐标及功能区均为推定/原创扩展。
- ⚠️ 耗时：人工考据与推定未分别计时，只报告可复核生成/渲染时间，不冒充端到端耗时。
