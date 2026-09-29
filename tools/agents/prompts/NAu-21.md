# 本任务：终审子任务·21 号文档回填与参考实现（`docs/design/21-meridian-flow-and-moves.md`、`tools/balance/`）

你负责"经脉系统落地（AR-14 / AR-15 / AR-16）最终审计"拆出来的一个并行子任务。审计已按写集拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 7 节"交其他任务"。

背景一览（均已合入，报告在 `tools/agents/reports/<ID>.md`，第 7 节是各自的遗留）：基准 v1.3–v1.5（A4、NA1、M5b）；21 号文档 v2.x（M2、M3、M4、NB3、M5、NR0）；绝招新规则与图鉴补足（M4、NU1–NU4、NU2S、NU5p、NU5a、NU5b）；图鉴一致性（NA2、NL、NL2、NL3）；首领配装与统一口径（NB1–NB4b）；按书补录首领武学（NXB01–NXB14，新武学在 `docs/design/catalog/skills-bulu-NN-*.md`）；外放加持（M5、M5b、M5c1、M5c2）；路线叙事化（NR0、NR1、NR2）；天阶扩容与作者三项决定（NXT）。

作者近两日的决定（原文，已在各任务中执行）："神雕的五绝下限高于金轮，低于五绝杨过"；"'九品玄'的理解：按'玄上'执行"；"绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一"；"不一定一定是专属啊，比如灭绝师太，武学应该显然是峨眉派的武学，主角和其他人也有机会学"；"降龙十八掌，六脉神剑，火焰刀，拈花指，这些都是外放啊。确定一下"；"天阶封闭名单：扩容"；"音功：基础不算外放（音波），但内力深厚对音波的控制强，能量大，所以是外放"；"大手印的跃击：掌风算外放"。

通用要求：每次写入不超过约 150 行；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）；改动的文档版本行 / 变更记录追加"经脉落地终审（{{date}}）"；ID 先 `grep -rn` 查重，不新造无依据的 ID。

## 要做的事

1. **回填 21**：06 正式登记的 Buff ID、05 的字段名、基准 v1.3–v1.5 的乘区与前缀编号回填进来，替换"拟登记 / 拟新增"写法（如 §12.1"以下四类 ID 前缀均为拟登记，尚未写入 Canon §12"）；§9.6 `acupointId` → `acupointRef`，"06 读旧"改为"只有存档加载器读旧 Buff ID"；§12.3 TS `BreathProfile` 补 `outOfBattleScaleBp`；21 中运行时引用 `bf_fengxue` / `bf_fengnei` / `bf_fengjingmai` / `bf_chanrao` 的地方按 06 迁移表改为新状态加等级；更新 §18.6 同步清单状态；"九品玄"一条的"待作者确认"改为"作者已确认（2026-09-27）"。
2. **§4**：写入天中 / 地中取值判据（作者原文）并引用裁定表 `docs/decisions/ultimate-counts-tianzhong-dizhong.md`。
3. **§11.9.1**：默认地位下限表改为作者的神雕次序（金轮 < 五绝 < 杨过；落实为金轮 11/8、黄药师 11/9、杨过 12/9，射雕五绝 10），登记 NB4a / NB4b 补定的下限（陈家洛 9、苗人凤 9、胡斐 9、瓦耳拉齐 / 马家骏 9）；"待补专属"统一改为"待补本门武学"；天阶已扩容后，兜底写法的统一口径（NXB02 的 SD02-V25 与 21 冲突之处按 21 统一）。
4. **§4.4.1 外放**：写入作者决定"降龙十八掌，六脉神剑，火焰刀，拈花指，这些都是外放"的判据与示例（音功与大手印已由 NXT 写入，核对一致）；反击架势的外放范围口径（与规则文档甲 NAu-rulesA 同一规则：推荐"只放大反击命中范围，不增射程"）；M5b 交接的措辞——绝招"结算后置冷却"与外放额外耗内"P1 原子预扣"统一为"F2 原子支付、当次 E2 不减"，§4.4.1.2 `baseRange.max` → `range.max`。
5. **§12.1 降龙十八掌三记绝招路线**（十八掌连环、神龙摆尾、震惊百里）：标外放，路线经内关→劳宫收束，仍满足硬约束、同门互异与全仓无完全相同路线。
6. **小问题**：MF-T19 用例描述"18 段"与夹具 10 段统一；§0 的"v2.1 变更摘要"恢复并保留 v2.3 / v2.4 摘要。
7. **参考实现**：`tools/balance/meridian_flow_sim.py` 把 21 的 MF-T17 与 05 的 V9（多绝招共享冷却、禁止连用、7 / 9 / 10 重解锁）写成可执行断言；脚本近 1,200 行上限，可先精简；不得破坏 `tools/balance/boss_pacing.py` 与 `projection_sim.py` 对它的引用。

检查：`python3 tools/lint/check_ids.py --strict`、`python3 -m unittest discover -s tools/lint -p "test_*.py"`、`python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`、`python3 tools/balance/boss_pacing.py --check`、`python3 tools/balance/projection_sim.py --check`、`python3 tools/lint/check_skill_catalogs.py --strict` 必须通过。

## 报告

第 7 节写：处理总表（按 21 的节）、参考实现新增断言、交其他任务的条目。
