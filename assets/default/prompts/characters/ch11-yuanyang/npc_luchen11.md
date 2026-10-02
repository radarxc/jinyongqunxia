---
asset_id: por_npc_luchen11__ch11_base
subject_id: npc_luchen11
name: 鲁忱
book: ch11_yuanyang
gender: male
age_variant: prime
tier: B
output: assets/default/character/male/ch11/por_npc_luchen11__ch11_base.png
manifest: assets/default/character/male/ch11/manifest.yaml
references:
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 仅参考新版萧峰连贯精细的写实人物绘法、自然皮肤与双手、完整衣料和柔光体积；绝不复制其脸、男性性别、年龄、胡须、魁梧体型、发型、衣装、掌势、金龙或场景。该参考不提供本角色身份。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 仅取对应性别项目基线的低饱和国风色卡；不借用面容、年龄、身体、发式、服装、兵器、姿态、碎墨笔触或皮肤质地；用户授权使用现有基线，原审批状态保持。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 只取用户图背景的淡水墨、暖浅灰纸底、空气感和留白；背景墨气留在人物背后。绝不复制人物、面容、青白衣装、披帛或把纸纹碎墨覆盖到皮肤和衣服。基础立绘不照搬具体山水场景。
status: ready
realism_revision: user_character_realism_20261001
---

# 鲁忱 · 人物写实修正

## 人物与阶段

- subject_id：npc_luchen11
- book：ch11_yuanyang
- gender：male
- age_variant：prime

## 本轮人物写实规范

首次建立鲁忱本人写实身份；约30岁精壮镖师，普通入鞘腰刀与封存账册袋，整洁利落的护卫勘路基础形象。 高品质写实美观人物，完整干净衣料与连续皮肤；背景仍淡水墨，宽松自查、candidate待用户最终审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_luchen11__ch11_base/prompt-14a349b798601407d479729a260e55a90e06c2df1dd51ab05fc4ba2182cd6ce2.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES: There is no existing image of this subject. Establish this character’s FIRST realistic visual identity from the written facts below. Image 1 is Xiao Feng ONLY as a quality demonstration for continuous realistic human rendering; it supplies no identity, gender, age, costume, body type, action or dragon. Image 2 is ONLY the male project muted color palette. Image 3 is ONLY the user-requested pale ink-wash background. All faces, bodies, poses and clothes in these references must be disregarded when designing this new subject.

BASE ASSET: por_npc_luchen11__ch11_base
CHARACTER FACTS:
身份与阶段：威信镖局镖师，原创“失镖账册”支线的护卫与勘路阶段（原创扩展）
年龄与体貌：青壮成年男子，视觉约三十岁（原创扩展）；长方脸、略突眉弓、晒黑的面颊、清晰颈部筋腱，中等偏高、精壮体型，嘴唇紧闭、眼神专注
服饰与发式：威信镖局青灰窄袖短袍、旧靛蓝坎肩、深灰裤、布护腕与绑腿、平底布靴，衣色与总镖头呼应而用料更朴素；清式剃发留辫，辫子整齐压在后背，素布帽略旧
兵器与标志物：普通腰刀与封存账册袋，均为原创职能道具
气质与姿态：身体略转向一侧，重心前移但双脚着地，像勘路后准备回报，肩背紧实
原著概括：非原著人物，没有可核的经典外貌；不得把普通腰刀当原著名器
美术补足：男性、约三十岁、长方脸、晒色、腰刀与账册袋、勘路站姿

CHARACTER-SPECIFIC CONSTRUCTION:
鲁忱是原创威信镖局护卫勘路镖师，约三十岁成年长方脸、适度突出的眉弓、晒色面颊、自然颈部筋腱，中等偏高且精壮，闭唇专注。清式剃发、整齐实辫贴后背、素布帽。青灰窄袖短袍、旧靛蓝坎肩、深灰裤、布护腕与绑腿、平底布靴，简朴而完整干净。腰一侧牢靠系一把普通柳叶腰刀，刀身全部在足够长的朴素鞘内，木柄、护手、鞘口、封闭鞘尾连接连续，武器只有一把。另一侧有扁平布账册袋，内部是一册闭合无字账册。左手扶住袋口，右手自然下垂不拔刀。身体轻侧、稍前移重心而双足落地，准备勘路回报。

COMPOSITION AND DELIVERY: Single subject, one view, calm complete full-body base portrait, vertical 2:3 PNG with target 2048×3072; native generated PNG bytes and actual dimensions must be preserved by the production workflow. Eye-level neutral perspective, near frontal with a slight natural turn; comfortable margins around hair, both hands, clothing, both shoes and every prop tip. Use natural proportions and overall completeness instead of a rigid height percentage. Soft diffuse upper-left light, no theatrical rim light. Opaque warm pale-grey paper fills the canvas, with at most an almost imperceptible distant ink wash and generous empty space, no identifiable episode, landscape landmark, architecture, floor scene or added contact shadow. Keep the clean human silhouette separate from that background. No writing, decorative seal or new watermark; retain tool provenance. Traditional Han crossed collars close to the wearer’s right with the wearer’s left panel over the right; an explicitly Qing round right-fastening robe is not changed into a Song/Ming crossed collar.

EXCLUSIONS: No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要镖头铁鞭、鸳鸯宝刀、第二刀鞘、出鞘刀刃、流血伤疤、盔甲、官服、可读账册文字、个人独门武学或战斗特效。
```

## 排除项

No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要镖头铁鞭、鸳鸯宝刀、第二刀鞘、出鞘刀刃、流血伤疤、盔甲、官服、可读账册文字、个人独门武学或战斗特效。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_luchen11__ch11_base.prepared.json`。
