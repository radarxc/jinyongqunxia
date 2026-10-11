# 本任务：城镇 3D 人物 · 身高数据 schema——`NpcAppearanceSchema.body`、`CharacterTemplateSchema.body`、纯函数 `pickTemplateHeightCm`

**第一个动作**：打开 `packages/data/src/schemas/character.ts`（`NpcAppearanceSchema` 约 L37、`CharacterTemplateSchema` 约 L93）与其测试 `character.test.ts`，再读 `docs/tech/16-town-3d-spec.md` §9.3 与 `packages/render/src/actors/heights.ts`（ENG-town2-heights 的身高表）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（schema 即文档；数据驱动，不把人物逐条硬编码进规则）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配」；作者拍板人物用 3D 模型、按身高数据缩放。作者 AR-104 定了体型身高：男 精悍 1.76 / 中等 1.81 / 魁梧 1.86 m，女 1.58 / 1.66 / 1.72 m（AR-79 体型模板）。具名 NPC 的身高随年龄按外观存；城里的店员、路人这类角色槽 NPC 按模板的身高区间用存档稳定种子取值，同一个人每次进城身高不变。

## 要做的事（`packages/data/src/schemas/character.ts`）
1. `BodyTemplateIdSchema = z.enum(['tpl_f_small', 'tpl_f_medium', 'tpl_f_tall', 'tpl_m_lean', 'tpl_m_medium', 'tpl_m_bulk'])`（与 render 的身高表键一致；新模板 `tpl_f2_medium` 等合入换装索引后再扩，本任务不加）。
2. `NpcAppearanceSchema` 加可选 `body: { template: BodyTemplateId; heightCm: int 120–230 }`（随年龄，按外观存）。
3. `CharacterTemplateSchema` 加可选 `body: { templates: BodyTemplateId[] (≥ 1，不重复); heightCm: [min, max] }`（`120 ≤ min ≤ max ≤ 230`）。
4. 纯函数 `pickTemplateHeightCm(body, seed) → { template, heightCm }`：`template = templates[seed % templates.length]`，`heightCm = min + floor(seed / templates.length) % (max − min + 1)`（整数、无浮点；seed 为 uint32，负数或非整数抛错）；放 `packages/data/src/schemas/character.ts` 同文件导出或 `packages/data/src/character-body.ts`（二选一，写清）。
5. 缺省身高常量（主角创角前缺省）：男 `tpl_m_medium` 181、女 `tpl_f_medium` 166——导出常量供 core / app 使用，与 render 的 `DEFAULT_PLAYER_HEIGHT_M` 一致（测试里交叉断言数值相同，但 data 不得 import render）。

## 测试（`packages/data/src/schemas/character.test.ts`，命名用例）
- 现有全部人物 / 模板内容仍通过 schema（跑一遍内容校验即可证明）。
- `body` 字段边界：`heightCm` 119 / 231 拒绝、120 / 230 接受；模板 id 非法拒绝；`templates` 重复或为空拒绝；`[min, max]` 颠倒拒绝。
- `pickTemplateHeightCm`：同种子同结果；1 万个固定种子（mulberry32）下身高都在区间内、模板都在列表内；区间宽 1 时恒为该值；负种子 / 小数种子抛错。
- 缺省常量与 AR-104 表一致（181 / 166）。

## 约束
- 只写：`packages/data/src/schemas/character.ts`、`packages/data/src/schemas/character.test.ts`、`packages/data/src/character-body.ts`（若选此位置）与本任务报告。
- 不改 `content/**`（给具体 NPC 填身高是后续内容任务）、`packages/render/**`、`packages/core/**`；不改 `packages/data/src/schemas/index.ts`（它已 `export *` 了 `character.ts`，新导出自动可见；若选 `character-body.ts` 位置，则从 `character.ts` 再导出）；不新增依赖。
- 纯整数；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/schemas --config vitest.config.ts --project node`
- `pnpm content:validate`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-actor3d-d1-schema.md`（≤ 40 行）：第 3 节写字段定义、取值公式、缺省常量；第 7 节写给 core / 编译器（`FacilityNpc` 外观种子怎么喂给 `pickTemplateHeightCm`、投影里怎么给 `ActorLook.heightM`）与内容任务（具名 NPC 填 `body` 的格式）的交接。
