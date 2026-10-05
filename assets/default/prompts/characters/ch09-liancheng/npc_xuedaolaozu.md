---
asset_id: por_npc_xuedaolaozu__ch09_elder_snow_base
subject_id: npc_xuedaolaozu
name: 血刀老祖
book: ch09_liancheng
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch09/por_npc_xuedaolaozu__ch09_elder_snow_base.png
manifest: assets/default/character/male/ch09/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/liancheng/two-source-20261002T0713-ch03_four_gap_inventory/xuedaolaozu-sina2024.jpg
  use: 第一参考仅已核实2004版《连城诀》计春华饰血刀老祖的单人剧照，继承可辨的本人脸部身份。原图分辨率及光影只支持基本辨识，不声称精确皮肤、眼窝或下颌角已核实。当前阶段优先：老年、削瘦筋骨强韧、雪谷正式交锋且尚未力竭死亡；暗赭红厚僧袍与褐红披裹、保暖内衣遮胸肩、净头无夸张戒疤。本人右手唯一纤薄柔韧血刀朝右外侧下方，左手空着，完整站立。不要复制源图黄蓝红色偏、左侧题字、右下水印、耳环、黄色影视内衣、刀横肩后或抬臂扛刀姿势；源图的原始文字水印不处理，生成画面不仿造这些元素。原图字节保持不变，参考独审PASS不等于生产approved，也不转移批准状态。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二参考仅root从用户授权风格图派生的纯背景辅助图，已实际查看：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，没有人物或脸。它不是用户原图，也不是approved资产；只取背景，不把墨迹纸纹引入人物、头发、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 血刀老祖 · 人物写实修正

## 人物与阶段

- subject_id：npc_xuedaolaozu
- book：ch09_liancheng
- gender：male
- age_variant：elder

## 本轮人物写实规范

2004计春华版血刀老祖本人第一，无人纯背景第二；保留真实老年雪谷生前Boss阶段，不画青年、力竭死亡倒插雪地、人质或第二人物；薄柔血刀的刀尖向外下方悬离地面，不复刻源剧照厚直兵刃和抬刀。正面头直眼水平，人物完整细腻写实、仅背景水墨，先1张原生2:3 candidate，不自动approved。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_xuedaolaozu__ch09_elder_snow_base/prompt-7717593a407a4735711ab6b867dcda13f4b7e36882bee5cf2dd61d1c9b06da9a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia character illustration of 血刀老祖 / npc_xuedaolaozu from Lian Cheng Jue. Image 1 is the verified 2004 Ji Chunhua portrayal of this same character and supplies facial identity ONLY; image 2 is a derived BACKGROUND-ONLY reference with no person. Preserve this recognizable identity while the current role controls age, hair, clothing, body, stage and equipment. Do not borrow another character or a palette model face. 本轮采用已核实2004计春华版血刀老祖本人参考，不冒称原版游戏头像，不复制电视剧截图。先出一张完整独立candidate。

身份与阶段：血刀门老祖；取雪谷正式交锋、尚未力竭死亡的主Boss阶段。年龄与体貌：老年男子；瘦而筋骨强韧、颈侧纹理与骨节明显，矮身蓄势但不衰弱佝偻。真实老年男人、削瘦却筋骨强韧，颈侧纹理和手指骨节有年龄感；不是肌肉青年、也不是佝偻无法站立者。此图是雪谷正式交锋尚未力竭死亡的老祖。

本人面容辨识锚点：以第一图2004计春华版血刀老祖为唯一本人身份锚，保留光头下可见的开阔额部、眉区与眉骨投影、较窄眼裂、鼻梁鼻头体积、闭口唇线和颧颊转折的相互关系。原图强色偏与阴影下只能辨识基本结构，不臆断精确眼窝深度、耳形或细微肤色。以同一脸部身份呈现真实老年：额眼口周的适龄纹理、颈纹与筋骨感明确，不能照搬参考中较年轻的饱满紧致感；目光锐利、冷笑收敛，不额外添加浓眉、长须、獠牙或妖魔脸，不套旧稿窄长高颧削尖下颌模板。

服制与发式：藏边僧人暗赭红厚袍与褐红披裹，内层保暖长衣遮蔽身体，厚布裤和朴靴，无汉地官服补子；剃净头顶的老僧发式，不留清俗家辫、不画清宫帽、汉地道髻或夸张戒疤图案。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；僧衣和其他服制按各自结构，不镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，朴素不等于破损。

姿态与器物：主要正面站立，头颈自然竖直、双眼水平；两膝只有轻微松弛，重心稳定，不驼背低头。本人右手即画面左侧握唯一血刀eq_xuedao的短柄，手腕稳定，刀柄、小型护手、纤薄柔韧刀身完整连贯。刀身仅轻微自然弧度，刃缘沉暗红、绝不发光、绝非厚重红铁巨刃；刀尖朝本人右外下方悬离地面，和腿、袍边分离，全刀入画，不卷曲成蛇、不滴血。左手空、自然略张于身侧，手指可读。双脚朴靴着地；画中无被挟持者、无尸身或第二刀。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一参考仅已核实2004版《连城诀》计春华饰血刀老祖的单人剧照，继承可辨的本人脸部身份。原图分辨率及光影只支持基本辨识，不声称精确皮肤、眼窝或下颌角已核实。当前阶段优先：老年、削瘦筋骨强韧、雪谷正式交锋且尚未力竭死亡；暗赭红厚僧袍与褐红披裹、保暖内衣遮胸肩、净头无夸张戒疤。本人右手唯一纤薄柔韧血刀朝右外侧下方，左手空着，完整站立。不要复制源图黄蓝红色偏、左侧题字、右下水印、耳环、黄色影视内衣、刀横肩后或抬臂扛刀姿势；源图的原始文字水印不处理，生成画面不仿造这些元素。原图字节保持不变，参考独审PASS不等于生产approved，也不转移批准状态。 第二参考仅root从用户授权风格图派生的纯背景辅助图，已实际查看：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，没有人物或脸。它不是用户原图，也不是approved资产；只取背景，不把墨迹纸纹引入人物、头发、衣料和器物。

背景与交付：第二图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。仅一张独立候选，所有输出仍为candidate，待用户最终审核，不自动approved。

事实与美术边界：角色、演员与2004版次由已保存图文配对及演员表交叉核实；影视评论和改编剧情不作为原著事实。保留真实老年雪谷生前Boss阶段，不画青年、力竭死亡倒插雪地、人质或第二人物；薄柔血刀的刀尖向外下方悬离地面，不复刻源剧照厚直兵刃和抬刀。 血刀eq_xuedao的柔软锋利与唯一签名武器归属由装备及章节文档支持；纤薄、暗红刃色沿当前主稿，指定版逐字外貌与袍色仍待考。护手形制、暗赭红厚袍选款和正面站姿为美术补足；不以宗教或族群身份解释个人凶恶。 本人脸替代旧原创脸锚；精确岁数不新增。

硬约束：首尾正面、头颈竖直、双眼水平；完整negative含head tilt及Dutch angle。 本人第一参考只传2004计春华版血刀老祖脸部身份，第二仅传无人纯背景；移除非本人色卡，不借他人脸。 真实老年男人、削瘦却筋骨强韧，颈侧纹理和手指骨节有年龄感；不是肌肉青年、也不是佝偻无法站立者。此图是雪谷正式交锋尚未力竭死亡的老祖。 主要正面站立，头颈自然竖直、双眼水平；两膝只有轻微松弛，重心稳定，不驼背低头。本人右手即画面左侧握唯一血刀eq_xuedao的短柄，手腕稳定，刀柄、小型护手、纤薄柔韧刀身完整连贯。刀身仅轻微自然弧度，刃缘沉暗红、绝不发光、绝非厚重红铁巨刃；刀尖朝本人右外下方悬离地面，和腿、袍边分离，全刀入画，不卷曲成蛇、不滴血。左手空、自然略张于身侧，手指可读。双脚朴靴着地；画中无被挟持者、无尸身或第二刀。 藏边僧人暗赭红厚袍与褐红披裹，内层保暖长衣遮蔽身体，厚布裤和朴靴，无汉地官服补子；剃净头顶的老僧发式，不留清俗家辫、不画清宫帽、汉地道髻或夸张戒疤图案 仅一张candidate，原始PNG按字节保留，不自行approved。

完整排除项：不要年轻浓黑壮汉脸、其他角色脸或旧稿通用窄长削尖脸、兽相獠牙、民族刻板恐怖符号；不要俗家长辫、清宫帽、道髻、夸张戒疤。不要巨大厚重红刀、蛇形刀、发光刃、血滴、第二刀、日式圆镡；不要挟持水笙、尸身倒插雪、法术飞行、献祭或少女旁人。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、直接交付演员照片或带台标剧照。 不要复制源图黄蓝红色偏、左侧题字、右下水印、耳环、黄色影视内衣、刀横肩后或抬臂扛刀姿势；源图的原始文字水印不处理，生成画面不仿造这些元素。

FINAL POSE CHECK: FRONT-FACING 血刀老祖 / npc_xuedaolaozu. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Keep this individual face and correct age, injuries and equipment; inherit facial identity ONLY from image 1, while never inheriting its body, head lean, hair, costume or photographic color cast. Image 2 supplies background only.
```

## 排除项

不要年轻浓黑壮汉脸、其他角色脸或旧稿通用窄长削尖脸、兽相獠牙、民族刻板恐怖符号；不要俗家长辫、清宫帽、道髻、夸张戒疤。不要巨大厚重红刀、蛇形刀、发光刃、血滴、第二刀、日式圆镡；不要挟持水笙、尸身倒插雪、法术飞行、献祭或少女旁人。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、直接交付演员照片或带台标剧照。 不要复制源图黄蓝红色偏、左侧题字、右下水印、耳环、黄色影视内衣、刀横肩后或抬臂扛刀姿势；源图的原始文字水印不处理，生成画面不仿造这些元素。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_xuedaolaozu__ch09_elder_snow_base.prepared.json`。
