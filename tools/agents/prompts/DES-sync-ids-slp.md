# 本任务：文档同步 · 休眠事件 ID 转正式注册（`slp_*` 归属 `story/sleep-events.md`；DES-sleep-events 报告 §6 第 1 条）

本任务只做 ID 注册与校验器归属表的最小改动，不改设计内容。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/reports/DES-sleep-events.md` §6、`docs/design/story/sleep-events.md` §1、§7，`tools/lint/check_ids.py` 的 `OWNERSHIP` 表与 `tools/lint/README.md`、`tools/lint/test_check_ids.py`。

## 要做的事
1. `tools/lint/check_ids.py`：在 `OWNERSHIP` 表接纳前缀 `slp_`，归属 `docs/design/story/sleep-events.md`；照现有前缀的写法，**只加这一项**，不改其他逻辑。有单测就补一条（`tools/lint/test_check_ids.py`）。
2. `docs/design/story/sleep-events.md`：把 §1 总表与各书小节里的「建议 ID `slp_…`」改为正式注册（去掉「建议 ID」字样，按该文 §7「本文新增术语与建议 ID」的格式登记为正式 ID，共 28 个），保持 ID 字符串不变。其余内容一字不改。
3. 运行 `python3 tools/lint/check_ids.py --strict`，新增严格失败数必须为 0；基线里已有的 `sk_babuganchan` 提示不算。

## 约束
- 只写：`tools/lint/check_ids.py`、`tools/lint/test_check_ids.py`、`docs/design/story/sleep-events.md`、本任务报告。
- 不改任何 `story/NN`、`chapters/NN`（挂接口归 DES-story-hooks-* 任务）。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：`OWNERSHIP` 改动的行、转正式的 28 个 ID 清单；报告 ≤ 30 行。
