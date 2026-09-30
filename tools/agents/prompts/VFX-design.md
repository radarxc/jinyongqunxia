# 本任务：外放招式特效管线 · 设计文档与数据格式

## 背景

作者定下外放招式（掌劲、剑气、指力等离体效果）的制作方式，原文（2026-09-29，逐字）：

> 外放招式以后也分成两部分来做
>
> 1. 招式外放白底效果图（比如降龙十八掌的龙形），连续多张，然后用python切出多个png图
> 2. 招式发出方图（比如掌 for 掌法，剑+手 for 剑法）
>
> 用程序为外放效果按照发出方向 叠加上去，形成整图。多个效果图 + python程序实现过渡，形成动效图

早先的作者意见仍有效：招式风格为水墨意境（虚实、透明），气剑类（如六脉神剑）例外——是内力凝缩的气剑、线性持续，不用水墨笔触与晕染；降龙十八掌为金色、龙从整个掌面透出、气势磅礴；演示动画不得用代码画造型（`assets/default/STYLE.md` 文首与招式行）。

本任务写设计文档与数据格式；后续任务按它写工具（VFX-tool）和出样例（VFX-plates）。

## 必须沿用的既有资料

- `assets/default/STYLE.md`、`assets/README.md`；`assets/default/prompts/vfx.md`（现行模板）；`assets/default/baseline/vfx/`（两张已有基线图与图层动画演示，及其 manifest）。
- `docs/tech/07-asset-generation.md` §1.4（`vfx_` 前缀）、§2（美术圣经）、§5（特效素材条目）；`docs/tech/02-rendering.md` 中特效层与精灵规格（§0.3、§2.5–2.6）。
- `docs/design/21-meridian-flow-and-moves.md` §12（外放：射程、范围、端点）与 `docs/design/05-martial-arts-system.md` 里招式的 `anim: {clip, vfx, sfx, cutin}` 字段；`tools/balance/projection_sim.py`。
- 招式清单：各 `docs/design/catalog/skills-*.md` 中标 `projection` 的招式；`check_skill_catalogs.py --delivery --details` 可列出外放路线。

## 要做的事

1. **写 `docs/design/23-projection-vfx-pipeline.md`**，至少包括：
   1. 结论先行：两段式管线（效果帧序列 + 发出方图 → 程序合成 → 动效），输入输出文件与命名，和 tech/07 / tech/02 的衔接。
   2. **效果帧序列规格**：白底出图的要求（纯白 `#FFFFFF` 底、效果自身不含白、边缘可抠）；连续多帧的出法（一张长图分格 / 多张单图，帧数与帧间变化幅度，默认 4–8 帧）；Python 抠图切帧的算法（白底转 alpha：亮度→透明度 + 去白边，或色键，写清公式与阈值）；输出 RGBA PNG 的尺寸、锚点（效果的"根部"坐标）与主方向（默认向右，程序再旋转）。
   3. **发出方图规格**：掌法用掌（掌面朝向、劳宫位置为锚点）、剑法用剑加手（剑尖为锚点）、指法用指（指尖为锚点）、兵器类同理；透明底 RGBA；标注发出点坐标与方向向量；与人物立绘 / 精灵的关系（基线阶段只做独立发出方图）。
   4. **合成规则**：按发出方向把效果帧对齐到发出点（平移、旋转、按射程缩放），混合模式（水墨类 normal / multiply，气剑与金光类 lighter / screen），层序，阴影与留白；整图输出规格。
   5. **过渡与动效**：帧间过渡（交叉淡入、沿方向位移、缩放、亮度曲线），节奏模板（凝聚 → 发出 → 持续 → 消散，秒数为建议值），输出格式（帧序列 PNG + 自包含 HTML 演示 + 可选 APNG / WebP 动图），循环与静帧。
   6. **数据格式**（另存 `docs/design/vfx/schema.yaml`）：`EffectSet`（效果帧序列：帧文件、锚点、方向、混合、尺寸）、`EmitterPlate`（发出方图：文件、发出点、方向、类别）、`Composition`（合成参数：射程、角度、缩放、节奏、过渡）；每字段类型、单位、示例。
   7. **按招式类别的默认参数表**：掌 / 指 / 剑 / 刀 / 音功 / 暗器等各一行（发出方图类别、默认混合、默认节奏），与 21 §12 的射程 / 范围字段如何对应。
   8. **提示词模板要点**：效果帧与发出方图各一套的风格关键词、排除项、占位符与质检点（供 VFX-plates 更新 `assets/default/prompts/vfx.md`）。
   9. 需作者确认的事项（默认值列出）、待考项、与其他文档的同步清单（tech/07、tech/02、05 的 anim 字段、STYLE.md）。
2. 通用：每次写入不超过约 150 行；文首引用块、文末待决事项按规则；不新造玩法 ID。

检查：以下命令必须全部通过。
- `python3 -c "import yaml; yaml.safe_load(open('docs/design/vfx/schema.yaml'))"`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：管线各步的输入输出一览；抠图算法与合成规则的关键参数；需作者确认的事项；交 VFX-tool / VFX-plates 的要点。
