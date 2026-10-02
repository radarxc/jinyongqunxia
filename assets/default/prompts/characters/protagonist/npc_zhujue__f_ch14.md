---
asset_id: por_npc_zhujue__ch14_f_base
subject_id: npc_zhujue
name: 主角（女）· 清乾隆·雪地
book: ch14_xueshan
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch14/por_npc_zhujue__ch14_f_base.png
manifest: assets/default/character/female/ch14/manifest.yaml
references:
- path: assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png
  use: 第一参考为当前已实际查看且清晰的 ch00 女主本人身份图，仅继承同人面容骨相、约28岁成年感、肤色、行动体型及右眼外下方浅褐痣；按本书重建清代衣装和发式。保留现图candidate状态，不强制新的realism_revision或重绘，不复制其春秋竹青深衣。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 仅参考新版萧峰连贯精细的写实人物绘法、自然皮肤与双手、完整衣料和柔光体积；绝不复制其脸、男性性别、年龄、胡须、魁梧体型、发型、衣装、掌势、金龙或场景。该参考不提供本角色身份。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 仅取对应性别项目基线的低饱和国风色卡；不借用面容、年龄、身体、发式、服装、兵器、姿态、碎墨笔触或皮肤质地；用户授权使用现有基线，原审批状态保持。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 只取用户图背景的淡水墨、暖浅灰纸底、空气感和留白；背景墨气留在人物背后。绝不复制人物、面容、青白衣装、披帛或把纸纹碎墨覆盖到皮肤和衣服。基础立绘不照搬具体山水场景。
status: ready
realism_revision: user_character_realism_20261001
---

# 主角（女）· 清乾隆·雪地 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhujue
- book：ch14_xueshan
- gender：female
- age_variant：prime

## 本轮人物写实规范

首次生成；雪山飞狐 女主：能够面对艰难选择的沉静侠者：目光坚定清明，胸肩开阔、双脚有力落地，厚冬衣之下仍能读出同一主角的挺拔体态。短毛领与厚棉衣形成有分量的轮廓，克制而坚韧，神态不因寒冷而疲惫衰老；不提前表达最后一刀或任何结局立场。 人物精细美观写实，连续自然肤质和完整整洁衣料，背景淡水墨；同人约28岁与识别痣不变，清代发型、阶段装备不变，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhujue__ch14_f_base/prompt-607160d5c8b8a5732e8b28454aa9fdf07d8a6b9163cc3cb3a1eb265d4e2a1936.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
CURRENT WINTER COSTUME MUST CHANGE: keep only the FACE and BODY identity of reference 1, including her right-eye mole. She wears a snow-grey thick padded SHORT JACKET with narrow sleeves and a modest short fur collar, a separate deep-teal thick skirt over warm trousers, plain brown cloth belt and warm flat soft-leather boots. Hair is a tight LOW BUN at the nape, held by a plain cloth tie. Do NOT repeat the reference green floor-length robe, thin wide sleeves or topknot. Face is unobscured. One ordinary sheathed slightly curved Chinese saber at her left hip, both feet steady; no battle or ending scene.

Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES ARE SEPARATE. Image 1 is the EXISTING clear ch00 female protagonist identity, not a different woman. Preserve the same person’s face, bone structure, warm-neutral skin, capable body, mature age about 28 and mole just below the outer corner of HER RIGHT EYE. The existing candidate image is authorized as identity; it does not need a new realism revision. Do not create a Wang Yuyan, Zhao Min or Xiao Feng likeness, a teenage doll or a timid companion. Image 2, the new realistic Xiao Feng sample, supplies ONLY continuous realistic figure rendering, skin, hands, clean intact fabric and soft light. Image 3 supplies ONLY the corresponding gender’s muted project palette. Image 4 supplies ONLY pale ink-wash background language. Reconstruct garments from the written stage rather than copying clothing or fragmented marks from any image.

BASE ASSET: por_npc_zhujue__ch14_f_base
CURRENT BOOK-STAGE FACTS:
身份与阶段：现代人入书后的普通江湖行旅者；本图是时代基础装，不代表特定门派、现代职业或结局
时代与地域：ch14_xueshan；清乾隆·雪地；1780年（沿用项目年表；具体开篇纪年待考）；长白山雪地旅途的普通江湖人
面容锚点：女性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；略长的鹅蛋脸，颧骨有轻微支撑、下颌利落而不尖削，眉形舒展且眉峰轻提，深棕色中等杏眼，鼻梁秀直、鼻头自然，唇线清晰、上下唇厚度适中，右眼外侧下方有一颗浅褐小痣；暖中性肤色，柔润而保留真实体积，无幼态或深皱纹；中等偏高、肩背舒展、腰腹与四肢有行动力量，约7头身；原生发质乌黑、顺直、发丝细密而有韧性；目光专注而有好奇心，嘴角平和，警觉但不怯弱。
本时代服饰发式：雪灰汉族右衽窄袖厚夹袄、深青厚裙，暖褐窄布带、素面短毛领与平底保暖软皮靴；黑发收作紧实低髻，以素布带固定，领口不遮脸
兵器道具：一柄普通中国腰刀完整入鞘，朴素微弯木鞘、小护手，无名器纹样
气质姿态：双脚坚定落地、肩背舒展，目光沉静、能够承担选择；不摆出劈刀动作，不预设结局立场
跨界同一性：同性别十五版同脸、同体型、同发质、同成年年龄感；成长只作神态微调，压制不画成衰老或病弱
事实边界：主角脸、衣色、服装搭配与姿态均为原创美术默认，未声称原著或服饰史逐字复原

SAME-PERSON AND HEROIC DIRECTION:
美丽而有主见的成年女侠气度，沉静有担当，眉眼清醒有力量，肩背舒展、腰腹四肢可行动，既不幼态也不性感化；保留同人脸、体型、肤色与右眼外侧下方小痣，黑发紧实低髻按本书木簪或素布带固定。不是给基线王语嫣换衣，不能从萧峰质量图带入男性脸或胡须。 雪山飞狐 女主：能够面对艰难选择的沉静侠者：目光坚定清明，胸肩开阔、双脚有力落地，厚冬衣之下仍能读出同一主角的挺拔体态。短毛领与厚棉衣形成有分量的轮廓，克制而坚韧，神态不因寒冷而疲惫衰老；不提前表达最后一刀或任何结局立场。

EXACT COSTUME AND EQUIPMENT:
清乾隆长白山寒地行旅基础阶段，1780年是项目年表且开篇纪年待考；厚棉/夹衣、深青外层或厚裙、暖褐窄带、短而整洁的朴素毛领、厚裤或厚裙和平底保暖软皮靴形成完整保暖轮廓。女版按文档是雪灰右衽窄袖厚夹袄、深青厚裙；男版为雪灰圆领右侧掩襟厚棉长袍、深青短褂和厚裤，绝不混穿。毛领不遮脸，不加巨型狐裘或风吹碎毛。仍是同一位28岁成年人，寒冷不画成衰老、病弱或饥寒破衣。普通腰刀完整入朴素微弯木鞘，双脚稳、沉静承担选择，不预设最后一刀或任一结局。 仅有一柄原文普通入鞘兵器，两个短系带将其牢靠挂在穿着者左腰，略向身侧倾斜；柄、朴素小护手、鞘口、足够长的鞘身和封闭鞘尾清楚连续。刀剑全在鞘内，不握刃不拔出；鞘尾高于脚底并全部入画，尽量与衣摆轮廓分开。禁止偷偷删去原文明确兵器，也禁止加第二把、第二鞘、具名神兵或战斗特效。

COMPOSITION AND DELIVERY: Single subject, one view, calm complete full-body base portrait, vertical 2:3 PNG with target 2048×3072; native generated PNG bytes and actual dimensions must be preserved by the production workflow. Eye-level neutral perspective, near frontal with a slight natural turn; comfortable margins around hair, both hands, clothing, both shoes and every prop tip. Use natural proportions and overall completeness instead of a rigid height percentage. Soft diffuse upper-left light, no theatrical rim light. Opaque warm pale-grey paper fills the canvas, with at most an almost imperceptible distant ink wash and generous empty space, no identifiable episode, landscape landmark, architecture, floor scene or added contact shadow. Keep the clean human silhouette separate from that background. No writing, decorative seal or new watermark; retain tool provenance. Traditional Han crossed collars close to the wearer’s right with the wearer’s left panel over the right; an explicitly Qing round right-fastening robe is not changed into a Song/Ming crossed collar.

EXCLUSIONS: No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要宋明男性全发高髻、清代男性披发、现代物件、官服、贵族珠翠、门派徽记、具名神兵、浓髯换脸、武学光效或时代混搭。女版不要幼态、娇弱陪衬或性感化。不要巨型狐裘、晚清头饰、宋代薄衫、悬崖决战、舞雪粒子、结局刀势。
```

## 排除项

No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要宋明男性全发高髻、清代男性披发、现代物件、官服、贵族珠翠、门派徽记、具名神兵、浓髯换脸、武学光效或时代混搭。女版不要幼态、娇弱陪衬或性感化。不要巨型狐裘、晚清头饰、宋代薄衫、悬崖决战、舞雪粒子、结局刀势。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhujue__ch14_f_base.prepared.json`。
