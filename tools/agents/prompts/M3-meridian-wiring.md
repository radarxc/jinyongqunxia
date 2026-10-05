# 本任务：把 `design/21`（经脉运行、招式路线、绝招、擒拿 / 点穴、调息）接线到下游归属文档

M2 / M2.R 已定稿 `design/21` 与参考实现 `tools/balance/meridian_flow_sim.py`，审校结论"有条件通过"，条件之一是**下游 owner 文档同步**（M2.R 报告 §6 表）。基准 v1.3（A4）已登记前缀 `mfr_ / qnl_ / dxl_ / txp_` 与归属。本任务完成接线；不重定义 21 已拥有的规则，只在各 owner 文档中引用、开接口、改冲突处。

## 必读

- `docs/design/21-meridian-flow-and-moves.md` 全文；`tools/agents/reports/M2.R.md` §3、§6、§7。
- `docs/00-canon.md` v1.3 变更记录（M2-P01～P03 落点）。
- 各 owner 文档相关节：`design/04`（Z3 加算来源、TTK 回归）、`design/05`（`MoveDef` 字段、内功、每招 recovery）、`design/06`（标签 `cc.bind`、穴位受封 / 经气迟滞 / 胀损 Buff、Boss 递减、旧封穴迁移）、`design/09`（P1–P8 插入点、CT 与 `Σrec_flat`、调息合并、解穴 / 挣脱 / 旧 `held` 脚本）、`design/13`（压制与动态伤势）、`design/14`（HUD / 经脉页）、`design/15`（战斗投影只读快照接口）、`tech/05`（Core：逐单位状态、唯一 RNG 注入、事务回滚、快照与 Python golden 对拍）。
- `tools/balance/damage_sim.py`、`tools/balance/README.md`（若 04 的 TTK 回归需要加 `routeZ3Bp`，同步脚本与文档表格）。

## 要做的事（逐文档，最小必要改动）

| 文档 | 要改什么 |
|---|---|
| `design/04` | Z3 加算来源新增 `routeZ3Bp`（引用 21 §5 的上限公式），保留钳制；§9 节奏表若受影响按脚本重生；写明 TTK 回归用例 |
| `design/05` | `MoveDef` 增 `meridianRouteRef`（`mfr_*`）与调息档案引用 `txp_*`；内功字段增调息档；§3.5 招式数量规范保持唯一；给出配表要求"基础收招 + 满路线 CT ≤ 2000" |
| `design/06` | 登记受擒 `cc.bind`、穴位受封、经气迟滞 / 胀损（引用 21 的数值）；旧封穴 Buff 的迁移映射；不得与主标签 `bind` 混用；Boss 对 1–8 级限 1 行动、9 级走硬控递减 |
| `design/09` | Z3 前 `commit`；`flowCt` 进 `Σrec_flat`，`rec_eff` 钳 500–2000；合并调息为 1000 CT；解穴 / 挣脱与旧 `held` 脚本衔接；AI 评分项 |
| `design/13` | 提供最终 `effGrade / effLayer` 给 21；临时压制变化不清动态伤势 |
| `design/14` | HUD / 经脉页：路线、瓶颈、迟滞 / 胀损、点穴节点、擒拿级、调息入口（引用 21 §13） |
| `design/15` | 输出逐穴开通 / 通脉、周天、九转的只读快照接口；战斗调息不推进永久成长 |
| `tech/05` | Core：逐单位状态实例、唯一 `battle` RNG 注入、事务回滚、规范快照、与 Python golden 对拍的测试用例与性能预算（M2-O07 建议值） |
| `tools/balance/` | 若 04 §9 表格重生，同步 `damage_sim.py` 与 README；`--check` 必须通过 |

每处改动写"见 `design/21` §x"引用，不复制公式正文；21 已有的编号（`mfr_*` 样本、`qnl/dxl` 1–9 级）原样引用。

## 验收标准

- 上表每一行在对应文档中可 `grep` 到 `design/21` 引用；`design/05` 含 `meridianRouteRef`；`design/06` 含 `cc.bind`；`design/09` 含 `flowCt`。
- `python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`、`python3 tools/lint/check_ids.py --strict` 通过。
- 不改 `design/21` 正文（如发现 21 自身错误，写报告第 6 节）。
- 报告第 6 节列出图鉴逐招填 `meridianRouteRef` 的后续任务需要的规则摘要（那是另一个任务 M4，本任务不改图鉴）。
