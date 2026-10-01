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

## AR-24 · 玄黄暗器装备本体

> 六档取 `design/10` §4.1；`ammoMul=0.88+0.035×grade`，故 g1–g6 依次为 0.915 / 0.950 / 0.985 / 1.020 / 1.055 / 1.090。`hiddenHit=base+3×G(gUse)` 的 `base` 暂取 0，故分别为 3.0 / 3.3 / 3.6 / 4.2 / 4.65 / 5.1，均为 **（原创扩展）**。下列均是可装副手的本体 / 囊匣，不重造九种 `it_*` 弹药。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_feishinang` | 飞石囊 | 暗器·弹丸囊 | 黄下 | 江湖通用暗器载具 **（原创扩展）** | `grade=1; hiddenKind=ball; ammoMul=0.915; hiddenHit=3.0; ammoSlots=2` **（原创扩展）** | 巴掌大粗麻束口囊闭合平置，旁列三枚圆润飞蝗石以示用途，黄铜扣、补丁与尘土旧化，无人物、手、发射或命中场景 |
| `eq_feibiaonang` | 飞镖囊 | 暗器·飞镖囊 | 黄中 | 江湖通用暗器载具 **（原创扩展）** | `grade=2; hiddenKind=dart; ammoMul=0.950; hiddenHit=3.3; ammoSlots=2` **（原创扩展）** | 深褐软皮扁囊闭合，旁列三枚无字燕尾钢镖，各约半掌长，缝线、铜扣与磨痕清楚，无人物、手、发射或命中场景 |
| `eq_tonghuangxiujian` | 铜簧袖箭 | 暗器·弩箭 | 黄上 | 通用机括·宋明袖弩意象；具体定型年代 **（待考）**，玩法 **（原创扩展）** | `grade=3; hiddenKind=bolt; ammoMul=0.985; hiddenHit=3.6; perBattle=6` **（原创扩展）** | 前臂长竹木箭匣配黄铜簧片与皮腕带，机括完全闭合，六支短箭整齐并置，箭尖朝同向，无人物、手、发射或命中场景 |
| `eq_lianzhudangong` | 连珠弹弓 | 暗器·弹丸 | 玄下 | 通用弹弓·明清；连珠装填 **（原创扩展）** | `grade=4; hiddenKind=ball; ammoMul=1.020; hiddenHit=4.2; perBattle=10` **（原创扩展）** | 牛角叉形弹弓约前臂长，双股皮筋松弛、木柄皮缠，十枚陶丸整齐列于小盒，机括静止，无人物、手、发射或命中场景 |
| `eq_feidaoxia` | 飞刀匣 | 暗器·飞刀 | 玄中 | 江湖通用暗器载具 **（原创扩展）** | `grade=5; hiddenKind=dart; ammoMul=1.055; hiddenHit=4.65; perBattle=8` **（原创扩展）** | 黑漆木扁匣开启展示八柄柳叶飞刀，刀刃掌长、无护手、短木柄，全部同向嵌槽并保持完整，无人物、手、发射或命中场景 |
| `eq_lianfaxiunu` | 连发匣弩 | 暗器·机括弩 | 玄上 | 通用机括·明代弩意象；连续供矢结构 **（原创扩展）** | `grade=6; hiddenKind=bolt; ammoMul=1.090; hiddenHit=5.1; perBattle=6; reloadOwnActions=1` **（原创扩展）** | 短木臂匣弩约六十厘米，上置闭合箭仓、钢弓片与黄铜扳机，六支短矢整齐并置，机括卸力闭合，无人物、手、发射或命中场景 |

## AR-24 · 天地名暗器与门派装备

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_duling` | 毒菱 | 暗器·毒镖 | 玄上 | 《射雕英雄传》·柯镇恶，四面尖角铁菱与喂毒毒菱 | `grade=6; hiddenKind=dart; ammoMul=1.090; hiddenHit=5.1; perBattle=12; onHit=bf_zhongdu; unique=true` **（玩法原创扩展）** | 十二枚四面带尖乌铁菱整齐列于旧皮匣，单枚核桃大，尖端暗哑不画毒液，无人物、手、发射或命中场景 **（原创扩展陈设）** |
| `eq_yufengzhen` | 玉蜂针 | 暗器·名针 | 地下 | 《神雕侠侣》·古墓派，以六成黄金四成精钢制针并淬玉蜂尾刺毒液 | `grade=7; hiddenKind=needle; ammoMul=1.125; hiddenHit=6.0; perBattle=12; onHit=bf_mabi; unique=true; sect=sect_gumu` **（玩法原创扩展）** | 十二枚淡金细针平行列于白绸针匣，针长半掌、金属色温润，旁置闭合玉色针管，无活蜂、人物、手、发射或命中场景 |
| `eq_jinshezhui` | 金蛇锥 | 暗器·名锥 | 地中 | 《碧血剑》·夏雪宜遗物，二十四枚金蛇锥 | `grade=8; hiddenKind=awl; ammoMul=1.160; hiddenHit=6.6; perBattle=8; unique=true` **（玩法原创扩展）** | 八枚金色蛇形短锥等距排于黑绒匣，锥长约一掌、曲柄似蛇而锋尖清楚，无文字、人物、手、发射或命中场景 **（原创扩展陈设）** |
| `eq_furongjinzhen` | 芙蓉金针 | 暗器·金针 | 地下 | 《书剑恩仇录》·陆菲青 / 李沅芷；针数与装具 **（待考）** | `grade=7; hiddenKind=needle; ammoMul=1.125; hiddenHit=6.0; perBattle=12; onHit=bf_chizhi; unique=true; sect=sect_wudang` **（玩法原创扩展）** | 十二枚细金针放射状整齐排成芙蓉轮廓但不相交，配深青布针套，针长半掌，无人物、手、发射或命中场景 **（原创扩展陈设）** |
| `eq_zaohedingxia` | 枣核钉匣 | 暗器·名钉 | 地中 | 《神雕侠侣》·裘千尺以口喷枣核钉；永久匣体 **（原创扩展）** | `grade=8; hiddenKind=awl; ammoMul=1.160; hiddenHit=6.6; perBattle=9; unique=true; sect=sect_jueqinggu` **（原创扩展）** | 乌木小匣开启陈列九枚枣核形短铁钉，单枚约指节长、两端尖锐、表面暗红褐，无口喷、人物、手、发射或命中场景 |
| `eq_sanxiaosanxia` | 三笑逍遥散匣 | 暗器·毒粉匣 | 地中 | 《天龙八部》·星宿派三笑逍遥散；专用匣体 **（原创扩展）** | `grade=8; hiddenKind=powder; ammoMul=1.160; hiddenHit=6.6; perBattle=3; onHit=bf_sanxiao; unique=true; sect=sect_xingxiu` **（原创扩展）** | 三格乌木粉匣完全闭合，格盖各嵌一枚素银圆点、边缘有密封蜡痕，不露粉末、不写字，无人物、手、投撒或中毒场景 |
