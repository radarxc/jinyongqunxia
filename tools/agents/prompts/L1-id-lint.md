# 本任务：写 ID 一致性检查脚本 `tools/lint/check_ids.py`

目的：自动发现跨文档 ID 问题（`TODO.md` §3 的 C12、C22、C23 这一类），供审校代理和最终审计（F2）使用。脚本要对当前仓库和未来新增的文档都有效。

## 要求

1. 只用 Python 3 标准库（兼容 3.9+，Windows / macOS / Linux 都能跑）。用法：`python tools/lint/check_ids.py [--json] [--strict] [路径…]`，默认扫描 `docs/` 下全部 `.md`。
2. 前缀从基准 `docs/00-canon.md` §12 的 ID 命名表中解析（含 v1.1 新增的前缀），不要写死；解析失败时退回脚本内置的默认表，并打印警告。
3. 提取 ID：反引号内的 ID、YAML/代码块中的 ID（`id: sk_xxx`、列表项等）。注意排除明显不是 ID 的写法（如 `sk_<拼音>` 这类模板，或文件路径的一部分）。
4. 区分"定义"与"引用"。定义 = 某 ID 在其归属文档中以定义形式出现：表格首列或 ID 列、YAML 的 `id:` 字段、条目卡标题（如 `##### 幻阴指 \`sk_huanyinzhi\``）等。归属映射按基准 §18 写成脚本顶部的可配置表，例如：`sk_`/`mv_` → `docs/design/catalog/*.md`、`design/05`、基准 §13；`bf_` → `design/06`；`tr_` → `design/08`；`eq_`/`it_` → `design/10`；`set_` → `design/07`；`tsp_` → `design/13`；`npc_`/`q_`/`rg_` → `docs/design/chapters/*.md`、`design/11`、`design/12`；`sect_` → `design/12` 与图鉴；`ch` → 基准 §2。先读各文档的实际写法再定规则，并把规则写进 README。
5. 报告以下问题（按类别、文件、行号）：
   1. 引用了但没有定义的 ID；
   2. 同一 ID 在多处定义且关键字段不一致（能比对多少就比对多少，至少比对名称）；
   3. 疑似拼写近似的 ID 对（同前缀、编辑距离 ≤ 2，如 `tr_shekou` / `tr_sheku`）；
   4. `docs/decisions/rulings-v1.md` 重命名表中的旧 ID 仍被使用；
   5. 若 `docs/design/07-set-system.md` 已存在：套装成员与图鉴 `setTags` 不对称。
6. 默认只报告、退出码 0；`--strict` 时存在第 1 类或第 4 类问题则退出码 1。`--json` 输出机器可读结果。
7. 在 `tools/lint/README.md` 中写明：用法、规则、已知局限、如何为新的 ID 前缀或文档扩展配置。
8. 对当前仓库运行一次，调整规则，把明显的误报压下去（误报比漏报更伤：审校代理会被误导）。在报告里贴出各类问题的数量和前 20 条示例，并说明你认为哪些是真问题。

调度器会在你结束后运行 `python tools/lint/check_ids.py`（不带 `--strict`），要求退出码为 0。
