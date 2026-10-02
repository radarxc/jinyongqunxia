---
asset_id: por_npc_daiqisi__ch04_prime_jinhua_base
subject_id: npc_daiqisi
name: 黛绮丝
book: ch04_yitian
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch04/por_npc_daiqisi__ch04_prime_jinhua_base.png
manifest: assets/default/character/female/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_16-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》黛绮丝本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。source-audit把黛绮丝与金花婆婆同人映射已核实；本阶段只老妇伪装，借本人圆厚面容，不复制灰黑盘髻发簪，不出现中年真容。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为approved，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: ready
realism_revision: user_identity_pose_20261001
---

# 黛绮丝 · 人物写实修正

## 人物与阶段

- subject_id：npc_daiqisi
- book：ch04_yitian
- gender：female
- age_variant：prime

## 本轮人物写实规范

16-1金花婆婆本人圆厚老妇五官，真实中年但本图只老妇伪装。正面头颈端正双眼水平，身体可微弓而不歪颈，NO head tilt / NO Dutch angle；灰褐完整长袄暗紫内缘、灰白鬓发素头巾。本人右手1拐杖落地，左手腰侧1小金色花镖。无真容叠图与法术，女性基线只画风，1张candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_daiqisi__ch04_prime_jinhua_base/prompt-86b795680ee6c6adc3716a9251519d17a7167ecd5e55ac65ac280ba03a1cca2d.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of DAI QISI AS JINHUA POPO / 黛绮丝. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：真实中年的黛绮丝，蝴蝶谷出现时的金花婆婆老妇伪装；prime只记录真实年龄，画面必须老妇外观。

本人面容辨识：唯一身份是第一参考16-1已核实黛绮丝/金花婆婆头像：圆厚的颧颊、自然饱满而有年龄下垂的面部软组织，与窄长枯脸区分；眉弧较柔且眼裂偏小，眼皮褶与眼角纹清楚，鼻头圆厚、鼻翼适中，较小闭合嘴与下巴有柔和圆转。保留这些本人脸部关系，额颊皱纹、眼袋与口周纹连贯写实，目光锐利审视但口部只克制轻抿，不把原像略有笑意放大成慈祥无戒备的笑脸。画面只显示老妇伪装，灰白鬓发；不能因真实年龄prime变年轻，也不能借王语嫣脸加皱纹。面部完整连续指渲染清楚，不是删除伪装皱纹；不画透明面具、摘面具动作或年轻真容叠影。

金花婆婆外观为老妇，身体轻微弓背但筋骨坚实、重心能自持；不矮化成侏儒、病危或颤抖老人。身体面向正面，保留胸背极轻曲度，头颈自然抬正、脸部中线竖直、双眼水平，不向肩侧倒、不侧脸回眸。两脚落地，一手扶杖但不全身瘫压在杖上。真实中年与伪装老态在记录中分清，只画一个人。

灰褐色交领长袄、暗紫色仅作少量内缘、深灰裙裤与朴素布鞋。左襟覆盖右襟、向穿着者本人右侧合拢；布料旧色但完整连续、整洁不透明，领袖与下摆剪裁清楚，不画碎边、破洞或墨纸侵蚀。灰白头发收在素旧头巾中，少量灰白鬓边露出，保留老妇识别而不照搬游戏盘髻发簪与黑发色。无少女高髻、珠宝华服、紫衫圣女冠饰；暗紫内缘不能扩为真容华贵主袍。

恰好一根结实朴素拐杖和一枚小型金色花状暗器。本人右手即观者左侧在身旁握拐杖上部，杖身连续、杖脚确实接触地面，完整杖顶杖脚皆入画，不能穿鞋。本人左手即观者右侧在腰侧轻持一枚掌心以下大小的金色花镖，花状轮廓和手指接点清楚，克制哑光金属，不发光、不飘浮，不甩成群体飞镖。杖与花镖分别在身体两侧，不遮脸；杖头为朴素实用形制，无蛇、蝙蝠、龙或法器结构。左右持法、轮廓与材质选色为美术补足，不当成原著核定细节。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要年轻真容、少女紫衫圣女、无皱纹脸、王语嫣脸或真容与伪装双脸拼贴；不要透明面具、半脸揭面或身份文字。不要垂死枯弱、侏儒、驼背怪物、男性老人脸或妖婆化。不要游戏黑发盘髻与发簪照搬，不要浓妆珠宝。不要丢失拐杖或花镖，不要第二根杖、蛇杖、蝙蝠法杖、悬空杖脚、巨型金花、发光花阵、飘浮暗器或一把金花。不要剑刀、权杖、念珠或年轻同伴；人物旧衣仍完整。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING DAI QISI AS JINHUA POPO. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.
```

## 排除项

不要年轻真容、少女紫衫圣女、无皱纹脸、王语嫣脸或真容与伪装双脸拼贴；不要透明面具、半脸揭面或身份文字。不要垂死枯弱、侏儒、驼背怪物、男性老人脸或妖婆化。不要游戏黑发盘髻与发簪照搬，不要浓妆珠宝。不要丢失拐杖或花镖，不要第二根杖、蛇杖、蝙蝠法杖、悬空杖脚、巨型金花、发光花阵、飘浮暗器或一把金花。不要剑刀、权杖、念珠或年轻同伴；人物旧衣仍完整。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_daiqisi__ch04_prime_jinhua_base.prepared.json`。
