---
asset_id: por_npc_wentailai__ch12_prime_recovered_base
subject_id: npc_wentailai
name: 文泰来
book: ch12_shujian
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch12/por_npc_wentailai__ch12_prime_recovered_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 文泰来 · 人物写实修正

## 人物与阶段

- subject_id：npc_wentailai
- book：ch12_shujian
- gender：male
- age_variant：prime

## 本轮人物写实规范

recovered是被营救后伤势稳定、可同行的游戏窗口，不宣称小说某日完全痊愈；衣下布带是原创恢复标记，避免把捕囚伤重形象套入。 正面头直眼水平、完整精细写实人物与淡水墨背景；一张原始PNG候选，candidate待作者审核。 唯一图片输入为无人纯背景；保留现稿具体原创本人面容，不借任何其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_wentailai__ch12_prime_recovered_base/prompt-a58e9825c92a3fffa20d6c6fa445b5a1015b1c009cae7e4ca39a80bc6b519cb3.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 文泰来. THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

身份与阶段：文泰来（npc_wentailai），《书剑恩仇录》ch12_shujian。壮年男子，奔雷手、红花会四当家，取被救出并伤势稳定后的恢复阶段。

年龄与体型：壮年强健男子，宽方脸、浓直眉和短络腮胡，厚胸宽肩、粗壮前臂，皮肤真实而不增龄成深皱纹老者；恢复后能够自然站立。 自然适龄体格，不采用固定头身或画面占高数字强行拉伸。

本人面容辨识：原创壮年宽方骨架：额头宽、眉骨厚而浓直眉压得适中，眼睛大小自然、眼裂略宽，目光坦荡而稳定。鼻梁较短直、鼻翼有宽度、鼻头结实圆方，宽嘴自然厚唇、嘴角不夸张咧开。方实下颌、颊面紧实，短络腮胡连贯贴合上唇和颏颊，不蓬乱成老者白须。皮肤有少量行旅质感但完整不破裂；雄壮来自骨架和衣料受力，不把宽肩画成畸形健美。与杨成协圆厚颊腹的肥壮、卫春华精干菱脸有区别。

服制与发式：清代汉地江湖常服，前额剃发、后辫整齐收于背，铁灰窄袖长袍、深褐外褂、布带束腰、深裤与布靴；衣料完整干净、剪裁清楚。衣服为完整不透明、可穿的实体织物，胸腹和裤鞋完整；凡汉式交领为左襟覆右襟的右衽，清式圆领右开襟与道士、回部衣装各依本条身份，不把所有人换成同款交领。

正面姿态与器物：正面自然站稳，头直眼水平、下巴中性，胸廓舒展、双肩平稳放松。双手空着自然垂于身体两侧，手腕手指清楚完整，掌指松弯不作出拳；铁灰衣装完整干净，只有内领一角露出少量洁净布带边，标示伤势稳定休养，无鲜血或裸露伤口。无兵器、铁铐、牢服或雷电。

原创人物色调与光线：铁灰长袍与深褐外褂保持稳重暖冷层次，柔和左上漫射光清楚表现壮年宽方脸、浓直眉、结实颊面和短络腮胡。宽肩厚胸保留强健而非畸形，恢复阶段气色正常，内领少量洁净布带不变伤重囚徒。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、现存手部、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份、年龄、伤残和器物阶段沿当前项目角色稿、名录及故事；主线项目年代1753–1759、清乾隆。原稿原著概括尚待指定三联/广州修订版终校，本次只读本地资料，未新联网考据、不编造引句页码。具体五官、布料裁制、配色细分、静立持法与未核定器型是美术补足。recovered是被营救后伤势稳定、可同行的游戏窗口，不宣称小说某日完全痊愈；衣下布带是原创恢复标记，避免把捕囚伤重形象套入。

参考边界：唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。

完整排除项：不要囚服、铁铐、刑伤、满身鲜血或伤重卧姿；不要瘦削含胸、老年深皱纹、畸形健美肌肉；不要电弧雷锤、发光拳套或将奔雷手画成元素法术。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势；不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把少年拉成成年人，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、民国旗袍、中山装、晚清大拉翅、时代或族群混搭；清代俗家男子按本角色剃额辫发，方外道士和回部按本角色发式例外，不能一律套明代汉式发髻或一律套清廷官装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点；明确既有伤残必须保留，不补回缺失肢体。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 文泰来 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Preserve the independently written identity and correct age, stage, clothing and existing disability; never inherit another reference face or pose.
```

## 排除项

不要囚服、铁铐、刑伤、满身鲜血或伤重卧姿；不要瘦削含胸、老年深皱纹、畸形健美肌肉；不要电弧雷锤、发光拳套或将奔雷手画成元素法术。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势；不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把少年拉成成年人，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、民国旗袍、中山装、晚清大拉翅、时代或族群混搭；清代俗家男子按本角色剃额辫发，方外道士和回部按本角色发式例外，不能一律套明代汉式发髻或一律套清廷官装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点；明确既有伤残必须保留，不补回缺失肢体。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_wentailai__ch12_prime_recovered_base.prepared.json`。
