---
asset_id: por_npc_zuolengchan__ch05_prime_sighted_base
subject_id: npc_zuolengchan
name: 左冷禅
book: ch05_xiaoao
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch05/por_npc_zuolengchan__ch05_prime_sighted_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_23-1.png
  use: 第一图为经原版姓名对照表核验的左冷禅本人game原头像（raw 23），已实际view。只传递本人可见脸骨、眉眼鼻唇、须形与辨识关系；据本角色阶段转成完整写实人物。忽略像素画法、头像方向、头倾、表情夸张、衣服和帽饰；未见部位按文字补足。game近正面五官与role宽额方长脸一致；保留短黑髭、小尖颏须及正常视力，body/方巾/入鞘普通剑与阶段照主稿。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 左冷禅 · 人物写实修正

## 人物与阶段

- subject_id：npc_zuolengchan
- book：ch05_xiaoao
- gender：male
- age_variant：prime

## 本轮人物写实规范

少林三战至并派夺帅前，sighted仅为视力完好美术状态；夺帅后失明与华山后洞另做，不能把后期眼伤带进来。寒冰真气是武学，不推出冰蓝皮肤、发光眼或冰兵器；宽肩不等于畸形健美。 本人原game身份第1、男性palette第2、用户淡水墨背景第3；正面头直眼水平，一张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zuolengchan__ch05_prime_sighted_base/prompt-71bbf17ad883d8c697a4fd5ae59590c1b805a86fb2856bca4cc6eaec295f7a9f.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body Chinese wuxia portrait of 左冷禅. REFERENCE ORDER IS IMPORTANT: image 1 is the verified classic original-game portrait of THIS person, 左冷禅, and is the ONLY facial identity source. Preserve that person's visible face structure and distinctive eyebrow, eye, nose, mouth and facial-hair relationships while applying the correct age and stage below. Image 2 is ONLY the male project palette and soft light. Image 3 is ONLY the pale ink-wash background. Never blend or average these three faces. Do not copy pixel art, the game portrait angle, hairstyle/clothes that conflict with the role, or any reference head tilt; render a coherent upright realistic person.

身份与阶段：左冷禅（npc_zuolengchan），《笑傲江湖》ch05_xiaoao。嵩山掌门、五岳盟主，少林三战至并派夺帅前，尚未失明。

年龄与体型：成熟强壮的中年男子，宽厚肩背与坚实颈项，宽额方长脸，肤色温暖略黄而自然；双眼正常视物、四肢完整，无眼伤，冷峻克制，不增龄成灰白须老者。 不以固定头身或画面占高数字拉伸人体。

本人面容辨识：第一图左冷禅本人身份优先：较宽方长面、宽平额头与明显眉骨，颊面饱满结实、下颌宽而有直角转折，下巴宽中带短尖轮廓。粗直黑眉、自然窄长双眼、正常眼距，上睑略厚，双眼正常有瞳孔并正视有压迫感。鼻梁中宽笔直、鼻头厚而圆方、鼻翼有分量；嘴形中等宽、薄唇紧闭，修整短黑髭横在上唇，颏下小尖黑须与须根清楚。发际较宽、黑发整齐向后收并按role束髻低方巾，保持成熟脸纹和game面骨，不把岳不群的长垂髭文雅瘦脸搬来，也不借任我行的灰须苍白脸。

服制与发式：明代土黄偏赭长袍、深棕窄边与黑布带，束髻覆低矮方巾，深色布靴，衣料厚实而非甲胄；无官服纹章。衣料是完整不透明可穿织物，剪裁缝线清楚、少量自然受力褶皱，不添破损碎布。汉式交领严格为穿着者左襟压右襟的右衽，帽巾、衣袍和佩物按本张身份，不照搬game头像衣领。

正面姿态与器物：正面稳立，头颈竖直、双眼水平、下巴中性，双脚自然分开、胸肩打开但不耸肩。本人右掌在腰前自然半收，手指清楚而不发功；左手垂在身侧。本人左腰佩一柄普通中式直身双刃长剑，完全收入深色足长鞘，常规较宽横格、剑柄和鞘口连续，短挂带承重接黑布腰带，整剑鞘端点入画。没有五岳令旗、冰块、冰甲或额外兵器。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：按本地当前role、catalog、story和chapter区分年龄与阶段；本作明中叶约1523–1525是游戏定年的原创扩展，不冒称小说明示朝代。本人脸部识别来自已核名原game图；未见的发际、身形细部和主稿配色、器型、静立动作属于美术落实。原著概括保留指定版本待考，本次未新联网或读指定纸本、不编造引句页码。少林三战至并派夺帅前，sighted仅为视力完好美术状态；夺帅后失明与华山后洞另做，不能把后期眼伤带进来。寒冰真气是武学，不推出冰蓝皮肤、发光眼或冰兵器；宽肩不等于畸形健美。

参考边界：第1参考：第一图为经原版姓名对照表核验的左冷禅本人game原头像（raw 23），已实际view。只传递本人可见脸骨、眉眼鼻唇、须形与辨识关系；据本角色阶段转成完整写实人物。忽略像素画法、头像方向、头倾、表情夸张、衣服和帽饰；未见部位按文字补足。game近正面五官与role宽额方长脸一致；保留短黑髭、小尖颏须及正常视力，body/方巾/入鞘普通剑与阶段照主稿。 第2参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第3参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要闭目盲态、白浊双眼、眼罩、鲜血眼伤、冰蓝皮肤、冰甲冰柱、发光瞳孔、皇帝服、五岳旗帜文字、怪物化、后洞血战或无依据截肢。 不要 head tilt、Dutch angle、头歪向肩、眼线高低倾斜、抬下巴、仰头、低头藏眼、侧看、回眸或倾斜镜头。不要把本人game参考换成别人的脸；不要让第2或第3图改变脸型、眉眼鼻唇、年龄、体型、发际、须形、衣发、道具或姿势；不要三张脸平均混合，不把本人像素脸直接贴在写实身体上。不要像素块、锯齿、低清马赛克、动漫大眼、Q版、统一偶像脸、网红锥子脸、浓妆丰唇、摄影剧照、3D塑料或换头拼贴。不要把老者减龄、把矮小成年人画成儿童，不用畸形丑化代替角色辨识。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、污斑脸、裂皮、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额长辫、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、民国旗袍、中山装、官服补子或飞鱼服，不混朝代族群。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、面部特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 左冷禅 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Keep image 1 facial identity and the specified age, bodily condition, clothing and narrative stage; never inherit reference poses or the faces in images 2 and 3.
```

## 排除项

不要闭目盲态、白浊双眼、眼罩、鲜血眼伤、冰蓝皮肤、冰甲冰柱、发光瞳孔、皇帝服、五岳旗帜文字、怪物化、后洞血战或无依据截肢。 不要 head tilt、Dutch angle、头歪向肩、眼线高低倾斜、抬下巴、仰头、低头藏眼、侧看、回眸或倾斜镜头。不要把本人game参考换成别人的脸；不要让第2或第3图改变脸型、眉眼鼻唇、年龄、体型、发际、须形、衣发、道具或姿势；不要三张脸平均混合，不把本人像素脸直接贴在写实身体上。不要像素块、锯齿、低清马赛克、动漫大眼、Q版、统一偶像脸、网红锥子脸、浓妆丰唇、摄影剧照、3D塑料或换头拼贴。不要把老者减龄、把矮小成年人画成儿童，不用畸形丑化代替角色辨识。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、污斑脸、裂皮、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额长辫、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、民国旗袍、中山装、官服补子或飞鱼服，不混朝代族群。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、面部特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zuolengchan__ch05_prime_sighted_base.prepared.json`。
