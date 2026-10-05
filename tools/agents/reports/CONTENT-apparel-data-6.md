# CONTENT-apparel-data-6 报告 · 内容 · 衣物与护甲扩充落数据（AR-77）第 6 批：总表第 6 批进物品名录，生成 content/items，逐件写出图提示词（供 Gemini 出图）；过程文件不进 assets/

## 1. 摘要（3–6 行）

第6批70件均属明代（笑傲ch05／侠客ch06）：男装18、女装12、头饰12、腰带12、鞋12、披风3、特殊衣物玉莲衣1；无新增铠甲／内甲。
追加70行九列名录，生成70份内容数据、70份draft提示词；男女六档共12件底图（男绯红／女草绿）、18件换色编辑，GUIDE已有同款换色规程，沿用不重复追加。
70件280个Ce预览端点复算通过，其他批次原字节保留；content:validate受tsx沙箱EPERM阻断，交沙箱外复验。本轮不出图、不重建INDEX、不实现引擎。
## 2. 产出（文件、行数、主要章节）

`docs/design/catalog/items-{clothing,accessories,belts,shoes}.md`分别追加31／15／12／12行，总266／182／140／140行；armor55行、innerarmor48行未改。生成器输出`content/items/<ID>.yaml`70份2282行；`assets/default/prompts/items/<类>/<ID>.md`70份5130行（物品要点／提示词／排除／质检，男女衣物另含换色执行），单稿69–83行。design/10仅§14.2表末追加一行70个ID，按衣物→配件→腰带→鞋的名录顺序登记，总2997行；本报告30行。
## 3. 关键结论与数值

六档2／4／6／7／8／9，披风2／5／8；名录基底=总表满效系数÷G，如黄衣0.176÷1.10=0.16、0.132÷1.10=0.12，玉莲衣0.352÷2.20=0.16、0.264÷2.20=0.12，eva=2×G。def=roundHalfUp(100×kDef×G)：轻衣31／39／48／56／62／67、小件6／7／9／10／11／12、披风3／4／6；鞋轻功2.5×gUse=5／10／15／17.5／20／22.5，agi=0。以design/03精确兼容曲线和有理数复算280端点，无提前取整或双乘G；12组同色同值。槽位body31／head12／waist12／feet12／cape3；wearer男／女66件、缺省通用4件。
## 4. 开放问题（附默认值）

总表本批结构／数值未发现错误。女素白逐朝常服实证、具体裁片与配件连接沿design/27原创转换；玉莲衣须核三联／广州修订版是否有同名物及人物／情节，默认原创莲纹轻衣，玉为色泽，无疗伤、回内或门派身份，不编回目。男本白革带默认外覆帛、铜与革保持材色，织绣只落覆面／端缘；女簪素白指束帛织缘，男皮履高档织绣只落从属布缘。明六档是目录候选，不等于两书掉落池：沿design/10§4.4，地上9默认只在笑傲取得、侠客本土固定上限8，合法外来装备另走压制；当前chapters含ch05/ch06须由投放端约束。沿前批待办：倚天剑基线manifest仍candidate、GUIDE称作者已审，默认保留指定参考，由出图员核STYLE审批记录；新稿不自行宣称approved。已解决：70个新ID正式登记，见design/10§14.2。本轮未联网或逐字校勘小说，不声称消除上游待考。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增；沿用design/27 P27-01与各名录既有wearer提案，不改品阶、槽位、战斗数值或装备机制。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

已解决：design/10§14.2登记70个新ID。交协调者：`extract_item_prompts.py`／升级九列映射（本批已校正）；`items_from_catalog.py`／本批腰带12、鞋12误推matFamily=metal，历史书名使69件原创装备归origin=canonExpanded（玉莲衣1件expanded），默认保留生成结果，修生成器后重生成；四份名录文末／同步AR-77统计；GUIDE§1与item.md§8／旧七列说明；章节投放／按§4.4约束明地上来源，不以目录候选提高侠客本土上限；开发监督／合入后全量重建INDEX、沙箱外重跑content:validate。
引擎接收任务为**ENG-27a**（沿[第1批报告](CONTENT-apparel-data.md)§6、[ENG-attr-v2-schema报告](ENG-attr-v2-schema.md)§4）：消费`extension.value.slot`、`armorWeight`、`attributes:{version:2,def,agi?}`，以及`flags:[runtimeProjection]`标记的`text.desc`中保留的`defOutK/defInK`防御系数、`hpMaxK`气血系数、`eva`闪避、`qinggong`轻功、`wearer=male|female`。同步schema／生成器将效果编译为结构化字段，扩展`apps/game/src/runtime/content.ts:62`的`equipmentRules(content)`：slot接既有`EquipmentRule.slot`，armorWeight按design/10§3.4选系数，按§4.1及design/03的Ce兼容曲线、gUse/G/R重算defOut/defIn/hpMax，经`EquipmentRule.modifiers`、`deriveEquipmentPanel`接入03快照；attributes.def仅校验或反投影同一防御来源，不额外叠加；agi=0不折算鞋轻功，eva/qinggong固有项不乘R。现modifier要求整数，须处理小数定点适配；wearer接装备适用性校验，默认男／女限制、缺省通用，当前EquipmentRule无wearer字段，由ENG-27a接收契约，不从绯红、莲纹或服名授予身份。
合入后补测70件Ce两端外／内防与气血、六档闪避和鞋轻功、跨界与封顶gUse、强化／损坏只影响主属性、同色同值／投影不双算、穿卸重算与槽位替换（body31/head12/waist12/feet12/cape3）、男女／通用适用性、衫裙与首饰组合只计一件、玉莲衣无额外疗伤／回内／身份，以及侠客地上投放边界；这些引擎消费测试本轮未执行。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 总表`--landed 6`（70件、12组换色）、六份名录、生成器`--check`、`pnpm install --frozen-lockfile`、`check_ids --strict`均exit=0；严格ID新增失败／重复／近似对／旧ID／套装不对称0，仅基线sk_babuganchan未定义1不计失败。✅ 70件280端点与逐件九列／形制／主色／工艺／引用／代码块闭合核对通过，无占位或截断；鞋表既有stamina警告保留。
✅ 索引`--check`整体exit=1，本批ID零✘；完整collect确认70件draft／待出图、本批问题0，其他既有问题274处，INDEX待合入后重建。未出图，换色稿均写edit_from及底图首条参考、无模板上传／暂存步骤与claudeGemOpts；底图先出，禁止代码改色相。
✅ 479份脚本改写旧稿原字节恢复，1403份既有提示词（含GUIDE）、1396份既有内容与INDEX均原字节未改；旧名录行／待决事项保留，design/10仅加一行；146路径全在写集，assets仅新增本批70份.md。每次写入≤150行，无整仓临时检出或整份assets复制，无工具／shim手改或改变仓库状态的git命令，过程文件在/private/tmp并于交付前删除，git diff --check通过。
⚠️ content:validate exit=1：tsx Unix socket报listen EPERM，按规则13交校验阶段沙箱外复验，未绕过沙箱；ENG-27a接入及数值／适用性补测见§6，当前运行时未消费装备修饰，不宣称效果已生效。 需作者确认（附默认）：**无新增，沿用第4节默认值**；wearer沿既有名录男／女限制、缺省通用，结构由ENG-27a接收。
