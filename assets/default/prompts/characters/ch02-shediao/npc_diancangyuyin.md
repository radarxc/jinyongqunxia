---
asset_id: por_npc_diancangyuyin__ch02_elder_base
subject_id: npc_diancangyuyin
name: 点苍渔隐
book: ch02_shediao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch02/por_npc_diancangyuyin__ch02_elder_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 点苍渔隐 · 人物写实修正

## 人物与阶段

- subject_id：npc_diancangyuyin
- book：ch02_shediao
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次文本原创本人脸；正面头直眼水平，完整写实人物与浅水墨背景。按 FAST 先1候选，清晰正面可辨即用；只有严重身份/结构/不可读才补，轻微手指装备角度集中记录，原始PNG native2:3，仍candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_diancangyuyin__ch02_elder_base/prompt-0a14e290b79151641b146899d81c13ff598c9836035f22e0e39fa353d3a4717c.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 点苍渔隐. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Do not claim likeness to the 1983 TV actor.

身份与阶段：点苍渔隐（npc_diancangyuyin），《射雕英雄传》ch02_shediao。一灯门下渔樵耕读中的渔，取黄蓉求医经过渔关的守护者形象

年龄与体型：按项目名录中老年大档，默认五十余岁观感；阔背粗臂、胸腰结实的健康成年渔人，不消瘦衰弱。具体确岁及与原文年貌的差异仍待考。

原创本人面容：独立宽厚颧骨与偏方长的脸，额头中等宽、眉弓厚实，粗短浓眉外端稍上挑但双眼连线水平；眼裂较窄、目光认真警戒。鼻梁宽直、鼻翼厚阔，阔口上唇偏薄下唇厚实，下颌厚重；灰黑虬髯卷曲但毛束完整，腮部日晒偏深而有健康血色和适龄眼角纹。与南希仁的短下颌平眉、韩宝驹的宽圆肉颊明确不同，不画兽脸。

服制与发式：宋代汉式灰褐交领右衽渔人短褐，穿着者左襟压右襟；深布裤卷束至小腿，草编履。全部头发以素布巾收紧，不剃额留清辫、不套明代网巾。背后一小片编结整齐的蓑衣由肩带支撑，稻草编束方向完整可读，既不遮住手臂也不化为破碎衣条。内外布衣完整不透明，衣领胸腹遮蔽。

正面姿态与器物：正面站稳、肩线平稳、头颈端正、双眼水平，双脚自然分开。两手分别低握一柄朴素铁桨，左右身体外侧各一柄，双桨互不交叉不穿腿；桨杆连续连到扁平金属桨片，桨面窄于身体、向下接近地面，全部柄尾和桨片端点入画。暗铁灰材质和真实重量，不画船只、水域、鱼篓或木桨。本图双桨静置布局为主稿美术选款，不冒称原文数量已终校。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份与阶段依当前本地角色稿、名录、story 和 chapter；项目主线1217–1227、楔子1199为玩法推定，回溯人物依其专门阶段。所有具体五官、服色选款、器物形制细部和静立展示都是原创美术落实；原稿待考照留，不冒称已逐字终校小说或精确历史复原。当前已下载原版 game 语料与本机1983射雕影视参考没有可靠本人图，按本轮明确配角授权采用文字原创脸，不冒充1983演员本人、不拿别人头像代替，也不声称该角色在所有游戏版本从无头像。两张输入都不是本人身份参考，保留原项目基线 candidate/approved 状态。 主稿默认五十余岁依名录中老年大档，不把该视觉值升级为原著确岁；渔关初见年貌、虬髯、铁桨数量仍待指定版本终校。 沿现有 subject_id 与点苍渔隐名，不裁定版本异名；双铁桨、蓑衣与静持方案属本次美术补足；不带入神雕断桨战损。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要冒充1983翁美玲版演员本人，不借其他演员、其他游戏角色或任何输入参考的脸、身体、衣装与姿态；本配角明确采用文字原创面孔。不要剧照拼贴、具体画作复制或画师姓名风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、前景花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要神雕大会断桨战损，不把铁桨画成木船桨、三叉戟或现代划艇器；不要赤膊渔民、凶恶兽脸、船水场景，姓名不得擅改。 不要 head tilt、Dutch angle、头歪向肩、倾斜眼线、低头藏眼、抬下巴、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅在背景，人物皮肤、衣料、毛发与器物完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, body and narrative stage; ignore reference poses.
```

## 排除项

不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要冒充1983翁美玲版演员本人，不借其他演员、其他游戏角色或任何输入参考的脸、身体、衣装与姿态；本配角明确采用文字原创面孔。不要剧照拼贴、具体画作复制或画师姓名风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、前景花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要神雕大会断桨战损，不把铁桨画成木船桨、三叉戟或现代划艇器；不要赤膊渔民、凶恶兽脸、船水场景，姓名不得擅改。 不要 head tilt、Dutch angle、头歪向肩、倾斜眼线、低头藏眼、抬下巴、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅在背景，人物皮肤、衣料、毛发与器物完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_diancangyuyin__ch02_elder_base.prepared.json`。
