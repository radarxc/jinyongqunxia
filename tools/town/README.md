# 城镇布局工具

| 项 | 内容 |
|---|---|
| 归属 | `design/22` 城镇布局契约的离线 Python 实现 |
| 上游 | `docs/design/town/schema.yaml`、两城 `CitySpec`、`docs/design/22-town-layout-and-generation.md`、`docs/tech/02-rendering.md` |
| 环境 | Python 3.11；标准库、Pillow、NumPy、PyYAML |
| 输出 | `CitySpec` YAML、`TownLayout` YAML、统计 JSON、北向上平面 SVG / PNG、45° 整城 PNG / JPEG、可开关调试层 SVG |
| 范围 | 默认45°静态预览和真素材总装；运行时GLB、分片与压缩交后续运行时任务 |

## 结论先行（TL;DR）

生成器采用构造式放置：先固定地标与功能建筑，再沿街贪心填充通用建筑，并自动补入口步道。按2026-09-30第5轮裁定，建筑统一 `rotation_deg=0`，占地保持目录原始宽高；入口方向只用于放置评分，实际通行仍须可达。相同规格字节、种子与生成器版本产生相同布局；不做回溯、容量证明或节点预算。规格中的通用建筑下限按稳定可放结果登记，生成器不会暗改输入配额；功能建筑和几何、道路、行走层约束仍须通过校验。

先生成并校验，再渲染。缺素材时用带实例 ID 的占位建筑与纯色贴片，并在渲染报告中列出替代键。占位预览用于检查分区、坐标与通行，正式贴图总装由 TOWN-assemble 完成。本仓库现行 `design/22` 的数据、生成、渲染章节分别为 §5、§6、§7。

城垣输入兼容旧 `wall`，也可改用 `walls` 声明若干具名闭合墙环；相邻墙的重合栅格只渲染一次，普通门用 `wall_ref` 指向所属墙。`walls: none` 表示无墙营地：不要求城门，以主轴最南西格作为确定性道路/六角根；当前最简渲染不额外虚构寨栅。河流穿墙必须逐处列入 `water_gates`，孔洞保留连续水面，门楼暂复用城门构件；其余墙水相交逐格报 `TOWN_WALL_WATER_UNDECLARED`。

## 1. 快速运行

从仓库根目录运行：

```bash
python3 tools/town/gen_layout.py docs/design/town/city_dali__ch01.yaml -o /tmp/tianshu_town_dali.yaml --stats /tmp/tianshu_town_dali.stats.json
python3 tools/town/check_town.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml
python3 tools/town/plan_view.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml -o docs/design/town/history/dali_plan.svg
python3 tools/town/render_town.py /tmp/tianshu_town_dali.yaml -o /tmp/tianshu_town_dali.png --scale 0.25 --overlay /tmp/tianshu_town_dali.overlay.svg --placeholders-only --report /tmp/tianshu_town_dali.render.json
python3 tools/town/make_generic_city.py --all --importance secondary,site --check
python3 -m unittest discover -s tools/town -p "test_*.py"
python3 tools/lint/check_ids.py --strict
```

临安改用 `docs/design/town/city_hangzhou__ch02.yaml`。渲染器通过 `layout.source_spec.path` 读取墙、城门、桥和调试分区；搬移文件后可加 `--spec <CitySpec路径>`。布局来源使用仓库相对路径，外部输入只记文件名；不会写入绝对路径或时间戳。

四个主脚本操作成功返回 0，输入错误、生成失败或校验 error 返回 1；校验 warning 不改变退出码。功能建筑或几何失败不写目标文件；通用欠配额仍导出含 `validation.errors` 的布局并返回 1，供调整源规格。调用方必须检查退出码与校验结果，不能将欠配额布局交总装。

## 2. 命令行选项

| 脚本 | 参数 | 含义 |
|---|---|---|
| `make_generic_city.py` | `--city <id> --band <band>` | 为指定小城 / 遗址的年代带逐章写 `CitySpec` |
| 同上 | `--all --importance secondary,site` | 批量处理名录中的指定重要度；可加 `--band` / `--primary-chapter` 筛选 |
| 同上 | `--check` | 逐份运行规格检查并输出按带 / 套件统计，绝不写文件 |
| `gen_layout.py` | `<spec> -o <layout>` | 读取城市规格，原子替换布局文件 |
| 同上 | `--stats <json>` | 保存格数、配额、连通性、耗时及布局 SHA-256；统计不参与布局字节 |
| `check_town.py` | `<spec> [layout]` | 只给规格检查输入；同时给布局检查空间、道路、两种行走层和素材 |
| 同上 | `--strict-assets` | 缺素材从 warning 提升为 error |
| 同上 | `--release` | 发布前额外检查正式场景引用、素材 approved 等；包含严格素材检查 |
| 同上 | `--json` | 输出机器可读问题数组 |
| `plan_view.py` | `<spec> <layout> -o <svg>` | 输出北向上平面 SVG 和同名 PNG；拒绝源 SHA-256 不一致、网格不一致或含 validation error 的布局 |
| 同上 | `--cell-px <n>` | 每游戏格像素，默认地图长边 960 px；允许 2–24，整图最多 20 MP |
| 同上 | `--font <ttf/otf/ttc>` | 指定本地中文字体；自动查找黑体、苹方、Noto CJK、文泉驿、微软雅黑，找不到则明确失败 |
| `render_town.py` | `<layout> -o <png/jpg/jpeg>` | 按扩展名合成完整城镇预览 |
| 同上 | `--scale <n>` | 相对 64×32 母版缩放，直接按目标比例绘制 |
| 同上 | `--jpeg-quality <1..100>` | JPEG 质量，默认 85；PNG 输出忽略此参数 |
| 同上 | `--overlay <svg>` | 输出调试图层；与 PNG 同目录时自动引用该 PNG |
| 同上 | `--report <json>` | 保存尺寸、耗时、缺失素材、警告与建筑绘制次序；stdout 同步输出 |
| 同上 | `--placeholders-only` | 强制占位，报告仍列明替代键 |
| 校验 / 渲染 | `--tile-manifest`、`--building-manifest` | 覆盖默认两份素材清单路径 |

默认始终加载 `assets/default/baseline/tile/manifest.yaml` 与 `assets/default/baseline/building-map/manifest.yaml`；非基线 `era_kit` 再把同类 `<kit>/manifest.yaml` 置于其前。校验器另支持 `--assets <风格包根目录>`。`--release` 是静态门禁；斜率、光向、接缝与真机表现仍须分别验收，首批单视图预览锁定相机。

### 2.1 北向上布局图

`plan_view.py` 从布局的道路 / 水 / 桥 / 建筑掩膜和规格的城垣 / 分区绘图，复用同一坐标生成 SVG 与 PNG。`lakes[].polygon` 用湖体轮廓及同一水格掩膜绘制，西湖与洱海纳入水系图例。SVG 保留 `<text>`，PNG 用 Pillow 和本地中文字体直接绘制，不依赖浏览器、SVG 转换服务或新增下载。两种输出共享几何；字体排版可能随查看器的本地字体略有不同。2026-09-30 本机实测 Pillow 12.1.1；这是验证版本，不是最新版声明。

schema v1 不增加名称字段。在既有 `basis` 说明开头写 `图名：和宁门；后续依据文字` 即可标注规范汉字；其他五类要素同理。未提供图名时按城门方位、道路级别、分区用途给中文通名，并把未知名称标为待考。城门 / 街道 / 水系 / 桥 / 分区 / 固定地标依次编号 G / R / W / B / Z / L，右栏列全名；密集处只移动编号并保留引线，几何坐标不移动。SVG 节点标题与 `desc` 保留局部 ID、坐标和依据原文。

灰褐矩形是建筑底面，红褐矩形是固定地标；分区按优先级着色，显示游戏用途，不代表史料可信度。`basis` 含“游戏包络”时边界用虚线，其他城垣按实际阻挡格显示。页眉先从 `design_intent.notes` 的 `history/<文件>.md` 引用取真实路径；没有显式引用时按 `city_id`、`era_kit`、`historical_year` 推导，旧大理/临安文件名保持兼容。图上的“据 / 推 / 创 / 综 / 待”仅从依据说明归纳为来源引用、推定、原创、混合、待考提示，不能认证坐标精度。比例尺只标游戏格，不把压缩城市误读为历史实尺。

### 2.2 推定格局生成器

`make_generic_city.py` 只面向 `cities.yaml` 中 `importance: secondary/site` 的开放年代。secondary 固定 96×96、有四面城墙和南北门；site 固定 64×64、仅留一段残墙；蒙古草原营地可为 `walls: none`。模板提供十字主街、官署、市场、商业、住宅与寺观五区；湿润地域及港口业务增加一河一桥，各业务只增加一座对应功能建筑。所有依据统一标为“推定格局（作者 2026-09-30：小城 / 遗址不做史料复原）”。

种子由 `city_id + band` 派生；同城同年代带先生成锚点规格，再深拷贝到各章，所以除 `chapter_id` / `book_world` 外逐字段一致。`era_kit` 直接复用 `tools/agents/prod_plan.py` 的 `kit_for(region, band)`；建筑 ID 只从该套件 manifest 目录登记项选择。写入默认目录是 `docs/design/town/`，也可用 `--out` 覆盖；批量验收必须带 `--check`。

### 2.3 年代套件

可自动叠加的套件键为 `song_north`、`liao_jin_north`、`yuan_north`、`yuan_south`、`ming_north`、`ming_south`、`qing_north`、`qing_south`、`xiyu`、`tubo`、`mongol`；旧 `tang/song_dali/song_southern/yuan/ming/qing_early` 仍可读取。每类素材先查 `assets/default/{tile,building-map}/<kit>/manifest.yaml`，缺种类再查 baseline。回退写进渲染报告 `asset_substitutions`；`--strict-assets` 允许但发 warning，`--release` 将每项替代提升为 error。显式传 `--tile-manifest` / `--building-manifest` 时只使用指定清单，便于夹具和隔离诊断。

### 2.4 JPEG 预览

输出名为 `.jpg` 或 `.jpeg` 时，渲染器将 RGBA 结果铺到与 `plan_view` 一致的浅底色 `#faf8ef`，转为 RGB，并以默认质量 85 保存；可用 `--jpeg-quality` 调整。城图磁盘规则 v2 的 manifest 预览建议使用 `--scale 0.25 --jpeg-quality 85`，并确保成品短边至少 512 px。PNG 仍保留既有背景与编码路径。

## 3. 数据流与确定性

1. `schema_check.py` 与 `check_town.py` 校验输入字段和静态几何。
2. `common.py` 建立城墙、门孔、河湖与桥、规划格与六角采样；`roads.py` 建立主路和有真实宽度的接驳。湖多边形按格中心命中栅格化，与河格合并为 `water_cells`；桥的 `river_ref` 可引用河或湖，湖桥须覆盖水段且两端登岸。湖不默认通航，河埠仍要求邻接明确可航水域。
3. `placement.py` 按固定次序放地标与功能建筑；必需通用建筑先沿街轮流填充，可选通用建筑再补余地，直到各自max或无候选。所有建筑0°，四边逻辑接入点均可选，目录原图门向只加评分；接不上路网时补显式步道，始终检查规划与六角通行。
4. `gen_layout.py` 生成地表、植被和最终两个行走层，写 canonical YAML 与独立统计。
5. `render_town.py` 按地面、道路边、水、岸、桥、地面叠加、高度对象合成；墙、门、树和建筑共用远角深度键。

PCG32 按 `design/22` §6.1 分子流，候选抖动在建表时固定；地面 / 植物贴图变体用 FNV1a64 标签选择。水面由 `water_material.py` 读取四片内部纹理，统一均色、镜像接边，按绝对屏幕坐标平滑混合；叠加种子确定的低频明度场，增益0.985–1.015。水格与陆侧水带采样同一连续场，无逐格明度跳变，不改变素材PNG。通用min只作验收下限，不参与放置停止条件；density是软视觉目标，超出只警告。耗时只进入统计。编辑 YAML 注释或空白会改变 `source_spec.sha256`，因此也会改变完整布局字节。

大理地表母版为 `(96+96)×32=6144` 宽、`(96+96)×16=3072` 高；临安为 10240×5120。真实建筑若伸出地表顶边，按 PNG 非透明包围框自动加顶边留白（含32母版像素余量），不改变布局坐标。本轮大理增加523像素，完整图6144×3595、0.25图1536×899；临安无需扩边，0.25图2560×1280。SVG `viewBox` 同步扩边，`planning` 组统一平移。

规划 `+z` 朝北，世界 `+z` 朝南；顶点使用 `z_world=H-z`，格中心先加 0.5。渲染投影为 `px=32(x+z)`、`py=16(H+x-z)`；高度每米向上 `16√6` 像素。规划格索引不能直接作为六角 `(q,r)`。

## 4. 素材要求

清单支持记录列表，或 `{assets: [...]}` / `{assets: {资产ID: 记录}}`。用 `id` / `asset_id` 匹配完整资产 ID，`file` 指向 PNG；相对文件优先按清单目录解析，也支持仓库相对路径。`metadata` / `meta` / `meta_file` 可指向外部 YAML，内部图片路径以元数据目录为基准。

```yaml
assets:
  - id: bld_kit_song_dali_house
    status: candidate
    metadata: house/meta.yaml
```

```yaml
# house/meta.yaml
footprint_cells: {w: 6, h: 5}
variants:
  - {key: south, rotation_deg: 0, file: south.png, anchor_px: [260, 320]}
```

建筑须为 RGBA，登记底面中心 `anchor_px: [x,y]`（也接受 `{x,y}`）及底面尺度。优先用 `footprint_width_px` 表示底面投影水平跨度；也接受 `footprint_cells` / `footprint_m`，按 `32×(w+h)` 换算。实例按底面跨度等比缩放，不能用透明画布宽或屋檐宽代替。当前38张建筑只有0°视图，生成器只放0°且不交换宽高；严格检查只需这些实际使用的0°视图。素材适配器仍支持显式 `views`，但不把0°图片旋转、镜像或重标成其他方向；旧非0°布局须重新生成。`rejected` 不参与选择，`candidate` 可预览，发布要求 approved。

道路边与河岸可用 `masks: {数字mask: {...}}`，或在 `variants` 记录 `mask`。位序 N=1、NE=2、E=4、SE=8、S=16、SW=32、W=64、NW=128；道路归一后47种。当前60张贴片按 `tile.kind/variant/autotile_mask` 读取，优先精确边型，其余用八向边件组合。岸线采用水陆两侧原始8邻mask，零位表示异类邻格；画幅外不冒充陆地。陆侧先混入0.16格窄水带，两侧再叠真实岸件，均裁至本格菱形；仅对角接触用4×2或4×4像素顶点帽，不能贴完整V形成短叉。水面、岸水混合均为视觉层，不改 `water_cells` 或通行。缺构件仍报错。`alias` 可引用同清单已有素材，循环别名会警告。

城门还须匹配 `width_cells` / `rotation_deg` 并登记孔洞、底面、锚点。墙段扣门楼底面，门孔保持通透；桥面覆盖水面语义。植物按独立 `prp_*` 读取，保留 `placement_domain: land`、1×1 占地、`visual_bounds_m`、`collision: none` 和两变体；详见 `design/22` §4.4。

缺文件、mask、视图、锚点或底面尺度均进入渲染 JSON 的 `missing_assets`；清单不存在或元数据读取失败另进 `warnings`。SVG `desc` 保存完整缺失清单，画面只展示前 12 项。

### 4.1 当前真素材的候选适配

`AssetLibrary` 自动读取建筑目录的 `props/manifest.yaml`，保留14张植物的逐图ID、原生尺寸和两变体；支持元数据 `views` 列表及 `building.footprint/anchor`。顶层 `file` 优先相对 manifest，元数据里的相对文件也可从元数据目录寻找。若 sparse-checkout 仅跳过了 Git 索引中仍受跟踪的元数据、子清单或 PNG，则读取同一索引 blob；真正未登记或未跟踪的缺件仍照常报错。透明画布宽不参与占地缩放。

有限共享表允许大理土草与南宋石砖水在两城复用。旧 `tang` 以及 11 个年代套件缺少某一素材种类时，按语义后缀显式回退到 `song_dali` / `song_southern` 基线；每次都写入 `asset_substitutions`，严格素材模式允许并警告，`--release` 仍报错。水门没有专用贴片时同样以该年代回退后的城门贴片叠在连续水面上，不伪造新基线图。门宽缺图时选同方向最近宽度；已解决柱脚配准：`gate_assembly.py` 以六张原图各五个实测脚点对齐完整占地与通行孔，分段仿射保持柱线垂直，门墩对应3m墙高。校准绑定源SHA，换图须重测，不改源PNG。桥按0°木桥、90°石桥复用；年代套件桥仅在源 SHA 已校准时直用，否则整座回退到对应方向的基线桥面 / 栏杆并留痕。`bridge_assembly.py` 对同河、同向且交叠并集恰为矩形的桥共享桥面，只放两侧外栏，分别按双轴纹理与栏杆足点配准，不补均色底。`roads.planning_bridge_groups` 在生成阶段合并并拒绝剩余重叠；临安12条源桥记录对应11个独立桥面。桥像素校准绑定当前四张素材的登记SHA，换图须重新校准。

`seam_assembly.py` 从原墙图内侧提取面材质，按墙格并集重组同高顶面和外露侧面，不再逐格叠墙角或重复内部端面。建筑缺视图直接报缺失；不旋转、镜像或借0°图冒充其他朝向。匹配视图的 `footprint_cells` 也必须与对应实例 `size` 一致；元数据一致不能替代门向目检。

这些适配写入 `asset_substitutions`；`used_asset_ids` 是实际参与合成的逐图ID（含边件和植物变体）。`--strict-assets` 拒绝缺失的0°建筑、错误底面及缺失边件，不能以 `native-view` 借用放行；`--release` 还将其余适配及未approved素材视为error。已解决：第3–4轮缺14/22种朝向视图的阻断由第5轮单视图裁定取代；`required_building_views.json` 保留历史审计及解决说明，不再要求补交四向素材。

缩小地表前绘制该贴片的alpha加权平均RGB不透明菱形底，避免逐片LANCZOS透明边暴露背景形成白网格；不改源图。大理寺域包络高于北门的边段不画实墙或规划短线；规划信息只在SVG查看。其碰撞数据未修改，运行时仍须拆分城垣与合图边界。

## 5. 调试层与 Python API

SVG 组为 `preview`、`grid`、`zones`、`roads-water`、`buildings`、`walk`、`validation`。网格每 8 格细线、每 32 格粗线；分区显示 ID / 优先级，建筑显示占地 / 实例 ID / 类型 / 入口；`roads-water` 另画湖多边形及局部ID。`walk` 默认隐藏，可单独查看规划与六角阻挡。

把 `tools/town` 加入 Python 模块搜索路径后可调用：

```python
from gen_layout import generate_layout
from render_town import render_layout, building_sort_key, autotile_mask

layout, stats = generate_layout(spec, source_path=spec_path, source_bytes=raw_bytes)
report = render_layout(layout, output_png, spec=spec, scale=0.25,
                       overlay=output_svg, placeholders_only=True)
```

`render_layout` 另接受 `tile_manifest`、`building_manifest`，返回尺寸、耗时、缺失键、警告、`building_draw_order` 等。读取带 `validation.errors` 的旧布局时仍标记 `diagnostic` 并绘错误水印；这类输入不算有效预览。`building_sort_key(building,H)` 按旋转后占地的 `(最远角世界x+z, 锚点世界z, 锚点世界x, 实例ID)` 升序合成。`autotile_mask(x,z,cells)` 接受坐标集合；`normalize_mask(mask)` 可独立检查 47-mask 归一。

## 6. 常见错误与实现边界

| 现象 / 错误 | 处理 |
|---|---|
| `TOWN_REQUIRED_NO_SPACE` | 功能建筑放不下；检查分区、每区上限、入口预留、塔净空和建筑间距，再调整源规格空间 |
| `TOWN_QUOTA_MIN` | 通用建筑未达规格下限；按稳定贪心结果留余量后回写规格，不删除几何校验 |
| `TOWN_DENSITY_TARGET_EXCEEDED` | 实际占地超出分区软密度目标；保留布局并警告，结合预览审阅疏密 |
| `TOWN_HEX_DISCONNECTED` | 方格可走不保证六角七点采样可走；检查入口净空、窄巷和阻挡，不要只改道路标签 |
| `TOWN_ROAD_COMPONENT_DISCONNECTED` | 全宽补路仍无法连接；检查固定道路、墙、河桥和建筑，不能用空地 BFS 豁免孤路 |
| `TOWN_ROAD_WATER_UNBRIDGED` | 道路压无桥水格；回源规格修桥位，不能把水改陆地 |
| `TOWN_BUILDING_ON_BRIDGE` | 建筑压整桥矩形（包括陆侧桥头）；重生布局，不能只检查水上桥格 |
| `TOWN_BRIDGE_OVERLAP` | 相交桥不能组成同河同向矩形；保留源坐标，拒绝重叠布局 |
| `TOWN_ASSET_MISSING` | 核对清单、完整资产 ID、视图 / mask / 门宽和文件名；占位模式仍保留记录 |
| `TOWN_SCENE_REF_MISSING` | 发布所需 `sc_*` 尚待 design/11 登记，几何预览保持 null |
| `TOWN_RENDER_ERROR` 提示 source 路径 | 传 `--spec` 或从仓库根运行，确认布局与源规格一致 |
| 缩放过大 / 太小 | 输出至少 1 像素高、至多 200 MP；这是离线内存保护限额 |

入口补路写入 `generated_connectors`，按完整 2 m 宽度检验碰撞；只可进入源建筑自己的宫区，其他宫禁仅可复用既有道路。固定塔群接驳可穿自身净空，随后再验最终入口 6 步接路。新增建筑不能压已保留的道路和入口净空。固定几何无法合法连接时仍明确失败。

当前是无角色静态预览。真实 3D 遮挡、桥栏排序、屋顶淡出、X 光、昼夜和天气留运行时实现；合成 PNG 不能替代布局中的独立地表、建筑与碰撞数据。

## 参考资料

- `docs/design/22-town-layout-and-generation.md` §1、§3–§7、§9：坐标、素材、生成、合成与校验。
- `docs/design/town/schema.yaml`：字段、RLE 和错误结构。
- `docs/tech/02-rendering.md` §1.1–§1.6：相机、世界轴与六角坐标。
- `assets/README.md`、`assets/default/STYLE.md`：逐图来源、审批和风格。
- [Pillow ImageDraw](https://pillow.readthedocs.io/en/stable/reference/ImageDraw.html)：二维线、矩形与中文文本绘制 API；访问 2026-09-30。
- [Pillow ImageFont](https://pillow.readthedocs.io/en/stable/reference/ImageFont.html)：`truetype()` 本地字体加载与字体集合；访问 2026-09-30。

## 本文新增术语/约定

没有新增玩法或资产 ID。`--stats` / `--report` JSON 为工具统计，不回写 TownLayout schema；200 MP 是 45° 预览的离线内存保护限额，平面图另限 20 MP。PNG 实例 ID 只存在于 45° 占位建筑；平面图 G / R / W / B / Z / L 编号仅为图例序号，不是内容 ID。`图名：…；` 是 `basis` 说明文字的可选呈现约定，不改变 schema 字段。

## 待决事项 / 依赖

- 已解决：前八轮两城完整生成阻断，2026-09-30 第九次裁定允许调整两城通用配额并改为构造式生成；不再使用容量证书、DFS 或节点预算，见 `design/22` §6、§8 与 `tools/agents/reports/TOWN-render.md`。旧失败结论仅保留为追溯。
- 已解决：60张贴片、38种建筑与14张植物两变体已用于真素材候选总装；第5轮裁定只需建筑0°视图，不再要求补四向。逐图批准仍待作者；严格检查允许显式候选适配，发布检查拒绝未批准及适配。
- 正式街区 `sc_*` 及跨区接缝由 design/11 登记；默认保持 null，不在工具中造内容 ID。
- 已解决：固定塔群初始化步道及普通入口自动接驳时序已同步 `design/22` §6.6，保留显式全宽连接与最终校验。
- 单城几秒内完成是桌面目标；超过 10 秒须在任务报告说明原因。真机纹理预算仍 **（待实测）**，离线耗时以任务报告与统计 JSON 为准。
- 已解决：TOWN-assemble完成真素材候选总装与目视检查；逐图批准仍待作者，分层/分片和运行时装配交后续任务；单45°PNG预览默认锁相机。
- 已解决：第11次运行按协调者更正恢复湖体契约与工具，回滚第8–10轮撤销；湖的精确古岸坐标仍标推定（待考），不把本轮能力恢复当成历史测绘验证。
