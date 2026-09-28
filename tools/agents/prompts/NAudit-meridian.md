# 本任务：经脉系统落地的一致性审计（作者需求 AR-14 收尾）

`docs/design/21-meridian-flow-and-moves.md` v2.0（经脉河流模型、招式路线、绝招、擒拿 / 点穴、调息、经脉独立乘区、防守路线、内劲抵消拳脚、经脉影响速度、经脉模拟模块）已由并行任务落地：基准 v1.3（A4）、首领 / Boss 配装补全（NB1、NB2）、绝招数量新规则（M4：天 2–3、地 1–2、玄上 1）、ID 检查脚本修正（NL）、各图鉴绝招补足（NU1–NU4）、04 与伤害模拟（N04）、05（N05）、06（N06）、09 与 08（N09）、15 与 03（N15）、13 与 14（N1314）、tech/05 / 04 / 03（Ntech）、武学图鉴四组（NC1–NC4）、书界 Boss 两组（NCh1、NCh2）。你是这一轮的最后一道关卡，可以修改 `docs/` 下任何文档、`tools/lint/`、`tools/balance/` 与 `TODO.md`。

## 要做的事

1. **收拢遗留**：读上述 15 个任务的报告（`tools/agents/reports/<ID>.md`）第 7 节，落实其中的小改与"交其他组 / 交审计"的条目；需要整节重写的列入遗留。
   已知必做：N06 登记了新 Buff（`bf_shouqin` 受擒、`bf_xueweishoufeng` 穴位受封、`bf_jingqizhizhi`、`bf_jingmaizhangsun`、`bf_hutineijin`）并给出旧 ID 迁移表——把 05、09、10、武学图鉴与书界中仍在运行时引用 `bf_fengxue` / `bf_fengnei` / `bf_fengjingmai` / `bf_chanrao` 的地方改为新状态加等级（旧 ID 只保留在迁移表与兼容说明里），并按 06 的迁移表核对效果预算；21 §9.6 的 `acupointId` 改为 `acupointRef`；九阳等缺失的调息档案（`txp_*`）按 21 的规则补登记。
   另两类共性遗留：①各落地任务的工作区早于基准 v1.3（A4）合入，文档与报告中"尚待 Canon v1.3 登记 / 待基准采纳"的提法（如 04 §13.3、tech/04 §2.5 与开放问题 O6 的 `provisionalPrefixOwner`）已过时，改为引用 v1.3 对应条目（V13-xx）；②Ntech 报告第 6 节列出的 tech/01（meridianByUnit、单一 battle 随机流注入、预估零副作用、协议 2 的 hash 域）、tech/08（存档 / 录像版本表登记 rulesProtocol=2 与 meridian-flow-state.v1）、tech/09（路线图纳入 TS runner、黄金数据对拍、三机七项预算门禁）的小改。
   **归属细化（检查脚本已由 NL 修正，合入 `ecec287`）**：NL 已在 `tools/lint/check_ids.py` 中把 `mfr_` / `txp_` 的定义来源设为 21 与 `docs/design/catalog/skills-*.md` 两层（`qnl_` / `dxl_` 仍只归 21），按 NC1 / NC3 / NC4 的实际表头识别 ID 列（`路线 id`、`movementRouteRef`、`breathProfileRef`、`BreathProfile.id`，以及 NC1 图鉴内的复合列 `内功 → 调息档案`），同一 ID 同时在 21 与图鉴中定义报"所有权冲突"，只写 `mfr_<招式ID去掉mv_>` 派生约定而未显式列出的路线仍报未定义；单元测试 56 项通过，主分支 strict 未定义数 404 → 2。你还要做：① 在基准 v1.3 §12 / §18 写最小澄清（"21 定义模式、共享模板与示例；武学图鉴定义具体武学的路线与调息档案实例"，写进变更记录、标为 v1.3 澄清、不改规则实质）——NL 只改了脚本；② NL 运行时 NC2（五绝 / 逍遥）尚未合入、其表头未被覆盖：NC2 合入后重跑 strict，若它用了新的 ID 列表头，按实际写法扩展脚本并补测试（或让 NC2 的表头与上面几种统一）；③ 逐招路线统一为显式列出（脚本不放行隐式派生），NC1 的派生写法改为显式列表，或在报告说明保留理由；④ `docs/design/catalog/skills-daojia.md` 约第 2035 行的 `mfr_xiantiangong_gangqi` 只有派生示例、没有显式定义，是当前 strict 唯一失败项，补显式定义或改引用；⑤ 21 §12.3 的 TS `BreathProfile` 接口缺 `outOfBattleScaleBp`（YAML 已有），补上；各图鉴 `txp_*` 统一带这个字段。
   **Boss 经脉强度回退（NCh2 报告 §8，高优先）**：书界 08–14 有 25 个 Boss 单位因章节配装没写主运内功，被回退为 `1/1/harmony`，经脉强度远低于当界标准，玩家标准配装对它们不再是"标准对标准"（白马、鸳鸯、书剑、飞狐的 Boss 可能降到约 10–11 轮，低于 12）。作者随后给出规则（原文）："首领没写主运内功时，按照门派、来源西给配一两个符合级别的内功（以及两三个玄/黄级别的基础内功），boss需要有两到三个内功，以及几个安身立命的外功（拳法，剑法，刀法等）。"——NB1 / NB2 已按此为十四书界的首领 / Boss 补全配装；你负责把这条规则登记为 `docs/decisions/author-requirements.md` 新条目 AR-15（原文照录 + 解读与默认值 + 归属与影响），写入 21 §11.9 的首领默认配置，并核对 03 / 09 / 18 的敌人模板与人物档案是否需要引用；用 `tools/balance/meridian_flow_sim.py` 与 `damage_sim.py --report` 复核这些 Boss 的节奏落在 12–25；鹿鼎、雪山在弱一档包络约 26 / 27 轮，写明拉回机制（如阶段破绽、弃地利）或列为发布阻断。NCh2 为 5 名 Boss 新配的主运内功（含胡斐 `sk_hujiadaoxinfa`）是原创扩展，列入需作者确认。
2. **回填 21**：把 06 正式登记的 Buff ID、05 的字段名、基准 v1.3 的乘区与前缀编号回填到 21（替换"拟新增"写法），并更新 21 §18.6 同步清单的状态（已落实 / 遗留）。
3. **跨文档一致**：21 与 04 / 05 / 06 / 08 / 09 / 13 / 14 / 15 / 03 / tech / 武学图鉴 / 书界 的字段名、ID、结算顺序、数值一致；抽查每个武学图鉴至少 5 门天 / 地 / 玄上武学的绝招数量是否符合新规则（天 2–3、地 1–2、玄上 1、玄中 / 玄下 / 黄 0），以及路线与绝招是否符合 21 的规则（段数、收招 + 满路线 CT ≤ 上限、攻 / 防 / 速度路线）；抽查每部书界 1 个 Boss 的经脉配置与节奏。
4. **检查全部通过**：`python3 tools/lint/check_ids.py --strict`（必要时按全量扫描刷新基线并在 tech/04 §11 记录债务数）、`python3 -m unittest tools/lint/test_check_ids.py`、`python3 tools/balance/damage_sim.py --check`、`python3 tools/balance/meridian_flow_sim.py --check`。
5. **需求状态**：更新 `TODO.md` §7.1 的 AR-14 行（写明覆盖章节与剩余缺口）与 `docs/README.md` 的相关条目（行数实测、摘要）。

## 报告

第 7 节写：处理总表（来源报告 / 条目 / 目标 / 状态）、跨文档一致性核对结果、各检查结果、遗留清单（按严重度，需作者拍板的附默认值）。
