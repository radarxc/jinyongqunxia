---
asset_id: por_npc_azi__ch01_youth_sighted_base
subject_id: npc_azi
name: 阿紫
book: ch01_tianlong
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch01/por_npc_azi__ch01_youth_sighted_base.png
manifest: assets/default/character/female/ch01/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/5de59a1a8305ee155215cff59cf4b6473a8da560a1c31b58e0d835754ddc5d7d.png
  use: 已实际view。仅本人身份、年龄体型与可辨面部特征；不借旧图碎墨、纸片、斑驳、破洞或撕裂衣料。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view，SHA 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，本轮写实candidate。仅自然面手、完整人体体积、连贯衣料的渲染质量；不借萧峰身份、性别体型、须发衣装、掌势或龙影。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际view。仅同性别项目低饱和色卡，文档服色优先；不借身份、年龄、发式、服装、道具、旧碎墨或织纹。基线审批原样保留。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view。仅背景的浅淡水墨远景、空气层次与留白；完全忽略女性人物脸、薄纱、衣纹、肤质和姿势，水墨不能侵入本体。
status: ready
realism_revision: user_character_realism_20261001
---

# 阿紫 · 人物写实修正

## 人物与阶段

- subject_id：npc_azi
- book：ch01_tianlong
- gender：female
- age_variant：youth

## 本轮人物写实规范

阿紫保持小镜湖后尚未失明的纤小未成年紫衣少女，双眼正常视物；紫袖与藕灰裙恢复连贯不透明布料。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_azi__ch01_youth_sighted_base/prompt-20eb09923e8375427ccb006a4817eee1d562a1b7ad18ec5609144d5322d37d35.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：阿紫；书界：ch01_tianlong；年龄阶段：youth；性别：female。
身份与阶段：小镜湖初遇后的星宿弟子阶段，尚未失明、换眼或进入终局，保持双眼可见视物
年龄与体貌：未成年少女，精确年龄待考；紫衣少女，容貌俏丽，机敏任性，星宿派出身
骨相与体型细化：较小心形脸、清楚但柔和的下颌、短俏眉形，身量纤小、目光警觉，嘴角略带试探而非媚笑；少女约6–6.5头身，不拉长为成年模特
服饰与发式：低饱和紫色窄袖衫、暗紫短褙子、藕灰齐腰长裙，内层遮蔽胸颈，布带收腰；双侧小发髻与紫布细带，平底布鞋
兵器与标志物：腰间系一只闭合小毒物袋，作为星宿身份的原创道具；不展示药物配方，不外加神木王鼎、眼罩或后期控制器具
气质与姿态：身体微侧、一脚稍前但不迈出画幅，一手护住小袋，另一手自然放松，警觉好奇的少女神态

REPAIR-SPECIFIC DIRECTION:
阿紫保持小镜湖后尚未失明的纤小未成年紫衣少女，双眼正常视物；紫袖与藕灰裙恢复连贯不透明布料。
Preserve a small heart-shaped face, alert youthful eyes and guarded inquisitive look; she is a minor girl, not a glamorous adult woman. Both eyes are intact, open and normally seeing at this stage. Make the muted-purple narrow sleeves, dark-purple short jacket and lotus-grey opaque full skirt into complete fitted garments with solid connected shading, no angular white patches. Collar fully covers upper chest, belt is simple, flat cloth shoes complete. Hair uses two small side buns and short neat purple ties, no flowing ribbon cloud. One hand guards a closed small poison pouch at the waist, the other hangs naturally; no displayed contents, recipe, poison smoke, divine cauldron, blindfold or transplanted eyes.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No adultized body or alluring expression, eye injury, blindfold, eye transplant, cauldron, visible poison preparation, magical mist, flowing torn ribbons. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No adultized body or alluring expression, eye injury, blindfold, eye transplant, cauldron, visible poison preparation, magical mist, flowing torn ribbons. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_azi__ch01_youth_sighted_base.prepared.json`。
