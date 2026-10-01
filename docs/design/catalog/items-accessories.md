# 物品图鉴 · 护肩、披风与头饰（`items-accessories`）

> **归属（基准 §18）**：本表投影 `design/10` `equip-slots.v2` 的 `shoulder`、`cape`、`head`。
> **上游**：AR-20、`design/10` §3.1–§4.1。
> **引用而不重定义**：属性形态见 `design/03`；披风对潜行或官甲暴露仅按条目接口交 `design/11`。
> **标注约定**：本表全部具体物品、数值和造型为 **（原创扩展）**。
> **AR-25 数值口径**：披风、头饰各自覆盖 18 格；`grade` 映射为 9 / 8 / 7、6 / 5 / 4、3 / 2 / 1。披风主属性严格取 `design/10` §3.1、§4.1 的 `defOutK=0.025; hpMaxK=0.005`，头饰主属性由 `slot=head` 自动生成，表中附加值均为固定固有效果。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_pijian` | 皮护肩 | 护肩·皮革 | 黄 | **（原创扩展）** | `grade=3; slot=shoulder; defOutK=0.025; hpMaxK=0.005` | 一对深褐硬皮护肩，麻线包边、铜扣，无尖刺 **（原创扩展）** |
| `eq_bumianpifeng` | 布面披风 | 披风·布 | 黄 | **（原创扩展）** | `grade=3; slot=cape; defOutK=0.025; hpMaxK=0.005` | 灰蓝短披风折叠平置，粗布哑光、木扣，及膝长度 **（原创扩展）** |
| `eq_qingjin` | 青布头巾 | 头饰·巾 | 黄 | **（原创扩展）** | `grade=3; slot=head; effRes=2` | 青灰长方头巾打成软结，无人物，棉麻纹理 **（原创扩展）** |
| `eq_linpijian` | 鳞片护肩 | 护肩·鳞甲 | 玄 | **（原创扩展）** | `grade=6; slot=shoulder; defOutK=0.025; resBleedPp=3` | 小铁鳞覆深蓝布底的一对护肩，片缘磨亮 **（原创扩展）** |
| `eq_wuyepifeng` | 乌夜披风 | 披风·潜行 | 玄 | **（原创扩展）** | `grade=6; slot=cape; nightExposure=-10%; eva=2` | 墨黑偏蓝连帽披风单件平置，哑光薄布、无人物 **（原创扩展）** |
| `eq_baiyuguan` | 白玉冠 | 头饰·冠 | 玄 | **（原创扩展）** | `grade=6; slot=head; cha=1; resMindPp=3` | 小型白玉束发冠、银簪横置，宋式简洁轮廓 **（原创扩展）** |
| `eq_xuantiepijian` | 玄铁披肩 | 护肩·金属 | 地 | **（原创扩展）** | `grade=9; slot=shoulder; defOutK=0.025; tough=4` | 乌铁双肩甲与短链相连，厚重圆弧、无夸张尖角 **（原创扩展）** |
| `eq_heyudachang` | 鹤羽大氅 | 披风·大氅 | 地 | **（原创扩展）** | `grade=9; slot=cape; resColdPp=6; wis=2` | 银灰大氅，羽纹织物与白绒窄边，宽大但不画真实羽翼 **（原创扩展）** |
| `eq_zijinfaguan` | 紫金发冠 | 头饰·冠 | 地 | **（原创扩展）** | `grade=9; slot=head; cha=2; effRes=5` | 暗紫金束发冠，细云纹、玉簪，明代精工感 **（原创扩展）** |
| `eq_longlinpijian` | 龙鳞护肩 | 护肩·宝肩 | 天 | **（原创扩展）** | `grade=10; slot=shoulder; catalogTian=true; divine=false; unique=true; price=null; defOutPct=5%; resCCPp=5` | 深青金属鳞片双肩甲，鎏金只作窄边，不画龙首 **（原创扩展）** |
| `eq_tianfengpifeng` | 天风披风 | 披风·宝披 | 天 | **（原创扩展）** | `grade=10; slot=cape; catalogTian=true; divine=false; unique=true; price=null; eva=6; mov=1` | 月白轻绢长披风，风纹暗织，完整铺展、轻盈无发光 **（原创扩展）** |
| `eq_qixingbaoguan` | 七星宝冠 | 头饰·宝冠 | 天 | **（原创扩展）** | `grade=10; slot=head; catalogTian=true; divine=false; unique=true; price=null; resMindPp=8; effRes=6` | 深蓝玉冠嵌七枚细小银钉，仅抽象星位、无星图魔法光 **（原创扩展）** |
| `eq_qingxuanhuyuduandoupeng_nan` | 清玄狐羽缎斗篷·男 | 披风·斗篷 | 地上 | 羽缎、玄狐缘 · 清（故宫清代羽毛纱研究、《大清会典·冠服》）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=9; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; resColdPp=6` **（原创扩展）** | 男款玄青羽缎斗篷单件完整铺展，立领、前开襟、玄狐窄缘与银扣，细密防风面料无字，清前中期贵族及踝尺度 |
| `eq_mingyunjinhechang_nv` | 明云锦鹤氅·女 | 披风·鹤氅 | 地上 | 鹤氅、云锦 · 明（明代人物画与织物实物）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=9; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; cha=2` **（原创扩展）** | 女款月白云锦鹤氅单件完整铺展，直领对襟、宽袖、黑缎滚边，抽象羽纹不画真羽翼，明代贵族宽长尺度 |
| `eq_yuanzhijinzhanshidoupeng_nan` | 元织金战士斗篷·男 | 披风·斗篷 | 地中 | 纳石失织金外披 · 元（《元史·舆服志》、蒙元服饰研究）· 出现书界 ch04 **（原创扩展）** | `grade=8; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; resColdPp=4` **（原创扩展）** | 男款深蓝织金斗篷单件完整铺展，圆领铜搭扣、阔肩及膝、貂毛窄缘，几何云纹无字，元代蒙古贵族骑行尺度 |
| `eq_qingdiaoqiufengchang_nv` | 清貂裘风氅·女 | 披风·风氅 | 地中 | 貂裘外氅 · 清（《大清会典·冠服》、清宫服饰实物）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=8; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; resColdPp=5` **（原创扩展）** | 女款绛红缎面貂裘风氅单件完整铺展，圆领、大襟右开、宽幅及踝，黑紫貂毛缘与盘扣，无补纹，清前中期贵族尺度 |
| `eq_liaoyinshupi_nan` | 辽银鼠披·男 | 披风·裘披 | 地下 | 银鼠裘 · 辽（《辽史·仪卫志》）· 出现书界 ch01 **（原创扩展）** | `grade=7; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; resColdPp=5` **（原创扩展）** | 男款银白鼠裘披单件完整铺展，黑绿绢里、左襟皮绳扣、阔肩及膝，毛向整齐无兽首，辽代契丹贵族尺度 |
| `eq_dalijinxiupeibo_nv` | 大理锦绣帔帛·女 | 披风·帔 | 地下 | 大理国礼佛帔饰 · 大理（《张胜温画卷》）· 出现书界 ch01 **（原创扩展）** | `grade=7; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; resMindPp=3` **（原创扩展）** | 女款青绿锦绣长帔单件舒展铺陈，双端加宽、中心搭肩段略厚，贴金只作窄线、莲瓣纹无字，大理国贵族礼仪尺度 |
| `eq_mingqingduandachang_nan` | 明青缎大氅·男 | 披风·大氅 | 玄上 | 大氅 · 明（明代人物画与服饰研究）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=6; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; effRes=3` **（原创扩展）** | 男款深青缎大氅单件完整铺展，直领对襟、宽袖及踝，黑色宽缘与一对系带，素面无补子，明代士绅宽长尺度 |
| `eq_qingyuduanpifeng_nv` | 清羽缎披风·女 | 披风·披风 | 玄上 | 羽缎外披 · 清（故宫清代西洋呢绒与羽毛纱研究）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=6; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; resColdPp=3` **（原创扩展）** | 女款品月色羽缎披风单件完整铺展，小立领、右开襟、石青滚边与布扣，细密哑光无花字，清前中期士绅及膝尺度 |
| `eq_jinhubianpifeng_nan` | 金狐边披风·男 | 披风·裘披 | 玄中 | 狐裘、盘领衣 · 金（《金史·舆服志》）· 出现书界 ch02/ch03 **（原创扩展）** | `grade=5; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; resColdPp=3` **（原创扩展）** | 男款墨绿粗绢披风单件完整铺展，盘领、左襟暗扣、灰狐窄边，直摆及膝无纹，金代女真武人尺度 |
| `eq_songluoshahechang_nv` | 宋罗纱鹤氅·女 | 披风·鹤氅 | 玄中 | 氅衣、褙子式外披 · 宋（宋代图像与故宫氅衣研究）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=5; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; eva=2` **（原创扩展）** | 女款灰白罗纱鹤氅单件完整铺展，直领对襟、宽袖、黛青窄缘，羽纹仅作浅暗织，无人物，宋代士女轻薄尺度 |
| `eq_yuanmengguzhanpi_nan` | 元蒙古毡披·男 | 披风·毡披 | 玄下 | 草原毡披 · 元（蒙元服饰图像）· 出现书界 ch02/ch03/ch04 **（原创扩展）** | `grade=4; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; resColdPp=2` **（原创扩展）** | 男款炭灰羊毛毡披单件完整铺展，圆领、左前襟皮扣、短袖口与及膝下摆，红褐窄边无字，蒙古骑手厚实尺度 |
| `eq_huijiangnihuaipi_nv` | 回疆呢花披·女 | 披风·呢披 | 玄下 | 绣边长衣外披 · 清（《皇清职贡图》）· 出现书界 ch10/ch12 **（原创扩展）** | `grade=4; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; resColdPp=2` **（原创扩展）** | 女款枣红羊毛呢披单件完整铺展，无袖直身、圆领对襟、蓝绿几何绣边无文字，及膝宽幅，清代回疆城镇女装尺度 |
| `eq_mingmianbupifeng_nan` | 明棉布披风·男 | 披风·布 | 黄上 | 民间披风 · 明（明代人物画）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=3; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005` **（原创扩展）** | 男款靛青棉布披风单件完整铺展，小圆领、前系带、两侧开衩、及膝直摆，针脚整齐无纹，明代行旅尺度 |
| `eq_mingshuitianpi_nv` | 明水田披·女 | 披风·水田披 | 黄上 | 水田衣式拼布外披 · 晚明（晚明服饰图像）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=3; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005; resMindPp=1` **（原创扩展）** | 女款低饱和水田拼布披单件完整铺展，直领对襟、宽袖、长方布块错落缝合，青灰茶褐无字，晚明士女及膝尺度 |
| `eq_xixiacuzhanpi_nan` | 西夏粗毡披·男 | 披风·毡披 | 黄中 | 党项窄袍外披 · 西夏（榆林窟第29窟供养人图）· 出现书界 ch01 **（原创扩展）** | `grade=2; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005; resColdPp=1` **（原创扩展）** | 男款土黄粗毡短披单件完整铺展，圆领、左前襟绳结、无袖及臀，毛毡边缘略毛糙无纹，西夏牧旅尺度 |
| `eq_songyoujuanyupi_nv` | 宋油绢雨披·女 | 披风·雨披 | 黄中 | 油绢衣 · 宋（《宋会要辑稿》《西湖老人繁胜录》）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=2; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005` **（原创扩展）** | 女款灰青油绢雨披单件完整铺展，连肩圆领、前开系绳、短宽袖，竹笠只作旁置从属件，宋代行旅及膝尺度 |
| `eq_songzonglvsuoyi_nan` | 宋棕榈蓑衣·男 | 披风·蓑衣 | 黄下 | 蓑衣 · 宋（宋代风俗图像）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=1; slot=cape; wearer=male; defOutK=0.025; hpMaxK=0.005` **（原创扩展）** | 男款棕榈蓑衣单件完整铺展，披肩式圆领、层叠棕丝垂至膝上、麻绳系口，粗糙旧化无斗笠人物，宋代农渔尺度 |
| `eq_qingqingbufengpi_nv` | 清青布风披·女 | 披风·布 | 黄下 | 民间风披 · 清（清代风俗画）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=1; slot=cape; wearer=female; defOutK=0.025; hpMaxK=0.005` **（原创扩展）** | 女款灰青粗布风披单件完整铺展，圆领、右开襟布结、无袖直摆及膝，补缀一处无纹，清代汉女行旅尺度 |
| `eq_songzhijiaofutou_nan` | 宋直脚幞头·男 | 头饰·幞头 | 地上 | 幞头 · 宋（《宋史·舆服志》、故宫幞头资料）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=9; slot=head; wearer=male; cha=2` **（原创扩展）** | 男款黑漆纱直脚幞头独立陈列，不画人头，硬胎方正、两脚平直对称、漆纱细密，配一支素簪，宋代高官冠帽尺度 |
| `eq_yuanguguquan_nv` | 元珠饰罟罟冠·女 | 头饰·罟罟冠 | 地上 | 罟罟冠 · 元（元墓壁画、故宫蒙元服饰研究）· 出现书界 ch04 **（原创扩展）** | `grade=9; slot=head; wearer=female; cha=2` **（原创扩展）** | 女款高筒罟罟冠独立陈列，不画人头，上宽下窄骨架包深红绢，顶部枝状银饰与克制珠串，约一尺高，元代蒙古贵妇尺度 |
| `eq_mingzhongjingguan_nan` | 明忠静冠·男 | 头饰·冠 | 地中 | 忠静冠服 · 明（《大明会典·舆服》）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=8; slot=head; wearer=male; effRes=4` **（原创扩展）** | 男款乌纱忠静冠独立陈列，不画人头，方筒冠体、顶部微隆、两侧收束，纱罗匀净配玉簪，无官阶字样，明代官绅尺度 |
| `eq_qingzhenzhudiantzi_nv` | 清珠翠钿子·女 | 头饰·钿子 | 地中 | 钿子 · 清（故宫清代钿子工艺研究）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=8; slot=head; wearer=female; cha=2` **（原创扩展）** | 女款黑绒半环钿子独立陈列，不画人头，藤骨丝线网胎、对称点翠花叶与小珍珠，轮廓低矮，无大拉翅，清前中期贵族尺度 |
| `eq_yuanqibaolimao_nan` | 元七宝钹笠帽·男 | 头饰·笠帽 | 地下 | 钹笠帽 · 元（《元史·舆服志》、故宫蒙元服饰研究）· 出现书界 ch04 **（原创扩展）** | `grade=7; slot=head; wearer=male; resMindPp=3` **（原创扩展）** | 男款朱红钹笠帽独立陈列，不画人头，宽圆笠檐、低尖顶、鎏金宝顶与细珠缘，毛毡挺括无字，元代蒙古贵族尺度 |
| `eq_songjinhuaguan_nv` | 宋金银花冠·女 | 头饰·花冠 | 地下 | 女子冠子、花冠 · 宋（《宋史·舆服志》、宋代墓葬与图像）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=7; slot=head; wearer=female; cha=2` **（原创扩展）** | 女款低矮金银花冠独立陈列，不画人头，细金属丝作折枝花叶、银簪横置、小珍珠点缀，通透不夸张，宋代贵族尺度 |
| `eq_mingdongpojin_nan` | 明纱制东坡巾·男 | 头饰·巾 | 玄上 | 东坡巾 · 明（明代士人图像、国博服饰研究）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=6; slot=head; wearer=male; wis=1` **（原创扩展）** | 男款乌青纱东坡巾独立陈列，不画人头，方高巾体、前檐短、后垂软脚，纱纹清楚配素巾环，无字，明代士人尺度 |
| `eq_dalijinhuaguan_nv` | 大理鎏金花冠·女 | 头饰·花冠 | 玄上 | 大理国高冠与花饰 · 大理（《张胜温画卷》、剑川石窟图像）· 出现书界 ch01 **（原创扩展）** | `grade=6; slot=head; wearer=female; cha=1` **（原创扩展）** | 女款大理低筒花冠独立陈列，不画人头，鎏金铜片花叶围成圆冠、白绢内衬、银簪一支，青绿点饰无字，宋代大理贵族尺度 |
| `eq_jinzaoluojin_nan` | 金皂罗方顶巾·男 | 头饰·巾 | 玄中 | 方顶巾 · 金（《金史·舆服志》）· 出现书界 ch02/ch03 **（原创扩展）** | `grade=5; slot=head; wearer=male; effRes=3` **（原创扩展）** | 男款皂罗方顶巾独立陈列，不画人头，方顶十字缝、后折垂、两角各缀方罗与短带，黑纱匀净，金代贵显尺度 |
| `eq_mingyudiebuyao_nv` | 明玉蝶步摇·女 | 头饰·簪钗 | 玄中 | 簪钗、步摇 · 明（定陵与明墓首饰实物）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=5; slot=head; wearer=female; cha=1` **（原创扩展）** | 女款银鎏金玉蝶步摇一对与长簪并置，不画人头，蝶翼镂空、细链垂三颗小珠，白玉温润无字，明代士绅尺度 |
| `eq_qinghongyingnuanmao_nan` | 清红缨暖帽·男 | 头饰·暖帽 | 玄下 | 暖帽 · 清（《大清会典·冠服》）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=4; slot=head; wearer=male; resColdPp=2` **（原创扩展）** | 男款黑缎暖帽独立陈列，不画人头，圆顶上覆低矮红缨、窄熏貂帽缘、素铜顶珠，不冒充官阶宝石，清前中期士绅尺度 |
| `eq_songziluogaitou_nv` | 宋紫罗盖头·女 | 头饰·盖头 | 玄下 | 盖头 · 宋（《清波杂志》所述唐帷帽遗制）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=4; slot=head; wearer=female; resMindPp=2` **（原创扩展）** | 女款方幅淡紫罗盖头独立折叠陈列，不画人头，半透明长帛、四缘细绦与两角小坠，展开可蔽半身，宋代出行尺度 |
| `eq_mingwushafangjin_nan` | 明乌纱方巾·男 | 头饰·方巾 | 黄上 | 四方平定巾 · 明（明代宫廷与民间服饰研究）· 出现书界 ch05/ch06/ch07 **（原创扩展）** | `grade=3; slot=head; wearer=male` **（原创扩展）** | 男款乌纱四方平定巾独立陈列，不画人头，方正硬胎、四角平整、细纱透气，配素黑巾环，无字，明代士人尺度 |
| `eq_qingbaobu_nv` | 清绣边包髻·女 | 头饰·包髻 | 黄上 | 汉女包头 / 包髻 · 清（清代风俗图像）· 出现书界 ch08/ch09/ch10/ch11/ch12/ch13/ch14 **（原创扩展）** | `grade=3; slot=head; wearer=female; cha=1` **（原创扩展）** | 女款靛蓝绸包髻巾独立打结陈列，不画人头假发，长巾折成低髻轮廓、折枝花窄绣边与银簪，无大拉翅，清代汉女尺度 |
| `eq_menggubailimao_nan` | 蒙古白毡笠帽·男 | 头饰·毡帽 | 黄中 | 蒙古毡帽 · 南宋 / 元（蒙元绘画与墓葬图像）· 出现书界 ch02/ch03/ch04 **（原创扩展）** | `grade=2; slot=head; wearer=male` **（原创扩展）** | 男款乳白毡笠帽独立陈列，不画人头，圆锥低顶、翻折窄檐、红布顶结与皮下颏带，粗毡无字，蒙古牧骑尺度 |
| `eq_xixiaxiaotuanguan_nv` | 西夏小团冠·女 | 头饰·冠 | 黄中 | 女供养人小团冠 · 西夏（榆林窟第29窟）· 出现书界 ch01 **（原创扩展）** | `grade=2; slot=head; wearer=female` **（原创扩展）** | 女款赭红小团冠独立陈列，不画人头假发，低矮圆冠包棉布、青黑窄缘与两支素铜短簪，无珠翠文字，西夏城镇女子尺度 |
| `eq_songmabufujin_nan` | 宋麻布幅巾·男 | 头饰·巾 | 黄下 | 幅巾 · 宋（《宋史·舆服志》）· 出现书界 ch01/ch02/ch03 **（原创扩展）** | `grade=1; slot=head; wearer=male` **（原创扩展）** | 男款灰黑麻布幅巾独立打结陈列，不画人头，方巾包折成软顶、后部两短脚自然垂落，粗布轻旧无字，宋代庶民尺度 |
| `eq_huijianghuatoujin_nv` | 回疆花布头巾·女 | 头饰·头巾 | 黄下 | 花布缠头 · 清（《皇清职贡图》）· 出现书界 ch10/ch12 **（原创扩展）** | `grade=1; slot=head; wearer=female` **（原创扩展）** | 女款靛红花布头巾独立折叠陈列，不画人头假发，长方棉布、边角流苏、几何小花无字，包覆后仍留双垂端，清代回疆平民尺度 |

## 本文新增术语与 ID

- 新增 AR-25 披风 18 个、头饰 18 个，统一登记见 `design/10` §14；护肩旧行不计本次矩阵。

## 数据校验规则与测试用例

- 披风、头饰分别校验 18 格；披风须 `slot=cape` 且单件铺展，头饰须 `slot=head` 且不画人头。
- 机器校验：`python3 tools/lint/check_item_catalog.py docs/design/catalog/items-accessories.md --min 48`；跨表 ID 再跑严格检查。

## 待决事项 / 依赖

### 替下游给出的建议值

- 资产生成保持“披风单件、头饰独立陈列”；簪钗可成对，但不得生成佩戴者。

### 本文依赖的上游事实

- 披风主属性、头饰主属性与书界年代分别引用 `design/10`、`design/02`。

### 对基准的修改提案

- 同衣物表：建议补充 `wearer` 可选枚举及消费语义。

### 原著考据待办

- 无新增原著断言；条目均按制度文献、图像或实物概括并标原创组合。

### 开放问题（附默认值）

- 护肩是否另补 18 格：默认不补；天级是否扩矩阵：默认不补。
