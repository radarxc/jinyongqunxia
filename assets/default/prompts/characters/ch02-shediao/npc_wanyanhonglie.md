---
asset_id: por_npc_wanyanhonglie__ch02_prime_base
subject_id: npc_wanyanhonglie
name: 完颜洪烈
book: ch02_shediao
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch02/por_npc_wanyanhonglie__ch02_prime_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/wanyanhonglie_1983_liujiang_sina2019_20261002.jpg
  use: 第一参考仅为1983 TVB《射雕英雄传》刘江饰完颜洪烈本人的可见脸部结构，已实际view_image并继承独立来源审。年龄、发式、胡须整理、服装、身体、姿态、器物与时段服从本稿；不复制剧照构图、字幕或背景，不变成现代演员照片。本人面貌可用但源是被擒后期，不是目标赵王府prime阶段。头角、散发、颈链、长须、衣服、神态和守卫均须排除。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二参考仅为root从用户原背景派生的无人纯背景，已实际view_image：暖浅灰纸底、极淡远山与留白，不含人物或身份；是内部派生参考而非用户原图、非approved。墨色仅在背景，不侵蚀人物衣料。
status: ready
realism_revision: user_identity_pose_20261001
---

# 完颜洪烈 · 人物写实修正

## 人物与阶段

- subject_id：npc_wanyanhonglie
- book：ch02_shediao
- gender：male
- age_variant：prime

## 本轮人物写实规范

完颜洪烈：1983本人面部识别第一、无人纯背景第二；金赵王完颜洪烈，赵王府政治首脑，策划招揽江湖力量与旧事揭露阶段。完整精细写实、正面头直眼平，FAST1单candidate待独审；不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_wanyanhonglie__ch02_prime_base/prompt-7fe3b9039d6072b6072bfffb8401f320ab5e4b17a2d4d1be2d850ef193903494.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. Ignore every source head angle, side glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create one refined REALISTIC hand-painted Chinese wuxia character illustration. Clear individual facial identity, natural age and skin volume, readable eyes and hands, continuous anatomy, complete opaque garments, intact seams, restrained material detail, a few broad weight-bearing folds and a clean silhouette. Soft upper-left diffuse light keeps the whole person readable. Ink wash and paper texture belong ONLY to the pale background, never inside skin, hair, cloth or equipment. A newly composed illustration, not a movie screenshot, photo collage, photorealistic actor photograph, 3D model or comic.

INPUT IDENTITY AND BACKGROUND: Image 1 is this exact character’s documented 1983 TVB facial identity only. Image 2 is a person-free background only. Do not average identities or borrow any unlisted person. Target role age, stage, grooming, clothes and pose override the still. 第一参考仅为1983 TVB《射雕英雄传》刘江饰完颜洪烈本人的可见脸部结构，已实际view_image并继承独立来源审。年龄、发式、胡须整理、服装、身体、姿态、器物与时段服从本稿；不复制剧照构图、字幕或背景，不变成现代演员照片。本人面貌可用但源是被擒后期，不是目标赵王府prime阶段。头角、散发、颈链、长须、衣服、神态和守卫均须排除。 第二参考仅为root从用户原背景派生的无人纯背景，已实际view_image：暖浅灰纸底、极淡远山与留白，不含人物或身份；是内部派生参考而非用户原图、非approved。墨色仅在背景，不侵蚀人物衣料。

CHARACTER AND STAGE: 完颜洪烈 / npc_wanyanhonglie, por_npc_wanyanhonglie__ch02_prime_base. 《射雕英雄传》ch02，金赵王完颜洪烈，赵王府政治首脑，策划招揽江湖力量与旧事揭露阶段。项目主体年代1217–1227为项目口径，本图只取当前阶段，不混神雕或其它剧版。

AGE AND BODY: 中年男性prime，四十余岁观感是当前角色稿视觉选段而非史实确岁；体态厚实、不健美肌肉化，威势来自王府地位与筹谋，不画五绝武学宗师。

VISIBLE FACIAL IDENTITY: 本人参考可见的饱满长方脸和较宽额颊、清楚眉弓与浓眉、沉稳细长眼形、直而厚实的鼻梁及自然圆厚鼻尖、鼻口比例与短髭生长位置。沿这一个人的可见面部结构重新画成赵王府阶段的整洁中年脸，目光水平衡量局势，嘴唇自然闭合、神态审慎克制。胡须修短整齐，以精修短髭和很短的下颏须保持口周辨识，不复制被俘时的长乱浓须；源须遮住的下颌不编造精确骨点。绝不延续源图低头歪颈、侧向凶视或被俘狼狈。

CLOTHING AND HAIR: 金代女真王族行旅便袍，低饱和深赭锦袍、窄袖、少量深貂皮领缘、皮腰带和皮靴；整洁完整不透明，少而宽的重力褶，锦纹克制且无龙纹文字。此件女真外袍明确左衽：穿着者右襟压左襟，这是当前角色稿指定例外，不能误改汉式右衽；可见汉式内衣仍穿着者左襟压右襟。女真髡辫方向的低调短辫收束在普通软帽下，具体辫式待考，不画清代整片剃额和独条长辫。无散乱披发、颈部锁链或被俘白衣。

POSE, EQUIPMENT AND STRUCTURE: 正面稳立，头颈竖直、眼线水平，下巴中性、双肩放松。右手停在皮腰带上但不遮挂点，左手自然下垂；穿着者左腰只佩一把普通短腰刀，完整入足长深色鞘。刀柄、鞘口、鞘尾结构连续，鞘由两条短皮挂带承托，重力自然，所有端点入画；不拔刀，不作运功架势，不加王冠、龙纹玉玺或额外武器。

COMPOSITION AND DELIVERY: one person, one view, full body from complete scalp/hair/hat to both shoes; both hands, entire hem and any prop endpoints comfortably inside the frame. Vertical native 2:3 PNG, target 2048×3072, accept and record actual native 2:3 dimensions truthfully. No resizing, crop or re-encoding to pretend compliance; preserve original PNG bytes and tool provenance. Opaque warm pale-grey paper background, extremely faint distant ink mountains/mist, generous empty space and a modest soft contact shadow. No narrative scene, recognizable buildings, other person, foreground vegetation or action effects. FAST1: first ONE candidate; add another only for a serious identity, structural or readability failure. Every result remains candidate pending user review, never automatically approved.

FACT BOUNDARIES: 小说身份与史实原型分开；王府期脸、女真服饰髡辫和佩刀均仍按原稿待指定修订版终校，具体制度与小说装束不混证。女真外袍左衽为当前稿已定美术例外，本轮不新增历史确证。 来源页面与演员表只证角色/演员/剧版及同图配对，不证明原著体貌或目标剧情时点；TV图片为发布方版本，非已证广播母帧。未核细节保持待考；具体裁制、配色、静态动作与正面重绘均美术落实。

完整排除项：不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要借用其他角色面孔、现代演员生活照、未指定剧版身份、剧照构图或服装道具；只用第一图对应本人面部结构，不复制具体画作，不以画师姓名作风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；当前女真外袍必须左衽、右襟压左襟，不能套用汉式右衽；可见汉式内衣仍左襟压右襟，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要南宋官员长翅幞头、明代补子、清式独辫旗装、皇帝冠冕龙袍或欧式王冠；本件女真左衽不可误改汉式右衽，也不要把他画成武功宗师。 不要 head tilt、Dutch angle、头歪向肩、歪斜眼线、侧脸、侧身回眸、低头藏眼或仰头。不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣摆、碎布条、过密细褶或斑驳污脸；不要年轻模板脸或磨掉正常年龄。 不要颈链、枷锁、散发、斜头侧眼、长乱胡须、被俘服色或背景守卫；不要南宋长翅幞头、明代补子、清式独辫旗装、帝王冠冕龙袍或欧式王冠。女真外袍左衽不得误改右衽，不画武学宗师。

FINAL POSE CHECK: FRONT-FACING. Head upright and centered, forehead–nose–chin vertical, both eyes horizontally level, camera level. NO head tilt. NO Dutch angle. Preserve the specified individual face, age, stage and equipment.
```

## 排除项

不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要借用其他角色面孔、现代演员生活照、未指定剧版身份、剧照构图或服装道具；只用第一图对应本人面部结构，不复制具体画作，不以画师姓名作风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；当前女真外袍必须左衽、右襟压左襟，不能套用汉式右衽；可见汉式内衣仍左襟压右襟，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要南宋官员长翅幞头、明代补子、清式独辫旗装、皇帝冠冕龙袍或欧式王冠；本件女真左衽不可误改汉式右衽，也不要把他画成武功宗师。 不要 head tilt、Dutch angle、头歪向肩、歪斜眼线、侧脸、侧身回眸、低头藏眼或仰头。不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣摆、碎布条、过密细褶或斑驳污脸；不要年轻模板脸或磨掉正常年龄。 不要颈链、枷锁、散发、斜头侧眼、长乱胡须、被俘服色或背景守卫；不要南宋长翅幞头、明代补子、清式独辫旗装、帝王冠冕龙袍或欧式王冠。女真外袍左衽不得误改右衽，不画武学宗师。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_wanyanhonglie__ch02_prime_base.prepared.json`。
