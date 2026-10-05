# 24 · 剧情 DAG 状态机与时间模型（Story DAG & Time Model）

> 归属（基准 §18 扩展提案）：剧情编排 DAG、剧情线运行态、剧情节点 / 边 schema、剧情时限与时间推进接口。
> 上游：`docs/00-canon.md` v1.8；作者新增需求 `docs/decisions/author-requirements.md` AR-19；年代与书眠见 `design/02`；主线内容见 `design/story/NN-*`；世界时钟与休整见 `design/11`；任务 DSL 与幂等见 `design/12`；运行时 tick 与日历边界见 `tech/05`。
> 引用而不重定义：任务状态、条件 AST、动作白名单 → `design/12` §§1–2；人物状态与出场资格 → `design/18`；场景与时代图层 → `design/11`；战斗 → `design/09`；物品 → `design/10`；具体正 / 邪剧情事实 → `design/story/NN-*`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档，先给可用数值并在文末登记。
> 版本：v1.0（AR-19 剧情 DAG 与时间模型定稿，2026-10-01）。

---

## 0. 结论先行与范围

1. 每个书界恰有一条 `kind: main` 主线和零至多条 `kind: side` 支线；每条线是独立、有限、无环的事件驱动 DAG。`(chapterId, lineId)` 是剧情线稳定身份，节点 / 边键只在该线内唯一。
2. `story.v1` 只编排“谁在何处出现、播哪段对话、启动哪个任务 / 事件、何时选择与往哪走”；任务内部目标、条件运算符、动作与奖励仍唯一归 `design/12`。
3. 正线 / 邪线不是两份互斥文件，而是同一主线 DAG 中由 `choice` / `condition` 边展开、可按既定代价换线、再于锚点汇合的路径。原著 / 改命是另一条结局轴。
4. Ink 只负责一次对话内部的文句、局部选择与候选 intent；DAG 才能完成人物出退场、任务启停、永久效果、时限和剧情推进。
5. 世界时间唯一权威仍是 `worldTick`。换算固定为 `10 tick/游戏分钟`、`600 tick/游戏小时`、`1,200 tick/时辰`、`14,400 tick/日`；战斗 tick 不折算世界时间。
6. 草案契约为 [`story/schema.yaml`](story/schema.yaml)，天龙主线迁移样例为 [`story/examples/01-tianlong-main.yaml`](story/examples/01-tianlong-main.yaml)；二者供后续工程实现，当前不是 `tech/04` 所称的生产 Zod 权威源。

### 0.1 唯一归属边界

| 概念 | 唯一归属 | 本文职责 |
|---|---|---|
| 十四书具体剧情、人物命运、正邪选择 | `design/story/NN-*` | 定义通用编排结构与迁移规则 |
| 任务生命周期、ConditionExpr、Action | `design/12` | 只引用 `q_*` 或内联白名单事件 |
| 日历换算、休息、打坐、旅行 | `design/11` | 汇总剧情消费字段与触发检查时机 |
| `GameState`、事务、世界边界事件 | `tech/05` | 规定剧情投影与幂等消费契约 |
| Ink 文本与对话内局部分支 | `tech/04` / 对话源 | 定义 DAG 与 Ink 的提交边界 |
| `story.v1` Zod / JSON Schema 生产实现 | 后续 `ENG-02` | 提供字段清单、YAML 草案和校验夹具 |

### 0.2 三层状态机

```text
StoryLine DAG（书界主线 / 支线编排）
  └─ quest 节点引用 QuestDef（任务阶段与目标）
       └─ dialogue 节点或任务动作启动 Ink（一次会话内文本分支）
```

上层只消费下层的稳定完成事件，不窥探临时 UI 状态。`quest` 节点等 `quest/succeeded`、`quest/failed` 或内容声明的合法完成事件；`dialogue` 节点等 Ink 桥接层提交 `dialogue/completed`。同一事务先提交下层结果，再推进 DAG；任一步失败全部回滚。

---

## 1. `StoryLine` 与图不变量

### 1.1 剧情线身份与文件布局

规范内容路径为 `content/story/<chNN>/<line_id>.yaml`，例如 `content/story/ch01/main.yaml`、`content/story/ch01/side_babuzhong.yaml`。这是 AR-19 专项约定；与 `tech/04` 现行 `content/chapters/chNN_*/` 总目录的最终归并交协调者和 `ENG-02` 处理，不在本任务越权改写 `tech/04`。

| 字段 | 类型 / 范围 | 规则 |
|---|---|---|
| `schemaVersion` | 常量 `story.v1` | 未知版本拒绝，不静默兼容 |
| `chapterId` | 已登记 `ch00_*`～`ch14_*`，终局可 `ch15_guimeng` | 与文件目录及 `eraLayer` 对齐 |
| `lineId` | `main` 或 `side_<语义>` | 章内局部稳定键；不是新的全局 ID 前缀 |
| `kind` | `main | side` | 每书界主线恰一条；支线可多条 |
| `titleKey` | 非空本地化键 | 规则层不保存中文标题 |
| `eraLayer` | `chNN` | 读取该书界时代合成层 |
| `startNodeId` | 本线 `nodes[].id` | 必须等于图中唯一入度为 0 的节点 |
| `trigger` | `condition? + timeWindow?` | 两者都存在时为 AND；条件语法只读 `design/12` §2.2 |
| `sideHooks` | 主线可选数组 | 声明支线挂接；支线自身不得再定义主线 |
| `nodes` / `edges` | 非空数组 | ID 唯一、引用闭合、全图无环 |
| `source` | 来源与标注 | 至少记录剧情稿锚点；原创内容显式标注 |

同一书界的多个 YAML 各自校验无环；跨线只允许读取“另一线某节点已完成”这一持久事实，不创建跨文件边。这样卸载、禁用或延期一条支线不会破坏主线拓扑。

### 1.2 起点、可达与结束

- 把所有 `edges[].from/to` 计入入度后，恰有一个节点入度为 0；它必须是 `startNodeId`。
- 所有节点必须从起点可达。`end` 节点出度必须为 0；非 `end` 节点至少一条出边。
- 一条线可有多个 `end`，表示不同线内结局；每个结束节点至少一个非空 `endingTags[]`。主线结束标签只描述本线结果，不擅建归 `design/13` 所有的 `end_*`。
- 边目标只在本线解析。跨线依赖写入条件 `storyNode`，形如 `{storyNode: {lineId: side_babuzhong, nodeId: n_resolved, state: completed}}`。

### 1.3 DAG 与超时边

将 `auto / condition / choice / timeout` 四类边全部纳入拓扑排序；任一回边、自环或由超时边造成的环都阻断构建。“超时边”只是普通完成 / 条件 / 选择之外的第四种触发写法，不是无环豁免：

```yaml
timeWindow:
  mode: relative
  anchor: { event: story/nodeCompleted, nodeId: n_shaoshi_done }
  opensAfterMinutes: 0
  closesAfterMinutes: 2880
  onMiss: { policy: alternate, targetNodeId: n_mantuo_late }
edges:
  - { id: e_mantuo_done, from: n_mantuo, to: n_finale_gate, trigger: auto }
  - { id: e_mantuo_timeout, from: n_mantuo, to: n_mantuo_late, trigger: timeout }
```

`trigger: timeout` 仅可从 `timeWindow.onMiss.policy: alternate` 的节点发出，且恰有一条，目标须等于 `targetNodeId`。`expire` 直接把节点 / 支线置为失效，`defer` 按 `deferByMinutes` 延后一次窗口；主线不得因 `expire` 永久锁档，必须用 `alternate` 接回可通关路径。

---

## 2. `StoryNode`：八类剧情步骤

### 2.1 公共字段

| 字段 | 类型 / 范围 | 规则 |
|---|---|---|
| `id` | `n_<语义>` | 本线内唯一、发布后不换义；不是全局 ID |
| `type` | 下表八类之一 | payload 必须与类型匹配，未知字段拒绝 |
| `titleKey` | 非空字符串 | 日志 / 调试可读标题键 |
| `completeOn` | 稳定事件或 `immediate` | 不允许以动画结束、按钮重绘等表现信号推进 |
| `timeWindow` | `TimeWindow`，可选 | 限制本节点激活或完成；见 §5 |
| `once` | 布尔，默认 `true` | `true` 时完成收据阻止重放副作用 |
| `payload` | 按类型判别的严格对象 | ID 引用在构建期解析 |
| `sourceRef` | 文档锚点 | 如 `design/story/01 §3.2 Z03` |

### 2.2 节点类型表

| `type` | 必填 payload | 完成语义与限制 |
|---|---|---|
| `spawn` | `npcId, sceneId, anchor, eraLayer` | 在场景实体事务中生成 / 恢复人物；`anchor` 为场景局部坐标锚点，不是 `poi_*` |
| `despawn` | `npcId, sceneId, anchor, eraLayer, reason` | 从指定场景锚点移除当前投影；除非人物域动作明确确认死亡，不得把退场写成 `dead` |
| `dialogue` | `ink: {storyId,knot}` 或 `inlineLines[]` 二选一 | Ink knot 完成或内联逐句确认后发稳定事件；生产剧情优先 Ink |
| `quest` | `questId` 或 `inlineEvent` 二选一 | `q_*` 等稳定任务结果；内联事件只执行 §2.3 白名单动作，原子提交后 `immediate` 完成 |
| `choice` | `decisionId, options[]` | `decisionId` 复用 `dc_*`；每个 `option.key` 稳定且由 `choice` 边消费 |
| `condition` | `expression` | 无副作用，只复用 `design/12` §2.2；边按优先级选首个成立项 |
| `merge` | `mergeKey` | 纯汇合 / 分支路由节点，`completeOn: immediate`；可有多入边和多出边 |
| `end` | `endingTags[]` | 本线终态；无出边，不直接执行奖励 |

“人物出现 / 消失”描述的是当前时代图层、当前场景中的呈现状态。节点执行前仍由 `design/18` 校验人物存活、年龄投影与可出现性；不合法不是静默跳过，而是内容错误或显式替代边。

### 2.3 内联事件与原子效果

`quest` 节点优先引用正式 `q_*`。只有不足以形成独立任务的单步剧情事件才用：

```yaml
inlineEvent:
  eventKey: yanmen_resolution
  actions:
    - { id: fx_mark, op: flag/set, flagId: fl_01_a5_resolved }
    - { id: fx_book, op: reward/item, itemId: it_tianshu_01, count: 1 }
```

动作必须来自 `design/12` §2.3，逐项带稳定局部 `id`。运行时效果键为 `<chapterId>/<lineId>/<nodeId>/<effectLocalId>`；动作、完成收据与 outbox 事件同事务提交。样例为了不新增未登记旗标，仅以内联 `event/emit` 演示结局通知。

### 2.4 `spawn` / `despawn` 坐标锚点

```yaml
payload:
  npcId: npc_xiaofeng
  sceneId: sc_01_juxianzhuang
  anchor: courtyard_gate
  eraLayer: ch01
```

`anchor` 在对应 `sc_*` 场景内解析，允许地图制作调整六角坐标而不改剧情节点。若同一 NPC 已在同场景同锚点，`spawn` 幂等成功；在别处时必须由领域规则迁移或报冲突，不能复制人物。`despawn` 重放时人物已不在场也幂等成功。

---

## 3. `StoryEdge` 与确定性求值

| 字段 | 类型 / 范围 | 规则 |
|---|---|---|
| `id` | `e_<语义>` | 本线内唯一、稳定 |
| `from` / `to` | 本线节点 ID | 引用必须存在；禁止自环 |
| `trigger` | `auto | condition | choice | timeout` | 决定额外字段 |
| `condition` | `ConditionExpr` | `condition` 边必填，其余边禁止 |
| `choiceKey` | 当前 `choice.options[].key` | `choice` 边必填且同源选项一一对应 |
| `priority` | `0..1000` 整数 | 同事件候选按降序，再按 edge ID ASCII 排序 |

节点完成后只评估该节点出边的同一只读快照：

1. 若收到合法玩家选择，只考虑匹配的 `choice` 边，再重验该选项 `when`；提交 `choiceKey` 与选中的 edge ID，后续条件可读 `branchPath`，不得另造路线旗标。
2. 若到达关闭边界，只考虑 `timeout` 边；时限事件先于同刻玩家新输入。
3. 其余情况下依次评估 `condition`，最后允许至多一个无条件 `auto` 兜底；若全部 `condition` 在同一有限枚举上两两互斥且覆盖全集，可省略 `auto`。
4. 首个命中边与目标节点、`branchPath`、节点完成收据在一个事务内提交；没有命中且节点非等待态时为内容错误。

`choice` 节点每个选项恰有一条同 `choiceKey` 出边；`condition` / `merge` 多出边若不能由生产 schema 静态证明互斥且穷尽，必须有 `auto` 兜底。草案检查器只把“全部出边都是 condition”当作待 ENG-02 深检的候选穷尽形态，不证明条件逻辑本身。同优先级条件允许，但最终以 edge ID 全序保证确定性；内容评审应避免依赖该兜底顺序表达业务优先级。

---

## 4. 主线、支线与正邪路径

### 4.1 一主多支

- 每个 `chapterId` 恰有一份 `lineId: main`；支线为 `side_<语义>`，各自拥有起点、时间窗、节点状态与结局。
- 主线用 `sideHooks[]` 暴露挂接点：`atNodeId` 完成后，若 `lineId` 的 `when` 成立则把该支线从 `locked` 变为 `available`。挂接只解锁，不直接替支线完成节点。
- 支线可用 `storyNode` 条件读取主线 / 其他支线的 `completed` 状态；主线也可读取支线，但必须保留不依赖可错过支线的通关出口。
- 禁止跨线 `to:`，也禁止 A 线等 B、B 线又等 A 的强制互锁。`ENG-02` 应在多线引用图上另做循环依赖检查。

### 4.2 正 / 邪线在同一 DAG 中表达

`design/story/NN-*` 的共有、正、邪任务都保留原 `q_<NN>_main_<c|z|x>_<nn>`。在主线 DAG 中：共有段串接到 `dc_*` 选择节点；`choice` 边进入正 / 邪任务节点；后续换线仍由下一 `dc_*` 选择边完成；同一锚点两路执行后进入一个 `merge`，再继续。

因此“正 / 邪”是 `branchPath` 与任务结果的组合，不复制 `StoryLine`，也不从最终 `morality` 反推。天龙样例保留 4 个共有任务、正 / 邪各 10 个任务和 9 个既有 `dc_*`，并用汇合节点表达 A3 / A5 等共同历史。

### 4.3 支线挂接例

```yaml
sideHooks:
  - lineId: side_babuzhong
    atNodeId: n_xingzilin_merge
    when: { npc: { id: npc_duanyu, state: alive } }
```

挂接事件的幂等键为 `<chapterId>/<mainLineId>/<atNodeId>/unlock/<sideLineId>`。支线文件不存在、起点不唯一或触发条件引用无效均阻断发布；开发期可用 `optional: true` 明确排除尚未装入的 DLC，但主线不得读取该可选线的完成状态。

---

## 5. `TimeWindow` 与当前时间

### 5.1 时间字段表

世界时间不另建第二时钟。存档权威字段和可重算投影如下：

| 字段 | 类型 / 范围 | 权威性 / 算式 |
|---|---|---|
| `epochId` | 非空稳定键 | 当前书界纪元；书眠切书时重建 |
| `calendarSpecId` | 非空稳定键 | 日历规格；默认规格见 `tech/05` §5.3 **【建议值】** |
| `epochYear` | 整数 | `design/02` 的本书界定年起点；天龙约 1093 **（待考）** |
| `worldTick` / `elapsedTicks` | `0..2^53-1` 安全整数 | 两者始终相等，是当前时代层内唯一权威游玩时间 |
| `gameMinute` | 非负整数投影 | `floor(worldTick / 10)` |
| `dayIndex` | 非负整数投影 | `floor(gameMinute / 1440)` |
| `minuteOfDay` | `0..1439` 投影 | `gameMinute mod 1440` |
| `year` | 整数投影 | `epochYear + yearOffset` |
| `month` / `day` | `1..12` / `1..30` 投影 | 默认 30 日/月、12 月/年 **【建议值】**；不声称历史历法 |
| `hour` / `minute` | `0..23` / `0..59` 投影 | 从 `minuteOfDay` 求得 |
| `shichen` | 子丑寅卯辰巳午未申酉戌亥 | 23:00 起的映射逐字引用 `design/11` §6.2 |
| `slotInDay` | `0..11` | 时辰索引缓存；须与投影一致 |

UI 可显示“年月日 + 时辰”，规则与存档比较只用同一 `epochId` 下的整数分钟 / tick。未经考据的月日不得写成原著事实；剧情稿只知道年份时，用相对窗口，不伪造精确日期。

### 5.2 推进方式与换算

| 来源 | 世界时间增量 | 剧情约束 |
|---|---:|---|
| 探索 / 区域移动 | 每逻辑 tick 推进 1 world tick | 10 Hz；后台、暂停、对话不补跑 |
| 客栈完整休息 | 1 夜基准 480 游戏分钟 = `480×10=4,800 tick` | 夜间入住至少休到下一卯时，故实际增量为 `max(480, 至下个卯时分钟差)`；恢复 / 减益只见 `design/11` §9 |
| 普通打坐 | 60 游戏分钟 = `60×10=600 tick` | 安全点；恢复规则只见 `design/11` §9.2 |
| 冲穴打坐 / 练功 | 每 session 60 游戏分钟 = 600 tick | 不叠加普通打坐恢复；每小时重检事件，见 `design/15` §5 |
| 大地图旅行 | `ceilToHalfShichen(routeMinutes×修正)` | 逐路段推进，公式与天气修正只见 `design/11` §7 |
| 剧情蒙太奇 | 节点显式 `advanceMinutes` | 不得用现实墙钟或含糊“若干日” |
| 战斗 | 0 world tick | `battle.tick` 独立；结束后若剧情确需耗时，另发显式世界时间命令 |

“战斗 tick 换算”为**不换算**：战斗时冻结开战的世界时辰 / 天气，任何战斗回合数都不会暗中消耗世界分钟。这与 `tech/05` §3.3、§5.2 一致，也避免不同动画速度改变剧情时限。

### 5.3 窗口形态

`TimeWindow` 两种模式互斥：

- `absolute`：同一 `epochId` 内给 `opensAt` 与 `closesAt`，日期结构均含 `year/month/day/hour/minute`；区间为 `[opensAt, closesAt)`。
- `relative`：给稳定 `anchor`、`opensAfterMinutes >= 0`、`closesAfterMinutes > opensAfterMinutes`；激活时解析为绝对 `opensAtMinute / closesAtMinute` 并随实例存档。

`anchor.event` 只允许稳定领域事件；节点锚点使用 `story/nodeCompleted + nodeId`，任务锚点使用 `quest/accepted` 等已登记事件。窗口可放在线的 `trigger` 或单个节点；二者并存时取交集，若交集为空则构建失败。

错过策略：

| `policy` | 结果 | 使用边界 |
|---|---|---|
| `expire` | 线 / 节点记 `expired`，不再进入 | 只用于可错过支线或非关键节点 |
| `defer` | 增加 `deferByMinutes` 并重排一次 | 至少声明正整数与最大延期次数 **【建议值：1】** |
| `alternate` | 走唯一 `timeout` 边到替代节点 | 主线时限的默认且强制安全写法 |

### 5.4 检查时机与同刻顺序

时限在四个时点检查：线索解锁时、节点即将激活时、每次 `world/timeAdvanced` 的分段边界、读档 / 内容迁移后重建索引时。批量休息、打坐和旅行必须在最早 `opensAt / closesAt` 切段，不能先跳到终点再倒推。

在精确的 `closesAt` 时刻，半开区间已经关闭：日历 / Buff / 经济边界先按 `tech/05` §5.3 结算，再发布时间推进事件，剧情按 `lineId + nodeId` ASCII 顺序处理到期，最后才接受该时刻的新玩家输入。已经在截止前原子提交的节点完成不被超时回滚。

---

## 6. 运行态、存档与幂等

### 6.1 最小持久状态

```yaml
storyState:
  chapterId: ch01_tianlong
  lines:
    - lineId: main
      status: active
      activeNodeIds: [n_c01_task]
      completedNodeIds: [n_wake, n_duanyu_spawn, n_wake_dialogue]
      expiredNodeIds: []
      chosenOptions: {}
      branchPath: [e_wake_spawn, e_spawn_dialogue, e_dialogue_c01]
      resolvedWindows: {}
      appliedEffectIds: []
      revision: 3
```

`status` 为 `locked / available / active / completed / expired`。当前 v1 的运行器一次只提交一个前沿节点，但 `activeNodeIds` 用数组保留未来并行前沿能力；数组按节点 ID 排序。节点定义、标题和 payload 不复制进存档，只保存稳定 ID、选择、解析后的期限、效果收据和 revision。

### 6.2 稳定事件

| 事件 | 最小载荷 | 语义 |
|---|---|---|
| `story/lineAvailable` | `chapterId,lineId,causeId` | 线触发条件首次成立 |
| `story/nodeEntered` | `chapterId,lineId,nodeId,visitOrdinal` | 节点成为当前前沿 |
| `story/nodeCompleted` | `chapterId,lineId,nodeId,receiptId` | 节点持久完成；跨线条件唯一读取对象 |
| `story/choiceCommitted` | `chapterId,lineId,nodeId,choiceKey` | 选择已在事务中确认 |
| `story/nodeExpired` | `chapterId,lineId,nodeId,policy` | 时间窗关闭并执行错过策略 |
| `story/lineCompleted` | `chapterId,lineId,endingTags` | 到达 `end` 节点 |

事件 `causeId` 沿用 `tech/05` 的因果链；剧情推进消费事件后写 outbox。重放同一 `receiptId` 不得二次 spawn、发物品、启动战斗、扣除选择代价或增加 `visitOrdinal`。
任务效果的 `effectId`、事务提交与重复消费口径直接引用 `design/12` §1.5；Story DAG 只在其外层追加节点完成收据，不另造第二套幂等规则。

### 6.3 存读档与内容升级

- 保存前断言当前节点、已完成节点、边路径都存在于锁定的 `contentHash`；加载按 `tech/05` §14 顺序先迁移再校验。
- 删除 / 政名已发布节点须写 story 专用显式 remap；未知旧节点不猜最近名字，保留原档并回到登记恢复节点。
- DAG 更新不得把已完成历史变成环，不得让旧档当前节点失去通关出口；结构变化必须提升 schema 或内容 revision，并补迁移 golden。
- 书眠先结算本书界到期线，写历史摘要，再卸载所有 chapter-bound 运行态；跨书只保留明确归属的书契、生命轴与完成摘要。

---

## 7. Ink、任务与剧情编排分工

| 能力 | Story DAG | `quest.v1` | Ink |
|---|---:|---:|---:|
| 人物出现 / 消失、场景锚点 | 唯一负责 | 可发受控意图 | 否 |
| 跨任务剧情前进与正邪路线 | 唯一负责 | 返回完成事件 | 只展示选择 |
| 任务阶段、目标、奖励 | 引用 | 唯一负责 | 输出候选 intent |
| 对话文本、句内跳转、条件台词 | 启动 knot | 可启动 | 唯一负责 |
| 永久状态写入 | 编排原子事件 | 白名单动作 | 禁止直接写 |
| 时间窗与错过路径 | 唯一负责线 / 节点窗口 | 负责任务阶段 deadline | 不读取墙钟推进 |

一个 `dialogue` 节点启动 Ink 时冻结 `chapterId/lineId/nodeId/visitOrdinal`。Ink 标签只能产生 `design/12` §2.5 的候选 intent；core 重验当前节点授权后提交。Ink 内部回到旧 knot 不等于 DAG 回边，DAG 只在整段对话完成后前进，因此仍保持无环。

---

## 8. 十四篇剧情草稿迁移契约

后续 `STORY-chNN` 任务逐章执行以下步骤，不直接把 Markdown 或现有 `story-draft-v1` 装入运行时：

1. **冻结来源**：登记 `chapterId`、草稿 commit / 文档锚点、共有 / 正 / 邪任务 ID、`dc_*`、锚点和已有待考标注。
2. **建线清单**：建立恰一条 `main`；把章节支线拆为独立 `side_*`，记录主线挂接点与是否可错过。
3. **原子拆节点**：每一项人物出场 / 退场、对话、任务 / 事件、选择、条件门和结局各落一个节点；不得把整幕塞进单个“万能脚本”节点。
4. **映射稳定 ID**：`q_*`、`dc_*`、`npc_*`、`sc_*` 复用现有登记；局部节点 / 边用 `n_* / e_*`，只在父线唯一。未登记具名人物先用已定义角色槽或列入 `unmapped`，不得擅建 ID。
5. **展开正邪路径**：共有段后以 `choice` / `condition` 分流；正 / 邪任务节点保留带路线码 ID；每个历史锚点只完成一次，并以 `merge` 汇合。
6. **落时间窗**：把“几次长休”“某时辰前”等换算成分钟窗口；无可信年月日时使用相对窗口。主线每个窗口都给 `alternate` 超时边。
7. **绑定任务与 Ink**：任务节点只引用 `quest.v1`；对话节点引用 Ink knot；内联事件逐动作映射白名单并生成稳定 effect ID。
8. **声明跨线条件**：支线只通过 `sideHooks` 解锁；跨线只读 `storyNode completed`，不画跨线边，检查无强制互锁。
9. **校验与路径回放**：运行 schema、引用、单起点、可达、无环、choice 覆盖、timeout 一致性检查；回放至少正原著、正改命、邪原著、邪改命和每个超时兜底。
10. **提交迁移 manifest**：在 `design/12` §2.6 既有字段之外增加 `storyLineMappings[] / nodeMappings[] / timeWindowMappings[] / sideHookMappings[]`；`unmapped[]` 在发布时为空，迁移只改表达、不改剧情结论。

天龙样例以 `design/story/01` §0.3、§3、§4 为来源，保留 24 个正式任务 ID 和 9 个 `dc_*`，但为控制样例体量只演示关键人物出退场 / 对话节点；后续量产必须按第 3 步把每幕所有正式步骤拆全。

---

## 9. schema 草案与 ENG-02 交接

[`story/schema.yaml`](story/schema.yaml) 是 JSON-compatible YAML 写成的结构契约清单，不是假冒可直接执行的 JSON Schema。`ENG-02` 至少生成并冻结：

1. `StoryLineSchema`：strict root、主 / 支线判别、trigger、sideHooks、节点与边；
2. `StoryNodeSchema`：八类 discriminated union 及各 payload；
3. `StoryEdgeSchema`：四类 trigger、ConditionExpr 引用、priority；
4. `TimeWindowSchema`：absolute / relative 判别联合、半开区间、三种 `onMiss`；
5. `StoryLineStateSchema`：状态、前沿、完成 / 过期集合、选择、branchPath、resolvedWindows、收据和 revision；
6. `StoryEventSchema`：§6.2 六个稳定事件及因果 / 幂等字段；
7. `StoryMigrationManifestSchema`：草稿来源到 line / node / window / hook 的显式映射；
8. 编译期跨对象检查：全局引用注册、每章恰一主线、支线存在、多线依赖无强制环、路径 / chapter 一致。

Python 草案检查器只覆盖 YAML 形状的一部分、图与仓库名录引用，不替代 Zod strict schema、ConditionExpr 类型检查或运行时事务 golden。

---

## 10. 本文新增术语与 ID

| 术语 / 约定 | 定义 |
|---|---|
| `StoryLine` | 一个书界内独立的主线或支线 DAG |
| `StoryNode` | DAG 中一个可持久完成的原子剧情步骤 |
| `StoryEdge` | 节点间由自动、条件、选择或超时触发的有向边 |
| `TimeWindow` | 同一游戏纪元中的绝对或相对半开触发窗口 |
| `story.v1` | 本文 schema 草案版本；待 `ENG-02` 实现为生产契约 |
| `main` / `side_<语义>` | 章内剧情线局部键，不属于全局内容 ID |
| `n_* / e_*` | 线内节点 / 边局部键，不进入基准 §12 全局注册表 |

本文不新增 `npc_*`、`q_*`、`sc_*`、`it_*` 或其他全局内容 ID。样例只复用天龙现有登记。

---

## 11. 数据校验规则与测试用例

| 编号 | 强校验 |
|---|---|
| SD-V01 | 根版本为 `story.v1`；章、线、时代层与路径一致；未知关键字段由生产 schema 拒绝 |
| SD-V02 | node / edge ID 父线内唯一；边端点存在；起点恰一且等于 `startNodeId` |
| SD-V03 | 所有节点从起点可达；`end` 无出边且有标签；其他节点有出边 |
| SD-V04 | 包括 timeout 在内的全边集无自环、无环 |
| SD-V05 | `npc_* / q_* / sc_*` 在各自名录中存在；spawn / despawn 的时代层等于剧情线 |
| SD-V06 | choice 选项与 choice 边键一一对应；condition / merge 有确定性兜底 |
| SD-V07 | 时间为合法日期 / 分钟；绝对与相对窗口互斥；开点严格早于关点 |
| SD-V08 | `alternate` 恰有匹配 timeout 边；`expire/defer` 无 timeout 边；主线不得 expire |
| SD-V09 | 每书界恰一主线；跨线只读完成态且强制依赖图无环 |
| SD-V10 | 节点效果、选择、出退场和完成事件可用稳定收据重复执行而无重复副作用 |

仓库草案检查：

```bash
python3 tools/lint/check_story_dag.py docs/design/story/examples/01-tianlong-main.yaml
python3 -m unittest -v tools.lint.test_check_story_dag
```

测试至少覆盖：合法多分支样例、双起点、回边、悬空边、不可达节点、重复 ID、非法 NPC / 任务 / 场景引用、坏日期、相对窗口逆序、alternate 无超时边、choice 缺边及 end 带出边。

---

## 12. 待决事项 / 依赖

### 12.1 替下游给出的建议值

- 日历默认 30 日/月、12 月/年、无闰月，沿用 `tech/05` §5.3 **【建议值】**；经营月仍固定 30 游戏日，不反向依赖显示历法。
- `defer` 默认最多延期 1 次 **【建议值】**；`ENG-02` 将 `maxDefers` 限为 `1..9`，缺省 1。
- 同源条件边允许相同 priority，最终用 edge ID ASCII 全序；内容作者默认显式给不同 priority **【建议值】**。

### 12.2 本文依赖的上游事实

- `design/11` §6.1、§9：世界 tick、时辰、旅行、打坐与客栈休息。
- `design/12` §§1.5、2.2–2.6：幂等、条件 AST、动作、Ink 与十四篇任务迁移。
- `tech/05` §§3、5、14：状态、事务、边界事件与存读档。

### 12.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| P-SD-01 | 基准 §18 增列 `design/24` 为剧情 DAG、剧情时间窗和剧情线运行态唯一归属 | AR-19 新增概念尚未进入现行归属表；避免 `design/12` 与 `tech/05` 各自重定义 |
| P-SD-02 | 基准 §12 说明 `lineId`、`n_*`、`e_*` 为父剧情线内局部键，不新增全局前缀 | 防止局部图键污染全局内容注册表 |

### 12.4 原著考据待办

- 本文不新增原著事实。天龙样例沿用 `design/story/01` 的约 1093–1094 与已有 **（待考）** 标注；不得把样例的相对分钟窗口解释为小说精确日程。

### 12.5 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| O-SD-01 | `content/story/<chNN>/` 是否并入 `tech/04` 的 `content/chapters/chNN_*/story/`？ | 先按作者任务指定路径；协调者 / `ENG-02` 统一后只保留一个物理入口并提供路径 remap |
| O-SD-02 | 战斗是否应消耗世界时间？ | 不消耗；战后需要耗时由剧情 / 休整显式推进，变更需同步 `design/11`、`tech/05` 并升协议 |
| O-SD-03 | v1 是否允许真正并行的多个 active 节点？ | 状态保留数组，运行器 v1 单前沿；未来开放并行时升 rules protocol 并补确定性合流规则 |
| O-SD-04 | `defer` 最大次数是否全局统一？ | 缺省 1，节点可在 schema 上限 9 内显式填写；主线优先使用 `alternate` |
