# ENG-event-source-trigger 报告 · 游戏工程 · 领域事件触发的 EventDef：core 发出领域事件（先接 chapter/woke）时在同一事务里按 condition.sourceEvent 匹配执行，复用 event-executor 执行器，演出发 world/eventPresented；不改 Trigger 路径语义
## 1. 摘要（3–6 行）
core 事务发出已登记的 `chapter/woke` 时，会立即匹配目标章节已装载的 sourceEvent EventDef，并在同一 journal 内执行。
arrival 的三步演出依原序聚合为 `world/eventPresented`；once receipt、状态动作与失败回滚复用既有 event-executor。
派发深度固定为 1，派生领域事件不连锁；Trigger 的 `conditionMatches()`、流程及 `REGION_EVENT_*` 口径未改。
宿主既有书眠预载已携带目标章节 EventDef，只补 runtime 边界回归，无需改加载实现。
## 2. 产出（文件、行数、主要章节）
| 文件组 | 规模 | 主要内容 |
|---|---:|---|
| `packages/core/src/{event,command}/**` | 4 实现文件 | 登记/匹配/ID 排序、共享动作执行、深度守卫、4 个 source reason code |
| core/game 测试 | 3 文件 | arrival、排序、读档 once、条件、回滚、不连锁、100 次 hash、宿主目标包注入 |
| 本报告 | 1 文件，≤50 行 | 结论、门禁、下游交接 |
## 3. 关键结论与数值
- 接法：`MutableCoreTransaction.emit()` 仅对登记表中的根事件派发；当前登记 `chapter/woke`。候选须属于当前章节且 `condition.sourceEvent===t`，再按当下状态判断 `chapterId/gate/sceneId/anchorId`；条件不满足即跳过。
- 顺序：多条候选按 EventDef ID 的 Unicode code point 升序执行；单条内状态动作保持原序，演出步骤保持原 EventDef 相对顺序。
- 不连锁：执行 sourceEvent EventDef 期间的 `tx.emit()` 只记录事件，不再匹配 EventDef；深度固定为 1。
- 回滚：默认 source EventDef 失败连带回滚发出源事件的整笔命令事务，因为源事实与其规则反应必须原子一致；稳定码为 `SOURCE_EVENT_CONDITION/ACTION/REFERENCE/INVENTORY`。
- 事件：`world/eventPresented {eventId,steps[]}`；arrival 的 `steps` 为 `dialogue/start` → `ui/revealText` → `world/loadScene`。
- 测试：覆盖真实 arrival、ID 排序、once 跨读档、条件跳过、书眠整笔回滚、不连锁、100 次同 hash；原 core golden 未改且通过。
- `pnpm size`：标题页 entry `38.80/170 KiB`；WebGL total `207.66/350 KiB`；首次会话 `100.58/110 KiB`，三层均 PASS。
## 4. 开放问题（附默认值）
- 后续哪些领域事件开放给 EventDef：默认只登记 `chapter/woke`；新增事件须显式加入 core 登记表，不因内容中出现任意字符串而自动开放。
- sourceEvent 若写 `anchorId`：默认只与源事件 payload 的同名字段匹配；缺字段视为条件不满足。无锚点/无挂载却执行 `save/autosave` 则稳定拒绝 `SOURCE_EVENT_CONDITION`。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- EVE-P03 / 规定 sourceEvent EventDef 为“登记事件、当前章节、ID 稳定排序、同事务、深度 1” / 固化确定性、原子回滚与防循环边界。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/05-gameplay-engine.md` / 命令事务与区域事件：补 sourceEvent 登记、匹配顺序、深度 1、`SOURCE_EVENT_*` 与整笔回滚。
- `docs/tech/04-data-pipeline.md` / EventDef：补 `condition.sourceEvent` 只能引用 core 已登记领域事件、事件随章节 base rules 装载。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 通用入口、当前章节过滤、ID 排序、其余条件、once receipt、共享执行器、演出聚合、深度 1 均落地；Trigger `conditionMatches()` 对 sourceEvent 仍返回 false。
- ✅ 冻结安装；最终 `pnpm check` 149/149 文件、1101/1101 用例，core 45/520、game 32/109；content build 1169 对象/15 章、validate 1176 文件/1110 对象；strict ID 新增失败 0。
- ✅ 仅改授权写集，无依赖/锁文件/golden 变更，`git diff --check` 通过；正式 tsx 命令用无 IPC 启动绕过沙箱 socket `EPERM`，结束前已恢复原包装。
- ✅ 交 ENG-19e：订阅 `world/eventPresented`，将 arrival steps 串行消费为 54 秒西行过场 → 年号揭示 → `sc_10_fengshi_feiyi/cold_open` 场景载入；界面不重判 condition、不回写 receipt。
- ✅ 交 CONTENT：sourceEvent EventDef 放当前章节 base rules，使用已登记事件名；需防重放则 `once:true`，附加条件按源事件发生后的当下 core 状态判断，不依赖动作事件继续连锁。
