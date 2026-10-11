# ENG-town2-input-port 报告 · 城镇探索 v2 · P1 · 平台输入层 @tianshu/platform/input（按住键、按键沿、滚轮归一、捏合、点按 vs 拖动）

## 1. 摘要（3–6 行）
新增无玩法、无 Vue、无依赖的 `@tianshu/platform/input` 子路径，保留旧 `InputPoint` / `InputPort`。
键盘按物理 `code` 维护按住状态并发边沿；失焦、页面隐藏会逐键释放。
滚轮统一为 CSS px；Pointer Events 统一识别 tap、drag、双指 pinch，且不修改 `touch-action`。
输入专项 18/18、平台包 113/113 通过；挪到当前基点 `1a40799de` 后 `pnpm check` 全部通过（195 文件、1420 用例，包体 PASS）。

## 2. 产出（文件、行数、主要章节）
- `packages/platform/package.json`（28 行）：新增 `./input` export；根 `.` 映射未改。
- `src/input/index.ts`（11 行）：保留旧接口，导出 keyboard / pointer / wheel。
- `keyboard.ts` / `keyboard.test.ts`（139 / 127 行）：状态、边沿、批量释放、8 例。
- `pointer.ts` / `pointer.test.ts`（171 / 116 行）：tap / drag / pinch、捕获、幂等清理、7 例。
- `wheel.ts` / `wheel.test.ts`（22 / 19 行）：三种 `deltaMode`、3 例。
- `pnpm install --frozen-lockfile`：通过（8 个 workspace，lockfile 已是最新，2.1 s）。
- `pnpm --filter @tianshu/platform test`：通过，22 文件、113 用例；输入专项 3 文件、18 用例通过。
- `pnpm check`（基点 `1a40799de`，协调者 2026-10-11 09:4x 复跑）：通过，退出码 0；lint、typecheck、全仓测试 195 文件 / 1420 用例、内容校验、剧情编译、包体（session total 95.67 / 110 KiB PASS、dev-chunks PASS）。
- 输入专项定向复跑 `vitest run packages/platform/src/input`：3 文件、18 用例通过；`pnpm install --frozen-lockfile` 1.9 s。

## 3. 关键结论与数值
- `createKeyboardState(target, doc?) -> { isDown, downCodes, subscribe, dispose }`；重复 keydown 不重复发 down。
- 边沿为 `{code,key,down,repeat,shift,ctrl,alt,meta,composing,editableTarget}`；IME 判据为 `isComposing || keyCode===229`。
- `normalizeWheel(e, lineHeightPx=16, pageHeightPx=800) -> {dx,dy}`；mode 0/1/2 的倍率为 1/行高/页高。
- `createPointerGestures(el, {onTap,onDrag,onPinch})`；tap 为 `duration<=250 ms && distance<=10 px`，pinch `scale=current/start`。
- keyboard edge 及 tap / drag / pinch 载荷均预分配复用；回调返回后不得持有对象，需保留就复制字段。
- 技术事实已按 MDN 核实（访问 2026-10-11）：[WheelEvent](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent)、[Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)、[keydown/IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event)。

## 4. 开放问题（附默认值）
- drag 载荷未由上游规定；默认采用 `phase=start|move|end|cancel` 与逐事件 `dx/dy`，首个 start 的增量为起点至越界点。
- 本机 pnpm 为 9.15.1，低于仓库固定 9.15.9；默认不改工具链，冻结锁安装和本任务验证均通过。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现严格消费 tech/01 §6.5 与 tech/15 §6.1，不新增玩法规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无。（此前记录的 `sects[].name/siteName` 文本错配已由基点 `88c3b64b2` 解决，最终 `pnpm check` 通过。）

## 7. 自检与给 ENG-town2-actionmap 的交接
- ✅ 从 `@tianshu/platform/input` 导入；`keyboard.subscribe(edge => ...)` 只消费边沿，按住移动用 `keyboard.isDown(code)` / `downCodes()`。
- ✅ ActionMap 自行按 `composing`、`editableTarget`、修饰键、`repeat` 和语境过滤；平台层不做语义判断。
- ✅ wheel 监听中先 `normalizeWheel(event)` 再送 ZoomController；pinch 使用同一次手势的绝对 `scale` 与中心点。
- ✅ 页面 CSS 自行设置 `touch-action`；卸载时调用 keyboard / gestures 的幂等 `dispose()`。
- ✅ `git diff --check`、输入 18 例、平台 113 例通过；当前基点 `pnpm check` 全部通过（195 文件 / 1420 用例）。
