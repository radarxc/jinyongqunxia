# 代码实现审计 · 2026-10-02

> 范围：`packages/{shared,data,core,render,ui,platform}`、`apps/game`，以及 `tools/` 中与构建、内容相关的部分（`tools/perf`、`tools/lint`、`apps/game/build`、`packages/data/scripts`）。
> 基线：集成分支 `claude/production-20260930`。代码基线是 `df855253`（ENG-16a 合入，10-02 04:51）。审计期间 HEAD 前进到 `2132c41e`，但 `packages/`、`apps/` 和门禁配置都没有改动。
> 方式：只读。除本报告外未改任何文件；探针脚本放在会话草稿目录，没有进仓库。

## 0. 结论与总评

1. **分层干净**：依赖方向与各包边界全部守住，core 无 DOM、墙钟、`Math.random`、浮点；lint、typecheck、86 文件 471 用例、内容校验、`check_ids --strict` 全部通过。
2. **单模块质量较高**（整数化、规范 JSON、TSAV / ZIP 加固、三代存档回退、事务化行动），问题集中在**模块接缝**：各自正确，接起来不成立。
3. **严重一：经脉黄金只验证了独立重写的协议 2「孪生实现」**；生产 runtime（协议 3）没有黄金，也没接进战斗。
4. **严重二：规则和内容没有版本化**：无 `rulesProtocol`，存档 `contentHash` 写死全 0，`CORE_VERSION` 要求严格相等。
5. **严重三：战斗规则一半在 app 层**，官方回放器复现出的事件流与实战不同（30 条对 15 条）。
6. **与设计不一致**：伤害链没接方位、高差、地形、遮蔽（ENG-16a 已有朝向和 LOS，未进 Z0 / Z7）；CT 速度钳制前后不一致，spd=0 栈溢出。
7. **移动端风险**：战斗格着色器用 800 个 float uniform（WebGL2 只保证 224 vec4）；大地图页会泄漏 WebGL 上下文；大地图每步重发约 126 KB 投影。
8. **rig 门禁抖动源于测量方式**：紧跟并行套件测得 1.130 ms 未过，单独跑 0.418 ms 通过；代码没有退化。
9. **M1**：引擎底座约六成，玩家路径（新游戏 → 序章 → 书眠 → 白马冷入口）仍为零；10-01 以来合入大地图、VFX、正式存档、经脉 preview、战斗几何。
10. **总评 B-**：底座可靠、接缝未合；M1 验收前须先补版本化、经脉黄金、战斗收回 core 三件事。

---

## 1. 执行情况与结果

| 命令 / 动作 | 结果 | 备注 |
|---|---|---|
| `pnpm typecheck` | 通过 | `vue-tsc -b`，增量缓存命中 |
| `pnpm lint`（含 core 包内的禁浮点规则） | 通过 | 0 warning |
| `pnpm test` | 普通项目 86 个文件 / 471 个用例全部通过；perf 项目 1 项失败 | 100 角色 rig 门禁三轮 P95 为 1.229 / 1.130 / 1.355 ms，上限 0.80 ms，当时 loadavg 34.5。失败时刻紧接在并行套件之后（见 H4） |
| 单独重跑 `vitest run …/rig/performance.test.ts` | 通过 | 20 人 0.078 ms；100 人 0.418 ms，loadavg 11.9 |
| `pnpm content:validate` | 通过 | 392 个文件 |
| `python3 tools/lint/check_ids.py --strict` | 通过 | 新增失败 0，基线未定义 ID 1 个 |
| `python3 -m unittest discover -s tools/lint` | 259 项通过 | 不在 `pnpm check` 内；机器上没有 pytest |
| `node tools/perf/check_size.mjs`（读取现有 dist，未重新构建） | 通过 | entry 闭包 131.01 KiB（含 worker 90.8）+ render 144.89 = 275.90 / 350 |
| `pnpm audit` | 1 个 moderate、2 个 high | 全部只在构建期或开发依赖里（见 L2） |
| 探针：CT 越界速度 | 复现 | spd=10 用了 100 tick（设计应为 34）；spd=400 时 ct=1299（设计应为 1200）；spd=0 栈溢出 |
| 探针：实战 transcript 交给 `runBattleReplay` | 复现 | 结果与 RNG 一致，但事件数 30 对 15：实战多出 `autoSimulationStarted / autoExchangeResolved / autoSimulationEnded` |
| 微基准：`mulDivFloor` / `floorDivInt` | 0.023–0.053 µs / 次 | 同样运算走 Number 路径为 0.001–0.003 µs，相差 10–50 倍 |

---

## 2. 分层与依赖方向

- 跨包 import 全部合规：
  - data 只依赖 shared；
  - core 只依赖 shared 和 data/schemas；非测试代码里对 data/schemas 的 20 处引用全是 `import type`，Zod 没有进入 worker 产物；
  - platform 只用了 core 的类型；
  - render 不依赖任何内部包；
  - ui 只用了 core 的类型；
  - 没有发现相对路径跨包引用，也没有循环依赖。
- core 内部的确定性：
  - 没有浮点 `Math.*`、`Date`、`performance`、`localeCompare`，也没有无比较器的 `sort`。
  - 唯一用到的宿主 API 是 `structuredClone`，共三处：`battle/action/index.ts:215,248`、`quest/runtime.ts:49`。它是确定性的，但 lint 没有拦它（L8）。
  - inkjs 构造 Story 时会用墙钟生成种子；`dialogue/index.ts` 在 `start()` 里立即覆盖 `storySeed`，符合 tech/05 的 D7。
- **苗头：app 层正在变成「第二规则层」**（见 S3、M5）：
  - `apps/game/src/battle/runtime.ts` 持有战斗 RNG、最大行动数判平、自动出手事件；
  - `apps/game/src/runtime/item-adapter.ts` 绕开了 core 的 perBattle 计数；
  - `apps/game/src/runtime/session.ts` 是事实上的命令总线（`Core.dispatch` 只接受 `world/tick`）。

---

## 3. 问题清单（按严重程度）

字段说明：位置用 `文件:行`；「归属」写建议归入的已有任务，或建议新开的任务。

### 3.1 严重（S）：会让 M1 闸门的验收结论失真，或让存档 / 回放无法安全演进

#### S1 经脉黄金只验证孪生实现，生产 runtime 没有被验证，也没有接入战斗

- **位置**：
  - `packages/core/src/battle/meridian-flow/meridian-flow.golden.test.ts:22,65-75`：只调用 `runMeridianGoldenFixture`；
  - `golden-runner.ts:86-330`：一份独立的「水量 / 容量 600–2600」模型；
  - 生产实现 `runtime.ts:443-585`：fluxCap 1–64、逐 tick 管线，从未与黄金对拍；
  - `battle/action/index.ts:82`：战斗读取的是静态 `move.meridianAttackBp ?? 10_000`；
  - 全仓只有测试和 bench 调用 `createMeridianFlowRuntime`；生产 runtime 也没有调息（regulateBreath）。
- **问题**：
  - 黄金工件是 `fixtureVersion=2 / rulesProtocol=2`。design/21 写明「上表是 rulesProtocol=2 的旧黄金追溯……v3 必须……重录黄金」（2198 行），并要求「ENG-03 须接 rulesProtocol=3……并重录黄金向量」（2650 行）。
  - ENG-14 照路线图 §3.5「消费 fixtureVersion=2」的字面要求，另写了一份能跑通旧向量的 TS 移植。
- **影响**：
  - 路线图「经脉黄金」闸门在形式上是绿的，实际上对生产代码零覆盖；
  - 生产 runtime 与设计的偏差（例如防守曲线锚点，见 L3）无人能发现；
  - 战斗里经脉恒为中性，周天暴击、flowCt、急性聚气都不会发生。
- **修法**：
  1. 由 Python 参考实现按协议 3 重录 `fixtureVersion=3` 黄金。
  2. 测试直接驱动 `MeridianFlowRuntime`，逐字段对拍。
  3. `golden-runner.ts` 改名为旧协议回放器，只用于旧录像验证。
  4. 路线图 §3.5 的文字改成「协议 3 黄金 + 生产 runtime」。
  5. 接线交给 ENG-16b（提示词已写明逐单位经脉）。
- **归属**：新开 ENG-14b（重录黄金并对拍生产 runtime）；接线归 ENG-16b；路线图修订任务。

#### S2 规则和内容没有版本化，存档兼容策略只有「严格相等」

- **位置**：
  - `core/src/api/index.ts:8`：`CORE_VERSION = '0.0.0'`；
  - `core/src/state/models.ts:28`：`MetaState` 没有 `saveSchema / rulesProtocol / contentHash / coreBuild`；
  - core 里没有 `RULES_PROTOCOL` 常量，`replay/index.ts:9-15` 的 `rulesProtocol` 只能由调用方随手填，测试里写的是 3；
  - `apps/game/src/runtime/validate.ts:24-25`：`coreVersion` 和 `rngProtocol` 要求严格相等；
  - `apps/game/src/storage/save-service.ts:28-30`：`CONTENT_HASH='0'.repeat(64)`，`APP_BUILD` 是常量。
- **问题**：
  - tech/05 §14 规定 meta 必须包含 `saveSchema, masterSeed, runId, contentHash, rulesProtocol, coreBuild, debugTainted`；
  - 读档顺序规定为「结构迁移 → contentHash 对比与 remap → 全量校验」。
  - 现在的实现：
    - 内容哈希恒为 0，`identityContentFixup` 永远不会触发；
    - 规则改动无处登记；
    - 一旦升 `RNG_PROTOCOL` 或 `CORE_VERSION`，所有旧档直接报 `SAVE_VERSION_UNSUPPORTED`；而且这个错误会在三代回退中被当成「损坏」，最后提示语退化成通用错误。
- **影响**：
  - 路线图里的「存档迁移、确定性录像不可砍」在当前实现下无法兑现；
  - 内容下架、改名后旧档会通不过校验，或者静默带着错误引用读进来。
- **修法**：
  1. core 导出 `RULES_PROTOCOL`，`GameState.meta` 补上 `saveSchema / rulesProtocol / contentHash / coreBuild`。
  2. 构建期由 ENG-18 产出真实的 `contentHash` 和 `idRemaps`。
  3. `validateSession` 改为：版本较低就走迁移链，较高就提示「存档较新」，不再要求严格相等。
  4. 版本不兼容要用专门的 `StorageErrorCode`，回退逻辑据此不吞掉它。
- **归属**：ENG-15-core-bus（meta 与迁移链）、ENG-18-content-build（contentHash / remap）。

#### S3 战斗规则分裂在 app 层，官方回放复现不出实战；战斗 seed 不来自 world 流

- **位置**：
  - `apps/game/src/battle/runtime.ts`：
    - 第 38 行：app 持有 battle RNG；
    - 第 142–149 行：自动出手事件和终局判断；
    - 第 151 行：`defaultMaxActions` 判平是一条规则；
  - `apps/game/src/battle/demo.ts:12`：seed 写死为 20261001；
  - `core/src/state/initial.ts`：`meta.rng` 的五条流从没被任何玩法消费；
  - `core/src/replay/index.ts:86-100`：创建了 `aiRng` 但从未使用，`decisionOrdinal` 直接等于 records 数。
- **问题**：
  - 探针证据：同一份实战 transcript 交给 `runBattleReplay`，RNG 和胜负一致，但事件流是 30 条对 15 条。回放哈希把 `session.battle` 整体纳入，所以实战产生的录像哈希验证必然失败。
  - 长战斗中 app 的行动上限判平，回放器里不存在，结果也可能分叉。
  - design/09 第 479 行规定 seed「由世界 RNG 在创建时给出」，第 2708 行规定重试用 `hash(seed, retryCount)`；现在都没有实现。
- **影响**：路线图 §3.5「确定性」「命令摘要兼容」两项无法验收；战斗规则改动需要同时改 app 和 core 两处。
- **修法**：
  1. 在 core 里建 `BattleSession`，统一负责 RNG 持有、自动步进、行动上限、自动事件和回放记录；app 只转发命令、消费投影。
  2. 加一条回归：app transcript 与 `runBattleReplay` 的会话哈希必须相等。
  3. 战斗创建时从 world 流抽 seed，并在同一事务里推进。
- **归属**：ENG-16c（战斗命令进总线）、ENG-15（world 流派生 seed）。

### 3.2 高（H）

#### H1 伤害链没有接入几何：方位、高差、地形、遮蔽都不生效

- **位置**：
  - `core/src/battle/action/index.ts:74-83`：
    - `direction: move.direction ?? 'front'` 取的是招式上的静态字段；
    - 没有传 `heightAddBp`、`terrainAddBp`、`evadeRatingDelta`；
    - `hitEff` 只有 `hit + hitMod`；
  - `core/src/hex/line.ts:105`：`hitPenalty` 计算出来后没有人用。
- **问题**：
  - design/09 §4.5（885 行）规定方位按「目标格 → 来源格」的方向与守方朝向离散判定；
  - design/04 §3.1（133 行）规定 `hit_eff = hit + hitMod + heightHit + cover.hit + LOS.hitPenalty`；
  - design/04 §4.7 规定 Z7 = 方向 × 高差 × 地形。
  - ENG-16a 已经提供了 `facing`、`directionBetween` 和 LOS，但伤害链没有读取；已登记的 ENG-16b 提示词也没有覆盖这部分。
- **影响**：绕背、侧击、居高临下、遮蔽这些六角战术全部失效，战斗结果与设计不符；以后补上时，所有战斗黄金都要重录。
- **修法**：在 `settleTarget` 里，按 design/09 §4.5 由「来源格 → 目标」得出 `front / side / back`，并接上高差、地形加值和 LOS 命中修正。每个范围目标单独判定。补一组方位 × 高差的向量测试。
- **归属**：给 ENG-16b 追加返修说明，或拆出 ENG-16d（不建议塞进正在跑的 ENG-16b 写集外）。

#### H2 战斗格着色器用了 800 个 float uniform，中端安卓上可能链接失败

- **位置**：`render/src/battle/hex-layer.ts:30-31,46-47,53`（`uniform float reachable[400]; uniform float area[400];`）。
- **问题**：
  - WebGL2 只保证 `MAX_FRAGMENT_UNIFORM_VECTORS ≥ 224`；
  - 多数实现中标量数组每个元素占一个 vec4 寄存器，两组共需约 800 个。
  - 常见的 Qualcomm Adreno 机型上报值约为 256（需真机核实）。render/CLAUDE.md 已把「低端 Android uniform 上限」列为待实测。
- **影响**：
  - 在三机门禁里「中端 Android」这一类设备上，战斗格可能整层不渲染；
  - three.js 只在控制台报着色器错误，不会抛异常，所以 `BattleField` 的降级分支也不会触发。
- **修法**：
  - 高亮标记改为 400×1 的 RGBA8 `DataTexture`，或者每实例一个 `InstancedBufferAttribute`（逐格 flag），uniform 回到个位数；
  - 真机验收前先改。
- **归属**：并入 ENG-21b（自适应质量与降级），或新开小任务 ENG-10b。

#### H3 大地图页异步挂载存在竞态，会泄漏 WebGL 上下文和永不停止的 rAF 循环

- **位置**：`apps/game/src/pages/WorldMapPage.vue:52-75,99-102`。
- **问题**：
  - `mountScene()` 中两次 `await`（动态导入 render、创建场景）都没有检查组件是否已卸载；
  - 如果卸载发生在 `createWorldMapScene` 返回之前，`onBeforeUnmount` 时 `view` 还是 undefined，随后 `view` 被赋值、ResizeObserver 挂上、rAF 循环开始，之后再也没人停。
  - 对比：`BattleField.vue:73-99` 有 `disposed` 守卫，是正确写法。
- **影响**：首次加载较慢的设备上，在大地图和战斗、人物页之间来回切换，就会累积 WebGL 上下文（桌面 Chrome 约 16 个上限，移动端通常更少）和后台渲染，导致耗电和上下文被强制回收。
- **修法**：
  - 加 `disposed` 守卫，与 BattleField 一致；
  - 所有 `dispose()` 都补上 `renderer.forceContextLoss()`；
  - 补一个快速卸载的测试。
- **归属**：新开 ENG-08b（大地图页生命周期与投影瘦身，与 M1 合并）。

#### H4 rig 性能门禁在结构上会抖动，而且文档里还留着放宽门禁的口子

- **位置**：
  - 根 `package.json:16`：并行套件跑完立即跑 perf 项目；
  - `vitest.config.ts:33-44`；
  - `render/src/rig/performance.test.ts:132-144`；
  - `packages/render/CLAUDE.md:37`：「负载护栏……才可……跳过断言」。
- **问题**：
  - 本次实测：紧接并行套件时 min P95 为 1.130 ms，未通过（loadavg 34.5，10:42）；约 6 分钟后单独跑 0.418 ms，通过（loadavg 11.9）。
  - 失败原因是测量时机（并行套件刚结束，杀毒扫描新文件），不是代码退化。
  - render/CLAUDE.md 仍把「高负载跳过断言」写成可选做法，夜里 ENG-09 执行器正是照这条去放宽的。
  - ENG-09 工作区已把这句改为「负载只作诊断」，但集成分支上的原文还在。
- **影响**：任何任务的校验都可能被随机打挂，白耗返修次数；执行器会受诱导去放宽门禁。
- **修法**：
  1. perf 项目放到并行套件之前跑，或者等负载回落、冷却之后再跑；
  2. 或者改测进程 CPU 时间（`process.cpuUsage`），再或者与同进程内的参考负载做比值；
  3. 改正 render/CLAUDE.md 第 37 行（ENG-09 合入时保留它的改法）；
  4. 门禁阈值不动。
  - 方法选哪一种，由作者定（HANDOFF §9.8 已列为待定）。
- **归属**：新开 ENG-24（门禁与 CI）；CLAUDE.md 随 ENG-09 合入。

#### H5 CT 的速度钳制前后不一致；spd ≤ 0 时无限递归导致栈溢出

- **位置**：
  - `core/src/battle/timeline/index.ts:85`：计算等待用的是 `clampInt(spd,30,300)`；
  - 同文件第 97 行：推进 CT 用的是未钳制的 `unit.spd * delta`；
  - `battle/encounter/index.ts:153-165`：建立单位时也没有钳制。
- **问题**：
  - design/09 §3.1 规定 `ctGain = spd`，「最终仍钳 [30,300]」。
  - 探针结果：
    - spd=10 时首动等了 100 tick（设计应为 34）；
    - spd=400 时 ct=1299（设计应为 1200），会影响溢出裁决；
    - spd=0 时 `RangeError: Maximum call stack size exceeded`。
  - ENG-04 报告写的是「spd 钳 [30,300]」，与实现不符。
- **影响**：一旦内容或 Buff 产出越界速度，节奏就与设计不同；速度为 0 时战斗直接崩溃。
- **修法**：用单一的 `gain(u) = clampInt(spd,30,300)` 同时用于等待和推进；递归改成循环，并加一个 delta 守卫；补越界速度测试。
- **归属**：ENG-16b（正在改战斗；也可单独开小修）。

#### H6 内部错误一律当成「命令被拒绝」吞掉；StoryRuntime 不是事务化的

- **位置**：
  - `core/src/battle/action/index.ts:286-289`；
  - `battle/meridian-flow/index.ts:66-68`；
  - `progression/index.ts:45-48`；
  - `apps/game/src/runtime/session.ts:122-124`：这几处都是 catch-all 后返回 `accepted:false`；
  - `core/src/quest/runtime.ts:342-351`：`choose()` 先执行 `#complete`，再在 `STORY_CHOICE_EDGE` 处抛错；
  - `#stabilize` 可能在推进到一半时抛出 `STORY_STABILIZE_LIMIT`。
- **问题**：
  - 编程错误（TypeError、越界、`INT_OVERFLOW`）会被当成玩家输入不合法，没有任何上报；
  - StoryRuntime 抛错后，实例已经处于半提交状态。
- **影响**：bug 会被伪装成「操作无效」，难以发现；剧情一旦接线，出错后的内存状态与存档会不一致。
- **修法**：
  - 定义领域拒绝码（RangeError，带白名单码），其他错误一律上抛并中止当前会话；
  - StoryRuntime 改为在局部快照上运算、最后一次性提交。
- **归属**：ENG-15（命令总线的错误分类）；StoryRuntime 事务化随剧情接线任务（ENG-17 / ENG-19）。

### 3.3 中（M）

#### M1 大地图每一步都整份重发地图定义，并重算可达集

- **位置**：`core/src/world/worldmap-state.ts:123-130`（投影里带着整个 `map`）、`apps/game/src/projection.ts:40-45`、`apps/game/src/runtime/session.ts:90-97`、`WorldMapPage.vue:84-92`（220 ms 一步）。
- **问题**：ch01 地图有 201 个节点、90 条路，序列化约 126 KB。行走中每秒大约结构化克隆 0.5 MB，主线程还会重新计算 `openNodes` 等派生量。这违反了 CLAUDE.md「只更新浅投影」的约定。
- **修法**：静态几何只在 query 或进入时发一次，每步只发 `point / journey / reachableNodeIds`。可达集按位置缓存。
- **归属**：ENG-08b。

#### M2 core 的整数运算全部走 BigInt

- **位置**：`shared/src/bp.ts:15-23`、`shared/src/integer-division.ts:5-28`；热路径包括 `meridian-flow/runtime.ts:386-414`（逐 tick、逐 slot 调用）、`math.ts:78-81`、`timeline/index.ts:85-98`。
- **问题**：微基准显示 `mulDivFloor` 每次 0.023–0.032 µs、`floorDivInt` 每次 0.035–0.053 µs，而 Number 路径是 0.001–0.003 µs，并且 BigInt 每次调用都会分配对象。
  - 经脉接入战斗后，每个 tick 要处理 24 个单位、每单位多条路线和多段，移动端会放大这项开销。
  - 对非负安全整数 x < 2^53、y ≥ 1，`Math.floor(x/y)` 是精确的。所以积小于 2^53 时可以走 Number 快速路径，但需要配属性测试；`/` 只允许在 shared 里出现。
- **修法**：在 shared 里加快速路径和十万量级的随机对拍测试；core 的 lint 不变。
- **归属**：新开 ENG-25（core 性能）。

#### M3 每次战斗行动都深拷贝两次整个 BattleState，开销 O(n²)

- **位置**：`core/src/battle/action/index.ts:248,292-302`；`apps/game/src/battle/runtime.ts:137`（app 再拷一份）、`:52`（每个包对每个单位做一次 `JSON.stringify` 来判断变化）。
- **问题**：拷贝内容包括一直在增长的 `events` 和 `acceptedCommands`。行动上限 2000 次、每次数条事件，后期每次行动都要复制上万个对象；`events.splice(0, n, ...candidate.events)` 的展开参数也有上限风险。
- **修法**：候选状态只克隆单位，事件改为追加缓冲、提交时再拼接；app 去掉第二次克隆；单位变化改用版本号判断。
- **归属**：ENG-16c。

#### M4 自动存档期间用户的点击会被静默丢弃

- **位置**：`apps/game/src/game-controller.ts:51-60`（`run()` 在 busy 时直接 return）、`:75-81`（uiBus 的命令也走 `run()`）、`:82-91`（自动存档同样走 `run()`）。
- **问题**：每条成功命令都会触发 `autosave('state-change')`。在节流检查、快照、gzip、多次 SHA-256 和 IndexedDB 写入期间 busy 为真，这时用物品、装备、大地图按钮的点击都被直接丢掉，没有任何提示。
- **修法**：用户命令和存档分开排队：自动存档不占用 busy，或者用户命令进 FIFO 而不是丢弃。
- **归属**：ENG-19（UI 主流程）。

#### M5 消耗品的 perBattle 计数在野外也生效，app 自己绕过；未知效果被静默接收

- **位置**：`core/src/economy/consumables.ts:19-25`（不区分 context，一律计数）、`:98-101`（未知 op 放进 `temporaryEffects`）；`apps/game/src/runtime/item-adapter.ts:28-31`（app 传空的战斗账本绕过）；`data/src/schemas/item.ts:39`（`op` 只校验正则，不校验枚举）。
- **影响**：规则在 app 里有一份副本；内容里的 op 拼写错误会通过校验，物品被扣掉却没有任何效果（目前靠 app 白名单禁用来兜底）。
- **修法**：core 只在 `context==='battle'` 时计 perBattle；未知 op 直接拒绝；schema 用枚举 op 加各自的参数 schema；然后删掉 app 里的绕过分支。
- **归属**：ENG-16b（战斗内道具会改到 consumables）。

#### M6 构建期用正则从 Markdown 设计文档里抽取数据；剧情 DSL 在构建期没有编译检查

- **位置**：`apps/game/build/content-plugin.ts:31-55`：经脉拓扑从 `docs/design/15-*.md`、门派名从 `docs/design/17-*.md` 中正则抽取；`data/src/schemas/story.ts:6,33`：条件和动作是自由形式的 record，只有运行时的 `core/src/quest/compile.ts` 才会编译。
- **影响**：
  - 改一次文档排版就可能把构建打挂，这违反「schema 即文档、数据驱动」；
  - 剧情里的条件或动作错误只能在玩家走到那里时才暴露。
- **修法**：
  - 经脉拓扑和门派表落到 `content/common/{meridians,sects}`（目录已存在），用 schema 校验；
  - 新增 `content:compile-story`，用 core 的编译器预编译全部 story line（工具脚本可以依赖 core），并入 `pnpm check`。
- **归属**：ENG-18-content-build。

#### M7 包体门禁的口径有漏洞

- **位置**：`tools/perf/check_size.mjs:59-64,78-95`；`apps/game/src/main.ts:23-25`；`apps/game/build/content-plugin.ts:62`；`apps/game/vite.config.ts:53-56`。
- **问题**：
  - 启动时必然会 await 的动态块不计入预算：`game-controller` 41.7 KiB gz（含 Dexie）、`core` 26.4 KiB gz；
  - 全部内容以 JSON 内联进 worker（`_virtual_tianshu-content` 约 70 KiB gz），worker 又算作 entry 的资产，所以内容每增长一点都直接占用 entry 的 170 KiB 预算；
  - 书界没有分包，`book-*` 预算永远显示 not emitted，等于从未被检查。
- **修法**：门禁加一条「冷启动关键路径」，统计 entry 与启动期必然 await 的块；内容改成按书界拆包（ENG-18）；`book-*` 未产出时由告警改为失败（等 ENG-18 落地后启用）。
- **归属**：ENG-18、ENG-24。

#### M8 PWA 与离线

- **位置**：`apps/game/vite.config.ts:14-36`；`apps/game/src/pwa.ts:3`；构建产出的 `manifest.webmanifest` 里没有 icons。
- **问题**：
  - `registerType:'prompt'`，但没有注册 `onNeedRefresh`，也没有更新提示，新版本要等所有标签页关闭才生效；
  - manifest 缺 192 / 512 图标，无法作为 PWA 安装，三机门禁里的「主屏 PWA 入口」无法测试；
  - 预缓存的 `assets/default/**/*.png` 命中 vite-plugin-pwa 默认的 `dontCacheBustURLsMatching=/^assets\//`，同路径换图后永远不会刷新（ENG-23a 调研已发现）；
  - 物品图标和立绘不在预缓存里，离线时会缺图；
  - `/rig-demo` 这个开发页也被预缓存了。
- **归属**：ENG-23a（PWA 中与内容无关的部分）。

#### M9 「一条命令自检」覆盖不全；没有 CI，也没有 WebKit 对拍

- **位置**：根 `package.json:19`；仓库没有 `.github/`，也没有 Playwright 依赖。
- **问题**：
  - `pnpm check` 不包含 `check_ids --strict`（路线图 §3.5 要求的 ID 门禁）、Python 工具测试（259 项，`tools/lint`、`tools/vfx`、`tools/item`）、剧情 DSL 编译检查，也不包含覆盖率阈值（只有 platform 有单独的 `test:coverage`，且没有接入）；
  - 路线图要求的 V8 / WebKit 同一终局哈希对拍、经脉黄金的 WebKit 运行，都没有执行环境。
- **修法**：加 `pnpm check:content`（ID、剧情编译、Python 测试）并入 `check`；建最小 CI，一路 Node、一路 Playwright WebKit，跑 core 确定性向量。
- **归属**：新开 ENG-24（门禁与 CI）；浏览器部分按作者决定由协调者在沙箱外跑。

#### M10 WebGL 资源生命周期与 VFX 热路径

- **位置**：`render/src/battle/scene.ts:31,137-141`；`render/src/vfx/stage.ts:380`（战斗时同时存在两个 WebGL 上下文：战场和 VFX 叠加层）、`:204-233,242,267`（每帧 `uvFor` 返回新对象、`effectLocalBounds` 新建数组、`placeEffect` 新建闭包、`sampleTimeline` 返回新对象）；全仓没有 `webglcontextlost` 处理；`dispose()` 都不调用 `forceContextLoss()`。
- **影响**：移动端内存和合成开销增加；违反「热路径不逐帧分配」；上下文丢失后画面不会恢复（ENG-21b 已排期）。
- **修法**：VFX 改为与战场共用 renderer，或渲染到同一画布的叠加 pass；预分配 scratch；所有场景 `dispose` 时 `forceContextLoss`。
- **归属**：ENG-21b。

#### M11 IndexedDB 多标签页并发

- **位置**：`platform/src/storage/index.ts:55-60`、`save-store.ts:167-191`。
- **问题**：没有处理 Dexie 的 `versionchange` 和 `blocked`：新版本页面升级数据库后，旧标签页的写入会失败，并且只能提示通用错误。也没有跨标签页互斥（`navigator.locks` 或 BroadcastChannel），两个标签页可能同时读到同一个 `autosave:nextIndex`，覆盖同一个自动存档槽。
- **修法**：订阅 `versionchange` 后提示「请刷新」；存档写入用 `navigator.locks.request('tianshu-save')` 做互斥。
- **归属**：ENG-15（写集已包含 platform/storage），或 ENG-23a。

### 3.4 低（L）

| 编号 | 位置 | 问题 | 修法 / 归属 |
|---|---|---|---|
| L1 | `apps/game/src/render-host.ts`、`storage-demo.ts`、`packages/ui/src/GameUi.vue`、`packages/data/scripts/validate-content.mjs`、`platform/src/host/index.ts:8-32`（旧版 CoreHost） | 无人引用的死代码；platform 的 transfer、worldState、content-cache 共约 800 行还没接入；`/rig-demo` 进入了生产产物和预缓存 | 清理死代码；`/rig-demo` 只在开发构建中保留；归 ENG-19 / ENG-24 |
| L2 | `packages/data/package.json`（yaml 2.8.1）、`apps/game/package.json:24` | `pnpm audit`：yaml 低于 2.8.3，GHSA-48c2-rrv3-qjmp（深嵌套 YAML 导致栈溢出），只在构建期解析可信内容时用到；`@vite-pwa/assets-generator` 没有被使用，却引入了 sharp 0.33.5（2 个 high，libvips / libheif） | yaml 升到 2.8.3 以上；删掉未使用的 assets-generator，或在 ENG-23a 生成图标时再升级 sharp |
| L3 | 文档与实现漂移 | tech/05 第 638–655 行仍是协议 1 的浮点 `intInclusive` 示例；design/21 §3.5 防守曲线表没有列出 20000→5500 这个锚点，实现与 Python 都有，按表格插值在相对强度 18000–22000 之间会差最多 50 bp；design/04 §7.5 规定的目标结算顺序（unitIndex）与 design/09 第 1096 行（先按距离）冲突，代码按 09 实现；`apps/game/CLAUDE.md` 仍称单槽文件格式为 TSUI；路线图 §3.3 M1「后端」行与作者决定 ④（M1 不依赖后端）不一致 | 交文档同步任务 |
| L4 | `core/src/ai/index.ts:96` | `simulateAbstractBattle` 自己从 `setup.seed` 重新播种 battle 流，如果在战斗中途调用，会重放开局的随机数 | 改为接收调用方的 RNG；归 ENG-16c |
| L5 | `platform/src/storage/storage.test.ts:265-286` | 「1 MiB 存取在 50 ms 内」是单次墙钟断言，放在并行套件里，会随负载抖动 | 改为 best-of-N，或移入 perf 项目；归 ENG-24 |
| L6 | `apps/game/src/storage/save-service.ts:50-73` | 存档摘要全是占位值：`playTimeSec=0`、`lr/ld=1`，`gameTime` 恒为 0 | 由 core 提供真实摘要投影；归 ENG-15 |
| L7 | `render/src/worldmap/scene.ts:85`；`render/src/rig/manifest.ts:65-78,151` | 大地图场景 `dispose` 时没有调用 `batch.coreMesh.dispose()`（战斗场景有调用）；rig 每套部件 39 张图逐张 fetch、各自生成一张图集。AR-29 要求具名 NPC 每人一套部件，请求数和 draw call 会按套数线性增长 | 补上 dispose；部件打成离线图集；归 ENG-21b / TOOL-rig-* |
| L8 | `eslint.config.js` 中 core 的 `no-restricted-globals` | 没有禁用 `structuredClone`（宿主 API）；core 的 tsconfig 只有 ES2023 lib，却能通过类型检查，类型来源不清楚 | 换成 core 内的 JSON 深拷贝工具，或者显式允许并写进文档；归 ENG-15 |

---

## 4. 测试评估

- **断言质量**：core 和 storage 的测试质量较高：
  - RNG 有固定向量和单次调用计数，`GameState` 规范哈希有锁定，行动被拒时会断言状态与 RNG 字节不变，战斗回放哈希有 golden；
  - 三代存档覆盖了损坏回退、两阶段提交回滚和 TSAV / ZIP 损坏用例。
  - 没有发现 `.skip`、`.only`、`.todo`，也没有 `expect(true)` 这类空断言。只有 3 处较弱的 `toBeDefined`（app-flow 和 UI 按钮存在性）。
- **覆盖空白**（按风险排序）：
  1. 生产经脉 runtime 没有黄金（S1）；
  2. app 实战与 core 回放之间没有一致性测试（S3）；
  3. 越界速度、零速度的 CT 测试（H5）；
  4. 方位、高差向量（H1）；
  5. 页面快速卸载和 WebGL 生命周期（H3）；
  6. 着色器编译和真实 GPU（只在 node / happy-dom 下测，H2 这类问题测不出来）；
  7. 多标签页 IndexedDB（M11）；
  8. Worker 崩溃和超时：`projection-host` 没有调用超时，worker 死循环会让 FIFO 永久挂起，也没有测试；
  9. 剧情 DSL 编译只覆盖了测试夹具，没有覆盖全部真实内容（M6）。
- **门禁被放宽的情况**：集成分支上的 `performance.test.ts` 没有跳过逻辑；ENG-09 工作区里执行器加的「高负载跳过断言」已经撤掉，CLAUDE.md 的改法也正确。但集成分支 `packages/render/CLAUDE.md:37` 仍保留着授权跳过的条文（H4），合入 ENG-09 时要保留它的改法。
- **性能断言的口径**：core bench 都是桌面 Node 上的 best-of-N。本次实测：
  - 战斗 20 回合：5.84 / 20 ms；
  - 经脉 1000 tick：0.62 / 5 ms；
  - 几何：1.85 / 8 ms（取自 ENG-16a 报告）。

  余量约 3–8 倍。按中端安卓慢 4–6 倍估算，战斗一项（约 23–35 ms）会超出预算。这些数字不能当作移动端预算的证据，tech/03 要求的三机数据目前全部是「待实测」。

---

## 5. 与设计的一致性（抽查）

| 抽查项 | 规格 | 实现 | 结论 |
|---|---|---|---|
| Z0 命中 / 招架 / 暴击 | design/04 §3.4 | `formula.ts:24-43`：bp 公式、上下限、开关、判定顺序、`next%10000<bp` 均一致 | ✅；但 `hitEff` 缺高差、遮蔽、LOS 项（H1） |
| Z1–Z10 | design/04 §2、§4 | `formula.ts:80-115`：1.24 常数、Z2 比值减伤、Z3 / Z4 钳制、Z4M / Z5M 独立乘区、暴击、境界差、招架 0.5 / 0.75、浮动 [9500,10500] 均一致 | ✅；Z7 的方位、高差、地形输入没有接（H1） |
| 结算顺序 | design/04 §6.1–6.2 | `settlement.ts:80-98`：护体 → 外放抵消 → mpGuard → 气血，守恒成立 | ✅ |
| CT 推进与首轮 | design/09 §3.1–3.4 | 首轮键、就绪裁决、收招 [500,2000]、待机 700 / 800 / 1000、硬控收招 1000、轮次锚定均一致 | ⚠️ 速度钳制不一致（H5）；`advanceMeridianTicks` 没有接（S1） |
| 经脉 runner（协议 3） | design/21 §2.5–§3.7 | `runtime.ts` 的产气、通量、卡住、胀损、质量归一、强度权重、曲线与本节公式逐条相符 | ⚠️ 防守曲线锚点与文档表格有出入（L3）；没有调息；没有黄金（S1） |
| 存档迁移 | tech/05 §14、tech/08 §3 | TSAV 头和大小限制、三代回退、迁移链框架（`SAVE_MIGRATIONS`）、按代 hash 都已具备 | ❌ meta 缺字段、contentHash 是占位值、版本要求严格相等（S2） |

---

## 6. 安全与健壮性

- **存档导入校验：强。**
  - 文件上限 256 MB；TSAV 头最多 64 KiB，载荷最多 32 MiB，解压时按声明长度封顶（防解压炸弹）；三重 SHA-256；
  - ZIP 只接受 store 方式，检查文件名（拒绝 `..` 和绝对路径）、CRC 和条目数；
  - JSON 经 `canonicalJson` 往返（拒绝 `undefined`、稀疏数组、孤立代理对）；
  - `parseGameState` 拒绝多余键、非安全整数和不一致的时钟；`validateSession` 逐项核对内容引用。
  - `__proto__` 这类键会被当成普通自有属性，然后在引用核对时被拒绝，没有原型污染路径。
- **内容加载：** 构建期做了 YAML 单文档、禁锚点、禁别名，Zod 用的是 strictObject（全部 schema 都是严格模式），并有跨引用核对。运行时信任构建产物，这是合理的。缺口见 M5（effect op 自由形式）和 M6（剧情 DSL）。
- **XSS 面：** 全仓没有 `v-html`、`innerHTML`、`insertAdjacentHTML`（测试清理代码除外）。存档里的 `location` 等文本只经 Vue 插值输出。VFX 资源 URL 限制在 `/assets/default/` 前缀（`vfx/stage.ts:174-179`）。`index.html` 没有 CSP（低优先级）。
- **依赖：** 见 L2。三项告警都只出现在构建期或开发依赖里，不进浏览器产物。

---

## 7. M1 就绪度

M1 终点按 AR-29：新游戏 → 可跳过开场 → 探索 / 对话 / 战斗 → 序章结束 → 本地存档 / 导出 → 书眠进入白马（唐，`ch10`）冷入口。

「10-01」一列取自 `scratchpad/m1_gap.md`（10-01 22:20，基于 1cbae5af，当时把 ENG-08 / 09 / 11 按已完成计算）。「现在」一列是 10-02 约 10:50 的状态。

| 系统 | 项 | 10-01 | 现在 | 依据 / 剩余缺口 | 下一步 |
|---|---|---|---|---|---|
| core | 状态树 | 部分 | 部分 | 大地图位置已进入 `chapter.worldMap`；`battle / dialogue` 恒为 null；没有 saveSchema、rulesProtocol、contentHash（S2） | ENG-15 |
| core | 命令 / 事件 | 部分 | 部分 | `Core.dispatch` 只接受 `world/tick`；命令总线实际在 `apps/game/src/runtime/session.ts` | ENG-15 / 16c |
| core | 五流 RNG | 已有 | 已有，但没被消费 | 协议 2 有 golden；GameState 的五条流从未被玩法消费，战斗 seed 是常量（S3） | ENG-15 |
| core | 10 Hz 驱动 | 缺失 | 缺失 | 大地图用 app 的 220 ms 定时器步进，不是 core 的探索驱动 | ENG-15 / 19 |
| core | 六角 A* / LOS | 部分 | **已有** | ENG-16a 合入：A*、可达集、LOS、朝向、射程和目标合法性 | — |
| core | CT、Z0–Z10、Buff 子集 | 已有 | 部分 | 公式一致；方位、高差没接（H1）；速度钳制（H5）；防御、道具、急性聚气在 ENG-16b | ENG-16b / 16d |
| core | 任务 / Ink | 部分 | 部分 | `StoryRuntime`、`InkJsDialogueBridge` 只在 core 里；app 没有引用；没有 `.ink` 文件，也没有编译步骤 | ENG-17 / 18 / 19 |
| core | 存读档 | 部分 | 部分 | 存的是 `ui-session.v1` 边车格式；GameState 不含剧情快照 | ENG-15 |
| core | 录像 | 部分 | 部分 | 只有战斗回放；app 不记录；与实战事件流不一致（S3） | ENG-16c |
| 经脉 | 协议 2 / 3 TS runner、逐单位实例、注入 battle RNG | 部分 | 部分 | 生产 runtime 已有 | — |
| 经脉 | 零副作用 preview | 缺失 | **已有** | ENG-14 合入 | — |
| 经脉 | `meridian-flow-state.v2` 快照 | 已有 | 已有 | 快照与恢复校验完整 | — |
| 经脉 | 黄金对拍（Node / WebKit） | 缺失 | **形式通过、实质缺失** | 只对拍了孪生实现，协议 2，仅 Node（S1） | ENG-14b、ENG-24 |
| 经脉 | 接入战斗 | 缺失 | 缺失 | `meridianAttackBp` 仍是静态值 | ENG-16b |
| 渲染 | 地形 | 部分 | 部分 | 大地图已有；城镇（ENG-09）10:44 校验通过、在审；战斗六角层已有 | ENG-09 合入 |
| 渲染 | 角色（AR-22 分层部件） | — | 部分 | rig 管线和近侧修正已合入；正式部件图未出，用占位 | ART-rig-parts、TOOL-rig-clips |
| 渲染 | 四偏航、昼夜 | 缺失 | 缺失 | — | ENG-21a |
| 渲染 | 战斗格 | 已有 | 已有（有风险） | uniform 超限（H2） | ENG-21b / 10b |
| 渲染 | 基础 VFX | 待合入 | **已有** | ENG-11 合入 | — |
| 渲染 | DOM 浮字 | 已有 | 已有 | — | — |
| 渲染 | 上下文恢复、自适应质量 | 缺失 | 缺失 | — | ENG-21b |
| 数据 | ch00 schema | 部分 | 部分 | `ChapterIdSchema` 能匹配 `ch00_*`；没有零槽书眠等序章特例 | ENG-18 / 17 |
| 数据 | Tiled | 缺失 | 缺失 | ENG-18b 尚未登记 | ENG-18b |
| 数据 | Ink bridge | 部分 | 部分 | — | ENG-18 |
| 数据 | 规则 / 文本分片、remap | 缺失 | 缺失 | 内容整包内联进 worker（M7）；locales 为空 | ENG-18 |
| 素材 | 登记库 | 部分 | 部分 | manifest 已覆盖物品、人物（380 人）、立绘；仍没有许可字段 | 素材线 |
| 素材 | 三档、KTX2 / WebP、AAC / H.264 | 缺失 | 部分 | 立绘已有 WebP mid / low；没有 KTX2、音频、视频 | ENG-18 / 素材线 |
| UI | 新游戏、标题、创角、开场 | 缺失 | 缺失 | `bootstrap.ts` 只有预览会话 | ENG-19 |
| UI | 对话框 | 缺失 | 缺失 | — | ENG-19 |
| UI | 战斗 HUD、背包、存档页 | 已有 | 已有 | 存档页已支持 TSAV / JSON / ZIP | — |
| UI | 设置、错误恢复、内容下载 | 部分 | 部分 | 设置只有大字和减少动效；没有下载界面 | ENG-19 / 23a |
| 后端 | 私有托管 | — | 不适用 | 作者决定 ④：M1 不依赖后端。路线图该行需改 | 路线图修订 |
| 离线 | 应用壳 | 部分 | 部分 | 没有更新提示和图标；预缓存图片不刷新；离线时缺图（M8） | ENG-23a |
| 离线 | 序章闭包 | 缺失 | 缺失 | ch00 没有内容 | CONTENT-ch00 |
| 离线 | 三代档、JSON / TSAV / ZIP | 部分（ENG-13 在做） | **已有** | ENG-13 合入；contentHash 是占位值（S2） | ENG-15 / 18 |
| 内容 | ch00 序章、ch10 白马（唐）冷入口 | 设计在做 | 设计已合入，没有内容 | DES-prologue-ch00、DES-baima-tang 已合入；DES-prologue-v2、DES-sleep-events 刚登记 | CONTENT-ch00、ENG-17 |
| 玩家路径 | 新游戏 → 序章 → 书眠 → 白马 | 缺失 | **缺失** | 一段都没打通 | ENG-15 → 17 → 19 |

路线图 §3.5 验收闸门：

| 维度 | 现状 | 说明 |
|---|---|---|
| 可玩性（序章通关） | ❌ | 没有序章内容和流程 |
| 测试（core 单元 / 属性 / golden 全绿、12 组冒烟） | ⚠️ | 单元测试全绿，但经脉黄金不覆盖生产代码；没有冒烟矩阵 |
| 确定性（V8 / WebKit 同哈希） | ❌ | 没有 WebKit 执行；实战与回放不一致 |
| 命令摘要兼容 | ⚠️ | 战斗回放哈希域里已含 `commandPrefix`；实战不产出录像 |
| 经脉黄金 | ❌ | S1 |
| 经脉三机 | ❌ | 待实测 |
| 性能（tech/03 六个 CI 场景） | ❌ | 只有桌面 Node 门禁；rig 门禁会抖动（H4） |
| 体验（冷启动 ≤4 s 等） | 未测 | 包体门禁口径有漏洞（M7） |
| 离线 / 存档 | ⚠️ | 存档已有；离线闭包和 PWA 缺失 |
| 私有访问 | 不适用 | 待路线图改口径 |
| 素材 | ⚠️ | 人物、物品已大量入库；rig 部件、许可台账缺 |
| 无障碍 | ⚠️ | 键盘、触屏、大字、减少动效已有；缺字幕、横屏提示、`prefers-reduced-motion` |

**10-01 以来的进展**：

- 合入：ENG-08（ch01 大地图、旅行、A*、城门）、ENG-11（VFX）、ENG-13（正式存档：TSAV / JSON / ZIP、三代、persist）、ENG-14（孪生黄金与 preview）、ENG-16a（战斗几何）、TOOL-rig-nearside；设计侧合入 DES-prologue-ch00、DES-baima-tang、DES-changsheng-core。
- 在途：ENG-09（10:44 校验通过，审核中）；ENG-16b 和 TOOL-rig-clips 正在执行；ENG-15、18、21a、21b 排队等 ENG-09。
- 还没登记：ENG-17（书眠）、ENG-19（UI 主流程）、CONTENT-ch00、ENG-18b（Tiled）、ENG-23a（PWA）。

**M1 还差什么（按依赖顺序）**：

1. ENG-15：命令总线、GameState 补全、版本化（S2）。
2. ENG-14b 和 ENG-16b / 16c：经脉黄金、接入战斗、战斗收回 core（S1、S3）。
3. ENG-18：分包、contentHash、Ink 编译。
4. ENG-17：书眠与章节切换（需 DES-sleep-events、DES-prologue-v2 先出）。
5. ENG-19：新游戏、对话、任务界面。
6. CONTENT-ch00 与 ch10 冷入口内容。
7. ENG-21a / b、ENG-23a：画面与离线。
8. 浏览器与真机门禁（ENG-24，加三机实测）。

---

## 8. 建议优先修的 10 件事

1. **经脉协议 3 黄金（S1）**：由 Python 参考实现重录 v3 黄金，测试直接驱动生产 `MeridianFlowRuntime` 逐字段对拍；孪生 runner 降级为旧录像回放器；同时修订路线图 §3.5 的口径。
2. **版本化（S2）**：core 导出 `RULES_PROTOCOL`，`GameState.meta` 补上 `saveSchema / rulesProtocol / contentHash`；存档写入真实 contentHash；读档改成「版本低就迁移、版本高就提示」，不再要求严格相等；版本不兼容不再被当作损坏回退。
3. **战斗收回 core（S3）**：建 `BattleSession`，统一负责 RNG、自动步进、行动上限、自动事件和录像；加「实战 transcript 等于 `runBattleReplay` 哈希」的回归；战斗 seed 从 world 流派生。
4. **伤害链接入几何（H1）**：方位、高差、地形、遮蔽、LOS 命中修正接进 Z0 / Z7，补向量测试。给 ENG-16b 追加返修说明，或另开 ENG-16d。
5. **战斗格 uniform 改用 DataTexture 或实例属性（H2）**：在三机门禁之前完成。
6. **大地图页（H3 + M1）**：加 `disposed` 守卫，dispose 时 `forceContextLoss`；投影拆成「静态几何发一次、动态状态每步发」。
7. **rig 性能门禁的测法（H4）**：perf 项目先跑或冷却后再跑，或改测 CPU 时间、相对基准；删掉 render/CLAUDE.md 第 37 行的负载护栏条文。具体方法请作者定。
8. **CT 速度单点钳制（H5）**：`gain(u)` 统一用于等待和推进，递归改循环并加 spd ≤ 0 守卫。
9. **错误分类与剧情事务化（H6）**：区分领域拒绝码和内部错误（内部错误上报并中止）；StoryRuntime 改为写时复制、一次提交。
10. **完整门禁与 CI（M9 + M6）**：`check_ids`、Python 工具测试、剧情 DSL 编译并入 `pnpm check`；建最小 CI，一路 Node、一路 Playwright WebKit，跑确定性向量。
