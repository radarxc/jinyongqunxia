# 本任务：城镇探索 v2 · P1 · 平台输入层 `@tianshu/platform/input`（键盘按住 / 按键沿、滚轮归一、捏合、点按 vs 拖动）

**第一个动作**：打开 `packages/platform/src/input/index.ts`（现为 7 行未用的桩）与 `docs/tech/15-town-explore-v2-spec.md` §6.1，通读后直接动手；不要先写计划，改完一处就跑对应测试。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/01-architecture.md` §6.5（输入分层：DOM → `platform/input` → `apps/game` ActionMap）。

## 背景
作者 AR-114（2026-10-10）：「缩放要支持键盘快捷键」「右上方应该提供小地图，点击小地图可以自动寻路」。城镇 v2 需要统一的输入层：现在 App.vue、TownPage、RegionPage、BattleField 各自监听 `keydown`，没有按住键状态、没有滚轮 / 捏合缩放。本任务只做**平台层原语**（无玩法、无 Vue）；上层的 ActionMap 与 ZoomController 是下一个任务（ENG-town2-actionmap）。

## 要做的事
1. 新子路径 `@tianshu/platform/input`：在 `packages/platform/package.json` 的 `exports` 加 `"./input": "./src/input/index.ts"`；根入口 `"."` 不变（不要把输入层拉进带 Dexie 的根入口）。
2. `packages/platform/src/input/` 下实现（可拆多个文件，单文件 ≤ 400 行）：
   - **键盘状态** `createKeyboardState(target: Pick<Window,'addEventListener'|'removeEventListener'>, doc?: Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'>)`：按 `event.code` 记按住的键（`isDown(code)`、`downCodes()` 只读视图）；发出按键沿事件 `{ code, key, down: boolean, repeat, shift, ctrl, alt, meta, composing, editableTarget }`（`editableTarget` = 目标在 `input / textarea / select / [contenteditable]` 内；`composing` = `event.isComposing || keyCode === 229`）；窗口 `blur` 与 `visibilitychange` 变 hidden 时释放全部按住键并为每个发 `down:false`；`dispose()` 移除所有监听且可重复调用。
   - **滚轮归一** `normalizeWheel(e: { deltaX, deltaY, deltaMode }, lineHeightPx = 16, pageHeightPx = 800): { dx: number; dy: number }`：`deltaMode` 0 像素、1 行、2 页统一成像素。
   - **指针手势** `createPointerGestures(el, opts)`：只用 Pointer Events；识别**点按**（≤ 250 ms 且位移 ≤ 10 px）与**拖动**；两指识别**捏合**，回调 `onPinch({ scale, centerX, centerY })`（scale = 当前两指距 / 起始两指距）；`touch-action` 不在这里设（由页面 CSS 决定）；`dispose()` 幂等。
   - 所有回调与事件对象在稳态下不得每次新建大对象数组；可复用一个预分配事件对象（文档里写明"回调返回后对象会被复用"）。
3. 保留现有 `InputPoint` / `InputPort` 导出（或标 `@deprecated` 但不删），不破坏现有引用（先 `git grep -n "InputPort\|InputPoint"` 确认）。
4. 测试 `packages/platform/src/input/*.test.ts`（Node 环境，用最小假 `EventTarget` 对象，不引 jsdom）≥ 12 个命名用例，至少覆盖：按 code 记按住；`repeat` 不产生重复 down；Shift / Ctrl / Alt / Meta 标记；可编辑目标标记；输入法组字标记（含 keyCode 229）；`blur` 释放全部；`visibilitychange` hidden 释放全部；`deltaMode` 0 / 1 / 2；捏合比例；点按 vs 拖动（时间与位移两条边界各一例）；`dispose()` 后不再派发且可重复调用。

## 约束
- 只写：`packages/platform/src/input/**`、`packages/platform/package.json`（只加一行 export）与本任务报告。
- 不新增依赖；工具链以根 `package.json` 为准（`pnpm@9.15.9`、Node ≥ 22.12）——`_code.md` 里的 Node 24 / pnpm 12 / fast-check 不适用；需要随机用例时在测试内用固定种子的 mulberry32。
- 不改门禁阈值；不加"高负载跳过"。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/platform test`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-input-port.md`（≤ 60 行）：第 2 节文件树与测试数；第 3 节 API 签名与事件对象复用约定；第 7 节写给 ENG-town2-actionmap 的交接（如何订阅、按住键查询、滚轮 / 捏合接入方式）。
