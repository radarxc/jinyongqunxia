---
asset_id: por_npc_zhoudian__ch04_prime_base
subject_id: npc_zhoudian
name: 周颠
book: ch04_yitian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch04/por_npc_zhoudian__ch04_prime_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 第一输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 周颠 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhoudian
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

直率急性只用眼神、嘴角和摊掌表达，不丑化或荒诞化；中年宽圆矮壮为原创识别，不冒称原著精确身高。 正面写实全身、头颈端正、完整衣料、背景淡墨；先1个原生PNG候选，微细瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhoudian__ch04_prime_base/prompt-811bde924388d4f1372935c1996e2adc659f096f4be83d6f98ceb28fa049a1f4.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body portrait for a Chinese wuxia game of 周颠. This supporting character has an ORIGINAL TEXT-DEFINED FACE. Neither input is an identity portrait: image 1 supplies palette/painting quality only and image 2 pale ink background only. Do not copy, average or borrow any reference face. Build the distinct facial anchors below; no claim of game, TV actor or historical likeness.

身份与阶段：周颠（npc_zhoudian），《倚天屠龙记》 ch04_yitian。中年明教五散人之一，光明顶同生共死后的教内议事阶段。

年龄与体型：中年男子，矮壮结实但自然正常成人比例、不夸张肥胖，不由姓名推精神疾病或侏儒。光明顶同生共死后的议事阶段。

原创本人面容：原创宽圆脸：额头宽而不高，浓而稍短的眉毛，两眼自然偏圆但不放大、眼距舒展，眼神率直锐利。颧颊饱满、圆弧下颌中带实在下颌角、下巴宽圆；鼻梁较短厚实、鼻头圆而鼻翼较宽，嘴较宽、上唇厚度自然、唇角微收带不服气。黑须略蓬但整洁，沿下颌成短圆轮廓，额头和眼角有中年浅纹，肤色健康暖褐。比常遇春更短圆、比彭和尚更宽厚有须，不用笑佛或搞怪表情。

服制与发式：元末汉地散人灰褐右衽短外袍、深蓝布裤、窄布带与布鞋，黑发略乱却仍束成低髻，布巾尾短而有连接点。衣料完整不透明，衣缘缝线连续；只少量宽缓有重力的褶皱，不画裂纹、碎布和飞白。短外袍、窄布带、深蓝裤与布鞋均完整；黑发可略蓬松但实际扎为低髻，短布巾尾有固定点，不成碎布条。

正面姿态与器物：正面站稳，双足稍宽、肩胸和骨盆仍朝前，头直双眼水平，取消原稿腰胯侧转。本人左手轻叉腰、右手在腰旁低位摊掌作直接议事，手指自然完整，嘴闭合带克制不服气，绝不夸张咧嘴。双手都空着，无乾坤一气袋、判官笔、酒壶、念珠或其他五散人专属器物。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新提速要求先1张候选，基本清晰、正面端正、身份可辨即可保存；仅严重身份/结构/不可读才补，不为细手指、微装备、微角重复。每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：元末，项目主体约1336–1363；每人只用本稿具体阶段。约年只作时代与视觉年龄参照，不能覆盖小说化生平。 身份、年龄、生命态、器物依最新本地角色/名录/剧情；原稿标记待考仍保留，未新浏览外网或声称指定版本终校。元末军伍、散人、和尚各循本稿服制，不套后世明清官服；历史原型身份与小说画像分开。具体衣色、器型细节、面部写实转译及静立姿态属于本次美术落实。直率急性只用眼神、嘴角和摊掌表达，不丑化或荒诞化；中年宽圆矮壮为原创识别，不冒称原著精确身高。

图像输入使用边界：第一输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。 第二输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。

完整排除项：不要文字、汉字、伪字、题款、标签、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件、蕾丝、高跟鞋；不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词；不要动漫大眼、低幼化、统一网红锥子脸、丰唇滤镜、偶像磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、夸张前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、汉式交领左衽、水平镜像、明代官服补子、清式剃发长辫、顶戴花翎、马蹄袖、旗装或大拉翅；不要额外人物、多视图、分格、脸部特写框、多余肢体或手指、粘连手指、错接手腕、手物融合、悬空装备、断裂弯曲剑刃、短于剑刃的鞘、失重衣料；不要大面积破衣、血腥特写、裸露、透明服装、色情化、伤残丑化、畸形健美肌肉、发光兵器、龙形能量、仙法光翼、法阵、强逆光泛光、具体剧情场景或清晰建筑或裁断头足与兵器端点。专项排除：乾坤一气袋、布袋和尚、滑稽小丑、流涎呆傻、侏儒化、夸张肥胖、酒醉跌倒和杂耍道具。 保留工具原有溯源标识与元数据。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

FINAL POSE CHECK: FRONT-FACING, head upright, eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt. Respect identity and age, intact skin and clothing, correct stage and props.
```

## 排除项

不要文字、汉字、伪字、题款、标签、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件、蕾丝、高跟鞋；不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词；不要动漫大眼、低幼化、统一网红锥子脸、丰唇滤镜、偶像磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、夸张前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、汉式交领左衽、水平镜像、明代官服补子、清式剃发长辫、顶戴花翎、马蹄袖、旗装或大拉翅；不要额外人物、多视图、分格、脸部特写框、多余肢体或手指、粘连手指、错接手腕、手物融合、悬空装备、断裂弯曲剑刃、短于剑刃的鞘、失重衣料；不要大面积破衣、血腥特写、裸露、透明服装、色情化、伤残丑化、畸形健美肌肉、发光兵器、龙形能量、仙法光翼、法阵、强逆光泛光、具体剧情场景或清晰建筑或裁断头足与兵器端点。专项排除：乾坤一气袋、布袋和尚、滑稽小丑、流涎呆傻、侏儒化、夸张肥胖、酒醉跌倒和杂耍道具。 保留工具原有溯源标识与元数据。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhoudian__ch04_prime_base.prepared.json`。
