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
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "旧图以剧照为第一身份参考生成（A 级肖像风险；REVIEW-portraits-A 待作者裁定项，按默认重出），按原著外貌用文字原创重做"
reference_upload: []
codex_prompt_rev: 2026-10-02
---

# 段正明 · 人物写实修正

## Gemini 提示词

> 2026-10-02 按原著外貌以文字重写（文字稿由 1 号出图员起草，3 号出图员写回并出图；codex exec · image_gen）：旧图以剧照为第一身份参考生成，属 `tools/agents/reports/REVIEW-portraits-A-ch00-04.md` 的「剧照派生 A 级配角 · 待作者裁定」项，协调者按默认转为本轮重出。不写演员名、不用剧照、原创面孔，禁止幼态；出图只上传两张同性别基线立绘作画风参考，不上传身份参考（`reference_upload: []`）。frontmatter 的 `references` 与本节以下的旧提示词是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】段正明，《天龙八部》大理国保定帝，段誉的伯父；剃度出家之前、在位时的常服形象。仁厚端方、有帝王的雍容气度。
【年龄与体态】五十岁上下，身材适中、腰背挺直，约 7.5 头身。
【面容】方正的长脸、额头宽阔；浓眉、眼神温厚而有威仪；鼻梁挺直；颏下与唇上是修剪整齐的黑色三绺长须，鬓角微霜；面容端正、仁厚可亲（原创扩展）。
【发式与首服】头戴黑色软脚幞头，鬓角整齐。
【服饰】深赭色圆领窄袖常服袍（宋代式样），腰束镶几块素玉的革带，黑色靴；衣料是厚实的暗纹绸缎，颜色沉稳。
【道具】空手，双手在腹前相叠。
【姿态与神情】端正站立，神情温厚而威严。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要像任何真实演员或明星；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要冕旒、龙袍；不要袈裟（尚未出家）；不要兵器。
【画风基线】随提示词上传的两张参考图是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。参考图只取画风、光线、质感和背景处理，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

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
