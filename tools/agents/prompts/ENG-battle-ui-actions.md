# 本任务：游戏工程 · 战斗补全 E：战斗界面接通移动 / 防御 / 物品 / 聚气与可达高亮

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/render/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-16c-battle-session.md`（按钮可用性、可达 / 路径 / 方位查询、奖励投影）、`ENG-16a-battle-geometry.md`、`ENG-21b-recovery-quality.md`（高亮改用 DataTexture 或实例属性后的接口）、`ENG-10-battle-ui.md`、`ENG-11-vfx.md`。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3 UI 行：M1 要战斗 HUD。core 侧的移动、防御、物品、急性聚气由 ENG-16a–16c 接通后，界面还停在「按钮禁用、可达集恒为空」：
- `apps/game/src/battle/runtime.ts` 的能力开关写死为禁用；
- `BattleActions.vue` 的移动意图发的是自己的格子，物品按钮没有处理函数，聚气用空的 `routeId`；
- `BattleField.vue` 永远传 `reachable: []`；
- 单位位置、朝向、`qiNature` 来自静态标记；
- 奖励面板全是空值。

（以上行号以 ENG-16c 合入后的实际代码为准，开工先核对。）

## 规格（照这些写，不自创）

- `docs/design/14-ui-ux-mobile.md` §5.3 战斗操作流程、§6.1 六角选格 / 吸附 / 镜头。
- `docs/design/09-combat-system.md` §4.6：可撤销移动与两段确认，移动在确认前只是预览；§4.7–§4.8 各行动细则。
- `docs/tech/05-gameplay-engine.md` §3.4：命令不携带可达格或预测伤害；§6.5 末段：render 不得再算几何。

## 要做的事

1. 按钮可用性只取 core 查询：移动、防御、物品、聚气、待机，不在 app 里重算。
2. **移动流程**：
   - core 可达集高亮 → 选格显示路径幽灵 → 选招或待机 → 一次确认发出带 `walkTo` 的完整行动计划；
   - 可撤销，确认前不改状态。
3. **物品**：从 core 的战斗背包投影选物品与目标，遵守冷却与总上限提示。
4. **聚气**：选路线发 `acuteQiGather`，满载等拒绝原因要有提示。
5. **渲染**：
   - 路径层接 ENG-21b 改造后的高亮通道，不新增大 uniform 数组；
   - 单位位置、朝向、`qiNature` 取 core 投影，特效同步。
6. **奖励面板**：显示 core 的奖励载荷。
7. **测试**：
   - 各按钮的可用性与发出的命令（happy-dom 组件测试）；
   - 移动两段确认，取消不改状态；
   - 渲染高亮测试（mock three）；
   - 文案进 `packages/ui/src/i18n.ts`。

约束：
- **体积**（开发监督 10-03 04:38 补）：ENG-19a 合入后集成分支 entry 闭包已到 157.74 / 170 KiB（gzip，`tools/perf/budgets.json`，不放宽）。本任务新增的页面 / 组件一律按路由或首次使用懒加载（`defineAsyncComponent` / 动态 `import()`），不进入首屏同步依赖；报告写 `pnpm size` 的 entry / webgl total 实测。
- 写集：`apps/game/src/battle/components/**`、`apps/game/src/battle/*.ts`（只做展示适配）、`apps/game/src/battle/battle.css`、`packages/render/src/battle/**`、`packages/render/CLAUDE.md`、`packages/ui/src/i18n.ts`。写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/**`；需要 core 补查询的，在报告里写明，不要改。
- 分层：界面只消费投影与查询、发命令意图，不算规则。
- 每次写入 ≤ 150 行；不加依赖；每帧零分配。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

浏览器里的手感与帧率记「待实测」：沙箱拦 Chromium，由协调者在沙箱外跑。

## 报告

第 7 节写：
- 各操作的交互流程与命令对照；
- 渲染高亮通道与 draw call；
- 测试；
- 待 core 补的查询；
- 交给 ENG-19（主流程里战斗页进出）的接口。

报告 ≤ 80 行。
