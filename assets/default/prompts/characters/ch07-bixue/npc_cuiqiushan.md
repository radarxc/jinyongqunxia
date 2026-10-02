---
asset_id: por_npc_cuiqiushan__ch07_prime_opening_base
subject_id: npc_cuiqiushan
name: 崔秋山
book: ch07_bixue
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch07/por_npc_cuiqiushan__ch07_prime_opening_base.png
manifest: assets/default/character/male/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 崔秋山 · 人物写实修正

## 人物与阶段

- subject_id：npc_cuiqiushan
- book：ch07_bixue
- gender：male
- age_variant：prime

## 本轮人物写实规范

本图锁定1633护幼与伏虎掌传承开篇，伤势已经处置且可站立；不宣称从未受伤，也不臆造伤处、侧别或永久残疾。伏虎掌名与归属沿项目图鉴待考，不能把名称画成实体猛虎。 原创本人面孔、正面头直眼水平、完整精细写实人物与淡水墨背景；先1张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_cuiqiushan__ch07_prime_opening_base/prompt-1958f11ccd48bea61124dda538565e7307fad0cfe629a1af8c0b702550fc7577.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 崔秋山. THIS IS AN ORIGINAL WRITTEN FACE DESIGN: no verified picture of this person is supplied, and no existing own cross-book identity image was found in the checked project asset/identity locations. Image 1 supplies ONLY the male project palette and soft light; image 2 supplies ONLY the pale ink-wash background. Neither reference supplies the target face, age, body, hair, clothing, props or pose. Never copy or average these reference faces or use a different game/TV character. Create the distinct written identity below.

身份与阶段：崔秋山（npc_cuiqiushan），《碧血剑》ch07_bixue。1633年袁党护幼阶段的江湖友人，伤势处置后可站立授掌的时点。

年龄与体型：四十岁上下中年视觉默认，确龄待考；宽额方颊、粗眉大眼，身材高壮、前臂粗实、日晒肤色和修短须。1633年开篇袁党护幼的伤势处置后能站立授掌阶段，不能自动挪到十年后的成年主线。 不以固定头身或画面占高数字强行拉伸人体。

本人面容辨识：独立原创中年宽额方脸：眉弓厚实而不夸张、浓平眉、眼裂宽些但符合真人尺度，正视警觉可靠。鼻梁中等偏宽，鼻头厚实圆钝、鼻翼有分量，嘴形宽、上下唇自然略厚，闭口沉着；颧颊宽厚、下颌方、下巴宽短。黑色短须修整覆盖上唇和颏缘，眼角少量浅纹和日晒肤色保留成熟感。与崔希敏二十多岁的短方脸、无须青年肤质不同；与归辛树五十上下灰黑须及低宽鼻厚颊不同。

服制与发式：明末山路行旅布衣，土黄褐右衽短衫、灰褐布裤、窄腰带、绑腿与耐磨布靴；黑发束髻用深布巾紧收，衣袖收口利落。布料完整不透明、剪裁缝线清楚，旧衣只保留柔和材质而不主动添破洞补丁；身体与衣料体积连续，汉式交领为穿着者左襟覆右襟的右衽，不水平镜像。

正面姿态与器物：正面双足平稳分开，头颈直立、目光朝前、眼线水平，肩背宽实而不前冲。双手空着：右掌在腹胸之间身体外侧自然前伸少许，左手低置另一侧，示范基础掌势但不挥拳攻击；腕、掌与袖口连续可辨。只画一位能够独立站立授掌的中年人，不画幼童、追兵、虎、武器、铁手套、虚光、伤口或凭空添加的绷带。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书项目时间窗1630–1645、主体1640–1645、成年江湖段约1643年起，各图时点以具体阶段为准；不把整个时间窗当人物确岁。当前本地role/catalog/story/chapter支持身份与阶段，原著概括保留指定三联/广州修订版待考，本次未新增联网考据或编造引句页码。具体五官、衣饰选款、器型与静态持法为美术补足。本图锁定1633护幼与伏虎掌传承开篇，伤势已经处置且可站立；不宣称从未受伤，也不臆造伤处、侧别或永久残疾。伏虎掌名与归属沿项目图鉴待考，不能把名称画成实体猛虎。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要老虎、虎纹能量、金属拳套、幼童第二人物、凭空断肢绷带、清式辫发、将军官甲或巨人肌肉。 不要 head tilt、Dutch angle、歪头、额鼻颏中线倾斜、双眼高低倾斜、低头藏眼、侧向目光、侧脸、回眸、抬下巴或倾斜镜头。不要复制或混合两张参考人物的脸、年龄、体型、性别、发式、衣服、道具与姿势，不借其他人物game/TV脸冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、Q版、浓妆丰唇、照片剧照、3D塑料或换头拼贴。不要把中年老年减龄、把矮成年人画成儿童，不以身体羞辱和丑化表现责任或年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用浓雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或无身份官服补子；明末汉地发式服制按各自角色，不混后世清宫衣装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚缺指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 崔秋山 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Keep the unique written face, correct age, body and stage; never inherit reference faces or poses.
```

## 排除项

不要老虎、虎纹能量、金属拳套、幼童第二人物、凭空断肢绷带、清式辫发、将军官甲或巨人肌肉。 不要 head tilt、Dutch angle、歪头、额鼻颏中线倾斜、双眼高低倾斜、低头藏眼、侧向目光、侧脸、回眸、抬下巴或倾斜镜头。不要复制或混合两张参考人物的脸、年龄、体型、性别、发式、衣服、道具与姿势，不借其他人物game/TV脸冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、Q版、浓妆丰唇、照片剧照、3D塑料或换头拼贴。不要把中年老年减龄、把矮成年人画成儿童，不以身体羞辱和丑化表现责任或年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用浓雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或无身份官服补子；明末汉地发式服制按各自角色，不混后世清宫衣装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚缺指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_cuiqiushan__ch07_prime_opening_base.prepared.json`。
