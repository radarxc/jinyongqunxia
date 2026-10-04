# CONTENT-apparel-data 报告 · 内容 · 衣物与护甲扩充落数据（AR-77）第 1 批：总表第 1 批进物品名录，生成 content/items，逐件写出图提示词（供 Gemini 出图）；过程文件不进 assets/

## 1. 摘要（3–6 行）

第1批73件：男装18、女装12、头饰12、腰带12、鞋12、披风3、铠甲3（盔／面甲／皮甲）、特殊衣物1；春秋71、通用2。
追加73行名录，生成73份内容数据与73份draft提示词；男女六档共12件纁红底图、18件换色编辑，皮甲复用既有ID。
第4次续作仅补报告，明确装备效果消费交接给ENG-27a及合入后补测；现有名录、内容、提示词和design/10均保持原字节。全部验收命令已重跑；content:validate仍受沙箱EPERM阻断，待沙箱外复验。
## 2. 产出（文件、行数、主要章节）

`docs/design/catalog/items-{clothing,armor,accessories,belts,shoes}.md`分别追加31／1／17／12／12行，总行数114／49／107／80／80；innerarmor原48行未改。生成器输出`content/items/<ID>.yaml`73份、2233行；`assets/default/prompts/items/<类>/<ID>.md`73份、5101行（物品要点／提示词／排除／质检／换色执行）；GUIDE末尾§6「同款换色」21行，总64行，沿用前轮。design/10仅§14.2新增1行72个ID，总2992行；本报告30行。

## 3. 关键结论与数值

六档2／4／6／7／8／9，披风2／5／8；名录系数=总表满效系数÷G，如黄衣0.176÷1.10=0.16、0.132÷1.10=0.12，eva=2×G；def=roundHalfUp(100×kDef×G)，衣31／39／48／56／62／67，小件6／7／9／10／11／12，披风3／4／6，皮甲42。鞋满效轻功2.5×grade=5／10／15／17.5／20／22.5，agi=0；前轮73件Ce预览端点复算一致，本轮沿用；盔与面甲只用head小件公式。

## 4. 开放问题（附默认值）

沿用前轮结论：总表本批结构／数值未发现错误。越地裁片、女纁红／素白常服、春秋饕餮盔面实物、具体兽材、虎皮衣原著同名均（待考），默认沿design/27原创示意，不编回目或持有者。皮甲归制式甲名录但属通用基底、未给lawProfile：默认普通皮甲、不补造官军身份，交协调者确认。韦鞶本白默认外覆帛及织缘，革与带钩保留材色。倚天剑基线manifest的candidate与GUIDE“作者已审”差异仍待出图员核对STYLE审批记录，默认保留指定两条参考、不代改状态。已解决：72个新ID正式登记，见design/10 §14.2，原总表ID全部保留。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增；沿用上游design/27 P27-01与各名录既有wearer提案，不改品阶、槽位、战斗数值或装备机制。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

已解决：design/10 §14.2已按名录顺序登记72个新ID，严格ID失败数0；监督已带入近似ID允许表。既有同步待办保留：`extract_item_prompts.py`升级九列（本批新稿已纠正）；`items_from_catalog.py`修matFamily（鞋12／腰带12误推metal、虎皮衣误推fabric）后重生成；五表文末同步AR-77；开发监督合入后重建总INDEX并在沙箱外重跑content:validate。装备效果由**ENG-27a**接收（依据[ENG-attr-v2-schema报告](ENG-attr-v2-schema.md)§4、[TODO](../../../TODO.md)§5开发队列）：消费`extension.value.slot`、`armorWeight`、`attributes:{version:2,def,agi?}`，以及`text.desc`中由`flags:[runtimeProjection]`标记保留的`defOutK/defInK`（防御系数）、`hpMaxK`（气血系数）、`eva`（闪避）、`qinggong`（轻功）、`wearer=male|female`。ENG-27a应同步数据schema／生成器，把名录效果编译为结构化运行字段，扩展`apps/game/src/runtime/content.ts:62`的`equipmentRules(content)`适配：`slot`直接进入既有`EquipmentRule.slot`，`armorWeight`选择design/10 §3.4轻／中甲系数，按§4.1、design/03的Ce兼容曲线与`gUse/G/R`重算`defOut/defIn/hpMax`，以既有`EquipmentRule.modifiers`接入`deriveEquipmentPanel`及03属性快照；`eva/qinggong/agi`走同一修饰来源；`attributes.def`仅校验或反投影同一防御来源，不再叠加，`agi=0`不折算鞋轻功；固有闪避／轻功不乘R，需解决既有整数modifier接口对小数的定点适配。`wearer`需接入装备适用性校验，沿既有名录默认男／女限制、缺省通用；当前EquipmentRule没有wearer字段，需由ENG-27a接收契约，不从名称或officialArmor子类补造官甲身份。引擎合入后补测73件Ce两端外／内防与气血、六档闪避及鞋5／10／15／17.5／20／22.5、跨界与等级封顶的gUse、强化／损坏只影响主属性、同色组同值／摘要不双算、穿卸重算与槽位替换（body32/head14/waist12/feet12/cape3）、男女／缺省适用性、普通皮甲不触发官甲通缉；这些引擎消费测试本轮未执行。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 第4次续作重跑总表`--landed 1`（73件、12组换色）、六份名录、生成器`--check`、`pnpm install --frozen-lockfile`、严格ID，均exit=0；严格ID新增失败／重复／旧ID／近似对／套装不对称均0，仅基线sk_babuganchan未定义1项不计失败。✅ `build_image_index --check`exit=1，本批ID零✘；完整collect确认73件均draft／待出图且零问题，其他条目274处既有问题、INDEX待合入后重建。✅ 本轮153条产物哈希及差异未变、只补报告；HEAD对照旧名录行／既有提示词未变、GUIDE原文保留、design/10仅登记1行；累计154路径全在写集，assets仅本批73稿与GUIDE追加，无其他批次或图片；前轮形制／颜色／品阶核对沿用，每次写入≤150行，无工具／shim手改或改变仓库状态的git命令，`git diff --check`通过。⚠️ `pnpm content:validate`exit=1：tsx Unix socket报listen EPERM，按规则13交沙箱外复验；鞋表既有stamina警告保留。⚠️ 下游字段`slot/armorWeight/attributes`及`text.desc/runtimeProjection`保留的`defOutK/defInK/hpMaxK/eva/qinggong/wearer`已明确交**ENG-27a**（见§6）；当前运行时未消费装备修饰，合入后须完成§6数值／适用性补测，本轮不实现引擎、不宣称效果已生效。需作者确认（附默认）：**无新增**，沿用§4默认值；wearer沿既有名录男／女限制、缺省通用，结构由ENG-27a接收。
