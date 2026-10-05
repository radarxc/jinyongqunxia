# NR3-general 报告 · 路线叙事第三轮 · 通行（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

按 `design/21` §4.3.1、§4.3.4 与 Canon V17-06，改写通行册 11 条绝招路线，把本单元 23 对高相似配对全部降至 `overlapBp<8000`；最高余值为 3333 bp，未使用传承理由豁免。
11 条路线按集合替换 74 个穴位；逐位置比较，78 个位置中有 77 个变化。路线 ID、出招方式、purpose、段数、逐段 CT、风险列与收招均不变；通行册 38 条绝招路线现为 38 个不同序列，册内 ≥80% 配对为 0。
修复开门劈挂拳的拳／擒拿末端缺口，并为穿云啸三式补 `voice:true`；`--delivery` 的末端、位移、任督与外放违规由 1 降为 0。
性质判定的 7 条冲突依任务要求保留；作者已将阴阳理论修订为按体段判定、末端出口不计，后续由 NYY 落地；全部指定门禁通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要章节 / 改动 |
|---|---:|---|
| `docs/design/catalog/skills-general.md` | 1665 | 文首绝招显式路线索引；§8.8 穿云啸；§10.3 AR-16 审计；§11.6.4a 路线说明；§13 校验与测试 |
| `tools/agents/reports/NR3-general.md` | 208 | 23 对处理证据、delivery 前后统计、改路清单、门禁与交接 |

图鉴差异为 47 insertions / 26 deletions，净增 21 行；没有新建游戏内容 ID。

## 3. 关键结论与数值

- 分配配对为 `8×10000 + 7×8750 + 8×8333 = 23` 对；处理结果为改开 23、写理由 0、未处理 0。最终最大重合为 `mfr_baicaobiandu_xiangke ↔ mfr_yunvxinjing_bingxin` 的 3333 bp，故 23 对均满足 `<8000`。
- 路线长度仅有 8 段与 6 段，对应最低替换数均为 `floor(0.2×L)+1=2`；实际每条按集合替换 5～8 个穴位，共 74 个穴位，均高于下限；逐位置比较，78 个位置中有 77 个变化。
- 6 条地阶路线保持 8 段；其中 `mfr_pojunqiangfa_xianzhen` 为 `ΣCT=708`、总风险 1170，其余五条为 `ΣCT=720`、总风险 1360。五条玄上路线保持 6 段、`ΣCT=600`、总风险 900。
- 所有改路招式的收招均保持 1200 CT，故总耗时分别为 1908、1920 或 1800 CT，均满足 `recovery+flowCt≤2000 CT`；逐段 CT 与风险数组没有改动。
- 带本册路径运行的册内严格多样性结果为 38 routes / 38 distinct sequences / 0 exact pairs / 0 pairs ≥80%；`check_nr3_unit.py general` 另确认本单元名下 23 对全部改开且未新造任何全仓 ≥80% 配对。全仓多样性检查另有 19 对跨册 ≥80% 配对涉及本册路线，均不在本单元名下，交由所属 NR3 单元处理。
- `mv_chuanyunxiao_chuanyun`、`mv_chuanyunxiao_duanhe`、`mv_chuanyunxiao_huisheng` 已补 `voice:true`；持乐器的 `mv_qixianyin_luanxian` 保持默认 false。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 / 当前处置 |
|---|---|---|
| `NR3G-O01` | 已解决：作者已修订阴阳理论，路线性质按体段判定、末端出口不计 | 本轮仍不因性质改路、不加 `allowOpposedNature`；保留 §7.2 的 7 条旧口径命中，交后续 NYY 落地 |
| `NR3G-O02` | delivery 中 15 条未分类绝招是否需要补动作类型 | 没有可靠动作事实时不硬套；默认保留未分类，后续只在正文或原著能明确出招方式时结构化 |
| `NR3G-O03` | `mfr_baicaobiandu_xiangke`（友方避毒支援）与 `mfr_suogugong_tuofu`（驱散束缚）改路后不再含任督；两条旧路线原本各有两处任脉穴。lint 未将二者分类为护体或疗伤，请作者确认“相克”是否属于疗伤或护体类 | 默认维持现状；若属于，应补回一处任脉穴并复算相似度 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无新增提案 | Canon V17-06 与 `design/21` §4.3.1、§4.3.4 已足以完成路线整改；§2.4 读法歧义沿用既有待决项 `NAu-nxt-O06`，不重复立项 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `docs/design/21-meridian-flow-and-moves.md` §2.4 与后续 NYY | 落地作者修订：路线性质按体段判定、末端出口不计，并据此处理 §7.2 的 7 条旧口径命中 |
| `tools/lint/check_skill_catalogs.py` 与后续性质整改任务 | 按修订后的体段口径更新检查，再决定是否把只报告检查升级为硬门；本任务未抢先改路线 |
| 23 条配对的“另一侧”图鉴 | 无需因本清单继续调整：本侧改写已把每对降至 8000 bp 以下；若另一任务独立改路，仍须重跑全仓新增配对检查 |
| `mfr_baizhanxinfa_junhun` ↔ `mfr_yijinduangupian_tuotai`（wujue） | 跨册 ≥80% 配对由所属单元改开或写理由 |
| `mfr_shouchengzhen_bushi` ↔ `mfr_bajiquan_beng`（qianlong） | 同上 |
| `mfr_qimenbuzhen_bamen` ↔ `mfr_jifengqishu_chitu`（gulong） | 同上 |
| `mfr_duanzhenqiang_pozhen` ↔ `mfr_dugu9_wuzhao`（wuyue） | 同上 |
| `mfr_yuenvjian_wuhen` ↔ `mfr_jiashafumogong_fumo`（shaolin） | 同上 |
| `mfr_huweiyingqiang_bafang` ↔ `mfr_shenlongxinfa_zuozhen`（kangxi） | 同上 |
| `mfr_huweiyingqiang_bafang` ↔ `mfr_hujiadao_fengxue`（qianlong） | 同上 |
| `mfr_tongbeijian_jianzou` ↔ `mfr_huibuqijian_huifeng`（qianlong） | 同上 |
| `mfr_hunyuanfangzhuang_kaiyun` ↔ `mfr_wulundazhuan_tielun`（xiaoyao） | 同上 |
| `mfr_qihuangmifa_qichenke` ↔ `mfr_tianshanyingyang_tianji`（qianlong） | 同上 |
| `mfr_qimenbuzhen_bamen` ↔ `mfr_emeijiuyang_chaoyang`（yitian） | 同上 |
| `mfr_qimenbuzhen_bamen` ↔ `mfr_babishenjian_qichu`（yitian） | 同上 |
| `mfr_huanyirongshu_huanxing` ↔ `mfr_shenlongxinfa_wanshou`（kangxi） | 同上 |
| `mfr_qihuangmifa_qichenke` ↔ `mfr_linyulongdao_zhengxian`（kangxi） | 同上 |
| `mfr_duanzhenqiang_pozhen` ↔ `mfr_shenshuineigong_zhongchao`（gulong） | 同上 |
| `mfr_duanzhenqiang_pozhen` ↔ `mfr_shenzhao_xumai`（kangxi） | 同上 |
| `mfr_duanzhenqiang_pozhen` ↔ `mfr_baihuacuo_cuoluo`（qianlong） | 同上 |
| `mfr_duanzhenqiang_pozhen` ↔ `mfr_shenghuoling_wuding`（yitian） | 同上 |
| `mfr_zhenqijian_qihui` ↔ `mfr_emeixinfa_tiaoxi`（yitian） | 同上 |
| `docs/README.md` 的 `sk_babuganchan` 引用 | `check_ids.py --strict` 仍报告 1 个已知基线未定义 ID；本任务未越权修改，且新增严格失败为 0 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

下表“改动穴位”均指本单元路线；箭头左侧为移除，右侧为加入。相同本侧路线复用于多对时，后续行引用首次列出的同一改动。

| # | 配对（本侧 ↔ 另一侧） | 改前 bp | 处理方式 / 改后 bp | 改动穴位 |
|---:|---|---:|---:|---|
| 1 | `mfr_baicaobiandu_xiangke` ↔ `mfr_yunvxinjing_bingxin` | 10000 | 改开 / 3333 | 水泉、公孙、膻中、水分、灵道 → 太白、中都、阴谷、交信、大横；保留内关 |
| 2 | `mfr_yanmengqishe_yanluo` ↔ `mfr_hanyuxinjue_hanqi` | 10000 | 改开 / 0 | 鱼际、三阴交、天突、行间、然谷、大都、阴陵泉、神阙 → 血海、阴廉、阴谷、大横、照海、尺泽、翳风、合谷 |
| 3 | `mfr_yanzisanchaoshui_sanchao` ↔ `mfr_hujiadao_humiaohuzhao` | 10000 | 改开 / 1250 | 承泣、天枢、神道、关冲、支沟、腕骨、曲池、跗阳 → 涌泉、太溪、章门、京门、外丘、承山、仆参、申脉 |
| 4 | `mfr_suogugong_tuofu` ↔ `mfr_huzhaojuehushou_juehu` | 10000 | 改开 / 0 | 太溪、商丘、关元、阴交、曲泽、青灵 → 水泉、公孙、交信、大横、间使、阴郄 |
| 5 | `mfr_suogugong_tuofu` ↔ `mfr_jinlingsuo_shepo` | 10000 | 改开 / 0 | 同 #4 |
| 6 | `mfr_pojunqiangfa_xianzhen` ↔ `mfr_tianlongchanbu_tuili` | 10000 | 改开 / 0 | 足临泣、维道、带脉、涌泉、太溪、委中、命门、阳池 → 长强、足三里、风市、五枢、申脉、承山、外关、阳谷 |
| 7 | `mfr_suogugong_tuofu` ↔ `mfr_shenzhao_xumai` | 10000 | 改开 / 0 | 同 #4 |
| 8 | `mfr_yanmengqishe_yanluo` ↔ `mfr_yihun_yihun` | 10000 | 改开 / 0 | 同 #2 |
| 9 | `mfr_pojunqiangfa_cuifeng` ↔ `mfr_anran_xiaohun` | 8750 | 改开 / 0 | 灵墟、大包、隐白、曲骨、大陵、郄门、少海 → 阴谷、血海、气海、天泉、间使、阴郄、外关；保留阳池 |
| 10 | `mfr_baidubianzheng_guizheng` ↔ `mfr_longxiang_banruo` | 8750 | 改开 / 1250 | 大陵、郄门、少海、太渊、睛明、府舍 → 太白、交信、大横、间使、内关、少商；保留曲泉、大钟 |
| 11 | `mfr_baidubianzheng_guizheng` ↔ `mfr_tongguijian_tonggui` | 8750 | 改开 / 2500 | 同 #10 |
| 12 | `mfr_pojunqiangfa_xianzhen` ↔ `mfr_gumuqinggong_youshen` | 8750 | 改开 / 0 | 同 #6 |
| 13 | `mfr_pojunqiangfa_xianzhen` ↔ `mfr_lingbo_jiangfei` | 8750 | 改开 / 0 | 同 #6 |
| 14 | `mfr_pojunqiangfa_cuifeng` ↔ `mfr_zhemei_xunmei` | 8750 | 改开 / 0 | 同 #9 |
| 15 | `mfr_yanzisanchaoshui_sanchao` ↔ `mfr_qinlonggong_shuaizhi` | 8750 | 改开 / 0 | 同 #3 |
| 16 | `mfr_jiebiaodaofa_fenglu` ↔ `mfr_bahuang_duzun` | 8333 | 改开 / 0 | 列缺、廉泉、太冲、复溜、涌泉、腕骨 → 太白、中都、阴谷、大横、间使、阳谷 |
| 17 | `mfr_baicaobiandu_xiangke` ↔ `mfr_tiebushan_gangqi` | 8333 | 改开 / 1666 | 同 #1 |
| 18 | `mfr_kaimenpiguaquan_kaihe` ↔ `mfr_baichousuofa_juanwan` | 8333 | 改开 / 0 | 输府、地机、承浆、石门、劳宫、极泉、通里、侠白 → 水泉、血海、中都、腹哀、天泉、尺泽、曲池、合谷 |
| 19 | `mfr_tantui_tongxing_chuaimen` ↔ `mfr_bixuegong_suoyuan` | 8333 | 改开 / 0 | 期门、膝关、灵墟、大包、隐白、厉兑 → 腹哀、中都、阴谷、血海、照海、足窍阴 |
| 20 | `mfr_feibairujian_cangfeng` ↔ `mfr_jingangnianzhu_huixuan` | 8333 | 改开 / 0 | 商曲、京门、脊中、腰阳关、会阴、中极 → 肓俞、五枢、至阳、中脘、内关、外关 |
| 21 | `mfr_yanmengqishe_yanluo` ↔ `mfr_fumosuofa_huanyuan` | 8333 | 改开 / 0 | 同 #2 |
| 22 | `mfr_jiebiaodaofa_fenglu` ↔ `mfr_xiantiangong_wuqi` | 8333 | 改开 / 0 | 同 #16 |
| 23 | `mfr_tantui_tongxing_chuaimen` ↔ `mfr_zhemei_xunmei` | 8333 | 改开 / 0 | 同 #19 |

逐对计算使用 `overlapBp=floor(10000×|A∩B|/min(|A|,|B|))`。✅ `check_nr3_unit.py general` 复算结果：名下 23 对，已改开 23、理由 0、未处理 0、新造 ≥80% 配对 0。

### 7.2 `--delivery` 命中数（改前 / 改后）

| 规则 | 改前 | 改后 | 处置 |
|---|---:|---:|---|
| 掌法末端 | 0 | 0 | 无命中 |
| 拳／擒拿端点缺失 | 1 | 0 | `mfr_kaimenpiguaquan_kaihe` 末 2 段改为曲池→合谷 |
| 动作端点存在但不在末 3 段 | 0 | 0 | 无命中 |
| 位移步法核心脉／涌泉缺失 | 0 | 0 | 两条改写位移路线继续含带脉／足少阳／阳跷或涌泉 |
| 护体／疗伤 defense 缺任督 | 0 | 0 | 无命中 |
| 攻击内功缺任督 | 0 | 0 | 无命中 |
| 非绝招外放端点违规 | 0 | 0 | 穿云啸三条普通外放路线均保持合法人声端点 |
| 绝招外放端点违规 | 0 | 0 | 持琴“乱弦”保持合法手／腕端点 |
| 性质冲突 | 7 | 7 | 按任务要求只列清单，不修改 |

最终汇总为 38 routes / 23 classified / 26 checked rules / 0 violations / 0 tail violations / 15 unclassified；普通外放 3 routes / 0 violations；性质冲突 7。

性质冲突清单（计票读法）：

- `mfr_pojunqiangfa_cuifeng`：路线阴，武学阳。
- `mfr_yanmengqishe_yanluo`：路线阴，武学阳。
- `mfr_kaimenpiguaquan_kaihe`：路线阴，武学阳。
- `mfr_tianwangbuxin_sanzhen`：路线阳，武学阴。
- `mfr_duanzhenqiang_pozhen`：路线阴，武学阳。
- `mfr_jiebiaodaofa_fenglu`：路线阴，武学阳。
- `mfr_tantui_tongxing_chuaimen`：路线阴，武学阳。

### 7.3 改过的路线清单

| 路线 | 替换位置 | 段数 | 路线 CT | 风险列 / 总风险 | CT / 风险变化 |
|---|---:|---:|---:|---|---|
| `mfr_pojunqiangfa_xianzhen` | 8 / 8 | 8 | 708 | `[100,120,160,220,180,150,130,110]` / 1170 | 无 / 无 |
| `mfr_pojunqiangfa_cuifeng` | 7 / 8 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 无 / 无 |
| `mfr_yanmengqishe_yanluo` | 8 / 8 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 无 / 无 |
| `mfr_kaimenpiguaquan_kaihe` | 8 / 8 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 无 / 无 |
| `mfr_yanzisanchaoshui_sanchao` | 8 / 8 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 无 / 无 |
| `mfr_baidubianzheng_guizheng` | 6 / 8 | 8 | 720 | `[100,120,140,160,180,200,220,240]` / 1360 | 无 / 无 |
| `mfr_jiebiaodaofa_fenglu` | 6 / 6 | 6 | 600 | `[100,120,140,160,180,200]` / 900 | 无 / 无 |
| `mfr_tantui_tongxing_chuaimen` | 6 / 6 | 6 | 600 | `[100,120,140,160,180,200]` / 900 | 无 / 无 |
| `mfr_baicaobiandu_xiangke` | 5 / 6 | 6 | 600 | `[100,120,140,160,180,200]` / 900 | 无 / 无 |
| `mfr_feibairujian_cangfeng` | 6 / 6 | 6 | 600 | `[100,120,140,160,180,200]` / 900 | 无 / 无 |
| `mfr_suogugong_tuofu` | 6 / 6 | 6 | 600 | `[100,120,140,160,180,200]` / 900 | 无 / 无 |

✅ 每条路线均未缩短、未改变出招方式或 purpose；步骤数与 CT／风险列长度一致，单段 CT 78～100，风险 100～240。

✅ 动作末端：枪、弓、刀、笔分别落腕／持械导引端点；拳落曲池／合谷；腿落足少阳足窍阴；位移路线含带脉、足少阳、阳跷或涌泉。

✅ 同门互异：破军枪法两条改写绝招路线仅共享外关，集合重合为 `1/8=12.5%≤50%`，且不是轮换或逆序；其余改路武学仅一条绝招受本轮影响。

### 7.4 镜像、人声与文档完整性

- ✅ 文首索引是 11 条路线的唯一步骤定义；§11.6.2～§11.6.5 继续使用“显式（见本册绝招显式路线索引）”，§11.6.4a 同步段数、路线 CT、收招合计、风险数组、总风险与动作叙事。
- ✅ 版本行已追加“路线叙事第三轮（2026-09-29）”；新增 `GEN-V23`、`GEN-T23` 与人工审阅项 10。
- ✅ 穿云啸三式的正文 `MoveDef`、AR-16 审计表、`GEN-V22`、`GEN-T22` 和人工审阅项均同步 `voice:true`；持琴乱弦明确保持默认 false。
- ✅ 没有新增 `sk_*`、`mv_*`、`mfr_*` 或 `ap_*`；所有替换穴位均复用已有 ID。
- ✅ 没有删除既有待决事项；正文与报告均无未完成占位语。

### 7.5 门禁结果

| 命令 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 退出 0；111 文件、63,130 次出现、13,906 个定义；仅既知基线 `sk_babuganchan` 未定义，新失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 / 145 通过 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 / 47 通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-general.md` | ✅ errors 0；带本册路径的册内结果为 38 routes / 38 distinct / 0 exact / 0 ≥80% |
| `python3 tools/lint/check_skill_catalogs.py --diversity` | ✅ 退出 0；全仓结果中 general 为 38 routes / 38 distinct / 0 exact；另有 19 对跨册 ≥80% 配对涉及本册路线，均不在本单元名下 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-general.md` | ✅ 动作末端违规 0、普通外放违规 0；性质冲突 7 按要求只报告 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-general.md` | ✅ 与其他武学完全相同的绝招路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-general.md` | ✅ 指定文件未定义引用 0 |
| `python3 tools/agents/check_nr3_unit.py general` | ✅ 23 对全改开；未处理 0；新造 ≥80% 配对 0 |
| `git diff --check` | ✅ 通过 |

### 7.6 交其他任务的条目

- ✅ 23 个“另一侧”均无需为本单元配对再改：本侧处理已把每对降至阈值以下；本任务没有越权修改它们。
- ⚠️ 全仓另有下列 19 对跨册 ≥80% 配对涉及本册路线，但均不在本单元名下；须由括号内所属单元改开或按 `design/21` §4.3.4 写理由：
  - `mfr_baizhanxinfa_junhun` ↔ `mfr_yijinduangupian_tuotai`（wujue）
  - `mfr_shouchengzhen_bushi` ↔ `mfr_bajiquan_beng`（qianlong）
  - `mfr_qimenbuzhen_bamen` ↔ `mfr_jifengqishu_chitu`（gulong）
  - `mfr_duanzhenqiang_pozhen` ↔ `mfr_dugu9_wuzhao`（wuyue）
  - `mfr_yuenvjian_wuhen` ↔ `mfr_jiashafumogong_fumo`（shaolin）
  - `mfr_huweiyingqiang_bafang` ↔ `mfr_shenlongxinfa_zuozhen`（kangxi）
  - `mfr_huweiyingqiang_bafang` ↔ `mfr_hujiadao_fengxue`（qianlong）
  - `mfr_tongbeijian_jianzou` ↔ `mfr_huibuqijian_huifeng`（qianlong）
  - `mfr_hunyuanfangzhuang_kaiyun` ↔ `mfr_wulundazhuan_tielun`（xiaoyao）
  - `mfr_qihuangmifa_qichenke` ↔ `mfr_tianshanyingyang_tianji`（qianlong）
  - `mfr_qimenbuzhen_bamen` ↔ `mfr_emeijiuyang_chaoyang`（yitian）
  - `mfr_qimenbuzhen_bamen` ↔ `mfr_babishenjian_qichu`（yitian）
  - `mfr_huanyirongshu_huanxing` ↔ `mfr_shenlongxinfa_wanshou`（kangxi）
  - `mfr_qihuangmifa_qichenke` ↔ `mfr_linyulongdao_zhengxian`（kangxi）
  - `mfr_duanzhenqiang_pozhen` ↔ `mfr_shenshuineigong_zhongchao`（gulong）
  - `mfr_duanzhenqiang_pozhen` ↔ `mfr_shenzhao_xumai`（kangxi）
  - `mfr_duanzhenqiang_pozhen` ↔ `mfr_baihuacuo_cuoluo`（qianlong）
  - `mfr_duanzhenqiang_pozhen` ↔ `mfr_shenghuoling_wuding`（yitian）
  - `mfr_zhenqijian_qihui` ↔ `mfr_emeixinfa_tiaoxi`（yitian）
- ⚠️ 撞车风险：本单元有 8 条新路线集中取用太白、中都、阴谷、大横、交信、间使、血海等穴。册内最高 6666 bp，例如 `mfr_jiebiaodaofa_fenglu` ↔ `mfr_baicaobiandu_xiangke`。其他单元并行改路时，可能与这些路线撞出新的 ≥80% 配对；合入后须全仓重跑各单元的 `check_nr3_unit.py` 与 `--diversity`。
- ⚠️ 性质冲突：5 条阳性武学的改写路线（摧锋、雁落、开合、封路、踹门）按旧计票口径仍判为阴；按要求本轮未改性质。作者已修订阴阳理论为路线性质按体段判定、末端出口不计，由后续 NYY 落地；这 5 条之后很可能再改路，届时须重跑多样性检查。
- ⚠️ 后续全局总审校：合并并行图鉴改动后重跑 `check_nr3_unit.py` 与全仓多样性检查，防止其他任务的新路线再次与本册形成 ≥80% 配对。
- ⚠️ README 归属任务：处理既知基线 `sk_babuganchan` 未定义引用；与本任务改动无关。

### 7.7 范围纪律

- ✅ 只修改 `docs/design/catalog/skills-general.md` 与本报告；未修改 Canon、任务清单、脚本或其他图鉴。
- ✅ 未执行 commit、push、checkout、switch、reset、stash、rebase 或 merge。
