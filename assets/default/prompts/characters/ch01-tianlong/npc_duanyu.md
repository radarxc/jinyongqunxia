---
asset_id: por_npc_duanyu__ch01_youth_shizi_base
subject_id: npc_duanyu
name: 段誉
book: ch01_tianlong
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_shizi_base.png
manifest: assets/default/character/male/ch01/manifest.yaml
references:
- path: assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_scene_wuliang_fan.png
  use: 已实际view并核验manifest为本轮写实candidate。仅本人身份面容、年龄体型；不借该场景姿态、阶段服装、背景或衣料笔触，严格按本基础文档重绘。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view，SHA 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，本轮写实candidate。仅自然面手、完整人体体积、连贯衣料的渲染质量；不借萧峰身份、性别体型、须发衣装、掌势或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际view。仅同性别项目低饱和色卡，文档服色优先；不借身份、年龄、发式、服装、道具、旧碎墨或织纹。基线审批原样保留。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view。仅背景的浅淡水墨远景、空气层次与留白；完全忽略女性人物脸、薄纱、衣纹、肤质和姿势，水墨不能侵入本体。
status: ready
realism_revision: user_character_realism_20261001
---

# 段誉 · 人物写实修正

## 人物与阶段

- subject_id：npc_duanyu
- book：ch01_tianlong
- gender：male
- age_variant：youth

## 本轮人物写实规范

段誉从本人新版无量图取脸，恢复无量初登场基础站姿；浅青圆领长衫和素折扇、尚无三大神功，不把场景图行走动作直接复制。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_duanyu__ch01_youth_shizi_base/prompt-c87fc9d83607f16a0ae91018afcd18d143b9974705fc1effa002bebd9b7d0832.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：段誉；书界：ch01_tianlong；年龄阶段：youth；性别：male。
身份与阶段：无量剑比斗初见的镇南王世子，初入江湖、尚未获得北冥神功、凌波微步与六脉神剑
年龄与体貌：青年男子，精确年龄待考；青衫书生般的文秀青年，温雅好辩、不愿争斗，以折扇伴随初登场形象
骨相与体型细化：窄长椭圆脸、舒展眉目、较细下颌、清瘦修长身形，肤色自然偏浅，嘴角略含温和笑意；成年约7.5头身
服饰与发式：低饱和浅青圆领长衫、玉白内层、窄灰青织带，衣缘仅小面积大理地域几何纹样；整齐束髻与小型软巾，素色长裤、浅灰布履，衣料细洁而不堆金饰
兵器与标志物：右手轻持一柄半开的素面折扇，竹扇骨与枢轴可读，扇面完全无字无画；左手空着，不佩剑、不带秘籍
气质与姿态：微侧身静听，肩颈放松，持扇手停在胸腹侧，左手自然放松，脚步轻巧但双足落地

REPAIR-SPECIFIC DIRECTION:
段誉从本人新版无量图取脸，恢复无量初登场基础站姿；浅青圆领长衫和素折扇、尚无三大神功，不把场景图行走动作直接复制。
Use image 1 only for the same clear young Duan Yu identity and natural age, never for its mountain path, palace roof, walking step or fragmented costume brush marks. The base-stage prince has not yet learned Beiming, Lingbo or Six-Meridian sword technique. Reconstruct a finely woven but plainly elegant pale blue-green ROUND-COLLAR long shirt, white inner layer, narrow grey-blue woven belt, only a small amount of Dali geometric edging, plain trousers and light grey cloth shoes. Keep the slim long-oval face, relaxed bright eyes, slender healthy frame and gentle opinionated curiosity, not Xiao Feng's jaw, beard or shoulders. Hair is neatly gathered with a small soft headcloth. Both feet rest on the ground in a quiet attentive slight turn. The RIGHT hand holds a half-open blank folding fan near the chest/abdomen; LEFT hand is empty and relaxed. No writing or painting on the fan, no book, sword, finger-sword gesture, illusion trail or emperor dress. Paint broad continuous blue cloth planes and softly rounded folds, not polygons or paper overlays.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No Beiming, Lingbo or Six-Meridian effects, physical sword, manuals, crown, royal ceremonial robe, warrior beard or copy of the scene's walking pose. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No Beiming, Lingbo or Six-Meridian effects, physical sword, manuals, crown, royal ceremonial robe, warrior beard or copy of the scene's walking pose. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_duanyu__ch01_youth_shizi_base.prepared.json`。
