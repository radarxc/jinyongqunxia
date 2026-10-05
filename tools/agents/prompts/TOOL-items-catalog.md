# 本任务：工具 · 物品生成器跟上名录扩充（去掉写死行数，重新生成 content/items）

本任务改工具并重新生成数据。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `content/CLAUDE.md`、`content/README.md`；
- `tools/content/items_from_catalog.py` 全文；
- 报告 `tools/agents/reports/ENG-18-content-build.md`：物品现在按书界包分片，不再整包内联进 worker。

## 为什么做

`python3 tools/content/items_from_catalog.py --check` 现在失败：`items-food.md expected 28, got 174`。原因：生成器在 `EXPECTED_COUNTS` 里写死了每份名录的行数和总数 366，而名录已经扩充多次：
- 食材食品扩到 174；
- 兵器两次扩充；
- 服饰矩阵；
- 秘籍扩充在审；
- 药材是新名录 `items-herbs.md`，来自 DES-economy-gather。

序章要用的 `it_tao`、`it_aqing_qingcha` 等只在名录里，生成不出来，CONTENT-ch00 因此卡住。

## 要做的事

1. 去掉写死的行数。改为：
   - ID 唯一、每行都产出一件物品、字段解析失败即报错；
   - 名录清单从 `docs/design/catalog/items-*.md` 自动发现，包括 `items-herbs.md`；
   - 如有官方 ID 登记表（design/10 文末登记表），与它核对数量；没有就只核唯一与解析。
2. 重新生成 `content/items/**`；`--check` 模式验证生成结果与仓库一致。
3. 新增或扩展 `tools/content/test_items_from_catalog.py`：扩充后的计数、重复 ID、坏行三条反例。
4. 关注体积：`pnpm size` 若因物品数大增超预算，先确认 ENG-18 的分片是否已生效。不放宽预算；超了就在报告里写清楚数字，交开发监督裁定。

约束：
- 写集：`tools/content/items_from_catalog.py`、`tools/content/test_items_from_catalog.py`、`content/items/**`。写集外的改动在提交时会被丢弃。
- 不改 `docs/**`；名录有问题就在报告里列出，不改名录。
- 只用 Python 标准库；每次写入 ≤ 150 行。
- 不得放宽、跳过或改写任何门禁测试。

检查：以下命令必须全部通过。
- `python3 tools/content/items_from_catalog.py --check`
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:validate`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 各名录的行数；
- 新旧生成数量对比；
- 体积变化；
- 名录里发现的问题。

报告 ≤ 40 行。
