---
asset_id: cg_ch08_retirement_choice
name: 江湖归去
book: ch08_luding
characters:
- npc_weixiaobao
- npc_shuanger
- npc_ake
- npc_suquan
- npc_fangyi
- npc_mujianping
- npc_zengrou
- npc_jianning
output: assets/default/scene/ch08/cg_ch08_retirement_choice.png
manifest: assets/default/scene/ch08/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: AR-89 拉远同归，重写提示词整张重出
references:
- path: assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
  sha256: 8713f92abd849f5d45ea77a4350d02a26d753eb4961eb0243b42786fafb92714
  use: 韦小宝现行base服色与发型；身份及画风参考
- path: assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png
  sha256: 3316d1fcf22fb8f59911b673be17fb582d3b247575685e2cacf823117ee64eb6
  use: 双儿现行base服色与发型；身份及画风参考
- path: assets/default/character/female/ch08/por_npc_ake__ch08_youth_base.png
  sha256: b268298f30a8c9776fd1bf3612a98afc13c4dda6e95558ed53a0bd6d986cf142
  use: 阿珂现行base服色与发型；AR-84作者选A
- path: assets/default/character/female/ch08/por_npc_suquan__ch08_youth_base.png
  sha256: 1892b6ba86b08d9cfb422fbd62b4deb6d4dcc7cddd63ac8d5c6656483bcbbe81
  use: 苏荃现行base服色与发型；身份及画风参考
- path: assets/default/character/female/ch08/por_npc_fangyi__ch08_youth_base.png
  sha256: e781660d6cc280642c24afd69c90c6de1e4c3de88bef12336898d14f64d4fdf2
  use: 方怡现行base服色与发型；身份及画风参考
- path: assets/default/character/female/ch08/por_npc_mujianping__ch08_youth_base.png
  sha256: 311389e9ee91d0b57a73051469dc8f393a27e7bc024a82291a0503f9ead8d2ea
  use: 沐剑屏现行base服色与发型；身份及画风参考
- path: assets/default/character/female/ch08/por_npc_zengrou__ch08_youth_base.png
  sha256: 114553d5257c41d7a4831941a012c926fcaf3e18a50392bde97bc57df6f4615e
  use: 曾柔现行base服色与发型；身份及画风参考
- path: assets/default/character/female/ch08/por_npc_jianning__ch08_child_palace_base.png
  sha256: df57b28d41579492a993721c45e350be907f76f2926a64f33412cf280ce78c5f
  use: 建宁现行base服色与发型；身份及画风参考
generation_reference_limit: 5
generation_reference_boards: 4
generation_method: 全新整张生成，仅四张双人base资料板；不上传现CG，不局部改脸
title_text: 江湖归去
title_method: generated
generation_attempts: 2
generation_job: cg_ch08_retirement_choice.ar89_full2
selected_candidate: B
candidates_reviewed:
- cg_ch08_retirement_choice.ar89_full1
- cg_ch08_retirement_choice.ar89_full2
title_verified: 已真实打开每张候选及放大图，选定图逐字确认竖排楷书简体江／湖／归／去；归非帰
review_record: .agents/coord/_lines/retire-regen/selection.json
composition_variant: 【候选B构图】稍高一些的远景视点，船从画面下部偏左斜向右上驶去，右前方江面与层山敞开；一面小布帆位于后舱侧，不遮任何头部。人物保持小尺度，八人在前甲板自然错落，尾波向左下延伸。
---

## 原著依据

- 金庸《鹿鼎记》第五十回「鹗立云端原矫矫　鸿飞天外又冥冥」。
- 原文短摘：「夫妻八人依计而行」；「一家人同去云南」；「在大理城过那逍遥自在的日子」。
- 去哪里：先改装到扬州接母，再全家赴云南，最终在大理隐姓埋名生活。不是留在京城，也不是康熙来渡口送行。
- 怎么走：官船烧毁后，韦小宝、建宁、双儿先改装赴淮阴客店等候，苏荃带方怡、阿珂、沐剑屏、曾柔去泗阳集余船取回财物，随后夫妻八人依计共同离开。末段对扬州至云南的路线和交通工具未作具体描写，不能断言八人原文就同乘这一艘船。
- 谁在场：夫妻八人为韦小宝、双儿、阿珂、苏荃、方怡、沐剑屏、曾柔、建宁。扬州接母后同行家庭还包括母亲韦春芳与孩子；画面把他们安排在遮蔽船舱内，八位主角之外不另露人影。无康熙或岸上送行者。
- 本图取景：扬州接母之后远行途中的民用篷船已经离岸，八人共同面向航行方向。船、渡口、清晨薄雾和人物站位为原创视觉扩展；并非把原著官船烧毁那一刻改画成平静离岸。
- 核查来源：[第五十回末段，经典书库](https://www.jingdianbook.com/book_9370/50_8.html)；[第五十回，努努书坊](https://www.kanunu8.com/wuxia/201102/1624/36996.html)交叉核对。2026-10-04访问。前者少数字用图片替代，摘句避开缺字；据在线转录核情节，未宣称纸本逐字校勘。直接抓取使用通用 `User-Agent: TianshuBot/1.0`，请求不带作者个人标识。

## AR-89 当前提示词

```text
Use case: historical-scene
Asset type: 江湖群侠项目《鹿鼎记》剧情CG；全新完整生成，1536×1024，3:2横幅。
【核心】江湖归去：镜头拉远的山水远景，韦小宝与七位夫人八人已经同乘一艘民用篷船离开渡口，一起驶向前方。不是合影，不是登船时刻；岸上没有任何相送的人。八人小而可数，山水是画面主体。
【四张参考的用途】参考图都是现行base服色、发型和手绘质感的资料板，绝不是待编辑场景。第1张左韦小宝、右双儿；第2张左阿珂（AR-84作者选A）、右苏荃；第3张左方怡、右沐剑屏；第4张左曾柔、右建宁。每人仅出现一次。不要把参考板边框、序号、姓名、立绘背景或站姿复制进画面。没有旧CG参考；从空白整张创作。
【场景与剧情】清初，夫妻八人已取回财物，改装到扬州接母后，全家赴云南隐姓埋名。这是远行途中一个不指认地名的山水河段。宽阔江水、层层青灰远山、烟岚、稀疏芦苇与岸树；左下远离船身的小渡口已经空无一人。民用船无官旗、无皇家标识，船舱篷帘合拢，母亲与孩子在舱内，不露出额外人物。渡口、晨雾和这一段乘船为取景扩展，不能画成原官船燃烧前后的现场。
【距离与运动】岸上较高处的远景视点，略俯视船的斜后侧，绝不近景或半身构图。完整船身约画宽35%至40%；八人聚集的整体约画宽23%，每人可见身形仅画高8%至12%，头部很小。至少三分之二画幅留给山、水和空白。船已与渡口明显拉开水面间隔，船头朝画面右上方开阔水面，船尾淡淡V形尾波通向左下旧渡口；船帆带风、船头轻微破水。用船身、尾波和八人身体方向让人一眼读懂一家人共同离去。
【恰好八人】开放甲板上仅1位成年男性韦小宝和7位成年女性；八个独立头部都露出，任何头部不被人或篷遮挡，不增船夫、孩童、侍卫、路人、远处人影。八人在同一甲板内紧密聚成两层自然错落的家庭小组，全部随船朝右上前进，多为侧面或斜背三分之四面，可以略见脸，没人向岸上回望挥手，没人站在渡口。人物表情和五官只需小尺度的自然概括，服色与发型优先；不是八人一字排开的合影。
【八人的衣装和位置】
1. 韦小宝靠近小组中间，深藏蓝长袍、棕红马褂、黑瓜皮帽，剃额留辫，年轻成年男性；握着双儿的手，轻松安定，望向船头。
2. 双儿在韦小宝身旁：白底淡蓝花纹衣、浅蓝裙；软刘海、盘髻与淡粉花饰；温柔信赖，共看前路。
3. 阿珂在韦小宝另一侧：米白花纹衣、灰蓝腰裙；齐刘海、花饰髻、单侧长辫，作者选定A的秀丽气质；矜持平静。
4. 苏荃在小组靠舱一侧：深紫长衣、金褐绣缘；成熟高髻、彩色花蝶饰；安稳从容，一手护住身边的行李箱。
5. 方怡靠近苏荃和沐剑屏：暗紫花纹背心、米白花纹宽袖；髻配小红花、单侧长辫；聪慧沉静。
6. 沐剑屏紧邻方怡：浅绿花纹衣、淡粉衣缘；碎齐刘海、绿花头饰、双侧细辫；欣悦地挽着方怡手臂。
7. 曾柔在小组外侧但始终在船内：灰绿衣、土黄围巾；朴素盘髻、木簪、短刘海；安静含羞，轻扶身旁建宁的衣袖。
8. 建宁紧邻曾柔：暗蓝花纹背心、玫红宽袖衣；左右双髻簪花，成年妻子比例；神态稍骄矜而对前方好奇。不用公主朝冠或幼童造型。
【人物状态和关系】八人无伤无病，无战斗无内力爆发；便服与小包袱、行李箱表现离开官场。互相挽臂、扶袖、相依站坐，温暖而自然，行动一致，不表演统一笑容。手与身体比例正常。
【画风】遵照项目STYLE：男性写实武侠，女性古典美丽，人物衣料、头发和船木有细腻手绘质感；低饱和靛蓝、紫、灰绿与淡粉米白服色，温和清晨自然光。山水有更多水墨意趣：宣纸纹理、虚实、淡墨晕染、清雅留白，仍是可读的真实空间。非照片、动漫、3D、塑料CG或厚重油画。画面安静宽远，别用宏伟宫殿、浓艳天空或壮观奇幻瀑布抢主题。
【唯一题字】右上方空白处，自上而下竖排楷书毛笔准确写“江”“湖”“归”“去”，四字每字仅一次。简体“归”是U+5F52，左边两笔、右边彐，严禁日文字形“帰”和繁体“歸”。楷书清晰端正，不用草书变体；整列约画高25%至30%，不挡山水主体或人物。底下可有一枚小朱红方印，无其他可读文字，绝不出现参考板姓名和编号。
【强制检查】8个头部＝1男＋7女，8人全部在同一条离岸的船上；服色发型逐个符合上述参考；山水远景、人物小；船头、尾波和人物朝向一致；岸上无人；题字恰为简体竖排楷书“江湖归去”。
```

## 出图与验收

- 仅往 codex_w17 已启动 runner 的 queue.txt 追加作业；不启动、重启或改动其他 runner。
- 先整张生成2张候选，必要时再生成第3张；总调用最多6次。各张仅上传四张双人base参考板。
- 每张必须真实打开整图和人物、题字放大图；数清8人、1男7女、全部在船上，逐人核服色与发型，核同一航向与岸上无人。
- 逐字检查楷书简体江／湖／归／去，禁止帰；远景不做逐人五官贴回。
- 最终对照表：`.agents/coord/_lines/retire-regen/retire_new.jpg`，含旧图、新图、八人位置标注。

## 历史提示词

以下完整保留 AR-75 旧文件（含元数据和旧验收记录），仅供追溯，不用于本次生成。

````markdown
---
asset_id: cg_ch08_retirement_choice
name: 江湖归去
book: ch08_luding
characters:
- npc_weixiaobao
- npc_shuanger
- npc_ake
- npc_suquan
- npc_fangyi
- npc_mujianping
- npc_zengrou
- npc_jianning
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_ake__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_suquan__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_fangyi__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_mujianping__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_zengrou__ch08_youth_base.png
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/character/female/ch08/por_npc_jianning__ch08_child_palace_base.png
output: assets/default/scene/ch08/cg_ch08_retirement_choice.png
manifest: assets/default/scene/ch08/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: AR-75 韦小宝与七位夫人同框；AR-53 / AR-84 八人逐一对齐现行base
references:
- path: assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png
  use: 韦小宝现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png
  use: 双儿现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_ake__ch08_youth_base.png
  use: 阿珂现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_suquan__ch08_youth_base.png
  use: 苏荃现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_fangyi__ch08_youth_base.png
  use: 方怡现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_mujianping__ch08_youth_base.png
  use: 沐剑屏现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_zengrou__ch08_youth_base.png
  use: 曾柔现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
- path: assets/default/character/female/ch08/por_npc_jianning__ch08_child_palace_base.png
  use: 建宁现行身份基线；八人逐一局部对脸，整图阶段只上传前四人
generation_reference_limit: 5
full_generation_references:
- npc_weixiaobao
- npc_shuanger
- npc_ake
- npc_suquan
title_text: 江湖归去
title_method: generated
identity_revision: 阿珂AR-84作者选A（ff0e4020）；其余七人使用现行base；八人分别局部合成
generation_job: cg_ch08_retirement_choice.ar75_full1
generation_attempts: 1
identity_patch_jobs:
- cg_ch08_retirement_choice.ar75_face_weixiaobao1
- cg_ch08_retirement_choice.ar75_face_shuanger1
- cg_ch08_retirement_choice.ar75_face_ake1
- cg_ch08_retirement_choice.ar75_face_suquan1
- cg_ch08_retirement_choice.ar75_face_fangyi2
- cg_ch08_retirement_choice.ar75_face_mujianping2
- cg_ch08_retirement_choice.ar75_face_zengrou1
- cg_ch08_retirement_choice.ar75_face_jianning1
title_verified: 已打开整图逐字确认江／湖／归／去与朱印；局部合成后题字像素完全一致
---

## 原著依据

- 书名：金庸《鹿鼎记》。
- 回目：第五十回「鹗立云端原矫矫　鸿飞天外又冥冥」。
- 摘句：「夫妻八人依计而行」。
- 结尾情节：八人取回财物后改装到扬州，接母同往云南，隐姓埋名居于大理。八位主角是韦小宝、双儿、阿珂、苏荃、方怡、沐剑屏、曾柔、建宁。
- 核查：[第五十回在线正文](https://www.kanunu8.com/wuxia/201102/1624/36996.html)结尾；[另一在线正文](https://www.jingdianbook.com/book_9370/50_8.html)交叉核对，2026-10-03访问。在线转录用于核实情节与短摘句，未宣称纸本逐字校勘。
- 取景说明：画面是离京、扬州接母之后远行途中的山水渡口登船，非京城当日出发；渡口、晨雾、旅行衣色、动作站位为原创扩展。母亲与孩子在遮篷舱内，不另露脸，主体为夫妻八人。

## Gemini 提示词

```text
生成一张3:2横幅写实手绘清代武侠剧情插画，1536×1024，单幅完整场景。八位主要人物全为成年人，必须有且仅有韦小宝与七位夫人八张清楚可辨的脸，不漏人、不重复人、不串脸。
【参考分工】第1张韦小宝现行base：锁定本人面容、清代剃额留辫与黑瓜皮帽；第2张双儿现行base：锁定她的脸、刘海、花饰发髻与蓝白衣装；第3张阿珂现行base（作者AR-84选A）：锁定她的脸、齐刘海、单侧长辫和白米色衣装；第4张苏荃现行base：锁定她的脸、成熟气质、花饰发髻与紫衣。只借人物身份与画风，不照搬立绘站姿或背景。未上传的四位夫人依下文塑造，随后逐人局部对齐自己的base。
【场景】《鹿鼎记》第五十回结尾，韦小宝辞官脱离朝廷与天地会的两难，携七位夫人改装到扬州接母之后，一家人隐姓埋名远行。取远行途中一处宁静山水渡口：清晨薄雾，远景青灰层山、疏树与宽阔河水，近景宽敞的民用木篷船靠着低矮木栈桥，一家人正收拾行李登船。船体尺度足够承载一家人，不是只能载两人的小舟。后部遮篷舱帘合拢，母亲与孩子已在舱内歇息，不另露脸。船上只有旅行包袱、小木箱，没有官旗、官服、武装护卫，没有康熙现场送行。渡口、晨雾、站位、具体旅行衣色属于画面取景扩展，不冒称原著逐字描写。
【八人动作与关系】前后错落分成亲密的家庭小组，头部不能互相遮挡，八人的脸均至少三分之二可见。不要排成一条合影直线，每个主要人物的头部大小要足够辨认，尽量保留正面或浅三分之四面。
1. 韦小宝在中央靠近船边，一只手提普通旅行包袱，另一只手轻扶双儿登船；深蓝长袍、棕红马褂、黑瓜皮帽，剃额留辫。身姿舒展，眉眼机灵，得意而从容，闭唇的一点笑意，不露齿大笑。他与七位夫人彼此熟悉亲近，终于卸去官场压力。
2. 双儿在他身侧握住他的手腕，柔和信赖地看向他，蓝白花纹衣、轻蓝裙，发髻花饰与柔软刘海；温柔浅笑，脸不要变成阿珂。
3. 阿珂在另一侧随行，米白衣、灰蓝裙，齐刘海、花饰发髻、单侧长辫；秀丽明亮却仍有矜持，闭唇淡淡笑意，留意丈夫的动作，不画早期排斥他的敌意。
4. 苏荃穿低饱和深紫衣，成熟大方，狭长有神的眼、较丰润唇，花饰高髻；正在安排船边行李，一边回头照顾诸位妹妹，稳妥从容、含蓄妩媚的浅笑。
5. 方怡：瓜子脸、斜长眼、细弯眉、挺鼻，发髻配小红花、单侧辫，暗紫花纹背心与米白花袖衣；带一点似笑非笑的聪慧神态，递来小包袱给苏荃。
6. 沐剑屏：柔圆鹅蛋脸、明亮眼睛、细柔眉、齐碎刘海，绿花头饰与双侧细长辫，浅绿花衣、淡粉衣缘；天真欣悦的浅笑，挽着方怡手臂紧跟登船。
7. 曾柔：小鹅蛋脸、柔细眉眼、薄而柔和的唇，朴素盘髻配木簪、短刘海，灰绿衣和土黄软围巾；一手护着小木箱，稍垂目含羞，仍清楚露脸，另一手轻扶建宁衣袖。
8. 建宁：偏窄鹅蛋脸、上挑弯眉、杏眼、较饱满下唇，左右双髻簪花，暗蓝花纹背心与玫红袖衣；骄矜里带着对新旅程的好奇，抿嘴略挑眉、稍有不舍，不强行画成全员同样的甜笑。她已是成年妻子，不采用幼童比例，服饰不用公主冠服。
【人物状态】八人健康完整，没有战斗、负伤、病容或爆发内力；衣装已是便服，完整但有旅行穿用感。七位夫人互相递行李、搀扶、目光交流，关系温暖，韦小宝得意而安定；每人眉眼与情绪不同，不是八张同款笑脸。
【画风】写实手绘古风插画，细腻但可见笔触，皮肤有自然纹理，头发不锐利，布料有经纬与真实褶皱；低饱和沉稳设色，晨光自然照明，纸感与远山墨晕融为一体。不是摄影、3D渲染、动漫、塑料CG或厚涂油画。八人明暗透视统一，手势与肢体自然。
【构图与题字】近景八人和木船，中景渡口水面，远景山水，行动线朝向船内与开阔河面。右上天空留出空白，竖排毛笔楷书自上而下准确写「江」「湖」「归」「去」四字，题字墨黑有自然笔锋，每字只出现一次；下方小朱红方印。文字不挡脸，整列不超过画高40%。
【不要】不要漏掉任何一位夫人，不要多出第八位妻子，不要人物面孔重复或七位夫人同脸；不要排成僵硬合影；不要新增露脸的船夫、路人或孩童；不要皇帝、官旗、官服；不要露齿狂笑、幼态、现代物件、左衽、镜像、手指错乱、肢体穿模、文字水印；除「江湖归去」与朱印外不出现可读文字。
```

## 出图与局部对脸

- `reference_upload`列出八人现行base，供身份追溯；每次runner调用最多5张参考。整图阶段只传韦小宝、双儿、阿珂、苏荃4张。
- 构图通过后，八人逐一使用本人base头部特写与手工坐标圈定的场景头部裁块；局部编辑后羽化贴回，八个头部以外像素保持整图原样。
- 按AR-53打开八组base脸／图中脸对照核验；按AR-75核验八人、动作、健康状态、家庭关系与题字。

## AR-75 实际验收记录

- 韦小宝与七位夫人八人均在：后方阿珂、韦小宝、双儿、苏荃；前方曾柔、建宁、方怡、沐剑屏。
- 八人各自按现行base完成单人头部局部合成；逐组打开base脸／图中脸对照检查。
- 八个头部以外像素变化数为0；原生毛笔题字「江湖归去」和朱印保持整图生成结果。
- 场景、动作、健康状态、亲密家庭关系及各人不同神态均已目检；母亲与孩子安排于遮篷舱内，不另外露脸。
- 完整对照表：`.agents/coord/_lines/cg-retirement/retirement.jpg`；像素验证：同目录`pixel_checks.json`。
````

## AR-89 实际验收记录

- 共整张生成并真实打开 2 张；选定 B（`cg_ch08_retirement_choice.ar89_full2`）。仅base资料板参考，没有上传或修改旧CG。
- 逐个核对8人、1男7女、服色和发型；八人聚于同一条已经离岸的船上，航向一致，岸上无送行者。人物小、山水远景，不逐人贴回五官。
- 题字逐字放大确认为竖排楷书简体「江湖归去」，没有日文字形「帰」。最终1536×1024，直接采用runner整张原生输出。
- 原著去向为扬州接母后全家赴云南大理；具体乘船、山水渡口和晨雾为画面取景扩展。
- 对照表：`.agents/coord/_lines/retire-regen/retire_new.jpg`；八人位置图：同目录`position_map.jpg`；逐张验收：同目录`selection.json`。
