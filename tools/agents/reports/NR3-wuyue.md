# NR3-wuyue 报告 · 路线叙事第三轮 · 五岳（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

- 完成五岳册名下 13 对高相似路线处理：改写本侧 7 条路线，13 对全部降至 `overlapBp<8000`，未使用理由豁免。
- 改后各路线保持原出招方式、段数、逐段 CT、逐段风险、路线用途与收招；持械、掌与持琴音功的动作末端均合规。
- 本任务没有新造任何跨武学 ≥80% 配对；另将归属 NR3-gulong 的 `mfr_dugu9_wuzhao / mfr_shenshuineigong_zhongchao` 从 10000 bp 顺带降至 0 bp。
- `--delivery` 改前、改后均为端点违规 0、末端位置违规 0；其性质输出 0 是解析空转，按同一计票读法人工复核为改前 6 条、改后 4 条冲突。
- 全部指定校验及 `git diff --check` 通过；严格 ID 检查只保留仓库基线已知项，本任务新增错误为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-wuyue.md` | 1749 | 文首版本与 7 条绝招显式路线；§15.1 第三轮叙事说明、核算镜像；既有 §15.3–§15.5 绑定保持一致 |
| `tools/agents/reports/NR3-wuyue.md` | 140 | 逐对结果、delivery 前后计数、改线清单、完整门禁与交接结论 |

## 3. 关键结论与数值

- 13 对改后 bp 依次为 `1666, 0, 0, 2500, 1666, 0, 1666, 0, 0, 1666, 0, 0, 0`；最高 2500，均低于 8000。
- 7 条改线的长度仍为 `10/8/8/10/6/6/6`，路线 CT 仍为 `800/720/720/700/600/600/600`，总风险仍为 `1900/1360/1360/1410/900/900/900`。
- 独孤“无招”与同门“破箭／破气”的共享率分别为 1000／0 bp；七弦“无形／齐鸣”为 0 bp；辟邪“穿柳／群邪”为 1000 bp，均不超过同门 50% 上限，亦非轮换或逆序。
- 改后五岳册 41 条绝招路线全部互异，本册内与跨册均无完全同序列；本任务新造跨武学 ≥80% 配对为 0。
- 七弦无形剑是持琴音功，末两段以外关、阳池导引；不是人声发劲。五岳册其余音功同属琴／琴箫演奏，本轮不添加 `voice` 字段。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NR3-WY-O01 | `design/21` §2.4 对“含任督／奇经混合方案时取 harmony”的最终读法尚待协调者确认 | 暂按 `route_nature()` 阴／阳计票：冲突由改前 6 条降为改后 4 条；字面读法则为 0／0。仅两条因配对必须改线而顺带消除冲突，没有路线只为性质而改；其余 4 条留待确认后处理（清单见 §7.2） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务只按 Canon V17-06 与 `design/21` §4.3.1、§4.3.4 重配既有路线，不需改动基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- NR3-gulong：`mfr_dugu9_wuzhao / mfr_shenshuineigong_zhongchao` 已由五岳侧改至 0 bp，不必再改线或写理由；若古龙册已有该对理由行，应删除过期说明。
- 协调者／校验脚本维护任务：`_skill_natures()` 读不到五岳册的完整卡性质列与紧凑卡性质写法，导致性质检查空转。当前工作区约 174／654 条绝招路线为 `nature=None`（五岳 41、康熙 33、五绝 19、乾隆 16、补录神雕 14、逍遥 10、补录碧血 9 等），需扩充解析并重算全仓冲突。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

| # | 配对（本侧 / 另一侧） | 改前 bp | 处理方式 | 改动的穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_dugu9_wuzhao` / `mfr_duanzhenqiang_pozhen` | 10000 | ✅ R1 改开至 1666 | R1：保留阳谷，另 9 穴换新，详见 §7.3 |
| 2 | `mfr_dugu9_wuzhao` / `mfr_huzhaojuehushou_juehu` | 8750 | ✅ R1 改开至 0 | 同 R1 |
| 3 | `mfr_qingchengcuixinzhang_duanmai` / `mfr_jiayishengong_liehuo` | 8750 | ✅ R2 改开至 0 | R2：保留劳宫，另 7 穴换新，详见 §7.3 |
| 4 | `mfr_qixianwuxingjian_wuxing` / `mfr_xuanming_rusi` | 8750 | ✅ R3 改开至 2500 | R3：保留云门、尺泽，另 6 穴换新，详见 §7.3 |
| 5 | `mfr_bixie_feiyanchuanliu` / `mfr_lingshebu_tuoqiao` | 8333 | ✅ R4 改开至 1666 | R4：保留太溪、阳池，另 8 穴换新，详见 §7.3 |
| 6 | `mfr_bixie_feiyanchuanliu` / `mfr_nizhuanjingmai_daozhuan` | 8333 | ✅ R4 改开至 0 | 同 R4 |
| 7 | `mfr_dugu9_wuzhao` / `mfr_renfeiyandao_rangfeng` | 8333 | ✅ R1 改开至 1666 | 同 R1 |
| 8 | `mfr_dugu9_wuzhao` / `mfr_suogugong_tuofu` | 8333 | ✅ R1 改开至 0 | 同 R1 |
| 9 | `mfr_songshanjianfa_kaimen` / `mfr_kongquezhen_bimen` | 8333 | ✅ R5 改开至 0 | R5：6 穴全部换新，详见 §7.3 |
| 10 | `mfr_riyuejianfa_yueluo` / `mfr_wuzhengxinfa_huzhuang` | 8333 | ✅ R6 改开至 1666 | R6：保留外关，另 5 穴换新，详见 §7.3 |
| 11 | `mfr_yangwujian_haoran` / `mfr_sanzhuangheji_tongji` | 8333 | ✅ R7 改开至 0 | R7：保留阳谷，另 5 穴换新，详见 §7.3 |
| 12 | `mfr_dugu9_wuzhao` / `mfr_baihuacuo_cuoluo` | 8000 | ✅ R1 改开至 0 | 同 R1 |
| 13 | `mfr_dugu9_wuzhao` / `mfr_shenzhao_xumai` | 8000 | ✅ R1 改开至 0 | 同 R1 |

### 7.2 `--delivery` 命中数（改前 / 改后）

| 规则 | 适用条数（改前 / 改后） | 违规（改前 / 改后） | 末端位置违规（改前 / 改后） |
|---|---:|---:|---:|
| 兵器末端 | 21 / 21 | 0 / 0 | 0 / 0 |
| 掌末端（劳宫） | 3 / 3 | 0 / 0 | 0 / 0 |
| 拳／擒拿末端 | 0 / 0 | 0 / 0 | 0 / 0 |
| 指末端 | 0 / 0 | 0 / 0 | 0 / 0 |
| 腿末端 | 0 / 0 | 0 / 0 | 0 / 0 |
| 内功攻击任督 | 9 / 9 | 0 / 0 | 0 / 0 |
| 护体／蓄气任督（华山、嵩阳、日月心法） | 3 / 3 | 0 / 0 | 0 / 0 |
| 位移步法核心脉或涌泉（衡山云雾步、万里独行） | 2 / 2 | 0 / 0 | 0 / 0 |
| 绝招外放端点 | 6 / 6 | 0 / 0 | 0 / 0 |
| 非绝招外放端点 | 7 / 7 | 0 / 0 | 0 / 0 |
| 未分类（七弦两记、笑傲曲；持乐器音功，已由外放端点覆盖） | 3 / 3 | 0 / 0 | 0 / 0 |

性质检查不能采用 `--delivery` 输出的 0：`_skill_natures()` 未解析本册两种卡片性质写法，41 条绝招路线的 `nature` 全为 `None`。按校验器同一 `route_nature()` 阴／阳计票规则人工复核如下；字面读法（含任督或奇经即取 harmony）则为改前 0、改后 0。

| 路线 | 武学声明性质 | 改前路线计票 | 改后 |
|---|---|---|---|
| `mfr_baibianqianhuan_shisanshi` | yin | yang（阴 0 / 阳 5） | 未改线，仍冲突 |
| `mfr_baibianqianhuan_baibian` | yin | yang（阴 0 / 阳 7） | 未改线，仍冲突 |
| `mfr_heimuyajianfa_lingkong` | yin | yang（阴 1 / 阳 7） | 未改线，仍冲突 |
| `mfr_qixianwuxingjian_qiming` | yin | yang（阴 3 / 阳 5） | 未改线，仍冲突 |
| `mfr_qingchengcuixinzhang_duanmai` | yin | yang（阴 1 / 阳 7） | 因配对 #3 改线；yin（阴 8 / 阳 0），已一致 |
| `mfr_songshanjianfa_kaimen` | yang | yin（阴 4 / 阳 2） | 因配对 #9 改线；yang（阴 0 / 阳 6），已一致 |

计票读法的性质冲突为改前 6 条、改后 4 条。后两条是配对要求必须改线时依任务约束配出的新路线，顺带消除冲突；没有路线只为性质而改，其余 4 条留待确认 §2.4 读法后处理。

### 7.3 改过的路线清单

| 代号 / 路线 | 穴位替换（删除 → 新增） | 段数 / CT / 风险变化 |
|---|---|---|
| R1 `mfr_dugu9_wuzhao` | 阴跷交信、阴维腹哀、足厥阴蠡沟／中封、足少阴太溪、足太阴商丘、任脉关元／阴交、手厥阴曲泽 → 手少阴神门、手太阳听宫／养老、阳维本神、冲脉中注、带脉京门、手阳明偏历／合谷、手少阳支沟 | 10 / 800 / 1900；均不变 |
| R2 `mfr_qingchengcuixinzhang_duanmai` | 阳维阳交、足少阳阳白、足太阳肾俞、足阳明颊车、督脉百会／水沟、手少阳天井 → 足厥阴大敦／行间／太冲／中封／蠡沟、手厥阴曲泽／内关 | 8 / 720 / 1360；均不变 |
| R3 `mfr_qixianwuxingjian_wuxing` | 手太阴太渊／少商、任脉气海／关元、手厥阴内关／中冲 → 冲脉阴都、带脉章门、手厥阴间使／大陵、手少阳外关／阳池 | 8 / 720 / 1360；均不变 |
| R4 `mfr_bixie_feiyanchuanliu` | 足少阴涌泉、足太阳委中、督脉命门、手太阴云门／尺泽／太渊／少商、手厥阴天池 → 阴跷照海／交信、阴维筑宾、手太阴孔最、手厥阴间使、阳跷申脉、足少阳风市、手太阳腕骨 | 10 / 700 / 1410；均不变 |
| R5 `mfr_songshanjianfa_kaimen` | 阴维筑宾、足厥阴行间、足少阳瞳子髎、足少阴复溜／涌泉、手阳明合谷 → 督脉腰阳关、阳维天髎、手阳明三间、手太阳后溪、手少阳支沟／阳池 | 6 / 600 / 900；均不变 |
| R6 `mfr_riyuejianfa_yueluo` | 任脉中极、手厥阴天池、手少阴灵道／阴郄、手太阳小海 → 带脉章门／维道、阴维期门、手太阴尺泽、手厥阴内关 | 6 / 600 / 900；均不变 |
| R7 `mfr_yangwujian_haoran` | 手太阳听宫、手太阴少商、手阳明二间／阳溪、阳跷巨髎 → 督脉命门／脊中／身柱、阳维天髎、手少阳外关 | 6 / 600 / 900；均不变 |

每条路线的模板代号均为“见文首索引”；逐段 CT、风险列表、路线 CT、收招合计与总风险已在图鉴 §15.1 的“路线叙事第三轮核算镜像”同步。

### 7.4 末端、性质与人声复核

- ✅ R1、R4–R7 的末三段含持械腕部导引穴；R2 末三段为曲泽→内关→劳宫；R3 末两段为外关→阳池，兼满足持琴音功外放端点。
- ⚠️ 自动性质检查对本册空转；人工按 `route_nature()` 计票得改前 6 条、改后 4 条冲突，详见 §7.2。青城摧心掌“断脉”与嵩山剑法“开门”因配对必须改线而顺带恢复一致；其余 4 条未改。
- ✅ 其余 5 条改线中，独孤“无招”为 neutral 武学；七弦“无形”、辟邪“穿柳”、日月“月落”为 yin；养吾“浩然”为 yang，改前、改后均无性质冲突。没有任何路线只为性质而改。
- ✅ 五岳册伤敌音功均由琴或琴箫演奏，`MoveDef.voice` 应保持默认 `false`；未误标人声。

### 7.5 门禁结果

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ exit 0；基线已知 `docs/README.md: sk_babuganchan` 仍为 1，本任务 `new=0` |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 tests，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 checks，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ all checks passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ all checks passed |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-wuyue.md` | ✅ errors 0；41 条路线互异；本册与跨册 ≥80% 均为 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-wuyue.md` | ⚠️ 端点 violations 0、tail 0、非绝招外放违规 0；性质显示 0 但因 41 条路线均解析为 `nature=None`，该项无效，人工复核见 §7.2 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-wuyue.md` | ✅ 与全仓其他武学完全同序列 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-wuyue.md` | ✅ 指定文件未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py wuyue` | ✅ 13 对已改开、理由 0、未处理 0、新造 ≥80% 配对 0 |
| `git diff --check` | ✅ 无空白错误 |

### 7.6 交其他任务的条目

- 无。全部 13 对已由五岳侧降至阈值以下，不要求“另一侧”再改。
- 额外消除的 `mfr_dugu9_wuzhao / mfr_shenshuineigong_zhongchao` 10000 bp 配对归 NR3-gulong，且 `sk_shenshuineigong` 位于 `skills-gulong.md`；现已由五岳侧降至 0，NR3-gulong 不必再改线或写理由，已有理由行则应删除。
- 协调者／校验脚本维护任务需修复 `_skill_natures()` 对完整卡与紧凑卡性质写法的解析；否则五岳册乃至全仓约 174 条 `nature=None` 路线不会进入性质比较。

### 7.7 验收标准逐条结论

- ✅ 仅修改授权的五岳图鉴与本报告；未执行改变仓库状态的 git 命令，也未改另一侧路线。
- ✅ 13 对逐对处理完毕，10000 bp 配对均改开；未写理由豁免，未新增 ID，未新造 ≥80% 配对。
- ✅ 7 条路线均不缩短，逐段 CT／风险与段数一致；动作末端、外放端点、同门互异及路线用途全部通过自动检查。
- ✅ 文首追加“路线叙事第三轮（2026-09-29）”，索引与 §15.1 核算镜像同步；原有待决事项未删除。
- ✅ 所有指定命令与附加空白检查通过；文档无截断表格、未闭合代码块或新增占位文本。
- ⚠️ §2.4 混合路线性质读法仍待作者／协调者确认：计票读法为改前 6 条、改后 4 条冲突，字面读法为 0／0；自动检查因性质解析失败而显示 0，不能作为本册无冲突的依据。除两条配对改线顺带修正外，本轮未为性质单独改线。
