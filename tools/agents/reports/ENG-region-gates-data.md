# ENG-region-gates-data 报告 · 游戏工程 · 区域绑定数据：gate / dialogue / loot 三类 binding 进内容数据（同一套 schema、content/chapters/<ch>/bindings、编进章节包、区域按需装载、校验地图引用已登记）

## 1. 摘要（3–6 行）
- 已把 gate / dialogue / loot 接入 strict schema、内容索引、章节区域叶片与 `contentHash`。
- 区域入口现在成组懒加载地图和三类 binding；缺失或畸形叶片走可恢复错误，不再静默视为空。
- 地图与 binding 双向闭合校验已覆盖 Door、NpcSpawn、Chest、scene/anchor 及五类内容引用。
- ch10 东门、`first_talk`、李文秀与驿卒的显式无对话记录已按既有交接登记。

## 2. 产出（文件、行数、主要章节）
- 实现与内容共 24 文件，净变更 `+828/-65`（不含报告）；覆盖 schema/索引、构建/校验、运行时/测试、内容约定/ch10 数据。
- schema、registry、content-index 及 schema 测试：5 文件、现有 642 行；定义、路径归属、引用闭合与分片解析。
- `packages/data/src/build/**`：9 文件、现有 1,962 行；区域选择、独立叶片、分片、地图闭合与构建测试。
- `apps/game/src/runtime/**`：5 文件、现有 1,384 行；`RegionContentSlice`、装载/恢复和门禁→Ink→宝箱整链路。
- `content/CLAUDE.md` 与 ch10 YAML：5 文件、现有 39 行；目录约定及 1 gate + 1 dialogue + 2 `noDialogue`。

## 3. 关键结论与数值
| kind / schemaVersion | 必填字段 | 可选或互斥字段 | 已校验引用 |
|---|---|---|---|
| gate / `region-gate.v1` | `gateId, chapter, expression, lockedTextKey` | `note?` | quest、flag |
| dialogue / `region-dialogue.v1` | `chapter, sceneId, anchorId` | `storyId+entryKey` 与 `noDialogue:true` 二选一；`condition?` | scene、anchor、story、knot、quest、flag |
| loot / `region-loot.v1` | `lootRef, chapter, items[{itemId,count}]` | — | item |
- 规范目录：`content/chapters/<ch>/bindings/{gates,dialogues,loot}/*.yaml`；三类均为 `z.strictObject`。
- 叶片：`chNN.rules.<region-token>.bindings[.pNNN].json`，`kind=rules/load=region`；超 256 KiB 仅分 `entries`，每片保留完整 envelope。
- ch10 叶片 1,031 B raw / 341 B gzip、4 条；全部 43 map slice 均有 binding slice，总计 5,564 B raw / 5,195 B gzip。
- ch10 `contentHash=d23464537dceaf5aa109be5a3c7f2bafe37c23f324b61bd8b8e3beae395d7c5e`；binding 不进入 chapter base。
- 诊断示例：`TS-CONTENT-MAP-019 door_locked lockedBy gate_10_fixture is not registered for this map chapter`，同时带文件、对象 ID、给定值。
- 过渡规则：NpcSpawn 完整性仅对已声明 `bindings/` 的章节生效；Door `lockedBy` 与 Chest `lootRef` 始终硬校验，未放宽。
- 装载失败：`REGION_RULES_UNAVAILABLE:<cause>`，session 转可恢复 `REGION_UNAVAILABLE`。
- 挪基点解冲突：保留 `loadAssets`、章节素材/NPC/世界地图懒加载及 `textValue` 文本键解析；区域入口统一为 `loadRegionContent`，成组返回地图与三类 binding。
- `pnpm size`：标题 38.79/170 KiB；渲染 168.86/180；WebGL 合计 207.65/350；首次会话 worker/session static/base/total = 2.43/80.02/6.84/89.29 KiB（限 110）。

## 4. 开放问题（附默认值）
- core `RegionDialogueBinding` 尚无 `condition`；默认保留、校验并打包，由 ENG-event-executor 求值后再启动 Ink。
- core `RegionGateBinding` 尚无 `lockedTextKey`；默认保留在内容叶片，现有 `doorGate` 只消费 `gateId/expression`，后续 UI 消费。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现遵循基准 §12 ID 与既有 tech/04 内容归属。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/04-data-pipeline.md` §6/§8：补逻辑叶片 `chNN.rules.<region-token>.bindings[.pNNN].json`、envelope、`noDialogue`、地图闭合和区域按需加载。
- `packages/core` / ENG-event-executor：补 dialogue `condition` 与 gate `lockedTextKey` 的消费合同；本任务未改 core。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 三类 schema 正反例、quest/flag/item/story/knot 缺失、地图未登记/已登记与错误 scene/anchor 均有 Vitest。
- ✅ 43/43 区域地图与 binding 叶片配对；contentHash、合法 envelope 分片、标题/首次会话静态闭包要求满足。
- ✅ 新游戏/读档/书眠后的 mount 共用区域入口；整链路验证门锁与开门、正确 story/knot、宝箱物品及失败错误码。
- ✅ ch10 三项逻辑交接完成：东出口 gate；`first_talk`；`li_wenxiu`/`postman` 两个显式无对话记录。
- ✅ 交 CONTENT-ch00a/ch00b/ch10：Door 的 `lockedBy` 精确匹配 gate YAML；C01/C03 用真实 flag/quest 写 expression，不拿 quest ID 冒充 gateId。
- ✅ NpcSpawn 以 `sceneId+anchorId` 登记 story/knot 或 `noDialogue:true`；Chest 的 `lootRef` 匹配 loot YAML，物品写 `items`。
- ✅ 交 ENG-event-executor：对话 Trigger 以当前 `sceneId+trigger anchorId` 查已加载 dialogue，求值 `condition` 后启动 `storyId/entryKey`；不在本任务实现执行器。
- ✅ `install --frozen-lockfile`；content build 1,173 对象/15 章；validate 1,180 文件/1,114 对象/2 Ink/62 地图；data 204、game 134 tests；strict ID 新增失败 0。
- ⚠️ 沙箱禁止 tsx Unix socket，裸 content build/validate 均 `listen EPERM`；进程内 no-IPC 包装下原命令及 `pnpm check` 161 文件/1,172 用例全绿，未改仓库脚本。
- ✅ `git diff --check` 通过；仅改写集内文件，未改 core、地图、docs、TODO，未调用 Trae 技能或改变仓库状态。
- ✅ 10-04 挪基点解冲突：`session.ts` 同时保留 `loadAssets` 与 `loadRegionContent`；`item-content.ts` import 取并集，保留 base-diet 的章节叶片 DTO/`textValue` 与本任务 binding schema，仓库无冲突标记。
