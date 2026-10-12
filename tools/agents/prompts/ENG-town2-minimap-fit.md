# 本任务：小地图缩影改用缩影图自身投影（不拉伸、不剪切）+ 全城图适配与标签避让 + 高清屏（AR-117 返修）

**第一个动作**：读 `docs/decisions/author-requirements.md` 的 AR-117 全文、`tools/agents/reports/ENG-town2-minimap-art.md`，再读 `packages/ui/src/components/explore/{TxMinimap,TxSinan}.vue` 及其 strings / 测试、`packages/ui/src/explore/{minimap-math,minimap-painter,sinan-math}.ts` 及其测试；只读参考 `apps/game/src/explore/v1-minimap.ts`（`v1WorldToImageMatrix`、`createV1CameraBasis`）与 `apps/game/src/pages/TownPage.vue`（TxMinimap 怎么装配）。读完直接动手，不要先写计划。

作者 AR-117（2026-10-11，逐字）：「这个太丑了，参考逆水寒给一个微缩小地图（标记关键建筑）而不是抽象图。缩放给一个竖直的bar，南北用司南或者指北针的形象来表达」。ENG-town2-minimap-art 已把缩影图、标记、竖直缩放条、司南做进来并合入。协调者 2026-10-12 在 5173（大理，桌面 1280×800、devicePixelRatio 2）实测发现下面的问题，本任务修掉。

## 实测问题（协调者 5173 实测）

1. **跟镜头模式缩影被纵向拉长 2 倍**：小地图按「俯视地面」投影（`view.basis` = 镜头地面基向量，世界 → 小地图是正交旋转），但缩影图本身是 2:1 斜视投影（图像像素 = `[32s, −32s; 16s, 16s]·[x; z] + 偏移`，见 `v1WorldToImageMatrix`）。两者合成后整张画纵向放大 2 倍：城墙在原图里是 26.57° 的斜线，小地图上变成 45°，房子都被拉高。
2. **上北下南模式把画剪切变形**：同一原因，合成变换成了非均匀剪切，千寻塔被拉成一道长斜线。
3. **全城图（M）**：缩影在大圆盘里只占不到一半直径，四周大片空白；标签互相压盖（南门一带「白布衣肆 / 太和铁作 / 洱风客舍 / 南门杂货 / 苍山药肆」叠成一团）；App 顶栏（时辰 · 地点 · 银两）压住全城图上沿。
4. **高清屏发虚**：两层 canvas 的后备像素都是 200×200，CSS 宽 196 px，DPR 2 下只有一半分辨率。
5. **文案不符**：竖条两端按钮的 aria-label 是「放大小地图 / 缩小小地图」，实际调的是主画面缩放（滑杆本身叫「主画面缩放」）。
6. **控制台警告**：`.zoom-slider` 的 `appearance: slider-vertical` 触发 Chrome 弃用警告（「not standardized … Use writing-mode: vertical-lr; direction: rtl」）。

## 协调者裁定（必须照做；审核以此为准）

- **R1 缩影图模式 = 主画面的缩小版。** 有缩影图（`base.worldToImage` 存在）时，世界 → 小地图用缩影图自己的线性部分做等比缩放：`view.basis = [a, c, −b, −d] / √(a² + c²)`（`[a, b, c, d]` 取自 `worldToImage` 前四项，含义见 `MinimapBase` 注释；`metresPerPx` 仍表示屏幕横向 1 px 对应的地面米数，比例规则 `clamp(主画面 px/m ÷ 16, 2.5, 7)` 不变）。这样 `drawMinimapBase` 合成出来的是相似变换，缩影图按原样等比绘制。主角箭头、路径、终点、视野框、标记、悬停距离、点击反算全部走同一个 `view`（`worldToMinimap` / `minimapToWorld` 已用行列式求逆，支持非正交基）。视野框在小地图上应是与主画面同宽高比的正矩形。缩影图模式下小地图不随镜头偏航转（v1 城镇镜头固定 45°，与缩影图视角一致）。
- **R2 缩影图模式不做「上北下南」。** 斜视画无法在不变形的前提下转成北朝上；作者要求南北用司南表达。缩影图模式下忽略 `northUp`（两种取值绘制结果相同）；司南按缩影图的 `south` 向量在当前 `view` 基下的方向指南（勺柄方向 = 元数据 `south` 方向，误差 ≤ 1°）。缩影图模式下司南不是开关：不发 `toggle`、不带 `aria-pressed`，`title` / `aria-label` 写「司南：勺柄指南（缩影按镜头视角绘制）」。缺图回落到抽象栅格时，现有开关与 `northUp` 旋转行为保持不变。
- **R3 全城图改为按图适配。** 缩影图模式下全城图用圆角矩形框（不是圆盘），缩影按 contain 放进可用区（宽 = 视口宽 − 右侧图例 / 设施栏 − 留白，高 = 视口高 − 顶部让位 − 留白），整张缩影完整可见，受限那一边至少占满可用区的 92%，不旋转。画布可以是长方形：`sizePx` 拆成宽高，或只在全城图模式下用宽高两个值。抽象栅格模式的全城图维持现状。
- **R4 标签避让。** 全城图里所有标记都参与，小地图（未展开）里只有最近 3 个、悬停 / 聚焦的那个和当前目的地参与。按优先级贪心放置：目的地 > 悬停 / 聚焦 > 店铺 / 客栈 > 衙署 / 城门 > 寺塔。每个标签依次试徽记右、左、上、下四个位置，和已放好的标签或任一徽记的矩形相交就换下一个位置；四处都冲突就只留徽记（名字仍在设施列表和悬停提示里）。放置结果只在标记、视图或尺寸变化时重算，不要每帧分配。
- **R5 全城图不被顶栏遮挡。** 二选一，并写进报告：
  - 展开层整体让到顶栏下方：上边距用 CSS 变量 `--tx-hud-top-inset`，默认桌面 112 px、窄屏（≤ 844 px）84 px；
  - 或用更高层级盖住顶栏（在组件内用 `<Teleport to="body">` 或同等做法，Esc / 关闭按钮照常）。

  两种做法都不改 `App.vue` / `style.css`。
- **R6 高清屏。** 两层 canvas 的后备像素 = CSS 尺寸 × min(devicePixelRatio, 2)，绘制时按同一倍率缩放；点击 / 悬停换算用 CSS 像素；倍率变化（窗口拖到另一块屏）时重建。
- **R7 文案与样式。**
  - 竖条两端按钮的 aria-label / title 改为「放大主画面」「缩小主画面」。
  - 去掉 `appearance: slider-vertical`，只用 `writing-mode: vertical-lr; direction: rtl`。
  - 司南、缩放条、「图」字钮的位置和外观不变。
- **R8 公开接口不变。** `TxMinimap` 的 props / emits 名称与类型保持不变：ENG-town2-v1-page 正在并行改 `TownPage.vue` 的装配，依赖这些接口。`TxSinan` 可以加可选 prop（如 `interactive?: boolean`，默认 true）。

## 测试（命名用例；ui 用 `--project ui`）

- 缩影图模式下 `drawMinimapBase` 的 `setTransform` 是相似变换：a = d、b = −c，误差 ≤ 1e-6。大理、临安两套元数据（`assets/default/town-minimap/*.json` 的 `transform`）各一例。
- 缩影图模式下，世界里沿城墙方向（图像 2:1 斜线）的线段投影到小地图后仍是 26.57° ± 0.5°。
- 缩影图模式下 `worldToMinimap` / `minimapToWorld` 往返：随机 100 点，误差 ≤ 1e-4 m。
- 缩影图模式下视野框四角投影后构成轴对齐矩形。
- 缩影图模式下 `northUp` 为 true 和 false 时绘制变换相同；抽象栅格模式 `northUp` 仍旋转（保留现有断言）。
- 司南：
  - 缩影图模式下勺柄角 = `atan2(south)`，误差 ±1°，点击不发 `toggle`；
  - 抽象栅格模式四个偏航各一例，保持现有断言。
- 全城图：
  - contain 适配，受限边占可用区 ≥ 92%；
  - 大理 16 个标记的已显示标签两两不相交；
  - 被挤掉名字的标记，名字仍在设施列表里。
- DPR：devicePixelRatio = 2 时 `canvas.width` = 2 × CSS 宽，点击换算仍落在正确的世界点。
- 文案：竖条两端按钮的 aria-label。

## 约束

- 只写：
  - `packages/ui/src/components/explore/TxMinimap.vue`、`TxMinimap.strings.ts`、`TxMinimap.test.ts`；
  - `packages/ui/src/components/explore/TxSinan.vue`、`TxSinan.strings.ts`、`TxSinan.test.ts`；
  - `packages/ui/src/explore/**`；
  - 本任务报告。
- 不改：
  - `apps/game/**`（ENG-town2-v1-page 并行在改）；
  - `App.vue`、`style.css`；
  - 任何素材。
- 不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/ui/src/components/explore packages/ui/src/explore --config vitest.config.ts --project ui`
- `pnpm exec vitest run apps/game/src/explore --config vitest.config.ts --project node`（确认 app 侧小地图测试不受影响）
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告

写 `tools/agents/reports/ENG-town2-minimap-fit.md`（≤ 50 行）：

- 第 3 节：
  - 缩影图模式的基向量公式与大理实际数值；
  - R5 选了哪种；
  - 标签避让规则与大理全城图被挤掉名字的标记清单；
  - DPR 处理。
- 第 7 节：
  - 给协调者的 5173 手检步骤：进大理城 → 小地图缩影比例与主画面一致 → 点司南（缩影图模式不切换）→ M 全城图完整、标签不压盖、不被顶栏遮 → 点药铺标记寻路；
  - 给 ENG-town2-explore-page 的交接：v2 俯视底图走原俯视基向量与 `northUp`。
