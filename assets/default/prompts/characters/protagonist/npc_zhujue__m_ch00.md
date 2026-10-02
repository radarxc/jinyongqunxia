---
asset_id: por_npc_zhujue__ch00_m_base
subject_id: npc_zhujue
name: 主角（男）· 春秋末·越国
book: ch00_yuenv
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png
manifest: assets/default/character/male/ch00/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/1b0942d56337c5c208c5e3252ee69d1789312b15b35f14a6650c77fcebf125ca.png
  use: 已实际view。仅保留原创男主本人脸、约28岁成年感、匀称体型；不沿用衣料剥落、碎面和破边。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view。只取完整写实人物的面手与连贯布料渲染质量；不借萧峰脸、络腮胡、魁梧体型、装束、掌势、龙或少室山背景。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际view。仅作男角低饱和色卡；不借脸、长袍、剑、明代发式或密集织纹。基线实际审批不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view。仅取浅淡水墨远景和留白背景，不借女性脸、身体、发式、薄纱衣或碎片人物画法。
status: ready
realism_revision: user_character_realism_20261001
---

# 主角（男）· 春秋末·越国 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhujue
- book：ch00_yuenv
- gender：male
- age_variant：prime

## 本轮人物写实规范

ch00男主清晰度返修，作为后续跨书本人写实身份新锚点；约28岁俊朗正气、均衡结实而不魁梧，左眉尾下浅褐小痣。竹青短褐和麻色裤恢复完整布料，不将旧碎墨衣料升级为碎甲或华贵装备。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhujue__ch00_m_base/prompt-7ce96ca3974dddf164649e566ef320fd99ff3e1639be32ac888fda113c18eef0.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
身份与阶段：现代人入书后的普通江湖行旅者；本图是时代基础装，不代表特定门派、现代职业或结局
面容锚点：男性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；偏长的方圆脸，颧骨适度、下颌转折清楚而不宽阔，平直浓眉且左眉尾略高，深棕色中等杏眼，鼻梁直、鼻头圆钝，薄上唇与略厚下唇，左眉尾下有一颗浅褐小痣；暖中性肤色，保留自然纹理与极淡胡茬，无深皱纹；中等偏高、肩背匀称、四肢结实而不魁梧，约7.5头身；原生发质乌黑、直而略硬，保留的发丝密实；目光专注而有好奇心，嘴角平和，警觉但不怯弱。
本时代服饰发式：深浅竹青的简朴右衽短褐上衣、浅麻色长裤，窄布带束腰，裤脚收束、素面布履；黑发梳拢成简约椎髻，以深褐布条束紧，不戴后世冠帽
兵器道具：空手、无随身兵器，不携青铜名剑或竹棒
气质姿态：双手空着自然放松，尚在观察陌生环境；身体微侧、双足站稳，不模仿越女教学持竹姿势

REPAIR-SPECIFIC DIRECTION:
ch00男主清晰度返修，作为后续跨书本人写实身份新锚点；约28岁俊朗正气、均衡结实而不魁梧，左眉尾下浅褐小痣。竹青短褐和麻色裤恢复完整布料，不将旧碎墨衣料升级为碎甲或华贵装备。
Build a clean, modest bamboo-green right-lapped short travel tunic with an unbroken sewn hem, plain flax-colored trousers gathered at the ankles, a narrow fabric belt and simple cloth shoes. No long split streaming robe tails, bulky wrist wraps or new layered panels. Preserve the protagonist's moderately long squared-oval face, slightly raised left eyebrow tail and small pale-brown mole immediately below that tail. Warm neutral skin, extremely faint stubble, quiet resolute open gaze. Black hair is completely gathered into a simple early Yue topknot with a dark-brown cloth tie; no later crowns or swords. Keep both hands relaxed and empty with clear separation from the torso, both feet grounded. No Xiao Feng beard or huge shoulders. This completed revision will be the same person's anchor for subsequent era costumes.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No Han-or-later cap, Song jacket, Ming headband, Qing queue, cloak, bronze sword, bamboo staff or modern object.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No Han-or-later cap, Song jacket, Ming headband, Qing queue, cloak, bronze sword, bamboo staff or modern object.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhujue__ch00_m_base.prepared.json`。
