---
asset_id: por_npc_yangmiaozhen__ch02_prime_base
subject_id: npc_yangmiaozhen
name: 杨妙真
book: ch02_shediao
gender: female
age_variant: prime
tier: A
output: assets/default/character/female/ch02/por_npc_yangmiaozhen__ch02_prime_base.png
manifest: assets/default/character/female/ch02/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第一输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 杨妙真 · 人物写实修正

## 人物与阶段

- subject_id：npc_yangmiaozhen
- book：ch02_shediao
- gender：female
- age_variant：prime

## 本轮人物写实规范

本作非原著主线配角，身份、出场和全套肖像是名录与现角色稿明确的原创扩展；史实身份与生卒仍待可靠来源。当前story/02和chapters/02未查到杨妙真/红袄军的直接具名条目，不能声称两份已证明具体军务事件；只据role/catalog创造本图，不新增小说情节或历史肖像结论。红褐袄与小札片甲不是断言统一军服，枪不是具名神兵。 正面写实全身、头颈端正、完整衣料、背景淡墨；先1个原生PNG候选，微细瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yangmiaozhen__ch02_prime_base/prompt-6ba0bc3e88a84451f0c8509a56ed325f67b3316229cf52395d86bb874b4aa9f6.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body portrait for a Chinese wuxia game of 杨妙真. This supporting character has an ORIGINAL TEXT-DEFINED FACE. Neither input is an identity portrait: image 1 supplies palette/painting quality only and image 2 pale ink background only. Do not copy, average or borrow any reference face. Build the distinct facial anchors below; no claim of game, TV actor or historical likeness.

身份与阶段：杨妙真（npc_yangmiaozhen），《射雕英雄传》 ch02_shediao。杨妙真，名录登记的山东红袄军首领，在本作抗金军务与民生支线出现（原创扩展）。

年龄与体型：三十岁上下的成年女将，仅为本次美术默认，史实生卒待考，不据此新增生年。结实肩背和有力腰腿，身体有真实重量，暖日晒肤色；不是纤细少女、性感盔甲模特或夸张健美。

原创本人面容：独立原创宽额略方的成年女性脸，宽而柔和的颧部、自然方圆下颌和有力圆下巴；舒展浓眉平直不紧蹙，明亮自然中等杏眼、正常眼距，目光坚定而清醒。鼻梁中长直挺、鼻尖圆实、鼻翼有自然宽度，唇线饱满但不过度丰唇，上下唇比例自然、口角平稳。眼尾只有适龄轻纹，暖日晒皮肤连续细腻。女将的担当通过成年骨量与沉稳神情表达，不复制王语嫣细长少女脸或任何历史人物画像。

服制与发式：十三世纪山东抗金义军的红褐右衽窄袖袄，内穿完整护身衣与深裤，外覆朴实小札片护胸，皮带与布靴，全部覆盖完整；黑发束紧高髻并包素色头巾，不加清代翎顶或凤冠。衣料完整不透明，衣缘缝线连续；只少量宽缓有重力的褶皱，不画裂纹、碎布和飞白。按本稿南宋时期地域与身份；汉式交领本人左襟压右襟，不水平镜像。全发束髻藏巾，不混清式剃额长辫、马蹄袖或明代网巾。

正面姿态与器物：完整全身正面稳立，头颈竖直、眼线水平、下巴中性，双脚稳落，肩自然宽展。本人右手握一杆普通实战长枪竖立于右侧身外留白，窄叶铁枪头、套箍、直木杆同轴，少量暗红缨自然下垂，枪头与杆尾完整入画，杆尾轻触地面。左手轻扶窄腰带；只有一杆枪，无军旗、骑马、士卒或戏曲靠旗。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新提速要求先1张候选，基本清晰、正面端正、身份可辨即可保存；仅严重身份/结构/不可读才补，不为细手指、微装备、微角重复。每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：南宋、金、蒙古并行，项目主体1217–1227且楔子1199，只用本稿阶段。 身份、年龄、生命态、器物依最新本地角色/名录/剧情；原稿标记待考仍保留，未新浏览外网或声称指定版本终校。宋地文士与山东义军各依当前主稿服制，禁混清式发服和明代网巾。具体衣色、器型细节、面部写实转译及静立姿态属于本次美术落实。本作非原著主线配角，身份、出场和全套肖像是名录与现角色稿明确的原创扩展；史实身份与生卒仍待可靠来源。当前story/02和chapters/02未查到杨妙真/红袄军的直接具名条目，不能声称两份已证明具体军务事件；只据role/catalog创造本图，不新增小说情节或历史肖像结论。红褐袄与小札片甲不是断言统一军服，枪不是具名神兵。

图像输入使用边界：第一输入同性别项目基线只供低饱和色卡、柔和光线、细腻手绘品质；不是本人，不抄其五官、年龄、身体、发式、服饰、道具或姿势。保留原审批状态，不传递给新图。 第二输入用户王语嫣图只供暖浅灰留白、极浅水墨远山背景；不继承其中女性、脸、衣裙、体型、飘带或倾头，墨迹不侵入人物。

完整排除项：不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型；不复制具体画作，不以画师姓名作为风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、具体剧情场景、清晰建筑、繁密前景花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要把造型写成原著定装，不画少年少女、戏曲女将靠旗、凤冠、露脐短甲、胸甲夸张曲线、高跟鞋或现代军装；不要宋帝仪仗、发光梨花枪和围观兵卒。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

FINAL POSE CHECK: FRONT-FACING, head upright, eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt. Respect identity and age, intact skin and clothing, correct stage and props.
```

## 排除项

不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型；不复制具体画作，不以画师姓名作为风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、具体剧情场景、清晰建筑、繁密前景花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要把造型写成原著定装，不画少年少女、戏曲女将靠旗、凤冠、露脐短甲、胸甲夸张曲线、高跟鞋或现代军装；不要宋帝仪仗、发光梨花枪和围观兵卒。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从风格基线或背景参考复制面孔、身体、年龄、发式、衣装与姿态。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yangmiaozhen__ch02_prime_base.prepared.json`。
