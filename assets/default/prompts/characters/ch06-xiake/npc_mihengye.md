---
asset_id: por_npc_mihengye__ch06_prime_changle_base
subject_id: npc_mihengye
name: 米横野
book: ch06_xiake
gender: male
age_variant: prime
tier: B
output: assets/default/character/male/ch06/por_npc_mihengye__ch06_prime_changle_base.png
manifest: assets/default/character/male/ch06/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一图片参考仅对应性别项目色卡、柔和光线与连贯精细手绘品质，已实际view_image；不是本角色本人图，完全不借面孔、年龄、头倾角、身材、发式、衣装、道具或站姿。本人身份由prompt文字的独立年龄和骨相锚首次建立。基线原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二图片参考已实际view_image，只取极淡水墨远景、暖浅灰纸底和留白；不取女性脸、身体、头颈倾角、白青衣裙、透明纱感、飘带、饰物。背景墨色不得侵入本角色皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 米横野 · 人物写实修正

## 人物与阶段

- subject_id：npc_mihengye
- book：ch06_xiake
- gender：male
- age_variant：prime

## 本轮人物写实规范

首次独立原创面貌：米横野；中年男性prime；瘦高而有筋骨，不是青年令狐冲，也不衰弱老人化。。正面端正、头颈竖直、双眼水平，人物完整美观写实而背景淡水墨；保留本书阶段器物，默认单候选均candidate待审核。身份来源是角色文字，图片仅画风及背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_mihengye__ch06_prime_changle_base/prompt-f28c09fec1bc53bbf6ce9bff6a72d023844fdcffdab4982a2de056529e84e1ec.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. There is no existing picture of this person among the inputs. The identity comes ONLY from the written age, face, body and character anchors below, not from any reference face. Image 1 is the corresponding gender’s PROJECT PALETTE AND PAINTING-QUALITY REFERENCE ONLY: muted colors, soft light and fine coherent hand-painted finish. It does not supply identity, age, face shape, eyes, nose, lips, hairstyle, body type, clothing, props or pose. Image 2 is ONLY the user-requested pale ink-wash background, open space and warm paper atmosphere. Ignore its woman, face, body, costume, ribbons, head tilt and ornaments. Do not blend, average or transplant either input face into this character.

CHARACTER AND STAGE: 米横野 / npc_mihengye, por_npc_mihengye__ch06_prime_changle_base.
《侠客行》ch06，长乐帮香主，摩天崖迎主失利后、回帮休养已能正常行走的帮务阶段。受创史不等于本张昏迷、重伤、永久残疾或新增断肢；这是一张康复可行走的基础形象。约1582–1583年是项目原创定年；瘦高使剑与伤势消退仍保留角色稿待考边界。

AGE AND ORIGINAL FACE IDENTITY:
中年男性prime；瘦高而有筋骨，不是青年令狐冲，也不衰弱老人化。 米横野独立原创的中年面容：窄长脸、清楚颧骨、细而较直的眉、眼尾略沉的正常大小深棕眼睛，较窄鼻梁和自然鼻翼，较薄闭唇，唇上仅一层薄短髭。面颊有中年自然体积与轻微纹理，不画干瘪尸脸、病重灰肤或深刻刀痕皱纹。身形瘦高、肩线比魁梧武人窄，四肢仍结实能行动；神态谨慎、警醒且略有不甘，靠眉眼和收敛嘴角表现，不靠歪头斜睨、奸笑或伤病。不是令狐冲换装、萧峰瘦身，也与展飞结实体型分开。鼻唇和短髭细节为原创。

CLOTHING AND HAIR:
明万历方向的深灰蓝窄袖交领长衣，严格右衽、穿着者左襟压右襟；墨褐窄束带、完整灰裤、朴素平底布鞋。黑发束紧为整洁发髻，以素布包裹固定，不照搬令狐冲网巾脸或披发，不戴道冠。衣服有完整肩线、闭合衣襟、连续长衣片和整齐袖口缝边，洗净耐用、宽缓褶皱，无破带、发光帮徽或绣字。

POSE, EQUIPMENT AND STRUCTURE:
腰侧只有一柄普通中式直剑，完整在朴素足长剑鞘内，短横剑格、柄、鞘口与封尾连接可读；短挂带确实连到穿着者左腰。左手轻扶鞘口旁，不挡挂点，右手自然下垂空着；不拔剑，双脚一前一后少量错开而稳稳着地，躯干主要向正面。目光改为端正前视，以眉眼警觉保持性格，不能沿旧稿略偏侧发展成歪头或侧脸。没有账本展示、临时鬼头刀、链子锤或双短戟。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. Default production is one independent candidate inspected by the operator; every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图身份、年龄、阶段、既定器物沿当前角色稿与本地名录/故事事件。具体脸型五官、衣色裁制、静态站姿及未明装具是原创美术；原稿待考保持，不伪造原著引句或本人图片来源。本次只使用两张非身份图片参考，创建新独立本人面容；基线原candidate/approved状态保持。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要令狐冲同脸、萧峰魁梧脸、展飞结实体型、胖大体格、长白须、衰弱老年脸、道冠道袍、鬼头刀、链子锤、云香主双短戟、多兵器、发光账本、绣字帮徽、穿孔重伤、断臂、昏迷、拐杖或掌门礼服。

FINAL POSE CHECK: 米横野 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person’s own written age and face anchors; do not borrow either reference face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要令狐冲同脸、萧峰魁梧脸、展飞结实体型、胖大体格、长白须、衰弱老年脸、道冠道袍、鬼头刀、链子锤、云香主双短戟、多兵器、发光账本、绣字帮徽、穿孔重伤、断臂、昏迷、拐杖或掌门礼服。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_mihengye__ch06_prime_changle_base.prepared.json`。
