# 本任务：设计同步 · 剧情 DAG 状态机与时间模型按 AR-19 定稿（schema + 迁移契约）

本任务改策划 / 技术文档并写 schema 草案（YAML 示例），不写运行时代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 数据层 2.1：「剧情是一个事件驱动的状态机，写成DAG，每一步剧情人物的出现/消失，对话，任务（事件）均定义到DAG的node中，完成node后按照condition或人物选择进入下一个node。基于小说的丰富程度，DAG可以是一个较复杂的多路径状态机。一个书界中有一个主线剧情，以及多个支线剧情。剧情可以有触发的时间限制」；2.2：「时间 - 记录当前时间，时间可以通过客栈睡觉/打坐练功快速推进」。

## 现有文档

- `docs/design/12-quests-npc-factions.md`（五类任务与 ID、状态与阶段、条件 / 分支、任务 DSL §2、Ink 桥接 §2.5、十四篇剧情草稿迁移契约 §2.6、夹具 §3）；`docs/design/story/NN-*.md`（14 篇剧情：主流程图、路线阶段、正 / 邪线十幕）；`docs/design/02-timeline-and-world-tiers.md`（定年）；`docs/tech/05-gameplay-engine.md` §3（GameState）、§5（世界 tick、日历、边界事件）；`docs/tech/04-data-pipeline.md` §2–§3（content 目录、Zod schema）。

## 要做的事

1. **剧情 DAG 规格**（新建 `docs/design/24-story-dag.md`；design/12 只在 §0 加一句归属指引，不改其他节）：
   - 节点类型：人物出现 / 消失（`spawn` / `despawn`：npc_id、场景 / 坐标锚点、时代图层）、对话（引用 Ink knot 或内联台词）、任务 / 事件（引用 `q_*` 或内联事件：战斗、给予物品、改状态）、选择（玩家选项）、条件门（`condition` 表达式，复用 12 §2.2 条件语法）、汇合 / 分支、结束（本线结局标签）；
   - 边：`condition` 或 `choice` 决定下一节点；允许多出边；DAG 约束（无环；时限到期的"超时边"例外写法）；
   - 线：每书界一条主线 + 多条支线（各自独立 DAG，可通过条件引用彼此的节点完成状态）；支线挂接点；与正 / 邪线的关系（design/story 的正线 / 邪线如何表达为同一 DAG 的分支）；
   - 时限：节点 / 线的触发时间窗（游戏日历区间；design/02 定年；错过的处理：失效 / 延期 / 替代节点）；
   - 存档与幂等（引用 12 §1.5）；节点完成的稳定事件；与 Ink 的分工（Ink 只管对话内部分支，DAG 管剧情推进）。
2. **时间模型**：当前时间（年月日时辰）、推进方式（客栈睡觉、打坐练功、旅行、战斗 tick 换算），与 tech/05 §5 的 tick / 日历边界事件对齐；时限触发的检查时机；给字段表。
3. **schema 草案**：`docs/design/story/schema.yaml`（字段说明写在 design/24；**不改 `docs/tech/04-data-pipeline.md`**，与 DES-qi 并行会冲突，tech/04 的指引句由协调者加）：`StoryLine` / `StoryNode` / `StoryEdge` / `TimeWindow` 的字段、类型、取值范围、示例；content 路径约定（`content/story/<chNN>/<line_id>.yaml`）。
4. **迁移契约与样例**：用《天龙八部》剧情草稿（`docs/design/story/01-tianlong.md` §0.3 主流程图、§3 正线十幕、§4 邪线）写一份**主线 DAG 样例**（≥ 25 个节点，含出现 / 消失、对话、任务、选择、时限、支线挂接）放 `docs/design/story/examples/01-tianlong-main.yaml`，并写一段"从十四篇草稿迁移为 DAG 的步骤"（交后续 STORY-chNN 任务）。
5. 验证脚本：`tools/lint/check_story_dag.py <yaml>`（无环、引用的 npc_* / q_* / 场景 ID 存在于名录、时限格式、每线有且仅有一个起点）；对样例跑通。

约束：每次写入 ≤ 150 行；不改剧情草稿正文；ID 按 tech/04 §2.5。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_story_dag.py docs/design/story/examples/01-tianlong-main.yaml`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：节点 / 边类型表；时间模型字段；样例 DAG 的节点数与分支数；迁移步骤；交 ENG-02 的 schema 清单；需作者确认（附默认）。报告 ≤ 120 行。
