# ENG-town2-dialogue-facility 报告 · 城镇探索 v2 · core 设施对话（对话上下文、facility/openShop 呈现步、interlocutor、v1 town/interact 改走设施对话）
## 1. 摘要（3–6 行）
- 已实现设施绑定查表、共享 Ink 启动事务、严格六字段设施上下文与 `dialogue/started.context`。
- 条件绑定复用 `regionRuntimeForState()` 合入背包、任务与规则事实；schema 允许条件分支加一条兜底。
- `interlocutor` 只读启动时固化的 authored 名字键；`facility/openShop` 归一为类型安全的 `shop/open`。
- v1 仅在设施建筑 `inside` 时进入设施对话；对话中五类城镇命令统一 busy。
- 会话层现随设施交互的启动 / 完成事件增量返回对话投影，避免 core 已暂停而界面未显示的软锁。
## 2. 产出（文件、行数、主要章节）
- 新增：`dialogue/facility.ts`（67 行）、`command/facility-dialogue.test.ts`（203 行）。
- core：修改 `dialogue/**`、`event/{index,event-executor}.ts`、`command/{story-handlers,handlers}.ts`、`world/town-runtime.ts`、`state/models.ts` 及测试；对话投影携带设施 context。
- data / app：修改设施 schema / 测试、`runtime/{content,session}.ts` / 测试、`flow/event-presentation.ts` / 测试。
- `pnpm install --frozen-lockfile`、core lint 通过；core test 55 文件 / 599 例通过。
- 定向 `session.test.ts` 1 文件 / 19 例通过；覆盖 dispatch 增量投影及结束清空。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check` 全绿：239 文件 / 1973 例，内容、故事编译、构建与尺寸门均通过。
## 3. 关键结论与数值
- 上下文：`{kind:'facility',sceneId,facilityKey,roleKey,shopKey:string|null,interlocutorNameKey}`；严格恰好六字段，名字来自设施 authored `nameKey`。
- 查表键：章节 / `common`、`kind`、`sub?`、`roleKey`；顺序为精确子类条件（原序首中）→精确兜底→大类条件→大类兜底。
- 同键允许条件深比较互异的多条分支和至多一条无条件兜底；GateFacts 与既有区域事件路径同源。
- 启动恰调用一次 `tx.rng('world').nextU32()`；店键默认 `<layoutKey>/<facilityKey>`。
- `PresentationStep` 新形状 `{op:'shop/open',shopKey}` 位于 `world/eventPresented.payload.steps[]`。
- 内部错误：`FACILITY_DIALOGUE_MISSING`、`DIALOGUE_INTERLOCUTOR_CONTEXT`；空店 / 非设施 openShop 为 `DIALOGUE_INTENT_REFERENCE`。
- 与 tech/15 §4.5 一致；无新增依赖，无外部版本 / API / 价格事实需联网核实。
## 4. 开放问题（附默认值）
- v1 无 NPC 参数交互默认取设施 `roles[0]`；v2 默认由具体设施 NPC 的 `roleKey` 指定。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现 tech/15 §4.5 与 AR-114。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `runtime/session.test.ts`：旧直开店断言改为公开 dispatch；直接断言启动增量含六字段 context、interlocutor，并模拟控制器浅合并；结束增量为 null。
- `world/town-runtime.test.ts`：补 outside / fading-in / fading-out、未加载 / 未映射设施拒绝。
- `command/handlers.test.ts`：补启动 / 单次 RNG / 缺绑定内容错误 / 无设施干净拒绝 / 五类 busy。
- `state.test.ts`：五字段拒绝、六字段通过；`shop-facility.test.ts`：双兜底 / 重复条件拒绝、条件加兜底通过。
- `flow/event-presentation.test.ts`：合法 `shop/open` 放行、空键拒绝；存档仍拒 `DIALOGUE_SAVE_UNAVAILABLE`。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 条件命中 / 未命中回落 / 多条命中原序 / 精确子类优先，夹具均先经 `FacilityDialogueSchema`。
- ✅ 启动上下文 / 事件 / 单次 RNG、authored interlocutor 名字、缺上下文 / 名字内部错误均覆盖。
- ✅ openShop 正常 / null / 无上下文 / receipt 防重与回滚覆盖；core 到 app 全程强类型。
- ✅ v1 设施对话替代旧事件；仅 inside 可启动；街上旧拒绝；对话 busy，结束后恢复。
- ✅ 公开 `town/interact` 预载对话投影；启动 / 完成事件或空值切换均写 `changes.dialogue`，控制器浅合并测试覆盖软锁回归。
- ✅ 安装、core lint / test、定向 session 测试、全仓 `pnpm check` 与 `git diff --check` 均通过；全仓 239 文件 / 1973 例。
- 交接 shop-wire：消费 `world/eventPresented.payload.steps[]` 中 `op === 'shop/open'` 的步；店员名读 `dialogue.interlocutor.nameKey`；content-plugin 仍须把两类设施内容打进 `GameContent`。
- 交接 explore-facility：距离 / LOS 后调用 `startFacilityDialogue(tx,{sceneId,facilityKey,roleKey})`，勿复制查表、RNG 或事件逻辑。
