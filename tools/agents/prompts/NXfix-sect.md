# 本任务：终审子任务·收尾（门派图鉴）· {{group_name}}

你负责"经脉系统落地（AR-14 / AR-15 / AR-16）最终审计"拆出来的一个并行子任务。审计已按写集拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 7 节"交其他任务"。

背景一览（均已合入，报告在 `tools/agents/reports/<ID>.md`，第 7 节是各自的遗留）：基准 v1.3–v1.5（A4、NA1、M5b）；21 号文档 v2.x（M2、M3、M4、NB3、M5、NR0）；绝招新规则与图鉴补足（M4、NU1–NU4、NU2S、NU5p、NU5a、NU5b）；图鉴一致性（NA2、NL、NL2、NL3）；首领配装与统一口径（NB1–NB4b）；按书补录首领武学（NXB01–NXB14，新武学在 `docs/design/catalog/skills-bulu-NN-*.md`）；外放加持（M5、M5b、M5c1、M5c2）；路线叙事化（NR0、NR1、NR2）；天阶扩容与作者三项决定（NXT）。

作者近两日的决定（原文，已在各任务中执行）："神雕的五绝下限高于金轮，低于五绝杨过"；"'九品玄'的理解：按'玄上'执行"；"绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一"；"不一定一定是专属啊，比如灭绝师太，武学应该显然是峨眉派的武学，主角和其他人也有机会学"；"降龙十八掌，六脉神剑，火焰刀，拈花指，这些都是外放啊。确定一下"；"天阶封闭名单：扩容"；"音功：基础不算外放（音波），但内力深厚对音波的控制强，能量大，所以是外放"；"大手印的跃击：掌风算外放"。

通用要求：每次写入不超过约 150 行；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）；改动的文档版本行 / 变更记录追加"经脉落地终审（{{date}}）"；ID 先 `grep -rn` 查重，不新造无依据的 ID。

本组门派图鉴：

{{doc_set}}

## 要做的事

1. **落实来源扩展**：读全部 14 本补录图鉴 `docs/design/catalog/skills-bulu-*.md` 的"来源扩展登记"表（及 NXB 各报告第 7 节），把目标武学在**本组图鉴**中的条目落实到武学卡上（可得书界加入该书界，写明依据）。不在本组的跳过。注意天阶池上限：`sk_tiezhang`（铁掌，天下 10）加入神雕会成为神雕完整天阶第 17 门——优先按"神雕残承"登记（先例 V11-28），不适用则只作首领配装、不开放给玩家；在报告写明采用哪条（若 `sk_tiezhang` 不在本组，跳过）。
2. **按作者新口径改标外放**（NXT 已写入 21 §4.4.1 并在其报告第 7 节列出逐招清单）：音功——基础音波不算外放，以深厚内力驱动、对音波控制强的音功算外放（按 21 的口径逐招改标，如碧海潮生曲、穿云啸、七弦无形剑、笑傲江湖曲、金笛法等在本组的）；大手印的跃击——掌风算外放，补标，路线收束改为经劳宫。改标的招式同步审计表，路线须经手部端点白名单。
3. **门派图鉴遗留**（本组内的逐条处理）：
   - 九阳神功 `innerGuard.reflectBp:1200` 改为 0 并由层数投影结算（05 §5.10 / D25，倚天册）；
   - 武当截脉手·点环跳（指招）路线改落指端；
   - 29 记绝招不在 21 §4.3 建议段数内且无理由（碧涛玄功·万里、易筋锻骨篇·脱胎由 6 段缩到 5 段）——逐条补理由或调回；
   - 焚天路线偏阴脉与本门阳性不一致，北冥 / 小无相 / 化功 / 龙象 / 乾坤的攻击绝招路线不含任督——按 21 §4.3.1 裁定并改写；
   - 绝招条件加成的加法（`3.00+0.15−0.05`）与乘法（`3.00×(1+0.15)`）两种写法，按 05 §4.2 / §4.8 统一；
   - 康熙册文首索引 `mfr_meirensanzhao_feiyan`、`mfr_fuqidaofa_tongxin` 的用途（defense → attack）核对；
   - 乾隆册 §12.5 QL-O08 行多一格，修正表格；
   - 不同武学间高度相同的路线（如 `mfr_taixuan_shibu` 与 `mfr_shenxing_taxi`）酌情区分。
   - **文首索引与镜像表的 purpose 不一致**（NR1 / NR2 按任务要求没改，见 `tools/agents/reports/NR2.md` §4、§6）：
     - 康熙 2 处：`mfr_hongyingjian_tongxin`、`mfr_mufuhujian_sheshen`；
     - 乾隆 4 处：`mfr_honghuahuiheji_shisidangjia`、`mfr_hujiaquan_quandao`、`mfr_huibuqijian_huifeng`、`mfr_zhangmenboyi_baipai`；
     - 古龙 5 处：`mfr_mingyugong_zhaoye`、`mfr_jiayishengong_liehuo`、`mfr_shenshuineigong_zhongchao`、`mfr_kongquelingfa_shouping`、`mfr_kongquelingfa_kaiping`；
     - 少林约 17 处（自行逐条比对找出）。

     以正文武学卡里该招的实际效果为准，改错的一侧，两边只留一个值。明玉照夜、收屏、拳刀一理的正文是伤害招，索引却写 defense，多半是索引错了。判不清的列入"需作者确认"。
   - **未在 15 号文档登记的穴位 ID**：通行册 `ap_baihui` 1 处、倚天册 `ap_qihai` 1 处，改为 15 中已登记的 ID（NR2 在本组第二批已同类修正 5 处，可参照）。
   - **过期镜像**：少林、道家、通行、倚天约 100 行镜像的模板代号、CT、总风险早已过期。按文首索引的显式路线重算并同步，做法同 NR2：模板代号改为"见文首索引"，重算段数、路线 CT、收招合计、总风险与风险列表。
4. **索引**：本组门派图鉴开头或索引处加一行"本门补录武学见 `skills-bulu-NN-*.md`"（只在确有补录的门派加）。
5. 改路线时守住：21 硬约束、同门互异、外放端点白名单、步骤只定义一次、不低于建议段数、终点合出招方式；改了路线就同步本册镜像表与说明文字。

检查：`python3 tools/lint/check_ids.py --strict`、`python3 -m unittest discover -s tools/lint -p "test_*.py"`、`python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`、`python3 tools/balance/projection_sim.py --check`、`python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict` 加本组各册路径、`python3 tools/agents/check_undefined_in.py` 加本组各册路径 必须通过。

## 报告

第 7 节写：来源扩展落实清单（逐条）、改标外放清单、遗留处理表、交其他任务的条目。
