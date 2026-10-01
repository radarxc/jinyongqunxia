# 本任务：游戏工程 · 经脉运气运行时（产气、运气推进、通量、行动槽、聚气、完整运气加成、周天锻炼、药材强化）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`packages/data/CLAUDE.md`（ENG-00 / ENG-02 的约定）。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 2.3.1（经脉宽度 / 速度 / 数量 / 长度；丹田产气量；运气速度；每条经脉 / 穴道通量由内功每周期跑通锻炼）、战斗 3（单位时间；产气速度；行动槽集气；集满后行动 / 急性聚气；聚气跳过本回合继续积攒；完整运气出招大量加成、不完整绵软无力；到经脉承载上限不再提升；完整运气暴击提示「运转一周天，内劲喷涌而出，难以抵挡」）、2.3（药材强化经脉 / 穴位 → 内力 / 生命增强）、交互层 3.4（城镇打坐练功；被攻击会岔气）。

## 设计依据

`docs/design/21-meridian-flow-and-moves.md`（河流模型 + DES-qi 新增小节：整数公式、样例表）、`docs/design/09-combat-system.md` §3（集气时间轴）、`docs/design/15`、`docs/tech/05-gameplay-engine.md` §2（`battle/meridian-flow`、`progression` 模块位置）、§4（确定性）。ENG-02 的 `CharacterState` 经脉实例与 `MartialArtDef` 字段。

## 要做的事

1. `packages/core/src/battle/meridian-flow/`：纯函数 + 小状态机：每 tick 丹田产气（内功基础 × 层级曲线）、气沿路线逐段推进（段长 / 运气速度 → 每 tick 推进量）、节点通量上限与卡住 / 胀损（design/21 §3）、在途气量、承载上限封顶；`gatherState`：行动槽（人物速度 → 每 tick 集气）、集满 → 可行动 / 急性聚气（跳过本回合、继续积攒）；出招时结算"完整运气 / 不完整运气"加成（bp 曲线，design/21 DES-qi 表）与放出气量（产气 × 速度 × 路线通量函数），返回结算明细；完整运气暴击事件 `qi.fullCycleCrit`，附提示文案池（≥ 6 条，含作者原句）。
2. `packages/core/src/progression/`：内功修炼周期（打坐 / 练功推进时间 → 周天次数 → 各经脉 / 穴位通量锻炼增量与上限）、武功层数与熟练度推进、药材 / 丹药强化经脉 / 穴位的接口（`applyMeridianBoost(itemEffect)`，效果字段按 design/10 / DES-items-plus）、打坐被打断 → 岔气状态（接口：`interruptMeditation()` 返回负面效果描述，具体 Buff 由 ENG-04 落地，这里只给状态与事件）。
3. 全部走 core 的 command / event 通道（tech/05 §2）；确定性：整数、PCG32、规范序列化。
4. 测试：用 DES-qi 文档的"三档内功 × 三档经脉 × 完整 / 不完整运气"样例表逐行断言；行动槽 / 聚气跳回合时序；承载上限封顶；周天锻炼增量；回放一致（同种子两次运行哈希相同）；`pnpm check` 全绿。
5. 更新 `packages/core/CLAUDE.md`：模块入口、事件名、交 ENG-04（战斗结算要用的函数）与 ENG-09（打坐）的接口。

约束：不写伤害公式与攻防（ENG-04）；不写 UI；每次写入 ≤ 150 行；不改 `packages/core/src/index.ts`（已预先导出各子模块）与别的任务负责的子目录；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

性能是作者硬要求（AR-21「性能要最好」）：每 tick 推进是热路径——用预分配的类型化数组 / 对象池，零每帧分配；给 `vitest bench`：1000 个 tick × 12 条经脉 ≤ 5 ms（Node），写进测试断言上限。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：函数 / 事件清单；与文档公式的对应（文档节号 → 函数）；样例表断言结果；交下游接口。报告 ≤ 100 行。
