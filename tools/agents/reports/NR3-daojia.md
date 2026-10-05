# NR3-daojia 报告 · 路线叙事第三轮 · 道家（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

完成道家单元名下 30 对跨武学高相似路线治理：30 对全部改开，`overlapBp` 由 8000–10000 降至 0–5000，未使用理由豁免，也未新造 ≥80% 配对。
共改写 24 条既有路线、移出并等量换入 124 个穴位；出招方式、段数、逐段 CT、风险数组、收招和路线 ID 均保持不变。
`--delivery` 的 4 条拳／擒拿与 1 条位移违规全部归零；护体／蓄气、外放端点继续为零违规。
性质冲突按任务要求不改，改前／改后均为 16 条；`MoveDef.voice` 已存在，但本册无人声音功招，未补字段。
全部指定门禁通过；全仓仍涉及道家册的 18 对旧高相似路线均归其他单元，已在 §6、§7.5 交接。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/design/catalog/skills-daojia.md` | 2629 | 版本记录；§0 绝招显式路线索引；§8.7.5 跨武学高相似路线说明；24 条路线重配及数值镜像核对 |
| `tools/agents/reports/NR3-daojia.md` | 166 | 30 对处理表、delivery 前后计数、24 条路线不变量、性质冲突与跨任务交接、门禁结果 |

## 3. 关键结论与数值

- 名下 30 对的改前分布为：10000 bp × 8、9000 bp × 1、8750 bp × 8、8333 bp × 8、8000 bp × 5；改后范围为 0–5000 bp，均满足 `<8000`。
- 24 条路线共替换 124 个旧穴位集合成员，并等量换入 124 个已登记穴位；没有新增 `ap_*`、`mfr_*`、`mv_*` 或其他 ID。
- 路线长度变化 0 条、逐段 CT 数组变化 0 条、风险数组变化 0 条。因此路线 CT、总风险以及 `1200+ΣsegmentCt` 收招合计均保持原值。
- 本册仍为 65 条绝招路线、65 个不同有序序列；同一武学重复、循环／逆序、单册 ≥80% 配对均为 0。专项全仓检查确认完全相同有序路线为 0，NR3 检查确认本任务新造 ≥80% 配对为 0。
- 动作末端：`mfr_taijiquan_baohu` 补合谷；`mfr_huzhaojuehushou_juehu` 补曲池、合谷；`mfr_wujixuangongquan_huoshou` 补曲池、合谷；`mfr_taijituishou_shuai` 补手三里；`mfr_jinyangong_yanhui` 补带脉五枢、足少阳悬钟。
- `mfr_xuantie_caomu` 仍含内关、劳宫、中冲并终至阳池，满足既有持械导引与外放端点；两条非绝招外放路线继续为 2 条、违规 0。
- `MoveDef.voice` 已由 05 引入；道家册只有实体金铃／琴箫等持乐器表现，没有本任务所列的人声招，故 `voice` 改动为 0。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 本次默认值 |
|---|---|---|
| NR3-DJ-O01 | 21 §2.4 的“含任督／奇经混合方案时取 harmony”应按节点多数决，还是任一任督／奇经即调和 | 按协调者要求不改性质与路线；保留当前 16 条只报告命中，待统一裁定后由后续任务批量处理 |
| NR3-DJ-O02 | 其他单元负责的 18 对旧高相似路线尚未全部合入 | 不改道家侧；由 `bulu/general/gulong/xiaoyao/kangxi/shaolin/yitian/wujue` 各自改其“本单元路线”，合并后全仓复扫 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无新增提案 | 21 §4.3.1、§4.3.4、§4.6 与 §17.1 已足以约束本轮；§2.4 解释问题沿用既有协调项，不在本任务抢先裁定 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/catalog/skills-bulu-14-xueshan.md` | `mfr_cuomaifanzhang_fanmai` | 与 `mfr_sanhuajudingzhang_juding` 当前 8333 bp；按 bulu 分派改补录侧 |
| `docs/design/catalog/skills-general.md` | `mfr_jiebiaodaofa_fenglu`、`mfr_baidubianzheng_guizheng`、`mfr_suogugong_tuofu` | 分别处理与 `mfr_xiantiangong_wuqi` 8333、`mfr_tongguijian_tonggui` 8750、`mfr_jinlingsuo_shepo` 10000 bp 的旧配对 |
| `docs/design/catalog/skills-gulong.md` | `mfr_mingyugong_zhaoye` | 与 `mfr_xiantiangong_wuqi` 当前 8750 bp；按 gulong 分派改古龙侧 |
| `docs/design/catalog/skills-xiaoyao.md` | `mfr_bahuang_duzun`、`mfr_beiming_kuntun`、`mfr_wulundazhuan_tielun` | 处理与道家侧共 4 对旧配对，当前为 8000–10000 bp |
| `docs/design/catalog/skills-kangxi.md` | `mfr_huagumianzhang_huihuan`、`mfr_shenzhao_xumai`、`mfr_ningxue_fengmen`、`mfr_xuedaofa_cangfeng` | 处理与道家侧共 4 对旧配对，当前均为 8333 或 8750 bp |
| `docs/design/catalog/skills-shaolin.md` | `mfr_xinyiba_heyi`、`mfr_shizihou_shizihou` | 分别与 `mfr_gumuqinggong_fenying`、`mfr_sanhuajudingzhang_juding` 同集合 10000 bp；按 shaolin 分派改少林侧 |
| `docs/design/catalog/skills-yitian.md` | `mfr_dajiutianshou_lieyang`、`mfr_yingzhaoqinna_zhebing` | 两者与 `mfr_anran_daimu` 当前均为 8750 bp；按 yitian 分派改倚天侧 |
| `docs/design/catalog/skills-wujue.md` | `mfr_jiuyinliaoshangpian_biqi` | 与 `mfr_suxin_juan` 当前 8333 bp；按 wujue 分派改五绝侧 |
| `docs/design/21-meridian-flow-and-moves.md` | §2.4 | 作者／协调者统一“任督／奇经混合取 harmony”的可执行读法后，再处理本册 16 条性质冲突 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

以下穴位列省略共同前缀 `ap_`；`-` 为从本侧路线移出，`+` 为换入。所有条目均采用“改开”，没有理由豁免。

| # | 配对 | 改前 bp | 处理结果 | 改动的穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_bingpoyinzhen_shehun` ↔ `mfr_shenghuoling_wuding` | 10000 | ✅ 改开至 3750 | 冰魄：`-renmai_zhongwan,yinqiao_jiaoxin,yinwei_fuai,zujueyin_ligou,zujueyin_zhongfeng`；`+zushaoyin_shuiquan,zutaiyin_diji,yinwei_qimen,shoujueyin_neiguan,shoujueyin_daling` |
| 2 | `mfr_bixuegong_suoyuan` ↔ `mfr_zhemei_xunmei` | 10000 | ✅ 改开至 1250 | 闭穴：`-zujueyin_xiguan,zushaoyin_lingxu,zutaiyin_dabao,zutaiyin_yinbai,renmai_qugu,shoujueyin_daling,shoujueyin_ximen`；`+renmai_qihai,renmai_shimen,zushaoyin_dazhong,zushaoyin_yingu,shoujueyin_jianshi,shoushaoyin_tongli,renmai_shenque` |
| 3 | `mfr_gumuqinggong_youshen` ↔ `mfr_shexinglifan_baibian` | 10000 | ✅ 改开至 1250 | 古墓游身：`-daimai_zulinqi,daimai_weidao,daimai_daimai,zushaoyin_taixi,zutaiyang_weizhong,dumai_mingmen,dumai_zhiyang`；`+daimai_wushu,daimai_zhangmen,yangqiao_fuyang,zushaoyang_fengshi,zushaoyang_yanglingquan,zushaoyang_waiqiu,zushaoyang_xuanzhong` |
| 4 | `mfr_gumuqinggong_youshen` ↔ `mfr_tianlongchanbu_tuili` | 10000 | ✅ 改开至 1666 | 同 #3，一次改写同时处理本对 |
| 5 | `mfr_hanyuxinjue_hanqi` ↔ `mfr_yihun_yihun` | 10000 | ✅ 改开至 1666 | 寒玉：`-yinwei_tiantu,zujueyin_xingjian,zushaoyin_rangu,zutaiyin_dadu,zutaiyin_yinlingquan`；`+renmai_shuifen,zushaoyin_lingxu,shoutaiyin_xiabai,shoushaoyin_tongli,yinqiao_lougu` |
| 6 | `mfr_yunvxinjing_bingxin` ↔ `mfr_meirensanzhao_feiyan` | 10000 | ✅ 改开至 3750 | 冰心：`-zujueyin_dadun,zujueyin_zhongdu,zutaiyin_gongsun,shoujueyin_neiguan,shoushaoyin_lingdao,shoushaoyin_yinxi,shoutaiyin_yuji`；`+renmai_guanyuan,zushaoyin_fuliu,zutaiyin_xuehai,yinwei_zhubin,yinqiao_lougu,shoushaoyin_tongli,shoujueyin_jianshi` |
| 7 | `mfr_xuantie_caomu` ↔ `mfr_mujianyi_caomu` | 10000 | ✅ 改开至 2500 | 玄铁：`-renmai_qihai,renmai_guanyuan,renmai_zhongwan,renmai_danzhong,shoujueyin_quze`；`+dumai_yaoshu,dumai_jizhong,dumai_shenzhu,chongmai_siman,chongmai_zhongzhu`。木剑：`-renmai_guanyuan,renmai_zhongwan,renmai_danzhong,shoujueyin_quze,shoujueyin_neiguan`；`+dumai_mingmen,chongmai_henggu,daimai_jingmen,zutaiyang_shenshu,zushaoyin_lingxu` |
| 8 | `mfr_taijijian_zhanjian` ↔ `mfr_zhengoubang_huilan` | 10000 | ✅ 改开至 4285 | 太极黏剑：`-dumai_zhiyang,dumai_mingmen,zushaoyin_taixi,zutaiyang_weizhong,shoushaoyang_waiguan`；`+chongmai_henggu,daimai_daimai,daimai_wushu,shoutaiyin_taiyuan,shouyangming_yangxi` |
| 9 | `mfr_anran_xiangru` ↔ `mfr_yiyangzhi_liaoshang` | 9000 | ✅ 改开至 0 | 想入非非：`-shoushaoyin_shaochong,shoutaiyin_kongzui,shoutaiyin_zhongfu,yinwei_daheng,zujueyin_dadun,zujueyin_zhongdu,zushaoyin_shuiquan,zutaiyin_gongsun,renmai_danzhong`；`+zushaoyin_lingxu,zutaiyin_dabao,yinwei_qimen,yinqiao_sanyinjiao,renmai_qugu,shoushaoyin_tongli,shoujueyin_tianquan,shoujueyin_quze,shoujueyin_neiguan` |
| 10 | `mfr_suxin_hebi` ↔ `mfr_baidubianzheng_guizheng` | 8750 | ✅ 改开至 1250 | 合璧：`-zutaiyin_yinbai,renmai_qugu,shoujueyin_daling,shoujueyin_ximen,shoushaoyin_shaohai,yinqiao_jingming,yinwei_fushe,zujueyin_ququan`；`+chongmai_dahe,chongmai_siman,daimai_wushu,daimai_jingmen,yinqiao_lougu,shoushaoyin_tongli,shouyangming_yangxi,shoushaoyang_yangchi` |
| 11 | `mfr_bingpoyinzhen_shehun` ↔ `mfr_tangmenanshou_baoyu` | 8750 | ✅ 改开至 3750 | 同 #1，一次改写同时处理本对 |
| 12 | `mfr_shenmen13_shisan` ↔ `mfr_huoyandao_hufa` | 8750 | ✅ 改开至 0 | 神门十三：`-shoujueyin_jianshi,shoujueyin_zhongchong,shoushaoyin_shenmen,shoutaiyin_tianfu,yinqiao_lieque,yinwei_lianquan,zujueyin_taichong`；`+shoushaoyin_tongli,shoujueyin_tianquan,shoutaiyin_xiabai,yinqiao_lougu,yinwei_tiantu,zushaoyin_lingxu,shoutaiyang_yanglao` |
| 13 | `mfr_suxin_hebi` ↔ `mfr_jingangfumoquan_fumo` | 8750 | ✅ 改开至 2500 | 同 #10，一次改写同时处理本对 |
| 14 | `mfr_wujixuangongquan_huoshou` ↔ `mfr_liuyangzhang_bafu` | 8750 | ✅ 改开至 0 | 活手：原 8 穴全部换为 `shoutaiyin_xiabai,yinqiao_sanyinjiao,yinwei_qimen,zujueyin_xiguan,zushaoyin_shuiquan,zutaiyin_dabao,shouyangming_quchi,shouyangming_hegu` |
| 15 | `mfr_shenmen13_shisan` ↔ `mfr_shenshuineigong_huilan` | 8750 | ✅ 改开至 0 | 同 #12，一次改写同时处理本对 |
| 16 | `mfr_tongguijian_tonggui` ↔ `mfr_suxin_hebi` | 8750 | ✅ 改开至 2500 | 同 #10；同归剑法不动，改素心合璧侧 |
| 17 | `mfr_xuantie_daqiao` ↔ `mfr_weituochu_dachu` | 8750 | ✅ 改开至 3750 | 大巧：`-renmai_qihai,chongmai_qichong,zushaoyang_yanglingquan,zujueyin_taichong,dumai_zhiyang,shouyangming_pianli`；`+dumai_yaoshu,dumai_jizhong,zutaiyang_shenshu,zushaoyang_fengshi,chongmai_huangshu,shoushaoyang_yangchi` |
| 18 | `mfr_baichousuofa_juanwan` ↔ `mfr_liuyangzhang_bafu` | 8333 | ✅ 改开至 1666 | 绢腕：`-renmai_chengjiang,renmai_shimen,shoujueyin_laogong,shoushaoyin_jiquan`；`+yinwei_fuai,shoujueyin_ximen,shoushaoyin_tongli,shoutaiyin_taiyuan` |
| 19 | `mfr_hanyuxinjue_hanqi` ↔ `mfr_bihai_dingshen` | 8333 | ✅ 改开至 1666 | 同 #5，一次改写同时处理本对 |
| 20 | `mfr_chongyangzhang_diezhang` ↔ `mfr_jingangbuhuai_jinshen` | 8333 | ✅ 改开至 3333 | 重阳叠掌：`-shoushaoyin_shaochong,shoutaiyin_kongzui,shoutaiyin_zhongfu`；`+shoushaoyin_tongli,shouyangming_quchi,shouyangming_shousanli` |
| 21 | `mfr_mujianyi_caomu` ↔ `mfr_fanliangyi_nizhuan` | 8333 | ✅ 改开至 1666 | 同 #7 木剑侧，一次改写同时处理本对 |
| 22 | `mfr_xuantie_caomu` ↔ `mfr_fanliangyi_nizhuan` | 8333 | ✅ 改开至 1666 | 同 #7 玄铁侧，一次改写同时处理本对 |
| 23 | `mfr_sanhuajudingzhang_juding` ↔ `mfr_jinyangong_yanhui` | 8333 | ✅ 改开至 5000 | 金雁回身：`-shoutaiyin_yunmen,yinqiao_zhaohai`；`+daimai_wushu,zushaoyang_xuanzhong` |
| 24 | `mfr_zaoheding_penhe` ↔ `mfr_liumai_shaoshang` | 8333 | ✅ 改开至 5000 | 枣核：`-shoushaoyin_shaofu,yinqiao_jiaoxin,yinwei_fuai`；`+zushaoyin_shuiquan,zutaiyin_gongsun,shoujueyin_daling` |
| 25 | `mfr_yunvxinjing_hufa` ↔ `mfr_tianlongchanbu_tuili` | 8333 | ✅ 改开至 1666 | 护法：`-zushaoyin_yongquan,zushaoyin_taixi,zutaiyang_weizhong,dumai_mingmen,dumai_zhiyang`；`+renmai_guanyuan,zushaoyin_shuiquan,zutaiyang_shenshu,dumai_yaoshu,dumai_jizhong` |
| 26 | `mfr_anran_xiaohun` ↔ `mfr_zhemei_xunmei` | 8000 | ✅ 改开至 0 | 销魂：`-zushaoyin_lingxu,zutaiyin_dabao,zutaiyin_yinbai,renmai_qugu,shoujueyin_daling,shoujueyin_ximen,shoushaoyin_shaohai,shoutaiyin_taiyuan,yinqiao_jingming`；`+zushaoyin_shufu,zutaiyin_shangqiu,yinwei_fuai,yinqiao_jiaoxin,renmai_shimen,shoushaoyin_yinxi,shoutaiyin_yuji,shoujueyin_quze,shoujueyin_neiguan` |
| 27 | `mfr_suxin_huaqian` ↔ `mfr_bitaoxuangong_wanli` | 8000 | ✅ 改开至 0 | 花前：`-renmai_guanyuan,shoushaoyin_shenmen,shoutaiyin_taiyuan,zushaoyin_taixi,dumai_shendao`；`+daimai_zhangmen,chongmai_shiguan,yangqiao_fuyang,zushaoyang_waiqiu,shoutaiyang_qiangu` |
| 28 | `mfr_yunvxinjing_bingxin` ↔ `mfr_jiuyinshenzhao_shounao` | 8000 | ✅ 改开至 3000 | 同 #6，一次改写同时处理本对 |
| 29 | `mfr_suxin_huaqian` ↔ `mfr_yijinduangupian_tuotai` | 8000 | ✅ 改开至 4000 | 同 #27，一次改写同时处理本对 |
| 30 | `mfr_xiantiangong_gangqi` ↔ `mfr_yiyangzhi_qianyang` | 8000 | ✅ 改开至 4000 | 罡气：`-renmai_zhongwan,renmai_danzhong,shouyangming_shangyang,dumai_shendao`；`+dumai_yaoshu,dumai_jizhong,dumai_shuigou,dumai_shenzhu` |

### 7.2 `--delivery` 命中数（改前 / 改后）

| 规则 | 改前 | 改后 | 结果 |
|---|---:|---:|---|
| 全部动作末端违规 `violations` | 5 | 0 | ✅ 清零 |
| 拳／擒拿末端 | 4 | 0 | ✅ 补曲池／手三里／合谷，未改出招方式 |
| 位移核心脉／涌泉 | 1 | 0 | ✅ 金雁功补带脉与足少阳 |
| 护体／蓄气缺任督 | 0 | 0 | ✅ 保持 |
| 绝招外放端点 | 0 | 0 | ✅ 保持 |
| 非绝招外放端点 | 0（共 2 条） | 0（共 2 条） | ✅ 保持 |
| 末三段位置违规 `tail_violations` | 0 | 0 | ✅ 保持 |
| 未分类 | 14 | 14 | ✅ 不强行猜动作分类 |
| 性质冲突 | 16 | 16 | ⚠️ 按任务明确要求本轮不改；详见 §7.4 |

总览由 `routes/classified/checked_rules/violations/tail/unclassified = 65/51/52/5/0/14` 变为 `65/51/52/0/0/14`。

### 7.3 改过的路线清单

所有行的逐段 CT 与风险数组均未变化；“CT / 风险”列给出路线合计。收招仍为 1200 CT，故总耗时分别为 1995、2000、1970、1950、1912、1920 或 1800 CT，与改前一致。

| 路线 | 段数 | CT / 风险 | 数组变化 |
|---|---:|---:|---|
| `mfr_xiantiangong_gangqi` | 10 | 795 / 1370 | 无 |
| `mfr_yunvxinjing_hufa` | 10 | 795 / 1370 | 无 |
| `mfr_yunvxinjing_bingxin`、`mfr_anran_xiaohun`、`mfr_anran_xiangru` | 各 10 | 各 800 / 1900 | 无 |
| `mfr_xuantie_caomu` | 10 | 770 / 1330 | 无 |
| `mfr_xuantie_daqiao`、`mfr_suxin_huaqian`、`mfr_taijijian_zhanjian` | 各 10 | 各 750 / 1450 | 无 |
| `mfr_suxin_hebi` | 10 | 800 / 1900 | 无 |
| `mfr_taijiquan_baohu` | 10 | 800 / 1900 | 无 |
| `mfr_bingpoyinzhen_shehun`、`mfr_huzhaojuehushou_juehu`、`mfr_wujixuangongquan_huoshou`、`mfr_shenmen13_shisan`、`mfr_bixuegong_suoyuan` | 各 8 | 各 720 / 1360 | 无 |
| `mfr_gumuqinggong_youshen`、`mfr_mujianyi_caomu` | 各 8 | 各 712 / 1120 | 无 |
| `mfr_jinyangong_yanhui`、`mfr_chongyangzhang_diezhang`、`mfr_hanyuxinjue_hanqi`、`mfr_baichousuofa_juanwan`、`mfr_taijituishou_shuai`、`mfr_zaoheding_penhe` | 各 6 | 各 600 / 900 | 无 |

> 注：上表合并展示同档条目；共 24 条，机器对比结果为 `length_changed=[]`、`ct_arrays_changed=[]`、`risk_arrays_changed=[]`。

### 7.4 性质冲突命中清单（本轮不改）

- 路线判阴、武学声明阳：`mfr_xiantiangong_wuqi`、`mfr_tiangang_guiyi`、`mfr_tongguijian_tonggui`、`mfr_huzhaojuehushou_juehu`、`mfr_wujixuangongquan_huoshou`、`mfr_shenmen13_shisan`、`mfr_tiyunzong_fuyao`、`mfr_zhenwuqijie_guizhen`、`mfr_sanhuajudingzhang_juding`、`mfr_jinyangong_yanhui`、`mfr_chongyangzhang_diezhang`、`mfr_furongjinzhen_mianli`。
- 路线判阳、武学声明阴：`mfr_yunvxinjing_hufa`、`mfr_gumuqinggong_youshen`、`mfr_anran_daimu`、`mfr_raozhirou_huagang`。
- 合计 16 条，改前／改后相同。这里按当前 lint 多数决输出原样登记，不据此修改路线；待 §4 的读法统一后处理。

### 7.5 交其他任务的条目

- `bulu`：`mfr_cuomaifanzhang_fanmai↔mfr_sanhuajudingzhang_juding`（8333）。
- `general`：`mfr_jiebiaodaofa_fenglu↔mfr_xiantiangong_wuqi`（8333）、`mfr_baidubianzheng_guizheng↔mfr_tongguijian_tonggui`（8750）、`mfr_suogugong_tuofu↔mfr_jinlingsuo_shepo`（10000）。
- `gulong`：`mfr_mingyugong_zhaoye↔mfr_xiantiangong_wuqi`（8750）。
- `xiaoyao`：`mfr_bahuang_duzun↔mfr_xiantiangong_wuqi`（8000）、`mfr_beiming_kuntun↔mfr_gumuqinggong_fenying`（8750）、`mfr_bahuang_duzun↔mfr_gumuqinggong_fenying`（10000）、`mfr_wulundazhuan_tielun↔mfr_mujianyi_wanwu`（8750）。
- `kangxi`：`mfr_huagumianzhang_huihuan↔mfr_tiangang_guiyi`（8750）、`mfr_shenzhao_xumai↔mfr_jinlingsuo_shepo`（8750）、`mfr_ningxue_fengmen↔mfr_sanhuajudingzhang_juding`（8333）、`mfr_xuedaofa_cangfeng↔mfr_sanhuajudingzhang_juding`（8333）。
- `shaolin`：`mfr_xinyiba_heyi↔mfr_gumuqinggong_fenying`（10000）、`mfr_shizihou_shizihou↔mfr_sanhuajudingzhang_juding`（10000）。
- `yitian`：`mfr_dajiutianshou_lieyang↔mfr_anran_daimu`、`mfr_yingzhaoqinna_zhebing↔mfr_anran_daimu`（均 8750）。
- `wujue`：`mfr_jiuyinliaoshangpian_biqi↔mfr_suxin_juan`（8333）。

这些均是固定分派快照中由其他单元负责的旧配对，不属于“本任务新造”；道家侧未改。

### 7.6 门禁与范围自检

| 验收项 | 结果 |
|---|---|
| 30 对逐对处理；10000 bp 原则改开 | ✅ 30 / 30 改开，8 对 10000 bp 全部降至 1250–4285；理由豁免 0 |
| 不缩短、不低于建议段数；CT / 风险列同步 | ✅ 24 条路线长度、CT 数组、风险数组均不变，正文镜像继续引用文首索引 |
| 同门互异、非轮换／逆序；全仓不造新 ≥80% | ✅ `similar_pairs_ge80=0`（本册），`check_nr3_unit` 新造 0 |
| 拳／擒拿、位移、护体／蓄气、外放端点 | ✅ delivery 违规 5 → 0；非绝招外放 2 / 0 |
| 性质冲突 | ⚠️ 16 → 16，按任务要求只报告、不修改 |
| 人声字段 | ✅ 05 已有 `MoveDef.voice`；本册无人声音功招，按要求跳过 |
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；111 文件、63,148 次出现、13,906 个定义；仅既有 `sk_babuganchan` 基线提示，新增严格失败 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 145 / 145 通过 |
| `damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `meridian_flow_sim.py --check` / `projection_sim.py --check` | ✅ 均通过 |
| `check_skill_catalogs.py --strict --diversity-strict` | ✅ errors 0；指定道家册范围内 65 路线 / 65 序列，完全重复、≥80% 均为 0 |
| `check_route_unique_for.py` / `check_undefined_in.py` | ✅ 完全相同路线 0；未定义引用 0 |
| `check_nr3_unit.py daojia` | ✅ 名下 30；改开 30、理由 0、未处理 0、新造 0 |
| 写集与 Git 纪律 | ✅ 只修改道家图鉴并新建本报告；未执行改变仓库状态的 Git 命令 |
| 文档完整性 | ✅ 无未完成占位；代码块与表格完整；既有待决事项未删除 |
