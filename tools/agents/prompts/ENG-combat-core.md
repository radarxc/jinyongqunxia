# 本任务：游戏工程 · 战斗核心（速度条回合、六角范围、伤害与攻击位置、外放抵消、透劲入体、打穴、负面效果、自动战斗、战斗设置）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/core/CLAUDE.md`（ENG-00 / 02 / 03 的约定）。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19** 战斗 4：自动战斗 / 速度条回合六角战旗；4.1 招式范围与效果；4.2 自动战斗（基于模拟，不考虑站位，一拳一眼）；4.3 单位时间 / 行动槽 / 聚气（ENG-03 已实现，本任务接入）；4.4 攻击位置（全身 / 手擒拿 / 腿摔跤）与抗性、外放抵消（100% 内劲、50% 外劲；为负按 50% 抵消基础伤害；提示「真气鼓荡震开攻击」）；4.5 异种内力（玄级及以上外放内功的透劲入体；内力大于对手时送入经脉干扰；量与速度同外放；消化比例 1:1 / 特殊 10:1；未消化前经脉阻塞；逆向真气到丹田前未消化 → 丹田受损；斗转星移 1:2 反向输出、量 / 宽度不足同样受伤）；4.6 打穴（内劲打穴、高准确度、占据穴位、消化比例为透劲入体 50%、影响多条经脉）；4.7 负面效果（中毒、岔气等）；4.8 每场战斗相关人物与结束条件按进入情况设置。

## 设计依据

`docs/design/09-combat-system.md`、`docs/design/04-damage-formula.md`、`docs/design/21-meridian-flow-and-moves.md`（§4.8–§4.10，DES-combat 新增）、`docs/design/06-buff-system.md`、`docs/design/05` §4（MoveDef：`hitZone`、`projection`、`acupointStrike`…）、`docs/tech/05-gameplay-engine.md` §2（`battle/{timeline,action,reaction,damage,meridian-flow,formation,encounter}`、`buff`、`ai`、`replay`）、§6（六角）、§7。ENG-03 的运气 / 聚气函数与事件。

## 要做的事

1. `battle/timeline`：CT 速度条（design/09 §3）接 ENG-03 行动槽；回合推进；行动 / 聚气选择。
2. `hex` + `battle/formation`：六角坐标、距离、朝向、范围模板（design/09 §5 / tech/05 §6）；招式范围与效果落点（单体 / 线 / 扇 / 环 / 自身）。
3. `battle/damage`：design/04 伤害链 + DES-combat：`hitZone` 抗性（力量、韧性、该位置经脉气劲）；外放抵消（阈值、100% / 50%、负值 50% 抵基础伤害）+ 事件 `combat.qiRepel` 提示文案池；透劲入体：注入实例（来源内功、量、速度、位置、剩余、消化比例）、每 tick 逆向推进、防守方投入内力消化、阻塞段、丹田受损分级事件、斗转星移类 1:2 反向输出与超量 / 宽度不足受伤；打穴：准确度判定、占穴、消化比例 50%、影响多经脉；全部整数 bp。
4. `buff`：Buff IR 执行器（design/06）+ 负面效果表（中毒、岔气、经脉阻塞、丹田受损、内伤、眩晕、流血…按 DES-combat 表）；岔气接 ENG-03 `interruptMeditation()`。
5. `battle/encounter`：`BattleSetup`（参战单位、阵营、胜负 / 结束条件、特殊规则；由遭遇 / 剧情节点 / 城镇打坐被袭三种入口构造）；战斗状态机（design/09 §1）；结束结算。
6. `ai` + 自动战斗：基于模拟、不考虑站位的求解器（双方按 CT 出招、招式选择与运气策略、结束条件），与六角手动战斗共用结算函数；给出每步日志（含提示文案）。
7. `replay`：命令序列 + 种子 → 可重放；黄金回放测试。
8. 测试：公式表逐行断言（design/04、DES-combat 样例）；外放抵消 / 透劲入体 / 打穴 / 斗转星移各至少 3 个用例；自动战斗 200 个随机种子不变量（无 NaN、HP 不为负后仍行动、总能终止）；回放哈希一致；`pnpm check` 全绿。
9. 更新 `packages/core/CLAUDE.md`：战斗 API（创建 / 推进 / 查询 / 事件）交 ENG-10（战斗 UI）与 ENG-09（城镇打坐触发）。

约束：不写 UI 与渲染；不改 ENG-03 的公式（需要改写在报告）；每次写入 ≤ 150 行；不改 `packages/core/src/index.ts`（已预先导出各子模块）与别的任务负责的子目录；尽量不加新依赖（并行任务改同一份 `pnpm-lock.yaml` 会冲突），必须加的写进报告。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：模块 / 函数 / 事件清单；文档节号 → 函数对照；测试覆盖摘要；交下游接口；需作者确认（附默认）。报告 ≤ 100 行。
