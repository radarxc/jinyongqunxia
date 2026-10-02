---
asset_id: por_npc_xiexun__ch04_elder_blind_base
subject_id: npc_xiexun
name: 谢逊
book: ch04_yitian
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch04/por_npc_xiexun__ch04_elder_blind_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_14-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》谢逊本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。保留本人金发金须及宽厚骨相；原像侧脸不继承，当前双目失明必须明确，正面双眼水平不等于凝视或恢复视力。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为candidate，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: ready
realism_revision: user_identity_pose_20261001
---

# 谢逊 · 人物写实修正

## 人物与阶段

- subject_id：npc_xiexun
- book：ch04_yitian
- gender：male
- age_variant：elder

## 本轮人物写实规范

14-1本人金发金须与宽厚骨相，灵蛇岛中老年、已双盲未出家、刀未断。正面头颈垂直双眼水平但眼神无聚焦，NO head tilt / NO Dutch angle，不能恢复视力。灰褐厚袍完整，两手共握1柄乌沉单刃屠龙重刀长柄，斜向本人左外侧下方，刀尖离足离地。先1张candidate；写实人物完整，淡墨背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_xiexun__ch04_elder_blind_base/prompt-124e5b1b4fa86b524a9e07514b0651587724e7d89c4dbc072e577c5fc89303ca.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and face oriented straight ahead. Both eyes are blind and naturally UNFOCUSED; never impose eye contact or visual fixation. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of XIE XUN / 谢逊. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：灵蛇岛上、刀剑互斫与屠狮大会之前的中老年金毛狮王；双目已失明，尚未出家，屠龙刀完整。

本人面容辨识：第一参考14-1谢逊本人头像：宽厚而转折强的额眉与颧颊，鼻梁厚直、鼻头宽实，面部纵向长度和强壮下颌的关系保留；金黄色浓眉、长发与厚密金须包围脸部，髭须从上唇周围自然生长，不能变为狮鬃兽脸。头像狭窄眼部与紧闭似的眼睑只作为五官比例参考，新图必须清楚表达双目已经失明：眼睑自然、双眼无聚焦，不与观者对视、不精准锁定目标。双眼在水平线上，脸朝正前但没有聚焦视线；可用自然失焦和沉静眼睑表现，绝不画血洞、白色激光或发亮空眼眶。中老年面部有真实岁月纹理，威严沉郁而不是鬼怪凶脸。

体格魁伟、胸背厚重、前臂粗壮，金毛狮王的力量和年龄同时成立，不用第二图清瘦青年体型。双脚适度分立、重心稳定，肩背端正，头颈竖直、脸朝正面；听声时的专注由表情和身体静止表达，不沿用旧稿侧头，也不歪颈。双目已失明但四肢完整，双手共同承担刀重，不额外增加肢体残疾。未出家、不画王盘山尚未失明阶段或屠狮会后的僧装。

灰褐色厚布长袍、深色窄皮带、布裤与耐磨完整靴。汉式交领左襟覆盖右襟，向本人右侧合拢；衣料厚实连续、袖口下摆有明确裁剪，不做海难碎布、补丁瀑布或白色缺块。自然金黄长发披至肩背，用窄布绳略收，眉眼与双手不被毛发遮没，浓密金黄长须保持整束毛发的重量与清楚边缘。金黄为真实毛发低饱和色，不是发光金属；不戴王冠、狮头皮、兽耳或毛皮战甲。

仅一柄完整屠龙刀：乌沉厚背的中式单刃双手重刀，长柄留足两手握持空间，简洁护手，刀面无字无亮纹。两只手共同握住同一长柄，掌指环握处彼此分开可辨，手腕前臂承重可信；长柄置于腹前偏本人左侧，即观者右侧，整刀向本人左外侧斜下伸展，刀尖向下且离双脚与地面，不能把刀尖插地代替承重。刀身与长柄连续，厚背单刃语义明确，刀不折不弯成奇幻巨镰，整刀从柄尾到刀尖全部入画。无额外刀鞘、第二把刀、倚天剑或可见刀中书卷。布局为原创静态持法，不擅写未考定刀重。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。按用户最新提速指示先生成1张候选，宽松自查后仍为candidate，等待用户审核；画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要黑发黑须或白发白须普通老者，不要金发青年偶像、狮头兽人、兽耳或西方蛮族王冠。不要把正面姿态画成恢复视力：不得锐利对视、精准锁敌或正常聚焦；不要独眼、单眼眼罩、双眼蒙布、血洞眼眶、发光白眼或恐怖眼部。不要剃度光头、僧袍、王盘山未盲阶段、断屠龙刀、倚天剑、第二把刀或剑鞘。不要单手轻甩重刀、两手粘连、短柄容不下双手、刀尖触脚或插地、刀身穿腿、刀面文字、亮蓝魔法刃或过分夸张的游戏巨刃。不要头侧倾听、歪颈、仰头怒吼。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING XIE XUN. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear. Both eyes remain BLIND and UNFOCUSED; frontal orientation must never become eye contact or restored sight.
```

## 排除项

不要黑发黑须或白发白须普通老者，不要金发青年偶像、狮头兽人、兽耳或西方蛮族王冠。不要把正面姿态画成恢复视力：不得锐利对视、精准锁敌或正常聚焦；不要独眼、单眼眼罩、双眼蒙布、血洞眼眶、发光白眼或恐怖眼部。不要剃度光头、僧袍、王盘山未盲阶段、断屠龙刀、倚天剑、第二把刀或剑鞘。不要单手轻甩重刀、两手粘连、短柄容不下双手、刀尖触脚或插地、刀身穿腿、刀面文字、亮蓝魔法刃或过分夸张的游戏巨刃。不要头侧倾听、歪颈、仰头怒吼。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_xiexun__ch04_elder_blind_base.prepared.json`。
