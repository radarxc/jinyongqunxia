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
| `it_zhurou` | 猪肉 | 食材·肉 | 黄 | 宋代民间常见且地位低于羊馔；清《调鼎集》满席重全猪、烧小猪 | `grade=2; ingredientKind=meat; materialGrade=2` | 一块粉红带白脂鲜猪肉置粗陶盘，约一斤，不带血污 **（原创扩展）** |
| `it_niurou` | 牛肉 | 食材·肉 | 玄 | 历代耕牛受保护，合法牛肉供应较少；具体法禁随书界核对 | `grade=4; ingredientKind=meat; materialGrade=4` | 一块暗红瘦牛肉带细脂纹置木案，约一斤，无熟食配菜 **（原创扩展）** |
| `it_yangrou` | 羊肉 | 食材·肉 | 黄 | 北宋尚羊，《东京梦华录》多见羊馔；辽、蒙古重羊，清代满洲烧煮亦重牛羊 | `grade=3; ingredientKind=meat; materialGrade=3` | 淡红羊腿肉一块连短骨，白脂薄层置木盘，约二斤 **（原创扩展）** |
| `it_jirou` | 鸡肉 | 食材·肉 | 黄 | 家禽通用；宋元明清均可得 | `grade=2; ingredientKind=meat; materialGrade=2` | 处理净的生鸡一只置竹叶，淡黄皮、双翼收拢，家常尺度 **（原创扩展）** |
| `it_yarou` | 鸭肉 | 食材·肉 | 黄 | 江南水乡家禽通用；《东京梦华录》列鸭馔 | `grade=2; ingredientKind=meat; materialGrade=2` | 处理净的生鸭一只置浅木盘，灰白皮与扁喙可辨 **（原创扩展）** |
| `it_erou` | 鹅肉 | 食材·肉 | 黄 | 家禽通用；宋代市食已有鹅馔记录 | `grade=3; ingredientKind=meat; materialGrade=3` | 处理净的生鹅半只置竹筛，乳白皮、厚胸肉，约三斤 **（原创扩展）** |
| `it_lvrou` | 驴肉 | 食材·肉 | 玄 | 北方驿路与民间肉食；具体书界供应 **（原创扩展）** | `grade=4; ingredientKind=meat; materialGrade=4` | 深红驴腱肉一块置灰陶盘，筋膜清楚，约一斤 **（原创扩展）** |
| `it_marou` | 马肉 | 食材·肉 | 玄 | 辽、蒙古及西北游牧语境可得，农耕城镇不作常规货 | `grade=5; ingredientKind=meat; materialGrade=5` | 深红马肉厚片三片叠放木盘，瘦而紧实，约一斤 **（原创扩展）** |
| `it_gourou` | 狗肉 | 食材·肉 | 黄 | 历代部分地域食用；投放依地方习俗，不作全域通货 | `grade=2; ingredientKind=meat; materialGrade=2` | 一块浅红带皮生肉置粗陶碟，约半斤，无动物头足 **（原创扩展）** |
| `it_turou` | 兔肉 | 食材·肉 | 黄 | 宋代市食有兔馔；农猎皆可得 | `grade=3; ingredientKind=meat; materialGrade=3` | 处理净的生兔腿两只置竹叶，淡粉肉色，尺内尺度 **（原创扩展）** |
| `it_gerou` | 鸽肉 | 食材·肉 | 玄 | 城镇饲养与猎获；宴饮用材 **（原创扩展）** | `grade=4; ingredientKind=meat; materialGrade=4` | 处理净的乳鸽一只置青瓷盘，淡粉皮肉，掌心稍大 **（原创扩展）** |
| `it_anchunrou` | 鹌鹑肉 | 食材·肉 | 玄 | 《东京梦华录》及宋代食单可见鹌鹑馔 | `grade=5; ingredientKind=meat; materialGrade=5` | 处理净的鹌鹑两只并置小陶盘，体形小巧、淡褐皮 **（原创扩展）** |
| `it_zhudu` | 猪肚 | 食材·肉 | 黄 | 市井杂碎食材；宋以后通用 **（原创扩展）** | `grade=3; ingredientKind=meat; materialGrade=3` | 洗净乳白猪肚一只盘成椭圆置陶盆，表面湿润，无熟食 **（原创扩展）** |
| `it_yangweizhi` | 羊尾脂 | 食材·肉 | 玄 | 北方与清代京师羊馔常用；《鹿鼎记》有炸羊尾场景 | `grade=5; ingredientKind=meat; materialGrade=5` | 乳白羊尾脂一块带淡粉边置锡盘，拳头尺度 **（原创扩展）** |
| `it_xianlurou` | 鲜鹿肉 | 食材·珍材 | 地 | 历代苑猎与山猎珍材；清代满洲烧煮兼用鹿肉 | `grade=7; ingredientKind=rare; materialGrade=7` | 深绛鹿里脊一段置木盘，细瘦无脂，约一斤 **（原创扩展）** |
| `it_xiongzhang` | 熊掌 | 食材·珍材 | 地 | 古代八珍意象；仅固定狩猎或贡膳节点，不进常规商店 | `grade=9; ingredientKind=rare; materialGrade=9` | 经初步处理的熊掌一只置铜盘，深褐厚皮与掌垫可辨，无血腥 **（原创扩展）** |
| `it_tuofeng` | 驼峰 | 食材·珍材 | 地 | 元《饮膳正要》所见蒙元珍馔语境；西北固定货源 | `grade=8; ingredientKind=rare; materialGrade=8` | 淡红驼峰肉一块带厚白脂置银盘，约双掌宽 **（原创扩展）** |
| `it_xingchun` | 猩唇 | 食材·珍材 | 地 | 古代八珍名目；实际物种与加工 **（待考）**，只作传闻贡品 | `grade=9; ingredientKind=rare; materialGrade=9` | 深褐风干肉脯一小片封在竹叶包中，指掌尺度 **（原创扩展）** |
| `it_baotai` | 豹胎 | 食材·珍材 | 地 | 古代珍馐名目；仅剧情禁猎货，具体食用史 **（待考）** | `grade=9; ingredientKind=rare; materialGrade=9` | 封蜡小陶罐盛一份暗红珍肉，罐口半开，不呈血腥 **（原创扩展）** |
| `it_shiyu` | 鲥鱼 | 食材·珍材 | 地 | 明清江鲜贡物，以初夏时令和易腐著称 | `grade=8; ingredientKind=rare; materialGrade=8` | 银白鲥鱼一尾完整置碎冰竹盘，细鳞清楚，尺半长 **（原创扩展）** |
| `it_hetun` | 河豚 | 食材·珍材 | 地 | 江海时鲜，食用风险高；仅名厨剧情配方，不提供现实处理方法 | `grade=8; ingredientKind=rare; materialGrade=8` | 灰青河豚一尾完整置湿竹叶，圆腹未鼓起，尺内尺度 **（原创扩展）** |
| `it_huajiao` | 花胶 | 食材·珍材 | 地 | 鱼鳔干制品；明清海味贸易语境，北宋书界不投放 **（原创扩展边界）** | `grade=7; ingredientKind=rare; materialGrade=7` | 琥珀色干鱼鳔三片置竹匣，半透明皱褶，掌长 **（原创扩展）** |
| `it_haishen` | 海参 | 食材·珍材 | 地 | 明清宴席海味渐盛；早期书界仅沿海稀有节点 | `grade=7; ingredientKind=rare; materialGrade=7` | 深褐干海参三只置白瓷盘，棘刺清楚，指掌尺度 **（原创扩展）** |
| `it_baoyu` | 鲍鱼 | 食材·珍材 | 地 | 历代海味，明清宴席尤重；内陆依商路稀缺 | `grade=8; ingredientKind=rare; materialGrade=8` | 带壳鲜鲍三只置海藻竹盘，灰绿壳与乳白肉可辨 **（原创扩展）** |
| `it_yanwo` | 燕窝 | 食材·珍材 | 天 | 明代成为珍贵贡膳，乾隆膳单大量使用；北宋至元末书界禁投 | `grade=10; ingredientKind=rare; materialGrade=10; uniqueBatch=true` | 象牙白盏形燕窝一盏置黑漆小匣，纤维细密，掌心尺度 **（原创扩展）** |
| `it_yuchi` | 鱼翅 | 食材·珍材 | 地 | 明清宴席海味盛行；北宋至元末书界禁投 | `grade=9; ingredientKind=rare; materialGrade=9` | 淡金干鱼翅一片置竹匣，扇形纤维可辨，约前臂长 **（原创扩展）** |
| `it_xueha` | 雪蛤 | 食材·珍材 | 地 | 清代东北山珍语境；仅鹿鼎以后辽东节点 **（待考）** | `grade=8; ingredientKind=rare; materialGrade=8` | 淡黄干雪蛤油小团盛白瓷盏，半透明颗粒，少量一份 **（原创扩展）** |
| `it_xiongbai` | 熊白 | 食材·珍材 | 地 | 古代所称熊脂珍品；名称与食法须核三联本及史料 **（待考）** | `grade=9; ingredientKind=rare; materialGrade=9` | 乳白熊脂一小块置青铜浅碟，蜡润质感，拳头尺度 **（原创扩展）** |
| `it_jiangxia` | 江虾 | 食材·水产 | 黄 | 江河捕捞通用 **（原创扩展定级）** | `grade=3; ingredientKind=fish; materialGrade=3` | 青灰鲜虾十余尾盛小竹篓，带水珠，一餐份量 **（原创扩展）** |
| `it_heli` | 河鲤 | 食材·水产 | 黄 | 黄河、汉水等内河常见鱼获 **（原创扩展定级）** | `grade=2; ingredientKind=fish; materialGrade=2` | 青金鲤鱼一尾置芦叶，鳞片完整，尺许长 **（原创扩展）** |
| `it_hanshui_qingyu` | 汉水青鱼 | 食材·水产 | 玄 | 《倚天屠龙记》汉水渔家场景；鱼种细节 **（待考）** | `grade=4; ingredientKind=fish; materialGrade=4` | 青黑河鱼一尾置旧渔网，长约尺半，鳍鳞完整 **（原创扩展）** |
| `it_taihu_yinyu` | 太湖银鱼 | 食材·水产 | 玄 | 太湖地域水产；古代食用记录与书界投放 **（待考）** | `grade=5; ingredientKind=fish; materialGrade=5` | 半透明细银鱼十余尾盛青瓷浅盘，指长尺度 **（原创扩展）** |
| `it_huxie` | 湖蟹 | 食材·水产 | 玄 | 江南湖泊时鲜；宋《山家清供》有蟹馔 | `grade=4; ingredientKind=fish; materialGrade=4` | 青壳湖蟹两只置蒲草小篓，完整生鲜，掌宽 **（原创扩展）** |
| `it_haiyu` | 海鱼 | 食材·水产 | 黄 | 东南沿海与海岛常见鱼获 **（原创扩展定级）** | `grade=3; ingredientKind=fish; materialGrade=3` | 银蓝海鱼一尾置海藻竹盘，梭形完整，尺许长 **（原创扩展）** |
| `it_haili` | 海蛎 | 食材·水产 | 黄 | 闽粤沿海贝类食材 **（原创扩展定级）** | `grade=3; ingredientKind=fish; materialGrade=3` | 粗灰海蛎六枚带壳置竹篓，湿润海味尺度 **（原创扩展）** |
| `it_huangyu` | 黄鱼 | 食材·水产 | 玄 | 东海时鲜；明清沿海贸易可得 **（原创扩展定级）** | `grade=5; ingredientKind=fish; materialGrade=5` | 金黄大黄鱼一尾置青竹叶，体形修长，尺半长 **（原创扩展）** |
| `it_jiangyaozhu` | 江瑶柱 | 食材·水产 | 地 | 宋代豪宴菜名有“鹿肚酿江瑶”；贝柱干货珍贵 | `grade=7; ingredientKind=fish; materialGrade=7` | 淡金干贝柱八枚盛小瓷盏，圆柱纤维清楚 **（原创扩展）** |
| `it_lianou` | 莲藕 | 食材·菜蔬 | 黄 | 江南水田时蔬；宋代食谱常见 | `grade=2; ingredientKind=vegetable; materialGrade=2` | 带泥莲藕两节置荷叶，切口乳白多孔，前臂长 **（原创扩展）** |
| `it_qingcai` | 青菜 | 食材·菜蔬 | 黄 | 泛指当季叶菜；各书界依地域替换具体品种 **（原创扩展）** | `grade=1; ingredientKind=vegetable; materialGrade=1` | 鲜绿叶菜一小把麻绳束根，带少量泥土，一餐份量 **（原创扩展）** |
| `it_baicai` | 白菜 | 食材·菜蔬 | 黄 | 北方耐藏菜蔬；《鹿鼎记》囚饭猪肉白菜场景 | `grade=2; ingredientKind=vegetable; materialGrade=2` | 青白大白菜一棵完整置竹席，叶脉清楚，尺许高 **（原创扩展）** |
| `it_jiucai` | 韭菜 | 食材·菜蔬 | 黄 | 古老栽培蔬菜，四时常见 | `grade=1; ingredientKind=vegetable; materialGrade=1` | 深绿韭菜一束置竹篮，细长叶齐整，一餐份量 **（原创扩展）** |
| `it_qincai` | 芹菜 | 食材·菜蔬 | 黄 | 古代食谱常见水芹、旱芹 | `grade=2; ingredientKind=vegetable; materialGrade=2` | 青绿芹菜一束带细根置陶盘，茎叶分明 **（原创扩展）** |
| `it_cong` | 葱 | 食材·菜蔬 | 黄 | 历代基础菜蔬与辛香料 | `grade=1; ingredientKind=vegetable; materialGrade=1` | 青白大葱三根并置竹板，根须完整，前臂长 **（原创扩展）** |
| `it_shengjiang` | 生姜 | 食材·菜蔬 | 黄 | 历代基础食材，亦用于咸酸与汤羹 | `grade=2; ingredientKind=vegetable; materialGrade=2` | 土黄色老姜三块置粗陶碟，节瘤与薄皮清楚 **（原创扩展）** |
| `it_luobo` | 萝卜 | 食材·菜蔬 | 黄 | 宋代市食与羹汤常见 | `grade=2; ingredientKind=vegetable; materialGrade=2` | 白萝卜两根带青叶置竹篮，表皮有浅泥痕 **（原创扩展）** |
| `it_qiezi` | 茄子 | 食材·菜蔬 | 黄 | 魏晋后已在中国栽培，宋元明清均可投放 | `grade=3; ingredientKind=vegetable; materialGrade=3` | 紫黑长茄三只置白瓷盘，表皮哑亮，掌长 **（原创扩展）** |
| `it_donggua` | 冬瓜 | 食材·菜蔬 | 黄 | 古代瓜蔬，宋代食用记录明确 | `grade=3; ingredientKind=vegetable; materialGrade=3` | 青绿冬瓜一截露白色瓜肉与籽，置木案，双掌宽 **（原创扩展）** |
| `it_chunsun` | 春笋 | 食材·菜蔬 | 玄 | 《山家清供》多用笋蔬，春季山林时鲜 | `grade=4; ingredientKind=vegetable; materialGrade=4` | 黄褐鲜笋三支带笋衣置竹筛，掌至前臂长 **（原创扩展）** |
| `it_juecai` | 蕨菜 | 食材·菜蔬 | 黄 | 山野菜；《山家清供》山海兜用笋蕨 | `grade=3; ingredientKind=vegetable; materialGrade=3` | 青绿卷头蕨菜一束置竹篮，嫩梗齐整 **（原创扩展）** |
| `it_muer` | 木耳 | 食材·菜蔬 | 玄 | 山林菌蔬，宋元食谱可见菌类 | `grade=4; ingredientKind=vegetable; materialGrade=4` | 黑褐木耳一小簇置竹筛，薄卷耳状，干湿适中 **（原创扩展）** |
| `it_doufu` | 豆腐 | 食材·菜蔬 | 黄 | 宋代已广泛进入市食与素斋 | `grade=3; ingredientKind=vegetable; materialGrade=3` | 雪白豆腐一方置青瓷浅盘，细嫩切面，约双掌宽 **（原创扩展）** |
| `it_lajiao` | 辣椒 | 食材·菜蔬 | 玄 | 美洲作物；万历《遵生八笺》始见记载，仅碧血及以后书界投放 | `grade=4; ingredientKind=vegetable; materialGrade=4` | 鲜红细辣椒五枚置白瓷碟，完整带蒂，指长 **（原创扩展）** |
| `it_fanshu` | 番薯 | 食材·菜蔬 | 黄 | 美洲作物；明末传入并推广，仅碧血及以后书界投放 | `grade=3; ingredientKind=vegetable; materialGrade=3` | 红褐番薯三块置竹篮，带少量泥土，拳头尺度 **（原创扩展）** |
| `it_yumi` | 玉米 | 食材·谷物 | 黄 | 美洲作物；嘉靖《平凉府志》已有记录，本作统一仅碧血及以后书界投放 | `grade=3; ingredientKind=grain; materialGrade=3` | 金黄玉米穗两支带半开青皮置竹篮，前臂长 **（原创扩展）** |
| `it_xiaomi` | 小米 | 食材·谷物 | 黄 | 北方传统粟粮，先秦至明清通用 | `grade=2; ingredientKind=grain; materialGrade=2` | 金黄小米盛小陶斗，圆细谷粒与少量谷壳可辨 **（原创扩展）** |
| `it_gaoliang` | 高粱 | 食材·谷物 | 黄 | 北方旱作谷物；明清食用与酿造常见 | `grade=3; ingredientKind=grain; materialGrade=3` | 红褐高粱粒盛竹斗，旁置一小穗，市集一升尺度 **（原创扩展）** |
| `it_qiaomai` | 荞麦 | 食材·谷物 | 黄 | 北方、西南山地传统杂粮 | `grade=2; ingredientKind=grain; materialGrade=2` | 灰褐三角荞麦粒盛木斗，少量浅壳，一餐份量 **（原创扩展）** |
| `it_dadou` | 大豆 | 食材·谷物 | 黄 | 中国古老豆类，豆酱、豆豉、豆腐原料 | `grade=3; ingredientKind=grain; materialGrade=3` | 淡黄大豆盛粗陶碗，圆粒饱满，约一升 **（原创扩展）** |
| `it_lvdou` | 绿豆 | 食材·谷物 | 黄 | 历代粥食与点心原料 | `grade=2; ingredientKind=grain; materialGrade=2` | 青绿小豆盛白瓷碗，颗粒干净，一餐份量 **（原创扩展）** |
| `it_chidou` | 赤豆 | 食材·谷物 | 黄 | 历代粥羹、馅料常用 | `grade=3; ingredientKind=grain; materialGrade=3` | 暗红赤豆盛竹斗，颗粒细小，约一升 **（原创扩展）** |
| `it_hongzao` | 红枣 | 食材·果 | 黄 | 北方传统果品与干果 | `grade=2; ingredientKind=fruit; materialGrade=2` | 深红鲜枣十余枚盛小竹篮，表皮自然皱亮 **（原创扩展）** |
| `it_li` | 梨 | 食材·果 | 黄 | 宋代市食、蜜煎与鲜果常见 | `grade=2; ingredientKind=fruit; materialGrade=2` | 青黄梨三枚置浅瓷盘，带叶一片，拳头尺度 **（原创扩展）** |
| `it_tao` | 桃 | 食材·果 | 黄 | 历代鲜果与糖霜果品原料 | `grade=3; ingredientKind=fruit; materialGrade=3` | 粉黄鲜桃三枚置竹盘，绒皮与浅缝清楚 **（原创扩展）** |
| `it_xing` | 杏 | 食材·果 | 黄 | 北方传统果品，可鲜食或晒干 | `grade=2; ingredientKind=fruit; materialGrade=2` | 橙黄杏六枚盛青瓷碟，圆润带淡红晕 **（原创扩展）** |
| `it_putao` | 葡萄 | 食材·果 | 玄 | 汉以后传入，西域与河西书界常见 | `grade=4; ingredientKind=fruit; materialGrade=4` | 紫青葡萄一串置白瓷盘，果粒半透明，双掌尺度 **（原创扩展）** |
| `it_shiliu` | 石榴 | 食材·果 | 玄 | 汉以后传入，西域及中原园圃可得 | `grade=4; ingredientKind=fruit; materialGrade=4` | 红黄石榴两枚，一枚剖开露红籽，置青瓷盘 **（原创扩展）** |
| `it_lizhi` | 荔枝 | 食材·果 | 玄 | 岭南时鲜，北运昂贵且易腐 | `grade=5; ingredientKind=fruit; materialGrade=5` | 红壳荔枝八枚带绿叶置竹篮，掌心一簇 **（原创扩展）** |
| `it_hutao` | 胡桃 | 食材·果 | 玄 | 汉以后西来坚果，西北与中原可得 | `grade=4; ingredientKind=fruit; materialGrade=4` | 褐壳胡桃六枚置小木碟，一枚裂壳露仁 **（原创扩展）** |
| `it_yan` | 盐 | 食材·调料 | 黄 | 历代基础调味与官营物资 | `grade=2; ingredientKind=spice; materialGrade=2` | 灰白粗盐盛小陶罐，木盖斜靠，约半斤 **（原创扩展）** |
| `it_jiangzhi` | 酱汁 | 食材·调料 | 黄 | 豆酱与酱汁传统久远；不等同现代瓶装酱油 | `grade=3; ingredientKind=spice; materialGrade=3` | 深褐酱汁盛矮黑陶罐，木勺一柄，家厨小份 **（原创扩展）** |
| `it_micu` | 米醋 | 食材·调料 | 黄 | 历代基础酸味调料 | `grade=2; ingredientKind=spice; materialGrade=2` | 琥珀色米醋盛小灰陶壶，布塞封口，约半斤 **（原创扩展）** |
| `it_huajiao_xiangliao` | 花椒香料 | 食材·调料 | 玄 | 中国本土辛香料，辣椒传入前重要辛味来源 | `grade=4; ingredientKind=spice; materialGrade=4` | 红褐花椒一小撮盛铜碟，开裂果壳与黑籽可辨 **（原创扩展）** |
| `it_shizhuyu` | 食茱萸 | 食材·调料 | 玄 | 古代辛味来源，辣椒普及后渐退 | `grade=5; ingredientKind=spice; materialGrade=5` | 暗红食茱萸果一小枝置白瓷碟，细粒成簇 **（原创扩展）** |
| `it_hujiao` | 胡椒 | 食材·调料 | 地 | 宋代依海贸输入且价贵，元明后供应增加 | `grade=7; ingredientKind=spice; materialGrade=7` | 黑胡椒粒盛小银盒，盒盖半掩，珍贵香料小份 **（原创扩展）** |
| `it_zhetang` | 蔗糖 | 食材·调料 | 玄 | 唐宋制糖渐精，明清点心与蜜饯广用 | `grade=4; ingredientKind=spice; materialGrade=4` | 淡褐砂糖结晶盛白瓷盏，木匙小巧，一碟份 **（原创扩展）** |
| `it_jiuzao` | 酒糟 | 食材·调料 | 黄 | 酿造副产物，用于糟藏与调味 | `grade=3; ingredientKind=spice; materialGrade=3` | 米白湿酒糟盛粗陶碗，颗粒松散，约一斤 **（原创扩展）** |
| `it_douchi` | 豆豉 | 食材·调料 | 玄 | 汉以后发酵豆调料，南北食谱皆见 | `grade=4; ingredientKind=spice; materialGrade=4` | 黑褐豆豉盛小陶罐，颗粒油润，木盖与麻布封口 **（原创扩展）** |
| `it_hubing` | 胡饼 | 食品·干粮 | 黄 | 唐宋市食延续，西北与中原行旅可得 | `grade=2; staPct=11%; meal=bf_wenzhong:1battle` **（原创扩展）** | 扁圆烤饼两张叠在油纸上，芝麻点与焦边清楚，掌宽 **（原创扩展）** |
| `it_zhengbing` | 蒸饼 | 食品·干粮 | 黄 | 《东京梦华录》所见汴京面食类型 | `grade=2; staPct=11%; meal=bf_yangsheng:1battle` **（原创扩展）** | 白面圆蒸饼三个置竹屉，表皮柔软无馅，一餐份量 **（原创扩展）** |
| `it_zhimashaobing` | 芝麻烧饼 | 食品·干粮 | 黄 | 宋元城市面食；具体配方 **（原创扩展）** | `grade=3; staPct=12%; meal=bf_jiangu:1battle` **（原创扩展）** | 金黄圆烧饼两枚置油纸，表面芝麻与炉斑可辨 **（原创扩展）** |
| `it_nangbing` | 馕饼 | 食品·干粮 | 黄 | 西域、回疆行旅主食；清代名目与形制 **（待考）** | `grade=3; staPct=12%; meal=bf_wenzhong:1battle` **（原创扩展）** | 宽圆薄馕一张折放粗布上，中央针纹无文字，焦黄厚边 **（原创扩展）** |
| `it_qingkezanba` | 青稞糌粑 | 食品·干粮 | 玄 | 藏地高原主食；明清书界商路可得 | `grade=4; staPct=14%; meal=bf_yuhan:1battle` **（原创扩展）** | 淡褐糌粑团两个置木碗，粗粒与酥油润泽，一餐份量 **（原创扩展）** |
| `it_naigan` | 奶干 | 食品·干粮 | 玄 | 蒙古与西北游牧乳食，便于行旅保存 | `grade=4; staPct=14%; meal=bf_jiangu:1battle` **（原创扩展）** | 象牙色硬奶块六片装小皮袋，干燥裂纹，掌心份量 **（原创扩展）** |
| `it_songhelou_xiaren` | 松鹤楼虾仁 | 食品·菜肴 | 玄 | 《天龙八部》·姑苏松鹤楼酒肉场景；具体虾仁菜名 **（待考）** | `grade=5; staPct=15.5%; meal=bf_yangsheng:1battle` **（原创扩展）** | 粉白虾仁与茭白丁清炒盛青瓷盘，江南酒楼二人份 **（原创扩展）** |
| `it_guokui` | 锅盔 | 食品·干粮 | 黄 | 关中、河西及西夏商旅节点投放；西夏地域投放与古代名称沿革 **（原创扩展）（待考）** | `grade=3; staPct=12%; meal=bf_wenzhong:1battle` **（原创扩展）** | 厚圆硬饼一块切开露层，黄褐炉斑，粗布包裹 **（原创扩展）** |
| `it_huiyanlou_huncai` | 回雁楼荤菜 | 食品·名菜 | 黄 | 《笑傲江湖》·衡阳回雁楼点牛肉、猪肉、鸡鸭、鱼虾等荤菜 | `grade=3; staPct=12%; meal=bf_qingxin:1battle; party=4` **（原创扩展）** | 牛猪肉片、鸡鸭块与鱼虾分盛四只粗瓷盘，酒楼四人份 **（原创扩展）** |
| `it_shaolin_sumian` | 少林素面 | 食品·菜肴 | 玄 | 《天龙八部》·虚竹在镇甸饭店点两碗素面；承接少林持斋 | `grade=4; staPct=14%; meal=bf_qingxin:1battle` **（原创扩展）** | 清汤素面盛灰白粗瓷碗，青菜与笋丝少许，一人份 **（原创扩展）** |
| `it_dingshenggao` | 定胜糕 | 食品·点心 | 玄 | 南宋江南点心传说；确切始见年代 **（待考）** | `grade=5; staPct=15.5%; meal=bf_juqi:1battle` **（原创扩展）** | 淡红元宝形米糕三枚置白瓷盘，无字无印，掌心大小 **（原创扩展）** |
| `it_guangmingding_suxian_yuanbing` | 光明顶素馅圆饼 | 食品·干粮 | 黄 | 《倚天屠龙记》·光明顶明教聚义，执事分食素馅圆饼 | `grade=3; staPct=12%; meal=bf_qingxin:1battle` **（原创扩展）** | 扁圆素馅饼两枚置粗布，切口露菜菇馅，无字无纹 **（原创扩展）** |
| `it_yuebing` | 月饼 | 食品·点心 | 玄 | 明清节令点心，宋代同名形制不据此反推 | `grade=4; staPct=14%; meal=bf_yangsheng:1battle` **（原创扩展）** | 棕金圆饼一枚切开露豆沙仁，木模花纹无字，掌宽 **（原创扩展）** |
| `it_hengshan_qingcaidoufu` | 恒山青菜豆腐 | 食品·菜肴 | 玄 | 《笑傲江湖》·令狐冲受困时每日食青菜豆腐，恒山持斋语境 | `grade=5; staPct=15.5%; meal=bf_shouyi:1battle` **（原创扩展）** | 清煮青菜豆腐盛灰白粗瓷碗，少油清淡，一人份 **（原创扩展）** |
| `it_meigui_subing` | 玫瑰酥饼 | 食品·点心 | 玄 | 清代京师与西北花馅点心语境 **（原创扩展）** | `grade=5; staPct=15.5%; meal=bf_qingxin:1battle` **（原创扩展）** | 金黄酥饼三枚，一枚剖开露暗红花馅，白瓷盘 **（原创扩展）** |
| `it_suyoubing` | 酥油饼 | 食品·点心 | 玄 | 藏地、蒙古与西北乳油面点语境 **（原创扩展）** | `grade=4; staPct=14%; meal=bf_yuhan:1battle` **（原创扩展）** | 淡金层酥小饼三枚置木盘，酥层与乳油光泽清楚 **（原创扩展）** |
| `it_jinyinmantou` | 金银馒头 | 食品·点心 | 地 | 清代宴席面点语境；《调鼎集》具体名目 **（待考）** | `grade=7; staPct=20%; meal=bf_juqi:2battle` **（原创扩展）** | 白色与金黄小馒头各三枚间列银盘，圆润一口大小 **（原创扩展）** |
| `it_xianrou` | 咸肉 | 食品·腌藏 | 黄 | 历代盐腌肉，冬季与行旅常备 | `grade=3; staPct=12%; meal=bf_wenzhong:1battle` **（原创扩展）** | 暗红咸肉条两块麻绳悬束，白盐霜细薄，半臂长 **（原创扩展）** |
| `it_larou` | 腊肉 | 食品·腌藏 | 玄 | 湖广、巴蜀及山地冬藏语境 **（原创扩展）** | `grade=4; staPct=14%; meal=bf_jiangu:1battle` **（原创扩展）** | 烟褐腊肉一条置竹板，脂肉分层、麻绳结，半臂长 **（原创扩展）** |
| `it_banya` | 板鸭 | 食品·腌藏 | 玄 | 江南与清代城市腌藏食品；地域投放 **（原创扩展）** | `grade=5; staPct=15.5%; meal=bf_wenzhong:1battle` **（原创扩展）** | 扁平风干整鸭一只置竹架，黄褐皮、形体完整 **（原创扩展）** |
| `it_zaoyu` | 糟鱼 | 食品·腌藏 | 玄 | 江南酒糟腌鱼，宋明清食籍均有糟藏传统 | `grade=4; staPct=14%; meal=bf_yangsheng:1battle` **（原创扩展）** | 米白酒糟覆着鱼段盛灰陶罐，鱼皮银灰可辨 **（原创扩展）** |
| `it_furu` | 腐乳 | 食品·腌藏 | 黄 | 发酵豆制品；明清食用记录较明确 | `grade=3; staPct=12%; meal=bf_yangsheng:1battle` **（原创扩展）** | 红褐腐乳六小方盛黑陶罐，汁液油润，家常小份 **（原创扩展）** |
| `it_sunzha` | 笋鲊 | 食品·腌藏 | 玄 | 宋《山家清供》山蔬腌藏语境；具体条目 **（待考）** | `grade=4; staPct=14%; meal=bf_qingxin:1battle` **（原创扩展）** | 淡黄笋片装小陶罐，姜丝与盐卤可辨，一罐份 **（原创扩展）** |
| `it_fenggan_yangrou` | 风干羊肉 | 食品·腌藏 | 玄 | 辽、蒙古与西北行旅肉食 | `grade=5; staPct=15.5%; meal=bf_yuhan:2battle` **（原创扩展）** | 深褐羊肉条三根麻绳束，干燥纤维清楚，油纸托底 **（原创扩展）** |
| `it_mizi_jinju` | 蜜渍金橘 | 食品·腌藏 | 玄 | 宋代蜜煎果品与城市食单可见 | `grade=4; staPct=14%; meal=bf_qingxin:1battle` **（原创扩展）** | 琥珀糖汁中金橘六枚盛白瓷盏，果形完整，小食份量 **（原创扩展）** |
| `it_tangshuangtaotiao` | 糖霜桃条 | 食品·腌藏 | 玄 | 《射雕英雄传》黄蓉所点宋代果品；据宋人食单化用 | `grade=5; staPct=15.5%; meal=bf_juqi:1battle` **（原创扩展）** | 粉金桃脯细条覆白糖霜，盛青瓷小碟，指长 **（原创扩展）** |
| `it_huayuan_gaobing` | 花园糕饼 | 食品·点心 | 玄 | 《越女剑》·范蠡命婢仆以糕饼点心款待阿青；具体品种 **（待考）** | `grade=4; staPct=14%; meal=bf_jiangu:2battle` **（原创扩展）** | 四枚浅米色圆糕置竹编小盘，表面朴素无纹，先秦宴客小份 **（原创扩展）** |
| `it_aqing_qingcha` | 阿青清茶 | 食品·汤羹 | 玄 | 《越女剑》·阿青在范蠡花园喝茶吃饼；茶种 **（待考）** | `grade=5; staPct=15.5%; meal=bf_ningshen:2battle` **（原创扩展）** | 清亮茶汤盛先秦黑陶小碗，旁置素陶茶壶，一人份 **（原创扩展）** |
| `it_muwu_gancaifan` | 木屋干菜饭 | 食品·菜肴 | 玄 | 《天龙八部》·众人在木屋以干菜佐白米饭 | `grade=4; staPct=14%; meal=bf_qingxin:2battle` **（原创扩展）** | 白米饭覆褐绿干菜盛粗陶碗，木屋旅食一人份 **（原创扩展）** |
| `it_liaoying_yangrou` | 辽营羊肉 | 食品·菜肴 | 地 | 《天龙八部》·萧峰辽地军旅宴饮，羊肉细节 **（待考）** | `grade=7; staPct=20%; meal=bf_shichen:2battle` **（原创扩展）** | 焦褐熟羊肋四根置大木盘，粗盐与刀痕可辨，四人份 **（原创扩展）** |
| `it_dali_qingming_chadian` | 大理清茗茶点 | 食品·点心 | 玄 | 《天龙八部》·大理王府奉清茗、点心场景；茶种与点心品种 **（待考）**，不称现代普洱茶餐 | `grade=5; staPct=15.5%; meal=bf_ningshen:1battle` **（原创扩展）** | 青白盖碗清茶配三枚素米糕置木托，宋代大理待客一人份 **（原创扩展）** |
| `it_qingshui_yufeng_mijiang` | 清水玉蜂蜜浆 | 食品·汤羹 | 玄 | 《神雕侠侣》·杨过以清水调玉蜂蜜浆喂小龙女、郭襄 | `grade=5; staPct=15.5%; meal=bf_huinei:2battle` **（原创扩展）** | 淡金蜜浆兑清水盛粗白瓷碗，清透微稠，一人份 **（原创扩展）** |
| `it_qingcai_doufu_xiaoyufan` | 青菜豆腐小鱼饭 | 食品·名菜 | 地 | 《神雕侠侣》·程英照料杨过，备青菜豆腐、鸡蛋小鱼与米饭 | `grade=7; staPct=20%; meal=bf_ruiyi:2battle; party=4` **（原创扩展）** | 青菜豆腐、煎蛋小鱼三碟配一碗米饭，竹筷陶器，二人份 **（原创扩展）** |
| `it_hanshui_siwan_fancai` | 汉水四碗饭菜 | 食品·名菜 | 玄 | 《倚天屠龙记》·汉水舟中鸡、肉、鱼、蔬四碗，周芷若喂张无忌 | `grade=5; staPct=15.5%; meal=bf_huichun:2battle; party=4` **（原创扩展）** | 鸡肉、熟肉、河鱼、青蔬四只粗陶碗围一饭碗，舟中小几尺度 **（原创扩展）** |
| `it_binghuodao_kaoxiongrou` | 冰火岛烤熊肉 | 食品·菜肴 | 玄 | 《倚天屠龙记》·张翠山、殷素素熊洞生火烤熊肉 | `grade=6; staPct=17%; meal=bf_yuhan:2battle` **（原创扩展）** | 焦褐熊肉厚片三块置平石板，粗盐少许，一人份 **（原创扩展）** |
| `it_fuzhou_yeji_huangtu` | 福州野鸡黄兔 | 食品·菜肴 | 玄 | 《笑傲江湖》·福州城外酒铺将野鸡、黄兔炒作下酒菜 | `grade=5; staPct=15.5%; meal=bf_ningshen:2battle` **（原创扩展）** | 炒野鸡块与黄兔肉分盛两只粗瓷盘，褐金油色，四人份 **（原创扩展）** |
| `it_hengshan_suxianzong` | 恒山素馅粽 | 食品·名菜 | 地 | 《笑傲江湖》·岳灵珊送令狐冲草菇、莲子、蚕豆等素馅粽 **（待考）** | `grade=7; staPct=20%; meal=bf_dingxin,bf_yangsheng:2battle; party=4` **（原创扩展）** | 剥开竹叶的素粽四只，糯米中露草菇莲子蚕豆，四人份 **（原创扩展）** |
| `it_xiakedao_siyang_dianxin` | 侠客岛四样点心 | 食品·名菜 | 玄 | 《侠客行》·侠客岛以烧卖、春卷、蒸糕等四碟点心待客 | `grade=4; staPct=14%; meal=bf_jiangu:2battle; party=4` **（原创扩展）** | 烧卖、春卷、蒸糕与一碟素点分置四只小瓷盘，四人份 **（原创扩展）** |
| `it_houjianji_shaobing` | 侯监集烧饼 | 食品·干粮 | 玄 | 《侠客行》·侯监集争玄铁令，石破天捡食烧饼 | `grade=5; staPct=15.5%; meal=bf_yuhan:2battle` **（原创扩展）** | 新焙圆烧饼一枚置油纸，焦黄鼓面、无夹藏物，掌宽 **（原创扩展）** |
| `it_huashan_qingcai_doufufan` | 华山青菜豆腐饭 | 食品·菜肴 | 黄 | 《碧血剑》·乱世途中板桌上有青菜豆腐、肥鸡与热饭菜 | `grade=3; staPct=12%; meal=bf_yangsheng:1battle` **（原创扩展）** | 青菜豆腐一碗配白饭与一只肥鸡盘，粗陶器，四人份 **（原创扩展）** |
| `it_wenjia_huotui_larouyan` | 温家火腿腊肉宴 | 食品·名菜 | 地 | 《碧血剑》·温家款客上火腿、腊肉、肥鸡、鲜鱼 | `grade=7; staPct=20%; meal=bf_bidu:2battle; party=4` **（原创扩展）** | 火腿腊肉、整鸡、鲜鱼分盛四只明代瓷盘，四人宴份 **（原创扩展）** |
| `it_zhayangwei` | 炸羊尾 | 食品·菜肴 | 玄 | 《鹿鼎记》·韦小宝京师点菜场景 | `grade=6; staPct=17%; meal=bf_yuhan:2battle` **（原创扩展）** | 金黄酥炸羊尾块六枚置白瓷盘，椒盐小碟从属，二人份 **（原创扩展）** |
| `it_milian_huotui` | 蜜莲火腿 | 食品·名菜 | 地 | 《鹿鼎记》·韦小宝以宣威火腿、蜜饯莲子款待沐剑屏 | `grade=8; staPct=22%; meal=bf_huichun,bf_juqi:3battle; party=4` **（原创扩展）** | 鲜红火腿薄片围蜜莲子码青花盘，清代宫膳四人份 **（原创扩展）** |
| `it_yangzhou_tangbao_changyumian` | 扬州汤包长鱼面 | 食品·名菜 | 地 | 《鹿鼎记》·韦小宝自称肚里装满扬州汤包、长鱼面；是否为当席实食 **（待考）** | `grade=7; staPct=20%; meal=bf_wenzhong,bf_juqi:2battle; party=4` **（原创扩展）** | 薄皮汤包四只与酱褐长鱼面一碗同置竹木托，清初扬州四人份 **（原创扩展）** |
| `it_pomiao_shutang` | 破庙鼠汤 | 食品·汤羹 | 黄 | 《连城诀》·宝象误食受污染鼠汤；危险情节，不作增益菜谱 | `grade=1; staPct=10%; meal=bf_xuruo:1battle` **（原创扩展）** | 灰陶破碗盛浑浊薄汤，一小块鼠肉轮廓，克制不血腥 **（原创扩展）** |
| `it_yuzhou_fanshu_caomifan` | 渔舟番薯糙米饭 | 食品·干粮 | 玄 | 《连城诀》·老渔人给狄云糙米饭，内混番薯、高粱 | `grade=4; staPct=14%; meal=bf_yuhan:2battle` **（原创扩展）** | 粗陶碗盛糙米、番薯块与高粱混饭，舟中一人份 **（原创扩展）** |
| `it_naiyou_recha` | 奶油热茶 | 食品·汤羹 | 玄 | 《白马啸西风》·计老人给李文秀奶油热茶 | `grade=4; staPct=14%; meal=bf_yuhan:2battle` **（原创扩展）** | 浅褐热茶盛木碗，表面浮薄层乳油，一人份 **（原创扩展）** |
| `it_yangrulao` | 羊乳酪 | 食品·腌藏 | 玄 | 《白马啸西风》·计老人以羊乳酒、乳酪、红茶待客 | `grade=5; staPct=15.5%; meal=bf_wenzhong:2battle` **（原创扩展）** | 象牙色乳酪三块置木盘，细孔与切痕可辨，一人份 **（原创扩展）** |
| `it_xiaofu_shoujiuxi` | 萧府寿酒席 | 食品·名菜 | 玄 | 《鸳鸯刀》·萧半和寿宴，宾客先饮寿酒再饮喜酒；菜品 **（待考）** | `grade=5; staPct=15.5%; meal=bf_juqi:2battle; party=4` **（原创扩展）** | 熟肉、鸡、鱼、蔬四盘围一只空酒盏，清代寿宴四人份 **（原创扩展）** |
| `it_huodui_kaozhangji` | 火堆烤獐麂 | 食品·菜肴 | 黄 | 《鸳鸯刀》·洞前群豪围火烤獐子、麂子 **（待考）** | `grade=3; staPct=12%; meal=bf_wenzhong:1battle` **（原创扩展）** | 焦褐獐肉与麂肉厚片置宽木盘，火烤痕清楚，四人份 **（原创扩展）** |
| `it_huibu_zhuafan_kaorou` | 回部抓饭烤肉 | 食品·名菜 | 地 | 《书剑恩仇录》·回部营地分食抓饭、烤肉、蜜瓜、葡萄干 | `grade=7; staPct=20%; meal=bf_shichen,bf_yuhan:2battle; party=4` **（原创扩展）** | 金黄抓饭与烤肉盛铜大盘，蜜瓜、葡萄干分置小碟，四人份 **（原创扩展）** |
| `it_xuedi_kaohuangyang` | 雪地烤黄羊 | 食品·名菜 | 地 | 《书剑恩仇录》·喀丝丽烤熟随身干黄羊与陈家洛分食 | `grade=8; staPct=22%; meal=bf_ruiyi,bf_juqi:3battle; party=4` **（原创扩展）** | 焦褐黄羊肉块置盐岩浅盘，雪地火烤痕，二人份 **（原创扩展）** |
| `it_honghuahui_zongduo_yanxi` | 红花会总舵宴席 | 食品·名菜 | 玄 | 《书剑恩仇录》·红花会总舵群雄宴饮场景；具体菜点与配料 **（待考）** | `grade=6; staPct=17%; meal=bf_juqi:2battle; party=4` **（原创扩展）** | 熟鸡、河鱼、酱肉与时蔬分盛四只清代粗瓷盘，总舵四人席份，无酒器 **（原创扩展）** |
| `it_chenglingsu_sancai_yitang` | 程灵素三菜一汤 | 食品·名菜 | 地 | 《飞狐外传》·程灵素备煎豆腐、笋炒豆芽、草菇白菜、咸菜豆瓣汤 | `grade=8; staPct=22%; meal=bf_bidu,bf_huichun:3battle; party=4` **（原创扩展）** | 三盘素菜与一碗豆瓣汤配白米饭，青瓷家常四人份 **（原创扩展）** |
| `it_miaojia_huofan_sancai` | 苗家镬饭三菜 | 食品·名菜 | 黄 | 《飞狐外传》·胡斐、程灵素煮一大镬饭并炒三盘菜请苗人凤 | `grade=3; staPct=12%; meal=bf_yangsheng:1battle; party=4` **（原创扩展）** | 大铁镬白饭配三盘家常炒菜，粗瓷碗筷，四人份 **（原创扩展）** |
| `it_humiao_mantou_jiyangtui` | 胡苗馒头鸡羊腿 | 食品·名菜 | 玄 | 《雪山飞狐》·胡一刀、苗人凤比武间同食馒头、鸡与羊腿 | `grade=5; staPct=15.5%; meal=bf_yuhan:2battle; party=4` **（原创扩展）** | 馒头、熟鸡与烤羊腿分置三只大盘，比武歇餐四人份 **（原创扩展）** |
| `it_dianchi_shurou_shaoji` | 滇池熟肉烧鸡 | 食品·名菜 | 玄 | 《雪山飞狐》·四人在酒店买熟肉、烧鸡、馒头后登船饮食 | `grade=4; staPct=14%; meal=bf_wenzhong:2battle; party=4` **（原创扩展）** | 深褐熟肉、整只烧鸡与馒头分盛粗瓷盘，舟宴四人份 **（原创扩展）** |
| `it_xieniangcheng` | 蟹酿橙 | 食品·名菜 | 地 | 宋《山家清供》载以蟹膏肉填黄熟橙蒸制 | `grade=7; staPct=20%; meal=bf_qingxin,bf_ningshen:2battle; party=4` **（原创扩展）** | 四只截顶黄橙盛蟹肉后复盖枝顶，置小蒸甑，四人份 **（原创扩展）** |
| `it_shanhaidou` | 山海兜 | 食品·名菜 | 地 | 宋《山家清供》：笋、蕨与鱼虾作馅的蒸兜 | `grade=7; staPct=20%; meal=bf_dongxi,bf_yangsheng:2battle; party=4` **（原创扩展）** | 半透明粉皮兜四只露笋蕨鱼虾馅，白瓷盘，四人份 **（原创扩展）** |
| `it_dongporou` | 东坡肉 | 食品·名菜 | 地 | 清《调鼎集》载做法；菜名源流更早，宋代定型 **（待考）** | `grade=8; staPct=22%; meal=bf_jiangu,bf_wenzhong:2battle; party=4` **（原创扩展）** | 酱红方肉四块皮朝上码青瓷盘，汁浓不腻，四人份 **（原创扩展）** |
| `it_shanyaozhou` | 山药粥 | 食品·汤羹 | 玄 | 元《饮膳正要》载山药粥 | `grade=5; staPct=15.5%; meal=bf_yangsheng:2battle` **（原创扩展）** | 乳白稠粥盛青瓷碗，山药丁与米粒可辨，一人份 **（原创扩展）** |
| `it_heliandouzi` | 荷莲兜子 | 食品·名菜 | 地 | 元《饮膳正要》所载多馅蒸兜 | `grade=8; staPct=22%; meal=bf_juqi,bf_huichun:2battle; party=4` **（原创扩展）** | 荷叶托四只蒸制粉皮兜，细碎多馅可辨，四人份 **（原创扩展）** |
| `it_tuanyutang` | 团鱼汤 | 食品·汤羹 | 地 | 元《饮膳正要》载羊肉汤底煮团鱼并配面丝 | `grade=7; staPct=20%; meal=bf_yuhan,bf_jiangu:2battle` **（原创扩展）** | 浓白团鱼汤盛鎏锡碗，肉块与细面丝可辨，一人份 **（原创扩展）** |
| `it_shanjia_sancui` | 山家三脆 | 食品·菜肴 | 玄 | 宋《山家清供》载嫩笋、小蕈、枸杞菜作羹或炒食 | `grade=6; staPct=17%; meal=bf_qingxin:2battle` **（原创扩展）** | 嫩笋丝、小菌与枸杞嫩叶清炒盛白瓷盘，二人份 **（原创扩展）** |
| `it_lubeiji` | 炉焙鸡 | 食品·菜肴 | 地 | 宋元《吴氏中馈录》载鸡先煮、切块，以醋酒反复烹焙 | `grade=7; staPct=20%; meal=bf_jiangu:2battle` **（原创扩展）** | 酱褐鸡块盛带盖铜镟，醋酒收汁，四人份 **（原创扩展）** |
| `it_wangtaishou_babaodoufu` | 王太守八宝豆腐 | 食品·名菜 | 地 | 清《随园食单》载嫩豆腐配蕈、蘑菇、松瓜仁、鸡与火腿屑 | `grade=8; staPct=22%; meal=bf_huixin,bf_ningshen:2battle; party=4` **（原创扩展）** | 雪白碎嫩豆腐羹盛青花大碗，菌菇仁屑与火腿丁可辨，四人份 **（原创扩展）** |
| `it_jiangshilang_doufu` | 蒋侍郎豆腐 | 食品·名菜 | 地 | 清《随园食单》“豆腐”门所载蒋侍郎豆腐；复原配料 **（待考）** | `grade=7; staPct=20%; meal=bf_qingxin,bf_dingxin:2battle; party=4` **（原创扩展）** | 金黄煨豆腐厚片盛青瓷深盘，汤汁清亮，四人份 **（原创扩展）** |
| `it_shaoxiaozhu` | 烧小猪 | 食品·名菜 | 地 | 清《随园食单》《调鼎集》均见烧小猪，满席重烧猪 | `grade=9; staPct=24%; meal=bf_shichen,bf_jiangu:3battle; party=4` **（原创扩展）** | 金红脆皮乳猪一只置银边大盘，完整宴席四人份 **（原创扩展）** |
| `it_yanwojisitang` | 燕窝鸡丝汤 | 食品·名菜 | 天 | 清《扬州画舫录》满汉席菜单；仅乾隆书界固定宴席 | `grade=10; staPct=28%; meal=bf_huichun,bf_huinei:3battle; party=4; uniqueBatch=true` **（原创扩展）** | 象牙白燕窝鸡丝清汤盛黄釉盖盅，纤丝分明，四人份 **（原创扩展）** |

## 史实与出处依据

- **先秦至汉唐**：粟、黍、稻、麦、大豆、韭、姜等为本土或早期已用作物；葡萄、石榴、胡桃等经汉以后交流进入。序章器皿只用朴素陶、铜、木，不套用宋明瓷器风格。
- **宋代羊肉风尚**：《东京梦华录》记录汴京市食，羊馔名目显著多于猪、牛；本表据此将羊肉设为北宋常见肉，猪肉仍可见但社会声望较低。牛为农耕役畜，牛肉不列普通低阶通货。
- **宋代城市与山林饮食**：《东京梦华录》《武林旧事》支撑饼食、蜜煎、禽兔与城市宴饮；林洪《山家清供》支撑笋、蕨、菌、豆腐及“山海兜”等清供。个别复原菜名未逐条核原文者已标 **（待考）**。
- **辽、蒙古与元代**：草原及塞北条目以羊、马、乳食、风干肉为主；元忽思慧《饮膳正要》兼收蒙汉食疗，明确涵盖汤、羹、面、粥、馒头、烧饼等，并作为山药粥、荷莲兜子等条目的史料锚点。
- **明代养生食籍**：《宋氏养生部》《遵生八笺》用于明代点心、禽蔬与清供语境；未完成古籍逐条校勘的具体菜名均标 **（待考）**，不冒充定本原文。
- **美洲作物硬边界**：玉米在嘉靖年间《平凉府志》已有记录；辣椒最早见万历年间高濂《遵生八笺》；番薯在明末传播。为避免把“始见”误作普及，本作统一将玉米、辣椒、番薯限定为仅碧血及以后书界投放，不进入笑傲、侠客及更早书界。
- **其他美洲作物**：马铃薯、花生、南瓜的路线与普及年代存在地域差异，本轮不建条目；若后续加入，默认仅明末以后且逐地域核实，不反投到天龙、射雕、神雕、倚天书界。
- **明清海味**：燕窝、鱼翅作为高级宴席材料在明清兴盛；故宫博物院资料显示乾隆初期膳单已频繁出现燕窝。本表硬禁燕窝、鱼翅进入北宋至元末书界，花胶、海参仅作明清或早期沿海稀有节点。
- **清代满汉宴饮**：《随园食单》概括满洲菜多烧煮、汉人菜多羹汤；《调鼎集》满席见全猪、烧小猪等；《扬州画舫录》所记满汉席含燕窝鸡丝汤、海参猪筋、鱼翅蟹羹等。这里据此强调猪羊烧煮与海味羹汤，不把后世“满汉全席”固定套餐倒投早期书界。
- **茶风尚**：唐宋以后城市茶肆、寺院清茶与江南茶食并行，元明清又与边地乳茶、酥油茶形成地域差异；《天龙八部》大理王府“清茗 + 点心”据原著场景合并为茶点，茶种未明故标 **（待考）**，不把现代“普洱茶餐”倒投北宋大理。
- **酒风尚**：宋代酒楼与行旅沽酒、辽蒙乳酒、明清烧酒各有地域层次；本表按 §9.3 将酒与 `bf_zuiyi` 独立，不新增纯酒条目，只在寿酒席等复合宴食的出处中保留酒事背景。
- **原著菜肴口径**：四道黄蓉菜、叫化鸡、腊八粥沿用既有确认条目；新增覆盖项须能落到原著明确食物或饮食组合，不再以地域、门派、食宿背景推导菜名。公开章节仅作定位旁证，未完成三联／广州修订版终校者保留 **（待考）**；效果与未明载的摆盘仍标 **（原创扩展）**。
- **酒类边界**：本表不新增酒条目；祖千秋论酒、玄冰碧火酒等继续按 `design/10` §8.3、§9.3 的 `bf_zuiyi` 独立口径处理。

### 参考链接（访问日期：2026-10-01）

- [南京农业大学：美洲作物是怎么传入中国的](https://news.njau.edu.cn/2020/1013/c106a109927/page.htm)：玉米、辣椒传入路线与早期文献。
- [光明日报：新大陆的礼物](https://epaper.gmw.cn/gmrb/html/2013-11/21/nw.D110000gmrb_20131121_1-11.htm)：明代美洲作物传播概述。
- [中国科学院自然科学史研究所：中国食谱提要](http://agri-history.ihns.ac.cn/books/foodlist.htm)：《饮膳正要》内容与蒙汉饮食性质。
- [光明网：探索中华古代饮食文明的足迹](https://wenyi.gmw.cn/2022-11/29/content_36185664.htm)：《山家清供》《饮膳正要》等食籍定位。
- [光明日报：蟹酿橙](https://epaper.gmw.cn/gmrb/html/2015-10/30/nw.D110000gmrb_20151030_2-16.htm)：《山家清供》具体菜名与做法。
- [古文岛：《饮膳正要》卷一](https://m.gushiwen.cn/guwen/bookv_a03020aef802.aspx)：荷莲兜子具体用料。
- [古文岛：《饮膳正要》卷二](https://m.gushiwen.cn/guwen/bookv_f8096365f2aa.aspx)：山药粥具体用料与做法。
- [北京旅游网：八宝豆腐冠谁名](https://www.visitbeijing.com.cn/article/47QmPnKW3uU)：《随园食单》王太守八宝豆腐条。
- [故宫博物院：清宫膳食结构的变化](https://www.dpm.org.cn/learing_detail/263897.html)：乾隆膳单中的燕窝。
- [光明网：清末京宴重烧猪](https://epaper.gmw.cn/wzb/html/2019-04/06/nw.D110000wzb_20190406_3-05.htm)：《随园食单》《调鼎集》所见满汉菜与烧猪。

## 本文新增术语与 ID

- AR-23 新增 146 个 `it_*`：食材 77、食品 69；逐项 ID 以七列表及 `design/10` §14.2 的“AR-23 食材／食品扩张（146）”为准。
- `uniqueBatch=true`：天级食材或食品的固定剧情批次投影；不允许普通厨房、商店刷新或随机采集量产。
- “原著场景菜肴”：原著明确出现可辨食物、菜点或饮食组合；未完成指定版本逐字终校者标 **（待考）**，游戏效果与未明载摆盘标 **（原创扩展）**。

## 数据校验规则与测试用例

| 检查 | 通过条件 |
|---|---|
| 七列与总量 | `check_item_catalog.py` 解析 130–180 行；每行 ID、名称、子类、品阶、出处、效果、外观均非空 |
| 字段 | 食材含 `ingredientKind/materialGrade`；新增食品含 `staPct/meal`；名菜含 `party=4`；新增天级含 `uniqueBatch=true` |
| 品阶 | `grade` 落在黄 1–3、玄 4–6、地 7–9、天 10；常见肉菜不得为天级 |
| Buff | 新增 `meal=` 只引用 `design/06` 已定义的 `bf_*`；酒类不进入本轮新增 |
| 年代 | 燕窝、鱼翅不进入北宋至元末；辣椒、玉米、番薯均仅碧血及以后书界投放 |
| 出图 | 每行只画一份原料或一份成品；原料与熟食不混画；无文字、发光、人物 |
| 书界覆盖 | 序章及十四书每部至少 2 项原著明确饮食；只有地域、门派或食宿背景的原创菜式不得计数 |

## 待决事项 / 依赖

### 替下游给出的建议值

- 食品 `staPct=10%×G(grade)`，grade 1–10 依次为 10%／11%／12%／14%／15.5%／17%／20%／22%／24%／28%；膳食持续取 1–3 场，均为 **（原创扩展）**。

### 本文依赖的上游事实

- 品阶、膳食与烹饪分别依赖 `design/10` §8.2.1、§9.0–§9.4；Buff 只引用 `design/06`；年代依赖 `design/02`。

### 对基准的修改提案

- 无。AR-23 只扩张 `design/10` 已有食材、食品与菜肴目录，不改变基准规则。

### 原著考据待办

- 按七列表与 `design/10` §9.3 的 **（待考）** 标记，逐部核对三联／广州修订版中的宴饮场景、明确菜名、食材及人物关系；未核准前不得去掉原创标记。
- 逐条复核《山家清供》《宋氏养生部》《遵生八笺》《随园食单》的具体菜名；当前仅史料类型可靠而条目未逐字确认者均已降为 **（待考）**。

### 开放问题（附默认值）

- 酒类是否纳入本表：默认否，继续由 `design/10` §9.3 独立计 `bf_zuiyi`。
- 天级是否保留 7 项：默认保留既有 5 项，并新增燕窝、燕窝鸡丝汤；全部只走天材或固定剧情批次。
