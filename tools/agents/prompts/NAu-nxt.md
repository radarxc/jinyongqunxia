# 本任务：终审子任务·NXT 同步（05 / tech 04 / tech 05 / 检查脚本）

你负责"经脉系统落地（AR-14 / AR-15 / AR-16）最终审计"拆出来的一个并行子任务。审计已按写集拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 7 节"交其他任务"。

背景一览（均已合入，报告在 `tools/agents/reports/<ID>.md`，第 7 节是各自的遗留）：基准 v1.3–v1.5（A4、NA1、M5b）；21 号文档 v2.x（M2、M3、M4、NB3、M5、NR0）；绝招新规则与图鉴补足（M4、NU1–NU4、NU2S、NU5p、NU5a、NU5b）；图鉴一致性（NA2、NL、NL2、NL3）；首领配装与统一口径（NB1–NB4b）；按书补录首领武学（NXB01–NXB14，新武学在 `docs/design/catalog/skills-bulu-NN-*.md`）；外放加持（M5、M5b、M5c1、M5c2）；路线叙事化（NR0、NR1、NR2）；天阶扩容与作者三项决定（NXT）。

作者近两日的决定（原文，已在各任务中执行）："神雕的五绝下限高于金轮，低于五绝杨过"；"'九品玄'的理解：按'玄上'执行"；"绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一"；"不一定一定是专属啊，比如灭绝师太，武学应该显然是峨眉派的武学，主角和其他人也有机会学"；"降龙十八掌，六脉神剑，火焰刀，拈花指，这些都是外放啊。确定一下"；"天阶封闭名单：扩容"；"音功：基础不算外放（音波），但内力深厚对音波的控制强，能量大，所以是外放"；"大手印的跃击：掌风算外放"。

通用要求：每次写入不超过约 150 行；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）；改动的文档版本行 / 变更记录追加"经脉落地终审（{{date}}）"；ID 先 `grep -rn` 查重，不新造无依据的 ID。

## 要做的事

NXT（天阶扩容与作者三项决定）合入时，规则文档甲（NAu-rulesA）、技术文档（NAu-tech）与检查脚本（NAu-lint）已经在各自的工作区里开工，没接到 NXT 的新口径。本任务把 NXT 报告 `tools/agents/reports/NXT.md` §6 中落在本任务写集的同步项补上。先读 Canon v1.6（V16-01～V16-04）、21 §4.4.1 与 NXT 报告 §3–§6。

1. **05**（`docs/design/05-martial-arts-system.md`）：
   - §14 等处天阶总数按 Canon v1.6 改为 59（天上 9 / 天中 18 / 天下 32），写明"作者决定扩容（2026-09-28）"。
   - 登记补录图鉴 `docs/design/catalog/skills-bulu-NN-*.md` 为正式武学定义源（Canon V16-04）。
   - 地 / 玄 / 黄总量：门派图鉴 11 册仍按 `51/169/459/459=1,138` 基线。含补录的总量等 NXfixC 收口后由 NAu-final 重算；本任务只写清口径，不写猜测的数字。
   - 音功运行时分支：标 `projection:true` 的音功，外放 0 档按普通音波结算——普通 Z5M、基础范围、零额外耗内；1 档起才用外放威力曲线、范围扩张与额外耗内。静态伤害类别（`projected`）与护体内劲 40% 适用率不变。大手印跃击只有落点掌风一段算外放，跃迁位移不另造伤害段。`MoveDef` 的外放字段说明按 21 §4.4.1 的写法同步。
2. **tech/05**（`docs/tech/05-gameplay-engine.md`）：运行时接入上述音功分支，写明 `projectionBoostActive` 的判定点与结算顺序；大手印跃击的伤害段拆分。
3. **tech/04**（`docs/tech/04-data-pipeline.md`）：
   - 构建器落实 21 的 MF-V16 / MF-V17（NXT 新增，先读 21 原文，不要凭标题猜）；
   - 补录图鉴与门派图鉴一并扫描；
   - 天阶名录校验按 59 门，书界天阶池上限按高武 6–18 / 中武 1–6；
   - MF-V14 补例外（NAu-rulesA 报告 §6、开放问题 RA-O03）：外放反击架势可引用 `purpose:defense` 路线，但须命中合法外放端点；普通伤害招仍要求 attack 路线。
4. **检查脚本**（`tools/lint/`）：`check_skill_catalogs.py` 的末端规则检查（NAu-lint 新开的开关）接入音功端点。
   - 人声发劲的音功另可取 `ap_yinwei_tiantu`（天突）、`ap_yinwei_lianquan`（廉泉）作外放端点；琴、箫、笛等持乐器音功仍须取手 / 腕端点；其余外放招的 13 个手部端点不变。
   - "人声 / 持乐器"的判定依据写清楚。有可靠字段（出招方式、兵器）就用字段；没有就只放行明确列出的人声音功 `sk_*`，把清单写进代码并在报告列出。
   - 补单元测试。不要写死会随图鉴变化的计数（如裁定表行数），改为结构性断言。
5. **前序遗留**：NAu-lint、NAu-rulesA、NAu-tech 三份报告第 6、7 节里，落在本任务写集（05、tech/04、tech/05、`tools/lint/`）的"交其他任务"条目，逐条处理或说明不处理的理由。

检查：`python3 tools/lint/check_ids.py --strict`、`python3 -m unittest discover -s tools/lint -p "test_*.py"`、`python3 tools/lint/check_skill_catalogs.py --strict`、`python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`、`python3 tools/balance/projection_sim.py --check` 必须通过。另跑一次末端规则检查（NAu-lint 新开关），命中数写进报告。

## 报告

第 7 节写：处理总表（按文档 / 脚本）、音功端点判定依据与放行清单、末端规则检查命中数（改前 / 改后）、交其他任务的条目。
