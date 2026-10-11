# 本任务：城镇探索 v2 · P1 · 应用输入映射 ActionMap + 缩放控制器 ZoomController（含缩放快捷键）

**第一个动作**：读 `tools/agents/reports/ENG-town2-input-port.md` 第 7 节（平台输入层 API），再打开 `apps/game/src/App.vue` 搜 `function keyboard`（现有全局键 C / B / K / J / M / Esc / 反引号），然后读 `docs/tech/15-town-explore-v2-spec.md` §6.2–6.3；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（apps/game 只做装配，不做第二个规则层）、`docs/tech/01-architecture.md` §6.5。

## 背景
作者 AR-114（2026-10-10，逐字）：「缩放要支持键盘快捷键」。现在各页面各自监听 `keydown`（App.vue、TownPage、RegionPage、BattleField），城镇缩放只有滑杆、实际倍率还随窗口高度变。本任务建 tech/01 §6.5 规定的 ActionMap（按上下文栈把原始输入映射为语义动作）与统一的缩放控制器；各页面接入（城镇 v1 页、ExplorePage）是后续任务，本任务只迁 App.vue 的全局键并提供页面用的接入函数。

## 要做的事
1. `apps/game/src/input/action-map.ts`：
   - 上下文栈（优先级高在前）`modal > dialogue > areaMap > explore > worldmap > global`；`useActionContext(name, handlers)`（Vue 组合函数：挂载时压栈、卸载时出栈）；栈顶先处理，处理了就不再往下传。
   - 键位表严格按 tech/15 §6.2：`zoomIn`（`Equal`，允许 Shift 即 `+`；`NumpadAdd`）、`zoomOut`（`Minus`、`NumpadSubtract`）、`zoomReset`（`Digit0`、`Numpad0`）、`rotateLeft` / `rotateRight`（`KeyQ` / `KeyE`）、`move`（按住 `KeyW/A/S/D` 与方向键，给出屏幕向量）、`interact`（`KeyF`、`Space`、`Enter`）、`toggleAreaMap`（`KeyM`，仅 explore / areaMap 语境；其他语境保持现有 `m → journey`）、`back`（`Escape`）、页面键 `KeyC/B/K/J` 与开发台 `Backquote`（global）。
   - 规则：带 Ctrl / Meta / Alt 的缩放键**不拦截**（保留浏览器缩放）；`composing`、目标为可编辑元素时忽略；离散动作忽略按键重复；永不拦截 F5。
   - 屏幕向量 → 六向：`screenVectorToHexDir(vx, vy, cameraYawDeg)`（pointy-top 六向，与 `apps/game/src/region/presentation.ts` 的 `regionKeyboardTarget` 同一角度约定；那个函数保留不动）。
2. `apps/game/src/input/zoom.ts`：`createZoomController({ presets: [48, 64, 80, 96], min: 40, max: 112, defaults: { street: 80, interior: 96 } })`——单位是「1 m 参考方形投影宽（CSS px）」（tech/02 §1.4）；`stepIn()` / `stepOut()` 跳到下一档（当前值在两档之间时跳到相邻档）；`wheel(dyPx)` 与 `pinch(scale)` 在 [40, 112] 连续；`reset()` 回当前语境缺省；`setContext('street' | 'interior')` 切缺省（玩家手动缩放后保持，直到语境变化）；`subscribe(listener)` 单一订阅源，供键盘、滚轮、滑杆、按钮与场景 `setZoomPx()` 同步。
3. **App.vue**：把现有全局 `keyboard()` 迁到 ActionMap 的 `global` 语境，行为一字不变（C / B / K / J / M 切页、Esc 回旅程、反引号开发台）；在 App 根部挂一次 ActionMap 的 DOM 监听（经平台输入层），`onBeforeUnmount` 释放。不改 App.vue 其他部分。
4. 测试 `apps/game/src/input/*.test.ts`（node 项目，用假事件源）命名用例至少：键位表逐项；`Shift+=` 放大、`Ctrl+=` / `Meta+=` 不拦截；输入法组字与输入框内忽略；语境优先级（dialogue 压在 explore 上时 F 不触发交互）；档位跳转（含落在两档之间）、滚轮 / 捏合夹取 40–112、`reset` 回语境缺省、手动缩放后切语境再回缺省；`screenVectorToHexDir` 在 4 个偏航 × 8 个屏幕方向上的结果表；`app-flow.test.ts` 里现有全局键断言全部仍通过（可补用例，不得删改原断言）。

## 约束
- 只写：`apps/game/src/input/**`、`apps/game/src/App.vue`、`apps/game/src/app-flow.test.ts` 与本任务报告。不改 TownPage / RegionPage / WorldMapPage / BattleField（后续任务接入）。
- 不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src/input apps/game/src/app-flow.test.ts --config vitest.config.ts --project node`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-actionmap.md`（≤ 60 行）：第 3 节写键位表、语境栈与缩放档位规则；第 7 节写给页面任务的接入示例（`useActionContext('explore', …)`、`createZoomController` 与场景 `setZoom` / `setZoomPx` 的接法、v1 页面 px/m ↔ 旧倍率的换算放哪）。
