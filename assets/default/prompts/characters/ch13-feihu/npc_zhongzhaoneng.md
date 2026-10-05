---
asset_id: por_npc_zhongzhaoneng__ch13_prime_base
subject_id: npc_zhongzhaoneng
name: 钟兆能
book: ch13_feihu
gender: male
age_variant: prime
tier: B
output: assets/default/character/male/ch13/por_npc_zhongzhaoneng__ch13_prime_base.png
manifest: assets/default/character/male/ch13/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 钟兆能 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhongzhaoneng
- book：ch13_feihu
- gender：male
- age_variant：prime

## 本轮人物写实规范

湘妃庙外阻止毒信、与胡斐误会未解阶段，三雄并非田归农追兵；青壮年龄未定。招魂幡为本阶段实体奇门兵器，没有招魂能力；幡面无字是资产美术适配，不宣称原著本来无字。杆材、窄幡尺寸配色和静持为主稿原创，保持本人精瘦棱脸，不与兄弟混器物。 正面端正、完整写实人物与极淡水墨背景，先1个原始PNG候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhongzhaoneng__ch13_prime_base/prompt-48af531177f607a9a188a8412e3cbb7d4831d2eccc58fe3899ff697dd161b893.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 钟兆能. THIS IS A TEXT-DEFINED ORIGINAL IDENTITY, not a verified actor or original-game face. NO identity photograph or prior own-character PNG is supplied. Image 1 ONLY provides the corresponding gender palette and soft light; image 2 ONLY provides the pale ink-wash background. Never borrow either reference face, body, age, hair, clothes or pose. Establish the independent written face below.

身份与阶段：钟兆能（npc_zhongzhaoneng），《飞狐外传》ch13_feihu。钟氏三雄之一，湘妃庙外阻信行动、与胡斐误会未解时。

年龄与体型：青壮成年男子，以更轻捷的体态区别兄弟；偏窄棱形脸、较高颧骨、眼尾稍长，稀短须，躯干精瘦而筋骨有力，目光警惕、唇部紧收，表情严肃但不恶相。年龄及身体状态优先于造型，不使用固定头身和占高强行拉伸。

本人面容辨识：独立原创青壮成年精瘦窄棱形脸：额部较窄、颧骨高且边缘清楚，两颊自然收束，眉形中等偏细而平展；眼裂较长、眼尾水平略延伸、正常眼距，正视警惕清醒。鼻梁较细长而端正、鼻头略尖收但仍圆钝、鼻翼窄；嘴形较小、薄唇紧收，窄下颌和钝角下巴真实有骨量，稀短须不遮五官。精瘦躯干筋骨有力，与兆文长方宽颧厚眉短须、兆英短方厚眉骨宽鼻翼分别不同，仅保留兄弟自然眉眼色呼应，不是三胞胎。

服制与发式：清代汉地江湖人，剃额留辫、辫尾束入领后；灰青短袍、墨色布腰带、护腕、深裤与布靴，肩部一条深灰窄搭布，不作道袍。衣料完整不透明、衣边整洁连续，少量宽缓受力褶，不添破洞和碎布；汉式交领穿着者左襟覆右襟，斜襟向穿着者右侧闭合，不水平镜像。

正面姿态与器物：全身正面，头颈竖直、双眼水平、下巴中性，双足略错但都落地，肩部自然同朝前。双手相隔清楚握同一杆招魂幡的中下段与下段，朴素直木杆稍斜置身体一侧留白，下端与顶端全入画、不穿身体；顶端系一幅窄灰白完整幡布，无文字无符号，短布尾随重力垂落，结点清楚，不遮脸。只有这一杆实体兵器，没有铁牌、哭丧棒、鬼魂、纸钱、祭坛或施法手势。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。默认一张独立候选经执行者实际自查；每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书清乾隆时代；前史回忆与开局、后期分开，当前图只取已注明阶段，不把全书所有年份混成同一年龄。身份阶段以本地role/catalog/story/chapter为依据，原著概括及具体发饰器型仍待指定版本核，不冒称新查原文。本次原创新脸的具体五官和静态手势为美术补足。湘妃庙外阻止毒信、与胡斐误会未解阶段，三雄并非田归农追兵；青壮年龄未定。招魂幡为本阶段实体奇门兵器，没有招魂能力；幡面无字是资产美术适配，不宣称原著本来无字。杆材、窄幡尺寸配色和静持为主稿原创，保持本人精瘦棱脸，不与兄弟混器物。

参考边界：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要铁牌、哭丧棒、符咒文字、纸钱、骷髅、亡灵、发光幡、道冠道袍、招魂阵、漂浮布条或超出画幅的长杆。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制或混合palette和背景图的人物脸、年龄、身体、发型、衣装、道具和姿势，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

FINAL POSE CHECK: FRONT-FACING full-body, head oriented UPRIGHT, forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Preserve this person’s own age, facial identity, existing physical condition and narrative stage.
```

## 排除项

不要铁牌、哭丧棒、符咒文字、纸钱、骷髅、亡灵、发光幡、道冠道袍、招魂阵、漂浮布条或超出画幅的长杆。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制或混合palette和背景图的人物脸、年龄、身体、发型、衣装、道具和姿势，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhongzhaoneng__ch13_prime_base.prepared.json`。
