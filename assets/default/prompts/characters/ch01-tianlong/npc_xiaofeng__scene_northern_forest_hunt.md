---
asset_id: por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt
subject_id: npc_xiaofeng
name: 萧峰
book: ch01_tianlong
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: northern_forest_hunt
scene_title: 北地行猎·林间寻踪
stage: 壮年约三十岁。在女真部落居留数月后的初夏，随完颜阿骨打及猎人出猎；取在泥泞森林发现、追踪熊迹的阶段，尚未在草原遇到契丹骑队与耶律洪基。 尚未受封南院大王。
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并验证新写实首样；同一萧峰面容、真实皮肤体积、完整布料画法。只保持身份与人物绘法，本场年龄服装动作器物背景另绘，不复制少室掌势或龙。
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 作者指定male基线已看，仅低饱和色卡；绝不沿用其碎墨、破衣、旧脸、竹棒或站姿。原candidate不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已查看，仅背景水墨山水和留白，不借用女子或把纸纹侵入人物。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "萧峰基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png
---

# 萧峰 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。萧峰基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】初夏冰雪消融后的北地疏林：几棵淡墨树干、湿软的落叶土径、地上一串兽足印和远处浅草坡；同行猎人在画外。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】萧峰，《天龙八部》，北地行猎·林间寻踪。阶段：壮年约三十岁。在女真部落居留数月后的初夏，随完颜阿骨打及猎人出猎；取在泥泞森林发现、追踪熊迹的阶段，尚未在草原遇到契丹骑队与耶律洪基。 尚未受封南院大王。
【身份参考】随提示词上传的第 1 张图是萧峰本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（身材高大魁伟（比常人高出半头）、肩宽背厚；四方国字脸、下颌方正，浓黑粗眉、眉骨突出，一双大眼目光如电，高鼻梁、鼻翼宽，阔口厚唇，两颊与下巴是短而硬的络腮胡茬，脸上有风霜晒痕、额头两道浅横纹；约三十岁）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】灰褐色布袍、腰带稳束，深色长裤与软靴，衣上只沾一点林路尘泥；裹巾包髻。
【动作与神情】站在林缘泥径上，身体三分之二侧向，一足前踏、后足承重，微微俯身察看脚前的兽迹，头略抬、眉眼清楚，像判断好方向正要继续前行；一手自然低放，一手收着腰侧衣摆。
【器物】空手；不画猎物与动物。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_xiaofeng
- book：ch01_tianlong
- gender：male
- age_variant：prime
- scene_title：北地行猎·林间寻踪
- scene_key：northern_forest_hunt
- stage：壮年约三十岁。在女真部落居留数月后的初夏，随完颜阿骨打及猎人出猎；取在泥泞森林发现、追踪熊迹的阶段，尚未在草原遇到契丹骑队与耶律洪基。 尚未受封南院大王。

## 本轮人物写实规范

新独立北地寻踪场景，人物美观写实完整衣料、背景水墨。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt/prompt-5f1475f1a996544a9ce35fb6d82b9ed7610f980b365e48c512f3cbdf167c9cb0.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一张是本轮萧峰写实首样：只保持他的面部身份、成年强健体格、自然皮肤与完整衣料画法。不要复制掌势、北地短氅、龙影或山门。第二male基线只低饱和配色，完全忽略它的破布碎墨，第三用户图只淡景水墨，不能借女性脸衣装。

萧峰，《天龙八部》，北地行猎·林间寻踪。壮年约三十岁。在女真部落居留数月后的初夏，随完颜阿骨打及猎人出猎；取在泥泞森林发现、追踪熊迹的阶段，尚未在草原遇到契丹骑队与耶律洪基。 尚未受封南院大王。
保留本轮萧峰的宽额方颌、浓眉深目、短络腮胡与高大结实体格，面貌英俊有真实年龄感；目光敏锐、沉着而开阔，不呆立也不作凶恶兽性表情。肌肉自然藏在完整衣料下，不夸大健美。 实用束发，发丝与胡须真实自然；不用金冠、辽王礼冠或华丽发饰。
服饰：完整灰褐布袍，以腰带稳束，袍摆便于行走且不拖泥；深色长裤、完整软靴。织物厚薄、缝线、袖口与自然垂坠做写实表现，表面仅少量林路尘泥，无撕裂、露胸或大面积破洞。具体袍型属于美术补足，不借阿骨打的兽皮裂衫冒作萧峰原著服装。
姿态：人物完整站于林缘泥径，身体三分之二侧向，一足向前踏稳、后足承重，躯干轻俯察看脚前足印；头略抬，眉眼仍清楚可见，像判断行进方向后将继续前行。一手自然低放，一手轻收腰侧衣摆，双手均不高举。
双手空着，一手在腰侧轻收完整袍摆、一手自然下垂；无兵器。脚前两三枚浅泥大足印沿林径而去，完整双足清楚承重。
背景：初夏冰雪消融后的北地疏林，几棵淡墨树干、枯叶湿软土径和远处浅草坡。足迹和静静判断方向的眼神表现场景，同行者在画外，仅画萧峰一人，不画动物和狩猎战斗。背景低饱和淡墨、自然留白，人物完整坚实，水墨不侵入皮肤衣物。
竖幅2:3，完整全身与双手双鞋，自然边距、柔和左上光。目标2048×3072PNG，按工具原生尺寸输出，不透明。

排除项：撕裂衣角、破布、人物飞白碎墨、纸屑拼贴、风化斑驳、密集碎褶碎带、塑料磨皮、照片截图、3D质感；不要王冠王袍金甲、动物、兵器、打斗、额外人物、龙神符号、多肢多指、错接手腕、裁切头脚、可读文字题款、印章logo或新增水印。保留工具自身溯源。
```

## 排除项

撕裂衣角、破布、人物飞白碎墨、纸屑拼贴、风化斑驳、密集碎褶碎带、塑料磨皮、照片截图、3D质感；不要王冠王袍金甲、动物、兵器、打斗、额外人物、龙神符号、多肢多指、错接手腕、裁切头脚、可读文字题款、印章logo或新增水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaofeng__ch01_prime_scene_northern_forest_hunt.prepared.json`。
