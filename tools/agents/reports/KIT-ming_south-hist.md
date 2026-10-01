# KIT-ming_south-hist 报告 · 建筑套件 · 明 · 江南套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

按同ID重出 `ming_south` 全部19张建筑与7张墙门 / 桥 / 植物贴片，类型、占地、画布与锚点不变。
26类均实际输入旧图作几何引导及2张已下载、已查看的历史 / 遗存图片；29个正式候选中选26张。
最终图为真RGBA、左上光、单45°视图；仅等比规格化，无拉伸、warp或补画。
全部保留 `candidate`；换图后未冒称旧版几何验证仍有效，也未冒称完成总装、碰撞或接缝测试。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/ming_south/`：19张PNG；manifest 1594行；`history/` 含3个脚本、26旧图guide、26入选原图、26记录。
- `assets/default/tile/ming_south/`：7张PNG；manifest 500行。
- `assets/default/prompts/building-map.md` 714行：§11增补历史重出流程、细节要点、实际图片来源。
- `assets/default/prompts/tile.md` 455行：§9增补城砖 / 券拱 / 桥石作 / 柳竹细节、实测边界和图片来源。
- 本报告≤100行；外部下载图仍在 `/private/tmp/KIT-ming_south-hist-refs/refs/`，未写入仓库。

## 3. 关键结论与数值

- 数量：建筑19 + 贴片7 = 26；候选20 + 9 = 29；马厩与两座城门各2选1，其余1选1。
- 输入：每类 `1旧图guide + 2历史图`；历史图共17个去重文件，访问日均为2026-10-01。
- 规格：原画布、`building.type/tile.kind`、footprint、variant、anchor逐字段保持；alpha≥2取框，单次等比LANCZOS，贴齐旧主体底边并水平居中。
- 像素复核：26/26为RGBA且alpha极值均为`0/255`；磁盘尺寸 / SHA-256逐项匹配manifest，四边透明；两城门及石桥孔洞反相确认连续透明。
- 当前PNG人工测可见落地边：以`|s-s_target|≤0.03`（目标`+0.5/-0.5`）计，23个有矩形底轴对象仅4个双轴通过、19个超限；市棚 / 柳 / 竹无连续矩形底轴，列不适用。故继续`geometry_verified:false`，不重出或仿射掩盖。
- 光向复核：26/26均见左上受光、右下较暗或短接触影；纯形体墙段也以左面亮、右面暗核对。
- 历史边界：均为匿名地域组合 **（原创扩展）**，不把中华门、放生桥、报恩寺塔或玄妙观参考冒称逐尺寸复原。

## 4. 开放问题（附默认值）

- 作者是否接受王府 / 寺观较正式的脊兽和彩画？默认保留克制鸱吻、小脊兽和低饱和梁枋，不用金瓦、龙饰。
- 报恩寺塔层数与琉璃色带是否需进一步精确考据？默认作为八角九层游戏概化，不冠具名塔。
- 柳竹具体种属与明代栽植点位 **（待考）**；默认仅作江南地域植物意象。
- 新门孔净宽、墙接缝、桥碰撞和建筑占地仍 **（待实测）**；默认保持登记值与旧锚，接入前总装复核。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。此次只替换授权素材与其制作记录，不修改玩法事实或基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/22` / 明江南套件验收记录：下游总装后登记新图门孔净宽、墙段接口、桥碰撞、建筑占地与遮挡结果。
- 城市配置 / `ming_south` 引用处：只在总装通过后把素材状态由 `candidate` 晋级；当前不应沿用旧图的几何 release-ready 结论。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

说明：下列来源键均为实际输入图片（访问2026-10-01）；manifest另存SHA-256和逐图取用说明。
- 来源H：[H1吴氏厅](https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Wu_Family_Reception_Hall%2C_early_17th_century.jpg?width=1600) / [H2江南村寺画](https://www.metmuseum.org/art/collection/search/45665) / [H3明式院落](<https://commons.wikimedia.org/wiki/File:Ming_courtyard_(6238830623).jpg>)。
- 来源M：[M1南都图一](https://commons.wikimedia.org/wiki/File:%E4%BB%87%E8%8B%B1%E3%80%8A%E5%8D%97%E9%83%BD%E7%B9%81%E4%BC%9A%E5%9B%BE%E3%80%8B%E5%B1%80%E9%83%A8.jpg) / [M2南都图二](https://commons.wikimedia.org/wiki/File:%E5%8D%97%E9%83%BD%E7%B9%81%E4%BC%9A%E5%9B%BE%E5%B1%80%E9%83%A8%EF%BC%88%E6%98%8E_%E4%BB%87%E8%8B%B1%EF%BC%89.jpg)。
- 来源T/P：[T1玄妙观](https://commons.wikimedia.org/wiki/File:Suzhou_Xuanmiao_Guan_2015.04.23_17-53-17.jpg) / [T2斗拱近景](https://commons.wikimedia.org/wiki/File:Suzhou_Xuanmiao_Guan_2015.04.23_18-02-22.jpg) / [P1报恩寺塔一](https://commons.wikimedia.org/wiki/File:Porcelain_Tower_of_Nanjing.jpg) / [P2塔二](https://commons.wikimedia.org/wiki/File:Nanking_Erlach.jpg)。
- 来源G/B：[G1中华门一](https://commons.wikimedia.org/wiki/File:Nanjing-Zhonghua-Gate-3071.jpg) / [G2中华门二](https://commons.wikimedia.org/wiki/File:Nanjing-Zhonghua-Gate-3072.jpg) / [B1放生桥一](https://commons.wikimedia.org/wiki/File:The_Fangsheng_Bridge-1.jpg) / [B2桥二](https://commons.wikimedia.org/wiki/File:The_Fangsheng_Bridge-2.jpg)。
- 来源W/Z：[W1平江柳](<https://commons.wikimedia.org/wiki/File:A_willow_and_a_boat_in_Pingjiang_Road_(6650483501).jpg>) / [W2西湖图](https://commons.wikimedia.org/wiki/File:Hangzhou_-_West_Lake_1759.jpg) / [Z1夏昶墨竹](https://www.metmuseum.org/art/collection/search/44590) / [Z2扬州竹园](https://commons.wikimedia.org/wiki/File:Bamb_Garden_in_Yangzhou.JPG)。
- ✅ 小民居 / 大民居（H1+H2）：低举折硬山、灰板筒瓦、素脊、直棂、粉墙青砖脚；各1候选。
- ✅ 天井院落（H1+H3）：正房两厢、石铺天井、硬山灰瓦、花岗石槛；1候选。
- ✅ 单层 / 两层商铺（M1+M2）：窄铺、板面、直棂楼窗、灰瓦封火墙；各1候选。
- ✅ 客栈 / 酒楼 / 市棚（M1+M2）：连续浅檐、楼廊、素栏、布棚、竹篮陶罐；各1候选。
- ✅ 衙门（H1+H3）：门院厅轴序、五开间、低石台、两层短出跳；1候选。
- ✅ 镖局（H3+M1）：高围墙、宽木车门、接待厅、货棚、石铺地；1候选；名称 / 功能 **（原创扩展）**。
- ✅ 赌场（M1+H1）：普通商住外观、闭合直棂与厚板门，无赌博符号；1候选；功能 **（原创扩展）**。
- ✅ 山庄（H1+H3）：两进院、门与照壁、五开间厅、低侧翼；1候选。
- ✅ 王府（T1+H1）：五开间歇山、两层短斗拱、克制脊兽、花岗石台；1候选。
- ✅ 寺观（T1+T2）：灰瓦歇山、短出跳、柱网、低饱和彩画；1候选。
- ✅ 佛塔（P1+P2）：八角收分、逐层出檐、券龛、木廊与九环刹；1候选。
- ✅ 守舍（G1+H1）：青砖下墙、硬山灰瓦、厚板门、窄直棂；1候选。
- ✅ 马厩（M1+H1）：五间开敞棚、重木柱、半高栏、石槽、土坯后墙；2选1。
- ✅ 仓屋（M1+G1）：厚青砖、石防潮脚、铁条双板门、高位通风孔；1候选。
- ✅ 河埠（M2+B2）：青砖驳岸、花岗石压顶踏步、排水孔与系船石；1候选。
- ✅ 城门k4 / k6（G1+G2）：青灰城砖错缝、花岗石脚、放射券砖、低女墙与灰瓦门楼；各2选1，孔洞真透明。
- ✅ 直墙 / 外角（G1+G2）：细横皮错缝、石灰缝、窑色差、花岗石底皮与平砖顶；各1候选。
- ✅ 石桥（B1+B2）：花岗岩券石、粗拱腹、磨损缓拱桥面、方柱素栏；1候选，拱孔真透明。
- ✅ 垂柳（W1+W2）：裂纹分叉干、细长枝幕、疏透冠；1候选。
- ✅ 丛竹（Z1+Z2）：分节细竿、交替披针叶、根部聚生与透明空隙；1候选。
- ✅ 下载 / 目检：上述各类2张参考均下载成功并逐张查看；无“一类全失败”，无影视或游戏截图。另逐张查看26最终图、26 guides、26 selected-sources；未见文字 / 伪字、水印、人物、现代物或具体作品构图复制。
- ✅ URL抽查：H1、H3、M1、T1、G1、B1于2026-10-01均HTTP 200且为Commons真实图片 / 权威文件页；H2、Z1的Met页面实时请求为HTTP 429，本地下载图已目检，不计入可访问样本。
- ✅ 生成 / 规格化：26类全部真实调用 image_gen；不超过2候选；同ID覆盖且无类型 / 占地 / 锚改动。
- ✅ 元数据：每项含prompt、3个实际输入及其哈希、历史URL与取用细节、notes、size、sha256、候选数和记录路径。
- ✅ 登记一致：与HEAD基点逐项比较，26个ID及type/kind、footprint、anchor、variant、status均0差异；基点`approved`为0，全部维持`candidate`；26份记录的guide/source/final哈希链一致。
- ⚠️ 投影实测：当前最终PNG落地边手工端点复算（斜率=`dy/dx`）为4通过 / 19超`±0.03` / 3不适用；未引用换图前旧几何JSON。合格为小民居、大民居、衙门、仓屋；超限仍阻断release-ready。
- ✅ 硬校验：2026-10-01实际执行三条规定命令；building-map 19图 / 19条 / 0问题、tile 7图 / 7条 / 0问题、严格ID退出码0（仅输出既有基线未定义`sk_babuganchan`，strict failure count为0）。
- ⚠️ 待实测：整城总装、四向 / 接缝、遮挡、门孔净格、桥碰撞未执行；需作者确认事项同§4，默认值已给出。
