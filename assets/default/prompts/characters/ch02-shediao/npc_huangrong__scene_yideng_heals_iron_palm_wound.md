---
asset_id: por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound
subject_id: npc_huangrong
name: 黄蓉
book: ch02_shediao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound.png
manifest: assets/default/character/female/ch02/manifest.yaml
asset_variant: scene
scene_key: yideng_heals_iron_palm_wound
scene_title: 一灯山居·疗铁掌伤
stage: 第30回，君山接掌之后，铁掌峰受伤、经黑沼指路之后；接受一灯救治，处于虚弱恢复期。
references:
- path: assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_young_beggar_disguise.png
  use: 待生成并实际查看本人首场的新写实PNG后才可使用；路径不存在时不得登记生成，已有旧文件也不满足本轮身份依赖。执行者必须重新读取并核对该PNG与manifest的SHA一致、realism_revision=user_character_realism_20261001、status=candidate或approved，再实际查看新结果；本record未声称未来图已生成或已看。 仅继承黄蓉本人灰痕和帽子之下的面骨、眼鼻口关系、机敏目光和轻盈体格；本场卸去首场的灰痕、布帽、男装、包袱与食肆背景，乔装灰痕不是固有肤色。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看的新萧峰写实样图，PNG SHA256=4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，manifest realism_revision=user_character_realism_20261001，candidate不变。仅参考自然肤质、连续人体光影体积、完整布料和清楚轮廓的绘制品质；绝不借用男性脸、胡须、眉骨、下颌、体型、深色衣装、掌势、龙影或少室山背景，不让女性男性化。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看并核对manifest哈希的female王语嫣基线，仅作温润肤色、低饱和女装与冷暖色卡；不继承王语嫣的脸、年龄外貌、发饰、衣装、站姿或旧人物水墨笔法，原approved状态不改。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户图，仅参考背景淡墨山水、空间晕染与留白；完全忽略图中人物、面容、发饰、首饰、衣装、体态及人物笔法，背景墨痕与纸纹不得侵入人物本体。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "黄蓉基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_bangzhu_base.png
- assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
---

# 黄蓉 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。黄蓉基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】一灯山居的木窗、素墙与淡淡山影；救治者在画外。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】黄蓉，《射雕英雄传》，一灯山居·疗铁掌伤。阶段：第30回，君山接掌之后，铁掌峰受伤、经黑沼指路之后；接受一灯救治，处于虚弱恢复期。
【身份参考】随提示词上传的第 1 张图是黄蓉本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（圆润饱满的鹅蛋脸、下巴圆而小巧，一双灵动的大眼睛黑白分明、眼波流转、眼尾微微上挑，眉毛细长弯弯如蛾眉，鼻梁小巧挺直，嘴唇饱满、嘴角天生上翘带着俏皮狡黠的笑意，肌肤白皙透亮、两颊自然红润，妆容清淡；古灵精怪、聪明伶俐）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】浅暖白右衽内衫、淡青灰外衣、齐腰长裙与布鞋，黑发整齐收拢、金环仍在；衣服完整清洁。
【动作与神情】中了铁掌之伤、正在一灯山居求治：安坐在朴素低榻上，双手空着自然放松，双膝与裙下双脚位置清楚；肩背稍收、面色有些苍白，但眼神清醒坚韧。
【器物】只有低榻或坐席；打狗棒不入画。
【体态】成年女性的身体比例（约 7 头身），衣着完整端庄、不透明、不暴露、不性感化。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_huangrong
- book：ch02_shediao
- gender：female
- age_variant：youth
- scene_title：一灯山居·疗铁掌伤
- scene_key：yideng_heals_iron_palm_wound
- stage：第30回，君山接掌之后，铁掌峰受伤、经黑沼指路之后；接受一灯救治，处于虚弱恢复期。

## 本轮人物写实规范

作者最新人物美观写实修正：一灯山居·疗铁掌伤；独立女主面容、自然肤质、连贯光影、完整剪裁衣料；水墨只用于背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound/prompt-e9403e499f139f6b3bcc549732eee0b981a9b742e618281ff29096e7ddf48c4f.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

实际输入顺序：第一张必须是已经通过本轮写实revision核验并实际查看的本人首场身份图，仅保持同人核心骨相和体格；仅继承黄蓉本人灰痕和帽子之下的面骨、眼鼻口关系、机敏目光和轻盈体格；本场卸去首场的灰痕、布帽、男装、包袱与食肆背景，乔装灰痕不是固有肤色。 第二张萧峰图仅参考自然肤质、连续人体光影和完整衣料的绘制品质，禁止借男性脸、胡须、眉骨、宽颌、肩胸体型、衣装、掌势和龙影。第三张女性王语嫣基线仅为低饱和色卡，不继承脸或旧笔法；第四张用户图只提供背景墨韵，不继承其中人物。

人物：黄蓉（npc_huangrong），《射雕英雄传》，独立经典场景《一灯山居·疗铁掌伤》。
阶段：第30回，君山接掌之后，铁掌峰受伤、经黑沼指路之后；接受一灯救治，处于虚弱恢复期。
身份与动作：为黄蓉独立设计清丽而有辨识度的少女面容：小巧但不尖削的鹅蛋脸，额颊自然饱满，柔和而清楚的下颌，细长眉的眉尾轻挑，中等大小明亮杏眼，鼻梁精致自然，薄而清楚的唇形。眼中有机敏、观察和自主判断，带克制的灵动；脸部保留真实骨相、细腻自然肤质与轻微不对称。体格轻巧匀称，肩背协调，手足比例可信，不画婴幼儿比例、成人性感曲线或神雕中年母亲。她与小龙女、王语嫣的面容和气质不同。 黄蓉安坐朴素低榻，双手空着自然放松，双膝与裙下双脚位置完整可信；肩背稍收、面色适度苍白而清醒。保留铁掌内伤后的疲弱与坚韧，身体仍有连续真实体积，不画健康比武、昏迷暴露或骨瘦病容。
服饰与材质：浅暖白右衽内衫、淡青灰外衣、齐腰长裙与布鞋，黑发整齐收拢。衣料完整、清洁、不透明，有少量自然坐姿大褶，裙下双脚与双膝位置清楚；既不裹成大棉被，也不掀衣展示伤处。伤势只通过适度苍白、收敛的体态表现，不添加撕破血衣。
器物：本次构图只保留朴素低榻或坐席，双手空着，打狗棒不入画。衣物完整不透明，不掀衣展示伤处或软猬甲。
背景：一灯清简山居的木窗、素墙和淡山影，可将救治者留在画外；不锁定未经核实的点穴位置。

人物绘制要求：优美而可信的写实手绘国风插画，面骨、五官、双手和全身结构细致自然；柔和左上光在脸、皮肤和衣料上形成连续光影与坚实体积。皮肤不透纸，衣料密实完整、有明确剪裁，少量宽而有分量的衣褶顺重力和动作连接，领襟袖口下摆有连续缝边。所有人物轮廓干净清楚，人物外的背景才使用淡墨晕染、留白和低对比场景轮廓；背景不能侵入脸、手、衣服和鞋，动物与器物也保留可读的完整结构。朴素旧衣依然完整可穿；只有本场明确的乔装灰痕或病容保留，其余不增加污渍、风化和破损。

构图交付：仅一位完整女主人物、单视图，竖幅2:3，目标2048×3072 PNG，工具原生实际尺寸如实保存；不透明暖浅灰底，不生成透明棋盘格。头顶、双手、双腿、双鞋、衣摆及器物端点完整入画并留自然边距，坐姿也完整呈现身体与足部；真实承重与正常关节，器物握持和挂接可追踪。汉式交领保持穿着者左襟压右襟，不镜像。衣物完全遮蔽，不性感化；英雄气来自眼神、判断与行动，不靠破损和华丽装备。具体姿势、剪裁、配色和场景简化为美术补足，不冒称原著固定画面。

情节与考据边界：这是铁掌内伤，不画成毒伤、箭伤或断肢。 不把山居绑定成大理城；地望按本地待考保留。 旧稿无病容仅适用于受伤以前；本场不能抹掉实际伤势。 坐姿属于美术补足，无光柱、发光经脉或现代医疗物品。 本record仅为独立场景设计，不覆盖基础立绘；不代表已生成、已保存或已审批，成图仍为candidate并由实际执行结果登记。  作者最新人物写实修正：人物本体美观写实、自然肤质、完整布料和连续光影；水墨仅在背景。剧情乔装和伤病按本场保留，不以破损画法代替。此record只声明新方向，实际成图须查看验证后才计本轮candidate，不自行approved。 本场依赖por_npc_huangrong__ch02_youth_scene_young_beggar_disguise的新写实首图：必须实际查看新结果，且PNG/manifest哈希一致、manifest realism_revision=user_character_realism_20261001；仅存在旧版同路径文件不算满足依赖。

完整排除项：不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要乔装灰痕布帽男装、兵器、毒伤特征、箭伤、断肢、露胸治疗、撕裂血衣、现代医疗设备或发光经脉；不抹去该场有据内伤和暂时苍白。
```

## 排除项

不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要乔装灰痕布帽男装、兵器、毒伤特征、箭伤、断肢、露胸治疗、撕裂血衣、现代医疗设备或发光经脉；不抹去该场有据内伤和暂时苍白。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_huangrong__ch02_youth_scene_yideng_heals_iron_palm_wound.prepared.json`。
