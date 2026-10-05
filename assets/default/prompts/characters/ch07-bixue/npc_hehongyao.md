---
asset_id: por_npc_hehongyao__ch07_base
subject_id: npc_hehongyao
name: 何红药
book: ch07_bixue
gender: female
age_variant: prime
tier: A
output: assets/default/character/female/ch07/por_npc_hehongyao__ch07_base.png
manifest: assets/default/character/female/ch07/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 何红药 · 人物写实修正

## 人物与阶段

- subject_id：npc_hehongyao
- book：ch07_bixue
- gender：female
- age_variant：prime

## 本轮人物写实规范

五毒旧怨与京师追索、金蛇洞终局之前；旧疤是人物必要身份，不能因写实美化抹除。普通软鞭和药囊形制为美术补足，技能不转成毒气或蛇群。 正面头直眼水平，完整精细写实人物、水墨仅背景，先1个原始PNG候选待审核；轻微瑕疵不阻塞。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_hehongyao__ch07_base/prompt-d9d50c4cd479ede60deb7a4a0cab65785eff4e68feaba0beafc68bce0e63532a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 何红药. THIS IS AN ORIGINAL TEXT-DEFINED FACE for this supporting character. There is NO identity image of this person among the inputs. Image 1 supplies ONLY the corresponding gender project palette and soft painting quality; image 2 supplies ONLY pale ink-wash background. Do not copy, blend or average either reference face, age, anatomy, hairstyle, clothes, props or pose. Establish the independent written face and proper stage below.

身份与阶段：何红药（npc_hehongyao），《碧血剑》ch07_bixue。五毒教人物，夏雪宜旧怨与京师追索阶段，金蛇洞终局前。

年龄与体型：40–50岁中年女子视觉默认，确岁待考；身材清瘦筋骨完整、能自主站立，肩自然微收但头颈端正，非少女或骷髅。

原创本人面容：原创窄长脸、高而清楚的颧骨、凹瘦但仍有皮肉的双颊、窄而有力的下颌。灰黑细眉较直、眼裂偏窄深邃，眼距适中，目光执拗悲切；鼻梁细长、鼻翼正常，薄唇抿住、下巴钝窄。额头和两侧颊面有清楚已愈合的浅凹凸旧瘢痕：肤色内自然淡深差、连续完整表皮，不画血口、脓溃或纸裂；疤痕分布是原创布局，不虚构指定侧别原句。口眼颈纹适龄，不能用美化清除旧伤或以疤恶魔化。

服制与发式：明末西南江湖行旅装，褪色灰褐右衽粗布衫、暗褐长裙配内裤、素腰带、旧布鞋；黑发夹灰松收于后髻，少量散发但不遮满面部，衣边修补完整。衣物完整不透明、领胸腰腹遮蔽，剪裁和缝线清楚，少量宽缓褶有真实重力；旧衣仅以柔和材质表现，不画破洞碎布。汉式服装以本人左襟压右襟为准；满洲军政人物严格沿本稿早期剃发细辫、马蹄袖与箭衣服式，不一刀切禁辫或套汉式发髻，不水平镜像。

正面姿态与器物：双足稳落、身体主要正面，肩部保留轻收的疲惫但头直眼水平。右手低握唯一盘起的柔软鞭，手柄、盘圈和一段垂端连续清楚、鞭末完整；左手在腰侧闭合药囊旁放松，露出正常肉手与所有腕部连接。两只手均是完整肉手，无何铁手的铁钩；旧灰褐粗布衫裙修补整洁完整，黑灰后髻不遮脸。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。按最新用户提速指示先生成1张候选，每张仅一人；基本清晰、正面、人物可辨即保存，只有严重身份错误、重大结构问题或不可读才补图，不因细手指、微装备或轻微角度反复追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：书界为明末转清，项目范围1630–1645；每位仅用本稿的独立年份与生死状态。袁崇焕限1630以前生前军务追忆、皇太极不晚于1643死讯，不从鹿鼎小说或历史后世倒套本期衣冠与年龄。公历相减所得约岁不是逐日周岁或虚岁考定。人物角色、生命状态及器物按当前本地角色稿/名录/剧情；未新核外网或指定小说版本，不把原稿待考概括升级为核实事实。具体五官、衣饰选款、色彩、器物形制、伤疤布局及静立手势均为本次原创美术落实。五毒旧怨与京师追索、金蛇洞终局之前；旧疤是人物必要身份，不能因写实美化抹除。普通软鞭和药囊形制为美术补足，技能不转成毒气或蛇群。

参考边界：第一输入只为同性别项目色卡、柔和光线及精细手绘品质，已实际查看；不是本人照片或身份图，不取五官骨相、年龄、身体、发式、衣装、道具与倾头姿势。本人面孔仅由文字独立建立。参考原candidate/approved不转给新图。 第二输入已实际查看，只取暖浅灰纸底、极淡水墨远山和留白，不取参考中的女性人物、脸、身体、发型、衣裙、飘带、装饰或倾头姿势。背景墨迹不得侵入本人的皮肤、衣料和器物。

完整排除项：不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。 不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。 不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。 不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。 不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。 不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。 不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。 不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。 不要无疤少女脸、腐烂溃疡、血肉伤口、僵尸、獠牙、怪物皮肤、铁钩义肢、性感五毒教服或蛇群包围。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

FINAL POSE CHECK: FRONT-FACING, head facing forward, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Respect the described age, face, real anatomy, impairment and narrative stage; ignore reference poses.
```

## 排除项

不要文字、汉字、伪字、题款、题字、标签、签名、印章、logo 或装饰水印。 不要现代服装、拉链、腕表、运动鞋、数码物件、塑料饰品、蕾丝或高跟鞋。 不要真人演员脸、明星相貌、剧照构图、影视或游戏独创造型，不复制具体画作。 不要动漫大眼、统一网红锥子脸、丰唇滤镜、浓妆磨皮、偶像脸、塑料皮肤、摄影写真或三维模型渲染感。 不要日韩动漫风、日式服制、前结宽腰带、日式刀具、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克。 不要时代与族群混搭、错误衣襟、水平镜像、无依据的官服纹章与繁复珠宝。 不要额外人物、多视图、分格、面部特写框、裁断头足或兵器端点。 不要多肢、多指、粘连手指、错接手腕、手物融合、悬空装备、失重衣料、断裂器物或容不下兵刃的短鞘。 不要夸张健美肌肉、大面积撕裂破衣、裸露、透明衣料、色情化、血腥特写、恶搞或丑化。 不要发光兵器、龙形能量、法阵、光翼、粒子特效、浓雾遮挡、强逆光、强烈泛光、复杂场景或山水建筑。 不要无疤少女脸、腐烂溃疡、血肉伤口、僵尸、獠牙、怪物皮肤、铁钩义肢、性感五毒教服或蛇群包围。 不要 head tilt、Dutch angle、歪头、倾斜眼线、侧向目光、侧脸、侧身回眸、低头藏眼或抬下巴。不要复制任何参考的脸、年龄、体型、发式、衣装、道具或姿势。不要人物飞白缺块、墨斑侵蚀、纸纹透肤透衣、破洞、撕裂衣摆、碎布条、密集噪点或过密细皱；皮肤、衣料、伤疤和器物必须完整连续。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_hehongyao__ch07_base.prepared.json`。
