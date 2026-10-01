# VFX-sk_bihai 报告 · 招式特效 · 天级 碧海潮生曲（sk_bihai，8 招）

## 1. 摘要（3–6 行）

- 完成图鉴实际定义的 7 个正式招式：每招 Composition YAML/JSON、1536×1024 峰值帧与单文件 Three.js 演示。
- 完成家族、碧海潮生、定神 3 套白底四帧原料并切出 12 张 straight RGBA；全部为 candidate。
- 发出方仅逐字节引用共享 palm EmitterPlate；未复制、未改共用池，未修改工具或设计文档。
- 任务清单中的 mv_bihai_ 是不完整前缀而非玩法 ID，故标题“8 招”与图鉴 7 招冲突；未伪造第八招。
- 当前会话无 image_gen 能力，原料改由可复现 Pillow 配方绘制并如实登记；这是唯一未按指定生成方式完成之处。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| assets/default/vfx/sk_bihai/effect | 3 套 / 3 张源图 / 12 RGBA | 家族与两记绝招 EffectSet、三底预览、quality.json |
| assets/default/vfx/sk_bihai/moves | 7 目录 / 28 文件 | 每招 composition.yaml/json、peak.png、demo.html |
| README.md / source_requests.json | 46 / 26 行 | 造型依据、复现、提示意图、生成限制 |
| make_sources.py / make_manifest.py | 132 / 103 行 | 可复现原料配方与哈希清单构建；非工具链改动 |
| manifest.yaml | 11 行 / 10 条 | 3 条原料 + 7 条逐招记录，全部完整性哈希 |
| 本报告 | ≤100 行 | 结论、问题、同步项与逐项自检 |

## 3. 关键结论与数值

- 3 套均为 1536×1024 白底 2×2 图，每格 768×512，4 帧 phase=[0,.25,.5,1]；候选均 1→1。
- 质检 12/12 帧：8 px 边框 alpha 比 0、残余白边比 0；白底重建最大误差 0.67/255 以下。
- 演示标尺【建议值】180 px/hex；长度为 540 / 720 / 900 px，均有图鉴范围或最高投影展幅算式，见 §7。
- 普通 pulse：0.10+0.15+0.25+0.10=0.60 s；绝招 wave：0.15+0.20+0.40+0.15=0.90 s。
- 7 份 HTML 为 662,199–850,486 bytes，均 <3,000,000；只含指定 Three.js r186 importmap 外链。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 作者审美审批 | 金主青辅、同心音环与潮纹均维持 candidate；不视自检为 approved |
| image_gen 未提供 | 暂沿用本地 Pillow 原料；后续若必须模型生成，只换原料并重测锚点，不改 Composition 语义 |
| “8 招”计数冲突 | 以正式图鉴与 check_skill_suite 的 7 招为准；mv_bihai_ 只作前缀，不生成目录 |
| 180 px/hex 与展幅表现 | 默认沿用；运行时用实际屏幕投影覆盖，单条图不推导 AoE 命中格 |
| 浏览器/真机 | 静态检查通过，CDN、连续帧、移动端混合与人物挂点仍（待实测） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无基准修改提案。计数问题属于任务元数据错误，不修改玩法基准或正式图鉴。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| tools/agents/tasks.json / VFX-sk_bihai 提示模板 | 标题、moves | “8 招”改为“7 招”，删除不完整占位 mv_bihai_；并把外放标注同步为潮起/潮涌/惊涛/碧海潮生/余音五招 |
| assets/default/vfx/bindings.yaml | sk_bihai 七行 | 当前自动绑定写 emitter=instrument，而本任务强制共用 palm；由协调者决定修绑定规则还是修任务模板，本套按本任务使用 palm |
| VFX 生产环境能力 | image_gen 暴露 | 后续生成任务需确保执行会话真正提供 image_gen，否则应预先允许确定性本地绘制降级 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 效果套 | 长度核算 | 节奏 |
|---|---|---|---|---:|---|
| mv_bihai_chaoqi | 否 | 是 | family | r4×180=720 px | pulse 0.60 s |
| mv_bihai_chaosheng | 是 | 是 | chaosheng | 全场片段 5×180=900 px【建议值】 | wave 0.90 s |
| mv_bihai_chaoyong | 否 | 是 | family | d3×180=540 px | pulse 0.60 s |
| mv_bihai_dingshen | 是 | 否 | dingshen | allies r3×180=540 px | wave 0.90 s |
| mv_bihai_jingtao | 否 | 是 | family | r5×180=900 px | pulse 0.60 s |
| mv_bihai_xinsui | 否 | 否 | family | range.max 5×180=900 px | pulse 0.60 s |
| mv_bihai_yuyin | 否 | 是 | family | 最高内圈 r4×180=720 px | pulse 0.60 s |

- ✅ 原料清单：family、chaosheng、dingshen 各 1 候选选 1；普通招仅复用 family，两绝招各用独有套。
- ✅ 原著边界：仅沿用图鉴中黄药师持玉箫、内力催音、扰人心神；颜色/可见音环/潮纹均标（原创扩展）。神雕对手与场景、射雕斗曲逐字措辞（待考），未编回目或引文。
- ✅ 两张峰值 view_image：均从共用掌面发出点向右，宽根叠掌、无白边；绝招明显区别于家族套。
- ✅ check_skill_suite：7 个图鉴招式齐全，0 问题；check_assets：10 张主图/10 条，0 问题；check_ids --strict：见最终运行结果。
- ✅ 仅写授权套件与本报告；未改共用 emitter、tools/vfx、设计文档或 TODO，未执行改变状态的 git 命令。
- ⚠️ image_gen 与标题 8 招两项限制见 §4；其余生成、合成、登记与静态验收完成。
