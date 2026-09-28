# 本任务：经脉系统落地的一致性审计（作者需求 AR-14 收尾）

`docs/design/21-meridian-flow-and-moves.md` v2.0（经脉河流模型、招式路线、绝招、擒拿 / 点穴、调息、经脉独立乘区、防守路线、内劲抵消拳脚、经脉影响速度、经脉模拟模块）已由并行任务落地：基准 v1.3（A4）、04 与伤害模拟（N04）、05（N05）、06（N06）、09 与 08（N09）、15 与 03（N15）、13 与 14（N1314）、tech/05 / 04 / 03（Ntech）、武学图鉴四组（NC1–NC4）、书界 Boss 两组（NCh1、NCh2）。你是这一轮的最后一道关卡，可以修改 `docs/` 下任何文档、`tools/lint/`、`tools/balance/` 与 `TODO.md`。

## 要做的事

1. **收拢遗留**：读上述 15 个任务的报告（`tools/agents/reports/<ID>.md`）第 7 节，落实其中的小改与"交其他组 / 交审计"的条目；需要整节重写的列入遗留。
   已知必做：N06 登记了新 Buff（`bf_shouqin` 受擒、`bf_xueweishoufeng` 穴位受封、`bf_jingqizhizhi`、`bf_jingmaizhangsun`、`bf_hutineijin`）并给出旧 ID 迁移表——把 05、09、10、武学图鉴与书界中仍在运行时引用 `bf_fengxue` / `bf_fengnei` / `bf_fengjingmai` / `bf_chanrao` 的地方改为新状态加等级（旧 ID 只保留在迁移表与兼容说明里），并按 06 的迁移表核对效果预算；21 §9.6 的 `acupointId` 改为 `acupointRef`；九阳等缺失的调息档案（`txp_*`）按 21 的规则补登记。
   另两类共性遗留：①各落地任务的工作区早于基准 v1.3（A4）合入，文档与报告中"尚待 Canon v1.3 登记 / 待基准采纳"的提法（如 04 §13.3、tech/04 §2.5 与开放问题 O6 的 `provisionalPrefixOwner`）已过时，改为引用 v1.3 对应条目（V13-xx）；②Ntech 报告第 6 节列出的 tech/01（meridianByUnit、单一 battle 随机流注入、预估零副作用、协议 2 的 hash 域）、tech/08（存档 / 录像版本表登记 rulesProtocol=2 与 meridian-flow-state.v1）、tech/09（路线图纳入 TS runner、黄金数据对拍、三机七项预算门禁）的小改。
   **归属细化（必须先做，否则 strict 不通过）**：基准 v1.3 把 `mfr_` / `qnl_` / `dxl_` / `txp_` 的定义只归 21，但武学图鉴组（NC1–NC4）为具体武学登记了路线 `mfr_*` 与调息档案 `txp_*`（NC4 合入后主分支 `check_ids.py --strict` 报 36 个 `txp_*` 未定义）。按"21 定义模式、共享模板与示例；武学图鉴定义具体武学的路线与调息档案实例"细化归属：在基准 v1.3 §12 / §18 作最小澄清（写进变更记录，标为 v1.3 澄清，不改规则实质），同步 `tools/lint/check_ids.py` 的归属表（允许武学图鉴定义这两类实例）并补测试；核对同一 ID 不在 21 与图鉴重复定义。完成后 strict 必须通过。已验证的修法（NC3 监督代理在副本中试过，353 → 0，且无重复定义）：脚本里 `mfr_` / `txp_` 的归属除 21 外加入 `docs/design/catalog/skills-*.md`，**并且**在表格定义识别中把这些表头认作 ID 列——`路线 id`、`movementRouteRef`、`breathProfileRef`、`BreathProfile.id`（以四组图鉴实际表头为准，逐一核对）；两处缺一不可。另：21 §12.3 的 TS `BreathProfile` 接口缺 `outOfBattleScaleBp`（YAML 已有），补上。
2. **回填 21**：把 06 正式登记的 Buff ID、05 的字段名、基准 v1.3 的乘区与前缀编号回填到 21（替换"拟新增"写法），并更新 21 §18.6 同步清单的状态（已落实 / 遗留）。
3. **跨文档一致**：21 与 04 / 05 / 06 / 08 / 09 / 13 / 14 / 15 / 03 / tech / 武学图鉴 / 书界 的字段名、ID、结算顺序、数值一致；抽查每个武学图鉴至少 5 门天 / 地阶武学的路线与绝招是否符合 21 的规则（段数、收招 + 满路线 CT ≤ 上限、攻 / 防 / 速度路线）；抽查每部书界 1 个 Boss 的经脉配置与节奏。
4. **检查全部通过**：`python3 tools/lint/check_ids.py --strict`（必要时按全量扫描刷新基线并在 tech/04 §11 记录债务数）、`python3 -m unittest tools/lint/test_check_ids.py`、`python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`。
5. **需求状态**：更新 `TODO.md` §7.1 的 AR-14 行（写明覆盖章节与剩余缺口）与 `docs/README.md` 的相关条目（行数实测、摘要）。

## 报告

第 7 节写：处理总表（来源报告 / 条目 / 目标 / 状态）、跨文档一致性核对结果、各检查结果、遗留清单（按严重度，需作者拍板的附默认值）。
