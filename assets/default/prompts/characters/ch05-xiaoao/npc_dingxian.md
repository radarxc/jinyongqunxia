---
asset_id: por_npc_dingxian__ch05_elder_base
subject_id: npc_dingxian
name: 定闲师太
book: ch05_xiaoao
gender: female
age_variant: elder
tier: A
output: assets/default/character/female/ch05/por_npc_dingxian__ch05_elder_base.png
manifest: assets/default/character/female/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_22-1.png
  use: 第一参考为定闲师太本人的原版游戏头像，已实际view_image，来源配对读取source-audit-expanded.json portraits条目与姓名表r6c1“定閒師太”。只取老年面容身份与成熟五官识别特征；明确她是女尼，保留年龄、不误画男性。转为连续美观写实皮肤，忽略像素绘法、原图闭眼低眉、头倾角、服装和裁切，改为自然睁眼、正面头颈竖直双眼水平。不把此参考当作approved输出。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考仅female项目色卡、柔和光线与连贯精细手绘品质，已实际view_image；不是定闲本人图，完全不借王语嫣的年轻面孔、年龄、头倾角、身材、发式、衣装、道具或站姿。本人脸以第一张原版定闲头像为准。基线原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三图片参考已实际view_image，只取极淡水墨远景、暖浅灰纸底和留白；不取女性脸、身体、头颈倾角、白青衣裙、透明纱感、飘带、饰物。背景墨色不得侵入本角色皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 定闲师太 · 人物写实修正

## 人物与阶段

- subject_id：npc_dingxian
- book：ch05_xiaoao
- gender：female
- age_variant：elder

## 本轮人物写实规范

定闲师太本人原版游戏头像为第一面容身份参考（HDGRP_22-1，既有来源审计姓名表r6c1定閒師太）；尊重真实老年五官、女性尼姑身份与宽厚体量，像素转换为完整写实人物。正面端正、头颈竖直、双眼水平并自然睁眼，淡水墨只背景；第二female baseline只画风色卡，第三用户图只背景。保留遇害前阶段及既定器物，默认单候选均candidate待审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_dingxian__ch05_elder_base/prompt-23424c3fd0b5d41d3722f8f33434c5112783af418a38460af147bc4bd2204116.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

IDENTITY REFERENCE ORDER: Image 1 is the verified original-game portrait of THIS PERSON, 定閒師太 / 定闲师太, HDGRP_22-1.png, matched by the existing source audit to labeled-sheet row 6 column 1. Use her own aged facial structure as the FIRST IDENTITY REFERENCE: preserve mature broad cheeks, the aged brow and narrow eye region, a clearly modeled nose, thin settled lips and visible natural age folds. Adapt the small pixel portrait into coherent realistic hand-painted anatomy; do not reproduce pixel blocks, its closed/downcast eyes, head angle, portrait crop or clothing literally. This person is an elderly FEMALE nun, not a man. Keep eyes naturally open and looking forward, head and neck upright, forehead–nose–chin vertical and both eyes level. Image 2 is ONLY the female project palette and soft connected painting finish; never borrow Wang Yuyan’s youthful face, age, build, clothing or pose. Image 3 is ONLY the pale ink-wash background, open space and warm paper atmosphere; ignore its woman and costume. Only image 1 supplies this character’s face identity. No generated project identity image yet exists for this subject.

CHARACTER AND STAGE: 定闲师太 / npc_dingxian, por_npc_dingxian__ch05_elder_base.
《笑傲江湖》ch05，北岳恒山掌门定闲，龙泉获救后、前赴少林遭害之前的清醒健在阶段；尚无少林致命伤，不画临终或默认获救改命。不是南岳衡山人物。项目约1523–1525年是原创定年，非原著明确年代。

AGE AND VERIFIED GAME-FACE IDENTITY:
中老年女性，素材键elder；不定精确岁数，保留真实眼角口侧年龄纹理和自然宽厚体量。 依据已实际查看的定闲本人原版头像 HDGRP_22-1.png 建立清楚写实的中老年女尼面容：保留宽厚的面颊与成熟下颌体量、低缓有定力的眉弓和较窄的眼部、清楚的鼻梁鼻翼、朴素薄唇，以及眼周、鼻唇沟和口侧自然老年纹理；面容不年轻化，不另造王语嫣或仪琳式少女脸。原图眼睑低垂，本次改为自然睁眼平视且双眼水平，不复制闭眼、低头、歪头或像素块；原图低分辨率未显示的皮肤和鼻唇细节只作连续写实补足。她是老年女性尼姑，无男性胡须；保留角色稿宽厚稳健的体态与慈和坚定气质。老人皮肤可见自然皱纹而完整连续，绝非裂纹脏污或青年脸加皱纹滤镜。

CLOTHING AND HAIR:
剃发，朴素贴头灰布僧帽完整露出脸、眉眼耳颊；深灰尼袍配茶褐短披衣，内衫交领严格右衽、穿着者左襟压右襟，领口与肩胸严整遮蔽。袍身是完整不透明布料，清洁耐穿、剪裁有秩序，少量宽缓连续衣褶、完整袖缘与下摆；下有完整下装和平底僧鞋。无珠玉花冠、长发、贵妇首饰或帝王衣饰。

POSE, EQUIPMENT AND STRUCTURE:
仅一柄本角色稿所定龙泉援救阶段宝剑，采用朴素中式直身双刃剑的完整长鞘携行形象，不出鞘、不加铭文、不新增装备ID；原著归属与精确装具仍保留待考，不能画成倚天剑。剑在穿着者左腰低挂，两条短系带连到腰带，柄、小型剑格、鞘口、足以容刃的鞘身和封闭鞘尾连续可辨；鞘尾离脚底并完整入画，不能被袍摆完全遮没。双手在腹前轻轻相合、无物，各手指关节自然清楚，不持剑不持拂尘。肩膀放松，双足稳，正面目光如安抚弟子，头颈直立。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. Default production is one independent candidate inspected by the operator; every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄、阶段、既定器物沿当前角色稿与本地名录/故事事件。本人面容以第一参考的原版游戏定閒師太头像为依据，来源配对采用已读本地 source-audit-expanded.json 的 portraits 条目（r6c1）；本轮实际查看原始 PNG，不伪称本轮独立浏览网络或查看原始姓名拼图。写实转换所需的细部、衣色裁制、静态站姿及未明装具属于美术补足；原稿待考保持，不伪造原著引句。第二与第三参考只提供画风、色调和背景，绝不提供本人脸。参考和输出的原candidate/approved状态保持。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要借用第二或第三参考人物的脸、年龄、体型、发型、服装、姿势或身份；第一参考只保留已核实定闲本人老年脸的识别特征，不复制像素块、闭眼、低头、倾角、半身裁切或原版衣装；不要把女尼误画成男性或添加胡须，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要少女脸、王语嫣或仪琳换装、削肩细腰、丰胸、艳妆、返老还童、长发、道冠、女皇袍、珠玉花冠、倚天剑、第二把剑、拔剑动作、夸张拂尘、临终流血、致命胸伤、已改命生还的伤疤、妖僧化或佛光。

FINAL POSE CHECK: 定闲师太 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this elderly female nun’s own identity from image 1 together with the written age and stage; do not borrow faces from images 2 or 3. Translate the original portrait into continuous realistic anatomy with eyes open and level.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要借用第二或第三参考人物的脸、年龄、体型、发型、服装、姿势或身份；第一参考只保留已核实定闲本人老年脸的识别特征，不复制像素块、闭眼、低头、倾角、半身裁切或原版衣装；不要把女尼误画成男性或添加胡须，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、清式剃额长辫、马蹄袖、旗装、大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 不要少女脸、王语嫣或仪琳换装、削肩细腰、丰胸、艳妆、返老还童、长发、道冠、女皇袍、珠玉花冠、倚天剑、第二把剑、拔剑动作、夸张拂尘、临终流血、致命胸伤、已改命生还的伤疤、妖僧化或佛光。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_dingxian__ch05_elder_base.prepared.json`。
