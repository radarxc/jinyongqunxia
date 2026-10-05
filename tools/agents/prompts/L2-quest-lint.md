# 本任务：写 `tools/lint/check_quest_manifest.py`——剧情迁移 manifest 与 `quest.v1` 实例的标准库校验器

`design/12` §2.6 规定十四篇剧情稿必须经显式迁移 manifest 生成 `quest.v1` 数据，§13.1 给出 QST-V01–V26 强校验。在 TypeScript 内容管线（tech/04）建成之前，用一个只依赖 Python 标准库（≥ 3.9）的校验器先把结构与图检查落地，供 Q01–Q14 任务与后续 CI 使用。

## 必读

- `docs/design/12-quests-npc-factions.md` §1.1（ID 正则）、§2（任务 DSL：阶段 / 转移 / 条件 AST / 动作白名单 / 检定 / 效果）、§2.6（迁移契约与 manifest 最小字段）、§3（七个夹具，可作测试数据）、§11（`quest.v1` 等四个 schema 根）、§13.1（QST-V01–V26）。
- `docs/design/20-legacy-inheritance.md` §10（六个 `legacy/*` opcode）；`docs/tech/04-data-pipeline.md` 中 `quest` / `narrative` 段与 `content/` 目录规范（`content/chapters/chNN_<slug>/quests/`）。
- `tools/lint/check_ids.py`（复用其 ID 前缀 / 定义识别方式；不要复制大段代码，可 `import` 其函数）、`tools/lint/README.md`。
- `docs/design/story/01-tianlong.md` §9–§11（真实 YAML 样例与 24 个正式任务 ID）。

## 至少实现

1. **输入约定**：`python3 tools/lint/check_quest_manifest.py content/chapters/ch01_tianlong`（目录内含 `quest-manifest.yaml` 与 `quests/*.yaml`）；`--json`、`--strict`（error 即退出 1）、`--fixtures docs/design/12-quests-npc-factions.md`（可直接抽取 §3 夹具作自检）。YAML 读取用标准库不可行时，写一个覆盖 JSON-compatible 子集的最小 YAML 解析器（QST-V20 明确禁止 anchor / alias / merge / 多文档，所以子集足够），或在 PyYAML 可用时优先用它但**不得**成为硬依赖。
2. **manifest 检查**（§2.6）：最小字段 `chapterId / sourceRef / sourceSchema / aliases[] / decisionNodes[] / stateMappings[] / formulaNotes[] / unmapped[]`；`aliases[].{sourceAlias, questId, stageIds[]}`；`decisionNodes[].{decisionId, questId, stageId, choiceToBranchKey}`；`unmapped` 在 `--strict` 下必须为空；旧简式 `q_NN_main_nn` 必须出现在 aliases 且目标带 `c/z/x`；`dc_NN_nn` 唯一、指向存在的任务 / 阶段 / `branchKey`。
3. **`quest.v1` 结构检查**（QST-V01–V08、V20、V23、V24 的静态部分）：`schemaVersion` 恰为 `quest.v1`；ID 正则与 `chapterId` 一致；`kind` 五类；至少一阶段、入口可达全部阶段、终态存在；阶段 / 转移 / 检定 / 效果 ID 作用域唯一；转移目标存在；同优先级出口不重叠（至少检查"两个恒真出口同优先级"）；非穷尽分支有兜底；条件节点恰一个操作符且操作符 / 字段 / 动作在白名单；`check.id` 唯一、概率 0–1、`when` 内无随机；效果有稳定局部 `id`；局部键 `st_/edge_/fx_/chk_` 不跨任务引用；未知键报错；`legacy/*` opcode 只允许 20 §10 的六个，且字段名用 `recipeKey`。
4. **引用检查**：`npc_* / sect_* / city_* / rg_* / it_* / sk_* / bf_*` 等引用交给 `check_ids.py` 的定义索引判断是否已定义（复用其扫描结果或调用其函数）。
5. **输出**：人类可读报告（文件:行:列 + 规则 ID + 说明）与 `--json`；退出码约定与 `check_ids.py` 一致。
6. **测试** `tools/lint/test_check_quest_manifest.py`（unittest）：≥ 25 条用例，覆盖每条实现的规则的通过与失败各一例，夹具取自 12 §3 与自造最小样本；`python3 -m unittest tools.lint.test_check_quest_manifest` 通过。
7. 更新 `tools/lint/README.md`：用法、检查项与 QST 规则对照表、未实现的 QST 条目清单（明确写"由 tech/04 内容管线实现"）。

## 验收标准

- 上述测试通过；对 12 §3 七个夹具运行 `--fixtures` 得到 0 error。
- 脚本 `python3 -m py_compile` 通过；不引入第三方硬依赖。
- 报告第 6 节：给 Q01 的 manifest / quest 文件模板（字段骨架）。
