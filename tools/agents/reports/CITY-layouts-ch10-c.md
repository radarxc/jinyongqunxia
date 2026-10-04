# CITY-layouts-ch10-c 报告 · 城图全量 · ch10《白马啸西风》都城 / 大城逐城考据 第 3 批：36 城 × 年代（major 34、capital 2）+ 0 个同带章节副本（AR-47，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

交付36个唐702年study单元的规格、逐城复原依据、北向平面图、layout、JPEG预览与manifest；19个完成候选、17个部分候选、0跳过。
逐城联网登记36项实际阅读来源，丽江、宁安、和田另实际下载看图；其余33城以文字证据限定推定，未把后世城图倒置为702实测图。
全部为160×160、0.25预览、fullsize=no；无同带副本，未生成新素材、修改工具或执行提交。
25城请求tang并回退宋基线；4城tubo、7城xiyu使用地域建筑，缺少的共通地表、门向或门宽仍逐项留痕。
本轮按合入前审核收紧伊宁、和田证据边界；未新增来源、未改几何或重出图片，仅同步规格来源说明与layout内嵌规格哈希。

## 2. 产出（文件、行数、主要章节）

| 路径范围 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `docs/design/town/city_*__ch10.yaml`（限本批） | 36份，共1733行；44–54行/份 | 年代边界、几何、功能分区、配额、套件与史料键 |
| `docs/design/town/history/city_*__tang_702.md` | 36份，共3852行；均107行 | 结论、来源评级、逐项取舍、缩景、剧情边界、校验与依赖 |
| 同目录`_plan.svg` / `_plan.png` | 各36份；SVG共27464行 | 北向墙门、水道、道路、分区、建筑占地与图例 |
| `assets/default/town/city_*__ch10/` | 36目录×3文件 | layout、2560×1280 preview.jpg、单条candidate manifest |
| 本批CSV / done / 报告 | 37行 / 36行 / ≤120行 | 状态、可追溯路径、待考理由与验收记录 |

合计255个交付文件；layout共3755848行，manifest共3580行；资产目录合计52.99 MB，最大单城1.68 MB。

## 3. 关键结论与数值

下表均为`tang_702 / ch10`。整/部＝`complete_candidate`/`partial_candidate`；来源A/A-/B/C定义见各篇§2，图/文为实际阅读方式。G＝160×160、1m游戏格、非等比拓扑缩景、JPEG缩比0.25；回退数为manifest的`asset_substitutions`条数。

| 城 × 年代 / 依据 | 状态 | 来源数 / 可信度 / 阅读 | 推定项 | 网格与缩比 | 套件 / 回退 | 副本 |
|---|---|---|---:|---|---|---|
| [重庆×702](../../../docs/design/town/history/city_chongqing__tang_702.md) | 整 | 1/B/文 | 16 | G | tang/36 | 无 |
| [都江堰×702](../../../docs/design/town/history/city_dujiangyan__tang_702.md) | 整 | 1/A/文 | 15 | G | tang/30 | 无 |
| [乐山×702](../../../docs/design/town/history/city_leshan__tang_702.md) | 整 | 1/B/文 | 15 | G | tang/30 | 无 |
| [奉节×702](../../../docs/design/town/history/city_fengjie__tang_702.md) | 整 | 1/A/文 | 19 | G | tang/30 | 无 |
| [丽江×702](../../../docs/design/town/history/city_lijiang__tang_702.md) | 部 | 1/B/图 | 10 | G | tang/23 | 无 |
| [保山×702](../../../docs/design/town/history/city_baoshan__tang_702.md) | 部 | 1/B/文 | 10 | G | tang/23 | 无 |
| [腾冲×702](../../../docs/design/town/history/city_tengchong__tang_702.md) | 部 | 1/A-/文 | 10 | G | tang/23 | 无 |
| [曲靖×702](../../../docs/design/town/history/city_qujing__tang_702.md) | 整 | 1/A/文 | 14 | G | tang/24 | 无 |
| [贵阳×702](../../../docs/design/town/history/city_guiyang__tang_702.md) | 部 | 1/B/文 | 10 | G | tang/23 | 无 |
| [天水×702](../../../docs/design/town/history/city_tianshui__tang_702.md) | 整 | 1/B/文 | 15 | G | tang/30 | 无 |
| [平凉×702](../../../docs/design/town/history/city_pingliang__tang_702.md) | 部 | 1/B/文 | 15 | G | tang/30 | 无 |
| [中卫×702](../../../docs/design/town/history/city_zhongwei__tang_702.md) | 整 | 1/B/文 | 15 | G | tang/30 | 无 |
| [西宁×702](../../../docs/design/town/history/city_xining__tang_702.md) | 整 | 1/B/文 | 15 | G | tang/30 | 无 |
| [辽阳×702](../../../docs/design/town/history/city_liaoyang__tang_702.md) | 整 | 1/A/文 | 14 | G | tang/24 | 无 |
| [锦州×702](../../../docs/design/town/history/city_jinzhou__tang_702.md) | 部 | 1/C/文 | 15 | G | tang/30 | 无 |
| [丹东×702](../../../docs/design/town/history/city_dandong__tang_702.md) | 部 | 1/C/文 | 15 | G | tang/30 | 无 |
| [营口×702](../../../docs/design/town/history/city_yingkou__tang_702.md) | 整 | 1/B/文 | 14 | G | tang/24 | 无 |
| [吉林×702](../../../docs/design/town/history/city_jilin__tang_702.md) | 部 | 1/B/文 | 10 | G | tang/23 | 无 |
| [宁安×702](../../../docs/design/town/history/city_ningan__tang_702.md) | 部 | 1/A/图 | 10 | G | tang/23 | 无 |
| [齐齐哈尔×702](../../../docs/design/town/history/city_qiqihar__tang_702.md) | 部 | 1/B/文 | 10 | G | tang/23 | 无 |
| [赤峰×702](../../../docs/design/town/history/city_chifeng__tang_702.md) | 部 | 1/B/文 | 9 | G | tang/17 | 无 |
| [呼和浩特×702](../../../docs/design/town/history/city_hohhot__tang_702.md) | 整 | 1/B/文 | 14 | G | tang/24 | 无 |
| [鄂尔多斯×702](../../../docs/design/town/history/city_ordos__tang_702.md) | 整 | 1/B/文 | 19 | G | tang/30 | 无 |
| [锡林浩特×702](../../../docs/design/town/history/city_xilinhot__tang_702.md) | 部 | 1/B/文 | 9 | G | tang/17 | 无 |
| [澎湖×702](../../../docs/design/town/history/city_penghu__tang_702.md) | 部 | 1/A-/文 | 10 | G | tang/23 | 无 |
| [拉萨×702](../../../docs/design/town/history/city_lhasa__tang_702.md) | 整 | 1/B/文 | 11 | G | tubo/16 | 无 |
| [日喀则×702](../../../docs/design/town/history/city_shigatse__tang_702.md) | 部 | 1/B/文 | 10 | G | tubo/22 | 无 |
| [昌都×702](../../../docs/design/town/history/city_qamdo__tang_702.md) | 部 | 1/B/文 | 11 | G | tubo/28 | 无 |
| [阿里×702](../../../docs/design/town/history/city_ngari__tang_702.md) | 部 | 1/B/文 | 15 | G | tubo/28 | 无 |
| [喀什×702](../../../docs/design/town/history/city_kashgar__tang_702.md) | 整 | 1/A/文 | 14 | G | xiyu/22 | 无 |
| [和田×702](../../../docs/design/town/history/city_hotan__tang_702.md) | 整 | 1/A/图（布局推测） | 14 | G | xiyu/22 | 无 |
| [叶尔羌×702](../../../docs/design/town/history/city_yarkand__tang_702.md) | 部 | 1/B/文 | 10 | G | xiyu/22 | 无 |
| [阿克苏×702](../../../docs/design/town/history/city_aksu__tang_702.md) | 整 | 1/C/文 | 15 | G | xiyu/28 | 无 |
| [库车×702](../../../docs/design/town/history/city_kuqa__tang_702.md) | 整 | 1/A/文 | 14 | G | xiyu/22 | 无 |
| [库尔勒×702](../../../docs/design/town/history/city_korla__tang_702.md) | 整 | 1/B/文 | 14 | G | xiyu/22 | 无 |
| [伊宁×702](../../../docs/design/town/history/city_yining__tang_702.md) | 整 | 1/B/文（城形街向推定） | 19 | G | xiyu/28 | 无 |

合计36项来源（A 8、A- 2、B 23、C 3；图文3、仅文字33）、475项独立几何推定、1181栋生成建筑、910条素材替代；返修未新增来源，数量与评级不变。160×160＝25600格；32格分块＝5×5；运行时219槽＝73+73+73、160行＝80+80，共6个分带，`formal_scene_refs=null`。
初始完整工具链记录1746秒，平均48.5秒/城；最终逐城run日志因11城修订重跑覆盖为1811秒，平均50.3秒/城。36城均为study；人工考据与人工格局推定未分别计时，无法给出可信的两项单城均值；generic为0，无推定生成器样本。
跳过清单为空（0/36）。部分候选均有完整可玩图件，缺口是702年具体城址、同期平面或年代归属，不是生成失败。

## 4. 开放问题（附默认值）

丽江、保山、腾冲、贵阳、平凉、锦州、丹东、吉林、宁安、齐齐哈尔、赤峰、锡林浩特、澎湖、日喀则、昌都、阿里、叶尔羌共17城保留`partial_candidate`；默认沿用各篇§1/§3候选，取得同期考古平面后替换推定折点，不把后世名城格局前推。
和田默认采用论文据文献、壁画提出的方城四门与十字街布局推测，不采用南北隔墙竞争方案，也不把它写成约特干勘探结论；伊宁大小二城有据，近方轮廓与东西向贯城道路默认均为推定。喀什王城院落只表达疏勒王政权功能；库尔勒史料所见墙外环壕因现行通行域契约无法合法成桥而暂不绘。
唐专属贴片到位前保留当前回退预览；正式发布前重渲染全尺寸。考据与推定耗时缺测保持如实披露，不补造均值。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案；本批只落实AR-26的702–703年代带与AR-47全量要求，古今城市错位由逐城依据和候选状态承载。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 建议同步；本任务未改 |
|---|---|
| `docs/design/map/cities.yaml` / ch10年代与display | 旧清初显示应按AR-26换成各篇702时点名；重点核三赕、永昌、矩州、平凉旧治、辽西驿防、泊汋、早期渤海及吐蕃/西域稳定键映射 |
| `docs/design/19-world-map.md` / 城市历史变迁 | 收录17个部分候选的地望/年代边界，以及宁安约755年后上京图只能反证702、和田南北隔墙为未选假说 |
| `tools/town`、`design/22` / 几何契约 | 有墙城市的可走域裁到墙内，无法表达墙外闭合环壕与合法通行桥；库尔勒因此未伪画护城河 |
| `tools/town/plan_view.py` / 依据识别 | `history_reference`对相对文本前缀较脆弱；本批改用完整`docs/design/town/history/...`路径规避错误派生`tubo_702/xiyu_702`标题 |
| 素材任务 / 年代套件 | 缺`tang`套件；tubo/xiyu仍缺部分共通地表、河岸、水面、城门或门宽，当前manifest逐项记录回退 |
| 共享`town/progress.csv`、`done.txt`、`progress.md` | 追踪者合入本批36行并保留19整/17部/0跳过及逐城理由 |
| 协调器日志目录 | 沙箱不能创建工作树内`.agents/coord/_asset_logs/...`；本轮过程日志置`/private/tmp`并在交付前清理，未进入资产 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：36个study主单元、0副本；只写允许路径，未改expect、工具、素材、名录、共享进度、基准或其他文档；未执行改变git状态的命令。
- ✅ 考据：逐城联网，来源含URL、2026-10-03访问日和图/文区别；本轮已把伊宁城形/街向改为推定，把和田墙门道路限定为论文布局推测并撤回无来源的勘探表述；无虚构原著引文或到访。
- ✅ 规格/图件：36份依据均107行；36城strict-assets、SVG/XML、PNG/JPEG、哈希与manifest尺寸检查通过；六张6城放大联系表目检未见越墙、压水、断墙或破图。
- ✅ 必检：`check_city_batch.py ...ch10-c.expect.csv ...ch10-c.csv`返回0：单元36、完成36、跳过0、问题0。
- ✅ 必检：`check_ids.py --strict`返回0，strict failure count=0；全仓已有`sk_babuganchan`基线缺项与一组近似ID未动，本批新增错误0。
- ✅ 返修联动：伊宁/和田layout的`source_spec.sha256`分别更新为`cc75c22c…b160f`/`5f30f551…2757`；未重渲染，preview SHA256仍为`0d449b57…ea8f`/`05fc8578…1167`且与manifest一致。
- ✅ 磁盘规则v2：每城目录恰为layout.yaml、preview.jpg、manifest.yaml；均单条candidate、2560×1280、短边1280≥512；fullsize全no，town.png/overlay.svg均0；无日志/JSON混入。
- ✅ 预览命令均为`render_town.py ... --scale 0.25`，JPEG默认q85由本地工具运行验证；manifest写真实SHA256、套件目录、回退与“全尺寸未渲染”。
- ✅ 文档和报告行数合规；无未完成占位，表格、SVG和路径完整；临时参考不入库。
- ⚠️ 史料：没有任何一城获得可逐线复刻的702年完整实测平面；17城保持部分候选，宋基线/地域贴片只作游戏外观，不是唐代建筑考古结论。
- ⚠️ 耗时：人工考据与推定未分项计时；仅如实提供工具链日志平均值，不冒充端到端工时。
