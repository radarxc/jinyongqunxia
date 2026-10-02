---
asset_id: por_npc_gongsunzhi__ch03_prime_twoeyes_base
subject_id: npc_gongsunzhi
name: 公孙止
book: ch03_shendiao
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch03/por_npc_gongsunzhi__ch03_prime_twoeyes_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shendiao/gongsunzhi_1995_zhangyi_sina2018_oneeye.jpg
  use: 第一且唯一本人身份参考：1995 TVB古天乐/李若彤版张翼饰公孙止，actual view已看，来源条件PASS仅可见面容。源照本人右眼（画面左）被眼罩全遮，只能核左眉左眼与可见额鼻颧颊口颏；右眼形状和完整双眼关系均未核实。以可见宏观面部身份为锚，按当前prime_twoeyes阶段艺术补全正常右眼；不宣称像素复原、不机械镜像左眼。禁止传递眼罩/伤眼/仰头开口/无长须/影视衣装/字幕/背景。原照原字节不改。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二仅用户背景参考，已实际view：只取暖浅灰不透明纸底、极浅淡青灰远山水墨和留白。完全忽略女性面容、青年体型、发式发饰、纱裙、手势与歪头；水墨与纸纹停在人物和刀剑轮廓外。
status: ready
realism_revision: user_identity_pose_20261001
---

# 公孙止 · 人物写实修正

## 人物与阶段

- subject_id：npc_gongsunzhi
- book：ch03_shendiao
- gender：male
- age_variant：prime

## 本轮人物写实规范

1995张翼可见本人面容条件参考；伤前双目健全优先，未见右眼艺术补全不称已核。正面头直、中年高而不壮、修整深色长须、墨绿右衽袍；右锯齿金单刃刀左黑直双刃剑；完整写实人物、水墨仅背景，先1candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_gongsunzhi__ch03_prime_twoeyes_base/prompt-40792cadc8ddb4f267d920d3bc2e0a367f9a134a50c18765f957220950114396.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE AND STAGE ARE PRIMARY REQUIREMENTS: ONE FRONT-FACING full-body middle-aged man, with TWO INTACT HEALTHY EYES. Head and neck naturally UPRIGHT, forehead–nose–chin centerline VERTICAL, both eyes LEVEL and looking forward, chin neutral, camera level. NO head tilt and NO Dutch angle. The injured eye and pose in Image 1 must NOT carry into this earlier-stage original illustration.

Create one refined REALISTIC wuxia full-body illustration of 公孙止 / GONGSUN ZHI, npc_gongsunzhi, ch03_shendiao. Image 1 provides the visible facial identity of 张翼 as 公孙止 in the 1995 TVB 古天乐/李若彤 version of 神雕侠侣. Image 2 provides ONLY the pale ink-wash BACKGROUND. The reference identity is conditionally verified only for the face parts actually visible; it is not a verified two-eyed frontal portrait.

身份与阶段：中年绝情谷主，婚局揭露前后、伤眼之前的持刀剑常态。严格按prime_twoeyes：双眼完整、正常、清楚可见，没有眼罩、眼罩绳、绷带、疤痕或血污。prime为本项目中年阶段检索键，不锁具体岁数，不套演员现实年龄。身形高而不壮，体态端肃、表情客气但疏冷，含蓄警觉与算计，不以妖魔脸或夸张反派姿态表达性格。不是婚服合影、后期独眼或临终状态。

条件身份处理：参考中本人右眼（画面左）全被黑眼罩覆盖，右眼轮廓、双眼精确距离及成对关系都没有可靠像素证据。只从已见额部与发际轮廓、本人左眉左眼、鼻梁鼻翼、颧颊、唇口及颏下颌建立基本本人辨识。按正常人体结构与已见面部总体比例，自然艺术补全一只健全右眼，保留合理不对称；不机械复制或镜像左眼，不声称补全部分是精确演员肖像复原。目标是身份基本可辨且满足本项目无伤阶段，不做照片修复，源图片保持原字节不变。

面容与须发：维持张翼版可见的宽额、浓直左眉与较细长的可见左眼关系、有体积的面中、明确鼻梁鼻翼、两颊与下颌轮廓及可见唇形。不要用旧稿泛化窄长脸薄唇把本人面容替换成同质脸；转正面时保持自然骨相，不复制仰头开口造成的透视。表情闭口收敛，肤色自然，保留中年眼角口周真实纹理。按当前role增加修整的深色长须，整齐自然从颏部垂落，口唇仍清楚，不照搬源图的无长须外观。长须是本阶段既定视觉选择，来源图本身没有提供长须证据。黑发整齐高髻、素簪收束，发式整理是role美术方案，不复制影视头饰。

服饰：南宋隐居谷主的墨绿右衽长袍，浅灰内领，深褐窄腰带，深色裤装与深布靴。汉式交领为穿着者左襟压右襟、向本人右侧闭合，领口叠层可追踪，不水平镜像。袍料完整、厚实而不透明，胸腹与双腿完整遮蔽，肩腰袖肘有少量宽缓受力褶，长衣、内裤与脚的结构连贯。仅低调细边纹，不戴冠冕、不加官服补子，不以婚礼红或影视紫衣替代墨绿。色彩、剪裁、髻簪及深布靴为项目艺术补足，不冒称小说固定制服或实物复原。

兵器数量和结构：恰好一柄金刀与一柄黑剑，即成对eq_jindaoheijian。本人右手稳握锯齿金刀的刀柄；金刀是微弧的单刃刀，金色偏旧金，有清楚克制的锯齿特征，刀背与单一刃侧可区分，不是电锯也不是直剑。本人左手稳握黑色直剑的剑柄；剑身直、两侧剑刃与中脊结构清楚，深色金属有克制反光，绝不带锯齿。两兵器分别在身体两侧斜向下，双臂略离体，刀剑互不相交、不遮面、不贴腿，握柄手指、护手、刃身和尖端连续完整可读。仅两只手各持一件，不加第三件器物；不用悬浮刀剑或特效掩盖结构。右刀左剑和当前静态持法来自role的明确艺术设计，原著固定持手与细部仍待考。

姿态与构图：正面自然站稳，头居身体中轴、头颈端正、双眼水平、肩松而平、双脚落地。仪表斯文、神情端肃，力量通过高而不壮的成人骨架与克制持械体现。原生2:3竖幅、单人单视图完整全身，头顶发髻、双手、双足、衣摆、金刀尖、黑剑尖全部入画并留自然边距；不按固定7.5头身或88–92%占高拉伸人物。

画法与背景：人物本体美观写实，面部和皮肤真实细腻，毛发、衣料、腰带、手指与刀剑都具有完整连续的体积，轮廓干净清楚。柔和左上漫射光，低饱和墨绿、炭黑、少量旧金，连续自然明暗；不把碎墨、飞白、纸屑或透纸纹用于人体和衣料。背景只取第二图暖浅灰不透明底、极浅淡青灰远山水墨和充分留白、脚下浅接触阴影，纸纹水墨停在人物器物之外；不传递第二图女性面容体型、纱裙、发饰、姿势、倾头、亭阁或花枝。

交付：目标2048×3072不透明PNG，接受工具真实原生尺寸并如实登记，保留原始PNG字节和元数据，不裁切、放大、修复或重编码。本轮先1张候选，仍为candidate，实际查看身份基本可辨、双目正常、头正、刀剑和人体无重大结构问题后再由负责方按流程处理，不自动approved、不假称双候选比较。

事实边界：身份、阶段与伤前双好眼以当前role/INDEX为硬约束，catalog和story支持中年谷主、婚局与兵刃冲突；装备表明确锯齿金刀黑剑成对。胡须、伤眼精确时序与持手原文未做指定修订版逐字终校。单刃微弧/双刃直剑、墨绿服装、发髻、长须和左右持法按当前role视觉要求落实，未核细节不升级为已证原著事实。参考CONDITIONAL_PASS_IDENTITY_ONLY只涵盖可见本人身份；右眼艺术重构和长须不来自原图证据。原图及旧来源审计保持不变，当前source修正只涉及DOM邻接记录。

完整排除项：不要独眼、眼罩、眼罩细绳、绷带、眼部伤疤、半脸血污、闭合缺失右眼、瞳孔发白或伤后失明；不要把左眼机械镜像成像素相同的右眼，也不要把艺术补全当源照已核细节。不要head tilt、Dutch angle、头向肩歪、仰头开口、低头藏眼、斜向面中线、双眼高低不齐、明显侧脸侧视、回眸、单肩耸高或倾斜镜头。不要照搬剧照光面无长须脸、紫色影视衣装、字幕文字、座椅靠背、树林或半身裁幅；不要其他版本演员、公孙绿萼、杨过或萧峰面容，不借背景女性脸体衣姿。不要统一网红锥子脸、少年娃娃脸、动漫大眼、浓妆磨皮、夸张恶人脸、僵尸皮肤、魁梧巨汉、肥胖体型、现代演员晚年照片或锁定未经核实的具体岁数。不要红色新郎婚服、婚礼、小龙女同框、情花海或受伤剧情；不要皇族冠冕、官服补子、无据权力标志。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料配件、日式服制和刀具、和服前结腰带、圆盘刀镡、欧式奇幻甲、明代网巾、清式剃额长辫、马蹄袖、旗装；汉式交领不要左衽或水平镜像。不要透明衣物、裸胸裸腿、色情化、血腥伤口、碎布撕裂或无据污渍。不要两柄同色直剑、双刀、双剑、锯齿黑剑、金刀无锯齿、巨型电锯、两件都画成金色或黑色、长剑弯曲断裂、刀剑穿身、刀尖剑尖出画、悬浮兵器、交叉遮脸、第三把武器或第三只手。不要多肢多指、缺手缺足、错接手腕、手物融合、衣袖吞手、悬浮脚、刀柄剑柄无连接、锋刃贴手或不合理握刃。不要发光兵器、龙形能量、光翼、法阵、粒子特效、强烈泛光或夸张武打残影。不要碎墨人物、飞白断裂、纸屑侵蚀、纸纹透肤透衣、白斑、斑驳模糊脸、过密乱褶、照片截图、换头拼贴或三维塑料。不要多人、分身、分格、多视图、头像框、复杂场景、花枝建筑、文字、伪字、题款、印章、签名、logo或新增装饰水印；保留工具自带溯源标识和元数据。

FINAL CHECK: GONGSUN ZHI is FRONT-FACING, with TWO HEALTHY NORMAL EYES, no eyepatch or injuries. UPRIGHT head and neck, VERTICAL facial centerline, LEVEL eyes, neutral chin, complete whole body. Keep the visible 1995 张翼 identity anchors; the hidden right eye is an artistic stage reconstruction, not verified source detail. Neat dark long beard, dark green robe, RIGHT HAND ONE SERRATED GOLD SINGLE-EDGED SABER, LEFT HAND ONE BLACK STRAIGHT DOUBLE-EDGED SWORD. NO head tilt, NO Dutch angle. ONE initial candidate.
```

## 排除项

不要独眼、眼罩、眼罩细绳、绷带、眼部伤疤、半脸血污、闭合缺失右眼、瞳孔发白或伤后失明；不要把左眼机械镜像成像素相同的右眼，也不要把艺术补全当源照已核细节。不要head tilt、Dutch angle、头向肩歪、仰头开口、低头藏眼、斜向面中线、双眼高低不齐、明显侧脸侧视、回眸、单肩耸高或倾斜镜头。不要照搬剧照光面无长须脸、紫色影视衣装、字幕文字、座椅靠背、树林或半身裁幅；不要其他版本演员、公孙绿萼、杨过或萧峰面容，不借背景女性脸体衣姿。不要统一网红锥子脸、少年娃娃脸、动漫大眼、浓妆磨皮、夸张恶人脸、僵尸皮肤、魁梧巨汉、肥胖体型、现代演员晚年照片或锁定未经核实的具体岁数。不要红色新郎婚服、婚礼、小龙女同框、情花海或受伤剧情；不要皇族冠冕、官服补子、无据权力标志。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料配件、日式服制和刀具、和服前结腰带、圆盘刀镡、欧式奇幻甲、明代网巾、清式剃额长辫、马蹄袖、旗装；汉式交领不要左衽或水平镜像。不要透明衣物、裸胸裸腿、色情化、血腥伤口、碎布撕裂或无据污渍。不要两柄同色直剑、双刀、双剑、锯齿黑剑、金刀无锯齿、巨型电锯、两件都画成金色或黑色、长剑弯曲断裂、刀剑穿身、刀尖剑尖出画、悬浮兵器、交叉遮脸、第三把武器或第三只手。不要多肢多指、缺手缺足、错接手腕、手物融合、衣袖吞手、悬浮脚、刀柄剑柄无连接、锋刃贴手或不合理握刃。不要发光兵器、龙形能量、光翼、法阵、粒子特效、强烈泛光或夸张武打残影。不要碎墨人物、飞白断裂、纸屑侵蚀、纸纹透肤透衣、白斑、斑驳模糊脸、过密乱褶、照片截图、换头拼贴或三维塑料。不要多人、分身、分格、多视图、头像框、复杂场景、花枝建筑、文字、伪字、题款、印章、签名、logo或新增装饰水印；保留工具自带溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_gongsunzhi__ch03_prime_twoeyes_base.prepared.json`。
