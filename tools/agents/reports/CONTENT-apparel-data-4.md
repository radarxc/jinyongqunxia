# CONTENT-apparel-data-4 报告 · 内容 · 衣物与护甲扩充落数据（AR-77）第 4 批：总表第 4 批进物品名录，生成 content/items，逐件写出图提示词（供 Gemini 出图）；过程文件不进 assets/

## 1. 摘要（3–6 行）

第4批69件，均属南宋（射雕ch02／神雕ch03）：男装18、女装12、头饰12、披风3、腰带12、鞋12；新增铠甲与内甲均0。
追加69行九列名录，由生成器新增69份内容数据；69份draft提示词含绯红男装／紫褐女装底图12件、换色编辑18件、配件39件。
69个新ID已登记，276个Ce端点独立复算一致；未出图、未改其他批次。content:validate因沙箱EPERM未完成，交合入后复验。

## 2. 产出（文件、行数、主要章节）

`docs/design/catalog/items-{clothing,accessories,belts,shoes}.md`分别追加30／15／12／12行，总204／152／116／116行；armor55、innerarmor48行未改。新增`content/items/<ID>.yaml`69份、2238行；`assets/default/prompts/items/<类>/<ID>.md`69份、5010行（物品要点／提示词／排除／质检／换色执行）。design/10仅§14.2追加1行，总2995行；GUIDE已有§6不再追加，INDEX未改；本报告30行。
## 3. 关键结论与数值

六档2／4／6／7／8／9，披风2／5／8。名录基底=总表满效系数÷G：黄轻衣0.176÷1.10=0.16、0.132÷1.10=0.12；小件0.055÷1.10=0.05、0.011÷1.10=0.01；披风0.0275÷1.10=0.025、0.0055÷1.10=0.005。def=roundHalfUp(100×kDef×G)：衣31／39／48／56／62／67，小件6／7／9／10／11／12，披风3／4／6；eva=2G，鞋轻功2.5×gUse（满效5／10／15／17.5／20／22.5）、agi=0。按03精确曲线核对69件276个Ce端点，同档换色同值；槽分布body30/head12/waist12/feet12/cape3。
## 4. 开放问题（附默认值）

总表本批数值／结构未发现错误；`form`泛称黄昇墓衣物为“殓衣”，而`source`与design/27 §7 S06注明包袱随葬衣物：已照总表保留form，默认仅借裁形、不复刻殓服层数、不虚构墓中披风，交协调者统一措辞。女素白逐朝常服实证、具体裁片及配件连接沿总表（待考），默认南宋原创常服转换；公服取色不称庶民偏好排行。本轮未复核史料全文或小说修订版，不编原著持有人／回目。倚天剑基线manifest为candidate而GUIDE称作者已审，沿第1批待办，默认保留指定参考，由出图员核STYLE审批记录后执行。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增；沿用design/27 P27-01与名录既有wearer提案，不改基准、槽位、装备机制或既有待决事项。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

已解决：design/10 §14.2按名录顺序登记69个新ID。交协调者：总表／统一“殓衣”措辞；`extract_item_prompts.py`／升级九列映射（本批已纠正）；`items_from_catalog.py`／本批腰带12、鞋12误推matFamily=metal，历史书名使57件原创装备归origin=canonExpanded（另12件expanded），默认保留生成结果，修生成器后重生成；四表文末／同步AR-77统计；GUIDE §1和item.md §8／旧七列说明；开发监督／合入后全量重建INDEX、沙箱外重跑content:validate，本轮不改这些位置。
引擎接收任务为**ENG-27a**（沿[第1批报告](CONTENT-apparel-data.md)§6、[ENG-attr-v2-schema报告](ENG-attr-v2-schema.md)§4）：消费`extension.value.slot`、`armorWeight`、`attributes:{version:2,def,agi?}`，以及`flags:[runtimeProjection]`标记的`text.desc`中保留的`defOutK/defInK`防御系数、`hpMaxK`气血系数、`eva`闪避、`qinggong`轻功、`wearer=male|female`。同步schema／生成器将效果编译为结构化字段，扩展`apps/game/src/runtime/content.ts:62`的`equipmentRules(content)`：slot进入既有`EquipmentRule.slot`，armorWeight按design/10 §3.4选系数，按§4.1及03的Ce兼容曲线、gUse/G/R重算defOut/defIn/hpMax，经`EquipmentRule.modifiers`、`deriveEquipmentPanel`接入03快照；attributes.def只校验或反投影同一防御来源，不额外叠加；agi=0不折算鞋轻功，eva/qinggong固有项不乘R。现modifier要求整数，须处理小数定点适配；wearer接装备适用性校验，默认男／女限制、缺省通用，当前EquipmentRule无wearer字段，由ENG-27a接收契约，不从公服色或名称授予身份。
合入后补测：69件Ce两端外／内防与气血、六档eva及鞋轻功、跨界压制和等级封顶gUse、强化／损坏仅影响主属性、换色组同值／投影不双算、穿卸重算及body30/head12/waist12/feet12/cape3替换、男女／缺省适用性、衫裙与簪帛组合只计一件、绯红衣不触发官甲身份或通缉；以上引擎消费测试本轮未执行。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 总表`--landed 4`（69件、12组换色）、六份名录、生成器`--check`、`pnpm install --frozen-lockfile`、`check_ids --strict`均exit=0（新失败／重复／近似对／旧ID／套装不对称0，仅基线sk_babuganchan未定义1不计失败）。✅ 69件276端点复算、逐件形制／颜色／品阶与九列映射核对；索引`--check`整体exit=1、本批零✘，完整collect确认69件draft／待出图、本批问题0，其他既有问题274处。✅ 340份脚本改写的旧稿原字节恢复，1264份既有提示词／GUIDE均原字节未改，旧名录行／INDEX未改，design/10仅加一行；144路径均在写集，assets仅新增本批69稿，内容数据仅生成器写，每次写入≤150行，临时过程文件已删，无整仓临时复制、工具／shim手改或改变仓库状态的git命令，git diff --check通过。⚠️ content:validate exit=1：tsx Unix socket报listen EPERM，按规则13交沙箱外复验；鞋表既有stamina警告保留。⚠️ ENG-27a字段接入与数值／适用性补测见§6，当前运行时尚未消费这些装备修饰，不宣称效果已生效。
需作者确认（附默认）：无新增，沿用第4节默认值；wearer沿既有名录男／女限制、缺省通用，结构由ENG-27a接收。
