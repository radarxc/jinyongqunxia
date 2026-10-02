---
asset_id: por_npc_jueyuan__ch03_elder_base
subject_id: npc_jueyuan
name: 觉远
book: ch03_shendiao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch03/por_npc_jueyuan__ch03_elder_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 觉远 · 人物写实修正

## 人物与阶段

- subject_id：npc_jueyuan
- book：ch03_shendiao
- gender：male
- age_variant：elder

## 本轮人物写实规范

只取《神雕侠侣》末华山追索失窃经书且健在的阶段；圆寂、逃寺与九阳三支承接属于下一书界，不提前合入。NPC已有九阳不表示玩家本阶段可直接习得；本张空手，章节过渡钩子的经筐不带入此基础像。 正面头直眼水平、完整精细写实人物与淡水墨背景；一张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_jueyuan__ch03_elder_base/prompt-21f7c9463df1fe0be187b577ca4f94699728182eb37a2883a405ca375891eda1.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 觉远. THIS IS AN ORIGINAL WRITTEN FACE DESIGN: there is NO verified picture of this person among the inputs. It is NOT a claim to depict the 1995 TV actor. Image 1 is ONLY the male project colour palette and soft light; image 2 is ONLY the pale ink-wash background. Neither image provides face, age, body type, clothes, hair or pose. Do not copy, blend or average either reference face. Do not use another game or TV character face; create the independent written identity below.

身份与阶段：觉远（npc_jueyuan），《神雕侠侣》ch03_shendiao。神雕末华山追索经书的老年少林藏经阁僧，仍然健在，尚未发生倚天楔子圆寂事件。

年龄与体型：神雕末健在的老年少林僧人，清瘦而精神充足、长椭圆脸、稀疏眉毛、温和清澈眼神，眼周与颊口真实细纹；剃净头发，不画成少年或濒死老人。 自然适龄体格，不采用固定头身或画面占高数字强行拉伸。

本人面容辨识：独立原创的清瘦老僧脸：较高圆额与长椭圆骨架，稀疏灰眉略呈柔和浅弧，眼睛自然偏长、上眼睑轻垂，正视平静而有神。鼻梁细长端正、鼻尖圆和、鼻翼不夸张，较小嘴形与柔和唇角，下巴略长且圆钝，颧面清楚但不骷髅凹陷。额纹、眼角纹和鼻唇细纹连续自然，剃发头皮与面部衔接完整，不臆造固定数量戒疤；面容清净无长须，不借任何方丈或基线年轻人的脸。

服制与发式：南宋汉地少林僧的旧灰右衽僧衣、暗褐简朴外搭、绑腿和布鞋，衣缘完整干净、缝线平整；剃发，不臆加特定数目的戒疤。所有衣服为完整不透明可穿织物；胸腹、裤鞋完整。凡汉式交领均为穿着者左襟覆右襟的右衽；达尔巴的藏僧披搭不强套汉僧或道袍。发式与衣制依本人的十三世纪身份，不套清代剃额留辫。

正面姿态与器物：正面安稳站立，头颈竖直、双眼水平，胸肩放松而不前倾。双手空手，一手在腹前自然轻抬如耐心解释、另一手松垂身侧；两手均完整可辨，不作法印或攻击。双足着地，衣袖与手清楚分开。没有经书、经筐、铁桶、水桶、禅杖、念珠、兵器、火焰或九阳光效。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：身份、年龄、身体状态与器物阶段沿当前项目角色稿、名录、故事和章节；主线为南宋理宗时期，项目推定约1237–1259年，各图取其明确阶段，不把全时段当单一岁数。原著形貌概括尚待指定三联/广州修订版终校，本次只读本地资料，未新增联网考据、不编造引句页码。具体五官、布料裁制、配色细分、静立持法和未核定器型是美术补足。只取《神雕侠侣》末华山追索失窃经书且健在的阶段；圆寂、逃寺与九阳三支承接属于下一书界，不提前合入。NPC已有九阳不表示玩家本阶段可直接习得；本张空手，章节过渡钩子的经筐不带入此基础像。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要少年僧、掌门金红袈裟、方丈冠、长须道士、濒死或圆寂姿态、背人逃寺、铁桶水桶、经筐书卷、火焰光效或无依据戒疤数量。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不拿别人game或TV脸当本人，不冒称1995演员本人。不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把成年矮者画成儿童，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或时代族群混搭。藏僧按本角色僧衣与短发，少林汉僧按本角色剃发僧装，不混成同一宗派；金、辽后裔按本角色中原行旅选款，不自行增加宫廷冠服。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 觉远 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Preserve the independently written identity and correct age, stage and clothing; never inherit another reference face or pose.
```

## 排除项

不要少年僧、掌门金红袈裟、方丈冠、长须道士、濒死或圆寂姿态、背人逃寺、铁桶水桶、经筐书卷、火焰光效或无依据戒疤数量。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不拿别人game或TV脸当本人，不冒称1995演员本人。不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把成年矮者画成儿童，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或时代族群混搭。藏僧按本角色僧衣与短发，少林汉僧按本角色剃发僧装，不混成同一宗派；金、辽后裔按本角色中原行旅选款，不自行增加宫廷冠服。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_jueyuan__ch03_elder_base.prepared.json`。
