# 本任务：游戏工程 · 小修：大地图页挂载竞态与投影瘦身（代码审计 H3、M1）

本任务写代码，改动要小。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-08-worldmap.md`、`ENG-15-core-bus.md`（投影与会话的新形状）；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.2 H3、§3.3 M1。

## 为什么做

1. **H3 挂载竞态**：`apps/game/src/pages/WorldMapPage.vue` 的 `mountScene()` 有两次 `await`（动态导入 render、创建场景），都不检查组件是否已卸载。
   - 若卸载发生在 `createWorldMapScene` 返回之前，`onBeforeUnmount` 时 `view` 还是 undefined；
   - 之后 `view` 被赋值、ResizeObserver 挂上、rAF 循环开始，再也没人停。
   - 首次加载慢的设备上来回切页，就会累积 WebGL 上下文（桌面 Chrome 约 16 个上限，移动端更少）和后台渲染。
   - 对照：`BattleField.vue` 有 `disposed` 守卫，是正确写法。
2. **M1 投影过重**：大地图投影每一步都整份重发地图定义（ch01 有 201 个节点、90 条路，约 126 KB），并重算可达集。行走时每秒约结构化克隆 0.5 MB，违反根 `CLAUDE.md`「只更新浅投影」。
   - 涉及位置：`core/src/world/worldmap-state.ts` 投影带整个 `map`、`apps/game/src/projection.ts`、`apps/game/src/runtime/session.ts`、`WorldMapPage.vue`（220 ms 一步）。
   - 以上行号以 ENG-15 合入后的实际代码为准，开工先核对。

## 要做的事

1. `WorldMapPage.vue` 加 `disposed` 守卫，与 `BattleField.vue` 一致：每次 `await` 之后检查，已卸载就立即释放刚建好的场景，不挂观察器、不启 rAF。补一个「挂载未完成即卸载」的测试，断言场景被释放、没有残留循环。
2. 投影拆成两部分：
   - 静态几何只在进入或查询时发一次；
   - 每一步只发 `point`、`journey`、`reachableNodeIds`。
   - 可达集按位置缓存。
   - 补测试：行走 10 步的投影总字节数下降，可达结果与改前一致。
3. 渲染场景 `dispose` 时的 `forceContextLoss` 由 ENG-21b 做，本任务不改 `packages/render/**`。

约束：
- 写集：`apps/game/src/pages/WorldMapPage.vue`、`apps/game/src/projection.ts`、`apps/game/src/runtime/**`、`packages/core/src/world/worldmap-*.ts`、`packages/ui/src/projections.ts`（只改类型）。写集外的改动在提交时会被丢弃。
- 不改里程与寻路规则；core 禁浮点、禁 DOM、禁墙钟；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若只因机器负载挂在 rig 门禁，在报告写明负载与数值即可。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 守卫位置与测试；
- 投影前后形状与字节数；
- 缓存策略。

报告 ≤ 40 行。
