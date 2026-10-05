# 本任务：游戏工程 · 区域探索 B（渲染与页面）：RegionMap 地形分块渲染、角色行走、锚点交互与场景页

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-20a-region-core.md`（投影、查询与命令，第 7 节交给本任务的接口必须照做）、`ENG-09-town-scene.md`（城镇渲染与页面的做法）、`ENG-21a-camera-daynight.md`（镜头与朝向模块、昼夜色调）、`ENG-21b-recovery-quality.md`（上下文守卫、质量分档、高亮通道）、`ENG-19a-ui-shell.md`（页面外壳与路由）、`ENG-12-rig-walk.md`。

## 为什么做

ENG-20a 让 core 能挂载 RegionMap、行走、交互。本任务把它画出来，并给玩家一个能走的场景页。序章与白马冷入口的探索都靠这一页。

## 规格（照这些写，不自创）

- `docs/tech/02-rendering.md`：
  - §2.1 地形网格按 pointy-top 六角生成；§2.2 分块与流式构建；
  - §2.3 地形材质：纹理数组加索引图 splat，素材未到时用同尺寸占位；
  - §2.4 静态物件：`occluder` / `castShadow` / `roof` / `fadeGroup`；
  - §1.5 旋转：按 `CameraHint` 决定能否旋转；§8.8 上下文丢失恢复。
- `docs/design/14-ui-ux-mobile.md` §6.1 六角选格、吸附与镜头；§1.6 键鼠映射。
- `docs/design/11-open-world.md` §1.2–§1.3 场景规模。

## 要做的事

1. **渲染**（新建 `packages/render/src/region/`）：
   - 按 RegionMap 分块生成地形网格；地形材质按 `tr_*` 类别用占位色或占位纹理，正式素材到位后不改代码；
   - 高度、斜坡；deco 遮挡与淡出；
   - 角色用 rig，NPC 与锚点标记；
   - 镜头复用 ENG-21a 的模块，`CameraHint` 不许旋转时固定 45°；
   - 上下文守卫与 DPR 取 ENG-21b 的接口。
2. **拾取**：点格 → `world/walkTo`，点锚点 → `world/interact`。路径与可交互范围只用 ENG-20a 的查询，render 不算规则。
3. **场景页**（`apps/game/src/pages/RegionPage.vue`）：
   - 挂载与卸载照 `BattleField.vue`：每次 `await` 后检查已卸载，`dispose` 时 `forceContextLoss`；
   - 软锁门、出口、自动存档等提示；
   - 进出场景接 ENG-19a 的外壳路由，`App.vue` 改动 ≤ 10 行。
4. **性能**：每帧零分配；记录序章最大场景（约 20×18）与白马 48×32 场景的 draw call 与帧时间（Node 下用 mock 渲染器数 drawable），写进报告。
5. **测试**：
   - 分块网格生成与地形映射（mock three）；
   - 拾取到命令的映射；
   - 页面挂载未完成即卸载的释放；
   - 镜头旋转开关遵守 `CameraHint`。

约束：
- 写集：`packages/render/src/region/**`、`packages/render/src/index.ts`、`packages/render/package.json`（只加 `./region` 导出）、`packages/render/CLAUDE.md`、`apps/game/src/pages/RegionPage.vue`、`apps/game/src/region/**`（新）、`apps/game/src/App.vue`（≤ 10 行）、`packages/ui/src/i18n-flow.ts`。写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`、`packages/render/src/{rig,town,battle,worldmap,camera,lighting,quality}/**`（只引用）、`apps/game/build/**`。
- render 不算规则，不依赖 core 与 platform；每次写入 ≤ 150 行；不加依赖；保持 render 懒加载 chunk，`pnpm size` 不超。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

浏览器里的帧率与手感记「待实测」：沙箱拦 Chromium，由开发监督在沙箱外跑。

## 报告

第 7 节写：
- 分块与材质方案；
- draw call 与帧时间；
- 页面状态机；
- 测试；
- 交给 CONTENT-ch00b / ch10（地图里哪些属性影响画面）、ENG-24（冒烟要用的选择器）的接口。

报告 ≤ 80 行。
