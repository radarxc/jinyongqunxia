# 建筑·地图拼接 · 宋套件提示词模板

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

**不允许**非等比拉伸、仿射剪切、透视 warp、旋转 / 镜像纠偏、代码补画底面或屋檐。生成视角错误应回到 `image_gen` 重出；几何后处理不把风格候选变成自动批准的正式资产。

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
- 本轮上述网页仅用于文字核验；没有将历史画作、旅游照片或网页截图送入图像模型。真实图片参考以每次调用记录为准，不把“查阅来源”写成“模型已参考图片”。

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

本批面向北宋东京开封、西京洛阳、大名的匿名拼装建筑，年代窗口约1093；不是某城逐栋复原。制作继续使用上文宋套件的写实材质、45°斜向 / 30°俯仰 / 2:1地面投影、左上光和右下短接触影。所有组合为**（原创扩展）**，具体屋顶、窗棂、彩画与栽植位置**（待考）**。

### 11.1 年代差异与占地来源

- 普通民居用暖灰泥土墙、局部灰砖台基、哑光木构与灰陶瓦；院落强调围墙和较完整的正房 / 厢房。此为美术取舍，不把明清北京四合院定式或江南马头墙倒推到宋代。
- 商铺沿街开敞，用货架、布棚、竹帘区别业态；酒楼 / 茶肆以楼层和廊栏表达繁华。参考故宫《清明上河图》馆藏介绍，不照搬现代复建景区。
- 官署、寺观、宫殿用克制赭朱木构和局部装饰，避免清式和玺 / 旋子彩画、宫廷黄瓦泛化。1103刊行《营造法式》只作时代参照，不宣称准确复原1093构件尺度。
- 佛塔取开封铁塔的八角、褐色琉璃砖母题；成图层数与细部以实际候选记录为准，不以金属铁架表现“铁塔”。
- `biaoju` 用货栈 / 护运行院落表达；宋代成熟“镖局”称谓仍待考。赌场、山庄为项目功能外观，不新增营生或具名机构ID。河埠不带船、水景或旅行入口。

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

历史来源及访问状态见 `tools/agents/reports/KIT-song_north.md` §7；底层图像模型 / seed / 价格未由内置工具披露，不编造版本或费用。地域风格、塔层概化与正式上游目录接纳交作者确认，默认沿用本批候选；门洞、遮挡与真机效果仍**（待实测）**。

## 本文新增术语与 ID

不新增玩法 ID；复用 §3 的38个建筑资产ID与最新§4.4的7个植物资产ID。植物文件使用`<asset_id>__v01/v02.png`，双下划线后是变体键，不是新玩法ID。`building.anchor`为最终PNG底面中心像素，`sources/`为归档生成来源，`meta/`为逐type制作元数据。它们是本批资产约定，不扩大`town/schema.yaml`的现有定义范围。

§11另登记19个 `bld_kit_song_north_*` 资产ID，具体后缀与占地见§11.1；它们是本任务授权的同构套件，不新增玩法、城市、机构或营生ID。`song_north` 尚须由下游接入正式城市目录 / schema，不能假称本素材任务已完成该上游变更。

## 待决事项 / 依赖

### 替下游给出的建议值

透明留边默认至少 16 px；轴斜率容差沿用上游 ±0.03。最终 canvas 短边 ≥512 是现有检查器要求，地面像素尺度仍按 64×32 每格计算；canvas 尺寸随建筑高度 / 屋檐与留白变化，不固定所有建筑方形。

新增植物的最终4px留边来自最新上游；矩形裁边时alpha≤2噪点阈值、外扩4**源**px，以及实际根偏差≤1**成品**px的额外告警均为本轮 **【建议值】**。2/255≈0.78%不透明度；只用于确定裁切矩形，不覆盖存留像素的alpha。全部原图与裁去区域统计保留，可复核或更换制作阈值。

### 本文依赖的上游事实

占地、type、入口和允许旋转引用 `design/22` §3；城市与年代引用其两城 CitySpec。作者要求左上光、右下影覆盖快照旧光向。素材字段 schema、单视图渲染缩放、四向能力与碰撞 / 遮挡尚需下游联调，不假称 PNG 已替代 GLB。

### 对基准的修改提案

无新增玩法或数值提案。需同步 `design/22` 光向以及 `tech/07` 旧风格 / 存储口径的事项写任务报告第 6 节，本文不越权修改上游。

### 原著考据待办

保留旧稿问题：三联 / 广州修订版《天龙八部》的大理建筑、植物与佛教场景，《射雕英雄传》的临安茶肆描写尚未逐字核对，不编回目或引文。白族民居细部、佛龛造像、宋茶器、瓦作、斗拱、镖局称谓及地域植物史仍待考；默认历史意象与原创构图。

### 开放问题（附默认值）

- 旧“建筑占格与正式底面中心未定”：**已解决**，本批消费 `design/22` §1.4、§3 的占地与中心锚点；旧 6×4 / 6×5 自拟尺寸和临时前角锚点不再作为规范。
- 旧“大理右影触边、两图留白 / 精确轴向 / 比例未达标”：**已解决（本次入选处置）**，ART-B 两张不直接复制入选，按新清单重出；不表示旧图已修复。留白、轴向和尺度仍需对每张新图实测。
- 旧参考版本漂移：保留追溯。大理当前实测 SHA 为 `35092609538a50ba60ca5e972b2671831ee9ea36378d91e207acf1cb5665661c`，与较早 `fd28…` 版本登记不同；临安为 `700627a452f23e4de98441e2eb26b23397d98735ad7b1b1914e0d2c7a0fe6d55`。当前同名文件不能证明旧调用输入，默认不作为本批图像参考或入选图。
- 旧“作者是否接受大理朴素程度 / 佛教植物、临安繁华程度”：继续开放；默认所有本批图片保持 `candidate`，本次明确产图授权不等于作者审批通过。
- 旧“角色遮挡、屋顶淡出与旋转”：继续开放 **（待实测）**；默认只声明真实交付的 45° 单视图，联调交 TOWN-render / TOWN-assemble。
- 小塔提前出现与压缩高度：默认沿用上游原创扩展，保留作者审批项；不冒称 1093 三塔格局或实际文物尺度已复原。
- 上游清单并行修订：默认收尾比较 §3–§4，38 条之外的新增与变更在报告明确覆盖或缺口，不静默漏项。
- 新增植物原生小尺寸与建筑短边512检查不同：按§10单独登记和检查，不能通过混淆清单或放大画布改变上游根锚；公告板装配、地面独立接触影和真实物种尺度仍（待实测）。
