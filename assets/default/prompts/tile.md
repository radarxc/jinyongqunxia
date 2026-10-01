# default · 城镇底图贴片提示词

> 用途：城镇底图贴片的可复用出图模板；风格依据 `assets/default/STYLE.md`。
> 布局与清单归属 `design/22`，ID 规则见 `tech/07` §1.4；不在本文重定义城镇规则。
> 当前基线为 64 张 `candidate`：原 60 张中江南水面 4 张重出，另增大理水面 4 张；缺形按样例城成图需要叠加或后补。

## 1. 风格与年代

- 写实古风、低饱和自然材质、细颗粒、柔和环境光；地表不能比角色更醒目。
- 大理国约 1093：暖褐夯土、灰褐土路、低矮草地、克制木石构件；植被以阔叶树和茶花意象为候选。具体种类与栽植位置 **（待考）**。
- 南宋临安约 1223：青灰砖、石板、灰绿色河渠、木桥与石木驳岸；御街铺装为项目美术选择 **（原创扩展）**，不声称精确复原历史砖制。
- 同类贴片保持材质、色调和纹理尺度一致；避免醒目单物件、大裂缝、脚印、强方向纹样或中央亮斑。
- 参考已通过的建筑基线时统一木石质感；清式角楼只能参考材质，不能作为宋代门楼形制依据。

## 2. 视角、像素与光源

| 项 | 目标 |
|---|---|
| 相机 | 正交、偏航 45°、俯仰 30°；2:1 投影，无透视汇聚 |
| 基础格 | 64×32 px 菱形；地面与边件均直接使用此尺寸 |
| 平面轴 | 两轴投影斜率 `±0.5`；方向按布局约定 |
| 精灵 | 门、墙、桥、植物、影使用实际像素尺寸；逻辑占地由 `tile.footprint` 登记 |
| 锚点 | 基础格默认中心 `[32,16]`；精灵在 `anchor_px` 登记对应底面参考点 |
| 光 | 画面左上，短软影向右下；地面仅微弱形体明暗，无渐变暗角 |
| 透明 | PNG 真 RGBA；菱形外透明；独立物件轮廓完整、四周有透明留白 |
| 接缝 | 地面平铺边可触边；边件沿格内边界叠加，中心透明 |

成品按原生尺寸存入 `baseline/tile/<id>.png`，不另加大幅透明画布。方向性对象不旋转单张图片冒充不同视图。

## 3. 占位符

| 占位符 | 含义 |
|---|---|
| `{ERA}` / `{CITY_YEAR}` | `song_dali` / `song_southern` 与城市年代 |
| `{ASSET_TYPE}` / `{VARIANT}` | 沿用清单基名和已有变体；新 ID 先搜索仓库防重名 |
| `{MATERIAL}` / `{PALETTE}` | 材质、同类固定色调与颗粒尺度 |
| `{FOOTPRINT}` / `{ROTATION}` | 规划格整数占地与对象方向 |
| `{MASK}` / `{DRY_EDGES}` | 数字邻接 mask 与非同类邻边 |
| `{HEIGHT_M}` / `{ANCHOR}` | 高度目标与底面锚点；目标和实测分开描述 |
| `{REFERENCE_ROLE}` | 输入图是风格参考，还是需要保留内容的编辑目标 |

## 4. 地面模板

```text
Use case: historical-scene.
ONE reusable ground tile, {ASSET_TYPE} {VARIANT}, {CITY_YEAR}.
Only flat homogeneous {MATERIAL} in {PALETTE}; quiet fine texture, uniform illumination.
Orthographic yaw45 elevation30, exact 2:1 diamond top plane, no thickness or bevel.
Complete diamond centered with transparent margins; no side faces or border shadow.
Same material, color and scale on every edge; seamless beside itself and family variants.
Soft upper-left light, any tiny shadow lower-right; no gradient or central highlight.
Realistic ancient Chinese material, designed to become a 64x32 pixel tile.
True transparent RGBA outside the diamond. ONE image, ONE tile, no sprite sheet.
No text, watermark, modern object, painted checkerboard, UI, focal object, plant clump,
footprint, large crack, strong repeated motif, ink wash or cartoon.
```

土路基础变体不烘焙醒目车辙。水面改用下节的方形纹理源图流程，避免直接生菱形后缩小丢失波纹。

### 4.1 水面：俯视源图与错位取样（2026-09-30 重出）

每城一张源图，各生成四张静态变体；江南用于运河 / 西湖，大理用于桃溪 / 洱海。城市水色为美术选择 **（原创扩展）**，静态变体不视为可循环动画。

```text
Use case: photorealistic-natural.
ONE opaque full-bleed 1024x1024 SQUARE water texture, strict orthographic TOP-DOWN.
Seamless tileable on BOTH axes; continuous left/right and top/bottom boundaries,
compatible corners, no border. Calm realistic ancient Chinese town water only.
Visible delicate short irregular wind ripples with gentle colored specular shimmer;
fine sinuous wavelets, uniform density, moderate LOCAL contrast, no flat-color swatch.
Uniform overall luminance under soft overcast light; no large light/dark patches.
Jiangnan: subdued green-grey jade, target mean RGB(104,128,117).
Dali: subdued blue-green grey, target mean RGB(96,126,126), slightly cooler.
No whitecaps, foam, white waves, object/sky/cloud reflections, shore, boats,
trees, rocks, leaves, fish, underwater objects, caustics, text, watermark or grid.
No horizon, perspective, vignette, bright center, strong repeating geometric pattern.
```

每次只使用对应城市的一行色调描述；目标色不冒充实测色。实际完整提示词见对应 manifest 条目。
源图细节须在最终 64×32 中仍可辨；不再要求“亮度差小于 3%”或“缩略图近似纯色”。
先用 PIL `ImageChops.offset(source,512,512)` 把四边移到中心目视检查，再检查同城四变体的 3×3 混排；若出现十字缝、明暗格或波纹丢失则重出，遵守本轮最多 3 候选限制。
本轮两城各首候选通过目视检查；工具实际返回 1254×1254，以 Lanczos 等比缩至 1024×1024，`source_copy` 是此规格化副本，不是原字节副本。
两组均取 512×512 窗口，只选平均色接近的不同位置，不调色、不补画波纹；位置和实测见 `baseline/tile/qa/water_checks.json` 与任务报告 §7。
可复核的偏移图、原生 3×3 图及 1×/2×检查页放在 `baseline/tile/qa/`；它们是诊断图，不登记为游戏资产。

## 5. 河岸 / 路缘模板

```text
Use case: historical-scene.
ONE transparent isometric EDGE OVERLAY, {ASSET_TYPE}, {VARIANT}, mask {MASK}.
Only thin bank/road shoulder along {DRY_EDGES} bordering dry/nonmatching neighbors.
Center and water/brick/road filling stay transparent, alpha=0; renderer supplies {MATERIAL} below.
N is screen upper-right, E lower-right, S lower-left, W upper-left.
Use the reference only for color and scale, without copying its filled center.
Keep the shore inside the 2:1 diamond, with endpoints meeting adjoining edge pieces.
Thin quiet earth/stone transition, no cliff, pedestal, tall grass or dark outline.
Orthographic yaw45 elevation30, upper-left light, lower-right shadow, true RGBA.
No text, objects, white backdrop, painted checkerboard or extruded sides.
```

沿用邻接位 `N1 NE2 E4 SE8 S16 SW32 W64 NW128`；对角仅在相邻两正交均存在时保留。
已有干边方向及 mask：`N124 E241 S199 W31 NE112 SE193 SW7 NW28`。缺少的岸线形状可由渲染器叠加八向边件，或按成图需要补图；不要求本批覆盖完整 47-mask。

## 6. 桥、墙、门与自然物模板

```text
Use case: historical-scene. ONE isolated {ASSET_TYPE} {VARIANT}, {CITY_YEAR}.
Footprint {FOOTPRINT}, rotation {ROTATION}, height target {HEIGHT_M}.
Orthographic yaw45 elevation30, ground axes slopes +0.5/-0.5, vertical posts stay vertical.
Realistic restrained {MATERIAL}, {PALETTE}; period concept, not measured reconstruction.
Soft upper-left light, short lower-right shadow; complete silhouette with transparent margins.
True RGBA; transparent gate opening; no miniature pedestal or surrounding scenery.
No labels, characters, plaques, watermark, modern fittings, fisheye or vanishing point.
```

门楼、墙段和桥按实际图像放置并登记锚点；门洞宽度与网格、墙件接缝留给样例城装配调整。
树、灌木、芦苇不带整块土地；物种仍按时代意象处理。接触影为半透明遮罩，不含建筑实物。

## 7. 参考图与入库字段

1. 本地参考先用 `view_image` 查看；把实际输入 `image_gen` 的图逐一记入 `references`，只阅读文档或目视比较不算参考输入。
2. 可输入已通过建筑基线或同类贴片锁定气质；编辑时写明目标与风格参考的不同用途，以及需保留的材质、方向和透明孔。历史参考不随包保留时，在 `references` 留下原路径、哈希与说明，不清空真实使用记录。
3. 物件 / 直接菱形贴片逐张调用内置 `image_gen`，使用 `transparent_background:true`；水面按 §4.1 每城一张不透明源图，使用 `false`，四成品共享真实源记录。完整实际提示词写入 manifest，未知模型或 seed 不编造。
4. `source_path` 保留工具返回位置；`source_copy` 指向 `source/` 中本条选中的源图，`source_sha256` 按该文件实测。仅保留选中源图。
5. 源图过大导致目录超过 150 MB 时，可统一等比缩至长边不超过 2048 再保存，重算 `source_sha256`，在一行 `notes` 说明；不把缩小副本称为原字节副本。
6. manifest 顶层为列表，仅保留 `assets/README.md` 规定字段，加 `tile: {kind, footprint, variant, autotile_mask}`、`source_copy`、`source_sha256`；精灵另有 `anchor_px`。
7. `file` 直接为根目录 `<id>.png`；`size`、`sha256` 对应该成品实测；全部保持 `status:candidate`，`notes` 只用一行概述用途、处理及限制。

## 8. 几何后处理与质检

1. PIL 实测源图模式与 alpha；假棋盘背景不算透明。几何处理仅裁切、缩放、投影和透明修边，不重绘材质或调色。
2. 直接生成的菱形地面取精确 2:1 裁框并等比缩至 64×32；边件保留完整格坐标。水面方形取样以归一坐标 `u,v∈[0,1]` 投影为 `x=32+32(u−v), y=16(u+v)`；先 4×超采样仿射，再缩至 64×32，最后加精确菱形 alpha。滤波从源图周期延拓取色，避免透明黑边参与采样。
1. PIL 实测源图模式与 alpha；假棋盘背景不算透明。默认几何处理仅裁切、等比缩放和透明修边，不重绘 RGB；审核批准的仿射例外须保留输入、矩阵、输出哈希与复验测点，且仍为candidate。
2. 地面取精确 2:1 裁框并等比缩至 64×32；边件保留完整格坐标，不因非对称轮廓裁紧后重新居中。
3. 地面透明修边可清零 `abs(x+0.5-32)/32 + abs(y+0.5-16)/16 > 1` 的外部像素；不填补内部缺口。
4. 当前 28 张地面中，原 20 张非水地面的 alpha 阈值处理保持既有结果：`a>=250` 置 `255`，`a<=5` 置 `0`，其余不变。本轮 8 张水面按像素中心菱形掩码，内 `255`、外 `0`，各 1024 像素；保存后重算 `sha256`。边件与精灵不套用此阈值。
5. 精灵保留实际画布与底面参考点；如等比缩放或裁边，同步换算 `anchor_px`，确保门、墙、桥、树冠未裁切。
6. 原图与成品查看视角、左上光、年代意象、轮廓与透明底；PIL 实测成品尺寸、RGBA、alpha 范围，并核对文件哈希。
7. 同图与同类混排检查接缝、颜色跳变和强重复；水面按 `(+32,+16)` / `(-32,+16)` 平移，用 `[[1,2,4],[3,4,1],[2,3,2]]` 混排并验证菱形覆盖无透明裂缝。源图偏移与成品混排分别验收；目视无明显接缝不等于任意两边逐像素相等。接触影保留其半透明用途。
8. 处理概要写入一行 `notes`；具体本次清理与 alpha 处理写入任务报告，不把过程字段或诊断附件带入 manifest。

```bash
python3 tools/agents/check_assets.py assets/default/baseline/tile --min 40 --max 70 --min-side 32
python3 tools/lint/check_ids.py --strict
```

## 9. 明 · 江南套件（`ming_south`）

本批新增7件，放 `assets/default/tile/ming_south/`，复用宋江南写实木石质感和细节密度，增强明代砖砌防务与江南石桥意象。所有条目保持 `candidate`，只交原向一张，不冒充完整四向 / 全自动接缝家族。

| kind / 变体 | 内容 | 逻辑占地 | 差异 |
|---|---|---|---|
| city_gate / k4_r000_v01 | 净宽4格城门 | `[8,4]` | 厚灰砖门墩、石基、灰瓦楼体 |
| city_gate / k6_r000_v01 | 净宽6格城门 | `[10,4]` | 加宽中央通行孔，不拉伸小门PNG |
| wall / brick_r000_v01 | 直墙段 | `[1,1]` | 灰砖直墙，平顶无垛口 |
| wall_corner / outer_ne_v01 | 城墙转角 | `[2,2]` | 与直段统一砖色，独立转角轮廓 |
| bridge / stone_w5_l10_r000_v01 | 单孔石拱桥 | `[5,10]` | 花岗岩、分节拱券；整桥静态候选 |
| tree_cluster / willow_v01 | 柳树 | `[3,3]` | 柔垂枝叶，无整块土地 |
| tree_cluster / bamboo_v01 | 竹丛 | `[2,2]` | 疏密竿叶、无花盆或整块地台 |

门按 `design/22` §4.3：`footprint=(k+4)×4`、`passage=k×4`，两侧各2格门墩；4格门地面外包384×192px，6格门448×224px（`32(w+h)` / `16(w+h)`）。第4轮已按控制点复算明江南两门，净孔实测4.000/6.000格；墙、桥、植物占地沿用宋贴片同构 **【建议值】**。

```text
One isolated Ming Jiangnan {gate / wall / stone arch bridge / plant} sprite.
Match Song southern realistic matte wood, brick and stone, same detail density.
Orthographic yaw45 elevation30, exact2:1 ground axes +0.5/-0.5.
Upper-left light, short lower-right contact shadow, true RGBA transparency.
Complete silhouette; gate passage and space under bridge arch stay transparent.
No people, text, scenery, painted checkerboard, modern fittings or Qing ornament.
```

年代造型均 **（原创扩展）**：南京明城墙只提供厚城台与砖砌门道母题，不把缩小门楼冒称完整聚宝门 / 瓮城测绘；灰瓦门楼为概化重构。桥取明代江南单孔石拱桥母题。柳与竹为地方植物意象，具体历史栽植点位 **（待考）**。默认按底面 / 根部 `anchor_px` 放置；桥含栏杆的整图仅用于静态预览，单位遮挡分层、墙段连接和门洞碰撞仍 **（待实测）**。

来源（访问2026-09-30）：南京城墙保护管理中心《[天下第一瓮城——南京城墙中华门](https://wlj.nanjing.gov.cn/ztzl/mcq/gzqk/202302/t20230228_3838766.html)》；苏州市地方志《[木渎古镇的桥](https://dfzb.suzhou.gov.cn/dfzb/fzxh/201009/cee41a477c3040f99780877eaf61c72d.shtml)》（搜索返回相关全文，直开失败）；苏州市园林局《[建筑](https://ylj.suzhou.gov.cn/szsylj/ylys/201903/484421d38f504f5787a8f307925e3ad7.shtml)》。本任务不引入新的技术版本、价格或浏览器支持声明。
## 9. 元末江南贴片 · `yuan_south`（2026-09-30）

本套输出目录为 `assets/default/tile/yuan_south/`，采用 `tex_town_yuan_south_*`，每项一图、全部 `candidate`。保留宋套件朴素砖石、灰瓦、低饱和自然色和细节密度；江南旧河网不随元代标签重铺成北方城。城门、城墙与桥为匿名形制意象 **（原创扩展）**，精确元末制式 **（待考）**。

| 项 | 差异与契约 |
|---|---|
| 城门两座 | 净宽 `k=4/6`，外占地 `(k+4)×4=8×4/10×4`，通行孔 `k×4=4×4/6×4`，两侧各2格门墩；引用 `design/22` §4.3，不将外宽当净宽 |
| 城门造型 | 灰砖门墩、完整单体灰瓦木门楼、可见贯通孔；不照抄明清巨型瓮城群或当代复建盘门门楼；实际孔宽像素须逐图复核 |
| 墙直段 / 转角 | 灰砖与朴素压顶、与门墩色材一致；分别交付独立直段及角件，接缝和遮挡仍待装配验证 |
| 桥 | 沿用江南石桥母题，交付石梁桥面 `bridge_deck`；水从底图提供，本件不夹带一块水景，不冒充完整桥栏与四向桥系列 |
| 植物两种 | 柳树与芦苇，低饱和叶色；只是河岸母题，未以当代植物分布证明元末具体栽植点或品种 |

```text
ONE late Yuan Jiangnan {kind} town-map sprite, circa 1350, anonymous historical-inspired composition.
Match the supplied Song reference's realistic muted grey masonry, grey tiles, weathered timber and restrained detail density.
Orthographic yaw45 elevation30; 2:1 ground grid with slopes +0.5/-0.5; {footprint} clear ground interface and bottom-plane center anchor.
For a gate: complete tiled timber gatehouse over brick piers, ONE open passage {k} cells wide, two-cell pier on each side, depth4 cells.
True transparent RGBA outside the object; upper-left daylight, short lower-right contact shadow; complete uncropped silhouette and transparent margins.
No text, modern ornaments, complete landscape, opaque backdrop, copied Qing reconstruction, fake checkerboard or excessive shadow halo.
```

每项独立内置 `image_gen` 调用并启用真透明，最多2候选择1；源图、实际完整提示词、源SHA、选取理由、裁框 / 等比缩放 / 偏移和成品SHA登记。逐张 `view_image(detail=original)` 检查；本套只做几何规格化，**不沿用§8地面alpha阈值或水面仿射投影**，不镜像或扭曲墙门以冒充四向。门楼与地面通行孔的碰撞分工只引用 `design/22` §4.3；贴片 alpha 不能代替逻辑通行掩膜。

城门底面目标包围宽高分别为 `32(8+4)×16(8+4)=384×192px`、`32(10+4)×16(10+4)=448×224px`；屋顶向上外扩，PNG画幅不等于占地。其他贴片占地见各条 manifest **【建议值】**。`autotile_mask:null` 表示手动选件，不能解释为完整自动拼接47形集。单视图仅用于本方向预览，墙角接缝、孔净宽、桥头接路和植物不挡门均 **（待实测）**。

参考资料（2026-09-30访问）：[苏州市志办《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)用于辨别现存盘门元代重建、明清续修与现代门楼的边界；[上海市青浦区博物馆《顺德桥》](http://museum.shqp.gov.cn/museum/ql/20190304/479101.html)用于确认元至正三年江南三跨石梁桥的形制记录，但本批平桥只取石梁材质母题，不复原其三跨、栏板和后世重建状态。植物来源见本任务报告§7。网页文字研究不等于图片输入，实际图像参考以各条 `references` 为准。

## 10. 待决事项与默认值

| 事项 | 默认值 |
|---|---|
| 元末江南墙门、桥与植物是否按城市精修 | 默认匿名候选，净宽4/6遵循逻辑掩膜，具体图像孔对格与接缝后续联调；不当作精确元代复原或四向完成 |
| 60 张上限与两城完整变体数量冲突 | 已解决：原 60 张基线继续保留；本次授权新增大理水面 4 张，共 64 张，检查上限改为 70；其他缺形仍按成图后补 |
| 64×32 与检查器短边 512 冲突 | 已解决：短边门禁为 32，`file` 直接指原生尺寸成品，见§7–§8 |
| 接触影必须含 255 与半透明用途冲突 | 保留半透明接触影；地面阈值不用于影子，不添加实心黑点，保持 candidate |
| 桥 / 墙 / 植被清单未冻结全部占地 | 沿用每条 `tile.footprint` 的 **【建议值】**；装配按实际精灵与锚点调整 |
| 两城植被 `prp_*` 与本批 `tex_town_*` 对接 | 已解决：沿用 design/22 §4.4 的独立交付分工，不新增隐式 alias |
| 无缝颜色、门楼孔与斜率未通过 | 水面已完成偏移与 3×3 目视检查（见 TOWN-tiles-water 报告 §7）；其他地面接缝、门洞对格和墙件接缝仍保留原限制，按样例城效果后补 |
| 风格、意象年代与植物可读性 | 保持 candidate，交作者审批；未回复不视为 approved |
| 水面纹理方向与运行时接缝 | 默认静态错位取样；仍有自然波向，远近缩放及 GPU 采样表现 **（待实测）**，不承诺逐像素周期等边 |

## 10. 宋 · 北方中原贴片 `song_north`

此套件服务约1093年的开封 / 洛阳 / 大名城镇意象；地形、布局和运行时碰撞继续引用 `design/22` §1、§4.3，不在素材模板新增玩法。匿名门楼、压缩墙高、木桥和植物组合均为**（原创扩展）**；完整实发提示、实际输入参考、来源路径及SHA登记在 `tile/song_north/manifest.yaml`。

### 10.1 年代要点与清单

北宋东京顺天门考古资料支持夯土墙身与门区包砖，故墙件采用夯土层理、局部灰砖压顶，门墩采用灰砖；不统一套明清全包砖高城墙。历史顺天门为一门三道，本批单孔门只是拼装简化，不能称顺天门复原。木桥取汴水贯木拱的结构意象，无水中桥墩；不是复建景区虹桥的复制品。

| ID 后缀（均加 `tex_town_song_north_`） | kind / footprint / variant | 制作差异 |
|---|---|---|
| city_gate__k4_r000_v01 | city_gate / `[8,4]` / k4_r000_v01 | 标称净宽4，灰砖双墩、灰瓦低楼 |
| city_gate__k6_r000_v01 | city_gate / `[10,4]` / k6_r000_v01 | 标称净宽6，较宽门楼；非同图缩放 |
| wall__earth_r000_v01 | wall / `[1,1]` / earth_r000_v01 | 黄褐夯土、局部灰砖压顶 |
| wall_corner__outer_ne_v01 | wall_corner / `[2,2]` / outer_ne_v01 | 同材质L形转角 |
| bridge_deck__w3_l6_r000_v01 | bridge_deck / `[3,6]` / w3_l6_r000_v01 | 整体木拱桥含栏杆，静态候选 |
| tree_cluster__willow_v01 | tree_cluster / `[3,3]` / willow_v01 | 单株垂柳，疏枝、低饱和绿 |
| tree_cluster__scholar_tree_v01 | tree_cluster / `[3,3]` / scholar_tree_v01 | 单株国槐意象，具体栽植史待考 |

`autotile_mask:null` 表示独立物件，不声明完整自动拼接邻接表。门楼朝南原向、仅r000；墙角仅所列一向，不能镜像假称补齐四向。桥为整件静态展示图，近栏遮挡未拆层。植物不替代 `design/22` §4.4 的 `prp_*`，须另由下游显式选用。

### 10.2 提示词差异片段

```text
Northern Song north-central China circa1093, realistic muted Song map-sprite style.
Gate: grey brick-faced piers, modest dusky red-brown timber pavilion, grey clay-tiled roof.
Earth wall: compacted yellow-brown layers, restrained brick coping, no Ming-Qing full cladding.
Bridge: small original timber arch, interlocking beam motif, wooden rails, no central water pier.
Willow/scholar tree: natural muted crown, single tree, root visible, no soil pedestal.
Orthographic yaw45 pitch30, ground axes +0.5/-0.5, upper-left light, short lower-right shadow.
True RGBA including open gate passage; no scenery, words, figures, checkerboard or cropped edges.
```

每件先view参考、逐张调用内置image_gen、最多2候选；仅裁原alpha非零框、等比LANCZOS、透明扩边。不能用RGB颜色抠图、alpha阈值或非等比变形修正本批精灵。源PNG的alpha=0隐藏RGB可能在某些预览里显出光晕，应检查实际alpha及合成效果，不能据此假判背景不透明。

### 10.3 几何、来源与待决

沿用§4.3城门公式：外占地 `[k+4,4]`，通道 `[k,4]`；k=4/6时底面理论包围框为384×192 / 448×224px，计算为 `32(w+h) × 16(w+h)`。墙1×1、角2×2沿用基线登记，桥3×6为**【建议值】**；植物3×3为冠幅放置包络，不是实心占地。

实际门楼仍有轴线、宽深比及门洞净宽残差，`gate.precise_mask_verified:false`；条目同时保留标称宽度、正面归一化孔宽比例和成品孔端点向量。比例估值不是64×32格实测净宽，不能把标称值当像素实测。墙角包络中心按可见端点推算；树锚为根，建筑贴片锚为底面包络中心。所有尺寸与锚点以manifest为准，不按透明画布宽再次缩放。

参考资料（访问2026-09-30）：[顺天门考古简报](https://www.hnswwkgyjy.cn/ueditor/php/upload/file/20220524/1653363795965934.pdf)仅核到检索摘录，未阅全文图版；[故宫汴水贯木拱虹桥研究](https://www.dpm.org.cn/study_detail/100191.html)已读网页；[Pillow Image文档](https://pillow.readthedocs.io/en/stable/reference/Image.html)核对裁切、RGBA及resize接口。完整建筑史来源及使用边界见任务报告§7。

开放问题默认值：沿用7件candidate作为风格候选；四向、精确门洞mask、墙角接缝、桥栏遮挡交总装另验**（待实测）**。两种植物的物种细部、季节和历史栽植位置**（待考）**；不默认批准，不修改上游schema枚举或城门碰撞规则。

## 10. 西域套件（xiyu，KIT-xiyu）

本节只补地域提示词差异，格网、锚点与墙门通行规则仍见 `design/22` §1、§4.3。成品在 `assets/default/tile/xiyu/`；逐张实际提示词、生成输入、源图哈希见其 `manifest.yaml`，初始提示词与改图记录见 `source/production-records.jsonl`。

- 地域依据：喀什、和田、叶尔羌绿洲城镇的土木 / 泥砖材料意象；不把今日修缮后的城门当作各年代史证。土城门、墙件、木桥及葡萄架具体构型均为 **（原创扩展）**，具体城市与年代适配 **（待考）**。
- 材料差异：暖浅赭土坯、泥抹面、少量露砖与草纤维；平顶、厚墙、素木，禁用宋式瓦顶门楼、清式彩画、现代景区招牌。保持宋贴片低饱和、写实细颗粒和左上光。
- 城门两档均取 `r000`，净宽 `k=4/6`；占地按上游 `[(k+4),4]`，即 `8×4/10×4`，两墩各 2 格；门洞下方须为真实透明，不绘门扇、铺地或堵孔阴影。本轮仅交这两张视图，不能旋转 PNG 冒充另外三向。
- 直墙 `1×1`、墙角 `2×2`、木桥 `3×5`、胡杨 `3×3`、葡萄架 `4×3` 为装配 **【建议值】**；桥是灌渠木梁桥意象，不启用港口。葡萄架含木柱与藤蔓，属于本地植物物件，不是新玩法建筑。
- 胡杨以塔里木河岸林物种为依据；葡萄架以绿洲庭院葡萄木架为意象。现代植物 / 庭院资料只支持地域辨识，不证明某年代城内的栽植位置或架高。

```text
Use case: historical-scene. ONE isolated Western Regions oasis town map sprite.
Kashgar / Hotan / Yarkand material vocabulary, original game reconstruction.
Realistic restrained painted materials, muted buff adobe, subtle straw-fibre plaster,
unpainted timber; match Song kit detail density, no Chinese tiled roof or painted pavilion.
Orthographic yaw45 elevation30, exact2:1 GROUND projection, axes slopes+0.5/-0.5.
Vertical posts vertical; upper-left light and extremely short lower-right shading.
{GATE: footprint(k+4)x4, empty passage kx4, solid2m piers, simple flat parapet.}
{WALL: flat flush top, thick earthen block; corner has no independent ground floor.}
{BRIDGE: complete modest timber beam bridge, transparent water-space below.}
{PLANT: Euphrates poplar OR timber grape arbor, muted foliage, no soil island.}
True RGBA alpha0 outside object and in openings, complete silhouette and margins.
No people, animals, text, modern fittings, floor platform, haze, glow or checkerboard.
```

后处理只裁边、等比缩放、补透明边；不强行拉伸为 2:1 画布，不重画门洞或墙身。尺度按原图可见底面左/右接触角点跨度匹配 `32×(w+h)`，锚点取两点中点；PNG 包围框只作裁切留白，不能把檐口、冠幅或包围框宽替代地面尺度。树单列冠幅建议值及根锚。模型输出的透明像素可带暖色 RGB；须以 alpha 和灰底合成检查，不能仅凭图片工具忽略 alpha 后的暖色外晕判断背景失败。灰底合成仅作临时 QA，不入 manifest 成品。

**验收边界**：七张均为 `candidate`。8 px 透明留边、真 RGBA、源图留存和哈希已检查；64×32 为目标尺度，手工估计的底面锚点、门洞净宽对格、严格 `±0.5` 斜率、墙件连续接缝仍待实际总装核对，不能把基础文件校验通过等同于几何验收。详见包内 `QA.md`。

已解决：第一轮六个硬体的轴向 / 比例告警通过第2轮逐张重出修复。当前木桥 `273×182`、葡萄架 `252×204`、直墙 `81×167` px；全部双轴进入 ±0.03 容差，最大比例误差 0.38%。两门、墙角及门孔量点见包内 `QA.md` 与 `source/round2/*-selected-qa.json`；历史 `geometry-qa.jsonl` 保留第一轮数据，胡杨不改。

第2轮几何差异提示：只输入按登记占地构造的实心参考，要求“texture-only; trace ALL polygon boundaries; preserve exact camera and corners”；两门为直墩、平顶土墙与木楣（原创扩展），门孔保持透明。参考图只约束生成，成图仍独立量点。直墙 / 墙角沿用名义高3 m，源图实测缩放后墙高差0.335 px；完整接缝仍待总装。

## 10. 明 · 北方套件 `ming_north`（2026-09-30）

本节只记录本套件的美术差异，墙门契约仍见 `design/22` §4.3；7 张成品、完整实际提示词与来源在 `assets/default/tile/ming_north/manifest.yaml`。全部 `candidate`，只交已绘的单方向，不旋转 PNG 冒充四向。

| 项 | 本套件取用与边界 |
|---|---|
| 年代 / 地域 | 明代北方府城意象；灰砖城垣、灰瓦门楼、克制朱木。不是北京、大同或西安任何一座具名城门的测绘复原 |
| 城垣 | 北京明城墙采用两侧城砖、中填三合土的史实作为材质依据；贴片只呈现外露灰砖，内部结构不另绘 |
| 城门 | 完整灰砖门墩、透空券洞、单檐灰瓦木楼；不用清式复杂角楼或金黄宫瓦。瓮城由布局拼墙，不画在门楼 footprint 外 |
| 尺寸 | 净宽 `k=4/6`，外占地 `(k+4)×4=8×4/10×4`，通行孔 `k×4`，两侧各2格门墩；都是 `design/22` §4.3 的目标建议值，不是历史尺寸 |
| 直墙 / 转角 | 沿宋基线同构逻辑占地 `1×1` / `2×2` **【建议值】**；3m 高为提示词目标。保留朴素平顶砖面，不把墙段画成带楼阁的整城 |
| 桥 | 小河渠平石桥面 `3×5` 格，沿用宋小桥占地 **【建议值】**，灰石替换木板 **（原创扩展）**；本图不含水面与桥栏，适用无栏小平桥的静态拼图 |
| 植物 | 国槐圆展冠、侧柏直立鳞叶冠，两者逻辑占地均 `3×3` 格 **【建议值】**；取北京乡土植物意象，具体明代栽植位置、树龄及树形 **（待考 / 原创扩展）** |

在 §6 模板中使用以下差异段；实际每次输入以 manifest 的 `prompt` 为准：

```text
Ming dynasty northern Chinese prefectural town, restrained realistic game sprite.
Grey city-brick facing, worn stone foot courses, weathered dark cinnabar timber,
intact single-eave grey clay tile roof; no Qing corner-tower silhouette or yellow roof.
Gate: footprint {K_PLUS_4}m by4m, piers2m each, clear through-passage{K}m by4m.
True alpha0 through the gate; no doors, tunnel floor, opaque darkness or scenery.
Barbican walls are separate layout parts; do not extend them beyond this footprint.
Wall: plain flat-top thick grey brick cell/corner; no roof or projecting pedestal.
Bridge: flat stone deck3m by5m, no water or rails baked into the deck sprite.
Guohuai: rounded spreading crown and small compound leaves, one visible root anchor.
Cebai: upright crown with tiny scale leaves in flat fans, not broadleaf foliage.
Orthographic yaw45/elevation30, ground axes +/-0.5, upper-left light.
Complete object on genuine transparent RGBA; no large soil platform or fake checkerboard.
```

宋参考图先 `view_image`，并作为实际输入登记哈希；转角及侧柏第二候选保留首候选编辑链信息。本次只用内置 `image_gen`，每图最多2候选。原图选中副本放 `source/`；`normalization-inputs.json` 记录提示词链和人工测量，`normalization.json` 记录裁框、等比缩放、像素锚与实测尺寸。

几何处理只裁切、等比缩放和透明留边，不绘制新像素图形、不做仿射纠正。门墙桥按人工判读的源底面水平跨度 `L` 缩放，`scale=32×(w+h)/L`；植物按冠幅4m / 3m的 `256/192px` 目标缩放 **【建议值】**，逻辑占地不当作可见土地台。四周另加12px透明边。源 alpha `>4` 仅用于找裁框、再外扩4px，不阈值改写保留区域的 alpha；缩放由标准重采样完成。

**限制与默认值：** 第2轮直墙、墙角底边已进入±0.03斜率容差，本轮逐字节保留。第3轮仅对双门及桥各重出2候选，均未通过，未用更差图替换原成品；6张失败候选与实测斜率存 `tile/ming_north/source/revision3/`，原成品测量仍见normalization.json。没有以裁切门体/桥体底角掩盖内部投影偏差。门洞净宽、门墩比例与墙件接缝尚未通过 `design/22` §9.3 的完整验收。人工像素锚不是测绘结果，不声称实现精确2:1或四向契约；默认供静态总装试贴，按试贴效果后补。两种植物逐字节保留，植物细部与年代栽植继续待考；侧柏选第二候选改善鳞叶可读性。保留 §9 全部既有待决条目。

历史与植物来源（均访问于2026-09-30）：

- [北京市文物局《明北京城城墙遗存》](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523514/index.html)：取明城墙砖包外立面与三合土内芯，不套用现存城墙尺寸。
- [北京市文物局《正阳门箭楼箭窗之谜》](https://wwj.beijing.gov.cn/bjww/362760/362770/623138/index.html)：取明正统四年修筑瓮城、箭楼与闸楼的体系；瓮城作为布局组件，不照抄现存箭窗与近代改建细部。
- [北京市园林绿化局《适宜北京地区节水耐旱植物名录》](https://yllhj.beijing.gov.cn/zwgk/sjfb/mlxx/202204/t20220418_2679549.shtml)：核实国槐与侧柏适合北京地区；该现代名录不证明某一明代地点曾栽植。

## 10. 元 · 北方套件补充（`yuan_north`）

本节用于 `assets/default/tile/yuan_north/` 的7件贴片，与 `prompts/building-map.md` §11的19张建筑配套。默认元末大都/北方路城母题；匿名城门、墙、桥和植物组合为 **（原创扩展）**，不声称大都、大同、开封三城完全同形，也不建立具名文物复原资产。原宋模板与§9待决条目保留。

### 10.1 本批清单与门洞契约

| ID（统一前缀 `tex_town_yuan_north_`） | `tile.kind` | 占地 | 变体 / 用途 |
|---|---|---|---|
| `city_gate__k4_r000_v01` | `city_gate` | 8×4 | 净宽4格完整城门 |
| `city_gate__k6_r000_v01` | `city_gate` | 10×4 | 净宽6格完整城门 |
| `wall__earth_r000_v01` | `wall` | 1×1 | 夯土直墙段 |
| `wall_corner__outer_ne_v01` | `wall_corner` | 2×2 | 外转角一向 |
| `bridge_deck__w4_l8_r000_v01` | `bridge_deck` | 4×8 | 完整小石拱桥；栏杆未分层 |
| `tree_cluster__scholar_tree_v01` | `tree_cluster` | 2×2 | 国槐意象 |
| `tree_cluster__oriental_arborvitae_v01` | `tree_cluster` | 2×2 | 侧柏意象 |

两门沿 `design/22` §4.3：净宽 `k`、两侧门墩各2格，故外占地 `(k+4)×4`，通行孔 `k×4`。源图应保留完整门墩、门洞、上部楼体与地面接口；孔内地面alpha为0，阴影不冒充实墙，门楼横梁可在孔上方遮挡。净宽是布局契约，生成PNG中的可见孔宽、进深和斜率仍须检查，不能凭文件名宣称精确对格。

除两座城门外，其余贴片占地及两树2×2视觉包络均为 **【建议值】**，不是历史尺寸或植物碰撞范围。完整桥单图只供静态装配候选；`bridge_deck`不表示已具备桥面/近栏独立遮挡层。两种植物属于本批贴片，不冒充 `design/22` §4.4的 `prp_*` 独立公告板，不创建隐式alias；古代物种栽植位置和株形仍 **（待考）**。

### 10.2 年代与提示词差异

- 墙件以灰褐夯土、层理与轻微风化表达元大都外郭墙；不得整段套用明清青砖包砌或直接生成明清正阳门。城门周边必要砖石加固是匿名设计概化，具体材料分布 **（待考）**。
- 门楼采用克制灰瓦木构、低饱和木色与土石门墩；不画浮夸重檐高塔、清式密集走兽、满墙和玺或金黄旅游景区屋顶。城门上部形制未获完整考古复原，继续标原创意象。
- 桥采用单孔石拱桥母题，完整桥体、透明拱洞、两端可接岸；不烘焙河流、大片堤岸、船只或道路。此处不绘万宁桥专属镇水兽与铭文，不称具名文物复制。
- 国槐用完整阔叶冠形，侧柏用克制常绿冠形；单件树/树簇保持基线写实细节密度，不带盆、厚土岛、现代园林灯或旁侧景观。植物古代分布不由当代景区照片证明。

增量提示词骨架如下；城门、墙、桥和植物须分别逐张调用，保存真实实发版本：

```text
Create ONE isolated Yuan northern-China {OBJECT} map sprite.
Match the supplied Song tile/building reference only for realistic matte material,
muted palette and detail density; replace regional features with {YUAN_FEATURES}.
Footprint {W} by {H} one-metre cells; target yaw45 elevation30 orthographic view,
2:1 ground axes +0.5/-0.5, upright verticals, no perspective convergence.
Upper-left light and a short soft lower-right contact shadow; true transparent RGBA.
Keep complete roof/edge/foliage, readable ground contacts and transparent margins.
For gates: clear passage {K}m wide through full 4m depth, two 2m-wide side piers;
opening and ground within passage must remain alpha0, no opaque backdrop or floor fill.
For walls: restrained rammed-earth material, no all-over Ming/Qing brick facing.
For bridge: ONE low single-arch stone bridge, transparent arch, no water or shore scene.
For vegetation: {SPECIES_MOTIF}, root contact visible, no pot or soil island.
No lettering, watermark, people, checkerboard, decorative pedestal or surrounding city.
Single r000 view only; no contact sheet and no rotated or mirrored view substitutes.
```

### 10.3 参考资料与限制

以下来源于 **2026-09-30** 联网读取正文，均作文字考据；不把“阅读来源”登记成模型实际输入图片：

| 来源 | 取用内容与限制 |
|---|---|
| [北京市文物局：元大都城墙遗址](https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1737418/1738088/1742737/523487/index.html) | 夯土城墙、木构加固及元末防御增建；避免明清整段包砖。遗址介绍不能复原已失城楼上部，更不证明每座路城同材同形。 |
| [杜仙洲《永乐宫的建筑》·山西省永乐宫壁画保护研究院转载](https://www.sxrcylg.cn/index.php?a=index&aid=1035&c=View&m=home) | 灰筒板瓦、单檐木构及土坯墙的时代参照；寺观宫门不是城市外城门，不能互相认作实物证据。 |
| [北京市文物局：万宁桥](https://wwj.beijing.gov.cn/bjww/362760/362767/2020nwhhzrycr/10812184/10815278/index.html) | 单孔石拱桥与漕运节点母题；现桥历经修缮，本批4×8为项目建议占地，不采用文物测量尺寸或宣称复原。 |
| [北京市政府：正阳门（中轴线）](https://www.beijing.gov.cn/renwen/rwzyd/gdwh/zym/202107/t20210706_2430351.html) | 仅作断代排除：现正阳门始建明代，其重檐外观不作元城门样本。 |

### 10.4 逐图登记与本批验收

逐项最多2候选选1；源图及成品均 `view_image` 自查。入选PNG真RGBA，`file/size/sha256`取成品实测；`source_path`记工具原始位置，随包源图与哈希可追溯。完整实发prompt、negative、实际references、调用时间和工具回执如实登记；不编造未披露的图像模型版本、seed或推理档位。

manifest逐条含 `tile: {kind, footprint, variant, autotile_mask}`；本批独立精灵的 `autotile_mask:null` 不表示完整自动拼接族已交齐。城门、墙、桥以实际底面中心点登记 `anchor_px`，植物以根接触点为锚。源图测点经裁切/等比缩放/扩边同步变换；不能用透明包围框底边代替根或底面中心。PIL只做这些纯几何处理，不将地面阈值规则套在本批精灵上，不warp、重绘或拉伸修正投影。

全部保留 `candidate`；宋基线清单当前也仍为candidate，本轮授权产图不等于作者批准上线。只交r000及转角一向，墙件接缝、门洞净宽、桥面碰撞/遮挡和两树实际装配均 **（待实测）**。若源图轴线偏扁或底面比例不准，记录真实测点和偏差，最多2候选后择优交付；不宣称严格2:1几何或无缝拼接已通过。不得旋转单PNG假称四向覆盖。

```bash
python3 tools/agents/check_assets.py assets/default/tile/yuan_north --min 5 --max 10 --min-side 32
python3 tools/lint/check_ids.py --strict
```

文件门禁不检验透明孔、光向、年代与投影，上述项必须另列目视/像素实测结论。默认沿用本节占地、材料母题和单视图候选范围；作者尚需确认植物选择、形制、门墙尺度与残余几何偏差，具体结果见本套件manifest和任务报告。
| 无缝颜色、门楼孔与斜率未通过 | 明江南门孔与斜率已在第4轮解决；其余套件的无缝颜色与接缝仍按各自记录后续实测 |
| 风格、意象年代与植物可读性 | 保持 candidate，交作者审批；未回复不视为 approved |
| 明江南单视图的城门对格 / 直墙与转角高度 | **已解决**：两门双轴±0.500、净孔4.000/6.000格；三格L形墙角双轴±0.500、接口高124px，与直墙一致；整城接缝仍待实测 |
| 明江南整桥与植物接口 | 整桥只供静态预览，另拆栏杆方能验证单位遮挡；柳、竹不冒充 design/22 §4.4 的双变体植物公告板 |

## 10. 辽 · 金北方贴片 · `liao_jin_north`

本套件保存到 `assets/default/tile/liao_jin_north/`，使用内置 `image_gen` 逐张出图，实际完整提示词、参考图和SHA逐条登记在其 `manifest.yaml`。历史依据及访问日期见 [KIT-liao_jin_north 报告](../../../tools/agents/reports/KIT-liao_jin_north.md) §7。下面是对§6模板的年代替换，不改变§4–§8的通用规范。

### 10.1 年代、类型与占地

- 辽上京夯土城墙与木构门楼、金中都局部包砖考古事实只作材料和结构语汇；匿名门楼为 **（原创扩展）**。使用土墩、局部灰砖护脚 / 护角、木过梁敞口和灰瓦木楼，不画明清多重箭楼、密集垛口或宫廷彩画。
- 与宋贴片同写实密度、左上光与右下短影，年代差异以灰褐夯土、局部砖石、北方植被表现；不额外烘焙城市道路、水面或厚地台。
- `city_gate__k4_r000_v01` / `city_gate__k6_r000_v01`：净宽目标4 / 6格；按 `design/22` §4.3，外占地 `[8,4]` / `[10,4]`，两侧门墩各2格。底面外宽分别 `32(8+4)=384`、`32(10+4)=448 px`；并非成品PNG宽度。
- `wall__earth_r000_v01 [1,1]`、`wall_corner__outer_ne_v01 [2,2]`：灰褐夯土直墙和外角；占地沿用宋贴片 **【建议值】**，无四向扩展。
- `bridge_deck__w3_l5_r000_v01 [3,5]`：匿名木梁桥含简栏 **（原创扩展）**；占地沿用宋桥 **【建议值】**，水关资料不证明具体木桥形制。
- `tree_cluster__elm_v01` / `tree_cluster__pine_v01`：榆树 / 油松意象；现代植物分布支持其北方地域性，不证明辽金街道栽植。逻辑占地 `[1,1]` 只作种植点 **【建议值】**，根锚不等于树冠中心；目标视觉高度320px **【建议值】**，树冠可跨多格。
- 上述文件ID均加前缀 `tex_town_liao_jin_north_`，只声明1个实际朝向；`autotile_mask:null` 表示本件未提供自动邻接掩码，不能假装覆盖47形。

### 10.2 可复用差异提示词

```text
Use case: historical-scene. ONE Liao/Jin northern Chinese {ASSET_TYPE} sprite.
Reference image: Song kit material realism and detail density, not historic identity.
Muted grey-ochre rammed earth, limited grey brick foundations, dark matte timber.
Gate: plain timber lintel, grey tiled upper hall, transparent open passage with
front proportions 2:{CLEAR_WIDTH}:2; no floor, door, soil island or steps across gap.
Wall: subtle horizontal rammed-earth strata, flat top, no decorative cap.
Bridge: simple wooden beams/planks and low square-post railing; no water or banks.
Plant: {Ulmus pumila / Pinus tabuliformis}, complete crown and visible root collar.
Orthographic yaw45 elevation30, 2:1 dimetric ground slopes +0.5/-0.5.
Upper-left light, short lower-right contact shadow; complete silhouette and margins.
True RGBA transparency, no text, people, watermark, scenery or modern objects.
Anonymous original game asset, not a measured reconstruction of a named site.
```

以上为分类型替换段；实际调用只选对应的门 / 墙 / 桥 / 植物段，禁止让模型在一张图上画整套。

### 10.3 质检与默认限制

本批选中7图，短边门禁32px；原图保留真实alpha，仅透明裁边、统一比例缩放、透明扩边，不重画、不强制补255alpha、不旋转或拉伸。逐件测点、锚点变换与像素检查在 `meta/`；PNG外的全透明RGB光晕不应误当实体背景，预览按alpha正常合成。

全部保持 `candidate`。续作返修后，净宽4 / 6格城门的外占地边比误差约4.07% / 0.94%，但k4右轴约−0.613且视觉净孔约44.25%（目标50%），k6局部门墩仍有残差；桥边比误差约4.56%（对边均值6.58%），双前轴约+0.549/−0.560。文件检查通过不代表精确2:1、净宽对格、门孔完整掩膜或无缝墙接缝已通过。默认用于固定朝向候选审图，严格装配 **（待实测）**；每件每轮最多2候选，不用几何扭曲消除残差。桥的锚点是桥面中心投影，岸面高差及前栏遮挡须另处理；现批只交一体静态图。植物物种形态辨识、辽金栽植场景与作者风格认可仍开放，默认沿用候选意象。

## 10. 清初至清中北方套件 `qing_north`

- 适用北京、盛京、济南的地域意象：灰砖城墙、灰瓦门楼、克制红褐木构、朴素灰石低拱桥；不照搬名胜，不将北京皇城黄琉璃等级扩散到普通城门。具体组合为 **（原创扩展）**。
- 延用宋套件的低饱和木石质感、细颗粒与左上光。清北门楼可提高灰砖比重、压低翘角与彩画密度；本批 k4 / k6 木构偏鲜红（k4更明显），作者未审前保留 candidate。
- 地面目标仍为 64×32 px/m、正交 yaw45 / pitch30、轴斜率±0.5；2:1指地面投影，不把门楼或树的整张画布压成2:1。首轮规格化只裁切、等比缩放和透明padding；第10轮墙角另有一项带矩阵、输入归档及哈希的PIL仿射校正。
- `city_gate` 的 k4 / k6 分别为8×4 / 10×4格；孔为4×4 / 6×4，两侧门墩各2格。公式及通行掩膜契约见 `design/22` §4.3，不能用不透明门洞背景遮住底图道路。
- 本批只交南向门、一个直墙方向、一个外角、一个桥方向；不能旋转或翻转一张图冒充四向。植物以国槐、油松为地域候选，单株逻辑根占地1×1；不建立 `prp_*` 的隐式alias。

```text
Use case: historical-scene. ONE isolated early-to-mid Qing NORTH CHINA {OBJECT}.
Use Song kit input only as STYLE reference for restrained realistic antique-game materials.
Northern grey brick, grey ceramic tiles, dark red-brown timber, modest eaves;
original regional architecture, not a copy of a named monument or an imperial yellow-roof gate.
Orthographic yaw45 elevation30, exact2:1 GROUND projection, planar slopes+0.5/-0.5.
Footprint {W}m by{D}m; crisp coplanar ground corners; center anchor at ground footprint center.
Gate: total width{k+4}, clear passage{k}, pier2 on each side, depth4;
all empty passage floor pixels alpha0, no paving or door obstructing the cutout.
Upper-left light, short lower-right contact shadow. Complete silhouette and transparent margin.
TRUE RGBA, no background or painted checkerboard, no broad haze, no text or people.
```

植物差异：国槐提示小型羽状复叶、疏透圆冠、灰褐裂纹树皮；油松提示束生针叶、横展枝层、不规则伞冠，禁止阔叶、盆景盆与圣诞树形。树高用 `ceil(16√6×4)=157 px` 根到冠顶建议值控制，等比缩放后实际冠宽保留，不强塞入2m冠幅。

记录在 `assets/default/tile/qing_north/manifest.yaml`；完整候选提示词、历史输入路径/哈希见 `generation.jsonl`，实测锚点、原始测点、透明探针、投影残差见 `qa.jsonl`。本批直墙底边斜率约0.490/0.496；门、墙角与桥仍存在投影误差，未宣称通过严格接缝或通行孔逐像素对格验收。默认只作为candidate预览素材，后续朝向与装配修正另排。

2026-09-30下载查看的正阳门、万宁桥、油松与国槐照片仅作成品后验形制复核，不曾作为本批 `image_gen` 输入；逐件URL与用途登记在套件manifest的 `historical_references`，生成输入仍以 `references` 为准。
