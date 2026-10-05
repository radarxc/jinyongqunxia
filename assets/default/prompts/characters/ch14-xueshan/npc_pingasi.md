---
asset_id: por_npc_pingasi__ch14_elder_onearm_base
subject_id: npc_pingasi
name: 平阿四
book: ch14_xueshan
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch14/por_npc_pingasi__ch14_elder_onearm_base.png
manifest: assets/default/character/male/ch14/manifest.yaml
references:
- path: assets/default/character/male/ch13/por_npc_pingasi__ch13_prime_onearm_base.png
  use: 第一输入是本次实际查看且已保存的ch13平阿四本人candidate图；保留同一面部骨架、眉眼鼻唇关系及本人右眉斜经鼻梁至左嘴角的愈合旧疤。它是项目生成的本人身份图，不是原版game或TV演员图，candidate不等于approved。目标按ch14自然加龄为灰白稀发中老年；保留本人右臂缺失和完整左手，改持空木茶盘，不照搬ch13布帽、较年轻黑发、布包、衣料细碎磨损或年轻阶段服装。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二输入仅为由原用户水墨图经内置image_gen派生的无人物辅助背景：暖浅灰不透明纸底、极浅低对比远山薄雾、充分留白。已实际view，无人物、脸、服装或器物；只取背景，人物骨相、年龄、衣装与光线均按第一本人图和本稿文字。不把它称作原用户图片或approved；墨迹纸纹止于人物轮廓外。
status: ready
realism_revision: user_identity_pose_20261001
---

# 平阿四 · 人物写实修正

## 人物与阶段

- subject_id：npc_pingasi
- book：ch14_xueshan
- gender：male
- age_variant：elder

## 本轮人物写实规范

已保存同一平阿四本人图第1、无人物派生背景第2；保留脸骨架与旧疤并按ch14加龄，右臂缺失、左手托空木茶盘、无布帽布包。先1候选，原始native2:3 PNG，全部candidate待审。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_pingasi__ch14_elder_onearm_base/prompt-c61c029365dafd9e5a7949e02e01e37ad22b899250e7af31874f4e117ab35113.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head held naturally upright above the slightly bent torso; preserve the missing RIGHT arm and intact LEFT arm and hand, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 平阿四. Image 1 is the ACTUAL SAVED SAME-CHARACTER ch13 Ping A Si identity reference, currently candidate, from this project. Preserve his facial bone structure, principal facial relationships and the healed scar from his OWN RIGHT eyebrow across the nose to his LEFT mouth corner. Age this same man naturally for ch14. Image 2 supplies ONLY pale ink-wash background. Do not transfer ch13 age, cloth hat, bag, worn clothing details or pose, image 2 contains no human figure or face. Neither source status nor prior self-check grants approval to the new candidate.

身份与阶段：平阿四（npc_pingasi），《雪山飞狐》ch14_xueshan。1780 年玉笔山庄揭露阎基身份前后的胡家旧仆与养育者，取受重伤前的基础站立形象

年龄与体型：1780玉笔山庄的胡家旧仆与胡斐养育者，中老年、劳苦显老，瘦削而有正常成人骨架，肩背微弯但不卑躬。比ch13中年阶段自然加龄：稀疏灰白发、额眼颊口细纹增加，皮肤和旧疤仍完整愈合；不编生年，不描绘宝树再伤左臂之后的状态。

本人面容与跨书连续：以第一输入中已经形成的同一平阿四本人脸为身份锚：保留清瘦偏长脸、较开阔的额头、清楚眉骨、自然眉眼间距、眼窝与眼裂走向、细直鼻梁和圆钝鼻尖、口唇宽窄及偏长收束而圆钝的下颌关系，保留稀短口颏须。保持同一道完全愈合旧疤，从本人右眉斜经鼻梁至左嘴角，按本人方向判断而非镜像。仅按1780中老年自然增加额眼颊口细纹、稀疏灰白发和灰白须，不能用皱纹重新造一张脸；保留源图朴实坚忍的辨识，面部与旧疤都是完整连续的皮肤，不血腥。

服制与发式：清乾隆灰褐粗布右衽夹袄、深灰长裤和厚布鞋，衣边少量整齐补缀但完整。前额剃净、稀灰白后发收成细辫，当前ch14不戴ch13的布帽。本人右侧空袖完全扁平，平顺折起固定于腰侧，无臂形鼓起、假手或义肢，不露创面；左袖有完整左臂和左手。

正面姿态与器物：正面完整全身，头颈自然竖直、双眼水平，保留微弯肩背和向本人左侧健侧的轻微平衡，不能强制左右肩负重对称。本人RIGHT右臂缺失，对应正面观者左边；本人LEFT左臂与唯一完整左手在正面观者右边。右空袖折好固定；仅左手从下方轻托一只小木茶盘，盘内完全空着，不放杯壶，手指与盘受力点清楚。1780受重伤前活体，左臂尚未再伤；不加第二只手、不双手捧盘、不延用ch13布包，不武装枪刀、不画独眼眼罩。

人物画法：美观、精细而可信的写实国风人物插画。面部、现存左手与右空袖、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、现存左手与右空袖、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：平阿四是1780指定阶段的活体，取宝树再次伤及左臂之前；既有右臂缺失不补全。当前ch13本人PNG已实际保存、查看并核验与原生成PNG字节一致，可作为第一身份输入；原始game语料缺本人配对的历史记录仍属原版来源范围，不能据此否认现有项目本人图。第二输入仅为水墨背景，已移除其他男性色卡输入。原稿待考仍留，器形服色和具体面容为项目美术落实，不冒称指定修订版逐字终校。ch13本人图仍candidate，不能把来源自查当作approved或本ch14生成完成。缺本人右臂、完整左手、旧疤右眉经鼻到左嘴角两书要求一致；本图灰白稀发、无布帽、左手托空木茶盘，不沿用ch13布包及较年轻服装状态。

参考边界：第一输入是本次实际查看且已保存的ch13平阿四本人candidate图；保留同一面部骨架、眉眼鼻唇关系及本人右眉斜经鼻梁至左嘴角的愈合旧疤。它是项目生成的本人身份图，不是原版game或TV演员图，candidate不等于approved。目标按ch14自然加龄为灰白稀发中老年；保留本人右臂缺失和完整左手，改持空木茶盘，不照搬ch13布帽、较年轻黑发、布包、衣料细碎磨损或年轻阶段服装。 第二输入仅为由原用户水墨图经内置image_gen派生的无人物辅助背景：暖浅灰不透明纸底、极浅低对比远山薄雾、充分留白。已实际view，无人物、脸、服装或器物；只取背景，人物骨相、年龄、衣装与光线均按第一本人图和本稿文字。不把它称作原用户图片或approved；墨迹纸纹止于人物轮廓外。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；已有同一平阿四的项目生成本人PNG作为身份输入；不要冒充原版游戏脸或TV演员本人，不借其他角色、演员或色卡基线脸，不抹除本人旧疤或更换本人五官骨架；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要画成缺左臂、两只手、假肢、双手捧盘、独眼或眼罩；不要抹去旧疤，也不要血污创口、恐怖化毁容或卑躬丑角姿势；不要枪刀武装。 不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物现存皮肤、衣料、毛发和器物完整连续，保留明确伤残。保留工具原有溯源信息，不去除或伪造。

FINAL POSE CHECK: FRONT-FACING, head naturally upright, eyes HORIZONTALLY LEVEL, camera level. NO head tilt. Preserve age, existing impairment and narrative stage; do not straighten a described bent back or add a missing arm.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；已有同一平阿四的项目生成本人PNG作为身份输入；不要冒充原版游戏脸或TV演员本人，不借其他角色、演员或色卡基线脸，不抹除本人旧疤或更换本人五官骨架；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代和族群混搭、错误衣襟、水平镜像、额外人物、分格、多视图、裁断头足或兵器端点、多肢多指、手物融合、悬空装备、弯折断裂兵器、容不下刀剑的短鞘；不要无依据的伤残、夸张肌肉、大面积撕裂破衣、血腥特写、裸露、透视衣料、色情化、恶搞丑化、仙法光翼、法阵、发光兵器、龙形能量、强烈泛光或具体剧情场景、清晰建筑；不要晚清大拉翅、民国旗袍、中山装、明代网巾或宋式官帽。不要画成缺左臂、两只手、假肢、双手捧盘、独眼或眼罩；不要抹去旧疤，也不要血污创口、恐怖化毁容或卑躬丑角姿势；不要枪刀武装。 不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物现存皮肤、衣料、毛发和器物完整连续，保留明确伤残。保留工具原有溯源信息，不去除或伪造。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_pingasi__ch14_elder_onearm_base.prepared.json`。
