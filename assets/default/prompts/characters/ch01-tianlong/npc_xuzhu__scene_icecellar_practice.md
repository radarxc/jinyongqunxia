---
asset_id: por_npc_xuzhu__ch01_youth_scene_icecellar_practice
subject_id: npc_xuzhu
name: 虚竹
book: ch01_tianlong
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_icecellar_practice.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: icecellar_practice
scene_title: 冰窖习艺·静心凝掌
stage: 青年，保留质朴而有辨识度的僧人骨相，不作老人。护送童姥、躲避追逐后进入西夏冰窖的习艺阶段，取二老终局之前。 对应《天龙八部》第36、37回。
references:
- path: assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move.png
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

# 虚竹 · 人物写实修正

## 人物与阶段

- subject_id：npc_xuzhu
- book：ch01_tianlong
- gender：male
- age_variant：youth
- scene_title：冰窖习艺·静心凝掌
- scene_key：icecellar_practice
- stage：青年，保留质朴而有辨识度的僧人骨相，不作老人。护送童姥、躲避追逐后进入西夏冰窖的习艺阶段，取二老终局之前。 对应《天龙八部》第36、37回。

## 本轮人物写实规范

作者最新人物美观写实修正：冰窖习艺·静心凝掌；本人身份连续，人物完整写实，水墨仅背景。依赖本人首幅 user_character_realism_20261001，不能沿用旧初版解除依赖。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xuzhu__ch01_youth_scene_icecellar_practice/prompt-e68a4ea6ecfc08e6f9a51589b6b9d4234a90262402e4ea867b3789457eff9647.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考必须是已完成并经父任务验证 realism_revision=user_character_realism_20261001 的本人首幅写实场景；使用同一面容、体型与完整写实人物质量，本场重新绘制服饰、发式、动作、道具和背景。该路径已有旧初版也不满足依赖，未经新版 revision 核验不得提交生成。
第二参考是已实际查看的新版萧峰少室山首样，仅作为人物渲染质量标准：自然面容、细腻皮肤、连续光影、完整布料、干净收边。它不是身份参考，不能借用萧峰的脸、年龄、胡须、裹巾、体型、男装或动作。本角色仍是虚竹，不可变成萧峰。
第三参考是同性别原项目基线，仅低饱和色卡，不参考脸、人物笔触、碎墨、衣料细节、姿态或器物。
第四参考仅用于背景水墨山水、浅淡墨韵和留白；不参考其中人物、脸、皮肤、白青衣装、发饰或纸纹透衣的画法。

虚竹，《天龙八部》，冰窖习艺·静心凝掌。阶段：青年，保留质朴而有辨识度的僧人骨相，不作老人。护送童姥、躲避追逐后进入西夏冰窖的习艺阶段，取二老终局之前。 对应《天龙八部》第36、37回。
人物与完整衣装动作：青年男子，面容质朴，较宽鼻梁与温厚眼神，骨相区别于段誉的秀雅与萧峰的雄峻；不是模板美少年，也不以夸张丑相取乐。 剃度僧人头相，保持同一面部身份，不长出道士髻或西夏驸马长发。 完整闭合的灰褐僧衣、素色内衫、腰束、长裤与僧鞋；衣料真实保暖、平整连贯，少量大褶随双掌练习产生。冷光只自然映在完整布料表面，不把冰纹、雪花或白斑画到皮肤衣服内部；右手拇指保留已获掌门指环。 稳固站姿，双掌一前一后缓缓练习，手指松紧自然；凝神内省，不作狂暴发招，双脚确实落地。 人物面部、皮肤、头发、衣服与鞋采用完整连贯的写实国风插画塑造；实体体积清楚、柔和光影连续、轮廓干净，墨染和纸面纹理只留在背景。
器物与阶段限制：保留已取得的掌门指环；无剑、杖或其他兵器。
仅背景使用水墨：浅蓝灰冰块边缘、低矮窖壁与很淡的呼气白雾，人物面部仍有温暖纸底光。 只有冰冷空气与掌势的轻墨弧线；不出现巨大冰刀、雪域神殿或冻住的人体。 背景只作浅淡场景识别；无第二人物、多人战场、完整神像、可读题字或替身残影。
本场具体构图：虚竹在冰窖完整站立缓练双掌，手臂一前一后圆融衔接，双脚稳固承重。淡冰壁与呼气白雾只在人物之外，手掌皮肤与衣料渲染完整。保留指环；不添第二人物、幽会、巨型冰刃或神殿。
单人单视图，完整头顶、躯干、双手、两腿双足及指定器物都入画，站坐依本场而定，自然留边、真实承重。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。肤质细腻自然、衣料完整连贯，少量宽缓承重褶；画面墨韵与纸感只用于背景，不能侵入人物。

完整排除项：不要裸露、幽会人物、童姥、公主、实体神佛、巨型冰刃或将所有武学说成此时首次获得。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。
```

## 排除项

不要裸露、幽会人物、童姥、公主、实体神佛、巨型冰刃或将所有武学说成此时首次获得。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xuzhu__ch01_youth_scene_icecellar_practice.prepared.json`。
