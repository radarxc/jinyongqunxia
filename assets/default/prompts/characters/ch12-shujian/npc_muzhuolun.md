---
asset_id: por_npc_muzhuolun__ch12_elder_alive_base
subject_id: npc_muzhuolun
name: 木卓伦
book: ch12_shujian
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch12/por_npc_muzhuolun__ch12_elder_alive_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 木卓伦 · 人物写实修正

## 人物与阶段

- subject_id：npc_muzhuolun
- book：ch12_shujian
- gender：male
- age_variant：elder

## 本轮人物写实规范

取归经后、黑水营抗清而第19回战死败讯之前。alive不是复活标记；具体头巾、须形、长刀形制仍是角色稿美术补足，不据回部身份虚构宗教符号。 正面头直眼水平、完整精细写实人物与淡水墨背景；一张原始PNG候选，candidate待作者审核。 唯一图片输入为无人纯背景；保留现稿具体原创本人面容，不借任何其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_muzhuolun__ch12_elder_alive_base/prompt-29bb3488849302f0144dec58475302bc4d4e74a54ae411742063888b4ea11cf8.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 木卓伦. THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

身份与阶段：木卓伦（npc_muzhuolun），《书剑恩仇录》ch12_shujian。中老年男子，回部首领、霍青桐等人的父亲，取归经后至黑水营抗清阶段，战死败讯之前。

年龄与体型：中老年男子，宽长脸与较深而自然的日晒肤色，浓须灰白交杂，肩背厚实、腰背稳固；父辈首领的威望，不因elder键画成衰弱百岁老人。 自然适龄体格，不采用固定头身或画面占高数字强行拉伸。

本人面容辨识：原创宽长而有分量的中老年脸：宽额、较深眼窝、浓厚略向外舒展的眉毛，眼裂适中、目光庄重而关切；长而宽度正常的鼻梁、圆实鼻头与有体积鼻翼，较宽嘴形、上唇较薄而下唇自然厚实。颧颊结实、下颌宽厚，额角与鼻唇周围有年长纹理，灰白短长相间浓须有清楚根部和连续生长关系。日晒棕褐肤色是自然肤质，不作戏妆或种族夸张；与乾隆收敛的宫廷短髭脸、文泰来壮年短络腮胡区分。

服制与发式：乾隆天山南路回部首领衣装，深褐长袍、靛青内衣与宽松长裤、普通窄革带、软皮靴；素布缠头配简约帽形，须发依地方身份，不套汉地剃额清辫；边饰少量几何织纹，不混拼现代民族舞服。衣服为完整不透明、可穿的实体织物，胸腹和裤鞋完整；凡汉式交领为左襟覆右襟的右衽，清式圆领右开襟与道士、回部衣装各依本条身份，不把所有人换成同款交领。

正面姿态与器物：正面稳立，额鼻颏竖直、双眼水平、下巴中性。本人左腰（观者右侧）仅佩一柄地区长刀，刀刃完全收入微弯长鞘，刀柄、护手、鞘口同轴，鞘有足够长度；两条短革挂带真实连腰带。左手轻搭鞘口以下外侧，右手在腰旁稍向外张开表示协调，双手清楚且不掩挂点。无经书、权杖、马匹或皇权物件。

原创人物色调与光线：深褐长袍、靛青内衣与自然日晒肤色保持低饱和暖冷层次；柔和左上漫射光表现宽长厚实面容、较深眼窝、庄重关切目光与浓厚灰白须，保留父辈首领年龄，不变病弱老人。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、现存手部、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份、年龄、伤残和器物阶段沿当前项目角色稿、名录及故事；主线项目年代1753–1759、清乾隆。原稿原著概括尚待指定三联/广州修订版终校，本次只读本地资料，未新联网考据、不编造引句页码。具体五官、布料裁制、配色细分、静立持法与未核定器型是美术补足。取归经后、黑水营抗清而第19回战死败讯之前。alive不是复活标记；具体头巾、须形、长刀形制仍是角色稿美术补足，不据回部身份虚构宗教符号。

参考边界：唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。

完整排除项：不要清廷龙袍、官帽补子、汉地强制剃额长辫、王冠、夸张异域铠甲；不要战死血迹、失去生气的遗像色调、骑马战场或经书伪字；不要用宗教符号代替首领身份。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势；不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把少年拉成成年人，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、民国旗袍、中山装、晚清大拉翅、时代或族群混搭；清代俗家男子按本角色剃额辫发，方外道士和回部按本角色发式例外，不能一律套明代汉式发髻或一律套清廷官装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点；明确既有伤残必须保留，不补回缺失肢体。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 木卓伦 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Preserve the independently written identity and correct age, stage, clothing and existing disability; never inherit another reference face or pose.
```

## 排除项

不要清廷龙袍、官帽补子、汉地强制剃额长辫、王冠、夸张异域铠甲；不要战死血迹、失去生气的遗像色调、骑马战场或经书伪字；不要用宗教符号代替首领身份。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势；不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把少年拉成成年人，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、民国旗袍、中山装、晚清大拉翅、时代或族群混搭；清代俗家男子按本角色剃额辫发，方外道士和回部按本角色发式例外，不能一律套明代汉式发髻或一律套清廷官装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点；明确既有伤残必须保留，不补回缺失肢体。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_muzhuolun__ch12_elder_alive_base.prepared.json`。
