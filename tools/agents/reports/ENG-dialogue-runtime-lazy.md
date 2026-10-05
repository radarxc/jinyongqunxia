# ENG-dialogue-runtime-lazy 报告 · 游戏工程 · 小修：对话 / Ink 意图执行移出首次会话静态闭包，改走对话懒加载块（AR-64 第 1 条；ink-intents 后 event-executor 块 4.38 → 20.96 kB，会话 96.02）；首次会话回到 92 KiB 以下
## 1. 摘要（3–6 行）
对话意图校验、QuestDef 完整解析、对话 autosave 与 battle 请求已移入 `dialogue-command` 懒加载闭包；共享执行器保留三入口共用的 Quest 推进/effect 事务语义。
对话块加载时一次性注册批执行器；正常宿主先加载再派发，加载失败沿既有可重试路径抛 `DIALOGUE_SUBSYSTEM_UNAVAILABLE`。
返修恢复了区域/源事件合法 `quest/advance`；最终首次会话 90.22 KiB gzip，低于 92 KiB，且对话专用模块在 session static 为 0 命中。
区域、源事件、对话意图的状态、完整事件载荷、拒绝码和事务回滚均由既有及新增回归覆盖。
## 2. 产出（文件、行数、主要章节）
- `packages/core/src/**`：6 文件修改、3 文件新增；共享 Quest/event 核心、对话扩展注册、三路语义/边界测试。
- `packages/data/src/**`：3 文件修改、2 文件新增；窄内容入口、对话期 Quest 解析、独立 TimeWindow schema。
- `apps/game/src/runtime/**`：1 文件修改、1 测试新增；Quest 轻量登记及真实 session 模块图断言。
## 3. 关键结论与数值
- 改前实测：worker 2.44、session static 88.15、base 6.84、首次会话 97.42、对话 139.57 KiB gzip（任务给定集成基线为 96.02）。
- 改后复测：worker 2.43、session static 80.94、base 6.84、首次会话 90.22、对话 112.96 KiB gzip；首次会话较本地改前减 7.20 KiB。
- 归属调整后 `event-executor` 块原始 20,859 B：含区域/源事件所需共享 Quest 推进；`intent-actions.ts`、`dialogue-content.ts`、`schemas/quest.ts` 仅见于对话块。
- `EVENT_ACTION_REGISTRY` / OPCODES 仍由 `event-actions.ts` 唯一登记；未复制动作词表。Quest 内容启动时仅校验 envelope，完整 schema 在首次对话命令解析并缓存。
- 对话扩展未注册的直接调用原子拒绝 `DIALOGUE_INTENT_ACTION`；产品路径先动态加载，失败给可恢复 `DIALOGUE_SUBSYSTEM_UNAVAILABLE`。
## 4. 开放问题（附默认值）
- 无需作者决策；默认构建期校验全部 Quest，对话块首次使用时再完整解析，区域/源事件消费已验证的内存定义。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；仅调整 AR-64 要求的加载边界，不改变玩法基准。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 下游接口：`executeDialogueActions` 仍由 `dialogue-command` 注册；区域/源事件经共享 `advanceQuestAction` 执行 Quest，拒绝码分别沿 `REGION_EVENT_*` / `SOURCE_EVENT_*`。
- 测试落点：`region-handler.test.ts`、`book-sleep.test.ts`；复测命令 `pnpm exec vitest run packages/core/src/command/{region-handler,book-sleep}.test.ts --config vitest.workspace.ts`。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 冻结安装成功；生产构建、体积检查、开发分块检查通过；90.22 < 92 KiB，量具与预算未改。
- ✅ 定向 5 文件/58 用例及整仓 179 文件/1266 用例通过；含两路 Quest effects/载荷/拒绝/回滚、对话意图、100 次确定性与懒加载模块图。
- ✅ lint、typecheck、strict ID（已知未定义 1、新增失败 0）、`git diff --check` 通过；仅触及允许写集，未改依赖/node_modules。
- ⚠️ 本轮原样 `pnpm check` 的 lint/typecheck/179 文件 1266 用例通过，随后 `content:validate` 因沙箱 `tsx listen EPERM` 停止；单跑 `content:build` 同因，按约束未绕过，需调度器在沙箱外复核。
- ✅ 审核返修：区域/源事件 `quest/advance`、阶段 effects、事件顺序及整事务回滚已恢复；对话专属校验与注册仍懒加载。
- ⚠️ 首屏仍含 EventAction/EventDef、TimeWindow、区域执行与物品库存逻辑：均是区域/源事件和章节装载所需，故本次不继续懒加载。
