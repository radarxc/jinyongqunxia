---
asset_id: por_npc_guierniang__ch07_prime_base
subject_id: npc_guierniang
name: 归二娘
book: ch07_bixue
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch07/por_npc_guierniang__ch07_prime_base.png
manifest: assets/default/character/female/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 归二娘 · 人物写实修正

## 人物与阶段

- subject_id：npc_guierniang
- book：ch07_bixue
- gender：female
- age_variant：prime

## 本轮人物写实规范

本界中年母亲与华山拳掌高手并存；独立本人意愿，不因丈夫存在自动同框。跨ch08鹿鼎的老年刺驾与命定结局不前置。药包为主稿原创叙事道具，保持单人、空手拳掌。 原创本人面孔、正面头直眼水平、完整精细写实人物与淡水墨背景；先1张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_guierniang__ch07_prime_base/prompt-eadf95db5bea890a5f384692d869efa07045e171606415138445298a6b6856ee.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 归二娘. THIS IS AN ORIGINAL WRITTEN FACE DESIGN: no verified picture of this person is supplied, and no existing own cross-book identity image was found in the checked project asset/identity locations. Image 1 supplies ONLY the female project palette and soft light; image 2 supplies ONLY the pale ink-wash background. Neither reference supplies the target face, age, body, hair, clothing, props or pose. Never copy or average these reference faces or use a different game/TV character. Create the distinct written identity below.

身份与阶段：归二娘（npc_guierniang），《碧血剑》ch07_bixue。华山归辛树之妻、拳掌高手，同门误会及患儿照护阶段。

年龄与体型：三十五至四十五岁中年女性视觉默认，确龄待考；方圆脸和自然厚实颊颌，肩臂有力、体态结实，眼角浅纹清楚。不能为美化减龄成少女，也不套鹿鼎老年白发状态。 不以固定头身或画面占高数字强行拉伸人体。

本人面容辨识：独立原创中年女性方圆脸：额头中等偏宽、眉骨自然，浓而平直的眉毛、真实大小的略长眼裂、均衡眼距，正视警觉而护家。鼻梁中等宽且端正、鼻尖圆厚、鼻翼自然，较宽嘴形、上唇略薄下唇厚度适中，嘴角稳住不皱成哭相。颊部有肉、下颌宽圆、下巴短圆有支撑，眼角与口周少量中年细纹，发际整齐而不稀白。保持成熟结实力量，不套王语嫣纤弱尖脸；与安小慧青年小椭圆脸、孙仲君青年窄长颊脸分开。

服制与发式：明末乡居妇人服，暗蓝右衽窄袖布袄、灰棕厚裙配内裤、素布围腰和布鞋；黑发束低髻、一支木簪，袖口轻收束。布料完整不透明、剪裁缝线清楚，旧衣只保留柔和材质而不主动添破洞补丁；身体与衣料体积连续，汉式交领为穿着者左襟覆右襟的右衽，不水平镜像。

正面姿态与器物：正面稳站，头颈端正、双眼水平，肩臂自然展开而不侧转。两手空着：本人右掌在腰胸间偏身体外侧自然张开，如留出护持空间，左手低垂松掌；手指手腕连续清楚，不作法印。本人左腰只有一只闭合小布药包，以短布带实际连接腰带，是患儿照护线的普通用品，不是毒器；不画孩子、丈夫或包内药材，不新增武器。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书项目时间窗1630–1645、主体1640–1645、成年江湖段约1643年起，各图时点以具体阶段为准；不把整个时间窗当人物确岁。当前本地role/catalog/story/chapter支持身份与阶段，原著概括保留指定三联/广州修订版待考，本次未新增联网考据或编造引句页码。具体五官、衣饰选款、器型与静态持法为美术补足。本界中年母亲与华山拳掌高手并存；独立本人意愿，不因丈夫存在自动同框。跨ch08鹿鼎的老年刺驾与命定结局不前置。药包为主稿原创叙事道具，保持单人、空手拳掌。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要抱婴儿、旁站丈夫、少女锥子脸、妖艳妆容、武器、毒雾、清宫旗装或白发老妪造型。 不要 head tilt、Dutch angle、歪头、额鼻颏中线倾斜、双眼高低倾斜、低头藏眼、侧向目光、侧脸、回眸、抬下巴或倾斜镜头。不要复制或混合两张参考人物的脸、年龄、体型、性别、发式、衣服、道具与姿势，不借其他人物game/TV脸冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、Q版、浓妆丰唇、照片剧照、3D塑料或换头拼贴。不要把中年老年减龄、把矮成年人画成儿童，不以身体羞辱和丑化表现责任或年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用浓雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或无身份官服补子；明末汉地发式服制按各自角色，不混后世清宫衣装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚缺指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 归二娘 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Keep the unique written face, correct age, body and stage; never inherit reference faces or poses.
```

## 排除项

不要抱婴儿、旁站丈夫、少女锥子脸、妖艳妆容、武器、毒雾、清宫旗装或白发老妪造型。 不要 head tilt、Dutch angle、歪头、额鼻颏中线倾斜、双眼高低倾斜、低头藏眼、侧向目光、侧脸、回眸、抬下巴或倾斜镜头。不要复制或混合两张参考人物的脸、年龄、体型、性别、发式、衣服、道具与姿势，不借其他人物game/TV脸冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、Q版、浓妆丰唇、照片剧照、3D塑料或换头拼贴。不要把中年老年减龄、把矮成年人画成儿童，不以身体羞辱和丑化表现责任或年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用浓雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或无身份官服补子；明末汉地发式服制按各自角色，不混后世清宫衣装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚缺指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_guierniang__ch07_prime_base.prepared.json`。
