# 本任务：按补录结果替换书界首领的替补配装 · {{group_name}}

作者的两条决定（原文照录）：

> 专属武学：Boss 用替补武学的，要不要另开任务补专属武学 - 开
>
> 不一定一定是专属啊，比如灭绝师太，武学应该显然是峨眉派的武学，主角和其他人也有机会学

NXc1 / NXc2 已把首领所缺武学按门派 / 来源补进各图鉴，或指出了可复用的已有武学。它们报告第 7 节的映射表（`tools/agents/reports/NXc1.md`、`NXc2.md`）列出了"书界 / 首领 / 原替补 → 新武学 ID"。先读这两份映射表。

本组书界：

{{doc_set}}

## 要做的事

1. **替换替补**：按映射表，在本组书界的首领配装表中用新武学替换对应的替补，并去掉"（原创扩展配置）/（原创扩展配置·待补专属）"标注。主运、辅运、外功门数仍按 21 §11.9.1 的构建闸门执行。
2. **重算参数与节奏**：
   - 按 21 §11.9 重算七项参数，顶尖人物不得低于地位下限。
   - 用 `tools/balance/boss_pacing.py` 重估逐单位轮数。超出 12–25 轮（精英 6–10 轮）的，按 §11.9.2 调血量 / 防御倍率，不压经脉。
3. **更新"图鉴缺口"表**：已补的写新 ID 与所在图鉴，未补的写明原因。
4. **记录版本**：书界版本行追加"首领替补配装替换（{{date}}）"。只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）。

## 检查

以下命令都必须通过，每次写入不超过约 150 行：
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/agents/check_undefined_in.py`，参数为本组书界，结果须为 0

## 报告

第 7 节写：
- 每部书界替换的配装行数；
- 逐单位轮数，分替换前 / 后列出；
- 仍留替补的单位及原因。
