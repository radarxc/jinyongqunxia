# NAu-tech 报告 · 终审·技术文档（tech/01 / 04 / 05 / 08）

## 1. 摘要（3–6 行）

已完成四份技术文档的经脉落地终审，统一数据构建、Core 状态 / 查询、外放结算与 replay 运输契约。
`tech/04` 已接正式补录图鉴扫描、MF-V04b / V04c、动作末端报告及 NB3 首领配装硬门；地位下限兜底只准离线估算，生产构建阻断。
`tech/01` / `05` 已统一 `ultimateBySkill`、候选过滤、F2 / E2 时钟、`query.moveAvailability` 与两段式 `projectionStep`；`tech/05` 另落实音功 0 档特判。
`tech/08` 已保证外放档进入命令、录像及 hash，并禁止持久化范围 / 命中格等派生集合。严格 ID 检查、105 项 lint 单测及 `git diff --check` 均通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/tech/01-architecture.md` | 1,822 | §3.2.1、§3.6–§3.6.1：绝招临时态、统一候选查询、F2 / E2；§8.3：协议 2 hash 与 `commandPrefix` |
| `docs/tech/04-data-pipeline.md` | 1,952 | §1–§2：`skills-bulu-*` 正式扫描；§5.4 / §5.8：路线、动作末端、Boss 硬门；§11.2：最终机器回填口径 |
| `docs/tech/05-gameplay-engine.md` | 2,368 | §6.5、§7.3–§8.3：候选、绝招时钟、外放与音功；§11.2：模块端口；§14–§15：录像和测试 |
| `docs/tech/08-backend-and-online.md` | 3,013 | §3.5.1、§10.2、§10.4：命令档、NDJSON、hash 与重放推导边界 |
| `tools/agents/reports/NAu-tech.md` | 102 | 结论、开放项、基准提案、处理总表与交接清单 |

四份技术文档均已升级版本并追加“经脉落地终审（2026-09-29）”；没有新增游戏内容 ID。

## 3. 关键结论与数值

- Boss 生产闸门按 `design/21` §11.9.1：武学型 Boss 必须恰好 `1` 主运 + `2` 辅运、`3–5` 门外功、至少 `1` 门外功 `grade≥G`；若主要身份横跨两类外功，则至少 `2` 门 `grade≥G`。显式弱 Boss / 傀儡 / 武学型机关只可降低目标值；纯非武学机关 / 环境才整体豁免。
- “地位下限兜底 / 缺专属主运”选择 **error 并阻断生产构建**。理由是天阶已经决定扩容，只有七参估值而无合法主运 `sk_*` 外键时，引用、调息、路线与同源性均不可验证；仅 `boss_pacing.py` 的 `estimateOnly=true` 可读取作节奏比较。
- MF-V04b：同门任意两条绝招路线共享穴位 `≤floor(min(lenA,lenB)/2)`；同序、循环、逆序或逆序循环均失败。MF-V04c：跨武学有序序列完全相同失败；`overlapBp=floor(10000×|A∩B|/min(|A|,|B|))≥8000` 时必须给共同底子及动作差异理由，否则人工复核失败并阻断发布。
- 外放档固定为 `projectionStep=0/1/2`，射程增量 `0/2/4`，额外耗内 `0/200/400 bp × MPREF`。`skill` 与 `dual.a/b` 各自保留档位，不得提升成整条 plan 共用字段。
- 音功是唯一 0 档特判：`sonic && projection` 的 0 档令 `projectionBoostActive=false`，使用基础范围、零外放增耗和普通 Z5M；1 / 2 档才启用外放范围、成本及 `projectedAttackMultBp`。静态 `DamageKind='projected'` 不变，护体内劲仍按 40% 适用。非音功外放 0 档仍走外放曲线。
- 绝招候选固定顺序为自身 CD → 同门共享冷却 → 同招重复 → 路线硬封。F2 原子支付并设置 `ultimateCooldown=1 / lastUltimateMoveId / freshTurnToken`；E2 只减 S 段已有且非 fresh 的共享冷却。
- 协议 2 摘要域统一为 `["tianshu:battle-replay:v1",appBuild,coreVersion,rulesProtocol,rngProtocol,contentHash,runtimeMartialArts,commandPrefix,session]`。`commandPrefix` 只含截至采样点的已接受记录按 `seq` 排序后投影出的规范 `command` 载荷，排除 `afterHash` 等运输字段，既避免自引用，也使 `projectionStep` 直接进入 hash；录像、checkpoint 与遥测不保存推导格集合。
- 本工作副本最终检查：111 个文件、60,902 次 ID 出现、13,753 个定义；基线内未定义 `sk_babuganchan` 仍为 1，新增 strict failure 为 0，冲突定义 / 近似名 / 废弃 ID / 套装不对称均为 0。该数值不是并行分支合并后的最终债务数。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 当前处置 |
|---|---|---|
| `NAu-tech-O01` | NXT 的 Canon v1.6、AR-17 与 `design/21` v2.5 尚未合入当前工作副本 | 合并后以 v2.5 为上游；在此之前本文按作者明确决定实现执行契约，但不宣称上游已闭合 |
| `NAu-tech-O02` | `design/09` 的 `ultimateBySkill` 示例缺少 `freshTurnToken` | 运行时必须保留该字段并按 F2 / E2 契约执行；由归属任务补示例 |
| `NAu-tech-O03` | `design/21` 仍把地位下限兜底写成可进入首领表的过渡例外 | 默认仅允许 `boss_pacing.py` 输出 `estimateOnly=true` 的节奏估算；生产 importer 遇标记即以 `TS-CONTENT-BOSS-021` 阻断 |
| `NAu-tech-O04` | 动作末端何时从报告升级为生产硬门 | `NAu-lint --delivery` 先只报告，不改变现有 `--strict`；全仓缺口清零并明确升门后再阻断 |
| `NAu-tech-O05` | 每 10 条命令写一次中间 hash 是否保留 | 维持现有【建议值】；最终 hash 必须保留，采样频率由 `tech/08` 实测决定 |
| `NAu-tech-O06` | 合并后全仓 ID / 路线 / 动作末端债务数 | 不用本工作副本数字代填；由 `NAu-final` 在全部并行写集合并后运行机器检查并回填 `tech/04` §11.2 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| `NAu-tech-P01` | 在 Canon 确认 `skills-bulu-NN-*.md` 与门派册同为正式武学定义源，并要求构建器扫描完整 `skills-*.md` glob | 补录武学、招式、路线与调息档案不能被遗漏，也不能依赖手工白名单；NXT v1.6 已有 `V16-04`，待合入 |
| `NAu-tech-P02` | 在 Canon / 21 明确地位下限兜底只供节奏估算，不得充当生产主运外键 | 天阶已扩容；继续允许兜底进入发布 IR 会形成与武学图鉴并列的第二事实源，且无法证明七参、路线和调息同源 |
| `NAu-tech-P03` | 在确定性契约固定 `commandPrefix` 为协议 2 replay hash 输入 | 只哈希结算后 session 不能保证不同 `projectionStep` 在恰巧导出同态时仍有不同摘要；直接哈希规范已接受命令最清楚 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/00-canon.md` | §13、§18、§19 | 合入 NXT v1.6 的天阶扩容、补录册正式归属及 AR-17；补 `commandPrefix` hash 域和兜底仅估算的生产边界 |
| `docs/decisions/author-requirements.md` | AR-17 | 合入作者关于天阶扩容、音功 1 档起外放、大手印掌风外放的正式记录 |
| `docs/design/09-combat-system.md` | §13.1 / `ultimateBySkill` 示例、录像契约 | 给示例补 `freshTurnToken`；与三份技术文档统一 `commandPrefix` hash 域 |
| `docs/design/21-meridian-flow-and-moves.md` | §4.3.1、§4.4.1、§11.9.1、协议 / 校验节 | 合入 NXT v2.5；把地位兜底与生产构建阻断边界写清；同步 hash 域（若 21 保留摘要定义） |
| `docs/design/catalog/skills-*.md` | 音功、大手印逐招与动作端点 | NXfix 按 v2.5 逐招改标；人声音功允许天突 / 廉泉，乐器音功仍走手腕导引；大手印只把掌风伤害段标外放 |
| `tools/lint/check_skill_catalogs.py` | `--delivery` / 多样性模式 | 保持 `--delivery` 只报告；合并后验证 MF-V04b / V04c、动作末端和音功端点，不在本任务修改脚本 |
| `docs/tech/09-*` / 实现任务 | 发布与兼容闸门 | 把 hash 域变化视为协议契约变更，保留旧 runner，新增只改档位即改变 hash 的跨引擎 fixture |
| `TODO.md` | 终审汇总 | 登记本报告的开放项、基准提案和 `NAu-final` 最终机器回填责任 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 处理总表

| 来源 | 条目 | 目标节 | 状态 |
|---|---|---|---|
| 任务 / NB3 | Boss `1+2` 内功、`3–5` 外功、`≥G`、跨两类至少两门 `≥G` 及例外 | `tech/04` §5.4、§5.8 | ✅ 已逐字收口 |
| NXB04-P02 / 作者天阶扩容决定 | 地位下限兜底不得代替主运外键 | `tech/04` §5.4、§5.8 | ✅ 选择生产 error；仅 `estimateOnly=true` 可估算 |
| NXB01–NXB14 / Canon 登记 | 正式扫描按书补录册 | `tech/04` §1.3–§2.5、§11 | ✅ `skills-*.md` 全 glob 覆盖十四册 |
| NR0 / `design/21` v2.4 | MF-V04b / MF-V04c | `tech/04` §5.4、§5.8、§11 | ✅ 同门与跨武学规则、8000 bp 理由门均已接入 |
| `design/21` §4.3.1 / AR-17 / NAu-lint | 动作末端专项检查、音功端点与开关 | `tech/04` §5.4、§11 | ✅ 人声天突 / 廉泉、持乐器手腕导引已入契约；`--delivery` 只报告，未擅自改变 `--strict` |
| `design/09` | `ultimateBySkill`、统一候选过滤、查询 DTO、F2 / E2 | `tech/01` §3.6–§3.6.1；`tech/05` §3.3、§7.3–§7.4 | ✅ 已统一；09 示例缺字段另交接 |
| AR-16 | `projectProjection`、外放档、两段命令 | `tech/01` §3.6；`tech/05` §6.5、§7.4、§8.3、§11.2 | ✅ skill 与 dual.a/b 独立保存 / 计费 / 重验 |
| 作者 AR-17 / NXT | 音功 1 档起生效、0 档兼容、大手印掌风 | `tech/05` §6.5、§7.4、§8.3、§11.2、§15 | ✅ 引擎契约已接；⚠️ 大手印逐招和上游 v2.5 待写集外合入 |
| 任务 | `projectionStep` 进入 replay / hash，不保存派生格 | `tech/01` §8.3；`tech/05` §14；`tech/08` §10.2、§10.4 | ✅ 三文档统一 `commandPrefix` 域 |
| 任务 | `tech/04` §11 债务数口径 | `tech/04` §11.2 | ✅ 明确由 `NAu-final` 合并后机器回填，不伪造最终数 |

### 7.2 交其他任务

| 交接对象 | 条目 | 状态 / 验收 |
|---|---|---|
| NXT / 合并调度 | 合入 Canon v1.6、AR-17、`design/21` v2.5 | ⚠️ 当前分支尚未含这些上游文件；合入后重跑全套检查 |
| `design/09` 归属任务 | `ultimateBySkill` 示例补 `freshTurnToken` | ⚠️ 正文时序已有，示例字段缺失 |
| `design/21` 归属任务 | 将地位下限兜底明确限制为估算输入，生产构建不得接受 | ⚠️ 当前 v2.4 / NXT v2.5 仍保留过渡表述 |
| NXfix | 音功逐招与大手印掌风改标，并补对应路线端点 | ⚠️ 技术消费者已就绪，内容事实仍待合入 |
| NAu-lint | 复核人声天突 / 廉泉、持乐器手腕导引，以及通用动作末端报告 | ⚠️ 并行脚本已有开关；须以合并后内容跑最终结果 |
| NAu-final | 回填 `tech/04` §11.2 的最终债务计数，统一跨文档 hash 域 | ⚠️ 必须在全部并行写集合并后执行 |

### 7.3 验收逐条自检

- ✅ 仅修改许可写集内四份技术文档和本报告；未修改 Canon、09、21、TODO 或 lint 脚本。
- ✅ 四份技术文档均保留“项 / 内容”表头、TL;DR 与文末“参考资料 / 本文新增术语 / 待决事项”结构；旧待决条目未删除。
- ✅ 每次补丁均低于约 150 行；除任务清单文件名 `TODO.md` 的正常引用外，全文未发现 `TODO`、`此处省略`、`待补充` 占位，Markdown 表格与代码块未见截断。
- ✅ 未新增内容 ID；`python3 tools/lint/check_ids.py --strict` 退出 0：已知基线未定义 1、新增严格失败 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：105 tests，全部通过。
- ✅ `git diff --check`：通过。
- ✅ 未执行任何改变仓库状态的 git 命令。
- ⚠️ 当前工作副本不是并行任务合并后的最终树；AR-17 上游、图鉴改标与最终债务数按 §7.2 交接，未虚报完成。
