---
asset_id: por_npc_hufuren__ch14_youth_memory_base
subject_id: npc_hufuren
name: 胡夫人
book: ch14_xueshan
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch14/por_npc_hufuren__ch14_youth_memory_base.png
manifest: assets/default/character/female/ch14/manifest.yaml
references:
- path: assets/default/character/female/ch13/por_npc_hufuren__ch13_youth_memory_base.png
  use: 第一输入是本次实际查看且已保存的ch13胡夫人本人candidate图；仅延续同一成年年轻女性的脸部骨架与眉眼鼻唇关系。它是项目生成的本人身份图，不是原版game或TV演员图；candidate不等于approved。当前ch14仍为约1753生前实体回忆，按本稿画厚浅米皮裘、双手空手拢裘、无兵器无婴儿、低稳已婚小髻素簪；不硬复制源图高髻、深灰长披肩流苏、腰侧鞘装兵器、服色或密集细纹。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入仅取用户图的暖浅灰纸底、极浅水墨远山薄雾与留白；不取女性面容、年龄、身体、白青衣裙、发型、首饰、倾头姿势或花枝亭阁。背景墨痕止于本人轮廓之外，不侵入完整衣肤。
status: ready
realism_revision: user_identity_pose_20261001
---

# 胡夫人 · 人物写实修正

## 人物与阶段

- subject_id：npc_hufuren
- book：ch14_xueshan
- gender：female
- age_variant：youth

## 本轮人物写实规范

同一胡夫人已保存本人图第1、背景第2；只延续脸骨架，ch14厚浅米皮裘、双手拢衣、低髻素簪、无兵器无婴儿、生前实体回忆。先1候选，原始native2:3 PNG，candidate待审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_hufuren__ch14_youth_memory_base/prompt-e2c4ba160c6c6473958600d587ef5f90d79e800e055ce15b720ec396b1a5df5d.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 胡夫人. Image 1 is the ACTUAL SAVED SAME-CHARACTER ch13 Hu Furen identity reference, currently candidate, from this project. Preserve her facial bone structure and principal eyebrow-eye-nose-mouth relationships as the SAME adult young mother. Image 2 supplies ONLY pale ink-wash background. For ch14 keep the living past-memory stage, thick pale-beige fur coat, low stable married bun and plain hairpin, both hands gathering the coat, NO weapon and NO infant. Do not transfer the source high bun, long dark shawl, fringe, sheathed weapon, clothing texture or pose. Neither source status nor prior self-check grants approval to the new candidate.

身份与阶段：胡夫人（npc_hufuren），《雪山飞狐》ch14_xueshan。本书约 1753 年沧州旧事回忆中，产后休息、观察比武的胡斐之母，悲剧发生前

年龄与体型：青年成年胡斐之母，约1753年沧州旧事中的产后休息、观察比武阶段，悲剧发生前的生前实体回忆。体态匀称略纤而有成年骨架，眼周只有轻微倦意；不写确岁、不画幼女、孕腹或病危。本图不是1780活体复活。

本人面容与跨书连续：以第一输入中已经形成的同一胡夫人本人脸为身份锚：保留成年年轻女性的秀雅长卵形脸、自然宽度额头与柔和眉弓、细长眉形及眉眼间距、自然大小眼睛和眼角走向、细直鼻梁与圆润鼻尖、鼻唇距离及自然唇弓、较长而有支撑的下颌和圆钝下巴。保持本人清澈沉静、温和而坚定的辨识，不换成背景女性或另一角色的五官。只按ch14产后休息阶段增加轻微眼周倦意，脸仍有健康成年骨架、完整肤色，不病危、不幼女化、不用滤镜尖脸。发式服装道具依ch14重画，不把源图高髻当作脸部身份必需。

服制与发式：清乾隆汉族年轻母亲：厚实浅米色皮裘包覆上身，内穿右衽厚夹袄与灰蓝长裙，胸腹和衣领完整遮蔽；黑发收成低稳的小髻，以一枚朴素簪固定，软底布鞋完整可见。皮裘真实厚度与垂坠，不指定未核定白狐皮种属，不变透纱披帛；衣料皮肤完整无碎墨。服饰依当前ch14稿，不照搬ch13深灰披肩或其腰剑。

正面姿态与器物：单人正面完整静立，头颈竖直、双眼水平平视、肩背自然舒展，以坚定沉静目光表现判断和胆识。双手只自然拢住皮裘前缘，手部与厚裘分清；无任何兵器，尤其不佩带ch13方案的入鞘剑、不持自尽单刀；不抱婴儿，不画丈夫或成年胡斐，不画比武现场、死亡伤口、产育特写或透明幽灵。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：胡夫人仅为约1753沧州旧事中悲剧发生前的生前实体回忆，不是1780活体复活。当前ch13同一本人PNG已保存、实际查看并核验与原生成PNG字节一致，可作为第一身份输入；原始game语料缺本人配对的历史记录只属原版来源范围，不能据此否认现有项目本人图。第二输入仅水墨背景，非本人王语嫣色卡已移除。本人来源仍candidate，不能转成新图approved或本ch14生成完成。原稿产后时序、皮裘具体材质与发饰仍待指定版本核定，浅米皮裘与低髻为项目美术落实；不采用改编姓名、不指定白狐种属。本图严格厚裘双手空手拢衣，不佩剑鞘、不持刀、不抱婴儿，不继承源图深灰长披肩、高髻和密纹。

参考边界：第一输入是本次实际查看且已保存的ch13胡夫人本人candidate图；仅延续同一成年年轻女性的脸部骨架与眉眼鼻唇关系。它是项目生成的本人身份图，不是原版game或TV演员图；candidate不等于approved。当前ch14仍为约1753生前实体回忆，按本稿画厚浅米皮裘、双手空手拢裘、无兵器无婴儿、低稳已婚小髻素簪；不硬复制源图高髻、深灰长披肩流苏、腰侧鞘装兵器、服色或密集细纹。 第二输入仅取用户图的暖浅灰纸底、极浅水墨远山薄雾与留白；不取女性面容、年龄、身体、白青衣裙、发型、首饰、倾头姿势或花枝亭阁。背景墨痕止于本人轮廓之外，不侵入完整衣肤。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；已有同一胡夫人的项目生成本人PNG作为身份输入；不要冒充原版游戏脸或TV演员本人，不借其他角色、演员或色卡基线脸，不替换本人脸部骨架；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要改编姓名或神女造型、幼女脸、怀孕大腹、裸露哺乳、卧床产育、血污割喉、幽灵透明化；不要白手套金铃索、双剑、皇后冠或晚清旗头。 不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物现存皮肤、衣料、毛发和器物完整连续，保留明确伤残。保留工具原有溯源信息，不去除或伪造。

FINAL POSE CHECK: FRONT-FACING, head naturally upright, eyes HORIZONTALLY LEVEL, camera level. NO head tilt. Preserve age, existing impairment and narrative stage; do not straighten a described bent back or add a missing arm.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；已有同一胡夫人的项目生成本人PNG作为身份输入；不要冒充原版游戏脸或TV演员本人，不借其他角色、演员或色卡基线脸，不替换本人脸部骨架；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要改编姓名或神女造型、幼女脸、怀孕大腹、裸露哺乳、卧床产育、血污割喉、幽灵透明化；不要白手套金铃索、双剑、皇后冠或晚清旗头。 不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物现存皮肤、衣料、毛发和器物完整连续，保留明确伤残。保留工具原有溯源信息，不去除或伪造。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_hufuren__ch14_youth_memory_base.prepared.json`。
