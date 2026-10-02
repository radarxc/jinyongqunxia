---
asset_id: por_npc_zhanfei__ch06_prime_injured_base
subject_id: npc_zhanfei
name: 展飞
book: ch06_xiake
gender: male
age_variant: prime
tier: B
output: assets/default/character/male/ch06/por_npc_zhanfei__ch06_prime_injured_base.png
manifest: assets/default/character/male/ch06/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 展飞 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhanfei
- book：ch06_xiake
- gender：male
- age_variant：prime

## 本轮人物写实规范

伤后静态画像不等于full战斗配装验收。右臂骨折、完整，不是永久断肢；后期愈合须另变体。 正面头直眼水平，人物完整精细写实、水墨仅背景；一张原生PNG候选，candidate待审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhanfei__ch06_prime_injured_base/prompt-71c9c9944b1e21eeae13758143eb2114edba019a389ce47de99fe8ef065483ae.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 展飞. THIS IS AN ORIGINAL WRITTEN FACE DESIGN for this supporting character: there is NO verified picture of this person among the inputs. Image 1 is ONLY the corresponding gender project colour palette and soft light; image 2 is ONLY the pale ink-wash background. Neither image provides face, age, body type, clothes, hair or pose. Do not copy, blend or average either reference face; create the independent written identity below.

身份与阶段：展飞（npc_zhanfei），《侠客行》ch06_xiake。中年长乐帮豹捷堂香主，取误击石破天、右臂骨折获接骨并开始化解敌意后的休养阶段。

年龄与体型：身量高大、肩背厚实的中年男子，宽方脸、粗眉、下颌结实、短髭，神情从戒备转为疑惑和感激；伤后略显疲惫，绝不丑化。自然适龄体格，不采用固定头身拉伸。

本人面容辨识：原创中年宽短方脸：额头较宽、粗而略短的平眉，眼裂中等、上睑略厚，眼距稍宽，颧颊厚实、下颌角清楚，短下巴方圆而不尖。鼻梁中等高度、鼻翼较宽、鼻头圆钝，嘴宽、上唇有短髭，下唇自然厚度，面部微有疲惫与松弛的戒备。与石清的长方文秀脸、白万剑的深眼长鼻分开；神情由疑惑转为受助后的克制感谢，不用咧嘴傻笑或丑化。高大厚实的肩背仍在，右臂休养不抹去其完整肢体。

服制与发式：低饱和褐灰斑纹布长衣，斑纹做稀疏不规则织染色块，不是整张兽皮；右袖宽松完整以容纳夹板，墨褐腰带、深灰裤与布鞋；黑发束髻。汉式交领右衽，穿着者左襟覆盖右襟、向本人右侧合拢；衣服完整不透明、领胸腰腹遮蔽，裤裙鞋袜完整，布料厚度和重力清楚，不将旧衣画成破损碎布。

正面姿态与器物：正面稳站，头颈自然端正、双眼水平，肩部顺应休养姿势而不歪头。本人右臂即观者左侧仍完整，由上臂、肘、前臂、手腕直到五指连续存在；右前臂屈在腹前，用两块素木夹板和几条米白布带固定，外侧夹板可见，绑带有真实包绕关系而不穿皮肤。完整宽松右袖容纳包扎，右手从袖口/固定带末端自然露出，手指放松。左手轻扶右肘下方但不遮没右手。辅助宽布吊带跨肩和胸前托住右臂，不勒穿颈部；不持兵器、不出拳、不露伤口。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。默认一张独立候选经执行者实际自查；每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：身份、阶段、年龄和伤势沿当前项目角色稿、名录与事件线；本作约1582–1583明万历为项目原创定年，不是原著明示公历。原稿原著概括仍待指定版本逐字复核，本次未进行新联网考据、不编造引句页码。未核定的服装款式、色彩细分、器物装具、自然静立手势和低分辨率图以外的细脸材质属美术补足。伤后静态画像不等于full战斗配装验收。右臂骨折、完整，不是永久断肢；后期愈合须另变体。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要把右臂骨折画成断肢、空袖或金属义肢；不要左臂包扎而右手挥掌；不要现代石膏、医疗印字、鲜血伤口、豹皮斗篷、豹子头盔、飞翼或铁砂特效；不要无伤双拳进攻姿势。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸、单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不用畸形和丑化代替年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、数码物件、塑料饰品，禁止清式剃额长辫、马蹄袖、旗装、大拉翅、民国旗袍、唐式齐胸裙与时代族群混搭；不要无依据官服补子或飞鱼服。不要汉式左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 展飞 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Preserve only this person's proper facial identity and this role's age, stage and complete body; never inherit another reference face or pose.
```

## 排除项

不要把右臂骨折画成断肢、空袖或金属义肢；不要左臂包扎而右手挥掌；不要现代石膏、医疗印字、鲜血伤口、豹皮斗篷、豹子头盔、飞翼或铁砂特效；不要无伤双拳进攻姿势。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸、单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不用畸形和丑化代替年龄。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、数码物件、塑料饰品，禁止清式剃额长辫、马蹄袖、旗装、大拉翅、民国旗袍、唐式齐胸裙与时代族群混搭；不要无依据官服补子或飞鱼服。不要汉式左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhanfei__ch06_prime_injured_base.prepared.json`。
