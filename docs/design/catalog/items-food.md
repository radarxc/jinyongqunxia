# 物品图鉴 · 食材与食品（`items-food`）

> **归属（基准 §18）**：本表是 `design/10` §9 的批量出图投影；食材资源与生产仍归 `design/16`。
> **上游**：AR-20、`design/10` §8.2、§9.0–§9.4。
> **引用而不重定义**：烹饪熟练与 `gCook` 见 `design/12` §10.4；Buff 见 `design/06`。
> **标注约定**：无原著定本的菜式、数值与造型均 **（原创扩展）**；机器读取只接受下表七列。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_jingmi` | 精米 | 食材·谷物 | 黄 | **（原创扩展）** | `grade=3; ingredientKind=grain; materialGrade=3` | 乳白米粒盛小竹斗，少量谷壳，朴素市集尺度 **（原创扩展）** |
| `it_huotuijian` | 火腿尖 | 食材·肉 | 黄 | 《射雕英雄传》·火腿入馔；部位定级 **（原创扩展）** | `grade=3; ingredientKind=meat; materialGrade=3` | 小段风干火腿，棕红切面与麻绳，约前臂长 **（原创扩展）** |
| `it_xianyu` | 鲜鱼 | 食材·水产 | 黄 | 通用食材；定级 **（原创扩展）** | `grade=3; ingredientKind=fish; materialGrade=3` **（原创扩展）** | 银灰河鱼一尾置青竹叶，鳞光克制，尺许长 **（原创扩展）** |
| `it_cumian` | 粗面 | 食材·谷物 | 黄 | **（原创扩展）** | `grade=3; ingredientKind=grain; materialGrade=3` | 淡黄粗面粉盛矮陶钵，旁置小木勺与少量麦麸，约一餐份量 **（原创扩展）** |
| `it_xuelianzi` | 雪莲子 | 食材·珍材 | 玄 | **（原创扩展）** | `grade=6; ingredientKind=rare; materialGrade=6` | 象牙白莲子十余颗盛浅瓷盏，淡霜粉感，指节大小 **（原创扩展）** |
| `it_yuxueguo` | 玉雪果 | 食材·果 | 玄 | **（原创扩展）** | `grade=6; ingredientKind=fruit; materialGrade=6` | 青白梨形小果三枚，薄蜡皮、冰裂斑，不发光 **（原创扩展）** |
| `it_xianggu` | 山林香菇 | 食材·菜蔬 | 玄 | 山林食材通名；定级 **（原创扩展）** | `grade=6; ingredientKind=vegetable; materialGrade=6` | 褐伞香菇五朵置竹筛，菌褶清楚、根部带少量松针，掌心尺度 |
| `it_longganfengsui` | 龙肝凤髓料 | 食材·珍材 | 地 | 武侠宴席意象 **（原创扩展）** | `grade=9; ingredientKind=rare; materialGrade=9` | 两只封釉食盒分装深红肉脯与乳白髓脂，宫宴精致感 **（原创扩展）** |
| `it_binghuxueou` | 冰湖雪藕 | 食材·菜蔬 | 地 | **（原创扩展）** | `grade=9; ingredientKind=vegetable; materialGrade=9` | 白净莲藕两节带淡青切面，水珠与薄霜，前臂尺度 **（原创扩展）** |
| `it_xueshanlufu` | 雪山鹿脯 | 食材·肉 | 地 | **（原创扩展）** | `grade=9; ingredientKind=meat; materialGrade=9` | 深红鹿肉脯两条，盐霜细薄、青麻绳束，约半臂长 **（原创扩展）** |
| `it_tianshanlingmi` | 天山灵蜜 | 食材·珍材 | 天 | **（原创扩展）** | `grade=10; ingredientKind=rare; materialGrade=10; uniqueBatch=true` | 淡金蜂蜜盛白玉小罐，木蜡封口，细稠光泽无荧光 **（原创扩展）** |
| `it_baihualinglu` | 百花灵露 | 食材·珍材 | 天 | **（原创扩展）** | `grade=10; ingredientKind=rare; materialGrade=10; uniqueBatch=true` | 清透花露盛素银细颈壶，壶口凝一滴露珠，配低饱和百花小碟 **（原创扩展）** |
| `it_ganliang` | 行旅干粮 | 食品·干粮 | 黄 | **（原创扩展）** | `grade=3; staPct=12%; context=field` | 两块烤饼与油纸包，焦黄边、麻绳系，行囊尺度 **（原创扩展）** |
| `it_guisugao` | 桂酥糕 | 食品·点心 | 黄 | **（原创扩展）** | `grade=3; staPct=12%; buff=bf_yangsheng:2h` | 四块浅金方糕，桂花碎点，白瓷小盘，掌心大小 **（原创扩展）** |
| `it_niurougan` | 酱香牛肉干 | 食品·腌藏 | 玄 | **（原创扩展）** | `grade=6; staPct=17%; buff=bf_waigong_sheng:1battle` | 深褐肉条装牛皮纸包，麻绳束口，干润纤维清楚 **（原创扩展）** |
| `it_furonggao` | 芙蓉糕 | 食品·点心 | 玄 | 《书剑恩仇录》江南饮食意象；物品 **（原创扩展）** | `grade=6; staPct=17%; buff=bf_ningshen:1battle` | 粉白双层花形糕，浅青瓷盘，细腻蒸糕质感 **（原创扩展）** |
| `it_baihuagao` | 百花糕 | 食品·点心 | 地 | **（原创扩展）** | `grade=9; staPct=24%; meal=bf_huichun:2battle` | 淡紫圆糕点缀可食花瓣，银边食盒，精巧小份 **（原创扩展）** |
| `it_yuluwan` | 玉露丸子 | 食品·点心 | 地 | **（原创扩展）** | `grade=9; staPct=24%; meal=bf_huinei:2battle` | 乳白糯丸六枚置荷叶，透明露珠薄层，不像药丸 **（原创扩展）** |
| `it_xueyulengchan` | 雪域冷膳 | 食品·腌藏 | 天 | **（原创扩展）** | `grade=10; staPct=28%; meal=bf_yuhan,bf_jiangu:3battle; uniqueBatch=true` | 银白薄切冻肉配青玉冰盘，藏地香料细点，冷冽无魔法光 **（原创扩展）** |
| `it_tianxiangyulu` | 天香玉露羹 | 食品·汤羹 | 天 | **（原创扩展）** | `grade=10; staPct=28%; meal=bf_huichun,bf_huinei:3battle; uniqueBatch=true` | 羊脂玉碗盛半透明淡金羹，莲子与花瓣可辨，碗径一掌 **（原创扩展）** |
| `it_jiaohuaji` | 叫化鸡 | 食品·菜肴 | 玄 | 《射雕英雄传》·黄蓉款待洪七公 | `grade=5; meal=bf_jiangu:4battle; sta=full` **（原创扩展）** | 整鸡裹开裂黄泥与荷叶，金褐表皮，盘宽约双掌 |
| `it_jiangniurou` | 酱牛肉 | 食品·菜肴 | 黄 | 江湖酒馆意象 **（原创扩展定级）** | `grade=2; meal=bf_waigong_sheng:2battle` **（原创扩展）** | 深红褐薄片整齐码盘，青花粗瓷盘，油润克制 |
| `it_haoqiutang` | 好逑汤 | 食品·汤羹 | 地 | 《射雕英雄传》·黄蓉为洪七公所制 | `grade=7; meal=bf_ruiyi:3battle; party=4` **（原创扩展）** | 清汤、嫩笋、荷叶与嵌肉樱桃，白瓷汤盅，雅致小宴 |
| `it_yudishuijiatingluomei` | 玉笛谁家听落梅 | 食品·名菜 | 地 | 《射雕英雄传》·黄蓉五味肉条名菜 | `grade=8; meal=5buff:3battle; party=4` **（原创扩展）** | 五色肉条拼成梅花状，素白大盘，色泽低饱和、份量精致 |
| `it_labazhou` | 腊八粥 | 食品·汤羹 | 地 | 《侠客行》·侠客岛 | `grade=9; perm.mpMaxPct=2%; sxpGrant=0.35` **（原创扩展）** | 深褐药粥盛厚青石碗，谷粒草叶可辨，热气极淡 |
| `it_tianxiangyuyan` | 天香御宴 | 食品·名菜 | 天 | **（原创扩展）** | `grade=10; meal=select3buff:3battle; party=4; fixedNode=true` | 三只嵌套朱漆食盒展开成小宴，金边克制、无文字 **（原创扩展）** |
| `it_yushan` | 御膳 | 食品·名菜 | 地 | 《鹿鼎记》·御膳房语境；菜品 **（原创扩展）** | `grade=8; meal=select3buff:3battle; party=4` | 龙纹不用文字的黄釉盖碗与三小碟，清代宫膳时代感 **（原创扩展）** |
| `it_ershisiqiaomingyueye` | 二十四桥明月夜 | 食品·名菜 | 地 | 《射雕英雄传》·黄蓉为洪七公所制 | `grade=8; meal=bf_dingxin,bf_shouyi,bf_huinei:3battle` **（原创扩展）** | 二十四枚雪白豆腐球盛火腿槽中，青瓷长盘，精细而不夸张 |
