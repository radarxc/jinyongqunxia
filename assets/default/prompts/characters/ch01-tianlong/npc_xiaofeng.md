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
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "面容源自剧集剧照（肖像风险）且体格不够魁伟、缠头像南亚头巾，按原著国字脸魁伟大汉重做，连同五幅场景"
reference_upload:
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
codex_prompt_rev: 2026-10-02
---

# 萧峰 · 人物写实修正

## Gemini 提示词

> 2026-10-02 AR-31 改写（1 号出图员，codex exec · image_gen 出图）：重要人物借鉴经典影视造型，只写成文字——不写演员名、不上传剧照、原创面孔；主角和美人画得好看，去 AI 味，禁止幼态。出图时上传两张同性别基线立绘作画风参考（放在最后）。审核组原稿保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】萧峰（此时仍叫乔峰），《天龙八部》北宋（约 1093 年）丐帮帮主，杏子林身世揭露之前；豪迈坦荡、重义气的盖世英雄。
【年龄与体态】约三十岁的壮年男子，身材高大魁伟（明显比常人高出半头），肩宽背厚、胸膛宽阔，前臂粗壮、手掌宽大，筋骨扎实而不是健美肌肉（约 7.5 头身）。
【经典造型】借鉴经典武侠影视里这个角色深入人心的造型，只取发型、装束、配色、标志道具、气质和脸型类型，用原创面孔画出来，不像任何真实演员：新世纪经典大陆剧里那位豪气干云的乔峰——粗犷英武、浓眉大眼、满脸短硬的络腮胡茬，黑发在头顶束髻、用深褐布巾裹住，鬓边几缕散发；一身灰褐粗布袍、宽腰带；顾盼之间极有威势，又坦荡磊落、笑起来豪爽。
【面容】原著写他浓眉大眼、高鼻阔口、四方的国字脸、颇有风霜之色、顾盼之际极有威势。具体为：四方国字脸、下颌方正宽厚，颧骨高；浓黑粗眉、眉骨突出，一双大眼目光如电；鼻梁高、鼻翼宽；阔口厚唇；两颊与下巴是短而硬的络腮胡茬（不是长须）；常年行走江湖的日晒肤色，额头两道浅横纹，眼角有风霜细纹。粗犷英武、相貌堂堂，是让人心折的盖世英雄——不凶、不丑。
【发式】黑发全部束成发髻，用一条深褐色旧布巾简单包住发髻（宋代男子常见的裹巾，贴合头形，不是大缠头），鬓边几缕散发。
【服饰】原著是灰色旧布袍、已微有破烂：灰色右衽旧布长袍，袖口和下摆有几处细密的补缀但整洁，外罩深炭灰短褂，腰间粗布带侧结，深色布裤、旧布鞋。
【道具】左手竖握一根青绿竹棒（丐帮帮主信物打狗棒，竹节清楚、无金属刃），棒梢高过肩、下端点地；右手自然垂下。
【姿态与神情】双脚分开稳稳站立，胸膛挺起、肩背舒展；目光坦荡威严、不怒自威，嘴角带一点豪迈的笑意，不摆攻击架势。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要像任何真实演员或明星；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要瘦削或中等身材、不要窄长脸；不要大缠头或包头巾；不要长须、白发；不要契丹皮袍与左衽（此阶段尚是汉人装束）；不要龙形特效。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。参考图只取画风、光线、质感和背景处理，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## 审核组 Gemini 提示词（2026-10-02 AR-30 重审稿；AR-31 改写前，历史，不再用于出图）

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出**。面容源自剧集剧照（肖像风险）且体格不够魁伟、缠头像南亚头巾，按原著国字脸魁伟大汉重做，连同五幅场景。
> 本条不上传任何参考图（`reference_upload: []`）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】萧峰（此时仍叫乔峰），《天龙八部》北宋（约 1093 年）丐帮帮主，杏子林身世揭露之前；豪迈坦荡、重义气的盖世英雄。
【年龄与体态】约三十岁的壮年男子，身材高大魁伟（明显比常人高出半头），肩宽背厚、胸膛宽阔，前臂粗壮、手掌宽大，筋骨扎实而不是健美肌肉（约 7.5 头身）。
【面容】原著写他浓眉大眼、高鼻阔口、四方的国字脸、颇有风霜之色、顾盼之际极有威势。具体为：四方国字脸、下颌方正宽厚，颧骨高；浓黑粗眉、眉骨突出，一双大眼目光如电；鼻梁高、鼻翼宽；阔口厚唇；两颊与下巴是短而硬的络腮胡茬（不是长须）；皮肤是常年行走江湖的日晒色，额头两道浅横纹，眼角有风霜细纹。
【发式】黑发全部束成发髻，用一条深褐色旧布巾简单包住发髻（宋代男子常见的裹巾，贴合头形，不是大缠头），鬓角短而整齐。
【服饰】原著是灰色旧布袍、已微有破烂：灰色右衽旧布长袍，袖口和下摆有几处细密的补缀但整洁，外罩深炭灰短褂，腰间粗布带侧结，深色布裤、旧布鞋。
【道具】左手竖握一根青绿竹棒（丐帮帮主信物打狗棒，竹节清楚、无金属刃），棒梢高过肩、下端点地；右手自然垂下。
【姿态与神情】双脚分开稳稳站立，胸膛挺起、肩背舒展；目光坦荡威严、不怒自威，嘴角带一点豪迈的笑意，不摆攻击架势。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要瘦削或中等身材、不要窄长脸；不要大缠头或包头巾；不要长须、白发；不要契丹皮袍与左衽（此阶段尚是汉人装束）；不要龙形特效。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

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
