# 物品图鉴 · 暗器（`items-hidden-weapons`）

> **归属（基准 §18）**：本表投影 `design/10` §3.5、§5.4、§8.6 的暗器实体。
> **上游**：AR-20、`design/10` §2.4、§3.5；古龙条目作非商业致敬。
> **引用而不重定义**：暗器武学见 `design/05` / 技能图鉴；毒与命中结算见 `design/06`、`design/03`。
> **标注约定**：弹量、命中、毒效与未经原著确认的外观均 **（原创扩展）**；不表现命中人体或血腥。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `it_feihuangshi` | 飞蝗石 | 暗器·弹丸 | 黄 | 武侠通用暗器；定级 **（原创扩展）** | `grade=3; hiddenKind=ball; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）** | 三枚椭圆磨石置粗布小囊旁，灰褐自然石纹、指节大小 **（原创扩展）** |
| `it_jinqianbiao` | 金钱镖 | 暗器·飞镖 | 黄 | 武侠通用暗器；定级 **（原创扩展）** | `grade=3; hiddenKind=dart; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）** | 三枚铜钱形薄镖，方孔但无文字，刃缘克制、掌心尺度 **（原创扩展）** |
| `it_xiujian` | 袖箭 | 暗器·弩箭 | 黄 | 武侠通用暗器；定级 **（原创扩展）** | `grade=3; hiddenKind=bolt; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）** | 小型铜木袖弩与一支短箭并置，无手臂人物，约一掌长 **（原创扩展）** |
| `it_meihuazhen` | 梅花针 | 暗器·针 | 玄 | 江湖通用；定级 **（原创扩展）** | `grade=6; hiddenKind=needle; ammoMul=1.09; hiddenHit=5.1` | 五枚细钢针排成梅花但不带文字，蓝布针套，针长半掌 **（原创扩展）** |
| `eq_wenxuzhen` | 蚊须针 | 暗器·名针 | 地 | 《倚天屠龙记》·殷素素 | `grade=7; hiddenKind=needle; perBattle=15; hit=10; onHit=bf_zhongdu` **（待考是否原著淬毒；玩法原创扩展）** | 极细银针束于黑绸针筒旁，针如蚊须、尺寸纤小 **（原创扩展形制）** |
| `eq_hanshasheying` | 含沙射影 | 暗器·机括 | 玄 | 《碧血剑》归属 **（待考：核何铁手一脉与器物形制）** | `grade=6; hiddenKind=gun; perBattle=3; range=3; aoe=cone; poisonCoat=true` **（原创扩展）** | 乌木掌心机匣，黄铜细孔成扇面排列，无火器枪管 **（原创扩展）** |
| `eq_bingpoyinzhen` | 冰魄银针 | 暗器·名针 | 地 | 《神雕侠侣》·李莫愁 | `grade=8; hiddenKind=needle; perBattle=10; onHit=bf_judu; gloveCheck=50%` **（原创扩展）** | 银蓝细针十枚装入白瓷针管，冷色金属光、无冰魔法 **（原创扩展形制）** |
| `eq_heixueshenzhen` | 黑血神针 | 暗器·毒针 | 地 | 《笑傲江湖》·曲洋；是否淬毒及器物细节 **（待考）** | `grade=9; hiddenKind=needle; perBattle=8; onHit=bf_judu; hiddenHit=7.2` **（原创扩展）** | 乌黑钢针若干置暗红丝衬小匣，针尖细亮，无血迹 **（原创扩展）** |
| `eq_luochaduanchong` | 罗刹短铳 | 暗器·火器 | 地 | 《鹿鼎记》罗刹火器语境；此物 **（原创扩展）** | `grade=8; hiddenKind=gun; perBattle=2; ammoMul=2.0; range=5; reloadOwnActions=1` | 木柄短铳、黑铁短管、黄铜箍，清初火器感，无烟火场景 **（原创扩展）** |
| `eq_kongqueling` | 孔雀翎 | 暗器·机括 | 地 | 古龙《七种武器·孔雀翎》 | `grade=9; hiddenKind=gun; perBattle=1; unique=true; skill=sk_kongquelingfa` **（原创扩展）** | 黄金与青铜复合圆筒机括，端面如收拢孔雀尾，前臂长 **（原创扩展）** |
| `eq_xiaolifeidao` | 小李飞刀 | 暗器·飞刀 | 天 | 古龙《多情剑客无情剑》 | `grade=10; hiddenKind=dart; catalogTian=true; divine=false; unique=true; price=null; perBattle=1; hiddenHit=8.4` **（原创扩展）** | 一柄极简柳叶飞刀，银灰薄刃、无护手、黑木短柄，掌长 **（原创扩展）** |
| `eq_baoyulihuading` | 暴雨梨花钉 | 暗器·机括钉匣 | 天 | 古龙《楚留香传奇》；具体篇目、制作者与构造 **（待考）** | `grade=10; hiddenKind=gun; catalogTian=true; divine=false; unique=true; price=null; perBattle=1; aoe=cone; onHit=bf_liuxue` **（原创扩展）** | 银灰扁平机括匣，端面多孔、铜簧结构闭合，约前臂长，无字无发射场景 **（原创扩展形制）** |
