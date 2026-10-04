---
asset_id: por_npc_liyan__ch07_base
subject_id: npc_liyan
name: 李岩
book: ch07_bixue
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch07/por_npc_liyan__ch07_base.png
manifest: assets/default/character/male/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 李岩 · 人物写实修正

## AR-82 当前定稿要求

只去掉上身棕色整片胸甲和两肩甲片，以现有青布书生长衫布料自然补齐胸前与肩部，书生服色、右衽交领，保留腰带、儒巾、头脸发须、手持卷轴、腰剑、手脚、下半衣袍以及原站姿。是闯营日常接待，不穿披甲将官服。

以上为当前原著核对后的要求，覆盖下文旧版中与之冲突的服饰、器物、伤残、光线和体态描述。

## 人物与阶段

- subject_id：npc_liyan
- book：ch07_bixue
- gender：male
- age_variant：prime

## 本轮人物写实规范

闯军军纪劝谏、军饷民生推进而尚未遇害；图像不代表已改命或脱离闯军。无字军报和普通剑为本稿美术补足，不自封原著专兵。 正面头直眼水平，完整精细写实人物、水墨仅背景，先1个原始PNG候选待审核；轻微瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_liyan__ch07_base/prompt-de276a4219f786e7fc34d56325ff7f91aea65d65ff2e06c506ebb78cbaf00340.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 李岩. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender project palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Establish the independent written face and proper stage below.

身份与阶段：李岩（npc_liyan），《碧血剑》ch07_bixue。闯军将领兼谋士，在军纪劝谏、军饷与民生线推进而尚未遇害的阶段。

年龄与体型：30–40岁成年壮年男性视觉默认，原著确岁生卒待考；身材挺拔匀称、肩背有军中力量，既非消瘦弱书生也非李自成粗壮体型。

原创本人面容：原创端正清长方脸、额部开阔平直，颧颊略薄但饱满健康，下颌轮廓平正、下巴圆方。舒展较细的平眉，眼裂细长自然、眼神温和坚定、眼距中等偏宽；鼻梁端直中等窄，鼻头圆钝，嘴宽中等、唇线清晰平稳。细短黑髭及少量短颏须，轻微眼角纹；有文士清正气但保留成年的硬朗骨量，与袁崇焕更瘦更老的高颧有别。

服制与发式：明末军中士人服，灰青右衽长直身、短式暗褐布面护身甲、窄布带、深裤布靴；束髻戴素方巾，衣装兼顾文士与骑行。衣物完整不透明、领胸腰腹遮蔽，剪裁和缝线清楚，少量宽缓褶有真实重力；旧衣仅以柔和材质表现，不画破洞碎布。汉式服装以本人左襟压右襟为准；满洲军政人物严格沿本稿早期剃发细辫、马蹄袖与箭衣服式，不一刀切禁辫或套汉式发髻，不水平镜像。

正面姿态与器物：正面身体端直而放松、头颈竖直眼水平。一手低拿唯一完全卷起并系闭的无字军报，另一手自然垂在本人左腰的佩剑旁。普通中国直剑完整入长鞘，小横格与挂带清楚，不拔剑、不露末局匕首；灰青军中长直身、短暗褐布面护甲、素方巾与布靴，不加羽扇、法器或地图大卷。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：书界为明末转清，项目范围1630–1645；每位仅用本稿的独立年份与生死状态。袁崇焕限1630以前生前军务追忆、皇太极不晚于1643死讯，不从鹿鼎小说或历史后世倒套本期衣冠与年龄。公历相减所得约岁不是逐日周岁或虚岁考定。人物角色、生命状态及器物按当前本地角色稿/名录/剧情；未新核外网或指定小说版本，不把原稿待考概括升级为核实事实。具体五官、衣饰选款、色彩、器物形制、伤疤布局及静立手势均为本次原创美术落实。闯军军纪劝谏、军饷民生推进而尚未遇害；图像不代表已改命或脱离闯军。无字军报和普通剑为本稿美术补足，不自封原著专兵。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。 不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。 不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。 不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。 不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。 不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。 不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。 不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。 不要羽扇纶巾套型、术士法阵、血匕首、自尽动作、帝王服、清式辫发、鸦片枪或现代地图。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, real anatomy, impairment and narrative stage; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。 不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。 不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。 不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。 不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。 不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。 不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。 不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。 不要羽扇纶巾套型、术士法阵、血匕首、自尽动作、帝王服、清式辫发、鸦片枪或现代地图。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_liyan__ch07_base.prepared.json`。

## 原著依据

- 《碧血剑》四《矫矫金蛇剑，翩翩美少年》：“身穿书生服色”（https://xuges.com/WUXIA/jinyong/bxj/021.htm）
- AR-82 返修约束：只去掉上身棕色整片胸甲和两肩甲片，以现有青布书生长衫布料自然补齐胸前与肩部，书生服色、右衽交领，保留腰带、儒巾、头脸发须、手持卷轴、腰剑、手脚、下半衣袍以及原站姿。是闯营日常接待，不穿披甲将官服。
