# ENG-town2-actionmap 报告 · 城镇探索 v2 · P1 · 应用输入映射 ActionMap + 缩放控制器 ZoomController（缩放快捷键）
## 1. 摘要（3–6 行）
新增应用 ActionMap：平台键盘边沿 → 固定优先级语境 → 语义动作，并提供 Vue 生命周期接入。
新增统一 ZoomController，键盘档位与滚轮/捏合连续值共用一个订阅源。
App 全局 C/B/K/J/M/Esc/反引号已迁入 global 语境，页面行为保持不变。
返修补齐移动边沿去重、带修饰键释放归零，以及镜头旋转后的强制重发入口。
第 3–7 轮审核后的返修由协调者按 AR-110 完成：移动只记 ActionMap 接受过的键、去重绑定 explore 注册项、被遮盖 / 出栈 / 停用即停步；捏合改为显式手势（ZoomController `pinchStart/pinchEnd` + 平台 `onPinchStart/onPinchEnd`）。
定向 3 文件 75 用例、平台输入 3 文件 19 用例与全仓 210 文件 / 1653 用例 全部通过。

## 2. 产出（文件、行数、主要章节）
- apps/game/src/input/action-map.ts（366 行）：动作类型、语境栈、键表、去重按住向量/reemitMove、六向换算、带启停守卫的平台端口连接、useActionContext。
- apps/game/src/input/zoom.ts（111 行）：px/m 值、档位/连续缩放、显式捏合手势、语境默认、订阅。
- packages/platform/src/input/pointer.ts（180 行）：捏合识别新增可选 `onPinchStart` / `onPinchEnd` 回调（纯增量，`PinchGesture` 形状不变）；pointer.test.ts 增 1 例。
- apps/game/src/input/{action-map,zoom}.test.ts（587/69 行）：70 个专项用例；app-flow.test.ts（179 行）：5 个流程用例，覆盖全局键保持、战斗独占与按住 W 进战斗即停步。
- apps/game/src/App.vue：移除自有 keydown 规则，根部装配/释放平台键盘与 ActionMap，并以场景守卫隔离战斗。
- pnpm install --frozen-lockfile：通过，8 workspace，锁文件已是最新且未变。
- 定向命令：通过，3 文件 / 75 用例；平台输入 3 文件 / 19 用例；pnpm check：通过，210 文件 / 1653 用例、内容校验、包体与 dev-chunks（830 assets / 95 manifest）PASS，退出码 0。

## 3. 关键结论与数值
- 键表：=/Numpad+ 放大，-/Numpad- 缩小，0/Numpad0 复位；Q/E 旋转；WASD/方向键给屏幕向量；F/Space/Enter 交互；M 全城图；Esc 返回；C/B/K/J 与反引号为 global。
- 语境严格为 modal > dialogue > areaMap > explore > worldmap > global；同语境后注册者先处理，返回 false 才继续；dialogue 遮住 explore 时 F 不下穿。
- 战斗不加入该语境栈；App 连接守卫在 scene === 'battle' 时短路，C/B/K/J/M/反引号不触发全局动作且不 preventDefault，Q/E/Space/Escape 仍由 BattleField 独占。
- composing、可编辑目标、角色对话、交互按钮与已消费事件忽略；离散重复忽略；F5 和带 Ctrl/Meta/Alt 的缩放键不拦截。
- screenVectorToHexDir 沿用 region 的世界偏航：六向序号世界 yaw 为 [0,300,240,180,120,60]；4 偏航 × 8 屏幕方向表已锁定。
- 移动向量只由 ActionMap 接受过的键算出：按下时须 explore 在顶、无输入法组字 / 可编辑目标 / Ctrl·Meta·Alt；平台 `downCodes()` 只用来剔除丢了 keyup 的键，不会加入方向。已接受键的释放（即使在输入框上或带修饰键）照常生效。
- move 只在屏幕向量相对「当前顶层 explore 注册项」变化时发送；新挂载的 explore 有自己的基线。explore 被 modal / dialogue / areaMap / 更新的 explore 盖住、被出栈（先发零向量再失效）、键盘连接被释放、或场景切到战斗（App 在 `scene` 变为 battle 的当下调用 `actionMap.cancelMovement()`，不等下一次按键）时，立即给正在走的语境发一次零向量并清空已接受键；盖住 / 战斗期间按下或仍按着的键不会在之后自动恢复移动。旋转完成调用 reemitMove() 强制重发当前向量。
- 捏合：同一手势内 `pinch(scale)` 都相对 `pinchStart()` 时的倍率（1 → 1.25 → 1 → 0.8 得 80 / 100 / 80 / 64），`pinchEnd()` 结束；未显式开始时首个 `pinch` 隐式开始。
- 缩放单位为 1 m 参考方形投影宽 CSS px；档位 [48,64,80,96]，连续范围 [40,112]，街巷/室内默认 80/96；滚轮默认每 8 dy px 改 1 px/m。
- 一致处：实现 tech/01 §6.5、tech/15 §6.2–6.3，包含战斗场景完全停用；偏离处：为让捏合有明确手势边界，扩写集到 `packages/platform/src/input/pointer.ts`（纯增量回调，协调者批准）。

## 4. 开放问题（附默认值）
- 滚轮灵敏度上游未给数值；默认 dy/8 px/m，并保留在控制器内部常量供后续实走调校。
- 连续值低于 48 时再 stepOut()、高于 96 时再 stepIn() 默认保持原值；反向操作会回到最近档，避免把 40/112 伪装成键盘档位。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；未新增玩法事实或外部技术事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无文档修改；后续 ENG-town2-v1-page / ENG-town2-explore-page 按下节接口接入页面。

## 7. 自检与页面任务接入示例
- ✅ 写集合规；未改 TownPage/RegionPage/WorldMapPage/BattleField，未新增依赖，未执行改变仓库状态的 git 命令。
- ✅ 键位逐项、修饰键、输入法/输入框、优先级、移动去重/释放归零/旋转重发、六向：项目实际偏航 45/135/225/315 × 8 方向金样表（另与 `regionKeyboardTarget` 的 W/A/S/D 交叉对拍，并保留 0/90/180/270 补充表）、档位/夹取/复位/语境切换及 App 全局键均有断言。
- ✅ 第 6–7 轮回归：焦点在 `[role=dialog]` 内时 Esc 只到 modal / dialogue 语境的 `back`（无此类语境时照旧不落 global；焦点在对话框内的输入框 / 可编辑元素时 Esc 一律忽略），已接受方向键在对话框内松开照常停步。
- ✅ 第 4–5 轮回归：停步发给实际处理过非零向量的条目（上层 explore 无 `move` 或返回 false 时由下层接手，被 dialogue 盖住 / 出栈时下层收零向量）；移动中直接出栈（移动、零向量各一次）、移动中直接释放连接（无额外按键也收零向量）、按住 W 直接进战斗即停步且离开后不恢复（单元 + App 整页流程各一例）。
- ✅ 第 3 轮回归：输入框内 W+D 全程不派发（真实 downCodes）、已接受键在输入框上释放仍停步、盖住期间按下的键不混入、对话盖住即停步、旧 explore 卸载后新 explore 首个 W 照常派发、停用连接即停步；捏合往返与连续两次手势；平台每次捏合恰一对 start / end。
- ✅ App 根部 actionMap.connect(keyboardState, window, () => scene.value !== 'battle')；战斗中全局键不处理，Escape 仍能到达 BattleField 并取消移动模式。
- ✅ useActionContext('explore', { zoomIn: zoom.stepIn, zoomOut: zoom.stepOut, zoomReset: zoom.reset, move, interact, toggleAreaMap })；页面卸载自动出栈；镜头旋转完成后调用 actionMap.reemitMove()。
- ✅ const zoom = createZoomController(TOWN_ZOOM_OPTIONS); zoom.subscribe(px => scene.setZoomPx(px)); 滚轮先 normalizeWheel(e).dy → zoom.wheel(dy)，捏合：`createPointerGestures(canvas, { onPinchStart: () => zoom.pinchStart(), onPinch: g => zoom.pinch(g.scale), onPinchEnd: () => zoom.pinchEnd() })`。
- ✅ v2 场景统一走 setZoomPx(px)；v1 在后续新建 apps/game/src/explore/v1-zoom.ts 集中做 px/m → 旧 setZoom 倍率换算，页面与控制器不各写一套。
- ✅ 冻结安装、指定 vitest（3 文件 / 75 用例）、最终 pnpm check（210 文件 / 1653 用例）均退出 0；既有 localhost:3000 ECONNREFUSED 噪声不影响断言或退出码。
