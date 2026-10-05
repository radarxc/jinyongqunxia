---
asset_id: por_npc_zhaobanshan__ch13_elder_base
subject_id: npc_zhaobanshan
name: 赵半山
book: ch13_feihu
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch13/por_npc_zhaobanshan__ch13_elder_base.png
manifest: assets/default/character/male/ch13/manifest.yaml
references:
- path: assets/default/character/male/ch12/por_npc_zhaobanshan__ch12_elder_base.png
  use: 第一图为已保存并实际view的赵半山ch12本人原创candidate，仅承接宽圆脸、丰厚颊颈、宽方圆下颌、平缓粗眉厚眼睑、圆厚鼻尖、嘴唇与短须根部关系和温厚神态。不是game或演员脸、不是approved。飞狐按现稿较书剑略添风霜，保持胖而结实；剃额单辫小布帽、暗蓝短褂、双手温和调停及一只闭口暗器囊依ch13。源图两袋露多细件、帽遮发式及较密衣纹不继承，不能把源图局限升级为事实。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二图是已实际view的root派生无人纯背景，只取暖浅灰纸底、极淡远山和留白，没有人物面孔或衣装器物可借；不是原用户图或approved，水墨不得侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 赵半山 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhaobanshan
- book：ch13_feihu
- gender：male
- age_variant：elder

## 本轮人物写实规范

书剑到飞狐同一红花会三当家/太极门武人，商家堡救援至京师重逢的中老年形态，五六十观感仍待考。现已实际读取ch12本人生产PNG并核manifest为candidate及原始SHA，按用户授权继承本人骨架；不是approved。项目1759离书剑至1766飞狐重逢为七年口径，本图依所选阶段略添风霜，不用游戏时间倒填原著确岁。暗器囊本界一只封闭且无露镖，不沿用源图两袋露多细件；太极门不等于武当道士，千手如来不等于多臂佛像。 正面头直、完整写实人物，纯BG第二，先1原始PNG candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhaobanshan__ch13_elder_base/prompt-22e7de35cabbe4f86a6298ba8bbbbe6c908532ab8a73a02afafdfc75ace71f3a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 赵半山. Image 1 is the already saved project candidate of THIS SAME CHARACTER in ch12: preserve his own recognizable face and broad body identity while applying the current ch13 age, clothes and props. It is an original project identity, not an actor or game face, and not approved. Image 2 supplies ONLY person-free pale ink-wash background. Do not copy source pose, two pouches, exposed metal details or unclear haircut; the present stage below takes precedence.

身份与阶段：赵半山（npc_zhaobanshan），《飞狐外传》ch13_feihu。红花会三当家、太极门武人，本书商家堡救援至京师重逢的中老年形态。

年龄与体型：中老年，五六十岁观感（待考），比书剑时期略添风霜；胖而结实、圆脸宽额、面颊饱满，眼角有笑纹与少量灰须，目光温厚而敏锐，肩背有支撑、双手灵活；肥胖不画成迟钝或滑稽。年龄及身体状态优先于造型，不使用固定头身和占高强行拉伸。

本人面容辨识：承接第一图已保存赵半山ch12本人可见的宽圆脸、宽额与丰厚面颊、方圆宽实下颌、浅弧粗眉、略厚上睑、宽正鼻梁与圆厚鼻尖、自然闭口唇形、圆下巴及短髭须根部关系，保持温厚而敏锐的水平目光、胖而有力的真实体态。本人图已实际查看，其身份源为项目原创candidate，不冒称演员或原版game。飞狐阶段在相同骨架与五官关系上略增眼角、口周和颈部风霜，灰须适量增加，不能换成长脸或白眉仙翁；不机械老化到衰弱失能。源帽下剃额和后辫不清不能据图补事实，按本书清代剃额单辫小布帽落实；两袋露出细件也不复制。

服制与发式：清乾隆汉地江湖长者，剃额留灰黑单辫、小布帽；灰褐宽松长袍、暗蓝短褂、普通窄布带与布鞋，布料按丰满身体自然受力，不用紧身铠甲。衣料完整不透明、衣边整洁连续，少量宽缓受力褶，不添破洞和碎布；汉式交领穿着者左襟覆右襟，斜襟向穿着者右侧闭合，不水平镜像。

正面姿态与器物：全身正面安稳站立，头颈自然竖直、双眼水平、下巴中性，双足稍宽支撑丰满身躯，肩颈放松。两只正常手略张、低于胸口似温和调停，手腕与指形清楚，不结法印也不多出手臂。腰侧只有一只闭口朴素暗器囊，袋口收合、短系带连接布腰带，不露任何具体暗器，不从ch12复制两囊或露镖配装。本界灰褐宽袍、暗蓝短褂、小布帽与灰黑后辫按丰满体态自然垂落，无道冠、袈裟、刀剑、佛光或太极法阵。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。默认一张独立候选经执行者实际自查；每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书清乾隆时代；前史回忆与开局、后期分开，当前图只取已注明阶段，不把全书所有年份混成同一年龄。身份阶段以本地role/catalog/story/chapter为依据，原著概括及具体发饰器型仍待指定版本核，不冒称新查原文。本次沿用已保存本人原创面容，阶段衰老、服饰和静态手势仍为美术补足。书剑到飞狐同一红花会三当家/太极门武人，商家堡救援至京师重逢的中老年形态，五六十观感仍待考。现已实际读取ch12本人生产PNG并核manifest为candidate及原始SHA，按用户授权继承本人骨架；不是approved。项目1759离书剑至1766飞狐重逢为七年口径，本图依所选阶段略添风霜，不用游戏时间倒填原著确岁。暗器囊本界一只封闭且无露镖，不沿用源图两袋露多细件；太极门不等于武当道士，千手如来不等于多臂佛像。

参考边界：第一图为已保存并实际view的赵半山ch12本人原创candidate，仅承接宽圆脸、丰厚颊颈、宽方圆下颌、平缓粗眉厚眼睑、圆厚鼻尖、嘴唇与短须根部关系和温厚神态。不是game或演员脸、不是approved。飞狐按现稿较书剑略添风霜，保持胖而结实；剃额单辫小布帽、暗蓝短褂、双手温和调停及一只闭口暗器囊依ch13。源图两袋露多细件、帽遮发式及较密衣纹不继承，不能把源图局限升级为事实。 第二图是已实际view的root派生无人纯背景，只取暖浅灰纸底、极淡远山和留白，没有人物面孔或衣装器物可借；不是原用户图或approved，水墨不得侵入人物。

完整排除项：不要清瘦尖脸、肌肉健美体、肥胖恶搞、佛像多臂、袈裟、武当道冠、太极法阵、清前顶髻、浮空暗器或年轻无纹面容。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。只继承第一图赵半山本人可见五官结构，不复制其年龄阶段、帽下不清发式、两袋露多细件、衣装或手势；第二图只背景。不要混合其他人物脸，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

FINAL POSE CHECK: FRONT-FACING full-body, head oriented UPRIGHT, forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Preserve this person’s own age, facial identity, existing physical condition and narrative stage.
```

## 排除项

不要清瘦尖脸、肌肉健美体、肥胖恶搞、佛像多臂、袈裟、武当道冠、太极法阵、清前顶髻、浮空暗器或年轻无纹面容。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。只继承第一图赵半山本人可见五官结构，不复制其年龄阶段、帽下不清发式、两袋露多细件、衣装或手势；第二图只背景。不要混合其他人物脸，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhaobanshan__ch13_elder_base.prepared.json`。
