# ENG-05-story-time 报告 · 游戏工程 · 剧情 DAG 运行时、时间推进与事件锚点

## 1. 摘要（3–6 行）

完成 `StoryLine` 编译与事件驱动 DAG 运行时，覆盖八类节点、四类出边、主支线并行、条件、时限、幂等和存读档。
完成世界时间推进、边界事件、场景分桶事件锚点、NPC 出退场/关系，以及内联和 inkjs 对话适配。
新增天龙路线、超时、支线、恢复与固定哈希测试；本轮补齐 `ratio` 精确 bp 边界回归，三条验收命令均通过。

## 2. 产出（文件、行数、主要章节）

- `packages/core/src/quest/`：15 个文件、1,669 行；条件编译、DAG 编译、最小堆、执行器、窗口、快照与运行时及测试。
- `packages/core/src/{dialogue,event,npc,world}/`：实现及 4 组测试；Ink/内联对话、锚点表、NPC 状态与时间入口。
- `content/story/ch01/side_babuzhong.yaml`：31 行；主线挂接的八部众支线纵切片。
- `packages/core/CLAUDE.md`：新增 28 行下游命令、事件和查询交接；`inkjs@2.4.0` 写入包清单与锁文件。

## 3. 关键结论与数值

- 时间：`10 tick/分钟`、`600 tick/小时`、`1,200 tick/时辰`、`14,400 tick/日`；月 30 日、年 12 月；战斗推进 0 tick。
- 客栈基准 `480×10=4,800 tick`，夜间至少至次日卯时；任务文字“辰时”与权威设计不一致，按后者实现。
- 旅行时辰数为 `ceil(distanceLi×10,000/(speedBp×liPerShichen))`，最少 1；全程安全整数，无中途截断。
- 窗口为 `[open,close)`；时间按最早开/关点分段，到期堆只查队首；条件加载时预编译，`ratio` 以十进制精确换算 bp（`0.0003→3`、`0.75→7500`、`1→10000`），锚点按场景分桶。
- 固定路线快照 SHA-256：`0abe07cfa439b604a0e0585e6a8efbe60ccc051bd67ef74a835cf7e11412cbed`。

## 4. 开放问题（附默认值）

- 客栈终点文字冲突：任务写“次日辰时”，`design/24`、`design/11` 与 ENG-02 均为“夜间至少到次日卯时”；默认保持卯时。
- 存档 schema 尚无 `suspendedWaits/lineWindows` 正式字段；默认由本运行时快照保存，待 ENG-02 升版整合。
- 节气边界为可选项且日历 schema 未定义节气；默认只发时辰/日/月/年。
- Ink loader 由 host 注入编译 JSON；默认不在运行时编译 `.ink`，无 adapter 时快速失败。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- P-ENG05-01：统一客栈睡眠措辞为“夜间至少到次日卯时”；避免任务说明与 `design/24` / ENG-02 实现冲突。
- P-ENG05-02：Story 存档正式登记可嵌套等待栈与线级已解析窗口；保证主线等待时支线可运行且可精确恢复。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/00-canon.md` / 任务模板：采用 P-ENG05-01，统一卯时。
- `packages/data` / ENG-02：把 `suspendedWaits`、`lineWindows` 纳入后续 StoryRuntime 状态 schema/migration。
- ENG-07：以 `snapshot.wait` 渲染对话/任务/选择，只提交运行时方法；Ink 选项 key 为 inkjs 的稳定当前索引字符串。
- ENG-08/09：用 `EventAnchorRegistry.queryScene/query/match` 查地图进入与城镇 NPC/位置锚点，由 host 校验前沿后触发剧情。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 运行时 API：`StoryRuntime.start/activateLine/chooseDialogue/completeDialogue/completeQuest/failQuest/choose/advanceTo/snapshot` 与 `restoreStoryRuntime`；事件含 chapter/cause/receipt。
- ✅ 节点/边：spawn、despawn、dialogue、quest/event、choice、condition、merge、end；condition 优先 auto，choice/timeout 隔离。
- ✅ 时间推进表：客栈、N 时辰打坐、里程/分钟旅行、战斗 0 tick；边界顺序时辰→日→月→年。
- ✅ 锚点注册表：`EventAnchor{id,kind,sceneId,trigger,lineId,nodeId,npcId?|point?|radius?}`；场景 Map 分桶，桶内稳定排序。
- ✅ 样例路线：天龙脚本、480 分钟半开超时、支线挂接/恢复、读档一致、固定哈希均通过。
- ✅ 交下游接口：ENG-07 消费 `snapshot.wait` 并调用运行时命令；ENG-08/09 用 `queryScene/query/match` 检索并触发地图锚点。
- ✅ 幂等与性能：节点/任务收据、重复 start 无伪事件；条件预编译、deadline 最小堆、锚点 O(1) 取场景桶。
- ✅ `pnpm install --frozen-lockfile` 通过；`pnpm check` 32 文件/156 项及性能 2 项、14 份内容校验、构建和体积预算全绿。
- ✅ `python3 tools/lint/check_ids.py --strict` 通过；仅既有 baseline `sk_babuganchan`，新增严格失败 0。
- ✅ 联网核实（2026-10-01）：[npm inkjs](https://www.npmjs.com/package/inkjs) 确认 2.4.0 与浏览器用法；v2.4.0 的 [Story](https://github.com/y-lohse/inkjs/blob/v2.4.0/src/engine/Story.ts) / [StoryState](https://github.com/y-lohse/inkjs/blob/v2.4.0/src/engine/StoryState.ts) 源码确认选择与状态 API。
- ✅ 范围：仅修改授权路径；未改 `packages/core/src/index.ts`、schema、TODO 或设计文档；报告 100 行内。
