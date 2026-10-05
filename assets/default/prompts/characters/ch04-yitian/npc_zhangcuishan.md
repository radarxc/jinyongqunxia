---
asset_id: por_npc_zhangcuishan__ch04_prime_wangpanshan_base
subject_id: npc_zhangcuishan
name: 张翠山
book: ch04_yitian
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch04/por_npc_zhangcuishan__ch04_prime_wangpanshan_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入仅作低饱和配色色卡；不是本人，不参考脸、身体、年龄、发式、衣装款式、兵器、姿势、头部角度或破损布边。人物写实结构按文字独立建立；基线审批状态不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入只供背景水墨：暖浅灰留白、浅墨远山、疏林与薄雾；不继承女性人物、面容、性别、体型、衣裙、发饰、半透明布料、姿态或倾头，墨迹止于人物轮廓之外。
status: ready
realism_revision: user_identity_pose_20261001
---

# 张翠山 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhangcuishan
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

ROOT新授权本批普通/前史准备；原创独立文字面容，正面头直中性下巴，完整写实人物、不透明衣料、水墨背景。仅单候选设计，未生成未注册，等待其他agent独立审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhangcuishan__ch04_prime_wangpanshan_base/prompt-69bf97a97a5f55f5da92535cc4284f577dffd4745bc79f7b1a5cbeebfa6fe523.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT, forehead–nose–chin centreline vertical, both eyes HORIZONTALLY LEVEL, gaze forward, chin neutral, camera level. Preserve natural facial asymmetry without tilting the head. No head tilt, side view, raised chin or Dutch angle. These pose requirements override the reference poses and the old role draft.

Create one realistic full-body portrait of 张翠山 for a Chinese wuxia game. This is an ORIGINAL TEXT-DEFINED FACE. Image 1 is palette only and image 2 is ink-background only. Neither is an identity portrait; do not copy or average their faces. No claim of a game portrait, TV actor reconstruction or historical likeness.

身份与阶段：张翠山（npc_zhangcuishan），《倚天屠龙记》ch04_yitian。名录壮年档的成年武当五侠，王盘山出海前的前史形象，银钩铁划尚在身。元末书界，前史按本稿阶段独立处理，精确纪年待考。

年龄与体型：已成年武当五侠，身材修长有力，书卷气与习武体格并存。prime/名录壮年仅是检索归档，本图为更早王盘山前史，不据归档标签硬推精确岁数或画成寿宴中年。

原创本人面容：原创清俊长方脸，额头舒展、颞部与下颌宽度相近，颊面平顺，下颌线较平直、下巴端正有宽度；区别宋青书向窄圆下巴收束的椭圆脸。眉毛平缓而清整，眉间舒展，自然较开阔的眼裂与温润坚定的目光；鼻梁挺直、鼻尖柔和，嘴宽适中、下唇略有体积，嘴角平稳。清洁无须，黑色整齐发际，成年紧实肤质与少量自然表情纹，不画深重老年纹或少年稚态。书卷气来自温润眼神和端正气质，不能套令狐冲基线的笑意与五官。

服制与发式：元末前史的汉地右衽青灰长袍、素白内领、深灰布带、收口袖与布靴，黑发束成整齐道髻，低矮素冠固定。交领右衽，穿着者左襟压右襟，不水平翻转；衣装完整不透明，少量宽缓受力褶皱。具体配色、冠发和裁制均为原创美术补足，不称原著固定制服。

正面姿态与器物：正面端正站立，两足稳定微错，头颈竖直、双眼水平直视、下巴中性；双臂稍离衣摆，手掌握点与器物清楚分离。本人左手（观者右侧）握烂银虎头钩：一件可用的银色金属钩兵，连贯硬质杆柄与钩刃，克制虎头式金属装饰，无真实兽头、皮毛或生物眼睛。本人右手（观者左侧）握镔铁判官笔：深铁色硬质点穴短兵，有清楚握柄及一体硬尖，没有羊毫、软毛或墨汁。左钩右笔合为 eq_yingoutiehua，钩刃与笔尖向下且分开，不交叉遮脸，两件端点全部入画；不另挂直剑。左右手为项目装备表明定，钩笔长度、装饰细款及静态持法为原创落实。

人物画法：美观精细的写实国风人物插画，真实骨相、自然眼睛大小与适龄皮肤，脸、手、四肢、衣料和器物具有完整坚实连续体积。细腻手绘笔触、柔和左上漫射光、连贯明暗和清楚轮廓；保留适龄自然细纹，不画塑料磨皮。衣料完整不透明、可穿且缝线明确，只留少量宽缓受力褶皱；旧衣也不主动加裂口、碎布或飞白。水墨与纸纹只在背景，不穿透皮肤衣料，不切碎人物。

构图与背景：单人单视图、水平平视、原生竖幅2:3，完整头顶发饰、双手、双足、衣摆和全部器物端点入画，四周自然留净空，不用固定占高或头身数强行拉长。暖浅灰不透明纸底，低对比水墨远山、疏林、薄雾与留白可以自然展开，脚下有轻微接触阴影，背景不抢夺人物。目标2048×3072不透明PNG；若工具原生尺寸不同则如实登记，保存原始PNG字节和元数据，不裁切、旋转、放大或重编码。先1张真实候选；候选待审核，不自动approved，细微手指/佩挂/角度问题如实登记，仅严重身份、结构或不可读问题才另行补图。

事实边界：王盘山前史精确年龄、钩笔名称字形与具体器形、出海失落和归舟补配先后，仍按角色稿保留三联/广州修订版待考；不宣称已核原文或给出虚构引文页码。 项目身份与器物依据本地角色、名录和正文；本轮未新联网考据，不伪造指定版本的引文或页码。

图像输入边界：第一输入仅作低饱和配色色卡；不是本人，不参考脸、身体、年龄、发式、衣装款式、兵器、姿势、头部角度或破损布边。人物写实结构按文字独立建立；基线审批状态不传递给新图。 第二输入只供背景水墨：暖浅灰留白、浅墨远山、疏林与薄雾；不继承女性人物、面容、性别、体型、衣裙、发饰、半透明布料、姿态或倾头，墨迹止于人物轮廓之外。

完整排除项：NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、标签、签名、印章、logo或装饰水印；保留工具本身溯源信息。不要现代衣物与数码物件、动漫大眼、统一网红脸、塑料皮肤、照片截图感或三维模型感；不要把配色基线或背景人物的面孔、身体、衣装和姿势搬来。不要明清官服补子、清式剃发长辫、马蹄袖、帝王冠、日本刀或欧式奇幻甲；汉式交领右衽，不水平镜像。不要歪头、倾斜镜头、侧脸、抬下巴或低头藏眼；不要多人物、多视图、多肢、手物融合、失去挂点的装备、裁断头足或器物。不要透明衣料、裸露、色情化、血腥、碎墨人物、纸纹透肤透衣、裂衣碎布或密集噪点；不要发光兵器、仙法光翼或法阵。 专项排除：左笔右钩、羊毫毛笔、软笔毫与墨汁、真正虎头兽形或兽头法杖、倚天剑与屠龙刀双持、后期太极教学、归舟后默认补回失落兵器、百岁寿宴血迹或自尽场面。

FINAL CHECK: front-facing, head upright, eyes level, chin neutral; one distinct identity, correct age/stage and props, intact opaque clothing, ink background outside the figure.
```

## 排除项

NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、标签、签名、印章、logo或装饰水印；保留工具本身溯源信息。不要现代衣物与数码物件、动漫大眼、统一网红脸、塑料皮肤、照片截图感或三维模型感；不要把配色基线或背景人物的面孔、身体、衣装和姿势搬来。不要明清官服补子、清式剃发长辫、马蹄袖、帝王冠、日本刀或欧式奇幻甲；汉式交领右衽，不水平镜像。不要歪头、倾斜镜头、侧脸、抬下巴或低头藏眼；不要多人物、多视图、多肢、手物融合、失去挂点的装备、裁断头足或器物。不要透明衣料、裸露、色情化、血腥、碎墨人物、纸纹透肤透衣、裂衣碎布或密集噪点；不要发光兵器、仙法光翼或法阵。 专项排除：左笔右钩、羊毫毛笔、软笔毫与墨汁、真正虎头兽形或兽头法杖、倚天剑与屠龙刀双持、后期太极教学、归舟后默认补回失落兵器、百岁寿宴血迹或自尽场面。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhangcuishan__ch04_prime_wangpanshan_base.prepared.json`。
