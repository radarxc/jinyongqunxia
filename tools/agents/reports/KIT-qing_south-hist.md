# KIT-qing_south-hist 报告 · 建筑套件 · 清 · 江南套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

按2026-10-01实际历史图片输入重出并同 ID 覆盖19个建筑、7个墙门 / 桥 / 植物贴片；保留原类型、占地、canvas与锚点。
每类使用1张仓内几何 guide + 2张历史 / 植物图片，入选源、完整 prompt、URL、访问日、SHA与取用细节已登记。
历史下载件按要求只留工作区外，不入库；规格化只裁透明空白、一次等比缩放和透明回填，未非等比变形或补画。
三项指定检查均通过；素材仍为 `candidate`，精确拼接、碰撞、门孔对格、桥栏遮挡和真机效果待实测。

## 2. 产出（文件、行数、主要章节）

- `building-map/qing_south/`：19 PNG；主 manifest 1251行，domestic 650行，civic 601行；19份记录、19份入选源和2份覆盖前 guide。
- `tile/qing_south/`：7 PNG；manifest 749行；7份记录、9份候选源（两门各2）、5份覆盖前 guide。
- `prompts/building-map.md` 860行、`prompts/tile.md` 547行：补真实图片输入流程与“历史细节要点”。
- 本报告不超过100行；全部新增 / 修改均在任务允许路径。

## 3. 关键结论与数值

- 数量：19建筑 + 7贴片；每类2张历史图，合计52次历史图片输入位（同图可复用于同类）。
- 候选：`house_small`、`gate_k4`、`gate_k6` 各2选第2；其余23类各1选第1；每张均未超过2候选。
- 相机 / 输出：斜45°、俯仰约30°、2:1正交意图、左上光、右下短接触影、真RGBA；接触表与逐张源图均已看过。
- 处理：`alpha>=2`仅定位裁框；框内alpha不阈值覆盖；一次等比LANCZOS；回原canvas、水平居中、贴齐旧有效底边；登记占地 / `anchor_px` 不变。
- 墙门：青灰砖错缝、花岗石基脚与券脚、放射拱圈、补灰缝、低女墙、灰瓦低举折门楼；两门目标比例仍为2:4:2 / 2:6:2。
- 宅店厅塔：灰板瓦 / 筒瓦、素脊与克制脊饰、0–2跳短出承檐、柱网 / 石台、直棂 / 方格窗、白灰砖墙与青砖勒脚均写入逐图 prompt。

## 4. 开放问题（附默认值）

- 精确底边斜率、占地像素包络、门孔净宽、墙角拼缝、桥栏遮挡、植物根部碰撞未逐像素装配；默认保持 `candidate`，不升 `approved`。
- 只有 `r000` 单向图；默认不旋转冒充其余方向，等下游按需补图。
- 马厩同地域马具 / 存世马厩专图下载失败；默认采用阊门街 + 吴氏接待厅的街屋柱网、开敞檐廊与材质，功能构造标原创扩展。
- 底层图片模型版本、seed、effort与价格未披露；默认记 `undisclosed` / `not_exposed`，不猜测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。此次只重出既有套件像素与制作溯源，不改变玩法、ID、占地或基准规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/22` / 清江南套件验收状态：待总装逐像素验证后，登记墙门接缝、门孔碰撞、桥栏遮挡和四向素材状态；本任务不越权修改。
- 后续审校报告 / qing_south：不要沿用旧首版“历史网页只作文字考据”结论；本轮确有历史图片直接输入，以 manifest / `history/records` 为准。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 建筑逐类参考、取用细节、候选数

- ✅ 小民居：[吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600) + [网师园](https://commons.wikimedia.org/wiki/Special:Redirect/file/Master_of_Nets_Garden_1.jpg?width=1600)；低举折硬山、灰小瓦素脊、短檐简承、三间柱网、白墙青砖勒脚、格窗薄石基；2选2。
- ✅ 大民居：[吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600) + [网师园](https://commons.wikimedia.org/wiki/Special:Redirect/file/Master_of_Nets_Garden_1.jpg?width=1600)；两层三间木构、硬山灰瓦、素脊、短檐一跳承檐、楼层直棂窗与平直木栏；1选1。
- ✅ 院落：[吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600) + [网师园](https://commons.wikimedia.org/wiki/Special:Redirect/file/Master_of_Nets_Garden_1.jpg?width=1600)；主厅 / 厢房围石铺天井、低举折硬山、白墙青砖脚、直棂隔扇和克制清水砖门罩；1选1。
- ✅ 山庄：[吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600) + [网师园](https://commons.wikimedia.org/wiki/Special:Redirect/file/Master_of_Nets_Garden_1.jpg?width=1600)；多进院、厅堂柱网、灰瓦素脊、白色封火墙、青砖勒脚、薄石台和克制砖雕门罩；1选1。
- ✅ 单层商铺：[阊门街图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [水上贸易图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Commerce_on_the_water.jpg?width=1800)；窄开间、灰瓦硬山、排门、浅檐、低石槛、卷起无字布篷；1选1。
- ✅ 两层商铺：[阊门街图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [水上贸易图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Commerce_on_the_water.jpg?width=1800)；两层窄开间、白色封火山墙、青砖脚、底层排门、楼层直棂窗与平直木栏；1选1。
- ✅ 客栈：[阊门街图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [水上贸易图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Commerce_on_the_water.jpg?width=1800)；临街两层客房 + 低后翼围小院、灰瓦硬山、浅连续檐、直棂客窗和无字挂板；1选1。
- ✅ 酒楼：[阊门街图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [水上贸易图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Commerce_on_the_water.jpg?width=1800)；前楼后院、开敞三间底层、楼层直棂窗、浅连续檐及无字布篷，排除塔楼和灯笼堆叠；1选1。
- ✅ 市场棚：[阊门街图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [水上贸易图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Commerce_on_the_water.jpg?width=1800)；四柱榫卯木 / 竹架、木柜台、系绳微垂灰蓝织物篷，缝隙真透明；1选1。
- ✅ 赌场：[阊门街图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [网师园](https://commons.wikimedia.org/wiki/Special:Redirect/file/Master_of_Nets_Garden_1.jpg?width=1600)；普通商宅外观、封闭格窗、厚木门、硬山灰瓦，无赌博符号；1选1。
- ✅ 衙署：[衙署入口院落图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Entrance_and_yard_of_a_yamen.jpg?width=1600) + [考场图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Examination_hall.jpg?width=1600)；轴线门院厅序、五间柱网、低石台、直棂、短出斗拱；1。
- ✅ 镖局：[衙署画](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Entrance_and_yard_of_a_yamen.jpg?width=1600) + [吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600)；商宅院落、高墙、铁钉厚木门、三间厅、直棂小窗，无城垛；1选1。
- ✅ 王府：[衙署画](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Entrance_and_yard_of_a_yamen.jpg?width=1600) + [吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600)；深轴线门院厅序、五间正厅、石台、红褐柱、灰瓦歇山、二跳短出承檐及克制苏式梁枋；1选1。
- ✅ 寺殿：[玄妙观17:53](https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Suzhou_Xuanmiao_Guan_2015.04.23_17-53-17.jpg/1920px-Suzhou_Xuanmiao_Guan_2015.04.23_17-53-17.jpg) + [18:02](https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Suzhou_Xuanmiao_Guan_2015.04.23_18-02-22.jpg/1920px-Suzhou_Xuanmiao_Guan_2015.04.23_18-02-22.jpg)；五间柱网、歇山灰瓦、缓翼角、短出斗拱、克制彩画；1。
- ✅ 佛塔：[北寺塔旧照](https://commons.wikimedia.org/wiki/Special:Redirect/file/North_temple_pagoda%2C_Soochow_%28NYPL_Hades-2359185-4043541%29.jpg?width=1600) + [现状照](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090905_Suzhou_North_Temple_Pagoda_4611.jpg?width=1600)；砖塔心、七层可读收分、逐层密檐与简化承檐；1。
- ✅ 守舍：[盘门5933](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5933.jpg?width=1600) + [5941](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5941.jpg?width=1600)；青灰砖、花岗石基、低举折灰瓦硬山和防御性小窗；1。
- ⚠️ 马厩：[阊门街](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Changmen_street_in_Suzhou.jpg?width=1800) + [吴氏接待厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600)；只取柱网、开敞檐廊与材质，专用马匹图下载失败；原创功能构造；1。
- ✅ 仓屋：[富义仓03](https://commons.wikimedia.org/wiki/Special:Redirect/file/Fuyi_Granary%2C_2021-01-30_03.jpg?width=1600) + [05](https://commons.wikimedia.org/wiki/Special:Redirect/file/Fuyi_Granary%2C_2021-01-30_05.jpg?width=1600)；青砖、厚板门、高通风孔、石质防潮台、灰瓦硬山；1。
- ✅ 河埠：[水上贸易图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Xu_Yang_-_Commerce_on_the_water.jpg?width=1800) + [1984吴门桥接近照](https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Approach_to_Wumen_Bridge_at_Suzhou_1984.jpg/1920px-Approach_to_Wumen_Bridge_at_Suzhou_1984.jpg)；青砖石基驳岸、磨损石级、系缆石、泄水孔；1。

### 贴片逐类参考、取用细节、候选数与检查

- ✅ 石桥：[平江路石桥](https://commons.wikimedia.org/wiki/Special:Redirect/file/A_stone_arch_bridge_in_Pingjiang_Road%2C_Suzhou.jpg?width=1200) + [1984吴门桥](https://commons.wikimedia.org/wiki/Special:Redirect/file/Suzhou_Wumen_Bridge_1984.jpg?width=1600)；低矢单孔、放射花岗石券、粗石拱腹、磨损台阶、低板栏 / 方望柱；1。
- ✅ k4城门：[盘门5888](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5888.jpg?width=1600)+[5933](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5933.jpg?width=1600)；砖石券 / 石基脚、补灰缝、低女墙、灰瓦门楼及2:4:2真透明孔；2选2。
- ✅ k6城门：[盘门5933](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5933.jpg?width=1600)+[5941](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5941.jpg?width=1600)；同类砌体细节、加宽浅拱及2:6:2真透明孔；2选2。
- ✅ 直墙：[盘门5888](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5888.jpg?width=1600) + [5941](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5941.jpg?width=1600)；青砖错缝、花岗石基、端面夯土芯意象、低女墙和方正模组端；1选1。
- ✅ 外转角：[盘门5888](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5888.jpg?width=1600) + [5941](https://commons.wikimedia.org/wiki/Special:Redirect/file/20090926_Suzhou_Pan_Men_5941.jpg?width=1600)；等高等厚两翼、转角连续压顶 / 女墙、方正模组端、青砖与石基湿润风化；1选1。
- ✅ 桂花：[木犀中国](https://commons.wikimedia.org/wiki/Special:Redirect/file/Osmanthus_fragrans_in_China.jpg?width=1200) + [桂花照片](https://commons.wikimedia.org/wiki/Special:Redirect/file/Osmanthus_Fragrans_chinese_Guihua.JPG?width=1200)；多分枝、对生革质椭圆叶、少量淡黄小花；1。
- ✅ 柳树：[平江路柳](https://commons.wikimedia.org/wiki/Special:Redirect/file/A_willow_and_a_boat_in_Pingjiang_Road_%286650483501%29.jpg?width=1200) + [1759西湖图](https://commons.wikimedia.org/wiki/Special:Redirect/file/Hangzhou_-_West_Lake_1759.jpg?width=1600)；单干、疏透不对称冠、长垂枝、细披针叶；1。
- ✅ 下载：除马厩专图外，每类实际输入2张且成功下载、看图；全部URL / SHA / 访问日 / 用途在 manifest；无影视或游戏截图。
- ✅ 资产检查：建筑19张0问题；贴片7张0问题；短边门槛分别256 / 32。
- ✅ ID检查：`python3 tools/lint/check_ids.py --strict` 退出码0；未改ID、类型、占地、工具或其他套件。
- ✅ 范围 / 完整性：仅允许路径有改动；无未完成占位语句，YAML均可解析，source / reference链存在；报告≤100行。
- ⚠️ 下载失败 / 作者确认：仅马厩专用两图未下载成功；其余类型无失败。请确认本轮整体美术方向及马厩默认参考是否接受；未确认前保持全部素材为 `candidate`。
