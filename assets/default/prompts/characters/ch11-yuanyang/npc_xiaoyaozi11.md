---
asset_id: por_npc_xiaoyaozi11__ch11_prime_road_base
subject_id: npc_xiaoyaozi11
name: 逍遥子
book: ch11_yuanyang
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch11/por_npc_xiaoyaozi11__ch11_prime_road_base.png
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

# 逍遥子 · 人物写实修正

## 人物与阶段

- subject_id：npc_xiaoyaozi11
- book：ch11_yuanyang
- gender：male
- age_variant：prime

## 本轮人物写实规范

首次建立《鸳鸯刀》太岳四侠逍遥子的写实身份；松林初次拦镖且肩未伤，瘦弱而故作前辈镇定，精铁旱烟管清楚完整。 高品质写实美观人物，完整干净衣料与连续皮肤；背景仍淡水墨，宽松自查、candidate待用户最终审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaoyaozi11__ch11_prime_road_base/prompt-8843971218e48e6bc9034f21c454af173e9e301757475e6374c596f3186eaf06.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES: There is no existing image of this subject. Establish this character’s FIRST realistic visual identity from the written facts below. Image 1 is Xiao Feng ONLY as a quality demonstration for continuous realistic human rendering; it supplies no identity, gender, age, costume, body type, action or dragon. Image 2 is ONLY the male project muted color palette. Image 3 is ONLY the user-requested pale ink-wash background. All faces, bodies, poses and clothes in these references must be disregarded when designing this new subject.

BASE ASSET: por_npc_xiaoyaozi11__ch11_prime_road_base
CHARACTER FACTS:
身份与阶段：太岳四侠之首，松林初次拦镖、尚未受肩伤
年龄与体貌：中年男子；瘦长脸、面颊略凹、肩窄背薄，神情疲倦而故作镇定，肤色偏苍不呈尸灰色
服饰与发式：旧灰绿长衫、褐色布带、打小补丁的长裤和旧布鞋，衣料略粗且有局部磨损，仍完整遮蔽身体；清式剃发留辫，辫发简单梳拢，深灰小布帽；不是道士，不梳逍遥派高髻
兵器与标志物：精铁旱烟管、旧衣与病弱体态；只属于太岳四侠逍遥子
气质与姿态：两足踏稳，肩膀微收，左手轻按胸前衣襟，眼皮半敛似在维持前辈气派，烟管与身体分开
原著概括：病弱外观、旧衣与旱烟管为原著概括（待考）；不照搬夸张辱称
美术补足：瘦长脸细部、衣物灰绿配色、补丁分布与未点燃烟管的静立处理

CHARACTER-SPECIFIC CONSTRUCTION:
只画《鸳鸯刀》太岳四侠之首逍遥子，松林第一次拦镖、尚未受肩伤；绝非《天龙八部》逍遥派创始人或道士。中年瘦长脸、略凹面颊、窄肩薄背，偏苍但自然有血色的皮肤，眼皮半敛，疲倦而努力维持镇定和前辈气派；病弱只以体态体现，不添加诊断或羞辱性夸张。清式剃发、普通后辫、深灰小布帽。旧灰绿长衫、褐布带、长裤仅少量小而整齐缝好的补丁、旧布鞋；旧衣洗净、完整、有连续清晰的缝边，绝不变成碎布。右手低持一根精铁旱烟管，细杆、烟锅与烟嘴结构准确连通且与身体分开，腰侧一个小素布烟袋；烟管不点燃无烟无火。左手轻按胸前衣襟、两足稳稳踏地、肩微收。

COMPOSITION AND DELIVERY: Single subject, one view, calm complete full-body base portrait, vertical 2:3 PNG with target 2048×3072; native generated PNG bytes and actual dimensions must be preserved by the production workflow. Eye-level neutral perspective, near frontal with a slight natural turn; comfortable margins around hair, both hands, clothing, both shoes and every prop tip. Use natural proportions and overall completeness instead of a rigid height percentage. Soft diffuse upper-left light, no theatrical rim light. Opaque warm pale-grey paper fills the canvas, with at most an almost imperceptible distant ink wash and generous empty space, no identifiable episode, landscape landmark, architecture, floor scene or added contact shadow. Keep the clean human silhouette separate from that background. No writing, decorative seal or new watermark; retain tool provenance. Traditional Han crossed collars close to the wearer’s right with the wearer’s left panel over the right; an explicitly Qing round right-fastening robe is not changed into a Song/Ming crossed collar.

EXCLUSIONS: No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要天龙逍遥派、白发仙人、道冠、高髻、拂尘、仙风长白须、肩伤、绷带、新伤、阴森尸灰肤色、烟雾火光、石块或流星锤；不要为旧衣增加破洞破边。
```

## 排除项

No fragmented, broken, translucent or erased human figure; no dry-brush gaps, white flecks, paper erosion, dirty blotches or crackle on skin or clothing. No shredded fabric, frayed noisy hems, torn ribbons, holes, randomly layered scraps, armor made of fragments or excessive patchwork. No photorealistic photographic pores, plastic smoothing, oily 3D shine, anime eyes, doll face, generic copied face, celebrity portrait, beauty-filter skin or exaggerated muscles. No copying Xiao Feng’s face, beard, physique, headwrap, costume, dragon or palm pose; no copying palette/background reference identities. No extra people, duplicate limbs or props, fused fingers, broken wrists, dislocated joints, floating equipment, cropped head or feet, mirrored identity marks, unclear prop connections, transparent clothes, sexualized pose, gratuitous blood, modern items, foreign fantasy armor, katana, Japanese collar or unknown sect symbols. No text, calligraphy, labels, measurements, UI, split panels, signatures, seals, logos or new decorative watermarks. Preserve tool provenance. 不要天龙逍遥派、白发仙人、道冠、高髻、拂尘、仙风长白须、肩伤、绷带、新伤、阴森尸灰肤色、烟雾火光、石块或流星锤；不要为旧衣增加破洞破边。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaoyaozi11__ch11_prime_road_base.prepared.json`。
