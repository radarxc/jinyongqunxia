# KIT-qing_south 报告 · 建筑套件 · 清 · 江南套件

## 1. 摘要（3–6 行）

- 第12次续作确认第11次退出码101源于宿主磁盘写满（`No space left on device`），不是资产内容失败；本轮不重写26张合格成品。总量仍19建筑、7贴片，全部 `candidate`。
- 环境未提供 `image_gen`，故以第3轮选定RGBA源图作确定性PIL局部修边：RGB与外轮廓逐像素不变，只扩大透明通行孔；随后沿用裁切、等比缩放、透明留边流程。
- k4实测外宽550px、孔宽275px，净宽=`8×275/550=4.000`格；进深3.956格，两门墩1.978/2.022格，均在±5源px取点误差内通过。
- 第12次续作复跑三项指定检查全部退出0；并复看26张最终PNG的尺寸、RGBA透明通道与画风，形制、来源、提示模板及素材均未改。

## 2. 产出（文件、行数、主要章节）

| 文件 / 目录 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `assets/default/building-map/qing_south/manifest.yaml` | 822行 / 19条 | 仅更新7项；domestic 351行、civic 306行同步；其余12项登记文本不变 |
| `assets/default/tile/qing_south/manifest.yaml` | 359行 / 7条 | 第4轮只更新k4的最终SHA、修边说明及几何实测；尺寸448×480、锚点[225.92,359.9709]复算不变 |
| 两目录PNG、meta及 `review3/` / `review4/` | 26张最终PNG；本轮零替换 | 前轮复核记录保留；第12次只读复查全部最终PNG，不改图片、meta或审核记录 |
| `assets/default/prompts/building-map.md` / `tile.md` | 373 / 189行 | 前轮§11 / §10保留，本次续作字节不变；实际返修提示逐图登记 |
| `building-map/qing_south/preview.html` | 48行 | [26件深浅底审图总览](../../../assets/default/building-map/qing_south/preview.html) |
| `tile/qing_south/review4/gate_k4_measurement.json` | 61行 | k4孔脚、尺寸、SHA、锚点、裁框、缩放与严格契约结果；旧 `review3` 记录保留作前后对照 |

## 3. 关键结论与数值

- 19类占地见提示模板§11.2：清初已有骨架优先，其余同构宋南/明表 **【建议值】**；不新增玩法ID。王府模块覆盖“王府/宫殿”项，不另交宫殿。
- 每格64×32，目标地面范围=`32(w+h)×16(w+h)`；7×6民居=416×208，22×18王府=1280×640 px。画布含高度与透明留边，不等于占地。
- 建筑缩放 `s=32(w+h)/(Rx−Lx)`；城门按正面外宽 `s=32W/(Fx−Lx)`。源锚点 `(L+R)/2` 经同一裁框/缩放/偏移映射。门净宽=`W×孔脚横差/外宽横差`：k4=`8×275/550=4.000`、深=`8×272/550=3.956`；k6=`10×408/684=5.965`、深=`10×272/684=3.977`格。

## 4. 开放问题（附默认值）

- 已解决：本轮点名的k4净宽硬契约；4.000×3.956格且门墩约1.978/2.022格，在±5源px内通过。此前建筑审图仍记录大民居前轴+0.5387、院落右轴−0.5585、衙署右轴−0.5617，均不属于本轮审核点名项；默认保留candidate，见meta与review3测量。
- 年代、装饰、四层原创佛塔、柳桂尺度及福州细分形制：默认采用本批苏杭为主的匿名组合；具体构件断代、器物与小说逐字考据仍（待考），作者未审不升approved。
- 朝向/碰撞/遮挡/河埠接岸：默认只用原向PNG；不旋转图像冒充四向，院内通行、门孔、墙高接缝与真机装配（待实测）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增：本任务仅扩充素材，不改设计事实、玩法数值、城市或全局内容ID。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/22` §3.4 / §4.3：后续登记清江南19类同构映射、贴片7变体及建议占地；k4/k6门均通过净宽与进深测点复核，仍勿按具名历史复原接入。
- `design/town/schema.yaml` 素材接口与 `tech/07` 素材登记：明确building.anchor像素单位、单视图能力、目标孔掩膜与实测图像的区别。
- TOWN总装任务 / 贴图加载：按底面中心减锚点放置，统一比例缩放PNG和anchor；不得按整幅PNG宽二次标定。门墙接缝、旋转、碰撞、屋顶淡出后续验证，本任务未改 `tools/town/`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 第12次复跑 `python3 tools/agents/check_assets.py assets/default/building-map/qing_south --min 18 --max 22 --min-side 256`：19条、0问题、退出0。
- ✅ 第12次复跑 `python3 tools/agents/check_assets.py assets/default/tile/qing_south --min 5 --max 10 --min-side 32`：7条、0问题、退出0；`python3 tools/lint/check_ids.py --strict`：strict failure=0，仅既有baseline未定义项。
- ✅ 第12次以三张成品总览 `view_image` 复看全部26张最终PNG，并逐文件核验PIL：均为RGBA、alpha范围0–255，无裁断、文字/人物/现代物；k4仍为448×480、SHA `2004f2d5…61b9`。
- ✅ 返修范围严格限定于k4：原始RGB像素差异为空，alpha差异外接框为源图 `(220,610)–(566,1076)`，其余25张最终PNG与两份提示模板逐字节不动；每次补丁≤50行，报告≤100行，无改变git状态的命令。
- ✅ k4严格门契约通过：外正面550px、孔宽275px，向量投影3.997格；深3.956格，两门墩1.978/2.022格，均在±5px内。写实灰瓦、青砖、红褐木构、左上光与宋套件/其余清江南素材保持一致。
- ⚠️ 仍为 `candidate`：运行时碰撞、四向旋转、墙门接缝需总装实测；本轮不处理审核已通过的建筑，沿用其既有review3记录。

**清单（占地为规划格；尺寸为最终PNG像素）**

| ID | 类型 | 占地 | 尺寸 |
|---|---|---:|---:|
| `bld_kit_qing_south_house_small` | 小民居 | 6×5 | 512×512 |
| `bld_kit_qing_south_house_large` | 大民居 | 7×6 | 512×544 |
| `bld_kit_qing_south_courtyard` | 院落 | 10×8 | 672×512 |
| `bld_kit_qing_south_shop_1f` | 单层商铺 | 7×5 | 576×576 |
| `bld_kit_qing_south_shop_2f` | 两层商铺 | 8×6 | 672×672 |
| `bld_kit_qing_south_inn` | 客栈 | 12×9 | 960×736 |
| `bld_kit_qing_south_restaurant` | 酒楼茶肆 | 12×9 | 928×576 |
| `bld_kit_qing_south_market_stall` | 市场棚 | 3×2 | 512×512 |
| `bld_kit_qing_south_yamen` | 衙署 | 17×13 | 1120×768 |
| `bld_kit_qing_south_biaoju` | 镖局货栈 | 15×12 | 1088×832 |
| `bld_kit_qing_south_casino` | 赌场 | 10×8 | 800×576 |
| `bld_kit_qing_south_manor` | 山庄大院 | 16×13 | 1248×928 |
| `bld_kit_qing_south_wangfu` | 王府模块 | 22×18 | 1632×1216 |
| `bld_kit_qing_south_temple_hall` | 寺观殿堂 | 14×11 | 1024×736 |
| `bld_kit_qing_south_pagoda` | 佛塔 | 7×7 | 928×800 |
| `bld_kit_qing_south_guardhouse` | 城门守舍 | 7×5 | 576×512 |
| `bld_kit_qing_south_stable` | 马厩 | 9×7 | 640×448 |
| `bld_kit_qing_south_warehouse` | 仓屋 | 10×8 | 864×672 |
| `bld_kit_qing_south_wharf` | 河埠 | 10×4 | 736×512 |
| `tex_town_qing_south_bridge__stone_w3_l6_r000_v01` | 石桥 | 3×6 | 325×217 |
| `tex_town_qing_south_city_gate__k4_r000_v01` | 城门·净宽4（测点误差内） | 8×4 | 448×480 |
| `tex_town_qing_south_city_gate__k6_r000_v01` | 城门·目标净宽6（测点误差内） | 10×4 | 516×511 |
| `tex_town_qing_south_shrub__osmanthus_v01` | 桂花灌木 | 2×2 | 128×95 |
| `tex_town_qing_south_tree_cluster__willow_v01` | 柳树 | 2×2 | 240×167 |
| `tex_town_qing_south_wall__brick_r000_v01` | 城墙直段 | 4×1 | 231×163 |
| `tex_town_qing_south_wall_corner__outer_ne_v01` | 城墙转角 | 2×2 | 169×166 |

**地域替换对应表与作者确认**：下列默认沿用；本轮无新增作者决策，全部保持candidate。k4硬契约已修复，无需以作者审美确认替代。

| 通用功能 | 江南对应 / 默认值 |
|---|---|
| 塔/宗教地标；王府/宫殿 | 砖木楼阁佛塔（非六和塔复原）；王府院落模块 |
| 桥与本地植物；镖局/河埠 | 单孔石桥、柳树、桂花灌木；匿名护运货栈、装饰河埠，不新增营生或旅行入口 |

**来源清单（访问日期均2026-09-30）**：网页只作文字考据；生成输入为仓内风格图、几何guide或候选图，以逐图references为准。续作逐项重搜；标“检索正文”的页面本次直开超时、521或DNS失败，但搜索结果仍返回标题、URL与相关正文。无新增版本号、API、价格、限额或浏览器支持主张；工具底层模型/seed/effort未披露。

- [故宫《苏式彩画》](https://www.dpm.org.cn/lemmas/241406.html)：取江南苏画与宫廷官式苏画的区分、花鸟题材；直开200。
- [苏州园林局《网师园》](https://ylj.suzhou.gov.cn/szsylj/sjyc/201905/8aaf3adcfdaf485dada9a071aac3867f.shtml)：取乾隆时期宅园、门厅穿廊与砖雕门楼母题；直开200，不照搬尺寸。
- [福州鼓楼区《我们的三坊七巷（34）》](https://www.gl.gov.cn/xjwz/rw/mdgl/gjms/202502/t20250210_4973489.htm)：取灰瓦白墙、马鞍墙地域区别及防火围院用途；已打开。
- [杭州文旅《Pagoda of Six Harmonies》](https://wgly.hangzhou.gov.cn/art/2013/7/7/art_1229495371_58931730.html)：取砖木楼阁塔类型；检索正文，不复制现有外檐层数或重修外观。
- [江苏方志《漕运时代的淮盐与运河》](https://jssdfz.jiangsu.gov.cn/n95/20240329/i32931.html)：取扬州盐商住宅、水运仓栈的生活背景；检索正文，不据此断代每个构件。
- [苏州方志《漫话苏州古城墙的变迁》](https://dfzb.suzhou.gov.cn/dfzb/fzxh/201010/dac10c8400b347af8cad9ae1f9985489.shtml)：取青砖石基、拱券与累积修缮背景；检索正文，排除现代门楼重建为清初证据。
- [苏州方志《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)：取水陆门与石拱地域背景；不声称本批门楼为盘门复原。
- [苏州方志《木渎古镇的桥》](https://dfzb.suzhou.gov.cn/dfzb/fzxh/201009/cee41a477c3040f99780877eaf61c72d.shtml)：取乾隆图景与桥街组合的地域依据；检索正文，生成匿名石桥。
- [杭州政协《杭州古代的花木文化》](https://www.hzzx.gov.cn/hzzx/content/2010-10/26/content_5140376.htm)：取杭州垂柳、桂花地域母题；直开200，具体树位/品种/修剪为原创且待考。
