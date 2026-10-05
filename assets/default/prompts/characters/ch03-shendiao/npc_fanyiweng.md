---
asset_id: por_npc_fanyiweng__ch03_elder_longbeard_base
subject_id: npc_fanyiweng
name: 樊一翁
book: ch03_shendiao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch03/por_npc_fanyiweng__ch03_elder_longbeard_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 樊一翁 · 人物写实修正

## 人物与阶段

- subject_id：npc_fanyiweng
- book：ch03_shendiao
- gender：male
- age_variant：elder

## 本轮人物写实规范

绝情谷大弟子、与杨过交手前且长须尚未剪；不是十六年后西山一窟鬼。钢杖与长须由本地技能条目交叉支持，龙首细节为主稿待考的美术选择，不声称原文已证。矮小仍为中老年成年人。 正面头直眼水平、完整精细写实人物与淡水墨背景；一张原始PNG候选，candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_fanyiweng__ch03_elder_longbeard_base/prompt-82e1783d46f8d02f9df495e3fce59b1b385e89364e8e0df5acb6744d02171854.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia portrait of 樊一翁. THIS IS AN ORIGINAL WRITTEN FACE DESIGN: there is NO verified picture of this person among the inputs. It is NOT a claim to depict the 1995 TV actor. Image 1 is ONLY the male project colour palette and soft light; image 2 is ONLY the pale ink-wash background. Neither image provides face, age, body type, clothes, hair or pose. Do not copy, blend or average either reference face. Do not use another game or TV character face; create the independent written identity below.

身份与阶段：樊一翁（npc_fanyiweng），《神雕侠侣》ch03_shendiao。中老年绝情谷大弟子，谷中与杨过交手之前、长须尚完整的状态。

年龄与体型：身材矮小而结实的中老年成年男子，宽额方圆脸、短壮四肢与有力躯干，灰黑长须由下巴连续垂至近脚；不是儿童、巨人或枯弱仙人。 自然适龄体格，不采用固定头身或画面占高数字强行拉伸。

本人面容辨识：独立原创的矮壮长者面貌：宽而略鼓的额头、短方圆骨架，浓眉较平，眼睛偏小而眼睑有成熟松弛，眼神严肃直接。鼻梁较短、鼻头宽圆、鼻翼厚实，嘴形偏宽、闭唇有体积，颊肉结实而下颌圆方。灰黑相间长须从真实上唇和颏部根部生长，颏须完整束状垂到近脚但有自然分层，不是绕身触手。额角眼周保留中老年纹理，与觉远清瘦长椭圆老僧脸、达尔巴窄长壮年脸不同。

服制与发式：南宋绝情谷门人深青灰右衽短袍、米灰完整长裤、窄布腰带与厚底布鞋；头发收成小髻，衣袖略收束不遮住长须根部。所有衣服为完整不透明可穿织物；胸腹、裤鞋完整。凡汉式交领均为穿着者左襟覆右襟的右衽；达尔巴的藏僧披搭不强套汉僧或道袍。发式与衣制依本人的十三世纪身份，不套清代剃额留辫。

正面姿态与器物：正面稳立，额鼻颏竖直、双眼水平，短壮成年身量自然呈现，不强行拉成长腿。双手在身体一侧分开握同一根长钢杖，钢杖大致竖直且下端落地，顶部只有克制的小龙首形制，不生枝角或环链；上端和下端全入画。长须从下巴连续垂下，避开双手与钢杖，不盘缠兵器、不遮足，也不剪短。仅一根钢杖，无其他兵器。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：身份、年龄、身体状态与器物阶段沿当前项目角色稿、名录、故事和章节；主线为南宋理宗时期，项目推定约1237–1259年，各图取其明确阶段，不把全时段当单一岁数。原著形貌概括尚待指定三联/广州修订版终校，本次只读本地资料，未新增联网考据、不编造引句页码。具体五官、布料裁制、配色细分、静立持法和未核定器型是美术补足。绝情谷大弟子、与杨过交手前且长须尚未剪；不是十六年后西山一窟鬼。钢杖与长须由本地技能条目交叉支持，龙首细节为主稿待考的美术选择，不声称原文已证。矮小仍为中老年成年人。

参考边界：第1参考：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 第2参考：已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要儿童脸、婴儿比例、正常高挑青年体型、白发仙人、剪断短须、黑色触手须、须从衣服长出、长须缠杖缠手、十六年后鬼众服装或额外兵器。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不拿别人game或TV脸当本人，不冒称1995演员本人。不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把成年矮者画成儿童，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或时代族群混搭。藏僧按本角色僧衣与短发，少林汉僧按本角色剃发僧装，不混成同一宗派；金、辽后裔按本角色中原行旅选款，不自行增加宫廷冠服。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

FINAL POSE CHECK: 樊一翁 is FRONT-FACING. Forehead–nose–chin VERTICAL; both eyes HORIZONTALLY LEVEL; head and neck upright, chin neutral, gaze forward and camera level. NO head tilt. NO Dutch angle. Preserve the independently written identity and correct age, stage and clothing; never inherit another reference face or pose.
```

## 排除项

不要儿童脸、婴儿比例、正常高挑青年体型、白发仙人、剪断短须、黑色触手须、须从衣服长出、长须缠杖缠手、十六年后鬼众服装或额外兵器。 不要 head tilt、Dutch angle、头歪向肩、额鼻下巴中线倾斜、双眼高低倾斜、倾斜镜头、抬下巴、仰头、低头藏眼、侧向目光、明显侧脸、侧身回眸或单肩高耸。不要借性别基线或背景图的脸、年龄、体型、发际、衣装、道具或姿势，不拿别人game或TV脸当本人，不冒称1995演员本人。不要统一偶像脸、网红锥子脸、动漫大眼、Q版、浓妆丰唇、摄影半身照、3D塑料或换头拼贴。不要把老者减龄成青年，不把成年矮者画成儿童，不用畸形和丑化代替年龄或体型差异。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、破洞、撕裂衣摆、碎布条、毛边、大片补丁污渍、密集噪点或过密细皱，不用雾遮结构。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰品、明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃额留辫、旗装、马蹄袖、大拉翅、民国旗袍、中山装或时代族群混搭。藏僧按本角色僧衣与短发，少林汉僧按本角色剃发僧装，不混成同一宗派；金、辽后裔按本角色中原行旅选款，不自行增加宫廷冠服。不要汉式交领左衽、反向衣襟或水平镜像；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、仙侠冕冠、赛博或蒸汽朋克。不要新增兵器、发光武器、光翼、法阵、光龙、粒子、强逆光或过度泛光。不要多人、分格、多视角、特写框、多肢多指、无依据缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、失重衣带、缺失挂点、断裂器物、过短刀剑鞘、裁断头足和器物端点。不要裸露、透衣、性感化、血腥特写、恶搞、身体羞辱或无依据伤残。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书页字符和新增装饰水印；保留工具原有溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_fanyiweng__ch03_elder_longbeard_base.prepared.json`。
