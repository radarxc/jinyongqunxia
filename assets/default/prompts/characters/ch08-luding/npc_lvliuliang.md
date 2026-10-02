---
asset_id: por_npc_lvliuliang__ch08_prime_base
subject_id: npc_lvliuliang
name: 吕留良
book: ch08_luding
gender: male
age_variant: prime
tier: B
output: assets/default/character/male/ch08/por_npc_lvliuliang__ch08_prime_base.png
manifest: assets/default/character/male/ch08/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 吕留良 · 人物写实修正

## 人物与阶段

- subject_id：npc_lvliuliang
- book：ch08_luding
- gender：male
- age_variant：prime

## 本轮人物写实规范

1669士人变体，不提前使用后期出家，不在1683后当活人投放。医理仍待考，不能凭名录疑项增加医生身份；不用后世文字狱受刑现场。本轮以已实际查看的男性令狐冲基线替代原稿男性萧峰基线，只作同一项目男性色卡柔光，绝不传脸型年龄衣服；仍candidate。 正面头直眼水平，完整精细写实人物、水墨仅背景，先1个原始PNG候选待审核；轻微瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_lvliuliang__ch08_prime_base/prompt-c2985de61682040dfe74f24010213c4bc6c14152c093f8182bf4a6a41936a675.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body character portrait for a Chinese wuxia game of 吕留良. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender project palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Establish the independent written face and proper stage below.

身份与阶段：吕留良（npc_lvliuliang），《鹿鼎记》ch08_luding。1669年前后明史案前史与文献支线的在世士人。

年龄与体型：1669前后约40岁的成熟壮年男性（1669−1629近似），中等偏瘦体格、轻浅成熟眼纹；黑发小髭短须，无老年白眉、无预设剃度。

原创本人面容：原创偏短椭圆脸、略高而圆的额，细长眉平缓展开、眉间较宽，真实大小的椭圆眼裂、眼距中等，眼神细致专注。鼻梁较短直、鼻尖圆钝、鼻翼窄，嘴偏小但不儿童化，上唇线清楚、嘴角平而严肃；整洁小黑髭及一小束短下须，两颊干净。下颌柔和而有成年骨量、圆短下巴，轻鼻唇纹，不套顾炎武窄长骨架或黄宗羲宽厚白须脸。

服制与发式：清初江南汉族士人素衣，灰石绿右侧掩襟长袍、暗褐短褂、米灰里领，窄布带与布鞋；剃额细辫、素小帽，衣边完整；此图取士人身份不预设剃度。衣物完整不透明、领胸腰腹遮蔽，剪裁和缝线清楚，少量宽缓褶有真实重力；旧衣仅以柔和材质表现，不画破洞碎布。汉地僧袍和汉式掩襟以穿着者左襟压右襟、向本人右侧合拢为准；僧人剃度光头与世俗士人剃额细辫依本稿分别保留，不以同一禁项覆盖，不水平镜像。

正面姿态与器物：正面站定、头颈竖直眼水平，双脚稳实、一足可稍后但身体不侧转。左手低持一本完全合拢无字线装书，右手轻扶腰侧唯一闭合无字卷袋，卷袋以短绳实际系腰带，手指布袋边界清楚。灰石绿右侧掩襟长袍、暗褐短褂、素小帽及剃额细辫；无医箱针具药材、无僧衣光头、无侠客剑。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：书界为清初康熙，主体1669–1690，但每位仅用本稿具体阶段。三士人选1669前后，索菲娅明确1682前后成年阶段而不是开局童年；公历相减是项目近似视觉岁数，不是逐日周岁或虚岁考定。和尚、民间士人和俄式贵族发式服装分开，不能用通用禁清辫覆盖本角色。人物角色、生命状态及器物按当前本地角色稿/名录/剧情；未新核外网或指定小说版本，不把原稿待考概括升级为核实事实。具体五官、衣饰选款、色彩、器物形制、伤疤布局及静立手势均为本次原创美术落实。1669士人变体，不提前使用后期出家，不在1683后当活人投放。医理仍待考，不能凭名录疑项增加医生身份；不用后世文字狱受刑现场。本轮以已实际查看的男性令狐冲基线替代原稿男性萧峰基线，只作同一项目男性色卡柔光，绝不传脸型年龄衣服；仍candidate。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景或清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要耄耋白眉白须、僧装光头、太医官服、针灸针、医箱、侠客剑、清官补服、纸上文字或拟真历史肖像临摹。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, real anatomy, impairment and narrative stage; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景或清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要耄耋白眉白须、僧装光头、太医官服、针灸针、医箱、侠客剑、清官补服、纸上文字或拟真历史肖像临摹。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_lvliuliang__ch08_prime_base.prepared.json`。
