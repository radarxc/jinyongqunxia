---
asset_id: por_npc_zhujue__ch13_m_base
subject_id: npc_zhujue
name: 主角（男）· 清乾隆
book: ch13_feihu
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch13/por_npc_zhujue__ch13_m_base.png
manifest: assets/default/character/male/ch13/manifest.yaml
references:
- path: assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png
  use: 第一身份参考必须是同一路径经真实落盘并通过视觉核对后的 ch00 男主新版写实图，manifest realism_revision 必须等于 user_character_realism_20261001；准备时重新读取PNG与manifest及实际哈希，不能使用目前旧版或仅凭路径存在通过。只继承同人脸、骨相、肤色、均衡体型、约28岁成年感和左眉尾下浅褐痣，按本书重建清代剃发留辫及衣装武器，不继承碎布画法或春秋发髻。未声称已查看未来新版。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 仅参考新版萧峰连贯精细的写实人物绘法、自然皮肤与双手、完整衣料和柔光体积；绝不复制其脸、男性性别、年龄、胡须、魁梧体型、发型、衣装、掌势、金龙或场景。该参考不提供本角色身份。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 仅取对应性别项目基线的低饱和国风色卡；不借用面容、年龄、身体、发式、服装、兵器、姿态、碎墨笔触或皮肤质地；用户授权使用现有基线，原审批状态保持。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 只取用户图背景的淡水墨、暖浅灰纸底、空气感和留白；背景墨气留在人物背后。绝不复制人物、面容、青白衣装、披帛或把纸纹碎墨覆盖到皮肤和衣服。基础立绘不照搬具体山水场景。
status: ready
realism_revision: user_character_realism_20261001
---

# 主角（男）· 清乾隆 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhujue
- book：ch13_feihu
- gender：male
- age_variant：prime

## 本轮人物写实规范

首次生成；飞狐外传 男主：重诺而果决的侠者：视线专注有锋芒而不凶恶，重心稳而轻捷，一手自然放松、一手轻扶腰带，神态体现认真守护承诺。肩背与护腕形成利落行动感，衣装便于行旅；力量内敛，不做逞凶、狞笑或急躁拔刀。 人物精细美观写实，连续自然肤质和完整整洁衣料，背景淡水墨；同人约28岁与识别痣不变，清代发型、阶段装备不变，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhujue__ch13_m_base/prompt-01a181c22ca1bb8c8611e9e9c5f4cffde96e0412a5a3b9edd19827570833a690.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
CURRENT QING COSTUME AND HAIR MUST CHANGE: keep only the FACE and balanced BODY identity of reference 1. The same 28-year-old man has a clearly SHAVED FRONT SCALP and solid black QUEUE from rear crown down his back, no topknot or full front hair. He wears an INDIGO-BLUE ROUND-COLLAR cloth robe fastening at the right, a warm grey-ochre short jacket, plain belt, black wrist wraps, trousers and flat cloth shoes. No V-shaped crossed collar. One ordinary slightly curved Chinese waist saber fully sheathed at his LEFT hip; one relaxed hand and one at his belt. Keep his small mole below HIS LEFT EYEBROW TAIL. No aging or copied Xiao Feng face.

Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES ARE SEPARATE. The first image must be the COMPLETED new realistic ch00 male protagonist revision user_character_realism_20261001, verified at preparation time from its actual PNG and manifest. Until then this design is waiting on that identity asset; an old file at the same path is insufficient. Preserve that same person’s face, bones, warm-neutral skin, balanced body, mature age about 28 and mole below HIS LEFT EYEBROW TAIL. Do not make him Xiao Feng, Linghu Chong, Guo Jing, Hu Fei, a boy or an elderly man. Image 2, the new realistic Xiao Feng sample, supplies ONLY continuous realistic figure rendering, skin, hands, clean intact fabric and soft light. Image 3 supplies ONLY the corresponding gender’s muted project palette. Image 4 supplies ONLY pale ink-wash background language. Reconstruct garments from the written stage rather than copying clothing or fragmented marks from any image.

BASE ASSET: por_npc_zhujue__ch13_m_base
CURRENT BOOK-STAGE FACTS:
身份与阶段：现代人入书后的普通江湖行旅者；本图是时代基础装，不代表特定门派、现代职业或结局
时代与地域：ch13_feihu；清乾隆；约1766–1771年（项目推定；待考）；清乾隆年间汉地南北行旅中的普通江湖人
面容锚点：男性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；偏长的方圆脸，颧骨适度、下颌转折清楚而不宽阔，平直浓眉且左眉尾略高，深棕色中等杏眼，鼻梁直、鼻头圆钝，薄上唇与略厚下唇，左眉尾下有一颗浅褐小痣；暖中性肤色，保留自然纹理与极淡胡茬，无深皱纹；中等偏高、肩背匀称、四肢结实而不魁梧，约7.5头身；原生发质乌黑、直而略硬，保留的发丝密实；目光专注而有好奇心，嘴角平和，警觉但不怯弱。
本时代服饰发式：花青清前中期圆领右侧掩襟布长袍、灰赭短褂，窄布带、护腕、长裤与素面布鞋；前部剃发、后部黑发编成整齐实辫，辫根露出，不披散头发
兵器道具：一柄普通中国腰刀完整入鞘，微弯窄鞘、朴素小护手与木柄，无名器装具
气质姿态：重心稳而不沉重，视线专注、肩颈自然，一手放松、一手轻扶腰带，保留对承诺的郑重
跨界同一性：同性别十五版同脸、同体型、同发质、同成年年龄感；成长只作神态微调，压制不画成衰老或病弱
事实边界：主角脸、衣色、服装搭配与姿态均为原创美术默认，未声称原著或服饰史逐字复原

SAME-PERSON AND HEROIC DIRECTION:
俊朗端正、有判断力，身形中等偏高且匀称结实而不魁梧，极淡胡茬且不浓髯；清代前部剃发与后部黑色实辫连接清楚，辫根可辨，辫尾整齐伏后背。朝代变化不改变脸型、年龄或痣的位置，不能继续春秋椎髻、宋明全发高髻或披散长发。 飞狐外传 男主：重诺而果决的侠者：视线专注有锋芒而不凶恶，重心稳而轻捷，一手自然放松、一手轻扶腰带，神态体现认真守护承诺。肩背与护腕形成利落行动感，衣装便于行旅；力量内敛，不做逞凶、狞笑或急躁拔刀。

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
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhujue__ch13_m_base.prepared.json`。
