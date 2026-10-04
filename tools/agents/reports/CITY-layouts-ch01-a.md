# CITY-layouts-ch01-a 报告 · 城图全量 · ch01《天龙八部》都城 / 大城逐城考据 第 1 批：28 城 × 年代（capital 8、major 20）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

交付28个`northern_song / ch01` study单元的规格、87行复原依据、北向平面图、layout、JPEG预览与manifest；19个完整候选、9个部分候选、0跳过。
逐城联网并实际打开28项正文/PDF；开封历史平面图与大同报纸版面实际看图，其余26城仅以文字约束推定，没有把搜索摘要或打不开页面计作已读。
8个capital用160×160，20个major用128×128；仅北京按`fullsize=yes`另出town.png与overlay.svg，0个同带副本。
全部最终文件通过批次严格检查和ID检查；未修改工具、素材、名录、基准、共享进度或expect清单。
第2次运行按合入前审核返修商丘、南阳Z05：两区现各生成1栋马厩与2栋小民居，并以步道接入北门主街。
第3次运行仅返修腾冲：政府来源只支撑宋时设府；双层空间、六门与十字街改标无同期史证的原创扩展，派生layout与平面图已同步。

## 2. 产出（文件、行数、主要章节）

| 路径范围 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `docs/design/town/city_<id>__ch01.yaml` | 28份，共10024行 | 1093年代、史料键、几何、分区、建筑配额与运行时分带 |
| `docs/design/town/history/city_<id>__northern_song.md` | 28份，共2436行；均87行 | 证据边界、来源、缩比、逐要素取舍、剧情与依赖 |
| 同目录`_plan.svg` / `_plan.png` | 各28份；SVG共22864行 | 墙门、街道、水桥、分区与生成建筑占地 |
| `assets/default/town/city_<id>__ch01/` | 28目录 | 各含layout、preview.jpg、manifest；仅北京再含town.png、overlay.svg |
| 本批progress / done / 报告 | 29行 / 28行 / ≤120行 | 状态、可追溯路径、开放问题与验收记录 |

共201个交付文件；本批28个资产目录共56.11 MB（十进制）。28份layout共2244032行；28张预览均为JPEG q85，capital为2560×1280、major为2048×1024。

## 3. 关键结论与数值

下表均为1093年带、ch01；整/部=`complete_candidate`/`partial_candidate`，不等于史学或发行批准。每城1项外部来源；图/文指实际阅读方式。推定项按墙环＋门＋街＋水＋桥＋分区计，不含自动建筑；缩比均0.25；副本均无。

| 城 × 年代 / 依据 | 状态 | 来源/可信/读法 | 推定项 | 网格/缩比 | 套件/回退 | 副本 |
|---|---|---|---:|---|---|---|
| [燕京×1093](../../../docs/design/town/history/city_beijing__northern_song.md) | 整 | 1/B/文 | 11 | 160²/0.25 | liao_jin_north/18 | 无 |
| [沈州×1093](../../../docs/design/town/history/city_shenyang__northern_song.md) | 整 | 1/B/文 | 11 | 160²/0.25 | liao_jin_north/18 | 无 |
| [辽上京×1093](../../../docs/design/town/history/city_liaoshangjing__northern_song.md) | 整 | 1/A/文 | 13 | 160²/0.25 | liao_jin_north/18 | 无 |
| [真定×1093](../../../docs/design/town/history/city_zhengding__northern_song.md) | 整 | 1/A-/文 | 11 | 128²/0.25 | liao_jin_north/18 | 无 |
| [沧州×1093](../../../docs/design/town/history/city_cangzhou__northern_song.md) | 整 | 1/B/文 | 11 | 128²/0.25 | liao_jin_north/18 | 无 |
| [辽阳×1093](../../../docs/design/town/history/city_liaoyang__northern_song.md) | 整 | 1/B/文 | 11 | 128²/0.25 | liao_jin_north/18 | 无 |
| [锦州×1093](../../../docs/design/town/history/city_jinzhou__northern_song.md) | 整 | 1/B/文 | 11 | 128²/0.25 | liao_jin_north/18 | 无 |
| [鸭绿江口军寨×1093](../../../docs/design/town/history/city_dandong__northern_song.md) | 部 | 1/B/文 | 14 | 128²/0.25 | liao_jin_north/32 | 无 |
| [辽东女真诸部×1093](../../../docs/design/town/history/city_jilin__northern_song.md) | 部 | 1/B/文 | 11 | 128²/0.25 | liao_jin_north/30 | 无 |
| [松山州×1093](../../../docs/design/town/history/city_chifeng__northern_song.md) | 整 | 1/B/文 | 11 | 128²/0.25 | liao_jin_north/18 | 无 |
| [河套/鄂尔多斯×1093](../../../docs/design/town/history/city_ordos__northern_song.md) | 部 | 1/B/文 | 11 | 128²/0.25 | liao_jin_north/18 | 无 |
| [漠南营地×1093](../../../docs/design/town/history/city_xilinhot__northern_song.md) | 部 | 1/B-/文 | 8 | 128²/0.25 | liao_jin_north/16 | 无 |
| [鄯阐府×1093](../../../docs/design/town/history/city_kunming__northern_song.md) | 整 | 1/B+/文 | 14 | 160²/0.25 | song_dali/12 | 无 |
| [丽江部落×1093](../../../docs/design/town/history/city_lijiang__northern_song.md) | 部 | 1/A-/文 | 11 | 128²/0.25 | song_dali/10 | 无 |
| [永昌府×1093](../../../docs/design/town/history/city_baoshan__northern_song.md) | 整 | 1/B/文 | 11 | 128²/0.25 | song_dali/10 | 无 |
| [腾冲府一带×1093](../../../docs/design/town/history/city_tengchong__northern_song.md) | 部 | 1/B/文（仅设府） | 16 | 128²/0.25 | song_dali/12 | 无 |
| [石城郡一带×1093](../../../docs/design/town/history/city_qujing__northern_song.md) | 部 | 1/B-/文 | 11 | 128²/0.25 | song_dali/10 | 无 |
| [矩州一带×1093](../../../docs/design/town/history/city_guiyang__northern_song.md) | 部 | 1/B/文 | 11 | 128²/0.25 | song_dali/10 | 无 |
| [东京开封×1093](../../../docs/design/town/history/city_kaifeng__northern_song.md) | 整 | 1/A/图 | 14 | 160²/0.25 | song_north/32 | 无 |
| [西京洛阳×1093](../../../docs/design/town/history/city_luoyang__northern_song.md) | 整 | 1/A-/文 | 14 | 160²/0.25 | song_north/32 | 无 |
| [西京大同×1093](../../../docs/design/town/history/city_datong__northern_song.md) | 整 | 1/B+/图 | 11 | 160²/0.25 | song_north/18 | 无 |
| [兴庆府×1093](../../../docs/design/town/history/city_yinchuan__northern_song.md) | 整 | 1/B/文 | 14 | 160²/0.25 | song_north/32 | 无 |
| [郑州×1093](../../../docs/design/town/history/city_zhengzhou__northern_song.md) | 整 | 1/A-/文 | 11 | 128²/0.25 | song_north/18 | 无 |
| [登封×1093](../../../docs/design/town/history/city_dengfeng__northern_song.md) | 整 | 1/B/文 | 11 | 128²/0.25 | song_north/18 | 无 |
| [相州×1093](../../../docs/design/town/history/city_anyang__northern_song.md) | 整 | 1/A-/文 | 11 | 128²/0.25 | song_north/18 | 无 |
| [应天府南京×1093](../../../docs/design/town/history/city_shangqiu__northern_song.md) | 整 | 1/A-/文 | 14 | 128²/0.25 | song_north/32 | 无 |
| [邓州×1093](../../../docs/design/town/history/city_nanyang__northern_song.md) | 整 | 1/A/文 | 14 | 128²/0.25 | song_north/32 | 无 |
| [信阳军×1093](../../../docs/design/town/history/city_xinyang__northern_song.md) | 部 | 1/A-/文 | 11 | 128²/0.25 | song_north/18 | 无 |

合计28项可读来源（A 3、A- 7、B+ 2、B 14、B- 2；图2、文字26）、333项几何推定、1133栋建筑、51159道路格、554条渲染素材替代。建筑数26–55/城；商丘、南阳Z05均为3栋并接街；全部道路单连通、必需配额无缺口。
`liao_jin_north` 12城、`song_dali` 6城、`song_north` 10城；回退为缺少的地面/道路/路缘/门/水桥素材使用song_dali或song_southern共享贴片。song_north另因4类功能贴片`views: [S]`不可读，使用同套件可读匿名形制。
考据和人工推定没有逐城分项计时，无法给可信平均耗时；generic为0城，无推定生成器样本。首轮记录的28城生成／渲染均值为3.816／4.314秒；返修实测商丘4.372／4.950秒、南阳4.407／4.961秒，均不含考据、校验、重跑与目检。跳过清单为空。
腾冲来源正文另载西山坝石城始建于1445年、1448年竣工，隆庆二年拟筑外城因经费不足而罢；这些晚期资料不用于1093年城形。返修后两道包络、六门与三街均为原创扩展，只有“宋时大理国设腾冲府”引用该来源。

## 4. 开放问题（附默认值）

丹东、吉林、鄂尔多斯、锡林浩特、丽江、腾冲、曲靖、贵阳、信阳9城保持`partial_candidate`：分别缺1093具名城址、区域锚比定、同期城垣或街网。腾冲默认仅保留明确标为原创扩展的玩法拓扑；取得同期考古平面后再替换对应对象与折点。
所有城门名、精确街线、坊界与建筑栋数均未达到同期地籍标准；默认不得把candidate称为历史测绘复原或approved资产。原著地点仍待三联／广州修订版逐字核对。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本批只落实AR-47和现有`design/22`契约，不改变1093锚点、地图名录、玩法数值或全局ID。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步；本任务未改 |
|---|---|
| `map/cities.yaml`、`design/19` | 审校9个部分候选的稳定显示名与古今地望；尤其鸭绿江口军寨、辽东女真诸部、河套/鄂尔多斯、漠南营地、丽江与矩州。 |
| `town/progress.csv` / `done.txt` / `progress.md` | 追踪者并入本批28行，状态19整/9部/0跳过，保留候选理由。 |
| `assets/default/building-map/song_north/manifest.yaml`归属素材任务 | guardhouse、temple_hall、warehouse、yamen的`views: [S]`被加载器当作路径；修复后恢复功能专用外观并重渲染。 |
| 年代素材任务 | `liao_jin_north`与`song_north`缺共通地面、道路、岸线、水桥或城门变体；当前逐城manifest已自包含记录回退。 |
| `tools/town/plan_view.py` | 页眉路径依赖规格备注中的完整`history/`路径；本轮已修正腾冲规格备注并重出平面图，其他批次宜纳入路径一致性检查。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：28个study主单元、0副本；仅写允许路径，未改工具、素材、名录、基准、共享进度、任务清单或expect；未执行改变仓库状态的git命令，未使用子代理。
- ✅ 考据：28项来源均实际打开正文/PDF，含URL与2026-10-04访问日；开封、大同实际看图，其余标仅文字；无搜索摘要冒充来源，无虚构原著引文、回目、人名或招名。
- ✅ 管线：首轮28城均走完整管线；第2轮重生成商丘、南阳；本轮仅重生成腾冲layout与SVG/PNG平面图并目检。临时重渲染腾冲JPEG与原文件逐字节一致，故按续作约束未改正式预览。
- ✅ 强制检查：`check_city_batch.py ...ch01-a.expect.csv ...ch01-a.csv`返回0：单元28、完成28、跳过0、问题0。
- ✅ 强制检查：`check_ids.py --strict`返回0，strict failure count=0；全仓基线已有`sk_babuganchan`未定义1项，本批新增0。
- ✅ 审核返修：商丘、南阳Z05由`36×6`改为避水且临北门主街的`20×16`格，马厩配额由可选`0–1`改为必需`1–1`；两区均实生成3栋，正式预览SHA256分别为`dce15425…e7ca`、`8637a692…0cdb`。
- ✅ 审核返修：腾冲来源用途已收窄为宋时设府；明代西山坝石城及未成外城明确排除。双层包络改为虚线原创拓扑，六门、主街和来源字段同步；正式预览SHA256仍为`f8429631…f6a1`。
- ✅ 磁盘规则v2：27个非北京目录严格3文件；北京严格5文件并含全尺寸/overlay；JPEG q85且短边1024或1280；非全尺寸部分最大1.55 MB＜3 MB；manifest单条candidate、尺寸/SHA256/命令/回退自包含。
- ✅ 文档：28份依据均87行，报告≤120行；腾冲平面图页眉已指向`city_tengchong__northern_song.md`；无未完成占位语，表格与SVG完整；日志、stats、联网正文、参考下载和临时脚本交付前清理。
- ⚠️ 历史精度：没有任何城市取得1093年可逐线复刻的完整实测地籍；9城保持部分候选，所有精确坐标与大量功能区均为推定/原创扩展。
- ⚠️ 耗时：人工考据与推定未分别计时，只报告可复核生成/渲染时间，不冒充端到端耗时。
