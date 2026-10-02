---
asset_id: por_npc_weiyixiao__ch04_prime_base
subject_id: npc_weiyixiao
name: 韦一笑
book: ch04_yitian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch04/por_npc_weiyixiao__ch04_prime_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_15-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》韦一笑本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。保本人高颧窄长脸与眉鼻唇比例；忽略高耸竖发、倾斜角度和像素黄绿明暗，当前中年低髻、寒毒相关自然苍白但非发病或兽化。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二只用户淡水墨背景；忽略女性人物全部身份，不作为男人脸部参考。
status: ready
realism_revision: user_identity_pose_20261001
---

# 韦一笑 · 人物写实修正

## 人物与阶段

- subject_id：npc_weiyixiao
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

初始单张1与范遥同脸，重大身份辨识不足；本次明确补2只以本人game15与用户水墨背景输入，移除其他男性脸，保持中年苍白寒毒阶段与原衣装，实际候选数登记2，全部candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_weiyixiao__ch04_prime_base/prompt-4a721c961a46c00439f506b6a3db562d990c26d51bf9ccdf26aae0c32d158e1a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
FACIAL IDENTITY CORRECTION, new full-body illustration, NOT an edit of the previous generic face. Image 1 is Wei Yixiao himself and is the ONLY face source. Preserve his notably long, angular, gaunt middle-aged face: hollow temples and cheek hollows directly below high prominent cheekbones; narrow bony lower jaw and long tapering chin; thin sharply oblique eyebrows with the outer ends rising; narrow intense eyes; elongated nose with a slightly downward tip, thin lips and deep lean nasolabial planes. These are individual identity features, not youthful idol beauty. Do NOT replace them with a smooth broad oval face, fleshy cheeks, thick lips, round eyes or a generic handsome young hero. Keep his face front-facing and head upright, while preserving these exact relationships. Natural human anatomy, not monstrous or skeletal. This distinctive game face must survive the realistic reconstruction.

POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of WEI YIXIAO / 韦一笑. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 supplies ONLY the pale ink landscape background; ignore its woman entirely. There is no other male face reference. Build this man solely from image 1.

阶段：中年青翼蝠王，光明顶后、寒毒尚需调治的侦察援救阶段；不是吸血或发病现场。

本人面容辨识：第一参考15-1韦一笑本人：特别清瘦纵长的脸，颧骨高而颊部略陷，下颌向窄而有骨性的下巴收束；斜挑眉与细长机警的眼裂、鼻梁较长且鼻尖稍向下的比例关系明确。嘴唇偏薄、嘴角轻微诙谐而克制，法令部自然瘦削纹理保留，不能套用杨逍清俊文士脸或另一个壮汉脸。重建为真实中年人，肤色略苍白仍具自然血色和连续体积，不取像素中偏黄绿光影当皮肤染色。目光清醒警觉但不贼眉鼠眼、不邪笑；自然转正时额鼻颏中线竖直、双眼水平，不继承像素头像倾斜低头的角度。

中年清瘦轻捷体格，筋腱清楚但不病态骨架，寒毒仍需调治却不是正在发作、吸血或垂危。身体主要正面，双肩放松端平，一足稍前、两脚都落地，表现侦察归来刚收步；把旧稿轻微前倾改为收步后自然直立，敏捷靠腿部重心与衣摆少量同向风动表达。头颈端正，视线前方清楚，不飘浮、不蹲伏成兽。双手双足完整，没有羽翼、利爪或生物异化。

青灰色右衽窄袖袍、墨绿轻薄短外衫、黑色窄布带、束腿裤与软底布靴。汉式左襟盖右襟、向本人右侧合拢，衣领袖口及下摆都有完整剪裁，轻薄仍为连续实体，不透明、不碎布。黑发收束低髻、短布带有实际束点，少量带尾与下摆同向轻动，不能直接照搬头像高耸竖发或扩大为巨型披风。衣服绿色与皮肤分离，皮肤不是青绿色；没有蝙蝠徽记、尖牙或金属翼。

双手空手，没有手持和腰挂兵刃。本人右手即观者左侧在身旁略前，掌指自然松开；本人左手即观者右侧近腰侧自然放松，双手不攥拳发功、不融合入衣摆。正常人类五指与软底鞋脚掌承重清楚。仅衣袂小幅风动提示轻功，不加速度残影、空气轨迹、宠蝠、药瓶、拐杖或寒冰光球；不把绰号当作实物装备。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅背景水墨，不提供脸、头身、发型、衣装、手持物或倾头角度；本次移除通用男性基线图以避免串脸，项目低饱和、柔和左上光、连续写实设色继续保留。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要杨逍文士脸、厚胸壮汉脸、青年偶像、病态骷髅或极端骨瘦畸形；不要蓝绿皮肤、黄绿色脸、黑唇、尖牙、血口或正在吸血。不要把寒毒待调治写成完全无病，也不要发病倒地、冰霜皮肤或寒气光球。不要头前伸低垂、歪颈、单肩耸起、像素原图倾斜脸；不要高耸夸张竖发照搬。不要蝙蝠翅膀、宠蝠、巨型披风、羽毛、悬空飞行、速度残影、魔法轨迹或锋利兽爪。不要刀剑、暗器、法杖、药瓶或拐杖；双手空手、双足落地。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING WEI YIXIAO. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.

完整排除项：不要杨逍文士脸、厚胸壮汉脸、青年偶像、病态骷髅或极端骨瘦畸形；不要蓝绿皮肤、黄绿色脸、黑唇、尖牙、血口或正在吸血。不要把寒毒待调治写成完全无病，也不要发病倒地、冰霜皮肤或寒气光球。不要头前伸低垂、歪颈、单肩耸起、像素原图倾斜脸；不要高耸夸张竖发照搬。不要蝙蝠翅膀、宠蝠、巨型披风、羽毛、悬空飞行、速度残影、魔法轨迹或锋利兽爪。不要刀剑、暗器、法杖、药瓶或拐杖；双手空手、双足落地。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。 不要范遥同脸、平滑宽椭圆青年俊男脸；本人高颧凹颊长尖下颌、斜细眉眼、长鼻薄唇必须辨明。
```

## 排除项

不要杨逍文士脸、厚胸壮汉脸、青年偶像、病态骷髅或极端骨瘦畸形；不要蓝绿皮肤、黄绿色脸、黑唇、尖牙、血口或正在吸血。不要把寒毒待调治写成完全无病，也不要发病倒地、冰霜皮肤或寒气光球。不要头前伸低垂、歪颈、单肩耸起、像素原图倾斜脸；不要高耸夸张竖发照搬。不要蝙蝠翅膀、宠蝠、巨型披风、羽毛、悬空飞行、速度残影、魔法轨迹或锋利兽爪。不要刀剑、暗器、法杖、药瓶或拐杖；双手空手、双足落地。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。 不要范遥同脸、平滑宽椭圆青年俊男脸；本人高颧凹颊长尖下颌、斜细眉眼、长鼻薄唇必须辨明。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_weiyixiao__ch04_prime_base.prepared.json`。
