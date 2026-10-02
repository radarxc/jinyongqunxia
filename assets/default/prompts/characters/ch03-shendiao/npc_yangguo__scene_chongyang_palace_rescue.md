---
asset_id: por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue
subject_id: npc_yangguo
name: 杨过
book: ch03_shendiao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue.png
manifest: assets/default/character/male/ch03/manifest.yaml
asset_variant: scene
scene_key: chongyang_palace_rescue
scene_title: 重阳宫·重剑护龙
stage: 第27–28回重阳宫救援，小龙女陷于围攻之后，独臂青年杨过携重剑赶到；尚未十六年之约。
references:
- path: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.png
  use: 未来杨过本人新写实双臂青年首图身份参考。必须真正生成保存、实际查看并核实manifest realism_revision=user_character_realism_20261001后使用；旧路径PNG或初版candidate不满足此依赖，本record未声称未来新图已生成/已查看。仅继承核心眼鼻口骨相与黑发，当前右臂已断且青年/壮年按本场，不能继承双臂、竹棒或原衣装。
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

# 杨过 · 人物写实修正

## 人物与阶段

- subject_id：npc_yangguo
- book：ch03_shendiao
- gender：male
- age_variant：youth
- scene_title：重阳宫·重剑护龙
- scene_key：chongyang_palace_rescue
- stage：第27–28回重阳宫救援，小龙女陷于围攻之后，独臂青年杨过携重剑赶到；尚未十六年之约。

## 本轮人物写实规范

作者最新人物美观写实修正：重阳宫·重剑护龙；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue/prompt-56e8b61723d46065ca8c66b8409b716e11589c9100982b11fe40f6c88cb456b5.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一张必须是已经生成保存、实际查看并核实新写实revision的杨过双臂青年首图，只保持同一人核心骨相、眼鼻口关系与黑发。当前断右臂与本场年龄必须重新落实，不能继承首图双臂、竹棒、衣装或早期轻快表情；旧路径中的初版不能代替该新身份依赖。第二张萧峰仅供自然肤质、完整体积、连贯光影与衣料的写实渲染，不借其脸、胡须、体型或配饰。第三张男性基线只色卡，第四张用户女子图只背景墨韵。

杨过，《神雕侠侣》，重阳宫·重剑护龙。
阶段：第27–28回重阳宫救援，小龙女陷于围攻之后，独臂青年杨过携重剑赶到；尚未十六年之约。
人物、完整衣装与动作：与首场同一青年杨过，左手玄铁剑守住身前，身体半侧护向画外小龙女方向，双足真实支撑，眼神急切而坚决。独臂青年保持俊朗灵气和有担当的神采，不能突然变成萧峰式粗犷壮汉。 青年杨过完整苍灰青右衽长衣、墨灰腰束、窄左袖、深色长裤与布靴，黑发简束。右侧空袖完整收束于右腰，内部没有前臂形状；服装剪裁清楚，行动态由大褶与下摆方向体现，不加赶路污损、碎裂衣边、披风或甲胄。 伤残侧别必须明确：缺失人物自身右臂，只有完整左臂和一只左手可用。近正面右空袖在画面左侧、左手在画面右侧，按人物自身解剖左右，不水平镜像。空袖不是隐藏的右手，不加义肢，不展示创口或额外指定断端。
器物：仅左手一柄玄铁重剑；右袖空着。不能同一只左手既握剑又搂抱完整人物，不能凭构图生成第二只手。
背景：终南山重阳宫的淡道观屋檐、石阶和门柱，保留救援中的空间张力。小龙女可在画外，不强制加入第二个完整人物。
场景重心：独臂青年左手重剑、道观淡轮廓和朝画外护人的动作；没有第二个人物或同一左手同时握剑拥抱。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：选救援切片，不把成婚仪式、重伤求医和重剑格斗同时拼入一幅。 保护方向与站姿是原创构图；不改写小龙女的主动战斗，也不把她画成不相干受害人。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。 本场依赖本人首图的新写实版本，必须核实实际PNG及manifest realism_revision=user_character_realism_20261001；同路径旧图不得视作已满足。

排除项：不要右手、右前臂、义肢、断左臂或镜像；不要双手握剑、左手同时拥抱持剑，不能加婚服、白鬓、面具、金甲或第二人物。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要右手、右前臂、义肢、断左臂或镜像；不要双手握剑、左手同时拥抱持剑，不能加婚服、白鬓、面具、金甲或第二人物。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yangguo__ch03_youth_scene_chongyang_palace_rescue.prepared.json`。
