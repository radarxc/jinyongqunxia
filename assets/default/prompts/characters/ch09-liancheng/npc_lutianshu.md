---
asset_id: por_npc_lutianshu__ch09_prime_pursuit_base
subject_id: npc_lutianshu
name: 陆天抒
book: ch09_liancheng
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch09/por_npc_lutianshu__ch09_prime_pursuit_base.png
manifest: assets/default/character/male/ch09/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 第一参考严格仅male项目色卡：低饱和设色、暖肤色与浅灰底的协调关系，已实际view。没有任何本人身份参考图；不得借基线人物的脸型、眉眼鼻唇、头发、胡须、年龄、体型、姿势或衣服。尤其不沿用基线残破衣边、碎墨或纸感；人物完整写实由文字定义。保持原manifest实际状态，不把基线审批转移给本角色。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考仅背景：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，已实际view。完全忽略图中王语嫣的脸、年龄、体型、头倾、手势、头发及白青裙装，墨迹与纸纹不得侵入人物、衣料、器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 陆天抒 · 人物写实修正

## 人物与阶段

- subject_id：npc_lutianshu
- book：ch09_liancheng
- gender：male
- age_variant：prime

## 本轮人物写实规范

陆天抒独立具体面容，无可靠原版本人图，不借基线或其他NPC脸；南四奇之一；取雪谷大战前救援同行、尚未遭雪下伏击的阶段。正面头直眼水平，完整细腻写实人物、背景水墨，1张原生2:3 candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_lutianshu__ch09_prime_pursuit_base/prompt-c543cc1155ae7d0d2dca860cad1930aabf07e7a66a9d75e5e5809e544559a6ae.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia character illustration of 陆天抒 / npc_lutianshu from Lian Cheng Jue. The current verified original-game portrait corpus has NO reliably paired face for this supporting character. Design a distinct original face from the individual facial description. Image 1 is ONLY a colour palette, with ZERO facial or anatomical transfer; image 2 is ONLY the pale ink-wash background. Never borrow Xiao Feng, Linghu Chong, Di Yun, Wang Yuyan or another NPC identity. 当前已核实原版游戏头像资料没有此人的可靠配对；本图为依当前角色稿而作的独立具体面容设计，不冒充原版头像、演员脸或既有身份基线。单候选须保持同一组面貌关系。

身份与阶段：南四奇之一；取雪谷大战前救援同行、尚未遭雪下伏击的阶段。年龄与体貌：中年男子；身材魁梧、宽肩厚背、下盘坚稳，四肢有力量但不夸张肌肉。中年魁梧男子，宽肩厚背、下盘坚稳，四肢有力量而非夸张健美。雪谷大战前、未遭雪下伏击；头颈四肢完整，无伤无血。鬼头刀为主稿识别器物，不因原创合守剑游戏配置改持长剑。 项目清初服饰语汇为原创时代图层，小说确切纪年与外貌细节未经本次纸本终校。

独立面容辨识锚点：独立宽短方脸，面长较短、额头宽低而平，颧弓宽、面颊厚实，宽阔下颌角近方，宽平下巴具有厚度；与花铁干和刘乘风的长脸比例明显不同。浓而偏粗的眉毛横向展开、眉尾短，眉眼间距较紧；眼形较短、开合适中而目光直实，两眼水平直视，眼距略宽但不夸张。鼻根较宽、鼻梁中等高度、阔鼻翼和圆厚鼻头，不能套狭长高鼻。口裂较宽，上唇厚度中等、下唇较丰满但不美妆，闭口果断；短粗胡须黑中略灰，须根与下颌连接真实，保留口形。中年风霜轻纹，不增白须衰老。

服制与发式：低饱和紫铜棕右衽长袍、深褐护腕、厚裤与黑布靴，衣料受宽阔胸肩撑起，腰带一圈侧结；清初剃前额留后辫，粗黑辫略夹灰，短须整齐，不用武将盔或道冠。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；按本人左右判断，不水平镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，简朴不等于破损；衣边平整有收边，不复制色卡人物的破衣。

姿态与器物：完整正面站定，胸背舒展、双肩平衡、头颈竖直、额鼻下巴中线竖直、双眼水平望前。双足稍宽站稳，手臂自然下沉。仅一柄中式鬼头刀：宽单刃、厚而可信的刀背、稍加宽的刀头轮廓、朴素短柄和简单金属护手，没有骷髅鬼脸雕饰。右手五指完整握刀柄，刀刃在本人右侧身体之外朝外斜下，刀尖离地且不指向观者，刀身连续、不被衣摆截断。左手在本人左侧身外握住一只匹配宽刀轮廓和长度的素刀鞘，鞘口向上、封尾向下，不与刀身交叉。刀、鞘及双手之间分离清楚，刀尖与鞘尾均完整入画，不加第二武器。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一参考严格仅male项目色卡：低饱和设色、暖肤色与浅灰底的协调关系，已实际view。没有任何本人身份参考图；不得借基线人物的脸型、眉眼鼻唇、头发、胡须、年龄、体型、姿势或衣服。尤其不沿用基线残破衣边、碎墨或纸感；人物完整写实由文字定义。保持原manifest实际状态，不把基线审批转移给本角色。 第二参考仅背景：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，已实际view。完全忽略图中王语嫣的脸、年龄、体型、头倾、手势、头发及白青裙装，墨迹与纸纹不得侵入人物、衣料、器物。

背景与交付：第二图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。默认一张独立候选经执行者实际自查；所有输出仍为candidate，待用户最终审核，不自动approved。

事实与原创边界：当前已核实原版游戏头像资料没有此人的可靠配对；本图为依当前角色稿而作的独立具体面容设计，不冒充原版头像、演员脸或既有身份基线。单候选须保持同一组面貌关系。 鬼头刀、魁梧、袍色及须发的指定版原著细节待考；当前依mainrole保留持大刀识别，不把原著概括伪写成已逐字核定。 宽短方脸、厚颊宽平下巴、短眼与阔鼻宽嘴、紫铜棕袍和无鬼脸刀头结构为本次原创美术补足。

完整排除项：不要瘦弱长脸书生、八旬白须老人或夸张健美巨人；不要把鬼头刀改成长剑、日本刀、巨斧或带骷髅鬼脸的奇幻魔刀。不要刀尖朝观者、刀刃插地、刀鞘过窄、断刀、断鞘或双刀；不要断首、血伤、雪下尸身、倒地或他人披穿其衣物。不要武将盔、道冠或清宫将军甲。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、演员照片或台标。

FINAL POSE CHECK: FRONT-FACING 陆天抒 / npc_lutianshu. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Keep this individual face and correct age, injuries and equipment; never inherit the face, body, head lean or costume from any reference.
```

## 排除项

不要瘦弱长脸书生、八旬白须老人或夸张健美巨人；不要把鬼头刀改成长剑、日本刀、巨斧或带骷髅鬼脸的奇幻魔刀。不要刀尖朝观者、刀刃插地、刀鞘过窄、断刀、断鞘或双刀；不要断首、血伤、雪下尸身、倒地或他人披穿其衣物。不要武将盔、道冠或清宫将军甲。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、演员照片或台标。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_lutianshu__ch09_prime_pursuit_base.prepared.json`。
