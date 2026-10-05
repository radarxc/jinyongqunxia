# CITY-layouts-ch01-b 报告 · 城图全量 · ch01《天龙八部》都城 / 大城逐城考据 第 2 批：28 城 × 年代（major 26、capital 2）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

交付28个`northern_song / ch01` study单元的规格、复原依据、北向平面图、layout、JPEG预览与manifest；24个完整候选、4个部分候选，0跳过。
逐城联网并实际打开33项正文；杭州城垣示意图、敦煌遗址照片实际看图，其余31项仅用文字约束推定，没有把搜索摘要冒充正文。
全部采用160×160非等比拓扑缩景；25城用`song_north`、南京/杭州/汉中用`song_southern`；本批无副本、无全尺寸。
按第2轮审核返修25个`song_north`单元：增两条3格支路，分离四区建筑类型并按面积提高配额；重出layout、平面图、预览与manifest。
返修后北套件四区建筑毛占地最低23.2%，25城共1799栋；联系表目检未见压水、越墙或堵门；3个`song_southern`单元哈希逐文件不变。
本轮按审核意见补核长治、临汾宋代建制来源；两条旧唐代来源仅保留其正文支持的前史，几何未获支持处继续标待考／推定。

## 2. 产出（文件、行数、主要章节）

| 路径范围 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `docs/design/town/city_<id>__ch01.yaml` | 28份，共1578行 | 1093年、来源、城墙/门/路/水、分区、配额、运行时分带 |
| `docs/design/town/history/city_<id>__northern_song.md` | 28份，共2718行；单篇96–100行 | 证据边界、来源读法、逐要素取舍、缩比、实测填充率与依赖 |
| 同目录 `_plan.svg` / `_plan.png` | 各28份 | 北向墙门、水系、街道、分区与生成建筑 |
| `assets/default/town/city_<id>__ch01/` | 28目录×3文件 | layout、2560×1280 JPEG q85、单条candidate manifest |
| 本批 progress / done / 报告 | 29行 / 28行 / ≤120行 | 状态、路径、理由、汇总与验收记录 |

28个资产目录共84文件、45565170 bytes，最大单文件西宁layout 1440627 bytes；layout共3054640行，均未生成`town.png`或`overlay.svg`。

## 3. 关键结论与数值

下表均为1093年、ch01、160²/0.25；整/部=`complete_candidate`/`partial_candidate`，不等于史学或发行批准。来源栏为“数量/可信度/读法”；套件栏为“kit/回退变体数”；副本均无。

| 城 × 年代 | 状态 | 来源 | 推定项 | 套件/回退 | 副本 |
|---|---|---|---:|---|---|
| [西安](../../../docs/design/town/history/city_xian__northern_song.md) | 整 | 1/B/文 | 13 | song_north/26 | 无 |
| [华阴](../../../docs/design/town/history/city_huayin__northern_song.md) | 整 | 1/B/文 | 13 | song_north/26 | 无 |
| [宝鸡（凤翔）](../../../docs/design/town/history/city_baoji__northern_song.md) | 整 | 1/B/文 | 14 | song_north/38 | 无 |
| [延安](../../../docs/design/town/history/city_yanan__northern_song.md) | 整 | 1/B/文 | 14 | song_north/36 | 无 |
| [榆林](../../../docs/design/town/history/city_yulin__northern_song.md) | 部 | 1/B/文 | 13 | song_north/26 | 无 |
| [太原](../../../docs/design/town/history/city_taiyuan__northern_song.md) | 整 | 1/B/文 | 16 | song_north/26 | 无 |
| [运城（解州）](../../../docs/design/town/history/city_yuncheng__northern_song.md) | 整 | 1/B/文 | 14 | song_north/36 | 无 |
| [临汾](../../../docs/design/town/history/city_linfen__northern_song.md) | 整 | 4/A与A-/文 | 14 | song_north/37 | 无 |
| [长治](../../../docs/design/town/history/city_changzhi__northern_song.md) | 整 | 3/A与A-/文 | 13 | song_north/26 | 无 |
| [朔州](../../../docs/design/town/history/city_shuozhou__northern_song.md) | 整 | 1/B/文 | 13 | song_north/26 | 无 |
| [济南（齐州）](../../../docs/design/town/history/city_jinan__northern_song.md) | 整 | 1/B/文 | 14 | song_north/38 | 无 |
| [曲阜（仙源）](../../../docs/design/town/history/city_qufu__northern_song.md) | 整 | 1/A/文 | 13 | song_north/26 | 无 |
| [泰安（奉符）](../../../docs/design/town/history/city_taian__northern_song.md) | 整 | 1/A/文 | 13 | song_north/26 | 无 |
| [青州](../../../docs/design/town/history/city_qingzhou__northern_song.md) | 整 | 1/A/文 | 15 | song_north/40 | 无 |
| [德州](../../../docs/design/town/history/city_dezhou__northern_song.md) | 部 | 1/A-/文 | 13 | song_north/26 | 无 |
| [蓬莱（登州）](../../../docs/design/town/history/city_penglai__northern_song.md) | 整 | 1/A/文 | 14 | song_north/38 | 无 |
| [兰州](../../../docs/design/town/history/city_lanzhou__northern_song.md) | 整 | 1/B/文 | 14 | song_north/36 | 无 |
| [天水（秦州）](../../../docs/design/town/history/city_tianshui__northern_song.md) | 整 | 1/B/文 | 15 | song_north/24 | 无 |
| [平凉（渭州）](../../../docs/design/town/history/city_pingliang__northern_song.md) | 部 | 1/B/文 | 13 | song_north/26 | 无 |
| [武威](../../../docs/design/town/history/city_wuwei__northern_song.md) | 整 | 1/A-/文 | 13 | song_north/26 | 无 |
| [张掖](../../../docs/design/town/history/city_zhangye__northern_song.md) | 整 | 1/B/文 | 13 | song_north/26 | 无 |
| [酒泉](../../../docs/design/town/history/city_jiuquan__northern_song.md) | 整 | 1/B/文 | 13 | song_north/26 | 无 |
| [敦煌](../../../docs/design/town/history/city_dunhuang__northern_song.md) | 整 | 1/B/图文 | 13 | song_north/34 | 无 |
| [中卫（鸣沙）](../../../docs/design/town/history/city_zhongwei__northern_song.md) | 部 | 1/B/文 | 13 | song_north/26 | 无 |
| [西宁（青唐）](../../../docs/design/town/history/city_xining__northern_song.md) | 整 | 1/B/文 | 20 | song_north/36 | 无 |
| [南京（江宁）](../../../docs/design/town/history/city_nanjing__northern_song.md) | 整 | 1/B/文 | 15 | song_southern/23 | 无 |
| [杭州](../../../docs/design/town/history/city_hangzhou__northern_song.md) | 整 | 1/B/图文 | 13 | song_southern/23 | 无 |
| [汉中（兴元）](../../../docs/design/town/history/city_hanzhong__northern_song.md) | 整 | 1/B/文 | 12 | song_southern/23 | 无 |

合计33条已读来源（A 7、A- 6、B 20；图文2、仅文字31）、386项几何推定、1949栋建筑、60984道路格、826条素材变体回退。
返修25城为1799栋、55291道路格；各城四区毛占地为23.2%–44.0%，最低为西宁官署640/2760=23.2%；宝鸡官署640/2592=24.7%、仓驿693/2400=28.9%。
所有布局`complete=true`、道路单连通、必需配额无缺失；回退主要为地面、道路、路缘、旋转门、水面/河岸，青州另含桥面/桥栏。
考据平均耗时、人工推定平均耗时均未记录，故不虚报；返修正式生成平均4.975秒/城（3.452–6.616），渲染平均5.631秒/城（4.524–6.519），不含校验与目检；跳过0/28。

## 4. 开放问题（附默认值）

榆林默认榆溪河区域边地聚落、德州默认长河镇将陵县治、平凉默认今城西侧渭州治候选、中卫默认中宁县鸣沙郡县候选；四城因同址映射未闭合保持`partial_candidate`。
其余城的精确郭界、门数、街坊、河岸与建筑形制也多为推定；默认保持candidate，取得1093年前后考古控制点后按对象替换并重跑。
杭州已看图仅为城垣变迁示意，敦煌已看图仅为夯土遗址照片；均不提升为1093测绘证据。原著地点仍待三联／广州修订版逐字核对。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本批落实AR-47与现有`design/22`契约，不改变1093锚点、全局玩法数值或稳定ID。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步；本任务未改 |
|---|---|
| `design/map/cities.yaml`、`design/19` | 复核榆林、德州、平凉、中卫四个部分候选的1093显示名与古今地望；宝鸡节点实际取凤翔府治天兴县。 |
| `town/progress.csv` / `done.txt` / `progress.md` | 追踪者并入本批28行，保持24整/4部/0跳过与原理由。 |
| `building-map/song_north/manifest.yaml` | `guardhouse/warehouse/yamen`的`views: [S]`被加载器当文件路径；本批北套件规格避用三类，修复后可恢复功能专用外观。 |
| 年代素材任务 | `song_north`缺通用地面、道路、路缘、水岸及旋转门变体；`song_southern`亦有回退，本批manifest已逐项留痕。 |
| 工具/名录 | 多城重要度均标major但历史上是县城或候选聚落；后续宜区分“地图重要度”与“历史行政等级”，本批不改清单。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：28个study主单元、0副本；只写授权路径，未改工具、素材、名录、基准、共享进度、expect或`node_modules`；未执行改变git状态的命令、未用子代理。
- ✅ 审核返修：仅25个`song_north`单元加支路、调分区类型/配额并重出正式产物；南京、杭州、汉中21个文件逐项SHA256与返修前一致。
- ✅ 考据：33项正文实际读取，URL和访问日齐；长治新增977–1100年CHGIS及《宋史》，临汾新增1072–1115年CHGIS、《宋史》及《元丰九域志》；旧唐代来源仅作前史；杭州/敦煌实际看图，其余仅文字。
- ✅ 管线：25城返修正式生成与严格素材检查0错误；重出北向SVG/PNG、2560×1280 JPEG q85、manifest哈希；五组联系表目检未见压水、越墙、堵门。
- ✅ 必检：`check_city_batch.py`返回0（28完成、0跳过、0问题）；`check_ids.py --strict`返回0（仅报告仓库既有`sk_babuganchan`基线，新增严格失败0）。
- ✅ 填充：北套件由32栋/城改为39–103栋/城；四区毛占地最低23.2%，余地明确留作支路、入口步道与院地，不以配额校验代替目检。
- ✅ 资产：`check_asset_dirs.py`逐城28/28通过；每目录恰为layout/preview/manifest，单条candidate、2560×1280、短边1280；manifest预览哈希全匹配；全尺寸与overlay均0。
- ✅ 文档：28份依据单篇96–100行，含完整末尾章节；报告≤120行；无未完成占位标记，SVG/PNG、表格、路径和哈希完整。
- ⚠️ 历史精度：没有任何城市取得1093年逐线可配准实测地籍；4城保持部分候选，全部精确坐标及多数功能区均为推定/原创扩展。
- ⚠️ 运行环境：协调者指定的工作树外日志目录被沙箱拒绝创建，返修过程文件改存`/private/tmp/CITY-layouts-ch01-b-repair3/`并在最终必检后清理；未污染资产目录。
