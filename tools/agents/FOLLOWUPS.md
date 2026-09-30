# 待作者确认事项与后续任务候选（协调者维护；本文件为准，.agents/coord/followups.md 已并入）

# 协调者待定的后续任务候选（等 NXfixD-* 全部汇报后再定）
- 学习来源落章（learnSources 接线）：NXfixD-05 报告——chapters/05 需为五岳册 learnSources 落任务 / NPC / 秘籍 ID（门派、梅庄、黑木崖、林家、五仙），保证九条入门链可达；少林三战等事件与学习来源占位（NXfix-shaolin §6）。可能各书界都有 → 考虑按书开 NXfixE-NN（写集 chapters/NN + 相关 story/12），与 NR3 并行。
- 雪山派（侠客行）补一门 ≥7 品本门外功，替换白自在临时的 `sk_jianghubaizhanjian`（NXfixD-06），之后重跑节奏并同步 npcs-ch06 → 候选：补录 06 小任务（写 skills-bulu-06 + chapters/06 + npcs-ch06），需在 NR3-bulu 合入后跑。
- 射雕（02）华山论剑"高手请教"的 `full` 对手洪七公、周伯通不在 §12.6 首领表：无七参、无节奏复核（洪七公降龙整门外放，五绝 10/9）→ 候选补行（写 chapters/02 + npcs-ch02）。
- 多人 / 援军遭遇未在遭遇级声明 `totalHp` + 分配表（09 §8.8.11）：飞狐 13 的慕容景岳+薛鹊双首领战、田归农墓前围攻（NXfixD-13）；雪山 B06 已派 NXfixD-14。可能各书界都有 → 候选：每书界 grep 多人战并补声明。
## NR4（NYY 合入后按新口径的性质冲突修正，按册）候选事项
- 各册性质冲突以 NYY 新口径（体段计票、出口不计、解析扩充后）重算；NR3 报告里的计票读法清单：少林 22、逍遥 16（其中六阳掌八方、化功 duwu/huajin、龙象护身 4 条本轮已改线仍逆性）、五岳 4（百变千幻十三式 / 百变、黑木崖剑法凌空、七弦启鸣）、侠客碧血 2（踏雪无痕凌霄、软红蛛索罗网）+ 双使合印 yang→yin 偏移复核。
- 作者确认项：侠客碧血飒沓流星式卡片写"近身扇面剑式"但路线掌心收尾（曲池→内关→劳宫），末段是否换持械腕穴；少林心意把按拳还是按掌出招。
- 全部 NR3 合入后：主检出跑 `python3 tools/agents/nr3_assign.py`（剩余 ≥80% 配对）与各单元 `check_nr3_unit.py`，查兄弟任务叠加产生的新相似。
- 倚天：性质冲突 4 条（jiuyang_puzhao、duyanfeisha_fengjiang、xunleijianfa_shiliu、yingsheshengsibo_shengsi）；O-13 待 NYY 后改"已解决"；作者确认：七伤初诀·吞吐（`mfr_qishangchujue_tuntu`，拳掌）归拳还是掌（路线既无曲池/手三里/合谷也无劳宫）。
- NR3-kangxi 须处理 `mfr_weixinliandao_lianying` ↔ 倚天 `mfr_fenshuiemeici_jingfan`（8750 bp）；NR3-bulu 须处理 `mfr_chiliandugong_duhuo` ↔ `mfr_jinsheyouzhang_chanshen`（8333）。
- 通行：性质冲突 7 条（pojunqiangfa_cuifeng、yanmengqishe_yanluo、kaimenpiguaquan_kaihe、tianwangbuxin_sanzhen、duanzhenqiang_pozhen、jiebiaodaofa_fenglu、tantui_tongxing_chuaimen），其中 5 条阳性武学本轮整条重写仍保留阴性主体；作者确认：百草辨毒·相克（友方避毒）、缩骨功·脱缚（驱散束缚）是否属疗伤 / 护体类（若是须补任脉穴）。
- 道家：性质冲突 16 条（阴判阳声明 12、阳判阴声明 4，清单见 reports/NR3-daojia.md）；原 3 对"共同传承"理由已被改开取代（剑冢传承叙事是否另保留，作者定）。
- 叙事质量（可选，作者定）：各册新路线集中复用同一组填充穴（通行：太白、中都、阴谷、大横、交信、间使、血海；逍遥：风市、梁丘、腰阳关、脊中、天宗、阳谷），接近 21 §4.3.1 警告的"从穴位池批量抽取"——可安排一轮叙事润色。
- 补录：性质冲突 7 条（天山六阳归元、鹿杖横绝、布库护身、番僧金刚、平西连阵、胡家关山、南海归潮）；作者看：天池百花归元改后收在手厥阴大陵（"归元"收腕部是否合意）；天池新路线"大赫→石门→神阙→腰俞"与段氏一阳诀有序 4 段相同（规则允许，观感问题）。
- 康熙：两种读法性质冲突均 0（手算）；作者看：饮刃（吸血）末端由天突"内息吞纳"改为通里→少商"吐劲"，意象由吸变吐；凝血封门 ↔ 飞燕回翔 6250 bp 可再拉开。
- 五绝：性质冲突 28 条（绝招 9、普通外放 19：劈空掌 4、降龙 15）；作者确认：莲花落 3 招、丐帮传声 3 招新加 `tags:[sonic]; voice:true`（可能触发"被 sonic 命中"判定，如 09 §8.9 颂圣作废、碧海斗曲；默认保留）；提案 P01（路线性质算法写死 + 边界例）、P02（sonic 招显式写 voice 入构建门禁）→ NYY / NAu-final。

## 书界补漏 NXfixE 交来的作者确认项（NAu-final 会从报告第 7 节收拢）
- NXfixE-a（7468547）：① 游骥 / 游驹主运只有 5 品同源内功（要求 ≥6），默认 `TS-CONTENT-BOSS-021` 阻断——是否在天龙补录图鉴补一门可共享 ≥6 品的聚贤庄 / 中原内功；② 多人战整场耐久口径：神雕、笑傲按"同级模板 × 七参倍率"，天龙、射雕、倚天保留原设计比例（神雕因此改了裘千尺 0.65→0.837 等四个旧比例），默认保持；③ 射雕王府 / 君山 / 西征精英组沿用 0.83×Boss 模板预算（折精英模板约 34–39 轮），默认保持、由回放决定。
- NXfixE-b（ac7b6a6）：展飞主运仅 5 品，`TS-CONTENT-BOSS-021` 阻断（待侠客补录图鉴补长乐帮 ≥6 品可共享内功）；何铁手临时用通行主运 `sk_hunyuanfangzhuang`（待碧血补录补五毒 ≥7 品本门内功）；徐天川用郑氏同势力主运 + 通行外功；风际中无正式 ID（design/18 待登记）；洪安通 08 取 71,300×0.85=60,605 与 09/03 的 hpMax 71,300 语义待统一；story/10 霍元龙追图团是否升格正式遭遇（默认否，保持 6 个）；瓦耳拉齐鬼声并入白袍守门者分配 51,627+12,907；分配权重（如戚长发终幕四槽均分）属设计取舍。
- NXfixE-c（书界补漏 11–14）交来的作者确认项：霍青桐回部高阶本门内功（默认 7 品 `sk_hunyuanfangzhuang`）；阎世章 / 钱正伦 / 张云飞师承与二郎拳、燕青拳、钟氏三雄本门武学（默认合法通行配装）；郑三娘双刀原著武学名（默认 `sk_luoyedao`）；紫竹庵邪线波次先后（默认林 / 任在前、袁 / 萧在后）；飞狐新增三场倍率（默认 0.75 / 0.80 / 0.85）；全部遭遇数值为【建议值】。交其他任务：story/12、story/13 改用 7 个新 NPC ID；design/18 人数与索引计数重算；BattleReplayV1 回放落盘；图鉴补本门武学缺口。

## NR4 阶段
- NR4-kangxi（62268d4）作者确认：AR-18a 冲 / 带不投票的默认值（若改，血刀心法、高昌吐纳、林任合心诀须重算）；KX-D08 七门补录经脉为【建议值】（太岳呼吸法、仁者吐纳缺外部依据）；血刀三式新增派生路线 ID（mfr_xuedaoxinfa_xuexi / bixi / cuidao）是否符合"不新造 ID"。
- **NR4 全部合入后，开按书界的性质同步任务（NR4S-NN，写 chapters/NN + npcs-chNN）**：汇总各 NR4 报告"交其他任务"里的 innerNature / 配装七参 / §9.6 列表变更，按书分发，别全压给 NAu-final。已知：chapters/09（湘西吐纳、梅门心法改阴，血刀心法改调和；宝象、血刀门精英改调和，言达平、万震山、戚长发改阴，复核节奏）、chapters/11（mer_ren→mer_renmai；袁冠南、萧中慧、林玉龙、任飞燕改阴）、chapters/08（平西军配装七参，随 bulu-08 `sk_pingxixingqijue` 改阴）。
- NR4-gulong（4919d3a）：K-01～K-03 明玉功 / 嫁衣神功 / 神水内功主修经脉为原创配表（默认保持）；实现期须用新 nature、调息、护体与局部防守模板。
- NR4-wuyue（d11695e）：交其他任务——design/20 §9.5.2–9.5.3（吸星 C11 阴→调和、葵花 C11 阴→阳）、chapters/09 §9.8、chapters/07 §9.7（葵花传承候选"阴性 8 品"须重审）、chapters/05 §12.6（任我行 阴→调和、东方不败 阴→阳，重跑估算）、design/03 §5.2、design/05 §5.3 与 §9.1.4（葵花改阳）。提醒：check_route_unique_for.py 只查绝招唯一性，普通路线的重复要靠审核。
- NR4-qianlong（a99b5dc）：QL-D08 六门黄阶内功主修经脉为建议值；交 chapters/12 §9.6（广平心法、回部吐纳改阴）、chapters/13 与 14 §9.6（苗家心法说明改阴，苗人凤七参不变）、design/05 §5.3.1 迁移快照重算。
- NR4-daojia（返修中）：作者确认——神雕 §11.9 重阳七星阵首、书剑 §11.4.2 张召重：全真吐纳诀 / 太和功改阴后与阳性主运相冲，接受相冲还是改辅运；交 lint 维护——check_skill_catalogs.py route_outlet_points 未剥离 movement / inner 路线的动作出口；交 design/05 §5.3.1 道家迁移清单、chapters/08 §8.3 白云观改"基础阴性内功"。
- **NR4 全部合入后**：除按书界的性质同步（NR4S-NN）外，另开 lint 维护任务（route_outlet_points 剥离 movement / inner 出口；check_route_unique_for 扩展到普通路线）。

## 素材方向变更（2026-09-29 晚）
- 城镇改程序化生成：TOWN-design → TOWN-tiles / TOWN-buildings / TOWN-render → TOWN-assemble（695e1de）。ART-B-town、ART-B-bldmap 作废，工作区保留作参考。
- 招式演示改为"生成图拆图层 + 图层动画"（ART-R3-vfx），作者原话「这个特效看起来太蠢了，跟渲染的图完全不一样」。ART-R2-vfx 工作区（六脉线性剑气图，GPT PASS，未合入）是 R3 的起点。
- 审批页待作者审：萧峰（R2）、令狐冲（R1）、六脉神剑图（R2）、倚天剑（R1）、降龙十八掌图（R1）；小龙女加白手套 / 佩剑 / 铃铛（ART-R1-female）出图中。
- NR4-shaolin（返修中）：少林九阳功主修经脉依据标"待考《倚天》楔子觉远诵经情节"；11 门补录经脉为原创扩展；交 LINT-outlets 的四处脚本盲区已并入其提示词。
- NR4-general（4c23117）交其他任务：chapters/09、13 §12 主运 `sk_jianghutuna` 调和→阴并重算调息 / TTK；chapters/10、11 §12 `sk_jianghutuna` / `sk_wuguanxinfa` 主运行改阴重算；npcs-ch01 L33–34 与 chapters/01 L1417–1418 游氏兄弟辅运 `sk_huxixingqi` 调和→阴；skills-bulu-12 L54 `sk_zhuangxingong` 前置性质假设（阳→阴）；chapters/03 L948/954/1010 壮行功、扎马步性质标签；chapters/09 + npcs-ch09 辅运 `sk_huxixingqi` / `sk_tunaqianjue` 改阴复核；各书界与 NPC 图鉴中 `sk_tunaqianjue` / `sk_huxixingqi` / `sk_zhuangxingong` 的显式性质引用；07-set-system、bulu-06/07/09、skills-shaolin 的套装 / 前置 / 底座隐藏性质假设。
- 协调者裁定（供作者复核）：模板绑定的普通路线不受 21 §4.3.4"不完全相同"约束（图鉴 §17.5 规定按共享模板引用；工具同口径）。NR4-xiakebixue 据此合入。若作者希望普通路线也各不相同，需要另开任务给全部模板绑定路线写显式路线，工作量很大。
- NR4-xiakebixue 交其他任务：chapters/06 §12.7 展飞 `sk_changlexinfa` 调和→阴、辅运 `sk_changletuna` 改阴；design/20 §10.7 混元功传承门槛 C9 阳→调和；chapters/07 §12.7 归二娘、归辛树混元功 阳→调和并复核七参；chapters/08 §9.4 / §12.8 同上。
- NR4-wujue（返修中）：作者确认——欧阳锋配装：蛇形吐纳息改调和后辅运 0.25→0.40，毒脉护气功仍阴，套装相冲风险未消。交其他任务：design/05 §5.3.1 五绝改性清单 6→9 门；chapters/02 L1226–1233 与 npcs-ch02 L11–13/35–36（黑风双煞 桃花吐纳息 0.40→0.25；洪七公与君山阵首 护心法 0.50→0.40；黄药师 桃花、药圃各 0.50→0.40；欧阳锋 蛇形 0.25→0.40）；chapters/03 L1518 黄药师；chapters/01 L1419 段延庆 段氏养生功 0.50→0.40；skills-bulu-01 L34/72、design/07 L460/625 段氏养生功前置与九阴套装计件复核。降龙三条路线（21 §12.1）体段改阳由 NR4-wujue 自己做（写集已扩）。
- NR4-yitian（778cbda）：基准提案 NR4-YT-P01/P02（AR-18a/b 确认后固化到 Canon / design/21）。交其他任务：design/05 §5.3 / §5.6 / §13.4 九阳阳→调和重算示例与 YAML；design/21 §10.4 九阳标签改调和；design/03 §5.2 九阳示例；design/10 乾坤一气袋保留"九阳撑破"显式特例；design/20 §9.4.3 九阳 C12 改调和；chapters/04 §12.5 峨眉指挥 `sk_emeijiuyang` 阳→阴（innerNature）；lint：`--delivery` 未解析黄阶一行卡的 `inner.meridians`（并入 LINT-outlets）。
- NR4-bulu（返修中）：作者确认——袁紫衣会武归心诀（冲 / 任 / 手厥阴）为原创解释，师承与所会门数待考。交其他任务：chapters/02 §12.6 桃花归元诀 调和→阴（黄药师 innerNature 与节奏）、02/03 全真周天功 阳→调和（重阳七星阵首七参）；chapters/03 §12.8 桃花归元诀；chapters/04 §12.8 波斯圣火玄功→阳、崆峒五行心法→阴、华山两仪心法04→阳；chapters/05 §12.8 剑宗行气诀→阳；chapters/06 §12.7 丁氏心法→阴；chapters/07 §12.8 石梁五行功 / 仙都运气诀→阴、华山养气功07→调和、铁剑玄功→阳；chapters/08 §12.8 九难铁剑玄功 调和→阳、王屋首领及五类精英；chapters/13 §12.8 袁紫衣会武归心诀→阴。
- TOWN-design（返修中）作者确认：1093 年大理是否保留崇圣寺三塔整体意象（小塔建于 1108–1172，默认保留并标原创扩展）；O1–O6：素材格式 PNG/GLB、单视图锁镜头、64×32 定位、历史城墙压缩比例、皇城门楼表现、四向旋转建筑产量。
- ART-R3-vfx（返修中）待定：`layers/generation/` 与 composite / peak 约 20 MB 中间件是否入库（默认不入库，只留 layers/*.png 与 .webp）；prompts/vfx.md §7 图层规则限定为当前两张图的演示。
- NR4-wujue（f36a8a7）已合入；其交办条目见上文。

## 2026-09-30 · NR4S / LINT-outlets / NR5 阶段（协调者汇总，明细在各报告第 4 / 6 / 7 节）
- **AR-18 改性后新增的主辅相冲**（NR4S-01…14 逐书界登记，默认一律"保持配装、写明相冲代价、不换主运"）：天龙游氏兄弟；射雕陈玄风、梅超风、欧阳锋；神雕公孙止、霍都、裘千尺（逆性外功 −12%）；倚天成昆、玄冥二老；笑傲剑宗首领、岳不群、左冷禅；侠客封万里、丁不三、丁不四；碧血温家五老、玉真子、内监亲随、闵子华；鹿鼎 11 行相冲配装（O08-13）；白马部族勇士精英、霍元龙、吕梁精英；鸳鸯九名改阴人物；书剑周仲英、张召重三战；飞狐 8 类配装 13 个相冲辅运格（NR4S-13-O01）；雪山胡斐、左右书僮。作者确认：整体接受相冲，还是按书界逐个改辅运 / 外功。
- **`requiredNature` 与异性主运的运行时语义**（多册报告交上游）：主运性质不在招式 `requiredNature` 列表里时，是禁用该招、按异性相性扣减后可用，还是别的处理——05 / 21 需要写明唯一规则（已交 NAuF-rules / NAu-final；默认：不扩宽列表、不自行定义硬禁用，首领默认行动不使用门槛不匹配的招式）。
- **童姥阳主运调用阴性生死符**的路线准入（NR4S-01）；**太和功"冲和"**的有效层数及辅运生效条件（NR4S-12）；**林任合心诀、太岳呼吸法、仁者吐纳**主修经脉建议值是否定案（NR4S-11）；**五门 / 六张黄阶外功缺性质**（NR4S-10、11，交图鉴）。
- **LINT-outlets（f1c683e）之后**：显式普通路线纳入 21 §4.3.4 全仓比较，4 对完全相同、182 对 ≥80%；3 条新性质冲突（bulu-01 降龙行功·天行、bulu-05 华山紫气诀·迎风、倚天玄冥心法·凝霜）；道家冰魄银针·摄魂持械端点；五绝 `mfr_xianglong18_lishe` 七段缺正式序列。已登记 NR5-<15 单元> 逐对处理（清单 `tools/agents/nr5/`，验收 `check_nr5_unit.py`）；NAuF-cat-<单元> 依赖对应 NR5。
- **NAu-final 已拆分**：NAuF-sysA / NAuF-rules / NAuF-cat×12 / NAuF-book×14 / NAuF-lint / NAuF-assets / NAuF-canon，NAu-final 改为收口（7a8e494）。需作者确认的总表由收口任务汇总。
- **skill 建设**（作者 2026-09-30 问"城镇地图、建筑图片、武功招式这几个基线和 skill 建设都完成了吗"）：仓库里此前没有任何 skill 产物。协调者的理解与计划：每类素材基线通过后，把生成流程固化成 GPT CLI 可复用的 skill（SKILL.md + 提示词模板 + 参考图清单 + 质检脚本）；城镇与招式以 `tools/town`、`tools/vfx` 为核心。待作者确认这个理解；任务待登记（SKILL-town / SKILL-building / SKILL-vfx，依赖 TOWN-render、VFX-tool 合入）。


## 2026-09-30 · 素材线按作者"几张图 + 代码"口径重排（协调者裁定，待作者复核）
- **贴片**：TOWN-tiles 三轮审核的 ❌（34 家族齐全、47 种岸线形状、门洞像素宽度、墙件接缝、接触影 alpha）全部裁定不再要求（作者：「贴片就是一些素材，四五十个差不多就行了」）；现有 60 张作为基线，缺形状由渲染器用 8 向边件叠。收尾轮只做清理。若成图暴露问题再按图补。
- **招式**：合成与动效改用 Three.js（VFX-three）；VFX-plates 的 Python 合成版作废（工作区保留到 VFX-three 合入）。旧的单图 + 图层动画路线（ART-R2-vfx / ART-R3-vfx，未合入，审批页"招式"类两张卡）**建议作废**，只把它们的图作为效果参考——待作者在审批页表态；若作者通过了它们，合入时与 VFX-three 的 manifest 会冲突，需手工合并条目。
- **城镇**：布局以联网搜索到的历史平面图复原（TOWN-layout），史料之间有分歧时执行者择一并写明；作者若有自己认可的复原方案 / 图，请给链接或图，重跑即可。TOWN-design 当时无联网写的原创布局作废。
- **合入受阻**：主检出里出图代理的未提交改动挡住 `step.py merge`；协调者不绕过，等作者决定（让该代理提交，或允许放宽为"只拒绝暂存 / 重叠文件"）。
- **人物立绘提示词**：ART-P-ch01 定稿合入时用 `git cherry-pick -X theirs` 覆盖先行快照；但出图代理已在主检出直接改了 `ch01-tianlong/npc_wangyuyan.md`、`protagonist/npc_zhujue__f_ch00.md`（加了作者本轮指定的水墨风格参考图 `.agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png`），合入定稿前要先看这些改动是否要保留。
- **批量生产两项默认（2026-09-30 15:05 提出，15:45 作者已确认）**：① 小城 / 遗址 272 个不做史料复原，用同年代套件的程序化模板生成；② 玄级外放气颜色：阴青 / 阳赤 / 调和淡金 / 中性素白（`docs/design/vfx/palette.yaml`）。
- **VFX-templates 审核指出的沙箱限制**：Python 全量单测在只读审核沙箱里因不能建临时目录而退出 1，审核据此判 ❌——属环境限制，协调者准出时在主检出复跑单测即可；后续审核要点已注明不据此判 FAIL（待写入 review_checks_vfx_templates.md，若再出现）。
- **`assets/default/prompts/vfx.md` 章节编号混乱**（2026-09-30 15:42）：VFX-emitters 与 VFX-templates 两任务都在文末追加小节，协调者手工合并冲突时按"两边都保留"处理，出现"## 8"重复、"### 7.1"错挂等编号问题；内容完整，下次有人改这个文件时顺手重排编号即可。
