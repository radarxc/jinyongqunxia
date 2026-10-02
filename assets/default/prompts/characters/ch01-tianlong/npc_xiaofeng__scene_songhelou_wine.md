---
asset_id: por_npc_xiaofeng__ch01_prime_scene_songhelou_wine
subject_id: npc_xiaofeng
name: 萧峰
book: ch01_tianlong
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_songhelou_wine.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: songhelou_wine
scene_title: 松鹤楼·豪饮识英雄
stage: 壮年，约三十岁。仍以乔峰之名任丐帮帮主；与段誉在无锡酒楼相识的阶段，身世尚未揭露。
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并验证新写实首样；同一萧峰面容、真实皮肤体积、完整布料画法。只保持身份与人物绘法，本场年龄服装动作器物背景另绘，不复制少室掌势或龙。
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 作者指定male基线已看，仅低饱和色卡；绝不沿用其碎墨、破衣、旧脸、竹棒或站姿。原candidate不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已查看，仅背景水墨山水和留白，不借用女子或把纸纹侵入人物。
status: ready
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
---

# 萧峰 · 人物写实修正

## 人物与阶段

- subject_id：npc_xiaofeng
- book：ch01_tianlong
- gender：male
- age_variant：prime
- scene_title：松鹤楼·豪饮识英雄
- scene_key：songhelou_wine
- stage：壮年，约三十岁。仍以乔峰之名任丐帮帮主；与段誉在无锡酒楼相识的阶段，身世尚未揭露。

## 本轮人物写实规范

作者最新人物美观写实修正：松鹤楼·豪饮识英雄；全身完整衣料与自然面容，背景水墨。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaofeng__ch01_prime_scene_songhelou_wine/prompt-224c97ce3a8746cd21a610b3b90663cc500dbdb0f59b2088eef9b2ba658f5125.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

参考第一张是已经修正好的同人萧峰写实首样，保持其成熟英气面容、方阔骨相与强健体格，以及精细自然皮肤和完整衣料；本场另行构图，绝不复制其掌势、北地披氅或龙影。第二male基线仅色调，忽略它的破布与碎墨画法。第三女子图仅背景墨韵，不借女性脸、体态或衣装。

萧峰，《天龙八部》，松鹤楼·豪饮识英雄。阶段：壮年，约三十岁。仍以乔峰之名任丐帮帮主；与段誉在无锡酒楼相识的阶段，身世尚未揭露。
人物与衣装动作：高大结实、宽额方颌、浓眉深目，胸肩有力量而不过度健美；坚毅、宽厚，英雄气来自判断与担当。 完整灰布右衽长袍、简洁深灰外衣、少量素白内领，窄布腰束、深色长裤与朴素布鞋，深灰裹巾整齐收髻。衣料虽朴素但完整整洁，袖口和衣摆连续收边，无破洞、撕裂、污渍、毛边或碎片。此时是中原行旅，不复制少室首样的北地短毡氅。 单人站在酒楼栏边，右手举一只朴素酒碗至胸前，左手自然垂下；略向画外来客侧目，坦荡有笑意，双脚稳稳落地。
器物：右手一只素陶酒碗；另一只空碗可只露桌边局部，不堆砌酒坛。
背景：浅墨的二楼木栏、屋檐和远处江南街影，淡赭色桌角。 无超自然效果；衣袖与开阔目光表现豪迈。 背景低对比，人物边缘清楚；只保留能够定位场景的少量轮廓，不画其他人物、敌群或写实摄影场景。
仅一个完整人物，头顶、双手、衣摆、两腿双鞋和器物完整入画，自然留边，真实承重。温润肤色、低饱和灰衣、柔和左上光。背景淡而可辨，不能侵入切碎人物。竖幅2:3目标2048×3072PNG，实际工具原生输出，不透明。

排除项：人物飞白、碎墨、拼贴纸屑、颗粒侵蚀、破布、撕裂衣角、斑驳脸、过度褶皱和碎带；不要复制少室山背景、龙影与北地毡氅。不要无依据兵器或竹棒、多肢多指、手物错接、裁切头足或器物、多人群像、摄影截图、3D塑料质感、现代服装、金冠铠甲、文字题款、印章logo或新增水印。保留工具自身溯源。
```

## 排除项

人物飞白、碎墨、拼贴纸屑、颗粒侵蚀、破布、撕裂衣角、斑驳脸、过度褶皱和碎带；不要复制少室山背景、龙影与北地毡氅。不要无依据兵器或竹棒、多肢多指、手物错接、裁切头足或器物、多人群像、摄影截图、3D塑料质感、现代服装、金冠铠甲、文字题款、印章logo或新增水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaofeng__ch01_prime_scene_songhelou_wine.prepared.json`。
