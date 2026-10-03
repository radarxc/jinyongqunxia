# 本任务：人物差异化小返修 · {{scope}}（同门人物脸、姿势、衣色几乎一样，需拉开区分度）

本任务出图并登记。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读 `tools/agents/prompts/_codex_worker.md`（runner 由追踪者在沙箱外跑，你只入队取结果；`worker_no={{worker_no}}`，槽位 2）、`_codex_portrait.md`、`assets/default/prompts/characters/GUIDE.md` §0。

## 要做的事
1. 对下列人物逐人改写提示词的面部辨识点、年龄、体型、站姿与衣色（同门制式可同形制但配色 / 配饰 / 发式 / 神情各不同），再用 `ref=text` + 两张同性别基线重出：{{people}}
2. 拼一张 {{n}} 人并排的联系表，确认两两可区分；每人最多重出 2 次。
3. `ingest8.py <job> --no-commit` 入库，覆盖原 asset_id，`redo_reason` 写「同门差异化」。

## 约束
- 只写：{{writes_list}}、本任务报告。每次写入 ≤ 150 行；报告 ≤ 30 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_asset_dirs.py "assets/default/character/*/{{ch}}" --min 1 --max 999`
- `python3 tools/lint/check_ids.py --strict`
