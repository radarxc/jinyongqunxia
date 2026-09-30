# 本任务：外放招式 · 玄级 / 黄级统一特效模板与全库招式绑定表

本任务写 Three.js 播放器的模板模式、少量原料图、绑定表生成脚本；改 design/23 的对应小节。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求（原话，2026-09-30）

> 然后调用gpt分别做所有城市（城市X年代）和所有天/地级武功招式，再做普通招式，玄级武功如果有外放则统一外放气效果（颜色取决于内力阴阳），没有外放则以残影。黄级武功就是普通招式。验收gpt做，但是不要太复杂，按照现在的基线设计出口验收即可。

品阶：`grade` 10–12 天、7–9 地、4–6 玄、1–3 黄（`docs/design/05` §2）。内力阴阳：`nature` yin / yang / harmony / neutral（design/05、21；项目设定"阴青阳赤"）。外放：`MoveDef.projection`。这些都在 `docs/design/catalog/skills-*.md` 的机器行里，`python3 tools/lint/check_skill_catalogs.py --json --delivery --details` 能导出绝招路线（含 skill_id / move_id / delivery / projection / nature / action_context）；普通招在各武学卡的招式表里。

## 要做的事

### 1. 播放器模板模式（`tools/vfx/web/`）

在 `vfx_player.js` 上加"模板模式"（不影响两段式原料模式）：

- `qi_projection`（玄级有外放）：统一的外放真气束 / 气浪，形态由 `delivery` 决定（掌 → 扇形气浪；指 / 剑 → 细直束；拳 / 兵器 → 短粗冲击；音功 → 同心波纹），**颜色由内力阴阳决定**：`yin` 青（#5FB5B0 一档）、`yang` 赤（#D9483B 一档）、`harmony` 淡金、`neutral` 素白——具体色值写进 `docs/design/vfx/palette.yaml`，作者可改。原料：每种形态 1 张白底效果图（4 帧一张），共 4 张，用 `image_gen` 出、`cut_frames.py` 切；颜色在着色器里按 palette 调（原料画成中性亮色）。
- `afterimage`（玄级无外放）：残影——沿出招方向复制发出方图 3–5 次，逐级偏移、淡出、轻微拉伸，无原料图；参数：份数、间距、总时长。
- `plain_strike`（黄级 / 普通招）：拳脚冲击闪、兵器挥砍弧、掌风推波各 1 张白底效果图（2–3 帧），normal 混合、短促（≤ 0.4 s）、不发光。

每种模式给 `build_demo.py` 一个 `--template <mode> --emitter <type> --nature <n> --delivery <d>` 入口，能不写 Composition 直接出 demo；输出 `assets/default/vfx/templates/<mode>/demo_<变体>.html` 各 1–2 份作为样例。`timeline.js` 单测覆盖新增包络。

### 2. 绑定表生成脚本 `tools/vfx/bind_moves.py`

读全部图鉴（绝招用 `check_skill_catalogs.py --json` 的路线；普通招解析各武学卡的招式表，武学品阶取武学卡标题"（N 天/地/玄/黄"），生成 `assets/default/vfx/bindings.yaml`：每个 `mv_*` 一条：`{move, skill, tier, grade, ultimate, projection, delivery, nature, mode, suite|template, emitter, params}`——
- 天 / 地：`mode: bespoke`，`suite: assets/default/vfx/<skill_id>/moves/<mv>/`（后续每门武学一个任务产出，此处只登记路径）；
- 玄：`projection` 为真 → `template: qi_projection`，否则 `template: afterimage`；
- 黄及未定级：`template: plain_strike`；
- `emitter` 由 `delivery` 映射（palm/finger/fist-grapple→fist/weapon→按武学名或卡内兵器判断 sword|sabre|staff|spear|whip|fan/inner→无发出方/movement→afterimage/leg→leg/throw→throw/音功→instrument），判断不了的写 `sword` 并在报告列出。
脚本要幂等、确定性；`--check` 只核对不写。统计各 tier / mode 数量打印。

### 3. 单门武学套件检查脚本 `tools/vfx/check_skill_suite.py`

后续每门天 / 地级武学一个任务产出 `assets/default/vfx/<skill_id>/`（`effect/family/`、`effect/<mv>/`、`moves/<mv>/{composition.yaml,composition.json,peak.png,demo.html}`、`manifest.yaml`）。写检查脚本：`check_skill_suite.py <skill_dir> --catalog <图鉴文件>`——从图鉴取该武学全部 `mv_*`（绝招 + 普通招），核对每招目录四个文件齐全、`composition.yaml` 引用的 effect / emitter 路径存在（emitter 必须在 `assets/default/vfx/emitters/` 下）、每份 `demo.html` ≤ 3 MB 且唯一外链为 three r186、manifest 每条 `size` / `sha256` 与磁盘一致；退出码 0 / 1，问题逐条打印。给它写 2 个单测（通过 / 缺招式）。

### 3b. 文档

design/23 加一节"统一模板（玄 / 黄级）与绑定表"（模式、颜色规则、绑定字段），schema 加模板字段；`assets/default/prompts/vfx.md` 加模板原料出图模板。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/vfx -p "test_*.py"`
- `node --test tools/vfx/web/`
- `node --check tools/vfx/web/vfx_player.js`
- `python3 tools/vfx/bind_moves.py --check`
- `python3 tools/agents/check_assets.py assets/default/vfx/templates --min 6 --max 12 --min-side 256`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：模板模式与参数；palette；绑定表统计（各 tier / mode / emitter 数量、判断不了的清单）；样例 demo 清单（待协调者浏览器验收）；需作者确认：调和 / 中性两色的取值。报告 ≤ 120 行。
