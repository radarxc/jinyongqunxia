---
asset_id: por_npc_nanlan__ch14_youth_memory_base
subject_id: npc_nanlan
name: 南兰
book: ch14_xueshan
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch14/por_npc_nanlan__ch14_youth_memory_base.png
manifest: assets/default/character/female/ch14/manifest.yaml
references:
- path: assets/default/character/female/ch13/por_npc_nanlan__ch13_youth_base.png
  use: 第一输入是本次实际查看且已保存的ch13南兰本人candidate图；仅延续同一成年妇人的脸部骨架与眉眼鼻唇关系。它是项目生成的本人身份图，不是原版game或TV演员图；candidate不等于approved。当前ch14仍为生前日常回忆，具体年份待考：浅藕夹袄、米灰裙、圆整低髻和一枚小素金簪，一手握无字素帕、另一手下垂。不要继承源图高髻、繁花垂坠钗、满衣繁花绣、花绣手帕及双手拢帕姿势，不复制苗若兰剧情珠钗。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入仅取用户图的暖浅灰纸底、极浅水墨远山薄雾与留白；不取女性面容、年龄、身体、白青衣裙、发型、首饰、倾头姿势或花枝亭阁。背景墨痕止于本人轮廓之外，不侵入完整衣肤。
status: ready
realism_revision: user_identity_pose_20261001
---

# 南兰 · 人物写实修正

## 人物与阶段

- subject_id：npc_nanlan
- book：ch14_xueshan
- gender：female
- age_variant：youth

## 本轮人物写实规范

同一南兰已保存本人图第1、背景第2；只延续脸骨架。ch14生前回忆、成年妇人、米灰裙素帕、低髻小素金簪，无女儿剧情珠钗、不复活。先1候选，原始native2:3 PNG，candidate待审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_nanlan__ch14_youth_memory_base/prompt-6859842bdab2c75a5022446322dd6b7708f9e28348fc9589e8ae96b10d282289.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 南兰. Image 1 is the ACTUAL SAVED SAME-CHARACTER ch13 Nan Lan identity reference, currently candidate, from this project. Preserve her facial bone structure and principal eyebrow-eye-nose-mouth relationships as the SAME adult woman. Image 2 supplies ONLY pale ink-wash background. Keep ch14 as a living past-memory fragment, NOT a resurrection in 1780. Use a pale lotus jacket, rice-gray skirt, low rounded bun with ONE SMALL PLAIN GOLD HAIRPIN, and ONE PLAIN UNMARKED HANDKERCHIEF held in one hand while the other hangs naturally. Do not copy source high bun, elaborate floral ornaments, dense embroidered clothing, embroidered handkerchief or two-hand pose, and do not use Miao Ruolan’s unique plot hairpin. Neither source status nor prior self-check grants approval to the new candidate.

身份与阶段：南兰（npc_nanlan），《雪山飞狐》ch14_xueshan。本书旧事回忆中青年时期的苗若兰之母，取生前日常片段，不是 1780 年复活

年龄与体型：青年时期的成年妇人、苗若兰之母，取本书旧事回忆里的生前日常片段，具体回忆年份、生卒和确岁待考。纤秀而有成年少妇稳定骨架，面颊自然丰润；不能与女儿少女年龄混同，不是1780复活，也不画临终病容。

本人面容与跨书连续：以第一输入中已经形成的同一南兰本人脸为身份锚：保留成年妇人的柔和卵形轮廓、自然饱满颊面与圆缓颏部、宽缓额弧、细眉形状和眉眼间距、自然眼裂及眼角走向、细直而不过高的鼻梁、圆小鼻尖与自然鼻翼、鼻唇距离、上下唇厚薄和克制唇角关系。保留清丽温润而略有心事的本人辨识、自然肤色和成年骨架；不换成胡夫人、女儿苗若兰或背景女性的脸，不画成少女、临终病容或道德化反派脸。发式服饰道具按本ch14重画，源高髻繁钗和绣花帕不属于必须继承的面容身份。

服制与发式：清乾隆汉族妇人浅藕色右衽绸面夹袄、米灰百褶长裙、低调深梅色领缘，夹衣有适合寒地的厚度；黑发绾成圆整低髻，仅一枚小而朴素的金簪固定，平底绣鞋只少量暗纹。衣肤连续完整，衣裾不散成碎墨；本阶段不沿ch13镶珠金凤钗，不重复苗若兰那枚剧情珠钗，不画旗装宫廷头面或民国旗袍。

正面姿态与器物：单人正面完整静立，头颈竖直、眼线水平，双肩放松而稳定；克制惆怅通过直视的神态表达，不侧脸远望、歪头或夸张哀哭。一手仅轻握一方无字素手帕于腰前，另一手自然下垂。无任何武器、藏宝图、军刀、信纸或额外人物；不带女儿同框，不移用临终状态。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：南兰仍为本书旧事回忆中的成年苗若兰之母，取生前日常片段；具体回忆年份、生卒和死亡时点待考，不从ch13商家堡阶段强推，不作1780复活。当前ch13同一本人PNG已保存、实际查看并核验与原生成PNG字节一致，可作为第一身份输入；原始game语料缺本人配对的历史记录只属原版来源范围，不能据此否认现有项目本人图。第二输入仅水墨背景，非本人王语嫣色卡已移除。源图仍candidate，不能转为新图approved或本ch14生成完成。原稿具体器形服色等美术补足不冒称指定版逐字终校。本图低髻小素金簪、米灰裙与无字素帕，排除源图高髻繁钗、密集繁花绣、花绣帕；一手握帕另一手自然下垂，不复制苗若兰独有剧情珠钗，不因私情标签丑化本人。

参考边界：第一输入是本次实际查看且已保存的ch13南兰本人candidate图；仅延续同一成年妇人的脸部骨架与眉眼鼻唇关系。它是项目生成的本人身份图，不是原版game或TV演员图；candidate不等于approved。当前ch14仍为生前日常回忆，具体年份待考：浅藕夹袄、米灰裙、圆整低髻和一枚小素金簪，一手握无字素帕、另一手下垂。不要继承源图高髻、繁花垂坠钗、满衣繁花绣、花绣手帕及双手拢帕姿势，不复制苗若兰剧情珠钗。 第二输入仅取用户图的暖浅灰纸底、极浅水墨远山薄雾与留白；不取女性面容、年龄、身体、白青衣裙、发型、首饰、倾头姿势或花枝亭阁。背景墨痕止于本人轮廓之外，不侵入完整衣肤。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；已有同一南兰的项目生成本人PNG作为身份输入；不要冒充原版游戏脸或TV演员本人，不借其他角色、演员或色卡基线脸，不替换本人脸部骨架；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要妖艳反派妆、轻佻媚态、低胸透衣、少女成人混合体态、金铃索佩剑或清宫大拉翅；不要复制苗若兰珠钗、母女同框、幽灵或临终病容。 不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物现存皮肤、衣料、毛发和器物完整连续，保留明确伤残。保留工具原有溯源信息，不去除或伪造。

FINAL POSE CHECK: FRONT-FACING, head naturally upright, eyes HORIZONTALLY LEVEL, camera level. NO head tilt. Preserve age, existing impairment and narrative stage; do not straighten a described bent back or add a missing arm.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；已有同一南兰的项目生成本人PNG作为身份输入；不要冒充原版游戏脸或TV演员本人，不借其他角色、演员或色卡基线脸，不替换本人脸部骨架；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要妖艳反派妆、轻佻媚态、低胸透衣、少女成人混合体态、金铃索佩剑或清宫大拉翅；不要复制苗若兰珠钗、母女同框、幽灵或临终病容。 不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物现存皮肤、衣料、毛发和器物完整连续，保留明确伤残。保留工具原有溯源信息，不去除或伪造。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_nanlan__ch14_youth_memory_base.prepared.json`。
