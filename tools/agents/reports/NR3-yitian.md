# NR3-yitian 报告 · 路线叙事第三轮 · 倚天（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

已处理 `tools/agents/nr3/yitian.md` 名下 25 对高相似路线：全部改开至 `overlapBp<8000`，没有使用叙事理由保留。
共调整 19 条本册路线，其中 16 条用于 NR3 配对、3 条只修拳／擒拿动作末端；段数、逐段 CT、风险数组、路线 CT 与收招合计均不变。
`--delivery` 的动作规则由缺失 5、末三段位置错误 1 收敛为 0 / 0；任务要求暂缓的性质冲突仍为 4 条。
全部指定门禁通过；全仓同序路线涉及本册为 0，本任务新造 `overlapBp≥8000` 配对为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 最终行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-yitian.md` | 1819 | 版本行；文首 42 条绝招路线镜像；§10.3 高相似处理说明；§12.1 / §12.2 校验与用例；§13.2 / §13.5 上游依赖与性质读法开放项 |
| `tools/agents/reports/NR3-yitian.md` | 162 | 25 对逐项证据、末端规则前后计数、19 条改线清单、4 条性质冲突与跨任务交接 |

`skills-yitian.md` 相对任务基点净增 8 行，替换 19 条路线定义并更新 1 条版本行；没有缩短 15% 风险，也没有修改写集外文件。

## 3. 关键结论与数值

| 主题 | 结论 / 核算 |
|---|---|
| 名下配对 | `25 = 25 改开 + 0 写理由 + 0 未处理`；改后 bp 分布为 0（16 对）、1000（1）、1250（2）、1666（2）、2000（1）、2500（2）、3750（1） |
| 替换下限 | 等长路线按 `floor(0.2L)+1`：6 段至少 2 穴、8 段至少 2 穴、10 段至少 3 穴；16 条 NR3 路线的集合替换数均达到下限 |
| 新造配对 | `check_nr3_unit.py yitian`：本任务新造 `≥8000` 配对 0；`check_route_unique_for.py`：与其他武学完全同序 0 |
| 本册内部 | 42 条绝招路线、42 个不同有序序列；不同武学 `≥8000` 为 0；同一武学最大共享为大九天手两路 `4/8=5000 bp`，不超过 50%，且无轮换／逆序 |
| 动作末端 | 缺失 `5→0`，末三段位置错误 `1→0`；位移核心、护体／蓄气任督、非绝招外放端点均维持 0 违规 |
| 路线预算 | 19 条改线的段数、每段 CT、风险数组均逐项不变，因此路线 CT、总风险、`recovery=1200` 与收招合计全部不变 |
| 人声字段 | `design/05` 已有 `MoveDef.voice`，但本册无音功／`tags:[sonic]` 招式，故无需补标 |

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 当前处置 |
|---|---|---|
| `NR3-YT-O01` | `design/21` §2.4 “含任督／奇经混合方案时取 harmony”应按逐节点计票，还是出现任督／奇经即取调和 | 暂沿检查器读法 1：阴阳逐节点计票、平票取调和；依任务要求，本轮不为性质冲突改路，等待协调者／作者统一裁定 |

当前读法 1 的 4 条命中为：`mfr_jiuyang_puzhao`（路线阴／声明阳）、`mfr_duyanfeisha_fengjiang`（路线阳／声明阴）、`mfr_xunleijianfa_shiliu`（路线阴／声明阳）、`mfr_yingsheshengsibo_shengsi`（路线阳／声明阴）。除该口径外，本轮无新增路线开放问题。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无新增提案 | Canon V17-06 与 `design/21` §4.3.1、§4.3.4、§4.6、§17.1 已足以完成本轮；性质解释属于既有 `NR3-YT-O01` 待决读法，不在本任务擅改基准 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 任务 | 位置 | 改什么 |
|---|---|---|
| 协调者／作者 | `design/21` §2.4 | 裁定任督／奇经混合路线的性质读法；裁定后统一处理 §4 的 4 条命中，不应由各册各自解释 |
| `docs/design/catalog/skills-kangxi.md` / NR3-kangxi | `mfr_weixinliandao_lianying` | 处理其与本册 `mfr_fenshuiemeici_jingfan` 的既有 `8750 bp` 配对；该对归 kangxi，本任务未改“另一侧” |
| `docs/design/catalog/skills-qianlong.md` / NR3-qianlong | `mfr_baxianjian_guohai` | 处理其与本册 `mfr_jindingjiushi_wanliu` 的既有 `8333 bp` 配对；该对归 qianlong |
| `docs/design/catalog/skills-xiake-bixue.md` / NR3-xiake-bixue | `mfr_taixuan_guiyi` | 处理其与本册 `mfr_xuanming_qichu` 的既有 `9000 bp` 配对；该对归 xiake-bixue |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

下表“穴位改动”按集合差记作 `移除 ⇒ 加入`；保留穴位即使换位也不重复列出。改后 bp 以当前全仓另一侧路线复算。

| # | 配对（本册路线 ↔ 另一侧） | 改前 bp | 处理方式 / 改后 bp | 穴位改动（本册侧） |
|---:|---|---:|---|---|
| 1 | `mfr_babishenjian_qichu` ↔ `mfr_jifengqishu_chitu` | 10000 | 改开至 0 | 足少阳窍阴、足太阳委中、足阳明厉兑、督脉脊中／腰阳关、手少阳阳池、手太阳少泽、手阳明二间 ⇒ 冲脉气冲、带脉五枢、阴维期门、足厥阴太冲、手少阴少海、手太阳天宗、手少阳外关、手太阳阳谷 |
| 2 | `mfr_qiankun_diandao` ↔ `mfr_dagouzhen_shouwang` | 10000 | 改开至 0 | 带脉足临泣／维道／带脉、任脉气海／关元、督脉至阳、手厥阴天池／曲泽 ⇒ 冲脉气穴／中注、带脉五枢／章门、阳跷居髎（尾）、阳维肩井、手太阳天宗、任脉中极 |
| 3 | `mfr_qiankun_diandao` ↔ `mfr_jiuyin_buzu` | 10000 | 改开至 0 | 同第 2 行；一次改线同时消除两对 |
| 4 | `mfr_qishangquan_tuntu` ↔ `mfr_lingshebu_tuoqiao` | 10000 | 改开至 0 | 足少阴涌泉／太溪、足太阳委中、督脉命门、带脉足临泣／维道、手厥阴天池／曲泽 ⇒ 冲脉大赫／气穴、任脉中极、督脉身柱、足太阴阴陵泉、手少阴少海、手阳明手三里／合谷 |
| 5 | `mfr_wuxingqizhen_lunzhuan` ↔ `mfr_manchuqishe_chishe` | 10000 | 改开至 0 | 手阳明阳溪、阳跷居髎（尾）、阳维金门、足少阳日月、足太阳承山／心俞、足阳明人迎 ⇒ 冲脉气冲、带脉五枢、足厥阴太冲、手少阴少海、足太阴阴陵泉、手阳明曲池、足少阳阳陵泉 |
| 6 | `mfr_qishangquan_tuntu` ↔ `mfr_tianlongchanbu_tuili` | 10000 | 改开至 0 | 同第 4 行；一次改线同时消除两对 |
| 7 | `mfr_shenghuoling_wuding` ↔ `mfr_tangmenanshou_baoyu` | 10000 | 改开至 0 | 任脉中脘、手厥阴天泉、手少阴少府、手太阴少商、阴跷交信、阴维腹哀、足厥阴蠡沟／中封、足少阴太溪、足太阴商丘 ⇒ 冲脉四满、带脉五枢、阴跷照海、阴维府舍、足太阴地机、足厥阴中都、手太阳天宗、手少阳外关、手阳明手三里／合谷 |
| 8 | `mfr_dajiutianshou_lieyang` ↔ `mfr_anran_daimu` | 8750 | 改开至 2500 | 督脉命门／神道／至阳／百会、手阳明曲池 ⇒ 督脉长强／腰俞／身柱、足少阳阳陵泉、足阳明丰隆 |
| 9 | `mfr_yingzhaoqinna_zhebing` ↔ `mfr_anran_daimu` | 8750 | 改开至 3750 | 手阳明商阳、任脉气海、督脉命门／至阳／百会 ⇒ 督脉身柱、手太阳天宗／养老、手少阳天井、手阳明偏历；并重排曲池／手三里／合谷至末三段 |
| 10 | `mfr_babishenjian_qichu` ↔ `mfr_qimenbuzhen_bamen` | 8750 | 改开至 0 | 同第 1 行；一次改线同时消除两对 |
| 11 | `mfr_emeijiuyang_chaoyang` ↔ `mfr_qimenbuzhen_bamen` | 8750 | 改开至 0 | 足阳明厉兑、督脉脊中／腰阳关、手少阳阳池、手太阳少泽、手阳明二间／阳溪、阳跷居髎（尾） ⇒ 足阳明足三里、阳维肩井、手少阳外关、督脉命门／身柱／百会、任脉膻中／气海 |
| 12 | `mfr_fanliangyi_sixiang` ↔ `mfr_huagong_duwu` | 8750 | 改开至 1250 | 督脉神道、手少阳关冲／支沟、阳维哑门、手阳明曲池、阳跷跗阳／申脉 ⇒ 冲脉气冲、带脉章门、足厥阴太冲、手少阴少海、手太阴太渊、足少阳阳陵泉、手少阳外关 |
| 13 | `mfr_wudangjiuyang_yanghe` ↔ `mfr_hujiadao_fengxue` | 8750 | 改开至 1250 | 任脉气海、手太阳腕骨、手阳明曲池、阳跷跗阳／申脉、阳维哑门、足少阳悬钟、足太阳昆仑 ⇒ 任脉关元、冲脉气穴、督脉腰俞／身柱／百会、足太阳天柱、阳维肩井、手少阳天井 |
| 14 | `mfr_jiuyang_huti` ↔ `mfr_yiyangzhi_qianyang` | 8750 | 改开至 2500 | 任脉关元、督脉命门／至阳／神道／百会 ⇒ 任脉石门、督脉长强／腰俞／身柱、阳维肩井；气海保留但移至第 2 段 |
| 15 | `mfr_wudangjiuyang_yanghe` ↔ `mfr_wangwuposhi_kaishan` | 8750 | 改开至 0 | 同第 13 行；一次改线同时消除三对 |
| 16 | `mfr_wuxingqizhen_lunzhuan` ↔ `mfr_yiweidujiang_feidu` | 8750 | 改开至 0 | 同第 5 行；一次改线同时消除两对 |
| 17 | `mfr_zhengliangyi_zhengqi` ↔ `mfr_dagouzhen_shouwang` | 8333 | 改开至 0 | 冲脉气冲、带脉维道／带脉、督脉至阳、手厥阴天池／曲泽／内关、手太阳腕骨 ⇒ 冲脉腹通谷、带脉五枢、阴维期门、足厥阴太冲、手太阴太渊、足少阳阳陵泉、手少阳外关、手太阳阳谷 |
| 18 | `mfr_wudangjiuyang_yanghe` ↔ `mfr_daqiqiang_chongying` | 8333 | 改开至 0 | 同第 13 行；一次改线同时消除三对 |
| 19 | `mfr_shenghuoling_wuding` ↔ `mfr_duanzhenqiang_pozhen` | 8333 | 改开至 0 | 同第 7 行；一次改线同时消除两对 |
| 20 | `mfr_emeixinfa_tiaoxi` ↔ `mfr_zhenqijian_qihui` | 8333 | 改开至 1666 | 阴维府舍、足厥阴蠡沟／中封、足少阳阳白 ⇒ 冲脉四满、带脉章门、阳维肩井、督脉身柱；阴跷睛明、任脉关元保留并移位 |
| 21 | `mfr_fanliangyi_nizhuan` ↔ `mfr_liumai_shaoze` | 8333 | 改开至 0 | 任脉气海／关元／中脘／膻中、手厥阴内关、手太阳腕骨 ⇒ 冲脉石关、带脉带脉、阴维腹哀、足厥阴太冲、手少阳中渚／阳池 |
| 22 | `mfr_fanliangyi_nizhuan` ↔ `mfr_xianglong18_zhenjing` | 8333 | 改开至 0 | 同第 21 行；一次改线同时消除两对 |
| 23 | `mfr_xuanming_rusi` ↔ `mfr_nizhuanjingmai_daozhuan` | 8333 | 改开至 1666 | 手太阴云门／尺泽／太渊／少商、任脉气海／关元／中脘 ⇒ 阴跷照海、阴维筑宾、足少阴大钟、足太阴阴陵泉、足厥阴中都、手少阴阴郄、手太阴侠白 |
| 24 | `mfr_jiuyang_liaoshang` ↔ `mfr_yijinduangupian_tuotai` | 8000 | 改开至 2000 | 足太阳委中、手太阳腕骨、足少阴然谷、手厥阴内关、督脉至阳／神道 ⇒ 足太阳肾俞、督脉腰阳关／身柱／百会、任脉水分／膻中；足三里、金门、神门、关元重排 |
| 25 | `mfr_xuanming_rusi` ↔ `mfr_jiuyinshenzhao_wujian` | 8000 | 改开至 1000 | 同第 23 行；一次改线同时消除两对 |

所有改后值均低于 8000；10000 bp 的 7 对全部改开，没有以“同属阴／阳／调和”作为理由。

### 7.2 `--delivery` 命中数（改前 / 改后）

| 规则 | 改前 | 改后 | 处理说明 |
|---|---:|---:|---|
| 拳／擒拿：全路线缺合法穴位 | 5 | 0 | 阴风刀、无定、阴阳吞吐、七劲齐发、生死搏补曲池／手三里／合谷 |
| 拳／擒拿：合法穴位不在末 1–3 段 | 1 | 0 | 折兵把曲池／手三里／合谷收至末三段 |
| 位移：缺足少阳／带脉／阳跷或涌泉 | 0 | 0 | 无新增命中 |
| 护体／蓄气：缺任督 | 0 | 0 | NR3 改过的护体／疗伤路线继续保留任督 |
| 非绝招外放：端点非法 | 0（路线 0） | 0（路线 0） | 本册没有非绝招外放路线 |
| 性质冲突（只报告） | 4 | 4 | 按任务要求不改；完整清单见 §4 |
| 合计（绝招动作规则） | 缺失 5、位置 1 | 缺失 0、位置 0 | 路线仍为 42，已分类 38，规则检查 41，未分类 4 |

### 7.3 改过的路线清单

| 路线 | 原因 | 段数 | 路线 CT | 风险数组 / 总风险 | 收招合计 |
|---|---|---:|---:|---|---:|
| `mfr_babishenjian_qichu` | NR3 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360，不变 | 1920 |
| `mfr_dajiutianshou_lieyang` | NR3 | 8 | 600 | `[100,110,120,130,140,150,160,170]` / 1080，不变 | 1800 |
| `mfr_emeijiuyang_chaoyang` | NR3 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360，不变 | 1920 |
| `mfr_emeixinfa_tiaoxi` | NR3 | 6 | 600 | `[100,120,140,160,180,200]` / 900，不变 | 1800 |
| `mfr_fanliangyi_nizhuan` | NR3 | 6 | 540 | `[100,110,120,130,140,150]` / 750，不变 | 1740 |
| `mfr_fanliangyi_sixiang` | NR3 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360，不变 | 1920 |
| `mfr_jiuyang_huti` | NR3 | 8 | 600 | `[80,90,100,120,100,120,100,110]` / 820，不变 | 1800 |
| `mfr_jiuyang_liaoshang` | NR3 | 10 | 750 | `[100,110,120,130,140,150,160,170,180,190]` / 1450，不变 | 1950 |
| `mfr_qiankun_diandao` | NR3 | 10 | 750 | `[120,130,140,120,120,150,140,150,160,170]` / 1400，不变 | 1950 |
| `mfr_qishangquan_tuntu` | NR3＋末端 | 8 | 600 | `[100,110,120,130,110,120,140,150]` / 980，不变 | 1800 |
| `mfr_qishangquan_qifa` | 末端 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360，不变 | 1920 |
| `mfr_shenghuoling_wuding` | NR3＋末端 | 10 | 800 | `[100,120,140,160,180,200,220,240,260,280]` / 1900，不变 | 2000 |
| `mfr_shenghuoling_yinfengdao` | 末端 | 10 | 750 | `[120,130,140,150,120,120,140,150,160,170]` / 1400，不变 | 1950 |
| `mfr_wudangjiuyang_yanghe` | NR3 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360，不变 | 1920 |
| `mfr_wuxingqizhen_lunzhuan` | NR3 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360，不变 | 1920 |
| `mfr_xuanming_rusi` | NR3 | 10 | 750 | `[120,130,140,150,120,120,140,150,160,170]` / 1400，不变 | 1950 |
| `mfr_yingsheshengsibo_shengsi` | 末端 | 6 | 600 | `[100,120,140,160,180,200]` / 900，不变 | 1800 |
| `mfr_yingzhaoqinna_zhebing` | NR3＋末端 | 8 | 600 | `[100,110,120,130,110,120,140,150]` / 980，不变 | 1800 |
| `mfr_zhengliangyi_zhengqi` | NR3 | 8 | 600 | `[100,110,120,130,110,120,140,150]` / 980，不变 | 1800 |

共 19 条：16 条参与本任务名下配对，3 条仅修动作末端。所有路线的 `purpose`、招式出招方式与模板代号“见文首索引”均保持；文首索引是唯一步骤来源，§10.3／§10.4 镜像继续引用该索引并保留核算值。

### 7.4 指定门禁

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；扫描 111 文件、63,119 次出现、13,906 个定义；仅仓库基线已知 `docs/README.md` 的 `sk_babuganchan`，严格新增失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 / 145，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 / 47，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ all checks passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ all checks passed |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-yitian.md` | ✅ errors 0；42 路线、42 序列；本册内完全重复与高相似均为 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-yitian.md` | ✅ 动作规则缺失 0、末端位置 0、非绝招外放违规 0；⚠️ 性质冲突 4 按任务要求暂缓 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-yitian.md` | ✅ 指定图鉴中与其他武学完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-yitian.md` | ✅ 未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py yitian` | ✅ 名下 25 对：改开 25、理由 0、未处理 0；本任务新造高相似配对 0 |
| `git diff --check` | ✅ 通过 |

### 7.5 验收标准逐项核对

- ✅ 25 对逐一复算并全部改开；没有留下需要理由的名下配对，10000 bp 的 7 对全部消除。
- ✅ 每条 NR3 路线至少替换 `floor(0.2L)+1` 个穴位；未缩短路线，未改变逐段 CT、风险数组、`purpose` 或出招方式。
- ✅ 本册 9 门多绝招武学的 11 个路线对逐对检查：共享均不超过较短路线 50%，且不是轮换、逆序或逆序轮换。
- ✅ 外放路线仍落合法端点；动作末端、位移核心、内功防守任督及非绝招外放检查均无违规。
- ✅ 没有新建 ID；所有新增引用已定义，版本行已追加“路线叙事第三轮（2026-09-29）”。
- ✅ 已同步文首路线步骤与 §10.3／§10.4 镜像；段数、路线 CT、风险、收招合计与改前一致。
- ✅ `design/05` 已支持 `voice`，但本册没有音功候选，因此按字段语义无需补标。
- ⚠️ 4 条性质冲突严格依任务要求只报告、不修正，等待 §2.4 读法裁定；清单完整列于 §4。
- ✅ 只修改允许的 `skills-yitian.md` 和本报告；未执行改变仓库状态的 Git 命令，未删除既有待决项。
- ✅ 已为鹰蛇生死搏补“末段回气”说明，明确龈交 → 气海是曲池擒拿发力后的回气段。

### 7.6 交其他任务的条目

- ✅ 本任务名下 25 对均已从本册侧改开，不再要求清单中的“另一侧”追加调整。
- ⚠️ NR3-kangxi：调整 `mfr_weixinliandao_lianying` ↔ 本册 `mfr_fenshuiemeici_jingfan`（当前 8750 bp）。
- ⚠️ NR3-qianlong：调整 `mfr_baxianjian_guohai` ↔ 本册 `mfr_jindingjiushi_wanliu`（当前 8333 bp）。
- ⚠️ NR3-xiake-bixue：调整 `mfr_taixuan_guiyi` ↔ 本册 `mfr_xuanming_qichu`（当前 9000 bp）。
- ⚠️ 性质统一任务：作者／协调者裁定 §2.4 后处理 `mfr_jiuyang_puzhao`、`mfr_duyanfeisha_fengjiang`、`mfr_xunleijianfa_shiliu`、`mfr_yingsheshengsibo_shengsi`；不得在裁定前各册自行改路。
