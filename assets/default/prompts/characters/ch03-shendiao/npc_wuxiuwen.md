---
asset_id: por_npc_wuxiuwen__ch03_youth_base
subject_id: npc_wuxiuwen
name: 武修文
book: ch03_shendiao
gender: male
age_variant: youth
tier: B
output: assets/default/character/male/ch03/por_npc_wuxiuwen__ch03_youth_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 武修文 · 人物写实修正

## 人物与阶段

- subject_id：npc_wuxiuwen
- book：ch03_shendiao
- gender：male
- age_variant：youth

## 本轮人物写实规范

十六年书页以前襄阳守城一期的成年青年弟弟，不提前婚后年龄；独立于武敦儒且不合并成一人。具体脸形、服色、普通剑具为主稿原创区分，轻巧神态不借令狐冲浪子身份。 正面头直眼水平、完整精细写实人物与淡水墨背景；一张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_wuxiuwen__ch03_youth_base/prompt-6c4d5c1875fea6aaac7ba35d6e10855bc1de44b3528296d1be18d5ee4e39e1e1.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 武修文. THIS IS AN ORIGINAL WRITTEN FACE DESIGN: there is NO verified picture of this person among the inputs. It is NOT a claim to depict the 1995 TV actor. Image 1 is ONLY the male project colour palette and soft light; image 2 is ONLY the pale ink-wash background. Neither image provides face, age, body type, clothes, hair or pose. Do not copy, blend or average either reference face. Do not use another game or TV character face; create the independent written identity below.

身份与阶段：武修文（npc_wuxiuwen），《神雕侠侣》ch03_shendiao。成年青年武氏弟弟，十六年书页以前襄阳守城一期，郭靖门下。

年龄与体型：成年青年武氏弟弟，较窄椭圆脸、略挑长眉和紧凑鼻唇，肩幅比兄长窄、四肢灵活，清醒敏捷而不轻浮；保持成年体格，非儿童或后期中年。 自然适龄体格，不采用固定头身或画面占高数字强行拉伸。

本人面容辨识：独立原创的偏窄椭圆成年青年脸：额头中等宽、颧面平顺、下颌逐渐收束而下巴圆钝有支撑；较长眉在眉尾轻微上挑、自然窄长眼裂、正常眼距，正视机敏清楚。直鼻梁与兄长有少量家族相似，鼻翼较窄、鼻尖小而完整；口鼻区域紧凑，较小嘴形和较薄唇、唇角稳住不轻佻。青年清爽无须，皮肤完整；弟弟眉更挑、脸更窄、口唇更小、肩更轻，不能把兄长长方宽脸换衣当作本人。

服制与发式：南宋汉族江湖灰绿右衽窄袖长袍、墨灰短外褂、窄布腰带、护腕与布鞋；束髻略高，素灰短发带收束，衣缘完整。所有衣服为完整不透明可穿织物；胸腹、裤鞋完整。凡汉式交领均为穿着者左襟覆右襟的右衽；达尔巴的藏僧披搭不强套汉僧或道袍。发式与衣制依本人的十三世纪身份，不套清代剃额留辫。

正面姿态与器物：正面端正站立，头颈竖直、眼线水平、目光朝前，不沿旧稿侧看警戒。双脚自然着地、重心居中，一手轻扶腰带、一手自然垂下。本人左腰（观者右侧）普通中式直身双刃剑完全入浅褐长鞘，小铜横格、剑柄与鞘口连续，窄挂带真实连接腰带；鞘足够长、端点完整，双手不拔剑且不挡佩挂。只有一柄剑，没有酒器或官甲。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：身份、年龄、身体状态与器物阶段沿当前项目角色稿、名录、故事和章节；主线为南宋理宗时期，项目推定约1237–1259年，各图取其明确阶段，不把全时段当单一岁数。原著形貌概括尚待指定三联/广州修订版终校，本次只读本地资料，未新增联网考据、不编造引句页码。具体五官、布料裁制、配色细分、静立持法和未核定器型是美术补足。十六年书页以前襄阳守城一期的成年青年弟弟，不提前婚后年龄；独立于武敦儒且不合并成一人。具体脸形、服色、普通剑具为主稿原创区分，轻巧神态不借令狐冲浪子身份。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要宽方脸复制兄长、兄弟同框、童年形象、中年络腮胡、酒葫芦、醉汉或轻佻神情、名剑、官甲、一阳指发光特效或旁视。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不拿别人game或TV脸当本人，不冒称1995演员本人。不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把成年矮者画成儿童，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或时代族群混搭。藏僧按本角色僧衣与短发，少林汉僧按本角色剃发僧装，不混成同一宗派；金、辽后裔按本角色中原行旅选款，不自行增加宫廷冠服。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 武修文 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Preserve the independently written identity and correct age, stage and clothing; never inherit another reference face or pose.
```

## 排除项

不要宽方脸复制兄长、兄弟同框、童年形象、中年络腮胡、酒葫芦、醉汉或轻佻神情、名剑、官甲、一阳指发光特效或旁视。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不拿别人game或TV脸当本人，不冒称1995演员本人。不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把成年矮者画成儿童，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或时代族群混搭。藏僧按本角色僧衣与短发，少林汉僧按本角色剃发僧装，不混成同一宗派；金、辽后裔按本角色中原行旅选款，不自行增加宫廷冠服。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_wuxiuwen__ch03_youth_base.prepared.json`。
