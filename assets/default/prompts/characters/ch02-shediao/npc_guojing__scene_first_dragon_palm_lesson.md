---
asset_id: por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson
subject_id: npc_guojing
name: 郭靖
book: ch02_shediao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson.png
manifest: assets/default/character/male/ch02/manifest.yaml
asset_variant: scene
scene_key: first_dragon_palm_lesson
scene_title: 江南初授·亢龙有悔
stage: 南归后，第12回洪七公初授降龙掌；尚未登桃花岛学习左右互搏，不写当场十八掌全部大成。
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
- scene_title：江南初授·亢龙有悔
- scene_key：first_dragon_palm_lesson
- stage：南归后，第12回洪七公初授降龙掌；尚未登桃花岛学习左右互搏，不写当场十八掌全部大成。

## 本轮人物写实规范

作者最新人物美观写实修正：江南初授·亢龙有悔；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson/prompt-75e5134bd91bb5a3ed7b41567df80361acc8a03aa71c3d302426ec7a48f049cd.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一张必须是已经生成保存、实际查看并核实新写实revision的郭靖大漠首图，只保持同一青年人物核心骨相与体格，本场重新设计衣装动作器物，不继承弓箭与草原；旧路径中的初版图不满足身份依赖。第二张萧峰只供自然人体皮肤、连续光影与完整布料的渲染质量，不借其脸、胡须或体型；第三张男性基线仅色卡；第四张女子图仅背景水墨留白。

郭靖，《射雕英雄传》，江南初授·亢龙有悔。
阶段：南归后，第12回洪七公初授降龙掌；尚未登桃花岛学习左右互搏，不写当场十八掌全部大成。
人物、完整衣装与动作：与首场同一青年郭靖，双臂健全，认真练掌，前后脚承重清楚，腰胯带动一掌推出，另一手收势蓄力。眼神专注、神态质朴，表现初学领会，尚无成熟宗师睥睨。面容真实细腻、光影连续，年龄与首场相近。 初到江南的青年旅装：完整浅灰青交领右衽布衫、深褐窄腰带、束口长裤和平底布靴，收敛袖口适合练掌。黑发半束后整齐收拢，干净年轻面容。布料有真实厚度、明确剪裁和连贯缝边，少量自然褶皱，不加污渍、起毛或破损。
器物：双手空着；没有弓箭、打狗棒或漂浮秘籍，不画成同时持武器与出掌。
背景：江南行旅的朴素林间空地，淡树影和可站立地面，可留洪七公画外示范的空间。以衣袖和少量气流墨痕表现发力，不生成实体神龙。
场景重心：江南淡树影、双空手与认真领会的青年神态；这是初授，不能以夸张巨龙表达十八掌全成。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重；神雕重剑场明确保留一只完整神雕，射雕场保留远处目标双雕。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：本场表现学习和领会，后期华山场才表现掌法成熟。 不能把降龙掌授艺提前到大漠射雕场；掌势构图属于美术补足。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。 本场依赖本人首图的新写实版本，必须核实实际PNG及manifest realism_revision=user_character_realism_20261001；同路径旧图不得视作已满足。

排除项：不要弓箭、打狗棒、刀剑、左右互搏、十八掌全部大成、额外洪七公人物、巨龙或全身能量。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要弓箭、打狗棒、刀剑、左右互搏、十八掌全部大成、额外洪七公人物、巨龙或全身能量。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_guojing__ch02_youth_scene_first_dragon_palm_lesson.prepared.json`。
