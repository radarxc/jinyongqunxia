# 建筑·地图拼接 · 宋基线与明江南套件提示词模板

> 归属：`assets/default` 的透明建筑地图件制作；不定义玩法、城市布局、运行时网格或相机。
> 上游：作者 [STYLE.md](../STYLE.md)、本任务、[素材登记约定](../../README.md)；`design/22` §1–§3、§7、§10–§11；`tech/07` §1.4、§2.7、§2.9、§5.5.2。
> 引用而不重定义：建筑 type / 占地由 `design/22` 拥有；城市配额与几何由 `town/schema.yaml`、两城 CitySpec 拥有；角色行走、遮挡和模型规则仍归技术文档。
> 标注约定：**（原创扩展）**为设计组合；**（待考）**为历史细部未逐字核对；**（待实测）**为拼接 / 真机未验证；**【建议值】**为本批制作参数。

本类采用**写实古风、45° 斜向、30° 俯仰、2:1 正交投影、真 RGBA 透明底**。作者新风格高于 `tech/07` 旧水墨口径。本文是可执行制作模板，不代表已产出图片全部通过视觉或几何验收；成图结论以逐张记录及报告为准，入库状态保持 `candidate`。

## 1. 读取版本与职责

- 本批读取只读快照 `/tmp/tianshu_town_design_snapshot_TOWN-buildings/`，时间 `2026-09-30T01:21:05.276316-07:00`；22 号文档为 924 行，SHA-256 为 `6c9e1afe2fd589b62f5e77efc99590dbc9e43c2766710a72f37c8d3312dc88e7`。schema 与两城文件的哈希见该目录 `snapshot.json`。
- 上游工作副本为 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/TOWN-design/`。收尾再比较其 `design/22` §3–§4，新增 / 改名 / 占地变动必须补齐或在报告列差异。
- 本轮最终复核于2026-09-30 03:00（−07:00）：上述工作副本已移除，改只读主项目已合入提交`83ef35f`的同名文件。22号文档1048行，原建筑/贴片清单未变；新增§4.4植物7类14变体已按本文§10补齐。四文件SHA与时间见`baseline/building-map/design-recheck.json`。
- 本任务按 §3.2–§3.3 交两套各 19、合计 **38 个建筑 type**。同类可共享几何或图集，但每个 type 都须有自己的元数据，不能把大理素材身份自动等同南宋考据结论。
- 外城门完整 `tex_town_<era>_city_gate`、城墙转角和桥面 / 桥栏归 **TOWN-tiles**；本任务保留临安皇城门楼地标 `bld_lm_ch02_linan_palace_gate`。城门守舍是普通建筑，三者不同。
- 河埠只交装饰外观；不因 `wharf` 名称创建港口、航线或营生。大理当前 CitySpec 未使用的仓屋 / 河埠仍是本批清单项。
- 只有一张 45° PNG 时，交付能力须注明单视图；场景按 `allowRotation=false` 使用。目录允许旋转不等于本批已经提供所有朝向，不能旋转 PNG、镜像或声明不存在的 GLB 来补齐。

## 2. 风格与年代

| 项 | 制作要求 |
|---|---|
| 写实程度 | 可信木构、灰陶瓦、土石木材有区分，克制旧化；不做水墨、卡通、体素、塑料模型或微缩沙盘 |
| 相机 | `orthographic 2:1 dimetric, yaw 45 degrees, pitch 30 degrees, no perspective`；地面两轴斜率为 ±0.5，柱线竖直，对边平行 |
| 方向 | 规划东轴向屏幕右下、北轴向右上；原向南入口在屏幕左下侧。临安皇城门按目录北入口，不能照抄南入口模板 |
| 光源 | **画面左上主光，短软影向右下**；只保留接触影，避免大范围阴影干扰拼接 |
| 光向冲突 | 快照 `design/22` §7.4 仍写“左侧略朝观者、右侧略上”；本批按用户本次明确要求覆盖，须交上游同步，不静默宣称二者一致 |
| 背景 | 无天空、地平线、背景建筑、街景或厚地台；真实 alpha，不画棋盘格或白底假透明 |
| 留白 | 完整保留屋檐、台基、附属物与短影；非接缝轮廓不得触边。透明余量 **【建议值】** 至少 16 px，视高塔 / 长檐增加 |
| 入口 | 台阶与门前清楚；植物和器物不堵门，入口与底面中心分别标注 |
| 文字 | 无文字、伪字、题名、经文、签名、标尺、网格、水印或 UI；空白布幌可以保留 |

### 2.1 大理国 · `song_dali` · 约 1093

大理与北宋并行，不写成宋辖城市。用朴素灰瓦、土墙、木石、克制砖铺、低密院落与局部山茶意象回应作者要求；佛寺、经幢院与王府可增加佛教母题。不能把当代白族旅游街、明清三坊一照壁或重建五华楼直接倒推到 1093。具体屋顶、斗拱、白墙、门窗、佛龛、植物种及栽植史仍 **（待考）**。

千寻塔采用方形密檐砖塔的轮廓母题；小塔采用八角密檐砖塔。两座小塔建造期为 1108–1172，晚于本场景，按上游保留三塔关系时须标 **（原创扩展：提前出现）**。本批占地与视觉高度是游戏概化，不宣称比例压缩后的素材具有文物实测尺寸。

### 2.2 南宋临安 · `song_southern` · 约 1223

用维护较好的木构、灰瓦、窄面阔商铺、竹帘 / 布篷和瓷器货架表达繁华；繁华靠商业陈设、楼层和组合密度，不靠巨大牌坊、现代广告或满街灯笼。官署、皇城殿堂和寺观按等级区别，普通店铺不堆宫廷重檐或清式彩画。酒楼、茶坊与药铺均为无名业态意象 **（原创扩展）**，不造新 `biz_*`。

宋代“镖局”成熟称谓与组织年代仍 **（待考）**；默认生成护运行 / 货栈院落外观，不画字号、旗上文字或具名历史镖局。南宋河埠保持码头台阶、装卸木台等装饰，不加入船与旅行入口。

## 3. 首批完整清单

下列 `type` 同时作为本批 PNG 文件 ID；先全仓搜索复用，不添加 `ref_` 替代正式清单名。占地按原向东西 × 南北规划格，每格 1 m；此表不改变 CitySpec 的实际生成数量。

| type / 文件 ID | 清单条目 | 占地 `[w,h]` | era |
|---|---|---|---|
| `bld_kit_song_dali_house` | 白族民居意象（待考） | `[6,5]` | `song_dali` |
| `bld_kit_song_dali_courtyard` | 低密院落 | `[10,8]` | `song_dali` |
| `bld_kit_song_dali_shop` | 沿街铺屋；可表现药铺 | `[6,5]` | `song_dali` |
| `bld_kit_song_dali_inn` | 客栈 | `[10,8]` | `song_dali` |
| `bld_kit_song_dali_restaurant` | 酒楼 / 茶肆 | `[10,8]` | `song_dali` |
| `bld_kit_song_dali_market_stall` | 市集摊棚 | `[3,2]` | `song_dali` |
| `bld_kit_song_dali_yamen` | 官署衙门 | `[14,11]` | `song_dali` |
| `bld_kit_song_dali_biaoju` | 护运行 / 镖局外观（原创扩展） | `[12,10]` | `song_dali` |
| `bld_kit_song_dali_casino` | 赌场 | `[9,7]` | `song_dali` |
| `bld_kit_song_dali_manor` | 王府外围庄园 | `[15,12]` | `song_dali` |
| `bld_kit_song_dali_wangfu` | 大理王府 / 段氏宫室意象 | `[18,14]` | `song_dali` |
| `bld_kit_song_dali_temple_hall` | 佛寺殿堂 | `[12,10]` | `song_dali` |
| `bld_kit_song_dali_shrine` | 小佛龛 / 经幢院 | `[4,3]` | `song_dali` |
| `bld_kit_song_dali_guardhouse` | 城门守舍 | `[6,5]` | `song_dali` |
| `bld_kit_song_dali_stable` | 马厩 | `[8,6]` | `song_dali` |
| `bld_kit_song_dali_warehouse` | 仓屋 | `[9,7]` | `song_dali` |
| `bld_kit_song_dali_wharf` | 小河埠 | `[8,4]` | `song_dali` |
| `bld_lm_ch01_chongshengsi_pagoda` | 千寻塔意象 | `[7,7]` | `song_dali` |
| `bld_lm_ch01_chongshengsi_pagoda_small` | 小塔意象（原创扩展：提前出现） | `[4,4]` | `song_dali` |
| `bld_kit_song_southern_house` | 江南民居 | `[6,5]` | `song_southern` |
| `bld_kit_song_southern_courtyard` | 坊巷院落 | `[10,8]` | `song_southern` |
| `bld_kit_song_southern_shop_1f` | 单层商铺；可表现药铺 | `[6,5]` | `song_southern` |
| `bld_kit_song_southern_shop_2f` | 两层商铺 / 茶坊 | `[8,6]` | `song_southern` |
| `bld_kit_song_southern_inn` | 客栈 | `[12,9]` | `song_southern` |
| `bld_kit_song_southern_restaurant` | 酒楼 / 茶肆 | `[12,9]` | `song_southern` |
| `bld_kit_song_southern_market_stall` | 市场摊棚 | `[3,2]` | `song_southern` |
| `bld_kit_song_southern_yamen` | 官署衙门 | `[16,12]` | `song_southern` |
| `bld_kit_song_southern_biaoju` | 护运行 / 镖局外观（原创扩展） | `[14,11]` | `song_southern` |
| `bld_kit_song_southern_casino` | 赌场 | `[10,8]` | `song_southern` |
| `bld_kit_song_southern_manor` | 山庄 / 大院 | `[16,13]` | `song_southern` |
| `bld_kit_song_southern_palace_hall` | 皇城殿堂模块 | `[18,14]` | `song_southern` |
| `bld_kit_song_southern_temple_hall` | 寺观殿堂 | `[13,10]` | `song_southern` |
| `bld_kit_song_southern_pagoda` | 通用佛塔 | `[7,7]` | `song_southern` |
| `bld_kit_song_southern_guardhouse` | 城门守舍 | `[7,5]` | `song_southern` |
| `bld_kit_song_southern_stable` | 马厩 | `[9,7]` | `song_southern` |
| `bld_kit_song_southern_warehouse` | 河仓 / 货栈 | `[10,8]` | `song_southern` |
| `bld_kit_song_southern_wharf` | 河埠外观 | `[10,4]` | `song_southern` |
| `bld_lm_ch02_linan_palace_gate` | 皇城北向门楼意象；北入口 | `[14,8]` | `song_southern` |

允许旋转、入口边与配额逐项引用 `design/22` §3；不能用表中相同占地推定相同入口。元 / 明 / 清初 17 类仅为上游后续骨架，不在本次宋套件产图范围。

## 4. 像素几何、锚点与后处理

### 4.1 占地不等于画布

每格地面菱形 64×32 px，东一步为 `(32,16)`，北一步为 `(32,-16)`。因此原向 `w×h` 地面平行四边形包围框为：

```text
ground_width_px  = 32 × (w + h)
ground_height_px = 16 × (w + h)
east_edge  = (32w, 16w)
north_edge = (32h,-16h)
```

例：6×5 民居底面范围为 352×176 px；3×2 摊棚为 160×80 px；18×14 宫室为 1024×512 px。这些是**地面范围**，不是 PNG 最终尺寸。屋顶和高度向上外扩，檐口和短影可超出地面范围，透明画布还须留边。

检查器默认短边不小于 512 px；小件使用透明 padding 使最终宽高均至少 512，不把地面一律放大到 512，也不把画布宽误当占地宽。以摊棚为例，在 512×512 画布内保留 160×80 的地面尺度是合法做法。渲染器如按图宽缩放，必须消费本批地面范围 / 锚点元数据，不能将透明 padding 算进占地。

### 4.2 必须量取底面

先在原图标出地面同一平面的四角 / 可辨边端点，避开斜屋面、屋檐和外投阴影。计算两轴斜率 `m=Δy/Δx`，目标分别 `+0.5/-0.5`，默认容差 ±0.03 **【建议值，引用 design/22 §9.3】**；再核对对边平行、两轴长度比例对应 `w:h`。误差超限或底面无法辨认应重出，不靠写 metadata 使图片“合格”。

设可确认的四角投影为 `P0..P3`，底面中心为对角线交点；严格平行四边形可用 `(P0+P1+P2+P3)/4`。被遮挡的后角可由两条相邻平行边推算，但须记录端点、推算方法与测量误差。`building.anchor: [x,y]` 与 `anchor_px` 是**最终 PNG 左上原点下的底面中心像素坐标**，不是归一化坐标、图像中心、入口或 alpha 包围框底中点。

源图 footprint 宽为 `Ws` 时，等比系数 `s=32(w+h)/Ws`；源底面高度乘同一个 `s` 后仍应接近 `16(w+h)`。不能分别缩放宽高掩盖错误。若源裁切左上为 `(cx,cy)`，缩放后放到新画布 `(px,py)`，则：

```text
anchor_final = ((anchor_source_x-cx) × s + px,
                (anchor_source_y-cy) × s + py)
point_final  = ((point_source_x-cx)  × s + px,
                (point_source_y-cy)  × s + py)
```

### 4.3 允许的纯几何处理

1. 原 PNG 先逐字节留存到 `baseline/building-map/sources/<id>.png`，记录原工具路径、原始尺寸、原始 SHA；不得覆盖或重绘原图。
2. 用 PIL 读取 RGBA 与 alpha 非零包围框；只裁透明空白，不裁真实屋檐、薄影或工具溯源信息。候选本身已裁边时重出，扩透明边不能恢复缺失内容。
3. 按已量底面等比缩放，可用 LANCZOS；只做一次最终重采样，记录源裁框、比例、缩放后尺寸、最终画布、粘贴偏移和锚点变换。
4. 用全透明 RGBA 画布 pad，使宽高至少 512 且轮廓有安全余量；保持原 alpha，不能通过白底抠图伪装工具真透明结果。
5. 保存根目录 `<id>.png`，分别计算处理前后 SHA。保存后再 `view_image` 检查边缘和视觉比例；PIL 再测尺寸、模式、alpha 极值、透明像素数、非零 bbox 和四边触边情况。

**默认不允许**非等比拉伸、仿射剪切、透视 warp、旋转 / 镜像纠偏、代码补画底面或屋檐。若审核明确批准仅校正地面轴线的仿射例外，必须保留输入、矩阵、输出哈希与复验测点，且仍维持candidate；生成视角错误原则上回到 `image_gen` 重出。

## 5. 可复用提示词

将全部花括号替换为本张值，附上 §6 排除项；`manifest.prompt` 与 `sources/<id>.json` 保存实际发送全文，不能只保存此模板或事后概述。参考图用于风格时也必须先 `view_image`，并说明不能继承的旧光向 / 视角。

```text
Generate exactly one transparent building sprite for tianshu / default / building-map.
Asset ID and type: {registered_type}. Era kit: {song_dali_or_song_southern}.
Subject: {single_catalog_building_and_business_visual_cues}.
City and year: {city_id_historical_name_year}; no readable signs or text.
Footprint: {w} metres east-west by {h} metres north-south, {w}×{h} planning cells.
Orthographic 2:1 dimetric projection, yaw 45°, pitch 30°, no perspective convergence.
East ground axis projects down-right at slope +0.5; north projects up-right at slope -0.5.
Parallel ground edges remain parallel; vertical columns remain vertical.
Show a thin, clearly readable ground-contact footprint; no thick diorama plinth.
The footprint must preserve the {w}:{h} axis-length ratio; do not confuse it with canvas ratio.
Original entrance faces {S_or_N_or_catalog_edge}; keep entrance and threshold visible.
Historical realism: {regional_materials_roof_structure_stories_and_specific_cues}.
{known_historical_motif_and_explicit_original_extension_constraints}.
Natural warm-neutral light from screen upper left, short soft contact shadow toward lower right.
No large cast shadow; preserve readable material detail beneath the eaves.
The image is a single asset, not a street scene or a complete city block.
{reference_roles_if_any}; references guide material and style only, never copy an unsuitable era.
Real RGBA transparent background; all roof tips, base corners and attachments inside the image.
Leave generous fully transparent margin on all four sides; no cropping and no checkerboard.
No characters, no modern objects, no text, no watermark, no labels, no grid.
The final 64×32-pixel-per-cell calibration is performed by uniform geometric scaling after inspection.
Negative constraints: {paste_full_relevant_exclusions_from_section_6}.
```

高塔应单独生成完整轮廓；不要求屋顶与地面同时挤满方形。摊棚、河埠等低件允许大面积透明画布；不要为填满画幅额外添加不属于单体的树、院墙、道路或人物。

## 6. 排除项

```text
text, Chinese characters, pseudo-glyphs, letters, numbers, calligraphy, readable shop signs,
signature, added watermark, logo, UI, labels, ruler, grid, frame, baked checkerboard,
opaque background, white halo, sky, horizon, distant scenery, neighboring buildings,
modern concrete facade, power lines, electric lights, vehicles, plastic, glass storefront,
ink wash, rice-paper texture, cartoon, anime, voxel, low-poly toy, plastic render,
miniature diorama, floating island, thick presentation base, tilt-shift, depth of field,
perspective convergence, unequal ground-axis slopes, crooked columns, warped foundations,
missing roof tips, cropped base, blocked entrance, melted tiles, intersecting unsupported beams,
Japanese torii, European fantasy architecture, steampunk, cyberpunk, floating xianxia palace,
Qing-style imperial decoration applied to Song shops, modern tourism-style Bai courtyards,
modern reconstructed Chongsheng Temple halls, decorative writing, dense red lantern rows,
right-side key light, leftward shadow, large baked cast shadow, heavy fog, bloom, HDR glare.
```

大理“小塔提前出现”是本清单明确的原创扩展，不能沿用旧模板将两座小塔一律排除。具名千寻塔也不套普通木塔模板。不得删除或伪造工具原生溯源标识；上述水印排除指不主动生成画面水印。

## 7. 调用、参考与入库记录

1. 读取 §3 清单并全仓搜索 ID；每个 type 优先取得一张合格候选，不以文件数替代清单覆盖。
2. 新图使用内置 `image_gen`，`transparent_background: true`。没有图像输入时省略参考参数并记 `references: []`；有输入时传完整 `referenced_image_paths`，不能同时传 `num_last_images_to_include`。
3. 先 `view_image` 查看每一张实际参考，再核对 ID / 状态 / SHA。`approved` 建筑立绘只能用于材质和气质，不能继承摄影透视、清代装饰或不符本批要求的光向；本批合格候选可作为风格参考，但必须仍记录其 `candidate` 状态。
4. `references` 逐项登记源 ID、路径、实际输入 SHA、用途和使用时状态；并行工作副本可能改写同名文件，哈希与调用记录必须固定当时版本。只阅读史料网页不算图像模型参考输入。
5. 原工具产物保存于 `sources/<id>.png`；调用记录保存于 `sources/<id>.json`，含实际 prompt / negative、调用时间、参考路径与哈希、工具回执源路径、输出尺寸与原始 SHA，以及工具确实公开的模型字段。未公开的底层模型、seed 不编造。
6. 完成 §4 纯几何处理后保存根目录 `<id>.png`；`meta/<id>.yaml` 记录占地、入口、锚点、可用视图、量点、缩放过程、alpha 和视觉检查。高度、碰撞 / 遮挡多边形若只是制作估计，须明确标建议或待实测，不能声称已完成运行时验证。
7. 根 `manifest.yaml` 顶层为列表，每张入选图一条，`status: candidate`。原始文件留在 `sources/` 作溯源，不另凑入选数量；失败候选的原图及淘汰原因保持可追溯。

| 字段组 | 要求 |
|---|---|
| README 字段 | `id,file,category,style,subject,prompt,negative,references,tool,model,effort,created,source_path,size,sha256,status,notes`；时间用带时区 ISO 字符串 |
| 本批用户要求 | `building: {type, footprint: [w,h], anchor: [x,y], era}`；anchor 单位为最终图像像素 |
| design/22 扩展 | `footprint_m`、`entrance`、`projection_contract`；与对应 meta 中占地 / 入口 / 投影一致 |
| 处理溯源 | 原始路径与 SHA、源尺寸、裁框、等比系数、目标画布、粘贴偏移、处理后 SHA；全部保存实际值 |
| 能力声明 | 实际提供的相机 / 方向；单 PNG 不假称四向或 GLB。文件里没有的模型路径不能填成已完成资源 |

当前快照 `town/schema.yaml` 定义 CitySpec / TownLayout，**没有单独定义上述素材 manifest 的 `building` 嵌套结构**。该结构按用户要求执行，不能把一般 YAML 可解析称为“已通过该 schema 的素材验证”。`meta/<id>.yaml` 是本批按 `design/22` §3.5 的逐 type 交付方式。

## 8. 逐张质检与交下游

| 检查 | 方法与失败处置 |
|---|---|
| 图像读取 | 每张生成原图及处理结果都 `view_image`；查看屋檐、地基、入口、瓦垄和材料，不只读提示词 |
| 投影 | 保存两轴端点与斜率实测；目标 `+0.5/-0.5`、默认容差 ±0.03，核对对边平行与 `w:h` 比例；超限重出 |
| 尺度与锚点 | 按地面量点等比标定，验证目标宽高及底面中心；不得用 canvas / alpha bbox 的尺寸替代 footprint |
| 光向 | 对照受光面与柱脚 / 台基影子，左上亮、短影右下；没有可分离影子时记录无法精确量向，不伪报测值 |
| 真透明 | PIL 确认 `mode == RGBA`，记录 alpha 实测极值及透明 / 半透明 / 近不透明像素数；须有 alpha=0 的背景与充分不透明的主体。最大值 254 也可能是真 RGBA，不能强制改成 255；全不透明或全透明均失败 |
| 边缘 | 记录非零 alpha bbox、四边非零像素数及最小余量；在明暗底查看白边、杂点和断檐。透明通道合格不等于无视觉光晕 |
| 年代与风格 | 对照 §2 与真实参考输入；不把现代重建或清式装饰称为宋代复原。具体历史不确定性逐图保留 |
| 单体用途 | 摊棚和商店通过器物辨用途，无伪字；城门守舍不画成外城门；河埠不携带旅行功能 |
| 覆盖 | 38 个 type、19+19 分套统计；每图有根 manifest 与 meta，尺寸 / SHA 与实文件一致 |
| 渲染验证 | TOWN-render / TOWN-assemble 检查路边落点、门前通行、檐口遮挡、排序与锚点；本批 candidate 不等于 release 可用 |

```bash
python3 tools/agents/check_assets.py assets/default/baseline/building-map --min 8 --max 40
```

该脚本检查文件、登记必填项、数量、格式、短边 ≥512、size、SHA 与状态；它**不验证** RGBA、底面几何、视角、光源、时代、锚点或作者审批。以上检查必须另外完成并如实记报告，不能以脚本通过代替视觉与拼接验收。

交 TOWN-render 时须强调：地面像素范围与透明 canvas 不同；锚点随 crop / scale / pad 一起变换；接触影不进入碰撞；只有 45° 单视图不能直接旋成其他朝向。外城门另从 TOWN-tiles 消费，不重复从建筑配额实例化。最终合成、遮挡 / 屋顶淡出与真机效果仍 **（待实测）**。

**不可二次按 PNG canvas 宽标定占地。** 规范化仅将底面左右跨度缩到 `32(w+h)`；64×32为目标网格，斜率、底面高度和宽深比例残差仍须单列，不能称完整投影已校准。基础候选审图以原像素 1:1 粘贴整张 PNG。若运行时改用 `tile_width_px`，统一系数 `q=tile_width_px/64`，对整张图和 anchor 同乘 `q`，左上放置点为 `project(footprint_center)-q×anchor_px`。不能再用 `32(w+h)/image.width` 缩图，否则透明 padding 和屋檐会使建筑、门高与地面一起缩错。整数重采样可能造成亚像素地面跨度误差，保留实际缩放记录供下游核对。

## 9. 参考资料与使用范围

- [大理州人民政府：崇圣寺三塔](https://www.dali.gov.cn/dlzrmzf/c101724/pc/content/1968887530844688384/content_1968887530844688384.html)：本轮于 2026-09-30 实际读取正文；支持千寻塔方形 16 级密檐、小塔八角 10 级密檐及小塔 1108–1172 年代。亦明确现大雄宝殿仿清代太和殿、雨铜观音殿 1999 年重建，因此这些现代殿宇不能直接作 1093 复原源。
- [扬州中国大运河博物馆：《咸淳临安志》里的城市蓝图](https://www.grandcanalmuseum.cn/yunboxinwen/1091.html)：本轮于 2026-09-30 实际读取正文；支持御街商业密集的母题。图版是 1830 年仿宋重刊，上西下东、左南右北；它不证明本批每座单体的精确形制和 1223 年街线。
- [杭州市文化广电旅游局：皇城遗风](https://wgly.hangzhou.gov.cn/cn/hzzx/syqx/sywh/hcyf/index.html)：上游列举来源；本轮打开失败，未用它新增确定的建筑细节。
- 旧 ART-B 模板引用《梦粱录》茶肆与昆明植物研究所山茶科普，作为生活 / 地域母题线索保留；本轮没有逐字复核这些材料，宋茶器、植物种和古代栽植仍 **（待考）**。官方三塔页面的当代园林植物描述也不能证明 1093 庭院栽植。
- 宋套件本轮上述网页仅用于文字核验；没有将历史画作、旅游照片或网页截图送入对应图像模型。吐蕃套件在成品生成后另做历史影像 QA，见 §11.1；两类都以每次调用记录为准，不把“事后查阅来源”写成“模型已参考图片”。

## 10. 收尾新增：植物公告板母版

上游在本批出完38类建筑后新增 `design/22` §4.4，将以下7类、每类2变体交给TOWN-buildings。它们位于 `baseline/building-map/props/`，单独清单，不改变§3的38类建筑计数。根manifest只登记建筑；`props/manifest.yaml`登记14个`(asset_id,variant_key)`，原生小尺寸由新条款决定，不能为建筑检查器扩成512画布。

| asset_id | 两变体 | s / Y（m） | 固定画布（px） | 固定根锚（px） |
|---|---|---|---|---|
| `prp_song_dali_camellia` | v01疏花 / v02密花 | 2 / 1.5 | 136×131 | (68,95) |
| `prp_song_dali_bamboo` | v01疏枝 / v02密枝 | 2 / 3 | 136×190 | (68,154) |
| `prp_song_dali_broadleaf` | v01窄冠 / v02圆冠 | 2 / 4 | 136×229 | (68,193) |
| `prp_song_dali_grass` | v01低簇 / v02散叶 | 1 / 0.5 | 72×60 | (36,40) |
| `prp_song_willow` | v01疏枝 / v02密枝 | 2 / 4 | 136×229 | (68,193) |
| `prp_song_bamboo` | v01疏枝 / v02密枝 | 2 / 3 | 136×190 | (68,154) |
| `prp_song_broadleaf` | v01窄冠 / v02圆冠 | 2 / 4 | 136×229 | (68,193) |

尺寸引用上游 **【建议值】**：`v=ceil(16√6Y)`，画布`(64s+8,32s+v+8)`，根锚`(32s+4,16s+v+4)`。逻辑footprint始终1×1、`placement_domain: land`、`collision: none`；s/Y仅是视觉包络。枝叶可以超出逻辑一格，不能把画布宽当占地。植物形态为（原创扩展），物种细节与1093/1223栽植（待考）。

植物专用提示词骨架，生成时须替换占位并保存完整实发版本：

```text
One isolated realistic {plant_species_or_regional_motif}, {variant_density_or_crown}.
One decoration object, not the 2–5-object procedural grouping; full crown and root visible.
Historical {Dali1093_or_SouthernSong1223} visual motif, no pot or modern gardening fixture.
Target orthographic yaw45 elevation30; soft upper-left light and natural restrained colors.
TRUE transparent RGBA, transparent leaf gaps, generous blank margins on every side.
No soil island, plinth, background, horizon, neighboring plants, people, text or watermark.
Absolutely NO ground shadow: runtime draws contact shadow separately.
All plant content above the lowest root-contact line; no pixels or shadow below it.
The source will be uniformly fit into {native_canvas} with ground/root anchor {anchor_px}.
```

植物后处理另用 `props/normalize.py`：以alpha≥3包围框外扩4源px作**矩形透明边裁切**，另存被裁非零像素数和最大alpha，断言裁去区域最大alpha≤2；原图完整保留。这个分析阈值不写回alpha，不逐像素抠图或改色。之后一次目标等比LANCZOS（整数像素量化）、原生尺寸透明pad；左右至少4px，根y之下全部透明。原图点按左上外缘(0,0)的连续坐标、裁框半开区间记录；实际根偏差另列，不能冒称精确落根或实测树高。真正的枝叶、台基或阴影低于根点时须图像工具修正，不能用此裁框删掉实物。

逐asset metadata必须含`asset_id / placement_domain / footprint_cells / visual_bounds_m / collision / projection_contract / variants`；两个variants按v01/v02排列，分别记录file/size_px/anchor_px及检查结果。根以下alpha、四边留白、原/成品SHA和根锚变换须另验。`prp_*`不能解析成terrain，TOWN-render按图像与根锚生成无碰撞公告板`prop/model`；本批未交GLB。两个变体均获作者approved后才可release。

附加植物文件检查采用原生最小高度60px，不替代上面建筑检查：

```bash
python3 tools/agents/check_assets.py assets/default/baseline/building-map/props --min 14 --max 14 --min-side 60
```

## 11. 宋 · 北方中原套件 `song_north`

本批面向北宋东京开封、西京洛阳、大名的匿名拼装建筑，年代窗口约1093；不是某城逐栋复原。2026-09-30 按宋画、现存北方同期木构、考古图版与《营造法式》图样重出全部19件；制作仍用45°斜向 / 30°俯仰 / 2:1地面投影、左上光和右下短接触影。匿名功能组合为**（原创扩展）**，不把参考实物的具名身份转移给成图。

### 11.1 年代差异与占地来源

- 普通民居用暖灰泥土墙、局部灰砖台基、哑光木构与灰陶瓦；院落强调围墙和较完整的正房 / 厢房。此为美术取舍，不把明清北京四合院定式或江南马头墙倒推到宋代。
- 商铺沿街开敞，用货架、布棚、竹帘区别业态；酒楼 / 茶肆以楼层和廊栏表达繁华。参考故宫《清明上河图》馆藏介绍，不照搬现代复建景区。
- 官署、寺观、宫殿用克制赭朱木构和局部装饰，避免清式和玺 / 旋子彩画、宫廷黄瓦泛化。1103刊行《营造法式》只作时代参照，不宣称准确复原1093构件尺度。
- 佛塔取开封铁塔的八角、褐色琉璃砖母题；成图层数与细部以实际候选记录为准，不以金属铁架表现“铁塔”。
- `biaoju` 用货栈 / 护运行院落表达；宋代成熟“镖局”称谓仍待考。赌场、山庄为项目功能外观，不新增营生或具名机构ID。河埠不带船、水景或旅行入口。

**历史细节要点（重出硬约束）**：低等级房屋用低缓灰陶板瓦 / 筒瓦、平直主脊或素脊端、直棂窗、板门、石柱础、抹灰夯土 / 土坯芯与粗灰砖脚；不套江南马头墙。商铺取《清明上河图》的开间、木柜、苇帘与临时布棚，但绝不复制画中文字。高等级殿堂取正定隆兴寺摩尼殿的柱网、抱厦、低缓大屋面和铺作层次，并以《营造法式》屋架 / 栱件图控制举折和出跳；主殿可用两层铺作、两短出跳、克制鸱尾与少量脊饰，普通房只用直承或一层一短出跳。塔取开封铁塔褐色琉璃砖表皮、仿木铺作和逐层收分，并以正定凌霄塔作北方塔比例比较，不是任一具名塔的复制。独乐寺观音阁仅作辽宋同时期北方楼阁比例比较，不称宋代实物。

参考主源：故宫藏宋本《清明上河图》及其桥、市肆、郊道局部；隆兴寺摩尼殿照片和测绘图；开封铁塔、正定凌霄塔；《营造法式》屋架与栱件图；《金明池争标图》。逐件URL和实际取用细节写入 `building-map/song_north/manifest.yaml`；历史图仅作形制、比例、材质和构造依据，不复制构图。

| 本套件后缀（均加 `bld_kit_song_north_`） | 占地 `[w,h]` | 依据 |
|---|---|---|
| house_small / house_large | `[6,5]` / `[7,6]` | 小型复用§3.3民居；大型借§3.4 house骨架为【建议值】，非元代造型 |
| courtyard / shop_1f / shop_2f | `[10,8]` / `[6,5]` / `[8,6]` | design/22 §3.3同功能项 |
| inn / restaurant / market_stall | `[12,9]` / `[12,9]` / `[3,2]` | 同上 |
| yamen / biaoju / casino | `[16,12]` / `[14,11]` / `[10,8]` | 同上 |
| manor / palace_hall / temple_hall | `[16,13]` / `[18,14]` / `[13,10]` | 同上 |
| pagoda / guardhouse / stable | `[7,7]` / `[7,5]` / `[9,7]` | 同上 |
| warehouse / wharf | `[10,8]` / `[10,4]` | 同上 |

### 11.2 提示词差异片段与交付

在§5模板中替换城市 / 年代 / 类型 / 占地，并附本片段；逐件实发全文、实际参考输入及源SHA以 `building-map/song_north/manifest.yaml` 为准。

```text
Northern Song north-central China, circa1093, anonymous Kaifeng/Luoyang regional module.
Quiet realistic Song building-sprite detail, matte weathered dark timber, grey clay tiles,
warm grey earth-plaster walls, restrained brick footings; clear northern courtyard enclosure.
Open-front urban commerce where appropriate, no Ming-Qing tourism streets or horse-head walls.
No Qing imperial polychrome or ubiquitous yellow glazed roofs; no text or named institution.
South entrance faces lower left. Genuine RGBA, readable base edges and base-centre anchor.
Keep yaw45 / pitch30 / 2:1 orthographic ground axes and upper-left light of the Song kit.
```

每件最多2候选选1；只做裁切、一次等比缩放和透明扩边，不用非等比变形修正几何。短边≥256、透明边≥16px为本任务门槛，区别于早期宋基线短边512；`32(w+h)`仍只标定底面宽度。保持 `candidate` 和单视图 `allowRotation=false`，精确斜率 / 占地比残差在条目中保留，不能以清单校验通过代替总装验收。

历史来源及访问状态见 `tools/agents/reports/KIT-song_north-hist.md` §7；本轮接口确认模型标识为 `gpt-image-2`，但版本快照、seed、价格与限额未披露，均**（待核实）**。地域风格、塔层概化与正式上游目录接纳交作者确认，默认沿用本批候选；运行时遮挡与总装效果仍**（待实测）**。
## 11. 西域地域套件 · `xiyu`（KIT-xiyu）

本节是本次作者授权的地域扩展；不改 §3 的宋清单。输出位于 `assets/default/building-map/xiyu/`，19 类各一张，均为 `candidate`。`era: xiyu` 表示可供不同书界选择的地域素材族，不表示某个具体朝代，也不证明一套现存形制在全部年代都存在。喀什、和田、叶尔羌仅为地域参考，不建立城市新 ID 或具名古迹复原。

### 11.1 与宋模板的差异

| 项 | 西域提示词差异与依据 |
|---|---|
| 屋顶 / 墙体 | 灰瓦坡顶改为土木平顶、低女儿墙、外露木梁头、土坯及克制熟砖，灰白墙改为低饱和赭土色；不套现代旅游仿古街。 |
| 民居 / 院落 | 小院、外廊、局部方形抬高采光体，木雕侧窗与廊柱；这些来自阿依旺地域母题，具体古代用例（待考）。 |
| 商业 | 巴扎铜陶器、织物、布 / 芦苇遮棚；茶肆承接酒楼槽位，商队护运货栈承接镖局槽位；无伪字招牌。 |
| 宗教 | `temple_hall` 画匿名清真寺礼拜殿，`pagoda` 承接宗教地标槽位并画邦克楼。穹顶、砖拱与塔身是（原创扩展）组合，不宣称复原艾提尕尔现貌或宋元寺院。 |
| 其他功能 | `casino` 为独立匿名游艺茶院（原创扩展），不与宗教设施绑定；`wharf` 为渠岸作业台，不增加船、航线或港口。 |
| 保持一致 | 宋基线的写实材质与细节密度、斜向相机、左上光、右下短接触影、真 RGBA、完整轮廓及底面中心锚点；不继承灰瓦及中式翘檐。 |

占地来源明确分开，均为规划格而非历史建筑实测：

| 来源 | `bld_kit_xiyu_` 后缀 / 占地 |
|---|---|
| `design/22` §3.4 骨架 | `house_small` 7×6；`shop_1f` 7×5；`market` 5×4；`yamen` 16×12；`biaoju` 14×11；`palace` 24×20；`temple_hall` 14×11 |
| §3.3 同功能映射 | `courtyard` 10×8；`shop_2f` 8×6；`inn` 12×9；`restaurant` 12×9；`casino` 10×8；`manor` 16×13；`pagoda` 7×7；`guardhouse` 7×5；`stable` 9×7；`warehouse` 10×8；`wharf` 10×4 |
| 本套件新增分型 | `house_large` 10×8 **【建议值】**，沿院落包络给大宅分型（原创扩展）；不冒称 §3.4 已定义。 |

### 11.2 提示词与制作记录

```text
ONE isolated realistic historical Kashgar / Hotan / Yarkand oasis map building.
Mudbrick, muted sandy ochre plaster, flat earth roofs, low parapets, timber joists;
restrained carved geometric wood lattice and shaded porch, function-specific props.
Orthographic yaw45 elevation30, 2:1 dimetric ground axes slopes +0.5 / -0.5;
specified rectangular footprint, south door screen lower left, three base corners clear.
True transparent RGBA, complete roof/base and generous empty margin, no thick plinth.
Soft upper-left light, very short lower-right contact shadow, no background or halo.
No text, pseudo-writing, people, modern goods, tiled Chinese eaves or glossy toy look.
```

以上为差异模板；**实际逐张完整提示词、真实输入图片及哈希以本包 manifest / sources 记录为准**。只阅读网页或目视宋图的部分不冒记为工具图像输入。每张最多 2 个候选，每张原图与规格化结果均检查；PIL 仅裁矩形边、等比缩放、透明扩边，灰底合成只用于 QA，不替换透明成品。

本任务建筑检查短边为 ≥256 px，低于 §4 首批宋件的 ≥512 px 门槛；这是西域任务的专用检查参数，不覆盖宋基线，也不改变地面标尺。`s=32(w+h)/(Rx-Lx)`，最终锚点由底面左右对角中心随裁框 / 缩放 / padding 变换；不能按 PNG 整宽再次标定。轴向与宽深比残差逐件登记；`candidate` 不豁免双轴 ±0.03 与占地比例检查，超差即返修未通过。每件仅原向 PNG，`allowRotation:false`；四向、碰撞 / 遮挡、具名城镇总装仍（待实测）。

第2轮返修以按登记占地绘制的实心几何参考为主要输入，提示“texture-only; trace ALL polygon boundaries; preserve camera and ground corners”；旧图只作材质参照，避免继承错误相机。生成后的真实底角重新量取，不把参考图坐标当作实测；alpha 轮廓直线拟合仅辅助检查，不改成品像素。每项本轮最多2候选，历史调用仍保留在原记录中；本轮记录见 `xiyu/sources/round2/`。仍超差者在 QA / 报告明确列为未完成，不能以候选状态代替修复。

### 11.3 参考资料与年代边界（访问 2026-09-30）

- [中国非遗网：维吾尔族民居建筑技艺（阿依旺赛来民居营造技艺）](https://www.ihchina.cn/art/detail/id/14735.html)：取敞开庭院、方形抬高采光体、侧窗木雕及几何纹；未证明各书界具体年代。
- [喀什大学建筑学院：走进高台民居](https://jzy.ksu.edu.cn/info/1421/1871.htm)：取黄粘土与木、芦苇等营造材料，不据现代调研反推古代层数。
- [新疆自然资源厅：莎车古勒巴格村规划经验](https://zrzyt.xinjiang.gov.cn/xjgtzy/c112467/202303/720d143cd67c489498bc45fbbaea9816.shtml)：取平屋顶使用与入口葡萄廊架的地域意象。
- [喀什公署：艾提尕尔清真寺简介](https://www.kashi.gov.cn/ksdqxzgs/c106707/202307/28cd99dc43a244619788bda878887922.shtml)：取礼拜殿 / 木柱长廊 / 召唤阁楼的功能区别；1442 始建的资料不作为宋元复原依据。
- [新华社：新疆喀什老城改造纪实](https://www.xinhuanet.com/politics/2015-09/26/c_1116687056.htm)：只取沿街巴扎、铜铁木作等业态母题，不照抄现代改造外观。
- [新疆政府：汗诺依古城考古成果](https://www.xinjiang.gov.cn/xinjiang/dzdt/202201/4a664aaf2f094721adfe8fbd67338eaf.shtml)：取 10 世纪泥土垒筑城墙、南北设门的材料母题；不据此推定本包城门尺寸。
## 11. 明 · 北方套件 `ming_north`（2026-09-30）

本节追加19张地图建筑的年代差异；宋套件章节和既有待决条目保留。入口、投影与布局仍引用 `design/22` §1–§3，不扩充玩法规则。成品位于 `assets/default/building-map/ming_north/`，完整实发提示词见逐条 manifest / sources JSON，全部为 `candidate`。

### 11.1 年代、形制与功能

- 明代北方府城意象以青灰砖、灰陶瓦、灰土墙、深色木格扇和较规整合院为主；硬山民居、货栈、山庄与歇山寺殿、王府等级分开。结构、门窗、彩画细部仍 **（待考）**，匿名构图为 **（原创扩展）**。
- 硬山差异必须写到形态：山墙与屋面端部齐收，砖砌三角山墙升至脊部，不继承宋基线的悬挑山面、显著翘角；材质和细节密度继续参照宋图。官署保留檐口装饰，不把“本套件硬山倾向”误写成全部屋顶硬山。
- 王府主殿以克制深绿琉璃、朱木与灰瓦配房区分等级；“青琉璃”可有多种蓝绿色，不能把深绿写成明代所有王府的唯一色。只交22×18模块，非整座皇宫。
- 佛寺殿堂取智化寺黑琉璃、朱木母题；塔取北方八角砖塔意象。塔按游戏构图压缩，入选塔的密檐间距仍偏大；不冒称慈寿寺十三级、尺寸或现存文物的精确复原。
- 商铺可服务当铺等匿名业态，山庄大院可作会馆的美术模块；本轮不新增“当铺/会馆”玩法ID。镖局以护运货栈表现，成熟字号与组织史继续 **（待考）**。河埠仅装饰，不生成航线、船或旅行入口。

| 类型 / 同构资产后缀 | 占地 `[w,h]` | 来源 |
|---|---|---|
| house_small / shop_1f / shop_2f | 7×6 / 7×5 / 7×5 | `design/22` §3.4 明民居 / 商铺骨架 |
| yamen / biaoju / wangfu / temple_hall | 16×13 / 15×12 / 22×18 / 14×11 | 同节对应明骨架 |
| house_large / courtyard | 均10×8 | **【建议值】** 借§3.3院落，区分大民居与完整合院构图 |
| inn / restaurant / market_stall / casino / manor | 12×9 / 12×9 / 3×2 / 10×8 / 16×13 | **【建议值】** 借§3.3同功能项 |
| guardhouse / stable / warehouse / wharf | 6×5 / 8×6 / 9×7 / 8×4 | **【建议值】** 借§3.2–§3.3同功能项 |
| pagoda | 7×7 | **【建议值】** 借§3.2塔的占地，不继承地标身份 |

本节资产ID / type均为 `bld_kit_ming_north_<上述后缀>`，`era: ming_north`；创建前已全仓检索，不覆盖通用 `bld_kit_ming_*` 骨架。19项与用户功能项一一对应，无西域 / 吐蕃 / 蒙古功能替换。

### 11.2 提示词差异段

在§5通用投影、光源、透明与无文字约束之后追加，具体功能以各source JSON实发版本为准：

```text
Ming dynasty northern Chinese prefectural town, anonymous original period-inspired design.
Use the Song reference ONLY for realistic material finish and fine detail density.
Grey brick and earth-grey plaster, matte grey clay tiles, dark timber lattice doors.
Residential and freight roofs: NORTH CHINESE YINGSHAN hard-gabled roofs,
flush triangular masonry gable ends rising to the ridge, no gable-end overhang,
no upward-curled corner tips; keep palace and temple roof grades distinct.
Princely hall: restrained dark green glazed main roof, grey tiled subordinate wings.
Temple hall: black-grey glazed hip-and-gable roof, subdued red timber and beam paint.
Brick pagoda: octagonal masonry shaft, closely spaced corbelled brick eaves,
no pavilion-like ceramic roofs; do not claim an exact named heritage reconstruction.
South entrance faces screen lower-left; exact footprint axis ratio from catalog.
Orthographic yaw45 elevation30, 2:1 ground projection, upper-left key light,
short lower-right contact shadow, true RGBA with clean transparent outer margins.
No people, text, modern fittings, ornate Qing corner tower, golden fantasy palace,
sky, scenery, huge diorama base or fake checkerboard background.
```

### 11.3 规格化、验收与默认值

本套件专用 `normalize.py` 只以alpha≥3轮廓外扩4源px确定矩形裁框，断言裁去像素alpha≤2；不改变保留区alpha或RGB。原图完整归档。按可见底面L/F/R手工测点：`s=32(w+h)/(Rx−Lx)`，中心`(L+R)/2`随裁切、一次等比缩放及透明pad变换；四周至少16px，短边至少256px（本任务门禁）。整数重采样误差记录在meta；禁止按画布宽再次缩放。

相机数值为目标，实际斜率与宽深比例以meta实测代理为准；`±0.5`轴容差±0.03引用上游，比例误差10%为制作告警 **【建议值】**。不做非等比/仿射纠偏。第3轮仅对审核点名10张建筑各生成1–2候选，替换9张，衙门因新候选更差保留原图；其中8张底面外轮廓及占地比例进入容差，山庄与衙门仍告警。赌场、两层商铺、客栈、王府仅裁去多余铺地外缘，保留主体；内部砖缝、横梁未重投影，底轮廓达标不等于整体3D投影验收。门前台阶、院内通行、遮挡、高度、四向和GLB均未验收。默认只作原向静态试贴，`allowRotation:false`，不能视为发布金样 **（待实测）**；旧轮问题与候选保留于sources追溯。

参考资料（访问2026-09-30；网页只作文字核验，未将网页照片输入模型）：[北京传统民居——老北京四合院](https://www.beijing.gov.cn/tsbj/sxym/202007/t20200713_1946380.html)支持正房、倒座与厢房围院母题；[北京老城房屋修缮标准解读](https://www.beijing.gov.cn/zhengce/zcjd/202004/t20200426_1882617.html)只支持传统木门窗、合瓦 / 筒瓦与避免“南装北饰”，两者均不证明明代每处细部；[万寿寺修缮见闻之屋顶形式（上）](https://www.beijing.gov.cn/renwen/sy/whkb/201810/t20181009_1864550.html)支持硬山屋檐不出山墙的形态定义，不据其清代实例倒推全部明代民居；[北京市文物局：智化寺](https://wwj.beijing.gov.cn/bjww/362760/362767/2021nwhhzrycr/wwbh/10998901/index.html)支持明代彩画与黑琉璃；[慈寿寺塔](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523526/index.html)支持明代八角密檐实心砖塔母题；[故宫博物院院刊：试论明代藩王所用建筑琉璃的烧造、使用与组织管理](https://www.dpm.org.cn/journal/371479.html?_list=1)支持明代藩王青琉璃的地方釉色差异，未据此宣称重建某座王府。

**需作者确认，默认沿用：** 19类分工及借用占地、王府配色、塔式概化、河埠台高、整体画风；全部candidate。技术接口仅如实记录本地工具回执；底层模型与seed未公开，不填猜测版本、价格、限额；运行时效果待实测。

### 11.4 历史细节要点（历史图片重出，2026-09-30）

本轮同 ID 覆盖 19 张成品；旧图只锁定类型、占地轮廓、入口和镜头，历史照片/古画只提供形制、材料与构造，不复制构图。每张 manifest 的 `references` 写明可访问 URL 和实际取用细节；参考图均已下载并实看。晚期平遥、乔家院照片只取北方合院组织与材料，不宣称为明代原物；霍州署含早期遗构，具体构件现状断代仍 **（待考）**。

| 组别 | 图片依据 | 强制读出的历史细节 |
|---|---|---|
| 民居 / 合院 | `Ming courtyard`、平遥院落、乔家院航拍 | 三 / 五开间柱网，中央板门与格窗，硬山齐山墙，筒板瓦、砖缝、石脚；正房—厢房—院门轴线 |
| 市肆 / 客栈 | 明人《南都繁会景物图卷》街市局部 | 沿街敞铺、可卸板门、深檐、直栏浅廊、紧凑木构；北方版本用灰砖防火山墙和硬山灰瓦 |
| 衙署 / 寺殿 / 王府 | 霍州署厅、北京智化寺、明长陵殿堂 | 深前廊柱网、台基等级；寺殿黑灰瓦歇山、朱木与斗拱；王府深绿主屋面、灰瓦配房，不用帝王黄瓦 |
| 塔 / 仓 | 慈寿寺八角砖塔、北京南新仓仓廒 | 仿木砖檐、券龛与砖雕带；仓廒厚砖墙、小高窗、宽厚硬山灰瓦与防潮石脚 |
| 河埠 | 北京日报所载明嘉靖通州土坝文字史料 | 木排桩挡土夯筑、石铺作业面、花岗岩踏步和系缆柱；未找到可用历史图，构图 **（原创扩展）** |

瓦作必须区分凹面板瓦与半圆筒瓦垄；普通民居、仓廒与市肆不画斗拱，檐下只露椽头 / 檩头。寺殿斗拱层级、彩画纹样和王府具体制度继续 **（待考）**，不得因照片现状反推所有明代建筑。规格化只做透明裁边、一次等比缩放和透明留白；全部画布、ID、类型与占地登记保持不变，画面比例相对旧轮廓最大变化不足 6%。`house_small` 试验误生成 3 候选，其余每张 1 候选；该偏差已在 manifest 与任务报告如实登记。

## 11. 元 · 北方套件补充（`yuan_north`）

本节用于 `assets/default/building-map/yuan_north/` 的19张地图建筑候选，年代母题为元末大都及北方路城；大同、开封只作为地域适配方向，不据此宣称已复原三城。职责沿用 `design/22` §2.4、§3.4与§3.5，城门本体另见 `prompts/tile.md` §10。原宋模板、历史待决与检查规格保留；本套件建筑检查短边按任务要求为256px。

### 11.1 清单、type复用与占地

文件ID统一为 `bld_kit_yuan_north_<后缀>`；表中“同ID”表示 `building.type` 与该文件ID一致。五个既有元骨架复用原type，不另定义同义骨架。占地单位为未旋转东西×南北的1m规划格；这是游戏布局尺度，不是考古建筑尺寸。标“建议”的14类全部为 **【建议值】**：住宅、商铺、客栈等沿宋同功能量级，其余为本任务北方模块默认值，待具体CitySpec确认。

| ID后缀 / 功能 | `building.type` | 占地 | 依据 |
|---|---|---|---|
| `house` / 大民居 | `bld_kit_yuan_house` | 7×6 | §3.4骨架 |
| `house_small` / 小民居 | 同ID | 6×5 | 建议 |
| `courtyard` / 院落 | 同ID | 10×8 | 建议 |
| `shop_1f` / 单层铺 | 同ID | 6×5 | 建议 |
| `shop_2f` / 两层铺 | 同ID | 8×6 | 建议 |
| `inn` / 客栈 | 同ID | 12×9 | 建议 |
| `restaurant` / 酒楼茶肆 | 同ID | 12×9 | 建议 |
| `market_stall` / 市场棚 | `bld_kit_yuan_market` | 5×4 | §3.4骨架 |
| `yamen` / 路府官署 | `bld_kit_yuan_yamen` | 16×12 | §3.4骨架 |
| `biaoju` / 护运行货栈 | `bld_kit_yuan_biaoju` | 14×11 | §3.4骨架 |
| `casino` / 赌场 | 同ID | 10×8 | 建议 |
| `manor` / 山庄大院 | 同ID | 18×14 | 建议 |
| `wangfu` / 王府模块 | `bld_kit_yuan_wangfu` | 20×16 | §3.4骨架 |
| `temple_hall` / 寺观殿堂 | 同ID | 14×11 | 建议 |
| `pagoda` / 覆钵白塔 | 同ID | 8×8 | 建议 |
| `guardhouse` / 城门守舍 | 同ID | 6×5 | 建议 |
| `stable` / 马厩 | 同ID | 8×6 | 建议 |
| `warehouse` / 仓屋 | 同ID | 10×8 | 建议 |
| `wharf` / 河埠 | 同ID | 10×6 | 建议 |

19类只登记素材，不创建 `city/poi/biz/port` 等玩法ID。`biaoju`对应护运货栈院 **（原创扩展）**，避免直接书写尚待考证的元代“镖局”字号；`pagoda`对应北方藏式覆钵白塔母题；其余保留同功能项。王府与官署分别成院，不把王府模块称为整座皇宫；河埠只表达外观，不自动开通港口服务。

### 11.2 年代差异与可复用提示词

- 延续宋基线的写实古风、低饱和度、细瓦木纹和哑光土石；北方院墙、较规整院落、仓场与马厩表达地域。北方不等于全城蒙古包，帐幕不替换普通坊巷住宅。
- 普通住宅与铺屋用克制灰瓦、土色墙体及木门窗；不要把所有民居画成重檐宫殿、满彩琉璃屋面或明清旅游商业街。具体民居细部仍 **（待考）**。
- 寺观木构可借永乐宫元构的单檐庑殿/歇山、土坯墙与低砖裙、板门/槅扇；彩画只作克制母题，不把成熟清式和玺彩画当元代定式，也不声称元建筑一律素木无彩。
- 塔采用覆钵白塔意象，与宋套件的密檐塔区分；不使用清初北海白塔、现代白塔寺院落或整套明清紫禁城外观。匿名建筑组合均为 **（原创扩展）**，不是具名古建复原。

以下为增量模板；生成时替换参数并在逐图记录中保存完整实发提示词：

```text
Create ONE Yuan-period northern-China city-map building sprite: {FUNCTION},
footprint {W}m east-west by {H}m north-south, anonymous regional concept.
Match the supplied Song building-map reference in realistic weathered materials,
restrained saturation and detail density; change the period/regional features only.
Use {YUAN_NORTHERN_FEATURES}; muted grey ceramic tile, earthy walls and aged timber.
Do not copy a modern tourist street, Qing imperial ornament or the reference building.
Orthographic yaw45 elevation30, 2:1 ground axes +0.5/-0.5; upright verticals.
South entrance faces lower-left; complete thin rectangular footprint, readable corners.
Bottom-plane center is the placement anchor, not the frontmost corner or image bottom.
Upper-left light, short soft lower-right contact shadow, true transparent RGBA.
Keep the full roof, walls and shadow within generous transparent margins.
No people, lettering, banners with writing, watermark, scenery or thick display plinth.
ONE asset, ONE view r000, no sheet, no mirrored or rotated alternate-view substitutes.
```

### 11.3 来源、登记与验收边界

以下网页于 **2026-09-30** 联网读取正文，仅用文字核验，网页照片不自动视为图像模型的参考输入：

| 来源 | 取用内容与限制 |
|---|---|
| [杜仙洲《永乐宫的建筑》·山西省永乐宫壁画保护研究院转载](https://www.sxrcylg.cn/index.php?a=index&aid=1035&c=View&m=home) | 原《文物》1963年第8期；取元构屋顶、墙体、门扇和彩画母题。正文明确有明清重修部分，不将今貌或寺观做法推广为所有北方住宅。 |
| [北京市政府：妙应寺白塔](https://www.beijing.gov.cn/renwen/rwzyd/qgzdwwbhdw/mysbt/202210/t20221027_2846092.html) | 支持元代藏式白塔母题；本套件8×8为游戏建议占地，不是文物尺寸或逐层复原。 |
| [北京市文物局：白塔寺的故事](https://wwj.beijing.gov.cn/bjww/wwjzzcslm/1730488/1730490/1730493/1730495/1730953/index.html) | 区分元寺塔居中与明代重建院落；不将今日寺院轴线直接倒灌元代。 |
| [故宫博物院：官式彩画展品说明·第一单元“守正”](https://ggzl.dpm.org.cn/app/api/app/exhibitionListPc/687) | 元永乐宫彩画与明清官式彩画分期参照；未据此核定像素配色、木构彩画的具体复原方案。 |

宋基线由本任务指定为风格参照；开工读取的宋建筑38条与贴片60条清单实际仍为 `candidate`，不能把“指定基线”写成manifest已approved。本套件同样全部 `candidate`，未回复不视为审批通过。

逐图调用 `image_gen`、`transparent_background:true`，每项最多生成2候选选1；本地参考先 `view_image`，源图与成品逐张自查。`sources/` 保存生成源图、实发提示及候选取舍，清单按 `assets/README.md` 登记实际 `source_path`、`references`、时间、SHA与 `building: {type, footprint, anchor, era}`；`era: yuan_north`。未披露的模型版本、seed或推理档位如实写未披露。

PIL只作裁切、等比缩放与透明扩边。按§4量取真实可见底面L/R/F点，锚点代理取 `(L+R)/2`，地面目标宽 `32(w+h)`，缩放 `s=32(w+h)/(Rx-Lx)`；保留原始测点、裁框、缩放和锚点变换。隐藏底面及不平行的生成边存在估计误差，轴斜率与宽深比须另报；设置45°/30°提示词或通过文件门禁均不证明严格2:1几何已通过。不得以各向异性拉伸、warp或虚构读点消除偏差。

本批仅r000单视图，`allowRotation:false`；规划允许四向不等于已交四视图。真RGBA、透明边、未裁檐角、门向、光源及原/成品SHA另行核查；底面轴线、遮挡、通行和实际拼接仍 **（待实测）**。默认保留已知几何偏差并交作者审阅，具体结论以本套件manifest及任务报告为准。

```bash
python3 tools/agents/check_assets.py assets/default/building-map/yuan_north --min 18 --max 22 --min-side 256
python3 tools/lint/check_ids.py --strict
```
## 11. 辽 · 金北方套件 · `liao_jin_north`

本节只增年代提示词差异；保存目录为 `assets/default/building-map/liao_jin_north/`。参考辽南京 / 金中都、辽上京与大同的建筑语汇，所有单体均为匿名功能组合 **（原创扩展）**，不把某座现存古建或现代复建图整体倒推为辽金原貌。历史与植物来源、访问日期见 [KIT-liao_jin_north 报告](../../../tools/agents/reports/KIT-liao_jin_north.md) §7；实际发出的逐图完整提示词见本套件 `manifest.yaml`。

### 11.1 年代差异与同风格约束

- 延续宋套件灰陶瓦、哑光木石、低饱和色与同一细节密度；使用已查看的宋单体作真实输入参考，保留每次路径与 SHA，不只写“参考宋代”。
- 北方夯土墙、木构与局部砖石并存。常民居采用朴素木门 / 直棂、土壁、灰瓦；具体门窗断代与统一彩画谱系 **（待考）**，不把这些艺术默认写成地域通则。
- 官署、王府、寺殿以较厚重屋面、大斗栱和抬高台基区别等级；寺殿借鉴大同辽金木构语汇，不复制善化寺现代复建文殊阁或现存后世彩画。台基可抬高，整件不附厚沙盘地台。
- 佛塔选匿名八角密檐砖塔；天宁寺塔只提供塔式参考。层数、雕刻与压缩比例为游戏概化，不登记为天宁寺实址，也不声称可直接放入1093年的具名地标。
- 镖局用无字护运货栈院落，赌场用普通封闭厅院，酒楼用无名两层木楼；均属功能映射 **（原创扩展）**。不新增 `biz_*`、`sect_*`、`port_*`，河埠仍只是装饰外观。
- 契丹、女真与汉式营造并存以土木砖、殿堂、佛塔和商旅院落体现，不靠满城营帐、民族符号贴花或明清宫门替代城市考据。

### 11.2 清单、占地与提示词替换

新资产前缀 `bld_kit_liao_jin_north_`，`building.type=id`、`era=liao_jin_north`。§3.4未列辽金完整表，故只借用其同功能占地接口；未覆盖项沿用§3.2–§3.3，全部为本任务制作 **【建议值】**，不是新玩法定义。19项后缀与占地如下：

| 占地来源 | 后缀与 `[w,h]` |
|---|---|
| `design/22` §3.4元骨架 | `house_large [7,6]`、`market_stall [5,4]`、`yamen [16,12]`、`biaoju [14,11]`、`wangfu [20,16]` |
| §3.2–§3.3宋同功能项 | `house_small [6,5]`、`courtyard [10,8]`、`shop_1f [6,5]`、`shop_2f [8,6]`、`inn [12,9]`、`restaurant [12,9]`、`casino [10,8]`、`manor [16,13]` |
| §3.3宋同功能项 | `temple_hall [13,10]`、`pagoda [7,7]`、`guardhouse [7,5]`、`stable [9,7]`、`warehouse [10,8]`、`wharf [10,4]` |

在§5模板替换题材段，并逐张指定功能和占地，不要求一张输出图集：

```text
Use case: historical-scene. ONE anonymous Liao/Jin northern Chinese city-map
building, visual vocabulary of Yanjing/Zhongdu, Shangjing and Datong.
Original game design, not a measured reconstruction of an existing monument.
Reference: supplied Song kit image for matte material realism and detail density.
Northern rammed-earth/plaster walls, muted grey clay tiles, dark weathered timber;
restrained brown-red posts only where appropriate, substantial bracket sets for halls.
{FUNCTION_AND_FOOTPRINT}; south entrance faces screen lower-left.
Orthographic yaw45 elevation30, 2:1 dimetric, ground edges slopes +0.5/-0.5.
Thin legible ground footprint, complete base and eaves, bottom-plane center anchor.
Upper-left light, short lower-right contact shadow, true RGBA transparent background.
No text, people, scenery, modern objects, Ming/Qing court decoration or thick plinth.
```

### 11.3 交付默认与未闭合项

- 本任务建筑短边门禁为256px，沿用64×32地面标尺：底面范围 `32(w+h)×16(w+h)`；例如7×6为416×208，20×16为1152×576。画布为容纳高度与透明边另扩，不强改成2:1画布。
- `anchor`由实际底面左右对角中心推算，原测点、等比系数和变换记录在逐件元数据。原图与成品均逐张 `view_image`，PIL只裁透明边、等比缩放、透明扩边。
- 每类最多2候选选1，所有状态为 `candidate`。保留真实轴斜率 / 比例残差，不因文件检查通过写“精确45°验收通过”；底面与门前实际拼接 **（待实测）**。
- 默认单视图、`allowRotation=false`。辽金年代套件接入城市目录、精确碰撞 / 遮挡、不同阶段彩画及物种辨识均待后续审核；当前不改宋清单、城市布局或上游文档。
## 11. 清 · 北方套件 `qing_north`（2026-09-30）

### 11.1 年代与地域差异

本节交付清初至清中北方的 **19 类地图建筑**，文件位于 `assets/default/building-map/qing_north/`；每类1张入选图，全部 `candidate`。北京、盛京、济南用于建立地域范围，不把匿名组合冒充任一城市的具名文物或实测复原 **（原创扩展）**。旗民分城、胡同布局、衙署驻防位置仍由 `design/22` §2.6 的城市布局负责，不能靠单体外观表达真实行政边界。

- 材质沿用宋基线的写实古风、细瓦纹、木石层次和低饱和旧化；相机目标仍为45°斜向、30°俯仰、2:1地面投影，左上光、右下短影。2026-09-30重出时，每类另将2张历史照片或存世古建照片与宋基线一并作为 `image_gen` 输入；历史图控制形制、比例、材质和构造，宋图只控制游戏渲染密度。
- 民居与商铺按北京胡同、天津石家大院及晚清北京街景，落实青灰砖下碱、石基、灰色筒板瓦硬山、直棂 / 方格木窗、板门和浅布篷；普通屋脊只用素脊与砖制收头，不加脊兽、黄琉璃、宫廷彩画、红灯笼或豪华垂花门。照片多为清末或现代存世状态，不足以证明每项细部均属清初 **（待考）**。
- 院落以北房、厢房和围墙组成简素合院。清代院落研究中早中清垂花门并不普遍，默认普通院落使用随墙门；大院与王府的装饰等级单独处理。
- 官署取平遥县衙的中轴、五开间正厅、东西厢房、低月台与暗朱柱；王府综合恭王府院落和沈阳故宫的柱网、一级斗拱、青绿赭彩画与局部绿琉璃边饰。本批选王府22×18，未另交24×20皇宫模块，也不将两者自动等同。
- 寺殿参考颐和园、雍和宫存世殿堂，采用五开间单檐歇山、灰筒板瓦、鸱吻、短脊兽列、一级斗拱和石台基；砖塔参考慈寿寺塔，采用八角实心塔身、十三层密檐、盲券和砖雕。均为无名组合，不是具名文物复原 **（原创扩展）**。
- 镖局 / 货栈、赌场、酒楼均为匿名营生外观；不新增玩法绑定或历史字号。河埠只交灰石台阶与系泊设施，不自带水面、船和旅行入口。

### 11.2 类型与占地映射

下表后缀全部加 `bld_kit_qing_north_`，`building.type` 与文件ID相同。`era: qing_north` 是本任务授权的地域套件键，使用年代为清初至清中；不冒充现有 `qing_early` 枚举已自动兼容。

| ID后缀 | 类型 | 占地格 | 占地来源 |
|---|---|---|---|
| house_small | 小民居 | 6×5 | 【建议值】`design/22` §3.3民居 |
| house_large | 大民居 | 7×6 | §3.4清初民居骨架 |
| courtyard | 胡同院落 | 10×8 | 【建议值】§3.3同功能 |
| shop_1f | 单层商铺 | 7×5 | §3.4清初商铺骨架 |
| shop_2f | 两层商铺 | 8×6 | 【建议值】§3.3同功能 |
| inn | 客栈 | 12×9 | 【建议值】§3.3同功能 |
| restaurant | 酒楼 / 茶肆 | 12×9 | 【建议值】§3.3同功能 |
| market_stall | 市场棚 | 3×2 | 【建议值】§3.3同功能 |
| yamen | 衙署 | 17×13 | §3.4清初衙署骨架 |
| biaoju | 镖局 / 货栈 | 15×12 | §3.4清初镖局骨架 |
| casino | 赌场 | 10×8 | 【建议值】§3.3同功能 |
| manor | 山庄 / 大院 | 16×13 | 【建议值】§3.3同功能 |
| wangfu | 王府 | 22×18 | §3.4清初王府骨架 |
| temple_hall | 寺观殿堂 | 14×11 | 【建议值】复用§3.4明代寺观骨架 |
| pagoda | 汉地砖佛塔 | 7×7 | 【建议值】§3.3同功能 |
| guardhouse | 城门守舍 | 7×5 | 【建议值】§3.3同功能 |
| stable | 马厩 | 9×7 | 【建议值】§3.3同功能 |
| warehouse | 仓屋 | 10×8 | 【建议值】§3.3同功能 |
| wharf | 河埠 | 10×4 | 【建议值】§3.3同功能 |

所有占地都是游戏规划范围，不是史料测绘尺寸。直墙、墙角、桥、植物以及净宽4/6格的完整城门见 `tile.md` 清北节；守舍不能代替完整门楼。

### 11.3 可复用提示词差异

在§5模板中替换年代和主体；真实每次调用的完整提示词、历史参考URL、输入用途与候选取舍保存在本套件 `manifest.yaml`，下列为可复用摘要，不冒充所有调用逐字相同。

```text
Use case: historical-scene. ONE isolated early-to-mid Qing NORTH CHINA building sprite.
Anonymous Beijing/Shengjing/Jinan regional concept, not a named monument reconstruction.
Attach 2–3 historical images of the same class plus one Song-kit baseline.
Read the historical images for form, proportion, material and construction only;
never copy their framing. Use the Song image only for game rendering density.
Specify roof pitch and type, ridge/chiwen/beasts, pan-and-cover tiles, bracket tiers,
column grid, stone or brick podium, lattice pattern, paint and masonry bond explicitly.
Realistic aged grey brick, matte grey tiles, dark timber lattice windows, sober hard-gable roof.
Ordinary houses use modest gates; no palace colors, lavish hanging-flower gate or gilding.
For yamen/wangfu only: restrained dark red doors, sparse official beam painting and green tiles.
Footprint {w}m east-west by {h}m north-south, visible thin ground edges and left/front/right corners.
Orthographic yaw45 elevation30, 2:1 ground axes +0.5/-0.5, parallel opposite edges.
South entrance faces lower-left; upper-left light, short lower-right contact shadow.
TRUE transparent RGBA, generous padding; no background, people, writing, watermarks or modern objects.
Keep Song-set realistic detail density and restrained weathering while changing period/regional forms.
```

### 11.4 规格化、实测与来源边界

仅用内置 `image_gen`，每件纳入评审的候选不超过2张；`biaoju` 与 `market_stall` 调用各额外吐出1张，均未纳入候选或入库。实际图像引擎版本和seed未披露，不登记虚构值。PIL规格化只以 alpha≥8 排除贴边噪点后裁框、一次等比缩放和透明扩边，不绘制建筑、不剪切透视、不镜像；四边透明留白至少为画布对应边的8%。短边≥256是本任务门禁。

占地登记沿用§11.2且没有改动。为避免换图造成世界尺度突变，规格化将新图的显著主体宽度等比缩放到旧成品的 alpha 主体宽度；PNG尺寸按高度和8%透明留白外扩。`anchor` 由旧成品锚点在主体包围框中的归一化位置映射到新图，只是候选锚点；地面轴率、院内碰撞和门前拼接仍 **（待实测）**，不把文件检查通过等同精确2:1验收。

源图和成品逐张 `view_image`，另用浅底合成检查alpha。工具预览中的灰棕光晕可能只是alpha0位置的RGB，必须采样或合成核实，不据预览去清除真实半透明边缘。单朝向 `allowRotation:false`；没有四视图、GLB、真实高度或精确院内碰撞，联调 **（待实测）**。

参考资料（访问2026-09-30）：[北京市合院式历史建筑修缮技术导则](https://www.beijing.gov.cn/zhengce/gfxwj/202405/W020240510514910875219.pdf)用于青砖青瓦木构；[清代北京四合院发展演变](https://wwj.beijing.gov.cn/bjww/resource/cms/article/362762/515604/2018071114320631049.pdf)用于限制普通民居的华丽门型；[沈阳故宫宫殿介绍](https://www.sypm.org.cn/xinwen_2/4.html)用于官式硬山和等级装饰；[济南市第二批历史建筑保护图则](http://nrp.jinan.gov.cn/attach/upfiles/lsjztz02.pdf)的检索摘要用于清代传统合院、砖木结构和石基砖墙母题，原站直连本轮返回504。现代修缮或存世建筑不证明每一细部均属清初，匿名组合与地方差异仍（待考）。2026-09-30下载查看的逐类历史图片仅作生成后形制复核，未作为原始 `image_gen` 输入；逐件URL与用途见套件manifest的 `historical_references`。
## 11. 蒙古 · 草原套件 `mongol`（KIT-mongol，2026-09-30）

本节新增 `building-map/mongol/` 的19件候选，不改变以上宋套件清单与历史待决项。题材为13–14世纪草原营地及和林 / 上都文化语境，**不是把两城建筑混排成同一年代实测复原图**。依 `design/22` §2.4，蒙古营帐不默认塞进江南密集街心；具体城市的时代开放和投放另读城市规格。

### 11.1 年代、地域与替换

- 毡帐采用圆形木架、乳白毛毡罩面、绳带、低矮木门与顶部开口意象；木料、毛毡与土石保持哑光。UNESCO 的传统工艺记录用于结构母题，不证明13世纪每一处门窗和彩绘细节。
- 商旅区以木骨架、毡篷、货包、木栅和拴马设施区分功能；护运行、赌场、客栈帐院及山庄帐院均为 **（原创扩展）**，不写历史字号、不新造营生 ID。
- 王府模块与佛寺可采用克制汉式木构、灰 / 灰绿陶瓦、红褐柱与简化斗拱；不要把所有建筑都画成帐篷，也不要套现代景区鲜艳装饰或清宫黄瓦。
- 和林“大殿”按已读 DAI 研究属于13世纪佛寺，不把旧宫殿解释当成确定事实；出土中国式瓦件与装饰只支持中国式墙屋顶技术影响，不能推出本件门窗和彩画。`temple_hall` 是匿名小型殿堂。`stupa` 取元大都1279白塔的覆白覆钵体、分层基座与叠轮为时代母题，但缩成游戏地标且不复制具名文物，也不复制额尔德尼召后世寺墙塔群，属 **（原创扩展）**。
- 河埠只作匿名木卸货台，不画水面、船只或整段河岸，也不据此开通和林水运港口。屋面、墙体、门窗、彩画和塔式的具体组合全部按美术原创处理。

| `bld_kit_mongol_` 后缀（type 与文件 ID 同名） | 原功能 → 地域外观 | 占地格 | 占地依据 |
|---|---|---:|---|
| `house_small` | 小民居 → 小毡帐 | 7×6 | §3.4 元 `house` |
| `house_large` | 大民居 → 大毡帐住宅 | 10×8 | 宋 `courtyard` 包络【建议值】 |
| `courtyard` | 院落 → 木栅帐院 | 10×8 | §3.2 宋同功能【建议值】 |
| `shop` | 单层商铺 → 木铺与毡篷 | 6×5 | §3.2 宋同功能【建议值】 |
| `shop_two_storey` | 两层商铺 → 两层木商楼 | 8×6 | §3.3 宋 `shop_2f`【建议值】 |
| `inn` | 客栈 → 商旅帐院 | 10×8 | §3.2 宋同功能【建议值】 |
| `tavern` | 酒楼 / 茶肆 → 食饮帐馆 | 10×8 | §3.2 宋 `restaurant`【建议值】 |
| `market` | 市场棚 → 毛毡铺棚 | 5×4 | §3.4 元 `market` |
| `yamen` | 官署 → 木构议事厅与帐院 | 16×12 | §3.4 元 `yamen` |
| `biaoju` | 镖局 → 商队护运货栈 | 14×11 | §3.4 元 `biaoju` |
| `casino` | 赌场 → 娱乐大帐 | 9×7 | §3.2 宋同功能【建议值】 |
| `manor` | 山庄 → 贵族帐院 | 16×13 | §3.3 宋同功能【建议值】 |
| `wangfu` | 王府 / 宫殿模块 → 汉式宫室 | 20×16 | §3.4 元 `wangfu` |
| `temple_hall` | 寺观 → 匿名佛寺殿堂 | 13×10 | §3.3 宋同功能【建议值】 |
| `stupa` | 宗教地标 → 佛塔意象 | 7×7 | §3.3 宋 `pagoda`【建议值】 |
| `guardhouse` | 城门守舍 → 木骨毡顶守舍 | 6×5 | §3.2 宋同功能【建议值】 |
| `stable` | 马厩 → 木构毡顶拴马棚 | 8×6 | §3.2 宋同功能【建议值】 |
| `warehouse` | 仓屋 → 木板商旅仓屋 | 9×7 | §3.2 宋同功能【建议值】 |
| `wharf` | 河埠 → 木卸货栈台 | 8×4 | §3.2 宋同功能【建议值】 |

上表章节均指 `design/22`；元骨架未列的功能按已有宋包络给地域映射默认值，不称蒙古考古尺寸。19项的 `era=mongol` 是本任务授权的资产套件标签，不扩大全局书界 / 朝代枚举。

### 11.2 提示词差异与处理

在§5通用投影、留白和光向模板上替换题材段：

```text
Mongol grassland / Karakorum and Xanadu cultural context, 13th–14th century.
Anonymous original regional game adaptation, never a named monument reconstruction.
Round timber-frame ger, off-white wool felt, rope bands, low wooden door;
or regional timber-and-felt utility building / restrained Han-style Yuan hall, as catalogued.
Muted matte earth, felt and wood; realistic Song-kit detail density and soft upper-left light.
No modern tourist ger decoration, Qing palace ornament, flags with writing, actors or scenic background.
Preserve 45-degree orthographic camera, 30-degree elevation, 2:1 ground axes and the specified footprint.
```

需要继承几何的编辑调用先查看宋同功能 PNG，再明确“保留相机、占地比例与构图，只换材质 / 地域构件”；实际输入路径与 SHA 记入 `references`。历史图片须区分“实际生成输入”和“生成后形制审校”：KIT-mongol 成品早于2026-10-01参考图下载，故后者只经 `view_image` 审校并在 manifest 明标“未作为image_gen输入”。完整实发 prompt 逐项保存在 manifest 及 `sources/`，不以本段替代调用记录。

本批短边下限按任务为256px，仍以 `32(w+h)` 标定地面宽；透明扩边不改变占地。底面中心锚点随裁切 / 等比缩放变换。只有原向PNG，禁止镜像补四向；所有严格轴差、比例差保留在 `meta/`，`candidate` 不等于精确无缝或可发布。最多2候选，未消除的偏差交报告，不用拉伸 / warp 纠正。

### 11.3 参考资料与未决边界

访问日期均为2026-09-30：[UNESCO · Mongol Ger传统工艺](https://ich.unesco.org/en/RL/traditional-craftsmanship-of-the-mongol-ger-and-its-associated-customs-00872)取圆形木架、白毡 / 帆布与绳索；[UNESCO · Site of Xanadu](https://whc.unesco.org/en/list/1389/)取宫殿、寺院与游牧营地并存及蒙汉文化交融；[DAI · Conservation and restoration of the Great Hall of Karakorum](https://www.dainst.org/forschung/projekte/noslug/4924)取13世纪佛寺定性、中国式瓦作屋顶与藏式布局影响；[Rubin Museum · White Stupa, Attributed to Anige](https://rubinmuseum.org/projecthimalayanart/essays/white-stupa-attributed-to-nepalese-artist-anige/)取1279元代白塔的覆白覆钵体、分层基座与叠轮母题。以上均不支持本套件精确屋顶曲线、彩画、塔高、门窗或城市落点。
2026-10-01另下载并逐张查看 Khüree 1913照片、和林博物馆模型、DAI大殿遗址/复原及妙应寺白塔照片；分别只校对帐群密度、灰顶院落、台基柱网和覆钵轮廓。逐成品URL与用途见 manifest，均属生成后审校，不倒签为生成输入。

默认保留匿名原创形制、上表建议占地、单视图和 `candidate`；作者需确认整体草原风格与宗教地标选择。原著《射雕英雄传》《神雕侠侣》的具体营地描述未逐字核对，历史形制与整城拼接 **（待考 / 待实测）**。
## 11. 吐蕃 · 藏地套件 `tubo`（KIT-tubo，2026-09-30）

本节是地域素材追加，不覆盖前文宋套件。`tubo` 是本任务授权的地域资源键，不等于某一历史政权持续存在的年代断言；供拉萨、日喀则、昌都等场景选择的无名建筑意象，均 **（原创扩展）**。各城具体年代适用性、康区内部差异、金顶与窗饰的断代仍 **（待考）**；不把现存布达拉宫、罗布林卡或现代旅游街倒推到所有书界。

### 11.1 材料、等级与参考边界

- 民居 / 商住：石砌收分墙、露石基脚、白灰墙面、平屋顶和低女儿墙，黑色门窗边、暗木梁头，赭红装饰节制；不继承宋屋灰瓦坡顶。
- 官署 / 大院 / 宫室：沿用石木材料，增加围院和层级，保持朴素体量；不以巨型金顶、清式宫廷彩画或中原衙门牌匾代替藏地形制。
- 寺殿 / 佛塔：佛殿可用局部金顶、赭红带与木檐，白塔取覆钵 / 钟形塔身、阶台和环刹母题；不声明为具名寺院或文物测绘复原。经幡、玛尼堆只作少量附属物，禁生成经文和伪字。
- 宋基线 PNG 只用作写实材质、细节密度与画面可读性参考；实际生成输入路径 / SHA 逐条记 manifest。历史影像在成品生成后于 2026-10-01 下载并 `view_image`，只作形制 QA；manifest 以 `historical_references` 单列，不能倒写为 image_gen 输入。
- 历史图以 [Library of Congress · Central Tibet photographs, c.1900](https://www.loc.gov/pictures/collection/wdl/) 与 Wikimedia Commons 馆藏页为主，核平顶厚墙、院落、街市、官署和寺院层级；远景不推导平面，具名古建不当作当前原创件复原目标。城门和桥的馆藏图反而显示形制差异，见 `tile/tubo/manifest.yaml`。
- 文字 / 器物来源：UNESCO [Historic Ensemble of the Potala Palace, Lhasa](https://whc.unesco.org/en/list/707) 页面本轮返回403；THF [Tibetan Vernacular Architecture](https://www.tibetheritagefund.org/page/?r=120) TLS证书过期；LACMA [Reliquary Stupa (Chöten)](https://collections.lacma.org/object/61926) 可访问。前两项保持（待核实），LACMA 小型供养塔仅供事后轮廓核对，不推导建筑尺寸。

### 11.2 类型与占地对应

统一前缀 `bld_kit_tubo_`，下面列后缀；每类独立 PNG，`building.era: tubo`，`status: candidate`。占地仍为 `[东西,南北]` 米格，不是画布宽高。§3.4 没有吐蕃完整目录，借用其同功能骨架；缺项暂取 §3.2–§3.3 同功能值，均为地域转换 **【建议值】**，不是上游已定义的藏地尺寸。

| 后缀 | 本地外观 / 原功能 | 占地 | 占地依据：design/22 |
|---|---|---|---|
| `house_small` | 小碉房 / 小民居 | 6×5 | §3.2 house |
| `house_large` | 两层大碉房 / 大民居 | 7×6 | §3.4 yuan_house |
| `courtyard` | 石墙院落 | 10×8 | §3.2 courtyard |
| `shop_1f` | 单层铺屋 | 7×5 | §3.4 ming_shop |
| `shop_2f` | 两层商铺 | 8×6 | §3.3 shop_2f |
| `inn` | 商旅客舍 | 10×8 | §3.2 inn |
| `restaurant` | 茶肆 / 酒楼 | 10×8 | §3.2 restaurant |
| `market_stall` | 毛织布棚 / 市场棚 | 5×4 | §3.4 yuan_market |
| `yamen` | 地方官署 / 衙门 | 16×12 | §3.4 yuan_yamen |
| `biaoju` | 驮队货栈 / 护运行 | 14×11 | §3.4 yuan_biaoju |
| `casino` | 民间博戏屋 / 赌场 | 9×7 | §3.2 casino |
| `manor` | 藏式大院 / 山庄 | 15×12 | §3.2 manor |
| `palace_hall` | 地方宫室模块 / 王府 | 20×16 | §3.4 yuan_wangfu |
| `temple_hall` | 藏式佛殿 / 寺观殿堂 | 14×11 | §3.4 ming_temple_hall |
| `stupa` | 藏式佛塔 / 宗教地标 | 7×7 | §3.3 pagoda |
| `guardhouse` | 守门碉舍 / 城门守舍 | 6×5 | §3.2 guardhouse |
| `stable` | 石木马厩 | 8×6 | §3.2 stable |
| `warehouse` | 石砌仓屋 | 9×7 | §3.2 warehouse |
| `wharf` | 小河岸装卸台 / 河埠 | 8×4 | §3.2 wharf |

赌场、护运行与山庄只提供同功能外观，不新增或自动绑定 `biz_*`；河埠不启用 `port_*` 或航线。完整外城门归 `tile/tubo`，守舍不是城门楼。

### 11.3 提示词差异与落盘

```text
Use case: historical-scene. Exactly ONE Tibetan regional town sprite, unnamed original game extension.
Flat earthen roof with parapets, battered whitewashed stone walls, dark timber, black window borders.
Restrained ochre-red trim; gold only on the requested religious hall or stupa finial.
Preserve realistic matte stone/wood detail density of the supplied Song reference, replace its roof typology.
Footprint {w} metres east-west by {h} metres north-south; visible bottom contact corners; no display plinth.
Orthographic yaw45 elevation30, 2:1 ground projection, parallel edges slope +0.5 and -0.5.
Upper-left light, only short lower-right contact shadow. True RGBA, no outside ambient halo.
Complete single building, generous transparent padding; no text, pseudo-script, people or modern objects.
No named Potala replica, no modern Lhasa tourism frontage, no Chinese pitched tile roof on ordinary dwellings.
```

每张实际发送的全文另存 `building-map/tubo/sources/`，不以本模板替代调用记录。最多两候选择一；原图保留真 alpha。裁透明外缘、等比重采样、透明扩边，不做拉伸、warp、镜像或代码补画。建筑短边门禁本任务为 256 px；地面目标宽仍 `32(w+h)`，高 `16(w+h)`，不能按 canvas 宽二次缩放。底面中心锚点从可见接地边推算，误差单列；轴超差不写成精确通过。每件只交一个朝向，默认 `allowRotation=false`，未生成 GLB 或四向图。
历史图片（访问并下载查看于2026-09-30）：民居 / 院落用 [北京胡同院落](https://commons.wikimedia.org/wiki/File:Peking_Hutong_courtyard.JPG) 与 [天津石家大院门道](https://commons.wikimedia.org/wiki/File:Shiyuan_tianjin_doorways.jpg)；铺面用 [Thomas Child北京街道](https://commons.wikimedia.org/wiki/File:Thomas_Child,_Peking_Streets.jpg) 与 [1895北京街景](https://commons.wikimedia.org/wiki/File:William_Henry_Jackson,_Street_scene,_Peking,_1895.jpg)；官署用 [平遥县衙主院](https://commons.wikimedia.org/wiki/File:Pingyao_Yamen_Main_Courtyard.jpg) 与 [县衙院落](https://commons.wikimedia.org/wiki/File:Pingyao_Yamen_courtyard.jpg)；王府用两张恭王府院落及沈阳故宫；寺塔用颐和园、雍和宫、慈寿寺塔和1920年代塔影。每件实际输入及所取细节见manifest `references`。这些图均实际作为 `image_gen` 输入；现代存世照片与晚清影像只证明可见形制，不证明所有细部均属清初。

## 本文新增术语与 ID

不新增玩法 ID；宋批复用 §3 的38个建筑资产ID与最新§4.4的7个植物资产ID；§11另新增19个 `bld_kit_ming_north_*` 地域资产ID。植物文件使用`<asset_id>__v01/v02.png`，双下划线后是变体键，不是新玩法ID。`building.anchor`为最终PNG底面中心像素，`sources/`为归档生成来源，`meta/`为逐type制作元数据。它们是本批资产约定，不扩大`town/schema.yaml`的现有定义范围。

§11另登记19个 `bld_kit_song_north_*` 资产ID，具体后缀与占地见§11.1；它们是本任务授权的同构套件，不新增玩法、城市、机构或营生ID。`song_north` 尚须由下游接入正式城市目录 / schema，不能假称本素材任务已完成该上游变更。
西域新增 19 个 `bld_kit_xiyu_*` 资产 ID 见 §11.1；仅素材族，不新增 `biz_*`、`city_*` 或 `sect_*`。`xiyu` 在上游套件枚举的同步事项交 KIT-xiyu 报告 §6。
## 11. 明 · 江南套件（`ming_south`）

本节新增19个 `bld_kit_ming_south_*` 地图建筑候选，目录 `assets/default/building-map/ming_south/`，`era: ming_south`。南京、苏州、杭州地域形制组合均为 **（原创扩展）**，不是具名古建复原。明代镖局称谓与具体商帮会馆年代仍 **（待考）**，默认匿名护运货栈；不新增营生或航线入口。

### 11.1 年代与地域差异

- 沿用宋江南的写实木石、灰陶瓦、细节密度和克制旧化；增强粉墙黛瓦、石基、窄面阔商住、天井院落。普通民居以硬山轮廓和朴素屋脊为主，不把夸张马头墙铺满全城。
- 木构偏栗壳褐色，窗格偏直线柳条 / 书条式；不用清中后期繁密曲线彩玻璃、通体彩画、金龙和满街红灯笼。寺观、衙门、王府保留等级差异，彩画不作为精确制度复原。
- 单层商铺用布货和日用品；两层铺屋以高柜台、牢固门窗表现当铺意象；客栈、茶肆用客房、门廊、茶桌和酒坛区分。货栈与院落兼具商帮会馆气质，不追加 `biz_*`。
- 宗教地标选八角佛塔，逐层收分、出檐、塔刹；不用西域清真寺或藏式殿堂。层数、尺寸为游戏概化，不命名为报恩寺塔。河埠不带水面和船；城门守舍与完整城门贴片分开。

### 11.2 占地、尺度与实际提示词

下表后缀均加 `bld_kit_ming_south_`；冻结项见 `design/22` §3.4，其余按 §3.3 江南同功能项给出 **【建议值】**，由后续 CitySpec 覆写。

| 后缀 | 用途 | 占地 `[w,h]` | 依据 |
|---|---|---|---|
| house_small | 小民居 | `[7,6]` | 明民居骨架 |
| house_large / courtyard | 大民居 / 天井院落 | `[10,8]` | 【建议值】宋江南院落 |
| shop_1f / shop_2f | 单层 / 两层商铺 | `[7,5]` | 明商铺骨架 |
| inn / restaurant | 客栈 / 酒楼茶肆 | `[12,9]` | 【建议值】宋江南同功能 |
| market_stall | 市场棚 | `[3,2]` | 【建议值】宋江南同功能 |
| yamen | 衙门官署 | `[16,13]` | 明衙门骨架 |
| biaoju | 护运货栈 | `[15,12]` | 明镖局骨架 |
| casino | 赌场外观 | `[10,8]` | 【建议值】宋江南同功能 |
| manor | 山庄大院 | `[16,13]` | 【建议值】宋江南同功能 |
| wangfu | 王府主殿模块 | `[22,18]` | 明王府骨架 |
| temple_hall | 寺观殿堂 | `[14,11]` | 明寺观骨架 |
| pagoda | 佛塔 | `[7,7]` | 【建议值】宋江南同功能 |
| guardhouse / stable | 守舍 / 马厩 | `[7,5]` / `[9,7]` | 【建议值】宋江南同功能 |
| warehouse / wharf | 仓屋 / 河埠 | `[10,8]` / `[10,4]` | 【建议值】宋江南同功能 |

本任务短边≥256 px，仍按 §4 的64×32格尺度与底面中心锚点：地面范围为 `32(w+h) × 16(w+h)`，7×6民居=416×208、22×18王府=1280×640；不把整个PNG压成2:1。只声明原向单视图，不能旋转图片冒充新朝向。实际逐张全文、参考输入和候选次数保存在 manifest / 来源记录；差异模板为：

```text
Edit the supplied Song southern sprite into a Ming Jiangnan regional variant.
Preserve realistic matte wood/stone/clay materials and fine detail density.
White lime plaster, charcoal grey tiles, chestnut timber, straight lattice windows.
Orthographic yaw45 elevation30, ground slopes +0.5/-0.5, footprint {w} by {h}.
Entrance lower-left; upper-left light, short lower-right contact shadow.
One isolated complete asset, true RGBA, generous clear margins.
No people, text, watermark, modern glass, Qing ornament, scenery or thick pedestal.
```

每类型最多2候选，逐张 `view_image`；常规PIL处理仅裁边、等比缩放、透明pad并保留alpha。第4轮对审核点名13项另作分段横向缩放与逐列纵移，以底面三点锁定双轴和占地比例且保持竖线竖直，证据见套件 `revisions_r4/verification.json`。原图在alpha=0处可能存灰褐RGB，须用实际alpha或合成预览判断。全部为 `candidate`，整城接缝、遮挡、四向接口仍 **（待实测）**。

形制来源（访问2026-09-30）：苏州市园林局《[建筑](https://ylj.suzhou.gov.cn/szsylj/ylys/201903/484421d38f504f5787a8f307925e3ad7.shtml)》《[木窗的匠心和工艺](https://ylj.suzhou.gov.cn/szsylj/ylys/202404/613a96d3071d489d82e3b0f303e41754.shtml)》、故宫《[琉璃持钵佛像砖](https://www.dpm.org.cn/collection/impres/228949.html)》附报恩寺塔说明。仅取形制母题，不把后世修复建筑当作明代实测样本。

## 本文新增术语与 ID

明江南新增19个 `bld_kit_ming_south_*` 资产ID，完整清单见§11；只扩展素材目录，不新增玩法定义。
## 11. 元末江南套件 · `yuan_south`（2026-09-30）

本节只登记素材制作差异；布局与接口仍见 `design/22` §2.4、§3.4。素材位于 `assets/default/building-map/yuan_south/`，全部 `candidate`，各条 manifest 的 `prompt` 是实际调用全文，`sources/` 保留独立原图与调用记录。沿用宋套件写实灰瓦、木构、浅灰白抹灰与细节密度，不将江南旧城改成大都坊格或营帐聚落。

### 11.1 年代与地域约束

- 参考城市为杭州路、集庆路、平江路；本套为匿名功能建筑组合 **（原创扩展）**，不是三城具名古迹的测绘复原。
- 屋顶以朴素悬山 / 歇山灰瓦为主，墙体为木骨、浅色抹灰与低石基；木板门、简洁格栅窗、竹帘表达居住与商业功能。民居门窗细纹与精确元末制式 **（待考）**，默认不画晚期旅游街式高马头墙。
- 官署为路府围院与低彩度红褐木柱，王府为独立大院模块；不用清式金龙和玺彩画、清代品级门钉或大片金瓦。彩画默认收敛为素木和少量褪色涂饰，不声称考证了具体官署等级。
- 寺殿取宋元江南木构延续、单檐歇山和平缓屋面的母题；佛塔取江南楼阁塔家族。塔层数与组合为原创，不把蒙古帐幕、藏式白塔或沙漠清真寺当成全江南通用宗教外观。
- 本批宗教地标选佛塔；杭州凤凰寺说明江南存在多种宗教建筑，但不把其历代重修或2009年重建门楼直接用于元末。具名清真寺是后续城市定制项，默认不挤占本套佛塔。
- 护运行仍用货栈外观，无“镖局”招牌；成熟镖局称谓的年代适用性 **（待考）**。赌场只用匿名营生外观；河埠只提供台阶和卸货接口，不创建 `port` 或旅行玩法。

### 11.2 类型与占地差异

所有建筑 ID/type 前缀为 `bld_kit_yuan_south_`，每项一张；`building.era: yuan`，地域由 ID 与套件目录区分。

| 后缀 | 占地格 | 依据 |
|---|---|---|
| house_small | 7×6 | 元 house 骨架 |
| house_large | 10×8 | 大民居变体，沿用南宋院落包络 **【建议值】** |
| courtyard | 10×8 | 南宋同功能项 **【建议值】** |
| shop_1f / shop_2f | 6×5 / 8×6 | 南宋同功能项 **【建议值】** |
| inn / restaurant | 各12×9 | 南宋同功能项 **【建议值】** |
| market_stall / yamen / biaoju / wangfu | 5×4 / 16×12 / 14×11 / 20×16 | 元 market / yamen / biaoju / wangfu 骨架 |
| casino / manor / temple_hall / pagoda | 10×8 / 16×13 / 13×10 / 7×7 | 南宋同功能项 **【建议值】** |
| guardhouse / stable / warehouse / wharf | 7×5 / 9×7 / 10×8 / 10×4 | 南宋同功能项 **【建议值】** |

### 11.3 提示词差异与质检

在§5通用模板上替换主题、年代、占地。如提供宋基线图像参考，只用于相机与材质；未传图的调用须记 `references: []` 并区分目视比照记录。不得把目视检查或文字查阅来源伪写成实际图像输入。

```text
ONE anonymous late Yuan Jiangnan town building, circa 1350, Hangzhou/Jiqing/Pingjiang region.
Continue Song river-town vernacular: muted grey ceramic tiles, weathered dark timber, pale lime plaster, low stone thresholds.
If a Song sprite is supplied, use it only as camera/material/detail-density reference; generate the requested functional building individually.
Orthographic yaw45 elevation30, exact 2:1 ground axes +0.5/-0.5, clear rectangular footprint {w} by {h}, south entrance lower left.
TRUE transparent RGBA background, complete eaves and ground corners with empty margins, upper-left light and short lower-right contact shadow.
No lettering, people, modern objects, Qing imperial polychromy, tourist horse-head walls, Mongolian camp scenery, panorama or thick floating base.
```

本次历史重出逐张调用 Codex Images `gpt-image-2` 编辑端点并请求真透明；每项最多两候选，实际仅两城门使用第二候选。`view_image(detail=original)` 检查参考图、源图及成品。PIL 仅透明裁边、一次等比 LANCZOS、透明扩边；不拉伸、不阈值改alpha、不补画、不warp。建筑短边门禁为本任务指定256px；小件不为凑画布而放大地面。目标仍为`ground_width_px=32(w+h)`，但本轮未以全图仿射强制几何达标；轴向、宽深比、隐藏后角和拼接残差须总装实测，不能以检查器通过代替精确投影验收。目前只交原向单视图。

### 11.4 参考资料与边界

#### 2026-09-30 历史图片参考重出：历史细节要点

- 本轮19张均由图像模型重新生成，同 ID 覆盖；每张实际输入为“宋基线透明精灵（只约束相机、透明输出与写实密度）+ 两张已下载并目视检查的历史图片”。未把旧图、滤镜或程序绘画冒充新图。入选图只做 alpha 包围框裁切、一次等比缩放和透明留白，不阈值改 alpha、不重绘、不 warp。
- 普通民居、商铺、客栈、酒楼、货栈和河埠取王振鹏《龙舟夺标图》的滨水楼屋、码头和船岸关系；配合倪瓒《渔庄秋霁》《汀树遥岑》的疏林、草亭、低饱和岸居层次。格扇、板门、木骨浅色抹灰、灰色板瓦/筒瓦和低石基必须可读；不画旅游街式密集马头墙。
- 衙门、山庄、王府等礼制建筑取夏永《滕王阁图》的台基、平座、栏杆、柱网和重檐等级比例；只把重檐用于最高等级主殿。不得复制画面构图，也不得以界画证明某个匿名院落的精确尺度。
- 寺殿以真如寺、金华天宁寺及延福寺现存构件交叉约束：三间柱网、低台基、单檐歇山、中等举折、灰色板瓦/筒瓦、克制鸱吻、深出檐、椽望和二至三层简素出跳；后世重彩与维修构件不作为元代原状证据。
- 佛塔只取聚沙塔“八角七层楼阁式砖木塔、逐层腰檐和平座、向上收分”的总体母题；现状历代修缮及1996年大修，不照搬栏杆、色彩或修复细部。
- 盘门、青浦诸桥等现存遗构一律按“始建/重建年代与后世维修并存”使用：只取砖券、石基、水脚、石柱墩、纵横石梁等可辨结构；不把明清楼橹、栏杆、碑刻或现代修缮当元代原状。所有资产仍为匿名功能建筑 **（原创扩展）**，精确制度与城市落点 **（待考）**。

- [金华文旅《六、景区介绍》](https://v.jhwlv.com/app/index.php?a=site&c=site&do=detail&i=3&id=654&uniacid=3)：天宁寺大殿宋元木构延续与单檐歇山母题；非本套寺殿比例和全部彩画的复原依据。
- [上海市普陀区政府《走进真如寺，探秘大殿的建筑密码》](https://www.shpt.gov.cn/tupianxinwen/20250416/958655.html)：元代大殿单檐歇山、平缓屋面及与明清较陡屋面的差异；仅约束寺殿屋面母题，不外推民居门窗和彩画。
- [苏州市志办《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)：瑞光塔七级八面砖木楼阁式，以及现存盘门元代重建、明清续修的年代边界；本套匿名塔不冒名瑞光塔。
- [故宫名画记·王振鹏《龙舟夺标图》](https://m-minghuaji.dpm.org.cn/paint/detail?id=8b90556546a340a2a688b0cb9e6e49d8)、上海博物馆[夏永《滕王阁图》](https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00000900)、[倪瓒《渔庄秋霁》](https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00001018)与[《汀树遥岑》](https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00005285)：分别取滨水楼屋/码头、礼制建筑层级、疏林草亭与岸植节奏；不复制整图构图。
- [常熟市政府·聚沙塔](https://www.changshu.gov.cn/zgcs/c100290/202311/54ee18e3bab9460fb467a58d78d8eef5.shtml)：取八角七层、收分、砖木腰檐和平座；现状历代修缮及1996年大修，只取总体母题。
- [青浦区政府·青浦古桥](https://www.shqp.gov.cn/shqp/ggfw/bmts/20250116/1224818.html)：取顺德桥、迎祥桥的多跨石梁与细石柱墩；始建年代与明清重修边界并列。
- [杭州文保导览《凤凰寺》](https://wbdl.hzwbzx.cn/house?id=13)：元代重建、明清重修与2009年门楼复建，限定现代图像可用范围。
- [故宫博物院院刊《〈营造法式〉大木作控制性尺度规律研究》](https://www.dpm.org.cn/Uploads/File/2018/06/04/u5b15212a9a148.pdf)：以现存唐至元建筑实例验证大木作控制性尺度规律；本套只取跨时期比较边界，不据此自定结构测绘尺寸。
- [Pillow Image 文档](https://pillow.readthedocs.io/en/stable/reference/Image.html)：核实裁切、重采样与无mask粘贴语义；[W3C PNG规范](https://www.w3.org/TR/png-3/#6AlphaRepresentation)：核实alpha通道语义。以上访问日期均2026-09-30；未引入模型版本、价格或浏览器限额断言。

## 本文新增术语与 ID

元末江南新增§11列明的19个 `bld_kit_yuan_south_*` 资产 type；只服务素材目录，不新增玩法 ID。元骨架未列项的占地为§11.2建议值，待具体城市规格确认。

不新增玩法 ID；复用 §3 的38个建筑资产ID与最新§4.4的7个植物资产ID。植物文件使用`<asset_id>__v01/v02.png`，双下划线后是变体键，不是新玩法ID。`building.anchor`为最终PNG底面中心像素，`sources/`为归档生成来源，`meta/`为逐type制作元数据。它们是本批资产约定，不扩大`town/schema.yaml`的现有定义范围。
## 11. 清初至清中 · 江南套件 `qing_south`

本节仅用于 `assets/default/building-map/qing_south/`，不改宋套件的输入图、年代或登记。覆盖杭州、扬州、苏州一带的通用街巷建筑；福州仅提供地域形制线索，不把四城说成同一种实测建筑。所有匿名组合均为 **（原创扩展）**，精确构件断代 **（待考）**。

### 11.1 年代与材质差异

- 继承 `design/22` §2.6 的旧街巷与河网，只替换建筑形制。民居以白灰墙面、灰砖勒脚、灰色小瓦、深棕木门及隔扇为主；不将宫廷黄琉璃、朱金彩画普遍用于民间。
- 清式门窗纹样和门厅砖雕保持克制；苏式花鸟、山水彩画仅适量用于有身份的厅堂。故宫资料区分江南传统苏画与乾隆以后宫廷官式苏画，不能混用为全城统一立面。
- 宅院采用院墙、门厅、天井、穿廊组合；山庄与王府分别表达宅园和封闭礼序。福州马鞍墙与苏州山墙有地域差异，本批以苏杭通用白墙灰瓦为主，不批量夸张马头墙。
- 宗教地标用匿名砖木楼阁式佛塔，不照搬现六和塔层数、晚清外檐或现代修复色彩。清末民初宅园不直接作为清初复原；不命名为具体文物、机构或小说场所。
- 与宋基线保持相同写实材质、低饱和度、细节密度、左上主光和右下短影。新增细节不改变原向单视图、真 RGBA、底面中心锚点和纯几何后处理要求。

### 11.2 本批类型与占地

完整 ID 为 `bld_kit_qing_south_<后缀>`，每类一张；单位为 1 m 规划格。清初已有骨架优先，其他尺寸按同功能表同构使用 **【建议值】**，不把外观占地当成历史测绘。

| 后缀 / 类型 | 占地 | 引用依据 |
|---|---:|---|
| `house_small` / 小民居 | 6×5 | `design/22` §3.3 house |
| `house_large` / 大民居 | 7×6 | §3.4 qing_early_house |
| `courtyard` / 院落 | 10×8 | §3.3 courtyard |
| `shop_1f` / 单层商铺 | 7×5 | §3.4 qing_early_shop |
| `shop_2f` / 两层商铺 | 8×6 | §3.3 shop_2f |
| `inn` / 客栈 | 12×9 | §3.3 inn |
| `restaurant` / 酒楼茶肆 | 12×9 | §3.3 restaurant |
| `market_stall` / 市场棚 | 3×2 | §3.3 market_stall |
| `yamen` / 衙署 | 17×13 | §3.4 qing_early_yamen |
| `biaoju` / 镖局货栈 | 15×12 | §3.4 qing_early_biaoju |
| `casino` / 赌场 | 10×8 | §3.3 casino |
| `manor` / 山庄大院 | 16×13 | §3.3 manor |
| `wangfu` / 王府模块 | 22×18 | §3.4 qing_early_wangfu；本批不另交宫殿 |
| `temple_hall` / 寺观殿堂 | 14×11 | §3.4 ming_temple_hall |
| `pagoda` / 佛塔 | 7×7 | §3.3 pagoda |
| `guardhouse` / 城门守舍 | 7×5 | §3.3 guardhouse；非外城门 |
| `stable` / 马厩 | 9×7 | §3.3 stable |
| `warehouse` / 仓屋 | 10×8 | §3.3 warehouse |
| `wharf` / 河埠 | 10×4 | §3.3 wharf；纯装饰、不新增旅行入口 |

### 11.3 生成提示词差异与入库

在 §5 单体模板中替换年代与主体段；每张实际完整提示词和真实参考图在 manifest 与 sources 记录，不能仅保存本模板。工具使用内置 `image_gen`，底层模型、seed、effort 未披露则如实记未披露。

```text
Use case: historical-scene. ONE anonymous early-to-middle Qing Jiangnan city-map building, circa 1700–1780; original game composition, not a named monument reconstruction. Match the supplied Song baseline's realistic matte materials, muted palette and restrained detail density. Change only era and regional construction: white limewashed brick walls, grey small clay tiles, dark weathered timber, restrained Qing lattice doors/windows, modest brick door surrounds; limited pale Su-style painted detail on appropriate halls only.
Orthographic map view, yaw45 elevation30, 2:1 ground-plane axes (+2,+1) and (+2,-1), upright verticals; rectangular footprint {w} by {h}, visibly readable left/front/right ground corners. Front faces lower left. Genuine transparent RGBA, opaque subject, generous clear margins, complete roof/base, no thick plinth. Upper-left light, short lower-right contact shadow.
Subject: {one building type and function-specific details}. No text, people, sky, scenery, modern items, tourism lantern rows, universal imperial yellow roofs or exaggerated decorative gables. One standalone asset, not a sheet.
```

地面目标宽高仍为 `32(w+h)×16(w+h)`，例：7×6 民居为416×208 px，22×18 王府为1280×640 px；画布可因高度与透明边外扩。本任务短边下限为256 px，不为凑下限放大真实占地。源底面读点后等比缩放，并同步变换锚点；不得非等比拉伸或改画透视。最多两候选选一，剩余投影残差如实保留；`candidate` 和文件检查通过不表示精确拼接或作者批准。仅原向单 PNG，其他视图、碰撞/遮挡与实城装配 **（待实测）**。

### 11.4 参考资料与边界

访问日期均为2026-09-30；网页文字用于形制核对，实际模型图像参考为仓内宋基线，不把网页照片冒记为已输入。

- [故宫博物院《苏式彩画》](https://www.dpm.org.cn/lemmas/241406.html)：苏画题材与宫廷官式苏画区别；本次直开 HTTP 200。
- [苏州园林局《网师园》](https://ylj.suzhou.gov.cn/szsylj/sjyc/201905/8aaf3adcfdaf485dada9a071aac3867f.shtml)：乾隆时期宅园、门厅穿廊和砖雕母题；本次直开 HTTP 200。
- [福州鼓楼区《我们的三坊七巷（34）》](https://www.gl.gov.cn/xjwz/rw/mdgl/gjms/202502/t20250210_4973489.htm)：灰瓦白墙、马鞍墙地域区别；已打开正文。
- [杭州文旅《Pagoda of Six Harmonies》](https://wgly.hangzhou.gov.cn/art/2013/7/7/art_1229495371_58931730.html)：砖木楼阁塔类型；搜索返回正文，仅取类型，不复原具体层数与修缮后外观。
- [江苏方志《漕运时代的淮盐与运河》](https://jssdfz.jiangsu.gov.cn/n95/20240329/i32931.html)：扬州河下盐商住宅与水运生活背景；搜索返回正文，直接访问不可达，不据此断言每个构件年代。

## 本文新增术语与 ID

不新增玩法 ID；宋基线复用 §3 的38个建筑资产ID与最新§4.4的7个植物资产ID；清江南新增19个建筑素材ID见§11.2。植物文件使用`<asset_id>__v01/v02.png`，双下划线后是变体键，不是新玩法ID。`building.anchor`为最终PNG底面中心像素，`sources/`为归档生成来源，`meta/`为逐type制作元数据。它们是素材制作约定，不扩大`town/schema.yaml`的现有定义范围。

清北本轮另登记§11.2的19个 `bld_kit_qing_north_*` 地域资产ID，不新增玩法规则。新建前已全仓搜索，只有任务计划中的套件键，没有同名成品；6×5小民居等同构占地依§11.2标为建议值，不扩大清初骨架定义。

KIT-mongol另增§11表列19个 `bld_kit_mongol_*` 资产ID和资产套件标签 `mongol`；不新增玩法ID。

§11 另新增19个 `bld_kit_tubo_*` 地域资产ID（非玩法ID），完整清单和占地来源见该节；不将它们计入前文宋套件38类。

## 待决事项 / 依赖

### 替下游给出的建议值

西域大民居 10×8 分型、逐图宽深比相对误差 10% 告警为 **【建议值】**；它们不改变骨架实际占地。角点人工读数约 ±4 源像素，只作候选对齐代理，不能当作三维测量。

透明留边默认至少 16 px；轴斜率容差沿用上游 ±0.03。西域成品 canvas 短边 ≥256 是本任务检查器要求，宋首批仍按 §4 的 ≥512；地面像素尺度均按 64×32 每格计算，canvas 尺寸随建筑高度 / 屋檐与留白变化，不固定所有建筑方形。
透明留边默认至少 16 px；轴斜率容差沿用上游 ±0.03。宋基线最终 canvas 短边 ≥512；§11明北方套件按本任务检查参数取短边≥256。地面像素尺度仍按 64×32 每格计算；canvas 尺寸随建筑高度 / 屋檐与留白变化，不固定所有建筑方形。
元末江南新增建议值见§11.2；本任务建筑最短边256px、底面64×32px格和实际透明留边单独记录，不改宋基线512px门禁。
KIT-mongol：§11映射占地、256px短边门禁与逐项锚点是本批默认；非元骨架类型需由后续 `design/22` 收口。精确底面与门前通行仍须实测。

透明留边默认至少 16 px；轴斜率容差沿用上游 ±0.03。最终 canvas 短边 ≥512 是现有检查器要求，地面像素尺度仍按 64×32 每格计算；canvas 尺寸随建筑高度 / 屋檐与留白变化，不固定所有建筑方形。
清北增量的占地默认值见§11.2，短边≥256、透明留边≥16px、宽深比10%告警阈值仅为本任务制作参数。精确几何未通过的素材仍为候选；目录检查通过不批准发布。

透明留边默认至少 16 px；轴斜率容差沿用上游 ±0.03。宋基线制作曾采用 canvas 短边≥512，本清北增量按任务指定使用短边≥256；地面像素尺度仍按64×32每格计算，canvas尺寸随建筑高度、屋檐与留白变化，不固定为方形。
清江南新增19个 `bld_kit_qing_south_*` 素材ID见§11.2，不新增玩法ID。其非清初骨架占地按宋南/明表同构引用，默认作为候选制作尺寸；不会反写上游布局骨架。年代外观、构件断代、实际尺寸和单PNG精确拼接仍交审图/装配复核。

透明留边默认至少 16 px；轴斜率容差沿用上游 ±0.03。宋基线的最终 canvas 短边 ≥512；清江南按本任务 `--min-side 256` 验收（见§11.3）。地面像素尺度仍按 64×32 每格计算；canvas 尺寸随建筑高度 / 屋檐与留白变化，不固定所有建筑方形。

新增植物的最终4px留边来自最新上游；矩形裁边时alpha≤2噪点阈值、外扩4**源**px，以及实际根偏差≤1**成品**px的额外告警均为本轮 **【建议值】**。2/255≈0.78%不透明度；只用于确定裁切矩形，不覆盖存留像素的alpha。全部原图与裁去区域统计保留，可复核或更换制作阈值。

### 本文依赖的上游事实

占地、type、入口和允许旋转引用 `design/22` §3；城市与年代引用其两城 CitySpec。作者要求左上光、右下影覆盖快照旧光向。素材字段 schema、单视图渲染缩放、四向能力与碰撞 / 遮挡尚需下游联调，不假称 PNG 已替代 GLB。

### 对基准的修改提案

无新增玩法或数值提案。需同步 `design/22` 光向以及 `tech/07` 旧风格 / 存储口径的事项写任务报告第 6 节，本文不越权修改上游。

### 原著考据待办

清北匿名建筑未引用原著回目或文字；官式装饰、普通民居门窗、砖塔细部与年代适配默认历史意象（原创扩展 / 待考）。实际砖塔为六层楼阁式意象，慈寿寺资料仅支持北方砖佛塔在清代存续及砖石材质，不能宣称同塔式复原。

保留旧稿问题：三联 / 广州修订版《天龙八部》的大理建筑、植物与佛教场景，《射雕英雄传》的临安茶肆描写尚未逐字核对，不编回目或引文。白族民居细部、佛龛造像、宋茶器、瓦作、斗拱、镖局称谓及地域植物史仍待考；默认历史意象与原创构图。

### 开放问题（附默认值）

- 西域地域形制是否逐朝另出变体：默认本包为通用候选意象，具体年代细部（待考）；后续具名城镇须筛选，不能以 `era: xiyu` 跳过考据。
- 西域两候选后仍有投影偏差：第2轮已重出点名16件；大民居、棋戏院、茶肆仍有轴向超差，返修未全部通过。默认保留真实残差与原始候选，不突破每轮两候选上限，不通过非等比拉伸修饰数据；详见包内 QA 与 KIT-xiyu 报告。

- 明江南补充占地与历史细部：默认§11表的 **【建议值】** 与匿名原创建筑，最终按具体城市覆写；本轮不把建议值写入 design/22。
- 明江南严格投影与整城拼接：**已解决（点名13项）**，双轴±0.500、登记占地比例与底面中心锚点已按像素复算；仍保持单视图 `candidate`，整城接缝、碰撞与遮挡待总装实测。
- 元末江南的匿名房屋细部、院落尺度和佛塔层数：默认采用§11候选与建议值；具名城市史图、真实四向、墙门孔对格和运行时遮挡另行验证，未经审批不改 `approved`。
- 清北19建筑当前只读复验有8件至少一项告警：镖局、赌场、守舍、大民居、大院、市场棚、单层商铺、衙署；其中仅大民居仍超过严格10%比例阈值。另7件第10轮PIL仿射校正后双轴为±0.5，并沿用审核裁定的轴率0.40–0.62、比例30%容差；这不等于发布级总装通过。默认全部保持candidate并保留测点，后续精确总装前需复核，不再以非等比缩放伪修。
- 清北套件键与既有时代枚举、19类同构占地、六层匿名砖塔的艺术选择是否采用：默认按§11交候选，不代作者批准，不修改上游枚举；见 `tools/agents/reports/KIT-qing_north.md` §4、§6。
- KIT-mongol地域形制、白塔意象、元表缺项占地和四向能力：默认沿用§11及任务报告，全部保留candidate，仅提供原向；不把草原河埠默认绑定港口服务。

- 旧“建筑占格与正式底面中心未定”：**已解决**，本批消费 `design/22` §1.4、§3 的占地与中心锚点；旧 6×4 / 6×5 自拟尺寸和临时前角锚点不再作为规范。
- 旧“大理右影触边、两图留白 / 精确轴向 / 比例未达标”：**已解决（本次入选处置）**，ART-B 两张不直接复制入选，按新清单重出；不表示旧图已修复。留白、轴向和尺度仍需对每张新图实测。
- 旧参考版本漂移：保留追溯。大理当前实测 SHA 为 `35092609538a50ba60ca5e972b2671831ee9ea36378d91e207acf1cb5665661c`，与较早 `fd28…` 版本登记不同；临安为 `700627a452f23e4de98441e2eb26b23397d98735ad7b1b1914e0d2c7a0fe6d55`。当前同名文件不能证明旧调用输入，默认不作为本批图像参考或入选图。
- 旧“作者是否接受大理朴素程度 / 佛教植物、临安繁华程度”：继续开放；默认所有本批图片保持 `candidate`，本次明确产图授权不等于作者审批通过。
- 旧“角色遮挡、屋顶淡出与旋转”：继续开放 **（待实测）**；默认只声明真实交付的 45° 单视图，联调交 TOWN-render / TOWN-assemble。
- 小塔提前出现与压缩高度：默认沿用上游原创扩展，保留作者审批项；不冒称 1093 三塔格局或实际文物尺度已复原。
- 上游清单并行修订：默认收尾比较 §3–§4，38 条之外的新增与变更在报告明确覆盖或缺口，不静默漏项。
- 新增植物原生小尺寸与建筑短边512检查不同：按§10单独登记和检查，不能通过混淆清单或放大画布改变上游根锚；公告板装配、地面独立接触影和真实物种尺度仍（待实测）。
