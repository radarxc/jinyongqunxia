---
asset_id: por_npc_dingdian__ch09_prime_prison_base
subject_id: npc_dingdian
name: 丁典
book: ch09_liancheng
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch09/por_npc_dingdian__ch09_prime_prison_base.png
manifest: assets/default/character/male/ch09/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 第一参考严格仅male项目色卡：低饱和设色、暖肤色与浅灰底的协调关系，已实际view。没有任何本人身份参考图；不得借基线人物的脸型、眉眼鼻唇、头发、胡须、年龄、体型、姿势或衣服。尤其不沿用基线残破衣边、碎墨或纸感；人物完整写实由文字定义。保持原manifest实际状态，不把基线审批转移给本角色。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考仅背景：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，已实际view。完全忽略图中王语嫣的脸、年龄、体型、头倾、手势、头发及白青裙装，墨迹与纸纹不得侵入人物、衣料、器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 丁典 · 人物写实修正

## 人物与阶段

- subject_id：npc_dingdian
- book：ch09_liancheng
- gender：male
- age_variant：prime

## 本轮人物写实规范

丁典独立具体面容，无可靠原版本人图，不借基线脸；梅念笙传承者、神照功传人；取荆州狱中与狄云建立信任、尚未中毒离狱的阶段。正面头直眼水平，完整细腻写实人物、背景水墨，1张原生2:3 candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_dingdian__ch09_prime_prison_base/prompt-3c850195df67a96dfc453d20421bb3a1c6c237be738ee1b2f6ebcdb347947fbc.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia character illustration of 丁典 / npc_dingdian from Lian Cheng Jue. There is NO verified original-game face for this supporting character. Design a distinct original face from the individual facial description. Image 1 is ONLY a colour palette, with ZERO facial or anatomical transfer; image 2 is ONLY the pale ink-wash background. Never borrow Xiao Feng, Linghu Chong, Di Yun or Wang Yuyan identity. 当前已核实原版游戏头像资料没有此人的可靠配对；本图为依当前角色稿而作的独立具体面容设计，不冒充原版头像、演员脸或既有身份基线。单候选须保持同一组面貌关系。

身份与阶段：梅念笙传承者、神照功传人；取荆州狱中与狄云建立信任、尚未中毒离狱的阶段。年龄与体貌：壮年男子；厚肩与强健前臂仍在，牢狱使面颊削瘦，双手双足保留旧铁镣，无新鲜伤口。壮年武人虽因囚禁削瘦而厚肩、前臂力量仍在，不能画成垂老病弱者，也不借萧峰基线脸或健美巨人体型。双腕双踝的镣铐完整，不新增开放性伤口。

独立面容辨识锚点：独立宽长脸，额宽和颧弓宽度明确，下颌厚而有棱但不方成萧峰模板；面颊因久囚略凹。浓眉近直、眉头有力，眼窝略深而眼形修长，双眼平视沉静，眉眼间距较紧。直阔鼻梁与有厚度的鼻翼，鼻头较钝实；嘴宽适中，上唇略薄、下唇有体积，闭口克制。浓而自然失整的胡须有连续根部，不遮眼、不吞嘴，须发以深色为主，仅少量灰白，仍是壮年。

服制与发式：铁灰粗布长衣与暗褐长裤、旧布鞋，衣物虽旧但整片完整可穿，少量平整牢固补缀，不画带囚字的制服；清初俗家男子残存辫发落于背后，前额剃发区域有久囚发茬，鬓发和胡须自然失整，不机械套用整齐英雄裹巾。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；僧衣和其他服制按各自结构，不镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，朴素不等于破损。

姿态与器物：正面端正站立，肩背舒展、颈部直立、下巴中性，双眼水平望前方，不仰望花窗。双臂低垂略分，两手空而掌指放松，各自完整可见。双腕各一旧铁环，由一段松弛短链相连，链条自然下垂，不穿过身体；双踝各一铁环，同样以短链松弛相连。铁环贴合但不嵌肉，金属环与链节连续可信。双足平稳、不开过大步，不踩链、不连向画外墙壁。无剑、无菊花盆、无牢门或第二囚徒。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一参考严格仅male项目色卡：低饱和设色、暖肤色与浅灰底的协调关系，已实际view。没有任何本人身份参考图；不得借基线人物的脸型、眉眼鼻唇、头发、胡须、年龄、体型、姿势或衣服。尤其不沿用基线残破衣边、碎墨或纸感；人物完整写实由文字定义。保持原manifest实际状态，不把基线审批转移给本角色。 第二参考仅背景：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，已实际view。完全忽略图中王语嫣的脸、年龄、体型、头倾、手势、头发及白青裙装，墨迹与纸纹不得侵入人物、衣料、器物。

背景与交付：第二图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。默认一张独立候选经执行者实际自查；所有输出仍为candidate，待用户最终审核，不自动approved。

事实与原创边界：当前已核实原版游戏头像资料没有此人的可靠配对；本图为依当前角色稿而作的独立具体面容设计，不冒充原版头像、演员脸或既有身份基线。单候选须保持同一组面貌关系。 具体胡须、发茬、铁镣位置及链长的指定版原著细节待考；当前造型按mainrole落实。 宽长脸、具体鼻唇结构、铁灰配色与链节设计为原创补足。 

完整排除项：不要垂老白须、病态骷髅、过度健美；不要抬头望窗、斜脸、整齐英雄裹巾或未入狱书生装。不要剑、盆花、武学光柱、新鲜血伤、棺木、中毒紫脸、刑讯动作；镣铐不穿皮肉，不连画外墙，不切断链节。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、演员照片或台标。

FINAL POSE CHECK: FRONT-FACING 丁典 / npc_dingdian. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Keep this individual face and correct age, injuries and equipment; never inherit the face, body, head lean or costume from any reference.
```

## 排除项

不要垂老白须、病态骷髅、过度健美；不要抬头望窗、斜脸、整齐英雄裹巾或未入狱书生装。不要剑、盆花、武学光柱、新鲜血伤、棺木、中毒紫脸、刑讯动作；镣铐不穿皮肉，不连画外墙，不切断链节。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、演员照片或台标。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_dingdian__ch09_prime_prison_base.prepared.json`。
