---
asset_id: por_npc_zhuziliu__ch03_elder_base
subject_id: npc_zhuziliu
name: 朱子柳
book: ch03_shendiao
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch03/por_npc_zhuziliu__ch03_elder_base.png
manifest: assets/default/character/male/ch03/manifest.yaml
references:
- path: assets/default/character/male/ch02/por_npc_zhuziliu__ch02_prime_base.png
  use: 第一且唯一面部身份参考：项目已生成的朱子柳 ch02 壮年本人 PNG，同一 npc_zhuziliu，已实际查看并核原始生成文件、manifest 和 transaction 的 SHA；真实状态 candidate，非 approved。这是文字原创人物的项目图，不是1983或1995剧照，也不证明演员五官。只沿可见脸型及眉眼鼻唇关系建立跨书同人，按 ch03 中老年阶段自然老化、灰白髭须；不用参考的黑须年龄、书册、折扇、衣冠、亭树背景、磨毛衣带和细密布纹。正面头直与本阶段服装毛笔优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考用户王语嫣水墨图，仅取暖浅灰不透明纸底、极淡低对比远山、薄雾和留白；已实际查看。完全忽略女性面容、性别、年龄、身体、衣裙、发式、飘带与倾头，不复制清晰亭台和前景花枝，墨迹不侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 朱子柳 · 人物写实修正

## 人物与阶段

- subject_id：npc_zhuziliu
- book：ch03_shendiao
- gender：male
- age_variant：elder

## 本轮人物写实规范

神雕大胜关英雄大会笔扇对敌前的朱子柳；对手之扇不等于本人本图持扇，仍按 ch03 主稿右手一支普通竹管羊毫、左手空。第一输入改为已生成且实际查看的 ch02 同一 npc_zhuziliu 原创项目人物 PNG，当前 manifest 为 candidate；它提供同人面部身份，年龄、灰白髭须、月白长衫浅墨外袍、软方巾和毛笔均按 ch03 当前阶段重建，不照搬读关书册、折扇、黑须、衣装或具体亭树背景。第二输入用户王语嫣图仅作淡墨背景。本机尚无已核 1995 朱子柳本人影视图，此跨书图不是 1983 或 1995 演员复原，不关闭指定剧版参考缺口。本轮依父级明确授权采用同人候选，不取代任何已核 1995 本人图；之后若补到该版本人来源，须另审更新，不静默混脸。 正面写实全身、头颈端正、完整衣料、背景淡墨；先1个原生PNG候选，仍待最终审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zhuziliu__ch03_elder_base/prompt-ed05c2f6fb40c14cd2ff3a6463eb030dfe486dd4e57364ecf3aa345043eadc7b.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC full-body portrait for a Chinese wuxia game of 朱子柳. Image 1 is this SAME CHARACTER'S GENERATED PROJECT PORTRAIT from ch02, still a candidate, and is the sole facial identity anchor. Preserve his recognizable visible facial structure while aging him naturally into the ch03 elder stage. Image 2 supplies the pale ink background only. The first image is an original project character, not a verified television actor portrait. Current ch03 age, clothing and brush override the first image's younger stage, book and fan.

身份与阶段：朱子柳（npc_zhuziliu），《神雕侠侣》 ch03_shendiao。中老年一灯门下书生，神雕大胜关英雄大会笔扇对敌前。

年龄与体型：中老年一灯门下儒者，elder为本稿美术标签、具体岁数待考；比射雕阶段明显年长但肩背仍清瘦稳定，手指有文士与武人修为的筋力，不能青年化或病弱化。

同人面容与自然老化：第一参考为已实际查看的项目 ch02 朱子柳本人候选图，沿同一 npc_zhuziliu 的可见骨相老化。保留清瘦偏长的脸部轮廓、清楚但不过分外张的颧部、自然内收的下颌；眉形大体平直而有轻微弧度，眼裂自然偏长、眼距与鼻唇相对关系按本人图保持，鼻梁挺直、鼻尖圆收，闭合嘴形克制，神情聪慧从容。参考头巾遮住的额顶和发际不作精确还原。ch03 比 ch02 明显年长：眉须适度疏灰，眼角、额部与颊口增加自然年龄纹理，颊部略收，髭须改为修整齐的灰白色，保持同人嘴形和下颌辨识，不夸张拖地。年龄调整不换脸，不沿用参考的中年黑须成熟度；肩背仍清瘦稳健。本人图优先于旧稿未图像落实的原创面容细节。

服制与发式：南宋同时期大理文士的月白右衽长衫、浅墨外袍、窄布带与布鞋；灰黑发束齐戴朴素软方巾，非明代网巾，不着僧袍或官服。衣料完整不透明，衣缘缝线连续；只少量宽缓有重力的褶皱，不画裂纹、碎布和飞白。按本稿南宋时期地域与身份；汉式交领本人左襟压右襟，不水平镜像。全发束髻藏巾，不混清式剃额长辫、马蹄袖或明代网巾。

正面姿态与器物：完整全身正面，头颈自然端正、双眼水平、下巴中性，肩背稳而不侧转。右手执一支普通竹管羊毫毛笔，右肘略屈、握点清楚，竹管有真实节壁、软毫自然收锋，笔尖低向下、略带黑墨但不写字。左手自然垂于腰旁且空着。只有一支毛笔，没有书册、折扇、第二支笔、铁钩、钢锥判官笔或巨型画卷。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新提速要求先1张候选，基本清晰、正面端正、身份可辨即可保存；仅严重身份/结构/不可读才补，不为细手指、微装备、微角重复。每张仅一人。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：南宋理宗时期，项目约1237–1259，只用本稿当前选定阶段，不把公历当作原著明示。 身份、年龄、生命态、器物依最新本地角色/名录/剧情；原稿标记待考仍保留，未新浏览外网或声称指定版本终校。大理文士依当前主稿服制，禁混清式发服和明代网巾。具体衣色、器型细节、面部写实转译及静立姿态属于本次美术落实。神雕大胜关英雄大会笔扇对敌前的朱子柳；对手之扇不等于本人本图持扇，仍按 ch03 主稿右手一支普通竹管羊毫、左手空。第一输入改为已生成且实际查看的 ch02 同一 npc_zhuziliu 原创项目人物 PNG，当前 manifest 为 candidate；它提供同人面部身份，年龄、灰白髭须、月白长衫浅墨外袍、软方巾和毛笔均按 ch03 当前阶段重建，不照搬读关书册、折扇、黑须、衣装或具体亭树背景。第二输入用户王语嫣图仅作淡墨背景。本机尚无已核 1995 朱子柳本人影视图，此跨书图不是 1983 或 1995 演员复原，不关闭指定剧版参考缺口。本轮依父级明确授权采用同人候选，不取代任何已核 1995 本人图；之后若补到该版本人来源，须另审更新，不静默混脸。

图像输入使用边界：第一且唯一面部身份参考：项目已生成的朱子柳 ch02 壮年本人 PNG，同一 npc_zhuziliu，已实际查看并核原始生成文件、manifest 和 transaction 的 SHA；真实状态 candidate，非 approved。这是文字原创人物的项目图，不是1983或1995剧照，也不证明演员五官。只沿可见脸型及眉眼鼻唇关系建立跨书同人，按 ch03 中老年阶段自然老化、灰白髭须；不用参考的黑须年龄、书册、折扇、衣冠、亭树背景、磨毛衣带和细密布纹。正面头直与本阶段服装毛笔优先。 第二参考用户王语嫣水墨图，仅取暖浅灰不透明纸底、极淡低对比远山、薄雾和留白；已实际查看。完全忽略女性面容、性别、年龄、身体、衣裙、发式、飘带与倾头，不复制清晰亭台和前景花枝，墨迹不侵入人物。

完整排除项：不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；不要未经核对的其他人物面孔、换头拼贴或剧照构图；不把项目原创身份冒充指定版演员，不复制无关具体画作；不要动漫大眼、低幼化成人、统一网红锥子脸、丰唇滤镜、浓妆磨皮、摄影写真、三维塑料皮肤；不要裸露、透明衣料、色情化、血腥特写或恶搞丑化；不要日式服制、和服、日式刀具、圆盘刀镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、汉式交领左衽、水平镜像、悬空装备、失重衣料、手物融合、多余肢体、多指、粘连手指、错接手腕、错误增删既定身体部位、裁断头足或兵器端点；不要弯折断裂剑刃或容不下剑刃的短鞘；不要无依据的兵器、发光武器、龙形能量、光翼、法阵、粒子特效、强烈泛光；不要具体剧情场景、额外人物、分格、多视图或面部特写框；不要明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃发留辫、旗装、马蹄袖或大拉翅。 不要纯钢判官笔、巨型毛笔、银钩铁划、双笔、写出书法、卷轴伪字、文官补子、明代网巾或年轻书生脸。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从第二背景参考复制人物；不要把第一本人图的中年黑须、书册、折扇和衣冠直接搬入本阶段。

FINAL POSE CHECK: FRONT-FACING, head upright, eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt. Respect identity and age, intact skin and clothing, correct stage and props.
```

## 排除项

不要文字、汉字、伪字、题款、印章、签名、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、数码物件；不要未经核对的其他人物面孔、换头拼贴或剧照构图；不把项目原创身份冒充指定版演员，不复制无关具体画作；不要动漫大眼、低幼化成人、统一网红锥子脸、丰唇滤镜、浓妆磨皮、摄影写真、三维塑料皮肤；不要裸露、透明衣料、色情化、血腥特写或恶搞丑化；不要日式服制、和服、日式刀具、圆盘刀镡、菱形缠柄、夸张前结宽腰带、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、汉式交领左衽、水平镜像、悬空装备、失重衣料、手物融合、多余肢体、多指、粘连手指、错接手腕、错误增删既定身体部位、裁断头足或兵器端点；不要弯折断裂剑刃或容不下剑刃的短鞘；不要无依据的兵器、发光武器、龙形能量、光翼、法阵、粒子特效、强烈泛光；不要具体剧情场景、额外人物、分格、多视图或面部特写框；不要明代网巾、官服补子、唐代齐胸襦裙、明式马面裙、清式剃发留辫、旗装、马蹄袖或大拉翅。 不要纯钢判官笔、巨型毛笔、银钩铁划、双笔、写出书法、卷轴伪字、文官补子、明代网巾或年轻书生脸。 不要 head tilt、Dutch angle、歪头、抬下巴、低头藏眼、侧脸或侧身；眼线必须水平。不要人物碎墨、飞白缺块、纸纹透肤透衣、裂衣碎布、密集噪点或过密细皱；人物完整连续。不要从第二背景参考复制人物；不要把第一本人图的中年黑须、书册、折扇和衣冠直接搬入本阶段。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zhuziliu__ch03_elder_base.prepared.json`。
