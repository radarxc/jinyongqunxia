---
asset_id: por_npc_youtanzhi__ch01_youth_ironmask_base
subject_id: npc_youtanzhi
name: 游坦之
book: ch01_tianlong
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch01/por_npc_youtanzhi__ch01_youth_ironmask_base.png
manifest: assets/default/character/male/ch01/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/77b1e52c8bc06108c14d195ff0def79be724c992bc0ae4a66299f37d0592c48a.png
  use: 已实际view。仅本人身份、年龄体型与可辨面部特征；不借旧图碎墨、纸片、斑驳、破洞或撕裂衣料。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view，SHA 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，本轮写实candidate。仅自然面手、完整人体体积、连贯衣料的渲染质量；不借萧峰身份、性别体型、须发衣装、掌势或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际view。仅同性别项目低饱和色卡，文档服色优先；不借身份、年龄、发式、服装、道具、旧碎墨或织纹。基线审批原样保留。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view。仅背景的浅淡水墨远景、空气层次与留白；完全忽略女性人物脸、薄纱、衣纹、肤质和姿势，水墨不能侵入本体。
status: ready
realism_revision: user_character_realism_20261001
---

# 游坦之 · 人物写实修正

## 人物与阶段

- subject_id：npc_youtanzhi
- book：ch01_tianlong
- gender：male
- age_variant：youth

## 本轮人物写实规范

游坦之铁罩未除、双眼尚在阶段；保留正常人头体积铁罩、双眼与触罩手，旧灰褐布衣完整而非破布。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_youtanzhi__ch01_youth_ironmask_base/prompt-d5857e33f59c19a5d1bb721799e87123a0f37afdd56c54e6b8660d22506109e0.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：游坦之；书界：ch01_tianlong；年龄阶段：youth；性别：male。
身份与阶段：聚贤庄覆灭后、Z/X05 铁面受制且尚未解除铁罩的阶段；双眼尚能视物、尚未献眼，非少室山丐帮帮主定装
年龄与体貌：青年男子，确龄待考；聚贤庄少主遭难后以铁面身份追随阿紫，头面被铁罩包覆，保留青年体态与受困处境
骨相与体型细化：青年偏瘦身形、略内收双肩、真实手部骨节，铁罩露出的双眼清醒疲惫，下颌和脸伤由罩体遮蔽不作猎奇展示；成年约7.5头身
服饰与发式：旧灰褐右衽布衣、深灰长裤、朴素布鞋，袖口衣边只有有限磨损；铁罩贴合正常人头体积，开出可视与呼吸的简洁孔隙，无装饰兽角
兵器与标志物：铁制头罩完整可见，黯哑旧铁、朴素接缝；双手空着，手腕自然，不添奴役链条、盾刀或打狗棒
气质与姿态：双足站稳但略迟疑，一手轻触罩体下缘，另一手垂在身侧，表达忍痛与自我支撑，不跪伏讨好

REPAIR-SPECIFIC DIRECTION:
游坦之铁罩未除、双眼尚在阶段；保留正常人头体积铁罩、双眼与触罩手，旧灰褐布衣完整而非破布。
The face must remain covered by his stage-specific plain dull-iron head罩; do not reveal a handsome unmasked face to satisfy facial clarity. Instead, render BOTH seeing eyes sharply through simple aligned eye openings, fatigue and vulnerability readable without deforming them. The mask fits a normal human head, with restrained visible seams and breathing holes, no horns, spikes, monster design or display of facial injury. Keep the youthful slender body and slightly drawn-in shoulders. A complete old grey-brown right-lapped cloth shirt, dark-grey trousers and simple cloth shoes have only mild age-softened fabric, clean sewn cuffs and hem, no shredded strips, holes or saw-tooth sleeve damage. One empty hand lightly touches the lower mask edge with natural fingers and clear contact; the other hangs by his side, wrists unchained. Both feet steady, hesitant yet self-supporting. This is after Juxianzhuang and before eye donation or removal of the iron cover, not the later Beggar Sect chief outfit. No shield, sword, Dog-Beating Staff, chain, kneeling or blood.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No unmasked face, missing eyes, blindness, eye donation, discarded mask, horns, slave chains, weapon, Beggar Sect chief costume, kneeling or bloody injury. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No unmasked face, missing eyes, blindness, eye donation, discarded mask, horns, slave chains, weapon, Beggar Sect chief costume, kneeling or bloody injury. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_youtanzhi__ch01_youth_ironmask_base.prepared.json`。
