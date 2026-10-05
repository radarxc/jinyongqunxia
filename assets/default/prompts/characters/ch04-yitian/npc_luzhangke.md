---
asset_id: por_npc_luzhangke__ch04_elder_base
subject_id: npc_luzhangke
name: 鹿杖客
book: ch04_yitian
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch04/por_npc_luzhangke__ch04_elder_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一参考仅同性别项目低饱和色卡、柔和左上光与连续写实设色品质；本会话已实际view并核对SHA。没有本人身份原图，不能借此图人物面孔、年龄、发式、体型、衣装、兵器或倾头角度；新面貌按本稿逐人原创。当前基线状态为candidate，不变更其审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考仅背景：暖浅灰纸底、极淡水墨远山薄雾和留白；已实际view并复核SHA。不取王语嫣脸、性别、年龄、头发、体态、衣装或倾头。背景墨痕不得进入人物和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 鹿杖客 · 人物写实修正

## 人物与阶段

- subject_id：npc_luzhangke
- book：ch04_yitian
- gender：male
- age_variant：elder

## 本轮人物写实规范

原创宽长厚颌、粗平眉宽鼻紧嘴，中老年敦厚，正面头直、褐黑完整袍。双手错握1鹿角杖置本人左外侧，无宠鹿寒冰，1 candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_luzhangke__ch04_elder_base/prompt-bc3eb4a1fce92203e8f2033cfb31d1358ca60b9b26a39b8384575de56fb547b3.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body character illustration of 鹿杖客 (npc_luzhangke). This is an ORIGINAL individual facial design based on the current character document: NO verified portrait of this person is available in the audited original-game corpus. The user expressly permits original supporting-character faces. Image 1 is ONLY the gender-appropriate project rendering/colour reference; image 2 is ONLY background. Neither image supplies a face or identity. Do not borrow another character or actor's face.

当前阶段：中老年玄冥二老之一，汝阳王府麾下、武当双体寒毒遭遇阶段
体态与正面姿势：中老年敦厚有力、宽肩结实前臂，正面稳定低重心，头颈竖直、肩线自然端平，覆盖旧侧肩前探。仍为王府供奉、武当遭遇阶段，未进入功力受损重伤结局。

本人的原创面容辨识：原创宽长矩形脸，宽下颌、较厚颊肉，粗眉近水平而眉尾沉下，眼裂中等、上眼皮略厚，鼻根宽而鼻梁平直、鼻头厚实，宽而紧收的嘴和灰白短须；鼻唇沟深但不是疤。中老年皮肤有厚重岁月感，目光冷静冷硬，不套鹤笔翁窄尖长面或殷天正鹰鼻白眉。

服装发式：元末王府江湖供奉的深褐右衽长袍、灰黑短外褂、窄皮带与皮靴，灰白发束髻，深色软巾包束，袖口收紧。汉式交领一律穿着者左襟压右襟、向本人右侧合拢，不镜像；完整连续衣料，旧色不等于破烂。

阶段器物硬要求：一根鹿角杖 eq_luzhang，硬直杖身上端为小型分叉鹿角形，双手错开稳握、斜立身侧；不画整只鹿头或宠鹿

具体左右与结构：仅1根鹿角杖，硬直连续杖身，顶端仅小型分叉鹿角形，不是鹿头。本人左手在胸腹前握上段、右手在腰腹前握较低段，两手错开支承同一杖，杖斜立在本人左外侧即观者右侧，杖顶和杖底完整入画、离鞋不穿腿；没有第二根杖或其他兵器。分叉数与材质纹理不冒称原著核定。

人物渲染：完整清楚、精细美观的写实国风人物，自然年龄与体态，面孔和实际手部皮肤有连续体积、柔和真实肤质。保留原稿伤残、旧疤和皱纹；完整渲染绝不等于抹掉这些事实。衣物是完整裁剪的连续不透明布料，领袖、下摆、鞋履和器物有干净确定边缘，少量自然受力褶皱，不用细碎噪点证明真实。柔和左上光，低饱和设色，人体与背景分离；墨痕、纸纹、飞白、雾气全部停留在背景，不能割裂或吞没人物。第一图只有同性别项目画法色卡，第二图只有水墨背景；没有本人脸部图像参考，严禁借基线人物脸、年龄、头身、姿势或衣装来换装。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

身份依据边界：当前经典游戏头像语料未可靠映射本人，不冒称已看本人图，不用MOD/其他人头像代替。面部的具体长宽、眉眼鼻唇关系和本次左右布局明确为原创艺术设计，身份、年龄、伤残、阶段、道具仍按正式角色稿。原著具体岁数、服饰与器物形制仍待指定版本终校，不补造页码、引文或史实制服。最新正面、写实整衣和淡墨背景要求覆盖旧轻侧/低头/固定占高/纯纸底门槛。

完整排除项：不要鹤笔翁瘦窄尖脸与双笔、不要寒毒蓝脸、身体侧倾或一肩耸起；不要鹿头兽人和鹿角头冠。；鹤嘴双笔、仙鹿坐骑、巨大鹿角头冠、真正鹿头、冰晶铠甲、蓝色皮肤、寒冰光环和后期重伤结局。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING 鹿杖客. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT, camera level, chin neutral. NO head tilt and NO Dutch angle. Keep the individually designed face, current-stage anatomy, complete clothing and required objects clearly visible.
```

## 排除项

不要鹤笔翁瘦窄尖脸与双笔、不要寒毒蓝脸、身体侧倾或一肩耸起；不要鹿头兽人和鹿角头冠。；鹤嘴双笔、仙鹿坐骑、巨大鹿角头冠、真正鹿头、冰晶铠甲、蓝色皮肤、寒冰光环和后期重伤结局。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_luzhangke__ch04_elder_base.prepared.json`。

## 原著依据

- 《倚天屠龙记》二十六 俊貌玉面甘毁伤：“一根短杖，杖头分叉，作鹿角之形，通体黝黑”；https://www.xuges.com/wuxia/jinyong/yttlj/191.htm
- AR-82 返修约束（本节优先于历史提示词）：只把近人高黄褐木色杖改为通体黝黑短杖，顶部分叉作鹿角形，短杖长度约本人前臂到手臂长，仍用原双手握持，杖的下端停在腰腿上部，去掉原伸到地面的长杆并补回背景。不要鹿头，不强定木或铁的材质。人脸、手指和衣服其余部分不动。
