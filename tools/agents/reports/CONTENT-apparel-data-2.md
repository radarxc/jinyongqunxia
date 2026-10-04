# CONTENT-apparel-data-2 报告 · 内容 · 衣物与护甲扩充落数据（AR-77）第 2 批：总表第 2 批进物品名录，生成 content/items，逐件写出图提示词（供 Gemini 出图）；过程文件不进 assets/

## 1. 摘要（3–6 行）

第2批75件，均属唐：男装18、女装12、头饰12、腰带12、鞋12、披风3、铠甲6；内甲0。
追加75行九列名录，生成75份内容数据与75份draft提示词；男紫罗／女草绿各六档为12件底图，18件换色编辑。
75个新ID已登记；独立核算300个Ce端点一致。未出图、未改其他批次；content:validate受沙箱EPERM阻断，交合入后复验。

## 2. 产出（文件、行数、主要章节）

`docs/design/catalog/items-{clothing,armor,accessories,belts,shoes}.md`分别追加30／6／15／12／12行，总144／55／122／92／92行；innerarmor原48行未改。生成器新增`content/items/<ID>.yaml`75份、2373行；提示词落`assets/default/prompts/items/{clothing,armor,accessories,belts,shoes}/<ID>.md`75份、5247行，含物品要点／完整提示词／排除／质检／换色执行。GUIDE已有§6「同款换色」，按要求不重复追加；design/10仅§14.2加1行75个ID，总2993行；本报告30行。
## 3. 关键结论与数值

六档2／4／6／7／8／9，披风2／5／8；名录基底=总表系数÷G，如黄衣0.176÷1.10=0.16、0.132÷1.10=0.12；小件0.05／0.01，披风0.025／0.005。`def=roundHalfUp(100×kDef×G)`：轻衣31／39／48／56／62／67，小件6／7／9／10／11／12，披风3／4／6；六甲按总表顺序锁子51、筒袖49、明光77、细鳞70、盆领60、山文70。明光外防0.28×2.20=0.616，Ce30／52为214／607，内防53／152；轻衣eva=2G，重甲resCCPp／tough=2G、Q_load=10、mov=−1。鞋轻功2.5×gUse，满效5／10／15／17.5／20／22.5，agi=0；颜色不改变数值。槽分布body36／head12／waist12／feet12／cape3，出现书界沿design/27 §1落ch10_baima；不增加白马奖励预算。
## 4. 开放问题（附默认值）

总表本批未发现结构／数值错误；六甲进制式甲名录但未给lawProfile，与design/10官甲必填口径存在待协调项，默认普通历史甲形、不补造官军身份或通缉。702年服装与首饰裁片、女素白常服实证、锁子环式、筒袖唐代存用、明光细部、细鳞尺寸联缀、盆领存用与山文拼接均沿总表（待考）；默认初唐原创转换，筒袖晋式复古、山文札面纹样，不冒充修订版小说记载或确定复原。蹀躞带本白默认革芯覆帛、铜銙铊尾保留本色；梳钗素白落束帛织缘，金属骨不涂白。基线manifest倚天剑candidate与GUIDE“作者已审”差异沿第1批待办，默认保留两张指定参考，由出图员核审批记录。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增；沿用design/27 P27-01及各名录既有wearer提案，不改基准、装备机制或既有待决条目。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

已解决：design/10 §14.2按名录顺序登记75个新ID。既有待办继续交协调者：`extract_item_prompts.py`／九列映射修正（本批已逐件校正）；`items_from_catalog.py`／腰带12与鞋12误推metal、梳钗6仅按统一子类推fabric，材族修订后由生成器重生成；其origin把历史书名判为canonExpanded，默认保留生成结果、后续区分历史证据与小说出处。五份名录文末／同步AR-77统计与非制服甲边界；GUIDE §1仍称七列，另任务同步；开发监督／合入后全量重建总INDEX、沙箱外重跑content:validate，本轮不改这些位置。
装备效果接收任务为**ENG-27a**（沿[第1批报告](CONTENT-apparel-data.md)§6、[ENG-attr-v2-schema报告](ENG-attr-v2-schema.md)§4）：消费`extension.value.slot`、`armorWeight`、`attributes:{version:2,def,agi?}`及`flags:[runtimeProjection]`标记的`text.desc`中`defOutK/defInK`防御系数、`hpMaxK`气血系数、`eva`闪避、`qinggong`轻功、`wearer=male|female`，重甲另保留`resCCPp/tough/Q_load/mov`。同步schema／生成器，把效果编译为结构化字段，扩展`apps/game/src/runtime/content.ts`的`equipmentRules(content)`：slot进入既有`EquipmentRule.slot`，armorWeight选design/10 §3.4系数，按§4.1及design/03的Ce兼容曲线、gUse/G/R重算主防御／气血，经既有`EquipmentRule.modifiers`、`deriveEquipmentPanel`接入03快照；def仅校验或反投影同一来源，禁止再叠加防御，agi=0不折算鞋轻功。固有闪避／轻功及重甲固有项不乘R，Q_load进入既有轻功负重；须解决现整数modifier接口的小数定点适配。wearer接装备适用性校验，沿既有名录默认男／女限制、缺省通用；当前EquipmentRule无wearer字段，由ENG-27a接收，不从名称或officialArmor子类补造制服身份。
合入后补测：75件Ce两端外／内防和气血、六档闪避及鞋轻功、五件重甲抗控／韧性／负重／移动与臂力适用性；跨界压制和等级封顶gUse、强化／损坏仅影响主属性、换色组同值与摘要不双算、穿卸重算及body36/head12/waist12/feet12/cape3替换、男女／缺省适用性、六甲无制服身份不触发通缉、白马普通池／珍藏来源边界。这些引擎消费测试本轮未执行。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 总表`--landed 2`（75件、12组换色）、六份名录、生成器`--check`、`pnpm install --frozen-lockfile`、`check_ids --strict`均exit=0（严格新增失败／重复／近似对／旧ID／套装不对称0，基线sk_babuganchan未定义1不计失败）；✅ 独立核算75件与300个Ce端点、逐件提示词字段／形制／主色／品阶与编辑依赖核对；✅ 索引`--check`整体exit=1，但输出本批零✘，完整collect确认75件draft／待出图、本批问题0，其他条目274处既有问题。✅ HEAD对照原名录行和既有提示词字节未变，GUIDE、INDEX、其他批次未改，assets只新增本批75稿，生成数据仅生成器写，design/10只登记一行；共157路径全在写集，写入≤150行、临时文件已删、无整仓临时复制、无工具／shim手改或改变仓库状态的git命令，git diff --check通过。⚠️ content:validate exit=1，tsx Unix socket报listen EPERM，依规则13交沙箱外复验；鞋表既有stamina警告保留。⚠️ ENG-27a字段消费与数值／适用性补测见§6，当前运行时尚未消费这些装备修饰，本轮不宣称效果已生效。
需作者确认（附默认）：无新增，沿用第4节默认值；wearer沿既有名录男／女限制、缺省通用，结构由ENG-27a接收。
