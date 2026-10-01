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

### 9.1 历史图片参考重出细节（2026-09-30）

- 七件均以真实图像模型同 ID 重出；每件输入宋基线透明贴片（只约束斜45°、俯仰30°、2:1斜二测、透明裁切和写实密度）及两张已下载、目视检查的历史图片。规格化仅裁切、一次等比缩放和透明留白；不阈值改 alpha、不补画门洞、不 warp。
- 两座城门以盘门照片的青灰小砖错缝、厚城体、券洞、深门道、深色石基与水脚为母题；第二候选把首候选的“架空门楼”改为厚砖券体。现存上部楼橹含后世修复，不照搬；贴片只保留低矮克制的灰瓦守楼。`k4/k6` 是逻辑净宽，像素孔对格仍 **（待实测）**。
- 直墙与外转角取盘门墙体的青灰砖、浅灰灰缝、石质水脚和厚实体；逻辑分别 `1×1`、`2×2`，平顶、无垛口、无披檐。墙高、端面与连续接缝须在总装复核，不能由单图门禁代替。
- 石梁桥以青浦区官方页面的顺德桥、迎祥桥照片为主：多跨平梁、细石柱墩、纵梁承横向桥面板、平缓长桥面；元代始建而明清屡修，仅取结构原理，不复制现状栏杆、碑刻和现代修补。王振鹏古画只补船岸尺度。
- 柳树取倪瓒画中疏林斜干、通透冠层和江南岸植层次；芦苇取倪瓒、王振鹏画中河岸细茎与疏密节奏。植物具体品种、元末城市栽植位置 **（待考）**；不带土岛、水面或现代园艺修剪。
- 真实 alpha 自查以灰底/棋盘合成和通道统计同时完成；模型常把最高实体 alpha 输出为254，这仍是有效非预乘 RGBA，不以阈值强改255。外部 alpha0、透明留边及无大范围光晕是入选条件。

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

本次历史重出逐项调用 Codex Images `gpt-image-2` 编辑端点并请求真透明，最多2候选择1；实际两城门各2候选，其余贴片各1（建筑河埠另为2选1）。源图、实际完整提示词、服务请求/生成ID、裁框 / 等比缩放 / 偏移和成品SHA均登记。逐张 `view_image(detail=original)` 检查；本套只做裁切、等比缩放与透明留白，**不沿用§8地面alpha阈值或水面仿射投影**，不镜像或扭曲墙门以冒充四向。门楼与地面通行孔的碰撞分工只引用 `design/22` §4.3；贴片 alpha 不能代替逻辑通行掩膜。

城门底面目标包围宽高分别为 `32(8+4)×16(8+4)=384×192px`、`32(10+4)×16(10+4)=448×224px`；屋顶向上外扩，PNG画幅不等于占地。其他贴片占地见各条 manifest **【建议值】**。`autotile_mask:null` 表示手动选件，不能解释为完整自动拼接47形集。单视图仅用于本方向预览，墙角接缝、孔净宽、桥头接路和植物不挡门均 **（待实测）**。

参考资料（2026-09-30访问）：[苏州市志办《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)用于辨别现存盘门元代重建、明清续修与现代门楼的边界；[上海市青浦区博物馆《顺德桥》](http://museum.shqp.gov.cn/museum/ql/20190304/479101.html)用于确认元至正三年江南三跨石梁桥的形制记录，但本批平桥只取石梁材质母题，不复原其三跨、栏板和后世重建状态。植物来源见本任务报告§7。网页文字研究不等于图片输入，实际图像参考以各条 `references` 为准。
## 9. 吐蕃 · 藏地贴片差异 `tubo`（KIT-tubo，2026-09-30；历史细节复核 2026-10-01）

本节新增 `assets/default/tile/tubo/` 的 7 张地域候选，不修改宋基线。`tubo` 为地域资源键，各年代按城选用，不声称藏地城市均有相同闭合城墙或同一门制。石 / 土木形制和具体组合为 **（原创扩展）**；拉萨、日喀则、昌都的具体城垣、门位与年代适用性 **（待考）**。

| `tex_town_tubo_` 后缀 | kind | footprint | 变体用途 |
|---|---|---|---|
| `city_gate__k4_r000_v01` | city_gate | 8×4 | 净宽4、南向；两侧各2格门墩 |
| `city_gate__k6_r000_v01` | city_gate | 10×4 | 净宽6、南向；两侧各2格门墩 |
| `wall__stone_r000_v01` | wall | 1×1 | 石砌平顶直段 |
| `wall_corner__outer_ne_v01` | wall_corner | 2×2 | 外转角，单朝向 |
| `bridge_deck__w4_l8_r000_v01` | bridge_deck | 4×8 | 简化石墩木梁桥意象 |
| `tree_cluster__willow_v01` | tree_cluster | 3×3 | 高原柳树意象，不确定到种 |
| `shrub__seabuckthorn_v01` | shrub | 2×2 | 西藏沙棘意象 |

实际 ID 以 manifest 为准。门占地按 `design/22` §4.3 的 `w=k+4,h=4`：4+4=8、6+4=10；规划通行孔仍为 k×4，不将门楼整体标成可走。其余占地为 **【建议值】**，不等于古建 / 植物实测体量。`autotile_mask: null` 表示独立单体，未交47-mask全集或四向图，默认只按原向放置。

- 墙：灰褐毛石或土石芯、白灰不匀、下厚上薄的收分剖面；石板 / 木檐口封墙顶，赭红带只作等级差异。直墙与转角要共享砌层高度、压顶厚度和接缝，不画成等截面现代砖柱。
- 门：本轮已按默认值改为 Bar Chorten 所见的覆钵塔身门语汇：两侧收分体量、真正透明的通行孔、覆钵 / 叠轮轮廓；门制与具体年代仍 **（待考）**。禁止中原歇山瓦顶、清式彩画、玻璃与现代路标。
- 桥：约1900年玉妥桥为短石桥并带守门桥屋，1928年年楚河桥和1936年拉萨铁桥证明近现代还存在不同材料体系；三者都不支持本件“无盖木梁桥”作为统一藏地传统。本轮只取粗石桥台 / 墩、低跨尺度与材料反例；木梁桥继续明确为 **（原创扩展）**。
- 植物：柳属与西藏沙棘的现代原生分布有依据，但具体古代城内栽植 **（待考）**；不拿分布区代替历史种植记录。

```text
Use case: historical-scene. ONE Tibetan regional modular town tile, type {kind}, footprint {w}×{h}.
Weathered stone/earth and dark matte wood, flat parapets, restrained white/ochre-red surfaces.
For gate: Bar Chorten vocabulary, battered wall masses and one genuinely transparent open passage, clear wall interfaces.
For bridge: plain timber beam/cantilever construction and stone supports; no water or landscape.
For plant: locally plausible willow / Tibetan sea buckthorn, modest natural silhouette, visible root anchor.
Orthographic yaw45 pitch30, ground slopes +0.5/-0.5; upper-left light, short lower-right contact shade.
True RGBA transparency outside the object and through openings; solid material, no ambient halo.
No text, pseudo-script, people, modern objects, checkerboard, floor plinth, Chinese tiled gate roof or panorama.
Keep Song reference realistic material density only, replace its regional architectural vocabulary.
```

实际调用全文、来源、SHA 与时间见 `manifest.yaml`；选中原图保存在 `source/historical-rebuild/`。仅以 alpha≥16 去除生成器环境雾，随后裁框、等比缩放和透明扩边，未重绘、仿射扭曲或镜像。直墙、墙角与沙棘各用第2候选；其余各1候选。成品留边≥8px、短边≥32；`anchor_px` 暂取规格化后非透明包围框底边中点，装配时须改为实测底面 / 根接触点。真实透明与文件检查通过，不代表门净宽像素、墙缝或桥头已精确对格。

参考资料（访问 2026-10-01）：[LOC · Bar Chorten](https://www.loc.gov/item/2021670618/) 与 [LOC · Yu-tog zamba](https://www.loc.gov/item/2021670619/) 的馆藏图已下载并 `view_image`，只作成品事后反例 QA，未输入生成工具；[Pitt Rivers Museum · Lhasa willows, 1936](https://web.prm.ox.ac.uk/tibet/photo_1998.131.270.html) 与 [BRIT907382 · Hippophae tibetana](https://portal.torcherbaria.org/portal/collections/individual/index.php?occid=31555408) 分别核柳树与沙棘形态，后者是2018年现代标本。通用中国廊桥论文 [China’s corridor bridges](https://link.springer.com/article/10.1186/s43238-020-00010-w) 可访问，但不是藏地桥梁专论，不作为本件构法证据；UNESCO / Kew 本轮返回403，相关分布文字保持 **（待核实）**。
参考资料（2026-09-30访问）：[苏州市志办《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)用于辨别现存盘门元代重建、明清续修与现代门楼的边界；[青浦区政府·青浦古桥](https://www.shqp.gov.cn/shqp/ggfw/bmts/20250116/1224818.html)提供本轮实际输入的顺德、迎祥桥照片，支持多跨石梁、细石柱墩与后世重修边界；故宫名画记[王振鹏《龙舟夺标图》](https://m-minghuaji.dpm.org.cn/paint/detail?id=8b90556546a340a2a688b0cb9e6e49d8)补船岸尺度；上海博物馆倪瓒[《渔庄秋霁》](https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00001018)、[《汀树遥岑》](https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00005285)约束疏林、柳与岸植节奏。所有图片均下载并审看，实际逐件输入与取用细节见 manifest `references`。
参考资料（访问 2026-10-01）：[LOC · Bar Chorten](https://www.loc.gov/item/2021670618/) 与 [LOC · Yu-tog zamba](https://www.loc.gov/item/2021670619/) 的馆藏原始扫描、[Pitt Rivers · Nyamchu Bridge, 1928](https://web.prm.ox.ac.uk/tibet/photo_BMH.F.79.1.html) 和 [Iron bridge near Lhasa, 1936](https://web.prm.ox.ac.uk/tibet/photo_2001.35.76.1.html) 均已下载、`view_image` 并作为对应门 / 桥的实际模型输入；后两张只界定桥梁材料差异，不证明本件原创无盖桥的精确构法。

[Pitt Rivers · Lhasa willows, 1936](https://web.prm.ox.ac.uk/tibet/photo_1998.131.270.html) 已核多干、疏阔树冠与河谷生境并实际输入柳树生成；沙棘用约1900年泽当史照约束地域尺度，另用现代生态 / 植物图约束狭叶、刺枝与橙果。植物参考只支持形态与地域点景，不证明古代城内栽植。通用中国廊桥论文 [China’s corridor bridges](https://link.springer.com/article/10.1186/s43238-020-00010-w) 不是藏地桥梁专论，不作为构法证据。

已解决：7 张贴片于 2026-10-01 用实际参考图重出并同 ID 覆盖；`references` 逐项登记 URL、下载 SHA、取用细节与 `model_input: true`，`size` / `sha256` 以成品实测。两门采用 Bar Chorten 覆钵门且孔洞真透明；桥、河埠保持史料约束下的原创同功能概化；植物仅作跨年代地域点景。

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

北宋东京顺天门考古资料支持夯土墙身与门区包砖：墙体版筑错缝叠压，夯层约8–12厘米、圆夯窝直径约5–8厘米；门区包砖约长34–35、宽18–19、厚6厘米，以黄褐土黏合。故墙件显出夯层、夯窝和灰瓦压顶，门墩表现夯土芯与灰砖面，不套明清全包砖高城墙。历史顺天门主城门一门三道，本批两种单孔门只是游戏拼装简化，不能称顺天门复原；屋脊灰陶饰仅取发掘报告的套兽、垂兽和瓦当类别，不照搬完整排列。木桥取宋本《清明上河图》虹桥的贯木 / 交叉撑木母题，无水中桥墩，不复制复建景区。柳树同时参考宋画郊道与现代物种照片的粗干、长垂枝幕；国槐参考物种照片的小椭圆复叶、低分叉粗干和圆阔冠形，具体宋代栽植点仍**（待考）**。

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

每件先view参考、逐张调用图像编辑接口、最多2候选；仅以 `alpha>8` 排除服务产生的不可见尘点并确定裁框，框内原alpha保持，之后只做一次等比LANCZOS与透明扩边。不能用RGB颜色抠图或非等比变形修正本批精灵。源PNG的alpha=0隐藏RGB可能在某些预览里显出光晕，应检查实际alpha及合成效果，不能据此假判背景不透明。

### 10.3 几何、来源与待决

沿用§4.3城门公式：外占地 `[k+4,4]`，通道 `[k,4]`；k=4/6时底面理论包围框为384×192 / 448×224px，计算为 `32(w+h) × 16(w+h)`。墙1×1、角2×2沿用基线登记，桥3×6为**【建议值】**；植物3×3为冠幅放置包络，不是实心占地。

实际门楼仍有轴线、宽深比及门洞净宽残差，`gate.precise_mask_verified:false`；条目同时保留标称宽度、正面归一化孔宽比例和成品孔端点向量。比例估值不是64×32格实测净宽，不能把标称值当像素实测。墙角包络中心按可见端点推算；树锚为根，建筑贴片锚为底面包络中心。所有尺寸与锚点以manifest为准，不按透明画布宽再次缩放。

参考资料（访问2026-09-30）：[顺天门考古简报](https://www.hnswwkgyjy.cn/ueditor/php/upload/file/20220524/1653363795965934.pdf)已下载并逐页查看主城门平剖、发掘正射、夯土剖面、包砖及脊兽 / 瓦当图版；[宋本《清明上河图》虹桥局部](https://commons.wikimedia.org/wiki/File:Qingming_shanghe_tu_bridge.jpg)用于木桥构造；[Pillow Image文档](https://pillow.readthedocs.io/en/stable/reference/Image.html)核对RGBA裁切及resize接口。植物物种照片及逐件实际取用URL写入manifest；完整边界见任务报告§7。

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

### 10.1 历史细节要点（历史图片重出，2026-09-30）

本轮同 ID 覆盖 7 张贴片，旧图只锁定 footprint、单方向轮廓和镜头；每条 manifest 的 `references` 保存两张已下载、已实看的历史照片 URL 及取用细节。城墙取北京明城墙遗存的大青砖错缝、细灰缝与包角咬砌；城门取山海关砖台券洞、木楼槅窗、灰色筒板瓦和克制脊饰。4 / 6 格门洞必须继续透空，不烘焙门扇、黑洞或地面。

桥面从卢沟桥照片只取花岗岩条石、凿痕、细缝与磨损，不复制多孔拱桥或石栏；仍是无栏平桥贴片 **（原创扩展）**。国槐取低分叉、圆展不对称树冠、灰褐裂皮和羽状复叶；侧柏取红灰裂皮、直立层叠冠和扁平鳞叶小枝。古树照片只校正植物形态，不证明明代具体栽植点 **（待考）**。

规格化仅透明裁边、一次等比缩放和透明留白；7 张画布、ID、类型、占地与既有锚点登记不变，画面比例相对旧轮廓最大变化不足 6%。本轮每张只出 1 候选并逐张 `view_image`；门墙接缝、门洞对格、植物根锚和运行时遮挡仍 **（待实测）**。

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

本套件保存到 `assets/default/tile/liao_jin_north/`；2026-10-01强历史细节重出的完整实发提示、参考图、原图归档和 SHA 逐条登记在其 `manifest.yaml`。历史图片、访问日期、逐类取用细节和候选数见 [KIT-liao_jin_north-hist 报告](../../../tools/agents/reports/KIT-liao_jin_north-hist.md) §7。下面是对§6模板的年代替换，不改变§4–§8的通用规范。

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

### 10.3 历史图片参考与强细节重出要点（2026-10-01）

每件重出使用2张已下载且经 `view_image` 查看过的图片作为 `image_gen` 输入；来源只约束可见形制、材料和构造，不复制照片构图。现代地貌、修缮层、栏杆与旅游设施不得倒推为辽金原状。

| 贴片 | 历史参考与取用细节 | 实发提示的硬约束 |
|---|---|---|
| `city_gate__k4`、`city_gate__k6` | 辽上京大顺门夯土、北墙剖面、砖石残片：水平夯层、灰黄土、侵蚀边与局部砖石护脚；独乐寺山门 / 转角铺作：低缓灰瓦屋面、深檐、厚柱和多层出跳 | 夯土门墩承灰瓦木门楼；朴素卷尾鸱吻，少量筒瓦 / 板瓦；透明门洞贯通，不画门扇、路面或台阶；禁明清箭楼、密集垛口、黄琉璃和彩画满铺 |
| `wall__earth`、`wall_corner__outer_ne` | 辽上京三图＋金庆州两张城墙遗址：夯土层理、风蚀裂面、长而低的土垣轮廓；遗址残高只供材质，不决定复原高度 | 灰黄夯土分层，少量草梗 / 砾石与局部石脚；直墙和外角同高同色，顶面平缓，无装饰压顶、砖砌雉堞或植被地块 |
| `bridge_deck__w3_l5` | 卢沟桥现状与1877年照片：长低桥面、重复桥跨、石栏比例；《清明上河图》桥河段：木梁 / 木拱构件、低栏与市井尺度。前者只校核历史桥梁的低平轮廓，不把石拱复制成木桥 | 本件仍为匿名木梁桥 **（原创扩展）**：宽短桥面、粗横梁、8道横板、低方柱双栏；无水、岸、桥屋、石拱、人物或船；桥面四角须清楚 |
| `tree_cluster__elm` | 两张 `Ulmus pumila`：灰褐纵裂树皮、扭曲主干、疏透不规则圆冠和细小叶；盆景状照片仅辅助看枝干，不取盆形 | 原生地栽单株，根颈可见；冠形不对称、枝间留空；禁止花盆、修剪球、垂柳形和阔大叶片 |
| `tree_cluster__pine` | 两张 `Pinus tabuliformis`：横展轮生枝、老树不规则伞冠、长针束簇和灰褐裂皮 | 油松单株，成团针束而非阔叶；枝层不做圣诞树圆锥，根颈透明落地；禁止盆景台与景观土岛 |

城门实发提示逐项写明屋面低举折、卷尾鸱吻与少量脊兽、灰筒板瓦、可读的斗栱层叠 / 出跳、柱网 / 土墩 / 石脚、直棂门窗、克制赭红木色和夯土砌筑；墙体写明夯层与地域材料。全部贴片按正交 yaw45 / elevation30、2:1、左上光、右下短接触影、真 RGBA 与清楚占地边重出；每件2张历史图＋上一版同 ID 镜头 / 占地参照，URL 和取用细节已逐件进入 manifest。

### 10.4 质检与默认限制

本批选中7图，短边门禁32px；原图保留真实alpha，以 `alpha>=8` 显著包络裁边，等比缩放至上一版同 ID 显著包络宽度，再透明扩边，不重画、不强制补255alpha、不旋转或拉伸。锚点按上一版锚点在旧包络内的相对位置映射；PNG外全透明RGB不作实体背景。

全部保持 `candidate`。k4第二候选已目视确认门洞透明贯通且明显宽于单墩；k6同样贯通，但未作逐格遮罩和地块装配测量。直墙第二候选已改成长低连续墙段，墙角与其色相 / 层理接近；端面高度、接缝和桥栏遮挡仍 **（待实测）**。文件检查通过不代表精确2:1、净宽对格或无缝拼接已通过；不以非等比扭曲消除残差。植物物种形态辨识、辽金栽植场景与作者风格认可仍开放。

## 10. 清初至清中北方套件 `qing_north`

- 适用北京、盛京、济南的地域意象：灰砖城墙、灰瓦门楼、克制红褐木构、朴素灰石低拱桥；不照搬名胜，不将北京皇城黄琉璃等级扩散到普通城门。具体组合为 **（原创扩展）**。
- 延用宋套件的低饱和木石质感、细颗粒与左上光。2026-09-30重出时，每类将2张历史照片与宋基线一并作为 `image_gen` 输入：历史照片控制形制、比例、材料和构造，宋图只控制游戏渲染密度。清北门楼提高灰砖比重、压低翘角与彩画密度；两门均保留为 candidate。
- 地面目标仍为 64×32 px/m、正交 yaw45 / pitch30、轴斜率±0.5；2:1指地面投影，不把门楼或树的整张画布压成2:1。首轮规格化只裁切、等比缩放和透明padding；第10轮墙角另有一项带矩阵、输入归档及哈希的PIL仿射校正。
- `city_gate` 的 k4 / k6 分别为8×4 / 10×4格；孔为4×4 / 6×4，两侧门墩各2格。公式及通行掩膜契约见 `design/22` §4.3，不能用不透明门洞背景遮住底图道路。
- 本批只交南向门、一个直墙方向、一个外角、一个桥方向；不能旋转或翻转一张图冒充四向。植物以国槐、油松为地域候选，单株逻辑根占地1×1；不建立 `prp_*` 的隐式alias。

### 10.1 历史细节要点

- 城门依据Thomas Child前门和北京城门历史照片：大块灰砖包砌城台、下部轻微收分、白石基脚、单券门洞；门楼为低矮双层重檐歇山，灰筒板瓦、鸱吻与短脊兽列，一级斗拱、暗朱柱和克制青绿彩画，不照抄正阳门构图。
- 直墙 / 外角依据北京城墙历史照片：规则错缝灰砖面层、夯土芯、窄石基与平砖压顶，无雉堞、楼台或装饰；墙角明确3米高、两翼2×1米的L形比例，内角保持透明。
- 桥依据万宁桥现状照片：低缓单孔石拱、清楚券石、顺砌腹墙、磨旧石铺面、低实心栏板和方望柱；拱孔透明，不烘焙水面或河岸。
- 国槐依据国槐与景山古槐照片：灰褐纵裂树皮、高处分枝、疏透不规则圆冠和细小羽状复叶；油松依据两张油松照片：红褐板裂树干、横展层枝、深橄榄针叶簇和开敞伞冠。植物不带盆、土岛或场景底。

```text
Use case: historical-scene. ONE isolated early-to-mid Qing NORTH CHINA {OBJECT}.
Attach 2–3 historical images of the same class and one Song-kit baseline.
Use historical images for form, proportion, material and construction detail;
use the Song image only for restrained realistic antique-game rendering density.
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

记录在 `assets/default/tile/qing_north/manifest.yaml`；完整候选提示词、历史参考URL、输入用途、规格化数据与哈希均在各条目中。PIL只以alpha≥8排除贴边噪点后裁框、等比缩放和补足四边8%透明留白，不重绘、不旋转或做透视纠偏。门、墙、桥仍未经过整城逐像素接缝、通行孔掩膜和碰撞联调；默认只作为candidate预览素材，后续朝向与装配修正另排 **（待实测）**。

历史图片均于2026-09-30下载、用原图查看并实际作为 `image_gen` 输入。逐件URL和取用细节见manifest `references`：城门 / 墙为[Thomas Child前门与城墙](https://commons.wikimedia.org/wiki/File:Thomas_Child_-_Gate_tower_of_Qianmen_and_city_walls,_Peking_NA01-65.jpg)、[北京城门旧照](https://commons.wikimedia.org/wiki/File:Front_Gate,_City_Wall,_Peking,_China_(4822093666).jpg)及[北京城墙顶](https://commons.wikimedia.org/wiki/File:Felice_Beato_(British,_born_Italy_-_Top_of_the_Wall_of_Peking_-_Google_Art_Project.jpg)；桥为两张万宁桥照片；植物为两张国槐和两张油松照片。存世照片和晚清影像不等于清初逐构件测绘，匿名组合仍为 **（原创扩展）**。

## 10. 清 · 江南套件 `qing_south`（2026-09-30）

本批在 `assets/default/tile/qing_south/` 单独登记 7 张候选，不替换宋基线。年代为清初至清中江南，供杭州、扬州、苏州、福州语境选用；它是同一地域材质套件，不主张四城城垣、植物与门楼完全相同。全部为 **（原创扩展）** 的年代意象；单座史迹、精确构件比例、植物品种及栽植点仍 **（待考）**。

### 10.1 年代要点与差异

- 沿用宋套件低饱和写实木石颗粒、可读轮廓和细节密度；清式变化集中在灰瓦门楼、小尺度檐口、暗红褐木构和克制梁枋装饰，不把门楼改成黄琉璃宫殿。
- 门墙使用青灰砖、灰石基脚、砖石拱券与简单雉堞；不照搬现代重建盘门楼，也不将现存宋元墙基称作清代新建形制。
- 桥采用匿名朴素单孔石桥意象，低栏、灰石、完整透空拱下；不复制晚清重建吴门桥，不在桥图内烘焙河水、岸线或城市场景。
- 柳树和桂花灌木支持江南河岸 / 庭园的区分。杭州地方文化资料可支持两者的地域母题，具体树龄、桂花修剪、花期及混植方式均为美术选择。
- 透明精灵的 2:1 指底面投影，画布必须向上容纳门楼 / 树冠；禁止把整张 PNG 拉成 2:1 宽高比。

| 变体 | 逻辑占地 | 提示词差异 / 限制 |
|---|---|---|
| `city_gate__k4_r000_v01` | 8×4 | 净宽 4、左右门墩各 2 格、石拱透空、清式灰瓦楼体 |
| `city_gate__k6_r000_v01` | 10×4 | 净宽 6、左右门墩各 2 格、明确加宽中央拱孔 |
| `wall__brick_r000_v01` | 4×1 | 青砖石基直墙、平直端面、简单雉堞；占地 **【建议值】** |
| `wall_corner__outer_ne_v01` | 2×2 | 两翼直角外转角，顶面简洁；占地 **【建议值】** |
| `bridge__stone_w3_l6_r000_v01` | 3×6 | 匿名单孔石桥，完整桥面与低栏；占地 **【建议值】** |
| `tree_cluster__willow_v01` | 2×2 | 单株柳树、疏垂枝、清楚根部，不带土台；占地 **【建议值】** |
| `shrub__osmanthus_v01` | 2×2 | 桂花灌木、椭圆叶、少量细小淡黄花，不带花盆；占地 **【建议值】** |

表内短名均加 `tex_town_qing_south_` 前缀；完整 ID、源图路径与逐张实际提示词以本批 manifest 为准。

### 10.2 复用提示词

```text
Use case: historical-scene. ONE isolated early-to-mid Qing Jiangnan {ASSET_TYPE},
1660–1780, period-inspired original game art, not a named monument reconstruction.
Use the approved Song kit image only as material/detail-density/lighting reference.
Grey-blue brick and stone, charcoal grey tiles, restrained dark reddish-brown timber;
no imperial yellow glaze, huge brackets or late-Qing / Republican / modern fittings.
Footprint {FOOTPRINT}; orthographic yaw45 elevation30, exact 2:1 ground projection.
Screen ground axes slope +0.5 and -0.5; verticals upright, no perspective convergence.
Bottom-plane center anchor; entire eaves / canopy / footings visible with transparent margin.
Soft upper-left light, short lower-right contact shadow; true transparent RGBA.
For gates: footprint (k+4)x4, transparent through-passage kx4, each pier width2.
For bridges: keep arch opening transparent; no water, riverbank or surrounding pavement.
For plants: exposed stem contact; no pot, soil tile or pedestal.
No text, plaques, people, sheet, grid, opaque background or painted checkerboard.
```

相机返修优先句：`The present ridge is too nearly horizontal; steepen it to screen slope +0.5. Keep depth edges at -0.5. Correct only camera/projection; preserve material and transparent opening.` 两座门均生成 2 个候选并选择第 2 个；墙段尝试 2 个后保留第 1 个；其余各 1 个。所有实际输入基线和返修输入均保留 provenance，返修初稿仅作输入记录，不是额外发布变体。

### 10.3 本批登记、验收边界与默认值

- 源图与成品逐张用 `view_image` 查看；PIL 只按 alpha 外接框裁切、等比缩放、加 8 px 透明边。保留原始 alpha，不绘制 RGB、不透视 / 非等比校正、不重画门洞。
- 门 / 墙 / 桥的平面目标宽为 `(w+h)×32 px`；用目视源图基脚跨度确定等比比例。柳冠 / 桂冠目标宽为 224 / 112 px，根部占地仍分别登记，不把树冠当碰撞格。
- `anchor_px` 由目视源图底面中心经同一裁切与缩放换算；`geometry` 登记 64×32 目标格、目标底面多边形、建议高度、门孔格范围及缺失朝向。目标值不伪称像素实测结果。
- 两门净宽遵循 `design/22` §4.3：外宽 `4+4=8` / `6+4=10`、进深 4；孔内地面不可回填。当前只交付 `r000`，其余三向默认留给下游按需生成，禁止旋转单图冒充。
- 7 张均为 `candidate`；透明 / 尺寸 / 哈希检查通过不代表碰撞、净宽、接缝、精确投影斜率及真机装配已通过。默认先供清套件预览，运行时接入前按 `design/22` 与 `tech/02` 复核。
- 直墙、转角、桥、植物的占地与高度为 **【建议值】**；精确门洞对格、墙高一致性、桥栏遮挡、门墙拼缝、植物季相为 **（待实测）**。保留本节默认值，不自动升级为 approved。

### 10.4 参考资料

- [苏州市地方志《漫话苏州古城墙的变迁》](https://dfzb.suzhou.gov.cn/dfzb/fzxh/201010/dac10c8400b347af8cad9ae1f9985489.shtml)，访问 2026-09-30：取青砖石基城墙、砖拱与城垣累积修缮背景；排除现代重建楼体作为清初复原证据。
- [苏州市地方志《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)，访问 2026-09-30：取水陆城门与石砌拱圈地域背景，不复制现存形体或声称本批门楼即盘门。
- [杭州政协《杭州古代的花木文化》（刘大培）](https://www.hzzx.gov.cn/hzzx/content/2010-10/26/content_5140376.htm)，访问 2026-09-30（本次直开 HTTP 200）：支持杭州桂花及垂柳文化母题；不作为具体品种、年代树位、修剪尺寸的证明。

本批未新增 API、版本、价格或浏览器支持主张；工具实际模型与 effort 未公开，manifest 如实记为 undisclosed / not_exposed。

## 10. 蒙古 · 草原套件 `mongol`（KIT-mongol，2026-09-30）

本节新增 `tile/mongol/` 的7件候选，沿用宋基线的写实古风、材质细节密度、45°偏航 / 30°俯仰 / 2:1地面轴、左上光及右下短接触影。草原营地与和林 / 上都是文化语境，**不把木栅营门当作已考证的上都皇城门复原**。

### 10.1 清单与地域差异

| 项 | 形制 / 材料 | 制作契约 |
|---|---|---|
| 城门2座 | 土芯 / 砖石意象门墩、木梁与木构门楼，完整单体，克制上部屋盖 | 逻辑净宽4 / 6格；外占地8×4 / 10×4；各仅原向，像素孔宽另验 |
| 直墙1件 | 粗木竖桩与横向联结的营地木栅 | 单独端部，按登记锚点接邻件；不冒称石砌帝都城墙 |
| 墙角1件 | 同材质木栅转角 | 明确有序转向，不能靠镜像冒充其他方向 |
| 桥1件 | 简朴木梁木板小桥 | 匿名水沟 / 小河接口（原创扩展），不证明具名历史桥址 |
| 本地植物2种 | 草原丛生草意象、低矮灌木意象 | 不盖道路或门洞；具体古代物种与栽植（待考） |

净宽公式引用 `design/22` §4.3：`k=4/6`，`footprint=[k+4,4]`、`passage=[k,4]`，两侧门墩各2格；这是游戏逻辑掩膜，不是历史测绘。母版逻辑地面范围分别 `32×(8+4)=384`、`32×(10+4)=448` px宽，高192 / 224px。门洞的上部梁架可遮挡，孔内地面仍须透明可走；门底面中心 / 孔中心与入口分开登记。

直墙、转角、桥和植物的占地见本套件manifest，属于素材 **【建议值】**；本任务不改变上游城市和道路规则。只交真实生成的单视图与变体，不宣称完成§4.3全部四向或47-mask族。`autotile_mask` 无自动铺排含义时明确为 `null`。

### 10.2 提示词差异

```text
One isolated Mongol grassland camp tile, 13th–14th-century cultural context.
Original regional game adaptation: rough timber palisade and matte rammed earth;
or plain timber bridge / subdued steppe grass / low shrub, exactly as requested.
Match realistic Song-kit material detail and muted colors; no cartoon or glossy miniature look.
Orthographic yaw45 elevation30, 2:1 ground projection, parallel ground axes at +0.5/-0.5.
Screen-upper-left light, short screen-lower-right contact shadow; clean ground interface.
For gate: entire structure including two piers and overhead lintel, open passage floor alpha0.
True RGBA transparent background, full silhouette and clear margin, no scenery, text or grid.
No Qing palace tower, modern tourist camp, enormous flag, snow mountain, water patch or animals.
```

逐图保留完整调用、原始PNG、选取理由与裁切 / 等比缩放参数；不得用矩形色块填门洞，也不得用代码绘制缺失墙件。预览显示的棕色像素可能位于alpha0区域，应检查RGBA和合成效果后判断；不要仅按RGB视觉误做抠底。成品短边下限32px，不把植物或墙段放大到建筑画布下限。

### 10.3 参考资料、校验与默认值

- [UNESCO · Site of Xanadu](https://whc.unesco.org/en/list/1389/)（访问2026-09-30）：取草原宫城 / 帝城 / 外城与游牧营地并存、水系和草原环境；不支持本件木栅门、桥的精确形制。
- [元上都遗址](https://www.sjycysdyz.org.cn/)（访问2026-09-30）：取明德门青砖墙体、木门柱基与瓮城遗存作为墙门材质边界；本包仍是匿名营门意象，不复刻明德门尺度、券顶或瓮城。
- [UNESCO · Mongol Ger传统工艺](https://ich.unesco.org/en/RL/traditional-craftsmanship-of-the-mongol-ger-and-its-associated-customs-00872)（访问2026-09-30）：取木架、毡布和绳带材质语汇；不据现代工艺名录断言全部13世纪细节。
- [Pillow · Image module](https://pillow.readthedocs.io/en/stable/reference/Image.html)（访问2026-09-30）：核对RGBA、`crop`、`resize`与LANCZOS后处理接口；本次本机实际版本记录见任务报告，不将网页版本冒称本机版本。

2026-10-01另下载并逐张查看元上都遗址、现代蒙古木桥及蒙古西部旱地灌木照片，只用于成品后的墙线环境、木作和分枝习性审校；不证明营门、桥式或古代物种。逐件URL与用途见 manifest，均明标“未作为image_gen输入”。

默认7件均为 `candidate`；完整门楼的四向、孔掩膜与像素孔的精确重合、墙桥连续接缝及真机遮挡 **（待实测）**。新资产 `tex_town_mongol_*` 和套件标签 `mongol` 按本任务授权创建，具体ID见manifest；元骨架以外的地域枚举需上游后续登记。上述缺口沿用§9“按样例城效果后补”的默认，不以文件校验通过代替几何验收。
| 吐蕃7张单向件、门孔及墙缝 | 默认保留candidate，按原向装配；净宽按规划掩膜，像素接缝待城镇联调 |
| 吐蕃地域共用与历史差异 | 默认无名原创组合；具体年代、城门制度、植物古代栽植另考，不作为三城复原图 |
