# 天书录工程协作约定

## 事实与工作方式

- 事实优先级：作者决定 / 新增需求 > `docs/00-canon.md` > `docs/decisions/rulings-v1.md` > 归属文档。
- 数据驱动优先，schema 即文档；不要把武学、NPC、任务或物品逐条硬编码进规则。
- 小步提交；每一步保持类型、测试和包边界可验证。
- 一条命令自检：`pnpm check` 是完成定义，包含 lint、typecheck、test、内容校验和包体预算。

## 分层与依赖方向

`shared <- data <- core`；`render`、`ui`、`platform` 只依赖其允许的左侧公开边界，并由 `apps/game` 汇合。

- `shared`：零依赖的 ID、整数工具、规范 JSON；禁止业务规则和平台 API。
- `data`：Zod schema、内容包格式和加载边界；禁止规则结算。
- `core`：唯一玩法权威；禁止 DOM、网络、存储、墙钟、非确定性 API 和表现层反向依赖。
- `platform`：存储 / 输入 / 音频与 CoreHost 端口；禁止玩法判断。
- `render`：Three.js 表现；禁止伤害、寻路、可达性等规则重算。
- `ui`：Vue + Pinia 只消费投影并发命令意图；禁止直接修改 `GameState`。
- `apps/game`：装配与发布；不得成为第二个规则层。

## 性能规则

- core 默认通过 Worker Host 运行，保留主线程回退；消息只传可序列化命令、事件与投影。
- 热路径避免每帧分配；渲染优先实例化、图集和显式资源生命周期。
- Vite 保持 render 独立懒加载 chunk；`tools/perf/budgets.json` 是可执行门禁。
- 修改 `core` 时补确定性测试；修改渲染时记录 draw call / 帧时间；修改 UI 时只更新浅投影。

## 后续任务落点

- 存储实现放 `packages/platform/src/storage`；人物 / 物品 / 剧情 schema 放 `packages/data/src/schemas`。
- 规则分别放 `packages/core/src` 已预建子目录；不要再改根 `src/index.ts` 的导出布局。
- 通用 Vue 组件放 `packages/ui`，页面装配放 `apps/game`，Three 场景放 `packages/render`。
- 包内先跑对应 `pnpm --filter <包名> test`，交付前必须跑 `pnpm check`。
