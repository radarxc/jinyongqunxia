---
asset_id: por_npc_chengkun__ch04_elder_yuanzhen_base
subject_id: npc_chengkun
name: 成昆
book: ch04_yitian
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch04/por_npc_chengkun__ch04_elder_yuanzhen_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_19-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》成昆本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。保持本人方整颧颌与灰色短髭的关系，不硬套旧泛化瘦长脸；本图圆真阶段剃度、双目完好、空手，原像领口与角度不继承。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为candidate，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: ready
realism_revision: user_identity_pose_20261001
---

# 成昆 · 人物写实修正

## 人物与阶段

- subject_id：npc_chengkun
- book：ch04_yitian
- gender：male
- age_variant：elder

## 本轮人物写实规范

19-1成昆本人高额、方整颧颌、紧凑眉眼鼻根、灰短髭身份；中老年圆真潜伏光明顶阶段，双目完好。正面头颈垂直、双眼水平，NO head tilt / NO Dutch angle；旧灰与灰褐完整僧衣、剃度，双手空手，右手两指自然收拢、左手垂下。无眼伤雷电火药法器，1张candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_chengkun__ch04_elder_yuanzhen_base/prompt-169f21c538e7bf0de70961a853e0c0fb1241531aacdc7339d3bf9a8aebbb6927.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of CHENG KUN / 成昆. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：中老年混元霹雳手，以少林圆真身份潜伏的光明顶密道阴谋阶段；终局前双目完好。

本人面容辨识：唯一身份为第一参考19-1成昆本人头像：光洁剃度头部下面是较高宽的额面，面形纵长但颧颊与下颌有方整厚度，不套用一律尖瘦老者脸。额上横纹、弯曲而有分量的灰眉、两眼较深且眉眼距离紧凑，保留其眉骨与鼻根关系；鼻梁厚直、鼻翼有宽度，闭合唇线与灰色短髭形成辨识，短须不扩成仙翁长白须。将原像略侧的结构自然转为正面，脸部中线垂直、双眼水平。中老年年龄痕迹自然连贯，眼神沉着审慎、表情收敛，不以怪物五官或尖牙表达谋划。本阶段双目完好，两个眼睛均自然可见、有正常聚焦，不能因谢逊终局把他提前画盲。

圆真只是化名，画一个成昆本人；中老年瘦劲、肩背略收但身体有真实力量，绝非百岁枯骨。正面站稳、头颈自然垂直，肩膀不歪斜，双足承重；静听的戒备通过眼神与手部的克制表达，不用旧稿轻侧身或偏头。不增加最终眼伤、断肢或包扎，不画另一个圆真与他同框。

元末少林僧人朴素旧灰内袍、灰褐外搭、窄布带与僧鞋，剃度头部无头发发髻。内层汉式交领右衽：左襟盖右襟，向穿着者右侧合拢。布料虽旧色仍完整整洁、领口闭合、袖口下摆连续，有清楚剪裁与少量宽缓褶。眉髭短须有灰色，但不复制原像灰蓝领口，不套青年男性基线网巾与长剑。无方丈级金色华丽袈裟、法冠或官袍。

双手空手、身上不佩挂兵器。本人右手在观者左侧从袖口自然伸出、位于腰腹前，食指与中指轻轻靠拢，其余三指自然微屈但每根手指仍清楚，表达克制指掌准备而非断指或施法；左手在观者右侧放松垂下。两只手完整可辨，不藏在袖筒，不握任何物件。没有雷电、火药、霹雳弹、幻阴光球、紫焰、佛珠、禅杖或兵刃；绰号不画成实体特效。手的左右分配是美术布局，非原著定论。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要终局失明、单眼伤、眼罩、白色空眼或眼眶血洞；本阶段双目正常。不要百岁病弱、年轻长发俗家脸、灰眉长须仙翁、尖牙魔头、暴怒邪笑或用畸形暗示善恶。不要方丈法冠、华丽袈裟、网巾、官帽或清辫。不要任何武器、佛珠禅杖、火药弹、雷电、紫毒焰或幻阴光球。不要将收拢两指误画为缺指、两指融合或畸形手；不要双重圆真/成昆人像。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING CHENG KUN. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.
```

## 排除项

不要终局失明、单眼伤、眼罩、白色空眼或眼眶血洞；本阶段双目正常。不要百岁病弱、年轻长发俗家脸、灰眉长须仙翁、尖牙魔头、暴怒邪笑或用畸形暗示善恶。不要方丈法冠、华丽袈裟、网巾、官帽或清辫。不要任何武器、佛珠禅杖、火药弹、雷电、紫毒焰或幻阴光球。不要将收拢两指误画为缺指、两指融合或畸形手；不要双重圆真/成昆人像。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_chengkun__ch04_elder_yuanzhen_base.prepared.json`。
