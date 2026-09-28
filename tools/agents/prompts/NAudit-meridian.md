# 本任务：经脉系统落地的一致性审计（作者需求 AR-14 收尾）

`docs/design/21-meridian-flow-and-moves.md` v2.0（经脉河流模型、招式路线、绝招、擒拿 / 点穴、调息、经脉独立乘区、防守路线、内劲抵消拳脚、经脉影响速度、经脉模拟模块）已由并行任务落地：基准 v1.3（A4）、04 与伤害模拟（N04）、05（N05）、06（N06）、09 与 08（N09）、15 与 03（N15）、13 与 14（N1314）、tech/05 / 04 / 03（Ntech）、武学图鉴四组（NC1–NC4）、书界 Boss 两组（NCh1、NCh2）。你是这一轮的最后一道关卡，可以修改 `docs/` 下任何文档、`tools/lint/`、`tools/balance/` 与 `TODO.md`。

## 要做的事

1. **收拢遗留**：读上述 15 个任务的报告（`tools/agents/reports/<ID>.md`）第 7 节，落实其中的小改与"交其他组 / 交审计"的条目；需要整节重写的列入遗留。
   已知必做：N06 登记了新 Buff（`bf_shouqin` 受擒、`bf_xueweishoufeng` 穴位受封、`bf_jingqizhizhi`、`bf_jingmaizhangsun`、`bf_hutineijin`）并给出旧 ID 迁移表——把 05、09、10、武学图鉴与书界中仍在运行时引用 `bf_fengxue` / `bf_fengnei` / `bf_fengjingmai` / `bf_chanrao` 的地方改为新状态加等级（旧 ID 只保留在迁移表与兼容说明里），并按 06 的迁移表核对效果预算；21 §9.6 的 `acupointId` 改为 `acupointRef`；九阳等缺失的调息档案（`txp_*`）按 21 的规则补登记。
2. **回填 21**：把 06 正式登记的 Buff ID、05 的字段名、基准 v1.3 的乘区与前缀编号回填到 21（替换"拟新增"写法），并更新 21 §18.6 同步清单的状态（已落实 / 遗留）。
3. **跨文档一致**：21 与 04 / 05 / 06 / 08 / 09 / 13 / 14 / 15 / 03 / tech / 武学图鉴 / 书界 的字段名、ID、结算顺序、数值一致；抽查每个武学图鉴至少 5 门天 / 地阶武学的路线与绝招是否符合 21 的规则（段数、收招 + 满路线 CT ≤ 上限、攻 / 防 / 速度路线）；抽查每部书界 1 个 Boss 的经脉配置与节奏。
4. **检查全部通过**：`python3 tools/lint/check_ids.py --strict`（必要时按全量扫描刷新基线并在 tech/04 §11 记录债务数）、`python3 -m unittest tools/lint/test_check_ids.py`、`python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`。
5. **需求状态**：更新 `TODO.md` §7.1 的 AR-14 行（写明覆盖章节与剩余缺口）与 `docs/README.md` 的相关条目（行数实测、摘要）。

## 报告

第 7 节写：处理总表（来源报告 / 条目 / 目标 / 状态）、跨文档一致性核对结果、各检查结果、遗留清单（按严重度，需作者拍板的附默认值）。
