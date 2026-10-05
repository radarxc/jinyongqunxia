---
asset_id: por_npc_lufeiqing__ch12_elder_base
subject_id: npc_lufeiqing
name: 陆菲青
book: ch12_shujian
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch12/por_npc_lufeiqing__ch12_elder_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 陆菲青 · 人物写实修正

## 人物与阶段

- subject_id：npc_lufeiqing
- book：ch12_shujian
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次独立原创面貌：陆菲青；中老年男性elder；清瘦但稳定有力的身体，灰白短须、自然老年眼周纹，精确年龄未核，不画仙人或虚弱病者。 正面端正、头颈竖直、双眼水平；人物完整写实，背景极淡水墨。先1张独立candidate，原始PNG native 2:3；均candidate待用户审核。唯一图片输入为无人纯背景；人物本人由具体原创文字脸锚建立，不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_lufeiqing__ch12_elder_base/prompt-94a1f4638d5d8a3ac3d3457e342805042cc3b1f252b22094f57a9f3d277e0f62.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

CHARACTER AND STAGE: 陆菲青 / npc_lufeiqing, por_npc_lufeiqing__ch12_elder_base.
《书剑恩仇录》ch12，绵里针、武当俗家前辈陆菲青。取西北避祸、以塾师身份隐身授徒的阶段；是李沅芷之师，武当传承不等于出家道士或官员。 本项目书界主线年代为1753–1759年、清乾隆；前史人物严格以其生前回忆阶段为准，不把回忆像当作现时活体。

AGE AND ORIGINAL FACE IDENTITY:
中老年男性elder；清瘦但稳定有力的身体，灰白短须、自然老年眼周纹，精确年龄未核，不画仙人或虚弱病者。 独立窄长脸，上额中等高，眉线低而平、灰黑眉疏密自然；眼睛细长且温和深沉，目光水平专注，眉眼间距较紧而不阴鸷。颧骨不突、面颊清瘦，下颌长而圆缓；鼻梁细直略低于眉骨、鼻尖微圆，嘴宽中等、薄唇自然合拢。灰白短须修整清楚，口侧和下巴须长接近，保留嘴部和下颌轮廓，不像陈世倌细长垂胸须，也不是陈正德秃顶长脸。眼角口侧细纹连续，手指细长有力；塾师专注靠眉眼和仪态，不低头藏眼。

CLOTHING AND HAIR:
乾隆汉地塾师常服：灰蓝完整长袍、素灰白内领、褐色窄腰带、深长裤与朴素布鞋。袍襟右侧合拢，汉式交领若可见为穿着者左襟压右襟。俗家男子剃额、后部余发编为辫，素小布帽露出前额，不留道士高髻、不戴道冠或官服顶戴。衣物完整不透明、袖口整洁，少量宽缓真实褶皱，无碎布、仙人飘带或破旧污渍。

POSE, EQUIPMENT AND STRUCTURE:
正面稳定站立，头颈端正竖直、双眼水平看前方，两肩自然放松。穿着者左侧垂佩一柄名为白龙剑的普通中式直身双刃剑，整刃在足长灰褐木鞘内；旧铜小横剑格、柄首与鞘口装具朴素，两个短挂带接腰带，柄鞘同轴、鞘尾离地。不雕龙、不发白光，不虚构装备ID，也不误持张召重凝碧剑。左手于腹前轻托一只小针包，右手在旁轻稳打开的一角；少量金属细针固定在包内整齐插槽中可见，不凌空、不用手捏多枚针，针与指头各自独立。姿态如耐心讲解，非攻击，无学堂背景或徒弟同框。

ORIGINAL CHARACTER COLOR AND LIGHT:
灰蓝塾师袍、灰白内领和褐腰带保持克制冷暖关系；柔和左上漫射光表现窄长清瘦脸、低平眉线、温和细长眼和整齐灰白短须。老年前辈专注而有力量，不变仙翁长须或病弱面孔。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. FAST1 production: first generate ONE candidate. Request another only for a serious identity, structural or readability failure. Every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。唯一输入为不含人物的派生纯背景参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要道士发髻道冠、和尚袈裟、官服顶戴、太极法阵或仙人长白眉；不要针包变医疗注射器、漂浮针雨；不要套成张召重的官场锐气或误持凝碧剑。

FINAL POSE CHECK: 陆菲青 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; No input supplies a face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要道士发髻道冠、和尚袈裟、官服顶戴、太极法阵或仙人长白眉；不要针包变医疗注射器、漂浮针雨；不要套成张召重的官场锐气或误持凝碧剑。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_lufeiqing__ch12_elder_base.prepared.json`。
