# KIT-tubo 报告 · 建筑套件 · 吐蕃 · 藏地套件

## 1. 摘要（3–6 行）

交付19张建筑、7张墙门桥植物贴片，全部为内置 image_gen 生成的真实RGBA候选；未修改宋套件、策划、技术文档或 tools/town。
首轮45次生成；前次返修对house_small、shop_1f、wharf各重出2候选择1，累计51次；三张锚点、尺寸、SHA与完整提示词已更新，旧候选留档。
第7次续作仅返修审核点名的两座城门；本轮未改26张成品，补做历史图下载/目视QA及逐项可追溯登记，生成时未输入这些历史图。
藏地形制为未具名地域组合（原创扩展），具体城市年代、植物栽植与细部断代仍待考；状态均保持candidate。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/tubo/`：19张成品、生成来源/候选、meta、审图页；manifest逐件含生成输入和独立`historical_references`。
- `assets/default/tile/tubo/`：7张成品、原稿、两门返修记录/脚本；manifest逐件含生成输入和独立历史/植物形态QA。
- `assets/default/prompts/building-map.md`：§11地域形制、19类映射及历史参考边界；`tile.md`：§9贴片差异、两门投影后处理和桥证据边界。
- [候选审图页](../../../assets/default/building-map/tubo/review.html)：26件缩略图与原尺寸链接；不是等比例装配结果。本报告不超过100行。

## 3. 关键结论与数值

- 数量：建筑19=2民居+1院落+2商铺+14其他功能；贴片7=2门+直墙+墙角+桥+2植物。累计51次image_gen调用；第7次续作仅对两张已生成高分辨率城门原稿作确定性投影校正，本轮图片零改动。
- 地面目标包围框 `W=32(w+h),H=16(w+h)`；例如6×5→352×176、20×16→1152×576。建筑按实测L/R墙脚宽等比缩放；锚点由 `(L+R)/2` 转换，不能拿PNG底中点或画布宽代替占地。
- 门净宽k=4/6；占地 `(k+4)×4=8×4/10×4`，孔为k×4。高分辨率原稿按 `y'=s·y+t·x` 校正（k4 `s=1.227,t=.102`；k6 `s=1.239,t=.119`），主地面边实测k4约+0.50/-0.53、k6约+0.50/-0.51，门洞中心alpha=0。
- 三张重测L/F/R：小民居(362,653)/(879,916)/(1258,728)，517/379=1.364116，对6/5偏13.68%；商铺(233,683)/(880,976)/(1315,775)，647/435=1.487356，对7/5偏6.24%；河埠(65,463)/(1035,919)/(1495,653)，970/460=2.108696，对8/4偏5.43%。人工误差±6px，独立复核一致；footprint未改。
- 对应轴斜率为小民居(+0.508704,−0.496042)、商铺(+0.452859,−0.462069)、河埠(+0.470103,−0.578261)。整集现7张同时通过既有两项容差，11张轴超差、7张比例超差；未点名条目沿用首轮记录，未扩大返修范围。
- 城门返修先预乘alpha，再做保持x与竖线方向不变的仿射重投影，alpha>4裁切、一次LANCZOS缩放、16px透明留边；没有重绘或改色。26张终图本轮逐张view_image，均主体完整、无伪字/现代物/明显裁边；RGBA、alpha范围0–255、四边透明，建筑短边≥256、贴片≥32。

## 4. 开放问题（附默认值）

- 精确拼接与残差：默认保留candidate并展示实测失败；首轮遗留清单courtyard、house_large、house_small、inn、market_stall、palace_hall、restaurant、shop_1f、shop_2f、stupa、warehouse、wharf保留追溯。前次仅重出审核点名三张，各2候选额度用尽；小民居比例、商铺/河埠轴向仍未解决，不声明返修通过。
- 商铺右墙上下两扇窗可能被误读为两层；默认保留候选待外观复审，不改变shop_1f类型或占地。本轮无需作者决定，未新增确认请求。
- 两座城门审核点名的地轴问题已解决；默认仍保持candidate，门孔净宽、墙缝、桥台岸线留待代码总装验收。历史图支持塔身式门而非当前平顶楼式门；玉妥桥有桥屋且石桥台/墩，与当前无盖木桥不同，二者均保留无名原创概化。
- 默认接受无名地域功能替换，赌场/护运行/河埠不自动开启biz或航线；宫室不复制布达拉宫，金顶/佛塔不是实测文物。
- 默认沿用模板登记的占地建议值；柳仅确定到属，西藏沙棘现代标本形态已核，精确分布、古代城内栽植和藏地内部地区差异待考。所有图片待作者审美确认，未答不改approved。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。仅新增地域素材，不改玩法、公式、历史城市状态或基准ID规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/22-town-layout-and-generation.md` §3.4、§4.1及`town/schema.yaml`：后续接入时登记tubo地域资源键、本文19项借用占地和单向限制；本轮未越权修改。
- `tools/town` 的未来藏地规格/装配任务：消费实际anchor与地面尺度，建筑禁止按含padding的画布宽二次缩放；先返修几何偏差、核门孔掩膜和墙缝，不直接当release完整集。
- `assets/default/baseline/town/` 当前只见代码占位布局预览，未见已贴真实素材的总装成图；本轮看过其布局图和README，不能声称已对照真实总装验证藏地拼接。

## 7. 自检（逐条对照验收标准）

清单中建筑ID与type相同；下列ID省略统一前缀：建筑`bld_kit_tubo_`，贴片`tex_town_tubo_`；占地为东西×南北格，尺寸为最终PNG。

| ID后缀 / 类型 | 占地 | 尺寸px |
|---|---|---|
| house_small / 小民居 | 6×5 | 387×352 |
| house_large / 大民居 | 7×6 | 467×432 |
| courtyard / 院落 | 10×8 | 610×430 |
| shop_1f / 单层商铺 | 7×5 | 418×365 |
| shop_2f / 两层商铺 | 8×6 | 478×437 |
| inn / 客栈 | 10×8 | 613×521 |
| restaurant / 茶肆 | 10×8 | 876×543 |
| market_stall / 市场棚 | 5×4 | 379×288 |
| yamen / 官署 | 16×12 | 966×618 |
| biaoju / 驮队货栈 | 14×11 | 923×627 |
| casino / 博戏屋 | 9×7 | 637×437 |
| manor / 大院 | 15×12 | 1027×701 |
| palace_hall / 宫室模块 | 20×16 | 1225×835 |
| temple_hall / 金顶佛殿 | 14×11 | 941×598 |
| stupa / 藏式佛塔 | 7×7 | 731×520 |
| guardhouse / 守门碉舍 | 6×5 | 524×346 |
| stable / 马厩 | 8×6 | 566×428 |
| warehouse / 仓屋 | 9×7 | 621×414 |
| wharf / 河埠 | 8×4 | 419×256 |
| city_gate__k4_r000_v01 / 净宽4门 | 8×4 | 400×449 |
| city_gate__k6_r000_v01 / 净宽6门 | 10×4 | 464×467 |
| wall__stone_r000_v01 / 直墙 | 1×1 | 88×224 |
| wall_corner__outer_ne_v01 / 外墙角 | 2×2 | 176×208 |
| bridge_deck__w4_l8_r000_v01 / 木桥 | 4×8 | 400×265 |
| tree_cluster__willow_v01 / 柳树 | 3×3 | 272×261 |
| shrub__seabuckthorn_v01 / 沙棘 | 2×2 | 144×80 |

来源清单（访问2026-10-01；历史图均下载到写集外临时目录并 `view_image`，只作成品事后QA，未作为image_gen输入；逐件用途见manifest）：

- Wikimedia Commons：[Tsarong宅](https://commons.wikimedia.org/wiki/File:Tsarong%27s_house_in_Lhasa.jpg)、[Trimon宅](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg)、[英国使团院落](https://commons.wikimedia.org/wiki/File:The_British_Mission_in_Lhasa,_1936.jpg)、[1948萨迦寺](https://commons.wikimedia.org/wiki/File:Close_view_of_Sakya_Monastery,_Tibet_in_1948_prior_to_its_destruction-_BMH.M.49.1.jpg)：核平顶厚墙、深色窗框、木廊、围院和宗教层级；不复刻构图。原图直链429，改用Commons缩略图接口成功。
- Library of Congress：[驻藏大臣衙门](https://www.loc.gov/item/2021670596/)、[泽当城镇](https://www.loc.gov/item/2021670610/)、[罗布林卡](https://www.loc.gov/item/2021670617/)、[Bar Chorten门](https://www.loc.gov/item/2021670618/)、[玉妥桥](https://www.loc.gov/item/2021670619/)、[扎什伦布寺](https://www.loc.gov/item/2021670626/)（约1900）与[拉萨街市](https://www.loc.gov/item/2002698079/)（1939）：核官署/城镇/宫苑/寺院；门、桥用于反例边界，街市仅取得150px预览。
- [LACMA · Reliquary Stupa](https://collections.lacma.org/object/61926)、[Pitt Rivers · Lhasa willows, 1936](https://web.prm.ox.ac.uk/tibet/photo_1998.131.270.html)、[BRIT907382 · Hippophae tibetana, 2018](https://portal.torcherbaria.org/portal/collections/individual/index.php?occid=31555408)：分别核佛塔、柳树和沙棘形态；BRIT为现代标本，不证明古代栽植。
- [China’s corridor bridges](https://link.springer.com/article/10.1186/s43238-020-00010-w)可访问但属通用中国廊桥论文，不作为藏地构法证据；UNESCO与Kew本轮403、THF证书过期，相关技术事实仍 **（待核实）**。

| 通用功能 | 地域替换（原创扩展；占地上游详见building-map模板§11.2） |
|---|---|
| 大/小民居、院落 | 大/小碉房、石墙院 |
| 单/双层商铺、客栈、酒楼、市场棚 | 藏地铺屋、商旅客舍、茶肆、毛织布棚 |
| 衙门、镖局 | 地方官署、驮队货栈 |
| 赌场、山庄 | 民间博戏屋、藏式大院 |
| 王府/宫殿、寺观、塔 | 地方宫室、金顶佛殿、藏式佛塔 |
| 城门守舍、马厩、仓屋、河埠 | 守门碉舍及同功能石木地域外观 |

- ✅ 19+7清单齐全；本轮未改图片，已逐张view_image复审26件，石墙、白灰、赭红木饰、左上光与两门透明孔均保留。门SHA前12位：k4 `762b1c5d0b95`、k6 `3589da8587f2`。
- ✅ 两条check_assets指定命令均退出0（19/7张、0问题）；check_ids.py --strict退出0、strict failure count=0，既有`sk_babuganchan`白名单缺定义未动。脚本不验底面几何。
- ✅ 26张均RGBA、alpha 0–255、四边透明且成品SHA吻合；生成源、旧候选、返修记录与脚本均留档；未执行改变仓库状态的git命令。
- ⚠️ 画风自评：石木写实、左上光、低饱和白赭墙与宋基线材质密度接近；宫室/金顶比民居更明亮，院落铺石和红饰密度待作者确认。没有宣称已获审美批准。
- ✅ 审核点名两门主地轴均已从约0.27–0.33校正到约±0.5；26条manifest均登记事后QA来源及用途，不伪称历史图曾输入生成；桥/门反例、网络失败和古代栽植限制均如实保留。
