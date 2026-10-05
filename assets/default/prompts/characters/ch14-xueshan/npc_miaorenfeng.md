---
asset_id: por_npc_miaorenfeng__ch14_elder_base
subject_id: npc_miaorenfeng
name: 苗人凤
book: ch14_xueshan
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch14/por_npc_miaorenfeng__ch14_elder_base.png
manifest: assets/default/character/male/ch14/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_4-1.png
  use: 第一输入是已可靠配名并实际查看的经典1996原版苗人凤本人头像，仅建立长脸骨相、眉眼鼻唇与肃然气质；不是审批通过的项目图。像素块、原图发式、灰领和姿势不照搬，清代剃额单辫与当前年龄器物服装以本稿为准。
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 第二输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 苗人凤 · 人物写实修正

## 人物与阶段

- subject_id：npc_miaorenfeng
- book：ch14_xueshan
- gender：male
- age_variant：elder

## 本轮人物写实规范

1780围捕脱身、佩剑归还后及雪崖决斗前，不画死亡分支。与ch13同一npc、同一原版game骨相；九年老化与深赭厚袍照本稿，ch13入鞘与本图出鞘不可混用。当前尚无已生成本人项目PNG输入，不把文字设计当身份照片。 正面写实全身、头颈端正、完整衣料、背景淡墨；先1个原生PNG候选，微细瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_miaorenfeng__ch14_elder_base/prompt-b1050fb6c88fd508816afcaa9fcbb05bd8f0b377a4b2260cecd13cab2872d3d5.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body portrait of 苗人凤 for a Chinese wuxia game. IMAGE 1 is the verified classic 1996 game portrait of THIS CHARACTER: retain his recognizable facial identity, recast into complete realistic anatomy and the stated stage. Images 2 and 3 are STYLE ONLY and must not contribute a face. Keep the same bone structure in both book stages; no face averaging. Restore natural realistic eyes and skin, no pixel graphics.

身份与阶段：苗人凤（npc_miaorenfeng），《雪山飞狐》 ch14_xueshan。1780 年围捕脱身、佩剑归还后，雪崖决斗前的苗家家主与终章对手。

年龄与体型：1780年中老年男性，以五六十岁阅历感表现；elder仅本任务美术归并，不伪造确岁。相较飞狐晚约九年，极高且清瘦，筋骨仍强壮、大手骨节清楚，背脊挺直不病弱。

本人游戏面容与阶段适配：本人经典原版头像的长方至长椭圆骨相：宽而偏高的额头，中庭偏长、颧骨清楚而颊部内收，下颌由宽颊向窄而不尖的下巴收束；浓密平直眉在鼻根处略压低，深眼窝与窄而自然的双眼，眼距正常，鼻梁长直、鼻尖偏宽而沉实，薄中等厚度的嘴唇紧闭，宽朴直的嘴形和清楚法令纹。保留自然黄褐肤色和严正神情。原像素图的黑发边缘与像素块不是本书发制或肌理依据，不沿用图中发式；不把他画成男基线的青年宽胸偶像。保持同一五官比例，眼角、额头、口周增适度真实年龄纹，瘦颊更清楚，鬓须只少量灰白而非全白长须；仍然双目有神、视力正常。

服制与发式：清乾隆关外便装，深赭褐厚长袍、内层右衽交领、暗色布腰带和深棕靴；前额依清代发式剃净，灰黑长辫收于背后，额边整洁。衣料完整不透明，衣缘缝线连续；只少量宽缓有重力的褶皱，不画裂纹、碎布和飞白。汉式交领采用本人左襟压右襟，不水平镜像；清式剃额单辫与素帽按本角色原稿。

正面姿态与器物：正面完整全身，头颈竖直、眼线水平、下巴中性，双脚间距克制而站稳。右手垂握一柄出鞘普通中国直身双刃长剑的剑柄，剑尖斜向本人右侧身外下方、离双腿有净空，整段笔直钢刃和尖端均入画。左腰只有对应一只完整空剑鞘，鞘长容纳整刃，小剑格朴素；左手自然展开，不持第二把剑。双眼聚焦、无眼布、无最终分支致命伤。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新提速要求先1张候选，基本清晰、正面端正、身份可辨即可保存；仅严重身份/结构/不可读才补，不为细手指、微装备、微角重复。每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：项目1780，当前为本人活体阶段，不是旧案记忆或终局死亡。 身份、年龄、生命态、器物依最新本地角色/名录/剧情；原稿标记待考仍保留，未新浏览外网或声称指定版本终校。清代武人和满族贵胄依各自服制，不用通用禁辫子。具体衣色、器型细节、面部写实转译及静立姿态属于本次美术落实。1780围捕脱身、佩剑归还后及雪崖决斗前，不画死亡分支。与ch13同一npc、同一原版game骨相；九年老化与深赭厚袍照本稿，ch13入鞘与本图出鞘不可混用。当前尚无已生成本人项目PNG输入，不把文字设计当身份照片。

图像输入使用边界：第一输入是已可靠配名并实际查看的经典1996原版苗人凤本人头像，仅建立长脸骨相、眉眼鼻唇与肃然气质；不是审批通过的项目图。像素块、原图发式、灰领和姿势不照搬，清代剃额单辫与当前年龄器物服装以本稿为准。 第二输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。 第三输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；不照搬剧照姿态、像素画法或其他角色衣装，不复制具体画作，不以画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景或清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要金色脸皮、金面具、僧袍佛光、苗族银饰；不要胖壮体型、失明眼罩或少年脸；不要双刀、胡家刀或终局致命伤。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

FINAL POSE CHECK: FRONT-FACING, head upright, eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt. Respect identity and age, intact skin and clothing, correct stage and props.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；不照搬剧照姿态、像素画法或其他角色衣装，不复制具体画作，不以画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景或清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要金色脸皮、金面具、僧袍佛光、苗族银饰；不要胖壮体型、失明眼罩或少年脸；不要双刀、胡家刀或终局致命伤。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_miaorenfeng__ch14_elder_base.prepared.json`。
