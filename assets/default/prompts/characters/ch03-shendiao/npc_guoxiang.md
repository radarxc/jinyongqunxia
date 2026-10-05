---
asset_id: por_npc_guoxiang__ch03_youth_base
subject_id: npc_guoxiang
name: 郭襄
book: ch03_shendiao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch03/por_npc_guoxiang__ch03_youth_base.png
manifest: assets/default/character/female/ch03/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shendiao/guoxiang_1995_liqihong.jpg
  use: 第一且唯一面容身份参考：实际核实1995 TVB李绮虹/李绮红郭襄的单人剧照；此前已view，本次复核原字节SHA。保留清圆短椭圆脸、饱满颊、小圆下巴、微弧细眉与本人眉眼间距、自然杏眼、圆润鼻尖与弧形微笑唇线。按角色稿自然表现十六岁，剔除演员成年体态、青绿偏色、低头、露齿表情、背景硬影和花饰；此源图较软，不作为细节锐度/肤质/摄影光影样本。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考仅提供项目女性人物的精细手绘设色、柔和漫射光、温润皮肤与完整连贯衣料的绘制质感；已实际view。不得借王语嫣脸型、眉眼、大眼小鼻比例、体型、高髻、玉簪、淡藕褙子、宽袖或侧转姿势；不传递该参考的approved。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅背景：暖浅灰纸底、低对比水墨远山薄雾与留白；已实际view。不取图中人物脸、年龄、体型、发式、首饰、透明衣裙、倾头或侧身；墨韵不能侵入新人物，面部、手和衣料始终完整清楚。
status: ready
realism_revision: user_identity_pose_20261001
---

# 郭襄 · 人物写实修正

## 人物与阶段

- subject_id：npc_guoxiang
- book：ch03_shendiao
- gender：female
- age_variant：youth

## 本轮人物写实规范

1995李绮虹郭襄本人身份；正面、头颈垂直、双眼水平。十六年后十六岁生日附近少女、风陵渡相识获三针后且未创峨眉；鹅黄右衽衫、浅青小褙子，左腰小针囊仅露三枚细金针短头，无剑。人物清爽自然写实，不成熟化，水墨仅背景，两张candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_guoxiang__ch03_youth_base/prompt-3bf25048f2bf9f1694bfe6a8d63768923dddfa9a54877a10456bc78b35bb916a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. The head and neck are naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line, camera level, chin neutral, gaze straight ahead. NO head tilt and NO Dutch angle. Keep the head centered over the torso, shoulders naturally level and relaxed. These rules override ALL reference poses and old draft instructions. Natural facial asymmetry is welcome; a tilted head is not.

Create a beautiful REALISTIC Chinese wuxia character illustration of GUO XIANG / 郭襄 as a SIXTEEN-YEAR-OLD adolescent girl, after meeting the Condor Hero and receiving his three golden needles, around her birthday in The Return of the Condor Heroes. Image 1 is the ONLY FACIAL IDENTITY reference: Li Qihong / 李绮虹 (also written 李绮红) as Guo Xiang in the 1995 TVB series. Preserve her distinctive facial relationships in a naturally sixteen-year-old appearance, without transferring the adult performer’s maturity. Image 2 is painting/rendering only, never another face or costume. Image 3 is background only. Do not blend identities.

身份与阶段：南宋神雕书界ch03_shendiao，十六年后的郭二小姐，风陵渡结识神雕侠且已获三枚金针、十六岁生日前后；还没有创立峨眉。她是灵秀明快、好奇热忱的十六岁少女，眼神聪敏亲切，嘴角有自然轻快笑意；身体纤巧但符合实际少年发育，不画幼童，也不画成熟性感体态。神态像认真聆听江湖故事，但头颈必须竖直，不能用旧稿偏头表示倾听。

本人面容辨识：依据第一张李绮虹郭襄剧照，清圆短椭圆脸、饱满而柔和的双颊、小而圆润的下巴，不削成尖V。细眉自然微弧，眉眼距与眼间距保留本人关系；眼睛自然杏形，眼尾柔和、下眼睑有真实体积，不扩大虹膜或眼眶。鼻梁短而自然挺直，鼻尖圆润，不压成网红小点鼻；弧形唇线与微弯嘴角带来明快感，上下唇厚度真实，笑意不必露齿。皮肤温暖自然；滤掉旧剧照的青绿偏色、颗粒、深硬阴影，保持少女清爽感与本人面容辨识。她的清圆脸、轻快神态应区别于郭芙的较长椭圆脸与娇矜，也不能混成王语嫣。

衣装与头发：南宋汉族少女淡鹅黄窄袖交领右衽衫，外搭浅青对襟小褙子，完整齐腰长裙、平底布鞋，朴素窄布腰带。右衽是穿着者左襟盖右襟、向本人右侧合拢；外褙子为对襟。领口与胸颈遮蔽得体，织物全部不透明、衣料与裙摆连续完整，袖口干净收束，鞋尖清楚。黑发半束成小髻与两条短编发，用素色布带固定，少量自然额发；清爽日常少女发式，不抄剧照双侧夸张饰花、不作出家发式或成熟高冠。

三针针囊与站姿：本人左腰、观者右侧系一个小而朴素的完整布针囊，囊带与窄腰带打结相连，可见连接、重力自然。针囊袋口略开，内部稳妥收纳恰好三枚细小金针，只在囊口露出三处彼此分开的短小金色针头，针身绝大部分藏在囊内；信物尺寸真实、细小可数，不能放大成飞镖或法器，不漂浮、不别在头发或项链上。本张没有剑或其他兵器。双足平稳落地、全身正面，头颈直立、目光朝前；本人左手以自然指形轻扶针囊外侧而不遮住囊口和三处针头，右手松弛垂身侧，不握针、不结印。针囊、布带、手指、袖口与裙装边界清楚，金针没有刺穿手和衣料。

绘制与背景：美观写实的精细国风人物插画，真实连贯的面部骨相、自然眼睛、温润肤质与明确的衣料体积，人物轮廓干净。取第二参考柔和层染、低饱和设色与左上漫射光，不取它的脸、体型、衣装或姿势；不复制摄影扫描颗粒和旧剧照偏色。取第三参考暖浅灰纸底、低对比水墨远山、薄雾与留白，背景墨迹只留在人物外，不能透进面部、手或服饰。衣料完整不透明、真实剪裁，宽缓自然褶皱，缝合与收边连贯；不使用飞白缺块、碎布、撕裂衣角、噪点纹理。背景不指定情节地点，不出现其他人物、文字或具体事件。

构图与交付：单人、单视图、完整全身、原生竖幅2:3，平视中性透视。发顶、双手、两足鞋尖、完整衣摆及全部既定器物端点入画，四周自然留空；以真实少女体态为准，不用固定头身比或88–92%占高拉伸身体。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并如实登记，保留原始PNG字节、工具原有溯源标识与元数据，不插值、裁切、旋转或重编码。默认生成两张独立候选，每幅只含一人，均为candidate等用户审核，任何参考的approved均不传递到新图。

事实边界：本地catalog、story E43–E45与chapters §8.5支持十六年后郭襄、风陵渡相识、杨过所赠三枚金针和生日线；未创立峨眉是明确阶段边界。当前角色稿明确十六岁、淡鹅黄浅青衣裙、针囊且无剑。针的具体收纳形制、衣色发式和精确外貌用词仍待指定版本原文校勘；针囊、左腰位置、袋口三针呈现和静态姿势为美术补足，不生成这些说明文字，不编造原著引文、回目或页码。

完整排除项：不要 head tilt、Dutch angle、歪头靠肩、额鼻颏中线倾斜、双眼高低不平、斜镜头、俯首藏眼、仰头抬下巴、明显侧脸、侧身回眸、耸单肩或扭腰摆拍。不要通用女侠模板、网红尖V脸、动漫大眼、小鼻锥下巴组合、夸张丰唇、浓妆磨皮、塑料皮肤、油亮镜面皮肤、婴幼儿比例；不要把少女成人化、成熟婚后体态、性感曲线、露胸、低领、开衩短裙、透明衣料、高跟鞋或新娘凤冠。不要直接交付照片、剧照截图、拼贴、3D模型或复制其他画作；不要混合三张参考的人脸，不取王语嫣脸、体型、高髻、玉簪、淡藕衣裙或侧转姿势，不复制用户背景样图的人脸、透明衣料、首饰和歪头。不要现代服饰、拉链、腕表、运动鞋、数码物件、日式服制、和服、日式刀具、圆盘刀镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、仙侠冠冕、赛博或蒸汽朋克；不要唐式齐胸裙、明式马面裙、明代网巾、官服补子、清式剃发留辫、旗装、马蹄袖、大拉翅或朝代族群混搭。不要汉式交领左衽、水平镜像、悬空装备、失重衣料、手物融合、多余肢体、多手多指、粘连手指、错接手腕、缺失既定肢体、裁断头足或器物端点；不要弯折断裂剑刃、短鞘容不下剑刃、柄鞘错轴、穿透身体的器物或无连接挂载。人物不要碎墨、飞白缺块、纸纹透肤透衣、毛边碎布条、撕裂裙摆、污渍风化、密集噪点、模糊眼睛、雾遮轮廓或背景墨点侵入人物。不要无依据的武器、发光武器、龙形能量、光翼、法阵、粒子特效、强烈泛光、硬舞台轮廓光、色情化、血腥特写或恶搞丑化；不要复杂场景、第二个人、动物群、分格、多视图、面部特写框、文字、汉字、伪字、题款、印章、签名、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要把郭襄替换成杨幂、其他剧版演员、郭芙、黄蓉或王语嫣，不套通用尖V大眼小鼻脸。不要成年婚后妇人、峨眉祖师、掌门冠服、道姑、尼装、剃发、襁褓婴儿或十六岁以外的成熟阶段。不要佩剑、倚天剑、双剑或其他兵器；不要把三枚金针画成飞镖、巨针、金色法术、金球或项链；不要多于或少于三枚、针刺穿手或衣料、针悬空、针囊没连腰带、手遮掉全部针头或手囊融合。不要旧照片青绿色脸、强硬墙上人影、花饰合影背景、复制露齿笑和低头姿势。

FINAL POSE CHECK: FRONT-FACING GUO XIANG with her own 1995 Li Qihong facial identity and a natural SIXTEEN-YEAR-OLD appearance. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY level, head and neck UPRIGHT, shoulders relaxed, camera level, chin neutral and gaze forward. NO head tilt and NO Dutch angle. Keep the pale-yellow and pale-cyan costume complete and opaque, with a small pouch tied to her left waist showing only THREE separate tiny golden needle heads. NO sword, NO Emei founder costume.
```

## 排除项

不要 head tilt、Dutch angle、歪头靠肩、额鼻颏中线倾斜、双眼高低不平、斜镜头、俯首藏眼、仰头抬下巴、明显侧脸、侧身回眸、耸单肩或扭腰摆拍。不要通用女侠模板、网红尖V脸、动漫大眼、小鼻锥下巴组合、夸张丰唇、浓妆磨皮、塑料皮肤、油亮镜面皮肤、婴幼儿比例；不要把少女成人化、成熟婚后体态、性感曲线、露胸、低领、开衩短裙、透明衣料、高跟鞋或新娘凤冠。不要直接交付照片、剧照截图、拼贴、3D模型或复制其他画作；不要混合三张参考的人脸，不取王语嫣脸、体型、高髻、玉簪、淡藕衣裙或侧转姿势，不复制用户背景样图的人脸、透明衣料、首饰和歪头。不要现代服饰、拉链、腕表、运动鞋、数码物件、日式服制、和服、日式刀具、圆盘刀镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、仙侠冠冕、赛博或蒸汽朋克；不要唐式齐胸裙、明式马面裙、明代网巾、官服补子、清式剃发留辫、旗装、马蹄袖、大拉翅或朝代族群混搭。不要汉式交领左衽、水平镜像、悬空装备、失重衣料、手物融合、多余肢体、多手多指、粘连手指、错接手腕、缺失既定肢体、裁断头足或器物端点；不要弯折断裂剑刃、短鞘容不下剑刃、柄鞘错轴、穿透身体的器物或无连接挂载。人物不要碎墨、飞白缺块、纸纹透肤透衣、毛边碎布条、撕裂裙摆、污渍风化、密集噪点、模糊眼睛、雾遮轮廓或背景墨点侵入人物。不要无依据的武器、发光武器、龙形能量、光翼、法阵、粒子特效、强烈泛光、硬舞台轮廓光、色情化、血腥特写或恶搞丑化；不要复杂场景、第二个人、动物群、分格、多视图、面部特写框、文字、汉字、伪字、题款、印章、签名、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要把郭襄替换成杨幂、其他剧版演员、郭芙、黄蓉或王语嫣，不套通用尖V大眼小鼻脸。不要成年婚后妇人、峨眉祖师、掌门冠服、道姑、尼装、剃发、襁褓婴儿或十六岁以外的成熟阶段。不要佩剑、倚天剑、双剑或其他兵器；不要把三枚金针画成飞镖、巨针、金色法术、金球或项链；不要多于或少于三枚、针刺穿手或衣料、针悬空、针囊没连腰带、手遮掉全部针头或手囊融合。不要旧照片青绿色脸、强硬墙上人影、花饰合影背景、复制露齿笑和低头姿势。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_guoxiang__ch03_youth_base.prepared.json`。
