---
asset_id: por_npc_fukangan__ch13_prime_base
subject_id: npc_fukangan
name: 福康安
book: ch13_feihu
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch13/por_npc_fukangan__ch13_prime_base.png
manifest: assets/default/character/male/ch13/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 福康安 · 人物写实修正

## 人物与阶段

- subject_id：npc_fukangan
- book：ch13_feihu
- gender：male
- age_variant：prime

## 本轮人物写实规范

小说掌门人大会组织者的成年权臣形态。catalog与chapter列史实约1754–1796并标地图年约15岁，同时明确小说时序优先；本图按主稿成年外观，不伪称史实年龄与小说一致。满族贵胄右开襟马蹄袖便服，不强制汉式交领或新增未核品级。 正面写实全身、头颈端正、完整衣料、背景淡墨；先1个原生PNG候选，微细瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_fukangan__ch13_prime_base/prompt-144c6f274ba9a6c98dce90bb1028de7ddc923748f2dc8cdde68f894b08043cc6.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body portrait for a Chinese wuxia game of 福康安. This supporting character has an ORIGINAL TEXT-DEFINED FACE. Neither input is an identity portrait: image 1 supplies palette/painting quality only and image 2 pale ink background only. Do not copy, average or borrow any reference face. Build the distinct facial anchors below; no claim of game, TV actor or historical likeness.

身份与阶段：福康安（npc_fukangan），《飞狐外传》 ch13_feihu。小说中的清廷权臣，京师筹办与主持掌门人大会的成年贵胄形态。

年龄与体型：依小说画成年青年至壮年的清廷贵胄，视觉成熟而不衰老。修长匀称、养尊处优但有正常体重与成年肩架；不能由史实1754生年强算为十二至十七岁儿童。

原创本人面容：原创端整的长圆脸，额头偏高但不方阔，颧颊平顺、利落而圆缓的下颌；细密长眉微弧、眉尾有势，自然窄长眼、正常眼距和较薄眼睑，鼻梁挺直细长、鼻尖小圆。上唇较薄、下唇适中，口角平稳，面颊无浓须，肤色细净自然但无磨皮。贵气由冷静审视和精致骨相表达，不复制历史画像、陈家洛或其他青年脸，不靠抬下巴。

服制与发式：清乾隆满族贵胄室内便服，剃额留辫、辫根清楚；深藏蓝右开襟长袍、收束马蹄袖、暗褐素马褂、黑靴，腰侧小玉佩，低调瓜皮帽，不画未核官阶补子。衣料完整不透明，衣缘缝线连续；只少量宽缓有重力的褶皱，不画裂纹、碎布和飞白。满族贵胄长袍保持本人的右开襟与收束马蹄袖，不强改汉式交领，不水平镜像。

正面姿态与器物：单人正面完整全身，头直眼水平，肩颈放松，下巴中性。左手轻托一只小型灰青玉龙杯，杯面仅克制浅浮雕、无可读文字，杯无发光或可见毒液；右手自然搭侧腰。没有武器、侍卫或会场布景，不把政治人物画成持剑战士。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新提速要求先1张候选，基本清晰、正面端正、身份可辨即可保存；仅严重身份/结构/不可读才补，不为细手指、微装备、微角重复。每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：项目约1766–1771，具体人物只用本稿阶段，不宣称原著明示公历。 身份、年龄、生命态、器物依最新本地角色/名录/剧情；原稿标记待考仍保留，未新浏览外网或声称指定版本终校。清代武人和满族贵胄依各自服制，不用通用禁辫子。具体衣色、器型细节、面部写实转译及静立姿态属于本次美术落实。小说掌门人大会组织者的成年权臣形态。catalog与chapter列史实约1754–1796并标地图年约15岁，同时明确小说时序优先；本图按主稿成年外观，不伪称史实年龄与小说一致。满族贵胄右开襟马蹄袖便服，不强制汉式交领或新增未核品级。

图像输入使用边界：第一输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。 第二输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。

完整排除项：不要文字、伪字、题款、签名、印章、logo、装饰水印、书页文字或旗面字样；不去除或伪造工具自带溯源标识。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、医疗塑料器具；不照搬剧照姿态与其他角色衣装；不用画师姓名作风格词，不复制具体画作。 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代族群混搭、错误衣襟、水平镜像、前结夸张宽腰带、悬空装备、失重衣料、大面积撕裂破衣；不要多人物、多视图、分格、额外肢体、多指、粘连手指、错接手腕、手物融合、弯折断裂兵刃或容不下刀剑的短鞘。 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉、仙法光翼、发光兵器、龙形能量、强烈泛光、强逆光、烟雾遮脸或具体剧情场景或清晰建筑；未成年人物不成人化，老弱伤残不磨平、不妖魔化。 不要十二至十七岁儿童外观、历史肖像复刻、皇帝龙袍、皇冠、无据的具体品级补子、整套朝服朝珠、晚清大拉翅、现代军服、佩剑战士体型、发光玉杯或侍卫同框。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

FINAL POSE CHECK: FRONT-FACING, head upright, eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt. Respect identity and age, intact skin and clothing, correct stage and props.
```

## 排除项

不要文字、伪字、题款、签名、印章、logo、装饰水印、书页文字或旗面字样；不去除或伪造工具自带溯源标识。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、医疗塑料器具；不照搬剧照姿态与其他角色衣装；不用画师姓名作风格词，不复制具体画作。 不要动漫大眼、统一偶像脸、网红锥子脸、丰唇滤镜、浓妆磨皮、塑料皮肤、摄影写真或三维模型渲染感；不要日式服制、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代族群混搭、错误衣襟、水平镜像、前结夸张宽腰带、悬空装备、失重衣料、大面积撕裂破衣；不要多人物、多视图、分格、额外肢体、多指、粘连手指、错接手腕、手物融合、弯折断裂兵刃或容不下刀剑的短鞘。 不要血腥特写、裸露、透明衣料、性感化、恶搞丑化、畸形健美肌肉、仙法光翼、发光兵器、龙形能量、强烈泛光、强逆光、烟雾遮脸或具体剧情场景或清晰建筑；未成年人物不成人化，老弱伤残不磨平、不妖魔化。 不要十二至十七岁儿童外观、历史肖像复刻、皇帝龙袍、皇冠、无据的具体品级补子、整套朝服朝珠、晚清大拉翅、现代军服、佩剑战士体型、发光玉杯或侍卫同框。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_fukangan__ch13_prime_base.prepared.json`。
