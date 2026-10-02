---
asset_id: por_npc_miejueshitai__ch04_elder_yitian_base
subject_id: npc_miejueshitai
name: 灭绝师太
book: ch04_yitian
gender: female
age_variant: elder
tier: S
output: assets/default/character/female/ch04/por_npc_miejueshitai__ch04_elder_yitian_base.png
manifest: assets/default/character/female/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_7-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》灭绝师太本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。以本人中老年女性五官为唯一身份，不复制年轻女性基线脸；尼装与倚天剑铁环按本阶段稿，忽略原头像红领和帽上无法辨明的小符号。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为approved，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: ready
realism_revision: user_identity_pose_20261001
---

# 灭绝师太 · 人物写实修正

## 人物与阶段

- subject_id：npc_miejueshitai
- book：ch04_yitian
- gender：female
- age_variant：elder

## 本轮人物写实规范

7-1本人成熟女性窄长骨相与锐利眉眼，严正而不妖魔化；六派西征、被囚前峨眉掌门。正面头颈垂直双眼水平，NO head tilt / NO Dutch angle；灰尼衣、灰褐外披、素深灰尼帽，人物连续写实不少女化。本人左手持完整入鞘倚天剑1柄，右手垂放、右中指素铁环1枚（指位原创待考）。1张candidate，女性基线只画风，背景淡墨。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_miejueshitai__ch04_elder_yitian_base/prompt-4970b3ea4c986ed4bca2d586ce4c4d8e0f2d688a2794761164eb37c7780f8d73.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of MIEJUE SHITAI / 灭绝师太. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：中老年峨眉掌门，六派西征、万安寺被囚之前，仍持完整倚天剑及传位前掌门铁指环。

本人面容辨识：第一参考7-1灭绝师太本人头像：窄长而有棱角的成熟女性面孔，额头和颊部自然年龄纹理，较低而清楚的眉形，狭长坚定的眼裂与眉眼距离保留；鼻梁细长而直、鼻翼克制，紧抿但不扭曲的薄唇、清楚的颧颊和下颌转折体现严正。保持原头像这一套成熟骨相与坚决神态，细腻写实重建，不用年轻王语嫣脸加几条皱纹，不男性化或妖魔化。眉心可有自然竖纹、眼周与口周皱纹有柔和体积，皮肤真实连贯，不画斑驳裂纸和过分深刻疤痕。目光正视来人、坚定锐利但不做杀戮鬼笑。

中老年女性尼师、峨眉掌门，高挑瘦劲而有真实肩背和手臂力量，保留女性年龄与体态，不套壮汉躯干、不抹成年轻少女。挺身稳立、肩背端正、头颈竖直，双眼水平、镜头水平；威严来自清醒目光和自持姿态。尚未被囚、坠塔或进入改命重伤阶段，无血迹、绷带、跛腿、断肢或虚弱支撑道具。

元末峨眉出家尼师的灰色完整僧尼长衣、灰褐外披、素净深灰尼帽包住剃度头部；不露俗家长发、高髻或首饰。内层汉式交领左襟盖右襟、向本人右侧合拢，朴素布带与平底布鞋。衣料完全不透明，领口闭合、衣摆袖口完整，肩披保持连续整片布的重量和清楚边缘；不变为碎墨纸片。尼帽朴素无文字徽记，除掌门铁指环外不戴珠宝；不照搬像素红灰领口、帽上微小不明符号或年轻基线裙装。

只有一柄完整入鞘倚天剑：中式直身双刃长剑的形制，剑刃不露，柄、简洁剑格、足长剑鞘与封尾严格同轴。本人左手在观者右侧握住鞘口下段，剑鞘斜向本人左外侧下方，离腿与地面，整剑端点入画；小型镂空卷云护手、克制纹样剑首和冷色金属装具作为原创名剑辨识，无文字、无光刃。本人右手即观者左侧自然垂放、五指清楚；右手中指戴一枚深铁灰素面掌门铁指环，贴合手指、没有宝石或纹样，不被袖口遮住。佩戴右中指是为本图可读性所作美术选择，原著侧别指位仍待考，不冒称已核定。指环1枚、剑1柄，无屠龙刀、第二剑、权杖或佛珠。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要青年美少女、王语嫣脸、男性面孔或壮汉体型，不能磨掉中老年皱纹；不要妖婆鬼脸、暴怒杀戮笑容或夸张阴森黑眼圈。不要俗家长发高髻、凤冠珠钗、浓妆、露肩、透衣、华丽珠宝；不要像素帽上的不明符号或红领照搬。不要万安寺被囚、坠塔血迹、改命重伤、断剑、屠龙刀、第二把剑、光刃、超大西式剑格；剑必须完整入鞘、不能拔刃。不要漏掉掌门铁指环、多个戒指、金镶宝石戒或指环悬浮；不要袖口吞掉戴环手，不把指环融合成指头疤痕。不要佛珠、拂尘、权杖或教派徽记文字。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING MIEJUE SHITAI. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.
```

## 排除项

不要青年美少女、王语嫣脸、男性面孔或壮汉体型，不能磨掉中老年皱纹；不要妖婆鬼脸、暴怒杀戮笑容或夸张阴森黑眼圈。不要俗家长发高髻、凤冠珠钗、浓妆、露肩、透衣、华丽珠宝；不要像素帽上的不明符号或红领照搬。不要万安寺被囚、坠塔血迹、改命重伤、断剑、屠龙刀、第二把剑、光刃、超大西式剑格；剑必须完整入鞘、不能拔刃。不要漏掉掌门铁指环、多个戒指、金镶宝石戒或指环悬浮；不要袖口吞掉戴环手，不把指环融合成指头疤痕。不要佛珠、拂尘、权杖或教派徽记文字。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_miejueshitai__ch04_elder_yitian_base.prepared.json`。
