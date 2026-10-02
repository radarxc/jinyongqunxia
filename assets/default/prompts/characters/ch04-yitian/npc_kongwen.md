---
asset_id: por_npc_kongwen__ch04_elder_base
subject_id: npc_kongwen
name: 空闻
book: ch04_yitian
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch04/por_npc_kongwen__ch04_elder_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一参考仅同性别项目低饱和色卡、柔和左上光与连续写实设色品质；本会话已实际view并核对SHA。没有本人身份原图，不能借此图人物面孔、年龄、发式、体型、衣装、兵器或倾头角度；新面貌按本稿逐人原创。当前基线状态为candidate，不变更其审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考仅背景：暖浅灰纸底、极淡水墨远山薄雾和留白；已实际view并复核SHA。不取王语嫣脸、性别、年龄、头发、体态、衣装或倾头。背景墨痕不得进入人物和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 空闻 · 人物写实修正

## 人物与阶段

- subject_id：npc_kongwen
- book：ch04_yitian
- gender：male
- age_variant：elder

## 本轮人物写实规范

原创长圆饱满老僧脸、垂白眉圆长眼宽圆鼻、短白须，中等略厚方丈体态。正面头直，灰黄暗赭完整袈裟，左手1小木珠串右手收身前，无黑索，1 candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_kongwen__ch04_elder_base/prompt-c535b63269d579aeddfb49c93f0fd82a6392f3491c75231b23f8b7f3b36269a2.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body character illustration of 空闻 (npc_kongwen). This is an ORIGINAL individual facial design based on the current character document: NO verified portrait of this person is available in the audited original-game corpus. The user expressly permits original supporting-character faces. Image 1 is ONLY the gender-appropriate project rendering/colour reference; image 2 is ONLY background. Neither image supplies a face or identity. Do not borrow another character or actor's face.

当前阶段：老年少林方丈，万安寺获救后、主持屠狮大会事务时期
体态与正面姿势：老年方丈，中等略厚体态，肩背舒展、双足稳定；万安寺获救后主持大会的整衣立像，无囚伤和火塔。正面头颈竖直，用安静目光表达倾听，覆盖旧略低头指令。

本人的原创面容辨识：原创长圆脸，额颊饱满、宽度适中而下巴圆厚；白眉柔和低垂但不遮眼，眼形圆长适中、上下睑有柔软年龄褶，鼻梁不尖高、鼻头宽圆，嘴唇自然较宽、轻合，白色短须整齐。眼角与额纹细密连贯，面色温暖自然、神情庄重平和；不拿三渡的极瘦脸或张三丰长须鼻型复用。

服装发式：元末少林方丈的灰黄僧袍与暗赭色朴素袈裟，内层汉式交领右衽，僧鞋、布带，无镶宝法冠，袈裟格田纹以低对比布料接缝表现。汉式交领一律穿着者左襟压右襟、向本人右侧合拢，不镜像；完整连续衣料，旧色不等于破烂。

阶段器物硬要求：一串小木念珠松握在一手，另一手自然收于身前；念珠为本次通用僧用配件设计，不新增专属法器

具体左右与结构：只有1串普通小木念珠，由本人左手在腹前松握，珠串有连续串线、自然下垂小弧，不发光；本人右手自然收于身前略低，五指可读。念珠是通用原创僧用配件，不能变专属法宝或大串骷髅珠，不加禅杖、黑索或兵器。

人物渲染：完整清楚、精细美观的写实国风人物，自然年龄与体态，面孔和实际手部皮肤有连续体积、柔和真实肤质。保留原稿伤残、旧疤和皱纹；完整渲染绝不等于抹掉这些事实。衣物是完整裁剪的连续不透明布料，领袖、下摆、鞋履和器物有干净确定边缘，少量自然受力褶皱，不用细碎噪点证明真实。柔和左上光，低饱和设色，人体与背景分离；墨痕、纸纹、飞白、雾气全部停留在背景，不能割裂或吞没人物。第一图只有同性别项目画法色卡，第二图只有水墨背景；没有本人脸部图像参考，严禁借基线人物脸、年龄、头身、姿势或衣装来换装。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

身份依据边界：当前经典游戏头像语料未可靠映射本人，不冒称已看本人图，不用MOD/其他人头像代替。面部的具体长宽、眉眼鼻唇关系和本次左右布局明确为原创艺术设计，身份、年龄、伤残、阶段、道具仍按正式角色稿。原著具体岁数、服饰与器物形制仍待指定版本终校，不补造页码、引文或史实制服。最新正面、写实整衣和淡墨背景要求覆盖旧轻侧/低头/固定占高/纯纸底门槛。

完整排除项：不要低头藏眼、歪头倾听，不能复制三渡极瘦独眼脸；不要白须长至腰、神像表情或年轻基线脸加皱纹。；年轻僧人、三渡黑索、独眼、金刚怒目法相、金冠宝石袈裟、佛光、火塔背景和血腥囚伤。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING 空闻. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT, camera level, chin neutral. NO head tilt and NO Dutch angle. Keep the individually designed face, current-stage anatomy, complete clothing and required objects clearly visible.
```

## 排除项

不要低头藏眼、歪头倾听，不能复制三渡极瘦独眼脸；不要白须长至腰、神像表情或年轻基线脸加皱纹。；年轻僧人、三渡黑索、独眼、金刚怒目法相、金冠宝石袈裟、佛光、火塔背景和血腥囚伤。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_kongwen__ch04_elder_base.prepared.json`。
