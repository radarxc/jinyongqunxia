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

## 9. 待决事项与默认值

| 事项 | 默认值 |
|---|---|
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
