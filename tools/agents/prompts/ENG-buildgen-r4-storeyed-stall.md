# 本任务：城镇 3D 古建 · 两层楼与摊位配方——`storeyed`（腰檐、平座栏杆、上层格扇）与 `stall`（布棚 / 小悬山、柜台、摊主位）

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r1-hall-body.md` 与 `tools/agents/reports/ENG-buildgen-r2-roof-a.md` 的第 3、7 节（屋身部件函数、屋顶分派与坡面函数、`RecipeSink` 用法），再打开 `packages/render/src/buildgen/mesher/recipes/hall.ts`、`packages/render/src/buildgen/mesher/recipes/{storeyed,stall}.ts`（r0 的桩）与 `docs/tech/16-town-3d-spec.md` §3（客栈 10×8 两层算例：首层 3200、二层 2700、滴水 6130、脊 8547）、§5.1 第 2、3 条、§5.4、§6.5；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`。

## 背景
作者 AR-114（2026-10-10，逐字）：「人物大小和建筑不匹配，希望用threejs做一个能进入建筑的游戏体验。同时，采买这些都在建筑里进行（搭配NPC对话）。」客栈、酒楼、两层店铺是城里最常见的"能进去"的大建筑；进屋时首层天花以上（腰檐、楼板、上层、上层屋顶）要整体淡出，所以这些顶点必须全部进**屋顶批**。摊位不可进入，摊主站在柜台后、顾客在摊前街面上交谈。

## 要做的事（`packages/render/src/buildgen/mesher/`，不 import three）
1. **`recipes/storeyed.ts`**（2–3 层）：调用 r1 的屋身部件出**无顶**的首层 hall → 首层柱头处 `parts/pent-eave.ts` 腰檐（出挑 700–900、坡 0.45，腰檐底 ≥ 2400）→ 楼板（厚 150–200）→ `parts/balcony.ts` 前檐平座栏杆（栏杆顶 ≥ 950，寻杖 + 望柱 + 栏板）→ 上层格扇墙（层高按套件 `upperStorey`，客栈二层 2700）→ 调 r2 / r3 的屋顶分派出上层屋顶。**首层天花以上的全部顶点进屋顶缓冲**（含楼板、上层墙、上层门窗、平座）。
2. **`recipes/stall.ts`**：四根 100 mm 柱 + `parts/awning.ts` 布棚（垂度 = 跨的 3%，下沿 ≥ 2250）或小悬山（由 archetype 的 `roof` 字段决定）；前柜台 850 高、带货物占位块；**不出墙**；按方案 `enterable = false`、`floors = []` 处理（INV-3 / INV-4 对其不适用，但 INV-1 / INV-5 仍适用）；摊主站位来自方案 `fixtures`（站位编号 ≥ 200），网格器不画人。
3. **配方注册**：把 `storeyed` / `stall` 接入 r0 的配方注册表（只替换这两个桩）。

## 测试（`packages/render/src/buildgen/__tests__/storeyed.test.ts`，node 项目）
命名用例：
- 客栈 10×8 两层歇山（迷你方案或 p2 夹具，以工作区现有为准）× 4 偏航 × LOD0 / LOD1：INV-1、2、3、4、5 无诊断；滴水 = 6130 ±10、脊 = 8547 ±10（台基顶以上）。
- 首层天花以上：外壳缓冲中没有 y > 首层天花 + 10 mm 的顶点（全部在屋顶缓冲）。
- 腰檐底 ≥ 2400（离首层地面）；栏杆顶 ≥ 950（离楼板面）；布棚下沿 ≥ 2250。
- 摊位：无墙三角（外壳缓冲中没有立面掩码为墙的大面）；柜台高 850 ±5；`floors = []` 时不报 INV-3。
- 三角数在 tech/16 §6.5 预算内（两层店 5,000 / 2,400、客栈 6,500 / 3,000、摊 600 / 300，报告列实测）；同输入哈希稳定。

## 约束
- 只写：`packages/render/src/buildgen/mesher/recipes/{storeyed,stall}.ts`、`packages/render/src/buildgen/mesher/parts/{balcony,pent-eave,awning}.ts`、`packages/render/src/buildgen/mesher/recipes/index.ts`（只改这两个配方的注册行）、`packages/render/src/buildgen/__tests__/storeyed.test.ts` 与本任务报告。
- 不改 r1 的部件（`parts/{platform,steps,columns,beams,walls,frames,brackets,dressing}.ts`）与 `recipes/hall.ts`、不改屋顶实现（`roof/**`）、不改 `core/**`；需要的扩展只加可选参数并在报告说明，且不得改变 hall 现有测试结果。
- 不 import three；不新增依赖；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r4-storeyed-stall.md`（≤ 50 行）：第 3 节列客栈 / 两层店 / 摊位的实测（滴水、脊、腰檐底、栏杆、三角数）；第 7 节写给 r9（屋顶批包含哪些部件、淡出时上层整体消失）与 r6（院落正房复用 storeyed 的方式）的交接。
