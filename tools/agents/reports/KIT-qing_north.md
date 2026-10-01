# KIT-qing_north 报告 · 建筑套件 · 清 · 北方套件

## 1. 摘要（3–6 行）

- 第11次续作完成收口：19个建筑单体、7个墙门/桥/植物贴片均已入库，全部为真RGBA、`candidate`。
- 宋套件仅作画风/材质参考；清北改为灰砖灰瓦、胡同院落、分等级官式装饰和北方植物，均为匿名历史意象（原创扩展）。
- 生成原图、提示词、实际输入副本/SHA、测点、锚点与候选取舍均已归档；首轮规格化为裁切、等比缩放和透明留边，第10轮另对7建筑与1墙角做有记录的PIL仿射校正。
- 三条指定命令本轮均退出0；候选入库完成。严格几何仍有告警（4格门宽深偏差12.32%、8/19建筑至少一项告警），不冒充发布级拼接验收。

## 2. 产出（文件、行数、主要章节）

| 路径 | 数量 / 行数 | 内容 |
|---|---|---|
| `assets/default/building-map/qing_north/` | 19成品PNG；manifest 2535行 | 19类清北单体、逐件meta、选中源/淘汰候选、规格化、历史图后验复核与只读QA |
| 同目录辅助文件 | normalize.py 155行；verify.py 140行；build_preview.py 56行；preview.html 48行 | 规格化/仿射重放、QA、本地26件审图页；非城镇总装 |
| `assets/default/tile/qing_north/` | 7成品；manifest 281行；README 55行 | 2门、直墙、外角、桥、国槐、油松；generation/qa各7行并保留源图 |
| `assets/default/prompts/building-map.md` / `tile.md` | 388 / 155行 | 新增清北§11 / §10，并写明历史图仅作后验复核 |
| `tools/agents/reports/KIT-qing_north.md` | 少于100行 | 本报告；完整清单、来源和验收边界 |

## 3. 关键结论与数值

地面目标为`32(w+h) × 16(w+h)`px；7×6民居=416×208，22×18王府=1280×640，3×2棚=160×80。源比例`32(w+h)/(Rx−Lx)`等比缩放，锚点`(L+R)/2`同步裁切与整数尺寸实际sx/sy变换；九件不足0.3px的舍入偏差已修正。PNG画布不要求2:1，允许向上容纳高度。
门净宽k=4/6 → 外占地(k+4)×4=8×4/10×4，两侧门墩各2格。前缘洞宽/总宽本轮k4实测48.68%、沿用k6为60.65%；k4源图(600,950)探针alpha0。k4左右墩正面占26.48%/24.84%，右墩深/宽1.792对目标2仍不足；左墩背角遮挡，不能声称直接实测深4格。
19张建筑短边≥256，贴片短边≥32；成品alpha均含0及255、边界透明，各成品及源图SHA分别与登记一致。底层图像模型/seed/effort未披露；未编造价格、API限额或版本，不新增相关技术事实。
比例误差按`abs(((Fx−Lx)/(Rx−Fx))/(w/h)−1)`：镖局`abs((778/653)/1.25−1)=4.686%`；赌场`abs((772/581)/1.25−1)=6.299%`；k4门`abs((793/353)/2−1)=12.323%`。测点±3px；未改占地登记。
第10轮对7建筑与1墙角作PIL仿射几何校正：双轴为±0.5；7建筑复验沿审核裁定采用轴范围0.40–0.62、比例容差30%。当前`binary_pass=true`、8件未修正建筑仍告警，其中大民居比例偏差10.62%超过严格10%；宽容阈值不代表发布级拼接通过。

## 4. 开放问题（附默认值）

- 画风/地域特征、k4 / k6门楼木构偏鲜红（k4更明显）：默认沿用候选，等待作者审美确认；不自动批准。
- 已解决：前轮王府、马厩及第10轮7建筑/1墙角的登记与仿射校正（见§3）。仍待决：8件建筑的当前阈值告警、k6右轴、桥长轴残差、k4占地偏12.32%；默认保留实测candidate，后续以重建几何优先，不再用非等比缩放伪修。
- 单朝向、实高、院内通行、门孔逐像素掩膜、桥栏遮挡：默认仅静态候选预览，四视图/GLB/运行时联调（待实测）。
- 未冻结类型占地默认采用模板§11.2建议值；宗教地标默认六层汉地楼阁式砖塔意象，层数非文物复原；王府22×18不冒充未制作的皇宫24×20模块。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准提案；不改玩法、战斗数值或ID前缀。素材家族与套件枚举的接入列第6节。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/22-town-layout-and-generation.md` | §3.4、§4.1 | 评估纳入qing_north地域键和19类同构占地；现有qing_early枚举不自动等价 |
| 同上及后续城市规格 | §2.6、§3.5、§4.3、§7 | 旗民分城仍需城史坐标；接入实测锚点、单视图限制、门孔/桥栏分层；严格几何警告不能由文件门禁替代 |
| `assets/default/baseline/town/`交接 | 总装 | 当前仓库所见为纯色占位预览，未见真实宋素材总装；本次只核对其坐标/排序契约，未声称完成清北总装 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

清单（ID即building.type；贴片另列kind；尺寸均PIL实测）：

| ID | 类型 | 占地格 | 尺寸px |
|---|---|---|---|
| bld_kit_qing_north_house_small | 小民居 | 6×5 | 410×348 |
| bld_kit_qing_north_house_large | 大民居 | 7×6 | 508×349 |
| bld_kit_qing_north_courtyard | 院落 | 10×8 | 625×391 |
| bld_kit_qing_north_shop_1f | 单层商铺 | 7×5 | 477×356 |
| bld_kit_qing_north_shop_2f | 两层商铺 | 8×6 | 489×556 |
| bld_kit_qing_north_inn | 客栈 | 12×9 | 724×541 |
| bld_kit_qing_north_restaurant | 酒楼茶肆 | 12×9 | 816×790 |
| bld_kit_qing_north_market_stall | 市场棚 | 3×2 | 256×256 |
| bld_kit_qing_north_yamen | 衙署 | 17×13 | 1039×696 |
| bld_kit_qing_north_biaoju | 镖局货栈 | 15×12 | 912×608 |
| bld_kit_qing_north_casino | 赌场 | 10×8 | 621×466 |
| bld_kit_qing_north_manor | 大院 | 16×13 | 1060×799 |
| bld_kit_qing_north_wangfu | 王府 | 22×18 | 1489×1016 |
| bld_kit_qing_north_temple_hall | 寺观殿堂 | 14×11 | 957×777 |
| bld_kit_qing_north_pagoda | 楼阁式砖塔 | 7×7 | 603×856 |
| bld_kit_qing_north_guardhouse | 城门守舍 | 7×5 | 526×424 |
| bld_kit_qing_north_stable | 马厩 | 9×7 | 668×454 |
| bld_kit_qing_north_warehouse | 仓屋 | 10×8 | 662×497 |
| bld_kit_qing_north_wharf | 河埠 | 10×4 | 485×318 |
| tex_town_qing_north_city_gate__k4_r000_v01 | city_gate | 8×4 | 423×377 |
| tex_town_qing_north_city_gate__k6_r000_v01 | city_gate | 10×4 | 532×567 |
| tex_town_qing_north_wall__brick_r000_v01 | wall | 1×1 | 73×132 |
| tex_town_qing_north_wall_corner__outer_ne_v01 | wall_corner | 2×2 | 143×134 |
| tex_town_qing_north_bridge_deck__w4_l6_r090_v01 | bridge_deck | 4×6 | 354×386 |
| tex_town_qing_north_tree_cluster__scholar_tree_v01 | tree_cluster国槐 | 1×1根部 | 335×170 |
| tex_town_qing_north_tree_cluster__chinese_pine_v01 | tree_cluster油松 | 1×1根部 | 246×178 |

来源清单（2026-09-30；历史图均已下载到集外临时目录并用`view_image`查看，但本轮没有可用`image_gen`，故只作成品后验形制复核，绝不冒充原始生成输入；逐件URL/用途见manifest）：

- [北京市合院式历史建筑修缮技术导则](https://www.beijing.gov.cn/zhengce/gfxwj/202405/W020240510514910875219.pdf)：青砖青瓦、木构与院落；本轮PDF可达，现代修缮资料不证明清初全部细节。
- [略论清代北京四合院建筑发展演变](https://wwj.beijing.gov.cn/bjww/resource/cms/article/362762/515604/2018071114320631049.pdf)：普通早中清院落不普遍豪华垂花门；PDF本轮可达，具体细部仍（待考）。
- [沈阳故宫各宫殿用途和特色](https://www.sypm.org.cn/xinwen_2/4.html)：硬山、等级琉璃和木隔扇；[济南历史建筑图则](http://nrp.jinan.gov.cn/attach/upfiles/lsjztz02.pdf)仅用检索摘要，原站504，细部（待核实）。
- 历史图：[北京胡同院落](https://commons.wikimedia.org/wiki/File:Peking_Hutong_courtyard.JPG)、[恭王府院落](https://commons.wikimedia.org/wiki/File:GongWangFu_courtyard_(2917122776).jpg)、[沈阳故宫](https://commons.wikimedia.org/wiki/File:Imperial_Palaces_of_the_Ming_and_Qing_Dynasties_24351-Shenyang_(49052461177).jpg)、[颐和园佛寺](https://commons.wikimedia.org/wiki/File:Summer_Palace_Buddhist_Temple_on_Longevity_Hill_(9864605806).jpg)：复核院落、等级、殿堂、灰瓦/彩画边界。
- 历史图：[慈寿寺塔](https://commons.wikimedia.org/wiki/File:Cishou_Temple_Pagoda.JPG)、[Thomas Child前门](https://commons.wikimedia.org/wiki/File:Thomas_Child_-_Gate_tower_of_Qianmen_and_city_walls,_Peking_NA01-65.jpg)、[万宁桥](https://commons.wikimedia.org/wiki/File:Wanning_Bridge_from_the_northwest_(20211008150357).jpg)：复核砖塔、城台木楼、石拱栏板；塔成品为不同塔式的原创意象。
- 历史图：[珠宝街](https://commons.wikimedia.org/wiki/File:Bead_Street,_Peking,_1930_(6766548719).jpg)、[十九世纪北京商铺](http://world.people.com.cn/n1/2020/0413/c1002-31671379.html)、[平遥县衙](https://commons.wikimedia.org/wiki/File:Pingyao_Yamen_Main_Courtyard.jpg)、[源顺镖局](https://bjwb-app.bjd.com.cn/content/s685cdd27e4b0aabe0a02d473.html)：复核街面、官署和复合院功能；晚清/民国或异地资料只作辅助。
- [天津石家大院门道](https://commons.wikimedia.org/wiki/File:Shiyuan_tianjin_doorways.jpg)辅助大院/附属空间；[平津闸与通惠河码头遗址](https://peking.bjd.com.cn/content/s6a86b562e4b03fa51a8328b4.html)仅供河埠文字语境，相关图像未完成匹配（待核实）。
- 历史图：[油松](https://commons.wikimedia.org/wiki/File:Pinus_tabuliformis_Badaling.jpg)、[国槐](https://commons.wikimedia.org/wiki/File:Sophora_japonica_JPG2Aa.jpg)及[北京主要乡土树种名录](https://yllhj.beijing.gov.cn/zwgk/2024nzcwj/2024nqtwj/202406/P020240625641264006842.pdf)：复核冠形、枝叶与地域适宜性；不证明清代具体树位。

✅ `python3 tools/agents/check_assets.py assets/default/building-map/qing_north --min 18 --max 22 --min-side 256`：19张、0问题；贴片同命令替换目录并用`--min 5 --max 10 --min-side 32`：7张、0问题。`python3 tools/lint/check_ids.py --strict`：退出0、新失败0；保留仓库已知`sk_babuganchan`基线缺失1，不越权修改。
✅ 生成阶段记录的候选均有逐图取舍；本次续作又用view_image复核26张成品与5张宋基线，RGBA/哈希/尺寸核对通过，19张建筑由本地选中源只读重放后哈希全一致。模板保留清北章节，宋基线、tools/town及规划文档未改；未执行git写命令，每次补丁≤50行。
⚠️ 画风一致性自评：灰瓦、砖石、木窗及细节密度与宋基线相容，官式件色彩更强、门楼红木较鲜；不自动批准。当前verify为8/19几何告警，k4门占地仍未过；历史图已后验核查，但“每类1–3图在生成时作为image_gen输入”未完成，因为本轮无`image_gen`能力。
✅ 成品SHA256前16位：镖局`63b07a057df1f724`，赌场`718b5323c3fb82f7`，k4门`6448333c5d003935`；完整SHA、原始生成输入及提示词见manifest。新增`historical_references`明确标为`post_generation_form_review_only`。
地域替换对应表：民居→大小灰砖宅；院落→胡同合院；镖局→匿名护运货栈；宗教地标→汉地砖塔；王府/宫殿槽→王府（未交皇宫）；城门→灰砖跨孔门楼；本地植物→国槐/油松。其余功能沿用同名项，不涉及西域/吐蕃/蒙古替换。
需作者确认：本轮审核无新增事项；首轮灰砖旧化、两座门楼红木饱和度、19类建议占地与六层塔意象仍默认沿用candidate。未解决几何已列§4；真实城镇拼接、运行时高度/碰撞和年代细部仍未完成验证，不列为通过。
