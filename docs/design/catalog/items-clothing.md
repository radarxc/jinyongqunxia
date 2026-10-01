# 物品图鉴 · 衣物（`items-clothing`）

> **归属（基准 §18）**：本表投影 `design/10` §3.4.1 的非制式外衣；制式盔甲和内甲分表。
> **上游**：AR-20、`design/10` §3.1、§3.4。
> **引用而不重定义**：时代服饰校验引用 `design/02`；身份与潜行归 `design/11` / `design/12`。
> **标注约定**：具体裁片、配色与效果无原著依据者均 **（原创扩展）**，不生成穿着人物。
> **AR-25 数值口径**：18 个矩阵条目的 `grade` 依次取地上 / 中 / 下 = 9 / 8 / 7、玄上 / 中 / 下 = 6 / 5 / 4、黄上 / 中 / 下 = 3 / 2 / 1；均为 `body` 轻衣，主防御按 `design/10` §4.1 的 `0.16 × G × DEF_LV` / `0.12 × G × DEF_LV` 自动生成，表中只列差异化固有效果。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_buyi` | 粗布短褐 | 衣物·便服 | 黄 | **（原创扩展）** | `grade=3; slot=body; armorWeight=light; eva=2xG` | 灰褐交领短褐折叠平置，粗麻纹、布结系带，宋元通用平民感 **（原创扩展）** |
| `eq_jinzhuang` | 江湖劲装 | 衣物·劲装 | 黄 | **（原创扩展）** | `grade=3; slot=body; armorWeight=light; agi=1` | 深蓝窄袖对襟劲装，无人物，布带与护腕并拢，利落低饱和 **（原创扩展）** |
| `eq_sengyi` | 素色僧衣 | 衣物·袍服 | 黄 | 佛门通用；装备 **（原创扩展）** | `grade=3; slot=body; armorWeight=light; resMindPp=2` | 灰黄交领僧衣整齐叠置，棉麻哑光，不画袈裟文字与人物 **（原创扩展）** |
| `eq_daopao` | 青布道袍 | 衣物·袍服 | 玄 | 道门通用；装备 **（原创扩展）** | `grade=6; slot=body; armorWeight=light; effRes=2xG` | 青灰宽袖道袍平展，黑边与布扣，无太极符号，宋元朴雅感 **（原创扩展）** |
| `eq_yexingyi` | 夜行衣 | 衣物·潜行服 | 玄 | 江湖通用；规则 **（原创扩展）** | `grade=6; slot=body; armorWeight=light; tags=night; eva=2xG` | 墨黑偏蓝窄袖衣裤折叠成套，哑光布、无蒙面人物 **（原创扩展）** |
| `eq_huangmagua` | 黄马褂 | 衣物·礼服 | 玄 | 《鹿鼎记》·御赐黄马褂 | `grade=6; slot=body; armorWeight=light; dialogue.gov=15` **（原创扩展）** | 清代明黄色短褂单件平展，盘扣、深蓝滚边，不画补子文字 **（原创扩展形制）** |
| `eq_taohuajinpao` | 桃花锦袍 | 衣物·礼服 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=light; cha=3; talk=2xG` | 月白锦袍带淡粉桃枝暗纹，丝绸薄光、宽袖，南宋雅致感 **（原创扩展）** |
| `eq_xiyuhufu` | 西域胡服 | 衣物·骑装 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=light; coldResPp=4; rideSta=-10%` | 靛青窄袖长衫、皮革窄腰封与软毡边，西域元代感 **（原创扩展）** |
| `eq_yunjinhechang` | 云锦鹤氅 | 衣物·氅服 | 地 | **（原创扩展）** | `grade=9; slot=body; armorWeight=light; wis=2; resMindPp=4` | 银灰云锦长氅叠置，鹤羽仅作抽象暗纹，无官服补子 **（原创扩展）** |
| `eq_tianchanbaoyi` | 天蚕宝衣 | 衣物·宝衣 | 天 | **（原创扩展）** | `grade=10; slot=body; armorWeight=light; catalogTian=true; divine=false; unique=true; price=null; defOutPct=8%` | 珠白丝织长衣，极细金丝经纬、柔软可折叠，珍贵但不发光 **（原创扩展）** |
| `eq_zixiaqingyi` | 紫霞轻衣 | 衣物·宝衣 | 天 | **（原创扩展）** | `grade=10; slot=body; armorWeight=light; catalogTian=true; divine=false; unique=true; price=null; eva=8; mpMaxPct=5%` | 低饱和紫灰长衣，云霞渐染只在织纹中，轻薄无魔法光 **（原创扩展）** |
| `eq_wucanyi` | 乌蚕衣 | 衣物·宝衣 | 天 | 《连城诀》·狄云所得护身宝衣 **（待考：核材质与取得措辞）** | `grade=10; slot=body; armorWeight=medium; divine=true; buff=bf_daoqiang` | 乌黑偏褐的柔韧短衣，蚕丝般细密哑光纹理，可折叠、无金属甲片 **（待考形制；原创扩展表现）** |
| `eq_jinzhizhisunpao_nan` | 金织质孙袍·男 | 衣物·礼服 | 地上 | 质孙服 · 元（《元史·舆服志》）· 出现书界 ch04 **（原创扩展）** | `grade=9; slot=body; armorWeight=light; wearer=male; cha=2` **（原创扩展）** | 男款大红织金右衽窄袖质孙袍单件平展，腰间密褶、膝下长摆、窄金锦缘，无字纹，元代贵族宴服尺度 |
| `eq_mingjinmamianqun_nv` | 明锦马面裙·女 | 衣物·礼服 | 地上 | 袄裙、马面裙 · 明（《大明会典》、定陵出土服饰）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=9; slot=body; armorWeight=light; wearer=female; cha=2` **（原创扩展）** | 女款大红妆花短袄与深青马面裙成套平展，汉式交领右衽，裙前后光面、两侧密褶，织金折枝花无字，明代贵族尺度 |
| `eq_songziluogongpao_nan` | 宋紫罗公袍·男 | 衣物·官服 | 地中 | 圆领公服 · 宋（《宋史·舆服志》）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=8; slot=body; armorWeight=light; wearer=male; cha=1` **（原创扩展）** | 男款紫罗圆领大袖公袍单件平展，下施横襕、两侧整齐展袖，丝罗细密，无补子无文字，宋代高阶官服尺度 |
| `eq_qingqizhuangjifu_nv` | 清绣旗装吉服·女 | 衣物·礼服 | 地中 | 旗装 · 清（《大清会典·冠服》）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=8; slot=body; armorWeight=light; wearer=female; cha=1` **（原创扩展）** | 女款石青暗花缎圆领右开大襟旗装吉服单件平展，平直袍身、单道窄镶边饰月白折枝花刺绣、两侧开裾，无大拉翅配件，清前中期贵族尺度 |
| `eq_liaodiaoqiupao_nan` | 辽貂裘窄袍·男 | 衣物·胡服 | 地下 | 契丹国服 · 辽（《辽史·仪卫志》）· 出现书界 ch01 **（原创扩展）** | `grade=7; slot=body; armorWeight=light; wearer=male; resColdPp=4` **（原创扩展）** | 男款契丹紫黑貂裘窄袖长袍单件平展，左衽、侧开衩、黑绿缘，毛皮厚实但不画甲片，辽代贵族冬服尺度 |
| `eq_mingzhijinbijia_nv` | 明织金比甲·女 | 衣物·礼服 | 地下 | 比甲 · 明（《明宪宗元宵行乐图》服饰研究）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=7; slot=body; armorWeight=light; wearer=female; talk=2` **（原创扩展）** | 女款方领对襟长比甲单件平展，无袖直身、两侧开衩，靛青织金折枝纹配暗红窄缘，无字，明代士绅女装尺度 |
| `eq_mingqingyesa_nan` | 明青曳撒·男 | 衣物·骑装 | 玄上 | 曳撒 · 明（《酌中志》、故宫明代宫廷服饰研究）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=6; slot=body; armorWeight=light; wearer=male; agi=1` **（原创扩展）** | 男款深青交领右衽曳撒单件平展，窄袖，前襟分裁、腰下两侧密褶与后襟整片，棉绸匀净，无飞鱼纹，明代骑射服尺度 |
| `eq_dalibaiduanqun_nv` | 大理白缎裙衣·女 | 衣物·礼服 | 玄上 | 大理国裙衣 · 大理（《张胜温画卷》服饰图像）· 出现书界 ch01 **（原创扩展）** | `grade=6; slot=body; armorWeight=light; wearer=female; resMindPp=3` **（原创扩展）** | 女款月白交领右衽窄袖衫与绛红百褶长裙成套平展，青绿团花窄边、银扣，宋代大理贵族尺度，不套用现代民族服装 |
| `eq_jinchunshuipanlingpao_nan` | 金春水盘领袍·男 | 衣物·袍服 | 玄中 | 春水盘领常服 · 金（《金史·舆服志》）· 出现书界 ch02/ch03 **（原创扩展）** | `grade=5; slot=body; armorWeight=light; wearer=male; effRes=3` **（原创扩展）** | 男款女真墨绿盘领窄袖袍单件平展，左衽暗合、膝下开衩，细布上仅有海东青与水草抽象暗纹，无文字，金代武人尺度 |
| `eq_songluobeizi_nv` | 宋罗褙子·女 | 衣物·袍服 | 玄中 | 褙子 · 宋（宋墓壁画、故宫《歌乐图》研究）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=5; slot=body; armorWeight=light; wearer=female; eva=2` **（原创扩展）** | 女款浅杏直领对襟长褙子单件平展，窄袖、腋下开衩、素罗薄透配褐色缘边，无系扣无字，宋代士庶女装尺度 |
| `eq_qinglanmagua_nan` | 清蓝缎马褂·男 | 衣物·便服 | 玄下 | 长袍马褂 · 清（《大清会典·冠服》及清宫服饰实物）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=4; slot=body; armorWeight=light; wearer=male; talk=1` **（原创扩展）** | 男款石青圆领对襟短马褂单件平展，平袖、五枚铜盘扣、暗花缎面，袍身至胯，无补子无文字，清前中期士绅尺度 |
| `eq_xixiazhaiheshan_nv` | 西夏窄褙衫·女 | 衣物·胡服 | 玄下 | 窄袖褙子 · 西夏（榆林窟第29窟女供养人像）· 出现书界 ch01 **（原创扩展）** | `grade=4; slot=body; armorWeight=light; wearer=female; effRes=2` **（原创扩展）** | 女款赭红交领右衽窄袖褙衫单件平展，短衫配低饱和百褶裙，黑色窄缘与布系带，无佛像纹，西夏城镇女装尺度 |
| `eq_songqingyuanlingpao_nan` | 宋青圆领袍·男 | 衣物·袍服 | 黄上 | 圆领袍 · 宋（《宋史·舆服志》）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=3; slot=body; armorWeight=light; wearer=male` **（原创扩展）** | 男款青色圆领大袖袍单件平展，右侧暗系、下施素横襕，普通细布、无纹无字，宋代低阶吏士尺度 |
| `eq_mingbuaoqun_nv` | 明布袄裙·女 | 衣物·便服 | 黄上 | 袄裙 · 明（明代人物画与服饰研究）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=3; slot=body; armorWeight=light; wearer=female` **（原创扩展）** | 女款藕灰交领右衽短袄与靛蓝素马面裙成套平展，窄袖、布纽、裙门平整两侧疏褶，棉布无纹，明代平民尺度 |
| `eq_huijiangjiapan_nan` | 回疆棉布袷袢·男 | 衣物·胡服 | 黄中 | 回疆长衣 · 清（《皇清职贡图》）· 出现书界 ch10/ch12 **（原创扩展）** | `grade=2; slot=body; armorWeight=light; wearer=male` **（原创扩展）** | 男款土褐长领齐袖棉布袷袢单件平展，对襟、膝下直摆、红布窄腰带收拢，轻磨损无字，清代回疆平民尺度 |
| `eq_qinghanvjiaao_nv` | 清汉女夹袄·女 | 衣物·便服 | 黄中 | 汉女袄裙 · 清（清代“男从女不从”服饰习俗、清宫图像）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=2; slot=body; armorWeight=light; wearer=female` **（原创扩展）** | 女款灰蓝交领右衽夹袄与黑色长裙成套折叠，宽袖收口、素棉布、布结系带，无旗装镶滚，清前中期汉族平民尺度 |
| `eq_zangdicuobu_nan` | 藏地粗氆氇袍·男 | 衣物·胡服 | 黄下 | 藏袍 · 吐蕃 / 藏地（宋清藏地服饰图像）· 出现书界 ch01/ch09 **（原创扩展）** | `grade=1; slot=body; armorWeight=light; wearer=male; resColdPp=1` **（原创扩展）** | 男款深褐粗氆氇宽袖藏袍单件平展，斜襟右衽、长袖厚重、右肩可翻折的裁片关系清楚，麻绳束腰，无纹，宋清藏地牧民尺度 |
| `eq_songmabuduanru_nv` | 宋麻布短襦·女 | 衣物·便服 | 黄下 | 短襦裙 · 宋（宋墓女俑与风俗图像）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=1; slot=body; armorWeight=light; wearer=female` **（原创扩展）** | 女款灰褐交领右衽短襦与黛青百褶裙成套折叠，窄袖、粗麻、布带，边角轻磨损无纹，宋代劳作女装尺度 |

## 年代与制式依据

- **宋（ch01/ch02/ch03）**：《宋史·舆服志》载公服的圆领大袖、横襕、革带、幞头、乌皮靴，也载士庶盛服与女子冠子、长裙；《东京梦华录》补充市井与仪仗中的幞头、宽衫、腰带。褙子采用宋墓壁画与南宋图像所见直领对襟形，汉式交领一律右衽。
- **辽 / 金（ch01/ch02/ch03）**：《辽史·仪卫志》明载国服左衽、窄袍及貂裘，并区分北班国制、南班汉制；《金史·舆服志》载带、巾、盘领衣、乌皮靴及春水秋山带饰。左衽只用于契丹、女真身份，不套给宋地汉人。
- **西夏 / 大理 / 藏地（ch01，藏地延至 ch09）**：西夏依据榆林窟第29窟与武威西夏墓供养人图像，采用圆领 / 交领窄袖、百褶裙与党项发式语汇；大理依据1180年《张胜温画卷》的宫廷、僧侣图像；藏袍为跨时代地域制式。具体色彩与裁片组合均 **（原创扩展）**。
- **元与蒙古（ch04，蒙古语汇亦见 ch02/ch03）**：《元史·舆服志》明释质孙为内廷大宴“一色服”，并列冬夏材质与配冠；罟罟冠依据元代实物和墓葬壁画的高筒骨架。汉式交领与元代制度服均校为右衽，蒙古地域服饰的襟向须逐件依同期图像，不以族属一概判作左衽。
- **明（ch05/ch06/ch07）**：《大明会典·舆服》用于官服、玉 / 犀 / 金 / 乌角带与皂靴等级；故宫明代宫廷服饰研究与定陵实物用于曳撒、比甲、袄裙、马面裙、网巾。飞鱼服只限具合法官差身份，本批不把飞鱼纹泛化给江湖衣物。
- **清（ch08–ch14）**：《大清会典·冠服》用于暖帽、凉帽、朝服与等级材料；《皇清职贡图》用于回疆长领衣、皮帽、绣边长衣；清宫藏品用于马褂、旗装、羽缎、荷包与旗鞋。仅采用清前中期轮廓，排除晚清大拉翅。
- **通用校核**：沈从文《中国古代服饰研究》以文献、出土物与传世图像互证的朝代序列作总校；图像制作继续服从 `tech/07` §2.7 与 `assets/default/prompts/item.md` §8.2–§8.3，不用人体撑衣，不以发光代替品阶。
- **考据边界**：史料未直接给出的具体色彩、裁片组合与阶层搭配一律按 **（原创扩展）** 处理，不冒充文献原句或原著逐字服装描写；清乾隆旗鞋的流行范围另在鞋表显式标 **（待考）**。

## 本文新增术语与 ID

- 新增 AR-25 衣物 ID 共 18 个，统一登记见 `design/10` §14；`wearer=male|female` 为本批款式维度，运行时语义仍待 `design/03` / 技术契约接收。

## 数据校验规则与测试用例

- 每个品阶格须恰有男、女各一行；品阶与 `grade` 必须按地 9/8/7、玄 6/5/4、黄 3/2/1 映射，且 `slot=body; armorWeight=light`。
- 机器校验：`python3 tools/lint/check_item_catalog.py docs/design/catalog/items-clothing.md --min 30`；跨表 ID 再跑 `python3 tools/lint/check_ids.py --strict`。

## 待决事项 / 依赖

### 替下游给出的建议值

- 资产生成逐行读取外观列；男女款不得复用同一成图，汉式交领须保持右衽。

### 本文依赖的上游事实

- 品阶、轻衣主属性与书界年代分别引用 `design/10` §3–§4、`design/02`；不在本表重定义。

### 对基准的修改提案

- 建议基准补充 `wearer` 可选枚举及“穿戴限制 / 款式标签”语义；当前默认作为款式与穿戴性别限制。

### 原著考据待办

- 无新增原著断言；旧条目 `eq_wucanyi` 的材质、取得措辞与形制待考保持不变。

### 开放问题（附默认值）

- 天级是否扩为同样矩阵：默认不扩，保留既有天级条目。
