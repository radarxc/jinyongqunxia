---
asset_id: por_npc_guierniang__ch08_elder_base
subject_id: npc_guierniang
name: 归二娘
book: ch08_luding
gender: female
age_variant: elder
tier: A
output: assets/default/character/female/ch08/por_npc_guierniang__ch08_elder_base.png
manifest: assets/default/character/female/ch08/manifest.yaml
references:
- path: assets/default/character/female/ch07/por_npc_guierniang__ch07_prime_base.png
  use: 第一输入是已实际查看并核验原始字节的本人归二娘 ch07项目生成候选（por_npc_guierniang__ch07_prime_base），不是原版游戏头像或影视演员照片。只保留本人骨相与眉眼鼻唇相对关系，按ch08年龄显著成熟/老化；本稿年龄、发式、衣装、器物和正面头直眼平要求覆盖参考。本人ch07中年照护阶段仅供骨相。本图是保护成年归钟、计划刺驾而尚无致命伤的老年女拳师；灰白低髻、木簪、深褐短衣与靛灰裙裤、空手低位拳掌。去掉前界药包及患儿照护器物，不携剑杖篮筐。 参考仍candidate，不转为approved。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入只取暖浅灰不透明纸底、极淡低对比水墨远山及留白；不取王语嫣的人物、五官、年龄、身体、发式、白青衣饰、头倾、亭阁花枝。墨迹纸纹不得侵入目标人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 归二娘 · 人物写实修正

## 人物与阶段

- subject_id：npc_guierniang
- book：ch08_luding
- gender：female
- age_variant：elder

## 本轮人物写实规范

本人ch07中年照护阶段仅供骨相。本图是保护成年归钟、计划刺驾而尚无致命伤的老年女拳师；灰白低髻、木簪、深褐短衣与靛灰裙裤、空手低位拳掌。去掉前界药包及患儿照护器物，不携剑杖篮筐。 正面头颈竖直、双眼水平，完整写实人物与极淡水墨背景；先1个原始PNG候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_guierniang__ch08_elder_base/prompt-b15475e06d117532c17a52121467dad0746e12943f40f01f558accf13ac68815.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 归二娘. Image 1 is THIS SAME PERSON’S saved ch07 project-generated candidate, actually viewed and source-hash verified. It is NOT a TV actor photograph or an original-game portrait. Use only this person’s facial proportions and individual identity; age the face naturally and visibly to the ch08 stage specified below. Do not keep the earlier age, hairstyle, costume, equipment, body pose or background. Image 2 supplies ONLY pale ink-wash background; never copy its woman or face. There is no unrelated character palette portrait among the inputs. Current age, attire and upright front-facing pose take priority over both reference images.

身份与阶段：归二娘（npc_guierniang），《鹿鼎记》ch08_luding。华山老年女拳师、与归辛树共同保护归钟并准备刺驾的阶段。

年龄与体型：名录老年，确岁待考；比碧血阶段年长，保留真实衰老；宽短脸、清晰颧骨与眼角皱纹，灰白眉发，唇线坚定；体格紧实、肩臂有力、手指关节粗实，目光锐利关切；美感来自端正骨相与尊严，不年轻化。年龄及身体状态优先于造型，不使用固定头身和占高强行拉伸。

本人面容辨识：实际查看第一参考的本人宽椭圆至方圆脸、较宽额部、近乎平直浓眉、偏长自然眼裂、饱满颊面、宽圆而坚实的下颌下巴、中等圆厚鼻头、较宽嘴形及上薄下适中的双唇。保持本人这些比例关系，明确老化为灰白眉发、松弛适度眼睑、额眼颊口连续的老年纹理，仍有结实厚实骨架，不改成尖锥脸或年轻少女。目光锐利关切；不把丈夫男性面容性转为本人。

服制与发式：清初汉族老妇习武便装，暗褐右衽长袄、靛灰长裙内配长裤、窄布带和软底布鞋；花白头发盘成牢固低髻，深色布巾与木簪固定，无贵妇珠饰。衣料完整不透明、衣边整洁连续，少量宽缓受力褶，不添破洞和碎布；汉式交领穿着者左襟覆右襟，斜襟向穿着者右侧闭合，不水平镜像。

正面姿态与器物：全身正面站立，头颈竖直、双眼水平，步幅稍开、重心稳而不蹲伏，肩背不塌、不侧转。两手空手：本人右掌在侧前低位半开、左手自然收于腰侧，手腕和粗实指关节清楚，姿势保护本人前方空间，不咬牙怒吼。无剑、钢爪、拐杖、针线篮、药包或丈夫儿子同框。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书清初康熙主体窗口1669–1690，当前图只取已注明阶段，不把全书所有年份混成单一年龄。身份阶段以本地role/catalog/story/chapter为依据，原著概括和具体发饰器型仍待指定版本核，不冒称新查原文。本人五官连续性依据已保存的本人ch07候选，年龄适配、衣饰选款和静态手势仍为美术落实，不冒称原版游戏或影视本人。鹿鼎老年女拳师、保护已成年归钟并筹划刺驾，尚无致命伤；与ch07中年患儿照护阶段不同，灰白低髻和老年皮肤必须保留。三人各自生命状态，不能合成一人或把妻子当背景。

参考边界：第一输入是已实际查看并核验原始字节的本人归二娘 ch07项目生成候选（por_npc_guierniang__ch07_prime_base），不是原版游戏头像或影视演员照片。只保留本人骨相与眉眼鼻唇相对关系，按ch08年龄显著成熟/老化；本稿年龄、发式、衣装、器物和正面头直眼平要求覆盖参考。本人ch07中年照护阶段仅供骨相。本图是保护成年归钟、计划刺驾而尚无致命伤的老年女拳师；灰白低髻、木簪、深褐短衣与靛灰裙裤、空手低位拳掌。去掉前界药包及患儿照护器物，不携剑杖篮筐。 参考仍candidate，不转为approved。 第二输入只取暖浅灰不透明纸底、极淡低对比水墨远山及留白；不取王语嫣的人物、五官、年龄、身体、发式、白青衣饰、头倾、亭阁花枝。墨迹纸纹不得侵入目标人物。

完整排除项：不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景及清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要青年美人脸、瘦弱少女腰、浓妆、尖下巴、恶婆婆漫画脸、无依据拐杖、针线篮、长剑、丈夫或儿子同框、死亡伤口。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制背景参考王语嫣或任何别人的脸、年龄、身体、发型、衣装、道具和姿势；本人ch07第一参考仅保留骨相身份，不沿用前界年龄、服制和器物，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清初服制和剃额细辫、女道髻、僧人剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

FINAL POSE CHECK: FRONT-FACING full-body, head and neck UPRIGHT, forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Preserve this person’s own age-adapted facial identity and narrative stage. Preserve ONLY the same-person identity from image 1; make the specified ch08 age and stage clearly readable.
```

## 排除项

不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景及清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要青年美人脸、瘦弱少女腰、浓妆、尖下巴、恶婆婆漫画脸、无依据拐杖、针线篮、长剑、丈夫或儿子同框、死亡伤口。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制背景参考王语嫣或任何别人的脸、年龄、身体、发型、衣装、道具和姿势；本人ch07第一参考仅保留骨相身份，不沿用前界年龄、服制和器物，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清初服制和剃额细辫、女道髻、僧人剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_guierniang__ch08_elder_base.prepared.json`。
