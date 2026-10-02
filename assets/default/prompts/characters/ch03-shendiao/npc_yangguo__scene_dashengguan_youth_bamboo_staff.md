---
asset_id: por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff
subject_id: npc_yangguo
name: 杨过
book: ch03_shendiao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.png
manifest: assets/default/character/male/ch03/manifest.yaml
asset_variant: scene
scene_key: dashengguan_youth_bamboo_staff
scene_title: 大胜关·少年扬威
stage: 第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。
references:
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
- scene_title：大胜关·少年扬威
- scene_key：dashengguan_youth_bamboo_staff
- stage：第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。

## 本轮人物写实规范

作者最新人物美观写实修正：大胜关·少年扬威；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff/prompt-6b0a5a191cbb94e4941609167e2e50f7feacee3f3dd01795d767e55662c4aa7e.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

本场独立创作杨过的年轻俊美、灵动英侠身份。第一张萧峰写实样图只供人体皮肤、连续体积光影、清楚轮廓及完整布料的渲染品质；它绝不是杨过身份参考，必须放弃其方阔成熟脸、胡须、壮硕体型、头巾、披氅与掌势。第二张令狐冲男性基线严格仅色卡，不复制其脸。第三张女子图只供背景水墨山水与留白，不借人像、服装或女性面容。杨过的具体独立面骨以下文为准。

杨过，《神雕侠侣》，大胜关·少年扬威。
阶段：第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。
人物、完整衣装与动作：双臂双手完全健全的青年杨过，以轻巧转身和竹棒点出后的收势组成完整全身姿态，目光明亮机敏，带一点临敌从容笑意。独立杨过青年身份：修长清俊而有自然骨量的脸，长眉微扬，明亮灵动的清长眼，秀挺鼻梁，自然放松的唇线，下颌清晰不方阔也不尖锥；干净无须，俊美而有英侠精神，不是萧峰的成熟方脸、胡须与壮硕体格，也不是令狐冲基线脸。修长结实的身体、舒展肩背和轻快步法表现才气与担当。皮肤自然细腻，五官具真实结构而不塑料磨皮。 浅苍青南宋青年江湖长衣，交领右衽、窄袖，墨灰完整布腰带，深色束口长裤和轻便布鞋。长黑发用窄布带半束，无网状抹额、胡须、繁复首饰。朴素衣服即使是旧衣也完整干净、有明确裁片与缝边，修长轻快的剪影来自衣装版型，不靠磨损、毛边、碎带或露肌。
器物：当场借用的丐帮打狗棒，竹质朴素，不是普通自有竹棍，也不代表他担任帮主。仅持这一件兵器，不加玄铁重剑、面具或神雕。
背景：大胜关英雄宴厅的淡柱影和少量席案轮廓，保留空旷比试地面；群雄可省略或只作极淡背景意象。
场景重心：完整双臂、灵动俊美青年面容与当场借用的竹质打狗棒，简明宴厅意象；不借用任何基线脸或成熟英雄体格。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：初报中普通竹棒的说法经正文复核已更正；本场是临时借用正式打狗棒。 不得用断右臂旧草稿覆盖本场，不加空袖、白鬓、重剑或黯然掌。 以比试中的竹棒阶段为切片，不把后来换剑与多段战斗揉成同一持物画面。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。

排除项：不要萧峰的脸、胡须、宽大肩背、头巾、披氅或出掌姿势；不要令狐冲脸与网状抹额，不要断臂、空袖、玄铁剑、神雕、面具、白发或黯然掌。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要萧峰的脸、胡须、宽大肩背、头巾、披氅或出掌姿势；不要令狐冲脸与网状抹额，不要断臂、空袖、玄铁剑、神雕、面具、白发或黯然掌。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.prepared.json`。
