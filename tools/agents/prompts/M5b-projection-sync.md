# 本任务：外放加持（AR-16）的规则与技术文档同步

作者新设定（原文）："再补一个设定，经脉修为上升后，对外放的武功会有范围加持（比如弹指神通，独孤九剑，降龙十八掌），原理是气是武功外放的能力，经脉运转快真气多，自然外放范围和威力就会剧增"。

M5 已登记 AR-16，在 `docs/design/21-meridian-flow-and-moves.md` 新增"外放加持"一节，同步了 04，并新建 `tools/balance/projection_sim.py`。先读 21 的该节、04 的相关段落与 `tools/agents/reports/M5.md`（第 7 节列出了下游同步清单），再按清单同步下列文档。武学图鉴的逐招标记由后续任务 M5c 处理，本任务不改图鉴。

## 要做的事

1. **05**（`docs/design/05-martial-arts-system.md`）：
   - 在 `MoveDef` 中加入外放标记与基础射程 / 作用范围字段，字段名与 21 一致。
   - 写明判定标准与示例（弹指神通、独孤九剑剑气招、降龙十八掌等）。
   - 补对应的校验项。
2. **09**（`docs/design/09-combat-system.md`）：
   - 格子上的射程与作用范围如何随外放加持变化：取整、形状档位、遮挡与地形。
   - 选目标规则。
   - AI 如何利用扩大后的范围（多目标评分）。
   - 敌方单位同样适用。
3. **14**（`docs/design/14-ui-ux-mobile.md`）：
   - 出招前预览当前射程与范围（含加持来源）。
   - 被点穴或经脉堵塞导致范围缩小时的提示。
4. **tech/04**（`docs/tech/04-data-pipeline.md`）：
   - 构建校验包括新字段的合法区间、外放招式路线的穴位要求等。
5. **tech/05**（`docs/tech/05-gameplay-engine.md`）：
   - 范围计算在引擎中的位置与确定性。
   - 预估零副作用。
   - 回放一致。
6. **基准**（`docs/00-canon.md`）：
   - 若 M5 提了基准提案，按基准的版本规则登记，写进变更记录。
   - 同时更新 `docs/decisions/canon-proposals-v1.2.md` 的处理结果。
7. **作者另两项决定同步到 05 §3.5**（原文照录）："'九品玄'的理解：按'玄上'执行。"——去掉 05 中这一条的"待作者确认"，改为"作者已确认（2026-09-27）"；"绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一。"——在 05 §3.5 写入这条判据，并引用 NU5p 的裁定表 `docs/decisions/ultimate-counts-tianzhong-dizhong.md`。
8. 各文档的版本行 / 变更记录追加本条。只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）。

## 检查

每次写入不超过约 150 行。以下命令必须通过：

- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`

## 报告

第 7 节写：
- 处理总表（来源 / 条目 / 目标文档与节 / 状态）。
- 新增字段与校验项清单。
- 留给图鉴任务 M5c 的逐招标记规则摘要。
