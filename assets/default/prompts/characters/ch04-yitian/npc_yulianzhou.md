---
asset_id: por_npc_yulianzhou__ch04_prime_base
subject_id: npc_yulianzhou
name: 俞莲舟
book: ch04_yitian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch04/por_npc_yulianzhou__ch04_prime_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入仅作低饱和配色色卡；不是本人，不参考脸、身体、年龄、发式、衣装款式、兵器、姿势、头部角度或破损布边。人物写实结构按文字独立建立；基线审批状态不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入只供背景水墨：暖浅灰留白、浅墨远山、疏林与薄雾；不继承女性人物、面容、性别、体型、衣裙、发饰、半透明布料、姿态或倾头，墨迹止于人物轮廓之外。
status: ready
realism_revision: user_identity_pose_20261001
---

# 俞莲舟 · 人物写实修正

## 人物与阶段

- subject_id：npc_yulianzhou
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

ROOT新授权本批普通/前史准备；原创独立文字面容，正面头直中性下巴，完整写实人物、不透明衣料、水墨背景。仅单候选设计，未生成未注册，等待其他agent独立审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yulianzhou__ch04_prime_base/prompt-6958d65ef09cd278c53ba7ae6a3e069c3e5326ffcbafd2e1a167467f9d6a8007.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT, forehead–nose–chin centreline vertical, both eyes HORIZONTALLY LEVEL, gaze forward, chin neutral, camera level. Preserve natural facial asymmetry without tilting the head. No head tilt, side view, raised chin or Dutch angle. These pose requirements override the reference poses and the old role draft.

Create one realistic full-body portrait of 俞莲舟 for a Chinese wuxia game. This is an ORIGINAL TEXT-DEFINED FACE. Image 1 is palette only and image 2 is ink-background only. Neither is an identity portrait; do not copy or average their faces. No claim of a game portrait, TV actor reconstruction or historical likeness.

身份与阶段：俞莲舟（npc_yulianzhou），《倚天屠龙记》ch04_yitian。中年武当二侠，武当守山与同门责任阶段。元末书界，前史按本稿阶段独立处理，精确纪年待考。

年龄与体型：中年成年男子，精瘦扎实，肩背紧实、四肢健全；不因守山严肃气质画成病弱或老者。

原创本人面容：原创瘦长梯形中年脸，太阳穴较窄、颧骨位置偏高，颊部自然收束而非病态凹陷，下颌两侧利落、下巴偏窄平。直而紧整的眉毛，眼眶稍深，横向较窄的眼裂和水平眼尾，清醒锐利但不阴狠；鼻梁较高、鼻翼窄，鼻尖有清楚骨量。嘴较窄、双唇紧而平，上唇仅留少量整齐短髭，下巴清洁、不留颏须。中年眼角细纹和少量灰鬓，肤色自然；区别宋远桥的宽圆脸、饱满颊肉和整片短须，也区别俞岱岩的垂眼尾及短灰颏须。

服制与发式：元末武当深蓝灰右衽道袍、灰白内领、深灰布绦、收束袖口与布鞋，黑发夹少量灰鬓，端正小道髻与木簪。交领右衽，穿着者左襟压右襟，不水平翻转；衣装完整不透明，少量宽缓受力褶皱。具体配色、冠发和裁制均为原创美术补足，不称原著固定制服。

正面姿态与器物：正面稳立、两足承重，一足仅略前，头颈竖直、双眼水平看向观者，下巴中性，肩线平衡。本人右手（观者左侧）在身侧稍向前，空手五指自然微张以示护持；左手自然靠近腰侧，不作虎爪擒拿。本人左腰（观者右侧）挂普通中国直身双刃长剑，剑刃完整入深色木鞘，窄小中式剑格、柄鞘同轴，挂带与布绦相接，长鞘端点完整。佩挂侧和静态手势为本次原创落实。

人物画法：美观精细的写实国风人物插画，真实骨相、自然眼睛大小与适龄皮肤，脸、手、四肢、衣料和器物具有完整坚实连续体积。细腻手绘笔触、柔和左上漫射光、连贯明暗和清楚轮廓；保留适龄自然细纹，不画塑料磨皮。衣料完整不透明、可穿且缝线明确，只留少量宽缓受力褶皱；旧衣也不主动加裂口、碎布或飞白。水墨与纸纹只在背景，不穿透皮肤衣料，不切碎人物。

构图与背景：单人单视图、水平平视、原生竖幅2:3，完整头顶发饰、双手、双足、衣摆和全部器物端点入画，四周自然留净空，不用固定占高或头身数强行拉长。暖浅灰不透明纸底，低对比水墨远山、疏林、薄雾与留白可以自然展开，脚下有轻微接触阴影，背景不抢夺人物。目标2048×3072不透明PNG；若工具原生尺寸不同则如实登记，保存原始PNG字节和元数据，不裁切、旋转、放大或重编码。先1张真实候选；候选待审核，不自动approved，细微手指/佩挂/角度问题如实登记，仅严重身份、结构或不可读问题才另行补图。

事实边界：精确年龄、原著体形脸型、须发衣色和普通兵器仍待三联/广州修订版逐字核对；普通剑和微张空手为武当语汇的原创美术选择，不新定专属神兵或武学配装。 项目身份与器物依据本地角色、名录和正文；本轮未新联网考据，不伪造指定版本的引文或页码。

图像输入边界：第一输入仅作低饱和配色色卡；不是本人，不参考脸、身体、年龄、发式、衣装款式、兵器、姿势、头部角度或破损布边。人物写实结构按文字独立建立；基线审批状态不传递给新图。 第二输入只供背景水墨：暖浅灰留白、浅墨远山、疏林与薄雾；不继承女性人物、面容、性别、体型、衣裙、发饰、半透明布料、姿态或倾头，墨迹止于人物轮廓之外。

完整排除项：NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、标签、签名、印章、logo或装饰水印；保留工具本身溯源信息。不要现代衣物与数码物件、动漫大眼、统一网红脸、塑料皮肤、照片截图感或三维模型感；不要把配色基线或背景人物的面孔、身体、衣装和姿势搬来。不要明清官服补子、清式剃发长辫、马蹄袖、帝王冠、日本刀或欧式奇幻甲；汉式交领右衽，不水平镜像。不要歪头、倾斜镜头、侧脸、抬下巴或低头藏眼；不要多人物、多视图、多肢、手物融合、失去挂点的装备、裁断头足或器物。不要透明衣料、裸露、色情化、血腥、碎墨人物、纸纹透肤透衣、裂衣碎布或密集噪点；不要发光兵器、仙法光翼或法阵。 专项排除：俞岱岩的轮椅与伤残卧病状态、宋远桥的宽圆脸、张三丰的长白须、虎爪手套、金属兽爪、虎皮、帝王冠和明代官服补子。

FINAL CHECK: front-facing, head upright, eyes level, chin neutral; one distinct identity, correct age/stage and props, intact opaque clothing, ink background outside the figure.
```

## 排除项

NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、标签、签名、印章、logo或装饰水印；保留工具本身溯源信息。不要现代衣物与数码物件、动漫大眼、统一网红脸、塑料皮肤、照片截图感或三维模型感；不要把配色基线或背景人物的面孔、身体、衣装和姿势搬来。不要明清官服补子、清式剃发长辫、马蹄袖、帝王冠、日本刀或欧式奇幻甲；汉式交领右衽，不水平镜像。不要歪头、倾斜镜头、侧脸、抬下巴或低头藏眼；不要多人物、多视图、多肢、手物融合、失去挂点的装备、裁断头足或器物。不要透明衣料、裸露、色情化、血腥、碎墨人物、纸纹透肤透衣、裂衣碎布或密集噪点；不要发光兵器、仙法光翼或法阵。 专项排除：俞岱岩的轮椅与伤残卧病状态、宋远桥的宽圆脸、张三丰的长白须、虎爪手套、金属兽爪、虎皮、帝王冠和明代官服补子。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yulianzhou__ch04_prime_base.prepared.json`。
