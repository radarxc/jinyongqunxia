# DES-items-plus 报告 · 设计补充 · 物品设定按 AR-20 扩充（十一类名录，天地玄黄与年限分级，供批量出图）

## 1. 摘要（3–6 行）

- 已按 AR-20 完成十一份七列机器可读名录，共 170 行、170 个唯一 ID，覆盖天／地／玄／黄四档；本任务未生成图片。
- `design/10` 已补齐十一类接口、药材年限、`equip-slots.v2`、官甲违法暴露、暗器命中／毒与食材／食品／秘籍衔接，并把新 ID 登记在其 §14.2。
- 另补批量出图提示词与名录检查器；当前工作副本无物品基线目录，出图契约已安全降级为“完整文字、无参考图”。
- 严格 ID、名录、Python 编译与 `git diff --check` 均通过；未修改基准、下游文档、ID 基线或近似 ID 白名单。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/10-items-and-equipment.md` | 2501 | v1.5；§2 数据字段、§3 十一槽／官甲／暗器、§5 `catalogTian`、§8–§10 消耗品／食品／秘籍、§14–§16 注册／校验／依赖 |
| `docs/design/catalog/items-medicine.md` | 41 | 药物 12、补品 8、药材 12 |
| `docs/design/catalog/items-food.md` | 37 | 食材 12、食品 16 |
| `docs/design/catalog/items-manuals.md` | 27 | 复用 18 个既有 `it_miji_*` |
| `docs/design/catalog/items-weapons.md` | 33 | 兵器 24 |
| `docs/design/catalog/items-clothing.md`、`items-accessories.md`、`items-hidden-weapons.md` | 各 21 | 衣物／配件／暗器各 12 |
| `docs/design/catalog/items-armor.md`、`items-innerarmor.md`、`items-shoes.md`、`items-belts.md` | 各 17 | 制式盔甲／内甲／鞋／腰带各 8 |
| `assets/default/prompts/item.md` | 194 | §8 共用骨架、十一类专项骨架、品阶与年限画面语言、无参考图降级 |
| `tools/agents/check_item_catalog.py` | 205 | 文件／表头／七列／ID／配额／四阶／数值品阶／官甲／`catalogTian` 校验 |
| `tools/agents/reports/DES-items-plus.md` | 104 | 本报告 |

## 3. 关键结论与数值

- 四阶总计：天 41、地 52、玄 39、黄 38；所有十一表均覆盖四阶。药物／补品／药材为 12／8／12，食材／食品为 12／16，均达到配额。
- 代表品阶取黄／玄／地／天 `grade=3/6/9/10`，对应 `G=1.20/1.70/2.40/2.80`；`healPct=5%×G=6%/8.5%/12%/14%`，`mpPct=6%×G=7.2%/10.2%/14.4%/16.8%`。
- 药材普通／十年／百年／千年映射黄／玄／地／天，代表品阶 3／6／9／10；年限只定最低大阶，不自动赋予成药效果。
- `equip-slots.v2` 在原八槽上加 `innerBody`、`shoulder`、`cape`；内甲为 `0.10×G×DEF_LV` 外防与 `0.08×G×DEF_LV` 内防，护肩／披风各占旧小件预算一半。
- 8 件官甲跨宋／元／明／清，均带完整 `lawProfile`；物品侧只发六字段暴露事件，身份与通缉分别交 `design/12`、`design/11`。
- 15 件新增天级装备用 `catalogTian=true; divine=false; unique=true; price=null`，不进入原 12 件 `divine` 神兵集合，也不进随机、锻造、商店或天材骰。
- 秘籍只复用技能图鉴既有 `it_miji_*`；运行时 ID 注册表是生成物，故新增／复用清单登记在 `design/10` §14.2，未借基线或白名单掩盖错误。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| P-F 十一槽是否写入基准 | 先执行 `equip-slots.v2`；原八字段保留，三槽初始化与软猬甲／金丝背心移槽原子化 |
| P-G `catalogTian` 是否称神兵 | 不称神兵、不取 `divine` 通则；只作固定唯一的天级目录样本 |
| 护肩／披风预算是否压测后调整 | 各取旧小件一半：`defOutK=0.025`、`hpMaxK=0.005` |
| 披风遮蔽官甲的识别阈值与通缉强度 | 普通披风不遮蔽；仅显式 `concealment.coveredBy` 改暴露，强度／洗罪归 11／12 |
| 待考名物的具体出处、药效与形制 | 保留书名／物名和 **（待考）**，具体玩法／容器／构造一律按 **（原创扩展）**，不写未校准细节 |
| 当前缺 `assets/default/baseline/item/` | ART-item-* 使用完整文字且不传 `referenced_image_paths`；目录恢复后也只接受 manifest 为 `approved` 且哈希吻合的 PNG |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| P-F | 基准 §20 八格加 `innerBody`／`shoulder`／`cape`，升 `equip-slots.v2` | AR-20 明列内甲、护肩、披风；兼容迁移不破坏原八字段 |
| P-G | 基准 §14 封闭对象收窄为 12 件 `divine` 神兵，允许登记的非神兵 `catalogTian` | 同时满足 AR-20 各类四阶与原神兵稀缺性；两类字段互斥且产出渠道隔离 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步 |
|---|---|---|
| `docs/00-canon.md` | §14、§20 | 作者采纳后落 P-G 的 `divine/catalogTian` 边界与 P-F 十一槽 |
| `docs/design/11-open-world.md`、`12-quests-npc-factions.md` | 通缉／身份 | 消费官甲六字段事件；身份判定、通缉激活、正常城门阻断与脱甲不洗罪 |
| `docs/tech/04-data-pipeline.md`、`05-save-sync.md` | schema／迁移 | 承接 `equip-slots.v2`、`catalogTian`、`lawProfile` 校验和原子迁移；由管线生成 ID 注册表 |
| `docs/design/14-ui-ux.md` | 装备界面 | 增内甲／护肩／披风槽，v1 客户端只读且不得覆写 v2 |
| `docs/design/16-resources-and-estates.md` | `resourceRef` 映射 | 为新增药材／食材逐项补生产资源；名录 `materialGrade` 不等于已建生产路线，千年人参旧映射只保留来源／估值兼容 |
| `chapters/*`、`docs/story/*` | 固定投放节点 | 接入天级固定奇遇、官甲身份来源、名物取得；考据未完成不得变成唯一门槛 |
| `docs/tech/07-asset-generation.md`、ART-item-* | 物品资产 | 逐行消费十一表与提示词 §8，不从图稿或名录反写玩法 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 各类数量表（按品阶）

| 名录 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| medicine | 9 | 11 | 6 | 6 | 32 |
| food | 5 | 10 | 6 | 7 | 28 |
| manuals | 5 | 6 | 5 | 2 | 18 |
| weapons | 6 | 6 | 6 | 6 | 24 |
| clothing | 3 | 3 | 3 | 3 | 12 |
| armor | 2 | 2 | 2 | 2 | 8 |
| innerarmor | 2 | 2 | 2 | 2 | 8 |
| accessories | 3 | 3 | 3 | 3 | 12 |
| shoes | 2 | 2 | 2 | 2 | 8 |
| belts | 2 | 2 | 2 | 2 | 8 |
| hidden-weapons | 2 | 5 | 2 | 3 | 12 |
| **总计** | **41** | **52** | **39** | **38** | **170** |

### 7.2 原创扩展清单

出处列含 **（原创扩展）** 的 124 行如下；其中包括全原创物件，也包括原著语境下新增的具体载体／定级。其余 46 行是原著名物或待考名物，但 170 行的玩法或外观也都逐行标出了原创部分。

- accessories：`eq_pijian` `eq_bumianpifeng` `eq_qingjin` `eq_linpijian` `eq_wuyepifeng` `eq_baiyuguan` `eq_xuantiepijian` `eq_heyudachang` `eq_zijinfaguan` `eq_longlinpijian` `eq_tianfengpifeng` `eq_qixingbaoguan`。
- armor：`eq_songxunyijia` `eq_qingzaolijia` `eq_yuanqibingjia` `eq_mingweisuojia` `eq_songjinjunburenjia` `eq_mingjinyiweijia` `eq_yuansuweiqiejia` `eq_qingyulinjia`；belts：`eq_mayaodai` `eq_pihudai` `eq_qingyudai` `eq_baonadai` `eq_xuantiedai` `eq_yunlongyudai` `eq_qiankundaidai` `eq_tianchanyaodai`。
- clothing：`eq_buyi` `eq_jinzhuang` `eq_sengyi` `eq_daopao` `eq_yexingyi` `eq_taohuajinpao` `eq_xiyuhufu` `eq_yunjinhechang` `eq_tianchanbaoyi` `eq_zixiaqingyi`。
- food：`it_jingmi` `it_huotuijian` `it_xianyu` `it_cumian` `it_xuelianzi` `it_yuxueguo` `it_xianggu` `it_longganfengsui` `it_binghuxueou` `it_xueshanlufu` `it_tianshanlingmi` `it_baihualinglu` `it_ganliang` `it_guisugao` `it_niurougan` `it_furonggao` `it_baihuagao` `it_yuluwan` `it_xueyulengchan` `it_tianxiangyulu` `it_jiangniurou` `it_tianxiangyuyan` `it_yushan`。
- hidden-weapons：`it_feihuangshi` `it_jinqianbiao` `it_xiujian` `it_meihuazhen` `eq_luochaduanchong`；innerarmor：`eq_zhusutiejia` `eq_pirutiejia` `eq_ruansijia` `eq_jinsijia` `eq_xuansuoruanjia` `eq_tianchansiruanjia`。
- manuals：`it_miji_luohanquan` `it_miji_taizuchangquan` `it_miji_quanzhenxinfa` `it_miji_suohouqinnashou` `it_miji_baituodujing` `it_miji_yangjiaqiangfa` `it_miji_liangyixinfa` `it_miji_tiebushan` `it_miji_dajingangzhang` `it_miji_longzhaoshou` `it_miji_canhezhi` `it_miji_baihongzhang` `it_miji_xisuijing` `it_miji_xianglong18_can` `it_miji_dagou_can` `it_miji_douzhuan`。
- medicine：`it_jinchuangyao` `it_huoxuewan` `it_jiuzhuanhuanhundan` `it_yangjingwan` `it_bailucao` `it_xiaohuandan` `it_zixiaoyangqidan` `it_shengshengzaohuadan` `it_tiansuixuminglu` `it_shinianrenshen` `it_bainianrenshen` `it_qiannianrenshen` `it_xueshen` `it_shinianxueshen` `it_bainianxueshen` `it_qiannianxueshen` `it_qiannianlingzhi` `it_qiannianxuelian`。
- shoes：`eq_caoxie` `eq_bukuaixue` `eq_qingyunlv` `eq_feiyuxue` `eq_tayunlv` `eq_xuexingxue` `eq_wuyinglv` `eq_tianmalv`；weapons：`eq_qinggangjian` `eq_dandao` `eq_qimeigun` `eq_huaqiang` `eq_duanbi` `eq_ruanbian` `eq_longquanjian` `eq_yanlingdao` `eq_chanzhang` `eq_sanjiegun`。

### 7.3 重复／冲突、ART 交接、确认项与检查

- ✅ 重复／冲突：`it_labazhou` 只在 food，`eq_xiaolifeidao` 只在 hidden-weapons；18 本秘籍及既有名物复用原 ID；`eq_wenxuzhen` 按 `grade=7` 显示地；“暴雨梨花针”误名及其旧 ID 已删除，统一为 `eq_baoyulihuading` 暴雨梨花钉。
- ✅ 槽位冲突：`eq_ruanweijia`、`eq_jinsibeixin` 迁 `innerBody`，`eq_baoyi`、`eq_wucanyi` 留 `body`；额外天级用 `catalogTian` 与 12 件 `divine` 隔离。
- ✅ ART-item-* 输入：`items-medicine.md`、`items-food.md`、`items-manuals.md`、`items-weapons.md`、`items-clothing.md`、`items-armor.md`、`items-innerarmor.md`、`items-accessories.md`、`items-shoes.md`、`items-belts.md`、`items-hidden-weapons.md`，均位于 `docs/design/catalog/`；提示词见 `assets/default/prompts/item.md` §8。
- ✅ 交下游 `ENG-*` 的字段清单：数据管线承接 `catalogTian`（与 `divine` 互斥，且须 `unique`、`price:null`、禁入随机／锻造／商店）、`specialDefense`、`meridianAid` 及下列材料／暗器字段的 schema 与校验；存档迁移承接 `equipSlotsVersion:2` 和 `innerBody/shoulder/cape` 三槽原子初始化／移槽；装备运行时承接三槽装配、`specialDefense`，以及 `hiddenKind/hiddenHit/range/reloadOwnActions/perBattle/onHit/poisonCoat`；身份／通缉承接 `lawProfile/concealment` 并消费六字段暴露事件 `{equipId,wearerId,lawProfile,exposure,locationId,time}`；资源／烹饪承接 `herbFamily/ageYears/ingredientKind/materialGrade/resourceRef`，不得以同资源引用替代具名材料。
- ⚠️ 需作者确认：P-F／P-G、半槽预算、官甲遮蔽规则及待考名物；未拍板时严格采用 §4 默认，不阻塞实现与出图。
- ✅ 校验：`check_ids.py --strict` 新失败 0；名录检查为 11 表／170 行／170 唯一 ID；`py_compile` 与 `git diff --check` 通过。
- ✅ 范围与完整性：Git 变更仅在允许路径；两份 ID lint JSON 未改；无图片产出、无占位符、无截断表格或未闭合代码围栏。
