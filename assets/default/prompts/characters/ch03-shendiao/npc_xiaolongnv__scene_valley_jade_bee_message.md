---
asset_id: por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message
subject_id: npc_xiaolongnv
name: 小龙女
book: ch03_shendiao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message.png
manifest: assets/default/character/female/ch03/manifest.yaml
asset_variant: scene
scene_key: valley_jade_bee_message
scene_title: 绝情谷底·玉蜂寄讯
stage: 十六年分离期间的后段，谷底养伤已经好转，试图借玉蜂传递位置消息；尚未与杨过重逢。
references:
- path: assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.png
  use: 待生成并实际查看本人首场的新写实PNG后才可使用；路径不存在时不得登记生成，已有旧文件也不满足本轮身份依赖。执行者必须重新读取并核对该PNG与manifest的SHA一致、realism_revision=user_character_realism_20261001、status=candidate或approved，再实际查看新结果；本record未声称未来图已生成或已看。 仅继承小龙女本人的清雅成年青年骨相、五官关系与修长体格；不带入首场雀群、教学动作和石室，衣装器物伤病随本场，谷底阶段改用完整树皮纤维衣，面容仍年轻。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看的新萧峰写实样图，PNG SHA256=4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，manifest realism_revision=user_character_realism_20261001，candidate不变。仅参考自然肤质、连续人体光影体积、完整布料和清楚轮廓的绘制品质；绝不借用男性脸、胡须、眉骨、下颌、体型、深色衣装、掌势、龙影或少室山背景，不让女性男性化。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看并核对manifest哈希的female王语嫣基线，仅作温润肤色、低饱和女装与冷暖色卡；不继承王语嫣的脸、年龄外貌、发饰、衣装、站姿或旧人物水墨笔法，原approved状态不改。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户图，仅参考背景淡墨山水、空间晕染与留白；完全忽略图中人物、面容、发饰、首饰、衣装、体态及人物笔法，背景墨痕与纸纹不得侵入人物本体。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "小龙女基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_jueqing_base.png
---

# 小龙女 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。小龙女基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】绝情谷底的淡淡花树、潭水与高峭岩壁，上方留出蜂飞向谷口的空间。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】小龙女，《神雕侠侣》，绝情谷底·玉蜂寄讯。阶段：十六年分离期间的后段，谷底养伤已经好转，试图借玉蜂传递位置消息；尚未与杨过重逢。
【身份参考】随提示词上传的第 1 张图是小龙女本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（清丽的长鹅蛋脸、下颌线柔和，眉毛细长平直、颜色偏淡，眼睛清澈而冷、眼神淡漠出尘，鼻梁细直，唇色极淡，肌肤苍白如雪、几乎没有血色（久居古墓），素面无妆）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】谷底自制的树皮纤维长衣：淡灰白与米白的天然纤维色，织纹细致、衣片密实完整（右衽），朴素腰束与素鞋，黑发用素带整理。
【动作与神情】十六年分离的后段、伤势已经好转：完整站在谷底花树旁，双手轻拢在身前，目送几只玉蜂向上飞去；眼神沉静而有希望（仍是年轻的成年女子，不加皱纹白发）。
【器物】几只小小的玉蜂（不是巨大蜂群或发光灵虫）。
【体态】成年女性的身体比例（约 7 头身），衣着完整端庄、不透明、不暴露、不性感化。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_xiaolongnv
- book：ch03_shendiao
- gender：female
- age_variant：youth
- scene_title：绝情谷底·玉蜂寄讯
- scene_key：valley_jade_bee_message
- stage：十六年分离期间的后段，谷底养伤已经好转，试图借玉蜂传递位置消息；尚未与杨过重逢。

## 本轮人物写实规范

作者最新人物美观写实修正：绝情谷底·玉蜂寄讯；独立女主面容、自然肤质、连贯光影、完整剪裁衣料；水墨只用于背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message/prompt-0401d7a4e5aa972532cc56018954f9fcda5fdc38dfd060637350119286a6c98b.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

实际输入顺序：第一张必须是已经通过本轮写实revision核验并实际查看的本人首场身份图，仅保持同人核心骨相和体格；仅继承小龙女本人的清雅成年青年骨相、五官关系与修长体格；不带入首场雀群、教学动作和石室，衣装器物伤病随本场，谷底阶段改用完整树皮纤维衣，面容仍年轻。 第二张萧峰图仅参考自然肤质、连续人体光影和完整衣料的绘制品质，禁止借男性脸、胡须、眉骨、宽颌、肩胸体型、衣装、掌势和龙影。第三张女性王语嫣基线仅为低饱和色卡，不继承脸或旧笔法；第四张用户图只提供背景墨韵，不继承其中人物。

人物：小龙女（npc_xiaolongnv），《神雕侠侣》，独立经典场景《绝情谷底·玉蜂寄讯》。
阶段：十六年分离期间的后段，谷底养伤已经好转，试图借玉蜂传递位置消息；尚未与杨过重逢。
身份与动作：为小龙女独立设计清雅美丽的成年青年面容：修长而不过窄的鹅蛋脸，额面与颧颊有自然体积，平直舒展的细眉，清澈沉静的中等大小长眼形，鼻梁线条清楚柔和，唇形自然饱满适度，下颌完整而不尖削。眼神专注，有自己的判断，清冷而有生命感；面部有细腻自然肤质和连贯光影，不苍白成纸片。身形修长匀称、肩颈舒展，成年自然比例，不低幼、不性感化；不复制黄蓉的俏皮眉眼，也不套王语嫣或演员的五官。 十六年分离后段，小龙女伤势已经好转，身体健全，外观仍是年轻清雅的成年女子；完整站在谷底花树旁，双手轻拢身前，目送少量玉蜂向上飞去。眼神沉静而有希望，表现主动寻求联系，不因时间流逝强行加入皱纹、白发或衰老体态。
服饰与材质：谷底自制的树皮纤维完整长衣，淡灰白和米白的天然纤维色，朴素腰束与完整素鞋；右衽包合、具体剪裁和鞋形属美术补足。纤维质感细致克制，表面仅少量可信织纹，衣片密实、不透明、合体并有连续收边，不画成树皮碎片贴身、兽皮野人装、树叶服饰或华丽新丝绸。黑发仅用简单素带整理。
器物：少量玉蜂，不画巨大蜂群、蝴蝶或发光灵虫；衣装为谷底以树皮纤维自制的朴素完整衣物，浅色粗细纹理可见但不粗犷成兽皮野人装。不凭旧基础稿加齐淑女剑、金铃索和华丽配饰。
背景：绝情谷底淡花树、潭水与高峭岩壁，上方留出蜂飞向谷口的空间。谷底居所可作轻淡轮廓，不加入杨过重逢人物。

人物绘制要求：优美而可信的写实手绘国风插画，面骨、五官、双手和全身结构细致自然；柔和左上光在脸、皮肤和衣料上形成连续光影与坚实体积。皮肤不透纸，衣料密实完整、有明确剪裁，少量宽而有分量的衣褶顺重力和动作连接，领襟袖口下摆有连续缝边。所有人物轮廓干净清楚，人物外的背景才使用淡墨晕染、留白和低对比场景轮廓；背景不能侵入脸、手、衣服和鞋，动物与器物也保留可读的完整结构。朴素旧衣依然完整可穿；只有本场明确的乔装灰痕或病容保留，其余不增加污渍、风化和破损。

构图交付：仅一位完整女主人物、单视图，竖幅2:3，目标2048×3072 PNG，工具原生实际尺寸如实保存；不透明暖浅灰底，不生成透明棋盘格。头顶、双手、双腿、双鞋、衣摆及器物端点完整入画并留自然边距，坐姿也完整呈现身体与足部；真实承重与正常关节，器物握持和挂接可追踪。汉式交领保持穿着者左襟压右襟，不镜像。衣物完全遮蔽，不性感化；英雄气来自眼神、判断与行动，不靠破损和华丽装备。具体姿势、剪裁、配色和场景简化为美术补足，不冒称原著固定画面。

情节与考据边界：不是断肠崖当日仍未解伤毒的状态；时间经过十六年也不把她画成白发老妇。 原著有蜂翅留讯，但立绘不生成可读的微小汉字，也不画成封信绑在大蜂身上。 树皮衣保持完整、合体、遮蔽，不色情化荒居生活；具体裁制和颜色属于美术补足。 旧稿禁止谷底场景只界定其基础变体，本轮这是独立的谷底阶段方案。 本record仅为独立场景设计，不覆盖基础立绘；不代表已生成、已保存或已审批，成图仍为candidate并由实际执行结果登记。  age_variant采用youth表示本项目名录与章节表的青年外观资产口径（catalog/npcs-ch03-shendiao.md:15、chapters/03-shendiao.md:818）；十六年分离后段写在stage，不据此将面容老化或伪造具体年龄。 本新record纠正local_evidence：原plan引用chapters/03-shendiao.md:817实际指杨过，小龙女年龄依据为818；原plan与source_scene_sha256保持不改，来源哈希仍对应原始计划对象。 作者最新人物写实修正：人物本体美观写实、自然肤质、完整布料和连续光影；水墨仅在背景。剧情乔装和伤病按本场保留，不以破损画法代替。此record只声明新方向，实际成图须查看验证后才计本轮candidate，不自行approved。 本场依赖por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson的新写实首图：必须实际查看新结果，且PNG/manifest哈希一致、manifest realism_revision=user_character_realism_20261001；仅存在旧版同路径文件不算满足依赖。

完整排除项：不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要首场麻雀或古墓石室、淑女剑、金铃索、完整华丽丝绸装、树叶服饰、裸露或破碎树皮拼贴，不加皱纹白发；不要大蜂群、发光灵虫、蜂身绑信、可读翅字或杨过重逢人物。
```

## 排除项

不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要首场麻雀或古墓石室、淑女剑、金铃索、完整华丽丝绸装、树叶服饰、裸露或破碎树皮拼贴，不加皱纹白发；不要大蜂群、发光灵虫、蜂身绑信、可读翅字或杨过重逢人物。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message.prepared.json`。
