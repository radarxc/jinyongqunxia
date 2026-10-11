# 本任务：城镇探索 v2 · P1 · 设施 / 店铺 / 价目 / 设施对话四个内容 schema + Ink 动作 `facility/openShop`

**第一个动作**：打开 `packages/data/src/schemas/world.ts`（现有 `ShopDefSchema`）、`packages/data/src/schemas/event-actions.ts`（`EVENT_ACTION_REGISTRY`）与 `packages/data/src/content-registry.ts`（`'shop.v1': 'shop'` 一带的注册方式），再读 `docs/tech/15-town-explore-v2-spec.md` §2.5，读完直接动手；不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（data 层只做 schema 与加载边界，不做规则结算）。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」现在城镇「市肆采买」是页面里写死的模拟；核心 `ShopRuntime` 有了但没有内容入口：只有 `content/chapters/ch01_tianlong/shops/dali_yaopu.yaml` 一份 `shop.v1`，且建筑与店铺之间没有任何绑定（布局里的 `business_ref` 是营生 `biz_*`，不是店铺）。本任务只定义数据格式与注册；core 的买卖命令、对话上下文、界面是后续任务。

## 要做的事
1. 新 schema 文件 `packages/data/src/schemas/facility.ts`（设施 + 设施对话）与 `packages/data/src/schemas/shop.ts`（店铺模板 + 价目表），在 `packages/data/src/schemas/index.ts` 导出：
   - `town-facilities.v1`：`{ schemaVersion, layoutKey /* 如 city_dali__ch01 */, facilities: [{ key: LocalKey, kind: FacilityKind, sub: LocalKey | null, buildingId /* 布局里的 bi_* */, nameKey: TextKey, shop: { templateRef: LocalKey, kind: 'normal' | 'famous' | 'blackMarket' } | null, roles: LocalKey[] (≥1), hours?: { open: 分钟 0–1439, close: 分钟 } | null }] }`。`FacilityKind` 按 tech/15 §2.5 的枚举（shop / inn / tavern / teahouse / clinic / escort / casino / school / relay / manor / stall / temple / office / residence），导出常量与类型供下游复用。同一文件内 `key` 唯一、`buildingId` 唯一。
   - `facility-dialogue.v1`：`{ schemaVersion, bindings: [{ chapter: ChapterId | 'common', kind: FacilityKind, sub?: LocalKey, roleKey: LocalKey, storyId, entryKey, condition?: GateExpr }] }`；同 (chapter, kind, sub, roleKey) 不得重复。
   - `shop-template.v1`：沿用 `ShopDefSchema.supply` 的行结构（`itemId, maxGrade, baseStock, restockEveryDays, restockAmount, priceBp, condition?`），字段 `{ schemaVersion, key, nameKey, facilitySub: LocalKey, supply }`，**不带** `chapterId`（章节由运行时上下文给）。
   - `price-table.v1`：design/10 §13.2 的参考价 `P(cat, g)`，单位**文**（整数）：`{ schemaVersion, categories: [{ id: LocalKey, byGrade: int[] /* 下标 = 品阶 1..12 */ }], itemKindToCategory: Record<物品种类, categoryId> }`；先读 `docs/design/10-items-and-equipment.md` §13 定字段名与品阶范围，表内数值由后续内容任务填，本任务只给 schema 与一个最小夹具。
2. `content-registry.ts`：注册上面四个 schemaVersion → 新内容种类（照 `'shop.v1': 'shop'` 的写法），加载结果里出现对应数组 / 记录；交叉引用校验：`templateRef` 必须指向已加载的 `shop-template.v1`；`facility-dialogue` 的 `storyId` 在有 Ink 故事清单时必须存在（照现有 story 引用校验的写法）；`shop-template` 的 `itemId` 必须是已知物品。
3. `packages/data/src/build/discover.ts`：让构建发现新内容位置——`content/town/facilities/*.yaml`、`content/town/facility-dialogues.yaml`、`content/shops/*.yaml`、`content/common/economy/*.yaml`（目录不存在时安静跳过）。
4. `event-actions.ts`：
   - 新增呈现类动作 `facility/openShop`（无参数：`action('facility/openShop', 'presentation', {}, { required: {} })`），并把它加进 `EventPresentationAction` 的联合；Ink `#ts:facility/openShop` 可被解析，带任何参数都拒收。
   - `dialogue/speaker` 的 speaker 正则增加 `interlocutor`（= 当前交谈对象），两处正则同步改。
5. 测试 `packages/data/src/shop-facility.test.ts`：四个 schema 的正例与反例（重复 key / buildingId、未知 kind、负价、品阶越界、模板带 chapterId 被拒）；`templateRef` 未知被拒；`facility/openShop` 带参数被拒、无参数通过；`interlocutor` 通过、`interlocutorx` 被拒；现有全部内容仍通过校验（跑一遍现有加载测试即可）。

## 约束
- 只写：`packages/data/src/schemas/{shop,facility,event-actions,index}.ts`、`packages/data/src/content-registry.ts`、`packages/data/src/build/discover.ts`、`packages/data/src/shop-facility.test.ts` 与本任务报告。**不写任何 `content/**` 文件**（内容由 DES-town2-pilot-content 写）；需要夹具时内联在测试里。
- 不改 `ShopDefSchema` 既有字段（旧 `shop.v1` 照常可用）；不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。
- 沙箱里 `pnpm content:build` / `content:validate` 若因 tsx socket 被拒跑不了，照实写进报告，交校验阶段跑；不要改 `node_modules`。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/data test`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告
`tools/agents/reports/ENG-town2-shop-schema.md`（≤ 60 行）：第 3 节写四个 schema 的字段表与校验规则、价目表品阶范围依据（design/10 哪一节）；第 7 节写给 core 店铺任务（ENG-town2-shop-core）与内容任务（DES-town2-pilot-content）的交接：类型导出名、加载后在注册表里的字段名、文件放哪。
