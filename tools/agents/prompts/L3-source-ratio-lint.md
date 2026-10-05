# 本任务：写 `tools/lint/check_source_ratio.py`——十四书界武学来源比例的可执行验收

`design/05` §14.4 把"全部路线可习得池"的天 / 地 / 玄 / 黄占比定为各书界的**来源投放验收指标**（基准 v1.3 已明确它不是定义库硬配额），当前 14 个书界全部"未通过"。S2 任务要重配来源；在此之前先把统计口径做成脚本，让重配可度量、可回归。

## 必读

- `docs/design/05-martial-arts-system.md` §14.1–§14.7（口径：首现 = 唯一 ID 的最早原生 `sourceChapters`；全部路线可习得池 = 同一书界同一 ID 去重、取任一合法路线的最高来源品阶，含正邪互斥路线并集与可新学残承，不含只见闻 / 仅携带 / 敌人专用 / 玩家自创；目标区间表）。
- 11 册 `docs/design/catalog/skills-*.md` 的武学总表列结构（`| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |`）与各册条目卡中 `sourceChapters` / 残承 / "仅见闻" / "敌人专用"的写法（先 `grep -n` 摸清各册差异，写在报告里）。
- `docs/design/02-timeline-and-world-tiers.md` §2.9、§5.7（残承再遇表）；`docs/00-canon.md` §2、§13。
- `tools/lint/check_ids.py`（复用其表格解析与 `SkillDef` 识别）。

## 至少实现

1. `python3 tools/lint/check_source_ratio.py [--json] [--strict] [--targets docs/design/05-martial-arts-system.md]`：解析 11 册图鉴 → 每个 `sk_*` 的品阶与来源书界集合（区分"首现 / 复现 / 残承 / 仅见闻 / 敌人专用 / 自创"）→ 按 §14.4 口径计算每书界"全部路线可习得池"的天 / 地 / 玄 / 黄数量与占比 → 与 05 §14.4 的目标区间表比对 → 输出逐书界表与 PASS / FAIL；`--strict` 下任一书界未命中即退出 1。
2. 同时输出"首现"表并与 05 §14.4 的首现表逐格比对，差异列为 warning（不阻断）。
3. 解析必须**保守**：无法判定来源类型的条目单列 `unclassified`（不进任何池），并在报告里给出数量与样例，供 S2 修正图鉴写法。
4. 单元测试 `tools/lint/test_check_source_ratio.py`（≥ 15 条：口径判定、去重、残承计数、目标区间比对、strict 退出码）。
5. 更新 `tools/lint/README.md`：新脚本用法、口径、与 05 §14.4 的对应。

## 验收标准

- `python3 -m unittest tools.lint.test_check_source_ratio` 通过；脚本在当前仓库运行成功并输出 14 行结果（此时预期 FAIL，属正常）。
- `unclassified` 数量在报告中列明并附样例行；不得为了让数字好看而擅自归类。
- 报告第 6 节：给 S2 的"图鉴来源写法统一建议"（让口径可解析）。
