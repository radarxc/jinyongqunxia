---
asset_id: por_npc_fangsheng__ch05_elder_base
subject_id: npc_fangsheng
name: 方生
book: ch05_xiaoao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch05/por_npc_fangsheng__ch05_elder_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一图片参考仅对应性别项目色卡、柔和光线与连贯精细手绘品质，已实际view_image；不是本角色本人图，完全不借面孔、年龄、头倾角、身材、发式、衣装、道具或站姿。本人身份由prompt文字的独立年龄和骨相锚首次建立。基线原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二图片参考已实际view_image，只取极淡水墨远景、暖浅灰纸底和留白；不取女性脸、身体、头颈倾角、白青衣裙、透明纱感、飘带、饰物。背景墨色不得侵入本角色皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 方生 · 人物写实修正

## 人物与阶段

- subject_id：npc_fangsheng
- book：ch05_xiaoao
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次独立原创面貌：方生；老年男性，具体岁数不定；可见真实老年面颊、眼纹与稀白眉，清健而不返老还童。。正面端正、头颈竖直、双眼水平，人物完整美观写实而背景淡水墨；保留本书阶段器物，默认单候选均candidate待审核。身份来源是角色文字，图片仅画风及背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_fangsheng__ch05_elder_base/prompt-37484496408711ed7549a0e90de25b1afa9008564ca0d57bd6ecdde5d80abb57.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. There is no existing picture of this person among the inputs. The identity comes ONLY from the written age, face, body and character anchors below, not from any reference face. Image 1 is the corresponding gender’s PROJECT PALETTE AND PAINTING-QUALITY REFERENCE ONLY: muted colors, soft light and fine coherent hand-painted finish. It does not supply identity, age, face shape, eyes, nose, lips, hairstyle, body type, clothing, props or pose. Image 2 is ONLY the user-requested pale ink-wash background, open space and warm paper atmosphere. Ignore its woman, face, body, costume, ribbons, head tilt and ornaments. Do not blend, average or transplant either input face into this character.

CHARACTER AND STAGE: 方生 / npc_fangsheng, por_npc_fangsheng__ch05_elder_base.
《笑傲江湖》ch05，少林高僧，救援令狐冲、少林往来与会盟的未伤常态。不是方证方丈，也不是代任方丈、受伤战斗或临终状态。本项目明中叶约1523–1525年仅游戏定年，原著有意淡化朝代；不伪称历史制服复原。

AGE AND ORIGINAL FACE IDENTITY:
老年男性，具体岁数不定；可见真实老年面颊、眼纹与稀白眉，清健而不返老还童。 方生是一位真正的老年男性僧人，独立原创较长的方脸，颧颊有清瘦但健康的体积，下颌较长而不宽阔魁梧；柔和眉骨、稀白眉、真实大小的深棕眼睛，眼角和下眼睑有自然细纹，鼻梁与鼻翼端正而略有年岁厚度，薄厚自然的闭合嘴唇与安稳嘴角。眼神宽厚清醒、慈和且有判断，不能画成令狐冲老年滤镜或方证方丈同脸。体格清健、肩背适中、整体修长，老年感来自脸颈手的自然形态和皮肤连续纹理，不靠满脸污斑、皱纹刻线、长白须或仙人寿眉。脸型鼻唇细化是原创美术选择。

CLOTHING AND HAIR:
剃净头发，露出自然头形，不留俗家长发、顶髻、网巾或清代辫发；朴素完整灰布僧袍、深褐短披衣、右衽内衫和深色平底僧鞋。内层交领为穿着者左襟压右襟，衣领闭合，肩胸躯干与双腿完全遮蔽。衣服洗净、耐用、缝边完整，灰褐大色块与宽缓重力衣褶清楚；不要方丈礼袈裟、金饰、华丽僧帽或道冠。

POSE, EQUIPMENT AND STRUCTURE:
本图没有兵器。左腕侧仅一串小而朴素的木念珠，珠粒串成一条真实相连的绳圈，不漂浮、不变成法器；这是美术补足，不冒称原著专属物件。右手在胸前轻举为止争劝解，掌指自然放松且五指结构清楚；左手自然下垂，手腕和念珠可读。双足稳稳落地，身体主要朝正面，接应来人的意向由温和目光与右手表达，不前倾压低头部。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. Default production is one independent candidate inspected by the operator; every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图身份、年龄、阶段、既定器物沿当前角色稿与本地名录/故事事件。具体脸型五官、衣色裁制、静态站姿及未明装具是原创美术；原稿待考保持，不伪造原著引句或本人图片来源。本次只使用两张非身份图片参考，创建新独立本人面容；基线原candidate/approved状态保持。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要方证同脸同体型、魁梧方丈轮廓、年轻剑客脸、童颜、方丈冠冕、金色礼袈裟、长发发髻、道冠、神仙长眉长须、刀剑、九环大杖、药王器物、佛光、多臂、胸前血伤或新增残疾。

FINAL POSE CHECK: 方生 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person’s own written age and face anchors; do not borrow either reference face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要方证同脸同体型、魁梧方丈轮廓、年轻剑客脸、童颜、方丈冠冕、金色礼袈裟、长发发髻、道冠、神仙长眉长须、刀剑、九环大杖、药王器物、佛光、多臂、胸前血伤或新增残疾。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_fangsheng__ch05_elder_base.prepared.json`。
