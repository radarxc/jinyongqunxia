# 本任务：终审拆分 · 系统文档甲（design/01、02、04、06、08、09、12–18 与 tech/01、03、04、05、08、09）

你负责"经脉系统落地最终核对"（原 NAu-final）按写集拆出来的一个并行子任务。终审拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 6 节与第 7 节"交其他任务"，由最后的收口任务 NAu-final 统一处理。

背景一览（均已合入，报告在 `tools/agents/reports/<ID>.md`，第 5 节是对基准的修改提案，第 6 / 7 节是各自的遗留与交办）：基准 v1.3–v1.8（A4、NA1、M5b、NAu-canon、NXT、NYY）；21 号文档 v2.x（M2、M3、M4、NB3、M5、NR0、NAu-21、NYY）；绝招新规则与图鉴补足（M4、NU1–NU4、NU2S、NU5p、NU5a、NU5b）；图鉴一致性（NA2、NL、NL2、NL3）；首领配装与统一口径（NB1–NB4b）；按书补录首领武学（NXB01–NXB14）；外放加持（M5、M5b、M5c1、M5c2）；路线叙事化与唯一性（NR0–NR3）；天阶扩容（NXT）；终审前序（NAu-lint、NAu-tech、NAu-rulesA、NAu-rulesB、NAu-21、NAu-canon、NAu-nxt）；门派图鉴收尾（NXfix-<11 册>、NXfixC）；书界收尾与补漏（NXfixD-01…14、NXfixE-a / b / c）；阴阳理论 AR-18（NYY）与图鉴性质落地（NR4-<12 单元>）。

并行的兄弟任务与它们的写集（不要越界）：`NAuF-rules`（design/03、05、07、10、20、21）；`NAuF-cat-<单元>`（各册武学图鉴）；`NAuF-book-<NN>`（chapters/NN、npcs-chNN、story/NN）；`NAuF-assets`（author-requirements、author-decisions、design/11、19、map、tech/02、06、07）；`NAuF-canon`（基准与提案记录）；`NAuF-lint`（tools/lint、tools/balance）；最后是收口任务 `NAu-final`。

通用要求：每次写入不超过约 150 行；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）；改动的文档版本行 / 变更记录追加"经脉落地终审（{{date}}）"；ID 先 `grep -rn` 查重，不新造无依据的 ID；需作者拍板的事项先给默认值继续做，并列入报告第 4 节。

本任务的文件（只改这些）：

- `docs/design/01-vision-and-core-loop.md`、`02-timeline-and-world-tiers.md`、`04-damage-formula.md`、`06-buff-system.md`、`08-terrain-and-qinggong.md`、`09-combat-system.md`、`12-quests-npc-factions.md`、`13-progression-and-endings.md`、`14-ui-ux-mobile.md`、`15-meridians-and-acupoints.md`、`16-resources-and-estates.md`、`17-sects-compendium.md`、`18-npc-and-companions.md`
- `docs/tech/01-architecture.md`、`03-mobile-performance.md`、`04-data-pipeline.md`、`05-gameplay-engine.md`、`08-backend-and-online.md`、`09-roadmap.md`

## 要做的事

1. **收拢遗留**：读全部任务报告第 6 / 7 节里指向本写集文档的"需同步 / 交其他任务"条目（用 `grep -rln` 按文档名检索 `tools/agents/reports/`），处理尚未被处理的；需要整节重写的列入遗留。已处理过的不要重复改。
2. **指名条目**（原 NAu-final 第 4 项中属于本写集的部分，逐条处理并在报告里给出处理结果）：
   - design/18 约第 1292 行与 NPC-V18 的双童"隔开群豪并保住绳路"改为与雪山 B02 `deescalationBp` 一致。
   - design/09 §8.8.11 统一整场耐久分配的余数规则（现状：雪山 B05 用最大余数补、B06 把余数给最后的分支目标）。写明唯一规则；选规则时以现有十四书界的遭遇数值改动最少为优先，并在报告里列出按新规则需要随之修改的书界遭遇（章节不在本写集内，交 NAu-final）。
   - design/18 决定假太后及王屋、雅克萨未具名首领是否建静态 ID 或岗位槽（`chapters/08` 的 O08-03）。给出默认做法并登记；若新建 ID，列出章节需要改用的位置（交 NAu-final）。
   - design/12 §6.7.1、design/17 §2.1.3 补入 `sk_huashandiejinquan07` 的获取途径（华山 L4 或穆人清 / 归辛树认可授艺，禁止从击败中掉落）。`story/07` §8 的对应句由 `NAuF-book-07` 改。
   - 陈家洛在飞狐出场的联动登记：design/18 的 NPC-T01 / T02 计数与索引（`npcs-ch13` 加行、`npcs-ch12` 跨书栏、`story/13` 由书界任务改）。
   - design/18 补胡青牛、王难姑、纪晓芙、杨不悔、陈友谅的正式主记录；NXfixE 交来的"风际中无正式 ID""design/18 人数与索引计数重算"一并处理（以 17 册人物档案实数为准重算）。
   - design/12 把 `q_10_bond_05` 的奖励接成三条 `it_miji_*` 原子发放（资格检查、失败回滚、不重复发，来源行写无毒与隔离条件）。`story/10` §8.6 由 `NAuF-book-10` 改。
   - tech/04 构建器内容校验补齐书界收尾提出的四条：主运外键可解析、禁用四个旧 Buff、禁止尸体掉谱、禁止给每个行动者复制 Boss 血量。
   - design/09 东方不败旧血量 108,000 改为 122,626（NXfixD-05）。
   - design/12 登记任我行掌法、葵花飞针的获取任务与"禁止尸体掉落"。
   - design/09 的录像契约补 `commandPrefix`（Canon V17-08，与 tech/01 / 05 / 08 的 hash 数组一致；三份技术文档若不一致，一并对齐）。
   - tech/04：写明 `--diversity-strict` 与各"只报告"开关何时纳入常态 CI 的现状与条件；登记"正式具名 Boss 固定种子回放夹具 `BattleReplayV1` 尚未落盘"（NAu-rulesA）。
3. **与 21 的一致性**：以 `docs/design/21-meridian-flow-and-moves.md` 现行版与基准现行版为准，核对本写集文档里与经脉运行、招式路线、绝招、擒拿点穴、调息、外放、阴阳性质（AR-18）有关的字段名、ID、结算顺序与数值；不一致的改本写集文档。21 自己的问题列入"交其他任务"。本写集内若残留 AR-18 之前的阴阳口径（如"逆周天为阴"），按 Canon v1.8 与 21 §2.4 改。
4. **不做的事**：不刷新文首引用的基准 / 21 版本号（收口任务统一刷）；不改武学总数（收口任务统一算）。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/balance/projection_sim.py --check`

## 报告

第 7 节写：处理总表（条目 / 文档与位置 / 改前 → 改后 / 状态）；与 21 的一致性核对结果；遗留清单（按严重度）；交其他任务的条目（写明应由哪个兄弟任务或收口任务处理）；需作者确认的事项（逐条附默认值）。
