---
asset_id: por_npc_zhaobanshan__ch12_elder_base
subject_id: npc_zhaobanshan
name: 赵半山
book: ch12_shujian
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch12/por_npc_zhaobanshan__ch12_elder_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 赵半山 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhaobanshan
- book：ch12_shujian
- gender：male
- age_variant：elder

## 本轮人物写实规范

本次先建立书剑独立原创面容，未来飞狐应继承本人已生成图并作年龄变化；未声称已有本人identity基线。暗器数量和袋型是原稿美术示意，不新增专属武器ID。 正面头直眼水平，完整精细写实人物、水墨仅背景，先1个原始PNG候选待审核；轻微瑕疵不阻塞。 唯一图片输入为无人纯背景；人物本人由具体原创文字脸锚建立，不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhaobanshan__ch12_elder_base/prompt-e312aa4c7265578ae80d2b574c8a02aef4e175f20ca118286939a82c50ec805a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 赵半山. THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

身份与阶段：赵半山（npc_zhaobanshan），《书剑恩仇录》ch12_shujian。中老年男子，红花会三当家、太极门前辈，书剑营救文泰来与接应阶段。

年龄与体型：中老年男子elder，宽胖有力量，颈肩与腰腹丰厚；斑白短须，皮肤自然年龄纹理，不减成瘦青年也不恶搞肥胖。

原创本人面容：独立宽圆脸，额面圆阔、颊肉丰满，颧骨被柔和体积覆盖、下颌方圆宽实。浅弧粗眉灰黑相杂，眉尾平顺；双眼中等大小、上睑微厚，眼角有自然笑纹，水平直视温和。鼻梁不高突而宽正、鼻尖圆厚，嘴宽适中且唇厚自然，闭口微笑不大咧，斑白短须沿上唇和圆下巴整齐生长。清楚可辨的颈部与下颌体积，不能画成佛像、双下巴笑料或尖脸白眉仙翁。

服制与发式：清代汉地江湖前辈的灰褐长袍、深青短褂、窄布带、宽裤与布鞋；剃额、后发成辫、素色小帽，衣料随丰厚体型受力。衣物完整不透明、领胸腰腹遮蔽，剪裁和缝线清楚，少量宽缓褶有真实重力；旧衣仅以柔和材质表现，不画破洞碎布。汉式交领或大襟以本人左襟压右襟为准，不水平镜像。

正面姿态与器物：正面头颈端正，双眼水平直视，肩臂放松、双脚稳定承担丰厚身体。右手松托腰腹前、左手自然下垂，两只手都清楚，正常灵巧指节不结施法印。腰带上有且仅有两个小暗器囊，绑带与缝口清楚；其中一囊仅露一枚手掌尺度的普通暗铁飞镖边角，镖由囊固定而非悬浮，尖端不贴手。没有千臂、佛光、袈裟或太极阵图。

原创人物色调与光线：灰褐袍与深青褂采用低饱和温暖灰棕和青色层次；柔和左上漫射光包覆丰厚圆颊、宽方圆下颌与厚实颈肩，保留厚眼睑、圆厚鼻尖、斑白短须、温和闭口微笑与真实年龄。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：书界主线为清乾隆1753–1759项目期，回忆人物严格依其前史阶段。人物角色、生命状态及器物按当前本地角色稿/名录/剧情；未新核外网或指定小说版本，不把原稿待考概括升级为核实事实。具体五官、衣饰选款、色彩、器物形制、伤疤布局及静立手势均为本次原创美术落实。本次先建立书剑独立原创面容，未来飞狐应继承本人已生成图并作年龄变化；未声称已有本人identity基线。暗器数量和袋型是原稿美术示意，不新增专属武器ID。

参考边界：唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词。 不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。 不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。 不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。 不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。 不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、具体剧情场景或清晰建筑、分格或多视图。 不要瘦削、肌肉夸张或恶搞肥胖；不要千条手臂、佛像光环、袈裟、剃度头或太极光阵；不要把飞狐阶段老化、伤势或他人专属飞轮提前加入。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, real anatomy, impairment and narrative stage; ignore reference poses.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作，不使用画师姓名作风格词。 不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。 不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。 不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。 不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。 不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、具体剧情场景或清晰建筑、分格或多视图。 不要瘦削、肌肉夸张或恶搞肥胖；不要千条手臂、佛像光环、袈裟、剃度头或太极光阵；不要把飞狐阶段老化、伤势或他人专属飞轮提前加入。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhaobanshan__ch12_elder_base.prepared.json`。
