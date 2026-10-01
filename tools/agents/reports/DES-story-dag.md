# DES-story-dag 报告 · 设计同步 · 剧情 DAG 状态机与时间模型按 AR-19 定稿（schema + 天龙主线样例 + 校验脚本）

## 1. 摘要（3–6 行）

按 AR-19 新增剧情 DAG 与世界时间规格，明确一书界一主线、多支线、正邪同图分支、全边无环、时间窗和幂等存档。
提供 `story.v1` YAML 契约草案，以及由《天龙八部》共有段、正线十幕、邪线十幕迁移出的可校验主线样例。
新增仓库名录感知的 Python 校验器和 29 个单元测试；样例校验、严格 ID 检查及 `tools/lint` 全量 259 测试均通过。
`design/12` 仅在 §0 增加归属指引，未改任务 DSL、剧情草稿、基准或技术文档。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `docs/design/24-story-dag.md` | 432 | 归属、图不变量、节点 / 边、主支线、时间、存档、迁移、ENG-02 交接 |
| `docs/design/12-quests-npc-factions.md` | +2 | §0 增加剧情 DAG 归 `design/24` 的指引 |
| `docs/design/story/schema.yaml` | 280 | `story.v1` 类型、字段、范围、示例和生产校验清单 |
| `docs/design/story/examples/01-tianlong-main.yaml` | 606 | 天龙共有段与正 / 邪十幕主线 DAG 样例 |
| `tools/lint/check_story_dag.py` | 449 | CLI、图 / 时限 / payload / 名录引用校验 |
| `tools/lint/test_check_story_dag.py` | 347 | 29 个正反例单测 |
| `tools/agents/reports/DES-story-dag.md` | 本报告 | 结论、依赖与验收记录 |

## 3. 关键结论与数值

- 图：每线恰一个零入度起点，节点全可达；`auto / condition / choice / timeout` 全部参与拓扑排序，任何环均非法。
- 线：每书界恰一条 `main`，可有多条 `side_*`；跨线只读稳定完成态，不创建跨文件边。正 / 邪线以同一主线 DAG 的路径表达。
- 时间：`10 tick/分钟`、`600 tick/小时`、`1,200 tick/时辰`、`14,400 tick/日`；战斗 tick 不推进世界时间。
- 休整：普通打坐 60 分钟即 600 tick；客栈基准 480 分钟即 4,800 tick，夜间实际为 `max(480, 至下一卯时的分钟差)`。
- 时限：绝对 / 相对半开区间 `[open, close)`；主线不得 `expire`，错过时以唯一 timeout 边进入 `alternate`。
- 样例：59 节点、84 边、17 个多出边节点、44 条非 auto 分支边、10 个 choice 节点、2 个结局；1 个支线挂接、1 个 480 分钟窗口。

## 4. 开放问题（附默认值）

| 编号 | 需作者确认 | 当前默认 |
|---|---|---|
| O-SD-01 | 剧情路径是否并入 `content/chapters/chNN_*/story/` | 先用任务指定的 `content/story/<chNN>/<line_id>.yaml`，ENG-02 统一入口 |
| O-SD-02 | 战斗是否消耗世界时间 | 不消耗；剧情耗时另发显式推进命令 |
| O-SD-03 | v1 是否允许真正并行前沿 | 存档保留数组，运行器一次只提交一个前沿 |
| O-SD-04 | `defer` 次数是否全局统一 | 缺省 1 次，节点显式值上限 9 |
| O-SD-05 | 30 日/月、12 月/年是否作为正式显示历 | 暂作规则历建议值，不声称历史历法 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| P-SD-01 | 基准 §18 增列 `design/24` 为剧情 DAG、时间窗及剧情线运行态唯一归属 | AR-19 概念尚无唯一归属，需防止 `design/12` 与 `tech/05` 重定义 |
| P-SD-02 | 基准 §12 声明 `lineId`、`n_*`、`e_*` 是父线内局部键 | 避免局部图键污染全局内容 ID 注册表 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 后续同步 |
|---|---|---|
| `docs/00-canon.md` | §§12、18 | 采纳 P-SD-01 / P-SD-02 后补归属与局部键例外 |
| `docs/tech/04-data-pipeline.md` | §§2–3 | ENG-02 落生产 Zod schema，并统一 `content/story` 物理路径 |
| `docs/tech/05-gameplay-engine.md` | §§3、5、14 | 接入 `StoryLineState`、六类稳定事件、窗口边界和原子 outbox |
| `docs/design/story/02-*`～`14-*` | 各篇迁移任务 | 按十步契约生成一主多支 DAG 与迁移 manifest，不改既定剧情结论 |
| `docs/design/11-open-world.md` | 休息 / 时间推进 | 作者若修改战斗耗时或显示历，再同步换算与边界顺序 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 节点 / 边类型表：节点为 `spawn / despawn / dialogue / quest / choice / condition / merge / end`；边为 `auto / condition / choice / timeout`。
- ✅ 时间模型字段：已列 `epochId / calendarSpecId / epochYear / worldTick / elapsedTicks` 及年月日、时刻、时辰投影和全部换算。
- ✅ 样例规模与分支：59 节点、84 边；44 条非 auto 分支边 = 29 choice + 14 condition + 1 timeout，另有 40 auto 边。
- ✅ 迁移步骤：`design/24` §8 给出十步流程，覆盖建线、逐幕拆点、正邪同图、选择、人物、时限、支线、跨线、回放和 manifest。
- ✅ ENG-02 schema 清单：交付 `StoryLine / StoryNode / StoryEdge / TimeWindow / StoryLineState / StoryEvent / StoryMigrationManifest` 及跨对象检查。
- ✅ 需作者确认：五项均在第 4 节给出不中断实施的默认值；文档 §12 保留同源开放项。
- ✅ 样例校验：`python3 tools/lint/check_story_dag.py docs/design/story/examples/01-tianlong-main.yaml` 通过。
- ✅ ID 校验：`python3 tools/lint/check_ids.py --strict` 通过；仅显示仓库既有 baseline `sk_babuganchan`，新增严格失败为 0。
- ✅ 单测：专用 29/29、`tools/lint` 全量 259/259 通过；标准库 `trace` 对新校验器测得 89% 行覆盖率。
- ✅ 格式与范围：PyYAML 可解析 schema / 样例，`git diff --check` 通过，只改允许路径；未改十四篇剧情草稿正文。
- ⚠️ 草案边界：Python 校验器不替代 ENG-02 的 strict Zod、完整 ConditionExpr / Action 类型检查和跨文件强制依赖环检查。
