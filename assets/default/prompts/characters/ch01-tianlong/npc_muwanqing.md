---
asset_id: por_npc_muwanqing__ch01_youth_unmasked_base
subject_id: npc_muwanqing
name: 木婉清
book: ch01_tianlong
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch01/por_npc_muwanqing__ch01_youth_unmasked_base.png
manifest: assets/default/character/female/ch01/manifest.yaml
references:
- path: .agents/coord/portrait-generation/realism-20261001/base-reference-archives/5da215f04c5befa77848b34f115559bcea6576aa4f855ae7eabd428eebbe9cdd.png
  use: 已实际view。仅本人身份、年龄体型与可辨面部特征；不借旧图碎墨、纸片、斑驳、破洞或撕裂衣料。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际view，SHA 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，本轮写实candidate。仅自然面手、完整人体体积、连贯衣料的渲染质量；不借萧峰身份、性别体型、须发衣装、掌势或龙影。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际view。仅同性别项目低饱和色卡，文档服色优先；不借身份、年龄、发式、服装、道具、旧碎墨或织纹。基线审批原样保留。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view。仅背景的浅淡水墨远景、空气层次与留白；完全忽略女性人物脸、薄纱、衣纹、肤质和姿势，水墨不能侵入本体。
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "面容源自剧集剧照（肖像风险），按原著黑衣冷艳女侠用文字原创重做"
reference_upload:
- assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
---

# 木婉清 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出**。面容源自剧集剧照（肖像风险），按原著黑衣冷艳女侠用文字原创重做。
> 本条不上传任何参考图（`reference_upload: []`）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】木婉清，《天龙八部》段誉初入江湖时结识的黑衣女侠（香药叉），修罗刀秦红棉之徒；面纱已揭下、身世誓言冲突的阶段。冷峻倔强、外冷内热。
【年龄与体态】原著约十八岁，画成约二十岁的成年女子，身材高挑劲瘦，有习武者的利落。成年女性的身体比例（约 7 头身），衣着完整端庄、不透明、不暴露、不性感化。
【面容】揭下面纱后容貌清丽而冷：鹅蛋脸略长、下颌线利落，眉毛浓而直、眉尾上挑，一双黑眸冷冷的、带戒备，鼻梁挺直，唇形薄而紧抿，肤色比常人略白（长年蒙面）；神情冷峻疏离（原创扩展）。
【发式】黑发束紧成髻，一根乌木簪固定；揭下的黑纱折起系在颈侧，不遮五官。
【服饰】哑光黑色交领右衽窄袖长衫，深灰长裙，裙内有便于行动的长裤，黑布腰带，深色软靴。
【道具】右腕袖口内藏一具小巧的袖箭筒（只露出一点筒口）；腰间挂一柄短刀入鞘。
【姿态与神情】正面站立，一手按在腰间刀柄附近，一手垂下；眼神冷而倔强。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要手扶肩头或撩发的摆拍姿势；不要白衣或彩衣；不要黑纱遮脸（此阶段已揭下）；不要浓妆。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_muwanqing
- book：ch01_tianlong
- gender：female
- age_variant：youth

## 本轮人物写实规范

木婉清是露面后大理阶段的黑衣青年女侠；衣摆与颈侧黑纱变完整衣片，保留左腕收妥袖箭护具。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_muwanqing__ch01_youth_unmasked_base/prompt-ca04e317237f26d095864a54a2c1cec393ed037adcbcde31d1e896f0af37b2ac.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with a delicate pale INK-WASH BACKGROUND. The human figure is solid, continuous and beautifully rendered: finely resolved natural facial features, clear eyes, believable skin and age, anatomically readable hands, coherent soft light and shade, intact opaque cloth with clean sewn hems, precise tailoring and a few broad weight-bearing folds. Use refined hand-painted realism. The skin, hair, clothes and shoes are fully painted solid forms; paper texture and loose ink marks belong exclusively behind the figure. This is a clarity repair of an existing character identity, not a new identity or a costume borrowed from another reference.

REFERENCE ROLES ARE SEPARATE. Image 1 supplies this subject's identity, face, age and recognizable body type ONLY. Reconstruct all garments from the written base-stage specification below, never copying fragmented brushwork, holes, ragged edges, damaged fabric or old folds from image 1. Image 2, the completed realistic Xiao Feng image, supplies ONLY the quality of coherent human rendering, clear hands, skin and intact cloth; do not borrow its male face, muscular physique, hairstyle, costume, palm gesture, action pose, dragon or scene. Image 3 supplies ONLY a muted project color range, not identity, body, brush texture or equipment. Image 4 supplies ONLY airy pale ink-wash background language, not its woman, face, outfit, thin translucent cloth or flowing ribbons.

BASE-STAGE CHARACTER FACTS (these override clothing and pose seen in every reference):
时代：《天龙八部》北宋背景；大理、契丹或中原身份及服制分别按本人设定，不作后世朝代混搭。
角色：木婉清；书界：ch01_tianlong；年龄阶段：youth；性别：female。
身份与阶段：无量山后与段誉相识、面纱已经揭下且仍在大理身世誓言冲突阶段，保持黑衣行旅造型
年龄与体貌：青年女子，确龄待考；黑衣、黑纱遮面的女侠形象，揭面后容貌清丽，神态冷峻，擅袖中箭术
骨相与体型细化：清瘦鹅蛋脸、较平直眉、细长眼、收紧嘴角，身形修长而结实，目光警惕、气质冷而不妖艳；约7头身
服饰与发式：哑光黑色右衽窄袖长衫、深灰长裙内有行动长裤，黑布带、深色软靴；黑发束紧成髻，已揭下的黑纱系收在颈侧不遮五官
兵器与标志物：左腕袖口下露出一小段朴素袖箭护具轮廓，固定带可读，箭矢全部收妥；装置外形为原创扩展且不展示内部机构，不另配弩枪；右手空着
气质与姿态：微侧稳立，一手轻按颈侧收好的黑纱，一手自然垂下，肩背警觉而不摆攻击姿势

REPAIR-SPECIFIC DIRECTION:
木婉清是露面后大理阶段的黑衣青年女侠；衣摆与颈侧黑纱变完整衣片，保留左腕收妥袖箭护具。
Keep the current subject's own clear slender oval face, straight brows, narrow alert eyes and cold reserved young-adult expression, not the female palette sample's face. Her face is fully uncovered at this stage: the removed black veil is folded neatly and secured beside the neck, one complete piece, never covering eyes or mouth or streaming as torn pennants. Make the matte-black narrow-sleeved right-lapped long shirt and dark-grey skirt over action trousers fully opaque, substantial and intact; broad continuous skirt panels instead of translucent pointed shards or many floating strips. One plain black belt, dark soft boots, black hair gathered tightly in a bun. A small external sleeve-arrow guard is visible beneath the LEFT wrist cuff with a readable fixing strap, all arrows secured and no exposed mechanism. The left hand may lightly touch the gathered veil while the right hand is empty and relaxed. Stable watchful non-attacking pose. No hand crossbow, gun, sword or extra weapons.

Single subject, one view, complete full body, vertical 2:3 PNG composition with comfortable margins around head, hands, feet and every assigned prop tip. Eye-level neutral perspective, calm readable base-portrait staging; retain a seated or disabled body's actual pose when specified. All garments are fully opaque and structurally complete. Soft diffuse light from upper left, clear natural eyes and fingers, no theatrical rim light. Opaque warm pale-grey background with an extremely faint distant ink wash, mostly open space; no identifiable classical episode, narrative location, extra person, supernatural symbol or writing. Ink scenery stays behind the clean figure. Traditional Han crossed collars are right-lapped: wearer's left panel lies over right. Do not apply that collar rule to an explicitly different regional garment. Image native PNG bytes and actual dimensions will be preserved by the production pipeline; there is no printed measurement or label.

完整排除项 / Exclusions:
No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No covered face, transparent black skirt, torn veil, shredded streamers, excessive floating ribbons, exposed arrow mechanism, crossbow gun, sword or attacking pose. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.
```

## 排除项

No dry-brush holes, paper erosion, peeling paint, white flecks, collage, cut-paper facets, fragmented watercolor mottling, random scratch texture, shredded ribbons, frayed ragged hems, holes or unjustified dirt on the human figure. No blurry face, indistinct fingers, merged hand and object, broken wrists, extra digits or limbs, missing legs, cropped head or feet, transparent garments, sexualization, exaggerated bodybuilding, beauty-filter plastic skin, anime eyes, photography or 3D model appearance. No cross-character identity transfer, no unrequested weapons, magic beams, glowing props, dragons, deities or battle effects in this base portrait. No text, caption, stamp, signature, logo, new decorative watermark, panels or multiple views; retain tool-native provenance. No covered face, transparent black skirt, torn veil, shredded streamers, excessive floating ribbons, exposed arrow mechanism, crossbow gun, sword or attacking pose. No modern clothing or equipment, Ming headband, Qing queue, horse-hoof cuffs, later court hat, Japanese kimono, European fantasy armor or dynastic costume mixing.

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_muwanqing__ch01_youth_unmasked_base.prepared.json`。
