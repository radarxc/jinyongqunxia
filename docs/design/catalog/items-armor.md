# 物品图鉴 · 制式盔甲（`items-armor`）

> **归属（基准 §18）**：本表投影 `design/10` §3.4.1 的官府制式甲；通缉状态机不在本表定义。
> **上游**：AR-20、`design/10` §2.4、§3.4.1、§4.10（属性投影 v2）；年代口径引用 `design/02`。
> **引用而不重定义**：身份合法性由 `design/12` 判断，通缉与正常城门 `blocked` 由 `design/11` 执行。
> **标注约定**：具体军号、配色与效果均 **（原创扩展）**；形制须按宋／元／明／清分别核图。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 说明 | 效果字段 | 属性投影 | 外观要点（供出图） |
|---|---|---|---|---|---|---|---|---|
| `eq_songxunyijia` | 宋制巡役甲 | 制式盔甲·宋 | 黄 | **（原创扩展）** | 宋制巡役甲以灰蓝布衣缀小片护胸，供州县巡役日常执勤，重在耐磨而非冲阵。卸甲须逐解皮带；冒穿者一经城门盘问便可能招来追捕。**（原创扩展）** | `grade=3; slot=body; armorWeight=medium; lawProfile={uniform:true,allowedIdentityTags:[office_song_patrol],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=36` | 南宋灰蓝布甲配小片札甲护胸，短摆、皮带，无文字号衣 **（原创扩展）** |
| `eq_qingzaolijia` | 清制皂隶衣甲 | 制式盔甲·清 | 黄 | **（原创扩展）** | 清制皂隶衣甲以深青号衣和软衬构成，便于衙役奔走、拿人和维持堂前秩序。黑红滚边远处醒目，却无具体衙号；无合法身份穿用仍会触发盘查。**（原创扩展）** | `grade=3; slot=body; armorWeight=light; lawProfile={uniform:true,allowedIdentityTags:[office_qing_yamen],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=34` | 清代深青号衣与黑红滚边，软帽另不入画，无胸背文字 **（原创扩展）** |
| `eq_yuanqibingjia` | 元制骑兵札甲 | 制式盔甲·元 | 玄 | **（原创扩展）** | 元制骑兵札甲以铁札和皮绦编缀成短身，骑乘时护住胸背又不压马鞍。军中讲究常查松脱系片；散落民间的旧甲常因宿主军籍不明而惹祸。**（原创扩展）** | `grade=6; slot=body; armorWeight=heavy; lawProfile={uniform:true,allowedIdentityTags:[office_yuan_army],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=60` | 元代铁札甲、皮革系片、暗褐肩带，骑兵短身甲，旧而完整 **（原创扩展）** |
| `eq_mingweisuojia` | 明制卫所甲 | 制式盔甲·明 | 玄 | **（原创扩展）** | 明制卫所甲以红布衬铁札，圆护胸和束带适合守城列阵，穿前须按次序收紧肩腰。边镇传言每道磨痕都对应一次点卯，但甲衣本身不能替代军籍。**（原创扩展）** | `grade=6; slot=body; armorWeight=heavy; lawProfile={uniform:true,allowedIdentityTags:[office_ming_garrison],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=60` | 明代红布衬铁札、圆护胸与皮革束带，不画官衔文字 **（原创扩展）** |
| `eq_songjinjunburenjia` | 宋制禁军步人甲 | 制式盔甲·宋 | 地 | **（原创扩展）** | 宋制禁军步人甲由长摆札甲、披膊和护臂组成，列阵时相互遮护，独行则颇费脚力。军匠教人先查绦结再披挂；江湖客私藏完整一领极易引人侧目。**（原创扩展）** | `grade=9; slot=body; armorWeight=heavy; lawProfile={uniform:true,allowedIdentityTags:[office_song_imperial_army],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=84` | 北宋重型札甲长摆、肩吞与护臂，铁灰配暗红绦，约半人高 **（原创扩展）** |
| `eq_mingjinyiweijia` | 明制锦衣卫甲 | 制式盔甲·明 | 地 | **（原创扩展）** | 明制锦衣卫甲采用深青罩甲与皮护腰，兼顾仪卫威势和近身行动，金线只作克制边饰。市井常把华服误认官甲，但本件无飞鱼纹，合法性仍须身份核验。**（原创扩展）** | `grade=9; slot=body; armorWeight=medium; lawProfile={uniform:true,allowedIdentityTags:[office_ming_imperial_guard],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=72` | 明代深青曳撒式罩甲、窄金线与皮革护腰，不画飞鱼纹文字 **（原创扩展）** |
| `eq_yuansuweiqiejia` | 元宿卫怯薛甲 | 制式盔甲·元 | 天 | **（原创扩展）** | 元宿卫怯薛甲以精工铁札、深蓝衬里和窄鎏金边制成，供近侍宿卫披挂，收存时须逐片拭油。传闻此甲出自旧内府武库，来路显赫也最易招查。**（原创扩展）** | `grade=10; slot=body; armorWeight=heavy; catalogTian=true; divine=false; unique=true; price=null; lawProfile={uniform:true,allowedIdentityTags:[office_yuan_keshig],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=98` | 元代精工铁札与鎏金窄边、深蓝织物衬里，宿卫威仪不奇幻 **（原创扩展）** |
| `eq_qingyulinjia` | 清制御前侍卫甲 | 制式盔甲·清 | 天 | **（原创扩展）** | 清制御前侍卫甲以棉甲、铜钉和蓝黑甲片复合，窄明黄边只示御前规制。披挂讲究甲片平服、系带齐整；来历传为侍卫更替时遗失，冒穿必遭严查。**（原创扩展）** | `grade=10; slot=body; armorWeight=heavy; catalogTian=true; divine=false; unique=true; price=null; lawProfile={uniform:true,allowedIdentityTags:[sect_qinggong,office_qing_imperial_guard],violation:uniformImpersonation,wantedIntent:activate,normalGate:blocked}` | `def=98` | 清代御前棉甲，明黄仅作窄边，铜钉、蓝黑甲片，无人物与文字 **（原创扩展）** |
| `eq_pijia` | 皮甲 | 制式盔甲·皮札 | 玄下 | 通用；**（原创扩展）**；复用design/10既有皮甲基底，本轮补名录行；皮甲语汇据《周礼·冬官考工记·函人》 https://zh.wikisource.org/zh-hans/周禮/冬官考工記；具体兽材与越地制式（待考） | **（原创扩展）**复用既有皮甲基底，深褐皮札以革带联缀，短甲内铺麻丝衬里。肩护随整甲穿脱，日常须整理系带而不附赠官身；具体兽材与越地制式仍（待考），不宣称常用犀皮，也不按重甲重复加负重。 | `grade=4; slot=body; armorWeight=medium; defOutK=0.2; defInK=0.1` | `def=42` | 通用款，主色深褐；深褐皮札缀合短甲，革系带、麻丝衬里，肩护从属，不表现动物头爪；单件完整陈列，无人物无字无自发光；游戏分档与数值为原创扩展 **（原创扩展）** |

## 本文新增术语与 ID

- 本任务不新增术语或 ID；8 件制式盔甲均沿用既有登记。

## 数据校验规则与测试用例

- 制式盔甲须保留完整 `lawProfile`；属性投影的键、整数语法、品阶范围与 `def` 反投影按 `design/10` §4.10，且不得重复结算主防御。
- 机器校验：`python3 tools/lint/check_item_catalog.py docs/design/catalog/items-armor.md --min 8`；跨表 ID 再跑 `python3 tools/lint/check_ids.py --strict`。

## 待决事项 / 依赖

### 替下游给出的建议值

- 无新增；身份违法与城门阻断继续由 `design/11` / `design/12` 消费。

### 本文依赖的上游事实

- 轻中重甲系数、属性投影与官甲事件载荷引用 `design/10` §3.4.1、§4.10。

### 对基准的修改提案

- 无。

### 原著考据待办

- 无新增原著断言；八件均为历史制式语汇上的原创装备。

### 开放问题（附默认值）

- 无；默认保持既有轻重分类与 `lawProfile` 不变。
