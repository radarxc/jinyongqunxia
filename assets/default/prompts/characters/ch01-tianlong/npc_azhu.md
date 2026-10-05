---
asset_id: por_npc_azhu__ch01_youth_alive_base
subject_id: npc_azhu
name: 阿朱
book: ch01_tianlong
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png
manifest: assets/default/character/female/ch01/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/fc10de16588f30662ce13250cfd4921a1ac4ee367aac6d10bb90cc430a5ed820.png
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

# 阿朱 · 人物写实修正

## 人物与阶段

- subject_id：npc_azhu
- book：ch01_tianlong
- gender：female
- age_variant：youth

## 本轮人物写实规范

阿朱本来面目、悲剧前、温暖机敏少女；完整浅绛窄袖衫与暖米裙、易容布包，不复制王语嫣脸。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_azhu__ch01_youth_alive_base/prompt-396a4b249fba396e71d986ee678fa23d61769108b4f233a7d83f233d1cda6533.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：阿朱；书界：ch01_tianlong；年龄阶段：youth；性别：female。
身份与阶段：易容寻根、与萧峰同行且小镜湖悲剧发生前的本来面目，未受致命伤，不画他人易容形象
年龄与体貌：年轻少女，确龄待考，保守采用未成年外观与完整衣着；娇俏灵动、善解人意，擅长易容，慕容家侍女出身
骨相与体型细化：柔和短鹅蛋脸、略圆脸颊、灵动细长眼、自然浅笑，身量轻巧，与王语嫣端雅修长脸拉开；少女约6–6.5头身，四肢与肩胯保持未成年发育特征
服饰与发式：浅绛色窄袖衫、暖米长裙、短而便于行走的褙子，素色布带；双侧发束收成小髻，少量细簪，衣领严整、平底布鞋
兵器与标志物：腰侧一只合拢的小易容布包，包口收好、不展示人皮面具；布包为原创道具，双手不持兵刃
气质与姿态：身体略前倾作倾听，手指轻扶布包系带，眼神温暖机敏，双脚自然站稳

REPAIR-SPECIFIC DIRECTION:
阿朱本来面目、悲剧前、温暖机敏少女；完整浅绛窄袖衫与暖米裙、易容布包，不复制王语嫣脸。
Keep the first reference's own short soft oval face and lively young gaze, distinct from Wang Yuyan. Conservatively preserve the youthful/minor appearance specified in the document, modest fully opaque attire, no adult glamour. Her tidy narrow-sleeved pale-crimson blouse and short walking jacket sit over a warm-ivory full skirt: all are continuous supple fabric, clean intact sleeve openings and hem, with only a few graceful gravity folds. Hair remains in two small gathered side arrangements with minimal small pins. Lean forward very slightly as though listening kindly; fingers lightly touch the closed disguise pouch's tie at the waist. Do not display a skin mask, disguise another person, fatal injury, weapons or the tragic scene.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No mature femme-fatale face, Wang Yuyan identity, exposed neckline, sheer cloth, human-skin mask, impersonated face, wounds or weapon. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No mature femme-fatale face, Wang Yuyan identity, exposed neckline, sheer cloth, human-skin mask, impersonated face, wounds or weapon. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_azhu__ch01_youth_alive_base.prepared.json`。
