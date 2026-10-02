---
asset_id: por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson
subject_id: npc_xiaolongnv
name: 小龙女
book: ch03_shendiao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.png
manifest: assets/default/character/female/ch03/manifest.yaml
asset_variant: scene
scene_key: ancient_tomb_sparrow_lesson
scene_title: 古墓授艺·天罗雀影
stage: 第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看并核对manifest哈希的female王语嫣基线，仅作温润肤色、低饱和女装与冷暖色卡；不继承王语嫣的脸、年龄外貌、发饰、衣装、站姿或旧人物水墨笔法，原approved状态不改。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看的新萧峰写实样图，PNG SHA256=4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，manifest realism_revision=user_character_realism_20261001，candidate不变。仅参考自然肤质、连续人体光影体积、完整布料和清楚轮廓的绘制品质；绝不借用男性脸、胡须、眉骨、下颌、体型、深色衣装、掌势、龙影或少室山背景，不让女性男性化。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户图，仅参考背景淡墨山水、空间晕染与留白；完全忽略图中人物、面容、发饰、首饰、衣装、体态及人物笔法，背景墨痕与纸纹不得侵入人物本体。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 小龙女 · 人物写实修正

## 人物与阶段

- subject_id：npc_xiaolongnv
- book：ch03_shendiao
- gender：female
- age_variant：youth
- scene_title：古墓授艺·天罗雀影
- scene_key：ancient_tomb_sparrow_lesson
- stage：第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。

## 本轮人物写实规范

作者最新人物美观写实修正：古墓授艺·天罗雀影；独立女主面容、自然肤质、连贯光影、完整剪裁衣料；水墨只用于背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson/prompt-c0273574727802ddd1365a27da487301c074410b5800ff600bc5150392568961.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

参考顺序：第一张女性王语嫣基线仅提供低饱和色卡，不提供面容或身份；第二张萧峰新写实样图仅示范自然肤质、连续光影、人体体积和完整布料的渲染品质，严禁复制男性面孔、胡须、宽颌、肩胸体型、深色服饰与掌势；第三张用户图仅提供背景水墨空间，不借其中女子。依下文独立塑造本人的脸和气质，不套任何参考人物。

人物：小龙女（npc_xiaolongnv），《神雕侠侣》，独立经典场景《古墓授艺·天罗雀影》。
阶段：第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。
身份与动作：为小龙女独立设计清雅美丽的成年青年面容：修长而不过窄的鹅蛋脸，额面与颧颊有自然体积，平直舒展的细眉，清澈沉静的中等大小长眼形，鼻梁线条清楚柔和，唇形自然饱满适度，下颌完整而不尖削。眼神专注，有自己的判断，清冷而有生命感；面部有细腻自然肤质和连贯光影，不苍白成纸片。身形修长匀称、肩颈舒展，成年自然比例，不低幼、不性感化；不复制黄蓉的俏皮眉眼，也不套王语嫣或演员的五官。 小龙女双臂健全，完整站立、双足着地，肩颈安静舒展；双掌轻巧分合、掌袖方向有清楚节奏，控制少量普通麻雀的活动范围。眼神专注沉静，以实际示范表达师父的武学与判断，不使能量法术，不添加杨过到画内。
服饰与材质：素白不透明右衽长衫、自然垂坠的白色齐腰长裙、窄白布腰带和平底素布鞋；以柔和真实阴影和极浅冷灰体积分清衣片，不在衣料内加水墨或纸纹。乌黑长发以窄白布带简洁束起，余发顺垂。双手戴完整素白贴手五指手套，指尖、手腕与袖口边界清楚；衣服缝边完整，不加华丽花簪、粉纱披帛或珠串耳坠。
器物：双手不持兵器，少量普通麻雀围绕掌势作为捕雀教学意象；不画一对白雕、仙鸟或由手心发出的鸟形能量。手套可保留项目素白贴手表现，不遮掌势。
背景：古墓练功石室或相连门前的淡石壁、入口与少量光线，少年杨过可在画外学习；不画花丛内功合练或卧床画面。

人物绘制要求：优美而可信的写实手绘国风插画，面骨、五官、双手和全身结构细致自然；柔和左上光在脸、皮肤和衣料上形成连续光影与坚实体积。皮肤不透纸，衣料密实完整、有明确剪裁，少量宽而有分量的衣褶顺重力和动作连接，领襟袖口下摆有连续缝边。所有人物轮廓干净清楚，人物外的背景才使用淡墨晕染、留白和低对比场景轮廓；背景不能侵入脸、手、衣服和鞋，动物与器物也保留可读的完整结构。朴素旧衣依然完整可穿；只有本场明确的乔装灰痕或病容保留，其余不增加污渍、风化和破损。

构图交付：仅一位完整女主人物、单视图，竖幅2:3，目标2048×3072 PNG，工具原生实际尺寸如实保存；不透明暖浅灰底，不生成透明棋盘格。头顶、双手、双腿、双鞋、衣摆及器物端点完整入画并留自然边距，坐姿也完整呈现身体与足部；真实承重与正常关节，器物握持和挂接可追踪。汉式交领保持穿着者左襟压右襟，不镜像。衣物完全遮蔽，不性感化；英雄气来自眼神、判断与行动，不靠破损和华丽装备。具体姿势、剪裁、配色和场景简化为美术补足，不冒称原著固定画面。

情节与考据边界：雀数在本地图鉴仍待考，画少量代表性雀影是场景简化，不宣称已逐只还原原著计数。 不将手套、淑女剑、金铃索基础组合全数套入早期授艺；不提前画淑女剑或左右互搏双剑。 单人示范姿势与雀群位置是美术补足，保持清楚的授艺情节。 本record仅为独立场景设计，不覆盖基础立绘；不代表已生成、已保存或已审批，成图仍为candidate并由实际执行结果登记。 作者最新人物写实修正：人物本体美观写实、自然肤质、完整布料和连续光影；水墨仅在背景。剧情乔装和伤病按本场保留，不以破损画法代替。此record只声明新方向，实际成图须查看验证后才计本轮candidate，不自行approved。

完整排除项：不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要淑女剑、金铃索、双剑、左右互搏姿势、白雕、仙鸟、鸟形能量或多人教学群像；不要华丽花髻和珠串。
```

## 排除项

不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要淑女剑、金铃索、双剑、左右互搏姿势、白雕、仙鸟、鸟形能量或多人教学群像；不要华丽花髻和珠串。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.prepared.json`。
