---
asset_id: por_npc_fengmofeng__ch03_elder_lame_base
subject_id: npc_fengmofeng
name: 冯默风
book: ch03_shendiao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch03/por_npc_fengmofeng__ch03_elder_lame_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 冯默风 · 人物写实修正

## 人物与阶段

- subject_id：npc_fengmofeng
- book：ch03_shendiao
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次文本原创本人脸；正面头直眼水平，完整写实人物与浅水墨背景。按 FAST 先1候选，清晰正面可辨即用；只有严重身份/结构/不可读才补，轻微手指装备角度集中记录，原始PNG native2:3，仍candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_fengmofeng__ch03_elder_lame_base/prompt-7678a4cec1c28c8127df501e046f5126808350f534cb284b007c7c0854c34cb9.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head held upright naturally above the slightly stooped torso, never erase the mild hunchback or shift left-foot disability to the right, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 冯默风. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Do not claim this original face is a verified original-game portrait or actor likeness.

身份与阶段：冯默风（npc_fengmofeng），《神雕侠侣》ch03_shendiao。中老年桃花岛旧弟子、隐居铁匠，铁匠铺相遇至蒙古军阵事件之前，左足残疾

年龄与体型：中老年男性隐居铁匠，消瘦的老年骨架，背部轻微自然驼曲且胸口不塌；前臂保留打铁劳动的肌腱力量。双腿双足均完整，左足有旧残疾而右腿主要承重，绝非截肢。灰白须发与脸颈真实年龄纹理；不硬定原著确岁，不改年轻壮汉。

原创本人面容：原创消瘦长脸，上额稍宽而两颊内收，下颌窄但下巴钝圆；眉骨平缓、灰白粗眉在眉尾略稀，眼距中等，细长内双眼清醒温厚；鼻梁偏低而鼻头宽钝，薄上唇与较长人中，双颊风霜纹、眼尾细纹与灰白短乱须相接。沉默隐忍的勇气来自稳定眼神，不靠凶瞪、丑化或照搬基线青年眉眼。此为文本原创骨相，非1995演员本人或游戏头像。

服制与发式：南宋汉族隐居铁匠：灰褐粗布右衽短衣、深蓝完整长裤、朴素布鞋、厚布围裙和窄腰绳；灰白头发收在旧布巾中，不露清式剃额辫发。少量烟尘仅为布面轻薄色痕，衣料、围裙下摆与皮肤连续完整，无破洞、碎布或人物飞白。腰侧皮套只挂一把铁钳，工具保持冷态。

正面姿态与器物：正面全身，头颈自然竖直、眼线水平、镜头水平，保留微驼背与左足残疾，正面要求只约束头脸，不拉直脊背或强迫双脚等量承重。人物自身 LEFT 左腋支一根朴素铁拐，左手稳拐；自身 RIGHT 右手放松下提一把小冷铁锤，腰侧皮套挂一把铁钳。左腿左足完整、左足轻着地，右腿主要承重，铁拐与右腿构成可信支撑；不水平镜像侧别，不画残端、义肢或右足伤残。铁匠铺相遇至蒙古军阵前的活体基础像，无锻打动作、炉火、战场、死亡伤口或烧红工具。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份与阶段依当前本地角色稿、名录、story 和 chapter；南宋神雕语境，本组为各人当前主稿指定的中老年活体阶段，汉式右衽与头巾或低髻逐人落实，不移用清代辫发或蒙古阵营官服。冯默风伤残侧别以当前完整主稿为准且保留版本待考；武三通只取清醒状态；潇湘子始终为活人。所有具体五官、服色选款、器物形制细部和静立展示都是原创美术落实；原稿待考照留，不冒称已逐字终校小说或精确历史复原。当前已下载原版 game 语料与本机已登记影视参考没有可靠本人图，按本轮明确配角授权采用文字原创脸，不冒充原版游戏或演员本人、不拿别人头像代替，也不声称该角色在所有游戏版本从无头像。两张输入都不是本人身份参考，保留原项目基线 candidate/approved 状态。 左足、略驼、灰白须发、铁拐及锤钳器形的版本一致性按主稿仍待指定纸本核定；本图先服从当前全稿一致的左足限定，不能声称 catalog 或 story 独立证明侧别。 当前未定位有效伤残审批 hold，父任务确认没有掌握此类 hold；这不等于本次设计解除过任何审批。旧审核仅木拐改铁拐，当前主稿为铁拐。具体五官、服色选款和工具携法为原创落实，不虚构确岁或引文页码。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；本配角没有可靠本人身份图输入，明确文字原创面孔；不要冒充原版游戏脸或演员本人，不借其他游戏角色、演员或基线脸；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、低幼化成人、统一网红锥子脸、丰唇滤镜、浓妆磨皮、摄影写真、三维塑料皮肤；不要裸露、透明衣料、色情化、血腥特写或恶搞丑化；不要日式服制、和服、日式刀具、圆盘刀镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、汉式交领左衽、水平镜像、悬空装备、失重衣料、手物融合、多余肢体、多指、粘连手指、错接手腕、错误增删既定身体部位、裁断头足或兵器端点；不要弯折断裂剑刃或容不下剑刃的短鞘；不要无依据的兵器、发光武器、龙形能量、光翼、法阵、粒子特效、强烈泛光；不要具体剧情场景、清晰建筑、额外人物、分格、多视图或面部特写框；不要明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃发留辫、旗装、马蹄袖或大拉翅。 不要右脚残疾、左腿缺失、机械义肢、双脚均匀站直、年轻壮汉、夸张驼背怪人、赤膊锻铁、烧红火器或烟火场景。

排除装饰水印不授权去除或伪造工具自带的溯源标识。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, body, impairment and narrative stage; do not straighten a described hunchback; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；本配角没有可靠本人身份图输入，明确文字原创面孔；不要冒充原版游戏脸或演员本人，不借其他游戏角色、演员或基线脸；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、低幼化成人、统一网红锥子脸、丰唇滤镜、浓妆磨皮、摄影写真、三维塑料皮肤；不要裸露、透明衣料、色情化、血腥特写或恶搞丑化；不要日式服制、和服、日式刀具、圆盘刀镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、汉式交领左衽、水平镜像、悬空装备、失重衣料、手物融合、多余肢体、多指、粘连手指、错接手腕、错误增删既定身体部位、裁断头足或兵器端点；不要弯折断裂剑刃或容不下剑刃的短鞘；不要无依据的兵器、发光武器、龙形能量、光翼、法阵、粒子特效、强烈泛光；不要具体剧情场景、清晰建筑、额外人物、分格、多视图或面部特写框；不要明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃发留辫、旗装、马蹄袖或大拉翅。 不要右脚残疾、左腿缺失、机械义肢、双脚均匀站直、年轻壮汉、夸张驼背怪人、赤膊锻铁、烧红火器或烟火场景。

排除装饰水印不授权去除或伪造工具自带的溯源标识。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_fengmofeng__ch03_elder_lame_base.prepared.json`。
