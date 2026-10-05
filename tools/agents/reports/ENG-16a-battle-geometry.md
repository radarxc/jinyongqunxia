# ENG-16a-battle-geometry 报告 · 游戏工程 · 战斗补全 A（六角 A* / 可达集 / LOS / 移动与朝向 / 射程与目标合法性进 core）

## 1. 摘要（3–6 行）

core 已补齐确定性六角连线、LOS、A* / Dijkstra 可达集、占用 / ZOC、战场位置与朝向、行动计划及射程 / 目标合法性。
战斗提交会重算路径与目标，失败不写状态、不消费 RNG；棋盘 AI 会先走到攻击位，抽象自动战斗保持无几何。
应用层只保留意图转换与展示，范围 / LOS / 目标规则统一调用 core；演示夹具已提供格网与站位。
core、整仓、性能、构建、ID 门禁通过；独立 game 原始测试脚本仍有一项写集外的配置加载问题，见 §7.5。

## 2. 产出（文件、行数、主要章节）

| 文件组 | 文件数 / 当前行数 | 主要产出 |
|---|---:|---|
| `packages/core/src/hex/` | 5 / 679 | 连线、LOS、A*、可达集、共享边 helper、性质测试 |
| `packages/core/src/battle/` + `src/testing/` | 10 / 1,642 | 状态 / 招式字段、geometry 查询、事务行动计划、夹具与回归 |
| `packages/core/src/ai/` | 2 / 196 | 棋盘接近目标；抽象模拟隔离 |
| `packages/core/src/replay/index.test.ts` | 1 / 59 | 新命令协议 replay golden |
| `packages/core/bench/` | 1 / 46 | 400 格、24 单位、8 ms 门禁 |
| `packages/core/CLAUDE.md` | 1 / 133 | core 几何职责与下游契约 |
| `apps/game/` 允许写集 | 7 / 494 | 演示格网 / 站位、core 查询适配、状态位置展示 |

代码 / 测试 / 指南共 27 文件、3,249 行；其中新建 6 文件、925 行，另新增本报告。

## 3. 关键结论与数值

- `qgTier` 阈值为 20 / 50 / 90 / 140 / 200；`move=clamp(3+tier+withinTier+flat−penalty,1,10)`，`jump=clamp(tier+flat,0,6)`；`qinggong=98` 得 qg3 / move 6 / jump 3。
- 战场限制为最多 400 格、q/r span 各不超过 20；格和单位输入规范化后按 `(r,q)` / `unitIndex` 稳定。
- 待机收招为原地 700、移动后 800、连续第二次 1000；明确 `facing` 覆盖缺省朝向。
- LOS 以眼高 `h+1` 作整数有理数比较；缺省白昼视野 12，单位投射阻挡与 partial 规则均在 core。
- 可达集只跑一次 Dijkstra；提交不信任预览，`PATH_BLOCKED / OUT_OF_RANGE / NO_LOS / INVALID_TARGET` 均稳定且事务回滚。

## 4. 开放问题（附默认值）

| 问题 | 本次默认值 | 后续归属 |
|---|---|---|
| 战场尚无天气 / 光照视野快照 | 采用白昼 12 格 | ENG-18 提供内容字段，后续 core 状态接入 |
| DES-attr-v2 / 经脉速度将调整移动输入 | `BattleUnitSeed.move` 可覆盖；否则用纯函数推导 | ENG-16b / 属性接线任务 |
| game 独立测试脚本的 Vite loader | 以 `--configLoader runner` 验证同一批测试 | ENG-18（其写集含 `apps/game/package.json`） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无 | 本次按 `tech/05`、`design/08`、`design/09` 现行规则实现 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 | 需同步 |
|---|---|---|
| ENG-16b | BattleAction / resolver | 增加 `guard`、`item`、`yunjin/gather`，复用候选状态与 staged RNG 事务 |
| ENG-16c / `tech/01` | 命令总线、战斗 UI | 接入行动计划及 `queryReachable/queryPath/queryMoveAt` 高亮 / 确认 |
| ENG-21 / `tech/02` | 战斗镜头 | 规定 core `HexDir` 世界角 0/300/240/180/120/60° 到镜头相对朝向的换算 |
| ENG-18 / CONTENT-ch00 | 遭遇 schema | 写入格 `q/r/height/moveCost/canopy/los/standable/narrow/dangerous` 与单位 `pos/facing` |
| ENG-18 | `apps/game/package.json` test | 为 `vitest run src` 增加 `--configLoader runner`；其写集同时覆盖 data/build/package，能修正配置加载链 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 几何 API 表

| 函数 | 文件 | 复杂度 | 规格 |
|---|---|---:|---|
| `hexLineBetween` | `hex/line.ts` | O(d) | tech/05 H-09；08 §5.6 |
| `lineOfSight` | `hex/line.ts` | O(G+d) | tech/05 §6.6；09 T8/T9 |
| `evaluateStep` | `hex/pathfinding.ts` | O(U) | tech/05 §6.4；09 §4.2–4.4 |
| `findHexPath` | `hex/pathfinding.ts` | O(E·U+(V+E)logV·L) | tech/05 §6.3 |
| `findReachableHexes` | `hex/pathfinding.ts` | O(E·U+(V+E)logV·L+V²) | tech/05 §6.3 |
| `queryReachable/queryPath` | `battle/geometry/index.ts` | 同寻路 | tech/05 §3.3、H-11 |
| `queryMoveAt/queryLegalTargets` | `battle/geometry/index.ts` | O(G+U+A) | design/09 §5.2–5.5 |
| `isBattleUnitVisible` | `battle/geometry/index.ts` | O(G+d) | tech/05 §6.6 |

### 7.2 状态、命令与拒绝码

- ✅ `BattleSetup` 新增 `grid.cells` 与 `start.initialByUnit(pos,facing)`；`BattleState` 保存格网，单位保存 `pos/facing/move/jump/waitStreak`，无 open set / 路径 / 动画态。
- ✅ `BattleMove` 新增 `range/delivery/shape/hTol/target/friendlyFire`。
- ✅ 命令为 `battle/act {actor,walkTo?,action:{skill|wait},facing?}`；`battle/wait` 是等价别名。
- ✅ 四个几何拒绝码均有测试，拒绝前后状态 JSON 与 RNG 快照不变。

### 7.3 测试、性能与 golden

- ✅ H-01…H-05、H-08、H-09、H-11，以及 T6、T8、T9、T36 已覆盖；A* 与独立 Dijkstra 对拍 200 固定 seed。
- ✅ 格 / 单位顺序扰动 100 次字节一致；五流 RNG 查询纯度、100 次终局一致、预览后重验均通过。
- ✅ core 35 文件 / 278 测试；整仓 86 文件 / 466 测试；game runner 11 文件 / 35 测试。
- ✅ 400 格 / 24 单位可达集 + 路径 best-of-9 = 1.852 ms，低于 8 ms；rig 100 角色 best P95 = 0.525 ms（loadavg 11.74）。
- ✅ replay hash 由 `3a71767d…4382` 变为 `13dd4a49…9a7`：原因是行动计划载荷、格网和单位几何 / 待机字段进入状态；拒绝命令仍排除。
- ✅ `runtime.test.ts` 的 13 次 actor / event / 终局序列未变，无盲目重录；内部 accepted command 已换为行动计划。

### 7.4 未做项与下游接口

- ✅ 按任务边界未做飞越、水面通行、体力状态、强制位移与部署；也未修改 meridian-flow、command/api/state/world、Vue components 或 render。
- ✅ ENG-16b 从 `BattleAction` 与 `resolveBattleAction` 扩行动类型；事务测试沿用 `action/index.test.ts`。
- ✅ ENG-16c 直接消费三个只读查询并提交完整计划；ENG-21 只换算 `HexDir`，不得回写 `Dir8`。
- ✅ ENG-18 / CONTENT-ch00 使用 §7.2 所列 setup 字段；演示样例见 `apps/game/src/battle/demo.ts`。

### 7.5 门禁

- ✅ `pnpm install --frozen-lockfile`、`pnpm check`、core 278/278、performance 3/3、game build、strict ID、`git diff --check` 通过；ID 仅保留基线 `sk_babuganchan`，新增失败 0。
- ⚠️ 原样 `pnpm --filter ./apps/game test` 在收集前因写集外 `packages/data/src/tooling.ts` 的 extensionless `content-index` ESM 导入失败；同批测试以 `--configLoader runner` 35/35 通过，整仓 466/466 亦通过。唯一持久修复是改写集外 `apps/game/package.json` 测试脚本（dev/build 已用 runner）；未越界改动。
