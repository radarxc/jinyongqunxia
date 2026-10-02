---
asset_id: por_npc_shipotian__ch06_youth_jinwu_base
subject_id: npc_shipotian
name: 石破天
book: ch06_xiake
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_jinwu_base.png
manifest: assets/default/character/male/ch06/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_39-1.png
  use: 第一且唯一面部身份参考：经典原版《金庸群侠传》石破天本人头像；已实际view原PNG及带姓名表，并核对source-audit-main30对应关系与SHA，原始字节与ZIP成员相同。只保持本人脸部比例、眉眼鼻唇和气质辨识关系，将低分辨率像素关系自然重建成精细写实人脸；不要像素放大、描边或照搬发式/服装。头像朝向不继承：新图正面，头部中线竖直、双眼水平，NO head tilt / NO Dutch angle。当前身份、年龄、伤残与器物必须服从本角色基础阶段。尤其忽略原头像短乱发和深灰领口；新图仍为素布小髻、灰米便装和唯一普通入鞘腰刀。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考仅项目男性低饱和色卡、柔和左上光与完整连贯的写实手绘品质；本会话已实际view并在写入前核对SHA未变。不得取令狐冲的脸型、眉眼鼻唇、体型、胡茬、明代网巾、衣装版式、长剑、站姿或倾头角度。本人脸只来自第一参考，基线candidate审批状态不改。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅背景：极淡水墨远山、薄雾、暖浅灰纸底与留白；本会话已实际view并在写入前核对SHA未变。忽略女性面孔、发型、体态、倾头、白青裙装及饰物；墨痕和纸纹不得进入人物、衣料与器物。
status: ready
realism_revision: user_identity_pose_20261001
codex_prompt_rev: 2026-10-02
reference_upload:
- .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_39-1.png
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
- assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
classic_ref:
  version: 《金庸群侠传》（1996）游戏头像（作者 10-02 指定侠客行用游戏头像）
  stills:
  - .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_39-1.png
---

# 石破天 · 人物写实修正

## Gemini 提示词

> 2026-10-02 AR-32 重出（8 号出图员，codex exec · image_gen）：主要角色参考经典造型加项目基线生成。上传顺序：第 1 张《金庸群侠传》石破天头像（HDGRP_39，放大到 448×464 的 JPEG），最后两张为同性别画风基线（缩小版 JPEG）。参考图只借造型、气质与面部特征，画面按项目画风重绘、不复制照片或像素图。上一版保留在下一节作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【参考图】第 1 张参考图是这个角色在经典武侠游戏里的低分辨率人物头像：借鉴它的脸型、发型、神态和配色，让人一眼认出是这个角色；但必须重新绘制成项目画风的精细写实人脸——不要像素感、不要放大的像素块和黑色硬描边，也不要照搬头像的角度、构图和背景。最后两张是本项目画风基线：画风、用色、光线、质感和暖浅灰纸底加淡水墨背景以它们为准，但不取基线人物的长相。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物】石破天，《侠客行》男主角，在荒山里长大、心地纯朴的少年英雄；在紫烟岛学会金乌刀法之后、赴侠客岛之前的时期。
【年龄与体态】约二十岁的成年青年男子，中等偏高的个子，肩宽背厚、四肢结实，是从小干粗活、后来练武的匀称体格，不夸张健美。
【经典造型】憨厚质朴的少年英雄：浓密不羁的黑发、晒成暖褐色的宽脸、坦诚明亮的眼睛，一身洗白的粗布短长衣，腰挂一柄普通单刀；憨直、诚恳、俊朗，让人一见就信得过。
【面容】脸型宽而略长，下颌方正、下巴短而不尖；浓黑平直的眉毛，眉眼距离偏近；眼睛不大但黑亮有神，眼神坦诚、憨厚，带一点不知所措的困惑，却清澈不呆；鼻梁挺直、鼻头圆厚；嘴唇厚薄适中、嘴角朴实；皮肤是日晒的暖褐色，有细小晒斑。英气朴实、憨厚俊朗，不是油滑小生，也不是痴呆相。
【发式】浓密的黑发略显蓬乱，额前和鬓边垂着几缕不羁的碎发，头顶用一条素布带随手束成松松的发髻。
【服饰】明代朴素的行旅便装：灰米色窄袖交领短长衣（右衽，左襟压右襟，衣长过膝），深褐色布腰带，青灰色长裤扎着绑腿，黑色平底布鞋；粗布洗得发白，干净整齐，没有补丁。
【道具】左腰挂着一柄普通的微弯单刀，刀在素木色刀鞘里（刀不出鞘），左手轻扶刀鞘上端；右手空着自然下垂。
【姿态与神情】双脚稳稳站立，身体朝向正面，憨直地望着前方，带一点腼腆的笑意。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要像素画、马赛克或游戏截图的感觉；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要油滑公子相；不要华丽帮主礼服或乞丐破衣；不要拔刀、第二把刀或长剑；不要玄铁令、泥人和神功光效；不要清代剃发留辫。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。基线图只取画风，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```


## 人物与阶段

- subject_id：npc_shipotian
- book：ch06_xiake
- gender：male
- age_variant：youth

## 本轮人物写实规范

原版游戏石破天本人头像作唯一面部身份；学金乌刀后、悟道前的成年青年，诚实温和、略困惑但清醒，结实体态。正面全身、头颈垂直、双眼水平，NO head tilt / NO Dutch angle。灰米交领右衽短长衣、青灰裤、素布小髻；本人左腰1柄普通微弯腰刀完整入鞘，左手轻扶鞘上端、右手空放；无玄铁令、泥人或太玄特效。第二图只男性画风，第三只淡墨背景；2张candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_shipotian__ch06_youth_jinwu_base/prompt-10b65a64da480ccfc566197e1137fb29aa0390f6359ce945eb5a882493a2c53a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia character illustration of SHI POTIAN / 石破天. Image 1 is the ONLY FACIAL IDENTITY reference: this character's reliably mapped portrait from classic MS-DOS Heroes of Jin Yong, used as a facial design reference, not a rendering style. Preserve recognizable facial relationships rather than a generic handsome template. Reconstruct a natural front-facing realistic face from the low-resolution drawing. Image 2 provides only restrained male rendering/colour quality and image 3 only an ink-wash background. Do not borrow any other person's facial identity.

成年青年身份与体态：金乌派开山弟子、长乐帮名义帮主；本图只取紫烟岛学刀后、赴侠客岛悟道前。成年年轻面孔与匀称结实的肩背，四肢有自然劳动及练武力量，不夸张健美，不画开篇幼时乞儿或中年宗师。身体端正朝正面，双脚稳定着地、可一足略前，肩颈自然放松，头颈始终竖直。与石中玉相貌相似是既有身份疑云，但本图只画石破天本人，不据此替原著断言他必为石中坚。

本人面部辨识：第一参考原版游戏石破天头像的脸形纵向略长、额颊有自然宽度，年轻下颌向短而不尖的下巴收束；浓黑较直眉的眉尾略有转折，眉眼距离较近，清楚而有神的杏形眼保持真实人类眼裂大小。鼻梁自然较直，鼻头适中、鼻翼收束，嘴唇不过分厚重，闭合唇线与略犹豫的嘴角关系清楚。保留原头像的眉眼位置、鼻口比例和坦诚年轻的辨识感，将像素关系自然重建为细腻真人骨相，不复制其额前短乱发、深灰领口、侧转或像素轮廓。肤色有适度日晒，面孔质朴，神情坦诚温和、略有不知所措但头脑清醒；不痴呆、不油滑、不装威严。

服装与发式：采用角色稿的明代朴素行旅便装，灰米色窄袖交领短长衣、青灰长裤、深褐窄布带与平底布鞋。左襟覆盖右襟、向穿着者本人右侧合拢，不镜像；领口严整、衣料完全不透明，袖口和下摆完整，衣裤分层清楚而不碎片化。黑发用素布带束成小髻，只留少量自然碎发；额眉和双眼清楚，不照搬游戏头像散乱短发，也不借男性基线的网巾。无官帽、帮主礼冠、王侯绣服或清式剃额辫发。灰米与青灰选色、束髻和衣装裁制是当前稿的美术补足。

左右动作与唯一器物：只佩一柄普通中式单刃微弯腰刀，刀刃完全在长度匹配的素木色刀鞘内，刀柄与小型护手、鞘口及封尾清楚。佩在本人左腰，即正面画面的观者右侧；短系带切实连到深褐腰带，鞘身略斜但全长可见，不能穿进腿或衣摆。本人左手轻扶刀鞘上端、接触位置明确，右手空着放松下垂；不拔刀、不摆出招架势。刀是表现已学金乌刀法的原创普通配刀，不是具名神兵。不要玄铁令、成套泥人、太玄经卷或玄铁重剑，不提前画太玄神功外显。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅低饱和色卡与连贯的手绘写实品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认两张独立候选由执行者比较，仍为candidate，等待用户审核；每张画面只含一个本人。

事实与改编边界：本人游戏头像只提供作者指定的面部识别，不证明原著年龄、发式、服饰、伤残或阶段；这些仍按当前基础角色稿与catalog/story。同名头像来自第三方MS-DOS资源归档并与标注初代的姓名表交叉核验，未冒称已验证具体1996原盘位元。原稿的脸型文字属原著概括待考或美术补足，不能压过作者新授权的本人头像；旧“禁止游戏独创造型”和“只按文字新造通用脸”不进入本轮请求。

完整排除项：不要把石破天变成石中玉的油滑公子、童年狗杂种乞儿、中年宗师或痴呆笑脸；不要把幼时脏乱短发照搬到成年学刀阶段。不要断指、独臂、瘸腿或擅加露出的伤疤侧别；正常双手各五指。不要清辫旗装、官帽礼冠、豪华帮主服、满身补丁破布。不要第二把刀、拔刀、长剑、玄铁重剑、玄铁令、泥人套装、书卷读字姿势、太玄字形能量或神功光环；不要石中玉第二人。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、错误右衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING SHI POTIAN. Keep the forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit ANY reference's tilted head, side view or shoulder angle. Keep the character's own recognizable face, current-stage anatomy and all required objects clearly visible.
```

## 排除项

不要把石破天变成石中玉的油滑公子、童年狗杂种乞儿、中年宗师或痴呆笑脸；不要把幼时脏乱短发照搬到成年学刀阶段。不要断指、独臂、瘸腿或擅加露出的伤疤侧别；正常双手各五指。不要清辫旗装、官帽礼冠、豪华帮主服、满身补丁破布。不要第二把刀、拔刀、长剑、玄铁重剑、玄铁令、泥人套装、书卷读字姿势、太玄字形能量或神功光环；不要石中玉第二人。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要令狐冲、萧峰、郭靖、王语嫣或其他角色的脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、错误右衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_shipotian__ch06_youth_jinwu_base.prepared.json`。
