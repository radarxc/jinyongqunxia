# 物品图鉴 · 药物、补品与药材（`items-medicine`）

> **归属（基准 §18）**：本表是 `design/10` §8 的批量出图投影，不另定义物品规则。
> **上游**：`author-requirements.md` AR-20、`design/10` §2.3–§2.4、§8；经脉辅助只引用 `design/15` §5.6。
> **引用而不重定义**：Buff、驱散与复活见 `design/06`；永久预算、年限分级及精确品阶见 `design/10`。
> **标注约定**：玩法数值、包装和无原著定本的形制均标 **（原创扩展）**；待核药名出处标 **（待考）**。机器读取只接受下表七列。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_jinchuangyao` | 金创药 | 药物·外伤 | 黄 | 武侠通用药名；本物品 **（原创扩展）** | `grade=1; healPct=5%; dispel=bleed:g1` **（原创扩展）** | 粗瓷扁罐，米白药粉，赭红布封，掌心大小，旧铺药物感 **（原创扩展）** |
| `it_huoxuewan` | 活血丸 | 药物·补血 | 黄 | **（原创扩展）** | `grade=2; healPct=5.5%` | 褐色小丸三枚置青瓷浅碟，蜡纸小包，朴素药铺感 **（原创扩展）** |
| `it_wuchangdan` | 无常丹 | 药物·疗伤 | 玄 | 金庸作品 **（待考：核具体书名、使用人物与药效）** | `grade=6; healPct=8.5%; dispel=injury:g6` **（原创扩展）** | 黑白相间双层漆盒，深褐丸药，银灰封蜡，半掌大小 **（原创扩展）** |
| `it_fulingshouwuwan` | 茯苓首乌丸 | 药物·补气疗伤 | 玄 | 金庸作品 **（待考：核具体书名、使用人物与药效）** | `grade=6; healPct=4.25%; mpPct=10.2%` **（原创扩展）** | 乌木小匣盛棕黑蜜丸，可见茯苓粉霜，素麻封条无字 **（原创扩展）** |
| `it_tianxiangduanxujiao` | 天香断续胶 | 药物·接骨外敷 | 地 | 《笑傲江湖》·恒山派疗伤药 | `grade=7; healPct=6%; dispel=bleed,injury.bone:g7; buff=bf_huoluo` **（原创扩展）** | 乳白半透明胶膏置青白瓷盒，浅金油纸，清雅恒山气质 **（原创扩展）** |
| `it_bilingdan` | 碧灵丹 | 药物·疗伤解毒 | 地 | 梁羽生《云海玉弓缘》·天山派灵药；具体药效边界 **（待考）** | `grade=9; healPct=12%; dispel=poison,injury:g9` **（原创扩展）** | 一枚碧绿丸药置雪莲纹银瓶旁，软木塞与旧青绢包裹，指腹大小 **（原创扩展形制）** |
| `it_heiyuduanxugao` | 黑玉断续膏 | 药物·接骨外敷 | 地 | 《倚天屠龙记》·西域金刚门秘药 | `grade=9; cure=bf_gushang,bf_huagu; storyCure=fracture` **（原创扩展）** | 墨黑膏体盛黑玉色圆盒，铜扣与厚蜡封，沉重珍药感 **（原创扩展）** |
| `it_jiuhuayulu` | 九花玉露丸 | 药物·补血疗伤 | 地 | 《射雕英雄传》·黄药师所制 | `grade=9; healPct=12%; buff=bf_xuming; dispel=injury:g9` **（原创扩展）** | 九枚淡青丸置桃花瓣形白瓷盘，露珠光泽，小巧精致 **（原创扩展）** |
| `it_baotaiyijinwan` | 豹胎易筋丸 | 药物·控制 | 地 | 《鹿鼎记》·神龙教 | `grade=8; apply=bf_shouzhi; storyForced=true` **（原创扩展）** | 暗红大丸置蛇纹金属小盒，油亮表面，南疆秘教压迫感 **（原创扩展）** |
| `it_tianyishenshui` | 天一神水 | 药物·奇毒 | 地 | 古龙《楚留香传奇·画眉鸟》·神水宫；药物细节 **（待考）** | `grade=9; action=dose; apply=bf_judu; unique=true; noCraft=true` **（原创扩展）** | 密封白玉小瓶嵌入乌木护匣，银扣与深蓝软衬，液体不外露，半掌高 **（原创扩展形制）** |
| `it_yulongsuheisan` | 玉龙苏合散 | 药物·救急 | 天 | 金庸作品 **（待考：核具体书名、持有人与药效）** | `grade=10; healPct=14%; mpPct=8.4%; dispel=injury,poison:g10` **（原创扩展）** | 羊脂玉小葫芦盛银白细粉，银塞云纹，微冷润泽，无发光 **（原创扩展）** |
| `it_jiuzhuanhuanhundan` | 九转还魂丹 | 药物·复活 | 天 | **（原创扩展）** | `grade=10; apply=bf_fuhuo; perBattle=1; uniqueUse=true` | 朱红丹丸一枚置九瓣金边漆盒，温润药光，非魔法泛光 **（原创扩展）** |
| `it_yangjingwan` | 养精丸 | 补品·临时属性 | 黄 | **（原创扩展）** | `grade=3; buff=bf_yangsheng; hours=6` | 浅褐蜜丸配竹筒，麻绳短系，寻常行旅补品感 **（原创扩展）** |
| `it_bailucao` | 百露草膏 | 补品·补气 | 黄 | **（原创扩展）** | `grade=3; mpPct=7.2%` | 青绿草膏盛竹节小罐，叶脉与露痕，清新但不发光 **（原创扩展）** |
| `it_xiaohuandan` | 小还丹 | 补品·疗伤 | 玄 | **（原创扩展）**；沿武侠常见药名 | `grade=5; healPct=7.5%; buff=bf_huichun` | 深棕丸药六枚，素黄瓷瓶与木塞，寺院药房质朴感 **（原创扩展）** |
| `it_zixiaoyangqidan` | 紫霞养气丹 | 补品·补气修炼 | 玄 | **（原创扩展）** | `grade=6; mpPct=10.2%; sxpBuff=1.20x:5battle` | 紫褐丸药配云纹青瓷瓶，细银圈封口，掌中尺寸 **（原创扩展）** |
| `it_tongxidilongwan` | 通犀地龙丸 | 补品·抗毒 | 地 | 《射雕英雄传》·欧阳锋所制辟毒奇药 | `grade=9; carry.resPoisonPp=8; carry.resGuPp=4; unique=true` **（原创扩展）** | 琥珀色药丸一枚置犀角色小匣，西域卷草纹，凝润质感 **（原创扩展）** |
| `it_shengshengzaohuadan` | 生生造化丹 | 补品·永久属性 | 天 | 《飞狐外传》·《药王神篇》所载丹药；改效 **（原创扩展）** | `grade=10; breakCap=5; permStat=2; perChapter=1` **（原创扩展）** | 翠绿丹丸置银叶形药盒，细腻蜡光，药王庄清雅工艺 **（原创扩展）** |
| `it_xueshenyuchanwan` | 雪参玉蟾丸 | 补品·内力经脉 | 天 | 金庸作品 **（待考：核具体书名、人物与药效）** | `grade=10; perm.mpMaxPct=2%; meridianAid={rateBp:1000,successBp:500,costReduceBp:500,hours:12}` **（原创扩展）** | 雪白药丸嵌淡青玉蟾小盒，霜晶与参纹，冷润无荧光 **（原创扩展）** |
| `it_tiansuixuminglu` | 天髓续命露 | 补品·经脉疗伤 | 天 | **（原创扩展）** | `grade=10; healPct=14%; meridianAid={rateBp:800,successBp:800,costReduceBp:800,hours:12}` | 透明微金药露盛细颈玉瓶，金丝软塞，珍稀固定奇遇感 **（原创扩展）** |
| `it_renshen` | 普通人参 | 药材·人参 | 黄 | 中药材通名 | `grade=3; herbFamily=renShen; ageYears=0; materialGrade=3` **（原创扩展定级）** | 一支浅黄人参，根须完整，少量新土，约手掌长 |
| `it_shinianrenshen` | 十年人参 | 药材·人参 | 玄 | **（原创扩展年限分级）** | `grade=6; herbFamily=renShen; ageYears=10; materialGrade=6` | 根体稍粗、须根繁密，黄麻绳束，木盒有轻微岁月痕 **（原创扩展）** |
| `it_bainianrenshen` | 百年人参 | 药材·人参 | 地 | **（原创扩展年限分级）** | `grade=9; herbFamily=renShen; ageYears=100; materialGrade=9` | 粗壮分叉老参，深褐年纹，绢衬檀木匣，尺幅约前臂长 **（原创扩展）** |
| `it_qiannianrenshen` | 千年人参 | 药材·人参 | 天 | **（原创扩展年限分级）** | `grade=10; herbFamily=renShen; ageYears=1000; materialGrade=10; unique=true` | 巨大老参盘须如人形，古木匣与旧绢，干润自然无神光 **（原创扩展）** |
| `it_xueshen` | 普通雪参 | 药材·雪参 | 黄 | **（原创扩展）** | `grade=3; herbFamily=xueShen; ageYears=0; materialGrade=3` | 灰白小参附短须与霜土，粗布包，指掌大小 **（原创扩展）** |
| `it_shinianxueshen` | 十年雪参 | 药材·雪参 | 玄 | **（原创扩展年限分级）** | `grade=6; herbFamily=xueShen; ageYears=10; materialGrade=6` | 银白参体略弯，蓝灰布衬木盒，细小冻裂痕 **（原创扩展）** |
| `it_bainianxueshen` | 百年雪参 | 药材·雪参 | 地 | **（原创扩展年限分级）** | `grade=9; herbFamily=xueShen; ageYears=100; materialGrade=9` | 肥厚雪参与密须，冰蓝绢衬，老木匣边缘磨亮 **（原创扩展）** |
| `it_qiannianxueshen` | 千年雪参 | 药材·雪参 | 天 | **（原创扩展年限分级）** | `grade=10; herbFamily=xueShen; ageYears=1000; materialGrade=10; unique=true` | 臂长银灰老参，须根盘绕，寒玉匣有千年风化细痕 **（原创扩展）** |
| `it_duanchangcao` | 断肠草 | 药材·毒草 | 地 | 《神雕侠侣》·杨过以毒攻毒解情花毒 | `grade=7; apply=bf_judu; reaction=rx_yiduigongdu` | 叶片狭长、根茎暗紫，带断崖湿土，竹夹隔离，束长半尺 **（原创扩展）** |
| `it_tianshanxuelian` | 天山雪莲 | 药材·雪莲 | 地 | 《书剑恩仇录》·雪山采莲情节 | `grade=9; healPct=12%; dispel=poison,cold:g9; perm.resColdPp=3` **（原创扩展）** | 白瓣雪莲一朵连根，浅青叶、冰霜边缘，宽约双掌 |
| `it_qiannianlingzhi` | 千年灵芝 | 药材·灵芝 | 天 | **（原创扩展年限分级）** | `grade=10; herbFamily=lingZhi; ageYears=1000; materialGrade=10; unique=true` | 紫褐巨灵芝一株，层叠菌盖有深密年轮，旧檀木架托，约双掌宽 **（原创扩展）** |
| `it_qiannianxuelian` | 千年雪莲 | 药材·雪莲 | 天 | **（原创扩展年限分级）** | `grade=10; herbFamily=xueLian; ageYears=1000; materialGrade=10; unique=true` | 多层银白花瓣与苍青老根，寒玉匣衬旧绢，花冠约一掌宽 **（原创扩展）** |
