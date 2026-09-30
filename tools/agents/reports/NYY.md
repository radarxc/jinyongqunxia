# NYY 报告 · 阴阳基础理论修正（作者 AR-18）：内功阴阳按主修经脉、路线性质按体段判定、阳掌气过阴门与阳经手穴

## 1. 摘要（3–6 行）

已完整登记作者 AR-18，并将 Canon 从 v1.7 升至 v1.8：内功阴阳按主修经脉，正逆周天只分用途，招式路线仅按体段判性质。
`design/21` 已把末端动作穴定义为出口段；阳掌可经劳宫“气过阴门”，明确动作也可取合谷、后溪、外关，且不新增数值乘区。
`design/05` 对 254 张唯一内功卡做只读审计：147 张有显式主修经脉字段，56 张声明性质不符，107 张待补字段；显式 `[]` 已按调和审计。
lint、参考模拟器及 170 个测试已同步；规范表格会保留 ID 前招式名，多招式同格仍隔离，且武学格 / 标题中的前置元数据不会污染动作授权；基点新口径性质冲突为 `101=97 绝招+4 普通外放`。

## 2. 产出（文件、行数、主要章节）

| 文件 | 完成后行数 | 主要产出 |
|---|---:|---|
| `docs/decisions/author-requirements.md` | 344 | 新增 AR-18 作者原文、落实位置、AR-18a/b 默认值 |
| `docs/00-canon.md` | 957 | v1.8、V18-01～04；§6、§8、§18 同步 |
| `docs/decisions/canon-proposals-v1.2.md` | 416 | v1.8 处理记录及两个待确认默认值 |
| `docs/design/21-meridian-flow-and-moves.md` | 2,343 | v2.7.2；§2.4 按游戏归属做体段判定、§4.3.1 掌法动作穴并集、§17 校验、§18 依赖与版本记录 |
| `docs/design/05-martial-arts-system.md` | 3,078 | v1.7.1；§5.3 主修经脉定义、§5.3.1 254 卡覆盖审计与 56 卡迁移清单、V4/T40/O8 |
| `docs/design/15-meridians-and-acupoints.md` | 1,619 | v1.1；§2.1 四穴复核、V15-19/T15-16/O15-08 |
| `tools/lint/check_skill_catalogs.py` | 3,584 | 正式卡归属、动作专用分段与元数据隔离、空数组审计、体段投票及只报告性质审计 |
| `tools/lint/test_check_skill_catalogs.py` | 2,124 | 规范招式表四类端点、多招式同格、三类元数据污染端到端反例、普通外放 / 阴门 / 豁免、空数组与气冲回归 |
| `tools/lint/README.md` | 357 | 普通外放覆盖、游戏归属计票、表头驱动动作取证与空数组审计说明 |
| `tools/balance/meridian_flow_sim.py` | 1,307 | 同口径纯函数及气冲游戏归属断言；既有 golden 无漂移 |
| `tools/agents/reports/NYY.md` | 214 | 两套提交数据、按册前后矩阵、内功 / 路线迁移清单、验证记录 |

未修改 `docs/design/catalog/`、书界、`TODO.md` 或其他非授权文件。

## 3. 关键结论与数值

### 3.1 §2.4 完整判定规则

1. 先按 `design/21` §4.3.1 与当前动作识别出口段；出口只可能是最后 1–3 段内、且被动作规则实际命中的关键穴，不是机械删除尾三段。劳宫命中时，同在尾三段的内关可作为阴门引导段一并排除。
2. 其余节点均为体段；每穴先查 `design/15` §3 的**游戏归属经脉**，再按 §2.1 的游戏性质逐节点投票、不按经脉去重。不得改用标准归经：例如气冲虽标准归足阳明，游戏归冲脉，故按 `harmony` 不投阳票；章门等交会 / 借穴同理。十二正经随所属阴阳；任脉投阴、督脉投阳；阴跷 / 阴维投阴，阳跷 / 阳维投阳。
3. 冲脉、带脉沿用 `design/15` 的 `harmony`，默认不投票；作者没有指定其单侧归属，强制拆票会制造新事实。此项作为 AR-18a 待确认。
4. 阴票多为 `yin`，阳票多为 `yang`；平票或体段没有阴阳票时为 `harmony`。未知归经不投票，并由既有引用完整性校验处理。
5. 正 / 逆周天不参与性质判定，只分别表达养生敛气与武击逼气用途；阴、阳两性都可逆行发招。
6. 阳性体段经内关 / 劳宫仍为阳，落实“以阳驭阴 / 气过阴门”；“阴阳交泰”只解释末端调和与既有走火风险，不新增倍率、减伤或概率。

掌法分类取并集：手刀 / 掌刃 / 掌缘 / 掌侧 / 劈掌允许后溪，劈 / 切 / 抓 / 虎口允许合谷，格挡 / 靠打 / 反背摔掌允许外关；劳宫始终合法。“劈掌”同时允许后溪、合谷，“掌刃劈击”同理。只读武学名、招式名与招式描述，并排除“一切 / 切磋”等非动作“切”和仅作掌名 / 掌风的“劈空”；无法可靠分类时只认劳宫。外放仍须另命中既有 13 穴白名单，后溪暂不在白名单内。

### 3.2 交付扫描三阶段对照

每个性质格均按“绝招 + 普通外放”书写。旧口径用数据提交自身的基线脚本（整路线投票、掌法只认劳宫）；“新口径·解析修正前”用第 1 次运行结束时的体段脚本快照；“新口径·解析修正后”用本轮最终脚本（含性质解析修正与 `_move_action_contexts()` 名称保留修复）。旧口径及解析修正前两列由监督代理同根计算，本轮对最终列重新实跑。三阶段均把 `design/21` §12.1 的 `mfr_xianglong18_zhenjing`、`mfr_eighteen_palms_chain`、`mfr_xianglong18_shenlong` 计入 `wujue`，外部范围没有其他路线。

#### 3.2.1 基点数据：提交 `81076e9`

| 册 | 旧口径性质（绝+普） | 新口径·解析修正前（绝+普） | 新口径·解析修正后（绝+普） | 掌法路线/命中（旧→最终） |
|---|---:|---:|---:|---:|
| `bulu-01-tianlong` | 1+0 | 1+0 | 1+0 | 0/0→0/0 |
| `bulu-02-shediao` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-03-shendiao` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-04-yitian` | 1+0 | 1+0 | 1+0 | 2/2→2/2 |
| `bulu-05-xiaoao` | 0+0 | 0+0 | 1+0 | 3/3→3/3 |
| `bulu-06-xiake` | 0+0 | 0+0 | 0+0 | 1/1→1/1 |
| `bulu-07-bixue` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-08-luding` | 3+0 | 3+0 | 3+0 | 1/1→1/1 |
| `bulu-09-liancheng` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-10-baima` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-11-yuanyang` | 0+0 | 0+0 | 0+0 | 1/1→1/1 |
| `bulu-12-shujian` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-13-feihu` | 2+0 | 2+0 | 2+0 | 1/1→1/1 |
| `bulu-14-xueshan` | 0+0 | 0+0 | 0+0 | 1/1→1/1 |
| `daojia` | 16+0 | 17+0 | 16+0 | 7/7→7/7 |
| `general` | 7+0 | 7+0 | 7+0 | 2/2→2/2 |
| `gulong` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `kangxi` | 0+0 | 0+0 | 0+0 | 4/4→4/4 |
| `qianlong` | 0+0 | 0+0 | 0+0 | 4/4→4/4 |
| `shaolin` | 19+3 | 20+3 | 20+3 | 6/6→6/6 |
| `wujue` | 9+19 | 13+4 | 18+0 | 25/25→29/29 |
| `wuyue` | 0+0 | 0+0 | 6+0 | 4/4→4/4 |
| `xiake-bixue` | 2+0 | 2+0 | 2+0 | 7/6→7/6 |
| `xiaoyao` | 11+7 | 15+1 | 15+1 | 21/21→21/21 |
| `yitian` | 4+0 | 5+0 | 5+0 | 4/4→4/4 |
| **合计** | **75+29=104** | **86+8=94** | **97+4=101** | **94/93→98/97** |

三阶段绝招路线数均为 654；绝招 `nature=None` 依次为 174、174、8。最终 4 条普通外放冲突是少林 3 条、逍遥 1 条。最终掌法分解为绝招 `65/65`、普通外放 `33/32`，合计 `98/97`；唯一未命中仍为 `mfr_bizhenqingzhang_qingzhang`。本轮名称保留修复没有改变现有图鉴计数，但规范的“招式名在 ID 前”输入现已正确识别。

#### 3.2.2 主分支数据：提交 `cb6376a`

最终脚本扫描主分支绝对路径时先得到 651 条绝招、94 条普通外放；因外部路径不等于工作区 `CATALOG_DIR`，再显式补入工作区 `design/21` §12.1 的上述 3 条降龙路线，形成与监督代理相同的 654 条同根范围。

| 册 | 旧口径性质（绝+普） | 新口径·解析修正前（绝+普） | 新口径·解析修正后（绝+普） | 掌法路线/命中（旧→最终） |
|---|---:|---:|---:|---:|
| `bulu-01-tianlong` | 1+0 | 1+0 | 1+0 | 0/0→0/0 |
| `bulu-02-shediao` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-03-shendiao` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-04-yitian` | 1+0 | 1+0 | 1+0 | 2/2→2/2 |
| `bulu-05-xiaoao` | 0+0 | 0+0 | 1+0 | 3/3→3/3 |
| `bulu-06-xiake` | 0+0 | 0+0 | 0+0 | 1/1→1/1 |
| `bulu-07-bixue` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-08-luding` | 3+0 | 3+0 | 3+0 | 1/1→1/1 |
| `bulu-09-liancheng` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-10-baima` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-11-yuanyang` | 0+0 | 0+0 | 0+0 | 1/1→1/1 |
| `bulu-12-shujian` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `bulu-13-feihu` | 2+0 | 2+0 | 2+0 | 1/1→1/1 |
| `bulu-14-xueshan` | 0+0 | 0+0 | 0+0 | 1/1→1/1 |
| `daojia` | 16+0 | 17+0 | 16+0 | 7/7→7/7 |
| `general` | 7+0 | 7+0 | 7+0 | 2/2→2/2 |
| `gulong` | 0+0 | 0+0 | 0+0 | 0/0→0/0 |
| `kangxi` | 0+0 | 0+0 | 0+0 | 4/4→4/4 |
| `qianlong` | 0+0 | 0+0 | 0+0 | 4/4→4/4 |
| `shaolin` | 19+3 | 20+3 | 20+3 | 6/6→6/6 |
| `wujue`（含 3 条外部路线） | 9+19 | 12+4 | 16+0 | 25/25→29/29 |
| `wuyue` | 0+0 | 0+0 | 4+0 | 4/4→4/4 |
| `xiake-bixue` | 2+0 | 2+0 | 2+0 | 7/6→7/6 |
| `xiaoyao` | 9+7 | 12+1 | 12+1 | 21/21→21/21 |
| `yitian` | 4+0 | 4+0 | 4+0 | 4/4→4/4 |
| **合计** | **73+29=102** | **81+8=89** | **89+4=93** | **94/93→98/97** |

三阶段绝招路线数均为 654；绝招 `nature=None` 依次为 174、174、8。最终脚本不补外部路线的原始跨仓结果是 `86+4=90`，显式补入三条后为表中 `89+4=93`；最终掌法同样分解为绝招 `65/65`、普通外放 `33/32`。

### 3.3 05 内功静态性质审计

全图鉴共有 254 张唯一内功卡；147 张写有可解析的 `inner.meridians`，其中 56 张声明性质与主修经脉投票不符；107 张缺字段、无法审计。56 张按正式定义册计：`bulu-02` 2、`bulu-04` 3、`bulu-05` 1、`bulu-06` 1、`bulu-07` 4、`bulu-08` 6、`daojia` 2、`general` 3、`gulong` 2、`kangxi` 3、`qianlong` 2、`wujue` 6、`wuyue` 12、`xiake-bixue` 2、`yitian` 7。完整 `skillId 现值→应值` 见 `design/05` §5.3.1。

| 正式定义册 | 内功性质迁移清单（`skillId 现值→应值`） |
|---|---|
| `skills-bulu-02-shediao` | `sk_quanzhenzhoutiangong yang→harmony`；`sk_taohuaguiyuanjue harmony→yin` |
| `skills-bulu-04-yitian` | `sk_bosishenghuoxuangong harmony→yang`；`sk_kongtongwuxingxinfa harmony→yin`；`sk_huashanliangyixinfa04 harmony→yang` |
| `skills-bulu-05-xiaoao` | `sk_jianzongxingqi harmony→yang` |
| `skills-bulu-06-xiake` | `sk_dingshixinfa harmony→yin` |
| `skills-bulu-07-bixue` | `sk_huashanqigong07 yang→harmony`；`sk_shiliangwuxinggong harmony→yin`；`sk_tiejianxuangong harmony→yang`；`sk_xianduyunqi harmony→yin` |
| `skills-bulu-08-luding` | `sk_bukuhutiaogong yang→harmony`；`sk_fansenghutigong yang→harmony`；`sk_luochabujunhuxi harmony→yin`；`sk_pingxixingqijue yang→yin`；`sk_wangwuzhenshanxinfa harmony→yin`；`sk_yanpingfanchaojue harmony→yin` |
| `skills-daojia` | `sk_beidouxinfa yang→harmony`；`sk_wudangyangshenggong harmony→yin` |
| `skills-general` | `sk_jianghutuna harmony→yin`；`sk_jindunxinfa yang→harmony`；`sk_wuguanxinfa harmony→yin` |
| `skills-gulong` | `sk_daqixinfa harmony→yin`；`sk_qinglongtuna harmony→yin` |
| `skills-kangxi` | `sk_linrenhexinfa harmony→yin`；`sk_meinianshengxinfa harmony→yin`；`sk_xuedaoxinfa yin→harmony` |
| `skills-qianlong` | `sk_guangpingxinfa harmony→yin`；`sk_miaojiaxinfa harmony→yin` |
| `skills-wujue` | `sk_baituotunadu yin→harmony`；`sk_biguqipian harmony→yin`；`sk_duanshiyangshenggong harmony→yin`；`sk_gaibanghuxinfa yang→harmony`；`sk_jiuyintiaoxipian harmony→yin`；`sk_taohuatunaxi harmony→yin` |
| `skills-wuyue` | `sk_xixing yin→harmony`；`sk_kuihua yin→yang`；`sk_zixiashengong yang→harmony`；`sk_huashanxinfa harmony→yin`；`sk_huashantuna harmony→yin`；`sk_taishanxinfa harmony→yang`；`sk_taishantuna harmony→yang`；`sk_hengshanbeixinfa harmony→yin`；`sk_hengshanbeituna harmony→yin`；`sk_riyuexinfa yin→harmony`；`sk_heimutuna yin→harmony`；`sk_wuxianbaidugong yin→harmony` |
| `skills-xiake-bixue` | `sk_changlexinfa harmony→yin`；`sk_hunyuangong yang→harmony` |
| `skills-yitian` | `sk_jiuyang yang→harmony`；`sk_emeijiuyang yang→yin`；`sk_shenghuoxinfa harmony→yang`；`sk_emeixinfa harmony→yin`；`sk_kunlunxinfa harmony→yang`；`sk_kongtongyangshenggong harmony→yin`；`sk_tieniuyaogong yang→harmony` |

缺主修经脉按册为：`bulu-13-feihu` 8、`daojia` 19、`general` 1、`gulong` 3、`kangxi` 7、`qianlong` 6、`shaolin` 12、`wujue` 17、`xiake-bixue` 11、`xiaoyao` 23；少林 12/12、逍遥 23/23 全册不可审计，交后续图鉴任务先补字段。`sk_gaibanghuxinfa` 已按本卡确认是 `yang→harmony`，未再受九袋行功 prereq 误归属影响。三张紧凑卡和四张外功 `meridians` 排除项的复核结论见 `design/05` §5.3.1。

## 4. 开放问题（附默认值）

| 编号 | 问题 | 本次默认值 |
|---|---|---|
| AR-18a | 冲脉、带脉是否参与阴阳票 | 不投票，保持 `harmony`；体段只含二者或为空时判调和 |
| AR-18b | 后溪是否加入外放 13 端点白名单 | 不加入；外放掌刃另经腕骨、外关等既有白名单穴，后溪只满足动作末端 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 / 处理 |
|---|---|---|
| NYY-P01 | Canon §6 / §8 / §18 登记内功按主修经脉、路线按体段、周天方向不定阴阳、掌法两类合法出口 | 已采纳为 Canon v1.8 V18-01～04；消除阳掌经阴门被误判为阴路线的问题 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 后续工作 |
|---|---|---|
| `docs/design/catalog/skills-*.md` | `design/05` §5.3.1 列出的 56 张卡 | 按主修经脉更新 `nature`，并联动 `BreathProfile.nature`、`requiredNature`、护体档显示与引用；不得只改单字段 |
| `docs/design/catalog/skills-*.md` | §5.3.1 列出的 107 张不可审计内功 | 先补 `inner.meridians`；尤其少林 12 张、逍遥 23 张全册缺字段，不得由现有 `nature` 反推经脉 |
| `docs/design/catalog/skills-*.md` | `--delivery` 的 101 项现存性质冲突 | 按本报告 §3.2 / §6.1 处理；基点数据为 97 条绝招与 4 条普通外放，二者分列但都属于既有 delivery 性质报告范围 |
| `docs/tech/04-data-pipeline.md` | 经脉路线构建校验 / MF-V18～19 | 把旧整路线投票改成体段投票，并加入掌法动作端点并集；保持 delivery 类问题不改变现有 strict 门禁语义 |
| `docs/tech/05-gameplay-engine.md` | 路线派生与内容编译接口 | 运行时或构建期复用同一出口分类、体段性质；正逆周天不得改写 `nature` |
| `docs/design/04-damage-formula.md`、`docs/design/09-combat-system.md`、`docs/design/14-ui-ux.md` | Z5 / 动作候选 / UI 提示 | 引用 Canon v1.8 与 `design/21`；不得把劳宫出口重新作为异性惩罚，也不得新增“阴阳交泰”乘区 |

### 6.1 后续图鉴任务：最终解析脚本下基点现存 101 条性质冲突路线

最终绝招 97 条：

- `bulu-01-tianlong`（1）：`mfr_tianshanliuyangxinfa_guiyuan`
- `bulu-04-yitian`（1）：`mfr_lutouzhangfa_hengjue`
- `bulu-05-xiaoao`（1）：`mfr_kuihuafeizhen_wuying`
- `bulu-08-luding`（3）：`mfr_bukuhutiaogong_hushen`、`mfr_fansenghutigong_jingang`、`mfr_pingxixingqijue_lianzhen`
- `bulu-13-feihu`（2）：`mfr_hujiaxuangong_guanshan`、`mfr_nanhaiwuhuxinfa_guichao`
- `daojia`（16）：`mfr_xiantiangong_wuqi`、`mfr_tiangang_guiyi`、`mfr_tongguijian_tonggui`、`mfr_yunvxinjing_hufa`、`mfr_gumuqinggong_youshen`、`mfr_anran_daimu`、`mfr_huzhaojuehushou_juehu`、`mfr_wujixuangongquan_huoshou`、`mfr_shenmen13_shisan`、`mfr_tiyunzong_fuyao`、`mfr_zhenwuqijie_guizhen`、`mfr_sanhuajudingzhang_juding`、`mfr_jinyangong_yanhui`、`mfr_chongyangzhang_diezhang`、`mfr_beidoufuchen_chanchen`、`mfr_furongjinzhen_mianli`
- `general`（7）：`mfr_pojunqiangfa_cuifeng`、`mfr_yanmengqishe_yanluo`、`mfr_kaimenpiguaquan_kaihe`、`mfr_tianwangbuxin_sanzhen`、`mfr_duanzhenqiang_pozhen`、`mfr_jiebiaodaofa_fenglu`、`mfr_tantui_tongxing_chuaimen`
- `shaolin`（20）：`mfr_jingangbuhuai_jinshen`、`mfr_shizihou_shizihou`、`mfr_tiebushan_gangqi`、`mfr_jinzhongzhao_bupo`、`mfr_shaolinjiuyang_zhoutian`、`mfr_dajingangquan_yinu`、`mfr_dajingangzhang_dali`、`mfr_xumishanzhang_yading`、`mfr_mohezhi_wuliang`、`mfr_ruyingsuixingtui_yingzong`、`mfr_longzhaoshou_sanshiliu`、`mfr_ranmudaofa_yehuo`、`mfr_jingangfumoquan_fumo`、`mfr_huheshuangxingquan_shuangxing`、`mfr_tongrenhenglian_tongrenxiang`、`mfr_xinyiba_heyi`、`mfr_xiangmochu_pojia`、`mfr_fumosuofa_huanyuan`、`mfr_jingangnuhou_zhenshe`、`mfr_wulangbaguagun_pozhen`
- `wujue`（18）：`mfr_tiebogong_zhenbafang`、`mfr_hama_fajin`、`mfr_hama_quanjin`、`mfr_yiyangzhi_liaoshang`、`mfr_cuixinzhang_liemai`、`mfr_tiezhang_hushen`、`mfr_tiezhang_qingtian`、`mfr_lihuaqiang_wudishou`、`mfr_suohouqinnashou_qinlong`、`mfr_pojunguitoudao_huishou`、`mfr_xuanfengsaoyetui_canye`、`mfr_tongshihenglian_yingqiao`、`mfr_shoujinpian_suomai`、`mfr_tiebifangshen_sheshen`、`mfr_huodushanfa_ansuan`、`mfr_xianglong18_zhenjing`、`mfr_eighteen_palms_chain`、`mfr_xianglong18_shenlong`
- `wuyue`（6）：`mfr_baibianqianhuan_shisanshi`、`mfr_baibianqianhuan_baibian`、`mfr_heimuyajianfa_lingkong`、`mfr_qixianwuxingjian_qiming`、`mfr_qingchengcuixinzhang_duanmai`、`mfr_songshanjianfa_kaimen`
- `xiake-bixue`（2）：`mfr_taxuewuhen_lingxiao`、`mfr_bizhenqingzhang_yixian`
- `xiaoyao`（15）：`mfr_liuyangzhang_bafu`、`mfr_baihongzhang_bingjiao`、`mfr_bahuang_duzun`、`mfr_huagong_duwu`、`mfr_huagong_huajin`、`mfr_huoyandao_hufa`、`mfr_longxiang_banruo`、`mfr_yanqingzhang_yiyang`、`mfr_fushidu_shidu`、`mfr_huoduozhang_liaoyuan`、`mfr_jingangxiangmochu_fumo`、`mfr_tieyaoqiang_pozhen`、`mfr_ezuijian_duanjing`、`mfr_jingedangkouqiang_aobing`、`mfr_youshishuangqiang_tongxin`
- `yitian`（5）：`mfr_jiuyang_puzhao`、`mfr_duyanfeisha_fengjiang`、`mfr_cuijunshenquan_cuijun`、`mfr_xunleijianfa_shiliu`、`mfr_yingsheshengsibo_shengsi`

以上 13 册合计 `1+1+1+3+2+16+7+20+18+6+2+15+5=97` 条。普通外放另有 4 条：

- `shaolin`（3）：`mfr_shizihou_shehun`、`mfr_shizihou_zhenhou`、`mfr_jingangnuhou_nuhou`
- `xiaoyao`（1）：`mfr_damingzhou_hezhou`

两类共 `97+4=101` 条；本轮修复 ID 前招式名解析后重新以 `python3 tools/lint/check_skill_catalogs.py --delivery --details` 的 `scope=ultimate` / `scope=normal-projection` 明细复核，迁移 ID 集合未变化。本任务未改图鉴。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ AR-18 作者原文已完整照录；日期与落实位置已登记。
- ✅ Canon 已按版本规则从 v1.7 升 v1.8，提案处理记录同步。
- ✅ Canon V18-01 与 §6 已统一为逐脉计票：阴阳平票或没有阴阳票取调和；只主修冲 / 带及显式空数组可审计为调和，缺字段仍不可审计；`canon-proposals` 与 `design/21` 转述一致。
- ✅ `design/21` §2.4 已完整定义出口段、按 15 §3 游戏归属与 §2.1 游戏性质的体段投票、任督与其余奇经取舍、平票 / 空体段；气冲反例证明不误用标准归经；正逆周天解绑。
- ✅ `design/21` §4.3.1 已加入劳宫、合谷、后溪、外关的可靠动作并集；外放后溪默认方案列入开放问题。
- ✅ “阴阳交泰”只作叙事依据，未新增数值乘区。
- ✅ `design/05` 已改内功性质定义，并以 254 / 147 / 107 / 56 的可复现覆盖审计列出不符卡与缺字段卡；图鉴与书界均未修改。
- ✅ `design/15` 确认四穴既有登记与归经正确；没有新增同物异 ID。
- ✅ `_skill_contexts`、`_skill_natures`、`_move_contexts`、`_move_owners`、`_delivery_from_context` 只由 `collect_delivery_routes()` / `analyze_delivery()` 的 `--delivery` 路径调用；内功审计同样只报告。
- ✅ 性质解析 a–d 与招式归属 e 均有正例及误归属反例：支持“ID / 和”、独立字段行、含 prereq 的紧凑卡；劈空掌、金刚指归回本卡。
- ✅ 掌法动作按表头只读取武学 / 招式的名称、招式、描述、说明、动作、效果或文本列，完整保留 ID 前招式名；多招式同格按顶层分号 / 句号隔离并取端点并集。统一清洗器已覆盖无表头武学格 `prereq sk_beta 掌刃5重`、有表头武学格 `reqs {note:掌刃考核}`、标题 `前置：掌刃5重` 三类污染：三者端到端均只报掌法末端违规，后溪没有动作授权且继续参与体段投票，派生为调和，不出现 `route=yin; declared=yang`；真实“测试掌 / 正面掌击”仍保留。
- ✅ 出口段反例已覆盖：同一劳宫在尾段且命中动作时不投票，在非尾三段时仍投阴票并可形成冲突。
- ✅ 普通外放性质报告已恢复：基点新口径 `101=97 绝招+4 普通外放`；`allowOpposedNature:true` 豁免、内关→劳宫阴门出口不计票均有回归。
- ✅ 显式 `inner.meridians:[]` / `meridians:[]` 参与审计并推导 `harmony`；仅真正缺字段计入不可审计。
- ✅ 单元测试按 `bits-unit-test-gen` 执行：规范“招式｜定义”端到端用例首轮 4 个 subtest 均因 ID 前名称丢失而失败；修复后覆盖手刀→后溪、虎口劈掌→合谷、反背摔掌→外关、双动作并集、同格双招隔离、出口不投票及上述三类污染输入，170 个测试全通过。项目与请求均无 CI 覆盖率阈值，Step6 按规则跳过。
- ✅ `meridian_flow_sim.py` 已加入气冲按游戏归属冲脉判调和的断言；现有 golden、`boss_pacing.py`、`projection_sim.py` 均未破坏。
- ✅ 基点 `81076e9` 三阶段性质冲突为 `75+29=104` / `86+8=94` / `97+4=101`；最终掌法路线 / 命中为绝招 `65/65`、普通外放 `33/32`，按册见 §3.2.1。
- ✅ 主分支 `cb6376a` 三阶段性质冲突为 `73+29=102` / `81+8=89` / `89+4=93`；最终脚本跨仓原始值 `86+4=90`，补回 3 条外部降龙路线后为 `89+4=93`，按册见 §3.2.2。
- ✅ strict 兼容要求按改前基线与改后结果逐字节比对；三种模式的退出码、字节数与 SHA-256 均完全一致：
  - `--strict`：exit 0，6,780 bytes，`e782d2f2901e5d334e137852357bcb96073f59c7ddef89cf970db32e6a211448`；
  - `--strict --details`：exit 0，6,780 bytes，`e782d2f2901e5d334e137852357bcb96073f59c7ddef89cf970db32e6a211448`；
  - `--strict --diversity-strict`：exit 0，11,711 bytes，`9b3fb01be0606c167dfc1de847b93daf088ef5ad34c333411281b2ff36297406`。
- ✅ 周天绑定残留以 `方向`、`起止`、`顺行`、`逆行`、`周天`、`阳走`、`阴走`、`按招式阴阳`、`按阴阳` 检索 Canon、05、21；唯一错误残留“按招式阴阳选择起止方向”已改为按用途选正 / 逆行，其余命中均为解绑规则、风险术语或无关方向语义。
- ✅ 全部指定命令通过：`check_ids --strict`、170 个 lint 单测、damage、meridian、boss、projection、catalog strict；详情以本轮最终命令输出为准。
- ✅ 续作过程如实记录：第 6 次运行因死机断网中断，第 7 次运行因切换推理强度被终止；本次在两轮保留产物上完成 r4 动作上下文隔离收尾，没有重写已审核通过部分。
- ✅ `git diff --check` 通过；所有修改均在允许路径，文件无缩短 15% 以上，无占位文本或未闭合代码块。
- ⚠️ AR-18a、AR-18b 仍需作者确认；当前默认值已同时写入作者需求、05/21 与本报告，不阻塞本轮。
