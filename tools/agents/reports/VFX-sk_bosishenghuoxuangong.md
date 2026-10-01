# VFX-sk_bosishenghuoxuangong 报告 · 招式特效 · 天级 波斯圣火玄功（sk_bosishenghuoxuangong，5 招）

## 1. 摘要（3–6 行）

- 完成图鉴五招的 Composition YAML/JSON、1536×1024 峰值帧与单文件 Three.js 演示。
- 完成家族及两记绝招共 3 套白底四帧原料，切出 12 张 straight RGBA；全部为 candidate。
- 五招均按正式图鉴保持自身范围与 `projection:false`，仅用局部气场长度表现，不虚构离体伤害。
- 发出方只引用共享 palm EmitterPlate，未复制、未改共用池；未修改工具、设计文档或任务清单。
- 当前会话无 `image_gen` 能力，原料改用可复现 Pillow 配方并如实登记；其余生产与门禁完成。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `effect/` | 3 套 / 30 文件 | 3 张 1536×1024 源图、12 RGBA、EffectSet、三底预览与质量数据 |
| `moves/` | 5 目录 / 20 文件 | 每招 composition.yaml/json、peak.png、demo.html |
| README / 请求 / 构建脚本 | 43 / 26 / 133 / 102 行 | 边界与复现、原料意图、确定性源图与 manifest 构建 |
| `manifest.yaml` | 9 行 / 8 条 | 3 条原料 + 5 条招式；主文件与派生文件均登记哈希 |
| 本报告 | ≤100 行 | 结论、开放项、同步项与逐项自检 |

## 3. 关键结论与数值

- 三套均为 2×2 四帧白底源图，单格 768×512，phase=`[0,.25,.5,1]`；候选均 1 选 1。
- 性质 `yang` 取赤朱主色、暗金辅色；原著未确认可见颜色与能量轮廓，均标（原创扩展）。
- `range_hex=0`；标尺【建议值】180 px/hex，局部长度 `270=1.5×180`、`360=2×180`、`450=2.5×180` px。
- 普通 pulse：`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave：`0.15+0.20+0.40+0.15=0.90 s`。
- 12/12 帧边框 alpha 比与残余白边比均为 0；白底重建最大误差 ≤0.638/255。
- 五份 HTML 为 671,039–825,483 bytes，均 <3,000,000；唯一外链为指定 Three.js r186 importmap。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 作者审美审批 | 赤金回环、令纹与焰带维持 `candidate`，技术自检不视为 `approved` |
| `image_gen` 未提供 | 暂沿用本地 Pillow 原料；若后续强制模型生成，只替换源图并重新量锚点、参考长与根宽 |
| 自身气场的局部长度 | 沿用 270 / 360 / 450 px；只控制版面，不写回玩法射程 |
| 浏览器 / 真机 | 静态门禁通过；CDN、连续帧、移动端混合及人物挂点仍（待实测） |
| 波斯总教教主心法前提 | 不扩写；按三联 / 广州修订版《倚天屠龙记》核对（待考） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本套遵循图鉴既有 `projection:false` 与自身范围，不提出玩法或 Canon 变更。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `assets/default/vfx/bindings.yaml` | 本功五招 | 当前自动绑定为 `emitter:null`；协调者应明确 bespoke 内功演示是否登记任务强制使用的共享 `palm`，本套按任务引用 palm |
| VFX 任务执行环境 | `image_gen` 能力暴露 | 后续同类任务若强制模型原料，应确保会话提供该工具，避免再次启用确定性绘制降级 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_bosishenghuoxuangong_huanming` | 是 | 否 | huanming | `2.5×180=450 px` | wave 0.90 s |
| `mv_bosishenghuoxuangong_huti` | 否 | 否 | family | `2×180=360 px` | pulse 0.60 s |
| `mv_bosishenghuoxuangong_shouling` | 是 | 否 | shouling | `2.5×180=450 px` | wave 0.90 s |
| `mv_bosishenghuoxuangong_tuna` | 否 | 否 | family | `1.5×180=270 px` | pulse 0.60 s |
| `mv_bosishenghuoxuangong_zhuanhuan` | 否 | 否 | family | `2×180=360 px` | pulse 0.60 s |

| 原料 | 候选 | 选择 | 造型边界 |
|---|---:|---:|---|
| family | 1 | 1 | 赤金回环气带与呼吸弧环（原创扩展） |
| huanming | 1 | 1 | 交错双环与回卷焰带（原创扩展） |
| shouling | 1 | 1 | 闭合断续令纹与归心气息（原创扩展） |

- 需作者确认（默认沿用）：① 三套美术均保留 `candidate`；② 自身气场继续用 270 / 360 / 450 px 局部长度；③ 若后续开放 `image_gen`，默认只换原料、不改变五招 `projection:false` 与 Composition 语义。
- ✅ 原著依据：仅沿用图鉴所据的波斯总教、宝树王、风云月三使与圣火令武功；固定功名、五招、颜色和可见造型均为（原创扩展）；教主心法前提（待考），未编引文或回目。
- ✅ 原料与视觉：三张白底源图均经 `view_image`；`cut_frames.py` 切出 12 帧；抽检四张峰值均从掌面向右、根部衔接且无白边。
- ✅ 合成与登记：五招各有 YAML/JSON/peak/demo；普通招只复用 family；绝招各用独有套；共享 palm 仅相对引用；8 条 manifest 均为 `candidate`、`pipeline: two-part`。
- ✅ 强制门禁：`check_skill_suite` 0 问题；`check_assets` 8 图 / 8 条 / 0 问题；`check_ids --strict` exit 0（仅报告既有基线未定义项 1，新问题 0）。
- ✅ 增量检查：五招 `check_vfx` 均通过 schema、去白质量、几何与 HTML 检查；画幅安全边距最小 171.12 px；VFX 相关 31 项单测通过。
- ✅ 写入范围：仅新增授权套件与本报告，共 55 个套件文件；未执行改变仓库状态的 git 命令。
- ⚠️ `image_gen` 不可用与浏览器 / 真机未实测见 §4；未把降级或静态检查冒充完整美术审批。
