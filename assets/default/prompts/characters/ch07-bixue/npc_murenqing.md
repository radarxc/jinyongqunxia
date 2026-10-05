---
asset_id: por_npc_murenqing__ch07_base
subject_id: npc_murenqing
name: 穆人清
book: ch07_bixue
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch07/por_npc_murenqing__ch07_base.png
manifest: assets/default/character/male/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 穆人清 · 人物写实修正

## 人物与阶段

- subject_id：npc_murenqing
- book：ch07_bixue
- gender：male
- age_variant：elder

## 本轮人物写实规范

华山世俗掌门，约1643年前后授艺和门规裁断；神剑仙猿是绰号而非动物造型。长白须、清高红润老貌，不将少许精神矍铄误画成年轻人；普通佩剑为现稿美术補足。 正面头直眼水平，完整精细写实人物、水墨仅背景，先1个原始PNG候选待审核；轻微瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_murenqing__ch07_base/prompt-3892ab1ebdafa732c112aa8d20cea1d1247cb08d528f3c81d636e33b079069a0.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 穆人清. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender project palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Establish the independent written face and proper stage below.

身份与阶段：穆人清（npc_murenqing），《碧血剑》ch07_bixue。华山掌门、神剑仙猿，约1643年前后授艺与门规裁断阶段。

年龄与体型：70岁以上的自然老年男性视觉档，具体数字是项目美术范围不是原著确岁。身材高而清瘦、脊背稳正，面色温润略红，眉眼与颈部有自然老人纹理，不画成中年或病弱驼背。

原创本人面容：本人原创清长脸，窄而高的额部、略外展但清晰的颧骨、长而不尖的下颌。白眉较长而平展，眼裂中等、双眼亮而沉稳，眉眼之间留有空间；鼻梁长直、鼻翼窄中有肉，嘴线宽而沉静。长白须从上唇与下颌自然分束垂到胸前，唇部边界仍清楚，白发和颧侧皮肤保持完整。与木桑的狭窄鼻眼与诙谐浅笑不同，穆人清眉额舒展、脸更清高端肃；神剑仙猿名号绝不变成猿猴耳脸。

服制与发式：明末华山世俗宗师，青灰右衽直身长袍、灰白护领、窄布绦、布裤与黑布鞋；白发束髻，素方巾收拢，不戴道冠。衣物完整不透明、领胸腰腹遮蔽，剪裁和缝线清楚，少量宽缓褶有真实重力；旧衣仅以柔和材质表现，不画破洞碎布。汉族服式交领以本人左襟压右襟为准，不水平镜像；三人分别保持世俗宗师、道人、商旅式衣装，不混淆。

正面姿态与器物：全身正面对镜站立、头直眼水平，双足稳落。右手在胸前轻触白须末端且指与须分开，左手自然垂身侧。本人左腰（观者右侧）普通中国直剑完全入朴素长鞘，小横格、鞘长足容剑身、挂带真实连腰带，鞘尾完整可见。青灰世俗直身长袍、白发束髻与朴素方巾；不戴木桑式道冠，长须不吞没手。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：书界为明末，华山授艺约1633–1643，当前成人线约1643–1644；具体仅取各角色已注明阶段，不从后续鹿鼎继承反推此前年龄和生死。人物角色、生命状态及器物按当前本地角色稿/名录/剧情；未新核外网或指定小说版本，不把原稿待考概括升级为核实事实。具体五官、衣饰选款、色彩、器物形制、伤疤布局及静立手势均为本次原创美术落实。华山世俗掌门，约1643年前后授艺和门规裁断；神剑仙猿是绰号而非动物造型。长白须、清高红润老貌，不将少许精神矍铄误画成年轻人；普通佩剑为现稿美术補足。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。 不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。 不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。 不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。 不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。 不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。 不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。 不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。 不要猴脸、猿身、兽耳、道士法冠、仙人光环、清式辫发、青年无皱纹脸或病弱佝偻。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, real anatomy, impairment and narrative stage; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。 不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。 不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。 不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。 不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。 不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。 不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。 不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。 不要猴脸、猿身、兽耳、道士法冠、仙人光环、清式辫发、青年无皱纹脸或病弱佝偻。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_murenqing__ch07_base.prepared.json`。
