---
asset_id: por_npc_liurenfeng__ch09_prime_pursuit_base
subject_id: npc_liurenfeng
name: 刘乘风
book: ch09_liancheng
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch09/por_npc_liurenfeng__ch09_prime_pursuit_base.png
manifest: assets/default/character/male/ch09/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_xiaofeng__ch01_base01.png
  use: 第一参考严格仅male项目色卡：低饱和设色、暖肤色与浅灰底的协调关系，已实际view。没有任何本人身份参考图；不得借基线人物的脸型、眉眼鼻唇、头发、胡须、年龄、体型、姿势或衣服。尤其不沿用基线残破衣边、碎墨或纸感；人物完整写实由文字定义。保持原manifest实际状态，不把基线审批转移给本角色。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考仅背景：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，已实际view。完全忽略图中王语嫣的脸、年龄、体型、头倾、手势、头发及白青裙装，墨迹与纸纹不得侵入人物、衣料、器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 刘乘风 · 人物写实修正

## 人物与阶段

- subject_id：npc_liurenfeng
- book：ch09_liancheng
- gender：male
- age_variant：prime

## 本轮人物写实规范

刘乘风独立具体面容，无可靠原版本人图，不借基线或其他NPC脸；南四奇之一；取赶赴雪谷、尚未被花铁干误杀的持剑道人形象。正面头直眼水平，完整细腻写实人物、背景水墨，1张原生2:3 candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_liurenfeng__ch09_prime_pursuit_base/prompt-937b5243550a291f9f5b9895c0aea9aa1365a1a5422c2cae2c42406292311b2f.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia character illustration of 刘乘风 / npc_liurenfeng from Lian Cheng Jue. The current verified original-game portrait corpus has NO reliably paired face for this supporting character. Design a distinct original face from the individual facial description. Image 1 is ONLY a colour palette, with ZERO facial or anatomical transfer; image 2 is ONLY the pale ink-wash background. Never borrow Xiao Feng, Linghu Chong, Di Yun, Wang Yuyan or another NPC identity. 当前已核实原版游戏头像资料没有此人的可靠配对；本图为依当前角色稿而作的独立具体面容设计，不冒充原版头像、演员脸或既有身份基线。单候选须保持同一组面貌关系。

身份与阶段：南四奇之一；取赶赴雪谷、尚未被花铁干误杀的持剑道人形象。年龄与体貌：名录口径的中年男子；瘦长身形、肩窄腰直、颌下长须略灰，脸有风霜而不作衰迈老人。按名录中年男性呈现，瘦长而脊背挺直，不因长须和道人装扮画成衰迈老人。未被花铁干误杀；道袍、低小素道冠与长剑按主稿，不新增武当门籍或徽记。 项目清初服饰语汇为原创时代图层，小说确切纪年与外貌细节未经本次纸本终校。

独立面容辨识锚点：独立明显瘦长脸，脸长显著而颊宽窄，颧骨清晰但不宽张，额侧向下平顺收窄；下颌线较窄且清楚，收至小而圆的下巴，不做尖锥。细直眉长而疏密自然，眉眼间距适中；眼裂修长偏窄、上眼睑线平稳，眼间距略近，双目水平直视且清醒专注。鼻梁细长修直、鼻尖小而端正、鼻翼窄；口裂中等偏窄，双唇偏薄但有真实体积，唇线平直而松弛。颌下长须黑中略灰、细束自然分层，口鼻结构仍可辨；有适度风霜纹而无八旬垂老纹，额角发色仍以黑灰为主。

服制与发式：青灰交领右衽道袍、灰白内领、窄布绦、深灰长裤与朴素布靴，袖摆克制不画繁复法衣；方外道人束髻，以低小素道冠固定，无清俗家辫发；此装束不据此新增武当等门派归属。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；按本人左右判断，不水平镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，简朴不等于破损；衣边平整有收边，不复制色卡人物的破衣。

姿态与器物：正面完整站立，窄肩自然放松且水平，头颈竖直，额鼻下巴中线竖直，双眼水平向前；两脚自然错开小半步但躯干和面部不转侧。左手在本人左侧身外提握一柄完整入鞘的普通中式直身长剑鞘口，剑首朝上、灰木直长鞘朝下。柄、小横格、鞘口和封尾同轴，鞘长度足够容纳整剑；鞘与衣摆之间有连续净空间隙，尾端离地，全部端点入画。右手轻放腰前但掌指露出衣袖，不结印。只有这一柄入鞘长剑，无拂尘、铃、符箓或其他法器。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一参考严格仅male项目色卡：低饱和设色、暖肤色与浅灰底的协调关系，已实际view。没有任何本人身份参考图；不得借基线人物的脸型、眉眼鼻唇、头发、胡须、年龄、体型、姿势或衣服。尤其不沿用基线残破衣边、碎墨或纸感；人物完整写实由文字定义。保持原manifest实际状态，不把基线审批转移给本角色。 第二参考仅背景：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，已实际view。完全忽略图中王语嫣的脸、年龄、体型、头倾、手势、头发及白青裙装，墨迹与纸纹不得侵入人物、衣料、器物。

背景与交付：第二图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。默认一张独立候选经执行者实际自查；所有输出仍为candidate，待用户最终审核，不自动approved。

事实与原创边界：当前已核实原版游戏头像资料没有此人的可靠配对；本图为依当前角色稿而作的独立具体面容设计，不冒充原版头像、演员脸或既有身份基线。单候选须保持同一组面貌关系。 原著道人、长剑、年龄语词、须发与剑形制的指定版终校待考；mainrole明确名录中年优先，网络老道称呼不自动改为老年。 狭颊瘦长脸、小圆下巴、细直眉与略近眼距、细长鼻和薄唇、青灰道袍与素小冠为本次原创美术补足。

完整排除项：不要清俗家辫发、僧人光头、华丽道教法衣、八卦发光符、拂尘、铃或武当徽记；不要把中年道人画成满脸八旬皱纹、满头白发或弓背老人。不要穿胸枪、血伤、尸身、被夺衣或误杀后的状态；不要双剑、裸剑、弯鞘、短鞘、以衣袖吞手或剑鞘藏进衣中。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、演员照片或台标。

FINAL POSE CHECK: FRONT-FACING 刘乘风 / npc_liurenfeng. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Keep this individual face and correct age, injuries and equipment; never inherit the face, body, head lean or costume from any reference.
```

## 排除项

不要清俗家辫发、僧人光头、华丽道教法衣、八卦发光符、拂尘、铃或武当徽记；不要把中年道人画成满脸八旬皱纹、满头白发或弓背老人。不要穿胸枪、血伤、尸身、被夺衣或误杀后的状态；不要双剑、裸剑、弯鞘、短鞘、以衣袖吞手或剑鞘藏进衣中。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、演员照片或台标。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_liurenfeng__ch09_prime_pursuit_base.prepared.json`。
