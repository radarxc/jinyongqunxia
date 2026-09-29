# NR3-wujue 报告 · 路线叙事第三轮 · 五绝（跨武学高相似路线与动作末端规则）

## 1. 摘要（3–6 行）

完成五绝图鉴名下 30 对高相似绝招路线治理：全部改开至 `overlapBp<8000`，未使用共同传承理由。
共最小替换 23 条路线的 43 个穴位槽位；未改段数、逐段 CT、风险、收招或出招方式，且没有新造 ≥80% 配对。
`--delivery` 的动作规则违规由 9 降为 0；28 条性质冲突依任务要求只报告、不改。
补齐碧海潮生曲持箫 `voice:false`，以及莲花落、丐帮传声明确人声招的 `tags:[sonic]; voice:true`。
用户指定的九项校验均以退出码 0 通过。

## 2. 产出（文件、行数、主要章节）

- `docs/design/catalog/skills-wujue.md`：3598 行；更新文首 89 条绝招审计索引中的 23 条路线，新增 §0.12.5 路线叙事与镜像核对表，补 V-M09/V-M10、O-13 及人声字段。
- `tools/agents/reports/NR3-wujue.md`：157 行；记录逐对结果、delivery 差异、改动路线、开放项、跨任务交接与验证证据。
- 未创建新 ID，未修改任务允许范围之外的文件。

## 3. 关键结论与数值

- 配对闭合：`30/30` 已改开，`0` 条写理由，`0` 条未处理；改后 bp 范围 `3333–7500`。
- 全局安全：本任务新造 ≥80% 配对 `0`；本册绝招有序序列 `89/89` 互异；全仓完全相同配对 `0`。
- 同武学互异：所有同武学绝招共享率均不高于 50%；其中本次相关最高为九阴真经 `3/6=5000 bp`，其余弹指 3000、兰花 2500、蛤蟆 1000、枯荣 0、空明 4285、九阴神爪 2000、白骨爪 1250、大伏魔拳 1250。
- 数值不变量：23 条路线均保持原段数、逐段 CT、风险槽位、`recovery=1200`；因此总时长仍为 `ΣCT+1200`，范围 `1590–2000 CT`。
- 动作规则：delivery `routes=89, classified=72, checked_rules=82`；一般违规 `9→0`，末端违规 `0→0`，非绝招外放违规 `0→0`。
- 人声字段：碧海 5 条持箫伤敌音功显式 `voice:false`；莲花落 3 招与丐帮传声 3 招显式 `voice:true`，并均带 `tags:[sonic]`；未把媒介不明招式硬判成人声。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| NR3W-O01 | `design/21` §2.4 的“含任督 / 奇经混合方案时取 harmony”应采用穴位阴阳计票，还是字面上的混入即调和？ | 遵从本任务指令：本轮不为性质调整路线，保留 28 条 `nature-conflict`，待协调者统一读法后另批处理。 |
| NR3W-O02 | `voice` 是否应强制所有非外放、纯支援/纯控制的人声招显式填写？ | 本册已对语义明确者补齐；`sk_yanjiehao`、`sk_junzhanghao`、`sk_qimenyinlu`、`sk_biluofengyan` 等媒介不明确者暂不硬套。 |

### 性质冲突命中清单（本轮不改）

- 绝招 9 条：`mfr_tiebogong_zhenbafang`、`mfr_hama_fajin`、`mfr_hama_quanjin`、`mfr_yiyangzhi_liaoshang`、`mfr_tiezhang_hushen`、`mfr_tiezhang_qingtian`、`mfr_shentuoxueshanzhang_fuzhong`、`mfr_tongshihenglian_yingqiao`、`mfr_huodushanfa_ansuan`。
- 普通外放 19 条：`mfr_pikongzhang_geshan`、`mfr_pikongzhang_liekong`、`mfr_pikongzhang_pikong`、`mfr_pikongzhang_saozhu`；`mfr_xianglong18_diyang`、`mfr_xianglong18_feilong`、`mfr_xianglong18_hongjian`、`mfr_xianglong18_huoyue`、`mfr_xianglong18_jianlong`、`mfr_xianglong18_kanglong`、`mfr_xianglong18_lishe`、`mfr_xianglong18_longzhan`、`mfr_xianglong18_lvshuang`、`mfr_xianglong18_miyun`、`mfr_xianglong18_shicheng`、`mfr_xianglong18_shuanglong`、`mfr_xianglong18_sunze`、`mfr_xianglong18_turu`、`mfr_xianglong18_yuyue`。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| NR3W-P01 | 在 Canon 或 `design/21` §2.4 明定路线性质唯一算法，并给出任督 / 奇经与十二正经混合的至少三个边界例。 | 当前“计票读法”约命中 104 条、“混入即调和”的字面读法约命中 25 条；不统一会导致不同图鉴采用相反修法。 |
| NR3W-P02 | 将 `MoveDef.voice` 的必填范围写入图鉴构建门禁：至少对 `tags:[sonic]` 招式要求显式布尔值。 | 05 已定义字段，但历史卡片可依赖默认值；显式字段能稳定区分人声喉端与持乐器手 / 腕端点。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/21-meridian-flow-and-moves.md` | §2.4 | 作者确认后钉死路线性质算法；本轮五绝 28 条命中暂不改。 |
| `docs/design/05-martial-arts-system.md` / 构建 schema | `MoveDef.voice` 校验 | 考虑要求所有 `sonic` 招式显式写 `voice`，并继续约束 `voice:true` 只能与 `sonic` 联用。 |
| `docs/design/catalog/skills-gulong.md` | `mfr_tangmenbidu_shoumai` | 该路线与改后 `mfr_jiuyinshenzhao_shounao` 仍为 `5/6=8333 bp`；此对在快照中归 `gulong`，应由另一侧任务处理。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 逐对处理表

所有条目均采用“改开”，没有豁免理由；位置为 1-based 段序。

| # | 配对 | 改前 bp | 处理方式 | 改动穴位 |
|---:|---|---:|---|---|
| 1 | `mfr_jiuyinshenzhao_shounao` ↔ `mfr_baicaobiandu_xiangke` | 10000 | 改开至 6666 | `mfr_jiuyinshenzhao_shounao` 2：`ap_yinwei_daheng→ap_zujueyin_xingjian`；8：`ap_renmai_shuifen→ap_shoujueyin_ximen`；10：`ap_shoushaoyin_lingdao→ap_shouyangming_hegu` |
| 2 | `mfr_yijinduangupian_tuotai` ↔ `mfr_baizhanxinfa_junhun` | 10000 | 改开至 6000 | `mfr_yijinduangupian_tuotai` 1：`ap_daimai_daimai→ap_chongmai_huangshu`；3：`ap_zutaiyang_weizhong→ap_yinqiao_lougu` |
| 3 | `mfr_dagou_aokouduozhang` ↔ `mfr_lingshebu_tuoqiao` | 10000 | 改开至 6666 | `mfr_lingshebu_tuoqiao` 5：`ap_shoujueyin_tianchi→ap_yangqiao_shenmai`；6：`ap_shoujueyin_quze→ap_daimai_zhangmen` |
| 4 | `mfr_dagouzhen_shouwang` ↔ `mfr_jiuyin_buzu` | 10000 | 改开至 6666 | `mfr_jiuyin_buzu` 1：`ap_shoujueyin_quze→ap_renmai_shenque`；2：`ap_shoujueyin_tianchi→ap_zushaoyin_fuliu` |
| 5 | `mfr_yijinduangupian_tuotai` ↔ `mfr_duanshiyangshenggong_humai` | 10000 | 改开至 6000 | 同 #2 |
| 6 | `mfr_lanhuafuxueshou_jiuwan` ↔ `mfr_jiuyinshenzhao_wujian` | 10000 | 改开至 7500 | `mfr_lanhuafuxueshou_jiuwan` 1：`ap_renmai_qihai→ap_yinqiao_jiaoxin`；2：`ap_renmai_guanyuan→ap_yinqiao_zhaohai`；8：`ap_shoutaiyin_shaoshang→ap_shouyangming_hegu`。`mfr_jiuyinshenzhao_wujian` 10：`ap_shoujueyin_quze→ap_shouyangming_hegu` |
| 7 | `mfr_nizhuanjingmai_daozhuan` ↔ `mfr_jiuyinshenzhao_wujian` | 10000 | 改开至 5000 | `mfr_nizhuanjingmai_daozhuan` 1：`ap_shoutaiyin_yunmen→ap_renmai_huiyin`；2：`ap_shoutaiyin_chize→ap_renmai_qugu`。`mfr_jiuyinshenzhao_wujian` 同 #6 |
| 8 | `mfr_tanzhi_lianzhu` ↔ `mfr_lingshebu_tuoqiao` | 10000 | 改开至 6666 | `mfr_lingshebu_tuoqiao` 同 #3 |
| 9 | `mfr_shexinglifan_baibian` ↔ `mfr_tianlongchanbu_tuili` | 10000 | 改开至 6666 | `mfr_shexinglifan_baibian` 2：`ap_zushaoyin_taixi→ap_yangqiao_shenmai`；3：`ap_zutaiyang_weizhong→ap_zushaoyang_waiqiu` |
| 10 | `mfr_hama_quanjin` ↔ `mfr_anran_xiaohun` | 9000 | 改开至 6000 | `mfr_hama_quanjin` 2：`ap_zushaoyin_lingxu→ap_zushaoyin_dazhong`；3：`ap_zutaiyin_dabao→ap_zutaiyin_xuehai`；6：`ap_shoujueyin_daling→ap_shoujueyin_tianquan` |
| 11 | `mfr_hama_quanjin` ↔ `mfr_bixuegong_suoyuan` | 8750 | 改开至 5000 | `mfr_hama_quanjin` 同 #10 |
| 12 | `mfr_hama_quanjin` ↔ `mfr_pojunqiangfa_cuifeng` | 8750 | 改开至 5000 | `mfr_hama_quanjin` 同 #10 |
| 13 | `mfr_kurongchangong_fengchun` ↔ `mfr_jiayishengong_liehuo` | 8750 | 改开至 6250 | `mfr_kurongchangong_fengchun` 2：`ap_yangwei_benshen→ap_renmai_qihai`；6：`ap_zuyangming_jiache→ap_chongmai_huangshu` |
| 14 | `mfr_lanhuafuxueshou_jiuwan` ↔ `mfr_xuanming_rusi` | 8750 | 改开至 5000 | `mfr_lanhuafuxueshou_jiuwan` 同 #6 |
| 15 | `mfr_shexinglifan_baibian` ↔ `mfr_pojunqiangfa_xianzhen` | 8750 | 改开至 6250 | `mfr_shexinglifan_baibian` 同 #9 |
| 16 | `mfr_wumuyishu_hanshan` ↔ `mfr_biguqipian_guixi` | 8571 | 改开至 5714 | `mfr_wumuyishu_hanshan` 1：`ap_daimai_daimai→ap_yangwei_jinmen`；5：`ap_zushaoyin_taixi→ap_chongmai_shangqu` |
| 17 | `mfr_biluofengyan_yanbosan` ↔ `mfr_qimenfushou_nawan` | 8571 | 改开至 5714 | `mfr_biluofengyan_yanbosan` 1：`ap_dumai_mingmen→ap_yinwei_qimen`；2：`ap_daimai_daimai→ap_yinwei_tiantu` |
| 18 | `mfr_shoujinpian_suomai` ↔ `mfr_beiming_tianchi` | 8333 | 改开至 5000 | `mfr_shoujinpian_suomai` 1：`ap_chongmai_qichong→ap_shoujueyin_ximen`；3：`ap_zuyangming_zusanli→ap_shoujueyin_daling` |
| 19 | `mfr_bihai_chaosheng` ↔ `mfr_shoujinpian_suomai` | 8333 | 改开至 5000 | `mfr_shoujinpian_suomai` 同 #18 |
| 20 | `mfr_suohouqinnashou_qinlong` ↔ `mfr_douzhuan_xinghe` | 8333 | 改开至 5000 | `mfr_suohouqinnashou_qinlong` 2：`ap_chongmai_qichong→ap_dumai_yaoyangguan`；3：`ap_shoutaiyin_taiyuan→ap_shouyangming_pianli` |
| 21 | `mfr_tanzhi_tianhua` ↔ `mfr_fanliangyi_nizhuan` | 8333 | 改开至 3333 | `mfr_tanzhi_tianhua` 1：`ap_renmai_qihai→ap_renmai_huiyin`；2：`ap_renmai_guanyuan→ap_renmai_qugu`；3：`ap_renmai_zhongwan→ap_renmai_zhongji` |
| 22 | `mfr_jiuyin_buzu` ↔ `mfr_zhengliangyi_zhengqi` | 8333 | 改开至 5000 | `mfr_jiuyin_buzu` 同 #4 |
| 23 | `mfr_jiuyinliaoshangpian_biqi` ↔ `mfr_luohanzhen_shibaluohan` | 8333 | 改开至 5000 | `mfr_jiuyinliaoshangpian_biqi` 2：`ap_shoushaoyin_shenmen→ap_renmai_shenque`；3：`ap_zuyangming_zusanli→ap_shoujueyin_ximen` |
| 24 | `mfr_jiuyinliaoshangpian_biqi` ↔ `mfr_suxin_juan` | 8333 | 改开至 5000 | `mfr_jiuyinliaoshangpian_biqi` 同 #23 |
| 25 | `mfr_lingshequan_qianbian` ↔ `mfr_yushe_shidi` | 8333 | 改开至 5000 | `mfr_lingshequan_qianbian` 1：`ap_renmai_qihai→ap_yangqiao_jugu`；4：`ap_shoutaiyin_taiyuan→ap_shoushaoyang_zhigou` |
| 26 | `mfr_yijinduangupian_tuotai` ↔ `mfr_biguqipian_guixi` | 8000 | 改开至 4000 | `mfr_yijinduangupian_tuotai` 同 #2 |
| 27 | `mfr_bitaoxuangong_wanli` ↔ `mfr_shengsifu_ciyao` | 8000 | 改开至 4000 | `mfr_bitaoxuangong_wanli` 2：`ap_shoutaiyin_taiyuan→ap_chongmai_siman`；4：`ap_dumai_shendao→ap_chongmai_zhongzhu` |
| 28 | `mfr_bitaoxuangong_wanli` ↔ `mfr_tiebifangshen_sheshen` | 8000 | 改开至 4000 | `mfr_bitaoxuangong_wanli` 同 #27 |
| 29 | `mfr_bitaoxuangong_wanli` ↔ `mfr_tongshihenglian_yingqiao` | 8000 | 改开至 4000 | `mfr_bitaoxuangong_wanli` 同 #27 |
| 30 | `mfr_bitaoxuangong_wanli` ↔ `mfr_yihun_dingxin` | 8000 | 改开至 4000 | `mfr_bitaoxuangong_wanli` 同 #27 |

### 7.2 `--delivery` 命中数

| 规则 | 改前 | 改后 | 处理 |
|---|---:|---:|---|
| 拳 / 擒拿动作端点 | 8 | 0 | 在末 1–3 段补曲池、手三里或合谷 |
| 位移核心脉 / 涌泉 | 0 | 0 | 原本满足；修改后复核满足 |
| 护体 / 蓄气任督 | 1 | 0 | `mfr_nizhuanjingmai_daozhuan` 增会阴、曲骨 |
| 非绝招外放合法端点 | 0 | 0 | 36 条普通外放路线均通过 |
| 动作端点尾段提示 | 0 | 0 | 无 |
| 性质冲突（只报告） | 28 | 28 | 按任务要求不改，清单见 §4 |
| 未分类路线 | 17 | 17 | 无可靠动作分类，不硬套规则 |
| 一般违规合计 | 9 | 0 | 全部修复 |

### 7.3 改过的路线清单

`CT` 记作 `ΣsegmentCt / recovery / 合计`；“风险未变”表示逐段槽位和值均与改前一致。

| 路线 | 段数 | CT | 风险是否变化 |
|---|---:|---:|---|
| `mfr_jiuyinshenzhao_shounao` | 10 | `800 / 1200 / 2000` | 未变 |
| `mfr_yijinduangupian_tuotai` | 5 | `425 / 1200 / 1625` | 未变 |
| `mfr_lingshebu_tuoqiao` | 6 | `390 / 1200 / 1590` | 未变 |
| `mfr_jiuyin_buzu` | 6 | `540 / 1200 / 1740` | 未变 |
| `mfr_lanhuafuxueshou_jiuwan` | 8 | `640 / 1200 / 1840` | 未变 |
| `mfr_nizhuanjingmai_daozhuan` | 6 | `540 / 1200 / 1740` | 未变 |
| `mfr_shexinglifan_baibian` | 8 | `560 / 1200 / 1760` | 未变 |
| `mfr_hama_quanjin` | 10 | `800 / 1200 / 2000` | 未变 |
| `mfr_kurongchangong_fengchun` | 8 | `720 / 1200 / 1920` | 未变 |
| `mfr_wumuyishu_hanshan` | 7 | `525 / 1200 / 1725` | 未变 |
| `mfr_biluofengyan_yanbosan` | 7 | `525 / 1200 / 1725` | 未变 |
| `mfr_shoujinpian_suomai` | 6 | `510 / 1200 / 1710` | 未变 |
| `mfr_suohouqinnashou_qinlong` | 6 | `510 / 1200 / 1710` | 未变 |
| `mfr_tanzhi_tianhua` | 10 | `800 / 1200 / 2000` | 未变 |
| `mfr_jiuyinliaoshangpian_biqi` | 6 | `510 / 1200 / 1710` | 未变 |
| `mfr_lingshequan_qianbian` | 8 | `600 / 1200 / 1800` | 未变 |
| `mfr_bitaoxuangong_wanli` | 5 | `425 / 1200 / 1625` | 未变 |
| `mfr_lanhuafuxueshou_qinna` | 8 | `720 / 1200 / 1920` | 未变 |
| `mfr_jiuyinshenzhao_wujian` | 10 | `800 / 1200 / 2000` | 未变 |
| `mfr_kongming_dongsong` | 7 | `525 / 1200 / 1725` | 未变 |
| `mfr_jiuyinbaigu_guimei` | 8 | `600 / 1200 / 1800` | 未变 |
| `mfr_jiuyinbaigu_suoming` | 8 | `600 / 1200 / 1800` | 未变 |
| `mfr_dafumoquan_dafumo` | 8 | `720 / 1200 / 1920` | 未变 |

### 7.4 交其他任务的条目

- `gulong`：`mfr_tangmenbidu_shoumai` ↔ `mfr_jiuyinshenzhao_shounao` 改后仍为 `8333 bp`；它是快照已有且归 `gulong` 的配对，不是本任务新造。
- 其余仍涉及五绝路线的 ≥80% 配对均已有快照归属，未擅改“另一侧”；本任务自身未新造任何 ≥80% 配对。

### 7.5 验收项与命令

- ✅ 30 对逐对处理：`check_nr3_unit.py wujue` 报“已改开 30，已写理由 0，未处理 0，本任务新造 ≥80% 配对 0”。
- ✅ 动作末端与出招方式：delivery 一般违规 0、尾段违规 0、普通外放违规 0；未靠更改出招方式规避。
- ✅ 路线完整性：段数未缩短，CT / 风险槽位对齐，所有穴位已登记，路线内无重复穴位。
- ✅ 同门与全仓互异：同武学共享 ≤50%，无轮换 / 逆序；`check_route_unique_for.py` 报完全相同路线 0。
- ✅ 镜像同步：文首展开为唯一穴位序列；§0.12 保持“见文首索引”，并在 §0.12.5 逐路复核段数、ΣCT、收招与风险。
- ✅ 人声字段：已按 05 的 `MoveDef.voice` 口径补明确人声 / 持箫招；未新增 ID。
- ⚠️ 性质冲突 28 条按明确任务边界保留，未当作失败；见 §4 和图鉴 O-13。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0；仅报告仓库既有基线 `sk_babuganchan`，本次新增问题 0。
- ✅ `python3 -m unittest discover -s tools/lint -p "test_*.py"`：145 项通过。
- ✅ `python3 tools/balance/damage_sim.py --check`：47 项通过，known deviations 0。
- ✅ `python3 tools/balance/meridian_flow_sim.py --check`：通过。
- ✅ `python3 tools/balance/projection_sim.py --check`：通过。
- ✅ `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-wujue.md`：`errors=0`；89 条路线、89 条不同序列、册内与跨册 ≥80% 均为 0（定向口径）。
- ✅ `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-wujue.md`：完全相同路线 0。
- ✅ `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-wujue.md`：未定义引用 0。
- ✅ `python3 tools/agents/check_nr3_unit.py wujue`：30/30 改开，未处理 0，新造 ≥80% 配对 0。
- 返修：§0.12.5 四处说明文字已与路线穴位对齐（兰花救腕、灵蛇拳巨骨、肓俞错字、碧落天突措辞）。
