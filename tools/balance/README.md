# 伤害平衡模拟器

`damage_sim.py` 是 `docs/design/04-damage-formula.md` 的标准库参考实现，用于复现十四书界的静态伤害节奏，并检查基准 §5 的硬区间。脚本兼容 Python 3.9+，不依赖第三方包，也不写文件。

## 用法

从仓库根目录运行：

```bash
python3 tools/balance/damage_sim.py --report
python3 tools/balance/damage_sim.py --check
```

- `--report` 向标准输出生成 Markdown：十四书界 × 普通/精英/Boss，共 42 行；每行同时包含主角→敌人和敌人→主角的命中次数、行动轮、命中率与代表招式耗内比例。其完整输出（含 `### 9.3` 汇总标题）就是 `docs/design/04-damage-formula.md` §9.2 起的生成段。
- `--check` 检查普通敌人双方击杀命中数、普通/精英/Boss 轮数、普通招式耗内，以及 `ρ(Δ)` / 有效抗性、护体、破盾倍率、以气御伤、过量伤害、治疗、Z0 硬开关与几何覆写、Z4、概率、多段威力、DOT 的 `bypassShield`、撞击和坠落等公式不变量；另覆盖合法普通装备锚点、经脉三档静态面板、三档 × 三内劲比 × 42 遭遇回归、确定性触发回放，以及 21 v2.0 的 Z4M / Z5M 顺序、同档零漂移、五档 TTK、经脉闪避和护体内劲守恒。全部通过时退出码为 0，否则列出失败项并返回 1。

只检查退出码：

```bash
python3 tools/balance/damage_sim.py --check >/dev/null
echo $?
```

当前预期为 `All 46 checks passed; known deviations: 0.`。

## 模型口径

模拟器使用解析期望，不使用随机抽样，因此同一版本在所有运行中输出一致。实际战斗的 Z10 浮动仍应从 `battle` RNG 流按整数 9500–10500 bp 抽取；报表使用均值 10000 bp。

| 模型输入 | 来源 | 代码位置 |
|---|---|---|
| 品阶系数 `G(g)` | `docs/00-canon.md` §4 | `GRADE_BP` |
| 十四书界境界、武运、难度、等级上限和超限 Boss | `docs/design/02-timeline-and-world-tiers.md` §2.1、§3.1 | `CHAPTERS` |
| 洪安通 `hpMax ×0.75` 专属覆盖 | `docs/design/03-attributes.md` §10.9 | `BOSS_HP_OVERRIDE_BP` |
| `STD(L)`、面板曲线、参考品阶/层数 | `docs/design/03-attributes.md` §3.1、§3.5 | `level_curves`、`g_main`、`g_ref`、`layer_ref`、`player_std`；玩家普通武器/装备使用 `min(grade,9)`，内功和敌模板不截断 |
| 敌人模板与 `enemyStatMul` | `docs/design/03-attributes.md` §10 | `TEMPLATE`、`enemy_std` |
| 治疗效果（含 `0.5×med`） | `docs/design/03-attributes.md` §4.7 | `_sheet`、`healing` |
| `P_ref` 与境界系数 | `docs/design/03-attributes.md` §3.5；裁定 C01 | `TIER_TAU_BP`、`p_ref_bp` |
| 内功贡献预算 | `docs/design/05-martial-arts-system.md` §5.5 | `INNER_BUDGET` |
| 普通招式耗内 | `docs/design/05-martial-arts-system.md` §4.2 | `MP_COST_BP` |
| 经脉三档静态总账与触发边界 | `docs/design/15-meridians-and-acupoints.md` §6–§8 | `MERIDIAN_PROFILES`、`MeridianTriggerReplay`；`none/turn0/turn9` |
| 战斗经脉乘区、闪避与护体内劲 | `docs/design/21-meridian-flow-and-moves.md` §3.5、§4.4、§4.8–§4.9 | 导入 `meridian_flow_sim.py` 的 Profile 与纯函数；标准档 10000 bp |
| Z1–Z10、护体/以气御伤结算与遭遇校准 | `docs/design/04-damage-formula.md` §2–§9 | 文件顶部常量及对应函数 |
| `ρ(Δ)`、有效抗性、DOT/HOT 与模板比例系数 | `docs/design/03-attributes.md` §6.3；`docs/design/06-buff-system.md` §3.5.0、§5.3.2、§11 | `rho_bp`、`effective_resistance_bp`、`effect_chance_bp`、`dot_damage` |
| 坠落 | `docs/design/08-terrain-and-qinggong.md` §5.3 | `fall_damage` |
| Boss 四人队输出口径 | `docs/design/03-attributes.md` §10.8 | `PARTY_HIT_EQUIVALENTS` |

`ENCOUNTER_DURABILITY_BP` 与 `TEMPLATE_ATTACK_BUDGET_BP` 是伤害文档 §9.1 的遭遇层校准。前者只改变节奏评估所用的有效耐久，后者只改变模板敌人代表普攻；两者不修改角色面板，也不用于具名 `full` NPC。所有百分比常量使用 bp（10000 = 100%），注释标出来源章节。

`effect_chance_bp` 与 `dot_damage` 可接收已经计算好的 `res_eff_bp`；若传原始抗性，必须改用命名参数并同时提供 `resistance_bp`、`effect_grade`、`resistance_grade`，由脚本先执行完整的 `ρ(Δ) → res_eff` 链路。两种入口混用或遗漏任一原始参数都会抛出 `ValueError`。`DamageTrace` 承载 Z1–Z10 及 Z4M / Z5M；`Settlement` 另承载 `damageBeforeMpGuard`、护体内劲结果、既有护体与代扣结果。DOT/环境跳伤通过 `settle_periodic(..., bypass_shield=...)` 明确选择是否绕过护体，默认不启用护体内劲。

## 修改数值后的重跑流程

### 修改 `design/03` 的属性或敌人模板后

1. 将等级曲线、`STD` 配装、内功预算或敌人模板的变动同步到脚本顶部常量及 `_sheet` / `enemy_std`。
2. 先核对锚点。例如当前 `player_std(35)` 应得 `hpMax=7176`、`mpMax=4697`；`player_std(70)` 应得 `hpMax=40409`、`mpMax=28887`。
3. 运行 `--check`。若失败，先判断是上游属性变化还是伤害常数问题；不要同时改多个乘区来掩盖偏差。
4. 运行 `--report`，用完整输出替换伤害文档 §9.2，并同步 §9.3 的范围。

### 修改 `design/05` 的品阶、层数或耗内后

1. `L(n)` 或 `G×L×power` 口径变化时更新 `layer_bp` / `standard_attack`；C01 要求 `P_ref` 仍只除一次。
2. 内功标准预算变化时更新 `INNER_BUDGET`；普通招式耗内变化时更新 `MP_COST_BP`。
3. 外来压制仍先由 02 得出 `g_eff/layer_eff`，不要在伤害公式中重复减品阶。
4. 依次运行 `--check` 与 `--report`，再更新文档生成表。

## 调参原则

优先保持 Z0–Z10 的语义稳定。若节奏偏离：

1. 全等级、全模板同向偏离，检查 `DAMAGE_SCALE_BP`；
2. 防御成长造成偏离，检查 `DEFENSE_K_BP` 与 03 的攻防比；
3. 仅某个敌人模板偏离，检查 03 模板与遭遇耐久；
4. 仅某一境界偏离，检查 `τ`、外来压制和境界级校准；
5. 仅具名 Boss 偏离，应在章节/09 的遭遇配置修正，不污染全局公式。

每次调参后必须保留 `--check` 为退出码 0。若设计确需偏离，按任务约束在检查代码与伤害文档同时登记具体对象、数值和理由；当前没有已知偏差。

## 经脉联调

`damage_sim.py` 直接复用同目录 `meridian_flow_sim.py` 的标准化 Profile 和纯函数，避免复制 21 的曲线。调用 `damage_pipeline` 时可传双方 Profile、攻击路线长度与可选防守路线长度；不传则双方为标准档、攻击 2 段、无防守路线，因此旧报表严格零漂移。`settle_direct` 只有在 `inner_guard_enabled=True` 时才于护盾后启用护体内劲，并将内劲耗内后的余额交给 `mpGuard`。

经脉规则或 golden 变更后应连续运行：

```bash
python3 tools/balance/meridian_flow_sim.py --check
python3 tools/balance/damage_sim.py --check
```

五档伤害锚点固定使用 10 段攻击路线，与 `design/21` §14.9 一致；不要把普通攻击默认 2 段误用于该隔离回归。
