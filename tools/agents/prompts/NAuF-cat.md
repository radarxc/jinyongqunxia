# 本任务：终审拆分 · 武学图鉴 {{unit_name}}（绝招条件加成统一、抽查与残留清理）

你负责"经脉系统落地最终核对"（原 NAu-final）按写集拆出来的一个并行子任务。终审拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 6 节与第 7 节"交其他任务"，由最后的收口任务 NAu-final 统一处理。

背景一览（均已合入，报告在 `tools/agents/reports/<ID>.md`，第 6 / 7 节是各自的遗留与交办）：绝招新规则与图鉴补足（M4、NU1–NU4、NU2S、NU5p、NU5a、NU5b）；图鉴一致性（NA2、NL、NL2、NL3）；外放加持（M5、M5b、M5c1、M5c2）；路线叙事化与唯一性（NR0–NR3）；天阶扩容（NXT）；门派图鉴收尾（NXfix-<11 册>、NXfixC）；阴阳理论 AR-18（NYY）与图鉴性质落地（NR4-<12 单元>）；检查脚本维护（LINT-outlets）；规则文档终审（**NAuF-rules，刚合入**：05 §4.8 写明了绝招条件加成的唯一算法，其报告第 7 节有"各册需要重算的绝招清单"）。

作者的相关决定（原文）："绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一"；"不一定一定是专属啊，比如灭绝师太，武学应该显然是峨眉派的武学，主角和其他人也有机会学"；"降龙十八掌，六脉神剑，火焰刀，拈花指，这些都是外放啊。确定一下"；"音功：基础不算外放（音波），但内力深厚对音波的控制强，能量大，所以是外放"；"大手印的跃击：掌风算外放"。AR-18 阴阳理论原文见 `docs/decisions/author-requirements.md`。

通用要求：每次写入不超过约 150 行；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）；版本行追加"经脉落地终审（{{date}}）"；不新造 ID；需作者拍板的事项先给默认值继续做，并列入报告第 4 节。

本任务的图鉴（只改这些文件）：

{{doc_set}}

## 要做的事

1. **绝招条件加成按唯一算法统一**：读 `docs/design/05-martial-arts-system.md` §4.8（现行版）与 `tools/agents/reports/NAuF-rules.md` 第 7 节"各册需要重算的绝招清单"。本册所有带条件加成的绝招逐记按唯一算法处理（清单只是线索，以你对本册全部绝招的逐记核对为准）：倍率重算或改为 05 允许的门槛型写法；卡面、镜像表、招式预算、说明文字一并同步。改动逐条列表（招式 / 改前 / 改后 / 做法）。数值变化超过 ±0.05 手调范围的，运行 `python3 tools/balance/damage_sim.py --check` 并在报告里说明对节奏的影响。
2. **抽查**（发现问题就改，抽查对象与结论写进报告）：
   - 至少 5 门天 / 地 / 玄上武学：绝招数量与解锁层是否符合作者口径与裁定表（`docs/decisions/ultimate-counts-tianzhong-dizhong.md`）；路线硬约束（21 §4.6 / §17.1）与动作末端规则（21 §4.3.1）；外放标记（21 §12、§18）。
   - 至少 3 个外放招式：射程 / 范围 / 威力与 `python3 tools/balance/projection_sim.py --report` 一致。
   - 本册全部音功与大手印类招式的标记与 21 §4.4.1.1、§18.6 一致。
3. **收拢遗留**：读指向本册的报告条目（`grep -rln` 本册文件名于 `tools/agents/reports/`，重点看 NXfix-*、NXT、NR3-*、NR4-*、NR4S-rules、LINT-outlets、NAuF-rules 的第 6 / 7 节），处理写集内尚未处理的；过期的"待收录 / 待登记 / 待补录 / 由 NXfix 统一接入"一类文字，按现状改为"已解决：……（见 X §Y）"。
4. **检查脚本命中**：`python3 tools/lint/check_skill_catalogs.py --delivery --details <本册>` 与 `python3 tools/agents/check_route_unique_for.py <本册>` 若在 LINT-outlets 修脚本后对本册报出新的命中（性质冲突、普通路线完全相同等），按 21 的规则在本册修掉；≥80% 相似但规则允许保留的，写明理由。
5. **本单元额外事项**：{{extra}}
6. **不做的事**：不刷新文首引用的基准 / 21 版本号、不改武学总数统计（收口任务统一处理）；不改其他图鉴与规则文档。

检查：以下命令必须全部通过（与 NR4 单元验收相同）。
- `python3 tools/agents/check_nr4_unit.py <本任务图鉴>`：三项计数都为 0
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict <本任务图鉴>`
- `python3 tools/agents/check_route_unique_for.py <本任务图鉴>`
- `python3 tools/agents/check_undefined_in.py <本任务图鉴>`
- `python3 tools/agents/check_nr3_unit.py {{unit}}`

## 报告

第 7 节写：绝招条件加成改动清单（招式 / 改前 / 改后 / 做法）；抽查对象与结论；遗留处理总表；检查脚本命中的处理；交其他任务的条目；需作者确认的事项（逐条附默认值）。
