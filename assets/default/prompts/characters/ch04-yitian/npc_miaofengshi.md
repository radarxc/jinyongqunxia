---
asset_id: por_npc_miaofengshi__ch04_prime_base
subject_id: npc_miaofengshi
name: 妙风使
book: ch04_yitian
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch04/por_npc_miaofengshi__ch04_prime_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一参考仅同性别项目低饱和色卡、柔和左上光与连续写实设色品质；本会话已实际view并核对SHA。没有本人身份原图，不能借此图人物面孔、年龄、发式、体型、衣装、兵器或倾头角度；新面貌按本稿逐人原创。当前基线状态为candidate，不变更其审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考仅背景：暖浅灰纸底、极淡水墨远山薄雾和留白；已实际view并复核SHA。不取王语嫣脸、性别、年龄、头发、体态、衣装或倾头。背景墨痕不得进入人物和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 妙风使 · 人物写实修正

## 人物与阶段

- subject_id：npc_miaofengshi
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

原创窄长高颧、深眉褐眼自然鹰钩鼻、黄褐须，精干壮年男。正面头端正，米白土黄细缘袍，右肩下左腰旁各1圣火令无字背面，1 candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_miaofengshi__ch04_prime_base/prompt-74b86413e91c034fb78a30d01217b862eaf80800361f6171fb4cc1a98fc69911.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body character illustration of 妙风使 (npc_miaofengshi). This is an ORIGINAL individual facial design based on the current character document: NO verified portrait of this person is available in the audited original-game corpus. The user expressly permits original supporting-character faces. Image 1 is ONLY the gender-appropriate project rendering/colour reference; image 2 is ONLY background. Neither image supplies a face or identity. Do not borrow another character or actor's face.

当前阶段：壮年波斯明教总教使者，灵蛇岛三使联手阶段
体态与正面姿势：壮年精干、肩背较收、体型比流云使轻窄，成年体格而非少年。正面站稳、头颈竖直、双眼水平，取消旧错肩转胯；诡变武学感通过两臂不同收放表达，不折断关节或翻腾。

本人的原创面容辨识：原创狭长的波斯壮年面孔，颧弓窄而较高、下颌精干；细长深眉略直带锋，眼窝稍深，暖褐色虹膜清楚，长鼻梁有自然鹰钩弧度而鼻尖不过分下垂，薄而清楚的唇线。黄褐色须髭为成年面部毛发，有自然纤维层次不发金光；不复制流云使碧眼卷深髯和宽厚脸，也不变白须老者。暖褐瞳与具体骨相为原创区分，不宣称原著指定。

服装发式：元末来华波斯使者的米白窄袖长袍、土黄细缘、素布腰带、长裤与皮靴，浅沙色小头巾收拢头发，胸前小型暗红火焰纹，无字。汉式交领一律穿着者左襟压右襟、向本人右侧合拢，不镜像；完整连续衣料，旧色不等于破烂。

阶段器物硬要求：两手各持一枚圣火令 eq_shenghuoling，长短稍异的钝厚金属短令牌，刻文面朝掌或身体，仅露背面和边；一枚近肩一枚在腰旁，皆无火焰

具体左右与结构：本人右手在肩下外侧持1枚稍短的钝厚金属圣火令、左手在腰旁持另1枚稍长令；各自牢握，令牌与脸、袖、身体分开。只见无字背面和窄边，刻文面朝掌或身体；共2枚，不燃烧不发光。两足落地，不以身体扭曲表现联手，不加入另两使。

人物渲染：完整清楚、精细美观的写实国风人物，自然年龄与体态，面孔和实际手部皮肤有连续体积、柔和真实肤质。保留原稿伤残、旧疤和皱纹；完整渲染绝不等于抹掉这些事实。衣物是完整裁剪的连续不透明布料，领袖、下摆、鞋履和器物有干净确定边缘，少量自然受力褶皱，不用细碎噪点证明真实。柔和左上光，低饱和设色，人体与背景分离；墨痕、纸纹、飞白、雾气全部停留在背景，不能割裂或吞没人物。第一图只有同性别项目画法色卡，第二图只有水墨背景；没有本人脸部图像参考，严禁借基线人物脸、年龄、头身、姿势或衣装来换装。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

身份依据边界：当前经典游戏头像语料未可靠映射本人，不冒称已看本人图，不用MOD/其他人头像代替。面部的具体长宽、眉眼鼻唇关系和本次左右布局明确为原创艺术设计，身份、年龄、伤残、阶段、道具仍按正式角色稿。原著具体岁数、服饰与器物形制仍待指定版本终校，不补造页码、引文或史实制服。最新正面、写实整衣和淡墨背景要求覆盖旧轻侧/低头/固定占高/纯纸底门槛。

完整排除项：不要碧眼虬髯和流云使高大宽胸、白须高龄脸或巨大鸟喙鼻；不要斜肩歪头、反关节和舞蹈翻腾，令牌不化成刀剑。；流云使式碧眼虬髯高大体格、白须老者、巨大鸟喙鼻、鹰头面具、折断关节、悬空翻筋斗、真实火焰与刻文。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING 妙风使. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT, camera level, chin neutral. NO head tilt and NO Dutch angle. Keep the individually designed face, current-stage anatomy, complete clothing and required objects clearly visible.
```

## 排除项

不要碧眼虬髯和流云使高大宽胸、白须高龄脸或巨大鸟喙鼻；不要斜肩歪头、反关节和舞蹈翻腾，令牌不化成刀剑。；流云使式碧眼虬髯高大体格、白须老者、巨大鸟喙鼻、鹰头面具、折断关节、悬空翻筋斗、真实火焰与刻文。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_miaofengshi__ch04_prime_base.prepared.json`。

## 原著依据

- 《倚天屠龙记》二十九 四女同舟何所望：“每只手中各拿着一条两尺来长的黑牌”；https://www.xuges.com/wuxia/jinyong/yttlj/216.htm
- AR-82 返修约束（本节优先于历史提示词）：只将两手中短小金色饰牌改成两尺来长的黑色圣火令，每只手一条，长度各约60厘米，长条厚实而非黄金挂牌，非金非玉的黑色材质，浅刻波斯纹且微弱折光。保持原手抓握位置与手指，黑牌长度向手上下延伸、需完整可见，不改变人物脸、衣服或火焰标记。
