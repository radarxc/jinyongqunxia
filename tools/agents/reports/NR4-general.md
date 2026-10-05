# NR4-general 报告 · 阴阳性质落地 · 通行（AR-18：主修经脉、内功性质、路线性质）

## 1. 摘要（3–6 行）

已按 AR-18 完成通行图鉴的阴阳性质落地：脚本覆盖 8 门，人工逐张核对全部 14 门内功；5 张黄阶紧凑卡均把已有经脉依据规范为显式 `inner.meridians`。
金盾、武馆、江湖、山野、壮行、吐纳浅诀、呼吸行气共 7 张卡依经脉计票改性，并同步卡面、调息档案、紧凑路线约束和护体显示；扎马步、丹田养气保持阳。
7 条性质冲突路线均以替换穴位修正性质，不改出招方式、段数、逐段 CT、收招或 ID；改后路线性质与武学性质一致。踹门因新路线跨性质换脉将第 5 段风险 `180→200`，其余六条风险不变。
最终 `--delivery` 三项由 `7 / 1 / 3` 降为 `0 / 0 / 0`；38 条路线无完全重复、无新增 `overlapBp≥8000` 配对，全部指定门禁通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/catalog/skills-general.md` | 1675 | 文首绝招路线索引；14 门内功位于 §2.3、§3.3、§4.2～§4.4、§5.4～§5.5、§6.2～§6.4、§7.4～§7.5；§10.3 统计；§11.6 路线与调息镜像；§13 校验；§14 依赖 |
| `tools/agents/reports/NR4-general.md` | 139 | 本报告：14 门人工核对、经脉与性质迁移、7 条路线、delivery 前后计数、门禁和跨册交接 |

仅修改任务写集内两份文件；没有新建游戏内容 ID。

## 3. 关键结论与数值

- 内功逐主修经脉计票：任脉与手足三阴投阴，督脉与手足三阳投阳；冲脉、带脉按 AR-18a 默认不投票；平票或无票取调和。正逆周天不参与性质判定。
- 本册 14 门内功最终为阳 5、阴 6、调和 3，合计 `5+6+3=14`；全册 135 门武学最终为阳 35、阴 13、调和 62、中性 25，合计 `35+13+62+25=135`。
- 调息按 `natureBp(yin/yang)=10000`、`natureBp(harmony)=10500` 重算；新增返修三档为壮行 `500+200+800=1500`、`120+48+180=348`（性质变而数值不变），吐纳浅诀 `500+300+800=1600`、`120+72+180=372`，呼吸行气 `500+100+800=1400`、`120+24+180=324`；其余四档核算见图鉴 §11.6.6。
- 8 段、90 CT 路线保持 `8×90=720 CT`，加 1200 收招为 1920 CT，风险 `100+120+…+240=1360`；天王补心针保持 `8×75=600 CT`、总时 1800 CT、风险 1080；三条 6 段路线均保持 `6×100=600 CT`、总时 1800 CT，破阵／封路风险各 900，踹门因跨性质换脉为 `100+120+140+160+200+200=920`。
- `check_skill_catalogs --strict --diversity-strict` 结果为 38 routes / 38 distinct sequences / 0 exact pairs / 0 pairs ≥80%；`check_nr3_unit.py general` 复核未新造全仓 ≥80% 配对。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 当前处置 |
|---|---|---|
| `AR-18a` | 冲脉、带脉是否参与内功与路线性质计票 | 默认不投票；只有冲／带或没有阴阳票时取调和 |
| `AR-18b` | 后溪是否加入外放 13 端点白名单 | 默认不加入；后溪仍可作明确掌刃动作末端，外放须另命中既有白名单穴 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无新增提案 | AR-18 已由 Canon v1.8、`design/05` §5.3 / §5.3.1、`design/15` 与 `design/21` v2.7.2 完整承载；AR-18a/b 沿用既有待确认项，不重复立项 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `docs/design/chapters/09-liancheng.md` §12 对手配装 | 花铁干、水岱、刘乘风、陆天抒的主运 `sk_jianghutuna` 仍显式写“调和”；改为阴，并按阴性主运复核 `nature`、调息与 TTK 镜像 |
| `docs/design/chapters/13-feihu.md` §12 对手配装 | 钟兆文、钟兆英、钟兆能、张云飞、黄希节、欧阳公政的主运 `sk_jianghutuna` 仍显式写“调和”；改为阴，并重算相关档案 |
| `docs/design/chapters/10-baima.md` §12 对手配装 | 霍元龙、陈达海以 `sk_jianghutuna` 主运，吕梁／镖局精英以 `sk_wuguanxinfa` 主运；当前行仍使用 `harmony` 模板，须改为阴并重算调息／TTK |
| `docs/design/chapters/11-yuanyang.md` §12 对手配装 | 太岳四侠以 `sk_wuguanxinfa` 主运、周威信以 `sk_jianghutuna` 主运；当前行仍使用 `harmony` 模板，须改为阴并重算调息／TTK |
| `docs/design/catalog/npcs-ch01-tianlong.md` 第 33–34 行附近；`docs/design/chapters/01-tianlong.md` 第 1417–1418 行附近 | 游氏兄弟以 `sk_huxixingqi` 为辅运；呼吸行气已由调和改阴，须同步性质／调息投影与可能的兼容性审计 |
| `docs/design/catalog/skills-bulu-12-shujian.md` 第 54 行附近 | `sk_zhuangxingong` 是铁胆庄心法前置；壮行功已由阳改阴，须核查该前置链是否含未明写的性质假设 |
| `docs/design/chapters/03-shendiao.md` 第 948、954、1010 行附近 | 壮行功已有任脉专精镜像且今改阴；扎马步保持督脉阳。同步黄阶性质标签，并保留经脉专精映射 |
| `docs/design/chapters/09-liancheng.md` §12 与 `docs/design/catalog/npcs-ch09-liancheng.md` | 多名角色辅运 `sk_huxixingqi`，另有 `sk_tunaqianjue`；两者均由调和改阴，须复核辅运相性、调息档案和路线约束 |
| `docs/design/chapters/01`、`04`～`06`、`08`、`10`～`14` 及相应 NPC 图鉴 | 多处辅运或技能池引用 `sk_tunaqianjue`、`sk_huxixingqi`、`sk_zhuangxingong`；三门改阴后须核查显式性质、调息和相性镜像；纯 ID 引用无需改 |
| `docs/design/chapters/01`～`08`、`12`、`14` 及 `docs/design/catalog/npcs-ch06`～`ch14` | 多处把本轮内功作为辅运或人物技能引用；归属任务应核查性质标签、招式 `requiredNature`、调息档案和阵容数值镜像，不能机械改主运性质 |
| `docs/design/07-set-system.md`、`skills-bulu-06-xiake.md`、`skills-bulu-07-bixue.md`、`skills-bulu-09-liancheng.md`、`skills-shaolin.md` | 现有引用主要是套装成员、前置或通行底座；归属任务核查是否有隐藏性质假设，无则保持 ID 引用 |
| 所有引用 7 条改路绝招的书界、角色与 Boss 配装 | 路线 ID 未变，通常无需改引用；若复制了穴位序列或 `requiredNature`，须同步本册新路线。当前全仓搜索未发现册外路线序列镜像 |
| `docs/README.md` | `check_ids.py --strict` 仍报告既知基线 `sk_babuganchan` 未定义；本任务未新增失败且不越权修改 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 补主修经脉清单

| 内功 | 补／规范化的经脉 | 依据（不由旧 `nature` 反推） | 推出性质 |
|---|---|---|---|
| 军帐吐纳 `sk_junzhangtuna` | `inner.meridians:[mer_dumai]` | 卡面为各地军营的军伍耐力吐纳，且本册原有核心效果已给督脉建议值；据该定位把建议值结构化 | 督脉 1 阳票→阳；这是改前唯一 `inner_missing_meridians` 命中，性质不变 |
| 山野吐纳 `sk_shanyetuna` | 将原有 `mer_renmai` 建议值规范为 `inner.meridians:[mer_renmai]` | 卡面为山民基础吐纳，本册原有核心效果已给任脉建议值；仅结构化既有设定 | 任脉 1 阴票→阴；不计入改前缺字段 1 张 |
| 壮行功 `sk_zhuangxingong` | 将卡面既有 `mer_renmai` 规范为 `inner.meridians:[mer_renmai]` | 沿用镖局／护院紧凑卡已给的任脉依据，不由旧阳性反推 | 任脉 1 阴票→阴 |
| 扎马步 `sk_zhamabu` | 将卡面既有 `mer_dumai` 规范为 `inner.meridians:[mer_dumai]` | 沿用市镇武馆紧凑卡已给的督脉依据，不由旧阳性反推 | 督脉 1 阳票→阳 |
| 吐纳浅诀 `sk_tunaqianjue` | 将卡面既有 `mer_renmai` 规范为 `inner.meridians:[mer_renmai]` | 沿用江湖抄本紧凑卡已给的任脉依据，不由旧调和性质反推 | 任脉 1 阴票→阴 |
| 丹田养气 `sk_dantianyangqi` | 将卡面既有 `mer_dumai` 规范为 `inner.meridians:[mer_dumai]` | 沿用乡里拳师紧凑卡已给的督脉依据，不由旧阳性反推 | 督脉 1 阳票→阳 |
| 呼吸行气 `sk_huxixingqi` | 将卡面既有 `mer_renmai` 规范为 `inner.meridians:[mer_renmai]` | 沿用山野散人紧凑卡已给的任脉依据，不由旧调和性质反推 | 任脉 1 阴票→阴 |

七门均为**（原创扩展）**，没有补写原著引文、回目或人物事实。本清单七门中，脚本结构化识别覆盖军帐吐纳 1 门；山野吐纳、壮行功、扎马步、吐纳浅诀、丹田养气、呼吸行气共 6 门由人工逐张核对。

### 7.2 改性质清单

| 内功 | 改前 → 改后 | 主修票 | 连带改动 |
|---|---|---|---|
| 山野吐纳 | 调和 → 阴 | 任脉：阴 1 | 卡面；`txp_shanyetuna`；防守路线默认 `DF-I*`、`requiredNature:[yin,harmony]`；护体仍 I；调息 `1680/390→1600/372` |
| 金盾心法 `sk_jindunxinfa` | 阳 → 调和 | 任脉阴 1、督脉阳 1，平票 | 标题／目录／卡面；`txp_jindunxinfa`；守镖／分护改 `DF-H*`、`requiredNature:[yin,yang,harmony]`；护体仍 II；调息 `1700/396→1785/415` |
| 武馆心法 `sk_wuguanxinfa` | 调和 → 阴 | 任脉：阴 1 | 标题／目录／卡面；`txp_wuguanxinfa`；调息／护桩改 `DF-I*`、`requiredNature:[yin,harmony]`；护体仍 II；调息 `1785/415→1700/396` |
| 江湖吐纳 `sk_jianghutuna` | 调和 → 阴 | 任脉阴 1、冲脉 0 | 标题／卡面；`txp_jianghutuna`；调息／护脉改 `DF-I*`、`requiredNature:[yin,harmony]`；护体仍 II；调息 `1890/441→1800/420` |
| 壮行功 `sk_zhuangxingong` | 阳 → 阴 | 任脉：阴 1 | 卡面；`txp_zhuangxingong.nature`；防守路线改 `DF-I*`、`requiredNature:[yin,harmony]`；护体仍 I；阴阳倍率相同，调息保持 `1500/348` |
| 扎马步 `sk_zhamabu` | 阳 → 阳（不变） | 督脉：阳 1 | 补显式字段；`txp_zhamabu`、`DF-Y*`、`requiredNature:[yang,harmony]` 与护体 I 均保持 |
| 吐纳浅诀 `sk_tunaqianjue` | 调和 → 阴 | 任脉：阴 1 | 卡面；`txp_tunaqianjue`；防守路线改 `DF-I*`、`requiredNature:[yin,harmony]`；护体仍 I；调息 `1680/390→1600/372` |
| 丹田养气 `sk_dantianyangqi` | 阳 → 阳（不变） | 督脉：阳 1 | 补显式字段；`txp_dantianyangqi`、`DF-Y*`、`requiredNature:[yang,harmony]` 与护体 I 均保持 |
| 呼吸行气 `sk_huxixingqi` | 调和 → 阴 | 任脉：阴 1 | 卡面；`txp_huxixingqi`；防守路线改 `DF-I*`、`requiredNature:[yin,harmony]`；护体仍 I；调息 `1470/340→1400/324` |

✅ 三张脚本 `INNER_NATURE` 命中与四张人工发现的改性卡均先保留卡面既有主修经脉，再按票数改声明性质；没有从旧性质反推经脉。扎马步、丹田养气只补字段，性质不变。

人工逐张核对 14 门：阳 5 为百战（督 1、冲 0）、军旅（督 1）、军帐（督 1）、扎马步（督 1）、丹田养气（督 1）；阴 6 为山野（任 1）、壮行（任 1）、武馆（任 1）、江湖（任 1、冲 0）、吐纳浅诀（任 1）、呼吸行气（任 1）；调和 3 为潮音（冲 0、带 0，无票）、金盾（任 1、督 1，平票）、混元方桩（任 1、督 1，平票）。14 门声明性质均与 AR-18 计票一致。

### 7.3 路线改动清单

| 路线 | 改前计票 → 改后计票 | 改动的穴位 | 段数 / 路线 CT / 风险变化 |
|---|---|---|---|
| `mfr_pojunqiangfa_cuifeng` | 阴 6 → 阳 6 | 前 6 段：阴谷／血海／气海／天泉／间使／阴郄 → 命门／至阳／阳陵泉／委中／曲池／养老；外关→阳池出口不变 | 8 / 720 / 无 |
| `mfr_yanmengqishe_yanluo` | 阴 6、阳 2 → 阳 8 | 前 6 段：血海／阴廉／阴谷／大横／照海／尺泽 → 腰俞／风市／承山／肩髃／支沟／天宗；翳风→合谷末段不变 | 8 / 720 / 无 |
| `mfr_kaimenpiguaquan_kaihe` | 阴 6 → 阳 6 | 前 6 段：水泉／血海／中都／腹哀／天泉／尺泽 → 长强／腰俞／足三里／风市／肩井／天宗；曲池→合谷出口不变 | 8 / 720 / 无 |
| `mfr_tianwangbuxin_sanzhen` | 阳 5、阴 2、调和 1 → 阴 5、阳 2、调和 1 | 前 6 段逐位置：命门／气冲／太溪／丰隆／蠡沟／承山 → 气海／大横／血海／太溪／蠡沟／气冲；曲池→合谷出口不变 | 8 / 600 / 无 |
| `mfr_duanzhenqiang_pozhen` | 阴 5 → 阳 5 | 前 5 段：腹哀／蠡沟／中封／太溪／商丘 → 命门／足三里／阳陵泉／委中／支沟；阳谷出口不变 | 6 / 600 / 无 |
| `mfr_jiebiaodaofa_fenglu` | 阴 5 → 阳 5 | 前 5 段：太白／中都／阴谷／大横／间使 → 腰阳关／承山／外丘／偏历／中渚；阳谷出口不变 | 6 / 600 / 无 |
| `mfr_tantui_tongxing_chuaimen` | 阴 5 → 阳 3、阴 1（出口剔除后） | 前 4 段：腹哀／中都／阴谷／血海 → 梁丘／丰隆／风市／承山；照海→足窍阴末段不变 | 6 / 600 / 第 5 段 `180→200`，总风险 `900→920` |

✅ 7 条路线均未缩短；出招方式、purpose、逐段 CT、收招均未变。前三条风险 `[100,120,140,160,180,200,220,240]` / 1360；天王为 `[100,110,120,130,140,150,160,170]` / 1080；破阵／封路为 `[100,120,140,160,180,200]` / 900；踹门为 `[100,120,140,160,200,200]` / 920。踹门第 4→5 段承山（阳）→照海（阴）将照海段提到换脉档 200，第 5→6 段照海（阴）→足窍阴（阳）原风险 200 已合规；其余六条改路已逐段核对，无其他阳↔阴直接相邻段。

✅ 出口规则保持：摧锋外关→阳池、雁落翳风→合谷、开合曲池→合谷、三针曲池→合谷、破阵／封路阳谷、踹门照海→足窍阴；掌法依 AR-18 可由合谷等动作穴出招。所有路线均补显式 `requiredNature`。

### 7.4 `--delivery` 三项计数（改前 / 改后）

| 项目 | 改前 | 改后 |
|---|---:|---:|
| `nature-conflict` | 7 | 0 |
| `inner_missing_meridians` | 1 | 0 |
| `INNER_NATURE` / `inner_nature_conflicts` | 3 | 0 |

最终还确认动作／外放 `violations=0`、`tail_violations=0`，掌法路线 2 / 命中 2。`--delivery` 的结构化脚本覆盖内功 8 / 8；另人工逐张核对本册全部 14 / 14，包含脚本未解析的 6 张黄阶紧凑卡：山野吐纳、壮行功、扎马步、吐纳浅诀、丹田养气、呼吸行气。

### 7.5 指定门禁（踹门换脉风险返修后全量复跑）

| 命令 | 结果 |
|---|---|
| `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-general.md` | ✅ 三项均 0 |
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；仅既知基线 `sk_babuganchan` 未定义，新失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 170 / 170 通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 / 47 通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-general.md` | ✅ errors 0；38 / 38 distinct；exact 0；≥80% 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-general.md` | ✅ 完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-general.md` | ✅ 未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py general` | ✅ 名下 23 对全改开；新造 ≥80% 配对 0 |
| `git diff --check` | ✅ 通过 |

### 7.6 交其他任务的条目与范围纪律

- ⚠️ 册外同步项已完整登记于 §6；其中 `chapters/09-liancheng.md` 与 `chapters/13-feihu.md` 有明确旧“调和”标签，`chapters/10-baima.md` 与 `chapters/11-yuanyang.md` 有受影响主运及 `harmony` 数值模板，必须由归属任务重算。
- ✅ 版本行已追加“阴阳性质落地 AR-18（2026-09-29）”；正文新增 AR-18 校验规则与 AR-18a/b 开放问题，未删除已有待决事项。
- ✅ 没有新造 ID；没有改 Canon、`TODO.md`、脚本或其他图鉴；未执行改变仓库状态的 git 命令。
- ✅ 最终工作区只改 `docs/design/catalog/skills-general.md` 与本报告；正文及报告无截断表格、未闭合代码块或未完成占位语。
