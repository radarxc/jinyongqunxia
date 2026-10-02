---
asset_id: por_npc_hanxiaoying__ch02_prime_base
subject_id: npc_hanxiaoying
name: 韩小莹
book: ch02_shediao
gender: female
age_variant: prime
tier: A
output: assets/default/character/female/ch02/por_npc_hanxiaoying__ch02_prime_base.png
manifest: assets/default/character/female/ch02/manifest.yaml
references:
- path: generated_images/exec-65c020e0-9394-454f-a8ff-40986369a3f6.png
  use: 第一输入为本次韩小莹本人初始候选1的原始PNG，只保留已建立的原创五官骨相与整体身份；该图已被独立实际审查判定严重年轻化，必须明显成熟至约四十岁师父，不能保持青年皮肤和眼睑颊口颈部年龄。不是游戏或影视本人，不证明原著确貌。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 韩小莹 · 人物写实修正

## 人物与阶段

- subject_id：npc_hanxiaoying
- book：ch02_shediao
- gender：female
- age_variant：prime

## 本轮人物写实规范

独立实际视觉审查确认初始1明显年轻化，唯一必要补图2纠正约四十岁师父阶段；保留原先1张政策和两次实际请求，candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_hanxiaoying__ch02_prime_base/prompt-66c3db18bbb91f9fe5d4db521384ac27bbc26bedd177545226e16a2793bbf48a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 韩小莹. This is the ONE necessary AGE CORRECTION after candidate 1 failed independent visual review. Image 1 is her own original project-generated candidate, NOT a TV actor or original-game portrait. Preserve her own facial proportions and recognizable identity, but make her unmistakably a MATURE WOMAN AROUND FORTY, an experienced teacher who has raised and trained Guo Jing for many years. Reconstruct age in eyelids, cheek volume, mouth corners, jaw and neck; do not merely draw wrinkles onto the same twenty-year-old face. Image 2 supplies ONLY pale ink-wash background and ZERO identity. The younger age and high hair bun in image 1 must NOT be copied. This is candidate 2, not another initial request.

身份与阶段：韩小莹（npc_hanxiaoying），《射雕英雄传》ch02_shediao。越女剑韩小莹，江南七怪之一，成年师父随郭靖南归、桃花岛事变前

年龄与体型：壮年女性，本次在原定三十至四十余岁范围内选择约四十岁视觉设计，不冒称原著确岁。必须明显呈现成熟师父而非二十岁青年女侠：自然较厚上眼睑、轻微眼下软组织、眼角和鼻唇处浅年龄折痕，面颊成熟的重量与略下移的圆润体积，口角沉静有岁月感、自然下颌和颈部细纹。整体皮肤仍完整健康美观，绝不用污点裂纹或夸张衰老；黑发为主，不靠染白头发冒充年龄。修长结实肩臂与实际成年腰胯，目光温和坚毅、阅历清楚。

本人面容保留第一图原创骨相、眼鼻唇相对位置并作整体年龄成熟：独立较长鹅蛋脸，颧骨柔和而有骨点，颊面有适龄体积、圆而不尖的下巴；清楚细长的眉形外端略收，平静细长杏眼、水平眼线，眼尾与颊口保留轻细年龄纹。鼻梁中等长且自然挺直，鼻头较窄圆润，唇形薄厚适中、下唇略丰满，闭唇温和坚毅。额部和颈部也保留成年师者年龄关系，不复制女性基线的少女脸、肤色滤镜或服饰。

服制与发式：宋代汉式湖青交领右衽窄袖长衫，穿着者左襟压右襟；内穿遮蔽胸颈的中衣，灰白齐腰长裙与实用布腰带、平底布鞋，行走开量自然无露腿高衩。黑发整齐收于后脑髻，用一支素木簪固定，发丝和整幅衣料连续完整、不透明，不飘散碎带。

正面姿态与器物：正面全身、肩颈自然舒展、头竖直、双眼水平，温和坚毅直视前方，双足稳站。本人左手低位握住一柄完整入鞘的普通中式长剑鞘口下方，使整剑垂在本人左身体外侧，右手自然垂落。小型横剑格、直柄、足长青灰鞘同轴；不露刃，鞘尾、双手及鞋履完整入画。只此一剑一鞘，不是春秋阿青，不附竹棒白猿或青铜古剑。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。初始候选1已实际完成且独立判定重大年龄阶段错误，本次仅补这一张必要候选2；保留两张原始记录。仍按快速宽松尺度，只纠正成熟年龄，不为细手指、微装备或轻微角度再追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本图身份与阶段依当前本地角色稿、名录、story 和 chapter；项目主线1217–1227、楔子1199为玩法推定，回溯人物依其专门阶段。所有具体五官、服色选款、器物形制细部和静立展示都是原创美术落实；原稿待考照留，不冒称已逐字终校小说或精确历史复原。当前已下载原版 game 语料与本机1983射雕影视参考没有可靠本人图，按本轮明确配角授权采用文字原创脸，不冒充1983演员本人、不拿别人头像代替，也不声称该角色在所有游戏版本从无头像。第一输入现为本次本人初始候选，仅用于同人骨相和构图连续性，其青年年龄已被独立判失败；第二输入仍仅背景。原项目基线candidate/approved状态不改。 南归成年师父阶段与名录壮年一致，三十至四十余岁为美术观感而非确岁；不把首次登场年龄套到十八年后。 脸形细部、湖青配色、剑鞘和持剑左手方案属原创；不画桃花岛自尽伤口，不预先宣称改命成功。

参考边界：第一输入为本次韩小莹本人初始候选1的原始PNG，只保留已建立的原创五官骨相与整体身份；该图已被独立实际审查判定严重年轻化，必须明显成熟至约四十岁师父，不能保持青年皮肤和眼睑颊口颈部年龄。不是游戏或影视本人，不证明原著确貌。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要冒充1983翁美玲版演员本人，不借其他演员、其他游戏角色或第二输入参考的脸与身体；第一图为本人初始原创候选，只保留骨相而必须纠正青年年龄。不要剧照拼贴、具体画作复制或画师姓名风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、前景花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要画成少女、幼态弟子或春秋越女阿青；不要竹棒、白猿、青铜古剑、露腿高开衩、轻纱透体，也不画桃花岛自尽伤口。 不要 head tilt、Dutch angle、头歪向肩、倾斜眼线、低头藏眼、抬下巴、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅在背景，人物皮肤、衣料、毛发与器物完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, body and narrative stage; ignore reference poses.

FINAL AGE CHECK: Han Xiaoying must read clearly as a mature woman around forty, NOT the young woman in candidate 1. Mature eyelids, eye-under-cheek transitions, cheek and mouth weight, jaw and neck must agree. Healthy beautiful skin with natural mature structure, not wrinkle stickers. Frontal upright head and complete full body, one sheathed sword. Only this single necessary supplement 2.
```

## 排除项

不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要冒充1983翁美玲版演员本人，不借其他演员、其他游戏角色或第二输入参考的脸与身体；第一图为本人初始原创候选，只保留骨相而必须纠正青年年龄。不要剧照拼贴、具体画作复制或画师姓名风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、前景花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要画成少女、幼态弟子或春秋越女阿青；不要竹棒、白猿、青铜古剑、露腿高开衩、轻纱透体，也不画桃花岛自尽伤口。 不要 head tilt、Dutch angle、头歪向肩、倾斜眼线、低头藏眼、抬下巴、侧脸回眸或倾斜镜头。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞撕裂、碎布条、密集噪点或过密细皱。水墨仅在背景，人物皮肤、衣料、毛发与器物完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_hanxiaoying__ch02_prime_base.prepared.json`。
