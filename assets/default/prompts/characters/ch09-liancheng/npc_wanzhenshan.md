---
asset_id: por_npc_wanzhenshan__ch09_prime_host_base
subject_id: npc_wanzhenshan
name: 万震山
book: ch09_liancheng
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch09/por_npc_wanzhenshan__ch09_prime_host_base.png
manifest: assets/default/character/male/ch09/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/liancheng/wanzhenshan_2004_duzhiguo_pnkds2023.jpg
  use: 第一参考仅2004版《连城诀》杜志国饰万震山的已核实单人剧照，用于本人脸部身份：保持可辨的额眉眼鼻口与颧颊关系。269×358原图只支持基本辨识，不声称精确下颌角或细皮肤已核实。当前角色的中老年阶段、清初剃发后辫与瓜皮帽、修整灰黑须髭、宽厚微丰体型、墨酱长袍及烟灰外褂、双臂完整和收剑待客姿态优先；不复制剧照侧转、高髻长侧发、浅色影视衣服或背景。原始参考未变，不转移任何approved状态。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二参考仅root从用户授权风格图派生的纯背景辅助图，已实际查看：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，没有人物或脸。它不是用户原图，也不是approved资产；只取背景，不把墨迹纸纹引入人物、头发、衣料和器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 万震山 · 人物写实修正

## 人物与阶段

- subject_id：npc_wanzhenshan
- book：ch09_liancheng
- gender：male
- age_variant：prime

## 本轮人物写实规范

2004杜志国版万震山本人脸第一，纯背景派生图第二；万府主事、生前中老年、双臂完整，剃发后辫瓜皮帽与墨酱烟灰整衣，左扶收鞘剑右掌低位待客。正面头直眼水平，完整细腻写实人物、背景水墨，仅1张原生2:3 candidate，不自动approved。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_wanzhenshan__ch09_prime_host_base/prompt-98fe265dc60e2c3af1fff00bcf92f90f5c2d93c1efac7c9f388d17d422a13a8e.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes are on a HORIZONTAL line. Keep the head centered over the torso, camera level, chin neutral and gaze straight ahead. NO head tilt, NO Dutch angle, no rolled camera and no head leaning toward either shoulder. These requirements override every reference photo or drawing pose. Keep natural facial asymmetry without tilting the head.

Create one REALISTIC Chinese wuxia character illustration of 万震山 / npc_wanzhenshan from Lian Cheng Jue. Image 1 is the verified 2004 Du Zhiguo portrayal of this same character and supplies facial identity ONLY; image 2 is a derived BACKGROUND-ONLY reference with no person. Preserve the recognizable face while the current project role controls age, hair, clothing, body, intact arms and equipment. Do not borrow another character face or a palette model. 本轮使用已核实2004杜志国版万震山本人参考，不冒称原版游戏头像，不复制电视剧画面。先出一张完整独立candidate。

身份与阶段：万家门家主、五云手；取万府主事与接待师弟阶段，尚未天宁寺断臂。年龄与体貌：中老年男子；身材宽厚、腰腹微丰，气度稳重，双臂完整。中老年万府家主，宽厚身材、腰腹微丰而不肥胖，沉稳待客，双臂双手完整；素材prime不等于年轻，也不能提前画天宁寺断臂。

本人面容辨识锚点：本人面容以第一图2004杜志国版万震山为唯一身份锚：保留较开阔额部、眉弓与略扬眉尾、成熟眼睑和双眼间距、较直鼻梁及鼻头体积、上唇髭须与闭口嘴线、颧颊转折之间可辨的关系。保持自然不对称，修整灰黑须髭露出嘴线，呈中老年万府主事的威严、克制客气和审视心机；表情收敛，不狰狞恶搞。低分辨率未清楚显示的耳后或下颌细边仅作合理绘制，不另立旧稿圆厚颊下巴或圆大鼻头模板。

服制与发式：墨酱色右衽绸长袍、烟灰对襟外褂、低对比织纹与窄腰带，深色布靴，贵重感来自料子不靠金龙刺绣；清初剃发留后辫，瓜皮小帽贴头，灰黑须髭修整，不套掌门道冠。汉式交领须穿着者左襟盖右襟、向本人右侧合拢；僧衣和其他服制按各自结构，不镜像。整片布料实在连续，领胸腿部遮蔽，鞋袜入画，朴素不等于破损。

姿态与器物：正面端正站立，肩胸舒展、头颈竖直、双眼水平，重心稳定，两脚都着地。本人左腰挂一柄普通中国直剑，完全入深漆木长鞘，短带固定腰带，剑柄小护手、鞘口与尾端完整分离衣摆。左手轻扶鞘口，右手在腰腹侧低位礼貌摊开，五指清楚，双臂完整。克制笑意不转脸，不画砌墙动作、砖或血。

人物画法：完整、美观、细腻的写实国风人物插画，皮肤具有可信而适龄的柔和体积，五官、手部、脚部清楚；头发、衣料与器物都是连续实体，边缘干净，布料厚薄、缝线与承重可信。衣服裁剪完整、整片连续，只用少量宽缓受力褶皱，不用密集噪点或破损表现真实。柔和左上漫射主光、连贯明暗，低饱和设色配自然暖肤色。允许细腻手绘笔触，但脸、手、头发、衣料和人物轮廓不得飞白、碎裂、变薄透纸或被背景墨痕侵蚀。这是新绘制的高级人物插画，不是照片、电视剧截图、拼贴或三维塑料模型。

参考边界：第一参考仅2004版《连城诀》杜志国饰万震山的已核实单人剧照，用于本人脸部身份：保持可辨的额眉眼鼻口与颧颊关系。269×358原图只支持基本辨识，不声称精确下颌角或细皮肤已核实。当前角色的中老年阶段、清初剃发后辫与瓜皮帽、修整灰黑须髭、宽厚微丰体型、墨酱长袍及烟灰外褂、双臂完整和收剑待客姿态优先；不复制剧照侧转、高髻长侧发、浅色影视衣服或背景。原始参考未变，不转移任何approved状态。 第二参考仅root从用户授权风格图派生的纯背景辅助图，已实际查看：暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白，没有人物或脸。它不是用户原图，也不是approved资产；只取背景，不把墨迹纸纹引入人物、头发、衣料和器物。

背景与交付：第二图仅提供暖浅灰不透明纸底、极浅低对比水墨远山和留白，薄雾全部留在人物之外；背景墨色及纸纹不能穿过人体、衣料、发丝或器物，不画具体宫殿或剧情陈设。脚下只有少量接触阴影。单人单视图、平视水平镜头、原生竖幅2:3、完整全身；头顶、双手、双足、发饰、衣摆、衣带和全部实际器物端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节，不插值、裁切或重新编码。仅一张独立候选，所有输出仍为candidate，待用户最终审核，不自动approved。

事实与美术边界：演员、角色与2004版次由同一卡片图注及2004新浪演员资料交叉核实；影视剧情不作为本项目原著事实来源。本人脸替代旧原创脸锚，微丰体型、墨酱烟灰配色、瓜皮帽、剑鞘及待客手势仍属项目艺术选款。名录明确中老年；prime仅素材键，不推算精确岁数。清初发式是项目时代图层的艺术处理，不复制剧照高髻。五云手只是绰号，不画云气掌影；终幕断右臂与死亡尚未发生。

硬约束：首尾正面、头颈竖直、双眼水平；完整negative含head tilt及Dutch angle。 本人第一参考只传2004杜志国版万震山脸部身份，第二仅传无人纯背景；移除非本人色卡，不借他人脸。 中老年万府家主，宽厚身材、腰腹微丰而不肥胖，沉稳待客，双臂双手完整；素材prime不等于年轻，也不能提前画天宁寺断臂。 正面端正站立，肩胸舒展、头颈竖直、双眼水平，重心稳定，两脚都着地。本人左腰挂一柄普通中国直剑，完全入深漆木长鞘，短带固定腰带，剑柄小护手、鞘口与尾端完整分离衣摆。左手轻扶鞘口，右手在腰腹侧低位礼貌摊开，五指清楚，双臂完整。克制笑意不转脸，不画砌墙动作、砖或血。 墨酱色右衽绸长袍、烟灰对襟外褂、低对比织纹与窄腰带，深色布靴，贵重感来自料子不靠金龙刺绣；清初剃发留后辫，瓜皮小帽贴头，灰黑须髭修整，不套掌门道冠 仅一张candidate，原始PNG按字节保留，不自行approved。

完整排除项：不要断右臂或任何缺臂、砌墙动作、带血砖块、终幕尸体或争宝中毒；不要五云特效、掌门道冠、金龙袍、军甲或帝王服制。不要其他角色脸或旧稿泛化圆脸模板、狰狞獠牙；不要剑出鞘、双剑或鞘尾藏进衣服。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、直接交付演员照片或带台标剧照。

FINAL POSE CHECK: FRONT-FACING 万震山 / npc_wanzhenshan. Keep forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, head and neck naturally upright over the torso, camera level and gaze forward. NO head tilt and NO Dutch angle. Keep this individual face and correct age, injuries and equipment; inherit facial identity ONLY from image 1, while never inheriting its body, head lean, hair or costume. Image 2 supplies background only.
```

## 排除项

不要断右臂或任何缺臂、砌墙动作、带血砖块、终幕尸体或争宝中毒；不要五云特效、掌门道冠、金龙袍、军甲或帝王服制。不要其他角色脸或旧稿泛化圆脸模板、狰狞獠牙；不要剑出鞘、双剑或鞘尾藏进衣服。 不要 head tilt、Dutch angle、头歪向肩、斜置额鼻下巴中线、双眼高低倾斜、倾斜镜头、单肩高耸、低头藏眼、仰头、明显侧脸、侧身回眸、抬下巴卖姿态；不要继承任何参考的倾头、转身、视线方向或摄影构图。不要统一网红锥子脸、动漫大眼、Q版、厚妆丰唇、磨皮塑料、摄影半身照、电视剧截图、3D模型或换头拼贴。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机或数码物件；不要日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻装备、仙侠冠冕、赛博或蒸汽朋克。不要晚清大拉翅、民国旗袍、中山装、近现代军装或时代族群混搭；不要水平镜像、汉式左衽或反向衣襟。不要多人、分格、多视图、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合、衣袖吞手、悬空装备、缺失挂点、头足或器物端点裁切。人物不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、白斑裂缝、碎布条、撕裂衣角、毛边、大片补丁污渍、密集噪点、斑驳模糊脸或过密褶皱；不要用雾和墨迹遮盖结构。不要裸露、透衣、性感化、血腥、恶搞、丑化、发光武器、光龙、法阵、粒子、强逆光或过度泛光。不要复杂背景、可读文字、伪字、题款、签名、印章、标签、logo或装饰水印；工具原有溯源标识和元数据必须保留。 不要共享美人模板、相同的下颌眉眼鼻唇，不要统一缩尖下巴、统一大眼或统一高鼻；不要今昔对照版式、现代对照右图、直接交付演员照片或带台标剧照。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_wanzhenshan__ch09_prime_host_base.prepared.json`。
