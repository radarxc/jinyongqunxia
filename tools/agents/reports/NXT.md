# NXT 报告 · 天阶扩容：为顶尖人物补具名天阶主运，并登记作者三项决定（扩容 / 音功 / 大手印掌风）

## 1. 摘要（3–6 行）

- 已按作者 2026-09-28 决定把普通天阶由 `51=8/15/28` 扩至 `59=9/18/32`，Canon v1.6 同步书界池、正式定义源及音功 / 掌风口径。
- NXB01 三门先行新增与本任务四个新 ID、一个既有 ID 升阶共同构成净增 8 门；岳不群、黄药师、裘千仞、玄冥二老、波斯三使均已接入可正常习得的具名主运。
- 四部书界按 `design/21` §11.9 保持七参地位下限并复核静态节奏；超窗只沿用既有 HP 倍率，未压低经脉或防御倍率。
- 音功采用逐招 `sonic + projection` 兼容分支，大手印跃击只把落点掌风算外放；逐招数据改标已完整列交 NXfix。
- 九组验收中八组通过；单元测试仅有写集外旧断言 `75 != 78` 一项预期失败，须协调者同步。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要章节 / 产出 |
|---|---:|---|
| `docs/00-canon.md` | 905 | v1.6 V16-01～04；§3 / §4 / §8 / §9 / §13 / §18 |
| `docs/decisions/author-requirements.md` | 280 | AR-17 原文、解读与落实位置；统计口径修正 |
| `docs/decisions/ultimate-counts-tianzhong-dizhong.md` | 330 | v1.1 §3.1A；天中 18、地中 60、合计 78 |
| `docs/design/21-meridian-flow-and-moves.md` | 2,288 | v2.5 §4.4.1、MF-V16/V17、MF-T23/T24、§18.3 / §18.6 |
| `docs/decisions/canon-proposals-v1.2.md` | 383 | v1.6 处理记录 |
| `docs/design/catalog/skills-bulu-02-shediao.md` | 357 | 桃花归元诀；铁掌运气功升天下 10 |
| `docs/design/catalog/skills-bulu-04-yitian.md` | 571 | 玄冥寒元功、波斯圣火玄功；ID 清单修复 |
| `docs/design/catalog/skills-bulu-05-xiaoao.md` | 479 | 华山紫气诀；ID 清单修复 |
| `docs/design/chapters/02-shediao.md` | 1,480 | 黄药师、裘千仞主运替换与节奏复核 |
| `docs/design/chapters/03-shendiao.md` | 1,717 | 黄药师主运替换；本界池恢复为 `18/45/147/155=365` 暂计 |
| `docs/design/chapters/04-yitian.md` | 1,549 | 玄冥二老、波斯三使主运替换与阻断解除 |
| `docs/design/chapters/05-xiaoao.md` | 1,573 | 岳不群主运、来源表、池数、节奏与待决项闭合 |
| `tools/agents/reports/NXT.md` | 167 | 本报告、同步清单与验收结果 |

## 3. 关键结论与数值

### 3.1 天阶名录与书界池

- 改前普通天阶：`51 = 天上8 + 天中15 + 天下28`；改后：`59 = 天上9 + 天中18 + 天下32`。
- 增量核算：NXB01 新增 3 门；NXT 新增 4 个 ID，并把未计入旧 51 门的 `sk_tiezhangyunqigong` 由地上升为天下，故 `51+3+4+1=59`。
- 门派图鉴 11 册的旧统计仍为 `51/169/459/459=1,138`；补录册的地 / 玄 / 黄增量本版不统计，待按书补录收口后重算，不能写成 `59/168/459/459=1,145`。
- 完整原生池为天龙 17、射雕 16、神雕 18、倚天 13、笑傲 6；高武范围改为 6–18，中武为 1–6。射雕的桃花归元诀仅按 10 品残承投放，不计完整池；神雕使用完整 11 品来源。

### 3.2 扩容武学

| ID | 名称 | 品阶 / 性质 | 门派 | 绝招数 | 正常习得途径摘要 |
|---|---|---|---|---:|---|
| `sk_duanshiyangjue` | 段氏一阳诀（原创扩展） | 天中 11 / 调和 | 大理段氏 | 2 | 段氏 L4 护谱亲授至 10；天龙寺护谱参详至 8 |
| `sk_xianglongxinggong` | 降龙行功（原创扩展） | 天上 12 / 阳 | 丐帮 | 3 | 萧峰羁绊亲授；洪七公按丐帮 L5 / 高羁绊传授，保留前置 |
| `sk_tianshanliuyangxinfa` | 天山六阳心法（原创扩展） | 天中 11 / 阳 | 灵鹫宫 / 逍遥派 | 2 | 童姥、虚竹亲授至 10；石壁行功图至 8 |
| `sk_taohuaguiyuanjue` | 桃花归元诀（原创扩展） | 天中 11 / 调和 | 桃花岛 | 2 | 射雕桃花 L4 亲授 / 潮汐图为 10 品 9 重残承；神雕校成亲授至 10 |
| `sk_tiezhangyunqigong` | 铁掌运气功（原创扩展） | 天下 10 / 阳 | 铁掌帮 | 2 | 射雕铁掌 L4 + 门派任务后传功 / 遗谱；神雕慈恩印证 / 旧寨遗谱 |
| `sk_xuanminghanyuangong` | 玄冥寒元功（原创扩展） | 天下 10 / 阴 | 玄冥一系 / 汝阳王府 | 2 | 玄冥师门、鹿杖客或鹤笔翁授艺至 10；王府密谱至 8 |
| `sk_bosishenghuoxuangong` | 波斯圣火玄功（原创扩展） | 天下 10 / 调和 | 波斯总教 | 2 | 总教 L4 + 圣火令 7 重经议会考校至 10；三使译谱至 8 |
| `sk_huashanziqijue` | 华山紫气诀（原创扩展） | 天下 10 / 阳 | 华山气宗 | 2 | 气宗 L5 + 紫霞 9 重，掌门传功 / 历代密卷至 10；辨义印证至 8 |

其中裁定表新增登记的天中为段氏一阳诀、天山六阳心法、桃花归元诀，均依 F/M/T 判据取 2 记绝招；降龙行功为天上固定 3 记，其余天下固定 2 记。

### 3.3 主运替换与节奏

| 人物 / 书界 | 替换前 | 替换后 | 七参结果 | 静态轮数（倍率后） |
|---|---|---|---|---|
| 黄药师 / 射雕 | 无 ID 的 10/9 地位画像 | 桃花归元诀 10 品残承 / 9 重 | `10/9;13000;9000;13000;harmony;fullTemplate;M0` | `28.7426→22.9998` |
| 裘千仞 / 射雕 | 无 ID 的 10/9 地位画像 | 铁掌运气功 10/9 | `10/9;13000;9000;13000;yang;fullTemplate;M0` | `28.7426→22.9998` |
| 黄药师 / 神雕 | 无 ID 的 11/9 地位画像 | 桃花归元诀 11/9 | `11/9;13000;9000;13000;harmony;fullTemplate;M1` | `29.17→23.00` |
| 玄冥二老 / 倚天 | 无 ID 的 10/9 地位画像 | 玄冥寒元功 10/9 | `10/9;13000;9000;13000;yin;fullTemplate;M4B` | `22.78→22.78` |
| 波斯三使 / 倚天 | 无 ID 的 10/9 地位画像 | 波斯圣火玄功 10/9 | `10/9;13000;9000;13000;harmony;fullTemplate;M4B` | `22.78→22.78` |
| 岳不群 / 笑傲 | 无 ID 的 10/9 地位画像 | 华山紫气诀 10/9 | `10/9;13000;9000;13000;yang;fullTemplate;M5` | `29.72→23.00` |

- 黄药师只建一门跨时代内功：射雕用 10 品 9 重残承，神雕校合为完整 11 品，避免两个同义 ID；神雕次序仍为 `金轮 11/8 < 黄药师 11/9 < 杨过 12/9`。
- 射雕两人的 HP 倍率均为 `0.8002`；神雕黄药师为 `0.7885`；倚天二老 / 三使保持 `1.000`；岳不群为 `0.7739`，实跑 `22.9998190146677` 轮。防御倍率均为 `1.000`，未压经脉。

### 3.4 音功与大手印口径

- 音波传播本身不是外放。只有“深厚内力驱动、可主动控制伤敌音波方向 / 强弱 / 覆盖、且有伤害段”的招式才标 `projection:true`。
- 此类音功的 `projectionStep=0` 按普通音波处理：普通 Z5M、基础范围、零外放增耗；`projectionStep≥1` 才享外放威力曲线、范围扩张及额外耗内。静态 `DamageKind='projected'` 与护体 40% 语义本轮不暗改。
- 大手印的 `mv_dashouyin_dashouyin` 跃击落点掌风算外放；跃迁位移本身不另造第二伤害段。

## 4. 开放问题（附默认值）

| 条目 | 默认值 |
|---|---|
| 外放范围硬顶与耗内 | 0 / 1 / 2 档为射程 `+0/+2/+4`、范围 `+0/+1/+2` 档、额外耗内 `0/2%/4% MPREF` |
| 外放威力乘区 | 并入并替代普通攻击 Z5M 曲线，总硬界仍为 6500–22000 bp，不新建或叠乘新乘区 |
| 音功 0 档防护类别 | 保持静态 `projected` 与护体内劲 40% 适用率，只切普通 Z5M / 基础范围 / 零外放增耗 |
| 补录低三阶总量 | 暂不汇总；保留门派图鉴 11 册 `51/169/459/459=1,138` 基线，待按书补录收口统一重算 |
| 桃花归元诀时代关系 | 保持一门 ID：射雕 10 品残承、神雕完整 11 品 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 / 状态 |
|---|---|---|
| NXB01-P01 | 普通天阶由 51 先扩至 54，加入天龙三门主运 | 已合并采纳为 Canon v1.6 V16-01 / V16-02，最终以 59 收口 |
| SB02-P01 | 闭集与地位下限冲突期允许七参画像兜底并登记缺口 | 程序性规则保留；本次具名化后黄药师、裘千仞缺口结案，见 V16-02 |
| NXB04-P01 | 按书补录册成为正式武学定义源 | 已采纳为 V16-04，构建器须与门派册一并扫描 |
| D04-O13 | 波斯三使不得以乾坤大挪移冒充主运 | 已由 V16-02 及波斯圣火玄功解决，保留总教求取教主心法边界 |
| D05-B09 | 岳不群补华山 10 品合法主运 | 已由 V16-02 及华山紫气诀解决，不调整紫霞品阶 |
| NXT-P01 | 可控伤敌音功与大手印掌风的外放执行口径 | 已采纳为 V16-03；音功 0 档兼容分支及逐招改标仍需下游接线 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容 |
|---|---|
| `tools/lint/test_check_skill_catalogs.py:234` | 裁定表原为 75 行，本任务按要求新增 3 门后为 78；该文件不在写集，协调者须把断言 75 改为 78。 |
| `docs/design/chapters/03-shendiao.md` §12.8 | 本次已顺带把重阳七星阵首、裘千尺换为具名主运，属于 NXfix-chapters 原计划；NXfix 只需核对，不要重复替换。 |
| `docs/README.md` | 清理旧 51 门 / 1,138 总目录叙述，区分门派图鉴基线与含补录的天阶名录。 |
| `docs/design/05-martial-arts-system.md` §14 | 同步 59 门天阶、补录册正式来源及低三阶待重算口径。 |
| `docs/design/20-legacy-inheritance.md` §7.7 | 同步普通天阶 59 与跨时代残承口径。 |
| `docs/design/17-sects-compendium.md` | 同步新增门派正常传承及旧 51 门描述。 |
| `docs/design/02-timeline-and-world-tiers.md` | 同步高 / 中武天阶池上限为 6–18 / 1–6。 |
| `docs/design/chapters/01-tianlong.md` | 同步天龙完整天阶池为 17。 |
| `docs/design/04-damage-formula.md`、`docs/design/05-martial-arts-system.md`、`docs/tech/05-gameplay-engine.md` | 接入 `sonic` 运行时分支：0 档普通 Z5M / 基础范围 / 零外放增耗，1 档起外放；静态伤害类别暂不变。 |
| `tools/balance/projection_sim.py`（写集外，交给 NAu-lint / 后续工具任务） | 参考实现须接入 `design/21` §4.4.1 的 `sonic` 分支：0 档 `projectionBoostActive=false`，用普通 Z5M、基础范围、零增耗；1 / 2 档才用外放曲线；外放端点白名单对音功增加 `ap_yinwei_tiantu`、`ap_yinwei_lianquan`；补 MF-T23 用例；构建器同步落实 MF-V16 / MF-V17。 |
| NXfix / 门派图鉴 | 按下列 §7 清单逐招改标；禁止按整门武学批量标记。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 内容验收

- ✅ **天阶总数与分布**：改前 `51=8/15/28`；改后 `59=9/18/32`。Canon v1.6、AR-17、裁定表和提案处置记录一致。
- ✅ **各书界天阶池**：天龙 17、射雕 16、神雕 18、倚天 13、笑傲 6；高武 6–18、中武 1–6；射雕桃花归元诀按残承处理。
- ✅ **新增武学清单**：§3.2 已列 8 门扩容相关武学的 ID、名称、品阶、门派、绝招数与正常习得途径；本任务新卡均有门派、调息档案、护体档位及显式互异路线。
- ✅ **人物主运与轮数**：§3.3 已列替换前 / 后、七参、轮数与倍率；全部达到地位下限，未以外功冒充内功，也未压经脉。
- ✅ **黄药师次序**：一门跨时代内功落实射雕 10/9 残承与神雕 11/9 完整来源；保持 `金轮11/8 < 黄药师11/9 < 杨过12/9`。
- ✅ **作者三项决定**：AR-17 原文照录；Canon V16-01 / V16-03 与 21 §4.4.1 已落实扩容、音功、大手印掌风。
- ✅ **裁定表**：NXB01 的段氏一阳诀、天山六阳心法及本次桃花归元诀均按判据登记；天中 18、地中 60，共 78 门。
- ✅ **统计边界**：门派图鉴 11 册保持 `51/169/459/459=1,138`；没有把补录新增的铁掌运气功误算成原 169 门地阶内的“减一”。
- ✅ **正式定义源**：Canon V16-04 已登记 `design/catalog/skills-bulu-NN-*.md`；提案表同步 NXB04-P01。
- ✅ **兜底清理**：四部书界相关人物均绑定实际 `sk_*`，构建阻断和“待补专属 / 51 门闭集”措辞已解除；笑傲指定残留 grep 为 0。
- ✅ **神雕本界池**：保持暂计 `18/45/147/155=365`，未用全书目录替代；D03-P05 仍为未决，天阶部分注明已由 Canon v1.6 接收。
- ✅ **提案追溯**：21 §18.3 如实注明 NR0-P01 尚待接收；`canon-proposals-v1.2.md` 已新增 v1.6 逐项处理记录。

### 7.2 NXfix 逐招改标清单

- ✅ `skills-shaolin.md` / `sk_shizihou`：候选 `mv_shizihou_zhenhou`、`mv_shizihou_shehun`、`mv_shizihou_pozhen`、`mv_shizihou_juyin`、`mv_shizihou_shizihou`；`mv_shizihou_hexing` 保持非外放。
- ✅ `skills-shaolin.md` / `sk_jingangnuhou`：候选 `mv_jingangnuhou_zhenshe`；“怒吼”须先按紧凑卡展开取得正式 ID，不猜造。
- ✅ `skills-wujue.md` / `sk_bihai`：候选 `mv_bihai_chaoqi`、`mv_bihai_chaoyong`、`mv_bihai_jingtao`、`mv_bihai_chaosheng`、`mv_bihai_yuyin`；`mv_bihai_xinsui`、`mv_bihai_dingshen` 保持非外放。
- ✅ `skills-wujue.md` / `sk_biluofengyan`：`mv_biluofengyan_fengyan`、`mv_biluofengyan_yanbosan`、`mv_biluofengyan_biluoyin` 保持非外放。
- ✅ `skills-wujue.md` / `sk_gaibangchuansheng`：`mv_gaibangchuansheng_changxiao`、`mv_gaibangchuansheng_yinghe`、`mv_gaibangchuansheng_hezhi` 保持非外放。
- ✅ `skills-wujue.md` / `sk_lianhualuo`：`mv_lianhualuo_shulaibao`、`mv_lianhualuo_yinghe`、`mv_lianhualuo_taoshang` 保持非外放。
- ✅ `skills-wujue.md` / `sk_junzhanghao`、`sk_qimenyinlu`、`sk_yanjiehao`：一行卡无正式 `mv_*` 与伤害段，保持非外放；`sk_yuxiaoduanji` 是实体玉箫短击，也保持非外放。
- ✅ `skills-wuyue.md`：`mv_qixianwuxingjian_fanyin`、`mv_qixianwuxingjian_luanxian`、`mv_qixianwuxingjian_qiming`、`mv_qixianwuxingjian_wuxing`、`mv_xiaoaojianghuqu_he`、`mv_xiaoaojianghuqu_tongsheng` 接新 0 档分支；`mv_xiaoaojianghuqu_qingyin`、`mv_xiaoaojianghuqu_hezuo` 与 `sk_shigudaxuebi` 保持非外放。
- ✅ `skills-general.md` / `sk_chuanyunxiao`：候选 `mv_chuanyunxiao_chuanyun`；“断喝 / 回声”先展开正式 ID。`sk_qixianyin` 候选 `mv_qixianyin_luanxian`，“定弦 / 和鸣”保持非外放。
- ✅ `skills-general.md` / `sk_qingxinqupu`：`mv_qingxinqupu_dingxian`、`mv_qingxinqupu_hesheng`、`mv_qingxinqupu_qingxin`、`mv_qingxinqupu_jiefen`、`mv_qingxinqupu_wanlai` 保持非外放。
- ✅ `skills-general.md` / `sk_diquxinfa`、`sk_ningxinjue`：紧凑卡动作均为增益 / 驱散且无正式 `mv_*`，保持非外放。`sk_chuanyinfa`、`sk_diqurumen`、`sk_qingxinshou`、`sk_shouxinjue` 同样无伤害段与正式 `mv_*`，保持非外放。
- ✅ `skills-qianlong.md` / `sk_jindifa`：`mv_jindifa_luaner` 接新 0 档分支；实体笛招 `mv_jindifa_zhongting`、`mv_jindifa_sandie` 与支援招 `mv_jindifa_huban` 保持非外放。
- ✅ `skills-xiaoyao.md` / `sk_chuanyinsouhun`：候选 `mv_chuanyinsouhun_duohun`、`mv_chuanyinsouhun_shixin`；`mv_chuanyinsouhun_souhun` 保持非外放。
- ✅ `skills-xiaoyao.md` / `sk_damingzhou`：候选 `mv_damingzhou_hezhou`；`mv_damingzhou_songzhou` 保持非外放。`sk_hanguqiyin` 候选 `mv_hanguqiyin_luoyin`、`mv_hanguqiyin_qiyin`；`mv_hanguqiyin_qingyin`、`mv_hanguqiyin_heyin` 保持非外放。
- ✅ `skills-xiaoyao.md` / `sk_fuyushu`：`mv_fuyushu_huodi`、`mv_fuyushu_huanting`、`mv_fuyushu_chuanyin` 保持非外放。`sk_songxianqu` 的 `mv_songxianqu_songxian`、`mv_songxianqu_luogu` 保持非外放。
- ✅ `skills-xiaoyao.md` / `sk_dashouyin`：将 `mv_dashouyin_dashouyin` 掌风伤害段改为外放并补三档范围 / 合法端点；跃迁不另造伤害段。
- ✅ `skills-bulu-01`～`skills-bulu-14`：经关键词、招式表和伤害段复核，无音功伤害招或大手印跃击，本轮无候选改标。

### 7.3 命令验收

| 命令 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ 通过；仅输出仓库既有基线提示，strict 新失败为 0 |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ⚠️ 105 项中仅 1 项失败：写集外 `test_check_skill_catalogs.py:234` 仍断言 75，实际 78 |
| `python3 tools/lint/check_skill_catalogs.py --strict` | ✅ 25 册，`errors=0` |
| `python3 tools/agents/check_route_unique_for.py`（三册参数） | ✅ 完全相同绝招路线 0 |
| `python3 tools/agents/check_undefined_in.py`（三册 + 四书界参数） | ✅ 未定义引用 0 |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 项通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ 通过 |
| `python3 tools/balance/boss_pacing.py --check` | ✅ 通过 |
| `python3 tools/balance/projection_sim.py --check` | ✅ 通过 |
| `git diff --check` | ✅ 通过 |

### 7.4 需作者确认

- ⚠️ AR-16 的外放射程 / 范围硬顶、额外耗内与 Z5M 曲线仍采用 §4 默认值，等待作者确认；不阻断本次扩容。
- ⚠️ 音功 0 档是否连 `DamageKind` / 护体 40% 类别一起切换，默认否；如改为是，须联动 04 / 05 / Core。
- ⚠️ 补录册地 / 玄 / 黄最终总量待按书补录收口后统一重算；当前不伪造总目录数字。
- ⚠️ 原著考据仍包括裘千尺伤前铁掌传承层级、波斯总教求取教主心法前提及新增原创功名边界；现稿均已按“原创扩展 / 待考”标注。
