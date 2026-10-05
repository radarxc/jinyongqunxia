---
asset_id: por_npc_duanyanqing__ch01_elder_disabled_base
subject_id: npc_duanyanqing
name: 段延庆
book: ch01_tianlong
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch01/por_npc_duanyanqing__ch01_elder_disabled_base.png
manifest: assets/default/character/male/ch01/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/a902317564c2b237307ad093d069bc01f0a54f30b803da975c5422b8d5ea73a0.png
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

# 段延庆 · 人物写实修正

## 人物与阶段

- subject_id：npc_duanyanqing
- book：ch01_tianlong
- gender：male
- age_variant：elder

## 本轮人物写实规范

段延庆保留旧面伤、喉伤与双腿残废，以两根细钢杖支撑；旧青灰袍完整遮腿，不能把清晰返修误做健步或失去伤残。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_duanyanqing__ch01_elder_disabled_base/prompt-32b7a9007d981944f4c2b8c807b59dc9fb7d403dff91ff14ab2b2d03fcf12479.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：段延庆；书界：ch01_tianlong；年龄阶段：elder；性别：male。
身份与阶段：万劫谷至珍珑阶段的四大恶人之首，双腿残废、喉伤与旧面伤均已存在
年龄与体貌：中老年男子，确龄待考；身形瘦削，面部有旧伤、神色少变，双腿残废，以两根细钢杖代足，以腹语交流
骨相与体型细化：瘦长脸、凹陷双颊、灰黑稀须、冷静眼神，旧疤只表现皮肤起伏不见新鲜创口，下肢瘦弱且不承重；按中老年瘦长体态约7头身；支撑姿势与残疾优先于标准站姿
服饰与发式：旧青灰长袍、深灰布裤与软鞋，窄带束腰，灰黑发束入低髻，衣物完整遮盖双腿，少量磨损
兵器与标志物：双手各握一根细长钢杖，对应 eq_duanyanqingzhang；两杖下端稳触地、支撑躯干，双足轻垂不承重，杖尖无剑气
气质与姿态：身体保持竖直但重量落在双杖，肘肩受力可信，两杖略分开形成稳定支点，表情沉静严峻、嘴部微闭

REPAIR-SPECIFIC DIRECTION:
段延庆保留旧面伤、喉伤与双腿残废，以两根细钢杖支撑；旧青灰袍完整遮腿，不能把清晰返修误做健步或失去伤残。
Preserve the gaunt middle-aged-to-elderly man, hollow cheeks, sparse grey-black beard and healed facial scarring with intact skin; do not remove the disability or create an open wound. Both legs are present, thin and non-weight-bearing under the intact old blue-grey robe. Each hand separately grips one slender STEEL staff; there are exactly two staffs, both lower tips fully visible and planted on the ground with convincing shoulder and elbow support. The torso is held upright by the pair of staffs, feet lightly hanging or resting without carrying his body weight. Draw a complete continuous old robe with slight mellow fabric age only: sewn cuffs, a complete hem, no tears, hanging shreds, holes or shredded sash. Dark grey trousers, soft shoes and a low gathered hair knot remain. His mouth is nearly closed and expression controlled. No walking stride, wheelchair, amputation, huge crutch, blade, bloody wound or magic.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No healed walking legs, weight-bearing athletic stance, missing leg, single staff, wooden crutch, spear tips, sword beams, wheelchair, open injuries or horror disfigurement. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No healed walking legs, weight-bearing athletic stance, missing leg, single staff, wooden crutch, spear tips, sword beams, wheelchair, open injuries or horror disfigurement. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_duanyanqing__ch01_elder_disabled_base.prepared.json`。
