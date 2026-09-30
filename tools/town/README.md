# 城镇布局工具

| 项 | 内容 |
|---|---|
| 归属 | `design/22` 城镇布局契约的离线 Python 实现 |
| 上游 | `docs/design/town/schema.yaml`、两城 `CitySpec`、`docs/design/22-town-layout-and-generation.md`、`docs/tech/02-rendering.md` |
| 环境 | Python 3.11；标准库、Pillow、NumPy、PyYAML |
| 输出 | `TownLayout` YAML、统计 JSON、整城 PNG、可开关调试层 SVG |
| 范围 | 默认 45° 静态预览；运行时 GLB、分片、压缩与正式素材总装交 TOWN-assemble |

## 结论先行（TL;DR）

生成器采用构造式放置：先固定地标与功能建筑，再沿街贪心填充通用建筑，并自动补入口步道。相同规格字节、种子与生成器版本产生相同布局；不做回溯、容量证明或节点预算。规格中的通用建筑下限按稳定可放结果登记，生成器不会暗改输入配额；功能建筑和几何、道路、行走层约束仍须通过校验。

先生成并校验，再渲染。缺素材时用带实例 ID 的占位建筑与纯色贴片，并在渲染报告中列出替代键。占位预览用于检查分区、坐标与通行，正式贴图总装由 TOWN-assemble 完成。本仓库现行 `design/22` 的数据、生成、渲染章节分别为 §5、§6、§7。

## 1. 快速运行

从仓库根目录运行：

```bash
python3 tools/town/gen_layout.py docs/design/town/city_dali__ch01.yaml -o /tmp/tianshu_town_dali.yaml --stats /tmp/tianshu_town_dali.stats.json
python3 tools/town/check_town.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml
python3 tools/town/render_town.py /tmp/tianshu_town_dali.yaml -o /tmp/tianshu_town_dali.png --scale 0.25 --overlay /tmp/tianshu_town_dali.overlay.svg --placeholders-only --report /tmp/tianshu_town_dali.render.json
python3 -m unittest discover -s tools/town -p "test_*.py"
python3 tools/lint/check_ids.py --strict
```

临安改用 `docs/design/town/city_hangzhou__ch02.yaml`。渲染器通过 `layout.source_spec.path` 读取墙、城门、桥和调试分区；搬移文件后可加 `--spec <CitySpec路径>`。布局来源使用仓库相对路径，外部输入只记文件名；不会写入绝对路径或时间戳。

三个主脚本操作成功返回 0，输入错误、生成失败或校验 error 返回 1；校验 warning 不改变退出码。功能建筑或几何失败不写目标文件；通用欠配额仍导出含 `validation.errors` 的布局并返回 1，供调整源规格。调用方必须检查退出码与校验结果，不能将欠配额布局交总装。

## 2. 命令行选项

| 脚本 | 参数 | 含义 |
|---|---|---|
| `gen_layout.py` | `<spec> -o <layout>` | 读取城市规格，原子替换布局文件 |
| 同上 | `--stats <json>` | 保存格数、配额、连通性、耗时及布局 SHA-256；统计不参与布局字节 |
| `check_town.py` | `<spec> [layout]` | 只给规格检查输入；同时给布局检查空间、道路、两种行走层和素材 |
| 同上 | `--strict-assets` | 缺素材从 warning 提升为 error |
| 同上 | `--release` | 发布前额外检查正式场景引用、素材 approved 等；包含严格素材检查 |
| 同上 | `--json` | 输出机器可读问题数组 |
| `render_town.py` | `<layout> -o <png>` | 合成完整城镇预览 |
| 同上 | `--scale <n>` | 相对 64×32 母版缩放，直接按目标比例绘制 |
| 同上 | `--overlay <svg>` | 输出调试图层；与 PNG 同目录时自动引用该 PNG |
| 同上 | `--report <json>` | 保存尺寸、耗时、缺失素材、警告与建筑绘制次序；stdout 同步输出 |
| 同上 | `--placeholders-only` | 强制占位，报告仍列明替代键 |
| 校验 / 渲染 | `--tile-manifest`、`--building-manifest` | 覆盖默认两份素材清单路径 |

默认清单为 `assets/default/baseline/tile/manifest.yaml` 与 `assets/default/baseline/building-map/manifest.yaml`。校验器另支持 `--assets <风格包根目录>`。`--release` 是静态门禁；斜率、光向、接缝、四视图外观与真机表现仍交 TOWN-assemble 验收。

## 3. 数据流与确定性

1. `schema_check.py` 与 `check_town.py` 校验输入字段和静态几何。
2. `common.py` 建立城墙、门孔、河桥、规划格与六角采样；`roads.py` 建立主路和有真实宽度的接驳。
3. `placement.py` 按固定次序放地标与功能建筑，再按分区沿街轮流为每种通用建筑放一栋，直到各自max或无候选；入口接不上路网时补显式步道，始终检查规划与六角通行。
4. `gen_layout.py` 生成地表、植被和最终两个行走层，写 canonical YAML 与独立统计。
5. `render_town.py` 按地面、道路边、水、岸、桥、地面叠加、高度对象合成；墙、门、树和建筑共用远角深度键。

PCG32 按 `design/22` §6.1 分子流，候选抖动在建表时固定；地面 / 植物贴图变体用 FNV1a64 标签选择。通用min只作验收下限，不参与放置停止条件；density是软视觉目标，超出只警告。耗时只进入统计。编辑 YAML 注释或空白会改变 `source_spec.sha256`，因此也会改变完整布局字节。

大理母版为 `(96+96)×32=6144` 宽、`(96+96)×16=3072` 高；临安为 10240×5120。`--scale 0.25` 输出 1536×768、2560×1280。SVG `viewBox` 保留母版坐标，显示宽高随缩放改变。

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
  - {key: north, rotation_deg: 180, file: north.png, anchor_px: [260, 320]}
```

建筑须为 RGBA，登记底面中心 `anchor_px: [x,y]`（也接受 `{x,y}`）及底面尺度。优先用 `footprint_width_px` 表示底面投影水平跨度；也接受 `footprint_cells` / `footprint_m`，按 `32×(w+h)` 换算。实例按底面跨度等比缩放，不能用透明画布宽或屋檐宽代替。非零旋转须有对应视图，不能旋转二维图片冒充另一个三维朝向；也支持 `views: {0: {...}, 180: {...}}`。`rejected` 不参与选择，`candidate` 可预览，发布要求 approved。

道路边与河岸用 `masks: {数字mask: {...}}`，或在 `variants` 记录 `mask`。位序 N=1、NE=2、E=4、SE=8、S=16、SW=32、W=64、NW=128；对角仅在相邻正交边都存在时生效，归一后 47 种。精确匹配 mask，不借用其他边型；`alias` 可引用同清单已有素材，循环别名会警告。

城门还须匹配 `width_cells` / `rotation_deg` 并登记孔洞、底面、锚点。墙段扣门楼底面，门孔保持通透；桥面覆盖水面语义。植物按独立 `prp_*` 读取，保留 `placement_domain: land`、1×1 占地、`visual_bounds_m`、`collision: none` 和两变体；详见 `design/22` §4.4。

缺文件、mask、视图、锚点或底面尺度均进入渲染 JSON 的 `missing_assets`；清单不存在或元数据读取失败另进 `warnings`。SVG `desc` 保存完整缺失清单，画面只展示前 12 项。

## 5. 调试层与 Python API

SVG 组为 `preview`、`grid`、`zones`、`roads-water`、`buildings`、`walk`、`validation`。网格每 8 格细线、每 32 格粗线；分区显示 ID / 优先级，建筑显示占地 / 实例 ID / 类型 / 入口。`walk` 默认隐藏，可单独查看规划与六角阻挡。

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

## 本文新增术语/约定

没有新增玩法或资产 ID。`--stats` / `--report` JSON 为工具统计，不回写 TownLayout schema；200 MP 是离线内存保护限额。PNG 实例 ID 只存在于占位建筑。

## 待决事项 / 依赖

- 已解决：前八轮两城完整生成阻断，2026-09-30 第九次裁定允许调整两城通用配额并改为构造式生成；不再使用容量证书、DFS 或节点预算，见 `design/22` §6、§8 与 `tools/agents/reports/TOWN-render.md`。旧失败结论仅保留为追溯。
- 正式贴片、建筑四向视图、植物两变体及逐图批准仍由素材任务交付；默认缺失可预览，严格素材 / 发布检查失败。
- 正式街区 `sc_*` 及跨区接缝由 design/11 登记；默认保持 null，不在工具中造内容 ID。
- 已解决：固定塔群初始化步道及普通入口自动接驳时序已同步 `design/22` §6.6，保留显式全宽连接与最终校验。
- 单城几秒内完成是桌面目标；超过 10 秒须在任务报告说明原因。真机纹理预算仍 **（待实测）**，离线耗时以任务报告与统计 JSON 为准。
- TOWN-assemble 负责替换批准素材、目视检查、分层 / 分片和运行时装配；单 45° PNG 预览默认锁相机。
