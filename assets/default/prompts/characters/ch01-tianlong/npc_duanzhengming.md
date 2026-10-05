---
asset_id: por_npc_duanzhengming__ch01_prime_emperor_base
subject_id: npc_duanzhengming
name: 段正明
book: ch01_tianlong
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch01/por_npc_duanzhengming__ch01_prime_emperor_base.png
manifest: assets/default/character/male/ch01/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/d45164ffff4fc74af404c33de362eb22d5548742ea0181c2e191f9f62f96fc3d.png
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

# 段正明 · 人物写实修正

## 人物与阶段

- subject_id：npc_duanzhengming
- book：ch01_tianlong
- gender：male
- age_variant：prime

## 本轮人物写实规范

段正明剃度前保定帝常服，深赭圆领而非交领大外袍，腹前空手；衣料去角状碎色，端方温厚不加冕旒。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_duanzhengming__ch01_prime_emperor_base/prompt-6ca336895e54230ca32baf1d2d5741c64c8cffd8eaef0355de04f0526c4df98a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：段正明；书界：ch01_tianlong；年龄阶段：prime；性别：male。
身份与阶段：大理救援、尚未在天龙寺剃度为本尘的保定帝，采用国主日常会见常服
年龄与体貌：中年男子，确龄待考；大理国主、段氏家国责任的承担者，仪态端严平和
骨相与体型细化：宽额方脸、端正浓眉、稍厚面颊、短整髭须，身形中等结实，目光温厚而严肃；比段正淳更克制端方；成年约7.5头身
服饰与发式：深赭圆领常服、米白右衽内衫、窄带配小玉扣，衣缘克制的大理几何织纹；整齐束发、素色软巾与黑皮履，不画朝会大礼服
兵器与标志物：双手空着，不持玉玺、诏书或兵器；腰扣只作服装装具，不附字
气质与姿态：正面略侧、肩背端直，两手自然在腹前交叠，神情稳重关切，双足平稳

REPAIR-SPECIFIC DIRECTION:
段正明剃度前保定帝常服，深赭圆领而非交领大外袍，腹前空手；衣料去角状碎色，端方温厚不加冕旒。
Preserve this middle-aged man's broad forehead, square face, full but natural cheeks, neat short moustache and calm responsible gaze. He is still Baoding Emperor before ordination, wearing ordinary audience clothing: a DEEP-OCHRE ROUND-COLLAR outer robe, ivory right-lapped INNER layer visible only as appropriate at the neck, a narrow belt with a small plain jade clasp, restrained Dali geometric edging, neatly bound hair under a plain soft headcloth and black leather shoes. Do not turn the outer robe into an open crossed-collar coat copied from the old picture. Shoulders are upright, hands empty and gently overlapped at the abdomen, both feet steady. Rebuild the ochre sleeves, shoulder and white cuff lining with smoothly connected fabric volumes, no hard polygonal light-dark mosaics. No seal, scroll, weapon, shaving, monk robe, crown or imperial state regalia.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No shaved head, monastic robe, royal seal, edict, sword, elaborate crown, state regalia, copy of old angular cloth facets or substitute cross-collar outer robe. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No shaved head, monastic robe, royal seal, edict, sword, elaborate crown, state regalia, copy of old angular cloth facets or substitute cross-collar outer robe. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_duanzhengming__ch01_prime_emperor_base.prepared.json`。
