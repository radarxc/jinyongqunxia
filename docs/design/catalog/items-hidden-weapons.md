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

## AR-30 · 历代与地域暗器载具（§14.2 登记待决事项）

> 投放年代服从 AR-26：春秋只在序章，唐从白马书界起，宋从天龙起，元从倚天起，明从笑傲起，清从鹿鼎起；后世可见旧藏，前代不得逆投后世器形。六档仍用 §3.5 公式：`ammoMul=0.88+0.035×grade`，`hiddenHit=3×G(grade)`。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_chunqiutoushinang` | 春秋投石革囊 | 暗器·弹丸囊 | 黄下 | 春秋猎具意象；仅序章原生可得 **（原创扩展）** | `grade=1; hiddenKind=ball; ammoMul=0.915; hiddenHit=3.0; ammoSlots=2` **（原创扩展）** | 巴掌大原色革囊闭合，骨质小扣、麻绳束口，旁列三枚指节大圆石，旧化朴素，无人物、手、投掷或命中场景 |
| `eq_tangfeisuodai` | 唐式飞梭袋 | 暗器·飞梭 | 黄下 | 唐代行旅投掷器意象；器名与使用史 **（待考）** | `grade=1; hiddenKind=dart; ammoMul=0.915; hiddenHit=3.0; perBattle=6` **（原创扩展）** | 六枚两端尖的梭形铁件平行列在窄皮袋旁，单枚约半掌长，中段缠麻便于辨识，铁色轻锈，无人物、手或飞行场景 **（原创扩展复原）** |
| `eq_songshounuxia` | 宋式手弩匣 | 暗器·机括弩 | 黄下 | 宋代弩具意象；天龙起可得，掌上尺度 **（待考）** | `grade=1; hiddenKind=bolt; ammoMul=0.915; hiddenHit=3.0; perBattle=3` **（原创扩展）** | 木身短弩约四十厘米，短弓臂、铁扳机与三支短矢并置，弦松弛、机括卸力闭合，完整静置，无人物、手、发射或命中场景 |
| `eq_yuanqishoufeidaonang` | 元骑手飞刀囊 | 暗器·飞刀 | 黄中 | 元代骑旅装备意象；倚天起可得 **（原创扩展）** | `grade=2; hiddenKind=dart; ammoMul=0.950; hiddenHit=3.3; perBattle=6` | 红褐皮扁囊闭合，旁列六柄掌长单刃飞刀，刀尖同向、无护手、角片短柄，风沙旧化，无人物、手或投掷场景 |
| `eq_mingduanluxia` | 明式短弩匣 | 暗器·机括弩 | 黄中 | 明代弩具意象；笑傲起可得，具体军民使用 **（待考）** | `grade=2; hiddenKind=bolt; ammoMul=0.950; hiddenHit=3.3; perBattle=4` **（原创扩展）** | 黑木短弩约五十厘米，上置闭合矢槽、钢弓片与黄铜扳机，四支短矢整齐并置，弦松弛，无人物、手或发射场景 |
| `eq_qingpiaodaoxia` | 清式镖刀匣 | 暗器·飞刀 | 黄中 | 清代江湖载具；鹿鼎起可得 **（原创扩展）** | `grade=2; hiddenKind=dart; ammoMul=0.950; hiddenHit=3.3; perBattle=6` | 黑漆木扁匣开启，六柄柳叶薄刀嵌槽排列，掌长、无护手、黑角短柄与银灰刃完整，无人物、手或投掷场景 |
| `eq_xiyufengyebiaonang` | 西域风叶镖囊 | 暗器·飞镖 | 黄上 | 西域商旅装备；白马（唐）起西域节点可得 **（原创扩展）** | `grade=3; hiddenKind=dart; ammoMul=0.985; hiddenHit=3.6; perBattle=8` | 红褐皮囊旁列八枚三叶钢镖，单枚掌心大、中央圆孔无字，边缘克制开刃，几何压纹与风沙旧化，无人物、手或飞行场景 |
| `eq_tubofeishinang` | 吐蕃飞石囊 | 暗器·弹丸囊 | 黄上 | 吐蕃牧猎投石意象；白马（唐）起藏边可得 **（原创扩展）** | `grade=3; hiddenKind=ball; ammoMul=0.985; hiddenHit=3.6; ammoSlots=3` | 厚皮束口囊闭合，旁列五枚扁圆河石与一条红褐编绳，皮面几何压线、高原尘痕，无人物、手或投掷场景 |
| `eq_menggumadannang` | 蒙古马弹囊 | 暗器·弹丸囊 | 黄上 | 蒙古骑旅备用弹丸 **（原创扩展）** | `grade=3; hiddenKind=ball; ammoMul=0.985; hiddenHit=3.6; ammoSlots=3` | 毛皮滚边小囊闭合，旁列六枚核桃大陶弹，褐灰釉色、皮带环与风沙磨痕清楚，无人物、手或投掷场景 |
| `eq_daliyinzhenxia` | 大理银针匣 | 暗器·针匣 | 玄下 | 大理医者防身载具；仅天龙大理节点原生可得 **（原创扩展）** | `grade=4; hiddenKind=needle; ammoMul=1.020; hiddenHit=4.2; perBattle=10` | 素银扁匣开启，十枚半掌长细针平行嵌于深红毡槽，匣盖花叶浅线无字，针尖同向，无人物、手、发射或命中场景 |
| `eq_huibufeidaoxia` | 回部飞刀匣 | 暗器·飞刀 | 玄下 | 回疆护旅装备；书剑至雪山清代节点可得 **（原创扩展）** | `grade=4; hiddenKind=dart; ammoMul=1.020; hiddenHit=4.2; perBattle=8` | 深木扁匣开启，八柄短弯飞刀沿弧形嵌槽排列，单件半掌长、角片小柄，银色几何嵌线无字，无人物、手或投掷场景 |
| `eq_liuxingdanxia` | 流星弹匣 | 暗器·弹丸匣 | 玄下 | 江湖弹丸装备 **（原创扩展）** | `grade=4; hiddenKind=ball; ammoMul=1.020; hiddenHit=4.2; perBattle=12` | 圆形木匣开启，十二枚拇指大锻铁圆弹分两圈嵌槽排列，中央留空、匣盖铜扣闭合于侧，无人物、手或飞行命中场景 |
| `eq_yanzibiaonang` | 燕子镖囊 | 暗器·飞镖 | 玄中 | 江湖通用暗器载具 **（原创扩展）** | `grade=5; hiddenKind=dart; ammoMul=1.055; hiddenHit=4.65; perBattle=10` | 黑皮扁囊开启，十枚燕尾形薄钢镖平行插槽，单枚约半掌长、双翼边缘开刃而中央圆钝，无人物、手或飞行场景 |
| `eq_tougudingxia` | 透骨钉匣 | 暗器·钉匣 | 玄中 | 江湖通用名目；器形 **（原创扩展）** | `grade=5; hiddenKind=awl; ammoMul=1.055; hiddenHit=4.65; perBattle=9` | 乌木小匣开启，九枚四棱短钉平行嵌槽，单枚一指半长、尾端扁平、钢色冷亮，无毒液、人物、手或命中场景 |
| `eq_lianzhuziwunu` | 连珠子午弩 | 暗器·机括弩 | 玄中 | 江湖机括器 **（原创扩展）** | `grade=5; hiddenKind=bolt; ammoMul=1.055; hiddenHit=4.65; perBattle=6; reloadOwnActions=1` | 前臂长黑木匣弩，上下双矢槽、钢弓片与铜扳机清楚，六支短矢另列，机括卸力闭合，无人物、手或发射场景 |
| `eq_wulianfeibingxia` | 五联飞饼匣 | 暗器·轮刃匣 | 玄上 | 江湖轮刃载具 **（原创扩展）** | `grade=6; hiddenKind=dart; ammoMul=1.090; hiddenHit=5.1; perBattle=5` | 五枚掌心大薄钢圆轮并排嵌于长匣，中央握孔无字、外缘四段浅刃互不遮挡，匣体闭合机括，无人物、手或飞行场景 |
| `eq_jiugongzhenpan` | 九宫针盘 | 暗器·针盘 | 玄上 | 江湖针匣 **（原创扩展）** | `grade=6; hiddenKind=needle; ammoMul=1.090; hiddenHit=5.1; perBattle=18` | 方形黑木盘开启，十八枚细钢针按九格双层嵌槽排列，针尖全朝内避免杂乱，铜轴机括闭合，无文字、人物、手或发射场景 |
| `eq_qingzilianzhuqiangxia` | 青瓷连珠枪匣 | 暗器·弹丸匣 | 玄上 | 弹弓备用丸载具 **（原创扩展）** | `grade=6; hiddenKind=ball; ammoMul=1.090; hiddenHit=5.1; perBattle=12` | 青白釉圆盒开启，十二枚墨灰陶丸分格嵌放，盒盖无字仅弦纹，外配闭合皮套，不画现实火药、人物、手或发射场景 |

## AR-30 · 原著名暗器补漏（§14.2 登记待决事项）

> 原著有毒物只登记安全的装备外观与 `bf_*` 接口，不记录现实成分、剂量、加工或投放方法。生死符是武学临时凝成的冰片，收为招式介质陈设，不制造永久库存。

| ID | 名称 | 子类 | 品阶 | 出处（书名 / 原创扩展） | 效果字段 | 外观要点（供出图） |
|---|---|---|---|---|---|---|
| `eq_shengsifubao` | 生死符冰片包 | 暗器·名符 | 地上 | 《天龙八部》·天山童姥以冰片施生死符；可持久装备包 **（原创扩展）** | `grade=9; hiddenKind=awl; ammoMul=1.195; hiddenHit=7.2; perBattle=3; onHit=bf_shengsifu; unique=true; sect=sect_lingjiu` **（原创扩展）** | 青白玉色小盒完全闭合，旁置三枚钱大透明薄冰片于白绸隔层，边缘自然不作刀刃，无文字、人物、手、发射或受制场景 **（原创扩展陈设）** |
| `eq_jinhuabiao` | 金花镖 | 暗器·名镖 | 地中 | 《倚天屠龙记》·金花婆婆使用金花状暗器；材质与细节 **（待考）** | `grade=8; hiddenKind=dart; ammoMul=1.160; hiddenHit=6.6; perBattle=6; unique=true; sect=sect_mingjiao` **（原创扩展定级）** | 六枚梅花状金色薄镖整齐列于紫绒匣，真梅花大小、五瓣边缘克制开刃、银色细蕊，无人物、手、飞行或命中场景 **（原创扩展陈设）** |
| `eq_wuyingyinzhen` | 无影银针 | 暗器·机括针靴 | 地中 | 《飞狐外传》·汤沛靴底机括自足尖发银针 | `grade=8; hiddenKind=needle; ammoMul=1.160; hiddenHit=6.6; perBattle=8; unique=true` **（原创扩展弹量）** | 一只黑色长靴侧卧展示鞋底闭合机括，足尖多孔银片与八枚细针另列，黄铜簧片不外弹，无人物、脚、发射或命中场景 |
| `eq_huilongbi` | 回龙璧 | 暗器·名镖 | 地中 | 《书剑恩仇录》·赵半山自创曲尺形精钢弯镖 | `grade=8; hiddenKind=dart; ammoMul=1.160; hiddenHit=6.6; perBattle=3; unique=true; sect=sect_taijimen` **（原创扩展弹量）** | 三枚曲尺形精钢弯镖分开平置，单件约一掌半长、内外弧刃线清楚、中段缠细皮，无文字、人物、手或回旋轨迹 **（原创扩展尺度）** |
| `eq_feiyanyinsuo` | 飞燕银梭 | 暗器·名梭 | 地中 | 《书剑恩仇录》·赵半山独创飞燕银梭；具体构造 **（待考）** | `grade=8; hiddenKind=dart; ammoMul=1.160; hiddenHit=6.6; perBattle=6; unique=true; sect=sect_taijimen` **（原创扩展弹量）** | 六枚银灰燕梭按扇形整齐平置，单件半掌长、中央梭身两侧短翼、前尖后钝，完整无文字，无人物、手或飞行场景 **（原创扩展形制）** |
| `eq_wenfangshifeidao` | 温方施二十四飞刀 | 暗器·名飞刀 | 地下 | 《碧血剑》·温方施皮套藏二十四柄飞刀，刀柄中空；出场细节已据在线转录核验 | `grade=7; hiddenKind=dart; ammoMul=1.125; hiddenHit=6.0; perBattle=24; unique=true` **（原创扩展定级）** | 深褐环腰皮套展开，二十四柄尺许薄飞刀分槽排列，银亮单刃、空心短柄尾孔清楚，逐柄完整，无人物、手或投掷命中场景 |
| `eq_musangtieqizi` | 木桑铁棋子 | 暗器·名棋子 | 地下 | 《碧血剑》·木桑道人以铁、银棋子作暗器；数量 **（待考）** | `grade=7; hiddenKind=ball; ammoMul=1.125; hiddenHit=6.0; perBattle=16; unique=true; sect=sect_tiejian` **（原创扩展弹量）** | 黑铁与银灰圆棋子各八枚分色列在小木棋盒内，单枚指节大、扁圆无字，盒盖闭合于侧，无人物、手、投掷或命中场景 |
| `eq_sunzhongjungangbiao` | 孙仲君钢镖 | 暗器·钢镖 | 玄上 | 《碧血剑》·孙仲君投掷钢镖；装具 **（待考）** | `grade=6; hiddenKind=dart; ammoMul=1.090; hiddenHit=5.1; perBattle=8; unique=true; sect=sect_huashan` **（原创扩展定级）** | 八枚燕尾钢镖平行列于深青皮囊旁，单件半掌长、菱形尖与短尾翼完整，轻锈克制，无人物、手、投掷或命中场景 **（原创扩展形制）** |
| `eq_wenfangshifeidaoxia` | 温方施飞刀备用匣 | 暗器·飞刀匣 | 玄上 | 《碧血剑》·温方施四刀齐发情节；备用匣 **（原创扩展）** | `grade=6; hiddenKind=dart; ammoMul=1.090; hiddenHit=5.1; perBattle=8` | 乌木扁匣开启，八柄与其名器同制的尺许飞刀分槽平置，中空短柄尾孔清楚，机括全闭合，无人物、手或投掷场景 |

## 考据与出图口径

- 《书剑恩仇录》第五回在线转录（访问 2026-10-02）：<https://sjecl.5000yan.com/35073.html>，用于核对赵半山的回龙璧为曲尺形精钢弯镖、飞燕银梭为其自创暗器；具体尺寸与弹量仍为 **（原创扩展）**。
- 《碧血剑》第五、七回在线转录（访问 2026-10-02）：<https://m.gsw6.com/book/bxj/9273.html>、<https://m.gsw6.com/book/bxj/9285.html>，用于核对温方施皮套中二十四柄飞刀、尺许刃及四刀齐发；出图匣体为 **（原创扩展）**。
- 《飞狐外传》第十九回在线转录（访问 2026-10-02）：<https://feihu.5000yan.com/42070.html>，用于核对无影银针由汤沛靴底机括从足尖发出；每战弹量与数值为 **（原创扩展）**。
- 金花镖与木桑棋子的具体材质、数量仍需按三联／广州修订版逐字核对，当前保留 **（待考）**，不据网络百科扩写为定本。
- 所有机括按 `assets/default/prompts/item.md` §8.2 以卸力、闭合状态出图；针、镖、飞刀按条目数量完整整齐并置，不画人物、手、发射、命中、中毒或血腥。
