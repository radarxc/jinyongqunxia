---
asset_id: por_npc_chengmo11__ch11_base
subject_id: npc_chengmo11
name: 程墨
book: ch11_yuanyang
gender: male
age_variant: youth
tier: B
output: assets/default/character/male/ch11/por_npc_chengmo11__ch11_base.png
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

# 程墨 · 人物写实修正

## 人物与阶段

- subject_id：npc_chengmo11
- book：ch11_yuanyang
- gender：male
- age_variant：youth

## 本轮人物写实规范

首次建立程墨本人写实身份；约15岁非战斗原创书僮，少年骨相与小木匣、轻书袋明确，人物及朴素旧衣连贯完整。 高品质写实美观人物，完整干净衣料与连续皮肤；背景仍淡水墨，宽松自查、candidate待用户最终审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_chengmo11__ch11_base/prompt-ef01ad454841939393d1f11e50cbf38f27365bf17eafde63623d0c479c37bd91.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES: There is no existing image of this subject. Establish this character’s FIRST realistic visual identity from the written facts below. Image 1 is Xiao Feng ONLY as a quality demonstration for continuous realistic human rendering; it supplies no identity, gender, age, costume, body type, action or dragon. Image 2 is ONLY the male project muted color palette. Image 3 is ONLY the user-requested pale ink-wash background. All faces, bodies, poses and clothes in these references must be disregarded when designing this new subject.

BASE ASSET: por_npc_chengmo11__ch11_base
CHARACTER FACTS:
身份与阶段：袁氏旧仆收留的书僮，原创“旧匣来书”支线的传讯与识字角色（原创扩展）
年龄与体貌：约15岁少年，具体视觉年龄（原创扩展），未成年；尚未长开的圆长脸、自然小眼睛、窄肩细臂，手脚比例仍带少年感，神情认真略紧张，无胡须
服饰与发式：完整浅灰蓝短袄、深灰长裤、素布背心与结实平底布鞋，领口闭合、袖口适度收束，衣物干净略旧；清代少年剃发留辫，短而整齐的发辫贴背，小布帽简单实用，无成年冠饰
兵器与标志物：小木匣、轻书袋；均为原创道具，无兵器
气质与姿态：双足平稳、身体稍向后平衡木匣，眼神专注等待托付，双手抱匣结构清楚，不摆战斗架势
原著概括：非原著人物，没有原著外貌或经典兵器；不可宣称本设计有原著描写
美术补足：男性、约15岁、少年圆长脸、衣色、发式、小木匣和站姿均是美术补足

CHARACTER-SPECIFIC CONSTRUCTION:
程墨是项目原创人物，不冒充《鸳鸯刀》的无名原著书僮。必须是约15岁的未成年少年，尚未长开的圆长脸、自然较小眼睛、窄肩细臂、少年手脚比例、没有胡须；认真稍紧张，健康而不成人化。双手和前臂清楚抱住一个尺寸重量适合少年的小木匣，素布绳围匣系好，无字无花饰；一个轻巧肩挎书袋露出空白书册封面。木匣不能重到变成沉重巨箱。双足稳，身体仅轻微后移平衡木匣，目光专注等待托付。保留清代少年剃发区与贴背短辫、小布帽；完整浅灰蓝短袄、深灰裤、素背心、平底布鞋，清爽而略旧。约6至6.5头身只作为自然少年比例方向，不写测量文字。

COMPOSITION AND DELIVERY: Single subject, one view, calm complete full-body base portrait, vertical 2:3 PNG with target 2048×3072; native generated PNG bytes and actual dimensions must be preserved by the production workflow. Eye-level neutral perspective, near frontal with a slight natural turn; comfortable margins around hair, both hands, clothing, both shoes and every prop tip. Use natural proportions and overall completeness instead of a rigid height percentage. Soft diffuse upper-left light, no theatrical rim light. Opaque warm pale-grey paper fills the canvas, with at most an almost imperceptible distant ink wash and generous empty space, no identifiable episode, landscape landmark, architecture, floor scene or added contact shadow. Keep the clean human silhouette separate from that background. No writing, decorative seal or new watermark; retain tool provenance. Traditional Han crossed collars close to the wearer’s right with the wearer’s left panel over the right; an explicitly Qing round right-fastening robe is not changed into a Song/Ming crossed collar.

EXCLUSIONS: No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要成年男性脸、胡须、健美肌肉、武器、刀剑、作战架势、成人高冠、巨型重匣、可读家书、金箔碎片、监护人或其他人物入画。
```

## 排除项

No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要成年男性脸、胡须、健美肌肉、武器、刀剑、作战架势、成人高冠、巨型重匣、可读家书、金箔碎片、监护人或其他人物入画。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_chengmo11__ch11_base.prepared.json`。
