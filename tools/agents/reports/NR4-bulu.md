# NR4-bulu 报告 · 阴阳性质落地 · 14 本补录图鉴（AR-18：主修经脉、内功性质、路线性质）

## 1. 摘要（3–6 行）

已完成 14 本补录图鉴的 AR-18 阴阳性质落地：补齐 8 门内功的主修经脉，修正原有 17 门性质冲突，并将补录后可审计的会武归心诀由调和改为阴。
修正 10 条路线的体段投票；返修时另在其中 4 条调整一处同性质穴位，并调整五虎归潮 2 处，以消除新增高相似配对。动作出口不变，段数、逐段 CT、收招合计和风险均不变。
本单元检查结果由“路线性质冲突 8 / 内功性质冲突 17 / 缺主修经脉 8”降为“0 / 0 / 0”。
官方 `--diversity-strict` 检查覆盖 14 册 124 条绝招路线，结果为 124 条不同序列；按路线 ID 去除镜像重复后，14 册包含普通招式、绝招、吐纳、护体的完整显式路线共 266 条。本次全量比对采用相同类型与去重口径，覆盖全仓 891 条完整显式路线（含 design/21 §12.1 三条跨行 YAML 权威路线，按路线 ID 去重），并逐一比对本任务 10 条改线，完全相同路线 0、相对基点新增的相似度不低于 80% 配对 0。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| docs/design/catalog/skills-bulu-01-tianlong.md | 254 | 版本记录；天山六阳心法归元路线改为阳性体段 |
| docs/design/catalog/skills-bulu-02-shediao.md | 363 | 桃花归元诀、全真周天功性质及全套依赖同步 |
| docs/design/catalog/skills-bulu-03-shendiao.md | 414 | 版本记录；复核无三类 AR-18 命中 |
| docs/design/catalog/skills-bulu-04-yitian.md | 577 | 3 门内功性质；波斯玄功 3 路线与鹿头杖路线 |
| docs/design/catalog/skills-bulu-05-xiaoao.md | 485 | 剑宗行气诀性质及 5 条门槛；葵花飞针路线 |
| docs/design/catalog/skills-bulu-06-xiake.md | 342 | 丁氏心法性质及普通/绝招路线依赖 |
| docs/design/catalog/skills-bulu-07-bixue.md | 457 | 4 门内功性质及全部显式路线依赖 |
| docs/design/catalog/skills-bulu-08-luding.md | 355 | 6 门内功性质；相关绝招门槛与王屋路线 |
| docs/design/catalog/skills-bulu-09-liancheng.md | 192 | 版本记录；复核无三类 AR-18 命中 |
| docs/design/catalog/skills-bulu-10-baima.md | 305 | 版本记录；复核无三类 AR-18 命中 |
| docs/design/catalog/skills-bulu-11-yuanyang.md | 167 | 版本记录；复核无三类 AR-18 命中 |
| docs/design/catalog/skills-bulu-12-shujian.md | 271 | 版本记录；复核无三类 AR-18 命中 |
| docs/design/catalog/skills-bulu-13-feihu.md | 395 | 8 门内功补经脉；胡家、南海五虎路线及路线门槛 |
| docs/design/catalog/skills-bulu-14-xueshan.md | 207 | 版本记录；复核无三类 AR-18 命中 |
| tools/agents/reports/NR4-bulu.md | 159 | 改动清单、返修记录、校验结果、开放问题与跨文档同步项 |

14 本图鉴合计 4,784 行。所有图鉴版本行均追加“阴阳性质落地 AR-18（2026-09-29）”。

## 3. 关键结论与数值

- AR-18 计票按主修经脉归属，不按正逆周天或原有性质反推：任脉、六阴、阴跷、阴维投阴；督脉、六阳、阳跷、阳维投阳；冲脉、带脉按当前默认值不投票；平票或无票取调和。
- 路线只统计剔除动作出口后的体段；掌法等动作末端保持原出招方式。本次未改变动作出口语义，也未把后溪加入外放 13 端点白名单。
- 路线门槛统一为：阳性可用 [yang, harmony]，阴性可用 [yin, harmony]，调和仅用 [harmony]。
- 调息档按既有公式同步：7 品非调和 2000/468、调和 2100/491；8 品非调和 2100/492、调和 2205/516；9 品非调和 2200/516、调和 2310/541；10 品非调和 2300/540、调和 2415/567；11 品非调和 2400/564、调和封顶为 2500/592。
- 10 条路线替换体段穴位；段数、逐段 CT、收招合计和总风险/风险列表均保持原值。本次全量比对统计普通招式、绝招、吐纳、护体的完整显式路线，并按路线 ID 去除镜像重复；结果为 `explicit_routes=891; changed_routes=10; exact_matches=0; new_ge80=0`。891 条口径含 design/21 §12.1 三条跨行 YAML 权威路线，并按路线 ID 去重；该口径不同于官方只检查绝招路线的 `--diversity-strict`。

## 4. 开放问题（附默认值）

1. AR-18a：冲脉、带脉是否参与阴阳投票尚待作者确认。默认值：二者不投票；只修冲脉/带脉或有效票为零时取调和。本次按该默认值完成。
2. AR-18b：后溪是否加入外放 13 端点白名单尚待作者确认。默认值：不加入；本次保留其动作末端语义，但未将其解释为新增外放端点。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。Canon v1.8 以及 design/05、design/15、design/21 的现行规则已覆盖本任务所需定义；AR-18a、AR-18b 继续作为待作者确认的默认值追踪，不另提重复修订。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| docs/design/chapters/02-shediao.md | §12.6（约 1229、1260、1263 行） | 桃花归元诀 `harmony→yin`；同步黄药师 `innerNature` 并复核派生节奏 |
| docs/design/chapters/02-shediao.md、03-shendiao.md | 约 1265 行；§12.8（约 1513 行） | 全真周天功 `yang→harmony`；同步重阳七星阵首七参并复核派生节奏 |
| docs/design/chapters/03-shendiao.md | §12.8（约 1518、1553 行） | 桃花归元诀 `harmony→yin`；同步黄药师 `innerNature` 并复核派生节奏 |
| docs/design/chapters/04-yitian.md | §12.8、待决项（约 1285、1286、1291、1584 行） | 波斯圣火玄功 `harmony→yang`、崆峒五行心法 `harmony→yin`、华山两仪心法04 `harmony→yang`；同步三使/六派指挥七参与节奏 |
| docs/design/chapters/05-xiaoao.md | §12.8（约 1324 行） | 剑宗行气诀 `harmony→yang`；同步剑宗首领七参与节奏 |
| docs/design/chapters/06-xiake.md | §12.7（约 1407、1409 行） | 丁氏心法 `harmony→yin`；同步丁不三、丁不四七参与节奏 |
| docs/design/chapters/07-bixue.md | §12.8（约 1417–1424、1426 行）及其说明（约 1330 行） | 石梁五行功、仙都运气诀 `harmony→yin`；华山养气功07 `yang→harmony`；铁剑玄功 `harmony→yang`；同步七参与节奏 |
| docs/design/chapters/08-luding.md | §12.8（约 1480、1481、1495、1496、1499–1501 行） | 九难的铁剑玄功、王屋首领及五类精英配置同步最终性质；尤其九难 `innerNature:harmony→yang`，复核全部派生节奏 |
| docs/design/chapters/13-feihu.md | §12.8 袁紫衣行（约 1056 行） | 会武归心诀 `harmony→yin`；`innerNature:harmony→yin`，复核派生节奏 |
| docs/design/catalog/npcs-ch02/03/04/06/07/08/13-*.md | 各改性内功的主运引用 | 已逐 ID 检索；这些行只存主运 ID、未内嵌性质，数据消费端须重新解析，文本本身无旧性质可替换 |
| docs/design/05-martial-arts-system.md | §5.3.1（约 1090–1095 行） | 17 门原冲突迁移表已与本次结论一致；会武归心诀原属“缺字段”基线，历史审计无需倒改 |
| docs/design/15、21、其他技能图鉴 | 全文 ID 检索 | `design/15` 无命中；`design/21` 仅桃花归元诀示例引用、`skills-daojia` 仅全真入口引用，均未内嵌旧性质，无需同步 |

上述文件不在本任务写集内，未作修改。来源 / 获取类纯 ID 引用不受性质变更影响；只有表中明确列出的旧中文性质、`innerNature` 与派生节奏需要下游处理。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 补主修经脉清单

| 内功 | 补录主修经脉 | 依据 | AR-18 推出性质 |
|---|---|---|---|
| 苗家玄功 (sk_miaojiaxuangong) | 任脉、手厥阴、督脉、手阳明 | 卡片的守中与拳、剑相参设定；经脉组合为本作原创解释（原著具体经脉未明） | 调和（阴 2 / 阳 2） |
| 胡家玄功 (sk_hujiaxuangong) | 督脉、手阳明 | 卡片的刚健开阖、刀势外发与胡家刀传承设定（具体原著经脉未明，原创扩展） | 阳（阴 0 / 阳 2） |
| 商家堡气功 (sk_shangjiabaoqi) | 足阳明、督脉、手阳明 | 卡片的正面强攻、镇守堡寨和拳刀发力描述（具体原著经脉未明，原创扩展） | 阳（阴 0 / 阳 3） |
| 会武归心诀 (sk_huiwuguixin) | 冲脉、任脉、手厥阴 | 卡片既有两路均以冲脉汇劲，并经任脉守中、手厥阴定心；“多门会武融汇”是卡片既有设定，经脉组合是本次原创解释，袁紫衣实际师承与所会门数仍待考 | 阴（阴 2 / 阳 0；冲脉不投票） |
| 南海五虎心法 (sk_nanhaiwuhuxinfa) | 足少阳、督脉、手少阳 | 卡片的腾挪抢攻、五虎合击和外发劲路描述（具体原著经脉未明，原创扩展） | 阳（阴 0 / 阳 3） |
| 天龙门心法 (sk_tianlongmenxinfa) | 冲脉、督脉、任脉 | 卡片的中轴守正、前后周天兼修描述（具体原著经脉未明，原创扩展） | 调和（阴 1 / 阳 1） |
| 药王内功 (sk_yaowangneigong) | 手厥阴、任脉 | 卡片的内守心脉、调息辨毒与护持脏腑描述（具体原著经脉未明，原创扩展） | 阴（阴 2 / 阳 0） |
| 八极行气 (sk_bajixingqi) | 督脉、足阳明 | 卡片的整劲贯脊、踏地催力和刚猛短发描述（具体原著经脉未明，原创扩展） | 阳（阴 0 / 阳 2） |

### 7.2 改性质清单

| 内功 | 改前 → 改后 | 连带改动 |
|---|---|---|
| 桃花归元诀 (sk_taohuaguiyuanjue) | 调和 → 阴 | BreathProfile、requiredNature、调息值、护体档及依赖文字 |
| 全真周天功 (sk_quanzhenzhoutiangong) | 阳 → 调和 | BreathProfile、requiredNature、调息值、护体档及依赖文字 |
| 波斯圣火玄功 (sk_bosishenghuoxuangong) | 调和 → 阳 | BreathProfile、requiredNature、调息值、护体档及 3 条路线体段 |
| 崆峒五行心法 (sk_kongtongwuxingxinfa) | 调和 → 阴 | BreathProfile、requiredNature、调息值、护体档及依赖文字 |
| 华山两仪心法04 (sk_huashanliangyixinfa04) | 调和 → 阳 | BreathProfile、requiredNature、调息值、护体档及依赖文字 |
| 剑宗行气诀 (sk_jianzongxingqi) | 调和 → 阳 | BreathProfile、5 条显式路线 requiredNature、调息值、护体档 |
| 丁氏心法 (sk_dingshixinfa) | 调和 → 阴 | BreathProfile、普通/绝招路线 requiredNature、调息值、护体档 |
| 石梁五行功 (sk_shiliangwuxinggong) | 调和 → 阴 | BreathProfile、显式路线 requiredNature、调息值、护体档 |
| 仙都运气诀 (sk_xianduyunqi) | 调和 → 阴 | BreathProfile、显式路线 requiredNature、调息值、护体档 |
| 华山养气功07 (sk_huashanqigong07) | 阳 → 调和 | BreathProfile、显式路线 requiredNature、调息值、护体档 |
| 铁剑玄功 (sk_tiejianxuangong) | 调和 → 阳 | BreathProfile、显式路线 requiredNature、调息值、护体档 |
| 布库护腰功 (sk_bukuhutiaogong) | 阳 → 调和 | BreathProfile、绝招 requiredNature、调息值、护体档 |
| 番僧护体功 (sk_fansenghutigong) | 阳 → 调和 | BreathProfile、绝招 requiredNature、调息值、护体档 |
| 王屋镇山心法 (sk_wangwuzhenshanxinfa) | 调和 → 阴 | BreathProfile、绝招 requiredNature、调息值、护体档及路线体段 |
| 平西行气诀 (sk_pingxixingqijue) | 阳 → 阴 | BreathProfile、绝招 requiredNature、调息值、护体档 |
| 延平泛潮诀 (sk_yanpingfanchaojue) | 调和 → 阴 | BreathProfile、绝招 requiredNature、调息值、护体档 |
| 罗刹步军呼吸 (sk_luochabujunhuxi) | 调和 → 阴 | BreathProfile、绝招 requiredNature、调息值、护体档 |
| 会武归心诀 (sk_huiwuguixin) | 调和 → 阴 | 返修重核主修经脉；BreathProfile、普通/绝招 requiredNature、调息值、护体档；两条既有路线无需改穴 |

前 17 门均先复核已登记的主修经脉，再按 AR-18 票数改声明性质；会武归心诀则在补字段后经审核返修重核。没有为了保留旧 nature 而反推或改造经脉。

### 7.3 路线改动清单

| 路线 | 改前计票 → 改后计票 | 改动穴位 | 段数、CT、风险 |
|---|---|---|---|
| mfr_tianshanliuyangxinfa_guiyuan | 阴 3 / 阳 0 → 阴 0 / 阳 3 | 第 6、9、10 段任脉体段改为督脉体段 | 均不变 |
| mfr_bosishenghuoxuangong_huanming | 阴 3 / 阳 0 → 阴 0 / 阳 3 | 第 8–10 段任脉体段改为督脉体段 | 均不变 |
| mfr_bosishenghuoxuangong_tuna | 阴 2 / 阳 0 → 阴 0 / 阳 2 | 第 2 段冲脉大赫改气穴以避重复模板；第 4–5 段任脉体段改为督脉体段 | 均不变 |
| mfr_bosishenghuoxuangong_zhuanhuan | 阴 1 / 阳 0 → 阴 0 / 阳 1 | 末段任脉中脘改为督脉神柱 | 均不变 |
| mfr_lutouzhangfa_hengjue | 阴 0 / 阳 7 → 阴 6 / 阳 1 | 原前六段督脉/阳维/足少阳/手少阳改为足厥阴太冲、足少阴太溪、阴跷照海、阴维筑宾、任脉气海、手厥阴内关；末两段后溪→腕骨不变 | 均不变 |
| mfr_kuihuafeizhen_wuying | 阴 3 / 阳 4 → 阴 5 / 阳 2 | 第 3–4 段阳跷肩髃、督脉百会改为阴维筑宾、任脉膻中；末三投针导引不变 | 均不变 |
| mfr_tiejianxuangong_guiyi | 阴 8 / 阳 0 → 阴 3 / 阳 5 | 前五段任脉/手厥阴改为督脉脊中、至阳、阳维本神、天髎、手少阳天井；返修以脊中替代命门，末三段曲泽→内关→劳宫不变 | 均不变 |
| mfr_wangwuzhenshanxinfa_jushou | 阴 2 / 阳 5 → 阴 4 / 阳 3 | 第 3–5 段地机、足三里、委中改为阴陵泉、太溪、照海 | 均不变 |
| mfr_hujiaxuangong_guanshan | 阴 4 / 阳 2 → 阴 0 / 阳 7 | 前 4 段任脉改为阳跷/阳维；第 6 段冲脉上曲改为督脉百会 | 均不变；仍满足防守路线含任/督硬约束 |
| mfr_nanhaiwuhuxinfa_guichao | 阴 5 / 阳 3 → 阴 2 / 阳 6 | 前两段足厥阴改为足少阳风市、阳陵泉，第 3 段阴维期门改为阳跷仆参；末三动作出口不变 | 均不变 |

### 7.4 --delivery 三项计数

按检查器固定输出顺序 `(nature_conflicts / inner_missing_meridians / inner_nature_conflicts)`，总计由 `8 / 8 / 17` 变为 `0 / 0 / 0`。

| 检查项 | 改前 | 改后 |
|---|---:|---:|
| nature-conflict（路线性质冲突） | 8 | 0 |
| INNER_NATURE（内功性质冲突） | 17 | 0 |
| inner_missing_meridians（缺主修经脉） | 8 | 0 |

### 7.5 交其他任务的条目

- ✅ 已逐项检索并登记本册外受影响引用：chapters/02-shediao、03-shendiao、04-yitian、05-xiaoao、06-xiake、07-bixue、08-luding、13-feihu；具体同步内容见本报告 §6。
- ✅ 本任务写集之外未作修改；跨册旧性质、innerNature 和派生战斗数值留给对应章节任务处理。

### 7.6 本次返修记录

- ✅ 会武归心诀不再以路线外的带脉凑“无票调和”，改按既有路线与卡片语义登记冲脉、任脉、手厥阴，性质及整套依赖同步为阴；飞狐袁紫衣配置已登记交接。
- ✅ 审核指定四对路线均降至 `3/5=60%`：鹿角横绝/玄冥吐纳 `0/5→3/5`、圣火吐纳/段氏护脉 `2/5→3/5`、玄门归一/神龙吐息 `2/5→3/5`、王屋据险固守/赤练拂尘幻影 `3/5→3/5`。
- ✅ 额外消除五虎归潮/纳潮运气由 `2/5` 升至 `4/5` 的配对，最终为 `3/5`；本次全量比对按路线 ID 去除镜像重复后，对全仓 891 条普通招式、绝招、吐纳、护体的完整显式路线逐一复核（含 design/21 §12.1 三条跨行 YAML 权威路线），无新增 `≥80%` 配对。
- ✅ 铁剑两绝招共享值改为实际的 `1/8`（天井）；报告补列 `mfr_tiejianxuangong_guiyi`，并修正鹿角横绝及两门飞狐内功的失实文字。

### 7.7 命令验收

- ✅ check_nr4_unit.py：14 册 nature_conflicts=0、inner_nature_conflicts=0、inner_missing_meridians=0。
- ✅ check_ids.py --strict：通过；仅报告基线已知 sk_babuganchan 未定义，本任务新问题为 0。
- ✅ unittest discover：170 项测试通过。
- ✅ damage_sim.py --check：47 项检查通过。
- ✅ meridian_flow_sim.py --check：通过。
- ✅ projection_sim.py --check：通过。
- ✅ check_skill_catalogs.py --strict --diversity-strict：14 册 errors=0；官方受检的 124 条绝招路线全部唯一，新增不低于 80% 相似配对为 0。另按本次全量比对口径，14 册按路线 ID 去除镜像重复后，包含普通招式、绝招、吐纳、护体的完整显式路线共 266 条。
- ✅ check_route_unique_for.py：完全相同绝招路线 0。
- ✅ check_undefined_in.py：本单元未定义引用 0。
- ✅ check_nr3_unit.py bulu：本任务新造不低于 80% 相似配对 0。
- ✅ git diff --check：通过。
- ✅ 写集与内容完整性：只修改 14 本指定图鉴并新增本报告；未新造 ID，未留下任何占位文本。

