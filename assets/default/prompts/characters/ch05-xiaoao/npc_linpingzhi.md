---
asset_id: por_npc_linpingzhi__ch05_youth_fuwei_base
subject_id: npc_linpingzhi
name: 林平之
book: ch05_xiaoao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch05/por_npc_linpingzhi__ch05_youth_fuwei_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_37-1.png
  use: 原版林平之HDGRP_37-1本人身份，已实际view；取年轻无须的清楚椭圆脸、细长眉眼、端正鼻梁和柔和鼻唇下颌关系，按十八九岁青涩少主重构正面。原图灰小帽、绿领和侧看不照搬；细网巾束髻、米黄锦衣、普通入鞘剑按本阶段，不能提前后期失明或辟邪变化。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考仅同性别项目画法和设色控制：柔光、低饱和色、精细连贯写实手绘，已在本会话实际view且SHA复核。candidate状态不改变；完全忽略令狐冲的面貌、青年年龄、体格、胡茬、网巾、服装、剑与倾头。人物实际服色以当前稿为准，不把所有人变青灰袍。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三仅用户指定浅水墨背景、暖浅灰纸底、远景留白；已在本会话实际view且SHA复核。忽略女性脸、身形、衣装、发饰与头部倾角；墨色不能侵蚀人物皮肤衣料或道具。
status: ready
realism_revision: user_identity_pose_20261001
---

# 林平之 · 人物写实修正

## 人物与阶段

- subject_id：npc_linpingzhi
- book：ch05_xiaoao
- gender：male
- age_variant：youth

## 本轮人物写实规范

林平之：第一原版本人头像身份，福州开局福威少主，灭门前行猎归来的完整青年形象；十八九岁上下观感待考，尚有青涩，无须。保留本人差异和明确阶段器物，头正眼平，写实完整人物与衣料，浅水墨只作背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_linpingzhi__ch05_youth_fuwei_base/prompt-6603eda5210627d2a94682151e8696c8cab987ee4d059975c373a5bf83879ab1.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE REQUIREMENT: FRONT-FACING full-body standing portrait; head and neck naturally UPRIGHT. Keep the forehead–nose–chin centreline VERTICAL and both eyes HORIZONTAL, head centered over the torso, direct forward gaze and level camera. NO head tilt and NO Dutch angle. Reconstruct the reference face in this upright frontal view; never copy a turned face, raised chin, leaning head or sloping camera. Natural facial asymmetry does not mean a tilted skull.

Create a NEW realistic full-body identity portrait of LIN PINGZHI / 林平之, using ORIGINAL Heroes of Jin Yong portrait HDGRP_37-1 as the ONLY facial identity reference. This is the EARLY Fuwei Escort Agency heir in Fuzhou, returning from hunting BEFORE the family massacre. Both eyes see normally, the face and all four limbs are intact. No later revenge-stage injury, blindness or bodily change belongs to this basic portrait.

青年本人面貌：十八九岁上下的年少青年观感，尚未完全厚实的肩背，四肢修长轻健，不成年健美化，也不改画女性。第一头像年轻无须、清楚椭圆脸，较细长的眉眼关系、端正鼻梁、鼻唇自然衔接和柔和下颌保留；真实重绘成秀挺椭圆长脸而不刻成尖锥下巴。清俊肤色干净自然，眼睛清楚正常、神情自信中带未经世事的青涩，嘴自然放松，不加成熟冷厉杀气、夸张挑逗或浓妆。头直、双眼水平看向观者，不复制头像侧看。必须和第二基线令狐冲的长方脸、浅胡茬及松弛笑意有明显区别。

福威少主服饰：明代淡米黄色窄袖锦缎长衣，仅细微暗纹，青灰布带与深色长裤、整洁短靴。交领右衽，穿着者左襟盖右襟，领口严整。头发整齐束髻配细网巾，不戴原游戏灰小帽，不照搬绿色衣领。腰间一枚小素玉饰，不刻字；家世由完整精细衣料和端正仪态表达，不用宫廷贵胄冠饰、金冠、官服补子或华丽大披风。衣物整片有真实垂坠，完整下摆，不画破衣流亡外观。

站姿与普通佩剑：正面双足自然承重，肩背稍挺而不僵硬，头颈与身体中线自然竖直。本人左腰只有一柄普通中式直身双刃佩剑，刀剑刃完全入长度足够的长鞘，朴素铜装，护手、柄、鞘口和末端完整可信，短挂带接腰带。左手自然轻扶剑鞘上段，右手空着垂下，双手清楚、没有拔剑动作。剑是普通随身佩剑，不名为辟邪剑、不发光、不刻武学文字。尽管选段为行猎归来，画面不加猎物、马匹、弓箭、镖旗、山林追逐或随从。本图是完整少主基础形象，不是血案现场。

参考主次与画法：第一张只提供原版《金庸群侠传》本人的脸部辨识关系，将低分辨率像素信息重新绘成清楚写实面容，不能直接放大像素、照搬边框、原头像倾角或混书年龄。第二张男性基线仅提供低饱和设色控制、柔和光照与连贯细腻的写实手绘质量，不能传递令狐冲的脸、年龄、体型、胡茬、发型、服饰、剑或站姿。第三张用户图仅提供背景淡水墨，不借其女性脸、身体、侧倾、白青薄纱衣或发饰。人物本体精细、完整、真实：脸、眼、双手和双足清楚，皮肤、发丝、布料和器物材料各自连续，柔和左上漫射光形成连贯体积。衣物整片可穿、裁剪清楚、下摆和袖口完整，仅少量宽缓承重褶皱及细微真实纹理，不用破衣、碎片或密集噪点表现武侠感。
背景为不透明暖浅灰纸底，极淡远山水墨、薄雾与留白，只有少量脚下接触阴影；没有具体经典场景、建筑或第二个人。水墨和纸纹全部停留在背景，不能透进脸、皮肤、衣物、靴子和道具。
单人单视图，原生竖幅2:3完整全身，头顶、双手、双足、全部衣摆与道具端点舒适入画。自然体态与年龄优先，不使用固定占高/头身数字硬限。目标2048×3072不透明PNG；工具实际返回其他原生2:3尺寸须实测如实记录，保存原始PNG字节，不插值、裁切或重编码。默认一张独立单人候选经执行者实际自查，全部candidate待用户审核，不自动approved。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线倾斜、斜眼线、转头侧脸、回眸、低头藏眼、抬下巴仰视、耸单肩或倾斜镜头；不要把四人画成同一个通用男脸，不借令狐冲、萧峰、王语嫣等其他参考人物面孔。不要像素格、原头像边框、直接放大游戏截图、动漫大眼、网红尖下巴、丰唇滤镜、过度磨皮、塑料皮肤、摄影截图或三维模型。不要时代混搭、现代服饰、拉链、腕表、数码物件、清式剃额辫子、满清官服、日式服制刀具、欧式奇幻甲胄或无依据的官阶徽记。不要错误衣襟、水平镜像、悬浮装备、失重衣料、多武器、手物融合、道具穿身、弯折断裂器物、容不下刀剑的短鞘。不要多人物、分格、多视图、脸部特写框、多肢、多指、粘连指、错接手腕、无依据缺手缺足、裁断头足或道具端点。人物不要碎墨飞白、纸纹透肤透衣、白斑缺块、纸屑侵蚀、碎布、撕裂衣摆、破边、过密杂乱衣纹、噪点斑驳脸、模糊眼睛或浓雾遮手；水墨仅限背景。不要裸露、透衣、性感化、血腥、恶搞、丑化或怪物体态；不要无依据神佛法相、发光兵器、光球、法阵、龙形能量、粒子光效、强泛光和舞台硬轮廓光。不要文字、印章、题款、签名、logo、装饰水印、武功名称或药方；工具自带溯源原样保留。 不要失明眼罩、闭目白眼、面伤、瘸腿、缺肢或后期终局残疾；不要提前练辟邪后的身体变化、冷酷复仇杀气、流亡破衣、华山弟子制服或囚服。不要浓胡须、厚成年体格、女性身体或浓妆偶像。不要原头像灰帽绿领、侧面看人，不借令狐冲胡茬与长方脸。不要猎物、马匹、弓箭、镖旗文字或随从；只一柄普通入鞘直剑，不要实体“辟邪剑”、发光剑、第二剑、出鞘战斗或皇族冠服。

FINAL POSE CHECK: one FRONT-FACING figure, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, neck naturally upright and camera level. NO head tilt and NO Dutch angle. Preserve this person’s own face from reference 1, their documented age/stage and all required body/prop endpoints; references 2 and 3 must not supply another face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线倾斜、斜眼线、转头侧脸、回眸、低头藏眼、抬下巴仰视、耸单肩或倾斜镜头；不要把四人画成同一个通用男脸，不借令狐冲、萧峰、王语嫣等其他参考人物面孔。不要像素格、原头像边框、直接放大游戏截图、动漫大眼、网红尖下巴、丰唇滤镜、过度磨皮、塑料皮肤、摄影截图或三维模型。不要时代混搭、现代服饰、拉链、腕表、数码物件、清式剃额辫子、满清官服、日式服制刀具、欧式奇幻甲胄或无依据的官阶徽记。不要错误衣襟、水平镜像、悬浮装备、失重衣料、多武器、手物融合、道具穿身、弯折断裂器物、容不下刀剑的短鞘。不要多人物、分格、多视图、脸部特写框、多肢、多指、粘连指、错接手腕、无依据缺手缺足、裁断头足或道具端点。人物不要碎墨飞白、纸纹透肤透衣、白斑缺块、纸屑侵蚀、碎布、撕裂衣摆、破边、过密杂乱衣纹、噪点斑驳脸、模糊眼睛或浓雾遮手；水墨仅限背景。不要裸露、透衣、性感化、血腥、恶搞、丑化或怪物体态；不要无依据神佛法相、发光兵器、光球、法阵、龙形能量、粒子光效、强泛光和舞台硬轮廓光。不要文字、印章、题款、签名、logo、装饰水印、武功名称或药方；工具自带溯源原样保留。 不要失明眼罩、闭目白眼、面伤、瘸腿、缺肢或后期终局残疾；不要提前练辟邪后的身体变化、冷酷复仇杀气、流亡破衣、华山弟子制服或囚服。不要浓胡须、厚成年体格、女性身体或浓妆偶像。不要原头像灰帽绿领、侧面看人，不借令狐冲胡茬与长方脸。不要猎物、马匹、弓箭、镖旗文字或随从；只一柄普通入鞘直剑，不要实体“辟邪剑”、发光剑、第二剑、出鞘战斗或皇族冠服。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_linpingzhi__ch05_youth_fuwei_base.prepared.json`。
