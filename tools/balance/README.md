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

AR-16 接入后的当前预期为 `All 47 checks passed; known deviations: 0.`；新增的一项只验证外放在唯一 Z5M 的中性与取整，原有 46 项仍全部通过。

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
| 外放范围档与专用 Z5M | `docs/design/21-meridian-flow-and-moves.md` §4.4.1 | `projection_sim.py`；`damage_pipeline(projected=True)` 仅替换普通 Z5M 曲线 |
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

`meridian_flow_sim.py` 同时维护两条明确分离的验证路径：

- `meridian_flow_golden.json` 是 `fixtureVersion=2 / rulesProtocol=2 / rngProtocol=1` 的迁移前录像，只由 Core 的 `legacy-protocol2-replay.ts` 回放；它不证明生产 runtime 正确。
- `meridian_flow_golden_v3.json` 是 `fixtureVersion=3 / rulesProtocol=3 / rngProtocol=2` 的生产门禁。Python 以独立的 fluxCap 1–64、逐 tick 管线实现生成，Core 测试直接构造 `MeridianFlowRuntime`，并对路线 trace、质量、CT、四单位隔离和 battle RNG 状态逐字段比较。曲线、护体、速度、控制投影、归一化和五档 TTK 也由生产函数对拍。
- v3 工件中的 `breath.supportedByProductionRuntime=false` 是显式缺口记录：Python 保留设计参考向量，当前 Core 尚无 `regulateBreath`，测试不得把该字段假装成已覆盖。防守和移动路线可推进、预览，但生产提交入口仍只接受攻击路线。

常态验证只读两份工件：

```bash
python3 tools/balance/meridian_flow_sim.py --check
pnpm --filter @tianshu/core test
```

只有规则变更经过评审后，人工执行一次下列命令重录 **v3**；它不会覆盖旧 v2 文件。提交前必须把新 `vectorSha256` 同步到生产 golden 测试的硬锁常量。CI 禁止调用写入模式。

```bash
python3 tools/balance/meridian_flow_sim.py --write-golden
python3 tools/balance/meridian_flow_sim.py --check
```

经脉规则或 golden 变更后应连续运行：

```bash
python3 tools/balance/meridian_flow_sim.py --check
python3 tools/balance/damage_sim.py --check
```

五档伤害锚点固定使用 10 段攻击路线，与 `design/21` §14.9 一致；不要把普通攻击默认 2 段误用于该隔离回归。

## 外放加持参考实现

`projection_sim.py` 复用 `meridian_flow_sim.py` 的 `MeridianProfile`、经脉强度、速度与路线兑现函数，负责 AR-16 的 0 / 1 / 2 范围档、0 / 2% / 4% `MPREF` 额外耗内，以及外放招式在唯一 Z5M 使用的专用曲线。它只输出已经审核的范围档标签，不枚举六角格；实际几何归 `design/09`。

```bash
python3 tools/balance/projection_sim.py --check
python3 tools/balance/projection_sim.py --report
```

- `--check` 固定标准对标准中性、随修为单调、6500–22000 bp 与射程 +4 / 范围 +2 档硬顶、扩张耗内取整，以及弹指神通、独孤九剑剑气招、降龙十八掌三个作者示例。
- `--report` 输出三个示例在标准 / 高 / 顶尖修为下的射程、范围档与 Z5M；示例是跨文档对拍夹具，不代替图鉴正式逐招配置。
- `damage_sim.py` 的 `damage_pipeline(projected=False)` 为兼容默认；传 `projected=True` 时只在 D5 后改用 `projected_attack_mult_bp`，仍只生成一个 `z5m`。`resolve_direct(projection=True, damage_kind='projected')` 对应新 `MoveDef`；两个输入保持独立，因为旧内容可能已有外放伤害通道却还没有逐招新标记，不能反向自动获得威力曲线。运行时会拒绝“新标记为真但伤害通道非 `projected`”的非法组合。

联调时依次运行：

```bash
python3 tools/balance/meridian_flow_sim.py --check
python3 tools/balance/projection_sim.py --check
python3 tools/balance/damage_sim.py --check
python3 tools/balance/boss_pacing.py --check
```

## 逐单位 Boss / 精英节奏估算

`boss_pacing.py` 以当界标准玩家为对手，复用上述两个脚本的模板轮数与经脉纯函数；输入七项参数及血量 / 防御倍率，输出 `estimatedRounds` 和留余量的 `recommendedMultiplierToWindow`。直接传参：

```bash
python3 tools/balance/boss_pacing.py --chapter 2 --kind boss \
  --name 欧阳锋 --eff-grade 10 --eff-layer 9 --inner-nature yin \
  --hp-multiplier 1 --defense-multiplier 1
```

批量输入可为单对象、对象数组或 `{"units":[...]}`；字段示例为 `chapter`、`kind`、`effGrade`、`effLayer`、`mpRatioBp`、`practiceBp`、`capacityScaleBp`、`innerNature`、`openPolicy`、`milestones`、`hpMultiplier`、`defenseMultiplier`：

```bash
python3 tools/balance/boss_pacing.py --json /tmp/boss-units.json
python3 tools/balance/boss_pacing.py --report --json /tmp/boss-units.json
python3 tools/balance/boss_pacing.py --check
```

Boss / 精英窗口分别为 12–25 / 6–10 轮。超窗时优先把血量与防御倍率乘积调到工具推荐值或用阶段机制减总耐久，不得压低主运经脉；多人战按整场总耐久 / 目标计。静态估算不模拟路线风险与行动表，生产仍须固定 RNG 回放。

### 稳定报告与书界数值引用

`--report` 输出 `schema="tianshu.boss-pacing.report"`、`schemaVersion=1` 的 JSON 对象；未传该开关时保留原 JSON 数组输出。直接参数和 `--json` 批量输入均可用，`--report` 与 `--check` 互斥。报告保持输入顺序，键排序、UTF-8 字符、两空格缩进及结尾换行固定，无时间戳或机器绝对路径；同一代码和输入重复运行可逐字节比较。`sourceSha256` 登记四个模型源文件的摘要，代码或注释变化都会改变摘要，便于追溯版本。

每条 `units` 包含完整已解析 `input`（含七参、里程碑、攻防路线段数与两个耐久倍率）、原样 `result`、两位小数 `estimatedRoundsDisplay` 及 `windowStatus=below/within/above`。其中 `input` 可单独保存后作为 `--json` 输入复算；不能把整个报告直接当成输入。顶层与各结果都带 `estimateOnly=true`。

书界引用数值金标准时按以下约定比较，不能用四舍五入后的表格数值推导是否过窗：

| 对拍对象 | 规则 | 依据 / 边界 |
|---|---|---|
| 整数 bp、布尔字段 | 精确相等 | 经脉整数模型保持原值 |
| 原始浮点结果 | `abs(a-b) ≤ max(1e-9, 1e-12×max(abs(a),abs(b)))` | 仅对拍同一模型和输入的计算结果；不是平衡误差预算 |
| 文档两位小数轮数 | 与 `estimatedRoundsDisplay` 字符串一致 | 按十进制 `ROUND_HALF_UP`；显示舍入误差至多 `0.005` 轮，`18.9149609→18.91`、`18.915→18.92` |
| Boss / 精英过窗 | 用未舍入的 `estimatedRounds` 比较闭区间 `[12,25]` / `[6,10]` | 容差不扩大窗口；例如 `25.004` 显示 `25.00` 仍是 `above` |

报告只包裹 `design/21` §11.9.2 的既有 `R0×10000²/(A×D)×H` 模型，没有新增乘区、调参或修改推荐倍率。代表路线假设合法且完全完成；`practiceBp` 只留作审计，静态模型不处理风险 / RNG、实际行动顺序、调息、辅运贡献或具名整场回放。书界采用 error 级静态数值对拍时应保存完整输入与源摘要，再按上述容差比较；生产节奏仍以固定 RNG 回放验收。

## 常态 CI 与只报告项

截至 2026-09-30，四个规定 `--check` 均通过，`damage_sim.py` 为 47 项、已知偏差 0；`boss_pacing.py --check` 还覆盖报告输入往返、稳定序列化、十进制舍入及两类窗口上下边界。当前任务只验证命令，没有修改写集外的 CI 配置。

| 命令 / 模式 | 当前性质 | 纳入常态 CI 的条件 |
|---|---|---|
| `damage_sim.py --check` | 严格退出码门禁；公式与 42 遭遇模板回归 | 可立即作为必过命令；上游数值变更时先同步归属文档，再有据更新模型 |
| `meridian_flow_sim.py --check` | 严格退出码门禁；整数曲线、性质与 golden 回归 | 可立即作为必过命令；不得刷新 golden 来掩盖未裁定变更 |
| `boss_pacing.py --check` | 严格退出码门禁；中性、回拉公式及报告契约回归 | 可立即作为必过命令；不等于自动扫描书界所有具名单位 |
| `projection_sim.py --check` | 严格退出码门禁；外放范围、耗内与唯一 Z5M | 可立即作为必过命令；图鉴逐招合规由 lint 与生产构建另验 |
| `damage_sim.py --report`、`projection_sim.py --report` | 只报告，供文档生成 / 对拍 | 可保存 CI 产物；需要版本化输入与明确比较规则后才可追加数值门禁 |
| `boss_pacing.py` 默认 / `--report` | 只报告；即使 `windowStatus=above` 也退出 0 | 收口任务维护逐单位完整夹具、来源和例外后，可独立按容差对拍；完整节奏须有 `BattleReplayV1` |

四项 `--check` 的“通过”只证明工具内的既定回归通过；不会把文档里的生产阻断、待实测回放或图鉴债务自动清零。
