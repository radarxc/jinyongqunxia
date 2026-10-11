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
- `landmarks[]`：标志建筑，`sprite` 指套件件（默认本档 `kit`；`bld:<kit>/<件>`、`tile:<件>`、`map:<kit 件>`、`baseline:<件>` 跨目录取件；`song_southern` / `song_dali` 套件只在作者已审基线 `baseline/building-map/`，按套件名自动回退），`size_px` 为交付图上的包围盒宽（地图尺度下故意放大才可辨），`crop_top` 截去上部（焚余塔身）；`proc` 为程序画的圆殿 / 圜丘 / 明堂 / 天枢。
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

第二批只画任务点名的年代，其余章节该城回退分档图标（宁缺勿滥）。

### 缺件与代用（未出单体建筑图）

- 大雁塔 / 小雁塔：套件无方形唐塔 → 取作者已审基线 `baseline/building-map/bld_lm_ch01_chongshengsi_pagoda`（方形砖塔）；大雁塔纵向压缩 0.62 表现敦实阶梯轮廓，小雁塔用原比例。
- 天坛祈年殿（大享殿）与圜丘、元仪天殿：套件无圆形殿 → 程序墨线画三层圆台 + 三重檐（`proc: round_hall / round_altar`）。
- 武周明堂（通天宫）、天枢铜柱：套件无此形制 → 程序墨线（`proc: mingtang / pillar`）。雷峰塔焚余砖身：同年代塔件截去上部 45% 加废墟色调。
- 五华楼（大理）、谯楼（襄阳）、镇海楼 / 鼓楼（杭州、南京）：借同年代或宋北方 tile 城门楼件。
- 北海白塔、妙应寺白塔（明清档）：明 / 清套件无覆钵塔 → 借元北方套件同型覆钵塔件；钟鼓楼 / 蓟丘楼 / 中心阁：借同年代 tile 套件城门楼件（砖台 + 楼阁）。
- 金中都宫殿废墟、遗迹散件：map/kit 遗迹件 `ico_map_kit_yiji_01/02` 以废墟色调摆放。

### 已知限制

- 规格坐标为史料尺寸 + 现代地名推定，不是考古测绘；宫殿、门楼、塔等标志建筑放大约 5–8 倍才能在 56–180 px 的显示宽度上辨认。
- 都城小景宽 10–12 网格，会盖住近旁小节点（如长安 / 西安盖住咸阳、北京东缘接近天津卫）；节点图标与名字由运行时画在小景之上。
- ch10 地图数据仍是清初名录（AR-113 第 6 条已记年代数据缺口），小景按 AR-26 画唐代 / 武周。
- 第二批城墙折点按史料尺寸与现代地名推定（开封、洛阳、大理、襄阳为拓扑示意；南京、杭州按城门地名定位），城外塔寺距离多有压缩，均在规格 `basis` 注明。
