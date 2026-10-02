---
asset_id: por_npc_shuanger__ch08_youth_base
subject_id: npc_shuanger
name: 双儿
book: ch08_luding
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch08/por_npc_shuanger__ch08_youth_base.png
manifest: assets/default/character/female/ch08/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/luding/shuanger_1998_chenshaoxia.jpg
  use: 第一且唯一面部身份：1998 TVB陈小春版《鹿鼎记》的陈少霞饰双儿，本任务已实际view并核对来源记录、SHA、尺寸。第一参考陈少霞双儿的短圆椭圆脸、饱满柔和颊面和较短圆下巴；脸宽与面中长度的关系自然可辨。保留细长轻弧眉、较柔和的自然眼形与微扬外眼角、眉眼间距、纤细鼻梁与小圆鼻头，小巧唇形和略上扬嘴角，表情温厚而机敏。不要把自然眼睛放大成动漫圆眼。双儿的脸保持圆润短而不是阿珂的较长、下颌收窄轮廓，不能换成第二第三参考的王语嫣尖细脸。五官细腻写实，约18–20岁的年轻成年人，身量轻巧、肩臂有习武力量而不过度纤弱；不低幼、不做讨好或卑怯表情。原图分辨率只够确认轮廓与神态，细微毛孔不作精确复制要求。 本人五官适配当前阶段，绝不继承照片头倾、身体倾角、其他人物、服装、拍摄背景或半身构图；新图必须正面头颈竖直、双眼水平。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第二参考仅女性项目低饱和淡藕灰与暖肤色、柔和明暗、连续布料和细腻写实手绘质感；已实际view。不可借王语嫣的脸型、眉眼鼻唇、侧脸视线、长发、宋代褙子裙装、手势、首饰或身材模板；manifest实际approved保持不变，不能把基线审批转移给本角色。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考仅背景：极浅低对比水墨远山、暖浅灰纸底、薄雾与留白；已实际view。完全忽略其中王语嫣面孔、倾头转身、女性体态、白青薄纱裙装、发饰与飘带；墨痕纸纹不得侵入双儿的人体衣物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 双儿 · 人物写实修正

## 人物与阶段

- subject_id：npc_shuanger
- book：ch08_luding
- gender：female
- age_variant：youth

## 本轮人物写实规范

1998陈少霞双儿为唯一本人脸，圆润短椭圆面颊与温厚机敏神态；正面头颈竖直、双眼水平、18–20成年观感。灰藕右衽长袄青灰裙、素小髻、空手提醒待援、左腰小布包；不共享阿珂或王语嫣的脸，人物完整写实。 两张原生2:3候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_shuanger__ch08_youth_base/prompt-d49fbae07ff579edc49494611db26e0c3f190954fd279dd5cc79d6be2bc04984.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia character illustration of SHUANG ER / 双儿. Use image 1 as the ONLY FACIAL IDENTITY source: Cherie Chan / 陈少霞 as Shuang Er in the 1998 TVB The Duke of Mount Deer starring Jordan Chan. Preserve this particular character’s recognizable facial relationships, naturally adapted to the specified story age. Image 2 is ONLY a same-gender project colour/rendering sample; image 3 is ONLY the pale ink-wash background sample. No other face may enter the design.

身份与阶段：双儿（npc_shuanger），《鹿鼎记》ch08_luding，清初康熙时代；严格是庄家旧事之后随韦小宝同行、承担主动护持职责的青年阶段。约18–20岁的年轻成年观感，确岁待考，asset的youth键不自动等于成年。

本人辨识锚点：第一参考陈少霞双儿的短圆椭圆脸、饱满柔和颊面和较短圆下巴；脸宽与面中长度的关系自然可辨。保留细长轻弧眉、较柔和的自然眼形与微扬外眼角、眉眼间距、纤细鼻梁与小圆鼻头，小巧唇形和略上扬嘴角，表情温厚而机敏。不要把自然眼睛放大成动漫圆眼。双儿的脸保持圆润短而不是阿珂的较长、下颌收窄轮廓，不能换成第二第三参考的王语嫣尖细脸。五官细腻写实，约18–20岁的年轻成年人，身量轻巧、肩臂有习武力量而不过度纤弱；不低幼、不做讨好或卑怯表情。原图分辨率只够确认轮廓与神态，细微毛孔不作精确复制要求。

服制与发式：清初江南汉族女子的朴素灰藕色长袄、青灰长裙、窄布腰带、素色软底布鞋。汉式交领右衽为穿着者左襟覆盖右襟，向本人右側合拢，领口严整、胸颈遮蔽，袖口略收便于护持。整片衣料连贯、衣摆完整可穿，朴素但剪裁清楚，不用脏污破布塑造义婢身份。黑发收成左右对称的两个收敛小髻，用素布带束牢，额前少量整齐细碎发不遮眼；不用图中大体积影视发髻、粉花、耀眼饰物或蓝白繁复绣纹。腰侧一只小而朴素的布包，用短系带实在固定在本人左腰，不悬空、不变为武器匣。

姿态与器物：主要正面站立，头与颈竖直端正，双眼水平直视，双肩自然放松。双脚均着地，一足可轻微前出半步，胸肩仍朝正面，不形成转身回眸。右手在本人右前方腰腹高度轻轻伸出作克制提醒，五指自然舒展；左手空着自然放在身侧、靠近布包但不握住它，双手各自完整可见。用细微专注目光与准备援手的动作表达护卫担当，不用歪头、跪姿、抱拳遮胸、双手交缠或对旁人献媚；画面没有需要保护的第二个人。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考主次再次限定：第二参考仅女性项目低饱和淡藕灰与暖肤色、柔和明暗、连续布料和细腻写实手绘质感；已实际view。不可借王语嫣的脸型、眉眼鼻唇、侧脸视线、长发、宋代褙子裙装、手势、首饰或身材模板；manifest实际approved保持不变，不能把基线审批转移给本角色。 第三参考仅背景：极浅低对比水墨远山、暖浅灰纸底、薄雾与留白；已实际view。完全忽略其中王语嫣面孔、倾头转身、女性体态、白青薄纱裙装、发饰与飘带；墨痕纸纹不得侵入双儿的人体衣物或器物。

背景与交付：第三图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。默认两张独立候选由执行者比较；所有输出仍为candidate，待用户最终审核，不自动approved。

事实边界：具体18–20岁为美术选段，原著确岁、生卒未核实。 双髻、朴素服装具体剪裁、衣色及布包不是已经逐字验证的原著专属定装；仍保留待考/美术补足界限。 第一身份图仅409×330、脸部约90像素尺度，能支持轮廓神态，不能支持精密皮肤纹理复原。 灰藕袄、青灰裙、素小髻与腰侧小布包继承主树稿；姿态改为正面提醒与待援。 不加载后期火器或双剑，用双手与专注神态表现主动护持。 用户明确指定1998剧版面容覆盖旧稿禁演员脸要求，但照片年龄、衣装、姿势和场景不变成小说事实。

完整排除项：不要把双儿画成梁小冰阿珂、陈圆圆、王语嫣或通用美人脸；不要拉成长瓜子脸、过尖下巴、母辈成熟皱纹、婴幼儿脸或性感成年写真。不要参考的大髻粉花、满身青蓝金线大绣纹、交叉拢手胸前、草垛剧照背景与半身裁切。不要清宫公主朝服、满族大拉翅、凤冠、皇冠、婚服、孕态、侍女下跪或七位家人合照。不要双剑、金铃索、火铳、长刀、剑鞘、盾牌或凭空名器。不要把左腰布包画成悬浮方盒、巨大背囊或带文字标签的物件。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。

FINAL POSE CHECK: FRONT-FACING SHUANG ER / 双儿. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level, chin neutral and gaze forward. NO head tilt and NO Dutch angle. Never inherit reference-photo head lean, sideways gaze, tilted shoulders, turned torso or cropped composition. Preserve only this role’s recognizable facial identity and the current-age full body.
```

## 排除项

不要把双儿画成梁小冰阿珂、陈圆圆、王语嫣或通用美人脸；不要拉成长瓜子脸、过尖下巴、母辈成熟皱纹、婴幼儿脸或性感成年写真。不要参考的大髻粉花、满身青蓝金线大绣纹、交叉拢手胸前、草垛剧照背景与半身裁切。不要清宫公主朝服、满族大拉翅、凤冠、皇冠、婚服、孕态、侍女下跪或七位家人合照。不要双剑、金铃索、火铳、长刀、剑鞘、盾牌或凭空名器。不要把左腰布包画成悬浮方盒、巨大背囊或带文字标签的物件。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_shuanger__ch08_youth_base.prepared.json`。
