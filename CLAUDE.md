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
- rig 100 角色 CPU 门禁（`packages/render/src/rig/performance.test.ts`，P95 < 0.80 ms，阈值不动）不在 `pnpm check` 里，由 `pnpm check:perf` 在机器负载低时单独跑（作者 AR-33）。禁止在任何测试里加「高负载跳过 / 放宽」逻辑；失败一律按真实退化处理。
- 修改 `core` 时补确定性测试；修改渲染时记录 draw call / 帧时间；修改 UI 时只更新浅投影。

## 后续任务落点

- 存储实现放 `packages/platform/src/storage`；人物 / 物品 / 剧情 schema 放 `packages/data/src/schemas`。
- 规则分别放 `packages/core/src` 已预建子目录；不要再改根 `src/index.ts` 的导出布局。
- 通用 Vue 组件放 `packages/ui`，页面装配放 `apps/game`，Three 场景放 `packages/render`。
- 包内先跑对应 `pnpm --filter <包名> test`，交付前必须跑 `pnpm check`。

## 素材接入

- 图片素材全部在仓库根 `assets/default/<类别>/`（物品 `item/<类>/`、建筑 `building-map/<kit>/`、贴片 `tile/<kit>/`、角色部件 `rig/<set>/`、地图 `map/`、特效 `vfx/`、作者已审基线 `baseline/`），每目录一份 `manifest.yaml`，字段见 `assets/README.md`。
- 哪些图还没出、每张图的提示词与输出路径：`assets/default/prompts/INDEX.md`（物品 / 地图 / 角色部件，含"出图位置约定"）；人物立绘见 `assets/default/prompts/characters/INDEX.md`。出图由另外的 agent 做，代码不要等图：缺图用同尺寸占位，正式图到位后无需改代码。
- 进包：构建时按 manifest 把 `status` 不为 `rejected` 的条目复制到 `apps/game/public/assets/default/<类别>/…`（保持相对路径），运行时按 `docs/tech/06` 的素材键 / 清单读取；不把图片 import 进 JS bundle，不改 `assets/default/` 下任何文件。
