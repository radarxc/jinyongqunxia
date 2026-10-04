# ENG-npc-species-roleslot 报告 · 游戏工程 · 人物数据契约补两处：NPC 加 species（非人 ageBand 为 null、不进人类年龄管线），新增角色槽 RoleSlotDef（role-slot.v1，加载与校验，进章节包）
## 1. 摘要（3–6 行）

- `npc.v1` 已支持四种 species、人类/非人年龄互斥约束及不可招募 appearance；角色槽契约亦已落地。
- 已完成注册/引用/路径校验、按章 O(1) 查询及独立章节叶片。
- 序章阿青、白猿、范蠡与三类共 6 槽已晋升；四任务人物强引用已恢复。

## 2. 产出（文件、行数、主要章节）

- Schema：`character.ts` 103 行、`role-slot.ts` 45 行、`schemas/index.ts`；覆盖物种、年龄、招募与角色槽。
- 装载/构建：`content-{registry,index}.ts`、`build/{field-registry,split-fields,pipeline}.ts`；含引用校验、查询和 `chNN.rules.roles.json`。
- 测试：`character-role-slot.test.ts` 67 行、`build/role-slot.test.ts` 87 行（最小内容树），并补 `content-schemas-m1.test.ts` 反例。
- 返修：battle replay 两用例及 runtime 唯一另一个无超时重用例（100 轮 transport 确定性）显式限时 30 秒；断言、轮数与性能门均未改。
- 内容：3 个正式 NPC（33/32/33 行）、3 个角色槽（各 9 行）、`tmpl_normal` 6 行、4 个 quest 单字段修改；对应 6 份草案删除。

## 3. 关键结论与数值

- Species=`human|animal|spirit|projection`；省略解析为 human。human 每个 appearance 必须有非 null `ageBand`；非 human 必须为 null，lifespan/template 也禁带人类年龄段。
- 不可招募人物写 `appearance.recruitment:null`；白猿为 `animal/null`，未保留可由 species 推导的 `runtimePolicy`。
| 类别 | RoleSlotDef 字段与约束 |
|---|---|
| 身份/归属 | `schemaVersion:'role-slot.v1'`、`slotId:role_*`、`chapter`；文件在 `content/chapters/<ch>/roles/*.yaml` |
| 生成输入 | 已登记 `templateId`、正整数 `count`、`dreamTier:1|2`；序章 `2+2+2=6` |
| 确定性 | `stable_per_save` + `(runId,chapterId,templateId,spawnKey,spawnOrdinal)` |
| 展示/消费 | 可选 `displayRoleKey`、`consumerRefs`；模板、任务及启用时的遭遇引用强校验 |
- 年龄处理范围：仓库 TS 源码未发现 schema 外 `ageBand` 消费者；本任务未改 core/apps，非人跳过由上述契约保证。

## 4. 开放问题（附默认值）

- O1：UUIDv5 namespace 常量及实例化不在写集；默认 ENG-26/运行时使用版本化项目 namespace 和上述 tuple，本任务不展开实例。
- O2：设计称 `dreamLevel`、任务契约称 `dreamTier`；默认 `dreamTier` 1:1 作为序章 dreamLevel 输入。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- P-ENG-NR-01 / 基准 §12 登记 `role_*` 为章内 RoleSlot 逻辑键而非全局内容 ID / 正式 schema 已需稳定命名，但不得冒充 NPC。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/18` §7.3 / `NpcAppearance.recruitment` 标为可 null，并补可选制作档 `productionTier:S|A|B`。
- `docs/00-canon.md` §12、`tools/lint/check_ids.py` / 说明 `role_*` 局部前缀及逻辑名 `chNN.rules.roles.json`；当前 strict 无新增失败。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ species 正反例、人类缺/null 年龄、动物带年龄、lifespan 人类年龄元数据均有覆盖。
- ✅ role-slot schema 正反例、模板缺失、路径/章节/文件名、consumer 与 quest NPC 强引用均校验。
- ✅ 进程内最小树构建验证三 NPC、三类 6 槽、任务引用及 `ch00.rules.roles.json`；查询为 `roleSlotsForChapter(chapter)`。
- ✅ `pnpm install --frozen-lockfile`、data typecheck、18/18 文件 208/208 测试、全仓 lint/typecheck、165/165 文件 1193/1193 测试、size、ID strict、diff check 通过。
- ⚠️ 原样 `pnpm content:build`、`content:validate` 及 `pnpm check` 内容阶段均被沙箱 `tsx ... listen EPERM` 阻断；按约束未改 shim，交沙箱外校验。
- ✅ 草案晋升只移除 draft/mock 字段；白猿三项 runtimePolicy 由 species 规则取代，其他内容不改取舍；四 quest 只改 `subjectNpcIds`。
- ✅ 交 ENG-26：构建期调用 `roleSlotsForChapter`；运行时从 chapter-load 的 roles 叶片取 envelope，按 count/seed 展开，不把 slotId 当 NPC ID。
