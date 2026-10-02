# 物品图鉴 · 药物、补品与药材（`items-medicine`）

> **归属（基准 §18）**：本表是 `design/10` §8 的批量出图投影，不另定义物品规则。
> **上游**：`author-requirements.md` AR-20、AR-28，`design/10` §2.3–§2.4、§8；经脉辅助只引用 `design/15` §5.6。
> **引用而不重定义**：Buff、驱散与复活见 `design/06`；永久预算、年限分级及精确品阶见 `design/10`；逐味地区、月份与安全投放见 `catalog/gather-herbs.md`。
> **标注约定**：玩法数值、包装和无原著定本的形制均标 **（原创扩展）**；待核原著标 **（待考）**，待核学名 / 现实原型标 **（待核实）**。机器读取只接受下表七列。
> **安全边界**：本表只写虚构游戏设定和供出图的干燥 / 历史形态，不提供现实剂量、配伍、制法或医疗建议；受保护动物来源只作历史旧藏。

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
| `it_aiye` | 艾叶 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=aiYe; ageYears=0; materialGrade=1` | 药用叶揉成灰绿绒团，夹少量叶梗，粗纸小包盛放 |
| `it_bohe` | 薄荷 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=boHe; ageYears=0; materialGrade=1` | 药用茎叶阴干后青褐卷曲，叶脉清楚，扁竹盒松装 |
| `it_yuxingcao` | 鱼腥草 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=yuXingCao; ageYears=0; materialGrade=1` | 药用全草切成长段晒干，茎节与心形叶可辨，麻纸束包 |
| `it_pugongying` | 蒲公英 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=puGongYing; ageYears=0; materialGrade=1` | 药用全草连细根干燥，锯齿叶黄绿，浅口竹篮盛放 |
| `it_zisunye` | 紫苏叶 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=ziSuYe; ageYears=0; materialGrade=1` | 药用叶皱缩成紫褐薄片，背面灰绿，油纸小袋封存 |
| `it_yimucao` | 益母草 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=yiMuCao; ageYears=0; materialGrade=1` | 药用地上部分切段晒干，方茎与裂叶混合，细麻绳扎束 |
| `it_xianhecao` | 仙鹤草 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=xianHeCao; ageYears=0; materialGrade=2` | 药用地上部分切作黄绿短段，残留穗状果刺，竹筒盛放 |
| `it_huoxiang` | 藿香 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=huoXiang; ageYears=0; materialGrade=2` | 药用茎叶切段阴干，茎呈方柱、叶片灰绿，棉纸包裹 |
| `it_jingjie` | 荆芥 | 药材·草本 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=jingJie; ageYears=0; materialGrade=2` | 药用花穗与茎叶干燥成黄绿色细束，窄竹篓直立盛放 |
| `it_huangqi` | 黄芪 | 药材·根茎 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=huangQi; ageYears=0; materialGrade=2` | 药用根斜切成淡黄椭圆厚片，木质纹理清楚，布口袋盛放 |
| `it_danggui` | 当归 | 药材·根茎 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=dangGui; ageYears=0; materialGrade=2` | 药用根切成黄棕薄片，油润形成层可辨，圆竹匣平码 |
| `it_gancao` | 甘草 | 药材·根茎 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=ganCao; ageYears=0; materialGrade=1` | 药用根切作淡黄色圆片，外缘棕褐，牛皮纸包平码 |
| `it_gegen` | 葛根 | 药材·根茎 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=geGen; ageYears=0; materialGrade=1` | 药用块根切成乳白方块并晒干，纤维断面明显，竹筛盛放 |
| `it_jiegeng` | 桔梗 | 药材·根茎 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=jieGeng; ageYears=0; materialGrade=1` | 药用根刮皮后呈淡黄白长条，纵沟明显，蓝布束袋盛放 |
| `it_ganjiang` | 干姜 | 药材·根茎 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=ganJiang; ageYears=0; materialGrade=1` | 药用根茎切成扁块晒至灰黄，断面粉性，粗陶浅钵盛放 |
| `it_jinyinhua` | 金银花 | 药材·花果 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=jinYinHua; ageYears=0; materialGrade=2` | 药用花蕾干燥成黄白细棒，少量初开花混入，素瓷小罐盛放 |
| `it_gouqizi` | 枸杞子 | 药材·花果 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=gouQiZi; ageYears=0; materialGrade=1` | 药用成熟果干燥成暗红纺锤小粒，表皮微皱，木盒散装 |
| `it_dazao` | 大枣 | 药材·花果 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=daZao; ageYears=0; materialGrade=1` | 药用成熟果晒成红褐椭圆干枣，表皮深皱，藤编小篮盛放 |
| `it_juhua` | 菊花 | 药材·花果 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=juHua; ageYears=0; materialGrade=1` | 药用头状花序阴干成淡黄扁朵，花瓣舒展，透气竹盒盛放 |
| `it_lianqiao` | 连翘 | 药材·花果 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=lianQiao; ageYears=0; materialGrade=2` | 药用果实纵裂成黄褐双瓣壳，种子零星可见，粗瓷罐盛放 |
| `it_cheqianzi` | 车前子 | 药材·花果 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=cheQianZi; ageYears=0; materialGrade=1` | 药用种子为棕褐细小椭圆粒，晒干去杂，布袋与木勺盛放 |
| `it_fuling` | 茯苓 | 药材·菌藻 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=fuLing; ageYears=0; materialGrade=2` | 药用菌核削皮切作白色方丁，外皮棕黑，竹屉平码晾放 |
| `it_zhuling` | 猪苓 | 药材·菌藻 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=2; herbFamily=zhuLing; ageYears=0; materialGrade=2` | 药用菌核切成灰白不规则厚片，外皮黑褐，麻纸包盛放 |
| `it_haizao` | 海藻 | 药材·菌藻 | 黄 | 常见本草；玩法分级 **（原创扩展）** | `grade=1; herbFamily=haiZao; ageYears=0; materialGrade=1` | 药用藻体洗净晒成黑褐卷曲细束，盐霜克制，藤筐盛放 |
| `it_dilong` | 地龙 | 药材·动物 | 黄 | 动物性本草；仅作历史设定 **（原创扩展）** | `grade=2; herbFamily=diLong; ageYears=0; materialGrade=2` | 药用体壁干燥成灰棕扁长弯片，腹面色浅，分格木盒盛放 |
| `it_shigao` | 石膏 | 药材·矿物 | 黄 | 矿物药历史设定；玩法分级 **（原创扩展）** | `grade=2; herbFamily=shiGao; ageYears=0; materialGrade=2` | 药用纤维状矿块砸成白色半透明碎片，丝绢光泽，粗陶罐盛放 |
| `it_qinghao` | 青蒿 | 药材·草本 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=4; herbFamily=qingHao; ageYears=0; materialGrade=4` | 药用地上部分阴干成黄绿色细枝叶，叶裂纤细，长纸包扎束 |
| `it_mahuang` | 麻黄 | 药材·草本 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=4; herbFamily=maHuang; ageYears=0; materialGrade=4` | 药用草质茎切成长段，黄绿有细纵棱，窄木盒平码 |
| `it_shihu` | 石斛 | 药材·草本 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=5; herbFamily=shiHu; ageYears=0; materialGrade=5` | 药用茎干燥成金黄短段或螺旋枫斗，竹篓内铺棉纸 |
| `it_baizhu` | 白术 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=4; herbFamily=baiZhu; ageYears=0; materialGrade=4` | 药用根茎切作黄白不规则厚片，棕色油点可辨，陶盘盛放 |
| `it_dangshen` | 党参 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=4; herbFamily=dangShen; ageYears=0; materialGrade=4` | 药用长根晒成黄棕皱条，根头环纹清楚，红绳小束置木匣 |
| `it_chuanxiong` | 川芎 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=5; herbFamily=chuanXiong; ageYears=0; materialGrade=5` | 药用根茎切成黄褐蝴蝶形薄片，油室斑点可见，竹盒盛放 |
| `it_danshen` | 丹参 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=5; herbFamily=danShen; ageYears=0; materialGrade=5` | 药用根切成砖红圆片，中央木心淡黄，白麻袋敞口盛放 |
| `it_chaihu` | 柴胡 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=4; herbFamily=chaiHu; ageYears=0; materialGrade=4` | 药用根为灰褐细长条，顶端残留茎基，麻绳束置竹匣 |
| `it_chuanbeimu` | 川贝母 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=6; herbFamily=chuanBeiMu; ageYears=0; materialGrade=6` | 药用鳞茎干燥成乳白小锥粒，两瓣抱合，白瓷盏盛放 |
| `it_tianma` | 天麻 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=6; herbFamily=tianMa; ageYears=0; materialGrade=6` | 药用块茎蒸晒成黄白长椭圆，环纹与鹦哥嘴状芽痕可见，木盒盛放 |
| `it_huanglian` | 黄连 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=5; herbFamily=huangLian; ageYears=0; materialGrade=5` | 药用根茎呈黄褐分枝簇状，断面鲜黄，细竹筒成束盛放 |
| `it_huangqin` | 黄芩 | 药材·根茎 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=5; herbFamily=huangQin; ageYears=0; materialGrade=5` | 药用根斜切成黄褐薄片，老根中空暗棕，纸包平码 |
| `it_banxia` | 半夏 | 药材·根茎 | 玄 | 常见本草；原材有毒，供剧情 / 暗器 / 解毒设定 | `grade=5; herbFamily=banXia; ageYears=0; materialGrade=5; apply=bf_zhongdu` **（原创扩展）** | 药用块茎炮制后呈类球形白片，表面粉性，封口粗瓷罐盛放 |
| `it_sanqi` | 三七 | 药材·根茎 | 玄 | 常见本草；外伤素材玩法 **（原创扩展）** | `grade=6; herbFamily=sanQi; ageYears=0; materialGrade=6` | 药用根切成灰黄厚片，断面放射纹清楚，红布衬木盒盛放 |
| `it_wuweizi` | 五味子 | 药材·花果 | 玄 | 常见本草；玩法分级 **（原创扩展）** | `grade=4; herbFamily=wuWeiZi; ageYears=0; materialGrade=4` | 药用成熟果干燥成紫红圆粒，表面皱缩带果柄，漆木小盒盛放 |
| `it_lingzhi` | 灵芝 | 药材·菌藻 | 玄 | 常见本草；普通年限投影 **（原创扩展）** | `grade=6; herbFamily=lingZhi; ageYears=0; materialGrade=6` | 药用子实体为红褐肾形菌盖，漆样同心环纹，藤编托架盛放 |
| `it_lurong` | 鹿茸 | 药材·动物 | 玄 | 动物性本草；仅作历史设定 **（原创扩展）** | `grade=6; herbFamily=luRong; ageYears=0; materialGrade=6` | 药用幼角切成圆形薄片，外缘覆短绒、中央蜂窝状，木匣分格盛放 |
| `it_longgu` | 龙骨 | 药材·矿物 | 玄 | 古生物化石类矿物药历史设定；玩法分级 **（原创扩展）** | `grade=4; herbFamily=longGu; ageYears=0; materialGrade=4` | 药用化石碎成灰白多孔小块，断面土质无雕纹，厚纸盒盛放 |
| `it_zhusha` | 朱砂 | 药材·矿物 | 玄 | 矿物药历史设定；毒性，供剧情 / 暗器 / 解毒设定 | `grade=6; herbFamily=zhuSha; ageYears=0; materialGrade=6; apply=bf_zhongdu` **（原创扩展）** | 药用辰砂矿晶碾成鲜红粗粉，旁置暗红晶粒，双层瓷盒密封 |
| `it_xionghuang` | 雄黄 | 药材·矿物 | 玄 | 矿物药历史设定；毒性，供剧情 / 暗器 / 解毒设定 | `grade=5; herbFamily=xiongHuang; ageYears=0; materialGrade=5; apply=bf_zhongdu` **（原创扩展）** | 药用矿块呈橙黄至橙红蜡状碎片，粗粉少量，带盖陶罐密封 |
| `it_mantuoluo` | 曼陀罗花 | 药材·草本 | 地 | 有毒本草；毒性，供剧情 / 暗器 / 解毒设定；与情花是否同物 **（待核实）** | `grade=7; herbFamily=manTuoLuo; ageYears=0; materialGrade=7; apply=bf_hunshui` **（原创扩展）** | 药用花干燥成黄褐漏斗状皱片，花萼仍在，双层纸匣密封 |
| `it_qinghua` | 情花 | 药材·草本 | 地 | 《神雕侠侣》·绝情谷虚构毒花；现实原型 **（待核实）** | `grade=8; herbFamily=qingHua; ageYears=0; materialGrade=8; apply=bf_qinghuadu` | 粉白花与带刺绿枝分置长竹匣，刺尖清楚，形制 **（原创扩展）** |
| `it_qixinhaitang` | 七心海棠 | 药材·草本 | 地 | 《飞狐外传》·程灵素所种毒花；现实原型未定 **（待核实）** | `grade=8; herbFamily=qiXinHaiTang; ageYears=0; materialGrade=8; apply=bf_qixin` | 深绿叶与淡红小花连枝置封闭陶盘，形态 **（原创扩展）** |
| `it_duanchangshigufuxincao` | 断肠蚀骨腐心草 | 药材·草本 | 地 | 《侠客行》·腊八粥主药；真实原型未定 **（待考）** | `grade=9; herbFamily=duanChangShiGuFuXinCao; ageYears=10; materialGrade=9` **（原创扩展定级）** | 十年生暗褐草根与卷曲叶片置石钵，形态 **（原创扩展）**，不示制法 |
| `it_jinboxunhua` | 金波旬花 | 药材·花果 | 地 | 《连城诀》·剧情奇毒；现实原型未定 **（待核实）** | `grade=9; herbFamily=jinBoXunHua; ageYears=0; materialGrade=9; apply=bf_judu; unique=true` | 金黄色干花连短枝封在双层漆匣，花形 **（原创扩展）**，不示制法 |
| `it_heshouwu` | 何首乌 | 药材·根茎 | 地 | 常见本草；玩法分级 **（原创扩展）** | `grade=7; herbFamily=heShouWu; ageYears=0; materialGrade=7` | 药用块根切作乌褐厚片，断面云锦状纹理，黑陶罐盛放 |
| `it_wutou` | 乌头 | 药材·根茎 | 地 | 有毒本草；毒性，供剧情 / 暗器 / 解毒设定 | `grade=7; herbFamily=wuTou; ageYears=0; materialGrade=7; apply=bf_judu` **（原创扩展）** | 药用块根干燥成暗棕锥形或纵切片，木纹细密，封口陶罐盛放 |
| `it_maqianzi` | 马钱子 | 药材·花果 | 地 | 有毒本草；毒性，供剧情 / 暗器 / 解毒设定 | `grade=8; herbFamily=maQianZi; ageYears=0; materialGrade=8; apply=bf_judu` **（原创扩展）** | 药用成熟种子呈灰绿扁圆纽扣状，表面密生银毛，锁扣木盒盛放 |
| `it_dongchongxiacao` | 冬虫夏草 | 药材·菌藻 | 地 | 常见本草；玩法分级 **（原创扩展）** | `grade=8; herbFamily=dongChongXiaCao; ageYears=0; materialGrade=8` | 药用虫体与棕色子座相连、干燥成黄褐细条，绢衬木匣平码 |
| `it_shexiang` | 麝香 | 药材·动物 | 地 | 动物性本草；受保护动物来源，仅作历史设定、不可循环采集 | `grade=8; herbFamily=sheXiang; ageYears=0; materialGrade=8` **（原创扩展）** | 历史药材为棕褐颗粒封入小绢囊，再置铜扣木匣，不画猎取过程 |
| `it_xiongdan` | 熊胆 | 药材·动物 | 地 | 动物性本草；受保护动物来源，仅作历史设定、不可循环采集 | `grade=7; herbFamily=xiongDan; ageYears=0; materialGrade=7` **（原创扩展）** | 历史旧藏药材为深褐干燥块置蜡封瓷盒，不画动物或取得过程 |
| `it_niuhuang` | 牛黄 | 药材·动物 | 地 | 动物性本草；仅作历史设定 **（原创扩展）** | `grade=8; herbFamily=niuHuang; ageYears=0; materialGrade=8` | 药用结石呈金黄至黄褐轻脆小块，断面层纹可见，棉纸衬瓷盒 |
| `it_xijiao` | 犀角 | 药材·动物 | 地 | 动物性本草；受保护动物来源，仅作历史设定、不可循环采集 | `grade=9; herbFamily=xiJiao; ageYears=0; materialGrade=9` **（原创扩展）** | 历史旧藏角质薄片呈灰褐细丝纹，封存于题签留白木匣，不画猎取 |
| `it_pusiqushedan` | 菩斯曲蛇胆 | 药材·动物 | 地 | 《神雕侠侣》·神雕所取奇物；动物来源只作剧情节点 | `grade=9; herbFamily=puSiQuSheDan; ageYears=0; materialGrade=9; permStat={str:1,con:1}; perChapter=3` **（原创扩展定级）** | 一枚墨绿椭圆干胆置软蜡封小瓷盒，绢垫分隔，不画取胆过程 |
| `it_chansu` | 蟾酥 | 药材·动物 | 地 | 动物性有毒本草；毒性，供剧情 / 暗器 / 解毒设定 | `grade=7; herbFamily=chanSu; ageYears=0; materialGrade=7; apply=bf_judu` **（原创扩展）** | 药用干燥物呈棕褐扁饼碎片，表面微亮，双层瓷盒密封，不示取得 |
| `it_mangguzhuha` | 莽牯朱蛤 | 药材·动物 | 天 | 《天龙八部》·万毒之王；全作唯一剧情奇物 | `grade=10; herbFamily=mangGuZhuHa; ageYears=0; materialGrade=10; apply=bf_mian_du; unique=true` | 朱红小蛤蟆伏于透气竹笼内，皮肤湿润有疣点，不画服食或解剖 |
| `it_bingcan` | 冰蚕 | 药材·动物 | 天 | 《天龙八部》·游坦之寒毒奇物 | `grade=10; herbFamily=bingCan; ageYears=0; materialGrade=10; apply=bf_handu; unique=true` | 雪白蚕体蜷在透气寒玉小匣的深蓝绢垫上，不发光、不画养毒过程 |
| `it_zhujingbingchan` | 朱睛冰蟾 | 药材·动物 | 天 | 金庸作品奇物 **（待考：核书名、人物与原文药效）** | `grade=10; herbFamily=zhuJingBingChan; ageYears=0; materialGrade=10; unique=true` **（原创扩展定级）** | 白色小蟾与朱红眼置透气寒玉匣，形态 **（待考）**，不画服食或取材 |
