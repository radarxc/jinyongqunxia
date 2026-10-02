# 本任务：游戏工程 · 战斗补全 A（六角寻路 / 可达集 / 视线 / 移动与朝向 / 射程与目标合法性进 core）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-04-combat-core.md`、`ENG-10-battle-ui.md`、`ENG-14-meridian-golden.md`。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 core 行：M1 要「六角 A* / LOS」。序章三场遭遇要移动、朝向、射程（`docs/design/chapters/00-yuenv.md` §5.1–§5.4）。

战斗补全拆成三步：
- **本任务 A**：几何与移动；
- **ENG-16b**：防御、道具、急性聚气、逐单位经脉、奖励；
- **ENG-16c**：战斗命令进 core 命令总线，界面按钮与可达高亮。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- `packages/core/src/hex/index.ts` 只有距离、盘、环、扇。`hexLine` 是方向射线，不是 A→B 连线。全仓没有 A*、Dijkstra、LOS。
- `battle/types.ts`：
  - `BattleUnit` 没有位置、朝向、移动力、跳跃；
  - `BattleState` 没有格网；
  - `BattleMove` 没有射程、投送方式、范围形状。这些在应用层 `apps/game/src/battle/contracts.ts`；
  - 命令只有 `battle/act{moveId,targetIds}` 和 `battle/wait`。
- `battle/action/index.ts` 的 `validateAct` 只查回合、内力、阵营，不查射程、视线、位置。射程和选目标在应用层 `apps/game/src/battle/queries.ts`，属于规则外泄（tech/05 §6.5 末段）。
- 待机固定 700；`ai/index.ts` 的 `chooseAutoCommand` 不看射程。
- 单位位置是应用层静态标记（`apps/game/src/battle/presentation.ts`、`launch.markers`）。

## 规格（照这些写，不自创）

- `docs/tech/05-gameplay-engine.md`：
  - §1.5 不变量：状态是纯 JSON；
  - §3.3 战斗状态：可达集、开集、动画态不入状态；
  - §6.1 坐标与稳定序；§6.2 战场格与构网；§6.3 通行图与 A*（节点键、代价、堆键、可达集用一次 Dijkstra、预览与提交重算）；§6.4 占用与 ZOC（搜索与提交用同一个 helper）；§6.5 范围模板；§6.6 LOS 与可见性；§6.7 测试 H-01…H-12；
  - §7.4 行动计划；
  - §15 测试（A* 最优性质测试、golden 不得盲目重录）；§16 性能预算（可达 / 预测每次 ≤ 8 ms，≤ 24 单位）。
- `docs/design/09-combat-system.md`：
  - §4.1 一次行动的构成（`walkTo` / `action` / `facing`）；
  - §4.2.1 轻功移动力；§4.2.2 六邻寻路与地形代价（同伴可穿、窄格除外；同代价时少行动 → 少危险 → (r,q) 序）；
  - §4.3 高度与跳跃；§4.4 控制区；§4.5 朝向与方位；§4.6 移动只在确认前预览；
  - §4.8.6 待机 700 / 移动后 800 / 连续第二次待机 1000；
  - §5.2 射程与高差；§5.4 目标合法性；§5.5 视线怎么用；
  - 方向约定：core 的 `HexDir` dir0..5 是世界角 0/300/240/180/120/60°；只持久化 `HexDir`。
- `docs/design/08-terrain-and-qinggong.md` §5.2 H1–H8 边合法性、§5.6–§5.7 视线算法、§7.2 移动代价。

## 要做的事

1. **几何（`packages/core/src/hex/`）**：
   - `hexLineBetween(a, b)`：整数立方插值，端点除外，等距按 (r,q) 取一个，正反向格集相同；
   - `lineOfSight`：§6.6 的整数 / 有理数比较，不用浮点；
   - A* 与 Dijkstra 可达集，节点键、代价和堆键照 §6.3；
   - ZOC 与占用用同一个 helper，搜索与提交共用。
   - 飞越、水面、体力三种模式和强制位移本任务不做，报告列出。
2. **状态**：
   - `BattleSetup` 输入格网（q、r、高度、移动代价、遮挡、可站立）和单位初始位置、朝向；
   - 移动力按 §4.2.1 由轻功档位算出，写成一个独立纯函数（DES-attr-v2 定稿后可能改输入）；跳跃同理。
   - `BattleState` 存格网与单位 `pos` / `facing`，全是纯 JSON。可达集、路径、开集都不进状态。
3. **命令**：
   - `battle/act` 改为 §7.4 / design/09 §4.1 的行动计划：`walkTo?`、`action`（本任务支持 `skill` 与 `wait`）、目标、`facing?`；`battle/wait` 可保留为等价别名。
   - 提交时重算路径并重验目标（H-11）。拒绝时给稳定原因码（如 `PATH_BLOCKED`、`OUT_OF_RANGE`、`NO_LOS`、`INVALID_TARGET`），不写任何状态、不动 RNG。
   - 朝向按 §4.5；待机恢复 700 / 800 / 1000。
4. **射程与目标进 core**：
   - `BattleMove` 加射程、投送方式、范围形状，字段照 design/09 §5.2–§5.4；
   - 目标合法性（射程、高差、视线、单位遮挡）只在 core 判；
   - 应用层 `queries.ts` 改为调 core，不再自己算。
5. **只读查询**（不写状态、不用 RNG）：可达集、路径预览、某招在某站位的合法目标。
6. **AI**：棋盘上的 `chooseAutoCommand` 在射程外时先接近目标，用 core 的可达集与路径。无几何的模拟自动战斗不动。
7. **应用层最小适配**（`apps/game/src/battle/*.ts`）：
   - 演示夹具给出格网与初始位置；
   - `runtime.ts` 把界面意图转成新命令；
   - 单位位置取自 core 状态，不再用静态标记；
   - `BattleUiCommand` 形状不变，`components/*.vue` 不改（ENG-21、ENG-16c 的范围）。
8. **测试**：
   - tech/05 §6.7：H-01…H-05、H-08、H-09、H-11；design/09 §15.2：T6、T8、T9、T36；
   - 性质测试：200 个固定种子格网上 A* 代价等于暴力 Dijkstra；
   - 输入的格子 / 单位顺序打乱，构网、路径、范围、LOS 字节相同；
   - 查询与预览前后状态 JSON 与五流 RNG 不变；每个拒绝码一条测试，拒绝后状态不变；
   - 同一命令序列跑 100 次终局 hash 相同；
   - 性能：400 格、24 单位的可达集加路径预览，写成 `packages/core/bench/*.test.ts`。`test:performance` 按目录自动收入，照 `combat.test.ts` 用 best-of-N，上限 8 ms。
   - 回放 golden（`replay/index.test.ts`）与应用层 `runtime.test.ts` 的命令序列会变：在报告里逐项解释差异，不许不加说明直接重录。

约束：
- 写集：
  - `packages/core/src/hex/**`、`packages/core/src/battle/**`、`packages/core/src/ai/**`、`packages/core/src/replay/**`、`packages/core/src/testing/**`、`packages/core/bench/**`、`packages/core/CLAUDE.md`；
  - `apps/game/src/battle/*.ts`、`apps/game/CLAUDE.md`。
  - 写集外的改动在提交时会被丢弃，所以不要改写集外的文件。
- **不改**：
  - `packages/core/src/battle/meridian-flow/**`（ENG-16b）；
  - `packages/core/src/{command,api,state,world}/**`（ENG-15）；
  - `apps/game/src/battle/components/**`、`packages/render/**`（ENG-21 / ENG-16c）；
  - `apps/game/src/runtime/**`、`packages/data/**`、`apps/game/build/**`（ENG-15 / ENG-18）。
  - 确实需要改这些才能完成的，在报告里写明需要什么，不要改。
- 遭遇内容（格网、站位）的数据 schema 不在本任务：只在 core 类型里定义输入，报告列出内容侧需要的字段，交 ENG-18 / CONTENT-ch00。
- 分层：规则只进 core；core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`。
- 每次写入 ≤ 150 行；不加新依赖；不改根 `packages/core/src/index.ts` 的导出布局，新导出走子目录 index。

性能是作者硬要求（AR-21「性能要最好」）：寻路复用缓冲区、热路径零分配，堆用数组实现。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

`pnpm check` 里的 rig 100 角色性能门禁在机器高负载时可能偶发失败。若只这一项失败，在报告里写明负载和数值，**不要改门禁阈值或跳过**。

## 报告

第 7 节写：
- 几何 API 表：函数、文件、复杂度、对应规格条目；
- `BattleSetup` / `BattleState` / `BattleMove` 新字段；命令形状与拒绝码；
- 测试与性能数据；golden 差异说明；
- 未做项：飞越、水面、体力、强制位移、部署；
- 交给下游的接口（放哪、怎么测、接口名）：
  - ENG-16b：行动计划怎么扩到防御 / 道具 / 聚气；
  - ENG-16c：可达集 / 路径预览查询怎么接界面高亮和命令总线；
  - ENG-21：`HexDir` 与镜头偏航的换算；
  - ENG-18 / CONTENT-ch00：遭遇内容需要的字段。

报告 ≤ 100 行。
