---
asset_id: por_npc_chongxu__ch05_elder_base
subject_id: npc_chongxu
name: 冲虚道长
book: ch05_xiaoao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch05/por_npc_chongxu__ch05_elder_base.png
manifest: assets/default/character/male/ch05/manifest.yaml
references:
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 冲虚道长 · 人物写实修正

## 人物与阶段

- subject_id：npc_chongxu
- book：ch05_xiaoao
- gender：male
- age_variant：elder

## 本轮人物写实规范

首次文本原创本人脸；正面头直眼水平，完整写实人物与浅水墨背景。按 FAST 先1候选，清晰正面可辨即用；只有严重身份/结构/不可读才补，轻微手指装备角度集中记录，原始PNG native2:3，仍candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_chongxu__ch05_elder_base/prompt-4140abf82f924a59e5868d8e0bd709f6c4470c5041878b194289daa05788614d.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 冲虚道长. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Do not claim this original face is a verified original-game portrait or actor likeness.

身份与阶段：冲虚道长（npc_chongxu），《笑傲江湖》ch05_xiaoao。武当掌门，太极试剑至少林协调时期，未至终局归还真武剑

年龄与体型：老年武当道人，身形清瘦轻健、真实老年面部和手颈纹理；保持自然身量与松沉肩肘，不返老还童、不画衰弱濒死。

原创本人面容：独立窄长脸与偏高额头，眉弓不重、灰白细眉平缓外伸，柔和深目、眼窝周围细纹但眼神清楚。鼻梁细而长直、鼻翼收窄，脸颊清瘦、颧骨柔和可辨，嘴形较小、上唇薄、下唇自然；稀疏灰白长须垂至胸上，须根与下巴完整相连。下颌细长而非网红尖脸，淡泊自持的水平正视。与方证矮瘦剃发僧、曲洋较饱满长椭圆脸和灰黑浓长须明确区分。

服制与发式：项目明中叶约1523–1525的原创定年服制：灰青完整道袍、白灰内领、普通布绦与布鞋，交领右衽、穿着者左襟压右襟。黑白相间头发束小道髻，以低矮素道冠固定，不强套世俗青年网巾；道袍少量宽缓垂褶、缝线连贯不透明，无符字、八卦纹或夸张冠饰，不剃额留清辫。

正面姿态与器物：正面全身稳站、头颈自然竖直、双眼水平，肩肘松沉而身体不斜转；圆融通过放松体态与眼神表达。一柄普通中式直身双刃剑完整入足长直鞘，腰侧挂带真实承重，剑柄、小横剑格与鞘口同轴，仅有克制短灰布穗。本人左手轻扶鞘口下方，右手自然垂下；头冠、胡须、双手足和鞘尾全部入画。没有真武剑、倚天剑或拂尘，太极剑是武学名称而非发光阴阳武器。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份与阶段依当前本地角色稿、名录、story 和 chapter；项目服制按明中叶约1523–1525原创定年，不声称原著明示朝代；人物阶段依本稿专门边界。所有具体五官、服色选款、器物形制细部和静立展示都是原创美术落实；原稿待考照留，不冒称已逐字终校小说或精确历史复原。当前已下载原版 game 语料与本机已登记影视参考没有可靠本人图，按本轮明确配角授权采用文字原创脸，不冒充原版游戏或演员本人、不拿别人头像代替，也不声称该角色在所有游戏版本从无头像。两张输入都不是本人身份参考，保留原项目基线 candidate/approved 状态。 太极试剑至少林协调阶段，尾声经剑归还未发生，不提前赋予真武剑。 清瘦、须长、道袍颜色需指定版本终校；此处具体五官、灰青衣款与静立持法属原创，不冒充原版游戏人物脸。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、伪字、题字、题款、签名、印章、标签、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件；本配角没有可靠本人身份图输入，明确文字原创面孔；不要冒充原版游戏脸或演员本人，不借其他游戏角色、演员或基线脸；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、低幼脸、统一网红锥子脸、偶像磨皮、丰唇滤镜、油亮塑料皮肤、摄影写真或三维模型渲染感；不要日韩动漫风、和服、日式前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要朝代与族群混搭、清式剃额辫发、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、无身份依据的官服补子与飞鱼服；汉式交领不要左衽，不要水平镜像；不要日本刀、日式圆盘刀镡、菱形缠柄、无依据的名器、发光兵器、龙形能量、仙法法阵或光翼；不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、直剑弯折断裂、容不下剑刃的短鞘；不要大面积撕裂破衣、血腥特写、裸露、透明服装、色情化、丑化或畸形健美肌肉；不要复杂场景、额外人物、分格、多视图、头像特写框、广角畸变、强逆光、强烈泛光或遮挡结构的雾气；不要裁断头顶、手指、双足、兵器端点与衣带。本人物另禁真武剑、倚天剑、太极发光法阵、浮空道士、仙鹤、无依据拂尘、少林袈裟、满身八卦符字和年轻偶像脸。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, body, impairment and narrative stage; do not straighten a described hunchback; ignore reference poses.
```

## 排除项

不要文字、伪字、题字、题款、签名、印章、标签、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、塑料饰品、数码物件；本配角没有可靠本人身份图输入，明确文字原创面孔；不要冒充原版游戏脸或演员本人，不借其他游戏角色、演员或基线脸；不复制具体画作或剧照，不使用画师姓名作风格词；不要动漫大眼、低幼脸、统一网红锥子脸、偶像磨皮、丰唇滤镜、油亮塑料皮肤、摄影写真或三维模型渲染感；不要日韩动漫风、和服、日式前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要朝代与族群混搭、清式剃额辫发、旗装、马蹄袖、大拉翅、唐式齐胸襦裙、无身份依据的官服补子与飞鱼服；汉式交领不要左衽，不要水平镜像；不要日本刀、日式圆盘刀镡、菱形缠柄、无依据的名器、发光兵器、龙形能量、仙法法阵或光翼；不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、直剑弯折断裂、容不下剑刃的短鞘；不要大面积撕裂破衣、血腥特写、裸露、透明服装、色情化、丑化或畸形健美肌肉；不要复杂场景、额外人物、分格、多视图、头像特写框、广角畸变、强逆光、强烈泛光或遮挡结构的雾气；不要裁断头顶、手指、双足、兵器端点与衣带。本人物另禁真武剑、倚天剑、太极发光法阵、浮空道士、仙鹤、无依据拂尘、少林袈裟、满身八卦符字和年轻偶像脸。。不要 head tilt、Dutch angle、头向肩侧歪、倾斜眼线、低头藏眼、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅背景，人物皮肤、衣料、毛发和器物完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_chongxu__ch05_elder_base.prepared.json`。
