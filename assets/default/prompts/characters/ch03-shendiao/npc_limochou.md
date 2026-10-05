---
asset_id: por_npc_limochou__ch03_prime_base
subject_id: npc_limochou
name: 李莫愁
book: ch03_shendiao
gender: female
age_variant: prime
tier: S
output: assets/default/character/female/ch03/por_npc_limochou__ch03_prime_base.png
manifest: assets/default/character/female/ch03/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shendiao/limochou_1995_xueli.jpg
  use: 第一且唯一面部身份参考：1995 TVB雪梨（严慧明）饰李莫愁的单人道姑剧照。保留偏长椭圆脸与有厚度的下颌、成年颧颊、较长自然眉、修长眼裂与眉眼间距、直鼻梁有体积鼻尖、较薄上唇与自然下唇；适配项目中年阶段，不能磨成少女。原图略抬下巴、轻转侧目、眼线轻倾全部舍弃；摄影背景、道冠、领色与截图署名不作为设计要求。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考仅项目低饱和设色、暖润肤色与柔和光影的画风色卡，不提供面容。不得借王语嫣的脸、骨相、眼睛大小、鼻子、下巴、年龄、体型、高髻、玉簪、衣装或侧身倾头；原图细节若让人物变碎变薄也不沿用。人物必须独立清楚写实、完整实材衣料。参考现有approved不传递给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考只取暖浅灰纸底、极淡水墨山水与留白。忽略原图女性脸、头倾、身体、白青薄纱衣、饰物和站姿；水墨/纸纹不得侵蚀人物皮肤、衣料、手部和器物边缘。
status: ready
realism_revision: user_identity_pose_20261001
---

# 李莫愁 · 人物写实修正

## 人物与阶段

- subject_id：npc_limochou
- book：ch03_shendiao
- gender：female
- age_variant：prime

## 本轮人物写实规范

1995雪梨饰李莫愁为唯一面部身份；中年赤练仙子、古墓叛出者；追索陆家旧债至绝情谷结局以前，正常健康身体状态。正面端正、头颈竖直、双眼水平，保留本人骨相和真实年龄；第二基线仅色彩，第三仅背景。人物美观完整写实、衣料不透明连贯；两张原生2:3 candidate，不用统一大眼小鼻尖V女脸。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_limochou__ch03_prime_base/prompt-d3f40f3828549653d0993e9e3045ae7202bf02c27890d4ff0c5d5328762b7a29.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Keep the head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL and both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward; head centered over the torso and shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override ALL reference poses; do not copy a reference side glance, raised chin or turned torso. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia portrait of LI MOCHOU / 李莫愁, a mature middle-aged woman, the Scarlet Fairy and former Ancient Tomb disciple in The Return of the Condor Heroes. Image 1 is the ONLY FACIAL IDENTITY source: Suet Lei / 雪梨（严慧明）as Li Mochou in the 1995 TVB series starring Louis Koo and Carman Lee. Image 2 is only a restrained colour/light sample and image 3 only an ink background sample. Retain the named actor's facial relationships, independently adapted to the project's middle-aged character; never copy another woman's face.

身份与年龄：南宋神雕书界，追索陆家旧债到绝情谷结局之前的中年李莫愁。保养良好的美貌道姑，纤长而有成熟力量，眉眼沉稳、克制冷峻，带清楚戒备与决断；不靠瞪眼、歪头或阴森特效表现。成熟的颧颊与下颌、自然眼窝、轻微眼角细纹和真实手部骨节帮助辨别年龄。不是青春小龙女或少女郭襄，也不是满脸深皱的老妇；不丑化反派，不预设剧情改命。

本人脸锚：依雪梨剧照，脸形偏长椭圆，颊面有真实厚度，下颌自然渐收、下巴圆钝而非尖V。眉毛较长且眉峰克制，眼裂自然偏长，上眼睑和内外眼角关系明确，眉眼间距保持本人特征，不把眼睛放大。鼻梁直顺，鼻尖有体积、鼻翼可辨，不缩成一个小点；上唇相对薄而唇峰清楚，下唇自然较饱满，嘴角平稳收住。肤色柔和、气色健康，保留面部体积与中年层次，不能用少女妆感或王语嫣的细窄小脸替代。将原照侧目、微仰改成中性下巴与正面直视。

服装发式：淡杏黄色汉式交领右衽道袍，穿着者左襟盖右襟、向本人右侧闭合；内衫严整遮颈胸，窄布腰带、完整下裳和实用素布鞋。袍袖适度宽松、袖口收敛，能清楚露出持柄手和另一只手。杏黄、浅灰白和墨褐低饱和配色，衣片完整、朴素而剪裁利落，不破损、不透明化。黑发全部高束为紧致道髻，一支小木簪固定，不照搬影视高筒帽或加豪华仙冠；额面、眼睛无遮挡。赤练是称号，不是大红魔女裙或蛇形装饰的依据。

静立与拂尘：身体主要正面，肩颈端正舒展、双足稳稳着地。本人右手（正面观者左侧）自然握住一柄拂尘 eq_fuchen 的朴素木柄，拂尘斜置身前偏右外侧，握点和木柄两端可辨。木柄顶端实际接牢柔韧白丝束；尘丝整束受重力自然垂向地面，丝根、丝身与完整末梢连续，和衣袖、手指、腿部清楚分开。拂尘是柔软丝束的传统器物，不是硬扫帚、马尾头、金属鞭或飘浮烟雾；不甩动、不施法。本人左手自然拢于腰旁、五指放松，空手，不去捏毒针。

腰侧标志物：一只小而朴素的密闭针匣代表冰魄银针 eq_bingpoyinzhen，匣盖明确闭合，普通短系带将匣固定在腰带侧面。尺寸低调、形状完整、不发光、无文字；针刃全部藏在匣内，不裸握、不漂浮、不向镜头抛出。拂尘、针匣、腰带和手分别可读，不增加刀剑。

人物画法：美观而可信的写实国风人物插画。面部、双手、衣料与器物都有完整坚实体积和确定轮廓，皮肤细腻自然、有柔和明暗，不是动漫大眼、小鼻尖V下巴的统一模板。中性水平透视和柔和左上漫射光，肤色有生命感，五官清楚、手指可读。服装是完整不透明、可以真实穿着的连续织物，承重褶皱少而清晰，领口、袖口、下摆与缝合关系明确；不用密集黑线、噪点、飞白或破洞冒充质感。人物保持精妙手绘感，背景墨痕不能进入脸、手、服装或器物。

背景与交付：不透明暖浅灰纸底，人物之外仅极淡、低对比水墨远山薄雾和充足留白，少量脚下接触阴影；没有具象剧情场景。单人单视图完整全身，原生竖幅2:3，发顶、两手、两足、衣摆和全部道具端点完整入画，留自然边距；不用固定占高/头身数字拉伸或挤压人物。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实记录，保存原始PNG字节，不裁切、旋转、重采样或重新编码。默认两张独立候选比较，每幅只有一个角色，均为candidate，等待用户审核，不自动approved。

事实边界：身份阶段和装备组合以当前主角色稿、名录与剧情文档为准；具体衣料款式、头饰、静态握持布局与容器形制是角色稿及本次美术补足。未逐字校勘的原著细节保留待考，不编造引文、页码或小说固定肖像，不将这些说明印在画面。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、额鼻颏中线倾斜、双眼高低不平、倾斜镜头、俯首藏眼、仰头、抬下巴、明显侧脸、侧身回眸、耸单肩或参考的侧目；不要王语嫣、小龙女、郭芙、郭襄等其他人的脸，不融合三参考人脸，不让所有女性共用大眼、小鼻、尖V下巴模板。不要动漫大眼、夸张双眼皮、网红锥子脸、针尖下颌、鼻子过小、丰唇滤镜、浓妆、磨皮塑料肤质、摄影截图、剧照拼贴或3D模型。不要现代物品、拉链、腕表、运动鞋、高跟鞋、日式服制刀具、和服、圆盘刀镡、菱形缠柄、欧式奇幻盔甲、仙侠重冠、赛博或蒸汽朋克；不要唐式齐胸裙、明式马面裙或网巾、官服补子、清式旗装、剃发留辫、马蹄袖、大拉翅或朝代混搭。不要汉式交领左衽、水平镜像、多肢、多手、多指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、身体缺失、裁断头足或器物端点。不要人物碎墨、飞白缺块、纸纹透肤透衣、碎布条、撕裂衣摆、毛边、大片补丁污渍、密集噪点、模糊眼睛、背景墨点切碎人物、强雾遮轮廓、塑料反光或强泛光。不要裸露、透明衣料、色情化、血腥、恶搞或丑化；不要法阵、粒子、发光武器、光翼、龙形能量、额外人物、动物、复杂建筑、多格、多视图或脸部特写框。不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；保留工具原有溯源标识与元数据。 不要把中年李莫愁画成少女、幼童或衰老老妇；不要红色魔女裙、裸肩低领、媚态摆拍、蛇瞳、毒蛇缠身、红色仙法、死亡火焰或尸体。不要穿小龙女素白裙或复制剧照帽子；不要拂尘变扫帚/硬金属鞭、丝束没有木柄连接、丝穿手穿身、木柄断裂或末梢裁切。不要裸手捏针、亮出毒针、飞针阵、打开针匣、无系带悬空匣、药瓶替代针匣、额外刀剑。

FINAL POSE CHECK: FRONT-FACING LI MOCHOU. Her own 1995 TVB facial identity remains distinct. Head and neck UPRIGHT, forehead–nose–chin centreline VERTICAL, eyes HORIZONTALLY level, camera level, chin neutral, gaze straight ahead. NO head tilt and NO Dutch angle. Do not inherit ANY reference camera roll, raised chin, side glance or turned body. Keep her correct age, intact opaque costume, hands, feet and complete props clearly visible.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、额鼻颏中线倾斜、双眼高低不平、倾斜镜头、俯首藏眼、仰头、抬下巴、明显侧脸、侧身回眸、耸单肩或参考的侧目；不要王语嫣、小龙女、郭芙、郭襄等其他人的脸，不融合三参考人脸，不让所有女性共用大眼、小鼻、尖V下巴模板。不要动漫大眼、夸张双眼皮、网红锥子脸、针尖下颌、鼻子过小、丰唇滤镜、浓妆、磨皮塑料肤质、摄影截图、剧照拼贴或3D模型。不要现代物品、拉链、腕表、运动鞋、高跟鞋、日式服制刀具、和服、圆盘刀镡、菱形缠柄、欧式奇幻盔甲、仙侠重冠、赛博或蒸汽朋克；不要唐式齐胸裙、明式马面裙或网巾、官服补子、清式旗装、剃发留辫、马蹄袖、大拉翅或朝代混搭。不要汉式交领左衽、水平镜像、多肢、多手、多指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、身体缺失、裁断头足或器物端点。不要人物碎墨、飞白缺块、纸纹透肤透衣、碎布条、撕裂衣摆、毛边、大片补丁污渍、密集噪点、模糊眼睛、背景墨点切碎人物、强雾遮轮廓、塑料反光或强泛光。不要裸露、透明衣料、色情化、血腥、恶搞或丑化；不要法阵、粒子、发光武器、光翼、龙形能量、额外人物、动物、复杂建筑、多格、多视图或脸部特写框。不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；保留工具原有溯源标识与元数据。 不要把中年李莫愁画成少女、幼童或衰老老妇；不要红色魔女裙、裸肩低领、媚态摆拍、蛇瞳、毒蛇缠身、红色仙法、死亡火焰或尸体。不要穿小龙女素白裙或复制剧照帽子；不要拂尘变扫帚/硬金属鞭、丝束没有木柄连接、丝穿手穿身、木柄断裂或末梢裁切。不要裸手捏针、亮出毒针、飞针阵、打开针匣、无系带悬空匣、药瓶替代针匣、额外刀剑。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_limochou__ch03_prime_base.prepared.json`。
