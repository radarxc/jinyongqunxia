# 本任务：城镇设施键统一为「城镇定义的 cityId__chapterId」（借用布局的城镇也能找到店员与店铺）

**第一个动作**：读下面这些文件，读完直接动手，不要先写计划：
- `packages/core/src/dialogue/facility.ts`（`layoutKey()`）；
- `packages/core/src/command/handlers.ts` 的 `townRuntime()`（已用 `${town.cityId}__${town.chapterId}`）；
- `packages/core/src/economy/shop-query.ts`（店铺实例键 `${layoutKey}/${facility.key}`）；
- `apps/game/src/runtime/explore-projection.ts` 的 `currentFacility()`；
- `content/town/facilities/*.yaml` 的 `layoutKey`；
- `apps/game/src/explore/v1-shop-flow.test.ts`（现有整页购物流程）。

## 背景（协调者 2026-10-12 G0 实测）

设施绑定按布局键登记：`content/town/facilities/city_dali__ch01.yaml` 的 `layoutKey: city_dali__ch01`，店铺实例键 `city_dali__ch01/<facility.key>`。但同一个「当前城镇的设施键」现在有三种算法：
- 核心层城镇运行时：`${town.cityId}__${town.chapterId}`，取自城镇定义；
- 核心层设施对话 `dialogue/facility.ts`：`${town.sceneId}__${state.chapter.eraLayerId}`；
- 界面投影 `explore-projection.ts`：`${town.sceneId}__${session.chapter.chapterId.slice(0, 4)}`。

5173 开发版默认进卷十预览存档。主检出那边有未提交的过渡改动：没有自己内容的城镇，会直接沿用内容里第一座城（大理 ch01）的城镇定义。

结果：
- 核心层找得到 ch01 的设施；
- 界面投影拼出 `city_dali__ch10`，找不到设施，于是进了药铺交互条只有「出门」，没有「交谈」；
- 核心层设施对话按 `eraLayerId` 拼键，同样对不上。

真正的 ch01 大理没问题，整页购物流程测试是通过的。

## 要做的事

1. **唯一算法**：当前城镇的设施键 = 当前城镇**定义**的 `${cityId}__${chapterId}`。定义按 `state.chapter.town.sceneId` 在 `content.towns` 里查，与核心层 `townRuntime()` 一致。
   - 区域场景已有 `region.maps[].town.layoutKey` 的，仍优先用它，保留现有行为。
   - 核心层给一个纯函数，例如 `currentTownLayoutKey(state, content)`，放在 `packages/core/src/dialogue/facility.ts` 或 `world/` 下已有模块。不要改 `packages/core/src/index.ts` 的导出布局；界面可以按同一规则自算，或从已有的公开子路径取。
2. `dialogue/facility.ts` 的 `layoutKey()`、`explore-projection.ts` 的 `currentFacility()` 都改用这个算法。店铺实例键随之一致：`city_dali__ch01/<key>`。
3. 不改设施内容、不改 `handlers.ts` 的 `townRuntime()`（它已经用城镇定义）、不改存档格式。

## 测试（命名用例）

- 核心层：章节为 ch10、当前城镇定义为大理 ch01 时（模拟借用），设施对话能解析到 `city_dali__ch01` 的店员入口，`shop/query` 的店铺键为 `city_dali__ch01/<key>`；同样条件下，ch01 原有用例结果不变。
- 界面投影：同样的借用场景下，进入药铺后 `town.facility` 非空，交互条出现「交谈」。
- 现有 `v1-shop-flow.test.ts` 保持通过。

## 约束

- 只写：
  - `packages/core/src/dialogue/facility.ts`（含其测试）；
  - `packages/core/src/dialogue/*.test.ts`；
  - `apps/game/src/runtime/explore-projection.ts`（含测试 `apps/game/src/runtime/explore-projection.test.ts`）；
  - 本任务报告。

  如必须新增纯函数文件，可放在 `packages/core/src/dialogue/` 下。
- 不改：
  - `App.vue`、`session.ts`、`session-projection.ts`、`handlers.ts`（主检出有别人未提交的改动）；
  - 内容与素材。
- 不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/core/src/dialogue packages/core/src/economy apps/game/src/runtime apps/game/src/explore --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告

写 `tools/agents/reports/ENG-town2-facility-key.md`（≤ 40 行）：
- 第 3 节：三处旧算法与新算法的对照，以及借用场景实测（设施、店员入口、店铺键）；
- 第 7 节：给协调者的 5173 手检步骤（卷十存档 → 进洱海河蛮城邑 → 走进苍山药肆 → 交互条出现「交谈」→ 看看货 → 店铺页）。
