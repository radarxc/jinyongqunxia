---
asset_id: por_npc_yintianzheng__ch04_elder_base
subject_id: npc_yintianzheng
name: 殷天正
book: ch04_yitian
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch04/por_npc_yintianzheng__ch04_elder_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_13-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》殷天正本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。原像近侧面须自然重建为正面，保留本人高长略弧鼻梁与刚毅白眉颧颌；本稿顶稀但有两侧白发，不画剃度或沿用像素金黄领口。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为candidate，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: ready
realism_revision: user_identity_pose_20261001
---

# 殷天正 · 人物写实修正

## 人物与阶段

- subject_id：npc_yintianzheng
- book：ch04_yitian
- gender：male
- age_variant：elder

## 本轮人物写实规范

13-1殷天正本人长而略弧鼻梁、坚实颧颌、锋利白眉眼与白须，转正保持老年宽厚强健，区别张三丰。正面头颈竖直双眼水平，NO head tilt / NO Dutch angle；顶稀两侧白发后拢、深灰完整袍收袖。右手正常五指鹰爪准备、左掌近腰，空手无金属爪鹰杖宠鹰。光明顶合作期非力竭，1张candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yintianzheng__ch04_elder_base/prompt-45c8d6f2f29cd3c52e3da07417d9451127f30ac11256db5a46df5a182b41ebdf.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of YIN TIANZHENG / 殷天正. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：老年白眉鹰王、天鹰教教主，光明顶与明教重归合作、仍强健的阶段；非屠狮大会耗竭。

本人面容辨识：第一参考13-1殷天正本人：高而轮廓清楚的额眉、长而突出且略有弧度的鼻梁，鼻尖稍下转但仍是正常人鼻，坚实颧颊和收束而有力量的下颌；浓长白眉压着狭长坚定的眼裂，白髭与下巴白须的生长位置保留。与张三丰圆润温厚的鼻颊区别，殷天正更锋利刚毅、带自然深面纹；不要把“鹰”画成鸟嘴或怪物鼻。将原像强侧面自然重建为正面并保留鼻眉颧颌的关系，头颈竖直、双眼水平，不照搬张三丰通用白须老人脸。额顶发稀、两侧与后部白发仍在，白眉白须明确；不是整头剃度的少林僧人。

老年魁伟体格、宽厚胸背和有力前臂，手指筋腱清楚，年龄纹理真实但并非弥留病容。取光明顶与明教重归合作的强健阶段，不画屠狮大会力竭或改命后长期伤态。正面宽肩自然打开，重心沉稳、两足落地，头颈自然端正；威严来自刚毅神态与站姿，不仰头暴怒、不侧脸俯视，也不摆出鸟类捕食姿态。

元末汉地深灰右衽长袍、灰白内领、灰褐窄布带、收束袖口与厚布靴。左襟覆盖右襟、向本人右侧合拢，厚衣领袖和下摆完整、布块连续有重量、褶皱克制。额顶稀发，两侧白发自然拢向后脑，白须保持真实发根与清楚毛发体块，不把原头像飘扬长发当作强风效果。无灰白道冠、佛教袈裟、僧帽、金黄领口照搬、官帽或华冠；不借鹰王之名添加羽毛披风和鹰头饰物。

双手空手，不持或腰挂武器。本人右掌即观者左侧在下胸前略向前，五根正常人类手指自然弯曲成松紧有度的鹰爪擒拿准备势，指尖不夸张伸长、手心与腕前臂连接可读；本人左掌即观者右侧贴近腰腹但不藏入袖中。双掌都不遮脸、手指不粘连、不画出金属爪套或真兽爪。左右分配是当前设计的美术选择。没有鹰头杖、宠鹰、羽翼、刀剑、佛珠或发光鹰形掌力。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要张三丰圆脸仙翁模板、少年黑眉黑须、僧人整头剃光、少林袈裟或道冠；不要丢失长白眉白须。不要屠狮大会耗竭、弥留病容、改命长期伤病、病床或拐杖。不要头像强侧脸或狂风白发直接照搬、仰下巴、头侧倾或怒吼。不要鸟嘴、鹰头兽人、羽毛披风、鹰头杖、宠鹰、金属爪手、超长尖指甲、动物爪或鹰形能量；正常手掌各五指。不要刀剑法器与兵器腰挂；双手必须空手。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING YIN TIANZHENG. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.
```

## 排除项

不要张三丰圆脸仙翁模板、少年黑眉黑须、僧人整头剃光、少林袈裟或道冠；不要丢失长白眉白须。不要屠狮大会耗竭、弥留病容、改命长期伤病、病床或拐杖。不要头像强侧脸或狂风白发直接照搬、仰下巴、头侧倾或怒吼。不要鸟嘴、鹰头兽人、羽毛披风、鹰头杖、宠鹰、金属爪手、超长尖指甲、动物爪或鹰形能量；正常手掌各五指。不要刀剑法器与兵器腰挂；双手必须空手。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yintianzheng__ch04_elder_base.prepared.json`。
