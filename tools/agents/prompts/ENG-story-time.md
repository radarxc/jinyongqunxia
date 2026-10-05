# 本任务：游戏工程 · 剧情 DAG 运行时、时间推进与事件锚点

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`packages/data/CLAUDE.md`。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 2.1 剧情 DAG（事件驱动状态机；节点含人物出现 / 消失、对话、任务（事件）；完成后按 condition 或人物选择进入下一节点；多路径；每书界一主线多支线；触发时限）、2.2 时间（当前时间；客栈睡觉 / 打坐快速推进）、交互层 3.3 城镇中 NPC / 位置等事件锚点、3.2 大地图进入野外遗迹 / 城镇（触发接口）。

## 设计依据

`docs/design/24-story-dag.md`、`docs/design/story/schema.yaml`、`docs/design/12-quests-npc-factions.md`（任务状态 / 条件语法 / Ink 桥接 §2.5 / 幂等 §1.5）、`docs/tech/05-gameplay-engine.md` §2（`quest`、`dialogue`、`world`、`event`、`npc`）、§5（世界 tick、日历、边界事件）。ENG-02 的 `StoryState`、`GameClock`。

## 要做的事

1. `quest/`：DAG 运行时：加载 `StoryLine`，激活起点，节点执行器按类型分派（spawn / despawn → 世界 NPC 表；dialogue → 对话模块；task / event → 任务与事件；choice → 等待玩家选择命令；condition gate → 条件求值；end → 结局标签）；出边按 condition / choice 选择；时限（时间窗、超时边、失效 / 延期 / 替代）；主线 + 支线并行、跨线条件引用；幂等完成事件；存档 / 读档恢复到同一节点。
2. `world/` + `event/`：`GameClock` 推进 API（客栈睡觉到次日辰时、打坐 N 个时辰、旅行按里程、战斗 tick 换算）与日历边界事件（日 / 月 / 年、节气可选）；时限检查时机；事件锚点注册表（NPC 锚点、位置锚点：场景 ID + 坐标 / 格子 + 触发类型 + 关联节点），供 ENG-09 城镇场景与 ENG-08 大地图查询与触发。
3. `dialogue/`：对话模块最小实现：内联台词 + 选项；Ink 桥接留接口（若 tech/01 允许 inkjs 则接入，否则只做 stub 并写报告）。
4. `npc/`：书界 NPC 出现 / 消失表（按时代图层与节点状态）、关系值最小结构（design/12）。
5. 测试：用 `content/story/ch01/`（天龙主线样例）跑通一条路线（脚本化选择），验证节点序列、时限过期分支、支线挂接、读档续跑一致、同种子回放哈希一致；`pnpm check` 全绿。
6. 更新 `packages/core/CLAUDE.md`：命令 / 事件 / 查询接口，交 ENG-07（UI）、ENG-08 / 09（地图触发）。

约束：不写 UI；不改 schema（需要改写报告交 ENG-02 / DES-story-dag）；每次写入 ≤ 150 行；不改 `packages/core/src/index.ts`（已预先导出各子模块）与别的任务负责的子目录；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

性能是作者硬要求（AR-21「性能要最好」）：条件求值预编译（不在运行时解析字符串）；时限检查按下一个到期时间排序只查队首；锚点注册表按场景分桶 O(1) 查询。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：运行时 API；时间推进表；锚点注册表结构；样例路线测试结果；交下游接口。报告 ≤ 100 行。
