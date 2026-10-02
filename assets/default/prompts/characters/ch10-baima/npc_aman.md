---
asset_id: por_npc_aman__ch10_base
subject_id: npc_aman
name: 阿曼
book: ch10_baima
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch10/por_npc_aman__ch10_base.png
manifest: assets/default/character/female/ch10/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/90628b588d1fab06b72eb81e5c72b89c9c1642f57376252a67c0369a6db825d6.png
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

# 阿曼 · 人物写实修正

## 人物与阶段

- subject_id：npc_aman
- book：ch10_baima
- gender：female
- age_variant：youth

## 本轮人物写实规范

阿曼保持成年哈萨克青年女子的温暖自信和部落日常身份，砖红完整外衣、米白长裙、素花帽与整洁双辫；修复袖裙碎片层染。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_aman__ch10_base/prompt-73bd8197e2c6c88e6b5ea746d707873f293f92d88e6eedf37b3ebccfe129f267.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
角色：阿曼；书界：ch10_baima；年龄阶段：youth；性别：female。
身份与阶段：哈萨克青年女子阿曼，车尔库之女，风雪夜危机之前的部落日常阶段
年龄与体貌：青年；采用成年青年外观；柔和偏圆的椭圆脸，颊部自然饱满，弯眉与清亮杏眼，鼻唇自然秀丽，肤色健康温暖，体态匀称轻健，目光坦然、有主见，笑意温和
服饰与发式：低饱和砖红长外衣配米白完整长裙，袖口收敛，外衣简约对襟，腰间窄织带，软皮靴；头戴低矮素花帽，黑发编成两束整洁发辫顺垂肩后；仅帽缘与衣边少量暗色几何绣边，服饰为草原日常原创选款
兵器与标志物：一方折叠花巾，作为本书救援线花巾母题的简约视觉呼应；不是高昌地图手帕，也不加兵器
气质与姿态：双脚站定，一手轻持折叠的无字小花巾，另一手自然放在腰带旁，肩背自然舒展；姿态主动而从容，不作受困、捆绑或等待支配的姿势

REPAIR-SPECIFIC DIRECTION:
阿曼保持成年哈萨克青年女子的温暖自信和部落日常身份，砖红完整外衣、米白长裙、素花帽与整洁双辫；修复袖裙碎片层染。
Keep her adult Kazakh identity and healthy warm complexion; do not turn her into a Han scholar lady or a child. Tailor the brick-red coat as one complete modest front-opening regional everyday garment over an opaque warm-ivory full skirt, narrow woven belt, restrained geometric edging, soft leather boots and a low plain floral cap. Each braid is neatly gathered. Redraw continuous broad cloth planes in the sleeves and skirt, no patchy white paint. One hand lightly holds a small folded floral kerchief with no writing or map, the other rests naturally beside the belt. Calm open posture and independent direct warm gaze; no weapon, restraint or victim tableau.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No Han court dress, palace hair crown, adult-to-child age change, map markings on the kerchief, weapons or rescue scene.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No Han court dress, palace hair crown, adult-to-child age change, map markings on the kerchief, weapons or rescue scene.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_aman__ch10_base.prepared.json`。
