# NR3-kangxi 报告 · 路线叙事第三轮 · 康熙（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

逐对处理康熙册名下 25 对跨武学高相似路线：涉及 13 条本侧路线，全部改开至 `overlapBp<8000`，未使用传承豁免，也未新造任何 ≥80% 配对。
同时修复 `mfr_ningxue_fengmen` 的拳／擒拿动作末端和 `mfr_meinianshengxinfa_huixi` 的护体任督要求；`--delivery` 违规由 2 降至 0。
14 条改写路线均保持路线 ID、出招方式、purpose、段数、逐段 CT、风险列和收招不变，并同步文首索引、叙事、数值镜像及验收项。
本册 33 条绝招路线现为 33 个不同序列；本册内及本任务名下跨册 ≥80% 配对均为 0。全仓仍有涉及康熙册的 5 对由其他 NR3 单元负责，已如实移交；全部指定门禁通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节与产出 |
|---|---:|---|
| `docs/design/catalog/skills-kangxi.md` | 1,596 | 文首 14 条路线更新；§16A.2 高相似处理说明、动作叙事与数值镜像；§18 KX-V24、T-KX-21；版本记录 |
| `tools/agents/reports/NR3-kangxi.md` | 152 | 本报告：逐对证据、delivery 前后统计、改路清单、开放项与门禁记录 |

图鉴由 1,571 行增至 1,596 行，净增 25 行（`25/1571≈1.59%`），未删减既有待决事项，也未修改写集外文件。

## 3. 关键结论与数值

- 25 对分配项全部采用“改开”：改前含 8 对 `10000 bp`、8 对 `8750 bp`、9 对 `8333 bp`；改后 18 对为 0、5 对为 `1666 bp`、2 对为 `1250 bp`。最大值 `1666<8000`，故没有保留理由条目。
- 13 条分配路线的集合替换数为：10 段路线各 10；8 段路线为 `8,8,7,8,7,8,8,8,8`；6 段路线为 `6,5`。均不少于 `floor(0.2L)+1`：10 段至少 3、8 段至少 2、6 段至少 2。
- 额外修复 1 条护体路线 `mfr_meinianshengxinfa_huixi`，集合替换 5/6；因此本轮共改 14 条路线。所有路线维持 10／8／6 段，路线 CT 分别为 800／720／600；`recovery=1200` 后收招合计为 2000／1920／1800。
- 风险列没有变化：10 段 `100+120+…+280=1900`，8 段 `100+120+…+240=1360`，6 段 `100+120+…+200=900`。这里的总风险是逐段策划值之和；单段仍各在 `0–1200 bp`。
- 本册路径严格多样性结果为 `routes=33`、`distinct_sequences=33`、本册内 `similar_pairs_ge80=0`、完全相同路线 0；NR3 专项为“25 对已改开 25、写理由 0、未处理 0、新造 0”。全仓扫描另有 5 对涉及未改的康熙路线，均归其他 NR3 单元。
- `MoveDef.voice` 已由 `design/05` 提供，但本册没有人声音功招，故没有字段补标。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本任务默认值 |
|---|---|---|
| O-01 | `design/21` §2.4 中“含任督／奇经混合方案时取 harmony”采用计票读法还是字面读法 | 按协调者要求，本轮只报告、不为性质改路线。`check_skill_catalogs.py` 的 `_skill_natures` 读不到本册 25 门带绝招武学的性质：33 条绝招路线的 `DeliveryRoute.nature` 全为 `None`；§16A.2 的“`sk_*` / 阴”和卡片“`yin` · 0.55/0.45 · 4”两种写法均不被识别，字段行的 `nature:` 还会归到同行唯一的前置武学，故脚本 `nature_conflicts=0` 是空转。改用 §16A.2 的阴／阳／和／中标注核算：计票读法为阴阳段数多数决、相等取和，字面读法为含任督或奇经即取和；两种读法改前／改后均为 0 命中。`mfr_shenzhao_xumai` 的计票性质由阴变和、`mfr_meinianshengxinfa_huixi` 由阳变和，两门卡面均为“和”，且变化分别由配对改路、任督规则改路附带产生 |
| O-02 | 图鉴既有 O-03～O-07、D-03、D-05 是否由作者改定 | 全部沿用既有默认值，不在路线任务中删除或越权收口 |
| O-03 | `docs/README.md` 的 `sk_babuganchan` 未定义基线项 | 不越权修改；`check_ids.py --strict` 确认新严格失败为 0 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。Canon V17-06 与 `design/21` §4.3.1、§4.3.4、§4.6、§17.1 已足以约束本轮路线改写；§2.4 的性质解释等待作者统一裁定，不在本任务提出竞争版本。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档／任务 | 位置 | 需同步内容 |
|---|---|---|
| `design/21` 归属方／协调者 | §2.4 | 裁定任督／奇经混合路线的性质算法；康熙册按 §16A.2 标注人工核算为 0 命中，无需先行改路 |
| lint 归属方（NYY／NAu-final） | `check_skill_catalogs.py` 的 `_skill_natures` | 补齐康熙册格式识别：§16A.2 的“`sk_*` / 阴”及完整卡“`yin` · 0.55/0.45 · 4”目前不被识别，字段行 `nature:` 还会误归给同行唯一的前置武学，导致本册 33 条绝招路线的 `DeliveryRoute.nature` 全为 `None` |
| 后续全局汇总任务 | 跨武学多样性统计 | 采用本册当前 `33 routes / 33 distinct / 本册内 ≥80% 为 0 / 涉及康熙册的全仓跨册暂余 5 对`，不要沿用 NXfix-kangxi 的跨册 54 对旧快照 |
| 其他 NR3 单元 | 下表“另一侧”路线 | 本任务未修改任何另一侧；分配的 25 对已由康熙侧全部改开，其他任务无需为这些配对重复调整，但仍须处理它们各自名下的其他配对 |
| `docs/README.md` 归属方 | `sk_babuganchan` 引用 | 补正式定义或替换为既有 ID；当前属于严格 ID 检查的已知 baseline |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

“改动穴位”按 `HEAD` 旧版与当前文首路线索引做集合差生成；同一路线被多对命中时，各行复用同一次改写证据。

| # | 配对（本侧 ↔ 另一侧） | 改前 bp | 处理方式／改后 bp | 改动穴位（本侧） |
|---:|---|---:|---|---|
| 1 | `mfr_meirensanzhao_feiyan` ↔ `mfr_baicaobiandu_xiangke` | 10000 | 改开／0 | 8/8：大敦、中都、水泉、公孙、膻中、水分、内关、灵道 → 涌泉、交信、睛明、行间、阴陵泉、石门、手三里、合谷 |
| 2 | `mfr_shenlongxinfa_zuozhen` ↔ `mfr_hujiadao_fengxue` | 10000 | 改开／0 | 8/8：跗阳、申脉、哑门、悬钟、昆仑、丰隆、足三里、身柱 → 长强、脊中、至阳、肩井、心俞、天井、天宗、百会 |
| 3 | `mfr_taiyueshibei_hengpai` ↔ `mfr_hujiadao_humiaohuzhao` | 10000 | 改开／1666 | 5/6：承泣、天枢、神道、关冲、支沟 → 腰俞、梁丘、肩井、天井、养老；腕骨保留 |
| 4 | `mfr_shenzhao_xumai` ↔ `mfr_huzhaojuehushou_juehu` | 10000 | 改开／0 | 10/10：腹哀、蠡沟、中封、太溪、商丘、关元、阴交、曲泽、青灵、尺泽 → 会阴、石门、中注、幽门、腰俞、脊中、神道、百会、大陵、神门 |
| 5 | `mfr_xuedaofa_cangfeng` ↔ `mfr_jinyangong_yanhui` | 10000 | 改开／0 | 8/8：关元、阴交、曲泽、青灵、尺泽、云门、照海、外关 → 大敦、曲泉、阴陵泉、大钟、通里、太渊、阳池、阳谷 |
| 6 | `mfr_meirensanzhao_feiyan` ↔ `mfr_jiuyinshenzhao_shounao` | 10000 | 改开／0 | 同 #1：整条 8 段改写 |
| 7 | `mfr_ningxue_fengmen` ↔ `mfr_wujixuangongquan_huoshou` | 10000 | 改开／0 | 10/10：曲泽、青灵、尺泽、云门、照海、筑宾、阴廉、俞府、地机、承浆 → 涌泉、交信、府舍、曲泉、阴陵泉、少府、太渊、曲池、手三里、合谷 |
| 8 | `mfr_taiyueshibei_hengpai` ↔ `mfr_yanzisanchaoshui_sanchao` | 10000 | 改开／1666 | 同 #3：替换 5/6，保留腕骨 |
| 9 | `mfr_gaochangshouhu_qianmen` ↔ `mfr_emeijiuyang_chaoyang` | 8750 | 改开／0 | 8/8：脊中、腰阳关、金门、少泽、二间、阳溪、居髎（胃）、阳池 → 横骨、气穴、五枢、京门、巨骨、中渚、后溪、腕骨 |
| 10 | `mfr_weixinliandao_lianying` ↔ `mfr_fenshuiemeici_jingfan` | 8750 | 改开／0 | 8/8：前谷、养老、手三里、居髎、肩井、光明、足窍阴、合谷 → 长强、腰阳关、风市、梁丘、阳交、天井、后溪、阳池 |
| 11 | `mfr_huagumianzhang_huihuan` ↔ `mfr_tiangang_guiyi` | 8750 | 改开／1250 | 7/8：大钟、阴谷、太白、会阴、中极、天池、少冲 → 照海、府舍、蠡沟、灵墟、大包、间使、内关；劳宫保留 |
| 12 | `mfr_shenlongxinfa_wanshou` ↔ `mfr_huanyirongshu_huanxing` | 8750 | 改开／1250 | 7/8：阴交、液门、天宗、合谷、迎香、臑俞、天髎 → 身柱、哑门、风府、曲池、小海、阳池、水沟；命门保留 |
| 13 | `mfr_shenlongxinfa_zuozhen` ↔ `mfr_huweiyingqiang_bafang` | 8750 | 改开／0 | 同 #2：整条 8 段改写 |
| 14 | `mfr_shenzhao_xumai` ↔ `mfr_jinlingsuo_shepo` | 8750 | 改开／0 | 同 #4：整条 10 段改写 |
| 15 | `mfr_shenzhao_xumai` ↔ `mfr_shenshuineigong_zhongchao` | 8750 | 改开／0 | 同 #4：整条 10 段改写 |
| 16 | `mfr_xuedaojing_yinren` ↔ `mfr_tiebushan_gangqi` | 8750 | 改开／0 | 8/8：膻中、水分、内关、灵道、阴郄、鱼际、三阴交、天突 → 曲骨、石门、大横、膝关、灵墟、大包、通里、少商 |
| 17 | `mfr_shenlongxinfa_zuozhen` ↔ `mfr_daqiqiang_chongying` | 8333 | 改开／0 | 同 #2：整条 8 段改写 |
| 18 | `mfr_wangwuposhi_kaishan` ↔ `mfr_daqiqiang_chongying` | 8333 | 改开／1666 | 8/8：小海、曲池、跗阳、申脉、哑门、悬钟、昆仑、腕骨 → 带脉、外丘、承山、命门、巨骨、三间、外关、阳谷 |
| 19 | `mfr_shenzhao_xumai` ↔ `mfr_duanzhenqiang_pozhen` | 8333 | 改开／0 | 同 #4：整条 10 段改写 |
| 20 | `mfr_gaochangshouhu_qianmen` ↔ `mfr_jifengqishu_chitu` | 8333 | 改开／0 | 同 #9：整条 8 段改写 |
| 21 | `mfr_taiyueshibei_hengpai` ↔ `mfr_huagong_duwu` | 8333 | 改开／1666 | 同 #3：替换 5/6，保留腕骨 |
| 22 | `mfr_ningxue_fengmen` ↔ `mfr_jinyangong_yanhui` | 8333 | 改开／0 | 同 #7：整条 10 段改写 |
| 23 | `mfr_linyulongdao_zhengxian` ↔ `mfr_qihuangmifa_qichenke` | 8333 | 改开／1666 | 6/6：昆仑、丰隆、足三里、身柱、丝竹空、阳池 → 人迎、外丘、水沟、中渚、阳溪、阳谷 |
| 24 | `mfr_ningxue_fengmen` ↔ `mfr_sanhuajudingzhang_juding` | 8333 | 改开／0 | 同 #7：整条 10 段改写 |
| 25 | `mfr_xuedaofa_cangfeng` ↔ `mfr_sanhuajudingzhang_juding` | 8333 | 改开／0 | 同 #5：整条 8 段改写 |

### 7.2 `--delivery` 命中数（改前／改后）

| 规则 | 适用路线数 | 改前违规 | 改后违规 | 处理结果 |
|---|---:|---:|---:|---|
| 拳／擒拿末 1–3 段 | 3 | 1 | 0 | `mfr_ningxue_fengmen` 末三段改为曲池—手三里—合谷 |
| 位移核心脉／涌泉 | 0 | 0 | 0 | 本册绝招无被分类为位移者；未改出招方式规避检查 |
| 护体／蓄气含任督 | 5 | 1 | 0 | `mfr_meinianshengxinfa_huixi` 加入任脉中脘与督脉神道、身柱 |
| 非绝招外放合法端点 | 2 | 0 | 0 | `mfr_huagumianzhang_geyi`、`mfr_shenlongxinfa_tuxi` 保持合法劳宫端点 |
| 路线性质冲突 | 33 条绝招路线／25 门武学 | 0 | 0 | 脚本值为空转：33 条 `DeliveryRoute.nature` 全为 `None`。改以 §16A.2 的阴／阳／和／中标注复核，计票读法与字面读法均为改前 0、改后 0；`mfr_shenzhao_xumai` 计票性质阴→和、`mfr_meinianshengxinfa_huixi` 阳→和，均与卡面“和”一致，且是配对／任督改路的附带变化；未为性质改路 |
| 既有掌末端 | 3 | 0 | 0 | 全部合法 |
| 既有指／腿末端 | 0／0 | 0 | 0 | 本册无适用路线 |
| 既有兵器末端 | 16 | 0 | 0 | 全部在最后三段落合法腕部导引穴 |
| 既有攻击内功任督 | 2 | 0 | 0 | 全部合法 |
| 绝招外放端点 | 0 | 0 | 0 | 本册两条外放均为非绝招，已计入上项 |

总计保持 `routes=33`、`classified=29`、`checked_rules=29`、`unclassified=4`、非绝招外放路线 2；`violations 2→0`、`tail_violations 0→0`、`nonultimate_projection_violations 0→0`。脚本 `nature_conflicts 0→0` 为空转；按 §16A.2 标注人工复核的两种读法均为 `0→0`。

### 7.3 改过的路线清单

| 路线 | 原因 | 段数 | 路线 CT | 风险列／总风险是否变化 |
|---|---|---:|---:|---|
| `mfr_ningxue_fengmen` | 配对＋拳／擒拿末端 | 10 | 800 | 否；`[100,120,…,280]`／1900 |
| `mfr_shenlongxinfa_zuozhen` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_shenlongxinfa_wanshou` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_meirensanzhao_feiyan` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_wangwuposhi_kaishan` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_huagumianzhang_huihuan` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_shenzhao_xumai` | 配对 | 10 | 800 | 否；`[100,120,…,280]`／1900 |
| `mfr_xuedaojing_yinren` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_xuedaofa_cangfeng` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_gaochangshouhu_qianmen` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_weixinliandao_lianying` | 配对 | 8 | 720 | 否；`[100,120,…,240]`／1360 |
| `mfr_linyulongdao_zhengxian` | 配对 | 6 | 600 | 否；`[100,120,…,200]`／900 |
| `mfr_taiyueshibei_hengpai` | 配对 | 6 | 600 | 否；`[100,120,…,200]`／900 |
| `mfr_meinianshengxinfa_huixi` | 护体／蓄气末端检查 | 6 | 600 | 否；`[100,120,…,200]`／900 |

14 条路线的 `MoveDef`、route ID、`ultimate`、purpose、出招方式、段数、逐段 CT、逐段风险、`recovery` 均未变化；只有有序穴位序列改变。文首索引与 §16A.2 的“显式（见本册绝招显式路线索引）”镜像一致。

### 7.4 交其他任务的条目

- ✅ 25 对的“另一侧”均未修改：`mfr_baicaobiandu_xiangke`、`mfr_hujiadao_fengxue`、`mfr_hujiadao_humiaohuzhao`、`mfr_huzhaojuehushou_juehu`、`mfr_jinyangong_yanhui`、`mfr_jiuyinshenzhao_shounao`、`mfr_wujixuangongquan_huoshou`、`mfr_yanzisanchaoshui_sanchao`、`mfr_emeijiuyang_chaoyang`、`mfr_fenshuiemeici_jingfan`、`mfr_tiangang_guiyi`、`mfr_huanyirongshu_huanxing`、`mfr_huweiyingqiang_bafang`、`mfr_jinlingsuo_shepo`、`mfr_shenshuineigong_zhongchao`、`mfr_tiebushan_gangqi`、`mfr_daqiqiang_chongying`、`mfr_duanzhenqiang_pozhen`、`mfr_jifengqishu_chitu`、`mfr_huagong_duwu`、`mfr_qihuangmifa_qichenke`、`mfr_sanhuajudingzhang_juding`；其中重复出现的另一侧只列一次。
- ✅ 因康熙侧已将每对降至 0／1250／1666 bp，其他 NR3 任务不必为这 25 对再次改路；它们仍应按自己的分配表处理其他关系。
- ⚠️ `design/21` §2.4 的性质算法仍交协调者／作者统一裁定；本册没有需移交的性质命中路线。
- ⚠️ 全仓当前另有 5 对涉及康熙路线，分别归 `qianlong`、`shaolin`、`xiake-bixue`、`yitian`、`wuyue`：`mfr_gaochangshouhu_jieai` ↔ `mfr_miaojiajian_bafang`（8750）、`mfr_manchuqishe_chishe` ↔ `mfr_yiweidujiang_feidu`（10000）、`mfr_manchuqishe_chishe` ↔ `mfr_wenjiawuxingzhen_lunzhuan`（10000）、`mfr_manchuqishe_chishe` ↔ `mfr_wuxingqizhen_lunzhuan`（10000）、`mfr_renfeiyandao_rangfeng` ↔ `mfr_dugu9_wuzhao`（8333）。按分配规则应由各任务修改它们自己的“本单元路线”，本任务不动康熙侧。

### 7.5 硬约束、叙事与镜像

- ✅ 25 对均低于 `8000 bp`；8 对原 `10000 bp` 全部改开，没有用同性质或豁免表静默消警。
- ✅ 每条分配路线的集合替换数达到 `floor(0.2L)+1` 下限；没有缩短路线，没有改变出招方式。
- ✅ 33 条绝招路线均在建议段数内：天阶 10、地阶 8、玄上 6；单段 CT 80／90／100 均处于 40–120，且 `recovery+ΣCT≤2000`。
- ✅ 拳／擒拿、掌、兵器、攻击内功、护体／蓄气及非绝招外放末端全部合法；本册无须套用指、腿或位移规则。
- ✅ 本册内同门共享超过 50%、轮换／逆序、全仓完全同序列、新造 ≥80% 配对均为 0。
- ✅ 改写叙事明确标为**（原创扩展）**，没有编造原著引文、回目或现实经络疗效。
- ✅ 14 条数值镜像均使用“见文首索引”，段数、路线 CT、收招合计、总风险与风险列表已同步。
- ✅ 说明文字同步：第 57 行旧说明已改为饮刃现行的通里—少商吐劲；§16A.2 已区分血刀经饮刃与血刀刀法藏锋突进，并补记守正回息的 delivery 改路。
- ✅ 没有新增 ID；已有“待决事项”均保留。

### 7.6 门禁与写集

- ✅ `python3 tools/lint/check_ids.py --strict`：退出码 0；扫描 111 文件、63,134 次出现、13,906 个定义；仅报告已知 baseline `sk_babuganchan`，新增严格失败 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：145 项通过。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过，known deviations 0。
- ✅ `python3 tools/balance/meridian_flow_sim.py --check`：通过。
- ✅ `python3 tools/balance/projection_sim.py --check`：通过。
- ✅ `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-kangxi.md`：errors 0；33 路线／33 序列，本册内 ≥80% 配对 0；该单路径命令的跨册输入为空，故其 `cross_catalog_pairs_ge80=0` 不代表全仓统计。
- ✅ `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-kangxi.md`：全仓完全同路线 0。
- ✅ `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-kangxi.md`：未定义引用 0。
- ✅ `python3 tools/agents/check_nr3_unit.py kangxi`：名下 25 对全部改开，未处理 0，新造 ≥80% 配对 0。
- ✅ `git diff --check`：通过；最终只修改任务允许的图鉴与本报告。
