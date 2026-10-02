---
asset_id: por_npc_gongsunlve__ch03_youth_base
subject_id: npc_gongsunlve
name: 公孙绿萼
book: ch03_shendiao
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch03/por_npc_gongsunlve__ch03_youth_base.png
manifest: assets/default/character/female/ch03/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shendiao/gongsunlve_1995_suyuhua.jpg
  use: 第一且唯一面部身份参考：1995 TVB苏玉华饰公孙绿萼的单人绿衣剧照。保留偏圆短椭圆脸、丰润颧颊与柔和下颌、小而圆润的下巴、自然弧眉和适中偏长眼形、直顺鼻梁与圆鼻尖、明确唇线及有厚度的下唇。不要磨成李若彤长脸或王语嫣尖下巴大眼。原照轻微侧转和紧张眼神改成正面直视、头颈竖直、眼线水平；青绿影视衣装高髻首饰、背景与署名不继承。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考仅项目低饱和设色、暖润肤色与柔和光影的画风色卡，不提供面容。不得借王语嫣的脸、骨相、眼睛大小、鼻子、下巴、年龄、体型、高髻、玉簪、衣装或侧身倾头；原图细节若让人物变碎变薄也不沿用。人物必须独立清楚写实、完整实材衣料。参考现有approved不传递给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考只取暖浅灰纸底、极淡水墨山水与留白。忽略原图女性脸、头倾、身体、白青薄纱衣、饰物和站姿；水墨/纸纹不得侵蚀人物皮肤、衣料、手部和器物边缘。
status: ready
realism_revision: user_identity_pose_20261001
---

# 公孙绿萼 · 人物写实修正

## 人物与阶段

- subject_id：npc_gongsunlve
- book：ch03_shendiao
- gender：female
- age_variant：youth

## 本轮人物写实规范

1995苏玉华饰公孙绿萼为唯一面部身份；成年青年绝情谷主之女；丹房与地穴救援阶段，牺牲事件以前，不提前采用改命后身份。正面端正、头颈竖直、双眼水平，保留本人骨相和真实年龄；第二基线仅色彩，第三仅背景。人物美观完整写实、衣料不透明连贯；两张原生2:3 candidate，不用统一大眼小鼻尖V女脸。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_gongsunlve__ch03_youth_base/prompt-7ab5cdca00f24f159071276bdfe483d70892d4efbe691149d89787ee67cdb45a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Keep the head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL and both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward; head centered over the torso and shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override ALL reference poses; do not copy a reference side glance, raised chin or turned torso. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia portrait of GONGSUN LÜE / 公孙绿萼, an adult young woman and the daughter of the Passionless Valley's master in The Return of the Condor Heroes. Image 1 is the ONLY FACIAL IDENTITY reference: Louisa So / 苏玉华 as Gongsun Lüe in the 1995 TVB series starring Louis Koo and Carman Lee. Image 2 is only the project colour/light sample and image 3 only the ink background. Preserve her own cheek volume, jaw, eye shape and facial spacing instead of replacing them with a standard heroine face.

身份与阶段：南宋神雕书界，成年青年公孙绿萼，绝情谷丹房与地穴救援阶段，牺牲事件以前。健康完整的青年身姿，肩背纤细但稳当，没有怯弱缩肩；温柔善意与能自行作决定的勇气并存。平静直视、嘴唇自然闭合，不用哭泣、惊恐或轻佻姿态概括她。不是公主、未成年幼女或改命后的未知年龄，也不照搬演员现代中年活动照。

本人脸锚：按第一张苏玉华角色图，柔和偏圆的短椭圆脸，颧颊有丰润真实体积，面部宽度保留，下颌转折柔和，小下巴圆润不尖。眉是自然弧线、眉尾平稳；眼形适中而稍修长，上眼睑与眉眼间距清楚，眼尾自然，不强行扩大眼球或画夸张双眼皮。鼻梁直顺而不刻意高削，鼻尖圆润、鼻翼有宽度，不能缩成玩偶小鼻；唇线明确、下唇有自然厚度。保留这些比例关系与成年青年气色，不削窄脸颊、尖化下巴或套小龙女/王语嫣同脸。原照轻微侧转与紧张表情不继承，恢复正面温柔而坚定的眼神。

服饰与发式：南宋隐居谷中汉族女子的浅叶绿色直领对襟褙子，内穿米白交领右衽衫和齐腰长裙，以墨绿窄布腰带收束。外褙子是对襟，内衫交领明确穿着者左襟盖右襟、向本人右侧合拢，领口遮蔽得体。衣料完全不透明、朴素完整，袖口收敛便于看清持物手，少量浅绿灰阴影使整片衣料有可信厚度与重力。素色平底布鞋。黑发收成低髻，用素木簪和短绿发带固定，额面清楚；不直接复制原剧照的高髻、花饰、珠耳坠、长鬓带或鲜青高领衣。

静立与唯一道具：身体正面、头颈垂直、双足稳稳落地，双手在胸腹之间偏下的自然位置轻拢一只小型朴素陶药瓶，与胸口留出空间。药瓶形状为一个圆润小瓶身、一个瓶颈和清楚闭合的朴素瓶塞；表面哑光，无文字标签，无珠宝镶饰，不发光。本人左手从下方轻托瓶底，右手用自然分开的指腹轻稳瓶身侧面，不去拔塞，五指关节及瓶口轮廓可读。瓶子不会粘在掌心或衣襟上，双手不重叠成团，袖口与手腕清楚分开。瓶子是解药剧情的视觉概括，不能写成特定丹药专名。没有情花枝、刀剑、暗器、鲜血或任何死亡意象。

人物画法：美观而可信的写实国风人物插画。面部、双手、衣料与器物都有完整坚实体积和确定轮廓，皮肤细腻自然、有柔和明暗，不是动漫大眼、小鼻尖V下巴的统一模板。中性水平透视和柔和左上漫射光，肤色有生命感，五官清楚、手指可读。服装是完整不透明、可以真实穿着的连续织物，承重褶皱少而清晰，领口、袖口、下摆与缝合关系明确；不用密集黑线、噪点、飞白或破洞冒充质感。人物保持精妙手绘感，背景墨痕不能进入脸、手、服装或器物。

背景与交付：不透明暖浅灰纸底，人物之外仅极淡、低对比水墨远山薄雾和充足留白，少量脚下接触阴影；没有具象剧情场景。单人单视图完整全身，原生竖幅2:3，发顶、两手、两足、衣摆和全部道具端点完整入画，留自然边距；不用固定占高/头身数字拉伸或挤压人物。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实记录，保存原始PNG字节，不裁切、旋转、重采样或重新编码。默认两张独立候选比较，每幅只有一个角色，均为candidate，等待用户审核，不自动approved。

事实边界：身份阶段和装备组合以当前主角色稿、名录与剧情文档为准；具体衣料款式、头饰、静态握持布局与容器形制是角色稿及本次美术补足。未逐字校勘的原著细节保留待考，不编造引文、页码或小说固定肖像，不将这些说明印在画面。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、额鼻颏中线倾斜、双眼高低不平、倾斜镜头、俯首藏眼、仰头、抬下巴、明显侧脸、侧身回眸、耸单肩或参考的侧目；不要王语嫣、小龙女、郭芙、郭襄等其他人的脸，不融合三参考人脸，不让所有女性共用大眼、小鼻、尖V下巴模板。不要动漫大眼、夸张双眼皮、网红锥子脸、针尖下颌、鼻子过小、丰唇滤镜、浓妆、磨皮塑料肤质、摄影截图、剧照拼贴或3D模型。不要现代物品、拉链、腕表、运动鞋、高跟鞋、日式服制刀具、和服、圆盘刀镡、菱形缠柄、欧式奇幻盔甲、仙侠重冠、赛博或蒸汽朋克；不要唐式齐胸裙、明式马面裙或网巾、官服补子、清式旗装、剃发留辫、马蹄袖、大拉翅或朝代混搭。不要汉式交领左衽、水平镜像、多肢、多手、多指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、身体缺失、裁断头足或器物端点。不要人物碎墨、飞白缺块、纸纹透肤透衣、碎布条、撕裂衣摆、毛边、大片补丁污渍、密集噪点、模糊眼睛、背景墨点切碎人物、强雾遮轮廓、塑料反光或强泛光。不要裸露、透明衣料、色情化、血腥、恶搞或丑化；不要法阵、粒子、发光武器、光翼、龙形能量、额外人物、动物、复杂建筑、多格、多视图或脸部特写框。不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；保留工具原有溯源标识与元数据。 不要把公孙绿萼画成郭襄式幼态少女、儿童、成熟中年贵妇、病弱缩肩或性感公主；不要小龙女长鹅蛋脸或王语嫣尖小脸，不削掉本人圆润颧颊。不要高大宫廷冠、豪华珠宝、影视高髻花饰、长鬓带或鲜青立领替代指定浅叶绿对襟褙子。不要情花、利刃、穿胸意象、血痕、尸体、死亡仪式、悲惨哭相；不要兵器或悬浮法术。不要第二只瓶、发光仙丹、药瓶文字标签、打开的瓶盖、倒药动作、瓶身与手指融合、瓶口被整只手遮没、瓶子紧贴胸口或袖子吞手。

FINAL POSE CHECK: FRONT-FACING GONGSUN LÜE. Her own 1995 TVB facial identity remains distinct. Head and neck UPRIGHT, forehead–nose–chin centreline VERTICAL, eyes HORIZONTALLY level, camera level, chin neutral, gaze straight ahead. NO head tilt and NO Dutch angle. Do not inherit ANY reference camera roll, raised chin, side glance or turned body. Keep her correct age, intact opaque costume, hands, feet and complete props clearly visible.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、额鼻颏中线倾斜、双眼高低不平、倾斜镜头、俯首藏眼、仰头、抬下巴、明显侧脸、侧身回眸、耸单肩或参考的侧目；不要王语嫣、小龙女、郭芙、郭襄等其他人的脸，不融合三参考人脸，不让所有女性共用大眼、小鼻、尖V下巴模板。不要动漫大眼、夸张双眼皮、网红锥子脸、针尖下颌、鼻子过小、丰唇滤镜、浓妆、磨皮塑料肤质、摄影截图、剧照拼贴或3D模型。不要现代物品、拉链、腕表、运动鞋、高跟鞋、日式服制刀具、和服、圆盘刀镡、菱形缠柄、欧式奇幻盔甲、仙侠重冠、赛博或蒸汽朋克；不要唐式齐胸裙、明式马面裙或网巾、官服补子、清式旗装、剃发留辫、马蹄袖、大拉翅或朝代混搭。不要汉式交领左衽、水平镜像、多肢、多手、多指、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、身体缺失、裁断头足或器物端点。不要人物碎墨、飞白缺块、纸纹透肤透衣、碎布条、撕裂衣摆、毛边、大片补丁污渍、密集噪点、模糊眼睛、背景墨点切碎人物、强雾遮轮廓、塑料反光或强泛光。不要裸露、透明衣料、色情化、血腥、恶搞或丑化；不要法阵、粒子、发光武器、光翼、龙形能量、额外人物、动物、复杂建筑、多格、多视图或脸部特写框。不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；保留工具原有溯源标识与元数据。 不要把公孙绿萼画成郭襄式幼态少女、儿童、成熟中年贵妇、病弱缩肩或性感公主；不要小龙女长鹅蛋脸或王语嫣尖小脸，不削掉本人圆润颧颊。不要高大宫廷冠、豪华珠宝、影视高髻花饰、长鬓带或鲜青立领替代指定浅叶绿对襟褙子。不要情花、利刃、穿胸意象、血痕、尸体、死亡仪式、悲惨哭相；不要兵器或悬浮法术。不要第二只瓶、发光仙丹、药瓶文字标签、打开的瓶盖、倒药动作、瓶身与手指融合、瓶口被整只手遮没、瓶子紧贴胸口或袖子吞手。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_gongsunlve__ch03_youth_base.prepared.json`。
