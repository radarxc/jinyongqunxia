---
asset_id: por_npc_kasili__ch12_youth_prepalace_base
subject_id: npc_kasili
name: 喀丝丽
book: ch12_shujian
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch12/por_npc_kasili__ch12_youth_prepalace_base.png
manifest: assets/default/character/female/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shujian/classic1976-20261002-prep_audit/kasili-1976-yuanan-thepaper.jpg
  use: 第一参考为1976 TVB《书剑恩仇录》余安安饰香香公主的具名近像，仅取本人可见脸型、眉眼关系、鼻唇与圆收下颌。已实际view_image并经独立source审。目标青年确岁待考、素净衣装、编辫覆小白头巾和入宫前生命态按当前role；不复制冠饰、珠串、红衣领、妆容强度、斜头、背景、水印或影视其他阶段。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二参考为root真实派生的无人纯背景，仅取暖浅灰纸底、极淡灰蓝远山及宽阔留白；已实际view_image，无脸、人物、衣装或器物，不提供身份。内部派生图不是原用户图，不是approved；水墨只在背景。
status: ready
realism_revision: user_identity_pose_20261001
---

# 喀丝丽 · 人物写实修正

## 人物与阶段

- subject_id：npc_kasili
- book：ch12_shujian
- gender：female
- age_variant：youth

## 本轮人物写实规范

喀丝丽：1976 TVB余安安本人可见脸第一，纯背景第二；回疆相识、被俘入宫前仍存活，青年确岁待考，素白完整长衣长裙及小白头巾，双手无兵器；正面头直眼平、清醒温柔，不成人化或性感化。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_kasili__ch12_youth_prepalace_base/prompt-d312b0a784cfdfd4fcd0018185a36f378ea5f74fce6576a285faf396e7683d2f.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line; camera level, chin neutral, gaze forward. Keep head centered over torso and shoulders relaxed. NO head tilt. NO Dutch angle. Ignore the source head turn, tilt and composition.

Create one refined REALISTIC hand-painted Chinese wuxia character illustration with this individual facial identity. Natural youthful skin and solid continuous anatomy, clear eyes and hands, complete opaque garments, clean silhouette, a few broad weight-bearing folds and restrained fabric detail. Soft upper-left diffuse light keeps skin, white cloth and pale backdrop distinct. Ink wash and paper texture belong ONLY to the background, never to the figure. This is a newly composed painted illustration, not a photograph, screenshot, collage, 3D render or comic.

ORDERED INPUTS: Image 1 is the documented 1976 TVB Kasili / Princess Fragrance facial identity only. Image 2 is person-free background only. Never average faces or borrow an unrelated person. 第一参考为1976 TVB《书剑恩仇录》余安安饰香香公主的具名近像，仅取本人可见脸型、眉眼关系、鼻唇与圆收下颌。已实际view_image并经独立source审。目标青年确岁待考、素净衣装、编辫覆小白头巾和入宫前生命态按当前role；不复制冠饰、珠串、红衣领、妆容强度、斜头、背景、水印或影视其他阶段。 第二参考为root真实派生的无人纯背景，仅取暖浅灰纸底、极淡灰蓝远山及宽阔留白；已实际view_image，无脸、人物、衣装或器物，不提供身份。内部派生图不是原用户图，不是approved；水墨只在背景。

CHARACTER AND STAGE: 喀丝丽（香香公主） / npc_kasili / por_npc_kasili__ch12_youth_prepalace_base。《书剑恩仇录》ch12，乾隆回疆与陈家洛相识、被俘送京入宫之前的非战斗阶段；此时仍活着，绝非宫中示警、自伤死亡、香冢、幽灵或改命后同行。项目主线1753–1759只作时代区间，不硬指定本图确年。

AGE AND BODY: age_variant=youth；项目名录仅写青年，具体年龄待考，不以演员年龄或新闻概括填确岁。保留清新年轻面貌、自然纤细但健康的身体比例；全身完全着衣，不强调胸腰臀，不以成熟艳丽或性感姿态成人化。

VISIBLE FACIAL IDENTITY: 沿第一图本人建立柔和略长的鹅蛋脸：颊部自然饱满、下颌有轻微转折而下巴圆润收束；细而清楚的弧眉，眉眼距离与眼间距沿源图可见关系；明亮而自然的较大眼睛，避免夸张动漫放大；鼻梁较直、鼻尖自然圆润，清楚而不过度饱满的唇形，唇角轻柔但不过度露齿笑。把源图轻转重画为完全正面，五官中线竖直，双眼水平。保留本人可辨面容与自然肤质，不复制美颜磨皮、浓眼线或艳红口脂；原图柔化且微细骨点不可量测，不臆造精确骨点。神态温柔、清澈而清醒，有自主意愿，不媚视或服从。

CLOTHING AND HAIR: 乾隆回疆少女的素净暖白不透明长袖长衣与长裙，浅灰青窄边，胸颈、肩、手臂与身体完全覆盖，衣身自然宽松而有连续完整剪裁；下装覆盖足踝但两只平底软鞋清楚可见。黑发编辫，素白小头巾覆头后，轻软但不透明，完整面部与双眼露出；不采用剧照冠饰、珠串、红色衣领或清宫旗头。普通布料完整清洁可穿，衣缘不碎不破；浅灰青边与细微暖冷明暗让白衣从浅背景分离。若有汉式交领，穿着者左襟压右襟，不镜像。

POSE AND EMPTY HANDS: 两脚自然稳落地，躯干、头颈正对观者，肩颈放松且头绝不随手倾斜。右手指尖在肩旁轻扶头巾边，不遮面、不勾拽衣领；左手自然松垂，手腕与手指连接可信。两手不握任何独立物品，不持兵器、经书、乐器或花束；没有刀剑鞘、血书、自伤器物和宫廷道具。头巾和素衣是此阶段视觉锚，香气不画成烟、光环、花瓣或蝴蝶。

COMPOSITION AND DELIVERY: one person, one view, complete full body from headscarf top to both shoes, both hands and whole hem comfortably inside the frame. Native vertical 2:3 PNG; target 2048×3072, truthfully accept and record actual native 2:3 size without resizing, crop or re-encoding. Opaque pale warm-grey background with extremely faint ink mountains and empty space, modest soft contact shadow; no narrative set. FAST1: first ONE candidate; additional output only for serious identity, structural or readability failure. All outputs remain candidate pending review, never automatically approved.

FACT BOUNDARIES: 原著体貌、白衣具体描述与本阶段衣装仍按role标待考；本轮未核三联/广州指定版权版、未新增访问小说正文，不捏造引文或页码。影视图片只证角色身份，不证明小说服饰、年龄、族群史实或剧情确切时点。头巾裁制、浅灰青窄边、正面静站和手势均原创美术落实。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。 不得借其他角色面孔、现代演员照片或另一剧版；允许第一图明确1976本人五官，只重画面部辨识，不复制剧照构图、服装道具、完整截图或具体画作，不使用画师姓名作风格词。 不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。 不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。 不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。 不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。 不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、复杂山水建筑、分格或多视图。 不要宫装、后妃冠服、枷锁、血书、匕首自伤、香冢或幽灵；不要香气光环、舞女服、露腰露肩、湿透衣料、成人化性感身段；不要沿用霍青桐的翠羽黄衫和兵器。 不要 head tilt、Dutch angle、歪颈、倾斜眼线、侧脸、侧身回眸、俯仰头、隐藏双眼。不要冠饰、珠帘、繁饰红白影视衣领、浓眼线、艳红唇膏或成熟妩媚表情；不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣边、碎布条、斑驳污脸或过密细褶。不要年龄伪精确，不依据演员年龄改成成年性感身段；不要沐浴、湿衣、透明面料或水边裸露场景。

FINAL CHECK: FRONT-FACING, head upright, both eyes horizontally level, camera level. NO head tilt. NO Dutch angle. Preserve her individual face, modest youthful appearance, full intact clothing and alive prepalace stage.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印；不去除或伪造工具自带的溯源标识。 不得借其他角色面孔、现代演员照片或另一剧版；允许第一图明确1976本人五官，只重画面部辨识，不复制剧照构图、服装道具、完整截图或具体画作，不使用画师姓名作风格词。 不要现代服装、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件、民国旗袍或中山装。 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感。 不要日式服饰、日本刀、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代或族群混搭、汉式交领左衽、水平镜像、晚清大拉翅、无依据的官阶补子或夸张冠冕。 不要多余人物、多余肢体、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、无受力点的飘带。 不要断裂弯曲剑刃、柄鞘错轴、容不下刀剑的短鞘、重复兵器、遮住关键识别物或裁断头足及器物端点。 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉；保留人物原有伤残、年龄与体型。 不要发光兵器、法阵、光翼、龙形能量、粒子气功、强逆光、强泛光、复杂山水建筑、分格或多视图。 不要宫装、后妃冠服、枷锁、血书、匕首自伤、香冢或幽灵；不要香气光环、舞女服、露腰露肩、湿透衣料、成人化性感身段；不要沿用霍青桐的翠羽黄衫和兵器。 不要 head tilt、Dutch angle、歪颈、倾斜眼线、侧脸、侧身回眸、俯仰头、隐藏双眼。不要冠饰、珠帘、繁饰红白影视衣领、浓眼线、艳红唇膏或成熟妩媚表情；不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣边、碎布条、斑驳污脸或过密细褶。不要年龄伪精确，不依据演员年龄改成成年性感身段；不要沐浴、湿衣、透明面料或水边裸露场景。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_kasili__ch12_youth_prepalace_base.prepared.json`。
