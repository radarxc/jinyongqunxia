---
asset_id: por_npc_wenqingqing__ch07_youth_scene_yuexiao
subject_id: npc_wenqingqing
name: 温青青
book: ch07_bixue
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_scene_yuexiao.png
manifest: assets/default/character/female/ch07/manifest.yaml
asset_variant: scene
scene_key: yuexiao
scene_title: 花坡男装吹箫
stage: 以温青男装身份与袁承志相识的早期；少女至青年。
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view_image查看并核验新版萧峰首样，manifest realism_revision=user_character_realism_20261001，SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅参考人物自然皮肤、完整体积、连续光影及连贯衣料的渲染质量。绝不复用萧峰面孔、男性形象、年龄、胡须、体型、衣服、姿态或龙影，不作为本角色身份。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际view_image查看并校验可读的同性别项目基线；仅用低饱和色卡，不参考人物身份、面孔、体型、年龄、发饰、衣装、姿态、武器或人物笔触，完全忽略碎墨、纸纹和旧衣渲染，不改基线审批。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view_image查看并校验可读的用户王语嫣水墨参考；仅用于背景淡墨、山水层次与留白，完全忽略其中人物、脸、皮肤、服装、发饰和体态，墨迹纸纹不可进入新人物。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 温青青 · 人物写实修正

## 人物与阶段

- subject_id：npc_wenqingqing
- book：ch07_bixue
- gender：female
- age_variant：youth
- scene_title：花坡男装吹箫
- scene_key：yuexiao
- stage：以温青男装身份与袁承志相识的早期；少女至青年。

## 本轮人物写实规范

花坡男装吹箫；人物美观写实、完整体积与衣料，水墨仅背景；两手按持一支竹洞箫，箫上端靠唇、下端斜向身体前侧；肩颈自然，手和箫孔连接合理。完整站在亭边，脚边竹篮留在一侧，月下低矮玫瑰坡稀淡，人物俊秀而有脾气。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_wenqingqing__ch07_youth_scene_yuexiao/prompt-8032e0a69561268648eaa99d01356b7a956125ce1302650506cd7984a9364948.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

本角色当前没有已保存的本人身份PNG，依据下述文字原创独立骨相、年龄、体型与气质；本场将建立首幅新写实身份锚点，不能把其他人换衣当作本人。第一参考为已实际查看并核验新revision的萧峰首样，只取人物自然肤质、实体体积、连续光影和完整衣料质量，绝不复用他的脸、男性外貌、胡须、体型、衣服、年龄、掌势或龙影。第二参考仅同性别项目低饱和色卡，不取身份或人物画法。第三参考仅背景水墨、淡景和留白，不取女性面孔、白青衣装或纸纹透衣。

人物身份：温青青的独立人物设计：偏短的鹅蛋脸、略扬的英挺细眉、明亮敏锐的眼睛、鼻头小巧、下颌有利落转折；体态轻捷结实而不纤弱。神情鲜活、倔强、有判断，不照搬王语嫣温柔怯静的脸。男装时期保留女性原本骨相，以束发与衣装表达伪装，不画成另一个男人；后期服装改变而眉眼身份连续。
角色与主题：温青青，花坡男装吹箫。
阶段：以温青男装身份与袁承志相识的早期；少女至青年。
人物、动作与完整衣装：单人全身男装束发，俊秀而有自己脾气；站在亭边吹洞箫，姿态自然，鞋靴完整。 浅米灰男装交领短袍、淡青内衫、窄腰束、深裤与完整布靴，黑发男装束起而无华贵女饰。衣装剪裁合体、衔接明确，箫前袖口完整，保留少女自身骨相。 人物面部、皮肤、头发、衣服和鞋均以美观写实的高级国风插画塑造：坚实完整体积、自然精细肤质、可信五官、连贯柔和光影、干净完整轮廓。衣料有明确剪裁与连续整片织物，仅少量宽缓承重褶；旧衣也完整可穿。水墨、飞白和纸纹仅允许出现在背景，不能侵入或切碎人物。
器物与阶段限制：竹洞箫一支，取尚未折断之前；小竹篮在脚边，少量素食酒器不遮脚
仅背景使用水墨：浅淡水墨背景，人物为画面主体。自种玫瑰的低丘、浅淡月色与小亭，花只着少量淡红淡黄，不成浓艳花海。 背景墨痕和纸纹停留在人物轮廓以外，不穿透衣料与皮肤。
本场具体构图：两手按持一支竹洞箫，箫上端靠唇、下端斜向身体前侧；肩颈自然，手和箫孔连接合理。完整站在亭边，脚边竹篮留在一侧，月下低矮玫瑰坡稀淡，人物俊秀而有脾气。
单人单视图完整全身，站姿从头顶到双足，坐姿完整呈现头、躯干、实际存在的手、双腿和足，主要器物端点完整入画；真实重心、自然留边，不机械限定人物占高。竖幅2:3，目标2048×3072 PNG，接受工具原生输出、不透明，保留原始PNG字节。每场两候选择一，生成后实际查看人物写实质量与事实身份，宽松自查后仍为candidate，不能自行approved。
事实与艺术边界：原著明确玫瑰坡、竹篮、洞箫与男装温青；站姿为适合全身的艺术调整，不混成任盈盈竹巷。 本场为原著事件基础上的单人艺术取景与原创衣装设计，构图不当作逐字场面复刻；独立场景不覆盖基础图。此production record只准备实际请求，不代表图片已经生成、查看或审批；原始PNG保存后仍须按宽松自查登记candidate，保留原审批状态。 本轮按REALISTIC-CHARACTERS-20261001.md重写人物美术：美观写实、自然皮肤、连贯光影、完整衣料，水墨仅背景；旧场景或旧候选不计本轮修正完成。具体衣色与姿态仍为艺术补足，原著人物、阶段、伤残与器物事实不变。实际生成与查看后才可登记本轮candidate，不自行approved。

完整排除项：不要古琴、横笛或已折断的箫，不要任盈盈竹巷、浓艳玫瑰花海、王语嫣脸与披发女裙、金蛇剑或多指粘箫。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。
```

## 排除项

不要古琴、横笛或已折断的箫，不要任盈盈竹巷、浓艳玫瑰花海、王语嫣脸与披发女裙、金蛇剑或多指粘箫。 人物本体不要飞白断裂、碎墨拼贴、纸屑粒子侵蚀、纸纹透肤透衣、白斑、划痕、粗糙斑驳脸、破布、撕裂衣角、过度密集褶皱或碎带。除本场明确局部剧情损伤并妥善处理外，不主动添加破损污渍风化，局部损伤不能扩为人物碎片化。不要把背景水墨、山水、龙纹或符号延伸进人物皮肤、衣料、头发、手脚。不要复制萧峰的脸、胡须、裹巾、魁梧体型、男装、披氅、掌势、年龄或龙影；不借同性基线的脸、性别特征细节、发饰、站姿、武器或人物笔触，不借用户图的白青裙装、面孔和肤质画法。不要照片截图、3D塑料质感、动漫大眼、统一模板脸、现代物品、日式刀服、欧式奇幻甲胄、可读文字题款、印章logo或新增水印；保留工具自身溯源。不要多肢、多手多足、正常手多指、手物粘连、器物与动物错接、头足器物裁断、拼贴多格或额外人物。真实伤残按人物阶段保留，不能以美化为名恢复缺指；不要血腥特写、裸露透衣、未成年成人化或性感化。无本场依据的武器、神光法阵、密集背景与多人战场不出现。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_wenqingqing__ch07_youth_scene_yuexiao.prepared.json`。
