# 本任务：外放招式 · {{tier}}级武学「{{skill_name}}」（`{{skill_id}}`）全部招式特效

本任务生成原料图、写 Composition、出静态峰值帧与 Three.js 演示；不改工具逻辑（发现 bug 写报告）、不改设计文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求（原话）

> 招式也是拆成几个图和合成的代码（用threejs或者类似的web 库做）

> 明确其实就是几个图，然后用代码合成。

> 降龙十八掌里龙放大2倍，素材不变，但是特效可以放大素材

> 验收gpt做，但是不要太复杂，按照现在的基线设计出口验收即可。

## 这门武学

- 图鉴：`{{catalog}}`，武学卡 `{{skill_id}}`（品阶 {{grade}} {{tier}}；性质 {{nature}}；发出方式 {{delivery}}）。
- 招式：{{moves}}
  （`*` 为绝招；`P` 为外放 `projection:true`；其余为普通招 / 无外放。）
- 参考样例：`assets/default/baseline/vfx/mv_xianglong18_kanglong/`、`sk_liumai/`（目录结构、YAML 写法、Composition 参数），工具用法 `tools/vfx/README.md`，设计 `docs/design/23-projection-vfx-pipeline.md` §2–§6，风格 `assets/default/STYLE.md` 招式行（水墨意境、虚实透明；气剑类例外；金色 / 阴青阳赤按性质）。
- 发出方图从共用池取：`assets/default/vfx/emitters/{{emitter}}/`（逐字节引用，不复制、不改）。

## 要做的事

输出目录 `assets/default/vfx/{{skill_id}}/`：

1. **效果原料**（白底、4–8 帧一张图，`image_gen` 出、`view_image` 自查、`cut_frames.py` 切成 RGBA 帧）：
   - `effect/family/`：这门武学的**招式家族图**一套——同门招式共用的造型语汇（例如掌法的气劲形、剑法的剑气形、内功的护体气场），按武学名与原著描写定造型与主色（性质 yin 青 / yang 赤 / harmony 金 / neutral 素白为底色倾向，武学有原著颜色描写的以原著为准，写明）。
   - 每个**绝招**各一套 `effect/<mv_id>/`：绝招的独有造型（原著有描写的按描写，没有的按招名意象原创扩展，标注）。
   - 普通招不单独出图，复用家族图。
   每张原料只做一次，最多 2 候选选 1。
2. **每个招式一个 Composition**：`moves/<mv_id>/composition.yaml`（+ 由脚本导出的 `composition.json`）：`effect_set` 指向家族或绝招套，`emitter_plate` 指向共用池，发出点 / 方向 / 长度按 design/23 §4 与招式的 `range`（外放招按 `range.max` 与 `projectionSpreadSteps` 取长度与展幅；近身招短促、贴近发出方）；节奏按 §5.2 模板（绝招长、普通招短）；缩放允许（作者：特效可以放大素材）。
3. **出图与演示**：每招 `compose.py` 出 `moves/<mv_id>/peak.png`，`build_demo.py` 出 `moves/<mv_id>/demo.html`（≤ 3 MB，唯一外链为 three r186 importmap）。抽 2 张峰值帧 `view_image` 看：效果从发出点沿方向发出、根部衔接、无白边。
4. **登记**：`assets/default/vfx/{{skill_id}}/manifest.yaml`：原料图每张一条（`id` 形如 `vfx_{{skill_id}}__family_base01`），招式每招一条（`id` 形如 `vfx_<mv_id>__base01`，`code` 指向 demo，`pipeline: two-part`），字段按 `assets/README.md`，`status: candidate`。

约束：只用共用池的发出方图；不改 `tools/vfx/`；每次写入 ≤ 150 行；报告 ≤ 100 行（招式表 + 原料清单 + 待确认项）。**构建日志与检查产物**（`build-log*.jsonl`、`build-results*.jsonl`、`checks/`、`*.log`、临时校验输出等）写到工作区 `.agents/` 或 `/private/tmp`，用完删掉，不留在 `assets/default/vfx/` 下（协调者 2026-10-03：素材目录只放登记的素材与合成产物）。

检查：以下命令必须全部通过。
- `python3 tools/vfx/check_skill_suite.py assets/default/vfx/{{skill_id}} --catalog {{catalog}}`
- `python3 tools/agents/check_assets.py assets/default/vfx/{{skill_id}} --min 1 --max 60 --min-side 256`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：招式表（mv / 绝招 / 外放 / 用的效果套 / 长度 / 节奏）；原料清单与候选数；原著描写依据（待考标注）；需作者确认的事项（默认沿用）。
