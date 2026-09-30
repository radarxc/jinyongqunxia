# 外放招式两段式提示词 · default / vfx

> 归属：默认风格包的招式美术提示词与样例复现；按基准 §18 引用所属文档，不新增玩法定义。
> 上游：`../STYLE.md` 作者意见、`assets/README.md`、`design/23` §2–§8、`design/vfx/schema.yaml`、`tools/vfx/README.md`；作者 2026-09-30 决定用 Three.js 合成动效；第 2 轮“线性的，持续的”决定覆盖旧离指短刃要求。
> 引用而不重定义：年代见 `design/02`；招式与路线见 `design/05`、武学图鉴和 `design/21`；归经、线色见 `design/15`；几何、alpha、混合与节奏公式见 `design/23`。
> 标注约定：金龙、可见气剑、颜色转译与演示均为**（原创扩展）**；小说逐字核对不足标**（待考）**；浏览器 / 真机验证不足标**（待实测）**；未审定制作参数标**【建议值】**。

## 1. 现行方向与历史对照

外放招式按两部分独立生成：白底效果连续帧 → Python 切帧抠成 RGBA；透明底发出方 → 标注发出点、方向、源截面宽；Three.js 按 Composition 合成与播放。Python 不烘动画，只另作单张静态峰值缩略图及 HTML 打包。制作对象仅消费已有内容 ID，不据视觉长度、动画秒数或效果数量重定义战斗射程、伤害段、CT 或 AoE。

- **降龙十八掌·亢龙有悔**：金色、整掌宽面透出、气势磅礴；金色设色结合水墨虚实、透明叠化、飞白与边缘消散。掌根、大小鱼际、指根下方共同透出宽气幕；龙首略实、龙身透底，不画掌心单点喷口、窄尾或实体金属龙。
- **六脉神剑 / 气剑类例外**：内力凝缩的线性、持续气线，始终从指尖连源；细长通透、近无色主体、极淡青 / 赤色缘。不用水墨笔触、墨迹、飞白、湿边晕染或一笔涂开；手、衣袖与背景也不用水墨。不得把气线做成离指短刃、弹丸、长指甲或实体光剑。
- **旧图保留对照**：`ref_mv_xianglong18_kanglong__ch02_base01.png`、`ref_sk_liumai__ch01_base01.png` 及各自 `index.html` 保持原文件与原 manifest 条目。它们是 RGB 整图 / 程序化概念演示，画内半透明不等于 PNG alpha。
- 旧六脉“离指后成刃”“至少 150 逻辑像素净空”“六枚气刃”的要求已被最新决定覆盖，仅供历史追溯，不能复制到新提示词或验收规则。新样例使用单指单线展示可复用管线，不声称六式 / 六束齐发已完成。

## 2. 题材、形制与颜色依据

| 题材 | 复用内容 ID / 书界 | 年代、服饰与依据 |
|---|---|---|
| 亢龙有悔 | `mv_xianglong18_kanglong` / `ch02_shediao` | 南宋 1217–1227（游戏推定，待考）；朴素宋式灰褐麻布袖；`design/02` §1.3.2、`chapters/02` §1、`design/05` §13.1、`catalog/skills-wujue` §2.3 |
| 六脉神剑 | `sk_liumai` / `ch01_tianlong` | 1093–1094（游戏推定，待考），北宋同期大理国；浅灰白素布袖；`design/02` §1.3.1、`chapters/01` §1.1、`catalog/skills-wujue` §5.3 |

大理国不是北宋辖地。只画不具名成年武者的手腕 / 手部，不画人物脸；新题材重查年代、地域、族群和身份。金龙是掌劲意象，亢龙仍为普通招，不因宏大画面改为 `ultimate`。劳宫等路线端点只引用归属文档，不作医学图谱；掌面定位点也不意味着单点喷嘴。

六脉指别引用 `catalog/skills-wujue` §5.3，归经引用 `design/15` §2.1、§3；其 §10.4 的“阴青、阳赤、调和金”是冲穴 UI 线色，下表仅保留旧整图的**（原创扩展）**色缘转译依据，不是原著固定气剑色，也不把本次单束样例绑定到某一剑。

| 剑名 / 指别 | 经脉 / 端穴 | 色缘提示 |
|---|---|---|
| 少商 / 拇指 | 手太阴肺经 / LU11 少商 | 淡青 |
| 商阳 / 食指 | 手阳明大肠经 / LI1 商阳 | 淡赤 |
| 中冲 / 中指 | 手厥阴心包经 / PC9 中冲 | 淡青 |
| 关冲 / 无名指 | 手少阳三焦经 / TE1 关冲 | 淡赤 |
| 少冲 / 小指 | 手少阴心经 / HT9 少冲 | 淡青 |
| 少泽 / 另一手小指 | 手太阳小肠经 / SI1 少泽 | 淡赤 |

旧图采用青 `#2A9D8F`、赤 `#C44536` 的极淡提示；新生成不要求每个像素精确匹配这些 UI 色。整门 `nature:harmony` 不意味着全画金色，不用六色霓虹。本次单束样例的淡赤仅是原创视觉候选，不新增商阳或其他具体剑式绑定；左右手、各剑对应发指、具体指法、剑意与可见色仍须三联 / 广州修订版逐字核对**（待考）**。旧“一手五路＋另一手小指一路”只保留为总览构型历史，不成为新单线模板的前提。

## 3. 效果帧提示词

默认 6 帧、允许 4–8 帧；每帧 1024×512、四边 ≥32 px 留白为 `design/23` §2.1 的**【建议值】**。主方向 `[1,0]`，固定视角、主体身份和根部；用初聚、成形、发出、盛势、衰减、余韵表现连续密度变化。生成器实际尺寸或布局有偏差时，逐格量取显式 `rects` 与局部锚点，不机械照抄请求坐标。

```text
Use case: stylized-concept
用途：原创古典武侠外放特效生产原图，只画效果，不画手或人物。
题材：{已核对的内容 ID 与视觉主题}。
布局：{4–8} 个连续帧，{列数×行数或独立单图}，请求单格 {宽×高}px，纯白间隔 {像素}px；左到右、上到下，不画格线、编号或文字。
技术背景：平坦纯白 RGB(255,255,255)，无纸纹、渐变、灰影、棋盘格。效果内不用纯白 / 近白实心高光；空隙是背景，不是白颜料。
固定关系：每帧同一主体和视角；根部 {位置与截面宽}，主方向向右；峰值参考长 {像素}，四边保留 {像素} 空白，所有须角 / 光缘完整入格。
阶段：{初聚→成形→发出→盛势→衰减→余韵的具体强弱差别}；轮廓变化轻微、根部固定，持续气线不得断成弹丸。
材质分支：{选用下方降龙或气剑段落全文}。
原创边界：视觉意象，不声称复原小说某帧或改变玩法。
排除项：{展开 §5 通用及对应效果分支全部排除项}。
```

**降龙材质段**：金色中国龙形掌劲，暖金 / 赭金 / 淡金，大尺度前冲回旋；根部是一道宽阔、开放的竖向金色气幕，代表整个掌面同时透出，不能收束为细尾、封闭尾卷或喷嘴。龙首较清楚，身体空气感、虚实透明、内有飞白空隙；保留可分离的金色信息，不以过曝白芯制造亮度。所有帧保持同一龙首、角须、根部与朝向。

**气剑材质段**：一条内力凝缩的线性连续气线，从固定左根向右持续伸出；细长近乎平行、不鼓成刃腹、不缩成飞刀。主体清澈、近无色，白底原图用可辨认的浅灰 / 极淡青或赤色保留信息，抠图后再审透明与亮度。柔和细色缘、轻微内部密度变化；不画水墨、烟雾、法阵、切断的弹丸或离指短刃。

纯新图省略参考参数；编辑自有候选时改用 `Use case: precise-object-edit`，明确输入仅是编辑目标，列出应保留的结构与改动目标。每张先 `view_image`，再决定入选；manifest 保存实际发送的全文，不能只存占位模板。未审批候选不能登记为 approved 母版。

## 4. 发出方提示词与标注

生成原生 RGBA 透明图，手、腕、必要袖口完整。默认 512×512 为 `design/23` §3 的**【建议值】**；本样例实际尺寸以 EmitterPlate 为准。发出方保留原 alpha，白衣与白色高光不能套效果层的白底色键。

```text
Use case: stylized-concept
用途：外放效果的独立发出方，只画不具名成年武者的手、必要手腕与袖口，无人物脸。
主体：{掌 / 指 / 手与兵器}；{姿态示意，非原著左右手断言}；{经核对的时代、地域与朴素服饰}。
背景与尺寸：真透明 RGBA，请求 {宽×高}px；四周完整留白，不画棋盘格、地面或投影。
构图：{掌面斜朝右、掌心及大小鱼际可辨；或食指平直指右，其他三指自然弯曲、拇指可辨}。
结构：每手五指、短指甲、合理指节、腕掌相连，保留足够遮挡线索说明每指身份。
发出关系：{完整掌面为宽源；或指定指尖为线性源}，方向 {单位向量}；不要绘制任何气劲、龙、光尾、锚点十字或坐标文字。
材质：{降龙可有朴素写实手部与金色气劲搭配；气剑的手和素袖全部写实非水墨}。
排除项：{展开 §5 通用和手部排除项全文}。
```

量图后在 `emitter/emitter-plate.yaml` 登记真实 `size_px`、`category`、`emit_point_px`、`direction`、`emission_width_px`。坐标原点左上、x 右 y 下；掌取掌面中心与整个有效掌面的横截面，指取指尖与指尖内侧的发劲截面。不得把圆弧最末端的一像素切线宽当成整个指尖宽。掌面源点与效果根锚必须在合成点相接，截面也须等宽；只对上中心点不足以证明“全掌透出”。

## 5. 排除项

- 通用：文字、汉字、书法、题签、印章、签名、水印、标志、边框、可见格线；图片标注只放 YAML / 说明文件。不得去除或伪造工具溯源。
- 来源：演员脸、具体影视 / 游戏独创造型、现成插画 / 剧照 / 截图构图；实际提示词不写演员、画师、公司或作品名，不寻找这些参考图。
- 形制：现代物件 / 服饰、跨朝代饰物、汉族交领左衽、清式马蹄袖、日式服饰、奇幻甲胄、增缺指、融合指、异常关节、断腕、长指甲。
- 效果原图：人物、手、衣袖、兵器发出方、纸纹、灰底、阴影、棋盘格、白颜料高光、越格粒子；发出方图：龙、气剑、能量束、光尾、烧入背景与地面硬投影。
- 降龙：掌心单点喷口、窄墨管、细尾根、黑墨球盖掌、腕部发射、金属雕龙、全身硬鳞、带翼西方龙。金色与金光为主色，但不得过曝抹掉手部与虚实层次。
- 气剑：水墨笔触、墨迹、飞白、宣纸、湿边晕染（包括手 / 袖 / 背景）；离指短刃、断裂弹丸、长指甲造型、实体剑柄 / 护手、冰晶、机械平行激光、浓烟、能量球、六路全出自一指。
- 两类均避免科幻法阵、游戏 HUD、火焰、电弧、低幼卡通、血腥、裸露；光色服务于气劲形态与力量。

## 6. 抠图、合成与动效复现

### 6.1 抠图与参数选择

正式制作采用显式 EffectSet YAML，源 PNG 保留原字节，切格与色键仅写派生 `frame_*.png`。manifest 保存第一段真实请求、来源与候选追溯；最终生效的分格 / 锚点 / 抠图参数以 `effect/effect-set.yaml` 为准。不能用背景连通域猜帧，也不逐帧自动紧裁。

- 两类先用 `white_key`；起始 `white_cutoff_8bit=250`、`opaque_luma=0.20`、`key_full_8bit=25`、`epsilon=1/255`、`dewhite=true`，是 `design/23` §2.3 的**【建议值】**，不是实材通用答案。
- 黑 / 灰底若有不透明浅边，逐步提高 `key_full_8bit`，复查金色饱和度、半透明细线和根宽。历史工具占位的 163 只是其已知原色推导值，不直接照搬到真实素材；质检的白边比 0 仍可能漏检不透明浅边。
- 近无色气剑须保留连续可读的主体；若色键后近乎全透明，调整阈值并比较三底、screen 后的实际可见性。参数仍无法兼顾轮廓和透明时重出浅灰 / 弱色缘原图，不以提高整体背景亮度或程序补画气线补救。
- 不做强腐蚀吃掉须角、细线，不给发出方套白底色键。效果纯白内部无法可靠分离时按 `design/23` 重出，当前格式不自行塞人工遮罩。
- 第一段实测白底存在 253–255 的轻微波动，不能称逐像素 `#FFFFFF`；保留原件与限制记录，按当前阈值抠图并实测三底，后续生成仍要求严格纯白。

### 6.2 合成参数与可执行命令

Composition 引用同套件的 EffectSet、EmitterPlate，`mode: baseline`，保留已存在的 `subject_ref`。方向、源点与根宽按 `design/23` §4 对齐；降龙 `gold_ink/lighter`，气剑 `qi_sword/screen`。发出方用 normal，效果后叠，低透明宽根覆盖掌面产生透出感。气剑强制 `scale_from: 1`、`drift_fraction: 0`，不做鼓包、离指位移。

效果长度与发出宽度是画面标尺，不是战斗参数。整图采用明确的固定不透明背景；lighter / screen 不能烘成在任意背景等效的透明整图。金色若被浅纸底冲白，可按 `design/23` §4.3 改用既有深墨底 `#4A433C` 并留纸底对照；六脉选能辨认近无色气线的简洁底色，不加水墨纹理。

以下在仓库根目录执行；先核对三份 YAML。本次直接复用已切好的六帧；只有修改抠图参数时才重跑 cut_frames。更改原料、锚点或 Composition 后重新生成 peak、JSON 与 HTML，避免配置与产物不一致。

```sh
for suite in assets/default/baseline/vfx/mv_xianglong18_kanglong assets/default/baseline/vfx/sk_liumai; do
  python3 tools/vfx/compose.py "$suite/composition.yaml" --root "$suite"
  python3 tools/vfx/build_demo.py "$suite/composition.yaml" --root "$suite"
  python3 tools/vfx/check_vfx.py "$suite/effect/effect-set.yaml" \
    "$suite/emitter/emitter-plate.yaml" "$suite/composition.yaml" \
    --root "$suite" --html "$suite/demo.html"
done
python3 tools/agents/check_assets.py assets/default/baseline/vfx --min 2 --max 4
```

已解决：VFX-plates 历史目录参数与工具入口不一致的问题，本任务验收明确采用上方三份 YAML、`--root` 与 `--html`，原失败记录保留在该任务报告；不把旧目录命令说成已通过。

原始效果帧固定六张；`timeline.js` 用秒数采样相位，`vfx_player.js` 在根对齐后以线性预乘 RGB 与 alpha 插帧，再应用包络、亮度和几何。效果层变化不带动手部。Composition 的 `transition.directional_mask` 启用方向推进，`softness` 是参考长度的比例；凝聚从根部向前端显现，消散同方向退去，边界无残影，具体规则见 `design/23` §6.1。节奏见该文 §5.2；`output.fps` 仅为历史采样元数据，实际网页由 requestAnimationFrame 连续采样。

HTML 内嵌播放器、展开的 Composition JSON、发出方与六张效果图，首次静止显示峰值，提供播放 / 暂停、速度与减少动态。唯一允许的外链是 importmap 中 `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js`；该固定版本遵从 `tech/01`，网络加载与实际浏览器运行须协调者验收。游戏直接传入自身的 THREE，不依赖此 CDN。PNG 母版与 `peak.png` 保留制作尺寸，HTML 可缩小无损 WebP 贴图，上限 `3,000,000 bytes`；超预算应失败，不能覆盖母版或虚报体积。

### 6.3 本次候选复现参数

下表记录本次实材选择，不提升为通用默认；完整分格、逐帧 anchor 与 phase 以各套件 YAML 为准。共同使用 `white_key / cutoff 250 / opaque_luma 0.20 / epsilon 1/255 / dewhite true`；从 `key_full=25` 对照提升，重点看黑 / 灰底浅边与原色损失。

| 参数 | 亢龙有悔 | 六脉单束 |
|---|---|---|
| 原效果帧 / 单帧尺寸 | 6 / 680×320 | 6 / 688×320 |
| key_full_8bit | 163 | 64 |
| reference_length / root_width | 554 / 183 px | 606 / 46 px |
| 发出方原尺寸 / 源点 | 1254×1254 / `[850,704]` | 1254×1254 / `[1178,468]` |
| 源截面 / emitter_scale | 320 px / 0.6 | 43 px / 0.4 |
| 合成发出点 E / length_px | `[1040,1180]` / 1700 px | `[600,500]` / 820 px |
| 母版 / scale | 3072×2048 / `[1,2]` | 1536×1024 / `[1,1]` |
| 横向缩放 sy | `0.6×320/183×2≈2.0984` | `0.4×43/46≈0.3739` |
| 横向接合核算 | 龙根宽 `183×(0.6×320/183×2)=384 px`，掌发劲宽仍为 `320×0.6=192 px` | `46×(0.4×43/46)=17.2 px`，等于指宽 `43×0.4` |
| 沿向缩放 sx | `1700/554≈3.0686` | `820/606≈1.3531` |
| 凝聚 / 发出 / 持续 / 消散 | 0.10 / 0.15 / 0.25 / 0.10 s | 0.10 / 0.10 / 0.30 / 0.10 s |
| scale_from / brightness | 0.95 / `[0.8,1,1,1,0.8]` | 1 / `[0.9,1.65,2,1.8,0.9]` |
| directional_mask | `enabled: true, softness: 0.08` | `enabled: true, softness: 0.045` |
| 6 帧 phase | `[0,1/6,7/24,5/12,5/6,1]` | `[0,1/6,1/4,1/3,5/6,1]` |
| peak_phase | `5/12=(0.10+0.15)/0.60` | `1/3=(0.10+0.10)/0.60` |

共同参数为方向 `[1,0]`、`angle_deg=0`、`drift_fraction=0`、crossfade、深墨底 `#4A433C`；两招母版与 `scale` 分别见上表。显式 `length_px` 覆盖 `range_hex×pixels_per_hex`，仅为此画幅排版，不作为射程事实。总效果 `T=0.60 s`，循环停顿 0.40 s，周期 1.00 s；HTML 展示 768×512，直接采样六张原帧。第 4 原效果帧映射到精确峰值，非均匀 phase 不改变原画数量；当前产物实测见 `tools/agents/reports/VFX-three.md`。

六脉增益最高 2，持续末降至 1.8，配合 screen 使已生成的线束更可读；不增加束宽、不改指尖锚点、不另画光线。金龙与六脉的软带展示长度分别为 `1700×0.08=136 px`、`820×0.045=36.9 px`（k=1、scale[0]=1 时）。这些是本套件美术**【建议值，待实测】**，不是物理速度或战斗强度；能否摆脱“细棍”观感仍交作者看动态审批，默认不重新生图。

## 7. 入库与质检

每套件目录位于 `../baseline/vfx/<内容 ID>/`，仅包含 `effect/source_sheet.png`、六张 `frame_*.png`、`effect-set.yaml`；`emitter/source_*.png`、`emitter-plate.yaml`；根目录的 `composition.yaml`、导出的 `composition.json`、`demo.html`、`peak.png`。来源追溯并入 manifest，历史调参 / 纸底 QA 仍见 VFX-plates 工作区与报告，本次不复制旧烘帧或动画产物。白底原图与透明发出方原件逐字节保留。

新登记 `vfx_mv_xianglong18_kanglong__ch02_base01` 与 `vfx_sk_liumai__ch01_base01`，`file` 指峰值图、`code` 指 `demo.html`，另写 `pipeline: two-part` 与文件清单。遵循 `assets/README.md` 的完整字段，分别追溯效果与发出方的真实 prompt / negative / references / source_path，记录实测时间、尺寸、SHA-256，状态保持 `candidate`。两条旧 `ref_*` 条目与文件不变；正式批量门禁继续保留，作者本任务已单独授权 §8 的 12 类共用发出方候选池。

`model: gpt-6-astra`、`effort: ultra` 沿 `assets/README.md` 指定执行配置，图像工具没有返回独立后端型号时不把它写成后端实测结论。生成使用内置 `image_gen`；本地目标编辑用 `referenced_image_paths`，不与 `num_last_images_to_include` 同时设置。效果原图 `transparent_background: false`，发出方 `true`。

| 检查项 | 通过口径 |
|---|---|
| 原料和帧序 | 4–8 张一致尺寸；方向向右、根部清楚；近邻轮廓连续，无跨格内容、断须或中途断流 |
| 抠图三底 | 每帧看黑 / 128 灰 / 白底，无白框、不透明浅边、杂底或棋盘格；指标不能替代目视 |
| 抠图指标 | 引用 `design/23` §2.4：8 px 边框内 alpha>1/255 比例 0；半透明残白 ≤1%；未舍弃前景回白底每通道误差 ≤2/255，均记实际统计 |
| 降龙起势 | 掌面与根截面等宽连续相接，整个掌面透出；金色主导、龙身虚实，无窄尾连掌心或龙头遮手 |
| 气剑起势 | 根部贴合指定指尖，线性持续、不鼓包、不离指成刃；主体近无色且可读，弱色缘无霓虹感 |
| 手型 | 每手五指、短指甲、合理指节、腕掌相连；掌面斜朝发出方向；遮挡有疑问如实记录 |
| 坐标与边界 | emit_point 与 anchor 对齐，源截面匹配，全部帧和变换端点不越界；32 px 安全边距 / 40% 留白为建议，偏差须登记 |
| 风格与书证 | 气剑全画面非水墨；金龙是原创意象；配色 / 姿态不冒充原著事实，秒数与像素不改玩法 |
| 演示 | 单文件 ≤3 MB；仅 importmap 的指定 Three.js 外链；内联脚本语法正确、输出清单可追溯；峰值目视、真实浏览器另验收 |
| 元数据与旧件 | ID、路径、来源、尺寸、哈希与实际一致；旧 ref 文件与条目逐字节不改，状态仍 candidate |

当前新演示位于两套件各自的 `demo.html`；真实浏览器未验证，待协调者验收。手机 / Android / iPad 性能、sandbox 中的实际渲染与跨设备兼容性仍**（待实测）**，不得把脚本语法通过或自动检查当作真实播放结论。

旧 `ref_*/index.html` 历史参数仅用于解释对照：逻辑画布 1400×788、DPR 上限 2、循环 5.6 秒，强度 / 浓淡 40–140%、速度 0.5–1.5×；六脉曾为指端凝聚后离指 150 px 成短刃，每路错开 0.06 秒；降龙曾为 0–1.9 秒生发、3.8 秒退隐、浓淡 82%。旧演示做过 JS 语法、隔离 Canvas / 控件与外部资源扫描，真实浏览器当时未完成。这些历史参数不再是新效果帧管线的生成、动画或验收默认值。

## 8. 发出方图池

按发出方式共用，同类招式引用一张发出方图；具体选图读取已配置的发出动作，不依据武学名推断外放。池位于 `assets/default/vfx/emitters/`；每类交付 `source_<type>.png` 和 `emitter-plate.yaml`，总清单为该目录的 `manifest.yaml`，12 条均为 `candidate`。图池是**（原创扩展）**的制作资产，不注册新招式、兵器或经脉端点。

### 8.1 类型与取图

| type / ID 后缀 | EmitterPlate.category | 主体 | 发出点与有效截面 |
|---|---|---|---|
| `palm` | `palm` | 原样例掌面、灰褐布袖，逐字节复制 | 掌面中心；整个有效掌面，排除手指与腕袖 |
| `finger` | `finger` | 原样例伸指、浅灰白布袖，逐字节复制 | 指尖；指尖内侧完整截面 |
| `fist` | `palm`（兼容值） | 握拳前伸的手臂 | 拳面中心；拳面上下界 |
| `sword` | `sword_hand` | 持普通直剑的手 | 剑尖；尖端内侧可见剑身截面 |
| `sabre` | `blade_hand` | 持普通单刀的手 | 刀尖；尖端内侧刀身截面 |
| `staff` | `weapon_hand` | 持素木棍的手臂 | 棍端中心；棍端直径 |
| `spear` | `weapon_hand` | 持普通木杆枪的手臂 | 枪尖；枪头尖端内侧截面 |
| `whip` | `weapon_hand` | 持软鞭 / 软索的手 | 鞭梢；末段软索粗细 |
| `fan` | `weapon_hand` | 持展开素折扇的手 | 朝右扇沿中点；有效扇沿完整上下跨度 |
| `throw` | `throw_hand` | 投掷离手瞬间的手，不含暗器 | 指尖前方离手点；相邻离手指端的有效截面 |
| `instrument` | `instrument` | 持素竹箫 / 笛的手 | 朝右管口中心；管口直径 |
| `leg` | `palm`（兼容值） | 踢出的小腿与素布鞋 | 脚尖；鞋尖内侧截面 |

全部 ID 为 `vfx_emitter_<type>`。`fist`、`leg` 在现行 schema 中没有准确类别；本次仅为通过既有文件接口暂存 `palm`，YAML 注释、manifest 和报告明确真实类型。这不宣称腿属于掌；消费方按素材 ID / 路径选图，不能按兼容 category 回退到掌图。现有合成器只消费源图、点、方向与宽度；由后续文档任务在 `design/23` §3 和 schema 增列拳 / 腿后迁移这两个字段。本任务不修改上游定义。

### 8.2 提示词模板

新图沿用样例的写实皮肤、朴素灰 / 米白布袖、左上柔光，无面部。兵器采用宋明语境的普通直剑、单刀、素木长兵、软索、折扇与竹管的简素造型，不画名剑名刀；准确断代、流派握法不作已考证结论。图像原生直 alpha 保存，不套白底色键、不用代码补画手脚或兵器。

```text
Use case: stylized-concept
Asset type: one reusable native-transparent RGBA emitter plate for an original Chinese wuxia game.
Reference role: existing palm/finger samples establish realistic skin, simple cloth and quiet lighting only; do not copy their pose onto a weapon.
Subject: {one adult hand and attached forearm holding the ordinary object / one kicking lower leg and plain cloth shoe; exact type from §8.1}.
Pose: {type-specific gesture}; {tip / palm / fist / rim / tube mouth / toe} faces horizontally RIGHT, direction [1,0]. Draw only this emitter, no released object for throw.
Materials: realistic warm skin, short natural nails; plain grey or off-white woven cloth; {unadorned steel / wood / bamboo / soft cord / plain fan leaf}. Restrained Song–Ming Chinese costume and ordinary object forms, no named weapon or character.
Composition: square 1:1 canvas, request 1254×1254 or proportional square output. Entire hand, wrist, short sleeve and necessary object fit inside all four borders, with visible transparent clearance. Keep the right-facing source readable. Lighting from upper left, soft self-shading only.
Anatomy: exactly five fingers per hand, anatomically plausible grip and joints, thumb opposed to the gripping fingers, natural occlusion; leg has one ankle and foot, no extra limbs.
Background: genuinely transparent RGBA, clean native alpha, no painted background or checkerboard. Preserve opaque pale cloth and metal highlights.
Avoid: face, torso, extra hands or fingers, fused digits, broken joints, detached wrist, cropped object tips, modern clothes, ornate court costume, armour, fantasy blades, named legendary weapons, text, watermark, anchor marks, arrows, frame, floor shadow, ink wash, paper, white/grey background, particles, energy, glow, dragon or beam.
```

每类最多生成 2 个候选、选 1；模板占位必须展开，实际发送全文写入 manifest。掌 / 指本次生成数为 0，各复用既有文件 1 张；其 `prompt` 继承原始选中请求，`source_path` 记录本次复制来源，原生成地址另列。新图生成后复制工具原件，记录实际尺寸、时间、哈希；不把请求尺寸当输出尺寸，不把执行模型名当图像后端实测型号。

### 8.3 发出点量法

1. 对交付 PNG 用 `view_image` 检查手指 / 握持 / 朝向 / 透明边缘。读取实际宽高及 alpha；查看器若把 PNG 标成 `application/octet-stream`，只修展示 data URL 的 MIME 为 `image/png`，不重编码文件。
2. 左上原点，x 右 y 下；在真实图片上选择 §8.1 指定的源点。兵器取尖端或端面，不能取持握手；投掷取接触指尖前方的离手点并记录透明间距。掌面和拳面按可辨的有效面选中心，不拿整手包围盒代替。
3. 方向按画面发力意图标定、核验并归一；本池 11 类为向右 `[1,0]`，乐器按实际管轴 `[937,26]` 归一为 `[0.9996152427470851,0.027737456042074934]`（向右略下约 1.59°）。弯刀不机械套刀刃末端切线。像素索引 `(i,j)` 的中心坐标为 `(i+0.5,j+0.5)`。尖端本身可能只有一像素宽；向内取一条与方向垂直的有效截面，记录扫描列和上下端点。数像素时 `w=y_max−y_min+1`，记录半开区间时 `w=y_end−y_start`；不得混用。
4. alpha 阈值仅帮助区分实体边缘与极低透明噪点；手掌 / 扇沿等仍需目视确定有效面。每条 manifest 的 `measurement` 保留截面坐标、算法或手工选面依据；最终消费各 YAML 的 `emit_point_px`、`direction`、`emission_width_px`。指样例复测：x=1165、alpha≥128 的 y=447..489，宽 `489−447+1=43`；掌沿用有效面 y=[544,864)，宽 `864−544=320`。
5. 图片换尺寸必须同步点和宽：等比倍率 `s` 时，坐标与宽均乘 `s`；本次保留原始正方形输出。合成缩放和根宽匹配只引用 `design/23` §4，不将像素值换算为射程、伤害或 CT。

主体净距按记录的 alpha 阈值统计，不能直接当作合成器按 alpha>0 检查的安全边距。折扇取全扇沿宽源，后续须按它重新配置效果根宽和画幅，不能照搬指尖细束的参数。

本池只交付源图与 EmitterPlate。后续效果库按动作引用池中素材；`Composition` 的 root 边界当前要求同套件路径安全，跨池装配应由下游打包环节显式复制或规划共享套件根，见报告 §6，不能绕过路径检查。

## 9. 本文新增术语与 ID

不新增玩法术语或玩法 ID。EffectSet、EmitterPlate、Composition 与方向遮罩见 `design/23` §6，展开的 `composition.json` 和播放器接口见 `tools/vfx/README.md`。旧 `keyframes.json` / `animation.json` 为已废弃动画路线的历史输出。两个招式 `vfx_*` 为既有内容的候选素材 ID，旧 `ref_*` 为历史整图对照；§8 新增 12 个 `vfx_emitter_<type>` 资产 ID，逐条登记于池 manifest。

## 10. 数据校验规则与测试用例

在仓库根目录执行：

```sh
python3 tools/agents/check_assets.py assets/default/vfx/emitters --min 12 --max 12 --min-side 512
for type in palm finger fist sword sabre staff spear whip fan throw instrument leg; do
  python3 tools/vfx/check_vfx.py "assets/default/vfx/emitters/$type/emitter-plate.yaml" --root "assets/default/vfx/emitters/$type"
done
```

另核对 12 个 type / ID 唯一、文件一一对应、所有图为正方形 RGBA 且同时存在透明背景和非透明主体、哈希与元数据相同；掌 / 指必须与样例逐字节相同。脚本通过不能替代五指 / 握持 / 左上光源的目视检查，也不代表作者已批准或真机合成已验收。

## 11. 待决事项 / 依赖

### 11.1 替下游给出的建议值

旧 3:2、左侧起势、掌劲约 40% / 剑气约 50% 留白条目保留追溯；现按 `design/23` 的同帧一致尺寸、掌面宽源、线性连源与全帧安全边距制作，不宣称固定达到旧留白比例。抠图 250 / 0.20 / 25 是试验起点，最终参数取各 EffectSet 和本任务报告，换原图须重新验证。新增六脉五边界亮度与两套遮罩软带仅为 §6.3 的候选美术值，默认先交浏览器和作者验收。

### 11.2 本文依赖的上游事实

作者两段式与气剑例外已在 `STYLE.md` 明示；格式与公式消费 `design/23` 和 schema，工具执行见 README。旧存储 / 工具口径问题延续 `ART-B-vfx` 报告 §5–§6，旧气剑例外同步请求见 `ART-R1-vfx` 报告 §6；本任务不修改这些上游文件。

### 11.3 对基准的修改提案

无新增玩法提案；保留旧 `ART-B-vfx` 报告的二进制入库等提案追溯，是否同步由协调者按作者决定处理。本模板只落实当前授权的素材生产方式。

### 11.4 原著考据待办

亢龙出掌姿势 / 洪七公授掌顺序，六脉左右手、各剑对应发指、剑意与可见色仍须三联 / 广州修订版逐字核对。默认不编造引文、回目，不把近无色意象解释为原著固定六色；网络对读线索与旧核查限制保留见 `ART-R1-vfx` 报告 §3。

### 11.5 开放问题（附默认值）

- 作者审批：旧两张与新两套件均以 manifest 实际状态为准；新套件默认 `candidate`。金色力度、虚实透明、宽根接掌、气线可见程度、淡赤色缘及手势审美待作者审批，不以自检代替批准。
- 手部精度：已解决：旧降龙缺小指 / 掌面不清、旧六脉长指甲 / 水墨方向的上一轮返修见 `ART-R1-vfx` §7。旧六脉下手遮挡、旧降龙角尖边距、侧前角度偏差仍留作历史限制，不作为解剖 / 严格 45° 母版；本次独立手图仍为姿态示意，默认不宣称原著手势书证。
- 运行时透明输出：旧“两张 RGB 各带纸底 / 石庭底”已明确是历史整图限制；新管线交付分离 RGBA 与固定背景整图，运行时消费分层原料与 blend。战斗接入、主力手机 / Android / iPad 性能仍**（待实测）**，默认先作离线审批样例。
- 色键质量：原图背景有 253–255 波动，默认保留源图并登记偏差，按实测阈值产 RGBA；严格纯白生产要求继续保留。图像模型没有提供真实前景 / alpha 真值，不宣称已无损恢复生成前透明度。
- 源点、方向与宽度：默认服从逐图量取；掌心定位不改变整掌发力要求，单束指图不绑定某一具体剑式。任何新视角、重出图或缩放须同步元数据后重合成。
- 演示验收：真实浏览器未验证，待协调者验收；默认保留当前 Three.js 单文件 HTML，检查固定 CDN 及其模块依赖能加载、首屏峰值、控制与减少动态、方向遮罩、色彩和连源关系；移动设备与真实浏览器结果另记，不虚报通过。
- 发出方图池作者确认：默认写实手部画法沿用样例，12 类保持 `candidate`；拳 / 腿 category 扩展、兵器局部透视和跨池装配由后续任务同步，默认先按 ID / 路径选图。普通造型为原创候选，未完成器物精确断代或小说手势逐字考据。
- 复用样例边缘：掌 / 指已有极低 alpha 的孤立噪点及彩边，默认优先执行逐字节复用，不在本任务修像素；如作者要求修边，须另建版本并重测锚点。新图的逐张限制与候选淘汰原因见池 manifest。
