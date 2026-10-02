# 本任务：游戏工程 · 遭遇定义转战斗（encounter.v1 → BattleSetup：战场、参战者、切磋 / 留手 / 重试、特殊胜利条件、脚本节拍、模板展开）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`packages/data/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-16c-battle-session.md`（`battle/enter` 怎么从遭遇创建、种子派生）、`ENG-16a-battle-geometry.md`（`BattleSetup.grid` 与站位字段）、`ENG-25-content-schemas-m1.md`（MoveDef、模板、Ink 动作）、`ENG-18b-tiled-regionmap.md`（BattleArena 对象）、`ENG-20a-region-core.md`（BattleArena 锚点怎么开战）。

## 为什么做

序章三场战斗（竹林、白猿切磋、边道）要从内容数据开出来。现在：
- 没有遭遇 schema；
- 战斗单位写死在 `apps/game/src/battle/demo.ts`；
- 胜利条件只有全灭、单位倒下、坚持回合、行动上限，没有序章要的「击中一次」；
- 没有脚本节拍：阿青在玩家气血 < 45% 时出手救场、连输 3 次后演示、控制阿青的投影；
- 没有模板展开：`tmpl_normal` 加梦境档位加难度倍率。

## 规格（照这些写，不自创）

- `docs/design/09-combat-system.md`：
  - §2.11 胜负判定与结束；§2.12 按进入情况生成 `BattleSetup`；
  - §13.3 遭遇定义 `EncounterDef`；§13.4 Boss 脚本、合击、阵法、性格；§13.5 领域事件。
- `docs/design/chapters/00-yuenv.md` §5.1–§5.4：
  - `enc_00_zhulin`：剧情战，输了重试，约 61 格；
  - `enc_00_baiyuan`：切磋，击中一次或坚持 2 回合即胜，认输也推进，留桃可跳过；
  - `enc_00_biandao`：剧情战，`lethalIntent=false`、允许留手，一名越兵 AI 同伴，约 91 格；
  - D1 倍率只乘气血与攻击，0.90；每个战场 ≤ 400 格、q / r 跨度 ≤ 20。
- `docs/design/13-progression-and-endings.md` §5：难度。
- `docs/tech/05-gameplay-engine.md` §7.1 战斗初始化；§7.7 战斗结束。

## 要做的事

1. **`encounter.v1` schema**（data）：
   - 战场：引用 RegionMap 的 BattleArena，或内联格网；
   - 参战者：NPC、角色槽（模板 + 梦境档位）、同伴，含站位与朝向；
   - 胜负与特殊条件；规则开关：切磋、留手、重试、可跳过；脚本节拍；难度倍率；
   - 引用检查。
2. **构建器**（core）：`EncounterDef` 加进入情况加难度，得到 `BattleSetup` 与单位种子。纯函数、确定，种子由 ENG-16c 的世界流派生。
3. **新胜利条件**「击中 N 次」；认输推进；重试计数（种子照 ENG-16c 的重试公式）。
4. **脚本节拍**：气血阈值触发、连败计数触发、受控单位切换。用数据声明，执行在 core，有事件。
5. **模板展开**：`tmpl_*` 加梦境档位加难度倍率得到单位种子，倍率规则照 §13 与 design/13。
6. **应用层**：`demo.ts` 改为从内容夹具开战，不再写死单位。
7. **测试**：
   - 三场序章遭遇的夹具各一条完整路径；
   - 「击中一次」胜利与「坚持 2 回合」胜利；
   - 阿青救场在 45% 触发；连败 3 次触发演示；
   - D1 倍率只作用于气血与攻击；
   - 同输入构建结果逐字节相同；
   - schema 正反例与引用检查反例。

约束：
- 写集：
  - data：`packages/data/src/schemas/encounter.ts`、`packages/data/src/schemas/index.ts`、`packages/data/src/content-index.ts`、`packages/data/src/content-registry.ts`；
  - core：`packages/core/src/battle/encounter/**`、`packages/core/src/battle/script/**`（新）、`packages/core/src/battle/types.ts`、`packages/core/src/battle/index.ts`、`packages/core/src/testing/**`、`packages/core/CLAUDE.md`；
  - 应用：`apps/game/src/battle/demo.ts`、`apps/game/src/battle/demo-seed.ts`。
  - 写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/battle/{action,damage,timeline,meridian-flow}/**`（需要接口就在报告里写明）、`packages/render/**`、`apps/game/src/battle/components/**`。
- data 不做规则结算；core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- `encounter.v1` 字段表；
- 构建器流程；
- 特殊条件与脚本节拍表；
- 模板与倍率公式；
- 测试；
- 交给 CONTENT-ch00c（三场遭遇怎么写）、ENG-20a（BattleArena 锚点开战）的接口。

报告 ≤ 90 行。
