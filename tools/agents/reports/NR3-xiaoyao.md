# NR3-xiaoyao 报告 · 路线叙事第三轮 · 逍遥（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

本单元分派的 30 对跨武学高相似路线已全部改开，保留理由 0 对；改后最高 `overlapBp=5000`，未新造任何 `≥8000` 配对。
共改写 18 条 NR3 路线，并另修 2 条斗转星移护体路线；20 条路线均保持段数、逐段 CT、风险序列、收招与出招方式不变。
`--delivery` 非性质违规由 3 降至 0；16 条性质冲突按任务指示仅登记、不为此改路。
传音搜魂“夺魂 / 失心”与大明咒“喝咒”已补 `voice:true`，且正文、绝招镜像与外放审计相互一致。
全部指定检查通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-xiaoyao.md` | 2732 | 20 条显式路线换穴；更新版本与上游版本；清理过期高相似理由；3 招补人声字段并同步审计 |
| `tools/agents/reports/NR3-xiaoyao.md` | 165 | 本报告：数值结论、逐对记录、delivery 对比、回归证据与跨文档同步项 |

未修改基准、任务清单、脚本或其他图鉴；未新增任何 ID。

## 3. 关键结论与数值

- 相似度按 21 §4.3.4：`overlapBp=floor(10000×|A∩B|/min(|A|,|B|))`。30 对改前分布为：10000（7 对）、9000（3 对）、8750（5 对）、8571（3 对）、8333（7 对）、8000（5 对）；改后均 `<8000`，最大值为 5000。
- 等长路线按 `floor(0.2L)+1` 核算最低换穴数：`L=10` 至少 3、`L=8` 至少 2、`L=7` 至少 2、`L=6` 至少 2。本轮承担 NR3 的 18 条路线均达到最低值；共享一条本侧路线的多个配对复用同一次改路。
- 20 条路线只替换 `acupointRef`，`segmentCt[]`、`riskBp[]` 与 `recovery=1200` 均不变；因此 `flowCt=ΣsegmentCt`、`收招合计=1200+flowCt` 和 `ΣriskBp` 全部守恒。
- `mfr_zhemei_xunmei` 以末两段手三里→合谷满足拳 / 擒拿末端；`mfr_douzhuan_xingyi`、`mfr_douzhuan_xinghe` 分别加入任脉气海、督脉神道，满足护体 / 蓄气须含任督。位移与非绝招外放原本即 0 违规。
- 本册 66 条绝招路线现在是 66 个不同有序序列；册内及跨册 `overlapBp≥8000` 均为 0。
- 人声字段以 05 §4.5.1 为准：`mv_chuanyinsouhun_duohun`、`mv_chuanyinsouhun_shixin`、`mv_damingzhou_hezhou` 均为 `projection:true; voice:true; tags:[sonic]`。

## 4. 开放问题（附默认值）

1. **路线性质判定优先级**：21 §2.4 中“含任督 / 奇经混合方案时取 harmony”存在计票读法与字面读法分歧。**默认值**：遵照任务指示，本轮不因性质告警换穴、不加 `allowOpposedNature`，保留以下 16 条当前命中，等待协调者 / 作者统一口径。
   - 绝招 9 条：`mfr_liuyangzhang_bafu`、`mfr_liuyangzhang_liuyang`、`mfr_baihongzhang_bingjiao`、`mfr_huagong_duwu`、`mfr_huagong_huajin`、`mfr_longxiang_banruo`、`mfr_fushidu_shidu`、`mfr_dashouyin_dashouyin`、`mfr_duanmaidao_wuhen`。
   - 普通外放 7 条：`mfr_damingzhou_hezhou`、`mfr_huoyandao_duanxiang`、`mfr_huoyandao_fenxin`、`mfr_huoyandao_huolun`、`mfr_huoyandao_liaoyuan`、`mfr_huoyandao_pikong`、`mfr_liuyangzhang_yangsui`。
   - 改前另有 `mfr_bahuang_duzun`、`mfr_huoyandao_hufa` 两条；二者为处理 NR3 配对而换穴后自然不再命中，并非为规避性质检查。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NR3-X-P01 | 在 Canon / 21 明定“路线中同时出现任督、奇经与十二正经时”的性质判定优先级，并给出至少一条可执行算例 | 当前计票读法与“含任督 / 奇经混合即 harmony”的字面读法会分别产生约 104 / 25 条全库命中；先统一语义才能安全批改 16 条本册命中 |

除 NR3-X-P01 外，本任务不提出新的基准数值或 schema 修改。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/00-canon.md` / `docs/design/21-meridian-flow-and-moves.md` | 路线性质规则（21 §2.4） | 作者确认 NR3-X-P01 后统一判定优先级与算例 |
| 后续性质专项涉及的图鉴 | 对应 16 条路线 | 仅在统一口径确定后处理；本任务不越权修改 |

30 对的“另一侧”均已因本侧改路降到阈值以下，不要求其他任务再调整；无其他跨册路线交接。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

下表穴位均省略 `ap_` 前缀；“出 / 入”是相对任务开始时 `HEAD` 的集合差。全部采用“改开”，无理由保留。

| # | 配对 | 改前 bp | 处理方式 | 改动的穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_bahuang_duzun` ↔ `mfr_gumuqinggong_fenying` | 10000 | 改开至 0 bp | `mfr_bahuang_duzun`：出[阴跷列缺、阴维廉泉、足厥阴太冲、足少阴复溜、足少阴涌泉、足太阴血海、任脉气海、任脉中脘、手厥阴天泉、手少阴少府]；入[任脉会阴、任脉中极、任脉水分、督脉腰俞、督脉水沟、督脉百会、足少阳风市、阳维天髎、手少阴青灵、手厥阴天池] |
| 2 | `mfr_beiming_kuntun` ↔ `mfr_xinyiba_heyi` | 10000 | 改开至 1666 bp | `mfr_beiming_kuntun`：出[足少阴复溜、足少阴涌泉、足太阴血海、任脉中脘、手厥阴天泉、手少阴少府、阴跷交信、阴维腹哀]；入[足少阴大钟、足少阴水泉、足太阴太白、足太阴公孙、任脉中极、冲脉大赫、冲脉气穴、手厥阴曲泽] |
| 3 | `mfr_lingbo_jiangfei` ↔ `mfr_gumuqinggong_youshen` | 10000 | 改开至 1250 bp | `mfr_lingbo_jiangfei`：出[足少阴太溪、足太阳委中、督脉命门、带脉足临泣、带脉维道、带脉带脉、督脉至阳、手厥阴内关、手厥阴劳宫]；入[阳跷仆参、足少阳风市、带脉五枢、带脉章门、阳跷居髎、足少阳悬钟、督脉水沟、足太阳昆仑、足少阳足窍阴] |
| 4 | `mfr_huoyandao_hufa` ↔ `mfr_shenshuineigong_huilan` | 10000 | 改开至 0 bp | `mfr_huoyandao_hufa`：出[足太阴阴陵泉、任脉神阙、手厥阴间使、手厥阴中冲、手少阴神门、手太阴天府、阴跷列缺、阴维廉泉、足厥阴太冲]；入[督脉命门、督脉脊中、督脉至阳、阳维肩井、足少阳风市、手少阳天井、手太阳天宗、手阳明曲池、手厥阴内关] |
| 5 | `mfr_lingbo_jiangfei` ↔ `mfr_shexinglifan_baibian` | 10000 | 改开至 1250 bp | 同 #3 的 `mfr_lingbo_jiangfei` 换穴 |
| 6 | `mfr_lingbo_jiangfei` ↔ `mfr_tianlongchanbu_tuili` | 10000 | 改开至 1666 bp | 同 #3 的 `mfr_lingbo_jiangfei` 换穴 |
| 7 | `mfr_qinlonggong_shuaizhi` ↔ `mfr_taiyueshibei_hengpai` | 10000 | 改开至 0 bp | `mfr_qinlonggong_shuaizhi`：出[足太阳肺俞、足阳明承泣、足阳明天枢、督脉神道、手少阳关冲、手少阳支沟、手太阳腕骨、手阳明曲池]；入[足阳明梁丘、足少阳风市、督脉腰阳关、督脉脊中、手太阳天宗、手少阳外关、手阳明手三里、手阳明合谷] |
| 8 | `mfr_zhemei_xunmei` ↔ `mfr_hama_quanjin` | 9000 | 改开至 0 bp | `mfr_zhemei_xunmei`：出[阴维期门、足厥阴膝关、足少阴灵墟、足太阴大包、足太阴隐白、任脉曲骨、手厥阴大陵、手厥阴郄门、手少阴少海、手太阴太渊]；入[冲脉四满、冲脉中注、带脉章门、阴跷三阴交、阳跷肩髃、手太阳天宗、手少阴通里、手厥阴曲泽、手阳明手三里、手阳明合谷] |
| 9 | `mfr_liuyangzhang_bafu` ↔ `mfr_yijinjing_daozhuai` | 9000 | 改开至 5000 bp | `mfr_liuyangzhang_bafu`：出[阴跷照海、阴维筑宾、足厥阴阴廉、任脉石门]；入[手太阴中府、阴维大横、足厥阴中都、任脉中脘] |
| 10 | `mfr_longxiang_banruo` ↔ `mfr_suxin_hebi` | 9000 | 改开至 0 bp | `mfr_longxiang_banruo`：出[足太阴大包、足太阴隐白、任脉曲骨、手厥阴大陵、手厥阴郄门、手少阴少海、手太阴太渊、阴跷睛明、阴维府舍、足厥阴曲泉]；入[任脉会阴、任脉中极、任脉关元、足太阴太白、足少阴大钟、足厥阴行间、手少阴灵道、手太阴孔最、手厥阴天池、任脉膻中] |
| 11 | `mfr_beiming_kuntun` ↔ `mfr_gumuqinggong_fenying` | 8750 | 改开至 1250 bp | 同 #2 的 `mfr_beiming_kuntun` 换穴 |
| 12 | `mfr_huagong_duwu` ↔ `mfr_yanzisanchaoshui_sanchao` | 8750 | 改开至 0 bp | `mfr_huagong_duwu`：出[足阳明天枢、督脉神道、手少阳关冲、手少阳支沟、手太阳腕骨、手阳明曲池、阳跷跗阳、阳跷申脉]；入[督脉腰阳关、督脉脊中、足阳明梁丘、足少阳外丘、手少阳天井、手太阳阳谷、手阳明偏历、手阳明合谷] |
| 13 | `mfr_wulundazhuan_tielun` ↔ `mfr_hunyuanfangzhuang_kaiyun` | 8750 | 改开至 0 bp | `mfr_wulundazhuan_tielun`：出[足少阳日月、足太阳承山、足太阳心俞、足阳明人迎、督脉命门、督脉阴交、手少阳液门]；入[阳维阳交、足少阳风市、足太阳昆仑、足阳明梁丘、督脉腰阳关、督脉脊中、手太阳阳谷] |
| 14 | `mfr_zhemei_xunmei` ↔ `mfr_jinzhongzhao_bupo` | 8750 | 改开至 0 bp | 同 #8 的 `mfr_zhemei_xunmei` 换穴 |
| 15 | `mfr_wulundazhuan_tielun` ↔ `mfr_mujianyi_wanwu` | 8750 | 改开至 1250 bp | 同 #13 的 `mfr_wulundazhuan_tielun` 换穴 |
| 16 | `mfr_bahuang_fanlao` ↔ `mfr_changbaicaogong_huichun` | 8571 | 改开至 1428 bp | `mfr_bahuang_fanlao`：出[带脉足临泣、阳跷申脉、手太阴太渊、足少阳阳陵泉、足厥阴太冲、督脉神道]；入[阳跷仆参、阳维阳交、足少阳悬钟、督脉腰阳关、督脉脊中、督脉至阳] |
| 17 | `mfr_dongxishuangjian_hebi` ↔ `mfr_jingedangkouqiang_aobing` | 8571 | 改开至 1428 bp | `mfr_dongxishuangjian_hebi`：出[阴跷照海、带脉足临泣、手太阳腕骨、足厥阴太冲、足少阳阳陵泉、手少阳外关]；入[冲脉大赫、带脉五枢、阳跷居髎、阴跷三阴交、手少阴通里、手太阳阳谷] |
| 18 | `mfr_wulundazhuan_dazhuan` ↔ `mfr_dongxishuangjian_hebi` | 8571 | 改开至 1428 bp | 同 #17 的 `mfr_dongxishuangjian_hebi` 换穴 |
| 19 | `mfr_beiming_kuntun` ↔ `mfr_zaoheding_penhe` | 8333 | 改开至 3333 bp | 同 #2 的 `mfr_beiming_kuntun` 换穴 |
| 20 | `mfr_jingangxiangmochu_fumo` ↔ `mfr_dongxishuangjian_hebi` | 8333 | 改开至 3333 bp | `mfr_jingangxiangmochu_fumo`：出[阴跷照海、足厥阴太冲、足阳明足三里、手太阳腕骨、手少阳外关]；入[督脉身柱、足阳明梁丘、足少阳外丘、手太阳天宗、手太阳阳谷]；`mfr_dongxishuangjian_hebi` 同 #17 |
| 21 | `mfr_huagong_huajin` ↔ `mfr_shexinshu_mihun` | 8333 | 改开至 5000 bp | `mfr_huagong_huajin`：出[任脉气海、足阳明足三里]；入[任脉中极、足阳明梁丘] |
| 22 | `mfr_jingangxiangmochu_fumo` ↔ `mfr_jiuyin_tianzhidao` | 8333 | 改开至 1666 bp | 同 #20 的 `mfr_jingangxiangmochu_fumo` 换穴 |
| 23 | `mfr_xuehendao_xuehen` ↔ `mfr_jiuyin_tianzhidao` | 8333 | 改开至 5000 bp | `mfr_xuehendao_xuehen`：出[阴跷照海、手少阴神门]；入[阴跷交信、手少阴阴郄] |
| 24 | `mfr_yirongshu_huanrong` ↔ `mfr_jiuyinliaoshangpian_biqi` | 8333 | 改开至 5000 bp | `mfr_yirongshu_huanrong`：出[手少阴神门、足阳明足三里]；入[手少阴阴郄、足阳明梁丘] |
| 25 | `mfr_mizonghufashen_huti` ↔ `mfr_kurongchangong_feikufeirong` | 8333 | 改开至 1666 bp | `mfr_mizonghufashen_huti`：出[冲脉气冲、足厥阴太冲、手太阳腕骨、足太阳委中、督脉神道]；入[督脉腰俞、督脉腰阳关、督脉脊中、阳维肩井、手太阳天宗] |
| 26 | `mfr_longxiang_banruo` ↔ `mfr_anran_xiaohun` | 8000 | 改开至 0 bp | 同 #10 的 `mfr_longxiang_banruo` 换穴 |
| 27 | `mfr_bahuang_duzun` ↔ `mfr_xiantiangong_wuqi` | 8000 | 改开至 0 bp | 同 #1 的 `mfr_bahuang_duzun` 换穴 |
| 28 | `mfr_longxiang_banruo` ↔ `mfr_hama_quanjin` | 8000 | 改开至 0 bp | 同 #10 的 `mfr_longxiang_banruo` 换穴 |
| 29 | `mfr_mizonghufashen_huti` ↔ `mfr_yijinduangupian_tuotai` | 8000 | 改开至 2000 bp | 同 #25 的 `mfr_mizonghufashen_huti` 换穴 |
| 30 | `mfr_xiaowuxiang_wuwo` ↔ `mfr_yijinduangupian_tuotai` | 8000 | 改开至 4000 bp | `mfr_xiaowuxiang_wuwo`：出[带脉足临泣、带脉维道、足太阳委中、手太阳腕骨]；入[冲脉大赫、冲脉气穴、带脉五枢、带脉章门] |

### 7.2 `--delivery` 命中数

| 规则 | 改前 | 改后 | 结论 |
|---|---:|---:|---|
| 路线总数 / 已分类 / 实际检查 | 66 / 55 / 65 | 66 / 55 / 65 | 数量未变 |
| 非性质违规 `violations` | 3 | 0 | ✅ 全部修复 |
| 拳 / 擒拿末端 | 1 | 0 | ✅ `mfr_zhemei_xunmei` 改为手三里→合谷收束 |
| 位移核心脉 | 0 | 0 | ✅ 保持通过 |
| 护体 / 蓄气任督 | 2 | 0 | ✅ 斗转星移两路分别补任脉 / 督脉 |
| 非绝招外放端点 | 0 / 19 条 | 0 / 19 条 | ✅ 保持通过 |
| `tail_violations` | 0 | 0 | ✅ 保持通过 |
| 未分类 | 11 | 11 | ⚠️ 无可靠动作分类者未硬套规则 |
| 性质冲突 | 18 | 16 | ⚠️ 按任务指示不专项修；清单见 §4 |

### 7.3 改过的路线清单

所有风险栏的“序列不变”均指逐段 `riskBp[]` 不变，不只总和相等。

| 路线 | 段数 | `ΣCT` | `ΣriskBp` / 风险序列 | 说明 |
|---|---:|---:|---|---|
| `mfr_bahuang_duzun` | 10 | 800 → 800 | 1900 → 1900；序列不变 | NR3 换穴 |
| `mfr_bahuang_fanlao` | 7 | 525 → 525 | 910 → 910；序列不变 | NR3 换穴 |
| `mfr_beiming_kuntun` | 10 | 800 → 800 | 1900 → 1900；序列不变 | NR3 换穴 |
| `mfr_dongxishuangjian_hebi` | 7 | 525 → 525 | 910 → 910；序列不变 | NR3 换穴 |
| `mfr_huagong_duwu` | 8 | 720 → 720 | 1360 → 1360；序列不变 | NR3 换穴 |
| `mfr_huagong_huajin` | 8 | 600 → 600 | 1080 → 1080；序列不变 | NR3 换穴 |
| `mfr_huoyandao_hufa` | 10 | 800 → 800 | 1900 → 1900；序列不变 | NR3 换穴 |
| `mfr_jingangxiangmochu_fumo` | 6 | 510 → 510 | 750 → 750；序列不变 | NR3 换穴 |
| `mfr_lingbo_jiangfei` | 10 | 700 → 700 | 1190 → 1190；序列不变 | NR3 换穴 |
| `mfr_liuyangzhang_bafu` | 10 | 800 → 800 | 1900 → 1900；序列不变 | NR3 换穴 |
| `mfr_longxiang_banruo` | 10 | 800 → 800 | 1900 → 1900；序列不变 | NR3 换穴 |
| `mfr_mizonghufashen_huti` | 6 | 510 → 510 | 750 → 750；序列不变 | NR3 换穴 |
| `mfr_qinlonggong_shuaizhi` | 8 | 720 → 720 | 1360 → 1360；序列不变 | NR3 换穴 |
| `mfr_wulundazhuan_tielun` | 8 | 720 → 720 | 1360 → 1360；序列不变 | NR3 换穴 |
| `mfr_xiaowuxiang_wuwo` | 7 | 525 → 525 | 910 → 910；序列不变 | NR3 换穴 |
| `mfr_xuehendao_xuehen` | 6 | 510 → 510 | 750 → 750；序列不变 | NR3 换穴 |
| `mfr_yirongshu_huanrong` | 7 | 525 → 525 | 910 → 910；序列不变 | NR3 换穴 |
| `mfr_zhemei_xunmei` | 10 | 800 → 800 | 1900 → 1900；序列不变 | NR3 换穴；兼修拳 / 擒拿末端 |
| `mfr_douzhuan_xingyi` | 10 | 750 → 750 | 1450 → 1450；序列不变 | delivery 护体任督补齐 |
| `mfr_douzhuan_xinghe` | 8 | 600 → 600 | 1080 → 1080；序列不变 | delivery 护体任督补齐 |

20 条路线的收招均为 1200 CT，故收招合计依次为上表 `ΣCT+1200`，即 1710–2000 CT；均满足 21 的 2000 CT 上限。

### 7.4 交其他任务的条目

- ✅ 30 对均由本侧改开，所有“另一侧”保持未改；不存在还需另一侧调整才能降到 8000 bp 以下的配对。
- ⚠️ 性质冲突须等 NR3-X-P01 统一后再分派，不能把本报告的 16 条登记误当作路线豁免。

### 7.5 验收命令

| 验收项 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；仅有基线已知 `sk_babuganchan`，新增严格失败数 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 项通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-xiaoyao.md` | ✅ 通过；66 路线、66 序列、册内 / 跨册 ≥80% 均 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-xiaoyao.md` | ✅ 完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-xiaoyao.md` | ✅ 未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py xiaoyao` | ✅ 30 已改开 / 0 理由 / 0 未处理 / 0 新造 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-xiaoyao.md` | ✅ 非性质违规 0；性质冲突 16，按任务指示登记 |
| `git diff --check` | ✅ 通过 |

### 7.6 规则逐项核对

- ✅ 仅修改授权的图鉴与本报告；未改其他仓库文件，未执行改变仓库状态的 Git 命令。
- ✅ 每对优先改开；30 / 30 均降至 `<8000`，10000 bp 的 7 对全部改开。
- ✅ 没有缩短路线；段数、逐段 CT、风险序列、收招、`purpose` 与出招方式均保持，镜像表继续统一写“见文首索引”。
- ✅ 拳 / 擒拿、位移、护体 / 蓄气、非绝招外放端点的 delivery 规则均为 0 违规。
- ✅ 同一武学共享 ≤50%，无轮换或逆序；所有穴位已登记，路线内无重复穴位。
- ✅ 未新造 ID；人声音功按既有 schema 补 `voice:true`。
- ⚠️ 16 条性质冲突未修改，严格遵守本轮“先不改、只列清单”的专项要求。
- ✅ 无未完成占位语句；Markdown 表格、代码块与章节结构完整。
