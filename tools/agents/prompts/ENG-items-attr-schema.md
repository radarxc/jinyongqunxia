# 本任务：游戏工程 · 小修：物品 schema 接受属性投影 v2（`extension.value.attributes`），解除 TOOL-items-regen 的校验阻断

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/data/CLAUDE.md`。

## 为什么做

- DES-items-lore-1 … 8 已把十一份物品名录改成九列。TOOL-catalog-9col 的生成器 `tools/content/items_from_catalog.py` 按 design/10 §4.10.5「内容投影目标」，把「属性投影」写进 `extension.value.attributes`（`version: 2` 加合法键）。
- TOOL-items-regen 重新生成 `content/items` 后，`pnpm content:validate` / `pnpm check` 报 ZodError：`extension.value` 出现 `Unrecognized key: "attributes"`。
- 原因：`packages/data/src/schemas/item.ts` 里各类 extension value（Equip / Material / Manual / Curio / Mount / Collectible …）都是 `z.strictObject`，没有这个键。

## 规格（照这些写，不自创）

- `docs/design/10-items-and-equipment.md`：
  - §4.10.5「内容投影目标」：各适用 strict extension 加可选 `attributes: AttributeProjectionV2`；对象含 `version: 2` 与本节合法键；不复制 `grade` / `kind` / `slot`；不得为属性投影改 `extension.type`；
  - §4.10.6：键与消费点；
  - §4.10.7：各类速查。
- 键白名单、值类型、各类别允许的键，以 `tools/lint/check_item_catalog.py` 的现行常量为准，校验器已按 §4.10.5 实现：
  - 整数键只收整数；
  - `qiEffect`、`skillRef` 之类引用键收 ID 字符串（以校验器为准）；
  - schema 与校验器不一致时，以校验器为准，并在报告第 6 节登记差异。

## 要做的事

1. `packages/data/src/schemas/item.ts`：
   - 新增并导出 `AttributeProjectionV2Schema`：`z.strictObject`，`version: z.literal(2)`，其余键全部可选，类型按上条；
   - 在生成器会写 `attributes` 的那些 extension value schema 上加 `attributes: AttributeProjectionV2Schema.optional()`。哪些类别，以 `items_from_catalog.py` 的实际输出为准，可用 `.agents/wt/TOOL-items-regen/content/items` 的已生成产物核对，只读。
   - 不改其他字段，不放宽 strict。
2. 测试（`packages/data/src/schemas/item.test.ts` 或同目录现有测试文件）：
   - 合法：武器、衣物、药品、食品、秘籍、收藏品各一例；
   - 非法：未知键、小数、`version` 不是 2、在不允许该键的类别里出现各一例。
3. 用 TOOL-items-regen 工作区的产物做一次本地验证：把 `.agents/wt/TOOL-items-regen/content/items` 临时复制进本工作区跑 `pnpm content:validate`，记录结果后还原。**不要提交这些物品文件**，它们归 TOOL-items-regen。
4. 体积：物品 schema 在 core Worker 里，属于 entry 闭包。报告写 `pnpm size` 的 entry 前后数字；增量应在 0.5 KiB 以内，超过就精简实现，不改预算。

## 约束

- 写集：`packages/data/src/schemas/item.ts`、`packages/data/src/schemas/item.test.ts`。写集外的改动在提交时会被丢弃。
- 不改 `tools/**`（生成器与校验器）、`content/**`、`docs/**`、`apps/**`、`packages/core/**`。运行时消费属性投影归 ENG-27a，本任务不做。
- 不加依赖；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/data test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 加了 `attributes` 的类别清单；
- 键与类型对照表，注明来源是校验器常量；
- 用 regen 产物验证的结果；
- entry 前后数字。

第 6 节写 schema 与校验器、design/10 的差异。

报告 ≤ 40 行。
