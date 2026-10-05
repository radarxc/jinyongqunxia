# LINT-outlets 报告 · 检查脚本维护 · 路线出口剥离与普通路线唯一性（NR4 交来）

## 1. 摘要（3–6 行）

- 已补位移、内功／护体／蓄气、人声音功及拳法／持械出口识别，只剥离实际命中动作规则的尾三段节点。
- 已隔离普通路线步骤与端点提示，并补黄阶一行内功卡解析；全仓内功覆盖从 254/254 增至 265/265。
- 新增显式普通路线全仓比较：654 条绝招＋207 条普通路线，发现 4 对完全重复、182 对非完全相同的 ≥80% 配对。
- 三种 strict 模式的 stdout、stderr 与退出码均与修前一致；四项指定门禁通过。
- 重测 12 个 NR4 单元后新增 3 条路线性质冲突；完整命中清单交协调者另派图鉴任务，本次未修改 docs。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要内容 |
|---|---:|---|
| `tools/lint/check_skill_catalogs.py` | 3688 | 动作分类、出口剥离、显式序列提取、黄阶内功覆盖 |
| `tools/lint/test_check_skill_catalogs.py` | 2541 | 出口／解析／普通路线唯一性回归 |
| `tools/lint/README.md` | 394 | 普通路线命令、严格模式边界、出口与覆盖说明 |
| `tools/agents/check_route_unique_for.py` | 248 | 全仓普通／绝招配对、JSON、`--all`、`--strict-normal` |
| `tools/agents/reports/LINT-outlets.md` | 363 | 条文依据、逐字节证据、12 单元复测、完整配对清单与交办 |

`check_nr4_unit.py` 原有三项输出已能准确显示新增命中，故无需修改。未新增正式武学、招式或路线 ID；无运行 ID 的显式局部配置仅用 `derived:<mv>`／`local:<sk>:<行号>` 作报告标签。

## 3. 关键结论与数值

- 路线性质仍按 `design/21` §2.4 对体段逐节点计票，先查 `design/15` 游戏归属经脉；阴阳多数决，平票取调和。出口判定不读取武学性质，也不固定删除最后三段。
- 位移出口为尾段中游戏归属足少阳／带脉／阳跷的节点或涌泉；内功、护体、疗伤、蓄气出口为尾段中的任督节点；人声音功另按显式 `voice` 优先规则使用天突／廉泉。
- 普通路线重合率沿用 `floor(10000×|set(A)∩set(B)|/min(|set(A)|,|set(B)|))`；不同武学才配对，`8000 bp` 含边界，重排只算相似。有序签名完全相同才算重复。
- 普通相关 ≥80% 共 `168（绝招对普通）＋18（普通对普通）＝186` 对，其中完全重复 `1＋3＝4` 对，非完全相同 `186−4＝182` 对。绝招对绝招仍为 0 对。
- `--strict-normal` 仅把涉及普通路线的完全重复升级为退出 1；默认与高相似均只报告，原绝招完全重复仍失败。共享模板绑定不展开，明确写全的专属覆写和派生步骤纳入。
- 内功覆盖新增 `5（倚天黄阶）＋6（通行黄阶）＝11` 张，`254＋11＝265`；缺 `inner.meridians` 与内功性质冲突均为 0。显式 `[]` 仍有别于缺字段。
- `--delivery` 正式统计的普通外放显式路线由 94 纠正为 32；剔除 61 条仅有模板端点提示及 1 条缺完整步骤的记录，另有 11 条真实路线不再重复拼入端点提示。此分母纠正不代表图鉴删去招式。

## 4. 开放问题（附默认值）

| 事项 | 默认值 | 处理 |
|---|---|---|
| AR-18a：冲脉／带脉是否投阴阳票 | 不投票；只含调和脉则取 harmony | 沿用上游待作者确认项；本次不改 |
| AR-18b：后溪是否纳入外放 13 穴 | 不纳入；可作掌刃动作出口 | 沿用上游待作者确认项；本次不改 |
| 模板绑定普通路线是否必须互异 | 不要求；只检查显式普通序列 | 沿用 2026-09-29 协调者裁定，作者可复核 |
| 新发现的重复／高相似与性质冲突如何处置 | 保留图鉴现状，由协调者另派内容任务 | 高相似按 21 §4.3.4 复核共同底子与动作差异，不自动认定 182 对都须改穴 |

没有新增必须等待作者拍板的工具规则。既有默认值均继续执行，不因待确认而暂停检查。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案。Canon v1.8 V18-01／V18-03、AR-18、`design/21` §2.4／§4.3.1／§4.4.1.4 已提供出口与性质依据；普通模板豁免按本任务给定裁定执行。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需另派处理 |
|---|---|---|
| `docs/design/catalog/skills-yitian.md` | 第 60 行 `mfr_xuanmingxinfa_ningshuang` | 体段变为阳，声明阴；按 §7.5 的体段核算复核配路 |
| `docs/design/catalog/skills-bulu-01-tianlong.md` | 第 25 行 `mfr_xianglongxinggong_tianxing` | 体段变为阴，声明阳；复核蓄气／护体末端与体段 |
| `docs/design/catalog/skills-bulu-05-xiaoao.md` | 第 21 行 `mfr_huashanziqijue_yingfeng` | 体段变为阴，声明阳；复核蓄气／护体末端与体段 |
| `docs/design/catalog/skills-daojia.md` | 第 31 行 `mfr_bingpoyinzhen_shehun` | 实体银针持械动作未含任何腕／导引端点；见 §7.5，另派核对配路 |
| 本报告 §7.4 所列图鉴 | 4 对完全重复、182 对其他高相似的双方位置 | 完全重复安排改线；高相似逐对审查或补叙事说明；不得仅改 ID／CT／风险规避 |
| `docs/design/catalog/skills-wujue.md` | 第 291 行、§2.3 第 699 行 `mfr_xianglong18_lishe` | 宣称显式七段但未找到完整 `ap_*` 序列；补正式步骤或明确唯一归属引用，当前不拿内关／劳宫提示替代七段 |
| `tools/agents/check_nr3_unit.py` 及后续调度验收配置 | 普通路线与跨类回归 | 继续保留原绝招快照门禁，另调用本次 `check_route_unique_for.py`；该脚本不在本任务写集内 |
| `tools/agents/reports/NR4-*.md` 的后续汇总 | 历史“全仓唯一／≥80% 清零”及解析缺口 | 保留旧报告，汇总时注明旧值限当时绝招／漏采口径，改用本报告全量显式普通路线清单 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 剥离规则与解析依据

- ✅ `author-requirements.md` AR-18 执行口径、Canon V18-03、`design/21` §2.4 第 1–4 条：只剥离末端 1–3 段实际动作出口，体段逐节点投票，不按经脉去重。
- ✅ `design/21` §4.3.1 表的拳／擒拿、持械、轻功、内功行：拳以曲池／手三里／合谷为出口；持械以腕骨／阳谷／阳池／外关／合谷为出口；位移按足少阳／带脉／阳跷或涌泉，内功按任督。
- ✅ `design/21` §4.4.1.4：人声另可取天突／廉泉；`voice:false` 覆盖旧人声兼容名单，不把乐器或未知类型自动视为人声。
- ✅ 真实动作依据：少林第 814 行简述“各持长索”；第 1371 行心意把路线动作“成拳”；逍遥水榭飞刀的暗器类型和实体飞刀说明。泛拳掌、杂学阵法、毒烟／毒虫不足以猜出招方式。
- ✅ 回归覆盖各类出口在尾段不投票、同穴在体段照常投票，尾段非出口保留；位移按游戏归属而非 ID 前缀；显式 voice 优先；前置／出处不提供动作证据。
- ✅ 普通路线只采步骤列或明确序列链，不拼端点说明；真实步骤中的重复节点保留。普通外放与非外放均进入新唯一性工具，`--delivery` 性质范围仍为绝招＋显式普通外放。
- ✅ 黄阶一行卡、英文／中文括号、显式空主修数组、缺字段、错性质均有回归；倚天与通行真实图鉴另做覆盖断言。

### 7.2 三种 strict 输出逐字节不变

默认／多样性组合在修改前用 `subprocess.run(..., capture_output=True)` 保存原始 stdout／stderr 字节与退出码，修改后原参数重跑；`--strict --details` 的修前基线另由只读 `git show HEAD:tools/lint/check_skill_catalogs.py` 恢复源码，以原 `__file__` 和未变图鉴执行，再与终态重跑比较。均以 `read_bytes()==stdout/stderr` 直接比对，不排序、不过滤、不去空白。前三行对应 NYY 历史验收的三种模式，最后一行是额外组合；SHA-256 均为修前／修后的 stdout 共同值，stderr 均为 0 字节，退出码均为 `0→0`。

| 参数 | stdout 字节数（前＝后） | SHA-256（前＝后） | 比较 |
|---|---:|---|---|
| `--strict` | 6780 | `e782d2f2901e5d334e137852357bcb96073f59c7ddef89cf970db32e6a211448` | ✅ stdout／stderr 完全相同 |
| `--strict --details` | 6780 | `e782d2f2901e5d334e137852357bcb96073f59c7ddef89cf970db32e6a211448` | ✅ stdout／stderr 完全相同 |
| `--strict --diversity-strict` | 11556 | `700ecb1e9942cec5a2837fd7efc49dd7f249c49c5c566a39aa7d44a35d18a980` | ✅ stdout／stderr 完全相同 |
| `--strict --diversity`（额外） | 11556 | `700ecb1e9942cec5a2837fd7efc49dd7f249c49c5c566a39aa7d44a35d18a980` | ✅ stdout／stderr 完全相同 |

本次会话原始证据位于 `/tmp/LINT-outlets-baseline/` 与 `/tmp/LINT-outlets-final/`，各含 `manifest.json`、逐命令 stdout／stderr；临时目录不作为长期交付依赖，本报告保留复核所需参数、哈希和完整命中清单。

### 7.3 全部 12 单元三项改前／改后

每个单元改前、改后均已执行 `python3 tools/agents/check_nr4_unit.py <本单元图鉴路径>`；补录单元一次传入全部 14 个 `skills-bulu-*.md`。以下固定顺序为“路线性质冲突／缺主修经脉／内功性质冲突”，补录按 14 册求和。

| 单元 | 三项改前 | 三项改后 | 内功覆盖前→后 | NR4 退出码前→后 |
|---|---|---|---|---|
| shaolin | 0 / 0 / 0 | 0 / 0 / 0 | 12/12 → 12/12 | 0 → 0 |
| wujue | 0 / 0 / 0 | 0 / 0 / 0 | 29/29 → 29/29 | 0 → 0 |
| daojia | 0 / 0 / 0 | 0 / 0 / 0 | 23/23 → 23/23 | 0 → 0 |
| xiaoyao | 0 / 0 / 0 | 0 / 0 / 0 | 23/23 → 23/23 | 0 → 0 |
| yitian | 0 / 0 / 0 | 1 / 0 / 0 | 13/13 → 18/18 | 0 → 1 |
| xiake-bixue | 0 / 0 / 0 | 0 / 0 / 0 | 23/23 → 23/23 | 0 → 0 |
| wuyue | 0 / 0 / 0 | 0 / 0 / 0 | 21/21 → 21/21 | 0 → 0 |
| kangxi | 0 / 0 / 0 | 0 / 0 / 0 | 16/16 → 16/16 | 0 → 0 |
| qianlong | 0 / 0 / 0 | 0 / 0 / 0 | 11/11 → 11/11 | 0 → 0 |
| general | 0 / 0 / 0 | 0 / 0 / 0 | 8/8 → 14/14 | 0 → 0 |
| gulong | 0 / 0 / 0 | 0 / 0 / 0 | 9/9 → 9/9 | 0 → 0 |
| bulu | 0 / 0 / 0 | 2 / 0 / 0 | 66/66 → 66/66 | 0 → 1 |

⚠️ 倚天与补录单元的新失败如实保留。补录新增两条分别属于 bulu-01、bulu-05，其余 12 个补录册三项仍全为 0；25 个实际图鉴文件全部已扫描。没有通过修改图鉴或增加豁免保持清零。

### 7.4 全仓普通路线重复／相似清单

命令：`python3 tools/agents/check_route_unique_for.py --all --json`，默认退出 0；同范围加 `--strict-normal` 退出 1，原因是下列 4 对完全重复。共享模板未展开。以下位置缩写 `册名:行号` 均指 `docs/design/catalog/skills-<册名>.md`；“绝／普”表示绝招／显式普通路线。报告列出全部 186 对，每对一次。

#### 7.4.1 完全相同：4 对

| 编号 | 路线 A（位置） | 路线 B（位置） | 类别 | 交集／较短路线 | bp |
|---|---|---|---|---|---:|
| E01 | `mfr_songshankaihezhang_shouyue`（bulu-05-xiaoao:64） | `mfr_renwoxingzhang_huizhen`（bulu-05-xiaoao:66） | 普／普 | 4/4 | 10000 |
| E02 | `mfr_shanzongzhengqigong_huzhen`（bulu-07-bixue:60） | `mfr_hasakeyunqi_wenshen`（bulu-10-baima:45） | 普／普 | 4/4 | 10000 |
| E03 | `mfr_taijiquan_rufeng`（daojia:2292） | `mfr_dagouzhen_shouwang`（wujue:25） | 普／绝 | 6/6 | 10000 |
| E04 | `mfr_qixianwuxingjian_fanyin`（wuyue:1454） | `mfr_bizhenqingzhang_qingzhang`（xiake-bixue:1443） | 普／普 | 4/4 | 10000 |

#### 7.4.2 非完全相同的 ≥80%：182 对

⚠️ 下列是人工复核清单；阈值沿用 21 §4.3.4，不代表已逐对确认设计不合理。共同阴阳性质本身不能作为理由；应核对共同门派／内功底子与动作端点、职责差异。

降龙外部定义以 `design/21:行号` 标记，实际文件为 `docs/design/21-meridian-flow-and-moves.md`。

| 编号 | 路线 A（位置） | 路线 B（位置） | 类别 | 交集／较短路线 | bp |
|---|---|---|---|---|---:|
| W001 | `mfr_xianglong18_zhenjing`（design/21:1467） | `mfr_shanzongzhengqigong_zhengxi`（bulu-07-bixue:59） | 绝／普 | 4/4 | 10000 |
| W002 | `mfr_xianglong18_zhenjing`（design/21:1467） | `mfr_hasakeyunqi_changxi`（bulu-10-baima:44） | 绝／普 | 4/4 | 10000 |
| W003 | `mfr_xianglong18_zhenjing`（design/21:1467） | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | 绝／普 | 4/5 | 8000 |
| W004 | `mfr_duanshiyangjue_yiyang`（bulu-01-tianlong:21） | `mfr_taohuaguiyuanjue_lixi`（bulu-02-shediao:42） | 绝／普 | 5/5 | 10000 |
| W005 | `mfr_duanshiyangjue_zhouliu`（bulu-01-tianlong:22） | `mfr_bosishenghuoxuangong_zhuanhuan`（bulu-04-yitian:45） | 绝／普 | 4/5 | 8000 |
| W006 | `mfr_xianglongxinggong_honglu`（bulu-01-tianlong:23） | `mfr_duanshiyangjue_yangqi`（bulu-01-tianlong:44） | 绝／普 | 4/5 | 8000 |
| W007 | `mfr_xianglongxinggong_honglu`（bulu-01-tianlong:23） | `mfr_huashanqigong07_tiaoxi`（bulu-07-bixue:71） | 绝／普 | 4/4 | 10000 |
| W008 | `mfr_xianglongxinggong_tianxing`（bulu-01-tianlong:25） | `mfr_quanzhenzhoutiangong_shouyi`（bulu-02-shediao:44） | 绝／普 | 4/5 | 8000 |
| W009 | `mfr_tianshanliuyangxinfa_hemai`（bulu-01-tianlong:26） | `mfr_xianglongxinggong_xushi`（bulu-01-tianlong:47） | 绝／普 | 5/6 | 8333 |
| W010 | `mfr_duanshiyangjue_yangqi`（bulu-01-tianlong:44） | `mfr_jinlongbangxinfa_dingzhuang`（bulu-07-bixue:23） | 普／绝 | 4/5 | 8000 |
| W011 | `mfr_duanshiyangjue_yangqi`（bulu-01-tianlong:44） | `mfr_xixing_sangong`（wuyue:38） | 普／绝 | 4/5 | 8000 |
| W012 | `mfr_xianglongxinggong_huti`（bulu-01-tianlong:48） | `mfr_mingjiaohujiaogong_huguang`（bulu-04-yitian:23） | 普／绝 | 5/6 | 8333 |
| W013 | `mfr_tianshanliuyangxinfa_huanxi`（bulu-01-tianlong:50） | `mfr_taohuaguiyuanjue_guanchao`（bulu-02-shediao:27） | 普／绝 | 6/7 | 8571 |
| W014 | `mfr_jiuyinxieliangong_huizhen`（bulu-02-shediao:22） | `mfr_zhentiansanshizhang_dieshi`（bulu-11-yuanyang:67） | 绝／普 | 5/6 | 8333 |
| W015 | `mfr_gaibangjuyigong_tongpao`（bulu-02-shediao:23） | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | 绝／普 | 4/5 | 8000 |
| W016 | `mfr_gaibangjuyigong_tongpao`（bulu-02-shediao:23） | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | 绝／普 | 4/5 | 8000 |
| W017 | `mfr_tiezhangyunqigong_lianbi`（bulu-02-shediao:24） | `mfr_jindaoheijianjue_heifeng`（bulu-03-shendiao:51） | 绝／普 | 4/5 | 8000 |
| W018 | `mfr_tiezhangyunqigong_lianbi`（bulu-02-shediao:24） | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | 绝／普 | 4/5 | 8000 |
| W019 | `mfr_taohuaguiyuanjue_guanchao`（bulu-02-shediao:27） | `mfr_bosishenghuoxuangong_zhuanhuan`（bulu-04-yitian:45） | 绝／普 | 4/5 | 8000 |
| W020 | `mfr_gaibangjuyigong_jieyi`（bulu-02-shediao:37） | `mfr_pojunqiangfa_cuifeng`（general:24） | 普／绝 | 4/5 | 8000 |
| W021 | `mfr_gaibangjuyigong_jieyi`（bulu-02-shediao:37） | `mfr_lingshezhangfa_chan`（wujue:39） | 普／绝 | 4/5 | 8000 |
| W022 | `mfr_gaibangjuyigong_jieyi`（bulu-02-shediao:37） | `mfr_zhengoubang_huilan`（wujue:85） | 普／绝 | 4/5 | 8000 |
| W023 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_huashanliangyixinfa04_huanyuan`（bulu-04-yitian:35） | 普／绝 | 4/5 | 8000 |
| W024 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_songshanzhenqi_songyue`（bulu-05-xiaoao:24） | 普／绝 | 4/5 | 8000 |
| W025 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_huashanqigong07_yangzhang`（bulu-07-bixue:25） | 普／绝 | 5/5 | 10000 |
| W026 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | 普／普 | 4/4 | 10000 |
| W027 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_huashanqigong07_tuizhang`（bulu-07-bixue:72） | 普／普 | 4/4 | 10000 |
| W028 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_tiedanzhuangquan_zhenmen`（bulu-12-shujian:22） | 普／绝 | 4/5 | 8000 |
| W029 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_huzhaojuehushou_juehu`（daojia:52） | 普／绝 | 5/5 | 10000 |
| W030 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_zhenwuqijie_guishe`（daojia:59） | 普／绝 | 4/5 | 8000 |
| W031 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_dajingangquan_yinu`（shaolin:31） | 普／绝 | 4/5 | 8000 |
| W032 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_longzhaoshou_daoxu`（shaolin:48） | 普／绝 | 4/5 | 8000 |
| W033 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_shizihou_pozhen`（shaolin:1291） | 普／普 | 4/5 | 8000 |
| W034 | `mfr_tiezhangyunqigong_tuna`（bulu-02-shediao:38） | `mfr_jiuyin_sunyouyu`（wujue:57） | 普／绝 | 4/5 | 8000 |
| W035 | `mfr_taohuaguiyuanjue_huti`（bulu-02-shediao:43） | `mfr_huashanziqijue_yingfeng`（bulu-05-xiaoao:21） | 普／绝 | 6/6 | 10000 |
| W036 | `mfr_taohuaguiyuanjue_huti`（bulu-02-shediao:43） | `mfr_huashanziqijue_tuna`（bulu-05-xiaoao:42） | 普／普 | 4/5 | 8000 |
| W037 | `mfr_taohuaguiyuanjue_huti`（bulu-02-shediao:43） | `mfr_huashanqigong07_baoyuan`（bulu-07-bixue:73） | 普／普 | 4/4 | 10000 |
| W038 | `mfr_taohuaguiyuanjue_huti`（bulu-02-shediao:43） | `mfr_luohanfumo_huti`（xiake-bixue:26） | 普／绝 | 5/6 | 8333 |
| W039 | `mfr_quanzhenzhoutiangong_shouyi`（bulu-02-shediao:44） | `mfr_xianduyunqi_shouzheng`（bulu-07-bixue:24） | 普／绝 | 4/5 | 8000 |
| W040 | `mfr_chiliandugong_duhuo`（bulu-03-shendiao:23） | `mfr_huagumianzhang_geyi`（kangxi:1344） | 绝／普 | 4/5 | 8000 |
| W041 | `mfr_jueqingbixuejue_bixue`（bulu-03-shendiao:26） | `mfr_shiliangwuxinggong_naqi`（bulu-07-bixue:62） | 绝／普 | 4/4 | 10000 |
| W042 | `mfr_jinganghufagong_huti`（bulu-03-shendiao:30） | `mfr_wudangjiemaishou_huantiao`（daojia:2215） | 绝／普 | 5/6 | 8333 |
| W043 | `mfr_chiliandugong_tiaodu`（bulu-03-shendiao:44） | `mfr_qingchengyunqi_cuixin`（bulu-05-xiaoao:23） | 普／绝 | 4/5 | 8000 |
| W044 | `mfr_chiliandugong_tiaodu`（bulu-03-shendiao:44） | `mfr_huahuixinfa_shoucang`（bulu-10-baima:21） | 普／绝 | 4/5 | 8000 |
| W045 | `mfr_chiliandugong_tiaodu`（bulu-03-shendiao:44） | `mfr_qingxinqupu_wanlai`（general:38） | 普／绝 | 5/5 | 10000 |
| W046 | `mfr_chiliandugong_cuidu`（bulu-03-shendiao:45） | `mfr_wuxianbaidugong_wangu`（wuyue:49） | 普／绝 | 4/5 | 8000 |
| W047 | `mfr_chiliandugong_cuidu`（bulu-03-shendiao:45） | `mfr_liuyangzhang_liuyang`（xiaoyao:28） | 普／绝 | 4/5 | 8000 |
| W048 | `mfr_jueqingbixuejue_shouxin`（bulu-03-shendiao:48） | `mfr_xuanminghanyuangong_hanbi`（bulu-04-yitian:21） | 普／绝 | 4/4 | 10000 |
| W049 | `mfr_jueqingbixuejue_shouxin`（bulu-03-shendiao:48） | `mfr_shiliangwuxinggong_naqi`（bulu-07-bixue:62） | 普／普 | 4/4 | 10000 |
| W050 | `mfr_jindaoheijianjue_jinpi`（bulu-03-shendiao:50） | `mfr_heibaijianfa_heguang`（xiake-bixue:31） | 普／绝 | 4/5 | 8000 |
| W051 | `mfr_jinganghufagong_jingang`（bulu-03-shendiao:52） | `mfr_shanzongzhengqigong_shouzhen`（bulu-07-bixue:21） | 普／绝 | 4/4 | 10000 |
| W052 | `mfr_jinganghufagong_jingang`（bulu-03-shendiao:52） | `mfr_huashanqigong07_yangzhang`（bulu-07-bixue:25） | 普／绝 | 4/4 | 10000 |
| W053 | `mfr_caoyuanjunzhenxinfa_zhengqi`（bulu-03-shendiao:56） | `mfr_liuyangzhang_bafu`（xiaoyao:27） | 普／绝 | 4/4 | 10000 |
| W054 | `mfr_xuanminghanyuangong_hanbi`（bulu-04-yitian:21） | `mfr_shiliangwuxinggong_naqi`（bulu-07-bixue:62） | 绝／普 | 4/4 | 10000 |
| W055 | `mfr_xuanminghanyuangong_shuangyuan`（bulu-04-yitian:22） | `mfr_qingchengyunqi_cangjin`（bulu-05-xiaoao:46） | 绝／普 | 4/4 | 10000 |
| W056 | `mfr_xuanminghanyuangong_shuangyuan`（bulu-04-yitian:22） | `mfr_tianlonghezongjian_dianjian`（bulu-13-feihu:52） | 绝／普 | 4/5 | 8000 |
| W057 | `mfr_huashanliangyixinfa04_huanyuan`（bulu-04-yitian:35） | `mfr_huashanqigong07_tuizhang`（bulu-07-bixue:72） | 绝／普 | 4/4 | 10000 |
| W058 | `mfr_xuanminghanyuangong_tuna`（bulu-04-yitian:47） | `mfr_hanbingzhenqi_fengmai`（wuyue:31） | 普／绝 | 4/5 | 8000 |
| W059 | `mfr_xuanminghanyuangong_ningyuan`（bulu-04-yitian:48） | `mfr_qingchengyunqi_cuixin`（bulu-05-xiaoao:23） | 普／绝 | 4/5 | 8000 |
| W060 | `mfr_huashanziqijue_yingfeng`（bulu-05-xiaoao:21） | `mfr_songshanzhenqi_yunqi`（bulu-05-xiaoao:49） | 绝／普 | 4/4 | 10000 |
| W061 | `mfr_huashanziqijue_yingfeng`（bulu-05-xiaoao:21） | `mfr_huashanqigong07_baoyuan`（bulu-07-bixue:73） | 绝／普 | 4/4 | 10000 |
| W062 | `mfr_huashanziqijue_guiyuan`（bulu-05-xiaoao:22） | `mfr_shanzongzhengqigong_huzhen`（bulu-07-bixue:60） | 绝／普 | 4/4 | 10000 |
| W063 | `mfr_huashanziqijue_guiyuan`（bulu-05-xiaoao:22） | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | 绝／普 | 5/5 | 10000 |
| W064 | `mfr_huashanziqijue_guiyuan`（bulu-05-xiaoao:22） | `mfr_hasakeyunqi_wenshen`（bulu-10-baima:45） | 绝／普 | 4/4 | 10000 |
| W065 | `mfr_songshankaihezhang_yazhen`（bulu-05-xiaoao:27） | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | 绝／普 | 4/5 | 8000 |
| W066 | `mfr_renwoxingzhang_zhenbi`（bulu-05-xiaoao:28） | `mfr_songshankaihezhang_shouyue`（bulu-05-xiaoao:64） | 绝／普 | 4/4 | 10000 |
| W067 | `mfr_huashanziqijue_yunqi`（bulu-05-xiaoao:43） | `mfr_kaimenpiguaquan_kaihe`（general:30） | 普／绝 | 4/5 | 8000 |
| W068 | `mfr_huashanziqijue_yunqi`（bulu-05-xiaoao:43） | `mfr_hujiaquan_quandao`（qianlong:31） | 普／绝 | 4/5 | 8000 |
| W069 | `mfr_huashanziqijue_yunqi`（bulu-05-xiaoao:43） | `mfr_jiuyang_huti`（yitian:21） | 普／绝 | 4/5 | 8000 |
| W070 | `mfr_qingchengyunqi_yunxi`（bulu-05-xiaoao:45） | `mfr_bukuhutiaogong_hushen`（bulu-08-luding:25） | 普／绝 | 4/4 | 10000 |
| W071 | `mfr_qingchengyunqi_yunxi`（bulu-05-xiaoao:45） | `mfr_cangfengxingqi_huming`（bulu-14-xueshan:19） | 普／绝 | 4/4 | 10000 |
| W072 | `mfr_qingchengyunqi_yunxi`（bulu-05-xiaoao:45） | `mfr_hanbingzhenqi_fengmai`（wuyue:31） | 普／绝 | 4/4 | 10000 |
| W073 | `mfr_qingchengyunqi_zhangzhu`（bulu-05-xiaoao:48） | `mfr_hanbingzhenqi_fengyue`（wuyue:32） | 普／绝 | 4/4 | 10000 |
| W074 | `mfr_jianzongxingqi_suijian`（bulu-05-xiaoao:54） | `mfr_tiejianjianfa_manpan`（xiake-bixue:38） | 普／绝 | 4/4 | 10000 |
| W075 | `mfr_songshankaihezhang_kaimen`（bulu-05-xiaoao:61） | `mfr_taijiquan_yunshou`（daojia:47） | 普／绝 | 4/4 | 10000 |
| W076 | `mfr_songshankaihezhang_kaimen`（bulu-05-xiaoao:61） | `mfr_fantianzhang_fudi`（wuyue:47） | 普／绝 | 4/4 | 10000 |
| W077 | `mfr_songshankaihezhang_kaimen`（bulu-05-xiaoao:61） | `mfr_luohanfumo_zhuxiang`（xiake-bixue:27） | 普／绝 | 4/4 | 10000 |
| W078 | `mfr_renwoxingzhang_zhiqu`（bulu-05-xiaoao:65） | `mfr_wuxianduzhang_huifengduwu`（wuyue:63） | 普／绝 | 4/4 | 10000 |
| W079 | `mfr_renwoxingzhang_pozhen`（bulu-05-xiaoao:67） | `mfr_luohanfumo_zhuxiang`（xiake-bixue:27） | 普／绝 | 4/4 | 10000 |
| W080 | `mfr_renwoxingzhang_shouna`（bulu-05-xiaoao:68） | `mfr_huahuixinfa_shoucang`（bulu-10-baima:21） | 普／绝 | 4/4 | 10000 |
| W081 | `mfr_motianyunqi_cuijin`（bulu-06-xiake:50） | `mfr_tiezhang_qingtian`（wujue:74） | 普／绝 | 4/4 | 10000 |
| W082 | `mfr_motianyunqi_cuijin`（bulu-06-xiake:50） | `mfr_luohanfumo_zhuxiang`（xiake-bixue:27） | 普／绝 | 4/4 | 10000 |
| W083 | `mfr_motianyunqi_cuijin`（bulu-06-xiake:50） | `mfr_huoyandao_fentian`（xiaoyao:47） | 普／绝 | 4/4 | 10000 |
| W084 | `mfr_dingshiqinna_fanguan`（bulu-06-xiake:59） | `mfr_dugu9_poqi`（wuyue:25） | 普／绝 | 4/4 | 10000 |
| W085 | `mfr_shanzongzhengqigong_shouzhen`（bulu-07-bixue:21） | `mfr_huashanqigong07_tiaoxi`（bulu-07-bixue:71） | 绝／普 | 4/4 | 10000 |
| W086 | `mfr_shanzongzhengqigong_shouzhen`（bulu-07-bixue:21） | `mfr_hasakeyunqi_changxi`（bulu-10-baima:44） | 绝／普 | 4/4 | 10000 |
| W087 | `mfr_shiliangwuxinggong_hezhen`（bulu-07-bixue:22） | `mfr_jinlongbangxinfa_shoushi`（bulu-07-bixue:66） | 绝／普 | 4/4 | 10000 |
| W088 | `mfr_huashanqigong07_yangzhang`（bulu-07-bixue:25） | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | 绝／普 | 4/4 | 10000 |
| W089 | `mfr_huashanqigong07_yangzhang`（bulu-07-bixue:25） | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | 绝／普 | 4/5 | 8000 |
| W090 | `mfr_minggonghuyuangong_gongwei`（bulu-07-bixue:29） | `mfr_shanzongzhengqigong_huzhen`（bulu-07-bixue:60） | 绝／普 | 4/4 | 10000 |
| W091 | `mfr_minggonghuyuangong_gongwei`（bulu-07-bixue:29） | `mfr_hasakeyunqi_wenshen`（bulu-10-baima:45） | 绝／普 | 4/4 | 10000 |
| W092 | `mfr_shanzongzhengqigong_huzhen`（bulu-07-bixue:60） | `mfr_tiangang_guiyi`（daojia:24） | 普／绝 | 4/4 | 10000 |
| W093 | `mfr_shanzongzhengqigong_huzhen`（bulu-07-bixue:60） | `mfr_shenmen13_shisan`（daojia:55） | 普／绝 | 4/4 | 10000 |
| W094 | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | `mfr_huzhaojuehushou_juehu`（daojia:52） | 普／绝 | 4/4 | 10000 |
| W095 | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | `mfr_zhenwuqijie_guishe`（daojia:59） | 普／绝 | 4/4 | 10000 |
| W096 | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | `mfr_dajingangquan_yinu`（shaolin:31） | 普／绝 | 4/4 | 10000 |
| W097 | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | `mfr_longzhaoshou_daoxu`（shaolin:48） | 普／绝 | 4/4 | 10000 |
| W098 | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | `mfr_shizihou_pozhen`（shaolin:1291） | 普／普 | 4/4 | 10000 |
| W099 | `mfr_shanzongzhengqigong_tiqi`（bulu-07-bixue:61） | `mfr_jiuyin_sunyouyu`（wujue:57） | 普／绝 | 4/4 | 10000 |
| W100 | `mfr_huashanqigong07_tuizhang`（bulu-07-bixue:72） | `mfr_huzhaojuehushou_juehu`（daojia:52） | 普／绝 | 4/4 | 10000 |
| W101 | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | `mfr_shangjiabaoqi_tieting`（bulu-13-feihu:25） | 普／绝 | 4/5 | 8000 |
| W102 | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | `mfr_xiantiangong_gangqi`（daojia:21） | 普／绝 | 4/5 | 8000 |
| W103 | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | `mfr_xuantie_daqiao`（daojia:37） | 普／绝 | 4/5 | 8000 |
| W104 | `mfr_huashandiejinquan07_lijia`（bulu-07-bixue:74） | `mfr_qinlonggong_shuaizhi`（xiaoyao:56） | 普／绝 | 4/5 | 8000 |
| W105 | `mfr_huashandiejinquan07_diejin`（bulu-07-bixue:75） | `mfr_tiedanzhuangquan_zhenmen`（bulu-12-shujian:22） | 普／绝 | 5/6 | 8333 |
| W106 | `mfr_huashandiejinquan07_diejin`（bulu-07-bixue:75） | `mfr_yingxiongsanzhao_diqing`（kangxi:26） | 普／绝 | 5/6 | 8333 |
| W107 | `mfr_huashandiejinquan07_diejin`（bulu-07-bixue:75） | `mfr_fengyulianshou_saoxiang`（wujue:84） | 普／绝 | 5/6 | 8333 |
| W108 | `mfr_huashandiejinquan07_diejin`（bulu-07-bixue:75） | `mfr_yingzhaoqinna_changkong`（yitian:34） | 普／绝 | 5/6 | 8333 |
| W109 | `mfr_tiejianxuangong_tiebi`（bulu-07-bixue:79） | `mfr_tiangang_guiyi`（daojia:24） | 普／绝 | 4/4 | 10000 |
| W110 | `mfr_minggonghuyuangong_humen`（bulu-07-bixue:82） | `mfr_tangshijian_liancheng`（kangxi:40） | 普／绝 | 4/4 | 10000 |
| W111 | `mfr_minggonghuyuangong_humen`（bulu-07-bixue:82） | `mfr_taiyuesanqingfeng_sanfeng`（wuyue:30） | 普／绝 | 4/4 | 10000 |
| W112 | `mfr_xueyuhufashou_zhenmen`（bulu-08-luding:27） | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | 绝／普 | 4/5 | 8000 |
| W113 | `mfr_walalizhi_fengmai`（bulu-10-baima:24） | `mfr_qixianwuxingjian_fanyin`（wuyue:1454） | 绝／普 | 4/4 | 10000 |
| W114 | `mfr_walalizhi_fengmai`（bulu-10-baima:24） | `mfr_bizhenqingzhang_qingzhang`（xiake-bixue:1443） | 绝／普 | 4/4 | 10000 |
| W115 | `mfr_huahuixinfa_hushen`（bulu-10-baima:37） | `mfr_luohanfumo_zhenqi`（xiake-bixue:1442） | 普／普 | 4/4 | 10000 |
| W116 | `mfr_hasakeyunqi_changxi`（bulu-10-baima:44） | `mfr_hujiaxuangong_xueye`（bulu-13-feihu:23） | 普／绝 | 4/4 | 10000 |
| W117 | `mfr_hasakeyunqi_wenshen`（bulu-10-baima:45） | `mfr_tiangang_guiyi`（daojia:24） | 普／绝 | 4/4 | 10000 |
| W118 | `mfr_hasakeyunqi_wenshen`（bulu-10-baima:45） | `mfr_shenmen13_shisan`（daojia:55） | 普／绝 | 4/4 | 10000 |
| W119 | `mfr_zhentiansanshizhang_zhenbi`（bulu-11-yuanyang:66） | `mfr_fantianzhang_fudi`（wuyue:47） | 普／绝 | 5/6 | 8333 |
| W120 | `mfr_zhentiansanshizhang_zhenbi`（bulu-11-yuanyang:66） | `mfr_fuhuzhang_zhenguan`（xiake-bixue:44） | 普／绝 | 5/6 | 8333 |
| W121 | `mfr_zhentiansanshizhang_huisuo`（bulu-11-yuanyang:68） | `mfr_qianshourulaizhang_wanfo`（shaolin:38） | 普／绝 | 5/6 | 8333 |
| W122 | `mfr_miaojiaxuangong_jinmian`（bulu-13-feihu:21） | `mfr_mingyugong_ningyu`（gulong:1402） | 绝／普 | 5/5 | 10000 |
| W123 | `mfr_miaojiaxuangong_jinmian`（bulu-13-feihu:21） | `mfr_shenshuineigong_naliu`（gulong:1403） | 绝／普 | 4/5 | 8000 |
| W124 | `mfr_miaojiaxuangong_jinmian`（bulu-13-feihu:21） | `mfr_huagumianzhang_geyi`（kangxi:1344） | 绝／普 | 5/5 | 10000 |
| W125 | `mfr_nanhaiwuhuxinfa_nachao`（bulu-13-feihu:45） | `mfr_yuenvjian_yixian`（general:20） | 普／绝 | 5/5 | 10000 |
| W126 | `mfr_nanhaiwuhuxinfa_nachao`（bulu-13-feihu:45） | `mfr_pojunqiangfa_cuifeng`（general:24） | 普／绝 | 4/5 | 8000 |
| W127 | `mfr_nanhaiwuhuxinfa_nachao`（bulu-13-feihu:45） | `mfr_sihaibiaodao_sihai`（general:28） | 普／绝 | 4/5 | 8000 |
| W128 | `mfr_nanhaiwuhuxinfa_nachao`（bulu-13-feihu:45） | `mfr_lihuaqiang_wudishou`（wujue:78） | 普／绝 | 4/5 | 8000 |
| W129 | `mfr_nanhaiwuhuxinfa_nachao`（bulu-13-feihu:45） | `mfr_jiudaixingong_hubang`（wujue:83） | 普／绝 | 4/5 | 8000 |
| W130 | `mfr_nanhaiwuhuxinfa_nachao`（bulu-13-feihu:45） | `mfr_zhengoubang_huilan`（wujue:85） | 普／绝 | 4/5 | 8000 |
| W131 | `mfr_tianlongzhengdao_jiedao`（bulu-13-feihu:50） | `mfr_pojunqiangfa_cuifeng`（general:24） | 普／绝 | 4/5 | 8000 |
| W132 | `mfr_tianlongzhengdao_jiedao`（bulu-13-feihu:50） | `mfr_zhengoubang_huilan`（wujue:85） | 普／绝 | 4/5 | 8000 |
| W133 | `mfr_tianlonghezongjian_dianjian`（bulu-13-feihu:52） | `mfr_jinsheyouzhang_chanshen`（xiake-bixue:51） | 普／绝 | 4/5 | 8000 |
| W134 | `mfr_miaojiazhang_tuizhang`（bulu-13-feihu:55） | `mfr_wuxingliuhezhang_guihuan`（xiake-bixue:30） | 普／绝 | 4/5 | 8000 |
| W135 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_xiantiangong_gangqi`（daojia:21） | 普／绝 | 4/5 | 8000 |
| W136 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_weituochu_dachu`（shaolin:34） | 普／绝 | 4/5 | 8000 |
| W137 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_jingangfumoquan_chanxin`（shaolin:57） | 普／绝 | 4/5 | 8000 |
| W138 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_lingshequan_qianbian`（wujue:41） | 普／绝 | 4/5 | 8000 |
| W139 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_zuoyouhubo_quanli`（wujue:56） | 普／绝 | 4/5 | 8000 |
| W140 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_dafumoquan_hufa`（wujue:68） | 普／绝 | 4/5 | 8000 |
| W141 | `mfr_miaojiazhang_jiewan`（bulu-13-feihu:56） | `mfr_zhemei_liuchu`（xiaoyao:30） | 普／绝 | 4/5 | 8000 |
| W142 | `mfr_miaojiazhang_huishen`（bulu-13-feihu:57） | `mfr_tanzhi_tianhua`（wujue:27） | 普／绝 | 4/5 | 8000 |
| W143 | `mfr_miaojiazhang_huishen`（bulu-13-feihu:57） | `mfr_hanbingzhenqi_ningshuang`（wuyue:1452） | 普／普 | 4/5 | 8000 |
| W144 | `mfr_miaojiazhang_huishen`（bulu-13-feihu:57） | `mfr_bingcanduzhang_shixin`（xiaoyao:58） | 普／绝 | 4/5 | 8000 |
| W145 | `mfr_xuantie_caomu`（daojia:38） | `mfr_tanzhi_tanzhi`（wujue:1096） | 绝／普 | 3/3 | 10000 |
| W146 | `mfr_huzhaojuehushou_juehu`（daojia:52） | `mfr_wudangjiemaishou_huantiao`（daojia:2215） | 绝／普 | 5/6 | 8333 |
| W147 | `mfr_wudangjiemaishou_huantiao`（daojia:2215） | `mfr_yiyangzhi_qianyang`（wujue:47） | 普／绝 | 5/6 | 8333 |
| W148 | `mfr_chuanyunxiao_chuanyun`（general:1329） | `mfr_damingzhou_hezhou`（xiaoyao:264） | 普／普 | 4/4 | 10000 |
| W149 | `mfr_mingyugong_ningyu`（gulong:1402） | `mfr_huagumianzhang_geyi`（kangxi:1344） | 普／普 | 4/5 | 8000 |
| W150 | `mfr_mingyugong_ningyu`（gulong:1402） | `mfr_hanbingzhenqi_fengyue`（wuyue:32） | 普／绝 | 4/5 | 8000 |
| W151 | `mfr_mingyugong_ningyu`（gulong:1402） | `mfr_luohanfumo_zhuxiang`（xiake-bixue:27） | 普／绝 | 4/5 | 8000 |
| W152 | `mfr_mingyugong_ningyu`（gulong:1402） | `mfr_luohanfumo_zhenqi`（xiake-bixue:1442） | 普／普 | 4/5 | 8000 |
| W153 | `mfr_shenshuineigong_naliu`（gulong:1403） | `mfr_huagumianzhang_cangzhen`（kangxi:32） | 普／绝 | 4/5 | 8000 |
| W154 | `mfr_shenshuineigong_naliu`（gulong:1403） | `mfr_huagumianzhang_geyi`（kangxi:1344） | 普／普 | 4/5 | 8000 |
| W155 | `mfr_shenshuineigong_naliu`（gulong:1403） | `mfr_wuxianbaidugong_wangu`（wuyue:49） | 普／绝 | 4/5 | 8000 |
| W156 | `mfr_huagumianzhang_geyi`（kangxi:1344） | `mfr_hanbingzhenqi_fengyue`（wuyue:32） | 普／绝 | 4/5 | 8000 |
| W157 | `mfr_huagumianzhang_geyi`（kangxi:1344） | `mfr_wuxianbaidugong_wangu`（wuyue:49） | 普／绝 | 4/5 | 8000 |
| W158 | `mfr_huagumianzhang_geyi`（kangxi:1344） | `mfr_luohanfumo_zhuxiang`（xiake-bixue:27） | 普／绝 | 4/5 | 8000 |
| W159 | `mfr_huagumianzhang_geyi`（kangxi:1344） | `mfr_jinsheyouzhang_chanshen`（xiake-bixue:51） | 普／绝 | 4/5 | 8000 |
| W160 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_shizihou_shizihou`（shaolin:25） | 普／绝 | 4/5 | 8000 |
| W161 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_dajingangzhang_dali`（shaolin:32） | 普／绝 | 4/5 | 8000 |
| W162 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_qianshourulaizhang_jieyin`（shaolin:37） | 普／绝 | 4/5 | 8000 |
| W163 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_shizihou_zhenhou`（shaolin:1293） | 普／普 | 4/5 | 8000 |
| W164 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_zixiashengong_guangri`（wuyue:27） | 普／绝 | 4/5 | 8000 |
| W165 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_fantianzhang_fudi`（wuyue:47） | 普／绝 | 5/5 | 10000 |
| W166 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_luohanfumo_zhuxiang`（xiake-bixue:27） | 普／绝 | 4/5 | 8000 |
| W167 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_huoyandao_hufa`（xiaoyao:46） | 普／绝 | 5/5 | 10000 |
| W168 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_huoyandao_fentian`（xiaoyao:47） | 普／绝 | 5/5 | 10000 |
| W169 | `mfr_shenlongxinfa_tuxi`（kangxi:1345） | `mfr_shenghuoling_yinfengdao`（yitian:28） | 普／绝 | 4/5 | 8000 |
| W170 | `mfr_jindifa_luaner`（qianlong:1259） | `mfr_dugu9_poqi`（wuyue:25） | 普／绝 | 4/4 | 10000 |
| W171 | `mfr_xumishanzhang_yading`（shaolin:36） | `mfr_tanzhi_tanzhi`（wujue:1096） | 绝／普 | 3/3 | 10000 |
| W172 | `mfr_jingangnuhou_zhenshe`（shaolin:69） | `mfr_shizihou_zhenhou`（shaolin:1293） | 绝／普 | 5/6 | 8333 |
| W173 | `mfr_jiuyinshenzhao_wujian`（wujue:61） | `mfr_qixianwuxingjian_fanyin`（wuyue:1454） | 绝／普 | 4/4 | 10000 |
| W174 | `mfr_jiuyinshenzhao_wujian`（wujue:61） | `mfr_bizhenqingzhang_qingzhang`（xiake-bixue:1443） | 绝／普 | 4/4 | 10000 |
| W175 | `mfr_tiezhang_qingtian`（wujue:74） | `mfr_qingchengcuixinzhang_yinzhang`（wuyue:1456） | 绝／普 | 4/4 | 10000 |
| W176 | `mfr_tanzhi_tanzhi`（wujue:1096） | `mfr_konghegong_konghe`（xiake-bixue:1444） | 普／普 | 3/3 | 10000 |
| W177 | `mfr_dugu9_poqi`（wuyue:25） | `mfr_taixuan_wuyue`（xiake-bixue:1441） | 绝／普 | 6/6 | 10000 |
| W178 | `mfr_xixing_sangong`（wuyue:38） | `mfr_luohanfumo_zhenqi`（xiake-bixue:1442） | 绝／普 | 5/6 | 8333 |
| W179 | `mfr_qingchengcuixinzhang_duanmai`（wuyue:48） | `mfr_wuxianbaidugong_cuizhang`（wuyue:1457） | 绝／普 | 4/4 | 10000 |
| W180 | `mfr_wuxianbaidugong_wangu`（wuyue:49） | `mfr_qingchengcuixinzhang_yinzhang`（wuyue:1456） | 绝／普 | 4/4 | 10000 |
| W181 | `mfr_wuxianduzhang_huifengduwu`（wuyue:63） | `mfr_qingchengcuixinzhang_yinzhang`（wuyue:1456） | 绝／普 | 4/4 | 10000 |
| W182 | `mfr_langhuanjian_lingxu`（xiaoyao:33） | `mfr_hanguqiyin_luoyin`（xiaoyao:265） | 绝／普 | 4/4 | 10000 |

### 7.5 需另派内容任务的性质／动作命中

⚠️ 下列三条均为先前未剥离任督动作出口导致的漏报。票数按“阴／阳”列示，冲／带调和票不计入；节点未重复，故可直接从全路线票数扣出口票数。

| 位置与路线 | 原全路线票数 | 本次剥离的尾段出口 | 体段票数／性质 | 武学声明 |
|---|---|---|---|---|
| bulu-01:25 `mfr_xianglongxinggong_tianxing` | 5／5 | 百会 `ap_dumai_baihui`（阳 1） | 5／4 → yin | yang |
| bulu-05:21 `mfr_huashanziqijue_yingfeng` | 4／6 | 身柱、百会、上星（督脉阳 3） | 4／3 → yin | yang |
| yitian:60 `mfr_xuanmingxinfa_ningshuang` | 3／2 | 关元、阴交（任脉阴 2）；曲泽仍是体段 | 1／2 → yang | yin |

⚠️ 另有 1 条动作端点新命中：道家 `skills-daojia.md:31`，`sk_bingpoyinzhen` 的 `mfr_bingpoyinzhen_shehun`（冰魄银针·摄魂）现由实体暗器判为持械，但未包含腕骨／阳谷／阳池／外关／合谷任何一穴，报 `rule=weapon`。它不计入 NR4 三项性质计数，仍应另派复核。一般动作 `violations` 从 0 变 1，`tail_violations` 仍为 0；普通外放端点违规仍为 0。

没有修改任何图鉴、步骤、性质、CT、风险或豁免标记。修后命中不能作为工具失败而退回旧计票法。

### 7.6 提示栏去重与覆盖复核

✅ 正式 `--delivery` 普通外放路线计数：道家 `2→1`、少林 `18→4`、五绝 `36→5`、逍遥 `19→3`，其他册不变，合计 `94→32`。减少的 62 条中，模板提示为 `1＋14＋30＋16＝61` 条，另 1 条为五绝利涉大川缺完整步骤，已交 §6。

✅ 下列 11 条真实显式路线保留，步骤数量恢复为正文序列长度；不是用集合去重消除真实重复穴位：

| 图鉴／路线 | 修前误采节点数 | 修后实际节点数 |
|---|---:|---:|
| daojia `mfr_wudangjiemaishou_huantiao` | 7 | 6 |
| shaolin `mfr_shizihou_pozhen` | 10 | 8 |
| shaolin `mfr_shizihou_shehun` | 10 | 8 |
| shaolin `mfr_shizihou_zhenhou` | 10 | 8 |
| wujue `mfr_bihai_chaoqi` | 8 | 6 |
| wujue `mfr_bihai_chaoyong` | 8 | 6 |
| wujue `mfr_bihai_jingtao` | 7 | 6 |
| wujue `mfr_bihai_yuyin` | 8 | 6 |
| xiaoyao `mfr_chuanyinsouhun_duohun` | 6 | 4 |
| xiaoyao `mfr_damingzhou_hezhou` | 8 | 6 |
| xiaoyao `mfr_hanguqiyin_luoyin` | 6 | 4 |

✅ 倚天黄阶 5 张与通行黄阶 6 张现自动纳入全部内功审计；每卡先确定所属武学，再读取主修经脉和声明性质，前置 ID 不会窃取归属。最终 25 文件合计 `inner_nature=265/265`，不是沿用人工覆盖数字。

### 7.7 验收命令与范围纪律

| 命令／验收项 | 结果 |
|---|---|
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 193 项通过，exit 0 |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict` | ✅ exit 0；654 条绝招、654 条独立签名、exact 0、≥80% 0；原输出逐字节不变 |
| `python3 tools/lint/check_ids.py --strict` | ✅ exit 0；新增严格失败 0，已知基线未定义 `sk_babuganchan` 1 项仍保留 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ `all checks passed`，exit 0 |
| 12 单元 `check_nr4_unit.py` | ⚠️ 10 单元 exit 0；倚天／补录 exit 1，3 条新性质命中详列 §7.5 |
| `check_route_unique_for.py --all` / `--all --json` | ✅ 默认 exit 0，完整报告 4 对重复＋182 对其他高相似 |
| `check_route_unique_for.py --all --strict-normal` | ⚠️ 按设计 exit 1，4 对普通相关完全重复尚待内容任务处理 |
| 新单测范围 | ✅ 出口 8 项、解析 6 项、普通唯一性 9 项，共新增 23 项；覆盖跨类、普通互比、80% 边界、反序、较短分母、共享模板排除及无运行 ID 派生步骤 |
| 文档与代码检查 | ✅ `git diff --check` 通过；报告表格完整、代码块闭合，无占位段落 |
| 写集与 git 纪律 | ✅ 仅修改 5 个允许文件；未改 docs、Canon、TODO 或其他报告；未执行改变仓库状态的 git 命令 |
| 需作者确认 | ⚠️ 仅沿用 §4 列出的上游默认值；本次没有新造作者决定或暂停等待 |

解析器仍服务当前 Markdown 图鉴约定：序列应连续展开或放入明确 steps／步骤列；夹杂自由说明、嵌套 YAML 等新格式需先补解析回归。高相似条目的叙事合理性未在本工具任务中逐对裁定，完整交接清单见 §7.4。
