# 本任务：出图 · 大地图城镇分档图集 + 名城按年代布局小景（AR-113）

## 0. 先读

- 作者原话与口径：`docs/decisions/author-requirements.md` 末条 AR-113（以及 AR-111 / AR-112 的背景：底图是 GIS + 仓库水墨贴图确定性合成，作者嫌 AI 整图「不太可控」）；
- 契约：`docs/tech/13-worldmap-painted.md` §5.2（分档与图标、atlas 键名）、§5.3（小景素材字段、显示尺寸、版式依据）；
- 数据：`docs/design/map/cities.yaml`（城市经纬度、`importance`、逐章 `eras[chNN]` 名称与地位）、`content/world/ch10/map.yaml`（节点网格坐标）、`docs/design/town/city_*__chNN.yaml`（已有城图规格：城墙多边形、城门、街道、分区，**含史料来源**）、`docs/design/town/` 下的 history 资料（如有）；
- 画风：`assets/default/map/kit/`（大城 / 州府 / 县镇 / 村落 / 关隘 / 遗迹 / 门派 / 寺庙 / 道观件，manifest 有尺寸用途）、按年代的建筑套件 `assets/default/building-map/<kit>/`（song_north、liao_jin_north、yuan_north/south、ming_north/south、qing_north/south、mongol、tubo、xiyu：宫殿 palace_hall、王府 wangfu、塔 pagoda、殿 temple_hall、衙署 yamen、民居、城门等）、现行底图 `assets/default/map/world/map_world_jianghu__base01.webp`（小景要和它放在一起好看）。
- 章节年代（cities.yaml `chapters`）：ch01 北宋 1093；ch02 南宋金蒙 1217；ch03 1259；ch04 元末 1360；ch05–07 明；ch08–09 清初；ch10 按 AR-26 为**唐 702**（地图数据仍是清初，属已知数据缺口，小景按 AR-26 画唐代）；ch11–14 清中期。

## 1. 规矩

- **确定性优先**（作者 AR-112 的意思）：小景由程序按史料版式画出——城墙、城门、中轴、宫城 / 皇城块、坊巷格局、水系用程序画墨线，建筑用仓库已有的按年代建筑套件与 kit 件摆放，再统一过水墨处理（去色、墨分浓淡、纸色、轻度晕染），与底图同一调子。固定种子，同输入同输出。
- **只有缺件才出图**：某个标志建筑（如紫禁城三大殿群、天坛祈年殿、大雁塔、小雁塔、钟鼓楼、北海白塔）在套件里确实没有合适的件时，才可以单独出单体建筑图（Gemini 网页或作者订阅的其它通道），一次只画一座建筑、白 / 透明底、参考 kit 寺庙 / 门派件画风；每张写清楚为什么套件不够。**不要用 AI 生成整座城的小景。**
- 写集：`tools/map/paint/landmarks/**`（新建：版式规格、渲染脚本、图集脚本、README）、`assets/default/map/markers/**`、`assets/default/map/landmark/**`、工作目录 `.agents/coord/ART-worldmap-landmarks/**`。不改代码（`apps/**`、`packages/**`）、不改 `content/**`、不改 `tools/map/paint/` 下已有文件（另一个出图子代理在用）、不改其它素材。**不提交 git**，不执行任何改变仓库状态的 git 命令。
- 浏览器（如需出单体建筑图）：AR-100 保持一条连接、不反复让作者批准；只碰 gemini.google.com 标签页；不碰 127.0.0.1:9223 的 /create_target、/open、/tripo/*；可见性或限流卡住就停下报告。
- 联网查史料可以（城市布局、城墙形制、标志建筑年代）：只用公开来源，请求用通用标识 `User-Agent: TianshuMapBot/1.0`，不带作者任何个人标识；每座城的依据写进规格文件与 manifest `layout_basis`（标题、URL、访问日期、支持哪一条）。原著能定的照原著（如襄阳城在《神雕》里的样子），不要拿来问作者。

## 2. 交付一：城镇分档图集（先做，半小时内）

- 从 kit 件确定性生成 `assets/default/map/markers/map_markers_atlas.webp`（每格 128×128，透明，WebP 无损或高质量）+ `atlas.json`：
  `{"schema":"tianshu.map-markers.v1","cell":128,"markers":{"city_large":{"x":..,"y":..,"w":128,"h":128,"anchor":[ax,ay],"source":"map_kit_dacheng_0N"}, …}}`
  键必须是：`city_large`（大城）、`city_prefecture`（州府）、`city_county`（县镇）、`village`（村落）、`pass`（关隘）、`ruin`（遗迹）、`sect`（门派）、`temple`（寺庙）、`daoist`（道观）。`anchor` 是图标里应落在节点坐标上的点（城池类取城心，关隘取关口）。
- 每类挑一件最清楚、缩到 30–60 px 仍可辨认的变体；缩小时保留墨线清晰（必要时轻度锐化），不要糊。
- 同目录 `manifest.yaml` 登记图集一条（字段按 `assets/README.md`，`tool` 写 python3 合成，`references` 列出所用 kit 件与 sha256）。
- 出一张样张：图集各件按 30 / 44 / 60 px 摆在底图同一区域上的效果。

## 3. 交付二：名城小景（按年代）

首批（作者点名）：
- **北京**：ch01 辽南京析津府（燕京）、ch02–03 金中都旧城 / 蒙古燕京、ch04 元大都、ch05–07 明北京（内城 + 嘉靖外城的「凸」字形、紫禁城居中、中轴）、ch08–14 清京师（同明制，加北海白塔、清代皇城变化）、ch10 唐幽州（AR-26，可参考 `docs/design/town/city_beijing__ch10.yaml` 的 9:7 城形）。
- **长安 / 西安**：ch10 唐长安（外郭城、宫城皇城居北、朱雀大街、一百零八坊棋盘格、大雁塔 / 小雁塔、大明宫在东北）、ch01–03 宋京兆府（唐皇城改建的小城）、ch04 元奉元路、ch05–14 明清西安府（明城墙方城、钟楼鼓楼、大小雁塔在城外）。

第二批（首批过了协调者的审再做，或时间富余时继续）：开封（ch01 北宋东京三重城 + 铁塔；ch02–03 金南京）、杭州（ch02–03 南宋临安：凤凰山皇城、西湖、雷峰塔 / 六和塔；明清杭州）、洛阳（ch01 西京）、南京（ch05–07 明应天府 / 南京）、大理（ch01–02 羊苴咩城 + 崇圣寺三塔）、襄阳（ch03《神雕》守城）。

每座城每个年代一张：
- 先写版式规格 `tools/map/paint/landmarks/specs/<city>__<era>.json`：城墙多边形（以城心为原点、单位网格的相对坐标，北上）、城门、主街 / 中轴、宫城 / 皇城块、坊格或街巷网格、水系（护城河、湖、河）、标志建筑（类型、位置、用哪个套件件），每条带来源键；
- 渲染脚本 `tools/map/paint/landmarks/render_landmark.py` 把规格画成透明底小景（建议 768×768 母版，交付 WebP），视角北上、略带俯斜（与 kit 大城件一致），城墙墨线、城楼、主要建筑、街格淡墨，周边留一圈淡墨晕边以便融入底图；同一年代用同一建筑套件；
- 交付 `assets/default/map/landmark/map_landmark_<cityId>__<era>.webp` + 同目录 `manifest.yaml` 每条：`id`、`file`、`category: map`、`style: default`、`subject`、`node`（如 `city_beijing`）、`chapters`（适用章节）、`anchor`（落在节点上的像素）、`footprint_grid`（都城约 10–12，名城约 8；会随地图缩放显示）、`layout_basis`（依据摘要 + 来源）、`references`（所用套件件与 sha256）、`tool`、`model`、`created`、`size`、`sha256`、`status: candidate`、`notes`。
- 质检：每张小景放在底图对应位置、按默认缩放（底图像素 × 0.75）和最大缩放（× 1.875）各截一张对照图，存 `.agents/coord/ART-worldmap-landmarks/qa/`；再出一张总览（首批全部小景 + 年代标注）。

## 4. 汇报

先交付一（图集）就在 `.agents/coord/ART-worldmap-landmarks/STATUS.md` 记一行；首批小景做完后结束本次运行，回报（≤ 25 行）：每座城每个年代的版式要点与来源、用了哪些套件件、是否出了单体建筑图（哪几座、为什么）、产物路径、已知问题。没做到的如实写。
