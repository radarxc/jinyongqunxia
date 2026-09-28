# 本任务：按叙事规则改写跨武学雷同的绝招路线 · {{group_name}}

作者需求 AR-14（原文节选）："高等级武功有多个招式，每个招式对应一段经脉运行"。

NR0 已在 `docs/design/21-meridian-flow-and-moves.md` 写好"绝招路线的叙事规则"，包括三张映射：出招方式 → 终点 / 关键穴位、性质 → 经脉族、门派 → 核心经脉。它还在 `tools/lint/check_skill_catalogs.py` 增加了跨武学多样性检查（`--diversity` / `--diversity-strict`）。开工前先读这两处，再读 `tools/agents/reports/NR0.md` 第 7 节，那里有按册的雷同数据和改法指引。

本组图鉴：

{{doc_set}}

## 要做的事

1. **消除跨武学完全相同的绝招路线。** 运行 `python3 tools/lint/check_skill_catalogs.py --diversity` 与 `--details`，逐组处理"不同武学之间完全相同"的序列：
   - 保留该组中最贴合叙事规则的一条。
   - 其余按规则改写：终点 / 关键穴位体现出招方式，经脉族体现性质，核心段体现门派。
2. **处理高度相似的路线。** 与其他武学共享穴位 ≥80% 的，按规则拉开差异；确有理由相近的（同门派同源武学），在路线备注写明理由。
3. **守住硬约束与已有要求。**
   - 21 的硬约束：1–18 段、单段 40–120 CT、`收招 + 满路线 CT ≤ 2000`、同一路线穴位不重复、穴位在 15 登记。
   - 同门互异：同门共享 ≤50%，且不是轮换或逆序。
   - 外放招式的路线仍须经过 21 §4.4.1.4 的手部端点白名单（M5c 已标记的外放招式不得因此失去外放资格）。
   - 步骤只在文首索引块定义一次。
4. **不改外部可见的东西。** 不改绝招的选择与数量，不改路线 ID，不新增招式。版本行追加"绝招路线叙事化（{{date}}）"。只改相关条目，不删无关内容（调度器拒绝缩短 15% 以上）。
5. {{extra}}

## 检查

以下命令都必须通过，每次写入不超过约 150 行，逐册推进：

- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict`，参数为本组各册的路径，结果须为 0。

## 报告

第 7 节写：

- 按册统计修改前 / 后的三项数字：绝招路线数、不同序列数、最大雷同组的武学数。
- 改写的路线数。
- 保留相近并写明理由的对数。
- 外放招式路线的核对结果。
