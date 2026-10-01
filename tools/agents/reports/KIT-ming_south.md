# KIT-ming_south 报告 · 建筑套件 · 明 · 江南套件

## 1. 摘要（3–6 行）

已入库19张建筑、7张贴片候选；本轮只返修审核点名的13张建筑、2座城门与1个墙角，其余10张PNG哈希不变。
13张建筑最终底面双轴均为+0.500/−0.500，水平分量比等于登记footprint；锚点按底面对角点中点复算。
城门前沿按2:k:2格收口，净孔实测4.000/6.000格；三格L形墙角接口高度收口为124px，与直墙一致。
26张均保持真RGBA与`candidate`；三项强制检查全部退出0，整城碰撞、遮挡与接缝仍待总装实测。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/ming_south/`：19张成品；仅13张点名PNG及对应manifest条目更新；`revisions_r4/rebuild.py`为可复现纯几何脚本，`verification.json`记录测点、目标点、斜率、比例、锚点、尺寸和SHA。
- `assets/default/tile/ming_south/`：7张成品；仅两门与墙角及其manifest/geometry/README登记更新；其余直墙、桥、柳、竹未动。
- `revisions_r4/preservation_start.json`与`untouched-sha256.json`：开工/收尾三方复核10张未点名成品哈希；两份提示词仅同步第4轮几何结论。
- 本报告共7节，不超过100行。

## 3. 关键结论与数值

每格地面向量为(32,16)/(32,−16)：底面包络宽=`32(w+h)`、高=`16(w+h)`。例如7×6小民居为416×208，16×13衙门为928×464。
13张建筑使用分段横向缩放+逐列纵移：实测L/F/R映射为`(0,0)→(32w,16w)→(32(w+h),16(w−h))`；竖直向量始终为(0,1)，未产生倾柱。
城门前轴分别为256/320px，深轴128px；k4分段64+128+64px，k6分段64+192+64px，故门孔=`128/32=4`格、`192/32=6`格。
墙角保留三格L形结构，外轴水平分量64+64px、斜率±0.5；内角可见竖向接口124px，与直墙(44→168)一致。
全部26图为RGBA、alpha极值0–255、透明边存在；manifest尺寸/SHA与实物一致。

## 4. 开放问题（附默认值）

- MS-01 已解决：16项严格几何返修完成，像素坐标证据见`revisions_r4/verification.json`；默认继续保持`candidate`，不越权改为`approved`。
- MS-02 已解决：合入前审核已通过画风、地域与细节密度；默认沿用低饱和粉墙黛瓦、棕木及左上光。
- MS-03 地域细部：默认匿名原创组合；五层八角佛塔不命名为报恩寺塔。镖局称谓及明代柳竹具体种属/栽植点位仍（待考）。
- MS-04 使用范围：默认单视图静态预览；桥未拆遮挡层、植物未交双变体、全套无四向/碰撞多边形，均待总装联调。无需作者确认。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案；只修素材几何与登记，不修改基准、玩法或宋套件。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 建议同步 |
|---|---|---|
| `docs/design/22-town-layout-and-generation.md` | §3.4 / §4.3 | 后续登记19个地域type、建议占地、7贴片与单视图限制；总装通过后再冻结 |
| 同上 | §7.4 | 同步左上光、右下影口径，消除旧光向差异 |
| 后续城镇总装 / CitySpec | 素材导入 | 消费manifest锚点与原生尺寸；不要按PNG画布宽度二次缩放 |
未修改上述文件或`tools/town/`。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 清单（ID / 类型 / 占地 / 尺寸）：

| ID | 类型 | 占地 | 尺寸px |
|---|---|---|---|
| `bld_kit_ming_south_house_small` | 小民居 | 7×6 | 501×468 |
| `bld_kit_ming_south_house_large` | 大民居 | 10×8 | 651×540 |
| `bld_kit_ming_south_courtyard` | 天井院落 | 10×8 | 626×507 |
| `bld_kit_ming_south_shop_1f` | 单层商铺 | 7×5 | 453×367 |
| `bld_kit_ming_south_shop_2f` | 两层商铺/当铺意象 | 7×5 | 448×432 |
| `bld_kit_ming_south_inn` | 客栈 | 12×9 | 736×544 |
| `bld_kit_ming_south_restaurant` | 酒楼茶肆 | 12×9 | 738×667 |
| `bld_kit_ming_south_market_stall` | 市场棚 | 3×2 | 256×272 |
| `bld_kit_ming_south_yamen` | 衙门 | 16×13 | 981×611 |
| `bld_kit_ming_south_biaoju` | 护运货栈 | 15×12 | 922×598 |
| `bld_kit_ming_south_casino` | 赌场 | 10×8 | 624×579 |
| `bld_kit_ming_south_manor` | 山庄大院 | 16×13 | 974×603 |
| `bld_kit_ming_south_wangfu` | 王府主殿 | 22×18 | 1322×990 |
| `bld_kit_ming_south_temple_hall` | 寺观殿堂 | 14×11 | 847×625 |
| `bld_kit_ming_south_pagoda` | 佛塔 | 7×7 | 490×1103 |
| `bld_kit_ming_south_guardhouse` | 城门守舍 | 7×5 | 431×324 |
| `bld_kit_ming_south_stable` | 马厩 | 9×7 | 556×449 |
| `bld_kit_ming_south_warehouse` | 仓屋 | 10×8 | 692×521 |
| `bld_kit_ming_south_wharf` | 河埠 | 10×4 | 563×417 |
| `tex_town_ming_south_city_gate__k4_r000_v01` | 城门 | 8×4，孔4×4 | 457×488 |
| `tex_town_ming_south_city_gate__k6_r000_v01` | 城门 | 10×4，孔6×4 | 538×477 |
| `tex_town_ming_south_wall__brick_r000_v01` | 直墙 | 1×1 | 73×173 |
| `tex_town_ming_south_wall_corner__outer_ne_v01` | 三格L形墙角 | 2×2 | 172×232 |
| `tex_town_ming_south_bridge__stone_w5_l10_r000_v01` | 桥 | 5×10 | 489×230 |
| `tex_town_ming_south_tree_cluster__willow_v01` | 柳 | 3×3 | 200×154 |
| `tex_town_ming_south_tree_cluster__bamboo_v01` | 竹 | 2×2 | 136×171 |

- ✅ 来源清单（2026-09-30访问）：苏州市园林局《[建筑](https://ylj.suzhou.gov.cn/szsylj/ylys/201903/484421d38f504f5787a8f307925e3ad7.shtml)》取粉墙、灰黑瓦、栗色木构；《[木窗的匠心和工艺](https://ylj.suzhou.gov.cn/szsylj/ylys/202404/613a96d3071d489d82e3b0f303e41754.shtml)》取明及清早期直线窗格；南京城墙保护管理中心《[天下第一瓮城——南京城墙中华门](https://wlj.nanjing.gov.cn/ztzl/mcq/gzqk/202302/t20230228_3838766.html)》取明砖城台与门道；苏州市地方志《[木渎古镇的桥](https://dfzb.suzhou.gov.cn/dfzb/fzxh/201009/cee41a477c3040f99780877eaf61c72d.shtml)》取单孔花岗岩桥母题；故宫《[报恩寺塔](https://www.dpm.org.cn/lemmas/244848.html)》取八角、逐层收分与檐刹；国家文物局《[锦色Ⅱ](http://www.ncha.gov.cn/art/2023/11/28/art_723_185561.html)》取克制明式江南彩画母题。均未把网页图片作为模型输入。
- ✅ 画风一致性：逐张`view_image`检查26张；写实瓦木石、低饱和、左上光、粉墙黛瓦与宋套件一致，无文字、水印、现代物、人物或裁断；返修只改投影几何，不重绘内容。
- ✅ 地域替换：塔/宗教地标→五层八角佛塔；王府/宫殿→王府主殿模块；镖局/货栈→匿名护运院+仓屋；商帮会馆/当铺意象→院落、货栈/两层商铺；其余同功能直对应。
- ✅ 16项坐标复算均通过：13建筑双轴±0.500且footprint比零残差；k4/k6净孔4.000/6.000格；墙角124px接口等于直墙。锚点均在画布内。
- ✅ `check_assets.py`建筑：退出0，19张/19条/0问题；贴片：退出0，7张/7条/0问题；`check_ids.py --strict`：退出0，115文件、14,011定义、strict failure=0。
- ✅ 未点名10张成品哈希冻结不变；未改宋套件、提示词既有通过章节、`TODO.md`、docs或`tools/town/`；未运行改变仓库状态的git命令。
- ⚠️ 素材仍按任务要求为`candidate`；碰撞、遮挡、整城接缝、桥栏分层与植物变体仍待后续总装实测，不冒充运行时已验收。
