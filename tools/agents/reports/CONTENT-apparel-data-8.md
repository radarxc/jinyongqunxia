# CONTENT-apparel-data-8 报告 · 内容 · 衣物与护甲扩充落数据（AR-77）第 8 批：总表第 8 批进物品名录，生成 content/items，逐件写出图提示词（供 Gemini 出图）；过程文件不进 assets/

## 1. 摘要（3–6 行）

第8批70件均属清（康熙至乾隆）：男装18、女装12、头饰12、腰带12、鞋12、披风3、护心镜内甲1；制式外甲0，乌蚕衣只引用旧件。
完成70行九列名录、70份生成器YAML、70份draft提示词；男女六档共12组，红青男装／水红女装12件底图、18件换色编辑，其他独立稿40件；GUIDE已有同款换色规程，沿用不重复追加。
280个Ce预览端点复算一致；名录、生成一致性、ID、安装及生成器测试通过；content:validate受tsx沙箱EPERM阻断，须沙箱外复验。本轮不出图、不重建INDEX、不实现引擎。
## 2. 产出（文件、行数、主要章节）

`docs/design/catalog/items-{clothing,innerarmor,accessories,belts,shoes}.md`分别追加30／1／15／12／12行，总326／49／212／164／164行；armor55行未改。`content/items/<ID>.yaml`70份2562行；`assets/default/prompts/items/<类>/<ID>.md`70份5130行，单稿69–83行（要点／提示词／排除／质检／换色执行）。design/10仅§14.2加一行70个ID，按衣物→内甲→配件→腰带→鞋的名录顺序登记，总2999行；`test_items_from_catalog.py`仅改5个件数，295行；本报告30行。
## 3. 关键结论与数值

六档2／4／6／7／8／9，披风2／5／8；基底=总表满效系数÷G，如黄衣0.176÷1.10=0.16、0.132÷1.10=0.12，eva=2G=2.2／2.8／3.4／4／4.4／4.8。def=roundHalfUp(100×kDef×G)：轻衣31／39／48／56／62／67、小件6／7／9／10／11／12、披风3／4／6；鞋轻功2.5gUse=5／10／15／17.5／20／22.5，agi=0。护心镜基底0.10／0.08，G7=2，def=round(100×0.18×2)=36；Ce26–45外防54–148、内防43–119，无身体轻重固有项。按design/03精确兼容曲线、用有理数复算280端点，无提前取整或双乘G；槽位body30／innerBody1／head12／waist12／feet12／cape3，wearer男／女66件、缺省通用4件。
## 4. 开放问题（附默认值）

本批总表结构／数值未发现错误。沿design/27待考：护镜独立镜带结构、康熙配置、女素白逐朝常服、故宫PDF原刊图页；默认地下7薄铁胸背镜带内甲、原创裁片与配色，不编小说回目／人物持有关系。核[国博乾隆帝甲胄](https://www.chnmuseum.cn/zp/zpml/csp/202112/t20211221_253268.shtml)的前后护镜、[丝博乾隆色谱2.0](https://www.chinasilkmuseum.com/zz/info_17.aspx?itemid=28366)的红青蓝色系，默认红青为低饱和深蓝调原创近似，不给历史RGB；水红取低饱和浅红；男本白革带取浅染暖白革面、浅褐切面与暗铜环扣，织绣只落从属窄覆帛缘，簪身保留暗铜，女履按成人天足。六档仅目录候选，投放沿design/10§4.4：鹿鼎／连城／鸳鸯普通上沿玄中5，书剑／飞狐玄上6，雪山地下7，不把地上9新品自动塞入普通商店。沿前批待办：倚天剑基线manifest为candidate、GUIDE称作者已审，默认保留指定两条参考，由出图员核STYLE审批记录，新稿不声称approved。已解决：70个新ID正式登记；小说未逐字校勘、PDF图页未续核，故宫原链接本轮抓取超时。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增；沿用design/27 P27-01与名录既有wearer提案，不改基准、品阶、槽位或装备机制。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

已解决：design/10§14.2登记70个新ID。交协调者：`extract_item_prompts.py`／升级九列映射（本批新稿已校正）；`items_from_catalog.py`／本批腰带12、鞋12误推matFamily=metal，史料书名使70件原创装备归origin=canonExpanded，默认保留生成结果，修生成器后重生成；五份本批名录文末／同步AR-77统计；GUIDE§1与item.md§8／旧七列说明及基线审批口径；章节投放／按§4.4控制普通池；开发监督／合入后全量重建INDEX、沙箱外重跑content:validate。
引擎接收任务为**ENG-27a**（沿[第1批报告](CONTENT-apparel-data.md)§6、[ENG-attr-v2-schema报告](ENG-attr-v2-schema.md)§4）：消费`extension.value.slot`、`armorWeight`、`attributes:{version:2,def,agi?}`，以及`flags:[runtimeProjection]`标记的`text.desc`中保留的`defOutK/defInK`防御系数、`hpMaxK`气血系数、`eva`闪避、`qinggong`轻功、`wearer=male|female`。同步schema／生成器编译为结构化字段，扩展`apps/game/src/runtime/content.ts:65`的`equipmentRules(content)`：slot接既有`EquipmentRule.slot`；armorWeight按design/10§3.4选body系数，innerBody按§3.1独立系数；按§4.1及design/03的Ce兼容曲线、effGrade/gUse/G/R重算defOut/defIn/hpMax，经`EquipmentRule.modifiers`、`deriveEquipmentPanel`接入03快照；attributes.def只校验或反投影同一防御来源，不额外叠加；agi=0不折算鞋轻功，eva/qinggong固有项不乘R。现modifier要求整数，须处理小数定点适配；wearer接适用性校验，默认男／女限制、缺省通用，当前EquipmentRule无wearer字段，由ENG-27a接收契约，不从衣色／护镜名称授官军身份。
合入后补测70件Ce两端外／内防与气血、六档闪避及鞋轻功、跨界与封顶gUse、强化／损坏只影响主属性、同色同值／投影不双算、穿卸重算与上述六槽替换、男女／通用适用性、衫裙与头饰组合只计一件、护心镜与body叠穿且不重复计胸背镜片、不触发官甲通缉或额外减伤／抗毒；这些引擎消费测试本轮未执行。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 总表`--landed 8`（70件、12组换色）、六份名录、生成器`--check`、`pnpm install --frozen-lockfile`、`check_ids --strict`均exit=0；`unittest discover -s tools/content -p test_items_from_catalog.py`12项通过，快照仅五数字改为170／122／273／9／122；严格ID新增失败／重复／近似对／旧ID／套装不对称0，仅基线sk_babuganchan未定义1不计失败；鞋表既有stamina警告保留。逐件九列／形制／颜色／品阶／Ce端点与代码块核对通过，无占位或截断。
✅ 索引`--check`整体exit=1，本批ID零✘；完整collect确认70件draft／待出图、本批问题0，其他既有问题274处，INDEX待合入后重建。换色稿edit_from、底图首条参考、gemini-imagegen§4上传／stage暂存与claudeGemOpts无模板步骤齐；底图先出，禁止代码改色相，未出图。
✅ 抽取器改写的626份旧稿原字节恢复；3078份既有内容／提示词／INDEX哈希未变，旧名录行／待决事项保留，design/10仅加一行；148路径全在写集，assets仅新增本批70份.md，GUIDE未改。每次写入≤150行，无整仓临时检出、整份assets复制、工具／shim手改或改变仓库状态的git命令，过程文件在/private/tmp并于交付前删除，git diff --check通过。
⚠️ content:validate exit=1：tsx Unix socket报listen EPERM，按规则13交校验阶段沙箱外复验，未绕过沙箱；**ENG-27a**接入及数值／适用性补测见§6，当前运行时未消费装备修饰，不宣称效果已生效。需作者确认（附默认）：**无新增，沿用第4节默认值**；wearer沿既有名录男／女限制、缺省通用，结构由ENG-27a接收。
