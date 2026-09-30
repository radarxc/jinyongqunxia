# 本任务：阴阳性质同步 · 书界 {{book_no}}《{{book_name}}》（AR-18 落地后的章节与人物档案同步）

## 背景

- AR-18（作者 2026-09-29）改写了内功阴阳的判定：按主修经脉计票，正逆周天不定阴阳。NYY（08ee6b6）落地了规则与检查脚本；NR4 十二个单元按新口径改了各册武学图鉴：补 `inner.meridians`、改内功 `nature`（连带 `BreathProfile.nature`、`requiredNature`、护体档、调息值）、改路线体段。
- 图鉴改完后，书界章节里引用这些内功的地方还是旧值：Boss / 精英配装的 `innerNature`、七参与节奏估算、§9.6 一类的"本书内功"说明、人物档案的武学栏、传承候选的性质要求、剧情里"阴性 / 阳性内功"的措辞。本任务只同步本书界。
- 各 NR4 报告的"交其他任务"一节列了已知条目（`tools/agents/reports/NR4-*.md` §6 或 §7）；`docs/design/05-martial-arts-system.md` §5.3.1 有内功迁移清单。以图鉴现值为准，报告只是线索。

本任务的文件（只改这些）：
- `{{chapter}}`
- `{{npcs}}`

## 要做的事

1. **列出本书界引用的全部内功**：从章节的配装表、§9.x 内功说明、人物档案武学栏、传承候选里找出所有 `sk_*` 内功 ID，对照各册图鉴现值（`nature`、`BreathProfile.nature`、`requiredNature`），列一张"引用处 / 内功 / 图鉴现值 / 章节现值 / 是否需改"的表。
2. **逐处同步**：
   - 配装 `innerNature` 改为图鉴现值；主运 / 辅运 / 外功的性质相冲按 design/05 相冲规则复核，相冲的改辅运或写明接受相冲（作者未定的列入"需作者确认"，默认保持配装、写明相冲代价）；
   - 七参与节奏：性质改动影响调息 / 护体的，用 `python3 tools/balance/boss_pacing.py` 重算并更新表中数值；
   - 说明文字（"阳性内功""基础阴性内功"等）与图鉴一致；
   - 人物档案武学栏若镜像了性质，改为图鉴现值；
   - 传承候选的性质要求（design/20 引用）按图鉴现值改写本章节内的对应句。
3. **已知条目**（协调者从 NR4 报告汇总，逐条处理，处理结果写进报告）：{{items}}
4. **通用**：每次写入不超过约 150 行；只改相关段落，不删无关内容；版本行追加"阴阳性质同步 AR-18（{{date}}）"；不新造 ID；本书界以外的引用列入"交其他任务"。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/agents/check_undefined_in.py {{chapter}} {{npcs}}`

## 报告

第 7 节写：引用表（全部内功引用及处理结果）；配装相冲清单与处理；重算过的七参 / 节奏值改前改后；需作者确认的事项；交其他任务的条目。
