---
asset_id: por_npc_zhangsanfeng__ch04_elder_taiji_base
subject_id: npc_zhangsanfeng
name: 张三丰
book: ch04_yitian
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch04/por_npc_zhangsanfeng__ch04_elder_taiji_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_6-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》张三丰本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。只保本人老年面部关系，不复制头像侧向；白须白眉和高龄由本阶段同时要求，服装依当前武当道袍稿，不由头像领口推断。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为candidate，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: ready
realism_revision: user_identity_pose_20261001
---

# 张三丰 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhangsanfeng
- book：ch04_yitian
- gender：male
- age_variant：elder

## 本轮人物写实规范

6-1本人老年骨相唯一身份；百岁以上武当太极初传，白发白眉长白须、宽厚慈和而清明。正面头颈竖直、双眼水平，NO head tilt / NO Dutch angle；灰青完整右衽道袍与低小道冠，双手空手松圆收势、右略高左略低，无拂尘剑器或太极特效。先1张candidate，人物连续写实、水墨只背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhangsanfeng__ch04_elder_taiji_base/prompt-53a74a094a0d406f5827197b807217bace6ab94fc2a999aab47e7b9a0da6825e.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of ZHANG SANFENG / 张三丰. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：百岁以上的元末武当开山祖师，武当太极初传阶段；与ch03少年张君宝同一主体，但本图只做老年。

本人面容辨识：第一参考6-1张三丰本人头像：宽广高额、较厚实的颧颊，白眉自然横展、眉尾向下柔垂，狭长而温厚的眼形和眉眼间距清楚；鼻梁长直、鼻头厚实圆润，口鼻间位置与长白髭须的生长关系保留。白须向胸前自然垂落，嘴部仍能辨其平和闭合唇线；脸上的岁月纹理连贯，不凭像素噪点添疤。依本人的眉眼鼻口关系重建自然高龄面容，不套用通用仙翁或第二图青年脸加白须。表情慈和清明，目光平静而有精神；不抹成青年，也不画鬼瘦病骨。

身形高大略宽厚，百岁以上但不是夸张肥胖或枯骨。肩背舒展、身体正面站稳，双膝轻松，头颈直立、双眼水平，静静演示圆转收势。此时在武当太极初传阶段，剧情有遇袭背景；不另称全盛无伤，不做大开大合实战，不凭空加血迹、包扎、断肢或瘫痪，也不把俞岱岩的不能移动移给张三丰。

洗旧灰青色道袍、素白内领、普通窄布绦、白袜与朴素布鞋。汉式交领右衽为穿着者左襟压右襟，向本人右侧合拢。袍袖虽宽松但结构完整、不是巨大羽翼；整片衣料连续垂坠、边缘完整，不做碎裂飞白。白发收成低稳道髻，以朴素小道冠和木簪固定，白眉长白须与发髻保持真实毛发生长连接。道冠低小简洁，无宝石金冠、符纸或神仙装饰；无少林袈裟、光头戒疤和少年黑发。具体灰青色、低冠与裁制沿用当前稿美术补足。

双手完全空着，不佩挂兵器。两臂在身体前方构成松圆、自然的太极收势：本人右掌在下胸前稍高、掌心自然向内偏下，左掌在腹前稍低、掌心向内偏上，两掌相隔不触碰，不遮白须或脸，不形成僵硬法印。手指自然五指、关节与腕部清楚，袖口不吞手；双足稳稳着地。没有拂尘、宝剑、木剑、念珠或任何法器，没有阴阳球、太极圆盘、发光八卦或能量线。左右高低是本设计布局选择，不冒称原著唯一招式定格。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。按用户最新提速指示先生成1张候选，宽松自查后仍为candidate，等待用户审核；画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要少年张君宝、青年黑发、少林僧袍、光头、青年基线脸加白胡子、枯骨老仙或肥胖恶搞；不要把面容磨平成年轻人。不要新增缺肢、瘫痪、轮椅、拐杖、血伤或包扎；也不要声称全盛无伤或演成腾空打斗。不要拂尘、长剑、木剑、腰挂剑鞘、佛珠、道教大神冠冕、发光太极球、阴阳法阵、神仙光环。不要两掌合十、手掌粘连、手指缠须或袖口遮手；不要谢逊金发金须。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING ZHANG SANFENG. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.
```

## 排除项

不要少年张君宝、青年黑发、少林僧袍、光头、青年基线脸加白胡子、枯骨老仙或肥胖恶搞；不要把面容磨平成年轻人。不要新增缺肢、瘫痪、轮椅、拐杖、血伤或包扎；也不要声称全盛无伤或演成腾空打斗。不要拂尘、长剑、木剑、腰挂剑鞘、佛珠、道教大神冠冕、发光太极球、阴阳法阵、神仙光环。不要两掌合十、手掌粘连、手指缠须或袖口遮手；不要谢逊金发金须。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhangsanfeng__ch04_elder_taiji_base.prepared.json`。
