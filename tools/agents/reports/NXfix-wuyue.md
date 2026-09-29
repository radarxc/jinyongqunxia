# NXfix-wuyue 报告 · 终审·收尾（门派图鉴）· 五岳

## 1. 摘要（3–6 行）

- 完成 `skills-wuyue.md` 的 AR-14／16／17 终审：收口绝招动作末端、跨武学路线差异、音功外放分支、路线用途及正式 ID 口径。
- 14 本补录册逐册核对后，本册没有需要追加 `sourceChapters` 的既有武学；另增笑傲补录索引，指向同为正式定义源的八门武学。
- 六记伤敌音功补齐 `tags:[sonic]`；0 档保持普通音波，1／2 档才启用外放加持。外放总数仍为 13，不误把支援音功或实体笔招计入。
- 末端 lint 从 `11 missing + 1 tail` 降为 0；41 条绝招路线均唯一；全仓跨武学完全同序列为 0，本册内不同武学 ≥80% 重合为 0。
- 复核返修统一无形剑气的 `sonic` 视线规则，并让四条内功／护体路线同时命中武学明示经脉与任督要求，段数、CT、风险均不变。
- 全部指定门禁通过；严格 ID 检查只保留仓库基线已知 `docs/README.md` 的 `sk_babuganchan`，本任务新增错误为 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/catalog/skills-wuyue.md` | 1733 | 文首补录索引与绝招路线镜像；§5.3／§7.5 音功卡；§13.5 外放审计；§15 经脉路线；§17 校验与测试；§18 依赖收口 |
| `tools/agents/reports/NXfix-wuyue.md` | 174 | 本次来源、外放、路线、遗留、门禁与跨任务交接记录 |

## 3. 关键结论与数值

- 本册库存不变：88 门，天／地／玄／黄为 `4/12/36/36`；绝招为天 9、地 17、玄上 15，共 41 条显式绝招路线。
- 外放仍为 13 招，按品阶为天／地／玄／黄 `1/10/2/0`。本轮只改变六记音功的运行分支标签，不增加或删除外放候选。
- 六记音功统一为 `tags:[sonic] && projection:true`：`projectionStep=0` 使用基础范围、零外放增耗和普通 Z5M；1／2 档分别使用扩张表及 2%／4% `MPREF` 增耗。
- ⚠️ 条件绝招暂按加法记入 3.00 基准并保持现值：第三青峰 `3.00+0.15−0.10×0.50=3.10`；落雁 `3.00+0.15=3.15`；刺目 `(3.00+0.15)×0.85−0.10=2.5775→2.60`。全图鉴写法由后续终审统一（默认乘法），仍需作者确认。
- 路线时长与风险不因末端修正而漂移；全仓跨武学完全同序列为 0；本册内严格多样性为 `routes=41, distinct=41, exact_pairs=0, similar_pairs_ge80=0`。
- `mfr_xixing_wanliu`、`mfr_kuihua_wanzhen`、`mfr_songyangxinfa_junyue`、`mfr_riyuexinfa_riyue` 已分别补入明示的冲、冲、督、冲脉段；后两条护体路线另满足任／督要求，逐段数值未动。
- 本册 117 个唯一 `ap_*` 引用全部可在 `design/15` 找到；未登记穴位为 0。

## 4. 开放问题（附默认值）

| 编号 | 开放问题 | 默认值 |
|---|---|---|
| R-O1 | AR-16a 的 +0／+2／+4 格、0／2%／4% `MPREF` 是否最终确认 | 沿 Canon V15-02 与 `design/21` §4.4.1 现行默认执行 |
| R-O2 | AR-16b 外放专用 Z5M 曲线是否最终确认 | 沿 Canon V15-03 执行：替代普通 Z5M、不叠乘，总硬界 6500–22000 bp；音功 0 档例外走普通 Z5M |
| R-O3 | `special.optionalCombo`、`special.equipSynergy`、`special.cost` 是否进入技术 schema | 暂保留语义；若自由键不被接受，等价迁移到 `effects/conditions`，不得丢失规则 |
| R-O4 | 五仙毒掌“回风毒雾”是内劲外放还是实体毒物 | 默认保持“待考／不标外放”，待核对《笑傲江湖》相关人物与用毒情节 |
| 图鉴 WU-O09 | 无形剑气是否保留原卡“不穿墙”的 `sonic` 视线例外 | 默认按 `design/05` §4.4／`design/09` §5.5 无视遮挡；若要保留“不穿墙”，由 05／09 增设例外字段，本文不自造字段 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| WU-P02 | `design/05` §14.1–§14.5 的旧 519 门、笑傲 44 门统计应继续按全图鉴 ID 去重重算 | 本册按 AR-01 固定为 88 门；继续套旧分母会制造伪冲突 |
| WU-P03 | 明确 `special.optionalCombo`、`special.equipSynergy`、`special.cost` 的正式承载字段 | 曲谱可选合奏、装备协同与吸星代价已有玩法语义，需要稳定 schema |

已结案但保留追溯：WU-P01 独孤预算已按 CN-05／C3 收口；WU-P04 的 `mfr_*`／`txp_*` 前缀及实例归属已由 Canon v1.3／V13-C01 接纳。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `design/07` | 套装目录 | 继续评审本册 §12 的 14 个候选，并与武学／装备 `setTags` 双向闭合 |
| `design/09` | 曲谱合奏 | 保证 `sk_xiaoaojianghuqu` 单人可用，双人只追加强化，不误作必需合击 |
| `design/10` | 绣花针、七弦琴 | 保留 `eq_xiuhuazhen`／`eq_qixianqin` 联动；纳入套装时补装备侧标签 |
| `design/17` | §6.1、§6.5–§6.6、§6.8、§9.6–§9.7、§14.3 | 按本册 §18.6 回写先行候选 ID／品阶／类别 |
| `chapters/05` | 门派、梅庄、黑木崖、林家、五仙节点 | 为本册 `learnSources` 落任务／NPC／秘籍 ID，并保证九条入门链可达 |
| `chapters/07` | 华山残承 | 只复用 `sk_zixiashengong`，来源品阶 8，不另建武学 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 来源扩展落实清单（逐条）

| 补录册 | 来源扩展审计结果 | 本册处理 |
|---|---|---|
| 01 天龙 | 0 | 无五岳归属项 |
| 02 射雕 | `sk_tiezhang → ch03_shendiao` | 归五绝册；本册跳过。神雕天阶池已满 18，应按“神雕残承”处理，不向本册追加 |
| 03 神雕 | 0；`sk_jiuyin`、`sk_pojunqiangfa` 已覆盖 | 无五岳归属项 |
| 04 倚天 | 0；复用项已覆盖 | 无五岳归属项 |
| 05 笑傲 | 0；八门均原生 `[ch05_xiaoao]` | 文首新增补录索引，列八门正式定义；不重复卡、不追加来源 |
| 06 侠客 | 0 | 无五岳归属项 |
| 07 碧血 | 0 | 无五岳归属项 |
| 08 鹿鼎 | 0；`sk_dashouyin` 已覆盖 | 无五岳归属项 |
| 09 连城 | 0 | 无五岳归属项 |
| 10 白马 | 0 | 无五岳归属项 |
| 11 鸳鸯 | 0；`sk_taiyueshibeishou` 已覆盖 | 归康熙册；本册跳过 |
| 12 书剑 | `sk_baizhanxinfa → ch12_shujian` | 归通行册；本册跳过 |
| 13 飞狐 | 0 | 无五岳归属项 |
| 14 雪山 | `sk_baizhanxinfa`、`sk_pojunqiangfa → ch14_xueshan` | 均归通行册；本册跳过 |

结论：五岳册来源扩展写回 **0 项**；`sk_tiezhang` 不在本组，未改其卡，也未占用神雕完整原生天阶池。

### 7.2 改标外放清单

| 武学 | 招式 | 终审处理 |
|---|---|---|
| `sk_xiaoaojianghuqu` | `mv_xiaoaojianghuqu_he` | 补 `tags:[sonic]`；0 档普通音波锥 r2，1／2 档外放 r3/r4 |
| 同上 | `mv_xiaoaojianghuqu_tongsheng` | 补 `tags:[sonic]`；三档均敌方全场，0 档不用外放威力 |
| `sk_qixianwuxingjian` | `mv_qixianwuxingjian_fanyin` | 补 `tags:[sonic]`；0 档普通线 n3，1／2 档外放 n4/n5 |
| 同上 | `mv_qixianwuxingjian_luanxian` | 补 `tags:[sonic]`；0 档普通锥 r2，1／2 档外放 r3/r4 |
| 同上 | `mv_qixianwuxingjian_qiming` | 补 `tags:[sonic]`；三档均敌方全场，0 档不用外放威力 |
| 同上 | `mv_qixianwuxingjian_wuxing` | 补 `tags:[sonic]`；三档均单体，0 档不用外放威力 |

保持非外放：`mv_xiaoaojianghuqu_qingyin`（纯支援）、曲谱合奏被动（无伤害段）、`sk_shigudaxuebi`（实体判官笔）；本册没有大手印。

### 7.3 遗留处理表

| 遗留 | 处理结果 |
|---|---|
| 无形剑气视线描述与 `tags:[sonic]` 冲突 | ✅ §7.5 改按 `design/05` §4.4／`design/09` §5.5 无视遮挡；原“不穿墙”是否保留列为图鉴 WU-O09，需作者确认，本文未自造例外字段 |
| 需作者确认 | ⚠️ 图鉴 WU-O09：若仍要无形剑气“不穿墙”，须先由 `design/05`／`design/09` 定义 `sonic` 视线例外字段 |
| §15.1 显式步骤定义位置表述失实 | ✅ 改为绝招路线只在文首索引定义，7 条外放普通招式只在 §15.4 专表定义，其余行均为绑定／核算镜像 |
| 四条路线未落实武学明示经脉／护体任督 | ✅ 万流、万针、峻岳、日月分别补冲、冲、督、冲脉穴，日月另补任脉穴；续作将峻岳首段换为 `ap_dumai_shenzhu`，消除与康熙册路线的新增 ≥80% 警告；段数、逐段 CT／风险、动作末端不变 |
| 条件绝招加法／乘法混写 | ⚠️ 本册暂保持加法，倍率仍为 3.10／3.15／2.60；全图鉴写法由后续终审统一（默认乘法），需作者确认 |
| `mfr_wanliduxing_yuandun` 用途 | ✅ 正文索引与 §15.5 镜像由 `attack` 同步为 `movement` |
| 出招末端缺失／位置 | ✅ 修 11 条缺失、1 条位置；详见 §7.4 |
| 跨武学路线高度相似 | ✅ 重配 `mfr_hanbingzhenqi_fengmai`、`mfr_xixing_sangong`、`mfr_kuihua_cimu`；段数／CT／总风险不变，本册内不同武学 ≥80% 重合清零 |
| 音功 AR-17 分支 | ✅ 六招补 sonic 标签与 0 档规则；审计表、正文卡、索引一致 |
| 文首索引／正文 purpose | ✅ 本册 41 条 `正文≠索引=0`；唯一需改项为万里独行·远遁 |
| 未登记穴位 ID | ✅ 本册 117 个唯一 `ap_*` 全部命中 `design/15`，未登记 0 |
| 旧 `mfr_*`／`txp_*`“拟登记”措辞 | ✅ 按 Canon v1.3／V13-C01 改为正式实例，WU-P04／WU-O07 保留为“已解决” |
| 九阳反震、武当截脉手、29 记段数、焚天及其他内功路线、康熙／乾隆／古龙／少林 purpose、石碑装备桥、乾隆表格 | ➡️ 不在本册，未越权修改；见 §7.6 |
| 五绝册降龙三绝招 | ➡️ 不在本册；由五绝任务把 AR-16 审计、V-P01 与统计 39→42 收口，本任务不改路线 |

### 7.4 末端规则命中数（改前 / 改后）

| 指标 | 改前 | 改后 |
|---|---:|---:|
| 绝招路线 | 41 | 41 |
| 已分类 | 36 | 36 |
| 规则检查命中 | 39 | 39 |
| 缺失类违规 | 11 | 0 |
| 位置类违规 | 1 | 0 |
| 保守未分类 | 5 | 5 |

修正的缺失类路线：`mfr_dugu9_wuzhao`、`mfr_bixie_feiyanchuanliu`、`mfr_bixie_qunxie`、`mfr_qingchengcuixinzhang_duanmai`、`mfr_huashanjianfa_jinyan`、`mfr_yangwujian_haoran`、`mfr_songshanjianfa_kaimen`、`mfr_taishanjianfa_dongyue`、`mfr_huifengluoyan_luoyan`、`mfr_songfengjianfa_fengguoqingcheng`、`mfr_xixing_wanliu`。位置类为 `mfr_riyuejianfa_yueluo`。五条未分类是支援、音功或身法语义，均已通过其适用的 purpose／外放规则，未为迎合分类器篡改动作事实。

涉及本册的跨册 ≥80% 警告数：改前（主检出）41 → 改后 17；均按 `design/21` §4.3.4 第3条留待人工复核。

### 7.5 门禁结果

| 检查 | 结果 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | ✅ exit 0；全仓仅基线已知 `docs/README.md: sk_babuganchan`，`new=0` |
| `python3 -m unittest discover -s tools/lint -p "test_*.py"` | ✅ 126 tests，OK |
| `python3 tools/balance/damage_sim.py --check` | ✅ 47 checks，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | ✅ all checks passed |
| `python3 tools/balance/projection_sim.py --check` | ✅ all checks passed |
| `python3 tools/lint/check_skill_catalogs.py --diversity --details` | ✅ exit 0；涉及本册的跨册 ≥80% 警告 17；`mfr_songyangxinfa_junyue` 命中 0 |
| `python3 tools/lint/check_skill_catalogs.py --diversity --details docs/design/catalog/skills-wuyue.md` | ✅ `similar_pairs_ge80=0` |
| `python3 tools/lint/check_skill_catalogs.py --strict --diversity-strict docs/design/catalog/skills-wuyue.md` | ✅ errors 0；41/41 唯一路线；本册内 ≥80% 重合 0 |
| `python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-wuyue.md` | ✅ 与全仓其他武学完全相同路线 0 |
| `python3 tools/agents/check_undefined_in.py docs/design/catalog/skills-wuyue.md` | ✅ 本册未定义引用 0 |
| `python3 tools/lint/check_skill_catalogs.py --delivery --details docs/design/catalog/skills-wuyue.md` | ✅ violations 0，tail 0 |
| `git diff --check` | ✅ 无空白错误 |

### 7.6 交其他任务

| 负责册／任务 | 条目 |
|---|---|
| 五绝册 | `sk_tiezhang` 只按神雕残承登记，勿加入神雕完整原生天阶池；降龙三绝招审计改已外放，统计 39→42 |
| 倚天册 | 九阳 `innerGuard.reflectBp:1200→0`；武当截脉手·点环跳落指端；圣火心法 `ap_qihai` 改正式 ID；乾坤攻击绝招补任／督 |
| 五绝册 | 碧涛玄功·万里、易筋锻骨篇·脱胎由 6 段缩 5 段或补充分段理由 |
| 逍遥册 | 焚天路线纠正阳性底子；北冥／小无相／化功／龙象攻击绝招补任／督；大手印跃击补外放并经劳宫 |
| 康熙册 | 核对并统一四条列示 purpose；`sk_taiyueshibeishou.weaponReq.altItems` 加 `eq_changchangfengshibei` |
| 乾隆册 | 四条 purpose 镜像统一；修 §12.5 QL-O08 多余单元格；复核 `mfr_baguazhang_bafang` 正式百会 ID |
| 古龙册 | 五条 purpose 镜像统一 |
| 少林册 | 逐条核对约 17 处 purpose，并重算过期镜像 |
| 道家／通行／倚天／少林册 | 过期镜像的模板代号、段数、CT、收招合计、总风险与风险列表按文首显式路线重算 |
| 侠客碧血册 | 区分 `mfr_taixuan_shibu` 与 `mfr_shenxing_taxi` 的高度相似路线 |
| 通行册 | `mfr_tuinaliaofa_tuigong` 的 `ap_baihui` 改 `ap_dumai_baihui`；落实书剑／雪山的 `sk_baizhanxinfa` 来源扩展及雪山 `sk_pojunqiangfa` 来源扩展 |
| 后续全图鉴终审 | 条件绝招加法／乘法写法统一；本册暂保留第三青峰、落雁、刺目的加法现值，若作者无另行决定则默认按 `design/05` §4.2 的 `power = 3.00 × AF × (1+Σadj)` 改为乘法 |

### 7.7 验收标准逐条结论

- ✅ 仅修改授权的五岳图鉴与本报告；未执行改变仓库状态的 git 命令。
- ✅ 每次 `apply_patch` 均控制在约 150 行以内；文件未缩短，正文由 1723 行增至 1733 行。
- ✅ 14 本补录图鉴及 NXB 报告遗留均已核对；本册 0 项来源扩展，笑傲补录索引已落盘。
- ✅ AR-17 音功口径逐招落实，审计表、正文卡、索引与测试契约一致；本册无大手印。
- ⚠️ 条件绝招倍率与算式保持现值并已交接后续全图鉴终审；purpose、动作末端、本册内多样性及正式实例措辞已收口，旧待决项未删除，已结案项标“已解决”。
- ✅ 全部 9 条指定命令通过，另完成 `git diff --check`、117 个穴位 ID 对照与占位词扫描。
- ⚠️ 原著考据事项继续保留在图鉴 §18.4；没有把待考内容写成确定事实。
- ⚠️ AR-16a／b 数值仍待作者最终确认，本次严格按 Canon 当前默认执行，未擅改曲线。


