# NR4S-rules 报告 · 阴阳性质同步 · 规则文档与图鉴互引（AR-18 落地后的系统文档同步）

## 1. 摘要（3–6 行）

- 同步六份系统文档及道家图鉴的一处跨册概括，保留 NYY 历史基线并追加 NR4 实测结果。
- 完整内功现值为 265 卡；既有检查器识别 254 卡，补查通用 6 卡、倚天 5 卡后全部性质与主修经脉一致。
- 十二份 NR4 报告合并、逐卡核实得到 80 门改性内功：原基线 56 门＋追加 24 门；逐门复查写集内 ID、中文名及关键简称。
- 九阳辅运算例重算为实际比例 0.60、贡献 51.6%、基础内力上限增幅 30.96%；四项传承校合门槛均给出可达路径。
- 八项指定检查全部通过；未改图鉴卡面性质、经脉、路线、数值，也未改 21 的任何路线结构。写集外问题只登记交接。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要章节 |
|---|---:|---|
| `docs/design/03-attributes.md` | 1813 | §5.2 性质代表、调和相性 |
| `docs/design/05-martial-arts-system.md` | 3199 | §5.3 / §5.3.1、§5.5、§9.1.4、§13.4、§17 D25/O8 |
| `docs/design/07-set-system.md` | 1384 | §10.5 九阴正宗的谱系与性质边界 |
| `docs/design/10-items-and-equipment.md` | 2244 | §5.4 乾坤一气袋 |
| `docs/design/20-legacy-inheritance.md` | 1683 | §7.3 / §7.3.1、§9.4.3、§9.5.2–3、§9.6.6 |
| `docs/design/21-meridian-flow-and-moves.md` | 2343 | §10.4 九阳标签、§18.6 交接状态 |
| `docs/design/catalog/skills-daojia.md` | 2685 | §5.2 九阳支系跨册性质说明 |
| `tools/agents/reports/NR4S-rules.md` | 540 | 现值总表、逐门改性与处理表、复算、验收、交接 |

所有修改的正文文件均追加“阴阳性质同步 AR-18（2026-09-30）”版本标记。其余 24 份武学图鉴已查但无需改动；纯 ID 引用保留。

## 3. 关键结论与数值

- 25 册完整现值：`265=254+6+5`；阳 104、阴 90、调和 71，合计 `104+90+71=265`；无重复正式 ID。
- 三项检查器计数在修改前后均为 `nature_conflicts=0 / inner_missing_meridians=0 / inner_nature_conflicts=0`，脚本观测 `inner_nature=254/254`。补查 11 卡也全部有字段且无性质冲突。
- 改性 `80=56+24`：补录18、道家7、通用7、古龙2、康熙5、乾隆4、少林0、五绝9、五岳12、侠客碧血7、逍遥0、倚天9。少林 / 逍遥无内功改性不等于未补字段。
- 05 辅运例实际位于 §5.5（原任务称 §5.6）：`min(0.60,0.50+0.10)=0.60`，`(0.30+0.07×8)×0.60=0.516`，`60%×0.516=30.96%`。
- 传承校合的数值门槛不变：C12 内功 `9品/7重`、C11 `8品/7重`、C9 `6品/6重`；只同步性质并核实来源、前置、携带与时序。
- 乾坤袋命中后，目标主运 `effGrade≥10 AND (nature=yang OR skillId=sk_jiuyang)` 时免定身并使袋本场迸裂；辅运不触发，其他情况保留 12% 定身。

## 4. 开放问题（附默认值）

本任务没有新增必须作者选择的性质或数值。沿用且不删除既有待决项：

| 项 | 默认值 / 处理 |
|---|---|
| AR-18a：冲脉、带脉投票 | 保持调和、不投阴阳票；平票或无票取调和。若作者改口径，需重审完整 265 卡，不能只跑现有 254 卡解析 |
| AR-18b：后溪与外放端点 | 保持既有 13 端点白名单，后溪仅满足掌刃动作末端；本任务不改路线 |
| 05 O7：九阳 1–6 重无主动招 | 继续保留三绝招现状，不另编招名 |
| 20 既有校合 / 有效品阶限制 | 保留原有待决与默认值；本次不改变合成真值、`legacyWorldCap` 或强行校合规则 |

检查器漏识别 11 卡是工具解析问题，不是作者决策；默认采用补查后的 265 卡现值表继续同步。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增提案。Canon v1.8 已落实 AR-18；本任务只消费现行决定，不修改基准。05 已有 D25 由“待同步”改为“已解决”，保留九阳反震旧问题及倚天 §10.6 的解决依据。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

下列均不在写集内，未修改。章节及 NPC 由 NR4S-01～14 接手；引用 ID 本身稳定，需重新读取性质与派生值。

| 文档 / 位置 | 交接内容 |
|---|---|
| `tools/lint/check_skill_catalogs.py` `_delivery_from_context` | “内功（品阶·性质）”黄阶表格漏识别通用 6 卡与倚天 5 卡；补解析与回归用例。现 254 卡的零冲突不能代替完整 265 卡覆盖 |
| `docs/design/chapters/07-bixue.md` §9.7，行1046 | 葵花校合“阴性8品7重”改阳；对齐 20 §9.5.3 |
| `docs/design/chapters/08-luding.md` §9.4，行1006 | 混元 `C9 阳性`改调和；对齐 20 §9.6.6 |
| `docs/design/chapters/09-liancheng.md` §9.8，行777 | 吸星 `C11（阴）`改调和；对齐 20 §9.5.2 |

对 80 门逐 ID / 中文名在全部写集外 `docs/**/*.md` 检索，原始命中 938 行次 / 679 个物理行；逐条排除纯来源、同名支系、故事效果及历史快照。14 章有 144 条配装含改性主运或辅运：60 行主运七参仍为明确旧性质，84 行仅辅运变化需复核。表中行号以本次工作树为准，章节任务合入后重跑，不把历史报告行号当永久事实。

| `docs/design/chapters/` 文件 | 主运七参旧性质（60 行） | 仅辅运改性的派生复核（84 行） |
|---|---|---|
| `01-tianlong.md` | — | 1417、1418、1419、1422 |
| `02-shediao.md` | 1229 | 1226、1227、1228、1230、1231、1232、1233 |
| `03-shendiao.md` | 1513、1518 | — |
| `04-yitian.md` | 1283、1285、1286、1291 | 1280、1284、1292 |
| `05-xiaoao.md` | 1324、1325、1329 | 1328、1330 |
| `06-xiake.md` | 1404、1407、1409 | 1406、1408、1410、1411、1413、1414 |
| `07-bixue.md` | 1415、1417、1418、1419、1420、1421、1423、1424、1425、1426 | 1414、1422、1427 |
| `08-luding.md` | 1480、1481、1487、1488、1495、1496、1499、1500、1501 | 1478、1482、1483、1484、1485、1486、1489、1490、1491、1492、1497、1498 |
| `09-liancheng.md` | 1101、1102、1103、1104、1105、1108、1109、1110、1114 | 1106、1107、1111、1112 |
| `10-baima.md` | 1171、1172、1180 | 1173、1174、1175、1176、1179、1181、1182 |
| `11-yuanyang.md` | 1268、1269、1270、1271、1272、1273、1274、1278、1279 | — |
| `12-shujian.md` | — | 1359、1360、1361、1364、1365、1366 |
| `13-feihu.md` | 1049、1050、1051、1052、1054、1055、1056 | 1046、1047、1048、1053、1057、1058、1059、1060、1061、1062、1063、1064、1065、1066 |
| `14-xueshan.md` | — | 1316、1317、1318、1319、1320、1322、1323、1327、1333、1334、1341、1342、1343、1344、1345、1346 |

独立于配装表的其余明确性质镜像（前三项校合已列上表）：

| 章节 / 行 | 旧说法 → 现值 |
|---|---|
| `02-shediao` 1260、1263；`03-shendiao` 1553 | 黄药师 `10/9/harmony`、`11/9/harmony` → 桃花归元诀 `yin` |
| `02-shediao` 1265 | 重阳七星阵首 `9/9/yang` → 全真周天功 `harmony` |
| `04-yitian` 1584 | 波斯圣火玄功天下10、调和 → 阳，保留原解决记录及品阶 |
| `07-bixue` 1330 | 玉真子铁剑玄功 `innerNature=harmony` → `yang` |
| `08-luding` 949 | 全真吐纳诀基础阳性 → 基础阴性 |
| `09-liancheng` 760、763 | 湘西吐纳 / 梅门心法调和 → 阴；血刀心法阴 → 调和 |
| `13-feihu` 734；`14-xueshan` 934 | 苗家调和指点 / 苗家心法调和 → 阴；苗家玄功仍为调和，不混淆 |
| `11-yuanyang` §9.6；`12-shujian` 943 | NR4 报告指出的旧经脉 / “未登记专精”说明仍由章节任务对照现卡补齐 |

报告线索复核：补录、道家、通用、康熙、乾隆、五绝、五岳、侠客碧血、倚天的明确未同步项均已覆盖；古龙无册外性质镜像，少林 / 逍遥无改性内功。03 章原报告点名的 948 / 954 / 1010 行只有 ID 与正确经脉映射，无旧性质，不机械修改；康熙报告所指补录平西行气诀卡本身已为阴，已解决。

**不能照抄旧报告的推算**：黄药师主运桃花归元诀也已调和→阴，桃花吐纳息与药圃吐纳息现均为阴，现辅运基础比例应为 `0.50/0.50`，不是按旧调和主运算 `0.40/0.40`。重阳阵首主运全真周天功已为调和，按 05 §5.4 不构成阳主运对阴辅运的相冲；张召重仍须以阳主运与阴太和功复核桥接资格。主运未改者不得因辅运变化机械改七参。

`npcs-ch*` 命中主要为主辅运 ID，无独立旧性质字段；章节任务若调换配装，须同步 NPC 同一人物的 ID，若仅重算则纯 ID 保留。`story/*`、`tech/*`、04 / 09 / 15 / 17 及其余系统文档未发现本轮 80 卡的明确旧性质镜像；寒毒治疗、吸星代价及同源叙事不改。易筋10＋九阳8旧辅运例没有写集外复制。路线解析类历史线索不在本任务改脚本，三项全零也不扩大解释为工具所有动作语义均已核验。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 现值表与改性清单的生成方式

✅ 先读作者需求（含 AR-18）、作者决定、Canon v1.8、裁定、任务进度与十二份 NR4 报告 §6/§7；以现图鉴为真值，报告只取迁移旧值和核查线索。

现值表用一次性 Python 脚本（仅 `/tmp`，不入库）导入 `tools/lint/check_skill_catalogs.py`：按 `_skill_card_blocks`、`_skill_contexts` 和 `parse_skill_grades` 识别正式卡并按 ID 去重，读取 `_skill_natures` 与卡内 `_inner_meridians`。将类型识别输入中的“内功（”临时规范为“内功 ·（”，补上黄阶一行格式；图鉴原文和检查器均未修改。中文名从正式标题或表首名称读取，人工复核同格名称、跨代同名及总表误读的军旅吐纳 / 达摩心经 / 童子功 / 铁线功。

性质逐张调用 `_nature_from_meridians` 与 `design/15` 的 20 脉性质表比对；265 张全部通过。独立检索所有图鉴的唯一逐武学 `txp_*` 得 265 个，与内功 `sk_*` 同后缀一一对应，双向差集为空。

改性表逐份提取十二份 `NR4-*.md` §7 的“改性质清单”，排除性质未变及非内功项；用 ID 或同册中文名映射现值表，断言报告新值等于当前卡值，得到 80 个唯一 ID。另从 05 NYY 历史表提取 56 个 ID，得额外集合 24 个；完整迁移与逐门处理见 §7.3，05 §5.3.1 也已落下全部 80 门。

复现原生检查命令：`python3 tools/lint/check_skill_catalogs.py --delivery --details`。各册完整扫描 / 原生解析的差异已在 05 §5.3.1 逐册列出；下表现值来源用正式图鉴文件名，省略共同目录 `docs/design/catalog/`。

### 7.2 全部内功性质现值表（265 张）

| 正式图鉴 | ID | 中文名 | 现 nature |
|---|---|---|---|
| `skills-bulu-01-tianlong.md` | `sk_duanshiyangjue` | 段氏一阳诀 | `harmony` |
| `skills-bulu-01-tianlong.md` | `sk_xianglongxinggong` | 降龙行功 | `yang` |
| `skills-bulu-01-tianlong.md` | `sk_tianshanliuyangxinfa` | 天山六阳心法 | `yang` |
| `skills-bulu-02-shediao.md` | `sk_tiezhangyunqigong` | 铁掌运气功 | `yang` |
| `skills-bulu-02-shediao.md` | `sk_taohuaguiyuanjue` | 桃花归元诀 | `yin` |
| `skills-bulu-02-shediao.md` | `sk_quanzhenzhoutiangong` | 全真周天功 | `harmony` |
| `skills-bulu-02-shediao.md` | `sk_jiuyinxieliangong` | 九阴邪练功 | `yang` |
| `skills-bulu-02-shediao.md` | `sk_gaibangjuyigong` | 丐帮聚义功 | `yang` |
| `skills-bulu-03-shendiao.md` | `sk_chiliandugong` | 赤练毒功 | `yin` |
| `skills-bulu-03-shendiao.md` | `sk_jueqingbixuejue` | 绝情闭穴诀 | `yin` |
| `skills-bulu-03-shendiao.md` | `sk_jinganghufagong` | 金刚护法功 | `yang` |
| `skills-bulu-03-shendiao.md` | `sk_caoyuanjunzhenxinfa` | 草原军阵心法 | `yang` |
| `skills-bulu-04-yitian.md` | `sk_mingjiaohujiaogong` | 明教护教功 | `harmony` |
| `skills-bulu-04-yitian.md` | `sk_bosishenghuoxuangong` | 波斯圣火玄功 | `yang` |
| `skills-bulu-04-yitian.md` | `sk_huanyinxinfa` | 幻阴心法 | `yin` |
| `skills-bulu-04-yitian.md` | `sk_xuanminghanyuangong` | 玄冥寒元功 | `yin` |
| `skills-bulu-04-yitian.md` | `sk_kunlunliangyixinfa` | 昆仑两仪心法 | `harmony` |
| `skills-bulu-04-yitian.md` | `sk_kongtongwuxingxinfa` | 崆峒五行心法 | `yin` |
| `skills-bulu-04-yitian.md` | `sk_huashanliangyixinfa04` | 华山两仪心法 | `yang` |
| `skills-bulu-05-xiaoao.md` | `sk_huashanziqijue` | 华山紫气诀 | `yang` |
| `skills-bulu-05-xiaoao.md` | `sk_jianzongxingqi` | 剑宗行气诀 | `yang` |
| `skills-bulu-05-xiaoao.md` | `sk_songshanzhenqi` | 嵩山真气 | `yang` |
| `skills-bulu-05-xiaoao.md` | `sk_qingchengyunqi` | 青城运气诀 | `yin` |
| `skills-bulu-05-xiaoao.md` | `sk_heimuxuangong` | 黑木玄功 | `yin` |
| `skills-bulu-06-xiake.md` | `sk_motianyunqi` | 摩天崖运气法 | `harmony` |
| `skills-bulu-06-xiake.md` | `sk_dingshixinfa` | 丁氏心法 | `yin` |
| `skills-bulu-06-xiake.md` | `sk_xiakedaoqigong` | 侠客岛气功 | `harmony` |
| `skills-bulu-06-xiake.md` | `sk_lingxiaozhenyuegong` | 凌霄镇岳功 | `yang` |
| `skills-bulu-07-bixue.md` | `sk_shanzongzhengqigong` | 山宗正气功 | `yang` |
| `skills-bulu-07-bixue.md` | `sk_jinlongbangxinfa` | 金龙帮心法 | `harmony` |
| `skills-bulu-07-bixue.md` | `sk_shiliangwuxinggong` | 石梁五行功 | `yin` |
| `skills-bulu-07-bixue.md` | `sk_xianduyunqi` | 仙都运气诀 | `yin` |
| `skills-bulu-07-bixue.md` | `sk_huashanqigong07` | 华山养气功 | `harmony` |
| `skills-bulu-07-bixue.md` | `sk_tiejianxuangong` | 铁剑玄功 | `yang` |
| `skills-bulu-07-bixue.md` | `sk_minggonghuyuangong` | 明宫护院功 | `yang` |
| `skills-bulu-08-luding.md` | `sk_aobaihengliangong` | 鳌拜横练功 | `yang` |
| `skills-bulu-08-luding.md` | `sk_bukuhutiaogong` | 布库护腰功 | `harmony` |
| `skills-bulu-08-luding.md` | `sk_sangjiehufagong` | 桑结护法功 | `yang` |
| `skills-bulu-08-luding.md` | `sk_fansenghutigong` | 番僧护体功 | `harmony` |
| `skills-bulu-08-luding.md` | `sk_wangwuzhenshanxinfa` | 王屋镇山心法 | `yin` |
| `skills-bulu-08-luding.md` | `sk_wangwuhushangong` | 王屋护山功 | `yang` |
| `skills-bulu-08-luding.md` | `sk_pingxizhentaixinfa` | 平西镇台心法 | `yang` |
| `skills-bulu-08-luding.md` | `sk_pingxixingqijue` | 平西行气诀 | `yin` |
| `skills-bulu-08-luding.md` | `sk_shenlonghaichaojing` | 神龙海潮经 | `yang` |
| `skills-bulu-08-luding.md` | `sk_shenlongfanzhougong` | 神龙泛舟功 | `harmony` |
| `skills-bulu-08-luding.md` | `sk_yanpinghaifangxinfa` | 延平海防心法 | `harmony` |
| `skills-bulu-08-luding.md` | `sk_yanpingfanchaojue` | 延平泛潮诀 | `yin` |
| `skills-bulu-08-luding.md` | `sk_yijianxinfa` | 一剑心法 | `yin` |
| `skills-bulu-08-luding.md` | `sk_luochazhenliecao` | 罗刹阵列操 | `yang` |
| `skills-bulu-08-luding.md` | `sk_luochabujunhuxi` | 罗刹步军呼吸 | `yin` |
| `skills-bulu-08-luding.md` | `sk_haidafuhuagujing` | 海大富化骨经 | `yin` |
| `skills-bulu-09-liancheng.md` | `sk_wanjiazhengqi` | 万家正气诀 | `yang` |
| `skills-bulu-09-liancheng.md` | `sk_jingzhouyangqigong` | 荆州养气功 | `harmony` |
| `skills-bulu-10-baima.md` | `sk_huahuixinfa` | 华辉心法 | `yin` |
| `skills-bulu-10-baima.md` | `sk_hasakeyunqi` | 草原运气法 | `yang` |
| `skills-bulu-12-shujian.md` | `sk_tiedanzhuangxinfa` | 铁胆庄心法 | `yang` |
| `skills-bulu-12-shujian.md` | `sk_tianchishengong` | 天池神功 | `harmony` |
| `skills-bulu-13-feihu.md` | `sk_miaojiaxuangong` | 苗家玄功 | `harmony` |
| `skills-bulu-13-feihu.md` | `sk_hujiaxuangong` | 胡家玄功 | `yang` |
| `skills-bulu-13-feihu.md` | `sk_shangjiabaoqi` | 商家堡气 | `yang` |
| `skills-bulu-13-feihu.md` | `sk_huiwuguixin` | 会武归心诀 | `yin` |
| `skills-bulu-13-feihu.md` | `sk_nanhaiwuhuxinfa` | 南海五虎心法 | `yang` |
| `skills-bulu-13-feihu.md` | `sk_tianlongmenxinfa` | 天龙门心法 | `harmony` |
| `skills-bulu-13-feihu.md` | `sk_yaowangneigong` | 药王内功 | `yin` |
| `skills-bulu-13-feihu.md` | `sk_bajixingqi` | 八极行气 | `yang` |
| `skills-bulu-14-xueshan.md` | `sk_cangfengxingqi` | 藏锋行气 | `yin` |
| `skills-daojia.md` | `sk_quanzhentunajue` | 全真吐纳诀 | `yin` |
| `skills-daojia.md` | `sk_quanzhenxinfa` | 全真心法 | `yang` |
| `skills-daojia.md` | `sk_jinguanyusuo` | 金关玉锁二十四诀 | `harmony` |
| `skills-daojia.md` | `sk_xiantiangong` | 先天功 | `yang` |
| `skills-daojia.md` | `sk_beidouxinfa` | 北斗心法 | `harmony` |
| `skills-daojia.md` | `sk_baiyunguanxinfa` | 白云观心法 | `yin` |
| `skills-daojia.md` | `sk_gumuxinfa` | 古墓心法 | `yin` |
| `skills-daojia.md` | `sk_hanyuxinjue` | 寒玉心诀 | `yin` |
| `skills-daojia.md` | `sk_yunvxinjing` | 玉女心经 | `yin` |
| `skills-daojia.md` | `sk_hanyujinggong` | 寒玉静功 | `yin` |
| `skills-daojia.md` | `sk_gumudaoyin` | 古墓导引 | `yin` |
| `skills-daojia.md` | `sk_jianzhongtuna` | 剑冢吐纳 | `yang` |
| `skills-daojia.md` | `sk_taihegong` | 太和功 | `yin` |
| `skills-daojia.md` | `sk_liangyixinfa` | 两仪心法 | `harmony` |
| `skills-daojia.md` | `sk_chunyangwuji` | 纯阳无极功 | `yang` |
| `skills-daojia.md` | `sk_wudangyangshenggong` | 武当养生功 | `yin` |
| `skills-daojia.md` | `sk_xuanzhenxinfa` | 玄真心法 | `yang` |
| `skills-daojia.md` | `sk_wudangtuna` | 武当吐纳 | `yang` |
| `skills-daojia.md` | `sk_zhenwudaoyin` | 真武导引 | `yin` |
| `skills-daojia.md` | `sk_zhenwuzhuang` | 真武桩功 | `yang` |
| `skills-daojia.md` | `sk_jueqingxinjue` | 绝情心诀 | `yin` |
| `skills-daojia.md` | `sk_bixuegong` | 闭穴功 | `yin` |
| `skills-daojia.md` | `sk_jueqingdaoyin` | 绝情导引 | `yin` |
| `skills-general.md` | `sk_shanyetuna` | 山野吐纳 | `yin` |
| `skills-general.md` | `sk_chaoyinxinfa` | 潮音心法 | `harmony` |
| `skills-general.md` | `sk_baizhanxinfa` | 百战心法 | `yang` |
| `skills-general.md` | `sk_jundituna` | 军旅吐纳 | `yang` |
| `skills-general.md` | `sk_junzhangtuna` | 军帐吐纳 | `yang` |
| `skills-general.md` | `sk_jindunxinfa` | 金盾心法 | `harmony` |
| `skills-general.md` | `sk_zhuangxingong` | 壮行功 | `yin` |
| `skills-general.md` | `sk_hunyuanfangzhuang` | 混元方桩 | `harmony` |
| `skills-general.md` | `sk_wuguanxinfa` | 武馆心法 | `yin` |
| `skills-general.md` | `sk_zhamabu` | 扎马步 | `yang` |
| `skills-general.md` | `sk_jianghutuna` | 江湖吐纳 | `yin` |
| `skills-general.md` | `sk_tunaqianjue` | 吐纳浅诀 | `yin` |
| `skills-general.md` | `sk_dantianyangqi` | 丹田养气 | `yang` |
| `skills-general.md` | `sk_huxixingqi` | 呼吸行气 | `yin` |
| `skills-gulong.md` | `sk_mingyugong` | 明玉功 | `yin` |
| `skills-gulong.md` | `sk_jiayishengong` | 嫁衣神功 | `yang` |
| `skills-gulong.md` | `sk_daqixinfa` | 大旗吐纳 | `yin` |
| `skills-gulong.md` | `sk_shenshuineigong` | 神水内功 | `yin` |
| `skills-gulong.md` | `sk_wuzhengxinfa` | 无争心法 | `harmony` |
| `skills-gulong.md` | `sk_qinglongneifa` | 青龙护心诀 | `harmony` |
| `skills-gulong.md` | `sk_qinglongtuna` | 青龙吐纳 | `yin` |
| `skills-gulong.md` | `sk_qinglonghuxin` | 青龙护心功 | `yang` |
| `skills-gulong.md` | `sk_tangmenbidu` | 唐门避毒诀 | `yin` |
| `skills-kangxi.md` | `sk_shenzhao` | 神照经 | `harmony` |
| `skills-kangxi.md` | `sk_shenlongxinfa` | 神龙心法 | `yang` |
| `skills-kangxi.md` | `sk_xuedaojing` | 血刀经 | `yin` |
| `skills-kangxi.md` | `sk_xuedaoxinfa` | 血刀心法 | `harmony` |
| `skills-kangxi.md` | `sk_wanjiaxinfa` | 万家心法 | `yang` |
| `skills-kangxi.md` | `sk_meinianshengxinfa` | 梅门心法 | `yin` |
| `skills-kangxi.md` | `sk_gaochanggong` | 高昌劲 | `harmony` |
| `skills-kangxi.md` | `sk_hasakexinfa` | 草原心法 | `yang` |
| `skills-kangxi.md` | `sk_linrenhexinfa` | 林任合心诀 | `yin` |
| `skills-kangxi.md` | `sk_wangwuxinfa` | 王屋心法 | `yang` |
| `skills-kangxi.md` | `sk_pingxituna` | 平西军吐纳 | `yin` |
| `skills-kangxi.md` | `sk_xiangxituna` | 湘西吐纳 | `yin` |
| `skills-kangxi.md` | `sk_gaochangtuna` | 高昌吐纳 | `harmony` |
| `skills-kangxi.md` | `sk_hasakehuxi` | 草原呼吸法 | `yang` |
| `skills-kangxi.md` | `sk_taiyuehuxi` | 太岳呼吸法 | `yang` |
| `skills-kangxi.md` | `sk_renzhetuna` | 仁者吐纳 | `harmony` |
| `skills-qianlong.md` | `sk_honghuaxinfa` | 红花心法 | `harmony` |
| `skills-qianlong.md` | `sk_hujiadaoxinfa` | 胡家心法 | `yang` |
| `skills-qianlong.md` | `sk_miaojiaxinfa` | 苗家心法 | `yin` |
| `skills-qianlong.md` | `sk_guangpingxinfa` | 广平心法 | `yin` |
| `skills-qianlong.md` | `sk_guanwaixinfa` | 关外心法 | `yang` |
| `skills-qianlong.md` | `sk_huibutunaxi` | 回部吐纳 | `yin` |
| `skills-qianlong.md` | `sk_miaojialianqi` | 苗家炼气 | `yin` |
| `skills-qianlong.md` | `sk_yaowangtuna` | 药王吐纳 | `yin` |
| `skills-qianlong.md` | `sk_baxianxinfa` | 八仙心法 | `harmony` |
| `skills-qianlong.md` | `sk_bajizhuang` | 八极桩 | `yang` |
| `skills-qianlong.md` | `sk_yijiaxinfa` | 易家心法 | `yin` |
| `skills-shaolin.md` | `sk_yijinjing` | 易筋经 | `harmony` |
| `skills-shaolin.md` | `sk_jingangbuhuai` | 金刚不坏体 | `yang` |
| `skills-shaolin.md` | `sk_xisuijing` | 洗髓经 | `harmony` |
| `skills-shaolin.md` | `sk_jinzhongzhao` | 金钟罩 | `yang` |
| `skills-shaolin.md` | `sk_shaolinjiuyang` | 少林九阳功 | `yang` |
| `skills-shaolin.md` | `sk_tiebushan` | 铁布衫 | `yang` |
| `skills-shaolin.md` | `sk_tongrenhenglian` | 铜人横练 | `yang` |
| `skills-shaolin.md` | `sk_damoxinjing` | 达摩心经 | `harmony` |
| `skills-shaolin.md` | `sk_tongzigong` | 童子功 | `yang` |
| `skills-shaolin.md` | `sk_shaolinxinfa` | 少林心法 | `yang` |
| `skills-shaolin.md` | `sk_shaolinzhuanggong` | 少林桩功 | `yang` |
| `skills-shaolin.md` | `sk_tiexiangong` | 铁线功 | `yang` |
| `skills-wujue.md` | `sk_jiuyin` | 九阴真经 | `harmony` |
| `skills-wujue.md` | `sk_hama` | 蛤蟆功 | `yang` |
| `skills-wujue.md` | `sk_canfengyinlugong` | 餐风饮露功 | `yang` |
| `skills-wujue.md` | `sk_gaibangtunajue` | 丐帮吐纳诀 | `yang` |
| `skills-wujue.md` | `sk_gaibanghuxinfa` | 丐帮护心法 | `harmony` |
| `skills-wujue.md` | `sk_jiudaixingong` | 九袋行功 | `yang` |
| `skills-wujue.md` | `sk_tuobozhuang` | 托钵桩 | `yang` |
| `skills-wujue.md` | `sk_bitaoxuangong` | 碧涛玄功 | `harmony` |
| `skills-wujue.md` | `sk_taohuatunaxi` | 桃花吐纳息 | `yin` |
| `skills-wujue.md` | `sk_yaoputunaxi` | 药圃吐纳息 | `yin` |
| `skills-wujue.md` | `sk_nizhuanjingmai` | 逆转经脉 | `yin` |
| `skills-wujue.md` | `sk_baituotunadu` | 白驼吐纳术 | `harmony` |
| `skills-wujue.md` | `sk_dumaihuqigong` | 毒脉护气功 | `yin` |
| `skills-wujue.md` | `sk_shexingtunaxi` | 蛇形吐纳息 | `harmony` |
| `skills-wujue.md` | `sk_kurongchangong` | 枯荣禅功 | `harmony` |
| `skills-wujue.md` | `sk_tiannanxinfa` | 天南心法 | `yang` |
| `skills-wujue.md` | `sk_duanshiyangshenggong` | 段氏养生功 | `yin` |
| `skills-wujue.md` | `sk_wangfutunaxi` | 王府吐纳息 | `yin` |
| `skills-wujue.md` | `sk_yijinduangupian` | 易筋锻骨篇 | `harmony` |
| `skills-wujue.md` | `sk_tongshihenglian` | 铜尸横练 | `yang` |
| `skills-wujue.md` | `sk_jiuyintiaoxipian` | 九阴调息篇 | `yin` |
| `skills-wujue.md` | `sk_biguqipian` | 辟谷气篇 | `yin` |
| `skills-wujue.md` | `sk_tiezhangxinfa` | 铁掌心法 | `yang` |
| `skills-wujue.md` | `sk_tiezhangtunajue` | 铁掌吐纳诀 | `yang` |
| `skills-wujue.md` | `sk_tiezhangzhuang` | 铁掌桩 | `yang` |
| `skills-wujue.md` | `sk_tiebifangshen` | 铁臂防身 | `yang` |
| `skills-wujue.md` | `sk_xiaomituozhuang` | 笑弥陀桩 | `yang` |
| `skills-wujue.md` | `sk_jiangmenzhuang` | 将门桩 | `yang` |
| `skills-wujue.md` | `sk_caoyuantunaxi` | 草原吐纳息 | `yang` |
| `skills-wuyue.md` | `sk_xixing` | 吸星大法 | `harmony` |
| `skills-wuyue.md` | `sk_kuihua` | 葵花宝典 | `yang` |
| `skills-wuyue.md` | `sk_zixiashengong` | 紫霞神功 | `harmony` |
| `skills-wuyue.md` | `sk_huashanxinfa` | 华山心法 | `yin` |
| `skills-wuyue.md` | `sk_huashantuna` | 华山吐纳 | `yin` |
| `skills-wuyue.md` | `sk_hanbingzhenqi` | 寒冰真气 | `yin` |
| `skills-wuyue.md` | `sk_songyangxinfa` | 嵩阳心法 | `yang` |
| `skills-wuyue.md` | `sk_songyangtuna` | 嵩阳吐纳 | `yang` |
| `skills-wuyue.md` | `sk_taishanxinfa` | 泰山心法 | `yang` |
| `skills-wuyue.md` | `sk_taishantuna` | 泰山吐纳 | `yang` |
| `skills-wuyue.md` | `sk_hengshanxinfa` | 衡山心法 | `yin` |
| `skills-wuyue.md` | `sk_hengshantuna` | 衡山吐纳 | `yin` |
| `skills-wuyue.md` | `sk_hengshanbeixinfa` | 恒山心法 | `yin` |
| `skills-wuyue.md` | `sk_hengshanbeituna` | 恒山吐纳 | `yin` |
| `skills-wuyue.md` | `sk_riyuexinfa` | 日月心法 | `harmony` |
| `skills-wuyue.md` | `sk_heimutuna` | 黑木吐纳 | `harmony` |
| `skills-wuyue.md` | `sk_biaojuxinfa` | 镖局心法 | `yang` |
| `skills-wuyue.md` | `sk_qingchengxinfa` | 青城心法 | `yin` |
| `skills-wuyue.md` | `sk_qingchengtuna` | 青城吐纳 | `yin` |
| `skills-wuyue.md` | `sk_wuxianbaidugong` | 五仙百毒功 | `harmony` |
| `skills-wuyue.md` | `sk_wuxiantuna` | 五仙吐纳 | `yin` |
| `skills-xiake-bixue.md` | `sk_taixuan` | 太玄经 | `harmony` |
| `skills-xiake-bixue.md` | `sk_luohanfumo` | 罗汉伏魔神功 | `harmony` |
| `skills-xiake-bixue.md` | `sk_wuwangshengong` | 无妄神功 | `yang` |
| `skills-xiake-bixue.md` | `sk_lingxiaotuna` | 凌霄吐纳 | `yang` |
| `skills-xiake-bixue.md` | `sk_changlexinfa` | 长乐心法 | `yin` |
| `skills-xiake-bixue.md` | `sk_changletuna` | 长乐吐纳 | `yin` |
| `skills-xiake-bixue.md` | `sk_xuansuxinfa` | 玄素心法 | `harmony` |
| `skills-xiake-bixue.md` | `sk_xuansuzhuanggong` | 玄素桩功 | `yin` |
| `skills-xiake-bixue.md` | `sk_jindaoxinfa` | 金刀心法 | `yang` |
| `skills-xiake-bixue.md` | `sk_jindaozhuanggong` | 金刀桩功 | `yang` |
| `skills-xiake-bixue.md` | `sk_shangqingxinfa06` | 上清心法 | `harmony` |
| `skills-xiake-bixue.md` | `sk_shangqingtuna06` | 上清吐纳·侠客 | `yin` |
| `skills-xiake-bixue.md` | `sk_hunyuangong` | 混元功 | `harmony` |
| `skills-xiake-bixue.md` | `sk_huashantuna07` | 华山吐纳·碧血 | `yang` |
| `skills-xiake-bixue.md` | `sk_tiejianxinfa` | 铁剑心法 | `harmony` |
| `skills-xiake-bixue.md` | `sk_tiejantuna` | 铁剑吐纳 | `yin` |
| `skills-xiake-bixue.md` | `sk_wenjiagong` | 温家桩功 | `yang` |
| `skills-xiake-bixue.md` | `sk_wuduxinfa` | 五毒心法 | `yin` |
| `skills-xiake-bixue.md` | `sk_wudutuna` | 五毒吐纳·碧血 | `yin` |
| `skills-xiake-bixue.md` | `sk_xianduxinfa` | 仙都心法 | `harmony` |
| `skills-xiake-bixue.md` | `sk_xiandutuna` | 仙都吐纳 | `yin` |
| `skills-xiake-bixue.md` | `sk_shanzongxinfa` | 山宗心法 | `yang` |
| `skills-xiake-bixue.md` | `sk_chuangwangtuna` | 闯军吐纳 | `yang` |
| `skills-xiaoyao.md` | `sk_beiming` | 北冥神功 | `yin` |
| `skills-xiaoyao.md` | `sk_xiaowuxiang` | 小无相功 | `harmony` |
| `skills-xiaoyao.md` | `sk_zuowangxinfa` | 坐忘心法 | `harmony` |
| `skills-xiaoyao.md` | `sk_yunyougong` | 云游功 | `harmony` |
| `skills-xiaoyao.md` | `sk_bahuang` | 八荒六合唯我独尊功 | `yang` |
| `skills-xiaoyao.md` | `sk_lingjiuxinfa` | 灵鹫心法 | `yang` |
| `skills-xiaoyao.md` | `sk_huagong` | 化功大法 | `yin` |
| `skills-xiaoyao.md` | `sk_xingxiudugong` | 星宿毒功 | `yin` |
| `skills-xiaoyao.md` | `sk_douzhuan` | 斗转星移 | `harmony` |
| `skills-xiaoyao.md` | `sk_longchengxinfa` | 龙城心法 | `harmony` |
| `skills-xiaoyao.md` | `sk_canheqigong` | 参合气功 | `harmony` |
| `skills-xiaoyao.md` | `sk_longxiang` | 龙象般若功 | `yang` |
| `skills-xiaoyao.md` | `sk_zhuohuogong` | 拙火功 | `yang` |
| `skills-xiaoyao.md` | `sk_mizonghufashen` | 密宗护法身 | `yang` |
| `skills-xiaoyao.md` | `sk_xueshanlianqi` | 雪山炼气 | `yang` |
| `skills-xiaoyao.md` | `sk_helanxinfa` | 贺兰心法 | `yang` |
| `skills-xiaoyao.md` | `sk_junzhongxingqi` | 军中行气 | `yang` |
| `skills-xiaoyao.md` | `sk_wuliangxinfa` | 无量心法 | `harmony` |
| `skills-xiaoyao.md` | `sk_jianyingxinfa` | 剑影心法 | `harmony` |
| `skills-xiaoyao.md` | `sk_yubigong` | 玉壁功 | `harmony` |
| `skills-xiaoyao.md` | `sk_saibeixinfa` | 塞北心法 | `yang` |
| `skills-xiaoyao.md` | `sk_juxianyijue` | 聚贤义诀 | `yang` |
| `skills-xiaoyao.md` | `sk_changbaicaogong` | 尝百草功 | `harmony` |
| `skills-yitian.md` | `sk_jiuyang` | 九阳神功 | `harmony` |
| `skills-yitian.md` | `sk_qiankun` | 乾坤大挪移 | `harmony` |
| `skills-yitian.md` | `sk_emeijiuyang` | 峨眉九阳功 | `yin` |
| `skills-yitian.md` | `sk_wudangjiuyang` | 武当九阳功 | `yang` |
| `skills-yitian.md` | `sk_guangmingxinfa` | 光明心法 | `harmony` |
| `skills-yitian.md` | `sk_shenghuoxinfa` | 圣火心法 | `yang` |
| `skills-yitian.md` | `sk_emeixinfa` | 峨眉心法 | `yin` |
| `skills-yitian.md` | `sk_kunlunxinfa` | 昆仑心法 | `yang` |
| `skills-yitian.md` | `sk_kongtongyangshenggong` | 崆峒养生功 | `yin` |
| `skills-yitian.md` | `sk_huashanxinfa04` | 华山心法 | `harmony` |
| `skills-yitian.md` | `sk_xuanmingxinfa` | 玄冥心法 | `yin` |
| `skills-yitian.md` | `sk_tiequanzhuang` | 铁拳桩 | `yang` |
| `skills-yitian.md` | `sk_tieniuyaogong` | 铁牛腰功 | `harmony` |
| `skills-yitian.md` | `sk_shenghuotunajue` | 圣火吐纳诀 | `harmony` |
| `skills-yitian.md` | `sk_emeitunajue` | 峨眉吐纳诀 | `yin` |
| `skills-yitian.md` | `sk_kunluntunajue` | 昆仑吐纳诀 | `yang` |
| `skills-yitian.md` | `sk_kongtongtunajue` | 崆峒吐纳诀 | `harmony` |
| `skills-yitian.md` | `sk_huashantunajue04` | 华山吐纳诀 | `harmony` |

### 7.3 NR4 全部改性与逐门复查结果（80 门）

✅ 对每门执行 `rg -n -F -e <ID> -e <中文名>`，并补九阳 / 吸星 / 葵花 / 混元等简称；在命中处检查主辅运、前置、底座、套装、门槛和效果语义。05 §5.3.1 历史与本次新表每门已单独核实，下面位置不重复列该审计节。系统双键原始计数为 23 门 / 109 行次，57 门在审计节之外无双键命中；简称检查及新增说明另纳入处理结果。

图鉴逐门原始检索 872 行次，其中跨册 87 行次；排除葵花飞针前缀 8、华山心法倚天支同名 7、华山吐纳倚天 / 碧血支同名 16，得到有效跨册 `87−8−7−16=56` 行次（51 个物理行）。原册卡与镜像均保留，现值 / 经脉另由 265 卡核对覆盖；所有改动严格限于跨册说明。没有跨册命中不等于没有正式卡。

位置缩写：`03:782` 表示相应系统文档行号；图鉴省略 `docs/design/catalog/skills-` 前缀和 `.md` 后缀。“本册数”是该门在正式归属图鉴的原始命中行次；“无”表示无相关跨册引用。各 ID 的正式中文名 / 归属见 §7.2；改前来自相应 NR4 报告，改后均与现卡核对。

| 内功 | 改前→现值 / 范围 | 系统位置（不含05审计节） | 本册数；跨册位置 | 处理结果 |
|---|---|---|---|---|
| `sk_taohuaguiyuanjue` 桃花归元诀 | `harmony→yin`；基线 | 20:858,862,863；21:1400 | 12；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_quanzhenzhoutiangong` 全真周天功 | `yang→harmony`；基线 | 无 | 10；daojia:166 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_bosishenghuoxuangong` 波斯圣火玄功 | `harmony→yang`；基线 | 无 | 12；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_kongtongwuxingxinfa` 崆峒五行心法 | `harmony→yin`；基线 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_huashanliangyixinfa04` 华山两仪心法 | `harmony→yang`；基线 | 无 | 5；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_jianzongxingqi` 剑宗行气诀 | `harmony→yang`；基线 | 无 | 7；wuyue:15 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_dingshixinfa` 丁氏心法 | `harmony→yin`；基线 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_shiliangwuxinggong` 石梁五行功 | `harmony→yin`；基线 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_xianduyunqi` 仙都运气诀 | `harmony→yin`；基线 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_huashanqigong07` 华山养气功 | `yang→harmony`；基线 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_tiejianxuangong` 铁剑玄功 | `harmony→yang`；基线 | 无 | 10；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_bukuhutiaogong` 布库护腰功 | `yang→harmony`；基线 | 无 | 4；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_fansenghutigong` 番僧护体功 | `yang→harmony`；基线 | 无 | 4；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_wangwuzhenshanxinfa` 王屋镇山心法 | `harmony→yin`；基线 | 无 | 4；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_pingxixingqijue` 平西行气诀 | `yang→yin`；基线 | 无 | 4；kangxi:1052 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_yanpingfanchaojue` 延平泛潮诀 | `harmony→yin`；基线 | 无 | 4；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_luochabujunhuxi` 罗刹步军呼吸 | `harmony→yin`；基线 | 无 | 4；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_huiwuguixin` 会武归心诀 | `harmony→yin`；追加 | 无 | 9；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_quanzhentunajue` 全真吐纳诀 | `yang→yin`；追加 | 无 | 9；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_baiyunguanxinfa` 白云观心法 | `harmony→yin`；追加 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_beidouxinfa` 北斗心法 | `yang→harmony`；基线 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_jianzhongtuna` 剑冢吐纳 | `harmony→yang`；追加 | 07:465,697,705 | 10；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_taihegong` 太和功 | `harmony→yin`；追加 | 无 | 13；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_wudangyangshenggong` 武当养生功 | `harmony→yin`；基线 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_zhenwudaoyin` 真武导引 | `harmony→yin`；追加 | 无 | 9；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_shanyetuna` 山野吐纳 | `harmony→yin`；追加 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_jindunxinfa` 金盾心法 | `yang→harmony`；基线 | 无 | 5；bulu-07-bixue:300 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_wuguanxinfa` 武馆心法 | `harmony→yin`；基线 | 无 | 20；shaolin:1184,1199；wujue:3145 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_jianghutuna` 江湖吐纳 | `harmony→yin`；基线 | 07:490,1051 | 20；bulu-06-xiake:134；bulu-09-liancheng:50；shaolin:1184,1199；wujue:3145 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_zhuangxingong` 壮行功 | `yang→yin`；追加 | 无 | 8；bulu-07-bixue:132；bulu-12-shujian:54,198 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_tunaqianjue` 吐纳浅诀 | `harmony→yin`；追加 | 07:490,1051 | 12；shaolin:1199 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_huxixingqi` 呼吸行气 | `harmony→yin`；追加 | 07:490,1051 | 8；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_daqixinfa` 大旗吐纳 | `harmony→yin`；基线 | 无 | 13；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_qinglongtuna` 青龙吐纳 | `harmony→yin`；基线 | 无 | 10；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_xuedaoxinfa` 血刀心法 | `yin→harmony`；基线 | 无 | 18；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_meinianshengxinfa` 梅门心法 | `harmony→yin`；基线 | 07:486,994 | 16；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_linrenhexinfa` 林任合心诀 | `harmony→yin`；基线 | 无 | 9；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_xiangxituna` 湘西吐纳 | `harmony→yin`；追加 | 07:486,994,999；20:1241 | 15；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_pingxituna` 平西军吐纳 | `yang→yin`；追加 | 无 | 8；bulu-08-luding:158 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_miaojiaxinfa` 苗家心法 | `harmony→yin`；基线 | 无 | 12；bulu-13-feihu:78,79,80,206,207 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_guangpingxinfa` 广平心法 | `harmony→yin`；基线 | 无 | 11；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_huibutunaxi` 回部吐纳 | `harmony→yin`；追加 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_miaojialianqi` 苗家炼气 | `harmony→yin`；追加 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_gaibanghuxinfa` 丐帮护心法 | `yang→harmony`；基线 | 无 | 5；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_taohuatunaxi` 桃花吐纳息 | `harmony→yin`；基线 | 无 | 4；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_baituotunadu` 白驼吐纳术 | `yin→harmony`；基线 | 无 | 5；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_duanshiyangshenggong` 段氏养生功 | `harmony→yin`；基线 | 无 | 6；bulu-01-tianlong:34,72 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_jiuyintiaoxipian` 九阴调息篇 | `harmony→yin`；基线 | 07:460,625,635 | 8；无 | 07补谱系与性质说明；计件不变 |
| `sk_biguqipian` 辟谷气篇 | `harmony→yin`；基线 | 07:460,625,635 | 9；无 | 07补谱系与性质说明；计件不变 |
| `sk_yaoputunaxi` 药圃吐纳息 | `harmony→yin`；追加 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_shexingtunaxi` 蛇形吐纳息 | `yin→harmony`；追加 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_wangfutunaxi` 王府吐纳息 | `yang→yin`；追加 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_xixing` 吸星大法 | `yin→harmony`；基线 | 03:782；05:995,1052,1768,1770,1828,1830,2289；07:480,912；10:1811；20:778,1155,1160 | 22；bulu-05-xiaoao:276,305,308；shaolin:291；xiaoyao:499,550 | 03/05代表、20校合改调和；其他引用保留 |
| `sk_kuihua` 葵花宝典 | `yin→yang`；基线 | 03:782；05:1050,1780,1782,1788,1802,2945；07:480,481,912,925；10:356,1006,1812；20:779,1162,1167 | 23；bulu-05-xiaoao:276,335,338,341,361,453,484 | 03/05代表及收益、20校合改阳；其他引用保留 |
| `sk_zixiashengong` 紫霞神功 | `yang→harmony`；基线 | 07:478,885；20:777,780 | 18；bulu-05-xiaoao:94,96,120,121；xiake-bixue:145,654,1576,1596 | 20新增调和可达实例；其他引用保留 |
| `sk_huashanxinfa` 华山心法 | `harmony→yin`；基线 | 07:478,885 | 14；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_huashantuna` 华山吐纳 | `harmony→yin`；基线 | 07:478,885 | 11；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_taishanxinfa` 泰山心法 | `harmony→yang`；基线 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_taishantuna` 泰山吐纳 | `harmony→yang`；基线 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_hengshanbeixinfa` 恒山心法 | `harmony→yin`；基线 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_hengshanbeituna` 恒山吐纳 | `harmony→yin`；基线 | 无 | 6；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_riyuexinfa` 日月心法 | `yin→harmony`；基线 | 07:480,912；20:778,782 | 19；bulu-05-xiaoao:272 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_heimutuna` 黑木吐纳 | `yin→harmony`；基线 | 07:480,912 | 15；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_wuxianbaidugong` 五仙百毒功 | `yin→harmony`；基线 | 无 | 15；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_changlexinfa` 长乐心法 | `harmony→yin`；基线 | 无 | 9；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_hunyuangong` 混元功 | `yang→harmony`；基线 | 07:483,955,960；20:780,1218 | 18；bulu-07-bixue:226,351；general:635 | 20校合改调和；成员/前置保留 |
| `sk_changletuna` 长乐吐纳 | `harmony→yin`；追加 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_xuansuzhuanggong` 玄素桩功 | `harmony→yin`；追加 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_shangqingtuna06` 上清吐纳·侠客 | `harmony→yin`；追加 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_tiejantuna` 铁剑吐纳 | `harmony→yin`；追加 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_xiandutuna` 仙都吐纳 | `harmony→yin`；追加 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_jiuyang` 九阳神功 | `yang→harmony`；基线 | 03:782,1210；05:11,1052,1240,1289,1290,1728,1730,1749,1751,1829,1832,2032,2034,2305,2311,2314,2315,2325,2378,2675,2967,3102,3180；07:822；10:1003；20:777,778,1137；21:1184 | 18；shaolin:996,1011 | 03/05/21标签与05算例/样卡、10特例、20门槛已同步 |
| `sk_emeijiuyang` 峨眉九阳功 | `yang→yin`；基线 | 05:1051；07:475,841 | 18；无 | 05作阴性代表；07成员保留 |
| `sk_shenghuoxinfa` 圣火心法 | `harmony→yang`；基线 | 07:474,828 | 12；bulu-04-yitian:146 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_emeixinfa` 峨眉心法 | `harmony→yin`；基线 | 07:475,841 | 16；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_kunlunxinfa` 昆仑心法 | `harmony→yang`；基线 | 无 | 8；bulu-04-yitian:329,335 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_kongtongyangshenggong` 崆峒养生功 | `harmony→yin`；基线 | 07:476,855 | 10；bulu-04-yitian:358,364 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_tieniuyaogong` 铁牛腰功 | `yang→harmony`；基线 | 无 | 8；无 | 无外部镜像需改；本册卡与镜像保持 |
| `sk_emeitunajue` 峨眉吐纳诀 | `harmony→yin`；追加 | 07:475,841 | 11；无 | 保留：无旧性质；纯ID/前置/谱系/特效按原文 |
| `sk_kunluntunajue` 昆仑吐纳诀 | `harmony→yang`；追加 | 无 | 7；无 | 无外部镜像需改；本册卡与镜像保持 |

补充非精确全名命中：道家 §5.2 行1257 的“纯阳 / 九阳一系阳”已限定为纯阳无极功和武当九阳功，九阳本经 / 其他支系按正式卡读值；该概括同时涉及未改性的武当 / 少林九阳，不能机械整组改性。

重点前置复核：段氏养生功6重→段氏一阳诀（阴→调和）；壮行功5重→铁胆庄心法（阴→阳）及金龙帮心法（阴→调和）；江湖吐纳5重→丁氏心法（阴→阴）；金盾心法5重→明宫护院功（调和→阳）。其 `reqs` 只校层数、属性、资质和来源，没有同性或同时主运条件，因此均可达，纯 ID / 层数不改。少林与五绝的通行3/3/3底座是目录和前置闭合证明，不承诺同时装配无相冲；军旅吐纳本身仍为阳。

### 7.4 逐文档处理表（位置 / 改前 / 改后）

| 文档 / 位置 | 改前 | 改后 |
|---|---|---|
| 03 §5.2 行782 | 九阳阳、吸星 / 葵花阴 | 九阳 / 吸星调和，葵花阳；引用主修经脉规则 |
| 03 §5.2 行790 | 调和对阴阳招 +4% | 按 Canon / 05 同步为各 +6%，给出折半算式 |
| 05 §5.3 行1050–1052 | 性质代表含旧九阳 / 吸星 / 葵花 | 移到现性质代表栏；加峨眉九阳阴性示例 |
| 05 §5.3.1 行1073起 | NYY 254 / 缺107 / 冲突56被写作当前待迁移 | 历史表数值与56门记录保留；标明历史，并追加25册现值、三项全零与完整80门清单 |
| 05 §5.5 行1289–1290 | 九阳阳、辅运0.40、贡献34.4%、mpMax约20.6% | 九阳调和；同源0.50＋易筋大成0.10＝0.60；贡献51.6%、mpMax30.96% |
| 05 §9.1.4 行1802 | 葵花天中内功阴 | 阳；代价、誓约、招式与数值不变 |
| 05 §13.4 行2305起 | 标题/YAML阳、描述“至刚至阳”易混淆静态性质 | 标题/YAML调和，叙述说明任督并修；档案、门槛与护体档引用现图鉴 |
| 05 §17 D25 / O8 | 九阳反震仍待同步；只要求重跑254卡 | D25已解决并保留追溯；O8明确完整265卡覆盖，11卡补查 |
| 07 §10.5 行635 | 未明确九阴成员的性质差异 | 两篇为阴、总纲调和；谱系筛选不要求同性，计件不变 |
| 10 §5.4 行1003 | 天阶阳性主运才令袋迸裂 | 以有效天阶为共同门槛，阳性或具名九阳主运均触发；明确辅运不触发 |
| 20 §7.3 / §7.3.1 行763–782 | 性质门槛未连现图鉴，无四项可达实例 | 指向05与现图鉴；新增来源、真实层数、携带及时序复核 |
| 20 §9.4.3 行1136–1137 | 九阳C12（阳） | C12（调和）；《阳脉卷》只作叙事名 |
| 20 §9.5.2 行1160 | 吸星C11（阴） | C11（调和） |
| 20 §9.5.3 行1167 | 葵花C11（阴） | C11（阳） |
| 20 §9.6.6 行1218 | 混元C9（阳） | C9（调和）；任务/旧报告称§10.7，按当前实际章节同步 |
| 21 §10.4 行1184 | 九阳12天上/阳 | 调和；阳体段额外−500bp特色与修复+10%保留 |
| 21 §18.6 行2284 | 图鉴实例交后续落地 | 已解决：NR4完成，引用05历史与落地结果 |
| 道家图鉴 §5.2 行1257 | “纯阳 / 九阳一系阳” | 限定具体武学，其他九阳本经/支系读取各自卡面 |

✅ 07 的 44 套均检查成员、效果及可达性：一阳 / 古墓玉女 / 武当真武 / 光明圣火中的阴阳招式筛选不等于成员内功性质筛选；无需改成员、计件或数值。20 共27条显式 `Cn（性质）`逐项对照：15内功目标、12外功 / 轻功，只有上述四项需改，其他配方收窄保持。

### 7.5 重算过的算例与可达性

| 项 | 算式 / 结论 |
|---|---|
| 05 易筋10主运＋九阳8辅运 | `auxRatio=min(0.60,0.50+0.10)=0.60`；`innerScale=0.30+0.07×8=0.86`；贡献 `0.86×0.60=0.516`；基础mpMax增幅 `60%×0.516=30.96%`，显示 `31.0%` |
| 同例未启用易筋大成的对照 | `0.86×0.50=0.43`；`60%×0.43=25.8%`。实际示例有效10重必须用上一行，不遗漏已解锁被动 |
| 03 调和相性 | 阴阳招的同源峰值 `+12%×1/2=+6%`；旧 +4% 是过时镜像，无新乘区 |
| C12 九阳 | `max(4,12−3)=9`、`ceil(12/2)+1=7`；笑傲完整紫霞9品调和7重可满足，符合九阳传承最早ch05 |
| C11 吸星 | `max(4,11−3)=8`、`ceil(11/2)+1=7`；倚天九阳12品调和7重经笑傲携入ch06，另携日月心法6重，`2≤2`内功携带限额；硬身份/来源与前置保留 |
| C11 葵花 | 同为8品7重；纯阳无极功8品阳7重经合法来源携入ch06可满足，成年与誓约仍硬校验 |
| C9 混元 | `max(4,9−3)=6`、`ceil(9/2)+1=6`；碧血紫霞残承 `sourceGrade8/maxLayer8`练至6重携入鹿鼎，`8≥6`、`6≤8`；混元掌8重另按原前置携入/取得 |

03 §9.4 的具名配装仍动态引用05，没有保留内功手算面板；九阳改性后该组合的基础辅运确由0.40升至0.50，易筋10重实际由0.50升至0.60，不能写成“比例没变”。03 §3.5 STD 是通用同源预算而非该具名组合，因此 STD 表与基准曲线不变。其他寒毒免疫、七伤免伤、阴阳招式特效、原著叙事与性质分类分开处理，没有凭名称改效果。

### 7.6 指定验收命令

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ exit 0；严格失败0、新增未定义/弃用0、套装不对称0；既有基线未定义1项仍由基线接纳 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ exit 0；170 tests，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ exit 0；47 checks，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ exit 0；all checks passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ exit 0；all checks passed |
| `python3 tools/balance/boss_pacing.py --check` | ✅ exit 0；all checks passed |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict` | ✅ exit 0；654条路线、654个不同序列；exact / ≥80%相似 / warnings均0 |
| `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-*.md` | ✅ exit 0；25册三项均0，修改前后无变化 |

### 7.7 范围、完整性与交接

- ✅ 只修改授权的七份正文与本报告，未运行改变仓库状态的 git 命令；临时扫描脚本、原始输出仅存 `/tmp`，不入库。
- ✅ 独立比对卡面 `nature`、`inner.meridians` 和所有图鉴路线定义，未改任何卡自身字段、路线、CT、风险或数值；21 §12.1 三条降龙路线逐字不变，全文 `ap_ / mfr_ / mv_` 顺序不变；07成员表与注册表逐字不变。
- ✅ 不新造ID，不删除既有待决项；历史基线及改性前值只用于追溯，均有明确历史标签。性质分类沿用本作原创扩展，无新增原著引文或未经核对的回目。
- ✅ 分节以小补丁保存，完成后通读相关全文并核查围栏、表格、标题与结尾；新增内容无截断、无占位；`git diff --check`通过。
- ⚠️ 现有检查器覆盖缺口已用完整扫描补齐，但工具本身不在写集内；不能把“脚本254/254通过”误报为工具已识别265卡。
- ⚠️ 写集外章节60条旧主运、84条辅运派生与独立性质文字尚未由本任务修改，完整交接见§6；没有宣称全仓故事 / NPC / 战斗镜像已经同步完成。
- ✅ 需作者确认的事项与默认值见§4，本任务没有暂停等待确认；已完成当前写集的可执行同步。
