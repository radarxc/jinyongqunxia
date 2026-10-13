# 本任务：城镇小地图改版（AR-117）——微缩城镇图底图 + 关键建筑标记 + 竖直缩放条 + 司南示南北

**第一个动作**：读 `docs/decisions/author-requirements.md` 的 AR-117 全文与 AR-114 第 4 条、`tools/agents/reports/ENG-town2-v1-minimap.md`（现有小地图怎么接的：`apps/game/src/explore/v1-minimap.ts`、`TownPage.vue` 里的装配、`ZoomController`）、`tools/agents/reports/ENG-town2-txminimap.md`（`TxMinimap` 组件与 `packages/ui/src/explore/minimap-{math,painter}.ts`）、`tools/agents/reports/ENG-town2-chunks.md`（`apps/game/build/town-assets.ts` 素材发布插件），再打开 `assets/default/baseline/town/town_dali__ch01.{preview.png,preview.render.json,layout.yaml,overlay.svg}`、`content/town/facilities/city_dali__ch01.yaml`、`content/locales/zh-Hans/town-facilities.yaml` 与 `packages/render/src/town/projection.ts`（`planningToTownPixels` 等）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/ui/CLAUDE.md`（若有）。

## 背景
作者 AR-117（2026-10-11，逐字）：「这个太丑了，参考逆水寒给一个微缩小地图（标记关键建筑）而不是抽象图。缩放给一个竖直的bar，南北用司南或者指北针的形象来表达」。现在右上小地图是按格子类型涂色块的抽象栅格，左右四个圆钮（+ / − / M / 北）。改成：**小地图就是城镇本身的缩影**（基线整城成图，45° 斜视、与游戏内城镇同一批手绘素材；基线清单状态为 candidate），上面标关键建筑和主角；缩放改成小地图旁的竖直滑杆；南北用**司南**（青铜方盘上一柄勺，勺柄指南）表示。

## 要做的事

1. **离线派生小地图图与元数据** `tools/town/make_minimap.py`（Pillow，确定性；Python 测试 `tools/town/tests/test_make_minimap.py`，`python3 -m unittest`）：
   - 对有作者基线成图的城镇（现有 `town_dali__ch01`、`town_hangzhou__ch02`；基线名 `town_<x>__chNN` ↔ 布局键 `city_<x>__chNN`），读 `assets/default/baseline/town/<town>.preview.png`（0.25 缩放）与同名 `.preview.render.json`（`scale`、`top_padding_master_px`、`size_px`），输出 `assets/default/town-minimap/<layoutKey>.webp`（尺寸与预览图相同，WebP 质量 80–85，两次运行逐字节相同；Pillow 的 WebP 编码若不确定，固定 `method` / `quality` 并在测试里断言 sha 稳定）。
   - 同时输出 `assets/default/town-minimap/<layoutKey>.json`（`schemaVersion: town-minimap.v1`）：`image {file,width,height}`、`transform {scale, topPaddingPx（=master 值 × scale）, gridWidth, gridHeight, tileWidthPx: 64, tileHeightPx: 32}`（与 `planningToTownPixels()` 同一套公式：图像像素 = (planningToTownPixels(x, z, gridHeight) + [0, topPaddingMaster]) × scale，取格心）、`south: [dx, dy]`（世界正南在图像里的单位方向，由布局坐标约定算出；在报告里写清依据，并用布局里的南门 / 南侧服务区做测试佐证）、`markers[]`：`{ id, kind: 'shop'|'inn'|'temple'|'pagoda'|'gate'|'office', glyph（单字：药 杂 客 铁 衣 马 食 寺 塔 门 衙）, name（中文店名 / 地名，来自 `content/locales/zh-Hans/town-facilities.yaml`；寺塔、城门用布局类型推出的通名，如「崇圣寺」「千寻塔」「南门」——能从布局 / 设施内容确定的才写专名，否则写通名，不编造）, buildingId?, px: [x, y]（建筑占地中心的图像像素）, entrance?: [x, y]（入口格的图像像素，点击时寻路用）}`。设施来自 `content/town/facilities/<layoutKey>.yaml`（`buildingId` → 布局建筑），寺塔 / 衙署 / 城门来自基线 `layout.yaml` 的建筑类型（`bld_lm_*pagoda*`、`*temple_hall*`、`*shrine*`、`*yamen*`、城门 / 出口格）。
   - 写 / 更新 `assets/default/town-minimap/manifest.yaml`（字段按 `assets/README.md`；`status: candidate`；来源写「派生自 baseline/town/<town>.preview.png（基线，状态 candidate；AR-117）」与生成命令）。
   - 测试：逐字节确定；对基线 `overlay.svg` 里至少 3 栋建筑（含药铺所在建筑与千寻塔），`markers[].px` 落在该建筑在 overlay 里的轮廓（按 scale 缩放后）内；`south` 与南门方位差 ≤ 30°；名字全部来自 locale 或布局，不出现「店铺」这类兜底通称（设施有 locale 名时）。

2. **发布**：扩展 `apps/game/build/town-assets.ts`（+ 测试），按 `assets/default/town-minimap/manifest.yaml` 把非 rejected 条目（`.webp` 与 `.json`）复制到 `apps/game/public/assets/default/town-minimap/`，不进 PWA 预缓存（进城时按需加载）；不改 `asset-manifest.ts`。

3. **运行时适配** `apps/game/src/explore/v1-minimap.ts`（+ 测试）：按当前城镇布局键加载 `town-minimap.v1`（缺图的城镇回落到现有抽象栅格，开发态 `console.warn` 一次）；纯函数把 v1 城镇格（`TownPoint`）换算成小地图图像像素（与离线同一公式，测试与离线 `markers[].px` 对拍 ±1 px）；视野四边形、路径、终点同样换算；点小地图空白处 → 反算格 → `town/move`（core 判可达）；点标记 → 走到 `entrance`。

4. **组件** `packages/ui/src/components/explore/TxMinimap.vue`（+ strings、测试）与新组件 `TxSinan.vue`（+ 测试），`packages/ui/src/explore/minimap-{math,painter}.ts` 按需改：
   - **底图**：图像底图（新 prop，与旧栅格二选一）；圆盘裁切，桌面直径 200 px、窄屏（≤ 844 px 宽）132 px；以主角为中心取图；画缩影时开平滑缩放；盘边一圈柔和墨晕（径向渐变压暗边缘，**不要黑底、不要粗框**，AR-48），外沿一道 2 px 古铜细线（如 `#a88a52` 85%）加 1 px 亮内线。
   - **比例**：小地图显示比例随主画面缩放联动：`小地图 px/m = clamp(主画面 px/m ÷ 16, 2.5, 7)`（主画面 80 px/m 时约 5 px/m，200 px 圆盘看约 40 m）；缩影图自身是 `64 × scale` px/格，按需缩放绘制。
   - **关键建筑标记**：每个标记一个 18 px 圆形徽记——宣纸底、毛笔字 `glyph`、按类别着色的细圈（店铺赭石、客栈石青、寺塔朱砂、城门 / 衙署浓墨）；离主角最近的 3 个、悬停 / 键盘聚焦的那个、当前目的地，在徽记旁显示店名小签（墨字、半透明宣纸底）；其余只显示徽记。主角箭头保留（朱砂色、白描边），NPC 只画任务相关的小点。
   - **竖直缩放条**（取代 + / − 圆钮）：贴在圆盘右侧，轨道高约 120 px、宽 4 px（古铜色），顶端「＋」、底端「－」（各自点击区 ≥ 44 px，触屏 ≥ 60 px），中间一颗可拖动的玉珠（14 px）；48 / 64 / 80 / 96 四档画短刻度，拖动在 40–112 px/m 间连续；`role="slider"` + `aria-valuemin=40` / `aria-valuemax=112` / `aria-valuenow`，方向键可调；`=` / `-` / `0`、滚轮、捏合、竖条拖动全部经同一个 `ZoomController`，玉珠位置实时反映当前缩放。
   - **司南** `TxSinan.vue`（取代「北」字圆钮）：约 40 px 的内联 SVG——方形青铜地盘（古铜渐变 + 少量铜绿斑、四角内倒角、外框一圈 24 向短刻线）、中心圆形天盘凹槽、盘中一柄勺（圆勺身 + 细长勺柄，勺柄指向**南**，勺身略带高光）；整个司南随镜头转，使勺柄始终指向小地图上的正南（用 `south` 向量 + 当前镜头基向量算角度）；`title` / `aria-label` 写「司南：勺柄指南」；点击切换「上北下南」（`minimapNorthUp`），开启时缩影整体旋转到北朝上、司南勺柄朝下。放在圆盘左上外沿、压住环线一点。
   - **全城图（M）**：保留 M 键与一个小的朱砂印章式方钮（「图」字），展开后显示整张缩影（适配窗口，北朝上按设置），全部标记带名字，图例与设施列表（列表项用真实店名），点击列表或标记寻路，Esc 关闭；世界 tick 暂停逻辑沿用 `area-map-control`。
   - 新文案进 `TxMinimap.strings.ts` / `TxSinan.strings.ts`；颜色用主题变量（缺的在组件内用 CSS 变量定义默认值）。

5. **装配** `apps/game/src/pages/TownPage.vue`：换成图像底图与新事件（缩放条、司南），删掉抽象栅格在有缩影图时的生成（`scheduleMinimapCanvas` 只在缺图时用）；其余页面行为不动（模拟店铺、侧栏、交互条留给 ENG-town2-v1-page）。

## 测试（命名用例，app 测试在根 node 项目、文件首行 `// @vitest-environment happy-dom`；ui 用 `--project ui`）
- 离线：逐字节确定；标记落在 overlay 轮廓内；`south` 与南门方位一致；名字来源正确。
- 运行时换算：格 → 像素与离线 `markers[].px` 对拍 ±1 px；点空白反算的格与点击位置对拍；缺图回落栅格。
- 组件：竖条拖动 / 方向键 / 点 ± 发出缩放；外部缩放变化后玉珠位置更新；`aria-valuenow` 正确；司南角度 = 南向量在当前基下的角度（四个偏航各一例）；切换上北下南时缩影旋转、司南随之；最近 3 个标记显示名字；全城图显示全部名字。
- 不新增依赖；不改 `asset-manifest.ts`、`App.vue`、`session*.ts`、`WorldMapPage.vue`、`worldmap/**`；不改 `assets/default/baseline/**` 与其他既有素材（只新增 `assets/default/town-minimap/**`）。

## 约束
- 只写：`tools/town/make_minimap.py`、`tools/town/tests/test_make_minimap.py`、`assets/default/town-minimap/**`、`apps/game/build/town-assets.ts`（+ `town-assets.test.ts`）、`apps/game/src/explore/**`、`apps/game/src/pages/TownPage.vue`、`packages/ui/src/components/explore/{TxMinimap,TxSinan}.*`、`packages/ui/src/explore/**` 与本任务报告。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `python3 tools/town/make_minimap.py --check`（产物与提交的一致）与 `python3 -m unittest discover -s tools/town/tests -p 'test_make_minimap.py'`
- `pnpm exec vitest run apps/game/src/explore apps/game/build --config vitest.config.ts --project node`
- `pnpm exec vitest run packages/ui/src/components/explore packages/ui/src/explore --config vitest.config.ts --project ui`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-minimap-art.md`（≤ 60 行）：第 3 节写缩影图尺寸 / 体积、比例公式、`south` 依据与数值、每城标记清单（类别、字、名、来源）、缩放条与司南的交互；第 4 节列（原创扩展）名字与待作者定的观感点；第 7 节写给协调者的 5173 手检步骤（进大理城 → 看小地图缩影与标记 → 拖竖条 → 点司南 → M 全城图 → 点药铺标记寻路）与给 ENG-town2-v1-page 的交接。
