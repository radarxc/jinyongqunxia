---
asset_id: por_npc_zhujue__ch13_f_base
subject_id: npc_zhujue
name: 主角（女）· 清乾隆
book: ch13_feihu
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch13/por_npc_zhujue__ch13_f_base.png
manifest: assets/default/character/female/ch13/manifest.yaml
references:
- path: assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png
  use: 第一参考为当前已实际查看且清晰的 ch00 女主本人身份图，仅继承同人面容骨相、约28岁成年感、肤色、行动体型及右眼外下方浅褐痣；按本书重建清代衣装和发式。保留现图candidate状态，不强制新的realism_revision或重绘，不复制其春秋竹青深衣。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 仅参考新版萧峰连贯精细的写实人物绘法、自然皮肤与双手、完整衣料和柔光体积；绝不复制其脸、男性性别、年龄、胡须、魁梧体型、发型、衣装、掌势、金龙或场景。该参考不提供本角色身份。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 仅取对应性别项目基线的低饱和国风色卡；不借用面容、年龄、身体、发式、服装、兵器、姿态、碎墨笔触或皮肤质地；用户授权使用现有基线，原审批状态保持。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 只取用户图背景的淡水墨、暖浅灰纸底、空气感和留白；背景墨气留在人物背后。绝不复制人物、面容、青白衣装、披帛或把纸纹碎墨覆盖到皮肤和衣服。基础立绘不照搬具体山水场景。
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "随女主 ch00 新锚点统一重出：现图的脸与 ch00 不一致，改为同一张原创脸，服饰沿用本时代设定"
reference_upload:
- assets/default/character/female/ch00/por_npc_zhujue__ch00_f_base.png
- assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
---

# 主角（女）· 清乾隆 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出**。随女主 ch00 新锚点统一重出：现图的脸与 ch00 不一致，改为同一张原创脸，服饰沿用本时代设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】主角（女）：本作原创的穿越者，此刻身处《飞狐外传》清乾隆（约 1766–1771 年，项目推定）；清乾隆年间汉地南北行旅中的普通江湖人。本图是她在这一时代的基础立绘，不代表特定门派或结局。
【身份参考】随提示词上传的第 1 张图是主角本人（序章 ch00 新版定稿）：保持同一个人——脸型、眉形、眼睛、鼻子、嘴、右眼下的小痣、肤色、体型和年龄都不变；只把服饰、发式和道具换成下文的本时代版本。不要照搬图中的衣服、姿势和背景。
【本人面容（十五个时代统一，不能变）】约二十八岁的现代中国女青年，原创面孔，不像任何演员或书中其他人物。略长的鹅蛋脸，颧骨清楚，下颌利落而不尖；眉毛偏浓、平直，眉尾微微上扬（不是细柳眉、不是挑眉）；深棕色细长杏眼、内双，眼神清醒专注；鼻梁秀直、鼻头略圆；唇形清楚、上唇略薄，嘴角平；右眼外下方一颗清楚可见的浅褐色小痣（全书标志）；暖中性肤色带一点日晒，皮肤有真实纹理，素面不施浓妆。中等偏高的个子，肩背舒展、腰背挺直，四肢有行动的力量（约 7 头身）；乌黑直发、发量浓密。是成熟有主见的成年女子：沉静、可靠、带一点好奇，既不柔弱也不妩媚。
【主角标志】发髻上系一根褪色的朱红细绳，露出短短的绳头——每个时代都保留这根红绳。
【服饰】花青色汉族交领右衽窄袖袄，灰赭素裙，炭黑窄布带、护腕与平底布鞋；黑发盘成紧实低髻，素木簪固定，髻根系朱红细绳。
【道具】左腰用两根短系带挂一柄普通的中国腰刀，完整入微弯的窄木鞘，朴素小护手与木柄，无纹饰；刀不出鞘，不是胡斐的具名宝刀。
【姿态与神情】重心稳而轻捷，视线专注，一手自然放松、一手轻扶腰带，神态郑重守诺。成年女性的身体比例（约 7 头身），衣着完整端庄、不透明、不暴露、不性感化。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要明星脸或模特式五官；不要与书中男女主角撞脸；不要具名神兵、门派徽记、官服；不要年龄变小或变老。不要跨时代混搭的发式和服饰；不要像赵敏、王语嫣、黄蓉、小龙女等书中女角。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_zhujue
- book：ch13_feihu
- gender：female
- age_variant：prime

## 本轮人物写实规范

首次生成；飞狐外传 女主：重诺而果决的侠者：视线专注有锋芒而不凶恶，重心稳而轻捷，一手自然放松、一手轻扶腰带，神态体现认真守护承诺。肩背与护腕形成利落行动感，衣装便于行旅；力量内敛，不做逞凶、狞笑或急躁拔刀。 人物精细美观写实，连续自然肤质和完整整洁衣料，背景淡水墨；同人约28岁与识别痣不变，清代发型、阶段装备不变，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhujue__ch13_f_base/prompt-05673ef4e07c2110c05db7105e90c5c10abecd274414871fdf34408ef7deec38.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
CURRENT COSTUME MUST CHANGE: preserve only the FACE and BODY identity of reference 1. For ch13 she wears a muted INDIGO-BLUE fitted narrow-sleeved short jacket ending around her hips, a separate warm grey-ochre full skirt over trousers, black wrist wraps and belt, and a simple LOW BUN at the nape fixed by a plain wood pin. Do NOT repeat the reference green floor-length outer robe, wide bell sleeves or top-of-head bun. Show one ordinary slightly curved Chinese waist saber fully sheathed at her left hip. Both shoes should be readable.

Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES ARE SEPARATE. Image 1 is the EXISTING clear ch00 female protagonist identity, not a different woman. Preserve the same person’s face, bone structure, warm-neutral skin, capable body, mature age about 28 and mole just below the outer corner of HER RIGHT EYE. The existing candidate image is authorized as identity; it does not need a new realism revision. Do not create a Wang Yuyan, Zhao Min or Xiao Feng likeness, a teenage doll or a timid companion. Image 2, the new realistic Xiao Feng sample, supplies ONLY continuous realistic figure rendering, skin, hands, clean intact fabric and soft light. Image 3 supplies ONLY the corresponding gender’s muted project palette. Image 4 supplies ONLY pale ink-wash background language. Reconstruct garments from the written stage rather than copying clothing or fragmented marks from any image.

BASE ASSET: por_npc_zhujue__ch13_f_base
CURRENT BOOK-STAGE FACTS:
身份与阶段：现代人入书后的普通江湖行旅者；本图是时代基础装，不代表特定门派、现代职业或结局
时代与地域：ch13_feihu；清乾隆；约1766–1771年（项目推定；待考）；清乾隆年间汉地南北行旅中的普通江湖人
面容锚点：女性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；略长的鹅蛋脸，颧骨有轻微支撑、下颌利落而不尖削，眉形舒展且眉峰轻提，深棕色中等杏眼，鼻梁秀直、鼻头自然，唇线清晰、上下唇厚度适中，右眼外侧下方有一颗浅褐小痣；暖中性肤色，柔润而保留真实体积，无幼态或深皱纹；中等偏高、肩背舒展、腰腹与四肢有行动力量，约7头身；原生发质乌黑、顺直、发丝细密而有韧性；目光专注而有好奇心，嘴角平和，警觉但不怯弱。
本时代服饰发式：花青汉族交领右衽窄袖袄、灰赭素裙，炭黑窄布带、护腕与平底布鞋；黑发盘成紧实低髻，以素木簪固定
兵器道具：一柄普通中国腰刀完整入鞘，微弯窄鞘、朴素小护手与木柄，无名器装具
气质姿态：重心稳而不沉重，视线专注、肩颈自然，一手放松、一手轻扶腰带，保留对承诺的郑重
跨界同一性：同性别十五版同脸、同体型、同发质、同成年年龄感；成长只作神态微调，压制不画成衰老或病弱
事实边界：主角脸、衣色、服装搭配与姿态均为原创美术默认，未声称原著或服饰史逐字复原

SAME-PERSON AND HEROIC DIRECTION:
美丽而有主见的成年女侠气度，沉静有担当，眉眼清醒有力量，肩背舒展、腰腹四肢可行动，既不幼态也不性感化；保留同人脸、体型、肤色与右眼外侧下方小痣，黑发紧实低髻按本书木簪或素布带固定。不是给基线王语嫣换衣，不能从萧峰质量图带入男性脸或胡须。 飞狐外传 女主：重诺而果决的侠者：视线专注有锋芒而不凶恶，重心稳而轻捷，一手自然放松、一手轻扶腰带，神态体现认真守护承诺。肩背与护腕形成利落行动感，衣装便于行旅；力量内敛，不做逞凶、狞笑或急躁拔刀。

EXACT COSTUME AND EQUIPMENT:
清乾隆汉地南北行旅基础阶段，约1766–1771年仅为项目待考定年；花青与灰赭成大块完整衣料，炭黑窄带与护腕利落，重心稳而不沉，一手自然放松、一手轻扶腰带，郑重守诺。普通中国腰刀全入微弯窄鞘，朴素小护手和木柄，不是胡斐的具名宝刀。 仅有一柄原文普通入鞘兵器，两个短系带将其牢靠挂在穿着者左腰，略向身侧倾斜；柄、朴素小护手、鞘口、足够长的鞘身和封闭鞘尾清楚连续。刀剑全在鞘内，不握刃不拔出；鞘尾高于脚底并全部入画，尽量与衣摆轮廓分开。禁止偷偷删去原文明确兵器，也禁止加第二把、第二鞘、具名神兵或战斗特效。

COMPOSITION AND DELIVERY: Single subject, one view, calm complete full-body base portrait, vertical 2:3 PNG with target 2048×3072; native generated PNG bytes and actual dimensions must be preserved by the production workflow. Eye-level neutral perspective, near frontal with a slight natural turn; comfortable margins around hair, both hands, clothing, both shoes and every prop tip. Use natural proportions and overall completeness instead of a rigid height percentage. Soft diffuse upper-left light, no theatrical rim light. Opaque warm pale-grey paper fills the canvas, with at most an almost imperceptible distant ink wash and generous empty space, no identifiable episode, landscape landmark, architecture, floor scene or added contact shadow. Keep the clean human silhouette separate from that background. No writing, decorative seal or new watermark; retain tool provenance. Traditional Han crossed collars close to the wearer’s right with the wearer’s left panel over the right; an explicitly Qing round right-fastening robe is not changed into a Song/Ming crossed collar.

EXCLUSIONS: No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要宋明男性全发高髻、清代男性披发、现代物件、官服、贵族珠翠、门派徽记、具名神兵、浓髯换脸、武学光效或时代混搭。女版不要幼态、娇弱陪衬或性感化。不要冷月宝刀、药王标识、僧尼服饰、飞鱼服或宫装。
```

## 排除项

No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要宋明男性全发高髻、清代男性披发、现代物件、官服、贵族珠翠、门派徽记、具名神兵、浓髯换脸、武学光效或时代混搭。女版不要幼态、娇弱陪衬或性感化。不要冷月宝刀、药王标识、僧尼服饰、飞鱼服或宫装。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhujue__ch13_f_base.prepared.json`。
