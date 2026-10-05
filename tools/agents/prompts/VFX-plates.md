# 本任务：外放招式特效管线 · 降龙十八掌与六脉神剑的效果帧序列与发出方图（默认风格包）

本任务生成图片并运行已合入的工具，不改策划 / 技术文档，不改 `tools/vfx/` 逻辑（发现 bug 只写进报告）。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等规则照常适用。

## 背景

作者定下外放招式的两段式制作方式（原文见 `assets/default/STYLE.md` 文首末段）。设计 `docs/design/23-projection-vfx-pipeline.md`、格式 `docs/design/vfx/schema.yaml`、工具 `tools/vfx/`（用法见 `tools/vfx/README.md`）都已合入。本任务出第一批样例，供作者审批：

- **降龙十八掌·亢龙有悔**（掌法，`mv_xianglong18_kanglong`）：效果 = 金色龙形（作者：金色、龙从整个掌面透出、气势磅礴；风格水墨意境、虚实透明）；发出方 = 掌（掌面朝向发出方向）。
- **六脉神剑**（气剑类，`sk_liumai`）：效果 = 线性、持续的剑气（作者：不是气刃，是内力凝缩的气剑，线性、持续，不用水墨）；发出方 = 指（指尖发出）。

作者 2026-09-30 再次明确范围：「明确其实就是几个图，然后用代码合成。」——每招的原料只有**两张生成图**（一张白底效果帧图、一张透明底发出方图），其余（切帧、抠图、合成、过渡、演示）全部由 `tools/vfx/` 的代码完成。不要为了过程留痕再往素材目录里加诊断文件。

已有的两张整图基线（`assets/default/baseline/vfx/ref_*.png`）和图层动画演示保留作对照，不删；本任务的产物放各自子目录。

## 要做的事

1. **读资料**：design/23、schema.yaml、`tools/vfx/README.md`、STYLE.md、现行 `assets/default/prompts/vfx.md`、两张基线的 manifest 条目（prompt / negative 可复用风格关键词）。
2. **效果帧序列**：每招用 `image_gen` 出白底效果图，按 design/23 §2 的规格（纯白底、帧数默认 4–8、帧间变化连续、主方向向右、根部锚点清楚）。可以一张长图分格，也可以多张单图；每张先 `view_image` 自查。用 `tools/vfx/cut_frames.py` 抠成 RGBA 帧序列，`--preview` 检查白边与残留；不合格重出或调参数（参数写进报告）。
3. **发出方图**：每招一张透明底发出方图（掌 / 指），按 design/23 §3 标注发出点与方向；`view_image` 自查手部结构（五指、朝向）。
4. **合成与动效**：写 `Composition` YAML，用 `compose.py` 合成整图帧序列，用 `animate.py` 输出自包含 HTML 演示与峰值帧；`check_vfx.py` 必须通过。目视核对：效果从发出点沿方向发出、比例合理、混合模式符合类别（降龙 lighter / 金色，六脉近无色刃体加淡青 / 淡赤缘）。
5. **入库**：`assets/default/baseline/vfx/<招式 ID>/` 下放 `effect/`（帧 PNG + EffectSet YAML + 白底原图）、`emitter/`（发出方 PNG + EmitterPlate YAML）、`composition.yaml`、`frames/`（合成帧）、`demo.html`、`peak.png`。manifest 新增两条（ID 形如 `vfx_mv_xianglong18_kanglong__ch02_base01`、`vfx_sk_liumai__ch01_base01`），字段按 `assets/README.md`，`code` 指向 `demo.html`，另加 `pipeline: two-part` 与各文件清单；`status: candidate`。旧的两条 `ref_*` 保持不动。
6. **模板**：更新 `assets/default/prompts/vfx.md` 为两段式（效果帧与发出方各一套提示词、抠图与合成参数、质检要点），保留气剑类例外规则。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/baseline/vfx --min 2 --max 4`
- 两套各跑一次（`check_vfx.py` 只收 YAML，不收目录；`<套件>` 依次为 `assets/default/baseline/vfx/mv_xianglong18_kanglong`、`assets/default/baseline/vfx/sk_liumai`）：
  `python3 tools/vfx/check_vfx.py <套件>/effect/effect-set.yaml <套件>/emitter/emitter-plate.yaml <套件>/composition.yaml --root <套件> --html <套件>/demo.html`

## 报告

第 7 节写：每招的帧数、抠图参数与质量指标、发出方图说明、合成参数、演示大小；候选数与淘汰原因；风格自评；工具问题清单；需作者审批的事项。
