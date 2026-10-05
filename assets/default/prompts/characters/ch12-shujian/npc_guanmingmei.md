---
asset_id: por_npc_guanmingmei__ch12_elder_alive_base
subject_id: npc_guanmingmei
name: 关明梅
book: ch12_shujian
gender: female
age_variant: elder
tier: A
output: assets/default/character/female/ch12/por_npc_guanmingmei__ch12_elder_alive_base.png
manifest: assets/default/character/female/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 关明梅 · 人物写实修正

## 人物与阶段

- subject_id：npc_guanmingmei
- book：ch12_shujian
- gender：female
- age_variant：elder

## 本轮人物写实规范

首次独立原创面貌：关明梅；银白头发的老年女性elder；较矮而利落的真实成人骨架、自然年龄纹与习武者力量，不画成白发青年女子或丑化老巫婆。 正面端正、头颈竖直、双眼水平；人物完整写实，背景极淡水墨。先1张独立candidate，原始PNG native 2:3；均candidate待用户审核。唯一图片输入为无人纯背景；人物本人由具体原创文字脸锚建立，不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_guanmingmei__ch12_elder_alive_base/prompt-ebf075593d2b07d9c2355988e4eae9be807dff1fdc5f64473448d28566a406a3.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

CHARACTER AND STAGE: 关明梅 / npc_guanmingmei, por_npc_guanmingmei__ch12_elder_alive_base.
《书剑恩仇录》ch12，天山双鹰之一、绰号雪雕的关明梅。取玉峰前辈相会、京师第20回终局死亡之前；人物独立于陈正德求值，单人画像不改写死亡或夫妻关系。 本项目书界主线年代为1753–1759年、清乾隆；前史人物严格以其生前回忆阶段为准，不把回忆像当作现时活体。

AGE AND ORIGINAL FACE IDENTITY:
银白头发的老年女性elder；较矮而利落的真实成人骨架、自然年龄纹与习武者力量，不画成白发青年女子或丑化老巫婆。 独立较短的椭圆脸，上额适中、颧骨高而清楚，下脸略收但下巴圆而有支撑。灰白细眉走势平缓，眼睛正常大小、亮而锐，外眼角与额部细纹真实，眼袋和面颊老年松弛连续可读。鼻梁较短直、鼻尖清楚但不锋利，鼻翼自然；较窄的薄唇线坚韧，闭口从容，嘴角不下扯成刻薄夸张脸。头发银白低髻，面部真实老年体积不能被女性美丽模板抹掉；比陈正德脸短、身量低，也不借王语嫣少女脸。锋芒用眉眼和稳定仪态表现，不抬下颌或斜眼。

CLOTHING AND HAIR:
清代汉族老年女侠天山行旅衣装：灰紫右衽窄袖长袄，穿着者左襟压右襟，深灰完整下裙内配厚长裤与平底软靴。银白发全部稳稳收成低髻，素木簪和短深色布带固定，鬓发整齐不遮面。衣料厚实完全不透明、严整闭襟，肩胸腰腹遮蔽，整片布料、少量宽缓褶，无旗装大头冠、白纱、破衣或碎裂衣角。

POSE, EQUIPMENT AND STRUCTURE:
正面稳立、双足自然少量错开，肩背挺而放松，头颈竖直居中、眼线水平直视、下巴中性。穿着者左腰仅一柄普通中式长剑完整入足长剑鞘，两短带与腰带承重点清楚，剑柄小横格和鞘同轴，鞘尾高于地面且全部入画。左手轻握鞘口外侧，右手轻按布腰带空处，两手五指与衣料分清。不拔剑、不加鹰羽、鹰鸟、金铃索、白手套、拂尘、夫妻合照、丧服或终局伤口。

ORIGINAL CHARACTER COLOR AND LIGHT:
灰紫长袄、深灰下裙与银白低髻保持克制冷暖层次，柔和左上漫射光清楚表现较短椭圆脸、高颧、圆下巴和真实老年松弛。目光亮而锐、闭口从容，不因女性模板抹掉年龄。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. FAST1 production: first generate ONE candidate. Request another only for a serious identity, structural or readability failure. Every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。唯一输入为不含人物的派生纯背景参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要年轻无皱纹脸、白发美少女、浓妆滤镜、性感化、老巫婆丑化或邪恶黑眼；不要鹰羽、翅膀、真鹰、夫妻同框；不要血腥殉死、寡妇丧服或借小龙女物件。

FINAL POSE CHECK: 关明梅 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; No input supplies a face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要年轻无皱纹脸、白发美少女、浓妆滤镜、性感化、老巫婆丑化或邪恶黑眼；不要鹰羽、翅膀、真鹰、夫妻同框；不要血腥殉死、寡妇丧服或借小龙女物件。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_guanmingmei__ch12_elder_alive_base.prepared.json`。
