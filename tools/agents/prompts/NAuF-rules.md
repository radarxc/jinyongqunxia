# 本任务：终审拆分 · 规则文档乙（design/03、05、07、10、20、21）

你负责"经脉系统落地最终核对"（原 NAu-final）按写集拆出来的一个并行子任务。终审拆成多个任务同时运行，**只改本任务写集内的文件**；写集外发现的问题写进报告第 6 节与第 7 节"交其他任务"，由后续的图鉴任务或最后的收口任务 NAu-final 处理。

背景一览（均已合入，报告在 `tools/agents/reports/<ID>.md`，第 5 节是对基准的修改提案，第 6 / 7 节是各自的遗留与交办）：基准 v1.3–v1.8（A4、NA1、M5b、NAu-canon、NXT、NYY）；21 号文档 v2.x（M2、M3、M4、NB3、M5、NR0、NAu-21、NYY）；绝招新规则与图鉴补足（M4、NU1–NU4、NU2S、NU5p、NU5a、NU5b）；图鉴一致性（NA2、NL、NL2、NL3）；首领配装与统一口径（NB1–NB4b）；按书补录首领武学（NXB01–NXB14）；外放加持（M5、M5b、M5c1、M5c2）；路线叙事化与唯一性（NR0–NR3）；天阶扩容（NXT）；终审前序（NAu-lint、NAu-tech、NAu-rulesA、NAu-rulesB、NAu-21、NAu-canon、NAu-nxt）；门派图鉴收尾（NXfix-<11 册>、NXfixC）；书界收尾与补漏（NXfixD-01…14、NXfixE-a / b / c）；阴阳理论 AR-18（NYY）、图鉴性质落地（NR4-<12 单元>）与规则文档性质同步（NR4S-rules，刚合入，改过本写集的六份文档）。

作者的相关决定（原文）："绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一"；"降龙十八掌，六脉神剑，火焰刀，拈花指，这些都是外放啊。确定一下"；"音功：基础不算外放（音波），但内力深厚对音波的控制强，能量大，所以是外放"；"大手印的跃击：掌风算外放"。

并行的兄弟任务与它们的写集（不要越界）：`NAuF-sysA`（design/01、02、04、06、08、09、12–18 与 tech/01、03、04、05、08、09）；`NAuF-book-<NN>`（chapters/NN、npcs-chNN、story/NN）；`NAuF-assets`；`NAuF-canon`；`NAuF-lint`。**本任务合入之后**才启动 `NAuF-cat-<单元>`（各册武学图鉴，按本任务写下的唯一算法改图鉴），最后是收口任务 `NAu-final`。

通用要求：每次写入不超过约 150 行；只改相关段落，不删无关内容（调度器拒绝缩短 15% 以上）；改动的文档版本行 / 变更记录追加"经脉落地终审（{{date}}）"；ID 先 `grep -rn` 查重，不新造无依据的 ID；需作者拍板的事项先给默认值继续做，并列入报告第 4 节。

本任务的文件（只改这些）：

- `docs/design/03-attributes.md`
- `docs/design/05-martial-arts-system.md`
- `docs/design/07-set-system.md`
- `docs/design/10-items-and-equipment.md`
- `docs/design/20-legacy-inheritance.md`
- `docs/design/21-meridian-flow-and-moves.md`（**不得改任何路线的穴位序列、段数、CT、风险**——§12.1 三条降龙路线会被检查脚本投影进五绝册的计数）

## 要做的事

1. **绝招条件加成的唯一算法（写进 05 §4.8）**：门派图鉴收尾任务各自处理时出现三种做法——加法（`3.00+0.30=3.30`，古龙、五岳）、乘法（`3.00×(1+0.30)=3.90`，五绝、康熙，如康熙夜隙一闪 3.15→3.45）、只把条件当触发门槛不抬倍率（乾隆）；逍遥册无痕、明鉴、听香、两宗合璧、同心 5 记用"乘法后扣回条件收益"维持原值，扣减远超 ±0.05 手调。
   - 先查 `docs/decisions/author-requirements.md` 与 `author-decisions.md` 有没有作者对此的决定；有就按决定。没有就按 05 §4.2 公式的字面读法 `power = 3.00 × AF × (1+Σadj)`（乘法）定为唯一算法，并列入"需作者确认"。
   - 在 05 §4.8 写明：唯一算式与取整；"条件只作触发门槛、不抬倍率"是否允许以及怎么在卡上标；±0.05 手调的边界；"乘法后扣回条件收益"这类做法不再允许时图鉴应怎么改（重算倍率或改成门槛型）；给 3 个算例（加法旧卡、乘法卡、门槛型各一）。写到图鉴任务照着就能逐记重算的程度。
   - **本任务不改图鉴**。在报告第 7 节列出"各册需要重算的绝招清单"（册 / 招式 ID / 现值 / 现做法 / 按唯一算法的应值），供 `NAuF-cat-<单元>` 执行；清单用 `grep` 与 `tools/lint/check_skill_catalogs.py` 的输出生成，不凭记忆。
2. **05 的其余指名条目**：同步龙爪手第二绝招口径（NXfixC 报告）；斩马"目标骑乘"条件的正式 `MoveCondition` 键（复用 `targetHasTag` 或新增，写进 05 的条件键清单）；通行册陷阵 `mfr_pojunqiangfa_xianzhen`（突进后单体伤害 2.85）现为 `purpose:movement`，按 05 §4.2.1 伤害招应为 attack——05 若需写明判据就写明，图鉴改动交 `NAuF-cat-general`。
3. **design/10**：给 `eq_changchangfengshibei` 补 exotic / misc 分类；物品占位 ID `it_ningxue_miji`、`it_shenzhao_yuwen`、`it_canye_xuedaojing`（康熙册 D-03）定正式 ID 并在 10 登记，报告里写明"旧 → 新"，图鉴引用同步交 `NAuF-cat-kangxi`。
4. **design/07**：审补录天级套装与崆峒七伤套装（成员、计件、跨品阶与有效品阶规则、双向 `setTags` 是否闭合；崆峒五行心法是否加入 `set_kongtong_qishang` 默认不加）。
5. **design/21 收尾同步三项**（NAu-21 交来）：§4.4.1.1 穿云啸一行补"断喝 / 回声"（`mv_chuanyunxiao_duanhe` / `mv_chuanyunxiao_huisheng`，判为外放，人声发劲，路线收于天突 / 廉泉，见通行册 AR-16 表）；§18.6 音功逐招清单按各门派收尾任务合入后的实际标记刷新；§18 中"04 / 05 / tech/04 音功分支尚未同步"按 NAu-rulesB、NAu-nxt 合入后的实况回填。
6. **收拢遗留**：读全部任务报告第 6 / 7 节里指向本写集六份文档的"需同步 / 交其他任务"条目（`grep -rln` 按文档名检索 `tools/agents/reports/`），处理尚未被处理的；已由 NR4S-rules 处理过的不要重复改。
7. **一致性**：21 与 03 / 05 / 07 / 10 / 20 的字段名、ID、结算顺序、数值互相一致；与 04 / 06 / 08 / 09 / 13–15 / tech 的不一致列入"交其他任务"（那些文档在 `NAuF-sysA` 写集）。
8. **不做的事**：不刷新文首引用的基准版本号、不改 05 §14 的武学总数（收口任务统一处理）。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- `python3 -m unittest discover -s tools/lint -p "test_*.py"`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `python3 tools/balance/projection_sim.py --check`
- `python3 tools/balance/boss_pacing.py --check`
- `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict`
- `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-*.md`（全部图鉴三项计数不得因本任务改动而变化）

## 报告

第 7 节写：05 §4.8 唯一算法的条文摘要与三个算例；**各册需要重算的绝招清单**（供图鉴任务执行）；指名条目处理总表（位置 / 改前 → 改后）；design/10 物品 ID"旧 → 新"表；遗留清单；交其他任务的条目；需作者确认的事项（逐条附默认值）。
