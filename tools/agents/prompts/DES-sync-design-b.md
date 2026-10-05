# 本任务：设计文档同步 B · design/03、04、05、21 接《长生诀》核心（Z0-CS、1:20 化解、螺旋经脉伤害、特殊功法、sxp、类别名额；DES-changsheng-core 报告 §6）

本任务只做文档之间的一致性同步，不改设计意图，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。前置任务 DES-attr-v2（属性 v2）已合入，它改过这四份文档，先读它的报告 `tools/agents/reports/DES-attr-v2.md` 看哪些已经落了。

先读：`tools/agents/reports/DES-changsheng-core.md` §3、§6、§7；`docs/design/25-changshengjue.md`（归属：各层效果、螺旋内力 1 点化解 20 点、护体、累计 `sxp` / `convertedSxp`、3+3 与 60% 转化）；`docs/decisions/author-requirements.md` AR-26、AR-27；目标文档 `docs/design/03-attributes.md`、`04-damage-formula.md`、`05-martial-arts-system.md`、`21-meridian-flow-and-moves.md`（先 `grep -n '^#'`）。

## 要做的事
1. `design/04`、`design/21`：`Z0-CS` 区段（《长生诀》对伤害 / 经脉链的接入位置）、螺旋内力 1:20 化解的公式落点（整数 bp，写算式与一行样例）、护体与螺旋经脉伤害（CS-O02 默认：只把螺旋内力新增的伤害全额计入经脉伤害，不复制整招伤害）。
2. `design/05`：《长生诀》作为特殊功法的登记（类别、品阶、不占常规名额或占哪种名额——以 design/25 为准）、累计 `sxp` / `convertedSxp` 的定义引用、苏醒时「固定保留 3 武功 + 3 内功、其余按 60% 转顿悟点 / 真元」的武功类别名额规则。
3. `design/03`：顿悟点 / 真元的定义、容量与投放（引用 design/25），白马 1–20 级属性曲线是否已由 DES-attr-v2 落好——核对，缺的补。
4. 已由 DES-attr-v2 写好的条目只核对，不重写；每处写明来源（「见 design/25 §x」）。

## 约束
- 只写：`docs/design/03-attributes.md`、`docs/design/04-damage-formula.md`、`docs/design/05-martial-arts-system.md`、`docs/design/21-meridian-flow-and-moves.md`、本任务报告。
- 不改 design/25、canon、其他文档。
- 每次写入 ≤ 150 行；公式整数化（bp）、样例可复算。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`

## 报告
第 3 节写：文件、节号、改了什么、算式；第 6 节写需交 ENG 的字段。报告 ≤ 50 行。
