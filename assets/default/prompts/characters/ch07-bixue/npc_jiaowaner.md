---
asset_id: por_npc_jiaowaner__ch07_base
subject_id: npc_jiaowaner
name: 焦宛儿
book: ch07_bixue
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch07/por_npc_jiaowaner__ch07_base.png
manifest: assets/default/character/female/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第一图片参考仅对应性别项目色卡、柔和光线与连贯精细手绘品质，已实际view_image；不是本角色本人图，完全不借面孔、年龄、头倾角、身材、发式、衣装、道具或站姿。本人身份由prompt文字的独立年龄和骨相锚首次建立。基线原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二图片参考已实际view_image，只取极淡水墨远景、暖浅灰纸底和留白；不取女性脸、身体、头颈倾角、白青衣裙、透明纱感、飘带、饰物。背景墨色不得侵入本角色皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 焦宛儿 · 人物写实修正

## 人物与阶段

- subject_id：npc_jiaowaner
- book：ch07_bixue
- gender：female
- age_variant：youth

## 本轮人物写实规范

首次独立原创面貌：焦宛儿；约18–25岁成年青年视觉范围为角色稿原创默认，未锁死原著确岁；youth不画成幼童或娇媚少女。。正面端正、头颈竖直、双眼水平，人物完整美观写实而背景淡水墨；保留本书阶段器物，默认单候选均candidate待审核。身份来源是角色文字，图片仅画风及背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_jiaowaner__ch07_base/prompt-3e30a312eb6ee69c41bebcb51eb4bd30888c73b58ad8e159a6bcf9fd1124668a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. There is no existing picture of this person among the inputs. The identity comes ONLY from the written age, face, body and character anchors below, not from any reference face. Image 1 is the corresponding gender’s PROJECT PALETTE AND PAINTING-QUALITY REFERENCE ONLY: muted colors, soft light and fine coherent hand-painted finish. It does not supply identity, age, face shape, eyes, nose, lips, hairstyle, body type, clothing, props or pose. Image 2 is ONLY the user-requested pale ink-wash background, open space and warm paper atmosphere. Ignore its woman, face, body, costume, ribbons, head tilt and ornaments. Do not blend, average or transplant either input face into this character.

CHARACTER AND STAGE: 焦宛儿 / npc_jiaowaner, por_npc_jiaowaner__ch07_base.
《碧血剑》ch07，焦公礼之女，父亲后来遇害之后奔走查案与帮会重建的阶段。不是第八至九回南京旧怨暂解、父亲仍健在的早段。故事第十五回报丧及第十六回追凶为本地阶段线索，匕首证物逐字细节待考；本图选择无字封信与普通入鞘单刀，不绘制凶器。服装采用明末江南风格，不由正在确认的袁承志影视版本推导焦宛儿脸。

AGE AND ORIGINAL FACE IDENTITY:
约18–25岁成年青年视觉范围为角色稿原创默认，未锁死原著确岁；youth不画成幼童或娇媚少女。 焦宛儿首次原创本人面容：较长鹅蛋脸、平直而清楚的眉、正常大小深棕杏眼，清醒有分寸的凝视，颧颊自然有支撑，下颌温和但不软弱；鼻梁端直且鼻头自然圆润，清楚而克制的唇线，闭合嘴角有承担。成年青年面容有细腻连续皮肤、自然轻微不对称，不浓妆、不尖下巴网红化。身姿挺直匀称、肩背有行动力量，哀伤内敛而不惊惶或失去判断。必须区别于温青青男装圆脸，也不借王语嫣同脸；鼻唇细化为原创设计。

CLOTHING AND HAIR:
明末江南江湖女子完整行旅服：米灰交领右衽窄袖袄、深蓝马面裙、一件利落短比甲、窄布带和平底鞋。穿着者左襟压右襟；领口、胸颈、腰腹与四肢完全遮蔽，袄裙和比甲各自连续、有完整缝边，宽而少的裙褶有真实重力，不画成碎布片。黑发收成低髻，用素白细带固定，以克制少量白色表达丧中状态，不堆孝服纸条、披帛或首饰。衣装整洁可行走，不用破损表达哀伤。

POSE, EQUIPMENT AND STRUCTURE:
穿着者左腰仅一把普通中式单刃腰刀完整入朴素足长微弯鞘，柄、非日式小护手、鞘口及封尾连续，两条短挂带切实连腰带；全刀鞘端入画、不垂到脚下。左手轻按鞘口旁不拔刀，右手在身侧腰前握一封完全闭合、素色无字的封信，手指和信封分离清楚。刀与信是查案帮会女侠的美术识别物，不冒充已核验的具体凶器证物；无血、无匕首凶器、无可读字。正面稳立、头颈端正、双眼水平，目光坚定，不歪头垂泪。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. Default production is one independent candidate inspected by the operator; every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图身份、年龄、阶段、既定器物沿当前角色稿与本地名录/故事事件。具体脸型五官、衣色裁制、静态站姿及未明装具是原创美术；原稿待考保持，不伪造原著引句或本人图片来源。本次只使用两张非身份图片参考，创建新独立本人面容；基线原candidate/approved状态保持。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要温青青男装圆脸、王语嫣同脸、幼童或娇媚少女、夸张泪流、崩溃软倒、婚嫁大红衣、父亲尚健在的和解早段、焦公礼尸体、凶器匕首、带血刀、金蛇剑、金龙能量、清式旗装、可读信文或封信变展开书法。

FINAL POSE CHECK: 焦宛儿 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person’s own written age and face anchors; do not borrow either reference face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要温青青男装圆脸、王语嫣同脸、幼童或娇媚少女、夸张泪流、崩溃软倒、婚嫁大红衣、父亲尚健在的和解早段、焦公礼尸体、凶器匕首、带血刀、金蛇剑、金龙能量、清式旗装、可读信文或封信变展开书法。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_jiaowaner__ch07_base.prepared.json`。
