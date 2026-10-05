---
asset_id: por_npc_fengqingyang__ch05_elder_base
subject_id: npc_fengqingyang
name: 风清扬
book: ch05_xiaoao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch05/por_npc_fengqingyang__ch05_elder_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_31-1.png
  use: 原版风清扬HDGRP_31-1本人身份，已实际view；取兜帽下可见的瘦削颊部、深而细的明亮眼、突出清楚的鼻部和长灰白须轮廓。头像遮住额部与部分发际，不能凭图臆断；按稿改为白发素簪小髻、无遮眼的正面灰衣老人，不复制褐色兜帽、低头或厚披风。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考仅同性别项目画法和设色控制：柔光、低饱和色、精细连贯写实手绘，已在本会话实际view且SHA复核。candidate状态不改变；完全忽略令狐冲的面貌、青年年龄、体格、胡茬、网巾、服装、剑与倾头。人物实际服色以当前稿为准，不把所有人变青灰袍。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三仅用户指定浅水墨背景、暖浅灰纸底、远景留白；已在本会话实际view且SHA复核。忽略女性脸、身形、衣装、发饰与头部倾角；墨色不能侵蚀人物皮肤衣料或道具。
status: ready
realism_revision: user_identity_pose_20261001
---

# 风清扬 · 人物写实修正

## 人物与阶段

- subject_id：npc_fengqingyang
- book：ch05_xiaoao
- gender：male
- age_variant：elder

## 本轮人物写实规范

风清扬：第一原版本人头像身份，思过崖隐居指点令狐冲剑理的晚年；老年清癯、轻健而有真实衰老，不年轻化。保留本人差异和明确阶段器物，头正眼平，写实完整人物与衣料，浅水墨只作背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_fengqingyang__ch05_elder_base/prompt-20e3b6cc85e7dac12d01c34911e4dc8c62aedea06844b6d72eeef2163e0d75b3.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE REQUIREMENT: FRONT-FACING full-body standing portrait; head and neck naturally UPRIGHT. Keep the forehead–nose–chin centreline VERTICAL and both eyes HORIZONTAL, head centered over the torso, direct forward gaze and level camera. NO head tilt and NO Dutch angle. Reconstruct the reference face in this upright frontal view; never copy a turned face, raised chin, leaning head or sloping camera. Natural facial asymmetry does not mean a tilted skull.

Create a NEW realistic full-body identity portrait of FENG QINGYANG / 风清扬, using ORIGINAL Heroes of Jin Yong portrait HDGRP_31-1 as the ONLY facial identity reference. Show the elderly Huashan Sword Sect predecessor quietly teaching sword principles at Siguo Cliff. The reference hood conceals the forehead and hairline: use only the visible facial relationships, and reconstruct the uncovered head using the project's white-hair topknot requirement. Do not paint the hood or turn him into another swordmaster.

晚年脸部与体态：清癯而轻健，真实老年皮肤、消瘦颊部、瘦长脸，面色淡而微黄。取第一头像可见的深而细的眼部关系、清楚较突出的鼻部、瘦削面颊与长灰白须轮廓，画成正面有洞察力的明亮眼神，疏白眉、白须分束自然。额头与发际原图被遮住，按当前稿美术补足，不声称精确复制不可见部分。肩窄背自然直，细长手指有劲，不画病弱失去站姿，也不年轻化或变成健美老翁。嘴角只有淡淡微笑，悠然与从容来自稳而轻的重心和眼神，不靠歪头或仙人光环。

衣饰与发式：灰色素布交领长袍，右衽即穿着者左襟压右襟，细白内领与窄布带，朴素布鞋无纹。袍面可有洗旧的自然色差，但布料整片完整、衣边与下摆连续，少量宽缓褶皱，不画破烂灰袍。白发束成小髻，一根素簪固定，面部无遮挡；不戴原游戏褐兜帽、斗篷或厚帽，不能复制男性基线黑发网巾与青年身形。

姿态与道具：正面自然站定、头颈竖直、双眼水平，双脚完整落地。右手轻松持一截无叶、细直的普通木枝，低垂指向身体右外侧地面，手腕放松、枝两端完整可见、不指向观者或人；左手空着自然垂下。木枝是本项目教学动作的原创扩展，不是原著固定兵器或神兵，不将其加工成木剑，不刻武学名称。不得配独孤利剑、玄铁重剑或其他刀剑，不借独孤求败、神雕剑冢或无剑境界的别人物叙事。本图仅隐居授剑老人，不安排他参加黑木崖、并派政治或群战。

参考主次与画法：第一张只提供原版《金庸群侠传》本人的脸部辨识关系，将低分辨率像素信息重新绘成清楚写实面容，不能直接放大像素、照搬边框、原头像倾角或混书年龄。第二张男性基线仅提供低饱和设色控制、柔和光照与连贯细腻的写实手绘质量，不能传递令狐冲的脸、年龄、体型、胡茬、发型、服饰、剑或站姿。第三张用户图仅提供背景淡水墨，不借其女性脸、身体、侧倾、白青薄纱衣或发饰。人物本体精细、完整、真实：脸、眼、双手和双足清楚，皮肤、发丝、布料和器物材料各自连续，柔和左上漫射光形成连贯体积。衣物整片可穿、裁剪清楚、下摆和袖口完整，仅少量宽缓承重褶皱及细微真实纹理，不用破衣、碎片或密集噪点表现武侠感。
背景为不透明暖浅灰纸底，极淡远山水墨、薄雾与留白，只有少量脚下接触阴影；没有具体经典场景、建筑或第二个人。水墨和纸纹全部停留在背景，不能透进脸、皮肤、衣物、靴子和道具。
单人单视图，原生竖幅2:3完整全身，头顶、双手、双足、全部衣摆与道具端点舒适入画。自然体态与年龄优先，不使用固定占高/头身数字硬限。目标2048×3072不透明PNG；工具实际返回其他原生2:3尺寸须实测如实记录，保存原始PNG字节，不插值、裁切或重编码。默认一张独立单人候选经执行者实际自查，全部candidate待用户审核，不自动approved。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线倾斜、斜眼线、转头侧脸、回眸、低头藏眼、抬下巴仰视、耸单肩或倾斜镜头；不要把四人画成同一个通用男脸，不借令狐冲、萧峰、王语嫣等其他参考人物面孔。不要像素格、原头像边框、直接放大游戏截图、动漫大眼、网红尖下巴、丰唇滤镜、过度磨皮、塑料皮肤、摄影截图或三维模型。不要时代混搭、现代服饰、拉链、腕表、数码物件、清式剃额辫子、满清官服、日式服制刀具、欧式奇幻甲胄或无依据的官阶徽记。不要错误衣襟、水平镜像、悬浮装备、失重衣料、多武器、手物融合、道具穿身、弯折断裂器物、容不下刀剑的短鞘。不要多人物、分格、多视图、脸部特写框、多肢、多指、粘连指、错接手腕、无依据缺手缺足、裁断头足或道具端点。人物不要碎墨飞白、纸纹透肤透衣、白斑缺块、纸屑侵蚀、碎布、撕裂衣摆、破边、过密杂乱衣纹、噪点斑驳脸、模糊眼睛或浓雾遮手；水墨仅限背景。不要裸露、透衣、性感化、血腥、恶搞、丑化或怪物体态；不要无依据神佛法相、发光兵器、光球、法阵、龙形能量、粒子光效、强泛光和舞台硬轮廓光。不要文字、印章、题款、签名、logo、装饰水印、武功名称或药方；工具自带溯源原样保留。 不要褐色兜帽、遮眼斗篷、低头藏脸、神仙帽冠、神光佛光或飞升特效。不要黑发年轻剑客、壮汉肌肉、病危枯骨、需要扶杖才能站的体态或破烂衣服。木枝必须无叶细直、完整两端、低垂身外；不要加工木剑、独孤利剑、玄铁重剑、额外佩剑、剑冢或神雕。不要把风清扬画成独孤求败、张三丰、萧峰或令狐冲老年版，不画黑木崖或五岳并派现场。

FINAL POSE CHECK: one FRONT-FACING figure, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, neck naturally upright and camera level. NO head tilt and NO Dutch angle. Preserve this person’s own face from reference 1, their documented age/stage and all required body/prop endpoints; references 2 and 3 must not supply another face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线倾斜、斜眼线、转头侧脸、回眸、低头藏眼、抬下巴仰视、耸单肩或倾斜镜头；不要把四人画成同一个通用男脸，不借令狐冲、萧峰、王语嫣等其他参考人物面孔。不要像素格、原头像边框、直接放大游戏截图、动漫大眼、网红尖下巴、丰唇滤镜、过度磨皮、塑料皮肤、摄影截图或三维模型。不要时代混搭、现代服饰、拉链、腕表、数码物件、清式剃额辫子、满清官服、日式服制刀具、欧式奇幻甲胄或无依据的官阶徽记。不要错误衣襟、水平镜像、悬浮装备、失重衣料、多武器、手物融合、道具穿身、弯折断裂器物、容不下刀剑的短鞘。不要多人物、分格、多视图、脸部特写框、多肢、多指、粘连指、错接手腕、无依据缺手缺足、裁断头足或道具端点。人物不要碎墨飞白、纸纹透肤透衣、白斑缺块、纸屑侵蚀、碎布、撕裂衣摆、破边、过密杂乱衣纹、噪点斑驳脸、模糊眼睛或浓雾遮手；水墨仅限背景。不要裸露、透衣、性感化、血腥、恶搞、丑化或怪物体态；不要无依据神佛法相、发光兵器、光球、法阵、龙形能量、粒子光效、强泛光和舞台硬轮廓光。不要文字、印章、题款、签名、logo、装饰水印、武功名称或药方；工具自带溯源原样保留。 不要褐色兜帽、遮眼斗篷、低头藏脸、神仙帽冠、神光佛光或飞升特效。不要黑发年轻剑客、壮汉肌肉、病危枯骨、需要扶杖才能站的体态或破烂衣服。木枝必须无叶细直、完整两端、低垂身外；不要加工木剑、独孤利剑、玄铁重剑、额外佩剑、剑冢或神雕。不要把风清扬画成独孤求败、张三丰、萧峰或令狐冲老年版，不画黑木崖或五岳并派现场。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_fengqingyang__ch05_elder_base.prepared.json`。
