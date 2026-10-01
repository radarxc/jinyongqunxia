# 本任务：游戏工程 · 物品运行时（物品栏、装备、全局物品与藏品、店铺供货、药材强化、制式盔甲通缉）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`packages/data/CLAUDE.md`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 2.4 物品（物品栏 id + 数量；全局物品 / 书界物品与藏品位置；店铺供货）、2.3（药材强化经脉 / 穴位）；**AR-20**（十一类物品；制式盔甲非官府穿着会被通缉、无法正常进城；内甲；护肩 / 披风 / 头饰 / 鞋 / 腰带；暗器）。

## 设计依据

`docs/design/10-items-and-equipment.md`（DES-items-plus 补充后）、名录 `docs/design/catalog/items-*.md`、`docs/design/11-*`（身份 / 通缉，若有）、`docs/design/12`（声望）、`docs/tech/05-gameplay-engine.md` §2（`economy`、`progression`）。ENG-02 的 `Inventory` / `Equipment` / `WorldItems` / `ShopState`；ENG-03 的 `applyMeridianBoost`。

## 要做的事

1. `economy/inventory`：加 / 减 / 叠放上限 / 排序 / 分类查询；使用消耗品（补血、补气、临时 / 永久属性、内力、复活、解毒、疗伤、经脉穴位强化 → 调 ENG-03）；装备 / 卸下（design/10 §3 槽位含新增：护肩 / 披风 / 头饰 / 鞋 / 腰带 / 内甲）与面板属性重算。
2. `economy/world-items`：书界全局物品与藏品位置（场景 ID + 锚点；拾取 / 已取状态；时限或条件可见）；查询接口给 ENG-08 / 09。
3. `economy/shop`：店铺供货（按年代与城镇等级的货单、补货周期、价格浮动、买卖）；与 `GameClock` 对接。
4. 制式盔甲：穿着官府制式盔甲且身份非官府 → `wantedLevel` 上升、城门拦截标志（供城镇进入判断，ENG-08）；接口与事件。
5. content：把名录里的物品转成 `content/items/*.yaml`（写一个 `tools/content/items_from_catalog.py` 从 `docs/design/catalog/items-*.md` 机器行生成；生成物入库；校验通过）。
6. 测试：物品栏不变量（数量非负、叠放上限）、使用消耗品效果（含药材 → 经脉强化走 ENG-03）、装备属性重算、店铺补货周期、通缉标志；`pnpm check` 全绿。
7. 更新 `packages/core/CLAUDE.md`：接口清单交 ENG-07（物品栏 UI）、ENG-08 / 09。

约束：不写 UI；每次写入 ≤ 150 行；不改 `packages/core/src/index.ts`（已预先导出各子模块）与别的任务负责的子目录；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

性能是作者硬要求（AR-21「性能要最好」）：物品栏与店铺用 Map / 类型化数组，查询 O(1)；全局物品按场景分桶；content 生成物预排序。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/content/items_from_catalog.py --check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：接口清单；content 生成统计（按类 / 品阶）；测试摘要；交下游接口。报告 ≤ 100 行。
