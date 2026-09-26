# 本任务：修复 `tools/lint/check_ids.py` 在当前仓库上的崩溃，并在当前仓库重跑

L1 已交付 `tools/lint/check_ids.py`（1,656 行）、`README.md`、`test_check_ids.py`，在其基点（d87c377）上运行正常。但之后合入的 N1（`docs/design/18-npc-and-companions.md` 与 `docs/design/catalog/npcs-*.md`）让脚本在当前仓库崩溃：

    KeyError: 'npc_shijian'   （check_ids.py:1256 附近，near_match_issues）

原因（L1 报告的诊断）：近似 ID 检查的候选集 `ids` 含"定义 ID"，但位置表 `first` 只由"活动出现"填充；`npc_shijian` 仅在 `docs/design/catalog/npcs-ch06-xiake.md:30` 以表格定义形式出现，没有活动出现，取位置时缺键。

## 要做的事

1. 修复：任何从 `first`（或类似位置表）取值的地方都要有通用回退（例如回退到定义位置，或 `(file, line) = ('?', 0)`），不得再因"只有定义、没有引用"的 ID 崩溃；顺便检查其他检查类是否有同样的假设（定义集与出现集不一致）。
2. 补单测：在 `tools/lint/test_check_ids.py` 增加"ID 只在表格定义中出现、无活动引用"的用例，覆盖近似 ID 检查与其他受影响的检查；全部测试通过（`python3 -m unittest tools/lint/test_check_ids.py`）。
3. 在**当前仓库**运行 `python3 tools/lint/check_ids.py` 与 `--json`，默认模式退出码 0；把五类问题的最新计数与前 20 条示例写进报告（并更新 `tools/lint/README.md` 的"已知局限"若有变化）。
4. 不修改 docs/ 下任何文件；脚本发现的文档问题只写进报告第 6 节（按文档分组），交 F2 处理。

验收：`python3 tools/lint/check_ids.py` 在当前仓库退出码 0 且有输出；单测通过；报告含最新计数。
