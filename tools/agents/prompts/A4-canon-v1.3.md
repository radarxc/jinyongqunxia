# 本任务：基准 v1.3——合入 v1.2 之后累积的提案，并把两项待确认默认转为执行记录

v1.2（A3）之后，F2 终审、F45、C2、F2L/F2x/F2c/F2t/F2d 与 M2/M2.R 又积累了一批基准提案，全部登记在 `docs/decisions/canon-proposals-v1.2.md` 的"v1.2 之后新增"表（状态为"待 v1.3"）以及各任务报告第 5 节。本任务把它们合入 `docs/00-canon.md` v1.3。

## 必读

- `docs/00-canon.md` 全文（尤其文首两版变更记录、§3、§12、§13、§18、§19、§20）。
- `docs/decisions/canon-proposals-v1.2.md` 全文，重点"v1.2 之后新增"表。
- `tools/agents/reports/` 下 `F2.md` §5、`F45.md` §5、`C2.R.md` §5、`F2L.md`/`F2x.md`/`F2c.md`/`F2t.md`/`F2d1.md`/`F2d2.md`/`F2y.md` §5、`M2.md`/`M2.R.md` §5。
- `docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md`（AR-13、AR-14）。
- `docs/design/21-meridian-flow-and-moves.md` §1、§11、§12、§16（前缀与确定性契约的定义处）。
- `docs/design/07-set-system.md` §8.4、§19；`docs/design/20-legacy-inheritance.md` §7.6、§10。

## 要做的事

1. **逐条处理"待 v1.3"提案**（至少覆盖）：
   - M2-P01：§12 登记 `mfr_*`、`qnl_*`、`dxl_*`、`txp_*` 及所有权；`route_*` 仍只归地图；绝招沿用 `MoveDef.ultimate`。
   - M2-P02：§18 登记 `design/21` 的唯一归属（战内经脉动态、路线 / Z3 路线加成、绝招语义补充、擒拿 / 点穴严重度、调息参数），`design/15` 保持战外拓扑与成长归属。
   - M2-P03：§19 / 确定性契约：每个可独立行动单位一份经脉状态实例；`preview` 无副作用；`commit` 由 Core 注入唯一全局 `battle` 流；整数 / bp；固定事件与节点顺序；单位快照不复制 RNG；golden 可回放。
   - C2 SET-P01～03：§20 补 `g_set = floor(median(counted effGrade))`、同 ID 去重、辅运与暂不可施展的已装兵器武学仍计件。
   - F1b/F2L/F2d1：带路线码 `q_*` 与 story 策划源 / 生产 `quest.v1` 的关系（构建后保留同一 ID，草稿 schema 不是第二套 ID）。
   - F2L/F2d1/F2t：`dc_*` 是全仓唯一可引用的策划节点 ID，运行态嵌于唯一父任务 / 阶段。
   - F2t P03：§18 补"传承缓存运行态枚举随传承契约归 `design/20`"（值域由 20 定义，Canon 不复制五值表）。
   - F2c P01 / F2x P03：07 §19 的旧 `set_*` 只是不再可写的弃用映射键；运行态成员只接受 07 §8.4 正式注册表。
   - F2c P02：无名院堂 / 教头 / 弟子群体用组织或设施岗位槽，只有稳定具名人物注册静态 `npc_*`。
   - F2c P03 / F45-P04：05 §14.4 的书界比例是"来源投放验收指标"，不是定义库硬配额。
   - F2x P01 / F45-P01：迁移源、别名、历史提案、非生产夹具与否定式举例不构成活动引用（固化 lint 语义）。
   - F2x P02 / F45-P02：`route_*` 只用于地图路线；剧情路线状态用 `flag_*_route` 或父对象内局部键。
   - F45-P03：规模摘要区分 v1.2 合入快照 920 与终审正式库存 1,138；登记精简素材约 4,200 h、全项目基准 15,740 h（只写"当前估算，随 RD-05 复估"）。
   - 中央迁移表补录（写入 `docs/decisions/rulings-v1.md` §2 重命名表，不写进 Canon 正文）：四个旧短经脉名（见 `design/15`）、五个旧 AOE ID（见 `design/09`）、`npc_ningqiangdao → npc_songqiangdao`。补录前先 `grep -rn` 确认新旧 ID 都存在且新 ID 已定义；补录后 `python3 tools/lint/check_ids.py --strict` 必须仍通过（旧 ID 只出现在裁定表 / 迁移语境的情形不算活动引用）。
2. **两项待确认默认（CP-21 / CP-22 = O-A3-01 / O-A3-02）与 F2-O03**：作者尚未另填决定，按 `author-decisions.md` 的规则继续作为执行默认；在 v1.3 变更记录中把它们标为"执行默认，作者闸门 G3 待确认"，并在 `canon-proposals-v1.3.md` 单列一节"G3 待作者确认项"，写清若作者改选需要同步的文档与迁移动作（来自 F2 §4.2）。**不要**替作者填写决定。
3. **更新 `docs/00-canon.md` 为 v1.3**：版本行改为 `v1.3（{{date}}）`；在 v1.2 变更记录之后追加"变更记录 v1.3"表（列同 v1.2：编号 `V13-NN` / 章节 / 变更 / 来源 / 状态）。基准保持精炼：只放定义与硬规则，细则留在归属文档。
4. **写 `docs/decisions/canon-proposals-v1.3.md`**：全部提案的处理结果表（来源 / 提案 / 处理：采纳、执行默认待确认、不采纳 / 理由），以及"v1.3 之后新增"空表供后续追加。
5. 报告第 6 节按文档分组列出 v1.3 变更需要同步的下游位置（K2、M3、S2 等后续任务会读它）。

## 验收标准

- `canon-proposals-v1.2.md` 中每一条"待 v1.3"提案在 `canon-proposals-v1.3.md` 都有去向；正文与 v1.3 变更记录逐条一致。
- 没有改坏 v1.2 既有定义：用 `git diff HEAD -- docs/00-canon.md` 逐处核对，只允许新增与明确的修订。
- `python3 tools/lint/check_ids.py --strict` 通过（新失败 0）；`python3 tools/balance/damage_sim.py --check` 与 `python3 tools/balance/meridian_flow_sim.py --check` 通过。
- 报告第 5 节为空或只含本任务不采纳的提案（基准任务不再向自己提提案）。
