# 本任务：名录门槛重配 {{part}} · 按属性 v2 规则重写 `reqs`（加内息与修炼加成；AR-27、DES-attr-v2）

本任务改名录文档的机器行，不写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`docs/decisions/author-requirements.md` AR-27；`docs/design/03-attributes.md`（八项先天属性含内息 `bre`、修炼永久属性加成 `trainingAttrs`、§7.0 熟练度 / 真元 / `ap*` 迁移）；`docs/design/05-martial-arts-system.md` §7.3.1–§7.3.3（类别 × 品阶门槛表、迁移算法、30 门样例）；`tools/agents/reports/DES-attr-v2.md` §3、§7；`tools/lint/check_skill_catalogs.py` 与 `tools/lint/README.md`（机器行格式）。

## 本任务范围
{{files}}

## 要做的事
1. 对范围内每份名录的每一条武学 / 内功，按 `design/05` §7.3 的「类别 × 品阶门槛表」与「迁移算法」重写 `reqs`：
   - `attrs` 加入内息 `bre`（内功 / 外放类按表取值；纯硬功可为 0 或不列，按表）；现有七项按迁移算法重算，不是简单加一项；
   - `aptitude` 按 §7.0 的 `ap*` 迁移口径改写；
   - 加 `train`（修炼永久属性加成的触发门槛 / 上限，字段名与格式照 `design/05` §7.3.1 定义；若该节未定义字段名，用 §7.3.3 样例里的写法）；
   - `prereq` / `sect` / `hard` 不动。
2. 每份名录末尾的「数据校验规则」小节若有门槛相关规则，同步；文首「上游」加 `design/03`（v2）。
3. 抽每份名录 2 条在报告里写出重算过程（旧值 → 表格行 → 新值）。
4. 与 §7.3.3 的 30 门样例重合的条目，结果必须与样例一致。

## 约束
- 只写：范围内的名录文件、本任务报告。
- 不改 design/03、05、其他名录；不新建 ID、不改 ID。
- 每次写入 ≤ 150 行；机器行格式不能破（`check_skill_catalogs.py` 要过）。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_skill_catalogs.py`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节写：改了多少条、2 条重算过程、与 30 门样例重合的核对结果；第 6 节写发现的表格缺口（哪类 × 哪品阶没有门槛值）。报告 ≤ 50 行。
