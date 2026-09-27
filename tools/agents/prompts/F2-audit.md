# 本任务：全局一致性终审汇总（F2）

所有文档都已完成并审校，基准已更新到 v1.2；跨文档同步（F1a / F1b / F1t / F1n）、六个分组审计（F2a 设计核心 A、F2b 设计核心 B、F2c 武学与数值、F2d1 / F2d2 剧情与书界、F2t 技术与工具）、检查脚本收口（F2x）与跨组文档收口（F2y）都已完成。你是最后一道一致性关卡：可以修改 `docs/` 下任何文档、`tools/lint/`、`tools/balance/` 与 `tools/map/`；`docs/00-canon.md` 只改明显笔误并在报告中登记，规则性改动写成提案。

## 要做的事

1. **收拢遗留**：读 `tools/agents/reports/` 下 F2a、F2b、F2c、F2d1、F2d2、F2t、F2x、F2y 八份报告第 7 节，处理其中仍未落实的小改（尤其是 F2c 与 F2y 各自无法改对方文件而留下的条目，如武学图鉴里的 `npc_cien` → `npc_qiuqianren`、岗位类 `npc_*`、残留的未收录候选 `set_*`）。需要整节重写的列入遗留，不要动手。
2. **ID 检查与基线**：运行 `python tools/lint/check_ids.py --json`，给出三段对比：F1 结束后（取 F1a–F1n 报告中的数）/ 分组审计后（取六份分组报告中的数）/ 本任务后。剩余问题逐条归类：可立即修（修掉）、合理占位（在文档中标注，或在脚本规则中说明理由）、需作者决定（列出）。然后在仓库根用 F2L / F2x 提供的命令做默认全量扫描、刷新 `tools/lint/check_ids_baseline.json`，确认 `python tools/lint/check_ids.py --strict` 通过，并在 `docs/tech/04-data-pipeline.md` §11 的变更记录里写明刷新前后的债务数与清零计划。
3. **汇总核对表**（以各报告为基础，每张表至少抽 5 项用 `grep -n` 核实）：
   - C01–C23 × 文档 的落实表；
   - AR-01…AR-13 × 归属文档 的落实表，以及 `docs/decisions/author-decisions.md` 作者决定的落实情况；
   - 协调备忘 CN-01…CN-11 的最终状态表（`tools/agents/reports/_coordinator-notes.md`，该文件不在写权限内，不用改）；
   - 基准 v1.2 变更记录 × 下游文档 的同步表。
4. **数值链抽查**：03 锚点 → 04（运行 `python tools/balance/damage_sim.py --check`）→ 05 招式预算 → 09 战斗节奏 → 各书界 Boss 算式（每部书界抽 1 个 Boss 复算）；02 / 13 的等级上限与经验；10 的装备数值与 04；15 冲穴加成与 04 的 TTK 区间；07 套装预算与 06 共享上限。
5. **归属检查**：抽查基准 §18 各概念（含 v1.2 新登记的 15–20、story）在非归属文档中是否被重定义，重定义的改为引用。
6. **基准提案**：F2c、F2x、F2y 报告第 5 节的新提案，与 `docs/decisions/canon-proposals-v1.2.md` 比对后追加到"v1.2 之后新增（待 v1.3）"表（F2y 已追加此前各报告的提案）。
7. **修改尺度**：以小改为主；需要大改（整节重写）的列入遗留。

## 输出

- 直接修改文档。
- 报告：ID 三段计数对比与基线刷新记录；上述四张汇总表；数值链抽查结果；遗留问题总清单（按严重度排序，写明建议处理方式，需作者拍板的单列并附默认值）。

调度器会在你结束后运行 `python tools/lint/check_ids.py --strict` 与 `python tools/balance/damage_sim.py --check`。
