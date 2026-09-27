# 本任务：ID 检查脚本收口（F2 汇总前置 · 只改 `tools/lint/`）

六个分组审计已基本完成（`tools/agents/reports/F2a.md`、`F2b.md`、`F2d1.md`、`F2d2.md`、`F2t.md`；`F2c` 可能仍在运行）。它们在第 7 节报告了一批检查脚本的误报与口径问题。本任务只改 `tools/lint/check_ids.py`、`tools/lint/test_check_ids.py`、`tools/lint/README.md`，不改任何文档，**不刷新基线**（基线由最终汇总 F2 在全部修正后刷新）。

## 要做的事（每条都要补测试）

1. **套装目录解析**：套装双向检查目前只解析 `docs/design/07-set-system.md` §2.2 的一个 YAML 样例，导致 `set_shaolin_jingang` 报 4 处假不对称。改为解析 07 §8–§18 的正式套装目录（44 套、306 条成员关系；读其表格 / 小节标题中的套装 ID 与成员列），§19 不算定义。
2. **07 §19 弃用映射**：§19"未收录 / 并入"表中的候选套装 ID（约 119 个）按弃用处理——旧候选 → 并入后的正式套装（或"删除 / 延后"）；其他文档仍引用它们时报"废弃 ID"而不是"未定义"，并在输出里给出替代套装。
3. **操作键与修饰键**：任务 DSL 的操作键（如 `set_allowed_flag`、`set_resource_point_ownership`、`set_resource_point_level`，见 design/12、16）与属性修饰键（如 design/03 的 `set_mov`，属于 `flat_` / `pct_` / `set_` 修饰族）不是套装 ID。用明确规则识别（按所在代码块 / 字段语境或按 12、03 定义的操作键 / 修饰键清单），不要靠逐个白名单。
4. **迁移语境**：迁移表、旧 → 新对照、别名表、历史提案表与测试夹具中的旧 ID（如 design/11 §3 的旧区域 ID、design/12 中作为迁移输入的 `q_08_main_01..18`、design/15 §11.7 的短 `mer_*`、design/18 的别名 `npc_ningqiangdao`、`docs/decisions/canon-proposals-v1.2.md` CP-45 一类的否定式举例）不算活跃引用。规则要可解释（例如表头或小节标题含"迁移 / 旧 ID / 别名 / 历史 / 不采纳"，或同句否定词），活跃正文中的同一旧 ID 仍须报出。
5. **`route_` 豁免**：分组 F2d1 裁定把剧情状态旗标 `route_04` / `route_06` 改名为 `flag_04_route` / `flag_06_route`（由并行任务 F2y 改文档）。收窄脚本里对 `route_(\d{2}|zheng|xie|…)` 的豁免：只保留地图路线 `route_*` 的正常定义规则，不再整族放行。
6. **严格模式口径**：`--strict` 除基线外新增的未定义 / 废弃 ID 外，**冲突定义**与**套装双向不对称**也应失败（它们是真错误）；**近似名**只作警告，并支持一个"合法近名"白名单文件（已知合法对：`npc_sangjie`/`npc_sangsi`、`npc_meijian`/`npc_shijian`、`sk_xuansujian`/`sk_xuanxujian` 等，以各分组报告为准）。同步更新 `tools/lint/README.md`。
7. 运行 `python -m unittest tools/lint/test_check_ids.py` 必须通过；运行 `python tools/lint/check_ids.py --json`，在报告里给出改动前 / 后的计数（未定义、废弃、冲突、不对称、近似名），并列出改动后仍报出的问题按归属文档分组（供 F2y 与最终汇总使用）。

## 报告

第 7 节写：每条规则的实现说明与理由、测试清单、前 / 后计数对比、剩余问题分组清单、你认为仍可能是误报但没有放行的条目。
