---
asset_id: por_npc_chenzhengde__ch12_elder_alive_base
subject_id: npc_chenzhengde
name: 陈正德
book: ch12_shujian
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch12/por_npc_chenzhengde__ch12_elder_alive_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 陈正德 · 人物写实修正

## 人物与阶段

- subject_id：npc_chenzhengde
- book：ch12_shujian
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次独立原创面貌：陈正德；高瘦劲健的老年男性elder；明显秃顶、周边稀疏灰发、灰须，真实皱纹及清瘦老骨架并存。 正面端正、头颈竖直、双眼水平；人物完整写实，背景极淡水墨。先1张独立candidate，原始PNG native 2:3；均candidate待用户审核。唯一图片输入为无人纯背景；人物本人由具体原创文字脸锚建立，不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_chenzhengde__ch12_elder_alive_base/prompt-9ebe7e6fb5afa802f2e4e3b72327ee0955467cef3f5490027296ac745bb28af4.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

CHARACTER AND STAGE: 陈正德 / npc_chenzhengde, por_npc_chenzhengde__ch12_elder_alive_base.
《书剑恩仇录》ch12，天山双鹰之一的世俗老侠陈正德。取玉峰前辈相会、京师第20回终局死亡之前的在世阶段；本图不改写命定死亡，不暗示终局后普通复活。 本项目书界主线年代为1753–1759年、清乾隆；前史人物严格以其生前回忆阶段为准，不把回忆像当作现时活体。

AGE AND ORIGINAL FACE IDENTITY:
高瘦劲健的老年男性elder；明显秃顶、周边稀疏灰发、灰须，真实皱纹及清瘦老骨架并存。 独立高瘦长脸，额头突出且顶部明显光秃，眉骨挺立，灰白眉较浓但不飞扬长眉；眼裂中等偏窄、目光平视有倔强自尊。颧骨高而下颊瘦，鼻根高、鼻梁直长略有自然骨节，鼻尖有棱但不尖钩；嘴唇薄而紧闭，下颌较窄、下巴略长，短灰须呈整洁楔形保留下颌线。老年额纹、眼袋与口周纹连续真实，身躯劲瘦不干枯。秃顶不能被帽子、黑发高髻或画面裁边藏住；头颈依然竖直不仰头，神态不靠歪脸。

CLOTHING AND HAIR:
乾隆天山世俗老侠的深灰青完整长袍、褐色短外衣、窄布腰带、厚长裤与平底软靴。长袍侧襟向穿着者右方合拢，汉式交领如可见则左襟压右襟。头顶明显光秃，周边仅稀疏灰发、后部余发成短辫，此为当前主稿清代发式美术落实；不戴遮秃帽、道冠或僧人袈裟。衣料利落厚实不透明、连续缝边和宽缓褶，不碎墨破布化。

POSE, EQUIPMENT AND STRUCTURE:
正面头直、双眼水平，下巴中性，躯干正对观者，两脚稍错开而稳立。穿着者左腰只有一柄普通中式直身双刃剑，完整藏在足长朴素剑鞘中，剑柄—小横剑格—鞘口—鞘尾连续同轴。两条短挂带从布腰带承托剑鞘，尾端离地，所有端点入画；左手在低位轻扶鞘口附近不挡挂点，右手空着自然垂在身旁。无鹰鸟、鹰爪手套、羽翼、飞天姿态、伴侣或终局死伤。

ORIGINAL CHARACTER COLOR AND LIGHT:
深灰青袍与褐色短衣保持低饱和冷暖层次；柔和左上漫射光表现突额、挺立眉骨、高颧、劲瘦长脸、整洁楔形短灰须和明显秃顶，倔强自尊仅由水平目光与闭口体现。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. FAST1 production: first generate ONE candidate. Request another only for a serious identity, structural or readability failure. Every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。唯一输入为不含人物的派生纯背景参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要浓密黑发、全头高髻、道冠遮秃、和尚戒疤或袈裟；不要鹰头、翅膀、鹰鸟同框、飞天姿态；不要终局死伤、夫妻合照或青年脸。

FINAL POSE CHECK: 陈正德 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; No input supplies a face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要浓密黑发、全头高髻、道冠遮秃、和尚戒疤或袈裟；不要鹰头、翅膀、鹰鸟同框、飞天姿态；不要终局死伤、夫妻合照或青年脸。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_chenzhengde__ch12_elder_alive_base.prepared.json`。
