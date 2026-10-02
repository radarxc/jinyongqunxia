---
asset_id: por_npc_yangxiao__ch04_prime_base
subject_id: npc_yangxiao
name: 杨逍
book: ch04_yitian
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch04/por_npc_yangxiao__ch04_prime_base.png
manifest: assets/default/character/male/ch04/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_12-1.png
  use: 第一且唯一面部身份：经典原版《金庸群侠传》杨逍本人头像，已实际view未改动PNG并对照带姓名表，source-audit-expanded映射已核验，字节与原ZIP成员相同。保留本人脸型与眉眼鼻口关系，低像素自然重建为细腻写实面孔，不放大像素、不描硬黑轮廓。最新正面、头颈垂直、双眼水平的要求覆盖所有参考角度，NO head tilt / NO Dutch angle。只保本人眉眼鼻唇和骨相关系；新图正面，中年灰鬓浅短须按当前稿重塑，不照搬原像侧脸或绿金衣领。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考只取项目同性别低饱和色卡、柔和左上光和连续设色品质；已实际view并复核SHA。不得取其面孔、年龄、性格、体型、头发、衣装、器物或倾头角度，不把该基线人画进本人物。当前基线manifest状态为candidate，仅如实记录，不修改审批；当前新人物输出仍是candidate。人物必须采用真实自然肤质、完整衣料和连续光影，不复制细墨碎纸侵入人物的旧画法。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅用户要求的背景：暖浅灰纸底、极淡水墨远山和薄雾、充足留白。已实际view并复核SHA，不取王语嫣脸、年轻年龄、发型、服装、动作或头部倾斜；墨痕与纸纹只能在背景，不进入人物与兵器。
status: redo
realism_revision: user_identity_pose_20261001
classic_ref:
  version: 2003 年苏有朋、贾静雯版《倚天屠龙记》（作者 AR-32 指定）
  actor: 张铁林
  stills:
  - .agents/coord/imagegen-reference/identity-20261002/yitian/yangxiao_2003_zhangtielin_tvsou.jpg
  - .agents/coord/imagegen-reference/identity-20261002/yitian/yangxiao_2003_zhangtielin_qq2022.jpg
reference_upload:
- .agents/coord/imagegen-reference/identity-20261002/yitian/yangxiao_2003_zhangtielin_tvsou.jpg
- .agents/coord/imagegen-reference/identity-20261002/yitian/yangxiao_2003_zhangtielin_qq2022.jpg
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
- assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
redo_reason: "AR-32：主要角色参考经典影视版剧照（2003 年版）加基线重出（10-02，7 号出图员）"
codex_prompt_rev: 2026-10-02
---

# 杨逍 · 人物写实修正

## Gemini 提示词

> 2026-10-02 AR-32 改写（7 号出图员，codex exec · image_gen 出图）：主要角色参考经典影视版剧照重出——2003 年苏有朋、贾静雯版《倚天屠龙记》（作者 AR-32 指定）。按顺序上传剧照 2 张（yangxiao_2003_zhangtielin_tvsou.jpg、yangxiao_2003_zhangtielin_qq2022.jpg，在主检出 .agents/coord/imagegen-reference/identity-20261002/，不入库）取发型、服饰、配色、气质与面部特征，再上传两张同性别缩小版基线（放在最后）取画风；要求重新绘制成项目画风，不复制照片。提示词里不写演员名。上一版保留在后文作历史。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【剧照参考】随提示词上传的第 1、2 张参考图是这个角色经典影视造型的剧照：借鉴其发型、服饰、配色、标志道具、气质和面部特征（脸型、眉眼、鼻唇的比例与神态），让人一眼认出是这个角色；但必须重新绘制成本项目画风的手绘写实插画，不要照片质感，不要照搬剧照的构图、取景、光影、背景和姿势，也不要做成照片修图或磨皮美颜；剧照里的影楼柔光、浓妆、字幕和水印都不要。最后两张是本项目画风基线：画风、用色、光线、质感和暖浅灰纸底加淡水墨背景以它们为准。
【人物】杨逍，《倚天屠龙记》明教光明左使；光明顶解围后辅佐张无忌、参与教务议事的中年阶段。文武全才、冷峻孤傲、机智多谋。
【年龄与体态】四十五岁上下的中年男子，身材修长挺拔、肩背有力。
【经典造型】照剧照里这一版深入人心的杨左使来画：黑发在头顶束髻、戴一顶镂空的小银冠，其余长发披在背后；一身宽袖白袍，领口、袖口镶黑边，两条黑色窄布带从双肩垂到腰间，黑色宽腰带；神情冷峻、目光锐利，气场十足。
【面容】照剧照的脸型和五官来画：宽额方颐、颧骨清楚的脸；两道浓黑的剑眉、眉尾上挑；眼睛细长、目光锐利而审慎；鼻梁挺直；嘴唇偏薄、嘴角下压，带一点傲气；中年人的面部纹理，鬓角微有几丝灰白，下巴和唇上刮得很干净，只有极短的青色胡茬。
【服饰】白色宽袖交领右衽长袍，领口、袖口镶一道宽黑边，两条黑色窄布带从双肩竖直垂到腰间，黑色宽腰带，深色长裤、黑布靴；衣缘内侧只有一处极小的暗红火焰纹绣（明教标记，不发光）。
【道具】空手：不拿也不挂兵器、权杖或圣火令。
【姿态与神情】正面站立，本人右手抬到胸前作起手式（五指并拢、掌缘向前），左手自然垂在身侧；神情冷峻孤傲、目光如电。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、照片修图感、三维渲染或动漫大眼；不要直接复制剧照的画面；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要青年偶像脸、浪子醉态、浓白长须或过度老化；不要权杖、圣火令、刀剑、酒葫芦、折扇；不要同伴合影。
【画风基线】随提示词上传的参考图里，最后两张是本项目的立绘画风基线：只参考它们的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它们一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理。基线图只取画风、光线、质感和背景处理，不取长相：不要照搬基线图里人物的长相、年龄、发型、服饰和姿势。
```

---

以下为 AR-32 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_yangxiao
- book：ch04_yitian
- gender：male
- age_variant：prime

## 本轮人物写实规范

12-1本人长脸、直眉细长眼及鼻唇骨相转正；中年光明左使，灰鬓浅短须、清俊审慎微傲，非青年浪子。正面头颈垂直双眼水平，NO head tilt / NO Dutch angle；月白袍墨青薄外衣、低髻素簪，衣缘1处极小暗红火焰纹。双手空手，右手轻拢左袖口、左手垂；无权杖酒葫芦圣火令。1张candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_yangxiao__ch04_prime_base/prompt-733c393a67936e3b968b3b82f3de212a5ed62851fd53936469d91bdb2403c413.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference portrait pose. Preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of YANG XIAO / 杨逍. Image 1 is the ONLY FACIAL IDENTITY source: this character's reliably mapped classic MS-DOS Heroes of Jin Yong portrait. Keep the recognizable facial relationships; reconstruct a natural realistic face from the low-resolution drawing. Image 2 provides only the appropriate-gender project colour and rendering palette; image 3 only the ink-wash background. Never borrow another character's face.

阶段：中年明教光明左使，光明顶解围后参与教务议事，非年轻情缘前史或书末代掌教。

本人面容辨识：第一参考12-1杨逍本人头像：额面偏长、颧骨与下颌转折干净，黑眉较平直而眉尾微挑，眼裂细长、有审视与判断力；鼻梁高直、鼻口间距和偏薄闭合唇线保留，嘴角克制带微傲而非嘲弄。将略侧向的骨相自然转为端正正面，额鼻颏中线垂直，眉眼与鼻唇比例仍可认出本人；不继承游戏像侧脸。按中年阶段增加克制眼周纹理、少量灰鬓和整洁浅短须，不画成青年张无忌、基线浪子或满脸白须老人；这些年龄痕迹来自当前稿，不伪称低像素图已提供。肤质清楚真实、神态沉思从容，保留成熟清俊。

光明顶解围后参与明教教务议事的成熟光明左使，身材修长但肩背有真实力量，不纤弱病态，也不改成厚胸壮汉。身体朝正面、头颈竖直，双足稳定，一足可略前、重心自然轻偏，肩颈放松；傲气来自目光和克制嘴角，不靠歪头俯视或轻佻醉态。无本阶段明确需要外露的伤残，不凭空增加刀疤、断臂或伤病道具。

元末汉地文士式月白长袍、墨青薄外衣、深色窄布带与朴素布鞋，层次完整端正。汉式交领左襟压右襟，向本人右侧合拢；衣缘有少量宽缓褶，袖口下摆连续缝合，不画碎布薄纸。黑发带少量灰鬓，整齐收成低髻，以一支素簪固定，脸与颈线清楚。衣缘仅一处极小暗红火焰纹，低调缝线而非权力徽章或法阵；月白墨青配色、灰鬓强度和纹样为当前稿美术补足。不复制头像绿金衣领，不戴教主冠冕或官帽。

双手空手、无手持或腰挂兵器，不因光明使身份增加权杖或圣火令。本人左臂自然垂下，左手五指可见；本人右手在腹前轻拢左袖口的一小段布缘，手指与布边分开、不过度拉拽，右手不藏入袖筒，动作不遮脸。两手均未握任何器物；左右分配是本设计的美术补足。乾坤大挪移是武学，不画法轮、金属圆盘或光球；没有酒葫芦、折扇、书卷、长剑或第二个人。

人物画法：完整、美观、精细的写实国风人物。五官、实际存在的手部结构与双足清楚，皮肤具有自然年龄感与坚实柔和体积，头发与衣物边缘干净；布料是整片、完整裁剪的连续实体，只用少量宽缓承重褶和克制纤维细节，不用密集噪点或破碎证明真实。柔和左上漫射光、连续明暗，低饱和设色与温暖肤色，人物始终与背景分离。将第一参考的低分辨率脸部关系重新绘成自然写实人脸，不临摹像素方块、黑色硬描边、透明缺口或游戏截图。第二参考仅同性别低饱和色卡、柔和光线与连续设色品质，第三参考仅背景水墨；二三参考绝不能提供脸、头身、发型、衣装、手持物或倾头角度。

背景与交付：不透明暖浅灰纸底，边缘可有极浅、低对比的远山淡墨与薄雾，留白充足，脚下仅少量接触阴影；背景墨痕、纸纹与山影全部停留在人物、衣料、手部和器物轮廓外。无具体剧情建筑、第二个人、动物或画面文字。单人单视图、完整全身，原生竖幅2:3；头顶、发式、双足、实际存在的手部和器物端点完整入画，四周自然留边，不为固定占高强拉头身。目标2048×3072不透明PNG，接受工具实际原生2:3尺寸并如实登记，保留原始PNG字节，不裁切、插值或重编码。默认一张独立候选经执行者实际自查，仍为candidate，等待用户审核；每张画面只含一个本人。

事实边界：第一头像提供用户指定的本人游戏面部身份，不证明原著服装、年龄、伤残或阶段；当前基础角色稿、名录与剧情阶段优先。第三方MS-DOS资源与标注初代的人名表已交叉核验，但未声称已取得官方1996原盘位元证明。旧稿禁止本人游戏脸、固定占高或只纸底门槛由本次授权覆盖；具体服装裁制、配色、左右动作与未见原文的道具细节保持美术补足与待考边界，不画考据文字。

完整排除项：不要青年偶像脸、张无忌脸、令狐冲脸、浪子醉态、浓白长须或过度老化；不要基线体型和酒葫芦。不要头像侧脸与绿金衣领照搬、歪头、单肩耸起或仰下巴傲视。不要年轻情缘前史、书末代掌教冠冕、权杖、圣火令、刀剑腰挂、酒壶葫芦、折扇、书卷或法轮；双手必须空手。不要火焰纹变成大片金色装甲、法阵或全身符咒，不要同伴合影、妻女配角。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: FRONT-FACING YANG XIAO. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, head and neck naturally UPRIGHT over the torso, chin neutral, camera level. NO head tilt and NO Dutch angle. Do not inherit any reference's tilted head or side view. Keep the character's own recognizable face, age, anatomy and required objects clear.
```

## 排除项

不要青年偶像脸、张无忌脸、令狐冲脸、浪子醉态、浓白长须或过度老化；不要基线体型和酒葫芦。不要头像侧脸与绿金衣领照搬、歪头、单肩耸起或仰下巴傲视。不要年轻情缘前史、书末代掌教冠冕、权杖、圣火令、刀剑腰挂、酒壶葫芦、折扇、书卷或法轮；双手必须空手。不要火焰纹变成大片金色装甲、法阵或全身符咒，不要同伴合影、妻女配角。 不要 head tilt、Dutch angle、头歪向肩、脸部中线倾斜、双眼高低倾斜、倾斜镜头、侧脸、背身回眸、耸单肩、俯首藏眼或仰头藏眼。不要第二参考人物的脸、其他角色的脸或同质化通用脸；不要旧通用俊男脸换衣、网红尖下巴、动漫大眼、偶像磨皮、浓妆、夸张健美肌肉、照片截图、3D模型、塑料皮肤、像素画放大、黑色硬边或游戏UI。不要人物碎墨、飞白缺块、纸纹透肤透衣、纸片侵蚀、白斑、划痕、碎布条、撕裂下摆、过密褶皱、斑驳脸或模糊眼睛；墨雾不能吞没人体和衣料。不要额外人物、多视图、拼贴分格、脸部特写框、无依据新增肢体和伤残、手物融合、错接手腕、悬空器物、头足或器物端点裁切。不要日式刀服、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、近现代物品、汉式交领左衽或水平镜像。不要裸露、透明衣料、性感化、血腥特写、恶搞或丑化。不要光龙、法阵、发光武器、粒子特效、强泛光、强逆光、复杂背景、题款、印章、标签、logo或装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_yangxiao__ch04_prime_base.prepared.json`。
