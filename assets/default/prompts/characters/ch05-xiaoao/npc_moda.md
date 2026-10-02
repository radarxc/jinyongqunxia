---
asset_id: por_npc_moda__ch05_elder_base
subject_id: npc_moda
name: 莫大先生
book: ch05_xiaoao
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch05/por_npc_moda__ch05_elder_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_21-1.png
  use: 第一图为经原版姓名对照表核验的莫大先生本人game原头像（raw 21），已实际view。只传递本人可见脸骨、眉眼鼻唇、须形与辨识关系；据本角色阶段转成完整写实人物。忽略像素画法、头像方向、头倾、表情夸张、衣服和帽饰；未见部位按文字补足。game可见面容为第一身份；草帽遮挡未见的额/发际明示为role美术补足。按role发巾而不继承草帽，保留年老轻微背弯但取消旧微侧/俯头上瞟与碎衣。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 莫大先生 · 人物写实修正

## 人物与阶段

- subject_id：npc_moda
- book：ch05_xiaoao
- gender：male
- age_variant：elder

## 本轮人物写实规范

南岳衡山掌门、衡阳金盆洗手前后暗助常态。胡琴是小型弓弦乐器，非曲洋横置七弦琴；少量露细刃和暗藏接口为主稿美术落实，不捏造内部尺寸。game草帽换为role低贴素巾；旧袖摆磨损改成完整洗旧织物，轻微老年背弯不要求头倾。 本人原game身份第1、男性palette第2、用户淡水墨背景第3；正面头直眼水平，一张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_moda__ch05_elder_base/prompt-e3f4534186fc7cc648d0cafa553e0b2de6c9435ccaa46915578df080dc4f3d55.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body Chinese wuxia portrait of 莫大先生. REFERENCE ORDER IS IMPORTANT: image 1 is the verified classic original-game portrait of THIS person, 莫大先生, and is the ONLY facial identity source. Preserve that person's visible face structure and distinctive eyebrow, eye, nose, mouth and facial-hair relationships while applying the correct age and stage below. Image 2 is ONLY the male project palette and soft light. Image 3 is ONLY the pale ink-wash background. Never blend or average these three faces. Do not copy pixel art, the game portrait angle, hairstyle/clothes that conflict with the role, or any reference head tilt; render a coherent upright realistic person.

身份与阶段：莫大先生（npc_moda），《笑傲江湖》ch05_xiaoao。南岳衡山掌门，衡阳金盆洗手前后暗中相助的常态。

年龄与体型：老年男子，瘦长体格、窄肩薄胸和长手指，身体保留轻微自然老年背弯但站立稳健、行动仍敏捷；头颈端正、双眼水平，真实老年纹理而非病危枯骨。 不以固定头身或画面占高数字拉伸人体。

本人面容辨识：第一图是莫大本人的可用身份头像：保留高颧、瘦颊与窄长下脸，长鼻梁带轻自然弧度、鼻尖圆钝略向下，窄而真实的眼裂与稍低眉眼关系，眼睑有年长厚薄起伏，目光忧郁沉静但正视清楚。嘴较窄、唇薄紧闭、颏部窄而有骨量；灰白短髭和尖束灰白颏须贴合真实生长关系，眼角颊口纹理是完整皮肤而非裂缝。额部与发际被game草帽遮挡，未见部分按本稿灰白简束头发和低贴素发巾合理补足，不以帽沿阴影代替眼睛；不是风清扬白长须仙人或令狐冲青年脸。

服制与发式：洗得发白的青布长衫，交领右衽，窄灰布带与旧布鞋，袖口和下摆完整，洗旧但无破损；灰白头发简束，朴素发巾低贴，无华丽掌门冠。衣料是完整不透明可穿织物，剪裁缝线清楚、少量自然受力褶皱，不添破损碎布。汉式交领严格为穿着者左襟压右襟的右衽，帽巾、衣袍和佩物按本张身份，不照搬game头像衣领。

正面姿态与器物：正面稳立，头颈自然竖直、下巴中性、双眼水平正视，镜头平视。窄肩和上背允许轻微老年自然弯曲，但不侧身、不俯头上瞟、不歪头；身体无重病下坠。本人左手在身体前外侧低持一把小型木质胡琴的琴杆，琴筒、琴杆和连续弦可辨；本人右手握住胡琴暗藏处的细剑柄，只轻抽露一小段极细窄直刃，其余剑身仍收于琴内。手—柄—短露刃—藏剑入口连续，琴弓固定琴侧，所有端点完整。展示静止器物，不同时拉琴挥剑，不剖开内部机构，不加另一把腰剑。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：按本地当前role、catalog、story和chapter区分年龄与阶段；本作明中叶约1523–1525是游戏定年的原创扩展，不冒称小说明示朝代。本人脸部识别来自已核名原game图；未见的发际、身形细部和主稿配色、器型、静立动作属于美术落实。原著概括保留指定版本待考，本次未新联网或读指定纸本、不编造引句页码。南岳衡山掌门、衡阳金盆洗手前后暗助常态。胡琴是小型弓弦乐器，非曲洋横置七弦琴；少量露细刃和暗藏接口为主稿美术落实，不捏造内部尺寸。game草帽换为role低贴素巾；旧袖摆磨损改成完整洗旧织物，轻微老年背弯不要求头倾。

参考边界：第1参考：第一图为经原版姓名对照表核验的莫大先生本人game原头像（raw 21），已实际view。只传递本人可见脸骨、眉眼鼻唇、须形与辨识关系；据本角色阶段转成完整写实人物。忽略像素画法、头像方向、头倾、表情夸张、衣服和帽饰；未见部位按文字补足。game可见面容为第一身份；草帽遮挡未见的额/发际明示为role美术补足。按role发巾而不继承草帽，保留年老轻微背弯但取消旧微侧/俯头上瞟与碎衣。 第2参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第3参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要七弦古琴、琵琶、西洋提琴、两把普通腰剑、巨宽剑刃、浮空剑、剖面机关图、同时演奏挥剑、华服冠冕、草帽遮眼、俯头上瞟、乞丐碎衣或喜剧枯骨脸。 不要 head tilt、Dutch angle、头歪向肩、眼线高低倾斜、抬下巴、仰头、低头藏眼、侧看、回眸或倾斜镜头。不要把本人game参考换成别人的脸；不要让第2或第3图改变脸型、眉眼鼻唇、年龄、体型、发际、须形、衣发、道具或姿势；不要三张脸平均混合，不把本人像素脸直接贴在写实身体上。不要像素块、锯齿、低清马赛克、动漫大眼、Q版、统一偶像脸、网红锥子脸、浓妆丰唇、摄影剧照、3D塑料或换头拼贴。不要把老者减龄、把矮小成年人画成儿童，不用畸形丑化代替角色辨识。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、污斑脸、裂皮、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额长辫、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、民国旗袍、中山装、官服补子或飞鱼服，不混朝代族群。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、面部特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 莫大先生 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Keep image 1 facial identity and the specified age, bodily condition, clothing and narrative stage; never inherit reference poses or the faces in images 2 and 3.
```

## 排除项

不要七弦古琴、琵琶、西洋提琴、两把普通腰剑、巨宽剑刃、浮空剑、剖面机关图、同时演奏挥剑、华服冠冕、草帽遮眼、俯头上瞟、乞丐碎衣或喜剧枯骨脸。 不要 head tilt、Dutch angle、头歪向肩、眼线高低倾斜、抬下巴、仰头、低头藏眼、侧看、回眸或倾斜镜头。不要把本人game参考换成别人的脸；不要让第2或第3图改变脸型、眉眼鼻唇、年龄、体型、发际、须形、衣发、道具或姿势；不要三张脸平均混合，不把本人像素脸直接贴在写实身体上。不要像素块、锯齿、低清马赛克、动漫大眼、Q版、统一偶像脸、网红锥子脸、浓妆丰唇、摄影剧照、3D塑料或换头拼贴。不要把老者减龄、把矮小成年人画成儿童，不用畸形丑化代替角色辨识。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、污斑脸、裂皮、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额长辫、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、民国旗袍、中山装、官服补子或飞鱼服，不混朝代族群。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、面部特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_moda__ch05_elder_base.prepared.json`。
