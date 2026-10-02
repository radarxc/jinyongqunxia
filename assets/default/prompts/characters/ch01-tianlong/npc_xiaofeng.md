---
asset_id: por_npc_xiaofeng__ch01_prime_gaibang_base
subject_id: npc_xiaofeng
name: 萧峰
book: ch01_tianlong
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png
manifest: assets/default/character/male/ch01/manifest.yaml
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view并核验manifest为本轮写实candidate。仅本人身份面容、年龄体型及完整人物渲染质量；不借该场景姿态、阶段服装、背景或衣料笔触，严格按本基础文档重绘。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际view。仅同性别项目低饱和色卡，文档服色优先；不借身份、年龄、发式、服装、道具、旧碎墨或织纹。基线审批原样保留。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view。仅背景的浅淡水墨远景、空气层次与留白；完全忽略女性人物脸、薄纱、衣纹、肤质和姿势，水墨不能侵入本体。
status: ready
realism_revision: user_character_realism_20261001
---

# 萧峰 · 人物写实修正

## 人物与阶段

- subject_id：npc_xiaofeng
- book：ch01_tianlong
- gender：male
- age_variant：prime

## 本轮人物写实规范

萧峰取本人少室新版骨相，但回到杏子林前乔峰丐帮帮主阶段：中灰袍深炭短褂、全头发收裹巾、左手青绿打狗棒，静态豪迈。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaofeng__ch01_prime_gaibang_base/prompt-e30e5aff9a6a6c7bb22487ec37d84057080a41ba0a5a06b225f6ecc2905755ac.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES: Image 1 is this same Xiao Feng in a later Shaoshi episode, used ONLY for his face, age, body identity and coherent realistic human rendering quality. The earlier base-stage costume, hair, calm standing pose and GREEN BAMBOO STAFF must come entirely from the written facts below. Do not copy the episode's palm gesture, loose hair, cloak, dragon or scene. Image 2 is ONLY the project muted male palette, never identity or equipment. Image 3 supplies ONLY an airy pale ink background, never its woman, costume, translucent fabric or fragmented human brushwork.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：萧峰；书界：ch01_tianlong；年龄阶段：prime；性别：male。
身份与阶段：杏子林身世公开前的丐帮帮主阶段，仍以乔峰之名行走江湖，尚未任辽南院大王
年龄与体貌：壮年、约三十岁观感（精确年龄待考）；身材魁梧，浓眉阔口，豪迈坦荡；中原成长背景下穿灰色旧布袍
骨相与体型细化：方下颌、宽厚胸廓和肩背，前臂粗壮而筋骨可信，短络腮胡，日晒肤色，睁开的自然眼睛；成年约7.5头身
服饰与发式：中性灰旧布右衽长袍，深炭灰短外褂，深色布裤和布鞋；窄布带侧结；黑发全部收进紧实裹巾，包髻完整、短鬓角贴服、耳后颈后无游离长碎发，衣边仅少量磨损
兵器与标志物：右手自然垂放，左手轻持丐帮信物打狗棒 eq_dagoubang，青绿竹质细棒有节理、无金属利刃，沿身体外侧竖直低收，棒梢与下端全部入画；此时尚未辞去帮主，归还信物之后不得复用本变体
气质与姿态：胸膛打开、脊柱挺拔、肩背舒展，双脚坚实落地，持棒手放松且不拄杖示弱，神情坚定豪迈而非攻击姿势

REPAIR-SPECIFIC DIRECTION:
萧峰取本人少室新版骨相，但回到杏子林前乔峰丐帮帮主阶段：中灰袍深炭短褂、全头发收裹巾、左手青绿打狗棒，静态豪迈。
The character in image 1 is the SAME adult Xiao Feng, but the base portrait must depict his EARLIER Qiao Feng Beggar Sect chief stage before the Xingzilin identity revelation. Keep the strong square-jawed face, short neat beard, naturally sun-warmed skin and broad credible physique, not a bodybuilder. Replace the later scene's costume with a complete neutral-grey right-lapped old cloth long robe, a DARK-CHARCOAL SHORT JACKET rather than a travelling shoulder cloak, dark trousers and plain cloth shoes. Old cloth is intact, with at most faint softened wear, never ragged hems, patchy scuffs or loose strips. All black hair is completely tucked into a tightly wrapped headcloth; no free long hair behind neck. Stand calmly upright with open chest and grounded feet, a firm generous leader's expression, NOT the reference's attacking palm stance. RIGHT hand hangs relaxed. LEFT hand lightly holds the assigned slender green BAMBOO DOG-BEATING STAFF vertically low beside the body, with visible bamboo nodes and both ends completely in frame, no metal blade. It is the pre-resignation leader's token, not a crutch or combat pose. No dragon, Shaoshi gate, Liao regalia, crown or later-stage cloak.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No empty left hand, missing Dog-Beating Staff, metal sword staff, crutch-like weak stance, palm attack, Liao crown, later northern cloak, loose long hair, dragon or Shaoshi setting. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No empty left hand, missing Dog-Beating Staff, metal sword staff, crutch-like weak stance, palm attack, Liao crown, later northern cloak, loose long hair, dragon or Shaoshi setting. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaofeng__ch01_prime_gaibang_base.prepared.json`。
