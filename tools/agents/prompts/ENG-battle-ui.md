# 本任务：游戏工程 · 战斗界面（六角战旗、速度条、行动 / 聚气、招式范围预览、自动战斗、提示文案）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/render/CLAUDE.md`、`packages/core/CLAUDE.md`（ENG-04 战斗 API）。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 战斗 4（自动战斗 / 速度条回合六角战旗；招式范围效果；自动战斗模拟；行动槽集满后行动 / 急性聚气；完整运气暴击提示「运转一周天，内劲喷涌而出，难以抵挡」；外放抵消提示「真气鼓荡震开攻击」；透劲入体 / 打穴 / 负面效果可见；每场战斗相关人物与结束条件）。

## 设计依据

`docs/design/09-combat-system.md`（流程、UI 需求若有）、`docs/tech/05-gameplay-engine.md` §6（六角）；ENG-04 的创建 / 推进 / 查询 / 事件 API；ENG-07 的壳与桥接；人物立绘 / 头像占位（`assets/default/` 基线）。

## 要做的事

1. 六角战场渲染（`packages/render`，three r186 或同场景内的 2D 层，二选一写明）：格子、地形标记、单位标记（头像 / 立绘位、血条、内力条、行动槽、状态图标）、朝向；选中 / 可达 / 范围模板高亮；招式范围预览（悬浮招式 → 显示落点与命中单位）。
2. 速度条（CT）条带：按 ENG-04 时间轴显示出手顺序与预计；回合到谁高亮。
3. 行动菜单：行动（移动 / 招式列表（按武学分组、显示运气完整度与预计加成）/ 物品 / 防御）与**急性聚气**（跳过本回合继续积攒，显示在途气量 / 承载上限）；经脉小图显示运气进度与阻塞 / 占穴 / 丹田受损。
4. 结算日志与提示：事件流 → 日志面板 + 场上飘字；`qi.fullCycleCrit`、`combat.qiRepel`、透劲入体、打穴、负面效果各有文案（取 core 事件附带的文案池）；伤害明细可展开。
5. 自动战斗：开关 + 速度（1× / 2× / 跳过）；跑 ENG-04 求解器并把每步回放到界面；可随时切回手动。
6. 战斗设置与结束：进入时读 `BattleSetup`（参战单位、阵营、结束条件），结束弹窗（胜负、掉落、经验 / 熟练度、周天）；回到来源场景。
7. 测试：组件测试（菜单发出正确命令、范围预览与 core 查询一致、自动战斗开关）、回放一场黄金战斗的 UI 事件序列；`pnpm check` 全绿；web build 成功。
8. 更新 `apps/game/CLAUDE.md`、`packages/render/CLAUDE.md`；给 ENG-11（动效）留招式播放钩子（`onMoveResolved(moveId, from, to, result)`）。

约束：不改 core 公式；每次写入 ≤ 150 行；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

性能是作者硬要求（AR-21「性能要最好」）：战场渲染实例化、高亮用 uniform 不重建几何；UI 投影增量更新；自动战斗回放不阻塞主线程（分帧）；`pnpm size` 必须过。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：组件清单；事件 → 文案对照；自动战斗交互说明；交 ENG-11 的钩子。报告 ≤ 100 行。
