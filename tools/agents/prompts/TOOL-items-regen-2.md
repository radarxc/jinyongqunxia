# 本任务：工具 · 收藏品入库：按名录重新生成 content/items（含 items-collectibles.md 的 151 件收藏品；提交生成物；不改生成器）

本任务运行现成的生成器并提交它的产物，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- `tools/agents/reports/TOOL-catalog-9col.md` 第 7 节「交 TOOL-items-catalog」：重新生成时会多出的字段；
- `tools/agents/reports/TOOL-catalog-food-qi-exception.md`；
- `tools/agents/reports/ENG-items-leaf.md` 第 7 节「交 TOOL-items-catalog」：物品是内容包独立叶片，重新校验时要做什么。
- `tools/agents/reports/TOOL-items-regen.md`（第一轮）、`TOOL-catalog-collectibles.md`（收藏品投影规则）、`ART-items-gifts-catalog.md`。

## 为什么做

- 第一轮重新生成（TOOL-items-regen，3d6db806）已经把十一份九列名录的 889 件物品写进 `content/items`，每件都带 `text.lore` 与 `extension.value.attributes`。
- 之后陆续合入了两项：
  - TOOL-catalog-collectibles：校验器和生成器都认识 `docs/design/catalog/items-collectibles.md`；
  - ART-items-gifts-catalog（be7a8c39）：151 行九列收藏品名录、151 份出图提示词。
- 收藏品还没进 `content/items`，`items_from_catalog.py --check` 会报这些收藏品缺失或 stale。作者 AR-39 规定生成物必须提交。

协调者口径（10-03 13:30），沿用第一轮：
> 按名录重新生成 content/items，提交生成物（AR-39）；不改生成器；`--check` 必须通过；size 以集成分支为准

## 要做的事

1. 运行 `python3 tools/content/items_from_catalog.py`（写模式），按当前名录重新生成 `content/items/**`。
2. 运行 `python3 tools/content/items_from_catalog.py --check`，必须通过。
3. 核对产物（收藏品是新增的 `kind: collectible`，`extension: {type: collectible, value: …}` 按 `CollectibleExtensionSchema`；收藏品名录的「说明」进 `text.lore`）：
   - 九列行的「说明」应进入 `text.lore`；
   - 「属性投影」应进入 `extension.value.attributes`（`version: 2` 加各键）；
   - 原有字段的映射不变。
   - 每类名录抽 2 件，在报告里列出生成前后的差异要点。
4. 生成器报错，或某些条目生成不出来时：**不要手改 `content/items` 去绕过，也不要改生成器或名录**。在报告第 4 节写清是哪些条目、什么原因、建议哪个任务来改，其余条目照常生成。
5. 体积：物品是内容包的章节叶片，按需加载，不应该影响标题页 entry 或首次会话闭包。报告写 `pnpm size` 的三层数字（标题页 / 首次会话 / 子系统块）。若首次会话闭包比集成分支（93.36 / 110 KiB）涨了，写清涨在哪个块。
6. 跑下面全部检查。`pnpm size` 以集成分支为准：物品是内容包叶片，按需加载，正常不该影响 entry。若本工作区 entry 与集成分支（169.07 / 170）明显不同，在报告里写出两边数字。

## 约束

- 写集：`content/items/**` 与本任务报告。写集外的改动在提交时会被丢弃。
- 不改 `tools/**`（含生成器与测试）、`docs/**`（含名录）、`packages/**`、`apps/**`。
- 每次写入 ≤ 150 行：生成器自己写文件不受这条限制，手工改动受限。

检查：以下命令必须全部通过。
- `python3 tools/content/items_from_catalog.py --check`
- `python3 -m unittest tools.content.test_items_from_catalog tools.lint.test_check_item_catalog`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:validate`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 重新生成的文件数，按新增、修改、删除分列；
- 新字段覆盖率：带 `text.lore` 的条目数、带 `extension.value.attributes` 的条目数；
- 抽样差异；
- `pnpm size` 数字。

第 4 节写生成不了或有警告的条目。

报告 ≤ 40 行。
