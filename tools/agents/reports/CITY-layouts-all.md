# CITY-layouts-all 报告 · 全部城市布局图 · 按城市 × 年代搜索史料、复原布局、总装完整城图（作者 10-02 晚，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）
本轮按协调者 10-03 04:40 裁定只交付已产出的 16 城（14 完整候选 + 2 既有基线）与洛阳 / 太原 / 页眉三项修复，其余 2351 项未做，续作另登记。
上述首句照录裁定范围，不表示三项均已修复：洛阳水门未完成；太原补齐三城范围并重渲染，但水门与共用内隔墙未完成；页眉按裁定保留。
本轮没有新开城市，14份完整候选与2份基线不重写；太原新增1项已实际看图来源，三城36栋均已总装。
两项指定检查均退出0；墙水相交不在现有静态检查覆盖内，因此两城仍为partial_candidate，不能因检查通过改done。
2351是未完整交付数：2345项pending、4项research_only、2项partial_candidate；不是2351项全部没有任何既有研究。

## 2. 产出（文件、行数、主要章节）
| 路径 | 行数 / 产物 | 本轮内容 |
|---|---:|---|
| docs/design/town/city_taiyuan__ch10.yaml | 63 | 三城外廓、五门、八街、汾河、跨河桥、八区、三固定地标 |
| docs/design/town/history/city_taiyuan__tang_702.md | 118 | 两来源、已看推想图、三城坐标、缩比、27项推定、未决项 |
| 同前缀_plan.svg / .png | SVG / 1594×1228 | 现工具重生成；页眉硬编码保留 |
| assets/default/town/city_taiyuan__ch10/ | layout 76191；manifest 35 | layout、stats、preview、town、overlay、渲染报告、日志、qa同步 |
| docs/design/town/history/city_luoyang__tang_702.md | 121 | 水门试验失败与保留穿城河道的边界 |
| assets/default/town/city_luoyang__ch10/ | manifest 35；qa | 复核尺寸/哈希并更新限制；图像未重渲染 |
| docs/design/town/r6-repair-boundaries.md | 58 | 三项返修结果、工具阻碍、来源与后续验收条件 |
| docs/design/town/r6-{watergate-blocker,geometry-audit}.json | 复现 / 掩膜审计 | 两水门报错、18/24墙水交格、分城建筑数 |
| docs/design/town/{done.txt,progress.csv,progress.md} | 23 / 2368 / 96 | 更新两城原因，冻结旧全量队列；未完成逐项清单保留 |
| docs/design/town/r6-{asset,id}-check.log | 两份日志 | 两项指定检查的实际输出 |
下载PDF及截页在工作区refs/，不入库；没有改工具、源素材、cities.yaml或继承的schema修改。

## 3. 关键结论与数值
沿用全量统计：189城市键、2367城市×章节、1172有效城市×年代；哈尔滨chapters为空，实际条目涉及188键。
下表完成记录均继承前轮；来源数按history实际读到的外部资料计，推定按几何对象计，自动民居不重复计。
| 已完成city_id × chNN | 来源 / 推定项 | 网格 | 历史缩比或证据边界 |
|---|---:|---:|---|
| city_dali × ch01 | 6 / 见既有history | 96² | 既有基线，59.52/37.74历史米/格；本轮跳过 |
| city_hangzhou × ch02 | 6 / 见既有history | 160² | 既有基线，御街38.05历史米/格；本轮跳过 |
| city_turpan × ch10 | 2 / 15 | 128² | 周长均值约12.53历史米/格，分期待考 |
| city_hami × ch10 | 1 / 11 | 96² | 实尺未知，一般格局 |
| city_dunhuang × ch10 | 1 / 14 | 128² | 横10.26、纵10.48历史米/格，702延续待考 |
| city_jiuquan × ch10 | 1 / 9 | 96² | 实尺未知，古南门锚点 |
| city_zhangye × ch10 | 1 / 11 | 128² | 实尺未知，不取元明扩修尺度 |
| city_wuwei × ch10 | 1 / 13 | 160² | 实尺未知，拓扑推定 |
| city_lanzhou × ch10 | 1 / 10 | 128² | 900÷104=450÷52≈8.65历史米/格 |
| city_xian × ch10 | 2 / 32 | 160² | 北宫两市拓扑，未完成地理配准 |
| city_beijing × ch10 | 2 / 21 | 160² | 南北:东西=144:112=9:7，八外口为裁剪 |
| city_kaifeng × ch10 | 2 / 15 | 128² | 实尺未知，781扩城前城河关系 |
| city_nanjing × ch10 | 2 / 12 | 96² | 冶城、西州城关系，县城实尺未知 |
| city_yinchuan × ch10 | 2 / 11 | 96² | 678西迁怀远县，实尺未知 |
| city_zhengding × ch10 | 3 / 16 | 128² | 初唐四门十字街四坊，实尺未知 |
| city_cangzhou × ch10 | 2 / 11 | 128² | 旧州镇唐城，不挪用宋城7345米周长 |
本轮太原仍部分候选：2来源（新增1已看图）/27推定/160²；西城4750÷80=59.375、3750÷64=58.59375历史米/格，东中实尺未知。
太原西/中/东城17/2/17栋=36栋；道路1763格，水942格；桥12×8格跨6格水道。建筑类型实数见history§5/stats。
太原preview=5120×2560、town=10240×5120；分别scale 0.5/1，母版宽=(160+160)×32，高=(160+160)×16；每格仍为1运行时米。
太原preview SHA-256：228a7f3c3b83fb49cacdfd2793810c9ac94ce73b25400b4aa6ac0ea8e63ed8a3；完整图哈希见manifest.notes。
洛阳仍部分候选：2来源/31推定/160²；两水门内存试验触发TOWN_GATE_ON_WATER，保留原图，不声称水门已落地。
按章完成/未完成：ch01 1/148；ch02 1/155；ch03 0/156；ch04 0/169；ch05 0/167；ch06 0/170；ch07 0/169。
ch08 0/177；ch09 0/172；ch10 14/158；ch11 0/177；ch12 0/177；ch13 0/178；ch14 0/178。未完成总数2351，逐项见progress.csv。
未完成原因：两城因水门/多墙工具边界；伊丽水、大同、杭州、大理ch10仅研究；2345项未形成完整管线，本轮按裁定不再执行。
庭州仍名录缺键，不虚增第190城；所有现有ch10保留全尺寸，manifest每目录只登记一张preview，不新增其他章节全尺寸。

## 4. 开放问题（附默认值）
洛阳：未解决，默认保留穿城连续河道与partial_candidate；需水门契约支持后重渲染，不能截断水面冒充修复。
太原：已解决中东城范围空缺；未解决跨水城垣及共用内隔墙，默认partial_candidate，不能称完整三城验收。
唐代无专套件且xiyu未接工具目录；默认宋基线candidate，等类型映射后重渲染；其形制不作唐代证据。
大同默认废置期遗址研究，杭州默认双城，大理默认继续核702城址；伊丽水营地与庭州键仍未解决。
无同期图的坐标继续推定；新太原图为后世研究推想图，不能当702测绘。第4次四城未取得可用唐平面图的限制保留。
其他章节并列最高importance默认名录首城保留全尺寸【建议值】，其余0.5预览；本轮冻结该旧续作计划，待新范围登记。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
无新增基准改案。水门、多城垣和页眉属于现有布局工具的能力缺口，应由归属任务修复。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
tools/town/check_town.py:281：当前城门无条件拒绝水；区分水门/旱门，不对水门强加陆路入口；增加墙水交集校验。
tools/town/common.py:306–334、render_town.py:396–424：支持独立城垣/共用内隔墙、水关开口与岸侧支承；两城提供18/24格失败实例。
tools/town/plan_view.py:235：history="dali.md" if city_dali else "linan.md"；改为真实history路径。本轮按裁定保留所有错误页眉，没有改工具或手修图。
docs/design/22-town-layout-and-generation.md：补多城墙、水门、残墙、无墙营地契约；同步继承schema中的128与702范围。
tools/town/schema与catalog/renderer：唐代套件缺失；接入xiyu、tubo等新类型；不因目录存在就假定工具可用。
docs/design/map/cities.yaml：ch10年份/年代带、唐名称与开放态、庭州稳定键、大同废置/杭州双城/大理分期沿用前次交接。
tools/agents/TODO归属调度：按04:40裁定冻结2351项续作，另登记缩减范围；本轮两城返修未闭环，需要工具任务，不得标全量或返修完成。
docs/README.md:185：ID检查既有sk_babuganchan未定义项仍为baseline允许项；本轮未改。ENG-09的运行时接入、性能和遮挡仍待实测。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
✅ 未新开城市；写入仅town文档、town资产、报告与任务指定不入库refs；未运行build、立绘/索引或改变仓库状态的git命令。
✅ 手写每次≤150行，CSV分140行写；工具生成长layout保留完整；报告≤120行。旧待决项保留为已解决或仍未解决。
✅ python3 tools/agents/check_asset_dirs.py "assets/default/town/*" --min 1 --max 1 --min-side 512：16目录，每目录1条、零问题、退出0。
✅ python3 tools/lint/check_ids.py --strict：159文件，新增未定义/弃用0，冲突/集合不对称0，strict failure=0，退出0。
✅ 太原gen/strict-assets/plan/两比例render成功，0 errors/28 warnings；缺素材为空、diagnostic=false；独立重生成与layout逐字节一致。
✅ 16目录manifest图像SHA-256/尺寸、layout.source_spec哈希、overlay SVG及两城plan SVG核对通过；其余14城文件与本轮开始时一致，继承schema未再改。
✅ 已查看太原plan和preview、复看洛阳preview；建筑底面与道路/桥的校验通过，三城均有建筑；manifest仍candidate。
⚠️ 返修1未完成：洛阳18格墙水相交，水门参数被现工具拒绝；未伪称重渲染或修复通过。
⚠️ 返修2部分完成：太原规格/依据/平面图/layout/双尺寸图/overlay/manifest齐，但24格墙水相交、共用内墙缺失；不改为complete_candidate。
✅/⚠️ 返修3按例外处理：已定位硬编码并交接，页眉保留；正确history引用可由manifest读取。
⚠️ 全量2351项仍未完整交付，本轮依范围裁定未继续；历史年代与宋代替代、正式scene绑定、运行时效果均未终验。
✅/⚠️ 联网重读洛阳文字与晋阳考古报告、新看三城推想图；web PDF抓取429/截图缓存失败后用curl及本机现有PDF库读取；无新增API/价格/浏览器结论。
