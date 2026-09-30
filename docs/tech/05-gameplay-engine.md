# tech/05 · 玩法引擎（Gameplay Engine）

| 项 | 内容 |
|---|---|
| 文档 | `docs/tech/05-gameplay-engine.md` |
| 版本 | v1.7（经脉落地终审（2026-09-30）：AR-18 派生与正式回放缺口）；v1.6（经脉落地终审：NXT 音功判定点与大手印单伤害段同步，2026-09-29）；v1.5（经脉落地终审：音功 0 档特判与外放执行契约，2026-09-29）；v1.4（AR-16 外放预估、原子支付与回放同步；绝招候选时序对齐，2026-09-28）；v1.3（经脉 v2.1 与绝招轮换同步，2026-09-27）；v1.2（跨文档同步，2026-09-26）；全局审计（2026-09-26）；经脉系统落地（2026-09-27） |
| 作者需求覆盖 | `docs/decisions/author-requirements.md` AR-03（冲穴）、AR-04（统一大地图与时代图层）、AR-05（资源与家丁）、AR-06（营生职位）、AR-07（门派职级与月钱）、AR-09（NPC 与跨书界同伴）、AR-12（六角战棋）、AR-13（跨年代传承）、AR-14（经脉运行、路线、绝招与擒拿点穴）、AR-16（外放范围与威力加持）、AR-17（音功 1 档起外放与大手印掌风外放） |
| 上游基准 | `docs/00-canon.md` v1.6 §3–§5（成长、数值、节奏）、§8–§10（战斗、外放、伤害乘区、Buff）、§12（ID）、§18（唯一归属）、§19（技术基线） |
| 强依赖 | `tech/01` §3、§6、§8.3（架构、运行时、确定性 D1–D9）；`tech/03` §2、§6、§8（性能与 Worker）；`tech/04` §3、§5–§8（schema、经脉 / 外放配表、书界包、Ink 桥）；`tech/08` §3、§10（TSAV、迁移与录像）；`design/04`（Z0–Z10）；`design/05`（武学与外放静态字段）；`design/06` §2、§4–§6（Buff DSL）；`design/08`（地形）；`design/09` §2–§8、§13（战斗、范围与候选）；`design/11`（开放世界、时代层与世界时钟）；`design/12`（任务、门派流程）；`design/13`（成长与规则开关）；`design/15`（永久经脉与穴位）；`design/16`（资源与营生）；`design/17`（门派名录）；`design/18`（NPC/同伴）；`design/19`（全国地图）；`design/20`（跨年代传承）；`design/21` §4.4.1、§11–§12（战斗经脉、招式路线、控制、外放与音功分档） |
| 下游 | `apps/game` 的 `CoreHost`；`packages/ui`、`packages/render` 的只读投影与事件消费；`tools/balance`；`tech/09` 路线图 |
| 读者 | 作者本人（单人开发）＋ AI 编码助手 |
| 本文职责 | `packages/core` 的纯 TypeScript、无 DOM、确定性内部设计：状态、命令事务、探索 tick、六角格、战斗、伤害执行器、Buff/任务 DSL 运行时、AI、存档状态、录像与测试 |
| 引用而不重定义 | 数值公式、武学内容、Buff 语义、地形规则、战斗平衡、任务剧情、NPC 事实、存档容器分别归上述设计/技术文档；本文只固定实现契约、执行顺序与确定性护栏 |
| 标注约定 | **（待核实）**版本/API/限额未联网确认；**（待实测）**需真机或真账号验证；**【建议值】**等待上游定稿替换；**（原创扩展）**仅在涉及玩法内容提案时使用 |
| 本次变更 | 经脉落地终审（2026-09-30）：复核 `commandPrefix` 与 `tech/01/08` 同域，接入 AR-18 共享出口 / 体段派生、秘籍奖励事务测试及具名 Boss `BattleReplayV1` 未落盘登记。保留 2026-09-29 的 F0 音功判定、`voice` 与大手印单伤害段同步记录 |

> **结论先行（TL;DR）**
>
> 1. `packages/core` 是同步、纯 TypeScript、无 DOM 的唯一玩法权威。依赖只能是 `shared ← data ← core`；UI、渲染、平台与 Worker 只能发可序列化命令、调用纯查询、消费领域事件，不能直接写状态或重算规则。
> 2. `GameState` 是单一、版本化、纯 JSON 状态树。生产环境在一个命令事务内原地更新并用写入日志回滚；命令成功才一次性递增 `meta.stateVersion`、提交 RNG 和事件。外部只拿深只读快照或裁剪投影。
> 3. 更新模型固定为 **Command → validate → apply → DomainEvent[] → 新状态**。拒绝的命令不改状态、不消耗 RNG、不产生领域事件；表现事件不是事实，不能参与下一次结算。
> 4. 确定性逐位沿用 `tech/01` D1–D9：固定 `sfc32 + splitmix32`、五条随机流、整数/10000 bp、固定取整点、全序遍历、禁墙钟与实现近似数学函数。区间整数使用 `floor(next/2^32×span)`，概率使用 `next%10000<bp`；每次调用均推进一次所属随机流。
> 5. 探索逻辑终值为 **10 Hz，即 100 ms/tick**；页面后台、暂停、对话停时均不补跑。世界日历只由已提交 tick 推进。正式换算沿用 `design/11` §6.1：10 tick/游戏分钟、600 tick/游戏小时、1200 tick/时辰、14400 tick/日，即实时 2 分钟/时辰、24 分钟/日。
> 6. 战斗使用 AR-12 的 pointy-top 六角轴坐标。距离、六邻 A*、LOS、点/环/面/扇形模板均以整数和固定枚举序实现；全国导航坐标、区域六角坐标、战场局部坐标是三个不同坐标域。
> 7. 战斗首轮严格按有效轻功全序排列，之后使用 `design/09` 的事件驱动 CT；行动含移动与一个动作，运劲和道具都是正式动作。反应为 FIFO，嵌套深度最多 3，并继承来源位集阻断反震/转移/镜返/反击递归。
> 8. 伤害执行器逐字实现 `design/04` 的 Z0–Z10，并按 `design/21` §4.4 在 Z4 / Z5 后分别接 Z4M / Z5M：每区只在规定边界取整；护体内劲位于护体真气后、`mpGuard` 前，输出保留 `damageBeforeMpGuard`。
> 9. Buff 构建为受限字节码，接入59 hooks/50原语；按 priority/iid 派发，复用 scratch。零临时容器是派发性能目标，BigInt/事件仍有分配。叠加、互斥、驱散与 ρ(Δ) 引用 design/06。
> 10. 每个可独立武学行动单位拥有一个 `MeridianFlowModule`；只读模板基底可共享，节点动态态绝不共享。模块不持有 RNG，只有成功命令由 Core 注入唯一 `tx.rng('battle')`；`preview` 不改状态、不抽数、不泄露未来 roll。
> 11. 任务 DSL、Ink、经营、门派、永久经脉与传承都只能产生意图，再由 core 校验；运行态逐项消费 `design/12`、`15`、`16`、`20`、`21` 的正式 schema 与事务规则，不在 core 重定义玩法。传承调度只用 `qiyu` RNG，阶段、材料、收据与 RNG 同事务。
> 12. 当前周目跨书界永久状态包括冲穴/周天/九转与同伴履历；新周目仍按 `design/13` 重置其运行态，只保留账号级里程碑。资源点归属、普通库存、家丁、营生职位和当前门派身份默认随书眠清除；跨书同伴按 `design/18` 做健在判定，以离队快照为下限合并后世新增能力。
> 13. AI 采用09的 Utility AI，Boss 用阶段状态机约束。固定工作预算和5/15/40/80ms调度预算并用，2倍超时取当前最优；AI选择可随设备变化，录像记录最终命令，core重放结果不变。
> 14. 存档复用 `tech/08` 的 TSAV v1；`rulesProtocol=2` 的录像/检查点把按 `unitIndex` 排序的 `meridian-flow-state.v1` 与唯一四字 `battleRng` 一起纳入规范 hash，并与 Python golden 逐字段对拍。
> 15. MVP 先交付单线程 core、六角战斗、伤害/Buff、任务基本式、存读档与录像；AI Worker、复杂世界周期以及经脉 / 经营 / 传承量产按 `tech/09` 阶段门和基线实测递进。
> 16. 绝招轮换只存在于当前战斗：每单位、每门已装配武学记录 `ultimateCooldown: 0|1` 与 `lastUltimateMoveId`，战后丢弃且不写持久 `SkillState`；录像 / 内存检查点把它们纳入协议 2 状态哈希，降龙 `cdMinus` 只减招式自身 CD。
> 17. AR-16 外放在 F0 由同一可用性查询冻结 `projectionStep`、射程、范围、额外耗内与 Profile 版本；预估零写入 / 零 RNG，F2 才与原招成本原子支付。命令、AI 候选、录像与 hash 都携带所选档；Z5M 只在既有位置二选一执行一次。
> 18. AR-17 只给“深厚内力驱动且可主动控制伤敌音波”的招式静态外放资格；音功 0 档仍是基础音波（基础范围、零外放增耗、普通 Z5M），1 / 2 档才激活外放。静态 `DamageKind='projected'` 与护体内劲 40% 适用率暂不动态切换。
> 19. `mv_dashouyin_dashouyin` 先执行非伤害跃迁，再于落点生成唯一掌风伤害段；只有掌风段走 `projected`、同一次外放 Z5M 与原 attack 路线，跃迁不产生第二伤害段、第二 Z5M 或第二路线提交。

---

## 目录

- [0. 关键决策一览](#0-关键决策一览)
- [1. 目标、边界与依赖](#1-目标边界与依赖)
- [2. packages/core 模块划分](#2-packagescore-模块划分)
- [3. GameState、快照与事务](#3-gamestate快照与事务)
- [4. 确定性、随机数与规范哈希](#4-确定性随机数与规范哈希)
- [5. 世界 tick、时代图层与探索](#5-世界-tick时代图层与探索)
- [6. 六角格、构网、寻路、LOS 与范围](#6-六角格构网寻路los-与范围)
- [7. 战斗时间轴、行动与反应](#7-战斗时间轴行动与反应)
- [8. Z0–Z10 伤害管线](#8-z0z10-伤害管线)
- [9. Buff DSL 编译与运行时](#9-buff-dsl-编译与运行时)
- [10. 任务 DSL、旗标与 Ink 桥](#10-任务-dsl旗标与-ink-桥)
- [11. 经脉、资源、营生与门派运行时](#11-经脉资源营生与门派运行时)
- [11.2 战斗经脉模拟模块](#112-战斗经脉模拟模块)
- [11.7 跨年代传承运行时](#117-跨年代传承运行时)
- [12. NPC、同伴与年代状态](#12-npc同伴与年代状态)
- [13. Utility AI 与 Worker](#13-utility-ai-与-worker)
- [14. 存档、迁移、录像与重放](#14-存档迁移录像与重放)
- [15. 测试与 CI](#15-测试与-ci)
- [16. 性能预算与观测](#16-性能预算与观测)
- [17. MVP、演进与风险](#17-mvp演进与风险)
- [参考资料](#参考资料)
- [本文新增术语/约定](#本文新增术语约定)
- [待决事项 / 依赖](#待决事项--依赖)

---

## 0. 关键决策一览

| # | 决策 | 结论 | 主要依据 |
|---|---|---|---|
| E-01 | core 形态 | 同步纯函数边界；主线程默认、可整体迁 Worker；无 DOM/网络/存储/渲染 | `tech/01` §3.6–§3.7 |
| E-02 | 状态写法 | 单一 JSON 树；事务内原地写 + journal 回滚；外部深只读 | 本文 §3 |
| E-03 | 更新协议 | 可序列化 Command → 领域事件；拒绝零副作用 | 本文 §3.4 |
| E-04 | RNG | `sfc32`，`splitmix32` 派生五流；抽样与调用消费量逐位沿用上游 | `tech/01` §8.3；本文 §4.2 |
| E-05 | 数值 | 安全整数 + 10000 bp；跨乘区用瞬时 BigInt 保精确，状态不存 BigInt | `design/04`；本文 §4.3 |
| E-06 | 状态哈希 | 规范 JSON UTF-8 → SHA-256；墙钟/表现/缓存不入哈希 | `tech/04` §8；`tech/08` §3 |
| E-07 | 探索 tick | 10 Hz；不补后台时间；1200 tick/时辰、14400 tick/日 | `design/11` §6.1；本文 §5 |
| E-08 | 战斗格 | pointy-top 轴坐标；六向 A*；全序 tie-break | AR-12；`design/09` §2、§5 |
| E-09 | 战斗推进 | 首轮轻功固定序，随后事件驱动 CT；环境先于单位 | `design/09` §3 |
| E-10 | 反应 | FIFO、深度 ≤3、来源位集继承、每个入队项先校验 | `design/06` §5.3；`design/09` §6 |
| E-11 | 伤害 | 一目标一段调用；Z0 后 Z1–Z10；每区 trace | `design/04` §2–§7 |
| E-12 | Buff | 构建期表达式字节码；59 hook bucket；热路径复用内存 | `design/06` §6 |
| E-13 | 任务/Ink | 查询只读；Ink 只产意图；写操作重新校验 | `tech/04` §7 |
| E-14 | 周期产出 | 跨越日历边界时补结算；`lastSettledPeriod` 幂等；绝不读墙钟 | AR-05–07；本文 §11 |
| E-15 | 同伴跨书 | `design/18` 正式契约；离队快照为能力下限，后世画像只增不减 | AR-09；`design/18` §6–§7 |
| E-16 | AI | Utility AI + Boss 状态机；确定性候选预算，Worker 仅回命令 | `design/09` §8；`tech/03` |
| E-17 | 存档 | GameState 负载交给 TSAV v1；纯迁移 + 内容 fixup | `tech/08` §3 |
| E-18 | 录像 | 开局快照、命令、RNG、每 10 命令中间哈希 **【建议值】**、终局哈希 | `tech/08` §10；本文 §14 |
| E-19 | 跨年代传承 | `legacy.v1` 只读 registry + 当前周目状态；`qiyu` RNG、稳定排序、双类配额收据和原子书眠 | `design/20` §2–§14；本文 §11.7 |
| E-20 | 战斗经脉 | `rulesProtocol=2`；一独立行动单位一实例；Z4M / Z5M 与护体内劲按固定边界接入；模块只消费 Core 注入的全局 `battle` 流 | AR-14；`design/21` §4、§11–§12；本文 §7–§8、§11.2 |
| E-21 | 外放加持 | `projectionStep` 入命令 / AI / replay；`projectProjection` 纯查询，F2 原子付费；六角枚举复用 §6，Z5M 只选一条曲线；音功仅 1 档起令 `projectionBoostActive=true` | AR-16 / AR-17；`design/09` §5、`design/21` §4.4.1；本文 §6–§8、§11.2、§14 |

## 1. 目标、边界与依赖

### 1.1 目标

玩法核心要同时满足四件事：

1. **规则唯一**：同一命令在 UI、AI、录像、平衡脚本中走同一套校验与结算。
2. **可复放**：给定内容哈希、初态和命令序列，Node 与 WebKit 得到逐步一致的状态。
3. **可诊断**：任何伤害、Buff、任务跳转和周期产出都能说明输入、规则来源和结果。
4. **可演进**：任务、经脉、资源、营生与门派严格消费版本化 schema；版本变化经纯迁移进入新状态，未知字段不能污染正式状态。

本文的“确定性”是**同一内容版本与同一合法输入序列得到同一规则状态**，不是网络锁步，也不表示动画帧、Worker 完成时间或日志墙钟相同。

### 1.2 明确不做

| 不在 core 的事项 | 负责层 | 原因 |
|---|---|---|
| Canvas/WebGL、Three 对象、动画、特效、镜头 | `render` | 表现不能反向决定规则 |
| Vue/DOM、输入手势、无障碍、文案排版 | `ui` / `apps/game` | UI 只把意图译成命令 |
| IndexedDB、gzip、云同步、网络请求、Cookie | `platform` / `tech/08` | I/O 非确定且异步 |
| YAML/Zod 全量验证、Ink 编译 | `data` / `tools/content-build` | 发布运行时只消费已编译 IR |
| 武学、Buff、地形、任务、NPC 的内容定义 | 对应 `design/*` | 遵守基准 §18 唯一归属 |
| 真实经纬度到战场格换算 | 不提供 | 全国地图、区域图、战场截取不是同一坐标系 |
| 服务器权威、反作弊、多人同步 | 不做 | 单人、本地优先；见 `tech/08` §2.4 |

### 1.3 依赖方向

```text
@tianshu/shared  ←  @tianshu/data  ←  @tianshu/core
       ↑                    ↑               ↑
       └──────── render / ui / platform / apps/game / tools（只向左依赖）
```

核心规则：

- `core` 可运行时依赖 `shared`，对 `data` 以生成类型与只读 registry 为主；不得反向 import `render/ui/platform/apps`。
- `data` 定义内容结构，不调用玩法函数；派生值若需要复杂规则，由构建工具调用 `core` 的纯函数生成。
- `render` 与 `ui` 可以依赖 `core` 的公开类型、查询与 DTO，但不能取得可写的 `GameState` 引用。
- `tools/balance` 直接装配 `createCore()`，从而与游戏走同一命令入口。
- `inkjs` 只包在 `core/dialogue` 适配层；任何第三方对象都不得进入 `GameState`。

### 1.4 对外端口

```ts
export interface Core {
  dispatch(command: Command): DispatchResult;
  tick(): DispatchResult;
  readonly query: CoreQueries;
  snapshot(): DeepReadonly<GameState>; // 独立 JSON 快照，不共享 core 内部可写引用
  project(scope: ProjectionScope): StateProjection;
  serialize(): JsonValue;
}

/** 仅作语义化别名，不是第二套协议。 */
export type GameplayCore = Core;

export interface CorePorts {
  readonly content: ContentRegistry;
  readonly diagnostics?: DiagnosticSink;
}
```

`dispatch()` 和 `tick()` 同步返回；`tick()` 等价于提交一条 `world/tick`。批量追帧由 host 逐条调用（§5.2），不改变事务粒度。主线程/Worker 差异由 `CoreHost` 封成 Promise，不把异步传染给规则层。哈希、压缩、持久化由外层接收规范负载后处理。

`tech/01` §3.6 明称其接口为草案，字段级设计归本文；实现映射固定如下，禁止同时保留两套可调用协议：

| `tech/01` 草案写法 | 本文最终接口 | 兼容边界 |
|---|---|---|
| `Core` | `Core`；`GameplayCore` 只是类型别名 | 包入口继续导出 `Core` |
| `meta.version` | `meta.stateVersion` | 旧存档经 schema migration 改名，不双写 |
| `tick(ticks): DomainEvent[]` | `tick(): DispatchResult` | `CoreHost` 逐次调用并逐批入表现队列；不存在批量 core 事务 |
| `serialize(): SaveBlob` | `serialize(): JsonValue` | 仅返回状态负载；TSAV 头、gzip 与 hash 由 `tech/08` I/O 层封装 |
| `load(blob, content): void` | 原子构造并换实例 | I/O 层完成 §14.1 全链校验后调用 `createCore(ports, validatedState)`；失败不得污染当前实例 |

### 1.5 不变量

每次成功命令结束必须同时满足：

- `GameState` 可被严格 JSON 编解码；不存在 `undefined`、非有限数、稀疏数组、class、`Map`、`Set`、函数、TypedArray 或循环引用。
- 所有内容引用能在当前 `ContentRegistry` 或明确的 legacy tombstone 中解析。
- `meta.stateVersion` 恰增 1；事件 `seq` 严格连续且都携带该版本。
- 同一时代图层内 `meta.worldTick` 单调不减；`chapter.calendar.elapsedTicks === meta.worldTick`，且日历缓存全由它推出。书眠换层时两者在同一事务重建为目标开场 tick。
- 非战斗时 `battle=null`；战斗时 `world.mountedRegion` 与 `battle.sourceRegion` 一致或有显式剧情战例外。
- RNG 状态只因已提交的规则随机而前进；查询、预览、校验失败和表现不前进。
- 资源与计数为安全整数；比例为整数 bp；所有数组符合各自稳定排序或带显式顺序字段。
- 任务、对话、同伴、NPC 的跨域变更要么全提交，要么全回滚。

## 2. `packages/core` 模块划分

### 2.1 目录建议

```text
packages/core/src/
├── api/                 # createCore、公开 Command/Event/Query 类型
├── state/               # GameState、事务、规范序列化、迁移/fixup
├── command/             # registry；每个命令一个 handler
├── event/               # event sink、因果链、投影补丁
├── world/               # tick、时代层、旅行、区域挂载、日历
├── hex/                 # 坐标、邻居、范围、A*、LOS
├── battle/
│   ├── timeline/        # openingOrder、CT、环境行动者
│   ├── action/          # 位移、招式、运劲、道具等
│   ├── reaction/        # 招架、反击、连击、合击、援护
│   ├── damage/          # Z0–Z10、Settlement、DamageTrace
│   ├── meridian-flow/   # 每单位战斗经脉实例、纯预估、快照与投影
│   ├── formation/       # 阵法成员/阵眼/生门投影
│   └── encounter/       # 就地构网、胜负、战后提交
├── buff/                # IR、表达式 VM、hook router、叠加/驱散
├── quest/               # 条件 VM、阶段机、任务动作
├── dialogue/            # inkjs 适配与 DialogueIntent
├── progression/         # 等级、书眠、经脉正式运行时接口
├── economy/             # 资源/家丁/职位/月钱正式运行时接口
├── npc/                 # 年代、存在性、同伴快照/重逢
├── ai/                  # 快照、候选、评分、确定性搜索
├── replay/              # 录像信封、逐步校验、diff
└── testing/             # fixture builder、golden harness
```

### 2.2 模块依赖图

```text
                    ┌──────── queries ────────┐
content → state → command → world / battle → event → projection
                 ↘ quest ← dialogue          ↑
                  ↘ npc / economy            │
                   ↘ battle → damage → buff ─┘
                               ↑
                         hex ← ai（只读）
```

依赖约束：

- `damage` 可调用 Buff 的已编译修饰器/钩子端口，但不解析 YAML，也不认识具体 `bf_*`。
- `battle/meridian-flow` 消费 `packages/data` 编译后的路线、控制、调息与敌人模板；它可向 `damage/timeline/ai` 提供纯查询及事务写端口，但不能 import 永久冲穴 handler，也不能保存 RNG。
- `buff` 可请求伤害、位移等受控原语端口，不能直接递归调用任意 command handler。
- `ai` 只依赖只读战斗视图、`hex` 与预测接口；不能 import 事务写接口。
- `quest` 与 `dialogue` 通过 `DialogueIntent` 单向连接，避免 Ink 直接写任务状态。
- `world` 产生日历边界事件；`economy`、任务、Buff 订阅这些事件，不读取墙钟。
- 跨模块调用形成的派生事件都携带同一个 `causeId`，便于回放定位。

### 2.3 公开与内部类型

公开 API 只导出：

- `Core`（及其纯类型别名 `GameplayCore`）、`Command`、`DomainEvent`、`DispatchResult`；
- `CoreQueries` 与裁剪后的 `*View`；
- `GameState` 的存档 schema 类型和迁移入口；
- `BattleAiRequest/Response`、`ReplayEnvelope`；
- 无副作用的六角坐标工具。

内部事务、可写状态、Buff VM 栈、A* 节点池、索引 cache、内容对象引用不从包入口导出。TypeScript 的 `readonly` 只提供编译期约束；`snapshot()` 必须返回与内部状态脱离引用的完整 JSON 快照，`project()` 返回脱离引用的裁剪 DTO，不能把生产态可写对象用类型断言伪装成只读。开发构建还应递归冻结返回值，以捕获越界写入。

### 2.4 Registry 与 cache

`ContentRegistry` 是装载完毕后冻结的只读索引；`RuntimeCache` 是可丢弃、不可存档的派生结构：

```ts
interface RuntimeCache {
  readonly buffHooks: BuffHookBuckets;
  readonly questPrograms: Readonly<Record<QuestId, QuestProgram>>;
  readonly regionNav: RegionNavigationIndex | null;
  readonly battle: BattleCache | null;
  readonly npcEra: NpcEraIndex;
}
```

cache 必须可由 `(GameState, ContentRegistry)` 重建；清 cache 不得改变结果。任何 cache key 必须包含足以反映输入变更的版本，如 `stateVersion`、`battle.revision`、`buffRevision` 或 `contentHash`，禁止只凭对象身份。

## 3. `GameState`、快照与事务

### 3.1 根状态

下面是运行时/存档边界，不是替 `tech/04` 或归属设计重写内容 schema；类型由 `packages/data` 的版本化生成物输入，core 只组合并执行。

```ts
export interface GameState {
  meta: MetaState;
  profile: ProfileState;
  chapter: ChapterState;
  party: PartyState;
  world: WorldState;
  battle: BattleState | null;
  dialogue: DialogueState | null;
}

export interface MetaState {
  saveSchema: number;
  masterSeed: number;
  runId: string;
  nextRuntimeOrdinal: number;
  contentHash: string;
  rulesProtocol: number;
  rngProtocol: number;
  coreBuild: string;
  stateVersion: number;
  worldTick: number;
  nextEventSeq: number;
  rng: Record<RngStreamId, RngStateJson>;
  debugTainted: boolean;
}

export type RngStreamId = 'battle' | 'loot' | 'world' | 'ai' | 'qiyu';
export type RngStateJson = readonly [number, number, number, number];
```

`worldTick` 是**当前时代图层内**的已游玩逻辑时间，并直接按 `design/11` §6.1 换算昼夜；书眠装载新图层时可由 `design/02/11` 的目标起点重建，不能拿它衡量跨书周目总时长。战斗另有 `battle.tick`，两者不混加。存档创建时间、设备名和云端 revision 属 TSAV 头或平台数据库，不进入 `GameState`。

### 3.2 长期、书界与临时状态

```ts
interface ProfileState {
  protagonist: PersistentCharacterState;
  progression: PersistentProgressionState;
  createdMartialArts: CreatedMartialArtState[]; // 当前周目，作者决定 P08（G1）
  equippedTitleIds: TitleId[];                 // 0–2；第二枚仅按 design/13 的特例生效
  metaBridge: MetaBridgeState;                 // MetaProfile 的确定性规则投影与待提交意图
  meridians: MeridianProgress;                  // 正式，design/15 §11.5
  companionLedger: CompanionLedgerState;        // 正式，design/18 §7
  legacy: LegacyRunState;                        // 当前周目跨书，design/20 §2、§11–§12
  tianshu: TianshuProgressState;
  codex: CodexState;
  replayRules: RuleSwitchState;
  flags: FlagEntry[];                           // profile scope；仅获 design/13 授权的账号事实可跨周目
  runFlags: FlagEntry[];                        // run scope，跨书界、不自动跨周目
  counters: ScopedCounterEntry[];              // 显式 profile/run scope
}

interface CreatedMartialArtState {
  id: 'sk_zichuang01' | 'sk_zichuang02' | 'sk_zichuang03';
  name: string;
  sourceSkillIds: readonly [SkillId, SkillId];
  definition: RuntimeMartialArtDef;             // 05 §12 规则归一化后的完整 JSON 定义
  createdAtChapterId: ChapterId;
  createdAtVersion: number;
}

interface MetaBridgeState {
  projection: MetaRuleProjection;
  pending: MetaProfileIntent[];                 // 无墙钟；由平台幂等提交后显式 ack；按 intentId 全序
}
interface MetaRuleProjection {
  sourceRevision: number;
  titleStatsEnabled: boolean;                    // P14，缺字段迁移为 true
  pastKeeperEnabled: boolean;                   // P16，缺字段迁移为 true
  titlesUnlocked: TitleId[];
  lastKeeperAppearance: { appearanceRef: string; vow: string; sourceLunhui: number } | null;
}
interface MetaProfileIntent {
  intentId: string; kind: 'keeper_snapshot';
  appearanceRef: string; vow: string; lunhui: number;
}

interface ChapterState {
  chapterId: ChapterId;
  eraLayerId: string;                            // 正式键，见 design/11 §1.6、§12.5
  worldYear: number;
  worldTier: 'HIGH' | 'MID' | 'LOW';
  flags: FlagEntry[];                           // 仅 chapter scope
  counters: CounterEntry[];
  quests: QuestInstance[];                       // quest-instance.v1，design/12 §11.1
  npcs: NpcRuntimeState[];
  sects: SectMembershipState;                    // sect-membership-state.v1，design/12 §11.3
  economy: EconomyRuntimeState;                  // 聚合 design/16 §14 的正式状态类型
  legacyCaches: LegacyCacheRuntimeState[];       // 当界缓存 / 挖掘进度；书眠清零
  calendar: WorldCalendarState;                  // 时间尺度见 design/11 §6.1；日历规格见本文 §5.3
}

interface PartyState {
  active: CharacterRef[];                       // 阵位顺序，不复制角色能力
  companions: CompanionCharacterState[];       // 在册同伴，按 runtimeId
  reserveNpcIds: NpcRuntimeId[];
  inventory: InventoryStack[];
  equipment: EquipmentInstance[];
  money: number;
  formationPresets: FormationPresetState[];
}
```

`MetaRuleProjection` 是载入本周目后的确定性副本，不是第二份账号事实源；`sourceRevision` 仅用于拒绝旧投影覆盖新投影。`titlesUnlocked` 与 `equippedTitleIds` 均按 ID 全序，`pending` 按 `intentId` 全序；投影、装备和待提交意图都进入状态 hash。

`CharacterRef` 为主角引用或同伴 `runtimeId`；主角能力唯一写入 `profile.protagonist`，同伴在队能力唯一写入 `party.companions`。战斗初始化复制有效能力与活体资源，战后只经一次 finalize 写回；ledger 保存离队快照，不与在队对象双写。旗标必须显式指定 scope，禁止同名跨域回退；周目继承只按 `design/13` 的继承清单执行。

角色武学持久字段遵循 `design/05` §2.6 与 `tech/04` §3.11 末尾的 `SkillInstance` 校验约定：`skillId`、`sourceGrade/sourceCap`、`trueLayer/sxp/latentExp`、`nativeTo/learnedIn`、`attunedGrade/attunedIn`、`movesEquipped`、`pages/insight/flags`。effective grade/layer 只重算，不双存；`sourceGrade` 不等于层上限。调用 `design/05` resolver 后才冻结攻击，绝对品阶用于修炼门槛、有效品阶用于战斗。

归属与保留边界：

| 子树 | 生命周期 | 书眠默认 | 依据 |
|---|---|---|---|
| `profile.progression/tianshu/codex` | 跨书界/周目 | 保留或按 `design/13` 转换 | `design/13` |
| `profile.createdMartialArts` | 当前周目、跨书界 | 本周目保留；新周目清空，图鉴事实另入 `MetaProfile` | `design/05` §12、`design/13` §6.1 |
| `profile.metaBridge` / 已装备称号 | 本周目规则投影 | 以显式命令刷新；新周目从 `MetaProfile` 再投影 | `design/13` §8.3、§9.4 |
| `profile.meridians` | 跨书界、当前周目永久 | 书眠全量保留；新周目按 `design/13` 重置运行态，只向 `MetaProfile` 写里程碑 | AR-03、`design/13` §6.1/§9.4 |
| `profile.companionLedger` | 跨书界 | 保留快照与履历 | AR-09、`design/18` |
| `profile.legacy` | 当前周目、跨书界 | 保留源状态、三卷、信物及调度 / 机会 / 校合收据；新周目重置 | AR-13、`design/20` §11 |
| `profile.flags/runFlags` | 账号授权事实/当前周目 | 两者均跨书保留；新周目仅从 `MetaProfile` 重建获 design/13 授权的 profile facts，并清空 runFlags | §10 **【建议值】** |
| `chapter.flags/quests/npcs` | 当前书界 | 归档摘要后重建 | `design/12` §1、§11 |
| `chapter.sects` | 当前书界 | 默认清除 | `design/12` §11.3、`design/16` §11 |
| 资源点/普通资源/家丁/职位 | 当前书界 | 默认清除；仅归属文档明列的学识 / 图鉴 / 里程碑可留 | `design/16` §13.4、§16 SLEEP-V01 |
| `chapter.legacyCaches` / 传承挖掘订单 | 当前书界 | 先取消订单并释放排班，再清缓存进度；不删除传承匣与收据 | `design/16` §7.8、`design/20` §11.1 |
| `party.active/reserve` | 当前队伍 | 写入同伴 ledger 后清理/重邀 | `design/18` §6 |
| `battle/dialogue` | 临时 | 书眠前必须为空 | 本文 |

书眠提交不是通用“保留物品”复制：`chapter/bookSleep` 必须调用 `design/02` §6.6 与 `design/10` §12.3–§12.4 的共同校验器，在同一事务检查携带选择、当界新藏史、史匣可存类型和实例原有 `nativeTo`；`design/13` §4.1 的天书实物进入天书匣并走其永久例外，不进入装备共同额度。effective resolver 也必须以 `design/02` §3.1 的 `capExempt` 显示等级入口和 `design/13` §4.5 的 `off_skill/off_equip` 分类为输入，再依次执行来源、修为、层数与战斗有效值计算；`capExempt` 或天书效果都不能被解释为跳过未明列的门槛。上述顺序由 `tech/04` §5.3–§5.4 的跨 schema fixture 固化，本文不复制其阈值。

### 3.3 世界与战斗状态

```ts
interface WorldState {
  navigation: {
    locationId: CityId | RegionId | OffmapId;
    selectedDestinationId: string | null;
    journey: JourneyState | null;
  };
  eraRevision: number;                          // layerId 唯一取 chapter.eraLayerId
  regions: RegionRuntimeState[];                // design/11 EraLayer 的运行态，按 regionId
  cities: CityRuntimeState[];                   // design/11 城市状态的运行态，按 cityId
  mountedRegion: {
    regionId: RegionId;
    spawnId: string;
    playerHex: HexCoord;
    facing: HexDir;
    dynamicTiles: DynamicTileState[];
    entities: WorldEntityState[];
  } | null;
  explored: ExploredRegionState[];
  repeatEncounters: Array<{ spawnPointId: string; worldDay: number; dailyClearCount: number }>;
  scheduled: ScheduledWorldEvent[];
  pendingTimeAdvance: { remainingTicks: number; reason: 'rest'|'story' } | null;
  lastTickSettlement: number;
}

interface BattleState {
  battleId: string;
  encounterId: EncounterId;
  kind: EncounterKind;
  seed: number;
  sourceRegion: RegionId | null;
  sourceSpawnPointId: string | null;             // 仅可重复世界遭遇；剧情战为 null
  repeatExpMulBp: 10_000 | 5_000 | 2_000;        // 入场冻结，角色经验结算只乘一次
  phase: 'deploy' | 'running' | 'ended';          // design/09 §13.1
  tick: number;
  round: number;
  revision: number;
  grid: BattleGridState;
  units: BattleUnitState[];
  meridianByUnit: MeridianBattleUnitState[];      // unitIndex 升序；design/21 的战斗临时态
  openingOrder: UnitId[];
  turn: TurnFrame | null;
  sides: Record<SideId, SideState>;              // 士气、号令、黑板
  gauges: Record<string, number>;
  telegraphs: TelegraphState[];
  timedEvents: BattleTimedEvent[];
  environment: EnvironmentActorState | null;
  reactions: ReactionQueueState;
  profile: 'normal' | 'narrow';
  winCond: BattleCond[]; loseCond: BattleCond[];
  onDefeat: 'retry' | `branch:${string}` | 'continue';
  boss: BossRuntimeState | null;
  formations: FormationRuntime[]; waves: WaveRuntime[]; fronts: FrontState[];
  lastActions: LastActionEntry[];
  stats: BattleStats;
  retry: { count: number; assistTier: 0 | 1 | 2 | 3; undoLeft: number };
  control: BattleControlState;                  // 自动模式、策略与决策号
  inventory: BattleInventoryState;              // 消耗品、ItemUid 与所有权锁的战内副本
  ruleSwitches: RuleSwitchState;
  titleRules: { statsEnabled: boolean; equippedTitleIds: TitleId[] }; // P14 入场冻结
  predicates: BattlePredicateInputs;            // 入场时任务/时代/剧情只读事实
  nextLocalEventSeq: number;
  checkpoints: BattleCheckpointStore;           // §14.3 非递归状态片段
  nextBuffIid: number;
  nextDamageSeq: number;
  outcome: BattleOutcome | null;
}

interface BattleUnitActionState {
  itemState: { uses: number; maxUses: number; byId: ItemUseEntry[]; cooldowns: CooldownEntry[] };
  moves: MoveUseEntry[];                        // moveId、uses、charges、cd、freshTurnToken
  ultimateBySkill: Array<{
    skillId: SkillId;
    ultimateCooldown: 0 | 1;
    lastUltimateMoveId: MoveId | null;
    freshTurnToken: number | null;               // 设置冷却的行动不递减
  }>;                                           // 按 skillId ASCII 全序，仅战斗临时态
  yunjin: { lastMode: YunjinMode | null; sourceInner: SkillId | null; resolvedAtTurnToken: number | null };
}

interface MeridianBattleUnitState {
  unitId: UnitId;
  unitIndex: number;
  flow: MeridianFlowSnapshotV1;
  activeDefense: { routeId: MeridianRouteId; qualityBp: number; expiresAtOwnAction: number; causeId: string|null } | null;
  movementProjection: { routeId: MeridianRouteId; qualityBp: number; speedBp: number; sealed: boolean; ruptured: boolean } | null;
  innerGuard: { enabled: boolean; routeId: MeridianRouteId; breakGuardBp: number; reflectBp: number } | null;
}
```

`RegionRuntimeState/CityRuntimeState` **【建议值】** 各含稳定地理 ID、`open`、`controllerFactionId|null`、入口/场所覆盖、资源点实例引用与任务改动 revision；时代默认值在 registry，状态只存动态覆盖，切书重建。`repeatEncounters` 只保存当前时代可重复刷新点的当日胜利次数，键为稳定 `spawnPointId + worldDay`；换日自然换键，书眠切层整体卸载。逃跑、战败、一次性剧情战均不增加计数。

`BattleUnitState` 继承 `design/09` §13.1 的身份、unitIndex、阵营/控制、格位/朝向、CT/冻结/待移位、五资源、Buff、反击招、被擒/倒地、AI/仇恨与 flags，全部必须进入战斗快照。本文统一 optional 规则状态为显式 null/空数组，adapter 映射 `id→battleId`、`env→environment` 等字段，不维护两份值。道具以 `ItemUid` 选择实例、以 `ItemId` 累计次数和冷却。运劲实际效果进入资源/Buff，最近模式供后续查询。`revision` 在预测输入改变时递增；寻路 open set、可达格与动画不保存。

`ultimateBySkill` 由入场时已装配武学生成，只存在于 `BattleState`、录像与同进程悔招 checkpoint；它不写回 profile 的持久 `SkillState`，`battle/finalize` 和离开战斗都直接丢弃。这样跨战斗不继承共享冷却或上次绝招，而协议 2 重放仍能逐命令复原轮换状态。

### 3.4 命令、事件与结果

```ts
type Command =
  | BattleCommand                              // design/09 §13.2，§7 映射
  | { readonly t: 'world/tick' }
  | { readonly t: 'world/walkTo'; readonly to: HexCoord }
  | { readonly t: 'world/travel'; readonly destinationId: string; readonly routeId: RouteId }
  | { readonly t: 'world/mountRegion'; readonly regionId: RegionId; readonly spawnId: string }
  | { readonly t: 'world/interact'; readonly targetId: string }
  | { readonly t: 'world/rest'; readonly shichen: number }
  | { readonly t: 'dialogue/choose'; readonly choiceIndex: number }
  | { readonly t: 'quest/choose'; readonly questId: QuestId; readonly optionId: string }
  | { readonly t: 'meridian/runSession'; readonly targetId: AcupointId | CirculationId; readonly mode: 'steady' | 'force' }
  | EconomyCommand | SectCommand               // §11；由 design/12、16 的正式联合生成并受门禁校验
  | { readonly t: 'martial/fuse'; readonly sourceSkillIds: readonly [SkillId, SkillId]; readonly name: string; readonly selection: MartialFusionSelection; readonly replaceId: CreatedMartialArtState['id'] | null }
  | { readonly t: 'title/equip'; readonly titleIds: readonly TitleId[] }
  | { readonly t: 'meta/applyRuleProjection'; readonly projection: MetaRuleProjection }
  | { readonly t: 'meta/ackIntent'; readonly intentId: string }
  | { readonly t: 'companion/rejoin'; readonly npcId: NpcRuntimeId }
  | { readonly t: 'battle/finalize' }
  | { readonly t: 'rules/setDifficulty'; readonly difficulty: DifficultyId }
  | { readonly t: 'rules/setSwitch'; readonly id: RuleSwitchId; readonly enabled: boolean }
  | { readonly t: 'chapter/bookSleep'; readonly carry: CarrySelection };

interface DomainEvent<T extends string = string, P extends JsonValue = JsonValue> {
  readonly t: T;
  readonly seq: number;
  readonly stateVersion: number;
  readonly causeId: string;
  readonly parentSeq: number | null;
  readonly payload: P;
}

type DispatchResult =
  | { readonly ok: true; readonly stateVersion: number; readonly events: readonly DomainEvent[] }
  | { readonly ok: false; readonly reason: RejectReason; readonly at?: string };
```

命令不携带预计伤害、已算出的可达格或墙钟；提交时重算路径、费用与目标。所有战斗命令覆盖 `act/deploy/order/free/setAuto/concede/retry/undo`；AI 的 `act` 另带 §13 的 decision token/aiSeed 并重新验证。任意 giveItem、写旗标和发奖励不作为公共命令，只能由已授权的内容程序产生内部 intent；UI 仅选择内容中存在的 option。

领域事件命名采用 `域/过去式`，例如 `battle/damageResolved`、`world/periodSettled`。事件是已提交事实和表现输入，不是 event sourcing 的唯一持久层；存档仍保存完整状态。

`martial/fuse` 按 `design/05` §12 与作者决定 P08（G1 采用默认）校验“倚天后开放”、两门材料、每类/每书界/全局上限和替换槽。handler 只接受玩家选择，不接受调用方拼好的结果；在同一事务中派生 `sk_zichuang01`–`03` 的完整 `RuntimeMartialArtDef`、消费两门材料为残篇、写入角色武学并发 `martial/fused`。任一步失败全部回滚。运行时定义与普通内容定义走同一个只读 resolver，但不得写回静态 registry；跨书保留、本周目结束清空，符合 `design/13` 的继承边界。

`MetaProfile` 本体仍由 `design/13` §9.4 / `tech/08` 管理，core 只保存会改变规则的确定性投影与玩法产生的待提交事实。新建/载入 run 及平台设置成功后，host 以内部 `meta/applyRuleProjection` 明确注入一个已校验版本并发 `meta/ruleProjectionChanged`；不能让查询直接读取 IndexedDB/云端，也不由 core 重定义 `PATCH /meta/settings`。`meta/applyRuleProjection` 与 `meta/ackIntent` 只由 `CoreHost` 调用，不暴露给 UI/Ink，并只在 `battle=null` 的安全点接受；战斗期间到达的云同步/ack 由 host 排队，防止外部完成时序改变战斗版本或 AI decision token。P14 的 `titleStatsEnabled` 与已装备称号在入战时冻结到 `battle.titleRules`；关闭只取消属性，不取消称呼。装备两个称号时其中一个必须是 `design/13` 指定的双称号特例，否则拒绝。P16 的 `pastKeeperEnabled` 决定新周目实例化 `npc_shoujuanren` 时是否采用投影中的最近一次外观与誓言，不在战中热切换。缺字段的旧 Meta 投影按作者决定迁移为 `true`。

守卷结局提交时，core 以当时已冻结的主角外观引用、校验后的誓言和周目序号生成 `keeper_snapshot`，其 `intentId` 由 `(runId, 'keeper_snapshot', endingReceiptId)` 确定性派生；同一事务写入 `profile.metaBridge.pending` 并发 `meta/intentQueued`。平台按 `intentId` 幂等合并后回送 `meta/ackIntent` 删除待提交项；回档重发同一结局收据仍是同一 ID。平台生成的墙钟时间只进 `MetaProfile` 审计字段，不回流规则。`debugTainted` 状态不生成该意图。

### 3.5 命令事务

```ts
interface CommandHandler<C extends Command> {
  validate(read: ReadContext, command: C): RejectReason | null;
  apply(tx: CoreTransaction, command: C): void;
}

interface CoreTransaction {
  readonly state: DeepReadonly<GameState>;
  readonly content: ContentRegistry;
  set<P extends StatePath>(path: P, value: ValueAtPath<P>): void;
  splice<P extends ArrayStatePath>(path: P, start: number, deleteCount: number, values: ItemsAtPath<P>): void;
  rng(stream: RngStreamId): Rng;
  emit<T extends DomainEvent>(event: Omit<T, 'seq' | 'stateVersion' | 'causeId'>): void;
  abort(reason: RejectReason, at?: string): never;
}
```

事务流程固定为：

1. 按命令判别字段找到唯一 handler；未知命令拒绝。
2. 对当前只读状态执行 `validate`；该阶段不能拿 RNG。
3. 创建 mutation journal、事件暂存区和五流 RNG 的局部副本。
4. `apply` 只经事务 helper 写状态；跨模块动作仍处于同一事务。
5. 执行根不变量、局部数值边界和事件载荷断言。
6. 成功：提交 RNG、`stateVersion += 1`、为暂存事件分配连续 `seq`，返回事件批。
7. 异常或 `abort`：逆序应用 journal；丢弃 RNG 副本和事件；版本不变。

生产环境不为每个命令深拷贝整棵状态。journal 记录第一次写入的 `(owner, key, oldValue)` 以及数组 splice 逆操作；战斗开始、存档和 debug 模式才做完整快照。开发构建可在事务前后做 canonical clone/deep-freeze，对照 journal 回滚结果。

`MeridianFlowModule` 的可变 facade 必须绑定当前 `CoreTransaction`：第一次写某节点槽、主动防守、护体、擒拿或 `stateVersion` 时登记旧值；模块不得把可写 `Map` / TypedArray 藏在 journal 之外。`commit(route, tx.rng('battle'))` 所推进的是事务局部 RNG 副本，因此卡住后的合法命令会同时提交节点与游标，后续不变量失败则两者同时恢复。测试以“第 k 段写伤后主动抛错”验证节点 snapshot、全局 `battle` 四字状态、CT、资源和事件均回到命令前。

### 3.6 可变与不可变策略

| 场景 | 策略 |
|---|---|
| handler 内部 | 事务 helper 独占写入，journal 记录原地变更 |
| query | `DeepReadonly<GameState>`，纯函数；不得保存可写引用 |
| UI/render 同线程 | 输出脱离内部引用的裁剪 DTO；开发模式再冻结 |
| core Worker | 事件批 + 版本化 projection patch；主线程副本只读 |
| AI Worker | 裁剪 `BattleAiSnapshot`，不发送整棵 GameState |
| 存档/战斗录像 | 完整规范快照 |
| 回滚 | mutation journal；跨书眠等大事务额外保存完整 checkpoint |

不采用 Immer/Proxy 作为生产状态层：它会增加热路径分配、隐藏写放大，并使 Worker 克隆成本难预估。它可作为测试 oracle，对小状态执行同一命令并比较结果，但不进入发布包。

### 3.7 快照与投影

快照分四种，名称不能混用：

| 名称 | 内容 | 用途 |
|---|---|---|
| `SaveSnapshot` | 与活状态脱离引用的完整 `GameState` | TSAV 负载 |
| `BattleStartSnapshot` | 战斗规则态 + 必需角色/内容引用摘要 + RNG | 录像与重试 |
| `StateProjection` | UI/render 所需子集 | 展示、Worker 镜像 |
| `BattleAiSnapshot` | AI 可见信息、候选所需规则字段 | AI Worker |

投影 patch 只是一种传输优化，不进入状态哈希。主线程发现 patch 的 `fromVersion` 不等于本地版本时，必须丢弃 patch 并请求完整投影；禁止“尽量套上”造成幽灵状态。

### 3.8 事件因果与错误

同一根命令生成稳定 `causeId = stateVersion:commandOrdinal`；派生事件以 `parentSeq` 连接。错误分三类：

- **合法拒绝**：资源不足、目标失效、不是行动者；返回稳定 `RejectReason`，不报警。
- **内容错误**：缺 ID、非法字节码、未穷尽原语；构建期应阻断，运行时中止事务并标诊断。
- **引擎不变量错误**：溢出、事件深度越界、状态不可序列化；中止事务，开发环境抛出，发布环境写最小诊断并保留上一个可存状态。

错误文本属于 UI；core 只返回代码和可安全展示的参数，避免本地化文本进入录像。

## 4. 确定性、随机数与规范哈希

### 4.1 D1–D9 的落地

本文实现而不改写 `tech/01` §8.3 的规则：

| 规则 | core 落地 | 负向用例 |
|---|---|---|
| D1 随机 | 只能 `tx.rng(stream)` | `Math.random()` lint error |
| D2 时间 | 只能读 `worldTick/battle.tick` | `Date`、`performance.now`、计时器 lint error |
| D3 数学 | 整数、查表、允许的基础算术 | `Math.pow`、`**`、三角/指数/对数 lint error |
| D4 取整 | 每个公式 helper 命名体现 floor/ceil/half-up | 隐式 `Math.round` 替换 Z 区 floor 测试失败 |
| D5 顺序 | 有结果影响的集合先全序 | 无 comparator 的 `sort()`、`for…in` lint error |
| D6 分流 | battle/loot/world/ai/qiyu | 预览消耗 RNG 的测试失败 |
| D7 inkjs | 创建 Story 后立即覆盖 `storySeed` | 默认墙钟种子断言失败 |
| D8 JSON | 边界递归校验 | Map/Set/undefined/NaN 拒绝 |
| D9 golden | Node + WebKit 重放比 hash | 任一步首差异报告 |

### 4.2 RNG 算法、分流与抽样契约

状态推进与播种逐位沿用 `tech/01` §8.3：每流为四个 uint32 的 sfc32；master 与 ASCII 流名逐字符 `imul(h ^ char,0x9e3779b1)`，再用加量 `0x9e3779b9`、混合量 `0x85ebca6b/0xc2b2ae35` 的 splitmix32 连取四值。无额外 warm-up；源码常量与运算次序是规范，不以同名第三方算法替换。它是游戏 PRNG，不用于密钥。

`rngProtocol` 必须与 `tech/01` §8.3 的当前实现共同版本化：区间整数采用 `floor(next/2^32×span)`，万分点概率采用 `next%10000<bp`，且每次公开抽样调用恰消费一个 uint32。本文不能单方面改成拒绝抽样或对 0/10000 bp 免抽；若未来改变抽样映射或消费量，必须提升协议、保留旧 runner，并让旧录像继续走原算法。主种子 `1` 的执行锚点如下，完整四字状态和更多输出由 fixture 锁定：

| 流 | 初始化四字状态 | 前四个 nextU32 |
|---|---|---|
| battle | 410886986,3948248343,382199180,4192204983 | 4256373016,2986861133,4029091281,3160275602 |
| loot | 4115970839,3352329225,1349892310,292111708 | 3465444476,2906675482,433035362,4145665435 |
| world | 3203807750,1498997830,4207607716,3767632768 | 4175471052,187222137,190563775,801057572 |
| ai | 3247949964,3666686332,38919984,3728629043 | 2053330747,3456085448,1453962039,622417602 |
| qiyu | 1852199331,2694540512,859364783,1535345410 | 1787117957,3377360768,1273374054,1195569528 |

```ts
export function intInclusive(rng: Rng, lo: number, hi: number): number {
  assertSafeInt(lo);
  assertSafeInt(hi);
  if (hi < lo) throw new RangeError('RNG_RANGE');
  const span = hi - lo + 1;
  if (!Number.isSafeInteger(span) || span < 1 || span > 0x1_0000_0000) throw new RangeError('RNG_SPAN');
  return lo + Math.floor((rng.nextU32() / 0x1_0000_0000) * span);
}

export function chanceBp(rng: Rng, chance: number): boolean {
  const bp = clampInt(chance, 0, 10_000);
  return rng.nextU32() % 10_000 < bp;
}
```

缩放与取模会有极小映射偏差，但它们是当前跨文档录像协议的一部分，兼容性优先于在本文局部换算法。`chanceBp(0)` 仍消费一次且恒假，`chanceBp(10000)` 仍消费一次且恒真；调用点不能先做常量分支。事务回滚会恢复这一次消费，预览则根本不得调用抽样函数。

随机流使用边界：

| 流 | 允许 | 禁止 |
|---|---|---|
| `battle` | 命中、招架、暴击、浮动、战斗效果、撤退、经脉逐段卡住与合格自行解穴 | 战利品、AI tie-break、经脉单位子流 |
| `loot` | 掉落表、奖励随机品质 | 战斗判定 |
| `world` | Ink seed、世界事件、资源受扰、天气 | UI 装饰 |
| `ai` | 明确配置的等分候选破同分 | 模拟命中；AI 预测用期望值 |
| `qiyu` | 奇遇池抽取 | 普通旅行事件 |

新增流会改变存档 schema，不能临时用字符串创建。随机选择前必须把候选按稳定 ID 排序；权重累计使用整数，禁止浮点 alias table。

经脉模块不得接收 master seed、保存游标或从 `unitId` 派生子流。只有通过预检且准备提交的路线才拿到同一命令事务的 `tx.rng('battle')`：跨单位先服从战斗事件全序，同一条路线按 `steps[]` 顺序，每个实际到达并尝试的节点恰消费一个 `nextU32()%10000`；预检失败、未到达的后段与所有纯函数消费 0 次。调息只对“实际触及且达到自行解穴门槛”的穴位按 `ap_*` ASCII 序各抽一次。

`preview` 默认以安全条件轨迹 `rollBp=9999` 计算，并返回每段概率 / 到达率与条件分支；它不读取或复制下一枚随机数。开发与 CI 在调用前后比较 `battleRng` 四字状态和单位 snapshot hash。`commitWithRolls` 仅可存在于测试适配器，生产包与公开类型都不得导出。

### 4.3 整数、bp 与溢出

| 量 | 表示 | 规则 |
|---|---|---|
| 气血、内力、tick、计数、最终属性 | JS safe integer | 写入时 `Number.isSafeInteger` |
| 先天/混合资质等未取整输入 | 精确分子/分母，或构建期定点整数 | 不把 58.58 等先天输入提前取整；超精度构建失败 |
| 比例/概率 | bp，10000 = 100% | 状态和 IR 都是整数 |
| 金钱/资源 | 非负 safe integer | 饱和/拒绝由归属规则决定，不静默环绕 |
| 临时精确乘积 | `bigint` | 不进 GameState/事件/JSON |
| UI 小数 | 由 UI 格式化 | 不回传参与结算 |

```ts
export function mulDivFloor(a: number, b: number, d: number): number {
  assertSafeInt(a); assertSafeInt(b); assertSafeInt(d);
  if (a < 0 || b < 0 || d <= 0) throw new RangeError('MULDIV_DOMAIN');
  return floorRatio(BigInt(a) * BigInt(b), BigInt(d));
}
export function floorRatio(n: bigint, d: bigint): number {
  if (d <= 0n) throw new RangeError('DIV_DOMAIN');
  const q = n / d - (n < 0n && n % d !== 0n ? 1n : 0n);
  const out = Number(q);
  if (!Number.isSafeInteger(out)) throw new RangeError('INT_OVERFLOW');
  return out;
}

export const mulBpFloor = (value: number, bp: number): number =>
  mulDivFloor(value, bp, 10_000);

export function mulBp3Floor(value: number, a: number, b: number, c: number): number {
  for (const n of [value, a, b, c]) assertSafeInt(n);
  return floorRatio(BigInt(value) * BigInt(a) * BigInt(b) * BigInt(c), 1_000_000_000_000n);
}
```

BigInt 只作精确中间数，会产生分配；不承诺整条伤害路径零堆分配。上例数组校验是可读版本，优化版逐参数校验。资源成本正数 half-up 用 `floorRatio(2n*n+d,2n*d)`（变量 n/d 为 bigint），signed floor 必须处理负余数；世界/坐标模用 `((a%m)+m)%m`。优化成 Number 或约分版本前，须证明中间积不越安全整数且与此 oracle 等价。

### 4.4 禁用 API 与 lint

`packages/core` 的 tsconfig 固定 `strict:true, noUncheckedIndexedAccess:true, exactOptionalPropertyTypes:true, target:ES2023, lib:[ES2023], types:[]`，阻断 DOM/Node ambient 泄入。测试和 host 用独立配置。ESLint 至少阻断：

```text
Math.random, Date, Date.now, performance.now
setTimeout, setInterval, requestAnimationFrame, queueMicrotask
crypto.getRandomValues, Intl.*, localeCompare
Math.pow, **, exp/expm1/log/log1p/log2/log10
sin/cos/tan/asin/acos/atan/atan2/sinh/cosh/tanh/hypot/cbrt
Array.prototype.sort()（无参数）
for...in（规则集合）
eval, Function, WebAssembly.compile（DSL）
window, document, navigator, localStorage, indexedDB, fetch
```

可执行 ESLint flat-config 片段（禁用表由脚本展开为 `no-restricted-properties`，此处列结构规则）：

```ts
const coreRules = {
  'no-restricted-globals': ['error', 'Date', 'performance', 'window', 'document', 'fetch', 'crypto', 'Intl'],
  'no-restricted-syntax': ['error',
    { selector: 'BinaryExpression[operator="**"]', message: 'Use exact integer arithmetic' },
    { selector: 'ForInStatement', message: 'Use a total order' },
    { selector: 'CallExpression[callee.property.name="sort"][arguments.length=0]', message: 'Comparator required' }],
  'no-restricted-imports': ['error', { patterns: ['node:*', '@tianshu/render*', '@tianshu/ui*', '@tianshu/platform*'] }],
  'no-eval': 'error', 'no-new-func': 'error'
} as const;
```

补充自定义 lint/代码审查规则：

- 不依赖对象键的插入顺序；`Object.keys` 后必须用明确比较器，或改用已有稳定数组。
- 不用 `localeCompare`，因为 locale/ICU 可变；ID 用 ASCII 全序比较。
- 不让 `Map/Set` 的迭代顺序决定结果；它们只可作瞬时查找索引。
- 不以 Promise 完成先后、Worker 返回先后或墙钟超时决定规则分支。
- 不把异常栈、文件路径、设备信息写进状态或哈希域。
- 禁别名/解构绕开 Math、全局 API；DSL 编译器拒绝任意 property path。为每个禁例提供 lint fixture，不能仅靠字符串搜索。

### 4.5 规范序列化与哈希域

`canonicalStateJson(state)` 采用 `tech/04` 的 UTF-8、无 BOM/空白规范；对象键按 Unicode code point 全序，数组保留语义顺序，拒绝非有限数/孤立 surrogate，`-0→0`。用 `Array.from(key)` 按 `codePointAt(0)` 比较，不能用默认 UTF-16 sort 或 localeCompare。递归直接拼 `JSON.stringify(key)+':'+encode(value)`；不能先重建对象再 stringify，否则整数形键会再次被 JS 重排。字符串值的换行编码为 JSON escape；摘要前不另加尾换行。

状态哈希：

```text
stateBytes = UTF8(canonicalStateJson(GameState))
stateHash  = lowercaseHex(SHA-256(stateBytes))
```

SHA-256 由外层 `HashPort` 执行：浏览器/Worker 用 `crypto.subtle.digest('SHA-256', bytes)`，Node 测试用 `node:crypto`。两者输入同一字节串。Web Crypto 不因哈希需求进入 core 的规则代码。

进入哈希：完整 `GameState`、战斗 RNG、规则开关、任务/同伴/周期结算游标。排除哈希：TSAV 头的保存时间/设备、表现队列、诊断耗时、AI 搜索统计、cache、压缩字节。

### 4.6 跨引擎 golden

每份 golden fixture 固定：

```ts
interface GoldenReplayFixture {
  fixtureVersion: 1;
  contentHash: string;
  appBuild: string; coreVersion: string;
  rulesProtocol: number; rngProtocol: number;
  initialState: JsonValue;
  commands: Command[];
  checkpoints: Array<{ afterAccepted: number; stateHash: string }>;
  finalStateHash: string;
}
```

CI 在 Node/V8 与 Playwright WebKit/JSC 各执行同一 fixture，输出首个不同的命令、事件、RNG 五流及 JSON Pointer。fixture 与录像 runner 一样用 `appBuild+coreVersion+rulesProtocol+rngProtocol+contentHash` 锁定可执行工件和规则包；`coreBuild` 只保留为 `GameState.meta` 内部诊断组合值，不作为运输或夹具的第三套版本字段。官方 WebKit 带 Playwright 补丁，不等同真机 Safari；CI 锁 runner 版本/浏览器二进制，升级重跑旧 golden，只有经审阅的规则变更才重建预期值。iOS Safari 另做发布抽验（待实测）。

### 4.7 确定性验收用例

| # | 场景 | 断言 |
|---|---|---|
| DET-01 | 相同 seed/状态/命令运行 100 次 | 事件字节与终态 hash 完全一致 |
| DET-02 | 在每条命令前调用全部 query/预览 | 与不调用时 RNG 和结果一致 |
| DET-03 | 合法命令后插入一个非法命令 | 后续结果不变；非法命令零 RNG/零事件 |
| DET-04 | 候选输入打乱 | 排序后选择、A* 路径、Buff 顺序不变 |
| DET-05 | Node 与 WebKit | 所有 checkpoint hash 相同 |
| DET-06 | `chanceBp` 0/10000 | 恒假/恒真；两次调用各推进 RNG 一次 |
| DET-07 | `intInclusive(0,9999)` 大样本 | 每次恰推进 RNG 一次；值域完整、无越界；统计仅作非阻断烟测 |
| DET-08 | 事务中途抛内容错误 | 状态/RNG/version 与命令前逐字相同 |
| DET-09 | JSON 键插入次序不同 | canonical bytes 与 SHA-256 相同 |
| DET-10 | 状态含 NaN/Infinity/-0/undefined | 前三者按规则拒绝或归一；undefined 拒绝，不静默丢键 |

## 5. 世界 tick、时代图层与探索

### 5.1 固定逻辑步终值

```ts
export const TICK_HZ = 10;
export const TICK_MS = 100;
export const WORLD_TICKS_PER_GAME_MINUTE = 10;
export const WORLD_TICKS_PER_GAME_HOUR = 600;
export const WORLD_TICKS_PER_SHICHEN = 1_200;
export const WORLD_TICKS_PER_DAY = 12 * WORLD_TICKS_PER_SHICHEN;
```

这些是 `design/11` §6.1 的正式契约，并与 `design/06` 的“一日 = 12 时辰”一致。核算为：

```text
10 tick ÷ 10 tick/s = 1 s / 游戏分钟
1200 tick ÷ 10 tick/s = 120 s = 2 min / 时辰
12 时辰 × 1200 tick = 14400 tick = 1440 s = 24 min / 日
```

日历固定使用 **12 时辰/日**。`gameMinute=floor(worldTick/10)`、`dayIndex=floor(gameMinute/1440)`、`minuteOfDay=gameMinute mod 1440`；表现时钟只消费这些规则结果。未来若改变尺度，必须提升规则/存档协议、迁移日历余数，并重跑 Buff、天气、经济 golden，不能只改表现层常量。

### 5.2 单 tick 事务与批量调用

`world/tick` 的 validate 检查可推进探索状态，停时返回 `WORLD_PAUSED`，不改版本或事件序号。每条命令只推进一个逻辑 tick；以下为 apply 顺序：

```ts
function applyWorldTick(tx: CoreTransaction): void {
  const previousTick = tx.state.meta.worldTick;
  const nextWorldTick = previousTick + 1;
  // 先处理半开区间 (previousTick, nextWorldTick] 内的到期项和日历边界；
  // helper 显式接收目标 tick，不得偷读尚未提交的 meta.worldTick。
  advanceCalendarTo(tx, previousTick, nextWorldTick);
  stepNpcSchedulesAt(tx, nextWorldTick);
  if (canAdvanceWorld(tx.state)) stepRegionHazardsIfDueAt(tx, nextWorldTick);
  if (canAdvanceWorld(tx.state)) stepWorldMovementAt(tx, nextWorldTick);
  if (canAdvanceWorld(tx.state)) detectEncountersAt(tx, nextWorldTick);
  tx.set('meta.worldTick', nextWorldTick);
  tx.set('chapter.calendar.elapsedTicks', nextWorldTick);
}
```

上述状态写入仍属于同一 mutation journal 事务；任何日历处理器、移动或遭遇失败都会连同两个时间字段一起回滚。事件载荷使用显式 `nextWorldTick`，不得因 `meta.worldTick` 尚未写入而携带旧时刻。批量时间推进复用同一 `(a,b]` 边界调度器，只允许在实际停止点一次写回两个字段。

| 状态 | 是否推进 | 说明 |
|---|---|---|
| 区域探索/旅程结算 | 是 | 由前台固定步累计器调用 |
| 战斗 | 否 | 战斗用事件驱动 `battle.tick` |
| 对话/全屏菜单/暂停 | 否 | 默认停时；剧情主动耗时用显式命令 |
| 页面 hidden/系统挂起 | 否 | 恢复时丢弃积压，不离线挂机 |
| 加载/迁移/存档 | 否 | I/O 用时不等于世界时间 |
| 调试跳时 | 显式 | 走 `debug/advanceTime` 并置 `debugTainted` |

主循环每帧最多调用 5 次 `tick()`；每次重新 validate，遇停时立即停止，仍有积压即丢弃。`tick(5)` 不作为独立事务或录像输入；host 连调五次与五帧各调一次得到相同版本、RNG、事件和 hash。第一个 tick 开战时，后四个不被接受。core 不接收帧 dt；相同已接受 tick 序列的结果相同，卡顿丢积压会减少实玩推进量，不能宣称相同墙钟时长也一致。暂停/hidden 由 host 停发，规则停时由 core 再校验。

### 5.3 日历与边界事件

日历状态只存归属层能解释的稳定索引，不从现实日期推导；tick 换算直接引用 `design/11` §6.1。`design/16` §1.3 已正式规定 `economyMonth` 为 30 游戏日；下列“12 月 / 年、360 日 / 年”只用于通用日历显示，仍是 **【建议值】**，不得反向改变经营结算：

```ts
interface WorldCalendarState {
  epochId: string;
  calendarSpecId: string;
  epochYear: number;
  elapsedTicks: number;
  shichenIndex: number;       // 自本书界 epoch 起，单调递增
  dayIndex: number;
  monthIndex: number;
  yearOffset: number;
  slotInDay: 0|1|2|3|4|5|6|7|8|9|10|11;
}
```

`CalendarSpec` **【建议值】** 暂定每月 30 日、每年 12 月、每年 360 日，无闰月；这是游戏日历默认，不声称符合历史历法。经营侧始终使用 `economyMonth=floor(dayIndex/30)`，不依赖显示月份。`chapter.worldYear = epochYear + yearOffset`，且始终满足 `elapsedTicks === meta.worldTick >= 0`；其余 index 是 `worldTick` 的校验缓存。创建周目时二者都取本时代配置的 `startWorldTick`（未配置为 0）；书眠时按目标时代开场时刻原子重建二者与 epoch，绝不把跨越的数十年当作已游玩周期发工资。已有周期账本以 epoch 分区；若未来需要周目累计游玩时长，应另存不参与昼夜公式的计数器，不能改变 `design/11` 的 `worldTick` 语义。

从旧 tick `a` 推进至 `b` 时，合并所有时辰/日/月/年边界：

```text
各 period 枚举 floor(a/period)+1 .. floor(b/period)
按 (boundaryTick, boundaryKindRank, handlerId, ownerId) 全序归并
每个边界先结算刚结束的 [periodStart,boundaryTick)
再应用同刻的职级/归属/排程变更，最后进入下一周期
```

同刻顺序固定为时辰→日→月→年，处理器 ID 按 ASCII；任务通知在该边界经济/Buff 写入后发布。显式休息跨 12 时辰也逐边界结算，遇遭遇/对话则保存 `pendingTimeAdvance` 的剩余量，停在触发边界，不能提前跳到终点。同一处理器以 `(epochId, periodKind, periodIndex, handlerId, ownerId)` 幂等，保存游标；禁止按资源点逐个扫完整历史，避免用新任职/新归属结算旧周期。

### 5.4 大地图、时代层与区域挂载

遵守作者 P53：大地图是目的地/路线选择，不是第二张可行走网格。三个坐标域严格分离：

| 域 | 身份 | 用途 | 禁止转换 |
|---|---|---|---|
| 全国导航 | `city_*`/`rg_*`/`route_*` + WGS84/SVG | 选目的地、路线、时代名 | 不从经纬度生成战场格 |
| 区域地图 | `RegionId + HexCoord` | 探索、实体、地形 | 不把 SVG 像素当轴坐标 |
| 战场局部 | `battleId + HexCoord` | 截取后的战斗规则 | 战后只按映射表写回区域 |

时代合成顺序承接 `design/11` §1.6：

```text
design/19 基础地理
→ 当前 chapter/eraLayer 的历史开放状态
→ design/11 势力、NPC、门派、资源点、营生状态
→ 当前 GameState 的任务/占领/破坏覆盖
→ 只读 WorldLocationView
```

`world/eraChanged` 必须在书眠大事务内发出；切层后按稳定 ID 重建 NPC 存在性、城市/区域覆盖、路线与入口，再选择合法出生点。依赖的规则包先由 host 预载和校验；事务内不发网络请求。素材异步挂载失败保持“待挂载”态，重试不重复书眠/扣费。动态结果只写 GameState，不回写 registry 或 SVG。

### 5.5 旅行与区域探索

旅行命令只提交目的地和玩家选择的路线：

1. 查询当前时代开放且条件满足的路线；按 `(cost, routeId)` 排序展示。
2. `world/travel` 重新校验端点、专线、资源与任务门禁。
3. 建立 `JourneyState`，含已选择路线、固定路段、剩余逻辑 tick、已触发事件槽位与预抽取内容（如有）；禁止预抽一次、触发时再抽一次。
4. 每次 tick 推进整数距离；越过事件槽时用 `world`/`qiyu` 对应流结算。
5. 抵达后发 `world/journeyCompleted`，再由 host 加载区域包；加载成功后提交 `world/mountRegion`。

图外专线只有两端，中途不能插入城市。若内容包加载失败，旅程仍停在“已抵达、待挂载”，不能回滚随机事件或重复扣费。

### 5.6 世界 Buff 与计划事件

`design/06` 的 `onWorldTick` **每时辰一次**；`onCalendar/onAreaEnter/onRest/onBookSleep` 按其事件发出，不能把 10 Hz 当作 Buff 触发频率。`design/08` 的探索环境步为每 2 实玩秒，即 `2×10=20 tick`；战斗环境改用 CT。为避免每 tick 扫描全状态：

- 短时按 tick 的事件进最小堆；键为 `(dueTick, priority, scheduleSeq)`。
- 时辰/日/月事件挂到边界 bucket；只有跨边界才访问。
- 世界 Buff 维护 `nextDueShichen`；处理后算下次，不逐 tick 递减。
- 区域外 NPC 不做连续位移模拟，只在日程边界按规则更新抽象 location。
- 任何计划项必须有稳定 `scheduleSeq`，不得用数组当前索引作永久身份。

### 5.7 探索命令与碰撞

探索移动可以在 UI 表现为连续行走，但规则提交的是离散目的格。host 可缓存输入，在下一逻辑 tick 提交至多一条 `world/walkTo`；core 求出并逐步重验六邻路径、通行、高差、体力、交互锁和实体占用。路径在中途失效时停在最后合法格，发 `world/pathInterrupted`，不瞬移到终点。

每进入一格的固定顺序：

1. 离开旧格钩子；
2. 扣移动/体力成本；
3. 更新坐标与朝向；
4. 地形 `onEnter` 与世界 Buff；
5. 拾取/触发区/脚步噪声；
6. NPC 警觉、遭遇检测；
7. 任务位置条件；
8. 发出合并后的投影事件。

触发战斗后本 tick 不再推进其余路径。地形危险若使主角倒下，先结算其失败/救回规则，再判断遭遇，避免“死亡后开战”。

可重复世界遭遇在入场前按 `spawnPointId + worldDay` 读取胜利计数：第 1–3 次的 `repeatExpMulBp=10000`，第 4–7 次为 5000，第 8 次起为 2000。倍率冻结进 `BattleState`，只在 finalize 的角色经验乘区使用一次；胜利与奖励收据同事务把该点 `dailyClearCount` 加一。一次性剧情战、逃跑与战败不写计数，同一 `EncounterDef` 位于不同刷新点时必须使用不同 `spawnPointId`。

### 5.8 世界时间测试

| # | 场景 | 断言 |
|---|---|---|
| W-01 | 前台 1200 tick | 恰跨 1 时辰；`worldTick += 1200` |
| W-02 | hidden 30 分钟再恢复 | 0 个补跑 tick、0 次产出 |
| W-03 | 显式休息跨 13 时辰 | 13 个时辰边界、1 或 2 个日边界按起点计算 |
| W-04 | 同一周期事件重放两次 | 幂等键使第二次无产出 |
| W-05 | 旅程结束后区域包加载失败并重试 | 费用/随机事件只结一次 |
| W-06 | 对话停时 10 分钟 | 世界 tick 不变 |
| W-07 | 从时代 A 切 B | 地理 ID 不变；显示名/开放/势力按 B 投影 |
| W-08 | 全国坐标相同的两城时代名 | 以 `cityId+chapterId` 求值，不以显示名作键 |
| W-09 | 五次单 tick 与 host 一帧追五次 | 版本/事件/RNG/hash 相同；中途开战立即停止 |
| W-10 | 任职、升职、占领恰逢月界 | 旧周期按旧资格；新资格只影响下周期 |
| W-11 | 书眠跨百年 / 满 20 tick / 满 1200 tick | 不补百年产出 / 环境一步 / 世界 Buff 一时辰 |
| W-12 | 同一 `spawnPointId` 当日胜 8 次、跨日再胜；另换刷新点 | 倍率依次 `1/1/1/0.5/0.5/0.5/0.5/0.2`；跨日和不同点从 1 开始，逃跑 / 战败不计数 |

## 6. 六角格、构网、寻路、LOS 与范围

### 6.1 坐标与稳定序

```ts
export interface HexCoord { readonly q: number; readonly r: number }
export type HexDir = 0 | 1 | 2 | 3 | 4 | 5;

export const HEX_DIRS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
] as const;

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const dq = b.q - a.q;
  const dr = b.r - a.r;
  const ds = -dq - dr;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
}

export const compareHexRQ = (a: HexCoord, b: HexCoord): number =>
  a.r - b.r || a.q - b.q;
```

坐标均为 safe integer；立方坐标 `(q,r,s=-q-r)` 满足和为 0，绕原点转一步为 `(q+r,-q)`，六次还原。索引 key `${q},${r}` 不用作坐标排序。六邻扩展 dir=0..5，格集合按各模板要求的 `(distance,r,q)`，存档格按 `(r,q)`；伤害目标另按 `unitIndex`（04 §7.5），不能混用。

### 6.2 战场格与构网

```ts
interface BattleTileState {
  q: number; r: number;
  sourceQ: number; sourceR: number;
  height: number;
  terrainId: TerrainId;
  overlays: TerrainOverlayState[];
  objectId: string | null;
}

interface BattleGridState {
  tiles: BattleTileState[];          // 按 r,q 持久化
  qMin: number; qMax: number;
  rMin: number; rMax: number;
  sourceRevision: number;
  writeBack: BattleWriteBackEntry[];
}
```

就地开战完全消费 `design/09` §2.9：普通场目标 120–150 格、含精英 150–200、Boss 200–300、群战 320–400，且 `tileCount≤400`、`qSpan≤20`、`rSpan≤20`。算法：

1. 把主角和领头敌人的中点 cube-round 为遭遇中心。
2. 枚举中心三格内 37 个候选，按 `(distance,r,q)`。
3. 逐环取区域真实格直至目标数量或跨度上限。
4. 检查单位边距、可站立比例、三行动攻击位连通、退路。
5. 计算 `S=2*standRatio+reachScore+0.3*min(1,sigma(h)/2)-0.05*distance`，使用下述定点精度。
6. 同分取中心偏移小、`r` 小、`q` 小；不耗 RNG。
7. 失败依次扩大 15%、尝试窄场、再使用内容预设 `battleAnchor`；没有合法锚点即拒绝开战并报内容错误。

战场只复制区域事实和写回映射。火烧、冰封、物件损毁等可持久变化在战后按映射事务写回；临时 `aoe_zone`、战斗 Buff 和动画印记不写回。

评分精度 **【建议值】**：`standBp=floor(10000*standable/N)`，`reachBp=floor(10000*reachable/unitCount)`；`V=N*sum(h*h)-sum(h)*sum(h)`，`sigmaBp=isqrt(V*10000²)/N` 向下取整。`scoreBp=2*standBp+reachBp+floor(3000*min(20000,sigmaBp)/20000)-500*distance`。`isqrt` 为 BigInt 整数平方根；精度与同分规则锁 `rulesProtocol`，不会由 `Math.sqrt` 末位误差改变战场。空样本拒绝。

### 6.3 通行图与 A*

寻路状态不仅是格：

```ts
interface PathNodeKey {
  q: number; r: number;
  mode: MoveMode;
  waterRun: number;
  staminaLeft: number;
  flyoverUsed: boolean;
  lowClimbUsed: boolean;
  movementSegment: number;
}
```

每一步只走六邻；飞越是 `design/09` §4.2.2 定义的一条特殊直线边。边合法性和地形成本引用 `design/08` §5.2、§7.2；战斗再叠加 ZOC。A* 使用：

```text
g' = g + moveCost08 + zocCost + specialActionCost
h  = 已证明每边 cost >= hexDistance(edge)*minStepCost 时的距离下界
否则 h=0（退化 Dijkstra；飞越/跨沟/特殊低成本边的默认）
f  = g' + h
```

open heap 的全序键为：

```text
(f, actionCount, dangerCount, fullPathRank, nodeStateRank, insertionSeq)
```

到达目标后继续处理 `f≤bestCost` 的节点，再按 `(totalCost,actionCount,dangerCount,fullPathRank)` 选解；不能因第一个等价目标先出堆就结束。完整路径用逐格 `(r,q)` 字典序，nodeStateRank 包含上述所有状态。只有同状态且总成本/次级键均不优的标签才能剪枝；少体力、已用飞越的标签不能覆盖更可行的标签。“任一攻击位”使用目标集合的可采纳距离下界，默认 h=0。

可达集用 Dijkstra，不为每个候选格重复跑 A*。预览结果包含 `path`, `cost`, `staminaCost`, `hazards`, `interrupts`；提交仍重算。

### 6.4 占用、ZOC 与强制位移

- 普通格可穿过友方、不可停在占用格；`narrow` 格连友方也不可穿。
- 敌方/中立单位阻挡；满足轻功条件时每段移动最多飞越 1 个非 `bulk` 单位。
- ZOC 进入/离开成本及截击由 `design/09` §4.4 定；路径搜索与逐步提交使用同一个 helper。
- 强制位移不调用普通 A*，沿确定 `HexDir` 逐格解析：合法空格 → 移动；占用/障碍 → 撞击；虚空/水 → `design/08` 坠落；边界外按真实源区域格判断。
- 同时位移按事件队列顺序，不做“物理同时”；后处理者看到前处理者的新位置。

### 6.5 六角范围模板

运行时只实现 `design/09` §5.3 的生产模板。基础族与格数校验：

| 族 | 核心形式 | 最大格数检查 |
|---|---|---|
| 点 | `aoe_single/aoe_self` | 1 |
| 环 | `aoe_ring(r)` | `r=0` 为 1，否则 `6r` |
| 面·圆盘 | `aoe_disk(r)` | `1+3r(r+1)` |
| 面·直线/射线 | `line/bolt/spokes` | 按定义的 `n/r` |
| 扇形 | `aoe_cone(r,60\|120,6\|12)` | 与 `design/09` 表的 `Nmax` 一致 |
| 地表/友方/全场 | 内层几何或单位筛选 | 按最大合法目标数 |

外放招不在几何层临时放大模板。F0 先以命令中的 `projectionStep` 调用本单位 `projectProjection`，冻结 `stateVersion / maxProjectionStep / projectionBoostActive / effectiveRange / spread / extraMpCost`；随后才把冻结的 `spread` 交给本节唯一枚举器，并依次裁战场边界、高差、模板阻断、地形和单位合法性。`effectiveRange` 只约束单体目标或范围锚点，实际命中仍只来自裁剪后的格集合。非外放招不得带该字段；外放招省略时规范化为 0 档，显式越过当前上限则返回 `PROJECTION_STEP_UNAVAILABLE`，不静默降档。

`projectProjection` 不枚举格，也不读取表现层；本节不重算经脉阈值或额外耗内。旧 `bf_zhenqiwaifang` 与 AR-16 的 `rangeBonus` 先取较大值而不相加，其余独立射程修正再由 `design/09` §5.2 的固定顺序合入。预览、玩家 F0、AI 和敌方均调用同一组合函数；目标、朝向或 Profile revision 变化后必须重新枚举，禁止复用旧格集合。

音功只在 `MoveDef.tags` 含 `sonic` 且已由内容构建确认 `projection:true` 时进入特殊分支：0 档返回 `projectionBoostActive=false`，并冻结基础射程、`projectionSpreadSteps[0]` 与 0 外放增耗；1 / 2 档返回 true，才使用对应扩张和 200 / 400 bp MPREF 增耗。`ProjectionInput.voice` 逐字取 `MoveDef.voice===true`，只供路线端点 / 表现消费，不参与激活式；非音功外放的 0 档仍返回 true。几何层只消费冻结结果，禁止凭伤害类型、门派或表现名自行推断。

```ts
export function disk(center: HexCoord, radius: number, out: HexCoord[]): number {
  let n = 0;
  for (let dq = -radius; dq <= radius; dq++) {
    const lo = Math.max(-radius, -dq - radius);
    const hi = Math.min(radius, -dq + radius);
    for (let dr = lo; dr <= hi; dr++) out[n++] = { q: center.q + dq, r: center.r + dr };
  }
  stableSortPrefix(out, n, compareHexRQ);
  return n;
}
```

上例为语义版，热路径写调用方预分配坐标槽。扇形把位移变为 `U=2*dq+dr,V=dr`；六主向 `(u,v)` 取 `(2,0),(1,-1),(-1,-1),(-2,0),(-1,1),(1,1)`，十二向的奇数方向取相邻主向之和。令 `D=U*u+3*V*v,C=U*v-V*u`，60° 保留 `D>0 && 9*C*C<=D*D`，120° 为 `D>0 && C*C<=D*D`，并限制六角半径、排除原点。无需 atan2/sqrt/epsilon。r=3 主向为 7/15 格，半向为 9/13 格（09 T34b）。

过滤场外、高差、阻断后按模板格序显示；普通范围映射单位、去重后按“距施招者六角距离、`unitIndex`”结算并消费 RNG。同目标按段序；链式/溅射的主次顺序由内容行为定义。外放只换用三项静态模板之一，不改 `AF/power`、目标阵营、友伤、LOS 或穿透语义。

旧 `sq/diamond/cross/x` 只在 `tech/04` 构建迁移层改写；运行时 IR 不接受旧模板。范围预览直接返回 core 格集合，render 不得再次算几何。

### 6.6 LOS 与可见性

LOS 语义完全引用 `design/08` §5.6 与 `design/09` §5.5：

1. `sonic` 直接通过；`melee` 只校验高差。
2. 其余按 `cube lerp + cubeRound` 取得不含两端的单条格线。
3. 以有理数比较视线高度，避免中间浮点：距离为 `N`、第 `i` 格时比较 `cellHeight*N - (eyeA*(N-i)+eyeT*i)`。
4. `los=full` 或实体高出视线至少 2 级阻断。
5. `projectile` 另被路径单位阻断，穿过至少 2 格有效 partial 阻断；其余 partial 每格 `hit -10`、至多 2 格。仅当 `cell.h+canopy>=lineHeight` 才计冠层/烟雾。
6. lerp 使用整数分子、分母 N；cubeRound 选平方距离最小的整数 cube，完全等距按 `(r,q)` 选一个，不额外检查另一侧格。可枚举 q/r 各 floor/ceil 的四组合，再令 s=-q-r，以三轴整数误差平方和比较。

可见性再要求视野半径内、LOS 可通且 partial≤1，并叠加隐身/听风规则。AI 只读可见集合和最后已知位置；改变未被观测敌人的真实坐标不得改变其输入/输出。

### 6.7 构网与几何测试

| # | 场景 | 断言 |
|---|---|---|
| H-01 | `(0,0)` 到 `(3,-2)` | 距离 `max(3,2,1)=3` |
| H-02 | disk r=0/1/2/3 | 1/7/19/37，全部唯一 |
| H-03 | ring r=1/2/3 | 6/12/18，闭环且稳定序 |
| H-04 | 对称地图两条等价路 | 取完整 tie-break 指定路径 |
| H-05 | 输入 tiles 随机排列 100 次 | 构网、路径、范围、LOS 字节相同 |
| H-06 | 400 格群战窗口 | 不越 tile/span 上限；构建在预算内 |
| H-07 | 两队隔河、一方不能踏水 | 候选失败后移至桥/锚点，不生成无解战 |
| H-08 | 六种朝向旋转同一 cone | 命中格数符合 `design/09` 表，旋转对称 |
| H-09 | 射线恰过两格边界 | 等距按(r,q)取一个；正反方向格集相同，Node/WebKit 一致 |
| H-10 | 战场火烧草地、临时 zone | 焦土写回；zone 不写回 |
| H-11 | 预览后单位移位再提交 | 重验后拒绝或按新状态求值，不信任旧路径 |
| H-12 | 全国经纬度与区域格都为零 | 类型/命名空间隔离，不能误传编译 |

## 7. 战斗时间轴、行动与反应

### 7.1 战斗状态机与初始化

战斗规则唯一归属仍是 `design/09`；本节把其状态机落实为可重放的 core 过程。阶段只能按下列边前进：

```text
deploy → running（openingOrder → CT，S/A/E 游标）→ ended
ended → battle/finalize → 世界状态与奖励提交，battle=null
```

`deploy` 不推进 CT；确认布阵后运行开场钩子并生成首轮，全部放在 `running` 内。一条命令及其派生段、反应、倒地检查同事务完成。`ended` 的纯战斗终局可录像、重试；世界奖励由独立幂等 `battle/finalize` 提交（§14），防止录像调用任务/掉落等未封闭输入。

初始化顺序固定：

1. 按遭遇配置解析参战者；若环境配置含会以武学独立出手的实体，也在此纳入身份表。按 `(sideRank, spawnSlot, characterId)` 分配永不复用的 `unitIndex`；纯环境时钟没有单位身份。
2. 按 `design/09` §2.9 从区域格生成局部六角网；复制可写回地形的来源映射。
3. 应用难度规则开关、敌人模板、装备、武学与永久被动，得到基础属性快照。
4. 挂载跨战斗 Buff，再实例化战斗被动；每一步都按定义 ID 升序。
5. 派发 59-hook 表中的 `onBattleStart`，重算脏属性与阵法。
6. 按 `unitIndex` 为每个可独立施展武学的单位创建一份 `MeridianFlowModule`，从 `design/15` 永久投影或敌人模板初始化，并写入 `meridianByUnit`；同模板只可共享只读基底。
7. 以同场可选敌方经脉强度中位数投影 `openingQinggong/spd/move`，冻结轻功/速度/身法降序键后生成 `openingOrder`；前三项相等时先比 openingPriority 降序，再阵营 rank、unitIndex。
8. 有环境演化时创建 `{ct:500, spd:100}` 的环境行动者；纯地形演化不建经脉实例；会独立施展武学者须使用第 1 步预留的稳定 `unitIndex`，并在创建后、进入 `running` 前立即按第 6 步创建自己的 `MeridianFlowModule`，不得复用其他单位实例。
9. 进入 `running`，执行首位 S 段到 `awaitAction`；不使用随机 CT0。

先机与经脉速度须在第 7 步前就绪，冻结后不重排。09 §3.3 文字含 openingPriority、公式漏列，本文按文字实现并登记同步，默认 priority=0。剧情 openingSlot 仅接受带非空理由、槽位唯一的构建批准覆盖，其余槽按全序填充。首轮援军不插队，以 entryCT（默认 500）进入后续 CT；援军入场时仍必须创建自己的经脉实例。

### 7.2 事件驱动 CT

`battle.tick` 只在时间轴跨到下一个规则事件时跳变，不按渲染帧逐 tick 循环。CT 内部允许 `[-1000,1299]`，行动阈值 1000，缓存后的 `spd` 必须在 `[30,300]`。

按 09 §3.1，`spd=clamp(floor((72+0.30*agi+0.10*Ld+0.14*qinggong+flat)*(1+pct)),30,300)`；小数先天用精确分数输入，最后 floor 一次。合法普通装备输入下，STD Lv1/35/70 为 `floor(91.55288/106.76396/126.93665)=91/106/126`；禁止提前取整先天、重复加入轻功贡献，或让 Lv70 普通鞋越过地上 9。

```ts
type TimelinePick =
  | { readonly t: 'opening'; readonly unit: UnitId }
  | { readonly t: 'timed'; readonly event: BattleTimedEventId }
  | { readonly t: 'environment' }
  | { readonly t: 'unit'; readonly unit: UnitId }
  | { readonly t: 'stalled' };

function ticksToReady(ct: number, gain: number): number {
  if (ct >= 1000) return 0;
  return Math.trunc((1000 - ct + gain - 1) / gain);
}
```

选择顺序严格为：尚未消费的首轮槽 → 当前 tick 到期的定时事件 → 已就绪环境行动者 → 已就绪单位 → 跳到最近事件。首轮结束后的单位全序是 `ct` 高、`spd` 高、有效轻功高、阵营 rank 小、`unitIndex` 小；同 tick 的定时事件在环境与单位之前，按 `(atTick,registerSeq)`。

寻找跳变量时，对所有可推进单位取 `ceil((1000-ct)/spd)`，并与环境及未来定时事件的距离取最小正整数 `dt`。随后一次性执行 `ct += spd*dt`、环境 `ct += 100*dt`、`battle.tick += dt`。全部单位被冻结且没有环境或未来事件时返回 `stalled`，转胜负/僵局判断；严禁把 `Infinity` 写入状态。

时间轴批量跳过空 tick 不能漏掉经脉自然演化：推进到新 `battle.tick` 后、处理该 tick 的定时事件前，按 `unitIndex` 对全部活动实例调用一次带目标 tick 的批处理 `tick`。它必须与连续执行 `dt` 次 `design/21` §3.6 单 tick 完全同态（`water=0`、`backlog=max(0,backlog-dt)`，其余节点伤势不自然消退），并得到相同 snapshot；禁止真的循环 `dt` 次。点穴 / 擒拿剩余量仍只接收 06 的自身行动投影，不随这段墙钟式跳量递减。

正常行动结束的收招实现为：

```text
recEff = clamp(halfUp(recBase × (10000 + recPctBp) / 10000) + recFlat, 500, 2000)
ct'    = clamp(ct - recEff + pendingShift, -1000, 999)
```

首轮单位不是先得到 1000 CT 再行动；其行动后直接置为 `clamp(1000-recEff+pendingShift,-1000,999)`。当前行动者受到 `ctShift` 时累积进 `pendingShift`，避免被 E6 收招覆盖；其他单位立即修改。正向位移不把已就绪单位推得更高，负向位移可把它拉出就绪区。

经脉速度接线不改变基础属性归属：先由 `design/03/09` 得到 `effectiveQinggong/baseSpd/baseMove`，再让本单位模块按 `design/21` §4.9 产生 `meridianSpeedBp`，最后仅在移动 / CT 路径把擒拿 `grappleMoveBp` 相乘，即“先经脉、后擒拿”。`openingQinggong` 与 `spd` 使用组合后倍率，`move` 加经脉导出的 −2..+2 后仍钳 1..10；轻功门禁与地形逐格成本继续读取未修正轻功和原成本。纯经脉 `evadeRatingDelta` 从 `meridianSpeedBp` 单独输出给 Z0，擒拿 `evadeBp` 再由 04 / 06 应用一次，不能把 `combinedSpeedBp` 又乘进闪避。

首轮投影只冻结一次。首轮后，当 movement 路线、点穴、胀损、擒拿或相关 Buff 变化时，把对应单位速度及同场参考中位数置脏；下一次 CT 推进前按 `unitIndex` 重算，已积累 CT 和已经冻结的首轮顺序不追溯。无可选敌人时参考 `STD_meridian=10000`；路线封死与胀损的 6500 / 8000 bp 覆盖、总硬界 6500–13500 bp 都由 `design/21` 的纯函数负责。

### 7.3 S/A/E 行动执行器

一次正常行动完全采用 `design/06` §5.2 的 S1–S7、A、E1–E6；core 只维护执行游标和“本次是否为额外行动”。

```ts
interface TurnFrame {
  actor: UnitId;
  turnToken: number;
  cursor: TurnPhase;                           // S1…S7 / awaitAction / A / E1…E6
  extra: boolean;
  movedSteps: number;
  usedFreeOrder: boolean;
  usedFreeTianshu: boolean;
  reactionBudget: number;
  normalRecovery: number | null;
  originalAction: LastAction | null;
}
```

- S1 周期发作（0–99），地形停留 priority 150 先于 S2 DOT（200–299）；S3 倒地，S4 回复（300–399），S5 驱散（400–449），S6 控制（450–499），S7 其余（500–899）；同段按 priority/iid。
- S 执行一次后保存 awaitAction；免费号令/天书在此提交限次，不重跑 S。普通 act 从此游标起算移动+一个动作；只有游势允许移—动—移。
- E1 onTurnEnd；E2 持续与适用冷却递减（含绝招共享冷却）；E3 到期 onExpire/onRemove；E4 expire:one 衰减一层并重置持续；E5 最多一次不可连锁再动；E6 收招与胜负检查。
- 额外行动只执行 S6、A、E1，不递减持续或冷却，不重置 `limitPerTurn`，结束后回到原正常行动的 E6。
- 硬控跳过 A 段仍执行完整 E 段并用 1000 收招；因此“1 次行动”不会因控制而永久挂住。

turnToken 只在新正常行动开始时递增；反应、免费、再动不重置 limitPerTurn。提交边界停在 deploy/awaitAction/ended，内部 S/E 游标用于执行，半个伤害段不能存档。招式/道具新 CD 用 `freshTurnToken` 跳过施放当次；普通 trigger cooldown 在持有者 E2 递减，机制 limits.cooldown 从机制结束后起算（06 §11.3）。绝招通过 F0 后，在 F2 与气势、内力等资源同一事务设置所属武学 `ultimateCooldown=1`、`lastUltimateMoveId=moveId` 和当前 `freshTurnToken`；此后即使命中失败、被招架、被抵抗或路线途中卡住也不退款、不撤冷却，只有事务整体失败才回滚。E2 只递减本次正常行动 S 段快照中已经存在、且 `freshTurnToken !== turnToken` 的共享冷却，因此设置当次不减；紧接的下一次自身正常行动从 S 到 E 全程禁止同门绝招，至该行动 E2 才清零。环境、他人、免费与额外行动都不推进。journalMark 留在事务内，不能存进 TurnFrame。

### 7.4 行动计划、运劲与道具

```ts
type BattleAction =
  | { readonly t: 'skill'; readonly move: MoveId; readonly target: Target; readonly aim?: HexAim; readonly projectionStep?: 0|1|2 }
  | { readonly t: 'hidden'; readonly move: MoveId; readonly target: Target; readonly aim?: HexAim }
  | { readonly t: 'item'; readonly item: ItemUid; readonly target: Target; readonly aim?: HexAim }
  | { readonly t: 'yunjin'; readonly mode: YunjinMode; readonly sourceInner?: SkillId; readonly investBp?: 1000|2000|3000; readonly buffIid?: number }
  | { readonly t: 'guard' | 'wait' | 'flee' | 'struggle' | 'cover' | 'swapWeapon' }
  | { readonly t: 'unseal' | 'capture'; readonly target: UnitId }
  | { readonly t: 'rescue'; readonly target: UnitId; readonly item?: ItemUid }
  | { readonly t: 'talk'; readonly mode: TalkMode; readonly target?: UnitId }
  | { readonly t: 'discern'; readonly target: Target }
  | { readonly t: 'combo'; readonly combo: ComboId; readonly partner: UnitId; readonly target: Target; readonly aim?: HexAim }
  | { readonly t: 'yiyun'; readonly aux: SkillId }
  | { readonly t: 'drawWeapon'; readonly item: ItemUid }
  | { readonly t: 'pickup'; readonly tile: HexCoord }
  | { readonly t: 'dual'; readonly a: MoveTarget; readonly b: MoveTarget };
interface MoveTarget { readonly move: MoveId; readonly target: Target; readonly aim?: HexAim; readonly projectionStep?: 0|1|2 }

interface BattleActionPlan {
  readonly walkTo?: HexCoord;
  readonly action: BattleAction;
  readonly order?: 'moveFirst' | 'actFirst';
  readonly walkAfter?: HexCoord;
  readonly facing?: HexDir;
}

interface AiDecisionProof {
  readonly decisionToken: number;
  readonly aiSeed: number;
}

interface ProjectionStepAvailability {
  readonly projectionStep: 0|1|2;
  readonly projectionBoostActive: boolean;
  readonly available: boolean;
  readonly disabledReasons: readonly RejectReason[];
  readonly extraMpCost: number;
  readonly totalMpCost: number;
  readonly effectiveRange: number;
  readonly spread: HexShape;
}
interface MoveAvailabilityEntry {
  readonly moveId: MoveId;
  readonly skillId: SkillId;
  readonly ultimate: boolean;
  readonly unlocked: boolean;
  readonly available: boolean;
  readonly disabledReasons: readonly RejectReason[];
  readonly routeSummary: RouteAvailabilitySummary;
  readonly projection: boolean;
  readonly maxProjectionStep?: 0|1|2;
  readonly projectionSteps?: readonly ProjectionStepAvailability[];
}
interface MoveAvailabilityView {
  readonly stateVersion: number;
  readonly unitId: UnitId;
  readonly rage: number;
  readonly rageMax: number;
  readonly skills: readonly {
    skillId: SkillId; ultimateCooldown: 0|1; lastUltimateMoveId: MoveId|null;
    moves: readonly MoveAvailabilityEntry[];
  }[];
}
```

行动权、单位状态、移动预算、行动类别、内容 ID 与装配解锁先作共同前置校验；随后玩家按钮、AI、一键重复与 Core F0 必须调用同一个 `filterMoveCandidate`，严格按下列顺序追加有序原因，不能各写一套：

1. 招式自身 `cds[moveId] > 0`；
2. `MoveDef.ultimate:true` 且所属武学 `ultimateCooldown > 0`；
3. 绝招 `moveId === lastUltimateMoveId`，其后尚未成功结算同门另一绝招或同门普通招；
4. `design/21` 无副作用预检确认路线被未开穴、胀损或 9 级点穴硬封。

四项过滤完成后才展开外放档，并依次校验所选档、总资源、目标 / 范围 / LOS、本场限次与反应 / 脚本门禁。任何一步拒绝都不扣内力 / 气血 / 气势 / 弹药，不写路线、招式或共享冷却，不消费 `battle` / `ai` RNG，也不产生领域事件。路线途中卡住则是 F2 后的合法结算：成本、共享冷却、已提交路线动态态与 `flowCt` 均保留，命中失败、被招架或被抵抗同样不退款。全部写入仍属于同一命令事务，异常或不变量失败由 journal 整体回滚。

`query.moveAvailability(unit)` 返回上述 `MoveAvailabilityView`：普通招只列装配槽，绝招列全部已解锁项；每门只给一份共享冷却与上次绝招。非外放招的 `maxProjectionStep/projectionSteps` 必须省略；外放招固定返回 0、1、2 三项，逐项含 `projectionBoostActive`、总耗内、有效射程、审核模板及档级原因，超过当前上限的档保留用于解释但 `available=false`。结果、F0 与 AI 使用同一个 helper 和同一原因序，不耗 RNG、不填缓存以外状态。音功 0 档必须可见地显示为“基础音波”，不能因该布尔值为 false 就从可选档中删掉。

`projectionBoostActive` 的唯一判定点在 F0 的纯 `projectProjection`，且发生在范围枚举和资源支付之前。输入只能取已构建的 `MoveDef.projection`、`tags` 中的 `sonic`、规范化后的所选档、同一版本 Profile / 里程碑及路线预检；判定式为 `projection && (!sonic || projectionStep >= 1)`。`voice = (MoveDef.voice === true)` 同时投影进 `ProjectionInput`，但绝不进入该判定式。非外放招不调用该分支；音功 0 档得到 false，音功 1 / 2 档与所有非音功外放合法档得到 true。此布尔值随后只随本次 `MoveUsePlan` 冻结，F1～伤害结算不得重新判定，也不得写回 `GameState`。

F0 把所选档（外放缺省 0）、经脉 `stateVersion`、`maxProjectionStep`、`projectionBoostActive`、有效射程、审核模板、外放额外耗内和原招总成本冻结进内部 `MoveUsePlan`；结算顺序固定为：先以该结果选基础 / 审核范围并枚举目标，再完成所有合法性与总资源校验；F2 原子扣原招成本和外放增耗；F3～F5 提交路线并冻结攻守 Profile；F6 在唯一 Z5M 根据该布尔值选择普通或外放曲线；F7 仍按静态 `DamageKind` 做护体内劲适用率。目标格 / 朝向用这份冻结结果枚举和校验。非外放招携带 `projectionStep`，或外放招显式档越过上限，均返回 `PROJECTION_STEP_UNAVAILABLE`。左右互搏 a / b 独立冻结、过滤和计费；任一段非法则整条命令拒绝。

F2 在同一事务一次支付原招成本与外放额外耗内，再设置招式自身冷却；若为绝招，同时支付共享气势并立即设置本门 `ultimateCooldown=1 / lastUltimateMoveId=moveId / freshTurnToken=turnToken`。同门非绝招只有成功越过 F2 并完成本招结算后才清空 `lastUltimateMoveId`；其他武学、免费动作、道具、防御、待机或被跳过行动不清空。

被动 `cdMinus` 只作用于每个 `MoveUseEntry` 的招式自身 `MoveDef.cd`，最低减至 0；它不得读取或修改 `ultimateCooldown`。因此降龙大成即使把某记绝招自身 CD 减到 0，同门下一次自身行动仍受共享冷却，且冷却归零后仍须满足不得连续使用同一 `moveId`。

耗内基数引用MPREF而非当前mpMax：Lv35 MPREF=4697，天阶基准8%为half-up(375.76)=376。主/辅运收益、性质、辅运被动可用性严格用05 §5.1–5.5，持续与触发率不因auxRatio一起折扣；易运重建被动并保留合法实例计数。gateCap按绝对品阶与显示等级，解锁按effLayer，避免低武压制解锁更高层。

BattleCommand 从 09 §13.2 的生成契约导入，act 的平铺移动字段对应 BattleActionPlan；分支分别校验，不用 JsonValue payload 兜底。AI 发出的 `battle/act` 在该分支上追加可选 `ai?: AiDecisionProof`；玩家命令不得携带，AI 当前行动者必须携带，core 按 §13.2 校验后才消费 `ai` 流。左右互搏 a/b 各有目标与朝向。运劲七模式及成本见 09 §4.8.4；invest 的 0.1/0.2/0.3 在边界转为精确 investBp，化解 buffIid 必须存在。它不推进冲穴/周天/九转；旧 meditate 仅在 adapter 迁为 yunjin:tiaoxi。

道具命令只含背包实例与目标，不含效果值。普通道具本场次数、同 ID 冷却、擂台/切磋禁用和收招引用 `design/09` §4.8.3；core 从内容表解释效果。数量先进入事务 journal，再派发 `onItemUse`，使任何后续不变量失败都能完整回滚。统一事件序为 `battle/actionDeclared` → 资源/背包 / 路线变化 → `battle/itemUsed` 或 `battle/yunjinResolved` → Buff/治疗等派生事实 → `battle/actionEnded`；拒绝时这一串均不产生。事件只存模式、来源/目标、消耗和实际结果，不嵌内容文案。

`yunjin:tiaoxi` 解析为 `design/21` 的 `txp_*` 档案，仍是 1000 CT、默认 0 额外内力成本；按调息目标全序修改本单位实例。只有触及合格点穴节点时才传 `tx.rng('battle')`，硬控中断则整条命令回滚且无收益。AI / UI 必须先调用同一纯预览，不能用未来随机数替它择优。

### 7.5 招式、多段与反应队列

一招解析为 AttackFrame 序列：普通范围按 target.unitIndex，同目标按 segmentIndex；每段完整调用 §8。默认最后一段后每目标判一次附加 Buff，perHit 才逐段判；正常段之后依次连击、位移、P8 反应入队。

`mv_dashouyin_dashouyin` 使用明确的“两阶段、一伤害段”执行计划：F0 / F1 先预估并校验跃迁落点；越过 F2 且 F3～F5 提交唯一 attack 路线后，先写入跃迁位移。该阶段不创建 `AttackFrame`、不触发命中 / 招架 / Z0–Z10，也不消费第二份攻击路线。随后以最终落点为范围原点，为落点掌风按稳定目标序创建且只创建一组 `AttackFrame`；这些 frame 是该招唯一 `DamageKind='projected'` 伤害段，共享 F0 冻结的外放档与同一次路线提交，并各自只执行一次 §8 的唯一 Z5M。F0 / F1 无合法落点时整招零副作用拒绝；越过 F2 后沿既有事务、中途卡住与回滚规则处理，不为跃迁另设退款，也不可退化成“位移撞击伤害”或补发第二掌风。

引擎对该招设置结构不变量：执行计划中 `movementPhase.damageFrames.length === 0`，掌风语义段数恰为 1；多目标只是在该段内按 `unitIndex` 展开 frame，不算第二伤害段。不得因 `aoe_leap`、落地动画、碰撞或表现事件再生成伤害，不得让跃迁与掌风分别 commit 路线，也不得在掌风前后各跑一遍 Z5M。

```ts
interface ReactionItem {
  seq: number;
  depth: 1 | 2 | 3;
  kind: 'beforeHit' | 'counter' | 'formationCounter' | 'followup';
  actor: UnitId;
  target: UnitId;
  move: MoveId;
  powerBp: number;
  sourceFlags: AttackFlags;
}

interface AttackFlags {
  reflected: boolean;
  redirected: boolean;
  mirrored: boolean;
  countered: boolean;
  followup: boolean;
}
```

P8 队列 FIFO；入队继承来源位并设自身位，出队重验存活、距离、高差、控制、武器和资源。深度>3、单单位对同一敌方行动反应>1、同攻击反击>2 则不入队。reflected/redirected/mirrored 任一为真，三类反震/转移/镜返全部禁止再次生成；countered/followup 阻止反击/连击链，不能只检查同名位。

beforeHit 是判定前的同步中断帧，区别于 P8 FIFO，仍计入同一深度/次数预算。攻击者因此倒地、硬控或离开射程则按 09 §6.3 取消普通招，绝招霸体只豁免规定的打断。反震属于 P7 即时伤害，带 reflected；simultaneous 的反震延至整批资源应用后。

连击仅在合法单体类招式最后一段命中、未招架且主目标仍站立时判定；追加段沿用攻击快照、`powerMul=5000bp`、不耗内、不再连击。通用反击与追击分别使用 `5000bp`、`4000bp`，特殊条目由上游给值。core 不把这些倍率编码进 Buff 原语。

### 7.6 合击、阵法与环境行动者

合击提交时重新验证 `ComboDef`、羁绊、双方武学、距离、状态与搭档 `ct>=300`。成功后：

1. 冻结两人的招式与属性输入；扣两段各自资源，搭档 `ct-=300`。
2. 按 `ComboDef.order` 结算两段；第一段命中时第二段带 `mustHit`。
3. 两段分别走完整 Z0–Z10；Z3 加成和情缘加成读取 `design/09` §6.7。
4. 守方全合击至多反击一次且目标为发起者；合击不触发连击。
5. 发起者以两招较大收招，双方记录合击次数并各加气势。

阵法不是每帧扫描。仅在开场、阵员移动/位移/控制/倒地、阵员 E1、阵法时限变化时把 `formationRevision` 置脏；事务提交前按阵法 ID、候选阵主 `unitIndex` 重算。模板的六次旋转及可选镜像按固定次序枚举；多个合法匹配取 `(totalDeviation,rotation,mirrorRank,memberIndices)` 最小者。阵散、阵破、阵滞和虚拟阵位完全引用 `design/09` §6.8；虚位绝不创建单位或 CT。

环境行动者的 N1–N6 处理顺序引用 `design/08` §7.4；每行动一次 `ct-=1000`。它不推进任何单位持续、冷却或轮数。环境产生的新着火格、冰裂和机关事件按格 `(r,q)` 再按注册序处理；持久地形变化通过来源映射写回区域，临时 zone 丢弃。

### 7.7 倒地、化险与战斗结束

气血降至 0 时严格走 `design/09` §7.1 的十级拦截链：非死斗 → Boss 阶段门 → 剧情锁定 → 锁血 → 书灵护佑 → 化险为夷 → 诈死 → 复活 → 慈悲制服 → 倒地。不得把多个保命机制都消费。

化险为夷采用作者决定 P56（G1 采用默认）：每战至多 1 次，仅玩家方、友方和具名 NPC，切磋/擂台禁用；`chanceBp=clamp((luk-60)*75,0,3000)`，成功留 1 HP。只要流程到达该判定，就按 §4.2 调用一次 `chanceBp`；即使钳为 0 bp 也消费一次 `battle` 流，事务回滚时才恢复。

倒地移出时间轴与占格，保留救护记录。段/同时批后记候选结局；按 09 规定在 S3 致死、反应队列清空或 E6 安全点提交，不能中途跳过尚应结算的反应。终局冻结 outcome，发 battle/ended；其后 finalize 才执行 onBattleEnd→Buff 清理/转世界→伤势→调息→奖励和区域写回。重试前不得写入世界奖励，finalize 失败可重试而不重复结算（§14）。

### 7.8 战斗执行测试

| # | 场景 | 断言 |
|---|---|---|
| B-01 | 轻功 98/82/75/55 四人开场 | 首轮固定同序，不耗 RNG |
| B-02 | 首轮收招 1100/1000/900 | CT 为 -100/0/100，后续按整数跳时 |
| B-03 | 同 tick 定时、环境、三单位就绪 | 定时 → 环境 → CT 全序单位 |
| B-04 | 当前行动者同时受 -310 与 +100 CT | E6 合并后只钳制一次 |
| B-05 | 硬控 1 行动 | A 跳过、E2 递减、收招 1000 |
| B-06 | 反击触发追击再触发反击 | 来源位与深度阻断递归 |
| B-07 | 合击段 1 命中、段 2 原命中率 40% | 段 2 必中；搭档扣 300 CT |
| B-08 | 阵眼被推离模板 | 同事务阵破、光环失效、失衡生效 |
| B-09 | 环境与 Buff 都写“1 tick” | 环境只推进环境次数，不递减单位 Buff |
| B-10 | 致死且锁血、化险、复活同时可用 | 只消费优先链第一项 |
| B-11 | 命令验证失败/派生不变量失败 | 前者零写入；后者 journal 完整回滚 |
| B-12 | 同一战斗输入运行 100 次 | 事件、RNG、状态哈希逐字相同 |

## 8. Z0–Z10 伤害管线

### 8.1 输入、输出与不可变快照

每个“来源—目标—段”调用一次伤害管线。区域、多段、合击、连击和反击只是生成多个调用，不得在外层复制一套简化公式。

```ts
interface DamageInput {
  readonly attackSeq: number;
  readonly segmentIndex: number;
  readonly attacker: UnitId;
  readonly defender: UnitId;
  readonly move: MoveId;
  readonly sourceHex: HexCoord;
  readonly targetHex: HexCoord;
  readonly powerBp: number;
  readonly flags: Readonly<AttackFlags>;
  readonly prediction: boolean;
}

interface DamageResult {
  readonly judge: JudgeResult;
  readonly incoming: number;
  readonly settlement: Settlement;
  readonly trace?: DamageTrace;
}
```

整招 P1 创建 AttackSnapshot，冻结攻方面板、有效品阶/层数、招式和攻方乘区；不是每段重新冻结攻方。每段在援护/同步 beforeHit 完成后读取最新守方、资源与几何，按对应掷骰前钩子合并开关。P2 的 powerMul/旗标可修改本攻击帧，P3 的 noCrit 等仍可覆写判定；禁止把“快照”误解为跳过钩子。已经结算的区不追溯重算；新守方 Buff/破盾影响后段。simultaneous 按 §8.6 单独冻结。

### 8.2 判定顺序与 RNG 预算

Z0 固定执行：合法性/援护 → 命中 → 命中后整招反制 → 招架 → 暴击。每次到达概率判定都调用 §4.2 的 `chanceBp`，以 `nextU32()%10000<bp` 判定；0 或 10000 bp 仍各消费一次 RNG。正常实际段按命中、机制概率、招架、暴击的发生次序从 `battle` 流取数，不为未到达的分支预抽。

```ts
const rollBp = chanceBp; // 唯一实现为 §4.2，禁止复制一套取模概率函数
```

命中失败或整招作废时，不执行 Z1–Z10，也不抽浮动。招架与暴击可同时为真。附加效果的免疫/抵抗在伤害结算后按定义序独立取 RNG；它们不能借用命中 roll。预测模式绝不调用 RNG，而是返回分支概率、各分支 9500/10000/10500 bp 的区间与期望。

### 8.3 逐区执行与取整

公式唯一来源为 `design/04` §4；实现用生成的 zone registry 固定顺序，不能按对象键枚举。

| 区 | 输入与实现动作 | 唯一取整点 | trace 关键字段 |
|---|---|---|---|
| Z0 `judge` | hit=`clamp(8500+40*(hit-eva),4000,9900)`；parry=`clamp(1200+40*(parry-pierce),0,6000)`；crit=`clamp(1000+40*(crit-tough),200,7500)`，最后应用开关 | parry×方位×targetParryMult 全式末 floor，不能先除一次 | 概率、roll、开关来源 |
| Z1 `base` | `ATKmix=floor((atkOut*(10000-wIn)+atkIn*wIn)/10000)`；`D1=floor(ATKmix*124*Pactual/(100*Pref))` | 仅 ATKmix 与 D1；Pref 取攻方显示等级/书界，只除一次 | 内外比、G/L/倍率与参考威力 |
| Z2 `defense` | 各侧穿透钳 0..6000bp，floor 后混合再 floor；`D2=floor(D1*120*ATKmix/(100*DEFmix+120*ATKmix))` | 不先把 K 或 Fdef 化为舍入 bp | 防御、穿透与精确分式 |
| Z3 `dmgUp` | 攻方适用增伤先加后钳 `[0.5,2.0]` | `D3=floor(D2*F3)` | 每来源 bp、合计 |
| Z4 `dmgDown` | 守方减伤/易伤加法，钳 `[-0.5,0.75]` | `D4` | 标签筛选与合计 |
| Z4M `meridianDefense` | 读取本次守方防守路线 Profile；无合法主动防守则 10000 bp | `D4M=floor(D4×meridianDefenseBp/10000)`，只取整一次 | 双方强度、路线长度 / 质量、5000–13000 bp |
| Z5 `affinity` | `Aap=(1-wIn)*(.80+.004*apCat)+wIn*(.80+.004*apInner)`；相性加法池钳 -3000..5000bp | Aap 保留分数，与相性相乘后只取 D5 | Aap 分子/分母、相性来源 |
| Z5M `meridianAttack` | 读取整招攻方路线 Profile；标准对标准严格 10000 bp | `D5M=floor(D5×meridianAttackBp/10000)`，只取整一次 | 双方强度、路线长度 / 质量、6500–22000 bp |
| Z6 `crit` | 暴击才乘 `critDmg` | `D6` | 暴击倍率 |
| Z7 `position` | 方位10000/11000/13000；高差按08；地形加法池±3000bp；三因子合成 F7 后钳5000..20000 | `F7=floor(dirBp*heightBp*terrainBp/10000²)`，再 D7 | 三因子与方向 |
| Z8 `realmGap` | 显示等级差，每级 150 bp、封顶 ±1500 bp | `D8` | 等级差与钳制 |
| Z9 `parry` | 普通招被招架 ×0.50；绝招 ×0.75 | `D9` | 招架类型与倍率 |
| Z10 `variance` | 实战均匀整数 `[9500,10500]`；预测 10000 | `D10` | roll 值 |

以下函数为 Z1/Z2 的可执行算术核，输入已由轻量边界检查验证为安全整数/正分母；Pactual/Pref 保留分数，避免 power 被重复归一化。其余区沿表使用 §4.3 helper 和 trace sink，所有表达式常量从 04/05 的生成表取。

```ts
interface Ratio { readonly n: number; readonly d: number }
interface BaseDefenseInput {
  readonly atkOut: number; readonly atkIn: number; readonly wInBp: number;
  readonly defOut: number; readonly defIn: number;
  readonly pierceOutBp: number; readonly pierceInBp: number;
  readonly actual: Ratio; readonly reference: Ratio; readonly ignoreDef: boolean;
}
function baseDefense(x: BaseDefenseInput): readonly [number, number, number] {
  const w = BigInt(x.wInBp), o = 10_000n - w;
  const attack = floorRatio(BigInt(x.atkOut)*o + BigInt(x.atkIn)*w, 10_000n);
  const d1 = floorRatio(BigInt(attack)*124n*BigInt(x.actual.n)*BigInt(x.reference.d),
    100n*BigInt(x.actual.d)*BigInt(x.reference.n));
  const out = mulBpFloor(x.defOut, 10000-clampInt(x.pierceOutBp,0,6000));
  const inn = mulBpFloor(x.defIn, 10000-clampInt(x.pierceInBp,0,6000));
  const defense = x.ignoreDef ? 0 : floorRatio(BigInt(out)*o + BigInt(inn)*w, 10_000n);
  const k = 120n*BigInt(attack);
  const d2 = attack === 0 ? 0 : floorRatio(BigInt(d1)*k, 100n*BigInt(defense)+k);
  return [attack, d1, d2];
}
```

Lv35 锚点：ATKmix=1040、DEFmix=607、Pactual=Pref=2.88，`D1=floor(1040*124/100)=1289`；`D2=floor(1289*124800/(60700+124800))=867`；Z3/Z4 中性、Z4M=10000、Aap=9800bp、Z5M=10000 时 `D5=floor(867*.98)=849`、`D5M=849`。区值非负；incoming=D10 是 P5 前事实，不等于飘字。

Z4M / Z5M 的强度、曲线、路线兑现与中性定义唯一归 `design/21` §3.4–§4.4，core 只调用同一纯函数并保留整数 trace。顺序固定为 Z4M → Z5 相性 / 破 X → Z5M → Z6；不得把旧 `routeZ3Bp` 放回 Z3，不得把路线倍率预乘进 `MoveDef.power`。范围 / 多段攻击共享一次攻方路线结果，但每目标单独以自己的 Profile 计算相对强度与 Z4M。

Z5M 只允许二选一执行一次：非音功 `MoveDef.projection:true` 和音功 `projection:true && projectionBoostActive` 使用 F0/F1 冻结的 `projectProjection(...).meridianAttackBp`（外放曲线），其余招式使用普通 `estimateMultipliers(...).meridianAttackBp`。唯一特判是 `sonic && projection:true && projectionStep===0`：此时 `projectionBoostActive=false`，Z5M 必须走普通 `attackMeridianMultBp`；1 / 2 档才切外放曲线。除该边界外，外放档不再次乘威力，非音功选 0 档也不得退回普通曲线。`DamageTrace` 应记录静态 `projection`、`sonic`、所选档、`projectionBoostActive` 与唯一 `factorBp`；同一伤害段出现两个 Z5M、先乘普通曲线再乘外放曲线，或音功 0 档使用外放曲线，均为引擎不变量错误。

音功 0 档只切范围、增耗和 Z5M 曲线，不暗改伤害类别：其静态 `DamageKind='projected'` 保持，因此护体内劲仍按 `design/21` §4.4.1 的 40% 适用量计算。若以后要动态切换防护类别，必须联动 `design/04`、`design/05`、内容 schema、Core 与录像协议另案升级。

### 8.4 `DamageTrace` 与来源归因

```ts
interface ZoneTrace {
  zone: 'Z0'|'Z1'|'Z2'|'Z3'|'Z4'|'Z4M'|'Z5'|'Z5M'|'Z6'|'Z7'|'Z8'|'Z9'|'Z10';
  before: number | null;
  after: number | null;
  factorBp?: number;
  terms: readonly TraceTerm[];
}
interface TraceTerm { sourceId: string; key: string; value: number | boolean | string }
interface DamageTrace {
  damageSeq: number; attackSeq: number; segmentIndex: number;
  zones: readonly ZoneTrace[]; settlement: Settlement;
  rngBefore: RngStateJson; rngAfter: RngStateJson; drawCount: number;
}
```

`sourceId` 必须指向招式、Buff 实例 `iid`、装备、阵法或规则开关；不存本地化文案。release 默认只保留紧凑 `DamageResolved`，开发、录像诊断或玩家展开战斗日志时开启完整 trace。开启 trace 只能增加旁路记录，不能走不同公式或改变分配顺序。

为控制分配，`DamageTraceBuilder` 从 battle scratch pool 借固定容量数组；容量不足时报 `TRACE_TRUNCATED` 并保留各区汇总，不能影响伤害。日志可据此回答：输入值、每区前后值、哪个来源加入、在哪一次取整，而不是从最终伤害逆推。

### 8.5 伤害后结算

Settlement 完整采用 `design/04` §6 的 P5–P8 顺序：

1. `onBeforeHurt`：无敌、转移、单击上限等机制防护；整招镜返已在 Z0/P3b 决定。
2. 护体真气吸收：`shieldBlocked=min(shield,incoming)`；破盾倍率只影响 `shieldSpent`。
3. 若自然护体短路或防守路线已启用护体内劲，调用 `settleInnerGuard`，得到 `innerGuardCancelled/mpSpent/damageBeforeMpGuard`；击穿迟滞写回同一守方实例。
4. `mpGuard` 等既有资源代扣只消费 `damageBeforeMpGuard`。
5. 扣气血并区分 `uncappedHpDamage/hpDamage/overkill`。
6. 气血为 0 时执行 §7.7 倒地拦截链。
7. 仅以 `hpDamage` 计算吸血、伤害型吸内、反震；护体内劲反震仅在原招 / Buff 已授权时从 `innerGuardCancelled` 派生并带 `reflected`。
8. 判附加效果；`hpDamage=0` 时阻断伤势/流血，其他按自身标签。
9. 发事件并完成本段。

```ts
interface Settlement {
  incoming: number;             // Z10，P5 机制处理前
  settledIncoming: number;      // 无敌/转移/单击上限处理后，进入资源吸收
  shieldBlocked: number;
  shieldSpent: number;
  shieldAfter: number;
  innerGuardEligible: number;
  innerGuardCancelled: number;
  innerGuardMpSpent: number;
  damageBeforeMpGuard: number;
  innerGuardBroken: boolean;
  innerGuardDelayCt: number;
  innerGuardStagnationBp: number;
  guardedHp: number;
  mpGuardSpent: number;
  uncappedHpDamage: number;
  hpDamage: number;
  overkill: number;
  hpAfter: number;
  mpAfter: number;
  downed: boolean;
}
```

`incoming` 始终保留 Z10 原值。`settledIncoming` 是本文执行器为资源守恒新增的**内部派生量**，不冒充 `design/04` 的公共 `Settlement` 字段：它表示 P5 依优先级执行无敌、转移与单击上限后的本目标伤害；若跨包暴露，应先回填 `design/04` 的接口契约。被机制归零、转出或截下的份额另记带来源的 `prevented/redirected/capped` trace term，不混入资源守恒。

护体内劲算式、四类伤害适用率与击穿迟滞唯一归 `design/21` §4.8；core 必须断言 `postShield = innerGuardCancelled + damageBeforeMpGuard`，以及 `2×innerGuardMpSpent-innerGuardCancelled∈{0,1}`。拳脚 / 兵器 / 暗器 / 内劲外放的适用率分别为 10000 / 2500 / 0 / 4000 bp；`breakGuardBp` 取最高来源、钳 0–8000 而不相加。`damageBeforeMpGuard` 只是下一阶段输入，绝不能命名或上报为 `hpDamage`。

总守恒改为 `settledIncoming = shieldBlocked + innerGuardCancelled + guardedHp + uncappedHpDamage`。当前气血、剧情阶段门或锁血再把 `uncappedHpDamage` 截为 `hpDamage`，差额计入 `overkill` 类诊断，不得增加吸血、反震或击杀。事件顺序为 `damageResolved` → `innerGuardSettled` → 发生变化的 `shieldChanged/mpChanged/hpChanged` → `downed/phaseChanged` → drain/reflect → `effectApplied`。点穴 / 擒拿只在本次伤害后的效果阶段写入目标实例，不能反向削弱当前段。

DOT/HOT 不伪装成普通招式：DOT 按 `design/04` §6.5 的抗性、半额通用 Z4、专属 Z4、Z8 与 Boss 系数公式执行，不跑 Z0–Z10、暴击或浮动；HOT 走治疗公式。每次持有者行动 DOT/HOT 合计上限分别为 12%/8% `hpMax`，按 `design/06` 指定优先级裁剪。

治疗/护盾也不能逐乘取整：T21 的 `floor(2*1.16*1.30)=3`，`floor(1*1.29*1.30*1.2)=2`。HOT 快照施治 healPower、每跳读持有者 healRecv；DOT 整式只末尾 floor，比例因子普通/精英/Boss/守卷=10000/5000/2500/1500bp。回内每行动总量上限为 mpMax 的 6%（06 §11.1）。

### 8.6 多目标、同时批与预测

普通范围按稳定目标序逐个结算，因此前一目标死亡导致的光环消失可以影响后一目标。只有内容明确 `simultaneous:true` 才：

1. 冻结所有目标、攻方规则与资源前值；
2. 在批次 reservation ledger 中按 unitIndex 分配共享护体/代伤者 MP、机制限次，目标不读取别人的伤害结果；
3. 对同一资源地址累计 delta，校验总支出不超过冻结余额后按稳定序一次应用；不能独立算两份“尚有1次复活”；
4. 批全部应用后才排反震/反应并判胜负。共享稀缺资源按上述序仲裁为实现默认，需同步 04 §7.5；不允许负余额或机制重复消费。

多段将 `powerBp` 的商余数分给前 `powerBp % hits` 段，保证段威力之和不丢 1 bp。逐段取整造成总伤略低是规则结果，不能把尾差偷偷加回最后一段。溅射、连锁、反击、合击各自生成独立 `DamageInput`，不可共用判定。

`queryDamagePreview` 与外放范围预估调用同一 evaluator 的纯分支模式，输出命中/招架/暴击概率、条件最小/期望/最大伤害、可见 modifier，以及冻结的 `projectionStep / effectiveRange / spread / extraMpCost / totalMpCost`。隐藏敌方属性按 UI 已知区间或 `unknown`，不得泄露真实值。查询不得写任何玩法状态、不耗 RNG、不触发 hook，也不把预测 trace 写入战斗日志；只允许不进入 `GameState` / hash 且不影响候选顺序的纯性能缓存。验收须证明调用前后 `GameState`、本单位及所有单位经脉 snapshot、五条 RNG 流和待发事件队列逐字段相同。

### 8.7 伤害测试与 golden

除逐字复用 `design/04` §12 向量外，core 增加：

| # | 场景 | 断言 |
|---|---|---|
| D-01 | 0/10000 bp 判定 | 结果恒假/真；每次已到达的判定都恰耗一个 RNG 值 |
| D-02 | 暴击且招架 | 先 Z6 后 Z9，trace 顺序固定 |
| D-03 | 三个 Z7 因子 | 先合为 bp，再只取整一次 |
| D-04 | 护体 100、incoming 150、破盾 ×2 | blocked 100、spent≤100、气血前伤 50 |
| D-05 | `hp=30`、资源后伤害 50 | hpDamage 30、overkill 20；吸血基数 30 |
| D-06 | 3 段总 `powerBp=10000` | 3334/3333/3333 |
| D-07 | simultaneous 双方致死 | 两段都应用后才按胜负规则裁决 |
| D-08 | trace 开/关 | 状态、事件事实字段、RNG 状态一致 |
| D-09 | 预测查询 1000 次 | 状态与全部 RNG 流完全不变 |
| D-10 | Node 与 WebKit 重放 | 每段 zone 值、settlement、终局哈希一致 |
| D-11 | 外放招分别预估 0 / 1 / 2 档各 100 次 | GameState、全部经脉 snapshot、五流与事件队列逐字段不变；格集合与总耗内重复一致 |
| D-12 | 外放伤害段 | `projection:true` 只出现一个 Z5M，选 0 / 1 / 2 档不改变该档之外的 Z5M 曲线；普通与外放曲线不叠乘 |
| D-13 | `sonic && projection:true` 依次选 0 / 1 / 2 档 | F0 唯一判定 `projectionBoostActive=false/true/true`；范围为基础 / `[1]` / `[2]`，增耗为 0 / 200 / 400 bp MPREF，Z5M 为普通 / 外放 / 外放；三档静态 `projected` 的护体适用率均为 40% |
| D-14 | `mv_dashouyin_dashouyin` 跃迁后落点掌风命中多目标 | 跃迁阶段 0 个 frame；只有 1 个掌风语义伤害段，按目标展开；attack 路线只 commit 一次，每个 frame 只跑一次 Z5M，不产生位移伤害 |

## 9. Buff DSL 编译与运行时

### 9.1 构建期 IR，不在运行时解释 YAML

`packages/data` 负责把 `design/06` 的 `BuffDef` schema 编译为只读 `BuffProgram`；core 不解析 YAML、不执行任意字符串、不替上游定义第五种叠加或新原语。

```ts
interface BuffProgram {
  readonly defIndex: number;
  readonly id: BuffId;
  readonly stack: CompiledStackSpec;
  readonly duration: CompiledDurationSpec;
  readonly mods: readonly CompiledMod[];
  readonly hooks: readonly CompiledTrigger[];
  readonly onApply: readonly OpCode[];
  readonly onRemove: readonly OpCode[];
  readonly staticTags: readonly number[];
}

interface CompiledTrigger {
  readonly hookIndex: number;
  readonly priority: number;
  readonly whenPc: number;
  readonly chancePc: number;
  readonly opsStart: number;
  readonly opsLength: number;
  readonly limitPerTurn: number;
  readonly limitPerBattle: number;
  readonly cooldown: number;
}
```

构建器从 06 对应 schema 的 HOOK_IDS/OP_IDS 生成 TS、Zod enum、文档快照与穷尽检查。本次逐项核对 06 §6.1/6.4 为 **59 hooks、50 原语**；下表仅登记接入点，不重复定义语义。未知 hook/op 构建失败，新增时显式升 DSL 协议。

| 分组/数量 | 接入 hook（按上游登记，编译时分配稳定 index） |
|---|---|
| 生命周期 2 | onBattleStart, onBattleEnd |
| 行动 3 | onTurnStart, onTurnEnd, onExtraAction |
| 移动地形 6 | onMove, onMoveEnd, onTerrainEnter, onTerrainStay, onDisplaced, onEnemyEnterAdjacent |
| 攻击 22 | onTargeted, onAllyTargeted, onBeforeAttack, onBeforeHit, onDodge, onMiss, onParry, onParried, onBeforeCrit, onCrit, onCritted, onAttacked, onBeforeHurt, onHit, onHurt, onShieldBroken, onKill, onDeath, onAllyDeath, onAllyHit, onAllyHurt, onAfterAttack |
| 资源 9 | onSkillCast, onUltimate, onHeal, onHealed, onMpSpent, onMpDrained, onRageFull, onItemUse, onHpBelow |
| 实例 11 | onApply, onRefresh, onStack, onStackMax, onRemove, onExpire, onDispelled, onBuffApplied, onBuffApply, onImmuneBlocked, onResisted |
| 世界 6 | onWorldTick, onRest, onAreaEnter, onCalendar, onTalk, onBookSleep |

### 9.2 表达式字节码

表达式只允许字面量、白名单上下文字段、整数/定点运算、比较、布尔运算、条件选择和白名单查询函数。禁止赋值、循环、递归、属性动态索引、对象构造、正则、`eval`、`Function`、宿主函数和隐式字符串转数字。

```ts
type ExprOp =
  | 'PUSH_CONST' | 'LOAD_CTX' | 'LOAD_PARAM' | 'LOAD_SNAPSHOT'
  | 'ADD' | 'SUB' | 'MUL_EXACT' | 'DIV_EXACT' | 'MIN' | 'MAX' | 'CLAMP'
  | 'FLOOR' | 'CEIL' | 'HALF_UP' | 'ABS' | 'NEGATE'
  | 'EQ' | 'LT' | 'LTE' | 'GT' | 'GTE' | 'NOT' | 'JUMP_IF_FALSE' | 'JUMP_FORWARD'
  | 'COUNT_TARGETS' | 'HEX_DISTANCE' | 'HAS' | 'STACKS_OF' | 'STAT'
  | 'MAIN_CAT' | 'PO_MATCH' | 'IS_BOSS' | 'SAME_SIDE' | 'RHO' | 'DAYS_SINCE';
type ExprConstant = string | boolean | null | { readonly n: number; readonly d: number };

interface ExprProgram {
  readonly code: Uint16Array;
  readonly constants: readonly ExprConstant[];
  readonly maxStack: number;
}
```

复用 tech/04 §4.6 ExprNode，经版本化扩展补 string/enum/null 与 06 白名单函数；字符串不是任意路径，enum 仅在同域可比。小数字面量从源码十进制词法精确转 n/d；MUL/DIV 保留有理数至显式 floor/ceil/round 或所属公式最终边界，不能每乘一次就取 bp。round 明确 half-up，负数为 floor(x+1/2)。

栈用预分配类型 tag + Float64Array 存 safe integer/池索引，复杂分数走 BigInt 临时 lane；不能把安全整数塞 Int32Array。编译器校验类型、字段的 hook 可用域、零分母、最大栈深与中间值边界；动态除零回滚命令。布尔短路用仅前向跳转，每程序≤256 指令 **【建议值】**；`world.*` 只在允许的世界上下文使用。

### 9.3 实例、索引与派发

```ts
interface BuffInstanceState {
  iid: number;
  def: BuffId;
  source: UnitId | null;
  holder: UnitId;
  origin: { type: BuffOriginType; id: string };
  g0: number; g: number;
  stacks: number;
  turnsLeft: number;                       // design/06：-1 表示不适用
  charges: number;                         // design/06：-1 表示不适用
  penBp: number;                         // 最近一次解析值；读取前按当前免疫重算，不是独立事实源
  dormant: boolean;
  fresh: boolean;                          // design/06 的 skipFirst/countNow 运行态
  lastErodedTurnToken: number | null;
  triggerState: Array<{ key: string; cooldownLeft: number; usedThisTurn: number; usedThisBattle: number; turnToken: number }>;
  snap: Record<string, ExprConstant>;
  params: Record<string, ExprConstant>;
  phase: 'latent'|'active'|'terminal'|null;
  worldClock: { appliedAt: number; nextTickAt: number|null; nextFlareAt: number|null; phaseChangedAt: number } | null;
  revealed: SideId[];
}
```

字段名与 `design/06` §2.2 的公共 `BuffInstance` 对齐：`turnsLeft/charges=-1` 表示不适用，`fresh` 承载 `skipFirst/countNow` 的本次行动状态，`snap` 与 `triggerState` 不另造同义字段。`penBp` 是 `pen` 的 10000 bp 编码；适配层只做这一处单位换算。`iid` 在单场严格递增且不复用。持久世界 Buff 另用 profile/chapter 范围实例 ID；挂入战斗时分配新的 battle `iid`，同时保留 `originIid` 供回写。`defIndex`、属性、标签和原语均为构建产物的密集 index，存档仍写稳定字符串 ID。

每单位建 59 个 hook bucket，元素为 iid/triggerIndex；变更仅更新相关 bucket。单一持有者内严格按 `(priority,iid,triggerIndex)` 派发，逐字承接 `design/06` §5.2 的“同 priority 按 iid”。涉及多个主体的事件先按该事件规定的稳定主体序（单位用 `unitIndex`，格用 `(r,q)`，无战斗序号的世界实体用稳定 ID）枚举，再在每个主体内应用上述顺序；不能让局部 iid 抢到主体键之前。入派发时复制活跃引用至该嵌套深度独占 scratch；新增实例不进入当前快照，已移除实例跳过。嵌套派发不能覆盖父层目标/VM 栈；同实例同 trigger 同 event 仅执行一次。

性能目标是稳态事件分发/目标枚举零临时数组与闭包分配；预分配按深度分层的 scratch、实例索引和 op 队列。BigInt、journal 和外发事件仍分配，GC/上限性能须实测。增益10、减益10、其中机制合4及全场360上限按06执行；360以上拒新非机制。永久10–25/单位不计极性上限却可能先占满360，保留规则并报告上游容量冲突，不静默扩容或丢永久被动。

### 9.4 施加、叠加、互斥与品阶对抗

施加流程必须调用同一个入口：免疫 → 效果命中/抵抗 → Boss 调整 → 叠加键 → 判定 `applyMode` → 持有者提交前钩子 → 四种叠加规则 → 数量上限 → 实例事件 → cache 置脏。剧情强制来源跳过免疫命中骰，但仍计算免疫压制。`onBuffApplied` 收到只读候选 `ctx.buff`，且 `ctx.applyMode` 只能是 `create | stack | refresh`；它拒绝 `create` 时不建实例，拒绝 `stack/refresh` 时已有实例不得变化。九转护脉只匹配 `bf_neishang + create`，不能挡既有内伤的叠层或刷新。

四种叠加语义直接解释 `design/06` §4.1：

- `refresh`：延长到较大剩余值；只有更高品阶替换来源与快照。
- `stack`：层数封顶、整池取高品阶，快照按 `max/latest`。
- `independent`：每次新实例；超上限淘汰剩余最短、再 `iid` 最小者。
- `highest`：多来源并存，仅数值/品阶/剩余/`iid` 全序最高者 active；其他仍计时。

互斥组在建实例前解析；替换也必须执行旧实例 `onRemove`，再执行新实例 `onApply`。族加成先按正负各自上限聚合，再求净值；数值缓存 key 包含 `buffRevision`。

品阶穿透使用整数 bp：

```ts
function rhoBp(delta: number): number {
  if (delta <= 0) return 0;
  return Math.min(9000, 1500 + 1500 * delta);
}
```

故 `Δ=1/2/3/4/≥5` 为 3000/4500/6000/7500/9000 bp。免疫、抵抗、驱散、机制防护和新免疫净化的具体解释只引用 `design/06` §3.5；负抗性不被削弱。驱散同一效果每持有者行动至多削品一次，需记录 `lastErodedTurnToken`。

`penBp` 是 `design/06` 的 `pen` 的整数 bp 表示。它只是可序列化的最近派生值：每次结算前按当前最高覆盖免疫重算，免疫实例增删、换品或目标标签变化时也同步置脏；读档校验后先重建该值，业务逻辑不得把存档中的旧值当权威输入。移除免疫后可恢复。静态 mods 自动乘 pen，trigger 中的 amount/chance 必须按上游表达式显式引用 pen，禁止两边都乘。免疫提升会按06执行净化/削弱与层数调整；g0 原生品阶不变，g/pen/快照各司其职。

作者决定 P41（G1 采用默认）的两个天道规则在载入 run 时互斥：天道劫第6重起中/低武压制3/5；无天道关闭品阶压制并把层上限设10。它们不取消等级、修为或来源门槛，作用于 effective resolver，不改 Buff g0。

### 9.5 原语执行器与递归护栏

每个 op 先解析稳定目标列表，再依序执行；一个目标失败默认不阻断下一个 op，只有 `stopOnFail` 结束当前 trigger。运行时 switch 对生成的 `OpId` 穷尽，`default` 分支是不可达内容错误，不做静默忽略。

原语按职责调用既有子系统：

| 类别 / 原语（本次共50） | 调用目标 | 护栏 |
|---|---|---|
| 修饰5：modStat, modZone, modJudge, modCost, modRange | modifier aggregator | 只置脏，不改基础属性 |
| 伤疗10：dealDamage, heal, healLostPct, restoreMp, burnMp, drainHp, drainMp, modRage, shield, mpGuard | §8 settlement | 来源位、实际扣血口径 |
| 实例6：applyBuff, removeBuff, dispel, erodeGrade, immune, reveal | 统一入口 | removeBuff 不代替需对抗的 dispel |
| 防护9：invulnerable, damageCap, lockHp, revive, redirect, reflect, mirror, guard, negateAttack | P1/P3/P5/P6/P7 | 品阶/次数/来源位 |
| 行动8：extraAction, ctShift, skipAction, disableAction, disableSkillType, forceTarget, aiOverride, triggerMove | §7 timeline/queue | 深度、每行动/每战次数 |
| 位移隐匿3：displace, stealth, summon；兵器1：weaponBreak | grid/unit/equipment | 路径/召唤上限/所有权 |
| 杂项8：setFlag, clearFlag, setPhase, convertDamage, modTerrain, log, vfx, sfx | 事务 helper/事件 | Buff flag 仅 attack/turn/battle scope；表现不反写 |

全局派生事件深度上限 32 **【建议值】**，单根命令触发 op 上限 4096 **【建议值】**。到限即中止并回滚整个命令，而不是截断成一个看似成功的不同结果。反应深度 3 是更窄的战斗规则限制，两者同时生效。

06 的 disableAction.types 仍含旧 meditate，构建 adapter 明确映为 yunjin，所有派生禁用清单也迁移；新 IR 禁别名。hook 对可写 ctx 字段逐项校验（例如 onBeforeHurt 可写伤害、onDeath 可拦截死亡），其他字段只读。任务的永久 flag API 与 Buff 临时 setFlag 分开。

### 9.6 世界钩子与持久化

59 个 hook 中的 `onWorldTick/onRest/onAreaEnter/onCalendar/onTalk/onBookSleep` 由 §5 调度，不能把全体 Buff 每 100 ms 扫一遍。编译期为每个持久实例计算所需世界 bucket；日历事件携带稳定 period index，重复派发由实例的 `lastHandledPeriod` 幂等挡住。

战斗结束时，带 `persist` 的实例序列化为世界形态：保存定义 ID、品阶、层数、来源身份、剩余世界时长、快照和必要 params，不保存 battle `iid`、hook bucket 或属性 cache。再次入战时重建索引。书眠先派发 `onBookSleep`，再按 `design/06` 清除非永久实例；迁移不能因未知 Buff ID 而把整个存档判废，交 §14 fixup 处理。

### 9.7 Buff 测试矩阵

| # | 场景 | 断言 |
|---|---|---|
| BF-01 | 生成 hook 表 | 恰 59 个且与 schema/登记表集合一致 |
| BF-02 | 每个生成 `OpId` 最小合法 fixture | switch 全覆盖，无未知原语 |
| BF-03 | 同优先级 20 个实例乱序插入 | 派发始终按 `iid,triggerIndex` |
| BF-04 | trigger 中移除自身并添加同 hook Buff | 当前快照不重入；下次派发可见 |
| BF-05 | refresh 低品阶覆盖高品阶 | 只延时，不换来源/快照 |
| BF-06 | independent 超实例上限 | 淘汰剩余最短、再 iid 最小 |
| BF-07 | Δ=-1/0/1/2/5/20 | rho 为 0/0/3000/4500/9000/9000 bp |
| BF-08 | 40% 正抗与更高 3 品效果 | 有效抗性 16%；负抗不削 |
| BF-09 | 额外行动 | 不递减 turns/cd，不重置触发次数 |
| BF-10 | DOT 触发反震链 | 来源位阻断递归且守恒 |
| BF-11 | 世界事件重复派发同 period | 第二次无效果、无 RNG 消耗 |
| BF-12 | 表达式畸形/超指令/除零 | 构建期失败，不进入发布包 |

## 10. 任务 DSL、旗标与 Ink 桥

### 10.1 正式任务实例、条件与动作

`packages/data` 从 `design/12` §1–§2、§11 的 `quest.v1` 生成不可变 `QuestDef` 与已校验的条件 / 动作 IR；core 只保存 `quest-instance.v1` 的运行差量，不复制标题、目标文案或任务图：

```ts
interface QuestInstance {
  schemaVersion: 'quest-instance.v1';
  questId: QuestId;
  contentVersion: number;
  state: 'locked' | 'available' | 'active' | 'suspended' | 'completed' | 'failed' | 'expired';
  stageId: string;
  acceptedAt: number | null;
  deadlineAt: number | null;
  counters: Readonly<Record<string, number>>;
  branchPath: string[];
  checkResults: Readonly<Record<string, boolean>>;
  appliedEffectIds: string[];
  tracked: boolean;
}
type QuestScalar = string | number | boolean | null;
interface ScalarEntry { key: string; value: QuestScalar }
```

`stageId`、`branchKey`、`check.id` 与效果局部 ID 都是任务内稳定键。`contentVersion` 升级必须有显式迁移；被删除阶段只能映射到语义等价阶段或声明的 `obsolete` 终态，禁止按数组下标恢复。`locked/available` 可在定义投影中求得；一旦创建实例，合法状态转换严格遵循 `design/12` §1.2，主线不得以永久 `failed/expired` 死锁。

条件编译为无副作用、带类型的 IR，操作符与事实白名单逐字消费 `design/12` §2.2，并并入 `design/16` §14.4 的 `EstateCondition` 及 `design/20` 的两类传承只读条件。`all/any/not`、旗标、任务、物品、地点 / 时间、门派、NPC / 同伴、经营与传承条件均在构建期解析；字段、比较运算与枚举域不相容即失败。缺引用不是 `false`，运行态只有在迁移补齐结构后才求值；条件不消费 RNG，显式 `check` 才按稳定 `check.id` 使用 `world` 流，首次结果写入 `checkResults`，读档不得重掷。

同一事件的候选出口按 `priority` 降序和稳定源码序求值；迁移先验证当前 `stageId` 与 condition，再在一个事务中写 `stageId`、`branchPath`、检定结果、效果收据和全部动作。任务动作采用 `design/12` §2.3 白名单，并入 `design/16` §14.5 的 `EstateAction` 及六项 `legacy/*` opcode；每个动作经所属领域 helper 重新校验，不允许脚本持有可写状态。持久效果 ID 固定为 `<questId>/<stageId>/<effectLocalId>`，写入 `appliedEffectIds` 去重，禁止数组下标；战斗结算、奖励、事件 outbox 任一失败即整体回滚。任务实例挂在 chapter，书眠先归档摘要再清理，不能靠同名旗标暗续跨界任务。

### 10.2 世界事实、旗标与事件

```ts
interface FlagEntry { scope: 'chapter'|'run'|'profile'; key: string; value: QuestScalar; revision: number }
interface CounterEntry { scope: 'chapter'|'run'|'profile'; key: string; value: number; revision: number }
```

chapter 写 chapter.flags/counters，run 写 profile.runFlags 和 scoped counters，profile 写 profile.flags；scope 与容器不一致拒绝。仅明确为跨周目元进度的事实可写 profile，书眠不清 run。数组按 scope/key 唯一；计数 safe integer。事件索引为 eventType→transition，按 questId/stageKey/sourceOrder，避免扫全部任务。

每个事件批结束后运行任务队列至稳定点；同一 transition 在同一根因中至多执行一次。任务派生事件再触发任务时进入 FIFO，并受 §9.5 深度/op 上限保护。任务事实事件沿用 `design/12` §1.5 的 `questAccepted/questAdvanced/questCompleted/questFailed`，旗标写入发内部 `world/flagChanged`；载荷包含旧/新值和来源，不含本地化文本。

### 10.3 Ink 变量桥接

沿用 tech/04 §7：Ink VAR 只保存故事局部态；长期事实经 get_flag/quest_stage/has_item/affinity 白名单查询。标签解为 DialogueIntent（quest/advance、party/giveItem、battle/start），连同 storyHash/knot/tagOrdinal 交内部 bridge.commit；来源必须在该故事批准的命令标签中，不接受外部伪造 intent。选择后状态改变则重新校验并原子拒绝。

```ts
interface DialogueState {
  storyId: string; storyHash: string; entryKey: string;
  storyJsonState: string;               // inkjs 导出，纯 JSON 文本
  randomSeed: number; pendingIntents: AuthorizedDialogueIntent[];
  consumedTagKeys: string[];
}
```

已核实 inkjs 2.4.0：`new Story(json)` 会间接以 Date 播种，构造后、首次 Continue 前必须覆盖 story.state.storySeed，seed 来自事务 world 流。保存用 state.ToJson()，恢复用 state.LoadJson(text)，恢复已含 seed/previousRandom，不重抽。第三方对象仅存于 adapter cache；事务失败从旧 storyJsonState 重建，不能只回滚 GameState 而留下推进的 Story。

inkjs 2.4.0 的公开 `BindExternalFunction(..., lookaheadSafe = false)` 默认是 false，而底层 `BindExternalFunctionGeneral(..., lookaheadSafe = true)` 默认是 true；adapter 不依赖任一默认值，所有绑定都显式传参。只读且无副作用的查询可显式传 `true`；写意图优先使用提交边界标签，不得把外部函数副作用当提交机制；若兼容旧故事不得不绑定非只读函数，则显式传 `false`，且禁止在选择文案/字符串求值中调用。标签只在确认的 Continue/choice 批末入队，用 storyHash+visitCounter+tagOrdinal 幂等；预读/重绘不能发奖励。故事结构 hash 不兼容先走登记恢复 knot，无恢复点则退出并记录告警。正式构建锁 inkjs 版本，2.4.0 是本次 API 核实样本，不是最新版断言。

### 10.4 任务与对话测试

| # | 场景 | 断言 |
|---|---|---|
| Q-01 | 同一任务事件重复投递 | one-shot 奖励只发一次 |
| Q-02 | 阶段动作第 3 项失败 | 阶段、库存、旗标、RNG 全回滚 |
| Q-03 | Ink 选项出现后物品被消耗 | commit 被稳定拒绝，不产生半更新 |
| Q-04 | 重载同一 Ink state | 选择结构与随机分支一致 |
| Q-05 | 条件引用缺失 NPC/任务 | 构建失败；运行时存档遗留走 fixup |
| Q-06 | 同一查询分别置于正文与选择文案预读 | 显式 `lookaheadSafe=true` 且结果一致；无事件/RNG/状态变化 |
| Q-07 | 华辉遗谱三条奖励任一失败或安全条件失效 | 按 `design/12` §6.7.3 重验问证、无毒、隔离、辨认；三条物品、共享领取事实及 `appliedEffectIds` 全回滚。已领重放不补发、不折现；部分持有但缺领取收据进入异常恢复，不自动补齐 |
| Q-08 | 旧 `legacy/completeSynthesis.recipeId` 命令迁移后重放 | 仅经显式版本 remap 转为 `recipeKey`，保留原稳定 effect ID 与领取收据；不得因改字段再次合成或发奖。生产命令拒绝继续使用旧参数 |

## 11. 经脉、资源、营生与门派运行时

本节消费 AR-03/05/06/07 与 `tech/04` §3.8–§3.9 的生成类型；玩法字段和数值分别唯一归 `design/12`、`15`、`16`，这里只规定 core 的组合、事务与时间调度。

### 11.1 冲穴、周天与九转

`ProfileState.meridians` 直接使用 `design/15` §11.5 的 `MeridianProgress`：`schemaVersion=1`、已开穴 `opened`、未完成目标 `targets[ap_*]={progressH,attemptOrdinal}`、`turnCompleted`、可选 `turnTarget/turnState` 与 `lastAppliedMigration`。`completedMeridians`、周天里程碑、奖励与面板加成均从正式内容及该状态派生，不作为第二份权威字段。加载时排序、去重并执行 V15-01～V15-15；180 穴的工作量必须核算为 94,045H，九转为 81,000H，总量 `94,045+81,000=175,045H`。

`meridian/runSession` 在 S0 冻结 `MeridianSessionSnapshot`（目标、稳冲 / 催冲模式、显示等级、主辅内功、MP、`rateH/successBp`、旧 `attemptOrdinal` 与开始世界小时），再严格执行 `design/15` §11.6 的 S1–S8：确定 `sessionId` → 扣 MP → 推进 1 游戏小时 → 算进度 → 必要时掷骰 → 写成败 → 派生奖励 / outbox → 原子提交。物品只通过 `design/10` 的 `MeridianAid={rateBp,successBp,costReduceBp,hours,meridians?}` 进入 S0：过滤已过期和经脉白名单不匹配项，同一药物来源逐槽取最高，再与师父 / 地点 / 天书等不同来源相加并由 `design/15` 钳制；药物不得直接写进度或成功结果。冲关随机键固定为 `hash(runSeed,'meridian',targetId,attemptOrdinal)`，不消费五条顺序 RNG 流；触及关隘后无论成败都在同一事务把 ordinal 加一，普通行气不加。S8 前崩溃视为整次不存在，S8 后只重发未确认 outbox。

状态在当前周目跨书眠原值保留，新周目按 `design/13` 重置；账号只记历史最高转数，不能据此恢复奖励。提交后稳定事件使用 `design/15` §10.5 的 `meridian/sessionSettled`、`meridian/acupointOpened`、`meridian/completed`、`meridian/circulationAdvanced`、`meridian/turnCompleted`；消费方以 `(runId,eventName,targetId)` 去重。派生奖励每次从 `opened/turnCompleted` 重建，不能既烘进先天属性又保留修饰器。

### 11.2 战斗经脉模拟模块

本小节只实现 `design/21` 的战斗动态契约；`design/15` §11.5 的 `ProfileState.meridians` 仍是永久开穴、周天与九转事实源。战斗开始把这些事实投影为临时节点态，战斗结束丢弃水量、堆积、迟滞、胀损、点穴镜像与擒拿镜像；战斗调息绝不反写永久冲穴进度。

AR-18 的性质派生只消费 `design/05` §5.3、`design/21` §2.4 / §4.3.1 与 `tech/04` 编译结果：主运性质来自该内功显式 `inner.meridians`，路线性质来自扣除合法动作出口后的体段。Core 与构建器共用同一出口分类与游戏归属映射；若调试态重算，必须逐字段与编译结果相等，不能另按标准归经、整路线或最后三段机械裁切。正 / 逆周天不改写 `nature`，劳宫 / 内关出口不把阳性体段变阴，也不新增“阴阳交泰”倍率。调息 `BreathProfile.nature`、主运 `innerNature`、流畅相性和 UI 投影随同一锁定内容更新；`requiredNature` / `allowOpposedNature` 仍按 21 的准入语义消费，不能替代主运性质或反向修改路线。

`battle/meridian-flow` 以 `unitIndex` 为稳定所有权键。`BattleState.meridianByUnit` 是唯一可序列化事实，运行时 cache 只保存到该数组槽位及只读模板基底的索引，可随时重建：

| 行动者 | 实例规则 | 初始化事实 |
|---|---|---|
| 主角 / 同伴 | 每单位各一份 | 自己的 `design/15` 逐穴开通与里程碑；不得借主角状态 |
| 普通 / 精英 / Boss | 每战斗单位各一份 | `tech/04` 编译的敌人经脉模板 + 本单位行动表路线并集 |
| 召唤物 / 环境行动者 | 能独立施展武学则一份 | 自己的模板、稳定 `unitIndex` 与路线并集 |
| 虚拟阵位 / 纯地形事件 | 不创建 | 不经过武学路线，不得伪造标准实例取得倍率 |

同 archetype 单位可共享不可变的容量 / 流畅派生基底；`nodes`、主动防守、护体、速度投影、点穴、擒拿、tick 与 `stateVersion` 必须逐实例独占。生产态只物化“可用路线穴位并集 + 外部点穴目标”，不能为每次出手扫描完整 180 穴。

```ts
interface MeridianFlowRuntimePort {
  readonly unitId: UnitId;
  preview(route: MeridianRouteDef, options?: PreviewOptions): FlowPreview;
  commit(route: MeridianRouteDef, battleRng: Rng): FlowResult;
  estimateMultipliers(input: MeridianPairInput): MeridianMultipliers;
  projectProjection(input: ProjectionInput): ProjectionResult;
  estimateInnerGuard(input: InnerGuardInput): InnerGuardResult;
  settleInnerGuard(input: InnerGuardInput): InnerGuardResult;
  projectSpeed(input: MeridianSpeedInput): MeridianSpeedResult;
  applyAcupointSeal(input: AcupointSealInput): SealChange;
  applyGrapple(input: GrappleInput): GrappleChange;
  regulateBreath(profile: BreathProfile, mode: 'battle'|'rest', battleRng?: Rng): BreathResult;
  tick(input: MeridianTick): void;
  snapshot(): MeridianFlowSnapshotV1;
  restore(snapshot: MeridianFlowSnapshotV1): void;
}
```

`ProjectionInput` 必须包含由静态招式投影的 `sonic:boolean` 与 `voice:boolean`：前者取 `MoveDef.tags` 是否含 `sonic`，后者严格取 `MoveDef.voice===true`。`ProjectionResult` 必须包含单次命令派生的 `projectionBoostActive:boolean`；`voice` 不参与该派生。后者不写入单位长期状态：非音功外放恒为 true，音功仅当所选档 `>=1` 为 true。其余字段形状逐字消费 `design/21` v2.6 §12.3 的生成类型；这里不另写一份公式或枚举。`mfr_* / qnl_* / dxl_* / txp_*` 已由 Canon v1.3 `V13-05` 正式登记并归 `design/21`；`tech/04` 阻断越权定义与旧 provisional 标记，core 不动态拼 ID。`initialize` 的固定流程是：

1. 从最终解析的 `MoveDef.meridianRouteRef` 与触发器路线收集 attack / defense / movement 路线，展开 `ap_*` 后去重、按 ASCII 排序；
2. 主角 / 同伴逐穴读取永久投影，敌人应用 `routeOnly / schoolCore / fullTemplate`；
3. 读取 `design/13` 外来压制、难度与规则开关结算后的 `effGrade/effLayer`，不得在实例内用真实品阶重算；
4. 投影当前 `mpMax`、同级 STD、内功性质、周天 / 九转、装备与 Buff，所有派生量先钳制；
5. 创建 `schema:'meridian-flow-state.v1'`、`rulesProtocol:2` 的零动态态；节点按 `ap_*` ASCII 序写入；
6. 不传 seed、不复制 RNG；完成后才参与 §7.1 的经脉速度与首轮排序。

模块调用必须处于一条 Core 命令事务内。外放招在 F0 先调纯 `projectProjection`：从静态 `projection/sonic` 与所选档唯一派生 `projectionBoostActive`，同时原样投影 `voice`，校验档位 / 总资源并冻结 Profile `stateVersion`、范围与模板；`design/09` 再从该冻结结果枚举目标格。此后不重判激活位。预检硬封路发生在资源支付前；通过后固定走 `design/21` §11.4 的 F1–F10：F1 冻结双方 Profile 与节点引用，F2 原子支付招式成本和外放增量，F3～F5 逐段提交，F6 二选一执行唯一 Z5M，F7 按静态 `DamageKind` 结算护体内劲，F8～F10 处理效果、`flowCt`、事件并提交状态与 RNG。途中卡住保留已付资源、实际尝试段 CT 与伤势；只有命令非法、P1 前被反应作废或引擎异常才整笔回滚。

`flowCt` 只累计实际尝试段的 `segmentCt`，作为 §7.2 `recFlat` 的一项；预检失败为 0。攻方一次整招只 `commit` 一次，多段 / 范围共享该攻方路线质量；每个守方对同一 `causeId` 至多提交一次防守路线。反击、追击、左右互搏两招与合击的每名真实参与者各自提交，且都操作自己的实例。

防御行动的已提交路线可覆盖至守方下次正常行动；同一攻击 `causeId` 的多段只读取一次防守结果。未移动待机预置只接受 `design/21` §4.7 的最多 3 段且满 `flowCt≤240` 配置 **【建议值】**；即时招架 / 卸力 / 闪避仍受反应资格、次数与深度限制，所付 `flowCt` 进入该反应的恢复债务。主动防守失效、自己的下一正常行动开始或路线胀损时按上游生命周期清除，不能成为无成本常驻倍率。

点穴与擒拿的来源、持续、互斥、递减和图标仍由 `design/06` 的 Buff 实例拥有；模块只保存用于路线 / 速度查询的镜像。效果成功后调用 `applyAcupointSeal/applyGrapple`；时间轴推进时按 `unitIndex` 调 `tick({battleTick,...Buff剩余投影})`：模块根据 snapshot 内上次 tick 与目标 `battleTick` 求非负 `dt`，等价地令所有节点 `water=0`、有 backlog 的 dirty 节点减 `dt`（最低 0），再把自身 tick 写到目标值。持续字段只同步、不自建第二个时钟；投影值为 0 才清镜像，字段未传则保持。

`preview`、`estimateMultipliers`、`projectProjection`、`estimateInnerGuard` 与 `projectSpeed` 允许 UI / AI 调用，但必须只读。`projectProjection` 的输入输出逐字消费 `design/21` §12.3，Core 不复制档位阈值或外放 Z5M 算式；它不枚举六角格，枚举唯一归 §6.5。缓存键至少含实例 `stateVersion`、路线、有效层数、里程碑、`sonic`、`voice`、所选档与 Buff revision；任何提交即失效。Worker 超时可用状态版本仍匹配的最近完整预览或合法待机，UI 可跳动画，低内存可丢预览缓存；任何降级都不得省略敌方实例、卡住判定、音功 0 档分支、整数取整或控制镜像。

### 11.3 资源点、库存与家丁

`ChapterState.economy` 聚合 `design/16` §14 的正式状态，不再另造简化字段：

```ts
interface EconomyRuntimeState {
  inventory: ResourceStack[];
  points: ResourcePointState[];
  servantContracts: ServantContractState[];
  career: EstateCareerState;
  sectLedgers: SectLedger[];
  settlementReceipts: string[];
}
```

`ResourceStack` 的数量须等于 `provenanceLots` 合计；`EconomyLot.isNewEconomicValue` 与 `sourceBucket` 进入预算审计。`transfer_resource` 只在背包、家业仓与点仓之间移动原 lot，并另记 `sourceBucket=transfer,isNewEconomicValue=false` 的搬运收据，不能创造第二份库存或经济价值。资源 ID 使用 `res_*`，点 / 家丁 / 场所使用 `rp_ / sv_ / biz_`，均由 `tech/04` 的正式 schema 和引用门禁校验。

资源点每 3 游戏日形成候选周期，且自上次结算须累计至少 45 分钟有效经营时间；最多囤 2 个成熟周期。调度只由 §5 的世界时间驱动，先 `boundaryTick`，再按 `pointRef → output.resourceRef → servantRef` 稳定全序；一个周期所有点结束后才进入下一周期。`ResourceSettlement` 的产出、成本、预算余量、事件倍率和账簿事务号全部来自 `design/16`，core 不回算过去的所有者、等级或班表。时代层中不可用的点拒绝结算。资源、点状态、家丁合同和仓储在书眠提交时清除；只有上游明列的学识 / 图鉴 / 里程碑可保留。

### 11.4 营生职位与门派月钱

职位只接受 `job_xingjiao | job_jiaotou | job_keqing`。合同状态直接用 `JobContractState`，职业聚合用 `EstateCareerState`；签约先检查场所时代、武艺 / 名望、期限和共享排班。行脚按单结算；教头可同时签多处，但日程块不得重叠；活动客卿在全存档至多一份。签 `job_keqing` 必须把“活动合同数为 0、`activeKeqingContractId` 为空、插入合同并设置该键”放在同一事务，结束时同事务清键；读档出现键与合同不一致或多份活动客卿即拒绝。

门派身份使用 `design/12` §11.3 的 `sect-membership-state.v1`：当界唯一 `primarySectId`、至多一个 `rank5SectId`、各 `sect_*` 的 `status/rank/contribution` 与领取游标；门派公账使用 `design/16` 的 `SectLedger`，不把 L1–L5 称谓或晋升阈值复制进 core。月钱和月薪使用 30 游戏日的 `economyMonth`，仍须完成职责；空等到月末为 0。

经营条件与动作从 `design/16` §14.4–§14.5 生成 `EstateCondition/EstateAction` 联合，UI / Ink 只能选择内容已授权的动作。`reserve_schedule_blocks` 的检查与写入同事务；每个 `settle_*` 的幂等键固定为 `chapterId + objectId + periodIndex`，重复调用返回原结果。`settle_job_contract(partial)` 只支付完整报酬的 `0.60 = 6000 bp` 并把合同落为 `completed`，不得误写 `breached/ended`。`sacrifice_resource_point` 必须重新验证 `EstateSacrificeQuote` 的 `quoteId + pointRef`、权属、候选并列集合和过期 tick；点转交、停收益、唯一收据及任务旗标在同一上层事务提交，禁止运行时再用“最高收益”模糊选择器。书眠开始后拒绝新合同和结算，最终提交一次性清除 `ResourcePointState`、`ResourceStack`、`ServantContractState`、`JobContractState`、`EstateCareerState` 与 `SectLedger`；崩溃恢复仍由收据保证幂等。

### 11.5 周期状态验收

| # | 场景 | 断言 |
|---|---|---|
| E-01 | 显式休息跨 13 个时辰及多周期 | 每个周期逐一且只结一次 |
| E-02 | 保存后把设备日期改一年 | 资源、工资、月钱均不变 |
| E-03 | 两点同周期受扰 | 按 point ID 消耗 RNG，重放一致 |
| E-04 | 同时申请第二个客卿 | 原子拒绝，旧职位不变 |
| E-05 | 书眠 | 经脉全保留；资源/家丁/职位/门派按默认清除 |
| E-06 | effect ref 重建两次 | 永久加成不重复叠加 |
| E-07 | 有活动传承挖掘订单后书眠 | 先取消订单并释放全部排班，缓存进度清零；传承匣与源 / 机会收据保留 |
| E-08 | 同一挖掘 `workIndex` 重放 | 返回原收据，不重复推进缓存或发卷 |
| E-09 | `settle_job_contract(partial)` 重放 | 只支付一次 `6000 bp` 报酬，合同为 `completed` |
| E-10 | 家业报价后权属变化 / 报价过期 / 任一步失败 | `sacrifice_resource_point` 拒绝或全回滚；点、收益、收据与剧情旗标均无半提交 |

### 11.6 经验、余韵与难度的正式接口

本小节使用已定稿的 design/13 §2/§5，不属于经脉/经济建议规则。profile.progression 持有 `ExpState{realLevel,expFp}`、`YuyunState{points,progressFp,gainedThisChapter,fateDebt,log}` 与 rewardReceipts；`EXP_SCALE=100`，技能积蕴仍归05，禁止与角色经验共用账本。同伴依18成长，不套主角经验分配。

```ts
function needExp(level: number): number {
  assertIntRange(level, 1, 69);
  const l = BigInt(level);
  return 10 * floorRatio(l*l*l + 32n*l*l + 260n*l + 450n, 100n);
}
```

上式等价于13的 `round10(0.1L³+3.2L²+26L+40)`；累计 cum(35/50/62/70)=96040/313260/657310/1006850。奖励在 battle/finalize、任务步骤或事件结束发，receipt 为来源实例+结算序，战斗内不升级。先合并 expScale/dm_exp 后一次 half-up；`expVal=10+5L`、Boss typeMul=10，速战角色×0.8、武学×0.5，仅各用一次。

grantExp 按13 §2.9 逐边界处理：高武且低于入场等级时追赶倍率3/2，用 `ceil((2*roomFp*mulDen-mulDen)/(2*mulNum))` 反求跨级需用原始经验；到达追赶终点立即停倍率，到书界上限后仅余量进余韵。第17点起 unit 翻倍，先偿 fateDebt 再加可花点；书眠按新旧 unit 比例 half-up 迁余数并钳到新 unit−1，保留主角 expFp，不把全部奖励直接转余韵。

RuleSwitchState 保存 difficulty、天劫层、开关、difficultyLog 和 ruleRevision；新周目选定的开关锁定，蒙昧/速决按13允许随时改。江湖/侠客/宗师仅战斗外切换，天劫整周目锁定，切换事件写日志；进入战斗冻结本战规则。dm_hp/dm_atk 与区域 enemyStatMul 独立相乘，评级加 dm_rat，spd 在最终取整前叠 dm_spd；成就读完整难度史。每次变化发 progression/expGranted、progression/levelUp、progression/yuyunChanged 或 rules/changed，来源和取整 trace 可审计。

验收至少涵盖一次奖励越追赶线与封顶线、第16→17点、债务优先、书眠余数、重复 receipt、低难度后切回宗师不恢复成就资格。

### 11.7 跨年代传承运行时

`ContentRegistry.legacy` 只读消费 `tech/04` §3.10 生成的 `legacy.v1`；运行态按 `design/20` §2.6、§4.4、§11–§12 分成当前周目与当前书界两层：

```ts
interface LegacyRunState {
  sourceStates: LegacySourceState[];             // 按 sourceId ASCII 升序
  fragmentIds: LegacyFragmentId[];               // 传承匣；按 sourceId + slot 排序
  keystoneItemIds: ItemId[];                     // 仅登记的 it_xinwu_*
  scheduleReceipts: string[];
  opportunityReceipts: string[];
  synthesisReceipts: string[];
}
type LegacyCacheRuntimePhase = 'hidden' | 'revealed' | 'working' | 'ready' | 'opened'; // 【建议值】
interface LegacyCacheRuntimeState {
  cacheId: LegacyCacheId; sourceId: LegacySourceId;
  state: LegacyCacheRuntimePhase;
  progress: number; nextWorkIndex: number;
}
```

缓存 `state` 是 core 为任务只读条件提供的有限执行枚举；`design/12` 已开放该字段，但 `design/20` 尚未列出值域，因此五值闭集仅作**【建议值】**，上游登记前不得伪称已定 schema。内容定义、地点、`requiredProgress` 与奖励仍只读 registry。`LegacyExcavationOrder` 使用 `design/16` §14.3 的正式形状并挂在当界经济状态；`LegacyHeirSpawnRequest` 使用 `design/18` §9.5 的正式六字段请求，`bloodline` 另强制非空 `evidenceRefs`。core 不生成谱系事实，也不把运行时 UUID 注册成 `npc_*`。

任务层两类只读条件与六项 opcode 逐字消费 `design/12` §2.2–§2.3：`legacy` 只读 `status/fragmentCount/hasKeystone/localMisses`，`legacyCache` 只读 `state/progress`；`legacy/revealCache`、`legacy/advanceCache`、`legacy/resolveOpportunity`、`legacy/grantFragment`、`legacy/grantKeystone`、`legacy/completeSynthesis` 分别映射唯一传承 helper。`effectId` 与机会 / 校合 `receiptKey` 双重幂等；任务阶段、材料、武学实例、收据、事件和 RNG 在同一 `CommandTx` 提交，任一步失败全部回滚。

书界苏醒调度固定如下：

1. 依 `design/20` §2.7 的硬过滤顺序产生候选；未通过者不消费 RNG、不增加 `misses`。
2. 候选按 `lgs_*` ASCII 升序，每项只通过 `tx.rng('qiyu')` 做一次 `chanceBp`；命中者再取一次 `lotteryKey`。不得新增 `legacy` RNG 流，也不得从 seed 元组另算结果。
3. 若批次开始前持久化载体已满，整批写 `quota_full_before_batch`，出现 RNG 消费为 0；若同批竞争超额，候选已消费出现 / lottery RNG，未入选命中项写 `lottery_deferred` 且不增加 `misses`。两类收据不可合并。
4. 入选后才按同一 `qiyu` 流选择 `heir/cache`、地点和机会；`LegacyHeirSpawnRequest` 或缓存创建失败则事务整体回滚，不能留下半份调度收据。
5. 残本机会按 `opportunityId` ASCII 升序；第三次合法机会保底，缺卷候选按 `upper/middle/lower` 固定枚举后抽取。预览、地图标记、条件查询和日志均不得消费 RNG。

家丁代挖调用 `legacy_assign_excavation / settle_legacy_excavation / cancel_legacy_excavation`，每单至多 3 人；每块工作量逐人算 `10 + floor((production + relevantSkill)/10)` 后求和。结算只推进缓存进度并写 `chapterId+cacheId+workIndex` 收据，最终开匣、伦理选择、发卷与信物仍要求玩家到场。`BS_COMMIT` 顺序固定为：拒绝新订单 → 取消活动订单并释放排班 → 清除当界缓存进度 → 保留传承匣和源 / 机会 / 校合收据 → 执行普通武学携带 / 残篇 → 新界重算 eligible；任一步失败恢复状态、五流 RNG、事件和收据。

合成调用 `design/20` §7 的门槛与事务。产物保留真实 `sourceGrade`；`learnSource=legacy_synthesis` 在当前完成书界额外应用 Canon v1.2 §3 的 `legacyWorldCap`：天龙至侠客 12，碧血 / 鹿鼎 / 连城 / 书剑 / 飞狐 / 雪山 10，白马 / 鸳鸯 9；`rule_wutiandao` 关闭该专用上限。进入下一界后改走普通外来规则。`legacyWorldCap` 不改真实品阶、普通本土习得或非传承来源。

传承验收至少逐项实现 LEG-T01–T15，并额外跑 10,000 个业务 seed **（待实测）**：每个 seed 同时在 Node/V8 与 Playwright WebKit/JSC 重放书界调度、机会、强行校合和书眠；核对候选顺序、五流游标、两类配额收据、事件字节、终态 hash 与 39 源配额。发布候选另抽 30 份完整录像做跨引擎逐 checkpoint 一致性门禁；30 是与 `tech/08` / `tech/09` 对齐的**【建议值】**。

## 12. NPC、同伴与年代状态

### 12.1 当前时代的 NPC 投影

NpcDef、CompanionState、CompanionSnapshot 采用18 §7与tech/04 §3.11。具名 NPC 的生卒年对应 registry 中带精度的 `born` / `died` 事实，运行态只保存分支覆盖与年代投影，不复制考据原值；生成/设施实例持久化出生/生成时年龄基点，不能只存当前年龄段：

```ts
interface NpcRuntimeState {
  runtimeId: NpcRuntimeId;
  identity: { t: 'named'; npcId: NpcId } | { t: 'generated'; templateId: string; seed: number };
  appearanceKey: string | null;
  lifeOverride: NpcLifeOverride | null;
  generatedAge: { bornYear: number|null; ageAtEpoch: number; epochYear: number } | null;
  presence: 'present'|'away'|'reference'|'dead'|'life_unknown';
  ageBand: AgeBand | null; locationRef: string | null;
  legacyTimeline: boolean; revision: number;
}
interface CompanionLedgerState {
  companions: CompanionState[];
  snapshots: CompanionSnapshot[];
}
```

具名 NPC 先处理分支 lifeState、明确死亡/显式存活证据，再结合目标 appearance 与 birth/death 精度判定；完整已知年才用 born≤year<died。died=null 仅表示未知，不能推成永久健在；无目标 appearance 不生成，同年死亡无先后证据为 life_unknown，不自动招募。年龄从 bornYear 或 ageAtEpoch+(year−epochYear) 求出再映年龄段；未知年保留 unknown，不编造岁数。

运行时 UUID 默认 RFC 9562 UUIDv5：固定项目 namespace、UTF-8 规范名称元组 `(runId,chapterId,templateId,spawnKey,spawnOrdinal)`；ordinal 事务提交才增。namespace 在 shared 的版本化常量登记；snapshot UUID 同理用角色身份+事件序。SHA-1 仅用于标准名称映射、不是存档完整性；纯同步库通过禁 API 审核，禁止 randomUUID/Date。重进相同 spawnKey 复用已有身份与 seed，不重掷。

### 12.2 离队快照、书眠与重逢

离开 `recruited` 及书眠提交前写不可变快照，保存真实等级、先天、武学真实层数、装备引用、永久修正、人格、好感和羁绊，以及直接复用 15 §11.5 完整类型的 `meridianProgress`；有效品阶/层数是时代投影，不烘入快照。`latestSnapshotId` 指向最新项，历史项只追加。

永久经脉进度按 `design/18` 的重逢步骤与 `design/15` 迁移规则恢复，不能从 `permanentMods` 或当前主运反推，也不能把开穴奖励再次累加；21 的水量、迟滞、胀损、点穴 / 擒拿镜像只属于本战。旧档有权威进度就迁入，确知从未开启才补零；无可靠恢复证据则保留原档、拒绝候选换载，不以空进度覆盖。编组前再读当前 `NpcAppearance.combatEligible`，儿童 / reference 强制 false；非战斗同伴仍可参与探索与经营。

书眠事务：保存健在已招募者→清活动引用→保留本周目关系/履历/改命→切时代→求 presence/age band→建重逢线索。重逢合并仅对真实等级、先天逐项 max，技能并集且真实层 max，permanentMods 按ID并集；装备 resolveOwnership 防复制。好感/羁绊按18关系规则迁移，不把所有数字都取max；随后套新书界压制。ledger 跨书，不自动跨周目，新周目继承由13决定。

事件名必须保持 `design/18` §7.4 的稳定契约：`companionRecruited/Departed/Betrayed/Died/FateRescued/Rejoined/StationChanged`；这是 §3.4 新事件 slash 命名约定的上游例外。年代投影另发内部 `npc/presenceChanged` 与 `npc/ageBandChanged`。战斗倒地默认不等于剧情死亡，只有 `design/18` §4.3 列出的明确动作能写 `dead`。

### 12.3 同伴确定性测试

| # | 场景 | 断言 |
|---|---|---|
| N-01 | `died==wakeYear` 且无事件序 | `life_unknown`，不可自动重邀 |
| N-02 | `fate_rescued` 且有后世画像 | 采用分支 lifespan，不被原死亡值覆盖 |
| N-03 | 旧层数 10、新画像 9 | 合并仍为 10；有效层可因书界压制下降 |
| N-04 | 新画像新增已有 `sk_*` | 并入；未知武学不得临时造 ID |
| N-05 | 同一永久修正两边都有 | 按稳定 ID 仅保留一次 |
| N-06 | 书眠规则验证失败 / 书眠后素材加载失败 | 前者全回滚；后者待挂载重试、不重复书眠 |
| N-07 | died=null但无后世appearance / 生成者跨年 | 不自动长生；年龄按持久基点演进 |
| N-08 | 已开穴同伴书眠、重逢，或旧档仅有派生加成 | 有权威进度则保留开穴 / 进度 / ordinal / 转数且不重复加奖励；无可靠进度拒绝迁移并保留原档；临时点穴不进入离队快照 |
| N-09 | 非战斗、儿童或 reference appearance 尝试部署 | `combatEligible=false` 时拒绝战斗位，不能用可招募事实替代参战资格；合法非战斗用途仍保留 |

## 13. Utility AI 与 Worker

### 13.1 为什么选择 Utility AI

普通战斗采用 `design/09` §8 的 Utility AI，而不是通用行为树：候选本来就是“落点 × 行动 × 目标”，伤害、控制、治疗、风险、资源、阵法和剧情目标能用同一可解释评分组合；性格只需调权重，不必复制大量树分支。Boss 仍由确定性阶段状态机提供候选禁用、强制轮换和目标修正，再交 Utility AI 在阶段允许集内选招。

评分公式不在本文重定义。实现把上游小数常量在构建期转为 bp，以整数累计 `utilityMicro`；最后按效用降序，再按 `(actionRank,targetUnitIndex,r,q,dir,moveId)` 全序。`ai_basic/adept/expert` 的前三/前二名概率选择使用请求中的 `aiSeed`；`ai_master` 前瞻后取第一。

### 13.2 可见快照与 Worker 协议

```ts
interface BattleAiRequest {
  requestId: string; stateVersion: number; battleRevision: number;
  actor: UnitId; tier: AiTier; personality: string; aiSeed: number;
  decisionToken: number; snapshot: BattleAiSnapshot; workBudget: number;
}
interface BattleAiResponse {
  requestId: string; stateVersion: number; battleRevision: number;
  command: Extract<Command, { t: 'battle/act' }>;
  completedBatch: number; bestSoFar: BattleActionPlan|null;
  stats: { visited: number; generated: number; elapsedMs?: number };
}
```

快照只含本阵营可见单位、最后已知位置、可见地形/预警、行动者招式与资源、公开时间轴、阵营黑板；隐藏单位真实位置和不可见陷阱不得进入。目标 ≤64 KiB、structured clone ≤2 ms 均为 **（待实测）**。Worker 只返回普通命令，core 以当前状态完整重验；版本不匹配直接丢弃并重请求。

`aiSeed` 用 `ai` 流当前状态的下一值纯预览，不先提交；同一 `(stateVersion,battleRevision,actor)` 的重请求必须复用它。Worker 返回的普通 `battle/act` 命令携带该值；core 在同一命令事务内先核对“等于当前流下一值”，命令成功才连同其他写入消费，拒绝/回滚则不消费。超时 fallback 也携带同一值。这样取消、重复或过期响应不改变 RNG；录像中的最终命令自带决策凭证，重放无需重新运行 AI。

### 13.3 节点预算与墙钟预算

workBudget 对路径展开、一次目标评分、一次前瞻展开分别计一工作单元，固定循环和候选序。默认 basic/adept/expert/master=1024/4096/16384/32768 **【建议值】**：48落点×12招×24单位的单体枚举上界为13824，expert 取下一2次幂16384；master 为其2倍容纳前5候选×后2行动，其他档依次1/4、1/16。范围多方向及特殊动作仍吃预算，不保证遍历全部候选；这是起始容量，不代表耗时已满足。无超时时同快照/seed/预算走相同工作序。

tech/03 与09的5/15/40/80ms为每次决策预算，2倍由 host watchdog 执行。Worker 每64工作单元 **【建议值】** 发布完成批次的当前最优合法候选；超时取最新完成批 best，未完成候选不参与，尚无候选则 basic/合法待机。采用上游“当前最优”，不固定取第一个候选。Worker 不可用走主线程 basic；被拒命令不耗 seed，重验后提交待机。

AI 本身按09不要求跨引擎/跨设备同招：超时可能改变最终选择。确定性保证在同一已记录命令序列的 core；录像记录最终命令及任何实际改变控制策略的 setAuto/策略事件。不能让“连续超时整场降档”只留在诊断、却改变未记录规则状态。墙钟仅在 AI host/worker 壳测量，pure evaluator 与 battle core 不读墙钟。

候选生成先复用 §7.4 的 `filterMoveCandidate / query.moveAvailability`，再复用玩家的六角可达集、范围、LOS 和 §8 预测查询。`projection:true` 时把 `0..maxProjectionStep` 中资源足够的每一档作为独立候选；每档、每个合法中心 / 方向都调用 §6.5 的同一模板，不能用方形包围盒或纸面面积估算。评分读取裁剪后实际命中的敌方 / 友方 / 地表集合，使伤害、击杀、控制、治疗、友伤、危险地表、总耗内、路线堵塞风险和 `flowCt` 都进入 `design/09` §8 的对应项；敌方、召唤物与玩家完全同规，不免外放成本。最终效用相同时先取较低 `projectionStep`，再按既有稳定键裁决，避免无收益扩张。`ai_master` 只对固定前 5 个候选模拟后续 2 个行动者。失控 `charm/control/fear/confuse/berserk/obey` 使用 `design/09` §7.9 的专用候选/目标规则，仍从同一入口输出命令。

### 13.4 AI 验收

| # | 场景 | 断言 |
|---|---|---|
| AI-01 | 改动不可见敌人的真实坐标 | 候选、分数、命令不变 |
| AI-02 | Worker 重复/晚到响应 | 仅匹配 request/version 的首个响应可提交；拒绝不耗 ai 流 |
| AI-03 | 同 seed 与 workBudget 重跑 | visited、命令逐字相同 |
| AI-04 | 人为触发 2× watchdog | 取最新完整批best；可选招不同，但所录命令可复放 |
| AI-05 | 候选输入顺序打乱 | 全序后结果不变 |
| AI-06 | Worker 不可用 | 主线程基础决策或待机，不阻塞战斗 |
| AI-07 | 外放高档多命中 2 敌但多伤 1 友，低档只命中可击杀目标 | 逐档使用实际格集评分；按 09 权重选效用最高档，不固定取最高档 |
| AI-08 | 两个外放档收益完全相同 | 选较低 `projectionStep`，命令记录该档；敌方也支付同档成本 |

## 14. 存档、迁移、录像与重放

### 14.1 序列化边界

`serialize()` 先断言 §1.5 不变量，再输出规范 `GameState` JSON 值；gzip、WebCrypto、IndexedDB、TSAV 头和云同步都在 core 外，容器沿用 `tech/08` §3。TSAV v1 头不超过 64 KiB，声明的解压原文不超过 32 MiB；这两个限额由 I/O 层在解压前后执行，core 不信任反序列化输入。core 不提供对活实例原地 `load()`：I/O 层完成下述链路后用 `createCore(ports, validatedState)` 构造候选实例，通过只读冒烟查询后才由 `CoreHost` 原子替换引用。

读档顺序固定为：容器/哈希校验 → JSON 边界校验 → 结构迁移 → `contentHash` 对比与 ID remap/fixup → 全量 GameState 校验 → 重建 cache/index → 运行只读冒烟查询 → 才替换当前实例。任何一步失败都保留原存档和旧运行实例。

### 14.2 纯迁移与内容修复

```ts
interface MigrationContext { readonly fromContentHash: string; readonly targetSchema: number; readonly remapVersion: string }
type StateMigration = (old: JsonObject, ctx: MigrationContext) => JsonObject;
interface FixupIssue { path: string; oldId: string; action: 'remap'|'tombstone'|'refund'|'obsolete' }
```

迁移链完全采用 `tech/08` §3.5：`SAVE_SCHEMA` 单调递增，`migration[n]` 只做 n→n+1，发布后不可改旧函数；不读墙钟、不取随机、不联网。结构迁移后才按 `tech/04` 的 `idRemaps` 修内容引用。未知物品、武学、任务的退款/残篇/obsolete 规则由 `tech/08` §3.6 执行并留报告，不静默删除。

每个发布 schema 保留至少一个夹具；相同旧输入分别迁移两次应同字节，已在目标 schema 的输入不再套旧迁移。旧档→迁移→保存→重读保持状态。历史临时 schema 接入 `design/12/15/16` 正式字段时必须升版迁移；`tech/08` 示例数字 7 不是已发布版本。旧战斗中档必须能装对应 core/rules/RNG 协议，否则保留原档并提示退回登记的战前恢复点，不能修补一半战斗继续。

### 14.3 `BattleReplayV1`

录像从已生成战场、尚未确认布阵的 deploy 快照开始，到纯战斗 ended；无布阵战也从相同初始化边界开始并录自动 deploy。战斗 handler 只读写 BattleSession 及锁定 registry，禁止查询外部 party/chapter。入场已把背包副本、角色战斗能力、门禁事实、胜负条件、规则开关复制进 BattleState；战中剧情分支需预编进本战，外部选择须成为记录命令。

```ts
interface BattleReplayV1 {
  schema: 1; contentHash: string; appBuild: string; coreVersion: string; battleId: string;
  rulesProtocol: number; rngProtocol: number; openingHash: string;
  opening: BattleStartSnapshot;
  commands: Array<{ seq: number; command: BattleCommand; afterHash?: string }>;
  finish: { outcome: BattleOutcome; commandCount: number; terminalHash: string };
}
interface BattleStartSnapshot {
  session: BattleSession;
  registryRefs: string[];
  runtimeMartialArts: CreatedMartialArtState[]; // 本战实际可达的动态定义闭包，按 id 全序
}
interface BattleSession {
  battle: BattleState; battleRng: RngStateJson; aiRng: RngStateJson;
  acceptedOrdinal: number; decisionOrdinal: number;
}
```

`rulesProtocol=2` 时，`battle.meridianByUnit[].flow` 必须逐单位保存 `schema:'meridian-flow-state.v1'`、`rulesProtocol/unitId/unitIndex/kind/tick/stateVersion`、`grappleLevel/grappleSource/grappleRemaining` 与完整动态 `nodes`；外层同时保存会跨命令生效的 `activeDefense/movementProjection/innerGuard`。`BattleUnitActionState.ultimateBySkill` 也必须随 battle 保存 `ultimateCooldown / lastUltimateMoveId / freshTurnToken`，否则中间 hash 无法证明绝招轮换确定性。数组按 `unitIndex` 或 `skillId`，节点按 `ap_*` ASCII 升序。单位 snapshot 绝不复制 RNG；唯一 `battleRng` 仍只在 `BattleSession` 保存四个 uint32。

外放选择属于命令事实：`skill` 与 `dual.a/b` 原样把 `projectionStep` 写入 `commands[].command`，即使为 0 也按调用方提交值规范化后记录；非外放招不得出现该字段。录像和 checkpoint 不保存“预览格集合”作为第二事实源，重放必须以锁定内容、规则版本、经脉 snapshot 与命令档位重新求 `maxProjectionStep / effectiveRange / spread / extraMpCost`。规范 command JSON（因此 replay hash）必须覆盖 `projectionStep`；只记录推导后的命中格、或重放时自动改成当前最高档，均应在首个命令处报差异。

规范 replay hash 因而覆盖每个单位的经脉动态态、唯一 `battleRng`、内容版本、协议和命令所选外放档。事件的概念名逐字消费 `design/21` §13.5；落到本文统一的 `域/过去式`信封时映射为 `battle/routeCommitted`、`battle/routeJammed`、`battle/nodeRuptured`、`battle/meridianAttackMultiplied`、`battle/meridianDefenseMultiplied`、`battle/innerGuardSettled`、`battle/meridianSpeedChanged`、`battle/pointApplied`、`battle/grappleApplied`、`battle/breathCompleted`，并携带整数输入 / 输出、来源 ID 与命令序进入可回放事实。`route.previewed` 与外放格预览都只是 host 诊断，不产生 `DomainEvent`、不入 hash。

BattleCommand 包含 act/deploy/order/free/setAuto/concede/retry/undo，不只录 act。seq 从0连续；每10条中间hash为建议；openingHash 与 afterHash/terminalHash 置于被哈希对象之外。`appBuild` 与 `coreVersion` 逐字映射到 `tech/08` §10.2 的运输 header：前者定位可部署应用工件，后者定位玩法 runner；`GameState.meta.coreBuild` 是二者组合后的内部诊断标识，不作为第三套运输字段。精确摘要输入为规范 JSON 数组 `["tianshu:battle-replay:v1",appBuild,coreVersion,rulesProtocol,rngProtocol,contentHash,runtimeMartialArts,commandPrefix,session]` 的 UTF-8；`commandPrefix` 由截至采样点的已接受记录按 `seq` 升序后投影 `record.command` 得到，即只含规范 `BattleCommand` 载荷，开局为空，不含 `seq/accepted/afterHash`、墙钟或诊断字段。因此 `skill` 与 `dual.a/b` 的 `projectionStep` 直接进入 hash，即使两档恰巧重算出相同 session 也不可碰撞；推导格集合不进入 `commandPrefix`。registryRefs 是静态内容传递闭包的核验辅助，不替代 contentHash。P08 的自创武学不属于静态内容包，必须把本战可达的完整运行时定义按 ID 冻结进 `runtimeMartialArts`；重放不得用当前存档同槽定义覆盖。session 自己不含hash，避免自引用。

battle 本地事件序与 acceptedOrdinal 也进入域；外层 GameState 的 event seq/causeId 仅作运输映射，不回传影响战斗。重放不重新跑AI，只验证所录seed并推进ai流；不调用loot/world/qiyu。ended 后停止录像，host 另提交 finalize：用 battleId+outcomeSeq 收据执行 onBattleEnd、Buff/资源/地形写回、伤势/调息、奖励和任务；五流变更同事务提交，成功清 battle。失败回滚全部，不能重复抽掉落。

重试/悔招保留命令历史：checkpoint 只含战斗规则片段与两流，不包含 checkpointStore 自身，避免递归快照。undo 恢复目标片段后扣当前 undoLeft，保留当前重试数/消耗账本，不从旧片段恢复次数；禁止无限悔招。restart 恢复入场快照并保留累计retry/assist，finalize前未写世界资源。完整录像按原序执行undo/retry，而不是删掉历史后拼接。

经脉 checkpoint 恢复时先校验 schema / `rulesProtocol`、单位身份唯一性、节点排序与范围，再逐单位调用 `restore`；任一单位失败则候选战斗整体拒绝，不允许丢弃经脉态续跑。v1 的 `bonusCapBp/routeZ3Bp` 只能交旧 runner；v2 使用 `routeQualityBp`。没有明确迁移器的进行中 v1 战斗回到已登记战前检查点，战外永久经脉则从 `design/15` 事实重新投影。

运输仍是 `tech/08` 的 NDJSON.gz：压缩 ≤2 MiB、声明未压缩 ≤16 MiB；超限降级摘要而非截断录像。信封 schema 与 `BattleReplayV1.schema` 分开演进。

### 14.4 重放与首差异

重放器按 `appBuild+coreVersion+rulesProtocol+rngProtocol+contentHash` 装匹配 runner 与规则包，校验 opening hash 后逐条走同一 battle handler，检查中间/终局摘要。只锁内容而换规则代码同样不可重放。缺旧工件则标“不可验证”，保留原录像；首差异给命令 seq、两流、事件类型、JSON Pointer 及双方值。

Node/V8 与 Playwright WebKit/JSC 都跑同一录像。Playwright WebKit 不是实际 iOS 真机替代；发布候选仍需 `tech/03` 真机矩阵 **（待实测）**。

`commandPrefix` 纳入摘要是 Canon V17-08 已登记的协议契约变化。规则号同为 2 也不能把旧 hash 工件交给当前 runner 重算：仍按完整 `appBuild/coreVersion/rulesProtocol/rngProtocol/contentHash` 定位旧工件，保留旧 runner 或标不可验证。新增回归须隔离变量：固定版本、内容及测试 session，只改一个合法 `skill.projectionStep` 或 `dual.a/b.projectionStep`，证明规范命令字节与 hash 变化；另证明固定已接受命令顺序时，仅改 hash 域外的运输元数据、墙钟或诊断字段不改变规范输入。开局 `commandPrefix=[]`，拒绝的命令不进入前缀。

**实现状态（2026-09-30）**：仓库尚无生产 `packages/core` 与正式具名 Boss 固定种子 `BattleReplayV1` 夹具。§14 / §15 规定的是接口和验收；现有 Python golden / `boss_pacing.py` 只证明参考计算，不能证明完整行动表、敌方输出、援军 / 阶段和目标机制已通过。默认保持章节耐久与（待实测），生产落盘后按 `design/09` §8.8.11 对每份实际遭遇预算运行低 / 中 / 高配及四难度中配矩阵，校验唯一整场耐久、稳定分配、结束原因和 hash。

## 15. 测试与 CI

| 层 | 范围 | 必须闸门 |
|---|---|---|
| 类型/静态 | strict TS、无 DOM lib、依赖方向、禁用 API | 每次提交 |
| 单元 | RNG、bp、hex、Z0–Z10、叠加、条件 VM、迁移 | 每次提交 |
| 属性测试 | 排序扰动、伤害守恒、A* 最优、事务回滚、序列化往返 | 每次提交，固定失败 seed |
| 模型测试 | CT 与慢速逐 tick oracle；journal 与深拷贝 oracle | 每次提交 |
| 内容契约 | 59 hooks、全部 OpId、引用与上限、任务图 | 内容构建 |
| golden | Node + WebKit 的探索/战斗/任务/书眠录像 | 合并与发布 |
| 迁移 | 每个历史 schema → 最新 → 冒烟命令 | 合并与发布 |
| 性能 | 600 tick、24 单位群战、最大 Buff、AI、存读档 | 发布候选 **（待实测）** |
| 传承确定性 | LEG-T01–T15、10,000 seeds；发布候选 30 份 V8/JSC 完整录像 | 合并与发布 **（待实测）**；30 份为【建议值】 |
| 经脉慢模型 | TypeScript 对 `tools/balance/meridian_flow_golden.json` 全字段，Node + WebKit 各跑 | 每次提交；不得只比最终伤害 |
| 绝招轮换 | 同门多绝招的共享冷却、禁止连续同招、同门普通招解除、`cdMinus` 隔离；录像中途恢复后逐字段相同 | 每次提交；Node + WebKit |
| 外放加持 | 三档射程 / 模板 / 成本、点穴降档、统一过滤、F0 唯一 `projectionBoostActive` 判定、唯一 Z5M、音功 0 档特判、大手印非伤害跃迁 + 单掌风伤害段、敌方 AI、多次预估零副作用、命令档位与 replay hash | 每次提交；Node + WebKit；对拍 `projection_sim.py --check` |
| AR-18 派生 | 内功缺 `meridians` 与显式 `[]` 区分、主运 / 调息同源；阳性体段经劳宫不变阴、体段空 / 平票调和、游戏归属与标准归经不同的节点、掌法动作并集、正逆周天不改性质 | 生产实现合并前；与 `tech/04` 和 Python 同一正反向量，不新增伤害倍率 |
| 正式具名 Boss | 每份实际遭遇预算的固定种子 `BattleReplayV1`：低 / 中 / 高配与四难度中配、整场耐久守恒、敌方外放、阶段 / 援军 / 非击杀目标、同录入命令终态 hash | 该书界发布前阻断；当前夹具尚未落盘 **（待实测）** |

确定性 fixture 至少覆盖：普通战、环境战、多段范围、反应深度、合击/阵法、Boss 阶段、跨日周期、任务与 Ink、书眠及同伴重逢，以及传承的调度 / 配额 / 挖掘 / 校合 / 书眠。随机测试失败时记录业务 seed 和最小化命令序列，不能只保存测试框架内部 seed。

CI 不通过“重录全部 golden”修失败。先定位规则变化，若属预期，评审逐条事件/数值差异后随内容或 schema 版本更新基线。测试代码不得调用实现私有 helper 复制公式作为唯一 oracle；关键公式用上游算例和独立慢模型交叉验证。

经脉 oracle 固定读取 `fixtureVersion=2`、`rulesProtocol=2`、`rngProtocol=1`、`masterSeed=20260927` 与 `vectorSha256=af33dcd10dc196e18811fe485870666ab139c03a17342fa47113ecc19552cd76`。TypeScript runner 必须逐字段对拍 `inputs` 及 `outputs`：路线逐段 trace、到达 / 卡住率、质量与 `flowCt`，四单位独立提交及三段 `battleRng` 状态，攻防乘区、护体四伤害类 / 容量与内力击穿、速度 / 封路 / 擒拿、点穴 / 调息、归一化与五档 TTK。Python snake_case 不是协议，golden 的 camelCase 才是交换键。

最低集成断言还包括：1 次与 100 次 preview 后的 commit / RNG / hash 相同；两单位同穴状态互不串；snapshot→修改→restore 逐字段相同；普通→精英→Boss 提交后合格自行解穴严格推进同一全局流；标准对标准 Z4M / Z5M 均为 10000 且旧伤害 golden 零漂移。绝招另以三招序列证明“F2 设置后当次 E2 仍为 1 → 下一次自身行动拒绝同门任一绝招 → 该行动 E2 后归零 → 同一绝招仍拒绝 → 同门普通招后可再用”，并断言事务失败整体回滚、`cdMinus` 不改变该序列。外放另证明 0 / 1 / 2 档命令产生固定 +0 / +2 / +4 射程与 0 / 200 / 400 bp MPREF 增量、点穴后旧 2 档以 `PROJECTION_STEP_UNAVAILABLE` 零副作用拒绝、预估前后 GameState / 经脉 snapshot / 五流 / 事件队列相同，以及仅改变命令档位会改变命令字节与 replay hash。音功专例还须证明：同一 `sonic && projection:true` 招式的 0 档在 F0 派生 `projectionBoostActive=false`、基础范围、0 增耗与普通 Z5M，1 / 2 档派生 true 并分别走审核范围、200 / 400 bp MPREF 与外放 Z5M；F1 以后不能重判，三档均只结算一个 Z5M，0 档仍按静态 `projected` 接受护体内劲 40% 适用率。大手印专例还须证明跃迁阶段不创建 `AttackFrame`，落点仅有一个掌风语义段，共享一次 attack 路线和一次 Z5M，不因多目标或落地表现产生第二伤害段。只有归属规则经评审并同步提升 fixture / rules protocol 后，才允许显式执行 `--write-golden`；CI 只执行 `--check`。

## 16. 性能预算与观测

| 路径 | 预算 | 处置 |
|---|---:|---|
| `core.tick()` 探索平摊 P95 | 0.5 ms | 超限先索引/分桶；持续越线评估 core Worker |
| tick 所在帧 core 峰值 | 2 ms | 大量跨周期按持久时间游标推进；禁止半事务让UI写入 |
| 可达格/伤害预测 | ≤8 ms/次 | 超出转 Worker，UI 显示推演中 |
| 中档活动逻辑单位 | ≤24 | 表现 LOD 不得删除规则单位 |
| AI | 5/15/40/80 ms | workBudget + 2× watchdog取当前最优，最终命令入录像 |
| AI 快照/克隆 | ≤64 KiB / ≤2 ms | **（待实测）**；裁剪字段/Transferable 索引 |
| 普通攻击热路径 | 0 临时数组/闭包 | scratch pool；事件批除外 **（待实测）** |
| 经脉单路线 `commit` | ≤18 节点、≤18 抽；≤0.25 ms | 连续索引 / scratch；禁止减少判定 **【建议值】【待实测】** |
| 经脉攻防 + 护体 | ≤0.08 ms | 纯整数；同一 `causeId` 复用防守结果 **【建议值】【待实测】** |
| 经脉速度脏重算 / 全场 tick | ≤0.05 / ≤0.50 ms | 脏标记与 dirty set，不逐帧扫 180 穴 **【建议值】【待实测】** |
| 经脉 preview / AI 12 路线 | ≤0.15 / ≤2 ms | 0 RNG；216 节点访问；批量可转 Worker **【建议值】【待实测】** |
| 经脉检查点 snapshot | ≤1.50 ms | 只在检查点 / 存档执行，绝不逐帧 **【建议值】【待实测】** |
| 自有 JS / 主线程总预算（中档） | ≤6 ms / ≤8.5 ms | core 与输入、UI、动画共用预算，不能分别各占整帧 |

core 本身不能读 `performance.now()`；host 在 API 边界计时，记录命令类型、计数、分位和 build，不把耗时写进状态/事件/hash。规则层可返回确定性 counters（访问节点、派发 hook、伤害段、分配池溢出），与外层耗时关联定位。

基准固定 seed `0x5449414e`、内容 hash、设备/引擎和场景，预热一次后 3 次取中位；时间较已审阅基线 +10% 告警，越绝对预算阻断发布候选。所有数值是设计预算，不是当前成绩，须按 `tech/03` 三类真机矩阵实测。

## 17. MVP、演进与风险

### 17.1 交付切片

| 阶段 | 纳入 | 推迟/闸门 |
|---|---|---|
| Phase 1 MVP | 单线程 core、10 Hz 探索、六角战斗、CT、Z0–Z10、Buff 必需子集、基础任务/Ink、存读档、Node/WebKit 录像 | 经营 / 经脉量产等其正式生成类型与 golden 通过；AI 可主线程 basic |
| Phase 2 | 全 59 hook/原语、反应/合击/阵法、环境、AI Worker、跨区周期、迁移夹具 | 最大群战和真机预算通过 |
| Phase 3 | 正式经脉/资源/营生/门派、跨书同伴全链、遥测重放 | `design/12/15/16` 生成契约全量接入；旧档迁移与书眠 golden |
| Phase 4+ | 更深 Boss/AI 前瞻、工具化 trace、平衡批跑 | 不以在线生成式 AI替代规则 AI |

本表仅是玩法 core 的内部切片：Phase 1 → `tech/09` P1，Phase 2 → P1/M2–P2，Phase 3 → P2–P3，Phase 4+ → P4–P16；正式排期、阶段出口与发布称谓只认 `tech/09` P0–P16。传承 `legacy.v1` 的 schema / helper 可在 P1 接线，39 源量产、10,000 seeds 与 30 份跨引擎录像随相应书界阶段持续扩充。

### 17.2 风险登记

| 风险 | 级别 | 预防 / 降级 |
|---|---|---|
| DSL 可表达性演变成任意脚本 | 高 | 白名单字节码、无循环、构建穷尽；缺原语先评审再加 |
| 乘区/取整漂移 | 高 | 生成 zone 顺序、BigInt 精确边界、04 向量与双引擎 golden |
| 反应/Buff 递归爆炸 | 高 | 来源位、深度 3、全局深度/op 上限、事务回滚 |
| 正式 schema 与运行时生成物漂移 | 高 | 单源生成、版本门禁、升 schema 与纯迁移，不保留双写层 |
| 传承 registry、运行态与跨域 helper 漂移 | 高 | `legacy.v1` strict registry；六项 opcode / 两类条件穷尽；LEG-V/T 与双引擎重放，未知字段拒绝 |
| AI Worker 延迟/不可用 | 中 | 固定 workBudget、watchdog、basic/待机 fallback |
| 热路径 GC | 中 | bucket/index/scratch pool；超预算先 profile 后迁 Worker |
| 旧内容无法重放 | 高 | 按 contentHash 保留规则工件；缺失即隔离，不猜修 |
| 年代考据变化杀死旧档 NPC | 高 | `legacyTimeline` 保留既有分支；新游戏才用新事实 |
| 经脉逐招扫描 180 穴、共享动态数组或预估偷改状态 | 高 | 路线连续索引、稀疏节点 / dirty set、逐单位别名测试、preview 前后 snapshot + RNG 断言；超时只降缓存 / 动画或转 Worker，不删规则 |

---

## 参考资料

### 项目内规范（权威顺序见文首）

- `docs/00-canon.md`；`docs/decisions/author-requirements.md`；`docs/decisions/author-decisions.md`；`docs/decisions/rulings-v1.md`。
- `docs/design/04-damage-formula.md`、`05-martial-arts-system.md`、`06-buff-system.md`、`08-terrain-and-qinggong.md`、`09-combat-system.md`、`11-open-world.md`、`12-quests-npc-factions.md`、`13-progression-and-endings.md`、`15-meridians-and-acupoints.md`、`16-resources-and-estates.md`、`17-sects-compendium.md`、`18-npc-and-companions.md`、`19-world-map.md`、`20-legacy-inheritance.md`。
- `docs/design/21-meridian-flow-and-moves.md` v2.6（commit `f62de7d`；含 §4.4.1、`ProjectionInput.voice`、MF-V16 / V17 与 MF-T23 / T24）；`tools/balance/meridian_flow_sim.py`、`tools/balance/meridian_flow_golden.json` 与 `tools/balance/projection_sim.py`（战斗经脉、外放规则、慢模型与跨语言黄金）。
- `docs/tech/01-architecture.md`、`03-mobile-performance.md`、`04-data-pipeline.md`、`08-backend-and-online.md`。

### 外部技术资料（2026-09-26 访问）

1. ECMA International, *ECMAScript Language Specification*：<https://tc39.es/ecma262/> —— 数值、集合排序与标准内建行为的规范基线；项目仍以更窄的确定性子集约束 core。
2. Playwright, *Browsers*：<https://playwright.dev/docs/browsers> —— 支持 Chromium、Firefox、WebKit；每个 Playwright 版本绑定特定浏览器二进制，CI 因此锁版本并在升级时显式重跑 golden。
3. MDN, *SubtleCrypto.digest()*：<https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest> —— SHA-256 digest 可在 Web Worker 使用且要求安全上下文；hash 在 core 外执行。
4. MDN, *Worker.postMessage()*：<https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage> —— Worker 消息按 structured clone 传递；AI 快照体积与克隆耗时仍须真机实测。
5. inkle, *Ink documentation*：<https://github.com/inkle/ink/tree/master/Documentation> —— Ink 语言与运行时概念参考；本项目另加只读查询/意图提交隔离。
6. inkjs 2.4.0 固定版本与源码：<https://github.com/y-lohse/inkjs/blob/edccead8700e9f21be9825d87d8645d8c82a9936/package.json>、<https://github.com/y-lohse/inkjs/blob/edccead8700e9f21be9825d87d8645d8c82a9936/src/engine/Story.ts#L1934-L1980>、<https://github.com/y-lohse/inkjs/blob/edccead8700e9f21be9825d87d8645d8c82a9936/src/engine/StoryState.ts#L433-L445> —— 固定本次核实版本；确认两个绑定 API 的 `lookaheadSafe` 默认值不同，且 `StoryState` 构造会读取 `Date` 播种。
7. IETF, RFC 9562 §5.5, *UUID Version 5*：<https://www.rfc-editor.org/rfc/rfc9562.html#section-5.5> —— UUIDv5 以 namespace、name 与 SHA-1 生成确定性名称 UUID；本文仅用于运行时身份映射，不作完整性或安全摘要。

未找到需要作为安全事实引用的 sfc32 一手标准；本文只把它视为项目版本化的可重放 PRNG，不宣称密码学安全。本文无价格或云配额结论。

## 本文新增术语/约定

| 术语 | 定义 |
|---|---|
| 命令事务 | 一条命令的校验、规则写入、RNG 与事件要么整体提交、要么整体回滚 |
| mutation journal | 记录首次旧值与数组逆操作的事务回滚日志 |
| 规则快照 | 某次伤害/AI/录像为确定性冻结的最小规则输入；不同于 UI 截图 |
| 来源位 | `reflected/redirected/mirrored/countered/followup` 的继承位集，用于阻断递归 |
| hook bucket | 按 hook index 预索引并按 `priority,iid` 排好的触发器数组 |
| workBudget | AI 固定的确定性工作单元上限；不同于墙钟 SLO |
| replay hash 域 | 规范 JSON 数组 `["tianshu:battle-replay:v1",appBuild,coreVersion,rulesProtocol,rngProtocol,contentHash,runtimeMartialArts,commandPrefix,session]` 的 UTF-8；命令前缀只取按 `seq` 排序的规范 `command` 载荷并含 `projectionStep`，摘要 / 运输字段本身不入域 |
| 正式 schema 适配层 | `packages/data` 生成类型到 core handler / 状态组合的薄映射；不复制玩法定义 |
| 传承调度收据 | 区分 `quota_full_before_batch` 与 `lottery_deferred` 的当前周目幂等事实；二者 RNG 消费语义不同 |
| `MeridianFlowModule` | 每个可独立武学行动单位一份的战斗经脉动态实例；不拥有 RNG，消费 Core 事务端口 |
| `meridian-flow-state.v1` | 单位级规范经脉快照；节点按 `ap_*` 排序，不含全局 RNG |
| `damageBeforeMpGuard` | 护体真气与护体内劲后、既有 `mpGuard` 前的剩余伤害；不是实际气血伤害 |
| 经脉 golden | Python 慢模型生成、TypeScript 全字段消费的 `fixtureVersion=2/rulesProtocol=2` 跨语言契约 |
| 绝招轮换态 | `BattleUnitActionState.ultimateBySkill` 中每单位、每门已装配武学的 `ultimateCooldown:0|1`、`lastUltimateMoveId` 与 `freshTurnToken`；仅属本战 |
| 外放命令档 | `projectionStep:0|1|2`；随招式命令选择并进入 replay/hash，绑定当前档射程、审核模板与额外耗内 |
| 音功外放激活 | `projectionBoostActive` 是 `projectProjection` 的单次派生结果；非音功外放恒为 true，音功只在 `projectionStep>=1` 时为 true，不是持久修为或第二状态源 |
| 两阶段单伤害段 | 大手印跃击先执行非伤害跃迁，再从落点生成唯一掌风语义伤害段；多目标 frame 不改变“只有一段”的内容语义 |
| `MoveAvailabilityView` | `query.moveAvailability(unit)` 的只读 DTO；普通招槽、全部已解锁绝招、共享冷却、路线原因和外放逐档结果的单一消费接口 |

本文没有新增玩法内容 ID；所有示例均复用既有前缀或使用局部 key。

## 待决事项 / 依赖

### 已解决事项（保留追溯）

- **已解决（tech/01 P2）**：数值统一 10000 bp，Z1–Z10 取整点由 `design/04` 定义、本文 §8 实现。
- **已解决（tech/01 P3）**：探索 tick 终值为 10 Hz / 100 ms；本文 §5 给出不补跑语义。
- **已解决（E2-S01 / O-01）**：`design/11` §6.1 已将世界时间定稿为 1200 tick/时辰、14400 tick/日，即实时 2 分钟/时辰、24 分钟/日；本文 §5 已原样承接。
- **已解决（tech/01 P10）**：Buff 目录归 `design/06`；本文实现生成式 59-hook/原语运行时，不另建语义清单。
- **已解决（AR-12）**：战斗为 pointy-top 六角轴坐标，首轮按轻功；旧方格运行时接口不保留。
- **已解决（作者 P08/P14/P16/P41/P56，G1 采用默认）**：自创武学倚天后开放且最多 3 门；称号属性默认开启可关闭；最近一次守卷外观与誓言默认启用可关闭；两种天道规则开关互斥；化险为夷按每战一次、指定对象与 0–30% 公式执行（见 §3.2–§3.4、§14.3、§9.4、§7.7）。
- **已解决（AR-13 / H1）**：`design/20` 已落盘；本文已接入 `legacy.v1` 状态、两类条件、六项 opcode、家丁挖掘、`qiyu` RNG、双配额收据、书眠顺序与 12 / 10 / 9 专用上限（见 §3.2、§10、§11.7、§15）。
- **已解决（AR-14）**：`design/21` v2.6 已确定每单位实例、Core 唯一 `battle` 流、无副作用 preview、Z4M / Z5M、护体内劲、速度 / 控制 / 调息接口与 golden；本文已按 §7–§8、§11.2、§14–§16 接入。
- **已解决（M4 绝招轮换）**：§3.3、§7.3–§7.4、§14–§15 已接入仅战斗存在的 `ultimateCooldown / lastUltimateMoveId`，并明确 `cdMinus` 不减武学级共享冷却。
- **已解决（AR-16 / M6-P01～P03）**：§6–§8、§11.2、§13–§15 已接 `projectProjection`、逐档六角枚举、F2 原子支付、唯一外放 Z5M、AI 同规与命令 replay/hash；静态字段和构建约束由 `design/05`、`tech/04` 提供。
- **已解决（NA1 绝招时序）**：§7.3–§7.4 已把同门共享冷却设置点前移至 F2，并以 `freshTurnToken` 保证设置当次 E2 不减；玩家、AI、一键重复与 F0 共用四段有序过滤器，拒绝零资源 / 零 RNG。
- **已解决（AR-17 / NXT-D01）**：Canon v1.6 与 `design/21` v2.6 已正式登记；§6.5、§7.4、§8.3、§11.2 与 §15 已接音功唯一特殊分支、`voice` 投影及 F0 判定点：0 档为基础音波、零外放增耗与普通 Z5M，1 档起才激活外放；静态 `projected` 及护体内劲 40% 语义保持。
- **已解决（AR-17 / MF-V17）**：§7.5、§8 与 §15 已把 `mv_dashouyin_dashouyin` 实现为非伤害跃迁 + 唯一落点掌风伤害段；不创建位移伤害、第二路线或第二 Z5M。
- **已解决（AR-18 文档接口）**：§11.2 与 §15 已接主运 / 调息同源、出口分类与体段性质；正逆周天和掌法阴门不另生性质 / 乘区。这里及以上“已解决 / 已接”均指规划契约；生产 Core 和具名回放的实现状态见 §14.4。

### 本文采用的建议值（含已解决追溯）

| 编号 | 建议值 | 回填者 / 时点 |
|---|---|---|
| E2-S01（已解决） | `design/11` §6.1 已定稿为 `WORLD_TICKS_PER_SHICHEN=1200`、`WORLD_TICKS_PER_DAY=14400`；不再是建议值 | 审校 E2.R 已同步 |
| E2-S02 | 表达式每段 ≤256 指令；事件深度 ≤32；每根命令 ≤4096 ops | 实现 fuzz/最大 Buff 基准后 |
| E2-S03 | 录像每 10 条已接受命令写中间 hash | `tech/08` 遥测实测后 |
| E2-S04（已解决） | 已按 `design/12/15/16` 正式 schema 重写 §10–§11，并保留纯迁移策略 | 本次跨文档同步 |
| E2-S05 | AI 各档 `workBudget` 由基准机标定，墙钟 SLO 不作停止条件 | Phase 1 AI 基准后 |
| NTECH-S01 | 经脉 commit / 攻防护体 / 速度 / preview / 12 候选 / tick / snapshot 子预算采用 0.25 / 0.08 / 0.05 / 0.15 / 2 / 0.50 / 1.50 ms **【建议值】【待实测】** | `tech/03` 三机基准后 |

### 本文依赖的上游事实

| 依赖 | 当前使用 | 变化影响 |
|---|---|---|
| `design/04/06/09` | 伤害、Buff、战斗时序唯一规则 | 必须升规则/录像版本并重跑 golden |
| `design/11` | 已定稿；正式使用时代层合成、10 tick/游戏分钟、1200 tick/时辰、14400 tick/日 | 若上游协议变化，升规则/存档版本并重跑世界 golden |
| `design/12` | 已定稿；使用 `quest.v1`、`quest-instance.v1`、任务条件 / 动作与 `sect-membership-state.v1` | 上游升 `contentVersion` 时补纯迁移并重跑 QST-V01～V30 |
| `design/15` | 已定稿；使用 `MeridianProgress`、session 快照、keyed RNG 与 S0–S8 | 上游升 schema / 公式时按迁移版本重算派生奖励并重跑 V15-01～V15-15 |
| `design/16` | 已定稿；使用资源、点、家丁、合同、家业、公账与 Estate DSL | 上游升 schema / 数值时迁移当界运行态并重跑 RES/BIZ/SLEEP 门禁 |
| `design/20` | 已定稿；使用 `legacy.v1`、`LegacySourceState`、配额 / 机会 / 校合收据、书眠矩阵与 LEG-V/T | 上游升 schema / RNG 消费或生命周期时升规则与存档版本，并重跑 10,000 seeds 和跨引擎录像 |
| `design/21` | v2.6 提供逐单位模块、路线 / 控制 / 调息档案、Z4M / Z5M、护体内劲、速度、外放档、`ProjectionInput.voice`、音功激活分支、大手印掌风边界、`meridian-flow-state.v1`、绝招路线约束与 golden | 路线数组、外放档 / 曲线、音功分支、大手印伤害段、取整点或 RNG 消费改变须升 `rulesProtocol`，保留旧 runner 并逐字段评审 golden |
| `design/18` | 同伴快照、健在与重逢合并正式契约 | 内容考据修订需 legacy timeline 迁移 |
| `tech/03/08` | 性能预算、TSAV、录像运输 | 真机实测和限额变化不得反写玩法结果 |

### 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| E2-P01 | 基准 §19 补充：玩法 core 使用整数/bp、固定 PRNG 流、规范 hash 与 Node+WebKit golden，禁墙钟参与规则 | 将可重放约束提升为跨文档不变量 |
| E2-P02 | 基准 §8 明记 CT 内部可为负、首轮按轻功固定序、后续事件驱动；环境行动不算单位回合 | 避免“0→1000”描述吞掉高收招债务，并统一 AR-12 |
| E2-P03 | 基准 §3 跨书保留项补入当前周目的经脉进度/九转和同伴 ledger，书眠清空项补入普通资源/家丁/职位/门派身份；新周目仍按 `design/13` 重置运行态，仅保留账号里程碑 | 落实 AR-03/05/06/07/09 的生命周期覆盖，同时避免把“跨书界”误读成“跨周目” |
| M2-P03 / M3-P01～P03 | Canon §19 纳入逐单位经脉实例、无副作用预估、唯一 `battle` RNG、快照 / golden；§8–§11 纳入 Z4M / Z5M、护体内劲与经脉速度接口 | AR-14 已定机制需要跨文档确定性与伤害 / 时间线基线；具体玩法定义仍只归 `design/21` |

### 需同步到其他文档

| 文档 | 位置 | 需要同步 |
|---|---|---|
| `docs/tech/01-architecture.md` | core API / GameState / P3 | **已解决**：已统一 `Core`/`GameplayCore`、`meta.stateVersion`、`tick()` 返回型、候选实例原子读档、`BattleActionPlan`、负 CT、AI seed 提交与 replay hash 域（见该文 §3.6、§8.3） |
| `docs/tech/03-mobile-performance.md` | Worker/预算 | **已解决**：AI 时间只作 SLO，确定性停止使用 `workBudget`；64 KiB / 2 ms 保持 **（待实测）** |
| `docs/tech/04-data-pipeline.md` | 正式 schema / DSL 编译 | **已解决**：已接入 12/15/16 正式字段，并从单一 registry 生成 59 hooks、50 `OpId` 与表达式 opcode |
| `docs/tech/04-data-pipeline.md` / `docs/design/20-legacy-inheritance.md` | `legacy.v1` / 传承运行时 | **已解决**：tech/04 已接五表与 LEG-V01–V10；本文已接状态、六项 opcode、两类配额收据、家丁 / NPC 适配和跨引擎测试（见 §11.7） |
| `docs/tech/08-backend-and-online.md` | §10 录像 | **已解决**：`BattleReplayV1` 只哈希 / 上传战斗域，并对齐 `appBuild/coreVersion` 与中间 hash |
| `docs/tech/08-backend-and-online.md` / `docs/design/13-progression-and-endings.md` | Meta 合并 / §9.4 | **已解决（文档接口）**：tech/08 与 design/13 §9.4 已对齐确定性 `MetaProfileIntent.intentId`、规则投影 revision、ack 与守卷快照确认边界，平台墙钟不回流 core；真实合并 / 重试仍待实现验收 |
| `docs/design/09-combat-system.md` | §5.3 范围结算 | **已解决**：模板格按稳定六角坐标序枚举，命中单位再按稳定 `unitIndex` 排序；范围映射不改变 RNG 消费（见 09 §5.2.1、§5.3） |
| `docs/design/11-open-world.md` | §6.1 日历（已解决） | 已由上游定稿为 1200 tick/时辰、14400 tick/日；本文审校已同步，无需反向修改 |
| `docs/design/12-*` | 任务/门派历史依赖文字 | **已解决（文档接口）**：该文 §11.4 / §14.2 已按正式任务与 15 / 16 契约回写；十四章生产 manifest 与任务导入仍待实施 |
| `docs/design/15-*` | 经脉 | **已解决**：本文已接进度单位、冲穴公式、事件与 keyed RNG，保持当前周目跨书永久、新周目重置运行态 |
| `docs/design/16-*` | 资源营生历史依赖文字 | **已解决（文档接口）**：该文 §17.2 已回写正式任务接口；运行时、旧档迁移与事务夹具仍待实施 |
| `docs/design/18-npc-and-companions.md` | §7.3 | **已解决**：`level/innates` 已无重复声明；本轮补齐 `meridianProgress` 并由本文 §12.2 / §12.3 消费，事件命名沿正式契约 |
| `docs/tech/08-backend-and-online.md` | TSAV / replay 版本表 | **已解决**：§3.5.1 / §10.2 已登记 `rulesProtocol=2` 与 `meridian-flow-state.v1` 的检查点兼容边界；旧 v1 战中档不得静默升级 |
| `docs/tech/01-architecture.md` | Core 状态与确定性摘要 | **已解决**：已把 `BattleState.meridianByUnit`、唯一 battle RNG 注入、preview 零副作用与协议 2 hash 域纳入 §3.2.1、§3.6、§8.3 |
| `TODO.md` / 协调任务 | Phase F 同步 | 登记 E2-S02–S05、E2-P01–P03；E2-S01 与 E2-S04 已解决，其余按实现实测 / 基准修订跟踪 |

### 开放问题（附默认值）

| # | 开放问题 | 当前默认值 | 决定时点 |
|---|---|---|---|
| O-01（已解决） | 世界时辰换算 | `design/11` §6.1：1200 tick/时辰、14400 tick/日 | 审校 E2.R 已同步 |
| O-02（已解决） | 历史临时字段与正式 DSL 不同如何处理 | 升 `saveSchema`、纯迁移；不保留双写兼容层（见 §14.2） | 本次同步采用 |
| O-03 | core 何时整体迁 Worker | 默认主线程；优化后 P95 仍持续 >4 ms 才启用模式 B | Phase 2 真机基准 |
| O-04 | AI 固定节点预算各档取值 | 先以墙钟 SLO 标定；发布配置版本化，不能由设备动态改变 | 首个完整 AI 基准 |
| O-05 | 是否保存完整逐区 DamageTrace | 开发/手动录像开启，release 默认只存汇总 | 日志体积实测 |
| O-06 | Playwright WebKit 外是否加真机 Safari golden | 默认发布候选人工复放关键录像；自动化不阻塞 MVP | 真机自动化条件具备时 |
| O-07 | 经脉子预算三档手机能否达到 | 默认采用 §16 数值；超限先做连续索引、稀疏节点、dirty set、scratch 与 Worker 预览，不删除敌方模拟或降低规则精度 | 首个 24 单位经脉群战基准 |
| O-08 | 具名 Boss 静态估算何时转为实战验收 | 当前没有正式 `BattleReplayV1`；保持章节耐久和（待实测），完整行动表及 §14.4 固定种子矩阵通过后才关闭 | 各书界发布前 |
