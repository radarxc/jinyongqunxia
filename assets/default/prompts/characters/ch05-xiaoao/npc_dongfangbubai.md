---
asset_id: por_npc_dongfangbubai__ch05_prime_heimuya_base
subject_id: npc_dongfangbubai
name: 东方不败
book: ch05_xiaoao
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch05/por_npc_dongfangbubai__ch05_prime_heimuya_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_28-1.png
  use: 原版东方不败HDGRP_28-1本人身份，已实际view；取清楚偏长面骨、突出的颧颊转折、细长眉眼、较挺鼻部与鲜明唇形的关系，保持无须下颌。原图昂首带笑和红黑领不继承；转为正面头直眼平、中年薄脂粉与淡胭脂、沉静警觉，粉红衣与细针绣架按稿。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考仅同性别项目画法和设色控制：柔光、低饱和色、精细连贯写实手绘，已在本会话实际view且SHA复核。candidate状态不改变；完全忽略令狐冲的面貌、青年年龄、体格、胡茬、网巾、服装、剑与倾头。人物实际服色以当前稿为准，不把所有人变青灰袍。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三仅用户指定浅水墨背景、暖浅灰纸底、远景留白；已在本会话实际view且SHA复核。忽略女性脸、身形、衣装、发饰与头部倾角；墨色不能侵蚀人物皮肤衣料或道具。
status: ready
realism_revision: user_identity_pose_20261001
---

# 东方不败 · 人物写实修正

## 人物与阶段

- subject_id：npc_dongfangbubai
- book：ch05_xiaoao
- gender：male
- age_variant：prime

## 本轮人物写实规范

东方不败：第一原版本人头像身份，黑木崖内室绣花、决战尚未受伤的中年教主；中年，保留成年男性独立骨相，不改画成年轻女子。保留本人差异和明确阶段器物，头正眼平，写实完整人物与衣料，浅水墨只作背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_dongfangbubai__ch05_prime_heimuya_base/prompt-d8b197aad15199765e70d9241d3f77508df16c9941da3ec9b7ee5b91b80be9cb.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE REQUIREMENT: FRONT-FACING full-body standing portrait; head and neck naturally UPRIGHT. Keep the forehead–nose–chin centreline VERTICAL and both eyes HORIZONTAL, head centered over the torso, direct forward gaze and level camera. NO head tilt and NO Dutch angle. Reconstruct the reference face in this upright frontal view; never copy a turned face, raised chin, leaning head or sloping camera. Natural facial asymmetry does not mean a tilted skull.

Create a NEW realistic full-body identity portrait of DONGFANG BUBAI / 东方不败 from ch05_xiaoao, using ORIGINAL Heroes of Jin Yong portrait HDGRP_28-1 as the ONLY facial identity reference. This is the middle-aged leader embroidering at Black Wood Cliff before the fatal confrontation and before any injury. Preserve the documented male adult facial/body structure and the pink clothes, subtle face powder and rouge together. Respect the character's presentation without caricature and without replacing the character with a young actress or a generic female face.

本人骨相与表情：第一头像偏长而清楚的面骨、颧颊转折、细长且集中的眉眼、较挺鼻部与鲜明唇形组成独立辨识。重绘真实中年面容，平整无须的下颌，薄施脂粉及淡胭脂，适量自然唇色，不把嘴唇加成滤镜丰唇。眼神细而专注、沉静警觉，举止有掌控感。原头像仰头笑张嘴的表情不继承，头颈端正、下巴水平、双眼水平直视，嘴自然闭合或极轻微含笑。肩体修长，成年男性骨架与内藏力量可信，既不夸大胸肌也不改画成年轻女性身体。

明代语汇衣饰：以粉红色交领长衣为主识别，收敛袖口、同色完整内层，暗红窄带束腰，素布鞋；交领右衽，穿着者左襟覆右襟。衣料完整不透明，柔和且真实有重量，轮廓清楚，不能变成女仙薄纱、层叠碎带或婚礼裙袍。头发细致收髻，一根小簪固定，不戴皇后冠或夸张珠宝。粉红服妆为本阶段既定内容，不能为了男性目录改成黑袍胡须壮汉。

姿态和唯一针线器物：正面自然站稳，绷架位于腰腹前。右手拇指和食指轻拈一枚日常尺寸细小金属绣花针 eq_xiuhuazhen，位置在胸下，其他手指自然放松且清楚。左手握一个小型绣花绷架，绷布有少量简约花叶、没有文字。一根细线从针的尾端连到绷布工作处，中段顺重力轻垂，结构可追踪，不绷成攻击激光或铺满画面。针小但与手指分离可辨；不用巨大长针充当长矛，不增加一束针或其他武器。不摆决战冲刺姿势，没有伤口、血迹、医疗过程或尸体，不画王座与大殿替身。

参考主次与画法：第一张只提供原版《金庸群侠传》本人的脸部辨识关系，将低分辨率像素信息重新绘成清楚写实面容，不能直接放大像素、照搬边框、原头像倾角或混书年龄。第二张男性基线仅提供低饱和设色控制、柔和光照与连贯细腻的写实手绘质量，不能传递令狐冲的脸、年龄、体型、胡茬、发型、服饰、剑或站姿。第三张用户图仅提供背景淡水墨，不借其女性脸、身体、侧倾、白青薄纱衣或发饰。人物本体精细、完整、真实：脸、眼、双手和双足清楚，皮肤、发丝、布料和器物材料各自连续，柔和左上漫射光形成连贯体积。衣物整片可穿、裁剪清楚、下摆和袖口完整，仅少量宽缓承重褶皱及细微真实纹理，不用破衣、碎片或密集噪点表现武侠感。
背景为不透明暖浅灰纸底，极淡远山水墨、薄雾与留白，只有少量脚下接触阴影；没有具体经典场景、建筑或第二个人。水墨和纸纹全部停留在背景，不能透进脸、皮肤、衣物、靴子和道具。
单人单视图，原生竖幅2:3完整全身，头顶、双手、双足、全部衣摆与道具端点舒适入画。自然体态与年龄优先，不使用固定占高/头身数字硬限。目标2048×3072不透明PNG；工具实际返回其他原生2:3尺寸须实测如实记录，保存原始PNG字节，不插值、裁切或重编码。默认一张独立单人候选经执行者实际自查，全部candidate待用户审核，不自动approved。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线倾斜、斜眼线、转头侧脸、回眸、低头藏眼、抬下巴仰视、耸单肩或倾斜镜头；不要把四人画成同一个通用男脸，不借令狐冲、萧峰、王语嫣等其他参考人物面孔。不要像素格、原头像边框、直接放大游戏截图、动漫大眼、网红尖下巴、丰唇滤镜、过度磨皮、塑料皮肤、摄影截图或三维模型。不要时代混搭、现代服饰、拉链、腕表、数码物件、清式剃额辫子、满清官服、日式服制刀具、欧式奇幻甲胄或无依据的官阶徽记。不要错误衣襟、水平镜像、悬浮装备、失重衣料、多武器、手物融合、道具穿身、弯折断裂器物、容不下刀剑的短鞘。不要多人物、分格、多视图、脸部特写框、多肢、多指、粘连指、错接手腕、无依据缺手缺足、裁断头足或道具端点。人物不要碎墨飞白、纸纹透肤透衣、白斑缺块、纸屑侵蚀、碎布、撕裂衣摆、破边、过密杂乱衣纹、噪点斑驳脸、模糊眼睛或浓雾遮手；水墨仅限背景。不要裸露、透衣、性感化、血腥、恶搞、丑化或怪物体态；不要无依据神佛法相、发光兵器、光球、法阵、龙形能量、粒子光效、强泛光和舞台硬轮廓光。不要文字、印章、题款、签名、logo、装饰水印、武功名称或药方；工具自带溯源原样保留。 不要年轻女子替身、电影演员替身、宽胸巨汉、胡须、抹去粉红衣脂粉的普通男袍；不要夸张女装恶搞、浓艳舞台妆、皇后冠、大红婚服或过度珠宝。不要原头像昂首大笑、夸张厚唇或斜上视线。不要针变成长矛、针束、激光、毒针法阵，右手仅一枚小绣花针，左手仅小绷架，线必须相连；不要针线穿掌或飘离绷布。不要大殿替身、王座、黑木崖决战伤口、尸体或医学过程。

FINAL POSE CHECK: one FRONT-FACING figure, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, neck naturally upright and camera level. NO head tilt and NO Dutch angle. Preserve this person’s own face from reference 1, their documented age/stage and all required body/prop endpoints; references 2 and 3 must not supply another face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线倾斜、斜眼线、转头侧脸、回眸、低头藏眼、抬下巴仰视、耸单肩或倾斜镜头；不要把四人画成同一个通用男脸，不借令狐冲、萧峰、王语嫣等其他参考人物面孔。不要像素格、原头像边框、直接放大游戏截图、动漫大眼、网红尖下巴、丰唇滤镜、过度磨皮、塑料皮肤、摄影截图或三维模型。不要时代混搭、现代服饰、拉链、腕表、数码物件、清式剃额辫子、满清官服、日式服制刀具、欧式奇幻甲胄或无依据的官阶徽记。不要错误衣襟、水平镜像、悬浮装备、失重衣料、多武器、手物融合、道具穿身、弯折断裂器物、容不下刀剑的短鞘。不要多人物、分格、多视图、脸部特写框、多肢、多指、粘连指、错接手腕、无依据缺手缺足、裁断头足或道具端点。人物不要碎墨飞白、纸纹透肤透衣、白斑缺块、纸屑侵蚀、碎布、撕裂衣摆、破边、过密杂乱衣纹、噪点斑驳脸、模糊眼睛或浓雾遮手；水墨仅限背景。不要裸露、透衣、性感化、血腥、恶搞、丑化或怪物体态；不要无依据神佛法相、发光兵器、光球、法阵、龙形能量、粒子光效、强泛光和舞台硬轮廓光。不要文字、印章、题款、签名、logo、装饰水印、武功名称或药方；工具自带溯源原样保留。 不要年轻女子替身、电影演员替身、宽胸巨汉、胡须、抹去粉红衣脂粉的普通男袍；不要夸张女装恶搞、浓艳舞台妆、皇后冠、大红婚服或过度珠宝。不要原头像昂首大笑、夸张厚唇或斜上视线。不要针变成长矛、针束、激光、毒针法阵，右手仅一枚小绣花针，左手仅小绷架，线必须相连；不要针线穿掌或飘离绷布。不要大殿替身、王座、黑木崖决战伤口、尸体或医学过程。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_dongfangbubai__ch05_prime_heimuya_base.prepared.json`。
