# 本任务：游戏工程 · 区域探索 A（core）：挂载 RegionMap、场景内行走、交互锚点、门禁、出口与自动存档点

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-18b-tiled-regionmap.md`（RegionMap 字段与对象类，第 7 节交给 ENG-20 的接口必须照做）、`ENG-15-core-bus.md`（命令总线、`world.navigation`）、`ENG-17a-newrun-dialogue.md`（对话开始与 Ink 动作执行）、`ENG-09-town-scene.md`（城镇里行走、可走性、锚点与交互的做法，照它的分层）、`ENG-16a-battle-geometry.md`（六角工具）。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.1：M1 要「序章探索 / 对话 / 战斗」。序章四个场景（竹林、山径、越营、长白山洞）和白马冷入口的烽燧废驿，都是 Tiled 画的 RegionMap（ENG-18b）。但现在没有任何运行时能挂载它：
- 大地图（ENG-08）与城镇（ENG-09）各有一套；
- core 没有 `world/mountRegion`；
- 场景里不能行走、不能和锚点交互，出口与门禁也不生效。

本任务做 core 侧；渲染与页面由 ENG-20b 做。

## 规格（照这些写，不自创）

- `docs/tech/05-gameplay-engine.md`：
  - §3.3 `world.navigation`（`mountedRegion = {regionId, spawnId, playerHex, facing, dynamicTiles, entities}`）；
  - §5.4 大地图、时代层与区域挂载：三套坐标互不推导；宿主先预载区域包，再发 `world/mountRegion`；
  - §5.5 旅行与区域探索；§5.7 探索命令与碰撞；§6.1 六角坐标。
- `docs/tech/04-data-pipeline.md` §6.1–§6.3：对象类 NpcSpawn、PlayerSpawn、EnemyZone、Door、Trigger、QinggongGate、Chest、CameraHint、BattleArena、Building、Light。
- `docs/design/11-open-world.md`：§1.2–§1.3 场景规模，一次只挂一个场景；§1.4 区域连接；§1.5 门禁与解锁节奏；§1.6 书眠切换时的卸载与挂载；§12.2 `PoiDef` 交互锚点。
- `docs/design/24-story-dag.md` §2.4：`spawn` / `despawn` 锚点在各场景内解析。
- `docs/design/08-terrain-and-qinggong.md`：§1.4 六角约定；§6.1–§6.3 门禁类型、`GateExpr`、`QinggongGate`；§6.6 反挫败；§6.7 校验。
- `docs/design/chapters/00-yuenv.md` §2.2–§2.3：序章场景的出口、软锁门、安全锚点与自动存档点，作测试夹具参考。

## 要做的事

1. **挂载**：
   - `world/mountRegion { regionId, sceneId, spawnId }` 由宿主在预载并校验区域包后发出；
   - core 只接收已解析的 RegionMap 数据，不联网、不读文件；
   - 挂载失败留待处理状态，不改其他状态（tech/05 §5.4）。
2. **行走**：
   - `world/walkTo { hex }`：在 RegionMap 格网上寻路，复用 core 的六角工具，考虑可站立、高差、跳跃、轻功档位门槛；
   - 路径只预览，确认后提交，与战斗一样不信任预览；
   - 碰撞与动态格照 §5.7。
3. **交互**：
   - `world/interact { anchorId }`：NpcSpawn → 开对话（调 ENG-17a 的对话开始）；Trigger → 执行它带的 Ink 动作或剧情推进；Chest 与拾取；Door / 出口 → 切场景或回大地图；
   - 交互距离与可见性在 core 判。
4. **门禁**：`GateExpr` 求值（旗标、任务阶段、轻功档位）；软锁门给出原因码，供界面提示。
5. **自动存档点与安全锚点**：
   - 经过或交互时发事件，由宿主执行自动存档；core 不碰存储；
   - 对话与书眠事务中不触发。
6. **投影**：当前场景静态几何只在挂载时发一次；每步只发玩家位置、朝向、可交互锚点与门状态（审计 M1 的教训）。
7. **测试**：
   - 挂载 → 行走 → 交互 → 过门 → 换场景的整段确定性：同命令序列得到同规范 hash；
   - 不可站立、越高差、轻功不足的路径被拒，状态不变；
   - 软锁门的原因码；
   - 交互开出的对话；
   - 夹具用 ENG-18b 的测试 RegionMap，或本任务写的小夹具。

约束：
- 写集：
  - core：`packages/core/src/world/region-*.ts`（新）、`packages/core/src/world/index.ts`、`packages/core/src/command/**`（只登记新 handler）、`packages/core/src/state/**`（只加 `world.navigation.mountedRegion` 相关）、`packages/core/CLAUDE.md`；
  - 应用：`apps/game/src/runtime/**`（宿主预载与命令转发的薄接线）。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/world/{worldmap-*,town-runtime}.ts`（大地图与城镇的逻辑）、`packages/core/src/battle/**`、`packages/data/**`、`packages/render/**`、`apps/game/src/pages/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 命令表（命令 → 校验 → 拒绝码 → 事件）；
- `mountedRegion` 状态结构；
- 交互与门禁规则表；
- 投影形状；
- 测试；
- 交给 ENG-20b（渲染与页面要用的投影、查询、命令）、ENG-26（BattleArena 锚点怎么开战）、CONTENT-ch00 / ch10（锚点与门禁在地图里怎么写）的接口。

报告 ≤ 90 行。
