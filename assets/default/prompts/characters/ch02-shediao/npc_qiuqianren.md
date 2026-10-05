---
asset_id: por_npc_qiuqianren__ch02_elder_tiezhang_base
subject_id: npc_qiuqianren
name: 裘千仞
book: ch02_shediao
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch02/por_npc_qiuqianren__ch02_elder_tiezhang_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/qiuqianren_1983_shijian_sina2017_candidate.jpg
  use: 第一参考仅为1983 TVB《射雕英雄传》石坚饰裘千仞本人的可见脸部结构，已实际view_image并继承独立来源审。年龄、发式、胡须整理、服装、身体、姿态、器物与时段服从本稿；不复制剧照构图、字幕或背景，不变成现代演员照片。只据明确裘千仞图注取本人的面部识别，不以双角色演员表推定另一兄弟图同身份。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二参考仅为root从用户原背景派生的无人纯背景，已实际view_image：暖浅灰纸底、极淡远山与留白，不含人物或身份；是内部派生参考而非用户原图、非approved。墨色仅在背景，不侵蚀人物衣料。
status: ready
realism_revision: user_identity_pose_20261001
---

# 裘千仞 · 人物写实修正

## 人物与阶段

- subject_id：npc_qiuqianren
- book：ch02_shediao
- gender：male
- age_variant：elder

## 本轮人物写实规范

裘千仞：1983本人面部识别第一、无人纯背景第二；铁掌帮帮主裘千仞，取铁掌峰冲突时尚未拜一灯出家的阶段，明确是本人。完整精细写实、正面头直眼平，FAST1单candidate待独审；不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_qiuqianren__ch02_elder_tiezhang_base/prompt-ab687e9f4a0b5a8c778d28d6c39d8e465b3434c40d9401d80d503125b615c594.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. Ignore every source head angle, side glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create one refined REALISTIC hand-painted Chinese wuxia character illustration. Clear individual facial identity, natural age and skin volume, readable eyes and hands, continuous anatomy, complete opaque garments, intact seams, restrained material detail, a few broad weight-bearing folds and a clean silhouette. Soft upper-left diffuse light keeps the whole person readable. Ink wash and paper texture belong ONLY to the pale background, never inside skin, hair, cloth or equipment. A newly composed illustration, not a movie screenshot, photo collage, photorealistic actor photograph, 3D model or comic.

INPUT IDENTITY AND BACKGROUND: Image 1 is this exact character’s documented 1983 TVB facial identity only. Image 2 is a person-free background only. Do not average identities or borrow any unlisted person. Target role age, stage, grooming, clothes and pose override the still. 第一参考仅为1983 TVB《射雕英雄传》石坚饰裘千仞本人的可见脸部结构，已实际view_image并继承独立来源审。年龄、发式、胡须整理、服装、身体、姿态、器物与时段服从本稿；不复制剧照构图、字幕或背景，不变成现代演员照片。只据明确裘千仞图注取本人的面部识别，不以双角色演员表推定另一兄弟图同身份。 第二参考仅为root从用户原背景派生的无人纯背景，已实际view_image：暖浅灰纸底、极淡远山与留白，不含人物或身份；是内部派生参考而非用户原图、非approved。墨色仅在背景，不侵蚀人物衣料。

CHARACTER AND STAGE: 裘千仞 / npc_qiuqianren, por_npc_qiuqianren__ch02_elder_tiezhang_base. 《射雕英雄传》ch02，铁掌帮帮主裘千仞，取铁掌峰冲突时尚未拜一灯出家的阶段，明确是本人。项目主体年代1217–1227为项目口径，本图只取当前阶段，不混神雕或其它剧版。

AGE AND BODY: 中老年男子elder，约五十至六十余岁观感是角色稿美术范围而非确岁。体态清瘦紧实、双腿轻捷、手掌厚实而正常；白须方向保留，不变佝偻枯瘦老人。

VISIBLE FACIAL IDENTITY: 本人参考可见的较宽平额头与自然横额纹、重而上挑的灰白眉弓、锐利小眼及较厚上睑、直长鼻梁和自然圆厚鼻头、清楚口周与灰白长须关系。沿这一个人的可见脸结构重新画成正面端正的中老年面貌；下颌被须遮处不伪造精确骨点，保留自然皮肤、真实年龄与冷静严峻目光，不套窄尖年轻偶像脸。参考略偏转角度不能保留，五官中线竖直、双眼水平。

CLOTHING AND HAIR: 低饱和黄褐葛布右衽短衫、灰褐长裤、完整布护腕和薄底布鞋。灰白头发束为小髻，用普通布带固定；保持俗人束发，不剃发、不穿慈恩僧衣。汉式交领为穿着者左襟压右襟。所有布料完整不透明、衣缘收束利落，不复制参考红色刺绣衣领与披散灰发。

POSE, EQUIPMENT AND STRUCTURE: 两足略一前一后但脚跟均着地，身体和头部正对观者，肩颈自然放松。两只手完全空手：右掌在腹前略翻露出自然掌形，左掌收在腰旁、手指自然舒展；皮肤连续无金属手套。普通皮肤练功纹理即可，不用铁掌令牌、蒲扇、戏法道具或法术。没有水面、浮空或水波场景。

COMPOSITION AND DELIVERY: one person, one view, full body from complete scalp/hair/hat to both shoes; both hands, entire hem and any prop endpoints comfortably inside the frame. Vertical native 2:3 PNG, target 2048×3072, accept and record actual native 2:3 dimensions truthfully. No resizing, crop or re-encoding to pretend compliance; preserve original PNG bytes and tool provenance. Opaque warm pale-grey paper background, extremely faint distant ink mountains/mist, generous empty space and a modest soft contact shadow. No narrative scene, recognizable buildings, other person, foreground vegetation or action effects. FAST1: first ONE candidate; add another only for a serious identity, structural or readability failure. Every result remains candidate pending user review, never automatically approved.

FACT BOUNDARIES: 黄葛衣、白须及体格仍按原role原著概括，三联/广州指定版逐字终校待考；本轮未新增浏览小说正文或伪造纸本页码。 来源页面与演员表只证角色/演员/剧版及同图配对，不证明原著体貌或目标剧情时点；TV图片为发布方版本，非已证广播母帧。未核细节保持待考；具体裁制、配色、静态动作与正面重绘均美术落实。

完整排除项：不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要借用其他角色面孔、现代演员生活照、未指定剧版身份、剧照构图或服装道具；只用第一图对应本人面部结构，不复制具体画作，不以画师姓名作风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要裘千丈的戏法道具、蒲扇或诈骗表情，不提前剃发穿慈恩僧衣；不要金属铁掌、发光黑掌、脚踩水面、浮空或水波场景。 不要 head tilt、Dutch angle、头歪向肩、歪斜眼线、侧脸、侧身回眸、低头藏眼或仰头。不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣摆、碎布条、过密细褶或斑驳污脸；不要年轻模板脸或磨掉正常年龄。 不要裘千丈的蒲扇、戏法道具或诈骗表情，不将双胞胎同演员的其他图片自动等同本人；不提前剃发穿慈恩僧衣，不画金属铁掌、黑色发光手、水上站立或浮空。

FINAL POSE CHECK: FRONT-FACING. Head upright and centered, forehead–nose–chin vertical, both eyes horizontally level, camera level. NO head tilt. NO Dutch angle. Preserve the specified individual face, age, stage and equipment.
```

## 排除项

不要画面文字、汉字、伪字、题款、书法、标签、印章、签名、logo或装饰水印。 不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件、现代塑料配件。 不要借用其他角色面孔、现代演员生活照、未指定剧版身份、剧照构图或服装道具；只用第一图对应本人面部结构，不复制具体画作，不以画师姓名作风格词。 不要动漫大眼、统一网红脸、偶像磨皮、丰唇滤镜、浓重眼妆、照片写真、三维模型或塑料皮肤。 不要日式服制、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻铠甲、夸张前结宽腰带、赛博或蒸汽朋克。 不要时代与族群混搭、明代网巾和官服补子、清式剃发长辫、马蹄袖、旗装、大拉翅、唐代齐胸裙、明式马面裙；汉式交领不要左衽，不要水平镜像。 不要多余人物、分身、拼贴、分格、多视图、清晰场景建筑、花枝、悬浮道具或失重衣带。 不要非设定的缺指断肢、多手多脚、多指、粘连手指、错接手腕、手物融合、兵器穿身、弯折断裂器物、短鞘或无挂点装备。 不要血腥特写、裸露、透明衣料、色情化、恶搞丑化、畸形健美肌肉、大片撕裂破衣；保留有依据的年龄、伤残与自然体型。 不要发光兵器、龙形能量、光翼、法阵、粒子光效、强烈泛光、硬舞台轮廓光；不要裁断头顶、足部、兵器或鞘端。 不要裘千丈的戏法道具、蒲扇或诈骗表情，不提前剃发穿慈恩僧衣；不要金属铁掌、发光黑掌、脚踩水面、浮空或水波场景。 不要 head tilt、Dutch angle、头歪向肩、歪斜眼线、侧脸、侧身回眸、低头藏眼或仰头。不要人物飞白、碎墨缺块、纸纹透肤透衣、撕裂衣摆、碎布条、过密细褶或斑驳污脸；不要年轻模板脸或磨掉正常年龄。 不要裘千丈的蒲扇、戏法道具或诈骗表情，不将双胞胎同演员的其他图片自动等同本人；不提前剃发穿慈恩僧衣，不画金属铁掌、黑色发光手、水上站立或浮空。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_qiuqianren__ch02_elder_tiezhang_base.prepared.json`。
