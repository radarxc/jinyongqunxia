# 本任务：阴阳性质同步 · 规则文档与图鉴互引（AR-18 落地后的系统文档同步）

## 背景

- AR-18（作者 2026-09-29）改写了内功阴阳的判定：按主修经脉计票，正逆周天不定阴阳。NYY（08ee6b6）落地了规则与检查脚本；NR4 十二个单元按新口径改了各册武学图鉴：补 `inner.meridians`、改内功 `nature`（连带 `BreathProfile.nature`、`requiredNature`、护体档、调息值）、改路线体段。十二册已全部合入，`tools/agents/check_nr4_unit.py` 逐册三项计数为 0 / 0 / 0。
- 书界章节与人物档案（`docs/design/chapters/NN-*.md`、`docs/design/catalog/npcs-chNN-*.md`）由 NR4S-01 … NR4S-14 并行同步，**不在本任务写集内**。
- 本任务同步的是**规则 / 系统文档**与**图鉴之间的互相引用**里残留的旧性质：性质代表举例、辅运算例、武学样卡、传承校合门槛、套装说明、物品特例、前置 / 底座的性质假设。各 NR4 报告第 6 节"需同步到其他文档"列了已知条目（`tools/agents/reports/NR4-*.md`）；以图鉴现值为准，报告只是线索。

本任务的文件（只改这些）：

- `docs/design/03-attributes.md`
- `docs/design/05-martial-arts-system.md`
- `docs/design/07-set-system.md`
- `docs/design/10-items-and-equipment.md`
- `docs/design/20-legacy-inheritance.md`
- `docs/design/21-meridian-flow-and-moves.md`（**只改性质标签与说明文字**；不得改任何路线的穴位序列、段数、CT、风险——§12.1 三条降龙路线会被检查脚本投影进五绝册的计数）
- `docs/design/catalog/skills-*.md`（**只改跨册引用处**残留的旧性质文字、前置 / 套装 / 底座的性质假设；不改任何武学卡自己的 `nature`、`inner.meridians`、路线与数值）

## 要做的事

1. **建立"内功性质现值表"**：写一次性脚本（不入库）或用 `python3 tools/lint/check_skill_catalogs.py --delivery --details`，列出全部图鉴里每张内功卡的 ID、中文名、现 `nature`。再从 12 份 NR4 报告第 7 节"改性质清单"汇总"NR4 期间改了性质的内功"（改前 → 改后）。两张表的生成方式与条数写进报告；后面每一步都以这张现值表为准。
2. **`design/05`**：
   - §5.3.1 现在是 NYY 当时的只读基线快照（254 张内功卡、缺主修经脉 107、性质不符 56）。保留基线表作历史，在其后追加"NR4 落地结果"小节：脚本实测的全库三项计数；各册"内功卡 / 有主修经脉 / 性质不符"现值表；NR4 期间全部改性清单——既含基线 56 张，也含基线当时因缺字段不可审计、补主修经脉后才改性的卡（道家册另有 5 门、五绝册清单由 6 门变 9 门等，见各报告）。数字以脚本与图鉴实测为准，不照抄报告。
   - §5.3 性质代表举例、§5.6 辅运算例、§9.1.4 葵花宝典、§13.4 九阳神功样卡（标题"天上 · 内功 · 阳"、YAML `nature`、依赖展示），以及全文其他镜像了内功性质的地方，都改为图鉴现值。涉及数值的算例要按现值重算并写出算式，不能只改一个词。
3. **`design/03`** §5.2 内功性质示例：按现值改（NR4 报告点名的有吸星、葵花、九阳）。
4. **`design/21`** §10.4 代表内功差异：九阳标签 `12 天上 / 阳` 改为现值；"只对阳体段路线减迟滞 500 bp"这类武学特色可以保留。全文其余镜像内功性质的文字同查。
5. **`design/10`** 乾坤一气袋触发条件："天阶阳性主运使袋迸裂"不再覆盖改为调和的九阳。保留"九阳撑破"的显式特例或等价机制，写清触发条件。
6. **`design/20`**：§9.4.3 九阳全本的功能条件 `C12（阳）`、§9.5.2 / §9.5.3 吸星与葵花的 `C11（阴）`、§10.7 混元功的 `C9（阳）`，按图鉴现值改写并复核校合条件是否仍然可达；全文其余"Cn（性质）"门槛逐条对照现值表。《阳脉卷》之类叙事名在不误导规则时可保留。
7. **`design/07`**：逐套核查套装说明里有没有"同性质""阴阳搭配"之类依赖成员内功性质的表述或数值（NR4 报告点名：九阴调息篇、辟谷气篇所在的九阴正宗，约第 460、625 行）。成员清单与计件不因性质变化而改；隐含的性质假设按现值改写或注明。
8. **图鉴互引**：`skills-bulu-01`（段氏养生功作前置，约第 34、72 行）、`skills-bulu-12`（壮行功作铁胆庄心法前置，约第 54 行）、`skills-bulu-06` / `07` / `09`、`skills-shaolin` 等册里引用他册内功并写了旧性质或含性质假设的文字，改为现值；纯 ID 引用不改。
9. **全量复查**：对"NR4 期间改了性质的内功"逐门 `grep -rn`（ID 与中文名）在本任务写集文件内的全部出现处，逐处判断是否镜像了旧性质，处理结果列表写进报告。写集外的命中（`chapters/`、`npcs-ch*`、`story/`、`tech/`）不改，列入"交其他任务"。
10. **通用**：每次写入不超过约 150 行；只改相关段落，不删无关内容；版本行追加"阴阳性质同步 AR-18（{{date}}）"；不新造 ID；需作者拍板的先给默认值并列入报告第 4 节。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict`
- `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-*.md`（全部图鉴三项计数仍为 0，不得因本任务改动而变化）

## 报告

第 7 节写：内功性质现值表与改性总清单的生成方式和条数；逐文档处理表（位置 / 改前 / 改后）；重算过的算例（算式）；第 9 步的全量复查结果；交其他任务的条目；需作者确认的事项（附默认值）。
