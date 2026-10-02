---
asset_id: por_npc_zhongzhaowen__ch13_prime_base
subject_id: npc_zhongzhaowen
name: 钟兆文
book: ch13_feihu
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch13/por_npc_zhongzhaowen__ch13_prime_base.png
manifest: assets/default/character/male/ch13/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 钟兆文 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhongzhaowen
- book：ch13_feihu
- gender：male
- age_variant：prime

## 本轮人物写实规范

只取湘妃庙外阻信、与胡斐误会交手之前的行路阶段，三雄是在阻止毒信，不是送信或追杀一方。此时武器铁牌与求医时另用判官笔必须分开；通行拳脚配置不替代本稿外观锚。原牌面字以无字要求省去是美术适配，不伪称原著无字；持牌左右手和具体握部为原创，不虚构官府身份。 正面端正、完整写实人物与极淡水墨背景，先1个原始PNG候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhongzhaowen__ch13_prime_base/prompt-1c4bc9abca66a314373ce0ec82dd0be486fb4c831e5a7cab6a6c9aa61312e783.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 钟兆文. THIS IS A TEXT-DEFINED ORIGINAL IDENTITY, not a verified actor or original-game face. NO identity photograph or prior own-character PNG is supplied. Image 1 ONLY provides the corresponding gender palette and soft light; image 2 ONLY provides the pale ink-wash background. Never borrow either reference face, body, age, hair, clothes or pose. Establish the independent written face below.

身份与阶段：钟兆文（npc_zhongzhaowen），《飞狐外传》ch13_feihu。钟氏三雄之一，湘妃庙外阻止毒信、与胡斐误会交手之前的行路形态。

年龄与体型：青壮男子，偏成熟的青壮外观，不硬定岁数；长方脸、较宽颧部与厚眉，粗粝肤质、短须，身材中等偏壮，额上有思索纹，目光郑重克制；三兄弟中以沉稳指挥者识别，不丑化相貌。年龄及身体状态优先于造型，不使用固定头身和占高强行拉伸。

本人面容辨识：独立原创偏成熟青壮男子长方脸：额部较宽、额上适度思索纹，宽颧而颊面紧实，厚平眉、自然偏长眼裂及适中眼距，正视郑重克制。鼻梁中宽较长、圆实鼻头、鼻翼自然有力；嘴形较宽、上唇略薄下唇厚度适中，平稳唇角不讥笑。较长方颌与宽钝下巴、修短而清晰的胡须，皮肤有适度风霜不深老化；身材中等偏壮。相比兆英脸更长、眉骨不那么厚、鼻翼较收，相比兆能颧部更宽、下颌更方和体格更厚，不能换衣复用同脸。

服制与发式：清代汉地江湖武人，剃额单辫、深色布帽；灰黑短袍、暗青腰带、护腕、长裤布靴，领边一条窄灰白滚边，与兄弟共享朴素冷灰色系。衣料完整不透明、衣边整洁连续，少量宽缓受力褶，不添破洞和碎布；汉式交领穿着者左襟覆右襟，斜襟向穿着者右侧闭合，不水平镜像。

正面姿态与器物：完整全身正面稳立，头颈竖直、双眼水平、下巴中性，双足落地、两肩自然展开。本人右手在身外侧握一面小型狭长铁牌下端的实际握持处，暗铁牌有可信厚度、边缘完整，牌面完全无字无纹章，尺寸为手持奇门兵器而非盾牌；左手在腰前低位平抬略示止步，五指可辨。仅这一面铁牌，不拿判官笔、哭丧棒或幡，不遮脸，不画毒信或兄弟同框。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。默认一张独立候选经执行者实际自查；每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书清乾隆时代；前史回忆与开局、后期分开，当前图只取已注明阶段，不把全书所有年份混成同一年龄。身份阶段以本地role/catalog/story/chapter为依据，原著概括及具体发饰器型仍待指定版本核，不冒称新查原文。本次原创新脸的具体五官和静态手势为美术补足。只取湘妃庙外阻信、与胡斐误会交手之前的行路阶段，三雄是在阻止毒信，不是送信或追杀一方。此时武器铁牌与求医时另用判官笔必须分开；通行拳脚配置不替代本稿外观锚。原牌面字以无字要求省去是美术适配，不伪称原著无字；持牌左右手和具体握部为原创，不虚构官府身份。

参考边界：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要判官笔、兄弟的哭丧棒或招魂幡、官府腰牌字样、大盾牌、法符、亡灵特效、邪恶鬼面、士兵制服、明式网巾或与兄弟同框。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制或混合palette和背景图的人物脸、年龄、身体、发型、衣装、道具和姿势，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

FINAL POSE CHECK: FRONT-FACING full-body, head oriented UPRIGHT, forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Preserve this person’s own age, facial identity, existing physical condition and narrative stage.
```

## 排除项

不要判官笔、兄弟的哭丧棒或招魂幡、官府腰牌字样、大盾牌、法符、亡灵特效、邪恶鬼面、士兵制服、明式网巾或与兄弟同框。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制或混合palette和背景图的人物脸、年龄、身体、发型、衣装、道具和姿势，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhongzhaowen__ch13_prime_base.prepared.json`。
