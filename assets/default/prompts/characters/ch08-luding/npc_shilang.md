---
asset_id: por_npc_shilang__ch08_elder_navy_base
subject_id: npc_shilang
name: 施琅
book: ch08_luding
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch08/por_npc_shilang__ch08_elder_navy_base.png
manifest: assets/default/character/male/ch08/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 施琅 · 人物写实修正

## 人物与阶段

- subject_id：npc_shilang
- book：ch08_luding
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次文本原创本人脸；正面头直眼水平，完整写实人物与浅水墨背景。按 FAST 先1候选，清晰正面可辨即用；只有严重身份/结构/不可读才补，轻微手指装备角度集中记录，原始PNG native2:3，仍candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_shilang__ch08_elder_navy_base/prompt-24851783a6f7c80f9a7674c9a44ecd6936cd40d61ff314d5b0bf8c65643ec227.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 施琅. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Do not claim this original face is a verified original-game portrait or actor likeness.

身份与阶段：施琅（npc_shilang），《鹿鼎记》ch08_luding。台湾战事与宣旨通道相关的清水师将领，取1683年前后任务窗口

年龄与体型：年长水师将领男性，按1621年出生与1683前后本图窗口约六十二岁；不沿用早期郑氏部将青年阶段。厚背、粗糙大手与真实中老年体重，久经海风的皮肤和稍松但稳实的身体。

原创本人面容：独立原创宽长脸、较高额头、坚实宽下颌，颧部深折痕与海风日晒纹理，直而粗的鼻梁、略宽鼻翼、紧闭中等厚嘴唇。眼窝稍深、锐利务实而不凶恶，灰黑短须修整齐，鬓角灰发明显；与冯锡范瘦长冷脸、吴六奇满颊方脸区分。

服制与发式：清初水师将官行装：剃额，灰黑细辫整齐垂束，低调素军帽；深蓝右衽军袍、暗灰轻棉甲背心及小护肩、朴素腰带、防滑软底靴。服饰结实完整，不捏造具体顶戴品级、花翎或补子，不画明式全发官冠或现代海军制服。

正面姿态与器物：一个人头直眼水平的完整正面站姿，双足踏实。仅一柄普通柳叶腰刀完全入鞘，刀鞘与弯刃长度相配。左手持闭合无字军务卷，右手自然扶腰带；双手、卷、刀鞘与衣服清晰分离。无望远镜、六分仪、舰炮、军舰甲板或水师群像。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份与阶段依当前本地角色稿、名录、story 和 chapter；项目处于清初语境；官军与内地汉人剃额细辫、郑氏归清前明式全发例外、藏传僧人光头各依本人的完整主稿，不通用禁辫或统一服制。人物阶段依本稿专门边界。所有具体五官、服色选款、器物形制细部和静立展示都是原创美术落实；原稿待考照留，不冒称已逐字终校小说或精确历史复原。作者指定1998《鹿鼎记》本人参考优先；当前尚无本机已验证本人图可输入，游戏审计只记录缺口、不能用game替代指定TV。按本轮明确配角授权采用文字原创脸，不冒充原版游戏或演员本人、不拿别人头像代替，也不声称该角色在所有游戏版本从无头像。两张输入都不是本人身份参考，保留原项目基线 candidate/approved 状态。 按本图1683前后台湾水师窗口约62岁，项目全章48–69岁不是本图任意抽取范围；不移用早年效郑阶段。 确切须貌、军服细制与惯用兵器仍待考；一柄普通腰刀和无字军务卷为主稿视觉补足，不声称史实随身物已验证。仅短时战役／任务同行，不改变其正式军职。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；本配角没有可靠本人身份图输入，明确文字原创面孔；不要冒充原版游戏脸或演员本人，不借其他游戏角色、演员或基线脸；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要青年脸、现代海军帽、军衔肩章、现代望远镜、六分仪、蒸汽军舰、欧式板甲、长枪炮械或甲板场景；不要戴不明品级花翎。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, body, impairment and narrative stage; do not straighten a described hunchback; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；本配角没有可靠本人身份图输入，明确文字原创面孔；不要冒充原版游戏脸或演员本人，不借其他游戏角色、演员或基线脸；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要青年脸、现代海军帽、军衔肩章、现代望远镜、六分仪、蒸汽军舰、欧式板甲、长枪炮械或甲板场景；不要戴不明品级花翎。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_shilang__ch08_elder_navy_base.prepared.json`。
