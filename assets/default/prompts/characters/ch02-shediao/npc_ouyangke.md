---
asset_id: por_npc_ouyangke__ch02_youth_uninjured_base
subject_id: npc_ouyangke
name: 欧阳克
book: ch02_shediao
gender: male
age_variant: youth
tier: A
output: assets/default/character/male/ch02/por_npc_ouyangke__ch02_youth_uninjured_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/ouyangke_1983_huangyuncai_sina2020.jpg
  use: 第一且唯一身份参考：1983 TVB翁美玲版射雕，黄允材饰欧阳克，已实际view；只取成年男子长椭圆脸、较宽额头、平缓略起峰眉、紧凑眉眼、细长眼型、挺直有体积鼻梁、闭唇与颊口关系。不要照抄剧照侧视、戏妆、银色立领戏服、珠冠或暗背景；不以图推断具体年龄或伤前集数。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二仅背景，已实际view：暖浅灰不透明纸底、极淡低对比水墨远山、薄雾和留白。完全忽略图中女性的面容、年龄、身体、倾头、发式、手势、白青纱裙、饰物、花枝和亭阁；纸纹墨痕不得进入人物、衣料或折扇。
status: ready
realism_revision: user_identity_pose_20261001
---

# 欧阳克 · 人物写实修正

## 人物与阶段

- subject_id：npc_ouyangke
- book：ch02_shediao
- gender：male
- age_variant：youth

## 本轮人物写实规范

本人1983黄允材欧阳克脸第一、用户水墨第二仅背景；成年青年末段、正面头直、双腿健全、原创灰白右衽旅袍与一把素白折扇；完整写实人物，先1候选仍candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_ouyangke__ch02_youth_uninjured_base/prompt-67a9d87cbc76458f113eafd6310f825f8f78b368a254c1c84e68582d501ad4ff.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL; both eyes HORIZONTALLY LEVEL. Camera level, chin neutral, gaze forward, shoulders relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose; preserve natural facial asymmetry without tilting the head.

Create a beautiful REALISTIC Chinese wuxia full-body illustration of 欧阳克 / OUYANG KE (npc_ouyangke), ch02_shediao. Image 1 is the ONLY facial identity: 黄允材 as 欧阳克 in the 1983 TVB 射雕英雄传 with 翁美玲. Image 2 provides ONLY the pale ink-wash background. Never mix either reference's clothing or pose into this figure. The second image provides no face, body, gender, age, hairstyle or costume.

身份与阶段：白驼山少主，赵王府至桃花岛求亲的基础阶段，严格在第21回巨岩伤腿之前。双腿与双足完整健全、正常承重站立，无伤后绷带、轮椅、拐杖或瘫坐。目录青年与旧稿所记年龄措辞存在待考差异，保留当前asset的youth检索键；视觉采用角色稿的成年青年末段观感，明确成年，不画少年，不锁具体岁数，不套演员现实年龄。

本人面容：保持第一图黄允材版欧阳克可辨的长椭圆脸、较宽额部、两颊真实体积和收窄而圆钝的下巴。黑眉走向平缓、略有眉峰，眉眼关系紧凑，眼型细长且上睑线明确；鼻梁挺直有体积，鼻尖自然饱满，鼻翼不过窄。闭唇，上唇较薄、下唇自然，嘴角与颊口小凹陷克制呈现。脸清楚、眼睛正向观者，神态自持略自负，不以猥琐狞笑或丑化表达性格。保留本人真实五官关系与自然肤质，不复制低清压缩像素、电视剧妆线和色偏；不额外沿用旧稿原创精修短髭。身形修长但为自然成人，不强套头身数字。

服制与发式：沿当前角色稿的原创白驼少主行旅方向，完整灰白交领右衽长袍、米白窄袖内衣、内着灰白长裤、细皮腰带与白灰软靴。穿着者左襟压右襟，向本人右侧合拢；胸腹与四肢完整遮蔽，袍摆内有真实腿脚结构，不把裤腿融合。衣缘仅少量暗色几何织纹，整体克制清雅，不堆珠宝。黑发整齐收束为髻，以素白小发冠收束，发冠形制与束髻细节是美术落实，尚非已核原著发式。不要复制第一图镶饰珠冠和银光立领戏服，不换成背景图的女性散发纱裙。

姿态与器物：单人正面自然稳站，头居身体中轴、双眼水平，两脚自然分开并都踏地。右手在腹前较低处持唯一一把半开的白色素面折扇，手指握于扇根，扇骨自同一轴点连贯展开，扇面没有文字或图画；不遮脸、不顶胸。左手在左侧腰旁自然放松，完整手掌从袖口露出；双臂、双手、双腿、两足可辨。扇式、持法与静立姿态属美术补足。不加欧阳锋的蛇杖、蛇群、白衣女侍、第二把扇或额外兵器，不画求亲现场。

人物画法：美观精细的写实国风人物插画。皮肤、头发、双手、身体、衣料与折扇都是完整、坚实、连续的体积；五官精细自然，真实柔和肌理，衣料有厚度、连续裁片、清楚剪裁和少量宽缓受力褶皱。柔和左上漫射光，低饱和设色与连贯明暗，干净可读轮廓；细腻手绘而非照片、截图或3D塑料。人物本体没有破布、碎墨、飞白缺块、纸屑和透纸纹。水墨仅在人物之外。

背景与交付：第二图只取暖浅灰不透明纸底、极淡低对比水墨远山、薄雾和留白；不取人物、亭阁、花枝或衣装，背景纸纹不得侵入人物、衣料与扇。少量脚下接触阴影，人物之外保持安静，不画具体地点或其他人。原生2:3竖幅，单人单视图完整全身；头顶发冠、双手、双足、袍摆与全部扇端完整入画，四周自然留净空，不以固定占高或头身数字拉长人体。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并准确记录，保存原始PNG字节及元数据，不裁切、放大、旋转或重编码。

本轮先生成1张独立候选并实际自查。基本清晰、正面端正、身份阶段可辨且无重大结构问题即可保存；只在明显身份错误、严重结构问题或不可读时另行补图，不为细手指、微装备或轻微角度反复追加。输出始终candidate待用户最终审核，不自动approved。

事实边界：身份与未伤腿阶段来自当前role、catalog及story；项目约1217–1227定年与楔子1199保留本地待考口径，不当作小说精确公历。原著年龄、白衣折扇措辞、发式与具体回目页码仍待指定修订版逐字终校，不声称本次已完成新考据。主参考图只确认1983演员本人面容，不证明拍摄集数或伤前剧情窗口。服装裁制、束髻发冠、无额外短髭、静态持扇与面部细节补全是明确美术处理；旧原创脸和禁演员脸已由用户逐人影视身份授权覆盖。荒岛具体地望在story待考，当前画像不设置具体岛景。chapters仍残留欧阳克ID待补文字，catalog与story已登记npc_ouyangke，以当前role和INDEX为准，不回写上游。

参考顺序与边界：第一且唯一身份参考：1983 TVB翁美玲版射雕，黄允材饰欧阳克，已实际view；只取成年男子长椭圆脸、较宽额头、平缓略起峰眉、紧凑眉眼、细长眼型、挺直有体积鼻梁、闭唇与颊口关系。不要照抄剧照侧视、戏妆、银色立领戏服、珠冠或暗背景；不以图推断具体年龄或伤前集数。 第二仅背景，已实际view：暖浅灰不透明纸底、极淡低对比水墨远山、薄雾和留白。完全忽略图中女性的面容、年龄、身体、倾头、发式、手势、白青纱裙、饰物、花枝和亭阁；纸纹墨痕不得进入人物、衣料或折扇。

完整排除项：不要 head tilt、Dutch angle、头向肩侧歪、双眼高低倾斜、歪镜头、仰头抬下巴、低头藏眼、明显侧脸、侧向目光、回眸或单肩高耸。不要把欧阳克画成欧阳锋、杨康或其他演员，不借第二参考的女性脸、体型、发际、衣服、饰物、手势或倾头；不要统一偶像脸、少年娃娃脸、网红尖下巴、动漫大眼、夸张浓妆、塑料磨皮、照片截图、三维模型或换头拼贴。不要无据锁定三十五六岁或按演员现实年龄改阶段，不画未成年或白发老者，不额外套用旧原创精修短髭。不要巨岩伤后的腿伤、绷带、轮椅、拐杖、缺腿、瘫坐、死亡状态；不要蛇杖、蛇群、女侍、艳情动作、猥琐丑化或裸露透衣。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、塑料饰品；不要清式剃额长辫、马蹄袖、旗装、大拉翅、明代网巾或官服补子、唐式齐胸裙、无据民族服饰拼装；交领不要左衽、不要水平镜像。不要日式刀具、圆盘镡、和服前结宽腰带、欧式奇幻甲、仙侠冕冠、发光兵器、光翼、法阵、龙形能量或粒子特效。不要碎墨人物、飞白缺块、破布条、撕裂衣角、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、过密碎皱与噪点。不要多肢多指、缺手缺足、错接手腕、粘连手指、手物融合、扇骨断裂、悬空折扇、失重腰带、衣袖吞手、裁断头顶双足扇端。不要额外人物、拼图分格、多视角、头像特写框、剧情场景、建筑、花枝、文字、伪字、扇面书画、题款、印章、签名、logo或新增装饰水印；保留工具原有溯源标识与元数据。

FINAL POSE CHECK: OUYANG KE is FRONT-FACING. Forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck upright, chin neutral, gaze forward, level camera. NO head tilt, NO Dutch angle. Preserve the verified 1983 黄允材 facial identity and this role's adult age impression, full uninjured legs and original project costume.
```

## 排除项

不要 head tilt、Dutch angle、头向肩侧歪、双眼高低倾斜、歪镜头、仰头抬下巴、低头藏眼、明显侧脸、侧向目光、回眸或单肩高耸。不要把欧阳克画成欧阳锋、杨康或其他演员，不借第二参考的女性脸、体型、发际、衣服、饰物、手势或倾头；不要统一偶像脸、少年娃娃脸、网红尖下巴、动漫大眼、夸张浓妆、塑料磨皮、照片截图、三维模型或换头拼贴。不要无据锁定三十五六岁或按演员现实年龄改阶段，不画未成年或白发老者，不额外套用旧原创精修短髭。不要巨岩伤后的腿伤、绷带、轮椅、拐杖、缺腿、瘫坐、死亡状态；不要蛇杖、蛇群、女侍、艳情动作、猥琐丑化或裸露透衣。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、塑料饰品；不要清式剃额长辫、马蹄袖、旗装、大拉翅、明代网巾或官服补子、唐式齐胸裙、无据民族服饰拼装；交领不要左衽、不要水平镜像。不要日式刀具、圆盘镡、和服前结宽腰带、欧式奇幻甲、仙侠冕冠、发光兵器、光翼、法阵、龙形能量或粒子特效。不要碎墨人物、飞白缺块、破布条、撕裂衣角、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、过密碎皱与噪点。不要多肢多指、缺手缺足、错接手腕、粘连手指、手物融合、扇骨断裂、悬空折扇、失重腰带、衣袖吞手、裁断头顶双足扇端。不要额外人物、拼图分格、多视角、头像特写框、剧情场景、建筑、花枝、文字、伪字、扇面书画、题款、印章、签名、logo或新增装饰水印；保留工具原有溯源标识与元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_ouyangke__ch02_youth_uninjured_base.prepared.json`。
