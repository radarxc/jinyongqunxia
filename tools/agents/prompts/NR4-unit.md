# 本任务：阴阳性质落地 · {{unit_name}}（AR-18 新口径：主修经脉、内功性质、路线性质）

## 背景

- **作者原则（AR-18，原文见 `docs/decisions/author-requirements.md`）**：
  - 内功阴阳按**主修经脉**划分：督脉与手足三阳计阳，任脉与手足三阴计阴。
  - 正逆周天只决定真气的用途，不决定阴阳。
  - 阳性掌法可以经劳宫出招（"气过阴门"），也可以按动作经合谷、后溪、外关出招。
- **已落地的规则（NYY，08ee6b6）**：Canon v1.8，21 §2.4 / §4.3.1（v2.7.2），05 §5.3 / §5.3.1（v1.7.1），15 v1.1，以及检查脚本。
  - **内功性质**：按 `inner.meridians` 所列主修经脉逐脉计票。以下情况取调和：平票、没有阴阳票、只修冲脉 / 带脉、显式写 `[]`。缺这个字段则无法审计。
  - **路线性质**：
    - 出口段只取尾部 1–3 段里命中动作规则的穴位。
    - 其余体段逐节点按 15 的游戏归属经脉计票：任脉计阴，督脉计阳，阴跷 / 阴维计阴，阳跷 / 阳维计阳。
    - 冲脉、带脉默认不投票。平票或体段为空取调和。
  - **作者待确认，先用默认值**：
    - AR-18a：冲脉、带脉不投票。
    - AR-18b：后溪不加入外放 13 端点白名单。
- **查看命中**：`python3 tools/lint/check_skill_catalogs.py --delivery --details <本任务图鉴>` 会列出三类命中：
  - `DELIVERY rule=nature-conflict`：路线性质与武学性质冲突。
  - `INNER_NATURE`：内功声明的性质与按主修经脉推出的性质不一致。
  - `inner_missing_meridians`：内功缺 `inner.meridians`。

本任务的图鉴（只改这些文件）：

{{doc_set}}

主分支实测（37efc33）：{{counts}}

## 要做的事

1. **补主修经脉**：为本单元缺 `inner.meridians` 的内功补上主修经脉。
   - 依据武学卡的描述、原著与门派设定，判断它主修哪些经脉。
   - **不得由现有 `nature` 反推经脉**。补完后，性质按计票结果定。
2. **内功改性质**（`INNER_NATURE` 命中）：
   - 先按卡片描述与原著核对 `inner.meridians` 是否写对。
   - 写对了，就把声明性质改为推出的性质，`nature`、`BreathProfile.nature`、`requiredNature` 与护体档一起改。
   - 若主修经脉写错，改经脉并说明依据。
   - 改性质后，检查本册内依赖该内功性质的路线、招式与条件，一并修正。
3. **路线性质冲突**（`nature-conflict` 命中）：
   - 优先改路线体段，让体段计票与所属武学的性质一致。出招方式与动作末端不变。
   - 改后仍须满足：
     - 21 硬约束（§4.6 / §17.1）；
     - §4.3.1 动作末端规则：掌法末端按 AR-18，可以是劳宫，也可以按动作是合谷、后溪、外关；
     - 不低于建议段数，不缩短；
     - 逐段 CT / 风险列与段数一致；
     - 同门互异；
     - 外放端点白名单；
     - 不与全仓任何路线完全相同，不新造 ≥80% 的相似配对（21 §4.3.4）。
   - 若是武学本身的性质定错了（例如第 2 步改了它所依托的内功性质），可以改武学性质，并说明依据。
4. **本单元额外事项**：{{extra}}
5. **同步**：
   - 每条改过的路线与卡片，都要同步本册的镜像表、说明文字、段数、路线 CT、收招合计、总风险和风险列表。
   - 本册以外受影响的引用（书界章节、人物档案、Boss 配装、其他图鉴）不在本任务写集内，列进报告的"交其他任务"。
6. **通用**：
   - 每次写入不超过约 150 行。
   - 只改相关段落，不删无关内容。调度器会拒绝缩短 15% 以上的修改。
   - 版本行追加"阴阳性质落地 AR-18（{{date}}）"。
   - 不新造 ID。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_nr4_unit.py <本任务图鉴>`：本单元路线性质冲突、内功性质冲突、缺主修经脉都为 0
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict <本任务图鉴>`
- `python3 tools/agents/check_route_unique_for.py <本任务图鉴>`
- `python3 tools/agents/check_undefined_in.py <本任务图鉴>`
- `python3 tools/agents/check_nr3_unit.py {{unit}}`（不新造 ≥80% 相似配对）

## 报告

第 7 节写：
- **补主修经脉清单**：内功 / 补的经脉 / 依据 / 推出的性质；
- **改性质清单**：内功 / 改前 → 改后 / 连带改动（BreathProfile、requiredNature、护体档、路线）；
- **路线改动清单**：路线 / 改前性质计票 → 改后 / 改动的穴位 / 段数、CT、风险是否变化；
- **`--delivery` 三项计数**：改前 / 改后；
- **交其他任务的条目**：本册以外受影响的引用。
