# 本任务：游戏工程 · 物品数据移出 entry 闭包：物品成为内容包独立叶片，core Worker 启动时按需加载规则，文本只在展示时读（体积门禁不放宽）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/data/CLAUDE.md`；
- 工程报告（都在 `tools/agents/reports/`）：
  - `ENG-18-content-build.md`：`content:build`、书界包、叶片、contentHash；**§4 O3**：运行时下载与接线交后续任务，现在仍用旧虚拟模块；
  - `ENG-17a-newrun-dialogue.md` 第 7 节：会话创建与宿主接线的现状；
  - `ENG-18b-tiled-regionmap.md` 第 7 节（若已合入）：区域叶片接入 `partition` 的方式。ENG-18b 可能与本任务并行，`packages/data/src/build/**` 只做物品叶片需要的最小改动。
- `TOOL-items-catalog` 工作区的报告草稿 `.agents/wt/TOOL-items-catalog/tools/agents/reports/TOOL-items-catalog.md`（如有）：物品数 889、体积实测。

## 为什么做

TOOL-items-catalog 把 `content/items` 按名录重新生成，从 361 个增到 889 个后，`pnpm check` 的体积门禁不过：
- entry 闭包 188.41 / 170 KiB gzip；
- webgl total 351.44 / 350。

原因：
- `apps/game/src/core-worker.ts` 静态导入 `virtual:tianshu-content`；
- 该虚拟模块（`apps/game/build/content-plugin.ts`）把全部 ItemDef 连同 `text.desc` / `text.short` 内联成 JS；
- Worker 文件属于入口的 assets，算在 entry 闭包里（`tools/perf/check_size.mjs`）。

物品 JSON 全量 gzip 约 102 KiB，其中去掉 text 后约 43 KiB。名录以后还会扩充（秘籍、兵器、药材）。

**集成分支现在是红的**（10-02 23:26 开发监督实测）：ENG-17a 合入后 `pnpm check` 的体积门禁不过，entry 闭包 175.46 / 170 KiB gzip。
- ENG-17a 自己的工作区约 169.x，单独看过线；和 ENG-16b / 16d / 12c-clip 合在一起就超了；
- `core-worker` 打包后 135.4 KiB gzip，含 Ink 运行时与整个 `virtual:tianshu-content`，后者单独成块时是 71.6 KiB gzip，其中大部分是物品；
- 在本任务合入前，基于当前 HEAD 新建的工作区 `pnpm check` 都过不了，所以 ENG-17 / 18b / 19a / 16c 都排在本任务之后。

协调者裁定（10-02 23:20，作者 AR-21「性能要最好」）：
- 体积预算一个字不放宽；
- **全量物品数据不得进 entry 闭包**；
- 物品改为内容包里的独立叶片，走 ENG-18 的 `content:build` 产物与 `content-loader`，运行时按需加载；
- `text.desc` / `lore` / `short` 只在需要展示时读；
- Worker 启动只带规则协议与 schema。

## 规格（照这些写，不自创）

- `docs/tech/04-data-pipeline.md`：
  - §8.1 分片命名与清单：`common.rules.base.json` 与 `common.text.<locale>.json` 独立常驻；单片原始 JSON 超 256 KiB 时产出 `.<pNNN>.json` 叶片，由同名索引按序列出；
  - §8.2 contentHash 只含规则叶片，不含文本；
  - §8.3 解析边界：启用 core Worker 时，规则在 core Worker 内解析，主线程只解析文本；单次原始 JSON ≤ 256 KiB；
  - §8.5 增量更新：比较逻辑名与 leaf hash。
- `docs/tech/06-asset-storage.md`：内容包的缓存与离线。只读，离线预缓存归 ENG-23a。
- `docs/tech/01-architecture.md`：包体门禁（entry 170 KiB gzip 等，即 `tools/perf/budgets.json`）。
- `packages/data/src/content-loader.ts`：`loadChapterPack`、`ContentSource`，以及 leaf hash 与 contentHash 校验。

## 要做的事

1. **物品叶片**（`packages/data/src/build/**`）：
   - 物品规则进规则叶片，物品文本（`text.*`）进文本叶片；
   - 物品集合大，优先用独立叶片，例如 `common.rules.items[.pNNN].json` / `common.text.<locale>.items[.pNNN].json`。新增逻辑名必须写进 manifest，并按 §8.1 的 256 KiB 规则分叶；在报告第 6 节登记，交 tech/04 同步；
   - contentHash 规则不变：只含规则叶片。
2. **虚拟模块瘦身**（`apps/game/build/content-plugin.ts`）：`virtual:tianshu-content` 不再含 `items`。其余字段先保持，若也很大，在报告里写数字，不在本任务处理。
3. **运行时按需加载**：
   - 规则：core Worker（以及主线程回退）在会话创建前，经 `ContentSource` 从 `content:build` 产物读取并校验物品规则叶片，在 Worker 内解析，再交给 `createGameSession`；
   - 读档、新游戏、书眠预载都走同一入口。加载失败给可恢复的错误码，不静默回退到空物品表；
   - 文本：主线程在物品面板、商店、背包第一次需要展示文本时，按需加载并缓存文本叶片；`apps/game/src/selectors/items.ts` 改成从文本缓存取 `desc` / `short`；未加载完时显示名称和加载占位。
4. **构建与开发服务器**：`content:build` 产物在 dev 与 build 下都能经同一相对路径读到。不改 Service Worker 与预缓存（ENG-23a）。
5. **测试**：
   - 叶片：用 889 个物品级别的夹具或现有内容产出物品叶片；超 256 KiB 按序分叶；hash 校验失败时拒绝；
   - 运行时：从夹具包加载物品规则后建会话，与原内联方式在同一内容下得到同一规范 state hash（证明只改了加载方式）；
   - 文本：首次展示触发加载，再次命中缓存；
   - 体积：在本工作区把 `content/items` 换成 889 个物品的规模时，`pnpm size` 的 entry 与 webgl total 都在预算内。可以从 `.agents/wt/TOOL-items-catalog/content/items` 临时复制做实测，**不要提交这些物品文件**，报告写数字。

6. **验收硬条件**：本任务合入后，集成分支上 `pnpm check` 必须恢复全绿，entry 与 webgl total 都在预算内。
   - 若只把物品移出还不够，可以让 Worker 在第一次进入对话前按需 `import()` Ink 运行时；但 `packages/core/**` 不在写集，只能在宿主侧（`core-worker.ts` / `runtime/**`）做注入式预载。
   - 宿主侧做不到时，在报告写清各块大小，交开发监督另开任务。

## 约束

- 写集：
  - `packages/data/**`
  - `apps/game/build/**`
  - `apps/game/src/runtime/**`
  - `apps/game/src/core-worker.ts`、`apps/game/src/core-host.ts`、`apps/game/src/content.d.ts`、`apps/game/src/selectors/items.ts`
  - 写集外的改动在提交时会被丢弃。
- **不改**：
  - `tools/perf/**`：预算与体积脚本一字不动；
  - `content/**`：物品数据归 TOOL-items-catalog；
  - `packages/core/**`、`packages/ui/**`、`packages/render/**`、`docs/**`；
  - `apps/game/src/sw/**`、`apps/game/src/pwa/**`（ENG-23a）。
- 不加依赖；每次写入 ≤ 150 行。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 叶片清单与各叶片原始 / gzip 大小；
- 889 个物品规模下的 entry 与 webgl total 实测；
- 会话 hash 对拍结果。

第 6 节写新增逻辑名，交 tech/04 §8.1 同步。

第 7 节写交接：
- 交 ENG-17 / 23a：加载入口、错误码、预缓存清单；
- 交 TOOL-items-catalog：它重新校验时要做什么。

报告 ≤ 80 行。
