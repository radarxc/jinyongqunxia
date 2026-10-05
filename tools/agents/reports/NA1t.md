# NA1t 报告 · 审计第一段：经脉系统与绝招新规则的技术文档同步（tech/01 / 04 / 05 / 08 / 09）

## 1. 摘要（3–6 行）

已把 `design/21` v2.1 与 M4 绝招新规则同步到五份技术文档，覆盖架构状态边界、构建校验、战斗轮换态、录像兼容和路线图门禁。
绝招静态规则统一以 `MoveDef.ultimate` 为唯一真值；战斗临时态只进入当前 `BattleState`、协议 2 录像和同进程 checkpoint，不写持久角色存档。
本任务只更新规划文档，没有实现生产 validator、TypeScript runner 或真机性能采集；这些债务均已保留为阻断项。
指定 ID lint 与 56 项单元测试通过；经脉、伤害模拟和 Markdown / diff 完整性检查也通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 最终行数 | 主要更新 |
|---|---:|---|
| `docs/tech/01-architecture.md` | 1780 | §3.2.1、§3.6、§8.3：`meridianByUnit`、单一 battle RNG、零副作用预估、协议 2 hash 域 |
| `docs/tech/04-data-pipeline.md` | 1908 | §2.5、§3.5、§5.4、§5.8、§11：绝招 / 路线 / 轻功 / Boss 构建门与 Canon v1.3 追溯 |
| `docs/tech/05-gameplay-engine.md` | 2294 | §3.3、§7.3–§7.4、§14–§15：绝招轮换临时态、递减时点、`cdMinus` 隔离与重放确定性 |
| `docs/tech/08-backend-and-online.md` | 3010 | §3.5.1、§10.2：存档 / 录像版本轴、协议 2 经脉态及旧 runner 边界 |
| `docs/tech/09-roadmap.md` | 1072 | P0 / P1、§9–§10：TS runner、跨引擎 golden、三机七项 P95 门禁 |
| `tools/agents/reports/NA1t.md` | 98 | 本报告：结论、开放问题、基准提案、跨文档同步与验收自检 |

五份技术文档合计净变更为 `+122/-47` 行；均为净增长，未触发“缩短 15%”风险。

## 3. 关键结论与数值

| 主题 | 结论 / 核算 |
|---|---|
| 十二品绝招配额 | grade 1..12 = `0/0/0/0/0/1/1/1–2/2/2/2–3/3`；按绝对 grade 查表，不按大阶合并 |
| 解锁与唯一真值 | 第一 / 第二 / 第三绝招依次在 7 / 9 / 10 重；`MoveDef.ultimate` 是唯一玩法真值，`route.ultimate === MoveDef.ultimate` 仅作 V-M01 断言 |
| 路线硬门 | 每绝招恰一独立 `mfr_*`；同门绝招不得共用路线 ID，规范化穴位序列不得完全相同；单路线穴位不得重复 |
| 路线时长 | `fullRouteCt = Σsteps.segmentCt`，且 `MoveDef.recovery + fullRouteCt ≤ 2000` |
| 轻功 | 无主动招时 normalize 生成本门局部基础移动 `MoveDef`；不新建全局招式 ID，未生成或引用不闭合即拒绝构建 |
| Boss 配装 | 每个 Boss 为 1 主运 + 2 辅运 + 3–5 外功；禁止 `1/1/harmony` 静默回退；最终口径只认 `design/21` §11.9 |
| 绝招轮换态 | 每单位、每门武学保存 `ultimateCooldown:0|1`、`lastUltimateMoveId`、`freshTurnToken`；设置行动不递减，下一次自身正常行动 E2 清零，额外行动不递减 |
| 连用与减 CD | 同门共享冷却且同一绝招不得连续；同门普通招解除重复限制，其他武学不解除；降龙 `cdMinus` 只减 `MoveDef.cd`，不减共享冷却 |
| 协议与 hash | `rulesProtocol=2`、`rngProtocol=1`、`meridian-flow-state.v1`；hash 域为 `["tianshu:battle-replay:v1",appBuild,coreVersion,rulesProtocol,rngProtocol,contentHash,runtimeMartialArts,session]` |
| 固定 golden | `fixtureVersion=2`，`masterSeed=20260927`，`vectorSha256=af33dcd10dc196e18811fe485870666ab139c03a17342fa47113ecc19552cd76` |
| 三机七项 P95 | commit / 攻防护体 / 速度 / preview / AI 12 路线 / tick / snapshot 分别 ≤ `0.25/0.08/0.05/0.15/2.00/0.50/1.50 ms`，均为【建议值】【待实测】；三机分别至少 3 轮，不得跨机平均 |

## 4. 开放问题（附默认值）

1. **Boss 上游口径尚待 NB3 定稿**：当前 `design/21` §11.9 尚未完整写出 1 / 2 / 3–5 配装及禁用静默回退。默认：技术闸门先按本任务明示口径登记；NB3 完成后只同步引用和夹具，不在 `tech/04` 另立规则。
2. **生产实现尚不存在**：本文新增的是技术契约，不等于 validator、TS runner 已交付。默认：P1 M1 前必须实现并转绿，缺任一实现即阻断签出。
3. **三机七项尚未实测**：默认：全部按未通过处理；作者主力手机、中端 Android、iPad 各至少 3 轮留存原始样本后才可改写状态。
4. **Canon 尚未直接登记 M4 绝招配额与轮换规则**：默认：继续引用唯一归属 `design/05`，不把技术文档提升为设计真值，并提交 §5 两项基准提案。
5. **grade 6 的显示阶名追溯未闭合**：`design/05` 仍保留“九品玄 / 玄上”关系问题。默认：构建器只按数值 grade 6 执行一记绝招配额，不用显示名推导规则。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NA1t-P01 | 在 Canon §4 / §8 登记十二品绝招配额、7 / 9 / 10 重解锁接口，以及 `MoveDef.ultimate` 为唯一真值 | 这是跨数据、构建、运行时和 UI 的稳定规则；仅留在 `design/05` 会让协议消费者缺少基准级入口 |
| NA1t-P02 | 在 Canon §8 登记共享气势、同门共享 1 次自身正常行动冷却、禁止连续使用同一绝招；明确招式 `cdMinus` 不作用于共享冷却 | 避免玩法引擎、AI、录像与展示层各自解释轮换时点，保证协议 2 重放一致 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 工件 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/21-meridian-flow-and-moves.md` | 历史提案文字、§11.9 | 清除“拟登记 / 待 Canon v1.3”旧措辞；由 NB3 把 Boss 1 主运 + 2 辅运 + 3–5 外功和禁用 `1/1/harmony` 静默回退正式写入 §11.9 |
| `docs/design/09-combat-system.md` | 行动时序、AI 候选 | 接入绝招共享冷却的 E2 递减时点、同招重复过滤、预检失败不启动冷却及 AI 候选过滤 |
| `docs/design/14-ui-ux-mobile.md` | 战斗招式区 | 展示全部已解锁绝招、共享冷却和“同一绝招不可连续”的禁用原因 |
| `docs/tech/03-mobile-performance.md` | §2.3.1、§8.4 | 用三机实测确认或修订七项 P95 建议值，保存逐机原始证据；未实测前不得宣称通过 |
| `docs/design/05-martial-arts-system.md` | grade 6 开放追溯 | 明确“九品玄 / 玄上”的命名关系；数值规则继续以 grade 6 为准 |
| `TODO.md` | §2–§5 | 由调度器登记 NA1t 完成、NA1t-P01/P02、NB3 上游债务、生产实现和真机取证状态 |
| 生产实现与 CI | content validator、core、TS runner、Node / WebKit、真机 bench | 实现本文契约；现阶段只有文档和 Python oracle，不得把本报告视为生产代码或性能验收 |

## 7. 自检

### 7.1 处理总表

| 来源 | 条目 | 目标文档与节 | 状态 |
|---|---|---|---|
| Ntech §6 / `design/21` | 每单位经脉实例、单一 battle RNG、预估零副作用、协议 2 hash 域 | `tech/01` §3.2.1、§3.6、§8.3 | ✅ 已同步 |
| M4 / `design/05` | 十二品配额、7 / 9 / 10 重、`MoveDef.ultimate` 唯一真值与 V-M01 | `tech/04` §3.5、§5.4 | ✅ 已同步 |
| M4 / `design/21` | 一招一路、路线 ID / 穴位序列不复用、穴位不重复、总 CT ≤2000 | `tech/04` §5.4、§5.8、§11 | ✅ 已同步 |
| Ntech §6 / NC2 | 无主动招轻功生成本门局部基础移动招 | `tech/04` §3.5、§5.4 | ✅ 契约已同步；⚠️ 生产构建器待实现 |
| 任务明示 / NB3 边界 | Boss 1 / 2 / 3–5 配装与禁静默回退 | `tech/04` §3.5、§5.4、§5.8 | ✅ 技术门已登记；⚠️ 等 NB3 定稿 §11.9 |
| Canon v1.3 V13-05 / V13-07 | 移除 `provisionalPrefixOwner` 与“尚待 v1.3”旧口径 | `tech/04` §2.5、MF-V12、O6 | ✅ 已解决并保留追溯 |
| M4 | `ultimateCooldown`、`lastUltimateMoveId`、战内生命周期与确定性 | `tech/05` §3.3、§7.3–§7.4、§14–§15 | ✅ 已同步 |
| M4 | 降龙 `cdMinus` 不减共享冷却 | `tech/05` §7.4、§15 | ✅ 已同步 |
| Ntech §6 / `design/21` | `rulesProtocol=2` 与 `meridian-flow-state.v1` 版本登记 | `tech/08` §3.5.1、§10.2 | ✅ 已同步 |
| Ntech §6 | TypeScript runner 与固定 golden 全字段跨引擎对拍 | `tech/09` P0 / P1、§3、§9–§10 | ✅ 路线图已登记；⚠️ 实现待 P1 |
| Ntech §6 / `design/21` | 三机七项性能预算门禁 | `tech/09` §3.5、§9.2、RD-05A | ✅ 门禁已登记；⚠️ 数值待实测 |

### 7.2 仍需其他文档配合

⚠️ 未闭环项为：NB3 修订 `design/21` §11.9、`design/09` 行动 / AI、`design/14` UI、`tech/03` 三机取证、`design/05` grade 6 命名、Canon 两项提案及调度器更新 `TODO.md`；逐项内容见 §4–§6。

### 7.3 验收标准逐项核对

- ✅ 只修改允许的五份技术文档并新建本报告；未修改 Canon、TODO、设计文档、脚本或其他报告。
- ✅ 五文档版本行 / 变更记录已追加，技术文档仍以“项 / 内容”表开头、随后为 TL;DR，文末章节顺序未破坏。
- ✅ 规则按唯一归属引用；关键配额、解锁层、CT 算式、状态生命周期、协议号、hash 域与黄金 SHA 均已落文。
- ✅ 保留既有待决追溯；Canon v1.3 已解决项改写为“已解决”，没有删除历史条目。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过：扫描 96 文件、52540 次出现、12064 定义；仅基线既有 `docs/README.md` 的 `sk_babuganchan` 未定义，strict new = 0。
- ✅ `python3 -m unittest tools/lint/test_check_ids.py` 通过：56 tests，OK。
- ✅ 额外验证：`meridian_flow_sim.py --check` 通过；`damage_sim.py --check` 为 46/46、known deviations 0；`git diff --check` 通过。
- ✅ 五文档代码围栏计数均为偶数，目录与正文可闭合；未新增任何占位文本。
- ⚠️ 本任务是文档同步，不包含生产 validator / TS runner / Node-WebKit CI / 真机性能实现；这些项目仍按 §4、§6、§7.2 阻断后续签出。
