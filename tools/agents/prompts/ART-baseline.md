# 本任务：素材基线 · {{cat_name}}（默认风格包 `assets/default`）

本任务生成图片素材，不改策划 / 技术文档。上面"规则"一节中关于文档格式的条目（文首引用块、文末待决事项等）不适用于图片；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等条目照常适用。

## 背景

作者要为游戏素材建立统一风格。目前只有一个默认风格包 `assets/default`，将来可能有多个风格包（mod）。风格要求、作者原文与目录约定见：
- `assets/default/STYLE.md`（先读，作者原文在文首）
- `assets/README.md`

本轮只做**基线参考**：每类先出 1–2 张风格正确的图，交作者审批。审批通过后，后续批量生成时，会把基线图作为参考输入，再加上文字描述。

## 本类别的风格要求

{{style_rule}}

## 要做的事

1. **读资料**：
   - `assets/default/STYLE.md`、`assets/README.md`；
   - `docs/tech/07-asset-generation.md` §1.4（素材 ID 前缀）、§2（美术圣经，与作者新风格冲突时以作者为准）、§2.7（服饰时代感）、§2.9 与 §9（禁止项）；
   - 年代与地理：`docs/design/02-timeline-and-world-tiers.md`（各书界年代）、`docs/design/19-world-map.md`（城市）。

   与本类相关的书界 / 人物 / 武学，查对应的 `docs/design/chapters/NN-*.md`、`docs/design/catalog/*.md`。
2. **生成基线图**：本类的题材为

   {{subjects}}

   - 用你的内置图片生成工具 `image_gen` 出图，每个题材调用一次；可以多出几张候选，从中选 1–2 张最符合风格的留下。不要用代码画图代替位图（下面额外事项另有说明的除外）。
   - 提示词要写足：题材、书界与年代特征、构图与视角、光线与质感、画幅比例，以及排除项。排除项包括：不要文字水印、不要现代元素、不要真人演员脸、不要在世画师的风格名。
   - 图片本身尽量不带文字。地名、穴位名等标注如有需要，另做 SVG 叠加层，见下面的额外事项。
3. **入库**：
   - 工具默认把原图存在 `~/.codex/generated_images/…`。把选中的图复制到 `{{out_dir}}/`，文件名为素材 ID 加 `.png`。
   - ID 用 `ref_` 前缀，按 tech/07 §1.4 的规则写，例如 `ref_town_dali__ch01_base01`。先 `grep -rn` 查重。
   - 落选的候选不要放进仓库，只在报告里列出。
4. **登记**：写 `{{out_dir}}/manifest.yaml`，顶层为列表，每张一条，字段见 `assets/README.md`：
   - `status: candidate`，`references: []`；
   - `tool: "codex exec · image_gen"`，`model: gpt-6-astra`，`effort: ultra`；
   - `source_path` 写原图位置；
   - `size` 写"宽x高"，用 `python3 -c "from PIL import Image;print(Image.open('f').size)"` 实测；
   - `sha256` 用 `shasum -a 256` 实测；
   - `prompt`、`negative` 写你实际使用的完整文本。
5. **提示词模板**：写 `{{prompt_file}}`，供后续批量生成复用。内容包括：
   - 本类风格关键词；
   - 构图与画幅规范；
   - 年代与服饰 / 形制要点，列出本类会涉及的书界年代；
   - 排除项清单；
   - 占位符：题材、书界、年代、参考图；
   - 用法：把已审定的基线图用 `view_image` 载入对话，再让 `image_gen` 以它为风格参考、按新描述生成；
   - 质检要点。
6. **额外事项**：{{extra}}

检查：`python3 tools/agents/check_assets.py {{out_dir}} --min 1 --max 2` 必须通过。

## 报告

第 7 节写：
- 每张图的 ID、题材、书界 / 年代依据、提示词要点；
- 落选候选的数量与淘汰原因；
- 风格自评：逐条对照 `STYLE.md` 本类规则；
- 需作者审批或确认的事项。
