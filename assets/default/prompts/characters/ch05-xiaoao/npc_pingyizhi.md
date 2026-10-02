---
asset_id: por_npc_pingyizhi__ch05_prime_base
subject_id: npc_pingyizhi
name: 平一指
book: ch05_xiaoao
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch05/por_npc_pingyizhi__ch05_prime_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_29-1.png
  use: 第一且唯一面部身份参考：1996经典原版《金庸群侠传》平一指本人原始PNG；本轮逐人实际view并同有名总表严格配对。只取本人面骨和五官关系，重建为正面适龄写实人物；不复制原像素、衣色、发式阶段、侧转仰头或表情。以第一图平一指本人为唯一身份：较高宽额头和略后退发际、眉骨与窄而深的眼窝、较平的浓眉及微紧的眉间；鼻梁突出且中等偏宽、鼻尖厚实、鼻翼清楚，鼻唇距离与小短髭关系保留。面颊饱满、下脸短宽、嘴宽适中而闭唇严谨，短小圆方下巴与厚颈自然衔接；稀疏细短黑髭不是浓络腮长须。参考上仰斜视全部改成正面头直、眼线水平的专注审视，保留成熟面部体积，不借令狐冲的年轻长瘦脸。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二图片只作对应性别项目的低饱和色卡、柔光及精细手绘质感，已本轮实际view；不取这张别人的脸、年龄、体型、发型、服饰、道具、姿势与头倾。原candidate/approved状态保持，不转为新图审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三图片已本轮实际view，只取暖浅灰纸底、极浅水墨远山和留白，不取女性脸、身体、白青衣裙、发型、飘带和头倾，不复制清晰亭阁花枝；背景墨纹不侵入人物皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 平一指 · 人物写实修正

## 人物与阶段

- subject_id：npc_pingyizhi
- book：ch05_xiaoao
- gender：male
- age_variant：prime

## 本轮人物写实规范

角色稿‘五霸岗诊治前后健在’仅在其生前窗口选取，不能放到最后诊断失败死亡之后。本图不新增生还改命，不把称谓‘一指’画成残指，不把杀人名医变成血腥手术或人头道具。 本人game第一身份，正面头直、完整写实人物、水墨仅背景；先1原生PNG候选，minor登记不阻塞，candidate待用户审。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_pingyizhi__ch05_prime_base/prompt-ebfd4f60466961f118d1c6ba53ea0c0b99ab1b038ce55c3fcf23bdc435b65e34.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 平一指. Image 1 is the ONLY facial identity source: the verified original-game portrait of THIS person. Images 2 and 3 supply ZERO identity, age, anatomy or costume. Image 2 is only the corresponding gender project palette and soft painting quality; image 3 is only pale ink-wash background. Preserve image 1's own brow/eye/nose/mouth/cheek/jaw relationships in a newly drawn FRONT-FACING, UPRIGHT, age-appropriate realistic face; do not copy pixel style, angle, costume or inappropriate expression.

身份与阶段：平一指（npc_pingyizhi），《笑傲江湖》ch05_xiaoao。杀人名医平一指，开封初诊至五霸冈相关行医过程中的健在常态；明确选最终诊断失败而死亡之前。

年龄与体型：中年男子prime，矮胖而真实的成人体格、宽厚肩体和圆腹，头部相对较大但正常人体比例；颊部饱满、短下巴，细短髭须和中年皮肤纹理，不画漫画大头或幼童肥脸。

本人面容辨识：以第一图平一指本人为唯一身份：较高宽额头和略后退发际、眉骨与窄而深的眼窝、较平的浓眉及微紧的眉间；鼻梁突出且中等偏宽、鼻尖厚实、鼻翼清楚，鼻唇距离与小短髭关系保留。面颊饱满、下脸短宽、嘴宽适中而闭唇严谨，短小圆方下巴与厚颈自然衔接；稀疏细短黑髭不是浓络腮长须。参考上仰斜视全部改成正面头直、眼线水平的专注审视，保留成熟面部体积，不借令狐冲的年轻长瘦脸。

服制与发式：深褐明代长衣配浅灰内领、窄布带，衣袖收束到手腕，深色长裤与布鞋；头发梳拢束小髻，用素软巾固定，衣物干净无血渍。布料完整不透明、身体与衣料体积连续；保留清楚缝边及少量宽缓受力褶皱，绝不碎墨破衣。汉式或本版指定交领右衽，穿着者左襟覆右襟，不水平镜像。

正面姿态与器物：正面低重心稳站，头颈自然竖直、双眼水平、下巴中性，双足自然分开。一手在腹前从下方托住一只小型无字木药匣，另一手指腹轻触已闭合匣盖边缘，如静思诊断；匣体、盖缝和手指各自清楚，不打开暴露药材。腰侧只一只小布医袋，绳带真实连接窄腰带；双手五指完整，没有独指手、缺指或医生法术，不带现代器械、患者或血污。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新FAST指示先生成1张候选，每张仅一人；基本清晰、主要正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，细手指、微装备或轻微角度偏差记录而不反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书原著淡化朝代，本作约1523–1525明中叶为项目原创定年，不声称小说明示年月。人物与生命状态依当前本地角色稿、名录、故事、章节；原稿待考继续保留，本轮没有新联网考据，不编造逐字引文页码。本人低分辨率game只提供面部关系，细部皮肤、服色选款、器型装具和静态持物为美术补足。角色稿‘五霸岗诊治前后健在’仅在其生前窗口选取，不能放到最后诊断失败死亡之后。本图不新增生还改命，不把称谓‘一指’画成残指，不把杀人名医变成血腥手术或人头道具。

参考边界：第一且唯一面部身份参考：1996经典原版《金庸群侠传》平一指本人原始PNG；本轮逐人实际view并同有名总表严格配对。只取本人面骨和五官关系，重建为正面适龄写实人物；不复制原像素、衣色、发式阶段、侧转仰头或表情。以第一图平一指本人为唯一身份：较高宽额头和略后退发际、眉骨与窄而深的眼窝、较平的浓眉及微紧的眉间；鼻梁突出且中等偏宽、鼻尖厚实、鼻翼清楚，鼻唇距离与小短髭关系保留。面颊饱满、下脸短宽、嘴宽适中而闭唇严谨，短小圆方下巴与厚颈自然衔接；稀疏细短黑髭不是浓络腮长须。参考上仰斜视全部改成正面头直、眼线水平的专注审视，保留成熟面部体积，不借令狐冲的年轻长瘦脸。 第二图片只作对应性别项目的低饱和色卡、柔光及精细手绘质感，已本轮实际view；不取这张别人的脸、年龄、体型、发型、服饰、道具、姿势与头倾。原candidate/approved状态保持，不转为新图审批。 第三图片已本轮实际view，只取暖浅灰纸底、极浅水墨远山和留白，不取女性脸、身体、白青衣裙、发型、飘带和头倾，不复制清晰亭阁花枝；背景墨纹不侵入人物皮肤、衣料和器物。

完整排除项：不要文字、伪字、题字、题款、签名、印章、标签、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件；不要其他人物的演员脸或游戏脸、剧照构图、游戏像素画风或拼贴；只使用第一张已核验本人游戏图的面部身份关系；不要动漫大眼、低幼脸、统一网红锥子脸、偶像磨皮、丰唇滤镜、油亮塑料皮肤、摄影写真或三维模型渲染感；不要日韩动漫风、和服、日式前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要朝代与族群混搭、清式剃额辫发、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、无身份依据的官服补子与飞鱼服；汉式交领不要左衽，不要水平镜像；不要日本刀、日式圆盘刀镡、菱形缠柄、无依据的名器、发光兵器、龙形能量、仙法法阵或光翼；不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、直剑弯折断裂、容不下剑刃的短鞘；不要大面积撕裂破衣、血腥特写、裸露、透明服装、色情化、丑化或畸形健美肌肉；不要复杂场景、额外人物、分格、多视图、头像特写框、广角畸变、强逆光、强烈泛光或遮挡结构的雾气；不要裁断头顶、手指、双足、兵器端点与衣带。本人物另禁独指、少指、夸张大头漫画、白大褂、听诊器、注射器、手术刀血污、人头药材、骷髅饰物、悬壶匾额文字和仙医光环。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、低头藏眼或抬下巴；不要借第二张色卡人物或第三张背景图人物的五官、年龄、性别、体型、衣饰和姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、衣料撕裂碎带、密集噪点或过密细皱；水墨仅在背景。保留工具原始溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING, head and neck naturally UPRIGHT, eyes HORIZONTALLY LEVEL, chin neutral, gaze forward, camera level. NO HEAD TILT. Preserve this person’s own face, age, body type and narrative stage; do not inherit any reference pose.
```

## 排除项

不要文字、伪字、题字、题款、签名、印章、标签、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件；不要其他人物的演员脸或游戏脸、剧照构图、游戏像素画风或拼贴；只使用第一张已核验本人游戏图的面部身份关系；不要动漫大眼、低幼脸、统一网红锥子脸、偶像磨皮、丰唇滤镜、油亮塑料皮肤、摄影写真或三维模型渲染感；不要日韩动漫风、和服、日式前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要朝代与族群混搭、清式剃额辫发、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、无身份依据的官服补子与飞鱼服；汉式交领不要左衽，不要水平镜像；不要日本刀、日式圆盘刀镡、菱形缠柄、无依据的名器、发光兵器、龙形能量、仙法法阵或光翼；不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、直剑弯折断裂、容不下剑刃的短鞘；不要大面积撕裂破衣、血腥特写、裸露、透明服装、色情化、丑化或畸形健美肌肉；不要复杂场景、额外人物、分格、多视图、头像特写框、广角畸变、强逆光、强烈泛光或遮挡结构的雾气；不要裁断头顶、手指、双足、兵器端点与衣带。本人物另禁独指、少指、夸张大头漫画、白大褂、听诊器、注射器、手术刀血污、人头药材、骷髅饰物、悬壶匾额文字和仙医光环。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、低头藏眼或抬下巴；不要借第二张色卡人物或第三张背景图人物的五官、年龄、性别、体型、衣饰和姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、衣料撕裂碎带、密集噪点或过密细皱；水墨仅在背景。保留工具原始溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_pingyizhi__ch05_prime_base.prepared.json`。
