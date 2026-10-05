---
asset_id: por_npc_yideng__ch02_elder_monk_base
subject_id: npc_yideng
name: 一灯大师
book: ch02_shediao
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch02/por_npc_yideng__ch02_elder_monk_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/yideng_1983_liuzhaoming_sina2020_20261002.jpg
  use: 第一参考仅为1983 TVB《射雕英雄传》刘兆铭饰一灯大师本人的可见脸部结构，已实际view_image并继承独立来源审。年龄、发式、胡须整理、服装、身体、姿态、器物与时段服从本稿；不复制剧照构图、字幕或背景，不变成现代演员照片。当前role剃发明确覆盖源图后梳灰发；长白眉下垂依角色稿落实，不称源图证明原著眉长。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二参考仅为root从用户原背景派生的无人纯背景，已实际view_image：暖浅灰纸底、极淡远山与留白，不含人物或身份；是内部派生参考而非用户原图、非approved。墨色仅在背景，不侵蚀人物衣料。
status: ready
realism_revision: user_identity_pose_20261001
---

# 一灯大师 · 人物写实修正

## 人物与阶段

- subject_id：npc_yideng
- book：ch02_shediao
- gender：male
- age_variant：elder

## 本轮人物写实规范

一灯大师：1983本人面部识别第一、无人纯背景第二；一灯大师段智兴，已出家的南帝，在山居接待求医的郭靖、黄蓉，疗伤前。完整精细写实、正面头直眼平，FAST1单candidate待独审；不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yideng__ch02_elder_monk_base/prompt-820bfdd184d04ce80aa79a1e4fac9ce37175da8f1d1f42c607293816a25fc277.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. Ignore every source head angle, side glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create one refined REALISTIC hand-painted Chinese wuxia character illustration. Clear individual facial identity, natural age and skin volume, readable eyes and hands, continuous anatomy, complete opaque garments, intact seams, restrained material detail, a few broad weight-bearing folds and a clean silhouette. Soft upper-left diffuse light keeps the whole person readable. Ink wash and paper texture belong ONLY to the pale background, never inside skin, hair, cloth or equipment. A newly composed illustration, not a movie screenshot, photo collage, photorealistic actor photograph, 3D model or comic.

INPUT IDENTITY AND BACKGROUND: Image 1 is this exact character’s documented 1983 TVB facial identity only. Image 2 is a person-free background only. Do not average identities or borrow any unlisted person. Target role age, stage, grooming, clothes and pose override the still. 第一参考仅为1983 TVB《射雕英雄传》刘兆铭饰一灯大师本人的可见脸部结构，已实际view_image并继承独立来源审。年龄、发式、胡须整理、服装、身体、姿态、器物与时段服从本稿；不复制剧照构图、字幕或背景，不变成现代演员照片。当前role剃发明确覆盖源图后梳灰发；长白眉下垂依角色稿落实，不称源图证明原著眉长。 第二参考仅为root从用户原背景派生的无人纯背景，已实际view_image：暖浅灰纸底、极淡远山与留白，不含人物或身份；是内部派生参考而非用户原图、非approved。墨色仅在背景，不侵蚀人物衣料。

CHARACTER AND STAGE: 一灯大师 / npc_yideng, por_npc_yideng__ch02_elder_monk_base. 《射雕英雄传》ch02，一灯大师段智兴，已出家的南帝，在山居接待求医的郭靖、黄蓉，疗伤前。项目主体年代1217–1227为项目口径，本图只取当前阶段，不混神雕或其它剧版。

AGE AND BODY: 中老年僧人elder，约五十至六十余岁观感是当前稿视觉范围，精确生卒待考。瘦而不枯、神态稳定，疗伤前精神与气色正常，不提前画耗功衰弱。

VISIBLE FACIAL IDENTITY: 本人参考可见的上部较宽、向下自然收束的修长脸，清楚眉骨、较厚白眉、略深而狭长的双眼、直而清楚的鼻梁与较宽自然鼻头、嘴形和灰白口须长须关系。沿这一个人的面容重新画出年龄真实、慈和端肃且隐含忧思的脸，闭口安静、不张口诵念。两道长白眉按现稿从眼角向下垂落，眉梢低于眼角，保持眼睛可读；眉长与剃发为角色约束，不把参考灰短眉后梳发照搬。头直、双眼水平直视，温和倾听只用目光神态，不垂头或斜视。

CLOTHING AND HAIR: 明确剃发的出家僧人：完整自然剃净头皮，没有后梳灰发、披发、发髻或王冠，也不凭空增加戒疤。灰褐交领右衽僧袍，外搭哑光赭褐袈裟，内衣完整遮蔽胸颈，普通布鞋；穿着者左襟压右襟，袈裟和内袍分层受力合理、整体完整不透明。不要复制参考黄色袍、粗大佛珠或合十动作。

POSE, EQUIPMENT AND STRUCTURE: 身体和头颈正面竖直，两眼水平、双足稳落地。两手在胸腹前自然分开，右手食指轻抬作细致诊察姿态，其余手指自然舒展，左手在腹旁放松；两手均有自然连续手腕，不作施法结印，不产生一阳指光束。不持兵器、佛珠串、拂尘、钵、王冠玉玺或具名法器。

COMPOSITION AND DELIVERY: one person, one view, full body from complete scalp/hair/hat to both shoes; both hands, entire hem and any prop endpoints comfortably inside the frame. Vertical native 2:3 PNG, target 2048×3072, accept and record actual native 2:3 dimensions truthfully. No resizing, crop or re-encoding to pretend compliance; preserve original PNG bytes and tool provenance. Opaque warm pale-grey paper background, extremely faint distant ink mountains/mist, generous empty space and a modest soft contact shadow. No narrative scene, recognizable buildings, other person, foreground vegetation or action effects. FAST1: first ONE candidate; add another only for a serious identity, structural or readability failure. Every result remains candidate pending user review, never automatically approved.

FACT BOUNDARIES: 原role指向在线《一灯大师》转录，长白眉下垂及慈和忧思标原著概括；本作者本轮未访问该外链或纸本，指定三联/广州版终校以及其余胡须、衣色、剃发状态仍待考，不能把电视剧发式当原著证据。 来源页面与演员表只证角色/演员/剧版及同图配对，不证明原著体貌或目标剧情时点；TV图片为发布方版本，非已证广播母帧。未核细节保持待考；具体裁制、配色、静态动作与正面重绘均美术落实。

完整排除项：不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要借用其他角色面孔、现代演员生活照、未指定剧版身份、剧照构图或服装道具；只用第一图对应本人面部结构，不复制具体画作，不以画师姓名作风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要南帝在位时的王冠龙袍，不要披发道士、袒胸藏式袍、法阵光环、手指激光或战斗怒目；不要画成另一位段氏人物。 不要 head tilt、Dutch angle、头歪向肩、歪斜眼线、侧脸、侧身回眸、低头藏眼或仰头。不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣摆、碎布条、过密细褶或斑驳污脸；不要年轻模板脸或磨掉正常年龄。 不要后梳灰发、披发道士、发髻、王冠龙袍、头上无依据戒疤、袒胸僧衣、佛珠或具名法器；不要合十张口照抄剧照，不要法阵光环、指尖激光、战斗怒目或疗伤后的耗功衰弱，不画成其他段氏人物。

FINAL POSE CHECK: FRONT-FACING. Head upright and centered, forehead–nose–chin vertical, both eyes horizontally level, camera level. NO head tilt. NO Dutch angle. Preserve the specified individual face, age, stage and equipment.
```

## 排除项

不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要借用其他角色面孔、现代演员生活照、未指定剧版身份、剧照构图或服装道具；只用第一图对应本人面部结构，不复制具体画作，不以画师姓名作风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要南帝在位时的王冠龙袍，不要披发道士、袒胸藏式袍、法阵光环、手指激光或战斗怒目；不要画成另一位段氏人物。 不要 head tilt、Dutch angle、头歪向肩、歪斜眼线、侧脸、侧身回眸、低头藏眼或仰头。不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣摆、碎布条、过密细褶或斑驳污脸；不要年轻模板脸或磨掉正常年龄。 不要后梳灰发、披发道士、发髻、王冠龙袍、头上无依据戒疤、袒胸僧衣、佛珠或具名法器；不要合十张口照抄剧照，不要法阵光环、指尖激光、战斗怒目或疗伤后的耗功衰弱，不画成其他段氏人物。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yideng__ch02_elder_monk_base.prepared.json`。
