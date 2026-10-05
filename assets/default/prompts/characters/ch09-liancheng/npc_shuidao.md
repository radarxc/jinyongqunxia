---
asset_id: por_npc_shuidao__ch09_prime_pursuit_base
subject_id: npc_shuidao
name: 水岱
book: ch09_liancheng
gender: male
age_variant: prime
tier: A
output: assets/default/character/male/ch09/por_npc_shuidao__ch09_prime_pursuit_base.png
manifest: assets/default/character/male/ch09/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/liancheng/shuidao_2004_guojun_baidu_20261002.png
  use: 第一输入为2004版郭军饰水岱本人身份参考；独审REFERENCE_PASS_CONTEXTUAL_EDITION。只沿可见脸部身份，不继承倾头侧转、长发、红金衣装或剧照背景；无集数及腿部阶段图像证据，服从正式role双腿完好追击时期。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二输入为imagegen真实派生的内部纯水墨背景（internal_derived_reference_not_approved，非原用户图、非approved角色资产）；只取暖浅灰底、极浅远山、薄雾与留白，墨纹不得侵入人物和衣料。
status: ready
realism_revision: user_identity_pose_20261001
---

# 水岱 · 人物写实修正

## 人物与阶段

- subject_id：npc_shuidao
- book：ch09_liancheng
- gender：male
- age_variant：prime

## 本轮人物写实规范

2004郭军饰水岱本人第1、无人纯背景第2；中年水笙之父、南四奇，追敌救女且双腿完好，清初辫发便帽、普通直剑全入鞘。正面头直中性下巴，完整不透明写实人物，1张原生2:3 candidate，contextual版次限制保留，待非作者全文独审。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_shuidao__ch09_prime_pursuit_base/prompt-cbc085949c9e4fe2f40ceb97eb3e75808c58358375436e785e449338ce2e0a67.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia character illustration of 水岱 / npc_shuidao from Lian Cheng Jue. 第一图为2004王新民版《连城诀》郭军饰水岱的本人身份参考，只承接实际可见的面部骨相与辨识关系。版次由2004剧演员页、同角色条目及同期新浪郭军饰水岱文字形成上下文配对，图片自身没有单独2004/集数caption；不得冒称官方原始剧照或已核具体追敌集数。以第一图的可见眉眼、鼻口、颧颌与须髭辨识为优先，不用旧原创方脸文字另换脸，不借男基线或其他角色脸。第二图仅为真实imagegen派生的无人物纯背景，不提供人物身份。只绘一张candidate。

身份与阶段：水笙之父、南四奇之一；取赶赴雪谷救女、尚未被血刀斩断双腿的追击阶段。年龄与体貌：中年男子；高而挺拔、腰背紧实，鬓角少量灰发，双腿完整、未受雪谷重伤。中年水笙之父，身材高挺、腰背紧实；双腿双足完整且未受雪谷重伤，不能误画成重伤改命后的立即痊愈。名录铃剑双侠称谓归属待考，此图不因此添加铃索、马铃。 项目清初服饰语汇为原创时代图层，小说确切纪年与外貌细节未经本次纸本终校。

本人面容辨识锚点：沿第一图郭军饰水岱的可见眉骨、眼距与眼形、鼻梁鼻翼、唇口、颧颊与下颌关系，保留中年父亲的辨识度与适龄纹理。成图转为正面、头颈竖直、双眼水平、下巴中性、嘴自然闭合，救女心切而克制；不继承参考倾头侧转。须髭修整但保留本人可见嘴颏结构，鬓角少量灰发依目标role表现。来源仅头肩像，不据此推断腿部状态；本图双腿完整由正式role与项目追击阶段决定。发式和服装按清初项目时代另绘，不复制参考长发、束发顶饰或红金衣装。

服制与发式：深青右衽长袍、灰白内领、窄袖与靛色腰带，厚长裤和黑软靴，简洁行旅保暖层；清初前额剃发、灰黑后辫收拢垂背，素黑便帽可露出辫根，不戴道冠。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；按本人左右判断，不水平镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，简朴不等于破损；衣边平整有收边，不复制色卡人物的破衣。

姿态与器物：正面朝向，脊背挺直、肩颈平衡、头颈竖直、双眼水平向前，下巴中性；两只完整双足稳稳落地，不侧身俯冲。只有一柄普通中式直身长剑，整剑完整收入青黑直长鞘，不露刃。剑柄、小横剑格、鞘口与鞘尾同轴且笔直，鞘足长可容剑身。本人左侧腰带以短挂绳实挂剑鞘，左手在可见的鞘口轻扶，鞘置于衣摆轮廓之外近竖直朝下、鞘尾不触地。右手略离腰侧自然开放，指节清楚，作克制接应之意；两手完整可见，不伸向镜头。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一输入为2004版郭军饰水岱本人身份参考；独审REFERENCE_PASS_CONTEXTUAL_EDITION。只沿可见脸部身份，不继承倾头侧转、长发、红金衣装或剧照背景；无集数及腿部阶段图像证据，服从正式role双腿完好追击时期。 第二输入为imagegen真实派生的内部纯水墨背景（internal_derived_reference_not_approved，非原用户图、非approved角色资产）；只取暖浅灰底、极浅远山、薄雾与留白，墨纹不得侵入人物和衣料。 原source JSON保留提交时pending快照，后出独立审计以精确source/image SHA通过有限本人身份参考；不把reference PASS当作本角色图或D/F已approved。

背景与交付：第二图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。本次仅一张真实候选；输出仍为candidate，待用户最终审核，不自动approved。

事实与原创边界：水笙之父、南四奇、中年、追敌救女且双腿尚完整来自正式role和项目catalog/story/chapter；2004郭军本人可见脸部来自第一图及contextual配对证据，不再使用旧原创方脸锚。具体配色、清初便帽与辫发整理、普通直剑与青黑鞘细部及正面接应手势为项目角色稿和本次美术选择；原著确切纪年与须发衣饰未作三联/广州修订版纸本终校。名录铃剑双侠称谓仍待考，不实体化马铃、铃索或冷月神兵。

完整排除项：不要把水岱画成水笙的年轻表兄、少女、清宫武官或衰老白须道人；不要断腿、假肢、拐杖、轮椅、血伤、跪伏或奇迹痊愈场面。不要因可疑称谓加铃索、马铃；不要巨刀、第二柄剑、月轮剑气或另造冷月剑铭文。不要弯鞘、短鞘、出鞘剑刃或悬空挂绳。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、现代演员对照照片或台标。 不要将参考的长发、红金服装、倾头侧转移入目标；不要用旧原创方脸锚覆盖本人辨识。

FINAL POSE CHECK: FRONT-FACING 水岱 / npc_shuidao. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Use reference 1 for visible own facial identity only; preserve target middle age, healthy complete legs and correct sheathed sword. Never inherit reference pose, long hair, costume or background into the character.
```

## 排除项

不要把水岱画成水笙的年轻表兄、少女、清宫武官或衰老白须道人；不要断腿、假肢、拐杖、轮椅、血伤、跪伏或奇迹痊愈场面。不要因可疑称谓加铃索、马铃；不要巨刀、第二柄剑、月轮剑气或另造冷月剑铭文。不要弯鞘、短鞘、出鞘剑刃或悬空挂绳。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、现代演员对照照片或台标。 不要将参考的长发、红金服装、倾头侧转移入目标；不要用旧原创方脸锚覆盖本人辨识。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_shuidao__ch09_prime_pursuit_base.prepared.json`。
