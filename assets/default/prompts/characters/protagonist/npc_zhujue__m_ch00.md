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
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "男主跨书锚点：保留现有原创脸型与体格，加左眉断疤与朱红发绳作全书辨识标志，去模特感，作为十四个时代的同一身份参考"
reference_upload:
- assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
---

# 主角（男）· 春秋末·越国 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**微调重出**。男主跨书锚点：保留现有原创脸型与体格，加左眉断疤与朱红发绳作全书辨识标志，去模特感，作为十四个时代的同一身份参考。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】主角（男）：本作原创的穿越者——一个落入《越女剑》春秋末越国（约公元前 482 年）的现代人。此刻刚入书，是在越地山野间观察陌生环境的普通行旅者。
【身份参考】随提示词上传的第 1 张图是主角的上一版立绘：沿用他的脸型、五官比例、发型和体格作为本人基础，但按下文修正——加上左眉断疤和朱红发绳，皮肤、神情更真实，去掉模特感和精修感。
【本人面容（十五个时代统一，不能变）】约二十八岁的现代中国男青年，原创面孔，不像任何演员或书中其他人物。偏长的方圆脸，颧骨适中，下颌转折清楚但不宽；平直的浓眉，左眉眉峰处有一道约一厘米长的浅白色旧疤，把左眉截成两段（全书标志，必须清楚可见）；左眉尾下方一颗浅褐色小痣；深棕色中等大小的杏眼、内双，眼神专注、带一点好奇；鼻梁直、鼻头圆钝；上唇薄、下唇略厚，嘴角平和；暖中性略带日晒的肤色，唇上与下巴有极淡的胡茬，眼角有一两道细纹。中等偏高的个子，肩背匀称，四肢结实而不魁梧（约 7.5 头身）；乌黑的头发直而略硬。整体是踏实可靠、警觉而不凶的普通青年，不是偶像或模特。
【主角标志】发髻根部（清代则是辫梢）系一根褪色的朱红细绳，露出短短的绳头——每个时代都保留这根红绳。
【服饰】深浅竹青相间的简朴右衽短褐上衣（长及大腿中部，缝边完整），浅麻色长裤、裤脚收束，窄布带束腰，素面布履；黑发梳成简约椎髻，深褐布条束紧，髻根系朱红细绳；不戴后世冠帽。
【道具】空手，不带青铜剑、竹棒或任何兵器。
【姿态与神情】身体基本正面，双手空着自然垂在身侧，双脚稳稳站立；神情专注而好奇，像刚抬头打量这片陌生山野。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要明星脸或模特式五官；不要与书中男女主角撞脸；不要具名神兵、门派徽记、官服；不要年龄变小或变老。不要春秋以后的冠帽、宋明服饰或清代发辫。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

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
