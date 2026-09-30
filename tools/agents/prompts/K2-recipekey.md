# 本任务：统一传承合成字段 `recipeKey`，定稿传承缓存运行态枚举

F2 终审把它列为最高严重度遗留：`design/12` 的 `legacy/completeSynthesis.recipeId`、`design/20` 的动作 `recipeKey`、事件 `legacy/synthesisStarted.recipeId` 在 12 / 20 / tech/04 / tech/05 之间漂移；此外 `LegacyCacheRuntimePhase` 五值尚未由 20（owner）定稿。本任务一次改齐四篇文档（以及 `chapters/02-shediao.md` 中的引用）。

## 必读

- `docs/00-canon.md` v1.3（§12 前缀、§18 归属：传承合成与缓存运行态归 `design/20`）。
- `docs/design/20-legacy-inheritance.md` §7（校合完整武学，尤其 §7.6）、§9–§10（缓存、opcode、收据）；`docs/design/12-quests-npc-factions.md` §2.4–§2.6、§11、§13 QST-V25；`docs/tech/04-data-pipeline.md` 中 `legacy/*` opcode 与 schema 段；`docs/tech/05-gameplay-engine.md` 中传承（`legacy_*` 命令、事件、`BS_COMMIT`、LEG-T01–T15）；`docs/design/chapters/02-shediao.md` 中 `recipe*` 出现处。
- `tools/agents/reports/F2.md` §4.1 第 1、4 行；`F2b.md`、`F2t.md` 中相关段。
- `grep -rn "recipeKey\|recipeId\|LegacyCacheRuntimePhase\|cacheState\|runtimePhase" docs` 找全所有出现处。

## 要做的事

1. **定稿字段**：在 `design/20`（owner）明确 `recipeKey` 的语法（建议 `rcp_<源ID>_<卷组>`，按基准 §12 风格登记，若需新前缀在报告第 5 节提案）、唯一性与稳定性规则；动作、事件、收据、存档字段统一只用 `recipeKey`；`recipeId` 只允许出现在"旧档只读迁移"语境，并给出迁移规则（读旧写新、迁移函数名、失败处理）。
2. **同步 12 / tech/04 / tech/05**：把 `legacy/completeSynthesis`、`legacy/synthesisStarted` 及相关 opcode / 事件 / schema / 夹具 / golden 描述改为 `recipeKey`；QST-V25 与 LEG-T* 用例文本相应更新；`chapters/02` 的引用改为新字段。
3. **定稿 `LegacyCacheRuntimePhase`**：在 `design/20` 声明枚举（默认 `hidden / revealed / working / ready / opened`，可修正但须给理由）、状态迁移表（触发、前置、幂等、回滚）、与 `design/16` 家丁代挖 / `tech/05` `BS_COMMIT` 的衔接；tech/04 / tech/05 改为引用 20，不得再各自定义值域。
4. **一致性检查**：`grep -rn "recipeId" docs` 只剩迁移语境（每处附"（旧档迁移）"字样或位于迁移表内）；`python3 tools/lint/check_ids.py --strict` 通过。
5. 保留各文档既有"待决事项"条目，已解决的改写为"已解决：见 20 §x"。

## 验收标准

- `design/20` 有 `recipeKey` 定义与 `LegacyCacheRuntimePhase` 枚举 + 迁移表；12 / tech/04 / tech/05 / chapters/02 中不再有作为现行字段的 `recipeId`。
- `python3 tools/lint/check_ids.py --strict`、`python3 tools/balance/damage_sim.py --check` 通过。
- 报告第 6 节列出 Q01（天龙任务 manifest）需要遵守的传承 opcode 字段清单。
