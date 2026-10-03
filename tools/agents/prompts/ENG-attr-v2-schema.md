# 本任务：游戏工程 · 小修：`item.v1` 的各 extension 接受可选 `attributes: AttributeProjectionV2`（design/10 §4.10.5 内容投影目标），只校验结构、不消费（为 TOOL-items-regen 解锁）

本任务改代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/design/10-items-and-equipment.md` §4.10.5「内容投影目标」（第 911 行一带：各适用 strict extension 的可选 `attributes: AttributeProjectionV2`，序列化位置 `extension.value.attributes`，对象含 `version: 2` 与合法键，不复制 `grade/kind/slot`；装备、秘籍、材料、坐骑及 `generic` 各自沿既有 extension，不能为投影改变 `extension.type`）、§4.10.6 键白名单（武器 `atk/hardness/qiAffinity/qiEffect`；装备 `def/reflect/antiHidden/agi/block/luck/poison/antiPoison`；药食 `restoreQi/qiCultivation/con/healInner/healOuter/stamina`；秘籍 `skillRef/maxLayer`；收藏品六键本任务**不**纳入，由 TOOL-catalog-collectibles 走 `CollectibleExtensionSchema` 的原生字段）；
- `packages/data/src/schemas/item.ts`（第 65–119 行各 `*ExtensionSchema` 都是 `z.strictObject`；`generic` 是 `z.strictObject({})`）、`packages/data/src/content-registry.ts` 第 76 行的解析；`packages/data/CLAUDE.md`；
- `tools/content/items_from_catalog.py` 的九列投影输出（样例：`extension: {type: generic, value: {attributes: {version: 2, stamina: 22}}}`）；
- `tools/agents/reports/TOOL-catalog-9col.md` §3（生成器写 `extension.value.attributes` 的字段与类型）。

## 问题

TOOL-items-regen 按九列名录重新生成 `content/items` 后，`pnpm content:validate` 报 `ZodError unrecognized_keys: attributes`（`extension.value` 是 strictObject）。设计已定投影位置，schema 还没接。

## 要做的事

1. `packages/data/src/schemas/item.ts`：新增 `AttributeProjectionV2Schema = z.strictObject({ version: z.literal(2), …白名单键全部可选 })`——整数键用 `z.number().int()` 并按 §4.10.3–§4.10.4 的允许范围加上 `.min(0)` 等最小约束（不做品阶带校验，那是名录校验器的事）；`qiEffect` 为引用 ID 字符串（用既有的 ID schema，若无就 `z.string().regex(/^[a-z][a-z0-9_]*$/)`）；`skillRef` 用 `SkillIdSchema`；`maxLayer` 正整数。把 `attributes: AttributeProjectionV2Schema.optional()` 加到 `generic`、equipment、material、manual、mount、curio（以及 page / recipe / quest，若生成器会写）各 extension value 上；`extension.type` 不变；导出类型 `AttributeProjectionV2`。
2. 不消费：`core` / `render` / `ui` 不读它（ENG-27a 之后再接）；`content-registry` 不改。
3. 测试：`packages/data/src/schemas/` 下补 item 测试（文件名照包内既有测试约定）：带 `attributes` 的 generic / equipment / manual 各一条通过；`version: 1`、未知键、小数、负数各一条失败；无 `attributes` 的旧物品原样通过。
4. `pnpm check` 全绿，**entry 体积不得超预算**（当前 168.57 / 170 KiB，ENG-entry-split 合入后会降；若本任务合入前拆分未合，报告写实测 entry 数字，超线就不交付、报告说明）；`pnpm --filter @tianshu/data test`、`pnpm content:validate`（当前七列生成物）通过；另用 TOOL-items-regen 工作区的一份带 `attributes` 的 yaml（上面的样例）做一次 `content:validate` 级别的解析验证并写进报告。

## 约束

- 只改：`packages/data/src/schemas/item.ts`、`packages/data/src/schemas/*.test.ts`（或包内既有测试位置）、`packages/data/CLAUDE.md`，以及报告。不改 `content/**`、`tools/**`、`packages/core/**`。
- 不改预算、不加跳过逻辑。

## 报告

`tools/agents/reports/ENG-attr-v2-schema.md`，≤ 40 行；§3 写 schema 字段表与 entry 实测；§7 对照第 1–4 条。
