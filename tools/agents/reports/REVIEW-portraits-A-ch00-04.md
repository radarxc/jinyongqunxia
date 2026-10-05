# 重要人物立绘重审 · A 组（主角与 ch00–ch04）

> 依据：作者 2026-10-02 指令（`docs/decisions/author-requirements.md` AR-29、AR-30）与协调者共用说明。
> 范围：主角男女十五个时代、序章、天龙八部、射雕英雄传、神雕侠侣、倚天屠龙记的男女主角、主角师父与亲密同伴、主要首领；以 `tier: S` 为底，补看了非 S 的师父、同伴和“禁止幼态”点名角色。
> 方法：逐张看全身联系表和头肩放大图，可疑的看 1024×1536 原图；逐条核对旧图 manifest 的参考来源；原著外貌只引用短语，核不准的标（待考）。
> 本组只改提示词、本报告、队列和 `GUIDE.md`，没有出图，没有动任何图片和 manifest。

## 统计

人数按“人物”计（同一人的跨书版本分别计在各书）；图数按队列条目计。

| 分组 | 通过（人） | 重出（人） | 补出（人） | 暂缓 / 撤下 / 待裁定 / 缺口（人或项） | 基础图入队（张） | 场景随基础图入队（张） |
|---|---|---|---|---|---|---|
| 主角（npc_zhujue 男 / 女，十五个时代） | 0 | 2 | 0 | 3 | 28 | 0 |
| ch00 序章《越女剑》 | 0 | 0 | 2 | 1 | 2 | 0 |
| ch01《天龙八部》 | 15 | 9 | 0 | 5 | 9 | 20 |
| ch02《射雕英雄传》 | 8 | 8 | 5 | 9 | 13 | 10 |
| ch03《神雕侠侣》 | 10 | 9 | 6 | 9 | 15 | 10 |
| ch04《倚天屠龙记》 | 17 | 6 | 3 | 3 | 9 | 9 |
| **合计** | **50** | **34** | **16** | **30** | **76** | **49** |

生成队列：`.agents/coord/portrait_redo/A-ch00-04.txt`，共 **125** 条，已按依赖排序。

## 判定口径

1. **真人肖像风险按“重出”处理**。上一轮按当时的授权，射雕用 1983 年版、神雕用 1995 年版、天龙用 1997 / 2003 年版剧照做“第一身份参考”生成；与原剧照并排看，黄蓉、小龙女、杨过、虚竹、阿朱等几乎是演员本人的脸。AR-30 已改为“只用文字借鉴造型、不复刻真人面容”，`design/01` 也写明“不用演员肖像”。S 级与主角团、师父、首领一律整体重出；剧照派生的 A 级配角列为“待作者裁定”，默认下一轮再做。
2. **整体重出**：脸、年龄或体型本身不对，按文字重建身份，不上传旧图；该人物的剧情场景图一并重出（上传新基础图作身份参考，场景内容沿用原设定）。**微调重出**：身份可用，上传当前图保留身份，只改标志特征（如灭绝师太的眉形）。**补出**：提示词在但从未出图，或本轮新建。
3. **上传参考（`reference_upload`）只放主角和 S 级人物的立绘**（AR-29）；判为脸不对的图一律不上传。跨书同一人先出被参考的那张，后一张上传它。张三丰是例外：先出倚天百岁张三丰（S 级），再让神雕张君宝上传它“倒推回二十岁”，因为张君宝条目是 A 级，不能作为别人的上传参考。
4. **禁止幼态**：原著年少的角色一律按约二十岁的成年人画，提示词写明成人比例；天山童姥、周芷若童年场景两处与原著冲突，列入作者拍板。
5. **新提示词结构**：每个条目正文最前面新增 `## Gemini 提示词`（中文、可直接粘贴），frontmatter 加 `status: redo / new`、`redo_reason`、`reference_upload`；原提示词保留在下面作历史，旧 `references` 中带演员姓名的历史说明不再使用。

## 最严重的十个问题

1. **剧照复刻**：ch02、ch03 的主角团与反派，天龙的乔峰、段誉、虚竹、王语嫣、阿朱，倚天赵敏的五幅场景，都以剧照为第一身份参考生成，脸接近演员本人，有真人肖像风险。
2. **女主角三张脸**：ch00 女主以 1993 年版赵敏剧照为“设计启发”；ch01–ch11 引用的是已被替换的旧 ch00；ch12–ch14 又是第三张脸。跨书一致失败，还可能和赵敏撞脸。
3. **幼态**：阿紫、钟灵、阿朱的旧提示词明写“未成年外观、6–6.5 头身”，小昭写“明显少女稚气、尚未长成”，殷离、郭襄同类；天山童姥直接画成七八岁女童；周芷若青年场景以童年图定脸，也偏幼；另有一张十岁女童场景（汉水）。
4. **小昭**：娃娃脸配白色仙裙。原著“高鼻雪肤、眼中隐有海水之蓝、颊边梨涡、瓜子脸”的混血特征被旧提示词刻意压掉，衣着也不是侍女装。
5. **黄蓉**：射雕、神雕两张分别取自两位演员，不是同一张脸；射雕版穿粉色衣裙，不合作者要求。
6. **张三丰**：像六七十岁的板脸仙翁，原著“须发如银、脸上红润光滑、笑眯眯、青布道袍污秽不堪”全无；神雕少年张君宝没有图，跨书无从对照。
7. **重要人物缺图**：赵敏、周芷若只有场景没有基础立绘；黛绮丝没有紫衫龙王真容；神雕郭靖、郭襄、张君宝，射雕一灯、裘千仞、陈玄风、柯镇恶、完颜洪烈都从未出图；序章阿青、范蠡连提示词都没有。
8. **原著标志画错**：洪七公画成白长髯老寿星（原著长方脸、颏下微须、九指）；欧阳锋是汉人脸（原著高鼻深目、须毛棕黄）；金轮法王红袍、留发、壮实（原著黄袍、极高极瘦如竹竿、脑门微陷）；公孙止气色红润、穿绿袍（原著面皮腊黄、宝蓝缎袍）；李莫愁米白裙（原著杏黄道袍）。
9. **伤残与毁容没画**：范遥（苦头陀）是一张光洁俊脸，原著满面刀疤、红棕披发；殷离只点了几块淡紫斑，原著整张脸黝黑浮肿、凹凸不平。
10. **主角团失去书中特点**：乔峰中等身材、窄脸、南亚式大缠头，原著身材魁伟、四方国字脸；虚竹原著“鼻孔朝天、招风耳、厚唇”的朴拙相被演员脸替代；段誉、王语嫣偶像化；灭绝师太缺了原著最醒目的“两眉斜斜下垂”。

## 主角（npc_zhujue 男 / 女，十五个时代）

| 人物 | ID | 现状图（变体名） | 判定 | 问题 | 改法 |
|---|---|---|---|---|---|
| 主角（男） | `por_npc_zhujue__ch00_m_base` | ch00_m_base | **微调重出** | 十五个时代脸已基本一致，但五官偏模特脸、辨识点（眉尾小痣）在立绘尺度看不出，与张无忌、张翠山等青年男角同类脸；ch12–14 借萧峰图作质量参考后更精修 | 上传现 ch00 作本人基础，加左眉断疤、朱红发绳，皮肤与神情去 AI 味；定稿后作为其余时代唯一身份参考；上传参考：por_npc_zhujue__ch00_m_base（现图，脸型基础） |
| 主角（女） | `por_npc_zhujue__ch00_f_base` | ch00_f_base | **整体重出** | ch00（英气瘦长脸）与 ch01–ch11（柔美大眼网红脸，引用的是已被替换的旧 ch00）及 ch12–14 三张不同脸；ch00 以经典赵敏剧照为第一设计启发，有真人肖像风险且可能与赵敏撞脸 | 不上传任何图，按文字建立原创成年女主面容（平直浓眉、细长杏眼、右眼下小痣、朱红发绳），定稿后作为其余时代唯一身份参考；上传参考：无 |
| 主角（男） · 其余时代（13 张） | `por_npc_zhujue__ch01_m_base`<br>`por_npc_zhujue__ch02_m_base`<br>`por_npc_zhujue__ch03_m_base`<br>`por_npc_zhujue__ch04_m_base`<br>`por_npc_zhujue__ch05_m_base`<br>`por_npc_zhujue__ch06_m_base`<br>`por_npc_zhujue__ch07_m_base`<br>`por_npc_zhujue__ch08_m_base`<br>`por_npc_zhujue__ch09_m_base`<br>`por_npc_zhujue__ch11_m_base`<br>`por_npc_zhujue__ch12_m_base`<br>`por_npc_zhujue__ch13_m_base`<br>`por_npc_zhujue__ch14_m_base` | ch01_m_base、ch02_m_base、ch03_m_base、ch04_m_base、ch05_m_base、ch06_m_base、ch07_m_base、ch08_m_base、ch09_m_base、ch11_m_base、ch12_m_base、ch13_m_base、ch14_m_base | **微调重出** | 脸与 ch00 基本一致，但缺全书辨识标志；不同批次精修程度不一 | 上传新版 ch00 男主作唯一身份参考，按本时代服饰重出；上传参考：por_npc_zhujue__ch00_m_base（须为本轮新图） |
| 主角（女） · 其余时代（13 张） | `por_npc_zhujue__ch01_f_base`<br>`por_npc_zhujue__ch02_f_base`<br>`por_npc_zhujue__ch03_f_base`<br>`por_npc_zhujue__ch04_f_base`<br>`por_npc_zhujue__ch05_f_base`<br>`por_npc_zhujue__ch06_f_base`<br>`por_npc_zhujue__ch07_f_base`<br>`por_npc_zhujue__ch08_f_base`<br>`por_npc_zhujue__ch09_f_base`<br>`por_npc_zhujue__ch11_f_base`<br>`por_npc_zhujue__ch12_f_base`<br>`por_npc_zhujue__ch13_f_base`<br>`por_npc_zhujue__ch14_f_base` | ch01_f_base、ch02_f_base、ch03_f_base、ch04_f_base、ch05_f_base、ch06_f_base、ch07_f_base、ch08_f_base、ch09_f_base、ch11_f_base、ch12_f_base、ch13_f_base、ch14_f_base | **整体重出** | ch01–ch11 用的是已被替换的旧 ch00 脸（柔美大眼、偏网红）；ch12–14 与 ch01–ch11 不是同一张脸，且旁借萧峰图作质量参考 | 上传新版 ch00 女主作唯一身份参考，按本时代服饰重出；上传参考：por_npc_zhujue__ch00_f_base（须为本轮新图） |
| 主角（男） | `por_npc_zhujue__ch10_m_base` | ch10_m_base | 暂缓 | 白马啸西风改到唐代（AR-26），服饰须等 DES-baima-tang 定稿 | 定稿后按新锚点 + 唐代服饰补写提示词再出；本轮未改文件 |
| 主角（女） | `por_npc_zhujue__ch10_f_base` | ch10_f_base | 暂缓 | 同上 | 同上 |
| 书灵 | `por_npc_shuling__ch00_base` | （无图） | 未审 | 抽象墨影、非人形，不在本次人物立绘口径内 | 保持原提示词 |

## ch00 序章《越女剑》

| 人物 | ID | 现状图（变体名） | 判定 | 问题 | 改法 |
|---|---|---|---|---|---|
| 阿青 | `por_npc_aqing__ch00_youth_base` | （无图） | **补出** | chapters/00 §9.2 要求阿青关键立绘，但仓库没有提示词也没有图；人物键 npc_aqing 尚在“待定义” | 新建提示词：原著瓜子脸、睫长眼大、肤白、苗条，牧羊女粗麻衣与青竹棒，画成约二十岁成年女子；上传参考：无 |
| 范蠡 | `por_npc_fanli__ch00_prime_base` | （无图） | **补出** | chapters/00 §9.2 要求范蠡关键立绘，仓库没有提示词也没有图；人物键 npc_fanli 尚在“待定义” | 新建提示词：春秋越国上大夫，儒雅干练、深谋远虑，深衣小冠；上传参考：无 |
| 白猿 | （无提示词） | （无） | 未审 | 非人形生物，chapters/00 §9.2 要求 2 张立绘，人物键待定义 | 另派生物立绘任务 |

## ch01《天龙八部》

| 人物 | ID | 现状图（变体名） | 判定 | 问题 | 改法 |
|---|---|---|---|---|---|
| 萧峰 | `por_npc_xiaofeng__ch01_prime_gaibang_base` | prime_gaibang_base | **整体重出** | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险（大缠头巾造型与剧照一致）；原著“身材魁伟、四方国字脸、高鼻阔口”在图中只剩中等身材窄脸；缠头巾体量过大像异域头巾 | 不上传旧图，按原著文字重建魁伟国字脸；宋式裹巾包髻、灰旧布袍、青竹打狗棒；五幅场景随新基础图重出；上传参考：无 |
| 段誉 | `por_npc_duanyu__ch01_youth_shizi_base` | youth_shizi_base | **整体重出** | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；偶像脸、长发飘带、头侧转，书呆子气不足，与慕容复同类脸 | 不上传旧图，按文字重建清瘦书生脸（细长眉眼、鼻头略圆、憨直笑意），浅青圆领长衫、素折扇；五幅场景随新基础图重出；上传参考：无 |
| 虚竹 | `por_npc_xuzhu__ch01_youth_lingjiu_base` | youth_lingjiu_base | **整体重出** | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险（与剧照几乎同一张脸、同一笑容）；原著的招风耳、朝天鼻、厚唇等“丑相”没有表现 | 不上传旧图，按原著五官文字重建朴拙相貌；灰褐僧衣、拇指七宝指环；五幅场景随新基础图重出；上传参考：无 |
| 王语嫣 | `por_npc_wangyuyan__ch01_youth_mantuo_base` | youth_mantuo_base | **整体重出** | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；网红式大眼与偏头姿势 | 不上传旧图，按文字重建清雅原创脸（远山淡眉、眼尾微垂、气色清淡）；藕荷褙子、素玉簪；五幅场景随新基础图重出；上传参考：无 |
| 阿朱 | `por_npc_azhu__ch01_youth_alive_base` | youth_alive_base | **整体重出** | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险（白花发饰、笑容与剧照几乎一致）；旧提示词要求“未成年外观、6–6.5 头身”，画面偏幼态 | 不上传旧图，按原著文字原创灵动鹅蛋脸（浅酒窝、微翘鼻头），淡绛衫、易容小布包；成年比例；上传参考：无 |
| 阿紫 | `por_npc_azi__ch01_youth_sighted_base` | youth_sighted_base | **整体重出** | 双丫髻加紫发带、圆脸大头，看去像十二三岁孩子；旧提示词要求“未成年少女、6–6.5 头身” | 不上传旧图，按原著“全身紫衫、一双大眼乌溜溜、满脸精乖之气”重做成年女子；星宿派小毒囊；上传参考：无 |
| 木婉清 | `por_npc_muwanqing__ch01_youth_unmasked_base` | youth_unmasked_base | **整体重出** | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；手扶肩头的摆拍姿势 | 不上传旧图，按文字重建冷艳原创脸；黑衣、揭下的黑纱、腕间袖箭；上传参考：无 |
| 钟灵 | `por_npc_zhongling__ch01_youth_diaoalive_base` | youth_diaoalive_base | **整体重出** | 看去约十二岁的孩童；以经典剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；旧提示词要求“未成年少女、稍歪头轻笑” | 不上传旧图，按原著“青衫、圆脸大眼、笑靥如花、葱绿绣鞋”重做成年女子，左臂托闪电貂；上传参考：无 |
| 天山童姥 | `por_npc_tonglao__ch01_elder_rejuvenating_base` | elder_rejuvenating_base | **整体重出（待作者拍板）** | 画面就是七八岁女童、婴儿肥卖萌表情，直接违反禁止幼态；原著体型本身是“女童身”，需作者定口径 | 默认：成人比例与五官、个子很矮小，返老还童后容貌如二十余岁、鬓边银丝、眼神老辣；作者若坚持原著女童身另议；上传参考：无 |
| 萧峰 · 剧情场景（5 张） | `por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard`<br>`por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt`<br>`por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm`<br>`por_npc_xiaofeng__ch01_prime_scene_songhelou_wine`<br>`por_npc_xiaofeng__ch01_prime_scene_xingzilin_departure` | juxianzhuang_guard、northern_forest_hunt、shaoshi_dragon_palm、songhelou_wine、xingzilin_departure | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_xiaofeng__ch01_prime_gaibang_base（须为本轮新图） |
| 段誉 · 剧情场景（5 张） | `por_npc_duanyu__ch01_youth_scene_langhuan_scroll`<br>`por_npc_duanyu__ch01_youth_scene_lingbo_escape`<br>`por_npc_duanyu__ch01_youth_scene_shaoshi_invisible_sword`<br>`por_npc_duanyu__ch01_youth_scene_tianlongtemple_first_sword`<br>`por_npc_duanyu__ch01_youth_scene_wuliang_fan` | langhuan_scroll、lingbo_escape、shaoshi_invisible_sword、tianlongtemple_first_sword、wuliang_fan | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_duanyu__ch01_youth_shizi_base（须为本轮新图） |
| 虚竹 · 剧情场景（5 张） | `por_npc_xuzhu__ch01_youth_scene_icecellar_practice`<br>`por_npc_xuzhu__ch01_youth_scene_lingjiu_compassion`<br>`por_npc_xuzhu__ch01_youth_scene_shaoshi_thin_ice`<br>`por_npc_xuzhu__ch01_youth_scene_xiaoyao_inheritance`<br>`por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move` | icecellar_practice、lingjiu_compassion、shaoshi_thin_ice、xiaoyao_inheritance、zhenlong_unintended_move | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_xuzhu__ch01_youth_lingjiu_base（须为本轮新图） |
| 王语嫣 · 剧情场景（5 张） | `por_npc_wangyuyan__ch01_youth_scene_mantuo_camellia`<br>`por_npc_wangyuyan__ch01_youth_scene_mill_hairpin_exchange`<br>`por_npc_wangyuyan__ch01_youth_scene_shaoshi_plea`<br>`por_npc_wangyuyan__ch01_youth_scene_tingxiang_discernment`<br>`por_npc_wangyuyan__ch01_youth_scene_well_self_choice` | mantuo_camellia、mill_hairpin_exchange、shaoshi_plea、tingxiang_discernment、well_self_choice | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_wangyuyan__ch01_youth_mantuo_base（须为本轮新图） |
| 慕容复 | `por_npc_murongfu__ch01_prime_jiazhu_base` | prime_jiazhu_base | 通过 | 白袍佩剑小金冠、神态倨傲，可辨；脸偏模板但非剧照派生 | — |
| 慕容博 | `por_npc_murongbo__ch01_elder_revealed_base` | elder_revealed_base | 通过 | 与萧远山同为深色袍须髯中年，略同质；藏经阁“灰衣僧”装扮细节（待考） | — |
| 鸠摩智 | `por_npc_jiumozhi__ch01_prime_guoshi_base` | prime_guoshi_base | 通过 | 吐蕃国师黄红僧袍、光头，辨识清楚 | — |
| 段延庆 | `por_npc_duanyanqing__ch01_elder_disabled_base` | elder_disabled_base | 通过 | 青袍、双铁杖、面带伤痕，符合“恶贯满盈”形象 | — |
| 丁春秋 | `por_npc_dingchunqiu__ch01_elder_free_base` | elder_free_base | 通过 | 童颜鹤发、羽扇，符合原著 | — |
| 李秋水 | `por_npc_liqiushui__ch01_elder_veiled_base` | elder_veiled_base | 通过 | 白衣蒙面纱，阶段正确 | — |
| 萧远山 | `por_npc_xiaoyuanshan__ch01_elder_revealed_base` | elder_revealed_base | 通过 | 黑衣须髯；萧峰重出后可再看父子相似度 | — |
| 玄慈 | `por_npc_xuanci__ch01_elder_fangzhang_base` | elder_fangzhang_base | 通过 | 少林方丈袈裟，端严 | — |
| 游坦之 | `por_npc_youtanzhi__ch01_youth_ironmask_base` | youth_ironmask_base | 通过 | 铁头面具，辨识清楚 | — |
| 无崖子 | `por_npc_wuyazi__ch01_elder_pretransfer_base` | elder_pretransfer_base | 待作者裁定 | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近（A 级，肖像风险）；虚竹之师 | 默认下一轮按文字重出，本轮不排队 |
| 扫地僧 | `por_npc_saodiseng__ch01_elder_cangjingge_base` | elder_cangjingge_base | 待作者裁定 | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近（A 级，肖像风险）；原著“枯瘦、稀疏几根长须”，图中长须偏多 | 同上 |
| 段正明 / 枯荣 / 苏星河 | `por_npc_duanzhengming / kurong / suxinghe` | 各 _base | 待作者裁定 | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近（A 级，肖像风险） | 同上 |
| 段正淳 / 刀白凤 / 阿碧 | 各 _base | 各 _base | 通过 | 非剧照派生，成年感正常 | — |
| 叶二娘 / 岳老三 / 云中鹤 | 各 _base | 各 _base | 通过（未逐项细核） | 四大恶人其余三人辨识尚可；叶二娘颊上血痕等细节未核（待考） | — |
| 萧峰（雁门关举箭场景） | `por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow` | （无图） | 撤下（待作者定） | 自尽前一刻的情节，旧请求两次被输入审核拒绝、从未出图 | 建议作者另选第五场（如聚贤庄外、雁门关前劝和而非自尽） |

## ch02《射雕英雄传》

| 人物 | ID | 现状图（变体名） | 判定 | 问题 | 改法 |
|---|---|---|---|---|---|
| 郭靖 | `por_npc_guojing__ch02_youth_base` | youth_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；身材偏瘦削，原著“身材粗壮、浓眉大眼、憨厚”的厚重感不足 | 不上传旧图，按文字重建方圆脸憨厚青年（日晒肤色、宽厚体格）；反曲弓、箭囊；五幅场景与神雕郭靖随新图；上传参考：无 |
| 黄蓉 | `por_npc_huangrong__ch02_youth_bangzhu_base` | youth_bangzhu_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险（脸、发髻与花饰都接近剧照）；粉色衣裙不合原著；略显少女幼态；与神雕黄蓉不是同一张脸 | 不上传旧图、不写真人姓名，按作者口径的文字气质原创（灵动大眼、圆润鹅蛋脸、俏皮狡黠笑意、九十年代港剧古装少女的明朗感），淡绿衫、玫瑰枝金环束发、碧绿竹棒；上传参考：无 |
| 洪七公 | `por_npc_hongqigong__ch02_elder_bangzhu_base` | elder_bangzhu_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；原著颏下只有微须，图中却是及胸白长须、红脸老寿星；九指特征不清楚 | 不上传旧图，按原著重做：长方脸、花白短须、粗手大脚，补丁旧衣洗得干净，碧绿竹杖与朱红大葫芦，右手缺食指；上传参考：无 |
| 黄药师 | `por_npc_huangyaoshi__ch02_elder_base` | elder_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；灰黄长发显得过老，青衫文士的清癯傲气不足 | 不上传旧图，按文字重建清癯长脸、剑眉细目、三缕长须、鬓角斑白；青衫方巾、碧玉箫；上传参考：无 |
| 欧阳锋 | `por_npc_ouyangfeng__ch02_elder_sane_base` | elder_sane_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险；原著西域色目人特征（高鼻深目、棕黄须毛）完全缺失 | 不上传旧图，按原著重做西域面孔：高鼻深目、棕黄络腮短须、目光如刀；白袍、蛇杖；并作神雕欧阳锋身份参考；上传参考：无 |
| 周伯通 | `por_npc_zhoubotong__ch02_elder_base` | elder_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险（五官与剧照高度一致） | 不上传旧图，按文字重建圆脸红润、花白乱发长须、顽皮眼神的老顽童；上传参考：无 |
| 梅超风 | `por_npc_meichaofeng__ch02_prime_blind_base` | prime_blind_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险 | 不上传旧图，按文字重建瘦削苍白、双目失明的成熟女子；黑衣披发、银白长鞭；上传参考：无 |
| 杨康 | `por_npc_yangkang__ch02_youth_wangfu_base` | youth_wangfu_base | **整体重出** | 以 1983 年版剧集剧照为第一身份参考生成，脸与剧中演员相近，有真人肖像风险 | 不上传旧图，按文字重建剑眉丹凤眼、骄矜带狡黠的贵公子；淡金锦袍、小金冠；上传参考：无 |
| 一灯大师 | `por_npc_yideng__ch02_elder_monk_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 按原著文字补出；神雕一灯以此为身份参考；上传参考：无 |
| 陈玄风 | `por_npc_chenxuanfeng__ch02_prime_flashback_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 按文字补出凶悍壮年男子、空手爪掌戒备；上传参考：无 |
| 裘千仞 | `por_npc_qiuqianren__ch02_elder_tiezhang_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图；旧稿为避开孪生兄弟裘千丈而去掉蒲扇，本稿按原著保留 | 按原著补出白须老者、黄葛短衫、大蒲扇、铁掌；上传参考：无 |
| 柯镇恶 | `por_npc_kezhene__ch02_elder_blind_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 按原著补出盲眼老侠，黑铁杖、毒菱囊；上传参考：无 |
| 完颜洪烈 | `por_npc_wanyanhonglie__ch02_prime_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 按文字补出四十余岁、俊雅有城府的金国亲王；上传参考：无 |
| 郭靖 · 剧情场景（5 张） | `por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson`<br>`por_npc_guojing__ch02_youth_scene_grassland_double_eagle`<br>`por_npc_guojing__ch02_youth_scene_northern_camp_hero_discourse`<br>`por_npc_guojing__ch02_youth_scene_peach_island_square_circle`<br>`por_npc_guojing__ch02_youth_scene_second_huashan_palm` | first_dragon_palm_lesson、grassland_double_eagle、northern_camp_hero_discourse、peach_island_square_circle、second_huashan_palm | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_guojing__ch02_youth_base（须为本轮新图） |
| 黄蓉 · 剧情场景（5 张） | `por_npc_huangrong__ch02_youth_scene_cooking_meets_hongqigong`<br>`por_npc_huangrong__ch02_youth_scene_iron_spear_temple_truth`<br>`por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader`<br>`por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound`<br>`por_npc_huangrong__ch02_youth_scene_young_beggar_disguise` | cooking_meets_hongqigong、iron_spear_temple_truth、junshan_beggar_leader、yideng_heals_iron_palm_wound、young_beggar_disguise | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_huangrong__ch02_youth_bangzhu_base（须为本轮新图） |
| 朱聪 / 韩宝驹 / 南希仁 / 全金发 / 韩小莹 / 张阿生 | 各 _base | 各 _base | 通过 | 郭靖的师父们；非剧照派生，兵器标志（折扇、金龙鞭、扁担、秤、越女剑、屠刀）可辨 | — |
| 马钰 / 王处一 | 各 _base | 各 _base | 通过 | 全真道士形象正常 | — |
| 穆念慈 / 欧阳克 / 杨铁心 / 包惜弱 / 华筝 / 陆乘风 | 各 _base | 各 _base | 待作者裁定 | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近（A 级，肖像风险） | 默认下一轮按文字重出，本轮不排队 |
| 丘处机 / 铁木真 / 拖雷 | `por_npc_qiuchuji / tiemuzhen / tuolei` | （无图） | 缺口 | A 级、提示词 ready 但从未出图；非本组重点范围 | 交协调者排入常规补图 |

## ch03《神雕侠侣》

| 人物 | ID | 现状图（变体名） | 判定 | 问题 | 改法 |
|---|---|---|---|---|---|
| 杨过 | `por_npc_yangguo__ch03_youth_onearm_base` | youth_onearm_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；断臂方向（右臂）与重剑正确，可保留 | 不上传旧图，按原著文字原创清癯俊秀脸；右袖空、左手玄铁重剑；五幅场景随新基础图；上传参考：无 |
| 小龙女 | `por_npc_xiaolongnv__ch03_youth_jueqing_base` | youth_jueqing_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险 | 不上传旧图，按原著文字原创清冷长鹅蛋脸；素白衣裙、淑女剑；五幅场景随新基础图；上传参考：无 |
| 黄蓉 | `por_npc_huangrong__ch03_prime_base` | prime_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；与射雕黄蓉不是同一张脸（两书分别取自两位演员） | 上传本轮新出的射雕黄蓉作唯一身份参考，同一张脸自然成熟；淡青绿褙子、妇人髻与金环、打狗棒；上传参考：por_npc_huangrong__ch02_youth_bangzhu_base（须为本轮新图） |
| 郭靖 | `por_npc_guojing__ch03_prime_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 上传新射雕郭靖，按中年守城大侠补出；上传参考：por_npc_guojing__ch02_youth_base（须为本轮新图） |
| 郭襄 | `por_npc_guoxiang__ch03_youth_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图；旧稿写“十六岁少女、身体纤巧符合少年发育”，须改成年 | 按原著衣饰与爽朗气质补出约二十岁女子；上传参考：无 |
| 李莫愁 | `por_npc_limochou__ch03_prime_base` | prime_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；原著杏黄道袍画成了米白衣裙 | 不上传旧图，按原著文字原创妩媚而冷的道姑；杏黄道袍、白马尾拂尘；上传参考：无 |
| 公孙止 | `por_npc_gongsunzhi__ch03_prime_twoeyes_base` | prime_twoeyes_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；深绿袍子与健康气色不合原著 | 不上传旧图，按原著重做：四十五六岁、英俊而面皮腊黄、微髭，宝蓝缎袍，金刀黑剑；上传参考：无 |
| 金轮法王 | `por_npc_jinlunfawang__ch03_elder_base` | elder_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；红袍为主、留发、体格壮实，与原著不符 | 不上传旧图，按原著重做：极高极瘦、剃发、脑门微陷、黄色僧袍、金轮；上传参考：无 |
| 欧阳锋 | `por_npc_ouyangfeng__ch03_elder_base` | elder_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；与射雕欧阳锋不是同一张脸，西域相貌缺失 | 上传本轮新射雕欧阳锋作身份参考：同一张高鼻深目的脸老二十年、须发花白蓬乱、神志迷乱；上传参考：por_npc_ouyangfeng__ch02_elder_sane_base（须为本轮新图） |
| 黄药师 | `por_npc_huangyaoshi__ch03_elder_base` | elder_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；跨书不一致 | 上传本轮新射雕黄药师作身份参考：须发大半灰白、更清瘦，仍是青衫玉箫；上传参考：por_npc_huangyaoshi__ch02_elder_base（须为本轮新图） |
| 一灯大师 | `por_npc_yideng__ch03_elder_base` | elder_base | **整体重出** | 以 1995 年版剧集剧照为第一身份参考生成，脸与剧中演员相近（画面接近剧照），有真人肖像风险；跨书无法对齐 | 上传本轮新射雕一灯作身份参考：白眉更长、须全白、更慈和；上传参考：por_npc_yideng__ch02_elder_monk_base（须为本轮新图） |
| 洪七公 | `por_npc_hongqigong__ch03_elder_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 上传新射雕洪七公，按华山雪峰前的老丐补出；上传参考：por_npc_hongqigong__ch02_elder_bangzhu_base（须为本轮新图） |
| 周伯通 | `por_npc_zhoubotong__ch03_elder_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 上传新射雕周伯通，按百花谷阶段补出；上传参考：por_npc_zhoubotong__ch02_elder_base（须为本轮新图） |
| 慈恩（裘千仞） | `por_npc_qiuqianren__ch03_elder_cien_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图 | 上传新射雕裘千仞，补出剃度后的老僧；上传参考：por_npc_qiuqianren__ch02_elder_tiezhang_base（须为本轮新图） |
| 张君宝（张三丰） | `por_npc_zhangsanfeng__ch03_youth_base` | （提示词在、从未出图） | **补出** | 提示词 ready 但从未出图；旧稿写“少年”，须改成年 | 上传新倚天张三丰，按共享五官锚点（宽额、长眉、细长眼、圆厚鼻头、大耳垂）补出约二十岁青年；上传参考：por_npc_zhangsanfeng__ch04_elder_taiji_base（须为本轮新图） |
| 杨过 · 剧情场景（5 张） | `por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue`<br>`por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff`<br>`por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion`<br>`por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor`<br>`por_npc_yangguo__ch03_prime_scene_xiangyang_platform_rescue_palm` | chongyang_palace_rescue、dashengguan_youth_bamboo_staff、sixteen_years_valley_reunion、torrent_heavy_sword_condor、xiangyang_platform_rescue_palm | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_yangguo__ch03_youth_onearm_base（须为本轮新图） |
| 小龙女 · 剧情场景（5 张） | `por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson`<br>`por_npc_xiaolongnv__ch03_youth_scene_chongyang_two_sword_combat`<br>`por_npc_xiaolongnv__ch03_youth_scene_dashengguan_silk_bells`<br>`por_npc_xiaolongnv__ch03_youth_scene_heartbreak_cliff_sixteen_year_promise`<br>`por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message` | ancient_tomb_sparrow_lesson、chongyang_two_sword_combat、dashengguan_silk_bells、heartbreak_cliff_sixteen_year_promise、valley_jade_bee_message | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_xiaolongnv__ch03_youth_jueqing_base（须为本轮新图） |
| 郭芙 / 程英 / 陆无双 / 公孙绿萼 / 裘千尺 / 霍都 / 耶律齐 | 各 _base | 各 _base | 待作者裁定 | 以经典剧集剧照为第一身份参考生成，脸与剧中演员相近（A 级，肖像风险）；其中程英、陆无双、公孙绿萼是杨过身边的重要女角 | 默认下一轮按文字重出，本轮不排队 |
| 觉远 | `por_npc_jueyuan__ch03_elder_base` | elder_base | 通过 | 张君宝之师；非剧照派生。原著华山时身系铁链挑铁桶等细节（待考） | — |
| 达尔巴 / 潇湘子 / 樊一翁 / 冯默风 / 武三通 / 武氏兄弟 / 完颜萍 / 耶律燕 / 朱子柳 | 各 _base | 各 _base | 通过（未逐项细核） | 非重点人物，未见幼态或明显硬伤 | — |
| 何足道 / 神雕 | npc_hezudao / npc_shendiao | （无提示词） | 缺口 | 名录有、无提示词（后界钩子 / 非人形） | 另行处理 |

## ch04《倚天屠龙记》

| 人物 | ID | 现状图（变体名） | 判定 | 问题 | 改法 |
|---|---|---|---|---|---|
| 张三丰 | `por_npc_zhangsanfeng__ch04_elder_taiji_base` | elder_taiji_base | **整体重出** | 看上去只有六七十岁、表情严肃、道袍干净华整；原著的鹤发童颜、笑眯眯、邋遢道袍都没有；缺少能与少年张君宝对上的辨识点 | 不上传旧图，按原著重做百岁张三丰：雪白长寿眉垂到眼角、红润光滑脸、笑眯眯、大耳垂、旧青布道袍；作为神雕张君宝的身份参考；上传参考：无 |
| 黛绮丝（紫衫龙王真容） | `por_npc_daiqisi__ch04_prime_longwang_base` | （无图） | **补出** | 现有只有金花婆婆老妇伪装（该图本身合格，保留） | 新建真容变体：高鼻深目、杏眼桃腮、肤白如雪、淡紫长衫，约四十岁；上传参考：无 |
| 小昭 | `por_npc_xiaozhao__ch04_youth_chained_base` | youth_chained_base | **整体重出** | 旧提示词明写“明显少女稚气、尚未长成”，画面娃娃脸（幼态）；白色仙裙不像侍女；高鼻、蓝意眼瞳等混血特征被刻意压掉 | 上传本轮新出的黛绮丝真容（只借母女相似），按原著写清混血特征与梨涡；青色侍女衣裙、手足细铁链；成年比例；上传参考：por_npc_daiqisi__ch04_prime_longwang_base（须为本轮新图） |
| 殷离 | `por_npc_yinli__ch04_youth_disfigured_base` | youth_disfigured_base | **整体重出** | 娃娃脸幼态；千蛛万毒手造成的浮肿黝黑完全没画出来；衣着不是荆钗布裙 | 不上传旧图，按原著如实画浮肿黝黑的脸与明亮倔强的眼睛，荆钗布裙；成年比例；不恐怖化；上传参考：无 |
| 范遥（苦头陀） | `por_npc_fanyao__ch04_prime_kutoutuo_base` | prime_kutoutuo_base | **整体重出** | 自毁容貌的刀疤、红棕长发、头陀装束全部缺失；与杨逍等撞脸 | 不上传旧图，按原著重做满脸旧刀疤、红棕披肩发、铁发箍的魁伟头陀；上传参考：无 |
| 殷素素 | `por_npc_yinsusu__ch04_prime_ziwei_base` | prime_ziwei_base | **整体重出** | AI 网红脸（大眼、尖下巴、磨皮），与周芷若、小昭等同类脸 | 不上传旧图，按文字原创灵动狡黠的成年女子，淡紫衫、蚊须针；上传参考：无 |
| 灭绝师太 | `por_npc_miejueshitai__ch04_elder_yitian_base` | elder_yitian_base | **微调重出** | 眉形平直上挑，原著“容貌算得甚美，但两条眉毛斜斜下垂，一副面相极是诡异”没有表现 | 上传现图保留脸与装束，只改眉形为明显下垂的八字长眉、约四十四五岁、灰色尼帽与倚天剑；上传参考：por_npc_miejueshitai__ch04_elder_yitian_base（现图） |
| 赵敏 | `por_npc_zhaomin__ch04_youth_lvliu_base` | （提示词在、从未出图） | **补出** | 缺 _base；五幅场景以经典剧照为第一身份参考生成（肖像风险）；旧稿衣色浅黄与原著宝蓝不符 | 不上传任何图，按原著男装公子形象原创补出（宝蓝绸衫、白玉柄折扇）；五幅场景随新基础图重出；上传参考：无 |
| 周芷若 | `por_npc_zhouzhiruo__ch04_youth_zhangmen_base` | （提示词在、从未出图） | **补出** | 缺 _base；青年场景借汉水童年图定脸，面容幼态 | 不上传任何图，原创补出成年峨眉掌门（屠狮大会阶段）；四幅青年场景随新基础图重出；上传参考：无 |
| 赵敏 · 剧情场景（5 张） | `por_npc_zhaomin__ch04_youth_scene_haozhou`<br>`por_npc_zhaomin__ch04_youth_scene_jiusi`<br>`por_npc_zhaomin__ch04_youth_scene_lvliu`<br>`por_npc_zhaomin__ch04_youth_scene_wanansi`<br>`por_npc_zhaomin__ch04_youth_scene_wudang` | haozhou、jiusi、lvliu、wanansi、wudang | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_zhaomin__ch04_youth_lvliu_base（须为本轮新图） |
| 周芷若 · 剧情场景（4 张） | `por_npc_zhouzhiruo__ch04_youth_scene_guangmingding`<br>`por_npc_zhouzhiruo__ch04_youth_scene_hongshang`<br>`por_npc_zhouzhiruo__ch04_youth_scene_shaolin`<br>`por_npc_zhouzhiruo__ch04_youth_scene_wanansi` | guangmingding、hongshang、shaolin、wanansi | **整体重出（随基础图）** | 场景脸与旧基础图同源 | 上传本轮新基础图作身份参考，场景内容沿用；上传参考：por_npc_zhouzhiruo__ch04_youth_zhangmen_base（须为本轮新图） |
| 张无忌 | `por_npc_zhangwuji__ch04_youth_jiaozhu_base（+5 场景）` | youth_jiaozhu_base | 通过（备注） | 非剧照派生，五幅场景与基础图一致；脸偏模板，与张翠山、宋青书同类 | 本轮不动；主角与赵敏、周芷若重出后若仍撞脸，再整套重出 |
| 张翠山 | `por_npc_zhangcuishan__ch04_prime_wangpanshan_base` | prime_wangpanshan_base | 通过 | 虎头钩与判官笔、书生气；与张无忌父子相像可接受 | — |
| 谢逊 | `por_npc_xiexun__ch04_elder_blind_base` | elder_blind_base | 通过 | 金发金须、双目失明、屠龙刀，辨识度高 | — |
| 黛绮丝（金花婆婆） | `por_npc_daiqisi__ch04_prime_jinhua_base` | prime_jinhua_base | 通过 | 老妇伪装、拐杖，阶段正确；真容版另补 | 见补出行 |
| 成昆 | `por_npc_chengkun__ch04_elder_yuanzhen_base` | elder_yuanzhen_base | 通过 | 光头八字须、圆真僧装 | — |
| 鹿杖客 / 鹤笔翁 | 各 _base | 各 _base | 通过 | 鹿角杖、鹤嘴笔标志清楚 | — |
| 渡厄 / 渡劫 / 渡难 | 各 _base | 各 _base | 通过（备注） | 三僧黑索、枯瘦，三人相貌偏同质（原著即三僧一组） | — |
| 王保保 | `por_npc_wangbaobao__ch04_prime_commander_base` | prime_commander_base | 通过 | 元军统帅甲胄 | — |
| 流云使 / 妙风使 / 辉月使 | 各 _base | 各 _base | 通过 | 波斯面貌与服饰已体现 | — |
| 杨逍 / 殷天正 | 各 _base | 各 _base | 通过 | 殷天正白眉鹰钩鼻可辨 | — |
| 韦一笑 | `por_npc_weiyixiao__ch04_prime_base` | prime_base | 通过（备注） | 原著青翼蝠王的青白脸色未表现（待考） | 下一轮可微调 |
| 周芷若（汉水童年场景） | `por_npc_zhouzhiruo__ch04_child_scene_hanshui` | child_scene_hanshui | 撤下（待作者定） | 画面主体是约十岁女童，与“全体禁止幼态”冲突 | 默认不重出、不再使用；如需第五幅，作者另选成年阶段场景 |
| 何太冲 / 班淑娴 | npc_hetaichong / npc_banshuxian | （无提示词） | 缺口 | 名录有、无提示词 | 交协调者 |

## 生成队列与依赖

- 文件：`.agents/coord/portrait_redo/A-ch00-04.txt`，每行 `asset_id  # 参考: …`，排序保证被上传的图先出。
- 顺序：主角男女 ch00 锚点 → 序章 → 天龙（基础图后接场景）→ 射雕（基础图后接场景）→ 神雕（独立条目与上传新射雕图的跨书条目，后接场景）→ 倚天独立条目 → 张君宝（上传新张三丰）、小昭（上传黛绮丝真容）→ 倚天场景 → 主角其余 26 张时代图。
- 建议在两张主角锚点出图后先请作者过目，再跑队尾的 26 张主角时代图；同理黄蓉射雕版定稿后再出神雕版。
- `reference_upload` 写的是参考图的正式输出路径。出图线必须先完成被参考的那张、并确认该路径已是本轮新图，再出依赖它的条目；男主 ch00 上传的是自己的旧图，覆盖前要先留底。
- 出图线只读 `## Gemini 提示词` 一节；frontmatter 的 `references` 与旧“提示词”节是旧管线历史，不上传、不拼接。

## 需要作者拍板（附默认）

1. **天山童姥的体型**：原著“身如八九岁女童”，与“全体禁止幼态”冲突。默认：成人比例、个子极矮小的女子，返老还童后容貌约二十多岁、鬓边银丝、眼神老辣威严；若坚持原著女童体型，另议。
2. **周芷若《汉水一碗饭》童年场景**：画面主体是十岁女童。默认：撤下不再使用、不重出；她的第五幅场景若要补，请作者点名一个成年阶段的情节。
3. **萧峰《雁门关举箭》场景**：自尽前一刻的情节，旧请求两次被输入审核拒绝、从未出图。默认：不再尝试，第五幅另选（请作者点名）。
4. **主角的全书辨识标志**：男主加“左眉眉峰一道浅白旧疤”，男女主都在发髻（清代为辫梢）系一根褪色朱红细绳；女主换成文字原创的新脸（平直浓眉、细长杏眼、右眼下小痣）。默认采用；两张锚点出图后先给作者看。
5. **剧照派生的 A 级配角**（天龙：无崖子、扫地僧、段正明、枯荣、苏星河；射雕：穆念慈、欧阳克、杨铁心、包惜弱、华筝、陆乘风；神雕：郭芙、程英、陆无双、公孙绿萼、裘千尺、霍都、耶律齐）：默认下一轮按文字重出，本轮不排队。
6. **黄蓉衣色**：原著初次女装是“白衣金带”，后来才有金环；作者要求“绿衫”。默认两书统一淡绿衫、发箍玫瑰花枝纹金环，射雕版持碧绿打狗棒。
7. **序章阿青、范蠡**：仓库原本没有提示词和图。默认新建，人物键沿用 `chapters/00` §4.1 的待定义键 `npc_aqing`、`npc_fanli`；阿青定 S 级（序章核心、传《长生诀》第一层），范蠡定 A 级。
8. **赵敏基础立绘的造型**：默认取原著绿柳山庄初见的男装公子（宝蓝绸衫、白玉柄折扇）；若要女装郡主版，另补一个变体。
9. **黛绮丝两个基础变体并存**（金花婆婆 / 紫衫龙王真容）：默认身份揭开前用金花婆婆，揭开后用真容；运行时头像默认哪一个由协调者和工程定。
10. **张无忌本轮不重出**：脸偏模板，但不是剧照派生，五幅场景与基础图一致。默认先不动，等主角、赵敏、周芷若新图出来后再看是否撞脸。

## 交协调者

- `GUIDE.md` 已加 §0（AR-29 / AR-30 口径：禁止幼态、去 AI 味、辨识度参考、原著优先、Gemini 提示词与上传参考、画风底线、主角一致、跨书顺序），文首旧的“影视面容参考获授权”一句改为指向 §0；§4 自查表“年龄与尊重”“禁止项”两行同步改。
- `tools/agents/check_portrait_prompts.py` 只认 `status: draft / ready`，也不认 `## Gemini 提示词`；本轮按说明写了 `redo` / `new`，检查脚本需要协调者同步（该脚本在本组改动前就对多数文件报“缺少人物要点”）。
- `INDEX.md` 没有手改；新建的 `ch00-yuenv/` 分组和 `npc_daiqisi__longwang.md` 需要协调者重跑 `tools/agents/build_portrait_index.py`。
- 旧提示词历史段落和 frontmatter `references` 里留有演员姓名与剧照路径（保留作历史，未删）；出图线不得上传这些路径。
- 主角 ch10（白马）两张暂缓，等 DES-baima-tang 的唐代服饰定稿后补写；书灵不在本次人物口径内。
- 本组没有新增给 B、C 组的补充。
