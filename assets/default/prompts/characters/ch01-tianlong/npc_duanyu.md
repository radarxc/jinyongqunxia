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
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "面容源自剧集剧照且偶像化（飘发飘带、侧脸回眸），按原著青衫书生的憨直书卷气重做，连同五幅场景"
reference_upload:
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
codex_prompt_rev: 2026-10-02
---

# 段誉 · 人物写实修正

## Gemini 提示词

> 2026-10-02 AR-31 改写（1 号出图员，codex exec · image_gen 出图）：重要人物借鉴经典影视造型，只写成文字——不写演员名、不上传剧照、原创面孔；主角和美人画得好看，去 AI 味，禁止幼态。出图时上传两张同性别基线立绘作画风参考（放在最后）。审核组原稿保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】段誉，《天龙八部》北宋大理国镇南王世子，初入江湖、无量剑比斗初见时；尚未学会北冥神功、凌波微步和六脉神剑。温雅好辩、不愿争斗，有几分书呆子气。
【年龄与体态】约二十岁的成年青年，身形修长清瘦，但肩背挺直、不是病弱（约 7.5 头身）。
【经典造型】借鉴经典武侠影视里这个角色深入人心的造型，只取发型、装束、配色、标志道具、气质和脸型类型，用原创面孔画出来，不像任何真实演员：九十年代经典港剧里那位温润如玉的段公子——头顶束一个小髻、戴一顶小巧的白玉小冠，其余黑发整齐地垂在背后；一身浅色书生长衫；手持折扇；眉清目秀、笑容温和又带点憨直，满身书卷气。
【面容】清秀的长圆脸、额头饱满，眉毛细长平顺、眉尾略垂，眼睛细长明亮、笑起来眼尾弯弯，鼻梁细直，嘴唇略厚、嘴角常带一点温和憨直的笑；肤色白净但有真实纹理。清秀俊逸的翩翩公子，书卷气多于江湖气。
【发式】头顶的黑发束成小髻，戴一顶小巧的白玉小冠，其余黑发整齐地垂在背后（不随风乱飘，不系飘带）。
【服饰】原著是青衫书生：浅青色交领右衽长衫（宋式，衣料细洁），玉白色内层，腰系窄灰青丝绦，衣缘只有一小段大理风格的几何纹，长裤、浅灰布履，不堆金饰。
【道具】右手持一柄半开的素面折扇（竹扇骨、扇面无字无画），停在胸腹前；左手空着、自然垂下；不佩剑。
【姿态与神情】身体正面站立、头部端正，目光看向前方，嘴角带一点温和而憨直的笑，像正要和人讲一番道理。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要像任何真实演员或明星；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要飘飞的长发和发带、侧脸回眸；不要女性化面孔；不要佩剑；不要六脉剑气光效；不要帝王冠冕。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。参考图只取画风、光线、质感和背景处理，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## 审核组 Gemini 提示词（2026-10-02 AR-30 重审稿；AR-31 改写前，历史，不再用于出图）

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出**。面容源自剧集剧照且偶像化（飘发飘带、侧脸回眸），按原著青衫书生的憨直书卷气重做，连同五幅场景。
> 本条不上传任何参考图（`reference_upload: []`）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】段誉，《天龙八部》北宋大理国镇南王世子，初入江湖、无量剑比斗初见时；尚未学会北冥神功、凌波微步和六脉神剑。温雅好辩、不愿争斗，有几分书呆子气。
【年龄与体态】约二十岁的成年青年，身形修长清瘦，但肩背挺直、不是病弱（约 7.5 头身）。
【面容】清瘦的长圆脸、额头饱满，眉毛细长平顺、眉尾略垂，眼睛细长、笑起来眼尾弯弯，鼻梁细直、鼻头略圆，嘴唇略厚、嘴角常带一点憨直的笑；肤色白净但有真实纹理，一身书卷气，不是偶像脸。整体是读书人的清秀与憨直，而不是精修偶像。
【发式】黑发整齐束成顶髻，戴一顶小巧的青色软巾（或一支素玉簪束发），不披散长发、不系飘带。
【服饰】原著是青衫书生：低饱和浅青色圆领长衫（宋式襕衫），玉白色内层，腰系窄灰青丝绦，衣缘只有一小段大理风格的几何纹，长裤、浅灰布履，衣料细洁不堆金饰。
【道具】右手持一柄半开的素面折扇（竹扇骨、扇面无字无画），停在胸腹前；左手空着、自然垂下；不佩剑。
【姿态与神情】身体正面站立、头部端正，目光看向前方，嘴角带一点温和而憨直的笑，像正要和人讲一番道理。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要飘逸长发、发带飘带、侧脸回眸；不要偶像脸或女性化面孔；不要佩剑；不要六脉剑气光效；不要帝王冠冕。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

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
