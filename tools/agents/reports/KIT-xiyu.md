# KIT-xiyu 报告 · 建筑套件 · 西域套件

## 1. 摘要（3–6 行）

- 第2轮仅重出审核点名16张建筑、6张贴片；25+10=35次有效生成，每项本轮最多2候选，逐张image_gen与view_image。
- 总量仍为19张建筑、7张贴片，均为candidate；未返修的3张建筑、胡杨及全部宋基线不改，历史源图/记录保留原字节。
- 三条必跑检查全部退出0；26张真RGBA、alpha含0/255，纯几何后处理与哈希通过；19组建筑manifest/meta一致。
- 返修未全部通过：点名22件中19件进入原几何容差；大民居、棋戏院、茶肆仍轴向超差，未以candidate或文件检查冒充几何通过。第6次续作无可调用`image_gen`，嵌套CLI亦被沙箱拒绝，未伪造第3轮产图。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/xiyu/`：19张成品PNG；`manifest.yaml` 886行；19份`meta/*.yaml`共1528行；`QA.md` 65行；[preview.html](../../../assets/default/building-map/xiyu/preview.html) 43行，仅局部同步点名条目的尺寸/锚点/告警。
- `assets/default/tile/xiyu/`：7张成品PNG；`manifest.yaml` 246行；`QA.md` 61行；`geometry-qa.jsonl`7行明确保留为首轮历史，当前六项量点见`source/round2/*-selected-qa.json`。PNG行数不适用。
- 提示词`building-map.md` 369行、`tile.md` 161行，含西域地域差异、尺度与几何返修边界；实发提示词在两包`round2/`子目录。`sources/round3/`仅有3项待返修灰盒/提示词，无候选图或成功调用记录；不得视作已执行。

## 3. 关键结论与数值

- 地面尺度64×32；包络=32(w+h)×16(w+h)。7×6民居为416×208，24×20宫殿为1408×704；不是PNG画布尺寸。锚点=(源底面L+R)/2，随裁框、等比缩放与扩边变换。
- 城门净宽k=4/6，总占地(k+4)×4=8×4/10×4，两墩各2格；本轮前孔实测4.035/6.067格。六贴片最大轴偏差0.02043、最大比例误差0.377%；墙/角名义高3m，目标3×32√(3/2)=117.576px，实测117.835/118.170px，差0.335px。

## 4. 开放问题（附默认值）

- 几何已解决部分：大民居比例60.58%→3.60%，单层店前轴0.296→0.5017，两门比例64.31%/63.23%→0.377%/0%。仍未解决：大民居右轴−0.42574、棋戏院前轴+0.53431、茶肆右轴−0.55390，超±0.5的±0.03容差；第2轮各已用满2候选，第3轮仅备稿未生成，默认保留真实失败记录。
- 年代与地域：默认通用绿洲意象（原创扩展），具名年份细部（待考）；大小宅分型中的大宅10×8为【建议值】，沿院落包络。礼拜殿S为素材局部入口，非礼拜地理朝向。
- 装配与作者确认：默认仅原向单视图，桥含栏只作整桥预览；四向/GLB、门孔掩膜、墙缝、屋顶遮挡、植被落位和真机（待实测），未经作者审批不改approved。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准提案；只新增素材族，不改玩法、小说事实、全局城市或营生ID。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么（本轮未改） |
|---|---|---|
| `docs/design/22-town-layout-and-generation.md` / town目录与schema | §3–§4、套件索引 | 接入xiyu及19类地域映射、大宅建议占地；三建筑轴向返修未完成，门孔前缘已量但完整掩膜/总装仍未交付。 |
| `design/22` §7.4 / TOWN-render / TOWN-assemble | 光向、加载与总装 | 用户要求左上光右下短影优先于旧右上影；格宽变化用q=tile_width/64同缩PNG与anchor，禁按画布整宽二次标定；补墙门掩膜/桥栏遮挡和四向。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ `python3 tools/agents/check_assets.py assets/default/building-map/xiyu --min 18 --max 22 --min-side 256`：19图、0问题。
- ✅ `python3 tools/agents/check_assets.py assets/default/tile/xiyu --min 5 --max 10 --min-side 32`：7图、0问题；`python3 tools/lint/check_ids.py --strict`：退出0、strict新增问题0，既有白名单未定义项未修改。
- ✅ 本次逐张`view_image`复看26张成品，并复看3项告警的6张未选候选；建筑19项规格化可逆重建通过，manifest与19份meta逐对象相等。`git status`确认仅授权路径有改动，未执行改变仓库状态的git命令。
- ⚠️ 本轮建筑16/19在双轴±0.03及比例10%内，全部19件比例通过；六贴片轴/比例全部通过。仍有3建筑轴告警（第4节），故本次整体规格验收仍未完成。新参考图只约束生成，测量独立读取成图，不通过非等比拉伸消除残差。

| ID | 类型 | 占地格 | 尺寸px |
|---|---|---|---|
| `bld_kit_xiyu_house_small` | 小民居 | 7×6 | 640x416 |
| `bld_kit_xiyu_house_large` | 大民居 | 10×8 | 800x544 |
| `bld_kit_xiyu_courtyard` | 院落 | 10×8 | 768x544 |
| `bld_kit_xiyu_shop_1f` | 单层商铺 | 7×5 | 608x416 |
| `bld_kit_xiyu_shop_2f` | 两层商铺 | 8×6 | 672x544 |
| `bld_kit_xiyu_inn` | 客栈 | 12×9 | 896x640 |
| `bld_kit_xiyu_restaurant` | 茶肆 | 12×9 | 864x608 |
| `bld_kit_xiyu_market` | 巴扎棚 | 5×4 | 480x320 |
| `bld_kit_xiyu_yamen` | 官署 | 16×12 | 1152x800 |
| `bld_kit_xiyu_biaoju` | 护运货栈 | 14×11 | 992x704 |
| `bld_kit_xiyu_casino` | 世俗棋戏院 | 10×8 | 768x544 |
| `bld_kit_xiyu_manor` | 大院 | 16×13 | 1216x832 |
| `bld_kit_xiyu_palace` | 宫殿模块 | 24×20 | 1792x1216 |
| `bld_kit_xiyu_temple_hall` | 清真寺礼拜殿 | 14×11 | 1088x736 |
| `bld_kit_xiyu_pagoda` | 邦克楼 | 7×7 | 992x736 |
| `bld_kit_xiyu_guardhouse` | 守舍 | 7×5 | 512x352 |
| `bld_kit_xiyu_stable` | 马厩 | 9×7 | 640x448 |
| `bld_kit_xiyu_warehouse` | 仓屋 | 10×8 | 800x544 |
| `bld_kit_xiyu_wharf` | 渠岸作业台 | 10×4 | 640x576 |
| `tex_town_xiyu_city_gate__k4_r000_v01` | city_gate | 8×4 | 402x331 |
| `tex_town_xiyu_city_gate__k6_r000_v01` | city_gate | 10×4 | 465x346 |
| `tex_town_xiyu_wall__earth_r000_v01` | wall | 1×1 | 81x167 |
| `tex_town_xiyu_wall_corner__outer_ne_v01` | wall_corner | 2×2 | 145x183 |
| `tex_town_xiyu_bridge_deck__w3_l5_r000_v01` | bridge_deck | 3×5 | 273x182 |
| `tex_town_xiyu_tree_cluster__huyang_v01` | tree_cluster | 3×3 | 208x201 |
| `tex_town_xiyu_grape_arbor__w4_l3_r000_v01` | grape_arbor | 4×3 | 252x204 |

**来源清单（首轮访问、本次续作复核均为2026-09-30；未新增形制断言，保留适用边界）**

- [中国非遗网：维吾尔族民居建筑技艺（阿依旺赛来民居营造技艺）](https://www.ihchina.cn/art/detail/id/14735.html)：敞开庭院、方形抬高采光体、侧窗木雕与几何纹。
- [喀什大学建筑学院：走进高台民居](https://jzy.ksu.edu.cn/info/1421/1871.htm)：黄粘土、木与芦苇材料；[新疆自然资源厅：莎车古勒巴格村规划经验](https://zrzyt.xinjiang.gov.cn/xjgtzy/c112467/202303/720d143cd67c489498bc45fbbaea9816.shtml)：平顶、葡萄廊架。
- [喀什公署：艾提尕尔清真寺简介](https://www.kashi.gov.cn/ksdqxzgs/c106707/202307/28cd99dc43a244619788bda878887922.shtml)：礼拜殿/长廊/召唤阁楼区别，1442始建不作宋元复原证明；[《华夏》城记](https://www.gdql.org.cn/attachment/0/9/9917/1082996.pdf)：黄砖/邦克楼补充图文，细部年代待考。
- [新华社：新疆喀什老城改造纪实](https://www.xinhuanet.com/politics/2015-09/26/c_1116687056.htm)：巴扎业态；[新疆政府：汗诺依古城考古成果](https://www.xinjiang.gov.cn/xinjiang/dzdt/202201/4a664aaf2f094721adfe8fbd67338eaf.shtml)：10世纪泥土城墙与南北门，只取材料母题。
- [新疆政府：金秋到新疆看胡杨](https://www.xinjiang.gov.cn/xinjiang/hbddc/201910/30c83b8a7ca6470e887590f33a1414b0.shtml)：塔里木盆地、塔里木河两岸胡杨分布；[新疆自然资源厅：“一家亲”结亲周](https://zrzyt.xinjiang.gov.cn/xjgtzy/tpxw/201805/9211044b71cd456689ee0fb8345a76de.shtml)：庭院葡萄木架。
- [新疆自然资源厅：带着亲戚逛“新城”](https://zrzyt.xinjiang.gov.cn/xjgtzy/hdxx/201711/3a1d61baaf3c44a69e154dddfd3dc41f.shtml)：土木/砖木；[新疆政府：小葡萄串起甜蜜产业链](https://www.xinjiang.gov.cn/xinjiang/dzdt/202308/0e95c6259b504bbfaffc814a18b5e760.shtml)：排除现代水泥葡萄柱。
- ✅/⚠️ 2026-09-30联网检索已重新命中中国非遗网、喀什公署、新疆政府/自然资源厅、新华社官方页面及正文摘要；直接抓取部分页面超时，喀什大学页未能重新打开，故只沿用其已登记材料结论，不据未打开正文扩写。图像工具未公开底层模型、effort、版本或价格。

画风自评：重出后仍与宋包同属写实古风，木纹/土砖颗粒、细节密度、左上受光基本一致；暖土色、平顶与穹顶为地域替换。两门改为直墩木楣平顶，属原创构型；3建筑相机残差仍影响严格混拼，不宣称完全一致。

| 原槽位 | 西域对应（其余类型功能不变、换地域构造） |
|---|---|
| 酒楼；镖局 | 茶肆；商队护运货栈 |
| 赌场；山庄 | 独立世俗棋戏院（原创扩展、非宗教经营）；葡萄架大院 |
| 王府/宫殿；寺观 | 匿名西域宫殿模块；清真寺礼拜殿（非具名古迹复原） |
| 塔/宗教地标；河埠 | 邦克楼；渠岸取水/卸货台（无航线） |
| 城门/墙/桥；植物 | 土城门/土墙/灌渠木桥；胡杨与葡萄架 |

需作者确认事项默认沿用第4节；本轮审核无新增作者决策要求。地域美术/年代细部/大小宅分型继续candidate；三项几何失败属于执行缺口，不转成作者审批问题。
