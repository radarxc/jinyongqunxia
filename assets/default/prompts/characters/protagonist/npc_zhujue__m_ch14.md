---
asset_id: por_npc_zhujue__ch14_m_base
subject_id: npc_zhujue
name: 主角（男）· 清乾隆·雪地
book: ch14_xueshan
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch14/por_npc_zhujue__ch14_m_base.png
manifest: assets/default/character/male/ch14/manifest.yaml
references:
- path: assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png
  use: 第一身份参考必须是同一路径经真实落盘并通过视觉核对后的 ch00 男主新版写实图，manifest realism_revision 必须等于 user_character_realism_20261001；准备时重新读取PNG与manifest及实际哈希，不能使用目前旧版或仅凭路径存在通过。只继承同人脸、骨相、肤色、均衡体型、约28岁成年感和左眉尾下浅褐痣，按本书重建清代剃发留辫及衣装武器，不继承碎布画法或春秋发髻。未声称已查看未来新版。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 仅参考新版萧峰连贯精细的写实人物绘法、自然皮肤与双手、完整衣料和柔光体积；绝不复制其脸、男性性别、年龄、胡须、魁梧体型、发型、衣装、掌势、金龙或场景。该参考不提供本角色身份。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 仅取对应性别项目基线的低饱和国风色卡；不借用面容、年龄、身体、发式、服装、兵器、姿态、碎墨笔触或皮肤质地；用户授权使用现有基线，原审批状态保持。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 只取用户图背景的淡水墨、暖浅灰纸底、空气感和留白；背景墨气留在人物背后。绝不复制人物、面容、青白衣装、披帛或把纸纹碎墨覆盖到皮肤和衣服。基础立绘不照搬具体山水场景。
status: redo
realism_revision: user_character_realism_20261001
redo_reason: "随男主 ch00 新锚点统一重出（加左眉断疤与朱红发绳、去 AI 味），服饰沿用本时代设定"
reference_upload:
- assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png
---

# 主角（男）· 清乾隆·雪地 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**微调重出**。随男主 ch00 新锚点统一重出（加左眉断疤与朱红发绳、去 AI 味），服饰沿用本时代设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】主角（男）：本作原创的穿越者，此刻身处《雪山飞狐》清乾隆·雪地（约 1780 年，项目年表）；长白山雪地旅途的普通江湖人。本图是他在这一时代的基础立绘，不代表特定门派或结局。
【身份参考】随提示词上传的第 1 张图是主角本人（序章 ch00 新版定稿）：保持同一个人——脸型、左眉断疤与小痣、眼睛、鼻子、嘴、肤色、体型和年龄都不变；只把服饰、发式和道具换成下文的本时代版本。不要照搬图中的衣服、姿势和背景。
【本人面容（十五个时代统一，不能变）】约二十八岁的现代中国男青年，原创面孔，不像任何演员或书中其他人物。偏长的方圆脸，颧骨适中，下颌转折清楚但不宽；平直的浓眉，左眉眉峰处有一道约一厘米长的浅白色旧疤，把左眉截成两段（全书标志，必须清楚可见）；左眉尾下方一颗浅褐色小痣；深棕色中等大小的杏眼、内双，眼神专注、带一点好奇；鼻梁直、鼻头圆钝；上唇薄、下唇略厚，嘴角平和；暖中性略带日晒的肤色，唇上与下巴有极淡的胡茬，眼角有一两道细纹。中等偏高的个子，肩背匀称，四肢结实而不魁梧（约 7.5 头身）；乌黑的头发直而略硬。整体是踏实可靠、警觉而不凶的普通青年，不是偶像或模特。
【主角标志】发髻根部（清代则是辫梢）系一根褪色的朱红细绳，露出短短的绳头——每个时代都保留这根红绳。
【服饰】雪灰色清前中期圆领右侧掩襟厚棉长袍，深青短褂、窄布腰带，朴素的短毛领（不遮脸）、厚裤与平底软皮靴；前部剃发、脑后黑发编成实辫，辫梢系朱红细绳。
【道具】左腰用两根短系带挂一柄普通的中国腰刀，完整入微弯的窄木鞘，朴素小护手与木柄，无纹饰；刀不出鞘。
【姿态与神情】双脚坚定落地、肩背舒展，目光沉静，厚冬衣下仍看得出同一个人的挺拔体态，不因寒冷显得疲惫衰老。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要明星脸或模特式五官；不要与书中男女主角撞脸；不要具名神兵、门派徽记、官服；不要年龄变小或变老。不要跨时代混搭的发式和服饰。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_zhujue
- book：ch14_xueshan
- gender：male
- age_variant：prime

## 本轮人物写实规范

首次生成；雪山飞狐 男主：能够面对艰难选择的沉静侠者：目光坚定清明，胸肩开阔、双脚有力落地，厚冬衣之下仍能读出同一主角的挺拔体态。短毛领与厚棉衣形成有分量的轮廓，克制而坚韧，神态不因寒冷而疲惫衰老；不提前表达最后一刀或任何结局立场。 人物精细美观写实，连续自然肤质和完整整洁衣料，背景淡水墨；同人约28岁与识别痣不变，清代发型、阶段装备不变，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhujue__ch14_m_base/prompt-42fac0c0a1d3cd13a21898fb1fe712b2e630f4efdc7c43c42e965e0c1ebac57e.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
CURRENT QING WINTER COSTUME AND HAIR MUST CHANGE: preserve only the FACE and balanced BODY identity of reference 1. The same 28-year-old man has a clearly SHAVED FRONT SCALP and one solid black QUEUE from rear crown down his back, no topknot or full front hair. Dress him in a snow-grey thick padded ROUND-COLLAR long robe fastening on the right, a DEEP TEAL short jacket, modest short fur collar, plain narrow belt, thick trousers and warm flat soft-leather boots. Face unobscured; no thin crossed-collar green robe. One ordinary slightly curved Chinese waist saber fully sheathed at his left hip. Keep his small mole below HIS LEFT EYEBROW TAIL. No aging, battle or ending scene.

Create a premium REALISTIC Chinese wuxia full-body character illustration, with an airy, extremely pale INK-WASH BACKGROUND. Render one beautiful, believable, individually recognizable human with continuous anatomy, finely resolved eyes and natural skin, anatomically legible hands and feet, connected soft light and shade, fully opaque intact clean cloth, precise tailoring and clean sewn hems. Use refined hand-painted realism, never a photograph or a 3D model. Skin, hair, clothes and shoes must remain solid, connected and readable. Paper texture, dry ink and loose atmospheric marks belong exclusively BEHIND the human figure. Prefer a few broad weight-bearing folds to tiny shards or ribbons; faded economical clothes remain complete, washed and cared for. Preserve any specifically required small neatly sewn repair without making a patchwork costume. Character age, disability, social role and equipment are established by the written facts, not by the quality-reference man.

REFERENCE ROLES ARE SEPARATE. The first image must be the COMPLETED new realistic ch00 male protagonist revision user_character_realism_20261001, verified at preparation time from its actual PNG and manifest. Until then this design is waiting on that identity asset; an old file at the same path is insufficient. Preserve that same person’s face, bones, warm-neutral skin, balanced body, mature age about 28 and mole below HIS LEFT EYEBROW TAIL. Do not make him Xiao Feng, Linghu Chong, Guo Jing, Hu Fei, a boy or an elderly man. Image 2, the new realistic Xiao Feng sample, supplies ONLY continuous realistic figure rendering, skin, hands, clean intact fabric and soft light. Image 3 supplies ONLY the corresponding gender’s muted project palette. Image 4 supplies ONLY pale ink-wash background language. Reconstruct garments from the written stage rather than copying clothing or fragmented marks from any image.

BASE ASSET: por_npc_zhujue__ch14_m_base
CURRENT BOOK-STAGE FACTS:
身份与阶段：现代人入书后的普通江湖行旅者；本图是时代基础装，不代表特定门派、现代职业或结局
时代与地域：ch14_xueshan；清乾隆·雪地；1780年（沿用项目年表；具体开篇纪年待考）；长白山雪地旅途的普通江湖人
面容锚点：男性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；偏长的方圆脸，颧骨适度、下颌转折清楚而不宽阔，平直浓眉且左眉尾略高，深棕色中等杏眼，鼻梁直、鼻头圆钝，薄上唇与略厚下唇，左眉尾下有一颗浅褐小痣；暖中性肤色，保留自然纹理与极淡胡茬，无深皱纹；中等偏高、肩背匀称、四肢结实而不魁梧，约7.5头身；原生发质乌黑、直而略硬，保留的发丝密实；目光专注而有好奇心，嘴角平和，警觉但不怯弱。
本时代服饰发式：雪灰清前中期圆领右侧掩襟厚棉长袍，深青短褂与窄布腰带，内衬保暖，朴素短毛领、厚裤及平底软皮靴；前部剃发、后部黑发编成实辫，发根露出，辫尾整齐伏在身后
兵器道具：一柄普通中国腰刀完整入鞘，朴素微弯木鞘、小护手，无名器纹样
气质姿态：双脚坚定落地、肩背舒展，目光沉静、能够承担选择；不摆出劈刀动作，不预设结局立场
跨界同一性：同性别十五版同脸、同体型、同发质、同成年年龄感；成长只作神态微调，压制不画成衰老或病弱
事实边界：主角脸、衣色、服装搭配与姿态均为原创美术默认，未声称原著或服饰史逐字复原

SAME-PERSON AND HEROIC DIRECTION:
俊朗端正、有判断力，身形中等偏高且匀称结实而不魁梧，极淡胡茬且不浓髯；清代前部剃发与后部黑色实辫连接清楚，辫根可辨，辫尾整齐伏后背。朝代变化不改变脸型、年龄或痣的位置，不能继续春秋椎髻、宋明全发高髻或披散长发。 雪山飞狐 男主：能够面对艰难选择的沉静侠者：目光坚定清明，胸肩开阔、双脚有力落地，厚冬衣之下仍能读出同一主角的挺拔体态。短毛领与厚棉衣形成有分量的轮廓，克制而坚韧，神态不因寒冷而疲惫衰老；不提前表达最后一刀或任何结局立场。

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
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhujue__ch14_m_base.prepared.json`。
