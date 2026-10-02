---
asset_id: por_npc_duanyu__ch01_youth_scene_langhuan_scroll
subject_id: npc_duanyu
name: 段誉
book: ch01_tianlong
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_langhuan_scroll.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: langhuan_scroll
scene_title: 琅嬛玉洞·展卷初悟
stage: 青年，保留秀雅书生骨相，不作成熟帝王脸。坠谷进入琅嬛福地，取得并初习北冥神功、凌波微步；尚未到天龙寺。 对应《天龙八部》第2回。
references:
- path: assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_wuliang_fan.png
  use: 待本人首幅新写实场景生成、保存并核验 user_character_realism_20261001 后才可使用；当前不声称已查看该新版本。路径即使存在旧初版也不满足依赖。仅保持本人身份与写实人物质量，本场阶段服饰动作器物另绘。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；只取自然皮肤、完整体积、连贯布料及人物写实完成度，绝不借其身份、男性形象、服装、姿势或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际查看的同性别项目基线，仅低饱和色卡；不作为人物画法或身份参考，不继承破布、碎墨、纸纹、脸、发饰、武器与姿态。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户原水墨参考，仅背景淡墨山水、留白及环境层次；完全忽略图中人物、衣料与肤质画法，不将纸纹和飞白带入新人物。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 段誉 · 人物写实修正

## 人物与阶段

- subject_id：npc_duanyu
- book：ch01_tianlong
- gender：male
- age_variant：youth
- scene_title：琅嬛玉洞·展卷初悟
- scene_key：langhuan_scroll
- stage：青年，保留秀雅书生骨相，不作成熟帝王脸。坠谷进入琅嬛福地，取得并初习北冥神功、凌波微步；尚未到天龙寺。 对应《天龙八部》第2回。

## 本轮人物写实规范

作者最新人物美观写实修正：琅嬛玉洞·展卷初悟；本人身份连续，人物完整写实，水墨仅背景。依赖本人首幅 user_character_realism_20261001，不能沿用旧初版解除依赖。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_duanyu__ch01_youth_scene_langhuan_scroll/prompt-7947680a277222ea306886acb48123d59a71f2512ed96e3987f6529a2b0baca5.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须是已完成并经父任务验证 realism_revision=user_character_realism_20261001 的本人首幅写实场景；使用同一面容、体型与完整写实人物质量，本场重新绘制服饰、发式、动作、道具和背景。该路径已有旧初版也不满足依赖，未经新版 revision 核验不得提交生成。
第二参考是已实际查看的新版萧峰少室山首样，仅作为人物渲染质量标准：自然面容、细腻皮肤、连续光影、完整布料、干净收边。它不是身份参考，不能借用萧峰的脸、年龄、胡须、裹巾、体型、男装或动作。本角色仍是段誉，不可变成萧峰。
第三参考是同性别原项目基线，仅低饱和色卡，不参考脸、人物笔触、碎墨、衣料细节、姿态或器物。
第四参考仅用于背景水墨山水、浅淡墨韵和留白；不参考其中人物、脸、皮肤、白青衣装、发饰或纸纹透衣的画法。

段誉，《天龙八部》，琅嬛玉洞·展卷初悟。阶段：青年，保留秀雅书生骨相，不作成熟帝王脸。坠谷进入琅嬛福地，取得并初习北冥神功、凌波微步；尚未到天龙寺。 对应《天龙八部》第2回。
人物与完整衣装动作：清俊的长椭圆脸、明净眼神，肩背修长而非瘦弱；保留贵公子的教养和不喜伤人的底色，英雄气来自急难时的担当。 完整黑发束起，素簪或简洁束发；全程俗家装束，不剃头、不戴帝王冕旒。 完整浅青长袍、素白内领、简洁腰带、长裤与布鞋，衣襟闭合而剪裁自然。衣摆与袖子是连续布料，仅随俯身展卷形成少量真实大褶；不因坠谷阶段随意添加撕裂、泥斑或刮擦。 完整站姿微俯身，双手轻持小段展开的帛卷，视线落在卷面后抬向前方，惊讶与思索并存。 人物面部、皮肤、头发、衣服与鞋采用完整连贯的写实国风插画塑造；实体体积清楚、柔和光影连续、轮廓干净，墨染和纸面纹理只留在背景。
器物与阶段限制：一轴展开有限长度的帛卷；卷面只留模糊线迹，不画可辨人体、裸体图谱或可读口诀。
仅背景使用水墨：洞壁浅灰纹理、柔淡月光、一只低矮蒲团；玉像只以画外空间或石座边缘暗示。 细微弧线可呼应图谱观看方向，不出现漂浮秘籍、真气灌顶或神像显灵。 背景只作浅淡场景识别；无第二人物、多人战场、完整神像、可读题字或替身残影。
本场具体构图：双手持一小段帛卷，完整站姿微俯而面部清楚可见；目光专注惊奇，不画跪拜。图谱只模糊线迹，不画可读口诀、裸体图、人形玉像或第二人物。此场不带折扇。
单人单视图，完整头顶、躯干、双手、两腿双足及指定器物都入画，站坐依本场而定，自然留边、真实承重。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。肤质细腻自然、衣料完整连贯，少量宽缓承重褶；画面墨韵与纸感只用于背景，不能侵入人物。

完整排除项：不要折扇、玉像、裸体图谱、可读口诀、漂浮秘籍、六脉剑光。此前两张旧方向候选不能充当本轮新图。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。
```

## 排除项

不要折扇、玉像、裸体图谱、可读口诀、漂浮秘籍、六脉剑光。此前两张旧方向候选不能充当本轮新图。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_duanyu__ch01_youth_scene_langhuan_scroll.prepared.json`。
