---
asset_id: por_npc_anxiaohui__ch07_youth_base
subject_id: npc_anxiaohui
name: 安小慧
book: ch07_bixue
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch07/por_npc_anxiaohui__ch07_youth_base.png
manifest: assets/default/character/female/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 安小慧 · 人物写实修正

## 人物与阶段

- subject_id：npc_anxiaohui
- book：ch07_bixue
- gender：female
- age_variant：youth

## 本轮人物写实规范

取押金与袁党联络、与崔希敏同行关系支线的成年安小慧；同行是故事关系，不要求双人同框，不提前婚礼。普通剑与信袋是主稿配装，外貌和静立为文字原创。 原创本人面孔、正面头直眼水平、完整精细写实人物与淡水墨背景；先1张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_anxiaohui__ch07_youth_base/prompt-b76f53ca7c6e0643ba7335223476e5f9f5590c93ab6ba55374c9511687ef75a2.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 安小慧. THIS IS AN ORIGINAL WRITTEN FACE DESIGN: no verified picture of this person is supplied, and no existing own cross-book identity image was found in the checked project asset/identity locations. Image 1 supplies ONLY the female project palette and soft light; image 2 supplies ONLY the pale ink-wash background. Neither reference supplies the target face, age, body, hair, clothing, props or pose. Never copy or average these reference faces or use a different game/TV character. Create the distinct written identity below.

身份与阶段：安小慧（npc_anxiaohui），《碧血剑》ch07_bixue。安家 / 袁党友方，押金联络与崔希敏同行支线中的青年阶段。

年龄与体型：十八至二十二岁成年青年视觉默认，确龄待考；小而略圆的椭圆脸、自然青年肤质，肩臂匀称、体态轻健，成年骨架不幼态。不是开篇童年，也非婚后阶段。 不以固定头身或画面占高数字强行拉伸人体。

本人面容辨识：独立原创的小圆椭圆脸：额部饱满而宽度适中，平软自然眉、真实大小的杏眼、正常眼距，正视清亮温和且有主见。鼻梁较短而直、鼻尖小圆、鼻翼自然，嘴形小而清楚，上唇柔和、下唇略有厚度，嘴角收住浅暖意。圆润颊面与短圆下巴连续，不修成尖锥；脸部年轻有细节，不磨皮、不抹成无年龄美人。与孙仲君长些的尖圆颊、陡眉和紧唇区别，也与归二娘宽方颌及中年眼纹区别。

服制与发式：明末汉族行旅女子装，浅灰蓝右衽窄袖袄、深蓝马面裙与短比甲、藏青布带和平底鞋；黑发束简洁双股盘髻，以小木簪固定。布料完整不透明、剪裁缝线清楚，旧衣只保留柔和材质而不主动添破洞补丁；身体与衣料体积连续，汉式交领为穿着者左襟覆右襟的右衽，不水平镜像。

正面姿态与器物：严格正面安稳站立，头颈竖直、眼线水平、下巴中性，身体不前倾，双脚自然承重。本人左腰一柄普通中式直剑完全入鞘，以窄带接腰带，长度容纳剑刃；左手轻扶鞘口下方外侧，右手将一只闭合素布信袋低持在身体右侧，手指与袋口分开。信袋无字、不露书信；不画黄金、箱子或同行第二人。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书项目时间窗1630–1645、主体1640–1645、成年江湖段约1643年起，各图时点以具体阶段为准；不把整个时间窗当人物确岁。当前本地role/catalog/story/chapter支持身份与阶段，原著概括保留指定三联/广州修订版待考，本次未新增联网考据或编造引句页码。具体五官、衣饰选款、器型与静态持法为美术补足。取押金与袁党联络、与崔希敏同行关系支线的成年安小慧；同行是故事关系，不要求双人同框，不提前婚礼。普通剑与信袋是主稿配装，外貌和静立为文字原创。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要幼童体型、婚嫁凤冠、官家千金盛服、金蛇剑、清式旗装、娇媚裸露或与温青青相同脸型表情。 不要 head tilt、Dutch angle、歪头、额鼻颏中线倾斜、双眼高低倾斜、低头藏眼、侧向目光、侧脸、回眸、抬下巴或倾斜镜头。不要复制或混合两张参考人物的脸、年龄、体型、性别、发式、衣服、道具与姿势，不借其他人物game/TV脸冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、Q版、浓妆丰唇、照片剧照、3D塑料或换头拼贴。不要把中年老年减龄、把矮成年人画成儿童，不以身体羞辱和丑化表现责任或年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用浓雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或无身份官服补子；明末汉地发式服制按各自角色，不混后世清宫衣装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚缺指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 安小慧 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Keep the unique written face, correct age, body and stage; never inherit reference faces or poses.
```

## 排除项

不要幼童体型、婚嫁凤冠、官家千金盛服、金蛇剑、清式旗装、娇媚裸露或与温青青相同脸型表情。 不要 head tilt、Dutch angle、歪头、额鼻颏中线倾斜、双眼高低倾斜、低头藏眼、侧向目光、侧脸、回眸、抬下巴或倾斜镜头。不要复制或混合两张参考人物的脸、年龄、体型、性别、发式、衣服、道具与姿势，不借其他人物game/TV脸冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、Q版、浓妆丰唇、照片剧照、3D塑料或换头拼贴。不要把中年老年减龄、把矮成年人画成儿童，不以身体羞辱和丑化表现责任或年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用浓雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或无身份官服补子；明末汉地发式服制按各自角色，不混后世清宫衣装。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚缺指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_anxiaohui__ch07_youth_base.prepared.json`。
