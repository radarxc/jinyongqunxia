# 大地图城镇分档图集 + 名城按年代布局小景（AR-113）

契约见 `docs/tech/13-worldmap-painted.md` §5.2（分档图标图集）、§5.3（名城小景）。两样都是**程序确定性合成**：只取仓库已有素材，不调用任何出图模型；同一输入逐字节同一输出。

## 命令

```bash
python3 tools/map/paint/landmarks/build_markers.py --sample   # 图集 + atlas.json + manifest，另出 30/44/60 px 样张
python3 tools/map/paint/landmarks/build_markers.py --check    # 内存重建与盘上逐字节比对、两次构建一致、键名齐全
python3 tools/map/paint/landmarks/render_landmark.py --all    # 全部规格 → 小景 WebP + manifest.yaml（母版 PNG 写 .agents/coord/…/master/）
python3 tools/map/paint/landmarks/render_landmark.py specs/city_xian__ming.json   # 单张
python3 tools/map/paint/landmarks/render_landmark.py --all --check                # 重渲染与交付逐字节比对
python3 tools/map/paint/landmarks/qa_landmarks.py             # 底图上默认缩放（×0.75）/ 最大缩放（×1.875）对照图 + 总览
```

依赖：numpy、Pillow（含 WebP）、scipy、PyYAML（仓库工具已在用）。QA 标注字体用系统 STHeiti（缺失时退回默认字体）。

## 交付一：分档图集 `assets/default/map/markers/`

- `map_markers_atlas.webp`：3×3 格、每格 128×128、透明、WebP 无损；`atlas.json`：`{"schema":"tianshu.map-markers.v1","cell":128,"image":…,"width":384,"height":384,"markers":{key:{x,y,w,h,anchor:[ax,ay],source,label}}}`。
- 键（运行时按这些取图）：`city_large` 大城、`city_prefecture` 州府、`city_county` 县镇、`village` 村落、`pass` 关隘、`ruin` 遗迹、`sect` 门派、`temple` 寺庙、`daoist` 道观。
- 选件与锚点判据写在 `build_markers.py` 顶部注释：每类一件、缩到 30–60 px 仍可辨；`anchor` 为格内像素——城池取城垣围合中心，关隘取门洞底边，寺观门派遗迹取主体院落地面中心。缩放用预乘 Lanczos，之后在预乘空间做轻度 USM（σ0.7×0.55）保墨线。

## 交付二：名城小景 `assets/default/map/landmark/`

### 规格 `specs/<node>__<era>.json`（`tianshu.landmark-spec.v1`）

- **坐标**：单位 km，**以城心为原点**（城墙外轮廓多边形形心），x 向东、y 向北；`frame.origin_lonlat` 记城心经纬度，经纬度换算 `x=(lon−lon0)·111.32·cos(lat0)`、`y=(lat−lat0)·110.57`。折点按现代地图上的城墙 / 遗址线与史料尺寸推定，精度约 ±100–150 m。城外地标若按方位示意、距离压缩，会在该条 `basis` 写明。
- `walls[]`：`polygon`、`role`（city / imperial / palace / altar）、`style`（夯土 / 砖 / 宫墙 / 坛墙 / 废墟）、`open_edges`（与大城共边不重画）、`corner_towers`、`moat`、`broken`（废墟断墙比例）。
- `gates[]`：所在墙、方位、位置、`eaves`（重檐）、`barbican`（瓮城与箭楼）。`streets[]` 中轴与主街；`grids[]` 胡同 / 街巷细线；`wards[]` 唐坊（坊块 + 坊墙 + 十字街）；`water[]` 湖 / 渠 / 河（湖可带岛）；`regions[]` 分区（排除填充、地面色）。
- `landmarks[]`：标志建筑，`sprite` 指套件件（默认本档 `kit`；`bld:<kit>/<件>`、`tile:<件>`、`map:<kit 件>`、`baseline:<件>` 跨目录取件；`song_southern` / `song_dali` 套件只在作者已审基线 `baseline/building-map/`，按套件名自动回退），`size_px` 为交付图上的包围盒宽（地图尺度下故意放大才可辨），`crop_top` 截去上部（焚余塔身），`lift_px` 在屏幕上抬高（山坡上的宫寺，如布达拉宫叠在红山南坡）；`proc` 为程序画的圆殿 / 圜丘 / 明堂 / 天枢 / 八角殿（`octagon_hall`，沈阳大政殿、龙王潭琉璃亭）；`tint` 墨化色调（ink / landmark / imperial / white / ruin / red，`red` 为布达拉宫红宫的赭红）。
- 第三批新增：墙或门的 `tower: flat`（平顶夯土 / 石砌墩台，无瓦顶——高昌、喀什、叶尔羌、阿力麻里、青唐、拉萨雪城）、`tower: none`（不画门楼）；河流 `foot_px`（河带计入晕边的宽度）；`role: camp` 的圈营墙（和林、固勒扎毡帐圈营，细墙不铺地面）；`manifest_v: 3` 与 `ref_use`（manifest `references[].use` 按路径片段给出准确用途；首批、第二批未设此键者措辞不变）。
- `bridges[]`：石桥 / 堤（`causeway`）为亮带加墨边，`pontoon` 浮桥为一串小舟；`water[]` 另有 `dry`（干涸故道）。`hills[]` 用 map/kit 丘陵件；`groves[]` 林带（城外环带 `ring`）、坛庙柏林、废墟散件；`fill[]` 坊巷填充件（按年代套件民居、合院、店铺与树，抖动网格，避开水、街、宫城与地标）。
- 尺寸凡带 `_px` 的都是交付图像素（城墙厚高、门楼宽、街宽、胡同间距等与城市实际大小无关，各城视觉粗细一致）；不带的是 km。
- 每个要素带 `src`（来源键）与 `basis`（依据说明），来源全文在 `sources`（标题、URL、访问日期、支持哪一条）；渲染器只读 JSON，不再查史料。

### 渲染（`render_landmark.py`）

1. 投影：北上，地面南北压缩 K=0.68（略俯斜，接近 kit 大城件）；高度向上抬 0.85；3× 超采样（2304²）画后缩到 768 工作画布，再裁到内容包围盒外 6 px 交付。
2. 地面：逐道城 护城河 → 河岸 → 城内地面；湖面三层色（岸线墨、水色、湖心淡）加少量水纹；街道为纸色亮带；坊块略深加坊墙细线。
3. 立体件按画家算法（北先南后）：城墙按 ≤16 px 分段画顶面、迎面墙身（南墙外侧 / 北墙内侧）与雉堞短线，每段色调微抖动；门楼 / 角楼 / 瓮城箭楼为程序墨线小楼（宫城门楼屋面用淡金赭）；建筑与树取套件件墨化后按 manifest 的地面锚点摆放。
4. 墨化：亮度经「暖墨—赭—纸」三段色阶，保留约 40% 原饱和；树保留灰绿；宫殿屋面暗部改淡金赭（黄琉璃的淡彩意思）；白塔保亮部；废墟偏土色。
   **调墨 v2（第二批起，首批一并重出）**：全部参数集中在 `render_landmark.py` 的 `INK_CFG`——墙顶 ×0.86、迎面墙身 ×0.72、墙线 #201c17 宽 1.7 px、城楼屋面 #181613；地标件对比 1.55 并压暗 0.86；民居改「墨团」：抖动网格间距 ×2.4，每团 3–4 件 13–17 px、团下淡墨晕（α0.28、模糊 2.6 px），团与团之间留亮街巷；坊格与胡同线变淡（坊墙 α140、胡同 ×0.55）；整体对比 1.10（支点 150）、gamma 1.03。目标色阶取 kit 大城 / 州府件（平均亮度 136–146、最暗 10% ≈ 65–77）。改 `INK_CFG` 即整体调墨，`--all --check` 仍逐字节可复现。
5. 收尾：地面占地外扩 `halo_px` 并以噪声扰动成不规则淡墨晕边、外圈加一点暖灰；纸纹（细颗粒 + 大片晕斑）；预乘 Lanczos 缩放 + 轻 USM；WebP q90（alpha 100）。
6. `manifest.yaml` 每条：`id`、`file`、`category: map`、`style`、`subject`、`node`、`era`、`chapters`、`years`、`anchor`（交付图内落在节点上的像素 = 城心）、`footprint_grid`（交付图显示宽度，网格单位：都城 10–12、名城 8–9）、`layout_basis`（依据摘要 + 来源）、`spec`、`references`（实际用到的每个套件件与 sha256）、`tool`、`model`、`created`、`size`、`sha256`、`status: candidate`、`notes`。

### 年代分档（每座城每章恰好一张，`landmarkForNode` 取到唯一一条）

| 城 | era | 章节 | 套件 |
|---|---|---|---|
| 北京 | `tang` 唐幽州（702，AR-26） | ch10 | song_north（唐无套件，代用） |
| 北京 | `liao` 辽南京析津府 | ch01 | liao_jin_north |
| 北京 | `jin` 金中都旧城 / 蒙古燕京（1215 城破后） | ch02–03 | liao_jin_north |
| 北京 | `yuan` 元大都（1359 加瓮城后） | ch04 | yuan_north |
| 北京 | `ming_early` 明北京（1553 外城前） | ch05 | ming_north |
| 北京 | `ming` 明北京「凸」字形 | ch06–07 | ming_north |
| 北京 | `qing` 清京师（北海白塔） | ch08–09、ch11–14 | qing_north |
| 长安 / 西安 | `tang` 唐长安（702） | ch10 | song_north（代用） |
| 长安 / 西安 | `song` 宋京兆府（韩建新城） | ch01–03 | song_north |
| 长安 / 西安 | `yuan` 元奉元路 | ch04 | yuan_north |
| 长安 / 西安 | `ming_early` 明西安府（钟楼未东迁、未包砖） | ch05 | ming_north |
| 长安 / 西安 | `ming` 明西安府（1582 钟楼东迁后） | ch06–07 | ming_north |
| 长安 / 西安 | `qing` 清西安府（满城、南城） | ch08–09、ch11–14 | qing_north |
| 开封 | `song` 北宋东京（外城 / 内城 / 皇城三重、汴河、铁塔、繁塔、相国寺、金明池） | ch01 | song_north |
| 开封 | `jin` 金南京开封府（1214 年迁都后；外城多墟、汴河干涸） | ch02–03 | liao_jin_north |
| 洛阳 | `tang` 武周神都（明堂通天宫、天枢、天津桥、洛水穿城；天堂 695 年焚后未见建成，不画） | ch10 | song_north（代用） |
| 洛阳 | `song` 北宋西京（沿隋唐城，园林） | ch01 | song_north |
| 杭州 | `song` 南宋临安（凤凰山宫城、御街、西湖在城外、雷峰 / 保俶 / 六和塔、苏堤白堤） | ch02–03 | song_southern（基线） |
| 杭州 | `ming_early` 明杭州（元末重筑城，雷峰塔未焚） | ch05 | ming_south |
| 杭州 | `ming` 明杭州（雷峰塔嘉靖焚余砖身） | ch06–07 | ming_south |
| 杭州 | `qing` 清杭州（城西湖滨旗营） | ch08–09、ch11–14 | qing_south |
| 南京 | `ming` 明应天府（不规则京城、东侧明故宫、大报恩寺塔、玄武湖、钟山） | ch05–07 | ming_south |
| 南京 | `qing` 清江宁府（明皇城改江宁满城、故宫残墙） | ch08–09、ch11–14 | qing_south |
| 大理 | `dali` 羊苴咩城（只筑南北两墙、苍山洱海为屏，崇圣寺三塔、五华楼） | ch01–02 | song_dali（基线） |
| 襄阳 | `song` 南宋襄阳（宽护城河、夫人城、隔汉水与樊城、浮梁） | ch03 | song_southern（基线） |

**第三批（各章「都城」补齐，2026-10-11）**：清单由脚本从已提交的 `docs/design/map/cities.yaml` 取 `eras.chNN.status == 都城` 且 manifest 无该章的（城, 章）组合，共 41 组、19 城，全部覆盖：

| 城 | era | 章节 | 套件 |
|---|---|---|---|
| 拉萨 | `tang` 吐蕃逻些（大昭寺、小昭寺、红山宫；无布达拉宫） | ch10 | tubo |
| 拉萨 | `ganden` 甘丹颇章（1644，布达拉宫未重建；哲蚌寺甘丹颇章、色拉寺） | ch07 | tubo |
| 拉萨 | `qing_early` 白宫已成、红宫未建（1685）+ 雪城宫墙、龙王潭 | ch08 | tubo |
| 拉萨 | `qing` 白宫 + 红宫（1690–1694）+ 龙王潭琉璃亭 | ch09、ch11 | tubo |
| 拉萨 | `qing_mid` + 罗布林卡格桑颇章（1751） | ch12–14 | tubo |
| 太原 | `tang` 北都晋阳（西城 / 中城 / 东城跨汾、晋阳宫） | ch10 | song_north（代用） |
| 银川 | `xixia` 西夏兴庆府 / 中兴府（宫城西北、里坊、承天寺塔；民居平顶土屋） | ch01–02 | liao_jin_north + xiyu 平顶件 |
| 辽阳 | `liao` 辽东京（天福城八门、宫城东北隅、汉城南北市看楼） | ch01 | liao_jin_north |
| 辽上京 | `liao` 上京临潢府（北皇城大内、南汉城不设敌楼、横街对峙楼、回鹘营） | ch01 | liao_jin_north |
| 大同 | `liao` 辽西京（四门十字街、北魏宫垣双阙、华严寺、善化寺） | ch01 | liao_jin_north |
| 商丘 | `song` 宋南京应天府（京城六门、隔城、东关城、宫城归德殿、书院） | ch01 | song_north |
| 阿城 | `jin` 金上京会宁府（南北二城横竖相连、皇城在南城西部、1183 包砖） | ch02 | liao_jin_north |
| 洛阳 | `jin` 金中京金昌府（小城 + 城西隋唐宫城废墟，待考） | ch02 | liao_jin_north |
| 和林 | `ordo` 大汗斡耳朵（1235 年前毡帐之都） | ch02 | mongol |
| 和林 | `city` 和林城（1235 筑城、万安宫在城南端、大佛塔寺、回回 / 汉人两区、四门四市） | ch03 | mongol + xiyu / yuan_north |
| 沈阳 | `houjin` 盛京（井字街九宫格、皇宫居中、大政殿八角殿、八门） | ch07 | qing_north |
| 沈阳 | `qing` 盛京奉天府（1680 圆形外城「内方外圆」、城外四塔） | ch08–09、ch11–14 | qing_north |
| 成都 | `daxi` 大西西京（大城斜 30°、萧墙与蜀王府皇城正南北三城相套、金河） | ch07 | ming_south |
| 九江 | `chenhan` 陈汉江州（临江城、浔阳楼、甘棠湖、庐山；待考） | ch04 | yuan_south |
| 昆明 | `dali` 鄯阐东都（东西寺塔、滇池、盘龙江；城郭待考） | ch01–02 | song_dali（基线） |
| 吐鲁番 | `gaochang` 高昌回鹘王都（不规则外城、内城、可汗堡、大佛寺、火焰山） | ch01 | xiyu + tubo 佛寺件 |
| 喀什 | `karakhanid` 喀喇汗王朝都城（待考） | ch01 | xiyu |
| 莎车 | `said` 叶尔羌汗国初（待考） | ch05 | xiyu |
| 莎车 | `khanate` 叶尔羌汗国都城 + 阿勒屯清真寺与汗族王陵（待考） | ch06–07 | xiyu |
| 伊宁 | `almaliq` 阿力麻里（市井流水交贯、西果园、回汉杂居；城郭待考） | ch03–04 | xiyu + yuan_north / mongol |
| 伊宁 | `gulja` 准噶尔汗庭毡帐 | ch08–09 | mongol |
| 伊宁 | `gulja_temple` 汗庭 + 固尔札庙（金顶寺，三层缭垣）+ 海努克庙（银顶寺） | ch11 | mongol + qing_north 殿件 |
| 西宁 | `qingtang` 唃厮啰青唐城（湟水南岸；待考） | ch01 | tubo |

首批、第二批之外的其余章节，该城回退分档图标（宁缺勿滥）。标「待考」的条目在规格 `notes` 与 manifest `notes` 写明哪些只按地望示意。

### 缺件与代用（未出单体建筑图）

- 大雁塔 / 小雁塔：套件无方形唐塔 → 取作者已审基线 `baseline/building-map/bld_lm_ch01_chongshengsi_pagoda`（方形砖塔）；大雁塔纵向压缩 0.62 表现敦实阶梯轮廓，小雁塔用原比例。
- 天坛祈年殿（大享殿）与圜丘、元仪天殿：套件无圆形殿 → 程序墨线画三层圆台 + 三重檐（`proc: round_hall / round_altar`）。
- 武周明堂（通天宫）、天枢铜柱：套件无此形制 → 程序墨线（`proc: mingtang / pillar`）。雷峰塔焚余砖身：同年代塔件截去上部 45% 加废墟色调。
- 五华楼（大理）、谯楼（襄阳）、镇海楼 / 鼓楼（杭州、南京）：借同年代或宋北方 tile 城门楼件。
- 北海白塔、妙应寺白塔（明清档）：明 / 清套件无覆钵塔 → 借元北方套件同型覆钵塔件；钟鼓楼 / 蓟丘楼 / 中心阁：借同年代 tile 套件城门楼件（砖台 + 楼阁）。
- 金中都宫殿废墟、遗迹散件：map/kit 遗迹件 `ico_map_kit_yiji_01/02` 以废墟色调摆放。
- 第三批：布达拉宫 → 吐蕃套件 `palace_hall` 三件叠于红山南坡（白宫白墨、红宫赭红墨），红山 / 药王山 / 哲蚌、色拉后山用 map/kit 山形件；沈阳大政殿、龙王潭琉璃亭 → 程序八角殿；昆明东西寺塔 → 崇圣寺方形密檐塔基线件；辽阳看楼、辽上京横街对峙楼、大同北魏双阙、盛京钟鼓楼与凤凰楼、成都承运门 → 同年代 tile 城门楼件；九江浔阳楼 → 元南方套件酒楼件；西夏民居（史载平顶土屋）→ 西域套件平顶件；高昌回鹘佛寺与可汗堡、固尔札庙塔 → 吐蕃套件佛殿 / 宫殿 / 塔件；固尔札庙、海努克庙大殿（内地工匠所建）→ 清北方殿件；毡帐、汗帐 → 蒙古套件，白墨示毡、金墨示汗帐。均未出单体建筑图。

### 已知限制

- 规格坐标为史料尺寸 + 现代地名推定，不是考古测绘；宫殿、门楼、塔等标志建筑放大约 5–8 倍才能在 56–180 px 的显示宽度上辨认。
- 都城小景宽 10–12 网格，会盖住近旁小节点（如长安 / 西安盖住咸阳、北京东缘接近天津卫）；节点图标与名字由运行时画在小景之上。
- ch10 地图数据仍是清初名录（AR-113 第 6 条已记年代数据缺口），小景按 AR-26 画唐代 / 武周。
- 第二批城墙折点按史料尺寸与现代地名推定（开封、洛阳、大理、襄阳为拓扑示意；南京、杭州按城门地名定位），城外塔寺距离多有压缩，均在规格 `basis` 注明。
- 第三批「待考」：喀什、叶尔羌（两档）、阿力麻里、青唐、江州、鄯阐城郭与金中京洛阳只按地望与少量史料示意（门数、门位、宫室形制无据）；拉萨三大寺与罗布林卡、盛京外城半径、西夏贺兰山与黄河、晋阳西山、高昌火焰山等距离压缩；晋阳、高昌、阿力麻里故址与节点（今城）相距 20–40 km，小景仍锚在节点。
- 第三批渲染器改动（平顶墩台、`lift_px`、八角殿、河流 `foot_px`、`ref_use`）只在新键出现时生效，首批、第二批 25 张逐字节不变；第二批大理、杭州（南宋）、襄阳三条规格补了 `ref_use`，只改 manifest `references[].use` 的措辞（原把基线建筑件误写成「方形砖塔件」），图不变。
