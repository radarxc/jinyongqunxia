# 物品图鉴 · 鞋（`items-shoes`）

> **归属（基准 §18）**：本表投影 `design/10` §3.1 的 `feet` 装备。
> **上游**：AR-20、`design/10` §3.1、§4.1。
> **引用而不重定义**：轻功属性与门禁见 `design/03` / `design/08`；鞋只提供装备来源值。
> **标注约定**：除踏云履既有名器外，具体条目与全部造型均 **（原创扩展）**。
> **AR-25 数值口径**：18 个矩阵条目的 `grade` 依次取 9 / 8 / 7、6 / 5 / 4、3 / 2 / 1；鞋的固定轻功严格按 `design/10` §3.1、§4.1 的 `qinggong = 2.5 × grade`，故九档依次为 22.5 / 20 / 17.5 / 15 / 12.5 / 10 / 7.5 / 5 / 2.5。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_caoxie` | 麻编草鞋 | 鞋·草鞋 | 黄 | **（原创扩展）** | `grade=3; slot=feet; qinggong=7.5; defOutK=0.05` | 一双黄麻草鞋，粗绳鞋带、轻微磨损，成年脚掌尺度 **（原创扩展）** |
| `eq_bukuaixue` | 捕快快靴 | 鞋·布靴 | 黄 | **（原创扩展）** | `grade=3; slot=feet; qinggong=7.5; mov=0` | 一双黑布短靴，软底、灰布滚边，无官府文字 **（原创扩展）** |
| `eq_qingyunlv` | 青云履 | 鞋·布履 | 玄 | **（原创扩展）** | `grade=6; slot=feet; qinggong=15; eva=3` | 青灰软底云头履，白布中底、细绦，无夸张翘头 **（原创扩展）** |
| `eq_feiyuxue` | 飞羽靴 | 鞋·轻靴 | 玄 | **（原创扩展）** | `grade=6; slot=feet; qinggong=15; staPct=3%` | 深褐薄皮短靴，侧面羽纹压花、轻软窄底 **（原创扩展）** |
| `eq_tayunlv` | 踏云履 | 鞋·名履 | 地 | **（原创扩展）** | `grade=9; slot=feet; qinggong=22.5; climbSta=-20%; unique=true` | 月白软履配灰蓝云纹织边，薄底、完整一双，精工不发光 **（原创扩展）** |
| `eq_xuexingxue` | 雪行靴 | 鞋·裘靴 | 地 | **（原创扩展）** | `grade=9; slot=feet; qinggong=22.5; resColdPp=6` | 灰白皮裘长靴，宽软底与毛毡内衬，塞北雪地感 **（原创扩展）** |
| `eq_wuyinglv` | 无影履 | 鞋·宝履 | 天 | **（原创扩展）** | `grade=10; slot=feet; qinggong=25; catalogTian=true; divine=false; unique=true; price=null; eva=6` | 墨青缎面软履，银灰窄边、极薄鞋底，低调无魔法痕迹 **（原创扩展）** |
| `eq_tianmalv` | 天马履 | 鞋·宝履 | 天 | **（原创扩展）** | `grade=10; slot=feet; qinggong=25; catalogTian=true; divine=false; unique=true; price=null; jump=1` | 珠白轻皮靴，浅金马鬃纹压花，无翅膀造型，修长轻巧 **（原创扩展）** |
| `eq_qingxuanduanchaoxue_nan` | 清玄缎朝靴·男 | 鞋·朝靴 | 地上 | 朝靴 · 清（《大清会典·冠服》、清宫服饰实物）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=9; slot=feet; wearer=male; qinggong=22.5` **（原创扩展）** | 男款玄青缎朝靴一双并置，方圆厚底、高靿、黑缎面与细白中底，暗云纹无字，成年足长、清前中期贵族尺度 |
| `eq_mingzhijinxiuhuagongxie_nv` | 明织金绣花弓鞋·女 | 鞋·弓鞋 | 地上 | 弓样鞋 · 明（《明史·舆服志》、定陵出土女鞋）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=9; slot=feet; wearer=female; qinggong=22.5` **（原创扩展）** | 女款绛红织金弓鞋一双并置，窄小翘头、低跟、云花暗纹与丝缎包边，按明代实物比例表现，不画脚、不作情色化陈列 |
| `eq_yuanchijinpiqixue_nan` | 元赤金皮骑靴·男 | 鞋·骑靴 | 地中 | 蒙古皮靴 · 元（《元史·舆服志》、蒙元服饰图像）· 出现书界 ch04 **（原创扩展）** | `grade=8; slot=feet; wearer=male; qinggong=20` **（原创扩展）** | 男款绛红软皮骑靴一双并置，圆翘鞋头、高靿、侧缝与鎏金窄包边，皮底耐磨无字，成年足长、元代贵族骑乘尺度 |
| `eq_qingjinxiuhuapendixie_nv` | 清锦绣花盆底鞋·女 | 鞋·旗鞋 | 地中 | 花盆底旗鞋 · 清中期（故宫清代女鞋研究；存世同类多为晚清）· 出现书界 ch12/ch13/ch14 **（待考：核乾隆期流行范围）** **（原创扩展）** | `grade=8; slot=feet; wearer=female; qinggong=20` **（原创扩展）** | 女款月白锦缎花盆底鞋一双并置，宽圆鞋头、鞋底中央低矮倒梯形木台、蓝绦包边与折枝菊纹，无字，成年天足尺度，不夸大晚清高底 |
| `eq_liaowupiqixue_nan` | 辽乌皮骑靴·男 | 鞋·骑靴 | 地下 | 契丹国服靴 · 辽（《辽史·仪卫志》）· 出现书界 ch01 **（原创扩展）** | `grade=7; slot=feet; wearer=male; qinggong=17.5` **（原创扩展）** | 男款乌黑细皮骑靴一双并置，微翘圆头、高靿、内侧系带与厚皮底，靴口黑绿窄缘无字，成年足长、辽代贵族骑乘尺度 |
| `eq_songjinxiuyuntoulv_nv` | 宋金绣云头履·女 | 鞋·云头履 | 地下 | 女履 · 宋（南宋墓葬服饰实物、宋代女俑）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=7; slot=feet; wearer=female; qinggong=17.5` **（原创扩展）** | 女款月白罗面云头履一双并置，鞋尖含蓄上翘、薄底、金线折枝花与绛色包边，成年足长、不极端缩小，宋代贵族尺度 |
| `eq_mingzaopixue_nan` | 明皂皮靴·男 | 鞋·皂靴 | 玄上 | 官服皂靴 · 明（《大明会典·舆服》）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=6; slot=feet; wearer=male; qinggong=15` **（原创扩展）** | 男款皂黑皮靴一双并置，方圆鞋头、高靿、厚白中底与细密纳线，素面无官阶字样，成年足长、明代官绅尺度 |
| `eq_dalijingxiulv_nv` | 大理锦绣履·女 | 鞋·绣履 | 玄上 | 大理国女履 · 大理（《张胜温画卷》服饰图像）· 出现书界 ch01 **（原创扩展）** | `grade=6; slot=feet; wearer=female; qinggong=15` **（原创扩展）** | 女款青绿锦面软履一双并置，圆翘鞋头、薄皮底、银线莲瓣与绛红窄边，无文字，成年足长、宋代大理贵族尺度 |
| `eq_zangdihougechangxue_nan` | 藏地厚革长靴·男 | 鞋·藏靴 | 玄中 | 藏靴 · 吐蕃 / 藏地（宋清藏地服饰图像）· 出现书界 ch01/ch09 **（原创扩展）** | `grade=5; slot=feet; wearer=male; qinggong=12.5; resColdPp=2` **（原创扩展）** | 男款深褐厚革藏靴一双并置，宽圆头、高靿、红蓝氆氇靴口与多层牛皮底，粗线缝合无字，成年足长、雪地行走尺度 |
| `eq_yuanhongzhanxue_nv` | 元红毡靴·女 | 鞋·毡靴 | 玄中 | 蒙古毡靴 · 元（蒙元墓葬壁画与服饰图像）· 出现书界 ch04 **（原创扩展）** | `grade=5; slot=feet; wearer=female; qinggong=12.5; resColdPp=2` **（原创扩展）** | 女款暗红羊毛毡靴一双并置，微翘圆头、中高靿、蓝黑几何窄绣边与软皮底，无字，成年足长、元代蒙古女装尺度 |
| `eq_qingqingduanxingxue_nan` | 清青缎行靴·男 | 鞋·行靴 | 玄下 | 行服靴 · 清（《大清会典·冠服》、清代行服图像）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=4; slot=feet; wearer=male; qinggong=10` **（原创扩展）** | 男款深蓝细缎行靴一双并置，圆头、中靿、黑皮包头与软厚底，靴口窄滚边无字，成年足长、清前中期骑射行服尺度 |
| `eq_huijiangxiubianpixue_nv` | 回疆绣边皮靴·女 | 鞋·皮靴 | 玄下 | 回部女靴 · 清（《皇清职贡图》）· 出现书界 ch10/ch12 **（原创扩展）** | `grade=4; slot=feet; wearer=female; qinggong=10` **（原创扩展）** | 女款枣红软皮靴一双并置，圆翘鞋头、中靿、蓝绿几何绣边与薄皮底，无字，成年足长、清代回疆城镇女装尺度 |
| `eq_jinwupixue_nan` | 金乌皮靴·男 | 鞋·皮靴 | 黄上 | 乌皮靴 · 金（《金史·舆服志》）· 出现书界 ch02/ch03 **（原创扩展）** | `grade=3; slot=feet; wearer=male; qinggong=7.5` **（原创扩展）** | 男款乌黑皮靴一双并置，圆头、高靿、单层皮底与侧缝，皮面匀净略旧无纹，成年足长、金代常服尺度 |
| `eq_xixiayuanlvgongxie_nv` | 西夏缘履弓鞋·女 | 鞋·弓鞋 | 黄上 | 弓履 · 西夏（榆林窟第29窟女供养人像）· 出现书界 ch01 **（原创扩展）** | `grade=3; slot=feet; wearer=female; qinggong=7.5` **（原创扩展）** | 女款赭红细布弓履一双并置，小幅翘头、薄底、青黑缘边与简素折枝绣，无珠宝无字，成年足长、不作情色化，西夏城镇尺度 |
| `eq_mengguyangmaozhanxue_nan` | 蒙古羊毛毡靴·男 | 鞋·毡靴 | 黄中 | 蒙古毡靴 · 南宋 / 元（蒙元服饰图像）· 出现书界 ch02/ch03/ch04 **（原创扩展）** | `grade=2; slot=feet; wearer=male; qinggong=5; resColdPp=1` **（原创扩展）** | 男款灰白羊毛毡靴一双并置，宽圆微翘头、中高靿、褐皮包底与粗线缝口，无纹无字，成年足长、蒙古牧民尺度 |
| `eq_songqingbuyuantoulv_nv` | 宋青布圆头履·女 | 鞋·布履 | 黄中 | 女子布履 · 宋（宋墓服饰与女俑）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=2; slot=feet; wearer=female; qinggong=5` **（原创扩展）** | 女款青灰麻布圆头履一双并置，圆头、低鞋墙、白麻纳底与素色包边，无绣纹，成年足长、宋代平民尺度 |
| `eq_songmabuxie_nan` | 宋麻布鞋·男 | 鞋·麻鞋 | 黄下 | 麻鞋 · 宋（《宋史·舆服志》士庶服、宋代风俗图像）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=1; slot=feet; wearer=male; qinggong=2.5` **（原创扩展）** | 男款灰褐麻布鞋一双并置，宽圆头、千层麻底、粗线纳缝与轻磨损，无纹无字，成年足长、宋代庶民尺度 |
| `eq_mingmianbuhualv_nv` | 明棉布花履·女 | 鞋·布履 | 黄下 | 民间女履 · 明（明墓出土鞋与风俗图像）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=1; slot=feet; wearer=female; qinggong=2.5` **（原创扩展）** | 女款靛蓝棉布履一双并置，圆翘鞋头、平薄千层底、白线小折枝花与补缀，成年足长、不束足夸张，明代平民尺度 |

## 本文新增术语与 ID

- 新增 AR-25 鞋 ID 共 18 个，统一登记见 `design/10` §14。

## 数据校验规则与测试用例

- 18 格均须 `slot=feet`、成双并置；`qinggong` 必须等于 `2.5 × grade`，九档不得受材质名称改写。
- 机器校验：`python3 tools/lint/check_item_catalog.py docs/design/catalog/items-shoes.md --min 26`；跨表 ID 再跑严格检查。

## 待决事项 / 依赖

### 替下游给出的建议值

- 弓鞋、旗鞋只画器物，不画脚或人体，不作情色化、猎奇化或晚清夸张化处理。

### 本文依赖的上游事实

- 鞋主属性、轻功公式与书界年代分别引用 `design/10`、`design/02`。

### 对基准的修改提案

- 同衣物表：建议补充 `wearer` 可选枚举及消费语义。

### 原著考据待办

- `eq_qingjinxiuhuapendixie_nv`：核乾隆期花盆底流行范围；现存故宫直接示例为光绪，当前只作低矮形制参照。

### 开放问题（附默认值）

- 弓鞋与花盆底是否保留：默认按上述安全表现保留；天级矩阵默认不补。
