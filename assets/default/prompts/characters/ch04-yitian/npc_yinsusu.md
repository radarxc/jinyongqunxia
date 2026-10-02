---
asset_id: por_npc_yinsusu__ch04_prime_ziwei_base
subject_id: npc_yinsusu
name: 殷素素
book: ch04_yitian
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch04/por_npc_yinsusu__ch04_prime_ziwei_base.png
manifest: assets/default/character/female/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第一输入仅为同性别项目色彩、柔和光线和绘制品质基线，不是本人身份图。不传递其脸型、五官、年龄、性别特征、体型、发式、衣服、道具或姿态；不复制男基线的破损毛边和密集粗糙衣纹。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入为用户王语嫣水墨图，只取暖浅灰不透明纸底、极淡水墨远山、薄雾与留白。完全忽略其中人物面容、性别、年龄、衣裙、体型、飘带和倾头；不复制清晰亭台与前景花枝。
status: ready
realism_revision: user_identity_pose_20261001
---

# 殷素素 · 人物写实修正

## 人物与阶段

- subject_id：npc_yinsusu
- book：ch04_yitian
- gender：female
- age_variant：prime

## 本轮人物写实规范

成年天鹰教紫微堂主，王盘山前史阶段、独立行走江湖时；未进入冰火岛归舟或百岁寿宴改命。 design/10 明确 eq_wenxuzhen 为殷素素使用的细小蚊须针；王盘山前后是否明确淬毒仍待考，中毒效果为项目扩展。本图不画毒液毒光。三枚、右手与低持方式是艺术选择，不把每战15的规则数量画成十五枚或针雨。白衣、头巾、确岁和针形细部保留主稿待考。 原创本人文字面容；单候选准备稿，等待独立全文审核，不生成注册。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yinsusu__ch04_prime_ziwei_base/prompt-ecc6ab110fcbbfde8755b660cfce66515e4dcd332af997ffe2c0414b5cb92232.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS PRIMARY: one FRONT-FACING person, camera level, head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, eyes HORIZONTALLY LEVEL, chin neutral. No head tilt, no Dutch angle. The figure may stand or sit ONLY as specified below; never change a disabled seated character into a standing figure.

Create a REALISTIC full-body Chinese wuxia character portrait of 殷素素. This is an ORIGINAL TEXT-DEFINED IDENTITY. Neither reference image supplies the character's face: image 1 is palette/painting quality only, image 2 is pale ink background only. Build the distinct facial anchors below. No claim of original-game, television-actor or historical likeness.

身份阶段：殷素素（npc_yinsusu），《倚天屠龙记》ch04_yitian。成年天鹰教紫微堂主，王盘山前史阶段、独立行走江湖时；未进入冰火岛归舟或百岁寿宴改命。

原创独立面容与体态：独立原创的成年瓜子脸，颧部轮廓明晰、下颌利落，额宽适中，下巴短而圆收；眉形略挑，眼裂较长且外眼角轻扬，眼距匀称，挺直鼻梁与清楚鼻尖，唇线分明、上唇有自然弓形，唇角含克制笑意。警觉明艳、聪敏果断，不套小昭稚气小脸或殷离圆棱脸。年轻成年女子的轻捷有力体态，确岁未核，不画未成年或柔弱侍女。

服装与发式：象牙白汉式右衽窄袖长袄、浅灰长裙、深墨窄腰带和平底短靴；衣料完整不透明、覆盖胸腹与腿部。乌黑长发束成利落高髻，以素白布巾收边。堂名不决定衣色，不改成满身紫色法衣。 所有汉式交领均本人左襟压右襟、向本人右侧合拢，不水平镜像。

姿态、身体状态与器物：完整全身正面站立，头直、双眼水平、下巴中性，一足略前而重心稳定，肩背自信自然。右手在身体侧前低处轻拈三枚纤细金属蚊须针，针尖齐朝下，手指与针分离可辨、针体完整、不悬浮或射出；左手自然停在腰侧、手形清楚。只有这些小针，无屠龙刀、长剑、婴儿或家庭同框。

人物画法：完整而美观的写实国风人物插画，面孔、双手、头发、衣料与器物均为连续坚实体积，骨相和年龄自然，柔和左上漫射光、清楚轮廓、克制低饱和设色。皮肤具有自然细节；仅保留本角色上文明确设定的年龄与身体状态，不添加别的角色的浮肿、暗斑或伤肢；对于上文明示的面损或功能限制，写实与美观不等于恢复健康，也不能把未成年角色画成成年人。衣装完整、不透明、剪裁清楚，褶皱少量宽缓且有受力，不加破损、碎布或密集噪点。水墨远山、薄雾与纸纹只在背景，不侵入脸、手、衣料或辅助器物。不是照片、影视截图、三维塑料模型或换头拼贴。

构图背景与交付：单人、单视图、原生竖幅2:3、完整全身，所有既定头发、手足、衣摆与器物端点入画，自然留白，不按固定占高或头身数字拉伸。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并如实登记；保留原始PNG字节及元数据，不裁切、放大、旋转或重新编码。背景为暖浅灰纸底，允许极淡低对比水墨山水和薄雾，脚下或座具下少量接触阴影，无叙事场景和额外人物。只准备1张candidate；实际生成后再核验，不自动approved，不虚构两候选比较。

事实边界：design/10 明确 eq_wenxuzhen 为殷素素使用的细小蚊须针；王盘山前后是否明确淬毒仍待考，中毒效果为项目扩展。本图不画毒液毒光。三枚、右手与低持方式是艺术选择，不把每战15的规则数量画成十五枚或针雨。白衣、头巾、确岁和针形细部保留主稿待考。 元末时代与当前阶段优先；项目前史及主体1336–1363不作为本图精确原著年份。未补造确岁、引文、回目或页码。

参考输入边界：第一输入仅为同性别项目色彩、柔和光线和绘制品质基线，不是本人身份图。不传递其脸型、五官、年龄、性别特征、体型、发式、衣服、道具或姿态；不复制男基线的破损毛边和密集粗糙衣纹。 第二输入为用户王语嫣水墨图，只取暖浅灰不透明纸底、极淡水墨远山、薄雾与留白。完全忽略其中人物面容、性别、年龄、衣裙、体型、飘带和倾头；不复制清晰亭台与前景花枝。

完整排除项：NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、签名、印章、logo或装饰水印；工具溯源和元数据保留。不要现代服饰、拉链、腕表、运动鞋、蕾丝、高跟鞋、数码物件。不要从基线或背景复制人物脸，不冒充未经核验的原版游戏或电视剧演员复原。不要统一网红脸、动漫大眼、偶像磨皮、浓妆、丰唇滤镜、塑料皮肤、照片写真或三维渲染。不要时代族群混搭、汉式交领左衽、清代发服、明代网巾补子、日式服制和刀具、欧式奇幻甲胄。不要多人物、分格、多视图、脸部特写框、歪头、斜镜头、仰下巴或侧脸。不要多余或缺失肢体、多指、粘指、手物融合、错接手腕、无支撑器物、失重衣带、裁断头足或器物端点。不要裸露、透明衣料、色情化、血腥特写、伤残丑化或嘲弄表情；不要加无依据伤口或抹除已设定身体状态。不要人物碎墨、飞白缺块、裂衣碎布、密集噪点、纸纹透肤透衣。不要发光武器、法阵、能量光翼、粒子或强泛光；不要喧宾夺主的清晰建筑和繁密前景。 不要仰下巴或侧身、婴儿、成年张无忌、寿宴自尽伤口、归舟母亲造型、满身紫衣、宗教圣女冠、屠龙刀、巨型针、针雨或发光毒针。

FINAL CHECK: FRONT-FACING, head upright, eyes level, chin neutral; preserve the exact age, injury state, seated or standing support, and stage props specified above.
```

## 排除项

NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、签名、印章、logo或装饰水印；工具溯源和元数据保留。不要现代服饰、拉链、腕表、运动鞋、蕾丝、高跟鞋、数码物件。不要从基线或背景复制人物脸，不冒充未经核验的原版游戏或电视剧演员复原。不要统一网红脸、动漫大眼、偶像磨皮、浓妆、丰唇滤镜、塑料皮肤、照片写真或三维渲染。不要时代族群混搭、汉式交领左衽、清代发服、明代网巾补子、日式服制和刀具、欧式奇幻甲胄。不要多人物、分格、多视图、脸部特写框、歪头、斜镜头、仰下巴或侧脸。不要多余或缺失肢体、多指、粘指、手物融合、错接手腕、无支撑器物、失重衣带、裁断头足或器物端点。不要裸露、透明衣料、色情化、血腥特写、伤残丑化或嘲弄表情；不要加无依据伤口或抹除已设定身体状态。不要人物碎墨、飞白缺块、裂衣碎布、密集噪点、纸纹透肤透衣。不要发光武器、法阵、能量光翼、粒子或强泛光；不要喧宾夺主的清晰建筑和繁密前景。 不要仰下巴或侧身、婴儿、成年张无忌、寿宴自尽伤口、归舟母亲造型、满身紫衣、宗教圣女冠、屠龙刀、巨型针、针雨或发光毒针。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yinsusu__ch04_prime_ziwei_base.prepared.json`。
