# content 协作约定

schema 即文档；新增内容先查稳定 ID，禁止重复定义。`_drafts/` 不进生产发现器。正式文件 UTF-8、LF、单一 YAML document，不用 anchor、隐式日期或重复键；提交前运行 `pnpm content:validate` 与 `pnpm check`。

Ink 放在 `story/**/<storyId>.ink`，并配同名 `.inkmeta.yaml`；`#ts:` 只用构建器白名单。
M1 Ink 动作使用 `quest/advance`、`battle/start`、`flag/set`、`party/giveItem`、
`party/takeItem`、`world/openEntrance`、`tutorial/mark`、`story/requestTransmission`、
`ui/openAllocation`、`ui/showTitleCard`、`save/autosave`、`dialogue/speaker`。
参数必须是 `key=value` 标量；未知、重复、多余、缺失或值域错误均阻断构建。
发布前运行 `pnpm content:build`，不得手改 `.cache/content-build/` 或 `dist/content/`。

匿名角色槽按章节放在 `content/chapters/<ch>/roles/*.yaml`，使用 `role-slot.v1`；
模板可放同章 `roles/templates/*.yaml`。`slotId` 使用既有 `role_*` 逻辑键，实例身份由下游
按 `(runId, chapterId, templateId, spawnKey, spawnOrdinal)` 生成确定性 UUID，不建静态 `npc_*`。

区域 binding 按章节放在
`content/chapters/<ch>/bindings/{gates,dialogues,loot}/*.yaml`。三类文件分别使用
`region-gate.v1`、`region-dialogue.v1`、`region-loot.v1`，并随对应章节、区域按需装载。
Door 的 `lockedBy`、Chest 的 `lootRef` 必须有同章登记；NpcSpawn 必须有
`sceneId + anchorId` 对话登记，明确无对话时也须写同一 `region-dialogue.v1`，以
`noDialogue: true` 取代 `storyId + entryKey`。不要在 `.tmj` 中另造无对话标志。
