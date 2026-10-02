# 物品图鉴 · 武学秘籍（`items-manuals`）

> **归属（基准 §18）**：本表只投影 `design/10` §10 已登记的秘籍实体，不定义武学。
> **上游**：AR-20、`design/10` §10.1；武学名称、品阶和来源唯一见对应 `skills-*.md` / `design/05`。
> **引用而不重定义**：阅读、残本上限和残页拼合见 `design/10` §10.2–§10.3。
> **标注约定**：原著载体事实仅按 §1 的逐项出处认定；其游戏物品投影、复原装帧与投放均 **（原创扩展）**。原著未出现载体的条目须显式标“载体 **（原创扩展）**”。
> **题签规则（AR-30）**：秘籍所附题签（封面、函套、卷首或首简）一律由生成器写武功本名；本表只描述题签材质、颜色、位置与书体，不重复题签文字。生成前须由 `manual_title()` 剥离版本／载体后缀。
> **外观字段口径**：“旧化”统一写轻／中／重度；“大小”给尺寸或掌心、小／中／大开本等相对尺度。二者是每行末尾的必填出图参数。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_miji_luohanquan` | 罗汉拳谱 | 秘籍·全本 | 黄 | 《天龙八部》等·少林武学；载体 **（原创扩展）** | `grade=1; skill=sk_luohanquan; variant=full; maxLayer=10` | 北宋素黄蝴蝶装薄册，细线缝缀，右上窄白纸签、墨楷，边角轻磨，掌心略大 **（原创扩展）**；旧化程度：轻度；大小：掌心开本 |
| `it_miji_taizuchangquan` | 太祖长拳谱 | 秘籍·全本 | 黄 | 《天龙八部》·萧峰用太祖长拳；载体 **（原创扩展）** | `grade=3; skill=sk_taizuchangquan; variant=full; maxLayer=10` | 北宋靛蓝纸衣蝴蝶装册，细线缝缀，左上米纸签、墨楷，民间拳谱朴素感 **（原创扩展）**；旧化程度：中度；大小：中开本 |
| `it_miji_quanzhenxinfa` | 全真心法抄本 | 秘籍·抄本 | 玄 | 《射雕英雄传》《神雕侠侣》·全真内功；载体 **（原创扩展）** | `grade=5; skill=sk_quanzhenxinfa; variant=copy; maxLayer=8` | 南宋灰青蝴蝶装软纸册，麻线缝缀，右上月白纸签、瘦楷，道观藏书轻旧化 **（原创扩展）**；旧化程度：轻度；大小：中开本 |
| `it_miji_suohouqinnashou` | 锁喉擒拿手遗谱 | 秘籍·全本 | 玄 | 《天龙八部》·马大元绝技；遗谱 **（原创扩展）** | `grade=6; skill=sk_suohouqinnashou; variant=full; maxLayer=10` | 北宋褐红蝴蝶装薄册，细线缝缀，右上旧绢签、墨楷，边缘毛损、布包角 **（原创扩展）**；旧化程度：中度；大小：中开本 |
| `it_miji_baituodujing` | 白驼毒经残本 | 秘籍·残本 | 玄 | “西毒”用毒背景；经名与载体 **（原创扩展）** | `grade=5; skill=sk_baituodujing; variant=partial; maxLayer=8` | 南宋西域皮纸折册，墨绿细绳双系，居中黄纸签、墨隶，夹干草标本 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_yangjiaqiangfa` | 杨家枪法遗谱 | 秘籍·全本 | 玄 | 《射雕英雄传》·杨铁心家传枪法；遗谱 **（原创扩展）** | `grade=6; skill=sk_yangjiaqiangfa; variant=full; maxLayer=10` | 南宋赭色蝴蝶装长册，旧蓝布套，右上白纸签、墨楷，边角磨白 **（原创扩展）**；旧化程度：中度；大小：中型长开本 |
| `it_miji_liangyixinfa` | 两仪心法谱 | 秘籍·全本 | 玄 | **（原创扩展）** | `grade=5; skill=sk_liangyixinfa; variant=full; maxLayer=10` | 元代黑白双色包背软册，麻布护脊，居中灰绢签、墨隶，克制道家感 **（原创扩展）**；旧化程度：中度；大小：中开本 |
| `it_miji_tiebushan` | 铁布衫秘籍 | 秘籍·全本 | 地 | 民间横练名目；本作 **（原创扩展）** | `grade=7; skill=sk_tiebushan; variant=full; maxLayer=10` | 清代土黄厚纸线装册，四眼褐线、布包角，右上白纸签、墨楷，重旧 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_dajingangzhang` | 大金刚掌秘籍 | 秘籍·全本 | 地 | 金庸作品少林武学 **（待考：核“大金刚掌/大力金刚掌”用名）**；载体 **（原创扩展）** | `grade=7; skill=sk_dajingangzhang; variant=full; maxLayer=10` | 明末深赭线装册，四眼褐线、金泥窄边，居中米白纸签、端楷，轻旧 **（原创扩展）**；旧化程度：轻度；大小：中开本 |
| `it_miji_longzhaoshou` | 龙爪手秘本 | 秘籍·全本 | 地 | 《倚天屠龙记》·少林龙爪手；载体 **（原创扩展）** | `grade=8; skill=sk_longzhaoshou; variant=full; maxLayer=10` | 元代暗金棕包背薄册，黑布护脊，右上黄纸签、墨楷，书衣压爪痕浅纹 **（原创扩展）**；旧化程度：中度；大小：中开本 |
| `it_miji_canhezhi` | 参合指藏本 | 秘籍·残本 | 地 | 《天龙八部》·慕容氏武学；藏本 **（原创扩展）** | `grade=8; skill=sk_canhezhi; variant=partial; maxLayer=7` | 北宋湖蓝蝴蝶装册，绢纸书衣、青布包角，左上牙白绢签、细楷，轻旧 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_baihongzhang` | 白虹掌力藏本 | 秘籍·残本 | 地 | 《天龙八部》·李秋水武学；藏本 **（原创扩展）** | `grade=9; skill=sk_baihongzhang; variant=partial; maxLayer=7` | 北宋月白蝴蝶装薄册，淡虹纤维纸衣，居中浅粉绢签、细楷，页口齐整 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_xisuijing` | 洗髓经藏本 | 秘籍·残本 | 地 | 民间传说名目；本作 **（原创扩展）** | `grade=9; skill=sk_xisuijing; variant=partial; maxLayer=8` | 清代米白经折藏本，灰布护套，首折褐纸签、端楷，重旧 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_jiuyin_shang` | 九阴真经上卷 | 秘籍·原本 | 天 | 《射雕英雄传》·九阴真经上下卷 | `grade=12; skill=sk_jiuyin; variant=original; maxLayer=10; volume=upper` | 南宋墨青蝴蝶装册，柔软纸衣、细线缝缀，居中白绢签配篆隶，轻旧 **（原创扩展装帧）**；旧化程度：轻度；大小：中开本 |
| `it_miji_jiuyin_xia` | 九阴真经下卷 | 秘籍·原本 | 天 | 《射雕英雄传》·九阴真经上下卷 | `grade=12; skill=sk_jiuyin; variant=original; maxLayer=10; volume=lower` | 南宋灰蓝蝴蝶装册，同套薄纸页口，居中白绢签配篆隶，书角稍旧 **（原创扩展装帧）**；旧化程度：轻度；大小：中开本 |
| `it_miji_xianglong18_can` | 降龙十八掌残本 | 秘籍·残本 | 天 | 《倚天屠龙记》·丐帮降龙掌残传；实体 **（原创扩展）** | `grade=12; skill=sk_xianglong18; variant=partial; maxLayer=6` | 元代旧黄包背残册，竹夹板护持，右上残纸签、墨楷，页角缺损 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_dagou_can` | 打狗棒法残谱 | 秘籍·残本 | 天 | 《倚天屠龙记》·丐帮棒法残传；实体 **（原创扩展）** | `grade=11; skill=sk_dagou; variant=partial; maxLayer=6` | 元代墨绿包背残谱，细麻线补缀，左上白绢签、墨隶，竹节纹暗压 **（原创扩展）**；旧化程度：重度；大小：中开本 |
| `it_miji_douzhuan` | 斗转星移藏本 | 秘籍·残本 | 天 | 《天龙八部》·慕容氏绝学；还施水阁载体 **（原创扩展）** | `grade=10; skill=sk_douzhuan; variant=partial; maxLayer=6` | 北宋深蓝绢面蝴蝶装薄册，居中银灰绢签、墨楷，星点仅作纤维斑 **（原创扩展）**；旧化程度：重度；大小：中开本 |

## 1. 原著明确载体与奇书补录（32 项）

> 本节按“小说中实际出现的一件独立书册、经卷、图谱、刻物或题壁”计数；同一复合载体拆件、后人拓录及未见实体的武学不计。32 行均有原著实体锚点；题签、装帧复原和游戏投放仍属 **（原创扩展）**。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_miji_yijinjing` | 易筋经梵文原本 | 秘籍·原本 | 天 | 《天龙八部》·阿朱从少林取得的梵文黄纸经本；经名与神足经关系 **（待考：核三联／广州修订版）** | `grade=12; skill=sk_yijinjing; variant=original; maxLayer=10` | 北宋窄幅旧黄纸经折本，褐布护面、棉带束合，首折朱框纸签、梵汉端楷，边缘重旧 **（原创扩展装帧）**；旧化程度：重度；大小：中开本 |
| `it_miji_kuihua` | 葵花宝典传本 | 秘籍·抄本 | 天 | 《笑傲江湖》·任我行手持一本册子并明言即《葵花宝典》 | `grade=11; skill=sk_kuihua; variant=copy; maxLayer=10` | 明代深紫纸衣线装薄册，四眼红丝线，居中金黄绢签、细楷，窄长开本、翻角明显 **（原创扩展装帧）**；旧化程度：中度；大小：中型长开本 |
| `it_miji_bixie` | 辟邪剑谱袈裟原本 | 秘籍·原本 | 天 | 《笑傲江湖》·林家老宅袈裟所录剑谱 | `grade=10; skill=sk_bixie; variant=original; maxLayer=10` | 明代暗红旧袈裟折成长方包袱状，布边磨白，正中米色布签、墨楷，无金光与血迹；旧化程度：中度；大小：中型包袱 |
| `it_miji_beiming` | 北冥神功帛卷原本 | 秘籍·原本 | 天 | 《天龙八部》·无量山洞帛卷 | `grade=12; skill=sk_beiming; variant=original; maxLayer=6` | 北宋白绢长卷绕木轴，绢色泛黄，卷首青绫隔水、右端窄绢签配小楷，卷边轻裂；旧化程度：中度；大小：中型长卷 |
| `it_miji_xixing` | 吸星大法铁板原刻 | 秘籍·原本 | 天 | 《笑傲江湖》·任我行刻在梅庄地牢铁板上的秘诀 | `grade=11; skill=sk_xixing; variant=original; maxLayer=10` | 明代乌黑厚铁板，表面錾刻行气文字与划线，右上嵌窄铜题签、阴刻隶书，锈斑与磨痕自然，约二尺见方；旧化程度：中度；大小：二尺见方铁板 |
| `it_miji_shenghuoling` | 圣火令武功原刻 | 秘籍·原本 | 天 | 《倚天屠龙记》·六枚圣火令刻有霍山毕生武功精要；本行登记整组原著刻物，与装备实例 `eq_shenghuoling` 同源 | `grade=10; skill=sk_shenghuoling; variant=original; maxLayer=10` | 元代六枚掌长深黝令牌置黑木匣，弯曲似火焰、表面刻波斯文字与招式线纹，匣盖居中朱绢题签、汉隶，令面摩挲旧痕自然 **（题签与匣装为原创扩展）**；旧化程度：中度；大小：掌长牌组 |
| `it_miji_liumai` | 六脉神剑经丝绢原卷 | 秘籍·原本 | 天 | 《天龙八部》·天龙寺焦黄丝绢卷轴及六幅剑气图 | `grade=12; skill=sk_liumai; variant=original; maxLayer=10` | 北宋焦黄丝绢长卷，竹轴、赭绫包首，卷首白绢题签、端楷，六幅经脉图分段悬展、边缘重旧；旧化程度：重度；大小：中型长卷 |
| `it_miji_jiuyang` | 九阳真经夹注原本 | 秘籍·原本 | 天 | 《倚天屠龙记》·写在《楞伽经》夹缝中的经文 | `grade=12; skill=sk_jiuyang; variant=original; maxLayer=10` | 四册元代经折本置蓝布函套，旧麻纸泛黄，函面居中白绢签、墨楷，书口有虫蛀；旧化程度：重度；大小：中开本 |
| `it_miji_qiankun` | 乾坤大挪移羊皮原本 | 秘籍·原本 | 天 | 《倚天屠龙记》·明教密道羊皮载体 | `grade=11; skill=sk_qiankun; variant=original; maxLayer=10` | 元代淡褐薄羊皮折页，黑皮绳束缚，外包暗红棉布，布面米色绢签、隶书，边缘干裂；旧化程度：重度；大小：中型折页 |
| `it_miji_taixuan` | 太玄经石壁图解 | 秘籍·抄本 | 天 | 《侠客行》·侠客岛二十四石室题诗与图解；本作以不可携地点载体登记 | `grade=12; skill=sk_taixuan; variant=copy; maxLayer=8` | 唐代海岛石室壁面局部，灰青石上阴刻诗句、经脉线与人形，入口旁嵌白石题签、隶书，潮蚀自然、约六尺宽；旧化程度：中度；大小：大型固定壁面 |
| `it_miji_luohanfumo_can` | 罗汉伏魔神功泥人图 | 秘籍·残本 | 天 | 《侠客行》·十八泥人所绘穴位与经脉线路；本行登记整组原著实物 | `grade=10; skill=sk_luohanfumo; variant=partial; maxLayer=6` | 清代十八尊掌高泥人置旧木匣，黑彩穴点、红线经脉，匣盖居中白纸题签、墨楷，泥面细裂、边角磨旧；旧化程度：重度；大小：掌高匣装组 |
| `it_miji_jinshejian` | 金蛇秘笈原本 | 秘籍·原本 | 天 | 《碧血剑》·夏雪宜遗留金蛇秘笈 | `grade=10; skill=sk_jinshejian; variant=original; maxLayer=10` | 明末薄黄竹纸线装册，墨绿丝线、黑布包角，居中金黄纸签、峭劲楷书，洞藏潮斑；旧化程度：中度；大小：中开本 |
| `it_miji_hujiadao_can` | 胡家刀谱残本 | 秘籍·残本 | 天 | 《飞狐外传》《雪山飞狐》·刀谱缺首二页 | `grade=10; skill=sk_hujiadao; variant=partial; maxLayer=8` | 清代青布书衣四眼线装，前部缺页露线，右上旧白纸签、墨楷，雪水晕痕、八寸开本；旧化程度：重度；大小：八寸开本 |
| `it_miji_tangshijian` | 唐诗剑谱原本 | 秘籍·原本 | 地 | 《连城诀》·唐诗剑谱承载剑法与密码 | `grade=8; skill=sk_tangshijian; variant=original; maxLayer=10` | 清代藏蓝线装册，四眼麻线、白纸包角，右上米纸签、馆阁楷书，页边反复翻黑；旧化程度：中度；大小：中开本 |
| `it_miji_xuedaojing` | 血刀经原本 | 秘籍·原本 | 地 | 《连城诀》·逐页图谱所载血刀门内功外功总诀 | `grade=9; skill=sk_xuedaojing; variant=original; maxLayer=10` | 清代暗红布面线装册，黑麻线，居中黄绢签、粗楷，封角磨损、书口暗褐 **（原创扩展装帧）**；旧化程度：中度；大小：中开本 |
| `it_miji_wuxiangjiezhi` | 无相劫指谱古本 | 秘籍·抄本 | 地 | 《天龙八部》·萧远山在少林藏经阁找到“一本无相劫指谱” | `grade=9; skill=sk_wuxiangjiezhi; variant=copy; maxLayer=8` | 北宋旧黄纸蝴蝶装册，褐绢包角、细麻缝缀，居中白纸题签、端楷，书口发黑、约八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_qishangquan` | 七伤拳谱古抄本 | 秘籍·抄本 | 地 | 《倚天屠龙记》·谢逊夺得《七伤拳谱》古抄本 | `grade=9; skill=sk_qishangquan; variant=copy; maxLayer=8` | 元代土黄纸包背厚册，黑麻护脊，居中白纸题签、隶书，页口有反复翻阅与校改墨痕；旧化程度：中度；大小：中开本 |
| `it_miji_boruozhang` | 般若掌法古本 | 秘籍·全本 | 地 | 《天龙八部》·少林藏经楼三部黄黑旧经籍之一，原文名《般若掌法》 | `grade=8; skill=sk_boruozhang; variant=full; maxLayer=10` | 北宋黄黑麻纸蝴蝶装册，褐布书衣、细线缝缀，居中米纸题签、端楷，纸面斑驳、九寸开本；旧化程度：中度；大小：九寸开本 |
| `it_miji_qihuangmifa` | 胡青牛医经手本 | 秘籍·抄本 | 地 | 《倚天屠龙记》·胡青牛赠张无忌的一部手写医书；本作映射岐黄秘法 **（原创扩展映射）** | `grade=8; skill=sk_qihuangmifa; variant=copy; maxLayer=8` | 元代旧黄纸包背医书，蓝布护脊、棉线补缀，右上白纸题签、小楷，页间药渍与针法图自然旧化；旧化程度：中度；大小：中开本 |
| `it_miji_baidubianzheng` | 王难姑毒经抄本 | 秘籍·抄本 | 地 | 《倚天屠龙记》·题签写书名的手写黄纸抄本；本作映射百毒辨证 **（原创扩展映射）** | `grade=8; skill=sk_baidubianzheng; variant=copy; maxLayer=8` | 元代黄纸包背抄本，褐布护脊、细麻补线，右上白纸题签、蝇头小楷，页缘药污、掌心略大；旧化程度：中度；大小：掌心开本 |
| `it_miji_zixiashengong` | 紫霞秘笈传本 | 秘籍·抄本 | 地 | 《笑傲江湖》·劳德诺怀中掉出题有“紫霞秘笈”的册子 | `grade=9; skill=sk_zixiashengong; variant=copy; maxLayer=8` | 明代紫灰纸衣线装册，四眼蓝线，右上淡紫绢题签、小楷，薄册藏于素布套、边角轻旧 **（原创扩展装帧）**；旧化程度：轻度；大小：中开本 |
| `it_miji_yaowangdujing` | 无嗔医药录原本 | 秘籍·原本 | 地 | 《飞狐外传》·六寸长、四寸宽黄纸书，封皮题《无嗔医药录》，门人称《药王神篇》 | `grade=8; skill=sk_yaowangdujing; variant=original; maxLayer=10` | 清代六寸乘四寸黄纸线装小书，外裹布包与油纸，白棉线，封皮居中黄绢题签、端楷，书口轻旧；旧化程度：轻度；大小：六寸×四寸 |
| `it_miji_nianhuazhi` | 拈花指法钞本 | 秘籍·抄本 | 地 | 《天龙八部》·慕容博从少林藏经阁取出钞本并另行钞录 | `grade=9; skill=sk_nianhuazhi; variant=copy; maxLayer=8` | 北宋旧黄纸蝴蝶装钞本，灰褐纸衣、细麻缝缀，居中白纸题签、端楷，墨色深浅不一、八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_fumozhangfa` | 伏魔杖法古册 | 秘籍·抄本 | 地 | 《天龙八部》·萧远山在少林藏经阁取到“一册伏魔杖法” | `grade=8; skill=sk_fumozhangfa; variant=copy; maxLayer=8` | 北宋黄黑麻纸蝴蝶装册，褐布包角、细线缝缀，右上白纸题签、墨楷，书口发黑、九寸开本；旧化程度：中度；大小：九寸开本 |
| `it_miji_dajingangquan` | 大金刚拳神功古籍 | 秘籍·抄本 | 地 | 《天龙八部》·少林藏经楼三部黄黑旧经籍之一，原文名《大金刚拳神功》 | `grade=7; skill=sk_dajingangquan; variant=copy; maxLayer=8` | 北宋黄黑麻纸蝴蝶装厚册，靛布包角、细麻缝缀，居中米纸题签、端楷，序跋页磨旧、九寸开本；旧化程度：中度；大小：九寸开本 |
| `it_miji_mohezhi` | 摩诃指秘要古籍 | 秘籍·抄本 | 地 | 《天龙八部》·少林藏经楼三部黄黑旧经籍之一，原文名《摩诃指秘要》 | `grade=7; skill=sk_mohezhi; variant=copy; maxLayer=8` | 北宋黄黑麻纸蝴蝶装薄册，灰布书衣、细线缝缀，右上白纸题签、小楷，纸边毛化、八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_wudumichuan` | 五毒秘传抄本 | 秘籍·抄本 | 玄 | 《神雕侠侣》·陆无双携带并交杨过翻阅的一册殷红封皮抄本 | `grade=6; skill=sk_wudumichuan; variant=copy; maxLayer=8` | 南宋殷红纸衣蝴蝶装小册，黑麻缝缀，居中白纸题签、细楷，书边轻磨、约六寸开本；旧化程度：轻度；大小：小开本 |
| `it_miji_xiaoaojianghuqu` | 笑傲江湖曲谱手本 | 秘籍·抄本 | 玄 | 《笑傲江湖》·曲洋从怀中取出册子，明言为琴谱箫谱并托付令狐冲 | `grade=6; skill=sk_xiaoaojianghuqu; variant=copy; maxLayer=8` | 明代月白纸经折谱，青绫护面、棉带束合，首折淡黄绢题签、行楷，墨迹浓淡相间、约一尺长 **（原创扩展装帧）**；旧化程度：中度；大小：中开本 |
| `it_miji_tianlongjian` | 天龙门剑谱原本 | 秘籍·原本 | 玄 | 《雪山飞狐》·南北宗轮值交接的天龙门剑谱；本作映射 `sk_tianlongjian` | `grade=6; skill=sk_tianlongjian; variant=original; maxLayer=10` | 清代靛蓝布面线装册，四眼白线、黑布包角，居中浅黄绢题签、端楷，掌门传递留下手汗与边角磨旧；旧化程度：中度；大小：中开本 |
| `it_miji_jiuyinliaoshangpian` | 九阴真经古墓遗刻 | 秘籍·抄本 | 玄 | 《神雕侠侣》·王重阳刻于古墓地下石室顶的真经要旨；本作映射九阴疗伤篇 | `grade=6; skill=sk_jiuyinliaoshangpian; variant=copy; maxLayer=8` | 南宋地下石室顶灰白石刻，密布字迹符号，右缘嵌青石题签、隶书，水汽侵蚀、约六尺见方；旧化程度：中度；大小：大型固定壁面 |
| `it_miji_yitiantulonggong` | 倚天屠龙功王盘山石刻 | 秘籍·原本 | 地 | 《倚天屠龙记》·张翠山在王盘山石壁刻二十四字，笔画中含张三丰所授武功；本作登记不可携地点载体 | `grade=8; skill=sk_yitiantulonggong; variant=original; maxLayer=10` | 元代海岛浅灰巨石壁，二十四个大字依壁竖排、笔画入石，右侧嵌窄青石题签、阴刻隶书，盐蚀与石屑旧痕自然、约一丈宽；旧化程度：中度；大小：大型固定壁面 |
| `it_miji_wumuyishu` | 武穆遗书原本 | 秘籍·原本 | 地 | 《射雕英雄传》·岳飞兵书，属阵法杂学 | `grade=8; skill=sk_wumuyishu; variant=original; maxLayer=10` | 南宋包背装厚册，栗壳色书衣、蓝布函套，居中白绢签、隶书，边缘烟熏与潮斑；旧化程度：中度；大小：中开本 |

## 2. 门派传承本补录（50 本）

> 门派秘本不等于放宽学习条件：身份、职级、前置与取得节点仍由武学图鉴和 `design/12`、`design/17` 校验。除出处明确说明的原著实物外，均为 **（原创扩展）** 载体。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_miji_jinzhongzhao` | 金钟罩秘籍 | 秘籍·全本 | 地 | 少林横练传承；载体 **（原创扩展）** | `grade=8; skill=sk_jinzhongzhao; variant=full; maxLayer=10` | 明代赭黄线装厚册，四眼褐线，居中白绢签、端楷，布包角略磨、九寸开本；旧化程度：轻度；大小：九寸开本 |
| `it_miji_yizhichan` | 一指禅残本 | 秘籍·残本 | 地 | 少林指法传承；载体 **（原创扩展）** | `grade=8; skill=sk_yizhichan; variant=partial; maxLayer=8` | 明代黄麻纸残册，蓝布包背，右上窄纸签、墨楷，末叶残缺、订线重补；旧化程度：重度；大小：中开本 |
| `it_miji_tiebogong_can` | 铁钵功残本 | 秘籍·残本 | 地 | 丐帮传承；载体 **（原创扩展）** | `grade=7; skill=sk_tiebogong; variant=partial; maxLayer=7` | 明末土黄竹纸册，粗麻线补订，右上褐纸签、隶书，封面留铁钵压痕；旧化程度：重度；大小：中开本 |
| `it_miji_chilianshenzhang_can` | 赤练神掌残本 | 秘籍·残本 | 地 | 古墓李莫愁一系；载体 **（原创扩展）** | `grade=7; skill=sk_chilianshenzhang; variant=partial; maxLayer=7` | 南宋灰白纸残册，红丝线缝补，居中淡红绢签、小楷，边角有药渍、无血迹；旧化程度：重度；大小：中开本 |
| `it_miji_chunyangwuji` | 纯阳无极功抄本 | 秘籍·抄本 | 地 | 武当传承；载体 **（原创扩展）** | `grade=8; skill=sk_chunyangwuji; variant=copy; maxLayer=8` | 元代靛青包背册，白麻护脊，居中黄绢签、端楷，页口整齐、道观藏印淡褪；旧化程度：中度；大小：中开本 |
| `it_miji_shenmen13` | 神门十三剑抄本 | 秘籍·抄本 | 地 | 武当剑术传承；载体 **（原创扩展）** | `grade=7; skill=sk_shenmen13; variant=copy; maxLayer=8` | 元代墨蓝包背图册，白麻护脊，居中黄纸签、瘦楷，页中留朱点穴位标记；旧化程度：中度；大小：中开本 |
| `it_miji_canfengyinlugong` | 餐风饮露功秘籍 | 秘籍·全本 | 玄 | 丐帮行旅心法 **（原创扩展）** | `grade=4; skill=sk_canfengyinlugong; variant=full; maxLayer=10` | 明代土黄线装小册，粗麻四眼订，右上白纸签、隶书，雨渍与折角明显；旧化程度：中度；大小：小开本 |
| `it_miji_xuanfengsaoyetui` | 旋风扫叶腿修习谱 | 秘籍·全本 | 玄 | 《射雕英雄传》·黄药师赠陆乘风修习法 | `grade=6; skill=sk_xuanfengsaoyetui; variant=full; maxLayer=10` | 南宋蝴蝶装图谱，竹青纸衣、青绫包角，居中白绢签、细楷，页幅宽阔、轻旧化；旧化程度：轻度；大小：中开本 |
| `it_miji_shentuoxueshanzhang` | 神驼雪山掌遗谱 | 秘籍·残本 | 玄 | 白驼山庄传承；载体 **（原创扩展）** | `grade=6; skill=sk_shentuoxueshanzhang; variant=partial; maxLayer=8` | 南宋西域皮纸折册，棕皮护面、绿绳双系，居中白绢签、隶书，风沙磨蚀；旧化程度：重度；大小：中开本 |
| `it_miji_jinguanyusuo` | 金关玉锁二十四诀抄本 | 秘籍·抄本 | 地 | 全真教内功传承；载体 **（原创扩展）** | `grade=8; skill=sk_jinguanyusuo; variant=copy; maxLayer=8` | 南宋青灰蝴蝶装册，白麻纸页，居中月白绢签、细楷，书口齐整、道观藏书轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_gumuqinggong` | 古墓轻功图谱 | 秘籍·全本 | 地 | 古墓派传承；载体 **（原创扩展）** | `grade=9; skill=sk_gumuqinggong; variant=full; maxLayer=10` | 南宋白绢折页图谱，灰绫包首，首折淡青绢签、小楷，折痕柔软、冷湿旧斑；旧化程度：中度；大小：中型折页 |
| `it_miji_kurongchangong` | 枯荣禅功经折本 | 秘籍·全本 | 地 | 大理段氏·天龙寺传承；载体 **（原创扩展）** | `grade=9; skill=sk_kurongchangong; variant=full; maxLayer=10` | 北宋经折装，赭黄硬纸护面、蓝布函套，首折白绢签、端楷，边缘香烟熏黄；旧化程度：中度；大小：中开本 |
| `it_miji_yuxiaojianfa` | 玉箫剑法谱 | 秘籍·全本 | 地 | 桃花岛传承；载体 **（原创扩展）** | `grade=8; skill=sk_yuxiaojianfa; variant=full; maxLayer=10` | 南宋青碧蝴蝶装册，白绢包角，右上月白纸签、行楷，细长开本、页口泛黄；旧化程度：中度；大小：中型长开本 |
| `it_miji_lingshezhangfa` | 灵蛇杖法秘本 | 秘籍·全本 | 地 | 白驼山传承；载体 **（原创扩展）** | `grade=9; skill=sk_lingshezhangfa; variant=full; maxLayer=10` | 南宋西域皮纸册，棕皮软封、绿丝双系，居中黄绢签、隶书，风沙旧痕；旧化程度：中度；大小：中开本 |
| `it_miji_honghuahuiheji` | 红花会合击阵谱 | 秘籍·全本 | 地 | 红花会群像扩写 **（原创扩展）** | `grade=7; skill=sk_honghuahuiheji; variant=full; maxLayer=10` | 清代朱红布面经折图册，黑绳束带，首折白绢签、隶书，展开约三尺、多人翻阅旧痕；旧化程度：中度；大小：三尺级长卷 |
| `it_miji_wuxingqizhen` | 五行旗阵图谱 | 秘籍·全本 | 地 | 明教五行旗传承 **（原创扩展）** | `grade=8; skill=sk_wuxingqizhen; variant=full; maxLayer=10` | 元代经折阵图，五色页签只作分段，首折白绢签、隶书，棕布函套、重旧；旧化程度：重度；大小：中开本 |
| `it_miji_qishangquan_can` | 七伤拳残本 | 秘籍·残本 | 地 | 崆峒传承；载体 **（原创扩展）** | `grade=9; skill=sk_qishangquan; variant=partial; maxLayer=7` | 元代土黄包背残册，粗麻补线，右上残白纸签、隶书，前后各缺数叶；旧化程度：重度；大小：中开本 |
| `it_miji_huashanjianfa` | 华山剑法抄本 | 秘籍·抄本 | 玄 | 华山气宗传承 **（原创扩展）** | `grade=6; skill=sk_huashanjianfa; variant=copy; maxLayer=8` | 明代青灰线装册，四眼白线，右上淡黄纸签、行楷，书口有练剑手汗痕；旧化程度：中度；大小：中开本 |
| `it_miji_songshanjianfa` | 嵩山剑法全本 | 秘籍·全本 | 玄 | 嵩山派传承 **（原创扩展）** | `grade=6; skill=sk_songshanjianfa; variant=full; maxLayer=10` | 明代石青布面线装册，黑线四眼订，居中白绢签、隶书，厚实方正、轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_taishanjianfa` | 泰山剑法全本 | 秘籍·全本 | 玄 | 泰山派传承 **（原创扩展）** | `grade=6; skill=sk_taishanjianfa; variant=full; maxLayer=10` | 明代灰褐线装图册，蓝麻线，右上米纸签、端楷，封角磨白、九寸开本；旧化程度：中度；大小：九寸开本 |
| `it_miji_huifengluoyan` | 回风落雁剑谱 | 秘籍·全本 | 玄 | 衡山派剑术；载体 **（原创扩展）** | `grade=6; skill=sk_huifengluoyan; variant=full; maxLayer=10` | 明代云灰线装薄册，白丝四眼订，居中浅蓝绢签、行楷，纸纹自然如雾；旧化程度：中度；大小：中开本 |
| `it_miji_hengshanbeijianfa` | 恒山剑法抄本 | 秘籍·抄本 | 玄 | 恒山派传承 **（原创扩展）** | `grade=6; skill=sk_hengshanbeijianfa; variant=copy; maxLayer=8` | 明代月白线装册，青线四眼订，右上素绢签、小楷，洁净克制、边角轻磨；旧化程度：轻度；大小：中开本 |
| `it_miji_riyuexinfa` | 日月心法秘本 | 秘籍·全本 | 玄 | 日月神教传承 **（原创扩展）** | `grade=6; skill=sk_riyuexinfa; variant=full; maxLayer=10` | 明代黑漆布面线装册，红丝线，居中金黄绢签、隶书，书口暗红、边角轻磨；旧化程度：轻度；大小：中开本 |
| `it_miji_songfengjianfa` | 松风剑法全本 | 秘籍·全本 | 玄 | 《笑傲江湖》·青城派剑法；载体 **（原创扩展）** | `grade=6; skill=sk_songfengjianfa; variant=full; maxLayer=10` | 明代松绿色线装册，四眼灰线，居中米白纸签、瘦楷，封面木纹压纹、轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_wuxianduzhang` | 五仙毒掌抄本 | 秘籍·抄本 | 玄 | 五仙教传承 **（原创扩展）** | `grade=6; skill=sk_wuxianduzhang; variant=copy; maxLayer=8` | 明代暗绿皮纸软册，红线双订，右上黄纸签、苗地风格楷书，页边药渍斑驳；旧化程度：中度；大小：中开本 |
| `it_miji_guangmingxinfa` | 光明心法全本 | 秘籍·全本 | 玄 | 明教传承 **（原创扩展）** | `grade=6; skill=sk_guangmingxinfa; variant=full; maxLayer=10` | 元代赭红包背册，黄绫护脊，居中白绢签、隶书，纸页厚韧、火烟轻熏；旧化程度：中度；大小：中开本 |
| `it_miji_emeixinfa` | 峨眉心法抄本 | 秘籍·抄本 | 玄 | 峨眉派传承 **（原创扩展）** | `grade=6; skill=sk_emeixinfa; variant=copy; maxLayer=8` | 元代灰蓝包背册，白麻护脊，右上月白纸签、小楷，页口整洁、轻旧化；旧化程度：轻度；大小：中开本 |
| `it_miji_jindingjiushi` | 金顶九式剑谱 | 秘籍·全本 | 玄 | 峨眉派传承 **（原创扩展）** | `grade=6; skill=sk_jindingjiushi; variant=full; maxLayer=10` | 元代经折图册，淡黄硬纸护面，首折白绢签、端楷，折口微磨、九寸开本；旧化程度：轻度；大小：九寸开本 |
| `it_miji_kunlunxinfa` | 昆仑心法抄本 | 秘籍·抄本 | 玄 | 昆仑派传承 **（原创扩展）** | `grade=5; skill=sk_kunlunxinfa; variant=copy; maxLayer=8` | 元代灰白皮纸包背册，蓝布护脊，居中青纸签、楷书，风沙磨痕、纸页干脆；旧化程度：中度；大小：中开本 |
| `it_miji_yingzhaoshou` | 鹰爪手抄本 | 秘籍·抄本 | 玄 | 天鹰教传承 **（原创扩展）** | `grade=6; skill=sk_yingzhaoshou; variant=copy; maxLayer=8` | 元代深蓝包背小册，黑麻护脊，右上黄纸签、粗楷，封角压羽纹；旧化程度：中度；大小：小开本 |
| `it_miji_dagouzhen` | 打狗阵谱 | 秘籍·全本 | 地 | 丐帮传承；阵谱载体 **（原创扩展）** | `grade=7; skill=sk_dagouzhen; variant=full; maxLayer=10` | 明代墨绿经折阵图册，竹夹板、麻绳束带，首折黄绢签、隶书，多人翻阅重旧；旧化程度：重度；大小：中开本 |
| `it_miji_taohuazhen` | 桃花阵图谱 | 秘籍·全本 | 地 | 桃花岛阵法 **（原创扩展）** | `grade=7; skill=sk_taohuazhen; variant=full; maxLayer=10` | 南宋白绢横卷，青玉色轴头、青绫包首，卷首黄纸签、小篆，展开约五尺；旧化程度：中度；大小：五尺级长卷 |
| `it_miji_nizhuanjingmai_can` | 逆转经脉残本 | 秘籍·残本 | 地 | 《射雕英雄传》相关逆练；成册 **（原创扩展）** | `grade=7; skill=sk_nizhuanjingmai; variant=partial; maxLayer=7` | 南宋灰褐蝴蝶装残册，黑布包角，居中黄纸签、倒书小楷，散页以麻线补缀；旧化程度：重度；大小：中开本 |
| `it_miji_langhuanjian` | 琅嬛剑法图谱 | 秘籍·全本 | 地 | 无量玉壁剑影扩写 **（原创扩展）** | `grade=7; skill=sk_langhuanjian; variant=full; maxLayer=10` | 北宋白绢横卷，青绫隔水、素木轴，卷首月白绢签、细楷，洞藏潮斑、约四尺长；旧化程度：中度；大小：四尺级长卷 |
| `it_miji_piaomiaojian` | 缥缈剑法抄本 | 秘籍·抄本 | 地 | 逍遥派·灵鹫宫传承 **（原创扩展）** | `grade=7; skill=sk_piaomiaojian; variant=copy; maxLayer=8` | 北宋经折图册，月白硬纸护面，首折浅蓝绢签、小楷，折口轻磨、洁净无光；旧化程度：轻度；大小：中开本 |
| `it_miji_wulundazhuan` | 五轮大转图谱 | 秘籍·全本 | 地 | 《神雕侠侣》·金轮法王武学；图谱 **（原创扩展）** | `grade=9; skill=sk_wulundazhuan; variant=full; maxLayer=10` | 南宋藏式经夹装，赭色厚纸、木夹板与棉带，首叶黄绢签、梵汉隶楷，边缘油旧；旧化程度：中度；大小：中开本 |
| `it_miji_yanqingzhang` | 延庆杖法抄本 | 秘籍·抄本 | 地 | 《天龙八部》·段延庆武学；谱本 **（原创扩展）** | `grade=9; skill=sk_yanqingzhang; variant=copy; maxLayer=8` | 北宋细长蝴蝶装册，墨灰书衣，右上白纸签、瘦楷，页口有铁杖压痕；旧化程度：中度；大小：中型长开本 |
| `it_miji_qinlonggong` | 擒龙功秘本 | 秘籍·全本 | 地 | 《天龙八部》·擒龙功；载体 **（原创扩展）** | `grade=9; skill=sk_qinlonggong; variant=full; maxLayer=10` | 北宋赭黄蝴蝶装册，青绫包角，居中白绢签、端楷，宽开本、轻旧化；旧化程度：轻度；大小：中开本 |
| `it_miji_chousuizhang_can` | 抽髓掌残本 | 秘籍·残本 | 地 | 星宿派掌法传承；载体 **（原创扩展）** | `grade=8; skill=sk_chousuizhang; variant=partial; maxLayer=7` | 北宋灰褐蝴蝶装残册，墨绿丝线补订，右上黄纸签、小楷，页边药渍、末叶残缺；旧化程度：重度；大小：中开本 |
| `it_miji_honghuaxinfa` | 红花心法抄本 | 秘籍·抄本 | 玄 | 红花会传承 **（原创扩展）** | `grade=5; skill=sk_honghuaxinfa; variant=copy; maxLayer=8` | 清代朱红线装册，黑麻四眼订，居中白绢签、隶书，书角磨白、会中传阅痕；旧化程度：中度；大小：中开本 |
| `it_miji_tiandihuidao` | 天地会刀谱 | 秘籍·全本 | 玄 | 天地会传承 **（原创扩展）** | `grade=5; skill=sk_tiandihuidao; variant=full; maxLayer=10` | 清代暗红线装图册，四眼黑线，右上黄纸签、粗楷，封边有油污、八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_shaolinxinfa` | 少林心法抄本 | 秘籍·抄本 | 黄 | 少林入门传承 **（原创扩展）** | `grade=2; skill=sk_shaolinxinfa; variant=copy; maxLayer=8` | 明代素黄线装小册，四眼白线，右上米纸签、端楷，纸页洁净、掌心大小；旧化程度：中度；大小：掌心开本 |
| `it_miji_shaolingunfa` | 少林棍法谱 | 秘籍·全本 | 黄 | 少林入门传承 **（原创扩展）** | `grade=2; skill=sk_shaolingunfa; variant=full; maxLayer=10` | 明代赭黄线装图册，粗麻四眼订，居中白纸签、隶书，细长开本、边角轻磨；旧化程度：轻度；大小：中型长开本 |
| `it_miji_quanzhentunajue` | 全真吐纳诀抄本 | 秘籍·抄本 | 黄 | 全真教入门传承 **（原创扩展）** | `grade=2; skill=sk_quanzhentunajue; variant=copy; maxLayer=8` | 南宋灰青蝴蝶装小册，白麻纸页，右上月白纸签、瘦楷，轻旧、掌心大小；旧化程度：轻度；大小：掌心开本 |
| `it_miji_gumuxinfa` | 古墓心法抄本 | 秘籍·抄本 | 黄 | 古墓派入门传承；载体 **（原创扩展）** | `grade=3; skill=sk_gumuxinfa; variant=copy; maxLayer=8` | 南宋月白蝴蝶装薄册，青丝缝缀，居中淡灰绢签、小楷，纸页微潮卷曲；旧化程度：中度；大小：中开本 |
| `it_miji_wudangchangquan` | 武当长拳谱 | 秘籍·全本 | 黄 | 武当入门拳；载体 **（原创扩展）** | `grade=1; skill=sk_wudangchangquan; variant=full; maxLayer=10` | 明代青布线装小册，四眼白线，右上黄纸签、端楷，山门常用本、边角磨圆；旧化程度：中度；大小：小开本 |
| `it_miji_shenghuotunajue` | 圣火吐纳诀抄本 | 秘籍·抄本 | 黄 | 明教入门传承 **（原创扩展）** | `grade=3; skill=sk_shenghuotunajue; variant=copy; maxLayer=8` | 元代赭红包背小册，黄麻护脊，居中白绢签、隶书，火烟熏黄但不焦黑；旧化程度：中度；大小：小开本 |
| `it_miji_emeirumenjian` | 峨眉入门剑谱 | 秘籍·全本 | 黄 | 峨眉派入门传承 **（原创扩展）** | `grade=2; skill=sk_emeirumenjian; variant=full; maxLayer=10` | 元代月白包背图册，青布护脊，右上淡黄纸签、小楷，窄长开本、轻旧；旧化程度：轻度；大小：中型长开本 |
| `it_miji_kunlunrumenjian` | 昆仑入门剑谱 | 秘籍·全本 | 黄 | 昆仑派入门传承 **（原创扩展）** | `grade=3; skill=sk_kunlunrumenjian; variant=full; maxLayer=10` | 元代灰白皮纸包背册，蓝布护脊，居中黄纸签、楷书，风沙磨损、边角干裂；旧化程度：重度；大小：中开本 |
| `it_miji_kongtongrumenquan` | 崆峒入门拳谱 | 秘籍·全本 | 黄 | 崆峒派入门传承 **（原创扩展）** | `grade=3; skill=sk_kongtongrumenquan; variant=full; maxLayer=10` | 元代土黄包背册，粗麻护脊，右上白纸签、隶书，书页厚韧、反复翻旧；旧化程度：中度；大小：中开本 |

## 3. 通用武学本补录（80 本）

> 本节均是对既有通用武学的谱本化 **（原创扩展）**，不主张小说中存在这些实体。`skill`、绝对品阶与前置唯一见 `skills-general.md`；秘籍只提供一种来源，不能跳过前置或书界限制。

### 3.1 玄阶通用谱本（28 本）

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_miji_zhuzhijianfa` | 竹枝剑法原本 | 秘籍·原本 | 玄 | 春秋越地教学传承；谱本 **（原创扩展）** | `grade=6; skill=sk_zhuzhijianfa; variant=original; maxLayer=10` | 春秋青竹简二十四枚，褐牛皮绳双编，首简上端浅绢签、古隶，竹色深黄、三尺卷束；旧化程度：中度；大小：三尺级长卷 |
| `it_miji_baiyuanjianyi_can` | 白猿剑意残本 | 秘籍·残本 | 玄 | 春秋观悟传承；笔录 **（原创扩展）** | `grade=5; skill=sk_baiyuanjianyi; variant=partial; maxLayer=7` | 春秋窄竹简残束，麻绳补编，外束灰白绢签、古隶，缺六简、竹节开裂；旧化程度：重度；大小：中型简束 |
| `it_miji_yueyingshenfa` | 越影身法帛卷 | 秘籍·全本 | 玄 | 春秋山野教学传承；帛卷 **（原创扩展）** | `grade=4; skill=sk_yueyingshenfa; variant=full; maxLayer=10` | 春秋浅褐帛卷，乌木细轴、麻带束缚，卷端素帛签、篆隶，边缘毛化、约二尺；旧化程度：中度；大小：二尺级卷束 |
| `it_miji_tianwangbuxin` | 天王补心针抄本 | 秘籍·抄本 | 玄 | 北宋蓬莱传承；抄本 **（原创扩展）** | `grade=6; skill=sk_tianwangbuxin; variant=copy; maxLayer=8` | 北宋月白蝴蝶装薄册，青绫包角，右上黄纸签、小楷，细长针谱开本、轻旧；旧化程度：轻度；大小：中型长开本 |
| `it_miji_duanzhenqiang` | 断阵枪谱全本 | 秘籍·全本 | 玄 | 军中通行武学；谱本 **（原创扩展）** | `grade=6; skill=sk_duanzhenqiang; variant=full; maxLayer=10` | 南宋赭黄蝴蝶装长册，蓝布包角，居中白绢签、隶书，枪势图页宽阔、边缘磨旧；旧化程度：中度；大小：中型长开本 |
| `it_miji_junzhongdao` | 军中刀法抄本 | 秘籍·抄本 | 玄 | 军中通行武学；抄本 **（原创扩展）** | `grade=6; skill=sk_junzhongdao; variant=copy; maxLayer=8` | 南宋土黄蝴蝶装册，粗麻缝线，右上白纸签、楷书，书衣油旧、约九寸；旧化程度：中度；大小：九寸开本 |
| `it_miji_zhenqijian_can` | 阵旗剑谱残本 | 秘籍·残本 | 玄 | 军中通行武学；残谱 **（原创扩展）** | `grade=6; skill=sk_zhenqijian; variant=partial; maxLayer=7` | 南宋灰蓝蝴蝶装残册，红麻线补缀，左上残绢签、隶书，缺末叶、旗图墨色淡褪；旧化程度：重度；大小：中开本 |
| `it_miji_bianshe` | 边塞射法全本 | 秘籍·全本 | 玄 | 军中通行武学；谱本 **（原创扩展）** | `grade=5; skill=sk_bianshe; variant=full; maxLayer=10` | 元代灰褐包背长册，黑布护脊，右上黄纸签、粗楷，皮纸夹页、风沙磨痕；旧化程度：中度；大小：中型长开本 |
| `it_miji_jundituna` | 军旅吐纳抄本 | 秘籍·抄本 | 玄 | 军中通行武学；抄本 **（原创扩展）** | `grade=5; skill=sk_jundituna; variant=copy; maxLayer=8` | 明代土黄线装小册，四眼黑线，居中白纸签、端楷，汗渍与折角明显；旧化程度：中度；大小：小开本 |
| `it_miji_xingjunbu_can` | 行军步残本 | 秘籍·残本 | 玄 | 军中通行武学；残谱 **（原创扩展）** | `grade=5; skill=sk_xingjunbu; variant=partial; maxLayer=7` | 清代灰布面线装残册，粗麻四眼订，右上米纸签、行楷，泥点旧痕、末页缺损；旧化程度：重度；大小：中开本 |
| `it_miji_jiebiaodaofa` | 解镖刀法原本 | 秘籍·原本 | 玄 | 镖局通行武学；原稿 **（原创扩展）** | `grade=6; skill=sk_jiebiaodaofa; variant=original; maxLayer=10` | 明代靛青线装册，四眼白线、黑布包角，居中黄绢签、端楷，书口整齐、轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_lianhuanqiang` | 连环镖枪抄本 | 秘籍·抄本 | 玄 | 镖局通行武学；抄本 **（原创扩展）** | `grade=5; skill=sk_lianhuanqiang; variant=copy; maxLayer=8` | 清代赭红线装长册，四眼麻线，右上白纸签、楷书，车队灰尘与卷角明显；旧化程度：中度；大小：中型长开本 |
| `it_miji_huweijian` | 护围剑谱全本 | 秘籍·全本 | 玄 | 镖局通行武学；谱本 **（原创扩展）** | `grade=5; skill=sk_huweijian; variant=full; maxLayer=10` | 明代青布面线装册，四眼蓝线，居中米纸签、行楷，封角轻磨、八寸开本；旧化程度：轻度；大小：八寸开本 |
| `it_miji_jindunxinfa_can` | 金盾心法残本 | 秘籍·残本 | 玄 | 镖局通行武学；残本 **（原创扩展）** | `grade=4; skill=sk_jindunxinfa; variant=partial; maxLayer=7` | 清代黄褐线装残册，黑麻补订，右上残白纸签、隶书，水渍侵页、封边磨白；旧化程度：重度；大小：中开本 |
| `it_miji_tanluobu` | 探路步抄本 | 秘籍·抄本 | 玄 | 镖局通行武学；抄本 **（原创扩展）** | `grade=4; skill=sk_tanluobu; variant=copy; maxLayer=8` | 清代灰青线装小册，四眼白线，左上黄纸签、行楷，地图夹痕与雨斑明显；旧化程度：中度；大小：小开本 |
| `it_miji_feihuangshi` | 飞蝗石图谱 | 秘籍·全本 | 玄 | 镖局通行暗器；图谱 **（原创扩展）** | `grade=4; skill=sk_feihuangshi; variant=full; maxLayer=10` | 明代窄幅经折图谱，土黄硬纸护面，首折青纸签、小楷，页边石粉灰痕、轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_tongbeijin` | 通背劲原本 | 秘籍·原本 | 玄 | 市镇武馆通行武学；原稿 **（原创扩展）** | `grade=6; skill=sk_tongbeijin; variant=original; maxLayer=10` | 南宋赭黄蝴蝶装册，青绫包角，居中白绢签、端楷，宽开本、手汗旧痕；旧化程度：中度；大小：中开本 |
| `it_miji_tantui_tongxing` | 弹腿通行谱抄本 | 秘籍·抄本 | 玄 | 市镇武馆通行武学；抄本 **（原创扩展）** | `grade=6; skill=sk_tantui_tongxing; variant=copy; maxLayer=8` | 元代灰蓝包背图册，黑布护脊，右上黄纸签、楷书，腿势长图多折、边口磨白；旧化程度：中度；大小：中开本 |
| `it_miji_wuhuduandandao` | 五虎断门刀民间谱 | 秘籍·全本 | 玄 | 市镇武馆通行武学；谱本 **（原创扩展）** | `grade=5; skill=sk_wuhuduandandao; variant=full; maxLayer=10` | 明代深赭线装图册，四眼黑线，居中白绢签、粗楷，封面压虎纹暗线；旧化程度：中度；大小：中开本 |
| `it_miji_qimeigun_can` | 齐眉棍谱残本 | 秘籍·残本 | 玄 | 市镇武馆通行武学；残谱 **（原创扩展）** | `grade=5; skill=sk_qimeigun; variant=partial; maxLayer=7` | 明代细长竹纸残册，粗麻线补订，右上旧黄纸签、隶书，封角开裂、重旧；旧化程度：重度；大小：中型长开本 |
| `it_miji_wuguanxinfa` | 武馆心法抄本 | 秘籍·抄本 | 玄 | 市镇武馆通行武学；抄本 **（原创扩展）** | `grade=4; skill=sk_wuguanxinfa; variant=copy; maxLayer=8` | 清代青灰线装小册，四眼白线，居中米纸签、端楷，常用本页角磨圆；旧化程度：中度；大小：小开本 |
| `it_miji_lianhuanjian` | 连环剑谱全本 | 秘籍·全本 | 玄 | 市镇武馆通行武学；谱本 **（原创扩展）** | `grade=4; skill=sk_lianhuanjian; variant=full; maxLayer=10` | 明代月白线装册，四眼青线，右上淡黄纸签、行楷，剑势折页齐整、轻旧；旧化程度：轻度；大小：中型折页 |
| `it_miji_duandashou` | 短打手抄本 | 秘籍·抄本 | 玄 | 市镇武馆通行擒拿；抄本 **（原创扩展）** | `grade=4; skill=sk_duandashou; variant=copy; maxLayer=8` | 清代土黄线装小册，黑麻双订，居中白纸签、楷书，掌心开本、指印旧痕；旧化程度：中度；大小：掌心开本 |
| `it_miji_liuxingchui` | 流星锤图谱原本 | 秘籍·原本 | 玄 | 江湖通行奇门兵器；原稿 **（原创扩展）** | `grade=5; skill=sk_liuxingchui; variant=original; maxLayer=10` | 明代长幅经折图谱，墨蓝硬纸护面，首折金黄绢签、隶书，链锤路线朱线勾勒；旧化程度：中度；大小：中开本 |
| `it_miji_wuyingshou_can` | 无影手残本 | 秘籍·残本 | 玄 | 江湖通行擒拿；残本 **（原创扩展）** | `grade=5; skill=sk_wuyingshou; variant=partial; maxLayer=7` | 清代灰褐线装残册，四眼黑线，右上残绢签、小楷，前叶缺角、指翻油旧；旧化程度：重度；大小：中开本 |
| `it_miji_jianghutuna` | 江湖吐纳全本 | 秘籍·全本 | 玄 | 江湖散人通行内功；谱本 **（原创扩展）** | `grade=5; skill=sk_jianghutuna; variant=full; maxLayer=10` | 元代灰白包背册，蓝布护脊，居中黄纸签、端楷，纸页厚韧、轻度潮斑；旧化程度：轻度；大小：中开本 |
| `it_miji_xingqizhou` | 行气走抄本 | 秘籍·抄本 | 玄 | 江湖散人通行轻功；抄本 **（原创扩展）** | `grade=5; skill=sk_xingqizhou; variant=copy; maxLayer=8` | 明代浅青线装薄册，白线四眼订，右上米纸签、行楷，步位小图密集、边角轻磨；旧化程度：轻度；大小：中开本 |
| `it_miji_tongrenhenglian` | 铜人横练抄本 | 秘籍·抄本 | 玄 | 少林横练通传；载体 **（原创扩展）** | `grade=6; skill=sk_tongrenhenglian; variant=copy; maxLayer=8` | 明代赭黄线装厚册，四眼黑线，居中白绢签、隶书，布包角与汗渍重旧；旧化程度：重度；大小：中开本 |

### 3.2 黄阶通用谱本（52 本）

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_miji_yuezu_duanjian` | 越卒短剑简谱 | 秘籍·全本 | 黄 | 春秋越军教学传承；简谱 **（原创扩展）** | `grade=3; skill=sk_yuezu_duanjian; variant=full; maxLayer=10` | 春秋青竹简十八枚，麻绳双编，首简上端白绢签、古隶，竹色浅黄、约二尺卷束；旧化程度：中度；大小：二尺级卷束 |
| `it_miji_shanyetuna` | 山野吐纳帛本 | 秘籍·原本 | 黄 | 春秋山民教学传承；帛本 **（原创扩展）** | `grade=3; skill=sk_shanyetuna; variant=original; maxLayer=10` | 春秋米白帛卷，素木细轴、麻带束缚，卷端青帛签、古隶，烟熏泛黄、尺幅小；旧化程度：中度；大小：小开本 |
| `it_miji_muyangzhang` | 牧羊杖法简谱 | 秘籍·全本 | 黄 | 春秋山野教学传承；简谱 **（原创扩展）** | `grade=2; skill=sk_muyangzhang; variant=full; maxLayer=10` | 春秋窄竹简十二枚，草绳双编，首简白帛签、古隶，泥点旧痕、细长卷束；旧化程度：中度；大小：中型长开本 |
| `it_miji_xijiantoubu_can` | 溪涧投步残卷 | 秘籍·残本 | 黄 | 春秋山野教学传承；帛卷 **（原创扩展）** | `grade=1; skill=sk_xijiantoubu; variant=partial; maxLayer=7` | 春秋灰白残帛卷，无轴、麻带束起，卷端淡黄帛签、篆隶，水渍与毛边明显；旧化程度：重度；大小：中型长卷 |
| `it_miji_fengshitoushu` | 风石投术简谱 | 秘籍·全本 | 黄 | 春秋越地教学暗器；简谱 **（原创扩展）** | `grade=1; skill=sk_fengshitoushu; variant=full; maxLayer=10` | 春秋细竹简十枚，麻绳单编，首简白帛签、古隶，石粉灰痕、约一尺半；旧化程度：中度；大小：一尺半卷束 |
| `it_miji_penglairumenquan` | 蓬莱入门拳抄本 | 秘籍·抄本 | 黄 | 北宋蓬莱入门传承；抄本 **（原创扩展）** | `grade=2; skill=sk_penglairumenquan; variant=copy; maxLayer=8` | 北宋浅蓝蝴蝶装小册，白绢包角，右上米纸签、小楷，潮斑轻微、掌心开本；旧化程度：轻度；大小：掌心开本 |
| `it_miji_haifengbu` | 海风步全本 | 秘籍·全本 | 黄 | 北宋蓬莱入门传承；谱本 **（原创扩展）** | `grade=3; skill=sk_haifengbu; variant=full; maxLayer=10` | 北宋白麻纸横卷，青绫隔水、素木轴，卷首黄纸签、行楷，边缘盐霜旧痕；旧化程度：中度；大小：中型长卷 |
| `it_miji_changqiangrumen` | 长枪入门谱 | 秘籍·全本 | 黄 | 军中通行武学；谱本 **（原创扩展）** | `grade=3; skill=sk_changqiangrumen; variant=full; maxLayer=10` | 南宋赭黄蝴蝶装长册，蓝麻缝线，右上白纸签、隶书，枪势图页宽、边角磨旧；旧化程度：中度；大小：中型长开本 |
| `it_miji_junwuduandao` | 军伍短刀抄本 | 秘籍·抄本 | 黄 | 军中通行武学；抄本 **（原创扩展）** | `grade=3; skill=sk_junwuduandao; variant=copy; maxLayer=8` | 明代土黄线装册，四眼黑线，居中白纸签、粗楷，书衣油旧、八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_gongshou_can` | 弓手法残本 | 秘籍·残本 | 黄 | 军中通行射法；残谱 **（原创扩展）** | `grade=2; skill=sk_gongshou; variant=partial; maxLayer=7` | 元代灰褐包背残册，皮条护脊，左上残纸签、隶书，箭羽压痕、缺末叶；旧化程度：重度；大小：中开本 |
| `it_miji_bubingcao` | 步兵操全本 | 秘籍·全本 | 黄 | 军中通行拳操；谱本 **（原创扩展）** | `grade=2; skill=sk_bubingcao; variant=full; maxLayer=10` | 清代土黄线装小册，粗麻四眼订，居中米纸签、楷书，泥点与折角明显；旧化程度：中度；大小：小开本 |
| `it_miji_junzhangtuna` | 军帐吐纳抄本 | 秘籍·抄本 | 黄 | 军中通行内功；抄本 **（原创扩展）** | `grade=2; skill=sk_junzhangtuna; variant=copy; maxLayer=8` | 清代灰布面线装册，四眼黑线，右上白纸签、端楷，烟熏泛黄、尺幅小；旧化程度：中度；大小：小开本 |
| `it_miji_liezhengbu_can` | 列阵步残本 | 秘籍·残本 | 黄 | 军中通行轻功；残谱 **（原创扩展）** | `grade=1; skill=sk_liezhengbu; variant=partial; maxLayer=7` | 明代赭灰线装残册，麻线补订，右上残黄纸签、行楷，泥水斑与撕页明显；旧化程度：重度；大小：中开本 |
| `it_miji_biaojurumen` | 镖局入门刀谱 | 秘籍·全本 | 黄 | 镖局通行武学；谱本 **（原创扩展）** | `grade=3; skill=sk_biaojurumen; variant=full; maxLayer=10` | 明代暗红线装图册，四眼黑线，居中黄纸签、粗楷，封角磨白、九寸开本；旧化程度：中度；大小：九寸开本 |
| `it_miji_biaojuqiangfa_can` | 镖局枪法残本 | 秘籍·残本 | 黄 | 镖局通行武学；残谱 **（原创扩展）** | `grade=2; skill=sk_biaojuqiangfa; variant=partial; maxLayer=7` | 清代赭黄线装长册，麻线补缀，居中残白纸签、行楷，末页缺损、书脊松动；旧化程度：重度；大小：中型长开本 |
| `it_miji_huyuanquan` | 护院拳谱全本 | 秘籍·全本 | 黄 | 镖局护院通行武学；谱本 **（原创扩展）** | `grade=2; skill=sk_huyuanquan; variant=full; maxLayer=10` | 明代灰褐线装小册，四眼蓝线，右上黄纸签、楷书，掌印油旧、八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_zhuangxingong` | 壮行功抄本 | 秘籍·抄本 | 黄 | 镖局护院通行内功；抄本 **（原创扩展）** | `grade=2; skill=sk_zhuangxingong; variant=copy; maxLayer=8` | 清代靛青布面线装册，四眼白线，居中米纸签、端楷，汗渍与雨斑轻微；旧化程度：轻度；大小：中开本 |
| `it_miji_ganyebu` | 赶夜步全本 | 秘籍·全本 | 黄 | 镖局通行轻功；谱本 **（原创扩展）** | `grade=1; skill=sk_ganyebu; variant=full; maxLayer=10` | 清代墨蓝线装薄册，黑线四眼订，右上白纸签、行楷，灯油斑与折角明显；旧化程度：中度；大小：中开本 |
| `it_miji_changquanrumen` | 长拳入门谱 | 秘籍·全本 | 黄 | 市镇武馆通行武学；谱本 **（原创扩展）** | `grade=3; skill=sk_changquanrumen; variant=full; maxLayer=10` | 南宋赭黄蝴蝶装册，青布包角，居中白绢签、端楷，宽开本、反复翻阅旧痕；旧化程度：中度；大小：中开本 |
| `it_miji_tantuirumen` | 弹腿入门抄本 | 秘籍·抄本 | 黄 | 市镇武馆通行腿法；抄本 **（原创扩展）** | `grade=3; skill=sk_tantuirumen; variant=copy; maxLayer=8` | 元代灰蓝包背图册，黑布护脊，右上黄纸签、楷书，长幅腿势折页磨白；旧化程度：中度；大小：中型折页 |
| `it_miji_wuguandao_can` | 武馆刀法残本 | 秘籍·残本 | 黄 | 市镇武馆通行武学；残谱 **（原创扩展）** | `grade=2; skill=sk_wuguandao; variant=partial; maxLayer=7` | 清代赭色线装残册，粗麻补订，右上残白纸签、粗楷，缺两叶、封边油旧；旧化程度：重度；大小：中开本 |
| `it_miji_wuguangun` | 武馆棍法全本 | 秘籍·全本 | 黄 | 市镇武馆通行武学；谱本 **（原创扩展）** | `grade=2; skill=sk_wuguangun; variant=full; maxLayer=10` | 明代土黄线装长册，四眼黑线，居中白纸签、隶书，细长开本、书角磨圆；旧化程度：中度；大小：中型长开本 |
| `it_miji_zhamabu` | 扎马步抄本 | 秘籍·抄本 | 黄 | 市镇武馆通行横练根基；抄本 **（原创扩展）** | `grade=1; skill=sk_zhamabu; variant=copy; maxLayer=8` | 清代灰白线装小册，粗麻双订，右上黄纸签、端楷，汗渍明显、掌心大小；旧化程度：中度；大小：掌心开本 |
| `it_miji_jianghurumenjian` | 江湖入门剑谱 | 秘籍·全本 | 黄 | 江湖散人通行武学；谱本 **（原创扩展）** | `grade=3; skill=sk_jianghurumenjian; variant=full; maxLayer=10` | 元代青灰包背册，蓝布护脊，居中米纸签、行楷，纸页厚韧、八寸开本；旧化程度：中度；大小：八寸开本 |
| `it_miji_pingfengjian` | 平锋剑抄本 | 秘籍·抄本 | 黄 | 江湖散人通行武学；抄本 **（原创扩展）** | `grade=2; skill=sk_pingfengjian; variant=copy; maxLayer=8` | 明代月白线装薄册，四眼青线，右上淡黄纸签、小楷，页口齐整、轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_hengdaorumenzhao` | 横刀入门招全本 | 秘籍·全本 | 黄 | 江湖刀客通行武学；谱本 **（原创扩展）** | `grade=3; skill=sk_hengdaorumenzhao; variant=full; maxLayer=10` | 明代深赭线装图册，四眼黑线，居中白绢签、粗楷，书衣刀痕浅压纹；旧化程度：中度；大小：中开本 |
| `it_miji_shaobanggun_can` | 哨棒棍谱残本 | 秘籍·残本 | 黄 | 乡勇旅人通行棍法；残谱 **（原创扩展）** | `grade=2; skill=sk_shaobanggun; variant=partial; maxLayer=7` | 元代土黄包背残册，粗麻护脊，右上残纸签、隶书，封角破损、泥点明显；旧化程度：重度；大小：中开本 |
| `it_miji_duanqiangfa` | 短枪法抄本 | 秘籍·抄本 | 黄 | 乡勇教头通行枪法；抄本 **（原创扩展）** | `grade=2; skill=sk_duanqiangfa; variant=copy; maxLayer=8` | 南宋赭灰蝴蝶装长册，青麻缝线，居中白纸签、楷书，枪位墨图简朴；旧化程度：中度；大小：中型长开本 |
| `it_miji_sanshou` | 散手全本 | 秘籍·全本 | 黄 | 江湖散人通行擒拿；谱本 **（原创扩展）** | `grade=2; skill=sk_sanshou; variant=full; maxLayer=10` | 清代灰蓝线装小册，四眼白线，右上米纸签、行楷，掌心开本、指翻油旧；旧化程度：中度；大小：掌心开本 |
| `it_miji_yanxingbu` | 雁行步原本 | 秘籍·原本 | 黄 | 江湖旅人通行轻功；原稿 **（原创扩展）** | `grade=3; skill=sk_yanxingbu; variant=original; maxLayer=10` | 明代浅青经折小谱，月白硬纸护面，首折黄绢签、小楷，折口轻磨、窄长开本；旧化程度：轻度；大小：中型长开本 |
| `it_miji_tunaqianjue` | 吐纳浅诀抄本 | 秘籍·抄本 | 黄 | 江湖散人通行内功；抄本 **（原创扩展）** | `grade=3; skill=sk_tunaqianjue; variant=copy; maxLayer=8` | 元代灰白包背小册，蓝布护脊，居中黄纸签、端楷，纸页泛黄、轻度潮斑；旧化程度：轻度；大小：小开本 |
| `it_miji_dantianyangqi` | 丹田养气全本 | 秘籍·全本 | 黄 | 乡里拳师通行内功；谱本 **（原创扩展）** | `grade=2; skill=sk_dantianyangqi; variant=full; maxLayer=10` | 明代素黄线装册，四眼白线，右上米纸签、端楷，书衣朴素、边角轻磨；旧化程度：轻度；大小：中开本 |
| `it_miji_huxixingqi_can` | 呼吸行气残本 | 秘籍·残本 | 黄 | 山野散人通行内功；残本 **（原创扩展）** | `grade=1; skill=sk_huxixingqi; variant=partial; maxLayer=7` | 唐代经折残册，灰麻纸护面，首折残白纸签、隶书，折痕开裂、烟熏泛黄；旧化程度：重度；大小：中开本 |
| `it_miji_tongxingfeishi` | 通行飞石图谱 | 秘籍·全本 | 黄 | 牧童猎户通行暗器；图谱 **（原创扩展）** | `grade=1; skill=sk_tongxingfeishi; variant=full; maxLayer=10` | 唐代粗麻纸卷轴，竹轴、草绳束缚，卷首黄纸签、楷书，石粉灰斑、约二尺；旧化程度：中度；大小：二尺级卷束 |
| `it_miji_tiexiu` | 铁袖功抄本 | 秘籍·抄本 | 黄 | 江湖卖艺人通行硬功；抄本 **（原创扩展）** | `grade=1; skill=sk_tiexiu; variant=copy; maxLayer=8` | 清代深灰线装小册，四眼黑线，居中白纸签、粗楷，布面袖口摩擦痕明显；旧化程度：中度；大小：小开本 |
| `it_miji_jianghuchangquan` | 江湖长拳谱 | 秘籍·全本 | 黄 | 乡勇散人通行拳法；谱本 **（原创扩展）** | `grade=1; skill=sk_jianghuchangquan; variant=full; maxLayer=10` | 元代土黄包背小册，蓝麻护脊，右上米纸签、隶书，页角磨圆、常用本重旧；旧化程度：重度；大小：小开本 |
| `it_miji_caoshangfei_can` | 草上飞残本 | 秘籍·残本 | 黄 | 江湖通行轻功；残谱 **（原创扩展）** | `grade=2; skill=sk_caoshangfei; variant=partial; maxLayer=7` | 明代草绿色线装残册，粗麻补订，右上残黄纸签、行楷，草汁斑与缺页明显；旧化程度：重度；大小：中开本 |
| `it_miji_caoyaozhi` | 草药知原本 | 秘籍·原本 | 黄 | 采药人通行医术；手册 **（原创扩展）** | `grade=3; skill=sk_caoyaozhi; variant=original; maxLayer=10` | 唐代经折药册，浅褐硬纸护面，首折白绢签、小楷，夹干叶、页缘药渍；旧化程度：中度；大小：中开本 |
| `it_miji_baoshangfa` | 包伤法抄本 | 秘籍·抄本 | 黄 | 军医镖局通行医术；抄本 **（原创扩展）** | `grade=2; skill=sk_baoshangfa; variant=copy; maxLayer=8` | 清代灰白线装小册，红线双订，居中米纸签、端楷，布条夹痕与药渍轻微；旧化程度：轻度；大小：小开本 |
| `it_miji_biandufa` | 辨毒法全本 | 秘籍·全本 | 黄 | 药商游医通行毒学；手册 **（原创扩展）** | `grade=3; skill=sk_biandufa; variant=full; maxLayer=10` | 明代墨绿线装册，四眼黄线，右上白纸签、小楷，页边淡褐药渍；旧化程度：中度；大小：中开本 |
| `it_miji_shiguchong_can` | 识蛊虫残本 | 秘籍·残本 | 黄 | 西南行商猎户通行蛊识；残册 **（原创扩展）** | `grade=2; skill=sk_shiguchong; variant=partial; maxLayer=7` | 明代暗绿皮纸残册，红线双订，居中残黄纸签、楷书，虫蛀孔与药粉污痕；旧化程度：重度；大小：中开本 |
| `it_miji_kanzhenfa` | 看阵法抄本 | 秘籍·抄本 | 黄 | 乡勇行商通行阵法；抄本 **（原创扩展）** | `grade=3; skill=sk_kanzhenfa; variant=copy; maxLayer=8` | 元代赭灰包背图册，黑布护脊，右上白纸签、隶书，折入阵图、页边重旧；旧化程度：重度；大小：中开本 |
| `it_miji_buzhenrumen` | 布阵入门全本 | 秘籍·全本 | 黄 | 军士护院通行阵法；谱本 **（原创扩展）** | `grade=2; skill=sk_buzhenrumen; variant=full; maxLayer=10` | 明代经折阵册，土黄硬纸护面，首折青纸签、端楷，展开约三尺、折口磨白；旧化程度：中度；大小：三尺级长卷 |
| `it_miji_diqurumen` | 笛曲入门抄本 | 秘籍·抄本 | 黄 | 乐工牧人通行音律；抄本 **（原创扩展）** | `grade=3; skill=sk_diqurumen; variant=copy; maxLayer=8` | 唐代白麻纸卷轴，青绫包首、竹轴，卷首黄纸签、小楷，乐谱墨迹略淡；旧化程度：中度；大小：中型长卷 |
| `it_miji_linmotieshi` | 临摹帖式原本 | 秘籍·原本 | 黄 | 书生画师通行书画；原稿 **（原创扩展）** | `grade=3; skill=sk_linmotieshi; variant=original; maxLayer=10` | 唐代经折字帖，月白硬纸护面，首折淡青绢签、楷书，墨迹浓淡与折痕自然；旧化程度：中度；大小：中开本 |
| `it_miji_qishirumen_can` | 棋势入门残本 | 秘籍·残本 | 黄 | 棋摊隐士通行棋学；残谱 **（原创扩展）** | `grade=2; skill=sk_qishirumen; variant=partial; maxLayer=7` | 宋代蝴蝶装小册，灰白纸衣，右上残黄纸签、小楷，棋谱格线褪色、缺末叶；旧化程度：重度；大小：小开本 |
| `it_miji_gaizhuangfa` | 改装法抄本 | 秘籍·抄本 | 黄 | 伶人行商通行易容；抄本 **（原创扩展）** | `grade=3; skill=sk_gaizhuangfa; variant=copy; maxLayer=8` | 清代茶褐线装册，四眼红线，居中白纸签、行楷，夹布样与颜料浅渍；旧化程度：中度；大小：中开本 |
| `it_miji_xunquanshu` | 训犬术全本 | 秘籍·全本 | 黄 | 猎户庄户通行驭兽；手册 **（原创扩展）** | `grade=3; skill=sk_xunquanshu; variant=full; maxLayer=10` | 明代黄竹纸线装册，粗麻四眼订，右上青纸签、隶书，封边毛损、泥爪印浅淡；旧化程度：中度；大小：中开本 |
| `it_miji_chuanyinfa` | 传音法抄本 | 秘籍·抄本 | 黄 | 乐工说书人通行音功；抄本 **（原创扩展）** | `grade=2; skill=sk_chuanyinfa; variant=copy; maxLayer=8` | 元代灰蓝包背薄册，白麻护脊，居中黄纸签、端楷，页边口水点痕、轻旧；旧化程度：轻度；大小：中开本 |
| `it_miji_jiuxuefa_can` | 救穴法残本 | 秘籍·残本 | 黄 | 行脚医者通行点穴解法；残册 **（原创扩展）** | `grade=1; skill=sk_jiuxuefa; variant=partial; maxLayer=7` | 明代窄幅线装残册，红线双订，右上残白纸签、小楷，穴位图页缺角、药渍明显；旧化程度：重度；大小：中开本 |
| `it_miji_tiebishou` | 铁臂手全本 | 秘籍·全本 | 黄 | 铁掌帮低阶擒拿；谱本 **（原创扩展）** | `grade=2; skill=sk_tiebishou; variant=full; maxLayer=10` | 南宋土黄蝴蝶装小册，黑布包角，右上白纸签、粗楷，掌心开本、边缘磨黑；旧化程度：中度；大小：掌心开本 |
| `it_miji_shuhuabifa` | 书画笔法抄本 | 秘籍·抄本 | 黄 | 函谷八友书画传承；谱本 **（原创扩展）** | `grade=1; skill=sk_shuhuabifa; variant=copy; maxLayer=8` | 北宋月白蝴蝶装小册，青丝缝缀，居中淡黄绢签、小楷，墨点与笔毫压痕自然；旧化程度：中度；大小：小开本 |

## 参考资料

- [国家图书馆《中国传统书籍装帧形式发展简述》](https://www.nlc.cn/migrated/www.nlc.cn/newhxjy/wjsy/wjls/wjqcsy/wjd77q/bhxf/202201/P020220128478508525288.pdf)（访问日期：2026-10-02）：简册、卷轴、经折、蝴蝶、包背与线装的结构脉络。
- [全国高等院校古籍整理研究工作委员会《装帧制度》](https://gwh.pku.edu.cn/info/1159/1222.htm)（访问日期：2026-10-02）：先秦两汉简牍帛书、五代以前卷轴及明代中期以后线装等年代口径。
- [故宫博物院《清内府书籍装帧形式》](https://www.dpm.org.cn/Uploads/pdf/1516/T00073_00.pdf)（访问日期：2026-10-02）：清代线装、包背装与仿古装帧并存的实物依据。
- [古诗文网《天龙八部》第四十三回](https://m.gsw6.com/book/tlbb/8662.html)（访问日期：2026-10-02）：无相劫指谱、般若掌法与伏魔杖法的“一本／一册”原文锚点。
- [古诗文网《天龙八部》第三十九回](https://m.gsw6.com/book/tlbb/8632.html)（访问日期：2026-10-02）：般若掌法、摩诃指秘要、大金刚拳神功三部黄黑旧经籍。
- [古诗文网《神雕侠侣》第十五回](https://m.gsw6.com/book/sdxl/8099.html)（访问日期：2026-10-02）：五毒秘传为殷红封皮抄本。
- [五千言《飞狐外传》第十回](https://feihu.5000yan.com/42061.html)（访问日期：2026-10-02）：无嗔医药录的黄纸书、尺寸与封题。
- [完美世界《笑傲江湖》第二十二回](https://xxa.wanmei.com/novel/20190110/216273.shtml)（访问日期：2026-10-02）：吸星大法刻在梅庄地牢铁板上。
- [完美世界《笑傲江湖》第七回](https://xxa.wanmei.com/novel/20190109/216226.shtml)（访问日期：2026-10-02）：曲洋取出册子并称其为《笑傲江湖曲》琴谱箫谱。
- [《笑傲江湖》第三十一章](https://m.kepub.net/book/61017/40001)（访问日期：2026-10-02）：任我行手持册子并说明即《葵花宝典》。
- [五千言《连城诀》第八回](https://lianchengjue.5000yan.com/42093.html)（访问日期：2026-10-02）：《血刀经》逐页图谱及内外功总诀。
- [五千言《倚天屠龙记》第三十回](https://yitian.5000yan.com/42040.html)（访问日期：2026-10-02）：六枚圣火令刻载霍山毕生武功精要。
- [五千言《倚天屠龙记》第六回](https://yitian.5000yan.com/42016.html)（访问日期：2026-10-02）：王盘山二十四字石刻及笔画所含武功。

## 本文新增术语与 ID

- 本批新建秘籍物品 ID 共 153 个；另沿用任务前 18 个名录 ID、复用仓库已有 9 个 ID。正式字段与来源边界见 `design/10` §10.1.4；本目录只承担美术投影，不重复定义上游技能。
- `题签规则`：题签必须可见，文字由生成器从物品名剥离版本／载体后缀后写入；本表只给形制、色位与书体。

## 数据校验规则与测试用例

1. 机器行必须恰为七列，`skill` 指向既有 `sk_*`，`grade` 等于武学绝对品阶，且物品品阶按 `grade` 映射为 `1–3/4–6/7–9/10–12`。
2. 新增 `partial` 使用 `_can`；四种 `variant` 均须出现；封面描述不得出现“空题签”“封面空白”“无字”。
3. 数量断言：`180 = 18（既有）+32（原著明确载体补录）+50（门派）+80（通用）`；严格原著实体载体至少 30，且天／地／玄／黄断言为 `18/44/55/63 = 10%/24.44%/30.56%/35%`。
4. 自动检查：`python3 tools/lint/check_ids.py --strict`；`python3 tools/lint/check_item_catalog.py docs/design/catalog/items-manuals.md --min 120`。

## 待决事项 / 依赖

### 替下游给出的建议值

- 无；全部 `grade`、`maxLayer` 依既有武学卡与 `design/10` §10.1 变体规则。

### 本文依赖的上游事实

- 获取节点、身份、职级、前置与书界范围仍由各 `skills-*.md`、`design/12`、`design/17` 决定；持有谱本不豁免。
- 出图前须同步 `manual_title()` 的后缀表：现行实现尚不剥离“原本”“全本”及若干载体词，不能据此把版本词印上题签。

### 对基准的修改提案

- 无。名录扩充不改变基准 §13 天级武学闭集，也不把载体原创扩展提升为原著事实。

### 原著考据待办

- 逐字核对本表所有 **（待考）** 项，重点为易筋经在基线版本中的经名关系；该待考项不否定正文已经出现黄纸经本。

### 开放问题（附默认值）

- 默认将题签文字交给生成器 `manual_title()`；先按上条补齐后缀表。若美术管线不支持竖排，以横排端楷降级，不回退为空白题签。
