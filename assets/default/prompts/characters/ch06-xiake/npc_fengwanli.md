---
asset_id: por_npc_fengwanli__ch06_prime_onearm_base
subject_id: npc_fengwanli
name: 封万里
book: ch06_xiake
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch06/por_npc_fengwanli__ch06_prime_onearm_base.png
manifest: assets/default/character/male/ch06/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/xiake/fengwanli_2002_zhangshan_icyfiredh_20261002.jpg
  use: 第一图为2002吴健版《侠客行》张山饰封万里本人的可见脸部结构，已实际view并独立核角色页同图DOM及演员表；source collector为prep_audit，本作者独审source通过有限身份使用。只取可见眉眼、长直鼻梁、口唇和颊颏关系；头带遮上額、发际不清及暗光肤色不据图猜。不要头带、披发、张口、偏头、衣服、色光或TV改编剧情。当前中年、素方巾束髻、短髭、隐忍警觉、右臂缺失左手持剑与灰白衣服仍按role。不是production approved。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二图已实际view：root由用户原背景派生的无人纯背景，只取暖浅灰纸底、极淡远山与留白。无人物脸和衣装道具可借；背景水墨不得进入人物。内部派生参考不是原用户图、不是approved。
status: ready
realism_revision: user_identity_pose_20261001
---

# 封万里 · 人物写实修正

## 人物与阶段

- subject_id：npc_fengwanli
- book：ch06_xiake
- gender：male
- age_variant：prime

## 本轮人物写实规范

root已裁定右臂缺失／左手剑阶段；2002张山饰封万里本人脸结构第一、无人纯BG第二。正面头直眼平，真实右侧空袖、唯一完整左手持入鞘普通剑；保留中年灰白衣与方巾束髻、阶段短髭，不借影视头带披发或改编性格；先1candidate。仅准备待非作者全文独审，未注册未生成。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_fengwanli__ch06_prime_onearm_base/prompt-bdfa8f59565015a1cb2ca299aa49757729b1d1a98b1fda19555eddd7c393cd6a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE AND STAGE REQUIREMENTS: ONE FRONT-FACING full-body figure. Face and torso frontal, head and neck upright, eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt; NO Dutch angle. Feng Wanli has already LOST HIS OWN RIGHT ARM. His LEFT ARM AND LEFT HAND are intact. Never restore two arms or two hands. The empty right sleeve is on the viewer's LEFT in this frontal, non-mirrored composition. Exact amputation level is not established and stays covered by intact clothing.

Create a refined REALISTIC full-body Chinese wuxia illustration of 封万里 (npc_fengwanli). Input 1 is the documented 2002 TV version of this exact character, used ONLY for visible facial identity. Input 2 is a person-free derived background ONLY. Recompose one upright frontal character, preserving the role’s middle age, right-arm absence, intact left hand, hair, clothes and props. Do not borrow another person or transfer TV story changes.

身份阶段：《侠客行》ch06，雪山派中年弟子封万里，风火神龙；凌霄城旧案受白自在处罚之后、凌霄城内乱这一生前阶段，右臂已缺失、左臂完整。仅作此时静态基础立绘，不画受刑过程或内乱战斗现场。

年龄体貌：中年男子，消瘦而保有剑客的真实筋骨、自然成人比例，非青年或衰老病危者。右臂伤残已稳定存在，左臂和双腿完整；气质隐忍警觉、疲惫但清醒，不夸张痛苦、仇恨或残疾刻板形象。

本人脸锚：以第一图2002版封万里本人可见的长方脸、粗而近直略起弧的眉、清楚眼眶与正常大小双眼、较长直鼻梁及自然厚钝鼻尖、闭合后仍保持辨识的口唇宽度、面颊至下颏的方圆关系为身份基础。头带遮住的上额高度及发际不猜测，不把暗红光线当肤色。正面重绘时保留成熟中年骨肉、自然眼尾纹与轻陷面颊，眼神依当前阶段收为隐忍警觉、疲惫但清醒，嘴自然闭合，不复制张口惊视。短髭低垂与下巴稀短须茬沿当前role整理，是本稿阶段美术落实而非源图观察；不画长髯。灰黑发仍按role束髻素方巾，无影视头带或披发。可见面貌来自本人图，重绘朝向、修饰和被遮细节只作保守美术，不借令狐冲、白万剑或萧峰的脸。

服装与发式：灰白色右衽直身长衣，暗灰护领与窄腰带，墨灰长裤、黑布靴；灰黑头发收成紧实发髻，以素方巾整齐固定。汉式交领为穿着者左襟压右襟，按本人身体判断，不镜像。衣服完整、干净、厚实不透明，剪裁缝边连续，少量自然承重褶皱；右袖是有意收束的完整空袖，不画破布或撕裂衣料。款色、方巾和裁制沿角色稿美术选择，不冒称原著固定制服；本作明万历约1582–1583仅项目原创定年。

姿态、伤残与器物：单人正面稳立，脸与躯干朝向观者，头颈竖直、双眼水平、下巴中性、镜头平视。肩部可随既有伤残自然轻微不对称，但不靠歪头补偿；双脚稳定落地。人物自身右臂已经缺失：在正面非镜像画面中位于观者左侧。该侧衣袖自然松空，下段折收并固定在本人右腰，空袖轮廓清楚可辨，不能填出隐藏手臂或右手，不用披风遮没右侧，不画义肢。缺失的准确截断高度未核定，用完整上衣遮蔽，不描画或猜测断端、残端长度及关节位置，无创口和鲜血。人物自身左臂完整，在画面右侧；唯一可见的手是正常完整左手，清楚轻持一柄普通中国直剑的鞘口下方。整剑完全入鞘，柄、小横格、鞘口和长直鞘连贯可读，深木鞘配少量素旧铜包头，鞘长容纳整刃，鞘尾和黑靴均入画；与衣摆留自然可辨间隙，手指与鞘口关系清楚，不将手画成义肢。无第二把剑、腰上备用鞘或具名神兵，不挥剑、不画交战。完整全身在本项指头部、身体、左臂左手、双腿双足及全部衣物器物完整呈现，绝不要求补齐已缺失的右臂。

人物画法：完整精细写实国风插画，真实骨相、细腻可信皮肤、左手筋腱和布料纤维，形体有连续体积与柔和明暗，衣物有完整轮廓和缝边。柔和左上方漫射光，低饱和灰白、暗灰、墨褐，少量克制旧铜。面部结构和衣料连续，不以碎墨、风化或撕裂作人物造型；水墨仅在背景。

背景与交付：不透明暖浅灰纸底，极浅远山墨色和薄雾、充分留白，足下轻接触阴影，无具体雪山城门或内乱场景。原生2:3竖幅、单人单视图完整全身，头顶、发髻、唯一左手、双足、完整衣摆、全部器物端点留自然净空。目标2048×3072不透明PNG，接受工具真实原生尺寸并如实记录；保存原始PNG字节，不缩放、裁切、旋转、重编码或去溯源标识。先1张candidate；轻微指形、褶皱或几何偏差集中记录，只有明显身份错误、严重结构或不可读才追加，伤残侧别不得作为可忽略小偏差。始终candidate，不自动approved。

事实边界：原著正文转载明确支持凌霄城阶段右臂已失、改用左手剑；当前catalog/story/chapter仍保留断指概括，root已明确裁定本项按现role的右臂缺失阶段准备，不能回写成断指或补回手臂。两网页为同站正文转载，不是已核官方版权版或三联/广州纸本终校，确切年龄、截断高度与完整衣饰细节仍待考。可见面貌仅取本人影视图；被遮面部细节、胡须整理、衣色细分、发髻方巾、空袖固定结法、静态持鞘姿势和普通剑鞘装具是原创美术，不以武学配装制造特效。 角色页TV2002性格与情节改编不采作小说事实；其伤残措辞不作伤残依据，仍用既有正文审计和root裁定。

参考边界：第一图为2002吴健版《侠客行》张山饰封万里本人的可见脸部结构，已实际view并独立核角色页同图DOM及演员表；source collector为prep_audit，本作者独审source通过有限身份使用。只取可见眉眼、长直鼻梁、口唇和颊颏关系；头带遮上額、发际不清及暗光肤色不据图猜。不要头带、披发、张口、偏头、衣服、色光或TV改编剧情。当前中年、素方巾束髻、短髭、隐忍警觉、右臂缺失左手持剑与灰白衣服仍按role。不是production approved。 第二图已实际view：root由用户原背景派生的无人纯背景，只取暖浅灰纸底、极淡远山与留白。无人物脸和衣装道具可借；背景水墨不得进入人物。内部派生参考不是原用户图、不是approved。

完整排除项：不要head tilt、Dutch angle、头歪向肩、斜眼线、低头藏眼、仰头、侧脸回眸、明显侧身或倾斜镜头。不要借用其他人的脸；第一图仅指定封万里本人可见脸结构，不复制其年龄偏差、发式头带、披发、衣服、张口、偏头、姿势或身体轮廓；不要令狐冲青年脸、白万剑或萧峰的脸、女性脸、现代明星照片、影视截图构图或游戏独创造型。不要统一偶像脸、动漫大眼、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真、三维渲染感、丑化伤残或畸形健美肌肉。不要补回右臂、右手、右侧手指，不要将右臂藏在背后或衣内假装空袖，不要把只有断指当成本阶段，不要镜像成左臂缺失，不要把完整左手画残；不要双手持剑、右手捏诀、义肢、机械手、额外手臂、凭空手掌，不要画裸露断端、鲜血或受刑场景，不要猜截断高度。不要多指、粘连手指、错接手腕、手鞘融合、悬空装备、失重衣袖、弯折断裂剑鞘、容不下剑刃的短鞘、第二把剑或备用鞘。不要现代服装、拉链、腕表、运动鞋、数码物件、现代蕾丝、塑料饰品、高跟鞋；不要清式剃额辫发、马蹄袖、旗装、民国旗袍、大拉翅、唐代齐胸裙、朝代族群混搭、官服补子或飞鱼服；不要左衽或水平镜像。不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要无依据的具名武器、火焰神龙、神兽、发光兵器、光翼、法阵、龙形能量、粒子特效、战神化、强逆光、泛光或烟雾遮脸。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、碎布条、破洞、毛边、脏污斑驳、过密细皱或雾吞轮廓。不要文字、伪字、题字、题款、签名、印章、logo、装饰水印、器物铭文或书页字符，不去除或伪造工具自身溯源标识。不要裸露、透明衣料、色情化、血腥特写或恶搞。不要额外人物、多视图、分格、头像插框、复杂场景、前景花枝、亭阁、裁断头顶、左手、双足、衣摆或剑鞘端点，不用画师姓名作风格词。

FINAL CHECK: frontal face and torso; head upright, eyes level; ONE intact LEFT hand holding ONE fully sheathed ordinary straight sword, RIGHT arm absent with empty sleeve secured at the right waist; no guessed stump anatomy. Realistic complete clothing and readable full figure, ink wash only outside the body. NO head tilt; NO Dutch angle.
```

## 排除项

不要head tilt、Dutch angle、头歪向肩、斜眼线、低头藏眼、仰头、侧脸回眸、明显侧身或倾斜镜头。不要借用其他人的脸；第一图仅指定封万里本人可见脸结构，不复制其年龄偏差、发式头带、披发、衣服、张口、偏头、姿势或身体轮廓；不要令狐冲青年脸、白万剑或萧峰的脸、女性脸、现代明星照片、影视截图构图或游戏独创造型。不要统一偶像脸、动漫大眼、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真、三维渲染感、丑化伤残或畸形健美肌肉。不要补回右臂、右手、右侧手指，不要将右臂藏在背后或衣内假装空袖，不要把只有断指当成本阶段，不要镜像成左臂缺失，不要把完整左手画残；不要双手持剑、右手捏诀、义肢、机械手、额外手臂、凭空手掌，不要画裸露断端、鲜血或受刑场景，不要猜截断高度。不要多指、粘连手指、错接手腕、手鞘融合、悬空装备、失重衣袖、弯折断裂剑鞘、容不下剑刃的短鞘、第二把剑或备用鞘。不要现代服装、拉链、腕表、运动鞋、数码物件、现代蕾丝、塑料饰品、高跟鞋；不要清式剃额辫发、马蹄袖、旗装、民国旗袍、大拉翅、唐代齐胸裙、朝代族群混搭、官服补子或飞鱼服；不要左衽或水平镜像。不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要无依据的具名武器、火焰神龙、神兽、发光兵器、光翼、法阵、龙形能量、粒子特效、战神化、强逆光、泛光或烟雾遮脸。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、碎布条、破洞、毛边、脏污斑驳、过密细皱或雾吞轮廓。不要文字、伪字、题字、题款、签名、印章、logo、装饰水印、器物铭文或书页字符，不去除或伪造工具自身溯源标识。不要裸露、透明衣料、色情化、血腥特写或恶搞。不要额外人物、多视图、分格、头像插框、复杂场景、前景花枝、亭阁、裁断头顶、左手、双足、衣摆或剑鞘端点，不用画师姓名作风格词。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_fengwanli__ch06_prime_onearm_base.prepared.json`。
