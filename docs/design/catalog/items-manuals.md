# 物品图鉴 · 武学秘籍（`items-manuals`）

> **归属（基准 §18）**：本表只投影 `design/10` §10 已登记的秘籍实体，不定义武学。
> **上游**：AR-20、`design/10` §10.1；武学名称、品阶和来源唯一见对应 `skills-*.md` / `design/05`。
> **引用而不重定义**：阅读、残本上限和残页拼合见 `design/10` §10.2–§10.3。
> **标注约定**：秘籍实体、装帧与投放均 **（原创扩展）**，不会把武学原著出处扩写成“小说中出现过该书册”。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_miji_luohanquan` | 罗汉拳谱 | 秘籍·全本 | 黄 | 《天龙八部》等·少林武学；载体 **（原创扩展）** | `grade=1; skill=sk_luohanquan; variant=full; maxLayer=10` | 素黄薄纸册，四眼细订线，空题签，边角轻磨，掌心略大 **（原创扩展）** |
| `it_miji_taizuchangquan` | 太祖长拳谱 | 秘籍·全本 | 黄 | 《天龙八部》·萧峰用太祖长拳；载体 **（原创扩展）** | `grade=3; skill=sk_taizuchangquan; variant=full; maxLayer=10` | 靛蓝布纹纸书衣，细线装，封面空白，民间拳谱朴素感 **（原创扩展）** |
| `it_miji_quanzhenxinfa` | 全真心法抄本 | 秘籍·抄本 | 玄 | 《射雕英雄传》《神雕侠侣》·全真内功；载体 **（原创扩展）** | `grade=5; skill=sk_quanzhenxinfa; variant=copy; maxLayer=8` | 灰青软纸册，麻线细订，道观藏书轻旧化，无太极文字图案 **（原创扩展）** |
| `it_miji_suohouqinnashou` | 锁喉擒拿手遗谱 | 秘籍·全本 | 玄 | 《天龙八部》·马大元绝技；遗谱 **（原创扩展）** | `grade=6; skill=sk_suohouqinnashou; variant=full; maxLayer=10` | 褐红薄册，边缘有翻阅毛损，布包角，无字无血迹 **（原创扩展）** |
| `it_miji_baituodujing` | 白驼毒经残本 | 秘籍·残本 | 玄 | “西毒”用毒背景；经名与载体 **（原创扩展）** | `grade=5; skill=sk_baituodujing; variant=partial; maxLayer=8` | 西域皮纸但非硬皮封壳，墨绿细绳，夹一片干草标本，无字 **（原创扩展）** |
| `it_miji_yangjiaqiangfa` | 杨家枪法遗谱 | 秘籍·全本 | 玄 | 《射雕英雄传》·杨铁心家传枪法；遗谱 **（原创扩展）** | `grade=6; skill=sk_yangjiaqiangfa; variant=full; maxLayer=10` | 赭色纸册裹旧蓝布套，细长开本，边角磨白 **（原创扩展）** |
| `it_miji_liangyixinfa` | 两仪心法谱 | 秘籍·全本 | 玄 | **（原创扩展）** | `grade=5; skill=sk_liangyixinfa; variant=full; maxLayer=10` | 黑白双色但无太极符号的软纸书衣，细订线，克制道家感 **（原创扩展）** |
| `it_miji_tiebushan` | 铁布衫秘籍 | 秘籍·全本 | 地 | 民间横练名目；本作 **（原创扩展）** | `grade=7; skill=sk_tiebushan; variant=full; maxLayer=10` | 土黄厚韧纸册，深褐布包边，朴实寺院练功册 **（原创扩展）** |
| `it_miji_dajingangzhang` | 大金刚掌秘籍 | 秘籍·全本 | 地 | 金庸作品少林武学 **（待考：核“大金刚掌/大力金刚掌”用名）**；载体 **（原创扩展）** | `grade=7; skill=sk_dajingangzhang; variant=full; maxLayer=10` | 深赭纸书衣，金泥仅作窄边且无字，四眼线装，庄重不华丽 **（原创扩展）** |
| `it_miji_longzhaoshou` | 龙爪手秘本 | 秘籍·全本 | 地 | 《倚天屠龙记》·少林龙爪手；载体 **（原创扩展）** | `grade=8; skill=sk_longzhaoshou; variant=full; maxLayer=10` | 暗金棕薄册，封面压出无字爪痕浅纹，细线装 **（原创扩展）** |
| `it_miji_canhezhi` | 参合指藏本 | 秘籍·残本 | 地 | 《天龙八部》·慕容氏武学；藏本 **（原创扩展）** | `grade=8; skill=sk_canhezhi; variant=partial; maxLayer=7` | 湖蓝绢纸书衣，水阁藏书防潮布套，页口齐整 **（原创扩展）** |
| `it_miji_baihongzhang` | 白虹掌力藏本 | 秘籍·残本 | 地 | 《天龙八部》·李秋水武学；藏本 **（原创扩展）** | `grade=9; skill=sk_baihongzhang; variant=partial; maxLayer=7` | 月白薄册带淡虹色纤维，不发光，曼陀山庄精致藏书感 **（原创扩展）** |
| `it_miji_xisuijing` | 洗髓经藏本 | 秘籍·残本 | 地 | 民间传说名目；本作 **（原创扩展）** | `grade=9; skill=sk_xisuijing; variant=partial; maxLayer=8` | 米白经折式外观但不画经文，灰布护套，古旧藏经感 **（原创扩展）** |
| `it_miji_jiuyin_shang` | 九阴真经上卷 | 秘籍·原本 | 天 | 《射雕英雄传》·九阴真经上下卷 | `grade=12; skill=sk_jiuyin; variant=original; maxLayer=10; volume=upper` | 墨青柔软纸书衣、微翘角、右侧四眼细订线、空题签，轻旧化 **（原创扩展装帧）** |
| `it_miji_jiuyin_xia` | 九阴真经下卷 | 秘籍·原本 | 天 | 《射雕英雄传》·九阴真经上下卷 | `grade=12; skill=sk_jiuyin; variant=original; maxLayer=10; volume=lower` | 与上卷同套但以灰蓝书衣区分，薄纸页口、空题签 **（原创扩展装帧）** |
| `it_miji_xianglong18_can` | 降龙十八掌残本 | 秘籍·残本 | 天 | 《倚天屠龙记》·丐帮降龙掌残传；实体 **（原创扩展）** | `grade=12; skill=sk_xianglong18; variant=partial; maxLayer=6` | 旧黄纸残册，竹夹板护持，页角缺损但不散页，无文字 **（原创扩展）** |
| `it_miji_dagou_can` | 打狗棒法残谱 | 秘籍·残本 | 天 | 《倚天屠龙记》·丐帮棒法残传；实体 **（原创扩展）** | `grade=11; skill=sk_dagou; variant=partial; maxLayer=6` | 墨绿软纸残谱，细麻线补缀，竹节纹暗压，无字 **（原创扩展）** |
| `it_miji_douzhuan` | 斗转星移藏本 | 秘籍·残本 | 天 | 《天龙八部》·慕容氏绝学；还施水阁载体 **（原创扩展）** | `grade=10; skill=sk_douzhuan; variant=partial; maxLayer=6` | 深蓝绢面薄册，银灰星点仅作纤维斑，不画星图或文字 **（原创扩展）** |
