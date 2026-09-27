# 本任务：需求覆盖检查（TODO F4）、总索引 `docs/README.md`（F5），并更新 `TODO.md` 的状态

此时全部文档都已完成、审校，并通过了全局一致性审计（F2）。

## 1. 需求覆盖检查（F4）

逐条检查 `TODO.md` §7 中的用户原始需求，看负责文档是否已完整覆盖：
- 更新 §7 表的"状态"列，写明覆盖到的章节（如"05 §4、§14；图鉴 10/10"）；
- 未覆盖或薄弱的，写明缺口，并给出建议的补法。

## 2. 总索引（F5）：写 `docs/README.md`

- 项目一句话介绍，以及文档体系说明（基准 → 策划 / 图鉴 / 书界 → 技术 → 决策记录）；
- 文档总索引：每篇一行，含路径链接、一句话摘要、行数、状态；
- 推荐阅读顺序：策划读者、技术读者各一条路径；
- 执行摘要：最重要的 15–25 条已定设计与技术结论，每条附出处（文档 §）；
- 仍待作者决定的问题：链接 `docs/decisions/author-decisions.md`，列出最关键的 5–10 条；
- 如何继续：链接 `tools/agents/README.md`（多代理执行方式）与 `TODO.md`。

## 3. 更新 `TODO.md`

- 文首"更新"行改为当前日期与一句话说明；
- §1 现状总结与 §1.1 各文档状态改为实际情况（更新图例，如"✅ 已审校"）；
- §6 已完成的项打勾；
- §3 冲突表每条加"已解决（见 `rulings-v1.md` / 文档 §）"标注；
- 不要删除历史结论、冲突表和提案汇总。

## 4. 补充要求（覆盖范围以当前仓库为准）

- **作者新增需求**：`TODO.md` §7.1 的 AR-01…AR-13 各行同样更新"状态"列（写明负责文档与章节，如"design/15 §3–§9；基准 v1.2 §6"），与 `docs/decisions/author-requirements.md` 一一对应；未完全落实的写明缺口。
- **索引范围**：至少覆盖基准与决策记录（`00-canon.md`、`decisions/` 下的 rulings、author-decisions、author-requirements、canon-proposals-v1.2）、策划文档 design/01–20、武学图鉴 `catalog/skills-*.md`（11 册）与 NPC 名录 `catalog/npcs-*.md`、剧情 `design/story/01–14`、书界 `design/chapters/01–14`、地图数据 `design/map/`（YAML 与 SVG）、技术文档 tech/01–09，以及工具 `tools/lint`、`tools/balance`、`tools/map`、`tools/agents`。行数用 `wc -l` 实测。
- **执行摘要**必须包含：武学规模与 1:3:9:9（design/05 §14）、六角格战斗（design/09）、冲穴与周天（design/15）、资源与营生（design/16）、门派（design/17）、NPC 与同伴（design/18）、统一大地图与时代图层（design/11、19）、跨年代传承（design/20）、十四部剧情正邪双线（story），以及路线图的工时与阶段结论（tech/09：单人 + AI 辅助的三档工时、削减阶梯）。
- **仍待作者决定**：列出基准 v1.2 中标"⚠️ 待作者确认"的条目、F2 报告中需作者拍板的遗留、tech/09 的前几个作者决策点（RD-01…），每条附默认值与出处。
- **多代理执行说明**：在"如何继续"一节注明本轮采用的执行方式（每个任务由本机 TraeX CLI 调用 GPT 模型撰写、监督代理驱动 `tools/agents/step.py`），并链接 `tools/agents/README.md` 与 `tools/agents/SUPERVISOR.md`。
