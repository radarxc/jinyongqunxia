# 本任务：11 册武学图鉴的绝招与经脉实例一致性（审计第二段）

NU1–NU4 已按作者新规则补足全部 11 册武学图鉴的绝招，NU2S 已把五绝 / 逍遥两册的绝招真值回写到正文卡。新规则如下：
- 各品绝招数：天上 3、天中 2–3、天下 2、地上 2、地中 1–2、地下 1、玄上 1，其余 0。
- `MoveDef.ultimate` 是唯一真值。
- 解锁层：第一 / 第二 / 第三绝招依次在 7 / 9 / 10 重。
- 路线：每记绝招一条自己的路线。

四组的写法和工作区基点各不相同。NU1、NU3、NU4 的基点早于 M4；NU2 曾把 §0.12 写成"权威覆写层"。本任务统一检查并修正全部 11 册：

`docs/design/catalog/skills-{shaolin,daojia,general,wujue,xiaoyao,yitian,xiake-bixue,wuyue,kangxi,qianlong,gulong}.md`

## 要做的事

1. **V-M01 一致性**（21 的校验项）：
   - 每记绝招在正文卡中都是 `ultimate:true`，路线表 / 索引中也是 `true`，二者一致；不得有"覆写层"或 `/false/` 残留。
   - 正文卡上的绝招资源：气势 100、收招 1200，耗内按天 / 地 / 玄上分别为 10% / 9% / 8%。
   - 倍率按 05 的绝招预算。
   - 降为普通招的按普通招预算，并标 `ultimate:false`。
2. **数量与解锁层**：逐门核对。NU4（康熙 / 乾隆 / 古龙）基点早于 M4，重点查以下两点，违规的改正：
   - 第二、第三绝招是否在 9 / 10 重；
   - 同门绝招的路线是否互不相同：该组用 59 个骨架承载 110 记绝招，逐门查同门绝招是否共用同一骨架或照抄穴位序列（21 §4.3 第 2 条）。
3. **显式路线**：天 / 地阶的逐招路线显式列出 `mfr_*`，不用隐式派生（检查脚本不放行 `mfr_<招式ID去掉mv_>` 的派生写法）。NC1 的派生写法改为显式列表。玄 / 黄阶按 21 引用共享模板。
4. **调息档案**：所有 `txp_*` 都带 `outOfBattleScaleBp`。九阳神功等缺失的调息档案按 21 的规则补登记。
5. **Buff 迁移**：N06 登记了新 Buff（`bf_shouqin`、`bf_xueweishoufeng`、`bf_jingqizhizhi`、`bf_jingmaizhangsun`、`bf_hutineijin`）并给出旧 ID 迁移表。图鉴中运行时引用 `bf_fengxue` / `bf_fengnei` / `bf_fengjingmai` / `bf_chanrao` 的地方，改为"新状态 + 等级"。
6. **自动检查**：可行的话，在 `tools/lint/` 新增绝招一致性检查（V-M01、各品数量、解锁层、同门路线互异），并补测试。不可行则在报告中说明原因，并给出你用于核对的方法。不要为降数字放宽现有规则。
7. 各册版本行追加"图鉴一致性审计（{{date}}）"；只改相关条目，不删无关内容（调度器拒绝缩短 15% 以上）。

检查：以下命令必须通过，每次写入不超过约 150 行，逐册推进：
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest tools/lint/test_check_ids.py`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/agents/check_undefined_in.py` 加上 11 册的路径：结果须为 0。

## 报告

第 7 节写：
- 逐册核对表：各阶门数、绝招数（正文卡 / 路线表两处）、解锁层违规数、同门路线重复数、隐式路线数、缺 `outOfBattleScaleBp` 数；分修正前 / 后。
- Buff 迁移替换数。
- 自动检查的实现与测试。
- 仍需作者确认的条目。
