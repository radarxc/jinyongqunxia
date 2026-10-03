# 本任务：游戏工程 · 首次会话「基础内容」瘦身：worldMaps / assets / 章节 NPC 改为按章节懒加载叶片；素材键生成不依赖文件在不在（稀疏工作区与 _prod 量出同一体积）

"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。预算不放宽。

## 现状（开发监督 10-03 12:33 实测，只测未改）

ENG-size-session-gate（95b02a59）后，`pnpm size` 的首次会话闭包在 `_prod` 是 93.36 / 110 KiB（Worker 壳 2.33 + 会话静态闭包 65.33 + 虚拟基础内容 25.69）。`virtual:tianshu-content`（`apps/game/build/content-plugin.ts`）按顶层键 gzip：

| 键 | `_prod` 全量检出 | 任务稀疏工作区 | 说明 |
|---|---|---|---|
| worldMaps | 12.53 | 12.53 | 只有 `content/world/ch01`（天龙），M1 走 ch00 → ch10 用不到 |
| assets | 6.71（566 条：433 立绘、132 物品图标、1 地图） | 0.09（1 条） | `asset-manifest.ts` 的 `readAssetManifest` 逐张 `access()`，稀疏检出没有图片就跳过 → 两处量出的体积不同 |
| topology | 2.27 | 2.27 | 20 经脉 / 180 穴位 |
| npcs | 1.34 | 1.34 | 写死读 `content/chapters/ch01_tianlong/npcs` |
| factions | 1.34 | 1.34 | 99 个门派名 |
| skills | 1.25 | 1.25 | common/skills |

用到 assets 的只有三处：`projection.ts` / `runtime/session-projection.ts` 取 `ref_map_jianghu__<era>_base01`，`selectors/items.ts` 取背包物品图标，`selectors/characters.ts` 取当前 NPC 立绘。

## 要做的事

1. 基础内容只留与章节无关的部分（topology、factions、skills）；`worldMaps`、章节 NPC、`assets` 改成按章节的懒加载叶片（参照 ENG-18d 物品叶片与 ENG-entry-split 的做法：会话按当前书界 / 区域在首次需要时 `import()` 或从内容包读取），新游戏（ch00）与白马冷入口（ch10）都要能拿到各自的地图、NPC 与素材键。素材键按章节分组：该章能见到的 NPC 立绘、能获得的物品图标、该时代的地图；跨章共用的放一个小的共用组。
2. `readAssetManifest`：素材键只按 manifest 生成（`status` 不为 rejected），**不再依赖文件在不在**；复制素材到 `public` 的那一步仍检查文件、缺图照旧跳过并告警。这样稀疏工作区与 `_prod` 的体积一致。
3. 门禁与报告：`pnpm size` 的首次会话闭包目标 ≤ 80 KiB（门槛 110 不变）；在报告里给出改前 / 改后按键拆分表（全量检出口径）。
4. 行为不变：会话 hash 100 次一致、golden 终值不改；序章 → 初眠 → 白马的 M1 流程测试照过；缺章节叶片时的失败要可恢复（与 lazy-session 的 `*_SUBSYSTEM_UNAVAILABLE` 口径一致）。
5. 顺带：DEV「进入演示」走 `ch01_tianlong` 时内容包没有 `bookWorld` 章节定义，报 `ITEM_RULES_UNAVAILABLE:CONTENT_CHAPTER_DEF_MISSING`；若本任务改动正好涉及演示的章节选择，就改成有章节定义的书界（如 ch10）并加测试，不涉及就只在报告里注明。

## 约束

- 只写：`apps/game/build/**`、`apps/game/src/runtime/**`、`apps/game/src/selectors/**`、`apps/game/src/projection.ts`、`apps/game/src/core-host.ts`、`apps/game/src/core-worker.ts`、`apps/game/src/**/*.test.ts`、`apps/game/vite.config.ts`（仅注册插件时）、`tools/perf/**`（仅报告口径，不放宽预算）、本任务报告。不改 `content/**`、`assets/**`、`packages/core/**`。
- 每次写入 ≤ 150 行。

## 检查

`pnpm install --frozen-lockfile`、`pnpm check`、`pnpm --filter ./apps/game test`、`pnpm size`、`python3 tools/lint/check_ids.py --strict`。

## 报告

`tools/agents/reports/ENG-session-base-diet.md`（≤ 50 行）：改前 / 改后按键表、首次会话闭包与各子系统块大小、叶片清单与加载时机、稀疏 / 全量口径一致性的验证方法。
