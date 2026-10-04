# CITY-layouts-ch10-b 报告 · 城图全量 · ch10《白马啸西风》都城 / 大城逐城考据 第 2 批：36 城 × 年代（major 36）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

交付36个唐702年单元的规格、复原依据、布局、北向平面图及JPEG预览；29个完成候选、7个部分候选，0跳过。
逐城检索并登记实际阅读来源；6城实际下载看图，其余30城采用明确标记的文字约束与推定格局。
所有网格为160×160，均不出全尺寸；没有同带副本，没有生成新素材、修改工具或执行提交。
唐套件缺失，保留tang键并逐城记录宋基线外观替代；候选图不等于702年测绘复原。

## 2. 产出（文件、行数、主要章节）

| 路径范围 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `docs/design/town/city_*__ch10.yaml`（限本批） | 36份；每份43–56行 | 逐城名称、史料、几何、功能分区、配额、年代套件 |
| `docs/design/town/history/city_*__tang_702.md` | 36份；每份110–112行 | 年代边界、来源评级、复原表、缩景、剧情引用、校验与依赖 |
| 同目录 `_plan.svg` / `_plan.png` | 各36份；SVG每份541–1252行 | 北向坐标、墙门、水道、道路、分区与建筑占地 |
| `assets/default/town/city_*__ch10/` | 36目录×3文件 | layout每份84408–123466行；manifest每份95–140行；preview.jpg |
| `docs/design/town/progress/CITY-layouts-ch10-b.csv` / `.done.txt` | 37 / 36行 | 单元状态、路径与未定理由 |
| 本报告 | 不超过120行 | 批次汇总、问题与验收 |

合计255个交付文件；36城主产物共63.80 MB，其中资产目录共54.19 MB；不含已清理的临时参考图和工作日志。

## 3. 关键结论与数值

下表每行年代带均为`tang_702`，主章节ch10；链接直达逐城依据。来源A/B/C定义见各篇§2，来源数按逐城引证计（包含重复引用同一文献），回退数按manifest逐条记录计。
G＝160×160、1m游戏格、非等比拓扑缩景；不换算历史米数；预览缩放0.25。T＝tang→baseline中的song_southern/song_dali；建筑显式借用song_southern，非唐式形制实证。

| 城 × 年代 | 完成情况 | 来源数 / 可信度 / 阅读 | 推定项数 | 网格与缩比 | 套件 / 回退项 | 副本章节 |
|---|---|---|---|---|---|---|
| [安庆 × 702](../../../docs/design/town/history/city_anqing__tang_702.md) | 完成候选 | 2 / B/A / 文字 | 15 | G | T / 30 | 无 |
| [芜湖 × 702](../../../docs/design/town/history/city_wuhu__tang_702.md) | 完成候选 | 1 / B / 文字 | 11 | G | T / 29 | 无 |
| [黄山 × 702](../../../docs/design/town/history/city_huangshan__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [苏州 × 702](../../../docs/design/town/history/city_suzhou__tang_702.md) | 完成候选 | 2 / B/B / 图文 | 20 | G | T / 32 | 无 |
| [无锡 × 702](../../../docs/design/town/history/city_wuxi__tang_702.md) | 完成候选 | 1 / B / 文字 | 16 | G | T / 30 | 无 |
| [嘉兴 × 702](../../../docs/design/town/history/city_jiaxing__tang_702.md) | 完成候选 | 1 / B / 文字 | 20 | G | T / 38 | 无 |
| [绍兴 × 702](../../../docs/design/town/history/city_shaoxing__tang_702.md) | 完成候选 | 1 / B / 文字 | 20 | G | T / 32 | 无 |
| [宁波 × 702](../../../docs/design/town/history/city_ningbo__tang_702.md) | 部分候选 | 1 / B / 文字 | 10 | G | T / 23 | 无 |
| [舟山 × 702](../../../docs/design/town/history/city_zhoushan__tang_702.md) | 完成候选 | 1 / B / 文字 | 10 | G | T / 27 | 无 |
| [温州 × 702](../../../docs/design/town/history/city_wenzhou__tang_702.md) | 完成候选 | 2 / C/B / 图文 | 20 | G | T / 38 | 无 |
| [福州 × 702](../../../docs/design/town/history/city_fuzhou__tang_702.md) | 完成候选 | 1 / B / 文字 | 13 | G | T / 25 | 无 |
| [泉州 × 702](../../../docs/design/town/history/city_quanzhou__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [莆田 × 702](../../../docs/design/town/history/city_putian__tang_702.md) | 完成候选 | 1 / A / 文字 | 10 | G | T / 23 | 无 |
| [厦门 × 702](../../../docs/design/town/history/city_xiamen__tang_702.md) | 完成候选 | 1 / B / 文字 | 10 | G | T / 27 | 无 |
| [漳州 × 702](../../../docs/design/town/history/city_zhangzhou__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [南昌 × 702](../../../docs/design/town/history/city_nanchang__tang_702.md) | 完成候选 | 1 / C / 文字 | 15 | G | T / 30 | 无 |
| [九江 × 702](../../../docs/design/town/history/city_jiujiang__tang_702.md) | 完成候选 | 1 / C / 文字 | 15 | G | T / 30 | 无 |
| [赣州 × 702](../../../docs/design/town/history/city_ganzhou__tang_702.md) | 完成候选 | 2 / B/B / 图文 | 17 | G | T / 36 | 无 |
| [景德镇 × 702](../../../docs/design/town/history/city_jingdezhen__tang_702.md) | 完成候选 | 1 / A / 文字 | 10 | G | T / 23 | 无 |
| [武汉 × 702](../../../docs/design/town/history/city_wuhan__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [襄阳 × 702](../../../docs/design/town/history/city_xiangyang__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [荆州 × 702](../../../docs/design/town/history/city_jingzhou__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [岳阳 × 702](../../../docs/design/town/history/city_yueyang__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 34 | 无 |
| [长沙 × 702](../../../docs/design/town/history/city_changsha__tang_702.md) | 完成候选 | 1 / B / 文字 | 15 | G | T / 30 | 无 |
| [衡阳 × 702](../../../docs/design/town/history/city_hengyang__tang_702.md) | 完成候选 | 1 / B / 图文 | 10 | G | T / 23 | 无 |
| [十堰 × 702](../../../docs/design/town/history/city_shiyan__tang_702.md) | 部分候选 | 1 / A / 文字 | 15 | G | T / 30 | 无 |
| [宜昌 × 702](../../../docs/design/town/history/city_yichang__tang_702.md) | 部分候选 | 2 / B/A / 文字 | 15 | G | T / 30 | 无 |
| [广州 × 702](../../../docs/design/town/history/city_guangzhou__tang_702.md) | 完成候选 | 1 / B / 文字 | 13 | G | T / 25 | 无 |
| [佛山 × 702](../../../docs/design/town/history/city_foshan__tang_702.md) | 完成候选 | 1 / B / 文字 | 10 | G | T / 23 | 无 |
| [肇庆 × 702](../../../docs/design/town/history/city_zhaoqing__tang_702.md) | 完成候选 | 1 / B / 文字 | 10 | G | T / 23 | 无 |
| [潮州 × 702](../../../docs/design/town/history/city_chaozhou__tang_702.md) | 部分候选 | 1 / B / 文字 | 10 | G | T / 23 | 无 |
| [桂林 × 702](../../../docs/design/town/history/city_guilin__tang_702.md) | 完成候选 | 3 / B/B/A / 图文 | 13 | G | T / 25 | 无 |
| [柳州 × 702](../../../docs/design/town/history/city_liuzhou__tang_702.md) | 部分候选 | 2 / B/C / 文字 | 15 | G | T / 30 | 无 |
| [南宁 × 702](../../../docs/design/town/history/city_nanning__tang_702.md) | 部分候选 | 2 / B/A / 文字 | 15 | G | T / 30 | 无 |
| [海口 × 702](../../../docs/design/town/history/city_haikou__tang_702.md) | 部分候选 | 2 / B/C / 文字 | 15 | G | T / 30 | 无 |
| [成都 × 702](../../../docs/design/town/history/city_chengdu__tang_702.md) | 完成候选 | 1 / A / 图文 | 19 | G | T / 34 | 无 |

共46条逐城来源、512项独立几何推定；推定项＝墙环＋门＋街路＋河湖＋桥＋水门＋分区，不含自动建筑与连接路。总建筑2027栋，类型合计：courtyard 37、house 1055、inn 36、market_stall 288、shop_1f 446、stable 36、temple_hall 28、warehouse 70、yamen 31；分城数见各篇§4。
160×160＝25600格；32格分块＝5×5；运行时219槽＝73+73+73、160行＝80+80，共6街区候选，正式scene绑定均null。预览全部2560×1280、JPEG默认q85，短边1280≥512。
考据类study＝36：人工检索/阅读与格局推定未分别计时，不能可靠回溯单城平均人工耗时；纯推定类generic＝0，无统计样本。实际记录的完整工具链耗时n＝35，均值29.44秒/城、范围25.41–35.58秒；安庆首轮未独立计时，不纳入。工具链含生成、严格校验、平面图和渲染，不含考据、目检与后续元数据校正，不作为性能基准。
跳过清单：空；0/36＝0%。7个部分候选均图件齐备、几何可用，缺口为史料定位或证据链，见§4。

## 4. 开放问题（附默认值）

宁波默认小溪县治；十堰默认旧均州武当县；宜昌默认大江左岸旧治，步阐/陆抗二垒异文未裁；潮州默认溪东；柳州默认柳江北岸旧治但地方PDF未取到；南宁默认江北旧治且不认定702年都督府在此办公；海口默认南部内陆舍城候选，不绑定旧州或云龙乡镇。七项均保持partial_candidate。
其余城市的精确郭界、门数、寺院院界、支汊、海岸线与山体同样尚待考；默认采用各篇§3的明确推定，不把complete_candidate解释为史学定论。
唐贴片到位前保留宋基线候选；道路与土地区别在0.25图上较弱，默认以北向平面图与layout审核通行，后续素材阶段改善可读性。人工耗时缺测保持如实披露，不补造计时。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案；AR-26与基准v1.10已决定ch10为702–703，AR-47已决定全量。城市古今异址通过本批候选与待考说明处理，不改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步内容 |
|---|---|
| `docs/design/map/cities.yaml` / ch10年代与display | 旧清初记录应按AR-26同步；安庆对应舒州怀宁、黄山对应歙州、福州为旧泉州而今泉州为武荣州、桂林为始安县；其余按逐城依据复核，不改稳定city ID |
| `docs/design/19-world-map.md` / 城市历史变迁 | 七个部分候选的地望异说与默认值；武汉聚合节点本批选鄂州江夏侧，汉阳子场景另行归属 |
| `tools/agents/prompts/CITY.md` / 第4步 | 通用模板仍写preview.png、全尺寸与overlay全出，宜同步磁盘规则v2；本批已遵从用户v2覆盖 |
| `tools/town/`、素材任务 / 年代与表现缺口 | tang目录缺失；土墙借到砖墙、门孔宽总装适配、桥与地表回退已留痕；山区无高程复原，低缩放土路对比弱。本批不改工具或贴片 |
| `docs/README.md` / 原有ID引用 | 严格检查仍列出基线未定义`sk_babuganchan`；由归属文档维护者处理，本批新增错误为0，未修改该引用 |
| 共享`town/progress.csv`、`done.txt`、`progress.md` | 由追踪者合入本批36行，保留29/7状态与原待考理由 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：36个study主单元、0副本；只交允许路径，未改清单、名录、共享进度、工具、素材、基准或其他文档；未执行改变git状态的命令。
- ✅ 考据：逐城联网；来源有URL、2026-10-03访问日期与图/文区别；6城已看图，30城文字回退。墙门街桥、官署市居、寺观与水岸分别说明证据和推定；无虚构原著引文或到访情节。
- ✅ 规格与布局：36城严格几何/素材校验通过；来源分类修正后重新生成，除source_spec元数据外布局逐项相等；各类型建筑数和剧情对应见各篇§4–5。
- ✅ 必检：`python3 tools/agents/check_city_batch.py docs/design/town/progress/CITY-layouts-ch10-b.expect.csv docs/design/town/progress/CITY-layouts-ch10-b.csv`返回0，36单元、0跳过、0问题。
- ✅ 必检：`python3 tools/lint/check_ids.py --strict`返回0，strict failure count＝0；全仓原有未定义ID基线1项、相似项1组未动，不属于本批新增错误。
- ✅ 磁盘v2：每城仅layout.yaml、preview.jpg、manifest.yaml；一条candidate，SHA256与尺寸一致；目录最大1.73 MB＜3 MB；fullsize全部no，town.png/overlay.svg均0；平面图置history，日志与参考未入资产。
- ✅ 逐城目检36张预览；河岸与墙门、桥端、主要街路位置对照规格和平面图，建筑未压水或越所属城墙；已修正紧凑分区放不下衙署、水渠在图内无依据截断等问题。
- ✅ 文档60–140行、报告≤120行；已通读共同条款及36城独有段落并查表格、链接、XML、图片与哈希，无截断、代码块失配或占位文本。
- ⚠️ 史料：没有702年完整实测平面；7城保留部分候选；技术检查允许年代素材替代警告，并不等于release通过；历史尺度与唐建筑形制尚不能按实测验收。
- ⚠️ 耗时：人工考据与推定未分项计时；工具链均值仅覆盖有完整计时的35城，已说明样本和边界。
- ✅ 技术依据：本地核对`tools/town/README.md`及`render_town.py`的JPEG默认85与套件回退实现；未引入外部版本、API、浏览器支持或价格限额断言；未使用image_gen、runner或子代理。
