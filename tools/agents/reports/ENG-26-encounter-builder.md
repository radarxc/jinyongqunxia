# ENG-26-encounter-builder 报告 · 游戏工程 · 遭遇定义转战斗（encounter.v1 → BattleSetup：战场、参战者、切磋 / 留手 / 重试、特殊胜利条件、脚本节拍、模板）

## 1. 摘要（3–6 行）

- 新增严格 `encounter.v1` schema、内容注册与 NPC / 模板 / Quest 引用检查。
- 新增纯函数 `buildEncounter()`，确定性产出 `BattleSetup + BattleUnitSeed[]`，支持内联格网与 RegionMap `BattleArena`。
- 完成命中次数、认输推进、重试策略、HP / 连败节拍、控制切换及模板 / 梦境 / 难度整数倍率。
- 序章三战夹具覆盖 61 / 73 / 91 格完整路径；应用双人演示已从 encounter 夹具启动，无新增依赖。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `packages/data/src/schemas/encounter.ts` | 163 | schema、交叉约束、类型 |
| `packages/data/src/{schemas/index,content-index,content-registry}.ts` | 17 / 197 / 107 | 导出、集合与引用检查、类型注册 |
| `packages/core/src/battle/encounter/{builder,index}.ts` | 175 / 348 | Arena 解码、seed 展开、Setup、终局辅助 |
| `packages/core/src/battle/{script/index,types,index}.ts` | 57 / 196 / 14 | 节拍执行、协议字段、导出 |
| `packages/core/src/battle/encounter/{builder,index}.test.ts` | 213 / 240 | 遭遇构建与跨度回归 |
| `packages/core/src/testing/{prologue-encounters,encounter-schema,index}.ts` | 78 / 47 / 4 | 三战夹具、schema / 引用反例、导出 |
| `apps/game/src/battle/{demo,demo-seed}.ts` | 27 / 72 | encounter 驱动双人演示 |
| `packages/core/CLAUDE.md` | 244 | 构建、倍率、脚本、重试所有权 |

## 3. 关键结论与数值

- 内联战场 `2..400` 格；`q/r` 含首尾跨度均 `max-min+1 ≤ 20`。Region Arena 另校验地图、对象、遭遇 ID、完整解码与两侧容量。
- D1：`enemyStatBp = 8500 + 500×1 = 9000`；仅敌方模板单位的气血与内外攻击再乘此倍率。
- `tmpl_normal` 为 HP / 攻 / 防 / MP / 评级 / 速度 `6000/10000/8500/10000/-10/9500` bp；难度模式再独立作用于敌方。
- Boss HP 为 `40000 + 5000×min(6,floor((dreamLevel-1)/10))` bp；所有乘法逐层 `mulBpFloor`。
- 重试沿用 ENG-16c：`deriveRetrySeed(0x12345678,1)=0x48c69a09`；节拍连败数为进入时持久值加本会话最大 retry 序号。
- 相同定义、内容快照、进入上下文与 seed 产出规范 JSON 逐字节相同；core 不读取墙钟、DOM 或 `Math.random`。

## 4. 开放问题（附默认值）

- 正式 NPC / 角色槽 / 模板尚缺完整 `BattleUnitSeed` resolver；默认由宿主在调用构建器前解析招式、经脉与基础属性。
- 内容编译的 `CONTENT_FIELD_REGISTRY` 尚无 encounter 字段分类；默认仅注册 schema / 索引能力，正式内容合入前由 data 所有者补表。
- command/session 尚未消费 `retryAllowed` 与认输命令；默认 UI 隐藏非法入口，handler 接入后再由 core helper 判定。
- 救场只发 `battle/aqingRescue`，投影只切控制且仍为 `offgrid`；默认由动作 / 剧情所有者执行击退、入场和演示动作。
- 跨会话连败清零与持久化仍属宿主；默认同遭遇胜利或离开书界清零，构建时作为 `lossStreak` 输入。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 design/09、chapters/00、design/13 与 ENG-16c 已定协议。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 模块 | 位置 | 需同步 |
|---|---|---|
| data 内容编译 | `build/field-registry.ts` | 登记 encounter 字段类别，使正式 `encounter.v1` 进入内容构建 |
| core 命令总线 | `battle/session.ts`、`command/battle-handler.ts` | retry 前检查策略；实现 concede 命令并结算推进 |
| game runtime | `runtime/content.ts`、`runtime/session.ts` | 加载 encounter / template；消费 `world/battleRequested` 并调用构建器、`battle/enter` |
| 动作 / 剧情 | battle action 与 ch00 runtime | 消费救场事件；让阿青投影入场并执行演示 |
| CONTENT-ch00c | 三场正式内容 | 按本 schema 落 `enc_00_zhulin/baiyuan/biandao`，替换测试夹具 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### `encounter.v1` 字段表

| 字段 | 契约 |
|---|---|
| `schemaVersion/id/chapterId/kind` | 版本、全局遭遇 ID、章节与遭遇种类 |
| `arena` | `regionArena(regionId,sceneId,arenaId)` 或 `inline(topology,anchorId,cells)` |
| `participants[]` | NPC / 角色槽 / 模板+梦境档位、阵营、控制、状态、站位、朝向 |
| `outcome` | 胜 / 负 / 平条件、败北策略、认输策略 |
| `rules` | 切磋、自动 / 撤退 / 道具、留手、杀意、友伤、轮限、Boss、重试、跳过 |
| `beats[]` | HP 阈值 / 连败条件；事件、演示、控制切换 |
| `difficulty` | D 与 `8500+500D`，三档模式固定倍率 |

### 构建器流程

- ✅ schema / 索引先验校验 → 解析内联格网或 BattleArena → 映射参战者 → 宿主 seed resolver 输入 → 模板 / D / 模式展开 → 生成 Setup；全程纯函数。
- ✅ `BattleArena` 接口交 ENG-20a：宿主从 `{anchorId,encounterId}` 取得 RegionMap 快照，传世界流 seed / source hash / scene / anchor，再将结果交 `battle/enter`。
- ⚠️ 正式 resolver 与 runtime 总线接线不在本任务写集，见 §4、§6；测试夹具不冒充生产内容。

### 特殊条件与脚本节拍表

| 能力 | 结果 |
|---|---|
| `hitCount` | ✅ 按伤害事件累计；重试前历史不重复计数 |
| 坚持 2 回合 / 认输 | ✅ 白猿任一达成胜利，`advance` 返回 win |
| HP `<45%` | ✅ 触发一次 `battle/aqingRescue` |
| 连败 3 次 | ✅ 外部连败或同会话三次 retry 触发演示 / 控制切换 |
| retry | ✅ 策略 helper 与 ENG-16c 派生 seed；⚠️ handler 接线待 §6 |

### 模板与倍率公式、测试、下游接口

- ✅ 模板值先乘；敌方 HP / 攻再乘 `enemyStatBp` 与模式 HP / 攻；防、MP、评级、速度仅按各自已定模板 / 模式项，整数逐层向下取整。
- ✅ 三战 61 / 73 / 91 格完整路径、命中 / 回合 / 认输、45%、三连败、D1 字段隔离、确定性、Arena / offgrid / schema 正反例和引用反例均覆盖。
- ✅ CONTENT-ch00c 只需提供三份定义与可解析 source；不可在 encounter 重写 `BattleUnitSeed`。ENG-20a / 宿主按上一小节接口开战。
- ✅ 门禁最终均通过；复跑时两次命中写集外 `main-flow` 的 `HOST_DISPOSED` 收尾竞态（1091 条断言仍全过），原样第三次退出 0；strict IDs 仅报既有 baseline `sk_babuganchan`，新增失败 0。
