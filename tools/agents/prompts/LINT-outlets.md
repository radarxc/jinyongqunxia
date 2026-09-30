# 本任务：检查脚本维护 · 路线出口剥离与普通路线唯一性（NR4 交来的两处）

## 背景

NR4 各单元在 GPT 审核中暴露了检查脚本的两个缺口（见 `tools/agents/reports/NR4-daojia.md`、`NR4-wuyue.md` 的"交其他任务"）：

1. `tools/lint/check_skill_catalogs.py` 的 `route_outlet_points`（约第 2367–2388 行）在计算 21 §2.4 路线性质时，只剥离了掌 / 指 / 兵器类动作出口，没有剥离**轻功位移**与**内功 / 护体**路线的动作出口（21 §4.3.1 的位移核心脉、护体任督段），导致这两类路线的尾段被计入性质票数，出现假冲突或漏报。
2. `tools/agents/check_route_unique_for.py` 只检查绝招路线的全仓唯一性，不检查普通路线；五岳册在换绑模板后出现普通路线完全重复，是 GPT 审核而不是脚本发现的。

NR4 十二册已按当前脚本清零并合入。本任务修脚本后要**重新实测全部图鉴**，把计数变化如实报告；若修补让某册重新出现命中，不要为了保持 0 而改图鉴（图鉴不在写集内），列给协调者另派任务。

本任务的文件（只改这些）：
- `tools/lint/check_skill_catalogs.py`
- `tools/lint/test_check_skill_catalogs.py`
- `tools/lint/README.md`
- `tools/agents/check_route_unique_for.py`
- `tools/agents/check_nr4_unit.py`（若输出需要扩展）

## 要做的事

1. **出口剥离**：按 21 §4.3.1 与 §2.4 的文字，把位移路线（含 `mer_zushaoyang` / `mer_daimai` / `mer_yangqiao` 或涌泉的尾段）与内功 / 护体 / 蓄气路线（任督尾段）的动作出口从性质计票里剥离，规则只看武学类型与 21 已写明的出口穴位，不新造规则；三种 `--strict` 模式的输出必须逐字节不变（与修前对比并写进报告）。加单测：每类路线各一例，证明尾段不再投票、体段照常投票。
2. **普通路线唯一性**：`check_route_unique_for.py` 增加普通路线（非绝招）的全仓完全相同检查与 ≥80% 相似报告；默认只报告，加 `--strict-normal` 才报错。加单测。
3. **实测**：修后对全部图鉴各跑一次 `check_nr4_unit.py`（列 12 册的三项计数改前 / 改后），以及 `check_route_unique_for.py` 全仓普通路线的重复 / 相似清单。
4. `tools/lint/README.md` 同步规则说明。
5. 通用：每次写入不超过约 150 行；不改 docs/。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict`
- `python3 tools/lint/check_ids.py --strict`
- `python3 tools/balance/meridian_flow_sim.py --check`

## 报告

第 7 节写：剥离规则的依据条文；三种 strict 模式逐字节不变的证明方式；12 册三项计数改前 / 改后；普通路线重复 / 相似清单；需另派任务处理的图鉴命中；需作者确认的事项。
