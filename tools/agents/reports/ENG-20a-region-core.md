# ENG-20a-region-core 报告 · 游戏工程 · 区域探索 A（core）：挂载 RegionMap、场景行走、交互锚点、门禁、出口与自动存档点

## 1. 摘要（3–6 行）

已接通宿主预载并校验 RegionMap → core 原子挂载 → 确定性预览/行走 → 锚点交互 → 门/轻功门请求下一场景的完整链路。
core 统一判定可站立、高差、坡道、动态格、占用、跨沟、距离、视线、消耗态与 GateExpr；提交会重新求路，拒绝不改状态。
NPC 启动既有 Ink 对话，宝箱原子入包；Trigger、BattleArena、切场景、自动存档均只发请求事件，由各自所有者接续。
静态几何每次挂载只投影一次，普通步进只投影玩家、锚点和门状态；缓存仅在 core 挂载成功后提交。

## 2. 产出（文件、行数、主要章节）

| 文件组 | 文件数 / 行数 | 主要内容 |
|---|---:|---|
| packages/core/src/world/region-*.ts | 4 / 538 | Region 类型、base64 解码、地形规则、GateExpr、寻路、LOS、投影 |
| command/region-handler*.ts | 2 / 462 | 三命令事务、交互效果、事件与 11 条区域回归 |
| core 既有 command/state/world + CLAUDE.md | 13 + 1 | 总线登记、schema-3 状态/迁移/校验、书眠卸载、工程合同 |
| apps/game/src/runtime/** | 8 / 1,190 | 区域叶片预载、原子内容缓存、会话转发、恢复校验、投影；5 条区域应用回归 |
| 总变更（含报告） | 28 文件，+1,547/−42 | 8 个新实现/测试文件及本报告；无依赖或锁文件改动 |

## 3. 关键结论与数值

| 项 | 结论 |
|---|---|
| 坐标与格网 | 复用轴向六角；32×32 chunk；高度 0–10；所有 core 运算为安全整数 |
| 轻功 | 沿用阈值 0/20/50/90/140/200；支持坡道、高差、水域约束及仅越 tr_shengu/tr_shenshui 的直线跨沟 |
| 交互 | 距离 ≤1 且 LOS 不穿石壁/城墙/高墙/宫殿屋脊；inactive/consumed 锚不出现也不可触发 |
| 原子性 | mount 失败时 GameState 与应用内容缓存均不变；walk/interact 拒绝不写状态、不发事件 |
| 存档 | 安全锚/自动存档点只发事件；对话、书眠事务或待挂载期间抑制，core 不访问存储 |
| 外部事实 | 未引入版本、价格、浏览器 API 或远程限额，不存在需联网核实的新技术事实 |

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 后续归属 |
|---|---|
| Trigger 的 eventId/action 尚无通用 DAG/动作执行端口 | 只发 world/triggered；剧情所有者校验并执行，不伪报已推进 |
| BattleArena 只有 encounterId，没有可直接启动的 BattleSetup | 只发 world/battleRequested；ENG-26 解析遭遇并进入战斗 |
| Door schema 不能表达“返回全国大地图” | 默认只做场景/区域切换；后续增加明确目标种类，不能用特殊 ID 猜测 |
| 正式 ch00/ch10 RegionMap 尚未进入当前内容包 | 默认无地图即 REGION_UNAVAILABLE；CONTENT 任务提供生产夹具 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无 | 实现遵循现行 canon、tech/05、design/08/11 与 ENG-18b 合同 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 / 同步内容 |
|---|---|
| docs/tech/05-gameplay-engine.md | §3.3/§5.4–5.7：登记三命令、pending mount、静/动态投影及请求事件 |
| docs/tech/04-data-pipeline.md | §6.1–6.3：补 gate/dialogue/loot 运行时 binding 与 Trigger/BattleArena 消费所有者 |
| docs/design/11-open-world.md | §1.4–1.6：为 Door 增加显式“回大地图”目标协议，避免特殊 ID |
| CONTENT-ch00/ch10 | 场景对象：按 §7.4 写锚点、门禁、双向出口、安全点和自动存档点 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 命令表

| 命令 | 核心校验 | 稳定拒绝码 | 成功事件 |
|---|---|---|---|
| world/mountRegion {regionId,sceneId,spawnId} | 内容身份、pending 目标、可站立 spawn、无交互事务 | REGION_UNAVAILABLE / REGION_CONTENT_MISMATCH / REGION_SPAWN_UNKNOWN / REGION_INTERACTION_BUSY | world/regionMounted；安全出生点另发 world/safeAnchorReached |
| world/walkTo {hex} | 已挂载、动态格/占用、可站立、高差/坡道/跨沟/轻功；提交重算 | REGION_NOT_MOUNTED / REGION_PATH_NOT_STANDABLE / REGION_PATH_BLOCKED / REGION_PATH_HEIGHT / REGION_PATH_QINGGONG / REGION_INTERACTION_BUSY | world/walked；沿途 Trigger/安全/存档事件 |
| world/interact {anchorId} | 距离、LOS、active/consumed、pending、GateExpr、背包容量 | REGION_ANCHOR_* / REGION_EXIT_PENDING / REGION_GATE_* / REGION_LOOT_* / REGION_INTERACTION_BUSY | dialogue/started、world/triggered / chestOpened / regionRequested / battleRequested |
| world/previewRegionPath {hex}（app 查询） | 与 walk 相同只读查询 | 在 regionPathPreview 返回完整 REGION_* 原因，不进 GameState | 无 |

### 7.2 状态、交互与门禁

- ✅ mountedRegion = {regionId, spawnId, playerHex, facing, dynamicTiles, entities}；动态格含 q/r/terrainId/height，实体含 anchorId/active/consumed；静态地图不进存档，未知动态地形拒绝。
- ✅ NPC → dialogue/started；Trigger → intent；Chest → 入包并 consumed；Door/QinggongGate → pending + regionRequested；BattleArena → 请求事件。
- ✅ GateExpr 支持 all/any/not、旗标、任务、物品、轻功及既有能力原子；软锁稳定返回 QINGGONG/ITEM/QUEST/FLAG/CAPABILITY/LOCKED。

### 7.3 投影与测试

- ✅ 静态 region-static.v1 含 regionId/sceneId/bounds/terrainTable/chunks/objects/backdropAssetKey，仅 mount/恢复首帧发送；动态含 playerHex/facing/interactableAnchors/doors/pendingMount；预览独立且提交清空。
- ✅ 确定性链覆盖 mount→walk→NPC/Trigger/Chest→Door→mount，重复命令序列规范 hash 相同；覆盖墙、不可站立、高差、跨沟、轻功不足、软锁原因、动态格、inactive 实体/Trigger、失败缓存不泄漏。
- ✅ 正式门禁：冻结安装；pnpm check 129 文件/932 测试且 size 全绿（entry 166.34/170 KiB，WebGL 326.87/350 KiB）；core 43/463；game 26/93；game build 454 modules；strict ID 新增失败 0。

### 7.4 下游接口

- ENG-20b：消费 regionStatic/region/regionPathPreview；发送 preview、walk、interact、mount；收到 regionRequested 后预载并提交 mount，界面只展示 reason code。
- ENG-26：消费 world/battleRequested {anchorId,encounterId}，解析 BattleSetup 后走正式战斗入口；本任务不自行构造参战者。
- CONTENT-ch00/ch10：每场唯一安全 PlayerSpawn；Door 指定三目标 ID；QinggongGate 指定 tier/alt/to；Trigger 明写 once/safe/autosave/eventId/action；宝箱 lootRef 与宿主 binding 闭合。
- ✅ 范围与质量：仅改允许写集，git diff --check 通过；报告无 TODO/省略项，未执行改变仓库状态的 git 命令，未放宽或跳过性能门禁。
