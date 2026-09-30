# NR5-yitian 报告 · 路线唯一性第五轮 · 倚天（显式普通路线纳入全仓比较后的完全相同与高相似配对）

## 1. 摘要（3–6 行）

- 本单元名下相似配对为无（0 对），无须改开或写传承理由。
- 完成唯一点名额外事项：凝霜第 3 段腰俞换府舍，保留关元、阴交出口与曲泽回气；体段由阴 1／阳 2 改为阴 2／阳 1。
- 凝霜只换穴的已通过产物保持；第 2 次运行仅返修 §10.4：重算 15 个配置，修正崆峒两条普通配置与峨眉吐纳展开的体段性质，保留动作与总预算。
- 11 项指定命令全部退出 0；NR4 三项为 0／0／0，NR5 新造配对 0，NR3 名下 25 对仍全部改开。
- 全仓 861 条显式路线的配对集合与返修前一致，新增配对 0；3 对本册作为另一侧的既有高相似及 ID 基线提示仍如实交接，§10.4 旧计票遗留已解决。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 |
|---|---:|---|
| `docs/design/catalog/skills-yitian.md` | 1886 | 保留首轮产物；本次仅增修 §10.4 普通内功计票表、崆峒两配置、黄阶计票与峨眉四段展开 |
| `tools/agents/reports/NR5-yitian.md` | 157 | §1–§7：结论、核算、交接、改前／改后输出、返修配置清单与验收证据 |

图鉴基点 1869 行，最终净增 17 行；相对续作开始的 1872 行净增 14 行。返修两小节以外与续作输入逐字一致；未删无关内容或既有待决项。只修改上述两个文件，不改脚本、基准、分派表或其他图鉴。

## 3. 关键结论与数值

1. 换入穴 `ap_yinwei_fushe` 已在 `design/15` §3 阴维脉表登记；游戏归属为 `mer_yinwei`，亦为玄冥心法已声明的主修脉。本次不新造任何 ID。
2. 关元、阴交在末三段内命中内功／护体出口，均不投票；曲泽仍计体段。改前为曲泽阴 1、长强／腰俞阳 2；改后为府舍／曲泽阴 2、长强阳 1，带脉均不投票，性质由阳变阴。
3. CT：`6×100=600`，`recovery+flowCt=1200+600=1800≤2000`；风险：`100+120+140+160+180+200=900`。每段 CT、风险、段数与收招均不变，玄上建议段数下限 6 仍满足。
4. 第 3 段风险仍为 140 bp，高于前段长强的 120 bp，承接督脉向主修阴维脉换脉。新增配路解释明确标为**（原创扩展）**，不宣称原著或现实疗效。
5. 凝霜与全仓其余 860 条显式路线逐一比较，最高 `overlapBp=5000`；例如与散功共享带脉、关元、曲泽，`floor(10000×3/min(6,10))=5000<8000`。没有同序或高相似命中。
6. 同门只有一记绝招；玄寒普通招仍绑定 D4I（云门、尺泽、太渊、少商），与凝霜重合 `0/4=0%≤50%`。本次为性质修复，不存在需按 `floor(0.2L)+1` 改开的名下高相似对。
7. 返修崆峒两条普通配置各只换首穴，阴／阳体票均由 `0/0` 改为 `1/0`；各保留 `4×75=300 CT`、`70+80+90+100=340` 风险、`1000+300=1300` 收招合计，彼此共享 `0/4`。
8. 峨眉吐纳保留原三穴、插入阴交，`3→4` 段；CT `50+50+50+60=210`、风险 `50+60+60+70=240`，原收招及收招合计不变。会阴移出尾三段窗口后提供主修任脉体段，`0/0→1/0` 阴票；阴交、关元、身柱为出口。
9. 返修三配置全仓最高重合依次为 `7500/7500/5000 bp`。全仓改前／改后均为 654 绝招＋207 显式普通，4 对完全相同、182 对非完全相同高相似（均为既有）；按路线配对键集合比较新增 0、消除 0，绝招之间高相似 0。本册仍只涉及 §6 的 3 对既有配对。

## 4. 开放问题（附默认值）

| 事项 | 默认值与处理 |
|---|---|
| AR-18a：冲脉／带脉是否投票 | 继续不投票；本次带脉沿用该口径，不等待作者答复 |
| AR-18b：后溪是否进入外放白名单 | 继续不加入；凝霜为非外放周身支援，本次不涉及 |
| 共享模板绑定普通路线的跨武学唯一性 | 按 2026-09-29 协调者裁定，不展开比较；显式普通序列纳入 |
| §6 的普通非外放／未来生成路线旧票数 | **已解决：**依本轮审核返修授权，按内功动作排除末三段任督出口，重算全部 15 配置并修复 3 处性质冲突；见图鉴 §10.4、本报告 §7.2 |

没有新增必须由作者拍板后才能完成的事项；原图鉴开放问题全部保留。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案。现行 Canon V17-06、V18-03 与 `design/21` §2.4、§4.3.1、§4.3.4 已足以完成本次修复；既有 AR-18a／AR-18b 待决入口保持。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档／任务 | 位置 | 改什么／交接边界 |
|---|---|---|
| `skills-bulu-05-xiaoao.md`／NR5-bulu-b | `mfr_huashanziqijue_yunqi` ↔ `mfr_jiuyang_huti` | 既有 `4/5=8000 bp`，按分派表第 23 对改普通侧；倚天绝招不改 |
| `skills-bulu-07-bixue.md`／NR5-bulu-c | `mfr_huashandiejinquan07_diejin` ↔ `mfr_yingzhaoqinna_changkong` | 既有 `5/6=8333 bp`，按分派表第 34 对改普通侧；倚天绝招不改 |
| `skills-kangxi.md`／NR5-kangxi | `mfr_shenlongxinfa_tuxi` ↔ `mfr_shenghuoling_yinfengdao` | 既有 `4/5=8000 bp`，按分派表第 13 对改普通侧；倚天绝招不改 |
| `tools/agents/reports/LINT-outlets.md` 的后续汇总 | §6／§7.5 倚天凝霜交办 | 标记已解决，引用本报告；保留旧报告的历史命中，不回改历史数字 |
| `skills-yitian.md` 原交办项（本轮收回处理） | §10.4 普通内功显式表后计票及黄阶展开表 | **已解决：**第 2 次运行按审核返修授权重算 15 配置，修正护心、清心、燃心、昆仑、铁牛及黄阶计票说明；崆峒养脏／调五行各换首穴，峨眉吐纳扩四段并保持总预算。见 §7.2，不再交后续修复 |
| `tools/lint/check_skill_catalogs.py` 的后续维护 | `--delivery`／NR4 性质覆盖 | 当前覆盖绝招及显式普通外放，普通非外放与尚未生成的黄阶路线不在三项计数中；建议补覆盖或明确审计边界。本轮另按 inner／defense 出口规则逐节点核对 §10.4 的 15 配置，不以 NR4 三个 0 代替该核对，也不宣称已审计全册共享模板 |

前三对均在本轮分派快照中，属于其他任务的既有配对；不作为传承理由或豁免。其余 NR4 报告已有跨文档交办仍由原后续任务处理，本次不宣称解决。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

| 配对 | 改前 bp | 处理方式 | 改动的穴位 |
|---|---|---|---|
| 无：`tools/agents/nr5/yitian.md` 为 0 对空表 | 不适用 | 无名下配对；无理由条目 | 无 |

### 7.2 改过的路线清单与额外事项结果

首轮仅修改 `mfr_xuanmingxinfa_ningshuang`，属于任务点名允许修改的绝招；本次保留以下已通过结果。

| 项 | 改前 | 改后 |
|---|---|---|
| 穴位序列 | `ap_daimai_daimai → ap_dumai_changqiang → ap_dumai_yaoshu → ap_renmai_guanyuan → ap_renmai_yinjiao → ap_shoujueyin_quze` | `ap_daimai_daimai → ap_dumai_changqiang → ap_yinwei_fushe → ap_renmai_guanyuan → ap_renmai_yinjiao → ap_shoujueyin_quze` |
| 体段阴／阳票 | 1／2，阳；带脉不投 | 2／1，阴；带脉不投 |
| 出口／末段 | 关元、阴交为出口；曲泽仍计体段 | 相同；补明曲泽收束回气 |
| 段数／路线 CT | 6／600，每段100 | 相同，未缩短 |
| 风险数组／总和 | `[100,120,140,160,180,200]`／900 | 相同，只换穴 |
| 基础收招／收招合计 | 1200／1800 | 相同 |
| 招式动作与用途 | 周身支援、无伤害倍率、非外放；defense | 相同；未改为掌法或攻击 |

✅ 额外事项已解决：体段与玄冥心法声明阴一致；主修阴维脉进入核心，尾段保持原序。显式定义仅在文首一处，§10.4 继续引用并镜像变化，避免重复步骤定义。

第 2 次运行按合入前审核只修 §10.4 的普通内功／黄阶展开，三处改配如下；派生配置引用既有 `mv_*` 或 `sk_*`，不提前新造路线 ID。

| 配置 | 改前穴位序列 | 改后穴位序列 | 体段阴／阳票 | 段数／CT／风险与收招 |
|---|---|---|---|---|
| `mv_kongtongyangshenggong_yangzang` | `ap_chongmai_qichong → ap_chongmai_futonggu → ap_renmai_qihai → ap_renmai_guanyuan` | `ap_renmai_shuifen → ap_chongmai_futonggu → ap_renmai_qihai → ap_renmai_guanyuan` | 0／0 → 1／0 | 只换穴；4 段、各 75 CT、风险 `[70,80,90,100]`／340、收招合计1300均不变 |
| `mv_kongtongyangshenggong_tiaowuxing` | `ap_chongmai_siman → ap_chongmai_shangqu → ap_renmai_zhongwan → ap_renmai_danzhong` | `ap_renmai_shenque → ap_chongmai_shangqu → ap_renmai_zhongwan → ap_renmai_danzhong` | 0／0 → 1／0 | 只换穴；4 段、各 75 CT、风险 `[70,80,90,100]`／340、收招合计1300均不变 |
| `sk_emeitunajue` 的未来调息／护体配置 | `ap_renmai_huiyin → ap_renmai_guanyuan → ap_dumai_shenzhu` | `ap_renmai_huiyin → ap_renmai_yinjiao → ap_renmai_guanyuan → ap_dumai_shenzhu` | 0／0 → 1／0 | 3→4 段；CT `[70,70,70]→[50,50,50,60]` 均合210；风险 `[70,80,90]→[50,60,60,70]` 均合240；原收招与合计不变 |

崆峒保留原两穴出口；峨眉保留原关元→身柱末端，新增阴交同属任脉出口。三配置首穴均处于尾三段之外，提供主修任脉体段；崆峒第 2 段冲脉继续承接。峨眉若仍保持三段，任脉全部落入出口窗口，无法留下主修体段；扩为四段符合黄阶普通路线 2–4 段建议，全部单段 CT 在40–120、风险在0–1200内。黄阶尚无正式招式，收招沿用未来生成动作并校验 `recovery+210≤2000`，不编造基础收招数。

| 其余配置（不改路线） | 更正后的体段阴／阳票 |
|---|---|
| 暖脉／护心 | 4／0、3／0 |
| 燃心／清心 | 0／2、1／0 |
| 昆仑运息／调息 | 各0／2 |
| 铁牛沉腰／扛撞 | 各0／0；带脉不投票，任督尾段为出口 |
| 黄阶圣火／崆峒／华山 | 各0／0；冲／带不投票，任督尾段为出口 |
| 黄阶昆仑 | 0／1；仅肩髃体段投阳票 |

✅ 返修正文核对：以上 12 个未改配配置与 3 个改配配置合计 15 个，均按游戏归属、动作出口逐节点重算，声明性质全部一致；已更正旧全路线票数。原表序列、CT／风险与新增说明一致，独立只读复核通过。

### 7.3 NR5 与 NR4 改前／改后原始输出

`python3 tools/agents/check_nr5_unit.py yitian`，首轮及本次返修改前／改后均退出 0，输出相同：

```text
单元 yitian：名下 0 对；已改开 0，已写理由 0，仍完全相同 0，未处理 0；本任务新造配对 0
```

`python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-yitian.md`，以下保留首轮凝霜改前记录（退出 1）：

```text
✘ yitian：nature_conflicts=1；inner_missing_meridians=0；inner_nature_conflicts=0

命中明细：
  DELIVERY rule=nature-conflict; required=route=yang; declared=yin; scope=ultimate; yitian:sk_xuanmingxinfa/mv_xuanmingxinfa_ningshuang/mfr_xuanmingxinfa_ningshuang@skills-yitian.md:60
```

首轮改后，以及本次返修改前／改后均退出 0，输出相同：

```text
✔ yitian：nature_conflicts=0；inner_missing_meridians=0；inner_nature_conflicts=0
```

本次返修的 3 处冲突属于该命令未覆盖的普通非外放／黄阶生成配置，改前的三个 0 不代表它们已合规。已另用现有出口识别、游戏归属与性质函数逐节点复算 15 配置，并人工核对主修体段、序列和逐段预算，全部通过；没有修改检查脚本。

### 7.4 指定命令验收

下表图鉴路径均为 `docs/design/catalog/skills-yitian.md`；第 2 次运行在完成返修后重新执行全部 11 项命令，均退出 0。

| 命令 | 结果 |
|---|---|
| `python3 tools/agents/check_nr5_unit.py yitian` | ✅ 名下0、未处理0、仍完全相同0、新造0 |
| `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-yitian.md` | ✅ 三项0／0／0 |
| `python3 tools/lint/check_ids.py --strict` | ✅ 严格失败0、新增未定义0；⚠️ 基线仍有 `sk_babuganchan` 未定义1项 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 193项，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 checks passed，known deviations: 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ all checks passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ all checks passed |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-yitian.md` | ✅ errors=0；42条绝招、42种序列；同序／高相似均0；重复步骤定义0、正文≠索引0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-yitian.md` | ✅ 654绝招＋207显式普通；本册涉及的完全相同0；⚠️ 普通相关高相似3对，均见§6其他任务归属 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-yitian.md` | ✅ 指定文件未定义引用0 |
| `python3 tools/agents/check_nr3_unit.py yitian` | ✅ 名下25对全部改开，理由0、未处理0、新造0 |

额外执行 `python3 tools/agents/check_route_unique_for.py --all --json`（退出0），并与返修改前全仓 JSON 的配对键集合比较：861 条路线、4 对既有完全相同、182 对其他既有高相似均不变，新增完全相同／高相似均0。未把全仓既有命中说成已清零；三条改配配置的最高重合分别7500、7500、5000 bp。

### 7.5 范围、结构与交其他任务的条目

- ✅ 只改授权图鉴与本报告；首轮凝霜修改保留。本次按审核点名返修普通内功／黄阶展开两小节，仅崆峒两配置换穴、峨眉一配置插穴并重分预算；其他路线、检查脚本与运行 ID 未改。
- ✅ 三个改配配置的动作、原合法末端、总CT／风险及收招合计保持；崆峒段数不变，峨眉3→4段且未缩短。节点均已登记且不重复，主修任脉在体段；崆峒同门共享0／4。本次非外放，其余外放路线保持。
- ✅ 版本追加“路线唯一性第五轮（2026-09-30）”；既有待决项保留，O-13 补记已解决；未新增原著事实、引文或回目。
- ✅ 结构复核：相关表格列数一致、代码围栏成对，返修两小节外与续作输入逐字一致；无截断或新占位文字；`git diff --check` 通过。
- ⚠️ 交其他任务的条目列于 §6：3对既有普通侧配对与检查覆盖边界仍保留；普通内功／黄阶生成计票交办已由本次返修解决，不再推给后续。
- ✅ 未执行改变仓库状态的 git 命令，提交交调度器；未修改任何写集外文件。
