---
asset_id: por_npc_chenjialuo__ch12_youth_late_base
subject_id: npc_chenjialuo
name: 陈家洛
book: ch12_shujian
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch12/por_npc_chenjialuo__ch12_youth_late_base.png
manifest: assets/default/character/male/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shujian/classic1976-20261002-prep_audit/chenjialuo-1976-zhengshaoqiu-sohu.jpg
  use: 第一且唯一本人身份参考为经独立source审计通过的1976 TVB《书剑恩仇录》郑少秋饰陈家洛单人图；搜狐同td明确标陈家洛，不能因郑少秋一人三角而混成乾隆或福康安。只取可见脸部大结构、额眉眼鼻口与颧颊下颌的相对关系，不推断看不清的细纹、眼色或隐藏结构。当前角色为青年成年、玉峰悟道后京师终局前，年龄、清制剃额后辫、墨青袍、赠剑与正面站姿均以本稿为准。不要照搬源黑色团花马甲白袍、紧梳满发、微侧头、腰前手势、膝上裁切、强对比旧照片质感、人物题字或站点水印。原图字节与溯源标识完整保留；只参考面容，不复制照片。源为candidate参考，source审计通过不等于用户approved。
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 第二图为已实际查看并核SHA的root派生无人纯背景，仅取暖浅灰不透明纸底、极淡低对比远山薄雾与宽阔留白。图中没有人物脸、体型、衣饰或道具可借；水墨和纸纹只在人物轮廓外，不能侵入完整写实皮肤、头发、衣料或剑鞘。此图不是原用户图，也不是approved资产。
status: ready
realism_revision: user_identity_pose_20261001
---

# 陈家洛 · 人物写实修正

## 人物与阶段

- subject_id：npc_chenjialuo
- book：ch12_shujian
- gender：male
- age_variant：youth

## 本轮人物写实规范

已独审1976郑少秋版陈家洛本人第一、无人纯背景第二；青年后段儒雅沉静有担当，清制剃额后辫墨青袍，霍青桐所赠短剑完整入闭合双层鞘，正面头直，先1candidate。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_chenjialuo__ch12_youth_late_base/prompt-c9db756fbca63733dd04290208e1b165f66baaaa6fe2f36f395c5935792a268e.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL and both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward. Keep natural facial asymmetry without tilting the head. NO head tilt and NO Dutch angle. The current pose overrides every reference pose.

Create one REALISTIC Chinese wuxia portrait of CHEN JIALUO / 陈家洛, npc_chenjialuo. Image1 is the specifically captioned 1976 TVB Adam Cheng portrayal of CHEN JIALUO, and supplies facial identity ONLY. Do not confuse his other roles Qianlong and Fukangan. Image2 is a derived figure-free pale ink background. Apply current ch12 age, Qing haircut, clothes, gifted sword and full frontal pose; do not copy the photograph.

身份与阶段：青年成年男子，红花会总舵主，取玉峰悟道后、京师终局前的后段形象。活体、身体完整，儒雅而有担当；不提前加入飞狐中年、终局后的疲惫或其他角色身份。

年龄体貌：青年成年，文武兼具、瘦健肩背而不粗壮，体态修长自然；保留成年骨相和自然肤质，不幼童化、不浓须中年化。确岁和生卒待考，不从1976演员年龄反推人物年龄。

本人面容与神态：以第一图明确标注的1976郑少秋版陈家洛为唯一本人面部身份锚，承接可辨的较长面廓、眉额比例、浓而接近平直的眉形、自然眼裂与眼距、鼻梁鼻尖和闭口唇线的关系，以及颧颊到下颌的清楚转折。保留本人自然宽度和轻微不对称，不把旧稿长方脸机械拉窄成锥子脸，也不套萧峰粗壮宽脸。原图300×499且面部受压缩与光影影响，只认大结构，不虚构精确眼色、痣疤、皮肤细纹或被遮住的角度。重绘为当前青年成年、脸部清爽无浓须；眼神沉静温和但能承担抉择，闭唇自然，眉眼不怒目、不傻笑、不低头。

服制与发式：汉地成长的清乾隆青年便装：前额依清制剃发，后发整束成一条辫子，额面清楚，辫尾自然垂于背后；不能照搬源图满头紧梳发。墨青窄袖长袍、灰白内领、深褐窄腰带、布裤与软底靴，衣料完整不透明，领胸腹肩腿遮覆，衣边干净连续；汉式交领按本人左襟压右襟、向其右侧合拢，不水平镜像。低饱和墨青与灰白层次清楚，少量宽缓受力褶皱，瘦健身体有真实支撑，不画甲胄、官补或帝王冠服。

姿态与器物：正面端正站定，双肩自然展开、头直眼平、双足安稳着地。腰带本人左侧只悬一柄霍青桐已赠的短剑eq_huoqingtongduanjian；它是短直双刃剑，整刃完全收入适长剑鞘，双层鞘夹层闭合，无地图、蜡丸或开启机关展示。剑柄、护手、鞘口、封闭鞘尾和腰带短挂带连续可信，整个剑鞘斜向左侧下方并与腿袍分离，不伸出画外。本人左手放松轻搭鞘口外侧而不拔剑、不握刃，右手自然垂于右身侧，两手掌指及肩肘腕清楚；手势左右为本次美术选择，不声明原著定式。无另一把剑、盾、珠索、玉笛或其他武器，不以掌法光效或屠宰情节表现悟道。

人物画法：美观精细的写实国风人物插画，可信自然骨相、成年皮肤与完整手部，脸、颈、衣物和器物都有连续实体体积。柔和左上漫射主光，自然温暖肤色和低饱和墨青衣色，细腻手绘层染服务结构；不以密皱、破损或碎墨表现真实。发丝衣边清楚，衣料厚薄、重力、缝线与遮蔽关系可信。人物不摄影化、不塑料化。

背景：仅沿第二参考的暖浅灰纸底、极淡低对比水墨远山与薄雾、宽阔留白，脚下少量接触阴影；背景墨迹及纸纹止于人物轮廓外，不透入脸手衣物剑鞘。没有具体剧情场地、亭阁宫殿或文字。

参考边界：第一且唯一本人身份参考为经独立source审计通过的1976 TVB《书剑恩仇录》郑少秋饰陈家洛单人图；搜狐同td明确标陈家洛，不能因郑少秋一人三角而混成乾隆或福康安。只取可见脸部大结构、额眉眼鼻口与颧颊下颌的相对关系，不推断看不清的细纹、眼色或隐藏结构。当前角色为青年成年、玉峰悟道后京师终局前，年龄、清制剃额后辫、墨青袍、赠剑与正面站姿均以本稿为准。不要照搬源黑色团花马甲白袍、紧梳满发、微侧头、腰前手势、膝上裁切、强对比旧照片质感、人物题字或站点水印。原图字节与溯源标识完整保留；只参考面容，不复制照片。源为candidate参考，source审计通过不等于用户approved。 第二图为已实际查看并核SHA的root派生无人纯背景，仅取暖浅灰不透明纸底、极淡低对比远山薄雾与宽阔留白。图中没有人物脸、体型、衣饰或道具可借；水墨和纸纹只在人物轮廓外，不能侵入完整写实皮肤、头发、衣料或剑鞘。此图不是原用户图，也不是approved资产。

事实与美术边界：主体为本地项目清乾隆1753–1759期中的当前后段，当前年龄/阶段/器物按正式主稿与catalog/story/chapter。玉峰悟道具体地点、先后、确岁、生卒和赠剑最终流转仍待指定版本核，不依据电视剧剧情补证。eq_huoqingtongduanjian与双层剑鞘在装备表已有，赠剑已发生、整剑入鞘且夹层闭合依此角色阶段；不新增专属道具ID。1976来源只解决本人脸的大结构；衣色、裁制、发型具体落实、手势与静立均为美术补足。既有角色正文包含旧色卡/禁止演员脸/精确占高等历史指示；本轮按经典影视身份增补和FAST，以本完整design为实际输入，这些旧条件不再执行。

交付：单人单视图、水平平视镜头、原生竖幅2:3，完整全身自头顶到双足及剑鞘尾端入画，四周自然留净空。青年自然比例，不用固定头身或88–92%占高强拉身体。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并实测登记；保存原始PNG字节与溯源信息，不裁切、插值、旋转、修复或重新编码。先1张独立candidate；基本清晰、主要正面、头颈端正和身份可辨即交保存，仅严重身份错误、重大结构问题或不可读才补图，细手指、微装备、轻微角度只记问题，不机械追加。所有输出仍candidate待用户最终审核，不自动approved。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、低头藏眼、仰头、回眸、歪斜镜头；不继承参考的微侧头、腰前姿势和膝上裁切。不要把陈家洛画成乾隆、福康安或仅凭郑少秋演员名混三角色，不借萧峰、其他游戏人物或其他演员脸。不要少年童子、飞狐中年脸、络腮浓须、粗豪壮汉、帝王、道士、统一网红锥子脸、夸张大眼丰唇、浓妆磨皮、Q版、3D塑料、摄影截图或换头拼贴。不要源图黑团花马甲白袍、滿头束发、清前顶髻、道冠、龙袍朝珠、官补、晚清大拉翅、现代军装或跨时代衣装；不要左衽、镜像衣襟、和服前结宽腰带、圆盘镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要拔出剑刃、打开双层剑鞘、地图或蜡丸可见、早期剑盾珠索混装、屠龙刀、玉笛、第二武器、短鞘容不下刃、错接柄鞘、悬空装备或无挂点剑带。不要多人物、多视图、特写框、多肢多指、粘连手指、错接手腕、衣袖吞手、无据伤残、手物融合、断裂剑鞘、裁断头脚或器物端点。不要人物碎墨、飞白缺块、纸纹透肤透衣、破衣碎布、衣角撕裂、墨斑侵蚀、密集噪点或过密碎褶；人物皮肤、头发、衣料与器物完整连续。不要血腥、屠宰现场、裸露、透衣、色情化、恶搞、发光兵器、掌法光效、太极阵、光龙、强逆光或过度泛光。不要具体剧情场景、玉峰洞文、皇宫、清晰建筑、拥挤陈设或额外人物；允许极淡背景水墨远山和留白。不要画面文字、伪字、人物名题字、签名、印章、logo或新装饰水印；原参考与工具已有溯源信息保持不动，不移除不伪造。

FINAL POSE CHECK: FRONT-FACING adult youthful CHEN JIALUO, head and neck UPRIGHT, forehead–nose–chin VERTICAL and both eyes HORIZONTALLY LEVEL, level camera, NO head tilt or Dutch angle. Calm responsible scholar-leader, complete opaque Qing clothing, ONE fully sheathed gifted short sword, two visible relaxed hands. Preserve only his own identity from image1; image2 supplies background only.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、低头藏眼、仰头、回眸、歪斜镜头；不继承参考的微侧头、腰前姿势和膝上裁切。不要把陈家洛画成乾隆、福康安或仅凭郑少秋演员名混三角色，不借萧峰、其他游戏人物或其他演员脸。不要少年童子、飞狐中年脸、络腮浓须、粗豪壮汉、帝王、道士、统一网红锥子脸、夸张大眼丰唇、浓妆磨皮、Q版、3D塑料、摄影截图或换头拼贴。不要源图黑团花马甲白袍、滿头束发、清前顶髻、道冠、龙袍朝珠、官补、晚清大拉翅、现代军装或跨时代衣装；不要左衽、镜像衣襟、和服前结宽腰带、圆盘镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要拔出剑刃、打开双层剑鞘、地图或蜡丸可见、早期剑盾珠索混装、屠龙刀、玉笛、第二武器、短鞘容不下刃、错接柄鞘、悬空装备或无挂点剑带。不要多人物、多视图、特写框、多肢多指、粘连手指、错接手腕、衣袖吞手、无据伤残、手物融合、断裂剑鞘、裁断头脚或器物端点。不要人物碎墨、飞白缺块、纸纹透肤透衣、破衣碎布、衣角撕裂、墨斑侵蚀、密集噪点或过密碎褶；人物皮肤、头发、衣料与器物完整连续。不要血腥、屠宰现场、裸露、透衣、色情化、恶搞、发光兵器、掌法光效、太极阵、光龙、强逆光或过度泛光。不要具体剧情场景、玉峰洞文、皇宫、清晰建筑、拥挤陈设或额外人物；允许极淡背景水墨远山和留白。不要画面文字、伪字、人物名题字、签名、印章、logo或新装饰水印；原参考与工具已有溯源信息保持不动，不移除不伪造。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_chenjialuo__ch12_youth_late_base.prepared.json`。
