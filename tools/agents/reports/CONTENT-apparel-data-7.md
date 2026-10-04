# CONTENT-apparel-data-7 报告 · 内容 · 衣物与护甲扩充落数据（AR-77）第 7 批：总表第 7 批进物品名录，生成 content/items，逐件写出图提示词（供 Gemini 出图）；过程文件不进 assets/

## 1. 摘要（3–6 行）

第7批69件均属明末（碧血ch07）：男装18、女装12、头饰12、腰带12、鞋12、披风3；无新增铠甲／内甲。
追加69行九列名录，生成69份内容数据与69份draft提示词；男女六档共12件底图（男青绿／女水红）、18件换色编辑，GUIDE已有同款换色规程，沿用不重复追加。
69件276个Ce预览端点复算一致，其他批次原字节保留；content:validate受tsx沙箱EPERM阻断，交沙箱外复验。本轮不出图、不重建INDEX、不实现引擎。
## 2. 产出（文件、行数、主要章节）

`docs/design/catalog/items-{clothing,accessories,belts,shoes}.md`分别追加30／15／12／12行，总296／197／152／152行；armor55行、innerarmor48行未改。生成器输出`content/items/<ID>.yaml`69份2181行；`assets/default/prompts/items/<类>/<ID>.md`69份5061行（要点／提示词／排除／质检，男女衣物另含换色执行），单稿69–83行。design/10仅§14.2表末追加一行69个ID，按衣物→配件→腰带→鞋的名录顺序登记，总2998行；本报告30行。
## 3. 关键结论与数值

六档2／4／6／7／8／9，披风2／5／8；名录基底=总表满效系数÷G，如黄衣0.176÷1.10=0.16、0.132÷1.10=0.12，eva=2×G=2.2／2.8／3.4／4／4.4／4.8。def=roundHalfUp(100×kDef×G)：轻衣31／39／48／56／62／67、小件6／7／9／10／11／12、披风3／4／6；鞋轻功2.5×gUse=5／10／15／17.5／20／22.5，agi=0。按design/03精确兼容曲线、用有理数复算276端点，无提前取整或双乘G；12组换色同值。槽位body30／head12／waist12／feet12／cape3，wearer男／女66件、缺省通用3件。
## 4. 开放问题（附默认值）

总表本批结构／数值未发现错误。崇祯阶段男青绿／女水红偏好、低立领细节、素白逐朝常服与故宫PDF原刊图页均沿design/27（待考），默认低领窄缘及原创裁片，不编小说回目／人物持有关系；具体编革带配色默认本白浅染柔革、浅褐切面与暗铜环扣，织绣只落从属窄覆帛缘，不遮编条；女包髻簪素白只落帛面，簪身保持暗铜，女履按成人天足。本批六档是目录候选，投放仍按design/10§4.4：碧血普通池上沿地下7、普通新品至地上9，天下金蛇剑另按既有名器；不把全部新品塞进普通商店。沿前批待办：倚天剑基线manifest为candidate、GUIDE称作者已审，默认保留指定两条参考，由出图员核STYLE审批记录，新稿不自行宣称approved。已解决：69个新ID正式登记，见design/10§14.2。本轮未联网或逐字校勘小说，不声称消除上游待考。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增；沿用design/27 P27-01与各名录既有wearer提案，不改品阶、槽位、战斗数值或装备机制。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

已解决：design/10§14.2登记69个新ID。交协调者：`extract_item_prompts.py`／升级九列映射（本批新稿已校正）；`items_from_catalog.py`／本批腰带12、鞋12误推matFamily=metal，历史书名使69件原创装备归origin=canonExpanded，默认保留生成结果，修生成器后重生成；四份名录文末／同步AR-77统计；GUIDE§1与item.md§8／旧七列说明；章节投放／按§4.4约束碧血普通池；开发监督／合入后全量重建INDEX、沙箱外重跑content:validate。
引擎接收任务为**ENG-27a**（沿[第1批报告](CONTENT-apparel-data.md)§6、[ENG-attr-v2-schema报告](ENG-attr-v2-schema.md)§4）：消费`extension.value.slot`、`armorWeight`、`attributes:{version:2,def,agi?}`，以及`flags:[runtimeProjection]`标记的`text.desc`中保留的`defOutK/defInK`防御系数、`hpMaxK`气血系数、`eva`闪避、`qinggong`轻功、`wearer=male|female`。同步schema／生成器将效果编译为结构化字段，扩展`apps/game/src/runtime/content.ts:65`的`equipmentRules(content)`：slot接既有`EquipmentRule.slot`，armorWeight按design/10§3.4选系数，按§4.1及design/03的Ce兼容曲线、gUse/G/R重算defOut/defIn/hpMax，经`EquipmentRule.modifiers`、`deriveEquipmentPanel`接入03快照；attributes.def只校验或反投影同一防御来源，不额外叠加；agi=0不折算鞋轻功，eva/qinggong固有项不乘R。现modifier要求整数，须处理小数定点适配；wearer接装备适用性校验，默认男／女限制、缺省通用，当前EquipmentRule无wearer字段，由ENG-27a接收契约，不从衣色或服名授予身份。
合入后补测69件Ce两端外／内防与气血、六档闪避及鞋轻功、跨界与封顶gUse、强化／损坏只影响主属性、同色同值／投影不双算、穿卸重算与槽位替换（body30/head12/waist12/feet12/cape3）、男女／通用适用性、衫裙及首饰组合只计一件、本批不触发官甲身份或额外技能；这些引擎消费测试本轮未执行。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 总表`--landed 7`（69件、12组换色）、六份名录、生成器`--check`、`pnpm install --frozen-lockfile`、`check_ids --strict`均exit=0；严格ID新增失败／重复／近似对／旧ID／套装不对称0，仅基线sk_babuganchan未定义1不计失败；鞋表既有stamina警告保留。69件276端点与逐件九列／形制／主色／工艺／引用／代码块闭合核对通过，无占位或截断。
✅ 索引`--check`整体exit=1，本批ID零✘；完整collect确认69件draft／待出图、本批问题0，其他既有问题274处，INDEX待合入后重建。换色稿均有edit_from、底图首条参考、gemini-imagegen§4上传／stage暂存与claudeGemOpts无模板步骤；底图先出，禁止代码改色相，未出图。
✅ 549份脚本改写旧稿原字节恢复；1473份既有提示词（含GUIDE）、1466份既有内容及INDEX原字节未改；旧名录行／待决事项保留，design/10仅加一行；144路径全在写集，assets仅新增本批69份.md。每次写入≤150行，无整仓临时检出或整份assets复制，无工具／shim手改或改变仓库状态的git命令，过程文件在/private/tmp并于交付前删除，git diff --check通过。
⚠️ content:validate exit=1：tsx Unix socket报listen EPERM，按规则13交校验阶段沙箱外复验，未绕过沙箱；**ENG-27a**接入及数值／适用性补测见§6，当前运行时未消费装备修饰，不宣称效果已生效。需作者确认（附默认）：**无新增，沿用第4节默认值**；wearer沿既有名录男／女限制、缺省通用，结构由ENG-27a接收。
