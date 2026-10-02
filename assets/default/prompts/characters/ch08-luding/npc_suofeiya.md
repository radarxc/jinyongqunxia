---
asset_id: por_npc_suofeiya__ch08_youth_regent_base
subject_id: npc_suofeiya
name: 索菲娅
book: ch08_luding
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch08/por_npc_suofeiya__ch08_youth_regent_base.png
manifest: assets/default/character/female/ch08/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 索菲娅 · 人物写实修正

## 人物与阶段

- subject_id：npc_suofeiya
- book：ch08_luding
- gender：female
- age_variant：youth

## 本轮人物写实规范

成年莫斯科政变掌权外交阶段，非开局童年；仅图外罗刹/雅克萨相符窗口，不常驻中原。金棕发蓝灰眼、圆领宽袍为本地美术补足，未经服饰史专项复原，不冒称1998剧中演员脸或历史肖像。 正面头直眼水平，完整精细写实人物、水墨仅背景，先1个原始PNG候选待审核；轻微瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_suofeiya__ch08_youth_regent_base/prompt-ed1c6e8d35c582dd22e46f05512a90400cb118f41a5a1dbf5d5868e88fc0e8b3.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body character portrait for a Chinese wuxia game of 索菲娅. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender project palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Establish the independent written face and proper stage below.

身份与阶段：索菲娅（npc_suofeiya），《鹿鼎记》ch08_luding。罗刹国莫斯科政变与掌权外交线的成年青年贵族女性。

年龄与体型：1682前后约25岁的成年青年东欧女子（1682−1657近似），具体幕年与小说时序待考。高大丰满、肩宽胸廓与腰胯丰厚、四肢强健有力量，非1669约12岁的儿童，不以细瘦腿代替高大或嘲弄体型。

原创本人面容：原创东欧成年女性面容：宽圆脸、开阔额头和较实在眉骨、丰厚自然颊肉与宽圆下巴。金棕色自然眉平缓弯起，眼眶稍深、双眼真实中等大小、蓝灰虹膜低饱和不发光、眼距适中。鼻梁较高长、鼻尖圆有体积、鼻翼自然宽度；嘴中等宽、唇峰浅、上下唇自然饱满不丰唇滤镜，唇角平稳有亲和。金棕卷发从软头巾边自然露出，年轻皮肤有正常纹理。明确不复制王语嫣东亚纤窄脸、黑眼黑发或身体，特征是本项目原创选择非历史写真或演员画像。

服制与发式：17世纪俄式贵族完整长衣，灰蓝高领长袖内衣、暗酒红宽松及地外袍、窄幅毛边与少量金属扣饰，头戴简约软质头巾固定卷发，皮鞋；采用圆领前开服制，不强行套汉服交领或旗装。衣物完整不透明、领胸腰腹遮蔽，剪裁和缝线清楚，少量宽缓褶有真实重力；旧衣仅以柔和材质表现，不画破洞碎布。这位东欧成年女子严格采用17世纪俄式圆领前开衣制和素软头巾；不要套汉式右衽、汉族簪髻或清宫旗装。全身衣料厚实完整、不透明，有自然重力。

正面姿态与器物：全身正面端正站立，头颈竖直、双眼水平、下巴自然中性，肩膀舒展，足部稳落不侧转。右手在腰侧低持一份完全折好的无字外交文书，左手在腹腰外侧掌心向下作克制指挥手势，五指掌腕自然。灰蓝高领长袖内衣、暗酒红宽松及地外袍、窄毛边少量金属扣、素软头巾固定卷发与皮鞋完整，无王冠枪械、无汉服腰带或低胸紧身裙。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：书界为清初康熙，主体1669–1690，但每位仅用本稿具体阶段。三士人选1669前后，索菲娅明确1682前后成年阶段而不是开局童年；公历相减是项目近似视觉岁数，不是逐日周岁或虚岁考定。和尚、民间士人和俄式贵族发式服装分开，不能用通用禁清辫覆盖本角色。人物角色、生命状态及器物按当前本地角色稿/名录/剧情；未新核外网或指定小说版本，不把原稿待考概括升级为核实事实。具体五官、衣饰选款、色彩、器物形制、伤疤布局及静立手势均为本次原创美术落实。成年莫斯科政变掌权外交阶段，非开局童年；仅图外罗刹/雅克萨相符窗口，不常驻中原。金棕发蓝灰眼、圆领宽袍为本地美术补足，未经服饰史专项复原，不冒称1998剧中演员脸或历史肖像。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景或清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要东亚同款脸、纸片瘦身、幼童体态、肥胖恶搞、低胸紧身胸衣、露肩艳服、芭蕾裙、18至19世纪宫廷裙、现代王冠、华服旗装、汉式簪髻或现代枪械。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, real anatomy, impairment and narrative stage; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景或清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要东亚同款脸、纸片瘦身、幼童体态、肥胖恶搞、低胸紧身胸衣、露肩艳服、芭蕾裙、18至19世纪宫廷裙、现代王冠、华服旗装、汉式簪髻或现代枪械。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_suofeiya__ch08_youth_regent_base.prepared.json`。
