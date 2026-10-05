# CITY-layouts-ch10-a 报告 · 城图全量 · ch10《白马啸西风》都城 / 大城逐城考据 第 1 批：36 城 × 年代（capital 5、major 31）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

36 个 tang_702 单元均交付规格、复原依据、平面SVG/PNG、layout、JPEG与manifest；0跳过、0同带副本。
30个 complete_candidate、6个 partial_candidate；partial 的实物产物齐全，历史或外观限制见§4。
逐城联网读到36项独立页面，其中4项同时下载并目检参考图；没有取得可当成702实测地籍的总图。
全部请求tang并使用工具基线回退，未修改工具、名录、素材、共享进度或基准；未调用生图服务。

## 2. 产出（文件、行数、主要章节）

- `docs/design/town/city_<id>__ch10.yaml`：36份，共1666行，单份37–62行；几何、配额、来源、运行时分带。
- `docs/design/town/history/city_<id>__tang_702.md`：36份，共3678行，单份100–110行；年代、参考资料、落点、缩比、剧情边界、依赖；另有36组plan.svg/plan.png。
- `assets/default/town/city_<id>__ch10/`：每目录严格3件；36份layout共2482078行、36张preview.jpg、36份2行flow-YAML manifest。
- 本任务progress CSV 37行、done 36行；加本报告共255个交付文件。详细文件路径由CSV逐行定位。

## 3. 关键结论与数值

下表年代均为tang_702、章节ch10；“整/部”分别指complete_candidate/partial_candidate，均未获作者批准。来源B为机构/地方志/有署名研究转述，C为百科或后志追述；并非坐标可信度。
“图”表示已看参考图：杭州为清图、汉中为1921城池图、曲阜为孔庙现状图、扬州为唐城综合分期图；其余仅文字。城市链接内含原始来源URL及访问日2026-10-03。
所有缩景均非等比，历史米/格未知；网格列列出边长与JPEG缩比。T表示请求tang、回退到实际baseline目录的宋大理/南宋素材；数字为manifest自动替代条数，建筑主动借用宋大理另注明。

| 城×年代 / 复原依据 | 状态 | 来源/可信 | 推定项 | 网格/缩比 | 套件/回退 | 副本 |
|---|---|---|---:|---|---|---|
| [大同×702](../../../docs/design/town/history/city_datong__tang_702.md) | 部 | 1/B | 10 | 96²/0.25 | T/23 | 无 |
| [杭州×702](../../../docs/design/town/history/city_hangzhou__tang_702.md) | 整 | 1/B·图 | 25 | 160²/0.25 | T/36 | 无 |
| [昆明×702](../../../docs/design/town/history/city_kunming__tang_702.md) | 整 | 1/B | 8 | 96²/0.25 | T/29 | 无 |
| [大理×702](../../../docs/design/town/history/city_dali__tang_702.md) | 部 | 1/B | 8 | 96²/0.25 | T/29 | 无 |
| [沈阳×702](../../../docs/design/town/history/city_shenyang__tang_702.md) | 整 | 1/B | 8 | 96²/0.25 | T/23 | 无 |
| [天津×702](../../../docs/design/town/history/city_tianjin__tang_702.md) | 整 | 1/C | 8 | 96²/0.25 | T/23 | 无 |
| [保定×702](../../../docs/design/town/history/city_baoding__tang_702.md) | 部 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [承德×702](../../../docs/design/town/history/city_chengde__tang_702.md) | 整 | 1/C | 8 | 96²/0.25 | T/23 | 无 |
| [张家口×702](../../../docs/design/town/history/city_zhangjiakou__tang_702.md) | 整 | 1/C | 8 | 96²/0.25 | T/23 | 无 |
| [山海关×702](../../../docs/design/town/history/city_shanhaiguan__tang_702.md) | 部 | 1/C | 13 | 96²/0.25 | T/30 | 无 |
| [郑州×702](../../../docs/design/town/history/city_zhengzhou__tang_702.md) | 整 | 1/B | 12 | 128²/0.25 | T/24 | 无 |
| [登封×702](../../../docs/design/town/history/city_dengfeng__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [安阳×702](../../../docs/design/town/history/city_anyang__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [商丘×702](../../../docs/design/town/history/city_shangqiu__tang_702.md) | 部 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [南阳×702](../../../docs/design/town/history/city_nanyang__tang_702.md) | 整 | 1/C | 13 | 128²/0.25 | T/30 | 无 |
| [信阳×702](../../../docs/design/town/history/city_xinyang__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [华阴×702](../../../docs/design/town/history/city_huayin__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [宝鸡×702](../../../docs/design/town/history/city_baoji__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [汉中×702](../../../docs/design/town/history/city_hanzhong__tang_702.md) | 整 | 1/B·图 | 13 | 128²/0.25 | T/30 | 无 |
| [延安×702](../../../docs/design/town/history/city_yanan__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [榆林×702](../../../docs/design/town/history/city_yulin__tang_702.md) | 整 | 1/B | 8 | 96²/0.25 | T/23 | 无 |
| [运城×702](../../../docs/design/town/history/city_yuncheng__tang_702.md) | 整 | 1/C | 8 | 96²/0.25 | T/29 | 无 |
| [临汾×702](../../../docs/design/town/history/city_linfen__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [长治×702](../../../docs/design/town/history/city_changzhi__tang_702.md) | 整 | 1/B | 15 | 128²/0.25 | T/24 | 无 |
| [朔州×702](../../../docs/design/town/history/city_shuozhou__tang_702.md) | 整 | 1/C | 13 | 128²/0.25 | T/30 | 无 |
| [济南×702](../../../docs/design/town/history/city_jinan__tang_702.md) | 整 | 1/B | 25 | 160²/0.25 | T/30 | 无 |
| [曲阜×702](../../../docs/design/town/history/city_qufu__tang_702.md) | 整 | 1/B·图 | 13 | 128²/0.25 | T/30 | 无 |
| [泰安×702](../../../docs/design/town/history/city_taian__tang_702.md) | 整 | 1/B | 13 | 128²/0.25 | T/30 | 无 |
| [青州×702](../../../docs/design/town/history/city_qingzhou__tang_702.md) | 整 | 1/B | 26 | 160²/0.25 | T/32 | 无 |
| [德州×702](../../../docs/design/town/history/city_dezhou__tang_702.md) | 整 | 1/B | 26 | 160²/0.25 | T/24 | 无 |
| [烟台×702](../../../docs/design/town/history/city_yantai__tang_702.md) | 整 | 1/B | 8 | 96²/0.25 | T/29 | 无 |
| [蓬莱×702](../../../docs/design/town/history/city_penglai__tang_702.md) | 整 | 1/B | 8 | 96²/0.25 | T/29 | 无 |
| [扬州×702](../../../docs/design/town/history/city_yangzhou__tang_702.md) | 部 | 1/B·图 | 28 | 160²/0.25 | T/34 | 无 |
| [镇江×702](../../../docs/design/town/history/city_zhenjiang__tang_702.md) | 整 | 1/B | 20 | 128²/0.25 | T/30 | 无 |
| [徐州×702](../../../docs/design/town/history/city_xuzhou__tang_702.md) | 整 | 1/B | 16 | 128²/0.25 | T/30 | 无 |
| [合肥×702](../../../docs/design/town/history/city_hefei__tang_702.md) | 整 | 1/C | 13 | 128²/0.25 | T/30 | 无 |

推定项合计491，计数口径为墙/门/街/水/桥/分区/植被对象，建筑另计；实放建筑1202座，各城类型数与min/max核算见其§4。没有新增剧情、营生或正式scene。
网格96²/128²/160²分别12/19/5城，按702场景对象压缩，不照跨时代capital标签扩大旧城遗址；预览分别1536×768、2048×1024、2560×1280，均JPEG q85。
单城平均耗时：36城均为study；考据阅读与人工推定未逐城分别计时，无法给可信的两项均值；generic为0城，无样本。可复核的生成均值4.394秒、渲染均值6.063秒，合计10.457秒/城（不含阅读、推定、校验、目检及失败重跑），不冒充端到端工时。
跳过清单为空。多城垣、跨河桥、水门均由现有工具实现；德州首次官署放置失败已用明确候选落点解决，未改工具或减掉所需建筑。

## 4. 开放问题（附默认值）

大同缺坍毁墙体贴片；大理702稳定键落点、清苑旧县治、古榆关比定、商丘墙体分期、扬州罗城702分期未定：默认保留6项partial_candidate，继续作为原创推定候选审校。
所有城精确门址、岸线、街坊分界均未达到考古定稿标准；默认只认定文献约束下的游戏布局。正式剧情绑定保持null，原著逐字核对留在各城待办。
默认以现有宋代贴片预览唐布局；不能把完整砖墙、门楼、瓦顶或盐湖水色当成唐代形制/环境的考证结论。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。仅按作者AR-26/AR-47落实702候选，不改世界年代、数值体系或全局ID归属。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步；本任务未改 |
|---|---|
| `map/cities.yaml` ch10 eras、`design/19` | 旧清初年代需同步AR-26；武台、仙掌、博城、陈仓等时点别名；废州遗址与无墙聚落不得沿用后世都城名物。 |
| `town/progress.csv` / `done.txt` / `progress.md` | 追踪者并入本批36行、30整/6部，保留旧research_only到本次候选的追溯。 |
| `tools/town/assets.py` 对应素材任务 | tang目录缺失；补唐式土墙/墙损构件、县署与聚落贴片。土路与夯土地表在0.25图中对比偏弱，平面图可辨但总装主路不够醒目。 |
| `tools/town` 与 `design/22` 多墙用法 | 独立围垣用division开放中间地带；默认outer/inner的内部并集不含城外通路。德州小官署分区自动连路可能切碎可放置地块，已用定点建筑处理。 |

## 7. 自检（逐条对照验收标准）

- ✅ `python3 tools/agents/check_city_batch.py docs/design/town/progress/CITY-layouts-ch10-a.expect.csv docs/design/town/progress/CITY-layouts-ch10-a.csv`：单元36，完成36，跳过0，问题0；其中6项仍按partial登记。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure count=0，新增未定义/废弃ID=0；沿用检查器已有1项基线未定义记录。
- ✅ 36城均实际生成、strict-assets校验、绘制SVG/PNG、渲染JPEG并逐城目检；道路分量均1，required缺口均为空，missing_assets=[]、diagnostic=false；manifest尺寸与SHA256已核。
- ✅ 磁盘规则v2：清单36项均fullsize=no，故0全尺寸、0overlay；每资产目录只含layout/preview/manifest，JPEG q85，最小短边768；最大目录约1.825 MB，小于3 MB；无同带副本。
- ✅ 36份复原依据均100–110行；来源区分已看图/仅文字，旧交接待办保留解决状态及未决项；255项交付均在写集，临时参考与日志清理，不含整仓复制；未执行改变仓库状态的git命令。
- ⚠️ 史料来源28项B、8项C，精确702墙线仍多为推定，6城的额外限制见§4；宋贴片不算唐建筑考古复原。原著未逐字复核，未编造引文、回目或人物。
- ⚠️ 考据与人工推定没有分城计时，不能提供两类可靠均值；已给可复核的生成/渲染均值。未新增外部版本/API/价格断言，本地工具契约及JPEG默认质量已查代码并运行核实。
