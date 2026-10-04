# ENG-ink-intents 报告 · 游戏工程 · Ink 标签动作（DialogueIntent）真正执行：对话推进时解码 #ts: 标签，经共享动作执行器在当下快照重验后落到 core 状态；一次性、确定性
## 1. 摘要（3–6 行）
Ink 正文行在推进、选项标签在确认选择时，经 data 单文件纯边界的共源 `OPCODES` / `decodeInkAction` 解码为 `DialogueIntent`。
intent 在同一对话 command 事务中按源序重验并提交；库存、任务、引用或战斗状态失败会回滚 Ink 游标、RNG、状态与事件。
持久 receipt 与 Ink 单调访问序号保证同标签一次性、读档不重复；四个 EXTERNAL 只读当下快照。
game 内容加载器现会装载 QuestDef 与编译 Ink；挪基点后的 region bindings 同时保留。
## 2. 产出（文件、行数、主要章节）
| 文件组 | 文件数 / 变更 | 主要内容 |
|---|---:|---|
| `packages/data/src/build/ink.ts` | 1 / +22−2 | 导出共源 OPCODES，严格解码为 EventAction |
| `packages/core/src/{dialogue,command,event}/**` | 9 / +621−75 | intent/receipt、EXTERNAL、事务提交、共享执行器、任务推进、测试 |
| `apps/game/src/runtime/**` | 4 / +81−8 | 分页规则/章内物品/Quest/Ink/region bindings 加载、core 转发与投影刷新 |
| 本报告 | 1 / ≤50 行 | 结论、限制与交接 |
## 3. 关键结论与数值
- 解码时机：`dialogue/start|continue` 消费到正文行后解该行 `currentTags`；`dialogue/choose` 先解被确认 choice 的 tags，再推进目标正文，未选项不执行。EXTERNAL 仅 `get_flag/quest_stage/has_item/affinity`，绑定 `lookaheadSafe=true`，无 RNG/写状态。
- 执行与重验：`authorizedDialogueIntents` 先以 `EventActionSchema` 重验持久值；共享 `executeActions` 再按当前 tx 快照校验物品、库存、QuestDef/章节/阶段/offer/transition、活动战斗，整批失败返回稳定 `DIALOGUE_INTENT_*` 且全部回滚。
- 状态动作：发/收物品、全恢复、旗标、任务推进及阶段 effects、开入口、自动存档请求均落地；`quest/advance` 用 `quest/stage/effect` receipt 防重复，并拒绝递归环。
- 一次性：键为 `storyHash:sourcePath:visitCounter:tagOrdinal`；`visitCounter` 随 `storyJsonState` 保存，成功后键进 `consumedTagKeys` 并清 pending，读档、重放或重复队列均跳过。
- 演出事件：表现动作聚合为 `world/eventPresented {eventId:"dialogue:<storyId>",steps}`；`battle/start` 单独发 `world/battleRequested {anchorId:"dialogue",encounterId}`；autosave 发 `world/autosaveRequested`。core 不建界面、存档或战斗。
- 测试覆盖：给/收物品、旗标、Quest 及奖励、入口、自动档、配点/题卡、战斗请求、choice、四 EXTERNAL、库存/任务/递归拒绝原子回滚、读档去重与 100 次同 hash；未改 golden 期望。
- 挪基点解冲突：`item-content.ts` import 取并集，`QuestDefSchema/QuestDef` 与 `RegionBindingLeafSchema`、三类 core region binding 类型及两侧解析测试并存。
- 运行时边界：core 不再导入 `@tianshu/data/build` 聚合入口，改直达无 Node/I/O 的单文件解码边界；生产 Vite 构建已无 `node:fs/promises`、`node:path`、`node:zlib` 浏览器外置警告。
## 4. 开放问题（附默认值）
- game controller 目前不在本任务内消费 autosave 请求，且其存档 API 拒绝活动对话；默认保留已提交请求，由宿主在对话完成后的安全点落盘。
- game 尚未消费本任务的表现/战斗请求；默认领域事件留在边界，不在 core 内启动 UI 或战斗。
- 入口、题卡、技能、遭遇等资源尚无统一运行时引用表；默认 schema/内容闭合校验负责静态引用，执行时按现有可验证快照重验。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- INK-P01 / 明记 receipt 使用 storyHash、源路径、单调访问序号、标签序号 / 明确循环节点与跨读档的一次性算法。
- INK-P02 / 明记对话内 autosave 是请求、宿主在安全点落盘 / 避免把 core 领域事件误当同步存储。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/04-data-pipeline.md` §7 / 补充共源 `decodeInkAction`、choice 确认时机、receipt 组成及五个拒绝码。
- `docs/tech/05-gameplay-engine.md` §10.3 / 补充共享批执行器、Quest effect 递归保护与对话 autosave 请求边界。
- `packages/data/package.json` / `exports` / 写集外后续应公开 `"./ink": "./src/build/ink.ts"`，再把 core 的相对源码导入改为 `@tianshu/data/ink`；当前直达单文件已切断 `build/index.ts` 的 Node 构建链。
- CONTENT-ch00a / O5、验收 / `#ts:` 状态动作现会真实生效：竹棒、金创药×2、桃、投桃、清茶、旗标、任务、入口、传功/配点/题卡请求；external 实参正确的正式产物已可运行。
- CONTENT-ch10 / O2、八步停点 / `flag/set → world/openEntrance → save/autosave → ui/showTitleCard` 现均会提交或发事件；实际落盘与上屏仍待宿主。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ data/core 共用唯一 OPCODES；正文/choice 解码、pending、receipt、当前快照重验、原序执行、事务回滚、夹具串链与 100 次确定性均完成。
- ✅ `pnpm install --frozen-lockfile`；core 48 文件/549 测试、game 35/135、整仓 164/1202；lint、typecheck、strict ID（仅基线 `sk_babuganchan`，新增失败 0）均通过。
- ✅ `pnpm size` 通过：首次会话 96.02/110 KiB；生产构建无三类 Node 外置警告；仅触及允许写集，无依赖/锁文件/core golden 变更。
- ⚠️ 已原样运行 `pnpm check`：lint/typecheck/164 文件 1202 测试通过，随后 `content:validate` 因沙箱 `tsx listen EPERM` 停止；单跑 `content:build`、`content:validate` 同因，未改 `node_modules`，交调度器沙箱外复核。
- ✅ 交 CONTENT-ch00a/ch10：给/收物品、旗标、任务、开入口现真实落 core；自动档发请求，传功、配点、题卡发演出事件。
- ⚠️ 交 ENG-19e：顺序消费 `world/eventPresented.steps` 与 autosave 请求；交 ENG-26/16c：消费 `world/battleRequested`，UI 不反写 core。
