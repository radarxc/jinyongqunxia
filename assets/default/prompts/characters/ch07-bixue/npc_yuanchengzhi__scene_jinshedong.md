---
asset_id: por_npc_yuanchengzhi__ch07_youth_scene_jinshedong
subject_id: npc_yuanchengzhi
name: 袁承志
book: ch07_bixue
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.png
manifest: assets/default/character/male/ch07/manifest.yaml
asset_variant: scene
scene_key: jinshedong
scene_title: 金蛇遗剑
stage: 青年取得夏雪宜遗物、金蛇传承初开；不是夏雪宜本人。
references:
- path: assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_child_scene_huashan.png
  use: 待本角色首场 por_npc_yuanchengzhi__ch07_child_scene_huashan 新写实PNG生成、保存后，由根任务核验manifest realism_revision=user_character_realism_20261001、当前PNG哈希和实际view_image查看，才可注册或使用。本记录不声称已查看该新身份图；旧同路径文件存在也不满足依赖。届时只保持同人物核心身份与写实人物质量，本场年龄成长、伤残、衣服、发式、动作、器物和背景另绘。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view_image查看并核验新版萧峰首样，manifest realism_revision=user_character_realism_20261001，SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅参考人物自然皮肤、完整体积、连续光影及连贯衣料的渲染质量。绝不复用萧峰面孔、男性形象、年龄、胡须、体型、衣服、姿态或龙影，不作为本角色身份。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际view_image查看并校验可读的同性别项目基线；仅用低饱和色卡，不参考人物身份、面孔、体型、年龄、发饰、衣装、姿态、武器或人物笔触，完全忽略碎墨、纸纹和旧衣渲染，不改基线审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view_image查看并校验可读的用户王语嫣水墨参考；仅用于背景淡墨、山水层次与留白，完全忽略其中人物、脸、皮肤、服装、发饰和体态，墨迹纸纹不可进入新人物。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 袁承志 · 人物写实修正

## 人物与阶段

- subject_id：npc_yuanchengzhi
- book：ch07_bixue
- gender：male
- age_variant：youth
- scene_title：金蛇遗剑
- scene_key：jinshedong
- stage：青年取得夏雪宜遗物、金蛇传承初开；不是夏雪宜本人。

## 本轮人物写实规范

金蛇遗剑；人物美观写实、完整体积与衣料，水墨仅背景；身体从蹲起转为直立，右手持剑柄将独特曲折剑身斜向前下方，左手自然张开靠近旧包裹而不触刃；目光认真端详剑身。狭洞裂光与旧包裹明确传承来源，人物双脚稳立。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong/prompt-3e837bdc74f3f4b43d8851fea655e60cf354743466070b6d220007365bafac91.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须为本角色首场新写实PNG，根任务先核验manifest realism_revision=user_character_realism_20261001、文件哈希并实际查看后方可输入；旧同路径文件存在不满足条件，当前不声称已查看该新身份图。按首场保持本人眉鼻眼口的辨识关系，允许少年到青年自然成长及剧情伤残变化，不固化首场身高、姿态或装备。第二参考为已实际查看的新写实萧峰首样，只取皮肤、体积、连贯光影和完整衣料质量，不能借他的脸、男性外貌、胡须、体型、服装、姿势或龙影。第三参考仅同性别基线低饱和色卡，不作身份和人物画法。第四参考仅背景淡墨山水及留白，不取女子、面孔、肤质或服装。

人物身份：袁承志的独立人物设计：方中带长的脸、平直而浓的眉、沉静的眼睛、清晰鼻梁和较厚实下颌；少年保留脸颊稚气，青年肩背扎实舒展而不肌肉夸张，神情克制诚正。完整长发简单束起；不是令狐冲的狭长脸、网状抹额或洒脱歪身站姿。少年至青年保持眉眼间距和鼻口辨识，以自然成长改变下颌与肩宽。
角色与主题：袁承志，金蛇遗剑。
阶段：青年取得夏雪宜遗物、金蛇传承初开；不是夏雪宜本人。
人物、动作与完整衣装：单人全身蹲起后的直立姿，青灰练武衣，谨慎端详一柄特殊剑，神态敬重。 青年青灰束袖练武袍、深色窄腰带、灰褐长裤与完整布靴，黑发素巾束起。朴素衣料有可信厚度，腰部层次精简，领袖和袍摆均完整整洁。 人物面部、皮肤、头发、衣服和鞋均以美观写实的高级国风插画塑造：坚实完整体积、自然精细肤质、可信五官、连贯柔和光影、干净完整轮廓。衣料有明确剪裁与连续整片织物，仅少量宽缓承重褶；旧衣也完整可穿。水墨、飞白和纸纹仅允许出现在背景，不能侵入或切碎人物。
器物与阶段限制：金蛇剑一柄，蛇形曲折剑身与独特剑尖，不画真蛇缠身；旧包裹与少量金蛇锥在地侧，不漂浮
仅背景使用水墨：浅淡水墨背景，人物为画面主体。狭小石洞、裂隙天光与岩上旧痕；遗骨留在画外，不以骷髅为中心。 背景墨痕和纸纹停留在人物轮廓以外，不穿透衣料与皮肤。
本场具体构图：身体从蹲起转为直立，右手持剑柄将独特曲折剑身斜向前下方，左手自然张开靠近旧包裹而不触刃；目光认真端详剑身。狭洞裂光与旧包裹明确传承来源，人物双脚稳立。
单人单视图完整全身，站姿从头顶到双足，坐姿完整呈现头、躯干、实际存在的手、双腿和足，主要器物端点完整入画；真实重心、自然留边，不机械限定人物占高。竖幅2:3，目标2048×3072 PNG，接受工具原生输出、不透明，保留原始PNG字节。每场两候选择一，生成后实际查看人物写实质量与事实身份，宽松自查后仍为candidate，不能自行approved。
事实与艺术边界：金蛇剑、锥与秘笈来源于夏雪宜遗藏；不画袁承志为金蛇郎君，不提前携游戏原创机关道具。 本场为原著事件基础上的单人艺术取景与原创衣装设计，构图不当作逐字场面复刻；独立场景不覆盖基础图。此production record只准备实际请求，不代表图片已经生成、查看或审批；原始PNG保存后仍须按宽松自查登记candidate，保留原审批状态。 本轮按REALISTIC-CHARACTERS-20261001.md重写人物美术：美观写实、自然皮肤、连贯光影、完整衣料，水墨仅背景；旧场景或旧候选不计本轮修正完成。具体衣色与姿态仍为艺术补足，原著人物、阶段、伤残与器物事实不变。实际生成与查看后才可登记本轮candidate，不自行approved。 首身份引用必须完成新写实revision并实际查看；旧路径存在不能解除依赖。

完整排除项：不要真蛇绕剑或缠身，不要普通笔直剑替代金蛇剑，不要漂浮锥、骷髅主视觉、金蛇郎君面貌或皇帝宝剑。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。
```

## 排除项

不要真蛇绕剑或缠身，不要普通笔直剑替代金蛇剑，不要漂浮锥、骷髅主视觉、金蛇郎君面貌或皇帝宝剑。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yuanchengzhi__ch07_youth_scene_jinshedong.prepared.json`。
