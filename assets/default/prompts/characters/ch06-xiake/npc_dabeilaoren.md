---
asset_id: por_npc_dabeilaoren__ch06_elder_alive_base
subject_id: npc_dabeilaoren
name: 大悲老人
book: ch06_xiake
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch06/por_npc_dabeilaoren__ch06_elder_alive_base.png
manifest: assets/default/character/male/ch06/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一图片参考仅对应性别项目色卡、柔和光线与连贯精细手绘品质，已实际view_image；不是本角色本人图，完全不借面孔、年龄、头倾角、身材、发式、衣装、道具或站姿。本人身份由prompt文字的独立年龄和骨相锚首次建立。基线原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二图片参考已实际view_image，只取极淡水墨远景、暖浅灰纸底和留白；不取女性脸、身体、头颈倾角、白青衣裙、透明纱感、飘带、饰物。背景墨色不得侵入本角色皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 大悲老人 · 人物写实修正

## 人物与阶段

- subject_id：npc_dabeilaoren
- book：ch06_xiake
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次独立原创面貌：大悲老人；高大老年男性elder；红润偏赤面色、长白发垂胸，有外功武人骨架与厚实手掌，老年感和高大体量并存。 正面端正、头颈竖直、双眼水平；人物完整写实，背景极淡水墨。默认一独立候选，原始PNG native 2:3；均candidate待用户审核。参考只取画风/色卡与背景，不继承人物脸。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_dabeilaoren__ch06_elder_alive_base/prompt-4bc9ed2c3db38127fb52dc010fe3b67bd6e13f3b1b059d071e23a2a2127f8ef8.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. There is no existing picture of this person among the inputs. The identity comes ONLY from the written age, face, body and character anchors below, not from any reference face. Image 1 is the corresponding gender’s PROJECT PALETTE AND PAINTING-QUALITY REFERENCE ONLY: muted colors, soft light and fine coherent hand-painted finish. It does not supply identity, age, face shape, eyes, nose, lips, hairstyle, body type, clothing, props or pose. Image 2 is ONLY the user-requested pale ink-wash background, open space and warm paper atmosphere. Ignore its woman, face, body, costume, ribbons, head tilt and ornaments. Do not blend, average or transplant either input face into this character.

CHARACTER AND STAGE: 大悲老人 / npc_dabeilaoren, por_npc_dabeilaoren__ch06_elder_alive_base.
《侠客行》ch06，老年江湖高手、十八泥人持有者。取第3回遇袭之前仍健在、泥人尚未交给少年的条件阶段；不画临终伤勢，亦不声称已救活或已改命。 项目约1582–1583年为明万历方向的原创定年，不是原著明示年月。

AGE AND ORIGINAL FACE IDENTITY:
高大老年男性elder；红润偏赤面色、长白发垂胸，有外功武人骨架与厚实手掌，老年感和高大体量并存。 独立宽额而下部近宽椭圆的老年脸，颧骨圆钝、面颊有自然厚度，脸色暖红但不是通红醉态；稀松灰白眉下的眼睛略深，眼形比白自在更圆缓，平视时疲惫而坦荡。鼻梁较低宽、鼻尖饱满圆钝，鼻翼宽度自然；宽嘴微闭，下唇略厚、下巴宽圆。短白须只覆下巴周围，长白发从双肩侧自然垂至胸前，不能把长发误画成一条垂胸胡须。真实额纹、眼角纹与老年皮肤连续；不是白自在方颌长须威权脸，也不是少林僧人。

CLOTHING AND HAIR:
灰褐交领右衽粗布长衣，穿着者左襟压右襟，黑褐窄束带、深灰长裤与朴素布鞋；长白发上部由一根素布带半束，余发自然有重力垂在双肩侧。长衣完好、不透明、洁净实用，宽缓褶皱与整齐缝边，不破碎风化。非僧袍、非道袍，无剃度、戒疤、法冠或袈裟。

POSE, EQUIPMENT AND STRUCTURE:
正面稳定站立，老年上背可自然微收，但颈部端正、头部竖直、双眼水平看前方。两手在腰腹前托住一只约双掌宽、可以收入宽大衣袋的小木盒；一手托底另一手稳侧面，手指和盒边分清，盒盖略开不遮脸。盒内设定全套十八泥人以棉絮衬垫，只从盖下显露少数白垩泥偶的微小头肩、细红线与黑点，余者在盒内不逐个排列。泥壳完整，不展示内部木罗汉；微型物件不是额外真人。没有玄铁令、烧饼、判官笔或武器，没有受伤倒地、血迹与佛光。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. Default production is one independent candidate inspected by the operator; every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。仅用两张非身份参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要吴道通身份、玄铁令、烧饼、判官笔；不要和尚剃度、袈裟或道士法器；不要提前剥泥壳展示木罗汉、发光经络或可读秘籍文字；不要十八个真人分身、巨型佛像、裸体细节、重伤穿肩、濒死倒地和血迹。

FINAL POSE CHECK: 大悲老人 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; do not borrow either reference face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要吴道通身份、玄铁令、烧饼、判官笔；不要和尚剃度、袈裟或道士法器；不要提前剥泥壳展示木罗汉、发光经络或可读秘籍文字；不要十八个真人分身、巨型佛像、裸体细节、重伤穿肩、濒死倒地和血迹。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_dabeilaoren__ch06_elder_alive_base.prepared.json`。
