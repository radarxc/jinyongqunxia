# KIT-liao_jin_north 报告 · 建筑套件 · 辽 · 金北方套件

## 1. 摘要（3–6 行）

- **第8次续作完成**：现有19张建筑、7张贴片及两份套件提示词均齐备，manifest逐件为`candidate`；没有重做已合格图片。
- 复核历次候选后保留当前最佳成品：净宽6格城门与木桥采用repair4候选2；院落与净宽4格门没有更优旧候选，维持现状并登记几何残差。
- 6项建筑史与2项植物来源见§7；本轮重新联网复核核心建筑形制与榆树/油松分布来源，未新增API、版本、价格或限额事实。
- 三条指定命令均退出0；26张成品均为透明RGBA且清单/文件一一对应。精确2:1、门孔与接缝仍作为总装（待实测），不把脚本通过夸大为几何零误差。

## 2. 产出（文件、行数、主要章节）

| 文件 / 路径 | 数量 / 行数 | 内容 |
|---|---:|---|
| `assets/default/building-map/liao_jin_north/` | 19成品PNG；`manifest.yaml` 2911行 | 19类单体、逐件完整生成/规格化/QA记录；本轮逐张复查19件成品，未重写已合格图片 |
| `assets/default/tile/liao_jin_north/` | 7成品PNG；`manifest.yaml` 819行 | 2门、直墙、转角、桥、榆树、油松及逐件记录；本轮逐张复查7件成品，未改已选图片 |
| 建筑目录 `preview.html` / `audit.json` / `check-results.json` | 93 / 423 / 11行 | 26件浅/深底审图页；像素/几何审计；本轮另生成临时接触表逐图复核 |
| 建筑目录 `file-inventory.json`、辅助脚本、旧逐件JSON | 历史过程记录，本轮均未改 | audit/check-results/inventory及repair2/3/4检查记录保留；本轮最终校验以§7命令回执为准 |
| `assets/default/prompts/building-map.md` / `tile.md` | 357 / 167行 | 新增辽金北方§11 / §10：年代语汇、清单占地、差异提示词与candidate限制 |
| 本报告 | ≤100行 | 现入库清单、来源、地域替换、画风自评、开放项与三项校验结果 |

## 3. 关键结论与数值

- 地面标尺64×32：占地`w×h`的范围为`32(w+h)×16(w+h)`；7×6=416×208，20×16=1152×576。源图左右底角L/R，`s=32(w+h)/(Rx-Lx)`，源锚`(L+R)/2`，成品锚按裁框、同一s及padding变换；不以PNG宽代替占地宽。
- 建筑占地：大民居/市场棚/官署/货栈/王府借design/22 §3.4元骨架，其余借§3.2–§3.3宋同功能表，均为辽金套件 **【建议值】**；§3.4本身没有完整辽金表。
- k6选c2：L=(69,846)、F=(874,1238)、R=(1193,1081)，比805/319=2.52351，目标2.5误差0.94%；外轴+0.48696/−0.49216，净孔480/805=59.63%。s=448/1124，成品521×502、锚(267.501779,375.316726)，SHA256=`5ab656dfeed7969b0e51b209bd35dc19e2723aa21e4e80392615b76770dfe8dc`；局部门墩短前边约0.62，仍非严格共线。
- 桥选c2：L=(112,600)、F=(593,864)、R=(1433,394)、B=(965,158)；前边比481/840=0.57262，对边平均474.5/846.5=0.56054，目标0.6误差4.56%/6.58%；前轴+0.54886/−0.55952仍超±0.03。s=256/1321，成品324×213、锚(166.334595,104.369417)，SHA256=`d8ae5182fec833d865ffb2e72dde4419e5e0b85707c531cd78a1a134f69b0b1f`。院落c1/c2比1.110/1.501，误差11.2%/20.1%；k4c1比2.654、c2前脚裁断，均拒收。

## 4. 开放问题（附默认值）

- **已解决：k6外底比例/轴向；部分解决：木桥宽长比；保留限制：院落、k4与桥轴向残差**（见§3及repair4）。历次返修每件每轮均已满2候选，默认仍 `candidate`、单视图、不可旋转，严禁拉伸纠偏；repair2/3历史保留。严格2:1、门洞掩膜、接缝、四向门孔/高度契约继续开放，总装 **（待实测）**；无新增作者拍板事项。
- 辽南京/金中都/上京/大同的具体分期、宫殿等级、门窗和彩画：默认匿名原创组合；不可把晚辽天宁寺塔意象登记为1093年的实址。三联/广州修订版相关建筑描写未逐字核对，不编造引文。
- 植物默认榆树/油松意象，1×1只表示种植点，视觉高度320px为 **【建议值】**；历史栽植位置与生成植物形态辨识待考，树冠不得充当碰撞格。
- 桥与河埠默认装饰外观，无航线/港口玩法；桥栏一体只用于静态预览，前栏遮挡与岸面高差待联调。无名货栈代镖局，成熟组织称谓年代待考。
- 图像底层model/effort/seed工具未披露，保持undisclosed；本轮未新增API、浏览器、版本、价格或限额结论，不以编排模型名冒充图像模型。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准提案；不改玩法、年代时间线、公式或全局城市ID。本任务只交素材及制作建议值。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/22-town-layout-and-generation.md` §3.4 / §4.1：后续登记辽金类型及era；确认本报告借用占地，避免声称上游已冻结辽金全表。
- 同文§7.4：按作者本次指令统一左上主光、右下短影；当前正文“右侧略上”仍未修改。
- `tools/town/`加载/总装：消费实际底面锚和64×32尺度，检查candidate与单视图限制；补门孔掩膜、前栏分层、墙缝与旋转能力，禁止按画布宽二次缩放。上述文件均未改。
- `assets/default/baseline/town/preview/README.md`所述现状为代码占位预览；本轮读图确认，不能把它当已通过的正式素材总装证据。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 建筑检查：`python3 tools/agents/check_assets.py assets/default/building-map/liao_jin_north --min 18 --max 22 --min-side 256`，19张/19条/0问题；贴片同命令目录换为`assets/default/tile/liao_jin_north --min 5 --max 10 --min-side 32`，7张/7条/0问题。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出0、strict failure 0、新增未定义0；既有白名单`sk_babuganchan`仍1项。此脚本不扫描新素材命名空间，另核对26个素材ID唯一、字段/SHA/候选计数；生成前已搜索无重名。
- ✅ 历次4件repair4各2候选、8原图均有逐张`view_image`记录；本次逐张查看26件成品并抽查宋建筑/城门基线。26成品RGBA、尺寸/SHA/status与manifest匹配；既有规格化仅用透明裁切、等比缩放、修边/扩边，未旋转、拉伸或阈值化alpha；本轮无越界改动或改变仓库状态的git命令。
- ⚠️ candidate几何限制如实保留：院落与k4的repair4候选均不优于现成品；k6局部底边仍有残差；桥比改善但严格±0.03轴向未过。脚本通过不代表这些问题消失；透明区隐藏RGB不等于可见光晕，几何结论来自实际测点。

清单：建筑`type`同完整ID；贴片`kind`见类型列。占地为规划格，尺寸为实测px。

| ID后缀 | 类型 | 占地 | 尺寸 |
|---|---|---|---|
| `bld_kit_liao_jin_north_house_small` | 小民居 | 6×5 | 480×496 |
| `bld_kit_liao_jin_north_house_large` | 大民居 | 7×6 | 496×512 |
| `bld_kit_liao_jin_north_courtyard` | 院落 | 10×8 | 672×512 |
| `bld_kit_liao_jin_north_shop_1f` | 单层商铺 | 6×5 | 400×400 |
| `bld_kit_liao_jin_north_shop_2f` | 两层商铺 | 8×6 | 512×496 |
| `bld_kit_liao_jin_north_inn` | 客栈 | 12×9 | 752×560 |
| `bld_kit_liao_jin_north_restaurant` | 酒楼/茶肆 | 12×9 | 864×800 |
| `bld_kit_liao_jin_north_market_stall` | 市场棚 | 5×4 | 512×512 |
| `bld_kit_liao_jin_north_yamen` | 官署 | 16×12 | 1120×800 |
| `bld_kit_liao_jin_north_biaoju` | 护运货栈 | 14×11 | 1056×768 |
| `bld_kit_liao_jin_north_casino` | 赌场厅院 | 10×8 | 704×608 |
| `bld_kit_liao_jin_north_manor` | 山庄大院 | 16×13 | 1120×768 |
| `bld_kit_liao_jin_north_wangfu` | 王府模块 | 20×16 | 1312×960 |
| `bld_kit_liao_jin_north_temple_hall` | 佛寺殿堂 | 13×10 | 926×700 |
| `bld_kit_liao_jin_north_pagoda` | 密檐砖塔 | 7×7 | 706×1036 |
| `bld_kit_liao_jin_north_guardhouse` | 城门守舍 | 7×5 | 492×500 |
| `bld_kit_liao_jin_north_stable` | 马厩 | 9×7 | 625×459 |
| `bld_kit_liao_jin_north_warehouse` | 仓屋 | 10×8 | 691×538 |
| `bld_kit_liao_jin_north_wharf` | 河埠 | 10×4 | 611×357 |
| `tex_town_liao_jin_north_city_gate__k4_r000_v01` | 城门 | 8×4 | 418×380 |
| `tex_town_liao_jin_north_city_gate__k6_r000_v01` | 城门 | 10×4 | 521×502 |
| `tex_town_liao_jin_north_wall__earth_r000_v01` | 直墙 | 1×1 | 155×217 |
| `tex_town_liao_jin_north_wall_corner__outer_ne_v01` | 墙角 | 2×2 | 174×179 |
| `tex_town_liao_jin_north_bridge_deck__w3_l5_r000_v01` | 木桥含栏 | 3×5 | 324×213 |
| `tex_town_liao_jin_north_tree_cluster__elm_v01` | 榆树 | 1×1种植点 | 529×372 |
| `tex_town_liao_jin_north_tree_cluster__pine_v01` | 油松 | 1×1种植点 | 537×368 |

来源清单（2026-09-30访问；本次第8次续作重新联网核对核心检索结果。仅作形制文字依据，未把网页图片当生成输入；实际输入见manifest / repair4）：

- [北京市政府《天宁寺塔》](https://www.beijing.gov.cn/renwen/rwzyd/qxdw/gdshyqyxc/tnst/202309/t20230920_3263131.html)：取八角密檐实心砖塔语汇；不声称生成图精确复原十三层原塔。
- [北京市政府《北京金中都城墙考古成果发布》](https://www.beijing.gov.cn/renwen/sy/whkb/202101/t20210113_2218649.html)：取城墙/马面与后加包砖的分期区别，不用全砖城垣概括全部辽金城市。
- [北京市政府《金中都水关遗址》](https://www.beijing.gov.cn/renwen/rwzyd/qgzdwwbhdw/jzdsgyz/202211/t20221101_2849494.html)：取夯土城墙、水系与石质护岸背景；不据此证实本套木桥或河埠造型。
- [巴林左旗政府《辽上京城址的发现和研究述论》](http://www.blzq.gov.cn/zjzq/lswh/202002/t20200229_1915631.html)：取辽上京城址研究背景；夯土城垣及皇城/汉城格局另由同站遗址资料交叉核对，避免单一民族化模板。
- [中国社科院考古所《辽上京考古发现与辽上京规制》](http://kaogu.cssn.cn/xwzx/kgdt/202306/t20230629_5946749.shtml)：取排叉柱过梁式皇城门、三门道殿堂式宫城门与东向轴线；本套单门洞门楼不冒充遗址复原。
- [大同市政府《寻芳善化寺，收获超乎期待的惊喜》](https://www.dt.gov.cn/dtszf/bmdt/202409/0c0a47137e054ce4a7c8f3415e08966d.shtml)：取辽金殿堂台基、大斗栱与屋面等级；排除现代复建文殊阁，未照搬后世彩画。
- [Flora of China《Ulmus pumila》](http://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200006332)：取榆树分布含河北、山西、内蒙古及东北；只证明地域适生，不证明中古城内栽植。
- [辽宁省林草局《油松》](https://lyt.ln.gov.cn/lyt/ggfw/kjfw/szk/lzzwmsk/C9C31114C7C64756ADEB37D0A216A29A/index.shtml)：取华北分布、两针一束、灰褐树皮与平展枝；生成形态为意象，非植物鉴定标本。

画风一致性自评：k6沿用灰瓦、暖土与哑光木石，桥保留朴素木梁和低栏，26件低饱和材质与宋套件细节密度协调；透明背景有效。需作者确认：年代意象、装饰繁简及建议占地默认沿用；未确认时保持`candidate`，几何残差交总装实测。地域替换对应表如下，其余功能槽保持清单对应。

| 镖局 | 宗教地标 | 王府/宫殿功能 | 本地植物 |
|---|---|---|---|
| 护运货栈（原创扩展） | 匿名密檐砖塔 | 王府殿院模块 | 榆树 / 油松意象 |
