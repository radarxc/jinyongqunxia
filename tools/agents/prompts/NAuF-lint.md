# 本任务：终审拆分 · 检查脚本与平衡脚本（tools/lint、tools/balance）

你负责"经脉系统落地最终核对"（原 NAu-final）按写集拆出来的一个并行子任务。终审拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 6 节与第 7 节"交其他任务"，由图鉴 / 书界任务或最后的收口任务 NAu-final 处理。本任务写代码，"文档格式"类规则不适用；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

背景：检查脚本前序任务为 NL、NL2、NL3、NAu-lint、NAu-nxt、NYY，以及刚合入的 LINT-outlets（出口剥离与识别、普通路线唯一性、黄阶一行卡解析）。报告在 `tools/agents/reports/<ID>.md`。图鉴不在本任务写集内：脚本修严后若某册出现新命中，**不要**为了保持 0 而放宽规则或改图鉴，列给协调者，由并行的 `NAuF-cat-<单元>` 处理。

本任务的文件（只改这些）：`tools/lint/**`、`tools/balance/**`

## 要做的事

1. **旧"路线行"检查改为按实际路线穴位检查**：检查脚本里天 / 地阶旧的"路线行"检查（未登记、重复、CT、风险等）读的是不含穴位三元组的索引行，实际覆盖为 0（NAu-nxt 报告）。改为按实际路线穴位检查，并加单测；改后实测全部图鉴的命中数写进报告。
2. **末端规则检查（`--delivery`）**：全部图鉴的命中数写入报告；已清零的规则新增独立严格开关（不改旧 `--strict` 语义，NAu-lint 的 NAu-O01）；玄上路线未登记穴位检查（NAu-nxt 扩展）命中清零后同样转为严格。没清零的保持只报告，并列出剩余命中。
3. **全量相似度**：跑一次 `python3 tools/agents/nr3_assign.py`，报告剩余 ≥80% 配对数，并抽查 NR3 写的理由条目是否满足 21 §4.3.4 第 4 条（脚本不在本写集，只读运行；发现脚本问题写进"交其他任务"）。
4. **ID 检查**：`python3 tools/lint/check_ids.py --strict`；基线里已不存在的债务条目清掉，必要时刷新基线，并在报告里写明债务数（tech/04 §11 的登记由收口任务同步）。
5. **平衡脚本**：四个脚本 `--check` 全过；`boss_pacing.py` 输出若被书界文档当作 error 级金标准引用，提供稳定的、带容差说明的输出格式或 `--report` 选项，供书界任务引用（不改数值模型）。
6. **README**：`tools/lint/README.md`、`tools/balance/README.md` 同步新增开关与现状（哪些是严格门禁、哪些只报告、各自纳入常态 CI 的条件）。
7. 每次写入不超过约 150 行；不改 `docs/`。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/lint/check_ids.py --strict`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/balance/projection_sim.py --check`

## 报告

第 7 节写：每条改动的依据（报告条目或 21 条文）；三种既有 strict 模式输出修前修后是否逐字节一致及对比方式；全部图鉴各检查的命中数（修前 / 修后）；新增严格开关清单；`nr3_assign.py` 结果与理由抽查；需另派任务处理的图鉴命中；需作者确认的事项。
