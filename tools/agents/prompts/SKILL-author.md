# 本任务：素材生成 skill 建设 · {{cat_name}}（`.codex/skills/{{skill_name}}/`）

本任务写一个 GPT CLI（Codex）可以直接调用的 skill，不改策划 / 技术文档，不出正式素材。上面"规则"一节里关于策划 / 技术文档格式的条目不适用；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者的素材流程（原文见 `assets/default/STYLE.md` 文首）：每类素材先出一到两张基线，作者审批；之后每次生成都"输入对应的基线参考和描述"。作者 2026-09-30 追问："城镇地图、建筑图片、武功招式这几个基线和skill建设都完成了吗"——基线之外，还要把每类素材的生成流程固化成可复用的 skill，让后面的批量生成由 GPT CLI 照着 skill 执行，不依赖某一次会话的上下文。

仓库内的 skill 放在 `.codex/skills/<skill 名>/SKILL.md`，GPT CLI 在仓库（含任务工作区）里运行时会自动发现（协调者已实测）。写 skill 时可以使用内置的 `skill-creator` skill 提供的方法与模板。

本任务要建的 skill：**`{{skill_name}}`**，覆盖范围：{{scope}}

## 必读资料

- `assets/default/STYLE.md`（作者原文、各类风格规则、通用约束、审批记录）、`assets/README.md`（目录与 manifest 字段）。
- `docs/tech/07-asset-generation.md` §1.4（ID 前缀）、§2（美术圣经与禁止项 §2.9）、§9。
- 本类的现状与经验：{{sources}}
- 同类已有任务的提示词与审核要点（写流程与质检清单时参考，不照抄）：`tools/agents/prompts/ART-baseline.md`、`ART-rework.md`、`TOWN-assets.md`、`TOWN-assemble.md`、`VFX-plates.md`；校验脚本 `tools/agents/check_assets.py`。

## 要做的事

1. **`SKILL.md`**（正文不超过 300 行，细节放 `references/` 按需读取）：
   - frontmatter：`name: {{skill_name}}`；`description` 用一两句话写明"做什么"和"什么时候用"（触发条件要具体，含中文关键词）。
   - **输入**：调用方要给什么（素材 ID 或题材、书界与年代、用途、数量等），缺了去仓库哪里查（图鉴、书界章节、人物档案、design/22、design/23……），查不到时的默认值。
   - **流程**：从读资料到交付的每一步，写出确切的命令与文件路径；哪些步骤用内置 `image_gen`，哪些用仓库工具（{{tools}}），哪些只许做几何后处理；每一步的产物放哪里。
   - **提示词**：引用 `assets/default/prompts/` 下本类模板作为唯一事实来源（不要在 skill 里再抄一份会漂移的提示词）；写明占位符怎么填、基线参考图怎么选怎么挂（只用 `status: approved` 的基线，或调用方指定的图）。
   - **质检**：机械检查（命令、期望输出）+ 目视清单（逐条可判：视角、光源、年代、手部结构、透明底、留边、文字 / 水印 / 现代元素、是否像演员或复刻具体作品……按本类取舍）；不合格怎么重出、最多重出几次、记什么。
   - **登记与交付**：`manifest.yaml` 每个字段怎么填（`status: candidate`、`sha256` 与 `size` 实测、`references`、`prompt` / `negative`）；写报告或交付摘要的格式；**不得改动 `status: approved` 的素材**；新素材要等作者在审批页看过才算通过。
   - **禁止项**：STYLE.md 通用约束与 tech/07 §2.9 的禁止项；作者提到的"港版 / 育碧 / 著名游戏"只取气质方向，提示词不写作品名。
2. **`references/`**：放流程里按需读取的细节（例如：本类规格表、质检清单全文、常见失败与处理、manifest 样例）。不要复制整段仓库文档，写"去读哪一节"。
3. **`scripts/`**（可选，只在确有重复劳动时加）：薄封装脚本，复用 `tools/` 下已有工具，不重复实现逻辑；每个脚本支持 `--help`，只用标准库 + PIL + numpy + PyYAML。
4. **自测**：照着写好的 skill 在脑中（或用 dry-run 命令）走一遍一个具体请求——{{trial_hint}}——检查每一步是否都有确切的输入、命令与产物位置；把走查记录写进报告。**本任务不出正式素材、不改 `assets/`**（正式试用由后续试用任务做）。
5. 每次写入不超过约 150 行，分多次写。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_skill.py .codex/skills/{{skill_name}}`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：skill 的文件清单与各自用途；流程步骤一览（步骤 / 输入 / 命令 / 产物）；走查记录（哪一步查了什么、有没有卡点）；skill 依赖的仓库文件清单（这些文件改动时 skill 要跟着复核）；已知缺口与需作者确认的事项。
