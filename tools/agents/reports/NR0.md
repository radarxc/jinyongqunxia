# NR0 报告 · 绝招路线的叙事规则与跨武学多样性检查（21 + lint）

## 1. 摘要（3–6 行）

- `design/21` 已升级至 v2.4，把 AR-14 落成“动作末端 → 明示内功 / 门派底子 → 性质 → 战术职责”的可执行配路规则。
- 新增跨武学多样性检查：完全相同的有序穴位序列为严格失败；穴位集合相对较短路线重合 ≥80% 为需叙事理由的警告；既有 `--strict` 语义不变。
- 当前有效口径为 530 条绝招路线、297 种有序序列、98 个完全相同序列组；≥80% 跨武学对共 3377 对，其中完全相同 1200 对、非完全相同警告 2177 对。
- 本任务未改 11 册图鉴；NR1 / NR2 应从 33 门共用的最大组开始拆路，并持续保住既有硬约束、同门互异和外放端点。

## 2. 产出（文件、行数、主要章节）

| 文件 | 最终行数 | 产出 |
|---|---:|---|
| `docs/design/21-meridian-flow-and-moves.md` | 2240 | v2.4 变更记录；§4.3.1–§4.3.4 三层映射、职责与多样性规则；§5.3 配表流程；§16–§18 校验、提案与下游契约 |
| `tools/lint/check_skill_catalogs.py` | 1850 | 路线采集、五绝跨文档例外、全局配对 / 分册汇总、`--diversity` 与 `--diversity-strict` |
| `tools/lint/test_check_skill_catalogs.py` | 755 | 精确重复、80% 边界、短路线分母、同武学排除、逆序、CLI 退出码与五绝外部路线测试 |
| `tools/lint/README.md` | 276 | 新开关、统计口径、退出语义、JSON 与 `--details` 说明 |
| `tools/agents/reports/NR0.md` | 258 | 本报告；含 11 册统计及全部 98 个完全相同序列组 |

## 3. 关键结论与数值

1. **叙事优先于模板**：动作决定末端，已有 `inner.meridians` 高于门派默认，门派默认高于性质回退；职责再决定起点、换脉与路线长度。所有映射均为**（原创扩展）**，穴位只取 `design/15` 登记项。
2. **精确重复口径**：不同 `skill_id` 的 `tuple(acupointRef)` 完全相同；CT、风险、路线 ID、性质或用途不同均不能豁免。同穴逆序 / 重排不是精确重复，但属于 10000 bp 高重合警告。
3. **高重合口径**：`overlapBp=floor(10000×|set(A)∩set(B)|/min(|set(A)|,|set(B)|))`，阈值 8000。分母取短路线才能识别“长路线完整包住短路线”；等长 `L` 要降至阈值以下至少改 `floor(0.2L)+1` 穴。
4. **物理行与有效口径**：11 册文件内共有 527 条绝招路线 / 294 种序列；另有 `sk_xianglong18` 三条路线按既有跨文档例外定义于 `design/21` §12.1，故发布有效口径为 530 / 297。原 NU5a 六册物理行 349 / 187，在有效口径下为 352 / 190。
5. **当前债务**：有效口径 98 个精确组产生 1200 个精确跨武学对；3377 个 ≥80% 对中另有 2177 个非精确警告。跨册 ≥80% 为 2288 对，其中精确 658、非精确 1630。
6. **兼容门禁**：`--diversity` 只报告；`--diversity-strict` 仅因精确组退出 1，非精确高重合仍警告；原 `--strict` 不调用多样性分析，当前仍可独立通过。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NR0-O01 | 是否允许 ≥80% 的路线长期进入机器豁免表？ | **否**；保留可见警告，在图鉴写共同传承、共享核心段必要性及动作末端 / 关键段差异，由审校决定是否仍需改路 |
| NR0-O02 | 何时把 `--diversity-strict` 接入 CI？ | NR1 / NR2 将 98 个精确组清零后启用；此前 CI 继续跑旧 `--strict`，另跑 `--diversity` 观察收敛 |
| NR0-O03 | 门派默认核心经脉是否成为永久 schema 数据？ | 暂不新增字段；只作 `design/21` **【建议值】**与人工配表规则，显式 `inner.meridians` 始终优先 |
| NR0-O04 | 同穴逆序 / 重排是否升级为严格失败？ | 暂不升级；保持 10000 bp 警告，要求叙事说明，避免与同门既有“逆序失败”口径混淆 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NR0-P01 | Canon §8 / §18 登记：不同武学绝招不得使用完全相同的有序穴位序列；穴位集合重合 ≥80% 须人工说明；叙事规则归 `design/21`，实例归各图鉴 | 让 AR-14 的“一招一段经脉运行”具备可辨识性，避免不相干武学共享相同点穴、堵塞与胀损表现 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| 11 册 `design/catalog/skills-*.md` | 最终绝招显式路线表 | NR1 / NR2 按 §4.3.1–§4.3.4 拆除精确重复并处理高重合；路线实例仍归图鉴，不搬入 21 |
| `docs/00-canon.md` | §8 / §18 | 后续基准汇总接收 NR0-P01；本任务不越权修改 |
| `docs/decisions/canon-proposals-v1.2.md` | 后续提案汇总 | 登记 NR0-P01，与既有 M4 / M6 提案一起追踪 |
| `docs/tech/04-data-schema.md` | 图鉴构建校验 | 接入跨武学完全同序列失败与 ≥80% 诊断；保留同门 ≤50%、无轮换 / 逆序及外放端点检查 |
| CI 配置 | 图鉴 lint 门禁 | 修复期间增只报告的 `--diversity`；精确重复清零后启用独立 `--diversity-strict`，不得改变旧 `--strict` |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 叙事规则摘要与三张映射表

✅ 路线按动作末端、明示内功 / 门派底子、性质、职责依次收窄；门派仅提供核心段，不能覆盖招式动作；外放同时满足动作端点与 13 穴白名单。

| 出招方式 | 终点 / 关键穴位（均见 `design/15`） |
|---|---|
| 掌 | `ap_shoujueyin_neiguan → ap_shoujueyin_laogong` |
| 指 / 点穴 | `ap_shoutaiyin_shaoshang`、`ap_shouyangming_shangyang`、`ap_shoujueyin_zhongchong`、`ap_shoushaoyin_shaochong`、`ap_shoutaiyang_shaoze`、`ap_shoushaoyang_guanchong` 中选动作对应指端 |
| 拳 / 擒拿 | `ap_shouyangming_quchi → ap_shouyangming_shousanli → ap_shouyangming_hegu` 中取相符关键段 |
| 腿 | 足三阳；端点可取 `ap_zuyangming_lidui` / `ap_zutaiyang_zhiyin` / `ap_zushaoyang_zuqiaoyin` |
| 剑 / 刀 / 持械 | 手三阳；腕 / 导引取 `ap_shoutaiyang_wangu`、`ap_shoutaiyang_yanggu`、`ap_shoushaoyang_yangchi`、`ap_shoushaoyang_waiguan`、`ap_shouyangming_hegu` |
| 轻功 / 位移 | `mer_zushaoyang`、`mer_daimai`、`mer_yangqiao`；起落可取 `ap_zushaoyin_yongquan` |
| 内功 / 护体 | `mer_renmai`、`mer_dumai`；丹田区只用 `ap_renmai_qihai` / `ap_renmai_guanyuan` |

| 性质 | 默认经脉族 |
|---|---|
| 阴 | 六阴正经 + `mer_renmai` / `mer_yinqiao` / `mer_yinwei` |
| 阳 | 六阳正经 + `mer_dumai` / `mer_yangqiao` / `mer_yangwei` |
| 调和 | `mer_chongmai` / `mer_daimai`，或阴阳正经、任督之间的成对桥接 |

| 门派 / 传承 | 核心经脉**【建议值】** |
|---|---|
| 少林 / 南少林 | `mer_dumai`、`mer_shouyangming`；护体可接 `mer_renmai` |
| 全真 | `mer_renmai`、`mer_dumai` |
| 武当 | `mer_renmai`、`mer_chongmai`；刚性护体可取 `mer_dumai`、`mer_yangwei` |
| 其他道家 | `mer_renmai`、`mer_dumai`；身法可接 `mer_daimai` / `mer_yangqiao` |
| 逍遥及旁支 | `mer_chongmai`、`mer_daimai`；身法可接 `mer_yangqiao` / `mer_yinqiao` |
| 丐帮 | `mer_dumai`、`mer_chongmai` |
| 峨眉 | `mer_renmai`、`mer_yinqiao` |
| 明教 / 波斯总教 | `mer_chongmai`、`mer_daimai`；身法可接 `mer_yangqiao` |
| 其他 / 无门派 | 不设门派默认，按性质回退 |

### 7.2 多样性检查的实现与阈值理由

✅ 检查器从 11 册最终审计行收集 `ultimate:true` 路线，并把五绝册引用、实际定义于 `design/21` §12.1 的降龙三路线纳入有效统计；只比较不同 `skill_id`。

✅ 完全相同按有序元组判断并供 `--diversity-strict` 失败；≥80% 按穴位集合 / 较短路线计算并警告。80% 代表较短路线至多只剩五分之一差异，堵塞表现已高度趋同，又为同门共享一段内功核心留出人工解释空间。

✅ `--diversity` 永不因多样性发现失败；`--diversity-strict` 的非精确高重合也不失败；`--details` 展开 2177 个非精确警告对；旧 `--strict` 由测试确认不会调用多样性分析。

### 7.3 当前按册数据（2026-09-28 工作副本）

口径：`≥80% 对` 包含精确对；`非精确警告对 = ≥80% 对 − 精确对`。册内列只比较同册的不同武学；跨册列表示该册与其他册的配对，故跨册全局求和不能直接把各册列相加（每对会在两册各出现一次）。

| 册 | 有效路线 | 不同序列 | 册内精确组 | 册内精确对 | 册内 ≥80% 对 | 册内非精确警告对 | 涉及本册的跨册精确对 | 涉及本册的跨册 ≥80% 对 | 涉及本册的跨册非精确警告对 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 道家 `daojia` | 65 | 51 | 7 | 25 | 61 | 36 | 65 | 368 | 303 |
| 通行 `general` | 38 | 37 | 1 | 1 | 10 | 9 | 31 | 193 | 162 |
| 古龙 `gulong` | 44 | 43 | 1 | 1 | 8 | 7 | 23 | 184 | 161 |
| 鹿鼎 `kangxi` | 33 | 32 | 1 | 1 | 14 | 13 | 24 | 192 | 168 |
| 乾隆 `qianlong` | 26 | 26 | 0 | 0 | 4 | 4 | 17 | 141 | 124 |
| 少林 `shaolin` | 52 | 40 | 5 | 25 | 55 | 30 | 62 | 296 | 234 |
| 五绝 `wujue` | 89 | 34 | 12 | 312 | 588 | 276 | 505 | 1247 | 742 |
| 五岳 `wuyue` | 41 | 39 | 2 | 2 | 13 | 11 | 43 | 196 | 153 |
| 侠客碧血 `xiake-bixue` | 34 | 33 | 1 | 1 | 4 | 3 | 26 | 305 | 279 |
| 逍遥 `xiaoyao` | 66 | 25 | 10 | 172 | 323 | 151 | 502 | 1159 | 657 |
| 倚天 `yitian` | 42 | 40 | 2 | 2 | 9 | 7 | 18 | 295 | 277 |
| **全局（去重）** | **530** | **297** | **98** | **1200** | **3377** | **2177** | **658** | **2288** | **1630** |

补充物理行口径：五绝册本身是 86 / 31，故 11 册文件合计 527 / 294；有效口径额外纳入降龙三路线后五绝为 89 / 34、全局为 530 / 297。

按册定位完全相同组（同一组可跨册，故会重复列入相关册）：

| 册 | 完全相同序列组（全局组号） |
|---|---|
| `daojia` | G06、G08、G09、G11、G14、G15、G17、G27、G29、G31、G33、G38、G41、G43、G48、G54、G55、G57、G71、G84、G86、G88、G95、G96 |
| `general` | G06、G12、G19、G29、G30、G35、G37、G43、G48、G51、G53、G54、G66、G68、G69、G70、G83、G85、G98 |
| `gulong` | G20、G23、G26、G35、G37、G51、G57、G61、G64、G66、G68、G71、G72、G73、G75、G81、G82、G90、G93、G95 |
| `kangxi` | G14、G15、G16、G19、G24、G31、G44、G45、G49、G62、G64、G74、G75、G77、G80、G82 |
| `qianlong` | G12、G18、G20、G21、G36、G63、G77、G84、G85、G86、G97 |
| `shaolin` | G06、G08、G09、G11、G12、G28、G31、G41、G42、G52、G55、G56、G67、G80、G83、G90、G93、G94 |
| `wujue` | G01、G02、G03、G04、G05、G07、G10、G12、G13、G19、G22、G25、G28、G33、G40、G46、G58、G59、G65、G78 |
| `wuyue` | G03、G14、G16、G18、G20、G23、G29、G30、G32、G34、G36、G42、G47、G50、G52、G59、G62、G69、G72、G79、G89、G91、G92、G96 |
| `xiake-bixue` | G15、G16、G21、G27、G30、G32、G49、G61、G63、G70、G74、G76、G79、G89、G91、G92、G97 |
| `xiaoyao` | G01、G02、G03、G04、G05、G07、G10、G13、G15、G22、G24、G25、G28、G34、G39、G46、G60、G73、G76 |
| `yitian` | G18、G21、G24、G26、G27、G32、G44、G60、G67、G81、G87、G94、G98 |

### 7.4 完全相同的序列组（全部 98 组）

下表“武学数”按不同 `skill_id` 去重；当前每条路线恰属一门不同武学，故路线数与武学数相等。路线 ID 足以供 NR1 / NR2 定位；所属册用于分批。

| 组 | 武学数 | 路线数 | 涉及册 | 路线 ID |
|---|---:|---:|---|---|
| G01 | 33 | 33 | wujue、xiaoyao | `mfr_dagouzhen_shouwang`<br>`mfr_bitaoxuangong_wanli`<br>`mfr_kurongchangong_feikufeirong`<br>`mfr_kongming_dongsong`<br>`mfr_yihun_dingxin`<br>`mfr_yijinduangupian_tuotai`<br>`mfr_wumuyishu_hanshan`<br>`mfr_shexinshu_mihun`<br>`mfr_fengyulianshou_saoxiang`<br>`mfr_zhengoubang_huilan`<br>`mfr_pojunguitoudao_huishou`<br>`mfr_gaibangchuansheng_hezhi`<br>`mfr_biluofengyan_yanbosan`<br>`mfr_qimenfushou_nawan`<br>`mfr_yushe_shidi`<br>`mfr_duanshiyangshenggong_humai`<br>`mfr_wantongshuangxi_lianhuan`<br>`mfr_jiuyinliaoshangpian_biqi`<br>`mfr_shoujinpian_suomai`<br>`mfr_biguqipian_guixi`<br>`mfr_xiaowuxiang_wuwo`<br>`mfr_douzhuan_xinghe`<br>`mfr_changbaicaogong_huichun`<br>`mfr_chuanyinsouhun_shixin`<br>`mfr_tianjianzhifa_mingjian`<br>`mfr_hanguqiyin_qiyin`<br>`mfr_baijiadao_guiyi`<br>`mfr_murongjian_zhongxing`<br>`mfr_yirongshu_huanrong`<br>`mfr_canheqigong_huanyuan`<br>`mfr_shuixiefeidao_tingxiang`<br>`mfr_ezuijian_duanjing`<br>`mfr_dongxishuangjian_hebi` |
| G02 | 22 | 22 | wujue、xiaoyao | `mfr_lingshezhangfa_chan`<br>`mfr_dafumoquan_hufa`<br>`mfr_suohouqinnashou_qinlong`<br>`mfr_xiaoyaoyou_tuanfeng`<br>`mfr_jiudaixingong_hubang`<br>`mfr_xuanfengsaoyetui_canye`<br>`mfr_shentuoxueshanzhang_fuzhong`<br>`mfr_tongshihenglian_yingqiao`<br>`mfr_duanfengzhang_zhenfeng`<br>`mfr_tiebifangshen_sheshen`<br>`mfr_yangjiaqiangfa_huima`<br>`mfr_bahuang_fanlao`<br>`mfr_jiutianjiubu_jiutian`<br>`mfr_sijijianzhen_dong`<br>`mfr_dashouyin_dashouyin`<br>`mfr_jingangxiangmochu_fumo`<br>`mfr_mizonghufashen_huti`<br>`mfr_mandaluozhen_hufa`<br>`mfr_tieyaoqiang_pozhen`<br>`mfr_jingedangkouqiang_aobing`<br>`mfr_canglangdao_xiaoyue`<br>`mfr_youshishuangqiang_tongxin` |
| G03 | 13 | 13 | wujue、wuyue、xiaoyao | `mfr_dagou_aokouduozhang`<br>`mfr_tanzhi_lianzhu`<br>`mfr_yuxiaojianfa_feishenjian`<br>`mfr_luoyingshenjianzhang_shenjian`<br>`mfr_taohuazhen_ershibaxiu`<br>`mfr_lingshequan_qianbian`<br>`mfr_zuoyouhubo_fenxin`<br>`mfr_jiuyin_sunyouyu`<br>`mfr_baibianqianhuan_baibian`<br>`mfr_xiaowuxiang_wuxiangjin`<br>`mfr_langhuanjian_lingxu`<br>`mfr_canhezhi_guiyi`<br>`mfr_yubijian_xianzong` |
| G04 | 10 | 10 | wujue、xiaoyao | `mfr_tiebogong_zhenbafang`<br>`mfr_hama_fajin`<br>`mfr_yiyangshuzhi_yunyan`<br>`mfr_duanjiajianfa_nanzhao`<br>`mfr_lihuaqiang_wudishou`<br>`mfr_zhebiejianshu_yijianshuangdiao`<br>`mfr_piaomiaojian_siji`<br>`mfr_wulundazhuan_dazhuan`<br>`mfr_yanqingzhang_yiyang`<br>`mfr_qinlonggong_fuhu` |
| G05 | 9 | 9 | wujue、xiaoyao | `mfr_lanhuafuxueshou_jiuwan`<br>`mfr_liumai_shaoze`<br>`mfr_baimangbianfa_fanjiang`<br>`mfr_baihongzhang_wandao`<br>`mfr_huagong_huajin`<br>`mfr_chousuizhang_duanhun`<br>`mfr_sanxiaoxiaoyaosan_sanxiao`<br>`mfr_beisuqingfeng_mantang`<br>`mfr_bingcanduzhang_shixin` |
| G06 | 9 | 9 | daojia、general、shaolin | `mfr_mujianyi_caomu`<br>`mfr_yitiantulonggong_haoling`<br>`mfr_yinyangdaoluan_jindao`<br>`mfr_yuenvjian_yixian`<br>`mfr_xisuijing_huanmai`<br>`mfr_qianshourulaizhang_jieyin`<br>`mfr_nianhuazhi_wuxing`<br>`mfr_wuxiangjiezhi_wuxiangjie`<br>`mfr_yiweidujiang_suibo` |
| G07 | 8 | 8 | wujue、xiaoyao | `mfr_jiuyinbaigu_guimei`<br>`mfr_cuixinzhang_wuhen`<br>`mfr_huodushanfa_ansuan`<br>`mfr_kusangbangfa_zhaohun`<br>`mfr_fushidu_shidu`<br>`mfr_huoduozhang_liaoyuan`<br>`mfr_xuehendao_xuehen`<br>`mfr_duanmaidao_wuhen` |
| G08 | 7 | 7 | daojia、shaolin | `mfr_xuantie_caomu`<br>`mfr_suxin_juan`<br>`mfr_taijiquan_yunshou`<br>`mfr_taijijian_jianquan`<br>`mfr_yijinjing_weituo`<br>`mfr_jingangbuhuai_hanshan`<br>`mfr_shizihou_juyin` |
| G09 | 6 | 6 | daojia、shaolin | `mfr_anran_daimu`<br>`mfr_xuantie_daqiao`<br>`mfr_suxin_huaqian`<br>`mfr_taijiquan_shizi`<br>`mfr_taijijian_zhanjian`<br>`mfr_yijinjing_huangu` |
| G10 | 6 | 6 | wujue、xiaoyao | `mfr_dagou_tianxiawugou`<br>`mfr_tanzhi_tianhua`<br>`mfr_bihai_chaosheng`<br>`mfr_liumai_liumaiqifa`<br>`mfr_zuoyouhubo_quanli`<br>`mfr_zhemei_liuchu` |
| G11 | 6 | 6 | daojia、shaolin | `mfr_zhenwuqijie_guishe`<br>`mfr_weituochu_dachu`<br>`mfr_xumishanzhang_jiezi`<br>`mfr_longzhaoshou_daoxu`<br>`mfr_ranmudaofa_liaoyuan`<br>`mfr_jingangfumoquan_chanxin` |
| G12 | 5 | 5 | general、qianlong、shaolin、wujue | `mfr_shouchengzhen_bushi`<br>`mfr_baguadao_bamen`<br>`mfr_nianhuazhi_jiaye`<br>`mfr_wuxiangjiezhi_jiejin`<br>`mfr_jiuyinbaigu_suoming` |
| G13 | 5 | 5 | wujue、xiaoyao | `mfr_yiyangzhi_qianyang`<br>`mfr_tiezhang_qingtian`<br>`mfr_liuyangzhang_liuyang`<br>`mfr_huoyandao_fentian`<br>`mfr_longxiang_shilong` |
| G14 | 4 | 4 | daojia、kangxi、wuyue | `mfr_jinguanyusuo_zhoutian`<br>`mfr_rouyunjian_wanli`<br>`mfr_yingxiongsanzhao_diqing`<br>`mfr_wuxianbaidugong_wangu` |
| G15 | 4 | 4 | daojia、kangxi、xiake-bixue、xiaoyao | `mfr_mujianyi_wanwu`<br>`mfr_hasakeqishe_sanshi`<br>`mfr_hunyuangong_yiqi`<br>`mfr_wulundazhuan_tielun` |
| G16 | 4 | 4 | kangxi、wuyue、xiake-bixue | `mfr_wangwuposhi_kaishan`<br>`mfr_fantianzhang_fudi`<br>`mfr_xieweibian_baizu`<br>`mfr_shangqingjianfa07_yunkai` |
| G17 | 3 | 3 | daojia | `mfr_gumuqinggong_fenying`<br>`mfr_chunyangwuji_zhenhuo`<br>`mfr_tiyunzong_fuyao` |
| G18 | 3 | 3 | qianlong、wuyue、yitian | `mfr_honghuahuiheji_shisidangjia`<br>`mfr_zixiashengong_changkong`<br>`mfr_emeijiuyang_chaoyang` |
| G19 | 3 | 3 | general、kangxi、wujue | `mfr_huweiyingqiang_bafang`<br>`mfr_tangshijian_liancheng`<br>`mfr_cuixinzhang_liemai` |
| G20 | 3 | 3 | gulong、qianlong、wuyue | `mfr_jiayishengong_liehuo`<br>`mfr_hujiaquan_quandao`<br>`mfr_daizongruhe_yinyang` |
| G21 | 3 | 3 | qianlong、xiake-bixue、yitian | `mfr_jindifa_huban`<br>`mfr_jinwudaofa_rongxue`<br>`mfr_jifengbajian_zhouyu` |
| G22 | 3 | 3 | wujue、xiaoyao | `mfr_jiuyinshenzhao_wujian`<br>`mfr_beiming_tianchi`<br>`mfr_shengsifu_fuyu` |
| G23 | 3 | 3 | gulong、wuyue | `mfr_kongquelingfa_shouping`<br>`mfr_shenjianwuwang_yijian`<br>`mfr_taiyuesanqingfeng_sanfengheyi` |
| G24 | 3 | 3 | kangxi、xiaoyao、yitian | `mfr_ningxue_jueming`<br>`mfr_bahuang_duzun`<br>`mfr_qiankun_guiyi` |
| G25 | 3 | 3 | wujue、xiaoyao | `mfr_tianlongchanbu_tuili`<br>`mfr_hexiangbu_heli`<br>`mfr_heiyiqianzong_yexing` |
| G26 | 3 | 3 | gulong、yitian | `mfr_wuehezhen_hewei`<br>`mfr_yudafeihuajian_zhengshi`<br>`mfr_sandieshenquan_san` |
| G27 | 3 | 3 | daojia、xiake-bixue、yitian | `mfr_xuanxujian_xieshi`<br>`mfr_hunyuanzhang_hezhang`<br>`mfr_liangyidaojia_huyi` |
| G28 | 3 | 3 | shaolin、wujue、xiaoyao | `mfr_yijinjing_daozhuai`<br>`mfr_jiuyin_tianzhidao`<br>`mfr_shengsifu_ciyao` |
| G29 | 3 | 3 | daojia、general、wuyue | `mfr_yitiantulonggong_zhengfeng`<br>`mfr_jianghubaizhanjian_guifeng`<br>`mfr_wanhuajianfa_husheng` |
| G30 | 3 | 3 | general、wuyue、xiake-bixue | `mfr_yuenvjian_wuhen`<br>`mfr_taiyuesanqingfeng_sanfeng`<br>`mfr_piguadao_guidao` |
| G31 | 3 | 3 | daojia、kangxi、shaolin | `mfr_zhenwuqijie_guizhen`<br>`mfr_xuedaofa_henggu`<br>`mfr_dajingangquan_yinu` |
| G32 | 3 | 3 | wuyue、xiake-bixue、yitian | `mfr_zixiashengong_guangri`<br>`mfr_hunyuangong_yangqi`<br>`mfr_dajiutianshou_lieyang` |
| G33 | 2 | 2 | daojia、wujue | `mfr_anran_xiaohun`<br>`mfr_tiezhang_hushen` |
| G34 | 2 | 2 | wuyue、xiaoyao | `mfr_baibianqianhuan_shisanshi`<br>`mfr_qinlonggong_shuaizhi` |
| G35 | 2 | 2 | general、gulong | `mfr_baicaobiandu_xiangke`<br>`mfr_yihuagongqinggong_yibu` |
| G36 | 2 | 2 | qianlong、wuyue | `mfr_baihuacuo_fanchang`<br>`mfr_kuihua_wanzhen` |
| G37 | 2 | 2 | general、gulong | `mfr_baishouyujue_guixin`<br>`mfr_longfengshuanghuan_jueyu` |
| G38 | 2 | 2 | daojia | `mfr_beidoufuchen_chanchen`<br>`mfr_wudumichuan_jiedu` |
| G39 | 2 | 2 | xiaoyao | `mfr_beiming_kuntun`<br>`mfr_lingbo_piaohu` |
| G40 | 2 | 2 | wujue | `mfr_bihai_dingshen`<br>`mfr_kongming_qishier` |
| G41 | 2 | 2 | daojia、shaolin | `mfr_bingpoyinzhen_shehun`<br>`mfr_dalijingangzhi_suigu` |
| G42 | 2 | 2 | shaolin、wuyue | `mfr_boruozhang_boluomi`<br>`mfr_hanbingzhenqi_fengyue` |
| G43 | 2 | 2 | daojia、general | `mfr_chilianshenzhang_xiangxu`<br>`mfr_sihaibiaodao_sihai` |
| G44 | 2 | 2 | kangxi、yitian | `mfr_gaochangjian_zhuanjiao`<br>`mfr_qishangchujue_tuntu` |
| G45 | 2 | 2 | kangxi | `mfr_gaochangshouhu_qianmen`<br>`mfr_fuqidaofa_tongxin` |
| G46 | 2 | 2 | wujue、xiaoyao | `mfr_hama_quanjin`<br>`mfr_douzhuan_xingyi` |
| G47 | 2 | 2 | wuyue | `mfr_hanbingzhenqi_fengmai`<br>`mfr_qixianwuxingjian_wuxing` |
| G48 | 2 | 2 | daojia、general | `mfr_hanyuxinjue_hanqi`<br>`mfr_tianwangbuxin_sanzhen` |
| G49 | 2 | 2 | kangxi、xiake-bixue | `mfr_hongyingjian_tongxin`<br>`mfr_fuhuzhang_zhenguan` |
| G50 | 2 | 2 | wuyue | `mfr_huashanjianfa_jinyan`<br>`mfr_wuxianduzhang_huifengduwu` |
| G51 | 2 | 2 | general、gulong | `mfr_hunyuanfangzhuang_kaiyun`<br>`mfr_jiayishengong_chongzhen` |
| G52 | 2 | 2 | shaolin、wuyue | `mfr_jiashafumogong_fumo`<br>`mfr_heimuyajianfa_lingkong` |
| G53 | 2 | 2 | general | `mfr_jiebiaodaofa_fenglu`<br>`mfr_tongbeijin_tongbi` |
| G54 | 2 | 2 | daojia、general | `mfr_jinlingsuo_shepo`<br>`mfr_baizhanxinfa_junhun` |
| G55 | 2 | 2 | daojia、shaolin | `mfr_jinyangong_yanhui`<br>`mfr_luohanzhen_shibaluohan` |
| G56 | 2 | 2 | shaolin | `mfr_jinzhongzhao_bupo`<br>`mfr_fumozhangfa_xiangmo` |
| G57 | 2 | 2 | daojia、gulong | `mfr_liangyibu_huanxing`<br>`mfr_kuaihuozhen_jiadao` |
| G58 | 2 | 2 | wujue | `mfr_lingshezhangfa_qunshe`<br>`mfr_shuishangpiao_jieli` |
| G59 | 2 | 2 | wujue、wuyue | `mfr_liumai_shaoshang`<br>`mfr_dugu9_wuzhao` |
| G60 | 2 | 2 | xiaoyao、yitian | `mfr_liuyangzhang_bafu`<br>`mfr_jiuyang_liaoshang` |
| G61 | 2 | 2 | gulong、xiake-bixue | `mfr_longfengshuanghuan_huihuan`<br>`mfr_tiejianjianfa_manpan` |
| G62 | 2 | 2 | kangxi、wuyue | `mfr_meinianshengxinfa_huixi`<br>`mfr_hengshanbeijianfa_shoumenhu` |
| G63 | 2 | 2 | qianlong、xiake-bixue | `mfr_miaojiajian_shouxi`<br>`mfr_wuxingliuhezhang_guihuan` |
| G64 | 2 | 2 | gulong、kangxi | `mfr_mingyugong_huiliu`<br>`mfr_xuedaojing_zhaoxue` |
| G65 | 2 | 2 | wujue | `mfr_nizhuanjingmai_daozhuan`<br>`mfr_dumaihuqigong_guidu` |
| G66 | 2 | 2 | general、gulong | `mfr_pojunqiangfa_cuifeng`<br>`mfr_ximenjiandao_xilai` |
| G67 | 2 | 2 | shaolin、yitian | `mfr_qianshourulaizhang_wanfo`<br>`mfr_cuijunshenquan_cuijun` |
| G68 | 2 | 2 | general、gulong | `mfr_qihuangmifa_qichenke`<br>`mfr_kongquelingfa_kaiping` |
| G69 | 2 | 2 | general、wuyue | `mfr_qimenbuzhen_bamen`<br>`mfr_hengshanyunwubu_wusuo` |
| G70 | 2 | 2 | general、xiake-bixue | `mfr_qixianyin_luanxian`<br>`mfr_mantianhuayu_huayu` |
| G71 | 2 | 2 | daojia、gulong | `mfr_ruanjianyi_raojian`<br>`mfr_renyizhuangjian_hewei` |
| G72 | 2 | 2 | gulong、wuyue | `mfr_sanzhuangheji_tongji`<br>`mfr_huashanxinfa_qiyujian` |
| G73 | 2 | 2 | gulong、xiaoyao | `mfr_shenjianwuwang_fanzhao`<br>`mfr_yanqingzhang_saoqian` |
| G74 | 2 | 2 | kangxi、xiake-bixue | `mfr_shenlongxinfa_zuozhen`<br>`mfr_heibaijianfa_heguang` |
| G75 | 2 | 2 | gulong、kangxi | `mfr_shenshuineigong_zhongchao`<br>`mfr_huagumianzhang_cangzhen` |
| G76 | 2 | 2 | xiake-bixue、xiaoyao | `mfr_shenxing_dunying`<br>`mfr_zhemei_xunmei` |
| G77 | 2 | 2 | kangxi、qianlong | `mfr_shenzhao_xumai`<br>`mfr_paoding_muwuquanniu` |
| G78 | 2 | 2 | wujue | `mfr_shexinglifan_baibian`<br>`mfr_shuishangpiao_wuhen` |
| G79 | 2 | 2 | wuyue、xiake-bixue | `mfr_taishanjianfa_dongyue`<br>`mfr_jinsheyouzhang_chanshen` |
| G80 | 2 | 2 | kangxi、shaolin | `mfr_tangshijian_huanyun`<br>`mfr_duoluoyezhi_mantian` |
| G81 | 2 | 2 | gulong、yitian | `mfr_tianwaifeixian_yunwai`<br>`mfr_qishangquan_qifa` |
| G82 | 2 | 2 | gulong、kangxi | `mfr_tianyishenshui_fengxia`<br>`mfr_huahuijian_yexi` |
| G83 | 2 | 2 | general、shaolin | `mfr_tongbeijian_jianzou`<br>`mfr_damojianfa_jianxing` |
| G84 | 2 | 2 | daojia、qianlong | `mfr_tongguijian_tonggui`<br>`mfr_qixinhaitang_wusheng` |
| G85 | 2 | 2 | general、qianlong | `mfr_tuinaliaofa_tuigong`<br>`mfr_baguazhang_bafang` |
| G86 | 2 | 2 | daojia、qianlong | `mfr_wudangfuchen_qiansi`<br>`mfr_taijimenquan_heshou` |
| G87 | 2 | 2 | yitian | `mfr_wuxingqizhen_lunzhuan`<br>`mfr_duyanfeisha_fengjiang` |
| G88 | 2 | 2 | daojia | `mfr_xiantiangong_gangqi`<br>`mfr_tiangang_hewei` |
| G89 | 2 | 2 | wuyue、xiake-bixue | `mfr_xiaoaojianghuqu_tongsheng`<br>`mfr_xueshanjianfa_feixue` |
| G90 | 2 | 2 | gulong、shaolin | `mfr_xiejiajianlu_bianlu`<br>`mfr_cibeidao_duhua` |
| G91 | 2 | 2 | wuyue、xiake-bixue | `mfr_xixing_sangong`<br>`mfr_jinshejian_nilinhui` |
| G92 | 2 | 2 | wuyue、xiake-bixue | `mfr_xixing_wanliu`<br>`mfr_luohanfumo_zhuxiang` |
| G93 | 2 | 2 | gulong、shaolin | `mfr_yihuajieyu_jieli`<br>`mfr_fumosuofa_huanyuan` |
| G94 | 2 | 2 | shaolin、yitian | `mfr_yizhichan_qiankun`<br>`mfr_yingzhaoqinna_changkong` |
| G95 | 2 | 2 | daojia、gulong | `mfr_yufengyin_huzhu`<br>`mfr_yanluosuo_tuoying` |
| G96 | 2 | 2 | daojia、wuyue | `mfr_yunvxinjing_bingxin`<br>`mfr_dugu9_poanqi` |
| G97 | 2 | 2 | qianlong、xiake-bixue | `mfr_zhangmenboyi_baipai`<br>`mfr_wenjiawuxingzhen_lunzhuan` |
| G98 | 2 | 2 | general、yitian | `mfr_zhenqijian_qihui`<br>`mfr_qingyifashen_lueying` |

### 7.5 NR1 / NR2 改法指引

1. 先拆 G01–G16 的高复用组，尤其 G01 的 33 门、G02 的 22 门；每组保留至多一条原序列，其余按动作末端和门派核心重配。
2. 每改一条先锁定招式职责与终点，再保留合理门派核心；不要只交换顺序，因为重排仍会产生 10000 bp 警告。
3. 等长 `L` 路线优先替换至少 `floor(0.2L)+1` 穴；长短不同按较短路线重算，避免短路被长路完整包含。
4. 始终保持原硬约束：1–18 段、穴位不重复、40–120 CT、风险 0–1200、`recovery+ΣCT≤2000`、性质 / `purpose` 与显式引用一致。
5. 同一武学的多绝招继续满足共享穴位 ≤50%、无完全相同 / 轮换 / 逆序；不同职责须反映在起点、换脉段或终点，不能只改风险。
6. 外放路线至少包含 §4.4.1.4 的 13 个手部端点之一，同时按掌 / 指 / 持械动作选择合理末端；修复多样性不能删掉外放合法端点。
7. 每批修复后依次跑旧 `--strict`、`--diversity`；以精确组数先归零、再降低非精确警告为收敛目标。不要为过 lint 添加无叙事依据的豁免。

### 7.6 验收命令与逐项自检

- ✅ `design/21` 有 v2.4 版本行 / 变更记录，新增规则位于路线章节，只同步相关术语、配表、校验和依赖。
- ✅ 三张映射表齐全；动作端点均取自 `design/15`，丹田区未虚构新穴位，外放继续叠加 13 端点白名单。
- ✅ 同门职责 / ≤50% / 无轮换逆序、跨武学完全不同序列及 ≥80% 说明义务均已写成可执行规则。
- ✅ 新开关、README、单元测试和全量 98 组统计齐全；未修改图鉴，未改变旧 `--strict`。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：105 项通过。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；仅有基线内既知未定义 ID `sk_babuganchan`，严格失败数 0。
- ✅ `python3 tools/lint/check_skill_catalogs.py --strict`：11 册 `errors=0`，退出 0。
- ✅ `python3 tools/balance/meridian_flow_sim.py --check`：`all checks passed`。
- ✅ 补充开关验证：`--diversity` 退出 0；`--diversity-strict` 因当前 98 个精确组按设计退出 1，且报告 2177 个非精确警告。
