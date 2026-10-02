---
asset_id: por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader
subject_id: npc_huangrong
name: 黄蓉
book: ch02_shediao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader.png
manifest: assets/default/character/female/ch02/manifest.yaml
asset_variant: scene
scene_key: junshan_beggar_leader
scene_title: 君山轩辕台·执棒定帮争
stage: 第27回君山丐帮大会；已获洪七公传承，正在揭破杨康阴谋、确立帮主身份；铁掌峰受伤以前。
references:
- path: assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_scene_young_beggar_disguise.png
  use: 待生成并实际查看本人首场的新写实PNG后才可使用；路径不存在时不得登记生成，已有旧文件也不满足本轮身份依赖。执行者必须重新读取并核对该PNG与manifest的SHA一致、realism_revision=user_character_realism_20261001、status=candidate或approved，再实际查看新结果；本record未声称未来图已生成或已看。 仅继承黄蓉本人灰痕和帽子之下的面骨、眼鼻口关系、机敏目光和轻盈体格；本场卸去首场的灰痕、布帽、男装、包袱与食肆背景，乔装灰痕不是固有肤色。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看的新萧峰写实样图，PNG SHA256=4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，manifest realism_revision=user_character_realism_20261001，candidate不变。仅参考自然肤质、连续人体光影体积、完整布料和清楚轮廓的绘制品质；绝不借用男性脸、胡须、眉骨、下颌、体型、深色衣装、掌势、龙影或少室山背景，不让女性男性化。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看并核对manifest哈希的female王语嫣基线，仅作温润肤色、低饱和女装与冷暖色卡；不继承王语嫣的脸、年龄外貌、发饰、衣装、站姿或旧人物水墨笔法，原approved状态不改。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户图，仅参考背景淡墨山水、空间晕染与留白；完全忽略图中人物、面容、发饰、首饰、衣装、体态及人物笔法，背景墨痕与纸纹不得侵入人物本体。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 黄蓉 · 人物写实修正

## 人物与阶段

- subject_id：npc_huangrong
- book：ch02_shediao
- gender：female
- age_variant：youth
- scene_title：君山轩辕台·执棒定帮争
- scene_key：junshan_beggar_leader
- stage：第27回君山丐帮大会；已获洪七公传承，正在揭破杨康阴谋、确立帮主身份；铁掌峰受伤以前。

## 本轮人物写实规范

作者最新人物美观写实修正：君山轩辕台·执棒定帮争；独立女主面容、自然肤质、连贯光影、完整剪裁衣料；水墨只用于背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader/prompt-f66a61115f304963ccb9aa18c8db9ab4fd66a150728f31bf3f4428166e63a8bf.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

实际输入顺序：第一张必须是已经通过本轮写实revision核验并实际查看的本人首场身份图，仅保持同人核心骨相和体格；仅继承黄蓉本人灰痕和帽子之下的面骨、眼鼻口关系、机敏目光和轻盈体格；本场卸去首场的灰痕、布帽、男装、包袱与食肆背景，乔装灰痕不是固有肤色。 第二张萧峰图仅参考自然肤质、连续人体光影和完整衣料的绘制品质，禁止借男性脸、胡须、眉骨、宽颌、肩胸体型、衣装、掌势和龙影。第三张女性王语嫣基线仅为低饱和色卡，不继承脸或旧笔法；第四张用户图只提供背景墨韵，不继承其中人物。

人物：黄蓉（npc_huangrong），《射雕英雄传》，独立经典场景《君山轩辕台·执棒定帮争》。
阶段：第27回君山丐帮大会；已获洪七公传承，正在揭破杨康阴谋、确立帮主身份；铁掌峰受伤以前。
身份与动作：为黄蓉独立设计清丽而有辨识度的少女面容：小巧但不尖削的鹅蛋脸，额颊自然饱满，柔和而清楚的下颌，细长眉的眉尾轻挑，中等大小明亮杏眼，鼻梁精致自然，薄而清楚的唇形。眼中有机敏、观察和自主判断，带克制的灵动；脸部保留真实骨相、细腻自然肤质与轻微不对称。体格轻巧健康，肩背协调，手足比例可信，不画婴幼儿比例、成人性感曲线或神雕中年母亲。她与小龙女、王语嫣的面容和气质不同。 黄蓉站在轩辕台前，步幅灵巧而重心稳实；右手低握竹棒作封挡后的收势，左手向画外会众清楚示意。目光锐利自信，肩背打开，表现她识破阴谋、主持局面的判断力，不画加冕式仰头或僵硬亮兵器。
服饰与材质：浅黄白右衽窄袖衣、淡青短外衫、青灰齐腰长裙、平底布鞋与朴素腰束；黑发收束清楚，仅少量低调发饰。完整衣料裁剪利落，领襟袖口下摆有清楚缝边，以明晰衣形表现少女帮主的自信。软猬甲内穿，不靠金冠、首饰堆叠或外露尖刺体现威信。
器物：一根细长青绿竹质打狗棒，竹节、握持和端点清晰；软猬甲保持内穿，不改成外露倒刺盔甲。 本次选择右手低握竹棒，左手示意；棒端完整，无第二根棒或其他兵器。
背景：君山轩辕台与淡湖面，会场只作简化层次；会众若出现，仅是远景淡影，不挤占主角。

人物绘制要求：优美而可信的写实手绘国风插画，面骨、五官、双手和全身结构细致自然；柔和左上光在脸、皮肤和衣料上形成连续光影与坚实体积。皮肤不透纸，衣料密实完整、有明确剪裁，少量宽而有分量的衣褶顺重力和动作连接，领襟袖口下摆有连续缝边。所有人物轮廓干净清楚，人物外的背景才使用淡墨晕染、留白和低对比场景轮廓；背景不能侵入脸、手、衣服和鞋，动物与器物也保留可读的完整结构。朴素旧衣依然完整可穿；只有本场明确的乔装灰痕或病容保留，其余不增加污渍、风化和破损。

构图交付：仅一位完整女主人物、单视图，竖幅2:3，目标2048×3072 PNG，工具原生实际尺寸如实保存；不透明暖浅灰底，不生成透明棋盘格。头顶、双手、双腿、双鞋、衣摆及器物端点完整入画并留自然边距，坐姿也完整呈现身体与足部；真实承重与正常关节，器物握持和挂接可追踪。汉式交领保持穿着者左襟压右襟，不镜像。衣物完全遮蔽，不性感化；英雄气来自眼神、判断与行动，不靠破损和华丽装备。具体姿势、剪裁、配色和场景简化为美术补足，不冒称原著固定画面。

情节与考据边界：这里正式持棒有阶段依据，不倒推早期乔装与厨艺场也持棒。 本地洪七公在场条件仍待考，不凭空画成他亲自在台上交棒。 不是宫廷加冕，也不是神雕中年帮主母亲造型。 本record仅为独立场景设计，不覆盖基础立绘；不代表已生成、已保存或已审批，成图仍为candidate并由实际执行结果登记。  作者最新人物写实修正：人物本体美观写实、自然肤质、完整布料和连续光影；水墨仅在背景。剧情乔装和伤病按本场保留，不以破损画法代替。此record只声明新方向，实际成图须查看验证后才计本轮candidate，不自行approved。 本场依赖por_npc_huangrong__ch02_youth_scene_young_beggar_disguise的新写实首图：必须实际查看新结果，且PNG/manifest哈希一致、manifest realism_revision=user_character_realism_20261001；仅存在旧版同路径文件不算满足依赖。

完整排除项：不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要乔装灰痕布帽男装、粗大金属权杖、第二根棒、外穿倒刺甲、金冠加冕、铁掌伤后病容或神雕中年母亲外形。
```

## 排除项

不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要乔装灰痕布帽男装、粗大金属权杖、第二根棒、外穿倒刺甲、金冠加冕、铁掌伤后病容或神雕中年母亲外形。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader.prepared.json`。
