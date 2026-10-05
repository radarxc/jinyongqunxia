---
asset_id: por_npc_guojing__ch02_youth_scene_grassland_double_eagle
subject_id: npc_guojing
name: 郭靖
book: ch02_shediao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch02/por_npc_guojing__ch02_youth_scene_grassland_double_eagle.png
manifest: assets/default/character/male/ch02/manifest.yaml
asset_variant: scene
scene_key: grassland_double_eagle
scene_title: 大漠弯弓·一箭双雕
stage: 蒙古成长末期、南归以前；已经受哲别射术训练及早年武学教育，尚未得到洪七公传授降龙掌。
references:
- path: .agents/coord/imagegen-reference/hero-20261001/classic_guojing_still.jpg
  use: 已实际查看的郭靖经典影视人物；作为第一身份设计启发，取青年诚厚英气与五官辨识，不复制长剑、摄影质感、字幕、海报布局或服装。不作为原著事实证据。
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
- scene_title：大漠弯弓·一箭双雕
- scene_key：grassland_double_eagle
- stage：蒙古成长末期、南归以前；已经受哲别射术训练及早年武学教育，尚未得到洪七公传授降龙掌。

## 本轮人物写实规范

作者最新人物美观写实修正：大漠弯弓·一箭双雕；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_guojing__ch02_youth_scene_grassland_double_eagle/prompt-ed9b195cd885bc00e90b4c969059eccd0bf652af36e9916b416fc8371b2f638f.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

参考第一张郭靖经典形象只作为青年诚厚人物身份与神态启发，去掉其中长剑、照片质感和海报文字。第二张已验证的萧峰写实样图严格只供自然皮肤、完整人体体积、连续光影与连贯衣料的渲染品质，绝不复制萧峰的脸、胡须、体型与披氅。第三张男性基线仅低饱和色卡；第四张女子参考仅背景水墨与留白，不用其人像绘法。

郭靖，《射雕英雄传》，大漠弯弓·一箭双雕。
阶段：蒙古成长末期、南归以前；已经受哲别射术训练及早年武学教育，尚未得到洪七公传授降龙掌。
人物、完整衣装与动作：青年郭靖双臂健全，侧身稳立，左手握弓、右手拉弦至面侧，肩背与腰胯形成清楚的承力关系。目光沿箭杆斜上方集中，诚厚专注而有行动力。青年郭靖有自己的端正诚厚面容：眉眼坦荡而有神，面骨敦实年轻、鼻口自然，肩背有训练的力量但不夸张肌肉。自然细腻肤质、干净面容与连贯明暗，不是萧峰方阔浓须壮汉，也不是令狐冲的脸。气概来自认真、担当和稳健动作。 完整、考究而朴素的浅褐北地短外袍，深灰交领内衣，简洁皮革束腰，收窄袖口，深色长裤与合脚行旅靴。衣片、袖缘和下摆连续缝合，有少量宽阔承重褶皱；长黑发整齐收束。适合早期草原骑射，不加铠甲、披肩碎带、无依据脏污或破洞。
器物：一张完整反曲弓、一支搭弦箭、系挂清楚的箭囊。取箭未离弦的瞬间，箭尾扣弦正确；不佩此次建功后才赐的金刀。
背景：淡墨漠北草原、远山与开阔天空，远处两只高飞的雕为射猎目标；不画成近身豢养的白雕，不出现襄阳城墙。
场景重心：弓弦与一支搭弦箭连接准确，青年郭靖与远处两只射猎雕分层；没有金刀或任何降龙意象。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重；神雕重剑场明确保留一只完整神雕，射雕场保留远处目标双雕。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：未学降龙掌不等于从未习武。不得出现龙掌、左右互搏或九阴宗师状态。 旧郭靖草稿覆盖南行后得七公传艺时期，不能直接套用到蒙古射雕时。其金刀时序待考项不作为本场佩刀依据。 拉弓站姿是为独立全身立绘所作构图补足，不冒充原著逐字动作记录。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。

排除项：不要影视照片的剑、鞘、字幕、海报布局、摄影质感；不要金刀、掌法、降龙意象、左右互搏、双弓多箭或箭尾离弦，不画中年浓须将领。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要影视照片的剑、鞘、字幕、海报布局、摄影质感；不要金刀、掌法、降龙意象、左右互搏、双弓多箭或箭尾离弦，不画中年浓须将领。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_guojing__ch02_youth_scene_grassland_double_eagle.prepared.json`。
