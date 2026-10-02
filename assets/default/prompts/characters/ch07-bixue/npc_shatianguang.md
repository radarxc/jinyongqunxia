---
asset_id: por_npc_shatianguang__ch07_base
subject_id: npc_shatianguang
name: 沙天广
book: ch07_bixue
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch07/por_npc_shatianguang__ch07_base.png
manifest: assets/default/character/male/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 沙天广 · 人物写实修正

## 人物与阶段

- subject_id：npc_shatianguang
- book：ch07_bixue
- gender：male
- age_variant：prime

## 本轮人物写实规范

首次文本原创本人脸；正面头直眼水平，完整写实人物与浅水墨背景。按 FAST 先1候选，清晰正面可辨即用；只有严重身份/结构/不可读才补，轻微手指装备角度集中记录，原始PNG native2:3，仍candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_shatianguang__ch07_base/prompt-938cd517f4bd64a33c9a016e7b929caaff73976e733469596d1f10a0a4292271.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 沙天广. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Do not claim this original face is a verified original-game portrait or actor likeness.

身份与阶段：沙天广（npc_shatianguang），《碧血剑》ch07_bixue。泰山群雄人物，会盟与护饷期间的江湖行动者，出海之前

年龄与体型：四十岁上下的中年视觉默认，非原著确岁；肩臂有力、身材壮实略有腹部，重心稳健，无断臂等未指定伤残。

原创本人面容：独立原创宽而偏圆的脸，低额配低浓眉，眼裂中等、下眼睑略厚、目光直向前方且豪爽中警觉；鼻梁短实、鼻头宽圆，两颊厚实，短络腮胡由鬓角沿下颌连至下巴，黑须少许早灰，口宽唇厚适中。晒成暖麦色的皮肤保留眼角浅纹；既不是焦公礼方腮灰短须老者，也不是令狐冲俊瘦青年。

服制与发式：明末北方行旅粗厚布装，暗赭右衽短外衫、深灰完整内衣和长裤、普通布带、绑腿布靴；黑发束髻以深色头巾收住，不是光头，不添海盗眼罩或清式辫子。

正面姿态与器物：正面双足稳立，头直、双眼水平看向前方，右手于腰胸之间持半展开的阴阳铁扇，暗铁扇骨、扇轴与手指握持关系清楚，扇面朝外且低于脸，左手自然垂于身侧。扇缘端点全部入画，无飞射暗器；不以普通单刀、纸扇、绳索或沙通天铁桨替代。取陆地会盟时完整单人静立，不画船景。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份与阶段依当前本地角色稿、名录、story 和 chapter；项目服制按明末约1630–1645项目范围与主体1640–1645语境，不声称原著明示朝代；人物阶段依本稿专门边界。所有具体五官、服色选款、器物形制细部和静立展示都是原创美术落实；原稿待考照留，不冒称已逐字终校小说或精确历史复原。当前已下载原版 game 语料与本机已登记影视参考没有可靠本人图，按本轮明确配角授权采用文字原创脸，不冒充原版游戏或演员本人、不拿别人头像代替，也不声称该角色在所有游戏版本从无头像。两张输入都不是本人身份参考，保留原项目基线 candidate/approved 状态。 阴阳铁扇识别沿主稿，在线语料称阴阳宝扇；指定版本扇面、扇骨和机括细节仍待考，暗铁色展示为原创。 姓名严格沙天广，不混沙通天的断臂、光头或铁桨；出海/舟务配置不推定船长官衔。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。；不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。；不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。；不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。；不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。；不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。；不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。；不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。；不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。；不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。；不要以普通单刀、绳索或纸扇替代阴阳铁扇，不画飞射暗器；不要沙通天的铁桨或断臂形象、光头水怪、海盗眼罩、清式辫发、船景、群雄合影或肥胖丑角化。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, body, impairment and narrative stage; do not straighten a described hunchback; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。；不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。；不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。；不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。；不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。；不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。；不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。；不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。；不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。；不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。；不要以普通单刀、绳索或纸扇替代阴阳铁扇，不画飞射暗器；不要沙通天的铁桨或断臂形象、光头水怪、海盗眼罩、清式辫发、船景、群雄合影或肥胖丑角化。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_shatianguang__ch07_base.prepared.json`。
