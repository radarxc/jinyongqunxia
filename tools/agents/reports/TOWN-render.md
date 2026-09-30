# TOWN-render 报告 · 城镇程序化生成 · 布局生成器、渲染器与校验脚本

## 1. 摘要（3–6 行）

第九次续作已完成构造式生成、完整校验与两城占位预览；全部规定验收命令退出0，31项单元测试通过。
固定地标与必需功能全部保留，通用建筑按沿街候选轮流填充；大理47栋、临安92栋，两个行走层与道路均满足入口连通要求。
按本轮授权调整4项通用下限、临安2处分区边界，并最小同步design/22；没有修改写集外文件或执行改变git状态的命令。
前八轮受不可满足配额或回溯搜索耗尽阻断；本轮移除4个证明模块及1份容量夹具，替换失败水印图，历史过程仅保留本段追溯。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 规格 | 主要内容 |
|---|---:|---|
| `tools/town/gen_layout.py` | 209行 | 构造流程、确定性输出、统计与CLI |
| `tools/town/placement.py` / `roads.py` | 383 / 196行 | 功能优先、通用轮流填充、全宽步道与连通 |
| `tools/town/common.py` / `schema_check.py` | 547 / 239行 | 几何、PCG32、六角采样、严格YAML与schema |
| `tools/town/render_town.py` / `assets.py` | 581 / 156行 | PNG/SVG、47-mask、远角排序、锚点缩放与缺失回退 |
| `tools/town/check_town.py` / `test_town.py` | 791 / 520行 | 规格/空间/素材校验、31项回归 |
| `tools/town/README.md` | 147行 | 用法、数据流、素材、常见错误及追溯 |
| `docs/design/town/city_dali__ch01.yaml` / `city_hangzhou__ch02.yaml` | 272 / 291行 | 四项下限、两处分区与原因 |
| `docs/design/22-town-layout-and-generation.md` | 1044行 | 仅同步受影响算法、数字、验证口径及待决条目 |
| `assets/default/baseline/town/preview/` | 2 PNG、2 SVG、4 JSON、30行README | 完整占位预览、统计及缺失清单；不进manifest |
| `tools/agents/reports/TOWN-render.md` | 少于150行 | 本报告 |

删除 `feasibility.py`、`packing.py`、`hex_capacity.py`、`diagnose_constraints.py`、`fixtures/hangzhou_house_capacity.json`。Python源由4707行降至3622行（减少1085行）；另移除2601行容量夹具，不保留节点预算或隐藏组合搜索。

## 3. 关键结论与数值

- 生成版本`1.1.0`、算法修订`2`；PCG32向量、同输入重放、不同`PYTHONHASHSEED`及外部来源路径去绝对化均有测试。两城复跑SHA-256均与预览sidecar一致，布局无时间戳。
- 功能required先满足min，可选功能试至max；通用各类型每轮最多一栋，至max或无合法候选。通用min不参与构造，调整下限不会反过来改变布局。
- 密度改软视觉目标并明确warning；否则功能建筑占满旧密度预算时商铺/摊棚会全部被截掉。重叠、压水、压路、墙距、入口和六角检查仍为硬条件。
- 母版按`(W+H)×32`宽、`(W+H)×16`高计算：大理6144×3072、临安10240×5120；0.25缩放为1536×768、2560×1280。

## 4. 开放问题（附默认值）

| 事项 | 状态与默认值 |
|---|---|
| 两城配额与旧搜索阻断 | 已解决：本轮授权修规格并采用构造式，见design/22 §6、§8及本报告§7；不再继续旧容量证明 |
| 固定塔远入口 / 接路时序 | 已解决：固定入口先补2m步道，普通入口也自动接路，最终仍验6步接街与六角通行 |
| 密度与通用数量是否作为后续视觉基线 | 默认采用本次47/92栋及源规格下限；这是当前种子的可用构造结果，不是容量上界，换种子须重验 |
| 旧2秒目标与真机 | 已解决：改桌面几秒目标、超过10秒解释；本机临安CLI一次10.3085秒，原因见§7。真机仍待实测 |
| 真实素材 / 视角成本 | 默认由TOWN-assemble总装；单45°PNG锁相机，缺视图/mask/锚点必须占位并报告，不冒充approved |
| 正式街区引用 / 分片 | 默认保持`formal_scene_refs=null`；design/11登记正式场景，总装负责分片与运行时装配 |
| 历史图面与建筑年代 | 延续design/22既有待考项；本轮未联网复核，不将程序预览称为历史复原 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准提案。保留TOWN-design的TOWN-C01（归属）、TOWN-C02（规划格编译六角）、TOWN-C03（素材子族）待统一处理；本轮不改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/town/schema.yaml` | `geometry_contract.placement_backtrack`、`hex_repair`、`entrance_path` | 字段schema兼容且校验通过；算法说明仍写DFS/100000节点，须改为构造式、自动补全宽步道、最终断言。该文件不在写集，未改 |
| `docs/tech/02-rendering.md` / `design/11` | 坐标、街区与场景引用 | 对接七点采样及跨分带全局六角，补正式sc引用；本次未造新玩法ID |
| TOWN-assemble交接 | 输入门禁 | 当前完整layout可重新生成；缺素材只警告的几何通过不等于正式素材/发布通过 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ `python3 -m unittest discover -s tools/town -p "test_*.py"`：31项，8.491秒，退出0；覆盖确定性、不重叠、连通、排序、autotile、全宽自动补路、宫禁、固定衙门缓冲、分区配额及严格素材模式。
- ✅ 大理、临安分别执行任务规定的`gen_layout.py <spec> -o /tmp/... && check_town.py <spec> /tmp/...`：两条组合命令均退出0，0 errors；81 / 104 warnings为缺素材及密度提示。
- ✅ `python3 tools/lint/check_ids.py --strict`：113文件，strict failure=0；仅既有baseline允许的未定义引用，不新增冲突ID。
- ✅ `git diff --check`通过；只修改授权路径；使用Python 3.11、标准库/PIL/NumPy/PyYAML，没有新增依赖或改变git状态。
- ✅ 两张PNG已用`view_image`检查并经独立代理目视复查：无失败水印、无明显裁边，分区填入建筑、沿街排布；占地不压路/水由checker再次确认。
- ✅ 两份SVG可解析，保留分区、格坐标、建筑ID与可开关行走层；缺素材清单写JSON与SVG，不静默略过。

**规格改动清单**（全部为游戏化布置，功能配额、城墙、道路、河桥及固定地标未改）：

| 文件 | 字段 | 原值 → 新值 | 原因 / 实测余量 |
|---|---|---|---|
| `city_dali__ch01.yaml` | `building_quotas[house].count.min` | 18 → 10 | 当前稳定12栋，留2栋余量 |
| `city_hangzhou__ch02.yaml` | `building_quotas[house].count.min` | 42 → 8 | 功能与院落先保留，稳定10栋，留2栋 |
| 同上 | `building_quotas[shop_1f].count.min` | 18 → 11 | 稳定13栋，留2栋 |
| 同上 | `building_quotas[shop_2f].count.min` | 14 → 6 | 稳定7栋，留1栋 |
| 同上 | `zones[zone_religious_west].geometry.polygon.points[1,2].x` | 50 → 60 | 原构造仅2/3寺殿；扩沿巷地块后3/3 |
| 同上 | `zones[zone_gate_service_north].geometry` | x65..90/z133..148 → x62..94/z130..148 | 原仅1/2守舍；扩界保两守舍、一马厩和入口净空；同步basis |

**完整生成与渲染统计**（预览对应的一次本机离线测量；生成函数含输入校验，CLI另含加载/序列化/进程启动）：

| 指标 | 大理 | 临安 |
|---|---:|---:|
| 建筑数 / 余地块数 | 47 / 13 | 92 / 17 |
| 道路格数 / 道路分量 | 1485 / 1 | 4336 / 1 |
| 必需目标规划 / 六角入口分量 | 1 / 1 | 1 / 1 |
| 规划可走格 / 合法六角 | 3477 / 2303 | 11273 / 8296 |
| 生成函数 / 完整CLI秒 | 1.8581 / 2.2583 | 9.1353 / 10.3085 |
| PNG+SVG渲染秒 | 0.2377 | 0.5548 |
| PNG尺寸 | 1536×768 | 2560×1280 |
| 缺失素材选择键 | 75 | 99 |
| `complete` / 缺必需数量 | true / 0 | true / 0 |

临安CLI略超10秒：25,600格、457次合法性试放需全宽接路与七点六角复验，另含约1.17秒加载/序列化/进程开销。已缓存相同路网的距离场并用PyYAML自带C后端（不可用时回退标准后端），未跳过硬校验；后续优化仍以保持布局SHA为前提，不宣称所有机器或任意规格均达几秒。

**各类型建筑数**：普通类型省略大理`bld_kit_song_dali_` / 临安`bld_kit_song_southern_`前缀；“—”表示该城未配置此type。

| type后缀或完整地标ID | 大理 | 临安 |
|---|---:|---:|
| biaoju / casino | 1 / 1 | 1 / 1 |
| courtyard / house | 5 / 12 | 9 / 10 |
| guardhouse / stable | 1 / 1 | 2 / 1 |
| inn / restaurant | 1 / 1 | 3 / 4 |
| manor | 1 | 1 |
| market_stall | 6 | 20 |
| shop | 7 | — |
| shop_1f / shop_2f | — | 13 / 7 |
| shrine | 3 | — |
| temple_hall | 2 | 3 |
| wangfu / palace_hall | 1 / — | — / 2 |
| yamen | 1 | 3 |
| warehouse / wharf | — | 7 / 3 |
| pagoda | — | 1 |
| `bld_lm_ch01_chongshengsi_pagoda` | 1 | — |
| `bld_lm_ch01_chongshengsi_pagoda_small` | 2 | — |
| `bld_lm_ch02_linan_palace_gate` | — | 1 |

**算法同步与总装交接**：design/22 §6已同步功能优先、通用轮流、软密度、自动全宽步道和最终断言；候选评分在建表时固定，补路不抽随机数。不再撤楼重放、求容量证书或扩大节点预算。§8同步配额和分区；只读schema算法文字遗留见§6。TOWN-assemble从当前规格重建layout，先校验，再换真实manifest并去掉`--placeholders-only`；不得手改成图坐标。发布须补批准素材、锚点/视图/47-mask、接缝光向、正式sc、分层分片和真机验证。

⚠️ 需作者后续确认的是当前通用数量/疏密是否作为美术基线，以及既有历史待考项；默认沿用本次完整布局推进总装，不再等待这些确认出图。未核实真实美术、历史图面或运行时表现，未把占位与几何验收冒称最终发布验收。
