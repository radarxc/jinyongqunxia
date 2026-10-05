# 本任务：天龙垂直切片人物的 `full` 画像与岳老三 Boss 专场模拟；补齐 F2 点名的天龙具名人物

`tech/09` P1/M2 天龙切片需要真实人物数据：主角（男 / 女）、书灵、段誉、钟灵、木婉清、岳老三（南海鳄神）、无量剑派弟子与神农帮帮众杂兵、蛇、闪电貂。F2 终审另点名天龙缺稳定资料的具名人物：康敏、全冠清、耶律洪基等。本任务把这些人物补到"可直接配表"的 `full` 画像，并为岳老三跑一次 `full` 专场模拟。

## 必读

- `docs/design/18-npc-and-companions.md` §5–§7（`born/died`、年龄段、`full` 管线 `finalStats = design03.full(innateAged, displayLevel, skills, equipment, templateRole)`、同伴 `hpMax` 须落在同级 `tmpl_boss` 气血 ×0.6–1.2）；`docs/design/03-attributes.md` §2、§10（先天、敌人模板、Boss 数值）；`docs/design/04-damage-formula.md` §8–§9；`docs/design/09-combat-system.md` §8（Boss 脚本 `bsc_*`、阶段、AI 性格）。
- `docs/design/catalog/npcs-ch01-tianlong.md`（现有条目：`npc_yuelaosan`、`npc_zhongling`、`npc_muwanqing`、段誉、书灵等）；`docs/design/chapters/01-tianlong.md` §8（人物与 Boss）、§12（数值要点）；`docs/tech/09-roadmap.md` §3.2–§3.4（切片人物清单与边界）。
- `docs/design/catalog/skills-xiaoyao.md`（四大恶人武学、无量剑派、神农帮）、`skills-wujue.md`（大理段氏）、`skills-general.md`（杂兵通用武学）。
- `tools/balance/damage_sim.py`、`tools/balance/README.md`（现有 42 遭遇模型；看如何加具名 Boss 专场）。

## 要做的事

1. **切片人物 `full` 画像**（写入 `npcs-ch01-tianlong.md` 对应条目，格式沿用该册的完整条目卡）：七项先天（附年龄修正）、显示等级、装配武学（`sk_*` 与层数）、装备（`eq_*`）、性格 / AI 模板、招募难度与切片内状态；主角男 / 女两版只写切片起始面板（先天由创角决定，给"默认分配"）；杂兵用 `tmpl_normal` 参数 + 模块化差异表；蛇与闪电貂用 09 的动物模板。
2. **岳老三 Boss**：完整 `bsc_*` 脚本（阶段、预警绝招、"鳄嘴剪"机制、狂暴条件、台词触发键）、`full` 面板算式；在 `tools/balance/damage_sim.py` 增加一个具名遭遇 `enc_01_yuelaosan_slice`（切片难度：主角 Lv≈8–12），输出普通 / 精英 / Boss 三档 TTK 与 04 区间比对；`--check` 增加对应断言。
3. **F2 点名的具名人物**：康敏、全冠清、耶律洪基（及 F2 报告中天龙其余点名者）补稳定资料：生卒 / 出场年份（**（待考）**处标注）、层级 D1–D5、身份、切片外的登场书界与状态；不需要 `full` 面板的只写"预算画像"并明确标注。
4. `chapters/01-tianlong.md` §8 / §12 同步引用（不复制数值，只写"见名录条目"）。

## 验收标准

- `npcs-ch01-tianlong.md` 中切片人物条目均含 `pipeline: full` 与完整面板算式；`grep -c "npc_yuelaosan"` ≥ 3。
- `python3 tools/balance/damage_sim.py --check` 通过且包含新增的岳老三断言；`python3 tools/lint/check_ids.py --strict` 通过。
- 报告第 3 节给出岳老三 TTK 与 04 区间对比；第 6 节列出 T2（数据探针）可直接导入的字段清单。
