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
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "白马改唐代（DES-baima-tang 合入）：旧图是清初剃发留辫 / 瓜皮帽 / 清式袍褂，且男女各自同脸；按唐代名录 §2 的发式、服色与标志物重出，脸部按 C 组报告 §1 区分。"
codex_prompt_rev: 2026-10-02
reference_upload:
- assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
- assets/default/baseline/character/female/ref_npc_xiaolongnv__ch03_base01.png
classic_ref: "无（白马已改唐代 AR-26，不用清代剧照；《金庸群侠传》里没有可靠的本人头像，只用文字与基线，按 docs/design/catalog/npcs-ch10-baima.md §2 与 chapters/10-baima.md §8.9 的唐代设定）"
---

# 阿曼 · 人物写实修正

## Gemini 提示词

> 2026-10-02 AR-32 重出（8 号出图员，codex exec · image_gen）：本人没有可用的经典剧照或可靠游戏头像，只用文字与两张同性别画风基线（缩小版 JPEG，放在最后上传）；按原著与设定重写人物描写，去 AI 味、禁止幼态。上一版保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【参考图】随提示词上传的两张参考图都是本项目的立绘画风基线：画风、用色、光线、质感和暖浅灰纸底加淡水墨背景以它们为准；它们只管画风，不取长相、年龄、发型、服饰和姿势。人物的长相和造型完全按下面的文字来画。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山（西域雪山与草坡的远影）和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】阿曼，《白马啸西风》中铁延部（唐代庭州草原上的牧部）骑手车尔库的女儿，草原上最美的姑娘，与苏普相爱。
【时代】唐代武周长安年间（约 702 年）的西域，西州—庭州一带（游戏设定）。服饰按唐代：汉人束发、戴软幞头或裹巾，穿圆领窄袖袍、半臂，骑行可穿翻领胡服；草原牧部（铁延部，突厥—铁勒背景的虚构牧部）穿翻领窄袖袍、长裤、软靴，编辫、戴毡帽。
【年龄与体态】约二十岁的成年年轻女子，身材修长匀称、成人比例（约七头身），有常年骑马的挺拔轻盈。
【经典造型】「草原第一美女」：许多细辫盘在小毡帽后、石榴红窄袖袍配青绿半臂、颈间一条小花巾、腰间一串小铜铃；明朗大方、笑容灿烂，美丽动人。
【面容】偏长的鹅蛋脸（不是圆脸），颧骨略高而柔和；眉毛浓黑修长、眉尾微扬；眼睛明亮、眼型细长微挑，浅浅的双眼皮，深褐色的眼珠，睫毛浓密；鼻梁挺秀；嘴唇饱满、笑容明朗；健康的浅麦色皮肤透着高原红晕，有真实的皮肤纹理。明艳大方，是成熟女子的美，不是娃娃脸。
【发式】乌黑长发编成许多细辫，盘在脑后，戴一顶镶毛边的小毡帽。
【服饰】石榴红色翻领窄袖长袍（袍长及踝，便于骑马），外罩一件青绿色短半臂，腰束细皮带，深色长裤，软皮靴；颈间系一条小花巾。
【道具】腰带上挂着一串小铜铃；一手轻提花巾一角，一手自然垂下。
【姿态与神情】笑着站立，身体朝向正面，大方地看向前方。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要清代剃发留辫、瓜皮帽、马褂、旗装或补服；不要明代网巾、宋代直脚幞头；不要现代民族礼服、伊斯兰式缠头或面纱、清真寺等后世宗教符号；不要用夸张的五官或肤色来表现族属。不要圆脸大眼的娃娃脸；不要和李文秀同一张脸。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。基线图只取画风，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

## 白马唐代化版 Gemini 提示词（2026-10-02 凌晨，人物线 2 号；AR-32 重出之前，历史，不再用于出图）

> 2026-10-02 白马唐代化重出（人物线 2 号）：依 `docs/design/catalog/npcs-ch10-baima.md` §2（逐人发式 / 服色 / 标志物）、`docs/design/chapters/10-baima.md` §8.9（唐代视觉语法）与 `tools/agents/reports/REVIEW-portraits-C-ch10-14.md` §1（脸部要点）改写；一律成年、去 AI 味。本轮出图只用下面这一段；下文旧稿是清初设定，只作历史与考据保留，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘。

画风：写实手绘古风人物插画，与项目现有立绘保持一致——像功力深厚的画师用细腻笔触画出的真实人物，不是照片、不是三维渲染、不是动漫。皮肤要有真实质感：看得见细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不打油亮高光；布料看得见经纬纹理、自然褶皱和穿用后的轻微旧化；整体是低饱和、沉稳的设色；柔和的自然光从左上方照来，明暗过渡连贯。

人物：阿曼，《白马啸西风》中铁延部（唐代庭州草原上的牧部）骑手车尔库的女儿，草原上最美的姑娘，与苏普相爱。
经典形象：要一眼认出是阿曼——「草原第一美女」：长辫盘在毡帽后、石榴红窄袖袍配青绿半臂、颈间花巾、腰间小铜铃；明朗大方、笑容灿烂，美丽动人。
时代：唐代武周长安年间（约 702 年），西州—庭州一带的西域（游戏设定）。服饰按唐代：汉人男子束发、戴软幞头或裹巾，穿圆领窄袖袍（缺胯袍）、半臂，骑行可穿翻领胡服；汉人女子高髻或高束发，穿短襦、半臂、高腰长裙或窄袖胡服；草原牧部（铁延部，突厥—铁勒背景的虚构混合牧部）穿翻领窄袖袍、长裤、软靴，编辫、戴毡帽。
年龄与体态：约二十岁的成年年轻女子，身材修长匀称、成人比例（约七头身），有常年骑马的挺拔轻盈。
面容：偏长的鹅蛋脸（不是圆脸），颧骨略高而柔和；眉毛浓黑修长、眉尾微扬；眼睛明亮、眼型细长微挑、浅浅的双眼皮，深褐色的眼珠，睫毛浓密；鼻梁挺秀；嘴唇饱满、笑容明朗；健康的浅麦色皮肤透着高原红晕，有真实的皮肤纹理。明艳大方，是成熟女子的美，不是娃娃脸。
发式：乌黑长发编成许多细辫，盘在脑后，戴一顶镶毛边的小毡帽。
服饰：石榴红色翻领窄袖长袍（袍长及踝，便于骑马），外罩一件青绿色短半臂，腰束细皮带，深色长裤，软皮靴；颈间系一条小花巾。
道具与姿态：腰带上挂着一串小铜铃；一手轻提花巾一角，一手自然垂下；笑着站立，大方地看向前方。

构图：竖幅 2:3，单人全身立绘，从头顶到双脚完整入画，四周留出余白；站姿自然、重心稳定，身体正面或微侧，头颈端正、双眼平视；双手和所持器物完整清楚。背景：暖浅灰色纸底，只在远处有极淡的水墨远山（西域雪山与草坡的远影）和薄雾，大面积留白；人物轮廓与背景分明、边缘干净（后续要抠图），脚下只有极淡的接触阴影。

排除：不要任何文字、题字、印章、签名、水印、边框；不要多个人物、多视图或拼贴；不要幼态（童颜、娃娃脸、儿童或少年身材、头大身小）；不要塑料皮肤、磨皮、网红脸、锥子下巴、过大的眼睛、浓妆滤镜、过度对称、过度精修、偶像化打光或蜡像感；不要与任何真实演员或明星相像；不要照片质感、三维渲染或动漫画风；不要现代物件；不要裸露、透视衣料或性感化；不要血腥；不要裁掉头顶、手指、双脚或器物；不要多余或残缺的手指、手与器物粘连。不要清代剃发留辫、瓜皮帽、马褂、清式补服或顶戴；不要明代网巾、宋代直脚幞头；不要现代民族礼服、伊斯兰式缠头或面纱、清真寺等后世宗教符号；不要用夸张的五官或肤色来表现族属。不要圆脸大眼的娃娃脸；不要和李文秀同一张脸。汉式交领一律右衽（穿着者左襟压右襟），不要左衽、不要水平镜像。
质感：手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```


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
