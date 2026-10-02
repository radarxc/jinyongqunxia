---
asset_id: por_npc_songyuanqiao__ch04_prime_shouyan_base
subject_id: npc_songyuanqiao
name: 宋远桥
book: ch04_yitian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch04/por_npc_songyuanqiao__ch04_prime_shouyan_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 第一输入仅作低饱和配色色卡；不是本人，不参考脸、身体、年龄、发式、衣装款式、兵器、姿势、头部角度或破损布边。人物写实结构按文字独立建立；基线审批状态不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入只供背景水墨：暖浅灰留白、浅墨远山、疏林与薄雾；不继承女性人物、面容、性别、体型、衣裙、发饰、半透明布料、姿态或倾头，墨迹止于人物轮廓之外。
status: ready
realism_revision: user_identity_pose_20261001
---

# 宋远桥 · 人物写实修正

## 人物与阶段

- subject_id：npc_songyuanqiao
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

ROOT新授权本批普通/前史准备；原创独立文字面容，正面头直中性下巴，完整写实人物、不透明衣料、水墨背景。仅单候选设计，未生成未注册，等待其他agent独立审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_songyuanqiao__ch04_prime_shouyan_base/prompt-de4f0d8be20872ef7512bd0dbd7f28d501ca96b624fb42364d07e4f3a2d2b999.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT, forehead–nose–chin centreline vertical, both eyes HORIZONTALLY LEVEL, gaze forward, chin neutral, camera level. Preserve natural facial asymmetry without tilting the head. No head tilt, side view, raised chin or Dutch angle. These pose requirements override the reference poses and the old role draft.

Create one realistic full-body portrait of 宋远桥 for a Chinese wuxia game. This is an ORIGINAL TEXT-DEFINED FACE. Image 1 is palette only and image 2 is ink-background only. Neither is an identity portrait; do not copy or average their faces. No claim of a game portrait, TV actor reconstruction or historical likeness.

身份与阶段：宋远桥（npc_songyuanqiao），《倚天屠龙记》ch04_yitian。中年武当大弟子，百岁寿宴守山与接待宾客阶段。元末书界，前史按本稿阶段独立处理，精确纪年待考。

年龄与体型：中年成年男子，中等偏厚实体态，肩背平直、四肢健全；prime 是资产检索档，不据 INDEX 的壮年标签把角色表中年幼化或硬定岁数。

原创本人面容：原创宽而平和的中年方圆脸，额面宽舒、脸颊有适度饱满体积，下颌宽而圆转、下巴短宽。眉毛浓度中等、走向舒缓，双眼自然睁开、眼尾平和，目光温厚有主事者分寸。鼻梁宽直、鼻头圆实，嘴较宽、唇线平稳；上唇与下巴留整齐短须，黑须夹极少灰色，轮廓仍清楚。眼角与鼻唇沟有克制中年纹，不画苍老垂败。区别俞莲舟的高颧瘦长脸、俞岱岩的偏长窄脸和较多灰须；不沿用萧峰方阔豪侠五官。

服制与发式：元末武当灰褐右衽长道袍、米白内领、藏青窄布绦、白袜黑布鞋，黑发夹少量灰发束成端正道髻，素道冠固定。交领右衽，穿着者左襟压右襟，不水平翻转；衣装完整不透明，少量宽缓受力褶皱。具体配色、冠发和裁制均为原创美术补足，不称原著固定制服。

正面姿态与器物：正面稳立，头颈自然直立、双眼水平直视，下巴中性，两肩自然平衡。两手在腹前作克制礼敬收势，一手轻覆另一手外侧，手掌和手指轮廓可辨；不俯头欠身、不把手藏在袖筒。本人左腰（观者右侧）佩一柄普通完整入鞘中国直剑，暗木色长鞘、朴素窄格，柄格鞘同轴，挂带与腰带有受力连接，鞘底入画。不持礼仪笏板。具体佩挂侧与礼敬持法属原创落实。

人物画法：美观精细的写实国风人物插画，真实骨相、自然眼睛大小与适龄皮肤，脸、手、四肢、衣料和器物具有完整坚实连续体积。细腻手绘笔触、柔和左上漫射光、连贯明暗和清楚轮廓；保留适龄自然细纹，不画塑料磨皮。衣料完整不透明、可穿且缝线明确，只留少量宽缓受力褶皱；旧衣也不主动加裂口、碎布或飞白。水墨与纸纹只在背景，不穿透皮肤衣料，不切碎人物。

构图与背景：单人单视图、水平平视、原生竖幅2:3，完整头顶发饰、双手、双足、衣摆和全部器物端点入画，四周自然留净空，不用固定占高或头身数强行拉长。暖浅灰不透明纸底，低对比水墨远山、疏林、薄雾与留白可以自然展开，脚下有轻微接触阴影，背景不抢夺人物。目标2048×3072不透明PNG；若工具原生尺寸不同则如实登记，保存原始PNG字节和元数据，不裁切、旋转、放大或重编码。先1张真实候选；候选待审核，不自动approved，细微手指/佩挂/角度问题如实登记，仅严重身份、结构或不可读问题才另行补图。

事实边界：百岁寿宴的精确岁数、须发颜色、道装具体款式及主持事务原文尚待三联/广州修订版核对；宽方圆脸、短须和灰褐配色属于美术补足。 项目身份与器物依据本地角色、名录和正文；本轮未新联网考据，不伪造指定版本的引文或页码。

图像输入边界：第一输入仅作低饱和配色色卡；不是本人，不参考脸、身体、年龄、发式、衣装款式、兵器、姿势、头部角度或破损布边。人物写实结构按文字独立建立；基线审批状态不传递给新图。 第二输入只供背景水墨：暖浅灰留白、浅墨远山、疏林与薄雾；不继承女性人物、面容、性别、体型、衣裙、发饰、半透明布料、姿态或倾头，墨迹止于人物轮廓之外。

完整排除项：NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、标签、签名、印章、logo或装饰水印；保留工具本身溯源信息。不要现代衣物与数码物件、动漫大眼、统一网红脸、塑料皮肤、照片截图感或三维模型感；不要把配色基线或背景人物的面孔、身体、衣装和姿势搬来。不要明清官服补子、清式剃发长辫、马蹄袖、帝王冠、日本刀或欧式奇幻甲；汉式交领右衽，不水平镜像。不要歪头、倾斜镜头、侧脸、抬下巴或低头藏眼；不要多人物、多视图、多肢、手物融合、失去挂点的装备、裁断头足或器物。不要透明衣料、裸露、色情化、血腥、碎墨人物、纸纹透肤透衣、裂衣碎布或密集噪点；不要发光兵器、仙法光翼或法阵。 专项排除：宋青书的青年脸、张三丰的长白须、掌门皇冠、朝廷官服、丧服、末段家事后的极度悲恸、礼仪笏板。

FINAL CHECK: front-facing, head upright, eyes level, chin neutral; one distinct identity, correct age/stage and props, intact opaque clothing, ink background outside the figure.
```

## 排除项

NO head tilt, NO Dutch angle. 不要画面文字、伪字、题款、标签、签名、印章、logo或装饰水印；保留工具本身溯源信息。不要现代衣物与数码物件、动漫大眼、统一网红脸、塑料皮肤、照片截图感或三维模型感；不要把配色基线或背景人物的面孔、身体、衣装和姿势搬来。不要明清官服补子、清式剃发长辫、马蹄袖、帝王冠、日本刀或欧式奇幻甲；汉式交领右衽，不水平镜像。不要歪头、倾斜镜头、侧脸、抬下巴或低头藏眼；不要多人物、多视图、多肢、手物融合、失去挂点的装备、裁断头足或器物。不要透明衣料、裸露、色情化、血腥、碎墨人物、纸纹透肤透衣、裂衣碎布或密集噪点；不要发光兵器、仙法光翼或法阵。 专项排除：宋青书的青年脸、张三丰的长白须、掌门皇冠、朝廷官服、丧服、末段家事后的极度悲恸、礼仪笏板。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_songyuanqiao__ch04_prime_shouyan_base.prepared.json`。
