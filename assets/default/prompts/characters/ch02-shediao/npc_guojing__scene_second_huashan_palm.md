---
asset_id: por_npc_guojing__ch02_youth_scene_second_huashan_palm
subject_id: npc_guojing
name: 郭靖
book: ch02_shediao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_second_huashan_palm.png
manifest: assets/default/character/male/ch02/manifest.yaml
asset_variant: scene
scene_key: second_huashan_palm
scene_title: 华山论剑·厚重掌势
stage: 第40回第二次华山论剑，射雕终幕青年郭靖；已经历七公、周伯通与九阴历练。
references:
- path: assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_grassland_double_eagle.png
  use: 未来郭靖本人新写实首图身份参考。只有该目标PNG已真正生成保存、实际查看且manifest realism_revision=user_character_realism_20261001核实后才可使用；路径存在或旧版本PNG不代表依赖满足，本record不声称未来新图已生成/已查看。只继承青年郭靖骨相、神态与体格，衣装、动作和持物按本场，不继承弓箭或草原。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核SHA256=4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，manifest realism_revision=user_character_realism_20261001且candidate；只参考自然肤质、连续人体体积/光影与完整衣料的渲染质量。严禁复制萧峰脸、胡须、宽大体型、头巾、披氅、掌势或背景龙，人物身份由本场另定。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已查看的项目男性基线，仅低饱和色卡，不作为人物身份或人物笔触样板；不继承令狐冲的脸、抹额、剑、站姿，也不继承纸感侵入皮肤、碎墨或粗糙布料处理。原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看，仅参考背景水墨山水、轻淡晕染与留白；人物、脸、女性衣装、发饰与人像画法均不借用，纸纹水墨不能侵入人物本体。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 郭靖 · 人物写实修正

## 人物与阶段

- subject_id：npc_guojing
- book：ch02_shediao
- gender：male
- age_variant：youth
- scene_title：华山论剑·厚重掌势
- scene_key：second_huashan_palm
- stage：第40回第二次华山论剑，射雕终幕青年郭靖；已经历七公、周伯通与九阴历练。

## 本轮人物写实规范

作者最新人物美观写实修正：华山论剑·厚重掌势；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_guojing__ch02_youth_scene_second_huashan_palm/prompt-c7429f60aa38d69780df3a820b1c64a50b875b909cbc237d7c438e20fc0690d8.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一张必须是已经生成保存、实际查看并核实新写实revision的郭靖大漠首图，只保持同一青年人物核心骨相与体格，本场重新设计衣装动作器物，不继承弓箭与草原；旧路径中的初版图不满足身份依赖。第二张萧峰只供自然人体皮肤、连续光影与完整布料的渲染质量，不借其脸、胡须或体型；第三张男性基线仅色卡；第四张女子图仅背景水墨留白。

郭靖，《射雕英雄传》，华山论剑·厚重掌势。
阶段：第40回第二次华山论剑，射雕终幕青年郭靖；已经历七公、周伯通与九阴历练。
人物、完整衣装与动作：保持青年郭靖核心骨相，双臂健全，稳沉立于山石，重心下扎，一掌向前迎势、另一手护身，从脚底至腰胯肩背形成完整发力。眼神坦荡沉着，表现长期习武后的成熟技艺，不把年龄画成神雕中年。 射雕终幕青年衣装：苍青交领右衽长衣、深色外襟和窄腰带、深灰长裤、结实布靴，黑发整齐束起。山风只掀起连续完整的下摆，布料与皮肤连贯光影、轮廓清楚；没有甲胄、官帽、中年长须或破损布条。
器物：双手空手出掌，无弓、刀、打狗棒；用袖势与少量碎尘体现力量，不用实体光龙遮住手。
背景：华山高处裸岩、淡云和远峰，清峻的高手切磋气氛。无襄阳守军、蒙古金帐或中年将领甲胄。 只在人物后方淡云留白处添加浅淡、不闭合墨龙弧线，象征降龙十八掌；非实体龙，与人物清楚分离，不侵入其皮肤衣料。
场景重心：华山淡云之后有一段不闭合、低对比的浅淡墨龙作为降龙十八掌象征；墨龙只在背景，不接入手臂，不遮脸手，不切碎人物轮廓。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重；神雕重剑场明确保留一只完整神雕，射雕场保留远处目标双雕。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：不命名为接某人三百招，不宣称此时郭靖已胜尽五绝。 仍是射雕青年骨相；成熟武学不等于神雕中年年龄。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。 墨龙为用户授权的艺术表达，不是小说中的真实生物。 本场依赖本人首图的新写实版本，必须核实实际PNG及manifest realism_revision=user_character_realism_20261001；同路径旧图不得视作已满足。

排除项：不要实体金龙、鳞甲怪兽、发光龙眼或满屏特效，不让背景浅墨龙变成人物衣服纹理；不要兵器、甲胄或三百招文字。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要实体金龙、鳞甲怪兽、发光龙眼或满屏特效，不让背景浅墨龙变成人物衣服纹理；不要兵器、甲胄或三百招文字。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_guojing__ch02_youth_scene_second_huashan_palm.prepared.json`。
